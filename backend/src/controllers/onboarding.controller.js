import { generateOnboardingDoc } from "../services/onboarding.service.js";

export const getOnboardingDoc = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const markdown = await generateOnboardingDoc(repoId);
    res.status(200).json({ success: true, markdown });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};