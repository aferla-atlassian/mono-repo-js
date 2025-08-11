import { Book } from '@app/backend';
import { SummaryStats } from './types';

export function computeSummary(books: Book[]): SummaryStats {
  const byStatus = { 'to-read': 0, reading: 0, completed: 0 } as SummaryStats['byStatus'];
  let totalPages = 0;
  let totalPagesCompleted = 0;
  const authorCount = new Map<string, number>();
  let firstAddedAt: string | undefined;
  let lastAddedAt: string | undefined;

  for (const b of books) {
    byStatus[b.status]++;
    if (typeof b.pages === 'number') totalPages += b.pages;
    if (b.status === 'completed' && typeof b.pages === 'number') totalPagesCompleted += b.pages;
    authorCount.set(b.author, (authorCount.get(b.author) || 0) + 1);

    if (!firstAddedAt || b.addedAt < firstAddedAt) firstAddedAt = b.addedAt;
    if (!lastAddedAt || b.addedAt > lastAddedAt) lastAddedAt = b.addedAt;
  }

  const totalBooks = books.length;
  const completionRate = totalBooks ? byStatus['completed'] / totalBooks : 0;
  const currentlyReading = byStatus['reading'];

  const topAuthors = Array.from(authorCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([author, count]) => ({ author, count }));

  return {
    totalBooks,
    byStatus,
    totalPages: totalPages || undefined,
    totalPagesCompleted: totalPagesCompleted || undefined,
    completionRate,
    currentlyReading,
    topAuthors,
    firstAddedAt,
    lastAddedAt,
  };
}

export type { SummaryStats } from './types';
