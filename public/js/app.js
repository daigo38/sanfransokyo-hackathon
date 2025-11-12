class App {
  constructor() {
    this.uploadSection = new UploadSection('videoInput', 'submitBtn', 'status');
    this.progressBar = new ProgressBar('progressContainer', 'progressBar', 'progressText');
    this.previewSection = new PreviewSection('previewSection', 'thumbnails', 'markdownPreview', 'downloadPdfBtn');
    this.errorHandler = new ErrorHandler('error');
    this.toast = new Toast('toast');
    this.apiService = new ApiService();
    this.sessionSidebar = new SessionSidebar('sessionSidebar', this.apiService, this.previewSection);
    
    this.initializeEventListeners();
    this.sessionSidebar.loadSessions();
  }

  initializeEventListeners() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmit());
    }
  }

  async handleSubmit() {
    if (!this.uploadSection.hasFile()) {
      this.errorHandler.show('動画ファイルを選択してください。');
      return;
    }

    this.prepareForSubmission();

    try {
      const file = this.uploadSection.getFile();
      this.progressBar.start();

      const data = await this.apiService.convertVideo(file);

      this.progressBar.stop(true);
      this.handleSuccess(data);
    } catch (err) {
      this.progressBar.stop(false);
      this.handleError(err);
    }
  }

  prepareForSubmission() {
    this.uploadSection.setLoading(true);
    this.errorHandler.hide();
    this.previewSection.hide();
    this.previewSection.clear();
  }

  handleSuccess(data) {
    this.uploadSection.setLoading(false);
    this.previewSection.render(data);
    this.sessionSidebar.refresh();
    this.toast.show(`保存済み: export/${data.sessionId}/`);
  }

  handleError(err) {
    this.uploadSection.setLoading(false);
    const errorMessage = err.message || '変換に失敗しました。動画を短くして再実行してください。';
    this.errorHandler.show(errorMessage);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});

