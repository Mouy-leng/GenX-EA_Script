import { useState } from "react";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import SearchFilters from "@/components/search-filters";
import ResourceGrid from "@/components/resource-grid";
import Footer from "@/components/footer";
import { ResourceFilters } from "@shared/schema";

function HomePage() {
  const [filters, setFilters] = useState<ResourceFilters>({
    page: 1,
    limit: 12,
  });

  const handleFiltersChange = (newFilters: Partial<ResourceFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <HeroSection />
      <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
      <ResourceGrid 
        filters={filters} 
        onPageChange={handlePageChange} 
      />
      <Footer />
    </div>
  );
}

export default HomePage;
