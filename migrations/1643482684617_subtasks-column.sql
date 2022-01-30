ALTER TABLE tasks ADD subtasks varchar[] NULL;

UPDATE public.tasks
SET subtasks='{"Take out the bins","Replace bag(s)"}'
WHERE id=1;

UPDATE tasks
SET subtasks='{"Load washing machine","Unload and place on drying rack","Collect dried clothes and leave on bedroom bed"}'
WHERE id=4;

UPDATE tasks
SET subtasks='{"Empty dishwasher","Clear drying rack too"}'
WHERE id=8;

UPDATE tasks
SET subtasks='{"Clean trays","Disinfect with boiling water & bleach","Use antibacterial spray","Take trash to the bin","Hoover around the bins","Put cleaning supplies back"}'
WHERE id=14;

UPDATE tasks
SET subtasks='{"Empty bin ","Replace bag"}'
WHERE id=16;

UPDATE tasks
SET subtasks='{"Living room","Bathroom","Corridor"}'
WHERE id=17;
-- Up Migration

-- Down Migration
