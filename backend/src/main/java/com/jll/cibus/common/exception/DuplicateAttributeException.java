package com.jll.cibus.common.exception;

public class DuplicateAttributeException extends RuntimeException {
    public DuplicateAttributeException(String field, Object value) {
        super("Duplicate field " + field + " with value " + value);
    }
}
