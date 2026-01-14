import React from 'react';
import '../../styles/global.css';

const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            paddingTop: 'var(--spacing-md)',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: 'var(--spacing-sm)'
        }}>
            <p>
                La información anterior se ha extraído del manual del fabricante y debe integrarse con la evaluación de riesgos específica.
            </p>
        </footer>
    );
};

export default Footer;
