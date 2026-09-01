import express from "express";

import chainRoutes from "./routes/chainRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Luxury Product Blockchain API",
    });
});

app.use("/api/chain", chainRoutes);
app.use("/api", transactionRoutes);
app.use("/api/verify", verifyRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;