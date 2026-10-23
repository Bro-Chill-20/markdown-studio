document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const wordCount = document.getElementById('word-count');

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

    const defaultMarkdown = `# Welcome to StackEdit style Markdown Studio 🚀

Paste your StackEdit markdown text here to test!

---

## 📊 Tables Support
| Feature | Status | Description |
| :--- | :---: | ---: |
| **Live Preview** | ✅ Active | Instant rendering |
| **Math & LaTeX** | ✅ Active | Formulas supported |
| **UML Diagrams** | ✅ Active | Mermaid charts |

---

## ✔️ Task Lists
- [x] Setup GitHub Pages
- [x] Add MathJax & Highlight.js
- [x] Add Mermaid Diagram support

---

## 📐 Math & LaTeX Formulas
The *Gamma function* satisfying $\\Gamma(n) = (n-1)!\\quad\\forall n\\in\\mathbb N$ is via the Euler integral:
$$
\\Gamma(z) = \\int_0^\\infty t^{z-1}e^{-t}dt
$$

---

## 📈 UML Diagrams (Mermaid)
\`\`\`mermaid
sequenceDiagram
    Alice ->> Bob: Hello Bob, how are you?
    Bob-->>John: How about you John?
    Bob--x Alice: I am good thanks!
\`\`\`

\`\`\`mermaid
graph LR
    A[Square Rect] -- Link text --> B((Circle))
    A --> C(Round Rect)
    B --> D{Rhombus}
\`\`\`
`;

    async function updatePreview() {
        const content = editor.value;

        let processedContent = content.replace(/```mermaid([\s\S]*?)```/g, (match, p1) => {
            return `<div class="mermaid">${p1.trim()}</div>`;
        });

        if (typeof marked !== 'undefined') {
            preview.innerHTML = marked.parse(processedContent);
        } else {
            preview.innerText = content;
        }

        if (typeof hljs !== 'undefined') {
            preview.querySelectorAll('pre code').forEach((block) => {
                if (!block.closest('.mermaid')) {
                    hljs.highlightElement(block);
                }
            });
        }

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
        }

        if (window.mermaid) {
            try {
                await mermaid.run({
                    nodes: preview.querySelectorAll('.mermaid')
                });
            } catch (err) {
                console.error("Mermaid rendering error:", err);
            }
        }

        const text = content.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = content.length;
        if (wordCount) {
            wordCount.textContent = `${words} words | ${chars} chars`;
        }

        localStorage.setItem('markdown_content', content);
    }

    const savedContent = localStorage.getItem('markdown_content');
    editor.value = savedContent !== null ? savedContent : defaultMarkdown;

    updatePreview();

    editor.addEventListener('input', updatePreview);
    editor.addEventListener('keyup', updatePreview);
});