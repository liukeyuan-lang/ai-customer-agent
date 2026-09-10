create or replace function public.import_customers(items jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  inserted_count integer;
begin
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception '导入数据不能为空' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(items) item
    where nullif(trim(item->>'customer_name'), '') is null
  ) then
    raise exception '客户名称不能为空' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(items) item
    group by trim(item->>'customer_name') having count(*) > 1
  ) then
    raise exception '导入文件存在重复客户名称' using errcode = '23505';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(items) item
    join customers customer on customer.user_id = auth.uid()
      and customer.customer_name = trim(item->>'customer_name')
  ) then
    raise exception '客户已存在，请移除重复记录后重试' using errcode = '23505';
  end if;

  insert into customers (
    user_id, customer_name, industry, address, contact_name, phone, owner,
    status, first_cooperation_date, next_service_date, health_score
  )
  select
    auth.uid(), trim(item->>'customer_name'), coalesce(item->>'industry', ''),
    coalesce(item->>'address', ''), coalesce(item->>'contact_name', ''),
    coalesce(item->>'phone', ''), coalesce(item->>'owner', ''),
    coalesce(nullif(item->>'status', ''), 'normal'),
    nullif(item->>'first_cooperation_date', '')::date,
    nullif(item->>'next_service_date', '')::date,
    coalesce((item->>'health_score')::integer, 100)
  from jsonb_array_elements(items) item;

  get diagnostics inserted_count = row_count;
  return jsonb_build_object('success', inserted_count);
end;
$$;

revoke execute on function public.import_customers(jsonb) from public, anon;
grant execute on function public.import_customers(jsonb) to authenticated;
