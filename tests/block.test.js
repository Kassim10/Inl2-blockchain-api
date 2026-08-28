import { describe, expect, it } from "vitest";
import { Block } from "../src/engine/Block.js";

describe("Block", () => {
    it("should create a block with a valid SHA-256 hash", () => {
        const block = new Block(
            1,
            1772188800000,
            [
                {
                    serialNumber: "ROLEX-SUB-9981",
                    fromAddress: "ROLEX",
                    toAddress: "KASSIM",
                },
            ],
            "previous-hash"
        );

        expect(block.hash).toHaveLength(64);
        expect(block.nonce).toBe(0);
    });

    it("should mine a block with the required difficulty", () => {
        const block = new Block(
            1,
            1772188800000,
            [
                {
                    serialNumber: "ROLEX-SUB-9981",
                    fromAddress: "ROLEX",
                    toAddress: "KASSIM",
                },
            ],
            "previous-hash"
        );

        block.mineBlock(2);

        expect(block.hash.startsWith("00")).toBe(true);
        expect(block.nonce).toBeGreaterThan(0);
    });

    it("should produce a different hash when the nonce changes", () => {
        const block = new Block(
            1,
            1772188800000,
            [],
            "previous-hash"
        );

        const originalHash = block.hash;

        block.nonce++;
        const newHash = block.calculateHash();

        expect(newHash).not.toBe(originalHash);
    });
});