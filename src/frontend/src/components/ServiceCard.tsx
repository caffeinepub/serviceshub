import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { navigate } from "../App";
import type { Service } from "../backend.d";
import CategoryBadge from "./CategoryBadge";

interface ServiceCardProps {
  service: Service;
  ocid?: string;
}

export default function ServiceCard({ service, ocid }: ServiceCardProps) {
  return (
    <Card
      className="group card-hover cursor-pointer overflow-hidden border border-border"
      onClick={() => navigate(`service/${service.id}`)}
      data-ocid={ocid}
    >
      <div className="h-2 bg-primary w-full opacity-20 group-hover:opacity-60 transition-opacity" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <CategoryBadge category={service.category} />
          <span className="text-lg font-display font-bold text-accent">
            ${service.price.toFixed(2)}
          </span>
        </div>
        <h3 className="font-display font-semibold text-base text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {service.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {service.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <User className="w-3 h-3" />
          </div>
          <span className="truncate font-medium">{service.sellerName}</span>
        </div>
      </CardContent>
    </Card>
  );
}
