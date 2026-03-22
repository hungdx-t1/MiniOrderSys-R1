package com.bepro.MiniOrderSys.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bepro.MiniOrderSys.dto.request.InvoiceRequest;
import com.bepro.MiniOrderSys.dto.response.InvoiceResponse;
import com.bepro.MiniOrderSys.service.InvoiceService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Slf4j
public class InvoiceController {

  private final InvoiceService invoiceService;

  @PostMapping
  public ResponseEntity<InvoiceResponse> createInvoice(
      @RequestBody InvoiceRequest request,
      HttpServletRequest requestHttp) {
    log.info("Creating invoice for order: {}", request.orderId());
    InvoiceResponse response = invoiceService.process(request, requestHttp);
    log.info("Invoice created successfully for order: {}", request.orderId());
    return ResponseEntity.ok(response);
  }
}
