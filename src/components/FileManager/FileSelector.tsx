import React from 'react';
import { TaskFile } from '../../services/ApiService';

interface FileSelectorProps {
  currentFile: string;
  taskFiles: TaskFile[];
  fileLoading: boolean;
  onFileSelect: (filename: string) => void;
  onDeleteFile: (filename: string) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  currentFile,
  taskFiles,
  fileLoading,
  onFileSelect,
  onDeleteFile
}) => {
  // 日付フォーマット（ファイル選択用）
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="file-selector">
      <select 
        value={currentFile} 
        onChange={(e) => onFileSelect(e.target.value)}
        disabled={fileLoading || taskFiles.length === 0}
      >
        {taskFiles.length === 0 ? (
          <option value="">ファイルがありません</option>
        ) : (
          taskFiles.map(file => (
            <option key={file.name} value={file.name}>
              {file.name} ({formatDateTime(file.lastModified)})
            </option>
          ))
        )}
      </select>
      
      {currentFile && (
        <button 
          onClick={() => onDeleteFile(currentFile)}
          disabled={fileLoading}
          className="delete-file-btn"
        >
          削除
        </button>
      )}
    </div>
  );
};

export default FileSelector;
