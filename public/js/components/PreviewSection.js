class PreviewSection {
  constructor(sectionId, thumbnailsId, markdownPreviewId) {
    this.section = document.getElementById(sectionId);
    this.thumbnails = document.getElementById(thumbnailsId);
    this.markdownPreview = document.getElementById(markdownPreviewId);
  }

  show() {
    if (this.section) {
      this.section.classList.add('show');
    }
  }

  hide() {
    if (this.section) {
      this.section.classList.remove('show');
    }
  }

  clear() {
    if (this.thumbnails) {
      this.thumbnails.innerHTML = '';
    }
    if (this.markdownPreview) {
      this.markdownPreview.innerHTML = '';
    }
  }

  renderThumbnails(images, sessionId) {
    if (!this.thumbnails) return;
    
    this.thumbnails.innerHTML = '';
    
    images.forEach((imagePath, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'thumbnail';
      
      const img = document.createElement('img');
      img.src = `/export/${sessionId}/${imagePath}`;
      img.alt = `Frame ${index + 1}`;
      
      thumbnail.appendChild(img);
      this.thumbnails.appendChild(thumbnail);
    });
  }

  renderMarkdown(markdown) {
    if (!this.markdownPreview || typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
      return;
    }
    
    const html = DOMPurify.sanitize(marked.parse(markdown));
    this.markdownPreview.innerHTML = html;
  }

  render(data) {
    this.renderThumbnails(data.images, data.sessionId);
    this.renderMarkdown(data.markdown);
    this.show();
  }
}

