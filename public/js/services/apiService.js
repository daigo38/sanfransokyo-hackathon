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
}

