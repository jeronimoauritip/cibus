package com.jll.cibus.common.exception;

public class ResourceAlreadyExistsException extends RuntimeException {
    public ResourceAlreadyExistsException(String field, Object value) {
        super("Resource " + field + " with value " + value + " already exists");
    }

    public ResourceAlreadyExistsException(String message) {super(message);}
}
