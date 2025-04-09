import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Form, Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faFire, 
  faFolder, 
  faPlus, 
  faSearch, 
  faUser,
  faGamepad,
  faMusic,
  faFilm,
  faLaptop,
  faFutbol
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { CategoryProvider, useCategories } from './contexts/CategoryContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import components
import Layout from './components/Layout';
import Logo from './components/Logo';

function NavigationBar() {
  const { user, logout } = useAuth();
  const { categories, loading, error } = useCategories();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleCategorySelect = (categoryId) => {
    navigate(`/?category=${categoryId}`);
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Gaming': faGamepad,
      'Music': faMusic,
      'Movies': faFilm,
      'Technology': faLaptop,
      'Sports': faFutbol
    };
    return iconMap[categoryName] || faFolder;
  };

  return (
    <Navbar bg="white" expand="lg" className="sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <Logo asLink={false} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              <FontAwesomeIcon icon={faHome} className="me-2" />
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/?sort=trending">
              <FontAwesomeIcon icon={faFire} className="me-2" />
              Trending
            </Nav.Link>
            <Dropdown>
              <Dropdown.Toggle variant="light">
                <FontAwesomeIcon icon={faFolder} className="me-2" />
                Categories
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/')}>
                  <FontAwesomeIcon icon={faFolder} className="me-2" />
                  All Categories
                </Dropdown.Item>
                <Dropdown.Divider />
                {loading ? (
                  <Dropdown.Item disabled>Loading...</Dropdown.Item>
                ) : error ? (
                  <Dropdown.Item disabled>{error}</Dropdown.Item>
                ) : (
                  categories.map(category => (
                    <Dropdown.Item 
                      key={category._id}
                      onClick={() => handleCategorySelect(category._id)}
                    >
                      <FontAwesomeIcon icon={getCategoryIcon(category.name)} className="me-2" />
                      {category.name}
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>
            {user && (
              <Nav.Link as={Link} to="/create-post">
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Create Post
              </Nav.Link>
            )}
          </Nav>
          <Form className="d-flex mx-3" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="me-2"
            />
            <Button type="submit" variant="outline-primary">
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Form>
          <Nav>
            {user ? (
              <>
                <Dropdown>
                  <Dropdown.Toggle variant="light" id="user-dropdown" className="d-flex align-items-center">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`}
                      alt={user.username}
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px' }}
                    />
                    {user.username}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CategoryProvider>
          <SocketProvider>
            <ThemeProvider>
              <Layout>
                <Container className="py-4">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/post/:id" element={<PostDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Container>
              </Layout>
            </ThemeProvider>
          </SocketProvider>
        </CategoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 