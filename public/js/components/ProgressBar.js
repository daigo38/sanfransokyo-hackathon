class ProgressBar {
  constructor(containerId, barId, textId) {
    this.container = document.getElementById(containerId);
    this.bar = document.getElementById(barId);
    this.text = document.getElementById(textId);
    this.interval = null;
    this.currentProgress = 0;
  }

  update(percent, message) {
    if (this.bar) {
      this.bar.style.width = percent + '%';
      this.bar.textContent = Math.floor(percent) + '%';
    }
    
    if (message && this.text) {
      this.text.textContent = message;
    }
    
    this.currentProgress = percent;
  }

  start() {
    if (!this.container) return;
    
    this.container.classList.add('show');
    this.currentProgress = 0;
    
    const steps = [
      { target: 20, text: '動画を解析しています...' },
      { target: 45, text: 'フレームを抽出しています...' },
      { target: 70, text: 'マニュアルを生成しています...' },
      { target: 90, text: '仕上げ中...' }
    ];
    
    let currentStep = 0;
    
    this.interval = setInterval(() => {
      if (currentStep >= steps.length) {
        return;
      }
      
      const step = steps[currentStep];
      const increment = (step.target - this.currentProgress) / 20;
      
      this.currentProgress += increment;
      
      if (this.currentProgress >= step.target - 0.5) {
        this.currentProgress = step.target;
        currentStep++;
        if (currentStep < steps.length) {
          this.update(this.currentProgress, steps[currentStep].text);
        } else {
          this.update(this.currentProgress, step.text);
        }
      } else {
        this.update(this.currentProgress);
      }
    }, 200);
  }

  stop(success = true) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    if (success) {
      this.update(100, '完了しました！');
      setTimeout(() => {
        this.hide();
      }, 1500);
    } else {
      this.hide();
    }
  }

  hide() {
    if (!this.container) return;
    this.container.classList.remove('show');
  }
}

