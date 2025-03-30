# ForumHub

A modern discussion forum platform built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (register, login, profile management)
- Create, read, update, and delete posts
- Categorized discussions
- Comment on posts
- Upvote/downvote posts and comments
- Responsive design for all screen sizes
- Rich user profiles

## Tech Stack

### Frontend
- React
- React Router
- React Bootstrap
- Axios
- Context API for state management

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- BCrypt for password hashing

## Project Structure

```
├── public/                 # Static files
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── context/            # Context API files
│   ├── pages/              # Page components
│   ├── App.tsx             # Main App component
│   └── index.tsx           # Entry point
├── server/                 # Node.js backend
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Server entry point
├── .env                    # Environment variables
└── package.json            # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/forumhub.git
cd forumhub
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

4. Run the development server
```
# Start backend server
npm run server

# Start frontend development server
npm run client

# Run both frontend and backend
npm run dev
```

## Deployment

The application can be deployed to platforms like Heroku, Vercel, or any other platform that supports Node.js.

### Frontend Build
```
npm run build
```

## License

This project is licensed under the MIT License.
