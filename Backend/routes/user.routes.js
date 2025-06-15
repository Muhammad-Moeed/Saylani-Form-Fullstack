import express from 'express';
import { createUser, getUserByCnic } from '../controllers/user.controller.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/create', upload.single('image'), createUser);
router.get('/:cnic', getUserByCnic);

export default router;