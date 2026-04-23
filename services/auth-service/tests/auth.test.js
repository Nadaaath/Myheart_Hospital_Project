const request = require("supertest")
const app = require("../app")

describe("Auth Service", () => {
  it("should respond on the root route", async () => {
    const res = await request(app).get("/")
    expect(res.statusCode).toBe(200)
  })
  it("should reject profile access without token", async () => {
    const res = await request(app).get("/auth/profile")

    expect([401, 403]).toContain(res.statusCode)
  })
})
