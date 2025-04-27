// ユーティリティ関数のエクスポート
export * from './errorHandling';

/**
 * 日付を指定された形式でフォーマットする
 * @param date - 日付オブジェクトまたは日付文字列
 * @param format - 日付フォーマット (デフォルト: 'YYYY-MM-DD')
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 文字列を省略する
 * @param text - 元の文字列
 * @param maxLength - 最大長
 * @param suffix - 省略記号 (デフォルト: '...')
 * @returns 省略された文字列
 */
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 配列をチャンクに分割する
 * @param array - 元の配列
 * @param size - チャンクサイズ
 * @returns チャンクの配列
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  if (!array.length) return [];
  
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  
  return result;
};

/**
 * オブジェクトから指定されたキーを除外した新しいオブジェクトを返す
 * @param obj - 元のオブジェクト
 * @param keys - 除外するキーの配列
 * @returns 新しいオブジェクト
 */
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result as Omit<T, K>;
};

/**
 * オブジェクトから指定されたキーのみを含む新しいオブジェクトを返す
 * @param obj - 元のオブジェクト
 * @param keys - 含めるキーの配列
 * @returns 新しいオブジェクト
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * 指定されたミリ秒だけ待機する Promise を返す
 * @param ms - 待機するミリ秒
 * @returns Promise
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 文字列が有効なJSONかどうかを検証する
 * @param str - 検証する文字列
 * @returns 有効なJSONならtrue、そうでなければfalse
 */
export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};
