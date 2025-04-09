import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeading, faAlignLeft, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories();
  const { createPost } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const post = await createPost({ title, content, categoryId });
      navigate(`/post/${post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center py-5">
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <h2 className="text-center mb-4 fw-bold">Create New Post</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="title">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faHeading} className="me-2" />
                  Title
                </Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="form-control-lg"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="category">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                  Category
                </Form.Label>
                <Form.Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="form-control-lg"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option 
                      key={category._id} 
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4" controlId="content">
                <Form.Label className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faAlignLeft} className="me-2" />
                  Content
                </Form.Label>
                <Form.Control
                  as="textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="form-control-lg"
                  style={{ minHeight: '200px' }}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 py-3 mb-3 fw-bold fs-5"
              >
                {loading ? 'Creating Post...' : 'Create Post'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default CreatePost; 