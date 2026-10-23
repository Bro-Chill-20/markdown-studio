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

        // 1. Pre-parse Safe Extraction: Replace mermaid blocks with unique placeholders before marked parsing
        const mermaidBlocks = [];
        content = content.replace(/```mermaid\s*\n([\s\S]*?)\n\s*```/g, (match, p1) => {
            const index = mermaidBlocks.length;
            mermaidBlocks.push(p1.trim());
            return `<div class="mermaid" data-mermaid-index="${index}"></div>`;
        });

        // 2. Parse Markdown via marked
        let parsedHTML = '';
        if (typeof marked !== 'undefined') {
            parsedHTML = marked.parse(content);
        } else {
            parsedHTML = content;
        }

        preview.innerHTML = parsedHTML;

        // 3. Restore Mermaid contents safely into their respective placeholder divs
        mermaidBlocks.forEach((code, index) => {
            const div = preview.querySelector(`[data-mermaid-index="${index}"]`);
            if (div) {
                div.textContent = code;
            }
        });

        // 4. Apply syntax highlighting to normal code blocks (skipping mermaid)
        if (typeof hljs !== 'undefined') {
            preview.querySelectorAll('pre code').forEach((block) => {
                if (!block.closest('.mermaid')) {
                    hljs.highlightElement(block);
                }
            });
        }

        // 5. Render Math Equations with MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
        }

        // 6. Render Mermaid Diagrams
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