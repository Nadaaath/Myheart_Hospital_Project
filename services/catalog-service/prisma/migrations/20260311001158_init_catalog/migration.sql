/*
  Warnings:

  - You are about to drop the column `created_at` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `service` DROP COLUMN `created_at`,
    DROP COLUMN `type`,
    ADD COLUMN `description` VARCHAR(191) NULL;
