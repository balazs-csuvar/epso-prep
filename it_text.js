/* Spiegazioni in italiano delle regole delle domande di ragionamento astratto.
   Le figure non dipendono dalla lingua: il test EPSO in italiano usa lo stesso formato
   (serie di cinque figure, scegli la sesta). Regole nello stesso ordine di data.js. */
(function (root) {
  'use strict';

  const abstract = {
    A1: { family: ['Movimento', 'Colore'], rules: [
      'Il punto nero si sposta di un angolo in senso orario a ogni figura: in alto a sinistra → in alto a destra → in basso a destra → in basso a sinistra → in alto a sinistra. Nella figura 6 deve trovarsi in alto a destra.',
      'Il quadrato centrale alterna bianco, nero, bianco, nero… La figura 6 è in posizione pari, quindi il quadrato è nero.'] },
    A2: { family: ['Rotazione', 'Conteggio'], rules: [
      'La freccia ruota di 45° in senso orario a ogni figura (su, su-destra, destra, giù-destra, giù). Poi punta in basso a sinistra (225°).',
      'I punti alternano 1, 2, 1, 2, 1… quindi la figura 6 ha 2 punti.'] },
    A3: { family: ['Conteggio (lati)', 'Colore'], rules: [
      'La figura guadagna un lato a ogni passo: triangolo (3), quadrato (4), pentagono (5), esagono (6), ettagono (7). La figura 6 è un ottagono (8 lati). Conta i lati: non andare a occhio.',
      'Il riempimento segue il ciclo bianco → grigio → nero e poi ricomincia. La figura 6 è il terzo passo del secondo ciclo: nera.'] },
    A4: { family: ['Movimento', 'Ogni due figure'], rules: [
      'Il cerchio bianco si sposta di un angolo in senso orario solo ogni DUE figure (in alto a sinistra, in alto a sinistra, in alto a destra, in alto a destra, in basso a destra…). Nella figura 6 resta in basso a destra.',
      'Il quadrato grigio percorre l’anello esterno in senso orario, una casella alla volta: in alto al centro, in alto a destra, al centro a destra, in basso a destra, in basso al centro… poi in basso a sinistra.'] },
    A5: { family: ['Riflessione', 'Conteggio'], rules: [
      'Il triangolo viene ribaltato a ogni figura, alternando un ribaltamento sinistra–destra e uno alto–basso. L’angolo retto va: in basso a sinistra → in basso a destra → in alto a destra → in alto a sinistra → in basso a sinistra. Il prossimo ribaltamento è sinistra–destra, quindi l’angolo retto finisce in basso a destra.',
      'A ogni figura scompare un punto: 6, 5, 4, 3, 2 → 1.'] },
    A6: { family: ['Istruzione', 'Rotazione'], rules: [
      'I punti non seguono una sequenza propria: sono un’istruzione. Il numero di punti in una figura decide il colore del cerchio nella figura SUCCESSIVA: 1 punto → bianco, 2 → grigio, 3 → nero. La figura 5 ha 2 punti, quindi nella figura 6 il cerchio è grigio. (Tutte le opzioni hanno 1 punto, quindi il numero di punti non decide nulla.)',
      'La piccola freccia ruota di 90° in senso orario a ogni figura: su, destra, giù, sinistra, su → destra.'] },
    A7: { family: ['Rotazione crescente', 'Dimensione'], rules: [
      'La freccia ruota di un angolo sempre maggiore: +45°, +90°, +135°, +180°. La prossima rotazione è di +225°. Da 90° (destra): 90 + 225 = 315°, cioè verso l’alto a sinistra. Con un passo costante di 45° si otterrebbe 135°: è la trappola.',
      'Il quadrato segue il ciclo piccolo → medio → grande. La figura 6 è grande.'] },
    A8: { family: ['Conteggio (lati totali)'], rules: [
      'Le figure cambiano senza uno schema, quindi conta. Numero totale di lati per figura: 3+4 = 7, 5+4 = 9, 6+5 = 11, 6+3+4 = 13, 5+5+5 = 15. Il totale cresce di 2 ogni volta, quindi la figura 6 ha 17 lati (6+6+5).'] },
    A9: { family: ['Movimento (due direzioni)', 'Rotazione'], rules: [
      'Il cerchio bianco gira in senso orario sull’anello esterno, una casella per figura: in alto a sinistra, in alto al centro, in alto a destra, al centro a destra, in basso a destra → in basso al centro.',
      'Il quadrato nero gira in senso ANTIORARIO sull’anello, due caselle per figura: in basso al centro → al centro a destra → in alto al centro → al centro a sinistra → in basso al centro → al centro a destra.',
      'Il triangolo centrale ruota di 90° in senso orario a ogni figura: su, destra, giù, sinistra, su → destra.'] },
    A10: { family: ['Colore (lo schema ruota)', 'Ciclo ripetuto'], rules: [
      'I colori dei quattro quarti ruotano di un quarto in senso orario a ogni figura. Segui il quarto nero: in alto a sinistra → in alto a destra → in basso a destra → in basso a sinistra → in alto a sinistra → in alto a destra. Nella figura 6 il nero è in alto a destra e il grigio in basso a sinistra.',
      'La forma centrale ripete cerchio → triangolo → quadrato. La figura 6 è un quadrato.'] },
    A11: { family: ['Istruzione (la freccia indica)', 'Dimensione'], rules: [
      'La freccia non ruota secondo uno schema: è un’istruzione. In ogni figura indica la casella in cui si troverà il cerchio nella figura SUCCESSIVA. Nella figura 5 punta verso l’alto, quindi nella figura 6 il cerchio è in alto al centro.',
      'Il cerchio alterna piccolo, grande, piccolo, grande… La figura 6 è grande.'] },
    A12: { family: ['Movimento', 'Rotazione (trappola della simmetria)', 'Conteggio'], rules: [
      'Il punto nero si sposta di un angolo in senso ANTIORARIO a ogni figura: in alto a destra → in alto a sinistra → in basso a sinistra → in basso a destra → in alto a destra → in alto a sinistra.',
      'Il segmento ruota di 45° in senso orario a ogni figura: | / — \\ |. Un segmento appare uguale dopo 180°, quindi la figura 5 sembra la figura 1 e la figura 6 sembra la figura 2: «/».',
      'I quadratini contano 1, 2, 3, 1, 2 → 3 (un ciclo che si ripete, non +1 all’infinito).'] },
    A13: { family: ['Istruzione (le forme viaggiano)', 'Colore dello sfondo'], rules: [
      'Lo sfondo alterna bianco e grigio. La figura 6 è grigia.',
      'Confrontando la stessa posizione da una figura all’altra non c’è schema. Le forme invece viaggiano: la forma in alto a sinistra diventa la grande forma centrale nella figura successiva. Nella figura 5 c’è un rombo in alto a sinistra, quindi nella figura 6 il rombo è al centro.',
      '…e la forma centrale passa nell’angolo in basso a destra nella figura successiva. Nella figura 5 al centro c’è un cerchio, quindi nella figura 6 il cerchio è in basso a destra. (La nuova forma in alto a sinistra è uguale in tutte le opzioni: ignorala.)'] },
    A14: { family: ['Dimensione', 'Rotazione', 'Conteggio'], rules: [
      'Il cerchio segue il ciclo grande → medio → piccolo, poi ricomincia. La figura 6 è piccola.',
      'Il triangolo alterna punta in su e punta in giù. Nella figura 6 punta in giù.',
      'A ogni figura si aggiunge un punto: 1, 2, 3, 4, 5 → 6.'] },
    A15: { family: ['Serie alternate'], rules: [
      'Le figure 1, 3, 5 e le figure 2, 4, 6 sono due serie distinte che si alternano. La figura 6 appartiene alla serie dei cerchi.',
      'Nella serie dei cerchi (figure 2 e 4) il numero di cerchi neri va 1, 2 → quindi la figura 6 ne ha 3.',
      'In quella serie i cerchi sono sempre neri.'] },
    A16: { family: ['Istruzione (il numero decide la rotazione)', 'Movimento'], rules: [
      'La freccia non ruota di un angolo fisso (+90, +180, +270, +90…). L’istruzione è il numero di punti: la freccia ruota di 90° in senso orario per ogni punto della figura PRECEDENTE. La figura 5 ha 2 punti, quindi la freccia ruota di 180°, da sinistra (270°) a destra (90°). Con un +90° costante si otterrebbe «su», che è sbagliato.',
      'Il quadrato bianco si sposta di un angolo in senso orario a ogni figura: in alto a sinistra → in alto a destra → in basso a destra → in basso a sinistra → in alto a sinistra → in alto a destra.'] },
    A17: { family: ['Movimento collegato', 'Rotazione (135° antiorario)'], rules: [
      'Il cerchio nero si sposta di un angolo in senso orario a ogni figura: in alto a sinistra → in alto a destra → in basso a destra → in basso a sinistra → in alto a sinistra → in alto a destra.',
      'Il quadrato grigio sta sempre nell’angolo diagonalmente opposto al cerchio, quindi si muove anch’esso in senso orario: in basso a destra → in basso a sinistra → in alto a sinistra → in alto a destra → in basso a destra → in basso a sinistra.',
      'La freccia ruota di 135° in senso ANTIORARIO a ogni figura: su → giù-sinistra → destra → su-sinistra → giù → su-destra. Ruotando di 135° in senso orario da «giù» si otterrebbe su-sinistra: è la trappola.'] },
    A18: { family: ['Conteggio (somma dei due precedenti)', 'Proprietà (pari/dispari)'], rules: [
      'Ogni numero di punti è la somma dei due precedenti: 1, 1, 2 (1+1), 3 (1+2), 5 (2+3) → 3 + 5 = 8. Le differenze crescono (0, 1, 1, 2), quindi chi tira a indovinare «+1» o «+2» cade nelle trappole 6 e 7.',
      'Il cerchio è nero quando il numero di punti è dispari e bianco quando è pari. 8 è pari, quindi il cerchio è bianco.'] },
    A19: { family: ['Movimento (passo crescente)', 'Colore (avanti e indietro)'], rules: [
      'Il punto percorre l’anello esterno in senso orario, facendo un passo in più ogni volta: in alto a sinistra → in alto al centro (1 passo) → al centro a destra (2) → in basso a sinistra (3) → in alto a destra (4). Poi fa 5 passi: al centro a destra, in basso a destra, in basso al centro, in basso a sinistra, al centro a sinistra.',
      'Il quadrato va bianco → grigio → nero e poi torna indietro: grigio, bianco, grigio. Rimbalza invece di ricominciare, quindi la figura 6 è grigia, non nera.'] },
    A20: { family: ['Istruzione (il colore decide la direzione)', 'Conteggio (+2, −1)'], rules: [
      'Le rotazioni della freccia sembrano casuali (+90°, −90°, −90°, +90°). Il quadratino è un’istruzione: se è nero, nella figura successiva la freccia ruota di 90° in senso orario; se è bianco, di 90° in senso antiorario. Nella figura 5 il quadratino è bianco, quindi la freccia passa da su a sinistra. (Il quadratino della figura 6 è uguale in tutte le opzioni: ignoralo.)',
      'I punti vanno +2, −1, +2, −1: 1, 3, 2, 4, 3 → 5.'] },
    A21: { family: ['Serie alternate', 'Rotazione (due velocità)'], rules: [
      'Dividi la sequenza in due serie. Le figure 1, 3, 5 hanno sempre 3 punti. Le figure 2, 4, 6 contano 1, 2 → 3 punti.',
      'Nelle figure 1, 3, 5 la freccia ruota di 90° in senso orario (su, destra, giù). Nelle figure 2, 4, 6 ruota di 45° in senso ANTIORARIO: giù → giù-destra → destra. Continuando la serie dispari si otterrebbe «sinistra»: è la trappola.'] },
    A22: { family: ['Conteggio (due conteggi)', 'Posizioni casuali (distrattore)'], rules: [
      'Ignora dove si trovano i cerchi: le posizioni cambiano senza schema. Contali. Il totale cresce di uno a ogni figura: 3, 4, 5, 6, 7 → 8.',
      'Il numero di cerchi NERI cresce di uno ogni due figure: 1, 1, 2, 2, 3 → 3.'] },
    A23: { family: ['Colore (due direzioni)', 'Serie alternate'], rules: [
      'Il quarto nero si sposta in senso orario: in alto a sinistra → in alto a destra → in basso a destra → in basso a sinistra → in alto a sinistra → in alto a destra.',
      'Il quarto grigio si muove nel verso OPPOSTO, antiorario: in alto a destra → in alto a sinistra → in basso a sinistra → in basso a destra → in alto a destra → in alto a sinistra.',
      'La forma centrale ha due serie: le figure 1, 3, 5 mostrano sempre un triangolo, mentre le figure 2, 4, 6 aggiungono un lato ogni volta (quadrato, pentagono → esagono).'] },
    A24: { family: ['Istruzione (i lati diventano punti)', 'Proprietà (pari/dispari)'], rules: [
      'Il numero di punti copia il numero di lati della figura PRECEDENTE: pentagono → 5 punti, triangolo → 3 punti, esagono → 6, quadrato → 4. La figura 5 mostra un pentagono, quindi la figura 6 ha 5 punti. (Contando i lati della forma nella stessa figura si cade nella trappola dei 4 punti.)',
      'Le figure con un numero pari di lati sono grigie, quelle con un numero dispari sono bianche. Tutte le opzioni mostrano un quadrato (4 lati), quindi deve essere grigio.'] },
  };

  const api = { abstract };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EPSO_TX_IT = api;
})(this);
