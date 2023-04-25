import { Router} from 'express';
  const router = Router();
import controller from './controller.js';
import validateLog from './validator.js';

router.post(
  '/register',
  validateLog.registerValidator(),
  controller.validate,
  controller.register
);

router.post(
  '/login',
  validateLog.loginValidator(),
  controller.validate,
  controller.login
);
export default router
