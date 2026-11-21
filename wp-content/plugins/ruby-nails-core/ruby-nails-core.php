<?php
/**
 * Plugin Name: Ruby Nails Core (Skeleton)
 * Description: Khung hệ thống đặt lịch Ruby Nails & Eyelash – Nhóm 60. Gồm migration 10 bảng theo ERD, 3 vai trò, 6 module theo DFD Level 0.
 * Version:     0.1.0
 * Author:      Nhóm 60
 * Text Domain: ruby-nails-core
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('RNC_VERSION', '0.1.0');
define('RNC_FILE', __FILE__);
define('RNC_PATH', plugin_dir_path(__FILE__));
define('RNC_URL', plugin_dir_url(__FILE__));

require_once RNC_PATH . 'includes/class-migrator.php';
require_once RNC_PATH . 'includes/class-roles.php';
require_once RNC_PATH . 'includes/class-rest.php';

// 6 module ứng với 6 tiến trình Level 0 của DFD
require_once RNC_PATH . 'modules/tu-van/class-tu-van.php';             // 1.0
require_once RNC_PATH . 'modules/dat-lich/class-dat-lich.php';         // 2.0
require_once RNC_PATH . 'modules/quan-ly-lich/class-quan-ly-lich.php'; // 3.0
require_once RNC_PATH . 'modules/thong-bao/class-thong-bao.php';       // 4.0
require_once RNC_PATH . 'modules/quan-ly-du-lieu/class-quan-ly-du-lieu.php'; // 5.0
require_once RNC_PATH . 'modules/bao-cao/class-bao-cao.php';           // 6.0

/** Kích hoạt plugin: tạo bảng (migration) + tạo vai trò. */
register_activation_hook(__FILE__, function () {
    RNC_Migrator::migrate();
    RNC_Roles::register();
});

/** Tự chạy migration khi DB_VERSION trong code mới hơn bản đã cài. */
add_action('plugins_loaded', ['RNC_Migrator', 'maybe_upgrade']);

/** Đăng ký các module. */
add_action('init', function () {
    RNC_Tu_Van::init();
    RNC_Dat_Lich::init();
    RNC_Quan_Ly_Lich::init();
    RNC_Thong_Bao::init();
    RNC_Quan_Ly_Du_Lieu::init();
    RNC_Bao_Cao::init();
});

add_action('rest_api_init', ['RNC_Rest', 'register_routes']);

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('rnc', RNC_URL . 'assets/css/rnc.css', [], RNC_VERSION);
    wp_enqueue_script('rnc', RNC_URL . 'assets/js/rnc.js', [], RNC_VERSION, true);
    wp_localize_script('rnc', 'RNC', ['api' => esc_url_raw(rest_url('ruby-nails/v1/'))]);
});

/** Hiển thị một template trong thư mục templates/. */
function rnc_render($template, $data = [])
{
    ob_start();
    extract($data, EXTR_SKIP);
    include RNC_PATH . 'templates/' . $template . '.php';
    return ob_get_clean();
}
