import crypto from "crypto";
import { stableStringify } from "../utils/stableStringify.js";

export class Block {
    constructor(index, timestamp, data, previousHash = "") {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        const blockData = {
            index: this.index,
            timestamp: this.timestamp,
            data: this.data,
            previousHash: this.previousHash,
            nonce: this.nonce,
        };

        return crypto
            .createHash("sha256")
            .update(stableStringify(blockData))
            .digest("hex");
    }

    mineBlock(difficulty) {
        const target = "0".repeat(difficulty);

        while (!this.hash.startsWith(target)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        return this;
    }
}