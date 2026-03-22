package com.bepro.MiniOrderSys.dto.request;

import java.util.List;

import com.bepro.MiniOrderSys.entity.enums.PaymentMethod;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
    @NotBlank(message = "Table number is required") String tableNumber,

    @NotEmpty(message = "Order items cannot be empty") List<@Valid OrderItemRequest> items,

    String voucherCode,
    
    @NotNull(message = "Payment method is required") PaymentMethod paymentMethod) {
}
