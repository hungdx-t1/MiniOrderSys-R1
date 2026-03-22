package com.bepro.MiniOrderSys.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bepro.MiniOrderSys.entity.enums.PaymentMethod;
import com.bepro.MiniOrderSys.entity.enums.PaymentStatus;

public record InvoiceResponse(
        Long id,
        Long orderId,
        String tableNumber,
        BigDecimal totalAmount,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        LocalDateTime paidAt,
        LocalDateTime createdAt,
        String paymentUrl) {
}
