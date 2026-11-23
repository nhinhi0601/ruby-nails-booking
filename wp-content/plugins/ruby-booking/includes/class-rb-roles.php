<?php
/**
 * Roles & permissions (FR12, NFR02).
 *
 * Dùng chung 3 vai trò với hệ thống tài khoản của nhóm (snippet "Ruby – Tài khoản"):
 *  ruby_chu_tiem  Chủ tiệm       rb_access + rb_manage + rb_reports + rb_owner  (toàn quyền, báo cáo, tài khoản, dịch vụ)
 *  ruby_le_tan    Lễ tân         rb_access + rb_manage                          (xác nhận, gán thợ, tạo/đổi lịch, khách hàng)
 *  ruby_ktv       Kỹ thuật viên  rb_access                                      (chỉ lịch của chính mình, bắt đầu / hoàn thành)
 * Administrator luôn có đủ quyền. Khách hàng (subscriber) không có quyền nào ở đây.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Roles {

	const VERSION = '2';

	/** Old role slugs from plugin 1.3 → the team's role slugs. */
	const LEGACY = array(
		'rb_owner'      => 'ruby_chu_tiem',
		'rb_reception'  => 'ruby_le_tan',
		'rb_technician' => 'ruby_ktv',
	);

	public static function roles() {
		return array(
			'ruby_chu_tiem' => array( 'Chủ tiệm', array( 'rb_access', 'rb_manage', 'rb_reports', 'rb_owner', 'upload_files' ) ),
			'ruby_le_tan'   => array( 'Lễ tân', array( 'rb_access', 'rb_manage' ) ),
			'ruby_ktv'      => array( 'Kỹ thuật viên', array( 'rb_access' ) ),
		);
	}

	public static function role_label( $role ) {
		$r = self::roles();
		if ( 'administrator' === $role ) {
			return 'Quản trị viên';
		}
		return isset( $r[ $role ] ) ? $r[ $role ][0] : $role;
	}

	/** Make sure the team's roles exist and carry our capabilities. Safe to run many times. */
	public static function install() {
		foreach ( self::roles() as $slug => $def ) {
			$role = get_role( $slug );
			if ( ! $role ) {
				$role = add_role( $slug, $def[0], array( 'read' => true ) );
			}
			if ( $role ) {
				$role->add_cap( 'read' );
				foreach ( $def[1] as $c ) {
					$role->add_cap( $c );
				}
			}
		}
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			foreach ( array( 'rb_access', 'rb_manage', 'rb_reports', 'rb_owner' ) as $c ) {
				$admin->add_cap( $c );
			}
		}
		// Move anyone still on the 1.3 roles to the matching team role, then drop the old roles.
		foreach ( self::LEGACY as $old => $new ) {
			foreach ( get_users( array( 'role' => $old, 'fields' => 'all' ) ) as $u ) {
				$u->add_role( $new );
				$u->remove_role( $old );
			}
			remove_role( $old );
		}
		update_option( 'rb_roles_version', self::VERSION );
	}

	public static function init() {
		add_filter( 'login_redirect', array( __CLASS__, 'login_redirect' ), 20, 3 );
		add_action( 'admin_init', array( __CLASS__, 'keep_out_of_wp_admin' ) );
		add_filter( 'show_admin_bar', array( __CLASS__, 'admin_bar' ) );
	}

	/** Primary booking role of a user (admin > owner > reception > technician). */
	public static function user_role( $user = null ) {
		$user = $user ? $user : wp_get_current_user();
		if ( ! $user || ! $user->exists() ) {
			return '';
		}
		if ( in_array( 'administrator', (array) $user->roles, true ) ) {
			return 'administrator';
		}
		foreach ( array_keys( self::roles() ) as $r ) {
			if ( in_array( $r, (array) $user->roles, true ) ) {
				return $r;
			}
		}
		return '';
	}

	/** The technician record linked to a WordPress user, or null. */
	public static function staff_for_user( $user_id ) {
		global $wpdb;
		if ( ! $user_id ) {
			return null;
		}
		$t   = RB_DB::table( 'staff' );
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE user_id = %d", $user_id ), ARRAY_A );
		return $row ? RB_DB::cast_staff( $row ) : null;
	}

	public static function login_redirect( $redirect_to, $requested, $user ) {
		if ( $user instanceof WP_User && ! $user->has_cap( 'manage_options' ) && $user->has_cap( 'rb_access' ) ) {
			return RB_Portal::url();
		}
		return $redirect_to;
	}

	/** Nhân viên dùng trang /quan-ly/, không vào wp-admin (chủ tiệm quản lý dịch vụ ngay trong /quan-ly/). */
	public static function keep_out_of_wp_admin() {
		if ( wp_doing_ajax() || ( defined( 'DOING_CRON' ) && DOING_CRON ) || current_user_can( 'edit_posts' ) ) {
			return;
		}
		$script = isset( $_SERVER['SCRIPT_NAME'] ) ? basename( sanitize_text_field( wp_unslash( $_SERVER['SCRIPT_NAME'] ) ) ) : '';
		if ( in_array( $script, array( 'admin-post.php', 'async-upload.php' ), true ) ) {
			return;
		}
		if ( current_user_can( 'rb_access' ) ) {
			wp_safe_redirect( RB_Portal::url() );
			exit;
		}
	}

	public static function admin_bar( $show ) {
		if ( current_user_can( 'rb_access' ) && ! current_user_can( 'edit_posts' ) ) {
			return false;
		}
		return $show;
	}
}
