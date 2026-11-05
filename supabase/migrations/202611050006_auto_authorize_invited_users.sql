-- Treat the Supabase invitation itself as approval for content management.
-- This applies only to users whose auth.users record has invited_at set;
-- ordinary email sign-ups are not authorised by this trigger.

create or replace function public.authorize_invited_content_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.invited_at is not null then
    insert into public.content_admins (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.authorize_invited_content_user() from public;

drop trigger if exists authorize_invited_content_user on auth.users;
create trigger authorize_invited_content_user
after insert on auth.users
for each row execute function public.authorize_invited_content_user();

-- Authorise invitations that were sent before this trigger was installed.
insert into public.content_admins (user_id)
select id
from auth.users
where invited_at is not null
on conflict (user_id) do nothing;
