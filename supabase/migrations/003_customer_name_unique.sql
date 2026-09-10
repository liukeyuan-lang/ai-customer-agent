create unique index if not exists customers_user_id_customer_name_key
  on public.customers(user_id, customer_name);
