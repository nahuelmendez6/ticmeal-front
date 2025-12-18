/**
 * Get the list of active shifts with their assigned menu items
 * @returns {Promise<Shisft>}
 */

interface MenuItem {
  id: number;
  name:string;
  category: { id: number; name: string } | null;
  iconName: string | null;
  isActive: boolean;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export const fetchShifts = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/shifts/menu-active`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Error al cargar los turnos')
    }
    return response.json;
}

/**
 * Get the list of menu-items assigned to an active shift
 * @returns {Promise<MenuItem[]>}
 */
export const fetchMenuItems = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}/menu-items`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Error al cargar los ítems del menú.');
  }
  return response.json();
};

/**
 * Update the list of menu-items assigned to an active shift
 * @param {number} shiftId
 * @param {MenuItem[]} items
 * @returns {Promise<void>}
 */
export const updateShiftMenuItems = async (shiftId: number, items: MenuItem[]) => {
  const token = localStorage.getItem('token');
  const menuItemIds = items.map(i => i.id);
  
  const response = await fetch(`${BASE_URL}/shifts/${shiftId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ menuItemIds }),
  });

  if (!response.ok) {
    // Aquí podrías leer el error del body si la API lo proporciona
    throw new Error('Error al actualizar el menú del turno. Inténtalo de nuevo.');
  }
};