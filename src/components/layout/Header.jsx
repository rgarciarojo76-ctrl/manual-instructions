import React from 'react';
import '../../styles/global.css';
import logo from '../../assets/logo-direccion-tecnica.jpg';
import { AlertTriangle, Settings } from 'lucide-react'; // Added icons

import { generatePDF } from '../../services/report';

const Header = ({ data }) => {
    return (
        <header className="header-main">
            {/* Left Section: Logo and Title */}
            <div className="header-left">
                <img src={logo} alt="Dirección Técnica Logo" className="header-logo" />
                <div className="header-branding">
                    <h1 translate="no" className="header-title-text">
                        DIRECCIÓN TÉCNICA IA LAB
                    </h1>
                    <p className="header-subtitle">
                        App: Análisis de Manuales – Riesgos PRL
                    </p>
                </div>
            </div>

            {/* Center-Right Section: Status and Note */}
            <div className="header-center">
                <div className="header-status-badge" style={{marginBottom: '0.5rem'}}>
                    Estado: Piloto interno
                </div>
                
                {/* Premium Pill Implementation */}
                <div className="status-disclaimer">
                    <AlertTriangle size={18} className="disclaimer-icon" />
                    <div className="disclaimer-content">
                        <span className="disclaimer-title">AVISO:</span>
                        <span className="disclaimer-body">
                            Apoyo técnico (no sustitutivo del criterio profesional). La información debe ser validada.
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Section: Export PDF Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 {/* Settings Icon (Visual only) */}
                <Settings className="settings-icon" size={20} color="#64748b" style={{cursor: 'pointer'}} />

                {data && (
                    <button
                        className="header-btn-export"
                        onClick={() => generatePDF(data)}
                    >
                        ⬇️ Exportar PDF
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
