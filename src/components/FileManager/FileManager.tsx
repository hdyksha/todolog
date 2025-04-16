import React from 'react';
import { TaskFile } from '../../services/ApiService';
import FileSelector from './FileSelector';
import NewFileForm from './NewFileForm';

interface FileManagerProps {
  currentFile: string;
  taskFiles: TaskFile[];
  newFileName: string;
  fileLoading: boolean;
  onFileSelect: (filename: string) => void;
  onDeleteFile: (filename: string) => void;
  onNewFileNameChange: (name: string) => void;
  onCreateFile: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  currentFile,
  taskFiles,
  newFileName,
  fileLoading,
  onFileSelect,
  onDeleteFile,
  onNewFileNameChange,
  onCreateFile
}) => {
  return (
    <div className="file-manager">
      <h2>タスクファイル</h2>
      
      <FileSelector
        currentFile={currentFile}
        taskFiles={taskFiles}
        fileLoading={fileLoading}
        onFileSelect={onFileSelect}
        onDeleteFile={onDeleteFile}
      />
      
      <NewFileForm
        newFileName={newFileName}
        fileLoading={fileLoading}
        onNewFileNameChange={onNewFileNameChange}
        onCreateFile={onCreateFile}
      />
    </div>
  );
};

export default FileManager;
