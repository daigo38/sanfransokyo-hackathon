class UploadSection {
  constructor(fileInputId, submitBtnId, statusId, languageSelectId = 'languageSelect') {
    this.fileInput = document.getElementById(fileInputId);
    this.submitBtn = document.getElementById(submitBtnId);
    this.status = document.getElementById(statusId);
    this.languageSelect = document.getElementById(languageSelectId);
    this.fileNameDisplay = document.getElementById('fileName');
    
    this.initEventListeners();
  }

  initEventListeners() {
    if (this.fileInput) {
      this.fileInput.addEventListener('change', () => this.handleFileChange());
    }
  }

  handleFileChange() {
    const file = this.getFile();
    if (file && this.fileNameDisplay) {
      this.fileNameDisplay.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success-green); margin-right: 8px;"></i>${file.name}`;
    }
  }

  getFile() {
    return this.fileInput?.files[0] || null;
  }

  getLanguage() {
    return this.languageSelect?.value || '日本語';
  }

  hasFile() {
    return !!this.getFile();
  }

  setLoading(loading) {
    if (this.submitBtn) {
      this.submitBtn.disabled = loading;
      if (loading) {
        this.submitBtn.innerHTML = '<span>Processing...</span>';
      } else {
        this.submitBtn.innerHTML = '<span>Generate Manual</span><i class="fas fa-sparkles"></i>';
      }
    }
    
    if (this.status) {
      this.status.textContent = loading ? '' : 'Complete';
    }
  }

  setStatus(message) {
    if (this.status) {
      this.status.textContent = message;
    }
  }
}

