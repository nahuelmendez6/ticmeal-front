import React, { useState } from 'react';
import ItemManagement from './ItemManagement';
import IngredientManagement from './IngredientManagement';

const MenuManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'items':
        return <ItemManagement />;
      case 'shifts':
        return <div className="p-4">Contenido de Asignar Ítems a Turnos</div>;
      case 'ingredients':
        return <IngredientManagement />;
      default:
        return <ItemManagement />;
    }
  };

  return (
    <div>
      <h1 className="mb-4">Gestión de Menú</h1>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
            Gestión de Items
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'shifts' ? 'active' : ''}`} onClick={() => setActiveTab('shifts')}>
            Asignar Items a Turnos
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>
            Gestión de Ingredientes
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MenuManagementPage;