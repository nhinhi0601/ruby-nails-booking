<?php
/**
 * Standalone template for /quan-ly/ (no theme header/footer).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$rb_logged = is_user_logged_in();
$rb_allowed = $rb_logged && current_user_can( 'rb_access' );
$rb_shop = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
?><!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#6E1631">
<title><?php echo $rb_allowed ? 'Quản lý lịch hẹn' : 'Lịch hẹn của tôi'; ?> – <?php echo esc_html( $rb_shop ); ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap">
<link rel="stylesheet" href="<?php echo esc_url( RB_URL . 'assets/portal.css?ver=' . RB_VERSION ); ?>">
<?php $rb_icon = get_site_icon_url( 64 ); if ( $rb_icon ) : ?><link rel="icon" href="<?php echo esc_url( $rb_icon ); ?>"><?php endif; ?>
<?php if ( $rb_allowed ) : ?><link rel="manifest" href="<?php echo esc_url( rest_url( RB_REST::NS . '/manifest' ) ); ?>">
<?php endif; ?>
<link rel="apple-touch-icon" href="<?php echo esc_url( RB_URL . 'assets/icons/icon-180.png' ); ?>">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Ruby Quản lý">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
</head>
<body class="rbp-body">
<?php if ( ! $rb_logged ) : ?>
	<main class="rbp-login">
		<div class="rbp-login-card">
			<a class="rbp-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" title="Về trang chủ"><span class="rbp-logo">R</span><div><b>RUBY</b><small>NAILS &amp; EYELASH</small></div></a>
			<h1>Hệ thống quản lý lịch hẹn</h1>
			<p class="rbp-muted">Dành cho chủ tiệm, lễ tân và kỹ thuật viên. Vui lòng đăng nhập bằng tài khoản được cấp.</p>
			<?php
			wp_login_form( array(
				'redirect'       => RB_Portal::url(),
				'label_username' => 'Tên đăng nhập hoặc email',
				'label_password' => 'Mật khẩu',
				'label_remember' => 'Ghi nhớ đăng nhập',
				'label_log_in'   => 'Đăng nhập',
				'remember'       => true,
			) );
			?>
			<p class="rbp-small"><a href="<?php echo esc_url( wp_lostpassword_url( RB_Portal::url() ) ); ?>">Quên mật khẩu?</a> · <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Về trang chủ</a></p>
		</div>
	</main>
<?php elseif ( ! $rb_allowed ) :
	$rb_u = wp_get_current_user();
	$rb_book = home_url( '/dat-lich/' );
	?>
	<div class="rbc">
		<header class="rbc-top">
			<a class="rbp-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" title="Về trang chủ"><span class="rbp-logo">R</span><div><b>RUBY</b><small>NAILS &amp; EYELASH</small></div></a>
			<nav class="rbc-nav">
				<a class="rbp-btn rbp-primary" href="<?php echo esc_url( $rb_book ); ?>">+ Đặt lịch mới</a>
				<a class="rbp-btn rbp-ghost" href="<?php echo esc_url( home_url( '/tai-khoan/' ) ); ?>">Tài khoản</a>
				<a class="rbp-btn rbp-ghost rbc-out" href="<?php echo esc_url( wp_logout_url( home_url( '/' ) ) ); ?>">Đăng xuất</a>
			</nav>
		</header>
		<main class="rbc-main">
			<p class="rbc-hi">Xin chào, <b><?php echo esc_html( $rb_u->display_name ? $rb_u->display_name : $rb_u->user_login ); ?></b></p>
			<h1>Quản lý lịch hẹn</h1>
			<div class="rb-app" data-rb-view="mine"><div class="rb-loading">Đang tải lịch hẹn…</div></div>
		</main>
	</div>
	<link rel="stylesheet" href="<?php echo esc_url( RB_URL . 'assets/booking.css?ver=' . RB_VERSION ); ?>">
	<script>var RB_DATA = <?php echo wp_json_encode( RB_Shortcodes::data() ); ?>;</script>
	<script src="<?php echo esc_url( RB_URL . 'assets/booking.js?ver=' . RB_VERSION ); ?>"></script>
<?php else : ?>
	<div id="rbp-app" class="rbp-app"><div class="rbp-boot">Đang tải hệ thống quản lý…</div></div>
	<?php echo RB_Notify::tags( false ); // phpcs:ignore ?>
	<script>window.RBP = <?php echo wp_json_encode( RB_Portal::boot_data() ); ?>;</script>
	<script src="<?php echo esc_url( RB_URL . 'assets/portal.js?ver=' . RB_VERSION ); ?>"></script>
<?php endif; ?>
</body>
</html>
