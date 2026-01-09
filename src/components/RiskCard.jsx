import React from 'react';
import Icon from './Icon';

const RiskCard = ({ title, content, icons = [], isCritical = false }) => {

    const handleCopy = () => {
        const text = `${title}\n\n${content.map(c => `- ${c}`).join('\n')}`;
        navigator.clipboard.writeText(text);
        // Ideally show a toast here, but simple alert for prototype
        alert('Contenido copiado al portapapeles');
    };

    const handlePdf = () => {
        alert('Generación de PDF individual: Función simulada.');
    };

    return (
        <div className="glass-panel" style={{
            padding: 'var(--spacing-lg)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            borderTop: isCritical ? '4px solid var(--safety-red)' : '4px solid white', // Only top border indicator
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
        }}>

            {/* Critical Flag */}
            {isCritical && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'var(--safety-red)',
                    color: 'white',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    borderBottomLeftRadius: '8px',
                    zIndex: 10
                }}>
                    🚨 RIESGO CRÍTICO
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-md)', paddingRight: isCritical ? '80px' : '0' }}>
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem'
                }}>
                    {title}
                </h3>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {icons.map((iconName, idx) => (
                        <div key={idx} style={{ color: iconName.startsWith('ISO_W') ? 'var(--safety-yellow)' : 'var(--safety-blue)' }}>
                            <Icon name={iconName} size={20} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, marginBottom: 'var(--spacing-md)' }}>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {content && content.length > 0 ? (
                        content.map((item, idx) => (
                            <li key={idx} style={{
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '6px'
                            }}>
                                <span style={{ marginTop: '4px', opacity: 0.5 }}>•</span>
                                <span>{item}</span>
                            </li>
                        ))
                    ) : (
                        <li style={{
                            fontStyle: 'italic',
                            color: 'var(--text-secondary)',
                            opacity: 0.6,
                            fontSize: '0.875rem'
                        }}>
                            No se identifican indicaciones específicas del fabricante en este apartado en el documento analizado.
                        </li>
                    )}
                </ul>
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginTop: 'auto',
                borderTop: '1px solid var(--border-color)',
                paddingTop: 'var(--spacing-sm)'
            }}>
                <button
                    onClick={handleCopy}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    className="hover:bg-slate-700" // Tailwind-like via plain css needed? Let's stick to inline/styled for now or global utility
                    onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                    Copiar info
                </button>
                <button
                    onClick={handlePdf}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                    Generar PDF
                </button>
            </div>

        </div>
    );
};

export default RiskCard;
