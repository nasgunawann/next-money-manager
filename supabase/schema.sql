-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  currency text default 'IDR',
  theme text default 'system',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

-- Create accounts table
create table public.accounts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('cash', 'bank', 'ewallet', 'savings')),
  balance decimal(12, 2) default 0,
  color text,
  icon text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

-- Create categories table
create table public.categories (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade, -- Null for system defaults
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  color text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Create transactions table
create table public.transactions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  account_id uuid not null references public.accounts on delete cascade,
  category_id uuid references public.categories on delete set null,
  amount decimal(12, 2) not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  date timestamptz not null default now(),
  description text,
  related_transaction_id uuid references public.transactions on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

-- Create budgets table
create table public.budgets (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  category_id uuid not null references public.categories on delete cascade,
  amount decimal(12, 2) not null,
  period text not null check (period in ('monthly', 'weekly')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Create Policies
-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Accounts
create policy "Users can view own accounts" on accounts for select using (auth.uid() = user_id);
create policy "Users can insert own accounts" on accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on accounts for delete using (auth.uid() = user_id);

-- Categories
create policy "Users can view own categories and defaults" on categories for select using (auth.uid() = user_id or user_id is null);
create policy "Users can insert own categories" on categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on categories for delete using (auth.uid() = user_id);

-- Transactions
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Budgets
create policy "Users can view own budgets" on budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on budgets for delete using (auth.uid() = user_id);

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
