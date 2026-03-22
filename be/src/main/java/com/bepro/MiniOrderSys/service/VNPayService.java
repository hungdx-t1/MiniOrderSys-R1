package com.bepro.MiniOrderSys.service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.bepro.MiniOrderSys.config.VNPayConfig;
import com.bepro.MiniOrderSys.config.AppProperties;
import com.bepro.MiniOrderSys.entity.Invoice;

import jakarta.servlet.http.HttpServletRequest;

@Service
@RequiredArgsConstructor
public class VNPayService {

  private final AppProperties appProperties;

  /**
   * Tạo URL thanh toán VNPay
   * @param request - HttpServletRequest
   * @param invoice - Invoice
   * @return URL thanh toán
   * @throws UnsupportedEncodingException - Nếu có lỗi encoding
   */
  public String createPaymentUrl(HttpServletRequest request, Invoice invoice) throws UnsupportedEncodingException {

    long amount = invoice.getTotalAmount().longValue() * 100;
    String vnp_TxnRef = String.valueOf(invoice.getId()) + "_" + VNPayConfig.getRandomNumber(4);

    Map<String, String> vnp_Params = new HashMap<>();
    vnp_Params.put("vnp_Version", appProperties.getVnpay().getVersion());
    vnp_Params.put("vnp_Command", appProperties.getVnpay().getCommand());
    vnp_Params.put("vnp_TmnCode", appProperties.getVnpay().getTmnCode());
    vnp_Params.put("vnp_Amount", String.valueOf(amount));
    vnp_Params.put("vnp_CurrCode", "VND");
    vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
    vnp_Params.put("vnp_OrderInfo", "Payment for order " + invoice.getOrder().getId() + " - Invoice: " + invoice.getId());
    vnp_Params.put("vnp_OrderType", "other");
    vnp_Params.put("vnp_Locale", "vn");
    vnp_Params.put("vnp_ReturnUrl", appProperties.getVnpay().getReturnUrl());
    vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

    Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
    SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
    String vnp_CreateDate = formatter.format(cld.getTime());
    vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

    cld.add(Calendar.MINUTE, 15);
    String vnp_ExpireDate = formatter.format(cld.getTime());
    vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

    List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
    Collections.sort(fieldNames);
    StringBuilder hashData = new StringBuilder();
    StringBuilder query = new StringBuilder();

    Iterator<String> itr = fieldNames.iterator();
    while (itr.hasNext()) {
      String fieldName = itr.next();
      String fieldValue = vnp_Params.get(fieldName);
      if ((fieldValue != null) && (fieldValue.length() > 0)) {
        hashData.append(fieldName);
        hashData.append('=');
        hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

        query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
        query.append('=');
        query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
        if (itr.hasNext()) {
          query.append('&');
          hashData.append('&');
        }
      }
    }

    String queryUrl = query.toString();
    String vnp_SecureHash = VNPayConfig.hmacSHA512(appProperties.getVnpay().getHashSecret(), hashData.toString());
    queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

    return appProperties.getVnpay().getUrl() + "?" + queryUrl;
  }

  /**
   * Xử lý verify payment
   * @param fields - Map chứa thông tin payment
   * @return true nếu payment hợp lệ, false nếu không hợp lệ
   */
  public boolean verifyPayment(Map<String, String> fields) {
    String vnp_SecureHash = fields.get("vnp_SecureHash");
    if (vnp_SecureHash == null) {
      return false;
    }
    fields.remove("vnp_SecureHash");
    fields.remove("vnp_SecureHashType");

    List<String> fieldNames = new ArrayList<>(fields.keySet());
    Collections.sort(fieldNames);
    StringBuilder hashData = new StringBuilder();
    
    try {
      Iterator<String> itr = fieldNames.iterator();
      while (itr.hasNext()) {
        String fieldName = itr.next();
        String fieldValue = fields.get(fieldName);
        if ((fieldValue != null) && (fieldValue.length() > 0)) {
          hashData.append(fieldName);
          hashData.append('=');
          hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
          if (itr.hasNext()) {
            hashData.append('&');
          }
        }
      }
    } catch (UnsupportedEncodingException e) {
      return false;
    }
    
    String secureHashCalc = VNPayConfig.hmacSHA512(appProperties.getVnpay().getHashSecret(), hashData.toString());
    return secureHashCalc.equals(vnp_SecureHash);
  }
}
