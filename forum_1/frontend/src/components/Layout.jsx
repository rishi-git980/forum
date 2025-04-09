import React, { useState } from 'react';
import { Container, Row, Col, Navbar, Nav, Form, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder, 
  faSearch, 
  faUser, 
  faSun, 
  faMoon,
  faHome,
  faFire,
  faPlus,
  faSignInAlt,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { useCategories } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAvatarUrl, getAvatarStyles } from '../utils/avatar';
import logo2 from '../data/logo2.png';

function Layout({ children }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { categories, loading, error } = useCategories();
  const selectedCategory = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogoExpanded, setIsLogoExpanded] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar expand="lg" className="mb-4 shadow-sm" bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"}>
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center" onClick={(e) => e.preventDefault()}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              position: 'relative',
              marginRight: '0.5rem'
            }}>
              <img
                src={logo2}
                alt="QuirkyTalk Logo"
                height={isLogoExpanded ? "200" : "32"}
                width={isLogoExpanded ? "200" : "32"}
                style={{ 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  padding: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  zIndex: isLogoExpanded ? '9999' : '1',
                  position: isLogoExpanded ? 'fixed' : 'absolute',
                  top: isLogoExpanded ? '50%' : '0',
                  left: isLogoExpanded ? '50%' : '0',
                  transform: isLogoExpanded ? 'translate(-50%, -50%)' : 'none',
                  boxShadow: isLogoExpanded ? '0 0 20px rgba(0,0,0,0.3)' : 'none',
                  border: isLogoExpanded ? '3px solid var(--primary-color)' : 'none',
                  backgroundColor: 'var(--card-bg)'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLogoExpanded(!isLogoExpanded);
                }}
              />
            </div>
            <div className="d-flex">
              <span className="fw-bold h5 mb-0 text-primary">Quirky</span>
              <span className="fw-bold h5 mb-0 text-secondary">Talk</span>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className={location.pathname === '/' && !searchParams.get('sort') ? 'active' : ''}>
                <FontAwesomeIcon icon={faHome} className="me-2" />
                Home
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/?sort=trending" 
                className={searchParams.get('sort') === 'trending' ? 'active' : ''}
              >
                <FontAwesomeIcon icon={faFire} className="me-2" />
                Trending
              </Nav.Link>
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link}>
                  <FontAwesomeIcon icon={faFolder} className="me-2" />
                  Categories
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/">
                    <span className="me-2">📚</span>
                    All Categories
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  {categories.map(category => (
                    <Dropdown.Item 
                      key={category._id}
                      as={Link}
                      to={`/?category=${category._id}`}
                      active={selectedCategory === category._id}
                    >
                      <span className="me-2">{category.icon}</span>
                      {category.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              {user && (
                <Nav.Link as={Link} to="/create-post" className={location.pathname === '/create-post' ? 'active' : ''}>
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
                className="me-2 search-input"
              />
              <Button type="submit" variant="outline-primary">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </Form>
            <Button
              variant={darkMode ? "outline-light" : "outline-dark"}
              className="me-2"
              onClick={toggleTheme}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
            </Button>
            <Nav>
              {user ? (
                <>
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant={darkMode ? "dark" : "light"} 
                      id="user-dropdown" 
                      className="d-flex align-items-center"
                    >
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.username}
                        className="rounded-circle me-2"
                        style={getAvatarStyles({ size: 32 })}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getAvatarUrl(user.username);
                        }}
                      />
                      {user.username}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className={darkMode ? "dropdown-menu-dark" : ""}>
                      <Dropdown.Item as={Link} to="/profile">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">
                    <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid>
        <Row>
          <Col md={2} className="sidebar" style={{ position: 'sticky', top: '56px', height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
            <div className="p-2">
              <h6 className="mb-2 ps-2 fw-bold">Categories</h6>
              <div className="d-flex flex-column gap-1">
                <Link
                  to="/"
                  className={`category-link py-2 px-3 rounded text-decoration-none ${!selectedCategory ? 'active' : ''}`}
                >
                  <span className="me-2">📚</span>
                  All Categories
                </Link>
                {categories.map(category => (
                  <Link
                    key={category._id}
                    to={`/?category=${category._id}`}
                    className={`category-link py-2 px-3 rounded text-decoration-none ${selectedCategory === category._id ? 'active' : ''}`}
                  >
                    <span className="me-2">{category.icon}</span>
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </Col>
          <Col md={10} className="main-content py-3">
            {children}
          </Col>
        </Row>
      </Container>

      <style>{`
        .navbar {
          background-color: var(--card-bg) !important;
          border-bottom: 1px solid var(--border-color);
        }
        .nav-link {
          color: var(--text-primary) !important;
          font-weight: 500;
        }
        .nav-link:hover {
          color: var(--primary-color) !important;
        }
        .nav-link.active {
          color: var(--primary-color) !important;
        }
        .dropdown-menu {
          background-color: var(--card-bg) !important;
          border-color: var(--border-color) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .dropdown-item {
          color: var(--text-primary) !important;
          font-weight: 500;
        }
        .dropdown-item:hover {
          background-color: var(--bg-secondary) !important;
          color: var(--primary-color) !important;
        }
        .dropdown-item.active {
          background-color: var(--primary-color) !important;
          color: white !important;
        }
        .dropdown-toggle {
          background-color: transparent !important;
          border: none !important;
          color: var(--text-primary) !important;
          font-weight: 500;
        }
        .dropdown-toggle:hover {
          color: var(--primary-color) !important;
        }
        .search-input {
          background-color: var(--card-bg) !important;
          border-color: var(--border-color) !important;
          color: var(--text-primary) !important;
        }
        .search-input::placeholder {
          color: var(--text-secondary) !important;
        }
        .sidebar {
          background: var(--card-bg);
          border-right: 1px solid var(--border-color);
          z-index: 100;
          min-width: 180px;
        }
        .category-link {
          color: var(--text-primary);
          transition: all 0.2s ease;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 500;
        }
        .category-link:hover {
          background: var(--bg-secondary);
          color: var(--primary-color);
          border-color: var(--primary-color);
          transform: translateX(3px);
        }
        .category-link.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          transform: translateX(3px);
        }
        .navbar-brand img {
          position: relative;
        }
        
        .navbar-brand img:hover {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
}

export default Layout; 