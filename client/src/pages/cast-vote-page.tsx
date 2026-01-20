import { useLocation } from "wouter";
import { VotingForm } from "@/components/voting/voting-form";

export default function CastVotePage() {
    const [, setLocation] = useLocation();

    return (
        <VotingForm
            onBack={() => setLocation("/voting")}
        />
    );
}
