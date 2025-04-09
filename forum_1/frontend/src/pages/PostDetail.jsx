import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThumbsUp, 
  faThumbsDown, 
  faHeart,
  faComment,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import Comment from '../components/Comment';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { socket, emitEvent } = useSocket();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/${id}`);
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to fetch post');
        }
        
        const postData = responseData.data || responseData;
        setPost(postData);
        console.log('Fetched post:', postData);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, API_URL]);

  useEffect(() => {
    if (socket) {
      socket.on('commentAdded', ({ postId, comment }) => {
        if (postId === id) {
          setPost(prevPost => ({
            ...prevPost,
            comments: [...prevPost.comments, comment]
          }));
        }
      });

      socket.on('postLiked', ({ postId, userId }) => {
        if (postId === id) {
          setPost(prevPost => ({
            ...prevPost,
            likes: prevPost.likes.includes(userId)
              ? prevPost.likes.filter(id => id !== userId)
              : [...prevPost.likes, userId]
          }));
        }
      });

      socket.on('userTyping', ({ postId, user }) => {
        if (postId === id) {
          setTypingUsers(prev => new Set([...prev, user]));
          setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set([...prev]);
              newSet.delete(user);
              return newSet;
            });
          }, 2000);
        }
      });

      return () => {
        socket.off('commentAdded');
        socket.off('postLiked');
        socket.off('userTyping');
      };
    }
  }, [socket, id]);

  const handleVote = async (voteType) => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}/vote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to vote');
      }

      // Update post with the response data
      setPost(responseData);
      
      // Emit socket event for real-time updates
      if (socket) {
        emitEvent('postVoted', { postId: id, userId: user._id, voteType });
      }
    } catch (err) {
      console.error('Error voting:', err);
      setError(err.message || 'Failed to vote');
    }
  };

  const handleLike = async () => {
    if (!user) {
      setError('Please log in to like posts');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to like post');
      }

      const { success, data } = await response.json();
      
      if (!success || !data) {
        throw new Error('Failed to like post');
      }

      setPost(data);
    } catch (err) {
      console.error('Error liking post:', err);
      setError(err.message || 'Failed to like post');
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    if (user) {
      emitEvent('typing', { postId: id, user: user.username });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting comment:', comment); // Debug log
      const response = await fetch(`${API_URL}/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      });

      const responseData = await response.json();
      console.log('Comment response:', responseData); // Debug log
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to post comment');
      }

      // The backend returns the populated post directly
      setPost(responseData);
      setComment('');
      
      // Emit socket event for real-time updates
      if (socket) {
        emitEvent('commentAdded', { postId: id, comment: responseData.comments[0] });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setPost(prevPost => ({
        ...prevPost,
        comments: prevPost.comments.filter(comment => comment._id !== commentId)
      }));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>Post not found</h2>
          <p>The post you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Back Home
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {error && <Alert variant="danger">{error}</Alert>}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            {post.userId && (
              <Link to={`/profile/${post.userId._id}`} className="text-decoration-none">
                <div className="d-flex align-items-center">
                  <img
                    src={post.userId.avatar || `https://api.multiavatar.com/${encodeURIComponent(post.userId.username || 'U')}`}
                    alt={post.userId.username || 'Unknown User'}
                    className="rounded-circle me-2"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://api.multiavatar.com/${encodeURIComponent(post.userId.username || 'unknown')}`;
                    }}
                  />
                  <div>
                    <div className="fw-bold text-dark">{post.userId.username || 'Unknown User'}</div>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </small>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {post.categoryId && (
            <div className="mb-3">
              <Link to={`/?category=${post.categoryId._id}`} className="text-decoration-none">
                <span className="badge bg-primary">{post.categoryId.name || 'Uncategorized'}</span>
              </Link>
            </div>
          )}

          <Card.Title as="h1" className="mb-4">{post.title}</Card.Title>
          <Card.Text className="mb-4">{post.content}</Card.Text>

          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => handleVote('up')}
              disabled={!user}
              className={`btn btn-link p-0 text-decoration-none ${
                post.upvotes?.includes(user?._id) ? 'text-success' : 'text-muted'
              }`}
              title="Upvote"
            >
              <FontAwesomeIcon icon={faThumbsUp} className="me-1" />
              <small>{post.upvotes?.length || 0}</small>
            </button>
            <button
              onClick={() => handleVote('down')}
              disabled={!user}
              className={`btn btn-link p-0 text-decoration-none ${
                post.downvotes?.includes(user?._id) ? 'text-purple' : 'text-muted'
              }`}
              style={{ 
                '--bs-text-purple': '#6f42c1',
                color: post.downvotes?.includes(user?._id) ? '#6f42c1' : 'inherit' 
              }}
              title="Downvote"
            >
              <FontAwesomeIcon icon={faThumbsDown} className="me-1" />
              <small>{post.downvotes?.length || 0}</small>
            </button>
            <button
              onClick={handleLike}
              disabled={!user}
              className={`btn btn-link p-0 text-decoration-none ${
                post.likes?.includes(user?._id) ? 'text-danger' : 'text-muted'
              }`}
              title="Like"
            >
              <FontAwesomeIcon icon={faHeart} className="me-1" />
              <small>{post.likes?.length || 0}</small>
            </button>
            <div className="vr" />
            <span className="text-muted">
              <FontAwesomeIcon icon={faComment} className="me-1" />
              <small>{post.comments?.length || 0} Comments</small>
            </span>
          </div>
        </Card.Body>
      </Card>

      <div className="comments-section">
        <h3 className="mb-4">Comments</h3>
        
        {user ? (
          <Form onSubmit={handleCommentSubmit} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={handleCommentChange}
                placeholder="Write a comment..."
                className="shadow-sm"
              />
            </Form.Group>
            <Button 
              type="submit" 
              disabled={!comment.trim() || submitting}
              className="px-4"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </Form>
        ) : (
          <Alert variant="info" className="mb-4">
            Please <Link to="/login">log in</Link> to comment
          </Alert>
        )}

        {typingUsers.size > 0 && (
          <div className="text-muted mb-3">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div className="comments-list">
          {post.comments?.length > 0 ? (
            post.comments.map(comment => (
              <Comment
                key={comment._id}
                comment={comment}
                onDelete={handleDeleteComment}
              />
            ))
          ) : (
            <p className="text-muted text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}

export default PostDetail;