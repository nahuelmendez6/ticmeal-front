import React from 'react';
import { useDrag } from 'react-dnd';
import type { MenuItem } from '../../types/menu'
import IconComponent,  {type IconName } from '../../utilities/icons.utility';
const ItemTypes = {
  MENU_ITEM: 'menu_item',
};
/**
 * Componente para un ítem de menú arrastrable.
 */
const DraggableMenuItem = React.memo(({ item }: { item: MenuItem }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MENU_ITEM,
    item: { ...item }, // Pasar todos los datos del ítem
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex items-center p-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-150 cursor-grab ${isDragging ? 'opacity-50 border-dashed border-2 border-indigo-500' : 'opacity-100'}`}
    >
      <IconComponent iconName={item.iconName as IconName | null} />
      <span className="text-gray-800 font-medium">{item.name}</span>
    </div>
  );
});

export default DraggableMenuItem;