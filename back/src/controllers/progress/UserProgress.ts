import { type Request,type  Response } from "express";
import { openQuestionService, updateStatusService } from "../../Services/progress/UserProgress.js";

// when user clicks a question
export const openQuestion = async (req: Request, res: Response) => {
  try {
    const qid = Number(req.params.qid);
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "uid required" });
    }

    const result = await openQuestionService(uid, qid);

    res.json({
      message: "visited updated",
      data: result,
    });

  } catch (err) {
    res.status(500).json({ message: "error" });
  }
};


// when user marks done / revise
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const qid = Number(req.params.qid);
    const { uid, status } = req.body;

    const result = await updateStatusService(uid, qid, status);

    res.json({
      message: "status updated",
      data: result,
    });

  } catch (err) {
    res.status(500).json({ message: "error" });
  }
};
