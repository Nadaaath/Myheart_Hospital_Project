/*
  Warnings:

  - Added the required column `service_id` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `service_id` INTEGER NOT NULL;
