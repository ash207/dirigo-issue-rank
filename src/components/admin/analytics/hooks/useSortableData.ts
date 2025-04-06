
import { useState, useMemo } from 'react';

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export function useSortableData<T>(
  items: T[],
  config: SortConfig = { key: 'date', direction: 'desc' }
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(config);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          const comparison = aValue - bValue;
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  return { items: sortedItems, requestSort, sortConfig };
}
