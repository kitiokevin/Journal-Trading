# Journal de trading

Déploiement sur Vercel :

1. Installez Vercel : `npm i -g vercel`
2. Dans ce dossier : `vercel` (acceptez les réglages par défaut)
3. Ajoutez les variables d'environnement :
   - `vercel env add ANTHROPIC_API_KEY` (votre clé API Anthropic)
   - `vercel env add APP_CODE` (un code secret de votre choix)
4. Redéployez : `vercel --prod`
5. Ouvrez l'application, onglet Données, saisissez le même code d'accès.

Variable facultative : `ANTHROPIC_MODEL` pour changer de modèle.
