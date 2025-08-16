package com.storage.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileImageService {

    String upload(MultipartFile file);
    byte[] getObject(String fileName);

}
