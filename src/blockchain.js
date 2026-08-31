import "dotenv/config";
import { Blockchain } from "./engine/Blockchain.js";

const difficulty = Number(process.env.POW_DIFFICULTY) || 1;

const blockchain = new Blockchain(difficulty);

export default blockchain;