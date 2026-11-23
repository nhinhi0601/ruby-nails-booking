<?php
/**
 * Loa thông báo lịch hẹn mới trên mọi trang cho nhân viên.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Notify {

	const AUDIO = 'rb_notify_audio';

	public static function init() {
		add_action( 'wp_footer', array( __CLASS__, 'print_front' ), 50 );
		add_action( 'admin_footer', array( __CLASS__, 'print_admin' ), 50 );
		add_action( 'wp_ajax_rb_nonce', array( __CLASS__, 'ajax_nonce' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
	}

	public static function enabled() {
		return is_user_logged_in() && current_user_can( 'rb_access' );
	}

	public static function audio_url() {
		$id = (int) get_option( self::AUDIO, 0 );
		return $id ? (string) wp_get_attachment_url( $id ) : '';
	}

	public static function config( $bell = true ) {
		$icon = get_site_icon_url( 192 );
		return array(
			'api'       => esc_url_raw( rest_url( RB_REST::NS . '/admin' ) ),
			'nonce'     => wp_create_nonce( 'wp_rest' ),
			'ajax'      => admin_url( 'admin-ajax.php' ),
			'portal'    => RB_Portal::url(),
			'audio'     => self::audio_url(),
			'shop'      => wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
			'icon'      => $icon ? $icon : RB_URL . 'assets/icons/icon-192.png',
			'canManage' => current_user_can( 'rb_manage' ),
			'me'        => get_current_user_id(),
			'bell'      => $bell,
			'interval'  => 5000,
		);
	}

	/** Thẻ script dùng chung (trang /quan-ly/ gọi trực tiếp vì không có wp_footer). */
	public static function tags( $bell = true ) {
		return '<script>window.RBN = ' . wp_json_encode( self::config( $bell ) ) . ';</script>' .
			'<script src="' . esc_url( RB_URL . 'assets/notify.js?ver=' . RB_VERSION ) . '"></script>';
	}

	public static function print_front() {
		if ( self::enabled() ) {
			echo self::tags( true ); // phpcs:ignore WordPress.Security.EscapeOutput
		}
	}

	public static function print_admin() {
		if ( self::enabled() ) {
			echo self::tags( true ); // phpcs:ignore WordPress.Security.EscapeOutput
		}
	}

	/** Làm mới mã bảo mật khi trang mở quá lâu (quầy lễ tân để trang cả ngày). */
	public static function ajax_nonce() {
		if ( ! self::enabled() ) {
			wp_send_json( array( 'nonce' => '' ), 403 );
		}
		nocache_headers();
		wp_send_json( array( 'nonce' => wp_create_nonce( 'wp_rest' ) ) );
	}

	public static function routes() {
		register_rest_route( RB_REST::NS, '/admin/notify-audio', array(
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'save_audio' ),
				'permission_callback' => function () { return current_user_can( 'rb_owner' ); },
			),
			array(
				'methods'             => 'DELETE',
				'callback'            => array( __CLASS__, 'delete_audio' ),
				'permission_callback' => function () { return current_user_can( 'rb_owner' ); },
			),
		) );
	}

	public static function save_audio( WP_REST_Request $req ) {
		$files = $req->get_file_params();
		if ( empty( $files['file'] ) || UPLOAD_ERR_OK !== (int) $files['file']['error'] ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => 'Chưa có file âm thanh hoặc tải lên thất bại.' ), 400 );
		}
		$f = $files['file'];
		if ( $f['size'] > 3 * MB_IN_BYTES ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => 'File âm thanh tối đa 3MB (khoảng 10 giây là đủ).' ), 400 );
		}
		$name = sanitize_file_name( $f['name'] );
		$ext  = strtolower( pathinfo( $name, PATHINFO_EXTENSION ) );
		$map  = array( 'mp3' => 'audio/mpeg', 'm4a' => 'audio/mp4', 'wav' => 'audio/wav', 'ogg' => 'audio/ogg', 'oga' => 'audio/ogg', 'webm' => 'audio/webm' );
		if ( ! isset( $map[ $ext ] ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => 'Chỉ nhận file MP3, M4A, WAV, OGG hoặc WEBM.' ), 400 );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$f['name']      = 'loa-thong-bao-' . gmdate( 'YmdHis' ) . '.' . $ext;
		$_FILES['file'] = $f;
		$mimes          = array( $ext => $map[ $ext ] );
		$id             = media_handle_upload( 'file', 0, array( 'post_title' => 'Âm thanh loa thông báo' ), array( 'test_form' => false, 'test_type' => false, 'mimes' => $mimes ) );
		if ( is_wp_error( $id ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => $id->get_error_message() ), 400 );
		}
		$old = (int) get_option( self::AUDIO, 0 );
		update_option( self::AUDIO, (int) $id, false );
		if ( $old && $old !== (int) $id ) {
			wp_delete_attachment( $old, true );
		}
		RB_DB::log( 0, 'notify_audio', 'Đổi âm thanh loa thông báo' );
		return new WP_REST_Response( array( 'ok' => true, 'url' => self::audio_url() ), 200 );
	}

	public static function delete_audio() {
		$old = (int) get_option( self::AUDIO, 0 );
		if ( $old ) {
			wp_delete_attachment( $old, true );
		}
		delete_option( self::AUDIO );
		return new WP_REST_Response( array( 'ok' => true, 'url' => '' ), 200 );
	}
}
