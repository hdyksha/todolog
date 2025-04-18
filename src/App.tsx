import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>TodoLog</h1>
        <p>タスク管理アプリケーション</p>
      </header>
      <main>
        <p>
          開発中のアプリケーションです。
        </p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            カウント: {count}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
