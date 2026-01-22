
import { db } from "../server/db";
import { elections } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting election status updates...");

    try {
        // Update Election 2 (State election 2026) to active
        console.log("Updating Election 2 to 'active'...");
        await db
            .update(elections)
            .set({ status: "active" })
            .where(eq(elections.id, 2));
        console.log("Election 2 updated.");

        // Update Election 1 (General Election 2024) to completed
        console.log("Updating Election 1 to 'completed'...");
        await db
            .update(elections)
            .set({ status: "completed" })
            .where(eq(elections.id, 1));
        console.log("Election 1 updated.");

        console.log("All updates completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating elections:", error);
        process.exit(1);
    }
}

main();
