import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoUrl from '../assets/logo-direccion-tecnica.jpg'; // Vite returns the URL

export const generatePDF = async (data) => {
    if (!data) return;

    try {
        console.log("Starting PDF generation (New Design)...");
        const doc = new jsPDF();

        // --- Config & Styles ---
        const pageWidth = doc.internal.pageSize.width; // 210mm
        const pageHeight = doc.internal.pageSize.height; // 297mm
        const margin = 15;
        const availableWidth = pageWidth - (margin * 2);
        const colWidth = availableWidth / 2; // Split into 2 columns
        const headerColor = [0, 180, 216]; // Cyan Blue (#00b4d8 approx)
        const borderColor = [0, 0, 0]; // Black

        // --- Helper Functions ---
        const loadLogoSafe = async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.warn("Could not load logo for PDF:", e);
                return null;
            }
        };

        const drawFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text("Información Prevención de Riesgos Laborales - Apoyo Técnico IA", pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        };

        // Pre-load logo
        const logoBase64 = await loadLogoSafe(logoUrl);

        // --- Header Rendering ---
        if (logoBase64) {
            doc.addImage(logoBase64, 'JPEG', margin, 10, 45, 0);
        }

        // Top Right Title
        doc.setFontSize(10);
        doc.setTextColor(0, 180, 216); // Cyan Blue
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN PREVENCIÓN DE RIESGOS LABORALES", pageWidth - margin, 18, { align: 'right' });

        // Equipment Name (Dynamic Extraction)
        let equipmentName = "EQUIPO DE TRABAJO";

        if (data.card1 && data.card1.content && data.card1.content.length > 0) {
            // Helper to clean up text (remove page refs, prefixes)
            const cleanName = (text) => {
                return text
                    .replace(/\(Ref\..*?\)/gi, '') // Remove (Ref. Pág. X)
                    .replace(/\(Pág\..*?\)/gi, '')
                    .replace(/^(Nombre|Modelo|Equipo|Máquina|Denominación|Tipo):\s*/i, '') // Remove common prefixes
                    .replace(/^\W+/, '') // Remove leading non-word chars (bullets)
                    .trim();
            };

            // 1. Try to find a line that explicitly looks like a name
            const explicitName = data.card1.content.find(line =>
                line.toLowerCase().includes("nombre") ||
                line.toLowerCase().includes("modelo") ||
                line.toLowerCase().includes("máquina")
            );

            // 2. Fallback to the very first line (usually the name in this prompt structure)
            const rawName = explicitName || data.card1.content[0];

            // 3. Clean and Validate
            const cleaned = cleanName(rawName);
            if (cleaned.length > 2 && cleaned.length < 60) {
                equipmentName = cleaned.toUpperCase();
            }
        }

        doc.setTextColor(100); // Grey for subtitle
        doc.text(equipmentName, pageWidth - margin, 23, { align: 'right' });

        // Decorative line under logo
        doc.setDrawColor(200);
        doc.line(margin, 28, margin + 45, 28); // Short line under logo

        // Decorative bracket/line for title
        doc.setDrawColor(150);
        doc.line(pageWidth - margin - 5, 25, pageWidth - margin, 25);


        // --- Grid Content (8 Points -> 4 Rows) ---
        let currentY = 40; // Start Y for table

        // Define the 8 sections
        const allSections = [
            { title: "IDENTIFICACIÓN DEL EQUIPO", data: data.card1 },
            { title: "USO PREVISTO Y LIMITACIONES DE USO\nESTABLECIDAS POR EL FABRICANTE", data: data.card2 },
            { title: "RIESGOS RECONOCIDOS", data: data.card3 },
            { title: "MEDIDAS DE PROTECCIÓN Y SEGURIDAD", data: data.card4 },
            { title: "EQUIPOS DE PROTECCIÓN INDIVIDUAL (EPIs)", data: data.card5 },
            { title: "MANTENIMIENTO, LIMPIEZA Y AJUSTE", data: data.card6 },
            { title: "FORMACIÓN Y CUALIFICACIÓN", data: data.card7 },
            { title: "ACTUACIONES EN EMERGENCIAS", data: data.card8 },
        ];

        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.1);

        // Process in pairs (Row by Row)
        for (let i = 0; i < allSections.length; i += 2) {
            const leftSec = allSections[i];
            const rightSec = allSections[i + 1];

            // 1. Calculate Heights
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");

            // Helper to get text lines
            const getLines = (sec) => {
                if (!sec || !sec.data || !sec.data.content) return ["No especificado"];
                if (sec.data.content.length === 0) return ["No especificado"];

                let lines = [];
                sec.data.content.forEach(item => {
                    const itemText = "• " + String(item);
                    // Wrap text within column padding (padding 2mm on each side)
                    const wrapped = doc.splitTextToSize(itemText, colWidth - 4);
                    lines.push(...wrapped);
                });
                return lines;
            };

            const leftLines = getLines(leftSec);
            const rightLines = rightSec ? getLines(rightSec) : [];

            // 1. Calculate Dimensions
            const lineHeight = 5; // mm per line
            const headerHeight = 12;
            const topPadding = 6;
            const bottomPadding = 2; // slight buffer
            const baseRowOverhead = headerHeight + topPadding + bottomPadding;

            const maxLines = Math.max(leftLines.length, rightLines.length);
            const totalRowHeight = (maxLines * lineHeight) + baseRowOverhead;

            // 2. Logic: Fit or Split
            const pageEffectiveHeight = pageHeight - 15; // Bottom margin safe zone
            const spaceLeft = pageEffectiveHeight - currentY;

            // Definition of "Worth Splitting":
            // We need enough space for Header + at least 3 lines of text to look good.
            const minSplitHeight = headerHeight + topPadding + (3 * lineHeight);

            if (totalRowHeight <= spaceLeft) {
                // CASE A: FITS PERFECTLY
                drawRowSegment(doc, currentY, leftLines, rightLines, leftSec, rightSec, headerColor, colWidth, margin, headerHeight, lineHeight);
                currentY += totalRowHeight;
            } else {
                // IT DOES NOT FIT.
                // Check if we should split or just jump.
                if (spaceLeft > minSplitHeight) {
                    // CASE B: SPLIT (Fill gap, then jump)
                    console.log(`Splitting section ${leftSec.title} across pages.`);

                    // Calculate how many lines fit in the remaining space
                    // spaceLeft = header + topPadding + (lines * 5)
                    // lines = (spaceLeft - header - topPadding) / 5
                    const linesFit = Math.floor((spaceLeft - headerHeight - topPadding) / lineHeight);

                    // Slice content
                    const leftChunk1 = leftLines.slice(0, linesFit);
                    const leftChunk2 = leftLines.slice(linesFit);
                    const rightChunk1 = rightLines.slice(0, linesFit);
                    const rightChunk2 = rightLines.slice(linesFit);

                    // Draw Part 1
                    drawRowSegment(doc, currentY, leftChunk1, rightChunk1, leftSec, rightSec, headerColor, colWidth, margin, headerHeight, lineHeight);

                    // New Page
                    doc.addPage();
                    currentY = 20;

                    // Draw Part 2 (With REPEATED HEADERS)
                    // Note: We might need to handle if Part 2 is ALSO too big? 
                    // For simplicity, assuming Part 2 fits (it's rare to have >50 lines). 
                    // But to be safe, we just draw it. if it flows over, jsPDF might clip or we'd need recursion. 
                    // Given the constraint, we'll assume it fits or just flows to next page naturally (but we want headers).

                    drawRowSegment(doc, currentY, leftChunk2, rightChunk2, leftSec, rightSec, headerColor, colWidth, margin, headerHeight, lineHeight);

                    // Update Y
                    const part2Height = (Math.max(leftChunk2.length, rightChunk2.length) * lineHeight) + baseRowOverhead;
                    currentY += part2Height;

                } else {
                    // CASE C: NOT ENOUGH SPACE TO SPLIT (Just Jump)
                    doc.addPage();
                    currentY = 20;
                    drawRowSegment(doc, currentY, leftLines, rightLines, leftSec, rightSec, headerColor, colWidth, margin, headerHeight, lineHeight);
                    currentY += totalRowHeight;
                }
            }
        }

        drawFooter();
        doc.save('Informe_Seguridad_Maquinaria.pdf');

    } catch (error) {
        console.error("PDF Generation Failed:", error);
        alert("Error al generar el PDF. Revisa la consola.");
    }
};

// Helper function to draw a row (or segment of a row)
const drawRowSegment = (doc, startY, lLines, rLines, lSec, rSec, color, colW, margin, headH, lineH) => {
    // Height of this specific segment content
    const segLines = Math.max(lLines.length, rLines.length);
    const boxH = (segLines * lineH) + 8; // content box height (padding included)

    // -- Headers --
    doc.setFillColor(...color);

    // Left Header
    doc.rect(margin, startY, colW, headH, 'F');
    doc.rect(margin, startY, colW, headH, 'S');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(lSec.title, margin + (colW / 2), startY + 7, { align: 'center', maxWidth: colW - 4 });

    // Right Header
    if (rSec) {
        doc.rect(margin + colW, startY, colW, headH, 'F');
        doc.rect(margin + colW, startY, colW, headH, 'S');
        doc.text(rSec.title, margin + colW + (colW / 2), startY + 7, { align: 'center', maxWidth: colW - 4 });
    }

    // -- Content --
    const contentY = startY + headH;
    doc.setFillColor(255, 255, 255);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    // Left Box
    doc.rect(margin, contentY, colW, boxH, 'S');
    let textY = contentY + 6;
    lLines.forEach(line => {
        doc.text(line, margin + 4, textY);
        textY += lineH;
    });

    // Right Box
    if (rSec) {
        doc.rect(margin + colW, contentY, colW, boxH, 'S');
        textY = contentY + 6;
        rLines.forEach(line => {
            doc.text(line, margin + colW + 4, textY);
            textY += lineH;
        });
    }
};
