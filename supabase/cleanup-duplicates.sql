-- Clean up duplicate categories
-- This script removes user-specific categories that have the same name as system categories
-- It keeps the system categories and removes the user duplicates

-- First, let's see what duplicates exist
SELECT 
  c1.id as user_category_id,
  c1.name,
  c1.type,
  c1.user_id as user_id,
  c2.id as system_category_id
FROM public.categories c1
INNER JOIN public.categories c2 
  ON LOWER(c1.name) = LOWER(c2.name) 
  AND c1.type = c2.type
WHERE c1.user_id IS NOT NULL 
  AND c2.user_id IS NULL;

-- Delete user categories that duplicate system categories
-- This will keep system categories and remove user duplicates
DELETE FROM public.categories c1
WHERE c1.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 
    FROM public.categories c2 
    WHERE LOWER(c1.name) = LOWER(c2.name) 
      AND c1.type = c2.type 
      AND c2.user_id IS NULL
  );

-- Note: If you want to keep user categories instead of system ones, 
-- you can modify the query above to delete system categories instead:
-- DELETE FROM public.categories c1
-- WHERE c1.user_id IS NULL
--   AND EXISTS (
--     SELECT 1 
--     FROM public.categories c2 
--     WHERE LOWER(c1.name) = LOWER(c2.name) 
--       AND c1.type = c2.type 
--       AND c2.user_id IS NOT NULL
--   );

