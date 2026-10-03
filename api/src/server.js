import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

if (env.mongoUri) {
	await connectDatabase();
} else {
	console.warn('MONGO_URI not configured; starting without database');
}
app.listen(env.port, () => console.log(`SciScript API listening on port ${env.port}`));
