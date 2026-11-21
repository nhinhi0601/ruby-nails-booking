<?php
/**
 * Module 2.0 Đặt lịch hẹn (2.1–2.4)
 * Yêu cầu: FR01–FR04, FR09; BRULE01–BRULE03
 *
 * - TODO Sprint 4: 2.1 chọn dịch vụ (nhiều dịch vụ) và kỹ thuật viên theo STAFF_SERVICE.
 * - TODO Sprint 4: 2.2 tính khung giờ trống theo SHOP_SETTING và lịch đã có của thợ (BRULE01, BRULE02).
 * - TODO Sprint 4: 2.3 kiểm tra họ tên, SĐT, đồng ý dữ liệu (FR04, NFR05).
 * - TODO Sprint 4: 2.4 lưu CUSTOMER, BOOKING (pending), BOOKING_SERVICE, BOOKING_IMAGE, BOOKING_LOG.
 */
if (!defined('ABSPATH')) {
    exit;
}

class RNC_Dat_Lich
{
    public static function init()
    {
        // Trang /dat-lich: chèn shortcode [rn_dat_lich]
        add_shortcode('rn_dat_lich', function () {
            return rnc_render('dat-lich');
        });
        // Trang /tra-cuu-lich-hen: chèn shortcode [rn_tra_cuu]
        add_shortcode('rn_tra_cuu', function () {
            return rnc_render('tra-cuu');
        });
    }
}
