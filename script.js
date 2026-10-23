document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const wordCount = document.getElementById('word-count');

    if (typeof marked !== 'undefined') {
        const renderer = new marked.Renderer();
        renderer.code = function (code, infostring, escaped) {
            const lang = (infostring || '').match(/\S*/)[0];
            if (lang === 'mermaid') {
                return `<div class="mermaid">${code}</div>`;
            }
            if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                try {
                    const highlighted = hljs.highlight(code, { language: lang }).value;
                    return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
                } catch (e) {
                    console.error(e);
                }
            }
            return `<pre><code>${code}</code></pre>`;
        };

        marked.setOptions({
            renderer: renderer,
            breaks: true,
            gfm: true,
            headerIds: true
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