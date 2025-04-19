import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <h2>ページが見つかりません</h2>
      <p>お探しのページは存在しないか、移動した可能性があります。</p>
      <Link to="/">
        <Button variant="primary">ホームに戻る</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
