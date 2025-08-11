import { Book, NewBookInput, ReadingListRepository, ReadingStatus, UpdateBookInput } from './models';
import { generateId } from './utils/id';

export interface ListFilter {
  status?: ReadingStatus;
  author?: string;
  tag?: string;
}

export class ReadingListService {
  constructor(private repo: ReadingListRepository) {}

  async addBook(input: NewBookInput): Promise<Book> {
    const now = new Date().toISOString();
    const book: Book = {
      id: generateId(),
      title: input.title.trim(),
      author: input.author.trim(),
      pages: input.pages,
      notes: input.notes,
      tags: (input.tags || []).map((t) => t.trim()).filter(Boolean),
      status: 'to-read',
      addedAt: now,
    };
    await this.repo.add(book);
    return book;
  }

  async listBooks(filter?: ListFilter): Promise<Book[]> {
    const items = await this.repo.list();
    let results = items;
    if (filter?.status) results = results.filter((b) => b.status === filter.status);
    if (filter?.author)
      results = results.filter((b) => b.author.toLowerCase().includes(filter.author!.toLowerCase()));
    if (filter?.tag)
      results = results.filter((b) => (b.tags || []).some((t) => t.toLowerCase() === filter.tag!.toLowerCase()));
    // Sort by addedAt desc
    results = results.slice().sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    return results;
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.repo.getById(id);
  }

  async updateBook(id: string, input: UpdateBookInput): Promise<Book | undefined> {
    const updates: Partial<Book> = { ...input };
    // Normalize possible status transitions
    if (input.status) {
      const now = new Date().toISOString();
      if (input.status === 'reading') {
        updates.status = 'reading';
        updates.startedAt = updates.startedAt ?? now;
        updates.completedAt = undefined;
      } else if (input.status === 'completed') {
        updates.status = 'completed';
        updates.completedAt = updates.completedAt ?? now;
        updates.startedAt = updates.startedAt ?? now;
      } else if (input.status === 'to-read') {
        updates.status = 'to-read';
        updates.startedAt = undefined;
        updates.completedAt = undefined;
      }
    }
    return this.repo.update(id, updates);
  }

  async removeBook(id: string): Promise<boolean> {
    return this.repo.remove(id);
  }

  async setStatus(id: string, status: ReadingStatus): Promise<Book | undefined> {
    return this.updateBook(id, { status });
  }
}
