import { db } from './server/db';
import { elections } from './shared/schema';

async function checkElections() {
    try {
        const allElections = await db.select().from(elections);
        console.log("Current Elections in Database:");
        console.table(allElections.map(e => ({
            id: e.id,
            title: e.title,
            status: e.status,
            startDate: e.startDate,
            endDate: e.endDate
        })));
        process.exit(0);
    } catch (err) {
        console.error("Error checking elections:", err);
        process.exit(1);
    }
}

checkElections();
