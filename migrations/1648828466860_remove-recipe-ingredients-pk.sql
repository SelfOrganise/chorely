-- Up Migration
ALTER TABLE recipe_ingredients DROP CONSTRAINT recipe_ingredients_pkey;
CREATE INDEX recipe_ingredients_recipe_id_idx ON recipe_ingredients (recipe_id,grocery_id);

-- Down Migration
DROP INDEX recipe_ingredients_recipe_id_idx;
ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (recipe_id,grocery_id);

