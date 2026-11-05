/* Classe Coco — problèmes ouverts (démarche de Sullivan & Lilburn, « Activités ouvertes en mathématiques », Chenelière 2010).
   Deux problèmes par séquence. Chaque problème existe en mode autonome (élève, iPad), en mode classe (TBI, 4 temps),
   en feuille de recherche à imprimer et en fiche enseignante. */
(function () {
  var PIECES = [1, 2, 5, 10, 20, 50, 100];
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
        toutes: null, nbToutes: 4562,
        fiche: {
          source: "Adapté de Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), chapitre « L'argent », niveau débutant, question 1 (« Dans ma poche, il y a 75 ¢. Quelles pièces puis-je avoir ? »).",
          apprend: ["Composer une somme avec les pièces du pays de plusieurs façons (repère niveau 3 : la monnaie en lien avec les décompositions additives).",
                    "Calculer des sommes de pièces et contrôler un total.", "S'organiser pour trouver beaucoup de solutions."],
          pourquoi: ["Plus qu'un rappel : il faut composer une somme, pas seulement la compter.", "On apprend en cherchant : décompositions de 100, échanges de pièces.", "Énormément de réponses possibles : chacun répond à son niveau."],
          materiel: ["Pièces factices de 1, 2, 5, 10, 20, 50 et 100 F", "Feuille de recherche (une par groupe)", "iPad pour le mode autonome"],
          temps: [
            ["Poser la question", "5 min", "Projette l'énoncé. Un élève le lit, 2 ou 3 autres le redisent avec leurs mots. Vérifie que tous ont compris que la pièce de 100 F seule ne compte pas. Ne donne aucune méthode.", "« Qui peut redire le problème avec ses mots ? »"],
            ["Chercher par 2 ou 3", "15 à 20 min", "Les groupes manipulent les pièces et notent leurs solutions. Observe et prends des notes pour l'évaluation. Un groupe bloque : coup de pouce. Un groupe a fini : une relance « Pour aller plus loin ».", "« Vous en avez une ? Trouvez-en une autre. »"],
            ["Mettre en commun", "15 min", "Chaque groupe donne une solution à tour de rôle. La classe donne son avis avant que tu vérifies. Puis « Ranger » : du moins de pièces au plus de pièces.", "« Comment le savez-vous ? Est-ce vraiment une nouvelle façon ? »"],
            ["Retenir", "5 à 10 min", "Faites ressortir la méthode : partir des grosses pièces et échanger une pièce contre d'autres de même valeur. Copie de la trace écrite.", ""]
          ],
          reponses: "Il y a 4 562 façons (sans compter la pièce de 100 F seule) : impossible de toutes les trouver, c'est voulu. Avec peu de pièces : 2 pièces : 50 + 50. 3 pièces : aucune. 4 pièces : 50 + 20 + 20 + 10. 5 pièces : 50 + 20 + 20 + 5 + 5 ; 50 + 20 + 10 + 10 + 10 ; 20 × 5. 6 pièces : 50 + 20 + 10 + 10 + 5 + 5 ; 50 + 10 × 5 ; 20 × 4 + 10 + 10.",
          erreurs: [
            ["Le total ne fait pas 100 F (erreur de calcul).", "« Recompte en commençant par les plus grosses pièces. »"],
            ["La pièce de 100 F seule.", "« Relis le problème : combien de pièces au moins ? »"],
            ["La même solution écrite dans un autre ordre (50 + 20 + 20 + 10 et 20 + 50 + 10 + 20).", "« Est-ce vraiment une nouvelle façon ? Range tes pièces de la plus grosse à la plus petite. »"],
            ["Une pièce qui n'existe pas (25 F, 200 F).", "« Cette pièce existe-t-elle ? Regarde les pièces de la boîte. »"]
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
          source: "Problème repris de l'outil « Problèmes ouverts P5 » de la collègue (crédit à confirmer avec elle). D'après Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « Les opérations », p. 69 : un nombre divisé par 5 a 3 comme reste ; quel peut être ce nombre ?",
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
          source: "Problème repris de l'outil « Problèmes ouverts P5 » de la collègue (crédit à confirmer avec elle). D'après Sullivan & Lilburn, « Activités ouvertes en mathématiques » (Chenelière, 2010), « Les opérations », p. 70 et 72 (□ × □ = 36 ; les élèves d'une école répartis dans des autobus).",
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
          reponses: "8 façons : 1 sachet de 24, 2 sachets de 12, 3 sachets de 8, 4 sachets de 6, 6 sachets de 4, 8 sachets de 3, 12 sachets de 2, 24 sachets de 1. 5, 7, 9, 10 et 11 sachets ne marchent pas (il reste des letchis). Les façons vont par deux : 3 sachets de 8 et 8 sachets de 3. 1 sachet de 24 et 24 sachets de 1 font souvent débat : ils respectent la consigne (décision D-53 : les 8 façons sont acceptées).",
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
