// Ruta al PDF (asegúrate que esté en la misma carpeta que tu HTML)
const url = 'menu.pdf';

// Obtiene el canvas y su contexto
const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');

let pdfDoc = null;
let pageNum = 1;

// Configura el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    page.render(renderContext);
  });
}

function queueRenderPage(num) {
  if (num < 1 || num > pdfDoc.numPages) return;
  pageNum = num;
  renderPage(pageNum);
}

// Botones de navegación por flechas
document.getElementById('prevBtn').addEventListener('click', () => {
  if (pageNum <= 1) return;
  queueRenderPage(pageNum - 1);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (pageNum >= pdfDoc.numPages) return;
  queueRenderPage(pageNum + 1);
});

// Carga el PDF
pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  renderPage(pageNum);
}).catch(err => {
  console.error(err);
  alert('Error cargando el PDF');
});

// Soporte para swipe en pantallas táctiles
let startX = 0;

canvas.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

canvas.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  const diffX = endX - startX;

  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      // Swipe derecha
      if (pageNum > 1) queueRenderPage(pageNum - 1);
    } else {
      // Swipe izquierda
      if (pageNum < pdfDoc.numPages) queueRenderPage(pageNum + 1);
    }
  }
});
