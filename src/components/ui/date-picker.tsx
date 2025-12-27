"use client";

import * as React from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { IconCalendar, IconChevronDown } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  date?: Date;
  onChange: (date?: Date) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  date,
  onChange,
  disabled,
  placeholder = "Select date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between font-normal", className)}
          disabled={disabled}
        >
          <span
            className={cn(
              "flex items-center gap-2",
              !date && "text-muted-foreground"
            )}
          >
            <IconCalendar className="h-4 w-4" />
            {date ? format(date, "PPP", { locale: localeId }) : placeholder}
          </span>
          <IconChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          locale={localeId}
          weekStartsOn={1}
          mode="single"
          selected={date}
          captionLayout="dropdown"
          fromYear={2000}
          toYear={2100}
          classNames={{ caption_label: "sr-only" }}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
