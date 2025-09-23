import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const db = new Database({
  fetch: async ({ documentName }) => {
    const { rows } = await pool.query(
      'select ydoc_state from public.document_versions where document_id = $1 order by id desc limit 1',
      [documentName]
    );
    if (!rows.length) return null;
    return Buffer.from(rows[0].ydoc_state);
  },
  store: async ({ documentName, state }) => {
    await pool.query(
      'insert into public.document_versions (document_id, ydoc_state) values ($1,$2)',
      [documentName, Buffer.from(state)]
    );
  },
});

const server = Server.configure({
  port: Number(process.env.PORT) || 3001,
  extensions: [db],
  async onAuthenticate({ requestParameters, context }) {
    const token = requestParameters.get('token');
    if (!token) throw new Error('Missing token');
    const payload = jwt.decode(token);
    context.userId = payload?.sub;
  },
  async onConnect({ documentName, context }) {
    context.documentId = documentName;
  },
});

server.listen();
console.log('Hocuspocus running on', process.env.PORT || 3001);
