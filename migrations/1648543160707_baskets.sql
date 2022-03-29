-- Up Migration
CREATE TABLE baskets (
   id serial4 NOT NULL,
   organisation_id serial4 NOT NULL,
   created_at_utc timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CONSTRAINT baskets_pkey PRIMARY KEY (id),
   CONSTRAINT baskets_organisation_fk FOREIGN KEY (organisation_id) REFERENCES organisations(id)
);

CREATE TABLE basket_items (
   id serial4 NOT NULL,
   basket_id serial4 NOT NULL,
   grocery_id serial4 NOT NULL,
   CONSTRAINT baskets_items_pkey PRIMARY KEY (id),
   CONSTRAINT basket_items_fk FOREIGN KEY (basket_id) REFERENCES baskets(id),
   CONSTRAINT basket_item_groceries_fk FOREIGN KEY (grocery_id) REFERENCES groceries(id)
);

-- Down Migration
drop table basket_items;
drop table baskets;
