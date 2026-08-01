-- Kjør dette i Supabase: Project -> SQL Editor -> New query -> lim inn -> Run

create table if not exists scores (
  id uuid default gen_random_uuid() primary key,
  nickname text not null check (char_length(nickname) between 1 and 24),
  difficulty text not null check (difficulty in ('lett', 'middels', 'vanskelig')),
  time_seconds numeric not null check (time_seconds > 0),
  mistakes integer not null default 0,
  created_at timestamptz default now()
);

alter table scores enable row level security;

-- Alle kan lese topplisten
create policy "Alle kan lese topplisten"
  on scores for select
  using (true);

-- Alle kan legge til sin egen tid (ingen innlogging kreves)
create policy "Alle kan lagre en tid"
  on scores for insert
  with check (true);

-- Merk: siden dette er en enkel, åpen løsning uten innlogging, kan i teorien
-- noen sende inn en falsk (urealistisk lav) tid direkte mot databasen.
-- Fint for en intern/uformell topplista blant kollegaer. Si ifra hvis dere
-- trenger sterkere juks-sikring senere (f.eks. innlogging), så bygger vi det inn.
