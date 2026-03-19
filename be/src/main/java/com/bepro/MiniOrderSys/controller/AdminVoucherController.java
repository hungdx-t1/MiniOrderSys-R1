package com.bepro.MiniOrderSys.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bepro.MiniOrderSys.dto.request.VoucherRequest;
import com.bepro.MiniOrderSys.dto.response.VoucherResponse;
import com.bepro.MiniOrderSys.service.VoucherAdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
public class AdminVoucherController {

  private final VoucherAdminService voucherAdminService;

  @GetMapping
  public List<VoucherResponse> getAllVouchers() {
    return voucherAdminService.getAllVouchers();
  }

  @PostMapping
  public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody VoucherRequest request) {
    VoucherResponse response = voucherAdminService.createVoucher(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping("/{id}")
  public ResponseEntity<VoucherResponse> updateVoucher(@PathVariable Long id,
      @Valid @RequestBody VoucherRequest request) {
    VoucherResponse response = voucherAdminService.updateVoucher(id, request);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
    voucherAdminService.deleteVoucher(id);
    return ResponseEntity.noContent().build();
  }
}
