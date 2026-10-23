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
        let content = editor.value;

        // 1. Wrap mermaid blocks in a strictly isolated container div to prevent text swallowing
        content = content.replace(/```[ \t]*mermaid\s*([\s\S]*?)```/g, (match, p1) => {
            return `<div class="mermaid-wrapper" style="margin: 20px 0;"><pre class="mermaid" style="background: transparent !important; padding: 0;">${p1.trim()}</pre></div>`;
        });

        // 2. Parse Markdown via marked
        let parsedHTML = '';
        if (typeof marked !== 'undefined') {
            parsedHTML = marked.parse(content);
        } else {
            parsedHTML = content;
        }

        preview.innerHTML = parsedHTML;

        // 3. Apply syntax highlighting to normal code blocks (skipping mermaid)
        if (typeof hljs !== 'undefined') {
            preview.querySelectorAll('pre code').forEach((block) => {
                if (!block.closest('.mermaid') && !block.closest('.mermaid-wrapper')) {
                    hljs.highlightElement(block);
                }
            });
        }

        // 4. Render Math Equations with MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
        }

        // 5. Render Mermaid Diagrams securely inside their isolated wrappers
        if (window.mermaid) {
            try {
                await mermaid.run({
                    nodes: preview.querySelectorAll('.mermaid')
                });
            } catch (err) {
                console.error(err);
            }
        }

        const text = editor.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = editor.value.length;
        if (wordCount) {
            wordCount.textContent = `${words} words | ${chars} chars`;
        }

        localStorage.setItem('markdown_content', editor.value);
    }

    const savedContent = localStorage.getItem('markdown_content');
    editor.value = savedContent !== null ? savedContent : defaultMarkdown;

    updatePreview();

    editor.addEventListener('input', updatePreview);
    editor.addEventListener('keyup', updatePreview);
});