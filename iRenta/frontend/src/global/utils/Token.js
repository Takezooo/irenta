// src/global/utils/token.js

// Save token to cookies (or localStorage, if you prefer)
export const SaveToken = (token) => {
    document.cookie = `authToken=${token}; path=/; secure; HttpOnly; SameSite=Strict`;
  };
  
  // Retrieve token from cookies
  export const GetToken = () => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((cookie) => cookie.startsWith("authToken="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  };
  
  // Remove token from cookies
  export const RemoveToken = () => {
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
  };
  
  // Save refresh token (if applicable)
  export const SaveRefreshToken = (refreshToken) => {
    document.cookie = `refreshToken=${refreshToken}; path=/; secure; HttpOnly; SameSite=Strict`;
  };
  
  // Retrieve refresh token
  export const GetRefreshToken = () => {
    const cookies = document.cookie.split("; ");
    const refreshTokenCookie = cookies.find((cookie) => cookie.startsWith("refreshToken="));
    return refreshTokenCookie ? refreshTokenCookie.split("=")[1] : null;
  };
  
  // Remove refresh token
  export const RemoveRefreshToken = () => {
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
  };
  