package com.bepro.MiniOrderSys.dto.request;

import com.bepro.MiniOrderSys.entity.enums.PaymentMethod;
import com.bepro.MiniOrderSys.entity.enums.PaymentStatus;

public record InvoiceRequest(
    Long orderId,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus
) {

}
