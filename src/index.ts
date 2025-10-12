// src/index.ts
import express from 'express';
import cors from 'cors';
import router from './routes/dashboard';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 🆕 PARA QUERY PARAMETERS

app.use('/api/dashboard', router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
