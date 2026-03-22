package com.bepro.MiniOrderSys.config;

import java.nio.charset.StandardCharsets;
import java.util.Random;

import javax.crypto.Mac;

import javax.crypto.spec.SecretKeySpec;

import jakarta.servlet.http.HttpServletRequest;

public class VNPayConfig {

  /**
   * Sinh mã băm HMAC SHA512 cho VNPay
   */
  public static String hmacSHA512(final String key, final String data) {
    try {
      if (key == null || data == null) {
        throw new NullPointerException();
      }
      final Mac hmac512 = Mac.getInstance("HmacSHA512");
      byte[] hmacKeyBytes = key.getBytes();
      final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
      hmac512.init(secretKey);
      byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
      byte[] result = hmac512.doFinal(dataBytes);
      StringBuilder sb = new StringBuilder(2 * result.length);
      for (byte b : result) {
        sb.append(String.format("%02x", b & 0xff));
      }
      return sb.toString();
    } catch (Exception ex) {
      return "";
    }
  }

  /**
   * Lấy IP Address của client gửi request đến
   */
  public static String getIpAddress(HttpServletRequest request) {
    String ipAdress = request.getHeader("X-FORWARDED-FOR");
    if (ipAdress == null) {
      ipAdress = request.getRemoteAddr();
    }
    return ipAdress;
  }

  /**
   * Tạo chuỗi ngẫu nhiên dựa vào chiều dài yêu cầu
   */
  public static String getRandomNumber(int len) {
    Random rnd = new Random();
    String chars = "0123456789";
    StringBuilder sb = new StringBuilder(len);
    for (int i = 0; i < len; i++) {
      sb.append(chars.charAt(rnd.nextInt(chars.length())));
    }
    return sb.toString();
  }
}
