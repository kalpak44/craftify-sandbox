import React from 'react';
import { Handle, Position } from 'reactflow';

export const IngredientSearchNode = ({ id, data }) => {
    const { onDelete, onConfig, state } = data;

    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div style={{
                background: "white",
                color: "black",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                position: "relative",
                minWidth: "200px"
            }}>
                <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                        Ingredient:
                    </span>
                    <span style={{ color: "#555" }}>
                        {state.label || "No ingredient specified"}
                    </span>
                </div>
                <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                        Type:
                    </span>
                    <span style={{ color: "#007bff" }}>
                        Product Search
                    </span>
                </div>
                <div style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px' }}>
                    <button
                        style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'blue',
                        }}
                        onClick={() => onConfig(id)}
                    >
                        ⚙️
                    </button>
                    <button
                        style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'red',
                        }}
                        onClick={() => onDelete(id)}
                    >
                        ✖
                    </button>
                </div>
            </div>
            <div style={{ position: 'relative', height: '20px', marginTop: '10px' }}>
                <Handle type="source" position={Position.Bottom} id="products-found" style={{ top: '10px' }} />
                <span style={{
                    position: 'absolute',
                    left: 'calc(50% + 10px)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: '#555'
                }}>
                    Products found
                </span>
            </div>
            <div style={{ position: 'relative', height: '20px', marginTop: '10px' }}>
                <Handle type="source" position={Position.Bottom} id="no-products-found" style={{ top: '10px' }} />
                <span style={{
                    position: 'absolute',
                    left: 'calc(50% + 10px)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: '#555'
                }}>
                    No products found
                </span>
            </div>
        </>
    );
};
