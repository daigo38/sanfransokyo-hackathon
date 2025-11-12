class PreviewSection {
  constructor(sectionId, thumbnailsId, markdownPreviewId, downloadBtnId) {
    this.section = document.getElementById(sectionId);
    this.thumbnails = document.getElementById(thumbnailsId);
    this.markdownPreview = document.getElementById(markdownPreviewId);
    this.downloadBtn = document.getElementById(downloadBtnId);
    this.currentMarkdown = '';
    
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener('click', () => this.downloadPdf());
    }
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
    
    this.currentMarkdown = markdown;
    const html = DOMPurify.sanitize(marked.parse(markdown));
    this.markdownPreview.innerHTML = html;
  }

  render(data) {
    this.renderThumbnails(data.images, data.sessionId);
    this.renderMarkdown(data.markdown);
    this.show();
  }

  async downloadPdf() {
    if (!this.currentMarkdown || typeof html2pdf === 'undefined') {
      return;
    }

    if (this.downloadBtn) {
      this.downloadBtn.disabled = true;
      this.downloadBtn.textContent = 'PDFを生成中...';
    }

    try {
      const element = this.markdownPreview;
      
      // 改ページ制御のためのスタイルを適用
      const style = document.createElement('style');
      style.textContent = `
        .markdown-preview p,
        .markdown-preview li,
        .markdown-preview img,
        .markdown-preview pre,
        .markdown-preview code,
        .markdown-preview blockquote {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        .markdown-preview h1 + *,
        .markdown-preview h2 + *,
        .markdown-preview h3 + *,
        .markdown-preview h4 + *,
        .markdown-preview h5 + *,
        .markdown-preview h6 + * {
          page-break-before: avoid !important;
          break-before: avoid !important;
        }
        .markdown-preview ul,
        .markdown-preview ol {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .markdown-preview table {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .markdown-preview table tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      `;
      document.head.appendChild(style);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: 'manual.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy']
        }
      };

      await html2pdf().set(opt).from(element).save();
      
      // スタイルを削除
      document.head.removeChild(style);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。');
    } finally {
      if (this.downloadBtn) {
        this.downloadBtn.disabled = false;
        this.downloadBtn.textContent = 'PDFをダウンロード';
      }
    }
  }
}

