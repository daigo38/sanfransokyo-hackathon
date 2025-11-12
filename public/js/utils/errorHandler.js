class ErrorHandler {
  constructor(elementId = 'error') {
    this.element = document.getElementById(elementId);
  }

  show(message) {
    if (!this.element) return;
    
    this.element.textContent = message;
    this.element.classList.add('show');
  }

  hide() {
    if (!this.element) return;
    this.element.classList.remove('show');
  }
}

