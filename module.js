document.addEventListener('DOMContentLoaded', function() {
  const btnCalculate = document.querySelector('.btn-calculate');
  if (btnCalculate) {
    btnCalculate.addEventListener('click', calculerImpactCA);
  }
});

function calculerImpactCA() {
  const trafic = parseFloat(document.getElementById('trafic').value) || 0;
  const ventes = parseFloat(document.getElementById('ventes').value) || 0;
  const panier = parseFloat(document.getElementById('panier').value) || 0;

  if (trafic <= 0 || ventes <= 0 || panier <= 0) {
    alert('Veuillez renseigner tous les champs avec des valeurs positives.');
    return;
  }

  // === LOGIQUE DE CALCUL (Performance uniquement) ===
  
  // Situation AVANT
  const tauxConversion = ventes / trafic;
  const caAvant = ventes * panier;

  // Situation APRÈS (+33% trafic, +29.5% panier)
  const traficApres = trafic * 1.33; 
  const ventesApres = traficApres * tauxConversion;
  const panierApres = panier * 1.295; 
  const caApres = ventesApres * panierApres;
  
  // Gains
  const gainMensuel = caApres - caAvant;
  const gainAnnuel = gainMensuel * 12;
  //const gainPourcent = ((caApres - caAvant) / caAvant) * 100;

  // === AFFICHAGE ===
  document.getElementById('trafic_avant').textContent = formatNumber(trafic) + ' visiteurs';
  document.getElementById('ventes_avant').textContent = formatNumber(ventes) + ' ventes';
  document.getElementById('panier_avant').textContent = formatEuro(panier);
  document.getElementById('ca_avant').textContent = formatEuro(caAvant);

  document.getElementById('trafic_apres').textContent = formatNumber(Math.round(traficApres)) + ' visiteurs';
  document.getElementById('ventes_apres').textContent = formatNumber(Math.round(ventesApres)) + ' ventes';
  document.getElementById('panier_apres').textContent = formatEuro(panierApres);
  document.getElementById('ca_apres').textContent = formatEuro(caApres);

  document.getElementById('gain_mensuel').textContent = formatEuro(gainMensuel);
  document.getElementById('gain_annuel').textContent = formatEuro(gainAnnuel);
  //document.getElementById('gain_percent').textContent = '+' + gainPourcent.toFixed(1) + '% de CA';

  // Affichage de la section résultats
  const resultsSection = document.getElementById('results');
  resultsSection.style.display = 'block';
  
  // Réveil de la section externe HubSpot (si elle existe)
  const sectionRassurance = document.getElementById('section-rassurance');
  if (sectionRassurance) {
    sectionRassurance.style.display = 'block';
  }

  setTimeout(function() {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);

  // === TRACKING & TRANSFERT ===
  // On transfère uniquement les données de "Potentiel", pas de ROI
  const donneesATransferer = {
    'trafic_visiteurs_mensuel': trafic,
    'gain_mensuel_estime': Math.round(gainMensuel)
    // On n'envoie plus ROI ni Budget puisqu'ils ne sont pas calculés
  };

  for (const [nomInterne, valeur] of Object.entries(donneesATransferer)) {
    const champ = document.querySelector(`input[name="${nomInterne}"]`);
    if (champ) {
      champ.value = valeur;
      champ.dispatchEvent(new Event('input', { bubbles: true }));
      champ.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  if (typeof window._hsq !== 'undefined') {
    window._hsq.push(['trackCustomBehavioralEvent', {
      name: 'calculateur_ca_utilise', // J'ai changé le nom de l'event pour être précis
      properties: { gain_mensuel: gainMensuel }
    }]);
  }
}

function formatEuro(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}
function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(value);
}
