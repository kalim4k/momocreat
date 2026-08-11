import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Notre prestataire de paiement reconstruit l'URL de retour en "base + / + chemin", ce qui
// produit un "//" en tête (ex: //payment/confirm). React Router ne matche pas ce chemin :
// il tombe sur la route catch-all et renvoie à l'accueil, ce qui interrompt silencieusement
// la confirmation du paiement. On normalise donc AVANT que le routeur ne lise l'URL.
const {pathname, search, hash} = window.location;
if (pathname.startsWith('//')) {
  window.history.replaceState(null, '', pathname.replace(/^\/+/, '/') + search + hash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
