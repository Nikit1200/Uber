# 🚀 User API Documentation

## 📌 Endpoint: Register User

### 🔗 URL
POST /users/register

---

## 📖 Description

This endpoint is used to register a new user.

It performs the following operations:
- Validates user input using express-validator
- Hashes the password using bcrypt
- Stores user data in MongoDB
- Generates a JWT token
- Returns the created user along with the token

---

## 📥 Request Body (Required Data Format)

Send data in JSON format:

{
  "fullname": {
    "firstname": "Nikit",
    "lastname": "Kumar"
  },
  "email": "nikit@example.com",
  "password": "123456"
}

---

## 📌 Field Requirements

- fullname.firstname → minimum 3 characters (required)
- fullname.lastname → minimum 3 characters (required)
- email → valid email (required)
- password → minimum 6 characters (required)

---

## ✅ Success Response

Status Code: 201 Created

{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "fullname": {
      "firstname": "Nikit",
      "lastname": "Kumar"
    },
    "email": "nikit@example.com"
  }
}

---

## ❌ Error Responses

### 1. Validation Error

Status Code: 400 Bad Request

{
  "error": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}

---

### 2. Missing Fields Error

Status Code: 500 Internal Server Error

{
  "message": "All fields are required"
}

---

## 🔐 Security Notes

- Password is hashed using bcrypt
- JWT token is generated using process.env.JWT_SECRET
- Password is not returned in response

---

## ⚙️ API Flow

1. Validate request
2. Hash password
3. Create user in database
4. Generate token
5. Send response

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- bcrypt
- jsonwebtoken
- express-validator

---

## 👨‍💻 Author

Nikit Kumar