package com.bepro.MiniOrderSys.controller;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import com.bepro.MiniOrderSys.dto.response.PaymentUrlResponse;
import com.bepro.MiniOrderSys.entity.Invoice;
import com.bepro.MiniOrderSys.entity.enums.PaymentStatus;
import com.bepro.MiniOrderSys.repository.InvoiceRepository;
import com.bepro.MiniOrderSys.service.VNPayService;
import com.bepro.MiniOrderSys.service.InvoiceService;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
public class VNPayController {

  // Frontend URL để redirect sau khi xử lý callback
  private static final String FRONTEND_RESULT_URL = "http://localhost:3000/payment/result";

  private final VNPayService vnPayService;
  private final InvoiceRepository invoiceRepository;
  private final InvoiceService invoiceService;
  private final SimpMessagingTemplate messagingTemplate;

  @GetMapping("/pay/{invoiceId}")
  public ResponseEntity<PaymentUrlResponse> createPaymentUrl(@PathVariable Long invoiceId, HttpServletRequest request) {
    Invoice invoice = invoiceRepository.findById(invoiceId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

    if (invoice.getPaymentStatus() == PaymentStatus.COMPLETED) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice already paid");
    }

    try {
      String paymentUrl = vnPayService.createPaymentUrl(request, invoice);
      return ResponseEntity.ok(new PaymentUrlResponse(paymentUrl));
    } catch (UnsupportedEncodingException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating VNPay payment URL");
    }
  }

  @GetMapping("/callback")
  public ResponseEntity<Void> vnpayCallback(@RequestParam Map<String, String> requestParams) {
    log.info("VNPay callback received: responseCode={}, txnRef={}",
        requestParams.get("vnp_ResponseCode"),
        requestParams.get("vnp_TxnRef"));

    boolean isValidSignature = vnPayService.verifyPayment(requestParams);

    String vnp_ResponseCode = requestParams.get("vnp_ResponseCode");
    String vnp_TxnRef = requestParams.get("vnp_TxnRef");

    // Xây dựng URL redirect về frontend, kèm theo các tham số gốc từ VNPay
    UriComponentsBuilder redirectBuilder = UriComponentsBuilder
        .fromUriString(FRONTEND_RESULT_URL)
        .queryParam("vnp_ResponseCode", vnp_ResponseCode)
        .queryParam("vnp_Amount", requestParams.get("vnp_Amount"))
        .queryParam("vnp_OrderInfo", requestParams.get("vnp_OrderInfo"))
        .queryParam("vnp_TxnRef", vnp_TxnRef);

    if (!isValidSignature) {
      log.warn("VNPay callback: chữ ký không hợp lệ!");
      redirectBuilder.queryParam("error", "invalid_signature");
      return ResponseEntity.status(HttpStatus.FOUND)
          .location(URI.create(redirectBuilder.toUriString()))
          .build();
    }

    if (vnp_TxnRef != null && vnp_TxnRef.contains("_")) {
      String invoiceIdStr = vnp_TxnRef.split("_")[0];
      try {
        Long invoiceId = Long.parseLong(invoiceIdStr);
        Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);

        if (invoice != null && invoice.getPaymentStatus() != PaymentStatus.COMPLETED) {
          if ("00".equals(vnp_ResponseCode)) {
            log.info("VNPay thanh toán thành công cho invoiceId={}", invoiceId);
            invoiceService.complete(invoiceId);
          } else {
            log.info("VNPay thanh toán thất bại, responseCode={}", vnp_ResponseCode);
            invoice.setPaymentStatus(PaymentStatus.CANCELLED);
            invoiceRepository.save(invoice);
            messagingTemplate.convertAndSend("/topic/admin/orders", invoiceId);
          }
        }
      } catch (NumberFormatException e) {
        log.error("VNPay callback: không parse được invoiceId từ txnRef={}", vnp_TxnRef);
      }
    }

    // Redirect user về trang kết quả Frontend
    return ResponseEntity.status(HttpStatus.FOUND)
        .location(URI.create(redirectBuilder.toUriString()))
        .build();
  }
}
