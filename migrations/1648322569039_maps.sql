-- Up Migration
CREATE TABLE maps (
   id serial4 NOT NULL,
   "data" TEXT NOT NULL,
   organisation_id serial4 NOT NULL,
   created_at_utc timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT maps_pkey PRIMARY KEY (id),
   CONSTRAINT maps_organisation_fk FOREIGN KEY (organisation_id) REFERENCES organisations(id)
);


-- Down Migration
DROP table maps;
