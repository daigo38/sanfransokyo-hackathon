class UploadSection {
  constructor(fileInputId, submitBtnId, statusId, languageSelectId = 'languageSelect') {
    this.fileInput = document.getElementById(fileInputId);
    this.submitBtn = document.getElementById(submitBtnId);
    this.status = document.getElementById(statusId);
    this.languageSelect = document.getElementById(languageSelectId);
  }

  getFile() {
    return this.fileInput?.files[0] || null;
  }

  getLanguage() {
    return this.languageSelect?.value || 'English';
  }

  hasFile() {
    return !!this.getFile();
  }

  setLoading(loading) {
    if (this.submitBtn) {
      this.submitBtn.disabled = loading;
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

