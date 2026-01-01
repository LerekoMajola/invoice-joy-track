-- Create unique partial indexes to prevent duplicate leads per user
-- Case-insensitive email matching
CREATE UNIQUE INDEX leads_user_email_unique 
ON leads (user_id, lower(email)) 
WHERE email IS NOT NULL AND email != '';

-- Exact phone matching
CREATE UNIQUE INDEX leads_user_phone_unique 
ON leads (user_id, phone) 
WHERE phone IS NOT NULL AND phone != '';