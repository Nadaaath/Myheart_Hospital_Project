const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

exports.getServices = async (req, res) => {
  try {
    const { department, category, is_bookable, source, q } = req.query

    const where = {
      is_active: true
    }

    if (is_bookable !== undefined) {
      where.is_bookable = is_bookable === "true"
    }

    if (department) {
      where.department = department
    }

    if (category) {
      where.category = category
    }

    if (source) {
      where.source = source
    }

    if (q) {
      where.OR = [
        { code: { contains: q } },
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
        { department: { contains: q } }
      ]
    }

    const services = await prisma.medicalService.findMany({
      where,
      orderBy: { id: "asc" }
    })

    res.json(services)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getServiceById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid service id" })
    }

    const service = await prisma.medicalService.findUnique({
      where: { id }
    })

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    res.json(service)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.createService = async (req, res) => {
  try {
    const {
      code,
      name,
      department,
      category,
      pricing_type,
      direct_price,
      coefficient,
      letter,
      description,
      is_bookable,
      source
    } = req.body

    const service = await prisma.medicalService.create({
      data: {
        code,
        name,
        department,
        category,
        pricing_type,
        direct_price,
        coefficient,
        letter,
        description,
        is_bookable: is_bookable ?? false,
        source: source ?? "CUSTOM"
      }
    })

    res.status(201).json(service)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.searchServices = async (req, res) => {
  try {
    const { q, is_bookable, department } = req.query

    if (!q || q.trim().length < 2) {
      return res.json([])
    }

    const where = {
      is_active: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
        { department: { contains: q } }
      ]
    }

    if (is_bookable !== undefined) {
      where.is_bookable = is_bookable === "true"
    }

    if (department) {
      where.department = department
    }

    const results = await prisma.medicalService.findMany({
      where,
      orderBy: { id: "asc" },
      take: 30
    })

    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getServicePrice = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid service id" })
    }

    const service = await prisma.medicalService.findUnique({
      where: { id }
    })

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    let price = null

    if (service.direct_price !== null && service.direct_price !== undefined) {
      price = service.direct_price
    } else if (service.coefficient && service.letter) {
      const tariff = await prisma.letterTariff.findFirst({
        where: {
          letter: service.letter,
          is_active: true
        }
      })

      if (tariff) {
        price = service.coefficient * tariff.value
      }
    }

    return res.json({
      id: service.id,
      code: service.code,
      name: service.name,
      department: service.department,
      category: service.category,
      price,
      pricing_type: service.pricing_type,
      coefficient: service.coefficient,
      letter: service.letter,
      source: service.source,
      is_bookable: service.is_bookable
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getLabTests = async (req, res) => {
  try {
    const { q, category } = req.query

    const where = {
      is_active: true
    }

    if (q) {
      where.OR = [
        { code: { contains: q } },
        { name: { contains: q } },
        { description: { contains: q } }
      ]
    }

    if (category) {
      where.category = category
    }

    const tests = await prisma.labTest.findMany({
      where,
      orderBy: { id: "asc" },
      take: 50
    })

    res.json(tests)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getCategories = async (req, res) => {
  try {
    const dbCategories = await prisma.medicalService.findMany({
      select: { category: true },
      distinct: ["category"],
      where: {
        is_active: true,
        category: { not: null }
      }
    })

    res.json(dbCategories.map((c) => c.category).filter(Boolean))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.healthCheck = async (req, res) => {
  try {
    const medicalServiceCount = await prisma.medicalService.count({
      where: { is_active: true }
    })

    const bookableServiceCount = await prisma.medicalService.count({
      where: {
        is_active: true,
        is_bookable: true
      }
    })

    const customBookableCount = await prisma.medicalService.count({
      where: {
        is_active: true,
        is_bookable: true,
        source: "CUSTOM"
      }
    })

    const labTestCount = await prisma.labTest.count({
      where: { is_active: true }
    })

    const letterTariffCount = await prisma.letterTariff.count()

    res.json({
      status: "healthy",
      service: "catalog-service",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        active_services_count: medicalServiceCount,
        active_bookable_services_count: bookableServiceCount,
        active_custom_bookable_services_count: customBookableCount,
        active_lab_tests_count: labTestCount,
        letter_tariffs_count: letterTariffCount
      }
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "catalog-service",
      error: error.message
    })
  }
}