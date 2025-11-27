-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- Step 1: Create a default conversation for each user who has messages
INSERT INTO "conversations" ("id", "user_id", "title", "created_at", "updated_at")
SELECT 
    gen_random_uuid(),
    "user_id",
    'Chat History',
    MIN("created_at"),
    MAX("created_at")
FROM "messages"
GROUP BY "user_id";

-- Step 2: Add conversation_id column (nullable first)
ALTER TABLE "messages" ADD COLUMN "conversation_id" TEXT;

-- Step 3: Update existing messages to link to their user's conversation
UPDATE "messages" m
SET "conversation_id" = c."id"
FROM "conversations" c
WHERE m."user_id" = c."user_id";

-- Step 4: Make conversation_id NOT NULL
ALTER TABLE "messages" ALTER COLUMN "conversation_id" SET NOT NULL;

-- Step 5: Drop the old user_id column from messages
ALTER TABLE "messages" DROP COLUMN "user_id";

-- CreateIndex
CREATE INDEX "conversations_user_id_idx" ON "conversations"("user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;