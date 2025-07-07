# 🧪 Test Tính Năng Cài Đặt Tài Khoản

## 📋 Checklist Test Cases

### ✅ Test Cập Nhật Username

#### Test Case 1: Cập nhật username hợp lệ
- [ ] Đăng nhập vào ứng dụng
- [ ] Vào "Cài đặt tài khoản" 
- [ ] Thay đổi username thành "newuser123"
- [ ] Click "Lưu thay đổi"
- [ ] **Kết quả mong đợi**: Toast "Cập nhật thông tin thành công!"

#### Test Case 2: Username trùng lặp
- [ ] Thử đổi username thành username đã tồn tại
- [ ] **Kết quả mong đợi**: Toast "Username already exists"

#### Test Case 3: Username không hợp lệ
- [ ] Thử username có ký tự đặc biệt: "user@123"
- [ ] **Kết quả mong đợi**: Toast "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới"

#### Test Case 4: Username quá ngắn
- [ ] Thử username 2 ký tự: "ab"
- [ ] **Kết quả mong đợi**: Toast "Tên đăng nhập phải từ 3-30 ký tự"

### ✅ Test Đổi Mật Khẩu

#### Test Case 5: Đổi mật khẩu thành công
- [ ] Nhập mật khẩu hiện tại đúng
- [ ] Nhập mật khẩu mới: "NewPass123"
- [ ] Xác nhận mật khẩu mới: "NewPass123"
- [ ] Click "Đổi mật khẩu"
- [ ] **Kết quả mong đợi**: Toast "Đổi mật khẩu thành công!"

#### Test Case 6: Mật khẩu hiện tại sai
- [ ] Nhập mật khẩu hiện tại sai
- [ ] **Kết quả mong đợi**: Toast "Current password is incorrect"

#### Test Case 7: Mật khẩu mới không khớp
- [ ] Nhập mật khẩu mới: "NewPass123"
- [ ] Xác nhận mật khẩu: "NewPass456"
- [ ] **Kết quả mong đợi**: Toast "Mật khẩu mới không khớp"

#### Test Case 8: Mật khẩu mới yếu
- [ ] Nhập mật khẩu mới: "123456"
- [ ] **Kết quả mong đợi**: 
  - Thanh độ mạnh hiển thị "Rất yếu" màu đỏ
  - Toast validation error từ backend

#### Test Case 9: Mật khẩu mới trùng mật khẩu cũ
- [ ] Nhập mật khẩu mới giống mật khẩu hiện tại
- [ ] **Kết quả mong đợi**: Toast "Mật khẩu mới phải khác mật khẩu hiện tại"

### ✅ Test UI/UX

#### Test Case 10: Password Strength Indicator
- [ ] Nhập mật khẩu yếu: "123456"
- [ ] **Kết quả mong đợi**: Thanh đỏ, text "Rất yếu"
- [ ] Nhập mật khẩu mạnh: "MyStrongPass123!"
- [ ] **Kết quả mong đợi**: Thanh xanh, text "Rất mạnh"

#### Test Case 11: Toggle Password Visibility
- [ ] Click icon mắt ở mật khẩu hiện tại
- [ ] **Kết quả mong đợi**: Hiển thị/ẩn mật khẩu
- [ ] Test với tất cả 3 trường mật khẩu

#### Test Case 12: Form Reset
- [ ] Điền form đổi mật khẩu
- [ ] Click "Hủy"
- [ ] **Kết quả mong đợi**: Form được reset về trống

#### Test Case 13: Loading States
- [ ] Submit form và quan sát loading state
- [ ] **Kết quả mong đợi**: Button hiển thị "Đang lưu..." hoặc "Đang đổi..."

### ✅ Test Responsive Design

#### Test Case 14: Mobile View
- [ ] Mở trên mobile (hoặc resize browser)
- [ ] **Kết quả mong đợi**: Layout responsive, 1 cột thay vì 2 cột

#### Test Case 15: Tablet View
- [ ] Test trên tablet size
- [ ] **Kết quả mong đợi**: Layout vẫn đẹp và dễ sử dụng

### ✅ Test Navigation

#### Test Case 16: Header Dropdown
- [ ] Click avatar ở header
- [ ] **Kết quả mong đợi**: Dropdown hiển thị "Cài đặt tài khoản"
- [ ] Click "Cài đặt tài khoản"
- [ ] **Kết quả mong đợi**: Navigate đến /profile

#### Test Case 17: Breadcrumb/Back Navigation
- [ ] Từ profile page, test browser back button
- [ ] **Kết quả mong đợi**: Quay về dashboard

### ✅ Test Error Handling

#### Test Case 18: Network Error
- [ ] Tắt backend server
- [ ] Thử cập nhật profile
- [ ] **Kết quả mong đợi**: Toast error message phù hợp

#### Test Case 19: Invalid Token
- [ ] Xóa token từ localStorage
- [ ] Refresh page
- [ ] **Kết quả mong đợi**: Redirect về login page

### ✅ Test Validation Messages (Tiếng Việt)

#### Test Case 20: Kiểm tra tất cả message đã việt hóa
- [ ] Tất cả validation errors hiển thị tiếng Việt
- [ ] Password strength indicator hiển thị tiếng Việt
- [ ] Gợi ý cải thiện hiển thị tiếng Việt
- [ ] Thời gian bẻ khóa hiển thị tiếng Việt

## 🚀 Cách Chạy Test

### 1. Khởi động Backend
```bash
cd person/password-vault/backend
npm start
```

### 2. Khởi động Frontend  
```bash
cd person/password-vault/frontend
npm run dev
```

### 3. Mở Browser
- Truy cập: http://localhost:5173
- Đăng ký/đăng nhập tài khoản test
- Thực hiện các test case trên

## 📊 Kết Quả Test

### ✅ Passed Tests
- [ ] Test Case 1: Cập nhật username hợp lệ
- [ ] Test Case 2: Username trùng lặp  
- [ ] Test Case 3: Username không hợp lệ
- [ ] Test Case 4: Username quá ngắn
- [ ] Test Case 5: Đổi mật khẩu thành công
- [ ] Test Case 6: Mật khẩu hiện tại sai
- [ ] Test Case 7: Mật khẩu mới không khớp
- [ ] Test Case 8: Mật khẩu mới yếu
- [ ] Test Case 9: Mật khẩu mới trùng mật khẩu cũ
- [ ] Test Case 10: Password Strength Indicator
- [ ] Test Case 11: Toggle Password Visibility
- [ ] Test Case 12: Form Reset
- [ ] Test Case 13: Loading States
- [ ] Test Case 14: Mobile View
- [ ] Test Case 15: Tablet View
- [ ] Test Case 16: Header Dropdown
- [ ] Test Case 17: Breadcrumb/Back Navigation
- [ ] Test Case 18: Network Error
- [ ] Test Case 19: Invalid Token
- [ ] Test Case 20: Validation Messages Tiếng Việt

### ❌ Failed Tests
- [ ] (Ghi chú lỗi nếu có)

## 🐛 Bug Report Template

**Bug ID**: #001
**Test Case**: Test Case X
**Mô tả**: Mô tả chi tiết lỗi
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: Kết quả mong đợi
**Actual Result**: Kết quả thực tế
**Priority**: High/Medium/Low
**Status**: Open/Fixed/Closed

---

**📝 Ghi chú**: Đánh dấu ✅ vào các test case đã pass và ghi chú lỗi nếu có.
