package com.bepro.MiniOrderSys.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record VNPayIpnResponse(
    @JsonProperty("RspCode")
    String rspCode,
    
    @JsonProperty("Message")
    String message
) {
}
