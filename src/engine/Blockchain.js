import { Block } from "./Block.js";

export class Blockchain {
    constructor(difficulty = 1) {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.difficulty = difficulty;
    }

    createGenesisBlock() {
        return new Block(
            0,
            Date.now(),
            [
                {
                    type: "GENESIS",
                    message: "Genesis Block",
                },
            ],
            "0"
        );
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    getCurrentOwner(serialNumber) {
        let currentOwner = null;

        for (const block of this.chain) {
            for (const transaction of block.data) {
                if (transaction.serialNumber === serialNumber) {
                    currentOwner = transaction.toAddress;
                }
            }
        }

        for (const transaction of this.pendingTransactions) {
            if (transaction.serialNumber === serialNumber) {
                currentOwner = transaction.toAddress;
            }
        }

        return currentOwner;
    }

    addTransaction(transaction) {
        const {
            serialNumber,
            fromAddress,
            toAddress,
            timestamp,
        } = transaction;

        if (!serialNumber || !fromAddress || !toAddress || !timestamp) {
            throw new Error("Transaction is missing required fields");
        }

        const currentOwner = this.getCurrentOwner(serialNumber);

        if (currentOwner && currentOwner !== fromAddress) {
            throw new Error(
                `Invalid ownership transfer. Current owner is ${currentOwner}`
            );
        }

        this.pendingTransactions.push({
            serialNumber,
            fromAddress,
            toAddress,
            timestamp,
        });

        return transaction;
    }

    minePendingTransactions() {
        if (this.pendingTransactions.length === 0) {
            throw new Error("No pending transactions to mine");
        }

        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            [...this.pendingTransactions],
            this.getLatestBlock().hash
        );

        newBlock.mineBlock(this.difficulty);

        this.chain.push(newBlock);
        this.pendingTransactions = [];

        return newBlock;
    }

    getProductHistory(serialNumber) {
        const history = [];

        for (const block of this.chain) {
            for (const transaction of block.data) {
                if (transaction.serialNumber === serialNumber) {
                    history.push(transaction);
                }
            }
        }

        return {
            serialNumber,
            currentOwner:
                history.length > 0
                    ? history[history.length - 1].toAddress
                    : null,
            history,
        };
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}