
import { db } from "../server/db";
import { elections } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Updating election scope...");

    try {
        // Update Election 2 to be State-wide for Tamil Nadu
        await db
            .update(elections)
            .set({
                electionScope: "State",
                constituency: null // Clear constituency constraint
            })
            .where(eq(elections.id, 2));

        console.log("Election 2 updated to State scope (Tamil Nadu).");
        process.exit(0);
    } catch (error) {
        console.error("Error updating election:", error);
        process.exit(1);
    }
}

main();
