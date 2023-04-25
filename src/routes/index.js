import { Router } from 'express';
const router = Router();
import authRouter from './auth/index.js';
import userRouter from './user/index.js';
import adminRouter from './admin/index.js';
import { isLoggined, isAdmin } from './../middlewares/auth.js' ;
import error from './../middlewares/error.js';

router.use('/auth', authRouter);

router.use('/user', isLoggined, userRouter);
router.use('/admin', isLoggined, isAdmin, adminRouter);

router.use(error);

export default router;