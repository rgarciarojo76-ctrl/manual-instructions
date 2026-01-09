import React from 'react';
import '../styles/global.css';
import logo from '../assets/aspy_logo.png';

const Header = () => {
    return (
        <header style={{
            marginBottom: 'var(--spacing-md)',
            borderBottom: '1px solid var(--border-color)',
            padding: '12px 24px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
        }}>
            {/* Left Section: Logo and Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={logo} alt="ASPY Logo" style={{ height: '40px', width: 'auto' }} />
                <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
                    <h1 translate="no" style={{
                        fontSize: '1.15rem',
                        fontWeight: '700',
                        color: 'var(--accent-primary)',
                        lineHeight: 1.1,
                        marginBottom: '2px'
                    }}>
                        ASPY AI LAB
                    </h1>
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '400'
                    }}>
                        App: Análisis de Manuales – Riesgos PRL
                    </p>
                </div>
            </div>

            {/* Center-Right Section: Status and Note */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                    backgroundColor: '#eff6ff',
                    color: 'var(--accent-primary)',
                    border: '1px solid #bfdbfe',
                    padding: '3px 12px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                }}>
                    Estado: Piloto interno
                </div>
                <div style={{
                    color: '#d97706', // safety-yellow / amber
                    fontSize: '0.65rem',
                    fontWeight: '500',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    AVISO: Apoyo técnico (no sustitutivo del criterio profesional). La información debe ser validada.
                </div>
            </div>

            {/* Right Section: Export PDF Button */}
            <button style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--accent-primary)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
            }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = 'var(--border-color)';
                }}
                onClick={() => alert('Generando informe PDF completo...')}
            >
                Exportar PDF
            </button>
        </header>
    );
};

export default Header;
