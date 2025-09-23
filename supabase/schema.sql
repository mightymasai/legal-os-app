create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor','viewer')),
  primary key (workspace_id, user_id)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null default 'Untitled',
  initial_content jsonb,
  created_by uuid references auth.users(id),
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete set null,
  anchor jsonb not null,
  body text not null,
  resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists public.document_versions (
  id bigserial primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  ydoc_state bytea not null,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- Enable row level security on tables
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.documents enable row level security;
alter table public.comments enable row level security;
alter table public.document_versions enable row level security;

-- Policies
create policy "workspace member can see documents"
on public.documents for select using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = documents.workspace_id and wm.user_id = auth.uid()
  )
);

create policy "workspace member can read comments"
on public.comments for select using (
  exists (
    select 1 from public.documents d
    join public.workspace_members wm on wm.workspace_id = d.workspace_id
    where d.id = comments.document_id and wm.user_id = auth.uid()
  )
);
