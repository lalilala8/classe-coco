/* Classe Coco — « Lire l'heure à aiguilles » (Maths, grandeurs et mesures, P5 séquence 2).
   Repris du module du site v0 (d'après les leçons GM5, GM6 et GM7 de l'enseignante), rendu bilingue (D-64).
   Code des leçons (D-65) : petite aiguille et heures en rouge, grande aiguille et minutes en bleu. */
(function () {
  "use strict";
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var H12 = function (h) { return h % 12 || 12; };
  var shuf = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
  var rint = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  var pk = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  /* ---------- dire l'heure ---------- */
  var FW = ["douze", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze"];
  var MW = { 5: "cinq", 10: "dix", 20: "vingt", 25: "vingt-cinq", 35: "trente-cinq", 40: "quarante", 50: "cinquante", 55: "cinquante-cinq" };
  var EW = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
  var EM = { 5: "five", 10: "ten", 20: "twenty", 25: "twenty-five" };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  function hw(h) { var x = H12(h); return x === 1 ? "une heure" : FW[x % 12] + " heures"; }
  /* en mots, comme dans le récap du v0 (FR avec les minutes entre parenthèses) */
  function direFr(h, m) {
    var a = hw(h), b = hw(h + 1);
    if (m === 0) return a + " pile"; if (m === 15) return a + " et quart (15 min)"; if (m === 30) return a + " et demie (30 min)"; if (m === 45) return b + " moins le quart (45 min)";
    return m > 30 ? b + " moins " + MW[60 - m] + " (" + m + " min)" : a + " " + MW[m] + " (" + m + " min)";
  }
  function direEn(h, m) {
    var a = EW[H12(h) % 12], b = EW[H12(h + 1) % 12];
    if (m === 0) return a + " o’clock"; if (m === 15) return "quarter past " + a; if (m === 30) return "half past " + a; if (m === 45) return "quarter to " + b;
    return m < 30 ? EM[m] + " past " + a : EM[60 - m] + " to " + b;
  }
  /* étiquette courte (choix de réponses, Memory) : style « mots », « dig » (4 h 05) ou « moins » (5 h moins 20) */
  function etiquette(h, m, st, lg) {
    if (lg === "en") return direEn(h, m);
    var H = H12(h), N = H12(h + 1);
    if (st !== "dig") {
      if (m === 0) return H + " h pile"; if (m === 30) return H + " h et demie"; if (m === 15) return H + " h et quart"; if (m === 45) return N + " h moins le quart";
      if (st === "moins" && m > 30) return N + " h moins " + (60 - m);
    }
    return H + " h " + pad(m);
  }

  /* ---------- l'horloge (SVG) ---------- */
  function horloge(h, m, o) {
    o = o || {};
    var P = function (a, r) { return [100 + r * Math.sin(a * Math.PI / 180), 100 - r * Math.cos(a * Math.PI / 180)]; }, f = function (x) { return x.toFixed(1); };
    var s = "", t2 = "", ex = "", i, n, k;
    for (i = 0; i < 60; i++) { var A = P(i * 6, 92), B = P(i * 6, i % 5 ? 88 : 83); s += '<line x1="' + f(A[0]) + '" y1="' + f(A[1]) + '" x2="' + f(B[0]) + '" y2="' + f(B[1]) + '" class="hr-tk' + (i % 5 ? "" : " hr-tb") + '"/>'; }
    for (n = 1; n <= 12; n++) { var C = P(n * 30, 68); t2 += '<text x="' + f(C[0]) + '" y="' + f(C[1] + 6) + '" class="hr-cn">' + n + "</text>"; }
    if (o.out) {
      for (k = 0; k < 12; k++) { var D = P(k * 30, 111); t2 += '<text x="' + f(D[0]) + '" y="' + f(D[1] + 4) + '" class="hr-cm">' + k * 5 + "</text>"; }
      var bx = function (cx, cy, w, txt, on) { return '<g class="hr-lb' + (on ? " on" : "") + '"><rect x="' + (cx - w / 2) + '" y="' + (cy - 10) + '" width="' + w + '" height="20" rx="6"/><text x="' + cx + '" y="' + (cy + 4.5) + '">' + txt + "</text></g>"; };
      var L = o.en ? ["o’clock", "quarter past", "half past", "quarter to"] : ["pile", "et quart", "et demie", "moins le quart"];
      ex = bx(100, -32, 64, L[0], m === 0) + bx(262, 100, 80, L[1], m === 15) + bx(100, 232, 76, L[2], m === 30) + bx(-62, 100, 88, L[3], m === 45);
    }
    var aiguille = function (cls, len, w, ang, act) {
      return '<g class="hr-' + cls + '"' + (act ? ' data-action="' + act + '" data-v="' + cls + '" role="button" aria-label="' + (cls === "hh" ? (o.en ? "short hand" : "petite aiguille") : (o.en ? "long hand" : "grande aiguille")) + '"' : "") + ' transform="rotate(' + ang + ' 100 100)">' +
        (act ? '<line x1="100" y1="100" x2="100" y2="' + (100 - len) + '" stroke="transparent" stroke-width="26"/>' : "") +
        '<line x1="100" y1="106" x2="100" y2="' + (100 - len) + '" class="hr-' + cls + 'l" stroke-width="' + w + '"/></g>';
    };
    var ha = o.ha !== undefined ? o.ha : (h % 12) * 30 + m / 2, ma = o.ma !== undefined ? o.ma : m * 6;
    return '<svg class="hr-clk' + (o.out ? " out" : "") + (o.cls ? " " + o.cls : "") + '" viewBox="' + (o.out ? "-112 -44 424 288" : "0 0 200 200") + '"' + (o.drag ? ' data-drag="' + o.drag + '"' : "") +
      (o.deco ? ' aria-hidden="true"' : ' role="img" aria-label="' + (o.en ? "Clock" : "Horloge à aiguilles") + '"') + '><circle cx="100" cy="100" r="96" class="hr-cf"/>' + s + (o.extra || "") + ex +
      aiguille("hh", 44, 8, ha, o.act) + aiguille("mh", 70, 5, ma, o.act) + '<circle cx="100" cy="100" r="6" class="hr-cc"/>' + t2.replace(/class="(hr-cn|hr-cm)"/g, 'class="$1 hl"') + t2 + "</svg>";
  }
  /* secteur coloré : le quart de tour, le demi-tour… (découverte au TBI) */
  function secteur(m, kind) {
    var P = function (a) { return [100 + 92 * Math.sin(a * Math.PI / 180), 100 - 92 * Math.cos(a * Math.PI / 180)]; }, a0 = kind === "left" ? m * 6 : 0, a1 = kind === "left" ? 360 : m * 6;
    if (a1 - a0 <= 0) return "";
    var X = P(a0), Y = P(a1 >= 360 ? 359.99 : a1);
    return '<path class="hr-wg ' + kind + '" d="M100 100L' + X[0].toFixed(1) + " " + X[1].toFixed(1) + "A92 92 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + Y[0].toFixed(1) + " " + Y[1].toFixed(1) + 'Z"/>';
  }

  /* ---------- niveaux de « Lis l'horloge » (repères du niveau 3) ---------- */
  var NIVEAUX = [null,
    { m: [0], s: "mots", fr: "Heures piles", en: "O’clock" },
    { m: [0, 30], s: "mots", fr: "Demi-heures", en: "Half past" },
    { m: [15, 45], s: "mots", fr: "Quarts d’heure", en: "Quarter past and quarter to" },
    { m: [5, 10, 20, 25], s: "dig", fr: "Minutes jusqu’à 25", en: "Five past … twenty-five past" },
    { m: [35, 40, 45, 50, 55], s: "moins", fr: "Moins 25 à moins 5", en: "Twenty-five to … five to" }];
  /* une question : l'heure et 4 propositions (couples [h, m], écrites au moment de l'affichage) */
  function questionLire(niv) {
    var L = NIVEAUX[niv], h = rint(1, 12), m = pk(L.m), os = [[h, m]], cle = function (x) { return etiquette(x[0], x[1], L.s, "fr"); }, vus = {};
    vus[cle([h, m])] = 1;
    [[h, (60 - m) % 60], [h % 12 + 1, m], [(h + 10) % 12 + 1, m], [m / 5 || 12, (h % 12) * 5]].forEach(function (x) {
      if (os.length >= 4 || L.m.indexOf(x[1]) < 0) return; x = [Math.round(x[0]), x[1]]; if (vus[cle(x)]) return; vus[cle(x)] = 1; os.push(x);
    });
    while (os.length < 4) { var y = [rint(1, 12), pk(L.m)]; if (!vus[cle(y)]) { vus[cle(y)] = 1; os.push(y); } }
    var opts = shuf(os); return { h: h, m: m, s: L.s, opts: opts, bonne: opts.findIndex(function (x) { return x[0] === h && x[1] === m; }) };
  }
  function questionsAiguille() { var q = []; for (var i = 0; i < 6; i++) q.push({ t: pk(["hh", "mh"]), h: rint(1, 12), m: pk([0, 15, 30, 45, 10, 20, 35, 50]) }); return q; }
  function heuresVariees(n) { var q = []; for (var i = 0; i < n; i++) q.push({ h: rint(1, 12), m: pk([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]) }); return q; }
  function memory() {
    var ps = shuf([[3, 0], [8, 0], [5, 30], [10, 30], [2, 15], [7, 15], [4, 45], [11, 45], [6, 5], [9, 10], [1, 35], [12, 50]]).slice(0, 6);
    var cartes = []; ps.forEach(function (p, i) { cartes.push({ p: i, t: "c", h: p[0], m: p[1] }, { p: i, t: "w", h: p[0], m: p[1] }); });
    return shuf(cartes);
  }

  /* ---------- « Je me rappelle » : prérequis de la séquence 1 (heure digitale, durées) ---------- */
  var RAPPEL = [
    { fr: "Combien de minutes y a-t-il dans une heure ?", en: "How many minutes are there in one hour?", o: ["60", "100", "24", "30"], a: 0,
      lfr: "Dans une heure, il y a 60 minutes.", len: "In one hour there are 60 minutes." },
    { fr: "Combien d'heures y a-t-il dans une journée ?", en: "How many hours are there in one day?", o: ["12", "24", "60", "10"], a: 1,
      lfr: "Dans une journée, il y a 24 heures.", len: "In one day there are 24 hours." },
    { fr: "Le réveil affiche 16:00. C'est…", en: "The clock shows 16:00. It is…", o: [{ fr: "le matin", en: "in the morning" }, { fr: "l'après-midi", en: "in the afternoon" }], a: 1,
      lfr: "Pour l'après-midi et le soir, on ajoute 12 h : 4:00 de l'après-midi, c'est 16:00.", len: "For p.m., add 12 hours: 4:00 in the afternoon is 16:00." }
  ];

  /* ---------- problèmes d'horloge (v0, séance 4) ---------- */
  var PROBLEMES = [
    { fr: "La récréation commence à l’heure indiquée par l’horloge. Elle dure un quart d’heure. À quelle heure finit-elle ?", en: "Break time starts at the time on the clock. It lasts a quarter of an hour. What time does it end?",
      h: 10, m: 0, o: [{ fr: "10 h et quart", en: "quarter past ten" }, { fr: "10 h et demie", en: "half past ten" }, { fr: "9 h et quart", en: "quarter past nine" }, { fr: "10 h 05", en: "five past ten" }], a: 0 },
    { fr: "Le film commence à l’heure indiquée par l’horloge. Il dure 1 heure. À quelle heure finit-il ?", en: "The film starts at the time on the clock. It lasts 1 hour. What time does it end?",
      h: 3, m: 30, o: [{ fr: "3 h et demie", en: "half past three" }, { fr: "4 h pile", en: "four o’clock" }, { fr: "4 h et demie", en: "half past four" }, { fr: "5 h et demie", en: "half past five" }], a: 2 },
    { fr: "Tom part de chez lui à l’heure indiquée par l’horloge. Il arrive à l’école une demi-heure plus tard. À quelle heure arrive-t-il ?", en: "Tom leaves home at the time on the clock. He gets to school half an hour later. What time does he arrive?",
      h: 6, m: 45, o: [{ fr: "7 h et demie", en: "half past seven" }, { fr: "6 h et quart", en: "quarter past six" }, { fr: "7 h et quart", en: "quarter past seven" }, { fr: "7 h moins le quart", en: "quarter to seven" }], a: 2 },
    { fr: "La pirogue part à l’heure indiquée par l’horloge. Elle arrive à 9 h et demie. Combien de temps dure le trajet ?", en: "The canoe leaves at the time on the clock. It arrives at half past nine. How long is the journey?",
      h: 8, m: 0, o: [{ fr: "1 heure", en: "1 hour" }, { fr: "1 heure et demie", en: "an hour and a half" }, { fr: "2 heures", en: "2 hours" }, { fr: "30 minutes", en: "30 minutes" }], a: 1 },
    { fr: "Mia commence à manger à l’heure indiquée par l’horloge. Elle finit une demi-heure plus tard. À quelle heure finit-elle ?", en: "Mia starts eating at the time on the clock. She finishes half an hour later. What time does she finish?",
      h: 12, m: 15, o: [{ fr: "12 h et demie", en: "half past twelve" }, { fr: "1 h et quart", en: "quarter past one" }, { fr: "12 h et quart", en: "quarter past twelve" }, { fr: "1 h moins le quart", en: "quarter to one" }], a: 3 }
  ];

  /* ---------- découverte guidée au TBI (v0), bilingue ---------- */
  var DECOUVERTE = [
    { h: 3, m: 0, fr: "Voici une horloge. Elle a deux aiguilles. Regardons-les bien !", en: "Here is a clock. It has two hands. Let’s look at them carefully!" },
    { h: 3, m: 0, hl: "hh", fr: "La petite aiguille montre les heures.", en: "The short hand shows the hours." },
    { h: 3, m: 0, hl: "mh", fr: "La grande aiguille montre les minutes.", en: "The long hand shows the minutes." },
    { h: 3, m: 0, fr: "La grande aiguille est sur le 12 : c’est l’heure pile. Il est trois heures pile.", en: "The long hand is on the 12: it is exactly on the hour. It is three o’clock." },
    { h: 3, m: 15, wedge: "el", fr: "La grande aiguille avance d’un quart de tour : 15 minutes, un quart d’heure. Il est trois heures et quart.", en: "The long hand moves a quarter turn: 15 minutes, a quarter of an hour. It is quarter past three." },
    { h: 3, m: 30, wedge: "el", fr: "Encore un quart de tour : un demi-tour en tout, 30 minutes, une demi-heure. Il est trois heures et demie.", en: "Another quarter turn: half a turn in all, 30 minutes, half an hour. It is half past three." },
    { h: 3, m: 45, wedge: "left", fr: "Trois quarts de tour : 45 minutes. Il reste un quart d’heure avant 4 h. Il est quatre heures moins le quart.", en: "Three quarters of a turn: 45 minutes. There is a quarter of an hour left before four o’clock. It is quarter to four." },
    { h: 4, m: 0, out: true, fr: "Quatre heures pile ! On peut aussi compter les minutes de 5 en 5 : 5, 10, 15, 20, 25, 30…", en: "Four o’clock! We can also count the minutes in fives: 5, 10, 15, 20, 25, 30…" },
    { h: 4, m: 25, out: true, fr: "La grande aiguille est sur le 5 : 5 × 5 = 25 minutes. Il est quatre heures vingt-cinq.", en: "The long hand is on the 5: 5 × 5 = 25 minutes. It is twenty-five past four." },
    { h: 4, m: 35, out: true, wedge: "left", fr: "Après la demie, on dit combien de minutes il manque avant l’heure suivante. Il est cinq heures moins vingt-cinq.", en: "After half past, we say how many minutes are left before the next hour. It is twenty-five to five." },
    { h: 5, m: 0, out: true, fr: "À retenir : petite aiguille = heures, grande aiguille = minutes. Pile, et quart, et demie, moins le quart !", en: "Remember: short hand = hours, long hand = minutes. O’clock, quarter past, half past, quarter to!" }
  ];

  window.COCO_HEURE = { pad: pad, H12: H12, shuf: shuf, rint: rint, pk: pk, cap: cap, direFr: direFr, direEn: direEn, etiquette: etiquette, horloge: horloge, secteur: secteur,
    NIVEAUX: NIVEAUX, questionLire: questionLire, questionsAiguille: questionsAiguille, heuresVariees: heuresVariees, memory: memory,
    RAPPEL: RAPPEL, PROBLEMES: PROBLEMES, DECOUVERTE: DECOUVERTE };
})();
