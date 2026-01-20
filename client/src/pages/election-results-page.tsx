import { useLocation } from "wouter";
import { ElectionResults } from "@/components/voting/election-results";

export default function ElectionResultsPage() {
    const [, setLocation] = useLocation();

    return (
        <ElectionResults
            onBack={() => setLocation("/voting")}
        />
    );
}
