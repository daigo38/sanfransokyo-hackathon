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
      this.errorHandler.show('Please select a video file.');
      return;
    }

    this.prepareForSubmission();

    try {
      const file = this.uploadSection.getFile();
      const language = this.uploadSection.getLanguage();
      this.progressBar.start();

      const data = await this.apiService.convertVideo(file, language);

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
    this.toast.show(`Saved to: export/${data.sessionId}/`);
  }

  handleError(err) {
    this.uploadSection.setLoading(false);
    const errorMessage = err.message || 'Failed to convert. Please try again with a shorter video.';
    this.errorHandler.show(errorMessage);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});

