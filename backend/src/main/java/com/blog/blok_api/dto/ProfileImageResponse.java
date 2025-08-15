package com.blog.blok_api.dto;


public class ProfileImageResponse {
    private String imageUrl;


    public ProfileImageResponse() {
    }

    public ProfileImageResponse(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}

