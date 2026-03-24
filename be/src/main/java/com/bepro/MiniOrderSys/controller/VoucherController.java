package com.bepro.MiniOrderSys.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bepro.MiniOrderSys.dto.response.UserVoucherResponse;
import com.bepro.MiniOrderSys.service.VoucherService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

  private final VoucherService voucherService;

  @GetMapping("/my")
  public ResponseEntity<List<UserVoucherResponse>> getMyVouchers(Authentication authentication) {
    String username = authentication.getName();
    return ResponseEntity.ok(voucherService.getMyVouchers(username));
  }

  @PostMapping("/draw")
  public ResponseEntity<Map<String, Object>> drawVoucher(Authentication authentication) {
    String username = authentication.getName();
    Map<String, Object> result = voucherService.drawVoucher(username);
    return ResponseEntity.ok(result);
  }
}
