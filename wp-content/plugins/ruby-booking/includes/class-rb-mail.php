<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Mail {

	public static function booking_created( $booking_id ) {
		$b = RB_DB::get_booking( $booking_id );
		if ( ! $b ) {
			return;
		}
		$p    = RB_DB::public_booking( $b );
		$set  = rb_settings();
		$site = wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES );
		$html = self::render( $p, $b );

		$headers = array( 'Content-Type: text/html; charset=UTF-8' );

		if ( is_email( $b['email'] ) ) {
			$intro = 'pending' === $b['status']
				? 'Cảm ơn bạn đã đặt lịch! Tiệm sẽ liên hệ xác nhận trong thời gian sớm nhất.'
				: 'Lịch hẹn của bạn đã được xác nhận. Hẹn gặp bạn tại tiệm!';
			wp_mail(
				$b['email'],
				sprintf( '[%s] Đặt lịch thành công – Mã %s', $site, $b['code'] ),
				self::wrap( 'Xin chào ' . esc_html( $b['customer_name'] ) . ',', $intro, $html, $set ),
				$headers
			);
		}

		if ( is_email( $set['admin_email'] ) ) {
			wp_mail(
				$set['admin_email'],
				sprintf( '[%s] Lịch hẹn mới %s – %s %s', $site, $b['code'], $p['start'], wp_date( 'd/m', strtotime( $p['date'] ) ) ),
				self::wrap( 'Có lịch hẹn mới', 'Khách: ' . esc_html( $b['customer_name'] ) . ' – ' . esc_html( $b['phone'] ), $html, $set )
					. '<p><a href="' . esc_url( admin_url( 'admin.php?page=rb-bookings' ) ) . '">Mở trang quản lý lịch hẹn</a></p>',
				$headers
			);
		}
	}

	public static function status_changed( $booking_id ) {
		$b = RB_DB::get_booking( $booking_id );
		if ( ! $b || ! is_email( $b['email'] ) ) {
			return;
		}
		$p   = RB_DB::public_booking( $b );
		$set = rb_settings();
		wp_mail(
			$b['email'],
			sprintf( '[%s] Lịch hẹn %s: %s', wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ), $b['code'], $p['status_label'] ),
			self::wrap( 'Xin chào ' . esc_html( $b['customer_name'] ) . ',', 'Trạng thái lịch hẹn của bạn đã chuyển sang: <b>' . esc_html( $p['status_label'] ) . '</b>.', self::render( $p, $b ), $set ),
			array( 'Content-Type: text/html; charset=UTF-8' )
		);
	}

	/** Free-form update to the customer (đổi giờ, đổi thợ…). $message may contain simple HTML. */
	public static function notify( $booking_id, $headline, $message ) {
		$b = RB_DB::get_booking( $booking_id );
		if ( ! $b || ! is_email( $b['email'] ) ) {
			return;
		}
		$p = RB_DB::public_booking( $b );
		wp_mail(
			$b['email'],
			sprintf( '[%s] %s – Mã %s', wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ), $headline, $b['code'] ),
			self::wrap( 'Xin chào ' . esc_html( $b['customer_name'] ) . ',', wp_kses( $message, array( 'b' => array() ) ), self::render( $p, $b ), rb_settings() ),
			array( 'Content-Type: text/html; charset=UTF-8' )
		);
	}

	private static function render( $p, $b ) {
		$rows = '';
		foreach ( $p['services'] as $s ) {
			$rows .= '<tr><td style="padding:6px 0">' . esc_html( $s['name'] ) . ' (' . (int) $s['duration'] . ' phút)</td><td style="text-align:right">' . esc_html( rb_format_price( $s['price'] ) ) . '</td></tr>';
		}
		$staff = $p['staff'] ? esc_html( $p['staff'] ) . ( $p['staff_auto'] ? ' (tiệm sắp xếp)' : '' ) : 'Tiệm sắp xếp';
		return '<table style="width:100%;border-collapse:collapse;font-size:14px">'
			. '<tr><td style="padding:6px 0;color:#7A6168">Mã lịch hẹn</td><td style="text-align:right"><b>' . esc_html( $p['code'] ) . '</b></td></tr>'
			. '<tr><td style="padding:6px 0;color:#7A6168">Thời gian</td><td style="text-align:right">' . esc_html( $p['start'] . ' – ' . $p['end'] . ', ' . wp_date( 'd/m/Y', strtotime( $p['date'] ) ) ) . '</td></tr>'
			. '<tr><td style="padding:6px 0;color:#7A6168">Kỹ thuật viên</td><td style="text-align:right">' . $staff . '</td></tr>'
			. $rows
			. '<tr><td style="padding:10px 0;border-top:1px solid #EFC9D4"><b>Tổng tạm tính</b></td><td style="text-align:right;border-top:1px solid #EFC9D4;color:#8B1E3F"><b>' . esc_html( rb_format_price( $p['total'] ) ) . '</b></td></tr>'
			. '</table>';
	}

	private static function wrap( $title, $intro, $body, $set ) {
		$lookup = $set['status_url'] ? '<p style="margin-top:18px"><a href="' . esc_url( $set['status_url'] ) . '" style="color:#8B1E3F">Tra cứu / hủy lịch hẹn</a></p>' : '';
		return '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#3A2A2F">'
			. '<div style="background:#8B1E3F;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0;font-size:20px;font-weight:bold">' . esc_html( wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ) ) . '</div>'
			. '<div style="border:1px solid #EFC9D4;border-top:0;padding:22px;border-radius:0 0 12px 12px">'
			. '<p style="font-size:16px"><b>' . $title . '</b></p><p>' . $intro . '</p>' . $body . $lookup
			. '<p style="color:#7A6168;font-size:13px;margin-top:18px">' . esc_html( $set['shop_address'] ) . ' · ' . esc_html( $set['shop_phone'] ) . '</p>'
			. '</div></div>';
	}
}
