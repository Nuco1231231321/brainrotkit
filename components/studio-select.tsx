"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export type StudioSelectOption = {
  value: string;
  label: string;
};

export function StudioSelect({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: StudioSelectOption[];
  onValueChange: (value: string) => void;
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="studio-select-trigger" aria-label={label}>
        <Select.Value />
        <Select.Icon className="studio-select-icon">
          <ChevronDown aria-hidden="true" size={17} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="studio-select-content" position="popper" sideOffset={6}>
          <Select.Viewport className="studio-select-viewport">
            {options.map((option) => (
              <Select.Item className="studio-select-item" key={option.value} value={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="studio-select-indicator">
                  <Check aria-hidden="true" size={15} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
