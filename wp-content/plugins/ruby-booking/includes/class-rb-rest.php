<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_REST {

	const NS = 'ruby-booking/v1';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
	}

	public static function routes() {
		register_rest_route( self::NS, '/slots', array(
			'methods'             => 'GET',
			'callback'            => array( __CLASS__, 'slots' ),
			'permission_callback' => '__return_true',
		) );
		register_rest_route( self::NS, '/bookings', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'create' ),
			'permission_callback' => '__return_true',
		) );
		register_rest_route( self::NS, '/lookup', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'lookup' ),
			'permission_callback' => '__return_true',
		) );
		register_rest_route( self::NS, '/my-bookings', array(
			'methods'             => 'GET',
			'callback'            => array( __CLASS__, 'my_bookings' ),
			'permission_callback' => 'is_user_logged_in',
		) );
		register_rest_route( self::NS, '/my-bookings/(?P<id>\d+)/cancel', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'my_cancel' ),
			'permission_callback' => 'is_user_logged_in',
		) );
		register_rest_route( self::NS, '/cancel', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'cancel' ),
			'permission_callback' => '__return_true',
		) );
	}

	/* ---------- Helpers ---------- */

	private static function error( $message, $status = 400 ) {
		return new WP_REST_Response( array( 'ok' => false, 'message' => $message ), $status );
	}

	private static function ip() {
		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	}

	/** Simple per-IP limiter. */
	private static function too_many( $action, $limit, $window ) {
		$key   = 'rb_rl_' . $action . '_' . md5( self::ip() );
		$count = (int) get_transient( $key );
		if ( $count >= $limit ) {
			return true;
		}
		set_transient( $key, $count + 1, $window );
		return false;
	}

	public static function normalize_phone( $phone ) {
		$p = preg_replace( '/\D/', '', (string) $phone );
		if ( 0 === strpos( $p, '84' ) && strlen( $p ) === 11 ) {
			$p = '0' . substr( $p, 2 );
		}
		return $p;
	}

	public static function valid_phone( $p ) {
		return (bool) preg_match( '/^0[35789]\d{8}$/', $p );
	}

	/**
	 * Resolve service IDs into active service rows + totals.
	 */
	private static function resolve_services( $raw ) {
		$ids = is_array( $raw ) ? $raw : explode( ',', (string) $raw );
		$ids = array_values( array_unique( array_filter( array_map( 'intval', $ids ) ) ) );
		$out = array();
		$dur = 0;
		$sum = 0;
		foreach ( $ids as $id ) {
			$s = RB_DB::get_service( $id );
			if ( $s && $s['active'] ) {
				$out[] = $s;
				$dur  += $s['duration'];
				$sum  += $s['price'];
			}
		}
		return array( wp_list_pluck( $out, 'id' ), $out, $dur, $sum );
	}

	/* ---------- Endpoints ---------- */

	public static function slots( WP_REST_Request $req ) {
		list( $ids, , $dur ) = self::resolve_services( $req->get_param( 'services' ) );
		if ( ! $ids ) {
			return self::error( 'Vui lòng chọn ít nhất 1 dịch vụ.' );
		}
		$slots = RB_Availability::slots( (string) $req->get_param( 'date' ), $dur, (int) $req->get_param( 'staff' ), $ids );
		if ( is_wp_error( $slots ) ) {
			return self::error( $slots->get_error_message() );
		}
		$res = new WP_REST_Response( array(
			'ok'    => true,
			'slots' => wp_list_pluck( $slots, 'time' ),
		) );
		$res->header( 'Cache-Control', 'no-store' );
		return $res;
	}

	public static function create( WP_REST_Request $req ) {
		global $wpdb;
		$set = rb_settings();

		// Honeypot: bots fill every field.
		if ( '' !== trim( (string) $req->get_param( 'website' ) ) ) {
			return self::error( 'Yêu cầu không hợp lệ.' );
		}
		if ( self::too_many( 'book', 6, HOUR_IN_SECONDS ) ) {
			return self::error( 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau hoặc gọi cho tiệm.', 429 );
		}

		list( $ids, $services, $dur, $sum ) = self::resolve_services( $req->get_param( 'services' ) );
		$name  = sanitize_text_field( (string) $req->get_param( 'name' ) );
		$phone = self::normalize_phone( $req->get_param( 'phone' ) );
		$email = sanitize_email( (string) $req->get_param( 'email' ) );
		$note  = sanitize_textarea_field( (string) $req->get_param( 'note' ) );
		$date  = (string) $req->get_param( 'date' );
		$time  = (string) $req->get_param( 'time' );
		$staff = (int) $req->get_param( 'staff' );
		$agree = in_array( (string) $req->get_param( 'agree' ), array( '1', 'true', 'on' ), true );

		$errors = array();
		if ( ! $ids ) {
			$errors['services'] = 'Vui lòng chọn ít nhất 1 dịch vụ.';
		}
		if ( mb_strlen( $name ) < 2 ) {
			$errors['name'] = 'Vui lòng nhập họ tên.';
		}
		if ( ! self::valid_phone( $phone ) ) {
			$errors['phone'] = 'Số điện thoại chưa đúng (cần 10 số, bắt đầu bằng 0).';
		}
		if ( '' !== (string) $req->get_param( 'email' ) && ! is_email( $email ) ) {
			$errors['email'] = 'Email chưa đúng định dạng.';
		}
		if ( ! preg_match( '/^\d{2}:\d{2}$/', $time ) ) {
			$errors['time'] = 'Vui lòng chọn giờ hẹn.';
		}
		if ( ! $agree ) {
			$errors['agree'] = 'Vui lòng đồng ý với chính sách hủy/đổi lịch.';
		}
		if ( $errors ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => reset( $errors ), 'errors' => $errors ), 400 );
		}

		// Validate uploads before touching the database.
		$files = self::collect_files( $req );
		if ( is_wp_error( $files ) ) {
			return self::error( $files->get_error_message() );
		}

		$picked = RB_Availability::pick_staff( $date, $time, $dur, $staff, $ids );
		if ( is_wp_error( $picked ) ) {
			return self::error( $picked->get_error_message() );
		}
		if ( ! $picked ) {
			return new WP_REST_Response( array(
				'ok'      => false,
				'code'    => 'slot_taken',
				'message' => 'Rất tiếc, khung giờ này vừa có người đặt. Vui lòng chọn giờ khác.',
			), 409 );
		}

		$tz    = wp_timezone();
		$start = new DateTimeImmutable( $date . ' ' . $time, $tz );
		$end   = $start->modify( '+' . $dur . ' minutes' );
		$code  = self::new_code( $start );

		$snapshot = array_map( function ( $s ) {
			return array( 'id' => $s['id'], 'name' => $s['name'], 'price' => $s['price'], 'duration' => $s['duration'] );
		}, $services );

		$ok = $wpdb->insert( RB_DB::table( 'bookings' ), array(
			'code'          => $code,
			'customer_name' => $name,
			'phone'         => $phone,
			'email'         => $email,
			'note'          => $note,
			'service_ids'   => implode( ',', $ids ),
			'services_json' => wp_json_encode( $snapshot ),
			'staff_id'      => $picked,
			'staff_auto'    => $staff ? 0 : 1,
			'start_at'      => $start->format( 'Y-m-d H:i:s' ),
			'end_at'        => $end->format( 'Y-m-d H:i:s' ),
			'total'         => $sum,
			'status'        => $set['auto_confirm'] ? 'confirmed' : 'pending',
			'image_ids'     => '',
			'user_id'       => get_current_user_id(), // 0 khi khách đặt không đăng nhập
			'created_at'    => current_time( 'mysql' ),
		) );
		if ( ! $ok ) {
			return self::error( 'Không lưu được lịch hẹn. Vui lòng thử lại hoặc gọi cho tiệm.', 500 );
		}
		$booking_id = (int) $wpdb->insert_id;

		// Final race check: if another booking slipped in for the same staff, roll back.
		$t       = RB_DB::table( 'bookings' );
		$overlap = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM $t WHERE id <> %d AND staff_id = %d AND status IN ('pending','confirmed','in_progress') AND start_at < %s AND end_at > %s",
			$booking_id, $picked, $end->format( 'Y-m-d H:i:s' ), $start->format( 'Y-m-d H:i:s' )
		) );
		if ( $overlap ) {
			$wpdb->delete( $t, array( 'id' => $booking_id ) );
			return new WP_REST_Response( array(
				'ok'      => false,
				'code'    => 'slot_taken',
				'message' => 'Rất tiếc, khung giờ này vừa có người đặt. Vui lòng chọn giờ khác.',
			), 409 );
		}

		$image_ids = self::store_files( $files, $booking_id, $code );
		if ( $image_ids ) {
			$wpdb->update( $t, array( 'image_ids' => implode( ',', $image_ids ) ), array( 'id' => $booking_id ) );
		}

		RB_DB::log( $booking_id, 'created', 'Khách đặt qua website' );
		RB_Mail::booking_created( $booking_id );
		do_action( 'rb_booking_created', $booking_id );

		return new WP_REST_Response( array(
			'ok'      => true,
			'booking' => RB_DB::public_booking( RB_DB::get_booking( $booking_id ) ),
		), 201 );
	}

	private static function new_code( DateTimeImmutable $start ) {
		$chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
		for ( $i = 0; $i < 20; $i++ ) {
			$rand = '';
			for ( $j = 0; $j < 3; $j++ ) {
				$rand .= $chars[ wp_rand( 0, strlen( $chars ) - 1 ) ];
			}
			$code = 'RB-' . $start->format( 'dm' ) . '-' . $rand;
			if ( ! RB_DB::get_booking_by_code( $code ) ) {
				return $code;
			}
		}
		return 'RB-' . $start->format( 'dm' ) . '-' . strtoupper( wp_generate_password( 5, false ) );
	}

	/**
	 * Normalise and validate uploaded images.
	 */
	private static function collect_files( WP_REST_Request $req ) {
		$set   = rb_settings();
		$all   = $req->get_file_params();
		$files = array();
		if ( empty( $all['images'] ) ) {
			return $files;
		}
		$f = $all['images'];
		if ( is_array( $f['name'] ) ) {
			foreach ( $f['name'] as $i => $n ) {
				$files[] = array(
					'name'     => $n,
					'type'     => $f['type'][ $i ],
					'tmp_name' => $f['tmp_name'][ $i ],
					'error'    => $f['error'][ $i ],
					'size'     => $f['size'][ $i ],
				);
			}
		} else {
			$files[] = $f;
		}
		$files = array_values( array_filter( $files, function ( $x ) {
			return UPLOAD_ERR_NO_FILE !== (int) $x['error'];
		} ) );

		if ( count( $files ) > (int) $set['max_images'] ) {
			return new WP_Error( 'rb_files', 'Chỉ được tải tối đa ' . (int) $set['max_images'] . ' ảnh.' );
		}
		$allowed = array( 'jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' );
		foreach ( $files as $x ) {
			if ( UPLOAD_ERR_OK !== (int) $x['error'] ) {
				return new WP_Error( 'rb_files', 'Tải ảnh thất bại, vui lòng thử ảnh khác.' );
			}
			if ( $x['size'] > (int) $set['max_image_mb'] * MB_IN_BYTES ) {
				return new WP_Error( 'rb_files', 'Mỗi ảnh tối đa ' . (int) $set['max_image_mb'] . 'MB.' );
			}
			$check = wp_check_filetype_and_ext( $x['tmp_name'], $x['name'], $allowed );
			if ( empty( $check['type'] ) || ! @getimagesize( $x['tmp_name'] ) ) { // phpcs:ignore
				return new WP_Error( 'rb_files', 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.' );
			}
		}
		return $files;
	}

	private static function store_files( $files, $booking_id, $code ) {
		if ( ! $files ) {
			return array();
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$allowed = array( 'jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' );
		$ids     = array();
		foreach ( $files as $i => $x ) {
			$x['name'] = strtolower( $code ) . '-' . ( $i + 1 ) . '.' . pathinfo( $x['name'], PATHINFO_EXTENSION );
			$moved     = wp_handle_upload( $x, array( 'test_form' => false, 'mimes' => $allowed, 'action' => 'rb_upload' ) );
			if ( empty( $moved['file'] ) ) {
				continue;
			}
			$att_id = wp_insert_attachment( array(
				'post_mime_type' => $moved['type'],
				'post_title'     => 'Ảnh mẫu ' . $code,
				'post_status'    => 'private',
			), $moved['file'] );
			if ( $att_id && ! is_wp_error( $att_id ) ) {
				wp_update_attachment_metadata( $att_id, wp_generate_attachment_metadata( $att_id, $moved['file'] ) );
				update_post_meta( $att_id, '_rb_booking_id', $booking_id );
				$ids[] = (int) $att_id;
			}
		}
		return $ids;
	}

	private static function find_for_customer( WP_REST_Request $req ) {
		if ( self::too_many( 'lookup', 20, 10 * MINUTE_IN_SECONDS ) ) {
			return self::error( 'Bạn tra cứu quá nhiều lần. Vui lòng thử lại sau ít phút.', 429 );
		}
		$code  = strtoupper( sanitize_text_field( (string) $req->get_param( 'code' ) ) );
		$phone = self::normalize_phone( $req->get_param( 'phone' ) );
		if ( '' === $code || '' === $phone ) {
			return self::error( 'Vui lòng nhập mã lịch hẹn và số điện thoại.' );
		}
		$b = RB_DB::get_booking_by_code( $code );
		if ( ! $b || ! hash_equals( $b['phone'], $phone ) ) {
			return self::error( 'Không tìm thấy lịch hẹn. Kiểm tra lại mã lịch hẹn và số điện thoại.', 404 );
		}
		return $b;
	}

	public static function lookup( WP_REST_Request $req ) {
		$b = self::find_for_customer( $req );
		if ( $b instanceof WP_REST_Response ) {
			return $b;
		}
		return new WP_REST_Response( array( 'ok' => true, 'booking' => RB_DB::public_booking( $b ) ) );
	}

	public static function cancel( WP_REST_Request $req ) {
		$b = self::find_for_customer( $req );
		if ( $b instanceof WP_REST_Response ) {
			return $b;
		}
		$p = RB_DB::public_booking( $b );
		if ( ! $p['can_cancel'] ) {
			$set = rb_settings();
			return self::error( 'Lịch hẹn này không thể hủy online (chỉ hủy được trước giờ hẹn ' . (int) $set['cancel_before'] . ' tiếng). Vui lòng gọi ' . $set['shop_phone'] . '.' );
		}
		RB_DB::update_status( (int) $b['id'], 'cancelled' );
		RB_DB::log( (int) $b['id'], 'cancelled', 'Khách tự hủy online' );
		RB_Mail::status_changed( (int) $b['id'] );
		return new WP_REST_Response( array( 'ok' => true, 'booking' => RB_DB::public_booking( RB_DB::get_booking( (int) $b['id'] ) ) ) );
	}

	/* ---------- Khách có tài khoản: lịch hẹn của tôi ---------- */

	/** Phone of a customer account: the team's "ruby_phone" field, or a phone-number login. */
	public static function user_phone( $user_id ) {
		$p = self::normalize_phone( get_user_meta( $user_id, 'ruby_phone', true ) );
		if ( ! self::valid_phone( $p ) ) {
			$u = get_userdata( $user_id );
			$p = $u ? self::normalize_phone( $u->user_login ) : '';
		}
		return self::valid_phone( $p ) ? $p : '';
	}

	private static function mine_where( $user_id ) {
		global $wpdb;
		$phone = self::user_phone( $user_id );
		return $phone
			? $wpdb->prepare( '(user_id = %d OR phone = %s)', $user_id, $phone )
			: $wpdb->prepare( 'user_id = %d', $user_id );
	}

	public static function my_bookings( WP_REST_Request $req ) {
		global $wpdb;
		$uid  = get_current_user_id();
		$t    = RB_DB::table( 'bookings' );
		$rows = $wpdb->get_results( "SELECT * FROM $t WHERE " . self::mine_where( $uid ) . ' ORDER BY start_at DESC LIMIT 100', ARRAY_A ); // phpcs:ignore
		$now  = current_time( 'mysql' );
		$up   = array();
		$past = array();
		foreach ( (array) $rows as $b ) {
			$v       = RB_DB::public_booking( $b );
			$v['id'] = (int) $b['id'];
			if ( $b['end_at'] >= $now && in_array( $b['status'], array( 'pending', 'confirmed', 'in_progress' ), true ) ) {
				array_unshift( $up, $v ); // sắp tới: gần nhất trước
			} else {
				$past[] = $v;
			}
		}
		$res = new WP_REST_Response( array( 'ok' => true, 'phone' => self::user_phone( $uid ), 'upcoming' => $up, 'past' => $past ) );
		$res->header( 'Cache-Control', 'no-store' );
		return $res;
	}

	public static function my_cancel( WP_REST_Request $req ) {
		global $wpdb;
		$uid = get_current_user_id();
		$t   = RB_DB::table( 'bookings' );
		$b   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE id = %d AND ", (int) $req['id'] ) . self::mine_where( $uid ), ARRAY_A ); // phpcs:ignore
		if ( ! $b ) {
			return self::error( 'Không tìm thấy lịch hẹn.', 404 );
		}
		$p = RB_DB::public_booking( $b );
		if ( ! $p['can_cancel'] ) {
			$set = rb_settings();
			return self::error( 'Lịch hẹn này không thể hủy online (chỉ hủy được trước giờ hẹn ' . (int) $set['cancel_before'] . ' tiếng). Vui lòng gọi ' . $set['shop_phone'] . '.' );
		}
		RB_DB::update_status( (int) $b['id'], 'cancelled' );
		$wpdb->update( $t, array( 'cancel_reason' => 'Khách tự hủy trên trang tài khoản' ), array( 'id' => (int) $b['id'] ) );
		RB_DB::log( (int) $b['id'], 'cancelled', 'Khách tự hủy trên trang tài khoản' );
		RB_Mail::status_changed( (int) $b['id'] );
		return self::my_bookings( $req );
	}
}
