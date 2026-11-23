=== Ruby Booking ===
Plugin đặt lịch online cho Ruby Nails & Eyelash (Nhóm 60).

== Shortcode ==
[ruby_booking]          Trang đặt lịch 5 bước (dịch vụ → kỹ thuật viên → ngày giờ → thông tin → xác nhận)
[ruby_booking_status]   Trang tra cứu / hủy lịch hẹn (mã lịch hẹn + số điện thoại)

Link chọn sẵn dịch vụ:  /dat-lich/?chon=ID  hoặc nhiều dịch vụ: /dat-lich/?chon=9,10,11  (?dich-vu=ID vẫn dùng được)
Link tra cứu sẵn mã:    /tra-cuu-lich-hen/?ma=RB-1711-ABC

== Hệ thống quản lý lịch hẹn (/quan-ly/) ==
Trang nội bộ tự tạo khi cập nhật plugin. Dùng chung 3 vai trò với hệ thống tài khoản của nhóm (snippet "Ruby – Tài khoản"):
- Chủ tiệm (ruby_chu_tiem): toàn quyền – lịch hẹn, khách hàng, báo cáo & xuất CSV, Dịch vụ & giá, Kỹ thuật viên, Cài đặt, Tài khoản nhân viên.
- Lễ tân (ruby_le_tan): xác nhận/hủy, gán & đổi thợ, đổi giờ, tạo lịch cho khách gọi điện/vãng lai, xem khách hàng.
- Kỹ thuật viên (ruby_ktv): chỉ xem lịch của chính mình (SĐT khách được ẩn bớt), bấm Bắt đầu / Hoàn thành.
Logo ở trang quản lý → về trang chủ.
Loa thông báo (1.5): nhân viên đăng nhập thấy nút chuông góc trái dưới trên MỌI trang. Khách đặt lịch qua web → trong ~5 giây hiện thông báo + "ting ting" + câu ghi âm của tiệm + đọc tên khách/dịch vụ/giờ (nếu máy có giọng tiếng Việt).
Nhiều tab chỉ đọc 1 lần. Âm thanh ra thiết bị phát mặc định của máy (loa Bluetooth). Ghi âm/tải câu thông báo: /quan-ly/ › Cài đặt › Loa thông báo.
Trên điện thoại: mở /quan-ly/ → "Thêm vào màn hình chính" để dùng như app.
Trạng thái: Chờ xác nhận → Đã xác nhận → Đang thực hiện → Hoàn thành; hoặc Đã hủy (phải nhập lý do) / Khách vắng mặt.

== Khách có tài khoản ==
[ruby_booking_status] tự hiện "Lịch hẹn của tôi" khi khách đăng nhập (lịch đặt bằng tài khoản hoặc theo SĐT của tài khoản – trường ruby_phone), hủy được trước giờ hẹn.
Form đặt lịch tự điền tên, SĐT, email của khách đang đăng nhập.

== Quản trị (wp-admin) ==
Menu "Đặt lịch" trong wp-admin:
- Lịch hẹn: xem, lọc, đổi trạng thái (Chờ xác nhận / Đã xác nhận / Hoàn thành / Đã hủy), xem ảnh mẫu khách gửi
- Dịch vụ: thêm/sửa giá, thời lượng, nhóm (Nail / Mi / Combo), ảnh dọc 3:4 cho thẻ dịch vụ
- Kỹ thuật viên: thêm thợ, ảnh, dịch vụ thợ làm được
- Cài đặt: giờ mở cửa, ngày nghỉ, số ngày cho đặt trước, email nhận thông báo, link chính sách

== Ghi chú ==
- Khi kích hoạt lần đầu, plugin tạo sẵn 8 dịch vụ và 3 kỹ thuật viên mẫu để thử. Sửa/xóa trong menu Đặt lịch.
- Settings → General → Timezone nên đặt "Ho Chi Minh" để giờ hẹn đúng.
- Email gửi bằng wp_mail(). Nếu khách không nhận được email, cài thêm plugin "WP Mail SMTP" và cấu hình Gmail.
- Ảnh mẫu khách tải lên được lưu trong Media (riêng tư), gắn với mã lịch hẹn.
- Link "Xem chi tiết" trên thẻ dịch vụ: lấy từ ô "Link trang chi tiết" của dịch vụ; để trống thì tự lấy từ danh mục dịch vụ của trang (window.RN) nếu có.
- Lựa chọn của khách được nhớ trong phiên duyệt web (2 giờ) khi khách sang trang chi tiết rồi quay lại.

== Thay đổi 1.6.6 (Sprint 4) ==
- Không cho đổi lịch về thời điểm đã qua.
- Chỉ đánh dấu "Khách vắng mặt" sau giờ hẹn.
