package com.storage.exception;

public class StorageNotEmptyException extends RuntimeException {
    public StorageNotEmptyException(String message) {
        super(message);
    }
}
