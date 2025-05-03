import { ChangeEvent, FC } from "react";
import { UseFormRegister, FieldValues, Path } from "react-hook-form";

interface InputProps<T extends FieldValues> {
  type: "text" | "number" | "email" | "password";
  id: string;
  label: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  placeholder: string;
  error?: { message?: string }; // Error object to display specific messages
  disabled?: boolean;
  autofocus?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Input = <T extends FieldValues>({
  type,
  id,
  label,
  register,
  name,
  placeholder,
  error,
  disabled,
  onChange,
  autofocus = false,
}: InputProps<T>) => {
  return (
    <div className="input-wrapper">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        {...register(name)}
        id={id}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autofocus}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 block w-[360px] h-[47px] rounded-[4px] border border-[0.6px] bg-[#FBFBFB] ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        } shadow-sm sm:text-sm`}
      />

      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-500">
          {error.message || "Ce champ est requis"}
        </p>
      )}
    </div>
  );
};

export default Input;
