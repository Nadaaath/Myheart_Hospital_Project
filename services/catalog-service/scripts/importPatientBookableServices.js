const { PrismaClient } = require("@prisma/client")
const { PATIENT_BOOKABLE_SERVICES } = require("./patientbook")

const prisma = new PrismaClient()

async function main() {
  console.log("Importing patient bookable services...")

  for (const service of PATIENT_BOOKABLE_SERVICES) {
    await prisma.medicalService.upsert({
      where: { code: service.code },
      update: {
        name: service.name,
        description: service.description,
        department: service.department,
        category: service.category,
        source: service.source,
        pricing_type: service.pricing_type,
        direct_price: service.direct_price,
        coefficient: service.coefficient,
        letter: service.letter,
        is_active: service.is_active,
        is_bookable: service.is_bookable
      },
      create: {
        code: service.code,
        name: service.name,
        description: service.description,
        department: service.department,
        category: service.category,
        source: service.source,
        pricing_type: service.pricing_type,
        direct_price: service.direct_price,
        coefficient: service.coefficient,
        letter: service.letter,
        is_active: service.is_active,
        is_bookable: service.is_bookable
      }
    })

    console.log(`Imported ${service.code} - ${service.name}`)
  }

  console.log(`Done. Imported ${PATIENT_BOOKABLE_SERVICES.length} services.`)
}

main()
  .catch((error) => {
    console.error("Import failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })