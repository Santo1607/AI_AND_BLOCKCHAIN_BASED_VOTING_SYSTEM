
import { db } from "../server/db";
import { candidates, elections } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const CANDIDATE_DATA = [
    // Election 1: General Election 2024
    {
        electionId: 1,
        constituency: "Chennai Central",
        candidates: [
            { name: "Dr. Amit Singh", party: "National Development Party", symbol: "lotus", manifesto: "Development for all" },
            { name: "Ms. Priya Venkatesh", party: "Progressive Alliance", symbol: "hand", manifesto: "Justice and Peace" },
            { name: "Shri Rajesh Kumar", party: "Common Man's Party", symbol: "broom", manifesto: "Anti-corruption" }
        ]
    },
    {
        electionId: 1,
        constituency: "Madurai",
        candidates: [
            { name: "Ms. Kavitha Nair", party: "Progressive Alliance", symbol: "hand", manifesto: "Rural Growth" },
            { name: "Dr. Murugan Selvam", party: "National Development Party", symbol: "lotus", manifesto: "Tech Hub Madurai" }
        ]
    },
    {
        electionId: 1,
        constituency: "Coimbatore",
        candidates: [
            { name: "Shri Ravi Patel", party: "Common Man's Party", symbol: "broom", manifesto: "Clean Politics" },
            { name: "Dr. Sundar Raman", party: "Progressive Alliance", symbol: "hand", manifesto: "Health for All" }
        ]
    },

    // Election 2: State Election 2026
    {
        electionId: 2,
        constituency: "Chennai Central",
        candidates: [
            { name: "Mr. Stalin Joseph", party: "Dravidian Progress Party", symbol: "sun", manifesto: "State Autonomy" },
            { name: "Ms. Jayalalitha R", party: "All India Party", symbol: "leaves", manifesto: "Welfare Schemes" }
        ]
    },
    {
        electionId: 2,
        constituency: "Madurai",
        candidates: [
            { name: "Mr. Alagiri M", party: "Dravidian Progress Party", symbol: "sun", manifesto: "Madurai Infrastructure" },
            { name: "Mr. Bose K", party: "National Nationalist Party", symbol: "flower", manifesto: "National Integration" }
        ]
    },
    {
        electionId: 2,
        constituency: "Coimbatore",
        candidates: [
            { name: "Mr. Velumani S", party: "All India Party", symbol: "leaves", manifesto: "Industrial Corridor" },
            { name: "Mr. Balaji V", party: "Dravidian Progress Party", symbol: "sun", manifesto: "Power Sector Reform" }
        ]
    }
];

async function seedCandidates() {
    console.log("Starting candidate seeding...");

    // Ensure elections exist (basic check/fix IDs)
    // We assume IDs 1 and 2 exist as per previous context.

    for (const group of CANDIDATE_DATA) {
        const election = await db.query.elections.findFirst({
            where: eq(elections.id, group.electionId)
        });

        if (!election) {
            console.log(`Skipping Election ID ${group.electionId} - Not Found`);
            continue;
        }

        console.log(`Checking candidates for Election ${group.electionId} in ${group.constituency}...`);

        for (const c of group.candidates) {
            // Check if candidate exists by name and election
            const existing = await db.query.candidates.findFirst({
                where: and(
                    eq(candidates.electionId, group.electionId),
                    eq(candidates.name, c.name),
                    eq(candidates.constituency, group.constituency)
                )
            });

            if (!existing) {
                await db.insert(candidates).values({
                    electionId: group.electionId,
                    name: c.name,
                    party: c.party,
                    constituency: group.constituency,
                    symbol: c.symbol,
                    manifesto: c.manifesto,
                    photoUrl: null,
                    createdAt: new Date().toISOString()
                });
                console.log(`  + Added candidate: ${c.name}`);
            } else {
                console.log(`  = Exists: ${c.name}`);
            }
        }
    }

    console.log("Seeding complete.");
    process.exit(0);
}

seedCandidates();
