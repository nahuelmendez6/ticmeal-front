import React, { useState } from 'react';
import StockReport from '../components/StockReport';
import TicketsTable from '../components/TicketsTable';
import ConsumptionReport from '../components/ConsumptionReport';
import CostsReport from '../components/CostsReport';
import { downloadGeneralReportPDF } from '../services/reportExporter';
import { FileDown } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('consumption');
  
  // Estado para la generación del PDF
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [pdfStartDate, setPdfStartDate] = useState(firstDay);
  const [pdfEndDate, setPdfEndDate] = useState(lastDay);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    const token = localStorage.getItem('token') || '';
    await downloadGeneralReportPDF(pdfStartDate, pdfEndDate, token);
    setGeneratingPdf(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'consumption':
        return <ConsumptionReport />;
      case 'stock':
        return <StockReport />;
      case 'tickets':
        return <TicketsTable />;
      case 'costs':
        return <CostsReport />;
      default:
        return <ConsumptionReport />;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h1 className="mb-0">Reportes</h1>
        
        <div className="card p-2 shadow-sm border-0 bg-light">
            <div className="d-flex align-items-center gap-2">
                <span className="small fw-bold text-muted text-nowrap">Exportar General:</span>
                <input 
                    type="date" 
                    className="form-control form-control-sm" 
                    value={pdfStartDate}
                    onChange={(e) => setPdfStartDate(e.target.value)}
                />
                <span className="small text-muted">-</span>
                <input 
                    type="date" 
                    className="form-control form-control-sm" 
                    value={pdfEndDate}
                    onChange={(e) => setPdfEndDate(e.target.value)}
                />
                <button 
                    className="btn btn-sm btn-danger d-flex align-items-center text-nowrap"
                    onClick={handleDownloadPdf}
                    disabled={generatingPdf}
                >
                    {generatingPdf ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                        <FileDown size={16} className="me-2" />
                    )}
                    PDF
                </button>
            </div>
        </div>
      </div>

      <ul className="nav nav-underline mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'consumption' ? 'active' : ''}`}
            onClick={() => setActiveTab('consumption')}
          >
            <i className="bi bi-bar-chart-line me-2"></i>
            Consumo
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            <i className="bi bi-clipboard-data me-2"></i>
            Movimientos de Stock
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <i className="bi bi-table me-2"></i>
            Tickets Emitidos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'costs' ? 'active' : ''}`}
            onClick={() => setActiveTab('costs')}
          >
            <i className="bi bi-currency-dollar me-2"></i>
            Costos
          </button>
        </li>
      </ul>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default ReportsPage;