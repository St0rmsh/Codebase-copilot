import { traceSymbol } from "../services/traceGraph.service.js";

export const trace = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { symbolName } = req.query;

    if (!symbolName) {
      res.status(400);
      throw new Error("symbolName query param is required");
    }

    const result = await traceSymbol(repoId, symbolName);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};