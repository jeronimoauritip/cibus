package com.jll.cibus.common.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid credentials for operation");
    }
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
