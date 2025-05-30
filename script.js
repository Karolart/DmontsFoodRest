const url = 'menu.pdf';
const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    const renderTask = page.render(renderContext);

    renderTask.promise.then(() => {
      pageRendering = false;

      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}

function queueRenderPage(num) {
  if (num < 1 || num > pdfDoc.numPages) return;
  if (pageRendering) {
    pageNumPending = num;
  } else {
    pageNum = num;
    renderPage(num);
  }
}

const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    if (pageNum > 1) queueRenderPage(pageNum - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (pageNum < pdfDoc.numPages) queueRenderPage(pageNum + 1);
  });
}

pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  renderPage(pageNum);
}).catch(err => {
  console.error('Error cargando el PDF:', err);
  alert('Error cargando el PDF');
});

let startX = 0;

canvas.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

canvas.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  const diffX = endX - startX;

  if (Math.abs(diffX) > 50) {
    if (diffX > 0 && pageNum > 1) {
      queueRenderPage(pageNum - 1);
    } else if (diffX < 0 && pageNum < pdfDoc.numPages) {
      queueRenderPage(pageNum + 1);
    }
  }
});
