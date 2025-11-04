-- Add dead hand columns to capsules table
alter table capsules
  add column if not exists dead_hand_trigger_date timestamp,
  add column if not exists dead_hand_recipients text[],
  add column if not exists dead_hand_status text,
  add column if not exists owner_email text,
  add column if not exists warning_sent_at timestamp;

-- Create index for efficient dead hand queries
create index if not exists idx_capsules_dead_hand_trigger 
  on capsules(dead_hand_trigger_date) 
  where dead_hand_trigger_date is not null;

create index if not exists idx_capsules_dead_hand_status 
  on capsules(dead_hand_status) 
  where dead_hand_status is not null;
