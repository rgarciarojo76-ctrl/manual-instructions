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

            // Height is determined by the longest content + header height (15mm approx) + padding
            const lineHeight = 5; // mm per line
            const contentHeight = Math.max(leftLines.length, rightLines.length) * lineHeight;
            const rowHeight = contentHeight + 25; // +25 for header (12) + padding (13)

            // Check Page Break
            // Use strict atomic check: If perfectly fits, stay. If not, move.
            // Page Height 297mm. Footer is at 287mm (approx).
            // Let's leave a 15mm bottom margin safe zone.
            if (currentY + rowHeight > pageHeight - 15) {
                doc.addPage();
                currentY = 20; // Start new page with top margin
            }

            // 2. Draw Row Headers (Blue Box)
            const HeaderHeight = 12;

            // -- Left Header --
            doc.setFillColor(...headerColor);
            doc.rect(margin, currentY, colWidth, HeaderHeight, 'F'); // Fill
            doc.rect(margin, currentY, colWidth, HeaderHeight, 'S'); // Border

            doc.setTextColor(255, 255, 255); // White text
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            // Center text in header
            doc.text(leftSec.title, margin + (colWidth / 2), currentY + 7, { align: 'center', maxWidth: colWidth - 4 });

            // -- Right Header --
            if (rightSec) {
                doc.setFillColor(...headerColor);
                doc.rect(margin + colWidth, currentY, colWidth, HeaderHeight, 'F');
                doc.rect(margin + colWidth, currentY, colWidth, HeaderHeight, 'S');

                doc.setTextColor(255, 255, 255);
                doc.text(rightSec.title, margin + colWidth + (colWidth / 2), currentY + 7, { align: 'center', maxWidth: colWidth - 4 }); // consistent Y +7
            }

            // 3. Draw Row Content (White Box)
            const contentStartY = currentY + HeaderHeight;
            const contentBoxHeight = rowHeight - HeaderHeight;

            doc.setFillColor(255, 255, 255);
            doc.setTextColor(0, 0, 0); // Black text
            doc.setFont("helvetica", "normal");

            // -- Left Content --
            doc.rect(margin, contentStartY, colWidth, contentBoxHeight, 'S'); // Border
            let textY = contentStartY + 6; // Padding top 6
            leftLines.forEach(line => {
                doc.text(line, margin + 4, textY); // Padding left 4
                textY += lineHeight;
            });

            // -- Right Content --
            if (rightSec) {
                doc.rect(margin + colWidth, contentStartY, colWidth, contentBoxHeight, 'S');
                textY = contentStartY + 6;
                rightLines.forEach(line => {
                    doc.text(line, margin + colWidth + 4, textY);
                    textY += lineHeight;
                });
            }

            // Move Y for next row
            currentY += rowHeight;
        }

        drawFooter();
        doc.save('Informe_Seguridad_Maquinaria.pdf');

    } catch (error) {
        console.error("PDF Generation Failed:", error);
        alert("Error al generar el PDF. Revisa la consola.");
    }
};
