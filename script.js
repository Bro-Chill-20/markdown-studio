const markdownInput = document.getElementById('markdown-input');
const previewOutput = document.getElementById('preview-output');
const statsDisplay = document.getElementById('stats');

const copyHtmlBtn = document.getElementById('copy-html-btn');
const downloadBtn = document.getElementById('download-btn');
const clearBtn = document.getElementById('clear-btn');

// Configure Marked to support line breaks
marked.setOptions({
  breaks: true,
  gfm: true
});

// Default English Demo Content
const defaultMarkdown = `# Welcome to Markdown Studio 🚀

An interactive **Markdown Editor & Previewer** built with HTML, Tailwind CSS, and JavaScript.

---

## 🌟 Key Features
- **Real-Time Preview:** Instant rendering as you type.
- **LocalStorage Support:** Keeps your content saved even after refreshing.
- **Easy Export:** Download as a \`.md\` file or copy raw HTML instantly.
- **Responsive Dark Theme:** Sleek and clean UI powered by Tailwind CSS.

---

### 💡 Inspiration
> "Simplicity is prerequisite for reliability." – *Edsger W. Dijkstra*

---

### 💻 Code Example
\`\`\`javascript
function calculateSum(a, b) {
  return a + b;
}

console.log(calculateSum(5, 10));
\`\`\`

---

### 📋 Progress Tracker
- [x] HTML Structure & Tailwind CSS Setup
- [x] JavaScript Parsing & LocalStorage Logic
- [ ] Push Repository to GitHub
- [ ] Deploy Live on Vercel
`;

// Initialize App
function init() {
  const savedContent = localStorage.getItem('markdown_studio_data');
  markdownInput.value = savedContent !== null ? savedContent : defaultMarkdown;
  renderMarkdown();
}

// Convert Markdown to HTML, apply syntax highlighting & update stats
function renderMarkdown() {
  const text = markdownInput.value;
  
  // Render HTML via Marked.js
  previewOutput.innerHTML = marked.parse(text);

  // Apply Highlight.js syntax highlighting to all pre code blocks
  previewOutput.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });

  // Update Word & Character counts
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  statsDisplay.textContent = `${words} words | ${chars} chars`;

  // Save to LocalStorage
  localStorage.setItem('markdown_studio_data', text);
}

// Copy HTML output to clipboard
copyHtmlBtn.addEventListener('click', () => {
  const htmlContent = previewOutput.innerHTML;
  navigator.clipboard.writeText(htmlContent).then(() => {
    const originalText = copyHtmlBtn.innerHTML;
    copyHtmlBtn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> Copied!`;
    setTimeout(() => {
      copyHtmlBtn.innerHTML = originalText;
    }, 1500);
  });
});

// Download as .md file
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([markdownInput.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Clear Editor
clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear the editor?')) {
    markdownInput.value = '';
    renderMarkdown();
  }
});

// Event Listener for real-time typing
markdownInput.addEventListener('input', renderMarkdown);

// Start App
init();