class ErrorHandler {
  constructor(elementId = 'error') {
    this.element = document.getElementById(elementId);
  }

  show(message) {
    if (!this.element) return;
    
    this.element.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    this.element.classList.add('show');
  }

  hide() {
    if (!this.element) return;
    this.element.classList.remove('show');
  }
}

