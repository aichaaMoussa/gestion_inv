import React from "react";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isMulti?: boolean;
  className?: string;
  name?: string;
  id?: string;
  errorMessage?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  isDisabled = false,
  isMulti = false,
  className = "",
  name,
  id,
  errorMessage,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isMulti) {
      const selectedValues = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      onChange(selectedValues);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={isDisabled}
        multiple={isMulti}
        className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isDisabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <span className="text-red-500 text-sm mt-1">{errorMessage}</span>
      )}
    </div>
  );
};

export default Select;
