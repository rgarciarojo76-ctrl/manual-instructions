import React from 'react';
import Icon from './Icon';
import './AssessmentCard.css'; // New styles

const RiskCard = ({ title, content, icons = [], isCritical = false, onExportPdf }) => {

    const handleCopy = () => {
        const text = `${title}\n\n${content.map(c => `- ${c}`).join('\n')}`;
        navigator.clipboard.writeText(text);
        alert('Contenido copiado al portapapeles');
    };

    const handlePdf = () => {
        if (onExportPdf) {
            onExportPdf({ title, content, icons, isCritical });
        } else {
            alert('Función de PDF no conectada.');
        }
    };

    return (
        <div className="assessment-card">
            <header className="assess-header" style={{ borderColor: isCritical ? '#dc2626' : '#0099CC' }}>
                <h2 className="assess-title" style={{ color: isCritical ? '#991b1b' : '#005580' }}>
                    {title}
                </h2>
                <div className={`assess-badge ${isCritical ? 'critical' : ''}`}>
                    {isCritical ? (
                        <><span>🚨</span> Crítico x2</>
                    ) : (
                        <><span>📘</span> Info</>
                    )}
                </div>
            </header>

            <div className="assess-content-box" style={{ borderLeftColor: isCritical ? '#dc2626' : '#0099CC' }}>
                <h3 className="assess-subtitle">
                    {icons.length > 0 ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {icons.map((iconName, idx) => (
                                <Icon key={idx} name={iconName} size={20} color={isCritical ? '#dc2626' : '#0099CC'} />
                            ))}
                        </div>
                    ) : (
                        <span>ℹ️ Detalles extraídos:</span>
                    )}
                </h3>

                <div className="assess-grid">
                    {content && content.length > 0 ? (
                        content.map((item, idx) => (
                            <div key={idx} className="assess-item">
                                <span className="item-bullet" style={{ color: isCritical ? '#dc2626' : '#0099CC' }}>•</span>
                                <span className="item-text">{item}</span>
                            </div>
                        ))
                    ) : (
                        <div className="assess-item" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                            No se ha encontrado información específica en esta sección.
                        </div>
                    )}
                </div>

                <div className="assess-actions">
                    <button className="assess-btn" onClick={handleCopy}>Copiar</button>
                    <button className="assess-btn" onClick={handlePdf}>PDF Indiv.</button>
                </div>
            </div>
        </div>
    );
};

export default RiskCard;
