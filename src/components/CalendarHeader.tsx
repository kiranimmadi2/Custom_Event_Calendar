
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onDateChange }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button onClick={goToToday} variant="outline" size="sm">
          Today
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          onClick={goToPreviousMonth}
          variant="outline"
          size="sm"
          className="p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          onClick={goToNextMonth}
          variant="outline"
          size="sm"
          className="p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
