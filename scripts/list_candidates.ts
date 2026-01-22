
import { db } from "../server/db";
import { candidates, elections } from "@shared/schema";
import { eq } from "drizzle-orm";

async function listCandidates() {
    const allCandidates = await db.select().from(candidates);
    console.log("Total Candidates:", allCandidates.length);

    for (const c of allCandidates) {
        console.log(`[${c.id}] Election: ${c.electionId} | Name: ${c.name} | Constituency: ${c.constituency}`);
    }
    process.exit(0);
}

listCandidates();
