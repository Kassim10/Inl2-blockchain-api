import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

describe("Blockchain API", () => {
    let app;

    beforeEach(async () => {
        vi.resetModules();

        const appModule = await import("../src/app.js");
        app = appModule.default;
    });

    it("GET /api/chain should return the blockchain", async () => {
        const response = await request(app).get("/api/chain");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("chain");
        expect(response.body).toHaveProperty("pendingTransactions");
        expect(response.body).toHaveProperty("valid");
        expect(response.body.valid).toBe(true);
    });

    it("POST /api/transactions should add a transaction", async () => {
        const response = await request(app)
            .post("/api/transactions")
            .send({
                serialNumber: "OMEGA-TEST-1001",
                fromAddress: "OMEGA",
                toAddress: "KASSIM",
                timestamp: Date.now(),
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(
            "Transaction added to pending pool"
        );
        expect(response.body.transaction.serialNumber).toBe(
            "OMEGA-TEST-1001"
        );
        expect(response.body.transaction.toAddress).toBe("KASSIM");
    });

    it("POST /api/mine should mine pending transactions", async () => {
        await request(app)
            .post("/api/transactions")
            .send({
                serialNumber: "OMEGA-TEST-1001",
                fromAddress: "OMEGA",
                toAddress: "KASSIM",
                timestamp: Date.now(),
            });

        const response = await request(app).post("/api/mine");

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Block mined successfully");
        expect(response.body.block).toHaveProperty("hash");
        expect(response.body.block).toHaveProperty("nonce");
        expect(response.body.block.data).toHaveLength(1);
    });

    it("GET /api/verify/:id should return product history", async () => {
        await request(app)
            .post("/api/transactions")
            .send({
                serialNumber: "OMEGA-TEST-1001",
                fromAddress: "OMEGA",
                toAddress: "KASSIM",
                timestamp: Date.now(),
            });

        await request(app).post("/api/mine");

        const response = await request(app).get(
            "/api/verify/OMEGA-TEST-1001"
        );

        expect(response.status).toBe(200);
        expect(response.body.serialNumber).toBe("OMEGA-TEST-1001");
        expect(response.body.currentOwner).toBe("KASSIM");
        expect(response.body.history).toHaveLength(1);
    });

    it("should reject a transfer from someone who is not the owner", async () => {
        await request(app)
            .post("/api/transactions")
            .send({
                serialNumber: "ROLEX-TEST-2001",
                fromAddress: "ROLEX",
                toAddress: "KASSIM",
                timestamp: Date.now(),
            });

        await request(app).post("/api/mine");

        const response = await request(app)
            .post("/api/transactions")
            .send({
                serialNumber: "ROLEX-TEST-2001",
                fromAddress: "ALI",
                toAddress: "JOHN",
                timestamp: Date.now(),
            });

        expect(response.status).toBe(422);
        expect(response.body.error.message).toContain(
            "Invalid ownership transfer"
        );
    });

    it("GET /api/verify/:id should return 404 for an unknown product", async () => {
        const response = await request(app).get(
            "/api/verify/DOES-NOT-EXIST"
        );

        expect(response.status).toBe(404);
        expect(response.body.error.message).toBe("Product not found");
    });

    it("should return 400 for an incomplete transaction", async () => {
        const response = await request(app)
            .post("/api/transactions")
            .send({
                serialNumber: "INVALID-1",
            });

        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe(
            "Transaction is missing required fields"
        );
    });

    it("should return 400 when mining with no pending transactions", async () => {
        const response = await request(app).post("/api/mine");

        expect(response.status).toBe(400);
        expect(response.body.error.message).toBe(
            "No pending transactions to mine"
        );
    });

    it("should return 404 for an unknown route", async () => {
        const response = await request(app).get("/api/unknown");

        expect(response.status).toBe(404);
        expect(response.body.error.status).toBe(404);
        expect(response.body.error.message).toContain("Route not found");
    });
});