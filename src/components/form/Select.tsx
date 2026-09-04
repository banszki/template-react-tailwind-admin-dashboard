import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
}

// Dark-mode-safe <option> styling (B-014). Chrome/Windows paints each <option>'s background/text
// from whatever color the AUTHOR set on the <option> itself — without an explicit dark class
// here, the open popup falls back to native light-mode white against dark:text-white/90 text on
// the <select>, i.e. white-on-white. Mirrors PHQ's proven local Select (web/src/components/common/Select.tsx).
const OPTION_CLASS = "bg-white text-gray-800 dark:bg-gray-900 dark:text-white/90";

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  // Controlled vs uncontrolled (0.3.1). When `value` is provided, the parent
  // owns the state — we render exactly what they pass and do NOT touch
  // internal state. When `value` is undefined, fall back to internal state
  // seeded from `defaultValue` (the original 0.3.0 behavior; preserved
  // unchanged for backward compatibility — existing uncontrolled callers
  // work without any modification).
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const selectedValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternalValue(newValue);
    onChange(newValue); // Always notify the parent
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        selectedValue
          ? OPTION_CLASS
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled
        className={OPTION_CLASS}
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className={OPTION_CLASS}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
