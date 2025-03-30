import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { API_URL } from '../config';

const PostDetailPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  
  const { user, isAuthenticated } = useContext(UserContext);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // In a real app, fetch from API
        // const res = await axios.get(`${API_URL}/api/posts/${postId}`);
        // setPost(res.data);
        
        // Demo data
        setPost({
          _id: postId || '1',
          title: 'Tips for remote work productivity',
          content: 'After working remotely for 3 years, I\'ve found that having a dedicated workspace and sticking to a routine makes a huge difference. What are your best remote work tips?\n\nHere are some of my personal tips:\n\n1. Create a dedicated workspace - Even if it\'s just a corner of your living room, having a space that\'s just for work helps your brain switch into "work mode".\n\n2. Stick to a routine - Start and end your workday at the same time each day. This helps create boundaries between work and personal life.\n\n3. Take regular breaks - The Pomodoro Technique (25 minutes of work followed by a 5-minute break) works well for me.\n\n4. Stay connected with colleagues - Regular video calls help combat isolation and keep team spirit high.\n\n5. Dress for work - You don\'t need to wear formal clothes, but changing out of your pajamas signals to your brain that it\'s time to work.',
          author: {
            _id: 'user1',
            username: 'Alex Rivera',
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          category: 'lifestyle',
          upvotes: 65,
          downvotes: 9,
          comments: [
            {
              _id: 'comment1',
              text: "I completely agree about having a dedicated workspace! It's been a game-changer for me as well.",
              author: {
                _id: 'user2',
                username: 'Jessica Taylor',
              },
              createdAt: new Date(Date.now() - 72000000).toISOString(), // 20 hours ago
              upvotes: 12,
              downvotes: 0,
            },
            {
              _id: 'comment2',
              text: "Taking regular walks outside has been essential for my mental health while working remotely. It gives me a chance to reset and get some fresh air.",
              author: {
                _id: 'user3',
                username: 'Michael Wilson',
              },
              createdAt: new Date(Date.now() - 54000000).toISOString(), // 15 hours ago
              upvotes: 8,
              downvotes: 1,
            },
            {
              _id: 'comment3',
              text: "Have you tried any specific apps or tools for remote work productivity? I've been using Notion to organize my tasks and it's been really helpful.",
              author: {
                _id: 'user4',
                username: 'Sarah Johnson',
              },
              createdAt: new Date(Date.now() - 36000000).toISOString(), // 10 hours ago
              upvotes: 5,
              downvotes: 0,
            }
          ]
        });
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId]);
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    
    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    
    if (!isAuthenticated) {
      setCommentError('You must be logged in to comment');
      return;
    }
    
    try {
      setCommentLoading(true);
      
      // In a real app, send the comment to the API
      // const config = {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`,
      //   },
      // };
      
      // const res = await axios.post(
      //   `${API_URL}/api/posts/${postId}/comments`,
      //   { text: commentText },
      //   config
      // );
      
      // Update the local state to show the new comment
      if (post) {
        const newComment = {
          _id: `comment${post.comments.length + 1}`,
          text: commentText,
          author: {
            _id: user?._id || 'user',
            username: user?.username || 'User',
          },
          createdAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0,
        };
        
        setPost({
          ...post,
          comments: [...post.comments, newComment],
        });
        
        setCommentText('');
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to post comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };
  
  const getInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };
  
  const calculateTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!post) {
    return <Alert variant="warning">Post not found</Alert>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="text-decoration-none">
          &larr; Back to posts
        </Link>
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <div className="post-header mb-3">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.username} className="post-avatar" />
            ) : (
              <div className="avatar-placeholder">{getInitials(post.author.username)}</div>
            )}
            <div>
              <h5 className="mb-0">{post.title}</h5>
              <div className="post-meta">
                <Link to={`/user/${post.author._id}`} className="text-decoration-none">
                  {post.author.username}
                </Link> • {calculateTimeAgo(post.createdAt)} • 
                <Link to={`/category/${post.category}`} className="ms-1 text-decoration-none">
                  {post.category}
                </Link>
              </div>
            </div>
          </div>
          
          <div className="post-content mb-4">
            {post.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {post.image && (
            <div className="mb-4">
              <img src={post.image} alt={post.title} className="img-fluid rounded" />
            </div>
          )}
          
          <div className="post-actions">
            <div className="vote-buttons">
              <Button variant="outline-secondary" size="sm">
                <i className="bi bi-arrow-up"></i>
              </Button>
              <span className="vote-count">{post.upvotes - post.downvotes}</span>
              <Button variant="outline-secondary" size="sm">
                <i className="bi bi-arrow-down"></i>
              </Button>
            </div>
            
            <Button variant="outline-primary" size="sm">
              Share
            </Button>
            
            <Button variant="outline-secondary" size="sm">
              Save
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      <h3 className="mb-3">Comments ({post.comments.length})</h3>
      
      {isAuthenticated ? (
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmitComment}>
              {commentError && <Alert variant="danger">{commentError}</Alert>}
              <Form.Group className="mb-3" controlId="commentText">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Write your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
              </Form.Group>
              <div className="text-end">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={commentLoading}
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Card className="mb-4 text-center p-3">
          <p>You must be logged in to comment</p>
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
        </Card>
      )}
      
      {post.comments.length > 0 ? (
        post.comments.map((comment) => (
          <Card key={comment._id} className="mb-3">
            <Card.Body>
              <div className="d-flex mb-2">
                {comment.author.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.username} className="post-avatar me-2" />
                ) : (
                  <div className="avatar-placeholder">{getInitials(comment.author.username)}</div>
                )}
                <div>
                  <h6 className="mb-0">{comment.author.username}</h6>
                  <small className="text-muted">{calculateTimeAgo(comment.createdAt)}</small>
                </div>
              </div>
              <p className="mb-2">{comment.text}</p>
              <div className="d-flex align-items-center">
                <Button variant="link" className="p-0 text-muted me-2 btn-sm">
                  <i className="bi bi-arrow-up"></i>
                </Button>
                <span className="me-2">{comment.upvotes - comment.downvotes}</span>
                <Button variant="link" className="p-0 text-muted me-3 btn-sm">
                  <i className="bi bi-arrow-down"></i>
                </Button>
                <Button variant="link" className="p-0 text-muted btn-sm">
                  Reply
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default PostDetailPage;
