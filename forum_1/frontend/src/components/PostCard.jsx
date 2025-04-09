import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThumbsUp, 
  faThumbsDown, 
  faHeart,
  faComment,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl, getAvatarStyles } from '../utils/avatar';

const PostCard = ({ post, handleVote, handleLike, onDelete }) => {
  const { user } = useAuth();
  
  if (!post || !post._id) {
    console.error('Invalid post data:', post);
    return null;
  }

  // Check if the current user can delete the post
  const canDelete = user && (
    // User is the post author
    (post.userId && user._id === post.userId._id) ||
    // User is an admin
    user.isAdmin === true
  );

  const handlePostVote = (voteType) => {
    if (!post._id) {
      console.error('Cannot vote: No post ID');
      return;
    }
    // Convert vote type to match backend expectation
    const backendVoteType = voteType === 'upvote' ? 'up' : 'down';
    handleVote(post._id, backendVoteType);
  };

  const handlePostLike = () => {
    if (!post._id) {
      console.error('Cannot like: No post ID');
      return;
    }
    handleLike(post._id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post._id);
    }
  };

  // Format date safely with date-fns
  const formatCreatedAt = (dateString) => {
    try {
      if (!dateString) return 'No date';
      const date = new Date(dateString);
      if (!(date instanceof Date) || isNaN(date)) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Get category name safely
  const getCategoryName = () => {
    if (!post.categoryId) return 'Uncategorized';
    return typeof post.categoryId === 'object' && post.categoryId.name ? post.categoryId.name : 'Uncategorized';
  };

  // Get category ID safely
  const getCategoryId = () => {
    if (!post.categoryId) return null;
    return typeof post.categoryId === 'object' ? post.categoryId._id : post.categoryId;
  };

  // Get username safely
  const getUsername = () => {
    if (!post.userId) return 'Unknown User';
    return typeof post.userId === 'object' ? post.userId.username : 'Unknown User';
  };

  // Get user ID safely
  const getUserId = () => {
    if (!post.userId) return null;
    return typeof post.userId === 'object' ? post.userId._id : post.userId;
  };

  // Get avatar URL safely
  const getPostAvatarUrl = () => {
    if (!post.userId) return getAvatarUrl('unknown');
    return getAvatarUrl(post.userId);
  };

  return (
    <Card className="post-card mb-4 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <Link to={`/profile/${getUserId()}`} className="text-decoration-none">
              <img
                src={getPostAvatarUrl()}
                alt={getUsername()}
                className="rounded-circle me-2"
                style={getAvatarStyles()}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getAvatarUrl(getUsername());
                }}
              />
            </Link>
            <div>
              <Link to={`/profile/${getUserId()}`} className="text-decoration-none">
                <span className="fw-bold text-primary">{getUsername()}</span>
              </Link>
              <div className="text-muted small">
                {formatCreatedAt(post.createdAt)}
              </div>
            </div>
          </div>
          {canDelete && (
            <Button 
              variant="link" 
              className="text-danger p-0" 
              onClick={handleDelete}
              title="Delete post"
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
        <Link to={`/post/${post._id}`} className="text-decoration-none">
          <Card.Title className="mb-2">{post.title}</Card.Title>
        </Link>
        <Card.Text>{post.content}</Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faThumbsUp} 
                className="interaction-icon me-1"
                onClick={() => handlePostVote('upvote')}
                style={{ 
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: post.upvotes?.includes(user?._id) ? '#1a73e8' : '#6c757d'
                }}
              />
              <span className="text-muted ms-1">{post.upvotes?.length || 0}</span>
            </div>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faThumbsDown} 
                className="interaction-icon me-1"
                onClick={() => handlePostVote('downvote')}
                style={{ 
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: post.downvotes?.includes(user?._id) ? '#9c27b0' : '#b19cd9'
                }}
              />
              <span className="text-muted ms-1">{post.downvotes?.length || 0}</span>
            </div>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faHeart} 
                className="interaction-icon me-1"
                onClick={handlePostLike}
                style={{ 
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: post.likes?.includes(user?._id) ? '#ff4b4b' : '#6c757d'
                }}
              />
              <span className="text-muted ms-1">{post.likes?.length || 0}</span>
            </div>
            <Link to={`/post/${post._id}`} className="text-decoration-none d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faComment} 
                className="interaction-icon me-1"
                style={{ 
                  fontSize: '1.2rem',
                  color: '#6c757d'
                }}
              />
              <span className="text-muted ms-1">{post.commentCount || 0}</span>
            </Link>
          </div>
          <Link 
            to={`/?category=${getCategoryId()}`} 
            className="text-decoration-none"
          >
            <Badge 
              bg="primary" 
              className="category-badge"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              {getCategoryName()}
            </Badge>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PostCard;