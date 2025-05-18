import { Tag } from '../types';

/**
 * タグ名からハッシュ値を生成し、色を決定する関数
 * @param tag タグ名
 * @returns HSL形式の色コード
 */
export const getColorFromTag = (tag: string): string => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 色相を決定（0-360）
  const hue = hash % 360;
  
  // HSLカラーを返す（彩度と明度は固定）
  return `hsl(${hue}, 70%, 65%)`;
};

/**
 * コントラスト比を計算して、白または黒のテキスト色を決定する
 * @param backgroundColor 背景色
 * @returns テキスト色（白または黒）
 */
export const getTextColor = (backgroundColor: string): string => {
  // HSLから明度を抽出
  const match = backgroundColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
  if (match && match[1]) {
    const lightness = parseInt(match[1], 10);
    // 明度が50%以上なら黒、それ以下なら白
    return lightness >= 50 ? '#000' : '#fff';
  }
  
  // HEXカラーの場合
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.substring(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 明度の計算（YIQ式）
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  }
  
  return '#fff'; // デフォルトは白
};

/**
 * タグ情報を取得する関数
 * TagContextのタグ情報を優先し、存在しない場合はデフォルト色を生成
 * @param tagName タグ名
 * @param tagMap タグ情報のマップ
 * @returns タグの色情報
 */
export const getTagInfo = (
  tagName: string, 
  tagMap?: Record<string, Tag>
): { color: string; textColor: string } => {
  // タグマップが存在し、そのタグが登録されている場合はその色を使用
  if (tagMap && tagMap[tagName] && tagMap[tagName].color) {
    const color = tagMap[tagName].color;
    const textColor = getTextColor(color);
    return { color, textColor };
  }
  
  // タグが登録されていない場合はタグ名からハッシュ値を生成して色を決定
  const color = getColorFromTag(tagName);
  const textColor = getTextColor(color);
  return { color, textColor };
};

/**
 * タグ情報をマージする関数
 * 複数のソースからタグ情報を集め、優先順位に従ってマージする
 * @param sources タグ情報のソース（優先順位順）
 * @returns マージされたタグ情報
 */
export const mergeTagSources = (
  ...sources: Array<Record<string, Tag> | undefined>
): Record<string, Tag> => {
  const mergedTags: Record<string, Tag> = {};
  
  // 優先順位の高いソースから順にマージ
  sources.forEach(source => {
    if (!source) return;
    
    Object.entries(source).forEach(([tagName, tagInfo]) => {
      // まだマージされていないタグのみ追加（優先順位の高いタグを維持）
      if (!mergedTags[tagName]) {
        mergedTags[tagName] = { ...tagInfo };
      }
    });
  });
  
  return mergedTags;
};
