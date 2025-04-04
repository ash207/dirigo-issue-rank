
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = ({ onOpenChange: userOnOpenChange, ...props }: PopoverPrimitive.PopoverProps) => {
  // Add wrapper to clean up pointer-events when popover is closed
  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      // Ensure pointer-events are restored when popover closes
      document.body.style.removeProperty('pointer-events');
    }
    if (userOnOpenChange) {
      userOnOpenChange(open);
    }
  }, [userOnOpenChange]);

  return <PopoverPrimitive.Root {...props} onOpenChange={handleOpenChange} />;
};

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      onCloseAutoFocus={() => {
        // Ensure pointer-events are restored when focus returns to trigger
        document.body.style.removeProperty('pointer-events');
      }}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
