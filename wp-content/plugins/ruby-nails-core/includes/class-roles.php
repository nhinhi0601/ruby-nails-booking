<?php
/**
 * Phân quyền (FR12, NFR02): 3 vai trò nhân sự theo trang Tài khoản & phân quyền.
 */
if (!defined('ABSPATH')) {
    exit;
}

class RNC_Roles
{
    const OWNER        = 'rnc_chu_tiem';
    const RECEPTIONIST = 'rnc_le_tan';
    const TECHNICIAN   = 'rnc_ktv';

    public static function register()
    {
        add_role(self::OWNER, 'Chủ tiệm', [
            'read'               => true,
            'rnc_view_bookings'  => true,
            'rnc_edit_bookings'  => true,
            'rnc_view_customers' => true,
            'rnc_view_reports'   => true,
            'rnc_manage_catalog' => true, // dịch vụ, giá, kỹ thuật viên
            'rnc_manage_staff'   => true, // tài khoản nhân viên
        ]);
        add_role(self::RECEPTIONIST, 'Lễ tân', [
            'read'               => true,
            'rnc_view_bookings'  => true,
            'rnc_edit_bookings'  => true,
            'rnc_view_customers' => true,
        ]);
        add_role(self::TECHNICIAN, 'Kỹ thuật viên', [
            'read'              => true,
            'rnc_view_own'      => true, // chỉ xem lịch của mình
        ]);

        // Quản trị viên WordPress có toàn quyền.
        $admin = get_role('administrator');
        if ($admin) {
            foreach (['rnc_view_bookings', 'rnc_edit_bookings', 'rnc_view_customers', 'rnc_view_reports', 'rnc_manage_catalog', 'rnc_manage_staff'] as $cap) {
                $admin->add_cap($cap);
            }
        }
    }
}
