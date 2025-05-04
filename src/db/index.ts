import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from '@/db/schema';

const db = drizzle({ schema });

export default db;