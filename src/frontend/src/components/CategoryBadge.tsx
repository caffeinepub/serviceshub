import { Badge } from "@/components/ui/badge";
import { Category } from "../backend.d";

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.design]: "Diseño",
  [Category.programming]: "Programación",
  [Category.marketing]: "Marketing",
  [Category.writing]: "Redacción",
  [Category.video]: "Video",
  [Category.music]: "Música",
  [Category.business]: "Negocios",
  [Category.other]: "Otro",
};

const CATEGORY_COLORS: Record<Category, string> = {
  [Category.design]: "bg-violet-100 text-violet-800 border-violet-200",
  [Category.programming]: "bg-blue-100 text-blue-800 border-blue-200",
  [Category.marketing]: "bg-orange-100 text-orange-800 border-orange-200",
  [Category.writing]: "bg-amber-100 text-amber-800 border-amber-200",
  [Category.video]: "bg-red-100 text-red-800 border-red-200",
  [Category.music]: "bg-pink-100 text-pink-800 border-pink-200",
  [Category.business]: "bg-green-100 text-green-800 border-green-200",
  [Category.other]: "bg-gray-100 text-gray-700 border-gray-200",
};

export function categoryLabel(cat: Category): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export default function CategoryBadge({
  category,
  className,
}: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${CATEGORY_COLORS[category]} font-medium text-xs ${className ?? ""}`}
    >
      {categoryLabel(category)}
    </Badge>
  );
}
