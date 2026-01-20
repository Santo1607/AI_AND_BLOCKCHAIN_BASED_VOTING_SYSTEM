import { useLocation } from "wouter";
import { VoterRegistrationForm } from "@/components/voting/voter-registration-form";

export default function VoterRegistrationPage() {
    const [, setLocation] = useLocation();

    return (
        <VoterRegistrationForm
            onBack={() => setLocation("/voting")}
        />
    );
}
