// src/index.ts
import express from 'express';
import cors from 'cors';
import dashboardRoutes from './routes/dashboard';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
