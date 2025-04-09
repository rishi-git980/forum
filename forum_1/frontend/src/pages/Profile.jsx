import React, { useState, useEffect } from 'react';
import { Container, Card, Tabs, Tab, Badge, Row, Col, Alert, Modal, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faComments,
  faHeart,
  faCamera,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl, getAvatarStyles } from '../utils/avatar';

// Add cache for responses
const responseCache = new Map();

// Add this helper function at the top level
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Add this helper function for fetching with retry and caching
const fetchWithRetry = async (url, options, maxRetries = 3, initialDelay = 1000) => {
  // Check cache first
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  let lastError;
  let delayTime = initialDelay;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delayTime;
        await delay(waitTime);
        delayTime *= 2;
        continue;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Cache successful response
      responseCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      if (i === maxRetries - 1) throw lastError;
      await delay(delayTime);
      delayTime *= 2;
    }
  }
};

const ProfileAvatar = ({ user, size = 150 }) => (
  <img
    src={getAvatarUrl(user, { size })}
    alt={`${user?.username || 'User'}'s avatar`}
    style={getAvatarStyles({ size, border: true })}
    className="rounded-circle"
  />
);

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token, updateUser } = useAuth();
  const { socket } = useSocket();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    avatar: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // If no userId is provided, use current user's ID
  const targetUserId = id || (currentUser ? currentUser._id : null);
  const isOwnProfile = currentUser && targetUserId === currentUser._id;

  // Redirect to login only if trying to access own profile without being logged in
  useEffect(() => {
    if (!id && !currentUser) {
      navigate('/login');
    }
  }, [id, currentUser, navigate]);

  // Function to get current avatar URL with proper fallback
  const getCurrentAvatarUrl = () => {
    if (!profileUser) {
      console.log('No profile user, using default avatar');
      return getAvatarUrl('default');
    }
    
    // If user has a custom avatar URL that's not from our API, use it directly
    if (profileUser.avatar && 
        profileUser.avatar.startsWith('http') && 
        !profileUser.avatar.includes(API_URL)) {
      console.log('Using custom avatar URL:', profileUser.avatar);
      return profileUser.avatar;
    }
    
    // Generate avatar using username as seed if no avatar is set
    if (!profileUser.avatar) {
      const avatarUrl = getAvatarUrl(profileUser.username);
      console.log('Generated avatar URL for user:', avatarUrl);
      return avatarUrl;
    }

    // Use the stored avatar URL
    return profileUser.avatar;
  };

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    const signal = abortController.signal;

    const fetchUserData = async () => {
      if (!targetUserId || !isMounted) return;
      
      try {
        const response = await fetchWithRetry(`${API_URL}/users/${targetUserId}`, {
          signal,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!isMounted) return;
        
        // Handle the response format from the backend
        const userData = response.data || response;
        
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid user data received');
        }

        setProfileUser(userData);
        setEditForm({
          username: userData.username || '',
          email: userData.email || '',
          avatar: userData.avatar || ''
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        console.error('Error fetching user data:', error);
        if (isMounted) {
          setError(error.message);
        }
      }
    };

    const fetchUserPosts = async () => {
      if (!targetUserId || !isMounted) return;
      
      try {
        console.log('Fetching posts for user:', targetUserId);
        const data = await fetchWithRetry(`${API_URL}/posts/user/${targetUserId}`, {
          signal,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!isMounted) return;
        console.log('Fetched posts:', data);
        setPosts(Array.isArray(data) ? data : []);
        return data;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        console.error('Error fetching posts:', error);
        if (isMounted) {
          setPosts([]);
        }
      }
    };

    const fetchUserComments = async () => {
      if (!targetUserId || !isMounted) return;
      
      try {
        const data = await fetchWithRetry(`${API_URL}/comments/user/${targetUserId}`, {
          signal,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!isMounted) return;
        setComments(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        console.error('Error fetching comments:', error);
        if (isMounted) {
          setComments([]);
        }
      }
    };

    const fetchAll = async () => {
      if (!targetUserId || !isMounted) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch user data first
        await fetchUserData();
        if (!isMounted) return;

        // Wait 2 seconds before fetching posts
        await delay(2000);
        const postsData = await fetchUserPosts();
        if (!isMounted) return;

        // Wait 2 seconds before fetching comments
        await delay(2000);
        await fetchUserComments();
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        // Handle rate limit errors
        if (error.message && error.message.includes('429')) {
          setError('Rate limit reached. Please wait a few minutes and try again.');
        } else {
          console.error('Error in fetch sequence:', error);
          setError('Failed to load profile data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only start fetching if we have a valid targetUserId
    if (targetUserId) {
      fetchAll();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
      abortController.abort();
      // Clear cache on unmount
      responseCache.clear();
    };
  }, [targetUserId, API_URL, token]);

  // Add cleanup for WebSocket connection
  useEffect(() => {
    return () => {
      // Cleanup WebSocket connection
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/users/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfileUser(data);
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      setError(error.message);
    }
  };

  // Function to handle avatar update
  const handleAvatarUpdate = async () => {
    if (!isOwnProfile || !token) return;

    try {
      // Generate avatar URL using the selected seed
      const avatarUrl = getAvatarUrl(selectedSeed);
      console.log('Updating avatar to:', avatarUrl);

      // Ensure we have a valid user ID
      if (!targetUserId) {
        throw new Error('User ID is missing');
      }

      const updateResponse = await fetch(`${API_URL}/users/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar: avatarUrl
        })
      });

      const data = await updateResponse.json();
      
      if (!updateResponse.ok) {
        throw new Error(data.message || 'Failed to update avatar');
      }

      // Update local profile state with the new avatar URL
      setProfileUser(prev => ({
        ...prev,
        avatar: avatarUrl
      }));
      
      // Update global auth context with the new avatar URL
      if (updateUser && currentUser) {
        const updatedUser = {
          ...currentUser,
          avatar: avatarUrl
        };
        updateUser(updatedUser);
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          avatar: avatarUrl
        }));
      }

      // Clear response cache
      responseCache.clear();

      // Close the modal
      setShowAvatarModal(false);

      // Show success message
      alert('Avatar updated successfully!');

      // Force a page refresh
      window.location.reload();
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(`Failed to update avatar: ${err.message}`);
      setShowAvatarModal(true);
    }
  };

  // When opening the avatar modal, use username as seed
  const handleOpenAvatarModal = () => {
    // Use username as seed for consistent avatar generation
    const seed = profileUser?.username || 'unknown';
    console.log('Opening modal with seed:', seed);
    setSelectedSeed(seed);
    setShowAvatarModal(true);
  };

  // Add error boundary
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => setError(null)}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">User not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={4}>
          <Card className="shadow-sm">
            <div className="profile-banner bg-primary"></div>
            <Card.Body className="text-center">
              <div className="position-relative d-inline-block">
                <ProfileAvatar user={profileUser} size={150} />
                {isOwnProfile && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="position-absolute bottom-0 end-0"
                    onClick={handleOpenAvatarModal}
                    style={{ borderRadius: '50%', padding: '8px' }}
                  >
                    <FontAwesomeIcon icon={faCamera} />
                  </Button>
                )}
              </div>
              <h3 className="mt-3">{profileUser.username}</h3>
              <p className="text-muted">{profileUser.email}</p>
              <div className="d-flex justify-content-center gap-3 mb-3">
                <Badge bg="light" text="dark" className="p-2 shadow-sm">
                  <FontAwesomeIcon icon={faEdit} className="me-1" />
                  {posts.length} Posts
                </Badge>
                <Badge bg="light" text="dark" className="p-2 shadow-sm">
                  <FontAwesomeIcon icon={faComments} className="me-1" />
                  {comments.length} Comments
                </Badge>
              </div>
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="text-start">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Custom Avatar URL (optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      placeholder="Enter a custom avatar URL"
                    />
                    <small className="text-muted">Leave empty to use generated avatar</small>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  {isOwnProfile && (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit Profile
                    </button>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="posts" title={
                  <span>
                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                    Posts ({posts.length})
                  </span>
                }>
                  {posts.length === 0 ? (
                    <div className="text-center py-4">
                      <FontAwesomeIcon icon={faEdit} size="3x" className="text-muted mb-3" />
                      <p className="text-muted">No posts yet</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {posts.map(post => (
                        <Card key={post._id} className="mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="w-100">
                                <h5 className="mb-1">
                                  <a href={`/posts/${post._id}`} className="text-decoration-none">
                                    {post.title}
                                  </a>
                                </h5>
                                <p className="text-muted mb-2">
                                  {post.content.length > 150 
                                    ? `${post.content.substring(0, 150)}...` 
                                    : post.content}
                                </p>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                  <div className="d-flex gap-4">
                                    <div className="d-flex align-items-center">
                                      <FontAwesomeIcon 
                                        icon={faHeart} 
                                        className="me-2 interaction-icon" 
                                        style={{ 
                                          color: post.likes?.includes(currentUser?._id) ? '#ff4b4b' : '#6c757d',
                                          cursor: 'pointer',
                                          fontSize: '1.1rem'
                                        }}
                                      />
                                      <span className="text-muted">{post.likes?.length || 0}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <FontAwesomeIcon 
                                        icon={faComments} 
                                        className="me-2 interaction-icon" 
                                        style={{ 
                                          color: '#6c757d',
                                          cursor: 'pointer',
                                          fontSize: '1.1rem'
                                        }}
                                      />
                                      <span className="text-muted">{post.comments?.length || 0}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center gap-2">
                                    {post.categoryId && (
                                      <Badge 
                                        bg="primary" 
                                        className="px-2 py-1" 
                                        style={{ 
                                          borderRadius: '12px',
                                          fontSize: '0.75rem',
                                          fontWeight: '500'
                                        }}
                                      >
                                        {post.categoryId.name}
                                      </Badge>
                                    )}
                                    {isOwnProfile && (
                                      <Button
                                        variant="link"
                                        className="text-danger p-0 ms-2"
                                        onClick={() => handleDeletePost(post._id)}
                                        style={{ fontSize: '1rem' }}
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Tab>
                <Tab eventKey="comments" title={
                  <span>
                    <FontAwesomeIcon icon={faComments} className="me-2" />
                    Comments
                  </span>
                }>
                  {comments.length === 0 ? (
                    <div className="text-center py-4">
                      <FontAwesomeIcon icon={faComments} size="3x" className="text-muted mb-3" />
                      <p className="text-muted">No comments yet</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {comments.map(comment => (
                        <div key={comment._id} className="border-bottom py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-1">{comment.content}</p>
                              <small className="text-muted">
                                On post: <a href={`/posts/${comment.postId}`} className="text-decoration-none">
                                  {comment.postTitle}
                                </a>
                              </small>
                            </div>
                            <small className="text-muted">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Avatar Selection Modal */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Choose Your Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6>Preview</h6>
            <div className="text-center">
              <img
                key={`preview-${selectedSeed}`}
                src={getAvatarUrl(selectedSeed)}
                alt="Selected avatar"
                className="rounded shadow-sm"
                crossOrigin="anonymous"
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  backgroundColor: 'white',
                  border: '2px solid var(--border-color)'
                }}
                onError={(e) => {
                  console.error('Error loading avatar preview:', e);
                  e.target.onerror = null;
                  const fallbackSvg = `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="150" fill="#E2E8F0"/>
                    <text x="50%" y="50%" font-size="50" text-anchor="middle" dy=".3em" fill="#718096">
                      ${selectedSeed.charAt(0).toUpperCase()}
                    </text>
                  </svg>`;
                  e.target.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
                }}
              />
              <div className="mt-2">
                <small className="text-muted">Current seed: {selectedSeed}</small>
              </div>
            </div>
          </div>
          <div>
            <h6>Generate New Avatar</h6>
            <p className="text-muted">Click the button below to generate a new random avatar.</p>
            <Button
              variant="outline-secondary"
              onClick={() => {
                // Generate a new seed by appending a random number to username
                const newSeed = `${profileUser?.username || 'unknown'}-${Math.floor(Math.random() * 1000)}`;
                console.log('Generated new seed:', newSeed);
                setSelectedSeed(newSeed);
              }}
            >
              Generate New Avatar
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              console.log('Saving avatar with seed:', selectedSeed);
              handleAvatarUpdate();
            }}
          >
            Save Avatar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Profile; 