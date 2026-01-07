import React, { useState } from 'react';
import ItemManagement from './ItemManagement';
import ItemIngredientManager from './ItemIngredientManager';
import MealShiftManager from '../components/MealShiftManager';

const MenuManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('simple');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'simple':
        return <ItemManagement itemType="SIMPLE" />;
      case 'production':
        return (
          <div className="d-flex flex-column gap-4">
            <MealShiftManager />
            <hr />
            <h3 className="mb-3">Gestión de Productos Compuestos</h3>
            <ItemManagement itemType="COMPUESTO" />
          </div>
        );
      case 'ingredients':
        return <ItemIngredientManager />;
      default:
        return <ItemManagement itemType="SIMPLE" />;
    }
  };

  return (
    <div>
      <h1 className="mb-4">Gestión de Menú</h1>

      <ul className="nav nav-underline mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'simple' ? 'active' : ''}`} onClick={() => setActiveTab('simple')}>
            Productos Simples
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'production' ? 'active' : ''}`} onClick={() => setActiveTab('production')}>
            Producción
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>
            Ingredientes
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