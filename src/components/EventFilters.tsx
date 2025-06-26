
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface EventFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange
}) => {
  return (
    <div className="flex items-center space-x-4 mb-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-600" />
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EventFilters;
