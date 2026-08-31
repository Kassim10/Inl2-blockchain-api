import express from "express";
import {
    addTransaction,
    mineTransactions,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/transactions", addTransaction);
router.post("/mine", mineTransactions);

export default router;