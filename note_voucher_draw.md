# Chức năng rút random phiếu giảm giá (Voucher Draw)

## Tổng quan

Cho phép user đăng nhập rút **random 1 voucher** giảm giá (10% - 100%). Mỗi user chỉ được rút **1 lần duy nhất**. Sử dụng **Java Functional Interface** (`Supplier`, `Predicate`, `Function`, `Consumer`) làm trọng tâm.

**API**: `POST /api/vouchers/draw` (yêu cầu Bearer token)

---

## Các file đã thêm/sửa

### 1. Entity: `Voucher.java` — Thêm `discountPercent`

```java
@Column(nullable = false)
@Builder.Default
private Integer discountPercent = 10;
```

| Yếu tố | Giải thích |
|---|---|
| `@Column(nullable = false)` | Bắt buộc phải có giá trị, không được null trong DB |
| `@Builder.Default` | Khi dùng `Voucher.builder().build()` mà không set `discountPercent`, Lombok tự gán giá trị mặc định = 10 |
| `Integer` thay vì `int` | Dùng wrapper type để tương thích với JPA (hỗ trợ null check) |

**Tại sao cần?** Entity `Voucher` cũ chỉ có `amountVnd` (giảm giá cố định theo tiền). Yêu cầu mới là giảm giá **theo %**, nên cần thêm field riêng.

---

### 2. Repository: `VoucherRepository.java` [MỚI]

```java
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
  List<Voucher> findByActiveTrue();
}
```

| Method | Giải thích |
|---|---|
| `findByActiveTrue()` | Spring Data JPA tự sinh query: `WHERE active = true`. Chỉ lấy voucher đang hoạt động, tránh rút trúng voucher đã bị vô hiệu hoá |

**Tại sao dùng JpaRepository?** Cung cấp sẵn CRUD (`save`, `findById`, `findAll`, `delete`...) mà không cần viết SQL.

---

### 3. Repository: `UserVoucherRepository.java` [MỚI]

```java
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {
  boolean existsByUser(AppUser user);
}
```

| Method | Giải thích |
|---|---|
| `existsByUser(AppUser user)` | Trả về `true/false` — kiểm tra user đã có bản ghi rút voucher chưa. Nhanh hơn `findByUser()` vì chỉ cần check tồn tại, không load dữ liệu |

**Tại sao?** Đảm bảo ràng buộc "mỗi user chỉ rút 1 lần". Nếu `existsByUser` trả `true` → từ chối.

---

### 4. Service: `VoucherService.java` [MỚI] — Logic chính

```java
@Transactional
public Map<String, Object> drawVoucher(String username) { ... }
```

#### 4.1. Tìm user

```java
AppUser user = userRepo.findByUsername(username)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
```

- `findByUsername` trả về `Optional<AppUser>` — có thể có hoặc không
- `.orElseThrow()` — nếu không tìm thấy → throw lỗi 404 ngay, dừng xử lý

#### 4.2. `Predicate<AppUser>` — Kiểm tra đã rút chưa

```java
Predicate<AppUser> alreadyDrawn = u -> userVoucherRepo.existsByUser(u);

if (alreadyDrawn.test(user)) {
  throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "...");
}
```

| Thành phần | Giải thích |
|---|---|
| `Predicate<AppUser>` | Functional interface nhận 1 input, trả về `boolean` |
| `u -> userVoucherRepo.existsByUser(u)` | Lambda: nhận user → check DB → trả true/false |
| `.test(user)` | Gọi thực thi Predicate |

**Tại sao dùng Predicate?** Đây là hành động **kiểm tra điều kiện** (đúng/sai) → đúng bản chất của `Predicate`. Nếu `true` = đã rút → báo lỗi.

#### 4.3. `Supplier<List<Voucher>>` — Lấy danh sách voucher

```java
Supplier<List<Voucher>> getVouchers = () -> voucherRepo.findByActiveTrue();

List<Voucher> vouchers = getVouchers.get();
```

| Thành phần | Giải thích |
|---|---|
| `Supplier<List<Voucher>>` | Functional interface **không nhận input**, chỉ **trả về** dữ liệu |
| `() -> voucherRepo.findByActiveTrue()` | Lambda: không tham số → query DB → trả list |
| `.get()` | Gọi thực thi Supplier |

**Tại sao dùng Supplier?** Hành động "lấy/cung cấp dữ liệu" mà không cần input → đúng bản chất `Supplier`.

#### 4.4. `Function<List<Voucher>, Voucher>` — Random chọn 1 voucher

```java
Function<List<Voucher>, Voucher> randomPick = list -> list.get(new Random().nextInt(list.size()));

Voucher picked = randomPick.apply(vouchers);
```

| Thành phần | Giải thích |
|---|---|
| `Function<List<Voucher>, Voucher>` | Nhận input type A, **biến đổi** thành output type B |
| `new Random().nextInt(list.size())` | Sinh số ngẫu nhiên từ 0 đến `size - 1` |
| `.apply(vouchers)` | Gọi thực thi Function |

**Tại sao dùng Function?** Hành động "biến đổi" (list → 1 phần tử) → đúng bản chất `Function`.

#### 4.5. `Consumer<UserVoucher>` — Lưu kết quả vào DB

```java
Consumer<UserVoucher> saveResult = uv -> userVoucherRepo.save(uv);

UserVoucher userVoucher = UserVoucher.builder()
    .user(user)
    .voucher(picked)
    .assignedAt(LocalDateTime.now())
    .used(false)
    .build();

saveResult.accept(userVoucher);
```

| Thành phần | Giải thích |
|---|---|
| `Consumer<UserVoucher>` | Nhận input, **xử lý** mà **không trả về** gì |
| `uv -> userVoucherRepo.save(uv)` | Lambda: nhận entity → lưu vào DB |
| `.accept(userVoucher)` | Gọi thực thi Consumer |

**Tại sao dùng Consumer?** Hành động "tiêu thụ/xử lý" dữ liệu mà không cần return → đúng bản chất `Consumer`.

#### Tóm tắt 4 Functional Interface

| Interface | Method | Signature | Vai trò |
|---|---|---|---|
| `Predicate<T>` | `.test()` | `T → boolean` | Check user đã rút chưa |
| `Supplier<T>` | `.get()` | `() → T` | Lấy danh sách voucher |
| `Function<T,R>` | `.apply()` | `T → R` | Random chọn 1 voucher |
| `Consumer<T>` | `.accept()` | `T → void` | Lưu kết quả vào DB |

---

### 5. Controller: `VoucherController.java` [MỚI]

```java
@PostMapping("/draw")
public ResponseEntity<Map<String, Object>> drawVoucher(Authentication authentication) {
    String username = authentication.getName();
    Map<String, Object> result = voucherService.drawVoucher(username);
    return ResponseEntity.ok(result);
}
```

| Yếu tố | Giải thích |
|---|---|
| `@PostMapping("/draw")` | Dùng POST vì tạo bản ghi mới (`UserVoucher`), không phải đọc dữ liệu |
| `Authentication authentication` | Spring Security tự inject user đang đăng nhập từ JWT token |
| `authentication.getName()` | Lấy username từ token, không cần client gửi thêm |
| `ResponseEntity.ok(result)` | Trả HTTP 200 + body là Map chứa thông tin voucher |

---

### 6. Config: `SecurityConfig.java` — Thêm bảo mật

```java
.requestMatchers("/api/vouchers/**").authenticated()
```

**Tại sao?** Endpoint rút voucher **bắt buộc đăng nhập** vì cần biết user nào đang rút. `.authenticated()` yêu cầu request phải có JWT token hợp lệ.

---

### 7. Config: `DataSeederConfig.java` — Seed dữ liệu mẫu

```java
for (int percent = 10; percent <= 100; percent += 10) {
    voucherRepository.save(Voucher.builder()
        .code("GIAM" + percent)
        .name("Giam gia " + percent + "%")
        .description("Phieu giam gia " + percent + "% cho don hang")
        .amountVnd(BigDecimal.ZERO)
        .discountPercent(percent)
        .active(true)
        .build());
}
```

| Yếu tố | Giải thích |
|---|---|
| Vòng lặp `10 → 100, bước 10` | Tạo 10 voucher: 10%, 20%, ... 100% |
| `amountVnd = ZERO` | Không giảm theo tiền cố định, chỉ dùng % |
| `code = "GIAM" + percent` | Mã duy nhất cho mỗi voucher (GIAM10, GIAM20...) |

**Tại sao dùng vòng lặp?** Gọn hơn viết 10 lần `save()`. Dễ thay đổi số lượng.
