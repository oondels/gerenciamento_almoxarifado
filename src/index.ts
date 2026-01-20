import express, { Response, Request, NextFunction } from "express";
import { AppDataSource } from "./config/database";
import productRoutes from "./routes/productRoutes";
import movimentationRoutes from "./routes/movimentationRoutes";
import allowedUserRoutes from "./routes/allowedUser.route";
import { AppError } from "./utils/AppError";
import { config } from "./config/env";

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
app.use("/api/users", allowedUserRoutes);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error on method ${req.method} - ${req.originalUrl}:`, error);
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return
  }

  res.status(500).json({
    message: "Internal Server Error",
    error: config.env === 'development' ? error.message || "An unexpected error occurred" : undefined
  });
  return
})

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