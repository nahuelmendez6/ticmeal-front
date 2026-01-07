// src/hooks/useMealShifts.ts

import { useState, useEffect, useCallback } from 'react';
import { mealShiftsService, type MealShift, type CreateMealShiftDto } from '../services/mealShiftService';

export const useMealShifts = () => {
  const [mealShifts, setMealShifts] = useState<MealShift[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMealShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealShiftsService.getAll();
      setMealShifts(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las producciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMealShift = async (data: CreateMealShiftDto) => {
    setLoading(true);
    setError(null);
    try {
      const newMealShift = await mealShiftsService.create(data);
      // Actualizamos el estado local agregando el nuevo elemento
      setMealShifts((prev) => [newMealShift, ...prev]);
      return newMealShift;
    } catch (err: any) {
      setError(err.message || 'Error al crear la producción');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el hook
  useEffect(() => {
    fetchMealShifts();
  }, [fetchMealShifts]);

  return {
    mealShifts,
    loading,
    error,
    refetch: fetchMealShifts,
    addMealShift,
  };
};
