/* Classe Coco — contenu du site.
   Les séquences suivent l'ordre des progressions annuelles CE2A (français et maths).
   statut : "demo" (aperçu jouable), "ancien" (existe dans le site v0, à intégrer), "bientot".
   Les titres anglais des maths sont à valider par l'enseignante (DNL). */
window.COCO_CONTENU = {
  matieres: [
    { id: "francais", classe: "m-francais", perso: "leo", nom: { fr: "Français", en: "French" },
      sous: { fr: "Grammaire · Orthographe · Lexique", en: "Grammar · Spelling · Vocabulary" },
      domaines: [
        { nom: { fr: "Grammaire et conjugaison", en: "Grammar" }, sequences: [
          ["La phrase, la ponctuation et les types de phrases"], ["Les formes de phrases"], ["Les temps"],
          ["Le verbe", "demo", "verbe"], ["L'infinitif du verbe"], ["La fonction sujet et les pronoms personnels"],
          ["Le présent des verbes du 1er groupe"], ["Le groupe nominal"],
          ["Le présent : être, avoir, aller, prendre, venir"], ["Le présent : pouvoir, vouloir, dire, faire, voir"],
          ["Le passé composé avec avoir"], ["Le passé composé avec être"],
          ["Le futur : être, avoir et 1er groupe"], ["Le futur : verbes irréguliers"],
          ["Les compléments de phrase"], ["Les compléments du verbe"],
          ["L'imparfait : être, avoir et 1er groupe"], ["L'imparfait : verbes irréguliers"]
        ] },
        { nom: { fr: "Orthographe", en: "Spelling" }, sequences: [
          ["Les mots invariables", "demo", "mots"], ["Les correspondances graphèmes-phonèmes"], ["Les accords particuliers"]
        ] },
        { nom: { fr: "Lexique", en: "Vocabulary" }, sequences: [
          ["Enrichir son lexique"], ["L'ordre alphabétique"], ["Le dictionnaire"]
        ] }
      ] },
    { id: "maths", classe: "m-maths", perso: "mei", nom: { fr: "Maths", en: "Maths" },
      sous: { fr: "Nombres · Calcul · Mesures · Géométrie", en: "Number · Calculation · Measures · Geometry" },
      domaines: [
        { nom: { fr: "Nombres", en: "Number" }, sequences: [
          [{ fr: "Lire et écrire les nombres", en: "Reading and writing numbers" }],
          [{ fr: "Les nombres de 0 à 999", en: "Numbers from 0 to 999" }],
          [{ fr: "Encadrer un nombre entre 2 dizaines ou 2 centaines", en: "Between two tens or two hundreds" }],
          [{ fr: "Ranger et comparer des nombres", en: "Ordering and comparing numbers" }],
          [{ fr: "La ligne graduée", en: "Number lines" }],
          [{ fr: "Les nombres de 1 000 à 9 999", en: "Numbers from 1,000 to 9,999" }]
        ] },
        { nom: { fr: "Calcul mental", en: "Mental maths" }, sequences: [
          [{ fr: "Compléments à 5, 6, 7, 8 et 9", en: "Number bonds to 5, 6, 7, 8 and 9" }],
          [{ fr: "Compléments à 10", en: "Number bonds to 10" }],
          [{ fr: "Compléments à la dizaine supérieure", en: "Number bonds to the next ten" }],
          [{ fr: "Additionner trois nombres à un chiffre", en: "Adding three 1-digit numbers" }],
          [{ fr: "Trouver des compléments cachés", en: "Finding hidden number bonds" }],
          [{ fr: "Les compléments à 100", en: "Number bonds to 100" }],
          [{ fr: "Les compléments à 1 000", en: "Number bonds to 1,000" }],
          [{ fr: "Arrondir un nombre", en: "Rounding numbers" }],
          [{ fr: "Estimer un ordre de grandeur", en: "Estimating" }],
          [{ fr: "Les doubles usuels", en: "Common doubles" }],
          [{ fr: "Ajouter 10", en: "Adding 10" }],
          [{ fr: "Autres doubles usuels", en: "More doubles" }],
          [{ fr: "Ajouter 9", en: "Adding 9" }],
          [{ fr: "Enlever 10", en: "Subtracting 10" }],
          [{ fr: "Enlever 9", en: "Subtracting 9" }],
          [{ fr: "Les tables de multiplication", en: "Times tables" }],
          [{ fr: "Ajouter ou soustraire des multiples de 10 et de 100", en: "Adding and subtracting multiples of 10 and 100" }],
          [{ fr: "Multiplier par 10, 100 et 1 000", en: "Multiplying by 10, 100 and 1,000" }],
          [{ fr: "Multiplier par un multiple de 10", en: "Multiplying by multiples of 10" }],
          [{ fr: "Les multiplications à trous", en: "Missing-number multiplications" }]
        ] },
        { nom: { fr: "Techniques opératoires", en: "Written methods" }, sequences: [
          [{ fr: "L'addition posée", en: "Column addition" }], [{ fr: "La soustraction posée", en: "Column subtraction" }],
          [{ fr: "La soustraction par cassage", en: "Subtracting by breaking numbers apart" }],
          [{ fr: "La multiplication", en: "Multiplication" }], [{ fr: "La multiplication posée", en: "Column multiplication" }],
          [{ fr: "La multiplication posée à deux chiffres", en: "Column multiplication by a 2-digit number" }],
          [{ fr: "Diviser : grouper ou partager", en: "Dividing: grouping or sharing" }],
          [{ fr: "La division en ligne", en: "Division" }, "demo", "division"]
        ] },
        { nom: { fr: "Grandeurs et mesures", en: "Measures" }, sequences: [
          [{ fr: "Mesurer des longueurs", en: "Measuring length" }], [{ fr: "Convertir des longueurs", en: "Converting lengths" }],
          [{ fr: "La monnaie et les prix", en: "Money and prices" }, "demo", "monnaie"],
          [{ fr: "Mesurer des durées · l'heure digitale", en: "Time · digital clocks" }, "demo", "digitale"],
          [{ fr: "Mesurer des durées · l'heure à aiguilles", en: "Time · telling the time" }, "demo", "heure"],
          [{ fr: "Mesurer des masses", en: "Measuring mass" }, "demo", "masses"], [{ fr: "Mesurer des capacités", en: "Measuring capacity" }]
        ] },
        { nom: { fr: "Espace et géométrie", en: "Geometry" }, sequences: [
          /* d'après le fichier de géométrie 2026 de l'enseignante (GEOM1 à GEOM12, D-86) ; « Les polygones » gardé en attente d'une leçon */
          [{ fr: "Se repérer et se déplacer sur un quadrillage", en: "Position and direction on a grid" }],
          [{ fr: "Points, droites et segments", en: "Points, lines and line segments" }],
          [{ fr: "Mesurer, trouver le milieu et tracer un segment", en: "Measuring, finding the midpoint and drawing a line segment" }],
          [{ fr: "Les angles droits", en: "Right angles" }],
          [{ fr: "Les polygones", en: "Polygons" }],
          [{ fr: "Triangles et triangles-rectangles", en: "Triangles and right-angled triangles" }],
          [{ fr: "Les quadrilatères : le carré", en: "Quadrilaterals: the square" }],
          [{ fr: "Les quadrilatères : le rectangle", en: "Quadrilaterals: the rectangle" }],
          [{ fr: "Le cercle", en: "Circles" }],
          [{ fr: "La reproduction sur quadrillage", en: "Copying shapes on a grid" }],
          [{ fr: "La symétrie", en: "Line symmetry" }],
          [{ fr: "Les solides", en: "3-D shapes" }],
          [{ fr: "Cube et pavé droit", en: "Cubes and cuboids" }]
        ] },
        { nom: { fr: "Résolution de problèmes", en: "Problem solving" }, sequences: [
          [{ fr: "Banque de problèmes (Vergnaud)", en: "Problem bank (Vergnaud)" }, "demo", "#banque"],
          [{ fr: "Lire un graphique en barres", en: "Reading bar charts" }, "demo", "diagrammes"]
        ] }
      ] },
    /* Anglais : les thèmes de l'enseignante, repris du premier site (D-94) ; sans numéro de période, qui change d'une année à l'autre (D-99) ; séquences à venir */
    { id: "anglais", classe: "m-anglais", perso: "tao", nom: { fr: "Anglais", en: "English" },
      sous: { fr: "Bientôt", en: "Coming soon" }, domaines: [
        { nom: { fr: "Introduce yourself", en: "Introduce yourself" }, sequences: [] },
        { nom: { fr: "Tastes and hobbies", en: "Tastes and hobbies" }, sequences: [] },
        { nom: { fr: "Family and pets", en: "Family and pets" }, sequences: [] },
        { nom: { fr: "Physical description", en: "Physical description" }, sequences: [] },
        { nom: { fr: "The house", en: "The house" }, sequences: [] }
      ] },
    /* QLM : programmations périodiques 2026 (D23, échanges de service en DNL, séquences des collègues comprises) ; sous-domaines des programmations (D-96) */
    { id: "qlm", classe: "m-qlm", perso: "wadra", nom: { fr: "Questionner le monde", en: "Discovering the world" },
      sous: { fr: "Temps · Espace · Vivant", en: "Time · Space · Living things" }, domaines: [
        { nom: { fr: "Se situer dans le temps", en: "Time" }, sequences: [
          [{ fr: "Les unités de temps et le calendrier", en: "Units of time and the calendar" }, "bientot"],
          [{ fr: "La frise chronologique", en: "The timeline" }, "bientot"],
          [{ fr: "La frise de l’histoire de la Nouvelle-Calédonie", en: "The history timeline of New Caledonia" }, "bientot"] ] },
        { nom: { fr: "Se situer dans l’espace", en: "Space" }, sequences: [
          [{ fr: "De l’espace connu à l’espace lointain", en: "From nearby to faraway places" }, "bientot"],
          [{ fr: "L’organisation de l’espace urbain proche", en: "How a nearby town is organised" }, "bientot"],
          [{ fr: "Les paysages de la Nouvelle-Calédonie et du monde, et leur évolution", en: "Landscapes of New Caledonia and the world, and how they change" }, "bientot"] ] },
        { nom: { fr: "Le vivant, la matière et les objets", en: "Living things, materials and objects" }, sequences: [
          [{ fr: "Le monde vivant : les interactions", en: "Living things: how they interact" }, "bientot"],
          [{ fr: "La lutte contre les maladies vectorielles", en: "Fighting mosquito-borne diseases" }, "bientot"],
          [{ fr: "Le corps humain : muscles et mouvements", en: "The human body: muscles and movement" }, "bientot"],
          [{ fr: "La pollution de l’eau et la gestion des déchets", en: "Water pollution and waste" }, "bientot"],
          [{ fr: "Le cycle de l’eau", en: "The water cycle" }, "bientot"],
          [{ fr: "Les objets techniques : l’électricité", en: "Technical objects: electricity" }, "bientot"],
          [{ fr: "Projet technique : le phare Amédée", en: "Technical project: the Amédée lighthouse" }, "bientot"] ] }
      ] }
  ],

  /* ---------- séquence de démonstration : Le verbe (leçon CONJ2) ---------- */
  verbe: {
    matiere: "francais",
    titre: { fr: "Le verbe", en: "The verb" },
    objectif: { fr: "Je sais trouver le verbe conjugué dans une phrase.", en: "I can find the conjugated verb in a sentence." },
    // Je me rappelle : prérequis de la séquence « Les temps » (CONJ1)
    rappel: [
      { phrase: "Demain, je jouerai dans la cour.", reponse: "futur" },
      { phrase: "Hier, j'étais malade.", reponse: "passe" },
      { phrase: "Aujourd'hui, je suis en CE2.", reponse: "present" }
    ],
    // Je découvre : le mot qui change selon le moment (exemple de la leçon CONJ2)
    moments: { passe: "Sarah était malade.", present: "Sarah est malade.", futur: "Sarah sera malade." },
    motQuiChange: 1,
    // Je découvre : le test ne … pas (exemple de la leçon CONJ2)
    testPhrase: ["La", "pluie", "tombe", "sur", "la", "forêt."],
    testVerbe: 2,
    // Je m'entraîne : Chasse aux verbes (une seule forme verbale par phrase, au présent)
    chasse: [
      { mots: ["Le", "cagou", "court", "dans", "la", "forêt."], v: 2, neg: "Le cagou ne court pas dans la forêt." },
      { mots: ["Tehani", "mange", "la", "mangue."], v: 1, neg: "Tehani ne mange pas la mangue." },
      { mots: ["Les", "enfants", "jouent", "sur", "la", "plage."], v: 2, neg: "Les enfants ne jouent pas sur la plage." },
      { mots: ["Ma", "sœur", "est", "malade."], v: 2, neg: "Ma sœur n'est pas malade." },
      { mots: ["Le", "bus", "arrive", "à", "l'école."], v: 2, neg: "Le bus n'arrive pas à l'école." },
      { mots: ["Nous", "regardons", "les", "baleines."], v: 1, neg: "Nous ne regardons pas les baleines." }
    ]
  },

  /* ---------- séquence de démonstration : La monnaie (problème ouvert) ---------- */
  monnaie: {
    matiere: "maths",
    titre: { fr: "La monnaie et les prix", en: "Money and prices" },
    objectif: { fr: "Je sais payer un prix avec les pièces et les billets du pays.", en: "I can pay a price with the coins and notes we use here." },
    pieces: [1, 2, 5, 10, 20, 50, 100],
    prix: 100, minPieces: 2, defiPieces: 6
  },

  /* ---------- Maths · résolution de problèmes : les diagrammes en barres (repère niveau 3, D-77) ---------- */
  diagrammes: {
    matiere: "maths",
    titre: { fr: "Lire un graphique en barres", en: "Reading bar charts" },
    objectif: { fr: "Je sais lire un graphique en barres et m'en servir pour résoudre un problème.", en: "I can read a bar chart and use it to solve a problem." }
  },

  /* ---------- Maths · P5 séquence 1 : lire l'heure digitale (jeux collectifs de la collègue, adaptés : D-73) ---------- */
  digitale: {
    matiere: "maths",
    titre: { fr: "Lire l'heure digitale", en: "Digital clocks" },
    objectif: { fr: "Je sais lire l'heure digitale, le matin, l'après-midi et le soir.", en: "I can read the time on a digital clock, in the morning, afternoon and evening." }
  },

  /* ---------- Maths · P5 séquence 2 : lire l'heure à aiguilles (module du site v0, repris et bilingue) ---------- */
  heure: {
    matiere: "maths",
    titre: { fr: "Lire l'heure à aiguilles", en: "Telling the time" },
    objectif: { fr: "Je sais lire l'heure sur une horloge à aiguilles.", en: "I can tell the time on a clock with hands." }
  },

  /* ---------- Orthographe : les mots invariables (module du site v0, repris) ---------- */
  mots: {
    matiere: "francais",
    titre: { fr: "Les mots invariables", en: "Invariable words" },
    objectif: { fr: "Je sais écrire sans erreur les mots invariables de mes listes.", en: "I can spell the invariable words on my lists without mistakes." }
  },

  /* ---------- Période 5 · séquence 3 : la division en ligne (problèmes ouverts de la collègue, adaptés) ---------- */
  division: {
    matiere: "maths",
    titre: { fr: "La division en ligne", en: "Division" },
    objectif: { fr: "Je sais partager en parts égales et écrire la division en ligne.", en: "I can share into equal parts and write the division." }
  },

  /* ---------- Période 5 · séquence 4 : les masses (problèmes ouverts de la collègue, adaptés, D-109 ; leçon GM8) ---------- */
  masses: {
    matiere: "maths",
    titre: { fr: "Mesurer des masses", en: "Measuring mass" },
    objectif: { fr: "Je sais choisir l’unité qui convient pour exprimer une masse et j’utilise 1 kg = 1 000 g.", en: "I can choose the right unit for a mass and I use 1 kg = 1,000 g." }
  }
};
