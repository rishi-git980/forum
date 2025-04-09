# QuirkyTalk Backend

This is the backend server for the QuirkyTalk forum application, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Post management (create, read, update, delete)
- Comment system
- Category management
- Avatar generation and caching
- Real-time notifications
- Rate limiting and security features

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/forum
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

#### Register
- **POST** `/api/auth/register`
- Request body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
- **POST** `/api/auth/login`
- Request body:
```json
{
  "email": "string",
  "password": "string"
}
```

### Posts

#### Get All Posts
- **GET** `/api/posts`
- Query parameters:
  - `category`: Filter by category ID
  - `sort`: Sort by 'trending' or 'latest'
  - `search`: Search term
  - `page`: Page number
  - `limit`: Posts per page

#### Create Post
- **POST** `/api/posts`
- Headers: `Authorization: Bearer <token>`
- Request body:
```json
{
  "title": "string",
  "content": "string",
  "category": "string"
}
```

#### Update Post
- **PUT** `/api/posts/:id`
- Headers: `Authorization: Bearer <token>`
- Request body:
```json
{
  "title": "string",
  "content": "string",
  "category": "string"
}
```

#### Delete Post
- **DELETE** `/api/posts/:id`
- Headers: `Authorization: Bearer <token>`

### Comments

#### Get Post Comments
- **GET** `/api/comments/post/:postId`
- Query parameters:
  - `page`: Page number
  - `limit`: Comments per page

#### Create Comment
- **POST** `/api/comments`
- Headers: `Authorization: Bearer <token>`
- Request body:
```json
{
  "content": "string",
  "post": "string"
}
```

#### Update Comment
- **PUT** `/api/comments/:id`
- Headers: `Authorization: Bearer <token>`
- Request body:
```json
{
  "content": "string"
}
```

#### Delete Comment
- **DELETE** `/api/comments/:id`
- Headers: `Authorization: Bearer <token>`

### Categories

#### Get All Categories
- **GET** `/api/categories`

#### Create Category
- **POST** `/api/categories`
- Headers: `Authorization: Bearer <token>`
- Request body:
```json
{
  "name": "string",
  "description": "string"
}
```

### Avatars

#### Get User Avatar
- **GET** `/api/avatar/:seed`
- Returns an SVG avatar based on the provided seed

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   ├── app.js           # Express application setup
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── package.json         # Project dependencies
└── README.md           # This file
```

## Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm start`: Start production server
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

### Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `NODE_ENV`: Environment (development/production)

## Security Features

- Rate limiting for API endpoints
- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Error handling middleware

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 