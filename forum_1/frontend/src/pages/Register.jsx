import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <h2 className="text-center mb-4 fw-bold">Create Account</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="username">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Username
                </Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="form-control-lg"
                  autoComplete="username"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="email">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  Email address
                </Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control-lg"
                  autoComplete="email"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="password">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faLock} className="me-2" />
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-control-lg"
                  autoComplete="new-password"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="confirmPassword">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faLock} className="me-2" />
                  Confirm Password
                </Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control-lg"
                  autoComplete="new-password"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 py-3 mb-4 fw-bold fs-5"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>

              <div className="text-center fs-5">
                Already have an account? <Link to="/login" className="text-decoration-none">Login</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Register; 