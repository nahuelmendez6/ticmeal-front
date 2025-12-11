export interface Category {
  id: number;
  name: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface MenuItem {
  id: number;
  name: string;
  stock: number;
  cost: number | string;
  isActive: boolean;
  category?: Category;
  iconName?: string;
  minStock?: number;
  maxOrder?: number | null;
}

export interface Ingredient {
  id: number;
  name: string;
  quantityInStock: number;
  unit: string;
  cost: number | string;
  isActive: boolean;
  category?: Category;
  minStock?: number;
}

export interface StockMovement {
  id: number;
  createdAt: string;
  quantity: number;
  unit: string;
  movementType: 'IN' | 'OUT' | 'in' | 'out';
  reason: string;
  relatedTicketId: string | null;
  performedById: string | number | null;
  performedBy: User | null;
  menuItem: MenuItem | null;
  ingredient: Ingredient | null;
}