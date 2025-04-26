  // APIエラーを処理する共通関数
  const handleApiError = (error: unknown, operation: string) => {
    console.error(`${operation}に失敗しました:`, error);
    setError(error instanceof Error ? error : new Error(`${operation}に失敗しました`));
    showNotification(`${operation}に失敗しました`, 'error');
  };
