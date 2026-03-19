package com.bepro.MiniOrderSys.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VoucherRequest(
    @NotBlank(message = "Voucher code is required") @Size(max = 50, message = "Voucher code must be less than 50 characters") String code,

    @NotBlank(message = "Voucher name is required") @Size(max = 100, message = "Voucher name must be less than 100 characters") String name,

    @Size(max = 500, message = "Voucher description must be less than 500 characters") String description,

    @NotNull(message = "Discount percent is required") @Min(value = 1, message = "Discount percent must be at least 1") @Max(value = 100, message = "Discount percent must be at most 100") Integer discountPercent,

    Boolean active) {
}
