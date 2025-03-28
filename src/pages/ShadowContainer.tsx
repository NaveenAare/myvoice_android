import { useEffect, useRef } from 'react';

const ShadowViewer = ({ html }: { html: string }) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot) {
      const shadow = hostRef.current.attachShadow({ mode: 'open' });
      
      // Mobile-friendly style reset
      const style = document.createElement('style');
      style.textContent = `
        :host {
          all: initial !important;
          display: block !important;
          overflow: auto !important;
          contain: strict !important;
          touch-action: manipulation;
        }
        * {
          all: revert !important;
          box-sizing: border-box !important;
          max-width: 100% !important;
          line-height: 1.5 !important;
        }
        img {
          height: auto !important;
          max-width: 100% !important;
        }
      `;
      
      const container = document.createElement('div');
      container.innerHTML = html;
      
      shadow.appendChild(style);
      shadow.appendChild(container);
    }
  }, [html]);

  return <div ref={hostRef} className="shadow-host" />;
};

export default ShadowViewer;