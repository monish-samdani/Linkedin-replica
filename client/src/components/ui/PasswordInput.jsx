import { useState } from 'react';
import FormInput from './FormInput';

export default function PasswordInput(props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormInput
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="text-xs font-medium text-gray-500 hover:text-brand-500"
          tabIndex={-1}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      }
    />
  );
}
