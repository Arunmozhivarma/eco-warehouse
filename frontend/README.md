# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d9ac1446-5b6b-47ee-8c30-edc80358b63d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d9ac1446-5b6b-47ee-8c30-edc80358b63d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d9ac1446-5b6b-47ee-8c30-edc80358b63d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Supabase Setup

1. Create a `.env` file in the `frontend` directory with the following content:

```
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

Replace the values with your actual Supabase project credentials.

2. Make sure your Supabase database has the following tables and views (see below for schema).

### Required Supabase Database Schema

```
-- Users Table
create table users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password_hash text not null,
  role text not null check (role in ('manager', 'worker'))
);

-- Departments Table
create table departments (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null
);

-- Items Table
create table items (
  id uuid primary key default uuid_generate_v4(),
  weight float not null,
  drop_zone_x integer not null,
  drop_zone_y integer not null,
  aisle text not null,
  department_id uuid references departments(id),
  delivered boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Deliveries Table
create table deliveries (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id),
  delivered_by uuid references users(id),
  delivered_at timestamp with time zone default now(),
  energy_used float not null,
  department_id uuid references departments(id)
);

-- Department Efficiency View
create view department_efficiency as
select
  d.id as department_id,
  d.name as department_name,
  avg(del.energy_used) as avg_energy_used,
  count(del.id) as total_deliveries
from departments d
left join deliveries del on del.department_id = d.id
group by d.id, d.name;

-- Example RPC for monthly energy savings (Postgres function)
create or replace function monthly_energy_savings()
returns table(month text, saved float) as $$
begin
  return query
    select to_char(date_trunc('month', delivered_at), 'Mon') as month, sum(energy_used) as saved
    from deliveries
    group by 1
    order by min(date_trunc('month', delivered_at));
end;
$$ language plpgsql;

-- Example RPC for today's energy and deliveries
create or replace function today_energy_and_deliveries()
returns table(energy_saved float, deliveries int) as $$
begin
  return query
    select coalesce(sum(energy_used),0), count(*)
    from deliveries
    where delivered_at::date = current_date;
end;
$$ language plpgsql;

-- Example RPC for worker leaderboard
create or replace function worker_leaderboard()
returns table(name text, energySaved float, deliveries int, efficiency float) as $$
begin
  return query
    select u.username, sum(d.energy_used), count(d.id), avg(d.energy_used)
    from users u
    join deliveries d on d.delivered_by = u.id
    group by u.username
    order by sum(d.energy_used) desc;
end;
$$ language plpgsql;

### User-Specific Analytics Functions (for Worker Dashboard)

```
-- Today's energy and deliveries for a user
create or replace function today_energy_and_deliveries_by_user(username text)
returns table(energy_saved float, deliveries int, efficiency float, co2_reduced float) as $$
begin
  return query
    select coalesce(sum(d.energy_used),0), count(*), avg(d.energy_used), coalesce(sum(d.energy_used) * 0.014, 0)
    from deliveries d
    join users u on d.delivered_by = u.id
    where u.username = username and d.delivered_at::date = current_date;
end;
$$ language plpgsql;

-- Daily energy savings for the last 7 days for a user
create or replace function daily_energy_savings_by_user(username text)
returns table(day text, saved float, target float) as $$
begin
  return query
    select to_char(d.delivered_at, 'Dy') as day, sum(d.energy_used), 50
    from deliveries d
    join users u on d.delivered_by = u.id
    where u.username = username and d.delivered_at >= current_date - interval '6 days'
    group by 1
    order by min(d.delivered_at);
end;
$$ language plpgsql;

-- Weekly progress for a user (last 4 weeks)
create or replace function weekly_progress_by_user(username text)
returns table(week text, efficiency float, deliveries int) as $$
begin
  return query
    select to_char(date_trunc('week', d.delivered_at), '"Week" IW'), avg(d.energy_used), count(*)
    from deliveries d
    join users u on d.delivered_by = u.id
    where u.username = username and d.delivered_at >= current_date - interval '28 days'
    group by 1
    order by min(date_trunc('week', d.delivered_at));
end;
$$ language plpgsql;

-- Total weekly energy for a user (current week)
create or replace function total_weekly_energy_by_user(username text)
returns table(total float) as $$
begin
  return query
    select coalesce(sum(d.energy_used),0)
    from deliveries d
    join users u on d.delivered_by = u.id
    where u.username = username and date_trunc('week', d.delivered_at) = date_trunc('week', current_date);
end;
$$ language plpgsql;
```
