# IFTX Backend

Backend server for IFTX application with user authentication using MongoDB and Express.js.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   Copy the `.env` file and update the values as needed.

3. **Start MongoDB:**
   Make sure MongoDB is running on your system and accessible at `mongodb://localhost:27017`

4. **Run the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /signup` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /status` - Check authentication status
- `GET /profile` - Get current user profile (protected)

### Example Usage

**Signup:**
```javascript
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login:**
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Database

- Database: `iftx`
- Collection: `users`
- The user data will be stored in MongoDB with the following structure:
  - email (unique)
  - password (hashed)
  - createdAt
  - lastLogin

## Session Management

The application uses express-session for session management. Sessions are stored in memory by default and last for 24 hours.