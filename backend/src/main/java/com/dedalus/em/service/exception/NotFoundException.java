package com.dedalus.em.service.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException() {
        super();
    }
    public NotFoundException(String message) {
        super(message);
    }
}
