create table history
(
    id               serial,
    "choreId"        integer                                            not null,
    "completedById"  integer                                            not null,
    "completedOnUTC" timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint history_pk
        primary key (id),
    constraint history_chores_id_fk
        foreign key ("choreId") references chores
            on delete cascade
);

create unique index history_id_uindex
    on history (id);


