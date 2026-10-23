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

    const defaultMarkdown = `# Mermaid Fix Test

\`\`\`mermaid
graph TD
    A[Start] --> B[Fixed]
\`\`\`
`;

    async function updatePreview() {
        const content = editor.value;

        let processedContent = content.replace(/```mermaid\s*([\s\S]*?)```/g, (match, p1) => {
            return `<div class="mermaid">${p1.trim()}</div>`;
        });

        let parsedHTML = '';
        if (typeof marked !== 'undefined') {
            parsedHTML = marked.parse(processedContent);
        } else {
            parsedHTML = content;
        }

        preview.innerHTML = parsedHTML;

        if (typeof hljs !== 'undefined') {
            preview.querySelectorAll('pre code').forEach((block) => {
                if (!block.closest('.mermaid')) {
                    hljs.highlightElement(block);
                }
            });
        }

        preview.querySelectorAll('pre code.language-mermaid, code.language-mermaid').forEach((block) => {
            const pre = block.parentElement;
            const div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = block.textContent;
            if (pre && pre.tagName === 'PRE') {
                pre.replaceWith(div);
            } else {
                block.replaceWith(div);
            }
        });

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
        }

        if (window.mermaid) {
            try {
                await mermaid.run({
                    nodes: preview.querySelectorAll('.mermaid')
                });
            } catch (err) {
                console.error(err);
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