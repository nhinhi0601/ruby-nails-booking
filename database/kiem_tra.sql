-- Truy vấn kiểm tra dữ liệu mẫu (chạy sau schema.sql và sample_data.sql)
SET NAMES utf8mb4;

-- 1. Số dòng mỗi bảng
SELECT 'USER_ACCOUNT' AS Bang, COUNT(*) AS So_dong FROM USER_ACCOUNT UNION ALL
SELECT 'CUSTOMER', COUNT(*) FROM CUSTOMER UNION ALL
SELECT 'STAFF', COUNT(*) FROM STAFF UNION ALL
SELECT 'SERVICE', COUNT(*) FROM SERVICE UNION ALL
SELECT 'STAFF_SERVICE', COUNT(*) FROM STAFF_SERVICE UNION ALL
SELECT 'BOOKING', COUNT(*) FROM BOOKING UNION ALL
SELECT 'BOOKING_SERVICE', COUNT(*) FROM BOOKING_SERVICE UNION ALL
SELECT 'BOOKING_IMAGE', COUNT(*) FROM BOOKING_IMAGE UNION ALL
SELECT 'BOOKING_LOG', COUNT(*) FROM BOOKING_LOG UNION ALL
SELECT 'SHOP_SETTING', COUNT(*) FROM SHOP_SETTING;

-- 2. BRULE02/FR03: hai lịch (không hủy) của cùng thợ chồng giờ nhau -> phải trả về 0 dòng
SELECT a.Booking_Code, b.Booking_Code, a.Staff_ID
FROM BOOKING a JOIN BOOKING b
  ON a.Staff_ID = b.Staff_ID AND a.Booking_ID < b.Booking_ID
 AND a.Start_At < b.End_At AND b.Start_At < a.End_At
WHERE a.Status <> 'cancelled' AND b.Status <> 'cancelled';

-- 3. FR09/BRULE01: lịch ngoài giờ 08:30–20:00 -> phải trả về 0 dòng
SELECT Booking_Code, Start_At, End_At FROM BOOKING
WHERE TIME(Start_At) < '08:30:00' OR End_At > TIMESTAMP(DATE(Start_At), '20:00:00');

-- 4. FR03: End_At = Start_At + tổng thời lượng; Total_Amount = tổng giá -> phải trả về 0 dòng
SELECT b.Booking_Code FROM BOOKING b JOIN BOOKING_SERVICE s ON s.Booking_ID = b.Booking_ID
GROUP BY b.Booking_ID, b.Booking_Code, b.Start_At, b.End_At, b.Total_Amount
HAVING TIMESTAMPDIFF(MINUTE, b.Start_At, b.End_At) <> SUM(s.Duration_Min) OR b.Total_Amount <> SUM(s.Unit_Price);

-- 5. Thợ được xếp đúng dịch vụ mình làm được (STAFF_SERVICE) -> phải trả về 0 dòng
SELECT b.Booking_Code, b.Staff_ID, s.Service_ID FROM BOOKING b
JOIN BOOKING_SERVICE s ON s.Booking_ID = b.Booking_ID
LEFT JOIN STAFF_SERVICE ss ON ss.Staff_ID = b.Staff_ID AND ss.Service_ID = s.Service_ID
WHERE b.Staff_ID IS NOT NULL AND ss.Staff_ID IS NULL;

-- 6. Mọi lịch có ít nhất 1 dòng nhật ký 'create' (R8) -> phải trả về 0 dòng
SELECT b.Booking_Code FROM BOOKING b
LEFT JOIN BOOKING_LOG l ON l.Booking_ID = b.Booking_ID AND l.Action = 'create'
WHERE l.Log_ID IS NULL;

-- 7. FR06: lịch hẹn ngày 20/11/2026 sắp theo giờ
SELECT b.Booking_Code, TIME(b.Start_At) AS Gio, c.Full_Name, c.Phone,
       GROUP_CONCAT(s.Service_Name SEPARATOR ' + ') AS Dich_vu, st.Staff_Name, b.Status
FROM BOOKING b JOIN CUSTOMER c ON c.Customer_ID = b.Customer_ID
JOIN BOOKING_SERVICE s ON s.Booking_ID = b.Booking_ID
LEFT JOIN STAFF st ON st.Staff_ID = b.Staff_ID
WHERE DATE(b.Start_At) = '2026-11-20'
GROUP BY b.Booking_ID ORDER BY b.Start_At;

-- 8. FR15: lịch sử khách theo SĐT 0935111222
SELECT b.Booking_Code, b.Start_At, b.Status, b.Total_Amount
FROM BOOKING b JOIN CUSTOMER c ON c.Customer_ID = b.Customer_ID
WHERE c.Phone = '0935111222' ORDER BY b.Start_At;

-- 9. FR13: báo cáo 16/11–29/11 theo trạng thái
SELECT Status, COUNT(*) AS So_lich, SUM(Total_Amount) AS Tong_tien
FROM BOOKING WHERE Start_At >= '2026-11-16' AND Start_At < '2026-11-30'
GROUP BY Status;

-- 10. Snapshot giá: giá lúc đặt khác giá hiện hành
SELECT b.Booking_Code, s.Service_Name, s.Unit_Price AS Gia_luc_dat, sv.Price AS Gia_hien_tai
FROM BOOKING_SERVICE s JOIN BOOKING b ON b.Booking_ID = s.Booking_ID
JOIN SERVICE sv ON sv.Service_ID = s.Service_ID
WHERE s.Unit_Price <> sv.Price;
