create or replace function public.seed_demo_data(p_user_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare c_id uuid; ct_id uuid; i integer; j integer;
begin
  if p_user_id <> auth.uid() then raise exception '只能为当前用户创建演示数据'; end if;
  for i in 1..20 loop
    insert into customers(user_id,customer_name,industry,address,contact_name,phone,owner,status,first_cooperation_date,next_service_date,health_score)
    values(p_user_id,'演示客户 '||lpad(i::text,2,'0'),case when i%3=0 then '酒店' when i%3=1 then '商业综合体' else '写字楼' end,'浙江省杭州市演示地址 '||i||' 号','联系人'||i,'1380000'||lpad(i::text,4,'0'),case when i%2=0 then '刘科元' else '周敏' end,'normal',current_date-(i*80),case when i%4=0 then current_date-10 else current_date+30+(i%5)*20 end,case when i%4=0 then 58 when i%5=0 then 72 else 92 end)
    returning id into c_id;
    insert into contracts(user_id,customer_id,contract_type,start_date,end_date,amount,service_cycle,total_service_count,completed_service_count,renew_status)
    values(p_user_id,c_id,'年度维保',current_date-300,case when i%4=0 then current_date+30 else current_date+300 end,50000+i*5000,'季度',4,case when i%4=0 then 2 else 3 end,case when i%4=0 then '待续约' else '履约中' end) returning id into ct_id;
    insert into payments(user_id,customer_id,contract_id,total_amount,paid_amount,payment_method,payment_date)
    values(p_user_id,c_id,ct_id,50000+i*5000,case when i%5=0 then 30000+i*3000 else 50000+i*5000 end,'银行转账',current_date-45);
    for j in 1..2 loop insert into equipment(user_id,customer_id,device_name,device_model,quantity,install_date,status) values(p_user_id,c_id,'商用香氛机',case when j=1 then 'KX-A500' else 'KX-S120' end,1,current_date-300,'正常'); end loop;
    if i<=10 then insert into equipment(user_id,customer_id,device_name,device_model,quantity,install_date,status) values(p_user_id,c_id,'客房香氛机','KX-R80',1,current_date-260,'正常'); end if;
    for j in 1..5 loop insert into service_records(user_id,customer_id,service_date,service_person,service_type,service_content,oil_model,oil_quantity,photo,remark) values(p_user_id,c_id,current_date-(j*55+i),'工程师'||((i+j)%4+1),'季度维保','设备清洁、雾化检测与精油补充',case when j%2=0 then '白茶' else '雪松' end,2,'','演示服务记录'); end loop;
  end loop;
end; $$;
grant execute on function public.seed_demo_data(uuid) to authenticated;
