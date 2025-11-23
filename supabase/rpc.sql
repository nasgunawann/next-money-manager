-- Function to increment/decrement account balance
create or replace function increment_balance(account_id uuid, amount decimal)
returns void
language plpgsql
security definer
as $$
begin
  update public.accounts
  set balance = balance + amount
  where id = account_id;
end;
$$;
