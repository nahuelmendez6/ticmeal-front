import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TenantQRCodeProps {
  tenantId: number;
  companyName: string;
}

const TenantQRCode: React.FC<TenantQRCodeProps> = ({ tenantId, companyName }) => {
  const frontendUrl = window.location.origin;
  const shareUrl = `${frontendUrl}/active-shift/${tenantId}`;

  /**
   * Maneja la descarga del código QR como una imagen PNG.
   */
  const handleDownload = () => {
    const svgElement = document.querySelector('#qr-code-container svg') as SVGSVGElement;
    if (!svgElement) {
      console.error("No se pudo encontrar el elemento SVG del código QR.");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    
    const size = parseInt(svgElement.getAttribute('width') || '256');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Dibuja un fondo blanco para asegurar que no sea transparente
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      
      // Crea un enlace temporal para iniciar la descarga
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-code-${companyName.toLowerCase().replace(/\s+/g, '-')}.png`;
      downloadLink.href = pngFile;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    // Codifica el SVG para manejar caracteres especiales antes de pasarlo a base64
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="card p-4 text-center shadow-sm">
      <div className="card-body">
        <h4 className="card-title">Código QR para {companyName}</h4>
        <p className="text-muted">
          Este QR permite a los usuarios acceder al menú del turno activo para realizar pedidos.
        </p>
        <div id="qr-code-container" className="my-3 d-flex justify-content-center">
          <QRCodeSVG
            value={shareUrl}
            size={256}
            includeMargin={true}
            level={"H"} // Nivel de corrección alto, ideal para impresión
          />
        </div>
        <p className="text-muted small" style={{ wordBreak: 'break-all' }}>
          {shareUrl}
        </p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
          <button className="btn btn-primary" onClick={handleDownload}>
            <i className="bi bi-download me-2"></i>
            Descargar PNG
          </button>
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>
            <i className="bi bi-printer me-2"></i>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantQRCode;