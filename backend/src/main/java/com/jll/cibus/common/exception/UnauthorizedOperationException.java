package com.jll.cibus.common.exception;

public class UnauthorizedOperationException extends RuntimeException {
    public UnauthorizedOperationException(String role) {
        super("Role " + role + " are not authorized to perform this operation");
    }
}
