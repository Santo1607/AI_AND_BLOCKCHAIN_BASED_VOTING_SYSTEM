
import { db } from "../server/db";
import { candidates } from "@shared/schema";
import { eq } from "drizzle-orm";

async function replaceCandidates() {
    console.log("Replacing candidates for State Election (ID 2)...");

    // 1. Delete all existing candidates for Election 2
    await db.delete(candidates).where(eq(candidates.electionId, 2));
    console.log("Deleted old candidates from Election 2.");

    // 2. Get all candidates from Election 1 (General)
    const generalCandidates = await db.select().from(candidates).where(eq(candidates.electionId, 1));
    console.log(`Found ${generalCandidates.length} source candidates from General Election.`);

    // 3. Insert them into Election 2
    for (const c of generalCandidates) {
        await db.insert(candidates).values({
            electionId: 2, // New Election ID
            name: c.name,
            party: c.party,
            constituency: c.constituency,
            symbol: c.symbol,
            manifesto: c.manifesto,
            photoUrl: c.photoUrl,
            createdAt: new Date().toISOString()
        });
        console.log(`  + Copied: ${c.name} (${c.constituency})`);
    }

    console.log("Candidate replacement complete.");
    process.exit(0);
}

replaceCandidates();
