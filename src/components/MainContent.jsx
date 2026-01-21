import { useState } from 'react';
import RiskCard from './RiskCard';
import { extractTextFromPDF } from '../services/pdf';
import { analyzeWithGemini } from '../services/gemini';
import { generateSinglePDF } from '../services/report'; // Import new service

// Mock Data for Demo Mode
const MOCK_DATA = {
    card1: {
        title: "Identificación y Límites",
        content: [
            "Equipo: Sierra Circular de Mesa, Modelo SC-2000 Pro. (Portada)",
            "Uso previsto: Corte longitudinal y transversal de madera maciza y tableros derivados. (Pág. 2)",
            "Uso prohibido: Corte de metales ferrosos, materiales plásticos o alimentos. (Pág. 3)",
            "Limitación: No utilizar en ambientes explosivos (ATEX) ni bajo lluvia. (Pág. 3)"
        ],
        icons: [],
        isCritical: false
    },
    card2: {
        title: "Funcionamiento y Peligros",
        content: [
            "Funcionamiento: Motor eléctrico de 220V acciona disco dentado de 250mm. (Pág. 4)",
            "Zona Peligrosa: Área de corte del disco (accesible si se retira resguardo). (Pág. 4-5)",
            "Peligro Mecánico: Corte y amputación por contacto con el disco. (Pág. 8)",
            "Peligro Eléctrico: Tensión de red 230V en cuadro de mandos. (Pág. 9)",
            "Ruido: Nivel de presión sonora > 85 dB(A). (Pág. 11)"
        ],
        icons: ['ISO_W019', 'ISO_W012'],
        isCritical: true
    },
    card3: {
        title: "Riesgos (Uso y Mantenimiento)",
        content: [
            "Uso Normal: Proyección de fragmentos o partículas (astillas). (Pág. 12)",
            "Uso Normal: Inhalación de polvo de madera. (Pág. 12)",
            "Mantenimiento: Riesgo de corte al cambiar el disco si no está bloqueada. (Pág. 18)",
            "Atasco: Riesgo de atrapamiento al retirar piezas manualmente con el disco en inercia. (Pág. 15)"
        ],
        icons: ['ISO_W019', 'ISO_W016'],
        isCritical: true
    },
    card4: {
        title: "Medidas Técnicas de Seguridad",
        content: [
            "Resguardo regulable sobre el disco (ajuste automático). (Pág. 6)",
            "Cuchilla divisora para evitar el retroceso de la pieza (Kickback). (Pág. 6)",
            "Pulsador de parada de emergencia tipo seta con rearme manual. (Pág. 7)",
            "Interruptor de seguridad con bobina de mínima tensión (anti-rearranque). (Pág. 7)"
        ],
        icons: ['ISO_M001'],
        isCritical: false
    },
    card5: {
        title: "Medidas Organizativas y EPIs",
        content: [
            "Uso obligatorio de gafas de seguridad y protección auditiva. (Pág. 13)",
            "Prohibido el uso de guantes durante el corte (riesgo de atrapamiento). (Pág. 13)",
            "Utilizar empujadores para piezas pequeñas (<30 cm). (Pág. 14)",
            "Procedimiento LOTO obligatorio para cambios de disco. (Pág. 19)"
        ],
        icons: ['ISO_M001', 'ISO_M002'],
        isCritical: false
    },
    card6: {
        title: "Formación y Emergencias",
        content: [], // Empty to demonstrate strict extraction
        icons: [],
        isCritical: false
    }
};

export default function MainContent({ data, analyzing, error, onFileUpload, onReset }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = (e) => {
        onFileUpload(e.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    };

    // Helper to extract title
    const getDocumentTitle = () => {
        if (!data || !data.card1 || !data.card1.content || data.card1.content.length === 0) return "Documento Analizado";
        // Extract basic name from first line usually
        let text = data.card1.content[0].replace(/\(Ref\..*?\)/g, '').replace('Denominación:', '').trim();
        return text.length > 60 ? text.substring(0, 60) + '...' : text;
    };

    return (
        <main style={{ flex: 1 }}>
            {error && (
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto 2rem',
                    padding: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {!data && (
                <div className="glass-panel intro-container">
                    {/* ... (Existing Intro Content) ... */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 className="header-title">
                            Análisis Manual de Instrucciones de Equipos de Trabajo
                        </h1>
                        <h3 style={{
                            color: 'var(--text-primary)',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            marginBottom: '1.5rem'
                        }}>
                            Asistente virtual para la extracción y análisis de información preventiva en manuales de maquinaria
                        </h3>
                        <p style={{
                            color: 'var(--text-secondary)',
                            maxWidth: '80%',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Este sistema utiliza Inteligencia Artificial para procesar el manual del fabricante, identificando automáticamente factores de riesgo, medidas de seguridad, EPIs obligatorios y procedimientos de emergencia según la normativa vigente.
                        </p>
                    </div>

                    {analyzing ? (
                        <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                            Analizando documento con Gemini... <br />
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Extrayendo texto y procesando riesgos...</span>
                        </div>
                    ) : (
                        <div
                            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>📄</div>
                            <h3 style={{
                                color: 'var(--accent-primary)',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                            }}>
                                Análisis Automático de Manuales (IA)
                            </h3>
                            <p style={{
                                color: '#64748b',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem'
                            }}>
                                Arrastra tu PDF aquí o usa el botón para buscarlo.
                            </p>

                            <label className="upload-btn">
                                Subir Manual de Instrucciones (PDF)
                                <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                        </div>
                    )}
                </div>
            )}

            {data && (
                <>
                    {/* NEW: Results Header Bar */}
                    <div className="results-header-bar">
                        <h2 className="results-title">
                            Análisis: <span style={{ fontWeight: 400 }}>{getDocumentTitle()}</span>
                        </h2>
                        <button className="btn-reset" onClick={onReset}>
                            Analizar otro archivo
                        </button>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Slightly smaller min-width for 4 column fit
                        gap: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        {/* Inline style override for desktop to force 4 columns if space allows */}
                        <style>{`
                        @media (min-width: 1200px) {
                            div[style*="display: grid"] {
                                grid-template-columns: repeat(4, 1fr) !important;
                            }
                        }
                    `}</style>
                        <RiskCard {...data.card1} onExportPdf={(card) => generateSinglePDF(card, data.card1.title)} />
                        <RiskCard {...data.card2} onExportPdf={(card) => generateSinglePDF(card, data.card2.title)} />
                        <RiskCard {...data.card3} onExportPdf={(card) => generateSinglePDF(card, data.card3.title)} />
                        <RiskCard {...data.card4} onExportPdf={(card) => generateSinglePDF(card, data.card4.title)} />
                        <RiskCard {...data.card5} onExportPdf={(card) => generateSinglePDF(card, data.card5.title)} />
                        <RiskCard {...data.card6} onExportPdf={(card) => generateSinglePDF(card, data.card6.title)} />
                        <RiskCard {...data.card7} onExportPdf={(card) => generateSinglePDF(card, data.card7.title)} />
                        <RiskCard {...data.card8} onExportPdf={(card) => generateSinglePDF(card, data.card8.title)} />
                    </div>
                </>
            )}
        </main>
    );
}
