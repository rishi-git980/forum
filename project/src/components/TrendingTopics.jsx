import { Link } from 'react-router-dom';
import { trendingTopics } from '../config';

const TrendingTopics = () => {
  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Trending Topics</h5>
      </div>
      <div className="card-body">
        <div className="trending-tags">
          {trendingTopics.map((topic) => (
            <Link 
              key={topic.id}
              to={`/tag/${topic.id}`}
              className="trending-tag"
            >
              {topic.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingTopics;
