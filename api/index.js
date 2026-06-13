import fs from 'fs';
import path from 'path';
import app from '../server.js';

// Force tracing package.json so Vercel includes it in the serverless bundle for ESM resolution
try {
  const pkgPath = path.join(process.cwd(), 'package.json');
  fs.readFileSync(pkgPath, 'utf8');
} catch (e) {
  // Silent fallback
}

export default app;
