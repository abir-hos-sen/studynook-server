# StudyNook Server

This is the Express.js backend for the StudyNook application.

## Key Features
- **RESTful API**: Endpoints for authentication, rooms, and bookings.
- **MongoDB**: Integration with Mongoose for data modeling.
- **JWT Authentication**: Secure HTTP-only cookies for token storage.
- **Conflict Checking**: Advanced logic to prevent double bookings.

## Setup Instructions
1. Clone the repository
2. Run `npm install`
3. Create a `.env` file with your `MONGODB_URI` and `JWT_SECRET`
4. Run `npm start` (or `npm run dev` for nodemon)

## Technologies Used
- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Token (JWT)
- Bcrypt.js
- Cookie Parser
- Cors
