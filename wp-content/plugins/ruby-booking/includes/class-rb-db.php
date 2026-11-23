<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_DB {

	const DB_VERSION = '1.4';

	public static function table( $name ) {
		global $wpdb;
		return $wpdb->prefix . 'rb_' . $name;
	}

	public static function activate() {
		self::install();
		self::seed();
		RB_Roles::install();
		RB_Portal::ensure_page();
	}

	public static function maybe_upgrade() {
		if ( get_option( 'rb_db_version' ) !== self::DB_VERSION ) {
			self::install();
		}
		if ( get_option( 'rb_roles_version' ) !== RB_Roles::VERSION ) {
			RB_Roles::install();
		}
		RB_Portal::ensure_page();
	}

	public static function install() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();

		$services = self::table( 'services' );
		$staff    = self::table( 'staff' );
		$bookings = self::table( 'bookings' );

		dbDelta( "CREATE TABLE $services (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(191) NOT NULL,
  category varchar(50) NOT NULL DEFAULT 'nail',
  description text NULL,
  price int(11) NOT NULL DEFAULT 0,
  duration int(11) NOT NULL DEFAULT 60,
  image_id bigint(20) unsigned NOT NULL DEFAULT 0,
  detail_url varchar(255) NOT NULL DEFAULT '',
  active tinyint(1) NOT NULL DEFAULT 1,
  sort_order int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY  (id)
) $charset;" );

		dbDelta( "CREATE TABLE $staff (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(191) NOT NULL,
  title varchar(191) NULL,
  photo_id bigint(20) unsigned NOT NULL DEFAULT 0,
  user_id bigint(20) unsigned NOT NULL DEFAULT 0,
  service_ids text NULL,
  active tinyint(1) NOT NULL DEFAULT 1,
  sort_order int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY  (id)
) $charset;" );

		dbDelta( "CREATE TABLE $bookings (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  code varchar(20) NOT NULL,
  customer_name varchar(191) NOT NULL,
  phone varchar(20) NOT NULL,
  email varchar(191) NULL,
  note text NULL,
  service_ids text NULL,
  services_json longtext NULL,
  staff_id bigint(20) unsigned NOT NULL DEFAULT 0,
  staff_auto tinyint(1) NOT NULL DEFAULT 0,
  start_at datetime NOT NULL,
  end_at datetime NOT NULL,
  total int(11) NOT NULL DEFAULT 0,
  status varchar(20) NOT NULL DEFAULT 'pending',
  source varchar(20) NOT NULL DEFAULT 'web',
  image_ids text NULL,
  admin_note text NULL,
  cancel_reason text NULL,
  created_by bigint(20) unsigned NOT NULL DEFAULT 0,
  user_id bigint(20) unsigned NOT NULL DEFAULT 0,
  created_at datetime NOT NULL,
  updated_at datetime NULL,
  PRIMARY KEY  (id),
  KEY code (code),
  KEY phone (phone),
  KEY user_id (user_id),
  KEY start_at (start_at),
  KEY staff_start (staff_id,start_at)
) $charset;" );

		$logs = self::table( 'logs' );
		dbDelta( "CREATE TABLE $logs (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  booking_id bigint(20) unsigned NOT NULL DEFAULT 0,
  user_id bigint(20) unsigned NOT NULL DEFAULT 0,
  action varchar(40) NOT NULL,
  detail text NULL,
  created_at datetime NOT NULL,
  PRIMARY KEY  (id),
  KEY booking_id (booking_id)
) $charset;" );

		update_option( 'rb_db_version', self::DB_VERSION );
	}

	/**
	 * Sample data so the booking page works right after activation.
	 * Only runs when the tables are empty.
	 */
	public static function seed() {
		global $wpdb;
		$services = self::table( 'services' );
		$staff    = self::table( 'staff' );

		if ( 0 === (int) $wpdb->get_var( "SELECT COUNT(*) FROM $services" ) ) {
			$rows = array(
				array( 'Sơn gel trơn', 'nail', 'Sơn gel bền màu 3–4 tuần, chọn từ bảng màu của tiệm.', 150000, 45 ),
				array( 'Sơn gel + vẽ đơn giản', 'nail', 'Sơn gel kèm vẽ, đính đá nhẹ trên 2–4 ngón.', 250000, 60 ),
				array( 'Úp móng + sơn gel', 'nail', 'Úp móng giả form dáng theo yêu cầu, sơn gel.', 350000, 90 ),
				array( 'Chăm sóc da tay + cắt da', 'nail', 'Ngâm, cắt da, dưỡng ẩm và massage tay.', 100000, 30 ),
				array( 'Nối mi classic', 'mi', 'Nối 1:1 tự nhiên, phù hợp đi làm, đi học.', 350000, 90 ),
				array( 'Nối mi volume', 'mi', 'Mi dày, cong, tạo hiệu ứng mắt to.', 450000, 120 ),
				array( 'Uốn mi + nhuộm mi', 'mi', 'Mi cong tự nhiên 4–6 tuần, không cần nối.', 250000, 60 ),
				array( 'Combo gel + nối mi classic', 'combo', 'Tiết kiệm hơn so với làm lẻ.', 550000, 150 ),
			);
			foreach ( $rows as $i => $r ) {
				$wpdb->insert( $services, array(
					'name'        => $r[0],
					'category'    => $r[1],
					'description' => $r[2],
					'price'       => $r[3],
					'duration'    => $r[4],
					'active'      => 1,
					'sort_order'  => $i,
				) );
			}
		}

		if ( 0 === (int) $wpdb->get_var( "SELECT COUNT(*) FROM $staff" ) ) {
			$rows = array(
				array( 'Ngọc Anh', 'Chuyên vẽ nail nghệ thuật' ),
				array( 'Thu Hà', 'Chuyên nối mi' ),
				array( 'Minh Thư', 'Nail & mi' ),
			);
			foreach ( $rows as $i => $r ) {
				$wpdb->insert( $staff, array(
					'name'        => $r[0],
					'title'       => $r[1],
					'service_ids' => '',
					'active'      => 1,
					'sort_order'  => $i,
				) );
			}
		}
	}

	/* ---------- Read helpers ---------- */

	public static function get_services( $only_active = true ) {
		global $wpdb;
		$t     = self::table( 'services' );
		$where = $only_active ? 'WHERE active = 1' : '';
		$rows  = $wpdb->get_results( "SELECT * FROM $t $where ORDER BY sort_order ASC, id ASC", ARRAY_A );
		return array_map( array( __CLASS__, 'cast_service' ), $rows ? $rows : array() );
	}

	public static function get_service( $id ) {
		global $wpdb;
		$t   = self::table( 'services' );
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE id = %d", $id ), ARRAY_A );
		return $row ? self::cast_service( $row ) : null;
	}

	public static function cast_service( $r ) {
		return array(
			'id'          => (int) $r['id'],
			'name'        => $r['name'],
			'category'    => $r['category'],
			'description' => (string) $r['description'],
			'price'       => (int) $r['price'],
			'duration'    => (int) $r['duration'],
			'image_id'    => isset( $r['image_id'] ) ? (int) $r['image_id'] : 0,
			'image'       => ! empty( $r['image_id'] ) ? (string) wp_get_attachment_image_url( (int) $r['image_id'], 'medium_large' ) : '',
			'detail_url'  => isset( $r['detail_url'] ) ? (string) $r['detail_url'] : '',
			'active'      => (int) $r['active'],
			'sort_order'  => (int) $r['sort_order'],
		);
	}

	public static function get_staff_list( $only_active = true ) {
		global $wpdb;
		$t     = self::table( 'staff' );
		$where = $only_active ? 'WHERE active = 1' : '';
		$rows  = $wpdb->get_results( "SELECT * FROM $t $where ORDER BY sort_order ASC, id ASC", ARRAY_A );
		return array_map( array( __CLASS__, 'cast_staff' ), $rows ? $rows : array() );
	}

	public static function get_staff( $id ) {
		global $wpdb;
		$t   = self::table( 'staff' );
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE id = %d", $id ), ARRAY_A );
		return $row ? self::cast_staff( $row ) : null;
	}

	public static function cast_staff( $r ) {
		$ids = array_filter( array_map( 'intval', explode( ',', (string) $r['service_ids'] ) ) );
		return array(
			'id'          => (int) $r['id'],
			'name'        => $r['name'],
			'title'       => (string) $r['title'],
			'photo_id'    => (int) $r['photo_id'],
			'user_id'     => isset( $r['user_id'] ) ? (int) $r['user_id'] : 0,
			'photo'       => $r['photo_id'] ? wp_get_attachment_image_url( (int) $r['photo_id'], 'thumbnail' ) : '',
			'image'       => $r['photo_id'] ? (string) wp_get_attachment_image_url( (int) $r['photo_id'], 'medium_large' ) : '',
			'service_ids' => array_values( $ids ), // Empty = làm được mọi dịch vụ.
			'active'      => (int) $r['active'],
			'sort_order'  => (int) $r['sort_order'],
		);
	}

	public static function staff_can_do( $staff, $service_ids ) {
		if ( empty( $staff['service_ids'] ) ) {
			return true;
		}
		return ! array_diff( $service_ids, $staff['service_ids'] );
	}

	public static function get_booking_by_code( $code ) {
		global $wpdb;
		$t = self::table( 'bookings' );
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE code = %s", $code ), ARRAY_A );
	}

	public static function get_booking( $id ) {
		global $wpdb;
		$t = self::table( 'bookings' );
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $t WHERE id = %d", $id ), ARRAY_A );
	}

	public static function update_status( $id, $status ) {
		global $wpdb;
		if ( ! array_key_exists( $status, rb_status_labels() ) ) {
			return false;
		}
		return false !== $wpdb->update( self::table( 'bookings' ), array( 'status' => $status, 'updated_at' => current_time( 'mysql' ) ), array( 'id' => (int) $id ) );
	}

	/** Append an entry to a booking's action history. */
	public static function log( $booking_id, $action, $detail = '' ) {
		global $wpdb;
		$wpdb->insert( self::table( 'logs' ), array(
			'booking_id' => (int) $booking_id,
			'user_id'    => get_current_user_id(),
			'action'     => $action,
			'detail'     => $detail,
			'created_at' => current_time( 'mysql' ),
		) );
	}

	/**
	 * Public, safe view of a booking (for the customer).
	 */
	public static function public_booking( $b ) {
		$services = json_decode( (string) $b['services_json'], true );
		$staff    = $b['staff_id'] ? self::get_staff( (int) $b['staff_id'] ) : null;
		$start    = new DateTimeImmutable( $b['start_at'], wp_timezone() );
		$end      = new DateTimeImmutable( $b['end_at'], wp_timezone() );
		$labels   = rb_status_labels();
		$set      = rb_settings();
		$can_cancel = in_array( $b['status'], array( 'pending', 'confirmed' ), true )
			&& $start->getTimestamp() - time() >= (int) $set['cancel_before'] * HOUR_IN_SECONDS;

		$images = array();
		foreach ( array_filter( array_map( 'intval', explode( ',', (string) $b['image_ids'] ) ) ) as $img ) {
			$url = wp_get_attachment_image_url( $img, 'thumbnail' );
			if ( $url ) {
				$images[] = $url;
			}
		}

		return array(
			'code'         => $b['code'],
			'name'         => $b['customer_name'],
			'phone_masked' => self::mask_phone( $b['phone'] ),
			'services'     => is_array( $services ) ? $services : array(),
			'staff'        => $staff ? $staff['name'] : '',
			'staff_auto'   => (int) $b['staff_auto'],
			'date'         => $start->format( 'Y-m-d' ),
			'start'        => $start->format( 'H:i' ),
			'end'          => $end->format( 'H:i' ),
			'start_iso'    => $start->format( 'c' ),
			'end_iso'      => $end->format( 'c' ),
			'total'        => (int) $b['total'],
			'status'       => $b['status'],
			'status_label' => isset( $labels[ $b['status'] ] ) ? $labels[ $b['status'] ] : $b['status'],
			'can_cancel'   => $can_cancel,
			'note'         => (string) $b['note'],
			'images'       => $images,
		);
	}

	public static function mask_phone( $phone ) {
		$p = preg_replace( '/\D/', '', $phone );
		if ( strlen( $p ) < 7 ) {
			return $p;
		}
		return substr( $p, 0, 4 ) . ' ••• ' . substr( $p, -3 );
	}
}
