package com.jll.cibus.common.errordetails;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorDetails {

    private final LocalDateTime timestamp;
    private final Integer status;
    private final String error;
    private final String message;
    private final Map<String, String> fieldErrors;

    public ErrorDetails(String error, String message, Integer status){
        this(error, message, status, null);
    }

    public ErrorDetails(String error, String message, Integer status, Map<String, String> fieldErrors){
        this.error = error;
        this.message = message;
        this.status = status;
        this.fieldErrors = fieldErrors;
        this.timestamp = LocalDateTime.now();
    }
}
