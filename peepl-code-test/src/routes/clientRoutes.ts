import { Router } from 'express';
import { createClient, getClients, updateClient, deleteClient } from '../controllers/clientController';
import { upload } from '../config/storage';

const router = Router();

router.post('/', upload.single('client_logo'), createClient); // Upload file via key 'client_logo'
router.get('/', getClients);
router.put('/:id', upload.single('client_logo'), updateClient);
router.delete('/:id', deleteClient);

export default router;
