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
          [{ fr: "Les nombres de 0 à 999", en: "Numbers from 0 to 999" }],
          [{ fr: "Les nombres de 1 000 à 9 999", en: "Numbers from 1,000 to 9,999" }]
        ] },
        { nom: { fr: "Calcul mental", en: "Mental maths" }, sequences: [
          [{ fr: "Compléments à 5, 6, 7, 8 et 9", en: "Number bonds to 5, 6, 7, 8 and 9" }],
          [{ fr: "Compléments à 10", en: "Number bonds to 10" }],
          [{ fr: "Compléments à la dizaine supérieure", en: "Number bonds to the next ten" }],
          [{ fr: "Additionner trois nombres à un chiffre", en: "Adding three 1-digit numbers" }],
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
          [{ fr: "La multiplication", en: "Multiplication" }], [{ fr: "La division en ligne", en: "Division" }, "demo", "division"]
        ] },
        { nom: { fr: "Grandeurs et mesures", en: "Measures" }, sequences: [
          [{ fr: "Mesurer des longueurs", en: "Measuring length" }],
          [{ fr: "La monnaie et les prix", en: "Money and prices" }, "demo", "monnaie"],
          [{ fr: "Mesurer des durées · l'heure digitale", en: "Time · digital clocks" }],
          [{ fr: "Mesurer des durées · l'heure à aiguilles", en: "Time · telling the time" }, "demo", "heure"],
          [{ fr: "Mesurer des masses", en: "Measuring mass" }], [{ fr: "Mesurer des capacités", en: "Measuring capacity" }]
        ] },
        { nom: { fr: "Espace et géométrie", en: "Geometry" }, sequences: [
          [{ fr: "Se repérer", en: "Position and direction" }], [{ fr: "Se déplacer sur un quadrillage", en: "Moving on a grid" }],
          [{ fr: "Les solides usuels", en: "3-D shapes" }], [{ fr: "Les polygones", en: "Polygons" }],
          [{ fr: "Le triangle rectangle", en: "Right-angled triangles" }], [{ fr: "Le carré", en: "Squares" }],
          [{ fr: "Le rectangle", en: "Rectangles" }], [{ fr: "La reproduction sur quadrillage", en: "Copying shapes on a grid" }],
          [{ fr: "Le cercle", en: "Circles" }], [{ fr: "Droites et points alignés", en: "Lines and points in a line" }],
          [{ fr: "Longueur et milieu d'un segment", en: "Length and midpoint of a line segment" }],
          [{ fr: "Droites perpendiculaires", en: "Perpendicular lines" }], [{ fr: "La symétrie axiale", en: "Line symmetry" }]
        ] },
        { nom: { fr: "Résolution de problèmes", en: "Problem solving" }, sequences: [
          [{ fr: "Banque de problèmes (Vergnaud)", en: "Problem bank (Vergnaud)" }, "demo", "#banque"]
        ] }
      ] },
    { id: "anglais", classe: "m-anglais", perso: "tao", nom: { fr: "Anglais", en: "English" },
      sous: { fr: "Bientôt", en: "Coming soon" }, domaines: [] },
    { id: "qlm", classe: "m-qlm", perso: "wadra", nom: { fr: "Questionner le monde", en: "Discovering the world" },
      sous: { fr: "Bientôt", en: "Coming soon" }, domaines: [] }
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
  }
};
