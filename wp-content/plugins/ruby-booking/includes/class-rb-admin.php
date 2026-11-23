<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Admin {

	const CAP = 'rb_owner';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'admin_post_rb_status', array( __CLASS__, 'handle_status' ) );
		add_action( 'admin_post_rb_save_service', array( __CLASS__, 'handle_service' ) );
		add_action( 'admin_post_rb_delete_service', array( __CLASS__, 'handle_delete_service' ) );
		add_action( 'admin_post_rb_save_staff', array( __CLASS__, 'handle_staff' ) );
		add_action( 'admin_post_rb_delete_staff', array( __CLASS__, 'handle_delete_staff' ) );
		add_action( 'admin_post_rb_save_settings', array( __CLASS__, 'handle_settings' ) );
	}

	public static function menu() {
		global $wpdb;
		$t       = RB_DB::table( 'bookings' );
		$pending = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $t WHERE status = 'pending'" );
		$badge   = $pending ? ' <span class="awaiting-mod">' . $pending . '</span>' : '';

		add_menu_page( 'Đặt lịch', 'Đặt lịch' . $badge, self::CAP, 'rb-bookings', array( __CLASS__, 'page_bookings' ), 'dashicons-calendar-alt', 26 );
		add_submenu_page( 'rb-bookings', 'Lịch hẹn', 'Lịch hẹn', self::CAP, 'rb-bookings', array( __CLASS__, 'page_bookings' ) );
		add_submenu_page( 'rb-bookings', 'Dịch vụ', 'Dịch vụ', self::CAP, 'rb-services', array( __CLASS__, 'page_services' ) );
		add_submenu_page( 'rb-bookings', 'Kỹ thuật viên', 'Kỹ thuật viên', self::CAP, 'rb-staff', array( __CLASS__, 'page_staff' ) );
		add_submenu_page( 'rb-bookings', 'Cài đặt', 'Cài đặt', self::CAP, 'rb-settings', array( __CLASS__, 'page_settings' ) );
	}

	public static function assets( $hook ) {
		if ( false === strpos( (string) $hook, 'rb-' ) ) {
			return;
		}
		wp_enqueue_style( 'rb-admin', RB_URL . 'assets/admin.css', array(), RB_VERSION );
		if ( false !== strpos( $hook, 'rb-staff' ) || false !== strpos( $hook, 'rb-services' ) ) {
			wp_enqueue_media();
			wp_enqueue_script( 'rb-admin', RB_URL . 'assets/admin.js', array(), RB_VERSION, true );
		}
	}

	private static function guard( $action ) {
		if ( ! current_user_can( self::CAP ) ) {
			wp_die( 'Bạn không có quyền.' );
		}
		check_admin_referer( $action );
	}

	private static function back( $page, $args = array() ) {
		wp_safe_redirect( add_query_arg( array_merge( array( 'page' => $page ), $args ), admin_url( 'admin.php' ) ) );
		exit;
	}

	private static function notice() {
		if ( empty( $_GET['rb_msg'] ) ) { // phpcs:ignore
			return;
		}
		$msgs = array(
			'saved'   => 'Đã lưu.',
			'deleted' => 'Đã xóa.',
			'status'  => 'Đã cập nhật trạng thái.',
		);
		$k = sanitize_key( wp_unslash( $_GET['rb_msg'] ) ); // phpcs:ignore
		if ( isset( $msgs[ $k ] ) ) {
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $msgs[ $k ] ) . '</p></div>';
		}
	}

	/* =========================================================
	 * Lịch hẹn
	 * ======================================================= */

	public static function page_bookings() {
		global $wpdb;
		$t      = RB_DB::table( 'bookings' );
		$labels = rb_status_labels();
		$tz     = wp_timezone();

		$status = isset( $_GET['status'] ) ? sanitize_key( wp_unslash( $_GET['status'] ) ) : ''; // phpcs:ignore
		$date   = isset( $_GET['date'] ) ? sanitize_text_field( wp_unslash( $_GET['date'] ) ) : ''; // phpcs:ignore
		$q      = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : ''; // phpcs:ignore
		$when   = isset( $_GET['when'] ) ? sanitize_key( wp_unslash( $_GET['when'] ) ) : 'upcoming'; // phpcs:ignore

		$where = array( '1=1' );
		$args  = array();
		if ( $status && isset( $labels[ $status ] ) ) {
			$where[] = 'status = %s';
			$args[]  = $status;
		}
		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ) {
			$where[] = 'start_at >= %s AND start_at <= %s';
			$args[]  = $date . ' 00:00:00';
			$args[]  = $date . ' 23:59:59';
		} elseif ( 'upcoming' === $when ) {
			$where[] = 'start_at >= %s';
			$args[]  = ( new DateTimeImmutable( 'today', $tz ) )->format( 'Y-m-d 00:00:00' );
		}
		if ( '' !== $q ) {
			$like    = '%' . $wpdb->esc_like( $q ) . '%';
			$where[] = '(code LIKE %s OR customer_name LIKE %s OR phone LIKE %s)';
			array_push( $args, $like, $like, $like );
		}
		$order = 'upcoming' === $when && ! $date ? 'ASC' : 'DESC';
		$sql   = "SELECT * FROM $t WHERE " . implode( ' AND ', $where ) . " ORDER BY start_at $order LIMIT 200";
		$rows  = $args ? $wpdb->get_results( $wpdb->prepare( $sql, $args ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore

		$staff_names = wp_list_pluck( RB_DB::get_staff_list( false ), 'name', 'id' );
		?>
		<div class="wrap rb-admin">
			<h1 class="wp-heading-inline">Lịch hẹn</h1>
			<?php self::notice(); ?>
			<form method="get" class="rb-filter">
				<input type="hidden" name="page" value="rb-bookings">
				<select name="when">
					<option value="upcoming" <?php selected( $when, 'upcoming' ); ?>>Sắp tới</option>
					<option value="all" <?php selected( $when, 'all' ); ?>>Tất cả</option>
				</select>
				<input type="date" name="date" value="<?php echo esc_attr( $date ); ?>">
				<select name="status">
					<option value="">Mọi trạng thái</option>
					<?php foreach ( $labels as $k => $v ) : ?>
						<option value="<?php echo esc_attr( $k ); ?>" <?php selected( $status, $k ); ?>><?php echo esc_html( $v ); ?></option>
					<?php endforeach; ?>
				</select>
				<input type="search" name="q" placeholder="Mã, tên hoặc SĐT" value="<?php echo esc_attr( $q ); ?>">
				<button class="button">Lọc</button>
				<a class="button-link" href="<?php echo esc_url( admin_url( 'admin.php?page=rb-bookings' ) ); ?>">Xóa lọc</a>
			</form>

			<table class="widefat striped rb-table">
				<thead><tr><th>Mã</th><th>Thời gian</th><th>Khách hàng</th><th>Dịch vụ</th><th>Kỹ thuật viên</th><th>Tổng</th><th>Ảnh mẫu</th><th>Trạng thái</th></tr></thead>
				<tbody>
				<?php if ( ! $rows ) : ?>
					<tr><td colspan="8">Chưa có lịch hẹn nào.</td></tr>
				<?php endif; ?>
				<?php foreach ( (array) $rows as $b ) :
					$start    = new DateTimeImmutable( $b['start_at'], $tz );
					$end      = new DateTimeImmutable( $b['end_at'], $tz );
					$services = json_decode( (string) $b['services_json'], true );
					?>
					<tr>
						<td><strong><?php echo esc_html( $b['code'] ); ?></strong><br><span class="rb-muted"><?php echo esc_html( ( new DateTimeImmutable( $b['created_at'], $tz ) )->format( 'd/m H:i' ) ); ?></span></td>
						<td><strong><?php echo esc_html( $start->format( 'H:i' ) . '–' . $end->format( 'H:i' ) ); ?></strong><br><?php echo esc_html( wp_date( 'D d/m/Y', $start->getTimestamp() ) ); ?></td>
						<td><?php echo esc_html( $b['customer_name'] ); ?><br><a href="tel:<?php echo esc_attr( $b['phone'] ); ?>"><?php echo esc_html( $b['phone'] ); ?></a>
							<?php if ( $b['email'] ) : ?><br><span class="rb-muted"><?php echo esc_html( $b['email'] ); ?></span><?php endif; ?>
							<?php if ( $b['note'] ) : ?><div class="rb-note"><?php echo esc_html( $b['note'] ); ?></div><?php endif; ?>
						</td>
						<td><?php foreach ( (array) $services as $s ) { echo esc_html( $s['name'] ) . '<br>'; } ?></td>
						<td><?php echo esc_html( isset( $staff_names[ $b['staff_id'] ] ) ? $staff_names[ $b['staff_id'] ] : '—' ); ?><?php echo $b['staff_auto'] ? '<br><span class="rb-muted">tiệm sắp xếp</span>' : ''; ?></td>
						<td><?php echo esc_html( rb_format_price( $b['total'] ) ); ?></td>
						<td class="rb-thumbs"><?php
						foreach ( array_filter( array_map( 'intval', explode( ',', (string) $b['image_ids'] ) ) ) as $img ) {
							$full  = wp_get_attachment_url( $img );
							$thumb = wp_get_attachment_image_url( $img, 'thumbnail' );
							if ( $thumb ) {
								echo '<a href="' . esc_url( $full ) . '" target="_blank"><img src="' . esc_url( $thumb ) . '" alt=""></a>';
							}
						}
						?></td>
						<td>
							<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="rb-status-form">
								<?php wp_nonce_field( 'rb_status_' . $b['id'] ); ?>
								<input type="hidden" name="action" value="rb_status">
								<input type="hidden" name="id" value="<?php echo (int) $b['id']; ?>">
								<span class="rb-badge rb-<?php echo esc_attr( $b['status'] ); ?>"><?php echo esc_html( $labels[ $b['status'] ] ?? $b['status'] ); ?></span>
								<select name="status">
									<?php foreach ( $labels as $k => $v ) : ?>
										<option value="<?php echo esc_attr( $k ); ?>" <?php selected( $b['status'], $k ); ?>><?php echo esc_html( $v ); ?></option>
									<?php endforeach; ?>
								</select>
								<button class="button button-small">Lưu</button>
							</form>
						</td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	public static function handle_status() {
		$id = isset( $_POST['id'] ) ? (int) $_POST['id'] : 0;
		self::guard( 'rb_status_' . $id );
		$status = isset( $_POST['status'] ) ? sanitize_key( wp_unslash( $_POST['status'] ) ) : '';
		$before = RB_DB::get_booking( $id );
		if ( $before && RB_DB::update_status( $id, $status ) && $before['status'] !== $status ) {
			RB_Mail::status_changed( $id );
		}
		self::back( 'rb-bookings', array( 'rb_msg' => 'status' ) );
	}

	/* =========================================================
	 * Dịch vụ
	 * ======================================================= */

	private static function categories() {
		return array( 'nail' => 'Nail', 'mi' => 'Mi', 'combo' => 'Combo' );
	}

	public static function page_services() {
		$edit = isset( $_GET['edit'] ) ? RB_DB::get_service( (int) $_GET['edit'] ) : null; // phpcs:ignore
		$cats = self::categories();
		$s    = $edit ? $edit : array( 'id' => 0, 'name' => '', 'category' => 'nail', 'description' => '', 'price' => 0, 'duration' => 60, 'image_id' => 0, 'image' => '', 'detail_url' => '', 'active' => 1, 'sort_order' => 0 );
		?>
		<div class="wrap rb-admin">
			<h1>Dịch vụ</h1>
			<?php self::notice(); ?>
			<div class="rb-cols">
				<div>
					<table class="widefat striped rb-table">
						<thead><tr><th></th><th>Tên dịch vụ</th><th>Nhóm</th><th>Giá</th><th>Thời lượng</th><th>Hiển thị</th><th></th></tr></thead>
						<tbody>
						<?php foreach ( RB_DB::get_services( false ) as $row ) : ?>
							<tr>
								<td class="rb-sthumb"><?php echo $row['image_id'] ? wp_get_attachment_image( $row['image_id'], 'thumbnail' ) : '<span></span>'; ?></td>
								<td><strong><?php echo esc_html( $row['name'] ); ?></strong> <span class="rb-muted">#<?php echo (int) $row['id']; ?></span><br><span class="rb-muted"><?php echo esc_html( $row['description'] ); ?></span></td>
								<td><?php echo esc_html( $cats[ $row['category'] ] ?? $row['category'] ); ?></td>
								<td><?php echo esc_html( rb_format_price( $row['price'] ) ); ?></td>
								<td><?php echo (int) $row['duration']; ?> phút</td>
								<td><?php echo $row['active'] ? 'Có' : '<span class="rb-muted">Ẩn</span>'; ?></td>
								<td class="rb-actions">
									<a href="<?php echo esc_url( admin_url( 'admin.php?page=rb-services&edit=' . $row['id'] ) ); ?>">Sửa</a>
									<a class="rb-del" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=rb_delete_service&id=' . $row['id'] ), 'rb_delete_service_' . $row['id'] ) ); ?>" onclick="return confirm('Xóa dịch vụ này?');">Xóa</a>
								</td>
							</tr>
						<?php endforeach; ?>
						</tbody>
					</table>
				</div>
				<form class="rb-card" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<h2><?php echo $s['id'] ? 'Sửa dịch vụ' : 'Thêm dịch vụ'; ?></h2>
					<?php wp_nonce_field( 'rb_save_service' ); ?>
					<input type="hidden" name="action" value="rb_save_service">
					<input type="hidden" name="id" value="<?php echo (int) $s['id']; ?>">
					<label>Tên dịch vụ<input type="text" name="name" required value="<?php echo esc_attr( $s['name'] ); ?>"></label>
					<label>Nhóm<select name="category"><?php foreach ( $cats as $k => $v ) : ?><option value="<?php echo esc_attr( $k ); ?>" <?php selected( $s['category'], $k ); ?>><?php echo esc_html( $v ); ?></option><?php endforeach; ?></select></label>
					<label>Mô tả ngắn<textarea name="description" rows="2"><?php echo esc_textarea( $s['description'] ); ?></textarea></label>
					<div class="rb-photo rb-photo-sq">
						<span class="rb-photo-prev"><?php echo $s['image_id'] ? wp_get_attachment_image( $s['image_id'], 'thumbnail' ) : ''; ?></span>
						<input type="hidden" name="image_id" value="<?php echo (int) $s['image_id']; ?>">
						<button type="button" class="button rb-pick" data-title="Chọn ảnh dịch vụ">Chọn ảnh</button>
						<button type="button" class="button-link rb-clear">Bỏ ảnh</button>
					</div>
					<p class="rb-muted rb-tip">Ảnh dọc (tỉ lệ 3:4) đẹp nhất, ví dụ 900×1200px. Để trống: dùng ảnh từ trang Dịch vụ (nếu có).</p>
					<label>Link trang chi tiết <span class="rb-muted">(không bắt buộc)</span><input type="text" name="detail_url" placeholder="Để trống: tự lấy từ trang Dịch vụ" value="<?php echo esc_attr( $s['detail_url'] ); ?>"></label>
					<div class="rb-2">
						<label>Giá (đ)<input type="number" min="0" step="1000" name="price" value="<?php echo (int) $s['price']; ?>"></label>
						<label>Thời lượng (phút)<input type="number" min="10" step="5" name="duration" value="<?php echo (int) $s['duration']; ?>"></label>
					</div>
					<div class="rb-2">
						<label>Thứ tự<input type="number" name="sort_order" value="<?php echo (int) $s['sort_order']; ?>"></label>
						<label class="rb-check"><input type="checkbox" name="active" value="1" <?php checked( $s['active'], 1 ); ?>> Hiển thị cho khách</label>
					</div>
					<p><button class="button button-primary"><?php echo $s['id'] ? 'Cập nhật' : 'Thêm dịch vụ'; ?></button>
					<?php if ( $s['id'] ) : ?> <a href="<?php echo esc_url( admin_url( 'admin.php?page=rb-services' ) ); ?>">Hủy</a><?php endif; ?></p>
				</form>
			</div>
		</div>
		<?php
	}

	public static function handle_service() {
		global $wpdb;
		self::guard( 'rb_save_service' );
		$id   = isset( $_POST['id'] ) ? (int) $_POST['id'] : 0;
		$cat  = isset( $_POST['category'] ) ? sanitize_key( wp_unslash( $_POST['category'] ) ) : 'nail';
		$data = array(
			'name'        => sanitize_text_field( wp_unslash( $_POST['name'] ?? '' ) ),
			'category'    => array_key_exists( $cat, self::categories() ) ? $cat : 'nail',
			'description' => sanitize_textarea_field( wp_unslash( $_POST['description'] ?? '' ) ),
			'price'       => max( 0, (int) ( $_POST['price'] ?? 0 ) ),
			'duration'    => max( 10, (int) ( $_POST['duration'] ?? 60 ) ),
			'image_id'    => max( 0, (int) ( $_POST['image_id'] ?? 0 ) ),
			'detail_url'  => esc_url_raw( wp_unslash( $_POST['detail_url'] ?? '' ) ),
			'sort_order'  => (int) ( $_POST['sort_order'] ?? 0 ),
			'active'      => empty( $_POST['active'] ) ? 0 : 1,
		);
		if ( $id ) {
			$wpdb->update( RB_DB::table( 'services' ), $data, array( 'id' => $id ) );
		} else {
			$wpdb->insert( RB_DB::table( 'services' ), $data );
		}
		self::back( 'rb-services', array( 'rb_msg' => 'saved' ) );
	}

	public static function handle_delete_service() {
		global $wpdb;
		$id = isset( $_GET['id'] ) ? (int) $_GET['id'] : 0;
		self::guard( 'rb_delete_service_' . $id );
		$wpdb->delete( RB_DB::table( 'services' ), array( 'id' => $id ) );
		self::back( 'rb-services', array( 'rb_msg' => 'deleted' ) );
	}

	/* =========================================================
	 * Kỹ thuật viên
	 * ======================================================= */

	public static function page_staff() {
		$edit     = isset( $_GET['edit'] ) ? RB_DB::get_staff( (int) $_GET['edit'] ) : null; // phpcs:ignore
		$s        = $edit ? $edit : array( 'id' => 0, 'name' => '', 'title' => '', 'photo_id' => 0, 'photo' => '', 'service_ids' => array(), 'active' => 1, 'sort_order' => 0 );
		$services = RB_DB::get_services( false );
		$names    = wp_list_pluck( $services, 'name', 'id' );
		?>
		<div class="wrap rb-admin">
			<h1>Kỹ thuật viên</h1>
			<?php self::notice(); ?>
			<div class="rb-cols">
				<div>
					<table class="widefat striped rb-table">
						<thead><tr><th></th><th>Tên</th><th>Chuyên môn</th><th>Dịch vụ làm được</th><th>Hiển thị</th><th></th></tr></thead>
						<tbody>
						<?php foreach ( RB_DB::get_staff_list( false ) as $row ) : ?>
							<tr>
								<td class="rb-avatar"><?php echo $row['photo'] ? '<img src="' . esc_url( $row['photo'] ) . '" alt="">' : '<span>' . esc_html( mb_substr( $row['name'], 0, 1 ) ) . '</span>'; ?></td>
								<td><strong><?php echo esc_html( $row['name'] ); ?></strong></td>
								<td><?php echo esc_html( $row['title'] ); ?></td>
								<td><?php
								if ( ! $row['service_ids'] ) {
									echo '<span class="rb-muted">Tất cả dịch vụ</span>';
								} else {
									echo esc_html( implode( ', ', array_intersect_key( $names, array_flip( $row['service_ids'] ) ) ) );
								}
								?></td>
								<td><?php echo $row['active'] ? 'Có' : '<span class="rb-muted">Ẩn</span>'; ?></td>
								<td class="rb-actions">
									<a href="<?php echo esc_url( admin_url( 'admin.php?page=rb-staff&edit=' . $row['id'] ) ); ?>">Sửa</a>
									<a class="rb-del" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=rb_delete_staff&id=' . $row['id'] ), 'rb_delete_staff_' . $row['id'] ) ); ?>" onclick="return confirm('Xóa kỹ thuật viên này?');">Xóa</a>
								</td>
							</tr>
						<?php endforeach; ?>
						</tbody>
					</table>
				</div>
				<form class="rb-card" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<h2><?php echo $s['id'] ? 'Sửa kỹ thuật viên' : 'Thêm kỹ thuật viên'; ?></h2>
					<?php wp_nonce_field( 'rb_save_staff' ); ?>
					<input type="hidden" name="action" value="rb_save_staff">
					<input type="hidden" name="id" value="<?php echo (int) $s['id']; ?>">
					<label>Tên<input type="text" name="name" required value="<?php echo esc_attr( $s['name'] ); ?>"></label>
					<label>Chuyên môn<input type="text" name="title" placeholder="VD: Chuyên nối mi" value="<?php echo esc_attr( $s['title'] ); ?>"></label>
					<div class="rb-photo">
						<span class="rb-photo-prev"><?php echo $s['photo'] ? '<img src="' . esc_url( $s['photo'] ) . '" alt="">' : ''; ?></span>
						<input type="hidden" name="photo_id" value="<?php echo (int) $s['photo_id']; ?>">
						<button type="button" class="button rb-pick" data-title="Chọn ảnh kỹ thuật viên">Chọn ảnh</button>
						<button type="button" class="button-link rb-clear">Bỏ ảnh</button>
					</div>
					<fieldset><legend>Dịch vụ làm được <span class="rb-muted">(không tick = làm được tất cả)</span></legend>
						<?php foreach ( $services as $sv ) : ?>
							<label class="rb-check"><input type="checkbox" name="service_ids[]" value="<?php echo (int) $sv['id']; ?>" <?php checked( in_array( $sv['id'], $s['service_ids'], true ) ); ?>> <?php echo esc_html( $sv['name'] ); ?></label>
						<?php endforeach; ?>
					</fieldset>
					<div class="rb-2">
						<label>Thứ tự<input type="number" name="sort_order" value="<?php echo (int) $s['sort_order']; ?>"></label>
						<label class="rb-check"><input type="checkbox" name="active" value="1" <?php checked( $s['active'], 1 ); ?>> Nhận lịch</label>
					</div>
					<p><button class="button button-primary"><?php echo $s['id'] ? 'Cập nhật' : 'Thêm kỹ thuật viên'; ?></button>
					<?php if ( $s['id'] ) : ?> <a href="<?php echo esc_url( admin_url( 'admin.php?page=rb-staff' ) ); ?>">Hủy</a><?php endif; ?></p>
				</form>
			</div>
		</div>
		<?php
	}

	public static function handle_staff() {
		global $wpdb;
		self::guard( 'rb_save_staff' );
		$id   = isset( $_POST['id'] ) ? (int) $_POST['id'] : 0;
		$ids  = isset( $_POST['service_ids'] ) ? array_filter( array_map( 'intval', (array) $_POST['service_ids'] ) ) : array();
		$data = array(
			'name'        => sanitize_text_field( wp_unslash( $_POST['name'] ?? '' ) ),
			'title'       => sanitize_text_field( wp_unslash( $_POST['title'] ?? '' ) ),
			'photo_id'    => (int) ( $_POST['photo_id'] ?? 0 ),
			'service_ids' => implode( ',', $ids ),
			'sort_order'  => (int) ( $_POST['sort_order'] ?? 0 ),
			'active'      => empty( $_POST['active'] ) ? 0 : 1,
		);
		if ( $id ) {
			$wpdb->update( RB_DB::table( 'staff' ), $data, array( 'id' => $id ) );
		} else {
			$wpdb->insert( RB_DB::table( 'staff' ), $data );
		}
		self::back( 'rb-staff', array( 'rb_msg' => 'saved' ) );
	}

	public static function handle_delete_staff() {
		global $wpdb;
		$id = isset( $_GET['id'] ) ? (int) $_GET['id'] : 0;
		self::guard( 'rb_delete_staff_' . $id );
		$wpdb->delete( RB_DB::table( 'staff' ), array( 'id' => $id ) );
		self::back( 'rb-staff', array( 'rb_msg' => 'deleted' ) );
	}

	/* =========================================================
	 * Cài đặt
	 * ======================================================= */

	public static function page_settings() {
		$s    = rb_settings();
		$days = array( 1 => 'Thứ 2', 2 => 'Thứ 3', 3 => 'Thứ 4', 4 => 'Thứ 5', 5 => 'Thứ 6', 6 => 'Thứ 7', 0 => 'Chủ nhật' );
		?>
		<div class="wrap rb-admin">
			<h1>Cài đặt đặt lịch</h1>
			<?php self::notice(); ?>
			<form class="rb-card rb-wide" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'rb_save_settings' ); ?>
				<input type="hidden" name="action" value="rb_save_settings">
				<h2>Giờ làm việc</h2>
				<div class="rb-3">
					<label>Mở cửa<input type="time" name="open_time" value="<?php echo esc_attr( $s['open_time'] ); ?>"></label>
					<label>Đóng cửa<input type="time" name="close_time" value="<?php echo esc_attr( $s['close_time'] ); ?>"></label>
					<label>Bước khung giờ (phút)<input type="number" min="10" step="5" name="slot_step" value="<?php echo (int) $s['slot_step']; ?>"></label>
				</div>
				<fieldset><legend>Ngày mở cửa</legend>
					<?php foreach ( $days as $k => $v ) : ?>
						<label class="rb-check rb-inline"><input type="checkbox" name="open_days[]" value="<?php echo (int) $k; ?>" <?php checked( in_array( $k, array_map( 'intval', (array) $s['open_days'] ), true ) ); ?>> <?php echo esc_html( $v ); ?></label>
					<?php endforeach; ?>
				</fieldset>
				<h2>Quy tắc đặt lịch</h2>
				<div class="rb-3">
					<label>Cho đặt trước tối đa (ngày)<input type="number" min="1" max="60" name="days_ahead" value="<?php echo (int) $s['days_ahead']; ?>"></label>
					<label>Đặt trước ít nhất (phút)<input type="number" min="0" step="15" name="min_lead" value="<?php echo (int) $s['min_lead']; ?>"></label>
					<label>Khách tự hủy trước (giờ)<input type="number" min="0" name="cancel_before" value="<?php echo (int) $s['cancel_before']; ?>"></label>
				</div>
				<div class="rb-3">
					<label>Số ảnh mẫu tối đa<input type="number" min="0" max="10" name="max_images" value="<?php echo (int) $s['max_images']; ?>"></label>
					<label>Dung lượng mỗi ảnh (MB)<input type="number" min="1" max="20" name="max_image_mb" value="<?php echo (int) $s['max_image_mb']; ?>"></label>
					<label class="rb-check"><input type="checkbox" name="auto_confirm" value="1" <?php checked( $s['auto_confirm'], 1 ); ?>> Tự động xác nhận lịch (không cần chủ tiệm duyệt)</label>
				</div>
				<h2>Thông tin tiệm & liên kết</h2>
				<div class="rb-3">
					<label>Email nhận thông báo<input type="email" name="admin_email" value="<?php echo esc_attr( $s['admin_email'] ); ?>"></label>
					<label>Số điện thoại tiệm<input type="text" name="shop_phone" value="<?php echo esc_attr( $s['shop_phone'] ); ?>"></label>
					<label>Địa chỉ<input type="text" name="shop_address" value="<?php echo esc_attr( $s['shop_address'] ); ?>"></label>
				</div>
				<div class="rb-2">
					<label>Link trang Chính sách hủy/đổi lịch<input type="url" name="policy_url" placeholder="https://rubynails.id.vn/chinh-sach-huy-doi-lich/" value="<?php echo esc_attr( $s['policy_url'] ); ?>"></label>
					<label>Link trang Tra cứu lịch hẹn<input type="url" name="status_url" placeholder="https://rubynails.id.vn/tra-cuu-lich-hen/" value="<?php echo esc_attr( $s['status_url'] ); ?>"></label>
				</div>
				<p><button class="button button-primary button-large">Lưu cài đặt</button></p>
				<div class="rb-help">
					<strong>Cách dùng:</strong> dán shortcode <code>[ruby_booking]</code> vào trang Đặt lịch và <code>[ruby_booking_status]</code> vào trang Tra cứu lịch hẹn.
					Nút “Đặt” ở trang Dịch vụ có thể link tới <code>/dat-lich/?dich-vu=ID</code> để chọn sẵn dịch vụ (ID xem ở trang Dịch vụ khi bấm Sửa).
				</div>
			</form>
		</div>
		<?php
	}

	public static function handle_settings() {
		self::guard( 'rb_save_settings' );
		$new = self::sanitize_settings( wp_unslash( $_POST ) );
		update_option( 'rb_settings', $new );
		self::back( 'rb-settings', array( 'rb_msg' => 'saved' ) );
	}

	/** Shared by wp-admin and the /quan-ly/ portal. Missing open_days = closed every day, so callers send it. */
	public static function sanitize_settings( $p ) {
		$p    = (array) $p;
		$time = function ( $v, $d ) {
			return preg_match( '/^\d{2}:\d{2}$/', (string) $v ) ? $v : $d;
		};
		return array(
			'open_time'     => $time( $p['open_time'] ?? '', '08:30' ),
			'close_time'    => $time( $p['close_time'] ?? '', '20:00' ),
			'open_days'     => array_values( array_intersect( array_map( 'intval', (array) ( $p['open_days'] ?? array() ) ), range( 0, 6 ) ) ),
			'slot_step'     => max( 10, (int) ( $p['slot_step'] ?? 30 ) ),
			'days_ahead'    => min( 60, max( 1, (int) ( $p['days_ahead'] ?? 14 ) ) ),
			'min_lead'      => max( 0, (int) ( $p['min_lead'] ?? 60 ) ),
			'cancel_before' => max( 0, (int) ( $p['cancel_before'] ?? 2 ) ),
			'max_images'    => min( 10, max( 0, (int) ( $p['max_images'] ?? 3 ) ) ),
			'max_image_mb'  => min( 20, max( 1, (int) ( $p['max_image_mb'] ?? 5 ) ) ),
			'auto_confirm'  => empty( $p['auto_confirm'] ) ? 0 : 1,
			'admin_email'   => sanitize_email( $p['admin_email'] ?? '' ),
			'shop_phone'    => sanitize_text_field( $p['shop_phone'] ?? '' ),
			'shop_address'  => sanitize_text_field( $p['shop_address'] ?? '' ),
			'policy_url'    => esc_url_raw( $p['policy_url'] ?? '' ),
			'status_url'    => esc_url_raw( $p['status_url'] ?? '' ),
		);
	}
}
