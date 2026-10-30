-- DANI CREATOR: banco compartilhado com edição por qualquer pessoa que tenha o link.
-- ATENÇÃO: este modo é público. Qualquer pessoa com acesso ao app pode criar, editar e excluir projetos.
create table if not exists public.creator_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text default 'Geral',
  cover_url text,
  image_prompts jsonb not null default '["","",""]'::jsonb,
  video_prompts jsonb not null default '["","",""]'::jsonb,
  text_prompts jsonb not null default '["","",""]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.creator_projects enable row level security;
drop policy if exists "Public can read DANI CREATOR projects" on public.creator_projects;
create policy "Public can read DANI CREATOR projects" on public.creator_projects for select to anon, authenticated using (true);
drop policy if exists "Public can insert DANI CREATOR projects" on public.creator_projects;
create policy "Public can insert DANI CREATOR projects" on public.creator_projects for insert to anon, authenticated with check (true);
drop policy if exists "Public can update DANI CREATOR projects" on public.creator_projects;
create policy "Public can update DANI CREATOR projects" on public.creator_projects for update to anon, authenticated using (true) with check (true);
drop policy if exists "Public can delete DANI CREATOR projects" on public.creator_projects;
create policy "Public can delete DANI CREATOR projects" on public.creator_projects for delete to anon, authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dani-media', 'dani-media', true, 52428800, array['image/*','video/*'])
on conflict (id) do update set public = true;
drop policy if exists "Public can view DANI media" on storage.objects;
create policy "Public can view DANI media" on storage.objects for select to anon, authenticated using (bucket_id = 'dani-media');
drop policy if exists "Public can upload DANI media" on storage.objects;
create policy "Public can upload DANI media" on storage.objects for insert to anon, authenticated with check (bucket_id = 'dani-media');
drop policy if exists "Public can update DANI media" on storage.objects;
create policy "Public can update DANI media" on storage.objects for update to anon, authenticated using (bucket_id = 'dani-media') with check (bucket_id = 'dani-media');
drop policy if exists "Public can delete DANI media" on storage.objects;
create policy "Public can delete DANI media" on storage.objects for delete to anon, authenticated using (bucket_id = 'dani-media');
