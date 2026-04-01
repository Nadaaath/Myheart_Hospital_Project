const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const LAB_TESTS = [
  { code: "B150", name: "Numération formule sanguine (NFS)", description: "Hémogramme complet", category: "HEMATOLOGY", source: "NGAP", b_coefficient: 100, price: 110, conventional_price: 110, non_conventional_price: 134, is_ngap: true },
  { code: "B151", name: "Hémoglobine", description: "Dosage de l'hémoglobine", category: "HEMATOLOGY", source: "NGAP", b_coefficient: 20, price: 22, conventional_price: 22, non_conventional_price: 26.8, is_ngap: true },
  { code: "B152", name: "Hématocrite", description: "Mesure de l'hématocrite", category: "HEMATOLOGY", source: "NGAP", b_coefficient: 20, price: 22, conventional_price: 22, non_conventional_price: 26.8, is_ngap: true },
  { code: "B153", name: "Plaquettes", description: "Numération des plaquettes", category: "HEMATOLOGY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 40.2, is_ngap: true },
  { code: "B154", name: "Vitesse de sédimentation (VS)", description: "Marqueur inflammatoire", category: "HEMATOLOGY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 40.2, is_ngap: true },

  { code: "B110", name: "Glycémie à jeun", description: "Dosage du glucose sanguin", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 20, price: 22, conventional_price: 22, non_conventional_price: 26.8, is_ngap: true },
  { code: "B111", name: "HbA1c", description: "Hémoglobine glyquée", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 80, price: 88, conventional_price: 88, non_conventional_price: 107.2, is_ngap: true },

  { code: "B170", name: "Créatinine", description: "Fonction rénale", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },
  { code: "B171", name: "Urée", description: "Fonction rénale", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },
  { code: "B100", name: "Acide urique", description: "Dosage sanguin de l'acide urique", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 40.2, is_ngap: true },

  { code: "B200", name: "ASAT (TGO)", description: "Enzyme hépatique", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },
  { code: "B201", name: "ALAT (TGP)", description: "Enzyme hépatique", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },
  { code: "B103", name: "Bilirubine totale", description: "Bilirubine totale directe et indirecte", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 70, price: 77, conventional_price: 77, non_conventional_price: 93.8, is_ngap: true },
  { code: "B202", name: "Bilirubine directe", description: "Fraction directe de la bilirubine", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 40, price: 44, conventional_price: 44, non_conventional_price: 53.6, is_ngap: true },

  { code: "B210", name: "Sodium", description: "Ionogramme sanguin - sodium", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 20, price: 22, conventional_price: 22, non_conventional_price: 26.8, is_ngap: true },
  { code: "B211", name: "Potassium", description: "Ionogramme sanguin - potassium", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 20, price: 22, conventional_price: 22, non_conventional_price: 26.8, is_ngap: true },
  { code: "B104", name: "Calcium", description: "Dosage du calcium", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 40.2, is_ngap: true },
  { code: "B105", name: "Chlore", description: "Dosage du chlore", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 40.2, is_ngap: true },

  { code: "B220", name: "Cholestérol total", description: "Bilan lipidique", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },
  { code: "B221", name: "HDL", description: "Cholestérol HDL", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },
  { code: "B222", name: "LDL", description: "Cholestérol LDL", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },
  { code: "B223", name: "Triglycérides", description: "Triglycérides sanguins", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },

  { code: "B160", name: "TSH", description: "Hormone thyréostimulante", category: "HORMONES", source: "NGAP", b_coefficient: 100, price: 110, conventional_price: 110, non_conventional_price: 134, is_ngap: true },
  { code: "B165", name: "T3", description: "Triiodothyronine libre", category: "HORMONES", source: "NGAP", b_coefficient: 300, price: 330, conventional_price: 330, non_conventional_price: 363, is_ngap: true },
  { code: "B166", name: "T4", description: "Thyroxine libre", category: "HORMONES", source: "NGAP", b_coefficient: 300, price: 330, conventional_price: 330, non_conventional_price: 363, is_ngap: true },

  { code: "B230", name: "CRP", description: "Protéine C-réactive", category: "INFLAMMATION", source: "NGAP", b_coefficient: 50, price: 55, conventional_price: 55, non_conventional_price: 60.5, is_ngap: true },

  { code: "B173", name: "pH urinaire", description: "Mesure du pH des urines", category: "URINE", source: "NGAP", b_coefficient: 10, price: 11, conventional_price: 11, non_conventional_price: 12.1, is_ngap: true },
  { code: "B240", name: "Analyse d'urine", description: "Analyse biochimique d'urine", category: "URINE", source: "NGAP", b_coefficient: 50, price: 55, conventional_price: 55, non_conventional_price: 60.5, is_ngap: true },
  { code: "B241", name: "Protéinurie", description: "Dosage des protéines urinaires", category: "URINE", source: "NGAP", b_coefficient: 30, price: 33, conventional_price: 33, non_conventional_price: 36.3, is_ngap: true },

  { code: "B194", name: "Test de grossesse", description: "Recherche de grossesse", category: "HORMONES", source: "NGAP", b_coefficient: 80, price: 88, conventional_price: 88, non_conventional_price: 96.8, is_ngap: true },
  { code: "B250", name: "PSA (Prostate)", description: "Antigène prostatique spécifique", category: "HORMONES", source: "NGAP", b_coefficient: 100, price: 110, conventional_price: 110, non_conventional_price: 121, is_ngap: true },
  { code: "B251", name: "Ferritine", description: "Dosage de la ferritine", category: "BIOCHEMISTRY", source: "NGAP", b_coefficient: 100, price: 110, conventional_price: 110, non_conventional_price: 121, is_ngap: true },
]

async function main() {
  console.log("Starting LabTest import...")

  for (const test of LAB_TESTS) {
    await prisma.labTest.upsert({
      where: { code: test.code },
      update: {
        name: test.name,
        description: test.description,
        category: test.category,
        source: test.source,
        price: test.price,
        b_coefficient: test.b_coefficient,
        conventional_price: test.conventional_price,
        non_conventional_price: test.non_conventional_price,
        is_ngap: test.is_ngap,
        is_active: true,
      },
      create: {
        code: test.code,
        name: test.name,
        description: test.description,
        category: test.category,
        source: test.source,
        price: test.price,
        b_coefficient: test.b_coefficient,
        conventional_price: test.conventional_price,
        non_conventional_price: test.non_conventional_price,
        is_ngap: test.is_ngap,
        is_active: true,
      },
    })

    console.log(`Imported lab test ${test.code} - ${test.name}`)
  }

  console.log("LabTest import completed successfully")
}

main()
  .catch((error) => {
    console.error("LabTest import failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })