
export const validationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters'
    }
  },
  displayName: {
    required: 'Display name is required',
    minLength: {
      value: 2,
      message: 'Display name must be at least 2 characters'
    },
    maxLength: {
      value: 50,
      message: 'Display name must be less than 50 characters'
    }
  },
  age: {
    required: 'Age is required',
    min: {
      value: 18,
      message: 'You must be at least 18 years old'
    },
    max: {
      value: 100,
      message: 'Please enter a valid age'
    }
  },
  bio: {
    maxLength: {
      value: 500,
      message: 'Bio must be less than 500 characters'
    }
  }
};

export const validateEmail = (email: string): boolean => {
  return validationRules.email.pattern.value.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= validationRules.password.minLength.value;
};

export const validateAge = (age: number): boolean => {
  return age >= validationRules.age.min.value && age <= validationRules.age.max.value;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
