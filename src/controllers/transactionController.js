import blockchain from "../blockchain.js";

export function getChain(req, res) {
    res.status(200).json({
        chain: blockchain.chain,
        pendingTransactions: blockchain.pendingTransactions,
        valid: blockchain.isChainValid(),
    });
}

export function addTransaction(req, res, next) {
    try {
        const transaction = blockchain.addTransaction(req.body);

        res.status(201).json({
            message: "Transaction added to pending pool",
            transaction,
        });
    } catch (error) {
        next(error);
    }
}

export function mineTransactions(req, res, next) {
    try {
        const block = blockchain.minePendingTransactions();

        res.status(201).json({
            message: "Block mined successfully",
            block,
        });
    } catch (error) {
        next(error);
    }
}

export function verifyProduct(req, res, next) {
    try {
        const { id } = req.params;
        const result = blockchain.getProductHistory(id);

        if (result.history.length === 0) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}