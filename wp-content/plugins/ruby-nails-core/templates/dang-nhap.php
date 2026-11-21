<?php if (!defined('ABSPATH')) exit; ?>
<div class="rnc-box">
  <h3>Hệ thống quản lý lịch hẹn</h3>
  <p class="rnc-note">Dành cho chủ tiệm, lễ tân và kỹ thuật viên. Vui lòng đăng nhập bằng tài khoản được cấp.</p>
  <?php wp_login_form(['redirect' => get_permalink()]); ?>
</div>
