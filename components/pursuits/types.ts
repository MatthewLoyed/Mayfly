export interface Session {
  date: string;
  duration: number;
  note?: string;
}

export interface Pursuit {
  id: string;
  title: string;
  category: string;
  startDate: string;
  sessions: Session[];
  totalSessions: number;
  stage: number; // 0: larva, 1: nymph, 2: emerging, 3: flight
  color: string;
}
