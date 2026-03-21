# API Documentation

**Base URL**: `http://localhost:5000/api`

All request bodies are JSON. All responses follow:
```json
{ "success": true/false, "message": "...", ...data }
```

---

## Auth Routes

### POST `/auth/register`
Register a new user. Sends OTP to email.

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "Pass@1234"
}
```
**Success `201`**
```json
{ "success": true, "message": "Registration successful! Please check your email for the OTP." }
```
**Errors**
- `400` — missing/invalid fields
- `409` — email or phone already registered

---

### POST `/auth/verify-otp`
Verify OTP sent during registration.

**Request Body**
```json
{ "email": "john@example.com", "otp": "482910" }
```
**Success `200`**
```json
{ "success": true, "message": "Email verified successfully! You can now log in." }
```
**Errors**
- `400` — invalid/expired OTP
- `429` — max 3 attempts exceeded

---

### POST `/auth/resend-otp`
Resend OTP (works for both registration and login OTP).

**Request Body**
```json
{ "email": "john@example.com" }
```
**Success `200`**
```json
{ "success": true, "message": "OTP resent to your email. 2 resend(s) remaining." }
```
**Errors**
- `429` — max 3 resends exceeded

---

### POST `/auth/login`
Login with email and password.

**Request Body**
```json
{ "email": "john@example.com", "password": "Pass@1234" }
```
**Success `200`**
```json
{
  "success": true,
  "accessToken": "<jwt_access_token>",
  "refreshToken": "<jwt_refresh_token>"
}
```
**Errors**
- `401` — invalid email or password
- `403` — email not verified

---

### POST `/auth/login-otp`
Request OTP to login (passwordless).

**Request Body**
```json
{ "email": "john@example.com" }
```
**Success `200`**
```json
{ "success": true, "message": "OTP sent to your email. 2 resend(s) remaining." }
```

---

### POST `/auth/login-otp/verify`
Verify login OTP and receive tokens.

**Request Body**
```json
{ "email": "john@example.com", "otp": "482910" }
```
**Success `200`**
```json
{
  "success": true,
  "accessToken": "<jwt_access_token>",
  "refreshToken": "<jwt_refresh_token>"
}
```
**Errors**
- `400` — invalid/expired OTP
- `429` — max 3 attempts exceeded

---

### POST `/auth/forgot-password`
Request a password reset link via email.

**Request Body**
```json
{ "email": "john@example.com" }
```
**Success `200`**
```json
{ "success": true, "message": "If that email exists, a reset link has been sent." }
```
> Always returns 200 to prevent email enumeration.

---

### POST `/auth/reset-password`
Reset password using token from email.

**Request Body**
```json
{ "token": "<token_from_email_link>", "newPassword": "NewPass@1234" }
```
**Success `200`**
```json
{ "success": true, "message": "Password reset successful. You can now log in." }
```
**Errors**
- `400` — invalid or expired token

---

### POST `/auth/refresh-token`
Get a new access token using refresh token.

**Request Body**
```json
{ "refreshToken": "<jwt_refresh_token>" }
```
**Success `200`**
```json
{ "success": true, "accessToken": "<new_jwt_access_token>" }
```
**Errors**
- `401` — invalid or expired refresh token

---

### POST `/auth/logout`
Logout and invalidate refresh token.

**Request Body**
```json
{ "refreshToken": "<jwt_refresh_token>" }
```
**Success `200`**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### GET `/auth/me` 🔒
Get current logged-in user profile.

**Headers**
```
Authorization: Bearer <access_token>
```
**Success `200`**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "isVerified": true,
    "role": "user",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
**Errors**
- `401` — missing or invalid token
- `403` — email not verified

---

## Admin Routes 🔒

All admin routes require `Authorization: Bearer <access_token>` header.

---

### GET `/admin/users`
Get all users. Requires `admin` or `super_admin` role.

**Headers**
```
Authorization: Bearer <access_token>
```
**Success `200`**
```json
{
  "success": true,
  "count": 2,
  "users": [...]
}
```
**Errors**
- `403` — insufficient role

---

### DELETE `/admin/users/:id`
Delete a user. Requires `super_admin` role.

**Headers**
```
Authorization: Bearer <access_token>
```
**Success `200`**
```json
{ "success": true, "message": "User deleted successfully" }
```

---

### PATCH `/admin/users/:id/role`
Update a user's role. Requires `super_admin` role.

**Headers**
```
Authorization: Bearer <access_token>
```
**Request Body**
```json
{ "role": "admin" }
```
**Success `200`**
```json
{
  "success": true,
  "user": { "name": "John Doe", "email": "john@example.com", "role": "admin" }
}
```

---

## Error Response Format

All errors follow this format:
```json
{ "success": false, "message": "Error description" }
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `429` | Too Many Requests |
| `500` | Internal Server Error |
