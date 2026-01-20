import { db } from './server/db';
import { citizens } from './shared/schema';

async function testConnection() {
    console.log('Attempting to connect to database using server config...');
    try {
        const result = await db.select().from(citizens).limit(1);
        console.log('Successfully connected and queried citizens:', result.length);
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
