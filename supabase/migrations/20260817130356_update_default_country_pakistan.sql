/*
# Update default country to Pakistan

1. Modified Tables
   - `orders`: change default value of `country` column from 'India' to 'Pakistan'.
2. Security
   - No security changes.
*/

ALTER TABLE orders ALTER COLUMN country SET DEFAULT 'Pakistan';
