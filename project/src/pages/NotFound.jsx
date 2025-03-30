import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const NotFoundPage = () => {
  return (
    <div className="text-center py-5">
      <h1 className="display-1">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="mb-4">
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">Go to Home</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
