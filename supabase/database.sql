-- Create a table for public profiles
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
    on profiles for select
    using ( true );

create policy "Users can insert their own profile."
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update their own profile."
    on profiles for update
    using ( auth.uid() = id );

-- Create indexes
create index profiles_email_idx on profiles (email);

-- Set up Realtime
alter publication supabase_realtime add table profiles; 