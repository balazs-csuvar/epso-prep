/* Banca di domande scritta direttamente in italiano (non tradotta), nel formato EPSO.
   Verbale: brani originali su temi UE e italiani; ogni domanda ha una sola affermazione vera.
   Numerico: dati illustrativi; le risposte sono calcolate da compute(), non scritte a mano. */
(function (root) {
  'use strict';
  const it = (v, d = 1) => v.toFixed(d).replace('.', ',');
  const pct = (v, d = 1) => (v >= 0 ? '+' : '−') + it(Math.abs(v), d) + '%';
  const pp = (v, d = 1) => (v >= 0 ? '+' : '−') + it(Math.abs(v), d) + ' p.p.';
  const NOTE = 'Dati illustrativi a scopo di esercitazione.';

  /* ---------- NUMERICO ---------- */
  const datasets = {
    turismo: {
      title: 'Movimento turistico negli esercizi ricettivi di cinque regioni (migliaia)',
      note: NOTE + ' Arrivi = clienti registrati nelle strutture; presenze = notti trascorse.',
      kind: 'table', cols: ['Regione', 'Arrivi 2024', 'Arrivi 2025', 'Presenze 2025'],
      rows: [['Veneto', 21400, 22100, 72900], ['Toscana', 14800, 15300, 47100], ['Lombardia', 18200, 19400, 47500], ['Lazio', 13100, 14000, 39800], ['Campania', 7200, 7700, 23500]],
    },
    pnrr: {
      title: 'Progetti PNRR di un comune al 31 dicembre 2025 (migliaia di €)',
      note: NOTE,
      kind: 'table', cols: ['Progetto', 'Risorse assegnate', 'Spesa sostenuta', 'Avanzamento lavori (%)'],
      rows: [['Scuola', 2400, 1560, 75], ['Asilo nido', 1800, 630, 40], ['Pista ciclabile', 950, 760, 85], ['Digitalizzazione', 600, 510, 90], ['Efficienza energetica', 1250, 500, 60]],
    },
    export: {
      title: 'Esportazioni di vini DOP di un consorzio per mercato (milioni di €)',
      note: NOTE,
      kind: 'table', cols: ['Mercato', '2024', '2025'],
      rows: [['Stati Uniti', 182, 171], ['Germania', 126, 133], ['Regno Unito', 94, 101], ['Svizzera', 41, 44], ['Canada', 37, 42], ['Totale', 480, 491]],
    },
    treni: {
      title: 'Collegamenti ferroviari ad alta velocità',
      note: NOTE,
      kind: 'table', cols: ['Tratta', 'Distanza (km)', 'Durata (minuti)', 'Prezzo base (€)'],
      rows: [['Milano–Roma', 570, 190, 89], ['Roma–Napoli', 225, 70, 45], ['Torino–Milano', 145, 60, 33], ['Firenze–Bologna', 95, 37, 25], ['Napoli–Salerno', 55, 37, 15]],
    },
  };
  const row = (ds, name) => datasets[ds].rows.find((r) => r[0] === name);
  const sum = (ds, k) => datasets[ds].rows.filter((r) => r[0] !== 'Totale').reduce((a, r) => a + r[k], 0);
  const argmax = (ds, f) => datasets[ds].rows.filter((r) => r[0] !== 'Totale').map((r) => [r[0], f(r)]).sort((a, b) => b[1] - a[1])[0][0];

  const numerical = [
    { id: 'IN1', ds: 'turismo', level: 'Standard',
      q: 'In quale regione la permanenza media dei turisti (presenze ÷ arrivi) è stata più alta nel 2025?',
      options: ['Veneto', 'Toscana', 'Lombardia', 'Lazio', 'Campania'],
      compute: () => argmax('turismo', (r) => r[3] / r[2]), fmt: (v) => v,
      explain: 'Presenze 2025 ÷ arrivi 2025: Veneto 72.900 ÷ 22.100 = 3,30 notti; Toscana 3,08; Campania 3,05; Lazio 2,84; Lombardia 2,45. La Lombardia ha molti arrivi ma soggiorni brevi: è la trappola per chi guarda solo i numeri grandi.' },
    { id: 'IN2', ds: 'turismo', level: 'Standard',
      q: 'Di quanto sono cresciuti, in percentuale, gli arrivi complessivi delle cinque regioni tra il 2024 e il 2025?',
      options: ['+4,8%', '+5,1%', '+3,8%', '+6,0%', '+5,4%'],
      compute: () => (sum('turismo', 2) / sum('turismo', 1) - 1) * 100, fmt: (v) => pct(v),
      explain: 'Totale 2024 = 74.700; totale 2025 = 78.500. Crescita = 3.800 ÷ 74.700 = +5,1%. Dividere per il totale 2025 dà +4,8%; fare la media semplice delle cinque variazioni regionali dà +5,4%, sbagliato perché le regioni hanno pesi diversi.' },
    { id: 'IN3', ds: 'turismo', level: 'Hard',
      q: 'Nel 2026 gli arrivi nel Lazio crescono dello stesso numero assoluto del 2025 e la permanenza media resta quella del 2025. Quante presenze registrerà il Lazio nel 2026?',
      options: ['42,5 milioni', '40,7 milioni', '42,4 milioni', '44,7 milioni', '41,8 milioni'],
      compute: () => { const r = row('turismo', 'Lazio'); return (r[2] + (r[2] - r[1])) * (r[3] / r[2]); }, fmt: (v) => it(v / 1000) + ' milioni',
      explain: 'Aumento 2025 degli arrivi: 14.000 − 13.100 = 900 mila, quindi nel 2026 gli arrivi sono 14.900 mila. Permanenza media 2025 = 39.800 ÷ 14.000 = 2,843 notti. Presenze 2026 = 14.900 × 2,843 ≈ 42.359 mila, cioè 42,4 milioni. Applicare la crescita percentuale (+6,9%) invece di quella assoluta dà 42,5; sommare 900 alle presenze dà 40,7.' },
    { id: 'IN4', ds: 'pnrr', level: 'Standard',
      q: 'Quale quota delle risorse complessivamente assegnate ai cinque progetti è stata spesa?',
      options: ['61,0%', '43,4%', '56,6%', '59,2%', '70,0%'],
      compute: () => sum('pnrr', 2) / sum('pnrr', 1) * 100, fmt: (v) => it(v) + '%',
      explain: 'Spesa totale 3.960 ÷ risorse totali 7.000 = 56,6%. La media semplice delle cinque quote di spesa (65, 35, 80, 85 e 40%) dà 61,0%, sbagliato perché i progetti hanno importi diversi; 43,4% è la quota ancora da spendere.' },
    { id: 'IN5', ds: 'pnrr', level: 'Standard',
      q: 'In quale progetto la differenza tra l’avanzamento dei lavori e la quota di risorse spese è più ampia?',
      options: ['Scuola', 'Asilo nido', 'Pista ciclabile', 'Digitalizzazione', 'Efficienza energetica'],
      compute: () => argmax('pnrr', (r) => r[3] - (r[2] / r[1]) * 100), fmt: (v) => v,
      explain: 'Quota spesa = spesa ÷ risorse: Scuola 65%, Asilo nido 35%, Pista ciclabile 80%, Digitalizzazione 85%, Efficienza energetica 40%. Differenza con l’avanzamento: 10, 5, 5, 5 e 20 punti. Il massimo è l’Efficienza energetica. L’Asilo nido ha la spesa più bassa, ma lavori e spesa vanno di pari passo.' },
    { id: 'IN6', ds: 'pnrr', level: 'Hard',
      q: 'Le risorse non ancora spese devono essere utilizzate tutte entro 8 mesi, con una spesa mensile costante. Quanto deve spendere il comune ogni mese?',
      options: ['875 mila €', '495 mila €', '380 mila €', '253 mila €', '304 mila €'],
      compute: () => (sum('pnrr', 1) - sum('pnrr', 2)) / 8, fmt: (v) => Math.round(v) + ' mila €',
      explain: 'Risorse residue = 7.000 − 3.960 = 3.040 mila €. In 8 mesi: 3.040 ÷ 8 = 380 mila € al mese. 875 divide tutte le risorse per 8; 495 divide la spesa già sostenuta; 253 usa 12 mesi invece di 8.' },
    { id: 'IN7', ds: 'export', level: 'Standard',
      q: 'Quale quota delle esportazioni totali del 2025 è andata agli Stati Uniti?',
      options: ['37,9%', '35,6%', '65,2%', '34,8%', '33,3%'],
      compute: () => row('export', 'Stati Uniti')[2] / row('export', 'Totale')[2] * 100, fmt: (v) => it(v) + '%',
      explain: '171 ÷ 491 = 34,8%. 37,9% è la quota del 2024 (182 ÷ 480); 35,6% mescola il dato 2025 con il totale 2024; 65,2% è la quota di tutti gli altri mercati.' },
    { id: 'IN8', ds: 'export', level: 'Hard',
      q: 'Di quanti punti percentuali è cambiata la quota della Germania sulle esportazioni totali tra il 2024 e il 2025?',
      options: ['+5,6 p.p.', '+7,0 p.p.', '−0,8 p.p.', '+0,8 p.p.', '+1,4 p.p.'],
      compute: () => row('export', 'Germania')[2] / row('export', 'Totale')[2] * 100 - row('export', 'Germania')[1] / row('export', 'Totale')[1] * 100, fmt: (v) => pp(v),
      explain: 'Quota 2024: 126 ÷ 480 = 26,25%. Quota 2025: 133 ÷ 491 = 27,09%. Variazione = +0,8 punti percentuali. +5,6 è la crescita percentuale delle vendite in Germania (7 ÷ 126), non una variazione di quota; +7,0 è l’aumento in milioni di €.' },
    { id: 'IN9', ds: 'export', level: 'Hard',
      q: 'Nel 2025 il cambio medio era di 1,08 dollari per euro. Se nel 2026 le vendite negli Stati Uniti restano uguali in dollari ma il cambio sale a 1,17 dollari per euro, quanto varranno in euro?',
      options: ['185,3 mln €', '157,8 mln €', '146,2 mln €', '155,6 mln €', '171,0 mln €'],
      compute: () => row('export', 'Stati Uniti')[2] * 1.08 / 1.17, fmt: (v) => it(v) + ' mln €',
      explain: 'Valore in dollari nel 2025: 171 × 1,08 = 184,68 milioni di $. Con il nuovo cambio: 184,68 ÷ 1,17 = 157,8 milioni di €. Un euro più forte riduce il valore in euro delle vendite in dollari. Invertire il rapporto dà 185,3; togliere semplicemente il 9% dà 155,6.' },
    { id: 'IN10', ds: 'treni', level: 'Standard',
      q: 'Su quale tratta la velocità media del treno è più alta?',
      options: ['Milano–Roma', 'Roma–Napoli', 'Torino–Milano', 'Firenze–Bologna', 'Napoli–Salerno'],
      compute: () => argmax('treni', (r) => r[1] / (r[2] / 60)), fmt: (v) => v,
      explain: 'Velocità = distanza ÷ tempo in ore. Roma–Napoli: 225 ÷ (70 ÷ 60) = 192,9 km/h; Milano–Roma: 570 ÷ (190 ÷ 60) = 180,0 km/h; Firenze–Bologna 154,1; Torino–Milano 145,0; Napoli–Salerno 89,2. La tratta più lunga non è la più veloce.' },
    { id: 'IN11', ds: 'treni', level: 'Hard',
      q: 'Di quanto, in percentuale, il prezzo per chilometro della Napoli–Salerno supera quello della Milano–Roma?',
      options: ['42,7%', '57,3%', '174,7%', '11,7%', '74,7%'],
      compute: () => { const a = row('treni', 'Napoli–Salerno'), b = row('treni', 'Milano–Roma'); return ((a[3] / a[1]) / (b[3] / b[1]) - 1) * 100; }, fmt: (v) => it(v) + '%',
      explain: 'Napoli–Salerno: 15 ÷ 55 = 0,2727 € al km. Milano–Roma: 89 ÷ 570 = 0,1561 € al km. 0,2727 ÷ 0,1561 = 1,747, quindi il 74,7% in più. 174,7% confonde il rapporto con l’aumento; 42,7% calcola di quanto la Milano–Roma è più economica (dividendo per il valore sbagliato).' },
    { id: 'IN12', ds: 'treni', level: 'Hard',
      q: 'Un viaggiatore va da Torino a Roma cambiando treno a Milano, dove attende 15 minuti. Qual è la velocità media dell’intero viaggio, attesa compresa?',
      options: ['171,6 km/h', '162,5 km/h', '161,9 km/h', '180,0 km/h', '158,4 km/h'],
      compute: () => { const a = row('treni', 'Torino–Milano'), b = row('treni', 'Milano–Roma'); return (a[1] + b[1]) / ((a[2] + 15 + b[2]) / 60); }, fmt: (v) => it(v) + ' km/h',
      explain: 'Distanza totale = 145 + 570 = 715 km. Tempo totale = 60 + 15 + 190 = 265 minuti = 4,417 ore. Velocità media = 715 ÷ 4,417 = 161,9 km/h. Escludendo l’attesa si ottiene 171,6; fare la media delle due velocità (145 e 180) dà 162,5, sbagliato perché le tratte durano tempi diversi.' },
  ];
  numerical.forEach((q) => { q.ans = q.options.indexOf(q.fmt(q.compute())); });

  /* ---------- VERBALE ---------- */
  const passages = {
    pnrr: { title: 'Il Piano nazionale di ripresa e resilienza', text: 'Il Piano nazionale di ripresa e resilienza (PNRR) è il programma con cui l’Italia utilizza le risorse del dispositivo europeo per la ripresa e la resilienza, il cuore di NextGenerationEU. Dopo successive revisioni, la dotazione complessiva ha raggiunto circa 194,4 miliardi di euro, in maggior parte sotto forma di prestiti e per la parte restante come sovvenzioni. A differenza dei tradizionali fondi europei, i pagamenti non rimborsano spese già sostenute: la Commissione versa le rate semestrali solo dopo aver verificato il raggiungimento di traguardi e obiettivi concordati in anticipo. Il Piano destina al Mezzogiorno almeno il 40% delle risorse ripartibili sul territorio. Nel dicembre 2023 vi è stata aggiunta una settima missione, legata al programma REPowerEU per la sicurezza energetica. Secondo diversi osservatori, la sfida principale non è stata ottenere i fondi, ma trasformarli in opere completate entro la scadenza dell’agosto 2026, soprattutto nei comuni con uffici tecnici poco numerosi.' },
    usbc: { title: 'Il caricabatterie universale', text: 'Dal 28 dicembre 2024 i nuovi telefoni cellulari, tablet, fotocamere digitali, cuffie, console per videogiochi portatili, altoparlanti portatili, lettori di libri elettronici, tastiere, mouse e navigatori venduti nell’Unione europea devono avere una porta di ricarica USB-C. Per i computer portatili l’obbligo è scattato il 28 aprile 2026. Le norme riguardano i dispositivi ricaricabili con una potenza fino a 100 watt e prevedono che quelli dotati di ricarica rapida seguano uno standard comune, così che qualsiasi caricatore compatibile possa ricaricarli alla stessa velocità. I consumatori possono inoltre scegliere di acquistare un nuovo dispositivo senza caricabatterie, e un’apposita etichetta ne indica le caratteristiche di ricarica. Secondo la Commissione, la misura dovrebbe ridurre i rifiuti elettronici, che per i soli caricabatterie inutilizzati o gettati sono stimati in circa 11.000 tonnellate l’anno, e far risparmiare ai consumatori circa 250 milioni di euro l’anno. I produttori hanno avuto un periodo di transizione per adeguare i propri modelli.' },
    roaming: { title: 'Il roaming nell’Unione', text: 'Dal 15 giugno 2017 chi si trova in un altro paese dell’Unione può telefonare, inviare messaggi e navigare in internet con il proprio cellulare alle stesse condizioni previste in patria, senza costi aggiuntivi: è il cosiddetto «roaming a tariffa nazionale». Le regole, che sarebbero scadute nel 2022, sono state prorogate fino al 2032 e si applicano anche in Islanda, Liechtenstein e Norvegia, ma non in Svizzera né nel Principato di Monaco. Il roaming gratuito è pensato per i viaggi occasionali: se, nell’arco di quattro mesi, un cliente trascorre più tempo all’estero che nel proprio paese e vi usa il telefono più che in patria, l’operatore può applicare un piccolo sovrapprezzo, entro limiti massimi fissati dalle norme europee. Diverso è il caso delle chiamate effettuate dal proprio paese verso un numero di un altro Stato membro: non si tratta di roaming, e dal 2019 il loro prezzo è soggetto a un tetto distinto.' },
    dop: { title: 'Le indicazioni geografiche', text: 'Le indicazioni geografiche tutelano i prodotti il cui legame con un territorio è riconosciuto a livello europeo. Per ottenere una Denominazione di origine protetta (DOP), tutte le fasi di produzione e trasformazione devono svolgersi nella zona delimitata e le caratteristiche del prodotto devono dipendere essenzialmente dall’ambiente geografico. Per l’Indicazione geografica protetta (IGP) basta invece che almeno una fase si svolga nella zona. L’Italia è il paese europeo con il maggior numero di prodotti agroalimentari certificati. Secondo il rapporto Ismea-Qualivita, nel 2024 il valore della produzione delle DOP e IGP italiane ha raggiunto 20,7 miliardi di euro, in crescita del 3,5% rispetto all’anno precedente, mentre le esportazioni sono salite a 12,3 miliardi. Sul valore complessivo il vino imbottigliato pesa più del cibo. La differenza tra le due sigle, tuttavia, non è sempre evidente per chi fa la spesa.' },
    aree: { title: 'Le aree interne', text: 'In Italia si definiscono «aree interne» i territori lontani dai centri che offrono servizi essenziali come scuole superiori, ospedali con pronto soccorso e stazioni ferroviarie di una certa importanza. Si tratta in gran parte di comuni montani o collinari, spesso piccoli, che da decenni perdono abitanti e vedono crescere l’età media della popolazione. Lo spopolamento tende ad alimentarsi da solo: quando i residenti diminuiscono, i servizi diventano più costosi da mantenere e talvolta chiudono, e la loro chiusura spinge altre famiglie ad andarsene. Le politiche pubbliche hanno cercato di invertire la tendenza puntando sul miglioramento dei servizi più che su incentivi economici diretti ai nuovi residenti, anche se alcuni comuni hanno sperimentato bonus per chi si trasferisce. Il lavoro a distanza viene talvolta indicato come un’opportunità per questi territori, a condizione che la connessione internet sia adeguata.' },
    turismo: { title: 'Il turismo nelle città d’arte', text: 'Negli ultimi anni alcune città d’arte italiane hanno registrato flussi turistici molto superiori alla loro capacità di accoglienza, soprattutto nei centri storici e nei periodi di punta. Gli effetti più discussi sono l’aumento degli affitti, la trasformazione di abitazioni in alloggi per brevi soggiorni e la sostituzione dei negozi di quartiere con attività rivolte ai visitatori. Le amministrazioni locali hanno risposto in modi diversi: limiti ai nuovi alloggi turistici in determinate zone, contributi di accesso giornalieri in alcuni giorni dell’anno, regole più severe per i gruppi organizzati. I sostenitori di queste misure ritengono che servano a proteggere i residenti; i critici temono che colpiscano soprattutto i visitatori di un solo giorno, che spendono meno ma non sono gli unici responsabili della pressione sui servizi. Molti esperti concordano sul fatto che i dati sulle presenze, da soli, non bastino a misurare l’impatto del turismo, perché non tengono conto di chi non pernotta.' },
    acqua: { title: 'Le perdite delle reti idriche', text: 'In molte zone d’Italia una quota rilevante dell’acqua immessa nelle reti di distribuzione non arriva agli utenti finali. Le perdite dipendono soprattutto dall’età delle condutture, da rotture non individuate e da allacci abusivi, ma una parte delle cosiddette perdite è solo apparente: deriva da contatori imprecisi o da consumi non misurati. La situazione varia molto da un territorio all’altro, anche in base alle dimensioni e all’organizzazione dei gestori. Ridurre le perdite richiede investimenti costosi e lavori lunghi, i cui benefici si vedono spesso solo dopo anni; per questo, secondo alcuni economisti, le tariffe molto basse applicate in passato hanno contribuito a rinviare gli interventi. Negli ultimi anni sensori, contatori intelligenti e modelli digitali delle reti hanno reso più facile individuare le perdite, ma non sostituiscono la sostituzione fisica delle tubature più vecchie.' },
    erasmus: { title: 'Erasmus+', text: 'Nato nel 1987 come programma di scambio per studenti universitari, Erasmus si è progressivamente esteso fino a diventare Erasmus+, che oggi sostiene la mobilità e la cooperazione nei settori dell’istruzione, della formazione, della gioventù e dello sport. Possono partecipare non solo gli studenti universitari, ma anche gli allievi della formazione professionale, i docenti, il personale amministrativo e gli adulti in apprendimento. Le ricerche sugli effetti del programma indicano che chi ha trascorso un periodo all’estero tende a sviluppare competenze linguistiche e trasversali più solide; resta però difficile stabilire quanto questi risultati dipendano dall’esperienza in sé e quanto dal fatto che a partire siano spesso studenti già motivati e con maggiori risorse. Anche per questo il programma prevede contributi aggiuntivi per i partecipanti con minori opportunità.' },
    agile: { title: 'Il lavoro agile nella pubblica amministrazione', text: 'Durante la pandemia il lavoro agile si è diffuso rapidamente anche negli uffici pubblici, spesso senza un’organizzazione preventiva. Superata la fase di emergenza, molte amministrazioni lo hanno regolato con accordi individuali che stabiliscono giorni, obiettivi e fasce di reperibilità, mantenendo in molti casi la prevalenza del lavoro in presenza, in particolare per le attività a contatto diretto con il pubblico. Gli studi disponibili segnalano benefici come la riduzione degli spostamenti e una migliore conciliazione tra vita privata e lavoro, ma anche rischi di isolamento e difficoltà nel coordinamento dei gruppi. Diversi dirigenti osservano che il lavoro agile funziona meglio quando le attività sono valutate in base ai risultati e non alle ore di presenza. Il dibattito resta aperto sugli effetti sulla produttività, che variano a seconda delle mansioni.' },
    cer: { title: 'Le comunità energetiche rinnovabili', text: 'Una comunità energetica rinnovabile è un soggetto giuridico che riunisce cittadini, piccole imprese, enti locali o associazioni per produrre e condividere energia da fonti rinnovabili, ad esempio con pannelli fotovoltaici installati su edifici pubblici o privati. Il suo scopo principale non è il profitto, ma offrire benefici ambientali, economici o sociali ai membri e al territorio. I membri continuano ad avere il proprio contratto di fornitura e la propria bolletta; l’energia «condivisa», cioè prodotta e consumata nello stesso periodo all’interno della comunità, dà diritto a un incentivo che la comunità può poi ripartire. Per questo conviene che i consumi dei membri si concentrino nelle ore in cui gli impianti producono. Chi sostiene le comunità energetiche le considera uno strumento per coinvolgere i cittadini nella transizione; chi è più scettico sottolinea la complessità burocratica della loro costituzione e gestione.' },
  };

  // [affermazione, verdetto (T vero, F falso, C non si può dire), spiegazione]
  const verbal = [
    { id: 'IV1', p: 'pnrr', level: 'Standard', opts: [
      ['La maggior parte della dotazione del PNRR è costituita da sovvenzioni.', 'F', 'La parte maggiore è sotto forma di prestiti; le sovvenzioni sono la parte restante.'],
      ['Le rate del PNRR vengono versate solo dopo la verifica di traguardi e obiettivi concordati.', 'T', 'Affermato: la Commissione versa le rate solo dopo aver verificato traguardi e obiettivi.'],
      ['Il Mezzogiorno riceve esattamente il 40% di tutte le risorse del Piano.', 'C', 'Il testo dice «almeno» il 40%, e solo delle risorse ripartibili sul territorio: non conferma né «esattamente» né «tutte».'],
      ['Il PNRR è stato il primo programma europeo a finanziare la sicurezza energetica.', 'C', 'Il testo non confronta il PNRR con altri programmi su questo punto.'] ] },
    { id: 'IV2', p: 'pnrr', level: 'Hard', opts: [
      ['Secondo alcuni osservatori, la difficoltà maggiore è stata spendere i fondi completando le opere nei tempi previsti.', 'T', 'È la sfida principale indicata da «diversi osservatori».'],
      ['Tutti i comuni italiani hanno avuto difficoltà a completare le opere entro il 2026.', 'C', 'Gli osservatori citano «soprattutto» i comuni con pochi tecnici; nulla dice che le difficoltà riguardassero tutti.'],
      ['Nel PNRR, come nei fondi europei tradizionali, la Commissione rimborsa spese già sostenute.', 'F', 'Il testo sottolinea proprio la differenza: i pagamenti non rimborsano spese già sostenute.'],
      ['La missione legata a REPowerEU era presente nel Piano fin dalla prima versione.', 'F', 'È stata aggiunta nel dicembre 2023 come settima missione.'] ] },
    { id: 'IV3', p: 'usbc', level: 'Standard', opts: [
      ['Dal 28 dicembre 2024 i nuovi computer portatili venduti nell’UE devono avere una porta USB-C.', 'F', 'Per i portatili l’obbligo è scattato il 28 aprile 2026.'],
      ['Chi compra un nuovo telefono può scegliere di non ricevere il caricabatterie.', 'T', 'I consumatori possono acquistare un nuovo dispositivo senza caricabatterie.'],
      ['Le nuove regole vietano la vendita di dispositivi con ricarica rapida.', 'F', 'I dispositivi con ricarica rapida sono ammessi: devono seguire uno standard comune.'],
      ['Secondo la Commissione, la misura farà spendere ai consumatori circa 250 milioni di euro in più ogni anno.', 'F', 'È il contrario: la Commissione stima un risparmio di circa 250 milioni l’anno.'] ] },
    { id: 'IV4', p: 'usbc', level: 'Hard', opts: [
      ['Lo standard comune per la ricarica rapida serve a far sì che qualsiasi caricatore compatibile possa ricaricare il dispositivo alla stessa velocità.', 'T', 'È lo scopo dichiarato dello standard comune.'],
      ['L’obbligo della porta USB-C ha eliminato i rifiuti elettronici prodotti dai caricabatterie.', 'C', 'Secondo la Commissione la misura «dovrebbe ridurre» i rifiuti. Che li abbia eliminati non è affermato.'],
      ['Le 11.000 tonnellate annue stimate si riferiscono a tutti i rifiuti elettronici dell’UE.', 'F', 'La stima riguarda «i soli caricabatterie» inutilizzati o gettati.'],
      ['I produttori hanno dovuto adeguare i propri modelli dall’oggi al domani, senza alcun preavviso.', 'F', 'Hanno avuto un periodo di transizione.'] ] },
    { id: 'IV5', p: 'roaming', level: 'Standard', opts: [
      ['Un cliente italiano in vacanza in Norvegia può usare il cellulare alle condizioni nazionali.', 'T', 'Le regole si applicano anche in Islanda, Liechtenstein e Norvegia.'],
      ['Il roaming a tariffa nazionale vale anche in Svizzera.', 'F', 'Il testo esclude espressamente la Svizzera.'],
      ['Le regole sul roaming gratuito sono scadute nel 2022.', 'F', 'Sarebbero scadute nel 2022, ma sono state prorogate fino al 2032.'],
      ['La maggior parte dei viaggiatori europei trascorre più di quattro mesi all’anno all’estero.', 'C', 'I quattro mesi sono il periodo di osservazione dell’operatore; sulle abitudini dei viaggiatori il testo non dice nulla.'] ] },
    { id: 'IV6', p: 'roaming', level: 'Hard', opts: [
      ['Telefonare dall’Italia a un numero francese è un caso di roaming.', 'F', 'Il testo precisa che le chiamate dal proprio paese verso un altro Stato membro «non sono roaming».'],
      ['Un operatore può applicare un sovrapprezzo al cliente che, in quattro mesi, trascorre più tempo all’estero e vi usa il telefono più che in patria.', 'T', 'È la regola sull’uso non occasionale descritta nel testo.'],
      ['Il sovrapprezzo per l’uso non occasionale è fissato liberamente da ciascun operatore.', 'F', 'Deve rispettare limiti massimi fissati dalle norme europee.'],
      ['Il tetto ai prezzi delle chiamate verso altri Stati membri è lo stesso previsto per il roaming.', 'F', 'Il testo parla di un tetto «distinto».'] ] },
    { id: 'IV7', p: 'dop', level: 'Standard', opts: [
      ['Per un prodotto IGP tutte le fasi di produzione devono svolgersi nella zona delimitata.', 'F', 'Per l’IGP basta che almeno una fase si svolga nella zona; tutte le fasi sono richieste per la DOP.'],
      ['Nel 2024 le esportazioni di DOP e IGP italiane hanno superato i 12 miliardi di euro.', 'T', 'Sono salite a 12,3 miliardi.'],
      ['Nel 2024 il valore delle esportazioni è cresciuto più del valore della produzione.', 'C', 'Il testo dà la crescita della produzione (+3,5%) ma non quella delle esportazioni. Non usare dati esterni.'],
      ['Sul valore complessivo delle DOP e IGP italiane il cibo pesa più del vino imbottigliato.', 'F', 'È il contrario: pesa di più il vino imbottigliato.'] ] },
    { id: 'IV8', p: 'dop', level: 'Hard', opts: [
      ['Un prodotto le cui caratteristiche non dipendono essenzialmente dall’ambiente geografico non può ottenere la DOP.', 'T', 'Per la DOP le caratteristiche devono dipendere essenzialmente dall’ambiente geografico.'],
      ['L’Italia è il paese europeo che esporta il maggior valore di prodotti DOP e IGP.', 'C', 'Il testo dice che l’Italia è prima per NUMERO di prodotti certificati, non per valore esportato.'],
      ['La maggior parte dei consumatori non sa distinguere tra DOP e IGP.', 'C', 'Il testo dice che la differenza «non è sempre evidente», non che la maggior parte la ignori.'],
      ['Nel 2023 il valore della produzione di DOP e IGP era superiore a quello del 2024.', 'F', 'Nel 2024 il valore è cresciuto del 3,5% rispetto all’anno precedente.'] ] },
    { id: 'IV9', p: 'aree', level: 'Standard', opts: [
      ['Le aree interne sono definite in base alla distanza dai centri che offrono servizi essenziali.', 'T', 'È la definizione data nella prima frase.'],
      ['Tutti i comuni delle aree interne si trovano in montagna.', 'F', 'Si tratta «in gran parte» di comuni montani o collinari: non tutti, e non solo montani.'],
      ['Lo spopolamento delle aree interne è iniziato negli ultimi cinque anni.', 'F', 'Questi comuni perdono abitanti «da decenni».'],
      ['I bonus per i nuovi residenti si sono rivelati la misura più efficace contro lo spopolamento.', 'C', 'Il testo dice che alcuni comuni li hanno sperimentati, ma non ne valuta l’efficacia.'] ] },
    { id: 'IV10', p: 'aree', level: 'Hard', opts: [
      ['Secondo il testo, la diminuzione dei residenti e la chiusura dei servizi possono rafforzarsi a vicenda.', 'T', 'Lo spopolamento «tende ad alimentarsi da solo»: meno residenti, meno servizi, altre partenze.'],
      ['Le politiche pubbliche si sono basate soprattutto su incentivi economici ai nuovi residenti.', 'F', 'Hanno puntato sul miglioramento dei servizi «più che» sugli incentivi.'],
      ['Il lavoro a distanza ha già invertito lo spopolamento in molte aree interne.', 'C', 'Viene «talvolta indicato come un’opportunità»; risultati concreti non sono riportati.'],
      ['Nessun comune ha mai offerto incentivi a chi si trasferisce.', 'F', 'Alcuni comuni hanno sperimentato bonus per chi si trasferisce.'] ] },
    { id: 'IV11', p: 'turismo', level: 'Standard', opts: [
      ['Il testo indica l’aumento degli affitti tra gli effetti discussi dei grandi flussi turistici.', 'T', 'È il primo degli effetti elencati.'],
      ['Tutte le città d’arte italiane hanno introdotto un contributo di accesso giornaliero.', 'C', 'Il contributo è una delle risposte adottate dalle amministrazioni, ma il testo non dice quante lo applichino.'],
      ['Le amministrazioni locali hanno adottato tutte la stessa strategia.', 'F', 'Hanno risposto «in modi diversi».'],
      ['I visitatori di un solo giorno spendono più dei turisti che pernottano.', 'F', 'Secondo il testo spendono meno.'] ] },
    { id: 'IV12', p: 'turismo', level: 'Hard', opts: [
      ['Secondo i critici, i visitatori di un solo giorno sono i soli responsabili della pressione sui servizi.', 'F', 'I critici dicono il contrario: non sono gli unici responsabili.'],
      ['I dati sulle presenze, da soli, possono sottostimare l’impatto del turismo.', 'T', 'Non tengono conto di chi non pernotta, quindi una parte dei visitatori resta fuori dal conteggio.'],
      ['I limiti ai nuovi alloggi turistici hanno fatto scendere gli affitti nei centri storici.', 'C', 'Le misure sono elencate, ma i loro effetti sugli affitti non sono riportati.'],
      ['I sostenitori delle misure ritengono che danneggino i residenti.', 'F', 'Ritengono che servano a proteggerli.'] ] },
    { id: 'IV13', p: 'acqua', level: 'Standard', opts: [
      ['Una parte delle perdite registrate non corrisponde ad acqua realmente dispersa.', 'T', 'Alcune perdite sono «solo apparenti», dovute a contatori imprecisi o consumi non misurati.'],
      ['Le perdite sono distribuite in modo uniforme su tutto il territorio italiano.', 'F', 'La situazione «varia molto da un territorio all’altro».'],
      ['Gli allacci abusivi sono la causa principale delle perdite.', 'C', 'Sono una delle cause elencate insieme all’età delle condutture e alle rotture, senza una graduatoria.'],
      ['I benefici degli investimenti sulle reti si vedono di solito in poche settimane.', 'F', 'Si vedono spesso «solo dopo anni».'] ] },
    { id: 'IV14', p: 'acqua', level: 'Hard', opts: [
      ['Secondo alcuni economisti, le tariffe basse applicate in passato hanno contribuito a rinviare gli investimenti.', 'T', 'Affermato e attribuito ad «alcuni economisti».'],
      ['I contatori intelligenti permettono di evitare la sostituzione delle tubature vecchie.', 'F', 'Il testo dice che non sostituiscono la sostituzione fisica delle tubature.'],
      ['Tutti gli economisti ritengono che le tariffe debbano aumentare.', 'C', 'Il testo riporta l’opinione di «alcuni» economisti sul passato, non una posizione di tutti sul futuro.'],
      ['I gestori più grandi hanno meno perdite di quelli più piccoli.', 'C', 'Il testo dice che la situazione varia anche in base alle dimensioni dei gestori, ma non in quale direzione.'] ] },
    { id: 'IV15', p: 'erasmus', level: 'Standard', opts: [
      ['Erasmus+ è rivolto esclusivamente agli studenti universitari.', 'F', 'Partecipano anche allievi della formazione professionale, docenti, personale amministrativo e adulti.'],
      ['Il programma Erasmus esiste dal 1987.', 'T', 'È nato nel 1987.'],
      ['Erasmus+ non comprende attività legate allo sport.', 'F', 'Lo sport è uno dei settori sostenuti.'],
      ['L’Italia è il paese che invia più studenti all’estero con Erasmus+.', 'C', 'Il testo non riporta dati per paese.'] ] },
    { id: 'IV16', p: 'erasmus', level: 'Hard', opts: [
      ['È dimostrato che il periodo all’estero è la causa del miglioramento delle competenze dei partecipanti.', 'F', 'Il testo dice che resta difficile stabilire quanto i risultati dipendano dall’esperienza stessa.'],
      ['Chi parte con Erasmus+ può avere già in partenza più motivazione e più risorse di altri studenti.', 'T', 'Il testo osserva che a partire sono spesso studenti già motivati e con maggiori risorse.'],
      ['I contributi aggiuntivi sono destinati a tutti i partecipanti in egual misura.', 'F', 'Sono previsti per i partecipanti con minori opportunità.'],
      ['I docenti che partecipano a Erasmus+ migliorano le proprie competenze più degli studenti.', 'C', 'Gli effetti sui docenti non sono confrontati con quelli sugli studenti.'] ] },
    { id: 'IV17', p: 'agile', level: 'Standard', opts: [
      ['Dopo l’emergenza, molte amministrazioni hanno regolato il lavoro agile con accordi individuali.', 'T', 'Affermato nella seconda frase.'],
      ['Durante la pandemia il lavoro agile negli uffici pubblici è stato sempre pianificato con largo anticipo.', 'F', 'Si è diffuso «spesso senza un’organizzazione preventiva».'],
      ['Il lavoro agile ha eliminato il rischio di isolamento dei dipendenti.', 'F', 'L’isolamento è indicato proprio tra i rischi.'],
      ['La maggior parte dei dipendenti pubblici preferisce lavorare da casa.', 'C', 'Le preferenze dei dipendenti non sono riportate.'] ] },
    { id: 'IV18', p: 'agile', level: 'Hard', opts: [
      ['Gli studi concordano sul fatto che il lavoro agile aumenti la produttività in tutte le mansioni.', 'F', 'Il dibattito sulla produttività «resta aperto» e gli effetti variano con le mansioni.'],
      ['Alcuni dirigenti ritengono che il lavoro agile renda di più quando le attività sono valutate in base ai risultati.', 'T', 'È l’osservazione attribuita a «diversi dirigenti».'],
      ['Le attività a contatto con il pubblico si svolgono ormai prevalentemente a distanza.', 'F', 'Per queste attività si è mantenuta in molti casi la prevalenza del lavoro in presenza.'],
      ['La riduzione degli spostamenti ha migliorato la qualità dell’aria nelle città.', 'C', 'La qualità dell’aria non è menzionata.'] ] },
    { id: 'IV19', p: 'cer', level: 'Standard', opts: [
      ['Chi entra in una comunità energetica continua ad avere un proprio contratto di fornitura.', 'T', 'I membri mantengono contratto e bolletta.'],
      ['Lo scopo principale di una comunità energetica è generare profitti per i membri.', 'F', 'Lo scopo principale «non è il profitto».'],
      ['Solo i cittadini privati possono far parte di una comunità energetica.', 'F', 'Possono partecipare anche piccole imprese, enti locali e associazioni.'],
      ['Le comunità energetiche producono energia soprattutto con impianti eolici.', 'C', 'Il fotovoltaico è citato solo come esempio; non c’è una graduatoria delle fonti.'] ] },
    { id: 'IV20', p: 'cer', level: 'Hard', opts: [
      ['L’incentivo spetta per tutta l’energia prodotta dagli impianti della comunità.', 'F', 'Spetta per l’energia «condivisa», cioè prodotta e consumata nello stesso periodo nella comunità.'],
      ['Per una comunità è vantaggioso che i membri consumino energia mentre gli impianti la producono.', 'T', 'Così aumenta l’energia condivisa, che dà diritto all’incentivo.'],
      ['Gli scettici ritengono che le comunità energetiche non coinvolgano i cittadini.', 'C', 'Gli scettici sottolineano la complessità burocratica; sul coinvolgimento dei cittadini il testo non riporta la loro opinione.'],
      ['Tutti descrivono la costituzione di una comunità energetica come semplice.', 'F', 'Gli scettici ne sottolineano la complessità burocratica.'] ] },
  ];

  // Ordine delle opzioni rimescolato in modo deterministico (come nella banca inglese)
  function seededOrder(id, n) {
    let h = 2166136261;
    for (const ch of id + 'roma') { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    const idx = [...Array(n).keys()];
    for (let k = n - 1; k > 0; k--) { h = (Math.imul(h, 1103515245) + 12345) >>> 0; const j = h % (k + 1); [idx[k], idx[j]] = [idx[j], idx[k]]; }
    return idx;
  }
  verbal.forEach((q) => {
    const order = seededOrder(q.id, 4);
    q.opts = order.map((k) => [q.opts[k][0], q.opts[k][1], q.opts[k][2], k]);
    q.ans = q.opts.findIndex((o) => o[1] === 'T');
  });

  const api = { datasets, numerical, passages, verbal };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EPSO_NI = api;
})(this);
