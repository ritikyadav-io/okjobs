export type Competition = "Low" | "Medium" | "High";
export type Recommendation = "Strong Apply" | "Apply" | "Skip";

export type Job = {
  id: string;
  company: string;
  title: string;
  salary: string;
  location: string;
  remote: "Remote" | "Hybrid" | "Onsite";
  atsScore: number;
  competition: Competition;
  postedDays: number;
  source: string;
  recommendation: Recommendation;
  logoBg: string;
};

export const MOCK_JOBS: Job[] = [
  { id: "j1", company: "Linear", title: "Frontend Engineer", salary: "₹22–32 LPA", location: "Remote, India", remote: "Remote", atsScore: 92, competition: "Low", postedDays: 1, source: "LinkedIn", recommendation: "Strong Apply", logoBg: "from-primary to-cyan" },
  { id: "j2", company: "Vercel", title: "Full-Stack Engineer", salary: "₹28–40 LPA", location: "Bangalore", remote: "Hybrid", atsScore: 86, competition: "Medium", postedDays: 2, source: "YC Jobs", recommendation: "Strong Apply", logoBg: "from-secondary to-gold" },
  { id: "j3", company: "Razorpay", title: "Product Engineer", salary: "₹18–26 LPA", location: "Bangalore", remote: "Onsite", atsScore: 74, competition: "Medium", postedDays: 3, source: "AngelList", recommendation: "Apply", logoBg: "from-cyan to-success" },
  { id: "j4", company: "Notion", title: "Software Engineer Intern", salary: "₹80k/mo", location: "Remote", remote: "Remote", atsScore: 68, competition: "High", postedDays: 1, source: "Internshala", recommendation: "Apply", logoBg: "from-gold to-secondary" },
  { id: "j5", company: "Zoho", title: "Backend Engineer", salary: "₹14–20 LPA", location: "Chennai", remote: "Onsite", atsScore: 58, competition: "Low", postedDays: 5, source: "Company site", recommendation: "Apply", logoBg: "from-success to-primary" },
  { id: "j6", company: "Stripe", title: "Frontend Engineer", salary: "₹35–55 LPA", location: "Remote", remote: "Remote", atsScore: 81, competition: "High", postedDays: 1, source: "LinkedIn", recommendation: "Strong Apply", logoBg: "from-primary to-secondary" },
];

export type AppStatus = "Saved" | "Applying" | "Applied" | "OA Received" | "Interview Scheduled" | "Rejected" | "Offer Received";

export const STATUS_META: Record<AppStatus, { color: string; emoji: string }> = {
  "Saved": { color: "bg-muted text-muted-foreground border-border", emoji: "💾" },
  "Applying": { color: "bg-cyan/15 text-cyan border-cyan/40", emoji: "📝" },
  "Applied": { color: "bg-primary/15 text-primary border-primary/40", emoji: "✅" },
  "OA Received": { color: "bg-gold/15 text-gold border-gold/40", emoji: "📋" },
  "Interview Scheduled": { color: "bg-cyan/20 text-cyan border-cyan/50", emoji: "🎯" },
  "Rejected": { color: "bg-danger/15 text-danger border-danger/40", emoji: "❌" },
  "Offer Received": { color: "bg-success/15 text-success border-success/40", emoji: "🎉" },
};

export type Application = {
  id: string;
  company: string;
  title: string;
  appliedDays: number;
  status: AppStatus;
  atsScore: number;
  followupIn?: number;
  interviewIn?: number;
  logoBg: string;
};

export const MOCK_APPS: Application[] = [
  { id: "a1", company: "Linear", title: "Frontend Engineer", appliedDays: 2, status: "Interview Scheduled", atsScore: 92, interviewIn: 1, logoBg: "from-primary to-cyan" },
  { id: "a2", company: "Vercel", title: "Full-Stack Engineer", appliedDays: 4, status: "Applied", atsScore: 86, followupIn: 1, logoBg: "from-secondary to-gold" },
  { id: "a3", company: "Stripe", title: "Frontend Engineer", appliedDays: 7, status: "OA Received", atsScore: 81, logoBg: "from-primary to-secondary" },
  { id: "a4", company: "Razorpay", title: "Product Engineer", appliedDays: 10, status: "Rejected", atsScore: 74, logoBg: "from-cyan to-success" },
  { id: "a5", company: "Notion", title: "SWE Intern", appliedDays: 1, status: "Saved", atsScore: 68, logoBg: "from-gold to-secondary" },
  { id: "a6", company: "Zoho", title: "Backend Engineer", appliedDays: 14, status: "Offer Received", atsScore: 58, logoBg: "from-success to-primary" },
];

export type RecruiterEmail = {
  id: string;
  company: string;
  sender: string;
  type: "Interview Invite" | "Rejection" | "Follow-up Request" | "Offer" | "Ghost";
  subject: string;
  preview: string;
  hoursAgo: number;
};

export const MOCK_EMAILS: RecruiterEmail[] = [
  { id: "e1", company: "Linear", sender: "talent@linear.app", type: "Interview Invite", subject: "Next steps — Frontend Engineer interview", preview: "Hi! We loved your application. Are you free Thursday at 3pm IST for a 45-min chat?", hoursAgo: 2 },
  { id: "e2", company: "Stripe", sender: "recruiting@stripe.com", type: "Follow-up Request", subject: "Quick OA before the interview", preview: "Please complete the take-home assessment within 5 days…", hoursAgo: 6 },
  { id: "e3", company: "Razorpay", sender: "careers@razorpay.com", type: "Rejection", subject: "Update on your application", preview: "Thank you for applying. After careful consideration…", hoursAgo: 22 },
  { id: "e4", company: "Zoho", sender: "hr@zoho.com", type: "Offer", subject: "Offer letter — Backend Engineer", preview: "We're thrilled to extend an offer of ₹18 LPA…", hoursAgo: 30 },
];
