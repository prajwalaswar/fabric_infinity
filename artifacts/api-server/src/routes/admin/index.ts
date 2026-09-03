import { Router, type IRouter } from "express";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import productsRouter from "./products";
import ordersRouter from "./orders";
import categoriesRouter from "./categories";
import bannersRouter from "./banners";
import customersRouter from "./customers";
import settingsRouter from "./settings";
import aiRouter from "./ai";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(authRouter);
router.use(dashboardRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(categoriesRouter);
router.use(bannersRouter);
router.use(customersRouter);
router.use(settingsRouter);
router.use(aiRouter);
router.use(uploadRouter);

export default router;
