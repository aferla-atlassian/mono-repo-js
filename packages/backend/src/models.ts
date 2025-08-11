export type ReadingStatus = 'to-read' | 'reading' | 'completed';

export interface Book {
  id: string;
  title: string;
  author: string;
  pages?: number;
  status: ReadingStatus;
  addedAt: string; // ISO timestamp
  startedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
  notes?: string;
  tags?: string[];
}

export interface NewBookInput {
  title: string;
  author: string;
  pages?: number;
  notes?: string;
  tags?: string[];
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  pages?: number;
  notes?: string;
  tags?: string[];
  status?: ReadingStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface ReadingListRepository {
  list(): Promise<Book[]>;
  getById(id: string): Promise<Book | undefined>;
  add(book: Book): Promise<void>;
  update(id: string, updates: Partial<Book>): Promise<Book | undefined>;
  remove(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
