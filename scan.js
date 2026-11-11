// Fonction serverless Vercel : lit une capture TradingView et renvoie les données du trade.
// La clé API reste côté serveur (variable d’environnement), jamais dans la page.

const PROMPT = `Tu lis une capture d’écran TradingView d’un trade. Réponds uniquement par un objet JSON, sans texte autour, avec ces clés : symbol (ticker sans bourse ni suffixe, par exemple ES, NQ, EURUSD, BTCUSD), side ("long" ou "short"), entry, exit, stop, target (nombres : prix lus sur le graphique ou sur l’outil Position longue/courte), size (quantité ou contrats si visible), date (AAAA-MM-JJ si visible), fees (frais si visibles). Mets null pour toute valeur que tu ne peux pas lire avec certitude. N’invente rien : si la sortie n’est pas clairement indiquée, mets exit à null.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  // Protège ta clé API : sans le bon code, personne ne peut utiliser cette route.
  const code = process.env.APP_CODE;
  if (!code || req.headers['x-access-code'] !== code) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'no_key' });

  const image = req.body && req.body.image;
  if (typeof image !== 'string' || image.length < 100 || image.length > 4000000) {
    return res.status(400).json({ error: 'image' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            { type: 'text', text: PROMPT }
          ]
        }]
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'upstream' });
    const d = await r.json();
    const txt = (d.content || []).map(c => c.text || '').join('');
    const m = txt.match(/\{[\s\S]*\}/);
    return res.status(200).json(m ? JSON.parse(m[0]) : {});
  } catch (e) {
    return res.status(500).json({ error: 'server' });
  }
};
