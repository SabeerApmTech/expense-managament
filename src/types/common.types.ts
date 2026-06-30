export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  exportValue?: (value: unknown, row: T) => string;
}

export interface SelectOption {
  value: string;
  label: string;
}
