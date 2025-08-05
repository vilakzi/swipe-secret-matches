-- Fix Supabase security warnings
-- 1. Configure proper OTP expiry (currently exceeds recommended threshold)
-- 2. Enable leaked password protection

-- Set OTP expiry to recommended 1 hour (3600 seconds)
UPDATE auth.config 
SET 
  otp_expiry = 3600,
  password_min_length = 8
WHERE true;

-- Enable leaked password protection
UPDATE auth.config 
SET enable_leaked_password_protection = true
WHERE true;