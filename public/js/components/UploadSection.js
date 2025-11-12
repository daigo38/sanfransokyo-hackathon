class UploadSection {
  constructor(fileInputId, submitBtnId, statusId) {
    this.fileInput = document.getElementById(fileInputId);
    this.submitBtn = document.getElementById(submitBtnId);
    this.status = document.getElementById(statusId);
  }

  getFile() {
    return this.fileInput?.files[0] || null;
  }

  hasFile() {
    return !!this.getFile();
  }

  setLoading(loading) {
    if (this.submitBtn) {
      this.submitBtn.disabled = loading;
    }
    
    if (this.status) {
      this.status.textContent = loading ? '' : '完了';
    }
  }

  setStatus(message) {
    if (this.status) {
      this.status.textContent = message;
    }
  }
}

