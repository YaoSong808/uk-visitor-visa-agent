export type TripStop = { city: string; activities: string; accommodation: string };

export type ApplicationData = {
  consent: boolean;
  applicant: { fullName: string; nationality: string; dateOfBirth: string; passportNumber: string; currentCountry: string; residenceExpiry: string; maritalStatus: string; travelHistory: string };
  trip: { arrivalDate: string; departureDate: string; purpose: string; stops: TripStop[] };
  finance: { estimatedCost: string; personalFunds: string; monthlyIncome: string; monthlyExpenses: string; sponsorName: string; sponsorRelationship: string; sponsorAmount: string; sponsorIncome: string; largeTransactions: string };
  ties: { status: string; institution: string; returnDate: string; returnCommitment: string; summary: string };
};

export type AgentResult = {
  summary: string;
  readinessScore: number;
  missingInformation: string[];
  contradictions: Array<{ severity: "high" | "medium" | "low"; field: string; issue: string; action: string }>;
  checklist: Array<{ category: string; document: string; status: "ready" | "missing" | "review"; reason: string }>;
  coverLetter: string;
  nextSteps: string[];
  disclaimer: string;
};

export const EMPTY_APPLICATION: ApplicationData = {
  consent: false,
  applicant: { fullName: "", nationality: "Chinese", dateOfBirth: "", passportNumber: "", currentCountry: "", residenceExpiry: "", maritalStatus: "", travelHistory: "" },
  trip: { arrivalDate: "", departureDate: "", purpose: "Tourism and sightseeing", stops: [{ city: "London", activities: "", accommodation: "" }] },
  finance: { estimatedCost: "", personalFunds: "", monthlyIncome: "", monthlyExpenses: "", sponsorName: "", sponsorRelationship: "", sponsorAmount: "", sponsorIncome: "", largeTransactions: "" },
  ties: { status: "", institution: "", returnDate: "", returnCommitment: "", summary: "" },
};
