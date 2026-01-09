import React from 'react';

const icons = {
    // Warnings (Triangles)
    'ISO_W019': ( // Moving parts
        <path d="M12 2L1 21h22L12 2zm0 3.8L19.5 19h-15L12 5.8zM10 9v5h4V9h-4zm0 6v2h4v-2h-4z" />
        // Simplified Warning Triangle with generic content for now, ideally specific paths
    ),
    'ISO_W012': ( // Electricity
        <g>
            <path d="M12 2L1 21h22L12 2zm0 3.8L19.5 19h-15L12 5.8z" />
            <path d="M11 7l-2 6h3v5l4-7h-3V7z" />
        </g>
    ),
    'ISO_W021': ( // Fire
        <g>
            <path d="M12 2L1 21h22L12 2zm0 3.8L19.5 19h-15L12 5.8z" />
            <path d="M12 18c.5 0 1-.2 1.4-.5.4-.3.6-.8.6-1.3 0-.6-.2-1-.6-1.4-.4-.4-.9-.6-1.4-.6-.5 0-1 .2-1.4.6-.4.4-.6.8-.6 1.4 0 .5.2 1 .6 1.3.4.3.9.5 1.4.5zm0-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            {/* Placeholder for fire */}
        </g>
    ),
    'ISO_W016': ( // Toxic
        <g>
            <path d="M12 2L1 21h22L12 2zm0 3.8L19.5 19h-15L12 5.8z" />
            <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-3 2l3 3 3-3-1-1-2 1-2-1-1 1z" />
            {/* Placeholder skull */}
        </g>
    ),
    'ISO_W008': ( // Fall
        <g>
            <path d="M12 2L1 21h22L12 2zm0 3.8L19.5 19h-15L12 5.8z" />
            {/* Fall icon */}
        </g>
    ),
    'ISO_W000': ( // General Warning
        <g>
            <path d="M12 2L1 21h22L12 2zm0 3.8L19.5 19h-15L12 5.8z" />
            <path d="M11 8h2v6h-2V8zm0 8h2v2h-2v-2z" />
        </g>
    ),

    // Mandatory (Circles)
    'ISO_M001': ( // Eye protection
        <g>
            <circle cx="12" cy="12" r="10" fill="var(--safety-blue)" />
            <path d="M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" fill="none" stroke="white" strokeWidth="2" />
            {/* Goggles placeholder */}
            <path d="M7 12c0-2 2-3 5-3s5 1 5 3v2H7v-2z" fill="white" />
        </g>
    ),
    'ISO_M002': ( // Ear protection
        <g>
            <circle cx="12" cy="12" r="10" fill="var(--safety-blue)" />
            {/* Ear muffs placeholder */}
            <path d="M7 10v4m10-4v4" stroke="white" strokeWidth="3" />
            <path d="M8 10a4 4 0 0 1 8 0" fill="none" stroke="white" strokeWidth="2" />
        </g>
    ),
    'ISO_M003': ( // Helmet
        <g>
            <circle cx="12" cy="12" r="10" fill="var(--safety-blue)" />
            <path d="M7 14c0-3 2-5 5-5s5 2 5 5h-10z" fill="white" />
        </g>
    ),
    'ISO_M007': ( // Gloves
        <g>
            <circle cx="12" cy="12" r="10" fill="var(--safety-blue)" />
            <path d="M9 8v6c0 1 1 2 2 2 0 0 0 0 0 0 1 0 2-1 2-2V8" stroke="white" strokeWidth="2" fill="none" />
        </g>
    ),
    'ISO_M013': ( // Mask
        <g>
            <circle cx="12" cy="12" r="10" fill="var(--safety-blue)" />
            <path d="M8 10h8v4a4 4 0 0 1-8 0v-4z" fill="white" />
        </g>
    )
};

const Icon = ({ name, size = 24, className = '' }) => {
    const content = icons[name] || icons['ISO_W000']; // Fallback to general warning

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {content}
        </svg>
    );
};

export default Icon;
