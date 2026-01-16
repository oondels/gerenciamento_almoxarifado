import express, { Response, Request, NextFunction } from "express";
import { AppDataSource } from "./config/database";
import productRoutes from "./routes/productRoutes";
import movimentationRoutes from "./routes/movimentationRoutes";

const app = express();
const port = 9137;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Sistema almoxarifado is running.",
    version: "1.0.0",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/movimentations", movimentationRoutes);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully!");
    
    app.listen(port, () => {
      console.log(`Sistema almoxarifado is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });