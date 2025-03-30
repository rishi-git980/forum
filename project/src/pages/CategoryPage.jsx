import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Tab, Nav } from 'react-bootstrap';
import PostItem from '../components/PostItem';
import CategoryList from '../components/CategoryList';
import TrendingTopics from '../components/TrendingTopics';
import axios from 'axios';
import { API_URL, categories } from '../config';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = categories.find(cat => cat.id === categoryId);
  
  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        // In a real app, fetch from API
        // const res = await axios.get(`${API_URL}/api/posts/category/${categoryId}`);
        // setPosts(res.data);
        
        // Demo data
        if (categoryId === 'technology') {
          setPosts([
            {
              _id: '3',
              title: "What's your favorite programming language and why?",
              content: "I've been using TypeScript for a while now and I'm loving it. The type safety is a game changer for large projects. What about you?",
              author: {
                _id: 'user3',
                username: 'Sarah Johnson',
              },
              createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
              category: 'technology',
              upvotes: 130,
              downvotes: 6,
              commentCount: 32
            },
            {
              _id: '4',
              title: 'A lamp I printed for my wife',
              content: 'The only thing that went wrong is that I can see the infill on the body when the lamp is on... But not sure if it is worth it to make it 100% infill.',
              author: {
                _id: 'user3',
                username: 'Sarah Johnson',
              },
              createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
              category: 'technology',
              upvotes: 130,
              downvotes: 6,
              commentCount: 32,
              image: '/assets/lamp.jpg'
            },
            {
              _id: '5',
              title: 'Tip to improve Quest 3/3S Visuals',
              content: 'I tried this out on my game Solara One and the star fields and night scenes look significantly better. Works great in other games too.',
              author: {
                _id: 'user3',
                username: 'Sarah Johnson',
              },
              createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
              category: 'technology',
              upvotes: 130,
              downvotes: 6,
              commentCount: 32,
              image: '/assets/vr-scene.jpg'
            }
          ]);
        } else if (categoryId === 'politics') {
          setPosts([
            {
              _id: '6',
              title: 'The new yorker',
              content: 'Tim Walz says he may run for president in 2028 -- despite failure of harries campaign: "Do whatever it takes"',
              author: {
                _id: 'user4',
                username: 'Richard Miller',
              },
              createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
              category: 'politics',
              upvotes: 180,
              downvotes: 30,
              commentCount: 50,
              image: '/assets/politics1.jpg'
            },
            {
              _id: '7',
              title: 'American news',
              content: "Beware Trump's Talk of coming \"Emergencies\" Far-right rhetoric is suffused with dark talk of impending calamities. It's a favorite trope of autocrats who are,themselves,the calamity.",
              author: {
                _id: 'user5',
                username: 'haruhck5',
              },
              createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
              category: 'politics',
              upvotes: 120,
              downvotes: 30,
              commentCount: 99,
              image: '/assets/politics2.jpg'
            }
          ]);
        } else if (categoryId === 'science') {
          setPosts([
            {
              _id: '8',
              title: 'Planetary Science',
              content: 'A private mission to Venus aims to look for signs of life.',
              author: {
                _id: 'user6',
                username: 'Lisa Grossman',
              },
              createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
              category: 'science',
              upvotes: 150,
              downvotes: 26,
              commentCount: 52,
              image: '/assets/science1.jpg'
            },
            {
              _id: '9',
              title: '"Hardest Part is...": Sunita Williams on unexpectedly long space stay',
              content: 'Astronaut Sunita Williams talks about the challenges of her extended stay on the ISS.',
              author: {
                _id: 'user7',
                username: 'Loren Grush',
              },
              createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              category: 'science',
              upvotes: 45,
              downvotes: 16,
              commentCount: 72,
              image: '/assets/science2.jpg'
            }
          ]);
        } else {
          setPosts([
            {
              _id: '10',
              title: 'Sample post for this category',
              content: 'This is a sample post for the ' + categoryId + ' category.',
              author: {
                _id: 'user8',
                username: 'Random User',
              },
              createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
              category: categoryId || 'general',
              upvotes: 45,
              downvotes: 5,
              commentCount: 10
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching category posts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryPosts();
  }, [categoryId]);

  return (
    <Row>
      <Col lg={3}>
        <CategoryList />
        <TrendingTopics />
      </Col>
      <Col lg={9}>
        <div className="mb-4">
          <h1 className="mb-4">{category?.name || 'Category'}</h1>
          <Tab.Container id="category-tabs" defaultActiveKey="for-you">
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="for-you">For You</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="trending">Trending</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="most-upvoted">Most Upvoted</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="latest">Latest</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="for-you">
                {loading ? (
                  <p>Loading posts...</p>
                ) : posts.length > 0 ? (
                  posts.map(post => <PostItem key={post._id} {...post} />)
                ) : (
                  <p>No posts found in this category.</p>
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="trending">
                {loading ? (
                  <p>Loading trending posts...</p>
                ) : posts.length > 0 ? (
                  posts.map(post => <PostItem key={post._id} {...post} />)
                ) : (
                  <p>No trending posts in this category.</p>
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="most-upvoted">
                {loading ? (
                  <p>Loading most upvoted posts...</p>
                ) : posts.length > 0 ? (
                  [...posts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)).map(post => <PostItem key={post._id} {...post} />)
                ) : (
                  <p>No posts found in this category.</p>
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="latest">
                {loading ? (
                  <p>Loading latest posts...</p>
                ) : posts.length > 0 ? (
                  [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(post => <PostItem key={post._id} {...post} />)
                ) : (
                  <p>No posts found in this category.</p>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </Col>
    </Row>
  );
};

export default CategoryPage;
