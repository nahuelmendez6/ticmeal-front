import React from 'react';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Bienvenido al Sistema de TicMeal de gestión de comedores</h5>
              <p className="card-text">Seleccione una opción del menú lateral para comenzar.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

