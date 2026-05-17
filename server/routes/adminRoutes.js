import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/adminController.js";
import { protect, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are protected and require the 'admin' role
router.use(protect);
router.use(authorizeRole("admin"));

// Define standard REST routes for user management
router.route("/users")
  .get(getUsers)
  .post(createUser);

router.route("/users/:id")
  .patch(updateUser)
  .delete(deleteUser);

export default router;
