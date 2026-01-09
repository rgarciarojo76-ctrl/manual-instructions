import * as pdfjsLib from 'pdfjs-dist';

// Point to the worker file in dependencies. 
// Vite should handle this import or we might need to copy the worker file to public.
// Attempting simpler import first.
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    let pageMap = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');

        // Store mapping associated with page number
        pageMap.push({ page: i, text: pageText });
        fullText += `--- PÁGINA ${i} ---\n${pageText}\n\n`;
    }

    return { fullText, pageMap };
};
