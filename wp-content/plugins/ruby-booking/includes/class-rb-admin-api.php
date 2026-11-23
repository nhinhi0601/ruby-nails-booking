<?php
/**
 * REST API cho trang quản lý /quan-ly/ (namespace ruby-booking/v1/admin).
 *
 * FR06 lịch theo ngày · FR07 xác nhận/hủy + thông báo · FR08 gán/đổi thợ (chỉ thợ còn trống)
 * FR12 phân quyền · FR13 xem/xuất theo khoảng thời gian · FR15 lịch sử khách hàng · BRULE07 xác nhận phải có thợ
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Admin_API {

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
	}

	/* =========================================================
	 * Routing & permissions
	 * ======================================================= */

	private static function route( $path, $method, $cb, $cap ) {
		register_rest_route( RB_REST::NS, '/admin' . $path, array(
			'methods'             => $method,
			'callback'            => array( __CLASS__, $cb ),
			'permission_callback' => function () use ( $cap ) {
				return current_user_can( $cap );
			},
		) );
	}

	public static function routes() {
		self::route( '/day', 'GET', 'day', 'rb_access' );
		self::route( '/pending', 'GET', 'pending', 'rb_manage' );
		self::route( '/booking/(?P<id>\d+)', 'GET', 'get_booking', 'rb_access' );
		self::route( '/booking/(?P<id>\d+)/status', 'POST', 'set_status', 'rb_access' );
		self::route( '/booking/(?P<id>\d+)/assign', 'POST', 'assign', 'rb_manage' );
		self::route( '/booking/(?P<id>\d+)/reschedule', 'POST', 'reschedule', 'rb_manage' );
		self::route( '/booking/(?P<id>\d+)/note', 'POST', 'note', 'rb_access' );
		self::route( '/bookings', 'POST', 'create', 'rb_manage' );
		self::route( '/availability', 'GET', 'availability', 'rb_manage' );
		self::route( '/customers', 'GET', 'customers', 'rb_manage' );
		self::route( '/customer', 'GET', 'customer', 'rb_manage' );
		self::route( '/report', 'GET', 'report', 'rb_reports' );
		self::route( '/export', 'GET', 'export', 'rb_reports' );
		self::route( '/catalog', 'GET', 'catalog', 'rb_owner' );
		self::route( '/services', 'POST', 'save_service', 'rb_owner' );
		self::route( '/services/(?P<id>\d+)', 'POST', 'save_service', 'rb_owner' );
		self::route( '/services/(?P<id>\d+)/delete', 'POST', 'delete_service', 'rb_owner' );
		self::route( '/staff', 'POST', 'save_staff', 'rb_owner' );
		self::route( '/staff/(?P<id>\d+)', 'POST', 'save_staff', 'rb_owner' );
		self::route( '/staff/(?P<id>\d+)/delete', 'POST', 'delete_staff', 'rb_owner' );
		self::route( '/settings', 'POST', 'save_settings', 'rb_owner' );
		self::route( '/upload', 'POST', 'upload', 'rb_owner' );
		self::route( '/feed', 'GET', 'feed', 'rb_access' );
		self::route( '/users', 'GET', 'users', 'rb_owner' );
		self::route( '/users', 'POST', 'create_user', 'rb_owner' );
		self::route( '/users/(?P<id>\d+)', 'POST', 'update_user', 'rb_owner' );
	}

	private static function err( $msg, $code = 400 ) {
		return new WP_REST_Response( array( 'ok' => false, 'message' => $msg ), $code );
	}

	private static function ok( $data = array() ) {
		$r = new WP_REST_Response( array_merge( array( 'ok' => true ), $data ) );
		$r->header( 'Cache-Control', 'no-store' );
		return $r;
	}

	private static function my_staff_id() {
		$s = RB_Roles::staff_for_user( get_current_user_id() );
		return $s ? (int) $s['id'] : 0;
	}

	/** Lễ tân / chủ tiệm thấy mọi lịch; kỹ thuật viên chỉ thấy lịch của mình. */
	private static function can_see( $b ) {
		if ( current_user_can( 'rb_manage' ) ) {
			return true;
		}
		$me = self::my_staff_id();
		return $me && (int) $b['staff_id'] === $me;
	}

	private static function load( WP_REST_Request $req ) {
		$b = RB_DB::get_booking( (int) $req['id'] );
		if ( ! $b || ! self::can_see( $b ) ) {
			return null;
		}
		return $b;
	}

	/* =========================================================
	 * Helpers
	 * ======================================================= */

	private static function tz() {
		return wp_timezone();
	}

	private static function valid_date( $d ) {
		return is_string( $d ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $d ) && DateTimeImmutable::createFromFormat( '!Y-m-d', $d, self::tz() );
	}

	private static function staff_names() {
		return wp_list_pluck( RB_DB::get_staff_list( false ), 'name', 'id' );
	}

	/** Booking as the portal sees it. Technicians get a masked phone and no email (NFR02). */
	public static function view( $b, $names = null ) {
		$names    = $names ? $names : self::staff_names();
		$tz       = self::tz();
		$start    = new DateTimeImmutable( $b['start_at'], $tz );
		$end      = new DateTimeImmutable( $b['end_at'], $tz );
		$labels   = rb_status_labels();
		$sources  = rb_source_labels();
		$services = json_decode( (string) $b['services_json'], true );
		$full     = current_user_can( 'rb_manage' );
		$images   = array();
		foreach ( array_filter( array_map( 'intval', explode( ',', (string) $b['image_ids'] ) ) ) as $img ) {
			$thumb = wp_get_attachment_image_url( $img, 'thumbnail' );
			if ( $thumb ) {
				$images[] = array( 'thumb' => $thumb, 'full' => wp_get_attachment_url( $img ) );
			}
		}
		$src = isset( $b['source'] ) && $b['source'] ? $b['source'] : 'web';
		return array(
			'id'           => (int) $b['id'],
			'code'         => $b['code'],
			'name'         => $b['customer_name'],
			'phone'        => $full ? $b['phone'] : RB_DB::mask_phone( $b['phone'] ),
			'email'        => $full ? (string) $b['email'] : '',
			'note'         => (string) $b['note'],
			'admin_note'   => (string) ( $b['admin_note'] ?? '' ),
			'services'     => is_array( $services ) ? $services : array(),
			'service_ids'  => array_values( array_filter( array_map( 'intval', explode( ',', (string) $b['service_ids'] ) ) ) ),
			'staff_id'     => (int) $b['staff_id'],
			'staff_name'   => isset( $names[ $b['staff_id'] ] ) ? $names[ $b['staff_id'] ] : '',
			'staff_auto'   => (int) $b['staff_auto'],
			'date'         => $start->format( 'Y-m-d' ),
			'start'        => $start->format( 'H:i' ),
			'end'          => $end->format( 'H:i' ),
			'minutes'      => (int) round( ( $end->getTimestamp() - $start->getTimestamp() ) / 60 ),
			'total'        => (int) $b['total'],
			'status'       => $b['status'],
			'status_label' => $labels[ $b['status'] ] ?? $b['status'],
			'source'       => $src,
			'source_label' => $sources[ $src ] ?? $src,
			'created_by'   => (int) ( $b['created_by'] ?? 0 ),
			'images'       => $images,
			'cancel_reason'=> (string) ( $b['cancel_reason'] ?? '' ),
			'created_at'   => $b['created_at'],
		);
	}

	/** Is the shop open for the whole [start, end) interval? (FR09) */
	private static function within_hours( DateTimeImmutable $start, DateTimeImmutable $end ) {
		$set  = rb_settings();
		$date = $start->format( 'Y-m-d' );
		if ( ! in_array( (int) $start->format( 'w' ), array_map( 'intval', (array) $set['open_days'] ), true ) ) {
			return 'Tiệm nghỉ vào ngày này.';
		}
		$open  = new DateTimeImmutable( $date . ' ' . $set['open_time'], self::tz() );
		$close = new DateTimeImmutable( $date . ' ' . $set['close_time'], self::tz() );
		if ( $start < $open || $end > $close ) {
			return 'Ngoài giờ làm việc (' . $set['open_time'] . '–' . $set['close_time'] . ').';
		}
		return true;
	}

	/** Bookings of a technician overlapping [start, end), excluding one booking. */
	private static function conflicts( $staff_id, DateTimeImmutable $start, DateTimeImmutable $end, $exclude = 0 ) {
		global $wpdb;
		$t = RB_DB::table( 'bookings' );
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT id, code, customer_name, start_at, end_at FROM $t WHERE staff_id = %d AND id <> %d AND status IN ('pending','confirmed','in_progress') AND start_at < %s AND end_at > %s",
			$staff_id, $exclude, $end->format( 'Y-m-d H:i:s' ), $start->format( 'Y-m-d H:i:s' )
		), ARRAY_A );
	}

	private static function staff_check( $staff_id, $service_ids, DateTimeImmutable $start, DateTimeImmutable $end, $exclude = 0 ) {
		$s = RB_DB::get_staff( $staff_id );
		if ( ! $s || ! $s['active'] ) {
			return 'Kỹ thuật viên không tồn tại hoặc đang tạm nghỉ.';
		}
		if ( ! RB_DB::staff_can_do( $s, $service_ids ) ) {
			return $s['name'] . ' không làm được tất cả dịch vụ của lịch này.';
		}
		$c = self::conflicts( $staff_id, $start, $end, $exclude );
		if ( $c ) {
			$x = $c[0];
			return $s['name'] . ' đã có lịch ' . $x['code'] . ' (' . substr( $x['start_at'], 11, 5 ) . '–' . substr( $x['end_at'], 11, 5 ) . ') trùng giờ.';
		}
		return true;
	}

	/** Free technicians for an interval, least-busy first. */
	private static function free_staff( $service_ids, DateTimeImmutable $start, DateTimeImmutable $end, $exclude = 0 ) {
		global $wpdb;
		$t   = RB_DB::table( 'bookings' );
		$out = array();
		foreach ( RB_DB::get_staff_list() as $s ) {
			if ( ! RB_DB::staff_can_do( $s, $service_ids ) || self::conflicts( $s['id'], $start, $end, $exclude ) ) {
				continue;
			}
			$load  = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $t WHERE staff_id = %d AND status IN ('pending','confirmed','in_progress') AND start_at >= %s AND start_at <= %s", $s['id'], $start->format( 'Y-m-d 00:00:00' ), $start->format( 'Y-m-d 23:59:59' ) ) );
			$out[] = array( 'id' => $s['id'], 'name' => $s['name'], 'load' => $load );
		}
		usort( $out, function ( $a, $b ) {
			return $a['load'] - $b['load'];
		} );
		return $out;
	}

	private static function services_of( $ids ) {
		$ids = array_values( array_unique( array_filter( array_map( 'intval', is_array( $ids ) ? $ids : explode( ',', (string) $ids ) ) ) ) );
		$out = array();
		$dur = 0;
		$sum = 0;
		foreach ( $ids as $id ) {
			$s = RB_DB::get_service( $id );
			if ( $s ) {
				$out[] = array( 'id' => $s['id'], 'name' => $s['name'], 'price' => $s['price'], 'duration' => $s['duration'] );
				$dur  += $s['duration'];
				$sum  += $s['price'];
			}
		}
		return array( wp_list_pluck( $out, 'id' ), $out, $dur, $sum );
	}

	private static function touch( $id, $fields ) {
		global $wpdb;
		$fields['updated_at'] = current_time( 'mysql' );
		return false !== $wpdb->update( RB_DB::table( 'bookings' ), $fields, array( 'id' => (int) $id ) );
	}

	/* =========================================================
	 * FR06 – lịch theo ngày
	 * ======================================================= */

	public static function day( WP_REST_Request $req ) {
		global $wpdb;
		$date = (string) $req->get_param( 'date' );
		if ( ! self::valid_date( $date ) ) {
			$date = ( new DateTimeImmutable( 'now', self::tz() ) )->format( 'Y-m-d' );
		}
		$t     = RB_DB::table( 'bookings' );
		$where = 'start_at >= %s AND start_at <= %s';
		$args  = array( $date . ' 00:00:00', $date . ' 23:59:59' );
		if ( ! current_user_can( 'rb_manage' ) ) {
			$where .= ' AND staff_id = %d';
			$args[] = self::my_staff_id();
		}
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $t WHERE $where ORDER BY start_at ASC", $args ), ARRAY_A );
		$names = self::staff_names();
		$list  = array_map( function ( $b ) use ( $names ) {
			return RB_Admin_API::view( $b, $names );
		}, (array) $rows );

		$stats = array( 'total' => 0, 'pending' => 0, 'confirmed' => 0, 'in_progress' => 0, 'done' => 0, 'cancelled' => 0, 'no_show' => 0, 'revenue' => 0, 'expected' => 0 );
		foreach ( $list as $b ) {
			$stats[ $b['status'] ] = ( $stats[ $b['status'] ] ?? 0 ) + 1;
			if ( ! in_array( $b['status'], array( 'cancelled', 'no_show' ), true ) ) {
				$stats['total']++;
				$stats['expected'] += $b['total'];
			}
			if ( 'done' === $b['status'] ) {
				$stats['revenue'] += $b['total'];
			}
		}
		$pending_all = current_user_can( 'rb_manage' ) ? (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $t WHERE status = 'pending' AND start_at >= %s", ( new DateTimeImmutable( 'today', self::tz() ) )->format( 'Y-m-d H:i:s' ) ) ) : 0;

		return self::ok( array( 'date' => $date, 'bookings' => $list, 'stats' => $stats, 'pending_all' => $pending_all ) );
	}

	public static function pending( WP_REST_Request $req ) {
		global $wpdb;
		$t     = RB_DB::table( 'bookings' );
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $t WHERE status = 'pending' AND start_at >= %s ORDER BY start_at ASC LIMIT 200", ( new DateTimeImmutable( 'today', self::tz() ) )->format( 'Y-m-d H:i:s' ) ), ARRAY_A );
		$names = self::staff_names();
		return self::ok( array( 'bookings' => array_map( function ( $b ) use ( $names ) {
			return RB_Admin_API::view( $b, $names );
		}, (array) $rows ) ) );
	}

	public static function get_booking( WP_REST_Request $req ) {
		global $wpdb;
		$b = self::load( $req );
		if ( ! $b ) {
			return self::err( 'Không tìm thấy lịch hẹn.', 404 );
		}
		$logs = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . RB_DB::table( 'logs' ) . ' WHERE booking_id = %d ORDER BY id DESC LIMIT 50', $b['id'] ), ARRAY_A );
		$logs = array_map( function ( $l ) {
			$u = $l['user_id'] ? get_userdata( (int) $l['user_id'] ) : null;
			return array( 'action' => $l['action'], 'detail' => (string) $l['detail'], 'at' => $l['created_at'], 'by' => $u ? $u->display_name : 'Khách hàng' );
		}, (array) $logs );

		$customer = null;
		if ( current_user_can( 'rb_manage' ) ) {
			$t        = RB_DB::table( 'bookings' );
			$customer = $wpdb->get_row( $wpdb->prepare(
				"SELECT COUNT(*) AS visits, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done, SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) AS no_show, SUM(CASE WHEN status = 'done' THEN total ELSE 0 END) AS spent FROM $t WHERE phone = %s",
				$b['phone']
			), ARRAY_A );
			$customer = array_map( 'intval', (array) $customer );
		}
		return self::ok( array( 'booking' => self::view( $b ), 'logs' => $logs, 'customer' => $customer ) );
	}

	/* =========================================================
	 * FR07 – trạng thái (xác nhận / hủy / bắt đầu / hoàn thành / vắng)
	 * ======================================================= */

	private static function transitions() {
		return array(
			'pending'     => array( 'confirmed', 'cancelled' ),
			'confirmed'   => array( 'in_progress', 'done', 'no_show', 'cancelled', 'pending' ),
			'in_progress' => array( 'done', 'confirmed' ),
			'done'        => array( 'in_progress' ),
			'cancelled'   => array( 'confirmed' ),
			'no_show'     => array( 'confirmed' ),
		);
	}

	public static function set_status( WP_REST_Request $req ) {
		$b = self::load( $req );
		if ( ! $b ) {
			return self::err( 'Không tìm thấy lịch hẹn.', 404 );
		}
		$to     = sanitize_key( (string) $req->get_param( 'status' ) );
		$from   = $b['status'];
		$reason = sanitize_textarea_field( (string) $req->get_param( 'reason' ) );
		$labels = rb_status_labels();
		$map    = self::transitions();

		if ( ! isset( $labels[ $to ] ) || ! in_array( $to, $map[ $from ] ?? array(), true ) ) {
			return self::err( 'Không thể chuyển từ "' . ( $labels[ $from ] ?? $from ) . '" sang "' . ( $labels[ $to ] ?? $to ) . '".' );
		}
		// Kỹ thuật viên: chỉ bắt đầu / hoàn thành lịch của mình.
		if ( ! current_user_can( 'rb_manage' ) && ! in_array( $from . '>' . $to, array( 'confirmed>in_progress', 'in_progress>done' ), true ) ) {
			return self::err( 'Bạn chỉ có thể bấm Bắt đầu / Hoàn thành cho lịch của mình.', 403 );
		}

		$tz    = self::tz();
		$start = new DateTimeImmutable( $b['start_at'], $tz );
		$end   = new DateTimeImmutable( $b['end_at'], $tz );
		$ids   = array_filter( array_map( 'intval', explode( ',', (string) $b['service_ids'] ) ) );

		if ( 'confirmed' === $to ) {
			// BRULE07: phải có thợ, và thợ phải còn trống.
			if ( ! (int) $b['staff_id'] ) {
				return self::err( 'Vui lòng gán kỹ thuật viên trước khi xác nhận lịch.' );
			}
			if ( in_array( $from, array( 'pending', 'cancelled', 'no_show' ), true ) ) {
				$chk = self::staff_check( (int) $b['staff_id'], $ids, $start, $end, (int) $b['id'] );
				if ( true !== $chk ) {
					return self::err( $chk . ' Hãy đổi thợ hoặc đổi giờ trước.' );
				}
			}
		}
		if ( 'cancelled' === $to && '' === trim( $reason ) ) {
			return self::err( 'Vui lòng nhập lý do hủy.' );
		}
		// 1.6.6: chỉ đánh dấu "Khách vắng mặt" sau giờ hẹn (BRULE08).
		if ( 'no_show' === $to && new DateTimeImmutable( 'now', $tz ) < $start ) {
			return self::err( 'Chưa đến giờ hẹn nên chưa thể đánh dấu khách vắng mặt.' );
		}

		$fields = array( 'status' => $to );
		if ( 'cancelled' === $to ) {
			$fields['cancel_reason'] = $reason;
		}
		if ( 'confirmed' === $to ) {
			$fields['staff_auto'] = 0;
		}
		self::touch( $b['id'], $fields );
		RB_DB::log( $b['id'], 'status', ( $labels[ $from ] ?? $from ) . ' → ' . $labels[ $to ] . ( $reason ? ' · ' . $reason : '' ) );

		// FR07: báo khách khi xác nhận / hủy / khôi phục.
		if ( in_array( $to, array( 'confirmed', 'cancelled' ), true ) && $from !== $to && 'in_progress' !== $from ) {
			RB_Mail::status_changed( (int) $b['id'] );
		}
		return self::ok( array( 'booking' => self::view( RB_DB::get_booking( $b['id'] ) ) ) );
	}

	/* =========================================================
	 * FR08 – gán / đổi thợ
	 * ======================================================= */

	public static function assign( WP_REST_Request $req ) {
		$b = self::load( $req );
		if ( ! $b ) {
			return self::err( 'Không tìm thấy lịch hẹn.', 404 );
		}
		if ( in_array( $b['status'], array( 'done', 'cancelled', 'no_show' ), true ) ) {
			return self::err( 'Lịch hẹn đã kết thúc, không đổi thợ được.' );
		}
		$staff_id = (int) $req->get_param( 'staff_id' );
		$tz       = self::tz();
		$start    = new DateTimeImmutable( $b['start_at'], $tz );
		$end      = new DateTimeImmutable( $b['end_at'], $tz );
		$ids      = array_filter( array_map( 'intval', explode( ',', (string) $b['service_ids'] ) ) );
		$chk      = self::staff_check( $staff_id, $ids, $start, $end, (int) $b['id'] );
		if ( true !== $chk ) {
			return self::err( $chk );
		}
		$names = self::staff_names();
		$old   = $names[ $b['staff_id'] ] ?? 'chưa gán';
		self::touch( $b['id'], array( 'staff_id' => $staff_id, 'staff_auto' => 0 ) );
		RB_DB::log( $b['id'], 'assign', $old . ' → ' . $names[ $staff_id ] );
		if ( 'confirmed' === $b['status'] && (int) $b['staff_id'] !== $staff_id ) {
			RB_Mail::notify( (int) $b['id'], 'Thay đổi kỹ thuật viên', 'Lịch hẹn của bạn được chuyển sang kỹ thuật viên <b>' . esc_html( $names[ $staff_id ] ) . '</b>. Thời gian giữ nguyên.' );
		}
		return self::ok( array( 'booking' => self::view( RB_DB::get_booking( $b['id'] ) ) ) );
	}

	public static function reschedule( WP_REST_Request $req ) {
		$b = self::load( $req );
		if ( ! $b ) {
			return self::err( 'Không tìm thấy lịch hẹn.', 404 );
		}
		if ( in_array( $b['status'], array( 'done', 'in_progress' ), true ) ) {
			return self::err( 'Lịch đang làm hoặc đã hoàn thành, không đổi giờ được.' );
		}
		$date = (string) $req->get_param( 'date' );
		$time = (string) $req->get_param( 'time' );
		if ( ! self::valid_date( $date ) || ! preg_match( '/^\d{2}:\d{2}$/', $time ) ) {
			return self::err( 'Ngày giờ không hợp lệ.' );
		}
		$tz       = self::tz();
		$old      = new DateTimeImmutable( $b['start_at'], $tz );
		$len      = ( new DateTimeImmutable( $b['end_at'], $tz ) )->getTimestamp() - $old->getTimestamp();
		$start    = new DateTimeImmutable( $date . ' ' . $time, $tz );
		$end      = $start->modify( '+' . (int) round( $len / 60 ) . ' minutes' );
		// 1.6.6: không cho đổi lịch về thời điểm đã qua.
		if ( $start < new DateTimeImmutable( 'now', $tz ) ) {
			return self::err( 'Không thể đổi lịch sang thời điểm đã qua.' );
		}
		$hours    = self::within_hours( $start, $end );
		if ( true !== $hours ) {
			return self::err( $hours );
		}
		$ids      = array_filter( array_map( 'intval', explode( ',', (string) $b['service_ids'] ) ) );
		$staff_id = (int) $req->get_param( 'staff_id' );
		if ( ! $staff_id ) {
			$free = self::free_staff( $ids, $start, $end, (int) $b['id'] );
			if ( ! $free ) {
				return self::err( 'Không còn kỹ thuật viên trống vào giờ này.' );
			}
			$staff_id = $free[0]['id'];
		}
		$chk = self::staff_check( $staff_id, $ids, $start, $end, (int) $b['id'] );
		if ( true !== $chk ) {
			return self::err( $chk );
		}
		$fields = array( 'start_at' => $start->format( 'Y-m-d H:i:s' ), 'end_at' => $end->format( 'Y-m-d H:i:s' ), 'staff_id' => $staff_id, 'staff_auto' => 0 );
		if ( in_array( $b['status'], array( 'cancelled', 'no_show' ), true ) ) {
			$fields['status'] = 'confirmed';
		}
		self::touch( $b['id'], $fields );
		$names = self::staff_names();
		RB_DB::log( $b['id'], 'reschedule', $old->format( 'd/m H:i' ) . ' → ' . $start->format( 'd/m H:i' ) . ' · ' . $names[ $staff_id ] );
		RB_Mail::notify( (int) $b['id'], 'Lịch hẹn đã được đổi giờ', 'Lịch hẹn của bạn đã được đổi sang <b>' . $start->format( 'H:i' ) . ' ngày ' . $start->format( 'd/m/Y' ) . '</b>.' );
		return self::ok( array( 'booking' => self::view( RB_DB::get_booking( $b['id'] ) ) ) );
	}

	public static function note( WP_REST_Request $req ) {
		$b = self::load( $req );
		if ( ! $b ) {
			return self::err( 'Không tìm thấy lịch hẹn.', 404 );
		}
		$note = sanitize_textarea_field( (string) $req->get_param( 'admin_note' ) );
		self::touch( $b['id'], array( 'admin_note' => $note ) );
		RB_DB::log( $b['id'], 'note', $note ? 'Cập nhật ghi chú nội bộ' : 'Xóa ghi chú nội bộ' );
		return self::ok( array( 'booking' => self::view( RB_DB::get_booking( $b['id'] ) ) ) );
	}

	/* =========================================================
	 * Tạo lịch cho khách gọi điện / vãng lai
	 * ======================================================= */

	public static function availability( WP_REST_Request $req ) {
		$date = (string) $req->get_param( 'date' );
		if ( ! self::valid_date( $date ) ) {
			return self::err( 'Ngày không hợp lệ.' );
		}
		list( $ids, , $dur ) = self::services_of( $req->get_param( 'services' ) );
		$exclude = (int) $req->get_param( 'exclude' );
		if ( $exclude && ! $dur ) {
			$b = RB_DB::get_booking( $exclude );
			if ( $b ) {
				$ids = array_filter( array_map( 'intval', explode( ',', (string) $b['service_ids'] ) ) );
				$dur = (int) round( ( strtotime( $b['end_at'] ) - strtotime( $b['start_at'] ) ) / 60 );
			}
		}
		if ( ! $dur ) {
			return self::err( 'Chọn dịch vụ trước.' );
		}
		$set  = rb_settings();
		$tz   = self::tz();
		$open = new DateTimeImmutable( $date . ' ' . $set['open_time'], $tz );
		$close= new DateTimeImmutable( $date . ' ' . $set['close_time'], $tz );
		$step = max( 10, (int) $set['slot_step'] ) * 60;
		$now  = time();
		$out  = array();
		if ( true === self::within_hours( $open, $open ) ) {
			for ( $t = $open->getTimestamp(); $t + $dur * 60 <= $close->getTimestamp(); $t += $step ) {
				$s    = ( new DateTimeImmutable( '@' . $t ) )->setTimezone( $tz );
				$free = self::free_staff( $ids, $s, $s->modify( '+' . $dur . ' minutes' ), $exclude );
				$out[] = array( 'time' => $s->format( 'H:i' ), 'past' => $t + $dur * 60 < $now, 'free' => $free );
			}
		}
		return self::ok( array( 'date' => $date, 'duration' => $dur, 'slots' => $out ) );
	}

	public static function create( WP_REST_Request $req ) {
		global $wpdb;
		list( $ids, $services, $dur, $sum ) = self::services_of( $req->get_param( 'services' ) );
		$name   = sanitize_text_field( (string) $req->get_param( 'name' ) );
		$phone  = RB_REST::normalize_phone( $req->get_param( 'phone' ) );
		$email  = sanitize_email( (string) $req->get_param( 'email' ) );
		$date   = (string) $req->get_param( 'date' );
		$time   = (string) $req->get_param( 'time' );
		$source = sanitize_key( (string) $req->get_param( 'source' ) );
		$source = array_key_exists( $source, rb_source_labels() ) ? $source : 'phone';
		if ( ! $ids ) {
			return self::err( 'Chọn ít nhất 1 dịch vụ.' );
		}
		if ( mb_strlen( $name ) < 2 ) {
			return self::err( 'Nhập tên khách.' );
		}
		if ( ! RB_REST::valid_phone( $phone ) ) {
			return self::err( 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).' );
		}
		if ( ! self::valid_date( $date ) || ! preg_match( '/^\d{2}:\d{2}$/', $time ) ) {
			return self::err( 'Chọn ngày giờ hẹn.' );
		}
		$tz    = self::tz();
		$start = new DateTimeImmutable( $date . ' ' . $time, $tz );
		$end   = $start->modify( '+' . $dur . ' minutes' );
		$hours = self::within_hours( $start, $end );
		if ( true !== $hours ) {
			return self::err( $hours );
		}
		$staff_id = (int) $req->get_param( 'staff_id' );
		$auto     = 0;
		if ( ! $staff_id ) {
			$free = self::free_staff( $ids, $start, $end );
			if ( ! $free ) {
				return self::err( 'Không còn kỹ thuật viên trống vào giờ này.' );
			}
			$staff_id = $free[0]['id'];
			$auto     = 1;
		}
		$chk = self::staff_check( $staff_id, $ids, $start, $end );
		if ( true !== $chk ) {
			return self::err( $chk );
		}
		$status = 'walkin' === $source && $start->getTimestamp() <= time() + 15 * MINUTE_IN_SECONDS ? 'in_progress' : 'confirmed';
		$code   = 'RB-' . $start->format( 'dm' ) . '-' . strtoupper( wp_generate_password( 3, false, false ) );
		$wpdb->insert( RB_DB::table( 'bookings' ), array(
			'code'          => $code,
			'customer_name' => $name,
			'phone'         => $phone,
			'email'         => $email,
			'note'          => sanitize_textarea_field( (string) $req->get_param( 'note' ) ),
			'service_ids'   => implode( ',', $ids ),
			'services_json' => wp_json_encode( $services ),
			'staff_id'      => $staff_id,
			'staff_auto'    => $auto,
			'start_at'      => $start->format( 'Y-m-d H:i:s' ),
			'end_at'        => $end->format( 'Y-m-d H:i:s' ),
			'total'         => $sum,
			'status'        => $status,
			'source'        => $source,
			'image_ids'     => '',
			'admin_note'    => sanitize_textarea_field( (string) $req->get_param( 'admin_note' ) ),
			'created_by'    => get_current_user_id(),
			'created_at'    => current_time( 'mysql' ),
			'updated_at'    => current_time( 'mysql' ),
		) );
		$id = (int) $wpdb->insert_id;
		if ( ! $id ) {
			return self::err( 'Không lưu được lịch hẹn.', 500 );
		}
		$labels = rb_source_labels();
		RB_DB::log( $id, 'created', 'Tạo tại quầy · ' . $labels[ $source ] );
		if ( is_email( $email ) ) {
			RB_Mail::status_changed( $id );
		}
		return self::ok( array( 'booking' => self::view( RB_DB::get_booking( $id ) ) ) );
	}

	/* =========================================================
	 * FR15 – khách hàng & lịch sử
	 * ======================================================= */

	public static function customers( WP_REST_Request $req ) {
		global $wpdb;
		$t     = RB_DB::table( 'bookings' );
		$q     = trim( sanitize_text_field( (string) $req->get_param( 'q' ) ) );
		$where = '1=1';
		$args  = array();
		if ( '' !== $q ) {
			$like  = '%' . $wpdb->esc_like( $q ) . '%';
			$where = '(customer_name LIKE %s OR phone LIKE %s)';
			$args  = array( $like, '%' . $wpdb->esc_like( preg_replace( '/\D/', '', $q ) ?: $q ) . '%' );
		}
		$sql  = "SELECT phone, MAX(customer_name) AS name, MAX(email) AS email, COUNT(*) AS visits,
			SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done,
			SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) AS no_show,
			SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
			SUM(CASE WHEN status = 'done' THEN total ELSE 0 END) AS spent,
			MIN(start_at) AS first_at, MAX(start_at) AS last_at
			FROM $t WHERE $where GROUP BY phone ORDER BY last_at DESC LIMIT 300";
		$rows = $args ? $wpdb->get_results( $wpdb->prepare( $sql, $args ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore
		return self::ok( array( 'customers' => array_map( function ( $r ) {
			foreach ( array( 'visits', 'done', 'no_show', 'cancelled', 'spent' ) as $k ) {
				$r[ $k ] = (int) $r[ $k ];
			}
			return $r;
		}, (array) $rows ) ) );
	}

	public static function customer( WP_REST_Request $req ) {
		global $wpdb;
		$phone = RB_REST::normalize_phone( $req->get_param( 'phone' ) );
		$t     = RB_DB::table( 'bookings' );
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $t WHERE phone = %s ORDER BY start_at DESC LIMIT 100", $phone ), ARRAY_A );
		if ( ! $rows ) {
			return self::ok( array( 'found' => false, 'bookings' => array() ) );
		}
		$names = self::staff_names();
		$list  = array_map( function ( $b ) use ( $names ) {
			return RB_Admin_API::view( $b, $names );
		}, $rows );
		$fav = array();
		foreach ( $list as $b ) {
			if ( 'done' === $b['status'] ) {
				foreach ( $b['services'] as $s ) {
					$fav[ $s['name'] ] = ( $fav[ $s['name'] ] ?? 0 ) + 1;
				}
			}
		}
		arsort( $fav );
		return self::ok( array(
			'found'    => true,
			'name'     => $rows[0]['customer_name'],
			'phone'    => $phone,
			'email'    => (string) $rows[0]['email'],
			'favorite' => array_slice( array_keys( $fav ), 0, 3 ),
			'bookings' => $list,
		) );
	}

	/* =========================================================
	 * FR13 – báo cáo & xuất file
	 * ======================================================= */

	private static function range( WP_REST_Request $req ) {
		$tz   = self::tz();
		$to   = self::valid_date( $req->get_param( 'to' ) ) ? $req->get_param( 'to' ) : ( new DateTimeImmutable( 'today', $tz ) )->format( 'Y-m-d' );
		$from = self::valid_date( $req->get_param( 'from' ) ) ? $req->get_param( 'from' ) : ( new DateTimeImmutable( $to, $tz ) )->modify( '-29 days' )->format( 'Y-m-d' );
		if ( $from > $to ) {
			list( $from, $to ) = array( $to, $from );
		}
		return array( $from, $to );
	}

	private static function rows_in_range( $from, $to ) {
		global $wpdb;
		$t = RB_DB::table( 'bookings' );
		return (array) $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $t WHERE start_at >= %s AND start_at <= %s ORDER BY start_at ASC", $from . ' 00:00:00', $to . ' 23:59:59' ), ARRAY_A );
	}

	public static function report( WP_REST_Request $req ) {
		global $wpdb;
		list( $from, $to ) = self::range( $req );
		$rows   = self::rows_in_range( $from, $to );
		$names  = self::staff_names();
		$tz     = self::tz();
		$tot    = array( 'bookings' => count( $rows ), 'pending' => 0, 'confirmed' => 0, 'in_progress' => 0, 'done' => 0, 'cancelled' => 0, 'no_show' => 0, 'revenue' => 0, 'minutes' => 0 );
		$days   = array();
		$staff  = array();
		$svc    = array();
		$src    = array();
		$hours  = array_fill( 8, 13, 0 );
		$phones = array();

		for ( $d = new DateTimeImmutable( $from, $tz ); $d->format( 'Y-m-d' ) <= $to; $d = $d->modify( '+1 day' ) ) {
			$days[ $d->format( 'Y-m-d' ) ] = array( 'date' => $d->format( 'Y-m-d' ), 'bookings' => 0, 'done' => 0, 'revenue' => 0 );
		}
		foreach ( $rows as $b ) {
			$st  = $b['status'];
			$day = substr( $b['start_at'], 0, 10 );
			$tot[ $st ] = ( $tot[ $st ] ?? 0 ) + 1;
			$days[ $day ]['bookings']++;
			$s_key = (string) ( $b['source'] ?: 'web' );
			$src[ $s_key ] = ( $src[ $s_key ] ?? 0 ) + 1;
			$h = (int) substr( $b['start_at'], 11, 2 );
			if ( isset( $hours[ $h ] ) && ! in_array( $st, array( 'cancelled' ), true ) ) {
				$hours[ $h ]++;
			}
			$phones[ $b['phone'] ] = true;
			$sid = (int) $b['staff_id'];
			if ( ! isset( $staff[ $sid ] ) ) {
				$staff[ $sid ] = array( 'name' => $names[ $sid ] ?? 'Chưa gán', 'bookings' => 0, 'done' => 0, 'revenue' => 0, 'minutes' => 0, 'no_show' => 0 );
			}
			$staff[ $sid ]['bookings']++;
			if ( 'no_show' === $st ) {
				$staff[ $sid ]['no_show']++;
			}
			if ( 'done' === $st ) {
				$mins = (int) round( ( strtotime( $b['end_at'] ) - strtotime( $b['start_at'] ) ) / 60 );
				$tot['revenue']          += (int) $b['total'];
				$tot['minutes']          += $mins;
				$days[ $day ]['done']++;
				$days[ $day ]['revenue'] += (int) $b['total'];
				$staff[ $sid ]['done']++;
				$staff[ $sid ]['revenue'] += (int) $b['total'];
				$staff[ $sid ]['minutes'] += $mins;
				foreach ( (array) json_decode( (string) $b['services_json'], true ) as $s ) {
					$k = $s['name'];
					if ( ! isset( $svc[ $k ] ) ) {
						$svc[ $k ] = array( 'name' => $k, 'count' => 0, 'revenue' => 0 );
					}
					$svc[ $k ]['count']++;
					$svc[ $k ]['revenue'] += (int) $s['price'];
				}
			}
		}
		// Khách mới = lần đặt đầu tiên nằm trong khoảng này.
		$new = 0;
		if ( $phones ) {
			$t = RB_DB::table( 'bookings' );
			foreach ( array_keys( $phones ) as $p ) {
				$first = $wpdb->get_var( $wpdb->prepare( "SELECT MIN(start_at) FROM $t WHERE phone = %s", $p ) );
				if ( $first && substr( $first, 0, 10 ) >= $from ) {
					$new++;
				}
			}
		}
		usort( $svc, function ( $a, $b ) {
			return $b['count'] - $a['count'];
		} );
		$staff = array_values( $staff );
		usort( $staff, function ( $a, $b ) {
			return $b['revenue'] - $a['revenue'];
		} );
		$labels = rb_source_labels();
		$src_out = array();
		foreach ( $src as $k => $v ) {
			$src_out[] = array( 'source' => $k, 'label' => $labels[ $k ] ?? $k, 'count' => $v );
		}
		$hours_out = array();
		foreach ( $hours as $h => $v ) {
			$hours_out[] = array( 'hour' => $h, 'count' => $v );
		}
		$served = $tot['done'] + $tot['no_show'];
		return self::ok( array(
			'from'      => $from,
			'to'        => $to,
			'totals'    => $tot,
			'customers' => array( 'unique' => count( $phones ), 'new' => $new, 'returning' => count( $phones ) - $new ),
			'rates'     => array(
				'done'    => $tot['bookings'] ? round( 100 * $tot['done'] / $tot['bookings'] ) : 0,
				'cancel'  => $tot['bookings'] ? round( 100 * $tot['cancelled'] / $tot['bookings'] ) : 0,
				'no_show' => $served ? round( 100 * $tot['no_show'] / $served ) : 0,
				'online'  => $tot['bookings'] ? round( 100 * ( $src['web'] ?? 0 ) / $tot['bookings'] ) : 0,
			),
			'days'      => array_values( $days ),
			'staff'     => $staff,
			'services'  => array_slice( $svc, 0, 8 ),
			'sources'   => $src_out,
			'hours'     => $hours_out,
		) );
	}

	public static function export( WP_REST_Request $req ) {
		list( $from, $to ) = self::range( $req );
		$rows    = self::rows_in_range( $from, $to );
		$names   = self::staff_names();
		$labels  = rb_status_labels();
		$sources = rb_source_labels();
		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="lich-hen-' . $from . '_' . $to . '.csv"' );
		$out = fopen( 'php://output', 'w' );
		fwrite( $out, "\xEF\xBB\xBF" ); // UTF-8 BOM để Excel đọc đúng tiếng Việt.
		fputcsv( $out, array( 'Mã lịch hẹn', 'Ngày', 'Giờ bắt đầu', 'Giờ kết thúc', 'Khách hàng', 'Số điện thoại', 'Dịch vụ', 'Kỹ thuật viên', 'Tổng tiền (đ)', 'Trạng thái', 'Nguồn', 'Ghi chú của khách', 'Ghi chú nội bộ', 'Lý do hủy', 'Thời điểm đặt' ) );
		foreach ( $rows as $b ) {
			$svc = array_map( function ( $s ) {
				return $s['name'];
			}, (array) json_decode( (string) $b['services_json'], true ) );
			fputcsv( $out, array(
				$b['code'],
				substr( $b['start_at'], 8, 2 ) . '/' . substr( $b['start_at'], 5, 2 ) . '/' . substr( $b['start_at'], 0, 4 ),
				substr( $b['start_at'], 11, 5 ),
				substr( $b['end_at'], 11, 5 ),
				$b['customer_name'],
				"'" . $b['phone'],
				implode( ' + ', $svc ),
				$names[ $b['staff_id'] ] ?? '',
				(int) $b['total'],
				$labels[ $b['status'] ] ?? $b['status'],
				$sources[ $b['source'] ?: 'web' ] ?? $b['source'],
				$b['note'],
				$b['admin_note'] ?? '',
				$b['cancel_reason'] ?? '',
				$b['created_at'],
			) );
		}
		fclose( $out );
		exit;
	}

	/* =========================================================
	 * Tài khoản nhân viên (chỉ chủ tiệm)
	 * ======================================================= */

	private static function user_view( WP_User $u, $staff_by_user ) {
		$role = RB_Roles::user_role( $u );
		return array(
			'id'        => $u->ID,
			'name'      => $u->display_name,
			'login'     => $u->user_login,
			'email'     => $u->user_email,
			'phone'     => (string) get_user_meta( $u->ID, 'ruby_phone', true ),
			'role'      => $role,
			'roleLabel' => $role ? RB_Roles::role_label( $role ) : 'Không có quyền',
			'staff_id'  => isset( $staff_by_user[ $u->ID ] ) ? $staff_by_user[ $u->ID ] : 0,
			'self'      => get_current_user_id() === $u->ID,
		);
	}

	public static function users( WP_REST_Request $req ) {
		$staff_by_user = array();
		foreach ( RB_DB::get_staff_list( false ) as $s ) {
			if ( $s['user_id'] ) {
				$staff_by_user[ $s['user_id'] ] = $s['id'];
			}
		}
		$users = get_users( array( 'role__in' => array( 'administrator', 'ruby_chu_tiem', 'ruby_le_tan', 'ruby_ktv' ), 'orderby' => 'display_name' ) );
		return self::ok( array( 'users' => array_map( function ( $u ) use ( $staff_by_user ) {
			return RB_Admin_API::user_view( $u, $staff_by_user );
		}, $users ) ) );
	}

	private static function link_staff( $user_id, $staff_id ) {
		global $wpdb;
		$t = RB_DB::table( 'staff' );
		$wpdb->update( $t, array( 'user_id' => 0 ), array( 'user_id' => (int) $user_id ) );
		if ( $staff_id ) {
			$wpdb->update( $t, array( 'user_id' => (int) $user_id ), array( 'id' => (int) $staff_id ) );
		}
	}

	public static function create_user( WP_REST_Request $req ) {
		$roles = RB_Roles::roles();
		$role  = sanitize_key( (string) $req->get_param( 'role' ) );
		$name  = sanitize_text_field( (string) $req->get_param( 'name' ) );
		$login = sanitize_user( (string) $req->get_param( 'login' ), true );
		$email = sanitize_email( (string) $req->get_param( 'email' ) );
		$pass  = (string) $req->get_param( 'password' );
		$staff = (int) $req->get_param( 'staff_id' );
		$phone = RB_REST::normalize_phone( $req->get_param( 'phone' ) );
		if ( ! isset( $roles[ $role ] ) ) {
			return self::err( 'Chọn vai trò.' );
		}
		if ( '' !== $phone && ! RB_REST::valid_phone( $phone ) ) {
			return self::err( 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).' );
		}
		if ( mb_strlen( $name ) < 2 || strlen( $login ) < 3 ) {
			return self::err( 'Nhập họ tên và tên đăng nhập (ít nhất 3 ký tự, không dấu).' );
		}
		if ( username_exists( $login ) ) {
			return self::err( 'Tên đăng nhập đã tồn tại.' );
		}
		if ( ! is_email( $email ) ) {
			return self::err( 'Email chưa đúng.' );
		}
		if ( email_exists( $email ) ) {
			return self::err( 'Email này đã có tài khoản.' );
		}
		if ( strlen( $pass ) < 8 ) {
			return self::err( 'Mật khẩu cần ít nhất 8 ký tự.' );
		}
		if ( 'ruby_ktv' === $role && ! $staff ) {
			return self::err( 'Chọn kỹ thuật viên tương ứng với tài khoản này.' );
		}
		$id = wp_insert_user( array(
			'user_login'   => $login,
			'user_pass'    => $pass,
			'user_email'   => $email,
			'display_name' => $name,
			'first_name'   => $name,
			'role'         => $role,
		) );
		if ( is_wp_error( $id ) ) {
			return self::err( $id->get_error_message() );
		}
		if ( '' !== $phone ) {
			update_user_meta( $id, 'ruby_phone', $phone ); // trường SĐT của trang Tài khoản của nhóm
		}
		self::link_staff( $id, 'ruby_ktv' === $role ? $staff : 0 );
		return self::users( $req );
	}

	public static function update_user( WP_REST_Request $req ) {
		$u = get_userdata( (int) $req['id'] );
		if ( ! $u ) {
			return self::err( 'Không tìm thấy tài khoản.', 404 );
		}
		if ( in_array( 'administrator', (array) $u->roles, true ) ) {
			return self::err( 'Không sửa tài khoản quản trị viên ở đây.' );
		}
		if ( get_current_user_id() === $u->ID ) {
			return self::err( 'Không tự đổi quyền của chính mình.' );
		}
		$roles = RB_Roles::roles();
		$role  = sanitize_key( (string) $req->get_param( 'role' ) );
		$staff = (int) $req->get_param( 'staff_id' );
		if ( 'none' === $role ) {
			foreach ( array_keys( $roles ) as $r ) {
				$u->remove_role( $r );
			}
			if ( ! $u->roles ) {
				$u->set_role( 'subscriber' );
			}
			self::link_staff( $u->ID, 0 );
			return self::users( $req );
		}
		if ( ! isset( $roles[ $role ] ) ) {
			return self::err( 'Vai trò không hợp lệ.' );
		}
		if ( 'ruby_ktv' === $role && ! $staff ) {
			return self::err( 'Chọn kỹ thuật viên tương ứng.' );
		}
		$u->set_role( $role );
		self::link_staff( $u->ID, 'ruby_ktv' === $role ? $staff : 0 );
		$pass = (string) $req->get_param( 'password' );
		if ( '' !== $pass ) {
			if ( strlen( $pass ) < 8 ) {
				return self::err( 'Mật khẩu cần ít nhất 8 ký tự.' );
			}
			wp_set_password( $pass, $u->ID );
		}
		return self::users( $req );
	}

	/* =========================================================
	 * Dịch vụ, kỹ thuật viên, cài đặt (FR17) – chủ tiệm
	 * ======================================================= */

	public static function catalog( WP_REST_Request $req = null ) {
		global $wpdb;
		$t        = RB_DB::table( 'bookings' );
		$services = array_map( function ( $s ) use ( $wpdb, $t ) {
			$s['image_thumb'] = $s['image_id'] ? (string) wp_get_attachment_image_url( $s['image_id'], 'thumbnail' ) : '';
			return $s;
		}, RB_DB::get_services( false ) );
		$staff = array_map( function ( $s ) {
			$u              = $s['user_id'] ? get_userdata( $s['user_id'] ) : null;
			$s['user_name'] = $u ? $u->display_name . ' (' . $u->user_login . ')' : '';
			return $s;
		}, RB_DB::get_staff_list( false ) );
		$set = rb_settings();
		return self::ok( array( 'services' => $services, 'staff' => $staff, 'settings' => $set ) );
	}

	private static function categories() {
		return array( 'nail' => 'Nail', 'mi' => 'Mi', 'combo' => 'Combo' );
	}

	public static function save_service( WP_REST_Request $req ) {
		global $wpdb;
		$id   = (int) $req['id'];
		$name = sanitize_text_field( (string) $req->get_param( 'name' ) );
		$cat  = sanitize_key( (string) $req->get_param( 'category' ) );
		if ( mb_strlen( $name ) < 2 ) {
			return self::err( 'Nhập tên dịch vụ.' );
		}
		$price = (int) $req->get_param( 'price' );
		$dur   = (int) $req->get_param( 'duration' );
		if ( $price < 0 ) {
			return self::err( 'Giá không hợp lệ.' );
		}
		if ( $dur < 10 || $dur > 600 ) {
			return self::err( 'Thời lượng từ 10 đến 600 phút.' );
		}
		$data = array(
			'name'        => $name,
			'category'    => array_key_exists( $cat, self::categories() ) ? $cat : 'nail',
			'description' => sanitize_textarea_field( (string) $req->get_param( 'description' ) ),
			'price'       => $price,
			'duration'    => $dur,
			'image_id'    => max( 0, (int) $req->get_param( 'image_id' ) ),
			'detail_url'  => esc_url_raw( (string) $req->get_param( 'detail_url' ) ),
			'active'      => $req->get_param( 'active' ) ? 1 : 0,
			'sort_order'  => (int) $req->get_param( 'sort_order' ),
		);
		$st = RB_DB::table( 'services' );
		if ( $id ) {
			if ( ! RB_DB::get_service( $id ) ) {
				return self::err( 'Không tìm thấy dịch vụ.', 404 );
			}
			$wpdb->update( $st, $data, array( 'id' => $id ) );
		} else {
			$wpdb->insert( $st, $data );
		}
		return self::catalog();
	}

	public static function delete_service( WP_REST_Request $req ) {
		global $wpdb;
		$id = (int) $req['id'];
		$t  = RB_DB::table( 'bookings' );
		// Dịch vụ đã có lịch hẹn: chỉ ẩn, giữ lại để báo cáo và lịch sử còn đúng.
		$used = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $t WHERE CONCAT(',', service_ids, ',') LIKE %s", '%,' . $id . ',%' ) );
		if ( $used ) {
			$wpdb->update( RB_DB::table( 'services' ), array( 'active' => 0 ), array( 'id' => $id ) );
			$r = self::catalog();
			$r->set_data( array_merge( $r->get_data(), array( 'message' => 'Dịch vụ đã có ' . $used . ' lịch hẹn nên được ẩn thay vì xóa.' ) ) );
			return $r;
		}
		$wpdb->delete( RB_DB::table( 'services' ), array( 'id' => $id ) );
		return self::catalog();
	}

	public static function save_staff( WP_REST_Request $req ) {
		global $wpdb;
		$id   = (int) $req['id'];
		$name = sanitize_text_field( (string) $req->get_param( 'name' ) );
		if ( mb_strlen( $name ) < 2 ) {
			return self::err( 'Nhập tên kỹ thuật viên.' );
		}
		$ids  = array_values( array_filter( array_map( 'intval', (array) $req->get_param( 'service_ids' ) ) ) );
		$data = array(
			'name'        => $name,
			'title'       => sanitize_text_field( (string) $req->get_param( 'title' ) ),
			'photo_id'    => max( 0, (int) $req->get_param( 'photo_id' ) ),
			'service_ids' => implode( ',', $ids ),
			'active'      => $req->get_param( 'active' ) ? 1 : 0,
			'sort_order'  => (int) $req->get_param( 'sort_order' ),
		);
		$st = RB_DB::table( 'staff' );
		if ( $id ) {
			if ( ! RB_DB::get_staff( $id ) ) {
				return self::err( 'Không tìm thấy kỹ thuật viên.', 404 );
			}
			$wpdb->update( $st, $data, array( 'id' => $id ) );
		} else {
			$wpdb->insert( $st, $data );
		}
		return self::catalog();
	}

	public static function delete_staff( WP_REST_Request $req ) {
		global $wpdb;
		$id = (int) $req['id'];
		$t  = RB_DB::table( 'bookings' );
		$upcoming = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $t WHERE staff_id = %d AND status IN ('pending','confirmed','in_progress') AND start_at >= %s", $id, current_time( 'mysql' ) ) );
		if ( $upcoming ) {
			return self::err( 'Thợ này còn ' . $upcoming . ' lịch hẹn sắp tới. Hãy chuyển các lịch đó cho thợ khác, hoặc tắt "Nhận lịch" để tạm ngưng.' );
		}
		$any = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $t WHERE staff_id = %d", $id ) );
		if ( $any ) {
			$wpdb->update( RB_DB::table( 'staff' ), array( 'active' => 0, 'user_id' => 0 ), array( 'id' => $id ) );
			$r = self::catalog();
			$r->set_data( array_merge( $r->get_data(), array( 'message' => 'Thợ đã có lịch sử làm việc nên được ẩn thay vì xóa (báo cáo vẫn giữ đúng).' ) ) );
			return $r;
		}
		$wpdb->delete( RB_DB::table( 'staff' ), array( 'id' => $id ) );
		return self::catalog();
	}

	public static function save_settings( WP_REST_Request $req ) {
		$p = $req->get_json_params();
		if ( ! is_array( $p ) ) {
			$p = $req->get_params();
		}
		$new = RB_Admin::sanitize_settings( $p );
		if ( ! $new['open_days'] ) {
			return self::err( 'Chọn ít nhất 1 ngày mở cửa.' );
		}
		if ( $new['open_time'] >= $new['close_time'] ) {
			return self::err( 'Giờ đóng cửa phải sau giờ mở cửa.' );
		}
		update_option( 'rb_settings', $new );
		return self::catalog();
	}

	/** Image upload for service / technician photos (JPG, PNG, WEBP ≤ 5MB). */
	public static function upload( WP_REST_Request $req ) {
		$files = $req->get_file_params();
		if ( empty( $files['file'] ) || UPLOAD_ERR_OK !== (int) $files['file']['error'] ) {
			return self::err( 'Chưa chọn ảnh hoặc tải ảnh thất bại.' );
		}
		$f = $files['file'];
		if ( $f['size'] > 5 * MB_IN_BYTES ) {
			return self::err( 'Ảnh tối đa 5MB.' );
		}
		$allowed = array( 'jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' );
		$check   = wp_check_filetype_and_ext( $f['tmp_name'], $f['name'], $allowed );
		if ( empty( $check['type'] ) || ! @getimagesize( $f['tmp_name'] ) ) { // phpcs:ignore
			return self::err( 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.' );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		$_FILES['file'] = $f;
		$id = media_handle_upload( 'file', 0, array(), array( 'test_form' => false, 'mimes' => $allowed ) );
		if ( is_wp_error( $id ) ) {
			return self::err( $id->get_error_message() );
		}
		return self::ok( array( 'id' => (int) $id, 'thumb' => wp_get_attachment_image_url( $id, 'thumbnail' ), 'url' => wp_get_attachment_image_url( $id, 'medium_large' ) ) );
	}

	/* =========================================================
	 * Lịch mới (cho loa thông báo)
	 * ======================================================= */

	public static function feed( WP_REST_Request $req ) {
		global $wpdb;
		$t     = RB_DB::table( 'bookings' );
		$after = (int) $req->get_param( 'after' );
		if ( ! $after ) {
			return self::ok( array( 'last' => (int) $wpdb->get_var( "SELECT MAX(id) FROM $t" ), 'bookings' => array() ) );
		}
		$where = 'id > %d';
		$args  = array( $after );
		if ( ! current_user_can( 'rb_manage' ) ) {
			$where .= ' AND staff_id = %d';
			$args[] = self::my_staff_id();
		}
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $t WHERE $where ORDER BY id ASC LIMIT 20", $args ), ARRAY_A );
		$names = self::staff_names();
		$list  = array_map( function ( $b ) use ( $names ) {
			return RB_Admin_API::view( $b, $names );
		}, (array) $rows );
		$last  = $rows ? (int) end( $rows )['id'] : $after;
		$pending = current_user_can( 'rb_manage' ) ? (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $t WHERE status = 'pending' AND start_at >= %s", ( new DateTimeImmutable( 'today', self::tz() ) )->format( 'Y-m-d H:i:s' ) ) ) : 0;
		return self::ok( array( 'last' => $last, 'bookings' => $list, 'pending_all' => $pending ) );
	}
}
