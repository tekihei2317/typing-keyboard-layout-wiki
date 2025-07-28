import { writeFile } from 'fs/promises';

async function downloadChutoroTable() {
  try {
    const url = 'https://raw.githubusercontent.com/mobitan/chutoro/main/GoogleIME/romantable.chutoro.221015.txt';
    
    console.log('ブリ中トロ配列のローマ字テーブルをダウンロード中...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const content = await response.text();
    await writeFile('layouts/romantable-chutoro.txt', content, 'utf-8');
    
    console.log('ダウンロード完了: layouts/romantable-chutoro.txt');
    console.log(`ファイルサイズ: ${content.length} 文字`);
    
    // テーブルの行数を表示
    const lines = content.trim().split('\n').filter(line => line.trim() !== '');
    console.log(`テーブル行数: ${lines.length}`);
    
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

downloadChutoroTable();