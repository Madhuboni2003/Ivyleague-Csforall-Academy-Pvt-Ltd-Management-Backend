/*
  Warnings:

  - You are about to alter the column `status` on the `tickets` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(9))`.

*/
-- AlterTable
ALTER TABLE `tickets` MODIFY `status` ENUM('OPEN', 'IN_PROGRESS', 'AWAITING_LEARNER', 'ESCALATED', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN';
