import { promises as fs } from 'fs';
import * as path from 'path';
import { Book, ReadingListRepository } from '../models';

export class InMemoryRepository implements ReadingListRepository {
  private items: Book[] = [];
  private loaded = false;

  constructor(private filePath?: string) {}

  private async ensureLoaded() {
    if (this.loaded) return;
    this.loaded = true;
    if (!this.filePath) return;
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        this.items = parsed as Book[];
      }
    } catch (err: any) {
      if (err && err.code === 'ENOENT') {
        // Initialize empty file
        await this.persist();
        return;
      }
      console.warn('Failed to load repository file, starting empty:', err?.message ?? err);
    }
  }

  private async persist() {
    if (!this.filePath) return;
    const tmp = JSON.stringify(this.items, null, 2);
    await fs.writeFile(this.filePath, tmp, 'utf-8');
  }

  async list(): Promise<Book[]> {
    await this.ensureLoaded();
    return [...this.items];
  }

  async getById(id: string): Promise<Book | undefined> {
    await this.ensureLoaded();
    return this.items.find((b) => b.id === id);
  }

  async add(book: Book): Promise<void> {
    await this.ensureLoaded();
    this.items.push(book);
    await this.persist();
  }

  async update(id: string, updates: Partial<Book>): Promise<Book | undefined> {
    await this.ensureLoaded();
    const idx = this.items.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    const current = this.items[idx];
    const updated = { ...current, ...updates } as Book;
    this.items[idx] = updated;
    await this.persist();
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const before = this.items.length;
    this.items = this.items.filter((b) => b.id !== id);
    const changed = this.items.length !== before;
    if (changed) await this.persist();
    return changed;
  }

  async clear(): Promise<void> {
    await this.ensureLoaded();
    this.items = [];
    await this.persist();
  }
}
