<?php if (!defined('ABSPATH')) exit; $u = wp_get_current_user(); ?>
<div class="rnc-box">
  <h3>Lịch hẹn</h3>
  <p>Xin chào <strong><?php echo esc_html($u->display_name); ?></strong>.</p>
  <ul class="rnc-menu">
    <li>Lịch hẹn (3.1) – Sprint 4</li>
    <li>Chờ xác nhận, gán thợ (3.2–3.4) – Sprint 4</li>
    <li>Tạo lịch – Sprint 4</li>
    <li>Khách hàng (FR15) – Sprint 4</li>
    <?php if (current_user_can('rnc_view_reports')) : ?><li>Báo cáo (FR13) – Sprint 6</li><?php endif; ?>
    <?php if (current_user_can('rnc_manage_catalog')) : ?><li>Dịch vụ &amp; giá, Kỹ thuật viên (FR17, FR18) – Sprint 4–5</li><?php endif; ?>
    <?php if (current_user_can('rnc_manage_staff')) : ?><li>Tài khoản nhân viên (FR12) – Sprint 4</li><?php endif; ?>
  </ul>
</div>
