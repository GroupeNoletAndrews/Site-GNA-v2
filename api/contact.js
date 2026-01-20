import { Resend } from 'resend';

// Fonction helper pour définir les headers CORS
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Content-Type', 'application/json');
}

export default async function handler(req, res) {
  // Gestion des requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res);
    return res.status(405).json({ 
      success: false,
      error: 'Méthode non autorisée' 
    });
  }

  try {
    // Parse du body si nécessaire
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        setCORSHeaders(res);
        return res.status(400).json({
          success: false,
          error: 'Format JSON invalide'
        });
      }
    }

    const { firstName, lastName, email, phone, message } = body || {};

    if (!firstName || !lastName || !email || !phone || !message) {
      setCORSHeaders(res);
      return res.status(400).json({
        success: false,
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
      setCORSHeaders(res);
      return res.status(400).json({ 
        success: false,
        error: 'Email invalide' 
      });
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setCORSHeaders(res);
      return res.status(400).json({ 
        success: false,
        error: 'Numéro de téléphone invalide' 
      });
    }

    const resend = new Resend(process.env.API_KEY_RESEND);

    const htmlTemplate = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nouvelle demande de contact - Groupe Nolet & Andrews</title>
    <style>
      body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; }
      .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 30px; text-align: center; }
      .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; }
      .header p { margin: 10px 0 0 0; color: #cbd5e1; font-size: 14px; }
      .content { padding: 40px 30px; }
      .info-block { margin-bottom: 30px; padding-bottom: 25px; border-bottom: 1px solid #e5e7eb; }
      .info-block:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px; }
      .value { font-size: 16px; color: #1f2937; line-height: 1.5; word-wrap: break-word; }
      .value a { color: #3b82f6; text-decoration: none; }
      .message-box { background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 6px; margin-top: 8px; }
      .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
      .footer p { margin: 5px 0; color: #6b7280; font-size: 13px; }
      .badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>📬 Nouvelle demande de contact</h1>
        <p>Groupe Nolet & Andrews</p>
        <span class="badge">${new Date().toLocaleDateString('fr-CA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}</span>
      </div>
      <div class="content">
        <div class="info-block">
          <span class="label">Prénom</span>
          <div class="value">${firstName}</div>
        </div>
        <div class="info-block">
          <span class="label">Nom de famille</span>
          <div class="value">${lastName}</div>
        </div>
        <div class="info-block">
          <span class="label">Adresse email</span>
          <div class="value"><a href="mailto:${email}">${email}</a></div>
        </div>
        <div class="info-block">
          <span class="label">Numéro de téléphone</span>
          <div class="value"><a href="tel:${phone}">${phone}</a></div>
        </div>
        <div class="info-block">
          <span class="label">Message</span>
          <div class="message-box">
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      </div>
      <div class="footer">
        <p><strong>Groupe Nolet & Andrews</strong></p>
        <p>Consultation et gestion d'entreprise</p>
      </div>
    </div>
  </body>
</html>`;

    const result = await resend.emails.send({
      from: 'Site Web GNA <noreply@noletandrews.ca>',
      to: [process.env.CONTACT_EMAIL || 'info@noletandrews.ca'],
      replyTo: email,
      subject: `Nouvelle demande de contact - ${firstName} ${lastName}`,
      html: htmlTemplate,
      text: `Nouvelle demande de contact\n\nPrénom: ${firstName}\nNom: ${lastName}\nEmail: ${email}\nTéléphone: ${phone}\n\nMessage:\n${message}`,
    });

    if (!result.data) {
      console.error('Resend API Error:', result);
      throw new Error('Erreur lors de l\'envoi de l\'email via Resend');
    }

    setCORSHeaders(res);
    return res.status(200).json({
      success: true,
      message: 'Email envoyé avec succès',
      data: result.data,
    });
  } catch (error) {
    console.error('Erreur API:', error);
    setCORSHeaders(res);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
}
