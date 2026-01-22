
import { db } from "../server/db";
import { elections } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Extending election hours...");

    try {
        // Update Election 2 to have long hours
        await db
            .update(elections)
            .set({
                votingStartTime: "00:00",
                votingEndTime: "23:59",
                resultsTime: "23:59"
            })
            .where(eq(elections.id, 2));

        console.log("Election 2 hours extended (00:00 - 23:59).");
        process.exit(0);
    } catch (error) {
        console.error("Error updating election:", error);
        process.exit(1);
    }
}

main();
