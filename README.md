# Ruby Nails Booking – Hệ thống đặt lịch tích hợp AI Chatbot

Dự án môn học của **Nhóm 60**: hệ thống đặt lịch trực tuyến cho tiệm **Ruby Nails & Eyelash**, 264 Đống Đa, Hải Châu, Đà Nẵng.

- Website: https://rubynails.id.vn
- Thành viên:
  - Bùi Thị Vân Nhi – PM / QA
  - Trần Ngọc Diễm – BA
  - Nguyễn Thị Kim Ly – UX / System Analyst

## 1. Công nghệ và môi trường

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Nền tảng web | WordPress + theme Flatsome | …… (điền theo hosting) |
| Ngôn ngữ xử lý | PHP | …… (khuyến nghị ≥ 8.0) |
| Cơ sở dữ liệu | MySQL / MariaDB, utf8mb4 | …… |
| Plugin nghiệp vụ | `ruby-nails-core` (repo này) | 0.1.0 |
| Hosting | SSD Hosting Tenten, tên miền rubynails.id.vn, HTTPS | – |

| Môi trường | Địa chỉ | Dùng để |
|---|---|---|
| Local (máy cá nhân) | `http://rubynails.local` (LocalWP hoặc XAMPP) | Code và thử |
| Staging | `test.rubynails.id.vn` hoặc thư mục con trên hosting | Thử trước khi đưa lên web thật |
| Production | `https://rubynails.id.vn` | Khách dùng thật |

## 2. Cấu trúc thư mục

```
ruby-nails-booking/
├── README.md
├── .gitignore
├── .env.example                  # mẫu biến môi trường (không chứa mật khẩu thật)
├── docs/                         # architecture.png, erd.pdf, wireframe.pdf
├── database/
│   ├── schema.sql                # 10 bảng theo ERD (CSDL demo độc lập, có FOREIGN KEY)
│   ├── sample_data.sql           # dữ liệu mẫu cho schema.sql
│   ├── kiem_tra.sql              # truy vấn kiểm tra luật nghiệp vụ
│   └── sample_data_plugin.sql    # cùng dữ liệu mẫu, dùng cho bảng do plugin tạo (wp_ruby_*)
└── wp-content/plugins/ruby-nails-core/
    ├── ruby-nails-core.php       # file chính: kích hoạt → migration + vai trò
    ├── uninstall.php
    ├── includes/
    │   ├── class-migrator.php    # migration 10 bảng (dbDelta), DB_VERSION
    │   ├── class-roles.php       # vai trò Chủ tiệm / Lễ tân / Kỹ thuật viên (FR12)
    │   └── class-rest.php        # API /ruby-nails/v1/ping, /services
    ├── modules/                  # 6 module = 6 tiến trình DFD Level 0
    │   ├── tu-van/               # 1.0 Tư vấn (chatbot) – FR10, FR11, FR17
    │   ├── dat-lich/             # 2.0 Đặt lịch – FR01–FR04, FR09
    │   ├── quan-ly-lich/         # 3.0 Quản lý lịch hẹn – FR06–FR08
    │   ├── thong-bao/            # 4.0 Thông báo – FR05, FR07, FR16
    │   ├── quan-ly-du-lieu/      # 5.0 Quản lý dữ liệu – FR12, FR15, FR17, FR18
    │   └── bao-cao/              # 6.0 Báo cáo – FR13
    ├── templates/                # giao diện các trang (theo wireframe)
    └── assets/                   # css, js
```

## 3. Cài đặt trên máy cá nhân (Local)

1. Cài **LocalWP** (https://localwp.com), tạo site mới tên `rubynails`.
2. Copy thư mục `wp-content/plugins/ruby-nails-core` vào `wp-content/plugins` của site.
3. Vào **WP Admin → Plugins**, kích hoạt **Ruby Nails Core (Skeleton)**. Plugin sẽ tự tạo 10 bảng `wp_ruby_*` và 3 vai trò.
4. Mở **Adminer/phpMyAdmin** (LocalWP: tab *Database*), import `database/sample_data_plugin.sql`.
5. Tạo 3 trang và chèn shortcode:

| Trang | Đường dẫn | Shortcode |
|---|---|---|
| Đặt lịch | `/dat-lich` | `[rn_dat_lich]` |
| Tra cứu lịch hẹn | `/tra-cuu-lich-hen` | `[rn_tra_cuu]` |
| Quản lý | `/quan-ly` | `[rn_quan_ly]` |

## 4. Cài đặt trên hosting (Staging / Production)

1. **Sao lưu CSDL trước** (cPanel → phpMyAdmin → Export).
2. Nén thư mục `ruby-nails-core` thành `.zip`, rồi vào **WP Admin → Plugins → Add New → Upload Plugin**.
3. Kích hoạt plugin, làm tiếp bước 4–5 như ở máy cá nhân.

Website đang chạy đã có plugin đặt lịch cũ (bảng `wp_rb_*`). Plugin này dùng tiền tố khác (`wp_ruby_*`) nên không ghi đè dữ liệu cũ, nhưng **chỉ nên kích hoạt ở Local/Staging** cho tới khi nhóm quyết định chuyển hẳn.

## 5. Database / migration

- Migration nằm trong `includes/class-migrator.php`. Khi kích hoạt plugin, `dbDelta()` sẽ tạo hoặc cập nhật 10 bảng theo ERD và thêm cài đặt mặc định vào `wp_ruby_shop_setting`.
- **Đổi cấu trúc bảng:** sửa câu `CREATE TABLE`, rồi tăng `DB_VERSION` (ví dụ `1.0.0` → `1.1.0`). Lần tải trang kế tiếp plugin tự chạy lại migration.
- `database/schema.sql` là bản ERD đầy đủ có `FOREIGN KEY` và `CHECK`, dùng cho CSDL demo độc lập. Bảng của plugin WordPress không dùng FOREIGN KEY; ràng buộc được kiểm tra trong code (ERD mục 7).

| Bảng ERD | Bảng plugin |
|---|---|
| USER_ACCOUNT | wp_ruby_user_account |
| CUSTOMER | wp_ruby_customer |
| STAFF | wp_ruby_staff |
| SERVICE | wp_ruby_service |
| STAFF_SERVICE | wp_ruby_staff_service |
| BOOKING | wp_ruby_booking |
| BOOKING_SERVICE | wp_ruby_booking_service |
| BOOKING_IMAGE | wp_ruby_booking_image |
| BOOKING_LOG | wp_ruby_booking_log |
| SHOP_SETTING | wp_ruby_shop_setting |

## 6. Kiểm tra "skeleton chạy được"

| # | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| 1 | Kích hoạt plugin | Không báo lỗi |
| 2 | phpMyAdmin | Có đủ 10 bảng `wp_ruby_*` |
| 3 | Mở `/wp-json/ruby-nails/v1/ping` | `"status":"ok"`, `"db_version":"1.0.0"`, số dòng từng bảng (booking = 40 sau khi import dữ liệu mẫu) |
| 4 | Mở `/wp-json/ruby-nails/v1/services` | Danh sách 32 dịch vụ đang áp dụng |
| 5 | Mở `/dat-lich` | Thanh 5 bước và danh sách dịch vụ kèm giá |
| 6 | Mở `/quan-ly` khi chưa đăng nhập | Hiện form đăng nhập |
| 7 | Đăng nhập bằng tài khoản quản trị rồi mở `/quan-ly` | Hiện menu quản lý theo quyền |

Kiểm tra dữ liệu: import `database/schema.sql` + `sample_data.sql` vào một CSDL riêng, rồi chạy `kiem_tra.sql`. Các truy vấn 2–6 phải trả về 0 dòng.

## 7. Quy ước làm việc

- **Nhánh:**
  - `main`: bản ổn định, đang chạy trên hosting.
  - `dev`: bản đang phát triển.
  - `feature/<ten-viec>`: mỗi việc một nhánh riêng, ví dụ `feature/dat-lich`.
- **Commit:** `loại(phạm vi): nội dung – mã yêu cầu`, ví dụ `feat(dat-lich): chặn khung giờ trùng thợ – FR03`. Loại gồm `feat`, `fix`, `docs`, `db`.
- **Gộp vào `main`:** qua Pull Request, có ít nhất 1 thành viên khác xem lại.
- **Không commit** `wp-config.php`, `.env`, mật khẩu hay khóa API.

## 8. Kế hoạch tiếp theo (Backlog MVP)

| Sprint | Nội dung |
|---|---|
| Sprint 4 | Đặt lịch 5 bước, khung giờ trống, xem/xác nhận/hủy/gán thợ, thợ và tài khoản (US-01, 02, 07, 08, 09, 10, 16) |
| Sprint 5 | Thông báo email/SMS, AI chatbot, dịch vụ và giá (US-03, 04, 05, 06, 15) |
| Sprint 6 | Báo cáo KPI (US-11), kiểm thử T01–T23, UAT, go-live |
