
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  success,
  maxLength,
  className = '',
  disabled = false,
}) => {
  return (
    <div>
      <Label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500 ${
          error ? 'border-red-500 focus:border-red-500' : ''
        } ${className}`}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
      {success && !error && (
        <p className="text-green-400 text-sm mt-1">{success}</p>
      )}
    </div>
  );
};

export default FormField;
