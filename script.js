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

    const defaultMarkdown = `# Ultimate Test Studio

\`\`\`mermaid
graph TD
    A[Start] --> B[Clean Render]
\`\`\`

You can write text freely below the diagram.
`;

    async function updatePreview() {
        const content = editor.value;

        let parsedHTML = '';
        if (typeof marked !== 'undefined') {
            parsedHTML = marked.parse(content);
        } else {
            parsedHTML = content;
        }

        preview.innerHTML = parsedHTML;

        // 1. Highlight normal code blocks (skip mermaid)
        if (typeof hljs !== 'undefined') {
            preview.querySelectorAll('pre code').forEach((block) => {
                if (!block.classList.contains('language-mermaid')) {
                    hljs.highlightElement(block);
                }
            });
        }

        // 2. Safely convert mermaid code blocks to mermaid divs in DOM
        preview.querySelectorAll('pre code.language-mermaid, code.language-mermaid').forEach((block) => {
            const pre = block.closest('pre');
            const div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = block.textContent;
            if (pre) {
                pre.replaceWith(div);
            } else {
                block.replaceWith(div);
            }
        });

        // 3. Render Math Equations with MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
        }

        // 4. Render Mermaid Diagrams
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