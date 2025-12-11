import React, { useState } from 'react';
import StockReport from '../components/StockReport';
import TicketsTable from '../components/TicketsTable';
import ConsumptionReport from '../components/ConsumptionReport';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('consumption');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'consumption':
        return <ConsumptionReport />;
      case 'stock':
        return <StockReport />;
      case 'tickets':
        return <TicketsTable />;
      default:
        return <ConsumptionReport />;
    }
  };

  return (
    <div>
      <h1 className="mb-4">Reportes</h1>

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
      </ul>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default ReportsPage;