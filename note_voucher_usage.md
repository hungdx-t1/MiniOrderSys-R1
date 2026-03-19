# Chức năng sử dụng Voucher khi đặt hàng

## Tổng quan

Khi đặt hàng, user có thể **tuỳ chọn** nhập mã voucher đã rút được để áp dụng giảm giá. Hệ thống sẽ xác minh quyền sở hữu, tính giảm giá, và đánh dấu voucher đã sử dụng.

**API**: `POST /api/orders` (cần Bearer token khi dùng voucher)

---

## Các file đã thêm/sửa

### 1. DTO: `CreateOrderRequest.java` — Thêm `voucherCode`

```java
public record CreateOrderRequest(
    @NotBlank String tableNumber,
    @NotEmpty List<@Valid OrderItemRequest> items,
    String voucherCode) {   // ← MỚI
}
```

| Yếu tố | Giải thích |
|---|---|
| `String voucherCode` | Field tuỳ chọn để nhập mã voucher |
| Không có `@NotBlank` | → Field là **optional**, có thể null hoặc không gửi |

**Tại sao optional?** Không phải đơn hàng nào cũng dùng voucher. Nếu không gửi `voucherCode` → đặt hàng bình thường, không giảm giá.

---

### 2. DTO: `OrderResponse.java` — Thêm thông tin giảm giá

```java
public record OrderResponse(
    ...
    BigDecimal totalAmount,
    Integer discountPercent,     // ← MỚI
    BigDecimal discountAmount,   // ← MỚI
    LocalDateTime createdAt,
    ...) {}
```

| Field | Giải thích |
|---|---|
| `discountPercent` | % giảm giá đã áp dụng (vd: `50`). Null nếu không dùng voucher |
| `discountAmount` | Số tiền được giảm (vd: `40000`). Null nếu không dùng voucher |

**Tại sao thêm 2 field?** Để client biết đơn hàng này được giảm bao nhiêu %, tương đương bao nhiêu tiền. `totalAmount` là số tiền **sau** khi đã trừ giảm giá.

---

### 3. Repository: `VoucherRepository.java` — Thêm `findByCode`

```java
Optional<Voucher> findByCode(String code);
```

| Yếu tố | Giải thích |
|---|---|
| `findByCode` | Spring Data JPA tự sinh: `WHERE code = ?` |
| `Optional<Voucher>` | Trả Optional vì mã có thể không tồn tại |

**Tại sao cần?** User gửi lên mã voucher dạng text (`"GIAM50"`), cần tìm trong DB theo mã đó.

---

### 4. Repository: `UserVoucherRepository.java` — Thêm `findByUserAndVoucher`

```java
Optional<UserVoucher> findByUserAndVoucher(AppUser user, Voucher voucher);
```

| Yếu tố | Giải thích |
|---|---|
| `findByUserAndVoucher` | Spring Data JPA sinh: `WHERE user_id = ? AND voucher_id = ?` |
| 2 tham số entity | JPA tự lấy ID từ entity để query |

**Tại sao cần?** Kiểm tra voucher này **có thuộc về user này không**. Bảng `user_vouchers` lưu quan hệ user ↔ voucher. Nếu user A nhập mã voucher của user B → bị từ chối.

---

### 5. Service: `OrderService.java` — Logic áp dụng voucher

Thêm đoạn code sau vào method `createOrder()`, **sau** khi tính `totalAmount` và **trước** khi save order:

#### 5.1. Kiểm tra có gửi voucherCode không

```java
if (request.voucherCode() != null && !request.voucherCode().isBlank()) {
```

- `!= null`: kiểm tra field có tồn tại
- `!isBlank()`: loại trường hợp gửi chuỗi rỗng `""` hoặc toàn khoảng trắng

**Tại sao check cả 2?** Phòng trường hợp client gửi `"voucherCode": ""` hoặc `"voucherCode": "  "`.

#### 5.2. Yêu cầu đăng nhập

```java
if (username == null || order.getUser() == null) {
  throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ban phai dang nhap de su dung voucher!");
}
```

**Tại sao?** Endpoint `/api/orders` cho phép guest (không cần login) đặt hàng. Nhưng nếu muốn dùng voucher → **bắt buộc login** vì cần biết user nào để verify quyền sở hữu.

#### 5.3. Tìm voucher theo mã

```java
String code = request.voucherCode().trim().toUpperCase();

Voucher voucher = voucherRepository.findByCode(code)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ma voucher khong ton tai!"));
```

| Yếu tố | Giải thích |
|---|---|
| `trim()` | Bỏ khoảng trắng đầu/cuối |
| `toUpperCase()` | Chuẩn hoá: `"giam50"` → `"GIAM50"` |
| `orElseThrow()` | Không tìm thấy → lỗi 400 |

**Tại sao chuẩn hoá?** DB lưu mã viết hoa (`GIAM50`). User có thể gõ `giam50` hoặc `Giam50` → cần chuyển về cùng format.

#### 5.4. Kiểm tra voucher active

```java
if (!voucher.getActive()) {
  throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher da het han!");
}
```

**Tại sao?** Admin có thể vô hiệu hoá voucher (`active = false`). Phải check trước khi áp dụng, dù mã đúng.

#### 5.5. Kiểm tra quyền sở hữu

```java
UserVoucher userVoucher = userVoucherRepository.findByUserAndVoucher(order.getUser(), voucher)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher nay khong phai cua ban!"));
```

**Tại sao?** Mỗi user rút 1 voucher riêng (random). Phải verify user hiện tại **đã rút** voucher này. Tránh user A dùng mã của user B.

#### 5.6. Kiểm tra đã sử dụng chưa

```java
if (userVoucher.getUsed()) {
  throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ban da su dung voucher nay roi!");
}
```

**Tại sao?** Mỗi voucher chỉ dùng **1 lần**. Field `used` trong `UserVoucher` đánh dấu trạng thái.

#### 5.7. Tính giảm giá

```java
discountPercent = voucher.getDiscountPercent();
discountAmount = totalAmount.multiply(BigDecimal.valueOf(discountPercent))
    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
totalAmount = totalAmount.subtract(discountAmount);
```

| Dòng | Giải thích |
|---|---|
| `totalAmount.multiply(...)` | `totalAmount × discountPercent` |
| `.divide(..., 2, HALF_UP)` | Chia 100, giữ 2 số thập phân, làm tròn lên |
| `.subtract(discountAmount)` | `totalAmount = totalAmount - discountAmount` |

**Ví dụ**: Đơn 80,000đ × 50% ÷ 100 = 40,000đ giảm → Trả 40,000đ.

**Tại sao dùng BigDecimal?** Tránh lỗi làm tròn của `double` khi tính tiền (vd: `0.1 + 0.2 ≠ 0.3` trong double).

#### 5.8. Đánh dấu đã sử dụng

```java
userVoucher.setUsed(true);
userVoucher.setUsedAt(LocalDateTime.now());
userVoucherRepository.save(userVoucher);
```

**Tại sao?** Sau khi áp dụng thành công → đánh dấu `used = true` + ghi thời điểm. Lần sau dùng lại → bị chặn ở bước 5.6.

---

## Flow tổng quan

```
User gửi POST /api/orders + voucherCode + Bearer token
  │
  ├── voucherCode = null?  ──YES──→ Đặt hàng bình thường (không giảm giá)
  │
  NO
  │
  ├── Đã đăng nhập?       ──NO───→ Lỗi 400: "Phải đăng nhập"
  ├── Mã tồn tại?         ──NO───→ Lỗi 400: "Mã không tồn tại"
  ├── Voucher active?      ──NO───→ Lỗi 400: "Voucher hết hạn"
  ├── Thuộc về user?       ──NO───→ Lỗi 400: "Không phải của bạn"
  ├── Đã dùng chưa?       ──YES──→ Lỗi 400: "Đã sử dụng rồi"
  │
  ALL OK
  │
  ├── Tính: discountAmount = total × percent / 100
  ├── Trừ:  totalAmount = total - discountAmount
  ├── Đánh dấu: used = true
  └── Trả response kèm discountPercent + discountAmount
```

---

## Test trong Postman

### Bước 1: Login
```
POST http://localhost:8080/api/auth/login
Body: { "username": "user", "password": "user123" }
→ Copy accessToken
```

### Bước 2: Rút voucher
```
POST http://localhost:8080/api/vouchers/draw
Headers: Authorization: Bearer <token>
→ Ghi nhớ "code" (vd: "GIAM70")
```

### Bước 3: Đặt hàng có voucher
```
POST http://localhost:8080/api/orders
Headers: Authorization: Bearer <token>
Body:
{
  "tableNumber": "A1",
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "voucherCode": "GIAM70"
}
```
