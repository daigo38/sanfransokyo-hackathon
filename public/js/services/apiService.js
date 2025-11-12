class ApiService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async convertVideo(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '変換に失敗しました。');
    }

    return await response.json();
  }

  async getSessions() {
    const response = await fetch(`${this.baseUrl}/api/sessions`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'セッション一覧の取得に失敗しました。');
    }

    return await response.json();
  }

  async getSession(sessionId) {
    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'セッションの取得に失敗しました。');
    }

    return await response.json();
  }
}

