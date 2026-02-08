/*
  Warnings:

  - You are about to drop the column `email` on the `ProjectInvite` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `ProjectInvite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `ProjectInvite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `ProjectInvite` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProjectInvite_token_key";

-- AlterTable
ALTER TABLE "ProjectInvite" DROP COLUMN "email",
DROP COLUMN "token",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvite_code_key" ON "ProjectInvite"("code");
