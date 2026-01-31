-- Migration: Add Hack Club as a valid platform source
-- Run this in Supabase SQL Editor

-- Drop the existing CHECK constraint
ALTER TABLE hackathons 
DROP CONSTRAINT hackathons_platform_source_check;

-- Add the new CHECK constraint that includes 'hackclub'
ALTER TABLE hackathons 
ADD CONSTRAINT hackathons_platform_source_check
CHECK (platform_source IN ('unstop', 'devpost', 'devfolio', 'hackclub'));

-- Verify the constraint was updated
SELECT constraint_name
FROM information_schema.constraint_column_usage
WHERE constraint_name = 'hackathons_platform_source_check';
