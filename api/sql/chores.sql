create table if not exists chores
(
    id                    serial,
    title                 text                                               not null,
    description           text,
    frequency             smallint,
    "completionSemaphore" integer                  default '-1'::integer     not null,
    "modifiedOnUTC"       timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint chores_pk
        primary key (id)
);

create unique index if not exists chores_id_uindex
    on chores (id);


