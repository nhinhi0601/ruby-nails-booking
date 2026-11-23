<?php
/**
 * Plugin Name: Ruby Booking
 * Description: Hệ thống đặt lịch online và quản lý lịch hẹn cho Ruby Nails & Eyelash. Khách: [ruby_booking], [ruby_booking_status]. Nội bộ (Chủ tiệm / Lễ tân / Kỹ thuật viên): trang /quan-ly/ ([ruby_portal]).
 * Version: 1.6.6
 * Author: Nhóm 60
 * Text Domain: ruby-booking
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'RB_VERSION', '1.6.6' );
define( 'RB_FILE', __FILE__ );
define( 'RB_DIR', plugin_dir_path( __FILE__ ) );
define( 'RB_URL', plugin_dir_url( __FILE__ ) );

require_once RB_DIR . 'includes/class-rb-db.php';
require_once RB_DIR . 'includes/class-rb-availability.php';
require_once RB_DIR . 'includes/class-rb-mail.php';
require_once RB_DIR . 'includes/class-rb-rest.php';
require_once RB_DIR . 'includes/class-rb-shortcodes.php';
require_once RB_DIR . 'includes/class-rb-admin.php';
require_once RB_DIR . 'includes/class-rb-roles.php';
require_once RB_DIR . 'includes/class-rb-portal.php';
require_once RB_DIR . 'includes/class-rb-admin-api.php';
require_once RB_DIR . 'includes/class-rb-notify.php';
require_once RB_DIR . 'includes/class-rb-chat.php';

register_activation_hook( __FILE__, array( 'RB_DB', 'activate' ) );

// Upgrades run on init: creating the /quan-ly/ page needs permalinks, which are not ready at plugins_loaded.
add_action( 'init', array( 'RB_DB', 'maybe_upgrade' ), 5 );

add_action( 'plugins_loaded', function () {
	RB_REST::init();
	RB_Shortcodes::init();
	RB_Roles::init();
	RB_Portal::init();
	RB_Admin_API::init();
	RB_Notify::init();
	RB_Chat::init();
	if ( is_admin() ) {
		RB_Admin::init();
	}
} );

/**
 * Plugin settings with defaults.
 */
function rb_settings() {
	$defaults = array(
		'open_time'      => '08:30',
		'close_time'     => '20:00',
		'open_days'      => array( 0, 1, 2, 3, 4, 5, 6 ), // 0 = Chủ nhật.
		'slot_step'      => 30,
		'days_ahead'     => 14,
		'min_lead'       => 60,
		'cancel_before'  => 2,
		'max_images'     => 3,
		'max_image_mb'   => 5,
		'admin_email'    => get_option( 'admin_email' ),
		'shop_phone'     => '0905 123 456',
		'shop_address'   => '264 Đống Đa, Hải Châu, Đà Nẵng',
		'policy_url'     => '',
		'status_url'     => '',
		'auto_confirm'   => 0,
	);
	$saved = get_option( 'rb_settings', array() );
	return wp_parse_args( is_array( $saved ) ? $saved : array(), $defaults );
}

function rb_format_price( $amount ) {
	return number_format( (int) $amount, 0, ',', '.' ) . 'đ';
}

function rb_status_labels() {
	return array(
		'pending'     => 'Chờ xác nhận',
		'confirmed'   => 'Đã xác nhận',
		'in_progress' => 'Đang thực hiện',
		'done'        => 'Hoàn thành',
		'cancelled'   => 'Đã hủy',
		'no_show'     => 'Khách vắng mặt',
	);
}

/** Statuses that occupy a technician's time. */
function rb_busy_statuses() {
	return array( 'pending', 'confirmed', 'in_progress' );
}

function rb_source_labels() {
	return array(
		'web'    => 'Website',
		'phone'  => 'Điện thoại',
		'walkin' => 'Khách vãng lai',
		'social' => 'Facebook/Zalo',
	);
}
