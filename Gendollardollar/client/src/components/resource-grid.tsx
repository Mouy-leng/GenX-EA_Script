import { useQuery } from "@tanstack/react-query";
import ResourceCard from "./resource-card";
import LoadingSkeleton from "./loading-skeleton";
import Pagination from "./pagination";
import { ResourceFilters, ResourcesResponse } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ResourceGridProps {
  filters: ResourceFilters;
  onPageChange: (page: number) => void;
}

function ResourceGrid({ filters, onPageChange }: ResourceGridProps) {
  const { data, isLoading, error } = useQuery<ResourcesResponse>({
    queryKey: ["/api/resources", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.skillLevel) params.append("skillLevel", filters.skillLevel);
      if (filters.category) params.append("category", filters.category);
      if (filters.resourceType) params.append("resourceType", filters.resourceType);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/resources?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Featured Resources
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Curated educational content for every skill level
          </p>
        </div>
        <LoadingSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load resources. Please try again later.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!data || data.resources.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Featured Resources
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Curated educational content for every skill level
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No resources found matching your criteria.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Try adjusting your search filters or search terms.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Featured Resources
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Curated educational content for every skill level
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Showing {data.resources.length} of {data.totalCount} resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data.resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {data.totalPages > 1 && (
        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          hasNextPage={data.hasNextPage}
          hasPrevPage={data.hasPrevPage}
          onPageChange={onPageChange}
        />
      )}
    </main>
  );
}

export default ResourceGrid;
