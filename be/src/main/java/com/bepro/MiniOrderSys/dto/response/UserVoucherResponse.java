package com.bepro.MiniOrderSys.dto.response;

import java.time.LocalDateTime;

public record UserVoucherResponse(
    Long id,
    String code,
    String name,
    String description,
    Integer discountPercent,
    Boolean active,
    Boolean used,
    LocalDateTime assignedAt,
    LocalDateTime usedAt) {
}
