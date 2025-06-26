
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrencePattern {
  type: RecurrenceType;
  interval: number;
  weekDays?: number[]; // 0-6, Sunday-Saturday
  endDate?: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  category: string;
  recurrence?: RecurrencePattern;
}
