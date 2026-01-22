
import { db } from "../server/db";
import { candidates, elections } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function checkCandidates() {
    try {
        const allElections = await db.select().from(elections);
        console.log("Elections found:", allElections.length);

        for (const election of allElections) {
            const candidateCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(candidates)
                .where(eq(candidates.electionId, election.id));

            console.log(`Election ID: ${election.id} (${election.title}) - Candidate Count: ${candidateCount[0].count}`);
        }
    } catch (error) {
        console.error("Error checking candidates:", error);
    }
    process.exit(0);
}

checkCandidates();
