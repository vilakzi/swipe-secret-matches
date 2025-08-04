
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  isToggling?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  showPassword,
  onToggleVisibility,
  isToggling = false,
  disabled = false,
  maxLength = 128,
}) => {
  return (
    <div>
      <Label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-gray-800 border-gray-600 text-white pr-10 focus:border-purple-500 focus:ring-purple-500 ${
            error ? 'border-red-500 focus:border-red-500' : ''
          }`}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white transition-all duration-200 ${
            isToggling ? 'bg-purple-600/20 text-purple-400' : ''
          }`}
          onClick={onToggleVisibility}
          disabled={disabled}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
      {value && value.length < 6 && (
        <p className="text-yellow-400 text-sm mt-1">Password must be at least 6 characters</p>
      )}
    </div>
  );
};

export default PasswordField;
