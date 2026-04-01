/*
  Warnings:

  - You are about to drop the `medicalrecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `medicalrecord`;

-- CreateTable
CREATE TABLE `ConsultationRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointment_id` INTEGER NOT NULL,
    `doctor_id` INTEGER NOT NULL,
    `patient_id` INTEGER NOT NULL,
    `diagnosis` VARCHAR(191) NOT NULL,
    `prescription` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
