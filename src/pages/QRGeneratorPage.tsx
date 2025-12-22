import React from 'react';
import TenantQRCode from '../components/TenantQRCode';
import { useAuth } from '../contexts/AuthContext';

const QRGeneratorPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.company) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          No se pudo cargar la información de la empresa. Por favor, inicie sesión de nuevo.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <TenantQRCode tenantId={user.company.id} companyName={user.company.name} />
        </div>
      </div>
    </div>
  );
};

export default QRGeneratorPage;