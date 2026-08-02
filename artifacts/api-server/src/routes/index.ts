import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import bannersRouter from "./banners";
import reviewsRouter from "./reviews";
import ordersRouter from "./orders";
import couponsRouter from "./coupons";
import authRouter from "./auth";
import adminRouter from "./admin";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(bannersRouter);
router.use(reviewsRouter);
router.use(ordersRouter);
router.use(couponsRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(contactRouter);

export default router;
