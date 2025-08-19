package com.storage.controller;

import com.storage.exception.QRCodeException;
import com.storage.model.error.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionHandlers {
    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleNotFound(final Exception e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.valueOf(500));
    }

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleQRCode(final QRCodeException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.valueOf(409));
    }
}
