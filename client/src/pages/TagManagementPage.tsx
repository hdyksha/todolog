import React from 'react';
import { TagProvider } from '../contexts/TagContext';
import TagManagement from '../components/tags/TagManagement';
import PageHeader from '../components/layouts/PageHeader';
import './TagManagementPage.css';

const TagManagementPage: React.FC = () => {
  return (
    <div className="tag-management-page">
      <PageHeader title="タグ管理" />
      <div className="tag-management-container">
        <TagProvider>
          <TagManagement />
        </TagProvider>
      </div>
    </div>
  );
};

export default TagManagementPage;
