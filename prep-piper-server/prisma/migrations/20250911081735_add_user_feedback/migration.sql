-- CreateTable
CREATE TABLE "public"."user_feedback" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_feedback_userId_key" ON "public"."user_feedback"("userId");

-- AddForeignKey
ALTER TABLE "public"."user_feedback" ADD CONSTRAINT "user_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
