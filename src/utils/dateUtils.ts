
export const getMonthDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Get first day of the month
  const firstDay = new Date(year, month, 1);
  // Get last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Get first day of the calendar (might be from previous month)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  // Get last day of the calendar (might be from next month)
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
  
  const days: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
