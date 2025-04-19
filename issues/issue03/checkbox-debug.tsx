import { useState, useEffect } from 'react';

/**
 * チェックボックスのデバッグ用コンポーネント
 * 
 * このコンポーネントは、チェックボックスの動作を検証するための単純化されたテストケースです。
 * 以下の3つの異なる実装方法を比較できます：
 * 1. 標準のHTML input[type="checkbox"]
 * 2. Reactの制御コンポーネントとしてのチェックボックス
 * 3. カスタムUIを使用したチェックボックス代替
 */
export function CheckboxDebug() {
  // 標準のチェックボックス用の状態
  const [checked1, setChecked1] = useState(false);
  
  // 制御コンポーネント用の状態
  const [checked2, setChecked2] = useState(false);
  
  // カスタムUI用の状態
  const [checked3, setChecked3] = useState(false);
  
  // 状態変更をコンソールに出力
  useEffect(() => {
    console.log('State updated:', { checked1, checked2, checked3 });
  }, [checked1, checked2, checked3]);
  
  // 標準チェックボックスのハンドラ
  const handleChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Standard checkbox clicked, new value:', e.target.checked);
    setChecked1(e.target.checked);
  };
  
  // 制御コンポーネントのハンドラ
  const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Controlled checkbox clicked, new value:', e.target.checked);
    setChecked2(e.target.checked);
  };
  
  // カスタムUIのハンドラ
  const handleToggle3 = () => {
    const newValue = !checked3;
    console.log('Custom UI clicked, new value:', newValue);
    setChecked3(newValue);
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-6">チェックボックスデバッグ</h1>
      
      <div className="space-y-8">
        {/* 実装1: 標準のHTML チェックボックス */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">1. 標準のHTMLチェックボックス</h2>
          <div className="flex items-center">
            <input
              id="checkbox1"
              type="checkbox"
              checked={checked1}
              onChange={handleChange1}
              className="h-5 w-5"
            />
            <label htmlFor="checkbox1" className="ml-2">
              {checked1 ? 'チェック済み' : 'チェックなし'}
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            状態: {JSON.stringify(checked1)}
          </div>
        </div>
        
        {/* 実装2: Reactの制御コンポーネント */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">2. Reactの制御コンポーネント</h2>
          <div className="flex items-center">
            <input
              id="checkbox2"
              type="checkbox"
              checked={checked2}
              onChange={handleChange2}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="checkbox2" className="ml-2">
              {checked2 ? 'チェック済み' : 'チェックなし'}
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            状態: {JSON.stringify(checked2)}
          </div>
        </div>
        
        {/* 実装3: カスタムUI */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">3. カスタムUIトグル</h2>
          <div className="flex items-center">
            <button
              onClick={handleToggle3}
              className={`w-6 h-6 flex items-center justify-center rounded border ${
                checked3 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              aria-checked={checked3}
              role="checkbox"
            >
              {checked3 && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <label className="ml-2">
              {checked3 ? 'チェック済み' : 'チェックなし'}
            </label>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            状態: {JSON.stringify(checked3)}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">デバッグ情報</h2>
        <p className="text-sm">
          コンソールを開いて、各チェックボックスの状態変更を確認してください。
        </p>
        <p className="text-sm mt-2">
          ブラウザ: {navigator.userAgent}
        </p>
      </div>
    </div>
  );
}
