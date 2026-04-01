const express = require("express")

const app = express()

app.get("/", (req, res) => {
  res.send("gateway test ok")
})

const server = app.listen(5000, () => {
  console.log("test gateway running on 5000")
})

server.on("close", () => {
  console.log("SERVER CLOSED")
})

server.on("error", (err) => {
  console.error("SERVER ERROR:", err)
})

process.on("exit", (code) => {
  console.log("PROCESS EXIT with code:", code)
})

process.on("beforeExit", (code) => {
  console.log("PROCESS BEFORE EXIT with code:", code)
})

setInterval(() => {
  console.log("still alive...")
}, 5000)