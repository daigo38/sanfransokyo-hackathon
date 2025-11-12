class Toast {
  constructor(elementId = 'toast') {
    this.element = document.getElementById(elementId);
  }

  show(message, duration = 3000) {
    if (!this.element) return;
    
    this.element.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    this.element.classList.add('show');
    
    setTimeout(() => {
      this.element.classList.remove('show');
    }, duration);
  }

  hide() {
    if (!this.element) return;
    this.element.classList.remove('show');
  }
}

