-- =============================================================================
-- PLAZABITE - SCHEMA 2 (FAST DELTA MIGRATION)
-- =============================================================================
-- Since you already ran schema.sql, DO NOT drop or recreate tables!
-- Just copy & run this short delta in Supabase SQL Editor.
-- It executes safely in < 1 second and keeps all your existing data intact.
-- =============================================================================

-- 1. Add Shop UPI ID column (for direct shop-specific customer payments)
alter table shops 
add column if not exists upi_id text default 'caffellon@okhdfcbank';

-- 2. Add Dining Option column to orders (for Table Dine-In vs. Counter Self-Pickup Token)
alter table orders 
add column if not exists dining_option text default 'dine_in';

-- 3. Fast Phone Lookup Index for Staff Login
create index if not exists idx_shops_phone on shops (phone);
create index if not exists idx_shops_status on shops (status);

-- 4. Update Existing Shops with their Direct Merchant UPI IDs
update shops 
set upi_id = 'caffellon@okhdfcbank' 
where slug = 'caffellon' or id = '11111111-1111-1111-1111-111111111111';

update shops 
set upi_id = 'brewbeans@okhdfcbank' 
where slug = 'brew-beans' or id = '22222222-2222-2222-2222-222222222222';

update shops 
set upi_id = 'momohaven@paytm' 
where slug = 'momo-haven' or id = '33333333-3333-3333-3333-333333333333';

update shops 
set upi_id = 'sweetscoop@okaxis' 
where slug = 'sweet-scoop' or id = '44444444-4444-4444-4444-444444444444';

update shops 
set upi_id = 'chaisamosa@upi' 
where slug = 'chai-samosa' or id = '55555555-5555-5555-5555-555555555555';

update shops 
set upi_id = 'dosajunction@upi' 
where slug = 'dosa-junction' or id = '66666666-6666-6666-6666-666666666666';

update shops 
set upi_id = 'burgerbarn@okhdfcbank' 
where slug = 'burger-barn' or id = '77777777-7777-7777-7777-777777777777';

update shops 
set upi_id = 'wokexpress@okaxis' 
where slug = 'wok-express' or id = '88888888-8888-8888-8888-888888888888';

-- 5. Verification Query (Run this to verify UPI IDs are set)
select id, name, phone, pin, upi_id from shops order by name;


-- 6. Fix 404 Image URLs for Caffellon Dishes
update items 
set image_url = 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' 
where id = 'c1010101-0000-0000-0000-000000000005' or image_url like '%1644781489704%';

update items 
set image_url = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80' 
where id = 'c1010101-0000-0000-0000-000000000007' or image_url like '%1576107232684%';

update items 
set image_url = 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80' 
where id = 'c1010101-0000-0000-0000-000000000011' or image_url like '%1527477378408%';

update items 
set image_url = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80' 
where id = '30303030-0000-0000-0000-000000000002' or image_url like '%1625242662367%';

update items 
set image_url = 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80' 
where id = 'bb707070-0000-0000-0000-000000000003' or image_url like '%1639024471287%';
