<?php
/**
 * Module 1.0 Tư vấn dịch vụ (AI Chatbot)
 * Yêu cầu: FR10, FR11, FR17; BRULE04
 *
 * - TODO Sprint 5: gửi câu hỏi + bảng dịch vụ (SERVICE) tới dịch vụ AI, chỉ trả lời trong phạm vi bảng giá (BRULE04).
 * - TODO Sprint 5: câu hỏi ngoài phạm vi -> hướng dẫn liên hệ nhân viên (FR11).
 */
if (!defined('ABSPATH')) {
    exit;
}

class RNC_Tu_Van
{
    public static function init()
    {
        // Khung chatbot hiện ở mọi trang công khai (Sprint 5 nối với dịch vụ AI).
        add_action('wp_footer', function () {
            if (!is_admin()) {
                echo rnc_render('chatbot');
            }
        });
    }
}
