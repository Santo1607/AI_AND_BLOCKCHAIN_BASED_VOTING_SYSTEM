
import { storage } from '../server/storage';

async function main() {
    try {
        const elections = await storage.getAllElections();
        console.log('--- ALL ELECTIONS ---');
        for (const e of elections) {
            const candidates = await storage.getCandidatesByElection(e.id);
            console.log(`ID: ${e.id} | Title: ${e.title} | Status: ${e.status} | Candidates: ${candidates.length}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
