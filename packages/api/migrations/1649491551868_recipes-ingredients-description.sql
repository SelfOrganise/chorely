-- Up Migration
ALTER TABLE recipe_ingredients ADD description varchar NULL;

-- Down Migration
ALTER TABLE recipe_ingredients DROP COLUMN description;
