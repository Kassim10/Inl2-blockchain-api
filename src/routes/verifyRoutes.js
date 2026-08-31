import express from "express";
import { verifyProduct } from "../controllers/transactionController.js";

const router = express.Router();

router.get("/:id", verifyProduct);

export default router;