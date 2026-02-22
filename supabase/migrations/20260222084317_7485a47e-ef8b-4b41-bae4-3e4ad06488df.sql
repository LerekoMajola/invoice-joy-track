
-- 1. Migrate existing subscribers on removed verticals to 'business'
UPDATE public.subscriptions 
SET system_type = 'business' 
WHERE system_type IN ('workshop', 'school', 'hire', 'guesthouse', 'fleet');

-- 2. Drop old constraint and create new one with only 3 verticals
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_system_type_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_system_type_check 
  CHECK (system_type IN ('business', 'legal', 'gym'));

-- 3. Update platform_modules: move removed vertical modules to 'shared' so BizPro custom builder can see them
UPDATE public.platform_modules 
SET system_type = 'shared' 
WHERE system_type IN ('workshop', 'school', 'hire', 'guesthouse', 'fleet');

-- 4. Deactivate package_tiers for removed verticals
UPDATE public.package_tiers 
SET is_active = false 
WHERE system_type IN ('workshop', 'school', 'hire', 'guesthouse', 'fleet');
