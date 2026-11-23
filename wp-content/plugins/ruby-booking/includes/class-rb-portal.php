<?php
/**
 * Trang quản lý nội bộ /quan-ly/ – ứng dụng riêng cho Chủ tiệm, Lễ tân, Kỹ thuật viên.
 * Hiển thị độc lập (không dùng header/footer của theme), không bị cache, không index.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Portal {

	const OPTION = 'rb_portal_page_id';

	public static function init() {
		add_shortcode( 'ruby_portal', array( __CLASS__, 'shortcode_fallback' ) );
		add_filter( 'template_include', array( __CLASS__, 'template' ), 99 );
		add_filter( 'wp_robots', array( __CLASS__, 'robots' ) );
		add_filter( 'display_post_states', array( __CLASS__, 'post_state' ), 10, 2 );
		add_action( 'rest_api_init', function () {
			register_rest_route( RB_REST::NS, '/manifest', array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'manifest' ),
				'permission_callback' => '__return_true',
			) );
		} );
	}

	/** Web app manifest so staff can "Add to Home screen" and open /quan-ly/ like an app. */
	public static function manifest() {
		$url = self::url();
		$res = new WP_REST_Response( array(
			'name'             => 'Ruby – Quản lý lịch hẹn',
			'short_name'       => 'Ruby Quản lý',
			'start_url'        => $url,
			'scope'            => $url,
			'display'          => 'standalone',
			'background_color' => '#FAF6F7',
			'theme_color'      => '#6E1631',
			'lang'             => 'vi',
			'icons'            => array(
				array( 'src' => RB_URL . 'assets/icons/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png' ),
				array( 'src' => RB_URL . 'assets/icons/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any maskable' ),
			),
		) );
		$res->header( 'Content-Type', 'application/manifest+json; charset=utf-8' );
		return $res;
	}

	public static function page_id() {
		$id = (int) get_option( self::OPTION );
		if ( $id && 'page' === get_post_type( $id ) && 'trash' !== get_post_status( $id ) ) {
			return $id;
		}
		return 0;
	}

	public static function url() {
		$id = self::page_id();
		return $id ? get_permalink( $id ) : home_url( '/quan-ly/' );
	}

	/** Create the /quan-ly/ page once (or adopt an existing one that holds the shortcode). */
	public static function ensure_page() {
		if ( self::page_id() ) {
			return;
		}
		$existing = get_page_by_path( 'quan-ly' );
		if ( $existing && false !== strpos( (string) $existing->post_content, '[ruby_portal' ) ) {
			update_option( self::OPTION, (int) $existing->ID );
			return;
		}
		$id = wp_insert_post( array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Quản lý lịch hẹn',
			'post_name'    => $existing ? 'quan-ly-lich-hen' : 'quan-ly',
			'post_content' => '<!-- wp:shortcode -->[ruby_portal]<!-- /wp:shortcode -->',
			'comment_status' => 'closed',
		) );
		if ( $id && ! is_wp_error( $id ) ) {
			update_option( self::OPTION, (int) $id );
		}
	}

	private static function is_portal() {
		$id = self::page_id();
		return $id && is_page( $id );
	}

	public static function robots( $robots ) {
		if ( self::is_portal() ) {
			$robots['noindex']  = true;
			$robots['nofollow'] = true;
		}
		return $robots;
	}

	public static function post_state( $states, $post ) {
		if ( (int) $post->ID === self::page_id() ) {
			$states['rb_portal'] = 'Trang quản lý lịch hẹn';
		}
		return $states;
	}

	public static function template( $template ) {
		if ( ! self::is_portal() ) {
			return $template;
		}
		if ( ! defined( 'DONOTCACHEPAGE' ) ) {
			define( 'DONOTCACHEPAGE', true );
		}
		nocache_headers();
		header( 'X-LiteSpeed-Cache-Control: no-cache' );
		header( 'X-Frame-Options: SAMEORIGIN' );
		return RB_DIR . 'includes/portal-template.php';
	}

	/** If the shortcode ends up somewhere else, just point to the portal. */
	public static function shortcode_fallback() {
		return '<p><a href="' . esc_url( self::url() ) . '">Mở trang quản lý lịch hẹn</a></p>';
	}

	/** Data the portal app needs at start-up. */
	public static function boot_data() {
		$user  = wp_get_current_user();
		$role  = RB_Roles::user_role( $user );
		$staff = RB_Roles::staff_for_user( $user->ID );
		$set   = rb_settings();
		return array(
			'api'      => esc_url_raw( rest_url( RB_REST::NS . '/admin' ) ),
			'nonce'    => wp_create_nonce( 'wp_rest' ),
			'logout'   => wp_logout_url( self::url() ),
			'wpAdmin'  => current_user_can( 'manage_options' ) ? admin_url() : '',
			'home'     => home_url( '/' ),
			'account'  => home_url( '/tai-khoan/' ),
			'booking'  => home_url( '/dat-lich/' ),
			'notifyAudio' => RB_Notify::audio_url(),
			'me'       => array(
				'id'        => $user->ID,
				'name'      => $user->display_name,
				'role'      => $role,
				'roleLabel' => RB_Roles::role_label( $role ),
				'staffId'   => $staff ? $staff['id'] : 0,
				'can'       => array(
					'manage'  => current_user_can( 'rb_manage' ),
					'reports' => current_user_can( 'rb_reports' ),
					'owner'   => current_user_can( 'rb_owner' ),
				),
			),
			'services' => array_map( function ( $s ) {
				return array( 'id' => $s['id'], 'name' => $s['name'], 'category' => $s['category'], 'price' => $s['price'], 'duration' => $s['duration'], 'active' => $s['active'] );
			}, RB_DB::get_services( false ) ),
			'staff'    => array_map( function ( $s ) {
				return array( 'id' => $s['id'], 'name' => $s['name'], 'title' => $s['title'], 'photo' => $s['photo'], 'service_ids' => $s['service_ids'], 'active' => $s['active'], 'user_id' => $s['user_id'] );
			}, RB_DB::get_staff_list( false ) ),
			'statuses' => rb_status_labels(),
			'sources'  => rb_source_labels(),
			'settings' => array(
				'open'      => $set['open_time'],
				'close'     => $set['close_time'],
				'step'      => (int) $set['slot_step'],
				'shopName'  => wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
			),
			'today'    => ( new DateTimeImmutable( 'now', wp_timezone() ) )->format( 'Y-m-d' ),
		);
	}
}
