import express, { Response, Request, NextFunction} from "express"

const app = express()

app.get("/", (req: Request, res: Response) => {
  res.send("Sistema almoxarifado is running.")
})

app.listen(2512, () => {
  console.log("Sistema almoxarifado is running.");
})