<?php
/**
 * REST API: /wp-json/ruby-nails/v1/...
 * Sprint 3 chỉ có 2 route để kiểm tra "skeleton chạy được"; các route còn lại làm ở Sprint 4–6.
 */
if (!defined('ABSPATH')) {
    exit;
}

class RNC_Rest
{
    const NS = 'ruby-nails/v1';

    public static function register_routes()
    {
        // Kiểm tra plugin + migration: trả về phiên bản CSDL và số dòng mỗi bảng.
        register_rest_route(self::NS, '/ping', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'ping'],
            'permission_callback' => '__return_true',
        ]);

        // FR01: danh sách dịch vụ đang áp dụng (đọc bảng SERVICE).
        register_rest_route(self::NS, '/services', [
            'methods'             => 'GET',
            'callback'            => [__CLASS__, 'services'],
            'permission_callback' => '__return_true',
        ]);

        // Làm tiếp ở Sprint 4: /slots (FR03), /bookings (FR01–FR05), /bookings/{id}/confirm (FR07)...
    }

    public static function ping()
    {
        global $wpdb;
        $counts = [];
        foreach (RNC_Migrator::tables() as $key => $table) {
            $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table)) === $table;
            $counts[$key] = $exists ? (int) $wpdb->get_var("SELECT COUNT(*) FROM $table") : 'missing';
        }
        return [
            'status'     => 'ok',
            'plugin'     => RNC_VERSION,
            'db_version' => get_option(RNC_Migrator::OPTION),
            'tables'     => $counts,
        ];
    }

    public static function services()
    {
        global $wpdb;
        $t = RNC_Migrator::tables()['service'];
        return $wpdb->get_results(
            "SELECT Service_ID, Service_Name, Category, Price, Duration_Min
             FROM $t WHERE Is_Active = 1 ORDER BY Sort_Order, Service_ID",
            ARRAY_A
        );
    }
}
