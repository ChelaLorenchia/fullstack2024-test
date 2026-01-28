import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import clientRoutes from './routes/clientRoutes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/clients', clientRoutes);

app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));