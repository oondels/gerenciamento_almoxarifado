import express, { Response, Request, NextFunction } from "express";
import { AppDataSource } from "./config/database";
import productRoutes from "./routes/productRoutes";

const app = express();

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

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully!");
    
    app.listen(2512, () => {
      console.log("Sistema almoxarifado is running on port 2512");
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });