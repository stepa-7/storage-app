package com.stepa7.authservice.request;

import lombok.Data;

@Data
public class SigninRequest {
    private String login;
    private String password;
}
