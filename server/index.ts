import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

import { sendContactEmail } from '../../GNAwebsite/lib/email';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({
        error: 'Tous les champs sont requis',
        missing: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          phone: !phone,
          message: !message,
        },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    if (phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide' });
    }

    const result = await sendContactEmail({
      firstName,
      lastName,
      email,
      phone,
      message,
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Email envoyé avec succès',
      });
    } else {
      console.error('Erreur Resend:', result.error);
      return res.status(500).json({
        error: "Erreur lors de l'envoi de l'email",
      });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📧 API de contact disponible sur http://localhost:${PORT}/api/contact`);
});

export default app;
