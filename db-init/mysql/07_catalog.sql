-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: myheart_catalog
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
-- Current Database: `myheart_catalog`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `myheart_catalog` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `myheart_catalog`;

--
-- Table structure for table `anesthesiarule`
--

DROP TABLE IF EXISTS `anesthesiarule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anesthesiarule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `min_coefficient` double DEFAULT NULL,
  `max_coefficient` double DEFAULT NULL,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `base_coefficient` double NOT NULL,
  `child_majoration` double DEFAULT NULL,
  `elderly_majoration` double DEFAULT NULL,
  `includes_preop_days` int NOT NULL DEFAULT '1',
  `includes_postop_days` int NOT NULL DEFAULT '15',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anesthesiarule`
--

LOCK TABLES `anesthesiarule` WRITE;
/*!40000 ALTER TABLE `anesthesiarule` DISABLE KEYS */;
/*!40000 ALTER TABLE `anesthesiarule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `labtest`
--

DROP TABLE IF EXISTS `labtest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labtest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double NOT NULL,
  `b_coefficient` double DEFAULT NULL,
  `is_ngap` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `conventional_price` double DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `non_conventional_price` double DEFAULT NULL,
  `source` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NGAP',
  PRIMARY KEY (`id`),
  UNIQUE KEY `LabTest_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labtest`
--

LOCK TABLES `labtest` WRITE;
/*!40000 ALTER TABLE `labtest` DISABLE KEYS */;
INSERT INTO `labtest` VALUES (1,'B150','Numération formule sanguine (NFS)','HEMATOLOGY',110,100,1,1,'2026-03-17 21:25:47.708','2026-03-17 21:39:08.445',110,'Hémogramme complet',134,'NGAP'),(2,'B151','Hémoglobine','HEMATOLOGY',22,20,1,1,'2026-03-17 21:25:47.715','2026-03-17 21:39:08.454',22,'Dosage de l\'hémoglobine',26.8,'NGAP'),(3,'B152','Hématocrite','HEMATOLOGY',22,20,1,1,'2026-03-17 21:25:47.719','2026-03-17 21:39:08.458',22,'Mesure de l\'hématocrite',26.8,'NGAP'),(4,'B153','Plaquettes','HEMATOLOGY',33,30,1,1,'2026-03-17 21:25:47.722','2026-03-17 21:39:08.462',33,'Numération des plaquettes',40.2,'NGAP'),(5,'B154','Vitesse de sédimentation (VS)','HEMATOLOGY',33,30,1,1,'2026-03-17 21:25:47.725','2026-03-17 21:39:08.465',33,'Marqueur inflammatoire',40.2,'NGAP'),(6,'B110','Glycémie à jeun','BIOCHEMISTRY',22,20,1,1,'2026-03-17 21:25:47.728','2026-03-17 21:39:08.468',22,'Dosage du glucose sanguin',26.8,'NGAP'),(7,'B111','HbA1c','BIOCHEMISTRY',88,80,1,1,'2026-03-17 21:25:47.732','2026-03-17 21:39:08.471',88,'Hémoglobine glyquée',107.2,'NGAP'),(8,'B170','Créatinine','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.735','2026-03-17 21:39:08.474',33,'Fonction rénale',36.3,'NGAP'),(9,'B171','Urée','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.738','2026-03-17 21:39:08.477',33,'Fonction rénale',36.3,'NGAP'),(10,'B100','Acide urique','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.741','2026-03-17 21:39:08.480',33,'Dosage sanguin de l\'acide urique',40.2,'NGAP'),(11,'B200','ASAT (TGO)','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.744','2026-03-17 21:39:08.483',33,'Enzyme hépatique',36.3,'NGAP'),(12,'B201','ALAT (TGP)','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.747','2026-03-17 21:39:08.486',33,'Enzyme hépatique',36.3,'NGAP'),(13,'B103','Bilirubine totale','BIOCHEMISTRY',77,70,1,1,'2026-03-17 21:25:47.750','2026-03-17 21:39:08.489',77,'Bilirubine totale directe et indirecte',93.8,'NGAP'),(14,'B202','Bilirubine directe','BIOCHEMISTRY',44,40,1,1,'2026-03-17 21:25:47.753','2026-03-17 21:39:08.492',44,'Fraction directe de la bilirubine',53.6,'NGAP'),(15,'B210','Sodium','BIOCHEMISTRY',22,20,1,1,'2026-03-17 21:25:47.756','2026-03-17 21:39:08.496',22,'Ionogramme sanguin - sodium',26.8,'NGAP'),(16,'B211','Potassium','BIOCHEMISTRY',22,20,1,1,'2026-03-17 21:25:47.759','2026-03-17 21:39:08.499',22,'Ionogramme sanguin - potassium',26.8,'NGAP'),(17,'B104','Calcium','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.762','2026-03-17 21:39:08.502',33,'Dosage du calcium',40.2,'NGAP'),(18,'B105','Chlore','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.766','2026-03-17 21:39:08.505',33,'Dosage du chlore',40.2,'NGAP'),(19,'B220','Cholestérol total','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.769','2026-03-17 21:39:08.508',33,'Bilan lipidique',36.3,'NGAP'),(20,'B221','HDL','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.772','2026-03-17 21:39:08.511',33,'Cholestérol HDL',36.3,'NGAP'),(21,'B222','LDL','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.774','2026-03-17 21:39:08.514',33,'Cholestérol LDL',36.3,'NGAP'),(22,'B223','Triglycérides','BIOCHEMISTRY',33,30,1,1,'2026-03-17 21:25:47.778','2026-03-17 21:39:08.517',33,'Triglycérides sanguins',36.3,'NGAP'),(23,'B160','TSH','HORMONES',110,100,1,1,'2026-03-17 21:25:47.780','2026-03-17 21:39:08.521',110,'Hormone thyréostimulante',134,'NGAP'),(24,'B165','T3','HORMONES',330,300,1,1,'2026-03-17 21:25:47.784','2026-03-17 21:39:08.525',330,'Triiodothyronine libre',363,'NGAP'),(25,'B166','T4','HORMONES',330,300,1,1,'2026-03-17 21:25:47.787','2026-03-17 21:39:08.529',330,'Thyroxine libre',363,'NGAP'),(26,'B230','CRP','INFLAMMATION',55,50,1,1,'2026-03-17 21:25:47.790','2026-03-17 21:39:08.533',55,'Protéine C-réactive',60.5,'NGAP'),(27,'B173','pH urinaire','URINE',11,10,1,1,'2026-03-17 21:25:47.793','2026-03-17 21:39:08.537',11,'Mesure du pH des urines',12.1,'NGAP'),(28,'B240','Analyse d\'urine','URINE',55,50,1,1,'2026-03-17 21:25:47.796','2026-03-17 21:39:08.541',55,'Analyse biochimique d\'urine',60.5,'NGAP'),(29,'B241','Protéinurie','URINE',33,30,1,1,'2026-03-17 21:25:47.799','2026-03-17 21:39:08.545',33,'Dosage des protéines urinaires',36.3,'NGAP'),(30,'B194','Test de grossesse','HORMONES',88,80,1,1,'2026-03-17 21:25:47.802','2026-03-17 21:39:08.548',88,'Recherche de grossesse',96.8,'NGAP'),(31,'B250','PSA (Prostate)','HORMONES',110,100,1,1,'2026-03-17 21:25:47.805','2026-03-17 21:39:08.551',110,'Antigène prostatique spécifique',121,'NGAP'),(32,'B251','Ferritine','BIOCHEMISTRY',110,100,1,1,'2026-03-17 21:25:47.809','2026-03-17 21:39:08.554',110,'Dosage de la ferritine',121,'NGAP');
/*!40000 ALTER TABLE `labtest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lettertariff`
--

DROP TABLE IF EXISTS `lettertariff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lettertariff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `letter` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` double NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `LetterTariff_letter_key` (`letter`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lettertariff`
--

LOCK TABLES `lettertariff` WRITE;
/*!40000 ALTER TABLE `lettertariff` DISABLE KEYS */;
INSERT INTO `lettertariff` VALUES (1,'C',40,'Consultation généraliste','2026-03-17 20:05:56.547','2026-03-17 20:05:56.547'),(2,'Cs',60,'Consultation spécialiste','2026-03-17 20:05:56.558','2026-03-17 20:05:56.558'),(3,'CNPSY',60,'Consultation psychiatre','2026-03-17 20:05:56.563','2026-03-17 20:05:56.563'),(4,'V',40,NULL,'2026-03-17 20:05:56.568','2026-03-17 20:05:56.568'),(5,'Vs',60,NULL,'2026-03-17 20:05:56.573','2026-03-17 20:05:56.573'),(6,'VNPSY',60,NULL,'2026-03-17 20:05:56.577','2026-03-17 20:05:56.577'),(7,'K',7.5,'Acte chirurgical','2026-03-17 20:05:56.580','2026-03-17 20:05:56.580'),(8,'KC',7.5,NULL,'2026-03-17 20:05:56.583','2026-03-17 20:05:56.583'),(9,'KE',7.5,'Échographie/Doppler','2026-03-17 20:05:56.585','2026-03-17 20:05:56.585'),(10,'Z',7.5,'Acte de radiologie','2026-03-17 20:05:56.589','2026-03-17 20:05:56.589'),(11,'P',0.9,NULL,'2026-03-17 20:05:56.591','2026-03-17 20:05:56.591'),(12,'D',7.5,NULL,'2026-03-17 20:05:56.595','2026-03-17 20:05:56.595'),(13,'AMM',40,'Séance de kinésithérapie','2026-03-17 20:05:56.597','2026-03-17 20:05:56.597'),(14,'AMY',40,NULL,'2026-03-17 20:05:56.599','2026-03-17 20:05:56.599'),(15,'AMO',40,NULL,'2026-03-17 20:05:56.602','2026-03-17 20:05:56.602'),(16,'AMI',7.5,'Soins infirmiers','2026-03-17 20:05:56.605','2026-03-17 20:05:56.605'),(17,'SF',7.5,NULL,'2026-03-17 20:05:56.608','2026-03-17 20:05:56.608'),(18,'SFI',7.5,NULL,'2026-03-17 20:05:56.611','2026-03-17 20:05:56.611'),(19,'B',1.5,'Acte de biologie','2026-03-17 20:05:56.614','2026-03-17 20:05:56.614');
/*!40000 ALTER TABLE `lettertariff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `majoration`
--

DROP TABLE IF EXISTS `majoration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `majoration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `percentage` double DEFAULT NULL,
  `max_multiplier` double DEFAULT NULL,
  `fixed_amount` double DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `majoration`
--

LOCK TABLES `majoration` WRITE;
/*!40000 ALTER TABLE `majoration` DISABLE KEYS */;
/*!40000 ALTER TABLE `majoration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalservice`
--

DROP TABLE IF EXISTS `medicalservice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicalservice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pricing_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direct_price` double DEFAULT NULL,
  `coefficient` double DEFAULT NULL,
  `letter` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `source` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NGAP',
  `is_bookable` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `MedicalService_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalservice`
--

LOCK TABLES `medicalservice` WRITE;
/*!40000 ALTER TABLE `medicalservice` DISABLE KEYS */;
INSERT INTO `medicalservice` VALUES (1,'A100','Traitement orthopédique - Main, poignet, avant-bras, clavicule, pied, cou-de-pied, péroné','Traitement orthopédique - Main, poignet, avant-bras, clavicule, pied, cou-de-pied, péroné','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.015','2026-03-17 20:13:52.015','NGAP',0),(2,'A101','Traitement orthopédique - Coude, bras, épaule, genou, tibia ou les deux os de la jambe','Traitement orthopédique - Coude, bras, épaule, genou, tibia ou les deux os de la jambe','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,25,'K',1,'2026-03-17 20:13:52.028','2026-03-17 20:13:52.028','NGAP',0),(3,'A102','Traitement orthopédique - Rachis, hanche, cuisse','Traitement orthopédique - Rachis, hanche, cuisse','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,30,'K',1,'2026-03-17 20:13:52.036','2026-03-17 20:13:52.036','NGAP',0),(4,'A103','Traitement orthopédique complet - Mains, styloïdes radiale ou cubitale','Traitement orthopédique complet - Mains, styloïdes radiale ou cubitale','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,20,'K',1,'2026-03-17 20:13:52.042','2026-03-17 20:13:52.042','NGAP',0),(5,'A104','Traitement orthopédique complet - Un os de l\'avant-bras','Traitement orthopédique complet - Un os de l\'avant-bras','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,40,'K',1,'2026-03-17 20:13:52.048','2026-03-17 20:13:52.048','NGAP',0),(6,'A105','Traitement orthopédique complet - Fracture des deux os de l\'avant-bras','Traitement orthopédique complet - Fracture des deux os de l\'avant-bras','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,60,'K',1,'2026-03-17 20:13:52.053','2026-03-17 20:13:52.053','NGAP',0),(7,'A106','Traitement orthopédique complet - Humérus','Traitement orthopédique complet - Humérus','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,40,'K',1,'2026-03-17 20:13:52.057','2026-03-17 20:13:52.057','NGAP',0),(8,'A109','Traitement orthopédique complet - Avant-pied, tarse antérieur','Traitement orthopédique complet - Avant-pied, tarse antérieur','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,20,'K',1,'2026-03-17 20:13:52.061','2026-03-17 20:13:52.061','NGAP',0),(9,'A111','Traitement orthopédique complet - Une malléole','Traitement orthopédique complet - Une malléole','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,20,'K',1,'2026-03-17 20:13:52.065','2026-03-17 20:13:52.065','NGAP',0),(10,'A112','Traitement orthopédique complet - Deux malléoles','Traitement orthopédique complet - Deux malléoles','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,50,'K',1,'2026-03-17 20:13:52.070','2026-03-17 20:13:52.070','NGAP',0),(11,'A115','Traitement orthopédique complet - Fémur','Traitement orthopédique complet - Fémur','Traumatology','TRAUMATOLOGIE','COEFFICIENT',NULL,80,'K',1,'2026-03-17 20:13:52.074','2026-03-17 20:13:52.074','NGAP',0),(12,'C100','Injection sous-cutanée, intradermique','Injection sous-cutanée, intradermique','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,1,'K',1,'2026-03-17 20:13:52.078','2026-03-17 20:13:52.078','NGAP',0),(13,'C101','Injection d\'un sérum d\'origine humaine ou animale selon la méthode de Besredka','Injection d\'un sérum d\'origine humaine ou animale selon la méthode de Besredka','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,5,'K',1,'2026-03-17 20:13:52.083','2026-03-17 20:13:52.083','NGAP',0),(14,'C102','Acupuncture - premières séances','Acupuncture - premières séances','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,6,'K',1,'2026-03-17 20:13:52.087','2026-03-17 20:13:52.087','NGAP',0),(15,'C103','Acupuncture - séances suivantes','Acupuncture - séances suivantes','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,5,'K',1,'2026-03-17 20:13:52.090','2026-03-17 20:13:52.090','NGAP',0),(16,'C104','Traitement d\'hyposensibilisation spécifique','Traitement d\'hyposensibilisation spécifique','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,3,'K',1,'2026-03-17 20:13:52.094','2026-03-17 20:13:52.094','NGAP',0),(17,'C106','Inventaire allergologique - tests cutanés en scarification','Inventaire allergologique - tests cutanés en scarification','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.098','2026-03-17 20:13:52.098','NGAP',0),(18,'C107','Inventaire allergologique - tests en injections intradermiques','Inventaire allergologique - tests en injections intradermiques','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,15,'K',1,'2026-03-17 20:13:52.102','2026-03-17 20:13:52.102','NGAP',0),(19,'C111','Prélèvement simple de peau ou de muqueuse pour examen histologique','Prélèvement simple de peau ou de muqueuse pour examen histologique','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,5,'K',1,'2026-03-17 20:13:52.106','2026-03-17 20:13:52.106','NGAP',0),(20,'C113','Suture secondaire d\'une plaie après avivement','Suture secondaire d\'une plaie après avivement','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.110','2026-03-17 20:13:52.110','NGAP',0),(21,'C121','Ponction d\'abcès ou de ganglion','Ponction d\'abcès ou de ganglion','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,3,'K',1,'2026-03-17 20:13:52.113','2026-03-17 20:13:52.113','NGAP',0),(22,'C122','Incision ou drainage d\'une collection superficielle','Incision ou drainage d\'une collection superficielle','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,5,'K',1,'2026-03-17 20:13:52.117','2026-03-17 20:13:52.117','NGAP',0),(23,'C147','Ablation d\'une verrue','Ablation d\'une verrue','Dermatology','DERMATOLOGIE','COEFFICIENT',NULL,8,'K',1,'2026-03-17 20:13:52.121','2026-03-17 20:13:52.121','NGAP',0),(24,'D216','Fluoroscopie','Fluoroscopie','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.124','2026-03-17 20:13:52.124','NGAP',0),(25,'D217','Rétinographie en couleur','Rétinographie en couleur','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,9,'K',1,'2026-03-17 20:13:52.128','2026-03-17 20:13:52.128','NGAP',0),(26,'D218','Rétinographie (maximum 2 par an)','Rétinographie (maximum 2 par an)','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.131','2026-03-17 20:13:52.131','NGAP',0),(27,'D219','Angiographie en fluorescence','Angiographie en fluorescence','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,32,'K',1,'2026-03-17 20:13:52.134','2026-03-17 20:13:52.134','NGAP',0),(28,'D223','Périmétrie quantitative','Périmétrie quantitative','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,13,'K',1,'2026-03-17 20:13:52.138','2026-03-17 20:13:52.138','NGAP',0),(29,'D227','Electrorétinographie','Electrorétinographie','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,30,'K',1,'2026-03-17 20:13:52.142','2026-03-17 20:13:52.142','NGAP',0),(30,'D240','Echographie oculaire et orbitaire','Echographie oculaire et orbitaire','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,19,'K',1,'2026-03-17 20:13:52.144','2026-03-17 20:13:52.144','NGAP',0),(31,'D254','Traitement chirurgical du chalazion','Traitement chirurgical du chalazion','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,20,'K',1,'2026-03-17 20:13:52.148','2026-03-17 20:13:52.148','NGAP',0),(32,'D270','Enucléation','Enucléation','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,50,'K',1,'2026-03-17 20:13:52.151','2026-03-17 20:13:52.151','NGAP',0),(33,'D289','Ponction de la chambre antérieure','Ponction de la chambre antérieure','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,15,'K',1,'2026-03-17 20:13:52.155','2026-03-17 20:13:52.155','NGAP',0),(34,'D296','Traitement du ptérygion - ablation simple','Traitement du ptérygion - ablation simple','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,20,'K',1,'2026-03-17 20:13:52.159','2026-03-17 20:13:52.159','NGAP',0),(35,'D299','Greffe de la cornée','Greffe de la cornée','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,120,'K',1,'2026-03-17 20:13:52.162','2026-03-17 20:13:52.162','NGAP',0),(36,'D303','Traitement du décollement de la rétine','Traitement du décollement de la rétine','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,100,'K',1,'2026-03-17 20:13:52.165','2026-03-17 20:13:52.165','NGAP',0),(37,'D322','Extraction de la cataracte','Extraction de la cataracte','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,100,'K',1,'2026-03-17 20:13:52.167','2026-03-17 20:13:52.167','NGAP',0),(38,'D323','Implantation de cristallin artificiel','Implantation de cristallin artificiel','Ophthalmology','OPHTALMOLOGIE','COEFFICIENT',NULL,60,'K',1,'2026-03-17 20:13:52.171','2026-03-17 20:13:52.171','NGAP',0),(39,'D360','Audiométrie tonale liminaire','Audiométrie tonale liminaire','ENT','ORL','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.174','2026-03-17 20:13:52.174','NGAP',0),(40,'D361','Examen audiométrique tonal et vocal','Examen audiométrique tonal et vocal','ENT','ORL','COEFFICIENT',NULL,15,'K',1,'2026-03-17 20:13:52.176','2026-03-17 20:13:52.176','NGAP',0),(41,'D366','Ablation de bouchon de cérumen','Ablation de bouchon de cérumen','ENT','ORL','COEFFICIENT',NULL,5,'K',1,'2026-03-17 20:13:52.179','2026-03-17 20:13:52.179','NGAP',0),(42,'D377','Paracentèse du tympan','Paracentèse du tympan','ENT','ORL','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.182','2026-03-17 20:13:52.182','NGAP',0),(43,'D380','Drainage transtympanique','Drainage transtympanique','ENT','ORL','COEFFICIENT',NULL,30,'K',1,'2026-03-17 20:13:52.185','2026-03-17 20:13:52.185','NGAP',0),(44,'H100','Galactographie','Galactographie','Breast Clinic','SENOLOGIE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.188','2026-03-17 20:13:52.188','NGAP',0),(45,'H101','Drainage d\'un abcès profond du sein','Drainage d\'un abcès profond du sein','Breast Clinic','SENOLOGIE','COEFFICIENT',NULL,20,'K',1,'2026-03-17 20:13:52.190','2026-03-17 20:13:52.190','NGAP',0),(46,'H103','Ablation d\'une tumeur bénigne du sein sous anesthésie locale','Ablation d\'une tumeur bénigne du sein sous anesthésie locale','Breast Clinic','SENOLOGIE','COEFFICIENT',NULL,30,'K',1,'2026-03-17 20:13:52.193','2026-03-17 20:13:52.193','NGAP',0),(47,'H104','Mastectomie partielle ou totale','Mastectomie partielle ou totale','Breast Clinic','SENOLOGIE','COEFFICIENT',NULL,50,'K',1,'2026-03-17 20:13:52.196','2026-03-17 20:13:52.196','NGAP',0),(48,'H105','Mastectomie avec curage axillaire','Mastectomie avec curage axillaire','Breast Clinic','SENOLOGIE','COEFFICIENT',NULL,100,'K',1,'2026-03-17 20:13:52.199','2026-03-17 20:13:52.199','NGAP',0),(49,'H108','Reconstruction du sein avec lambeau cutané','Reconstruction du sein avec lambeau cutané','Breast Clinic','SENOLOGIE','COEFFICIENT',NULL,100,'K',1,'2026-03-17 20:13:52.202','2026-03-17 20:13:52.202','NGAP',0),(50,'H115','Mise en place d\'une prothèse mammaire','Mise en place d\'une prothèse mammaire','Breast Clinic','SENOLOGIE','COEFFICIENT',NULL,60,'K',1,'2026-03-17 20:13:52.205','2026-03-17 20:13:52.205','NGAP',0),(51,'J200','Ponction de l\'abdomen','Ponction de l\'abdomen','Digestive Surgery','CHIRURGIE_DIGESTIVE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.209','2026-03-17 20:13:52.209','NGAP',0),(52,'J201','Traitement chirurgical simple des hernies et éventrations','Traitement chirurgical simple des hernies et éventrations','Digestive Surgery','CHIRURGIE_DIGESTIVE','COEFFICIENT',NULL,50,'K',1,'2026-03-17 20:13:52.212','2026-03-17 20:13:52.212','NGAP',0),(53,'J203','Traitement chirurgical d\'une hernie de l\'aine','Traitement chirurgical d\'une hernie de l\'aine','Digestive Surgery','CHIRURGIE_DIGESTIVE','COEFFICIENT',NULL,82,'K',1,'2026-03-17 20:13:52.216','2026-03-17 20:13:52.216','NGAP',0),(54,'J216','Laparotomie exploratrice','Laparotomie exploratrice','Digestive Surgery','CHIRURGIE_DIGESTIVE','COEFFICIENT',NULL,50,'K',1,'2026-03-17 20:13:52.220','2026-03-17 20:13:52.220','NGAP',0),(55,'J300','Tubage pour études biologiques','Tubage pour études biologiques','Gastroenterology','GASTRO_ENTEROLOGIE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.224','2026-03-17 20:13:52.224','NGAP',0),(56,'J301','Gastroscopie','Gastroscopie','Gastroenterology','GASTRO_ENTEROLOGIE','COEFFICIENT',NULL,30,'K',1,'2026-03-17 20:13:52.228','2026-03-17 20:13:52.228','NGAP',0),(57,'J302','Gastroscopie avec biopsie','Gastroscopie avec biopsie','Gastroenterology','GASTRO_ENTEROLOGIE','COEFFICIENT',NULL,40,'K',1,'2026-03-17 20:13:52.233','2026-03-17 20:13:52.233','NGAP',0),(58,'J308','Oesofibroscopie','Oesofibroscopie','Gastroenterology','GASTRO_ENTEROLOGIE','COEFFICIENT',NULL,30,'K',1,'2026-03-17 20:13:52.237','2026-03-17 20:13:52.237','NGAP',0),(59,'J312','Coloscopie totale','Coloscopie totale','Gastroenterology','GASTRO_ENTEROLOGIE','COEFFICIENT',NULL,30,'K',1,'2026-03-17 20:13:52.241','2026-03-17 20:13:52.241','NGAP',0),(60,'J329','Appendicectomie à ciel ouvert','Appendicectomie à ciel ouvert','Digestive Surgery','CHIRURGIE_DIGESTIVE','COEFFICIENT',NULL,70,'K',1,'2026-03-17 20:13:52.246','2026-03-17 20:13:52.246','NGAP',0),(61,'M100','Prélèvements gynécologiques','Prélèvements gynécologiques','Gynecology','GYNECOLOGIE','COEFFICIENT',NULL,3,'K',1,'2026-03-17 20:13:52.250','2026-03-17 20:13:52.250','NGAP',0),(62,'M101','Ponction transvaginale du Douglas','Ponction transvaginale du Douglas','Gynecology','GYNECOLOGIE','COEFFICIENT',NULL,15,'K',1,'2026-03-17 20:13:52.254','2026-03-17 20:13:52.254','NGAP',0),(63,'M102','Insuflation tubaire, injection intra-utérine','Insuflation tubaire, injection intra-utérine','Gynecology','GYNECOLOGIE','COEFFICIENT',NULL,20,'K',1,'2026-03-17 20:13:52.257','2026-03-17 20:13:52.257','NGAP',0),(64,'M104','Colposcopie','Colposcopie','Gynecology','GYNECOLOGIE','COEFFICIENT',NULL,10,'K',1,'2026-03-17 20:13:52.260','2026-03-17 20:13:52.260','NGAP',0),(65,'M124','Hystérectomie','Hystérectomie','Gynecology','GYNECOLOGIE','COEFFICIENT',NULL,100,'K',1,'2026-03-17 20:13:52.264','2026-03-17 20:13:52.264','NGAP',0),(66,'T100','Incidences fondamentales membre supérieur','Incidences fondamentales membre supérieur','Radiology','RADIOLOGIE','COEFFICIENT',NULL,4,'Z',1,'2026-03-17 20:13:52.267','2026-03-17 20:13:52.267','NGAP',0),(67,'T101','Examen radiologique de la main','Examen radiologique de la main','Radiology','RADIOLOGIE','COEFFICIENT',NULL,15,'Z',1,'2026-03-17 20:13:52.270','2026-03-17 20:13:52.270','NGAP',0),(68,'T102','Examen radiologique du poignet','Examen radiologique du poignet','Radiology','RADIOLOGIE','COEFFICIENT',NULL,15,'Z',1,'2026-03-17 20:13:52.273','2026-03-17 20:13:52.273','NGAP',0),(69,'T104','Examen radiologique du coude','Examen radiologique du coude','Radiology','RADIOLOGIE','COEFFICIENT',NULL,15,'Z',1,'2026-03-17 20:13:52.276','2026-03-17 20:13:52.276','NGAP',0),(70,'T119','Examen radiologique du pied','Examen radiologique du pied','Radiology','RADIOLOGIE','COEFFICIENT',NULL,15,'Z',1,'2026-03-17 20:13:52.279','2026-03-17 20:13:52.279','NGAP',0),(71,'T120','Examen radiologique de la cheville','Examen radiologique de la cheville','Radiology','RADIOLOGIE','COEFFICIENT',NULL,15,'Z',1,'2026-03-17 20:13:52.283','2026-03-17 20:13:52.283','NGAP',0),(72,'T122','Examen radiologique du genou','Examen radiologique du genou','Radiology','RADIOLOGIE','COEFFICIENT',NULL,15,'Z',1,'2026-03-17 20:13:52.286','2026-03-17 20:13:52.286','NGAP',0),(73,'T205','Téléradiographie du thorax','Téléradiographie du thorax','Radiology','RADIOLOGIE','COEFFICIENT',NULL,16,'Z',1,'2026-03-17 20:13:52.289','2026-03-17 20:13:52.289','NGAP',0),(74,'T209','Examen radiologique de l\'abdomen sans préparation','Examen radiologique de l\'abdomen sans préparation','Radiology','RADIOLOGIE','COEFFICIENT',NULL,15,'Z',1,'2026-03-17 20:13:52.291','2026-03-17 20:13:52.291','NGAP',0),(75,'T214','Transit oeso-gastro-duodénal','Transit oeso-gastro-duodénal','Radiology','RADIOLOGIE','COEFFICIENT',NULL,85,'Z',1,'2026-03-17 20:13:52.294','2026-03-17 20:13:52.294','NGAP',0),(76,'T217','Examen radiologique du côlon','Examen radiologique du côlon','Radiology','RADIOLOGIE','COEFFICIENT',NULL,90,'Z',1,'2026-03-17 20:13:52.298','2026-03-17 20:13:52.298','NGAP',0),(77,'T223','Urographie intraveineuse','Urographie intraveineuse','Radiology','RADIOLOGIE','COEFFICIENT',NULL,64,'Z',1,'2026-03-17 20:13:52.301','2026-03-17 20:13:52.301','NGAP',0),(78,'T229','Mammographie bilatérale','Mammographie bilatérale','Radiology','RADIOLOGIE','COEFFICIENT',NULL,30,'Z',1,'2026-03-17 20:13:52.303','2026-03-17 20:13:52.303','NGAP',0),(79,'T230','Mammographie unilatérale','Mammographie unilatérale','Radiology','RADIOLOGIE','COEFFICIENT',NULL,20,'Z',1,'2026-03-17 20:13:52.308','2026-03-17 20:13:52.308','NGAP',0),(80,'S100','Prélèvement par ponction veineuse directe','Prélèvement par ponction veineuse directe','Nursing Care','SOINS_INFIRMIERS','COEFFICIENT',NULL,1.5,'AMI',1,'2026-03-17 20:13:52.313','2026-03-17 20:13:52.313','NGAP',0),(81,'S103','Injection intraveineuse directe isolée','Injection intraveineuse directe isolée','Nursing Care','SOINS_INFIRMIERS','COEFFICIENT',NULL,2,'AMI',1,'2026-03-17 20:13:52.317','2026-03-17 20:13:52.317','NGAP',0),(82,'S106','Injection intramusculaire','Injection intramusculaire','Nursing Care','SOINS_INFIRMIERS','COEFFICIENT',NULL,1,'AMI',1,'2026-03-17 20:13:52.320','2026-03-17 20:13:52.320','NGAP',0),(83,'S108','Injection sous-cutanée','Injection sous-cutanée','Nursing Care','SOINS_INFIRMIERS','COEFFICIENT',NULL,1,'AMI',1,'2026-03-17 20:13:52.324','2026-03-17 20:13:52.324','NGAP',0),(84,'S113','Pansement (petit)','Pansement (petit)','Nursing Care','SOINS_INFIRMIERS','COEFFICIENT',NULL,0.75,'AMI',1,'2026-03-17 20:13:52.327','2026-03-17 20:13:52.327','NGAP',0),(85,'S114','Pansement (moyen)','Pansement (moyen)','Nursing Care','SOINS_INFIRMIERS','COEFFICIENT',NULL,1.25,'AMI',1,'2026-03-17 20:13:52.329','2026-03-17 20:13:52.329','NGAP',0),(86,'S134','Séance d\'aérosol','Séance d\'aérosol','Nursing Care','SOINS_INFIRMIERS','COEFFICIENT',NULL,1.5,'AMI',1,'2026-03-17 20:13:52.332','2026-03-17 20:13:52.332','NGAP',0),(87,'S158','Perfusion intraveineuse','Perfusion intraveineuse','Nursing Care','SOINS_INFIRMIERS','COEFFICIENT',NULL,5,'AMI',1,'2026-03-17 20:13:52.336','2026-03-17 20:13:52.336','NGAP',0),(88,'Z100','Biopsie cutanée','Biopsie cutanée','Pathology','ANATOMOPATHOLOGIE','COEFFICIENT',NULL,100,'P',1,'2026-03-17 20:13:52.340','2026-03-17 20:13:52.340','NGAP',0),(89,'Z101','Biopsie du col utérin','Biopsie du col utérin','Pathology','ANATOMOPATHOLOGIE','COEFFICIENT',NULL,100,'P',1,'2026-03-17 20:13:52.344','2026-03-17 20:13:52.344','NGAP',0),(90,'Z107','Biopsie gastrique','Biopsie gastrique','Pathology','ANATOMOPATHOLOGIE','COEFFICIENT',NULL,100,'P',1,'2026-03-17 20:13:52.347','2026-03-17 20:13:52.347','NGAP',0),(91,'Z108','Biopsie hépatique','Biopsie hépatique','Pathology','ANATOMOPATHOLOGIE','COEFFICIENT',NULL,100,'P',1,'2026-03-17 20:13:52.351','2026-03-17 20:13:52.351','NGAP',0),(92,'NGAP-CONSULT-GENERALE','Consultation générale','Consultation chez un médecin généraliste','GENERAL','CONSULTATION','DIRECT',200,1,'C',1,'2026-03-19 02:00:29.903','2026-03-19 02:00:29.903','NGAP',1),(93,'NGAP-CONSULT-SPECIALISTE','Consultation spécialiste','Consultation chez un médecin spécialiste','SPECIALISTE','CONSULTATION','DIRECT',250,1,'Cs',1,'2026-03-19 02:00:29.913','2026-03-19 02:00:29.913','NGAP',1),(94,'NGAP-VISITE-DOMICILE','Visite à domicile','Visite médicale à domicile','GENERAL','CONSULTATION','DIRECT',300,1,'V',1,'2026-03-19 02:00:29.918','2026-03-19 02:00:29.918','NGAP',1),(95,'NGAP-ECG','Électrocardiogramme (ECG)','Examen de l’activité électrique du cœur','CARDIOLOGIE','DIAGNOSTIC','DIRECT',150,10,'K',1,'2026-03-19 02:00:29.921','2026-03-19 02:00:29.921','NGAP',1),(96,'NGAP-EEG','Électroencéphalogramme (EEG)','Analyse de l’activité cérébrale','NEUROLOGIE','DIAGNOSTIC','DIRECT',300,30,'D',1,'2026-03-19 02:00:29.925','2026-03-19 02:00:29.925','NGAP',1),(97,'NGAP-ECHO-ENC','Écho-encéphalogramme','Imagerie cérébrale par ultrasons','NEUROLOGIE','IMAGING','DIRECT',120,10,'D',1,'2026-03-19 02:00:29.931','2026-03-19 02:00:29.931','NGAP',1),(98,'NGAP-RADIO-THORAX','Radiographie thoracique','Radiographie des poumons','RADIOLOGIE','IMAGING','DIRECT',180,15,'Z',1,'2026-03-19 02:00:29.934','2026-03-19 02:00:29.934','NGAP',1),(99,'NGAP-ECHOGRAPHIE','Échographie abdominale','Exploration par ultrasons de l’abdomen','RADIOLOGIE','IMAGING','DIRECT',350,20,'KE',1,'2026-03-19 02:00:29.937','2026-03-19 02:00:29.937','NGAP',1),(100,'NGAP-INJECTION-SC','Injection sous-cutanée','Injection médicamenteuse sous la peau','SOINS','INFIRMIER','DIRECT',50,1,'C',1,'2026-03-19 02:00:29.940','2026-03-19 02:00:29.940','NGAP',1),(101,'NGAP-INJECTION-IM','Injection intramusculaire','Injection dans le muscle','SOINS','INFIRMIER','DIRECT',60,1,'C',1,'2026-03-19 02:00:29.944','2026-03-19 02:00:29.944','NGAP',1),(102,'NGAP-PANSEMENT','Pansement simple','Soin de plaie superficielle','SOINS','INFIRMIER','DIRECT',70,5,'C',1,'2026-03-19 02:00:29.947','2026-03-19 02:00:29.947','NGAP',1),(103,'NGAP-SUTURE-PLAIE','Suture de plaie','Fermeture d’une plaie','CHIRURGIE','URGENCE','DIRECT',200,10,'C',1,'2026-03-19 02:00:29.950','2026-03-19 02:00:29.950','NGAP',1),(104,'NGAP-ABCES-DRAINAGE','Drainage d’abcès','Incision et drainage d’une collection','CHIRURGIE','URGENCE','DIRECT',250,20,'C',1,'2026-03-19 02:00:29.953','2026-03-19 02:00:29.953','NGAP',1),(105,'NGAP-PRISE-SANG','Prise de sang','Prélèvement sanguin','LABORATOIRE','ANALYSE','DIRECT',40,1,'B',1,'2026-03-19 02:00:29.956','2026-03-19 02:00:29.956','NGAP',1),(106,'NGAP-GLYCEMIE','Glycémie','Dosage du sucre dans le sang','LABORATOIRE','ANALYSE','DIRECT',30,2,'B',1,'2026-03-19 02:00:29.959','2026-03-19 02:00:29.959','NGAP',1),(107,'NGAP-NFS','Numération formule sanguine (NFS)','Analyse complète du sang','LABORATOIRE','ANALYSE','DIRECT',110,100,'B',1,'2026-03-19 02:00:29.962','2026-03-19 02:00:29.962','NGAP',1),(108,'NGAP-TEST-GROSSESSE','Test de grossesse','Détection hormonale de grossesse','LABORATOIRE','ANALYSE','DIRECT',80,5,'B',1,'2026-03-19 02:00:29.965','2026-03-19 02:00:29.965','NGAP',1),(109,'NGAP-ECHO-PELV','Échographie pelvienne','Exploration des organes pelviens','GYNECOLOGIE','IMAGING','DIRECT',350,20,'KE',1,'2026-03-19 02:00:29.968','2026-03-19 02:00:29.968','NGAP',1),(110,'NGAP-MAMMOGRAPHIE','Mammographie','Imagerie des seins','RADIOLOGIE','IMAGING','DIRECT',300,20,'Z',1,'2026-03-19 02:00:29.971','2026-03-19 02:00:29.971','NGAP',1),(111,'NGAP-KINE-SEANCE','Séance de kinésithérapie','Rééducation fonctionnelle','KINESITHERAPIE','REEDUCATION','DIRECT',120,7,'AMM',1,'2026-03-19 02:00:29.974','2026-03-19 02:00:29.974','NGAP',1),(112,'NGAP-CONSULT-CARDIO','Consultation en cardiologie','Consultation spécialisée en cardiologie','CARDIOLOGIE','CONSULTATION','DIRECT',250,1,'Cs',1,'2026-03-19 02:00:29.977','2026-03-19 02:00:29.977','NGAP',1),(113,'NGAP-CONSULT-DERMA','Consultation dermatologique','Consultation spécialisée en dermatologie','DERMATOLOGIE','CONSULTATION','DIRECT',220,1,'Cs',1,'2026-03-19 02:00:29.980','2026-03-19 02:00:29.980','NGAP',1),(114,'NGAP-CONSULT-GYNECO','Consultation gynécologique','Consultation spécialisée en gynécologie','GYNECOLOGIE','CONSULTATION','DIRECT',250,1,'Cs',1,'2026-03-19 02:00:29.983','2026-03-19 02:00:29.983','NGAP',1),(115,'NGAP-CONSULT-ORL','Consultation ORL','Consultation en oto-rhino-laryngologie','ORL','CONSULTATION','DIRECT',230,1,'Cs',1,'2026-03-19 02:00:29.986','2026-03-19 02:00:29.986','NGAP',1),(116,'NGAP-CONSULT-OPHTALMO','Consultation ophtalmologique','Consultation en ophtalmologie','OPHTALMOLOGIE','CONSULTATION','DIRECT',230,1,'Cs',1,'2026-03-19 02:00:29.989','2026-03-19 02:00:29.989','NGAP',1),(117,'NGAP-FOND-OEIL','Examen du fond d’œil','Analyse du fond de l’œil','OPHTALMOLOGIE','DIAGNOSTIC','DIRECT',150,10,'K',1,'2026-03-19 02:00:29.992','2026-03-19 02:00:29.992','NGAP',1),(118,'NGAP-TONOMETRIE','Tonométrie oculaire','Mesure de la pression intraoculaire','OPHTALMOLOGIE','DIAGNOSTIC','DIRECT',120,8,'K',1,'2026-03-19 02:00:29.995','2026-03-19 02:00:29.995','NGAP',1),(119,'NGAP-AUDIOMETRIE','Audiométrie','Test de l’audition','ORL','DIAGNOSTIC','DIRECT',150,10,'K',1,'2026-03-19 02:00:29.998','2026-03-19 02:00:29.998','NGAP',1),(120,'NGAP-ENDOSCOPIE-NASALE','Endoscopie nasale','Exploration des fosses nasales','ORL','IMAGING','DIRECT',200,15,'K',1,'2026-03-19 02:00:30.001','2026-03-19 02:00:30.001','NGAP',1),(121,'NGAP-ABLATION-KYSTE','Ablation de kyste cutané','Exérèse d’un kyste sous-cutané','DERMATOLOGIE','CHIRURGIE','DIRECT',250,15,'C',1,'2026-03-19 02:00:30.004','2026-03-19 02:00:30.004','NGAP',1),(122,'NGAP-EXERSE-NAEVUS','Exérèse de nævus','Ablation d’un grain de beauté','DERMATOLOGIE','CHIRURGIE','DIRECT',200,20,'C',1,'2026-03-19 02:00:30.007','2026-03-19 02:00:30.007','NGAP',1),(123,'NGAP-TRAITEMENT-VERRUE','Traitement de verrue','Destruction de verrues cutanées','DERMATOLOGIE','SOINS','DIRECT',120,10,'C',1,'2026-03-19 02:00:30.010','2026-03-19 02:00:30.010','NGAP',1),(124,'NGAP-DRAINAGE-ABCES','Drainage d\'abcès cutané','Incision et évacuation d’un abcès','DERMATOLOGIE','URGENCE','DIRECT',200,20,'C',1,'2026-03-19 02:00:30.015','2026-03-19 02:00:30.015','NGAP',1),(125,'NGAP-INFILTRATION-ARTICULAIRE','Infiltration articulaire','Injection intra-articulaire thérapeutique','RHEUMATOLOGIE','SOINS','DIRECT',180,10,'K',1,'2026-03-19 02:00:30.019','2026-03-19 02:00:30.019','NGAP',1),(126,'NGAP-RADIO-GENOU','Radiographie du genou','Imagerie radiologique du genou','RADIOLOGIE','IMAGING','DIRECT',180,15,'Z',1,'2026-03-19 02:00:30.024','2026-03-19 02:00:30.024','NGAP',1),(127,'NGAP-RADIO-RACHIS','Radiographie du rachis','Radiographie de la colonne vertébrale','RADIOLOGIE','IMAGING','DIRECT',200,18,'Z',1,'2026-03-19 02:00:30.029','2026-03-19 02:00:30.029','NGAP',1),(128,'NGAP-ECHO-CARDIAQUE','Échographie cardiaque','Exploration du cœur par ultrasons','CARDIOLOGIE','IMAGING','DIRECT',400,25,'KE',1,'2026-03-19 02:00:30.036','2026-03-19 02:00:30.036','NGAP',1),(129,'NGAP-DOPPLER','Écho-Doppler vasculaire','Étude du flux sanguin','CARDIOLOGIE','IMAGING','DIRECT',350,20,'KE',1,'2026-03-19 02:00:30.041','2026-03-19 02:00:30.041','NGAP',1),(130,'NGAP-SPIROMETRIE','Spirométrie','Test de la fonction respiratoire','PNEUMOLOGIE','DIAGNOSTIC','DIRECT',180,10,'K',1,'2026-03-19 02:00:30.045','2026-03-19 02:00:30.045','NGAP',1),(131,'NGAP-NEBULISATION','Nébulisation','Administration de médicaments inhalés','PNEUMOLOGIE','SOINS','DIRECT',100,5,'K',1,'2026-03-19 02:00:30.050','2026-03-19 02:00:30.050','NGAP',1),(132,'NGAP-SCANNER-CEREBRAL','Scanner cérébral','Tomodensitométrie du cerveau','RADIOLOGIE','IMAGING','DIRECT',900,50,'Z',1,'2026-03-19 02:00:30.055','2026-03-19 02:00:30.055','NGAP',1),(133,'NGAP-SCANNER-THORACIQUE','Scanner thoracique','Scanner des poumons et du thorax','RADIOLOGIE','IMAGING','DIRECT',950,55,'Z',1,'2026-03-19 02:00:30.059','2026-03-19 02:00:30.059','NGAP',1),(134,'NGAP-SCANNER-ABDOMINAL','Scanner abdominal','Scanner de l’abdomen','RADIOLOGIE','IMAGING','DIRECT',950,55,'Z',1,'2026-03-19 02:00:30.063','2026-03-19 02:00:30.063','NGAP',1),(135,'NGAP-IRM-CEREBRALE','IRM cérébrale','Imagerie par résonance magnétique du cerveau','RADIOLOGIE','IMAGING','DIRECT',1500,80,'Z',1,'2026-03-19 02:00:30.067','2026-03-19 02:00:30.067','NGAP',1),(136,'NGAP-IRM-GENOU','IRM du genou','IRM du genou','RADIOLOGIE','IMAGING','DIRECT',1300,70,'Z',1,'2026-03-19 02:00:30.070','2026-03-19 02:00:30.070','NGAP',1),(137,'NGAP-IRM-RACHIS','IRM du rachis','IRM de la colonne vertébrale','RADIOLOGIE','IMAGING','DIRECT',1400,75,'Z',1,'2026-03-19 02:00:30.073','2026-03-19 02:00:30.073','NGAP',1),(138,'NGAP-ECHO-GROSSESSE','Échographie de grossesse','Suivi échographique de grossesse','GYNECOLOGIE','OBSTETRIQUE','DIRECT',300,20,'KE',1,'2026-03-19 02:00:30.077','2026-03-19 02:00:30.077','NGAP',1),(139,'NGAP-ECHO-MORPHO','Échographie morphologique','Échographie détaillée du fœtus','GYNECOLOGIE','OBSTETRIQUE','DIRECT',450,30,'KE',1,'2026-03-19 02:00:30.081','2026-03-19 02:00:30.081','NGAP',1),(140,'NGAP-SUIVI-GROSSESSE','Consultation de suivi de grossesse','Suivi médical de grossesse','GYNECOLOGIE','CONSULTATION','DIRECT',200,1,'C',1,'2026-03-19 02:00:30.084','2026-03-19 02:00:30.084','NGAP',1),(141,'NGAP-FROTTIS','Frottis cervico-vaginal','Dépistage du cancer du col','GYNECOLOGIE','PREVENTION','DIRECT',150,10,'C',1,'2026-03-19 02:00:30.088','2026-03-19 02:00:30.088','NGAP',1),(142,'NGAP-REDUCTION-LUXATION','Réduction de luxation','Remise en place d’une articulation luxée','URGENCE','TRAUMATOLOGIE','DIRECT',300,15,'K',1,'2026-03-19 02:00:30.090','2026-03-19 02:00:30.090','NGAP',1),(143,'NGAP-PLATRE','Pose de plâtre','Immobilisation d’un membre','URGENCE','TRAUMATOLOGIE','DIRECT',250,10,'K',1,'2026-03-19 02:00:30.093','2026-03-19 02:00:30.093','NGAP',1),(144,'NGAP-CHANGEMENT-PLATRE','Changement de plâtre','Renouvellement d’un plâtre','URGENCE','TRAUMATOLOGIE','DIRECT',150,5,'K',1,'2026-03-19 02:00:30.098','2026-03-19 02:00:30.098','NGAP',1),(145,'NGAP-SUTURE-PROFONDE','Suture de plaie profonde','Suture de plaie complexe','URGENCE','CHIRURGIE','DIRECT',300,20,'K',1,'2026-03-19 02:00:30.101','2026-03-19 02:00:30.101','NGAP',1),(146,'NGAP-HOLTER','Holter ECG 24h','Enregistrement ECG sur 24h','CARDIOLOGIE','DIAGNOSTIC','DIRECT',400,25,'K',1,'2026-03-19 02:00:30.104','2026-03-19 02:00:30.104','NGAP',1),(147,'NGAP-HOLTER-TA','Holter tensionnel','Mesure tension artérielle sur 24h','CARDIOLOGIE','DIAGNOSTIC','DIRECT',350,20,'K',1,'2026-03-19 02:00:30.108','2026-03-19 02:00:30.108','NGAP',1),(148,'NGAP-ENDOSCOPIE','Endoscopie digestive','Exploration de l’estomac','GASTROENTEROLOGIE','IMAGING','DIRECT',600,40,'K',1,'2026-03-19 02:00:30.111','2026-03-19 02:00:30.111','NGAP',1),(149,'NGAP-COLONOSCOPIE','Coloscopie','Exploration du côlon','GASTROENTEROLOGIE','IMAGING','DIRECT',900,60,'K',1,'2026-03-19 02:00:30.114','2026-03-19 02:00:30.114','NGAP',1),(150,'NGAP-ECHO-RENALE','Échographie rénale','Exploration des reins','UROLOGIE','IMAGING','DIRECT',300,20,'KE',1,'2026-03-19 02:00:30.118','2026-03-19 02:00:30.118','NGAP',1),(151,'NGAP-SONDAGE-VESICAL','Sondage vésical','Pose de sonde urinaire','UROLOGIE','SOINS','DIRECT',120,5,'K',1,'2026-03-19 02:00:30.121','2026-03-19 02:00:30.121','NGAP',1);
/*!40000 ALTER TABLE `medicalservice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packagerule`
--

DROP TABLE IF EXISTS `packagerule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packagerule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `package_id` int DEFAULT NULL,
  `min_coefficient` double DEFAULT NULL,
  `max_coefficient` double DEFAULT NULL,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `letter` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fixed_price` double DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `PackageRule_service_id_fkey` (`service_id`),
  KEY `PackageRule_package_id_fkey` (`package_id`),
  CONSTRAINT `PackageRule_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `surgicalpackage` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `PackageRule_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `medicalservice` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packagerule`
--

LOCK TABLES `packagerule` WRITE;
/*!40000 ALTER TABLE `packagerule` DISABLE KEYS */;
/*!40000 ALTER TABLE `packagerule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricequote`
--

DROP TABLE IF EXISTS `pricequote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricequote` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quote_number` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `consultation_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `procedure_codes` json NOT NULL,
  `options` json DEFAULT NULL,
  `total_price` double NOT NULL,
  `breakdown` json NOT NULL,
  `ngap_references` json NOT NULL,
  `patient_external_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appointment_external_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expires_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PriceQuote_quote_number_key` (`quote_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricequote`
--

LOCK TABLES `pricequote` WRITE;
/*!40000 ALTER TABLE `pricequote` DISABLE KEYS */;
/*!40000 ALTER TABLE `pricequote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surgicalpackage`
--

DROP TABLE IF EXISTS `surgicalpackage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surgicalpackage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_coefficient` double NOT NULL,
  `max_coefficient` double NOT NULL,
  `fixed_price` double NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surgicalpackage`
--

LOCK TABLES `surgicalpackage` WRITE;
/*!40000 ALTER TABLE `surgicalpackage` DISABLE KEYS */;
/*!40000 ALTER TABLE `surgicalpackage` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-01 22:27:27
