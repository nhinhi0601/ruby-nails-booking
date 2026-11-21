<?php
/**
 * Module 3.0 Quản lý lịch hẹn (3.1–3.4)
 * Yêu cầu: FR06, FR07, FR08; BRULE07
 *
 * - TODO Sprint 4: 3.1 xem lịch theo ngày (theo thợ / danh sách).
 * - TODO Sprint 4: 3.2 xác nhận – chỉ khi đã gán thợ (BRULE07); 3.3 hủy kèm lý do; 3.4 gán/đổi thợ không trùng giờ.
 * - TODO Sprint 4: nhân viên tạo lịch cho khách gọi điện / đến trực tiếp (Source = phone / walkin / social).
 */
if (!defined('ABSPATH')) {
    exit;
}

class RNC_Quan_Ly_Lich
{
    public static function init()
    {
        // Trang /quan-ly/: chèn shortcode [rn_quan_ly]
        add_shortcode('rn_quan_ly', function () {
            if (!is_user_logged_in()) {
                return rnc_render('dang-nhap');
            }
            if (!current_user_can('rnc_view_bookings') && !current_user_can('rnc_view_own')) {
                return '<p class="rnc-note">Tài khoản không có quyền xem lịch hẹn.</p>';
            }
            return rnc_render('quan-ly');
        });
    }
}
