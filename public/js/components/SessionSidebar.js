class SessionSidebar {
  constructor(sidebarId, apiService, previewSection) {
    this.sidebar = document.getElementById(sidebarId);
    this.apiService = apiService;
    this.previewSection = previewSection;
    this.sessions = [];
    this.currentSessionId = null;
  }

  async loadSessions() {
    try {
      const data = await this.apiService.getSessions();
      this.sessions = data.sessions || [];
      this.render();
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }

  render() {
    if (!this.sidebar) return;

    const list = this.sidebar.querySelector('.session-list');
    if (!list) return;

    if (this.sessions.length === 0) {
      list.innerHTML = '<div class="session-empty"><i class="fas fa-inbox"></i>No history yet</div>';
      return;
    }

    list.innerHTML = this.sessions
      .map(
        (session) => `
      <div class="session-item ${session.sessionId === this.currentSessionId ? 'active' : ''}" 
           data-session-id="${session.sessionId}">
        <div class="session-id"><i class="fas fa-file-alt"></i>${session.sessionId}</div>
      </div>
    `
      )
      .join('');

    list.querySelectorAll('.session-item').forEach((item) => {
      item.addEventListener('click', () => {
        const sessionId = item.dataset.sessionId;
        this.selectSession(sessionId);
      });
    });
  }

  async selectSession(sessionId) {
    if (this.currentSessionId === sessionId) return;

    try {
      const data = await this.apiService.getSession(sessionId);
      this.currentSessionId = sessionId;
      this.previewSection.render(data);
      this.render();
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }

  refresh() {
    this.loadSessions();
  }
}

