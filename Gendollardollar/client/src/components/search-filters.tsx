import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ResourceFilters } from "@shared/schema";

interface SearchFiltersProps {
  filters: ResourceFilters;
  onFiltersChange: (filters: Partial<ResourceFilters>) => void;
}

function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({ search: searchTerm || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, onFiltersChange]);

  const handleSkillLevelChange = (value: string) => {
    onFiltersChange({ 
      skillLevel: value === "all" ? undefined : value as any 
    });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ 
      category: value === "all" ? undefined : value as any 
    });
  };

  const handleResourceTypeChange = (value: string) => {
    onFiltersChange({ 
      resourceType: value === "all" ? undefined : value as any 
    });
  };

  return (
    <section className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Skill Level Filter */}
            <Select 
              value={filters.skillLevel || "all"} 
              onValueChange={handleSkillLevelChange}
            >
              <SelectTrigger className="w-40 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Category Filter */}
            <Select 
              value={filters.category || "all"} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-40 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Resource Type Filter */}
            <Select 
              value={filters.resourceType || "all"} 
              onValueChange={handleResourceTypeChange}
            >
              <SelectTrigger className="w-40 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchFilters;
