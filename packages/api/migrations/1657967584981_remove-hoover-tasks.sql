-- Up Migration
ALTER TABLE public.assignments DROP CONSTRAINT assignments_tasks_fk;
ALTER TABLE public.assignments ADD CONSTRAINT assignments_tasks_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET DEFAULT;

delete from tasks t
where t.title like '%Hoover around house%' or t.title like '%Hoover bedroom%'

-- Down Migration
insert into tasks( title, frequency, preferred_time, organisation_id, subtasks)
values ('🧹 Hoover bedroom',        168,  21,   1, null),
       ('🧹 Hoover around house',   72,   21,   1, '{"Living room","Bathroom","Corridor"}');

insert into assignments(task_id, assigned_to_user_id, due_by_utc, assigned_by_user_id, assigned_at_utc)
values ((select id from tasks t where t.title like '%Hoover around house%'), 1, null, null, current_timestamp),
       ((select id from tasks t where t.title like '%Hoover bedroom%'), 1, null, null, current_timestamp);

