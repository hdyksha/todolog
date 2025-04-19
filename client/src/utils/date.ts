import { format, parseISO, isValid, isBefore, isAfter, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * ISO形式の日付文字列を指定されたフォーマットで表示用に整形する
 * @param dateString ISO形式の日付文字列
 * @param formatStr フォーマット文字列
 * @returns フォーマットされた日付文字列、無効な日付の場合は空文字列
 */
export const formatDate = (dateString?: string, formatStr = 'yyyy年MM月dd日'): string => {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    
    return format(date, formatStr, { locale: ja });
  } catch (error) {
    console.error('日付のフォーマットエラー:', error);
    return '';
  }
};

/**
 * 日付が今日より前かどうかを判定する
 * @param dateString ISO形式の日付文字列
 * @returns 今日より前の場合はtrue、それ以外はfalse
 */
export const isPastDate = (dateString?: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return isBefore(date, today);
  } catch (error) {
    return false;
  }
};

/**
 * 日付が今日かどうかを判定する
 * @param dateString ISO形式の日付文字列
 * @returns 今日の場合はtrue、それ以外はfalse
 */
export const isToday = (dateString?: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    
    const today = new Date();
    
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * 日付が明日かどうかを判定する
 * @param dateString ISO形式の日付文字列
 * @returns 明日の場合はtrue、それ以外はfalse
 */
export const isTomorrow = (dateString?: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    
    const tomorrow = addDays(new Date(), 1);
    
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * 日付の相対表示を返す（今日、明日、期限切れなど）
 * @param dateString ISO形式の日付文字列
 * @returns 相対的な日付表現
 */
export const getRelativeDateLabel = (dateString?: string): string => {
  if (!dateString) return '';
  
  if (isPastDate(dateString)) {
    return '期限切れ';
  }
  
  if (isToday(dateString)) {
    return '今日';
  }
  
  if (isTomorrow(dateString)) {
    return '明日';
  }
  
  return formatDate(dateString, 'MM/dd');
};
