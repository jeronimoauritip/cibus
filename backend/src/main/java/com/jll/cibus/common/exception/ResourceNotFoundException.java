package com.jll.cibus.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String field, Object value) {
        super("Resource " + field + " with value " + value + " does not exist");
    }

    public ResourceNotFoundException(String message){super(message);}
}
