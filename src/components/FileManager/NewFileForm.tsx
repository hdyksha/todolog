import React from 'react';

interface NewFileFormProps {
  newFileName: string;
  fileLoading: boolean;
  onNewFileNameChange: (name: string) => void;
  onCreateFile: () => void;
}

const NewFileForm: React.FC<NewFileFormProps> = ({
  newFileName,
  fileLoading,
  onNewFileNameChange,
  onCreateFile,
}) => {
  return (
    <div className="new-file-form">
      <input
        type="text"
        value={newFileName}
        onChange={e => onNewFileNameChange(e.target.value)}
        placeholder="新しいファイル名..."
        disabled={fileLoading}
      />
      <button onClick={onCreateFile} disabled={fileLoading || !newFileName.trim()}>
        作成
      </button>
    </div>
  );
};

export default NewFileForm;
