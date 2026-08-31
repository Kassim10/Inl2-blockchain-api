import { describe, it, expect } from "vitest";
import { Blockchain } from "../src/engine/Blockchain.js";

describe("Blockchain", () => {
    it("should create a blockchain with a genesis block", () => {
        const blockchain = new Blockchain(1);

        expect(blockchain.chain).toHaveLength(1);
        expect(blockchain.chain[0].index).toBe(0);
        expect(blockchain.chain[0].previousHash).toBe("0");
    });

    it("should add a valid transaction to pending transactions", () => {
        const blockchain = new Blockchain(1);

        const transaction = {
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "ROLEX",
            toAddress: "KASSIM",
            timestamp: Date.now(),
        };

        blockchain.addTransaction(transaction);

        expect(blockchain.pendingTransactions).toHaveLength(1);
        expect(blockchain.pendingTransactions[0].serialNumber).toBe(
            "ROLEX-SUB-9981"
        );
    });

    it("should mine pending transactions into a new block", () => {
        const blockchain = new Blockchain(1);

        blockchain.addTransaction({
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "ROLEX",
            toAddress: "KASSIM",
            timestamp: Date.now(),
        });

        const minedBlock = blockchain.minePendingTransactions();

        expect(blockchain.chain).toHaveLength(2);
        expect(blockchain.pendingTransactions).toHaveLength(0);
        expect(minedBlock.hash.startsWith("0")).toBe(true);
    });

    it("should reject a transfer from someone who is not the owner", () => {
        const blockchain = new Blockchain(1);

        blockchain.addTransaction({
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "ROLEX",
            toAddress: "KASSIM",
            timestamp: Date.now(),
        });

        blockchain.minePendingTransactions();

        expect(() => {
            blockchain.addTransaction({
                serialNumber: "ROLEX-SUB-9981",
                fromAddress: "ALI",
                toAddress: "JOHN",
                timestamp: Date.now(),
            });
        }).toThrow("Invalid ownership transfer");
    });

    it("should allow the current owner to transfer the product", () => {
        const blockchain = new Blockchain(1);

        blockchain.addTransaction({
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "ROLEX",
            toAddress: "KASSIM",
            timestamp: Date.now(),
        });

        blockchain.minePendingTransactions();

        blockchain.addTransaction({
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "KASSIM",
            toAddress: "ALI",
            timestamp: Date.now(),
        });

        expect(blockchain.pendingTransactions).toHaveLength(1);
        expect(blockchain.pendingTransactions[0].toAddress).toBe("ALI");
    });

    it("should return the full product history", () => {
        const blockchain = new Blockchain(1);

        blockchain.addTransaction({
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "ROLEX",
            toAddress: "KASSIM",
            timestamp: Date.now(),
        });

        blockchain.minePendingTransactions();

        blockchain.addTransaction({
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "KASSIM",
            toAddress: "ALI",
            timestamp: Date.now(),
        });

        blockchain.minePendingTransactions();

        const result = blockchain.getProductHistory("ROLEX-SUB-9981");

        expect(result.history).toHaveLength(2);
        expect(result.currentOwner).toBe("ALI");
    });

    it("should validate an unchanged blockchain", () => {
        const blockchain = new Blockchain(1);

        blockchain.addTransaction({
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "ROLEX",
            toAddress: "KASSIM",
            timestamp: Date.now(),
        });

        blockchain.minePendingTransactions();

        expect(blockchain.isChainValid()).toBe(true);
    });

    it("should detect if a mined block has been modified", () => {
        const blockchain = new Blockchain(1);

        blockchain.addTransaction({
            serialNumber: "ROLEX-SUB-9981",
            fromAddress: "ROLEX",
            toAddress: "KASSIM",
            timestamp: Date.now(),
        });

        blockchain.minePendingTransactions();

        blockchain.chain[1].data[0].toAddress = "HACKER";

        expect(blockchain.isChainValid()).toBe(false);
    });
});