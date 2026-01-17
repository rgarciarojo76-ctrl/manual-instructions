import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoUrl from '../assets/logo-direccion-tecnica.jpg'; // Vite returns the URL

export const generatePDF = async (data) => {
    if (!data) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // --- Helper Functions ---
    const addHeader = (yParams) => {
        // Add Logo
        // We need to fetch the image data if it's a URL
        // For simplicity in this environment, we assume we can add it if we load it.
        // However, async loading inside sync PDF gen is tricky.
        // We'll use a Promise wrapper for the image loading if needed, but jsPDF addImage works with base64.
        // Let's try adding it directly as an image object or assume it's preloaded.
        // Better strategy for web apps: Load image to DataURL first.
    };

    // Pre-load logo to Base64
    const logoBase64 = await toDataURL(logoUrl);

    // --- PDF Structure ---

    // Header
    doc.addImage(logoBase64, 'JPEG', margin, 10, 50, 0); // Width 50, Height auto

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

    sections.forEach((section) => {
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

        if (section.data && section.data.content && section.data.content.length > 0) {
            section.data.content.forEach(item => {
                // Split text to fit width
                const splitText = doc.splitTextToSize(`• ${item}`, pageWidth - (margin * 2) - 5);

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

    doc.save('Informe_Seguridad_Maquinaria.pdf');
};

// Utility to load image
const toDataURL = (url) => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    }));
