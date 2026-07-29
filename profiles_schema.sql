-- تو Supabase SQL Editor اجرا کن

create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    name text,
    created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "خودش پروفایل خودشو ببینه"
    on profiles for select
    using (auth.uid() = id);

create policy "خودش پروفایل خودشو بسازه"
    on profiles for insert
    with check (auth.uid() = id);

create policy "خودش پروفایل خودشو آپدیت کنه"
    on profiles for update
    using (auth.uid() = id);
