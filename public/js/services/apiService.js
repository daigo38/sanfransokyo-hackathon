class ApiService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async convertVideo(file, language = 'English') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    const response = await fetch(`${this.baseUrl}/api/generate-manual-from-video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Conversion failed.');
    }

    return await response.json();
  }

  async getSessions() {
    const response = await fetch(`${this.baseUrl}/api/sessions`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to retrieve session list.');
    }

    return await response.json();
  }

  async getSession(sessionId) {
    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to retrieve session.');
    }

    return await response.json();
  }
}

