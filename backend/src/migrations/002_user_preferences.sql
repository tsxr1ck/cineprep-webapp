-- Create user_preferences table
create table public.user_preferences (
  user_id uuid not null,
  default_language character varying(5) null default 'es'::character varying,
  default_detail_level character varying(20) null default 'standard'::character varying,
  default_tone character varying(20) null default 'engaging'::character varying,
  preferred_voice_id character varying(100) null,
  auto_generate_audio boolean null default false,
  theme character varying(20) null default 'dark'::character varying,
  email_notifications boolean null default true,
  new_features_newsletter boolean null default true,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint user_preferences_pkey primary key (user_id),
  constraint user_preferences_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Enable RLS for user_preferences
alter table public.user_preferences enable row level security;

-- Create policy to allow users to access their own preferences
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);
