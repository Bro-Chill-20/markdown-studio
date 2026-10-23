document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const wordCount = document.getElementById('word-count');

    // Basic marked configuration
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true
        });
    }

    const defaultMarkdown = `# Markdown Studio

\`\`\`javascript
// This stays safely inside the code box
const greeting = "Hello Markdown Studio!";
console.log(greeting);
\`\`\`

This is normal text completely outside the code box!

## Math Test
Inline math: $E = mc^2$
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

        // Safely highlight code blocks after rendering
        if (typeof hljs !== 'undefined') {
            preview.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

        // Safely render Math Equations with MathJax 3
        if (window.MathJax) {
            if (window.MathJax.startup && window.MathJax.startup.promise) {
                window.MathJax.startup.promise.then(() => {
                    window.MathJax.texReset();
                    window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
                });
            } else if (window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([preview]).catch((err) => console.log(err));
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