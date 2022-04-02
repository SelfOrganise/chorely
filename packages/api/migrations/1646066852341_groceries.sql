-- Up Migration
CREATE TABLE groceries (
   id serial4 NOT NULL,
   "name" varchar(100) NOT NULL,
   created_at_utc timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
   organisation_id serial4 NOT NULL,
   CONSTRAINT groceries_pkey PRIMARY KEY (id),
   CONSTRAINT groceries_organisation_fk FOREIGN KEY (organisation_id) REFERENCES organisations(id)
);

CREATE TABLE recipes (
   id serial4 NOT NULL,
   "name" varchar(100) NOT NULL,
   created_at_utc timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
   organisation_id serial4 NOT NULL,
   CONSTRAINT recipes_pkey PRIMARY KEY (id),
   CONSTRAINT recipes_organisation_fk FOREIGN KEY (organisation_id) REFERENCES organisations(id)
);

create table recipe_ingredients (
   recipe_id serial4 NOT NULL,
   grocery_id serial4 NOT NULL,
   CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (recipe_id, grocery_id),
   CONSTRAINT recipe_ingredients_recipe_fk FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
   CONSTRAINT recipe_ingredients_groceries_fk FOREIGN KEY (grocery_id) REFERENCES groceries(id)
)

-- Down Migration
drop table public.recipe_ingredients;
drop table public.recipes;
drop table public.groceries;
