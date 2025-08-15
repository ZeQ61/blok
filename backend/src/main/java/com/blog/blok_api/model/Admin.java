package com.blog.blok_api.model;

public class Admin {
    private String UserName;
    private String password;

    public Admin() {
    }

    public Admin(String userName, String password) {
        UserName = userName;
        this.password = password;
    }

    public String getUserName() {
        return UserName;
    }

    public void setUserName(String userName) {
        UserName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }



}
