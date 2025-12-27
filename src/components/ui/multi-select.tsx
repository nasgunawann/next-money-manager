"use client";

import * as React from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  const displayText =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === options.length
      ? "Semua"
      : selectedLabels.length > 2
      ? `${selectedLabels.length} dipilih`
      : selectedLabels.join(", ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between min-w-40 font-normal",
            value.length === 0 && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayText}</span>
          <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {/* Select All */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-accent border-b"
            onClick={handleSelectAll}
          >
            <Checkbox
              checked={value.length === options.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {value.length === options.length
                ? "Batalkan Semua"
                : "Pilih Semua"}
            </span>
          </div>

          {/* Options */}
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-accent"
                onClick={() => handleToggle(option.value)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(option.value)}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {option.icon && (
                    <span className="shrink-0" style={{ color: option.color }}>
                      {option.icon}
                    </span>
                  )}
                  <span className="text-sm truncate">{option.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
