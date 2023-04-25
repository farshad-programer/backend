import { Router } from "express";
 const router = Router();
import controller from "./controller.js";

router.get("/", controller.dashboard);
 export default router