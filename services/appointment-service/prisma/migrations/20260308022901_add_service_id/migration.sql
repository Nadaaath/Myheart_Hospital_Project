/*
  Warnings:

  - Added the required column `service_id` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `appointment` ADD COLUMN `service_id` INTEGER NOT NULL;
