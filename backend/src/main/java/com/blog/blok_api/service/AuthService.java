package com.blog.blok_api.service;

import com.blog.blok_api.dto.LoginRequestDto;
import com.blog.blok_api.dto.LoginResponseDto;
import com.blog.blok_api.dto.RegisterRequestDto;
import com.blog.blok_api.dto.RegisterResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public interface AuthService {


    @Transactional
    RegisterResponseDto register(RegisterRequestDto registerRequestDto);

    LoginResponseDto login(LoginRequestDto requestDto);

    String forgotPassword(com.blog.blok_api.dto.ForgotPasswordRequestDto forgotPasswordRequestDto) throws Exception;
}
