import "dotenv/config.js";
import express from "express";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import bankingRoutes from "./routes/bankingRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// cors middleware
// To handle CORS fors do "npm i cors"
app.use(cors());

// Middleware to JSON parsing
app.use(express.json());

// Banking Routes
app.use("/api/v1/banking", bankingRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server is listening on port: ${PORT}`);
  });
});
