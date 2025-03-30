import React, { useContext } from 'react';
import { Navbar, Container, Nav, Form, Button, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Search } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="navbar" variant="dark" bg="primary" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <span className="d-flex align-items-center">
            <img 
              src="https://i.ibb.co/K9PLTDX/forumhub-logo.png" 
              alt="ForumHub Logo" 
              width="40" 
              height="40" 
              className="me-2 rounded"
            />
            <span className="fw-bold">ForumHub</span>
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/category/technology">Categories</Nav.Link>
            <Nav.Link as={Link} to="/trending">Trending</Nav.Link>
          </Nav>
          
          <Form className="d-flex mx-auto" style={{ maxWidth: '400px' }}>
            <div className="position-relative w-100">
              <Form.Control
                type="search"
                placeholder="Search posts, users, or topics..."
                className="me-2 ps-4"
                aria-label="Search"
              />
              <Search className="position-absolute top-50 translate-middle-y ms-2" size={18} />
            </div>
          </Form>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outline-light"
                  className="me-2"
                  as={Link} 
                  to="/create-post"
                >
                  Create Post
                </Button>
                <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar}
                      alt={user.username}
                      width="32"
                      height="32"
                      roundedCircle
                      className="me-2"
                    />
                  ) : (
                    <div className="bg-light text-primary rounded-circle d-flex justify-content-center align-items-center me-2" style={{ width: '32px', height: '32px' }}>
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="d-none d-md-inline">{user?.username}</span>
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Log In</Nav.Link>
                <Nav.Link as={Link} to="/register">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
