package com.blog.blok_api.dto;

public class UserDto {
    private Long id;
    private String username;
    private String profileImgUrl;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getProfileImgUrl() {
        return profileImgUrl;
    }
    public void setProfileImgUrl(String profileImgUrl) { this.profileImgUrl = profileImgUrl; }

    // ✅ Manuel builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final UserDto instance;

        public Builder() {
            instance = new UserDto();
        }

        public Builder id(Long id) {
            instance.setId(id);
            return this;
        }

        public Builder username(String username) {
            instance.setUsername(username);
            return this;
        }

        public Builder profileImgUrl(String profileImgUrl) {
            instance.setProfileImgUrl(profileImgUrl);
            return this;
        }

        public UserDto build() {
            return instance;
        }
    }

}
