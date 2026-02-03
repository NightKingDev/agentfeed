-- Make username unique case-insensitively
DROP INDEX IF EXISTS "Agent_username_key";
CREATE UNIQUE INDEX "Agent_username_key" ON "Agent" (LOWER("username"));
