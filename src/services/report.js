import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoUrl from '../assets/logo-direccion-tecnica.jpg'; // Vite returns the URL

export const generatePDF = async (data) => {
    if (!data) return;

    try {
        console.log("Starting PDF generation...");
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;

        // --- Helper Functions ---
        // Utility to load image safely
        const loadLogoSafe = async (url) => {
            console.log("Loading logo:", url);
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = () => {
                        console.warn("Logo reader error");
                        resolve(null);
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.warn("Could not load logo for PDF:", e);
                return null;
            }
        };

        // Pre-load logo to Base64
        const logoBase64 = await loadLogoSafe(logoUrl);

        // --- PDF Structure ---

        // Header
        if (logoBase64) {
            doc.addImage(logoBase64, 'JPEG', margin, 10, 50, 0); // Width 50, Height auto
        }

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("DIRECCIÓN TÉCNICA IA LAB", pageWidth - margin, 18, { align: 'right' });
        doc.text("Informe de Análisis de Seguridad (RD 1215/1997)", pageWidth - margin, 23, { align: 'right' });

        doc.line(margin, 30, pageWidth - margin, 30);

        // Title
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("ANÁLISIS DE MANUAL DE INSTRUCCIONES", margin, 45);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, 52);

        // Content Sections (8 Points)
        let finalY = 60;

        const sections = [
            { title: "1. IDENTIFICACIÓN DEL EQUIPO", data: data.card1 },
            { title: "2. USO PREVISTO Y LIMITACIONES", data: data.card2 },
            { title: "3. RIESGOS RECONOCIDOS", data: data.card3 },
            { title: "4. MEDIDAS DE PROTECCIÓN Y SEGURIDAD", data: data.card4 },
            { title: "5. EQUIPOS DE PROTECCIÓN INDIVIDUAL (EPIs)", data: data.card5 },
            { title: "6. MANTENIMIENTO, LIMPIEZA Y AJUSTE", data: data.card6 },
            { title: "7. FORMACIÓN Y CUALIFICACIÓN", data: data.card7 },
            { title: "8. ACTUACIONES EN EMERGENCIAS", data: data.card8 },
        ];

        sections.forEach((section, index) => {
            console.log(`Processing section ${index + 1}: ${section.title}`);

            // Check if we need a new page
            if (finalY > 250) {
                doc.addPage();
                finalY = 30;
            }

            // Section Title
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setFillColor(240, 240, 240); // Light gray background
            doc.rect(margin, finalY, pageWidth - (margin * 2), 8, 'F');
            doc.text(section.title, margin + 2, finalY + 5.5);
            finalY += 12;

            // Content List
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            const contentList = section.data?.content || [];

            if (contentList.length > 0) {
                contentList.forEach(item => {
                    // Safe string conversion
                    const textStr = String(item || "");

                    // Split text to fit width
                    const splitText = doc.splitTextToSize(`• ${textStr}`, pageWidth - (margin * 2) - 5);

                    // Check page break for content
                    if (finalY + (splitText.length * 5) > 270) {
                        doc.addPage();
                        finalY = 30;
                    }

                    doc.text(splitText, margin + 5, finalY);
                    finalY += (splitText.length * 5) + 2;
                });
            } else {
                doc.text("• No especificado por el fabricante", margin + 5, finalY);
                finalY += 7;
            }

            finalY += 5; // Spacing between sections
        });

        // Footer Disclaimer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Este documento es una asistencia técnica basada en IA. No sustituye la validación de un Técnico Superior PRL.", pageWidth / 2, 290, { align: 'center' });
        }

        console.log("Saving PDF...");
        doc.save('Informe_Seguridad_Maquinaria.pdf');

    } catch (error) {
        console.error("PDF Generation Failed:", error);
        alert("Error al generar el PDF. Por favor, revisa la consola para más detalles.");
    }
};
