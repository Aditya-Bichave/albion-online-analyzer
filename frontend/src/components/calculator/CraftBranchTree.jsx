import React, { useState } from 'react';
import { CRAFT_BRANCHES } from '../../utils/recipeData';

const TreeItem = ({ label, isSelectable, isSelected, onSelect, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        if (children) {
            setIsOpen(!isOpen);
        } else if (isSelectable) {
            onSelect();
        }
    };

    return (
        <div style={{ marginLeft: '12px' }}>
            <div
                onClick={handleToggle}
                style={{
                    cursor: 'pointer',
                    padding: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    color: isSelected ? 'var(--text-active)' : 'white',
                    fontWeight: isSelected ? 'bold' : 'normal',
                }}
            >
                {children && (
                    <span style={{
                        display: 'inline-block',
                        width: '16px',
                        fontSize: '10px',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}>
                        ▶
                    </span>
                )}
                {!children && <span style={{ display: 'inline-block', width: '16px' }}></span>}
                <span style={{ fontSize: '14px' }}>{label}</span>
            </div>
            {isOpen && children && (
                <div style={{ borderLeft: '1px solid #333', marginLeft: '6px' }}>
                    {children}
                </div>
            )}
        </div>
    );
};

const CraftBranchTree = ({ selectedItem, onSelectItem }) => {
    return (
        <div style={{
            padding: '20px',
            color: 'white',
            height: '100%',
            overflowY: 'auto'
        }}>
            <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px',
                borderBottom: '1px solid #333',
                paddingBottom: '8px'
            }}>
                Craft branch
            </div>
            <div style={{ marginLeft: '-12px' }}>
                {Object.entries(CRAFT_BRANCHES).map(([categoryName, subCategories]) => (
                    <TreeItem key={categoryName} label={categoryName}>
                        {Object.entries(subCategories).map(([subCatName, items]) => (
                            <TreeItem key={subCatName} label={subCatName}>
                                {items.map(item => (
                                    <TreeItem
                                        key={item}
                                        label={item}
                                        isSelectable
                                        isSelected={selectedItem === item}
                                        onSelect={() => onSelectItem(item)}
                                    />
                                ))}
                            </TreeItem>
                        ))}
                    </TreeItem>
                ))}
            </div>
        </div>
    );
};

export default CraftBranchTree;
