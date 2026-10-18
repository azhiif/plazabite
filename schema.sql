-- =============================================================================
-- MULTI-FOOD COURT & DIGITAL QR ORDERING SYSTEM (SUPABASE PRODUCTION SCHEMA)
-- Run this complete script in your Supabase SQL Editor:
-- Supabase Dashboard -> Project -> SQL Editor -> New Query -> Run
-- =============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Clean Drop (Safe Cascade)
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists items cascade;
drop table if exists banners cascade;
drop table if exists tables cascade;
drop table if exists shops cascade;
drop table if exists food_courts cascade;
drop table if exists otps cascade;

-- -----------------------------------------------------------------------------
-- 3. TABLES DEFINITIONS
-- -----------------------------------------------------------------------------

-- Food Courts (Dining Plazas with shared seating)
create table food_courts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  location text,
  admin_pin text not null default '9999',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Promotional Banners
create table banners (
  id uuid primary key default uuid_generate_v4(),
  food_court_id uuid references food_courts(id) on delete cascade,
  title text not null,
  subtitle text,
  badge text,
  image_url text not null,
  accent text default 'from-black/80 via-black/40 to-transparent',
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shops / Outlets / Cafes
create table shops (
  id uuid primary key default uuid_generate_v4(),
  food_court_id uuid references food_courts(id) on delete cascade not null,
  name text not null,
  slug text unique,
  category text not null,
  logo_url text,
  banner_url text,
  rating numeric default 4.8,
  estimated_time text default '15-20 mins',
  pin text not null default '1234',
  phone text,
  status text not null default 'accepted' check (status in ('pending', 'accepted', 'rejected')),
  is_open boolean default true,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Dining Seating Tables per Food Court
create table tables (
  id uuid primary key default uuid_generate_v4(),
  food_court_id uuid references food_courts(id) on delete cascade not null,
  table_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (food_court_id, table_number)
);

-- Food & Drink Items
create table items (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  name text not null,
  price numeric not null check (price >= 0),
  description text,
  image_url text,
  category text not null,
  is_available boolean default true,
  is_veg boolean default false,
  rating numeric default 4.8,
  reviews_count integer default 100,
  tag text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customer Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  food_court_id uuid references food_courts(id) on delete set null,
  table_number integer not null,
  shop_id uuid references shops(id) on delete cascade not null,
  shop_name text,
  customer_name text not null,
  customer_phone text not null,
  notes text,
  total numeric not null check (total >= 0),
  payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Paid')),
  order_status text not null default 'Pending' check (order_status in ('Pending', 'Preparing', 'Ready', 'Completed', 'Delivered')),
  otp_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items (Line Items)
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  shop_id uuid references shops(id) on delete cascade not null,
  item_id uuid references items(id) on delete set null,
  item_name text not null,
  quantity integer not null check (quantity > 0),
  price numeric not null check (price >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- OTP Tokens for Phone Verification
create table otps (
  id uuid primary key default uuid_generate_v4(),
  phone text not null,
  otp text not null,
  expires_at timestamp with time zone not null,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table food_courts enable row level security;
alter table banners enable row level security;
alter table shops enable row level security;
alter table tables enable row level security;
alter table items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table otps enable row level security;

-- Public read permissions
create policy "Allow Public Read Food Courts" on food_courts for select using (true);
create policy "Allow Public Read Banners" on banners for select using (true);
create policy "Allow Public Read Shops" on shops for select using (true);
create policy "Allow Public Read Tables" on tables for select using (true);
create policy "Allow Public Read Items" on items for select using (true);
create policy "Allow Public Read Orders" on orders for select using (true);
create policy "Allow Public Read Order Items" on order_items for select using (true);
create policy "Allow Public Read OTP" on otps for select using (true);

-- Vendor shop join requests & food court admin operations
create policy "Allow Public Insert Shops" on shops for insert with check (true);
create policy "Allow Public Update Shops" on shops for update using (true);

-- Shop owner item modifications (add, edit, stock toggle, delete)
create policy "Allow Public Insert Items" on items for insert with check (true);
create policy "Allow Public Update Items" on items for update using (true);
create policy "Allow Public Delete Items" on items for delete using (true);

-- Customer orders placement and updates
create policy "Allow Public Insert Orders" on orders for insert with check (true);
create policy "Allow Public Update Orders" on orders for update using (true);
create policy "Allow Public Insert Order Items" on order_items for insert with check (true);

-- OTP verification operations
create policy "Allow Public Insert OTP" on otps for insert with check (true);
create policy "Allow Public Update OTP" on otps for update using (true);

-- -----------------------------------------------------------------------------
-- 5. ENABLE REALTIME SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table orders, items, order_items, shops, banners;
commit;

-- -----------------------------------------------------------------------------
-- 6. COMPREHENSIVE SEED MOCK DATA
-- -----------------------------------------------------------------------------

-- 6.1 Food Courts
insert into food_courts (id, name, slug, location, admin_pin) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Central Food Plaza', 'central-plaza', 'Ground Floor, Central Mall, Metro City', '9999'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Metro Hub Food Court', 'metro-hub', 'Level 2, Transit Station, Downtown', '9999'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cyber Greens Food Park', 'cyber-greens', 'Tower B Courtyard, Tech Zone', '9999');

-- 6.2 Promotional Banners
insert into banners (id, food_court_id, title, subtitle, badge, image_url, accent, sort_order) values
('10101010-1010-1010-1010-101010101010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cravings Sorted.', 'Crispy. Juicy. Irresistible rolls & smash burgers.', 'Caffellon Specials', 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80', 'from-black/80 via-black/40 to-transparent', 1),
('20202020-2020-2020-2020-202020202020', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1 Table. 4 Cafes.', 'Order from any kitchen directly to your seat.', 'Food Plaza Dining', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'from-red-950/80 via-black/40 to-transparent', 2),
('30303030-3030-3030-3030-303030303030', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hot Dumplings & Coolers', 'Momos, mojitos & decadent thick shakes.', 'Plaza Favorites', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80', 'from-amber-950/80 via-black/40 to-transparent', 3);

-- 6.3 Shared Dining Tables (Central Plaza 1-20, Metro Hub 1-15, Cyber Greens 1-25)
insert into tables (food_court_id, table_number)
select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', generate_series(1, 20);

insert into tables (food_court_id, table_number)
select 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', generate_series(1, 15);

insert into tables (food_court_id, table_number)
select 'cccccccc-cccc-cccc-cccc-cccccccccccc', generate_series(1, 25);

-- 6.4 Shops / Cafes
-- Accepted Cafes for Central Plaza:
insert into shops (id, food_court_id, name, slug, category, logo_url, banner_url, rating, estimated_time, pin, phone, status, is_open, description) values
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Caffellon', 'caffellon', 'Rolls, Burgers & Loaded Fries', 
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80',
 4.8, '15-20 mins', '1234', '9876543210', 'accepted', true, 'Crispy. Juicy. Irresistible rolls, smashed burgers & loaded fries.'),

('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Brew & Beans', 'brew-beans', 'Artisan Coffee & Shakes', 
 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80',
 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
 4.9, '10-15 mins', '1234', '9876543211', 'accepted', true, 'Freshly brewed single origin coffee, signature mojitos & thick shakes.'),

('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Momo Haven', 'momo-haven', 'Tibetan & Street Dimsums', 
 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=200&q=80',
 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80',
 4.7, '12-18 mins', '1234', '9876543212', 'accepted', true, 'Authentic steamed, fried & wok-tossed Himalayan momos.'),

('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sweet Scoop', 'sweet-scoop', 'Waffles & Gelato', 
 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=200&q=80',
 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
 4.9, '8-12 mins', '1234', '9876543213', 'accepted', true, 'Warm Belgian waffles, artisanal scoops and molten lava desserts.');

-- Pending Cafe Join Requests for Central Plaza (Waiting for Food Court Owner Approval):
insert into shops (id, food_court_id, name, slug, category, logo_url, banner_url, rating, estimated_time, pin, phone, status, is_open, description) values
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Chai & Samosa Co.', 'chai-samosa', 'Street Tea & Savories',
 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=200&q=80',
 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
 4.6, '10-12 mins', '1234', '9876500001', 'pending', true, 'Authentic cutting chai, crispy hot samosas and stuffed kachoris.'),

('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dosa Junction', 'dosa-junction', 'South Indian Express',
 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=200&q=80',
 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
 4.7, '12-15 mins', '1234', '9876500002', 'pending', true, 'Crispy paper ghee roast dosas, idlis and filter coffee.');

-- Shops for Metro Hub:
insert into shops (id, food_court_id, name, slug, category, logo_url, banner_url, rating, estimated_time, pin, phone, status, is_open, description) values
('77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Burger Barn', 'burger-barn', 'Gourmet Smashed Burgers',
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
 4.8, '12-15 mins', '1234', '9876500003', 'accepted', true, 'Artisan smashed Angus beef & spiced chicken burgers.'),

('88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wok Express', 'wok-express', 'Pan-Asian Bowls & Noodles',
 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=200&q=80',
 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=1200&q=80',
 4.7, '15-20 mins', '1234', '9876500004', 'accepted', true, 'Sizzling teriyaki bowls, pad thai and spicy schezwan hakka noodles.');

-- 6.5 Menu Items for Caffellon
insert into items (id, shop_id, name, price, description, image_url, category, is_available, is_veg, rating, reviews_count, tag) values
('c1010101-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Crispy Chicken Roll', 149, 'Golden crunchy chicken rolled in flaky layered paratha with spiced garlic mayo & herbs.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', 'Caffellon Rolls', true, false, 4.8, 142, 'Bestseller'),
('c1010101-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Creamy Crispy Roll', 169, 'Crisp tenders smothered in house velvety white garlic glaze and pickled onion crunch.', 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=600&q=80', 'Caffellon Rolls', true, false, 4.8, 98, null),
('c1010101-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Chicken Chilli Roll', 159, 'Fiery shredded chicken wok-tossed with bell peppers and green chili schezwan twist.', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80', 'Caffellon Rolls', true, false, 4.8, 76, null),
('c1010101-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Supreme Wrappello', 269, 'Signature king roll with double portion crispy chicken, melted cheddar, and smoked relish.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 'Caffellon Rolls', true, false, 4.9, 210, 'Chef Choice'),
('c1010101-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Veg Supreme Roll', 149, 'Crisp spiced cottage cheese fingers, fresh capsicum, mint chutney and spiced mayo.', 'https://images.unsplash.com/photo-1644781489704-585351f0c2a2?auto=format&fit=crop&w=600&q=80', 'Caffellon Rolls', true, true, 4.8, 64, null),
('c1010101-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Spicy Lava LOADED Fries', 219, 'Golden skin-on fries drowned in hot peri peri cheese fondue, jalapenos and scallions.', 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80', 'Loaded Fries', true, true, 4.8, 118, 'Hot Pick'),
('c1010101-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Cheesy Blast LOADED Fries', 249, 'Generous molten double-cheese lava with herb dust, sour cream drizzle and crispy shallots.', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80', 'Loaded Fries', true, true, 4.8, 85, null),
('c1010101-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Smash Chicken Burger', 189, 'Double smashed crispy seared chicken patty with American cheese slice, gherkins & secret sauce in brioche.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 'Smash Burgers', true, false, 4.9, 177, 'Bestseller'),
('c1010101-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Crispy Zinger Delight', 179, 'Ultra-crunchy fried chicken thigh coated in secret batter with fresh iceberg lettuce and herb mayo.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', 'Smash Burgers', true, false, 4.8, 124, null),
('c1010101-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'Crispy Chicken Tenders (4 Pcs)', 199, 'Hand-breaded whole white meat chicken tenders served with sweet hot glaze and creamy garlic dip.', 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80', 'Tenders & Wings', true, false, 4.9, 95, null),
('c1010101-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'Peri Peri Wings (6 Pcs)', 229, 'Juicy wings deep-fried and tossed in fiery Portuguese peri-peri dry rub with cooling dip.', 'https://images.unsplash.com/photo-1527477378408-1bc093952b1b?auto=format&fit=crop&w=600&q=80', 'Tenders & Wings', true, false, 4.8, 89, null);

-- 6.6 Menu Items for Brew & Beans
insert into items (id, shop_id, name, price, description, image_url, category, is_available, is_veg, rating, reviews_count, tag) values
('b2020202-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Classic Mint Mojito', 119, 'Muddled fresh mint leaves, lime chunks, sparkling fizz with a burst of citrus coolness.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 'Mojitos & Coolers', true, true, 4.9, 150, 'Refreshing'),
('b2020202-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Blue Ocean Curacao Cooler', 139, 'Vibrant blue curacao with sparkling lemonade and sweet citrus infusion.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', 'Mojitos & Coolers', true, true, 4.8, 82, null),
('b2020202-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Belgian Chocolate Thick Shake', 169, 'Decadent imported Belgian dark chocolate blended with whole milk and rich chocolate drizzle.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80', 'Shakes & Coffee', true, true, 4.9, 195, 'Bestseller'),
('b2020202-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Iced Caramel Macchiato', 159, 'Fresh espresso shot layered over chilled milk with Madagascar vanilla and buttery caramel swirl.', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', 'Shakes & Coffee', true, true, 4.8, 110, null),
('b2020202-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Cold Brew Vanilla Sweet Cream', 179, 'Slow-steeped Arabica cold brew topped with house-whipped vanilla sweet cream.', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80', 'Shakes & Coffee', true, true, 4.9, 87, 'Staff Pick'),
('b2020202-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Strawberry Mint Cooler', 129, 'Fresh crushed strawberries, garden mint and lemon splash.', 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80', 'Mojitos & Coolers', true, true, 4.8, 73, null);

-- 6.7 Menu Items for Momo Haven
insert into items (id, shop_id, name, price, description, image_url, category, is_available, is_veg, rating, reviews_count, tag) values
('30303030-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Steamed Chicken Darjeeling Momos (6 Pcs)', 139, 'Delicate translucent dumplings loaded with seasoned minced chicken, ginger and scallions.', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', 'Momos', true, false, 4.9, 180, 'Must Try'),
('30303030-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Crispy Kurkure Chicken Momos (6 Pcs)', 169, 'Golden crunchy outer crumb crust packed with juicy tender spiced chicken inside.', 'https://images.unsplash.com/photo-1625242662367-e95e7c85880b?auto=format&fit=crop&w=600&q=80', 'Momos', true, false, 4.8, 140, 'Popular'),
('30303030-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Paneer Corn Butter Momos (6 Pcs)', 139, 'Soft cottage cheese and sweet golden corn steamed dumplings with coriander butter hint.', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80', 'Momos', true, true, 4.7, 92, null),
('30303030-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'Schezwan Chilli Tossed Momos (6 Pcs)', 159, 'Pan-fried chicken momos wok-tossed in pungent schezwan gravy, onions and peppers.', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80', 'Momos', true, false, 4.8, 115, 'Spicy');

-- 6.8 Menu Items for Sweet Scoop
insert into items (id, shop_id, name, price, description, image_url, category, is_available, is_veg, rating, reviews_count, tag) values
('40404040-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Nutella Loaded Belgian Waffle', 179, 'Freshly baked warm waffle with deep pockets filled with Nutella, chocolate fudge and almond flakes.', 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80', 'Desserts & Waffles', true, true, 4.9, 160, 'Sweet Tooth'),
('40404040-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'Sizzling Brownie with Vanilla Gelato', 189, 'Warm fudgy walnut brownie served with vanilla cream scoop and bubbling hot fudge drizzle.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', 'Desserts & Waffles', true, true, 4.9, 135, 'Classic'),
('40404040-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'Dark Belgian Chocolate Gelato Cup', 129, 'Artisanal slow-churned 70% dark Belgian cocoa gelato with roasted cocoa nibs.', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', 'Desserts & Waffles', true, true, 4.8, 98, null),
('40404040-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'Lotus Biscoff Crumble Sundae', 199, 'Caramelized speculoos gelato layered with crushed Biscoff biscuit and warm spread.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', 'Desserts & Waffles', true, true, 4.9, 112, 'Trending');

-- 6.9 Menu Items for Burger Barn (Metro Hub)
insert into items (id, shop_id, name, price, description, image_url, category, is_available, is_veg, rating, reviews_count, tag) values
('bb707070-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'Classic Double Smash Burger', 229, 'Two thin crispy patties seared on flat top, doubled American cheese, grilled onions and secret spread.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 'Smash Burgers', true, false, 4.9, 190, 'Top Seller'),
('bb707070-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777777', 'Truffle Mushroom Swiss Burger', 259, 'Flame-broiled patty with sauteed garlic cremini mushrooms, melted Swiss and black truffle aioli.', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80', 'Smash Burgers', true, false, 4.8, 114, 'Gourmet'),
('bb707070-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', 'Crispy Panko Onion Rings', 129, 'Giant sweet yellow onion rings double-dredged in seasoned Japanese panko with smoky ranch.', 'https://images.unsplash.com/photo-1639024471287-032f66071256?auto=format&fit=crop&w=600&q=80', 'Sides', true, true, 4.7, 85, null);

-- -----------------------------------------------------------------------------
-- 7. SAMPLE LIVE & HISTORICAL ORDERS WITH ORDER ITEMS
-- -----------------------------------------------------------------------------

-- Live Active Orders (For Kitchen & Food Court Dashboard testing):
insert into orders (id, food_court_id, table_number, shop_id, shop_name, customer_name, customer_phone, notes, total, payment_status, order_status, otp_verified, created_at) values
('f1000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, '11111111-1111-1111-1111-111111111111', 'Caffellon', 'Rahul Sharma', '9876511111', 'Please make it extra spicy, extra garlic dip on the side.', 368, 'Paid', 'Preparing', true, now() - interval '8 minutes'),
('f1000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 7, '11111111-1111-1111-1111-111111111111', 'Caffellon', 'Priya Patel', '9876522222', 'No onions in the roll please.', 298, 'Pending', 'Pending', true, now() - interval '2 minutes'),
('f1000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 12, '22222222-2222-2222-2222-222222222222', 'Brew & Beans', 'Aditya Verma', '9876533333', 'Less sweet in the shake, extra ice in cooler.', 288, 'Paid', 'Ready', true, now() - interval '14 minutes');

-- Historical Completed Orders (Populates Order History):
insert into orders (id, food_court_id, table_number, shop_id, shop_name, customer_name, customer_phone, notes, total, payment_status, order_status, otp_verified, created_at) values
('f1000000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '11111111-1111-1111-1111-111111111111', 'Caffellon', 'Sneha Kapoor', '9876544444', 'Serve with extra napkins.', 408, 'Paid', 'Completed', true, now() - interval '2 hours'),
('f1000000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, '11111111-1111-1111-1111-111111111111', 'Caffellon', 'Vikram Singh', '9876555555', '', 438, 'Paid', 'Completed', true, now() - interval '4 hours'),
('f1000000-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 9, '33333333-3333-3333-3333-333333333333', 'Momo Haven', 'Neha Joshi', '9876566666', 'Extra spicy red chutney.', 308, 'Paid', 'Completed', true, now() - interval '6 hours');

-- Order Items:
insert into order_items (id, order_id, shop_id, item_id, item_name, quantity, price) values
-- For Order 1 (Rahul - Table 4):
('01000001-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'c1010101-0000-0000-0000-000000000001', 'Crispy Chicken Roll', 1, 149),
('01000001-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'c1010101-0000-0000-0000-000000000006', 'Spicy Lava LOADED Fries', 1, 219),

-- For Order 2 (Priya - Table 7):
('01000001-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'c1010101-0000-0000-0000-000000000005', 'Veg Supreme Roll', 2, 149),

-- For Order 3 (Aditya - Table 12):
('01000001-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'b2020202-0000-0000-0000-000000000001', 'Classic Mint Mojito', 1, 119),
('01000001-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'b2020202-0000-0000-0000-000000000003', 'Belgian Chocolate Thick Shake', 1, 169),

-- For Order 4 (Sneha - Historical):
('01000001-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'c1010101-0000-0000-0000-000000000008', 'Smash Chicken Burger', 1, 189),
('01000001-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'c1010101-0000-0000-0000-000000000006', 'Spicy Lava LOADED Fries', 1, 219),

-- For Order 5 (Vikram - Historical):
('01000001-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'c1010101-0000-0000-0000-000000000004', 'Supreme Wrappello', 1, 269),
('01000001-0000-0000-0000-000000000009', 'f1000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'c1010101-0000-0000-0000-000000000002', 'Creamy Crispy Roll', 1, 169),

-- For Order 6 (Neha - Historical):
('01000001-0000-0000-0000-000000000010', 'f1000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', '30303030-0000-0000-0000-000000000001', 'Steamed Chicken Darjeeling Momos (6 Pcs)', 1, 139),
('01000001-0000-0000-0000-000000000011', 'f1000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', '30303030-0000-0000-0000-000000000002', 'Crispy Kurkure Chicken Momos (6 Pcs)', 1, 169);

-- -----------------------------------------------------------------------------
-- DONE! All tables, policies, realtime feeds, and mock seed records are ready.
-- -----------------------------------------------------------------------------
