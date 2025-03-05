import React, { useEffect, useRef } from 'react';
import './LoadingAnimation.css'; // Import the CSS for the loading animation

const LoadingAnimation: React.FC<{ onVideoEnd: () => void }> = ({ onVideoEnd }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onVideoEnd(); // Call the function to indicate the loading has ended
        }, 3000); // Show loader for 3 seconds

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [onVideoEnd]);

    return (
        <div className="infinity">
            <div>
                <span></span>
            </div>
            <div>
                <span></span>
            </div>
            <div>
                <span></span>
            </div>
        </div>
    );
};

export default LoadingAnimation;
