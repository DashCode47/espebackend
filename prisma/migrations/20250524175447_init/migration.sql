/*
  Warnings:

  - The values [LOST_FOUND] on the enum `PostType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActive` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user1Id,user2Id]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostType_new" AS ENUM ('CONFESSION', 'MARKETPLACE', 'LOST_AND_FOUND');
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "PostType_new" USING ("type"::text::"PostType_new");
ALTER TYPE "PostType" RENAME TO "PostType_old";
ALTER TYPE "PostType_new" RENAME TO "PostType";
DROP TYPE "PostType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "interests" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Match_user1Id_user2Id_key" ON "Match"("user1Id", "user2Id");
