<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Shortcodes {

	public static function init() {
		add_shortcode( 'ruby_booking', array( __CLASS__, 'booking' ) );
		add_shortcode( 'ruby_booking_status', array( __CLASS__, 'status' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register' ) );
	}

	public static function register() {
		wp_register_style( 'rb-fonts', 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap', array(), null );
		wp_register_style( 'rb-booking', RB_URL . 'assets/booking.css', array( 'rb-fonts' ), RB_VERSION );
		wp_register_script( 'rb-booking', RB_URL . 'assets/booking.js', array(), RB_VERSION, true );
	}

	private static function enqueue( $view ) {
		if ( ! wp_style_is( 'rb-booking', 'registered' ) ) {
			self::register();
		}
		wp_enqueue_style( 'rb-booking' );
		wp_enqueue_script( 'rb-booking' );

		static $done = false;
		if ( $done ) {
			return;
		}
		$done = true;
		wp_localize_script( 'rb-booking', 'RB_DATA', self::data() );
	}

	/** Data object for booking.js (also printed directly by the /quan-ly/ customer view). */
	public static function data() {
		$set   = rb_settings();
		$tz    = wp_timezone();
		$today = new DateTimeImmutable( 'today', $tz );
		$days  = array();
		for ( $i = 0; $i < (int) $set['days_ahead']; $i++ ) {
			$d      = $today->modify( "+$i day" );
			$days[] = array(
				'date' => $d->format( 'Y-m-d' ),
				'open' => in_array( (int) $d->format( 'w' ), array_map( 'intval', (array) $set['open_days'] ), true ),
			);
		}

		$user = null;
		if ( is_user_logged_in() && ! current_user_can( 'rb_access' ) ) {
			$u    = wp_get_current_user();
			$user = array(
				'name'  => $u->display_name,
				'phone' => RB_REST::user_phone( $u->ID ),
				'email' => $u->user_email,
			);
		}
		return array(
			'user'       => $user,
			'nonce'      => is_user_logged_in() ? wp_create_nonce( 'wp_rest' ) : '',
			'api'        => esc_url_raw( rest_url( RB_REST::NS ) ),
			'services'   => array_map( function ( $s ) {
				unset( $s['image_id'], $s['active'], $s['sort_order'] );
				return $s;
			}, RB_DB::get_services() ),
			'staff'      => array_map( function ( $s ) {
				unset( $s['photo_id'], $s['active'], $s['sort_order'] );
				return $s;
			}, RB_DB::get_staff_list() ),
			'days'       => $days,
			'settings'   => array(
				'open'         => $set['open_time'],
				'close'        => $set['close_time'],
				'maxImages'    => (int) $set['max_images'],
				'maxImageMb'   => (int) $set['max_image_mb'],
				'policyUrl'    => $set['policy_url'],
				'statusUrl'    => $set['status_url'],
				'shopPhone'    => $set['shop_phone'],
				'shopAddress'  => $set['shop_address'],
				'cancelBefore' => (int) $set['cancel_before'],
				'daysAhead'    => (int) $set['days_ahead'],
				'openDays'     => array_map( 'intval', (array) $set['open_days'] ),
				'autoConfirm'  => (int) $set['auto_confirm'],
				'home'         => home_url( '/' ),
				'portal'       => current_user_can( 'rb_access' ) ? RB_Portal::url() : '',
				'siteName'     => wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
			),
		);
	}

	public static function booking( $atts ) {
		self::enqueue( 'booking' );
		return '<div class="rb-app" data-rb-view="booking"><noscript>Vui lòng bật JavaScript để đặt lịch.</noscript><div class="rb-loading">Đang tải…</div></div>';
	}

	public static function status( $atts ) {
		self::enqueue( 'status' );
		return '<div class="rb-app" data-rb-view="status"><noscript>Vui lòng bật JavaScript để tra cứu.</noscript><div class="rb-loading">Đang tải…</div></div>';
	}
}
