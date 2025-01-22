export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    index: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  }
  