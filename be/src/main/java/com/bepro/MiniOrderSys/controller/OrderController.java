package com.bepro.MiniOrderSys.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bepro.MiniOrderSys.dto.request.CreateOrderRequest;
import com.bepro.MiniOrderSys.dto.response.OrderResponse;
import com.bepro.MiniOrderSys.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;

  @PostMapping
  public ResponseEntity<OrderResponse> createOrder(
      @Valid @RequestBody CreateOrderRequest request,
      Authentication authentication) {
    String username = resolveAuthenticatedUsername(authentication);
    OrderResponse response = orderService.createOrder(request, username);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping("/my")
  public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
    String username = resolveAuthenticatedUsername(authentication);
    return ResponseEntity.ok(orderService.getUserOrders(username));
  }

  private String resolveAuthenticatedUsername(Authentication authentication) {
    if (authentication == null || authentication instanceof AnonymousAuthenticationToken
        || !authentication.isAuthenticated()) {
      return null;
    }
    return authentication.getName();
  }
}
