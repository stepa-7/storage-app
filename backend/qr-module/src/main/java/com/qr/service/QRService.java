package com.qr.service;

import com.google.zxing.WriterException;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public interface QRService {
    byte[] generate(String data) throws WriterException, IOException;
}
