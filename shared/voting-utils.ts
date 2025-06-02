export interface VotingTimeStatus {
  isVotingTime: boolean;
  canViewResults: boolean;
  currentTime: string;
  votingStart: string;
  votingEnd: string;
  resultsTime: string;
  message: string;
}

export function getVotingTimeStatus(): VotingTimeStatus {
  const now = new Date();
  const currentHour = now.getHours();
  const currentTime = now.toLocaleTimeString('en-IN', { 
    hour12: true,
    hour: '2-digit',
    minute: '2-digit'
  });

  const isVotingTime = currentHour >= 8 && currentHour < 17; // 8 AM to 5 PM
  const canViewResults = currentHour >= 18; // 6 PM onwards
  
  let message = "";
  
  if (currentHour < 8) {
    message = "Voting will start at 8:00 AM. Please come back during voting hours.";
  } else if (currentHour >= 8 && currentHour < 17) {
    message = "Voting is currently active. You can cast your vote now.";
  } else if (currentHour >= 17 && currentHour < 18) {
    message = "Voting has ended for today. Results will be available at 6:00 PM.";
  } else {
    message = "Voting has ended. Election results are now available.";
  }

  return {
    isVotingTime,
    canViewResults,
    currentTime,
    votingStart: "8:00 AM",
    votingEnd: "5:00 PM", 
    resultsTime: "6:00 PM",
    message
  };
}

export function formatVotingSchedule(): string {
  return "Voting Hours: 8:00 AM - 5:00 PM | Results Available: 6:00 PM onwards";
}