const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェアの設定
app.use(cors());
app.use(bodyParser.json());

// 設定ファイルのパス
const CONFIG_FILE = path.join(__dirname, 'config.json');
let config = {
  dataStoragePath: path.join(__dirname, 'data'),
  autoSaveInterval: 60000
};

// 設定ファイルの読み込み
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
      config = JSON.parse(configData);
      
      // 相対パスを絶対パスに変換
      if (!path.isAbsolute(config.dataStoragePath)) {
        config.dataStoragePath = path.join(__dirname, config.dataStoragePath);
      }
    } else {
      // 設定ファイルが存在しない場合は作成
      saveConfig();
    }
  } catch (error) {
    console.error('設定ファイルの読み込みに失敗しました:', error);
  }
}

// 設定ファイルの保存
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('設定ファイルの保存に失敗しました:', error);
  }
}

// データディレクトリの確認と作成
function ensureDataDirectory() {
  if (!fs.existsSync(config.dataStoragePath)) {
    try {
      fs.mkdirSync(config.dataStoragePath, { recursive: true });
      console.log(`データディレクトリを作成しました: ${config.dataStoragePath}`);
    } catch (error) {
      console.error('データディレクトリの作成に失敗しました:', error);
    }
  }
}

// タスクファイルのパスを取得
function getTasksFilePath(filename) {
  return path.join(config.dataStoragePath, filename);
}

// タスクの読み込み
function loadTasks(filename) {
  const tasksFilePath = getTasksFilePath(filename);
  try {
    if (fs.existsSync(tasksFilePath)) {
      const data = fs.readFileSync(tasksFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`タスクの読み込みに失敗しました (${filename}):`, error);
  }
  return [];
}

// タスクの保存
function saveTasks(filename, tasks) {
  const tasksFilePath = getTasksFilePath(filename);
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`タスクの保存に失敗しました (${filename}):`, error);
    return false;
  }
}

// 初期化
loadConfig();
ensureDataDirectory();

// API エンドポイント

// 設定の取得
app.get('/api/config', (req, res) => {
  res.json({
    dataStoragePath: config.dataStoragePath,
    autoSaveInterval: config.autoSaveInterval
  });
});

// 設定の更新
app.post('/api/config', (req, res) => {
  const { dataStoragePath, autoSaveInterval } = req.body;
  
  if (dataStoragePath) {
    config.dataStoragePath = path.isAbsolute(dataStoragePath) 
      ? dataStoragePath 
      : path.join(__dirname, dataStoragePath);
  }
  
  if (autoSaveInterval) {
    config.autoSaveInterval = autoSaveInterval;
  }
  
  saveConfig();
  ensureDataDirectory();
  
  res.json({ success: true, config });
});

// 利用可能なタスクファイル一覧の取得
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(config.dataStoragePath)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(config.dataStoragePath, file),
        lastModified: fs.statSync(path.join(config.dataStoragePath, file)).mtime
      }));
    
    res.json(files);
  } catch (error) {
    console.error('ファイル一覧の取得に失敗しました:', error);
    res.status(500).json({ error: 'ファイル一覧の取得に失敗しました' });
  }
});

// 新しいタスクファイルの作成
app.post('/api/files', (req, res) => {
  const { filename } = req.body;
  
  if (!filename) {
    return res.status(400).json({ error: 'ファイル名が指定されていません' });
  }
  
  // ファイル名の検証
  if (!filename.endsWith('.json')) {
    return res.status(400).json({ error: 'ファイル名は .json で終わる必要があります' });
  }
  
  const filePath = getTasksFilePath(filename);
  
  try {
    // ファイルが存在しない場合のみ作成
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      res.json({ 
        success: true, 
        message: `新しいタスクファイル ${filename} を作成しました`,
        file: {
          name: filename,
          path: filePath,
          lastModified: fs.statSync(filePath).mtime
        }
      });
    } else {
      res.status(400).json({ error: `ファイル ${filename} は既に存在します` });
    }
  } catch (error) {
    console.error(`ファイル ${filename} の作成に失敗しました:`, error);
    res.status(500).json({ error: `ファイル ${filename} の作成に失敗しました` });
  }
});

// タスクファイルの削除
app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = getTasksFilePath(filename);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: `ファイル ${filename} を削除しました` });
    } else {
      res.status(404).json({ error: `ファイル ${filename} が見つかりません` });
    }
  } catch (error) {
    console.error(`ファイル ${filename} の削除に失敗しました:`, error);
    res.status(500).json({ error: `ファイル ${filename} の削除に失敗しました` });
  }
});

// 特定のファイルからタスクを取得
app.get('/api/tasks/:filename', (req, res) => {
  const filename = req.params.filename;
  const tasks = loadTasks(filename);
  res.json(tasks);
});

// 特定のファイルにタスクを保存
app.post('/api/tasks/:filename', (req, res) => {
  const filename = req.params.filename;
  const tasks = req.body;
  
  if (!Array.isArray(tasks)) {
    return res.status(400).json({ error: 'タスクデータは配列である必要があります' });
  }
  
  const success = saveTasks(filename, tasks);
  
  if (success) {
    res.json({ success: true, message: `タスクを ${filename} に保存しました` });
  } else {
    res.status(500).json({ error: `タスクの保存に失敗しました (${filename})` });
  }
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`データディレクトリ: ${config.dataStoragePath}`);
});
