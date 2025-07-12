import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Resource } from "@shared/schema";
import { Clock, Tag, Play, BookOpen, GraduationCap, FileText } from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
}

function ResourceCard({ resource }: ResourceCardProps) {
  const getSkillLevelIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return "🌱";
      case "intermediate":
        return "⭐";
      case "advanced":
        return "🔥";
      default:
        return "";
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play size={12} />;
      case "article":
        return <FileText size={12} />;
      case "course":
        return <GraduationCap size={12} />;
      case "tutorial":
        return <BookOpen size={12} />;
      default:
        return null;
    }
  };

  const getSkillLevelClass = (level: string) => {
    switch (level) {
      case "beginner":
        return "skill-beginner";
      case "intermediate":
        return "skill-intermediate";
      case "advanced":
        return "skill-advanced";
      default:
        return "";
    }
  };

  const getResourceTypeClass = (type: string) => {
    switch (type) {
      case "video":
        return "resource-video";
      case "article":
        return "resource-article";
      case "course":
        return "resource-course";
      case "tutorial":
        return "resource-tutorial";
      default:
        return "";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <img 
        src={resource.imageUrl} 
        alt={resource.title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium ${getSkillLevelClass(resource.skillLevel)}`}
          >
            <span className="mr-1">{getSkillLevelIcon(resource.skillLevel)}</span>
            {resource.skillLevel.charAt(0).toUpperCase() + resource.skillLevel.slice(1)}
          </Badge>
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium ${getResourceTypeClass(resource.resourceType)}`}
          >
            <span className="mr-1">{getResourceTypeIcon(resource.resourceType)}</span>
            {resource.resourceType.charAt(0).toUpperCase() + resource.resourceType.slice(1)}
          </Badge>
        </div>
        
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {resource.title}
        </h4>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {resource.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <Tag size={12} className="mr-1" />
            {resource.category.charAt(0).toUpperCase() + resource.category.slice(1).replace("-", " ")}
          </span>
          <span className="flex items-center">
            <Clock size={12} className="mr-1" />
            {resource.duration}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResourceCard;
