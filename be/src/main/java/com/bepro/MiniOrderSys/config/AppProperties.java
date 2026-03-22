package com.bepro.MiniOrderSys.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {
  private Jwt jwt = new Jwt();
  private Vnpay vnpay = new Vnpay();

  @Getter
  @Setter
  public static class Jwt {
    private String secret;
    private long expirationMs;
  }

  @Getter
  @Setter
  public static class Vnpay {
    private String tmnCode;
    private String hashSecret;
    private String url;
    private String returnUrl;
    private String version;
    private String command;
  }
}
