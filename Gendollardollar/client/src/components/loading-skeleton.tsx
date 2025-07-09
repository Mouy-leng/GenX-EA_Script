import { Card, CardContent } from "@/components/ui/card";

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 loading-shimmer"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full loading-shimmer"></div>
              <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full loading-shimmer"></div>
            </div>
            <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer mb-2"></div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer mb-2"></div>
            <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer"></div>
              <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
