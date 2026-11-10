/* Classe Coco — problèmes ouverts (démarche de Sullivan & Lilburn, « Activités ouvertes en mathématiques », Chenelière 2010).
   Deux problèmes par séquence. Chaque problème existe en mode autonome (élève, iPad), en mode classe (TBI, 4 temps),
   en feuille de recherche à imprimer et en fiche enseignante. */
(function () {
  var PIECES = [5, 10, 20, 50, 100, 200]; /* pièces de la leçon GM1 ; celles de 1 F et 2 F ne circulent plus (D-77, D-82) */
  var FRUITS = [
    { id: "citron", fr: "un citron", en: "a lime", prix: 50 },
    { id: "coco", fr: "une noix de coco", en: "a coconut", prix: 100 },
    { id: "mangue", fr: "une mangue", en: "a mango", prix: 150 },
    { id: "papaye", fr: "une papaye", en: "a papaya", prix: 200 },
    { id: "letchis", fr: "un sachet de letchis", en: "a bag of lychees", prix: 250 },
    { id: "ananas", fr: "un ananas", en: "a pineapple", prix: 300 }
  ];
  /* petits dessins des problèmes de division (couleurs dans site.css) */
  var COQ = '<svg class="po-coq" viewBox="0 0 30 28" aria-hidden="true"><path d="M15 26 3 11Q15-3 27 11Z"/><path d="M15 26 9 6M15 26V4M15 26 21 6" fill="none"/></svg>';
  var LET = '<span class="po-letchi"></span>';
  var repete = function (s, n) { var r = ""; for (var i = 0; i < n; i++) r += s; return r; };
  var somme = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };

  window.COCO_PO = {
    PIECES: PIECES, FRUITS: FRUITS,
    sequences: { monnaie: ["jus", "marche"], division: ["coquillages", "letchis"] },
    problemes: {
      /* ---------- 1. Le jus à 100 F (adapté de Sullivan & Lilburn, L'argent, question 1) ---------- */
      jus: {
        id: "jus", sequence: "monnaie", type: "pieces", perso: "mei",
        titre: { fr: "Le jus à 100 F", en: "The 100 F juice" },
        question: { fr: "Quelles pièces Tom peut-il donner ?", en: "Which coins can Tom give?" },
        enonce: { fr: "Tom paie un jus de <b>100 F</b> avec <b>au moins 2 pièces</b>. Quelles pièces peut-il donner ? Trouve le plus de façons possible.",
                  en: "Tom pays for a <b>100 F</b> juice with <b>at least 2 coins</b>. Which coins can he give? Find as many ways as you can." },
        verifier: function (sol) {
          var t = somme(sol);
          if (t !== 100) return { ok: false, fr: "Ça fait " + t + " F. Tom doit payer exactement 100 F.", en: "That makes " + t + " F. Tom must pay exactly 100 F.", total: t };
          if (sol.length < 2) return { ok: false, fr: "Tom doit donner au moins 2 pièces.", en: "Tom must give at least 2 coins.", total: t };
          return { ok: true, total: t };
        },
        cle: function (sol) { return sol.slice().sort(function (a, b) { return b - a; }).join("+"); },
        ecrire: function (sol) { return sol.slice().sort(function (a, b) { return b - a; }).join(" + ") + " F"; },
        ranger: function (a, b) { return a.length - b.length || b.slice().sort(function (x, y) { return y - x; })[0] - a.slice().sort(function (x, y) { return y - x; })[0]; },
        checklist: [
          { id: "total", fr: "Le total fait bien 100 F.", en: "The total is 100 F." },
          { id: "deux", fr: "Il y a au moins 2 pièces.", en: "There are at least 2 coins." }
        ],
        diagnostic: function (sol) { return { total: somme(sol) === 100, deux: sol.length >= 2 }; },
        pouce: { fr: "Et si Tom n'avait que des pièces de 10 F et de 20 F ? Commence par là.", en: "What if Tom only had 10 F and 20 F coins? Start with those." },
        relances: [
          { fr: "Comment être sûr d'en avoir trouvé beaucoup ? Comment t'es-tu organisé ?", en: "How can you be sure you found lots of them? How did you organise yourself?" },
          { fr: "Peux-tu payer avec le moins de pièces possible ?", en: "Can you pay with as few coins as possible?" },
          { fr: "Peux-tu payer avec exactement 6 pièces ?", en: "Can you pay with exactly 6 coins?" },
          { fr: "Le jus coûte maintenant 75 F. Quelles pièces Tom peut-il donner ?", en: "The juice now costs 75 F. Which coins can Tom give?" }
        ],
        strategies: [
          { fr: "J'ai commencé par les grosses pièces.", en: "I started with the big coins." },
          { fr: "J'ai remplacé une pièce par d'autres qui valent pareil.", en: "I swapped one coin for others worth the same." },
          { fr: "J'ai utilisé plusieurs fois la même pièce.", en: "I used the same coin several times." },
          { fr: "J'ai essayé, puis j'ai corrigé.", en: "I tried, then I corrected it." }
        ],
        retenir: { fr: "Une même somme peut se faire de beaucoup de façons. Pour en trouver beaucoup, je m'organise : je pars des grosses pièces, puis je remplace une pièce par d'autres de même valeur.",
                   en: "The same amount can be made in many ways. To find lots of them, I get organised: I start with the big coins, then I swap one coin for others worth the same." },
        exemple: "50 F = 20 F + 20 F + 10 F",
        toutes: null, nbToutes: 49,
        fiche: {
          source: "Adapté de Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), chapitre « L'argent », niveau débutant, question 1 (« Dans ma poche, il y a 75 ¢. Quelles pièces puis-je avoir ? »).",
          apprend: ["Composer une somme avec les pièces du pays de plusieurs façons (repère niveau 3 : la monnaie en lien avec les décompositions additives).",
                    "Calculer des sommes de pièces et contrôler un total.", "S'organiser pour trouver beaucoup de solutions."],
          pourquoi: ["Plus qu'un rappel : il faut composer une somme, pas seulement la compter.", "On apprend en cherchant : décompositions de 100, échanges de pièces.", "49 réponses possibles : chacun répond à son niveau, et les plus rapides peuvent chercher à toutes les trouver."],
          materiel: ["Pièces factices de 5, 10, 20, 50, 100 et 200 F", "Feuille de recherche (une par groupe)", "iPad pour le mode autonome"],
          temps: [
            ["Poser la question", "5 min", "Projette l'énoncé. Un élève le lit, 2 ou 3 autres le redisent avec leurs mots. Vérifie que tous ont compris que la pièce de 100 F seule ne compte pas. Ne donne aucune méthode.", "« Qui peut redire le problème avec ses mots ? »"],
            ["Chercher par 2 ou 3", "15 à 20 min", "Les groupes manipulent les pièces et notent leurs solutions. Observe et prends des notes pour l'évaluation. Un groupe bloque : coup de pouce. Un groupe a fini : une relance « Pour aller plus loin ».", "« Vous en avez une ? Trouvez-en une autre. »"],
            ["Mettre en commun", "15 min", "Chaque groupe donne une solution à tour de rôle. La classe donne son avis avant que tu vérifies. Puis « Ranger » : du moins de pièces au plus de pièces.", "« Comment le savez-vous ? Est-ce vraiment une nouvelle façon ? »"],
            ["Retenir", "5 à 10 min", "Faites ressortir la méthode : partir des grosses pièces et échanger une pièce contre d'autres de même valeur. Copie de la trace écrite.", ""]
          ],
          reponses: "Avec les pièces de 5, 10, 20, 50 et 100 F, il y a 49 façons (sans compter la pièce de 100 F seule) : il faut s'organiser pour en trouver beaucoup, c'est voulu. Avec peu de pièces : 2 pièces : 50 + 50. 3 pièces : aucune. 4 pièces : 50 + 20 + 20 + 10. 5 pièces : 50 + 20 + 20 + 5 + 5 ; 50 + 20 + 10 + 10 + 10 ; 20 × 5. 6 pièces : 50 + 20 + 10 + 10 + 5 + 5 ; 50 + 10 × 5 ; 20 × 4 + 10 + 10.",
          erreurs: [
            ["Le total ne fait pas 100 F (erreur de calcul).", "« Recompte en commençant par les plus grosses pièces. »"],
            ["La pièce de 100 F seule.", "« Relis le problème : combien de pièces au moins ? »"],
            ["La même solution écrite dans un autre ordre (50 + 20 + 20 + 10 et 20 + 50 + 10 + 20).", "« Est-ce vraiment une nouvelle façon ? Range tes pièces de la plus grosse à la plus petite. »"],
            ["Une pièce qui n'existe pas (25 F, 2 F).", "« Cette pièce existe-t-elle ? Regarde les pièces de la boîte. »"],
            ["La pièce de 200 F : elle vaut plus que le jus.", "« Peux-tu payer 100 F avec une pièce de 200 F ? »"]
          ],
          niveaux: ["Total différent de 100 F, ou la pièce de 100 F seule.",
                    "Une seule solution juste ; pense qu'il n'y en a pas d'autre.",
                    "Plusieurs solutions justes, trouvées au hasard, parfois en double.",
                    "Plusieurs solutions organisées (échange d'une pièce contre d'autres de même valeur).",
                    "Explique une méthode pour en trouver autant qu'on veut, ou trouve le moins de pièces possible et le justifie."],
          reinvestir: ["Le même problème avec 75 F, puis avec 200 F (pièces et billet de 500 F).", "« J'ai 3 pièces dans ma poche. Combien d'argent puis-je avoir ? »"]
        }
      },

      /* ---------- 2. Le marché (méthode « commencer par la fin », Sullivan & Lilburn, chap. 2, exemple « Argent ») ---------- */
      marche: {
        id: "marche", sequence: "monnaie", type: "marche", perso: "tehani",
        titre: { fr: "Au marché", en: "At the market" },
        question: { fr: "Qu'a-t-elle pu acheter ?", en: "What could she have bought?" },
        enonce: { fr: "Au marché, Tehani paie avec un <b>billet de 500 F</b>. La marchande lui rend <b>50 F</b>. Tehani a acheté des fruits <b>tous différents</b>. Qu'a-t-elle pu acheter ?",
                  en: "At the market, Tehani pays with a <b>500 F note</b>. The stallholder gives her <b>50 F</b> change. Tehani bought fruit that is <b>all different</b>. What could she have bought?" },
        verifier: function (sol) {
          var t = somme(sol.map(function (id) { return FRUITS.filter(function (f) { return f.id === id; })[0].prix; }));
          if (t + 50 !== 500) return { ok: false, total: t, fr: "Ces fruits coûtent " + t + " F. Avec les 50 F rendus, ça fait " + (t + 50) + " F, pas 500 F.", en: "This fruit costs " + t + " F. With the 50 F change, that makes " + (t + 50) + " F, not 500 F." };
          return { ok: true, total: t };
        },
        cle: function (sol) { return sol.slice().sort().join("+"); },
        ecrire: function (sol, lg) {
          var noms = sol.map(function (id) { return FRUITS.filter(function (f) { return f.id === id; })[0]; }).sort(function (a, b) { return b.prix - a.prix; });
          return noms.map(function (f) { return f[lg || "fr"] + " (" + f.prix + " F)"; }).join(" + ");
        },
        ranger: function (a, b) {
          var max = function (s) { return Math.max.apply(null, s.map(function (id) { return FRUITS.filter(function (f) { return f.id === id; })[0].prix; })); };
          return max(b) - max(a) || a.length - b.length;
        },
        checklist: [
          { id: "total", fr: "Avec la monnaie rendue, ça fait bien 500 F.", en: "With the change, it makes 500 F." },
          { id: "diff", fr: "Les fruits sont tous différents.", en: "The fruits are all different." }
        ],
        diagnostic: function (sol) { return { total: this.verifier(sol).ok, diff: true }; },
        pouce: { fr: "Combien Tehani a-t-elle dépensé ? Elle a donné 500 F et on lui a rendu 50 F. Ensuite, commence avec l'ananas.", en: "How much did Tehani spend? She gave 500 F and got 50 F back. Then start with the pineapple." },
        relances: [
          { fr: "Les as-tu toutes trouvées ? Comment en être sûr ?", en: "Have you found them all? How can you be sure?" },
          { fr: "Et si Tehani pouvait acheter plusieurs fois le même fruit ?", en: "What if Tehani could buy the same fruit more than once?" },
          { fr: "La marchande lui rend 150 F. Qu'a-t-elle pu acheter ?", en: "The stallholder gives her 150 F change. What could she have bought?" },
          { fr: "Invente ton propre problème de marché pour un camarade.", en: "Make up your own market problem for a friend." }
        ],
        strategies: [
          { fr: "J'ai d'abord calculé combien elle a dépensé.", en: "First I worked out how much she spent." },
          { fr: "J'ai commencé par le fruit le plus cher.", en: "I started with the most expensive fruit." },
          { fr: "J'ai cherché des prix qui vont bien ensemble.", en: "I looked for prices that go well together." },
          { fr: "J'ai essayé, puis j'ai corrigé.", en: "I tried, then I corrected it." }
        ],
        retenir: { fr: "Quand on connaît ce qu'on a donné et ce qu'on nous rend, on trouve ce qu'on a dépensé : 500 F − 50 F = 450 F. Pour trouver toutes les possibilités, je m'organise : je commence par le fruit le plus cher.",
                   en: "When we know what we gave and the change we got, we can find what we spent: 500 F − 50 F = 450 F. To find every possibility, I get organised: I start with the most expensive fruit." },
        exemple: "500 F − 50 F = 450 F",
        toutes: [["ananas", "mangue"], ["ananas", "coco", "citron"], ["letchis", "papaye"], ["letchis", "mangue", "citron"], ["papaye", "mangue", "coco"]],
        fiche: {
          source: "Construit avec la méthode « Commencer par la fin » de Sullivan & Lilburn (chapitre 2), dont l'exemple « Argent » est : « Le caissier m'a remis 35 ¢. Qu'ai-je acheté ? ».",
          apprend: ["Trouver une dépense à partir de la somme donnée et de la monnaie rendue (500 − 50).", "Additionner des prix pour atteindre une somme.", "Chercher toutes les possibilités de façon organisée et savoir quand on les a toutes."],
          pourquoi: ["Plus qu'un rappel : il faut d'abord comprendre ce qu'on cherche (la dépense).", "On apprend en cherchant : rendre la monnaie, compléments à 450.", "5 réponses justes : le groupe qui les a toutes peut chercher à prouver qu'il n'y en a pas d'autre."],
          materiel: ["Étiquettes de prix des 6 fruits (ou les vrais fruits du marché !)", "Billets et pièces factices", "Feuille de recherche"],
          temps: [
            ["Poser la question", "5 min", "Projette l'énoncé et les prix. Fais reformuler : qu'a donné Tehani ? que lui a-t-on rendu ? Ne dis pas qu'il faut calculer 500 − 50.", "« Que sait-on ? Que cherche-t-on ? »"],
            ["Chercher par 2 ou 3", "15 min", "Observe : qui calcule d'abord la dépense, qui essaie au hasard ? Coup de pouce pour les groupes bloqués. Relances pour ceux qui ont tout trouvé.", "« Vous en avez une ? Cherchez-en une autre. »"],
            ["Mettre en commun", "15 min", "Les groupes donnent leurs paniers. La classe vérifie avant toi. Puis « Ranger » : par le fruit le plus cher.", "« Comment êtes-vous sûrs qu'il n'y en a pas d'autre ? »"],
            ["Retenir", "5 à 10 min", "Faites ressortir les deux idées : trouver la dépense (500 − 50 = 450) et s'organiser en partant du plus cher.", ""]
          ],
          reponses: "5 paniers : ananas + mangue ; ananas + noix de coco + citron ; letchis + papaye ; letchis + mangue + citron ; papaye + mangue + noix de coco. Si on peut acheter plusieurs fois le même fruit, il y en a beaucoup plus (26 en tout).",
          erreurs: [
            ["Cherche des paniers à 500 F (oublie la monnaie rendue).", "« Tehani a-t-elle dépensé tout son billet ? »"],
            ["Cherche des paniers à 550 F (ajoute la monnaie).", "« La marchande lui donne 50 F : Tehani a-t-elle dépensé plus ou moins que 500 F ? »"],
            ["Prend deux fois le même fruit.", "« Relis : comment sont les fruits ? »"],
            ["S'arrête après une solution.", "« Est-ce la seule ? Commence par un autre fruit. »"]
          ],
          niveaux: ["Ne trouve pas la dépense ; paniers au hasard.", "Trouve un panier juste, mais ne cherche pas plus loin.", "Trouve plusieurs paniers, sans ordre.", "Trouve les 5 paniers en s'organisant (du plus cher au moins cher).", "Prouve qu'il n'y en a pas d'autre, ou traite la relance « plusieurs fois le même fruit »."],
          reinvestir: ["La marchande rend 150 F, puis 250 F.", "« J'ai payé 1 000 F et on m'a rendu 200 F : qu'ai-je acheté ? »"]
        }
      },

      /* ==========================================================================================
         Période 5 · séquence 3 : la division en ligne (problèmes repris de l'outil de la collègue,
         personnage Nina, D-50 ; écriture 23 = (4 × 5) + 3, D-52 ; l'élève écrit l'égalité, D-54)
         ========================================================================================== */

      /* ---------- 3. Les coquillages de Nina (division avec reste) ---------- */
      coquillages: {
        id: "coquillages", sequence: "division", type: "reglages", perso: "nina",
        titre: { fr: "Les coquillages de Nina", en: "Nina's shells" },
        question: { fr: "Combien de coquillages pouvais-je avoir ?", en: "How many shells could I have had?" },
        enonce: { fr: "Je partage mes coquillages entre des amis : chacun en reçoit <b>autant</b>. À la fin, il m'en reste <b>3</b>. Combien de coquillages pouvais-je avoir ? Avec combien d'amis ? Trouve plusieurs possibilités !",
                  en: "I share my shells between some friends: each friend gets <b>the same number</b>. At the end, I have <b>3</b> left over. How many shells could I have had? How many friends? Find several possibilities!" },
        champs: [
          { k: "a", fr: "Nombre d'amis", en: "Number of friends", min: 1, max: 10, depart: 1 },
          { k: "q", fr: "Coquillages pour chacun", en: "Shells for each friend", min: 0, max: 10, depart: 1 },
          { k: "t", fr: "Combien de coquillages en tout ?", en: "How many shells altogether?", saisie: true }
        ],
        dessin: function (sol, lg) {
          var en = lg === "en", amis = "";
          for (var i = 0; i < sol.a; i++) amis += '<div class="po-assiette"><div>' + repete(COQ, sol.q) + "</div><small>" + (en ? "friend " : "ami ") + (i + 1) + "</small></div>";
          return '<div class="po-dessin">' + amis + '<div class="po-assiette po-assiette--reste"><div>' + repete(COQ, 3) + "</div><small>" + (en ? "left over" : "il reste") + "</small></div></div>";
        },
        verifier: function (sol) {
          var n = sol.a, q = sol.q, t = +sol.t, x = n * q + 3;
          if (q === 0) return { ok: false, fr: "Chaque ami reçoit 0 coquillage : ce n'est pas vraiment un partage.", en: "Each friend gets 0 shells: that is not really sharing." };
          if (n <= 3) return { ok: false, fr: "Avec " + n + " ami" + (n > 1 ? "s" : "") + ", tu peux encore donner un coquillage à chacun. Ce qui reste doit être plus petit que le nombre d'amis.",
                                         en: "With " + n + " friend" + (n > 1 ? "s" : "") + ", you can still give each friend one more shell. What is left over must be smaller than the number of friends." };
          if (t !== x) return { ok: false, fr: "Ça ne tombe pas juste. Recompte les coquillages des amis, puis ajoute les 3 qui restent.", en: "It doesn't add up. Count the friends' shells again, then add the 3 left over." };
          return { ok: true };
        },
        diagnostic: function (sol) { return { chacun: sol.q >= 1, plus: sol.a > 3, total: +sol.t === sol.a * sol.q + 3 }; },
        cle: function (sol) { return sol.a + "x" + sol.q; },
        ecrire: function (sol, lg) {
          var en = lg === "en", d = sol.t + (en ? " shells · " + sol.a + " friend" + (sol.a > 1 ? "s" : "") + " · " + sol.q + " each" : " coquillages · " + sol.a + " ami" + (sol.a > 1 ? "s" : "") + " · " + sol.q + " chacun");
          return +sol.t === sol.a * sol.q + 3 && sol.a > 3 && sol.q > 0 ? d + " → " + sol.t + " = (" + sol.a + " × " + sol.q + ") + 3" : d;
        },
        ranger: function (x, y) { return x.a - y.a || x.q - y.q; },
        checklist: [
          { id: "chacun", fr: "Chaque ami reçoit au moins 1 coquillage.", en: "Each friend gets at least 1 shell." },
          { id: "plus", fr: "Je ne peux plus donner un coquillage à chacun.", en: "I can't give each friend one more shell." },
          { id: "total", fr: "J'ai vérifié le total : (amis × chacun) + 3.", en: "I checked the total: (friends × each) + 3." }
        ],
        ecriture: {
          titre: { fr: "Maintenant, j'écris la division en ligne :", en: "Now I write the division:" },
          lignes: function () { return [["#t", "=", "(", "#a", "×", "#q", ")", "+", "#r"]]; },
          ok: function (sol, v) {
            var a = +v.a, q = +v.q;
            return +v.t === +sol.t && +v.r === 3 && ((a === sol.a && q === sol.q) || (a === sol.q && q === sol.a));
          },
          aide: { fr: "D'abord le nombre de coquillages en tout, puis (nombre d'amis × part de chacun), puis ce qui reste.", en: "First the total number of shells, then (number of friends × shells each), then what is left over." }
        },
        pouce: { fr: "Prends des jetons. Donne 2 coquillages à chacun de 4 amis, puis ajoute les 3 qui restent. Combien y en avait-il ?", en: "Take some counters. Give 2 shells to each of 4 friends, then add the 3 left over. How many were there?" },
        relances: [
          { fr: "Avec 4 amis, quels nombres de coquillages sont possibles ? Que remarques-tu ?", en: "With 4 friends, which numbers of shells are possible? What do you notice?" },
          { fr: "Pourquoi ne peut-on pas partager entre 2 amis ?", en: "Why can't I share between 2 friends?" },
          { fr: "Quel est le plus petit nombre de coquillages possible ?", en: "What is the smallest possible number of shells?" },
          { fr: "Et s'il reste 5 coquillages ?", en: "What if 5 shells are left over?" }
        ],
        strategies: [
          { fr: "J'ai utilisé mes tables, puis j'ai ajouté 3.", en: "I used my times tables, then added 3." },
          { fr: "J'ai gardé le même nombre d'amis et j'ai changé la part de chacun.", en: "I kept the same number of friends and changed how many each one gets." },
          { fr: "J'ai compris pourquoi il faut plus de 3 amis.", en: "I worked out why there must be more than 3 friends." },
          { fr: "J'ai essayé, puis j'ai corrigé.", en: "I tried, then I corrected it." }
        ],
        retenir: { fr: "Dans une division, on partage en parts égales. 23 coquillages partagés entre 4 amis : chacun en reçoit 5, il en reste 3. On écrit 23 = (4 × 5) + 3. 23 est le dividende, 4 le diviseur, 5 le quotient et 3 le reste. Le reste est toujours plus petit que le diviseur.",
                   en: "In a division, we share into equal parts. 23 shells shared between 4 friends: each friend gets 5, and 3 are left over. We write 23 = (4 × 5) + 3. 23 is the dividend, 4 the divisor, 5 the quotient and 3 the remainder. The remainder is always smaller than the divisor." },
        exemple: "23 = (4 × 5) + 3",
        toutes: null, nbToutes: null,
        vueToutes: function (trouves, lg) {
          var en = lg === "en", lignes = "";
          for (var n = 4; n <= 8; n++) {
            lignes += "<tr><th>" + n + (en ? " friends" : " amis") + "</th>";
            for (var q = 1; q <= 6; q++) lignes += '<td class="' + (trouves[n + "x" + q] ? "trouve" : "") + '">' + (n * q + 3) + "<small>" + q + (en ? " each" : " chacun") + "</small></td>";
            lignes += "<td>…</td></tr>";
          }
          return "<h3>" + (en ? "All the possible numbers of shells" : "Les nombres de coquillages possibles") + '</h3><div class="po-defile"><table class="po-toutes"><tbody>' + lignes + "</tbody></table></div>" +
            '<p class="po-note">' + (en ? "With 4 friends, we count on in 4s; with 5 friends, in 5s… And 23 works twice: 4 friends × 5, or 5 friends × 4. There are infinitely many!"
              : "Avec 4 amis, on avance de 4 en 4 ; avec 5 amis, de 5 en 5… Et 23 marche deux fois : 4 amis × 5, ou 5 amis × 4. Il y en a une infinité !") + "</p>";
        },
        feuille: {
          colonnes: [{ fr: "Coquillages", en: "Shells" }, { fr: "Amis", en: "Friends" }, { fr: "Chacun", en: "Each" }, { fr: "Il reste", en: "Left over" }, { fr: "J'écris la division", en: "I write the division", large: true }],
          fixe: { 3: "3" }, lignes: 9,
          bas: { fr: "Peut-on partager entre 2 amis ? Pourquoi ?", en: "Can I share between 2 friends? Why?" }
        },
        fiche: {
          source: "Problème repris, avec son accord, de l’outil « Problèmes ouverts P5 » de la collègue (séquence 3, la division en ligne). D’après Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « Les opérations », p. 69 : un nombre divisé par 5 a 3 comme reste ; quel peut être ce nombre ?",
          moment: "Séances 1 à 3 : partage, quotient et reste",
          apprend: ["Partager en parts égales et écrire la division en ligne : 23 = (4 × 5) + 3.", "Le reste est toujours plus petit que le diviseur : avec 3 amis, il ne peut pas rester 3 coquillages.", "Le vocabulaire : dividende, diviseur, quotient, reste.", "Utiliser ses tables pour fabriquer le nombre de départ."],
          pourquoi: ["Il faut fabriquer le nombre de départ : c'est l'inverse de l'exercice habituel.", "Une infinité de réponses : chacun en trouve avec ses tables (4 × 2 + 3 = 11), les plus à l'aise avec de grands nombres.", "La condition sur le reste (plus de 3 amis) se découvre en vérifiant : c'est le cœur de la division avec reste."],
          materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche par élève ou par groupe.", "Des jetons, des cubes ou de vrais coquillages pour faire les partages.", "Les iPad pour le mode autonome (de 1 à 10 amis, de 0 à 10 coquillages chacun)."],
          temps: [
            ["Poser la question", "5 min", "Projette l'énoncé. Un élève le lit, puis 2 ou 3 autres l'expliquent avec leurs mots. Faites mimer un petit partage avec des jetons, pour que « chacun en reçoit autant » soit clair. Ne donne aucune méthode : c'est à eux de trouver comment s'y prendre.", "« Qu'est-ce qu'on cherche ? Qu'est-ce qu'on sait déjà ? » (il en reste 3)"],
            ["Chercher par 2 ou 3", "15 à 20 min", "Lance le minuteur, passe dans les groupes et observe. Prends des notes pour l'évaluation (les 5 niveaux, plus bas). Un groupe bloque : le coup de pouce. Un groupe a fini : une relance « Pour aller plus loin ».", "Un groupe s'arrête après une réponse : « Trouvez-en une autre. » Un groupe propose 2 ou 3 amis : « Fais le partage avec les jetons. Peux-tu encore en donner à chacun ? »"],
            ["Mettre en commun", "15 min", "Chaque groupe donne une réponse, à tour de rôle : règle le nombre d'amis et la part de chacun, puis tape le nombre de coquillages annoncé par le groupe. Laisse d'abord les élèves donner leur avis, puis touche la carte pour la vérification. Accueille les erreurs avec bienveillance et cherchez ensemble d'où elles viennent. Puis « Ranger » : les réponses se rangent par nombre d'amis.", "« Chacun en a autant ? Il en reste bien 3 ? Écris la division en ligne. » « Peut-on encore en donner un à chacun ? » « Avec 4 amis : 7, 11, 15… Que remarquez-vous ? » (de 4 en 4)"],
            ["Retenir", "5 à 10 min", "La trace écrite avec le vocabulaire (dividende, diviseur, quotient, reste), puis le tableau des possibilités : les réponses de la classe y sont en vert. Faites lire les régularités ligne par ligne.", ""]
          ],
          reponses: "(amis × chacun) + 3, avec plus de 3 amis : il y en a une infinité. Avec 4 amis : 7, 11, 15, 19, 23… (de 4 en 4). Avec 5 amis : 8, 13, 18, 23… (de 5 en 5). Avec 6 amis : 9, 15, 21… 23 marche deux fois : 4 amis et 5 chacun, ou 5 amis et 4 chacun. Le plus petit nombre possible : 7 (4 amis, 1 chacun).",
          erreurs: [
            ["3 amis, 4 chacun, 15 coquillages.", "Le reste n'est pas plus petit que le diviseur.", "« Fais le partage : peux-tu encore donner un coquillage à chacun ? »"],
            ["4 amis, 5 chacun, 20 coquillages.", "Le reste est oublié dans le nombre de départ.", "« Et les 3 qui restent, où sont-ils ? »"],
            ["23 = 4 × 5 = 20 + 3.", "Les égalités enchaînées.", "« 23 est-il égal à 4 × 5 ? Écris-le en une seule égalité : 23 = (4 × 5) + 3. »"],
            ["Des parts inégales.", "« Chacun en reçoit autant » n'est pas compris.", "« Est-ce juste pour tous les amis ? »"]
          ],
          niveaux: ["Écrit des nombres sans lien entre eux.", "Trouve un partage, mais oublie les 3 qui restent ou garde 3 amis ou moins.", "Trouve des réponses justes avec les jetons, mais a du mal à écrire la division en ligne.", "Trouve plusieurs réponses, écrit 23 = (4 × 5) + 3 et explique pourquoi il faut plus de 3 amis.", "Trouve une règle (multiplier puis ajouter 3) ou toutes les réponses pour un nombre d'amis donné."],
          reinvestir: ["« Un nombre divisé par 5 donne un reste de 3. Quel peut être ce nombre ? »", "« On range des élèves par 4 : un élève reste seul. Combien d'élèves peut-il y avoir ? »"]
        }
      },

      /* ---------- 4. Les sachets de letchis (division sans reste) ---------- */
      letchis: {
        id: "letchis", sequence: "division", type: "reglages", perso: "nina",
        titre: { fr: "Les sachets de letchis", en: "The bags of lychees" },
        question: { fr: "Combien de sachets ? Combien de letchis dans chacun ?", en: "How many bags? How many lychees in each?" },
        enonce: { fr: "J'ai <b>24 letchis</b>. Je les range dans des sachets : <b>autant</b> de letchis dans chaque sachet, et il ne doit <b>rien rester</b>. Combien de sachets ? Combien de letchis dans chaque sachet ? Trouve toutes les façons !",
                  en: "I have <b>24 lychees</b>. I put them in bags: <b>the same number</b> of lychees in each bag, and there must be <b>none left over</b>. How many bags? How many lychees in each bag? Find all the ways!" },
        champs: [
          { k: "s", fr: "Nombre de sachets", en: "Number of bags", min: 1, max: 24, depart: 1 },
          { k: "l", fr: "Letchis dans chaque sachet", en: "Lychees in each bag", min: 1, max: 24, depart: 1 }
        ],
        dessin: function (sol, lg) {
          var en = lg === "en", reste = 24, sachets = "";
          for (var i = 0; i < sol.s; i++) {
            var dans = Math.min(sol.l, reste); reste -= dans;
            sachets += '<div class="po-sachet">' + repete(LET, dans) + repete('<span class="po-vide"></span>', sol.l - dans) + "</div>";
          }
          return '<div class="po-dessin">' + sachets + (reste ? '<div class="po-sachet po-sachet--hors"><div>' + repete(LET, reste) + "</div><small>" + (en ? "not in a bag" : "hors des sachets") + "</small></div>" : "") + "</div>";
        },
        verifier: function (sol) {
          var t = sol.s * sol.l;
          if (t < 24) return { ok: false, fr: "Il reste des letchis : " + (24 - t) + " letchi" + (24 - t > 1 ? "s ne sont" : " n'est") + " dans aucun sachet.", en: "Some lychees are left over: " + (24 - t) + (24 - t > 1 ? " are" : " is") + " not in a bag." };
          if (t > 24) return { ok: false, fr: "Il n'y a pas assez de letchis : il en faudrait " + t + ".", en: "There aren't enough lychees: you would need " + t + "." };
          return { ok: true };
        },
        diagnostic: function (sol) { var t = sol.s * sol.l; return { reste: t >= 24, assez: t <= 24, calcul: t === 24 }; },
        cle: function (sol) { return sol.s + "x" + sol.l; },
        ecrire: function (sol, lg) {
          var en = lg === "en", d = sol.s + (en ? " bag" + (sol.s > 1 ? "s" : "") + " of " : " sachet" + (sol.s > 1 ? "s" : "") + " de ") + sol.l;
          return sol.s * sol.l === 24 ? d + " → 24 = " + sol.s + " × " + sol.l : d;
        },
        ranger: function (x, y) { return x.s - y.s; },
        checklist: [
          { id: "reste", fr: "Il ne reste aucun letchi hors des sachets.", en: "No lychees are left outside the bags." },
          { id: "assez", fr: "Il ne manque aucun letchi : chaque sachet est plein.", en: "No lychees are missing: every bag is full." },
          { id: "calcul", fr: "J'ai vérifié : sachets × letchis = 24.", en: "I checked: bags × lychees = 24." }
        ],
        ecriture: {
          titre: { fr: "Maintenant, j'écris la multiplication et la division :", en: "Now I write the multiplication and the division:" },
          lignes: function (lg) { return [["24", "=", "#a", "×", "#b"], ["24", lg === "en" ? "÷" : ":", "#c", "=", "#d"]]; },
          ok: function (sol, v) {
            var paire = function (x, y) { return (x === sol.s && y === sol.l) || (x === sol.l && y === sol.s); };
            return paire(+v.a, +v.b) && paire(+v.c, +v.d);
          },
          aide: { fr: "Utilise tes deux nombres : le nombre de sachets et le nombre de letchis dans chaque sachet.", en: "Use your two numbers: the number of bags and the number of lychees in each bag." }
        },
        pouce: { fr: "Fais des sachets de 2 letchis. Combien de sachets pour tes 24 letchis ? Et avec des sachets de 3 ?", en: "Make bags of 2 lychees. How many bags for your 24 lychees? And with bags of 3?" },
        relances: [
          { fr: "Les as-tu toutes trouvées ? Comment en être sûr ?", en: "Have you found them all? How can you be sure?" },
          { fr: "Pourquoi les sachets de 5 ne marchent-ils pas ?", en: "Why don't bags of 5 work?" },
          { fr: "Écris chaque façon avec une multiplication et une division : 24 = 4 × 6 et 24 : 4 = 6.", en: "Write each way as a multiplication and a division: 24 = 4 × 6 and 24 ÷ 4 = 6." },
          { fr: "Et avec 36 letchis ? Avec 13 ?", en: "What about 36 lychees? Or 13?" }
        ],
        strategies: [
          { fr: "J'ai essayé 1 sachet, puis 2, puis 3… dans l'ordre.", en: "I tried 1 bag, then 2, then 3… in order." },
          { fr: "J'ai utilisé mes tables.", en: "I used my times tables." },
          { fr: "J'ai retourné une façon : 4 sachets de 6, donc 6 sachets de 4.", en: "I turned a way round: 4 bags of 6, so 6 bags of 4." },
          { fr: "J'ai essayé, puis j'ai corrigé.", en: "I tried, then I corrected it." }
        ],
        retenir: { fr: "24 letchis rangés en 4 sachets de 6 : 24 = 4 × 6 et 24 : 4 = 6. 24 est le dividende, 4 le diviseur, 6 le quotient. Il ne reste rien : le reste est 0. On peut aussi faire 6 sachets de 4 : 24 : 6 = 4.",
                   en: "24 lychees put into 4 bags of 6: 24 = 4 × 6 and 24 ÷ 4 = 6. 24 is the dividend, 4 the divisor, 6 the quotient. Nothing is left over: the remainder is 0. We can also make 6 bags of 4: 24 ÷ 6 = 4." },
        exemple: { fr: "24 = 4 × 6 · 24 : 4 = 6", en: "24 = 4 × 6 · 24 ÷ 4 = 6" },
        toutes: [[1, 24], [2, 12], [3, 8], [4, 6], [6, 4], [8, 3], [12, 2], [24, 1]].map(function (x) { return { s: x[0], l: x[1] }; }), nbToutes: 8,
        feuille: {
          colonnes: [{ fr: "Sachets", en: "Bags" }, { fr: "Letchis par sachet", en: "Lychees per bag" }, { fr: "Il reste", en: "Left over" }, { fr: "J'écris", en: "I write", large: true }],
          lignes: 10,
          bas: { fr: "Comment sais-tu que tu les as toutes trouvées ?", en: "How do you know you have found them all?" }
        },
        fiche: {
          source: "Problème repris, avec son accord, de l’outil « Problèmes ouverts P5 » de la collègue (séquence 3, la division en ligne). D’après Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « Les opérations », p. 70 et 72 (□ × □ = 36 ; les élèves d'une école répartis dans des autobus).",
          moment: "Séances 2 à 5 : groupement ou partage, division sans reste",
          apprend: ["Faire des groupements égaux (des sachets de 6) ou des partages égaux (4 sachets) et les écrire : 24 = 4 × 6, 24 : 4 = 6.", "Une multiplication donne deux divisions : 4 sachets de 6, ou 6 sachets de 4.", "Reconnaître une division qui tombe juste (reste 0) grâce aux tables.", "Chercher toutes les possibilités en s'organisant (1, 2, 3… sachets)."],
          pourquoi: ["Il faut chercher les nombres qui « vont dans » 24 : c'est plus que réciter une table.", "8 réponses : chacun en trouve (2 sachets de 12), certains les trouvent toutes et le prouvent.", "Les essais qui ne marchent pas (5 sachets) font apparaître le reste."],
          materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche par élève ou par groupe.", "24 jetons ou cubes par groupe (ou de vrais letchis !).", "Les iPad pour le mode autonome."],
          temps: [
            ["Poser la question", "5 min", "Projette l'énoncé. Un élève le lit, puis 2 ou 3 autres l'expliquent avec leurs mots. Faites reformuler « autant dans chaque sachet » et « il ne doit rien rester ». Ne donne aucune méthode : c'est à eux de trouver comment s'y prendre.", "« Que veut dire « autant dans chaque sachet » ? Et « il ne doit rien rester » ? »"],
            ["Chercher par 2 ou 3", "15 à 20 min", "Lance le minuteur, passe dans les groupes et observe. Prends des notes pour l'évaluation (les 5 niveaux, plus bas). Un groupe bloque : le coup de pouce. Un groupe a fini : une relance « Pour aller plus loin ».", "Un groupe a 4 sachets de 6 : « Et dans l'autre sens ? » Un groupe en a plusieurs : « Vous les avez toutes ? Comment le savoir ? »"],
            ["Mettre en commun", "15 min", "Chaque groupe donne une façon, à tour de rôle : règle le nombre de sachets et le nombre de letchis par sachet. Laisse d'abord les élèves donner leur avis, puis touche la carte pour la vérification. Puis « Ranger » : les façons se rangent par nombre de sachets, et vont par paires (4 sachets de 6, 6 sachets de 4).", "« Il ne reste vraiment rien ? Écris la multiplication et la division. » « C'est un partage ou un groupement ? » « Comment être sûrs de les avoir toutes ? » (essayer 1, 2, 3, 4, 5… sachets)"],
            ["Retenir", "5 à 10 min", "La trace écrite (24 = 4 × 6 ; 24 : 4 = 6 ; dividende, diviseur, quotient), puis « Toutes les réponses » : les 8 façons, celles de la classe cochées.", ""]
          ],
          reponses: "8 façons : 1 sachet de 24, 2 sachets de 12, 3 sachets de 8, 4 sachets de 6, 6 sachets de 4, 8 sachets de 3, 12 sachets de 2, 24 sachets de 1. 5, 7, 9, 10 et 11 sachets ne marchent pas (il reste des letchis). Les façons vont par deux : 3 sachets de 8 et 8 sachets de 3. 1 sachet de 24 et 24 sachets de 1 font souvent débat : ils respectent la consigne : les 8 façons sont acceptées.",
          erreurs: [
            ["5 sachets de 5.", "Le total n'est pas vérifié (25 letchis).", "« Combien de letchis en tout dans tes sachets ? »"],
            ["5 sachets de 4, il en reste 4.", "La consigne « rien ne doit rester » oubliée.", "« Il reste des letchis ? Que dit la question ? »"],
            ["4 : 24 = 6.", "L'ordre des nombres dans la division.", "« Qu'est-ce qu'on partage ? Ça s'écrit en premier. »"],
            ["Des façons au hasard, des oublis.", "Pas de méthode pour tout trouver.", "« Et si on essayait 1 sachet, puis 2, puis 3 ? »"]
          ],
          niveaux: ["Fait des sachets inégaux, ou ne vérifie pas le total.", "Trouve 2 sachets de 12, mais accepte les partages qui laissent un reste.", "Trouve plusieurs façons justes, au hasard, avec les jetons.", "Trouve la plupart des façons, les écrit avec × et :, et voit qu'elles vont par paires.", "Trouve les 8 en s'organisant et prouve qu'il n'y en a pas d'autres."],
          reinvestir: ["« 60 élèves prennent le bus, avec le même nombre d'élèves dans chaque bus. Combien d'élèves peut-il y avoir dans chaque bus ? »", "« □ × □ = 36. Quels peuvent être les nombres ? »"]
        }
      }
    }
  };
})();

/* ==========================================================================================
   Problèmes ouverts de l'heure (D-96) : repris de l'outil « Problèmes ouverts P5 » de la collègue (séquences 1 et 2),
   d'après Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « La mesure du temps ».
   Personnages : Keitri → Tehani, Aaron → Dylan (comme pour « L'heure à l'ardoise », D-73).
   ========================================================================================== */
(function () {
  var PO = window.COCO_PO, H = function () { return window.COCO_HEURE; };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var reveil = function (h, m) { return '<span class="po-reveil">' + (h === "" || h === undefined ? "--" : pad(+h)) + ":" + (m === "" || m === undefined ? "--" : pad(+m)) + "</span>"; };
  var horloge = function (h, m) { return H().horloge(h, m, { deco: true, cls: "po-clk" }); };
  var nb = ["zéro", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt", "vingt et une", "vingt-deux", "vingt-trois"];
  var dizaines = { 2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante" };
  function minutesMots(m) { if (m < 20) return nb[m] === "une" ? "une" : nb[m]; var d = Math.floor(m / 10), u = m % 10; return dizaines[d] + (u === 0 ? "" : u === 1 ? " et une" : "-" + nb[u]); }
  function heureMots(h, m) { var base = h === 0 ? "minuit" : h === 12 ? "midi" : nb[h] + (h === 1 ? " heure" : " heures"); return base + (m === 0 ? (h === 0 || h === 12 ? "" : " pile") : " " + minutesMots(m)); }
  function moment(h, en) { return h < 12 ? (en ? "in the morning" : "le matin") : h < 18 ? (en ? "in the afternoon" : "l’après-midi") : (en ? "in the evening" : "le soir"); }
  var MAGIQUES = ["0000", "0110", "0220", "0330", "0440", "0550", "1001", "1111", "1221", "1331", "1441", "1551", "2002", "2112", "2222", "2332"];

  PO.sequences.digitale = ["magique", "demiheure"];
  PO.sequences.heure = ["aiguilles", "quart"];

  /* ---------- 1. L'heure magique (heure digitale) ---------- */
  PO.problemes.magique = {
    id: "magique", sequence: "digitale", type: "reglages", perso: "tehani",
    titre: { fr: "L’heure magique", en: "The magic time" },
    question: { fr: "Quelle heure magique mon réveil peut-il afficher ?", en: "Which magic time can my clock show?" },
    enonce: { fr: "Mon réveil affiche parfois une <b>heure magique</b> : elle se lit <b>pareil dans les deux sens</b>, comme <b>14:41</b> (1-4-4-1 de gauche à droite, 1-4-4-1 de droite à gauche). Quelle heure magique mon réveil peut-il afficher ? Trouve-en le plus possible !",
              en: "My clock sometimes shows a <b>magic time</b>: it reads <b>the same both ways</b>, like <b>14:41</b> (1-4-4-1 from left to right, 1-4-4-1 from right to left). Which magic time can my clock show? Find as many as you can!" },
    champs: [{ k: "h", fr: "Les heures", en: "Hours", saisie: true }, { k: "m", fr: "Les minutes", en: "Minutes", saisie: true }],
    dessin: function (sol) { return '<div class="po-dessin po-dessin--centre">' + reveil(sol.h, sol.m) + "</div>"; },
    verifier: function (sol) {
      var h = +sol.h, m = +sol.m, t = pad(h) + pad(m);
      if (h > 23) return { ok: false, fr: h + " heures ? Le réveil va de 00 à 23 : après 23:59, il affiche 00:00.", en: h + " hours? The clock goes from 00 to 23: after 23:59 it shows 00:00." };
      if (m > 59) return { ok: false, fr: m + " minutes ? Après 59 minutes, on passe à l’heure suivante : cette heure n’existe pas.", en: m + " minutes? After 59 minutes we go to the next hour: this time does not exist." };
      if (!(t[0] === t[3] && t[1] === t[2])) return { ok: false, fr: "À l’envers, on lit " + t.split("").reverse().join("").replace(/^(..)/, "$1:") + " : ce n’est pas la même heure. Lis les 4 chiffres de droite à gauche.", en: "Backwards it reads " + t.split("").reverse().join("").replace(/^(..)/, "$1:") + ": not the same time. Read the 4 digits from right to left." };
      return { ok: true };
    },
    diagnostic: function (sol) { var h = +sol.h, m = +sol.m, t = pad(h) + pad(m); return { existe: h <= 23 && m <= 59, pareil: t[0] === t[3] && t[1] === t[2] }; },
    cle: function (sol) { return pad(+sol.h) + pad(+sol.m); },
    ecrire: function (sol, lg) { var h = +sol.h, m = +sol.m, en = lg === "en"; return pad(h) + ":" + pad(m) + (h <= 23 && m <= 59 ? " · " + (en ? window.COCO_HEURE.direEn(h % 12 || 12, m) + " " + moment(h, true) : heureMots(h, m) + ", " + moment(h)) : ""); },
    ranger: function (x, y) { return (+x.h * 60 + +x.m) - (+y.h * 60 + +y.m); },
    checklist: [
      { id: "existe", fr: "Mon réveil peut vraiment l’afficher : heures de 00 à 23, minutes de 00 à 59.", en: "My clock can really show it: hours from 00 to 23, minutes from 00 to 59." },
      { id: "pareil", fr: "J’ai lu les 4 chiffres de droite à gauche : c’est pareil.", en: "I read the 4 digits from right to left: it is the same." }
    ],
    pouce: { fr: "Le réveil affiche 1 3, puis deux chiffres cachés. Que doit-il afficher pour être magique ? Ensuite, trouve une autre heure magique qui commence par 1.", en: "The clock shows 1 3, then two hidden digits. What must it show to be magic? Then find another magic time that starts with 1." },
    relances: [
      { fr: "Tu les as toutes trouvées ? Comment en être sûr ?", en: "Have you found them all? How can you be sure?" },
      { fr: "Quelle est la première heure magique de la journée ? Et la dernière ?", en: "What is the first magic time of the day? And the last?" },
      { fr: "Le réveil affiche 12:21. Dans combien de temps verra-t-on la prochaine heure magique ?", en: "The clock shows 12:21. How long until the next magic time?" },
      { fr: "Invente une autre sorte d’heure magique. Quelle est ta règle ?", en: "Make up another kind of magic time. What is your rule?" }
    ],
    strategies: [
      { fr: "J’ai choisi les heures, puis je les ai retournées pour les minutes.", en: "I chose the hours, then turned them round for the minutes." },
      { fr: "J’ai rangé mes heures par premier chiffre : 0, 1, 2.", en: "I sorted my times by their first digit: 0, 1, 2." },
      { fr: "J’ai vérifié que les minutes ne dépassent pas 59.", en: "I checked that the minutes do not go past 59." },
      { fr: "J’ai essayé, puis j’ai corrigé.", en: "I tried, then I corrected it." }
    ],
    retenir: { fr: "Sur un réveil, les 2 premiers chiffres sont les heures : de 00 à 23. Les 2 derniers chiffres sont les minutes : de 00 à 59. Après 59 minutes, on passe à l’heure suivante.", en: "On a digital clock, the first 2 digits are the hours: from 00 to 23. The last 2 digits are the minutes: from 00 to 59. After 59 minutes, we go to the next hour." },
    exemple: "14:41",
    /* mise en commun au clavier, avec des réveils, et correction organisée par premier chiffre (D-136, d’après l’outil de la collègue) */
    commun: { reveil: true,
      relances: [{ fr: "Le réveil peut-il vraiment afficher cette heure ?", en: "Can the clock really show this time?" }, { fr: "Dis-la avec des mots.", en: "Say it in words." }, { fr: "Que fais-tu à cette heure-là ?", en: "What do you do at that time?" }],
      verdict: function (s, en) { var t = String(s).padStart(4, "0"), d = t.split("").map(Number), h = d[0] * 10 + d[1], m = d[2] * 10 + d[3], pareil = d[0] === d[3] && d[1] === d[2];
        if (h > 23 || m > 59) { var R = []; if (h > 23) R.push(en ? t.slice(0, 2) + " hours? After 23:59, the clock shows 00:00." : t.slice(0, 2) + " heures ? Après 23:59, le réveil affiche 00:00."); if (m > 59) R.push(en ? t.slice(2) + " minutes? After 59 minutes, we go to the next hour." : t.slice(2) + " minutes ? Après 59 minutes, on passe à l’heure suivante.");
          return { type: "non", titre: en ? "Does not exist" : "N’existe pas", texte: (pareil ? (en ? "It does read the same both ways, but… " : "Elle se lit bien pareil, mais… ") : "") + R.join(" ") }; }
        if (pareil) return { type: "ok", titre: en ? "Magic!" : "Magique !", texte: en ? window.COCO_HEURE.direEn(h % 12 || 12, m) + " " + moment(h, true) : heureMots(h, m) + ", " + moment(h) };
        var tx = (en ? "Backwards it reads " : "À l’envers, on lit ") + d[3] + d[2] + ":" + d[1] + d[0] + ".";
        if (String(s).length === 3 && s[0] === s[2]) tx = (en ? "With 3 digits it worked, but the clock shows 4: " : "Avec 3 chiffres, ça marchait. Mais le réveil en affiche 4 : ") + t.slice(0, 2) + ":" + t.slice(2) + ". " + tx;
        return { type: "presque", titre: en ? "Not magic" : "Pas magique", texte: tx }; },
      lignes: [{ d: "0", heures: ["0000", "0110", "0220", "0330", "0440", "0550"], non: "0660", pourquoi: { fr: "60 minutes ? n’existe pas", en: "60 minutes? does not exist" } },
        { d: "1", heures: ["1001", "1111", "1221", "1331", "1441", "1551"], non: "1661", pourquoi: { fr: "61 minutes ? n’existe pas", en: "61 minutes? does not exist" } },
        { d: "2", heures: ["2002", "2112", "2222", "2332"], non: "2442", pourquoi: { fr: "24 heures ? n’existe pas", en: "24 hours? does not exist" } }],
      pourquoi: { fr: "Le 2e chiffre devient le chiffre des dizaines de minutes : il s’arrête à 5. Et les heures s’arrêtent à 23.", en: "The 2nd digit becomes the tens digit of the minutes: it stops at 5. And the hours stop at 23." },
      cache: function (t) { return t[0] + "???"; },
      vues: [["retient", { fr: "Ce qu’on retient", en: "What we remember" }], ["toutes", { fr: "Les 16 heures magiques", en: "The 16 magic times" }]],
      passages: [{ r: ["0659", "0700"], f: ["+ 1 min"] }, { r: ["2359", "0000"], f: ["+ 1 min"], cap: ["", { fr: "minuit", en: "midnight" }] }],
      compte: function (n, total, enCours, en) { return n === 0 ? (en ? "There are <b>16</b> magic times in all." : "Il y a <b>16</b> heures magiques en tout.") : n === total ? (en ? "Well done! The class found all <b>16</b> magic times." : "Bravo ! La classe a trouvé les <b>16</b> heures magiques.")
        : (en ? "The class found <b>" + n + "</b> out of 16. " + (enCours ? "Which ones are we missing?" : "") : "La classe en a trouvé <b>" + n + "</b> sur 16. " + (enCours ? "Lesquelles nous manquent ?" : "")); } },
    toutes: null, nbToutes: 16,
    vueToutes: function (trouves, lg) {
      var en = lg === "en";
      return "<h3>" + (en ? "The 16 magic times" : "Les 16 heures magiques") + '</h3><div class="po-grille-heures">' + MAGIQUES.map(function (t) { return '<span class="po-heure' + (trouves[t] ? " trouve" : "") + '">' + reveil(+t.slice(0, 2), +t.slice(2)) + "</span>"; }).join("") + "</div>" +
        '<p class="po-note">' + (en ? "The 2nd digit of the hours becomes the 1st digit of the minutes: it cannot go past 5. And when the hours start with 2, the 2nd digit stops at 3 (23:00)." : "Le 2e chiffre des heures devient le 1er chiffre des minutes : il ne peut pas dépasser 5. Et quand l’heure commence par 2, le 2e chiffre s’arrête à 3 (23 h).") + "</p>";
    },
    feuille: { colonnes: [{ fr: "Le réveil", en: "The clock" }, { fr: "Je le lis à l’envers", en: "I read it backwards" }, { fr: "Magique ?", en: "Magic?" }, { fr: "Je la dis avec des mots", en: "I say it in words", large: true }], lignes: 10,
      bas: { fr: "Comment sais-tu si tu les as toutes trouvées ?", en: "How do you know you have found them all?" } },
    fiche: {
      source: "Problème repris, avec son accord, de l’outil « Problèmes ouverts P5 » de la collègue (séquence 1, l’heure digitale). D’après Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « La mesure du temps », 8-10 ans, p. 99 : « À quelles heures les chiffres sur un cadran numérique forment-ils une régularité ? »",
      moment: "Après la séance 1 de l’heure digitale (la journée = 24 h)",
      apprend: ["Un réveil affiche 4 chiffres : 2 pour les heures (de 00 à 23), 2 pour les minutes (de 00 à 59).", "Une heure n’existe pas si les minutes dépassent 59 ou les heures 23.", "Dire une heure digitale avec des mots et la placer dans la journée.", "Chercher toutes les possibilités en s’organisant."],
      pourquoi: ["Lire l’heure ne suffit pas : il faut comprendre comment le réveil fonctionne.", "16 réponses : chacun en trouve à son niveau, une seule ou toutes.", "Les propositions montrent tout de suite qui sait que les minutes s’arrêtent à 59."],
      materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche par élève ou par groupe.", "Des ardoises, et des étiquettes-chiffres de 0 à 9 pour ceux qui veulent manipuler.", "Les iPad pour le mode autonome."],
      temps: [
        ["Poser la question", "5 min", "Projette l’énoncé. Un élève le lit, puis 2 ou 3 autres l’expliquent avec leurs mots. Vérifiez ensemble l’exemple : 1-4-4-1 de gauche à droite, 1-4-4-1 de droite à gauche. Ne donne aucune méthode.", "« Qu’est-ce qu’une heure magique ? Montre-le sur l’exemple. »"],
        ["Chercher par 2 ou 3", "15 à 20 min", "Lance le minuteur et observe. Un groupe s’arrête après une réponse : « Trouvez-en une autre. » Un groupe en a plusieurs : « Vous les avez toutes ? Comment le savoir ? » Un groupe bloque : le coup de pouce.", ""],
        ["Mettre en commun", "15 min", "Chaque groupe donne une heure, à tour de rôle : tape-la. Laisse d’abord les élèves donner leur avis, puis vérifie. Accueille les erreurs avec bienveillance et cherchez ensemble pourquoi 06:60 n’existe pas.", "« Le réveil peut-il vraiment afficher cette heure ? » « Dis-la avec des mots. » « Que fais-tu à cette heure-là ? »"],
        ["Retenir", "5 à 10 min", "La trace écrite, puis les 16 heures magiques : celles de la classe en vert. Chaque ligne s’arrête sur une heure qui n’existe pas.", ""]
      ],
      reponses: "16 heures magiques : 00:00, 01:10, 02:20, 03:30, 04:40, 05:50 · 10:01, 11:11, 12:21, 13:31, 14:41, 15:51 · 20:02, 21:12, 22:22, 23:32. Le 2e chiffre des heures devient le 1er chiffre des minutes : il ne peut pas dépasser 5. Quand l’heure commence par 2, le 2e chiffre s’arrête à 3 (23 h).",
      erreurs: [["06:60, 07:70, 18:81…", "Les minutes dépassent 59.", "« Qu’affiche le réveil une minute après 06:59 ? »"], ["24:42, 33:33, 44:44…", "Les heures dépassent 23.", "« Qu’affiche le réveil une minute après 23:59 ? »"],
        ["12:12, 10:10…", "Les chiffres sont répétés, pas retournés.", "« Lis-la de droite à gauche. » (21:21, 01:01)"], ["1:01 écrit avec 3 chiffres.", "Le réveil affiche toujours 4 chiffres.", "« Combien de chiffres le réveil affiche-t-il ? » (01:01, qui n’est pas magique)"]],
      niveaux: ["Écrit des heures au hasard, ou des heures qui ne se lisent pas pareil (12:12).", "Trouve 1 ou 2 heures magiques (souvent 11:11 ou 22:22), mêlées à des heures qui n’existent pas (07:70, 33:33).", "Trouve plusieurs heures magiques, au hasard.", "Trouve la plupart des heures magiques en s’organisant (par premier chiffre).", "Trouve les 16 et explique pourquoi chaque ligne s’arrête (minutes jusqu’à 59, heures jusqu’à 23)."],
      reinvestir: ["« Quelles heures du réveil n’utilisent que les chiffres 1 et 2 ? »", "« Le réveil affiche 12:21. Dans combien de temps la prochaine heure magique ? » (13:31, donc 1 h 10 min)"]
    }
  };

  /* ---------- 2. La demi-heure de lecture (heure digitale, ajouter 30 minutes) ---------- */
  PO.problemes.demiheure = {
    id: "demiheure", sequence: "digitale", type: "reglages", perso: "dylan",
    titre: { fr: "La demi-heure de lecture", en: "Half an hour of reading" },
    question: { fr: "Qu’affichent les deux réveils ?", en: "What do the two clocks show?" },
    enonce: { fr: "Ce matin, je lis pendant <b>une demi-heure</b>. Je regarde le réveil quand je commence, puis quand je m’arrête. Qu’affichent les deux réveils ? Trouve plusieurs possibilités !",
              en: "This morning, I read for <b>half an hour</b>. I look at the clock when I start, then when I stop. What do the two clocks show? Find several possibilities!" },
    champs: [{ k: "h1", fr: "Je commence : heures", en: "I start: hours", saisie: true }, { k: "m1", fr: "minutes", en: "minutes", saisie: true }, { k: "h2", fr: "Je m’arrête : heures", en: "I stop: hours", saisie: true }, { k: "m2", fr: "minutes", en: "minutes", saisie: true }],
    dessin: function (sol, lg) { var en = lg === "en"; return '<div class="po-dessin po-dessin--centre"><figure>' + reveil(sol.h1, sol.m1) + "<figcaption>" + (en ? "I start" : "je commence") + '</figcaption></figure><span class="po-fl">→</span><figure>' + reveil(sol.h2, sol.m2) + "<figcaption>" + (en ? "I stop" : "je m’arrête") + "</figcaption></figure></div>"; },
    verifier: function (sol) {
      var h1 = +sol.h1, m1 = +sol.m1, h2 = +sol.h2, m2 = +sol.m2;
      if (m1 > 59 || m2 > 59) return { ok: false, fr: "Après 59 minutes, on passe à l’heure suivante : un réveil n’affiche jamais plus de 59 minutes.", en: "After 59 minutes, we go to the next hour: a clock never shows more than 59 minutes." };
      if (h1 > 23 || h2 > 23) return { ok: false, fr: "Le réveil va de 00 à 23 heures.", en: "The clock goes from 00 to 23 hours." };
      var d = h2 * 60 + m2 - (h1 * 60 + m1);
      if (d !== 30) return { ok: false, fr: "De " + pad(h1) + ":" + pad(m1) + " à " + pad(h2) + ":" + pad(m2) + ", il passe " + (d < 0 ? "un temps négatif" : d + " minutes") + ", pas 30. Une demi-heure, c’est 30 minutes : passe par l’heure pile si besoin.", en: "From " + pad(h1) + ":" + pad(m1) + " to " + pad(h2) + ":" + pad(m2) + " is " + (d < 0 ? "a negative time" : d + " minutes") + ", not 30. Half an hour is 30 minutes: go through the o'clock if you need to." };
      if (h1 >= 12) return { ok: false, fr: "Ça fait bien 30 minutes, mais à " + pad(h1) + ":" + pad(m1) + ", c’est " + moment(h1) + " : je lis le matin.", en: "That is 30 minutes, but at " + pad(h1) + ":" + pad(m1) + " it is " + moment(h1, true) + ": I read in the morning." };
      return { ok: true };
    },
    diagnostic: function (sol) { var h1 = +sol.h1, m1 = +sol.m1, h2 = +sol.h2, m2 = +sol.m2; return { existe: m1 <= 59 && m2 <= 59 && h1 <= 23 && h2 <= 23, trente: h2 * 60 + m2 - (h1 * 60 + m1) === 30, matin: h1 < 12 }; },
    cle: function (sol) { return pad(+sol.h1) + pad(+sol.m1); },
    ecrire: function (sol) { return pad(+sol.h1) + ":" + pad(+sol.m1) + " → " + pad(+sol.h2) + ":" + pad(+sol.m2); },
    ranger: function (x, y) { return (+x.h1 * 60 + +x.m1) - (+y.h1 * 60 + +y.m1); },
    checklist: [
      { id: "existe", fr: "Mes réveils existent : les minutes ne dépassent pas 59.", en: "My clocks exist: the minutes do not go past 59." },
      { id: "trente", fr: "J’ai compté 30 minutes entre les deux réveils.", en: "I counted 30 minutes between the two clocks." },
      { id: "matin", fr: "C’est le matin.", en: "It is the morning." }
    ],
    pouce: { fr: "Je commence à lire à huit heures pile. Qu’affiche le réveil quand je m’arrête ? Une demi-heure, c’est la moitié d’une heure.", en: "I start reading at eight o'clock. What does the clock show when I stop? Half an hour is half of an hour." },
    relances: [
      { fr: "Trouve une paire où le chiffre des heures change.", en: "Find a pair where the hour changes." },
      { fr: "Je commence à 10:45. Qu’affiche le réveil à la fin ?", en: "I start at 10:45. What does the clock show at the end?" },
      { fr: "Je m’arrête à 09:10. Qu’affichait le réveil au début ?", en: "I stop at 09:10. What did the clock show at the start?" },
      { fr: "Et si je lis trois quarts d’heure ?", en: "What if I read for three quarters of an hour?" }
    ],
    strategies: [
      { fr: "J’ai ajouté 30 aux minutes.", en: "I added 30 to the minutes." },
      { fr: "Je suis passé par l’heure pile : de 10:45 à 11:00, puis de 11:00 à 11:15.", en: "I went through the o'clock: from 10:45 to 11:00, then from 11:00 to 11:15." },
      { fr: "J’ai utilisé une horloge : un demi-tour de la grande aiguille.", en: "I used a clock: half a turn of the long hand." },
      { fr: "J’ai essayé, puis j’ai corrigé.", en: "I tried, then I corrected it." }
    ],
    retenir: { fr: "Une demi-heure, c’est 30 minutes. Un quart d’heure, c’est 15 minutes. Pour avancer de 30 minutes, on peut passer par l’heure pile : de 10:45 à 11:00, 15 minutes ; de 11:00 à 11:15, encore 15 minutes. Donc 10:45 + 30 minutes = 11:15.", en: "Half an hour is 30 minutes. A quarter of an hour is 15 minutes. To move on 30 minutes, we can go through the o'clock: from 10:45 to 11:00, 15 minutes; from 11:00 to 11:15, another 15 minutes. So 10:45 + 30 minutes = 11:15." },
    exemple: "10:45 + 30 min = 11:15",
    /* mise en commun au clavier avec des paires de réveils, et correction organisée (D-136, comme L’heure magique) */
    commun: { reveil: false, paire: true, /* en attente de validation : passer à true */
      relances: [{ fr: "Ça fait vraiment une demi-heure ?", en: "Is it really half an hour?" }, { fr: "Dis les deux heures avec des mots.", en: "Say both times in words." }, { fr: "C’est bien le matin ?", en: "Is it really the morning?" }],
      verdict: function (s, en) { var t = String(s), h1 = +t.slice(0, 2), m1 = +t.slice(2, 4), h2 = +t.slice(4, 6), m2 = +t.slice(6, 8), A = pad(h1) + ":" + pad(m1), B = pad(h2) + ":" + pad(m2), R = [];
        [[h1, m1], [h2, m2]].forEach(function (x) { if (x[1] > 59) R.push(en ? pad(x[1]) + " minutes? After 59 minutes, we go to the next hour." : pad(x[1]) + " minutes ? Après 59 minutes, on passe à l’heure suivante."); if (x[0] > 23) R.push(en ? pad(x[0]) + " hours? The clock goes from 00 to 23." : pad(x[0]) + " heures ? Le réveil va de 00 à 23."); });
        if (R.length) return { type: "non", titre: en ? "Does not exist" : "N’existe pas", texte: R.join(" ") };
        var d = h2 * 60 + m2 - (h1 * 60 + m1);
        if (d !== 30) return { type: "presque", titre: en ? "Not half an hour" : "Pas une demi-heure", texte: d <= 0 ? (en ? "The 2nd clock does not show a later time than the 1st." : "Le 2e réveil n’affiche pas une heure plus tard que le 1er.")
          : (en ? "From " + A + " to " + B + " is " + d + " minutes, not 30." : "De " + A + " à " + B + ", il passe " + d + " minutes, pas 30.") + (m1 >= 30 && h2 !== h1 ? (en ? " Go through " + pad(h1 + 1) + ":00." : " Passe par " + pad(h1 + 1) + ":00.") : "") };
        if (h1 >= 12) return { type: "presque", titre: en ? "Not the morning" : "Pas le matin", texte: en ? "That is 30 minutes, but at " + A + " it is " + moment(h1, true) + "." : "Ça fait bien 30 minutes, mais à " + A + ", c’est " + moment(h1) + "." };
        return { type: "ok", titre: en ? "Half an hour!" : "Une demi-heure !", texte: "" }; },
      groupe: function (t, en) { return +t.slice(2, 4) < 30 ? ["a", en ? "We start before half past" : "On commence avant la demie"] : ["b", en ? "We start at half past or after" : "On commence à la demie ou après"]; },
      cache: function (t) { return t.slice(0, 4) + "????"; },
      vues: [["retient", { fr: "Ce qu’on retient", en: "What we remember" }], ["nos", { fr: "Nos paires, rangées", en: "Our pairs, sorted" }], ["toutes", { fr: "Les paires en quarts d’heure", en: "The quarter-hour pairs" }]],
      passages: [{ r: ["1045", "1100", "1115"], f: ["+ 15 min", "+ 15 min"] }],
      colonnes: [{ titre: { fr: "Le chiffre des heures ne change pas", en: "The hour does not change" }, test: function (t) { return +t.slice(2, 4) < 30; } }, { titre: { fr: "On passe à l’heure suivante", en: "We go to the next hour" }, test: function (t) { return +t.slice(2, 4) >= 30; } }],
      compteNos: function (n, en) { return n === 0 ? (en ? "No pair checked yet: check them in “We share”." : "Aucune paire vérifiée pour l’instant : vérifiez-les dans « On met en commun ».") : en ? "The class found <b>" + n + "</b> right pair" + (n > 1 ? "s" : "") + ". Do we have both kinds?" : "La classe a trouvé <b>" + n + "</b> paire" + (n > 1 ? "s" : "") + " juste" + (n > 1 ? "s" : "") + ". A-t-on les deux sortes ?"; },
      pourquoiNos: { fr: "Si les minutes du début vont de 00 à 29, on ajoute 30 aux minutes. De 30 à 59, on passe à l’heure suivante.", en: "If the minutes at the start go from 00 to 29, we add 30 to the minutes. From 30 to 59, we go to the next hour." },
      lignes: [{ titre: { fr: "pile → et demie", en: "o’clock → half past" }, heures: ["07000730", "08000830", "09000930", "10001030", "11001130"], non: "08000850", pourquoi: { fr: "50 minutes, pas 30", en: "50 minutes, not 30" } },
        { titre: { fr: "et quart → moins le quart", en: "quarter past → quarter to" }, heures: ["07150745", "08150845", "09150945", "10151045", "11151145"], non: "08150915", pourquoi: { fr: "1 heure, pas 30 minutes", en: "1 hour, not 30 minutes" } },
        { titre: { fr: "et demie → pile", en: "half past → o’clock" }, heures: ["07300800", "08300900", "09301000", "10301100", "11301200"], non: "09300960", pourquoi: { fr: "60 minutes ? n’existe pas", en: "60 minutes? does not exist" } },
        { titre: { fr: "moins le quart → et quart", en: "quarter to → quarter past" }, heures: ["07450815", "08450915", "09451015", "10451115", "11451215"], non: "09450975", pourquoi: { fr: "75 minutes ? n’existe pas", en: "75 minutes? does not exist" } }],
      compte: function (n, total, enCours, en) { return n === 0 ? (en ? "From 7 o’clock to midday, there are <b>" + total + "</b> pairs in quarter hours." : "De 7 heures à midi, il y a <b>" + total + "</b> paires en quarts d’heure.") : n === total ? (en ? "Well done! The class found all <b>" + total + "</b>." : "Bravo ! La classe les a toutes trouvées.")
        : (en ? "The class found <b>" + n + "</b> out of " + total + ". " + (enCours ? "Which ones are we missing?" : "") : "La classe en a trouvé <b>" + n + "</b> sur " + total + ". " + (enCours ? "Lesquelles nous manquent ?" : "")); },
      pourquoi: { fr: "Une demi-heure, c’est 2 quarts d’heure. Quand on commence à la demie ou après, on passe à l’heure suivante.", en: "Half an hour is 2 quarters of an hour. When we start at half past or after, we go to the next hour." } },
    toutes: null, nbToutes: null,
    vueToutes: function (trouves, lg) {
      var en = lg === "en", cles = Object.keys(trouves).sort(), a = [], b = [];
      cles.forEach(function (c) { var h = +c.slice(0, 2), m = +c.slice(2), f = h * 60 + m + 30, txt = reveil(h, m) + " → " + reveil(Math.floor(f / 60), f % 60); (m < 30 ? a : b).push("<li>" + txt + "</li>"); });
      return "<h3>" + (en ? "All the “+ 30 minutes” pairs of the morning" : "Toutes les paires « + 30 minutes » du matin") + '</h3><div class="po-deux"><div><h4>' + (en ? "The hour does not change" : "Le chiffre des heures ne change pas") + "</h4><ul>" + (a.join("") || "<li>…</li>") + "</ul></div><div><h4>" + (en ? "We go to the next hour" : "On passe à l’heure suivante") + "</h4><ul>" + (b.join("") || "<li>…</li>") + "</ul></div></div>" +
        '<p class="po-note">' + (en ? "If the minutes at the start go from 00 to 29, we add 30 to the minutes. From 30 to 59, we go to the next hour and take 30 away from the minutes. There is a pair for every minute of the morning!" : "Si les minutes du début vont de 00 à 29, on ajoute 30 aux minutes. De 30 à 59, on passe à l’heure suivante et on enlève 30 aux minutes. Il y a une paire pour chaque minute du matin !") + "</p>";
    },
    feuille: { colonnes: [{ fr: "Je commence", en: "I start" }, { fr: "Je m’arrête", en: "I stop" }, { fr: "Je vérifie : 30 minutes ?", en: "I check: 30 minutes?" }, { fr: "Je les dis avec des mots", en: "I say them in words", large: true }], lignes: 9,
      bas: { fr: "Trouve une paire où le chiffre des heures change. Comment as-tu fait ?", en: "Find a pair where the hour changes. How did you do it?" } },
    fiche: {
      source: "Problème repris, avec son accord, de l’outil « Problèmes ouverts P5 » de la collègue (séquence 1, l’heure digitale et les durées). D’après Sullivan & Lilburn, « La mesure du temps », 8-10 ans, p. 99 (on part de la maison et on arrive à l’école 45 minutes plus tard : à quelle heure ?).",
      moment: "Séquence 1, après le travail sur les durées",
      apprend: ["Une demi-heure = 30 minutes ; un quart d’heure = 15 minutes.", "Ajouter 30 minutes à une heure digitale, même quand on passe à l’heure suivante (09:50 → 10:20).", "Après 59 minutes, on passe à l’heure suivante : 09:80 n’existe pas.", "Dire les heures avec des mots, et avec « et quart, et demie, moins le quart »."],
      pourquoi: ["Il y a une réponse pour chaque minute du matin : chacun commence par une paire facile (08:00 → 08:30).", "Les paires qui changent d’heure montrent qui a compris que 1 h = 60 min.", "Les erreurs (09:50 → 09:80, ou → 10:30 en comptant comme pour 100) se voient tout de suite."],
      materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche par élève ou par groupe.", "Des ardoises, et des horloges pour voir la demi-heure (un demi-tour de la grande aiguille).", "Les iPad pour le mode autonome."],
      temps: [
        ["Poser la question", "5 min", "Projette l’énoncé et fais-le reformuler : « Une demi-heure, c’est combien de minutes ? » Ne donne aucune méthode.", ""],
        ["Chercher par 2 ou 3", "15 à 20 min", "Lance le minuteur et observe. Un groupe n’a que des « pile → et demie » : « Trouvez une paire où le chiffre des heures change. » Un groupe bloque : le coup de pouce.", ""],
        ["Mettre en commun", "15 min", "Chaque groupe donne une paire : tape le début, puis la fin. Laisse la classe donner son avis, puis vérifie.", "« Ça fait vraiment une demi-heure ? » « Dis les deux heures avec des mots. » « C’est bien le matin ? »"],
        ["Retenir", "5 à 10 min", "La trace écrite (passer par l’heure pile), puis les paires de la classe rangées en deux colonnes.", ""]
      ],
      reponses: "Toutes les paires « + 30 minutes » du matin. Début de :00 à :29 : 08:00 → 08:30 · 09:15 → 09:45 · 10:29 → 10:59… Début de :30 à :59 : 08:30 → 09:00 · 09:50 → 10:20 · 11:45 → 12:15… Il y a une paire pour chaque minute du matin : ce qui compte, c’est de comprendre comment on les fabrique.",
      erreurs: [["09:50 → 09:80.", "Les minutes dépassent 59.", "« Qu’affiche le réveil une minute après 09:59 ? »"], ["09:50 → 10:30.", "On a compté comme si une heure faisait 100 minutes.", "« Comptons de 09:50 à 10:00, puis de 10:00 à 10:30. Combien de minutes en tout ? »"],
        ["08:00 → 08:50 ou 08:00 → 09:00.", "La demi-heure confondue avec 50 minutes, ou avec une heure.", "« Combien de minutes dans une heure ? Et dans la moitié d’une heure ? »"], ["08:45 lu « huit heures moins le quart ».", "Le « moins le quart » se dit avant l’heure suivante.", "« 08:45, c’est un quart d’heure avant quelle heure ? »"], ["Des heures de l’après-midi.", "Le matin oublié.", "« C’est le matin ? Que fais-tu à cette heure-là ? »"]],
      niveaux: ["Écrit deux heures au hasard, ou une seule heure.", "Trouve des paires « pile → et demie » (08:00 → 08:30), mais se trompe dès que l’heure change (09:50 → 09:80).", "Trouve plusieurs paires justes sans changer d’heure, ou se trompe parfois sur les minutes.", "Trouve des paires des deux sortes et explique le passage par l’heure pile.", "Énonce la règle (début avant ou après la demie) ou retrouve le début à partir de la fin."],
      reinvestir: ["« La récréation dure un quart d’heure. Qu’affichent les réveils au début et à la fin ? »", "« Dylan part à l’école et arrive 45 minutes plus tard. Qu’affichent les réveils au départ et à l’arrivée ? »"]
    }
  };

  /* ---------- 3. Les aiguilles sur le même nombre (heure à aiguilles) ---------- */
  PO.problemes.aiguilles = {
    id: "aiguilles", sequence: "heure", type: "reglages", perso: "tehani",
    titre: { fr: "Les aiguilles sur le même nombre", en: "Hands on the same number" },
    question: { fr: "Quelle heure peut-il être ?", en: "What time can it be?" },
    enonce: { fr: "Sur mon horloge, l’aiguille des minutes est <b>sur le même nombre</b> que l’aiguille des heures. Par exemple, à <b>4 h 20</b> : l’aiguille des heures montre le 4, et l’aiguille des minutes est sur le 4. Quelle heure peut-il être ? Trouve-en le plus possible !",
              en: "On my clock, the minute hand is <b>on the same number</b> as the hour hand. For example, at <b>twenty past four</b>: the hour hand shows the 4, and the minute hand is on the 4. What time can it be? Find as many as you can!" },
    champs: [{ k: "h", fr: "Les heures", en: "Hours", min: 1, max: 12, depart: 1 }, { k: "m", fr: "Les minutes", en: "Minutes", min: 0, max: 55, depart: 0, pas: 5, deux: true }],
    dessin: function (sol, lg) { var en = lg === "en"; return '<div class="po-dessin po-dessin--centre"><figure>' + horloge(sol.h, sol.m) + "<figcaption>" + H().cap(en ? H().direEn(sol.h, sol.m) : H().direFr(sol.h, sol.m).replace(/ \(\d+ min\)$/, "")) + "</figcaption></figure></div>"; },
    verifier: function (sol) {
      var n = sol.m === 0 ? 12 : sol.m / 5;
      if (n !== sol.h) return { ok: false, fr: "L’aiguille des minutes est sur le " + n + " (" + sol.m + " minutes), et l’aiguille des heures montre le " + sol.h + " : ce n’est pas le même nombre.", en: "The minute hand is on the " + n + " (" + sol.m + " minutes) and the hour hand shows the " + sol.h + ": not the same number." };
      return { ok: true };
    },
    diagnostic: function (sol) { var n = sol.m === 0 ? 12 : sol.m / 5; return { meme: n === sol.h, cinq: true }; },
    cle: function (sol) { return String(sol.h); },
    ecrire: function (sol, lg) { return sol.h + " h " + pad(sol.m) + " · " + (lg === "en" ? H().direEn(sol.h, sol.m) : H().direFr(sol.h, sol.m).replace(/ \(\d+ min\)$/, "")); },
    ranger: function (x, y) { return x.h - y.h; },
    checklist: [
      { id: "meme", fr: "Les deux aiguilles montrent le même nombre.", en: "Both hands show the same number." },
      { id: "cinq", fr: "J’ai compté les minutes de 5 en 5.", en: "I counted the minutes in fives." }
    ],
    pouce: { fr: "Quand l’aiguille des minutes est sur le 3, combien de minutes est-il ? Et sur le 6 ? À quelle heure l’aiguille des heures montre-t-elle aussi le 3 ?", en: "When the minute hand is on the 3, how many minutes is it? And on the 6? At what time does the hour hand also show the 3?" },
    relances: [
      { fr: "Tu les as toutes trouvées ? Comment en être sûr ?", en: "Have you found them all? How can you be sure?" },
      { fr: "Dis chaque heure de deux façons : 7 h 40, c’est aussi huit heures moins vingt.", en: "Say each time in two ways: 7:40 is also twenty to eight." },
      { fr: "À quelle heure les deux aiguilles sont-elles vraiment l’une sur l’autre ?", en: "At what time are the two hands really on top of each other?" },
      { fr: "Et si l’aiguille des minutes est sur le nombre juste après ?", en: "What if the minute hand is on the next number?" }
    ],
    strategies: [
      { fr: "J’ai multiplié le nombre par 5 pour trouver les minutes.", en: "I multiplied the number by 5 to find the minutes." },
      { fr: "J’ai essayé chaque nombre de 1 à 12.", en: "I tried each number from 1 to 12." },
      { fr: "J’ai fait tourner les aiguilles d’une horloge.", en: "I turned the hands of a clock." },
      { fr: "J’ai essayé, puis j’ai corrigé.", en: "I tried, then I corrected it." }
    ],
    retenir: { fr: "Sur l’horloge, l’aiguille des minutes compte de 5 en 5 : sur le 1, 5 minutes ; sur le 3, 15 minutes (et quart) ; sur le 6, 30 minutes (et demie) ; sur le 9, 45 minutes (moins le quart). Après la demie, on dit « moins » : 7 h 40, c’est huit heures moins vingt. L’aiguille des heures avance aussi, petit à petit, vers le nombre suivant.",
               en: "On the clock, the minute hand counts in fives: on the 1, 5 minutes; on the 3, 15 minutes (quarter past); on the 6, 30 minutes (half past); on the 9, 45 minutes (quarter to). After half past, we say “to”: 7:40 is twenty to eight. The hour hand also moves, little by little, towards the next number." },
    exemple: "4 h 20",
    toutes: null, nbToutes: 12,
    vueToutes: function (trouves, lg) {
      var en = lg === "en";
      return "<h3>" + (en ? "The 12 times" : "Les 12 heures") + '</h3><div class="po-grille-heures po-grille-clk">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (h) { var m = h === 12 ? 0 : h * 5; return '<span class="po-heure' + (trouves[String(h)] ? " trouve" : "") + '">' + horloge(h, m) + "<small>" + h + " h " + pad(m) + "</small></span>"; }).join("") + "</div>" +
        '<p class="po-note">' + (en ? "The minutes are 5 times the hour: on the 7, 7 × 5 = 35 minutes. At 12 o'clock, the minute hand is on the 12: 0 minutes." : "Les minutes valent 5 fois le nombre des heures : sur le 7, 7 × 5 = 35 minutes. À 12 h, l’aiguille des minutes est sur le 12 : 0 minute.") + "</p>";
    },
    feuille: { colonnes: [{ fr: "Je dessine les aiguilles", en: "I draw the hands", large: true }, { fr: "J’écris l’heure", en: "I write the time" }, { fr: "Je la dis avec des mots", en: "I say it in words", large: true }], lignes: 8,
      bas: { fr: "Que remarques-tu ?", en: "What do you notice?" } },
    fiche: {
      source: "Problème repris, avec son accord, de l’outil « Problèmes ouverts P5 » de la collègue (séquence 2, l’heure à aiguilles). D’après Sullivan & Lilburn, « La mesure du temps », 8-10 ans, p. 100 (les aiguilles forment un angle plus petit qu’un quart de tour : quelle heure peut-il être ?).",
      moment: "Après la séance 3 (les minutes de 5 en 5, « moins 5, moins 10… »)",
      apprend: ["L’aiguille des minutes compte de 5 en 5 : sur le 3, 15 minutes ; sur le 8, 40 minutes.", "L’aiguille des heures avance entre deux nombres : à 6 h 30, elle est à mi-chemin entre le 6 et le 7.", "Dire l’heure avec « et quart, et demie, moins le quart, moins vingt-cinq, moins dix, moins cinq ».", "Chercher toutes les possibilités en s’organisant (de 1 à 12)."],
      pourquoi: ["Il faut relier le nombre montré aux minutes (× 5) : lire l’heure ne suffit pas.", "12 réponses : chacun en trouve à son niveau, et la régularité (minutes = 5 × heures) se voit en les rangeant.", "Les réponses font dire toutes les heures « moins » : 7 h 35, c’est huit heures moins vingt-cinq."],
      materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche (cadrans vides) par élève ou par groupe.", "Les horloges individuelles de la classe, pour manipuler.", "Les iPad pour le mode autonome."],
      temps: [
        ["Poser la question", "5 min", "Montrez l’exemple sur une horloge de la classe : l’aiguille des heures a dépassé le 4, l’aiguille des minutes est sur le 4.", "« Sur quel nombre est l’aiguille des minutes à 4 h 20 ? Et l’aiguille des heures ? »"],
        ["Chercher par 2 ou 3", "15 à 20 min", "Observe et note pour l’évaluation. Un groupe hésite sur l’aiguille des heures : « Fais tourner l’aiguille des minutes sur ton horloge : que fait l’aiguille des heures ? »", ""],
        ["Mettre en commun", "15 min", "Chaque groupe donne une heure : règle-la, l’horloge se dessine. Laisse la classe donner son avis, puis vérifie. Puis : « Comment savoir s’il en manque ? » (une par nombre, de 1 à 12).", "« Sur quel nombre est l’aiguille des minutes ? Combien de minutes ça fait ? » « Dis l’heure de deux façons. »"],
        ["Retenir", "5 à 10 min", "La trace écrite (les minutes de 5 en 5), puis les 12 heures : celles de la classe en vert.", ""]
      ],
      reponses: "12 heures : 1 h 05, 2 h 10, 3 h 15, 4 h 20, 5 h 25, 6 h 30, 7 h 35, 8 h 40, 9 h 45, 10 h 50, 11 h 55, 12 h. Les minutes valent 5 fois le nombre des heures (sauf à 12 h : l’aiguille des minutes est sur le 12, 0 minute).",
      erreurs: [["3 h 03, 6 h 06…", "Le nombre montré par l’aiguille des minutes est lu comme des minutes.", "« Quand l’aiguille des minutes est sur le 1, combien de minutes est-il ? »"], ["6 h 30 dessinée avec l’aiguille des heures pile sur le 6.", "Pour l’élève, l’aiguille des heures ne bouge pas.", "« Fais faire un demi-tour à l’aiguille des minutes : où est passée l’aiguille des heures ? »"],
        ["7 h 35 lu « sept heures moins vingt-cinq ».", "Le « moins » se compte avant l’heure suivante.", "« Moins vingt-cinq : il manque 25 minutes pour arriver à quelle heure ? »"], ["Les aiguilles inversées.", "Confusion entre l’aiguille des heures et l’aiguille des minutes.", "« Laquelle est la plus grande ? Laquelle tourne le plus vite ? »"], ["Des heures au hasard, sans ordre.", "", "« Comment être sûrs de les avoir toutes ? Essayez nombre par nombre. »"]],
      niveaux: ["Dessine des aiguilles au hasard, sans savoir lire l’heure obtenue.", "Trouve 12 h ou 3 h 15, mais écrit 4 h 04 pour « sur le 4 ».", "Trouve plusieurs heures justes, au hasard, et a du mal à les dire avec « moins ».", "Trouve la plupart des heures en allant de 1 à 12 et les dit de deux façons.", "Trouve les 12, énonce la régularité (minutes = 5 × heures) ou explique pourquoi les aiguilles ne sont pas tout à fait l’une sur l’autre."],
      reinvestir: ["« Les deux aiguilles forment un angle droit. Quelle heure peut-il être ? » (3 h, 9 h… et des heures « presque »)", "« Il est entre 2 h et 3 h, et l’aiguille des minutes est sur un nombre pair. Quelle heure peut-il être ? »"]
    }
  };

  /* ---------- 4. Un quart de tour (heure à aiguilles et durées) ---------- */
  PO.problemes.quart = {
    id: "quart", sequence: "heure", type: "reglages", perso: "dylan",
    titre: { fr: "Un quart de tour", en: "A quarter turn" },
    question: { fr: "Quelle heure était-il avant ? Et après ?", en: "What time was it before? And after?" },
    enonce: { fr: "Je regarde l’horloge, je joue, puis je la regarde encore : l’aiguille des minutes a fait <b>un quart de tour</b>. Un quart de tour, c’est un quart du cadran. Quelle heure était-il avant ? Et après ? Trouve plusieurs possibilités !",
              en: "I look at the clock, I play, then I look again: the minute hand has made <b>a quarter turn</b>. A quarter turn is a quarter of the clock face. What time was it before? And after? Find several possibilities!" },
    champs: [{ k: "h1", fr: "Avant : heures", en: "Before: hours", min: 1, max: 12, depart: 3 }, { k: "m1", fr: "minutes", en: "minutes", min: 0, max: 55, depart: 0, pas: 5, deux: true },
             { k: "h2", fr: "Après : heures", en: "After: hours", min: 1, max: 12, depart: 3 }, { k: "m2", fr: "minutes", en: "minutes", min: 0, max: 55, depart: 0, pas: 5, deux: true }],
    dessin: function (sol, lg) { var en = lg === "en"; return '<div class="po-dessin po-dessin--centre"><figure>' + horloge(sol.h1, sol.m1) + "<figcaption>" + (en ? "before" : "avant") + '</figcaption></figure><span class="po-fl">→</span><figure>' + horloge(sol.h2, sol.m2) + "<figcaption>" + (en ? "after" : "après") + "</figcaption></figure></div>"; },
    verifier: function (sol) {
      var d = ((sol.h2 % 12) * 60 + sol.m2 - ((sol.h1 % 12) * 60 + sol.m1) + 720) % 720;
      if (d === 15) return { ok: true };
      if (sol.m1 >= 45 && sol.m2 === sol.m1 - 45 && sol.h2 === sol.h1) return { ok: false, fr: "L’aiguille des minutes est passée par le 12 : l’aiguille des heures arrive au nombre suivant. Change l’heure !", en: "The minute hand went past the 12: the hour hand moves on to the next number. Change the hour!" };
      if (d === 30) return { ok: false, fr: "Ça, c’est un demi-tour : 30 minutes. Un quart de tour, c’est 15 minutes.", en: "That is half a turn: 30 minutes. A quarter turn is 15 minutes." };
      return { ok: false, fr: "Entre les deux horloges, il passe " + (d === 0 ? "0 minute" : d + " minutes") + ". Un quart de tour, c’est un quart du cadran : 3 nombres, 3 × 5 = 15 minutes.", en: "Between the two clocks, " + d + " minutes go by. A quarter turn is a quarter of the face: 3 numbers, 3 × 5 = 15 minutes." };
    },
    diagnostic: function (sol) { var d = ((sol.h2 % 12) * 60 + sol.m2 - ((sol.h1 % 12) * 60 + sol.m1) + 720) % 720; return { quinze: (sol.m2 - sol.m1 + 60) % 60 === 15, douze: !(sol.m1 >= 45 && sol.h2 === sol.h1) && d < 60 }; },
    cle: function (sol) { return sol.h1 + ":" + pad(sol.m1); },
    ecrire: function (sol) { return sol.h1 + " h " + pad(sol.m1) + " → " + sol.h2 + " h " + pad(sol.m2); },
    ranger: function (x, y) { return (x.h1 * 60 + x.m1) - (y.h1 * 60 + y.m1); },
    checklist: [
      { id: "quinze", fr: "J’ai compté 15 minutes : 3 nombres sur le cadran.", en: "I counted 15 minutes: 3 numbers on the face." },
      { id: "douze", fr: "Si l’aiguille des minutes passe par le 12, j’ai changé l’heure.", en: "If the minute hand goes past the 12, I changed the hour." }
    ],
    pouce: { fr: "Avant, il est 2 h pile : l’aiguille des minutes est sur le 12. Après un quart de tour, sur quel nombre est-elle ? Quelle heure est-il ?", en: "Before, it is 2 o'clock: the minute hand is on the 12. After a quarter turn, which number is it on? What time is it?" },
    relances: [
      { fr: "Trouve une paire où l’aiguille des minutes passe par le 12.", en: "Find a pair where the minute hand goes past the 12." },
      { fr: "Avant, il est dix heures moins dix. Quelle heure est-il après ?", en: "Before, it is ten to ten. What time is it after?" },
      { fr: "Un quart de tour, c’est combien de minutes ? Et un demi-tour ? Et un tour entier ?", en: "How many minutes is a quarter turn? And half a turn? And a whole turn?" },
      { fr: "Pendant ce quart de tour, comment bouge l’aiguille des heures ?", en: "During this quarter turn, how does the hour hand move?" }
    ],
    strategies: [
      { fr: "J’ai compté 3 nombres sur le cadran : 15 minutes.", en: "I counted 3 numbers on the face: 15 minutes." },
      { fr: "J’ai ajouté 15 aux minutes.", en: "I added 15 to the minutes." },
      { fr: "Je suis passé par l’heure pile, puis j’ai changé l’heure.", en: "I went through the o'clock, then changed the hour." },
      { fr: "J’ai essayé, puis j’ai corrigé.", en: "I tried, then I corrected it." }
    ],
    retenir: { fr: "Quand l’aiguille des minutes fait un quart de tour, il passe un quart d’heure : 15 minutes. Un demi-tour, c’est une demi-heure (30 minutes). Un tour entier, c’est une heure (60 minutes). Quand l’aiguille des minutes passe par le 12, l’aiguille des heures arrive au nombre suivant : de 2 h 50 à 3 h 05, il passe 15 minutes.",
               en: "When the minute hand makes a quarter turn, a quarter of an hour goes by: 15 minutes. Half a turn is half an hour (30 minutes). A whole turn is an hour (60 minutes). When the minute hand goes past the 12, the hour hand reaches the next number: from 2:50 to 3:05, 15 minutes go by." },
    exemple: "2 h 50 → 3 h 05",
    toutes: null, nbToutes: null,
    vueToutes: function (trouves, lg) {
      var en = lg === "en", a = [], b = [];
      Object.keys(trouves).forEach(function (c) { var h = +c.split(":")[0], m = +c.split(":")[1], f = h * 60 + m + 15, h2 = Math.floor(f / 60) % 12 || 12; (m < 45 ? a : b).push("<li>" + h + " h " + pad(m) + " → " + h2 + " h " + pad(f % 60) + "</li>"); });
      return "<h3>" + (en ? "All the “+ 15 minutes” pairs" : "Toutes les paires « + 15 minutes »") + '</h3><div class="po-deux"><div><h4>' + (en ? "Without going past the 12" : "Sans passer par le 12") + "</h4><ul>" + (a.join("") || "<li>…</li>") + "</ul></div><div><h4>" + (en ? "Going past the 12" : "En passant par le 12") + "</h4><ul>" + (b.join("") || "<li>…</li>") + "</ul></div></div>" +
        '<p class="po-note">' + (en ? "There is a pair for every starting time. If the starting minutes go from 00 to 44, we add 15 to the minutes; from 45 to 59, the minute hand reaches or passes the 12: we go to the next hour." : "Il y a une paire pour chaque heure de départ. Si les minutes du départ vont de 00 à 44, on ajoute 15 aux minutes ; de 45 à 59, l’aiguille des minutes arrive au 12 ou le dépasse : on passe à l’heure suivante.") + "</p>";
    },
    feuille: { colonnes: [{ fr: "Avant (dessine les aiguilles)", en: "Before (draw the hands)", large: true }, { fr: "Après (dessine les aiguilles)", en: "After (draw the hands)", large: true }, { fr: "J’écris les deux heures", en: "I write both times" }], lignes: 7,
      bas: { fr: "Trouve une paire où l’aiguille des minutes passe par le 12. Que fait l’aiguille des heures ?", en: "Find a pair where the minute hand goes past the 12. What does the hour hand do?" } },
    fiche: {
      source: "Problème repris, avec son accord, de l’outil « Problèmes ouverts P5 » de la collègue (séquence 2, l’heure à aiguilles et les durées). D’après Sullivan & Lilburn, p. 125 (à quelles heures les aiguilles forment un quart de tour) et « La mesure du temps », 8-10 ans, p. 99.",
      moment: "Séquence 2, après les quarts d’heure",
      apprend: ["Un quart de tour de l’aiguille des minutes = un quart d’heure = 15 minutes (un demi-tour = 30 min, un tour = 1 h).", "Avancer de 15 minutes sur l’horloge, même en passant par le 12 : 2 h 50 → 3 h 05.", "Quand l’aiguille des minutes passe par le 12, l’aiguille des heures arrive au nombre suivant.", "Dire les heures avec « et quart, et demie, moins le quart, moins dix… »."],
      pourquoi: ["Il faut relier une part de tour à une durée : c’est plus que lire l’heure.", "Beaucoup de réponses : 3 h → 3 h 15 pour commencer, 2 h 50 → 3 h 05 pour aller plus loin.", "Les paires qui passent par le 12 montrent qui sait que l’heure change à ce moment-là."],
      materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche (cadrans vides) par élève ou par groupe.", "Les horloges individuelles de la classe.", "Les iPad pour le mode autonome."],
      temps: [
        ["Poser la question", "5 min", "Faites montrer un quart de tour sur une horloge de la classe. Ne donne aucune méthode.", "« Un quart de tour, c’est quelle part du cadran ? »"],
        ["Chercher par 2 ou 3", "15 à 20 min", "Observe et note. Un groupe ne part que d’heures piles : « Trouvez une paire où l’aiguille des minutes passe par le 12. » Un groupe bloque : le coup de pouce.", ""],
        ["Mettre en commun", "15 min", "Chaque groupe donne une paire : règle les deux horloges. Laisse la classe donner son avis, puis vérifie.", "« C’est vraiment un quart de tour ? » « Ça fait combien de minutes ? » « Dis les deux heures avec des mots. »"],
        ["Retenir", "5 à 10 min", "La trace écrite (quart, demi, tour entier), puis les paires de la classe : sans passer par le 12, en passant par le 12.", ""]
      ],
      reponses: "Toutes les paires « + 15 minutes ». Sans passer par le 12 : 3 h → 3 h 15 · 8 h 20 → 8 h 35 · 6 h 30 → 6 h 45… En passant par le 12 : 6 h 45 → 7 h · 2 h 50 → 3 h 05 · 11 h 55 → 12 h 10… Il y a une paire pour chaque heure de départ.",
      erreurs: [["2 h 50 → 2 h 05.", "L’aiguille des minutes passe par le 12, mais l’heure ne change pas.", "« Fais-le sur l’horloge : où est l’aiguille des heures à la fin ? »"], ["3 h → 3 h 30.", "Le quart de tour confondu avec le demi-tour.", "« Combien de quarts de tour dans un tour entier ? Montre-les. »"],
        ["3 h → 3 h 25.", "Le quart de tour estimé « à vue ».", "« Un quart du cadran, ça fait combien de nombres ? » (3 nombres : 3 × 5 = 15 minutes)"], ["3 h → 4 h.", "C’est l’aiguille des heures qui a tourné.", "« Quelle aiguille a fait le quart de tour ? »"]],
      niveaux: ["Dessine deux heures sans lien entre elles.", "Trouve 12 h → 12 h 15 ou 3 h → 3 h 15, mais se trompe dès qu’on ne part pas d’une heure pile.", "Trouve plusieurs paires justes sans passer par le 12, ou oublie de changer l’heure.", "Trouve des paires des deux sortes et explique ce qui arrive à l’aiguille des heures.", "Énonce une règle (on ajoute 15 minutes ; à partir de 45, on passe à l’heure suivante) ou relie quart, demi et tour entier aux minutes."],
      reinvestir: ["« L’aiguille des minutes a fait un demi-tour. Quelle heure était-il avant ? Et après ? »", "« Le dessin animé dure trois quarts d’heure et finit à midi moins dix. À quelle heure commence-t-il ? »"]
    }
  };

  /* ==========================================================================================
     Période 5 · séquence 4 : les masses (problèmes repris de l’outil de la collègue, personnage Sari, D-50).
     Repères : leçon GM8 (1 g, c’est le poids d’un trombone) et ceux de la collègue (un paquet de sucre 1 kg,
     une petite voiture environ 1 t), D-109. « L’étiquette effacée » : tri vérifié + objets libres de l’élève, D-109.
     ========================================================================================== */
  PO.sequences.masses = ["etiquette", "panier"];
  var milliers = function (n, lg) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, lg === "en" ? "," : " "); };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var somme = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
  /* une balance de cuisine : la masse affichée et son unité (« ? » si l’unité est effacée) */
  var balanceM = function (v, u) {
    return '<svg class="po-balance" viewBox="0 0 220 140" aria-hidden="true"><rect class="po-bal-plateau" x="28" y="6" width="164" height="14" rx="7"/><rect class="po-bal-pied" x="96" y="20" width="28" height="14"/>' +
      '<rect class="po-bal-corps" x="8" y="32" width="204" height="102" rx="26"/><rect class="po-bal-ecran" x="32" y="52" width="156" height="62" rx="10"/>' +
      '<text class="po-bal-v" x="110" y="96" text-anchor="middle">' + v + '<tspan class="po-bal-u' + (u === "?" ? " po-bal-efface" : "") + '" dx="8">' + u + "</tspan></text></svg>";
  };
  PO.balance = balanceM;

  /* ---------- 1. L’étiquette effacée (5 g, 5 kg ou 5 t : estimer et choisir l’unité) ---------- */
  var UNITES_M = [
    { k: "g", fr: "5 g", en: "5 g", g: 5 },
    { k: "kg", fr: "5 kg", en: "5 kg", g: 5000 },
    { k: "t", fr: "5 t", en: "5 t", g: 5000000 },
    { k: "non", fr: "Aucune des trois", en: "None of the three" }
  ];
  /* masses approchées : on vérifie l’ordre de grandeur ; les pièges ne pèsent ni 5 g, ni 5 kg, ni 5 t */
  var OBJETS_M = [
    { id: "morceau", u: "g", g: 5, fr: "un morceau de sucre", en: "a sugar cube", m: { fr: "environ 5 g", en: "about 5 g" } },
    { id: "feuille", u: "g", g: 5, fr: "une feuille de papier", en: "a sheet of paper", m: { fr: "environ 5 g", en: "about 5 g" } },
    { id: "crayon", u: "g", g: 5, fr: "un crayon de papier", en: "a pencil", m: { fr: "environ 5 g", en: "about 5 g" } },
    { id: "riz", u: "kg", g: 5000, fr: "un sac de riz de 5 kg", en: "a 5 kg bag of rice", m: { fr: "5 kg", en: "5 kg" } },
    { id: "sucre5", u: "kg", g: 5000, fr: "5 paquets de sucre", en: "5 bags of sugar", m: { fr: "5 kg", en: "5 kg" } },
    { id: "chat", u: "kg", g: 5000, fr: "un chat", en: "a cat", m: { fr: "environ 5 kg", en: "about 5 kg" } },
    { id: "pasteque", u: "kg", g: 5000, fr: "une pastèque", en: "a watermelon", m: { fr: "environ 5 kg", en: "about 5 kg" } },
    { id: "elephant", u: "t", g: 5000000, fr: "un éléphant", en: "an elephant", m: { fr: "environ 5 t", en: "about 5 t" } },
    { id: "camion", u: "t", g: 5000000, fr: "un petit camion", en: "a small lorry", m: { fr: "environ 5 t", en: "about 5 t" } },
    { id: "voitures", u: "t", g: 5000000, fr: "5 petites voitures", en: "5 small cars", m: { fr: "environ 5 t", en: "about 5 t" } },
    { id: "trombone", u: "non", g: 1, fr: "un trombone", en: "a paper clip", m: { fr: "1 g", en: "1 g" } },
    { id: "mangue", u: "non", g: 400, fr: "une mangue", en: "a mango", m: { fr: "environ 400 g", en: "about 400 g" } },
    { id: "sucre", u: "non", g: 1000, fr: "un paquet de sucre", en: "a bag of sugar", m: { fr: "1 kg", en: "1 kg" } },
    { id: "enfant", u: "non", g: 27000, fr: "un enfant de 8 ans", en: "an 8-year-old child", m: { fr: "environ 27 kg", en: "about 27 kg" } },
    { id: "voiture", u: "non", g: 1000000, fr: "une petite voiture", en: "a small car", m: { fr: "environ 1 t", en: "about 1 t" } },
    { id: "fourmi", u: "non", g: 0.005, fr: "une fourmi", en: "an ant", m: { fr: "bien moins de 1 g", en: "much less than 1 g" } }
  ];
  var objM = function (id) { return OBJETS_M.filter(function (o) { return o.id === id; })[0]; };
  var uniteM = function (k) { return UNITES_M.filter(function (u) { return u.k === k; })[0]; };
  var nomM = function (sol, lg) { return sol.libre ? sol.libre : objM(sol.o)[lg === "en" ? "en" : "fr"]; };
  PO.OBJETS_M = OBJETS_M; PO.UNITES_M = UNITES_M;

  PO.problemes.etiquette = {
    id: "etiquette", sequence: "masses", type: "etiquette", perso: "sari",
    titre: { fr: "L’étiquette effacée", en: "The rubbed-out label" },
    question: { fr: "Qu’ai-je pu peser ?", en: "What could I have weighed?" },
    enonce: { fr: "J’ai pesé quelque chose. La balance affiche <b>5</b>… mais l’unité est effacée ! 5 grammes ? 5 kilogrammes ? 5 tonnes ? <b>Qu’ai-je pu peser ?</b> Trouve des objets pour chaque unité !",
              en: "I weighed something. The scale shows <b>5</b>… but the unit has been rubbed out! 5 grams? 5 kilograms? 5 tonnes? <b>What could I have weighed?</b> Find objects for each unit!" },
    enonceExtra: function () { return '<span class="po-bal-zone">' + balanceM("5", "?") + "</span>"; },
    depart: function () { return { o: "", u: "", libre: "" }; },
    pret: function (sol) { return !!((sol.o || String(sol.libre).trim()) && sol.u); },
    verifier: function (sol) {
      var u = uniteM(sol.u);
      if (sol.libre) {
        if (sol.u === "non") return { ok: false, fr: "Pour ton objet, choisis 5 g, 5 kg ou 5 t : cherche un objet qui pèse autant !", en: "For your own object, choose 5 g, 5 kg or 5 t: look for something that weighs that much!" };
        return { ok: true, libre: true, fr: "On vérifiera en classe s’il peut vraiment peser " + u.fr + " : avec un repère, ou à la balance.", en: "We will check in class whether it can really weigh " + u.en + ": with a benchmark, or on the scale." };
      }
      var o = objM(sol.o);
      if (o.u === sol.u) return o.u === "non"
        ? { ok: true, fr: "Bien vu : " + o.fr + " pèse " + o.m.fr + ", ni 5 g, ni 5 kg, ni 5 t.", en: "Well spotted: " + o.en + " weighs " + o.m.en + ", not 5 g, 5 kg or 5 t." }
        : { ok: true, fr: cap(o.fr) + " pèse " + o.m.fr + ".", en: cap(o.en) + " weighs " + o.m.en + "." };
      var dit = cap(o.fr) + " pèse " + o.m.fr + ". ", say = cap(o.en) + " weighs " + o.m.en + ". ";
      if (sol.u === "non") return { ok: false, fr: dit + "Dans quelle boîte va-t-il ?", en: say + "Which box does it go in?" };
      return o.g > u.g ? { ok: false, fr: dit + "C’est bien plus lourd que " + u.fr + ".", en: say + "That is much heavier than " + u.en + "." }
        : { ok: false, fr: dit + "C’est bien plus léger que " + u.fr + ".", en: say + "That is much lighter than " + u.en + "." };
    },
    diagnostic: function (sol) { return { repere: true, lu: this.verifier(sol).ok }; },
    cle: function (sol) { return sol.libre ? "libre:" + String(sol.libre).trim().toLowerCase() + ":" + sol.u : sol.o + ":" + sol.u; },
    estLibre: function (sol) { return !!sol.libre; },
    ecrire: function (sol, lg) {
      var en = lg === "en", u = uniteM(sol.u);
      return nomM(sol, lg) + " → " + (sol.u === "non" ? (en ? "none of the three" : "aucune des trois") : u[en ? "en" : "fr"]) + (sol.libre ? (en ? " (to check in class)" : " (à vérifier en classe)") : "");
    },
    ranger: function (a, b) {
      var r = function (s) { return ["g", "kg", "t", "non"].indexOf(s.u) * 2 + (s.libre ? 1 : 0); };
      return r(a) - r(b) || nomM(a).localeCompare(nomM(b), "fr");
    },
    checklist: [
      { id: "repere", fr: "J’ai comparé avec un repère : un trombone (1 g), un paquet de sucre (1 kg), une petite voiture (environ 1 t).", en: "I compared with a benchmark: a paper clip (1 g), a bag of sugar (1 kg), a small car (about 1 t)." },
      { id: "lu", fr: "J’ai lu le nombre avec son unité : 5 grammes, 5 kilogrammes ou 5 tonnes.", en: "I read the number with its unit: 5 grams, 5 kilograms or 5 tonnes." }
    ],
    pouce: { fr: "Un trombone pèse 1 g. Un paquet de sucre pèse 1 kg. Une petite voiture pèse environ 1 t. Qu’est-ce qui pèse autant que 5 paquets de sucre ? Et que 5 trombones ?", en: "A paper clip weighs 1 g. A bag of sugar weighs 1 kg. A small car weighs about 1 t. What weighs as much as 5 bags of sugar? And as much as 5 paper clips?" },
    relances: [
      { fr: "Trouve un objet plus lourd que 5 kg, mais plus léger que 5 t.", en: "Find an object heavier than 5 kg but lighter than 5 t." },
      { fr: "Et si la balance affiche 5 000 ? Quelle unité, quel objet ?", en: "What if the scale shows 5,000? Which unit, which object?" },
      { fr: "Range tes objets du plus léger au plus lourd.", en: "Put your objects in order from lightest to heaviest." },
      { fr: "Un éléphant pèse environ 5 t. Combien de kilogrammes ?", en: "An elephant weighs about 5 t. How many kilograms is that?" }
    ],
    strategies: [
      { fr: "J’ai comparé avec le trombone, le paquet de sucre ou la petite voiture.", en: "I compared with the paper clip, the bag of sugar or the small car." },
      { fr: "J’ai imaginé l’objet dans mes mains : léger, lourd ou impossible à porter ?", en: "I imagined holding the object: light, heavy or impossible to carry?" },
      { fr: "J’ai pensé à la balance qui sert à le peser.", en: "I thought about which scale we would use to weigh it." },
      { fr: "J’ai essayé, puis j’ai corrigé.", en: "I tried, then I corrected it." }
    ],
    retenir: { fr: "Pour exprimer une masse, on choisit l’unité qui convient : le gramme (g) pour les objets légers, comme un trombone (1 g) ; le kilogramme (kg), comme un paquet de sucre (1 kg) ; la tonne (t) pour les objets très lourds, comme une petite voiture (environ 1 t). 1 kg = 1 000 g et 1 t = 1 000 kg.",
               en: "To give a mass, we choose the right unit: the gram (g) for light objects, like a paper clip (1 g); the kilogram (kg), like a bag of sugar (1 kg); the tonne (t) for very heavy objects, like a small car (about 1 t). 1 kg = 1,000 g and 1 t = 1,000 kg." },
    exemple: { fr: "1 kg = 1 000 g · 1 t = 1 000 kg", en: "1 kg = 1,000 g · 1 t = 1,000 kg" },
    toutes: null,
    vueToutes: function (trouves, lg) {
      var en = lg === "en";
      return "<h3>" + (en ? "The objects of the list" : "Les objets de la liste") + '</h3><div class="po-colonnes">' + UNITES_M.map(function (u) {
        return "<div><b>" + u[en ? "en" : "fr"] + "</b><ul>" + OBJETS_M.filter(function (o) { return o.u === u.k; }).map(function (o) { var k = o.id + ":" + o.u; return '<li class="' + (trouves[k] ? "trouve" : "") + '">' + o[en ? "en" : "fr"] + (trouves[k] ? " <b>✓</b>" : "") + "</li>"; }).join("") + "</ul></div>";
      }).join("") + "</div>" + '<p class="po-note">' + (en ? "The same number 5 means very different masses: we choose the unit by estimating, with a benchmark." : "Le même nombre 5 donne des masses très différentes : on choisit l’unité en estimant, avec un repère.") + "</p>";
    },
    feuille: { colonnes: [{ fr: "5 g", en: "5 g" }, { fr: "5 kg", en: "5 kg" }, { fr: "5 t", en: "5 t" }], lignes: 7,
      bas: { fr: "Range tes objets du plus léger au plus lourd.", en: "Put your objects in order from lightest to heaviest." } },
    fiche: {
      source: "Problème repris, avec son accord, de l’outil « Problèmes ouverts P5 » de la collègue (séquence 4, les masses). D’après Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « La masse », 8-10 ans, p. 78 : « Je vois un objet dont la masse est supérieure à 1 kg mais inférieure à 2 kg. Quel peut être cet objet ? »",
      moment: "Séance 1 des masses : instruments et unités (g, kg, t)",
      apprend: ["Avoir des repères de masse : 1 g (un trombone, leçon GM8), 1 kg (un paquet de sucre), 1 t (une petite voiture).", "Choisir l’unité qui convient pour exprimer une masse.", "Connaître les relations 1 kg = 1 000 g et 1 t = 1 000 kg.", "Relier un objet à l’instrument qui sert à le peser (balance de cuisine, pèse-personne, pèse-bagage…)."],
      pourquoi: ["Le même nombre 5 change complètement de sens avec l’unité : il faut estimer, pas calculer.", "Des réponses très variées : chacun propose des objets de sa vie (un sac de riz de 5 kg, un éléphant de 5 t).", "Les propositions montrent qui a de vrais repères : « un chien de 5 t » fait réagir toute la classe."],
      materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche par élève ou par groupe.", "La balance de Roberval et des masses marquées, un paquet de sucre de 1 kg, de petits objets à peser (trombones, gomme, cahier).", "Les iPad pour le mode autonome : l’élève range des objets dans « 5 g », « 5 kg », « 5 t » ou « aucune des trois » (le site vérifie), puis propose ses propres objets, à vérifier en classe."],
      temps: [
        ["Poser la question", "5 min", "Faites soupeser le paquet de sucre (1 kg) et un trombone (1 g) avant de commencer. Projette l’énoncé ; un élève le lit, 2 ou 3 autres l’expliquent avec leurs mots. Ne donne aucune méthode.", "« Pourquoi ne sait-on pas ce qui a été pesé ? Que veut dire 5 g ? Et 5 kg ? »"],
        ["Chercher par 2 ou 3", "15 à 20 min", "Lance le minuteur et observe. Un groupe ne trouve que des kilogrammes : relance vers le très léger et le très lourd. Un groupe bloque : le coup de pouce.", "« Et quelque chose de très léger ? De très, très lourd ? »"],
        ["Mettre en commun", "15 min", "Chaque groupe donne un objet et son unité : choisis-le dans la liste ou tape-le. Les objets de la liste se vérifient ; les objets tapés s’affichent « à discuter » : la classe donne son avis, et on pèse tout de suite les petits objets à la balance.", "« Ça peut vraiment peser 5 kg ? Plus lourd ou plus léger qu’un paquet de sucre ? » « Avec quelle balance le pèserait-on ? »"],
        ["Retenir", "5 à 10 min", "La trace écrite et les repères (1 g, 1 kg, 1 t), puis les objets de la classe, rangés par unité.", ""]
      ],
      reponses: "Des réponses possibles. 5 g : un morceau de sucre, une feuille de papier, un crayon, 5 trombones… 5 kg : un sac de riz de 5 kg, un chat, une pastèque, 5 paquets de sucre, 5 bouteilles d’eau d’un litre (un peu plus de 5 kg)… 5 t : un éléphant, un petit camion… Les masses sont approchées : on accepte ce qui est vraisemblable, et on vérifie à la balance quand c’est possible. Dans le mode autonome, les pièges (un trombone, une mangue, un paquet de sucre, un enfant de 8 ans, une petite voiture, une fourmi) vont dans « aucune des trois ».",
      erreurs: [
        ["Un chat de 5 g.", "Pas de repère pour le gramme.", "« Un trombone pèse 1 g. Un chat pèse-t-il comme 5 trombones ? »"],
        ["Une voiture de 5 kg.", "Pas de repère pour les grandes masses.", "« Peux-tu porter 5 paquets de sucre ? Et une voiture ? »"],
        ["Plus c’est gros, plus c’est lourd.", "La taille confondue avec la masse (un ballon de baudruche, une boule de pétanque).", "« Soupèse-les : lequel est le plus lourd ? »"],
        ["« 5 kg, c’est un peu plus que 5 g. »", "La relation 1 kg = 1 000 g n’est pas construite.", "« Combien de grammes dans un kilogramme ? »"]
      ],
      niveaux: ["Propose des objets au hasard, sans lien avec l’unité.", "Trouve des objets justes pour une seule unité (souvent le kilogramme).", "Trouve des objets pour les trois unités, avec quelques erreurs d’ordre de grandeur.", "Trouve des objets vraisemblables pour les trois unités et les justifie avec un repère (le paquet de sucre).", "Relie les unités entre elles (5 000 g = 5 kg) ou range ses objets du plus léger au plus lourd en justifiant."],
      reinvestir: ["« Je vois un objet qui pèse plus de 1 kg mais moins de 2 kg. Quel peut être cet objet ? » (Sullivan & Lilburn, p. 78)", "« Trouve deux objets de la même taille, mais de masses différentes. »"]
    }
  };

  /* ---------- 2. Le panier d’un kilo (1 kg = 1 000 g, additionner des masses) ---------- */
  var PRODUITS_M = [
    { id: "sucre", fr: "un paquet de sucre", pl: "paquets de sucre", en: "a bag of sugar", plEn: "bags of sugar", g: 1000, etiq: "1 kg" },
    { id: "riz", fr: "un paquet de riz", pl: "paquets de riz", en: "a bag of rice", plEn: "bags of rice", g: 500, etiq: "500 g" },
    { id: "papaye", fr: "une papaye", pl: "papayes", en: "a papaya", plEn: "papayas", g: 600, etiq: "600 g" },
    { id: "mangue", fr: "une mangue", pl: "mangues", en: "a mango", plEn: "mangoes", g: 400, etiq: "400 g" },
    { id: "beurre", fr: "une plaquette de beurre", pl: "plaquettes de beurre", en: "a block of butter", plEn: "blocks of butter", g: 250, etiq: "250 g" },
    { id: "avocat", fr: "un avocat", pl: "avocats", en: "an avocado", plEn: "avocados", g: 200, etiq: "200 g" },
    { id: "banane", fr: "une banane", pl: "bananes", en: "a banana", plEn: "bananas", g: 150, etiq: "150 g" },
    { id: "citron", fr: "un citron", pl: "citrons", en: "a lime", plEn: "limes", g: 100, etiq: "100 g" },
    { id: "oeuf", fr: "un œuf", pl: "œufs", en: "an egg", plEn: "eggs", g: 50, etiq: "50 g" }
  ];
  var prodM = function (id) { return PRODUITS_M.filter(function (p) { return p.id === id; })[0]; };
  var compteM = function (sol) { return PRODUITS_M.map(function (p) { return [p, sol.filter(function (i) { return i === p.id; }).length]; }).filter(function (x) { return x[1]; }); };
  var totalM = function (sol) { return somme(sol.map(function (i) { return prodM(i).g; })); };
  var detailM = function (sol, lg) { return compteM(sol).map(function (x) { return (x[1] > 1 ? x[1] + " × " : "") + milliers(x[0].g, lg) + " g"; }).join(" + "); };
  PO.PRODUITS_M = PRODUITS_M; PO.totalM = totalM; PO.milliers = milliers;

  PO.problemes.panier = {
    id: "panier", sequence: "masses", type: "panier", perso: "sari",
    titre: { fr: "Le panier d’un kilo", en: "The one-kilo basket" },
    question: { fr: "Que peut-il y avoir dans mon panier ?", en: "What could be in my basket?" },
    enonce: { fr: "Les produits de mon panier pèsent <b>exactement 1 kg</b> en tout. Je les ai choisis parmi ceux-ci, et j’ai pu prendre plusieurs fois le même. <b>Que peut-il y avoir dans mon panier ?</b> Trouve plusieurs paniers !",
              en: "The things in my basket weigh <b>exactly 1 kg</b> altogether. I chose them from these, and I could take the same thing more than once. <b>What could be in my basket?</b> Find several baskets!" },
    enonceExtra: function (lg) { return '<span class="po-prix">' + PRODUITS_M.map(function (p) { return p[lg === "en" ? "en" : "fr"] + " <b>" + p.etiq + "</b>"; }).join(" · ") + "</span>"; },
    verifier: function (sol) {
      var t = totalM(sol), fr = detailM(sol, "fr"), en = detailM(sol, "en");
      if (t === 1000) return { ok: true, fr: fr + " = 1 000 g = 1 kg.", en: en + " = 1,000 g = 1 kg." };
      if (t < 1000) return { ok: false, fr: fr + " = " + milliers(t, "fr") + " g. Il manque " + (1000 - t) + " g pour faire 1 kg.", en: en + " = " + milliers(t, "en") + " g. " + (1000 - t) + " g are missing to make 1 kg." };
      return { ok: false, fr: fr + " = " + milliers(t, "fr") + " g. C’est " + milliers(t - 1000, "fr") + " g de trop : 1 kg = 1 000 g.", en: en + " = " + milliers(t, "en") + " g. That is " + milliers(t - 1000, "en") + " g too much: 1 kg = 1,000 g." };
    },
    diagnostic: function (sol) { return { grammes: true, total: totalM(sol) === 1000 }; },
    cle: function (sol) { return sol.slice().sort().join("+"); },
    ecrire: function (sol, lg) { var en = lg === "en"; return compteM(sol).map(function (x) { return x[1] > 1 ? x[1] + " " + (en ? x[0].plEn : x[0].pl) : x[0][en ? "en" : "fr"]; }).join(" + "); },
    ranger: function (a, b) { return a.length - b.length || totalM(b) - totalM(a) || a.slice().sort().join().localeCompare(b.slice().sort().join()); },
    checklist: [
      { id: "grammes", fr: "J’ai écrit toutes les masses en grammes : 1 kg = 1 000 g.", en: "I wrote every mass in grams: 1 kg = 1,000 g." },
      { id: "total", fr: "J’ai calculé le total : ça fait 1 000 g.", en: "I worked out the total: it makes 1,000 g." }
    ],
    pouce: { fr: "1 kg, c’est 1 000 g. Dans mon panier, j’ai déjà un paquet de riz de 500 g. Combien de grammes manque-t-il ? Quels produits font ces grammes ?", en: "1 kg is 1,000 g. In my basket I already have a 500 g bag of rice. How many grams are missing? Which things make those grams?" },
    relances: [
      { fr: "Le panier avec le plus de produits ? Avec le moins de produits ?", en: "The basket with the most things? With the fewest?" },
      { fr: "Un panier avec 5 produits tous différents.", en: "A basket with 5 things that are all different." },
      { fr: "Un panier sans fruit.", en: "A basket with no fruit." },
      { fr: "Et pour un panier de 2 kg ?", en: "What about a 2 kg basket?" }
    ],
    strategies: [
      { fr: "J’ai écrit 1 kg = 1 000 g.", en: "I wrote 1 kg = 1,000 g." },
      { fr: "J’ai commencé par un produit, puis j’ai cherché ce qui manque.", en: "I started with one thing, then looked for what was missing." },
      { fr: "J’ai cherché des produits qui vont bien ensemble (500 + 500, 600 + 400).", en: "I looked for things that go well together (500 + 500, 600 + 400)." },
      { fr: "J’ai essayé, puis j’ai corrigé.", en: "I tried, then I corrected it." }
    ],
    retenir: { fr: "1 kg = 1 000 g. Pour savoir si un panier pèse 1 kg, on écrit toutes les masses en grammes et on les ajoute : 500 g + 250 g + 250 g = 1 000 g = 1 kg.",
               en: "1 kg = 1,000 g. To find out whether a basket weighs 1 kg, we write every mass in grams and add them: 500 g + 250 g + 250 g = 1,000 g = 1 kg." },
    exemple: { fr: "500 g + 250 g + 250 g = 1 000 g = 1 kg", en: "500 g + 250 g + 250 g = 1,000 g = 1 kg" },
    toutes: null, nbToutes: 297,
    feuille: { colonnes: [{ fr: "Les produits du panier", en: "The things in the basket", large: true }, { fr: "En grammes", en: "In grams", large: true }, { fr: "En tout", en: "Total" }], lignes: 7,
      bas: { fr: "Comment sais-tu que ton panier pèse bien 1 kg ?", en: "How do you know your basket really weighs 1 kg?" } },
    fiche: {
      source: "Problème repris, avec son accord, de l’outil « Problèmes ouverts P5 » de la collègue (séquence 4, les masses). D’après Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « La masse », 8-10 ans, p. 78 : « Je pose trois objets sur une balance. Leur masse combinée est de 3 kg. Quelle peut être la masse de chaque objet ? » ; voir aussi p. 79 (10-12 ans) : « J’ai acheté 500 g de fruits. Quels fruits puis-je avoir achetés et combien peut peser chacun ? »",
      moment: "Séances 2 et 3 des masses : 1 kg = 1 000 g, problèmes de masse",
      apprend: ["1 kg = 1 000 g : le paquet de sucre seul fait un panier juste !", "Ajouter des masses en grammes et comparer à 1 000 g.", "Chercher les compléments à 1 000 : 600 + 400, 500 + 250 + 250…", "Écrire une masse en grammes ou en kilogrammes."],
      pourquoi: ["Beaucoup de paniers possibles (297 !) : les uns s’arrêtent à 500 + 500, les autres en fabriquent de très longs.", "L’étiquette « 1 kg » du sucre, au milieu des grammes, montre qui sait que 1 kg = 1 000 g.", "Il faut calculer, vérifier et ajuster : « il manque 150 g » relance la recherche."],
      materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche par élève ou par groupe (les étiquettes y sont).", "Si possible, la balance de la classe et de vrais produits, ou des masses marquées.", "Les iPad pour le mode autonome : l’élève remplit le panier ; la balance ne montre pas le total, c’est à lui de le calculer avant de vérifier."],
      temps: [
        ["Poser la question", "5 min", "Projette l’énoncé. Faites lire les étiquettes et dire ce que veut dire « 1 kg en tout ». Ne donne aucune méthode.", "« Qu’est-ce qu’on cherche ? Peut-on prendre deux fois le même produit ? » (oui)"],
        ["Chercher par 2 ou 3", "15 à 20 min", "Lance le minuteur et observe. Un groupe additionne « 1 + 500 » : relance sur l’unité. Un groupe bloque : le coup de pouce. Un groupe a trouvé : les relances.", "« 1 kg, c’est combien de grammes ? »"],
        ["Mettre en commun", "15 min", "Touche les produits du panier d’un groupe, puis « Ajouter au tableau ». Laisse la classe donner son avis, puis vérifie. « Ranger » classe les paniers par nombre de produits.", "« Ça fait combien en tout ? Il manque combien pour 1 kg ? » « Écris-le en grammes, puis en kilogrammes. »"],
        ["Retenir", "5 à 10 min", "La trace écrite (1 kg = 1 000 g), puis les paniers de la classe, rangés. « Qui a le panier avec le plus de produits ? »", ""]
      ],
      reponses: "297 paniers en tout. Par exemple : le sucre seul ; 2 paquets de riz ; papaye + mangue ; riz + 2 plaquettes de beurre ; papaye + 2 avocats ; 2 mangues + avocat ; riz + mangue + citron ; mangue + beurre + avocat + citron + œuf ; riz + avocat + banane + citron + œuf. Le panier le plus court est le sucre seul, le plus long 20 œufs. Pour vérifier, on écrit tout en grammes : 600 g + 400 g = 1 000 g = 1 kg.",
      erreurs: [
        ["Sucre + riz = 501.", "1 kg lu comme 1 g.", "« Le paquet de sucre est-il plus léger que le riz ? 1 kg, c’est combien de grammes ? »"],
        ["Un panier de 1 100 g accepté.", "Le total n’est pas comparé à 1 000 g.", "« Refais le total. Il y a combien de trop ? »"],
        ["600 + 400 et 400 + 600 comptés comme deux paniers.", "L’ordre des produits ne compte pas.", "« C’est le même panier ? »"],
        ["250 + 250 = 450.", "Une erreur de calcul.", "« 250 + 250, c’est le double de 250. Combien ? »"]
      ],
      niveaux: ["Choisit des produits au hasard, sans calculer le total.", "Trouve le sucre seul ou 500 + 500, mais se trompe en mélangeant kg et g.", "Trouve plusieurs paniers justes, avec quelques erreurs de calcul.", "Trouve des paniers variés et les vérifie en grammes et en kilogrammes.", "Trouve des paniers avec des contraintes (5 produits différents, sans fruit) ou s’organise pour en trouver beaucoup."],
      reinvestir: ["« J’ai acheté 500 g de fruits. Quels fruits ai-je pu acheter ? »", "« Je pose trois objets sur la balance : ils pèsent 3 kg en tout. Combien peut peser chaque objet ? »"]
    }
  };

  /* ==========================================================================================
     Graphique en barres (Maths · résolution de problèmes, leçon OGD1) : 2 problèmes ouverts, D-116.
     Adaptés de Sullivan & Lilburn, « La statistique », chap. 8 (p. 150, 8-10 ans ; p. 146, 6-8 ans, rendu plus exigeant).
     L’élève monte les barres avec les réglettes ; le graphique (graduations de 2 en 2) se dessine sous ses yeux.
     ========================================================================================== */
  PO.sequences.diagrammes = ["melange", "chiens"];
  var grapheM = function (cats, titre, axe, axeX, max, vals, lg) {
    var DG = window.COCO_DONNEES, d = { ctx: { titre: titre, axe: axe, axeX: axeX, cats: cats }, pas: 2, max: max, vals: vals };
    return '<div class="po-dessin po-dessin--centre po-graphe"><figure class="dg-fig"><h3 class="dg-titre">' + (lg === "en" ? titre.en : titre.fr) + "</h3>" + DG.diagramme(d, { en: lg === "en", valeurs: true }) + "</figure></div>";
  };
  var FRUITS_G = [{ k: "m", fr: "mangue", en: "mango" }, { k: "p", fr: "papaye", en: "papaya" }, { k: "a", fr: "ananas", en: "pineapple" }, { k: "l", fr: "letchi", en: "lychee" }];
  var TOUTES_M = []; (function () { for (var a = 0; a <= 24; a++) for (var b = 0; b < a; b++) for (var c = 0; c < b; c++) { var d = 24 - a - b - c; if (d >= 0 && d < c) TOUTES_M.push({ m: a, p: b, a: c, l: d }); } })();

  /* ---------- 1. Le graphique mélangé ---------- */
  PO.problemes.melange = {
    id: "melange", sequence: "diagrammes", type: "reglages", perso: "nina",
    titre: { fr: "Le graphique mélangé", en: "The mixed-up bar chart" },
    question: { fr: "À quoi peut ressembler le graphique ?", en: "What could the bar chart look like?" },
    enonce: { fr: "J’ai demandé aux <b>24 élèves</b> de la classe leur fruit préféré. Le préféré est la <b>mangue</b>, puis la <b>papaye</b>, puis l’<b>ananas</b>. Le moins aimé est le <b>letchi</b>. Mais j’ai perdu mon graphique ! À quoi peut-il ressembler ? Trouve plusieurs graphiques possibles !",
              en: "I asked the <b>24 pupils</b> in my class for their favourite fruit. The favourite is the <b>mango</b>, then the <b>papaya</b>, then the <b>pineapple</b>. The least liked is the <b>lychee</b>. But I have lost my bar chart! What could it look like? Find several possible bar charts!" },
    champs: FRUITS_G.map(function (f) { return { k: f.k, fr: "Barre « " + f.fr + " »", en: "“" + f.en + "” bar", min: 0, max: 24, depart: 0 }; }),
    dessin: function (sol, lg) { return grapheM(FRUITS_G, { fr: "Les fruits préférés de la classe", en: "The class’s favourite fruit" }, { fr: "élèves", de: "d’élèves", en: "pupils" }, { fr: "Fruits", en: "Fruit" }, 24, FRUITS_G.map(function (f) { return sol[f.k]; }), lg); },
    verifier: function (sol) {
      var t = sol.m + sol.p + sol.a + sol.l;
      if (t !== 24) return { ok: false, fr: "Ton graphique compte " + t + " élèves : " + sol.m + " + " + sol.p + " + " + sol.a + " + " + sol.l + " = " + t + ". Il en faut 24.", en: "Your bar chart counts " + t + " pupils: " + sol.m + " + " + sol.p + " + " + sol.a + " + " + sol.l + " = " + t + ". There must be 24." };
      var o = [["m", "p"], ["p", "a"], ["a", "l"]].filter(function (x) { return !(sol[x[0]] > sol[x[1]]); })[0];
      if (o) { var n = function (k, lg) { return FRUITS_G.filter(function (f) { return f.k === k; })[0][lg]; };
        return { ok: false, fr: "La barre « " + n(o[0], "fr") + " » doit être plus haute que la barre « " + n(o[1], "fr") + " » : plus d’élèves la préfèrent.", en: "The “" + n(o[0], "en") + "” bar must be taller than the “" + n(o[1], "en") + "” bar: more pupils like it." }; }
      return { ok: true, fr: sol.m + " + " + sol.p + " + " + sol.a + " + " + sol.l + " = 24, et les barres descendent de la mangue au letchi.", en: sol.m + " + " + sol.p + " + " + sol.a + " + " + sol.l + " = 24, and the bars go down from the mango to the lychee." };
    },
    diagnostic: function (sol) { return { total: sol.m + sol.p + sol.a + sol.l === 24, ordre: sol.m > sol.p && sol.p > sol.a && sol.a > sol.l }; },
    cle: function (sol) { return [sol.m, sol.p, sol.a, sol.l].join("-"); },
    ecrire: function (sol, lg) { var en = lg === "en"; return (en ? "mango " : "mangue ") + sol.m + " · " + (en ? "papaya " : "papaye ") + sol.p + " · " + (en ? "pineapple " : "ananas ") + sol.a + " · " + (en ? "lychee " : "letchi ") + sol.l; },
    ranger: function (x, y) { return y.m - x.m || y.p - x.p || y.a - x.a; },
    checklist: [
      { id: "total", fr: "J’ai additionné les 4 barres : ça fait bien 24 élèves.", en: "I added the 4 bars: it makes 24 pupils." },
      { id: "ordre", fr: "Les barres descendent : mangue, puis papaye, puis ananas, puis letchi.", en: "The bars go down: mango, then papaya, then pineapple, then lychee." }
    ],
    pouce: { fr: "Commence par la mangue : donne-lui 10 élèves. Il reste 14 élèves pour les trois autres fruits. Partage-les en faisant des barres de plus en plus petites.", en: "Start with the mango: give it 10 pupils. There are 14 pupils left for the other three fruits. Share them out, with smaller and smaller bars." },
    relances: [
      { fr: "Quelle est la barre de la mangue la plus haute possible ? La plus basse possible ?", en: "What is the tallest possible mango bar? The shortest?" },
      { fr: "Et si personne n’aime le letchi ?", en: "What if nobody likes the lychee?" },
      { fr: "Trouve un graphique où deux barres voisines ont seulement 1 élève d’écart.", en: "Find a bar chart where two bars side by side are only 1 pupil apart." },
      { fr: "Invente ta propre histoire de graphique perdu pour un camarade.", en: "Make up your own lost bar chart story for a friend." }
    ],
    strategies: [
      { fr: "J’ai commencé par la barre de la mangue.", en: "I started with the mango bar." },
      { fr: "J’ai calculé ce qui reste pour les autres fruits.", en: "I worked out what is left for the other fruit." },
      { fr: "J’ai changé un seul nombre pour trouver un autre graphique.", en: "I changed just one number to find another bar chart." },
      { fr: "J’ai essayé, puis j’ai corrigé.", en: "I tried, then I corrected it." }
    ],
    retenir: { fr: "Dans un graphique en barres, la hauteur de chaque barre donne un nombre. Ici, toutes les barres ensemble font le nombre total d’élèves : 24. La barre la plus haute montre le fruit le plus aimé.", en: "In a bar chart, the height of each bar gives a number. Here, all the bars together make the total number of pupils: 24. The tallest bar shows the favourite fruit." },
    exemple: "9 + 7 + 5 + 3 = 24",
    toutes: null, nbToutes: 84,
    feuille: { colonnes: [{ fr: "Mangue", en: "Mango" }, { fr: "Papaye", en: "Papaya" }, { fr: "Ananas", en: "Pineapple" }, { fr: "Letchi", en: "Lychee" }, { fr: "En tout", en: "Total" }], lignes: 9,
      bas: { fr: "Choisis un de tes graphiques et dessine-le au dos de la feuille, avec un titre et des graduations de 2 en 2.", en: "Choose one of your bar charts and draw it on the back, with a title and a scale going up in twos." } },
    fiche: {
      source: "Adapté de Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « La statistique », 8-10 ans, p. 150 : « Un diagramme indique que, dans une classe, les chaussures que préfèrent les élèves sont les souliers de course. […] Celles que les élèves aiment le moins sont les tongs. À quoi peut ressembler le diagramme qui représente ces données ? » Ici, avec des fruits et un total imposé (24 élèves), pour que le site puisse vérifier.",
      moment: "Après « Je construis le graphique » (lire et construire un graphique gradué de 2 en 2)",
      apprend: ["Relier la hauteur d’une barre à un nombre, et l’ordre des barres à un classement.", "Comprendre que les barres d’un graphique forment ensemble un total (ici, les 24 élèves).", "Construire un graphique en barres gradué de 2 en 2, avec un titre et des axes nommés (leçon OGD1).", "Chercher plusieurs solutions et s’organiser."],
      pourquoi: ["Le graphique n’est plus seulement à lire : il faut le fabriquer à partir d’informations.", "84 graphiques possibles : chacun en trouve à son niveau, et les solutions se comparent.", "Deux contraintes à tenir ensemble (le total et l’ordre) : on voit tout de suite qui contrôle les deux."],
      materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche par élève ou par groupe.", "Du papier quadrillé pour dessiner les graphiques ; 24 jetons ou cubes pour ceux qui veulent manipuler.", "Les iPad pour le mode autonome : l’élève monte les barres, le graphique se dessine."],
      temps: [
        ["Poser la question", "5 min", "Projette l’énoncé. Faites dire ce qu’on sait (24 élèves, l’ordre des fruits) et ce qu’on cherche. Ne donne aucune méthode.", "« Que sait-on ? Que cherche-t-on ? Y a-t-il un seul graphique possible ? »"],
        ["Chercher par 2 ou 3", "15 à 20 min", "Lance le minuteur et observe. Un groupe oublie le total : « Combien d’élèves en tout ? ». Un groupe bloque : le coup de pouce. Un groupe a trouvé : les relances.", ""],
        ["Mettre en commun", "15 min", "Chaque groupe donne un graphique : monte les barres. Laisse la classe donner son avis, puis vérifie. « Ranger » classe les graphiques de la plus haute barre de mangue à la plus basse.", "« Comment savez-vous qu’il y a bien 24 élèves ? » « Pouvez-vous changer un seul nombre et garder 24 ? »"],
        ["Retenir", "5 à 10 min", "La trace écrite, puis les graphiques de la classe, rangés.", ""]
      ],
      reponses: "84 graphiques possibles (barres toutes différentes, de la plus haute à la plus basse, total 24). Par exemple : 9, 7, 5, 3 · 8, 7, 5, 4 · 10, 8, 4, 2 · 12, 6, 4, 2 · 21, 2, 1, 0. La barre de la mangue va de 8 (8, 7, 5, 4 ou 8, 7, 6, 3 : avec 7, on ne peut pas dépasser 7 + 6 + 5 + 4 = 22) à 21 (21, 2, 1, 0, si personne n’aime le letchi).",
      erreurs: [["Le total n’est pas 24.", "Une seule contrainte est contrôlée.", "« Ajoute tes 4 barres : combien d’élèves ? »"], ["Deux barres de la même hauteur.", "« Le préféré, puis… » n’est pas compris comme un ordre strict.", "« Si la mangue et la papaye ont 7, laquelle est préférée ? »"], ["Barres dans le désordre.", "L’ordre de l’énoncé n’est pas relié à la hauteur des barres.", "« Quel fruit doit avoir la barre la plus haute ? »"], ["Barre entre deux graduations mal lue.", "Graduations de 2 en 2.", "« Ta barre s’arrête au milieu entre 6 et 8 : combien ? »"]],
      niveaux: ["Monte des barres au hasard.", "Respecte l’ordre ou le total, mais pas les deux.", "Trouve un graphique juste, après plusieurs essais.", "Trouve plusieurs graphiques justes, en changeant une barre à la fois.", "Trouve la barre de mangue la plus haute et la plus basse possibles, et l’explique."],
      reinvestir: ["Faire le vrai sondage dans la classe, puis comparer avec les graphiques inventés.", "« Dans un sondage, exactement la moitié des élèves répond oui et l’autre moitié non. Sur quel sujet ce sondage peut-il porter ? » (Sullivan & Lilburn, p. 150)"]
    }
  };

  /* ---------- 2. Deux chiens de plus ---------- */
  var ANIMAUX_G = [{ k: "c", fr: "chats", en: "cats" }, { k: "h", fr: "chiens", en: "dogs" }, { k: "p", fr: "poissons", en: "fish" }];
  PO.problemes.chiens = {
    id: "chiens", sequence: "diagrammes", type: "reglages", perso: "waeko",
    titre: { fr: "Deux chiens de plus", en: "Two more dogs" },
    question: { fr: "À quoi peut ressembler le graphique des animaux ?", en: "What could the pets bar chart look like?" },
    enonce: { fr: "Dans le graphique des animaux de la classe, il y a des <b>chats</b>, des <b>chiens</b> et des <b>poissons</b>. Il y a <b>2 chiens de plus que de chats</b>, et <b>14 animaux en tout</b>. À quoi peut ressembler le graphique ? Trouve-les tous !",
              en: "In the bar chart of the class’s pets, there are <b>cats</b>, <b>dogs</b> and <b>fish</b>. There are <b>2 more dogs than cats</b>, and <b>14 pets altogether</b>. What could the bar chart look like? Find them all!" },
    champs: ANIMAUX_G.map(function (f) { return { k: f.k, fr: "Barre « " + f.fr + " »", en: "“" + f.en + "” bar", min: 0, max: 14, depart: 0 }; }),
    dessin: function (sol, lg) { return grapheM(ANIMAUX_G, { fr: "Les animaux de la classe", en: "The class’s pets" }, { fr: "animaux", de: "d’animaux", en: "pets" }, { fr: "Animaux", en: "Pets" }, 14, ANIMAUX_G.map(function (f) { return sol[f.k]; }), lg); },
    verifier: function (sol) {
      var t = sol.c + sol.h + sol.p;
      if (sol.h !== sol.c + 2) return { ok: false, fr: "Il y a " + sol.h + " chiens et " + sol.c + " chats : la différence est " + (sol.h - sol.c) + ". Il faut 2 chiens de plus que de chats.", en: "There are " + sol.h + " dogs and " + sol.c + " cats: the difference is " + (sol.h - sol.c) + ". There must be 2 more dogs than cats." };
      if (t !== 14) return { ok: false, fr: sol.c + " + " + sol.h + " + " + sol.p + " = " + t + " animaux. Il en faut 14 en tout.", en: sol.c + " + " + sol.h + " + " + sol.p + " = " + t + " pets. There must be 14 altogether." };
      return { ok: true, fr: sol.h + " − " + sol.c + " = 2 et " + sol.c + " + " + sol.h + " + " + sol.p + " = 14.", en: sol.h + " − " + sol.c + " = 2 and " + sol.c + " + " + sol.h + " + " + sol.p + " = 14." };
    },
    diagnostic: function (sol) { return { deux: sol.h === sol.c + 2, total: sol.c + sol.h + sol.p === 14 }; },
    cle: function (sol) { return [sol.c, sol.h, sol.p].join("-"); },
    ecrire: function (sol, lg) { var en = lg === "en", nb = function (n, un, pl) { return n + " " + ((en ? n === 1 : n <= 1) ? un : pl); };
      return en ? nb(sol.c, "cat", "cats") + " · " + nb(sol.h, "dog", "dogs") + " · " + sol.p + " fish" : nb(sol.c, "chat", "chats") + " · " + nb(sol.h, "chien", "chiens") + " · " + nb(sol.p, "poisson", "poissons"); },
    ranger: function (x, y) { return x.c - y.c; },
    checklist: [
      { id: "deux", fr: "La barre des chiens dépasse celle des chats de 2.", en: "The dogs bar is 2 taller than the cats bar." },
      { id: "total", fr: "J’ai additionné les 3 barres : ça fait bien 14 animaux.", en: "I added the 3 bars: it makes 14 pets." }
    ],
    pouce: { fr: "Commence avec 1 chat. Combien de chiens alors ? Combien d’animaux déjà ? Il en manque combien pour faire 14 ?", en: "Start with 1 cat. How many dogs, then? How many pets so far? How many are missing to make 14?" },
    relances: [
      { fr: "Les as-tu tous trouvés ? Comment en être sûr ?", en: "Have you found them all? How can you be sure?" },
      { fr: "Peut-il n’y avoir aucun chat ? Aucun poisson ?", en: "Could there be no cats at all? No fish?" },
      { fr: "Et s’il y avait 3 chiens de plus que de chats ?", en: "What if there were 3 more dogs than cats?" },
      { fr: "Et avec 15 animaux en tout ?", en: "What about 15 pets altogether?" }
    ],
    strategies: [
      { fr: "J’ai commencé par les chats, puis j’ai ajouté 2 pour les chiens.", en: "I started with the cats, then added 2 for the dogs." },
      { fr: "J’ai calculé ce qui reste pour les poissons.", en: "I worked out what is left for the fish." },
      { fr: "J’ai rangé mes graphiques : 0 chat, 1 chat, 2 chats…", en: "I sorted my bar charts: 0 cats, 1 cat, 2 cats…" },
      { fr: "J’ai essayé, puis j’ai corrigé.", en: "I tried, then I corrected it." }
    ],
    retenir: { fr: "Dans un graphique en barres, on compare deux barres en calculant l’écart : 2 chiens de plus que de chats, c’est une barre des chiens plus haute de 2. Pour trouver toutes les possibilités, je m’organise : 0 chat, 1 chat, 2 chats…", en: "In a bar chart, we compare two bars by working out the difference: 2 more dogs than cats means the dogs bar is 2 taller. To find every possibility, I get organised: 0 cats, 1 cat, 2 cats…" },
    exemple: "3 + 5 + 6 = 14",
    toutes: [0, 1, 2, 3, 4, 5, 6].map(function (c) { return { c: c, h: c + 2, p: 12 - 2 * c }; }),
    feuille: { colonnes: [{ fr: "Chats", en: "Cats" }, { fr: "Chiens", en: "Dogs" }, { fr: "Poissons", en: "Fish" }, { fr: "En tout", en: "Total" }], lignes: 8,
      bas: { fr: "Comment sais-tu que tu les as tous trouvés ?", en: "How do you know you have found them all?" } },
    fiche: {
      source: "Adapté de Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « La statistique », 6-8 ans, p. 146 : « Dans un diagramme qui porte sur les animaux de compagnie des élèves de la classe, je compte deux chiens de plus que de chats. À quoi peut ressembler ce diagramme ? » Rendu plus exigeant pour le CE2 : un troisième animal et un total imposé (14 animaux), ce qui donne exactement 7 graphiques.",
      moment: "Après « Problèmes avec un graphique » (total, écart)",
      apprend: ["Traduire « 2 de plus que » en écart entre deux barres.", "Tenir deux contraintes ensemble : l’écart et le total.", "Chercher toutes les possibilités en s’organisant, et savoir quand on les a toutes."],
      pourquoi: ["L’écart entre deux barres, souvent seulement lu, devient ici une contrainte à fabriquer.", "7 réponses exactement : le groupe qui les a toutes peut prouver qu’il n’y en a pas d’autre.", "La question « aucun chat ? » ouvre un vrai débat mathématique."],
      materiel: ["Le mode classe, projeté (les 4 temps).", "Une feuille de recherche par élève ou par groupe.", "14 jetons de trois couleurs pour ceux qui veulent manipuler.", "Les iPad pour le mode autonome."],
      temps: [
        ["Poser la question", "5 min", "Projette l’énoncé. Faites reformuler « 2 chiens de plus que de chats » avec un exemple. Ne donne aucune méthode.", "« S’il y a 4 chats, combien de chiens ? »"],
        ["Chercher par 2 ou 3", "15 à 20 min", "Lance le minuteur et observe : qui part des chats et s’organise ? Coup de pouce pour les groupes bloqués, relances pour ceux qui ont tout trouvé.", "« Vous en avez un ? Cherchez-en un autre. »"],
        ["Mettre en commun", "15 min", "Chaque groupe donne un graphique : monte les barres. La classe vérifie avant toi. Puis « Ranger » : de 0 chat à 6 chats.", "« Comment êtes-vous sûrs qu’il n’y en a pas d’autre ? » « Pourquoi le nombre de poissons baisse-t-il de 2 à chaque fois ? »"],
        ["Retenir", "5 à 10 min", "La trace écrite, puis les 7 graphiques : ceux de la classe en vert.", ""]
      ],
      reponses: "7 graphiques : 0 chat, 2 chiens, 12 poissons · 1, 3, 10 · 2, 4, 8 · 3, 5, 6 · 4, 6, 4 · 5, 7, 2 · 6 chats, 8 chiens, 0 poisson. À chaque chat de plus, il y a un chien de plus, donc 2 poissons de moins. Les cas « 0 chat » et « 0 poisson » se discutent en classe.",
      erreurs: [["2 chiens et 2 chats.", "« 2 de plus » lu comme « 2 ».", "« Combien de chiens de plus que de chats ? »"], ["Chats = chiens + 2.", "Le sens de l’écart est inversé.", "« Qui en a le plus, les chiens ou les chats ? »"], ["Le total n’est pas 14.", "Une seule contrainte est contrôlée.", "« Ajoute tes 3 barres. »"], ["S’arrête après une solution.", "Pas de recherche organisée.", "« Et avec un chat de plus ? »"]],
      niveaux: ["Monte des barres au hasard.", "Respecte l’écart ou le total, mais pas les deux.", "Trouve un ou deux graphiques justes.", "Trouve les 7 graphiques en s’organisant (0, 1, 2… chats).", "Prouve qu’il n’y en a pas d’autre, ou traite « 3 chiens de plus » ou « 15 animaux »."],
      reinvestir: ["« Dans le graphique des sports préférés, il y a 3 élèves de plus pour le foot que pour la natation. À quoi peut-il ressembler ? »", "Faire le vrai graphique des animaux de la classe et comparer."]
    }
  };
})();
