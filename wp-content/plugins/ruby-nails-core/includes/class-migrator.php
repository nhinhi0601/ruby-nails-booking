<?php
/**
 * Migration: tạo 10 bảng theo ERD & Relational Schema của nhóm.
 * Tên bảng có tiền tố {$wpdb->prefix}ruby_ (ví dụ wp_ruby_booking) để không trùng bảng của plugin đang chạy.
 * Muốn đổi cấu trúc bảng: sửa câu lệnh bên dưới rồi tăng DB_VERSION – plugin tự cập nhật.
 * Lưu ý: dbDelta() yêu cầu mỗi cột một dòng và 2 dấu cách sau "PRIMARY KEY".
 */
if (!defined('ABSPATH')) {
    exit;
}

class RNC_Migrator
{
    const DB_VERSION = '1.0.0';
    const OPTION     = 'rnc_db_version';

    public static function tables()
    {
        global $wpdb;
        $p = $wpdb->prefix . 'ruby_';
        return [
            'user_account'    => $p . 'user_account',
            'customer'        => $p . 'customer',
            'staff'           => $p . 'staff',
            'service'         => $p . 'service',
            'staff_service'   => $p . 'staff_service',
            'booking'         => $p . 'booking',
            'booking_service' => $p . 'booking_service',
            'booking_image'   => $p . 'booking_image',
            'booking_log'     => $p . 'booking_log',
            'shop_setting'    => $p . 'shop_setting',
        ];
    }

    public static function sql()
    {
        global $wpdb;
        $c = $wpdb->get_charset_collate();
        $t = self::tables();

        return [
"CREATE TABLE {$t['user_account']} (
  User_ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  Username varchar(60) NOT NULL,
  Password_Hash varchar(255) NOT NULL,
  Email varchar(100) NOT NULL,
  Display_Name varchar(250) NOT NULL,
  Phone varchar(20) NULL,
  Role varchar(20) NOT NULL DEFAULT 'customer',
  Created_At datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (User_ID),
  UNIQUE KEY uq_username (Username),
  UNIQUE KEY uq_email (Email)
) $c;",

"CREATE TABLE {$t['customer']} (
  Customer_ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  Full_Name varchar(191) NOT NULL,
  Phone varchar(20) NOT NULL,
  Email varchar(191) NULL,
  User_ID bigint(20) unsigned NULL DEFAULT NULL,
  Created_At datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (Customer_ID),
  UNIQUE KEY uq_phone (Phone),
  UNIQUE KEY uq_user (User_ID)
) $c;",

"CREATE TABLE {$t['staff']} (
  Staff_ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  Staff_Name varchar(191) NOT NULL,
  Title varchar(191) NULL,
  Photo_URL varchar(255) NULL,
  User_ID bigint(20) unsigned NULL DEFAULT NULL,
  Is_Active tinyint(1) NOT NULL DEFAULT 1,
  Sort_Order int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY  (Staff_ID),
  UNIQUE KEY uq_user (User_ID)
) $c;",

"CREATE TABLE {$t['service']} (
  Service_ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  Service_Name varchar(191) NOT NULL,
  Category varchar(50) NOT NULL DEFAULT 'nail',
  Description text NULL,
  Price int(11) NOT NULL DEFAULT 0,
  Duration_Min int(11) NOT NULL DEFAULT 60,
  Image_URL varchar(255) NULL,
  Detail_URL varchar(255) NULL,
  Is_Active tinyint(1) NOT NULL DEFAULT 1,
  Sort_Order int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY  (Service_ID)
) $c;",

"CREATE TABLE {$t['staff_service']} (
  Staff_ID bigint(20) unsigned NOT NULL,
  Service_ID bigint(20) unsigned NOT NULL,
  PRIMARY KEY  (Staff_ID,Service_ID),
  KEY ix_service (Service_ID)
) $c;",

"CREATE TABLE {$t['booking']} (
  Booking_ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  Booking_Code varchar(20) NOT NULL,
  Customer_ID bigint(20) unsigned NOT NULL,
  Staff_ID bigint(20) unsigned NULL DEFAULT NULL,
  Staff_Auto tinyint(1) NOT NULL DEFAULT 0,
  Start_At datetime NOT NULL,
  End_At datetime NOT NULL,
  Total_Amount int(11) NOT NULL DEFAULT 0,
  Status varchar(20) NOT NULL DEFAULT 'pending',
  Source varchar(20) NOT NULL DEFAULT 'web',
  Note text NULL,
  Admin_Note text NULL,
  Cancel_Reason text NULL,
  Created_By bigint(20) unsigned NULL DEFAULT NULL,
  Created_At datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Updated_At datetime NULL DEFAULT NULL,
  PRIMARY KEY  (Booking_ID),
  UNIQUE KEY uq_code (Booking_Code),
  KEY ix_staff_start (Staff_ID,Start_At),
  KEY ix_start (Start_At),
  KEY ix_customer (Customer_ID)
) $c;",

"CREATE TABLE {$t['booking_service']} (
  Booking_ID bigint(20) unsigned NOT NULL,
  Service_ID bigint(20) unsigned NOT NULL,
  Service_Name varchar(191) NOT NULL,
  Unit_Price int(11) NOT NULL,
  Duration_Min int(11) NOT NULL,
  PRIMARY KEY  (Booking_ID,Service_ID),
  KEY ix_service (Service_ID)
) $c;",

"CREATE TABLE {$t['booking_image']} (
  Image_ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  Booking_ID bigint(20) unsigned NOT NULL,
  File_URL varchar(255) NOT NULL,
  Uploaded_At datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (Image_ID),
  KEY ix_booking (Booking_ID)
) $c;",

"CREATE TABLE {$t['booking_log']} (
  Log_ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  Booking_ID bigint(20) unsigned NOT NULL,
  User_ID bigint(20) unsigned NULL DEFAULT NULL,
  Action varchar(40) NOT NULL,
  Detail text NULL,
  Created_At datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY  (Log_ID),
  KEY ix_booking (Booking_ID)
) $c;",

"CREATE TABLE {$t['shop_setting']} (
  Setting_Key varchar(64) NOT NULL,
  Setting_Value text NOT NULL,
  PRIMARY KEY  (Setting_Key)
) $c;",
        ];
    }

    /** Tạo/cập nhật bảng và cài đặt mặc định. */
    public static function migrate()
    {
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        foreach (self::sql() as $statement) {
            dbDelta($statement);
        }
        self::seed_settings();
        update_option(self::OPTION, self::DB_VERSION);
    }

    public static function maybe_upgrade()
    {
        if (get_option(self::OPTION) !== self::DB_VERSION) {
            self::migrate();
        }
    }

    /** Cài đặt tiệm mặc định (bảng SHOP_SETTING), chỉ thêm nếu chưa có. */
    private static function seed_settings()
    {
        global $wpdb;
        $t = self::tables()['shop_setting'];
        $defaults = [
            'open_time'           => '08:30',
            'close_time'          => '20:00',
            'open_days'           => '0-6',
            'days_ahead'          => '14',
            'slot_step_min'       => '30',
            'cancel_before_hours' => '5',
            'max_images'          => '3',
        ];
        foreach ($defaults as $k => $v) {
            $wpdb->query($wpdb->prepare(
                "INSERT IGNORE INTO $t (Setting_Key, Setting_Value) VALUES (%s, %s)",
                $k,
                $v
            ));
        }
    }
}
