// Show each PDF inline where the browser can scroll through it (desktop with a mouse or trackpad).
// Phones and tablets keep the first-page preview, because their browsers show only one page or nothing.
(() => {
    const desktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!desktop || navigator.pdfViewerEnabled === false) return;
    document.querySelectorAll('.pdf-frame').forEach(box => {
        const frame = document.createElement('iframe');
        frame.src = box.dataset.pdf + '#view=FitH';
        frame.title = box.dataset.title + ' (PDF)';
        frame.loading = 'lazy';
        box.classList.add('embedded');
        box.replaceChildren(frame);
    });
})();
