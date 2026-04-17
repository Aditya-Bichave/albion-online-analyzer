import React from 'react';
import { getResourceColor } from '../utils';

const iconStyle = {
    width: '100%',
    height: '100%',
    display: 'block',
    overflow: 'visible'
};

const ResourceIcon = ({ type, size = 18, color, muted = false }) => {
    const resolvedColor = color || getResourceColor(type);
    const opacity = muted ? 0.72 : 1;

    const renderGlyph = () => {
        switch (type) {
            case 'wood':
                return (
                    <>
                        <rect x="10.2" y="14.4" width="3.6" height="6.8" rx="1.2" fill="#6d4127" />
                        <path d="M12 3.2L18.2 10H15.5L19.4 14.2H4.6L8.5 10H5.8L12 3.2Z" fill="currentColor" />
                        <path d="M8.6 11.4H15.4" stroke="#f6f7f8" strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
                    </>
                );
            case 'ore':
                return (
                    <>
                        <path d="M12 2.8L18.3 7.3L15.8 18.5L8.2 18.5L5.7 7.3L12 2.8Z" fill="currentColor" />
                        <path d="M12 2.8V18.5" stroke="#f6f7f8" strokeWidth="1" strokeOpacity="0.32" />
                        <path d="M5.7 7.3L12 11L18.3 7.3" stroke="#f6f7f8" strokeWidth="1" strokeOpacity="0.28" />
                    </>
                );
            case 'fiber':
                return (
                    <>
                        <path d="M8.4 18.6C8.8 13.3 8.2 9.1 6 5.4C8.7 6.1 10.4 8.7 10.8 12.4C11.7 8.3 13.8 5.1 18 3.6C17.2 8.5 15.5 12.4 12.8 16.1C13.9 15.7 15 15.5 16.4 15.5C15.1 17.8 13.5 19.3 11.5 20.2C10.3 19.9 9.3 19.3 8.4 18.6Z" fill="currentColor" />
                        <path d="M11.7 10.6C12.3 13 12.4 15.9 12 20.2" stroke="#f6f7f8" strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
                    </>
                );
            case 'hide':
                return (
                    <>
                        <circle cx="7.1" cy="8.3" r="2.2" fill="currentColor" />
                        <circle cx="11" cy="5.9" r="2" fill="currentColor" />
                        <circle cx="15" cy="5.9" r="2" fill="currentColor" />
                        <circle cx="18.9" cy="8.3" r="2.2" fill="currentColor" />
                        <path d="M12.9 10.2C17.4 10.2 20.4 13 20.4 16.7C20.4 19.1 18.5 21.1 16.1 21.1C14.8 21.1 13.9 20.4 12.9 19.6C11.9 20.4 11 21.1 9.7 21.1C7.3 21.1 5.4 19.1 5.4 16.7C5.4 13 8.4 10.2 12.9 10.2Z" fill="currentColor" />
                    </>
                );
            case 'stone':
                return (
                    <>
                        <path d="M5.2 16L8.8 7.5L15.1 5.2L19.8 10L18.3 18L10.9 20.8L5.2 16Z" fill="currentColor" />
                        <path d="M8.8 7.5L13 12.2L19.8 10" stroke="#f6f7f8" strokeWidth="1" strokeOpacity="0.28" />
                        <path d="M13 12.2L10.9 20.8" stroke="#f6f7f8" strokeWidth="1" strokeOpacity="0.24" />
                    </>
                );
            default:
                return <circle cx="12" cy="12" r="7" fill="currentColor" />;
        }
    };

    return (
        <span
            style={{
                width: `${size}px`,
                height: `${size}px`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: resolvedColor,
                opacity
            }}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={iconStyle}>
                {renderGlyph()}
            </svg>
        </span>
    );
};

export default ResourceIcon;
