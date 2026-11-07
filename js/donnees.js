/* Classe Coco — lire et construire des diagrammes en barres (D-77).
   Repère niveau 3 [PRESCRIT] : « L'élève lit des données numériques organisées sous forme de diagrammes en barres.
   Il exploite ces données pour répondre à des questions ou résoudre des problèmes. » (repères de maths, cycle 2, p. 7-8)
   Contextes calédoniens ; valeurs tirées au hasard à chaque partie. */
(function () {
  var hasard = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  var melange = function (t) { t = t.slice(); for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = t[i]; t[i] = t[j]; t[j] = x; } return t; };
  var somme = function (t) { return t.reduce(function (a, b) { return a + b; }, 0); };

  /* chaque contexte : titre, ce que compte l'axe, catégories (nom, « de … » pour les questions, pluriel anglais) */
  var CONTEXTES = [
    { id: "fruits", titre: { fr: "Les fruits vendus au marché samedi", en: "Fruit sold at the market on Saturday" }, axe: { fr: "fruits", de: "de fruits", en: "pieces of fruit" }, axeX: { fr: "Fruits", en: "Fruit" },
      plus: { fr: "Quel fruit a été le plus vendu ?", en: "Which fruit sold the most?" }, moins: { fr: "Quel fruit a été le moins vendu ?", en: "Which fruit sold the least?" },
      prix: { fr: "une", en: "" },
      cats: [{ fr: "mangues", de: "de mangues", en: "mangoes", un: "Une mangue", unEn: "A mango" }, { fr: "avocats", de: "d'avocats", en: "avocados", un: "Un avocat", unEn: "An avocado" }, { fr: "papayes", de: "de papayes", en: "papayas", un: "Une papaye", unEn: "A papaya" },
             { fr: "ananas", de: "d'ananas", en: "pineapples", un: "Un ananas", unEn: "A pineapple" }, { fr: "noix de coco", de: "de noix de coco", en: "coconuts", un: "Une noix de coco", unEn: "A coconut" }] },
    { id: "transport", titre: { fr: "Comment les élèves viennent à l'école", en: "How the pupils come to school" }, axe: { fr: "élèves", de: "d'élèves", en: "pupils" }, axeX: { fr: "Moyens de transport", en: "Transport" },
      plus: { fr: "Comment viennent le plus d'élèves ?", en: "How do most pupils come?" }, moins: { fr: "Comment viennent le moins d'élèves ?", en: "How do the fewest pupils come?" },
      cats: [{ fr: "à pied", de: "à pied", en: "on foot" }, { fr: "en bus", de: "en bus", en: "by bus" }, { fr: "en voiture", de: "en voiture", en: "by car" }, { fr: "à vélo", de: "à vélo", en: "by bike" }] },
    { id: "sports", titre: { fr: "Le sport préféré des élèves", en: "The pupils' favourite sport" }, axe: { fr: "élèves", de: "d'élèves", en: "pupils" }, axeX: { fr: "Sports", en: "Sports" },
      plus: { fr: "Quel sport est le plus aimé ?", en: "Which sport is the most popular?" }, moins: { fr: "Quel sport est le moins aimé ?", en: "Which sport is the least popular?" },
      cats: [{ fr: "football", de: "le football", en: "football" }, { fr: "natation", de: "la natation", en: "swimming" }, { fr: "va'a", de: "le va'a", en: "va'a" }, { fr: "volley-ball", de: "le volley-ball", en: "volleyball" }, { fr: "rugby", de: "le rugby", en: "rugby" }] },
    { id: "peche", titre: { fr: "Les poissons pêchés par Papi Tao", en: "Fish caught by Grandad Tao" }, axe: { fr: "poissons", de: "de poissons", en: "fish" }, axeX: { fr: "Jours", en: "Days" },
      plus: { fr: "Quel jour a-t-il pêché le plus de poissons ?", en: "On which day did he catch the most fish?" }, moins: { fr: "Quel jour a-t-il pêché le moins de poissons ?", en: "On which day did he catch the fewest fish?" },
      cats: [{ fr: "lundi", de: "lundi", en: "Monday" }, { fr: "mardi", de: "mardi", en: "Tuesday" }, { fr: "mercredi", de: "mercredi", en: "Wednesday" }, { fr: "jeudi", de: "jeudi", en: "Thursday" }, { fr: "vendredi", de: "vendredi", en: "Friday" }] },
    { id: "oiseaux", titre: { fr: "Les oiseaux vus au parc des Grandes Fougères", en: "Birds seen at the Grandes Fougères park" }, axe: { fr: "oiseaux", de: "d'oiseaux", en: "birds" }, axeX: { fr: "Oiseaux", en: "Birds" },
      plus: { fr: "Quel oiseau a-t-on vu le plus ?", en: "Which bird was seen the most?" }, moins: { fr: "Quel oiseau a-t-on vu le moins ?", en: "Which bird was seen the least?" },
      cats: [{ fr: "cagous", de: "de cagous", en: "kagus" }, { fr: "notous", de: "de notous", en: "notous" }, { fr: "perruches", de: "de perruches", en: "parakeets" }, { fr: "martins-pêcheurs", de: "de martins-pêcheurs", en: "kingfishers" }] }
  ];

  /* un diagramme : contexte, graduation (pas), valeurs */
  function tirer(opts) {
    var ctx = opts.ctx ? CONTEXTES.filter(function (c) { return c.id === opts.ctx; })[0] : CONTEXTES[hasard(0, CONTEXTES.length - 1)];
    var pas = opts.pas || 1, niveaux = opts.niveaux || 10, max = pas * niveaux, demi = !!opts.demi;
    var unite = demi ? pas / 2 : pas, vals = [];
    while (vals.length < ctx.cats.length) {
      var v = unite * hasard(Math.ceil((opts.min || unite) / unite), Math.floor(max / unite));
      if (vals.indexOf(v) < 0) vals.push(v); /* valeurs toutes différentes : « le plus », « le moins » sans ambiguïté */
    }
    return { ctx: ctx, pas: pas, max: max, vals: vals };
  }
  function indexMax(d) { return d.vals.indexOf(Math.max.apply(null, d.vals)); }
  function indexMin(d) { return d.vals.indexOf(Math.min.apply(null, d.vals)); }

  /* 4 propositions proches pour une lecture */
  function propositions(v, pas, max) {
    var cands = (pas <= 2 ? [v - 1, v + 1, v - 2, v + 2, v + pas, v - pas] : [v - pas, v + pas, v + 2 * pas, v - 2 * pas].concat(pas === 10 ? [v + 5, v - 5] : [])).filter(function (x) { return x > 0 && x <= max + pas && x !== v && x === Math.round(x); });
    var o = [v], vus = {}; vus[v] = 1;
    melange(cands).forEach(function (x) { if (o.length < 4 && !vus[x]) { o.push(x); vus[x] = 1; } });
    while (o.length < 4) { var y = v + o.length * pas; if (!vus[y]) { o.push(y); vus[y] = 1; } }
    return melange(o);
  }

  /* « Lis le diagramme » : niveau 1 (de 1 en 1) ; niveau 2 (de 2 en 2, de 5 en 5, de 10 en 10, parfois entre deux graduations) */
  function questionsLire(niveau, n) {
    var qs = [], types = melange(["valeur", "valeur", "valeur", "valeur", "plus", "moins"]).slice(0, n);
    types.forEach(function (ty) {
      var d;
      if (niveau === 1) d = tirer({ pas: 1, niveaux: 10, min: 1 });
      else { var p = [2, 5, 10][hasard(0, 2)]; d = tirer({ pas: p, niveaux: p === 2 ? 10 : 8, demi: p !== 5 && Math.random() < 0.5, min: p }); }
      if (ty === "valeur") { var k = hasard(0, d.vals.length - 1); qs.push({ type: "valeur", d: d, k: k, opts: propositions(d.vals[k], d.pas, d.max) }); }
      else qs.push({ type: ty, d: d, k: ty === "plus" ? indexMax(d) : indexMin(d) });
    });
    return qs;
  }

  /* « Je construis le diagramme » : un tableau, l'élève monte les barres */
  function questionsConstruire(n) {
    var qs = [];
    for (var i = 0; i < n; i++) qs.push(tirer({ pas: i < 2 ? 1 : 2, niveaux: 10, min: i < 2 ? 1 : 2 }));
    return qs;
  }

  /* « Problèmes avec un diagramme » : répondre en écrivant un nombre */
  var INUTILE = {
    fruits: { fr: "Le marché ouvre à 6 heures.", en: "The market opens at 6 o'clock." },
    transport: { fr: "L'école a 8 classes.", en: "The school has 8 classes." },
    sports: { fr: "La classe a 3 ballons.", en: "The class has 3 balls." },
    peche: { fr: "Papi Tao part en mer à 5 heures.", en: "Grandad Tao goes out to sea at 5 o'clock." },
    oiseaux: { fr: "La sortie a duré 2 heures.", en: "The trip lasted 2 hours." }
  };
  function deuxEnTout(ctx, A, B) {
    switch (ctx.id) {
      case "transport": return { fr: "Combien d'élèves viennent " + A.fr + " ou " + B.fr + " ?", en: "How many pupils come " + A.en + " or " + B.en + "?" };
      case "sports": return { fr: "Combien d'élèves ont choisi " + A.de + " ou " + B.de + " ?", en: "How many pupils prefer " + A.en + " or " + B.en + "?" };
      case "peche": return { fr: "Combien de poissons Papi Tao a-t-il pêchés " + A.fr + " et " + B.fr + " en tout ?", en: "How many fish did Grandad Tao catch on " + A.en + " and " + B.en + " in all?" };
      default: return { fr: "Combien " + A.de + " et " + B.de + " en tout ?", en: "How many " + A.en + " and " + B.en + " in all?" };
    }
  }
  function que(s) { return /^[aeiouyàâéèêîôh]/i.test(s) ? "qu'" + s : "que " + s; }
  function ecart(ctx, A, B) {
    switch (ctx.id) {
      case "transport": return { fr: "Combien d'élèves de plus viennent " + A.fr + " " + que(B.fr) + " ?", en: "How many more pupils come " + A.en + " than " + B.en + "?" };
      case "sports": return { fr: "Combien d'élèves de plus ont choisi " + A.de + " que " + B.de + " ?", en: "How many more pupils prefer " + A.en + " to " + B.en + "?" };
      case "peche": return { fr: "Combien de poissons de plus " + A.fr + " que " + B.fr + " ?", en: "How many more fish on " + A.en + " than on " + B.en + "?" };
      default: return { fr: "Combien " + A.de + " de plus que " + B.de + " ?", en: "How many more " + A.en + " than " + B.en + "?" };
    }
  }
  function problemes(n) {
    return melange(["total", "ecart", "trois", "prix", "inutile", "ecart"]).slice(0, n).map(function (m) {
      var d = tirer({ ctx: m === "prix" ? "fruits" : m === "trois" ? "peche" : null, pas: 2, niveaux: 10, min: 2 }), c = d.ctx.cats, v = d.vals, L = c.length;
      var o = melange(c.map(function (_, k) { return k; })), a = o[0], b = o[1];
      if (v[a] < v[b]) { var x = a; a = b; b = x; }
      if (m === "total") return { d: d, rep: somme(v), fr: "Combien " + d.ctx.axe.de + " y a-t-il en tout ?", en: "How many " + d.ctx.axe.en + " are there in all?",
        aideFr: "Lis chaque barre, puis additionne les " + L + " nombres.", aideEn: "Read each bar, then add the " + L + " numbers." };
      if (m === "ecart") { var e = ecart(d.ctx, c[a], c[b]); return { d: d, rep: v[a] - v[b], fr: e.fr, en: e.en,
        aideFr: "Lis les deux barres, puis cherche l'écart : le plus grand nombre moins le plus petit.", aideEn: "Read the two bars, then find the difference: the bigger number minus the smaller one." }; }
      if (m === "trois") return { d: d, rep: v[0] + v[1] + v[2], fr: "Combien de poissons Papi Tao a-t-il pêchés du lundi au mercredi ?", en: "How many fish did Grandad Tao catch from Monday to Wednesday?",
        aideFr: "Lis les barres de lundi, mardi et mercredi, puis additionne.", aideEn: "Read the bars for Monday, Tuesday and Wednesday, then add them up." };
      if (m === "prix") { var k = [0, 2, 3, 4][hasard(0, 3)]; return { d: d, rep: v[k] * 100, unite: "F",
        fr: c[k].un + " coûte 100 F. Combien le marchand a-t-il gagné avec les " + c[k].fr + " ?", en: c[k].unEn + " costs 100 F. How much money did the stallholder make from the " + c[k].en + "?",
        aideFr: "Lis la barre des " + c[k].fr + ", puis multiplie par 100 F.", aideEn: "Read the " + c[k].en + " bar, then multiply by 100 F." }; }
      /* une information ne sert pas */
      var q = deuxEnTout(d.ctx, c[Math.min(a, b)], c[Math.max(a, b)]), inu = INUTILE[d.ctx.id];
      return { d: d, rep: v[a] + v[b], fr: inu.fr + " " + q.fr, en: inu.en + " " + q.en, inutile: true,
        aideFr: "Une information ne sert à rien ! Cherche seulement les deux barres de la question.", aideEn: "One piece of information is not needed! Only look for the two bars in the question." };
    });
  }

  /* « Je me rappelle » : comparer des nombres, compter de 2 en 2, de 5 en 5, de 10 en 10, calculer un écart */
  var RAPPEL = [
    { fr: "Quel est le plus grand nombre ?", en: "Which is the biggest number?", o: ["48", "84", "38", "80"], a: 1,
      lfr: "84 a 8 dizaines : c'est le plus grand.", len: "84 has 8 tens: it is the biggest." },
    { fr: "Je compte de 5 en 5 : 0, 5, 10, 15… Quel nombre vient ensuite ?", en: "I count in fives: 0, 5, 10, 15… Which number comes next?", o: ["16", "25", "20", "30"], a: 2,
      lfr: "15 + 5 = 20.", len: "15 + 5 = 20." },
    { fr: "Je compte de 2 en 2 : 0, 2, 4, 6… Quel nombre vient ensuite ?", en: "I count in twos: 0, 2, 4, 6… Which number comes next?", o: ["7", "8", "10", "12"], a: 1,
      lfr: "6 + 2 = 8.", len: "6 + 2 = 8." },
    { fr: "Léo a 12 billes. Méi en a 7. Combien Léo en a-t-il de plus ?", en: "Léo has 12 marbles. Méi has 7. How many more has Léo got?", o: ["19", "5", "7", "4"], a: 1,
      lfr: "12 − 7 = 5. Pour trouver l'écart, je fais une soustraction.", len: "12 − 7 = 5. To find the difference, I subtract." }
  ];

  /* ---------- dessin du diagramme (SVG) ----------
     opts : en (langue), vals (valeurs dessinées, sinon d.vals), montre (indice d'une barre à éclairer avec le trait de lecture),
     construire (colonnes cliquables, data-action="g-haut"), valeurs (écrire le nombre au-dessus des barres : leçon seulement),
     revoir (indices des barres à revoir, entourées en jaune) */
  function couper(txt, n) {
    var mots = txt.split(" "), l = [], cur = "";
    mots.forEach(function (m) { if ((cur + " " + m).trim().length > n && cur) { l.push(cur); cur = m; } else cur = (cur + " " + m).trim(); });
    if (cur) l.push(cur); return l;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function diagramme(d, opts) {
    opts = opts || {};
    var en = !!opts.en, vals = opts.vals || d.vals, n = d.ctx.cats.length;
    var W = 420, G = 46, D = 12, Hh = 18, B = 44, H = 300, ph = H - Hh - B, pw = W - G - D;
    var y = function (v) { return Hh + ph - (v / d.max) * ph; }, col = pw / n, bw = Math.min(46, col * 0.58);
    var s = '<svg class="dg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc((en ? d.ctx.titre.en : d.ctx.titre.fr) + (en ? " (bar chart)" : " (graphique en barres)")) + '">';
    /* graduations et quadrillage, discrets */
    for (var g = 0; g <= d.max; g += d.pas) {
      var yy = y(g);
      s += '<line class="dg-grille' + (g === 0 ? " dg-base" : "") + '" x1="' + G + '" x2="' + (W - D) + '" y1="' + yy + '" y2="' + yy + '"/>' +
        '<text class="dg-nb" x="' + (G - 8) + '" y="' + (yy + 5) + '" text-anchor="end">' + g + "</text>";
    }
    s += '<line class="dg-axe" x1="' + G + '" x2="' + G + '" y1="' + Hh + '" y2="' + (Hh + ph) + '"/>';
    /* barres : bout arrondi de 4 px, posées sur la ligne de base */
    for (var k = 0; k < n; k++) {
      var cx = G + col * k + col / 2, x0 = cx - bw / 2, v = vals[k] || 0, yt = y(v), r = Math.min(4, (Hh + ph - yt) / 2);
      var cls = "dg-barre" + (opts.montre === k ? " dg-barre--vue" : "") + (opts.revoir && opts.revoir.indexOf(k) >= 0 ? " dg-barre--revoir" : "");
      if (v > 0) s += '<path class="' + cls + '" d="M' + x0 + " " + (Hh + ph) + "V" + (yt + r) + "Q" + x0 + " " + yt + " " + (x0 + r) + " " + yt + "H" + (x0 + bw - r) + "Q" + (x0 + bw) + " " + yt + " " + (x0 + bw) + " " + (yt + r) + "V" + (Hh + ph) + 'Z"/>';
      if (opts.montre === k) s += '<line class="dg-lecture" x1="' + G + '" x2="' + x0 + '" y1="' + yt + '" y2="' + yt + '"/><circle class="dg-point" cx="' + G + '" cy="' + yt + '" r="5"/>';
      if (opts.valeurs) s += '<text class="dg-val" x="' + cx + '" y="' + (yt - 8) + '" text-anchor="middle">' + v + "</text>";
      var nom = en ? d.ctx.cats[k].en : d.ctx.cats[k].fr;
      couper(nom, n > 4 ? 8 : 11).forEach(function (l, i) { s += '<text class="dg-cat" x="' + cx + '" y="' + (Hh + ph + 20 + i * 16) + '" text-anchor="middle">' + esc(l) + "</text>"; });
      if (opts.construire) for (var c = d.pas; c <= d.max; c += d.pas) {
        var y1 = y(c), y0 = y(c - d.pas);
        s += '<rect class="dg-case" x="' + (G + col * k + 2) + '" y="' + y1 + '" width="' + (col - 4) + '" height="' + (y0 - y1) + '" data-action="g-haut" data-c="' + k + '" data-v="' + c + '"><title>' + esc(nom) + " : " + c + "</title></rect>";
      }
    }
    return s + "</svg>";
  }

  window.COCO_DONNEES = { CONTEXTES: CONTEXTES, RAPPEL: RAPPEL, tirer: tirer, questionsLire: questionsLire, questionsConstruire: questionsConstruire, problemes: problemes, diagramme: diagramme, somme: somme };
})();
