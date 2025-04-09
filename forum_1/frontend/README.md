# QuirkyTalk Frontend

This is the frontend application for QuirkyTalk, a modern forum platform built with React, Bootstrap, and various other technologies.

## Features

- Modern, responsive UI with dark/light mode support
- User authentication and profile management
- Post creation, editing, and deletion
- Comment system with real-time updates
- Category-based post organization
- Trending posts based on engagement
- Search functionality
- Avatar generation and customization
- Interactive UI elements (expanding logo, animations)
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running (see backend README)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

## Project Structure

```
frontend/
├── public/              # Static files
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx   # Main layout component
│   │   ├── PostCard.jsx # Post display component
│   │   └── ...         # Other components
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   └── ...         # Other pages
│   ├── utils/          # Utility functions
│   │   ├── api.js      # API calls
│   │   └── avatar.js   # Avatar generation
│   ├── styles/         # CSS/SCSS files
│   │   ├── App.css
│   │   └── custom.scss
│   ├── data/           # Static data
│   │   ├── logo1.png
│   │   └── logo2.png
│   ├── App.jsx         # Main App component
│   └── index.js        # Entry point
├── package.json        # Project dependencies
└── README.md          # This file
```

## Key Components

### Layout
- Responsive navigation bar
- Dark/light mode toggle
- Search functionality
- User authentication links
- Interactive logo with expansion animation

### Post Management
- Create, edit, and delete posts
- Rich text editing
- Category selection
- Image upload support
- Like and comment functionality

### Profile
- User information display
- Post and comment history
- Avatar customization
- Profile editing capabilities

### Authentication
- Login/Register forms
- Password recovery
- Protected routes
- Session management

## Styling

The application uses a combination of:
- Bootstrap 5 for layout and components
- Custom SCSS for theme customization
- CSS variables for dynamic theming
- Responsive design principles

## Development

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Environment Variables

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

## Features in Detail

### Dark/Light Mode
- Automatic system preference detection
- Manual toggle option
- Persisted user preference
- Smooth transitions between modes

### Avatar System
- Dynamic avatar generation
- Multiple avatar styles
- Caching for performance
- Fallback options

### Real-time Updates
- WebSocket integration
- Live comment updates
- Notification system
- Post engagement tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 