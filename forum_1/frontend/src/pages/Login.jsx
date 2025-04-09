import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <h2 className="text-center mb-4 fw-bold">Welcome Back!</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 py-3 mb-4 fw-bold fs-5"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center fs-5">
                Don't have an account? <Link to="/register" className="text-decoration-none">Register</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Login; 