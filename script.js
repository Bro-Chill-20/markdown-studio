document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const wordCount = document.getElementById('word-count');

    // Configure marked options
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function (code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        console.error(e);
                    }
                }
                return code;
            }
        });
    }

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
> "Simplicity is prerequisite for reliability." - *Edsger W. Dijkstra*

---

### 💻 Code Example
\`\`\`javascript
function calculateSum(a, b) {
    return a + b;
}
console.log(calculateSum(5, 10));
\`\`\`
`;

    function updatePreview() {
        const content = editor.value;

        // Render Markdown to Preview
        if (typeof marked !== 'undefined') {
            preview.innerHTML = marked.parse(content);
        } else {
            preview.innerText = content;
        }

        // Apply syntax highlighting to code blocks
        if (typeof hljs !== 'undefined') {
            preview.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

        // Update Word and Character count
        const text = content.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = content.length;
        if (wordCount) {
            wordCount.textContent = `${words} words | ${chars} chars`;
        }

        // Save content locally
        localStorage.setItem('markdown_content', content);
    }

    // Load saved content or default text
    const savedContent = localStorage.getItem('markdown_content');
    editor.value = savedContent !== null ? savedContent : defaultMarkdown;

    // Initial render
    updatePreview();

    // Instant Event Listeners
    editor.addEventListener('input', updatePreview);
    editor.addEventListener('keyup', updatePreview);
});