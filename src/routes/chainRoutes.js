import express from "express";
import { getChain } from "../controllers/transactionController.js";

const router = express.Router();

router.get("/", getChain);

export default router;