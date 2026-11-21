<?php
/**
 * Module 4.0 Gửi thông báo lịch hẹn
 * Yêu cầu: FR05, FR07, FR16
 *
 * - TODO Sprint 5: gửi email/SMS tiếp nhận (FR05) và xác nhận/hủy (FR07) trong vòng 1 phút.
 * - TODO (Could): nhắc lịch trước giờ hẹn bằng WP-Cron (FR16).
 */
if (!defined('ABSPATH')) {
    exit;
}

class RNC_Thong_Bao
{
    public static function init()
    {
        // Các module khác gọi do_action('rnc_booking_changed', $booking_id, $action) khi tạo/xác nhận/hủy lịch.
        add_action('rnc_booking_changed', [__CLASS__, 'notify'], 10, 2);
    }

    /** Sprint 3: chỉ ghi log để kiểm tra luồng; Sprint 5 thay bằng gửi email/SMS. */
    public static function notify($booking_id, $action)
    {
        error_log(sprintf('[Ruby Nails] Booking %d: %s', (int) $booking_id, sanitize_key($action)));
    }
}
