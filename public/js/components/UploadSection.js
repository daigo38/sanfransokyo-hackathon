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
      this.fileNameDisplay.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success-green);"></i> ${file.name}`;
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
        this.submitBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i><span>処理中...</span>';
      } else {
        this.submitBtn.innerHTML = '<i class="fas fa-cog icon-spin"></i><span>マニュアル生成開始</span><i class="fas fa-arrow-right"></i>';
      }
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

