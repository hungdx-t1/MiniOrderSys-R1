package com.bepro.MiniOrderSys.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.bepro.MiniOrderSys.dto.request.VoucherRequest;
import com.bepro.MiniOrderSys.dto.response.VoucherResponse;
import com.bepro.MiniOrderSys.entity.Voucher;
import com.bepro.MiniOrderSys.repository.VoucherRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VoucherAdminService {

  private final VoucherRepository voucherRepository;

  private String safeTrim(String value) {
    return value == null ? "" : value.trim();
  }

  private String normalizeCode(String code) {
    return safeTrim(code).toUpperCase();
  }

  private VoucherResponse toResponse(Voucher voucher) {
    return new VoucherResponse(
        voucher.getId(),
        voucher.getCode(),
        voucher.getName(),
        voucher.getDescription(),
        voucher.getDiscountPercent(),
        voucher.getActive());
  }

  @Transactional(readOnly = true)
  public List<VoucherResponse> getAllVouchers() {
    return voucherRepository.findAll().stream()
        .sorted(Comparator.comparing(Voucher::getCode, String.CASE_INSENSITIVE_ORDER))
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public VoucherResponse createVoucher(VoucherRequest request) {
    String normalizedCode = normalizeCode(request.code());
    if (normalizedCode.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher code is required");
    }

    if (voucherRepository.findByCode(normalizedCode).isPresent()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher code already exists");
    }

    Voucher voucher = Voucher.builder()
        .code(normalizedCode)
        .name(safeTrim(request.name()))
        .description(safeTrim(request.description()))
        .amountVnd(BigDecimal.ZERO)
        .discountPercent(request.discountPercent())
        .active(request.active() == null ? true : request.active())
        .build();

    return toResponse(voucherRepository.save(voucher));
  }

  @Transactional
  public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
    Voucher voucher = voucherRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher not found"));

    String normalizedCode = normalizeCode(request.code());
    if (normalizedCode.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher code is required");
    }

    voucherRepository.findByCode(normalizedCode).ifPresent(existingVoucher -> {
      if (!existingVoucher.getId().equals(id)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher code already exists");
      }
    });

    voucher.setCode(normalizedCode);
    voucher.setName(safeTrim(request.name()));
    voucher.setDescription(safeTrim(request.description()));
    voucher.setDiscountPercent(request.discountPercent());
    voucher.setAmountVnd(BigDecimal.ZERO);

    if (request.active() != null) {
      voucher.setActive(request.active());
    }

    return toResponse(voucherRepository.save(voucher));
  }

  @Transactional
  public void deleteVoucher(Long id) {
    Voucher voucher = voucherRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher not found"));
    voucherRepository.delete(voucher);
  }
}
