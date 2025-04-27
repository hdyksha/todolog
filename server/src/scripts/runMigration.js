#!/usr/bin/env node

// マイグレーションスクリプトを直接実行するためのヘルパースクリプト
import { migrateCompletedAt } from './migrateCompletedAt.js';

// コマンドライン引数からファイルパスを取得
const targetFile = process.argv[2];

console.log('マイグレーションを開始します...');

migrateCompletedAt(targetFile)
  .then(() => {
    console.log('マイグレーションが正常に完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('マイグレーションに失敗しました', error);
    process.exit(1);
  });
