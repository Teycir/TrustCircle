create table capsules (
  id uuid primary key default gen_random_uuid(),
  creator_pubkey text not null,
  approver_pubkey text not null,
  title text,
  notes text,
  payload_cid text not null,
  metadata jsonb not null,
  status text default 'locked',
  created_at timestamp default now(),
  unlocked_at timestamp
);

create index idx_capsules_creator on capsules(creator_pubkey);
create index idx_capsules_approver on capsules(approver_pubkey);
