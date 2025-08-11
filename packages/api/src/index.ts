import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { InMemoryRepository, ReadingListService, ReadingStatus } from '@app/backend';
import { computeSummary } from '@app/analytics';

const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = process.env.DATA_FILE || 'data/reading-list.json';

function isValidStatus(s: any): s is ReadingStatus {
  return s === 'to-read' || s === 'reading' || s === 'completed';
}

async function main() {
  const repo = new InMemoryRepository(DATA_FILE);
  const service = new ReadingListService(repo);

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/books', async (req, res) => {
    try {
      const { status, author, tag } = req.query as { status?: string; author?: string; tag?: string };
      const s = status && isValidStatus(status) ? (status as ReadingStatus) : undefined;
      const books = await service.listBooks({ status: s, author: author || undefined, tag: tag || undefined });
      res.json(books);
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? 'Internal error' });
    }
  });

  app.post('/books', async (req, res) => {
    try {
      const { title, author, pages, notes, tags } = req.body || {};
      if (!title || !author) return res.status(400).json({ error: 'title and author are required' });
      const book = await service.addBook({ title, author, pages, notes, tags });
      res.status(201).json(book);
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? 'Internal error' });
    }
  });

  app.get('/books/:id', async (req, res) => {
    try {
      const book = await service.getBook(req.params.id);
      if (!book) return res.status(404).json({ error: 'Not found' });
      res.json(book);
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? 'Internal error' });
    }
  });

  app.patch('/books/:id', async (req, res) => {
    try {
      const updates = req.body || {};
      if (updates.status && !isValidStatus(updates.status)) {
        return res.status(400).json({ error: 'invalid status' });
      }
      const updated = await service.updateBook(req.params.id, updates);
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? 'Internal error' });
    }
  });

  app.delete('/books/:id', async (req, res) => {
    try {
      const ok = await service.removeBook(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? 'Internal error' });
    }
  });

  app.post('/books/:id/status', async (req, res) => {
    try {
      const { status } = req.body || {};
      if (!isValidStatus(status)) return res.status(400).json({ error: 'invalid status' });
      const updated = await service.setStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? 'Internal error' });
    }
  });

  app.get('/analytics/summary', async (_req, res) => {
    try {
      const books = await service.listBooks();
      const summary = computeSummary(books);
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err?.message ?? 'Internal error' });
    }
  });

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
