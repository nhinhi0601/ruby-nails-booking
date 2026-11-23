<?php
/**
 * Chatbot tư vấn (FR10, FR11, FR17, BRULE04).
 * - Trả lời tự động theo bảng dịch vụ & giá + cài đặt tiệm (luôn hoạt động, không tốn phí).
 * - Nếu chủ tiệm nhập khóa AI (Gemini / Claude / OpenAI): AI trả lời tự nhiên hơn nhưng CHỈ dựa trên dữ liệu tiệm.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class RB_Chat {

	const OPT = 'rb_chat';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ), 30 );
	}

	/* ------------------------------------------------------------------ settings */

	public static function defaults() {
		return array(
			'enabled'     => 1,
			'bot_name'    => 'Ruby',
			'title'       => 'Ruby Nails & Eyelash',
			'greeting'    => 'Chào bạn! Mình là Ruby, trợ lý của tiệm. Bạn cần tư vấn dịch vụ, giá hay đặt lịch ạ?',
			'suggestions' => "Bảng giá dịch vụ nail?\nNối mi giá bao nhiêu?\nTiệm mở cửa mấy giờ?\nLàm sao để đặt lịch?\nTiệm ở đâu vậy?\nCó chuyển khoản được không?",
			'zalo'        => '',
			'messenger'   => '',
			'extra'       => '',
			'ai_provider' => 'none',
			'ai_key'      => '',
			'ai_model'    => '',
			'ai_daily'    => 300,
			'voice'       => 1,
			'tts'         => 'auto',
			'tts_voice'   => 'Aoede',
		);
	}

	public static function get() {
		$s = get_option( self::OPT, array() );
		return wp_parse_args( is_array( $s ) ? $s : array(), self::defaults() );
	}

	public static function default_model( $provider ) {
		$m = array(
			'gemini' => 'gemini-3.5-flash-lite',
			'claude' => 'claude-haiku-5-5',
			'openai' => 'gpt-4.1-mini',
		);
		return isset( $m[ $provider ] ) ? $m[ $provider ] : '';
	}

	public static function ai_ready( $s = null ) {
		$s = $s ? $s : self::get();
		return in_array( $s['ai_provider'], array( 'gemini', 'claude', 'openai' ), true ) && '' !== trim( (string) $s['ai_key'] );
	}

	/** Settings as shown to the owner – the key is never sent back in full. */
	public static function public_settings() {
		$s          = self::get();
		$key        = (string) $s['ai_key'];
		$s['ai_key'] = '';
		$s['ai_key_hint'] = $key ? '••••' . substr( $key, -4 ) : '';
		$s['ai_model_default'] = self::default_model( $s['ai_provider'] );
		$s['ai_last_error']    = (string) get_transient( 'rb_chat_ai_error' );
		$s['ai_used_today']    = (int) get_transient( 'rb_chat_ai_' . wp_date( 'Ymd' ) );
		$s['tts_voices']       = self::tts_voices();
		$s['tts_on']           = self::tts_ready() ? 1 : 0;
		return $s;
	}

	public static function sanitize( $p, $old ) {
		$s = $old;
		foreach ( array( 'enabled', 'voice' ) as $k ) {
			if ( isset( $p[ $k ] ) ) {
				$s[ $k ] = empty( $p[ $k ] ) ? 0 : 1;
			}
		}
		foreach ( array( 'bot_name' => 40, 'title' => 80 ) as $k => $len ) {
			if ( isset( $p[ $k ] ) ) {
				$v = mb_substr( sanitize_text_field( $p[ $k ] ), 0, $len );
				$s[ $k ] = '' !== $v ? $v : self::defaults()[ $k ];
			}
		}
		foreach ( array( 'greeting' => 400, 'suggestions' => 800, 'extra' => 4000 ) as $k => $len ) {
			if ( isset( $p[ $k ] ) ) {
				$s[ $k ] = mb_substr( sanitize_textarea_field( $p[ $k ] ), 0, $len );
			}
		}
		if ( isset( $p['zalo'] ) ) {
			$s['zalo'] = preg_replace( '/[^0-9]/', '', (string) $p['zalo'] );
		}
		if ( isset( $p['messenger'] ) ) {
			$m = trim( (string) $p['messenger'] );
			// Accept a page username, m.me link or facebook.com link.
			$m = preg_replace( '#^https?://(www\.)?(m\.me|facebook\.com|fb\.com|messenger\.com/t)/#i', '', $m );
			$s['messenger'] = preg_replace( '/[^A-Za-z0-9._-]/', '', explode( '/', $m )[0] );
		}
		if ( isset( $p['ai_provider'] ) && in_array( $p['ai_provider'], array( 'none', 'gemini', 'claude', 'openai' ), true ) ) {
			$s['ai_provider'] = $p['ai_provider'];
		}
		if ( isset( $p['ai_key'] ) && '' !== trim( (string) $p['ai_key'] ) ) {
			$s['ai_key'] = trim( sanitize_text_field( $p['ai_key'] ) );
		}
		if ( ! empty( $p['ai_key_clear'] ) ) {
			$s['ai_key'] = '';
		}
		if ( isset( $p['ai_model'] ) ) {
			$s['ai_model'] = preg_replace( '/[^A-Za-z0-9._:-]/', '', (string) $p['ai_model'] );
		}
		if ( isset( $p['tts'] ) && in_array( $p['tts'], array( 'auto', 'device' ), true ) ) {
			$s['tts'] = $p['tts'];
		}
		if ( isset( $p['tts_voice'] ) && in_array( $p['tts_voice'], array_keys( self::tts_voices() ), true ) ) {
			$s['tts_voice'] = $p['tts_voice'];
		}
		if ( isset( $p['ai_daily'] ) ) {
			$s['ai_daily'] = max( 0, min( 5000, (int) $p['ai_daily'] ) );
		}
		return $s;
	}

	/* ------------------------------------------------------------------ front-end */

	public static function enqueue() {
		$s = self::get();
		if ( empty( $s['enabled'] ) || is_admin() ) {
			return;
		}
		wp_enqueue_style( 'rb-chat', RB_URL . 'assets/chat.css', array(), RB_VERSION );
		wp_enqueue_script( 'rb-chat', RB_URL . 'assets/chat.js', array(), RB_VERSION, true );
		$set = rb_settings();
		$sug = array_values( array_filter( array_map( 'trim', preg_split( '/\r?\n/', (string) $s['suggestions'] ) ) ) );
		wp_localize_script( 'rb-chat', 'RBC', array(
			'api'       => esc_url_raw( rest_url( RB_REST::NS . '/chat' ) ),
			'name'      => $s['bot_name'],
			'title'     => $s['title'],
			'greeting'  => $s['greeting'],
			'suggest'   => array_slice( $sug, 0, 8 ),
			'phone'     => $set['shop_phone'],
			'zalo'      => $s['zalo'] ? $s['zalo'] : preg_replace( '/\D/', '', (string) $set['shop_phone'] ),
			'messenger' => $s['messenger'],
			'booking'   => home_url( '/dat-lich/' ),
			'voice'     => (int) $s['voice'],
			'ai'        => self::ai_ready( $s ) ? 1 : 0,
			'tts'       => self::tts_ready( $s ) ? 1 : 0,
			'ttsApi'    => esc_url_raw( rest_url( RB_REST::NS . '/chat/tts' ) ),
		) );
	}

	/* ------------------------------------------------------------------ REST */

	public static function routes() {
		register_rest_route( RB_REST::NS, '/chat', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'chat' ),
			'permission_callback' => '__return_true',
		) );
		register_rest_route( RB_REST::NS, '/chat/tts', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'tts' ),
			'permission_callback' => '__return_true',
		) );
		register_rest_route( RB_REST::NS, '/admin/chat-settings', array(
			array(
				'methods'             => 'GET',
				'callback'            => function () {
					return new WP_REST_Response( array( 'ok' => true, 'settings' => self::public_settings() ), 200 );
				},
				'permission_callback' => function () { return current_user_can( 'rb_owner' ); },
			),
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'save_settings' ),
				'permission_callback' => function () { return current_user_can( 'rb_owner' ); },
			),
		) );
		register_rest_route( RB_REST::NS, '/admin/chat-test', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'test_ai' ),
			'permission_callback' => function () { return current_user_can( 'rb_owner' ); },
		) );
	}

	public static function save_settings( WP_REST_Request $req ) {
		$p = $req->get_json_params();
		$s = self::sanitize( is_array( $p ) ? $p : array(), self::get() );
		update_option( self::OPT, $s, false );
		delete_transient( 'rb_chat_ai_error' );
		delete_transient( 'rb_chat_ai_down' );
		return new WP_REST_Response( array( 'ok' => true, 'settings' => self::public_settings() ), 200 );
	}

	public static function test_ai() {
		$s = self::get();
		if ( ! self::ai_ready( $s ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => 'Chưa chọn nhà cung cấp AI hoặc chưa nhập khóa API.' ), 200 );
		}
		$t0 = microtime( true );
		$r  = self::ask_ai( array( array( 'role' => 'user', 'text' => 'Tiệm có dịch vụ sơn gel không, giá bao nhiêu?' ) ), $s );
		if ( is_wp_error( $r ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => $r->get_error_message() ), 200 );
		}
		$out = array( 'ok' => true, 'reply' => $r, 'ms' => (int) round( ( microtime( true ) - $t0 ) * 1000 ) );
		if ( self::tts_ready( $s ) ) {
			delete_transient( 'rb_chat_tts_down' );
			$a = self::make_tts( 'Dạ, Ruby Nails xin chào! Mình có thể giúp gì cho bạn ạ?', $s );
			$out['tts'] = is_wp_error( $a ) ? array( 'ok' => false, 'message' => $a->get_error_message() ) : array( 'ok' => true, 'url' => $a );
		}
		return new WP_REST_Response( $out, 200 );
	}

	private static function ip() {
		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	}

	public static function chat( WP_REST_Request $req ) {
		$s = self::get();
		if ( empty( $s['enabled'] ) ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => 'Chatbot đang tắt.' ), 403 );
		}
		// 30 tin / 10 phút / IP – chống spam và giữ chi phí AI.
		$key = 'rb_rl_chat_' . md5( self::ip() );
		$n   = (int) get_transient( $key );
		if ( $n >= 30 ) {
			return new WP_REST_Response( array( 'ok' => true, 'reply' => 'Bạn nhắn hơi nhanh rồi ạ. Bạn đợi vài phút hoặc gọi tiệm qua số ' . rb_settings()['shop_phone'] . ' nhé!', 'services' => array(), 'contact' => true, 'source' => 'limit' ), 200 );
		}
		set_transient( $key, $n + 1, 10 * MINUTE_IN_SECONDS );

		$raw  = $req->get_param( 'messages' );
		$msgs = array();
		foreach ( array_slice( is_array( $raw ) ? $raw : array(), -10 ) as $m ) {
			if ( ! is_array( $m ) || empty( $m['text'] ) ) {
				continue;
			}
			$msgs[] = array(
				'role' => ( isset( $m['role'] ) && 'user' === $m['role'] ) ? 'user' : 'bot',
				'text' => mb_substr( sanitize_textarea_field( (string) $m['text'] ), 0, 'user' === ( $m['role'] ?? '' ) ? 500 : 1200 ),
			);
		}
		while ( $msgs && 'user' !== $msgs[0]['role'] ) {
			array_shift( $msgs ); // AI APIs want the conversation to start with the customer.
		}
		if ( ! $msgs || 'user' !== end( $msgs )['role'] ) {
			return new WP_REST_Response( array( 'ok' => false, 'message' => 'Thiếu câu hỏi.' ), 400 );
		}
		$q = end( $msgs )['text'];

		$faq = self::faq( $q );
		// Câu chào / hỏi thông tin cố định → trả lời ngay, không tốn lượt AI.
		if ( self::ai_ready( $s ) && ! get_transient( 'rb_chat_ai_down' ) && ! in_array( $faq['intent'], array( 'greet', 'thanks' ), true ) && self::ai_budget_ok( $s ) ) {
			$r = self::ask_ai( $msgs, $s );
			// Gói miễn phí hay báo "quá tải" (503) hoặc "vượt giới hạn" (429): thử ngay model dự phòng.
			if ( is_wp_error( $r ) && 'gemini' === $s['ai_provider'] && in_array( (int) ( $r->get_error_data()['status'] ?? -1 ), array( 429, 500, 503 ), true ) ) {
				$cur = $s['ai_model'] ? $s['ai_model'] : self::default_model( 'gemini' );
				foreach ( array( 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash' ) as $alt ) {
					if ( $alt === $cur ) {
						continue;
					}
					$r2 = self::ask_ai( $msgs, array_merge( $s, array( 'ai_model' => $alt ) ) );
					if ( ! is_wp_error( $r2 ) ) {
						$r = $r2;
						break;
					}
				}
			}
			if ( ! is_wp_error( $r ) ) {
				$found = self::services_in( $r . ' ' . $q );
				return new WP_REST_Response( array(
					'ok'       => true,
					'reply'    => $r,
					'services' => array_map( array( __CLASS__, 'card' ), array_slice( $found, 0, 3 ) ),
					'contact'  => (bool) preg_match( '/li[eê]n h[eệ]|nh[aâ]n vi[eê]n/u', mb_strtolower( $r ) ),
					'links'    => array(),
					'source'   => 'ai',
				), 200 );
			}
			set_transient( 'rb_chat_ai_error', wp_date( 'H:i d/m' ) . ' – ' . $r->get_error_message(), DAY_IN_SECONDS );
			// Tạm dùng câu trả lời mẫu một lúc để khách không phải chờ: lỗi khóa/model lâu hơn, quá tải tạm thời chỉ vài chục giây.
			$st   = (int) ( $r->get_error_data()['status'] ?? 0 );
			$wait = in_array( $st, array( 400, 401, 403, 404 ), true ) ? 10 * MINUTE_IN_SECONDS : ( 429 === $st ? 90 : 30 );
			set_transient( 'rb_chat_ai_down', 1, $wait );
		}
		unset( $faq['intent'] );
		$faq['ok']     = true;
		$faq['source'] = 'faq';
		return new WP_REST_Response( $faq, 200 );
	}

	private static function ai_budget_ok( $s ) {
		$k = 'rb_chat_ai_' . wp_date( 'Ymd' );
		$n = (int) get_transient( $k );
		if ( (int) $s['ai_daily'] > 0 && $n >= (int) $s['ai_daily'] ) {
			return false;
		}
		set_transient( $k, $n + 1, DAY_IN_SECONDS + HOUR_IN_SECONDS );
		return true;
	}

	/* ------------------------------------------------------------------ shop data */

	public static function norm( $t ) {
		$t = mb_strtolower( wp_strip_all_tags( (string) $t ), 'UTF-8' );
		$t = remove_accents( $t );
		$t = preg_replace( '/[^a-z0-9]+/', ' ', $t );
		return trim( preg_replace( '/\s+/', ' ', $t ) );
	}

	private static function cats() {
		return array( 'nail' => 'Nail', 'mi' => 'Mi', 'combo' => 'Combo' );
	}

	private static function days_text( $days ) {
		$days = array_map( 'intval', (array) $days );
		sort( $days );
		if ( count( $days ) === 7 ) {
			return 'tất cả các ngày trong tuần';
		}
		$n = array( 'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7' );
		return implode( ', ', array_map( function ( $d ) use ( $n ) { return $n[ $d ]; }, $days ) );
	}

	private static function dur( $m ) {
		$m = (int) $m;
		return $m >= 60 ? ( intdiv( $m, 60 ) . ' giờ' . ( $m % 60 ? ' ' . ( $m % 60 ) . ' phút' : '' ) ) : $m . ' phút';
	}

	public static function booking_url( $id = 0 ) {
		return $id ? add_query_arg( 'chon', (int) $id, home_url( '/dat-lich/' ) ) : home_url( '/dat-lich/' );
	}

	public static function status_url() {
		$u = rb_settings()['status_url'];
		return $u ? $u : home_url( '/tra-cuu-lich-hen/' );
	}

	public static function card( $sv ) {
		return array(
			'id'       => (int) $sv['id'],
			'name'     => $sv['name'],
			'price'    => rb_format_price( $sv['price'] ),
			'duration' => self::dur( $sv['duration'] ),
			'book'     => self::booking_url( $sv['id'] ),
			'detail'   => (string) $sv['detail_url'],
		);
	}

	/** Shop facts handed to the AI – the only source it may answer from (BRULE04). */
	public static function knowledge() {
		$set   = rb_settings();
		$s     = self::get();
		$cats  = self::cats();
		$lines = array();
		$group = '';
		foreach ( RB_DB::get_services() as $sv ) {
			$g = 'Nhóm ' . ( $cats[ $sv['category'] ] ?? $sv['category'] ) . ':';
			$d = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( (string) $sv['description'] ) ) );
			$lines[ $g ][] = '- ' . $sv['name'] . ' – ' . rb_format_price( $sv['price'] ) . ', khoảng ' . self::dur( $sv['duration'] ) . ( $d ? '. ' . mb_substr( $d, 0, 160 ) : '' );
		}
		$lines = array_map( function ( $g, $l ) { return $g . "\n" . implode( "\n", $l ); }, array_keys( $lines ), $lines );
		$staff = array();
		foreach ( RB_DB::get_staff_list() as $st ) {
			$staff[] = $st['name'] . ( ! empty( $st['title'] ) ? ' (' . $st['title'] . ')' : '' );
		}
		$out  = "TIỆM: " . wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ) . "\n";
		$out .= 'Địa chỉ: ' . $set['shop_address'] . "\nĐiện thoại/Zalo: " . $set['shop_phone'] . "\n";
		$out .= 'Giờ mở cửa: ' . $set['open_time'] . '–' . $set['close_time'] . ', ' . self::days_text( $set['open_days'] ) . "\n";
		$out .= 'Đặt lịch online: ' . self::booking_url() . ' (chọn dịch vụ, thợ, ngày giờ còn trống; đặt trước tối đa ' . (int) $set['days_ahead'] . " ngày)\n";
		$out .= 'Tra cứu/hủy lịch: ' . self::status_url() . ' (hủy trước giờ hẹn ít nhất ' . (int) $set['cancel_before'] . " giờ)\n";
		$out .= "Thanh toán: trực tiếp tại tiệm sau khi làm xong (tiền mặt hoặc chuyển khoản tại quầy), web không thanh toán online.\n";
		if ( $staff ) {
			$out .= 'Kỹ thuật viên: ' . implode( ', ', $staff ) . "\n";
		}
		$wd   = array( 'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7' );
		$out .= 'Bây giờ: ' . $wd[ (int) wp_date( 'w' ) ] . ', ' . wp_date( 'd/m/Y H:i' ) . "\n";
		$out .= "\nBẢNG DỊCH VỤ VÀ GIÁ CHÍNH THỨC:\n" . implode( "\n", $lines ) . "\n";
		if ( trim( (string) $s['extra'] ) ) {
			$out .= "\nTHÔNG TIN THÊM DO CHỦ TIỆM CUNG CẤP:\n" . trim( (string) $s['extra'] ) . "\n";
		}
		return $out;
	}

	private static function system_prompt( $s ) {
		$set = rb_settings();
		return "Bạn là {$s['bot_name']}, trợ lý tư vấn trên website của tiệm nail & mi bên dưới. Nhiệm vụ: tư vấn dịch vụ, giá, thời gian làm, giờ mở cửa, địa chỉ và hướng dẫn đặt lịch.\n"
			. "QUY TẮC BẮT BUỘC:\n"
			. "1. Chỉ dùng thông tin trong DỮ LIỆU TIỆM. Không bịa dịch vụ, giá, khuyến mãi, chính sách hay cam kết nào khác.\n"
			. "2. Câu hỏi chung không cần dữ liệu tiệm (chào hỏi, hôm nay/ngày mai là thứ mấy, ngày mấy, mẹo chăm sóc móng – mi, chọn màu hợp da, đi tiệc nên làm kiểu gì…): cứ trả lời tự nhiên theo hiểu biết chung, ngắn gọn, rồi khéo léo gợi ý dịch vụ phù hợp của tiệm nếu có. Không có dữ liệu thời gian thực (thời tiết, tin tức) thì nói thật là bạn không xem được. Chỉ khi khách hỏi thông tin CỤ THỂ của tiệm mà dữ liệu không có (dịch vụ/giá không có trong bảng, khuyến mãi, chính sách chưa ghi…) thì nói chưa có thông tin chính xác và mời liên hệ nhân viên qua số {$set['shop_phone']} (gọi hoặc Zalo). Câu hỏi hoàn toàn không liên quan (bài tập, chính trị, nội dung nhạy cảm…) thì từ chối nhẹ nhàng và quay lại chủ đề làm đẹp.\n"
			. "3. Bạn không xem được lịch trống và không tự đặt/giữ/hủy lịch. Muốn đặt lịch: hướng dẫn khách bấm nút Đặt lịch hoặc vào trang đặt lịch để chọn giờ trống.\n"
			. "4. Thanh toán tại tiệm; không nhận thanh toán online qua web hay chat.\n"
			. "5. Tư vấn theo nhu cầu khách (ví dụ đi tiệc, đi làm, móng yếu) nhưng chỉ gợi ý dịch vụ có trong bảng, kèm giá.\n"
			. "6. Trả lời bằng tiếng Việt như một bạn lễ tân dễ thương, tự nhiên: bắt đầu bằng \"Dạ\" khi phù hợp, xưng \"mình\", gọi khách là \"bạn\". Trả lời đúng trọng tâm câu hỏi và theo đúng tình huống (dựa vào giờ hiện tại, ngày trong tuần, những gì khách đã nói trước đó). Không lặp lại nguyên văn câu trả lời trước, không trả lời rập khuôn; khi hợp lý thì hỏi lại một câu ngắn để tư vấn tiếp. Ngắn gọn: 1–4 câu, hoặc danh sách tối đa 6 dòng bắt đầu bằng \"- \". Không dùng bảng, tiêu đề; tối đa 1 emoji. Ghi giá dạng 150.000đ và dùng đúng tên dịch vụ như trong bảng (không ghi kèm nhóm trong ngoặc như \"(Nail)\").\n"
			. "8. Hỏi giờ giấc: so với giờ hiện tại để nói tiệm đang mở hay đã đóng, hôm nay/ngày mai/thứ mấy có mở không, mở lại lúc nào.\n"
			. "7. Không hỏi hay lưu số điện thoại, địa chỉ, thông tin cá nhân của khách trong chat.\n\n"
			. "DỮ LIỆU TIỆM:\n" . self::knowledge();
	}

	/* ------------------------------------------------------------------ AI providers */

	public static function ask_ai( $msgs, $s ) {
		$provider = $s['ai_provider'];
		$model    = $s['ai_model'] ? $s['ai_model'] : self::default_model( $provider );
		$system   = self::system_prompt( $s );
		$args     = array( 'timeout' => 14, 'headers' => array( 'Content-Type' => 'application/json' ) );
		$res      = null;

		if ( 'gemini' === $provider ) {
			$contents = array();
			foreach ( $msgs as $m ) {
				$contents[] = array( 'role' => 'user' === $m['role'] ? 'user' : 'model', 'parts' => array( array( 'text' => $m['text'] ) ) );
			}
			$url                     = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode( $model ) . ':generateContent';
			$args['headers']['x-goog-api-key'] = $s['ai_key'];
			// Model "thinking" ăn vào giới hạn token → câu trả lời bị cụt và chậm. Chat tư vấn không cần suy nghĩ sâu.
			$gen = array( 'temperature' => 0.7, 'maxOutputTokens' => 2048 );
			if ( 0 === strpos( $model, 'gemini-2.5' ) ) {
				$gen['thinkingConfig'] = array( 'thinkingBudget' => false !== strpos( $model, 'pro' ) ? 128 : 0 );
			} elseif ( preg_match( '/^gemini-[3-9]/', $model ) ) {
				$gen['thinkingConfig'] = array( 'thinkingLevel' => 'low' );
			}
			$body = array(
				'system_instruction' => array( 'parts' => array( array( 'text' => $system ) ) ),
				'contents'           => $contents,
				'generationConfig'   => $gen,
			);
			$args['body'] = wp_json_encode( $body );
			$res = wp_remote_post( $url, $args );
			if ( ! is_wp_error( $res ) && 400 === (int) wp_remote_retrieve_response_code( $res ) && false !== stripos( (string) wp_remote_retrieve_body( $res ), 'thinking' ) ) {
				unset( $body['generationConfig']['thinkingConfig'] ); // model không hỗ trợ tùy chọn này → gửi lại không kèm
				$args['body'] = wp_json_encode( $body );
				$res = null;
			}
		} elseif ( 'claude' === $provider ) {
			$url                               = 'https://api.anthropic.com/v1/messages';
			$args['headers']['x-api-key']      = $s['ai_key'];
			$args['headers']['anthropic-version'] = '2023-06-01';
			$args['body']                      = wp_json_encode( array(
				'model'      => $model,
				'max_tokens' => 1024,
				'system'     => $system,
				'messages'   => self::alternate( $msgs, 'assistant' ),
			) );
		} elseif ( 'openai' === $provider ) {
			$url                              = 'https://api.openai.com/v1/chat/completions';
			$args['headers']['Authorization'] = 'Bearer ' . $s['ai_key'];
			$args['body']                     = wp_json_encode( array(
				'model'                 => $model,
				'max_completion_tokens' => 1024,
				'messages'              => array_merge( array( array( 'role' => 'system', 'content' => $system ) ), self::alternate( $msgs, 'assistant' ) ),
			) );
		} else {
			return new WP_Error( 'rb_ai', 'Chưa chọn nhà cung cấp AI.' );
		}

		if ( empty( $res ) ) {
			$res = wp_remote_post( $url, $args );
		}
		if ( is_wp_error( $res ) ) {
			return new WP_Error( 'rb_ai', 'Không kết nối được tới máy chủ AI: ' . $res->get_error_message(), array( 'status' => 0 ) );
		}
		$code = (int) wp_remote_retrieve_response_code( $res );
		$j    = json_decode( wp_remote_retrieve_body( $res ), true );
		if ( $code < 200 || $code >= 300 ) {
			$msg = '';
			if ( is_array( $j ) ) {
				$msg = $j['error']['message'] ?? ( is_string( $j['error'] ?? null ) ? $j['error'] : '' );
			}
			$hint = ( 401 === $code || 403 === $code || ( 400 === $code && false !== stripos( (string) wp_remote_retrieve_body( $res ), 'API key' ) ) ) ? ' (khóa API sai hoặc chưa được cấp quyền – copy lại khóa và dán lại)' : ( 404 === $code ? ' (tên model không đúng)' : ( 429 === $code ? ' (hết hạn mức miễn phí / vượt giới hạn)' : '' ) );
			return new WP_Error( 'rb_ai', 'AI báo lỗi ' . $code . $hint . ( $msg ? ': ' . mb_substr( $msg, 0, 200 ) : '' ), array( 'status' => $code ) );
		}
		$text = '';
		if ( 'gemini' === $provider ) {
			foreach ( (array) ( $j['candidates'][0]['content']['parts'] ?? array() ) as $part ) {
				$text .= empty( $part['thought'] ) ? ( $part['text'] ?? '' ) : '';
			}
		} elseif ( 'claude' === $provider ) {
			foreach ( (array) ( $j['content'] ?? array() ) as $part ) {
				$text .= ( 'text' === ( $part['type'] ?? '' ) ) ? $part['text'] : '';
			}
		} else {
			$text = (string) ( $j['choices'][0]['message']['content'] ?? '' );
		}
		$text = trim( $text );
		if ( '' === $text ) {
			return new WP_Error( 'rb_ai', 'AI không trả về nội dung.' );
		}
		return mb_substr( $text, 0, 1500 );
	}

	/** Merge consecutive same-role turns (APIs require user/assistant alternation). */
	private static function alternate( $msgs, $bot_role ) {
		$out = array();
		foreach ( $msgs as $m ) {
			$role = 'user' === $m['role'] ? 'user' : $bot_role;
			if ( $out && end( $out )['role'] === $role ) {
				$out[ count( $out ) - 1 ]['content'] .= "\n" . $m['text'];
			} else {
				$out[] = array( 'role' => $role, 'content' => $m['text'] );
			}
		}
		return $out;
	}

	/* ------------------------------------------------------------------ text-to-speech (giọng nữ của Gemini) */

	public static function tts_voices() {
		return array(
			'Aoede'      => 'Aoede – nữ, nhẹ nhàng, tự nhiên',
			'Leda'       => 'Leda – nữ, trẻ trung',
			'Kore'       => 'Kore – nữ, rõ ràng, chắc chắn',
			'Zephyr'     => 'Zephyr – nữ, tươi sáng',
			'Despina'    => 'Despina – nữ, mềm mại',
			'Callirrhoe' => 'Callirrhoe – nữ, thoải mái',
		);
	}

	public static function tts_ready( $s = null ) {
		$s = $s ? $s : self::get();
		return 'auto' === $s['tts'] && 'gemini' === $s['ai_provider'] && '' !== trim( (string) $s['ai_key'] );
	}

	private static function tts_dir() {
		$u = wp_upload_dir();
		return array( trailingslashit( $u['basedir'] ) . 'rb-tts', trailingslashit( $u['baseurl'] ) . 'rb-tts' );
	}

	public static function tts( WP_REST_Request $req ) {
		$s = self::get();
		if ( ! self::tts_ready( $s ) || get_transient( 'rb_chat_tts_down' ) ) {
			return new WP_REST_Response( array( 'ok' => false ), 200 );
		}
		$text = trim( mb_substr( sanitize_textarea_field( (string) $req->get_param( 'text' ) ), 0, 700 ) );
		if ( '' === $text ) {
			return new WP_REST_Response( array( 'ok' => false ), 400 );
		}
		$key = 'rb_rl_tts_' . md5( self::ip() );
		$n   = (int) get_transient( $key );
		if ( $n >= 40 ) {
			return new WP_REST_Response( array( 'ok' => false ), 200 );
		}
		set_transient( $key, $n + 1, 10 * MINUTE_IN_SECONDS );
		$url = self::make_tts( $text, $s );
		if ( is_wp_error( $url ) ) {
			set_transient( 'rb_chat_tts_down', 1, 10 * MINUTE_IN_SECONDS );
			set_transient( 'rb_chat_ai_error', wp_date( 'H:i d/m' ) . ' – Giọng đọc: ' . $url->get_error_message(), DAY_IN_SECONDS );
			return new WP_REST_Response( array( 'ok' => false ), 200 );
		}
		return new WP_REST_Response( array( 'ok' => true, 'url' => $url ), 200 );
	}

	/** Returns the URL of a cached WAV file of the text read by a Gemini female voice. */
	public static function make_tts( $text, $s ) {
		list( $dir, $base ) = self::tts_dir();
		$voice = $s['tts_voice'] ? $s['tts_voice'] : 'Aoede';
		$hash  = md5( $voice . '|' . $text );
		$file  = $dir . '/' . $hash . '.wav';
		if ( file_exists( $file ) ) {
			return $base . '/' . $hash . '.wav';
		}
		if ( ! wp_mkdir_p( $dir ) ) {
			return new WP_Error( 'rb_tts', 'Không tạo được thư mục lưu âm thanh.' );
		}
		if ( ! file_exists( $dir . '/index.html' ) ) {
			file_put_contents( $dir . '/index.html', '' );
		}
		if ( 1 === wp_rand( 1, 40 ) ) { // dọn file cũ hơn 7 ngày
			foreach ( (array) glob( $dir . '/*.wav' ) as $f ) {
				if ( filemtime( $f ) < time() - 7 * DAY_IN_SECONDS ) {
					wp_delete_file( $f );
				}
			}
		}
		$models = array( 'gemini-2.5-flash-preview-tts', 'gemini-3.1-flash-tts-preview', 'gemini-3.8-flash-tts' );
		$last   = null;
		foreach ( $models as $model ) {
			$res = wp_remote_post( 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent', array(
				'timeout' => 25,
				'headers' => array( 'Content-Type' => 'application/json', 'x-goog-api-key' => $s['ai_key'] ),
				'body'    => wp_json_encode( array(
					'contents'         => array( array( 'parts' => array( array( 'text' => 'Đọc bằng tiếng Việt, giọng nữ trẻ, ấm áp, thân thiện như lễ tân tiệm nail, tốc độ vừa phải: ' . $text ) ) ) ),
					'generationConfig' => array(
						'responseModalities' => array( 'AUDIO' ),
						'speechConfig'       => array( 'voiceConfig' => array( 'prebuiltVoiceConfig' => array( 'voiceName' => $voice ) ) ),
					),
				) ),
			) );
			if ( is_wp_error( $res ) ) {
				return new WP_Error( 'rb_tts', 'Không kết nối được máy chủ giọng đọc: ' . $res->get_error_message() );
			}
			$code = (int) wp_remote_retrieve_response_code( $res );
			$j    = json_decode( wp_remote_retrieve_body( $res ), true );
			if ( 404 === $code ) {
				$last = 'Không tìm thấy model giọng đọc.';
				continue;
			}
			if ( $code < 200 || $code >= 300 ) {
				return new WP_Error( 'rb_tts', 'Lỗi ' . $code . ( 429 === $code ? ' (hết lượt giọng đọc miễn phí hôm nay)' : '' ) . ': ' . mb_substr( (string) ( $j['error']['message'] ?? '' ), 0, 160 ) );
			}
			$part = $j['candidates'][0]['content']['parts'][0]['inlineData'] ?? null;
			if ( ! $part || empty( $part['data'] ) ) {
				$last = 'Model không trả về âm thanh.';
				continue;
			}
			$pcm  = base64_decode( $part['data'] );
			$rate = preg_match( '/rate=(\d+)/', (string) ( $part['mimeType'] ?? '' ), $m ) ? (int) $m[1] : 24000;
			$wav  = 'RIFF' . pack( 'V', 36 + strlen( $pcm ) ) . 'WAVEfmt ' . pack( 'VvvVVvv', 16, 1, 1, $rate, $rate * 2, 2, 16 ) . 'data' . pack( 'V', strlen( $pcm ) ) . $pcm;
			file_put_contents( $file, $wav );
			return $base . '/' . $hash . '.wav';
		}
		return new WP_Error( 'rb_tts', $last ? $last : 'Không tạo được giọng đọc.' );
	}

	/* ------------------------------------------------------------------ rule-based answers */

	/** Services whose full name appears in a text (used to attach "Đặt lịch" cards). */
	public static function services_in( $text ) {
		$t   = ' ' . self::norm( $text ) . ' ';
		$hit = array();
		foreach ( RB_DB::get_services() as $sv ) {
			$n = self::norm( $sv['name'] );
			if ( '' !== $n && false !== strpos( $t, ' ' . $n . ' ' ) ) {
				$hit[ $sv['id'] ] = array( strlen( $n ), $sv );
			}
		}
		uasort( $hit, function ( $a, $b ) { return $b[0] - $a[0]; } );
		return array_values( array_map( function ( $h ) { return $h[1]; }, $hit ) );
	}

	private static function match_services( $qn ) {
		$stop  = array( 'dich', 'vu', 'gia', 'bao', 'nhieu', 'lam', 'co', 'khong', 'the', 'cho', 'minh', 'toi', 'em', 'a', 'oi', 'la', 'va', 'cua', 'tiem', 've', 'mot', 'cai', 'nhe', 'tien', 'lau' );
		$qt    = array_diff( explode( ' ', $qn ), $stop );
		$out   = array();
		foreach ( RB_DB::get_services() as $sv ) {
			$n  = self::norm( $sv['name'] );
			$nt = array_values( array_diff( array_filter( explode( ' ', $n ) ), $stop ) );
			if ( ! $nt ) {
				continue;
			}
			if ( false !== strpos( ' ' . $qn . ' ', ' ' . $n . ' ' ) ) {
				$score = 2;
			} else {
				$score = count( array_intersect( $nt, $qt ) ) / count( $nt );
			}
			if ( $score >= 0.6 ) {
				$out[] = array( $score, $sv );
			}
		}
		usort( $out, function ( $a, $b ) { return $b[0] <=> $a[0] ?: ( (int) $a[1]['price'] - (int) $b[1]['price'] ); } );
		return array_map( function ( $o ) { return $o[1]; }, $out );
	}

	private static function has( $qn, $words ) {
		$q = ' ' . $qn . ' ';
		foreach ( $words as $w ) {
			if ( false !== strpos( $q, ' ' . $w . ' ' ) ) {
				return true;
			}
		}
		return false;
	}

	private static function pick( $arr ) {
		return $arr[ wp_rand( 0, count( $arr ) - 1 ) ];
	}

	/** "Mấy giờ mở cửa / mai có mở không / bây giờ còn mở không" – trả lời theo đúng thời điểm. */
	public static function hours_answer( $qn ) {
		$set   = rb_settings();
		$tz    = wp_timezone();
		$now   = new DateTimeImmutable( 'now', $tz );
		$days  = array_map( 'intval', (array) $set['open_days'] );
		$names = array( 'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7' );
		$open  = $set['open_time'];
		$close = $set['close_time'];
		$label = function ( DateTimeImmutable $d ) use ( $names ) { return $names[ (int) $d->format( 'w' ) ] . ' (' . $d->format( 'd/m' ) . ')'; };
		$next_open = function ( DateTimeImmutable $from ) use ( $days ) {
			for ( $i = 1; $i <= 7; $i++ ) {
				$d = $from->modify( "+$i day" );
				if ( in_array( (int) $d->format( 'w' ), $days, true ) ) {
					return $d;
				}
			}
			return $from->modify( '+1 day' );
		};
		$q      = ' ' . $qn . ' ';
		$target = null;
		if ( preg_match( '/ (ngay mai|mai) /', $q ) ) {
			$target = $now->modify( '+1 day' );
		} elseif ( preg_match( '/ (ngay mot|mot) /', $q ) ) {
			$target = $now->modify( '+2 day' );
		} else {
			$map = array( 'chu nhat' => 0, 'cn' => 0, 'thu 2' => 1, 'thu hai' => 1, 'thu 3' => 2, 'thu ba' => 2, 'thu 4' => 3, 'thu tu' => 3, 'thu 5' => 4, 'thu nam' => 4, 'thu 6' => 5, 'thu sau' => 5, 'thu 7' => 6, 'thu bay' => 6 );
			foreach ( $map as $w => $n ) {
				if ( false !== strpos( $q, ' ' . $w . ' ' ) ) {
					$add    = ( $n - (int) $now->format( 'w' ) + 7 ) % 7;
					$target = $now->modify( "+$add day" );
					break;
				}
			}
		}
		$prefix = '';
		if ( preg_match( '/ (bay gio|gio) la may gio | may gio roi /', $q ) ) {
			$prefix = 'Bây giờ là ' . $now->format( 'H:i' ) . ' ' . strtolower( $names[ (int) $now->format( 'w' ) ] ) . '. ';
		}
		if ( $target && $target->format( 'Y-m-d' ) !== $now->format( 'Y-m-d' ) ) {
			if ( in_array( (int) $target->format( 'w' ), $days, true ) ) {
				return $prefix . self::pick( array( 'Dạ có ạ! ', 'Dạ có nha, ' ) ) . $label( $target ) . ' tiệm mở cửa từ ' . $open . ' đến ' . $close . '. ' . self::pick( array( 'Bạn đặt lịch trước để mình giữ chỗ và thợ cho bạn nhé.', 'Bạn muốn đặt giờ nào thì bấm Đặt lịch, chọn giờ còn trống là xong ạ.' ) );
			}
			$n = $next_open( $target );
			return $prefix . 'Dạ ' . $label( $target ) . ' tiệm nghỉ ạ. Tiệm mở lại vào ' . $label( $n ) . ', từ ' . $open . ' đến ' . $close . '.';
		}
		$t = $now->format( 'H:i' );
		if ( ! in_array( (int) $now->format( 'w' ), $days, true ) ) {
			$n = $next_open( $now );
			return $prefix . 'Hôm nay tiệm nghỉ ạ. Tiệm mở lại vào ' . $label( $n ) . ' từ ' . $open . ' đến ' . $close . '. Bạn vẫn có thể đặt lịch trước trên web nhé!';
		}
		if ( $t < $open ) {
			return $prefix . 'Hôm nay tiệm mở cửa lúc ' . $open . ' và làm đến ' . $close . ' ạ. ' . self::pick( array( 'Bạn đặt lịch trước để đến là có thợ làm liền nhé!', 'Bạn muốn ghé khung giờ nào để mình hướng dẫn đặt lịch ạ?' ) );
		}
		if ( $t < $close ) {
			$left = ( strtotime( $now->format( 'Y-m-d' ) . ' ' . $close ) - strtotime( $now->format( 'Y-m-d H:i' ) ) ) / 60;
			$hint = $left <= 90 ? ' Gần giờ đóng cửa rồi nên bạn đặt lịch trước để chắc chắn còn thợ nhé.' : ' Bạn đặt lịch trước để không phải chờ nhé.';
			return $prefix . self::pick( array( 'Dạ tiệm đang mở cửa', 'Hiện tiệm đang mở cửa' ) ) . ' đến ' . $close . ' hôm nay ạ.' . $hint;
		}
		$n = $next_open( $now );
		return $prefix . 'Hôm nay tiệm đã đóng cửa lúc ' . $close . ' rồi ạ. ' . ( (int) $n->diff( $now )->days <= 1 && $n->format( 'Y-m-d' ) === $now->modify( '+1 day' )->format( 'Y-m-d' ) ? 'Ngày mai' : $label( $n ) ) . ' tiệm mở lại từ ' . $open . '. Bạn có thể đặt lịch ngay bây giờ trên web, tiệm sẽ xác nhận sớm nhé!';
	}

	public static function faq( $q ) {
		$set  = rb_settings();
		$s    = self::get();
		$qn   = self::norm( $q );
		$name = $s['bot_name'];
		$res  = function ( $intent, $reply, $services = array(), $contact = false, $links = array() ) {
			return array( 'intent' => $intent, 'reply' => $reply, 'services' => array_map( array( __CLASS__, 'card' ), $services ), 'contact' => $contact, 'links' => $links );
		};
		$book = array( array( 'label' => 'Đặt lịch ngay', 'url' => self::booking_url() ) );

		if ( '' === $qn ) {
			return $res( 'empty', 'Bạn muốn hỏi gì ạ? Bạn có thể chọn một câu gợi ý bên dưới nhé.' );
		}
		if ( self::has( $qn, array( 'cam on', 'thanks', 'thank', 'tks', 'ok cam on' ) ) ) {
			return $res( 'thanks', 'Dạ không có gì ạ! Khi cần bạn cứ nhắn ' . $name . ' nhé. Hẹn gặp bạn ở tiệm!', array(), false, $book );
		}
		if ( preg_match( '/^(xin chao|chao|hello|hi|alo|hey|chao ban|chao shop|chao tiem|shop oi|tiem oi|ad oi)( .{0,12})?$/', $qn ) ) {
			return $res( 'greet', $s['greeting'] );
		}

		if ( preg_match( '/ (hom nay|ngay mai|mai|ngay mot|hom qua) (la )?(thu may|ngay may|ngay bao nhieu|thu gi) /', ' ' . $qn . ' ', $mm ) || preg_match( '/^(thu may|ngay may|hom nay ngay may)/', $qn ) ) {
			$offs = array( 'hom nay' => 0, 'ngay mai' => 1, 'mai' => 1, 'ngay mot' => 2, 'hom qua' => -1 );
			$o    = isset( $mm[1] ) ? $offs[ $mm[1] ] : 0;
			$d    = ( new DateTimeImmutable( 'now', wp_timezone() ) )->modify( ( $o >= 0 ? '+' : '' ) . $o . ' day' );
			$wd   = array( 'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7' );
			$open = in_array( (int) $d->format( 'w' ), array_map( 'intval', (array) $set['open_days'] ), true );
			$lab  = array( 0 => 'Hôm nay', 1 => 'Ngày mai', 2 => 'Ngày mốt', -1 => 'Hôm qua' );
			return $res( 'date', 'Dạ ' . mb_strtolower( $lab[ $o ] ) . ' là ' . $wd[ (int) $d->format( 'w' ) ] . ', ngày ' . $d->format( 'd/m/Y' ) . ' ạ.' . ( 0 === $o ? ' ' . self::hours_answer( '' ) : '' ) . ( $o > 0 ? ( $open ? ' Tiệm mở cửa từ ' . $set['open_time'] . ' đến ' . $set['close_time'] . ', bạn muốn đặt lịch không ạ?' : ' Hôm đó tiệm nghỉ nha bạn.' ) : '' ), array(), false, $o >= 0 && $open ? $book : array() );
		}
		$services = self::match_services( $qn );
		$ask_time = self::has( $qn, array( 'bao lau', 'mat bao lau', 'lam lau', 'thoi gian', 'may tieng', 'bao nhieu phut' ) );

		if ( self::has( $qn, array( 'thanh toan', 'chuyen khoan', 'tra tien', 'quet ma', 'momo', 'the ngan hang', 'tien mat', 'coc', 'dat coc' ) ) ) {
			return $res( 'pay', 'Bạn thanh toán trực tiếp tại tiệm sau khi làm xong (tiền mặt hoặc chuyển khoản tại quầy). Khi đặt lịch trên web bạn không cần trả trước hay đặt cọc ạ.', array(), false, $book );
		}
		if ( self::has( $qn, array( 'huy lich', 'huy hen', 'doi lich', 'doi gio', 'doi ngay', 'hoan lich', 'huy dat' ) ) ) {
			return $res( 'cancel', 'Bạn có thể tự hủy lịch trước giờ hẹn ít nhất ' . (int) $set['cancel_before'] . ' giờ tại trang tra cứu lịch hẹn (nhập mã lịch hẹn và số điện thoại). Muốn đổi giờ, bạn hủy lịch cũ rồi đặt lại, hoặc gọi tiệm ' . $set['shop_phone'] . ' để được hỗ trợ.', array(), true, array( array( 'label' => 'Tra cứu / hủy lịch', 'url' => self::status_url() ) ) );
		}
		if ( self::has( $qn, array( 'tra cuu', 'xem lich', 'kiem tra lich', 'lich cua toi', 'ma lich', 'da dat' ) ) ) {
			return $res( 'lookup', 'Bạn xem lại lịch đã đặt tại trang tra cứu bằng mã lịch hẹn và số điện thoại. Nếu có tài khoản, bạn vào mục Quản lý lịch hẹn để xem tất cả lịch của mình.', array(), false, array( array( 'label' => 'Tra cứu lịch hẹn', 'url' => self::status_url() ) ) );
		}
		if ( ! $services && self::has( $qn, array( 'dat lich', 'book', 'booking', 'dat hen', 'hen lich', 'giu cho', 'dat cho', 'lay lich' ) ) ) {
			return $res( 'book', "Đặt lịch trên web chỉ mất khoảng 1 phút:\n- Chọn dịch vụ\n- Chọn kỹ thuật viên (hoặc để tiệm sắp xếp)\n- Chọn ngày và giờ còn trống\n- Nhập tên, số điện thoại rồi xác nhận\nTiệm sẽ xác nhận lịch và gửi thông báo cho bạn.", array(), false, $book );
		}
		if ( self::has( $qn, array( 'may gio', 'gio mo', 'mo cua', 'dong cua', 'gio lam', 'lam viec', 'mo den', 'nghi', 'chu nhat', 'cuoi tuan', 'ngay le', 'con mo', 'co mo', 'mo khong' ) ) ) {
			return $res( 'hours', self::hours_answer( $qn ), array(), false, $book );
		}
		if ( self::has( $qn, array( 'dia chi', 'o dau', 'cho nao', 'duong nao', 'ban do', 'map', 'chi duong', 'gui xe', 'dau xe' ) ) ) {
			return $res( 'address', 'Tiệm ở ' . $set['shop_address'] . '. Bạn bấm nút bên dưới để mở bản đồ chỉ đường nhé.', array(), false, array( array( 'label' => 'Mở Google Maps', 'url' => 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode( wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ) . ' ' . $set['shop_address'] ) ) ) );
		}
		if ( self::has( $qn, array( 'so dien thoai', 'sdt', 'hotline', 'lien he', 'zalo', 'facebook', 'fanpage', 'nhan vien', 'nguoi that', 'tu van vien', 'goi dien', 'goi tiem' ) ) ) {
			return $res( 'contact', 'Bạn liên hệ tiệm qua số ' . $set['shop_phone'] . ' (gọi hoặc Zalo) để gặp nhân viên nhé. Bạn cũng có thể bấm các nút liên hệ bên dưới.', array(), true );
		}
		if ( self::has( $qn, array( 'tho', 'ky thuat vien', 'ktv', 'nhan vien lam' ) ) && ! $services ) {
			$staff = array_map( function ( $st ) { return '- ' . $st['name'] . ( $st['title'] ? ' – ' . $st['title'] : '' ); }, RB_DB::get_staff_list() );
			return $res( 'staff', $staff ? "Các kỹ thuật viên của tiệm:\n" . implode( "\n", $staff ) . "\nKhi đặt lịch bạn có thể chọn thợ mình muốn hoặc để tiệm sắp xếp." : 'Khi đặt lịch bạn có thể chọn thợ hoặc để tiệm sắp xếp ạ.', array(), false, $book );
		}

		if ( $services ) {
			$top = array_slice( $services, 0, 5 );
			if ( 1 === count( $top ) ) {
				$sv = $top[0];
				$d  = trim( wp_strip_all_tags( (string) $sv['description'] ) );
				$r  = $ask_time
					? $sv['name'] . ' làm khoảng ' . self::dur( $sv['duration'] ) . ', giá ' . rb_format_price( $sv['price'] ) . '.'
					: $sv['name'] . ' giá ' . rb_format_price( $sv['price'] ) . ', làm khoảng ' . self::dur( $sv['duration'] ) . '.';
				if ( $d ) {
					$r .= ' ' . mb_substr( $d, 0, 160 ) . ( mb_strlen( $d ) > 160 ? '…' : '' );
				}
				return $res( 'service', self::pick( array( 'Dạ, ', 'Dạ bên mình có ạ! ', '' ) ) . $r . ' ' . self::pick( array( 'Bạn bấm "Đặt lịch" để chọn giờ trống nhé!', 'Bạn muốn làm thì bấm "Đặt lịch" bên dưới, chọn giờ là xong ạ.', 'Bạn cần mình tư vấn thêm mẫu hay màu không ạ?' ) ), $top );
			}
			$lines = array_map( function ( $sv ) { return '- ' . $sv['name'] . ': ' . rb_format_price( $sv['price'] ) . ' (' . self::dur( $sv['duration'] ) . ')'; }, $top );
			$more  = count( $services ) > 5 ? "\nCòn " . ( count( $services ) - 5 ) . ' dịch vụ tương tự, bạn xem đầy đủ ở trang đặt lịch nhé.' : '';
			return $res( 'service', self::pick( array( "Dạ, bên mình có mấy lựa chọn này ạ:\n", "Mình tìm thấy các dịch vụ sau:\n", "Dạ, giá tham khảo của tiệm nè:\n" ) ) . implode( "\n", $lines ) . $more, array_slice( $top, 0, 3 ), false, $book );
		}

		$cats = self::cats();
		$want = null;
		if ( self::has( $qn, array( 'mi', 'noi mi', 'lash', 'mat' ) ) ) {
			$want = 'mi';
		} elseif ( self::has( $qn, array( 'combo', 'goi' ) ) ) {
			$want = 'combo';
		} elseif ( self::has( $qn, array( 'nail', 'mong', 'son', 'gel', 'mong tay', 'mong chan', 've mong' ) ) ) {
			$want = 'nail';
		}
		if ( $want || self::has( $qn, array( 'bang gia', 'menu', 'dich vu', 'co gi', 'nhung gi', 'gia', 'bao nhieu', 'gia ca', 'list' ) ) ) {
			$all = RB_DB::get_services();
			if ( $want ) {
				$list = array_values( array_filter( $all, function ( $sv ) use ( $want ) { return $sv['category'] === $want; } ) );
				if ( $list ) {
					$prices = array_map( function ( $sv ) { return (int) $sv['price']; }, $list );
					$lines  = array_map( function ( $sv ) { return '- ' . $sv['name'] . ': ' . rb_format_price( $sv['price'] ); }, array_slice( $list, 0, 6 ) );
					return $res( 'category', 'Dịch vụ ' . $cats[ $want ] . ' của tiệm có ' . count( $list ) . ' lựa chọn, ' . ( min( $prices ) === max( $prices ) ? 'giá ' . rb_format_price( min( $prices ) ) : 'giá từ ' . rb_format_price( min( $prices ) ) . ' đến ' . rb_format_price( max( $prices ) ) ) . ":\n" . implode( "\n", $lines ) . ( count( $list ) > 6 ? "\n…và " . ( count( $list ) - 6 ) . ' dịch vụ khác ở trang đặt lịch.' : '' ) . "\nBạn hỏi tên dịch vụ cụ thể để mình báo chi tiết nhé!", array(), false, $book );
				}
			}
			$parts = array();
			foreach ( $cats as $k => $label ) {
				$list = array_filter( $all, function ( $sv ) use ( $k ) { return $sv['category'] === $k; } );
				if ( $list ) {
					$prices  = array_map( function ( $sv ) { return (int) $sv['price']; }, $list );
					$parts[] = '- ' . $label . ': ' . count( $list ) . ' dịch vụ, từ ' . rb_format_price( min( $prices ) );
				}
			}
			return $res( 'menu', "Tiệm có các nhóm dịch vụ:\n" . implode( "\n", $parts ) . "\nBạn muốn xem bảng giá nhóm nào, hay hỏi tên dịch vụ cụ thể (ví dụ \"sơn gel\", \"nối mi\") ạ?", array(), false, $book );
		}

		return $res( 'unknown', 'Dạ câu này ' . $name . ' chưa trả lời chắc chắn được ạ. Bạn thử hỏi cách khác, hoặc liên hệ nhân viên qua số ' . $set['shop_phone'] . ' (gọi hoặc Zalo) để được tư vấn kỹ hơn nhé!', array(), true );
	}
}
