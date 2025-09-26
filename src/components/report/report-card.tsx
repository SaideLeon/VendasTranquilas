import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, type LucideIcon } from 'lucide-react'; // Import Info icon
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components

interface ReportCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  tooltip?: string; // Optional tooltip text
  colorClass?: string; // Tailwind color class for the icon/value
}

export default function ReportCard({ title, value, icon: Icon, description, tooltip, colorClass = "text-primary-foreground" }: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          {title}
           {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                 {/* Using a neutral Info icon for the tooltip trigger */}
                <Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardTitle>
        <Icon className={`h-4 w-4 ${colorClass} opacity-80`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
