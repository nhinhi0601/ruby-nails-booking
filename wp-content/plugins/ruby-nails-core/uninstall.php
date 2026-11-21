<?php
// Gỡ plugin: KHÔNG xóa bảng dữ liệu để tránh mất lịch hẹn. Chỉ xóa tùy chọn phiên bản.
if (!defined('WP_UNINSTALL_PLUGIN')) exit;
delete_option('rnc_db_version');
