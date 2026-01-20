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
    const { firstName, lastName, email, phone, message } = req.body;

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
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        margin: 0; 
        padding: 0; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
        background-color: #E2E8F0; 
        color: #1f2937;
        line-height: 1.6;
      }
      .email-wrapper {
        padding: 40px 20px;
        background-color: #E2E8F0;
      }
      .email-container { 
        max-width: 680px; 
        margin: 0 auto; 
        background-color: #ffffff; 
        border-radius: 16px; 
        overflow: hidden; 
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      }
      .header { 
        background: linear-gradient(135deg, #475569 0%, #64748b 100%); 
        padding: 48px 40px; 
        position: relative;
      }
      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        opacity: 0.3;
      }
      .header-content {
        position: relative;
        z-index: 1;
      }
      .header h1 { 
        margin: 0 0 8px 0; 
        color: #ffffff; 
        font-size: 32px; 
        font-weight: 400;
        letter-spacing: -0.5px;
      }
      .header .subtitle { 
        margin: 0 0 16px 0; 
        color: #cbd5e1; 
        font-size: 15px;
        font-weight: 300;
        letter-spacing: 0.3px;
      }
      .header .timestamp { 
        display: inline-block;
        background-color: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        color: #ffffff; 
        padding: 8px 16px; 
        border-radius: 20px; 
        font-size: 12px; 
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .content { 
        padding: 48px 40px; 
        background-color: #ffffff;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 32px;
      }
      .info-block { 
        margin-bottom: 0;
      }
      .info-block.full-width {
        grid-column: 1 / -1;
      }
      .label { 
        display: block; 
        font-size: 11px; 
        font-weight: 600; 
        text-transform: uppercase; 
        letter-spacing: 1.2px; 
        color: #64748b; 
        margin-bottom: 8px;
      }
      .value { 
        font-size: 16px; 
        color: #1e293b; 
        line-height: 1.6; 
        word-wrap: break-word;
        font-weight: 400;
      }
      .value a { 
        color: #475569; 
        text-decoration: none;
        transition: color 0.2s;
      }
      .value a:hover { 
        color: #334155;
        text-decoration: underline;
      }
      .message-box { 
        background-color: #f1f5f9; 
        border-left: 4px solid #475569; 
        padding: 24px; 
        border-radius: 8px; 
        margin-top: 8px;
      }
      .message-box .value {
        color: #334155;
        white-space: pre-wrap;
      }
      .footer { 
        background-color: #f8fafc; 
        padding: 32px 40px; 
        text-align: center; 
        border-top: 1px solid #e2e8f0;
      }
      .footer .company-name {
        font-size: 18px;
        font-weight: 500;
        color: #1e293b;
        margin-bottom: 6px;
        letter-spacing: -0.3px;
      }
      .footer .tagline {
        font-size: 13px;
        color: #64748b;
        margin-bottom: 0;
        font-weight: 300;
      }
      .divider {
        height: 1px;
        background: linear-gradient(to right, transparent, #e2e8f0, transparent);
        margin: 32px 0;
      }
      @media only screen and (max-width: 600px) {
        .email-wrapper {
          padding: 20px 10px;
        }
        .header, .content, .footer {
          padding: 32px 24px;
        }
        .header h1 {
          font-size: 26px;
        }
        .info-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="email-container">
        <div class="header">
          <div class="header-content">
            <h1>Nouvelle demande de contact</h1>
            <p class="subtitle">Groupe Nolet & Andrews</p>
            <span class="timestamp">${new Date().toLocaleDateString('fr-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
          </div>
        </div>
        <div class="content">
          <div class="info-grid">
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
            <div class="info-block full-width">
              <span class="label">Message</span>
              <div class="message-box">
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <p class="company-name">Groupe Nolet & Andrews</p>
          <p class="tagline">Une vision 360° de vos affaires. Technologies, gestion, finances.</p>
        </div>
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
