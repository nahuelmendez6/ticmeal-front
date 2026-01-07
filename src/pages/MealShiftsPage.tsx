// src/pages/MealShiftsPage.tsx

import React from 'react';
import Layout from '../components/Layout';
import MealShiftManager from '../components/MealShiftManager';

const MealShiftsPage: React.FC = () => {
  return (
    <Layout>
      <MealShiftManager />
    </Layout>
  );
};

export default MealShiftsPage;
