import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../types/index.ts'; // FIX: Añadida la extensión .ts para resolver el módulo
import IconComponent from '../../utilities/icons.utility.ts'; // FIX: Añadida la extensión .jsx para resolver el módulo

/**
 * Componente para un ítem de menú arrastrable.
 * @param {{ item: import('../types/index').MenuItem }} props
 */
const DraggableMenuItem = React.memo(({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MENU_ITEM,
    item: { ...item }, // Pasar todos los datos del ítem
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center p-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-150 cursor-grab ${isDragging ? 'opacity-50 border-dashed border-2 border-indigo-500' : 'opacity-100'}`}
    >
      <IconComponent iconName={item.iconName} />
      <span className="text-gray-800 font-medium">{item.name}</span>
    </div>
  );
});

export default DraggableMenuItem;