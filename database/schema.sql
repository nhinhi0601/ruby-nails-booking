-- Lược đồ CSDL theo ERD – Hệ thống Booking Ruby Nails_Eyelash (Nhóm 60, Sprint 3)
-- MySQL 8 / MariaDB 10.6+, utf8mb4. Dùng cho CSDL demo (ví dụ ruby_booking_demo).
SET NAMES utf8mb4;
SET time_zone = '+07:00';

DROP TABLE IF EXISTS BOOKING_LOG, BOOKING_IMAGE, BOOKING_SERVICE, BOOKING, STAFF_SERVICE,
                     SERVICE, STAFF, CUSTOMER, USER_ACCOUNT, SHOP_SETTING;

CREATE TABLE USER_ACCOUNT (
  User_ID       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Username      VARCHAR(60)  NOT NULL,
  Password_Hash VARCHAR(255) NOT NULL,
  Email         VARCHAR(100) NOT NULL,
  Display_Name  VARCHAR(250) NOT NULL,
  Phone         VARCHAR(20)  NULL,
  Role          VARCHAR(20)  NOT NULL DEFAULT 'customer',
  Created_At    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (User_ID),
  UNIQUE KEY uq_user_username (Username),
  UNIQUE KEY uq_user_email (Email),
  CONSTRAINT ck_user_role CHECK (Role IN ('owner','receptionist','technician','customer'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE CUSTOMER (
  Customer_ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Full_Name   VARCHAR(191) NOT NULL,
  Phone       VARCHAR(20)  NOT NULL,
  Email       VARCHAR(191) NULL,
  User_ID     BIGINT UNSIGNED NULL DEFAULT NULL,
  Created_At  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Customer_ID),
  UNIQUE KEY uq_customer_phone (Phone),
  UNIQUE KEY uq_customer_user (User_ID),
  CONSTRAINT fk_customer_user FOREIGN KEY (User_ID) REFERENCES USER_ACCOUNT (User_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE STAFF (
  Staff_ID   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Staff_Name VARCHAR(191) NOT NULL,
  Title      VARCHAR(191) NULL,
  Photo_URL  VARCHAR(255) NULL,
  User_ID    BIGINT UNSIGNED NULL DEFAULT NULL,
  Is_Active  TINYINT(1) NOT NULL DEFAULT 1,
  Sort_Order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (Staff_ID),
  UNIQUE KEY uq_staff_user (User_ID),
  CONSTRAINT fk_staff_user FOREIGN KEY (User_ID) REFERENCES USER_ACCOUNT (User_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE SERVICE (
  Service_ID   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Service_Name VARCHAR(191) NOT NULL,
  Category     VARCHAR(50)  NOT NULL DEFAULT 'nail',
  Description  TEXT NULL,
  Price        INT NOT NULL DEFAULT 0,
  Duration_Min INT NOT NULL DEFAULT 60,
  Image_URL    VARCHAR(255) NULL,
  Detail_URL   VARCHAR(255) NULL,
  Is_Active    TINYINT(1) NOT NULL DEFAULT 1,
  Sort_Order   INT NOT NULL DEFAULT 0,
  PRIMARY KEY (Service_ID),
  CONSTRAINT ck_service_cat CHECK (Category IN ('nail','mi','combo')),
  CONSTRAINT ck_service_price CHECK (Price >= 0),
  CONSTRAINT ck_service_dur CHECK (Duration_Min > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE STAFF_SERVICE (
  Staff_ID   BIGINT UNSIGNED NOT NULL,
  Service_ID BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (Staff_ID, Service_ID),
  CONSTRAINT fk_ss_staff   FOREIGN KEY (Staff_ID)   REFERENCES STAFF (Staff_ID),
  CONSTRAINT fk_ss_service FOREIGN KEY (Service_ID) REFERENCES SERVICE (Service_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE BOOKING (
  Booking_ID    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Booking_Code  VARCHAR(20) NOT NULL,
  Customer_ID   BIGINT UNSIGNED NOT NULL,
  Staff_ID      BIGINT UNSIGNED NULL DEFAULT NULL,
  Staff_Auto    TINYINT(1) NOT NULL DEFAULT 0,
  Start_At      DATETIME NOT NULL,
  End_At        DATETIME NOT NULL,
  Total_Amount  INT NOT NULL DEFAULT 0,
  Status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  Source        VARCHAR(20) NOT NULL DEFAULT 'web',
  Note          TEXT NULL,
  Admin_Note    TEXT NULL,
  Cancel_Reason TEXT NULL,
  Created_By    BIGINT UNSIGNED NULL DEFAULT NULL,
  Created_At    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Updated_At    DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (Booking_ID),
  UNIQUE KEY uq_booking_code (Booking_Code),
  KEY ix_booking_staff_start (Staff_ID, Start_At),
  KEY ix_booking_start (Start_At),
  CONSTRAINT fk_booking_customer FOREIGN KEY (Customer_ID) REFERENCES CUSTOMER (Customer_ID),
  CONSTRAINT fk_booking_staff    FOREIGN KEY (Staff_ID)    REFERENCES STAFF (Staff_ID),
  CONSTRAINT fk_booking_creator  FOREIGN KEY (Created_By)  REFERENCES USER_ACCOUNT (User_ID),
  CONSTRAINT ck_booking_status CHECK (Status IN ('pending','confirmed','in_progress','done','cancelled','no_show')),
  CONSTRAINT ck_booking_source CHECK (Source IN ('web','phone','walkin','social')),
  CONSTRAINT ck_booking_time   CHECK (End_At > Start_At),
  CONSTRAINT ck_booking_brule07 CHECK (Status IN ('pending','cancelled') OR Staff_ID IS NOT NULL),
  CONSTRAINT ck_booking_reason CHECK (Status <> 'cancelled' OR Cancel_Reason IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE BOOKING_SERVICE (
  Booking_ID   BIGINT UNSIGNED NOT NULL,
  Service_ID   BIGINT UNSIGNED NOT NULL,
  Service_Name VARCHAR(191) NOT NULL,
  Unit_Price   INT NOT NULL,
  Duration_Min INT NOT NULL,
  PRIMARY KEY (Booking_ID, Service_ID),
  CONSTRAINT fk_bs_booking FOREIGN KEY (Booking_ID) REFERENCES BOOKING (Booking_ID),
  CONSTRAINT fk_bs_service FOREIGN KEY (Service_ID) REFERENCES SERVICE (Service_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE BOOKING_IMAGE (
  Image_ID    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Booking_ID  BIGINT UNSIGNED NOT NULL,
  File_URL    VARCHAR(255) NOT NULL,
  Uploaded_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Image_ID),
  CONSTRAINT fk_img_booking FOREIGN KEY (Booking_ID) REFERENCES BOOKING (Booking_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE BOOKING_LOG (
  Log_ID     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Booking_ID BIGINT UNSIGNED NOT NULL,
  User_ID    BIGINT UNSIGNED NULL DEFAULT NULL,
  Action     VARCHAR(40) NOT NULL,
  Detail     TEXT NULL,
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Log_ID),
  KEY ix_log_booking (Booking_ID),
  CONSTRAINT fk_log_booking FOREIGN KEY (Booking_ID) REFERENCES BOOKING (Booking_ID),
  CONSTRAINT fk_log_user    FOREIGN KEY (User_ID)    REFERENCES USER_ACCOUNT (User_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE SHOP_SETTING (
  Setting_Key   VARCHAR(64) NOT NULL,
  Setting_Value TEXT NOT NULL,
  PRIMARY KEY (Setting_Key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
