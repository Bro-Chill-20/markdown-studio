document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const wordCount = document.getElementById('word-count');

    // Configure marked options for StackEdit style features (Tables, GFM, Breaks)
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
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

StackEdit er moto apnader ei app-e ekhon shob kichu support korbe!

---

## 📊 1. Tables Support
| Feature | Status | Description |
| :--- | :---: | ---: |
| **Live Preview** | ✅ Active | Instant rendering |
| **Math & LaTeX** | ✅ Active | Gamma, Integrals etc. |
| **Tables & Lists** | ✅ Active | GFM Tables supported |

---

## ✔️ 2. Task Lists
- [x] Create Markdown Studio repository
- [x] Configure Tailwind CSS & Highlight.js
- [ ] Add PDF Export feature

---

## 📐 3. Math & LaTeX Formulas
The *Gamma function* satisfying $\\Gamma(n) = (n-1)!\\quad\\forall n\\in\\mathbb N$ is via the Euler integral:
$$
\\Gamma(z) = \\int_0^\\infty t^{z-1}e^{-t}dt
$$

---

### 💻 4. Code Syntax Highlighting
\`\`\`javascript
function stackEditStyle() {
    console.log("Markdown Studio is fully loaded!");
}
stackEditStyle();
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

        // Render Math Equations with MathJax (StackEdit style)
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
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