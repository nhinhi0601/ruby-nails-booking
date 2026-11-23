<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Availability {

	/**
	 * Staff that can perform every selected service.
	 */
	public static function eligible_staff( $service_ids ) {
		$out = array();
		foreach ( RB_DB::get_staff_list() as $s ) {
			if ( RB_DB::staff_can_do( $s, $service_ids ) ) {
				$out[] = $s;
			}
		}
		return $out;
	}

	/**
	 * Busy intervals per staff for one day: [staff_id => [[start_ts, end_ts], ...]].
	 */
	public static function busy_map( $date ) {
		global $wpdb;
		$t    = RB_DB::table( 'bookings' );
		$rows = $wpdb->get_results( $wpdb->prepare(
			"SELECT staff_id, start_at, end_at FROM $t WHERE status IN ('pending','confirmed','in_progress') AND start_at >= %s AND start_at <= %s",
			$date . ' 00:00:00',
			$date . ' 23:59:59'
		), ARRAY_A );
		$tz  = wp_timezone();
		$map = array();
		foreach ( (array) $rows as $r ) {
			$s = ( new DateTimeImmutable( $r['start_at'], $tz ) )->getTimestamp();
			$e = ( new DateTimeImmutable( $r['end_at'], $tz ) )->getTimestamp();
			$map[ (int) $r['staff_id'] ][] = array( $s, $e );
		}
		return $map;
	}

	public static function is_free( $busy, $staff_id, $start, $end ) {
		if ( empty( $busy[ $staff_id ] ) ) {
			return true;
		}
		foreach ( $busy[ $staff_id ] as $iv ) {
			if ( $start < $iv[1] && $end > $iv[0] ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Validate a Y-m-d date against the booking window. Returns DateTimeImmutable or WP_Error.
	 */
	public static function check_date( $date ) {
		$set = rb_settings();
		$tz  = wp_timezone();
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $date ) ) {
			return new WP_Error( 'rb_date', 'Ngày không hợp lệ.' );
		}
		$day   = DateTimeImmutable::createFromFormat( '!Y-m-d', $date, $tz );
		$today = new DateTimeImmutable( 'today', $tz );
		if ( ! $day ) {
			return new WP_Error( 'rb_date', 'Ngày không hợp lệ.' );
		}
		$diff = (int) $today->diff( $day )->format( '%r%a' );
		if ( $diff < 0 || $diff >= (int) $set['days_ahead'] ) {
			return new WP_Error( 'rb_date', 'Ngày này nằm ngoài thời gian nhận đặt lịch.' );
		}
		if ( ! in_array( (int) $day->format( 'w' ), array_map( 'intval', (array) $set['open_days'] ), true ) ) {
			return new WP_Error( 'rb_date', 'Tiệm nghỉ vào ngày này.' );
		}
		return $day;
	}

	/**
	 * Available slots for a day.
	 *
	 * @param string $date        Y-m-d.
	 * @param int    $duration    Minutes.
	 * @param int    $staff_id    0 = bất kỳ thợ nào.
	 * @param array  $service_ids Selected services.
	 * @return array|WP_Error [ ['time' => 'HH:MM', 'staff' => [ids]] ]
	 */
	public static function slots( $date, $duration, $staff_id, $service_ids ) {
		$day = self::check_date( $date );
		if ( is_wp_error( $day ) ) {
			return $day;
		}
		$set = rb_settings();
		$tz  = wp_timezone();

		$staff = self::eligible_staff( $service_ids );
		if ( $staff_id ) {
			$staff = array_values( array_filter( $staff, function ( $s ) use ( $staff_id ) {
				return $s['id'] === (int) $staff_id;
			} ) );
		}
		if ( ! $staff ) {
			return array();
		}

		$open  = new DateTimeImmutable( $date . ' ' . $set['open_time'], $tz );
		$close = new DateTimeImmutable( $date . ' ' . $set['close_time'], $tz );
		$step  = max( 10, (int) $set['slot_step'] ) * MINUTE_IN_SECONDS;
		$len   = max( 10, (int) $duration ) * MINUTE_IN_SECONDS;
		$min   = time() + (int) $set['min_lead'] * MINUTE_IN_SECONDS;
		$busy  = self::busy_map( $date );

		$out = array();
		for ( $t = $open->getTimestamp(); $t + $len <= $close->getTimestamp(); $t += $step ) {
			if ( $t < $min ) {
				continue;
			}
			$free = array();
			foreach ( $staff as $s ) {
				if ( self::is_free( $busy, $s['id'], $t, $t + $len ) ) {
					$free[] = $s['id'];
				}
			}
			if ( $free ) {
				$out[] = array(
					'time'  => wp_date( 'H:i', $t, $tz ),
					'staff' => $free,
				);
			}
		}
		return $out;
	}

	/**
	 * Pick a staff member for an exact start time, or 0 if none is free.
	 */
	public static function pick_staff( $date, $time, $duration, $staff_id, $service_ids ) {
		$slots = self::slots( $date, $duration, $staff_id, $service_ids );
		if ( is_wp_error( $slots ) ) {
			return $slots;
		}
		foreach ( $slots as $slot ) {
			if ( $slot['time'] !== $time ) {
				continue;
			}
			if ( $staff_id ) {
				return in_array( (int) $staff_id, $slot['staff'], true ) ? (int) $staff_id : 0;
			}
			// Bất kỳ: chọn thợ có ít lịch nhất trong ngày để chia đều.
			$busy = self::busy_map( $date );
			$best = 0;
			$min  = PHP_INT_MAX;
			foreach ( $slot['staff'] as $sid ) {
				$n = isset( $busy[ $sid ] ) ? count( $busy[ $sid ] ) : 0;
				if ( $n < $min ) {
					$min  = $n;
					$best = $sid;
				}
			}
			return $best;
		}
		return 0;
	}
}
