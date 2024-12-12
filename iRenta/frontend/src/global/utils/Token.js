// src/global/utils/token.js

// Save token to cookies (or localStorage, if you prefer)
export const SaveToken = (token) => {
    document.cookie = `authToken=${token}; path=/; secure; SameSite=Strict; max-age=3600`;
  };
  
  // Retrieve token from cookies
  export const GetToken = () => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("authToken="));
    return tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1]) : null;
  };
  
  // Remove token from cookies
  export const RemoveToken = () => {
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
  };
  
  // Save refresh token (if applicable)
  export const SaveRefreshToken = (refreshToken) => {
    document.cookie = `refreshToken=${refreshToken}; path=/; secure; SameSite=Strict; max-age=604800`; // 7 days
  };
  
  // Retrieve refresh token
  export const GetRefreshToken = () => {
    const cookies = document.cookie.split("; ");
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("refreshToken=")
    );
    console.log("Retrieved Refresh Token:", refreshTokenCookie); // Debugging log
    return refreshTokenCookie
    ? decodeURIComponent(refreshTokenCookie.split("=")[1])
    : null;
  };
  
  // Remove refresh token
  export const RemoveRefreshToken = () => {
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
  };
  