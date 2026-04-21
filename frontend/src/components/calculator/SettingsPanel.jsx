import React from 'react';
import { CITIES } from '../../utils/recipeData';
import { SERVERS } from '../../utils/constants';

const Checkbox = ({ label, checked, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            style={{ cursor: 'pointer' }}
        />
        <span style={{ fontSize: '14px' }}>{label}</span>
    </label>
);

const NumberInput = ({ label, value, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-active)',
                color: 'white',
                padding: '4px',
                outline: 'none'
            }}
        />
    </div>
);

const Button = ({ label, onClick, icon, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: isLoading ? 'default' : 'pointer',
            padding: '6px 0',
            opacity: isLoading ? 0.5 : 1,
            fontSize: '14px'
        }}
    >
        <span>{icon || '↻'}</span>
        <span>{label}</span>
    </button>
);

const SettingsPanel = ({ settings, onSettingChange, onUpdateCurrent, onUpdateResources, onUpdateJournals, isLoading }) => {
    return (
        <div style={{ padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Settings</span>
                <span>💾</span>
                <span>🔄</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Server</span>
                <select
                    value={settings.server}
                    onChange={(e) => onSettingChange('server', e.target.value)}
                    style={{
                        background: 'white',
                        color: 'black',
                        padding: '4px',
                        borderRadius: '2px',
                        border: 'none',
                        outline: 'none'
                    }}
                >
                    {SERVERS.map(server => (
                        <option key={server.id} value={server.id}>{server.name}</option>
                    ))}
                </select>
            </div>

            <Checkbox label="Use journals" checked={settings.useJournals} onChange={(v) => onSettingChange('useJournals', v)} />
            <Checkbox label="Use focus" checked={settings.useFocus} onChange={(v) => onSettingChange('useFocus', v)} />
            <Checkbox label="Use multiple cities" checked={settings.useMultipleCities} onChange={(v) => onSettingChange('useMultipleCities', v)} />

            <NumberInput label="Number of items sold" value={settings.numberSold} onChange={(v) => onSettingChange('numberSold', v)} />

            <Checkbox label="Use average price" checked={settings.useAveragePrice} onChange={(v) => onSettingChange('useAveragePrice', v)} />

            <div style={{ margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Button label="Update current item" onClick={onUpdateCurrent} isLoading={isLoading} />
                <Button label="Update resource prices" onClick={onUpdateResources} isLoading={isLoading} />
                <Button label="Update journal prices" onClick={onUpdateJournals} isLoading={isLoading} />
            </div>

            <NumberInput label="Fee for 100 nutrition" value={settings.feeNutrition} onChange={(v) => onSettingChange('feeNutrition', v)} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Main city</span>
                <select
                    value={settings.mainCity}
                    onChange={(e) => onSettingChange('mainCity', e.target.value)}
                    style={{
                        background: 'white',
                        color: 'black',
                        padding: '4px',
                        borderRadius: '2px',
                        border: 'none',
                        outline: 'none'
                    }}
                >
                    {CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SettingsPanel;
