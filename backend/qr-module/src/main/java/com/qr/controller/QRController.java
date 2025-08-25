package com.qr.controller;

import com.google.zxing.WriterException;
import com.qr.service.QRService;
import com.qr.service.QRServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/qr")
public class QRController {
    private QRService qrService = new QRServiceImpl();

    @GetMapping(produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> create(@RequestBody String url) throws IOException, WriterException {
        return new ResponseEntity<>(qrService.generate(url), HttpStatus.valueOf(200));
    }
}