import { syncRepo } from "../services/sync.service.js";

export const syncRepoHandler = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const result = await syncRepo(repoId, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};