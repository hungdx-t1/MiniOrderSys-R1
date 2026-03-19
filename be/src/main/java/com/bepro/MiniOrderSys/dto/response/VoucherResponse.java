package com.bepro.MiniOrderSys.dto.response;

public record VoucherResponse(
    Long id,
    String code,
    String name,
    String description,
    Integer discountPercent,
    Boolean active) {
}
