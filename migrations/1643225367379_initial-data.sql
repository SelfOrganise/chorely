-- Up Migration
insert into postgres.public.organisations(name, created_at_utc)
values ('Homely home', CURRENT_TIMESTAMP);

insert into postgres.public.tasks( title, frequency, preferred_time, organisation_id)
values ('🚮 Take out bins',          null, null, 1), -- 1
       ('🍽️ Wash loose dishes',      null, null, 1), -- 2
       ('🍳 Tidy after cooking',     null, null, 1), -- 3
       ('🧺 Washy clothes',         null, null, 1), -- 4
       ('✨ Wipe surfaces',          null, null, 1), -- 5
       ('🍽️ Start dishwasher',       null, null, 1), -- 6
       ('💩 Clean morning truffles', 24,   9,    1), -- 7
       ('🍽️ Empty the dishwasher',   null, null, 1), -- 8
       ('🧹 Hoover bedroom',        168,  21,   1), -- 9
       ('😷 Empty hoover',           null, null, 1), -- 10
       ('🛌️ Make bed',               24,   10,   1), -- 11
       ('🌊 Refill bun-bun water',   null, null, 1), -- 12
       ('🐰 Brushy brushy bunnies',  168,  21,   1), -- 13
       ('🐇 Clean litter trays',     96,   21,   1), -- 14
       ('🌾 Refill hay hay hay',     null, null, 1), -- 15
       ('🚽 Empty bathroom bin',     null, null, 1), -- 16
       ('🧹 Hoover around house',   72,   21,   1); -- 17

insert into postgres.public.users(name, email, created_at_utc, is_admin, rota_order, organisation_id)
values ('User1', 'replace1@gmail.com', CURRENT_TIMESTAMP, true, 0, 1),
       ('User2', 'replace2@gmail.com', CURRENT_TIMESTAMP, true, 1, 1);

insert into postgres.public.assignments(task_id, assigned_to_user_id, due_by_utc, assigned_by_user_id, assigned_at_utc)
values (1, 1, null, null, current_timestamp),
       (2, 2, null, null, current_timestamp),
       (3, 2, null, null, current_timestamp),
       (4, 1, null, null, current_timestamp),
       (5, 1, null, null, current_timestamp),
       (6, 1, null, null, current_timestamp),
       (7, 2, null, null, current_timestamp),
       (8, 2, null, null, current_timestamp),
       (9, 2, null, null, current_timestamp),
       (10, 1, null, null, current_timestamp),
       (11, 2, null, null, current_timestamp),
       (12, 1, null, null, current_timestamp),
       (13, 2, null, null, current_timestamp),
       (14, 1, null, null, current_timestamp),
       (15, 1, null, null, current_timestamp),
       (16, 1, null, null, current_timestamp),
       (17, 2, null, null, current_timestamp);
-- Down Migration
