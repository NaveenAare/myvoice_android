// src/components/Shimmer.tsx
import React from 'react';
import './shrimmer.css'; // Ensure you have the CSS file for styling

const Shimmer: React.FC<{ width?: string; height?: string; position?: 'left' | 'right' }> = ({ width = '100%', height = '20px', position }) => {
  return (
    <div className={`shimmer ${position}`} style={{ width, height }}></div>
  );
};

export default Shimmer;