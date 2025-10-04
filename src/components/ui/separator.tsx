import * as React from "react";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? "none" : "separator"}
    className={cn(
      "shrink-0 bg-border",
      orientation === "vertical" ? "h-full w-px" : "h-px w-full",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
