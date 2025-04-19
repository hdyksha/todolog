/**
 * 日付文字列をフォーマットする
 * @param dateString ISO形式の日付文字列
 * @param options フォーマットオプション
 * @returns フォーマットされた日付文字列
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', options).format(date);
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return dateString;
  }
}

/**
 * 日付が過去かどうかを判定する
 * @param dateString ISO形式の日付文字列
 * @returns 過去の日付の場合はtrue
 */
export function isPastDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return false;
  }
}

/**
 * 日付が今日かどうかを判定する
 * @param dateString ISO形式の日付文字列
 * @returns 今日の日付の場合はtrue
 */
export function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return false;
  }
}

/**
 * 日付が明日かどうかを判定する
 * @param dateString ISO形式の日付文字列
 * @returns 明日の日付の場合はtrue
 */
export function isTomorrow(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return false;
  }
}

/**
 * 日付が今週かどうかを判定する
 * @param dateString ISO形式の日付文字列
 * @returns 今週の日付の場合はtrue
 */
export function isThisWeek(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return false;
  }
}

/**
 * 相対的な日付表現を取得する
 * @param dateString ISO形式の日付文字列
 * @returns 相対的な日付表現（今日、明日、3日前、など）
 */
export function getRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // 時間部分を無視して日付のみを比較
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = dateWithoutTime.getTime() - nowWithoutTime.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays === -1) return '昨日';
    if (diffDays > 0) return `${diffDays}日後`;
    return `${Math.abs(diffDays)}日前`;
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return dateString;
  }
}
