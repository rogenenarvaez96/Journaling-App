import express from "express";
import { 
  getJournals, 
  getJournalById, 
  createJournal, 
  updateJournal, 
  deleteJournal 
} from "../controllers/journalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All journal routes are strictly protected by session authentication
router.use(protect);

router.route("/")
  .get(getJournals)
  .post(createJournal);

router.route("/:id")
  .get(getJournalById)
  .put(updateJournal)
  .delete(deleteJournal);

export default router;
