-- Up Migration
CREATE TABLE organisations (
   id serial4 NOT NULL,
   "name" varchar(100) NOT NULL,
   created_at_utc timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT organisations_name_key UNIQUE (name),
   CONSTRAINT organisations_pkey PRIMARY KEY (id)
);

CREATE TABLE users (
   id serial4 NOT NULL,
   "name" varchar(100) NOT NULL,
   email varchar(100) NOT NULL,
   created_at_utc timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
   is_admin bool NULL DEFAULT false,
   rota_order int2 NULL DEFAULT 0,
   organisation_id serial4 NOT NULL,
   CONSTRAINT users_email_key UNIQUE (email),
   CONSTRAINT users_pkey PRIMARY KEY (id),
   CONSTRAINT users_organisation_fk FOREIGN KEY (organisation_id) REFERENCES organisations(id)
);

CREATE TABLE tasks (
   id serial4 NOT NULL,
   title varchar(100) NOT NULL,
   frequency int2 NULL,
   organisation_id serial4 NOT NULL,
   CONSTRAINT tasks_pk PRIMARY KEY (id),
   CONSTRAINT tasks_organisation_fk FOREIGN KEY (organisation_id) REFERENCES organisations(id)
);

CREATE TABLE assignments (
   id serial4 NOT NULL,
   task_id serial4 NOT NULL,
   assigned_to_user_id serial4 NOT NULL,
   due_by_utc timestamptz NULL,
   assigned_by_user_id serial4 NOT NULL,
   assigned_on_utc timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
   times_left int2 NOT NULL DEFAULT 1,
   CONSTRAINT assignments_pk PRIMARY KEY (id),
   CONSTRAINT assignments_tasks_fk FOREIGN KEY (task_id) REFERENCES tasks(id),
   CONSTRAINT assignments_users_fk FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
   CONSTRAINT assignments_users_after_fk FOREIGN KEY (assigned_by_user_id) REFERENCES users(id)
);
-- Down Migration
DROP TABLE public.assignments;
DROP TABLE public.tasks;
DROP TABLE public.users;
DROP TABLE public.organisations;
