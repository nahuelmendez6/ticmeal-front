import React from "react";

interface Category {
  id: number;
  name: string;
}
interface Item {
  category?: { id: number };
}

interface Props {
  categories: Category[];
  items: Item[];
  selectedCategory: string | null;
  onSelectCategory: (name: string) => void;
}

const CategoryTabs: React.FC<Props> = ({
  categories,
  items,
  selectedCategory,
  onSelectCategory
}) => {

  const displayedCategories = categories.filter(cat =>
    items.some(item => item.category?.id === cat.id)
  );

  return (
    <ul className="nav nav-tabs mb-3">
      {displayedCategories.map(cat => (
        <li className="nav-item" key={cat.id}>
          <button
            className={`nav-link ${selectedCategory === cat.name ? "active" : ""}`}
            onClick={() => onSelectCategory(cat.name)}
          >
            {cat.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default CategoryTabs;
