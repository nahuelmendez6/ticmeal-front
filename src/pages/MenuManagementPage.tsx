import React, { useState } from 'react';
import ItemManagement from './ItemManagement';
import ItemIngredientManager from './ItemIngredientManager';
import ShiftMenuAssignment from './ShiftMenuAssignment';

const MenuManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'items':
        return <ItemManagement />;
      case 'shifts':
        return <ShiftMenuAssignment />;
      case 'ingredients':
        return <ItemIngredientManager />;
      default:
        return <ItemManagement />;
    }
  };

  return (
    <div>
      <h1 className="mb-4">Gestión de Menú</h1>

      <ul className="nav nav-underline mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
            Menú
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>
            Ingredientes
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'shifts' ? 'active' : ''}`} onClick={() => setActiveTab('shifts')}>
            Turnos
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