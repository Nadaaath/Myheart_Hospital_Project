-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: myheart_auth
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `myheart_auth`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `myheart_auth` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `myheart_auth`;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('26b84658-19b9-41f9-afa8-df663ae1aad6','7e7cf22ebca35c3253f821ca507d22724569733e4ed17f17e099410755efc713','2026-03-07 01:31:44.944','20260307013144_remove_reference_required',NULL,NULL,'2026-03-07 01:31:44.899',1),('2ca238b1-3372-43a1-b5b6-e478bb13a351','93f1667bb9f1b5ad9f5cc41be340e5b6f86c3626782a5282a26ae46da5a7abc5','2026-03-07 00:54:11.642','20260307005411_init',NULL,NULL,'2026-03-07 00:54:11.623',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `useraccount`
--

DROP TABLE IF EXISTS `useraccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `useraccount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','DOCTOR','PATIENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserAccount_email_key` (`email`),
  UNIQUE KEY `UserAccount_role_reference_id_key` (`role`,`reference_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `useraccount`
--

LOCK TABLES `useraccount` WRITE;
/*!40000 ALTER TABLE `useraccount` DISABLE KEYS */;
INSERT INTO `useraccount` VALUES (4,'admin@hospital.com','$2b$10$K5ER7.bv6wR4ltiJ9UjdH.gJIhbjUprL.PkMrlnW4rMJ3bOOysEke','ADMIN',NULL,'2026-03-07 02:08:14.857'),(5,'amel.benali@hopital.com','$2b$10$/oV01aE68P.fksEqQNfPi.Sp2DXVNdp0GxOAwkqp6gdLIjjjiXP5y','DOCTOR',3,'2026-03-19 15:42:21.057'),(6,'nadia.toumi@hopital.com','$2b$10$KpHCKJ/1BvbJaGgsz0XQIeEvq.SZrpaKTGvfVQW/Pwl1I/N/YW8Ty','DOCTOR',4,'2026-03-19 15:43:41.420'),(7,'mehdi.kaci@hopital.com','$2b$10$xHOPD5DBWvXTd6fyDW7AReGjJD7IRp2dr0xXtvJDb6LNbjQ03c2Eq','DOCTOR',5,'2026-03-19 15:44:03.972'),(8,'sophie.moreau@hopital.com','$2b$10$5z4s2L6VkDtJv0UfkVnnyuS4kPtbLlJeEv/C0lxjLI3kZEMXW6A5W','DOCTOR',6,'2026-03-19 15:44:32.979'),(9,'karim.bensalem@hopital.com','$2b$10$/XeQ3gpJGFhIsg8RCoibNe8eM5Z5Y1rJtam61mY3T5b0f5qrgnuRG','DOCTOR',7,'2026-03-19 15:44:51.647'),(10,'Douae.saber@hopital.com','$2b$10$9AWq.m6a.IVekUsL0Duw7.O8uENDCN6u2HVgdHFXu3Tj6iuuWRMKu','DOCTOR',8,'2026-03-19 15:47:13.700'),(11,'samir.ziani@hopital.com','$2b$10$C5dfgiYMoofFG7B/zOwgwucE32tjy5qgUseoJO6XEF7wkyjnEwF7K','DOCTOR',9,'2026-03-19 15:49:12.734'),(12,'fatima.alaoui@hopital.com','$2b$10$.Lb6wwGP9w.iRn604GfhyuUxN5vuVottjMX/Sx/.TX7W6R9f6TcTy','DOCTOR',10,'2026-03-19 15:49:49.169'),(13,'salima.haddad@hopital.com','$2b$10$6uEM.tvwj4YA8HfsyFBY2.LnEVUtZ1p7piBDV2l91qpY2y86EebbC','DOCTOR',11,'2026-03-19 15:50:52.779'),(21,'amel.bouaziz@email.com','$2b$10$a5toLRIFOE/8KJ2awniYJuoy0lCe5vEn2AiW3X1J.Y1LPeSr0TjWi','PATIENT',2,'2026-03-22 19:15:46.642'),(22,'sofiane.benmoussa@email.com','$2b$10$uk9JhhFHqy/Byk10SZ9NfOWnoYhsnj5QHad6x1haNt.ZUymENwii6','PATIENT',3,'2026-03-22 19:17:37.247'),(23,'nadia.taleb@email.com','$2b$10$/rAJ5Ln7EA2rqYiHBCybkOmkgwkZzHY3a0MWGz5YLiztapAVnQGka','PATIENT',4,'2026-03-22 19:17:50.859'),(24,'leila.guerfi@email.com','$2b$10$khD6CmkYJuY2E1OdN5mBFuWJPdj8zlSTk.lu1wOF2BB//vFh1Mgfy','PATIENT',5,'2026-03-22 19:18:08.461'),(25,'samia.cherif@email.com','$2b$10$xKwF4jQM0/SYnIc2wyu/huHmG2YKAtC3dcFUlke.Q6XetvOhA8TZG','PATIENT',6,'2026-03-22 19:18:25.460'),(26,'rachid.ouali@email.com','$2b$10$KNj0IoYEnwmOICgKKgAheOc1nx.cnPVY/ULvZCPQPIyV50YFrcTn2','PATIENT',7,'2026-03-22 19:18:39.154');
/*!40000 ALTER TABLE `useraccount` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-01 22:26:16
