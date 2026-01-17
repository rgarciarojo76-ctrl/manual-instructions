import React from 'react';
import '../../styles/global.css';
import logo from '../../assets/logo-direccion-tecnica.jpg';

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
                <div className="header-status-badge">
                    Estado: Piloto interno
                </div>
                <div className="header-warning">
                    AVISO: Apoyo técnico (no sustitutivo del criterio profesional). La información debe ser validada.
                </div>
            </div>

            {/* Right Section: Export PDF Button */}
            {data && (
                <button
                    className="header-btn-export"
                    onClick={() => generatePDF(data)}
                >
                    ⬇️ Exportar PDF
                </button>
            )}
        </header>
    );
};

export default Header;
