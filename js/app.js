/* Classe Coco — application (aperçu). Aucune donnée personnelle : seuls la langue et les activités faites sont gardées dans le navigateur. */
(function () {
  "use strict";
  var C = window.COCO_CONTENU;
  var app = document.getElementById("app");
  /* Fichier autonome à partager : window.COCO_PAGE_UNIQUE fixe la page, window.COCO_IMAGES fournit les images intégrées */
  var UNIQUE = window.COCO_PAGE_UNIQUE || "", IMAGES = window.COCO_IMAGES || {};
  var IMG = function (n) { return IMAGES[n] || "img/personnages/" + n + ".webp"; };
  /* postures des personnages (D-88, D-89) : presente, reflechit, victoire, idee, content */
  var POSTURES = ["coralie", "leo", "mei", "tao", "wadra", "dylan", "tehani", "vaka", "waeko", "kakou", "margouille", "nina", "adi", "sari"];
  var POSE = function (n, p) { return !IMAGES[n] && POSTURES.indexOf(n) >= 0 ? "img/postures/" + n + "-" + p + ".webp" : IMG(n); };
  /* fin de jeu : victoire si l'élève a très bien réussi (80 % et plus), content sinon */
  var POSE_BILAN = function (n, sc, total) { return POSE(n, !total || sc / total >= 0.8 ? "victoire" : "content"); };
  var PICTO = function (n) { return IMAGES["picto-" + n] || "img/pictos/" + n + ".svg"; };

  /* ---------- mémoire locale (facultative) ---------- */
  function lire(k, d) { try { var v = localStorage.getItem("coco-" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ecrire(k, v) { try { localStorage.setItem("coco-" + k, JSON.stringify(v)); } catch (e) {} }
  /* Espace enseignante protégé par un code (D-93). Seule l'empreinte SHA-256 du code est dans le site ;
     outils/changer_code.py la remplace. L'espace reste ouvert jusqu'à la fermeture du navigateur (sessionStorage). */
  var ENS_EMPREINTE = "77bce9d74fae4a5f0ff319a39730036aef534c10e956bd0041f8bc551e97082b";
  var ENS_ROUTES = /^(enseignante|ens-|fiche-|feuille-|classe-|tbi-|exos-)/;
  var ensOuvert = (function () { try { return sessionStorage.getItem("coco-ens") === "1"; } catch (e) { return false; } })();
  function ensNormaliser(s) { return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function sha256(ascii) {
    function rr(v, n) { return (v >>> n) | (v << (32 - n)); }
    var maxWord = Math.pow(2, 32), res = "", words = [], bits = ascii.length * 8, hash = [], k = [], nb = 0, comp = {}, i, j;
    for (var c = 2; nb < 64; c++) if (!comp[c]) { for (i = 0; i < 313; i += c) comp[i] = c; hash[nb] = (Math.pow(c, 0.5) * maxWord) | 0; k[nb++] = (Math.pow(c, 1 / 3) * maxWord) | 0; }
    ascii += "\x80"; while (ascii.length % 64 - 56) ascii += "\x00";
    for (i = 0; i < ascii.length; i++) { j = ascii.charCodeAt(i); if (j >> 8) return ""; words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = (bits / maxWord) | 0; words[words.length] = bits;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), old = hash; hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] +
          (w[i] = i < 16 ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash); hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; res += (b < 16 ? "0" : "") + b.toString(16); }
    return res;
  }
  function ensCodeJuste(code) { var n = ensNormaliser(code); return n.length > 0 && sha256("coco-ens|" + n) === ENS_EMPREINTE; }
  var langue = lire("langue", "fr");
  var faits = lire("faits", {});
  function marquerFait(id) { faits[id] = true; ecrire("faits", faits); }

  /* ---------- textes de l'interface ---------- */
  var T = {
    fr: { accueil: "Accueil", langue: "Langue", ecouter: "Écouter", retour: "Retour", bonjour: "Bonjour ! Choisis une matière pour commencer.",
      titre: "La classe de Maîtresse Coco", titreH: '<span class="t1">La classe de</span> <span class="t2">Maîtresse Coco</span>', bientot: "Bientôt", ancien: "Dans l'ancien site · à intégrer", demo: "Disponible",
      choisisSeq: "Choisis une séquence.", objectif: "Mon objectif :", decouvre: "Je découvre", entraine: "Je m'entraîne", reinvestis: "Je réinvestis",
      ouvert: "Le problème ouvert", rappelle: "Je me rappelle", lecon: "Revoir la leçon", valider: "Valider", suivant: "Suivant", reessayer: "Réessayer",
      indice: "Indice", bravo: "Bravo !", pasEncore: "Pas encore…", astuce: "Astuce de la leçon", fini: "Terminé !", rejouer: "Rejouer",
      versSequence: "Retour à la séquence", question: function (i, n) { return "Question " + i + " sur " + n; },
      fait: "fait ✓", noteFr: "", passe: "Passé", present: "Présent", futur: "Futur" },
    en: { accueil: "Home", langue: "Language", ecouter: "Listen", retour: "Back", bonjour: "Hello! Choose a subject to start.",
      titre: "Miss Coco’s classroom", titreH: '<span class="t2">Miss Coco’s</span> <span class="t1">classroom</span>', bientot: "Coming soon", ancien: "In the old site · to be added", demo: "Available",
      choisisSeq: "Choose a unit.", objectif: "My goal:", decouvre: "I discover", entraine: "I practise", reinvestis: "I use it",
      ouvert: "The open problem", rappelle: "I remember", lecon: "Look at the lesson again", valider: "Check", suivant: "Next", reessayer: "Try again",
      indice: "Hint", bravo: "Well done!", pasEncore: "Not yet…", astuce: "Tip from the lesson", fini: "Finished!", rejouer: "Play again",
      versSequence: "Back to the unit", question: function (i, n) { return "Question " + i + " of " + n; },
      fait: "done ✓", noteFr: "French activity: the sentences stay in French.", passe: "Past", present: "Present", futur: "Future" }
  };
  function t(k) { return T[langue][k]; }
  /* en français, espace insécable devant ! ? : ; et à l'intérieur des guillemets (charte, « Ton et consignes ») */
  function typo(s) { return langue === "en" || typeof s !== "string" ? s : s.replace(/ ([!?:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0"); }
  function tr(o) { return typo(typeof o === "string" ? o : (o[langue] || o.fr)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- voix ---------- */
  function dire(texte, lg) {
    try {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(texte), fr = (lg || langue) !== "en", V = window.COCO_VOIX;
      u.lang = fr ? "fr-FR" : "en-GB"; u.rate = fr && V ? V.vitesseVoix() : 0.85;
      if (fr && V) { var v = V.meilleureVoix(); if (v) u.voice = v; }
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ---------- briques ---------- */
  var MATIERE = {}; C.matieres.forEach(function (m) { MATIERE[m.id] = m; });
  function barre(actif) {
    if (UNIQUE) return '<header class="barre"><span></span>' + choixLangue() + "</header>";
    /* onglets « surligneur avec petits avatars » (D-79) : Coralie pour l'accueil, le personnage de chaque matière */
    var onglets = '<a class="coco-onglet" href="#accueil" aria-current="' + (actif === "accueil" ? "page" : "false") + '"><img class="onglet-av" src="' + IMG("coralie-avatar") + '" alt=""><span>' + t("accueil") + "</span></a>" +
      C.matieres.map(function (m) {
        var nom = esc(m.id === "qlm" ? "QLM" : tr(m.nom));
        var lien = '<a class="coco-onglet coco-onglet--' + m.id + '" href="#' + m.id + '" aria-current="' + (actif === m.id ? "page" : "false") + '"><img class="onglet-av" src="' + IMG(m.perso) + '" alt=""><span>' + nom + "</span></a>";
        if (!m.domaines.length) return lien;
        /* menu déroulant des sous-domaines (D-87) : au survol sur ordinateur, avec la flèche au doigt */
        return '<div class="onglet-groupe ' + m.classe + '">' + lien + '<button type="button" class="onglet-ouvrir" data-action="sous-menu" aria-expanded="false" aria-label="' + (langue === "en" ? "Sections: " : "Rubriques : ") + nom + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
          '<div class="sous-menu">' + m.domaines.map(function (d, k) { return '<a href="#' + m.id + '" data-action="aller" data-route="' + m.id + '" data-cible="dom-' + m.id + "-" + k + '"><i></i>' + esc(tr(d.nom)) + "</a>"; }).join("") + "</div></div>";
      }).join("");
    /* bandeau « Espace enseignante » (D-118) : une fine ligne au-dessus du menu, seulement quand l’espace a été ouvert avec le code dans ce navigateur */
    var bandeau = ensOuvert ? '<div class="ens-bandeau"><a href="#enseignante"' + (actif === "enseignante" ? ' aria-current="page"' : "") + ">" + DOSSIER_SVG.replace('class="ens-dossier-ic"', 'class="ens-bandeau-ic"') + (langue === "en" ? "Teacher area" : "Espace enseignante") + '</a><button type="button" class="ens-bandeau-verrou" data-action="ens-verrouiller">' + CADENAS + (langue === "en" ? "Lock" : "Verrouiller") + "</button></div>" : "";
    return bandeau + '<header class="barre"><nav class="coco-onglets" aria-label="Menu">' + onglets + "</nav>" + choixLangue() + "</header>";
  }
  function choixLangue() {
    return '<div class="coco-langue" role="group" aria-label="' + t("langue") + '">' +
      '<button type="button" data-langue="fr" data-action="langue" aria-pressed="' + (langue === "fr") + '"><span class="coco-drapeau coco-drapeau--fr"></span>FR</button>' +
      '<button type="button" data-langue="en" data-action="langue" aria-pressed="' + (langue === "en") + '"><span class="coco-drapeau coco-drapeau--en"></span>EN</button></div>';
  }
  function bulle(perso, texte, pose) {
    return '<div class="coco-bulle"><div class="coco-bulle-perso"><img src="' + POSE(perso, pose || "presente") + '" alt=""></div><div class="coco-bulle-texte"><p>' + texte + "</p></div></div>";
  }
  function retour(type, titre, texte, actions) {
    var perso = type === "bravo" ? POSE("kakou", "victoire") : POSE("margouille", "reflechit");
    var ic = type === "bravo" ? "✓" : "↻";
    if (type === "astuce") return '<div class="coco-retour coco-retour--astuce" role="note"><img class="coco-retour-perso" src="' + POSE("margouille", "idee") + '" alt=""><div><h4>' + titre + "</h4><p>" + texte + "</p></div></div>";
    return '<div class="coco-retour coco-retour--' + type + ' coco-anim-pop" role="status"><img class="coco-retour-perso" src="' + perso + '" alt=""><div><h4><span class="coco-pastille-icone">' + ic + "</span>" + titre + "</h4><p>" + texte + '</p></div><div class="coco-retour-actions">' + (actions || "") + "</div></div>";
  }
  function galets(n, i) {
    var s = ""; for (var k = 0; k < n; k++) s += '<li class="' + (k < i ? "is-fait" : k === i ? "is-encours" : "") + '"></li>';
    return '<ol class="coco-progression" aria-label="' + t("question")(i + 1, n) + '">' + s + "</ol>";
  }
  function hautJeu(m, chemin, titre, prog) {
    return '<header class="jeu-haut"><a class="coco-btn coco-btn--secondaire coco-btn--icone" href="#' + chemin + '" aria-label="' + t("retour") + '"><img src="' + PICTO("retour") + '" alt=""></a>' +
      '<div><small>' + esc(tr(m.nom)) + " · " + esc(titre.sous) + '</small><h1 class="coco-titre">' + esc(titre.titre) + "</h1></div>" +
      '<div class="jeu-prog">' + (prog || "") + "</div></header>";
  }
  function negation(mots, i) {
    var w = mots.slice(); var cible = w[i].replace(/[.,!?]$/, ""); var ponct = w[i].slice(cible.length);
    var ne = /^[aeiouyéèêàâîôûh]/i.test(cible) ? "n'" : "ne ";
    w[i] = '<span class="coco-negation">' + ne.trim() + "</span>" + (ne === "n'" ? "" : " ") + "<b>" + cible + '</b> <span class="coco-negation">pas</span>' + ponct;
    var s = w.join(" ");
    return s.charAt(0) === "<" ? s : s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ---------- pages ---------- */
  function pageAccueil() {
    var portes = C.matieres.map(function (m) {
      return '<a class="porte ' + m.classe + '" href="#' + m.id + '"><img src="' + IMG(m.perso) + '" alt=""><span><b>' + esc(tr(m.nom)) + "</b><i>" + esc(tr(m.sous)) + "</i></span></a>";
    }).join("");
    return barre("accueil") +
      '<section class="hero"><img src="' + IMG("coralie") + '" alt="Maîtresse Coco"><div><h1>' + t("titreH") + "</h1></div></section>" +
      '<section class="portes">' + portes + "</section>" + '<p class="pied"><a href="#enseignante">Espace enseignante</a></p>';
  }
  function bulleSimple(texte) { return '<div class="coco-bulle-texte"><p>' + texte + "</p></div>"; }
  function pageMatiere(id) {
    var m = MATIERE[id];
    var corps = m.domaines.length ? m.domaines.map(function (d, kd) {
      return '<section class="domaine domaine-matiere ' + m.classe + '" id="dom-' + id + "-" + kd + '"><h2>' + esc(tr(d.nom)) + '</h2><div class="sequences">' + (d.sequences.length ? "" : '<div class="seq est-bientot"><small>' + t("bientot") + "</small><b>" + (langue === "en" ? "The units for this period are on their way." : "Les séquences de cette période arrivent bientôt.") + "</b></div>") + d.sequences.map(function (s, i) {
        var nom = tr(s[0]), statut = s[1] || "bientot";
        if (statut === "demo") return '<a class="seq" href="' + (s[2].charAt(0) === "#" ? s[2] : "#seq-" + s[2]) + '" style="--c:var(--' + id + ');--cf:var(--' + id + '-fonce)"><small>' + (i + 1) + " · " + t("demo") + "</small><b>" + esc(nom) + "</b></a>";
        return '<div class="seq est-bientot"><small>' + (i + 1) + " · " + (statut === "ancien" ? t("ancien") : t("bientot")) + "</small><b>" + esc(nom) + "</b></div>";
      }).join("") + "</div></section>";
    }).join("") : bulle(m.perso, t("bientot") + ".");
    return barre(id) + '<section class="entete ' + m.classe + '"><img src="' + IMG(m.perso) + '" alt=""><div><h1>' + esc(tr(m.nom)) + "</h1><p>" + (m.domaines.length ? t("choisisSeq") : "") + "</p></div></section>" + corps;
  }
  function carte(m, etape, titre, texte, perso, lien, bientot) {
    var fait = lien && faits[lien] ? " is-fait" : "";
    var tag = bientot ? "div" : "a";
    return "<" + tag + ' class="coco-carte coco-carte--' + m + fait + (bientot ? " est-bientot" : "") + '"' + (bientot ? "" : ' href="#' + lien + '"') + '><span class="coco-carte-vignette"><img src="' + IMG(perso) + '" alt=""></span><span><span class="coco-carte-etape">' + etape + "</span><h3>" + titre + "</h3><p>" + texte + "</p></span></" + tag + ">";
  }
  function pageSequence(id) {
    var s = C[id], m = MATIERE[s.matiere], cartes;
    if (id === "verbe") {
      cartes = carte("francais", "1 · " + t("decouvre"), langue === "en" ? "The hidden verb" : "Le verbe se cache", langue === "en" ? "I remember, then I find the word that changes." : "Je me rappelle, puis je cherche le mot qui change.", "tehani", "jeu-verbe-decouvre") +
        carte("francais", "2 · " + t("entraine"), langue === "en" ? "Verb hunt" : "Chasse aux verbes", langue === "en" ? "I tap the verb in each sentence." : "Je touche le verbe de chaque phrase.", "vaka", "jeu-verbe-chasse") +
        cartesQZ("verbe");
    } else {
      cartes = (QUIZ[id] ? cartesQZ(id) : "") +
        (PO.sequences[id] || []).map(function (pid, k) { var p = po(pid); return carte("maths", "4 · " + t("ouvert") + " " + (k + 1), tr(p.titre), tr(p.question), p.perso, "po-" + pid); }).join("");
    }
    var lecon = '<div class="coco-row">' + (ROUTES["lecon-" + id] ? '<a class="coco-btn coco-btn--secondaire" href="#lecon-' + id + '"><img src="' + PICTO("ampoule") + '" alt="">' + t("lecon") + "</a>" : "") + boutonExos(id) + "</div>";
    return barre(s.matiere) + '<section class="entete ' + m.classe + '"><img src="' + IMG(m.perso) + '" alt=""><div><h1>' + esc(tr(s.titre)) + "</h1><p>" + esc(tr(m.nom)) + "</p></div></section>" +
      '<p class="objectif ' + m.classe + '">' + t("objectif") + " <b>" + esc(tr(s.objectif)) + "</b></p>" + lecon + '<section class="etapes">' + cartes + "</section>";
  }
  var L = { carte: {}, moment: "present", machine: 0, phrase: 0 };
  function pageLecon() {
    var m = MATIERE.francais, en = langue === "en";
    var note = en ? '<p class="apercu">' + t("noteFr") + "</p>" : "";
    // 1. état ou action
    var cartes = [
      { k: "etat", img: "margouille", etiq: en ? "a state" : "un état", avant: "Margouille ", verbe: "est", apres: " orange." },
      { k: "action", img: "kakou", etiq: en ? "an action" : "une action", avant: "Kakou ", verbe: "court", apres: " dans la forêt." }
    ].map(function (c) {
      var vu = L.carte[c.k];
      return '<button class="retourne" type="button" data-action="l-carte" data-val="' + c.k + '"><img src="' + IMG(c.img) + '" alt=""><span><span class="etiq">' + (vu ? c.etiq : (en ? "Tap to see" : "Touche pour voir")) + '</span><span class="ph">' + c.avant + (vu ? '<span class="v-marque apparait">' + c.verbe + "</span>" : c.verbe) + c.apres + "</span>" +
        (vu ? '<span class="aide">' + (c.k === "etat" ? (en ? "Like être, sembler, paraître." : "Comme être, sembler, paraître.") : (en ? "Kakou is doing something." : "Kakou fait quelque chose.")) + "</span>" : "") + "</span></button>";
    }).join("");
    // 2. le verbe change selon le temps
    var T2 = { passe: ["était", "a appelé"], present: ["est", "appelle"], futur: ["sera", "appellera"] };
    var v = T2[L.moment];
    var frise = [["passe", "Hier", "Passé"], ["present", "Aujourd'hui", "Présent"], ["futur", "Demain", "Futur"]].map(function (k) {
      return '<button class="coco-btn ' + (L.moment === k[0] ? "" : "coco-btn--secondaire") + '" type="button" data-action="l-moment" data-val="' + k[0] + '"><span>' + k[1] + "<small>" + (en ? { passe: "Past", present: "Present", futur: "Future" }[k[0]] : k[2]) + "</small></span></button>";
    }).join("");
    // 3. la machine ne … pas
    var phrases = [["La", "pluie", "tombe", "sur", "la", "forêt."], ["Kakou", "court", "dans", "la", "forêt."]], iv = [2, 1];
    var ph = phrases[L.phrase], vi = iv[L.phrase], rendu;
    if (L.machine) {
      rendu = ph.map(function (w, i) { return i === vi ? '<span class="coco-negation apparait">ne</span> <span class="v-marque">' + w + '</span> <span class="coco-negation apparait">pas</span>' : esc(w); }).join(" ");
    } else rendu = ph.map(esc).join(" ");
    return barre("francais") + hautJeu(m, "seq-verbe", { sous: "Le verbe", titre: t("lecon") }) + note +
      bulle("coralie", en ? "Let's look at the lesson together. Tap, try and watch!" : "On revoit la leçon ensemble. Touche, essaie et observe !") +
      '<section class="lecon-bloc m-francais"><h3><span class="lecon-num">1</span>' + (en ? "What is a verb?" : "Le verbe, c'est quoi ?") + "</h3><p>" +
      "Le verbe est un mot qui exprime un <b>état</b> (être, sembler, paraître) ou une <b>action</b>." + '</p><div class="duo">' + cartes + "</div></section>" +
      '<section class="lecon-bloc m-francais"><h3><span class="lecon-num">2</span>' + (en ? "It changes with the time of the sentence" : "Il change selon le temps de la phrase") + '</h3><div class="frise">' + frise + "</div>" +
      '<div class="phrases-temps"><span>Sarah <span class="v apparait" data-k="' + L.moment + '">' + v[0] + '</span> malade.</span><span>Sa mère <span class="v apparait" data-k="' + L.moment + '2">' + v[1] + "</span> le médecin.</span></div></section>" +
      '<section class="lecon-bloc m-francais"><h3><span class="lecon-num">3</span>' + (en ? "To find it: the ne … pas machine" : "Pour le trouver : la machine ne … pas") + '</h3><div class="machine"><p class="ph">' + rendu + "</p>" +
      '<div class="coco-row"><button class="coco-btn" type="button" data-action="l-machine">' + (L.machine ? (en ? "Take ne … pas away" : "J'enlève ne … pas") : (en ? "Put ne … pas" : "Je mets ne … pas")) + "</button>" +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="l-phrase">' + (en ? "Another sentence" : "Une autre phrase") + "</button></div>" +
      (L.machine ? retour("astuce", t("astuce"), "Le verbe est entre <span class=\"coco-negation\">ne</span> et <span class=\"coco-negation\">pas</span> !") : "") + "</div></section>" +
      jrSection(jrCartesVerbe, "francais") +
      '<div class="coco-row"><a class="coco-btn" href="#jeu-verbe-decouvre">' + t("decouvre") + '</a><a class="coco-btn coco-btn--secondaire" href="#seq-verbe">' + t("versSequence") + "</a></div>";
  }
  function actionLecon(a, el) {
    if (a === "l-carte") L.carte[el.dataset.val] = !L.carte[el.dataset.val];
    else if (a === "l-moment") L.moment = el.dataset.val;
    else if (a === "l-machine") L.machine = L.machine ? 0 : 1;
    else if (a === "l-phrase") { L.phrase = (L.phrase + 1) % 2; L.machine = 0; }
  }

  /* ---------- jeu 1 : Je découvre (le verbe) ---------- */
  var D = null;
  function jeuDecouvre() {
    if (!D) D = { etape: "rappel", i: 0, moment: "present", essai: 0, msg: "" };
    var s = C.verbe, m = MATIERE.francais, zone = "", consigne = "", note = langue === "en" ? '<p class="apercu">' + t("noteFr") + "</p>" : "";
    var tot = s.rappel.length + 2, pos = D.etape === "rappel" ? D.i : D.etape === "change" ? s.rappel.length : D.etape === "test" ? s.rappel.length + 1 : tot;
    if (D.etape === "rappel") {
      var q = s.rappel[D.i];
      consigne = langue === "en" ? "<b>" + t("rappelle") + "</b> · When does it happen?" : "<b>" + t("rappelle") + "</b> · Quand se passe l'action ?";
      zone = '<p class="phrase-grande">' + esc(q.phrase) + '</p><div class="choix">' + ["passe", "present", "futur"].map(function (k) { return '<button class="coco-btn coco-btn--secondaire" type="button" data-action="rappel" data-val="' + k + '">' + t(k) + "</button>"; }).join("") + "</div>";
    } else if (D.etape === "change") {
      consigne = langue === "en" ? "Change the time, then tap the word that <b>changes</b>." : "Change le moment, puis touche le mot qui <b>change</b>.";
      var mots = s.moments[D.moment].split(" ");
      zone = '<div class="choix">' + [["passe", "Hier"], ["present", "Aujourd'hui"], ["futur", "Demain"]].map(function (k) { return '<button class="coco-btn ' + (D.moment === k[0] ? "" : "coco-btn--secondaire") + '" type="button" data-action="moment" data-val="' + k[0] + '">' + k[1] + "</button>"; }).join("") + "</div>" +
        '<div class="coco-row">' + mots.map(function (w, i) { return '<button class="coco-etiquette" type="button" data-action="change" data-i="' + i + '">' + esc(w) + "</button>"; }).join("") + "</div>";
    } else if (D.etape === "test") {
      consigne = langue === "en" ? "Tap a word: we put <b>ne … pas</b> around it." : "Touche un mot : on le met entre <b>ne … pas</b>.";
      zone = '<div class="coco-row">' + s.testPhrase.map(function (w, i) { return '<button class="coco-etiquette" type="button" data-action="test" data-i="' + i + '">' + esc(w) + "</button>"; }).join("") + "</div>" + (D.essaiPhrase ? '<p class="phrase">' + D.essaiPhrase + "</p>" : "");
    } else {
      marquerFait("jeu-verbe-decouvre");
      return barre("francais") + hautJeu(m, "seq-verbe", { sous: "Le verbe · 1 · " + t("decouvre"), titre: langue === "en" ? "The hidden verb" : "Le verbe se cache" }, galets(tot, tot)) +
        '<section class="bilan"><img src="' + POSE("tehani", "victoire") + '" alt=""><h2>' + t("fini") + "</h2><p>" + (langue === "en" ? "The verb changes with the time of the sentence, and it sits between <b>ne</b> and <b>pas</b>." : "Le verbe change selon le moment de la phrase, et il se met entre <b>ne</b> et <b>pas</b>.") + '</p><div class="coco-row"><a class="coco-btn" href="#jeu-verbe-chasse">' + t("entraine") + '</a><a class="coco-btn coco-btn--secondaire" href="#seq-verbe">' + t("versSequence") + "</a></div></section>";
    }
    return barre("francais") + hautJeu(m, "seq-verbe", { sous: "Le verbe · 1 · " + t("decouvre"), titre: langue === "en" ? "The hidden verb" : "Le verbe se cache" }, galets(tot, pos)) + note +
      bulle("tehani", consigne) + '<section class="zone m-francais">' + zone + '</section><div class="retour-zone">' + D.msg + "</div>";
  }
  function actionDecouvre(a, el) {
    var s = C.verbe, suite = '<button class="coco-btn" type="button" data-action="d-suite">' + t("suivant") + "</button>";
    if (a === "rappel") {
      var q = s.rappel[D.i], ok = el.dataset.val === q.reponse, indice = q.phrase.split(",")[0];
      D.msg = ok ? retour("bravo", t("bravo"), (langue === "en" ? "« " + indice + " » tells us: " : "« " + indice + " » nous le dit : c'est le ") + t(q.reponse).toLowerCase() + ".", suite)
        : retour("revoir", t("pasEncore"), (langue === "en" ? "Look at the first word, « " + indice + " ». It tells us when. It is the " : "Regarde le premier mot, « " + indice + " ». Il dit quand. C'est le ") + t(q.reponse).toLowerCase() + ".", suite);
      D.suite = function () { D.i++; if (D.i >= s.rappel.length) D.etape = "change"; };
    } else if (a === "moment") { D.moment = el.dataset.val; D.msg = ""; }
    else if (a === "change") {
      if (+el.dataset.i === s.motQuiChange) { D.msg = retour("bravo", t("bravo"), langue === "en" ? "The word that changes is the <b>verb</b>. It changes with the time of the sentence." : "Le mot qui change, c'est le <b>verbe</b>. Il change selon le temps de la phrase.", suite); D.suite = function () { D.etape = "test"; D.essaiPhrase = ""; }; }
      else D.msg = retour("revoir", t("pasEncore"), langue === "en" ? "This word does not change. Tap « Hier » then « Demain » and watch closely." : "Ce mot ne change pas. Touche « Hier » puis « Demain » et regarde bien.");
    } else if (a === "test") {
      var i = +el.dataset.i; D.essaiPhrase = negation(s.testPhrase, i);
      if (i === s.testVerbe) { D.msg = retour("bravo", t("bravo"), langue === "en" ? "The sentence still makes sense: <b>tombe</b> is the verb!" : "La phrase a du sens : <b>tombe</b> est le verbe !", suite); D.suite = function () { D.etape = "fin"; }; }
      else D.msg = retour("revoir", t("pasEncore"), langue === "en" ? "That doesn't make sense: it is not the verb. Try another word." : "Ça ne veut rien dire : ce n'est pas le verbe. Essaie un autre mot.");
    } else if (a === "d-suite") { D.msg = ""; if (D.suite) D.suite(); D.suite = null; }
  }

  /* ---------- jeu 2 : Chasse aux verbes ---------- */
  var H = null;
  function jeuChasse() {
    var s = C.verbe.chasse, m = MATIERE.francais, n = s.length;
    if (!H) H = { i: 0, choix: -1, essai: 0, msg: "", resolu: false, indice: false };
    var titre = { sous: "Le verbe · 2 · " + t("entraine"), titre: langue === "en" ? "Verb hunt" : "Chasse aux verbes" };
    if (H.i >= n) {
      marquerFait("jeu-verbe-chasse");
      return barre("francais") + hautJeu(m, "seq-verbe", titre, galets(n, n)) + '<section class="bilan"><img src="' + POSE("vaka", "victoire") + '" alt=""><h2>' + t("fini") + "</h2><p>" +
        (langue === "en" ? "You found the verb in all " + n + " sentences." : "Tu as trouvé le verbe dans les " + n + " phrases.") + '</p><div class="coco-row"><button class="coco-btn" type="button" data-action="c-rejouer">' + t("rejouer") + '</button><a class="coco-btn coco-btn--secondaire" href="#seq-verbe">' + t("versSequence") + "</a></div></section>";
    }
    var q = s[H.i];
    var mots = q.mots.map(function (w, k) {
      var cls = "coco-etiquette" + (H.resolu && k === q.v ? " est-juste" : k === H.choix ? " is-choisi" : "");
      var pastille = H.resolu && k === q.v ? '<span class="coco-nature">V</span>' : "";
      return '<button class="' + cls + '" type="button" data-action="c-mot" data-i="' + k + '"' + (H.resolu && k === q.v ? ' data-nature="verbe"' : "") + ">" + pastille + esc(w) + "</button>";
    }).join("");
    var preuve = H.resolu ? '<p class="phrase">' + negation(q.mots, q.v) + "</p>" : "";
    var note = langue === "en" ? '<p class="apercu">' + t("noteFr") + "</p>" : "";
    return barre("francais") + hautJeu(m, "seq-verbe", titre, galets(n, H.i)) + note +
      bulle("vaka", langue === "en" ? "Tap the <b>verb</b> in the sentence." : "Touche le <b>verbe</b> de la phrase.") +
      '<section class="zone m-francais"><div class="coco-row">' + mots + "</div>" + preuve + "</section>" +
      '<div class="retour-zone">' + (H.indice && !H.resolu ? retour("astuce", t("astuce"), "Le verbe est entre <span class=\"coco-negation\">ne</span> et <span class=\"coco-negation\">pas</span> !") : "") + H.msg + "</div>" +
      '<footer class="jeu-bas"><button class="coco-btn coco-btn--soutien" type="button" data-action="c-indice"><img src="' + PICTO("ampoule") + '" alt="">' + t("indice") + "</button>" +
      (H.resolu ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="c-valider"' + (H.choix < 0 ? " disabled" : "") + ">" + t("valider") + "</button>") + "</footer>";
  }
  function actionChasse(a, el) {
    var q = C.verbe.chasse[H.i], suite = '<button class="coco-btn coco-btn--grand" type="button" data-action="c-suite">' + t("suivant") + "</button>";
    if (a === "c-mot" && !H.resolu) { H.choix = +el.dataset.i; H.msg = ""; }
    else if (a === "c-indice") H.indice = true;
    else if (a === "c-valider" && H.choix >= 0) {
      var verbe = q.mots[q.v].replace(/[.,!?]$/, "");
      if (H.choix === q.v) { H.resolu = true; H.msg = retour("bravo", t("bravo"), "<b>" + verbe + "</b> " + (langue === "en" ? "is the verb: we can say « " + q.neg + " »." : "est bien le verbe : on peut dire « " + q.neg + " »."), suite); }
      else {
        H.essai++;
        if (H.essai === 1) H.msg = retour("revoir", t("pasEncore"), (langue === "en" ? "Put <b>ne … pas</b> around your word: " : "Mets <b>ne … pas</b> autour de ton mot : ") + negation(q.mots, H.choix) + (langue === "en" ? " Does it make sense?" : " Est-ce que ça a du sens ?"));
        else if (H.essai === 2) { H.indice = true; H.msg = retour("revoir", t("pasEncore"), langue === "en" ? "Try each word with <b>ne … pas</b>. Only one keeps the sentence right." : "Essaie chaque mot avec <b>ne … pas</b>. Un seul garde une phrase correcte."); }
        else { H.resolu = true; H.msg = retour("revoir", langue === "en" ? "Let's look together" : "Regardons ensemble", "<b>" + verbe + "</b> " + (langue === "en" ? "is the verb: « " + q.neg + " »." : "est le verbe : « " + q.neg + " »."), suite); }
        H.choix = -1;
      }
    } else if (a === "c-suite") { H = { i: H.i + 1, choix: -1, essai: 0, msg: "", resolu: false, indice: false }; }
    else if (a === "c-rejouer") H = null;
  }

  /* ---------- Orthographe : les mots invariables (module « Mes mots invariables » du v0, repris : D-58 à D-60) ----------
     Partie commune en orange, lettre muette en jaune (affiches 2026). Voix seulement dans « Écoute et écris » et la dictée (D-31). */
  var MO = window.COCO_MOTS;
  var MI = { sel: lire("mots-sel", null), nb: lire("mots-nb", 10) };
  if (!MI.sel || typeof MI.sel !== "object") { MI.sel = {}; MO.FAMS.forEach(function (f) { MI.sel[f.id] = true; }); }
  Object.keys(MI.sel).forEach(function (k) { if (!MO.FAM[k]) delete MI.sel[k]; });
  if ([0, 10, 20].indexOf(MI.nb) < 0) MI.nb = 10;
  function miSauver() { ecrire("mots-sel", MI.sel); ecrire("mots-nb", MI.nb); }
  var JEUX_MOTS = {
    rappel: { perso: "sari", etape: 1, fr: "Je me rappelle", en: "I remember", dfr: "Je retrouve les mots-outils du CP-CE1.", den: "I find the key words from CP-CE1." },
    look: { perso: "nina", etape: 1, fr: "Regarde, cache, écris", en: "Look, cover, write", dfr: "J'observe le mot, je le cache, puis je l'écris de mémoire.", den: "I look at the word, cover it, then write it from memory." },
    hidden: { perso: "vaka", etape: 1, fr: "Lettres cachées", en: "Hidden letters", dfr: "Je tape les lettres qui manquent.", den: "I type the missing letters." },
    choose: { perso: "waeko", etape: 2, fr: "Le mot manquant", en: "The missing word", dfr: "Je complète la phrase avec le bon mot.", den: "I complete the sentence with the right word." },
    sort: { perso: "dylan", etape: 2, fr: "Le tri des familles", en: "Sorting into families", dfr: "Je range chaque mot dans sa famille.", den: "I put each word into its family." },
    listen: { perso: "tehani", etape: 2, fr: "Écoute et écris", en: "Listen and write", dfr: "J'écoute le mot et je l'écris sans le voir.", den: "I listen to the word and write it without seeing it." },
    dict: { perso: "adi", etape: 3, fr: "La dictée sans erreur", en: "The no-mistake dictation", dfr: "Je prépare les mots, puis j'écris les phrases dictées.", den: "I get the words ready, then write the dictated sentences." }
  };
  var ETAPES_MOTS = { 1: "decouvre", 2: "entraine", 3: "reinvestis" };
  function motHTML(m, petit) { return '<span class="mi-mot' + (petit ? " mi-mot--petit" : "") + '">' + MO.html(m) + "</span>"; }
  function miPool(jeu) {
    if (jeu === "rappel") { var g0 = {}; MO.FAMS.forEach(function (f) { if (f.group.id === "g0") g0[f.id] = true; }); return MO.shuffle(MO.gapPool(g0)).slice(0, 3); }
    var qs = jeu === "sort" ? MO.pool(MI.sel, true) : jeu === "choose" || jeu === "dict" ? MO.gapPool(MI.sel) : MO.pool(MI.sel);
    qs = MO.shuffle(qs);
    if (jeu === "dict") return qs.slice(0, 5);
    return MI.nb ? qs.slice(0, MI.nb) : qs;
  }
  function miVide(jeu) {
    var en = langue === "en";
    if (!MO.pool(MI.sel).length) return en ? "Choose at least one list or family of words on the unit page." : "Choisis au moins une liste ou une famille de mots sur la page de la séquence.";
    if (jeu === "sort" && !MO.pool(MI.sel, true).length) return en ? "Sorting uses the word families (not the CP-CE1 lists): choose at least one family." : "Le tri utilise les familles de mots (pas les listes du CP-CE1) : choisis-en au moins une.";
    if ((jeu === "choose" || jeu === "dict") && !MO.gapPool(MI.sel).length) return en ? "The sentences of this game use other words: choose other lists or families." : "Les phrases de ce jeu portent sur d'autres mots : choisis d'autres listes ou familles.";
    return "";
  }
  /* préparation d'une question : tirages au sort faits une seule fois */
  function miPreparer() {
    var q = G.qs[G.i]; G.rep = false; G.ok = false; G.choix = null; G.typed = ""; G.phase = G.jeu === "look" ? "voir" : ""; G.outil = false; G.msg = "";
    if (G.jeu === "hidden") { G.h = MO.hiddenPart(q.m); G.opts = []; } /* l’élève tape les lettres : aucune écriture fausse proposée (principe d’Ouzoulias, D-132) */
    else if (G.jeu === "choose" || G.jeu === "rappel") G.opts = MO.shuffle([q.p].concat(q.opts));
    else if (G.jeu === "sort") G.opts = MO.shuffle([MO.FAM[q.fam]].concat(MO.intrus(q, MI.sel)));
    if (G.jeu === "listen") MO.direAvecPhrase(q.p);
    if (G.jeu === "dict" && G.phase !== "prep") MO.dire([MO.sayText(MO.gapFull(q, q.p))]);
  }
  var G = null;
  function miDemarrer(jeu, liste) {
    G = { jeu: jeu, qs: liste || miPool(jeu), i: 0, score: 0, res: [], vus: 0, outils: 0, fin: false };
    if (jeu === "dict" && !liste) G.prep = true;
    if (G.qs.length && !G.prep) miPreparer();
  }
  function miFamillesHTML(seulementChoisies) {
    return MO.GROUPS.map(function (g) {
      var fams = g.fams.filter(function (f) { return !seulementChoisies || MI.sel[f.id]; }); if (!fams.length) return "";
      return '<section class="mi-groupe"><h3>' + esc(tr(g.nom)) + '</h3><div class="mi-familles">' + fams.map(function (f) {
        if (g.kind === "list") return '<div class="mi-famille mi-famille--liste"><span class="mi-num">★ ' + f.key + '</span><div class="mi-mots">' + f.words.map(function (w) { return motHTML(w, true); }).join("") + "</div></div>";
        return '<div class="mi-famille"><span class="mi-racine">' + MO.html(f.key) + '</span><div class="mi-mots">' + f.words.map(function (w) { return motHTML(w, true); }).join("") + "</div></div>";
      }).join("") + "</div></section>";
    }).join("");
  }
  function miChoixMots() {
    var en = langue === "en", n = MO.pool(MI.sel).length;
    var groupes = MO.GROUPS.map(function (g) {
      var nSel = g.fams.filter(function (f) { return MI.sel[f.id]; }).length;
      var puces = g.fams.map(function (f) {
        var lib = g.kind === "list" ? "<b>" + f.key + "</b> " + esc(f.words.map(MO.plain).join(", ")) : MO.html(f.key);
        return '<button class="mi-puce" type="button" data-action="m-fam" data-v="' + f.id + '" aria-pressed="' + !!MI.sel[f.id] + '" aria-label="' + esc(tr(f.hint)) + '"><span class="po-case">' + (MI.sel[f.id] ? "✓" : "") + "</span><span>" + lib + "</span></button>";
      }).join("");
      return '<div class="mi-sel-groupe"><div class="mi-sel-haut"><h3>' + esc(tr(g.nom)) + "</h3><span>" + nSel + " / " + g.fams.length + '</span><button class="coco-btn coco-btn--secondaire" type="button" data-action="m-gtout" data-v="' + g.id + '">' + (en ? "All" : "Tout") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="m-gaucun" data-v="' + g.id + '">' + (en ? "None" : "Aucun") + '</button></div><div class="mi-puces">' + puces + "</div></div>";
    }).join("");
    var nb = [[10, "10"], [20, "20"], [0, en ? "All" : "Tous"]].map(function (x) { return '<button class="coco-btn coco-btn--secondaire" type="button" data-action="m-nb" data-v="' + x[0] + '" aria-pressed="' + (MI.nb === x[0]) + '">' + x[1] + "</button>"; }).join("");
    return '<details class="mi-selection"' + (MI.ouvert ? " open" : "") + '><summary data-action="m-ouvrir"><span><b>' + (en ? "My words to revise" : "Mes mots à réviser") + "</b> · " + n + (en ? " word" + (n > 1 ? "s" : "") + " chosen" : " mot" + (n > 1 ? "s" : "") + " choisi" + (n > 1 ? "s" : "")) + "</span><i>" + (en ? "Change" : "Changer") + "</i></summary>" +
      '<p class="po-note">' + (en ? "Tick the lists and families you are learning this week." : "Coche les listes et les familles que tu apprends cette semaine.") + "</p>" + groupes +
      '<div class="mi-sel-haut"><h3>' + (en ? "Questions per game" : "Questions par jeu") + "</h3>" + nb + '<span class="mi-espace"></span><button class="coco-btn coco-btn--secondaire" type="button" data-action="m-tout">' + (en ? "Choose everything" : "Tout choisir") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="m-aucun">' + (en ? "Clear" : "Tout enlever") + "</button></div></details>";
  }
  function pageSequenceMots() {
    var s = C.mots, m = MATIERE.francais, en = langue === "en";
    var cartes = Object.keys(JEUX_MOTS).map(function (id) {
      var J = JEUX_MOTS[id];
      return carte("francais", J.etape + " · " + t(ETAPES_MOTS[J.etape]), en ? J.en : J.fr, en ? J.den : J.dfr, J.perso, "mots-" + id);
    }).join("");
    return barre("francais") + '<section class="entete m-francais"><img src="' + IMG(m.perso) + '" alt=""><div><h1>' + esc(tr(s.titre)) + "</h1><p>" + esc(tr(m.nom)) + " · " + (en ? "Spelling" : "Orthographe") + "</p></div></section>" +
      '<p class="objectif m-francais">' + t("objectif") + " <b>" + esc(tr(s.objectif)) + "</b></p>" +
      (en ? '<p class="apercu">' + t("noteFr") + "</p>" : "") +
      '<div class="coco-row"><a class="coco-btn coco-btn--secondaire" href="#lecon-mots"><img src="' + PICTO("ampoule") + '" alt="">' + t("lecon") + "</a>" + boutonExos("mots") + "</div>" +
      miChoixMots() + '<section class="etapes">' + cartes + "</section>";
  }
  function pageLeconMots() {
    var m = MATIERE.francais, en = langue === "en";
    return barre("francais") + hautJeu(m, "seq-mots", { sous: tr(C.mots.titre), titre: t("lecon") }) + (en ? '<p class="apercu">' + t("noteFr") + "</p>" : "") +
      bulle("coralie", en ? "Look at the <b>common part</b>, in orange, and the <b>silent or final letter</b>, in yellow." : "Observe la <b>partie commune</b>, en orange, et la <b>lettre muette</b> ou finale, en jaune.") +
      '<div class="mi-lecon">' + miFamillesHTML(false) + "</div>" +
      jrSection(jrCartesMots, "francais") +
      '<div class="coco-row"><a class="coco-btn" href="#seq-mots">' + t("versSequence") + "</a></div>";
  }
  function miEcrire(dis) {
    var acc = ["é", "è", "ê", "à", "â", "ù", "ç", "’", "-"];
    return '<div class="mi-ecrire"><input id="mi-reponse" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="' + (langue === "en" ? "Write here" : "Écris ici") + '" value="' + esc(G.typed) + '"' + (dis ? " disabled" : "") + '>' +
      '<div class="mi-accents">' + acc.map(function (a) { return '<button type="button" data-mi-acc="' + a + '" aria-label="' + a + '"' + (dis ? " disabled" : "") + ">" + a + "</button>"; }).join("") + "</div></div>";
  }
  function miEcoute(texte, action) {
    return '<button class="coco-btn coco-btn--secondaire" type="button" data-action="' + action + '"><img src="' + PICTO("haut-parleur") + '" alt="">' + texte + "</button>";
  }
  function jeuMots(jeu) {
    var J = JEUX_MOTS[jeu], m = MATIERE.francais, en = langue === "en";
    if (!G || G.jeu !== jeu) { var vide = jeu === "rappel" ? "" : miVide(jeu); if (vide) { G = null; return barre("francais") + hautJeu(m, "seq-mots", { sous: tr(C.mots.titre), titre: en ? J.en : J.fr }) + bulle(J.perso, vide) + '<div class="coco-row"><a class="coco-btn" href="#seq-mots">' + t("versSequence") + "</a></div>"; } miDemarrer(jeu); }
    var n = G.qs.length, titre = { sous: tr(C.mots.titre) + " · " + J.etape + " · " + t(ETAPES_MOTS[J.etape]), titre: en ? J.en : J.fr };
    var prog = n <= 20 ? galets(n, G.fin ? n : G.i) : '<span class="mi-compteur">' + Math.min(G.i + 1, n) + " / " + n + "</span>";
    var haut = barre("francais") + hautJeu(m, "seq-mots", titre, prog) + (en ? '<p class="apercu">' + t("noteFr") + "</p>" : "");
    if (G.fin) return haut + miBilan(J);
    if (G.prep) {
      var cartes = G.qs.map(function (q, k) { var f = MO.FAM[q.fam], sib = f.words.map(MO.plain).filter(function (w) { return MO.norm(w) !== MO.norm(q.p); }).slice(0, 3);
        return '<button class="mi-prep" type="button" data-action="m-dire" data-k="' + k + '">' + motHTML(q.m) + "<small>" + esc(tr(f.hint)) + (sib.length ? (en ? " · like " : " · comme ") + esc(sib.join(", ")) : "") + "</small></button>"; }).join("");
      return haut + bulle(J.perso, en ? "I get ready: I read each word, I say it, I spot the <b>part to remember</b>. Tap a word to hear it." : "Je me prépare : je lis chaque mot, je le dis, je repère la <b>partie à retenir</b>. Touche un mot pour l'entendre.") +
        '<section class="zone m-francais"><div class="mi-preps">' + cartes + "</div></section>" + '<footer class="jeu-bas"><span></span><button class="coco-btn coco-btn--grand" type="button" data-action="m-pret">' + (en ? "I'm ready!" : "Je suis prêt(e) !") + "</button></footer>";
    }
    var q = G.qs[G.i], indice = '<p class="mi-indice">' + esc(tr(MO.FAM[q.fam].hint)) + "</p>", consigne = "", zone = "", bas = "";
    var valider = '<button class="coco-btn coco-btn--grand" type="button" data-action="m-valider">' + t("valider") + "</button>";
    var choix = function (lib) {
      return '<div class="coco-row">' + G.opts.map(function (o, k) {
        var juste = jeu === "sort" ? MO.famillesDe(q.p).indexOf(o.id) >= 0 : jeu === "hidden" ? o === G.h.seg : o === q.p;
        var cls = "coco-etiquette mi-choix" + (G.rep && juste ? " est-juste" : G.rep && k === G.choix ? " est-revoir" : "");
        return '<button class="' + cls + '" type="button" data-action="m-choix" data-v="' + k + '"' + (G.rep ? " disabled" : "") + ">" + lib(o) + "</button>";
      }).join("") + "</div>";
    };
    if (jeu === "look") {
      consigne = G.phase === "voir" ? (en ? "Look carefully at the word. When you have it in your head, cover it." : "Regarde bien le mot. Quand tu l'as en tête, cache-le.") : (en ? "The word is covered. Write it from memory." : "Le mot est caché. Écris-le de mémoire.");
      zone = indice + (G.phase === "voir" ? motHTML(q.m) : miEcrire(G.rep));
      bas = G.phase === "voir" ? '<button class="coco-btn coco-btn--grand" type="button" data-action="m-cacher">' + (en ? "I've looked, cover it" : "J'ai bien regardé, je cache") + "</button>" : (G.rep ? "" : valider);
    } else if (jeu === "hidden") {
      consigne = en ? "Type the missing letters." : "Tape les lettres qui manquent.";
      zone = indice + '<span class="mi-mot">' + G.h.beforeH + '<span class="mi-trou' + (G.rep ? " est-rempli" : "") + '">' + (G.rep ? G.h.segH : "?") + "</span>" + G.h.afterH + "</span>" + miEcrire(G.rep);
      bas = G.rep ? "" : valider;
    } else if (jeu === "choose" || jeu === "rappel") {
      var cap = q.sent.indexOf("___") === 0;
      consigne = jeu === "rappel" ? (en ? "I remember the <b>key words</b> from CP-CE1. Complete the sentence." : "Je me rappelle les <b>mots-outils</b> du CP-CE1. Complète la phrase.") : (en ? "Complete the sentence with the right word." : "Complète la phrase avec le mot qui convient.");
      zone = '<p class="phrase">' + esc(q.sent).replace("___", '<span class="mi-trou' + (G.rep ? " est-rempli" : "") + '">' + (G.rep ? MO.htmlCap(q.m, cap) : "&nbsp;") + "</span>") + "</p>" +
        choix(function (o) { return esc(cap ? MO.capFirst(o) : o); });
    } else if (jeu === "sort") {
      consigne = en ? "Which family does this word go in?" : "Dans quelle famille ranges-tu ce mot ?";
      zone = '<span class="mi-mot">' + esc(q.p) + "</span>" + choix(function (f) { return MO.html(f.key); });
    } else if (jeu === "listen") {
      consigne = en ? "Listen to the word, then write it." : "Écoute le mot, puis écris-le.";
      zone = indice + '<div class="coco-row">' + (MO.peutParler ? miEcoute(en ? "Listen to the word" : "Écouter le mot", "m-dire-mot") + (MO.SENT[q.p] ? miEcoute(en ? "In a sentence" : "Dans une phrase", "m-dire-phrase") : "") : '<p class="po-note">' + (en ? "This device cannot read aloud." : "Cet appareil ne sait pas lire à voix haute.") + "</p>") + "</div>" + miEcrire(G.rep) +
        (G.outil ? '<div class="mi-outil">' + miFamillesHTML(true) + "</div>" : "");
      bas = G.rep ? "" : '<button class="coco-btn coco-btn--secondaire" type="button" data-action="m-outil" aria-expanded="' + G.outil + '">' + (en ? "My toolbox" : "Mon outil") + "</button>" + valider;
    } else if (jeu === "dict") {
      consigne = en ? "Listen to the sentence, then write it." : "Écoute la phrase, puis écris-la.";
      zone = '<p class="mi-indice">' + (en ? "Sentence " + (G.i + 1) + " of " + n : "Phrase " + (G.i + 1) + " sur " + n) + '</p><div class="coco-row">' + (MO.peutParler ? miEcoute(en ? "Listen to the sentence" : "Écouter la phrase", "m-dire-dictee") : "") +
        (G.rep ? "" : '<button class="coco-btn coco-btn--secondaire" type="button" data-action="m-modele">' + (en ? "Look at the model" : "Regarder le modèle") + "</button>") + "</div>" +
        '<p class="phrase mi-modele" id="mi-modele"' + (G.modele ? "" : " hidden") + ">" + esc(MO.gapFull(q, q.p)) + "</p>" + miEcrire(G.rep);
      bas = G.rep ? "" : valider;
    }
    return haut + bulle(J.perso, consigne, jeu === "rappel" ? "reflechit" : "presente") + '<section class="zone m-francais mi-zone">' + zone + "</section>" +
      '<div class="retour-zone">' + G.msg + "</div>" + (bas ? '<footer class="jeu-bas"><span></span><span class="coco-row">' + bas + "</span></footer>" : "");
  }
  function miBilan(J) {
    var en = langue === "en", n = G.qs.length, sc = G.score, r = n ? sc / n : 0;
    marquerFait("mots-" + G.jeu);
    if (G.jeu === "rappel") return '<section class="bilan"><img src="' + POSE_BILAN(J.perso, sc, n) + '" alt=""><h2>' + t("fini") + "</h2><p>" + (en ? "You remembered " + sc + " key word" + (sc > 1 ? "s" : "") + " out of " + n + ". Now, let's discover new words!" : "Tu t'es rappelé " + sc + " mot" + (sc > 1 ? "s" : "") + "-outil" + (sc > 1 ? "s" : "") + " sur " + n + ". Maintenant, découvrons de nouveaux mots !") + '</p><div class="coco-row"><a class="coco-btn" href="#mots-look">' + (en ? "Look, cover, write" : "Regarde, cache, écris") + '</a><a class="coco-btn coco-btn--secondaire" href="#seq-mots">' + t("versSequence") + "</a></div></section>";
    var msg = r === 1 ? (en ? "Perfect: you know all these words!" : "Parfait, tu connais tous ces mots !") : r >= 0.6 ? (en ? "Good work! A little more effort on a few words." : "Beau travail ! Encore un petit effort sur quelques mots.") : (en ? "Keep practising: you will get there!" : "Continue de t'entraîner, tu vas y arriver !");
    var erreurs = G.res.filter(function (x) { return !x.ok; });
    var plus = G.jeu === "dict" ? "<p>" + (G.vus ? (en ? "You looked at the model " + G.vus + " time" + (G.vus > 1 ? "s" : "") + ". Try to look a little less next time!" : "Tu as regardé le modèle " + G.vus + " fois. Essaie de le regarder un peu moins la prochaine fois !") : (en ? "Well done: you did not look at the model!" : "Bravo : tu n'as pas regardé le modèle !")) + "</p>"
      : G.jeu === "listen" && G.outils ? "<p>" + (en ? "You used your toolbox " + G.outils + " time" + (G.outils > 1 ? "s" : "") + ": that is a good strategy!" : "Tu as utilisé ton outil " + G.outils + " fois : c'est une bonne stratégie !") + "</p>" : "";
    return '<section class="bilan"><img src="' + POSE_BILAN(J.perso, sc, n) + '" alt=""><h2>' + t("fini") + '</h2><p class="mi-score">' + sc + " / " + n + "</p><p>" + msg + "</p>" + plus +
      (erreurs.length ? "<p><b>" + (en ? "Words to look at again:" : "Les mots à revoir :") + '</b></p><div class="coco-row">' + erreurs.map(function (x) { return motHTML(x.m, true); }).join("") + "</div>" : "") +
      '<div class="coco-row">' + (erreurs.length ? '<button class="coco-btn" type="button" data-action="m-erreurs">' + (en ? "Replay my mistakes" : "Rejouer mes erreurs") + "</button>" : "") +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="m-rejouer">' + t("rejouer") + '</button><a class="coco-btn coco-btn--secondaire" href="#seq-mots">' + t("versSequence") + "</a></div></section>";
  }
  function miFinir(ok, plus) {
    var en = langue === "en", q = G.qs[G.i], dernier = G.i === G.qs.length - 1;
    G.rep = true; G.ok = ok; if (ok) G.score++;
    G.res.push({ m: q.m, p: q.p, fam: q.fam, sent: q.sent, opts: q.opts, ok: ok });
    var suite = '<button class="coco-btn coco-btn--grand" type="button" data-action="m-suite">' + (dernier ? (en ? "See my score" : "Voir mon score") : t("suivant")) + "</button>";
    if (ok) G.msg = retour("bravo", t("bravo"), (plus || "") + motHTML(q.m, true), suite);
    else {
      var rappel = G.jeu === "rappel" ? (en ? "Remember list " : "Rappelle-toi la liste ") + MO.FAM[q.fam].key + " : " + MO.FAM[q.fam].words.map(function (w) { return motHTML(w, true); }).join(" ") : (en ? "Look carefully at the part in orange and the letter in yellow: " : "Regarde bien la partie en orange et la lettre en jaune : ") + motHTML(q.m, true);
      G.msg = retour("revoir", t("pasEncore"), (plus || "") + rappel, suite);
      if (G.jeu === "listen") MO.direMot(q.p);
      if (G.jeu === "dict") MO.dire([MO.sayText(MO.gapFull(q, q.p))]);
    }
  }
  function actionMots(a, el) {
    var en = langue === "en";
    if (a === "m-fam") { MI.sel[el.dataset.v] = !MI.sel[el.dataset.v]; if (!MI.sel[el.dataset.v]) delete MI.sel[el.dataset.v]; miSauver(); return; }
    if (a === "m-gtout" || a === "m-gaucun") { MO.FAMS.forEach(function (f) { if (f.group.id === el.dataset.v) { if (a === "m-gtout") MI.sel[f.id] = true; else delete MI.sel[f.id]; } }); miSauver(); return; }
    if (a === "m-tout") { MO.FAMS.forEach(function (f) { MI.sel[f.id] = true; }); miSauver(); return; }
    if (a === "m-aucun") { MI.sel = {}; miSauver(); return; }
    if (a === "m-nb") { MI.nb = +el.dataset.v; miSauver(); return; }
    if (a === "m-ouvrir") { MI.ouvert = !MI.ouvert; return; }
    if (!G) return;
    var q = G.qs[G.i];
    if (a === "m-dire") { var x = G.qs[+el.dataset.k]; if (x) MO.direMot(x.p); }
    else if (a === "m-pret") { G.prep = false; miPreparer(); }
    else if (a === "m-cacher") G.phase = "ecrire";
    else if (a === "m-dire-mot") MO.direMot(q.p);
    else if (a === "m-dire-phrase") MO.direAvecPhrase(q.p);
    else if (a === "m-dire-dictee") MO.dire([MO.sayText(MO.gapFull(q, q.p))]);
    else if (a === "m-outil") { G.outil = !G.outil; if (G.outil && !G.outilVu) { G.outils++; G.outilVu = G.i + 1; } }
    else if (a === "m-modele" && !G.rep) {
      G.vus++; G.modele = true;
      clearTimeout(G.minuteModele); G.minuteModele = setTimeout(function () { if (G) G.modele = false; var e = document.getElementById("mi-modele"); if (e) e.hidden = true; }, 4000);
    }
    else if (a === "m-choix" && !G.rep) {
      var k = +el.dataset.v, o = G.opts[k]; G.choix = k;
      var ok = G.jeu === "sort" ? MO.famillesDe(q.p).indexOf(o.id) >= 0 : G.jeu === "hidden" ? o === G.h.seg : o === q.p;
      miFinir(ok, G.jeu === "sort" ? "<span>" + (en ? "Its family: " : "Sa famille : ") + esc(tr(MO.FAM[q.fam].hint)) + ". </span>" : "");
    }
    else if (a === "m-valider" && !G.rep) {
      var champ = document.getElementById("mi-reponse"), val = champ ? champ.value : G.typed; G.typed = val;
      if (!val.trim()) return;
      if (G.jeu === "dict") {
        var r = MO.phraseJuste(val, q), modele = '<span class="mi-modele-final">' + esc(r.full) + "</span>";
        miFinir(r.mot, r.phrase ? (en ? "Your sentence has no mistakes! " : "Ta phrase est sans erreur ! ") : r.mot ? (en ? "The invariable word is right. Compare the rest of your sentence with the model: " : "Le mot invariable est juste. Compare le reste de ta phrase avec le modèle : ") + modele + " " : (en ? "Here is the dictated sentence: " : "Voici la phrase dictée : ") + modele + " ");
      } else if (G.jeu === "hidden") {
        var nl = function (x) { return MO.norm(String(x).replace(/'/g, "’").trim()); };
        miFinir(nl(val) === nl(G.h.seg) || nl(val) === nl(q.p), "");
      } else {
        var bon = MO.accepte(val, q.p);
        miFinir(bon, bon && G.jeu === "listen" && G.outilVu === G.i + 1 ? (en ? "You looked in your toolbox: that is a good strategy! " : "Tu as cherché dans ton outil : c'est une bonne stratégie ! ") : "");
      }
    }
    else if (a === "m-suite" && G.rep) { if (G.i < G.qs.length - 1) { G.i++; miPreparer(); } else G.fin = true; }
    else if (a === "m-erreurs") { var err = G.res.filter(function (x) { return !x.ok; }).map(function (x) { return { m: x.m, p: x.p, fam: x.fam, sent: x.sent, opts: x.opts }; }); miDemarrer(G.jeu, MO.shuffle(err)); }
    else if (a === "m-rejouer") miDemarrer(G.jeu);
  }
  function ficheMots() {
    var li = function (a) { return a.map(function (x) { return "<li>" + x + "</li>"; }).join(""); };
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#ens-sequences">← Séquences d’apprentissage</a><a class="coco-btn" href="#seq-mots">Voir la séquence</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche m-francais"><small>Français · Étude de la langue · Orthographe lexicale · CE2</small><h1>Les mots invariables</h1>' +
      '' +
      encadreProgramme("mots") +
      '<section><h2>La séquence sur le site</h2><table class="f-table"><tbody>' +
      [["Revoir la leçon", "Revoir les familles : repérer la partie commune (orange) et la lettre muette ou finale (jaune) d'un groupe de mots, comme sur les affiches."],
       ["1 · Je me rappelle", "Trois phrases à compléter avec les mots-outils du CP-CE1. En cas d'erreur, l'élève revoit la liste concernée."],
       ["1 · Regarde, cache, écris", "Écrire de mémoire un mot invariable après l'avoir observé."],
       ["1 · Lettres cachées", "Retrouver la partie commune ou la lettre muette d'un mot. Seul jeu qui propose des lettres à choisir."],
       ["2 · Le mot manquant", "Choisir, parmi des mots correctement écrits, celui qui convient pour compléter une phrase."],
       ["2 · Le tri des familles", "Associer un mot invariable à sa famille orthographique."],
       ["2 · Écoute et écris", "Écrire sous la dictée un mot invariable, en cherchant si besoin dans « Mon outil » (je connais le mot, je le cherche, ou je demande)."],
       ["3 · La dictée sans erreur", "Se préparer (réseau de mots, partie à retenir), puis écrire cinq phrases dictées en regardant le modèle le moins possible."]].map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>"; }).join("") + "</tbody></table></section>" +
      "<section><h2>Conseils d'utilisation</h2><ul>" + li(["L'élève choisit les listes et les familles qu'il révise, sur la page de la séquence. Le choix est gardé sur l'iPad d'une fois sur l'autre.", "Les jeux d'écriture refusent les fautes d'accent : la barre de lettres accentuées aide les élèves sur iPad.", "L'écoute utilise la voix française de l'appareil : penser à monter le son et à désactiver le mode silencieux. La voix n'est utilisée que dans « Écoute et écris » et dans la dictée.", "En fin de partie, « Rejouer mes erreurs » relance uniquement les mots ratés.", "« Le mot manquant » ne montre que des mots bien écrits, et les productions erronées des élèves ne sont pas réaffichées : l'orthographe lexicale se mémorise en limitant les occasions de produire ou de rencontrer des graphies fautives.", "La dictée sans erreur comporte cinq phrases : le nombre de fois où l'élève regarde le modèle est donné en fin de partie, l'objectif étant de le diminuer d'une fois à l'autre."]) + "</ul></section>" +
      "<section><h2>Ressources pédagogiques</h2><ul>" + li(["A. Ouzoulias, « La mémorisation de l'orthographe lexicale, un enjeu décisif ».", "Éduscol : « Installer les bases de l'orthographe lexicale au cycle 2 » ; « Différentes formes de dictées » (dictée sans erreur) ; « La copie » ; « Lecture et orthographe : un renforcement mutuel »."]) + "</ul></section></article>";
  }

  /* ---------- Maths : lire l'heure digitale (P5 séquence 1) : pour l'instant, les jeux collectifs au TBI (D-73) ---------- */
  var JEU_DIGITAL = "jeux/heure-digitale-ardoise.html";
  function cartesPO(seq) { return (PO.sequences[seq] || []).map(function (pid, k) { var p = po(pid); return carte("maths", "4 · " + t("ouvert") + " " + (k + 1), tr(p.titre), tr(p.question), p.perso, "po-" + pid); }).join(""); }
  function pageSequenceDigitale() {
    var s = C.digitale, m = MATIERE.maths, en = langue === "en";
    var tbi = '<a class="coco-carte coco-carte--maths" href="' + JEU_DIGITAL + '"><span class="coco-carte-vignette"><img src="' + IMG("tehani") + '" alt=""></span><span><span class="coco-carte-etape">' + (en ? "On the whiteboard · sessions 1 to 3" : "Au TBI · séances 1 à 3") + "</span><h3>" + (en ? "Boards up!" : "L’heure à l’ardoise") + "</h3><p>" +
      (en ? "Whole-class games with the teacher: slates, thumbs and fingers. In French." : "Jeux collectifs avec la maîtresse : à l’ardoise, avec les pouces ou avec les doigts.") + "</p></span></a>";
    var cartes = cartesQZ("digitale") + tbi + cartesPO("digitale");
    return barre("maths") + '<section class="entete m-maths"><img src="' + IMG(m.perso) + '" alt=""><div><h1>' + esc(tr(s.titre)) + "</h1><p>" + esc(tr(m.nom)) + " · " + (en ? "Measures" : "Grandeurs et mesures") + "</p></div></section>" +
      '<p class="objectif m-maths">' + t("objectif") + " <b>" + esc(tr(s.objectif)) + "</b></p>" + '<div class="coco-row"><a class="coco-btn coco-btn--secondaire" href="#lecon-digitale"><img src="' + PICTO("ampoule") + '" alt="">' + t("lecon") + "</a>" + boutonExos("digitale") + "</div>" + '<section class="etapes">' + cartes + "</section>";
  }

  /* ---------- encadré « Programme et repères » des fiches enseignantes (D-77) : citations mot pour mot ---------- */
  var SOCLE = { 1: "D1 Les langages pour penser et communiquer", 2: "D2 Les méthodes et outils pour apprendre", 3: "D3 La formation de la personne et du citoyen", 4: "D4 Les systèmes naturels et les systèmes techniques", 5: "D5 Les représentations du monde et l’activité humaine" };
  var COMP_M = { chercher: ["Chercher", [2, 4]], modeliser: ["Modéliser", [1, 2, 4]], representer: ["Représenter", [1, 5]], raisonner: ["Raisonner", [2, 3, 4]], calculer: ["Calculer", [4]], communiquer: ["Communiquer", [1, 3]] };
  var ATT_GM = ["Comparer, estimer, mesurer des longueurs, des masses, des contenances, des durées.", "Utiliser le lexique, les unités, les instruments de mesures spécifiques de ces grandeurs.", "Résoudre des problèmes impliquant des longueurs, des masses, des contenances, des durées, des prix."];
  var ATT_NC = ["Résoudre des problèmes en utilisant des nombres entiers et le calcul.", "Calculer avec des nombres entiers."];
  var PROG = {
    heure: { ref: "Mathématiques · Grandeurs et mesures (durées)", att: ATT_GM.slice(0, 2), comp: ["representer", "modeliser", "calculer"], rp: "mathématiques p. 10, 16 et 17",
      reperes: ["Il indique l’heure sur un affichage à aiguilles (heure entière, demi-heure, « et quart », « moins le quart », multiples de 5 jusqu’à « vingt-cinq » et de « moins vingt-cinq » à « moins cinq »).", "Il connaît et utilise la relation : 1h=60min pour comparer des durées.", "Il connaît et utilise des rapports simples de durée : double, moitié, quart : exemple 1 demi-heure=30min ; 1 quart d’heure=15min ; multiples de 5 : pour utiliser les minutes.", "Il mémorise les multiples de 15 (en lien avec les durées) : 15 ; 30 ; 45 ; 60."] },
    mots: { ref: "Français · Étude de la langue (orthographe lexicale)", att: ["Orthographier les mots les plus fréquents (notamment en situation scolaire) et les mots invariables mémorisés."], socle: [1, 2], comp: "Comprendre le fonctionnement de la langue : s’initier à l’orthographe lexicale.", rp: "français p. 31",
      reperes: ["Il mémorise et restitue (grâce à des pratiques variées : épellation, copie, mise en mémoire…) un corpus organisé de mots invariables (listes analogiques : tôt, aussitôt, plutôt… ; listes thématiques, vocabulaire spatial : ici, là-bas, loin, près…).", "Il reconnaît la partie commune de certains mots."] },
    monnaie: { ref: "Mathématiques · Grandeurs et mesures (prix)", att: [ATT_GM[2]], comp: ["chercher", "modeliser", "calculer", "communiquer"], rp: "mathématiques p. 12 et 17",
      reperes: ["L’élève connaît et utilise la monnaie du pays (pièces de 1F, 2F, 5F, 10F, 20F, 50F, 100F, billets de 500F, 1000F) pour exprimer un prix, en lien avec les décompositions additives ou multiplicatives des nombres abordés.", "Il effectue des échanges en utilisant la monnaie, en lien avec les nombres abordés."],
      ex: "Exemple de situation donné par les repères (p. 12) : « Calculer mentalement sur les nombres 1, 2, 5, 10, 20, 50, 100 en lien avec la monnaie. »",
      note: "Les pièces de 1 F et de 2 F ne circulent plus en Nouvelle-Calédonie : le site utilise les pièces de 5 F à 200 F de la leçon GM1 (D\u201177, D\u201182)." },
    division: { ref: "Mathématiques · Nombres et calculs", att: ATT_NC, comp: ["chercher", "modeliser", "raisonner", "calculer", "communiquer"], rp: "mathématiques p. 7 et 11",
      reperes: ["Il consolide l’étude du sens de la division euclidienne par la résolution de problèmes de partage et de groupements dont l’énoncé implique la recherche du quotient et/ou du reste et/ou du quotient + 1.", "Il calcule le quotient et le reste d’une division euclidienne en utilisant les tables de multiplications, c’est-à-dire en posant l’égalité caractéristique suite à un partage ou une distribution et quand le quotient est compris dans la table du diviseur."] },
    diagrammes: { ref: "Mathématiques · Nombres et calculs (résolution de problèmes)", att: [ATT_NC[0]], comp: ["representer", "modeliser", "calculer"], rp: "mathématiques p. 7 et 8",
      reperes: ["L’élève résout des problèmes nécessitant : plusieurs étapes ; la gestion de données numériques variées (utiles ou non à la résolution du problème) ; plusieurs opérations nécessitant par exemple l’exploration d’un tableau ou d’un graphique.", "L’élève lit des données numériques organisées sous forme de diagrammes en barres. Il exploite ces données pour répondre à des questions ou résoudre des problèmes."] }
  };
  PROG.masses = { ref: "Mathématiques · Grandeurs et mesures (masses)", att: ATT_GM, comp: ["chercher", "modeliser", "calculer", "communiquer"], rp: "mathématiques p. 13 et 15",
    reperes: ["L’élève fait correspondre un mesurage de masse à l’unité convenable (voir le lexique spécifique associé).", "L’élève connaît et utilise le kilogramme, le gramme, la tonne pour exprimer une mesure de masse, choisit l’unité appropriée pour exprimer et rendre compte de l’estimation d’une mesure.", "Il met en relation les unités et connaît et utilise ces relations : 1t = 1 000kg ; 1kg=1 000g pour comparer des mesures ou effectuer des calculs.", "Il construit des rapports simples de masse : double et moitié : exemple la moitié de 1kg est 500g ; multiples de 10 ;100 ;1 000 : exemple 2kg=2x1 000g"] };
  PROG.verbe = { ref: "Français · Étude de la langue (grammaire et conjugaison)", att: ["Raisonner pour réaliser les accords dans le groupe nominal d’une part (déterminant, nom, adjectif), entre le verbe et son sujet d’autre part (cas simples : sujet placé avant le verbe et proche de lui ; sujet composé d’un groupe nominal comportant au plus un adjectif).", "Utiliser ses connaissances sur la langue pour mieux s’exprimer à l’oral, pour mieux comprendre des mots et des textes, pour améliorer des textes écrits."], socle: [1, 2], comp: "Se repérer dans la phrase simple : reconnaître les principaux constituants de la phrase : le sujet, le verbe (connaissance des propriétés permettant de l’identifier), les compléments ; reconnaître les formes négative et exclamative et savoir effectuer des transformations.", rp: "français p. 31 et 33",
    reperes: ["Il mobilise différentes stratégies qui permettent d’identifier le verbe : il opère des transformations (nombre, temps) et observe les modifications par exemple."] };
  PROG.digitale = { ref: PROG.heure.ref, att: PROG.heure.att, comp: PROG.heure.comp, rp: "mathématiques p. 16 et 17",
    reperes: ["Il lit l’heure sur un affichage digital.", "Il repère des évènements de la journée en utilisant les heures, et les minutes.", "Il connaît et utilise la relation : 1h=60min pour comparer des durées."] };
  function encadreProgramme(cle) {
    var P = PROG[cle], li = function (a) { return a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""); };
    var socle = P.socle || [], comp = "";
    if (Array.isArray(P.comp)) { comp = P.comp.map(function (c) { var x = COMP_M[c]; x[1].forEach(function (d) { if (socle.indexOf(d) < 0) socle.push(d); }); return x[0] + " (D" + x[1].join(", D") + ")"; }).join(" · "); }
    else comp = P.comp;
    socle.sort();
    return '<section class="f-prog"><h2>Programme et repères</h2><p class="f-prog-ref">' + esc(P.ref) + " · Cycle 2, CE2 · niveau de maîtrise 3</p>" +
      '<div class="f-deux"><div><h3>Attendus de fin de cycle 2</h3><ul>' + li(P.att) + "</ul></div><div><h3>Repères de progressivité (niveau 3)</h3><ul>" + P.reperes.map(function (r) { return "<li>« " + esc(r) + " »</li>"; }).join("") + "</ul></div></div>" +
      "<p><b>Compétences travaillées :</b> " + esc(comp) + "</p><p><b>Domaines du socle :</b> " + esc(socle.map(function (d) { return SOCLE[d]; }).join(" ; ")) + "</p>" + (P.ex ? "<p>" + esc(P.ex) + "</p>" : "") + (P.note ? '<p class="f-prog-note">' + esc(P.note) + "</p>" : "") +
      '<p class="f-source">Sources : délibération n° 127 du 13 janvier 2021, annexe 2 (programme du cycle 2, attendus p. 83 à 86) ; repères de progressivité du cycle 2, ' + esc(P.rp) + ".</p></section>";
  }

  /* ---------- Maths : lire et construire des graphiques en barres (D-77) ---------- */
  var DG = window.COCO_DONNEES;
  var JEUX_DIAG = {
    rappel: { perso: "vaka", etape: 1, n: 4, fr: "Je me rappelle", en: "I remember", dfr: "Je compare des nombres, je compte de 2 en 2 et de 5 en 5, je calcule un écart.", den: "I compare numbers, count in twos and fives, and find a difference." },
    lire: { perso: "nina", etape: 1, n: 6, fr: "Lis le graphique", en: "Read the bar chart", dfr: "Je lis une barre, je trouve la plus haute et la plus basse. Graduations de 1 en 1.", den: "I read a bar and find the tallest and the shortest one. The scale goes up in ones." },
    lire2: { perso: "leo", etape: 2, n: 6, fr: "Lis les graduations", en: "Read the scale", dfr: "Je lis des graphiques gradués de 2 en 2, de 5 en 5 et de 10 en 10.", den: "I read bar charts with scales in twos, fives and tens." },
    construire: { perso: "tao", etape: 2, n: 3, fr: "Je construis le graphique", en: "I build the bar chart", dfr: "Je monte chaque barre à la bonne hauteur, d’après le tableau.", den: "I make each bar the right height, using the table." },
    prob: { perso: "waeko", etape: 3, n: 5, fr: "Problèmes avec un graphique", en: "Bar chart problems", dfr: "Je prends les nombres dans le graphique pour résoudre un problème.", den: "I take the numbers from the bar chart to solve a problem." }
  };
  var ETAPES_DIAG = { 1: "decouvre", 2: "entraine", 3: "reinvestis" };
  var GD = null;
  function dgDemarrer(jeu) {
    GD = { jeu: jeu, i: 0, score: 0, rep: false, choix: -1, msg: "", essais: 0, fin: false, saisie: "" };
    if (jeu === "rappel") GD.qs = DG.RAPPEL;
    else if (jeu === "lire") GD.qs = DG.questionsLire(1, 6);
    else if (jeu === "lire2") GD.qs = DG.questionsLire(2, 6);
    else if (jeu === "construire") { GD.qs = DG.questionsConstruire(3); GD.v = GD.qs[0].vals.map(function () { return 0; }); }
    else if (jeu === "prob") GD.qs = DG.problemes(5);
  }
  function dgNom(d, k) { return langue === "en" ? d.ctx.cats[k].en : d.ctx.cats[k].fr; }
  function dgTitre(d) { return '<h3 class="dg-titre">' + esc(tr(d.ctx.titre)) + "</h3>"; }
  function dgFigure(d, o) { o = o || {}; o.en = langue === "en"; return '<figure class="dg-fig">' + dgTitre(d) + '<p class="dg-legende">↑ ' + (langue === "en" ? "Number of " : "Nombre ") + esc(langue === "en" ? d.ctx.axe.en : d.ctx.axe.de) + "</p>" + DG.diagramme(d, o) + '<p class="dg-legende dg-legende-x">' + esc(tr(d.ctx.axeX)) + " →</p></figure>"; }
  function dgSuite(dernier) { return '<button class="coco-btn coco-btn--grand" type="button" data-action="g-suite">' + (dernier ? (langue === "en" ? "See my score" : "Voir mon score") : t("suivant")) + "</button>"; }
  function dgChoix(opts, juste, lib) {
    return '<div class="coco-row">' + opts.map(function (o, k) {
      var cls = "coco-etiquette hr-choix" + (GD.rep && k === juste ? " est-juste" : GD.rep && k === GD.choix ? " est-revoir" : "");
      return '<button class="' + cls + '" type="button" data-action="g-choix" data-v="' + k + '"' + (GD.rep ? " disabled" : "") + ">" + esc(typo(String(lib(o)))) + "</button>";
    }).join("") + "</div>";
  }
  function dgFinir(ok, txt) {
    var dernier = GD.i === JEUX_DIAG[GD.jeu].n - 1;
    GD.rep = true; if (ok && GD.essais === 0) GD.score++;
    GD.msg = retour(ok ? "bravo" : "revoir", ok ? t("bravo") : t("pasEncore"), txt, dgSuite(dernier));
  }
  function pageSequenceDiagrammes() {
    var s = C.diagrammes, m = MATIERE.maths, en = langue === "en";
    var cartes = Object.keys(JEUX_DIAG).map(function (id) { var J = JEUX_DIAG[id]; return carte("maths", J.etape + " · " + t(ETAPES_DIAG[J.etape]), en ? J.en : J.fr, en ? J.den : J.dfr, J.perso, "diag-" + id); }).join("");
    return barre("maths") + '<section class="entete m-maths"><img src="' + IMG(m.perso) + '" alt=""><div><h1>' + esc(tr(s.titre)) + "</h1><p>" + esc(tr(m.nom)) + " · " + (en ? "Problem solving" : "Résolution de problèmes") + "</p></div></section>" +
      '<p class="objectif m-maths">' + t("objectif") + " <b>" + esc(tr(s.objectif)) + "</b></p>" +
      '<div class="coco-row"><a class="coco-btn coco-btn--secondaire" href="#lecon-diagrammes"><img src="' + PICTO("ampoule") + '" alt="">' + t("lecon") + "</a>" + boutonExos("diagrammes") + "</div>" +
      '<section class="etapes">' + cartes + cartesPO("diagrammes") + "</section>";
  }
  function pageLeconDiagrammes() {
    var m = MATIERE.maths, en = langue === "en";
    var d = { ctx: DG.CONTEXTES[0], pas: 2, max: 20, vals: [14, 8, 11, 5, 16] };
    var parties = en ? [["1 · The title", "It tells you what the chart is about."], ["2 · The scale", "The numbers go up in steps: here, in twos. Look carefully at the step!"], ["3 · The bars", "One bar for each thing we count. The taller the bar, the bigger the number."], ["4 · The labels", "Under each bar: what we are counting."]]
      : [["1 · Le titre", "Il dit de quoi parle le graphique."], ["2 · Les graduations", "Les nombres montent avec un pas : ici, de 2 en 2. Regarde bien le pas !"], ["3 · Les barres", "Une barre pour chaque chose qu’on compte. Plus la barre est haute, plus le nombre est grand."], ["4 · Les noms sous les barres", "Ils disent ce qu’on compte."]];
    return barre("maths") + hautJeu(m, "seq-diagrammes", { sous: tr(C.diagrammes.titre), titre: t("lecon") }, "") +
      '<section class="dg-lecon">' + dgFigure(d, { montre: 2 }) + '<ol class="dg-parties">' + parties.map(function (p) { return "<li><b>" + esc(typo(p[0])) + "</b><span>" + esc(typo(p[1])) + "</span></li>"; }).join("") +
      '<li class="dg-exemple"><b>' + (en ? "Example" : "Exemple") + "</b><span>" + (en ? "The papayas bar stops halfway between 10 and 12: <b>11 papayas</b> were sold." : "La barre des papayes s’arrête entre 10 et 12, au milieu : on a vendu <b>11 papayes</b>.") + "</span></li></ol></section>" +
      jrSection(jrCartesDiagrammes);
  }
  function jeuDiag(jeu) {
    var J = JEUX_DIAG[jeu], m = MATIERE.maths, en = langue === "en";
    if (!GD || GD.jeu !== jeu) dgDemarrer(jeu);
    var n = J.n, titre = { sous: tr(C.diagrammes.titre) + " · " + J.etape + " · " + t(ETAPES_DIAG[J.etape]), titre: en ? J.en : J.fr };
    var haut = barre("maths") + hautJeu(m, "seq-diagrammes", titre, galets(n, GD.fin ? n : GD.i));
    if (GD.fin) return haut + dgBilan();
    var q = GD.qs[GD.i], consigne = "", zone = "", bas = "";
    if (jeu === "rappel") {
      consigne = en ? "I remember what I need to read a <b>bar chart</b>." : "Je me rappelle ce qu’il faut pour lire un <b>graphique en barres</b>.";
      zone = '<p class="phrase">' + esc(typo(tr(q))) + "</p>" + dgChoix(q.o, q.a, function (o) { return o; });
    } else if (jeu === "lire" || jeu === "lire2") {
      var d = q.d;
      if (q.type === "valeur") {
        consigne = en ? "What number does the <b>“" + esc(dgNom(d, q.k)) + "”</b> bar show?" : "Quel nombre la barre <b>« " + esc(dgNom(d, q.k)) + " »</b> indique-t-elle ?";
        zone = (jeu === "lire2" ? '<p class="mi-indice">' + (en ? "The scale goes up in " + (d.pas === 2 ? "twos" : d.pas === 5 ? "fives" : "tens") + "." : "Les graduations vont de " + d.pas + " en " + d.pas + ".") + "</p>" : "") +
          dgFigure(d, GD.rep ? { montre: q.k } : {}) + dgChoix(q.opts, q.opts.indexOf(d.vals[q.k]), function (o) { return o; });
      } else {
        consigne = esc(tr(d.ctx[q.type])).replace(/(plus|moins|most|least|fewest)/, "<b>$1</b>");
        zone = dgFigure(d, GD.rep ? { montre: q.k } : {}) + dgChoix(d.ctx.cats.map(function (_, k) { return k; }), q.k, function (k) { return dgNom(d, k); });
      }
    } else if (jeu === "construire") {
      var dc = q, v = GD.v;
      consigne = en ? "Build the bar chart: tap in each column to make the bar the right height." : "Construis le graphique : touche dans chaque colonne pour monter la barre à la bonne hauteur.";
      zone = '<table class="dg-table"><thead><tr><th></th><th>' + (en ? "Number" : "Nombre") + "</th></tr></thead><tbody>" + dc.ctx.cats.map(function (_, k) { return "<tr><th>" + esc(dgNom(dc, k)) + "</th><td>" + dc.vals[k] + "</td></tr>"; }).join("") + "</tbody></table>" +
        dgFigure(dc, { vals: v, construire: !GD.rep, revoir: GD.revoir }) +
        (GD.rep ? "" : '<div class="dg-reglages">' + dc.ctx.cats.map(function (_, k) { return '<div><span>' + esc(dgNom(dc, k)) + '</span><button class="coco-btn coco-btn--secondaire coco-btn--icone" type="button" data-action="g-moins" data-c="' + k + '" aria-label="' + (en ? "Lower" : "Baisser") + " " + esc(dgNom(dc, k)) + '">−</button><b>' + v[k] + '</b><button class="coco-btn coco-btn--secondaire coco-btn--icone" type="button" data-action="g-plus" data-c="' + k + '" aria-label="' + (en ? "Raise" : "Monter") + " " + esc(dgNom(dc, k)) + '">+</button></div>'; }).join("") + "</div>");
      bas = GD.rep ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="g-ok">' + t("valider") + "</button>";
    } else if (jeu === "prob") {
      consigne = en ? "Read the problem, find the numbers in the bar chart, then write your answer." : "Lis le problème, cherche les nombres dans le graphique, puis écris ta réponse.";
      zone = '<p class="phrase">' + esc(typo(tr(q))) + "</p>" + dgFigure(q.d) +
        '<p class="dg-saisie"><label for="dg-rep">' + (en ? "My answer:" : "Ma réponse :") + '</label><input id="dg-rep" type="text" inputmode="numeric" maxlength="5" autocomplete="off" data-g-champ value="' + esc(GD.saisie) + '"' + (GD.rep ? " disabled" : "") + ">" + (q.unite ? "<b>" + q.unite + "</b>" : "") + "</p>";
      bas = GD.rep ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="g-rep">' + t("valider") + "</button>";
    }
    return haut + bulle(J.perso, consigne, jeu === "rappel" ? "reflechit" : "presente") + '<section class="zone m-maths dg-zone">' + zone + "</section>" + '<div class="retour-zone">' + GD.msg + "</div>" +
      (bas ? '<footer class="jeu-bas"><span></span>' + bas + "</footer>" : "");
  }
  function dgBilan() {
    var en = langue === "en", n = JEUX_DIAG[GD.jeu].n, sc = GD.score;
    marquerFait("diag-" + GD.jeu);
    var txt = GD.jeu === "rappel" ? (en ? "You remembered " + sc + " out of " + n + ". Now, let’s read a bar chart!" : "Tu t’es rappelé " + sc + " réponse" + (sc > 1 ? "s" : "") + " sur " + n + ". Maintenant, lisons un graphique !")
      : (en ? "You got " + sc + " out of " + n + " right first time." : "Tu as réussi " + sc + " sur " + n + " du premier coup.");
    return '<section class="bilan"><img src="' + POSE_BILAN(JEUX_DIAG[GD.jeu].perso, sc, n) + '" alt=""><h2>' + t("fini") + "</h2>" + (GD.jeu === "rappel" ? "" : '<p class="mi-score">' + sc + " / " + n + "</p>") + "<p>" + esc(typo(txt)) + "</p>" +
      '<div class="coco-row">' + (GD.jeu === "rappel" ? '<a class="coco-btn" href="#diag-lire">' + (en ? "Read the bar chart" : "Lis le graphique") + "</a>" : '<button class="coco-btn" type="button" data-action="g-rejouer">' + t("rejouer") + "</button>") +
      '<a class="coco-btn coco-btn--secondaire" href="#seq-diagrammes">' + t("versSequence") + "</a></div></section>";
  }
  function actionDiag(a, el) {
    if (!GD) return;
    var en = langue === "en", jeu = GD.jeu, q = GD.qs[GD.i];
    if (a === "g-rejouer") { dgDemarrer(jeu); return; }
    if (a === "g-suite" && GD.rep) {
      if (GD.i >= JEUX_DIAG[jeu].n - 1) { GD.fin = true; return; }
      GD.i++; GD.rep = false; GD.choix = -1; GD.msg = ""; GD.essais = 0; GD.saisie = ""; GD.revoir = null;
      if (jeu === "construire") GD.v = GD.qs[GD.i].vals.map(function () { return 0; });
      return;
    }
    if (GD.rep) return;
    if (a === "g-choix") {
      var k = +el.dataset.v; GD.choix = k;
      if (jeu === "rappel") { dgFinir(k === q.a, esc(typo(en ? q.len : q.lfr))); return; }
      var d = q.d;
      if (q.type === "valeur") {
        var bon = q.opts[k] === d.vals[q.k];
        dgFinir(bon, (en ? "The “" + esc(dgNom(d, q.k)) + "” bar stops at <b>" : "La barre « " + esc(dgNom(d, q.k)) + " » s’arrête à <b>") + d.vals[q.k] + "</b>." + (bon ? "" : " " + (en ? "Start at the top of the bar and follow the line across to the scale." : "Pars du haut de la barre et suis la ligne jusqu’aux nombres.")));
      } else {
        var ok = k === q.k;
        dgFinir(ok, (en ? "The " + (q.type === "plus" ? "tallest" : "shortest") + " bar is <b>" : "La barre la plus " + (q.type === "plus" ? "haute" : "basse") + " est celle de <b>") + esc(dgNom(d, q.k)) + "</b> : " + d.vals[q.k] + "." + (ok ? "" : " " + (en ? "Compare the tops of the bars." : "Compare le haut des barres.")));
      }
      return;
    }
    if (a === "g-haut" || a === "g-plus" || a === "g-moins") {
      var c = +el.dataset.c, dc = q;
      GD.v[c] = a === "g-haut" ? +el.dataset.v : Math.max(0, Math.min(dc.max, GD.v[c] + (a === "g-plus" ? dc.pas : -dc.pas)));
      GD.msg = ""; GD.revoir = null; return;
    }
    if (a === "g-ok") {
      var faux = q.vals.map(function (x, k) { return GD.v[k] === x ? -1 : k; }).filter(function (k) { return k >= 0; });
      if (!faux.length) { dgFinir(true, en ? "Every bar is the right height!" : "Toutes les barres sont à la bonne hauteur !"); return; }
      if (GD.essais >= 1) { GD.v = q.vals.slice(); GD.revoir = null; dgFinir(false, en ? "Look: here is the bar chart, built from the table." : "Regarde : voici le graphique construit d’après le tableau."); return; }
      GD.essais++; GD.revoir = faux;
      GD.msg = retour("revoir", t("pasEncore"), (en ? "Look again at the bar" + (faux.length > 1 ? "s" : "") + " for " : "Regarde encore " + (faux.length > 1 ? "les barres" : "la barre") + " : ") + "<b>" + faux.map(function (k) { return esc(dgNom(q, k)); }).join(", ") + "</b>. " + (en ? "Check the number in the table, then count the steps on the scale." : "Vérifie le nombre dans le tableau, puis compte les graduations."));
      return;
    }
    if (a === "g-rep") {
      var val = GD.saisie === "" ? NaN : +GD.saisie;
      if (isNaN(val)) { GD.msg = retour("astuce", t("indice"), en ? "Write a number first." : "Écris d’abord un nombre."); return; }
      if (val === q.rep) { dgFinir(true, (en ? "The answer is <b>" : "La réponse est <b>") + q.rep + (q.unite ? " " + q.unite : "") + "</b>."); return; }
      if (GD.essais >= 1) { dgFinir(false, (en ? "The answer is <b>" : "La réponse est <b>") + q.rep + (q.unite ? " " + q.unite : "") + "</b>. " + esc(en ? q.aideEn : q.aideFr)); return; }
      GD.essais++; GD.msg = retour("revoir", t("pasEncore"), esc(en ? q.aideEn : q.aideFr));
    }
  }
  document.addEventListener("input", function (e) { var el = e.target; if (!el.dataset || el.dataset.gChamp === undefined || !GD) return; var v = el.value.replace(/\D/g, "").slice(0, 5); if (v !== el.value) el.value = v; GD.saisie = v; });
  document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.dataset && e.target.dataset.gChamp !== undefined) { var b = document.querySelector('[data-action="g-rep"]'); if (b) b.click(); } });
  function ficheDiagrammes() {
    var li = function (a) { return a.map(function (x) { return "<li>" + x + "</li>"; }).join(""); };
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#ens-sequences">← Séquences d’apprentissage</a><a class="coco-btn coco-btn--secondaire" href="#seq-diagrammes">Voir la séquence</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche m-maths"><small>Maths · Résolution de problèmes · Organisation et gestion de données · CE2</small><h1>Lire un graphique en barres</h1>' +
      '' +
      encadreProgramme("diagrammes") +
      '<section><h2>Les activités du site</h2><table class="f-table"><tbody>' + [
        ["Revoir la leçon", "Les 4 éléments d’un graphique (titre, graduations, barres, noms) ; lire une barre en suivant la ligne jusqu’aux nombres ; une valeur entre deux graduations."],
        ["1 · Je me rappelle", "Comparer des nombres, compter de 2 en 2 et de 5 en 5, calculer un écart."],
        ["1 · Lis le graphique", "Graduations de 1 en 1 : lire la valeur d’une barre, trouver la plus haute et la plus basse."],
        ["2 · Lis les graduations", "Graduations de 2 en 2, de 5 en 5 et de 10 en 10, valeurs parfois entre deux graduations."],
        ["2 · Je construis le graphique", "Monter les barres d’après un tableau (graduations de 1 en 1, puis de 2 en 2)."],
        ["3 · Problèmes avec un graphique", "Total, écart, problème en deux étapes, prix (× 100 F), information inutile."],
        ["4 · Problèmes ouverts", "« Le graphique mélangé » (24 élèves, l’ordre des fruits : 84 graphiques possibles) et « Deux chiens de plus » (l’écart et le total : 7 graphiques), adaptés de Sullivan & Lilburn, chap. 8 ; chacun avec son mode autonome, son mode classe au TBI, sa feuille de recherche et sa fiche."]
      ].map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>"; }).join("") + "</tbody></table></section>" +
      '<div class="f-deux"><section><h2>Les erreurs à guetter</h2><ul>' + li(["Lire le nombre de graduations au lieu de la valeur (graduations de 2, 5 ou 10).", "Lire la barre voisine : suivre la ligne avec la règle ou le doigt.", "Une valeur entre deux graduations : chercher le nombre du milieu.", "Prendre toutes les données d’un problème, même celle qui ne sert pas."]) + "</ul></section>" +
      "<section><h2>Pour prolonger en classe</h2><ul>" + li(["Construire un graphique avec les données de la classe (sport préféré, transport, anniversaires par mois), en lien avec «\u00a0Questionner le monde\u00a0».", "Comparer un tableau et un graphique : lequel permet de voir plus vite le plus grand ?"]) + "</ul></section></div></article>";
  }

  /* fiche enseignante de la séquence « Mesurer des masses » (D-112) */
  function ficheMasses() {
    var li = function (a) { return a.map(function (x) { return "<li>" + x + "</li>"; }).join(""); };
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#ens-sequences">← Séquences d’apprentissage</a><a class="coco-btn coco-btn--secondaire" href="#lecon-masses">La leçon</a><a class="coco-btn coco-btn--secondaire" href="#exos-masses">Fiche d’exercices</a><a class="coco-btn coco-btn--secondaire" href="#seq-masses">Voir la séquence</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche m-maths"><small>Maths · Grandeurs et mesures (masses) · Cycle 2, CE2, niveau de maîtrise 3</small><h1>Mesurer des masses</h1>' +
      '<p class="f-q">Objectif : « ' + esc(C.masses.objectif.fr) + " »</p>" +
      '' +
      encadreProgramme("masses") +
      '<section><h2>Les séances et les activités du site</h2><table class="f-table"><thead><tr><th>Séance</th><th>Objectif</th><th>Sur le site</th></tr></thead><tbody>' + [
        ["Séance 1", "Instruments et unités : on mesure une masse avec une balance ; le gramme, le kilogramme, la tonne ; choisir l’unité qui convient en s’appuyant sur un repère (trombone 1 g, paquet de sucre 1 kg, petite voiture environ 1 t).", "Revoir la leçon (blocs 1 et 2) · Je me rappelle · Quelle unité ? · Problème ouvert « L’étiquette effacée »"],
        ["Séances 2 et 3", "1 kg = 1 000 g et 1 t = 1 000 kg : exprimer une même masse avec différentes unités ; problèmes de masse.", "Revoir la leçon (bloc 3) · C’est pareil que… · Problème ouvert « Le panier d’un kilo »"],
        ["Séance 4", "Comparer et ranger des masses écrites avec des unités différentes ; résoudre des problèmes.", "Le plus lourd · Problèmes de masses"],
        ["Séance 5", "Évaluation des objectifs de la séquence.", "Fiche d’exercices (corrigé à part, correction au TBI)"]
      ].map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>"; }).join("") + "</tbody></table></section>" +
      '<div class="f-deux"><section><h2>Les erreurs à guetter</h2><ul>' + li([
        "Pas de repère pour le gramme ou pour la tonne (« un chat de 5 g », « une voiture de 5 kg ») : revenir au trombone, au paquet de sucre, à la petite voiture.",
        "Plus c’est gros, plus c’est lourd : la taille confondue avec la masse (un ballon de baudruche, une boule de pétanque).",
        "1 kg lu comme 1 g dans une addition (« sucre + riz = 501 ») : écrire toutes les masses en grammes avant de calculer.",
        "Comparer les nombres sans regarder l’unité (« 900 g est plus lourd que 2 kg, car 900 > 2 ») : écrire les deux masses dans la même unité.",
        "« 1 kg 500 g = 1 005 g » : 1 kg, c’est 1 000 g, puis on ajoute les 500 g."]) + "</ul></section>" +
      "<section><h2>Conseils d’utilisation</h2><ul>" + li([
        "Les élèves soupèsent avant de calculer : un paquet de sucre de 1 kg et un trombone circulent dans la classe pendant la séance 1.",
        "Toutes les activités existent en français et en anglais britannique (grams, kilograms, tonnes). En anglais, « Je retiens » est une traduction de GM8, en attendant une leçon anglaise.",
        "La fiche d’exercices porte un numéro : le même numéro redonne les mêmes exercices, pour corriger au TBI.",
        "Le site à la maison reste facultatif : jamais de devoir écrit (art. 34)."]) + "</ul></section></div>" +
      "<section><h2>Pour prolonger en classe</h2><ul>" + li([
        "Peser de vrais objets avec la balance de Roberval et des masses marquées, puis avec une balance digitale (repères : « il mesure une masse en kilogrammes et grammes ; utilise un instrument adapté »).",
        "Encadrer une masse par deux nombres entiers d’unités (« ce cartable pèse entre 2 kg et 3 kg ») : ce repère n’est pas encore travaillé sur le site.",
        "La moitié de 1 kg, c’est 500 g ; 2 kg = 2 × 1 000 g (repères du niveau 3)."]) + "</ul></section>" +
      '<p class="f-source">Sources : programmation périodique P5 de la classe, leçon GM8 de la classe, programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, mathématiques, p. 13 et 15), Sullivan & Lilburn, « La masse », p. 78.</p></article>';
  }
  /* fiches enseignantes des séquences, même modèle que « Mesurer des masses » (D-112) : D-115 */
  function ficheSeq(o) {
    var li = function (a) { return a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""); }, cls = o.mat === "francais" ? "m-francais" : "m-maths";
    var liens = [["La leçon", "#lecon-" + o.seq], ["Fiche d’exercices", "#exos-" + o.seq]].concat(o.tbi ? [["Au TBI", o.tbi]] : []).concat([["Voir la séquence", "#seq-" + o.seq]]);
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#ens-sequences">← Séquences d’apprentissage</a>' + liens.map(function (l) { return '<a class="coco-btn coco-btn--secondaire" href="' + l[1] + '">' + l[0] + "</a>"; }).join("") + '<button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche ' + cls + '"><small>' + esc(o.dom) + " · Cycle 2, CE2, niveau de maîtrise 3</small><h1>" + esc(tr(C[o.seq].titre)) + "</h1>" +
      '<p class="f-q">Objectif : « ' + esc(C[o.seq].objectif.fr) + " »</p>" + encadreProgramme(o.prog) +
      '<section><h2>Les séances et les activités du site</h2><table class="f-table"><thead><tr><th>Séance</th><th>Objectif</th><th>Sur le site</th></tr></thead><tbody>' +
      o.seances.map(function (r) { return "<tr><th>" + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>"; }).join("") + "</tbody></table></section>" +
      '<div class="f-deux"><section><h2>Les erreurs à guetter</h2><ul>' + li(o.erreurs) + "</ul></section><section><h2>Conseils d’utilisation</h2><ul>" + li(o.conseils.concat(["Le site à la maison reste facultatif : jamais de devoir écrit (art. 34)."])) + "</ul></section></div>" +
      (o.extra || "") + "<section><h2>Pour prolonger en classe</h2><ul>" + li(o.prolonger) + "</ul></section>" + '<p class="f-source">' + esc(o.sources) + "</p></article>";
  }
  function ficheVerbe() {
    return ficheSeq({ seq: "verbe", mat: "francais", prog: "verbe", dom: "Français · Étude de la langue (grammaire et conjugaison)",
      source: "Progression de français de la classe : n° 4 « Le verbe ». Leçon de classe : CONJ2 « Le verbe » (2023). Pas de programmation par période pour le français : les séances ci-dessous sont proposées.",
      seances: [
        ["Séance 1", "Découvrir : le verbe exprime un état ou une action ; il change selon le temps de la phrase.", "Revoir la leçon (cartes « état / action », hier · aujourd’hui · demain) · Le verbe se cache (avec « Je me rappelle »)"],
        ["Séance 2", "Trouver le verbe conjugué avec la forme négative : il est entre ne et pas.", "Revoir la leçon (la machine ne … pas) · Chasse aux verbes"],
        ["Séance 3", "Réinvestir : trouver tous les verbes conjugués d’un court texte.", "Les verbes du texte"],
        ["Séance 4", "Évaluation des objectifs de la séquence.", "Fiche d’exercices (corrigé à part, correction au TBI)"]],
      erreurs: ["Prendre le sujet ou un nom pour le verbe (« la pluie ») : faire changer le moment de la phrase, le mot qui change est le verbe.", "Ne pas reconnaître un verbe d’état (« est », « semble ») : rappeler qu’un verbe peut exprimer un état, pas seulement une action.", "Placer ne … pas autour d’un autre mot que le verbe : relire la phrase à voix haute, elle doit rester correcte.", "Avec ne devant une voyelle : « n’ », comme dans la leçon GRAM3."],
      conseils: ["Code des leçons : le verbe en rouge ; ne et pas dans des bulles rouges.", "En mode anglais, les consignes passent en anglais mais les phrases restent en français.", "La fiche d’exercices porte un numéro : le même numéro redonne les mêmes exercices, pour corriger au TBI."],
      prolonger: ["Transformer des phrases de la vie de la classe (hier, aujourd’hui, demain) et entourer le mot qui change.", "Relier à la leçon suivante de la progression : l’infinitif du verbe (CONJ3)."],
      sources: "Sources : progression de français de la classe, leçon CONJ2, programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, français, p. 31 et 33)." });
  }
  function ficheDivision() {
    return ficheSeq({ seq: "division", mat: "maths", prog: "division", dom: "Maths · Nombres et calculs",
      source: "Programmation de maths de la classe : période 5, séquence 3 « Le partage et la division en ligne », semaines 3 et 4 (du 9 au 20 novembre 2026). Leçons de classe : CAL7 « Diviser : grouper ou partager » et CAL8 « La division en ligne avec reste » (2023). Problèmes ouverts de l’outil de la collègue, adaptés.",
      seances: [
        ["Séances 1 à 3", "Partager en parts égales ; quotient et reste.", "Revoir la leçon (grouper, partager, avec reste) · Je me rappelle (tables) · Grouper ou partager · Problème ouvert « Les coquillages de Nina »"],
        ["Séances 2 à 5", "Groupement ou partage ; division sans reste.", "Calcule · Problème ouvert « Les sachets de letchis »"],
        ["Séance suivante", "Écrire la division avec reste : 23 = (4 × 5) + 3 ; le vocabulaire (dividende, diviseur, quotient, reste).", "Avec un reste"],
        ["Dernière séance", "Évaluation des objectifs de la séquence.", "Fiche d’exercices (corrigé à part, correction au TBI)"]],
      erreurs: ["Un reste plus grand que le diviseur (« 23 = (4 × 4) + 7 ») : on peut encore faire un groupe ; le reste est toujours plus petit que le diviseur.", "Confondre grouper et partager : se demander « combien de groupes ? » ou « combien dans chaque part ? ».", "Oublier le reste dans l’égalité : vérifier en recalculant (4 × 5) + 3.", "Inverser dividende et diviseur dans « 23 : 4 »."],
      conseils: ["La classe ne pose pas la division au CE2 : division en ligne seulement.", "Écriture de la classe avec les parenthèses : 43 = (5 × 8) + 3.", "Les tables de multiplication sont le premier outil : « Je me rappelle » les fait revoir."],
      prolonger: ["Manipuler (jetons, coquillages, letchis) avant d’écrire l’égalité.", "Problèmes « quotient + 1 » (« 23 élèves, des voitures de 4 places : combien de voitures ? ») : repère du niveau 3, pas encore sur le site."],
      sources: "Sources : programmation périodique P5 de la classe, leçons CAL7 et CAL8 de la classe, programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, mathématiques, p. 7 et 11)." });
  }
  function ficheMonnaie() {
    return ficheSeq({ seq: "monnaie", mat: "maths", prog: "monnaie", dom: "Maths · Grandeurs et mesures (prix)",
      source: "Progression de maths de la classe : grandeurs et mesures, « 2. prix ». Leçon de classe : GM1 « La monnaie » (2023 ; pièces de 5 à 200 F, billets de 500 à 10 000 F). Pas de programmation par période reçue pour cette séquence : les séances ci-dessous sont proposées.",
      seances: [
        ["Séance 1", "Connaître les billets et les pièces de la monnaie calédonienne ; compter une somme.", "Revoir la leçon (bloc 1) · Je me rappelle (décomposer un nombre) · Combien d’argent ?"],
        ["Séance 2", "Décomposer une somme pour payer le prix exact.", "Revoir la leçon (bloc 2) · Paie le prix exact · Problème ouvert « Le jus à 100 F »"],
        ["Séance 3", "Calculer une dépense et la monnaie rendue.", "Au marché · Problème ouvert « Au marché »"],
        ["Séance 4", "Évaluation des objectifs de la séquence.", "Fiche d’exercices (corrigé à part, correction au TBI)"]],
      erreurs: ["Compter les pièces au lieu de leur valeur (« 3 pièces, donc 3 F »).", "Commencer par les petites pièces et se perdre : commencer par les plus gros billets et les plus grosses pièces.", "Rendre la monnaie en ajoutant au lieu de soustraire : vérifier que prix + monnaie rendue = somme donnée.", "Chercher des pièces de 1 F ou de 2 F : elles ne circulent plus."],
      conseils: ["Les pièces et billets sont ceux de la leçon GM1 : 5, 10, 20, 50, 100, 200 F ; 500, 1 000, 5 000, 10 000 F.", "Les fruits du marché sont en étiquettes écrites, en attendant les illustrations de l’enseignante.", "La fiche d’exercices porte un numéro : le même numéro redonne les mêmes exercices, pour corriger au TBI."],
      prolonger: ["Jouer à la marchande avec de la monnaie factice et les étiquettes de prix du marché.", "Relier aux nombres jusqu’à 9 999 : décomposer 6 875 F en milliers, centaines, dizaines et unités."],
      sources: "Sources : progression de maths de la classe, leçon GM1, programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, mathématiques, p. 12 et 17)." });
  }
  function ficheDigitale() {
    return ficheSeq({ seq: "digitale", mat: "maths", prog: "digitale", tbi: JEU_DIGITAL, dom: "Maths · Grandeurs et mesures (durées)",
      source: "Programmation de maths de la classe : période 5, séquence 1, semaine 1 (du 26 au 30 octobre 2026). Leçon de classe : GM5 « Lire l’heure digitale ». Jeux collectifs « L’heure à l’ardoise » (séances 1 à 3), création de la collègue Teacher Nadège, adaptés avec son accord ; problèmes ouverts de son outil.",
      seances: [
        ["Séance 1", "1 journée = 24 h (2 × 12 h) ; 6 h du soir = 18 h.", "Au TBI (séance 1 de « L’heure à l’ardoise ») · Revoir la leçon · Je me rappelle · Matin ou après-midi ? · Deux façons de dire l’heure · Problème ouvert « L’heure magique »"],
        ["Séances 2 et 3", "Lire et dire l’heure pile et et demie (1 h = 60 min), puis et quart et moins le quart (un quart d’heure = 15 min).", "Au TBI (séances 2 et 3) · Lis le réveil"],
        ["Séance 4", "Calculer une heure de fin quand on connaît le début et la durée.", "Ma journée · Problème ouvert « La demi-heure de lecture »"],
        ["Séance 5", "Évaluation des objectifs de la séquence.", "Fiche d’exercices (corrigé à part, correction au TBI)"]],
      erreurs: ["Lire 18:00 « six heures » sans dire « du soir » : rappeler les deux tours du cadran (+12 h).", "Ajouter 12 dans le mauvais sens (14:15 → 26:15) : le matin va de 0 h à 12 h, l’après-midi et le soir de 12 h à 24 h.", "« et demie » pour 30 minutes, mais « et demi » après midi et minuit.", "Une durée qui dépasse l’heure (9:45 + 30 min = 9:75) : après 59 minutes, on passe à l’heure suivante."],
      conseils: ["Code des leçons : les heures en rouge, les minutes en bleu.", "L’écriture de la classe : « 6h30 » dans les phrases, « 6:30 » sur le réveil, comme la leçon GM5.", "« L’heure à l’ardoise » reste en français ; les activités du site existent aussi en anglais (« noon », a.m. / p.m.)."],
      prolonger: ["L’emploi du temps de la classe : relever les heures de la journée et les écrire de deux façons.", "Relier à la séquence suivante : lire l’heure à aiguilles (P5, séquence 2)."],
      sources: "Sources : programmation périodique P5 de la classe, leçon GM5 de la classe, programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, mathématiques, p. 16 et 17)." });
  }


  /* ---------- Maths : lire l'heure à aiguilles (module du v0 repris et rendu bilingue : D-64 à D-67) ---------- */
  var HE = window.COCO_HEURE;
  var JEUX_HEURE = {
    rappel: { perso: "adi", etape: 1, fr: "Je me rappelle", en: "I remember", dfr: "Je retrouve ce que je sais sur l'heure digitale et les durées.", den: "I remember what I know about digital time and durations." },
    aig: { perso: "waeko", etape: 1, fr: "Heures ou minutes ?", en: "Hours or minutes?", dfr: "Je trouve l’aiguille des heures et l’aiguille des minutes.", den: "I can find the hour hand and the minute hand." },
    lire: { perso: "leo", etape: 1, fr: "Lis l'horloge", en: "Read the clock", dfr: "Je lis les heures piles, les demi-heures et les quarts d'heure.", den: "I read o’clock, half past, quarter past and quarter to.", niv: [1, 2, 3] },
    lire2: { perso: "leo", etape: 2, fr: "Lis les minutes", en: "Read the minutes", dfr: "Je lis les minutes de 5 en 5, jusqu'à « moins cinq ».", den: "I read the minutes in fives, up to “five to”.", niv: [4, 5] },
    regle: { perso: "tao", etape: 2, fr: "Règle l'horloge", en: "Set the clock", dfr: "Je place les aiguilles sur l'heure demandée.", den: "I move the hands to show the time." },
    hr: { perso: "sari", etape: 2, fr: "Quelle heure est-il ?", en: "What time is it?", dfr: "J'écris l'heure du matin et celle de l'après-midi.", den: "I write the time in the morning and in the afternoon." },
    mem: { perso: "mei", etape: 2, fr: "Memory des heures", en: "Time pairs", dfr: "Je retrouve les paires : une horloge et son heure écrite.", den: "I match each clock with its time in words." },
    prob: { perso: "dylan", etape: 3, fr: "Problèmes d'horloge", en: "Clock problems", dfr: "Je résous un problème avec l'heure.", den: "I solve a problem about time." }
  };
  var ETAPES_HEURE = { 1: "decouvre", 2: "entraine", 3: "reinvestis" };
  var HG = null, LH = { h: 4, m: 45 };
  function heDig(h, m) { return '<span class="hr-h">' + HE.H12(h) + '</span>:<span class="hr-m">' + HE.pad(m) + "</span>"; }
  function heDire(h, m) { return HE.cap(langue === "en" ? HE.direEn(h, m) : HE.direFr(h, m)); }
  function heDireMin(h, m) { return langue === "en" ? HE.direEn(h, m) : HE.direFr(h, m); }
  function heEtiq(x, st) { return HE.etiquette(x[0], x[1], st || "moins", langue); }
  function heSuite(dernier) { return '<button class="coco-btn coco-btn--grand" type="button" data-action="h-suite">' + (dernier ? (langue === "en" ? "See my score" : "Voir mon score") : t("suivant")) + "</button>"; }
  function heDemarrer(jeu) {
    var J = JEUX_HEURE[jeu];
    HG = { jeu: jeu, i: 0, score: 0, rep: false, choix: -1, msg: "", essais: 0, fin: false };
    if (jeu === "rappel") HG.qs = HE.RAPPEL;
    else if (jeu === "aig") HG.qs = HE.questionsAiguille();
    else if (jeu === "lire" || jeu === "lire2") { HG.niv = J.niv.length === 1 ? J.niv[0] : null; HG.n = 6; if (HG.niv) HG.cur = HE.questionLire(HG.niv); }
    else if (jeu === "regle") { HG.qs = HE.heuresVariees(5); HG.h = 12; HG.m = 0; }
    else if (jeu === "hr") { HG.qs = HE.heuresVariees(6); HG.v = {}; }
    else if (jeu === "mem") { HG.cartes = HE.memory(); HG.ouvertes = []; HG.trouvees = []; HG.coups = 0; }
    else if (jeu === "prob") HG.qs = HE.PROBLEMES;
  }
  function heNombre(jeu) { return jeu === "lire" || jeu === "lire2" ? HG.n : jeu === "mem" ? 6 : HG.qs.length; }
  function pageSequenceHeure() {
    var s = C.heure, m = MATIERE.maths, en = langue === "en";
    var cartes = Object.keys(JEUX_HEURE).map(function (id) {
      var J = JEUX_HEURE[id];
      return carte("maths", J.etape + " · " + t(ETAPES_HEURE[J.etape]), en ? J.en : J.fr, en ? J.den : J.dfr, J.perso, "heure-" + id);
    }).join("") + cartesPO("heure");
    return barre("maths") + '<section class="entete m-maths"><img src="' + IMG(m.perso) + '" alt=""><div><h1>' + esc(tr(s.titre)) + "</h1><p>" + esc(tr(m.nom)) + " · " + (en ? "Measures" : "Grandeurs et mesures") + "</p></div></section>" +
      '<p class="objectif m-maths">' + t("objectif") + " <b>" + esc(tr(s.objectif)) + "</b></p>" +
      '<div class="coco-row"><a class="coco-btn coco-btn--secondaire" href="#lecon-heure"><img src="' + PICTO("ampoule") + '" alt="">' + t("lecon") + "</a>" + boutonExos("heure") + "</div>" +
      '<section class="etapes">' + cartes + "</section>";
  }
  /* ---------- la leçon (récap interactif du v0) ---------- */
  function heSortie() {
    var h = LH.h, m = LH.m, en = langue === "en", mo = HE.H12(h) % 12, ap = mo + 12, ex = "";
    if (!en && m === 45) ex = '<p class="hr-rem">Il reste un quart d’heure (15 min) avant ' + HE.H12(h + 1) + " h.</p>";
    if (!en && m > 30 && m !== 45) ex = '<p class="hr-rem">En digital, on lit aussi : ' + (HE.H12(h) === 1 ? "une heure" : ["douze", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze"][HE.H12(h) % 12] + " heures") + " " + { 35: "trente-cinq", 40: "quarante", 50: "cinquante", 55: "cinquante-cinq" }[m] + ".</p>";
    var am = en ? "a.m.: " + mo + ":" + HE.pad(m) + " · p.m.: " + ap + ":" + HE.pad(m) + " (add 12 hours)." : "Le matin : " + mo + ":" + HE.pad(m) + ". L’après-midi ou le soir : " + ap + ":" + HE.pad(m) + " (on ajoute 12 h).";
    return '<p class="hr-dig">' + heDig(h, m) + '</p><p class="hr-dire">' + esc(typo(heDire(h, m))) + "</p>" + ex + '<p class="hr-rem">' + esc(typo(am)) + "</p>";
  }
  /* ---------- « Je retiens » en cartes animées (validé le 07/11/2026 avec deux exemples sur la carte 3 : D-81, D-86) ----------
     Une idée par carte, une animation qui montre l'idée, les phrases de la leçon GM5 mot pour mot, découpées. */
  var JR = { i: 0, tout: false };
  function jrHorloge(cls, inner) { return '<svg class="jr-svg ' + cls + '" viewBox="0 0 220 ' + (cls === "jr-haut-plus" ? 252 : 220) + '" aria-hidden="true">' + inner + "</svg>"; }
  function jrCadran(opts) {
    opts = opts || {}; var s = '<circle cx="110" cy="110" r="100" class="jr-cadran"/>';
    for (var k = 0; k < 60; k++) { var a = k * 6 * Math.PI / 180, r1 = k % 5 ? 92 : 86; s += '<line class="jr-grad' + (k % 5 ? "" : " jr-grad5") + '" x1="' + (110 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (110 - r1 * Math.cos(a)).toFixed(1) + '" x2="' + (110 + 99 * Math.sin(a)).toFixed(1) + '" y2="' + (110 - 99 * Math.cos(a)).toFixed(1) + '"/>'; }
    if (!opts.sansChiffres) for (var h = 1; h <= 12; h++) { var b = h * 30 * Math.PI / 180; s += '<text class="jr-chiffre" x="' + (110 + 70 * Math.sin(b)).toFixed(1) + '" y="' + (110 - 70 * Math.cos(b) + 7).toFixed(1) + '" text-anchor="middle">' + h + "</text>"; }
    return s;
  }
  function jrCartes(en) {
    var H = function (x) { return '<b class="hr-h">' + x + "</b>"; }, M = function (x) { return '<b class="hr-m">' + x + "</b>"; };
    var aiguilles = function (pa, gm) { return '<g class="' + pa + '"><line x1="110" y1="110" x2="110" y2="62" class="jr-pa"/></g><g class="' + gm + '"><line x1="110" y1="110" x2="110" y2="30" class="jr-gm"/></g><circle cx="110" cy="110" r="7" class="jr-axe"/>'; };
    var petit = function (x, cls) { return '<g transform="translate(' + x + ' 0)"><circle cx="70" cy="70" r="62" class="jr-cadran"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (h) { var a = h * 30 * Math.PI / 180; return '<line class="jr-grad5" x1="' + (70 + 54 * Math.sin(a)).toFixed(1) + '" y1="' + (70 - 54 * Math.cos(a)).toFixed(1) + '" x2="' + (70 + 61 * Math.sin(a)).toFixed(1) + '" y2="' + (70 - 61 * Math.cos(a)).toFixed(1) + '"/>'; }).join("") + '<g class="' + cls + '"><line x1="70" y1="70" x2="70" y2="30" class="jr-pa"/></g><circle cx="70" cy="70" r="5" class="jr-axe"/></g>'; };
    var ecran = function (x, y, h, m) { return '<g transform="translate(' + x + " " + y + ')"><rect width="96" height="46" rx="10" class="jr-ecran"/><text x="48" y="32" text-anchor="middle" class="jr-dig"><tspan class="jr-dh">' + h + '</tspan>:<tspan class="jr-dm">' + m + "</tspan></text></g>"; };
    var secteur = function (deb, fin, cls) { var a0 = (deb * 6 - 90) * Math.PI / 180, a1 = (fin * 6 - 90) * Math.PI / 180; return '<path class="' + cls + '" d="M110 110L' + (110 + 84 * Math.cos(a0)).toFixed(1) + " " + (110 + 84 * Math.sin(a0)).toFixed(1) + "A84 84 0 0 1 " + (110 + 84 * Math.cos(a1)).toFixed(1) + " " + (110 + 84 * Math.sin(a1)).toFixed(1) + 'Z"/>'; };
    return [
      { t: en ? "The hands" : "Les aiguilles",
        svg: jrHorloge("", jrCadran() + aiguilles("jr-tourne-pa", "jr-tourne-gm")),
        txt: en ? ["The " + H("short hand") + " shows the " + H("hours") + " (the 12 numbers).", "The " + M("long hand") + " shows the " + M("minutes") + " (the 60 marks)."]
          : ["La " + H("petite aiguille") + " indique les " + H("heures") + " (représentées par les 12 chiffres).", "La " + M("grande aiguille") + " indique les " + M("minutes") + " (représentées par les 60 graduations)."] },
      { t: en ? "One day: 24 hours" : "Une journée : 24 heures",
        svg: '<svg class="jr-svg jr-large" viewBox="0 0 320 200" aria-hidden="true">' + petit(0, "jr-tour1") + petit(180, "jr-tour2") +
          '<text x="70" y="168" text-anchor="middle" class="jr-leg">' + (en ? "1st turn of the face" : "1er tour du cadran") + '</text><text x="250" y="168" text-anchor="middle" class="jr-leg">' + (en ? "2nd turn of the face" : "2e tour du cadran") + '</text><text x="70" y="192" text-anchor="middle" class="jr-leg2">0h → 12h</text><text x="250" y="192" text-anchor="middle" class="jr-leg2">12h → 24h</text></svg>',
        txt: en ? ["In one day there are " + H("24 hours") + ".", "Morning: from 0:00 to 12:00.", "Afternoon and evening: from 12:00 to 24:00."]
          : ["Dans une journée, il y a " + H("24 heures") + ".", "Le matin : de 0h à 12h.", "L’après-midi et le soir : de 12h à 24h."] },
      { t: en ? "Two ways to say the time" : "Deux façons de dire l’heure",
        svg: '<svg class="jr-svg jr-large" viewBox="0 0 320 200" aria-hidden="true">' + ecran(10, 24, "4", "00") + '<g class="jr-fleche1"><path d="M116 47h70" class="jr-trait"/><path d="M178 39l10 8-10 8" class="jr-trait"/><text x="151" y="36" text-anchor="middle" class="jr-plus">+12h</text></g><g class="jr-apparait1">' + ecran(206, 24, "16", "00") + "</g>" +
          ecran(10, 120, "14", "15") + '<g class="jr-fleche2"><path d="M116 143h70" class="jr-trait"/><path d="M178 135l10 8-10 8" class="jr-trait"/><text x="151" y="132" text-anchor="middle" class="jr-moins">−12h</text></g><g class="jr-apparait2">' + ecran(206, 120, "2", "15") + "</g>" +
          '<text x="58" y="88" text-anchor="middle" class="jr-leg2">' + (en ? "in the afternoon" : "de l’après-midi") + '</text><text x="254" y="184" text-anchor="middle" class="jr-leg2 jr-apparait2">' + (en ? "in the afternoon" : "de l’après-midi") + "</text></svg>",
        txt: en ? ["We can say afternoon and evening times in " + H("two ways") + ".", "4:00 in the afternoon → 16:00 (+12 h)", "14:15 → 2:15 in the afternoon (−12 h)"]
          : ["On peut dire les heures de l’après-midi et du soir de " + H("deux façons") + ".", "4:00 de l’après-midi → 16:00 (+12h)", "14:15 → 2:15 de l’après-midi (−12h)"] },
      { t: en ? "One hour: 60 minutes" : "Une heure : 60 minutes",
        svg: jrHorloge("", jrCadran({ sansChiffres: true }) + secteur(0, 15, "jr-q jr-q1") + secteur(15, 30, "jr-q jr-q2") + secteur(30, 45, "jr-q jr-q3") + secteur(45, 60, "jr-reste") +
          '<text x="150" y="80" class="jr-qt jr-q1">15</text><text x="150" y="150" class="jr-qt jr-q2">30</text><text x="62" y="150" class="jr-qt jr-q3">45</text><text x="117" y="44" class="jr-qt">60</text><circle cx="110" cy="110" r="5" class="jr-axe"/>'),
        txt: en ? ["In one hour there are " + M("60 minutes") + ".", "15 min: " + M("quarter past") + " · 30 min: " + M("half past") + " · 45 min: " + M("quarter to"), "There is a quarter of an hour (15 min) left before the next hour."]
          : ["Dans une heure, il y a " + M("60 minutes") + ".", "15min : " + M("et quart") + " · 30min : " + M("et demie") + " · 45min : " + M("moins le quart"), "Il reste un quart d’heure (15min) avant l’heure suivante."] },
      { t: en ? "Extra: from “twenty-five to” to “five to”" : "En plus : de « moins 25 » à « moins 5 »", complement: true,
        svg: jrHorloge("jr-haut-plus", jrCadran() + '<g class="jr-pas"><line x1="110" y1="110" x2="110" y2="30" class="jr-gm"/></g><circle cx="110" cy="110" r="7" class="jr-axe"/>' +
          (en ? ["twenty-five to", "twenty to", "quarter to", "ten to", "five to"] : ["moins 25", "moins 20", "moins le quart", "moins 10", "moins 5"]).map(function (l, k) { return '<text x="110" y="244" text-anchor="middle" class="jr-cinq" style="animation-delay:' + (k * 1.6) + 's">' + l + "</text>"; }).join("")),
        txt: en ? ["After half past, we say how many minutes are " + M("left") + " before the next hour."] : ["Après la demie, on dit combien de minutes il " + M("manque") + " avant l’heure suivante."],
        note: en ? "Year 3 benchmarks (not in the class lesson)." : "Repères du niveau 3 (pas dans la leçon de classe)." }
    ];
  }
  var JR_SRC = jrCartes;
  /* Personnages des cartes « Je retiens » (D-108) : un compagnon des jeux de la séquence par carte, à côté du texte ;
     posture selon l'idée de la carte : présente (la notion arrive), réfléchit (observer), idée (méthode, astuce), content ou victoire (conclusion). */
  function jrPerso(k) { return (JR_SRC.persos || [])[k]; }
  function jrSection(src, mat) {
    JR_SRC = src || jrCartes;
    var cls = "jr m-" + (mat || "maths");
    var en = langue === "en", C2 = JR_SRC(en), n = C2.length; if (JR.i >= n) JR.i = 0; var c = C2[JR.i], P = jrPerso(JR.i);
    var pastilles = '<ol class="jr-pastilles">' + C2.map(function (x, k) { return '<li><button type="button" data-action="jr-aller" data-v="' + k + '" aria-current="' + (k === JR.i) + '" aria-label="' + esc(x.t) + '">' + (k + 1) + "</button></li>"; }).join("") + "</ol>";
    if (JR.tout) return '<section class="' + cls + '"><header class="jr-haut"><img src="' + POSE("coralie", "idee") + '" alt=""><h3>' + (en ? "I remember" : "Je retiens") + '</h3><button class="coco-btn coco-btn--secondaire" type="button" data-action="jr-tout">' + (en ? "Card by card" : "Carte par carte") + '</button></header><div class="jr-liste">' +
      C2.map(function (x, k) { var P = jrPerso(k); return '<div class="jr-mini' + (x.complement ? " jr-complement" : "") + '">' + x.svg + "<div>" + (P ? '<img class="jr-mini-perso" src="' + POSE(P[0], P[1]) + '" alt="">' : "") + "<b>" + esc(x.t) + "</b>" + x.txt.map(function (p) { return "<p>" + typo(p) + "</p>"; }).join("") + "</div></div>"; }).join("") + "</div></section>";
    return '<section class="' + cls + '"><header class="jr-haut"><img src="' + POSE("coralie", "idee") + '" alt=""><h3>' + (en ? "I remember" : "Je retiens") + "</h3>" + pastilles + "</header>" +
      '<div class="jr-carte' + (c.complement ? " jr-complement" : "") + '" key="' + JR.i + '"><div class="jr-illu">' + c.svg + '</div><div class="jr-texte' + (P ? " jr-avec-perso" : "") + '">' + (P ? '<img class="jr-perso" src="' + POSE(P[0], P[1]) + '" alt="">' : "") + "<div><h4>" + esc(typo(c.t)) + "</h4>" + c.txt.map(function (p, k) { return '<p class="jr-p" style="animation-delay:' + (0.3 + k * 0.5) + 's">' + typo(p) + "</p>"; }).join("") + (c.note ? '<p class="jr-note">' + esc(typo(c.note)) + "</p>" : "") + "</div></div></div>" +
      '<footer class="jr-bas"><button class="coco-btn coco-btn--secondaire" type="button" data-action="jr-prec"' + (JR.i === 0 ? " disabled" : "") + ">← " + (en ? "Back" : "Précédent") + '</button><button class="jr-lien" type="button" data-action="jr-tout">' + (en ? "See everything" : "Tout voir") + '</button><button class="coco-btn" type="button" data-action="jr-suiv"' + (JR.i === n - 1 ? " disabled" : "") + ">" + (en ? "Next" : "Suivant") + " →</button></footer></section>";
  }
  function actionJr(a, el) {
    var n = JR_SRC(langue === "en").length;
    if (a === "jr-aller") JR.i = +el.dataset.v;
    else if (a === "jr-prec") JR.i = Math.max(0, JR.i - 1);
    else if (a === "jr-suiv") JR.i = Math.min(n - 1, JR.i + 1);
    else if (a === "jr-tout") JR.tout = !JR.tout;
  }
  function pageLeconHeure(maquette) {
    var m = MATIERE.maths, en = langue === "en", B = function (l, v) { return '<button class="coco-btn coco-btn--secondaire" type="button" data-action="h-lec-m" data-v="' + v + '" aria-pressed="' + (LH.m === v) + '">' + l + "</button>"; };
    var boutons = en ? [["O’clock", 0], ["Quarter past", 15], ["Half past", 30], ["Quarter to", 45], ["Twenty-five to", 35], ["Twenty to", 40], ["Ten to", 50], ["Five to", 55]]
      : [["Heure pile", 0], ["Et quart", 15], ["Et demie", 30], ["Moins le quart", 45], ["Moins 25", 35], ["Moins 20", 40], ["Moins 10", 50], ["Moins 5", 55]];
    /* « Je retiens » : leçons GM5 (heure digitale, heure avec aiguilles) mot pour mot (D-70) ; la dernière carte est un complément (repères du niveau 3) */
    var cartes = en ? [["The hands", "The short hand shows the hours (the 12 numbers). The long hand shows the minutes (the 60 marks)."],
        ["One day", "In one day there are 24 hours. Morning: from 0:00 to 12:00 (the hour hand goes once round the clock face). Afternoon and evening: from 12:00 to 24:00 (the hour hand goes round a second time)."],
        ["Two ways to say the time", "We can say afternoon and evening times in two ways: 4:00 in the afternoon → 16:00 (+12 h); 7:30 in the evening → 19:30 (+12 h); 14:15 → 2:15 in the afternoon (−12 h); 18:45 → 6:45 in the evening (−12 h)."],
        ["Minutes", "In one hour there are 60 minutes. 15 min: quarter past. 30 min: half past. 45 min: quarter to. There is a quarter of an hour (15 min) left before the next hour."],
        ["Extra · Year 3 benchmarks: from twenty-five to … to five to", "After half past, we say how many minutes are left before the next hour: twenty-five to, twenty to, ten to, five to."]]
      : [["Les aiguilles", "La petite aiguille indique les heures (représentées par les 12 chiffres). La grande aiguille indique les minutes (représentées par les 60 graduations)."],
        ["La journée", "Dans une journée, il y a 24 heures. Le matin : de 0h à 12h (l’aiguille des heures fait un premier tour complet du cadran). L’après-midi et le soir : de 12h à 24h (l’aiguille des heures fait un deuxième tour complet du cadran)."],
        ["Deux façons de dire l’heure", "On peut dire les heures de l’après-midi et du soir de deux façons : 4:00 de l’après-midi → 16:00 (+12h) ; 7h30 du soir → 19h30 (+12h) ; 14:15 → 2:15 de l’après-midi (−12h) ; 18h45 → 6h45 du soir (−12h)."],
        ["Les minutes", "Dans une heure, il y a 60 minutes. 15min : et quart. 30min : et demie. 45min : moins le quart. Il reste un quart d’heure (15min) avant l’heure suivante."],
        ["Complément · repères du niveau 3 : de moins 25 à moins 5", "Après la demie, on dit combien de minutes il manque avant l’heure suivante : « moins vingt-cinq », « moins vingt », « moins dix », « moins cinq »."]];
    return barre("maths") + hautJeu(m, "seq-heure", { sous: tr(C.heure.titre), titre: t("lecon") }) +
      bulle("coralie", en ? "Turn the <b>long hand</b> with your finger and see how we say the time!" : "Fais tourner la <b>grande aiguille</b> avec ton doigt et regarde comment on dit l’heure !") +
      '<section class="zone m-maths hr-lecon"><div class="hr-code">' + (en ? '<p>The <b class="hr-h">short hand</b> shows the <b class="hr-h">hours</b> (the 12 numbers).</p><p>The <b class="hr-m">long hand</b> shows the <b class="hr-m">minutes</b> (the 60 marks).</p>'
        : '<p>La <b class="hr-h">petite aiguille</b> indique les <b class="hr-h">heures</b> (représentées par les 12 chiffres).</p><p>La <b class="hr-m">grande aiguille</b> indique les <b class="hr-m">minutes</b> (représentées par les 60 graduations).</p>') + "</div>" +
      '<div class="hr-rec"><div>' + HE.horloge(LH.h, LH.m, { drag: "lecon", out: true, en: en }) + '<p class="mi-indice">' + (en ? "Turn the long hand with your finger." : "Fais tourner la grande aiguille avec ton doigt.") + "</p></div>" +
      '<div><div id="hr-sortie">' + heSortie() + '</div><div class="coco-row hr-boutons">' + boutons.map(function (b) { return B(b[0], b[1]); }).join("") + '</div><div class="coco-row hr-boutons"><button class="coco-btn coco-btn--secondaire" type="button" data-action="h-lec-h" data-v="-1">' + (en ? "Hour −" : "Heure −") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="h-lec-h" data-v="1">' + (en ? "Hour +" : "Heure +") + "</button></div></div></div></section>" +
      (maquette ? jrSection() : '<section class="retiens m-maths"><img src="' + POSE("coralie", "idee") + '" alt=""><div><h3>' + (en ? "I remember" : "Je retiens") + '</h3><div class="hr-cartes">' + cartes.map(function (c, k) { return '<div' + (k === 4 ? ' class="hr-complement"' : "") + "><b>" + esc(typo(c[0])) + "</b><p>" + esc(typo(c[1])) + "</p></div>"; }).join("") + "</div></div></section>") +
      '<div class="coco-row"><a class="coco-btn" href="#seq-heure">' + t("versSequence") + "</a></div>";
  }
  /* ---------- les jeux ---------- */
  function heChoix(opts, juste, lib) {
    return '<div class="coco-row">' + opts.map(function (o, k) {
      var cls = "coco-etiquette hr-choix" + (HG.rep && k === juste ? " est-juste" : HG.rep && k === HG.choix ? " est-revoir" : "");
      return '<button class="' + cls + '" type="button" data-action="h-choix" data-v="' + k + '"' + (HG.rep ? " disabled" : "") + ">" + esc(typo(lib(o))) + "</button>";
    }).join("") + "</div>";
  }
  function jeuHeure(jeu) {
    var J = JEUX_HEURE[jeu], m = MATIERE.maths, en = langue === "en";
    if (!HG || HG.jeu !== jeu) heDemarrer(jeu);
    var n = heNombre(jeu), titre = { sous: tr(C.heure.titre) + " · " + J.etape + " · " + t(ETAPES_HEURE[J.etape]), titre: en ? J.en : J.fr };
    var haut = barre("maths") + hautJeu(m, "seq-heure", titre, jeu === "mem" ? "" : galets(n, HG.fin ? n : HG.i));
    if (HG.fin) return haut + heBilan();
    var consigne = "", zone = "", bas = "", dernier = HG.i === n - 1;
    if (jeu === "rappel") {
      var q = HG.qs[HG.i]; consigne = en ? "I remember what I learnt about <b>digital time</b>." : "Je me rappelle ce que j'ai appris sur l'<b>heure digitale</b>.";
      zone = '<p class="phrase">' + esc(typo(tr(q))) + "</p>" + heChoix(q.o, q.a, function (o) { return tr(o); });
    } else if (jeu === "aig") {
      var qa = HG.qs[HG.i];
      consigne = en ? "Tap the <b>" + (qa.t === "hh" ? "hour hand" : "minute hand") + "</b>." : "Touche l’<b>" + (qa.t === "hh" ? "aiguille des heures" : "aiguille des minutes") + "</b>.";
      zone = HE.horloge(qa.h, qa.m, { act: HG.rep ? "" : "h-aiguille", en: en, cls: HG.rep ? "montre-" + qa.t : "" });
    } else if (jeu === "lire" || jeu === "lire2") {
      if (!HG.niv) return haut + bulle(J.perso, en ? "Choose your <b>level</b>." : "Choisis ton <b>niveau</b>.") + '<section class="zone m-maths"><div class="coco-row">' + J.niv.map(function (v) { return '<button class="coco-btn" type="button" data-action="h-niv" data-v="' + v + '">' + (en ? "Level " : "Niveau ") + v + " · " + esc(tr(HE.NIVEAUX[v])) + "</button>"; }).join("") + "</div></section>";
      var c = HG.cur; consigne = en ? "What time is it?" : "Quelle heure est-il ?";
      zone = '<p class="mi-indice">' + (en ? "Level " : "Niveau ") + HG.niv + " · " + esc(tr(HE.NIVEAUX[HG.niv])) + "</p>" + HE.horloge(c.h, c.m, { en: en }) + heChoix(c.opts, c.bonne, function (o) { return heEtiq(o, c.s); });
    } else if (jeu === "regle") {
      var r = HG.qs[HG.i]; consigne = en ? "Set the clock to <b>" + esc(HE.direEn(r.h, r.m)) + "</b>." : "Règle l’horloge sur <b>" + esc(typo(HE.etiquette(r.h, r.m, "moins", "fr"))) + "</b>.";
      zone = '<p class="mi-indice">' + (en ? "Turn the long hand with your finger. Change the hour with the buttons." : "Fais tourner la grande aiguille avec ton doigt. Change l’heure avec les boutons.") + "</p>" + HE.horloge(HG.h, HG.m, { drag: HG.rep ? "" : "regle", en: en }) +
        (HG.rep ? "" : '<div class="coco-row"><button class="coco-btn coco-btn--secondaire" type="button" data-action="h-regle-h" data-v="-1">' + (en ? "Hour −" : "Heure −") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="h-regle-h" data-v="1">' + (en ? "Hour +" : "Heure +") + "</button></div>");
      bas = HG.rep ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="h-regle-ok">' + t("valider") + "</button>";
    } else if (jeu === "hr") {
      var x = HG.qs[HG.i], v = HG.v, champ = function (k) { return '<input type="text" inputmode="numeric" maxlength="2" autocomplete="off" data-h-champ="' + k + '" value="' + esc(v[k] || "") + '"' + (HG.rep ? " disabled" : "") + ' aria-label="' + k + '">'; };
      consigne = en ? "Read the clock. Write the time in the <b>morning</b>, then in the <b>afternoon or evening</b>." : "Lis l’horloge. Écris l’heure du <b>matin</b>, puis celle de l’<b>après-midi ou du soir</b>.";
      zone = HE.horloge(x.h, x.m, { en: en }) + '<div class="hr-saisie"><p><span>' + (en ? "morning (a.m.)" : "le matin") + "</span>" + champ("mh") + "<b>:</b>" + champ("mm") + "</p><p><span>" + (en ? "afternoon / evening (p.m.)" : "l’après-midi / le soir") + "</span>" + champ("ph") + "<b>:</b>" + champ("pm") + "</p></div>";
      bas = HG.rep ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="h-hr-ok">' + t("valider") + "</button>";
    } else if (jeu === "mem") {
      consigne = en ? "Find the pairs: a <b>clock</b> and its <b>time in words</b>." : "Retrouve les paires : une <b>horloge</b> et son <b>heure écrite</b>.";
      zone = '<p class="mi-indice">' + (en ? "Moves: " : "Coups : ") + HG.coups + '</p><div class="hr-mem">' + HG.cartes.map(function (cd, k) {
        var vu = HG.ouvertes.indexOf(k) >= 0 || HG.trouvees.indexOf(cd.p) >= 0;
        return '<button class="hr-carte' + (vu ? " up" : "") + (HG.trouvees.indexOf(cd.p) >= 0 ? " got" : "") + '" type="button" data-action="h-carte" data-v="' + k + '"' + (vu ? " disabled" : "") + ' aria-label="' + (vu ? esc(cd.t === "c" ? (en ? "Clock" : "Horloge") : HE.etiquette(cd.h, cd.m, "moins", langue)) : (en ? "Hidden card" : "Carte cachée")) + '">' +
          (vu ? (cd.t === "c" ? HE.horloge(cd.h, cd.m, { deco: true }) : esc(typo(HE.etiquette(cd.h, cd.m, "moins", langue)))) : "?") + "</button>";
      }).join("") + "</div>";
    } else if (jeu === "prob") {
      var p = HG.qs[HG.i]; consigne = en ? "Read the problem, look at the clock, then choose the answer." : "Lis le problème, regarde l’horloge, puis choisis la bonne réponse.";
      zone = '<p class="phrase">' + esc(typo(tr(p))) + "</p>" + HE.horloge(p.h, p.m, { en: en }) + heChoix(p.o, p.a, function (o) { return tr(o); });
    }
    return haut + bulle(J.perso, consigne, jeu === "rappel" ? "reflechit" : "presente") + '<section class="zone m-maths hr-zone">' + zone + "</section>" + '<div class="retour-zone">' + HG.msg + "</div>" +
      (bas ? '<footer class="jeu-bas"><span></span>' + bas + "</footer>" : "");
  }
  function heBilan() {
    var en = langue === "en", jeu = HG.jeu, n = heNombre(jeu), sc = HG.score;
    marquerFait("heure-" + jeu);
    var txt = jeu === "mem" ? (en ? "You found all the pairs in " + HG.coups + " moves." : "Tu as trouvé toutes les paires en " + HG.coups + " coups.")
      : jeu === "rappel" ? (en ? "You remembered " + sc + " out of " + n + ". Now, let’s read the clock!" : "Tu t’es rappelé " + sc + " réponse" + (sc > 1 ? "s" : "") + " sur " + n + ". Maintenant, lisons l’horloge !")
      : (en ? "You got " + sc + " out of " + n + " right first time." : "Tu as réussi " + sc + " sur " + n + " du premier coup.");
    return '<section class="bilan"><img src="' + POSE_BILAN(JEUX_HEURE[jeu].perso, jeu === "mem" ? n : sc, n) + '" alt=""><h2>' + t("fini") + "</h2>" + (jeu === "mem" || jeu === "rappel" ? "" : '<p class="mi-score">' + sc + " / " + n + "</p>") + "<p>" + esc(typo(txt)) + "</p>" +
      '<div class="coco-row">' + (jeu === "rappel" ? '<a class="coco-btn" href="#heure-aig">' + (en ? "Hours or minutes?" : "Heures ou minutes ?") + "</a>" : '<button class="coco-btn" type="button" data-action="h-rejouer">' + t("rejouer") + "</button>") +
      ((jeu === "lire" || jeu === "lire2") && JEUX_HEURE[jeu].niv.length > 1 ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="h-niveaux">' + (en ? "Change level" : "Changer de niveau") + "</button>" : "") +
      '<a class="coco-btn coco-btn--secondaire" href="#seq-heure">' + t("versSequence") + "</a></div></section>";
  }
  function heFinir(ok, txt) {
    var en = langue === "en", dernier = HG.i === heNombre(HG.jeu) - 1;
    HG.rep = true; if (ok && HG.essais === 0) HG.score++;
    HG.msg = ok ? retour("bravo", t("bravo"), txt, heSuite(dernier)) : retour("revoir", t("pasEncore"), txt, heSuite(dernier));
  }
  function actionHeure(a, el) {
    var en = langue === "en";
    if (a === "h-lec-m") { LH.m = +el.dataset.v; return; }
    if (a === "h-lec-h") { LH.h = ((LH.h + +el.dataset.v) % 12 + 12) % 12 || 12; return; }
    if (!HG) return;
    var jeu = HG.jeu;
    if (a === "h-rejouer") { heDemarrer(jeu); return; }
    if (a === "h-niveaux") { heDemarrer(jeu); return; }
    if (a === "h-niv") { HG.niv = +el.dataset.v; HG.i = 0; HG.score = 0; HG.cur = HE.questionLire(HG.niv); return; }
    if (a === "h-suite" && HG.rep) {
      if (HG.i >= heNombre(jeu) - 1) { HG.fin = true; return; }
      HG.i++; HG.rep = false; HG.choix = -1; HG.msg = ""; HG.essais = 0;
      if (jeu === "lire" || jeu === "lire2") HG.cur = HE.questionLire(HG.niv);
      if (jeu === "regle") { HG.h = 12; HG.m = 0; }
      if (jeu === "hr") HG.v = {};
      return;
    }
    if (a === "h-choix" && !HG.rep) {
      var k = +el.dataset.v; HG.choix = k;
      if (jeu === "rappel") { var q = HG.qs[HG.i]; heFinir(k === q.a, esc(typo(en ? q.len : q.lfr))); }
      else if (jeu === "prob") { var p = HG.qs[HG.i]; heFinir(k === p.a, k === p.a ? "" : (en ? "The answer is: " : "La bonne réponse est : ") + "<b>" + esc(typo(tr(p.o[p.a]))) + "</b>."); }
      else { var c = HG.cur, juste = k === c.bonne; heFinir(juste, "<b>" + esc(typo(juste ? heDire(c.h, c.m) : (en ? "It is " : "Il est ") + heDireMin(c.h, c.m))) + "</b>" + (juste ? "." : ". " + (en ? "Look at the short hand first, then the long hand." : "Regarde d’abord la petite aiguille, puis la grande."))); }
      return;
    }
    if (a === "h-aiguille" && !HG.rep) {
      var qa = HG.qs[HG.i], ok = el.dataset.v === qa.t;
      /* D-94 : on demande l'aiguille des heures ou des minutes (pas « petite » ou « grande ») ; le retour fait le lien avec la leçon GM5 */
      heFinir(ok, ok ? (qa.t === "hh" ? (en ? "Yes! The <b>short hand</b> shows the <b>hours</b>." : "Oui ! La <b>petite aiguille</b> indique les <b>heures</b>.") : (en ? "Yes! The <b>long hand</b> shows the <b>minutes</b>." : "Oui ! La <b>grande aiguille</b> indique les <b>minutes</b>."))
        : (qa.t === "hh" ? (en ? "This one shows the minutes. The hours are shown by the <b>short hand</b>." : "Celle-ci indique les minutes. Les heures sont indiquées par la <b>petite aiguille</b>.") : (en ? "This one shows the hours. The minutes are shown by the <b>long hand</b>." : "Celle-ci indique les heures. Les minutes sont indiquées par la <b>grande aiguille</b>.")));
      return;
    }
    if (a === "h-regle-h" && !HG.rep) { HG.h = ((HG.h + +el.dataset.v) % 12 + 12) % 12 || 12; HG.msg = ""; return; }
    if (a === "h-regle-ok" && !HG.rep) {
      var r = HG.qs[HG.i], bon = HG.h % 12 === r.h % 12 && HG.m === r.m;
      if (bon) heFinir(true, en ? "The clock is set correctly!" : "L’horloge est bien réglée !");
      else if (HG.essais >= 1) { HG.h = r.h; HG.m = r.m; heFinir(false, (en ? "Look: this is " : "Regarde : voici ") + "<b>" + esc(typo(heDireMin(r.h, r.m))) + "</b>."); }
      else { HG.essais++; HG.msg = retour("revoir", t("pasEncore"), HG.h % 12 !== r.h % 12 ? (en ? "Look at the <b>short hand</b>: is it on the right hour?" : "Regarde la <b>petite aiguille</b> : est-elle sur la bonne heure ?") : (en ? "Look at the <b>long hand</b>: count the minutes in fives." : "Regarde la <b>grande aiguille</b> : compte les minutes de 5 en 5.")); }
      return;
    }
    if (a === "h-hr-ok" && !HG.rep) {
      var x = HG.qs[HG.i], mo = x.h % 12, v = HG.v, nb = function (s) { var d = String(s || "").replace(/\D/g, ""); return d === "" ? NaN : +d; };
      var ok2 = nb(v.mh) === mo && nb(v.mm) === x.m && nb(v.ph) === mo + 12 && nb(v.pm) === x.m, sol = mo + ":" + HE.pad(x.m) + " · " + (mo + 12) + ":" + HE.pad(x.m);
      if (ok2) heFinir(true, (en ? "Morning: " : "Le matin : ") + mo + ":" + HE.pad(x.m) + ". " + (en ? "Afternoon or evening: " : "L’après-midi ou le soir : ") + (mo + 12) + ":" + HE.pad(x.m) + ".");
      else if (HG.essais >= 1) heFinir(false, (en ? "The answer is " : "La réponse est ") + "<b>" + sol + "</b>.");
      else { HG.essais++; HG.msg = retour("revoir", t("pasEncore"), en ? "Look carefully at the hands. For p.m., don’t forget to add 12 hours." : "Regarde bien les aiguilles. Pour l’après-midi, n’oublie pas d’ajouter 12 h."); }
      return;
    }
    if (a === "h-carte") {
      var i = +el.dataset.v, cd = HG.cartes[i];
      if (HG.verrou || HG.ouvertes.indexOf(i) >= 0 || HG.trouvees.indexOf(cd.p) >= 0) return;
      HG.ouvertes.push(i);
      if (HG.ouvertes.length === 2) {
        HG.coups++; var A = HG.cartes[HG.ouvertes[0]], B2 = HG.cartes[HG.ouvertes[1]];
        if (A.p === B2.p && A.t !== B2.t) { HG.trouvees.push(A.p); HG.ouvertes = []; if (HG.trouvees.length === 6) HG.fin = true; }
        else { HG.verrou = true; setTimeout(function () { if (HG && HG.jeu === "mem") { HG.ouvertes = []; HG.verrou = false; rendre(); } }, 1200); }
      }
    }
  }
  /* glisser la grande aiguille (leçon et « Règle l'horloge ») : de 5 en 5 minutes, l'heure suit */
  var heGlisse = null;
  function heGlisser(e) {
    var r = heGlisse.s.getBoundingClientRect(), vb = heGlisse.s.viewBox.baseVal, sx = r.width / vb.width, cx = r.left + (100 - vb.x) * sx, cy = r.top + (100 - vb.y) * sx;
    var ang = Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180 / Math.PI; if (ang < 0) ang += 360;
    var m = Math.round(ang / 30) * 5 % 60, st = heGlisse.k === "lecon" ? LH : HG; if (!st || m === st.m) return;
    if (st.m >= 45 && m <= 15) st.h = st.h % 12 + 1; else if (st.m <= 15 && m >= 45) st.h = (st.h + 10) % 12 + 1;
    st.m = m;
    heGlisse.s.querySelector(".hr-hh").setAttribute("transform", "rotate(" + ((st.h % 12) * 30 + m / 2) + " 100 100)");
    heGlisse.s.querySelector(".hr-mh").setAttribute("transform", "rotate(" + m * 6 + " 100 100)");
    if (heGlisse.k === "lecon") { var o = document.getElementById("hr-sortie"); if (o) o.innerHTML = heSortie(); document.querySelectorAll('[data-action="h-lec-m"]').forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.v === m)); }); }
    if (heGlisse.k === "regle" && HG && HG.msg) { HG.msg = ""; var z = document.querySelector(".retour-zone"); if (z) z.innerHTML = ""; }
  }
  document.addEventListener("pointerdown", function (e) { var s = e.target.closest && e.target.closest("svg[data-drag]"); if (!s || !s.dataset.drag) return; heGlisse = { s: s, k: s.dataset.drag }; try { s.setPointerCapture(e.pointerId); } catch (x) {} heGlisser(e); e.preventDefault(); });
  document.addEventListener("pointermove", function (e) { if (heGlisse) heGlisser(e); });
  document.addEventListener("pointerup", function () { heGlisse = null; });
  document.addEventListener("input", function (e) { var el = e.target; if (!el.dataset || el.dataset.hChamp === undefined || !HG) return; var v = el.value.replace(/\D/g, "").slice(0, 2); if (v !== el.value) el.value = v; HG.v[el.dataset.hChamp] = v; });

  /* ---------- au TBI : découverte guidée et ardoises (v0) ---------- */
  var TB = { part: "menu", step: 0, tot: 180, to: null, cfg: { lvl: 0, n: 8, t: 30 }, run: null, tid: null };
  function tbAller(d) {
    var n = Math.max(0, Math.min(HE.DECOUVERTE.length - 1, TB.step + d)); if (n === TB.step) return; TB.step = n;
    var s = HE.DECOUVERTE[n], cible = (s.h % 12) * 60 + s.m;
    if (d < 0) { TB.tot = cible; TB.to = null; return; }
    var cur = ((TB.tot % 720) + 720) % 720, av = ((cible - cur) % 720 + 720) % 720; TB.to = av ? { tot: TB.tot + av } : null;
  }
  function tbAnimer() {
    if (TB.part !== "dec" || !TB.to) return;
    var s = document.querySelector(".hr-tclk svg"), a = TB.tot, b = TB.to.tot; TB.tot = b; TB.to = null; if (!s) return;
    var hh = s.querySelector(".hr-hh"), mh = s.querySelector(".hr-mh"), t0 = performance.now(), D = Math.min(2600, 900 + (b - a) * 3);
    var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var f = function (now) { var k = reduit ? 1 : Math.min(1, (now - t0) / D), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, x = a + (b - a) * e;
      hh.setAttribute("transform", "rotate(" + x * 0.5 + " 100 100)"); mh.setAttribute("transform", "rotate(" + x * 6 + " 100 100)"); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  function tbMinuteur() {
    clearInterval(TB.tid); var r = TB.run; if (!r || !r.t || r.phase !== "ecrit") return;
    TB.tid = setInterval(function () {
      var r = TB.run; if (!r || TB.part !== "run" || r.phase !== "ecrit" || r.pause) return;
      r.reste = Math.max(0, r.reste - 0.25); var el = document.getElementById("tb-temps"), b = document.getElementById("tb-barre");
      if (el) el.textContent = Math.ceil(r.reste) + " s"; if (b) b.style.width = (r.reste / r.t * 100) + "%";
      if (r.reste <= 0) { clearInterval(TB.tid); r.phase = "leve"; rendre(); }
    }, 250);
  }
  function tbLancer() {
    var c = TB.cfg, qs = [];
    for (var i = 0; i < c.n; i++) { var lv = c.lvl || HE.rint(1, 5); qs.push({ h: HE.rint(1, 12), m: HE.pk(HE.NIVEAUX[lv].m) }); }
    TB.run = { i: 0, qs: qs, phase: "ecrit", t: c.t, reste: c.t, pause: false }; TB.part = "run"; tbMinuteur();
  }
  function tbSuite() {
    if (TB.part === "dec") { if (TB.step >= HE.DECOUVERTE.length - 1) TB.part = "menu"; else tbAller(1); }
    else if (TB.part === "run") { var r = TB.run;
      if (r.phase === "ecrit") { r.phase = "leve"; clearInterval(TB.tid); }
      else if (r.phase === "leve") r.phase = "voir";
      else { r.i++; if (r.i >= r.qs.length) { TB.part = "fin"; clearInterval(TB.tid); } else { r.phase = "ecrit"; r.reste = r.t; tbMinuteur(); } } }
  }
  function tbRetour() { clearInterval(TB.tid); if (TB.part === "menu") location.hash = "#ens-sequences"; else TB.part = "menu"; }
  function pageTbiHeure() {
    var en = langue === "en", P = TB.part, D = HE.DECOUVERTE;
    var titres = { menu: en ? "On the whiteboard: the whole class" : "Au TBI : toute la classe", dec: en ? "Discovering the time" : "Découverte de l’heure", setup: en ? "Show me your boards" : "Le jeu des ardoises", run: en ? "Boards up!" : "Ardoises levées !", fin: en ? "Well done, everyone!" : "Bravo la classe !" };
    var haut = '<header class="k-haut"><div class="coco-row"><button class="coco-btn coco-btn--secondaire" type="button" data-action="t-retour">← ' + (P === "menu" ? (en ? "Teacher area" : "Espace enseignante") : (en ? "Whiteboard menu" : "Menu du TBI")) + '</button><h1 class="hr-tbi-titre">' + titres[P] + '</h1></div><div class="coco-row">' +
      (P === "run" ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="t-pause">' + (TB.run && TB.run.pause ? (en ? "Resume" : "Reprendre") : "Pause") + "</button>" : "") +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="t-plein">' + (en ? "Full screen" : "Plein écran") + "</button>" + choixLangue() + "</div></header>";
    var corps = "";
    if (P === "menu") corps = bulle("coralie", en ? "We discover the time together, then we practise with our boards!" : "On découvre l’heure ensemble, puis on s’entraîne aux ardoises !") +
      '<section class="etapes"><button class="coco-carte coco-carte--maths hr-tbi-carte" type="button" data-action="t-dec"><span class="coco-carte-vignette">' + HE.horloge(3, 15, { deco: true }) + '</span><span><span class="coco-carte-etape">1 · ' + (en ? "To start" : "Pour commencer") + "</span><h3>" + titres.dec + "</h3><p>" + (en ? "An interactive lesson, step by step, with moving hands." : "Une leçon interactive, étape par étape, avec les aiguilles qui bougent.") + "</p></span></button>" +
      '<button class="coco-carte coco-carte--maths hr-tbi-carte" type="button" data-action="t-setup"><span class="coco-carte-vignette">' + HE.horloge(8, 45, { deco: true }) + '</span><span><span class="coco-carte-etape">2 · ' + (en ? "To practise" : "Pour s’entraîner") + "</span><h3>" + titres.setup + "</h3><p>" + (en ? "A clock, a board, a timer: everyone plays, then we correct together." : "Une horloge, une ardoise, un minuteur : toute la classe joue, puis on corrige.") + "</p></span></button></section>" +
      '<p class="po-note">' + (en ? "Space or right arrow: next. Left arrow: back. P: pause. F: full screen. Esc: back." : "Espace ou flèche droite : suite. Flèche gauche : retour. P : pause. F : plein écran. Échap : retour.") + "</p>";
    else if (P === "dec") { var s = D[TB.step];
      corps = '<div class="hr-tbi-dec"><div class="hr-tclk hl-' + (s.hl || "aucune") + '">' + HE.horloge(s.h, s.m, { out: !!s.out, en: en, ha: TB.tot * 0.5, ma: TB.tot * 6, extra: s.wedge ? HE.secteur(s.m, s.wedge) : "" }) + "</div>" + bulle("coralie", esc(typo(tr(s)))) + "</div>" +
        '<div class="hr-tbi-nav"><button class="coco-btn coco-btn--secondaire" type="button" data-action="t-prec"' + (TB.step === 0 ? " disabled" : "") + ">← " + (en ? "Back" : "Précédent") + '</button><ol class="coco-progression">' + D.map(function (_, k) { return '<li class="' + (k < TB.step ? "is-fait" : k === TB.step ? "is-encours" : "") + '"></li>'; }).join("") + '</ol><button class="coco-btn coco-btn--grand" type="button" data-action="t-suite">' + (TB.step === D.length - 1 ? (en ? "Finish" : "Terminer") : (en ? "Next step →" : "Étape suivante →")) + "</button></div>"; }
    else if (P === "setup") { var c = TB.cfg, B = function (g, v, l) { return '<button class="coco-btn coco-btn--secondaire" type="button" data-action="t-cfg" data-k="' + g + '" data-v="' + v + '" aria-pressed="' + (c[g] === v) + '">' + l + "</button>"; };
      var niv = [en ? "All levels" : "Tous les niveaux"].concat([1, 2, 3, 4, 5].map(function (k) { return tr(HE.NIVEAUX[k]); }));
      corps = bulle("margouille", en ? "Choose the settings, then start the game!" : "Choisis les réglages, puis lance le jeu !") + '<section class="zone m-maths hr-reglages"><h3>' + (en ? "Level" : "Niveau") + '</h3><div class="coco-row">' + niv.map(function (l, k) { return B("lvl", k, esc(l)); }).join("") +
        "</div><h3>" + (en ? "Number of questions" : "Nombre de questions") + '</h3><div class="coco-row">' + [5, 8, 10].map(function (k) { return B("n", k, k); }).join("") +
        "</div><h3>" + (en ? "Time to write" : "Temps pour écrire") + '</h3><div class="coco-row">' + [[0, en ? "No timer" : "Sans minuteur"], [15, "15 s"], [30, "30 s"], [45, "45 s"], [60, "1 min"]].map(function (x) { return B("t", x[0], x[1]); }).join("") +
        '</div><button class="coco-btn coco-btn--grand" type="button" data-action="t-lancer">' + (en ? "Let’s go!" : "C’est parti !") + "</button></section>"; }
    else if (P === "run") { var r = TB.run, q = r.qs[r.i], mm = q.m, droite;
      if (r.phase === "ecrit") droite = '<p class="hr-tbi-q">' + (en ? "Write the time on your board." : "Écris l’heure sur ton ardoise.") + "</p>" + (r.t ? '<div class="hr-tbi-barre"><i id="tb-barre" style="width:' + (r.reste / r.t * 100).toFixed(1) + '%"></i></div><p class="hr-tbi-temps" id="tb-temps">' + Math.ceil(r.reste) + " s</p>" : "");
      else if (r.phase === "leve") droite = '<p class="hr-tbi-q">' + (en ? "Boards up!" : "Ardoises levées !") + "</p>";
      else droite = '<p class="hr-tbi-rep">' + esc(typo(heDire(q.h, mm))) + '</p><p class="hr-dig">' + heDig(q.h, mm) + '</p><p class="hr-rem">' + (mm === 0 ? (en ? "The long hand is on the 12: it is exactly on the hour." : "La grande aiguille est sur le 12 : c’est l’heure pile.") : (en ? "The long hand is on the " + mm / 5 + ": " + mm / 5 + " × 5 = " + mm + " minutes." : "La grande aiguille est sur le " + mm / 5 + " : " + mm / 5 + " × 5 = " + mm + " minutes.")) + "</p>";
      corps = '<p class="mi-indice">' + t("question")(r.i + 1, r.qs.length) + '</p><div class="hr-tbi-run"><div class="hr-tclk">' + HE.horloge(q.h, mm, { en: en, extra: r.phase === "voir" && mm > 0 ? HE.secteur(mm, mm > 30 ? "left" : "el") : "" }) + "</div><div>" + droite +
        '<button class="coco-btn coco-btn--grand" type="button" data-action="t-suite">' + (r.phase === "ecrit" ? (en ? "Boards up" : "Ardoises levées") : r.phase === "leve" ? (en ? "Let’s correct" : "On corrige") : (en ? "Next question" : "Question suivante")) + " →</button></div></div>"; }
    else corps = '<section class="bilan"><img src="' + POSE("coralie", "victoire") + '" alt=""><h2>' + titres.fin + '</h2><div class="coco-row"><button class="coco-btn" type="button" data-action="t-lancer">' + t("rejouer") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="t-retour">' + (en ? "Whiteboard menu" : "Menu du TBI") + "</button></div></section>";
    return '<div class="hr-tbi">' + haut + corps + "</div>";
  }
  function actionTbi(a, el) {
    if (a === "t-dec") { TB.part = "dec"; TB.step = 0; TB.tot = 180; TB.to = null; }
    else if (a === "t-setup") TB.part = "setup";
    else if (a === "t-cfg") TB.cfg[el.dataset.k] = +el.dataset.v;
    else if (a === "t-lancer") tbLancer();
    else if (a === "t-suite") tbSuite();
    else if (a === "t-prec") tbAller(-1);
    else if (a === "t-retour") tbRetour();
    else if (a === "t-pause") { if (TB.run) TB.run.pause = !TB.run.pause; }
    else if (a === "t-plein") { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (x) {} }
  }
  document.addEventListener("keydown", function (e) {
    if (route() !== "tbi-heure") return; var tg = e.target; if (tg && /INPUT|TEXTAREA/.test(tg.tagName)) return;
    if (e.key === " " || e.key === "ArrowRight") { e.preventDefault(); tbSuite(); rendre(); }
    else if (e.key === "ArrowLeft" && TB.part === "dec") { e.preventDefault(); tbAller(-1); rendre(); }
    else if (e.key === "Escape") { tbRetour(); rendre(); }
    else if (e.key === "p" || e.key === "P") { if (TB.run) TB.run.pause = !TB.run.pause; rendre(); }
    else if (e.key === "f" || e.key === "F") actionTbi("t-plein");
  });
  /* ---------- fiches d'exercices à imprimer (D-94) : une par séquence, tirée au hasard, avec corrigé facultatif ---------- */
  var EXF = null;
  function boutonExos(seq) { return ensOuvert && ROUTES["exos-" + seq] ? '<a class="coco-btn coco-btn--secondaire" href="#exos-' + seq + '"><svg class="ex-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7h-3M7 14h10v7H7z"/></svg>' + (langue === "en" ? "Worksheet" : "Fiche d’exercices") + "</a>" : ""; }
  var EXOS = {
    heure: {
      seq: "seq-heure", matiere: "maths", titre: function () { return tr(C.heure.titre); },
      rappel: function (en) { return en ? "The <b class=\"hr-h\">short hand</b> shows the <b class=\"hr-h\">hours</b>. The <b class=\"hr-m\">long hand</b> shows the <b class=\"hr-m\">minutes</b>."
        : "La <b class=\"hr-h\">petite aiguille</b> indique les <b class=\"hr-h\">heures</b>. La <b class=\"hr-m\">grande aiguille</b> indique les <b class=\"hr-m\">minutes</b>."; },
      tirer: function () {
        var R = HE.rint, P = HE.pk, heures = HE.shuf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), k = 0, h = function () { return heures[k++ % 12]; };
        var lire = HE.shuf([[h(), 0], [h(), 30], [h(), 15], [h(), 45], [h(), P([5, 10, 20, 25])], [h(), P([35, 40, 50, 55])]]);
        var lettres = HE.shuf([[h(), 15], [h(), 30], [h(), 45]]);
        var dessin = HE.shuf([[h(), 0], [h(), 30], [h(), 15], [h(), 45], [h(), P([10, 20, 25, 35, 40, 50])]]).slice(0, 4);
        var plus = HE.shuf([13, 14, 15, 16, 17]).slice(0, 2), moins = HE.shuf([18, 19, 20, 21, 22]).slice(0, 2);
        return { lire: lire, lettres: lettres, dessin: dessin, conv: HE.shuf([{ s: "+", h: plus[0] }, { s: "+", h: plus[1] }, { s: "-", h: moins[0] }, { s: "-", h: moins[1] }]), pb: HE.PROBLEMES[R(0, HE.PROBLEMES.length - 1)] };
      },
      exos: function (d, en) {
        var dig = function (h, m) { return en ? HE.H12(h) + ":" + HE.pad(m) : HE.H12(h) + " h" + (m ? " " + HE.pad(m) : ""); };
        var mots = function (h, m) { return HE.cap((en ? HE.direEn(h, m) : HE.direFr(h, m)).replace(/ \(\d+ min\)$/, "")); };
        var clk = function (h, m, sans) { return HE.horloge(h, m, { deco: true, sans: sans, cls: "ex-clk" }); };
        var ligne = '<span class="ex-ligne"></span>';
        return [
          { c: en ? "Write the time shown on each clock." : "Écris l’heure indiquée par chaque horloge.",
            q: '<div class="ex-grille">' + d.lire.map(function (x) { return "<div>" + clk(x[0], x[1]) + '<p class="ex-rep">' + exT(String(HE.H12(x[0]))) + (en ? " : " : " h ") + exT(HE.pad(x[1])) + "</p></div>"; }).join("") + "</div>",
            r: d.lire.map(function (x) { return dig(x[0], x[1]); }).join(" · ") },
          { c: en ? "Write the time in words." : "Écris l’heure en lettres.",
            q: '<div class="ex-liste">' + d.lettres.map(function (x) { return '<div class="ex-ligne-clk">' + clk(x[0], x[1]) + "<p>" + (en ? "It is " : "Il est ") + exT((en ? HE.direEn(x[0], x[1]) : HE.direFr(x[0], x[1])).replace(/ \(\d+ min\)$/, ""), true) + ".</p></div>"; }).join("") + "</div>",
            r: d.lettres.map(function (x) { return mots(x[0], x[1]); }).join(" · ") },
          { c: en ? "Draw the hands." : "Dessine les aiguilles.",
            q: '<div class="ex-grille ex-quatre">' + d.dessin.map(function (x) { return "<div>" + exS(clk(x[0], x[1], true), clk(x[0], x[1])) + '<p class="ex-rep"><b>' + dig(x[0], x[1]) + "</b></p></div>"; }).join("") + "</div>",
            r: '<div class="ex-grille ex-quatre ex-petit">' + d.dessin.map(function (x) { return "<div>" + clk(x[0], x[1]) + "<p>" + dig(x[0], x[1]) + "</p></div>"; }).join("") + "</div>" },
          { c: en ? "Write the 24-hour time." : "Complète.",
            q: '<ul class="ex-conv">' + d.conv.map(function (x) {
              if (en) return x.s === "+" ? "<li>" + (x.h - 12) + " p.m. → " + exT(String(x.h)) + " : 00</li>" : "<li>" + x.h + ":00 → " + exT(String(x.h - 12)) + " p.m.</li>";
              return x.s === "+" ? "<li>" + (x.h - 12) + " h de l’après-midi, c’est " + exT(String(x.h)) + " h.</li>" : "<li>" + x.h + " h, c’est " + exT(String(x.h - 12)) + " h " + (x.h >= 18 ? "du soir" : "de l’après-midi") + ".</li>"; }).join("") + "</ul>",
            r: d.conv.map(function (x) { return x.s === "+" ? (en ? x.h + ":00" : x.h + " h") : (en ? (x.h - 12) + " p.m." : (x.h - 12) + " h"); }).join(" · ") },
          { c: en ? "Solve the problem." : "Résous le problème.",
            q: '<div class="ex-ligne-clk">' + clk(d.pb.h, d.pb.m) + "<div><p>" + esc(typo(tr(d.pb))) + "</p><p>" + (en ? "Answer: " : "Réponse : ") + exT(esc(typo(HE.cap(tr(d.pb.o[d.pb.a])))), true) + "</p></div></div>",
            r: esc(typo(HE.cap(tr(d.pb.o[d.pb.a])))) }
        ];
      }
    }
  };

  /* aides communes aux fiches (D-95) */
  var EXL = '<span class="ex-ligne"></span>', EXLL = '<span class="ex-ligne ex-long"></span>', EXLM = '<span class="ex-ligne ex-mot"></span>';
  /* place pour écrire : une réponse en lettres a une ligne plus longue qu’un nombre ou un signe ;
     la même longueur pour tous les mots, pour ne pas souffler la réponse par la taille de la ligne */
  function exMotLong(rep) { var t = String(rep == null ? "" : rep).replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, "x"); return /[A-Za-zÀ-ÿ]/.test(t); }
  /* correction au TBI (D-104) : sur la feuille, un trou est une ligne ; au TBI, c'est une case qu'on touche pour montrer la réponse.
     EXTBI vaut vrai pendant qu'on prépare la version TBI ; EXK numérote les cases dans l'ordre (toujours le même pour une fiche donnée). */
  var EXTBI = false, EXK = 0;
  function exVu(k) { return !!(EXF && EXF.vu && EXF.vu[k]); }
  function exT(rep, long, vide) {
    if (!EXTBI) return vide !== undefined ? vide : long ? EXLL : exMotLong(rep) ? EXLM : EXL;
    var k = EXK++, vu = exVu(k);
    return '<button type="button" class="tb-u tb-trou' + (long ? " tb-long" : "") + (vu ? " vu" : "") + '" data-action="ex-vu" data-k="' + k + '" aria-pressed="' + vu + '" aria-label="' + (vu ? "" : "Montrer la réponse") + '">' + (vu ? rep : "") + "</button>";
  }
  function exHM(html) { return '<span class="ex-courtes">' + html + "</span>"; } /* heures et minutes : deux lignes courtes */
  function exTe(rep) { return EXTBI ? exT(rep) : EXL; } /* une terminaison : ligne moyenne */
  function exC(html) { return '<span class="tb-cible">' + html + "</span>"; }
  function exG(html, marque, bloc) {
    if (!EXTBI) return html;
    var k = EXK++, vu = exVu(k), tag = bloc ? "div" : "span";
    return "<" + tag + ' role="button" tabindex="0" class="tb-u tb-grp tb-' + marque + (vu ? " vu" : "") + '" data-action="ex-vu" data-k="' + k + '" aria-pressed="' + vu + '">' + html + "</" + tag + ">";
  }
  function exS(vide, rep, inline) {
    if (!EXTBI) return vide;
    var k = EXK++, vu = exVu(k);
    return "<" + (inline ? "span" : "div") + ' role="button" tabindex="0" class="tb-u tb-swap' + (inline ? " tb-inline" : "") + (vu ? " vu" : "") + '" data-action="ex-vu" data-k="' + k + '" aria-pressed="' + vu + '">' + (vu ? rep : vide) + "</" + (inline ? "span" : "div") + ">";
  }
  /* même numéro de fiche = mêmes exercices : le hasard est rejoué à partir du numéro */
  function exHasard(n) { var a = n >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function exAvec(n, f) { var m = Math.random; Math.random = exHasard(n); try { return f(); } finally { Math.random = m; } }
  function exNouveauNum() { return 1000 + Math.floor(Math.random() * 9000); }
  function exMille(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function exPiece(v) { return v >= 500 ? '<span class="ex-billet">' + exMille(v) + " F</span>" : '<span class="ex-piece ex-piece--' + v + '">' + v + "<small>F</small></span>"; }
  function exNb(n) { return ["zéro", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt", "vingt et une", "vingt-deux", "vingt-trois", "vingt-quatre"][n]; }
  /* l'heure digitale en mots, comme la leçon GM5 (« Je me lève à 6h30. → six heures et demie ») */
  function exDigMots(h, m) {
    if (m === 45) { var s = (h + 1) % 24; return (s === 0 ? "minuit" : s === 12 ? "midi" : exNb(s) + (s === 1 ? " heure" : " heures")) + " moins le quart"; }
    var base = h === 0 ? "minuit" : h === 12 ? "midi" : exNb(h) + (h === 1 ? " heure" : " heures");
    return base + (m === 0 ? (h === 0 || h === 12 ? "" : " pile") : m === 15 ? " et quart" : m === 30 ? (h === 0 || h === 12 ? " et demi" : " et demie") : " " + m);
  }
  function exDig(h, m) { return '<span class="ex-dig">' + h + ":" + HE.pad(m) + "</span>"; }
  /* le verbe : trois moments de la même phrase (leçon CONJ2 : le verbe change selon le temps de la phrase) [PROPOSITION] */
  var EX_TEMPS = [["Léo", "jouait", "joue", "jouera", "au ballon."], ["Méi", "chantait", "chante", "chantera", "à l’école."], ["Il", "pleuvait", "pleut", "pleuvra", "sur Nouméa."],
    ["Nous", "étions", "sommes", "serons", "à la plage."], ["Kakou", "courait", "court", "courra", "dans la forêt."], ["Tehani", "mangeait", "mange", "mangera", "une mangue."], ["Les enfants", "nageaient", "nagent", "nageront", "dans le lagon."]];
  /* état ou action (leçon CONJ2 : état = être, sembler, paraître) */
  var EX_ETAT = [["Margouille est orange.", "E"], ["Le ciel semble gris.", "E"], ["Tao paraît fatigué.", "E"], ["La mer est calme.", "E"], ["Les mangues sont mûres.", "E"],
    ["Kakou court dans la forêt.", "A"], ["Wadra plonge dans le lagon.", "A"], ["Nina dessine un cagou.", "A"], ["Papi Tao pêche un poisson.", "A"], ["Vaka lance le ballon.", "A"]];
  /* phrases au présent avec un seul verbe, en plus de la « Chasse aux verbes » (6 phrases), pour ne jamais répéter une phrase sur la fiche [PROPOSITION] */
  var EX_PHRASES = [{ mots: ["Wadra", "nage", "dans", "le", "lagon."], v: 1, neg: "Wadra ne nage pas dans le lagon." }, { mots: ["Le", "vent", "souffle", "sur", "la", "plage."], v: 2, neg: "Le vent ne souffle pas sur la plage." },
    { mots: ["Nina", "lit", "un", "livre."], v: 1, neg: "Nina ne lit pas un livre." }, { mots: ["Les", "élèves", "chantent", "en", "classe."], v: 2, neg: "Les élèves ne chantent pas en classe." }, { mots: ["Le", "soleil", "brille."], v: 2, neg: "Le soleil ne brille pas." }];
  var EXOS2 = {
    verbe: {
      seq: "seq-verbe", matiere: "francais", titre: function () { return tr(C.verbe.titre); },
      rappel: function (en) { return en ? "To find the conjugated verb, I make the sentence negative: the verb is between <span class=\"coco-negation\">ne</span> and <span class=\"coco-negation\">pas</span>!"
        : "Pour trouver le verbe conjugué dans une phrase, je la mets à la <b>forme négative</b> : le verbe est entre <span class=\"coco-negation\">ne</span> et <span class=\"coco-negation\">pas</span> !"; },
      tirer: function () {
        var ch = HE.shuf(C.verbe.chasse.concat(EX_PHRASES));
        return { soul: ch.slice(0, 4), neg: ch.slice(4, 7), temps: HE.shuf(EX_TEMPS).slice(0, 2),
          etat: HE.shuf(HE.shuf(EX_ETAT.filter(function (x) { return x[1] === "E"; })).slice(0, 3).concat(HE.shuf(EX_ETAT.filter(function (x) { return x[1] === "A"; })).slice(0, 3))) };
      },
      exos: function (d, en) {
        var ph = function (x) { return x.mots.join(" "); };
        var nu = function (m) { return m.replace(/[.,!?…]+$/, ""); };
        var souligne = function (x) { return x.mots.map(function (m, j) { return j === x.v ? exC(esc(nu(m))) + esc(m.slice(nu(m).length)) : esc(m); }).join(" "); };
        var negEntoure = function (x) { var v = nu(x.mots[x.v]), i = x.neg.indexOf(" " + v + " "); return i < 0 ? esc(x.neg) : esc(x.neg.slice(0, i + 1)) + '<span class="tb-verbe">' + esc(v) + "</span>" + esc(x.neg.slice(i + 1 + v.length)); };
        return [
          { c: en ? "Underline the conjugated verb in each sentence." : "Souligne le verbe conjugué dans chaque phrase.",
            q: '<ol class="ex-fr ex-phrases ex-deux-col-ol">' + d.soul.map(function (x) { return "<li>" + exG(souligne(x), "soul") + "</li>"; }).join("") + "</ol>",
            r: d.soul.map(function (x) { return "<b>" + esc(x.mots[x.v]) + "</b>"; }).join(" · ") },
          { c: en ? "Write each sentence with ne … pas, then circle the verb." : "Écris chaque phrase avec ne … pas, puis entoure le verbe.",
            q: '<ol class="ex-fr ex-phrases ex-neg">' + d.neg.map(function (x) { return "<li>" + esc(ph(x)) + "<br>→ " + exT(negEntoure(x), true) + "</li>"; }).join("") + "</ol>",
            r: d.neg.map(function (x) { return esc(x.neg); }).join(" · ") },
          { c: en ? "Circle the word that changes. It is the verb." : "Entoure le mot qui change. C’est le verbe.",
            q: '<div class="ex-deux-temps">' + d.temps.map(function (x) { var s = vbSujet(x); return '<ul class="ex-fr ex-temps">' + [["Hier", 1], ["Aujourd’hui", 2], ["Demain", 3]].map(function (t) { return "<li>" + exG(t[0] + ", " + esc(s) + " " + exC(x[t[1]]) + " " + esc(x[4]), "cverbe") + "</li>"; }).join("") + "</ul>"; }).join("") + "</div>",
            r: d.temps.map(function (x) { return x[1] + ", " + x[2] + ", " + x[3]; }).join(" · ") },
          { c: en ? "State or action? Write S (state) or A (action)." : "État ou action ? Écris É ou A.",
            q: '<ul class="ex-fr ex-deux-col">' + d.etat.map(function (x) { return "<li>" + exS('<span class="ex-boite"></span>', '<span class="ex-boite tb-lettre">' + (en ? (x[1] === "E" ? "S" : "A") : (x[1] === "E" ? "É" : "A")) + "</span>", true) + " " + esc(x[0]) + "</li>"; }).join("") + "</ul>",
            r: d.etat.map(function (x) { return (en ? (x[1] === "E" ? "S" : "A") : (x[1] === "E" ? "É" : "A")); }).join(" · ") },
          { c: en ? "Make up a sentence with an action verb, then underline the verb." : "Invente une phrase avec un verbe d’action, puis souligne le verbe.",
            q: '<p class="ex-invente">' + EXLL + EXLL + "</p>", r: en ? "Answers will vary: check that the underlined word changes with yesterday / tomorrow." : "Réponses variées : vérifier que le mot souligné change avec « hier » et « demain »." }
        ];
      }
    },
    mots: {
      /* une seule famille (ou liste) de mots par fiche : on aborde une régularité à la fois (demande de l’enseignante, 10/11/2026) */
      seq: "seq-mots", matiere: "francais", titre: function () { return tr(C.mots.titre); }, optDefaut: "g1-1",
      rappel: function (en) { return en ? "Invariable words never change: we learn them by heart!" : "Les mots invariables ne changent jamais : on les apprend par cœur !"; },
      reglage: function (E, en) {
        var cur = moFamille(E.opt).id;
        return '<label class="ex-case">' + (en ? "Words worked on:" : "Mots travaillés :") + ' <select id="ex-liste">' + MO.GROUPS.map(function (g) {
          return '<optgroup label="' + esc(g.name) + '">' + MO.FAMS.filter(function (f) { return f.group.id === g.id; }).map(function (f) {
            return '<option value="' + f.id + '"' + (cur === f.id ? " selected" : "") + ">" + esc(moNom(f) + " : " + f.words.map(MO.plain).join(", ")) + "</option>"; }).join("") + "</optgroup>"; }).join("") + "</select></label>";
      },
      tirer: function (opt) { var T = moTirer(opt), P = moRepartir(T, 1);
        return { fam: moFam(T.fam), trous: T.pool.map(function (x) { return { m: x.m, h: MO.hiddenPart(x.m) }; }), phrases: P.trous, dictee: HE.shuf(T.pool), dicteePh: P.dictee }; },
      exos: function (d, en) { return moExos(d, en); }
    },
    monnaie: {
      seq: "seq-monnaie", matiere: "maths", titre: function () { return tr(C.monnaie.titre); },
      rappel: function (en) { return (en ? "The coins: " : "Les pièces : ") + "5 F, 10 F, 20 F, 50 F, 100 F, 200 F. " + (en ? "The notes: " : "Les billets : ") + "500 F, 1 000 F, 5 000 F, 10 000 F."; },
      tirer: function () {
        var P = PO.PIECES, bourse = function (n, billet) { var b = []; for (var i = 0; i < n; i++) b.push(HE.pk(P)); if (billet) b.push(HE.pk([500, 1000])); return b.sort(function (x, y) { return y - x; }); };
        var cible = function () { var c = HE.shuf(P).slice(0, HE.rint(2, 3)); if (Math.random() < 0.5) c.push(c[0]); return c.sort(function (x, y) { return y - x; }); };
        var payer = [cible(), cible()].map(function (c) { var leurres = HE.shuf(P.filter(function (v) { return c.indexOf(v) < 0; })).slice(0, 3); return { c: c, montre: HE.shuf(c.concat(leurres)) }; });
        var fruits = HE.shuf(PO.FRUITS).slice(0, 2);
        return { bourses: [bourse(3), bourse(4), bourse(3, true)], payer: payer, facons: HE.pk([100, 150, 250, 300]),
          rendre: [[500, 50 * HE.rint(2, 9)], [1000, 50 * HE.rint(4, 19)], [500, 50 * HE.rint(1, 9)]], fruits: fruits };
      },
      exos: function (d, en) {
        var somme = function (b) { return b.reduce(function (a, v) { return a + v; }, 0); };
        var montant = function (c) { return somme(c); };
        var deuxFacons = function (n) { /* une façon avec les grosses pièces, une autre en remplaçant la plus grosse */
          var f1 = [], r = n; PO.PIECES.slice().reverse().forEach(function (v) { while (r >= v) { f1.push(v); r -= v; } });
          var f2 = f1.slice(1), g = f1[0], r2 = g; PO.PIECES.slice().reverse().forEach(function (v) { while (v < g && r2 >= v) { f2.push(v); r2 -= v; } });
          f2.sort(function (x, y) { return y - x; });
          return [f1, f2].map(function (f) { return f.map(function (v) { return v + " F"; }).join(" + "); }); };
        var f = d.fruits, tot = f[0].prix + f[1].prix;
        return [
          { c: en ? "How much money is there in each purse?" : "Combien d’argent y a-t-il dans chaque porte-monnaie ?",
            q: '<div class="ex-bourses">' + d.bourses.map(function (b) { return '<div><div class="ex-bourse">' + b.map(exPiece).join("") + "</div><p>" + exT(exMille(somme(b))) + " F</p></div>"; }).join("") + "</div>",
            r: d.bourses.map(function (b) { return exMille(somme(b)) + " F"; }).join(" · ") },
          { c: en ? "Circle the coins to pay exactly the price." : "Entoure les pièces pour payer le prix exact.",
            q: d.payer.map(function (x) { var reste = x.c.slice(); return '<div class="ex-payer"><b>' + montant(x.c) + " F</b>" + exG('<div class="ex-bourse">' + x.montre.map(function (v) { var i = reste.indexOf(v); if (i < 0) return exPiece(v); reste.splice(i, 1); return exC(exPiece(v)); }).join("") + "</div>", "cercle", true) + "</div>"; }).join(""),
            r: d.payer.map(function (x) { return montant(x.c) + " F = " + x.c.map(function (v) { return v + " F"; }).join(" + ") + (en ? " (or another correct way)" : " (ou une autre façon juste)"); }).join(" · ") },
          { c: en ? "Find two different ways to pay " + d.facons + " F." : "Trouve deux façons différentes de payer " + d.facons + " F.",
            q: "<p>" + (en ? "1st way: " : "1re façon : ") + exT(deuxFacons(d.facons)[0], true) + "</p><p>" + (en ? "2nd way: " : "2e façon : ") + exT(deuxFacons(d.facons)[1], true) + "</p>",
            r: deuxFacons(d.facons).join(en ? " · or " : " · ou ") + (en ? " (other ways are possible)" : " (d’autres façons sont possibles)") },
          { c: en ? "How much change do you get?" : "Combien la marchande rend-elle ?",
            q: '<ul class="ex-conv ex-une-col">' + d.rendre.map(function (x) { return "<li>" + (en ? "I pay " + x[1] + " F with a " + exMille(x[0]) + " F note. I get " : "Je paie " + x[1] + " F avec un billet de " + exMille(x[0]) + " F. On me rend ") + exT(exMille(x[0] - x[1])) + " F.</li>"; }).join("") + "</ul>",
            r: d.rendre.map(function (x) { return exMille(x[0] - x[1]) + " F"; }).join(" · ") },
          { c: en ? "Solve the problem." : "Résous le problème.",
            q: "<p>" + (en ? "At the market, Tehani buys " + f[0].en + " (" + f[0].prix + " F) and " + f[1].en + " (" + f[1].prix + " F). She pays with a 500 F note. How much does she spend? How much change does she get?"
              : "Au marché, Tehani achète " + f[0].fr + " (" + f[0].prix + " F) et " + f[1].fr + " (" + f[1].prix + " F). Elle paie avec un billet de 500 F. Combien dépense-t-elle ? Combien la marchande lui rend-elle ?") + "</p><p>" + (en ? "She spends " : "Elle dépense ") + exT(String(tot)) + " F. " + (en ? "She gets " : "On lui rend ") + exT(String(500 - tot)) + " F.</p>",
            r: f[0].prix + " F + " + f[1].prix + " F = " + tot + " F · 500 F − " + tot + " F = " + (500 - tot) + " F" }
        ];
      }
    },
    division: {
      seq: "seq-division", matiere: "maths", titre: function () { return tr(C.division.titre); },
      rappel: function (en) { return en ? "In a division, we share into equal parts. 23 = (4 × 5) + 3: 23 is the dividend, 4 the divisor, 5 the quotient and 3 the remainder. The remainder is always smaller than the divisor."
        : "Dans une division, on partage en parts égales. 23 = (4 × 5) + 3 : 23 est le dividende, 4 le diviseur, 5 le quotient et 3 le reste. Le reste est toujours plus petit que le diviseur."; },
      tirer: function () {
        var dv = function () { var b = HE.rint(2, 5), q = HE.rint(2, 10); return [b * q, b]; };
        var calc = []; while (calc.length < 6) { var c = dv(); if (!calc.some(function (x) { return x[0] === c[0] && x[1] === c[1]; })) calc.push(c); }
        var reste = function () { var b = HE.rint(3, 6), q = HE.rint(2, 7), r = HE.rint(1, b - 1); return [b * q + r, b, q, r]; };
        var b0 = HE.rint(2, 4), q0 = HE.rint(3, 5);
        return { partage: [b0 * q0, b0, q0], calc: calc, restes: [reste(), reste(), reste()], vocab: reste(), pb: reste() };
      },
      exos: function (d, en) {
        var div = en ? " ÷ " : " : ";
        var p = d.partage, v = d.vocab, pb = d.pb;
        return [
          { c: en ? "Share the " + p[0] + " lychees equally into " + p[1] + " bags. Draw them, then complete." : "Partage les " + p[0] + " letchis dans " + p[1] + " sachets, en parts égales. Dessine-les, puis complète.",
            q: '<p class="ex-letchis">' + new Array(p[0] + 1).join('<span class="ex-rond"></span>') + "</p>" + exS('<div class="ex-sachets">' + new Array(p[1] + 1).join('<span class="ex-sachet"></span>') + "</div>", '<div class="ex-sachets">' + new Array(p[1] + 1).join('<span class="ex-sachet tb-plein">' + new Array(p[2] + 1).join('<span class="ex-rond"></span>') + "</span>") + "</div>") + "<p>" + (en ? "Each bag has " : "Chaque sachet a ") + exT(String(p[2])) + (en ? " lychees.  " : " letchis.  ") + p[0] + div + p[1] + " = " + exT(String(p[2])) + "</p>",
            r: p[0] + div + p[1] + " = " + p[2] },
          { c: en ? "Work out." : "Calcule.",
            q: '<ul class="ex-conv ex-trois-col">' + d.calc.map(function (x) { return "<li>" + x[0] + div + x[1] + " = " + exT(String(x[0] / x[1])) + "</li>"; }).join("") + "</ul>",
            r: d.calc.map(function (x) { return x[0] + div + x[1] + " = " + x[0] / x[1]; }).join(" · ") },
          { c: en ? "Share, then write the equality with the remainder." : "Partage, puis écris l’égalité avec le reste.",
            q: '<ul class="ex-conv ex-une-col ex-courtes">' + d.restes.map(function (x) { return "<li>" + (en ? x[0] + " shells shared between " + x[1] + " friends: " : x[0] + " coquillages partagés entre " + x[1] + " amis : ") + x[0] + " = (" + x[1] + " × " + exT(String(x[2])) + ") + " + exT(String(x[3])) + "</li>"; }).join("") + "</ul>",
            r: d.restes.map(function (x) { return x[0] + " = (" + x[1] + " × " + x[2] + ") + " + x[3]; }).join(" · ") },
          { c: en ? "Complete with the right number." : "Complète avec le bon nombre.",
            q: '<p class="ex-egalite">' + v[0] + " = (" + v[1] + " × " + v[2] + ") + " + v[3] + '</p><ul class="ex-conv">' + (en ? ["The dividend is ", "The divisor is ", "The quotient is ", "The remainder is "] : ["Le dividende est ", "Le diviseur est ", "Le quotient est ", "Le reste est "]).map(function (s, i) { return "<li>" + s + exT(String(v[i])) + ".</li>"; }).join("") + "</ul>",
            r: (en ? "dividend " : "dividende ") + v[0] + (en ? " · divisor " : " · diviseur ") + v[1] + " · quotient " + v[2] + (en ? " · remainder " : " · reste ") + v[3] },
          { c: en ? "Solve the problem." : "Résous le problème.",
            q: "<p>" + (en ? "Nina has " + pb[0] + " shells. She puts them in boxes of " + pb[1] + ". How many boxes can she fill? How many shells are left?" : "Nina a " + pb[0] + " coquillages. Elle les range dans des boîtes de " + pb[1] + ". Combien de boîtes peut-elle remplir ? Combien de coquillages reste-t-il ?") + "</p><p>" + (en ? "She fills " : "Elle remplit ") + exT(String(pb[2])) + (en ? " boxes. There are " : " boîtes. Il reste ") + exT(String(pb[3])) + (en ? " shells left." : " coquillages.") + "</p>",
            r: pb[0] + " = (" + pb[1] + " × " + pb[2] + ") + " + pb[3] + " · " + (en ? pb[2] + " boxes, " + pb[3] + " left" : pb[2] + " boîtes, il reste " + pb[3] + " coquillages") }
        ];
      }
    },
    digitale: {
      seq: "seq-digitale", matiere: "maths", titre: function () { return tr(C.digitale.titre); },
      rappel: function (en) { return en ? "There are 24 hours in a day. We can say afternoon and evening times in two ways: +12 h or −12 h (4:00 p.m. → 16:00; 14:15 → 2:15 p.m.)."
        : "Dans une journée, il y a 24 heures. On peut dire les heures de l’après-midi et du soir de deux façons : +12h (4:00 de l’après-midi → 16:00) ou −12h (14:15 → 2:15 de l’après-midi)."; },
      tirer: function () {
        var Q = [0, 15, 30, 45], J = [["Je me lève", "I get up", [6, 7]], ["Je pars à l’école", "I leave for school", [7, 7]], ["La récréation est", "Break time is", [9, 10]], ["Je mange", "I have lunch", [11, 12]], ["Je finis l’école", "School finishes", [15, 15]], ["Je me couche", "I go to bed", [19, 20]]];
        var jour = HE.shuf(J).slice(0, 4).map(function (x) { return [x[0], x[1], HE.rint(x[2][0], x[2][1]), HE.pk(Q)]; });
        var plus = HE.shuf([13, 14, 15, 16, 17, 18, 19, 20, 21]).slice(0, 2).map(function (h) { return [h, HE.pk(Q)]; }), moins = HE.shuf([13, 14, 15, 16, 17, 19, 20, 21, 22]).slice(0, 2).map(function (h) { return [h, HE.pk(Q)]; });
        var hor = HE.shuf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 3).map(function (h) { return [h, HE.pk(Q)]; });
        var DUR = [[15, "un quart d’heure", "a quarter of an hour"], [30, "une demi-heure", "half an hour"], [60, "une heure", "an hour"]], du = HE.pk(DUR);
        var PB = [["La récréation commence à", "Break time starts at", "Elle dure", "It lasts", "À quelle heure finit-elle ?", "What time does it end?"], ["Le film commence à", "The film starts at", "Il dure", "It lasts", "À quelle heure finit-il ?", "What time does it end?"], ["Le cours de natation commence à", "The swimming lesson starts at", "Il dure", "It lasts", "À quelle heure finit-il ?", "What time does it end?"]];
        return { jour: jour.sort(function (a, b) { return a[2] * 60 + a[3] - b[2] * 60 - b[3]; }), conv: HE.shuf(plus.map(function (x) { return ["+", x[0], x[1]]; }).concat(moins.map(function (x) { return ["-", x[0], x[1]]; }))), hor: hor,
          pb: { t: HE.pk(PB), h: HE.rint(9, 16), m: HE.pk([0, 15, 30]), du: du } };
      },
      exos: function (d, en) {
        var soir = function (h) { return h >= 18 ? (en ? "p.m." : "du soir") : (en ? "p.m." : "de l’après-midi"); };
        var fin = (d.pb.h * 60 + d.pb.m + d.pb.du[0]), pb = d.pb;
        var repJour = function (x) { return en ? HE.cap(HE.direEn(x[2], x[3])) : HE.cap(exDigMots(x[2], x[3])) + (x[2] > 12 ? " (ou " + HE.direFr(x[2] - 12, x[3]).replace(/ \(\d+ min\)$/, "") + " " + soir(x[2]) + ")" : ""); };
        return [
          { c: en ? "Write the time in words." : "Écris l’heure en lettres.",
            q: '<ul class="ex-conv ex-une-col">' + d.jour.map(function (x) { return "<li>" + (en ? x[1] + " at " + x[2] + ":" + HE.pad(x[3]) + ". " : x[0] + " à " + x[2] + "h" + HE.pad(x[3]) + ". ") + exT(repJour(x), true) + "</li>"; }).join("") + "</ul>",
            r: d.jour.map(repJour).join(" · ") },
          { c: en ? "Write the time in two ways." : "Écris l’heure de deux façons.",
            q: '<ul class="ex-conv">' + d.conv.map(function (x) { return x[0] === "+" ? "<li>" + exDig(x[1] - 12, x[2]) + " " + soir(x[1]) + " → " + exHM(exT(String(x[1])) + ":" + exT(HE.pad(x[2]))) + "</li>" : "<li>" + exDig(x[1], x[2]) + " → " + exHM(exT(String(x[1] - 12)) + ":" + exT(HE.pad(x[2]))) + " " + soir(x[1]) + "</li>"; }).join("") + "</ul>",
            r: d.conv.map(function (x) { return x[0] === "+" ? x[1] + ":" + HE.pad(x[2]) : (x[1] - 12) + ":" + HE.pad(x[2]); }).join(" · ") },
          { c: en ? "What time is it? Write the morning time and the afternoon or evening time." : "Quelle heure est-il ? Écris l’heure du matin, puis celle de l’après-midi ou du soir.",
            q: '<div class="ex-liste">' + d.hor.map(function (x) { return '<div class="ex-ligne-clk">' + HE.horloge(x[0], x[1], { deco: true, cls: "ex-clk" }) + "<p>" + (en ? "a.m. " : "matin ") + exHM(exT(String(x[0])) + ":" + exT(HE.pad(x[1]))) + " &nbsp; " + (en ? "p.m. " : "après-midi ou soir ") + exHM(exT(String(x[0] + 12)) + ":" + exT(HE.pad(x[1]))) + "</p></div>"; }).join("") + "</div>",
            r: d.hor.map(function (x) { return x[0] + ":" + HE.pad(x[1]) + " / " + (x[0] + 12) + ":" + HE.pad(x[1]); }).join(" · ") },
          { c: en ? "Complete." : "Complète.",
            q: '<ul class="ex-conv">' + (en ? ["1 hour = ", "half an hour = ", "a quarter of an hour = ", "In a day, there are "] : ["1 heure = ", "une demi-heure = ", "un quart d’heure = ", "Dans une journée, il y a "]).map(function (s, i) { return "<li>" + s + exT(String([60, 30, 15, 24][i])) + (i < 3 ? " min" : (en ? " hours." : " heures.")) + "</li>"; }).join("") + "</ul>",
            r: "60 min · 30 min · 15 min · 24" },
          { c: en ? "Solve the problem." : "Résous le problème.",
            q: "<p>" + (en ? pb.t[1] + " " + pb.h + ":" + HE.pad(pb.m) + ". " + pb.t[3] + " " + pb.du[2] + ". " + pb.t[5] : pb.t[0] + " " + pb.h + "h" + HE.pad(pb.m) + ". " + pb.t[2] + " " + pb.du[1] + ". " + pb.t[4]) + "</p><p>" + (en ? "Answer: " : "Réponse : ") + exHM(exT(String(Math.floor(fin / 60))) + ":" + exT(HE.pad(fin % 60))) + "</p>",
            r: Math.floor(fin / 60) + ":" + HE.pad(fin % 60) }
        ];
      }
    },
    diagrammes: {
      seq: "seq-diagrammes", matiere: "maths", titre: function () { return tr(C.diagrammes.titre); },
      rappel: function (en) { return en ? "We can organise information in two ways: the table and the bar chart." : "On peut organiser des <b>informations</b> sous deux formes : <b>le tableau</b> et <b>le graphique en barres</b>."; },
      tirer: function () {
        var ids = HE.shuf(DG.CONTEXTES.map(function (c) { return c.id; }));
        var d1 = DG.tirer({ ctx: ids[0], pas: 2, niveaux: 10, min: 2 }), d2 = DG.tirer({ ctx: ids[1], pas: 5, niveaux: 8, min: 5 }), d3 = DG.tirer({ ctx: ids[2], pas: 2, niveaux: 8, min: 2 });
        var k = HE.shuf(d1.vals.map(function (_, i) { return i; }));
        return { d1: d1, d2: d2, d3: d3, k: k };
      },
      exos: function (d, en) {
        var nom = function (dd, i) { return en ? dd.ctx.cats[i].en : dd.ctx.cats[i].fr; };
        var fig = function (dd, o) { return '<figure class="ex-dg"><figcaption>' + esc(tr(dd.ctx.titre)) + "</figcaption>" + DG.diagramme(dd, Object.assign({ en: en }, o || {})) + "</figure>"; };
        var tableau = function (dd, vide) { return '<table class="ex-tab"><tr><th>' + esc(tr(dd.ctx.axeX)) + "</th><th>" + (en ? "Number" : "Nombre") + "</th></tr>" + dd.ctx.cats.map(function (_, i) { return "<tr><td>" + esc(nom(dd, i)) + "</td><td>" + (vide ? exT(String(dd.vals[i]), false, "") : dd.vals[i]) + "</td></tr>"; }).join("") + "</table>"; };
        var d1 = d.d1, a = d.k[0], b = d.k[1], im = d1.vals.indexOf(Math.max.apply(null, d1.vals)), il = d1.vals.indexOf(Math.min.apply(null, d1.vals));
        var hi = d1.vals[a] >= d1.vals[b] ? a : b, lo = hi === a ? b : a, ec = DG.ecart(d1.ctx, d1.ctx.cats[hi], d1.ctx.cats[lo]);
        var reps1 = [d1.vals[a], d1.vals[b], esc(nom(d1, im)), esc(nom(d1, il)), DG.somme(d1.vals), d1.vals[hi] - d1.vals[lo]];
        return [
          { c: en ? "Read the bar chart and answer." : "Lis le graphique et réponds.",
            q: '<div class="ex-cote">' + fig(d1) + '<ol class="ex-qs">' + [(en ? "What number does the “" + nom(d1, a) + "” bar show?" : "Quel nombre la barre « " + nom(d1, a) + " » indique-t-elle ?"), (en ? "What number does the “" + nom(d1, b) + "” bar show?" : "Quel nombre la barre « " + nom(d1, b) + " » indique-t-elle ?"), tr(d1.ctx.plus), tr(d1.ctx.moins),
              (en ? "How many " + d1.ctx.axe.en + " are there in all?" : "Combien " + d1.ctx.axe.de + " y a-t-il en tout ?"), tr(ec)].map(function (s, i) { return "<li>" + esc(s) + " " + exT(String(reps1[i])) + "</li>"; }).join("") + "</ol></div>",
            r: [d1.vals[a], d1.vals[b], nom(d1, im), nom(d1, il)].join(" · ") + " · " + d1.vals.join(" + ") + " = " + DG.somme(d1.vals) + " · " + d1.vals[hi] + " − " + d1.vals[lo] + " = " + (d1.vals[hi] - d1.vals[lo]) },
          { c: en ? "Complete the table using the bar chart." : "Complète le tableau à partir du graphique.",
            q: '<div class="ex-cote">' + fig(d.d2) + tableau(d.d2, true) + "</div>",
            r: d.d2.ctx.cats.map(function (_, i) { return esc(nom(d.d2, i)) + " " + d.d2.vals[i]; }).join(" · ") },
          { c: en ? "Draw the bar chart using the table." : "Construis le graphique à partir du tableau.",
            q: '<div class="ex-cote ex-construire">' + tableau(d.d3) + exS(fig(d.d3, { vals: d.d3.vals.map(function () { return 0; }) }), fig(d.d3)) + "</div>",
            r: '<div class="ex-petit-dg">' + fig(d.d3) + "</div>" }
        ];
      }
    },
    /* les masses (leçon GM8 « Les mesures de masses ») : D-111 */
    masses: {
      seq: "seq-masses", matiere: "maths", titre: function () { return tr(C.masses.titre); },
      rappel: function (en) { return en ? "The basic unit is the gram (g). 1 gram is the weight of a paper clip! 1 kg = 1,000 g · 1 t = 1,000 kg."
        : "L’unité de référence est le gramme (g). 1 gramme, c’est le poids d’un trombone ! 1 kg = 1 000 g · 1 t = 1 000 kg."; },
      tirer: function () {
        var G = [["une mangue", "a mango", 400], ["un œuf", "an egg", 50], ["une lettre", "a letter", 20], ["un crayon", "a pencil", 5], ["un avocat", "an avocado", 200]],
          K = [["un chien", "a dog", 15], ["un sac de riz", "a bag of rice", 5], ["une valise", "a suitcase", 20], ["une pastèque", "a watermelon", 6], ["un enfant de 8 ans", "an 8-year-old child", 27]],
          T = [["un éléphant", "an elephant", 5], ["un bus", "a bus", 12], ["un camion", "a lorry", 10], ["une petite voiture", "a small car", 1]];
        var unites = HE.shuf(HE.shuf(G).slice(0, 2).map(function (x) { return x.concat(["g"]); }).concat(HE.shuf(K).slice(0, 2).map(function (x) { return x.concat(["kg"]); }), HE.shuf(T).slice(0, 2).map(function (x) { return x.concat(["t"]); })));
        var n = HE.shuf([2, 3, 4, 5, 6, 7, 8, 9]), g = HE.shuf([100, 200, 250, 300, 400, 500, 600, 750, 800]);
        var conv = [["kg", n[0]], ["t", n[1]], ["kgg", n[2] % 4 + 1, g[0]], ["g", n[3]], ["kg", n[4]], ["kgg", n[5] % 3 + 1, g[1]]];
        /* ranger : 4 masses proches de 1 à 2 kg, écrites avec des unités différentes, toutes différentes */
        var r0 = HE.shuf([[900, "900 g"], [1200, "1 kg 200 g"], [1500, "1 500 g"], [2000, "2 kg"], [1750, "1 kg 750 g"], [800, "800 g"], [1000, "1 kg"]]).slice(0, 4);
        var a = HE.rint(2, 6), d = HE.pk([100, 200, 300]);
        var comp = HE.shuf([[a + " kg", a * 1000, (a * 1000 - d), " g"], [HE.rint(2, 5) * 1000, null, null, " g"], ["1 kg 500 g", 1500, 1050, " g"], [(a + 1) + " t", (a + 1) * 1000000, (a + 1) * 1000 + d, " kg"]]);
        var b = HE.rint(1, 3), p = HE.pk([250, 500, 750]), tot = b * 1000 + p;
        return { unites: unites, conv: conv, ranger: r0, comp: comp, pb: { b: b, p: p, tot: tot, limite: HE.pk([b, b + 1]) } };
      },
      exos: function (d, en) {
        var M = function (v) { return en ? v.toLocaleString("en-GB") : exMille(v).replace(/ /g, " "); };
        var lib = function (s) { return en ? s.replace(/(\d)[\s  ](?=\d{3})/g, "$1,") : s; };
        var U = { g: "g", kg: "kg", t: "t" };
        var signe = function (A, B) { return A === B ? "=" : A > B ? "&gt;" : "&lt;"; };
        var comp = d.comp.map(function (c) {
          if (c[1] === null) { var k = c[0] / 1000; return { a: k + " kg", b: M(c[0]) + " g", A: c[0], B: c[0], ex: k + " kg = " + M(c[0]) + " g" }; }
          var A = c[1], B = c[3] === " kg" ? c[2] * 1000 : c[2], bLab = M(c[2]) + c[3];
          return { a: c[0], b: bLab, A: A, B: B, ex: c[0] + " = " + (c[3] === " kg" ? M(A / 1000) + " kg" : M(A) + " g") };
        });
        var ordre = d.ranger.slice().sort(function (x, y) { return x[0] - y[0]; });
        var pb = d.pb;
        return [
          { c: en ? "Circle the right unit." : "Entoure l’unité qui convient.",
            q: '<ul class="ex-conv ex-une-col ex-unites">' + d.unites.map(function (x) { return "<li>" + HE.cap(en ? x[1] : x[0]) + (en ? " weighs about " : " pèse environ ") + x[2] + " " + exG("( " + ["g", "kg", "t"].map(function (u) { return u === x[3] ? exC(u) : u; }).join(" / ") + " )", "cercle") + "</li>"; }).join("") + "</ul>",
            r: d.unites.map(function (x) { return x[2] + " " + U[x[3]]; }).join(" · ") },
          { c: en ? "Complete." : "Complète.",
            q: '<ul class="ex-conv ex-deux-col">' + d.conv.map(function (x) {
              if (x[0] === "kg") return "<li>" + x[1] + " kg = " + exT(M(x[1] * 1000)) + " g</li>";
              if (x[0] === "t") return "<li>" + x[1] + " t = " + exT(M(x[1] * 1000)) + " kg</li>";
              if (x[0] === "g") return "<li>" + M(x[1] * 1000) + " g = " + exT(String(x[1])) + " kg</li>";
              return "<li>" + x[1] + " kg " + x[2] + " g = " + exT(M(x[1] * 1000 + x[2])) + " g</li>"; }).join("") + "</ul>",
            r: d.conv.map(function (x) { return x[0] === "kg" ? x[1] + " kg = " + M(x[1] * 1000) + " g" : x[0] === "t" ? x[1] + " t = " + M(x[1] * 1000) + " kg" : x[0] === "g" ? M(x[1] * 1000) + " g = " + x[1] + " kg" : x[1] + " kg " + x[2] + " g = " + M(x[1] * 1000 + x[2]) + " g"; }).join(" · ") },
          { c: en ? "Compare with &lt;, &gt; or =." : "Compare avec &lt;, &gt; ou =.",
            q: '<ul class="ex-conv ex-deux-col">' + comp.map(function (c) { return "<li>" + lib(c.a) + " " + exT(signe(c.A, c.B)) + " " + lib(c.b) + "</li>"; }).join("") + "</ul>",
            r: comp.map(function (c) { return lib(c.a) + " " + signe(c.A, c.B) + " " + lib(c.b) + " (" + lib(c.ex) + ")"; }).join(" · ") },
          { c: en ? "Put these masses in order, from the lightest to the heaviest." : "Range ces masses de la plus légère à la plus lourde.",
            q: '<p class="ex-banque">' + d.ranger.map(function (x) { return lib(x[1]); }).join(" · ") + '</p><p class="ex-ordre">' + ordre.map(function (x) { return exT(lib(x[1])); }).join(" &lt; ") + "</p>",
            r: ordre.map(function (x) { return lib(x[1]); }).join(" < ") + (en ? " (in grams: " : " (en grammes : ") + ordre.map(function (x) { return M(x[0]); }).join(" < ") + ")" },
          { c: en ? "Solve the problem." : "Résous le problème.",
            q: "<p>" + (en ? "Sari buys a " + pb.b + " kg bag of rice and a " + pb.p + " g bag of flour. How much does her shopping weigh, in grams? Is it more or less than " + pb.limite + " kg?"
              : "Sari achète un sac de riz de " + pb.b + " kg et un paquet de farine de " + pb.p + " g. Combien pèsent ses courses, en grammes ? Est-ce plus ou moins que " + pb.limite + " kg ?") + "</p><p>" +
              (en ? "Her shopping weighs " : "Ses courses pèsent ") + exT(M(pb.tot)) + " g. " + (en ? "It is " : "C’est ") + exT(pb.tot > pb.limite * 1000 ? (en ? "more" : "plus") : (en ? "less" : "moins")) + (en ? " than " : " que ") + pb.limite + " kg.</p>",
            r: pb.b + " kg = " + M(pb.b * 1000) + " g · " + M(pb.b * 1000) + " g + " + pb.p + " g = " + M(pb.tot) + " g · " + M(pb.tot) + " g " + (pb.tot > pb.limite * 1000 ? "&gt;" : "&lt;") + " " + M(pb.limite * 1000) + " g (" + pb.limite + " kg)" + (en ? ": " : " : ") + (pb.tot > pb.limite * 1000 ? (en ? "more" : "plus") : (en ? "less" : "moins")) }
        ];
      }
    }
  };
  Object.keys(EXOS2).forEach(function (k) { EXOS[k] = EXOS2[k]; });
  /* ---------- Fiches d'exercices en 3 niveaux (demande de l’enseignante, 09/11/2026) [PROPOSITION] ----------
     Mêmes objectifs opérationnels pour les 3 niveaux (programmation P5 de la classe), difficulté croissante :
     niveau 1 = petits nombres et aides (exemple, dessin, choix) ; niveau 2 = attendu de la classe ; niveau 3 = sans aide, plusieurs étapes.
     X.niveaux[0..2] remplace rappel, tirer et exos ; X.objectifs = objectifs de la programmation, cités mot pour mot. */
  var EX_NIV_NOM = ["Niveau 1", "Niveau 2", "Niveau 3"], EX_NIV_EN = ["Level 1", "Level 2", "Level 3"];
  /* repère discret du niveau sur la fiche imprimée : 1, 2 ou 3 étoiles (choix de l’enseignante, 09/11/2026) */
  function exEtoiles(n) { return '<span class="ex-etoiles" aria-label="' + EX_NIV_NOM[n - 1] + '">' + new Array(n + 1).join("★") + "</span>"; }
  function exX(X) { if (!X.niveaux) return X; var N = X.niveaux[(EXF && EXF.niv ? EXF.niv : 2) - 1], o = {}; Object.keys(X).forEach(function (k) { o[k] = X[k]; }); Object.keys(N).forEach(function (k) { o[k] = N[k]; }); return o; }
  /* division : situations de partage (p) et de groupement (g), leçon CAL7 « Diviser : grouper ou partager » */
  var DV_SIT = [
    { t: "p", fr: "Nina partage {t} coquillages entre {b} amis, en parts égales. Combien de coquillages pour chacun ?", en: "Nina shares {t} shells equally between {b} friends. How many shells does each friend get?", u: ["coquillages", "shells"], o: ["coquillages", "shells"] },
    { t: "p", fr: "La maîtresse distribue {t} crayons sur {b} tables, autant sur chaque table. Combien de crayons par table ?", en: "The teacher hands out {t} pencils to {b} tables, the same number on each table. How many pencils per table?", u: ["crayons", "pencils"], o: ["crayons", "pencils"] },
    { t: "p", fr: "Tao partage {t} letchis dans {b} sachets, en parts égales. Combien de letchis dans chaque sachet ?", en: "Tao shares {t} lychees equally into {b} bags. How many lychees are there in each bag?", u: ["letchis", "lychees"], o: ["letchis", "lychees"] },
    { t: "p", fr: "{t} élèves se répartissent en {b} équipes égales. Combien d’élèves dans chaque équipe ?", en: "{t} pupils split into {b} equal teams. How many pupils are there in each team?", u: ["élèves", "pupils"], o: ["élèves", "pupils"], nr: true },
    { t: "g", fr: "Méi range {t} œufs dans des boîtes de {b}. Combien de boîtes remplit-elle ?", en: "Méi puts {t} eggs into boxes of {b}. How many boxes does she fill?", u: ["boîtes", "boxes"], o: ["œufs", "eggs"] },
    { t: "g", fr: "Avec {t} enfants, on forme des équipes de {b}. Combien d’équipes forme-t-on ?", en: "With {t} children, we make teams of {b}. How many teams do we make?", u: ["équipes", "teams"], o: ["enfants", "children"], nr: true },
    { t: "g", fr: "Wadra met {t} mangues dans des sacs de {b} mangues. Combien de sacs remplit-il ?", en: "Wadra puts {t} mangoes into bags of {b} mangoes. How many bags does he fill?", u: ["sacs", "bags"], o: ["mangues", "mangoes"] },
    { t: "g", fr: "Dylan colle {t} images dans son album, {b} par page. Combien de pages remplit-il ?", en: "Dylan sticks {t} pictures in his album, {b} on each page. How many pages does he fill?", u: ["pages", "pages"], o: ["images", "pictures"] }
  ];
  /* espacement resserré des exercices de division (une page A4 par niveau) */
  function dvQ(L) { return L.map(function (e) { e.q = '<div class="ex-dv">' + e.q + "</div>"; return e; }); }
  function dvSit(s, t, b, en) { return typo((en ? s.en : s.fr).replace("{t}", t).replace("{b}", b)); }
  /* autant de situations de partage que de groupement, mélangées ; nr = situation qui n’a pas de sens avec un reste */
  function dvSits(n, bMin, bMax, qMax, reste, qMin) {
    var ok = function (s) { return !(reste && s.nr); }, P = HE.shuf(DV_SIT.filter(function (s) { return s.t === "p" && ok(s); })), G = HE.shuf(DV_SIT.filter(function (s) { return s.t === "g" && ok(s); })), L = [];
    for (var i = 0; i < n; i++) { var s = i % 2 ? G[i >> 1] : P[i >> 1], b = HE.rint(bMin, bMax), q = HE.rint(qMin || 2, qMax); L.push({ s: s, b: b, q: q, t: b * q }); }
    return HE.shuf(L);
  }
  function dvDivs(n, bMin, bMax, qMin, qMax) { var L = [], k = 0; while (L.length < n && k++ < 200) { var b = HE.rint(bMin, bMax), q = HE.rint(qMin, qMax); if (!L.some(function (x) { return x[1] === b && x[2] === q; })) L.push([b * q, b, q]); } return L; }
  function dvReste(bMin, bMax, qMin, qMax) { var b = HE.rint(bMin, bMax), q = HE.rint(qMin, qMax), r = HE.rint(1, b - 1); return [b * q + r, b, q, r]; }
  function dvChoix(s, en) { var g = en ? "I group" : "Je groupe", p = en ? "I share" : "Je partage"; return '<span class="ex-gp">' + exG((s.t === "g" ? exC(g) : g) + '<span class="ex-sep">/</span>' + (s.t === "p" ? exC(p) : p), "cercle") + "</span>"; }
  var DV_OBJ = [
    "L’élève est capable d’identifier une situation de groupement ou de partage.",
    "L’élève est capable d’écrire la division en ligne et la multiplication à trou qui correspondent à la situation rencontrée.",
    "Lorsqu’il écrit sa division en ligne ou sa multiplication à trou, l’élève utilise à bon escient les notions de quotient, diviseur, dividende, et reste.",
    "L’élève est capable de résoudre un problème simple relevant de la division en ligne avec ou sans reste."
  ];
  EXOS.division.objectifs = DV_OBJ;
  EXOS.division.niveaux = [
    { /* niveau 1 : tables de 2 à 5, quotient jusqu’à 5 pour dessiner, sans reste ; exemples et choix */
      but: "Petits nombres (tables de 2 à 5), sans reste ; un partage à dessiner, des choix à entourer, un exemple pour le vocabulaire.",
      rappel: function (en) { return en ? "<b>Group:</b> in 24, how many 4s? 24 = 4 × 6 and 24 ÷ 4 = 6. <b>Share:</b> 27 shared into 3: 27 = 3 × 9 and 27 ÷ 3 = 9."
        : "<b>Grouper</b> : dans 24, combien de fois 4 ? 24 = 4 × 6 et 24 : 4 = 6. <b>Partager</b> : 27 partagé en 3 : 27 = 3 × 9 et 27 : 3 = 9."; },
      tirer: function () { var b0 = HE.rint(2, 3), q0 = HE.rint(3, 5), sits = dvSits(3, 2, 5, 5, false, 3);
        /* le problème prend une situation de groupement qui n’est pas déjà dans l’exercice 2 */
        var libre = HE.shuf(DV_SIT.filter(function (s) { return s.t === "g" && !sits.some(function (x) { return x.s === s; }); }))[0], b = HE.rint(2, 4), q = HE.rint(3, 5);
        return { partage: [b0 * q0, b0, q0], sits: sits, trous: dvDivs(4, 2, 5, 2, 10), voc: dvDivs(1, 3, 5, 3, 9)[0], pb: { s: libre, b: b, q: q, t: b * q } }; },
      exos: function (d, en) {
        var div = en ? " ÷ " : " : ", p = d.partage, v = d.voc, pb = d.pb;
        return dvQ([
          { c: en ? "Share the " + p[0] + " lychees equally into " + p[1] + " bags. Draw them, then complete." : "Partage les " + p[0] + " letchis dans " + p[1] + " sachets, en parts égales. Dessine-les, puis complète.",
            q: '<p class="ex-letchis">' + new Array(p[0] + 1).join('<span class="ex-rond"></span>') + "</p>" + exS('<div class="ex-sachets">' + new Array(p[1] + 1).join('<span class="ex-sachet"></span>') + "</div>", '<div class="ex-sachets">' + new Array(p[1] + 1).join('<span class="ex-sachet tb-plein">' + new Array(p[2] + 1).join('<span class="ex-rond"></span>') + "</span>") + "</div>") +
              "<p>" + p[0] + " = " + p[1] + " × " + exT(String(p[2])) + " &nbsp; " + p[0] + div + p[1] + " = " + exT(String(p[2])) + "</p>",
            r: p[0] + " = " + p[1] + " × " + p[2] + " · " + p[0] + div + p[1] + " = " + p[2] },
          { c: en ? "Do I group or do I share? Circle." : "Est-ce que je groupe ou est-ce que je partage ? Entoure.",
            q: '<ol class="ex-conv ex-une-col ex-dv-sit">' + d.sits.map(function (x) { return '<li><span class="ex-sit-choix"><span>' + esc(dvSit(x.s, x.t, x.b, en)) + "</span>" + dvChoix(x.s, en) + "</span></li>"; }).join("") + "</ol>",
            r: d.sits.map(function (x) { return x.s.t === "g" ? (en ? "group" : "je groupe") : (en ? "share" : "je partage"); }).join(" · ") },
          { c: en ? "Complete the missing-number multiplication, then the division." : "Complète la multiplication à trou, puis la division.",
            q: '<ul class="ex-conv">' + d.trous.map(function (x) { return "<li>" + x[0] + " = " + x[1] + " × " + exT(String(x[2])) + " &nbsp;→&nbsp; " + x[0] + div + x[1] + " = " + exT(String(x[2])) + "</li>"; }).join("") + "</ul>",
            r: d.trous.map(function (x) { return x[0] + div + x[1] + " = " + x[2]; }).join(" · ") },
          { c: en ? "Look at the example, then complete." : "Regarde l’exemple, puis complète.",
            q: '<p class="ex-exemple">' + (en ? "Example: 12 ÷ 3 = 4 → the dividend is 12, the divisor is 3, the quotient is 4." : "Exemple : 12 : 3 = 4 → le dividende est 12, le diviseur est 3, le quotient est 4.") + '</p><div class="ex-voc1"><p class="ex-egalite">' + v[0] + div + v[1] + " = " + v[2] + '</p><ul class="ex-conv ex-une-col">' +
              (en ? ["The dividend is ", "The divisor is ", "The quotient is "] : ["Le dividende est ", "Le diviseur est ", "Le quotient est "]).map(function (s, i) { return "<li>" + s + exT(String(v[i])) + ".</li>"; }).join("") + "</ul></div>",
            r: (en ? "dividend " : "dividende ") + v[0] + (en ? " · divisor " : " · diviseur ") + v[1] + " · quotient " + v[2] },
          { c: en ? "Solve the problem. You can draw." : "Résous le problème. Tu peux dessiner.",
            q: "<p>" + esc(dvSit(pb.s, pb.t, pb.b, en)) + '</p><div class="ex-brouillon"></div><p>' + pb.t + " = " + pb.b + " × " + exT(String(pb.q)) + " &nbsp; " + pb.t + div + pb.b + " = " + exT(String(pb.q)) + " &nbsp; " + (en ? "Answer: " : "Réponse : ") + '<span class="ex-moyen">' + exT(pb.q + " " + pb.s.u[en ? 1 : 0]) + "</span></p>",
            r: pb.t + div + pb.b + " = " + pb.q + " · " + pb.q + " " + pb.s.u[en ? 1 : 0] }
        ]);
      }
    },
    { /* niveau 2 : attendu de la classe, tables de 2 à 6, avec et sans reste */
      but: "Attendu de la classe : tables de 2 à 6, divisions avec et sans reste, vocabulaire sans exemple, un problème avec reste.",
      rappel: EXOS.division.rappel,
      tirer: function () { return { sits: dvSits(3, 2, 6, 9), calc: dvDivs(6, 2, 6, 2, 10), restes: [dvReste(3, 6, 2, 9), dvReste(3, 6, 2, 9), dvReste(3, 6, 2, 9)], vocab: dvReste(3, 6, 3, 9), pb: dvReste(3, 6, 3, 9) }; },
      exos: function (d, en) {
        var div = en ? " ÷ " : " : ", v = d.vocab, pb = d.pb;
        return dvQ([
          { c: en ? "Do I group or do I share? Circle, then write the multiplication and the division." : "Est-ce que je groupe ou est-ce que je partage ? Entoure, puis écris la multiplication à trou et la division.",
            q: '<ol class="ex-conv ex-une-col ex-dv-sit">' + d.sits.map(function (x) { return "<li>" + esc(dvSit(x.s, x.t, x.b, en)) + "<br>" + dvChoix(x.s, en) + '<span class="ex-sep"></span>' + '<span class="ex-moyen">' + exT(x.t + " = " + x.b + " × " + x.q) + "</span> &nbsp; " + '<span class="ex-moyen">' + exT(x.t + div + x.b + " = " + x.q) + "</span>" + "</li>"; }).join("") + "</ol>",
            r: d.sits.map(function (x) { return (x.s.t === "g" ? (en ? "group" : "je groupe") : (en ? "share" : "je partage")) + " : " + x.t + " = " + x.b + " × " + x.q + ", " + x.t + div + x.b + " = " + x.q; }).join(" · ") },
          { c: en ? "Work out." : "Calcule.",
            q: '<ul class="ex-conv ex-trois-col">' + d.calc.map(function (x) { return "<li>" + x[0] + div + x[1] + " = " + exT(String(x[2])) + "</li>"; }).join("") + "</ul>",
            r: d.calc.map(function (x) { return x[0] + div + x[1] + " = " + x[2]; }).join(" · ") },
          { c: en ? "Divide, then complete the equality with the remainder." : "Divise, puis complète l’égalité avec le reste.",
            q: '<ul class="ex-conv ex-une-col ex-courtes">' + d.restes.map(function (x) { return "<li>" + (en ? "I divide " + x[0] + " by " + x[1] + ": " : "Je divise " + x[0] + " par " + x[1] + " : ") + x[0] + " = (" + x[1] + " × " + exT(String(x[2])) + ") + " + exT(String(x[3])) + "</li>"; }).join("") + "</ul>",
            r: d.restes.map(function (x) { return x[0] + " = (" + x[1] + " × " + x[2] + ") + " + x[3]; }).join(" · ") },
          { c: en ? "Complete with the right number." : "Complète avec le bon nombre.",
            q: '<p class="ex-egalite">' + v[0] + " = (" + v[1] + " × " + v[2] + ") + " + v[3] + '</p><ul class="ex-conv">' + (en ? ["The dividend is ", "The divisor is ", "The quotient is ", "The remainder is "] : ["Le dividende est ", "Le diviseur est ", "Le quotient est ", "Le reste est "]).map(function (s, i) { return "<li>" + s + exT(String(v[i])) + ".</li>"; }).join("") + "</ul>",
            r: (en ? "dividend " : "dividende ") + v[0] + (en ? " · divisor " : " · diviseur ") + v[1] + " · quotient " + v[2] + (en ? " · remainder " : " · reste ") + v[3] },
          { c: en ? "Solve the problem." : "Résous le problème.",
            q: "<p>" + (en ? "Nina has " + pb[0] + " shells. She puts them in boxes of " + pb[1] + ". How many boxes can she fill? How many shells are left?" : "Nina a " + pb[0] + " coquillages. Elle les range dans des boîtes de " + pb[1] + ". Combien de boîtes peut-elle remplir ? Combien de coquillages reste-t-il ?") + "</p><p>" + '<span class="ex-moyen">' + exT(pb[0] + " = (" + pb[1] + " × " + pb[2] + ") + " + pb[3]) + "</span> &nbsp; " + (en ? "She fills " : "Elle remplit ") + exT(String(pb[2])) + (en ? " boxes. There are " : " boîtes. Il reste ") + exT(String(pb[3])) + (en ? " shells left." : " coquillages.") + "</p>",
            r: pb[0] + " = (" + pb[1] + " × " + pb[2] + ") + " + pb[3] + " · " + (en ? pb[2] + " boxes, " + pb[3] + " left" : pb[2] + " boîtes, il reste " + pb[3] + " coquillages") }
        ]);
      }
    },
    { /* niveau 3 : tables jusqu’à 8, avec reste, sans aide ; vocabulaire à l’envers, égalités à vérifier, problème « quotient + 1 » (repère du niveau 3) */
      but: "Tables jusqu’à 8, avec reste et sans aide ; retrouver le dividende, vérifier une égalité (le reste plus petit que le diviseur), un problème en plusieurs questions (quotient + 1).",
      rappel: function (en) { return en ? "43 = (5 × 8) + 3: 43 is the dividend, 5 the divisor, 8 the quotient and 3 the remainder. The remainder is always smaller than the divisor."
        : "43 = (5 × 8) + 3 : 43 est le dividende, 5 le diviseur, 8 le quotient et 3 le reste. Le reste est toujours plus petit que le diviseur."; },
      tirer: function () {
        var sits = dvSits(2, 3, 8, 9, true).map(function (x) { var r = HE.rint(1, x.b - 1); x.r = r; x.t = x.b * x.q + r; return x; });
        var restes = [dvReste(6, 8, 3, 9), dvReste(6, 8, 3, 9), dvReste(4, 8, 4, 9), dvReste(4, 8, 4, 9)];
        var qui = [dvReste(4, 8, 4, 9), dvReste(4, 8, 4, 9)];
        var juste = [dvReste(4, 8, 3, 9), dvReste(4, 7, 3, 8), dvReste(4, 7, 3, 8)].map(function (x, i) { if (!i) return { e: x, ok: true }; var b = x[1], q = x[2] - 1, r = x[3] + b; return { e: [x[0], b, q, r], ok: false, bon: x }; });
        return { sits: sits, restes: restes, qui: qui, juste: HE.shuf(juste), pb: dvReste(5, 8, 4, 8) };
      },
      exos: function (d, en) {
        var div = en ? " ÷ " : " : ", pb = d.pb, eg = function (x) { return x[0] + " = (" + x[1] + " × " + x[2] + ") + " + x[3]; };
        var oui = en ? "yes" : "oui", non = en ? "no" : "non";
        return dvQ([
          { c: en ? "Do I group or do I share? Circle, then write the equality and answer." : "Est-ce que je groupe ou est-ce que je partage ? Entoure, puis écris l’égalité et réponds.",
            q: '<ol class="ex-conv ex-une-col ex-dv-sit">' + d.sits.map(function (x) { return "<li>" + esc(dvSit(x.s, x.t, x.b, en)) + (en ? " How many " + x.s.o[1] + " are left?" : " Combien de " + x.s.o[0] + " reste-t-il ?") + "<br>" + dvChoix(x.s, en) + '<span class="ex-sep"></span>' + '<span class="ex-moyen">' + exT(x.t + " = (" + x.b + " × " + x.q + ") + " + x.r) + "</span><br>" + (en ? "Answer: " : "Réponse : ") + exT(x.q + " " + x.s.u[en ? 1 : 0] + (en ? ", " + x.r + " " + x.s.o[1] + " left" : ", il reste " + x.r + " " + x.s.o[0]), true) + "</li>"; }).join("") + "</ol>",
            r: d.sits.map(function (x) { return x.t + " = (" + x.b + " × " + x.q + ") + " + x.r; }).join(" · ") },
          { c: en ? "Divide. Write the equality, then the quotient and the remainder." : "Divise. Écris l’égalité, puis le quotient et le reste.",
            q: '<ul class="ex-conv ex-une-col ex-courtes">' + d.restes.map(function (x) { return "<li>" + (en ? "I divide " + x[0] + " by " + x[1] + ": " : "Je divise " + x[0] + " par " + x[1] + " : ") + x[0] + " = (" + x[1] + " × " + exT(String(x[2])) + ") + " + exT(String(x[3])) + " &nbsp; " + (en ? "quotient " : "quotient ") + exT(String(x[2])) + (en ? " remainder " : " reste ") + exT(String(x[3])) + "</li>"; }).join("") + "</ul>",
            r: d.restes.map(eg).join(" · ") },
          { c: en ? "Who am I?" : "Qui suis-je ?",
            q: '<ul class="ex-conv ex-une-col">' + d.qui.map(function (x) { return "<li>" + (en ? "My divisor is " + x[1] + ", my quotient is " + x[2] + " and my remainder is " + x[3] + ". I am the dividend: " : "Mon diviseur est " + x[1] + ", mon quotient est " + x[2] + " et mon reste est " + x[3] + ". Je suis le dividende : ") + exT(String(x[0])) + "</li>"; }).join("") + "</ul>",
            r: d.qui.map(eg).join(" · ") },
          { c: en ? "Is the remainder smaller than the divisor? Circle. If not, write the right equality." : "Le reste est-il bien plus petit que le diviseur ? Entoure. Sinon, écris la bonne égalité.",
            q: '<ul class="ex-conv ex-une-col">' + d.juste.map(function (x) { return "<li>" + (en ? "I divide " + x.e[0] + " by " + x.e[1] + ": " : "Je divise " + x.e[0] + " par " + x.e[1] + " : ") + eg(x.e) + " &nbsp; " + exG((x.ok ? exC(oui) : oui) + '<span class="ex-sep">/</span>' + (x.ok ? non : exC(non)), "cercle") + " &nbsp; " + '<span class="ex-moyen">' + (x.ok ? exT("—") : exT(eg(x.bon))) + "</span>" + "</li>"; }).join("") + "</ul>",
            r: d.juste.map(function (x) { return x.ok ? eg(x.e) + (en ? " (right)" : " (juste)") : eg(x.bon); }).join(" · ") },
          { c: en ? "Solve the problem." : "Résous le problème.",
            q: "<p>" + (en ? "Tao has " + pb[0] + " lychees. He puts them in bags of " + pb[1] + "." : "Tao a " + pb[0] + " letchis. Il les met dans des sachets de " + pb[1] + ".") + "</p><ol class=\"ex-conv ex-une-col\"><li>" + (en ? "How many bags can he fill? " : "Combien de sachets peut-il remplir ? ") + exT(String(pb[2])) + "</li><li>" + (en ? "How many lychees are left? " : "Combien de letchis reste-t-il ? ") + exT(String(pb[3])) + "</li><li>" + (en ? "How many bags does he need to put away all the lychees? " : "Combien de sachets lui faut-il pour ranger tous les letchis ? ") + exT(String(pb[2] + 1)) + "</li></ol>",
            r: eg(pb) + " · " + (en ? pb[2] + " full bags, " + pb[3] + " left, " + (pb[2] + 1) + " bags needed" : pb[2] + " sachets pleins, il reste " + pb[3] + " letchis, il faut " + (pb[2] + 1) + " sachets") }
        ]);
      }
    }
  ];
  /* ---------- 3 niveaux pour les 7 autres séquences (validés sur le modèle de la division, 09/11/2026) [PROPOSITION] ----------
     Le niveau 2 reste la fiche d’origine (attendu de la classe) ; les niveaux 1 et 3 sont écrits ici.
     Objectifs : programmation P5 de l’enseignante pour l’heure digitale, l’heure à aiguilles et les masses (mot pour mot) ;
     objectifs proposés d’après les leçons et validés pour le verbe, les mots invariables, la monnaie et le graphique en barres. */
  function exNiveaux(seq, objectifs, n1, but2, n3) { EXOS[seq].objectifs = objectifs; EXOS[seq].niveaux = [n1, { but: but2 }, n3]; }
  function exListe(L, f, cls) { return '<ul class="ex-conv ' + (cls || "") + '">' + L.map(function (x, i) { return "<li>" + f(x, i) + "</li>"; }).join("") + "</ul>"; }
  var exNu = function (m) { return m.replace(/[.,!?…]+$/, ""); };

  /* ===== Le verbe (leçon CONJ2) ===== */
  /* phrases où le verbe n’est pas le 2e ou le 3e mot (niveau 3) [PROPOSITION] */
  var EX_PHRASES3 = [{ mots: ["Dans", "le", "lagon,", "les", "tortues", "nagent."], v: 5, neg: "Dans le lagon, les tortues ne nagent pas." },
    { mots: ["Ce", "matin,", "Méi", "prépare", "un", "gâteau."], v: 3, neg: "Ce matin, Méi ne prépare pas un gâteau." },
    { mots: ["Sous", "le", "cocotier,", "Dylan", "lit", "une", "histoire."], v: 4, neg: "Sous le cocotier, Dylan ne lit pas une histoire." },
    { mots: ["À", "la", "récréation,", "les", "élèves", "courent."], v: 5, neg: "À la récréation, les élèves ne courent pas." },
    { mots: ["Le", "petit", "chien", "de", "Vaka", "aboie", "fort."], v: 5, neg: "Le petit chien de Vaka n’aboie pas fort." },
    { mots: ["Les", "grands", "arbres", "de", "la", "forêt", "semblent", "immenses."], v: 6, neg: "Les grands arbres de la forêt ne semblent pas immenses." }];
  /* petits textes : les verbes conjugués sont entre crochets [PROPOSITION] */
  var EX_TEXTES = ["Le soir, Wadra [rentre] à la maison. Il [prend] une douche. Sa maman [prépare] le repas.",
    "Kakou [vit] dans la forêt. Il [est] gris. Il [cherche] des vers sous les feuilles.",
    "Les enfants [arrivent] à la plage. Tao [plonge] dans l’eau. Nina [semble] heureuse.",
    "Ce matin, il [pleut] sur Nouméa. Les élèves [restent] en classe. La maîtresse [lit] une histoire."];
  function vbSouligne(x) { return x.mots.map(function (m, j) { return j === x.v ? exC(esc(exNu(m))) + esc(m.slice(exNu(m).length)) : esc(m); }).join(" "); }
  function vbEtat(L, en) { return '<ul class="ex-fr ex-deux-col">' + L.map(function (x) { return "<li>" + exS('<span class="ex-boite"></span>', '<span class="ex-boite tb-lettre">' + (en ? (x[1] === "E" ? "S" : "A") : (x[1] === "E" ? "É" : "A")) + "</span>", true) + " " + esc(x[0]) + "</li>"; }).join("") + "</ul>"; }
  function vbEtatR(L, en) { return L.map(function (x) { return en ? (x[1] === "E" ? "S" : "A") : (x[1] === "E" ? "É" : "A"); }).join(" · "); }
  function vbSujet(x) { return /^(Il|Elle|Ils|Elles|Nous|Vous|Je|Tu|On|Les|La|Le|Mes|Ma|Mon)( |$)/.test(x[0]) ? x[0].charAt(0).toLowerCase() + x[0].slice(1) : x[0]; }
  exNiveaux("verbe", [
    "L’élève est capable de reconnaître si un verbe exprime un état (être, sembler, paraître) ou une action.",
    "L’élève est capable de trouver le verbe conjugué dans une phrase en la mettant à la forme négative (ne… pas).",
    "L’élève est capable de repérer que le verbe change selon le temps de la phrase (passé, présent, futur)."
  ], {
    but: "Phrases courtes ; la forme négative est donnée pour trouver le verbe ; un seul exemple de « hier, aujourd’hui, demain » ; les verbes d’état sont rappelés.",
    rappel: function (en) { return en ? "To find the conjugated verb, I make the sentence negative: the verb is between <span class=\"coco-negation\">ne</span> and <span class=\"coco-negation\">pas</span>! The rain falls → The rain does not fall."
      : "Pour trouver le verbe conjugué, je mets la phrase à la <b>forme négative</b> : le verbe est entre <span class=\"coco-negation\">ne</span> et <span class=\"coco-negation\">pas</span> ! La pluie tombe → La pluie <span class=\"coco-negation\">ne</span> tombe <span class=\"coco-negation\">pas</span>."; },
    tirer: function () { var ch = HE.shuf(C.verbe.chasse.concat(EX_PHRASES).filter(function (x) { return x.mots.length <= 6; }));
      return { neg: ch.slice(0, 3), soul: ch.slice(3, 6), temps: HE.pk(EX_TEMPS), etat: HE.shuf(HE.shuf(EX_ETAT.filter(function (x) { return x[1] === "E"; })).slice(0, 2).concat(HE.shuf(EX_ETAT.filter(function (x) { return x[1] === "A"; })).slice(0, 2))) }; },
    exos: function (d, en) {
      var negC = function (x) { var v = exNu(x.mots[x.v]), i = x.neg.indexOf(" " + v + " "); if (i < 0) i = x.neg.indexOf("'" + v + " "); if (i < 0) i = x.neg.indexOf("’" + v + " "); return i < 0 ? esc(x.neg) : esc(x.neg.slice(0, i + 1)) + exC(esc(v)) + esc(x.neg.slice(i + 1 + v.length)); };
      var t = d.temps, s = vbSujet(t);
      return [
        { c: en ? "The sentence is negative. Circle the word between ne and pas: it is the verb." : "La phrase est à la forme négative. Entoure le mot entre ne et pas : c’est le verbe.",
          q: '<ol class="ex-fr ex-phrases">' + d.neg.map(function (x) { return "<li>" + esc(x.mots.join(" ")) + " → " + exG(negC(x), "cercle") + "</li>"; }).join("") + "</ol>",
          r: d.neg.map(function (x) { return "<b>" + esc(exNu(x.mots[x.v])) + "</b>"; }).join(" · ") },
        { c: en ? "Underline the conjugated verb." : "Souligne le verbe conjugué.",
          q: '<ol class="ex-fr ex-phrases">' + d.soul.map(function (x) { return "<li>" + exG(vbSouligne(x), "soul") + "</li>"; }).join("") + "</ol>",
          r: d.soul.map(function (x) { return "<b>" + esc(exNu(x.mots[x.v])) + "</b>"; }).join(" · ") },
        { c: en ? "Circle the word that changes. It is the verb." : "Entoure le mot qui change. C’est le verbe.",
          q: '<ul class="ex-fr ex-temps">' + [["Hier", 1], ["Aujourd’hui", 2], ["Demain", 3]].map(function (u) { return "<li>" + exG(u[0] + ", " + esc(s) + " " + exC(t[u[1]]) + " " + esc(t[4]), "cverbe") + "</li>"; }).join("") + "</ul>",
          r: t[1] + ", " + t[2] + ", " + t[3] },
        { c: en ? "State or action? Write S (state) or A (action). State verbs: to be, to seem, to look." : "État ou action ? Écris É ou A. Les verbes d’état : être, sembler, paraître.",
          q: vbEtat(d.etat, en), r: vbEtatR(d.etat, en) }
      ];
    }
  }, "Fiche d’origine : souligner le verbe, passer à la forme négative, « hier, aujourd’hui, demain », état ou action, inventer une phrase.", {
    but: "Phrases plus longues où le verbe est loin du début ; écrire le verbe au passé et au futur ; trouver tous les verbes d’un petit texte.",
    rappel: EXOS.verbe.rappel,
    tirer: function () { var ch = HE.shuf(EX_PHRASES3);
      return { soul: ch.slice(0, 3), neg: ch.slice(3, 6), temps: HE.shuf(EX_TEMPS).slice(0, 2), etat: HE.shuf(EX_ETAT).slice(0, 6), texte: HE.pk(EX_TEXTES) }; },
    exos: function (d, en) {
      var negE = function (x) { var v = exNu(x.mots[x.v]), i = x.neg.indexOf(" " + v + " "); if (i < 0) i = x.neg.indexOf("’" + v + " ") ; return i < 0 ? esc(x.neg) : esc(x.neg.slice(0, i + 1)) + '<span class="tb-verbe">' + esc(v) + "</span>" + esc(x.neg.slice(i + 1 + v.length)); };
      var txt = esc(d.texte).replace(/\[([^\]]+)\]/g, function (_, v) { return exC(v); });
      return [
        { c: en ? "Underline the conjugated verb in each sentence." : "Souligne le verbe conjugué dans chaque phrase.",
          q: '<ol class="ex-fr ex-phrases">' + d.soul.map(function (x) { return "<li>" + exG(vbSouligne(x), "soul") + "</li>"; }).join("") + "</ol>",
          r: d.soul.map(function (x) { return "<b>" + esc(exNu(x.mots[x.v])) + "</b>"; }).join(" · ") },
        { c: en ? "Write each sentence with ne … pas, then circle the verb." : "Écris chaque phrase avec ne … pas, puis entoure le verbe.",
          q: '<ol class="ex-fr ex-phrases ex-neg">' + d.neg.map(function (x) { return "<li>" + esc(x.mots.join(" ")) + "<br>" + exT(negE(x), true) + "</li>"; }).join("") + "</ol>",
          r: d.neg.map(function (x) { return esc(x.neg); }).join(" · ") },
        { c: en ? "Write the verb for yesterday and for tomorrow." : "Écris le verbe pour hier et pour demain.",
          q: '<ul class="ex-fr ex-temps">' + d.temps.map(function (x) { var s = vbSujet(x); return "<li>Aujourd’hui, " + esc(s) + " " + x[2] + " " + esc(x[4]) + "<br>Hier, " + esc(s) + " " + exT(x[1]) + " " + esc(x[4]) + "<br>Demain, " + esc(s) + " " + exT(x[3]) + " " + esc(x[4]) + "</li>"; }).join("") + "</ul>",
          r: d.temps.map(function (x) { return x[1] + " · " + x[3]; }).join(" — ") },
        { c: en ? "State or action? Write S (state) or A (action)." : "État ou action ? Écris É ou A.", q: vbEtat(d.etat, en), r: vbEtatR(d.etat, en) },
        { c: en ? "Underline all the conjugated verbs in the text." : "Souligne tous les verbes conjugués du texte.",
          q: '<p class="ex-fr ex-texte">' + exG(txt, "soul") + "</p>", r: (d.texte.match(/\[([^\]]+)\]/g) || []).map(function (v) { return "<b>" + esc(v.slice(1, -1)) + "</b>"; }).join(" · ") }
      ];
    }
  });

  /* ===== Les mots invariables (affiches 2026) : une famille ou une liste par fiche ===== */
  function moFamille(opt) { return MO.FAMS.filter(function (f) { return f.id === opt; })[0] || MO.FAMS.filter(function (f) { return f.group.id === opt; })[0] || MO.FAMS.filter(function (f) { return f.id === "g1-1"; })[0]; }
  function moTirer(opt) { var f = moFamille(opt), sel = {}; sel[f.id] = 1; return { fam: f, sel: sel, pool: HE.shuf(MO.pool(sel)), gaps: HE.shuf(MO.gapPool(sel)) }; }
  function moFam(f) { return { key: f.key, words: f.words, liste: /^\d+$/.test(MO.plain(f.key)) }; }
  function moCycle(L, n) { var r = []; for (var i = 0; L.length && r.length < n; i++) r.push(L[i % L.length]); return r; }
  function moCle(k) { return MO.plain(k).replace(/^-/, "… ").replace(/-$/, " …"); }
  function moNom(f) { var k = MO.plain(f.key); return /^\d+$/.test(k) ? "Liste " + k : moCle(f.key); }
  /* une phrase à trous remplie ; « ne ... pas » remplit deux trous (ne, puis pas) ; q.rep remplace le mot si besoin (« à l’envers ») */
  function moParts(q) { return String(q.rep || q.p).split(/\s*\.\.\.\s*/); }
  function moRemplir(q, f) { var P = moParts(q), i = 0; return q.sent.split("___").map(function (morceau, k) { return k === 0 ? (f ? f.texte(morceau) : morceau) : (f ? f.trou(P[Math.min(i++, P.length - 1)]) : P[Math.min(i++, P.length - 1)]) + (f ? f.texte(morceau) : morceau); }).join(""); }
  function moPhraseDictee(q) { var t = moRemplir(q); return t.charAt(0).toUpperCase() + t.slice(1); }
  /* Une phrase par mot pour l’exercice 2 (demande de l’enseignante, 10/11/2026) : phrases écrites par Claude pour les mots qui n’en avaient pas [PROPOSITION] */
  var MO_TROUS_PLUS = { "ne ... pas": ["Le cagou ___ vole ___."], "tantôt": ["Le ciel est ___ bleu, ___ gris."], "auprès": ["Le chaton dort ___ de sa maman."], "au-dessus": ["L’avion vole ___ de la maison."],
    "là-dessus": ["Voici une chaise : assieds-toi ___."], "par-dessus": ["Le chat saute ___ la barrière."], "dessous": ["Le chat dort sur le lit, et le chien dort ___."], "en dessous": ["Écris ton prénom sur la ligne, et la date juste ___."],
    "par-dessous": ["Le serpent passe ___ la barrière."], "dès lors": ["Tao a perdu sa clé ; ___, il range toujours ses affaires."], "(à) l’envers": ["Dylan a mis sa casquette ___.", "à l’envers"], "tout à coup": ["Nous jouions dehors quand, ___, la pluie est tombée."],
    "quoique": ["Il sort jouer, ___ le temps soit gris."], "lors": ["Nous avons vu des tortues ___ de notre sortie à la plage."], "dehors": ["Il fait beau : les enfants jouent ___."], "ici": ["Viens ___, près de moi !"], "ceci": ["Regarde ___ : c’est un coquillage rare."],
    "dedans": ["Ouvre la boîte : il y a un cadeau ___."], "dès que": ["Je range mon cartable ___ je rentre de l’école."], "parce que": ["Léo met son chapeau ___ le soleil brille."], "auparavant": ["Il habite à Nouméa ; ___, il vivait à Koné."], "dorénavant": ["Le bus passe plus tôt : ___, nous partirons à sept heures."] };
  /* Phrases à dicter écrites par Claude, pour que chaque famille en ait au moins deux qui ne sont pas dans l’exercice 2 [PROPOSITION] */
  var MO_PHRASES_PLUS = { "g0-7": ["Il y a des poissons dans le lagon."], "g0-8": ["Margouille ne dort plus.", "Je ne mange pas de piment."], "g0-9": ["Nous allons à la plage.", "Vous jouez au ballon."], "g0-10": ["Léo court vite comme le vent.", "Méi aime aussi les letchis."],
    "g1-0": ["Parfois, Kakou se cache sous les feuilles.", "Autrefois, Papi Tao allait à l’école à pied."], "g1-4": ["Les nuages passent au-dessus du lagon.", "Lis la consigne ci-dessus."], "g1-5": ["Le crabe se cache en dessous du rocher."], "g1-6": ["Lorsque la cloche sonne, nous rentrons en classe.", "La pluie tombe ; alors, Kakou court se cacher."],
    "g1-8": ["Le vent souffle à travers les arbres.", "Tao a mis son pull à l’envers."], "g1-9": ["Depuis ce matin, il pleut sur Nouméa."], "g1-10": ["Voilà le bus de l’école !", "Le chat est passé par-là."], "g1-11": ["Kakou ne vole jamais.", "Désormais, je range ma chambre."],
    "g1-13": ["Pourquoi le cagou ne vole-t-il pas ?", "Pourquoi pleures-tu ?"], "g2-0": ["Ensuite, nous mangeons encore un fruit."], "g2-1": ["Aujourd’hui, Méi mange une papaye.", "Les poules courent autour de la case."], "g2-2": ["Comment vas-tu ?", "Tao va souvent à la pêche."],
    "g2-7": ["Il est presque midi.", "Lorsque le soleil se couche, le ciel devient rose."], "g2-8": ["Le bus s’arrête devant l’école.", "Je me brosse les dents avant de dormir."], "g0-4": ["Il mange du pain au chocolat.", "J’ai une petite sœur."], "g0-15": ["Quand le soleil se lève, Kakou sort de son nid.", "Léo et Tao portent le même tee-shirt."], "g0-1": ["La tortue nage dans le lagon.", "Les enfants jouent au ballon."], "g2-3": ["Le chien attend dehors."], "g2-5": ["La valise est vide : il n’y a rien dedans."], "g3-1": ["D’accord, je viens avec toi.", "D’abord, je range mes affaires."], "g2-9": ["Maintenant, nous allons lire.", "Il a plu pendant toute la nuit."], "g2-11": ["Demain, nous irons au marché.", "Soudain, le chat saute sur la table."],
    "g2-12": ["Combien de billes as-tu ?", "Je vais bien, merci."], "g2-13": ["Plusieurs enfants jouent dans la cour.", "Le chat est allé dormir ailleurs."], "g3-0": ["Margouille dort toujours au soleil."], "g3-2": ["Parmi les fruits, je préfère la mangue.", "Aujourd’hui, il fait beau."],
    "g3-3": ["Je joue avec mon frère.", "Il fait nuit, donc je rentre à la maison."], "g3-5": ["Il est déjà huit heures !", "Je compte jusqu’à cent."] };
  /* Répartit les phrases : une phrase à compléter par mot de la famille, et des phrases à dicter, jamais les mêmes (une phrase dictée ne doit pas être sous les yeux de l’élève) */
  function moRepartir(T, nDictee) {
    var trous = [], autres = [];
    T.pool.forEach(function (x) { var G = T.gaps.filter(function (q) { return q.p === x.p; }), t = MO_TROUS_PLUS[x.p];
      if (G.length) { trous.push(G[0]); G.slice(1).forEach(function (q) { autres.push(moPhraseDictee(q)); }); } else if (t) trous.push({ p: x.p, m: x.m, sent: t[0], rep: t[1] }); });
    var deja = trous.map(moPhraseDictee), sent = T.pool.map(function (x) { return MO.SENT[x.p]; }).filter(Boolean);
    var libres = HE.shuf((MO_PHRASES_PLUS[T.fam.id] || []).concat(sent, autres).filter(function (p, i, L) { return deja.indexOf(p) < 0 && L.indexOf(p) === i; }));
    return { trous: trous, dictee: libres.slice(0, nDictee) };
  }
  function moTrous(L) { return '<ul class="ex-fr ex-mots">' + L.map(function (x) { return "<li>" + esc(x.h.before) + exT(esc(x.h.seg)) + esc(x.h.after) + "</li>"; }).join("") + "</ul>"; }
  /* niveau 3 : seule la première lettre est donnée (b…… pour bientôt ; d’…… pour d’après) */
  function moTrouLong(m) { var p = MO.plain(m).replace(/^\((à)\) /, "$1 "), k = /^[a-zàâéèêîôûç]’/i.test(p) ? 2 : 1; return { before: p.slice(0, k), seg: p.slice(k), after: "" }; }
  function moDictee(L, en) { return { c: en ? "Word dictation: write the words your teacher reads." : "Dictée de mots : écris les mots que dit la maîtresse.",
    q: '<ol class="ex-dictee ex-deux-col-ol">' + L.map(function (x) { return "<li>" + exT(MO.html(x.m), true) + "</li>"; }).join("") + "</ol>",
    r: (en ? "Words to read aloud: " : "Mots à dicter : ") + L.map(function (x) { return MO.html(x.m); }).join(" · ") }; }
  function moDicteePhrases(P, en) { return { c: P.length > 1 ? (en ? "Sentence dictation: write the sentences your teacher reads." : "Dictée de phrases : écris les phrases que dit la maîtresse.") : (en ? "Sentence dictation: write the sentence your teacher reads." : "Dictée de phrase : écris la phrase que dit la maîtresse."),
    q: '<p class="ex-invente">' + P.map(function (p) { return exT(esc(p), true) + EXLL; }).join("") + "</p>", r: (en ? "To read aloud: " : "À dicter : ") + P.map(esc).join(" ") }; }
  /* niveau 3 (d.sansListe) : la liste n’est pas donnée, seulement le nom de la famille ; elle donnerait les réponses de l’exercice 1 */
  function moCompleter(d, en) { var L = d.sansListe && !d.fam.liste;
    return { c: L ? (en ? "Complete each sentence with a word from the family." : "Complète chaque phrase avec un mot de la famille.") : (en ? "Complete each sentence with a word from the list." : "Complète chaque phrase avec un mot de la liste."),
    q: '<p class="ex-fr ex-banque">' + (L ? (en ? "Family: " : "Famille : ") + "<b>" + esc(moCle(d.fam.key)) + "</b>" : d.fam.words.map(function (w) { return esc(MO.plain(w)); }).join(" · ")) + '</p><ul class="ex-fr ex-phrases">' + d.phrases.map(function (x) { return "<li>" + moRemplir(x, { texte: esc, trou: function (w) { return exT(esc(w)); } }) + "</li>"; }).join("") + "</ul>", r: d.phrases.map(function (x) { return esc(x.rep || x.p); }).join(" · ") }; }
  /* niveaux 2 et 3 : 1. lettres qui manquent ; 2. phrases à compléter ; 3. dictée de mots ; 4. dictée de phrase(s) (ordre demandé par l’enseignante ;
     aucun exercice ne montre un mot mal écrit, recommandation d’Ouzoulias rappelée par l’enseignante) */
  function moExos(d, en) {
    var ex = [{ c: en ? "Fill in the missing letters." : "Complète les lettres qui manquent.", q: moTrous(d.trous), r: d.trous.map(function (x) { return esc(x.h.before + x.h.seg + x.h.after); }).join(" · ") }];
    if (d.phrases.length) ex.push(moCompleter(d, en));
    ex.push(moDictee(d.dictee, en));
    if (d.dicteePh.length) ex.push(moDicteePhrases(d.dicteePh, en));
    return ex;
  }
  /* niveau 1 : lettres d’un mot mélangées, mot par mot pour les expressions (tant pis : n t a t / s i p) */
  function moMelanger(p) { return p.replace(/[()]/g, "").split(" ").filter(Boolean).map(function (w) { var L = w.split(""), r = L, k = 0; if (L.length > 1) do { r = HE.shuf(L); k++; } while (r.join("") === w && k < 9); return r; }); }
  function moCarreaux(G) { return G.map(function (L) { return L.map(function (c) { return '<span class="ex-lettre">' + esc(c) + "</span>"; }).join(""); }).join('<span class="ex-sep">/</span>'); }
  function moMotsMelanges(p) { var M = p.split(" "), r = M, k = 0; if (M.length > 1) do { r = HE.shuf(M); k++; } while (r.join(" ") === p && k < 9); return r; }
  /* « Entoure la partie commune » (famille) ou « Recopie les mots » (liste de mots-outils, sans partie commune) */
  function moObserver(f, en) {
    var W = f.words;
    if (f.liste) return { c: en ? "Read the words of the list, then copy them." : "Lis les mots de la liste, puis recopie-les.", q: '<ul class="ex-fr ex-mots">' + W.map(function (w) { return "<li>" + esc(MO.plain(w)) + " " + exT(MO.html(w)) + "</li>"; }).join("") + "</ul>", r: W.map(MO.html).join(" · ") };
    return { c: en ? "These words are from the same family. Circle their common part." : "Ces mots sont de la même famille. Entoure leur partie commune.",
      q: '<p class="ex-fr ex-banque">' + W.map(function (w) { return exS(esc(MO.plain(w)), MO.html(w), true); }).join(" · ") + "</p>", r: esc(moCle(f.key)) + " : " + W.map(MO.html).join(" · ") };
  }
  exNiveaux("mots", [
    "L’élève est capable d’orthographier correctement les mots invariables de ses listes.",
    "L’élève est capable de reconnaître la partie commune des mots d’une même famille (tôt, aussitôt, plutôt).",
    "L’élève est capable de choisir le mot invariable qui convient pour compléter une phrase."
  ], {
    but: "Les mêmes mots, avec des aides : entourer la partie commune, cocher le mot qui complète la phrase, remettre les lettres dans l’ordre, remettre les mots de la phrase dans l’ordre.",
    rappel: EXOS.mots.rappel,
    tirer: function (opt) { var T = moTirer(opt), P = moRepartir(T, 1);
      return { fam: moFam(T.fam), phrases: P.trous.map(function (q) { return { w: q.p, s: q.sent }; }), lettres: HE.shuf(T.pool).map(function (x) { return { m: x.m, g: moMelanger(x.p) }; }),
        ordre: P.dictee.map(function (p) { return { p: p, m: moMotsMelanges(p) }; }) }; },
    exos: function (d, en) {
      var W = d.fam.words.map(MO.plain), ex = [moObserver(d.fam, en)];
      if (d.phrases.length) ex.push({ c: en ? "Tick the word that completes the sentence." : "Coche le mot qui complète la phrase.",
        q: '<ul class="ex-fr ex-phrases ex-cocher">' + d.phrases.map(function (x) { return "<li>" + esc(x.s).split("___").join("……") + '<span class="ex-coches">' + W.map(function (w) { return '<span class="ex-coche">' + exS("☐", w === x.w ? "☑" : "☐", true) + " " + esc(w) + "</span>"; }).join("") + "</span></li>"; }).join("") + "</ul>",
        r: d.phrases.map(function (x) { return esc(x.w); }).join(" · ") });
      ex.push({ c: en ? "Put the letters in order to write the word." : "Remets les lettres dans l’ordre pour écrire le mot.",
        q: '<ul class="ex-fr ex-lettres">' + d.lettres.map(function (x) { return "<li>" + moCarreaux(x.g) + " → " + exT(MO.html(x.m)) + "</li>"; }).join("") + "</ul>", r: d.lettres.map(function (x) { return MO.html(x.m); }).join(" · ") });
      if (d.ordre.length) ex.push({ c: en ? "Put the words in order to write the sentence." : "Remets les mots dans l’ordre pour écrire la phrase.",
        q: d.ordre.map(function (x) { return '<p class="ex-fr ex-banque">' + x.m.map(esc).join(" · ") + '</p><p class="ex-invente">' + exT(esc(x.p), true) + "</p>"; }).join(""), r: d.ordre.map(function (x) { return esc(x.p); }).join(" ") });
      return ex;
    }
  }, "Fiche d’origine, avec les seuls mots choisis : lettres qui manquent, phrases à compléter avec un mot de la liste, dictée de mots, dictée d’une phrase.", {
    but: "Les mêmes mots, avec moins d’aide : seule la première lettre est donnée, phrases à compléter avec le nom de la famille seulement, dictée de mots, dictée de deux phrases.",
    rappel: EXOS.mots.rappel,
    tirer: function (opt) { var T = moTirer(opt), P = moRepartir(T, 2);
      return { fam: moFam(T.fam), trous: T.pool.map(function (x) { return { m: x.m, h: moTrouLong(x.m) }; }), phrases: P.trous, dictee: HE.shuf(T.pool), dicteePh: P.dictee, sansListe: true }; },
    exos: function (d, en) { return moExos(d, en); }
  });

  /* ===== La monnaie et les prix (leçon GM1) ===== */
  var MN_VRAIS = [5, 10, 20, 50, 100, 200, 500, 1000, 5000, 10000], MN_FAUX = [25, 30, 75, 300, 2000];
  function mnGlouton(n) { var L = []; MN_VRAIS.slice().reverse().forEach(function (v) { while (n >= v) { L.push(v); n -= v; } }); return L; }
  function mnDecompose(n) { var s = String(n), L = []; for (var i = 0; i < s.length; i++) if (s[i] !== "0") L.push(+s[i] * Math.pow(10, s.length - 1 - i)); return L; }
  function mnSomme(b) { return b.reduce(function (a, v) { return a + v; }, 0); }
  exNiveaux("monnaie", [
    "L’élève est capable de reconnaître les billets et les pièces de la monnaie calédonienne.",
    "L’élève est capable de calculer la somme formée par des billets et des pièces.",
    "L’élève est capable de décomposer une somme pour la constituer avec des billets et des pièces (6 875 F = 6 000 + 800 + 70 + 5).",
    "L’élève est capable de résoudre un problème simple de prix (payer, rendre la monnaie)."
  ], {
    but: "Reconnaître les vraies pièces et les vrais billets ; petites sommes (moins de 500 F) ; décomposer un prix à 3 chiffres ; un problème avec un seul achat.",
    rappel: EXOS.monnaie.rappel,
    tirer: function () { var P = [5, 10, 20, 50, 100], bourse = function () { return [HE.pk(P), HE.pk(P), HE.pk(P)].sort(function (x, y) { return y - x; }); };
      var cible = function () { var c = HE.shuf([10, 20, 50, 100, 200]).slice(0, 2); return c.sort(function (x, y) { return y - x; }); };
      var payer = [cible(), cible()].map(function (c) { return { c: c, montre: HE.shuf(c.concat(HE.shuf([5, 10, 20, 50, 100, 200].filter(function (v) { return c.indexOf(v) < 0; })).slice(0, 2))) }; });
      var dec = [HE.rint(1, 9) * 100 + HE.rint(1, 9) * 10 + 5, HE.rint(1, 9) * 100 + HE.rint(1, 9) * 10 + 5];
      return { vrai: HE.shuf(HE.shuf(MN_VRAIS).slice(0, 5).concat(HE.shuf(MN_FAUX).slice(0, 3))), bourses: [bourse(), bourse()], payer: payer, dec: dec, fruit: HE.pk(PO.FRUITS) }; },
    exos: function (d, en) {
      var f = d.fruit;
      return [
        { c: en ? "Circle the coins and notes we really use in New Caledonia." : "Entoure les pièces et les billets qui existent vraiment en Nouvelle-Calédonie.",
          q: '<div class="ex-bourse ex-vrais">' + d.vrai.map(function (v) { return MN_VRAIS.indexOf(v) >= 0 ? exG(exC(exPiece(v)), "cercle") : exPiece(v); }).join("") + "</div>",
          r: d.vrai.filter(function (v) { return MN_VRAIS.indexOf(v) >= 0; }).map(function (v) { return exMille(v) + " F"; }).join(" · ") },
        { c: en ? "How much money is there in each purse?" : "Combien d’argent y a-t-il dans chaque porte-monnaie ?",
          q: '<div class="ex-bourses">' + d.bourses.map(function (b) { return '<div><div class="ex-bourse">' + b.map(exPiece).join("") + "</div><p>" + exT(exMille(mnSomme(b))) + " F</p></div>"; }).join("") + "</div>",
          r: d.bourses.map(function (b) { return b.join(" F + ") + " F = " + mnSomme(b) + " F"; }).join(" · ") },
        { c: en ? "Circle the coins to pay exactly the price." : "Entoure les pièces pour payer le prix exact.",
          q: d.payer.map(function (x) { var reste = x.c.slice(); return '<div class="ex-payer"><b>' + mnSomme(x.c) + " F</b>" + exG('<div class="ex-bourse">' + x.montre.map(function (v) { var i = reste.indexOf(v); if (i < 0) return exPiece(v); reste.splice(i, 1); return exC(exPiece(v)); }).join("") + "</div>", "cercle", true) + "</div>"; }).join(""),
          r: d.payer.map(function (x) { return mnSomme(x.c) + " F = " + x.c.join(" F + ") + " F"; }).join(" · ") },
        { c: en ? "Split each amount, like 375 F = 300 + 70 + 5." : "Décompose chaque somme, comme 375 F = 300 + 70 + 5.",
          q: exListe(d.dec, function (n) { return n + " F = " + mnDecompose(n).map(function (p) { return exT(String(p)); }).join(" + "); }, "ex-une-col"),
          r: d.dec.map(function (n) { return n + " = " + mnDecompose(n).join(" + "); }).join(" · ") },
        { c: en ? "Solve the problem." : "Résous le problème.",
          q: "<p>" + (en ? "At the market, Tehani buys " + f.en + " for " + f.prix + " F. She pays with a 500 F note. How much change does she get?" : "Au marché, Tehani achète " + f.fr + " à " + f.prix + " F. Elle paie avec un billet de 500 F. Combien la marchande lui rend-elle ?") + "</p><p>" + (en ? "She gets " : "On lui rend ") + exT(String(500 - f.prix)) + " F.</p>",
          r: "500 F − " + f.prix + " F = " + (500 - f.prix) + " F" }
      ];
    }
  }, "Fiche d’origine : compter l’argent des porte-monnaie, payer le prix exact, deux façons de payer, rendre la monnaie, un problème avec deux achats.", {
    but: "Grandes sommes avec des billets (jusqu’à 9 995 F) ; décomposer une somme à 4 chiffres et la payer avec le moins de billets et de pièces possible ; un problème en plusieurs étapes.",
    rappel: EXOS.monnaie.rappel,
    tirer: function () { var bourse = function () { var b = [HE.pk([1000, 5000]), HE.pk([500, 1000]), HE.pk([100, 200]), HE.pk([50, 100]), HE.pk([5, 10, 20])]; if (Math.random() < 0.5) b.push(HE.pk([500, 1000])); return b.sort(function (x, y) { return y - x; }); };
      var n4 = function () { return HE.rint(1, 9) * 1000 + HE.rint(1, 9) * 100 + HE.rint(1, 9) * 10 + 5; };
      /* le problème : toutes les sommes restent sous 9 995 F (choix de l’enseignante) ; on paie avec le plus petit billet qui suffit */
      var fr = HE.shuf(PO.FRUITS).slice(0, 2), na = HE.rint(2, 9);
      return { bourses: [bourse(), bourse()], dec: [n4(), n4()], moins: n4(), rendre: [[1000, HE.rint(2, 18) * 50], [5000, HE.rint(11, 98) * 50], [10000, HE.rint(21, 198) * 50]], pb: { a: fr[0], b: fr[1], na: na } }; },
    exos: function (d, en) {
      var pb = d.pb, tot = pb.na * pb.a.prix + pb.b.prix, billet = tot < 1000 ? 1000 : tot < 5000 ? 5000 : 10000, reste = billet - tot;
      return [
        { c: en ? "How much money is there in each purse?" : "Combien d’argent y a-t-il dans chaque porte-monnaie ?",
          q: '<div class="ex-bourses">' + d.bourses.map(function (b) { return '<div><div class="ex-bourse">' + b.map(exPiece).join("") + "</div><p>" + exT(exMille(mnSomme(b))) + " F</p></div>"; }).join("") + "</div>",
          r: d.bourses.map(function (b) { return exMille(mnSomme(b)) + " F"; }).join(" · ") },
        { c: en ? "Split each amount." : "Décompose chaque somme.",
          q: exListe(d.dec, function (n) { return exMille(n) + " F = " + mnDecompose(n).map(function (p) { return exT(exMille(p)); }).join(" + "); }, "ex-une-col"),
          r: d.dec.map(function (n) { return exMille(n) + " = " + mnDecompose(n).map(exMille).join(" + "); }).join(" · ") },
        { c: en ? "Pay " + exMille(d.moins) + " F with as few notes and coins as possible." : "Paie " + exMille(d.moins) + " F avec le moins possible de billets et de pièces.",
          q: "<p>" + exT(mnGlouton(d.moins).map(function (v) { return exMille(v) + " F"; }).join(" + "), true) + "</p>",
          r: mnGlouton(d.moins).map(function (v) { return exMille(v) + " F"; }).join(" + ") + " (" + mnGlouton(d.moins).length + (en ? " notes and coins)" : " billets et pièces)") },
        { c: en ? "How much change do you get?" : "Combien la marchande rend-elle ?",
          q: exListe(d.rendre, function (x) { return (en ? "I pay " + exMille(x[1]) + " F with a " + exMille(x[0]) + " F note. I get " : "Je paie " + exMille(x[1]) + " F avec un billet de " + exMille(x[0]) + " F. On me rend ") + exT(exMille(x[0] - x[1])) + " F."; }, "ex-une-col"),
          r: d.rendre.map(function (x) { return exMille(x[0] - x[1]) + " F"; }).join(" · ") },
        { c: en ? "Solve the problem." : "Résous le problème.",
          q: "<p>" + (en ? "Tehani buys " + pb.na + " times " + pb.a.en + " at " + pb.a.prix + " F and " + pb.b.en + " at " + pb.b.prix + " F. She pays with a " + exMille(billet) + " F note. How much does she spend? How much change does she get? Can she then buy a lime at 50 F?"
            : "Tehani achète " + pb.na + " fois " + pb.a.fr + " à " + pb.a.prix + " F et " + pb.b.fr + " à " + pb.b.prix + " F. Elle paie avec un billet de " + exMille(billet) + " F. Combien dépense-t-elle ? Combien lui rend-on ? Peut-elle ensuite acheter un citron à 50 F ?") +
            "</p><p>" + (en ? "She spends " : "Elle dépense ") + exT(exMille(tot)) + " F. " + (en ? "She gets " : "On lui rend ") + exT(exMille(reste)) + " F. " + exT(reste >= 50 ? (en ? "Yes" : "Oui") : (en ? "No" : "Non")) + "</p>",
          r: pb.na + " × " + pb.a.prix + " + " + pb.b.prix + " = " + exMille(tot) + " F · " + exMille(billet) + " − " + exMille(tot) + " = " + exMille(reste) + " F · " + (reste >= 50 ? (en ? "yes" : "oui") : (en ? "no" : "non")) }
      ];
    }
  });

  /* ===== Lire un graphique en barres (leçon OGD1) ===== */
  function dgNomN(dd, i, en) { return en ? dd.ctx.cats[i].en : dd.ctx.cats[i].fr; }
  function dgFig(dd, en, o) { return '<figure class="ex-dg"><figcaption>' + esc(tr(dd.ctx.titre)) + "</figcaption>" + DG.diagramme(dd, Object.assign({ en: en }, o || {})) + "</figure>"; }
  function dgTab(dd, en, vide) { return '<table class="ex-tab"><tr><th>' + esc(tr(dd.ctx.axeX)) + "</th><th>" + (en ? "Number" : "Nombre") + "</th></tr>" + dd.ctx.cats.map(function (_, i) { return "<tr><td>" + esc(dgNomN(dd, i, en)) + "</td><td>" + (vide ? exT(String(dd.vals[i]), false, "") : dd.vals[i]) + "</td></tr>"; }).join("") + "</table>"; }
  function dgTirer(p1, p2, p3) { var ids = HE.shuf(DG.CONTEXTES.map(function (c) { return c.id; })); var d1 = DG.tirer(Object.assign({ ctx: ids[0] }, p1)); return { d1: d1, d2: DG.tirer(Object.assign({ ctx: ids[1] }, p2)), d3: DG.tirer(Object.assign({ ctx: ids[2] }, p3)), k: HE.shuf(d1.vals.map(function (_, i) { return i; })) }; }
  function dgConstruire(d3, en) { return { c: en ? "Draw the bar chart using the table." : "Construis le graphique à partir du tableau.", q: '<div class="ex-cote ex-construire">' + dgTab(d3, en) + exS(dgFig(d3, en, { vals: d3.vals.map(function () { return 0; }) }), dgFig(d3, en)) + "</div>", r: '<div class="ex-petit-dg">' + dgFig(d3, en) + "</div>" }; }
  function dgCompleter(d2, en) { return { c: en ? "Complete the table using the bar chart." : "Complète le tableau à partir du graphique.", q: '<div class="ex-cote">' + dgFig(d2, en) + dgTab(d2, en, true) + "</div>", r: d2.ctx.cats.map(function (_, i) { return esc(dgNomN(d2, i, en)) + " " + d2.vals[i]; }).join(" · ") }; }
  exNiveaux("diagrammes", [
    "L’élève est capable de lire une information dans un tableau et dans un graphique en barres.",
    "L’élève est capable de compléter un graphique en barres à partir d’un tableau.",
    "L’élève est capable d’utiliser les données d’un graphique pour répondre à une question ou résoudre un problème (comparer, trouver un écart ou un total)."
  ], {
    but: "Graduations de 1 en 1, petits nombres ; trois questions de lecture (une barre, le plus, le moins).",
    rappel: EXOS.diagrammes.rappel,
    tirer: function () { return dgTirer({ pas: 1, niveaux: 9, min: 1 }, { pas: 1, niveaux: 8, min: 1 }, { pas: 1, niveaux: 7, min: 1 }); },
    exos: function (d, en) {
      var d1 = d.d1, a = d.k[0], im = d1.vals.indexOf(Math.max.apply(null, d1.vals)), il = d1.vals.indexOf(Math.min.apply(null, d1.vals));
      var qs = [[en ? "What number does the “" + dgNomN(d1, a, en) + "” bar show?" : "Quel nombre la barre « " + dgNomN(d1, a, en) + " » indique-t-elle ?", String(d1.vals[a])], [tr(d1.ctx.plus), esc(dgNomN(d1, im, en))], [tr(d1.ctx.moins), esc(dgNomN(d1, il, en))]];
      return [
        { c: en ? "Read the bar chart and answer." : "Lis le graphique et réponds.", q: '<div class="ex-cote">' + dgFig(d1, en) + '<ol class="ex-qs">' + qs.map(function (x) { return "<li>" + esc(x[0]) + " " + exT(x[1]) + "</li>"; }).join("") + "</ol></div>", r: qs.map(function (x) { return x[1]; }).join(" · ") },
        dgCompleter(d.d2, en), dgConstruire(d.d3, en)
      ];
    }
  }, "Fiche d’origine : graduations de 2 en 2 et de 5 en 5 ; six questions de lecture, dont le total et l’écart ; compléter un tableau ; construire un graphique.", {
    but: "Graduations de 5 en 5 et de 10 en 10, des barres qui s’arrêtent entre deux graduations ; questions d’écart, de total et en deux étapes ; construire un graphique de 5 en 5.",
    rappel: EXOS.diagrammes.rappel,
    tirer: function () { return dgTirer({ pas: 10, niveaux: 8, min: 10, demi: true }, { pas: 10, niveaux: 8, min: 10, demi: true }, { pas: 5, niveaux: 8, min: 5 }); },
    exos: function (d, en) {
      var d1 = d.d1, a = d.k[0], b = d.k[1], c = d.k[2], hi = d1.vals[a] >= d1.vals[b] ? a : b, lo = hi === a ? b : a, ec = DG.ecart(d1.ctx, d1.ctx.cats[hi], d1.ctx.cats[lo]);
      var tri = d1.vals.map(function (v, i) { return i; }).sort(function (x, y) { return d1.vals[x] - d1.vals[y]; });
      var deux = d1.vals[a] + d1.vals[c];
      var qs = [[tr(ec), String(d1.vals[hi] - d1.vals[lo])], [en ? "How many " + d1.ctx.axe.en + " are there in all?" : "Combien " + d1.ctx.axe.de + " y a-t-il en tout ?", String(DG.somme(d1.vals))],
        [en ? "How many for “" + dgNomN(d1, a, en) + "” and “" + dgNomN(d1, c, en) + "” together?" : "Combien pour « " + dgNomN(d1, a, en) + " » et « " + dgNomN(d1, c, en) + " » ensemble ?", String(deux)],
        [en ? "Write the bars in order, from the smallest to the largest." : "Range les barres de la plus petite à la plus grande.", tri.map(function (i) { return esc(dgNomN(d1, i, en)); }).join(" &lt; ")]];
      return [
        { c: en ? "Read the bar chart and answer." : "Lis le graphique et réponds.", q: '<div class="ex-cote">' + dgFig(d1, en) + '<ol class="ex-qs">' + qs.map(function (x, i) { return "<li>" + esc(x[0]) + " " + exT(x[1], i === 3) + "</li>"; }).join("") + "</ol></div>",
          r: (d1.vals[hi] + " − " + d1.vals[lo] + " = " + (d1.vals[hi] - d1.vals[lo])) + " · " + d1.vals.join(" + ") + " = " + DG.somme(d1.vals) + " · " + d1.vals[a] + " + " + d1.vals[c] + " = " + deux + " · " + qs[3][1] },
        dgCompleter(d.d2, en), dgConstruire(d.d3, en)
      ];
    }
  });

  /* ===== Lire l’heure digitale (P5, séquence 1) ===== */
  var DI_J = [["Je me lève", "I get up", [6, 7]], ["Je pars à l’école", "I leave for school", [7, 7]], ["La récréation est", "Break time is", [9, 10]], ["Je mange", "I have lunch", [11, 12]], ["Je finis l’école", "School finishes", [15, 15]], ["Je me couche", "I go to bed", [19, 20]]];
  var DI_PB = [["La récréation commence à", "Break time starts at", "Elle dure", "It lasts", "À quelle heure finit-elle ?", "What time does it end?"], ["Le film commence à", "The film starts at", "Il dure", "It lasts", "À quelle heure finit-il ?", "What time does it end?"], ["Le cours de natation commence à", "The swimming lesson starts at", "Il dure", "It lasts", "À quelle heure finit-il ?", "What time does it end?"]];
  function diSoir(h, en) { return h >= 18 ? (en ? "p.m." : "du soir") : (en ? "p.m." : "de l’après-midi"); }
  function diJour(Q, n) { return HE.shuf(DI_J).slice(0, n).map(function (x) { return [x[0], x[1], HE.rint(x[2][0], x[2][1]), HE.pk(Q)]; }).sort(function (a, b) { return a[2] * 60 + a[3] - b[2] * 60 - b[3]; }); }
  function diMots(x, en) { return en ? HE.cap(HE.direEn(x[2], x[3])) : HE.cap(exDigMots(x[2], x[3])); }
  function diHm(t) { return Math.floor(t / 60) + ":" + HE.pad(t % 60); }
  exNiveaux("digitale", [
    "L’élève identifie la relation suivante : 1 journée=24h (2x12h).",
    "L’élève est capable d’associer une heure donnée à celle de l’après-midi ou du soir (ex. 6h du soir = 18h).",
    "L’élève identifie la relation suivante : 1h=60min.",
    "L’élève est capable de lire l’heure digitale en utilisant le vocabulaire : pile (0min), et demie/une demi-heure (30min).",
    "L’élève est capable de lire l’heure digitale en utilisant le vocabulaire : et quart/un quart d’heure (15min), moins le quart (45min).",
    "L’élève est capable de résoudre un problème simple en lien avec ces durées."
  ], {
    but: "Heures pile et demies seulement ; passer de l’après-midi à l’heure sur 24 h (+12) ; un problème qui dure une demi-heure ou une heure.",
    rappel: function (en) { return en ? "There are 24 hours in a day. For the afternoon and evening, add 12: 4:00 p.m. → 16:00. 1 hour = 60 minutes." : "Dans une journée, il y a 24 heures. L’après-midi et le soir, j’ajoute 12 : 4:00 de l’après-midi → 16:00. 1 heure = 60 minutes."; },
    tirer: function () { var Q = [0, 30]; return { jour: diJour(Q, 3), conv: HE.shuf([13, 14, 15, 16, 17, 18, 19, 20]).slice(0, 4).map(function (h) { return [h, HE.pk(Q)]; }), hor: HE.shuf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 2).map(function (h) { return [h, HE.pk(Q)]; }),
      pb: { t: HE.pk(DI_PB), h: HE.rint(9, 16), m: 0, du: HE.pk([[30, "une demi-heure", "half an hour"], [60, "une heure", "an hour"]]) } }; },
    exos: function (d, en) {
      var fin = d.pb.h * 60 + d.pb.m + d.pb.du[0], pb = d.pb;
      return [
        { c: en ? "Write the time in words." : "Écris l’heure en lettres.", q: exListe(d.jour, function (x) { return (en ? x[1] + " at " + x[2] + ":" + HE.pad(x[3]) + ". " : x[0] + " à " + x[2] + "h" + HE.pad(x[3]) + ". ") + exT(diMots(x, en), true); }, "ex-une-col"), r: d.jour.map(function (x) { return diMots(x, en); }).join(" · ") },
        { c: en ? "Add 12 to write the 24-hour time." : "Ajoute 12 pour écrire l’heure sur 24 heures.", q: exListe(d.conv, function (x) { return exDig(x[0] - 12, x[1]) + " " + diSoir(x[0], en) + " → " + exT(String(x[0])) + ":" + HE.pad(x[1]); }), r: d.conv.map(function (x) { return x[0] + ":" + HE.pad(x[1]); }).join(" · ") },
        { c: en ? "What time is it? Write the morning time and the afternoon or evening time." : "Quelle heure est-il ? Écris l’heure du matin, puis celle de l’après-midi ou du soir.",
          q: '<div class="ex-liste">' + d.hor.map(function (x) { return '<div class="ex-ligne-clk">' + HE.horloge(x[0], x[1], { deco: true, cls: "ex-clk" }) + "<p>" + (en ? "a.m. " : "matin ") + exHM(exT(String(x[0])) + ":" + exT(HE.pad(x[1]))) + " &nbsp; " + (en ? "p.m. " : "après-midi ou soir ") + exHM(exT(String(x[0] + 12)) + ":" + exT(HE.pad(x[1]))) + "</p></div>"; }).join("") + "</div>",
          r: d.hor.map(function (x) { return x[0] + ":" + HE.pad(x[1]) + " / " + (x[0] + 12) + ":" + HE.pad(x[1]); }).join(" · ") },
        { c: en ? "Complete." : "Complète.", q: exListe(en ? ["1 hour = ", "half an hour = ", "In a day, there are "] : ["1 heure = ", "une demi-heure = ", "Dans une journée, il y a "], function (s, i) { return s + exT(String([60, 30, 24][i])) + (i < 2 ? " min" : (en ? " hours." : " heures.")); }), r: "60 min · 30 min · 24" },
        { c: en ? "Solve the problem." : "Résous le problème.", q: "<p>" + (en ? pb.t[1] + " " + pb.h + ":00. " + pb.t[3] + " " + pb.du[2] + ". " + pb.t[5] : pb.t[0] + " " + pb.h + "h00. " + pb.t[2] + " " + pb.du[1] + ". " + pb.t[4]) + "</p><p>" + (en ? "Answer: " : "Réponse : ") + exHM(exT(String(Math.floor(fin / 60))) + ":" + exT(HE.pad(fin % 60))) + "</p>", r: diHm(fin) }
      ];
    }
  }, "Fiche d’origine : heures pile, et quart, et demie, moins le quart ; écrire l’heure de deux façons (+12 et −12) ; un problème de durée.", {
    but: "Toutes les heures du programme (pile, et quart, et demie, moins le quart), le soir compris ; les deux façons dans les deux sens ; durées de 45 min et 1 h 15 ; retrouver l’heure du début.",
    rappel: EXOS.digitale.rappel,
    tirer: function () { var Q = [0, 15, 30, 45];
      return { jour: diJour(Q, 4), conv: HE.shuf([["+", HE.rint(13, 17)], ["+", HE.rint(18, 22)], ["-", HE.rint(13, 17)], ["-", HE.rint(18, 23)]]).map(function (x) { return [x[0], x[1], HE.pk([15, 30, 45])]; }),
        dur: HE.shuf([[90, "1 h 30"], [75, "1 h 15"], [105, "1 h 45"]]).slice(0, 1),
        pb1: { t: HE.pk(DI_PB), h: HE.rint(9, 16), m: HE.pk([15, 30, 45]), du: HE.pk([[45, "trois quarts d’heure", "three quarters of an hour"], [75, "une heure et quart", "an hour and a quarter"]]) },
        pb2: { h: HE.rint(14, 20), m: HE.pk([0, 15, 30, 45]), du: HE.pk([[30, "une demi-heure", "half an hour"], [15, "un quart d’heure", "a quarter of an hour"], [45, "trois quarts d’heure", "three quarters of an hour"]]) } }; },
    exos: function (d, en) {
      var f1 = d.pb1.h * 60 + d.pb1.m + d.pb1.du[0], p1 = d.pb1, p2 = d.pb2, deb2 = p2.h * 60 + p2.m - p2.du[0], dur = d.dur[0];
      return [
        { c: en ? "Write the time in words." : "Écris l’heure en lettres.", q: exListe(d.jour, function (x) { return (en ? x[1] + " at " + x[2] + ":" + HE.pad(x[3]) + ". " : x[0] + " à " + x[2] + "h" + HE.pad(x[3]) + ". ") + exT(diMots(x, en), true); }, "ex-une-col"), r: d.jour.map(function (x) { return diMots(x, en); }).join(" · ") },
        { c: en ? "Write the time in the other way." : "Écris l’heure de l’autre façon.", q: exListe(d.conv, function (x) { return x[0] === "+" ? exDig(x[1] - 12, x[2]) + " " + diSoir(x[1], en) + " → " + exT(x[1] + ":" + HE.pad(x[2])) : exDig(x[1], x[2]) + " → " + exT((x[1] - 12) + ":" + HE.pad(x[2])) + " " + diSoir(x[1], en); }),
          r: d.conv.map(function (x) { return x[0] === "+" ? x[1] + ":" + HE.pad(x[2]) : (x[1] - 12) + ":" + HE.pad(x[2]); }).join(" · ") },
        { c: en ? "Complete." : "Complète.", q: exListe(en ? ["a quarter of an hour = ", "three quarters of an hour = ", dur[1] + " = ", "120 min = "] : ["un quart d’heure = ", "trois quarts d’heure = ", dur[1] + " = ", "120 min = "], function (s, i) { return s + exT(String([15, 45, dur[0], 2][i])) + (i < 3 ? " min" : " h"); }), r: "15 min · 45 min · " + dur[0] + " min · 2 h" },
        { c: en ? "Solve the problems." : "Résous les problèmes.",
          q: '<ol class="ex-conv ex-une-col"><li>' + (en ? p1.t[1] + " " + p1.h + ":" + HE.pad(p1.m) + ". " + p1.t[3] + " " + p1.du[2] + ". " + p1.t[5] : p1.t[0] + " " + p1.h + "h" + HE.pad(p1.m) + ". " + p1.t[2] + " " + p1.du[1] + ". " + p1.t[4]) + " " + exT(diHm(f1)) + "</li><li>" +
            (en ? "The match ends at " + p2.h + ":" + HE.pad(p2.m) + ". It lasted " + p2.du[2] + ". What time did it start? " : "Le match se termine à " + p2.h + "h" + HE.pad(p2.m) + ". Il a duré " + p2.du[1] + ". À quelle heure a-t-il commencé ? ") + exT(diHm(deb2)) + "</li></ol>",
          r: diHm(f1) + " · " + diHm(deb2) }
      ];
    }
  });

  /* ===== Lire l’heure à aiguilles (P5, séquence 2) ===== */
  function hrDig(h, m, en) { return en ? HE.H12(h) + ":" + HE.pad(m) : HE.H12(h) + " h" + (m ? " " + HE.pad(m) : ""); }
  function hrClk(h, m, sans) { return HE.horloge(h, m, { deco: true, sans: sans, cls: "ex-clk" }); }
  function hrMots(h, m, en) { return (en ? HE.direEn(h, m) : HE.direFr(h, m)).replace(/ \(\d+ min\)$/, ""); }
  function hrLire(L, en) { return { c: en ? "Write the time shown on each clock." : "Écris l’heure indiquée par chaque horloge.",
    q: '<div class="ex-grille">' + L.map(function (x) { return "<div>" + hrClk(x[0], x[1]) + '<p class="ex-rep">' + exT(String(HE.H12(x[0]))) + (en ? " : " : " h ") + exT(HE.pad(x[1])) + "</p></div>"; }).join("") + "</div>", r: L.map(function (x) { return hrDig(x[0], x[1], en); }).join(" · ") }; }
  function hrDessin(L, en) { return { c: en ? "Draw the hands." : "Dessine les aiguilles.",
    q: '<div class="ex-grille ex-quatre">' + L.map(function (x) { return "<div>" + exS(hrClk(x[0], x[1], true), hrClk(x[0], x[1])) + '<p class="ex-rep"><b>' + hrDig(x[0], x[1], en) + "</b></p></div>"; }).join("") + "</div>",
    r: '<div class="ex-grille ex-quatre ex-petit">' + L.map(function (x) { return "<div>" + hrClk(x[0], x[1]) + "<p>" + hrDig(x[0], x[1], en) + "</p></div>"; }).join("") + "</div>" }; }
  function hrLettres(L, en) { return { c: en ? "Write the time in words." : "Écris l’heure en lettres.",
    q: '<div class="ex-liste">' + L.map(function (x) { return '<div class="ex-ligne-clk">' + hrClk(x[0], x[1]) + "<p>" + (en ? "It is " : "Il est ") + exT(hrMots(x[0], x[1], en), true) + ".</p></div>"; }).join("") + "</div>", r: L.map(function (x) { return HE.cap(hrMots(x[0], x[1], en)); }).join(" · ") }; }
  function hrProbleme(pb, en) { return { c: en ? "Solve the problem." : "Résous le problème.", q: '<div class="ex-ligne-clk">' + hrClk(pb.h, pb.m) + "<div><p>" + esc(typo(tr(pb))) + "</p><p>" + (en ? "Answer: " : "Réponse : ") + exT(esc(typo(HE.cap(tr(pb.o[pb.a])))), true) + "</p></div></div>", r: esc(typo(HE.cap(tr(pb.o[pb.a])))) }; }
  function hrHeures() { var H = HE.shuf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), k = 0; return function () { return H[k++ % 12]; }; }
  exNiveaux("heure", [
    "L’élève est capable de reconnaître les différentes aiguilles d’une horloge.",
    "L’élève est capable de lire les heures piles sur le cadran d’une horloge.",
    "L’élève est capable de lire les demies-heures sur le cadran d’une horloge.",
    "L’élève est capable de lire les quarts d’heure (et quart/moins le quart) sur le cadran d’une horloge.",
    "L’élève est capable de lire les minutes multiples de 5, puis toutes les minutes sur le cadran d’une horloge.",
    "L’élève est capable de lire l’heure en utilisant le vocabulaire « moins 5, moins 10, moins 25 ».",
    "L’élève est capable de résoudre un problème simple sur l’heure à aiguilles."
  ], {
    but: "Reconnaître les deux aiguilles ; heures pile, et demie, et quart, moins le quart ; dessiner les aiguilles pour une heure pile ou une demie.",
    rappel: EXOS.heure.rappel,
    tirer: function () { var h = hrHeures(); return { lire: HE.shuf([[h(), 0], [h(), 30], [h(), 15], [h(), 45]]), lettres: HE.shuf([[h(), 0], [h(), 30], [h(), 15]]), dessin: HE.shuf([[h(), 0], [h(), 0], [h(), 30], [h(), 30]]), pb: HE.PROBLEMES[HE.rint(0, HE.PROBLEMES.length - 1)] }; },
    exos: function (d, en) {
      return [
        { c: en ? "Complete with hours or minutes." : "Complète avec « heures » ou « minutes ».",
          q: '<div class="ex-ligne-clk">' + hrClk(3, 0) + "<div><p>" + (en ? "The short hand shows the " : "La petite aiguille indique les ") + exT(en ? "hours" : "heures") + ".</p><p>" + (en ? "The long hand shows the " : "La grande aiguille indique les ") + exT("minutes") + ".</p></div></div>",
          r: en ? "short hand: hours · long hand: minutes" : "petite aiguille : heures · grande aiguille : minutes" },
        hrLire(d.lire, en), hrLettres(d.lettres, en), hrDessin(d.dessin, en), hrProbleme(d.pb, en)
      ];
    }
  }, "Fiche d’origine : lire 6 horloges (pile, quarts, demies, multiples de 5), écrire l’heure en lettres, dessiner les aiguilles, l’heure de l’après-midi, un problème.", {
    but: "Toutes les minutes sur le cadran ; l’heure en lettres avec « moins 5, moins 10, moins 25 » ; dessiner les aiguilles pour des multiples de 5 ; l’heure de l’après-midi et du soir ; un problème.",
    rappel: EXOS.heure.rappel,
    tirer: function () { var h = hrHeures(), M = HE.shuf([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 34, 36, 37, 38, 39, 41, 42, 43, 44, 46, 47, 48, 49, 51, 52, 53, 54, 56, 57, 58, 59]);
      return { lire: HE.shuf([[h(), M[0]], [h(), M[1]], [h(), HE.pk([5, 10, 20, 25])], [h(), HE.pk([35, 40, 50, 55])], [h(), M[2]], [h(), 45]]), lettres: HE.shuf([[h(), 55], [h(), 50], [h(), 35]]),
        dessin: HE.shuf([[h(), HE.pk([5, 10, 20, 25])], [h(), HE.pk([35, 40])], [h(), HE.pk([50, 55])], [h(), 45]]), conv: HE.shuf([13, 14, 15, 16, 17, 18, 19, 20, 21, 22]).slice(0, 4).map(function (x) { return [x, HE.pk([15, 30, 45, 10, 50])]; }), pb: HE.PROBLEMES[HE.rint(0, HE.PROBLEMES.length - 1)] }; },
    exos: function (d, en) {
      return [hrLire(d.lire, en), hrLettres(d.lettres, en), hrDessin(d.dessin, en),
        { c: en ? "Write the 24-hour time." : "Écris l’heure de l’après-midi ou du soir sur 24 heures.", q: exListe(d.conv, function (x) { return (x[0] - 12) + " h " + HE.pad(x[1]) + " " + (x[0] >= 18 ? (en ? "in the evening" : "du soir") : (en ? "in the afternoon" : "de l’après-midi")) + " → " + exT(x[0] + " h " + HE.pad(x[1])); }, "ex-heure24"), r: d.conv.map(function (x) { return x[0] + " h " + HE.pad(x[1]); }).join(" · ") },
        hrProbleme(d.pb, en)];
    }
  });

  /* ===== Mesurer des masses (P5, séquence 4) ===== */
  var MA_INSTR = [["Je pèse la farine pour faire un gâteau.", "I weigh the flour to make a cake.", 0], ["Je pèse ma valise avant le voyage.", "I weigh my suitcase before the trip.", 1], ["Je me pèse à la maison.", "I weigh myself at home.", 2],
    ["Au magasin, on pèse les tomates.", "At the shop, we weigh the tomatoes.", 3], ["En classe, on compare deux objets avec des masses marquées.", "In class, we compare two objects with weights.", 4]];
  var MA_NOMS = [["la balance alimentaire", "the kitchen scales"], ["le pèse-bagage", "the luggage scale"], ["le pèse-personne", "the bathroom scales"], ["la balance de supermarché", "the shop scales"], ["la balance de Roberval", "the balance scales"]];
  var MA_OBJ = { g: [["une mangue", "a mango", 400], ["un œuf", "an egg", 50], ["une lettre", "a letter", 20], ["un crayon", "a pencil", 5], ["un avocat", "an avocado", 200]], kg: [["un chien", "a dog", 15], ["un sac de riz", "a bag of rice", 5], ["une valise", "a suitcase", 20], ["une pastèque", "a watermelon", 6], ["un enfant de 8 ans", "an 8-year-old child", 27]], t: [["un éléphant", "an elephant", 5], ["un bus", "a bus", 12], ["un camion", "a lorry", 10], ["une petite voiture", "a small car", 1]] };
  function maM(v, en) { return en ? v.toLocaleString("en-GB") : exMille(v); }
  function maSigne(A, B) { return A === B ? "=" : A > B ? "&gt;" : "&lt;"; }
  function maUnites(nG, nK, nT) { return HE.shuf(HE.shuf(MA_OBJ.g).slice(0, nG).map(function (x) { return x.concat(["g"]); }).concat(HE.shuf(MA_OBJ.kg).slice(0, nK).map(function (x) { return x.concat(["kg"]); }), HE.shuf(MA_OBJ.t).slice(0, nT).map(function (x) { return x.concat(["t"]); }))); }
  exNiveaux("masses", [
    "L’élève est capable d’identifier et nommer certains instruments de mesure de masse : la balance de Roberval, le pèse-personne, le pèse-bagage, la balance alimentaire, la balance de supermarché.",
    "L’élève connaît les unités de mesure t, kg, g et est capable d’estimer la masse d’un objet donné en utilisant la bonne unité.",
    "L’élève connaît les relations qui lient le kg (kilo-) au g et la tonne au kg.",
    "L’élève convertit des g en kg et inversement ; des kg en t et inversement.",
    "L’élève est capable de résoudre un problème simple en lien avec la mesure de masse.",
    "L’élève est capable de résoudre un problème simple de conversion en lien avec la mesure de masse."
  ], {
    but: "Choisir l’instrument de mesure ; l’unité parmi trois ; les relations 1 kg = 1 000 g et 1 t = 1 000 kg ; comparer dans la même unité ; un problème en grammes.",
    rappel: EXOS.masses.rappel,
    tirer: function () { var ins = HE.shuf(MA_INSTR).slice(0, 3).map(function (x) { var o = HE.shuf([x[2]].concat(HE.shuf([0, 1, 2, 3, 4].filter(function (k) { return k !== x[2]; })).slice(0, 2))); return { x: x, o: o }; });
      var g1 = HE.pk([300, 400, 500, 600, 750]), g2 = HE.pk([250, 500]);
      return { ins: ins, unites: maUnites(1, 2, 1), kg: HE.shuf([2, 3, 4, 5]).slice(0, 2), comp: HE.shuf([[HE.rint(1, 4) * 100 + 50, null, "g"], [HE.rint(2, 9), null, "kg"], [HE.rint(2, 9), null, "t"]]).map(function (c) { var b = c[0] + HE.pk([-1, 1]) * (c[2] === "g" ? HE.pk([20, 90, 110]) : 1); return [c[0], b, c[2]]; }).concat([[1, 1000, "kgg"]]), pb: [g1, g2] }; },
    exos: function (d, en) {
      var tot = d.pb[0] + d.pb[1];
      return [
        { c: en ? "Circle the right instrument." : "Entoure l’instrument qui convient.",
          q: exListe(d.ins, function (y) { return esc(en ? y.x[1] : y.x[0]) + "<br>" + exG(y.o.map(function (k) { var s = esc(MA_NOMS[k][en ? 1 : 0]); return k === y.x[2] ? exC(s) : s; }).join('<span class="ex-sep">/</span>'), "cercle"); }, "ex-une-col"),
          r: d.ins.map(function (y) { return MA_NOMS[y.x[2]][en ? 1 : 0]; }).join(" · ") },
        { c: en ? "Circle the right unit." : "Entoure l’unité qui convient.",
          q: exListe(d.unites, function (x) { return HE.cap(en ? x[1] : x[0]) + (en ? " weighs about " : " pèse environ ") + x[2] + " " + exG("( " + ["g", "kg", "t"].map(function (u) { return u === x[3] ? exC(u) : u; }).join(" / ") + " )", "cercle"); }, "ex-une-col"),
          r: d.unites.map(function (x) { return x[2] + " " + x[3]; }).join(" · ") },
        { c: en ? "Complete." : "Complète.", q: exListe(["1 kg = ", "1 t = ", d.kg[0] + " kg = ", d.kg[1] + " kg = "], function (s, i) { return s + exT(maM([1000, 1000, d.kg[0] * 1000, d.kg[1] * 1000][i], en)) + (i === 1 ? " kg" : " g"); }),
          r: "1 000 g · 1 000 kg · " + maM(d.kg[0] * 1000, en) + " g · " + maM(d.kg[1] * 1000, en) + " g" },
        { c: en ? "Compare with &lt;, &gt; or =." : "Compare avec &lt;, &gt; ou =.",
          q: exListe(d.comp, function (c) { return c[2] === "kgg" ? "1 kg " + exT("=") + " " + maM(1000, en) + " g" : c[0] + " " + c[2] + " " + exT(maSigne(c[0], c[1])) + " " + c[1] + " " + c[2]; }),
          r: d.comp.map(function (c) { return c[2] === "kgg" ? "1 kg = " + maM(1000, en) + " g" : c[0] + " " + c[2] + " " + maSigne(c[0], c[1]) + " " + c[1] + " " + c[2]; }).join(" · ") },
        { c: en ? "Solve the problem." : "Résous le problème.",
          q: "<p>" + (en ? "Sari buys " + d.pb[0] + " g of tomatoes and " + d.pb[1] + " g of beans. How much does her shopping weigh? Is it more or less than 1 kg?" : "Sari achète " + d.pb[0] + " g de tomates et " + d.pb[1] + " g de haricots. Combien pèsent ses courses ? Est-ce plus ou moins que 1 kg ?") + "</p><p>" +
            (en ? "Her shopping weighs " : "Ses courses pèsent ") + exT(String(tot)) + " g. " + (en ? "It is " : "C’est ") + exT(tot > 1000 ? (en ? "more" : "plus") : (en ? "less" : "moins")) + (en ? " than 1 kg." : " que 1 kg.") + "</p>",
          r: d.pb[0] + " g + " + d.pb[1] + " g = " + tot + " g · " + maM(tot, en) + " g " + maSigne(tot, 1000) + " " + maM(1000, en) + " g" }
      ];
    }
  }, "Fiche d’origine : choisir l’unité, convertir (kg, g, t), comparer des masses écrites dans des unités différentes, ranger des masses, un problème de conversion.", {
    but: "Écrire l’unité sans propositions ; conversions dans les deux sens, avec kg et g mélangés ; comparer et ranger 5 masses ; un problème en plusieurs étapes avec la tonne.",
    rappel: EXOS.masses.rappel,
    tirer: function () { var n = HE.shuf([2, 3, 4, 5, 6, 7, 8, 9]), g = HE.shuf([150, 250, 350, 450, 600, 750, 850]);
      var r0 = HE.shuf([[900, "900 g"], [1200, "1 kg 200 g"], [1500, "1 500 g"], [2000, "2 kg"], [1750, "1 kg 750 g"], [800, "800 g"], [1050, "1 050 g"], [2300, "2 kg 300 g"]]).slice(0, 5);
      var T = HE.rint(2, 4), a = HE.rint(8, 15) * 100, b = HE.rint(5, 9) * 100 + 50, plus = HE.pk([200, 300, 500]);
      return { unites: maUnites(2, 2, 2), conv: [["kgg", n[0] % 4 + 1, g[0]], ["gkg", n[1] % 4 + 1, g[1]], ["t", n[2]], ["kgt", n[3]], ["g", n[4]], ["kgg", n[5] % 3 + 1, g[2]]],
        comp: EXOS.masses.tirer().comp, ranger: r0, pb: { T: T, a: a, b: b, plus: plus } }; },
    exos: function (d, en) {
      var M = function (v) { return maM(v, en); }, lib = function (s) { return en ? s.replace(/(\d)[\s  ](?=\d{3})/g, "$1,") : s; };
      var comp = d.comp.map(function (c) { if (c[1] === null) { var k = c[0] / 1000; return { a: k + " kg", b: M(c[0]) + " g", A: c[0], B: c[0] }; } var A = c[1], B = c[3] === " kg" ? c[2] * 1000 : c[2]; return { a: c[0], b: M(c[2]) + c[3], A: A, B: B }; });
      var ordre = d.ranger.slice().sort(function (x, y) { return x[0] - y[0]; }), pb = d.pb, ch = pb.a + pb.b, reste = pb.T * 1000 - ch;
      var cv = function (x) { if (x[0] === "kgg") return [x[1] + " kg " + x[2] + " g = ", M(x[1] * 1000 + x[2]), " g"]; if (x[0] === "gkg") return [M(x[1] * 1000 + x[2]) + " g = ", x[1] + " kg " + x[2], " g"]; if (x[0] === "t") return [x[1] + " t = ", M(x[1] * 1000), " kg"]; if (x[0] === "kgt") return [M(x[1] * 1000) + " kg = ", String(x[1]), " t"]; return [M(x[1] * 1000) + " g = ", String(x[1]), " kg"]; };
      return [
        { c: en ? "Write the right unit: g, kg or t." : "Écris l’unité qui convient : g, kg ou t.", q: exListe(d.unites, function (x) { return HE.cap(en ? x[1] : x[0]) + (en ? " weighs about " : " pèse environ ") + x[2] + " " + exT(x[3]); }), r: d.unites.map(function (x) { return x[2] + " " + x[3]; }).join(" · ") },
        { c: en ? "Complete." : "Complète.", q: exListe(d.conv, function (x) { var c = cv(x); if (x[0] === "gkg") return c[0] + exT(String(x[1])) + " kg " + exT(String(x[2])) + " g"; return c[0] + exT(c[1]) + c[2]; }), r: d.conv.map(function (x) { var c = cv(x); return c[0] + c[1] + (x[0] === "gkg" ? " g" : c[2]); }).join(" · ") },
        { c: en ? "Compare with &lt;, &gt; or =." : "Compare avec &lt;, &gt; ou =.", q: exListe(comp, function (c) { return lib(c.a) + " " + exT(maSigne(c.A, c.B)) + " " + lib(c.b); }), r: comp.map(function (c) { return lib(c.a) + " " + maSigne(c.A, c.B) + " " + lib(c.b); }).join(" · ") },
        { c: en ? "Put these masses in order, from the lightest to the heaviest." : "Range ces masses de la plus légère à la plus lourde.", q: '<p class="ex-banque">' + d.ranger.map(function (x) { return lib(x[1]); }).join(" · ") + '</p><p class="ex-ordre">' + ordre.map(function (x) { return exT(lib(x[1])); }).join(" &lt; ") + "</p>", r: ordre.map(function (x) { return lib(x[1]); }).join(" < ") },
        { c: en ? "Solve the problem." : "Résous le problème.",
          q: "<p>" + (en ? "A small lorry can carry " + pb.T + " t. We load " + M(pb.a) + " kg of sand and " + M(pb.b) + " kg of cement. How much does the load weigh? How many more kilograms can we load? Can we add " + pb.plus + " kg of bricks?" : "Un petit camion peut transporter " + pb.T + " t. On charge " + M(pb.a) + " kg de sable et " + M(pb.b) + " kg de ciment. Combien pèse le chargement ? Combien de kilogrammes peut-on encore charger ? Peut-on ajouter " + pb.plus + " kg de briques ?") +
            '</p><ol class="ex-conv ex-une-col"><li>' + exT(M(ch)) + " kg</li><li>" + exT(M(reste)) + " kg</li><li>" + exT(reste >= pb.plus ? (en ? "Yes" : "Oui") : (en ? "No" : "Non")) + "</li></ol>",
          r: M(pb.a) + " + " + M(pb.b) + " = " + M(ch) + " kg · " + pb.T + " t = " + M(pb.T * 1000) + " kg · " + M(pb.T * 1000) + " − " + M(ch) + " = " + M(reste) + " kg · " + (reste >= pb.plus ? (en ? "yes" : "oui") : (en ? "no" : "non")) }
      ];
    }
  });

  /* ==========================================================================================
     Jeux des séquences complétées (D-96) : un moteur commun « QZ »
     Types de question : choix (boutons), champs (nombres, heures, quotient et reste), pieces (payer), mots (toucher les verbes)
     ========================================================================================== */
  var QZ = null;
  var QZ_ETAPE = { 0: "rappelle", 1: "decouvre", 2: "entraine", 3: "reinvestis" };
  function qzT(x) { return x === undefined || x === null ? "" : typeof x === "string" || typeof x === "number" ? String(x) : tr(x); }
  function qzDig(h, m) { return '<span class="qz-dig"><span class="hr-h">' + h + '</span>:<span class="hr-m">' + HE.pad(m) + "</span></span>"; }
  var QZ_BILLETS = [500, 1000];
  function qzArgent(v, act, k) {
    var cls = v >= 500 ? "po-billet" : "po-piece" + (v >= 10 ? " po-piece--grande" : "");
    return '<button class="' + cls + '" type="button" data-action="' + act + '" data-v="' + v + '"' + (k !== undefined ? ' data-k="' + k + '"' : "") + ' aria-label="' + v + ' F">' + exMille(v) + "<small>F</small></button>";
  }
  function qzPorteMonnaie(liste) { return '<div class="qz-bourse">' + liste.map(function (v) { return v >= 500 ? '<span class="po-billet">' + exMille(v) + "<small>F</small></span>" : '<span class="po-piece' + (v >= 10 ? " po-piece--grande" : "") + '">' + v + "<small>F</small></span>"; }).join("") + "</div>"; }
  var QZ_PRENOMS = ["Léo", "Méi", "Tao", "Wadra", "Nina", "Sari", "Adi", "Vaka", "Waeko", "Tehani", "Dylan"];

  var QUIZ = {
    /* ---------- Lire l'heure digitale (leçon GM5 « Lire l'heure digitale ») ---------- */
    digitale: { matiere: "maths", jeux: {
      rappel: { perso: "adi", etape: 0, fr: "Je me rappelle", en: "I remember", dfr: "Compter de 15 en 15, comparer des nombres, les moments de la journée.", den: "Counting in fifteens, comparing numbers, times of day.",
        gen: function () { return [
          { t: "choix", c: { fr: "Je compte de 15 en 15 : 0, 15, 30… Quel nombre vient ensuite ?", en: "I count in fifteens: 0, 15, 30… Which number comes next?" }, o: ["40", "45", "35", "60"], a: 1, ex: { fr: "30 + 15 = 45.", en: "30 + 15 = 45." } },
          { t: "choix", c: { fr: "Quel nombre est le plus grand ?", en: "Which number is the biggest?" }, o: ["9", "16", "12", "6"], a: 1, ex: { fr: "16 a 1 dizaine et 6 unités : c'est le plus grand.", en: "16 has 1 ten and 6 ones: it is the biggest." } },
          { t: "choix", c: { fr: "Dans la journée, quel moment vient après le matin ?", en: "In the day, what comes after the morning?" }, o: [{ fr: "la nuit", en: "the night" }, { fr: "l'après-midi", en: "the afternoon" }, { fr: "le soir", en: "the evening" }], a: 1, ex: { fr: "Le matin, puis midi, puis l'après-midi, puis le soir.", en: "The morning, then noon, then the afternoon, then the evening." } }
        ]; } },
      matin: { perso: "tao", etape: 1, fr: "Matin ou après-midi ?", en: "Morning or afternoon?", dfr: "Je lis l'heure du réveil et je trouve le moment de la journée.", den: "I read the digital clock and find the time of day.",
        gen: function () { return HE.shuf([1, 3, 6, 8, 10, 11, 12, 13, 14, 16, 19, 22]).slice(0, 8).map(function (h) { var m = HE.pk([0, 15, 30, 45]);
          return { t: "choix", c: { fr: "Il est <b>" + h + ":" + HE.pad(m) + "</b>. C'est le matin, ou l'après-midi ou le soir ?", en: "It is <b>" + h + ":" + HE.pad(m) + "</b>. Is it the morning, or the afternoon or evening?" },
            z: function () { return '<div class="qz-reveil">' + qzDig(h, m) + "</div>"; }, o: [{ fr: "le matin", en: "the morning" }, { fr: "l'après-midi ou le soir", en: "the afternoon or evening" }], a: h < 12 ? 0 : 1,
            ex: h < 12 ? { fr: "Le matin, c'est de 0h à 12h. " + h + " est plus petit que 12.", en: "Morning is from 0:00 to 12:00. " + h + " is less than 12." }
              : { fr: "L'après-midi et le soir, c'est de 12h à 24h. " + h + ":" + HE.pad(m) + (h > 12 ? ", c'est aussi " + (h - 12) + ":" + HE.pad(m) + (h >= 18 ? " du soir." : " de l'après-midi.") : "."), en: "Afternoon and evening are from 12:00 to 24:00." + (h > 12 ? " " + h + ":" + HE.pad(m) + " is also " + (h - 12) + ":" + HE.pad(m) + " p.m." : "") } }; }); } },
      lire: { perso: "dylan", etape: 1, fr: "Lis le réveil", en: "Read the clock", dfr: "Je dis l'heure avec pile, et quart, et demie, moins le quart.", den: "I say the time with o'clock, quarter past, half past, quarter to.",
        gen: function () { return HE.shuf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 8).map(function (h, k) { var m = [0, 15, 30, 45, 45, 15, 30, 45][k];
          var fr = function (hh, mm) { return HE.cap(exDigMots(hh, mm)); };
          var o = m === 45 ? [[fr(h, 45), HE.cap(HE.direEn(h, 45))], [HE.cap(exNb(h) + (h === 1 ? " heure" : " heures") + " moins le quart"), "Quarter to " + HE.direEn(h, 0).replace(" o’clock", "")], [HE.cap(exNb(h) + (h === 1 ? " heure" : " heures") + " et quart"), HE.cap(HE.direEn(h, 15))]]
            : m === 30 ? [[fr(h, 30), HE.cap(HE.direEn(h, 30))], [fr(h, 15), HE.cap(HE.direEn(h, 15))], [fr(h, 0), HE.cap(HE.direEn(h, 0))]]
            : m === 15 ? [[fr(h, 15), HE.cap(HE.direEn(h, 15))], [fr(h, 30), HE.cap(HE.direEn(h, 30))], [fr(h, 45), HE.cap(HE.direEn(h, 45))]]
            : [[fr(h, 0), HE.cap(HE.direEn(h, 0))], [fr(h, 15), HE.cap(HE.direEn(h, 15))], [fr(h, 30), HE.cap(HE.direEn(h, 30))]];
          var ordre = HE.shuf([0, 1, 2]);
          return { t: "choix", c: { fr: "Quelle heure affiche le réveil ?", en: "What time does the clock show?" }, z: function () { return '<div class="qz-reveil">' + qzDig(h, m) + "</div>"; },
            o: ordre.map(function (i) { return { fr: o[i][0], en: o[i][1] }; }), a: ordre.indexOf(0),
            ex: m === 45 ? { fr: "45 minutes, c'est moins le quart : il reste un quart d'heure (15 min) avant " + (h + 1) + "h.", en: "45 minutes is quarter to: there is a quarter of an hour (15 min) left before " + (h + 1) + " o'clock." }
              : { fr: { 0: "0 minute : l'heure pile.", 15: "15 minutes : et quart.", 30: "30 minutes : et demie." }[m], en: { 0: "0 minutes: o'clock.", 15: "15 minutes: quarter past.", 30: "30 minutes: half past." }[m] } }; }); } },
      facons: { perso: "nina", etape: 2, fr: "Deux façons de dire l'heure", en: "Two ways to say the time", dfr: "Je passe de 4:00 de l'après-midi à 16:00, et de 14:15 à 2:15.", den: "I change 4:00 p.m. into 16:00, and 14:15 into 2:15.",
        gen: function () { return HE.shuf([13, 14, 15, 16, 17, 18, 19, 20, 21]).slice(0, 8).map(function (h, k) { var m = HE.pk([0, 15, 30, 45]), soir = h >= 18, plus = k % 2 === 0;
          var nom = { fr: soir ? "du soir" : "de l'après-midi", en: "p.m." };
          return plus ? { t: "champs", c: { fr: "<b>" + (h - 12) + ":" + HE.pad(m) + " " + nom.fr + "</b>, c'est quelle heure ?", en: "<b>" + (h - 12) + ":" + HE.pad(m) + " p.m.</b>: what is the 24-hour time?" },
              z: function () { return '<div class="qz-reveil">' + qzDig(h - 12, m) + '<span class="qz-moment">' + qzT(nom) + "</span></div>"; }, champs: [{ k: "h" }, { k: "m", sep: ":" }], r: { h: h, m: m },
              ex: { fr: (h - 12) + " + 12 = " + h + " : " + (h - 12) + ":" + HE.pad(m) + " " + nom.fr + ", c'est " + h + ":" + HE.pad(m) + ".", en: (h - 12) + " + 12 = " + h + ": " + (h - 12) + ":" + HE.pad(m) + " p.m. is " + h + ":" + HE.pad(m) + "." } }
            : { t: "champs", c: { fr: "<b>" + h + ":" + HE.pad(m) + "</b>, c'est quelle heure " + nom.fr + " ?", en: "<b>" + h + ":" + HE.pad(m) + "</b>: what time is it p.m.?" },
              z: function () { return '<div class="qz-reveil">' + qzDig(h, m) + "</div>"; }, champs: [{ k: "h" }, { k: "m", sep: ":", apres: " " + qzT(nom) }], r: { h: h - 12, m: m },
              ex: { fr: h + " − 12 = " + (h - 12) + " : " + h + ":" + HE.pad(m) + ", c'est " + (h - 12) + ":" + HE.pad(m) + " " + nom.fr + ".", en: h + " − 12 = " + (h - 12) + ": " + h + ":" + HE.pad(m) + " is " + (h - 12) + ":" + HE.pad(m) + " p.m." } }; }); } },
      durees: { perso: "wadra", etape: 3, fr: "Ma journée", en: "My day", dfr: "Je trouve l'heure de fin quand je connais le début et la durée.", den: "I find the end time when I know the start and how long it lasts.",
        gen: function () {
          var C2 = [["La récréation commence à", "Break time starts at", "Elle dure", "It lasts", "À quelle heure finit-elle ?", "What time does it end?"], ["Le film commence à", "The film starts at", "Il dure", "It lasts", "À quelle heure finit-il ?", "What time does it end?"],
            ["Je commence à lire à", "I start reading at", "Je lis pendant", "I read for", "À quelle heure je m'arrête ?", "What time do I stop?"], ["Le cours de natation commence à", "The swimming lesson starts at", "Il dure", "It lasts", "À quelle heure finit-il ?", "What time does it end?"],
            ["Le bus part à", "The bus leaves at", "Le trajet dure", "The journey takes", "À quelle heure arrive-t-il ?", "What time does it arrive?"], ["Le marché ouvre à", "The market opens at", "Il reste ouvert", "It stays open for", "À quelle heure ferme-t-il ?", "What time does it close?"]];
          var D = [[15, "un quart d'heure", "a quarter of an hour"], [30, "une demi-heure", "half an hour"], [60, "une heure", "an hour"]];
          return HE.shuf(C2).map(function (c, k) { var h = HE.rint(7, 17), m = k < 3 ? HE.pk([0, 15, 30]) : HE.pk([45, 50, 40]), d = k < 3 ? HE.pk(D) : D[1], f = h * 60 + m + d[0];
            return { t: "champs", c: { fr: c[0] + " <b>" + h + ":" + HE.pad(m) + "</b>. " + c[2] + " <b>" + d[1] + "</b>. " + c[4], en: c[1] + " <b>" + h + ":" + HE.pad(m) + "</b>. " + c[3] + " <b>" + d[2] + "</b>. " + c[5] },
              z: function () { return '<div class="qz-reveil">' + qzDig(h, m) + '<span class="qz-fleche">→</span><span class="qz-dig qz-dig--vide">?</span></div>'; }, champs: [{ k: "h" }, { k: "m", sep: ":" }], r: { h: Math.floor(f / 60), m: f % 60 },
              ex: { fr: h + ":" + HE.pad(m) + " + " + d[0] + " min = " + Math.floor(f / 60) + ":" + HE.pad(f % 60) + (m + d[0] >= 60 ? ". Après 59 minutes, on passe à l'heure suivante." : "."), en: h + ":" + HE.pad(m) + " + " + d[0] + " min = " + Math.floor(f / 60) + ":" + HE.pad(f % 60) + (m + d[0] >= 60 ? ". After 59 minutes, we go to the next hour." : ".") } }; }); } }
    } },

    /* ---------- La division en ligne (leçons CAL7 « Diviser : grouper ou partager » et CAL8 « La division en ligne avec reste ») ---------- */
    division: { matiere: "maths", jeux: {
      rappel: { perso: "adi", etape: 0, fr: "Je me rappelle", en: "I remember", dfr: "Mes tables de multiplication.", den: "My times tables.",
        gen: function () { return [0, 1, 2].map(function () { var a = HE.rint(2, 5), b = HE.rint(3, 9), p = a * b, o = HE.shuf([p, p + a, p - a, a + b]).filter(function (x, i, t2) { return t2.indexOf(x) === i; });
          return { t: "choix", c: { fr: "Combien font <b>" + a + " × " + b + "</b> ?", en: "What is <b>" + a + " × " + b + "</b>?" }, o: o.map(String), a: o.indexOf(p), ex: { fr: a + " × " + b + " = " + p + ".", en: a + " × " + b + " = " + p + "." } }; }); } },
      grouper: { perso: "nina", etape: 1, fr: "Grouper ou partager", en: "Grouping or sharing", dfr: "Je cherche combien de groupes, ou combien dans chaque part.", den: "I find how many groups, or how many in each share.",
        gen: function () {
          var G = [["Noah a {n} sucres d'orge. Il prépare des sachets de {b}. Combien de sachets pourra-t-il faire ?", "Noah has {n} lollipops. He makes bags of {b}. How many bags can he make?", "sachets", "bags"],
            ["Tehani a {n} mangues. Elle les range dans des paniers de {b}. Combien de paniers remplit-elle ?", "Tehani has {n} mangoes. She puts them in baskets of {b}. How many baskets does she fill?", "paniers", "baskets"],
            ["Il y a {n} élèves. On fait des équipes de {b}. Combien d'équipes y a-t-il ?", "There are {n} pupils. We make teams of {b}. How many teams are there?", "équipes", "teams"]];
          var P = [["Méi a {n} billes. Elle les partage entre {b} amies. Combien de billes aura chacune ?", "Méi has {n} marbles. She shares them between {b} friends. How many marbles will each one get?", "billes", "marbles"],
            ["Papi Tao partage {n} poissons entre {b} familles. Combien de poissons a chaque famille ?", "Grandad Tao shares {n} fish between {b} families. How many fish does each family get?", "poissons", "fish"],
            ["La maîtresse partage {n} crayons entre {b} tables. Combien de crayons y a-t-il sur chaque table ?", "The teacher shares {n} pencils between {b} tables. How many pencils are on each table?", "crayons", "pencils"]];
          return HE.shuf(G).concat(HE.shuf(P)).map(function (x, k) { var b = HE.rint(2, 5), q = HE.rint(3, 9), n = b * q, s = function (z) { return z.replace("{n}", n).replace("{b}", b); }, grp = k < 3;
            return { t: "champs", c: { fr: s(x[0]), en: s(x[1]) }, champs: [{ k: "q", avant: "", apres: " " + qzT({ fr: x[2], en: x[3] }) }], r: { q: q },
              z: function (en) { return '<p class="qz-egal">' + n + " = " + b + " × … " + (en ? " or " : " ou ") + n + (en ? " ÷ " : " : ") + b + " = …</p>"; },
              ex: { fr: (grp ? "Dans " + n + ", combien de fois " + b + " ? " : n + " partagé en " + b + " : ") + n + " = " + b + " × " + q + ", donc " + n + " : " + b + " = " + q + ".", en: n + " = " + b + " × " + q + ", so " + n + " ÷ " + b + " = " + q + "." } }; });
        } },
      calcule: { perso: "dylan", etape: 2, fr: "Calcule", en: "Work it out", dfr: "Je trouve le nombre qui manque : 24 = 4 × … ou 24 : 4 = …", den: "I find the missing number: 24 = 4 × … or 24 ÷ 4 = …",
        gen: function () { var vus = {}, qs = []; while (qs.length < 8) { var b = HE.rint(2, 5), q = HE.rint(2, 10); if (vus[b + "x" + q]) continue; vus[b + "x" + q] = 1; var n = b * q, k = qs.length;
          qs.push(k % 2 === 0 ? { t: "champs", c: { fr: "Complète.", en: "Fill in the missing number." }, champs: [{ k: "q", avant: n + " = " + b + " × " }], r: { q: q }, ex: { fr: b + " × " + q + " = " + n + ".", en: b + " × " + q + " = " + n + "." } }
            : { t: "champs", c: { fr: "Calcule.", en: "Work it out." }, champs: [{ k: "q", avant: n + " : " + b + " = ", avantEn: n + " ÷ " + b + " = " }], r: { q: q }, ex: { fr: n + " = " + b + " × " + q + ", donc " + n + " : " + b + " = " + q + ".", en: n + " = " + b + " × " + q + ", so " + n + " ÷ " + b + " = " + q + "." } }); }
          return qs; } },
      reste: { perso: "waeko", etape: 3, fr: "Avec un reste", en: "With a remainder", dfr: "J'écris la division en ligne avec le reste : 43 = (5 × 8) + 3.", den: "I write the division with the remainder: 43 = (5 × 8) + 3.",
        gen: function () {
          var X = [["Amaury a {n} cupcakes qu'il veut ranger par boîtes de {b}. Combien de boîtes pourra-t-il faire ?", "Amaury has {n} cupcakes to put in boxes of {b}. How many boxes can he make?", "boîtes", "boxes", "cupcakes"],
            ["Isis a {n} cartes qu'elle veut partager entre ses {b} amis. Combien de cartes aura chacun ?", "Isis has {n} cards to share between her {b} friends. How many cards will each one get?", "cartes chacun", "cards each", "cartes"],
            ["Nina a {n} coquillages. Elle les range dans des sachets de {b}. Combien de sachets remplit-elle ?", "Nina has {n} shells. She puts them in bags of {b}. How many bags does she fill?", "sachets", "bags", "coquillages"],
            ["Vaka partage {n} letchis entre {b} amis. Combien de letchis aura chacun ?", "Vaka shares {n} lychees between {b} friends. How many lychees will each one get?", "letchis chacun", "lychees each", "letchis"],
            ["On range {n} livres sur des étagères de {b} livres. Combien d'étagères sont pleines ?", "We put {n} books on shelves of {b} books. How many shelves are full?", "étagères", "shelves", "livres"],
            ["Wadra a {n} billes. Il fait des paquets de {b}. Combien de paquets fait-il ?", "Wadra has {n} marbles. He makes packs of {b}. How many packs does he make?", "paquets", "packs", "billes"]];
          return HE.shuf(X).map(function (x) { var b = HE.rint(3, 6), q = HE.rint(3, 9), r = HE.rint(1, b - 1), n = b * q + r, s = function (z) { return z.replace("{n}", n).replace("{b}", b); };
            return { t: "champs", c: { fr: s(x[0]) + " Combien en reste-t-il ?", en: s(x[1]) + " How many are left over?" },
              z: function (en) { return '<p class="qz-egal">' + (en ? "I divide " + n + " by " + b : "Je divise " + n + " par " + b) + "</p>"; },
              champs: [{ k: "q", avant: n + " = (" + b + " × " }, { k: "r", sep: ") + " }], r: { q: q, r: r },
              ex: { fr: n + " = (" + b + " × " + q + ") + " + r + " : " + q + " " + x[2] + ", il en reste " + r + ". Le reste (" + r + ") est plus petit que le diviseur (" + b + ").", en: n + " = (" + b + " × " + q + ") + " + r + ": " + q + " " + x[3] + ", " + r + " left over. The remainder (" + r + ") is smaller than the divisor (" + b + ")." } }; });
        } }
    } },

    /* ---------- La monnaie (leçon GM1 « La monnaie ») ---------- */
    monnaie: { matiere: "maths", jeux: {
      rappel: { perso: "adi", etape: 0, fr: "Je me rappelle", en: "I remember", dfr: "Composer et décomposer un nombre.", den: "Making and splitting numbers.",
        gen: function () { var c = HE.rint(1, 9), d = HE.rint(1, 9), u = HE.pk([0, 5]), n = c * 100 + d * 10 + u, m = HE.rint(1, 6), n2 = m * 1000 + HE.rint(1, 9) * 100 + 50;
          var o1 = HE.shuf([n, c * 100 + u * 10 + d, d * 100 + c * 10 + u, n + 100]).filter(function (x, i, t2) { return t2.indexOf(x) === i; });
          var o2 = HE.shuf([n2, n2 - 1000, n2 + 100, n2 + 1000]);
          return [
            { t: "choix", c: { fr: "Quel nombre fait <b>" + c * 100 + " + " + d * 10 + (u ? " + " + u : "") + "</b> ?", en: "Which number is <b>" + c * 100 + " + " + d * 10 + (u ? " + " + u : "") + "</b>?" }, o: o1.map(exMille), a: o1.indexOf(n), ex: { fr: c + " centaines, " + d + " dizaines et " + u + " unités : " + n + ".", en: c + " hundreds, " + d + " tens and " + u + " ones: " + n + "." } },
            { t: "choix", c: { fr: "Quel nombre fait <b>" + exMille(m * 1000) + " + " + (n2 - m * 1000) + "</b> ?", en: "Which number is <b>" + exMille(m * 1000) + " + " + (n2 - m * 1000) + "</b>?" }, o: o2.map(exMille), a: o2.indexOf(n2), ex: { fr: exMille(m * 1000) + " + " + (n2 - m * 1000) + " = " + exMille(n2) + ".", en: exMille(m * 1000) + " + " + (n2 - m * 1000) + " = " + exMille(n2) + "." } },
            { t: "choix", c: { fr: "Combien font <b>50 + 20 + 5</b> ?", en: "What is <b>50 + 20 + 5</b>?" }, o: ["75", "70", "65", "57"], a: 0, ex: { fr: "50 + 20 = 70, et 70 + 5 = 75.", en: "50 + 20 = 70, and 70 + 5 = 75." } }
          ]; } },
      compter: { perso: "mei", etape: 1, fr: "Combien d'argent ?", en: "How much money?", dfr: "Je compte les pièces et les billets.", den: "I count the coins and notes.",
        gen: function () { return [3, 3, 4, 4, 5, 5].map(function (n, k) { var b = []; for (var i = 0; i < n; i++) b.push(HE.pk(PO.PIECES)); if (k >= 3) b.push(HE.pk([500, 1000])); b.sort(function (x, y) { return y - x; }); var s = b.reduce(function (x, y) { return x + y; }, 0);
          return { t: "champs", c: { fr: "Combien d'argent y a-t-il dans le porte-monnaie ?", en: "How much money is in the purse?" }, z: function () { return qzPorteMonnaie(b); }, champs: [{ k: "s", apres: " F" }], r: { s: s },
            ex: { fr: b.join(" + ") + " = " + exMille(s) + " F. Je commence par les plus gros.", en: b.join(" + ") + " = " + exMille(s) + " F. I start with the biggest." } }; }); } },
      payer: { perso: "vaka", etape: 2, fr: "Paie le prix exact", en: "Pay the exact price", dfr: "Je choisis les pièces et les billets pour payer juste.", den: "I choose coins and notes to pay the exact amount.",
        gen: function () { return [HE.pk([35, 45, 65]), HE.pk([75, 85, 95]), HE.pk([120, 160, 180]), HE.pk([235, 275, 340]), HE.pk([480, 650, 720]), HE.pk([1250, 1375, 1600])].map(function (p) {
          return { t: "pieces", cible: p, c: { fr: "Paie <b>" + exMille(p) + " F</b> avec les pièces et les billets.", en: "Pay <b>" + exMille(p) + " F</b> with the coins and notes." },
            ex: { fr: "Pour payer, je décompose la somme : je commence par les plus gros billets et les plus grosses pièces.", en: "To pay, I split the amount: I start with the biggest notes and coins." } }; }); } },
      marche: { perso: "tehani", etape: 3, fr: "Au marché", en: "At the market", dfr: "Je calcule ce que je paie et ce qu'on me rend.", den: "I work out what I pay and my change.",
        gen: function () { var qs = []; for (var k = 0; k < 6; k++) { var f = HE.shuf(PO.FRUITS).slice(0, 2), tot = f[0].prix + f[1].prix, billet = tot < 500 ? 500 : 1000, qui = HE.pk(QZ_PRENOMS);
          qs.push(k % 2 === 0 ? { t: "champs", c: { fr: qui + " achète " + f[0].fr + " (" + f[0].prix + " F) et " + f[1].fr + " (" + f[1].prix + " F). Combien paie-t-il ou elle ?", en: qui + " buys " + f[0].en + " (" + f[0].prix + " F) and " + f[1].en + " (" + f[1].prix + " F). How much is it?" }, champs: [{ k: "s", apres: " F" }], r: { s: tot }, ex: { fr: f[0].prix + " F + " + f[1].prix + " F = " + tot + " F.", en: f[0].prix + " F + " + f[1].prix + " F = " + tot + " F." } }
            : { t: "champs", c: { fr: qui + " achète " + f[0].fr + " et " + f[1].fr + " : " + tot + " F en tout. Il ou elle paie avec un billet de " + exMille(billet) + " F. Combien lui rend-on ?", en: qui + " buys " + f[0].en + " and " + f[1].en + ": " + tot + " F altogether. They pay with a " + exMille(billet) + " F note. How much change do they get?" }, z: function () { return qzPorteMonnaie([billet]); }, champs: [{ k: "s", apres: " F" }], r: { s: billet - tot }, ex: { fr: exMille(billet) + " F − " + tot + " F = " + (billet - tot) + " F. Je peux vérifier : " + tot + " F + " + (billet - tot) + " F = " + exMille(billet) + " F.", en: exMille(billet) + " F − " + tot + " F = " + (billet - tot) + " F. Check: " + tot + " F + " + (billet - tot) + " F = " + exMille(billet) + " F." } }); }
          return qs; } }
    } },

    /* ---------- Mesurer des masses (leçon GM8 « Les mesures de masses ») : D-110 ---------- */
    masses: { matiere: "maths", jeux: {
      rappel: { perso: "adi", etape: 0, fr: "Je me rappelle", en: "I remember", dfr: "Plus lourd, plus léger ; les milliers.", den: "Heavier, lighter; thousands.",
        gen: function () { var n = HE.rint(2, 9);
          return [
            { t: "choix", c: { fr: "Qu’est-ce qui est le plus lourd ?", en: "Which is heavier?" }, o: [{ fr: "un ballon de baudruche", en: "a balloon" }, { fr: "une boule de pétanque", en: "a pétanque ball" }], a: 1, ex: { fr: "La boule de pétanque est plus petite, mais bien plus lourde : la taille ne dit pas la masse.", en: "The pétanque ball is smaller but much heavier: size does not tell you the mass." } },
            { t: "choix", c: { fr: "Combien font <b>1 000 + 1 000 + 1 000</b> ?", en: "What is <b>1,000 + 1,000 + 1,000</b>?" }, o: [{ fr: "3 000", en: "3,000" }, { fr: "300", en: "300" }, { fr: "1 003", en: "1,003" }], a: 0, ex: { fr: "3 fois 1 000 : 3 000.", en: "3 lots of 1,000: 3,000." } },
            { t: "champs", c: { fr: "Complète.", en: "Fill in the missing number." }, champs: [{ k: "v", avant: n + " × 1 000 = ", avantEn: n + " × 1,000 = " }], r: { v: n * 1000 }, ex: { fr: n + " × 1 000 = " + exMille(n * 1000).replace(" ", " ") + " : " + n + " milliers.", en: n + " × 1,000 = " + (n * 1000).toLocaleString("en-GB") + ": " + n + " thousands." } }
          ]; } },
      unite: { perso: "tehani", etape: 1, fr: "Quelle unité ?", en: "Which unit?", dfr: "Je choisis l’unité qui convient : g, kg ou t.", den: "I choose the right unit: g, kg or t.",
        gen: function () {
          var G = [["un trombone", "a paper clip", 1], ["un œuf", "an egg", 50], ["une mangue", "a mango", 400], ["une lettre", "a letter", 20], ["un crayon", "a pencil", 5]],
            K = [["un sac de riz", "a bag of rice", 5], ["un chien", "a dog", 15], ["un enfant de 8 ans", "an 8-year-old child", 27], ["une valise", "a suitcase", 20], ["une pastèque", "a watermelon", 6]],
            T = [["un éléphant", "an elephant", 5], ["une petite voiture", "a small car", 1], ["un bus", "a bus", 12], ["un camion", "a lorry", 10]];
          var U = [{ fr: "grammes (g)", en: "grams (g)" }, { fr: "kilogrammes (kg)", en: "kilograms (kg)" }, { fr: "tonnes (t)", en: "tonnes (t)" }];
          var EX = [{ fr: "C’est léger : on l’exprime en grammes. Un trombone pèse 1 g.", en: "It is light: we use grams. A paper clip weighs 1 g." },
            { fr: "C’est plus lourd qu’un paquet de sucre (1 kg) : on l’exprime en kilogrammes.", en: "It is heavier than a bag of sugar (1 kg): we use kilograms." },
            { fr: "C’est très lourd : on l’exprime en tonnes. Une petite voiture pèse environ 1 t.", en: "It is very heavy: we use tonnes. A small car weighs about 1 t." }];
          var q = HE.shuf(G).slice(0, 3).map(function (x) { return [x, 0]; }).concat(HE.shuf(K).slice(0, 3).map(function (x) { return [x, 1]; }), HE.shuf(T).slice(0, 2).map(function (x) { return [x, 2]; }));
          return HE.shuf(q).map(function (y) { var x = y[0];
            return { t: "choix", c: { fr: HE.cap(x[0]) + " pèse environ <b>" + x[2] + " …</b> Quelle est l’unité ?", en: HE.cap(x[1]) + " weighs about <b>" + x[2] + " …</b> What is the unit?" },
              z: function () { return '<div class="lx-illu">' + PO.balance(x[2], "?") + "</div>"; }, o: U, a: y[1], ex: EX[y[1]] }; }); } },
      convertir: { perso: "dylan", etape: 1, fr: "C’est pareil que…", en: "It is the same as…", dfr: "J’écris une masse avec une autre unité : 4 kg = 4 000 g.", den: "I write a mass with another unit: 4 kg = 4,000 g.",
        gen: function () {
          var M = function (n, en) { return en ? n.toLocaleString("en-GB") : exMille(n).replace(/ /g, " "); };
          var a = HE.shuf([2, 3, 4, 5, 6, 7, 8, 9]), b = HE.shuf([100, 200, 250, 300, 400, 500, 600, 750, 800]);
          var qs = [
            function (i) { var n = a[i]; return { t: "champs", c: { fr: "Complète.", en: "Fill in the missing number." }, champs: [{ k: "v", avant: n + " kg = ", apres: " g" }], r: { v: n * 1000 }, ex: { fr: "1 kg = 1 000 g, donc " + n + " kg = " + M(n * 1000) + " g.", en: "1 kg = 1,000 g, so " + n + " kg = " + M(n * 1000, true) + " g." } }; },
            function (i) { var n = a[i]; return { t: "champs", c: { fr: "Complète.", en: "Fill in the missing number." }, champs: [{ k: "v", avant: n + " t = ", apres: " kg" }], r: { v: n * 1000 }, ex: { fr: "1 t = 1 000 kg, donc " + n + " t = " + M(n * 1000) + " kg.", en: "1 t = 1,000 kg, so " + n + " t = " + M(n * 1000, true) + " kg." } }; },
            function (i) { var n = a[i] % 4 + 1, g = b[i]; return { t: "champs", c: { fr: "Complète.", en: "Fill in the missing number." }, champs: [{ k: "v", avant: n + " kg " + g + " g = ", apres: " g" }], r: { v: n * 1000 + g }, ex: { fr: n + " kg " + g + " g = " + M(n * 1000) + " g + " + g + " g = " + M(n * 1000 + g) + " g.", en: n + " kg " + g + " g = " + M(n * 1000, true) + " g + " + g + " g = " + M(n * 1000 + g, true) + " g." } }; },
            function (i) { var n = a[i]; return { t: "champs", c: { fr: "Complète.", en: "Fill in the missing number." }, champs: [{ k: "v", avant: M(n * 1000) + " g = ", avantEn: M(n * 1000, true) + " g = ", apres: " kg" }], r: { v: n }, ex: { fr: "1 000 g = 1 kg, donc " + M(n * 1000) + " g = " + n + " kg.", en: "1,000 g = 1 kg, so " + M(n * 1000, true) + " g = " + n + " kg." } }; }
          ];
          return [0, 1, 2, 3, 0, 2, 1, 2].map(function (t2, i) { return qs[t2](i); }); } },
      comparer: { perso: "vaka", etape: 2, fr: "Le plus lourd", en: "The heaviest", dfr: "Je compare deux masses écrites avec des unités différentes.", den: "I compare two masses written with different units.",
        gen: function () {
          var M = function (n, en) { return en ? n.toLocaleString("en-GB") : exMille(n).replace(/ /g, " "); };
          var P = HE.shuf([2, 3, 4, 5, 6]), d = function () { return HE.pk([100, 200, 300, 500]); };
          var paires = [
            [P[0] + " kg", P[0] * 1000, M(P[0] * 1000 - d()) + " g"], [M(P[1] * 1000 + d()) + " g", null, P[1] + " kg"], [P[2] + " kg", P[2] * 1000, M(P[2] * 1000) + " g"],
            [P[3] + " t", P[3] * 1000000, M(P[3] * 1000 - d()) + " kg"], ["1 kg 200 g", 1200, "1 500 g"], ["1 kg", 1000, "1 kg", "plumes"]
          ];
          var val = function (s) { var x = s.replace(/[\s ,]/g, ""), m; if ((m = /^(\d+)kg(\d+)g$/.exec(x))) return +m[1] * 1000 + +m[2]; if ((m = /^(\d+)t$/.exec(x))) return +m[1] * 1000000; if ((m = /^(\d+)kg$/.exec(x))) return +m[1] * 1000; return +x.replace("g", ""); };
          return HE.shuf(paires).map(function (p) {
            if (p[3]) return { t: "choix", c: { fr: "Qu’est-ce qui est le plus lourd ?", en: "Which is heavier?" }, o: [{ fr: "1 kg de plumes", en: "1 kg of feathers" }, { fr: "1 kg de riz", en: "1 kg of rice" }, { fr: "Ils pèsent pareil", en: "They weigh the same" }], a: 2, ex: { fr: "1 kg, c’est 1 kg : les plumes prennent beaucoup plus de place, mais elles pèsent pareil.", en: "1 kg is 1 kg: the feathers take up much more space, but they weigh the same." } };
            var A = val(p[0]), B = val(p[2]), en = langue === "en", lib = function (s) { return { fr: s, en: s.replace(/(\d)[\s\u00a0\u202f](?=\d{3})/g, "$1,") }; };
            var g = function (v) { return v >= 1000000 ? M(v / 1000) + " kg" : M(v) + " g"; }, gE = function (v) { return v >= 1000000 ? M(v / 1000, true) + " kg" : M(v, true) + " g"; };
            var meme = p[0].indexOf("t") > 0 ? "kg" : "g";
            /* on ne convertit que ce qui n’est pas déjà dans l’unité commune */
            var conv = [[p[0], A], [p[2], B]].filter(function (x) { return !new RegExp("^[\\d\\s\\u00a0\\u202f]+ " + meme + "$").test(x[0]); });
            return { t: "choix", c: { fr: "Qu’est-ce qui est le plus lourd ?", en: "Which is heavier?" }, o: [lib(p[0]), lib(p[2]), { fr: "Ils pèsent pareil", en: "They weigh the same" }], a: A === B ? 2 : A > B ? 0 : 1,
              ex: { fr: "J’écris tout en " + (meme === "kg" ? "kilogrammes" : "grammes") + " : " + conv.map(function (x) { return x[0] + " = " + g(x[1]); }).join(" et ") + ". " + (A === B ? "C’est pareil." : g(Math.max(A, B)) + " > " + g(Math.min(A, B)) + "."),
                    en: "I write everything in " + (meme === "kg" ? "kilograms" : "grams") + ": " + conv.map(function (x) { return lib(x[0]).en + " = " + gE(x[1]); }).join(" and ") + ". " + (A === B ? "They are the same." : gE(Math.max(A, B)) + " > " + gE(Math.min(A, B)) + ".") } }; }); } },
      probleme: { perso: "mei", etape: 3, fr: "Problèmes de masses", en: "Mass problems", dfr: "Je résous des problèmes avec des grammes, des kilogrammes et des tonnes.", den: "I solve problems with grams, kilograms and tonnes.",
        gen: function () {
          var M = function (n, en) { return en ? n.toLocaleString("en-GB") : exMille(n).replace(/ /g, " "); };
          var a = HE.rint(1, 3), b = HE.pk([250, 500, 750]), p = HE.pk([200, 300, 400, 600]), c = HE.rint(2, 6), d = HE.rint(2, 5), e = HE.rint(24, 32), f = HE.rint(2, 5), n = HE.rint(2, 4), m = HE.pk([200, 250, 300]);
          return HE.shuf([
            { t: "champs", c: { fr: "Sari achète un sac de riz de <b>" + a + " kg</b> et un paquet de farine de <b>" + b + " g</b>. Combien pèsent ses courses, en grammes ?", en: "Sari buys a <b>" + a + " kg</b> bag of rice and a <b>" + b + " g</b> bag of flour. How much does her shopping weigh, in grams?" }, champs: [{ k: "v", apres: " g" }], r: { v: a * 1000 + b }, ex: { fr: a + " kg = " + M(a * 1000) + " g ; " + M(a * 1000) + " g + " + b + " g = " + M(a * 1000 + b) + " g.", en: a + " kg = " + M(a * 1000, true) + " g; " + M(a * 1000, true) + " g + " + b + " g = " + M(a * 1000 + b, true) + " g." } },
            { t: "champs", c: { fr: "Le panier de Tehani pèse <b>1 kg</b>. Elle enlève une papaye de <b>" + p + " g</b>. Combien pèse le panier maintenant ?", en: "Tehani’s basket weighs <b>1 kg</b>. She takes out a <b>" + p + " g</b> papaya. How much does the basket weigh now?" }, champs: [{ k: "v", apres: " g" }], r: { v: 1000 - p }, ex: { fr: "1 kg = 1 000 g ; 1 000 g − " + p + " g = " + (1000 - p) + " g.", en: "1 kg = 1,000 g; 1,000 g − " + p + " g = " + (1000 - p) + " g." } },
            { t: "champs", c: { fr: "Un camion vide pèse <b>" + c + " t</b>. On le charge avec <b>" + d + " t</b> de sable. Combien pèse-t-il chargé ?", en: "An empty lorry weighs <b>" + c + " t</b>. It is loaded with <b>" + d + " t</b> of sand. How much does it weigh when loaded?" }, champs: [{ k: "v", apres: " t" }], r: { v: c + d }, ex: { fr: c + " t + " + d + " t = " + (c + d) + " t.", en: c + " t + " + d + " t = " + (c + d) + " t." } },
            { t: "champs", c: { fr: "Dylan pèse <b>" + e + " kg</b>. Avec son cartable sur le dos, la balance affiche <b>" + (e + f) + " kg</b>. Combien pèse le cartable ?", en: "Dylan weighs <b>" + e + " kg</b>. With his school bag on his back, the scale shows <b>" + (e + f) + " kg</b>. How much does the bag weigh?" }, champs: [{ k: "v", apres: " kg" }], r: { v: f }, ex: { fr: (e + f) + " kg − " + e + " kg = " + f + " kg.", en: (e + f) + " kg − " + e + " kg = " + f + " kg." } },
            { t: "champs", c: { fr: "Une mangue pèse <b>" + m + " g</b>. Combien pèsent <b>" + n + " mangues</b> ?", en: "A mango weighs <b>" + m + " g</b>. How much do <b>" + n + " mangoes</b> weigh?" }, champs: [{ k: "v", apres: " g" }], r: { v: n * m }, ex: { fr: n + " × " + m + " g = " + M(n * m) + " g" + (n * m === 1000 ? " = 1 kg." : n * m > 1000 ? " : c’est plus de 1 kg." : " : c’est moins de 1 kg."), en: n + " × " + m + " g = " + M(n * m, true) + " g" + (n * m === 1000 ? " = 1 kg." : n * m > 1000 ? ": more than 1 kg." : ": less than 1 kg.") } },
            { t: "champs", c: { fr: "Une plaquette de beurre pèse <b>250 g</b>. Combien de plaquettes faut-il pour faire <b>1 kg</b> ?", en: "A block of butter weighs <b>250 g</b>. How many blocks make <b>1 kg</b>?" }, champs: [{ k: "v", apres: { fr: " plaquettes", en: " blocks" } }], r: { v: 4 }, ex: { fr: "1 kg = 1 000 g ; 250 + 250 + 250 + 250 = 1 000 : il faut 4 plaquettes.", en: "1 kg = 1,000 g; 250 + 250 + 250 + 250 = 1,000: you need 4 blocks." } }
          ]); } }
    } },

    /* ---------- Le verbe : « Je réinvestis » (leçon CONJ2) [PROPOSITION : textes écrits par Claude] ---------- */
    verbe: { matiere: "francais", jeux: {
      textes: { perso: "nina", etape: 3, fr: "Les verbes du texte", en: "Verbs in a text", dfr: "Je touche tous les verbes conjugués d'un petit texte.", den: "I tap all the conjugated verbs in a short text.",
        gen: function () { return HE.shuf([
          { mots: "Le matin, Tehani prend le bus. Elle arrive à l'école à sept heures et demie. Dans la cour, ses amis jouent au ballon. La cloche sonne. Les élèves entrent en classe.", v: ["prend", "arrive", "jouent", "sonne", "entrent"] },
          { mots: "Papi Tao part à la pêche. La mer est calme. Il lance sa ligne. Un gros poisson mord à l'hameçon. Papi Tao rentre content.", v: ["part", "est", "lance", "mord", "rentre"] },
          { mots: "Kakou court dans la forêt. Il cherche des vers de terre. Margouille dort sous une feuille. Le soleil brille. Les oiseaux chantent.", v: ["court", "cherche", "dort", "brille", "chantent"] }
        ]).map(function (x) { var mots = x.mots.split(" "), vs = [], reste = x.v.slice();
          mots.forEach(function (w, i) { var p = w.replace(/[.,]/g, ""); var j = reste.indexOf(p); if (j >= 0) { vs.push(i); reste.splice(j, 1); } });
          return { t: "mots", mots: mots, v: vs, c: { fr: "Touche les <b>" + vs.length + " verbes conjugués</b> du texte, puis valide.", en: "Tap the <b>" + vs.length + " conjugated verbs</b> in the text, then check." },
            ex: { fr: "Les verbes : " + x.v.join(", ") + ". Pour vérifier, je mets la phrase à la forme négative : le verbe est entre ne et pas.", en: "The verbs: " + x.v.join(", ") + ". To check, I make the sentence negative: the verb is between ne and pas." } }; }); } }
    } }
  };

  function qzDemarrer(seq, jeu) { QZ = { seq: seq, jeu: jeu, qs: QUIZ[seq].jeux[jeu].gen(), i: 0, score: 0, rep: false, choix: -1, msg: "", essais: 0, fin: false, val: {}, sel: [] }; }
  function qzSuite(dernier) { return '<button class="coco-btn coco-btn--grand" type="button" data-action="qz-suite">' + (dernier ? (langue === "en" ? "See my score" : "Voir mon score") : t("suivant")) + "</button>"; }
  function jeuQZ(seq, jeu) {
    var S = QUIZ[seq], J = S.jeux[jeu], m = MATIERE[S.matiere], en = langue === "en";
    if (!QZ || QZ.seq !== seq || QZ.jeu !== jeu) qzDemarrer(seq, jeu);
    var n = QZ.qs.length;
    var titre = { sous: tr(C[seq].titre) + " · " + (J.etape ? J.etape + " · " : "1 · ") + t(QZ_ETAPE[J.etape]), titre: en ? J.en : J.fr };
    var haut = barre(S.matiere) + hautJeu(m, "seq-" + seq, titre, galets(n, QZ.fin ? n : QZ.i));
    if (QZ.fin) return haut + qzBilan();
    var q = QZ.qs[QZ.i], zone = q.z ? q.z(en) : "", bas = "";
    if (q.t === "choix") {
      zone += '<div class="coco-row qz-choix">' + q.o.map(function (o, k) {
        var cls = "coco-etiquette hr-choix" + (QZ.rep && k === q.a ? " est-juste" : QZ.rep && k === QZ.choix ? " est-revoir" : "");
        return '<button class="' + cls + '" type="button" data-action="qz-choix" data-v="' + k + '"' + (QZ.rep ? " disabled" : "") + ">" + esc(typo(qzT(o))) + "</button>"; }).join("") + "</div>";
    } else if (q.t === "champs") {
      zone += '<p class="qz-champs">' + q.champs.map(function (f) {
        var avant = en && f.avantEn !== undefined ? f.avantEn : (f.avant || "");
        return (f.sep ? '<span class="qz-sep">' + esc(f.sep) + "</span>" : "") + (avant ? "<span>" + esc(avant) + "</span>" : "") +
          '<input class="qz-champ" type="text" inputmode="numeric" autocomplete="off" data-qz="' + f.k + '" value="' + esc(QZ.val[f.k] || "") + '"' + (QZ.rep ? " disabled" : "") + ' aria-label="' + (en ? "answer" : "réponse") + '">' + (f.apres ? "<span>" + esc(qzT(f.apres)) + "</span>" : ""); }).join("") + "</p>";
      bas = QZ.rep ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="qz-valider">' + t("valider") + "</button>";
    } else if (q.t === "ecrire") {
      zone += '<p class="qz-champs qz-ecrire">' + (q.avant ? "<span>" + esc(q.avant) + "</span>" : "") + '<input class="qz-champ qz-champ--mot" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off" data-qz="v" value="' + esc(QZ.val.v || "") + '"' + (QZ.rep ? " disabled" : "") + ' aria-label="' + (en ? "answer" : "réponse") + '">' + (q.apres ? "<span>" + esc(q.apres) + "</span>" : "") + "</p>";
      bas = QZ.rep ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="qz-valider">' + t("valider") + "</button>";
    } else if (q.t === "pieces") {
      var somme = QZ.sel.reduce(function (a, v) { return a + v; }, 0);
      zone += '<p class="qz-legende">' + (en ? "In my hand:" : "Dans ma main :") + "</p>" + '<div class="qz-main">' + (QZ.sel.length ? QZ.sel.map(function (v, k) { return qzArgent(v, QZ.rep ? "" : "qz-retirer", k); }).join("") : '<span class="qz-vide">' + (en ? "Tap the coins and notes below." : "Touche les pièces et les billets en dessous.") + "</span>") + "</div>" +
        (QZ.rep ? '<p class="qz-total">' + (en ? "Total: " : "Total : ") + exMille(somme) + " F</p>" : '<p class="qz-legende">' + (en ? "Tap a coin in your hand to take it back." : "Touche une pièce dans ta main pour la reprendre.") + "</p>") +
        (QZ.rep ? "" : '<div class="po-pieces qz-caisse">' + QZ_BILLETS.concat(PO.PIECES.slice().reverse()).map(function (v) { return qzArgent(v, "qz-piece"); }).join("") + "</div>");
      bas = QZ.rep ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="qz-valider"' + (QZ.sel.length ? "" : " disabled") + ">" + t("valider") + "</button>";
    } else if (q.t === "dictee") {
      var nv = lire("dictee-niv", 1);
      zone = '<div class="coco-row or-niveaux" role="group" aria-label="' + (en ? "Level" : "Niveau") + '">' + [1, 2, 3].map(function (k) { return '<button class="coco-btn' + (k === nv ? "" : " coco-btn--secondaire") + '" type="button" data-action="qz-niv" data-v="' + k + '" aria-pressed="' + (k === nv) + '">' + "★★★".slice(0, k) + "</button>"; }).join("") + "</div>" +
        (q.titre ? '<p class="qz-legende"><b>« ' + esc(q.titre) + " »</b></p>" : "") +
        '<div class="coco-row or-ecoute"><button class="coco-btn coco-btn--secondaire" type="button" data-action="qz-dire" data-v="' + esc(orPlain(q.texte)) + '">' + (q.titre ? (en ? "Listen to the text" : "Écouter le texte") : (en ? "Listen to the sentence" : "Écouter la phrase")) + "</button>" +
        '<button class="coco-btn coco-btn--secondaire" type="button" data-action="qz-dire" data-v="' + esc(orMorceaux(q.texte).join("|")) + '">' + (en ? "Bit by bit" : "Morceau par morceau") + "</button></div>" +
        (QZ.vu ? '<p class="qz-phrase or-dictee">' + orCibles(q.texte) + "</p><p>" + (en ? "Compare with your exercise book. Did you write all the words in bold correctly?" : "Compare avec ton cahier. As-tu bien écrit tous les mots en gras ?") + "</p>" : "");
      bas = QZ.rep ? "" : !QZ.vu ? '<button class="coco-btn coco-btn--grand" type="button" data-action="qz-fini">' + (en ? "I’ve finished" : "J’ai fini") + "</button>"
        : '<span class="coco-row"><button class="coco-btn coco-btn--secondaire" type="button" data-action="qz-auto" data-v="0">' + (en ? "Not all of them" : "Pas tous") + '</button><button class="coco-btn coco-btn--grand" type="button" data-action="qz-auto" data-v="1">' + (en ? "Yes, all of them" : "Oui, tous") + "</button></span>";
    } else if (q.t === "mots") {
      zone += '<p class="qz-texte">' + q.mots.map(function (w, k) { var on = QZ.sel.indexOf(k) >= 0, juste = q.v.indexOf(k) >= 0;
        var cls = "qz-mot" + (on ? " est-choisi" : "") + (QZ.rep && juste ? " est-verbe" : "") + (QZ.rep && on && !juste ? " est-revoir" : "");
        return '<button class="' + cls + '" type="button" data-action="qz-mot" data-v="' + k + '"' + (QZ.rep ? " disabled" : "") + ">" + esc(w) + "</button>"; }).join(" ") + "</p>";
      bas = QZ.rep ? "" : '<button class="coco-btn coco-btn--grand" type="button" data-action="qz-valider"' + (QZ.sel.length ? "" : " disabled") + ">" + t("valider") + "</button>";
    }
    return haut + bulle(J.perso, qzT(q.c), J.etape === 0 ? "reflechit" : "presente") + '<section class="zone ' + m.classe + ' qz-zone">' + zone + "</section>" + '<div class="retour-zone">' + QZ.msg + "</div>" +
      (bas ? '<footer class="jeu-bas"><span></span>' + bas + "</footer>" : "");
  }
  function qzFinir(ok, txt) {
    var dernier = QZ.i === QZ.qs.length - 1;
    QZ.rep = true; if (ok && QZ.essais === 0) QZ.score++;
    QZ.msg = ok ? retour("bravo", t("bravo"), txt, qzSuite(dernier)) : retour("revoir", t("pasEncore"), txt, qzSuite(dernier));
  }
  function actionQZ(a, el) {
    if (!QZ) return;
    var q = QZ.qs[QZ.i];
    if (a === "qz-dire") { MO.dire(String(el.dataset.v).split("|")); return; }
    if (a === "qz-niv") { ecrire("dictee-niv", +el.dataset.v); qzDemarrer(QZ.seq, QZ.jeu); return; }
    if (a === "qz-suite") { if (QZ.i >= QZ.qs.length - 1) QZ.fin = true; else { QZ.i++; QZ.rep = false; QZ.choix = -1; QZ.msg = ""; QZ.essais = 0; QZ.val = {}; QZ.sel = []; QZ.vu = false; } return; }
    if (a === "qz-rejouer") { qzDemarrer(QZ.seq, QZ.jeu); return; }
    if (QZ.rep) return;
    if (a === "qz-choix") { QZ.choix = +el.dataset.v; var ok = QZ.choix === q.a; qzFinir(ok, typo(qzT(q.ex))); return; }
    if (a === "qz-fini") { QZ.vu = true; return; }
    if (a === "qz-auto") { var tout = el.dataset.v === "1"; qzFinir(tout, tout ? (langue === "en" ? "Well done: the words of the rule are spelt correctly." : "Bravo : les mots de la leçon sont bien écrits.") : (langue === "en" ? "Correct the words in bold in your exercise book, then read the sentence again." : "Corrige les mots en gras sur ton cahier, puis relis toute la phrase.")); return; }
    if (a === "qz-piece") { if (QZ.sel.length < 20) QZ.sel.push(+el.dataset.v); QZ.sel.sort(function (x, y) { return y - x; }); return; }
    if (a === "qz-retirer") { QZ.sel.splice(+el.dataset.k, 1); return; }
    if (a === "qz-mot") { var k = +el.dataset.v, i = QZ.sel.indexOf(k); if (i >= 0) QZ.sel.splice(i, 1); else QZ.sel.push(k); return; }
    if (a === "qz-valider") {
      var en = langue === "en";
      if (q.t === "champs") {
        var vide = q.champs.some(function (f) { return QZ.val[f.k] === undefined || QZ.val[f.k] === ""; });
        if (vide) { QZ.msg = retour("astuce", t("astuce"), en ? "Fill in every box before you check." : "Remplis toutes les cases avant de valider."); return; }
        var juste = q.champs.every(function (f) { return +QZ.val[f.k] === q.r[f.k]; });
        qzFinir(juste, typo(qzT(q.ex)));
      } else if (q.t === "ecrire") {
        if (!QZ.val.v || !String(QZ.val.v).trim()) { QZ.msg = retour("astuce", t("astuce"), en ? "Write the verb before you check." : "Écris le verbe avant de valider."); return; }
        qzFinir(q.r.some(function (x) { return ipNorm(x) === ipNorm(QZ.val.v); }), typo(qzT(q.ex)));
      } else if (q.t === "pieces") {
        var s = QZ.sel.reduce(function (x, v) { return x + v; }, 0);
        if (s === q.cible) qzFinir(true, (en ? "You paid exactly " : "Tu as payé juste ") + exMille(s) + " F" + (en ? ": " : " : ") + QZ.sel.join(" F + ") + " F.");
        else qzFinir(false, (en ? "Your hand holds " + exMille(s) + " F: that is " + (s < q.cible ? "not enough" : "too much") + ". " : "Dans ta main, il y a " + exMille(s) + " F : c'est " + (s < q.cible ? "trop peu" : "trop") + ". ") + qzT(q.ex));
      } else if (q.t === "mots") {
        var bon = QZ.sel.length === q.v.length && q.v.every(function (k) { return QZ.sel.indexOf(k) >= 0; });
        qzFinir(bon, typo(qzT(q.ex)));
      }
    }
  }
  function qzBilan() {
    var S = QUIZ[QZ.seq], J = S.jeux[QZ.jeu], en = langue === "en", n = QZ.qs.length, sc = QZ.score;
    marquerFait("qz-" + QZ.seq + "-" + QZ.jeu);
    var cles = Object.keys(S.jeux), suiv = cles[cles.indexOf(QZ.jeu) + 1];
    var txt = J.etape === 0 ? (en ? "You remembered " + sc + " out of " + n + "." : "Tu t’es rappelé " + sc + " réponse" + (sc > 1 ? "s" : "") + " sur " + n + ".") : (en ? "You got " + sc + " out of " + n + " right first time." : "Tu as réussi " + sc + " sur " + n + " du premier coup.");
    return '<section class="bilan"><img src="' + POSE_BILAN(J.perso, sc, n) + '" alt=""><h2>' + t("fini") + "</h2>" + (J.etape === 0 ? "" : '<p class="mi-score">' + sc + " / " + n + "</p>") + "<p>" + esc(typo(txt)) + "</p>" +
      '<div class="coco-row"><button class="coco-btn' + (suiv ? " coco-btn--secondaire" : "") + '" type="button" data-action="qz-rejouer">' + t("rejouer") + "</button>" +
      (suiv ? '<a class="coco-btn" href="#qz-' + QZ.seq + "-" + suiv + '">' + esc(en ? S.jeux[suiv].en : S.jeux[suiv].fr) + " →</a>" : "") +
      '<a class="coco-btn coco-btn--secondaire" href="#seq-' + QZ.seq + '">' + t("versSequence") + "</a></div></section>";
  }
  /* cartes des jeux sur la page de séquence */
  function cartesQZ(seq, sauf) {
    var S = QUIZ[seq], en = langue === "en";
    return Object.keys(S.jeux).filter(function (k) { return !sauf || sauf.indexOf(k) < 0; }).map(function (k) { var J = S.jeux[k];
      return carte(S.matiere, (J.etape || 1) + " · " + t(QZ_ETAPE[J.etape]), en ? J.en : J.fr, en ? J.den : J.dfr, J.perso, "qz-" + seq + "-" + k); }).join("");
  }

  /* ==========================================================================================
     Leçons des séquences complétées (D-96) : heure digitale (GM5), division (CAL7, CAL8), monnaie (GM1)
     Phrases des leçons de classe reprises mot pour mot ; « Je retiens » en cartes animées (D-86)
     ========================================================================================== */
  var LX = {};
  function lxPop(html, k) { return '<span class="jr-pop" style="animation-delay:' + (0.2 + k * 0.35) + 's">' + html + "</span>"; }
  function lxEcran(h, m) { return '<span class="lx-ecran"><span class="hr-h">' + h + '</span>:<span class="hr-m">' + HE.pad(m) + "</span></span>"; }
  function lxPoints(n, cls) { var s = ""; for (var i = 0; i < n; i++) s += '<span class="lx-pt ' + (cls || "") + '"></span>'; return s; }
  function lxDecompose(n) { /* 6 875 → [6000, 800, 70, 5] et les billets et pièces de chaque partie */
    var parts = [Math.floor(n / 1000) * 1000, Math.floor(n % 1000 / 100) * 100, Math.floor(n % 100 / 10) * 10, n % 10].filter(function (x) { return x > 0; });
    var ARG = [10000, 5000, 1000, 500, 200, 100, 50, 20, 10, 5];
    return parts.map(function (p) { var r = p, l = []; ARG.forEach(function (v) { if (v <= p) while (r >= v) { l.push(v); r -= v; } }); return { p: p, l: l }; });
  }
  function lxArgent(v, k) { return lxPop(v >= 500 ? '<span class="po-billet">' + exMille(v) + "<small>F</small></span>" : '<span class="po-piece' + (v >= 10 ? " po-piece--grande" : "") + '">' + v + "<small>F</small></span>", k); }

  function jrCartesDigitale(en) {
    var c = jrCartes(en).slice(1, 4);
    c.push({ t: en ? "Writing the time in words" : "Écrire l’heure en lettres",
      svg: '<div class="lx-illu">' + lxPop(lxEcran(6, 30), 0) + lxPop('<span class="lx-fl">→</span>', 1) + lxPop('<b class="lx-mots">' + (en ? "half past six" : "six heures et demie") + "</b>", 2) + "</div>",
      txt: en ? ["I get up at 6:30.", "→ half past six"] : ["Je me lève à 6h30.", "→ six heures et demie"] });
    return c;
  }
  function jrCartesDivision(en) {
    var sac = function (n, k) { return lxPop('<span class="lx-sac">' + lxPoints(n) + "</span>", k); };
    return [
      { t: en ? "Grouping" : "Grouper", svg: '<div class="lx-illu lx-wrap">' + [0, 1, 2, 3, 4, 5].map(function (k) { return sac(4, k); }).join("") + "</div>",
        txt: en ? ["24 grouped in 4s: how many 4s in 24?", "24 = 4 × 6", "or 24 ÷ 4 = 6"] : ["24 groupé par 4 : dans 24, combien de fois 4 ?", "24 = 4 x 6", "ou 24 : 4 = 6"] },
      { t: en ? "Sharing" : "Partager", svg: '<div class="lx-illu">' + ["Amy", "Lana", "Evaël"].map(function (p, k) { return lxPop('<span class="lx-part"><span class="lx-sac">' + lxPoints(9) + "</span><small>" + p + "</small></span>", k); }).join("") + "</div>",
        txt: en ? ["27 shared into 3: 3 times what makes 27?", "27 = 3 × 9", "or 27 ÷ 3 = 9"] : ["27 partagé en 3 : 3 fois combien pour faire 27 ?", "27 = 3 x 9", "ou 27 : 3 = 9"] },
      { t: en ? "Division with a remainder" : "La division avec reste", svg: '<div class="lx-illu lx-wrap">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { return sac(5, k); }).join("") + lxPop('<span class="lx-sac lx-reste">' + lxPoints(3) + "</span>", 8) + "</div>",
        txt: en ? ["I divide 43 by 5.", "43 = (5 × 8) + 3", "Amaury can make 8 boxes; 3 cupcakes will be left over."] : ["Je divise 43 par 5.", "43 = (5 x 8) + 3", "Amaury pourra faire 8 boîtes, il restera 3 cupcakes."] },
      { t: en ? "The words of division" : "Les mots de la division", svg: '<div class="lx-illu lx-mots-div">' + lxPop('<span><b>43</b><small>' + (en ? "dividend" : "dividende") + "</small></span>", 0) + "<span>= (</span>" + lxPop('<span><b>5</b><small>' + (en ? "divisor" : "diviseur") + "</small></span>", 1) + "<span>×</span>" + lxPop("<span><b>8</b><small>quotient</small></span>", 2) + "<span>) +</span>" + lxPop('<span><b>3</b><small>' + (en ? "remainder" : "reste") + "</small></span>", 3) + "</div>",
        txt: en ? ["43 is the dividend, 5 the divisor, 8 the quotient and 3 the remainder."] : ["43 est le dividende, 5 le diviseur, 8 le quotient et 3 le reste."] }
    ];
  }
  function jrCartesMonnaie(en) {
    var d = lxDecompose(6875);
    return [
      { t: en ? "The notes" : "Les billets", svg: '<div class="lx-illu lx-wrap">' + [10000, 5000, 1000, 500].map(lxArgent).join("") + "</div>", txt: en ? ["Notes of 10,000 F, 5,000 F, 1,000 F and 500 F."] : ["Les billets de 10 000 F, 5 000 F, 1 000 F et 500 F."] },
      { t: en ? "The coins" : "Les pièces", svg: '<div class="lx-illu lx-wrap">' + [200, 100, 50, 20, 10, 5].map(lxArgent).join("") + "</div>", txt: en ? ["Coins of 200 F, 100 F, 50 F, 20 F, 10 F and 5 F."] : ["Les pièces de 200 F, 100 F, 50 F, 20 F, 10 F et 5 F."] },
      { t: en ? "Splitting an amount" : "Décomposer une somme", svg: '<div class="lx-illu lx-col">' + lxPop("<b class=\"lx-somme\">6 875 F</b>", 0) + d.map(function (x, k) { return lxPop('<span class="lx-ligne-arg"><b>' + exMille(x.p) + " F</b> = " + x.l.map(function (v) { return exMille(v) + " F"; }).join(" + ") + "</span>", k + 1); }).join("") + "</div>",
        txt: en ? ["To make an amount of money, we split it:", "6,875 F = 6,000 + 800 + 70 + 5"] : ["Pour pouvoir constituer une somme d’argent, il faut la décomposer :", "6 875 F = 6 000 + 800 + 70 + 5"] }
    ];
  }
  /* « Je retiens » en cartes animées étendu au verbe (CONJ2), aux mots invariables (v0, D-62) et au graphique en barres (OGD1) : D-107.
     Les phrases de la trace écrite sont reprises mot pour mot et découpées ; en mode EN, les phrases de français restent en français. */
  function jrCycle(items) { /* 3 états montrés l'un après l'autre, en boucle */
    return '<span class="jr-cycle">' + items.map(function (h, k) { return '<span style="animation-delay:' + (k * 2.2) + 's">' + h + "</span>"; }).join("") + "</span>";
  }
  function jrCartesVerbe(en) {
    var V = function (x) { return '<span class="v-marque">' + x + "</span>"; }, N = function (x) { return '<span class="coco-negation">' + x + "</span>"; };
    var temps = function (lib, a, b) { return '<span class="jr-temps"><small>' + lib + "</small><span>Sarah " + V(a) + " malade.</span><span>Sa mère " + V(b) + " le médecin.</span></span>"; };
    return [
      { t: en ? "A state or an action" : "Un état ou une action",
        svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">Sarah ' + V("est") + " malade.<small>" + (en ? "a state" : "un état") + "</small></span>", 0) + lxPop('<span class="jr-ph">Sa mère ' + V("appelle") + " le médecin.<small>" + (en ? "an action" : "une action") + "</small></span>", 2) + "</div>",
        txt: ["Le verbe est un mot qui exprime un <b>état</b> (être, sembler, paraître) ou une <b>action</b>."] },
      { t: en ? "It changes with the time" : "Il change selon le temps",
        svg: '<div class="lx-illu">' + jrCycle([temps(en ? "Yesterday · past" : "Hier · passé", "était", "a appelé"), temps(en ? "Today · present" : "Aujourd’hui · présent", "est", "appelle"), temps(en ? "Tomorrow · future" : "Demain · futur", "sera", "appellera")]) + "</div>",
        txt: ["Il <b>change</b> selon le temps de la phrase."] },
      { t: en ? "Finding the verb: ne … pas" : "Pour le trouver : ne … pas",
        svg: '<div class="lx-illu lx-col jr-phrases"><span class="jr-ph">La pluie tombe sur la forêt.</span>' + lxPop('<span class="jr-fl">↓</span>', 2) + lxPop('<span class="jr-ph">La pluie ' + N("ne") + " " + V("tombe") + " " + N("pas") + " sur la forêt.</span>", 4) + "</div>",
        txt: ["Pour trouver le verbe conjugué dans une phrase, je la mets à la <b>forme négative</b> :", "le verbe est entre " + N("ne") + " et " + N("pas") + " !"] }
    ];
  }
  function jrCartesMots(en) {
    var W = function (w) { return motHTML(w, true); };
    var fam = function (g, f, k) { var G = MO.GROUPS[g], F = G.fams[f]; return lxPop('<span class="jr-fam"><small>' + esc(tr(G.nom)) + '</small><span class="mi-racine">' + MO.html(F.key) + "</span>" + F.words.map(W).join("") + "</span>", k); };
    var cache = function (k, h) { return lxPop('<span class="jr-etape"><small>' + h + "</small>" + (k === 1 ? '<span class="mi-mot mi-mot--petit jr-cache">bientôt</span>' : k === 2 ? '<span class="mi-mot mi-mot--petit jr-ecrit">bientôt</span>' : W("bien[tô]{t}")) + "</span>", k * 2); };
    return [
      { t: en ? "They never change" : "Ils ne changent jamais",
        svg: '<div class="lx-illu">' + jrCycle(['<span class="jr-ph">Kakou court ' + W("souv[en]{t}") + ".</span>", '<span class="jr-ph">Les cagous courent ' + W("souv[en]{t}") + ".</span>", '<span class="jr-ph">Kakou courait ' + W("souv[en]{t}") + ".</span>"]) + "</div>",
        txt: [en ? "Invariable words <b>never change</b>." : "Les mots invariables <b>ne changent jamais</b>."] },
      { t: en ? "Families of words" : "Des familles de mots",
        svg: '<div class="lx-illu lx-col jr-fams">' + fam(1, 1, 0) + fam(2, 2, 2) + fam(3, 1, 4) + "</div>",
        txt: [en ? 'Look at the <b class="mi-c">common part</b>, in orange, and the <b class="mi-m">silent or final letter</b>, in yellow.' : 'Observe la <b class="mi-c">partie commune</b>, en orange, et la <b class="mi-m">lettre muette</b> ou finale, en jaune.'] },
      { t: en ? "Learning them by heart" : "On les apprend par cœur",
        svg: '<div class="lx-illu">' + cache(0, en ? "I look" : "Je regarde") + cache(1, en ? "I hide" : "Je cache") + cache(2, en ? "I write" : "J’écris") + "</div>",
        txt: [en ? "We learn them <b>by heart</b>!" : "On les apprend <b>par cœur</b> !"] }
    ];
  }
  function jrGraphique(d, en) { /* graphique en barres animé : les barres montent l'une après l'autre */
    var X0 = 40, Y0 = 170, H = 140, W = 54, s = '<svg class="jr-svg jr-large jr-graph" viewBox="0 0 330 228" aria-hidden="true">';
    for (var v = 0; v <= d.max; v += 4) { var y = Y0 - v / d.max * H; s += '<line class="dg-grille" x1="' + X0 + '" y1="' + y + '" x2="318" y2="' + y + '"/><text class="jr-gnb" x="' + (X0 - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + v + "</text>"; }
    d.vals.forEach(function (val, k) { var h = val / d.max * H, x = X0 + 8 + k * (W + 2);
      s += '<rect class="dg-barre jr-barre" style="animation-delay:' + (0.3 + k * 0.45) + 's" x="' + x + '" y="' + (Y0 - h) + '" width="' + (W - 12) + '" height="' + h + '"/>' +
        '<text class="jr-gcat" x="' + (x + (W - 12) / 2) + '" y="' + (Y0 + 16) + '" text-anchor="middle">' + esc(dgNom(d, k)) + "</text>"; });
    s += '<line class="dg-axe" x1="' + X0 + '" y1="' + Y0 + '" x2="320" y2="' + Y0 + '"/><line class="dg-axe" x1="' + X0 + '" y1="' + Y0 + '" x2="' + X0 + '" y2="16"/>' +
      '<text class="jr-gaxe" x="' + (X0 - 30) + '" y="10">↑ ' + (en ? "Number of " + esc(d.ctx.axe.en) : "Nombre " + esc(d.ctx.axe.de)) + '</text><text class="jr-gaxe" x="320" y="222" text-anchor="end">' + esc(tr(d.ctx.axeX)) + " →</text></svg>";
    return s;
  }
  function jrCartesDiagrammes(en) {
    var d = { ctx: DG.CONTEXTES[0], pas: 2, max: 20, vals: [14, 8, 11, 5, 16] };
    var table = function (anime) { return '<table class="dg-table jr-table"><thead><tr><th>' + esc(tr(d.ctx.axeX)) + "</th><th>" + (en ? "Number of " + esc(d.ctx.axe.en) : "Nombre " + esc(d.ctx.axe.de)) + "</th></tr></thead><tbody>" + d.ctx.cats.map(function (_, k) { return "<tr" + (anime ? ' class="jr-ligne" style="animation-delay:' + (0.3 + k * 0.45) + 's"' : "") + "><td>" + esc(dgNom(d, k)) + "</td><td>" + d.vals[k] + "</td></tr>"; }).join("") + "</tbody></table>"; };
    return [
      { t: en ? "Two ways" : "Deux formes",
        svg: '<div class="lx-illu jr-deux">' + lxPop(table(false), 0) + lxPop(jrGraphique(d, en).replace(/jr-barre"/g, 'jr-barre jr-fixe"'), 2) + "</div>",
        txt: en ? ["We can organise <b>information</b> in two ways:", "<b>the table</b> and <b>the bar chart</b>."] : ["On peut organiser des <b>informations</b> sous deux formes :", "<b>le tableau</b> et <b>le graphique en barres</b>."] },
      { t: en ? "The table" : "Le tableau",
        svg: '<div class="lx-illu">' + table(true) + "</div>",
        txt: en ? ["<b>The table</b>: one line for each fruit, with its number."] : ["<b>Le tableau</b> : une ligne pour chaque fruit, avec son nombre."] },
      { t: en ? "The bar chart" : "Le graphique en barres",
        svg: '<div class="lx-illu">' + jrGraphique(d, en) + "</div>",
        txt: en ? ["<b>The bar chart</b>: one bar for each fruit. The taller the bar, the bigger the number.", "We name the two axes: <b>" + esc(tr(d.ctx.axeX)) + "</b> and <b>Number of " + esc(d.ctx.axe.en) + "</b>."] : ["<b>Le graphique en barres</b> : une barre pour chaque fruit. Plus la barre est haute, plus le nombre est grand.", "On nomme les deux axes : <b>" + esc(tr(d.ctx.axeX)) + "</b> et <b>Nombre " + esc(d.ctx.axe.de) + "</b>."] }
    ];
  }
  jrCartes.persos = [["waeko", "presente"], ["sari", "reflechit"], ["dylan", "idee"], ["leo", "content"], ["tao", "victoire"]]; /* heure à aiguilles */
  jrCartesDigitale.persos = [["tao", "reflechit"], ["nina", "idee"], ["dylan", "presente"], ["wadra", "content"]];
  jrCartesDivision.persos = [["nina", "presente"], ["dylan", "reflechit"], ["waeko", "idee"], ["adi", "content"]];
  jrCartesMonnaie.persos = [["mei", "presente"], ["vaka", "content"], ["tehani", "idee"]];
  jrCartesVerbe.persos = [["tehani", "presente"], ["vaka", "reflechit"], ["nina", "idee"]];
  jrCartesMots.persos = [["waeko", "presente"], ["dylan", "reflechit"], ["nina", "victoire"]];
  jrCartesDiagrammes.persos = [["waeko", "presente"], ["nina", "reflechit"], ["tao", "idee"]];
  /* ==========================================================================================
     Mode « Au TBI » des séquences (D-117), sur le modèle de l’heure à aiguilles : 1. découverte guidée, 2. jeu des ardoises.
     Découverte : chaque carte « Je retiens » de la leçon devient une étape ; la classe répond d’abord à une question
     (écrite par Claude), puis « On découvre » montre la phrase de la leçon.
     Ardoises : questions tirées des activités de la séquence ; la question s’affiche en grand, minuteur, « Ardoises levées », « On corrige ».
     ========================================================================================== */
  /* Questions d’ardoise du verbe (CONJ2) [PROPOSITION] : trouver le verbe conjugué (forme négative pour vérifier), état ou action.
     [phrase, verbe, 2 autres mots de la phrase, forme négative, infinitif si le verbe exprime un état] — les phrases restent en français. */
  var TQ_VERBES = [
    ["Le soleil brille sur la plage.", "brille", ["soleil", "plage"], "Le soleil ne brille pas sur la plage."],
    ["Nina mange la mangue.", "mange", ["Nina", "mangue"], "Nina ne mange pas la mangue."],
    ["Les enfants jouent dans la cour.", "jouent", ["enfants", "cour"], "Les enfants ne jouent pas dans la cour."],
    ["Kakou court dans la forêt.", "court", ["Kakou", "forêt"], "Kakou ne court pas dans la forêt."],
    ["Margouille dort sous une feuille.", "dort", ["Margouille", "feuille"], "Margouille ne dort pas sous une feuille."],
    ["Le bus arrive à l’école.", "arrive", ["bus", "école"], "Le bus n’arrive pas à l’école."],
    ["Les oiseaux chantent le matin.", "chantent", ["oiseaux", "matin"], "Les oiseaux ne chantent pas le matin."],
    ["Papi Tao lance sa ligne.", "lance", ["Papi", "ligne"], "Papi Tao ne lance pas sa ligne."],
    ["Méi range ses cahiers.", "range", ["Méi", "cahiers"], "Méi ne range pas ses cahiers."],
    ["Les élèves écoutent la maîtresse.", "écoutent", ["élèves", "maîtresse"], "Les élèves n’écoutent pas la maîtresse."],
    ["La cloche sonne à midi.", "sonne", ["cloche", "midi"], "La cloche ne sonne pas à midi."],
    ["Wadra arrose le jardin.", "arrose", ["Wadra", "jardin"], "Wadra n’arrose pas le jardin."],
    ["La mer est calme.", "est", ["mer", "calme"], "La mer n’est pas calme.", "être"],
    ["Tao semble fatigué.", "semble", ["Tao", "fatigué"], "Tao ne semble pas fatigué.", "sembler"],
    ["Vaka paraît content.", "paraît", ["Vaka", "content"], "Vaka ne paraît pas content.", "paraître"],
    ["Le chien est sage.", "est", ["chien", "sage"], "Le chien n’est pas sage.", "être"],
    ["Les mangues semblent mûres.", "semblent", ["mangues", "mûres"], "Les mangues ne semblent pas mûres.", "sembler"]
  ];
  function tqPhrase(s) { return '<p class="tq-phrases"><span>' + s + "</span></p>"; }
  function tqVerbe() {
    var tous = HE.shuf(TQ_VERBES), etat = tous.filter(function (x) { return x[4]; }).slice(0, 2), action = tous.filter(function (x) { return !x[4]; }).slice(0, 2), pris = etat.concat(action);
    var qs = tous.filter(function (x) { return pris.indexOf(x) < 0; }).map(function (x) {
      var o = HE.shuf([x[1]].concat(x[2])), apo = /n’/.test(x[3]);
      return { t: "choix", c: { fr: "Quel est le verbe conjugué ?", en: "Which word is the conjugated verb?" }, z: function () { return tqPhrase(x[0]); }, o: o, a: o.indexOf(x[1]),
        ex: { fr: "Je mets la phrase à la forme négative : « " + x[3] + " » Le verbe est entre ne et pas : « " + x[1] + " »." + (apo ? " Devant une voyelle, ne devient n’." : ""),
          en: "I make the sentence negative: « " + x[3] + " » The verb is between ne and pas: « " + x[1] + " »." + (apo ? " Before a vowel, ne becomes n’." : "") } };
    });
    return qs.concat(pris.map(function (x) {
      return { t: "choix", c: { fr: "Dans cette phrase, le verbe « " + x[1] + " » exprime…", en: "In this sentence, the verb « " + x[1] + " » expresses…" }, z: function () { return tqPhrase(x[0]); },
        o: [{ fr: "un état", en: "a state" }, { fr: "une action", en: "an action" }], a: x[4] ? 0 : 1,
        ex: x[4] ? { fr: "« " + x[1] + " » vient du verbe " + x[4] + " : il exprime un état (être, sembler, paraître).", en: "« " + x[1] + " » comes from the verb " + x[4] + ": it expresses a state (être, sembler, paraître)." }
          : { fr: "« " + x[1] + " » dit ce qui se passe, ce que l’on fait : il exprime une action.", en: "« " + x[1] + " » tells us what happens, what someone or something does: it expresses an action." } };
    }));
  }
  /* Questions d’ardoise des mots invariables : lettres qui manquent, mot entendu, mot manquant de la phrase, sur la liste choisie */
  function tqMotsReglage(B) { return "<h3>" + (langue === "en" ? "Word list" : "Liste de mots") + '</h3><div class="coco-row">' + MO.GROUPS.map(function (g) { return B("liste", g.id, esc(g.name)); }).join("") + "</div>"; }
  function tqMots(cfg) {
    var sel = {}; MO.FAMS.forEach(function (f) { if (f.group.id === (cfg.liste || "g1")) sel[f.id] = 1; });
    var pool = HE.shuf(MO.pool(sel)), qs = [], mot = function (m) { return '<span class="mi-mot">' + MO.html(m) + "</span>"; };
    var ex = function (p) { return { fr: "On écrit « " + p + " ».", en: "We write « " + p + " »." }; };
    /* aucun mot ni morceau de mot mal écrit n’est montré (principe d’Ouzoulias, demande de l’enseignante, 10/11/2026) :
       les élèves écrivent les lettres qui manquent, puis le mot entendu, sur leur ardoise */
    pool.slice(0, 4).forEach(function (x) { var h = MO.hiddenPart(x.m);
      qs.push({ t: "ecrit", c: { fr: "Écris les lettres qui manquent.", en: "Write the missing letters." }, z: function (en, voir) { return voir ? mot(x.m) : '<span class="mi-mot">' + h.beforeH + '<span class="tq-trou">…</span>' + h.afterH + "</span>"; }, ex: ex(x.p) }); });
    pool.slice(4, 8).forEach(function (x) {
      qs.push({ t: "ecrit", c: { fr: "Écoute le mot, puis écris-le.", en: "Listen to the word, then write it." },
        z: function (en, voir) { return voir ? mot(x.m) : '<p class="tq-ecoute"><button class="coco-btn" type="button" data-action="tq-dire" data-v="' + esc(MO.sayText(x.p)) + '">' + (en ? "Listen to the word" : "Écouter le mot") + "</button></p>"; }, ex: ex(x.p) }); });
    HE.shuf(MO.gapPool(sel)).slice(0, 4).forEach(function (q) { var o = HE.shuf([q.p].concat(q.opts)), debut = q.sent.indexOf("___") === 0, w = debut ? q.p.charAt(0).toUpperCase() + q.p.slice(1) : q.p;
      qs.push({ t: "choix", c: { fr: "Quel mot complète la phrase ?", en: "Which word completes the sentence?" }, z: function (en, voir) { return tqPhrase(esc(q.sent).replace("___", voir ? "<b>" + esc(w) + "</b>" : '<span class="tq-trou">…</span>')); },
        o: o, a: o.indexOf(q.p), ex: { fr: q.sent.replace("___", w), en: q.sent.replace("___", w) } }); });
    return qs;
  }
  /* Questions d’ardoise du graphique en barres : « Lis le graphique » (niveaux 1 et 2) et « Problèmes » */
  function tqDiagD() { return { ctx: DG.CONTEXTES[0], pas: 2, max: 20, vals: [14, 8, 11, 5, 16] }; }
  function tqNb(n, en) { return en ? Number(n).toLocaleString("en-GB") : exMille(n); }
  function tqDiag() {
    var lire = DG.questionsLire(1, 3).concat(DG.questionsLire(2, 3)).map(function (q) {
      var d = q.d, c = d.ctx.cats, v = d.vals[q.k], fig = function (en, voir) { return dgFigure(d, voir ? { montre: q.k } : {}); };
      var grad = d.pas > 1 ? { fr: " Les graduations vont de " + d.pas + " en " + d.pas + ".", en: " The scale goes up in " + (d.pas === 2 ? "twos" : d.pas === 5 ? "fives" : "tens") + "." } : { fr: "", en: "" };
      if (q.type === "valeur") return { t: "choix", c: { fr: "Quel nombre la barre <b>« " + esc(c[q.k].fr) + " »</b> indique-t-elle ?", en: "What number does the <b>“" + esc(c[q.k].en) + "”</b> bar show?" }, z: fig, o: q.opts, a: q.opts.indexOf(v),
        ex: { fr: "Je suis le haut de la barre jusqu’à l’axe : " + v + "." + grad.fr, en: "I follow the top of the bar across to the axis: " + v + "." + grad.en } };
      var haut = q.type === "plus";
      return { t: "choix", c: d.ctx[q.type], z: fig, o: c.map(function (x) { return { fr: x.fr, en: x.en }; }), a: q.k,
        ex: { fr: "La barre la plus " + (haut ? "haute" : "basse") + " est celle de " + c[q.k].fr + " : " + v + ".", en: "The " + (haut ? "tallest" : "shortest") + " bar is " + c[q.k].en + ": " + v + "." } };
    });
    var prob = DG.problemes(4).map(function (q) {
      var k = q.calc, f = function (en) { var n = k.n.map(function (x) { return tqNb(x, en); }); return (k.op === "×" ? n[0] + " × " + n[1] + " F" : n.join(" " + k.op + " ")) + " = " + tqNb(q.rep, en) + (q.unite ? " F" : "") + "."; };
      return { t: "champs", c: { fr: q.fr, en: q.en }, z: function () { return dgFigure(q.d); }, champs: [{ k: "v", apres: q.unite ? " F" : "" }], r: { v: q.rep },
        ex: { fr: (q.inutile ? "Une information ne sert pas. " : "") + f(false), en: (q.inutile ? "One piece of information is not needed. " : "") + f(true) } };
    });
    return lire.concat(prob);
  }
  var TBI_SEQ = {
    masses: { src: jrCartesMasses, mat: "maths", jeux: ["unite", "convertir", "comparer", "probleme"],
      questions: [
        { fr: "Comment savoir combien pèse un objet ?", en: "How can we find out how much an object weighs?", illu: function (en) { return pesee("sucre", "?", "", en ? "a bag of sugar" : "un paquet de sucre"); } },
        { fr: "Qu’est-ce qui pèse à peu près 1 gramme ?", en: "What weighs about 1 gram?", illu: function (en) { return '<span class="tq-choix-obj">' + [["trombone", "un trombone", "a paper clip"], ["riz", "un paquet de riz", "a bag of rice"], ["camion", "un camion", "a lorry"]].map(function (o) { return "<span>" + OBJ_M[o[0]] + "<small>" + (en ? o[2] : o[1]) + "</small></span>"; }).join("") + "</span>"; } },
        { fr: "Ces fruits pèsent 4… Ce camion pèse 5… Quelles unités ?", en: "This fruit weighs 4… This lorry weighs 5… Which units?", illu: function (en) { return pesee("fruits", "4", "?", en ? "this fruit" : "ces fruits") + pesee("camion", "5", "?", en ? "this lorry" : "ce camion"); } },
        { fr: "Combien de grammes dans un kilogramme ? Combien de kilogrammes dans une tonne ?", en: "How many grams in a kilogram? How many kilograms in a tonne?", illu: function (en) { return pesee("sucre", "1", "kg", en ? "a bag of sugar" : "un paquet de sucre") + '<span class="tq-egal">= … g</span>'; } },
        { fr: "4 kg, c’est combien de grammes ? Et 1 kg 500 g ?", en: "4 kg is how many grams? And 1 kg 500 g?", illu: function (en) { return pesee("sucre4", "4", "kg", en ? "4 bags of sugar" : "4 paquets de sucre") + '<span class="tq-egal">= … g</span>'; } }] },
    /* ---------- D-117 étendu : les 5 autres séquences. Questions de découverte et questions d’ardoise du verbe [PROPOSITION] ;
       les autres questions d’ardoise viennent des activités existantes (division, monnaie), des outils du v0 (mots invariables) et des jeux du graphique. ---------- */
    division: { src: jrCartesDivision, mat: "maths", jeux: ["grouper", "calcule", "reste"],
      questions: [
        { fr: "Noah a 24 sucres d’orge. Il prépare des sachets de 4. Combien de sachets pourra-t-il faire ?", en: "Noah has 24 lollipops. He makes bags of 4. How many bags can he make?", illu: function () { return '<div class="tq-tas">' + lxPoints(24) + "</div>"; } },
        { fr: "Amy a 27 billes. Elle les partage avec Lana et Evaël. Combien de billes aura chaque fille ?", en: "Amy has 27 marbles. She shares them with Lana and Evaël. How many marbles will each girl get?", illu: function () { return '<div class="tq-tas">' + lxPoints(27) + '</div><div class="lx-sacs">' + ["Amy", "Lana", "Evaël"].map(function (p) { return '<span class="lx-part"><span class="lx-sac tq-vide">?</span><small>' + p + "</small></span>"; }).join("") + "</div>"; } },
        { fr: "Amaury a 43 cupcakes à ranger par boîtes de 5. Combien de boîtes pourra-t-il faire ? En restera-t-il ?", en: "Amaury has 43 cupcakes to put in boxes of 5. How many boxes can he make? Will any be left over?", illu: function () { return '<div class="tq-tas">' + lxPoints(43) + "</div>"; } },
        { fr: "43 = (5 x 8) + 3 : comment s’appelle chacun de ces nombres ?", en: "43 = (5 × 8) + 3: what do we call each of these numbers?", illu: function (en) { return '<div class="lx-illu lx-mots-div">' + ["43", "5", "8", "3"].map(function (n, k) { return (k === 1 ? "<span>= (</span>" : k === 2 ? "<span>" + (en ? "×" : "x") + "</span>" : k === 3 ? "<span>) +</span>" : "") + "<span><b>" + n + "</b><small>?</small></span>"; }).join("") + "</div>"; } }] },
    monnaie: { src: jrCartesMonnaie, mat: "maths", jeux: ["compter", "marche"],
      questions: [
        { fr: "Quels billets utilise-t-on en Nouvelle-Calédonie ?", en: "Which notes do we use in New Caledonia?", illu: function () { return '<div class="lx-illu lx-wrap">' + [0, 1, 2, 3].map(function () { return '<span class="po-billet">?<small>F</small></span>'; }).join("") + "</div>"; } },
        { fr: "Et quelles pièces ? Quelle est la plus petite ?", en: "And which coins? Which is the smallest?", illu: function () { return '<div class="lx-illu lx-wrap">' + [0, 1, 2, 3, 4, 5].map(function () { return '<span class="po-piece po-piece--grande">?<small>F</small></span>'; }).join("") + "</div>"; } },
        { fr: "Comment faire 6 875 F avec des billets et des pièces ?", en: "How can we make 6,875 F with notes and coins?", illu: function (en) { return '<b class="lx-somme tq-grand">' + (en ? "6,875 F" : "6 875 F") + "</b>"; } }] },
    verbe: { src: jrCartesVerbe, mat: "francais", pool: tqVerbe,
      questions: [
        { fr: "Quel mot dit ce que fait la mère ? Quel mot dit comment est Sarah ?", en: "Which word tells us what the mother does? Which word tells us how Sarah is?", illu: function () { return '<p class="tq-phrases"><span>Sarah est malade.</span><span>Sa mère appelle le médecin.</span></p>'; } },
        { fr: "Hier, aujourd’hui, demain : quel mot change dans la phrase ?", en: "Yesterday, today, tomorrow: which word changes in the sentence?", illu: function () { return '<p class="tq-phrases"><span>Hier, Sarah était malade.</span><span>Aujourd’hui, Sarah est malade.</span><span>Demain, Sarah sera malade.</span></p>'; } },
        { fr: "Comment être sûr que « tombe » est le verbe de la phrase ?", en: "How can we be sure that « tombe » is the verb of the sentence?", illu: function () { return '<p class="tq-phrases"><span>La pluie tombe sur la forêt.</span></p>'; } }] },
    mots: { src: jrCartesMots, mat: "francais", pool: tqMots, reglage: tqMotsReglage,
      questions: [
        { fr: "Le mot « souvent » change-t-il ?", en: "Does the word « souvent » change?", illu: function () { return '<p class="tq-phrases"><span>Kakou court souvent.</span><span>Les cagous courent souvent.</span><span>Kakou courait souvent.</span></p>'; } },
        { fr: "Observe ces mots. Que remarques-tu ?", en: "Look at these words. What do you notice?", illu: function () { return '<p class="tq-phrases tq-mots">' + [[1, 1], [2, 2], [3, 1]].map(function (x) { return "<span>" + MO.GROUPS[x[0]].fams[x[1]].words.map(MO.plain).join(" · ") + "</span>"; }).join("") + "</p>"; } },
        { fr: "Comment apprendre ce mot pour bien l’écrire ?", en: "How can we learn this word so we can spell it?", illu: function () { return '<span class="mi-mot">bientôt</span>'; } }] },
    diagrammes: { src: jrCartesDiagrammes, mat: "maths", pool: tqDiag,
      questions: [
        { fr: "La classe a compté ses fruits préférés. Comment ranger ces informations pour bien les lire ?", en: "The class counted their favourite fruits. How can we organise this information so it is easy to read?", illu: function () { var d = tqDiagD(); return '<p class="tq-vrac">' + [3, 0, 4, 1, 2].map(function (k) { return "<span>" + esc(dgNom(d, k)) + " : " + d.vals[k] + "</span>"; }).join("") + "</p>"; } },
        { fr: "Dans un tableau, qu’écrit-on sur chaque ligne ?", en: "In a table, what do we write on each line?", illu: function (en) { var d = tqDiagD(); return '<table class="dg-table jr-table"><thead><tr><th>' + esc(tr(d.ctx.axeX)) + "</th><th>" + (en ? "Number of " + esc(d.ctx.axe.en) : "Nombre " + esc(d.ctx.axe.de)) + "</th></tr></thead><tbody>" + d.vals.map(function () { return "<tr><td>…</td><td>…</td></tr>"; }).join("") + "</tbody></table>"; } },
        { fr: "Dans un graphique en barres, que nous dit la hauteur d’une barre ?", en: "In a bar chart, what does the height of a bar tell us?", illu: function (en) { return jrGraphique(tqDiagD(), en).replace(/jr-barre"/g, 'jr-barre jr-fixe"'); } }] }
  };
  var TQ = null;
  function tqInit(seq) { if (!TQ || TQ.seq !== seq) TQ = { seq: seq, part: "menu", step: 0, vu: false, cfg: { n: 8, t: 30, liste: "g1" }, run: null, tid: null }; }
  function pageTbiSeq(seq) {
    tqInit(seq);
    var S = TBI_SEQ[seq], en = langue === "en", P = TQ.part, m = MATIERE[S.mat], cartes = S.src(en), titreSeq = tr(C[seq].titre);
    var haut = '<header class="k-haut"><div class="coco-row"><button class="coco-btn coco-btn--secondaire" type="button" data-action="tq-retour">← ' + (P === "menu" ? (en ? "Teacher area" : "Espace enseignante") : (en ? "Whiteboard menu" : "Menu du TBI")) + "</button>" +
      (P === "run" ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="tq-pause">' + (TQ.run && TQ.run.pause ? (en ? "Resume" : "Reprendre") : "Pause") + "</button>" : "") +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="tq-plein">' + (en ? "Full screen" : "Plein écran") + "</button>" + choixLangue() + '</div><p class="tq-titre">' + esc(titreSeq) + "</p></header>";
    var corps = "";
    if (P === "menu") {
      corps = bulle("coralie", en ? "We discover the lesson together, then we practise with our boards!" : "On découvre la leçon ensemble, puis on s’entraîne aux ardoises !") +
        '<section class="etapes"><button class="coco-carte coco-carte--' + S.mat + ' tq-carte" type="button" data-action="tq-dec"><span class="coco-carte-vignette"><img src="' + POSE("coralie", "idee") + '" alt=""></span><span><span class="coco-carte-etape">1 · ' + (en ? "To discover" : "Pour découvrir") + "</span><b>" + (en ? "Guided discovery" : "La découverte guidée") + "</b><small>" + cartes.length + (en ? " steps: a question for the class, then the lesson." : " étapes : une question à la classe, puis la leçon.") + "</small></span></button>" +
        '<button class="coco-carte coco-carte--' + S.mat + ' tq-carte" type="button" data-action="tq-setup"><span class="coco-carte-vignette"><img src="' + POSE("kakou", "victoire") + '" alt=""></span><span><span class="coco-carte-etape">2 · ' + (en ? "To practise" : "Pour s’entraîner") + "</span><b>" + (en ? "Show me your boards" : "Le jeu des ardoises") + "</b><small>" + (en ? "Questions from the activities, on the boards." : "Les questions des activités, aux ardoises.") + "</small></span></button></section>" +
        '<p class="po-note">' + (en ? "Space or right arrow: next. Left arrow: back. P: pause. F: full screen. Esc: back." : "Espace ou flèche droite : suite. Flèche gauche : retour. P : pause. F : plein écran. Échap : retour.") + "</p>";
    } else if (P === "dec") {
      var c = cartes[TQ.step], P2 = (S.src.persos || [])[TQ.step] || ["coralie", "presente"], q = S.questions[TQ.step];
      corps = '<div class="tq-dec ' + m.classe + (TQ.vu ? "" : " tq-dec--question") + '">' + (TQ.vu ? '<div class="tq-illu">' + c.svg + "</div>" : q.illu ? '<div class="tq-illu tq-illu--q">' + q.illu(en) + "</div>" : "") + '<div class="tq-droite">' +
        '<div class="tq-bulle"><img src="' + POSE(P2[0], TQ.vu ? P2[1] : "reflechit") + '" alt=""><div><h2>' + esc(typo(c.t)) + '</h2><p class="tq-question">' + esc(typo(tr(q))) + "</p></div></div>" +
        (TQ.vu ? '<div class="tq-lecon">' + c.txt.map(function (p, k) { return '<p class="jr-p" style="animation-delay:' + (0.1 + k * 0.45) + 's">' + typo(p) + "</p>"; }).join("") + "</div>"
          : '<button class="coco-btn coco-btn--grand" type="button" data-action="tq-voir">' + (en ? "Let’s find out" : "On découvre") + "</button>") + "</div></div>" +
        '<div class="hr-tbi-nav"><button class="coco-btn coco-btn--secondaire" type="button" data-action="tq-prec"' + (TQ.step === 0 && !TQ.vu ? " disabled" : "") + ">← " + (en ? "Back" : "Précédent") + '</button><ol class="coco-progression">' + cartes.map(function (_, k) { return '<li class="' + (k < TQ.step || (k === TQ.step && TQ.vu) ? "is-fait" : k === TQ.step ? "is-encours" : "") + '"></li>'; }).join("") + '</ol><button class="coco-btn" type="button" data-action="tq-suite">' + (!TQ.vu ? (en ? "Let’s find out" : "On découvre") : TQ.step === cartes.length - 1 ? (en ? "Finish" : "Terminer") : (en ? "Next" : "Suivant")) + " →</button></div>";
    } else if (P === "setup") {
      var cf = TQ.cfg, B = function (g, v, l) { return '<button class="coco-btn coco-btn--secondaire" type="button" data-action="tq-cfg" data-k="' + g + '" data-v="' + v + '" aria-pressed="' + (cf[g] === v) + '">' + l + "</button>"; };
      corps = bulle("margouille", en ? "Choose the settings, then start the game!" : "Choisis les réglages, puis lance le jeu !") + '<section class="zone ' + m.classe + ' hr-reglages"><h3>' + (en ? "Number of questions" : "Nombre de questions") + '</h3><div class="coco-row">' + [5, 8, 10].map(function (k) { return B("n", k, k); }).join("") +
        "</div>" + (S.reglage ? S.reglage(B) : "") + "<h3>" + (en ? "Time to write" : "Temps pour écrire") + '</h3><div class="coco-row">' + [[0, en ? "No timer" : "Sans minuteur"], [15, "15 s"], [30, "30 s"], [45, "45 s"], [60, "1 min"]].map(function (x) { return B("t", x[0], x[1]); }).join("") +
        '</div><button class="coco-btn coco-btn--grand" type="button" data-action="tq-lancer">' + (en ? "Let’s go!" : "C’est parti !") + "</button></section>";
    } else if (P === "run") {
      var r = TQ.run, qq = r.qs[r.i], voir = r.phase === "voir", zone = qq.z ? qq.z(en, voir) : "";
      if (qq.t === "choix") zone += '<ol class="tq-options">' + qq.o.map(function (o, k) { return '<li class="' + (voir && k === qq.a ? "est-juste" : voir ? "tq-pale" : "") + '"><b>' + "ABCDEF".charAt(k) + "</b> " + esc(typo(qzT(o))) + "</li>"; }).join("") + "</ol>";
      else if (qq.t === "champs") zone += '<p class="tq-champs">' + qq.champs.map(function (f) { var av = en && f.avantEn !== undefined ? f.avantEn : (f.avant || ""), v = qq.r[f.k];
        return (f.sep ? "<span>" + esc(f.sep) + "</span>" : "") + (av ? "<span>" + esc(av) + "</span>" : "") + '<span class="tq-trou' + (voir ? " vu" : "") + '">' + (voir ? (typeof v === "number" ? tqNb(v, en) : exMille(v)) : "…") + "</span>" + (f.apres ? "<span>" + esc(qzT(f.apres)) + "</span>" : ""); }).join("") + "</p>";
      var bas = r.phase === "ecrit" ? '<p class="tq-consigne">' + (en ? "Write your answer on your board." : "Écris ta réponse sur ton ardoise.") + "</p>" + (r.t ? '<div class="hr-tbi-barre"><i id="tq-barre" style="width:' + (r.reste / r.t * 100).toFixed(1) + '%"></i></div><p class="tq-temps" id="tq-temps">' + Math.ceil(r.reste) + " s</p>" : "")
        : r.phase === "leve" ? '<p class="tq-consigne tq-leve">' + (en ? "Boards up!" : "Ardoises levées !") + "</p>"
        : '<div class="tq-correction">' + retour("bravo", en ? "Let’s correct" : "On corrige", typo(qzT(qq.ex))) + "</div>";
      corps = '<p class="mi-indice">' + t("question")(r.i + 1, r.qs.length) + '</p><section class="tq-run ' + m.classe + '"><div class="tq-enonce">' + qzT(qq.c) + "</div>" + zone + bas + "</section>" +
        '<div class="hr-tbi-nav"><span></span><button class="coco-btn coco-btn--grand" type="button" data-action="tq-suite">' + (r.phase === "ecrit" ? (en ? "Boards up" : "Ardoises levées") : r.phase === "leve" ? (en ? "Let’s correct" : "On corrige") : r.i === r.qs.length - 1 ? (en ? "Finish" : "Terminer") : (en ? "Next question" : "Question suivante")) + " →</button></div>";
    } else corps = '<section class="bilan"><img src="' + POSE("coralie", "victoire") + '" alt=""><h2>' + (en ? "Well done, everyone!" : "Bravo à toute la classe !") + '</h2><div class="coco-row"><button class="coco-btn" type="button" data-action="tq-lancer">' + t("rejouer") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="tq-retour">' + (en ? "Whiteboard menu" : "Menu du TBI") + "</button></div></section>";
    return '<div class="hr-tbi tq">' + haut + corps + "</div>";
  }
  function tqMinuteur() {
    clearInterval(TQ.tid); var r = TQ.run; if (!r || !r.t || r.phase !== "ecrit") return;
    TQ.tid = setInterval(function () {
      var r = TQ && TQ.run; if (!r || TQ.part !== "run" || r.phase !== "ecrit" || r.pause) return;
      r.reste = Math.max(0, r.reste - 0.25); var el = document.getElementById("tq-temps"), b = document.getElementById("tq-barre");
      if (el) el.textContent = Math.ceil(r.reste) + " s"; if (b) b.style.width = (r.reste / r.t * 100) + "%";
      if (r.reste <= 0) { clearInterval(TQ.tid); r.phase = "leve"; rendre(); }
    }, 250);
  }
  function tqLancer() {
    var S = TBI_SEQ[TQ.seq], pool = [];
    if (S.pool) pool = S.pool(TQ.cfg); else S.jeux.forEach(function (j) { pool = pool.concat(QUIZ[TQ.seq].jeux[j].gen()); });
    TQ.run = { i: 0, qs: HE.shuf(pool).slice(0, TQ.cfg.n), phase: "ecrit", t: TQ.cfg.t, reste: TQ.cfg.t, pause: false }; TQ.part = "run"; tqMinuteur();
  }
  function tqSuite() {
    var n = TBI_SEQ[TQ.seq].src(langue === "en").length;
    if (TQ.part === "dec") { if (!TQ.vu) TQ.vu = true; else if (TQ.step >= n - 1) { TQ.part = "menu"; TQ.step = 0; TQ.vu = false; } else { TQ.step++; TQ.vu = false; } }
    else if (TQ.part === "run") { var r = TQ.run;
      if (r.phase === "ecrit") { r.phase = "leve"; clearInterval(TQ.tid); }
      else if (r.phase === "leve") r.phase = "voir";
      else { r.i++; if (r.i >= r.qs.length) { TQ.part = "fin"; clearInterval(TQ.tid); } else { r.phase = "ecrit"; r.reste = r.t; tqMinuteur(); } } }
  }
  function tqPrec() { if (TQ.part !== "dec") return; if (TQ.vu) TQ.vu = false; else if (TQ.step > 0) { TQ.step--; TQ.vu = true; } }
  function tqRetour() { clearInterval(TQ.tid); if (TQ.part === "menu") location.hash = "ens-sequences"; else { TQ.part = "menu"; TQ.step = 0; TQ.vu = false; } }
  function actionTq(a, el) {
    if (a === "tq-dire") { MO.dire([el.dataset.v]); return; }
    if (a === "tq-dec") { TQ.part = "dec"; TQ.step = 0; TQ.vu = false; }
    else if (a === "tq-setup") TQ.part = "setup";
    else if (a === "tq-cfg") TQ.cfg[el.dataset.k] = isNaN(+el.dataset.v) ? el.dataset.v : +el.dataset.v;
    else if (a === "tq-lancer") tqLancer();
    else if (a === "tq-voir") TQ.vu = true;
    else if (a === "tq-suite") tqSuite();
    else if (a === "tq-prec") tqPrec();
    else if (a === "tq-retour") tqRetour();
    else if (a === "tq-pause") { if (TQ.run) TQ.run.pause = !TQ.run.pause; }
    else if (a === "tq-plein") { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (x) {} }
  }
  document.addEventListener("keydown", function (e) {
    var r = route(); if (!/^tbi-/.test(r) || r === "tbi-heure" || !TQ) return; var tg = e.target; if (tg && /INPUT|TEXTAREA|SELECT/.test(tg.tagName)) return;
    if (e.key === " " || e.key === "ArrowRight") { if (TQ.part === "dec" || TQ.part === "run") { e.preventDefault(); tqSuite(); rendre(); } }
    else if (e.key === "ArrowLeft") { e.preventDefault(); tqPrec(); rendre(); }
    else if (e.key === "Escape") { tqRetour(); rendre(); }
    else if (e.key === "p" || e.key === "P") { if (TQ.run) TQ.run.pause = !TQ.run.pause; rendre(); }
    else if (e.key === "f" || e.key === "F") actionTq("tq-plein");
  });
  function lxLecon(seq, sous, blocs, src, mat) {
    mat = mat || "maths"; var m = MATIERE[mat], en = langue === "en";
    return barre(mat) + hautJeu(m, "seq-" + seq, { sous: sous, titre: t("lecon") }) +
      bulle("coralie", en ? "Let's look at the lesson together. Tap, try and watch!" : "On revoit la leçon ensemble. Touche, essaie et observe !") +
      blocs.map(function (b, k) { return '<section class="lecon-bloc m-' + mat + '"><h3><span class="lecon-num">' + (k + 1) + "</span>" + b[0] + "</h3>" + b[1] + "</section>"; }).join("") +
      jrSection(src, mat) + '<div class="coco-row"><a class="coco-btn" href="#seq-' + seq + '">' + t("versSequence") + "</a></div>";
  }
  function pageLeconDigitale() {
    var en = langue === "en", h = LX.h === undefined ? 16 : LX.h;
    var frise = '<div class="lx-frise" role="group" aria-label="' + (en ? "The 24 hours of the day" : "Les 24 heures de la journée") + '">' + [];
    for (var k = 0; k < 24; k++) frise += '<button type="button" class="lx-heure ' + (k < 12 ? "lx-matin" : "lx-apm") + '" data-action="lx-heure" data-v="' + k + '" aria-pressed="' + (k === h) + '">' + k + "</button>";
    frise += '</div><div class="lx-frise-leg"><span>' + (en ? "midnight · morning (0:00 → 12:00)" : "minuit · le matin (de 0h à 12h)") + "</span><span>" + (en ? "noon · afternoon and evening (12:00 → 24:00)" : "midi · l’après-midi et le soir (de 12h à 24h)") + "</span></div>";
    var nom = h === 0 ? (en ? "midnight" : "minuit") : h === 12 ? (en ? "noon" : "midi") : "";
    var info = '<div class="lx-info">' + HE.horloge(h % 12 || 12, 0, { deco: true, cls: "lx-clk" }) + "<div>" + lxEcran(h, 0) + "<p>" + (h < 12 ? (en ? "It is <b>the morning</b>: the hour hand is on its first turn of the face." : "C’est <b>le matin</b> : l’aiguille des heures fait son premier tour du cadran.")
      : (en ? "It is <b>the afternoon or evening</b>: the hour hand is on its second turn of the face." : "C’est <b>l’après-midi ou le soir</b> : l’aiguille des heures fait son deuxième tour du cadran.")) + "</p>" +
      (h > 12 ? "<p>" + (en ? "We can also say " : "On peut aussi dire ") + "<b>" + (h - 12) + ":00 " + (en ? "p.m." : h >= 18 ? "du soir" : "de l’après-midi") + "</b> (" + h + " − 12 = " + (h - 12) + ").</p>" : "") + (nom ? "<p><b>" + HE.cap(nom) + "</b></p>" : "") + "</div></div>";
    var ex = [["4:00", en ? "p.m." : "de l’après-midi", "16:00", "+12h"], ["7h30", en ? "p.m." : "du soir", "19h30", "+12h"], ["14:15", "", "2:15 " + (en ? "p.m." : "de l’après-midi"), "−12h"], ["18h45", "", "6h45 " + (en ? "p.m." : "du soir"), "−12h"]];
    var deux = '<p>' + (en ? "We can say afternoon and evening times in <b>two ways</b>:" : "On peut dire les heures de l’après-midi et du soir de <b>deux façons</b> :") + '</p><ul class="lx-exemples">' + ex.map(function (x) { return "<li><b>" + x[0] + "</b> " + x[1] + ' <span class="lx-op ' + (x[3] === "+12h" ? "lx-plus" : "lx-moins") + '">' + x[3] + "</span> <b>" + x[2] + "</b></li>"; }).join("") + "</ul>";
    var mn = [[8, 0, "Huit heures pile (0 min)", "Eight o’clock (0 min)"], [11, 15, "Onze heures et quart (15min)", "Quarter past eleven (15 min)"], [6, 30, "Six heures et demie (30min)", "Half past six (30 min)"], [9, 45, "Dix heures moins le quart (45min)", "Quarter to ten (45 min)"]];
    var minutes = "<p>" + (en ? "In one hour there are <b>60 minutes</b>. We can read the minutes in several ways:" : "Dans une heure, il y a <b>60 minutes</b>. On peut lire les minutes de plusieurs façons :") + '</p><div class="lx-minutes">' + mn.map(function (x) { return "<div>" + lxEcran(x[0], x[1]) + "<p>" + (en ? x[3] : x[2]) + "</p></div>"; }).join("") + '</div><p class="lx-note">' + (en ? "9:45: there is a quarter of an hour (15 min) left before 10 o’clock." : "9:45 : il reste un quart d’heure (15min) avant 10h.") + "</p>";
    return lxLecon("digitale", tr(C.digitale.titre), [[en ? "In one day there are 24 hours" : "Dans une journée, il y a 24 heures", '<p class="mi-indice">' + (en ? "Tap an hour." : "Touche une heure.") + "</p>" + frise + info], [en ? "Two ways to say the time" : "Deux façons de dire l’heure", deux], [en ? "One hour: 60 minutes" : "Une heure : 60 minutes", minutes]], jrCartesDigitale);
  }
  function pageLeconDivision() {
    var en = langue === "en", g = LX.g || 0, p = LX.p || 0, div = en ? " ÷ " : " : ";
    var sacs = ""; for (var i = 0; i < g; i++) sacs += '<span class="lx-sac apparait">' + lxPoints(4) + "</span>";
    var grouper = "<p>" + (en ? "Noah has <b>24 lollipops</b>. He makes bags of <b>4 lollipops</b>. How many bags can he make?" : "Noah a <b>24 sucres d’orge</b>. Il prépare des sachets de <b>4 sucres d’orge</b>. Combien de sachets pourra-t-il faire ?") + "</p>" +
      '<div class="lx-manip"><div class="lx-tas">' + lxPoints(24 - g * 4) + '</div><div class="lx-sacs">' + sacs + "</div></div>" +
      '<div class="coco-row"><button class="coco-btn" type="button" data-action="lx-grouper"' + (g >= 6 ? " disabled" : "") + ">" + (en ? "I make a bag of 4" : "Je fais un sachet de 4") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="lx-g0">' + (en ? "Start again" : "Recommencer") + "</button></div>" +
      (g >= 6 ? '<p class="lx-res">' + (en ? "How many 4s in 24? 24 = 4 × 6 or 24 ÷ 4 = 6. He can make <b>6 bags</b>." : "Dans 24, combien de fois 4 ? 24 = 4 x 6 ou 24 : 4 = 6. Il pourra faire <b>6 sachets</b>.") + "</p>" : "");
    var parts = ["Amy", "Lana", "Evaël"].map(function (nom, k) { var n = Math.floor(p / 3) + (k < p % 3 ? 1 : 0); return '<div class="lx-part"><span class="lx-sac">' + lxPoints(n) + "</span><small>" + nom + "</small></div>"; }).join("");
    var partager = "<p>" + (en ? "Amy has <b>27 marbles</b>. She shares them with Lana and Evaël. How many marbles will each girl have?" : "Amy a <b>27 billes</b>. Elle les partage avec Lana et Evaël. Combien de billes aura chaque fille ?") + "</p>" +
      '<div class="lx-manip"><div class="lx-tas">' + lxPoints(27 - p) + '</div><div class="lx-sacs">' + parts + "</div></div>" +
      '<div class="coco-row"><button class="coco-btn" type="button" data-action="lx-partager"' + (p >= 27 ? " disabled" : "") + ">" + (en ? "One marble each" : "Une bille à chacune") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="lx-p0">' + (en ? "Start again" : "Recommencer") + "</button></div>" +
      (p >= 27 ? '<p class="lx-res">' + (en ? "3 times what makes 27? 27 = 3 × 9 or 27 ÷ 3 = 9. Each girl will have <b>9 marbles</b>." : "3 fois combien pour faire 27 ? 27 = 3 x 9 ou 27 : 3 = 9. Chacune aura <b>9 billes</b>.") + "</p>" : "");
    var lab = function (n, l) { return '<span class="lx-lab"><b>' + n + "</b><small>" + l + "</small></span>"; };
    var egal = function (a, b, q, r) { return '<p class="lx-mots-div">' + lab(a, en ? "dividend" : "dividende") + "<span>= (</span>" + lab(b, en ? "divisor" : "diviseur") + "<span>×</span>" + lab(q, "quotient") + "<span>) +</span>" + lab(r, en ? "remainder" : "reste") + "</p>"; };
    var reste = "<p>" + (en ? "<b>Grouping.</b> Amaury has 43 cupcakes to put in boxes of 5. How many boxes can he make? I divide 43 by 5:" : "<b>Groupement.</b> Amaury a 43 cupcakes qu’il veut ranger par boîtes de 5. Combien de boîtes Amaury pourra-t-il faire ? Je divise 43 par 5 :") + "</p>" + egal(43, 5, 8, 3) +
      "<p>" + (en ? "Amaury can make <b>8 boxes</b>; <b>3 cupcakes</b> will be left over." : "Amaury pourra faire <b>8 boîtes</b>, il restera <b>3 cupcakes</b>.") + "</p>" +
      "<p>" + (en ? "<b>Sharing.</b> Isis has 58 cards to share between her 6 friends. How many cards will each friend get? I divide 58 by 6:" : "<b>Partage.</b> Isis a 58 cartes qu’elle veut partager entre ses 6 amis. Combien de cartes aura chacun de ses amis ? Je divise 58 par 6 :") + "</p>" + egal(58, 6, 9, 4) +
      "<p>" + (en ? "Each friend will have <b>9 cards</b>; <b>4</b> will be left over." : "Chacun de ses amis aura <b>9 cartes</b>, il en restera <b>4</b>.") + "</p>";
    return lxLecon("division", tr(C.division.titre), [[en ? "Grouping" : "Grouper", grouper], [en ? "Sharing" : "Partager", partager], [en ? "Division with a remainder" : "La division en ligne avec reste", reste]], jrCartesDivision);
  }
  function pageLeconMonnaie() {
    var en = langue === "en", main = LX.main || [], s = LX.s || 6875, tot = main.reduce(function (a, v) { return a + v; }, 0);
    var ARG = [10000, 5000, 1000, 500, 200, 100, 50, 20, 10, 5];
    var bloc1 = "<p>" + (en ? "Here are the notes and coins that make up the money of New Caledonia:" : "Voici les billets et pièces qui composent la monnaie calédonienne :") + '</p><div class="po-pieces lx-caisse">' + ARG.map(function (v) { return qzArgent(v, "lx-arg"); }).join("") + "</div>" +
      '<p class="qz-legende">' + (en ? "Tap them to put them in your hand." : "Touche-les pour les mettre dans ta main.") + '</p><div class="qz-main lx-main">' + (main.length ? qzPorteMonnaie(main).replace(/^<div class="qz-bourse">|<\/div>$/g, "") : '<span class="qz-vide">' + (en ? "Your hand is empty." : "Ta main est vide.") + "</span>") + "</div>" +
      '<div class="coco-row"><p class="qz-total">' + (en ? "In my hand: " : "Dans ma main : ") + exMille(tot) + ' F</p><button class="coco-btn coco-btn--secondaire" type="button" data-action="lx-vider">' + (en ? "Empty my hand" : "Vider ma main") + "</button></div>";
    var d = lxDecompose(s);
    var bloc2 = "<p>" + (en ? "To make an amount of money, we <b>split</b> it:" : "Pour pouvoir constituer une somme d’argent, il faut la <b>décomposer</b> :") + '</p><p class="lx-somme-ligne"><b>' + exMille(s) + " F</b> = " + d.map(function (x) { return exMille(x.p); }).join(" + ") + "</p>" +
      '<div class="lx-decomp">' + d.map(function (x) { return '<div><b>' + exMille(x.p) + ' F</b><div class="qz-bourse">' + x.l.map(function (v) { return v >= 500 ? '<span class="po-billet">' + exMille(v) + "<small>F</small></span>" : '<span class="po-piece' + (v >= 10 ? " po-piece--grande" : "") + '">' + v + "<small>F</small></span>"; }).join("") + "</div></div>"; }).join("") + "</div>" +
      '<div class="coco-row"><button class="coco-btn" type="button" data-action="lx-somme">' + (en ? "Another amount" : "Une autre somme") + "</button>" + (s !== 6875 ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="lx-somme0">' + (en ? "Back to the lesson example" : "Revenir à l’exemple de la leçon") + "</button>" : "") + "</div>";
    return lxLecon("monnaie", tr(C.monnaie.titre), [[en ? "The money of New Caledonia" : "La monnaie calédonienne", bloc1], [en ? "Splitting an amount" : "Décomposer une somme", bloc2]], jrCartesMonnaie);
  }
  /* Objets dessinés pour les masses (D-117) : style pictogramme (trait encre, aplats), dessinés pour le site (pas de banque d’images).
     Chaque objet est posé sur une balance de cuisine ; le camion, sur un pont-bascule. */
  var OBJ_M = {
    trombone: '<svg class="obj obj--trombone" viewBox="0 0 60 30" aria-hidden="true"><path d="M8 20h38a6 6 0 0 0 0-12H14a4 4 0 0 0 0 8h28" fill="none" stroke="#5d6b7e" stroke-width="3.5" stroke-linecap="round"/></svg>',
    sucre: '<svg class="obj" viewBox="0 0 70 64" aria-hidden="true"><path d="M8 14h54v46H8z" fill="#fff" stroke="#1d2744" stroke-width="3" stroke-linejoin="round"/><path d="M8 14l8-10h38l8 10" fill="#e8eef7" stroke="#1d2744" stroke-width="3" stroke-linejoin="round"/><rect x="8" y="26" width="54" height="20" fill="#2456a6"/><text x="35" y="40" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="12" fill="#fff">SUCRE</text><text x="35" y="57" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="10" fill="#1d2744">1 kg</text></svg>',
    riz: '<svg class="obj" viewBox="0 0 64 70" aria-hidden="true"><path d="M14 10c6-6 30-6 36 0l4 52c-8 6-36 6-44 0z" fill="#fbf3dc" stroke="#1d2744" stroke-width="3" stroke-linejoin="round"/><path d="M14 10c8 5 28 5 36 0" fill="none" stroke="#1d2744" stroke-width="3"/><rect x="16" y="30" width="32" height="18" rx="3" fill="#c0262d"/><text x="32" y="43" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="11" fill="#fff">RIZ</text></svg>',
    fruits: '<svg class="obj obj--large" viewBox="0 0 100 60" aria-hidden="true"><path d="M8 30h84l-10 26H18z" fill="#c99a5b" stroke="#1d2744" stroke-width="3" stroke-linejoin="round"/><ellipse cx="32" cy="24" rx="15" ry="11" fill="#f2a227" stroke="#1d2744" stroke-width="2.5"/><ellipse cx="58" cy="22" rx="15" ry="11" fill="#e35d2b" stroke="#1d2744" stroke-width="2.5"/><path d="M62 30c8-18 26-20 30-14-8 0-16 6-22 16z" fill="#f6d33c" stroke="#1d2744" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 44h64M22 52h56" stroke="#8a6534" stroke-width="2"/></svg>',
    camion: '<svg class="obj obj--camion" viewBox="0 0 140 70" aria-hidden="true"><rect x="4" y="8" width="88" height="42" rx="4" fill="#0f8e9f" stroke="#1d2744" stroke-width="3"/><path d="M92 22h24l16 16v12H92z" fill="#c0262d" stroke="#1d2744" stroke-width="3" stroke-linejoin="round"/><path d="M100 26h14l10 10h-24z" fill="#d5f1f4" stroke="#1d2744" stroke-width="2"/><circle cx="24" cy="56" r="10" fill="#1d2744"/><circle cx="24" cy="56" r="4" fill="#cfd6df"/><circle cx="70" cy="56" r="10" fill="#1d2744"/><circle cx="70" cy="56" r="4" fill="#cfd6df"/><circle cx="114" cy="56" r="10" fill="#1d2744"/><circle cx="114" cy="56" r="4" fill="#cfd6df"/></svg>'
  };
  OBJ_M.sucre4 = '<span class="obj-pile">' + OBJ_M.sucre + OBJ_M.sucre + OBJ_M.sucre + OBJ_M.sucre + "</span>";
  /* un objet posé sur la balance : la balance affiche v et u (« ? » tant qu’on ne sait pas) */
  function pesee(obj, v, u, lib) {
    var objet = OBJ_M[obj] || "";
    if (obj === "camion") return '<span class="pesee pesee--pont"><span class="pesee-objet">' + objet + '</span><span class="pont"><span class="pont-plateau"></span><span class="pont-ecran">' + v + ' <i class="' + (u === "?" ? "po-bal-efface" : "") + '">' + u + "</i></span></span>" + (lib ? "<small>" + lib + "</small>" : "") + "</span>";
    return '<span class="pesee"><span class="pesee-objet">' + objet + "</span>" + PO.balance(v, u) + (lib ? "<small>" + lib + "</small>" : "") + "</span>";
  }
  /* ---------- Leçon GM8 « Les mesures de masses » (D-110) : phrases de la leçon mot pour mot ---------- */
  function lxMille(n, en) { return en ? n.toLocaleString("en-GB") : exMille(n).replace(/ /g, " "); }
  var LX_PESEE = [
    { id: "trombone", fr: "un trombone", en: "a paper clip", v: 1, u: "g", phr: { fr: "1 gramme, c’est le poids d’un trombone !", en: "1 gram is the weight of a paper clip!" } },
    { id: "sucre", fr: "un paquet de sucre", en: "a bag of sugar", v: 1, u: "kg", phr: { fr: "Un paquet de sucre pèse 1 kg.", en: "A bag of sugar weighs 1 kg." } },
    { id: "fruits", fr: "ces fruits", en: "this fruit", v: 4, u: "kg", phr: { fr: "Ces fruits pèsent 4 kg.", en: "This fruit weighs 4 kg." } },
    { id: "camion", fr: "ce camion", en: "this lorry", v: 5, u: "t", phr: { fr: "Ce camion pèse 5 t.", en: "This lorry weighs 5 t." } }
  ];
  function pageLeconMasses() {
    var en = langue === "en", P = LX_PESEE.filter(function (x) { return x.id === LX.pese; })[0], E = LX.ex || { a: 4, b: 5, c: 1, d: 500 }, vu = LX.vu || {};
    var bloc1 = "<p>" + (en ? "To find out the weight of an object, how much it weighs, we measure its <b>mass</b> with a <b>scale</b>." : "Pour connaître le poids d’un objet, combien il pèse, on mesure sa <b>masse</b> à l’aide d’une <b>balance</b>.") + "</p>" +
      '<div class="lx-pesee"><div class="lx-pesee-bal">' + (P ? pesee(P.id, P.v, P.u) : PO.balance("0", "g")) + '<p class="lx-pesee-txt">' + (P ? esc(tr(P.phr)) : (en ? "Put something on the scale." : "Pose quelque chose sur la balance.")) + "</p></div>" +
      '<div class="po-etal">' + LX_PESEE.map(function (x) { return '<button class="po-fruit' + (P === x ? " is-choisi" : "") + '" type="button" data-action="lx-pese" data-v="' + x.id + '" aria-pressed="' + (P === x) + '"><span>' + esc(x[en ? "en" : "fr"]) + "</span></button>"; }).join("") + "</div></div>";
    var bloc2 = "<p>" + (en ? "The basic unit is the <b>gram (g)</b>. 1 gram is the weight of a paper clip!" : "L’unité de référence est le <b>gramme (g)</b>. 1 gramme, c’est le poids d’un trombone !") + "</p><p>" +
      (en ? "To give bigger masses, we use the <b>kilogram</b> and/or the <b>tonne</b>." : "Pour exprimer des mesures de masses plus grandes on utilise le <b>kilogramme</b> et/ou la <b>tonne</b>.") + "</p>" +
      '<p class="mi-indice lx-echelle-leg">' + (en ? "From the lightest to the heaviest:" : "Du plus léger au plus lourd :") + '</p><div class="lx-echelle"><span class="lx-unite"><b>g</b><small>' + (en ? "gram" : "gramme") + '</small></span><span class="lx-fois">→</span><span class="lx-unite"><b>kg</b><small>' + (en ? "kilogram" : "kilogramme") + '</small></span><span class="lx-fois">→</span><span class="lx-unite"><b>t</b><small>' + (en ? "tonne" : "tonne") + "</small></span></div>" +
      '<p class="lx-egalites"><b>1 kg = ' + lxMille(1000, en) + " g</b><b>1 t = " + lxMille(1000, en) + " kg</b></p>";
    var trou = function (k, v) { return vu[k] ? '<b class="lx-trou lx-trou--vu">' + v + "</b>" : '<button class="lx-trou" type="button" data-action="lx-voir" data-v="' + k + '" aria-label="' + (en ? "Show the answer" : "Montrer la réponse") + '">?</button>'; };
    var bloc3 = "<p>" + (en ? "We can give the same mass with <b>different units</b>." : "On peut exprimer une même mesure de masse avec <b>différentes unités</b>.") + '</p><ul class="lx-pareil">' +
      "<li>" + E.a + (en ? " kg is the same as " : " kg c’est pareil que ") + trou("a", lxMille(E.a * 1000, en)) + " g</li>" +
      "<li>" + E.b + (en ? " t is the same as " : " t c’est pareil que ") + trou("b", lxMille(E.b * 1000, en)) + " kg</li>" +
      "<li>" + E.c + " kg " + E.d + (en ? " g is the same as " : " g c’est pareil que ") + trou("c1", lxMille(E.c * 1000, en)) + " g + " + trou("c2", E.d) + " g = " + trou("c3", lxMille(E.c * 1000 + E.d, en)) + " g</li></ul>" +
      '<p class="mi-indice">' + (en ? "Work it out, then tap a ? to check." : "Cherche, puis touche un ? pour vérifier.") + '</p><div class="coco-row"><button class="coco-btn" type="button" data-action="lx-autre">' + (en ? "Another example" : "Un autre exemple") + "</button>" +
      (LX.ex ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="lx-ex0">' + (en ? "Back to the lesson example" : "Revenir à l’exemple de la leçon") + "</button>" : "") + "</div>";
    return lxLecon("masses", tr(C.masses.titre), [[en ? "The scale" : "La balance", bloc1], [en ? "Gram, kilogram, tonne" : "Gramme, kilogramme, tonne", bloc2], [en ? "The same mass, different units" : "Une même masse, plusieurs unités", bloc3]], jrCartesMasses);
  }
  /* « Je retiens » : la leçon GM8 mot pour mot, découpée (en anglais : traduction, en attendant une leçon anglaise) */
  function jrCartesMasses(en) {
    var B = function (v, u, lib, k, obj) { return lxPop('<span class="lx-pesee-mini">' + pesee(obj, v, u, lib) + "</span>", k); };
    var eg = function (a, b, k) { return lxPop('<span class="lx-eg"><b>' + a + "</b> = <b>" + b + "</b></span>", k); };
    return [
      { t: en ? "The scale" : "La balance", svg: '<div class="lx-illu">' + B("1", "kg", en ? "a bag of sugar" : "un paquet de sucre", 0, "sucre") + "</div>",
        txt: [en ? "To find out the weight of an object, how much it weighs, we measure its mass with a scale." : "Pour connaître le poids d’un objet, combien il pèse, on mesure sa masse à l’aide d’une balance."] },
      { t: en ? "The gram" : "Le gramme", svg: '<div class="lx-illu">' + B("1", "g", en ? "a paper clip" : "un trombone", 0, "trombone") + "</div>",
        txt: en ? ["The basic unit is the gram (g).", "1 gram is the weight of a paper clip!"] : ["L’unité de référence est le gramme (g).", "1 gramme, c’est le poids d’un trombone !"] },
      { t: en ? "The kilogram and the tonne" : "Le kilogramme et la tonne", svg: '<div class="lx-illu">' + B("4", "kg", en ? "this fruit" : "ces fruits", 0, "fruits") + B("5", "t", en ? "this lorry" : "ce camion", 2, "camion") + "</div>",
        txt: en ? ["To give bigger masses, we use the kilogram and/or the tonne.", "This fruit weighs 4 kg.", "This lorry weighs 5 t."] : ["Pour exprimer des mesures de masses plus grandes on utilise le kilogramme et/ou la tonne.", "Ces fruits pèsent 4 kg.", "Ce camion pèse 5 t."] },
      { t: en ? "1 kg = 1,000 g · 1 t = 1,000 kg" : "1 kg = 1 000 g · 1 t = 1 000 kg", svg: '<div class="lx-illu lx-col">' + eg("1 kg", lxMille(1000, en) + " g", 0) + eg("1 t", lxMille(1000, en) + " kg", 2) + "</div>",
        txt: ["1 kg = " + lxMille(1000, en) + " g", "1 t = " + lxMille(1000, en) + " kg"] },
      { t: en ? "Different units" : "Plusieurs unités", svg: '<div class="lx-illu">' + jrCycle([eg("4 kg", lxMille(4000, en) + " g", 0), eg("5 t", lxMille(5000, en) + " kg", 0), eg("1 kg 500 g", lxMille(1500, en) + " g", 0)]) + "</div>",
        txt: en ? ["We can give the same mass with different units.", "4 kg is the same as 4,000 g.", "5 t is the same as 5,000 kg.", "1 kg 500 g is the same as 1,000 g + 500 g = 1,500 g."]
          : ["On peut exprimer une même mesure de masse avec différentes unités.", "4 kg c’est pareil que 4 000 g.", "5 t c’est pareil que 5 000 kg.", "1 kg 500 g c’est pareil que 1 000 g + 500 g = 1 500 g."] }
    ];
  }
  jrCartesMasses.persos = [["sari", "presente"], ["tehani", "reflechit"], ["vaka", "content"], ["dylan", "idee"], ["mei", "victoire"]];
  function actionLX(a, el) {
    if (a === "lx-heure") LX.h = +el.dataset.v;
    else if (a === "lx-grouper") LX.g = Math.min(6, (LX.g || 0) + 1);
    else if (a === "lx-g0") LX.g = 0;
    else if (a === "lx-partager") LX.p = Math.min(27, (LX.p || 0) + 3);
    else if (a === "lx-p0") LX.p = 0;
    else if (a === "lx-arg") { LX.main = (LX.main || []).concat([+el.dataset.v]).sort(function (x, y) { return y - x; }).slice(0, 20); }
    else if (a === "lx-vider") LX.main = [];
    else if (a === "lx-somme") LX.s = HE.rint(1, 9) * 1000 + HE.rint(0, 9) * 100 + HE.rint(1, 9) * 10 + HE.pk([0, 5]);
    else if (a === "lx-somme0") LX.s = 6875;
    else if (a === "lx-pese") LX.pese = el.dataset.v;
    else if (a === "lx-voir") { LX.vu = LX.vu || {}; LX.vu[el.dataset.v] = true; }
    else if (a === "lx-autre") { LX.ex = { a: HE.rint(2, 9), b: HE.rint(2, 9), c: HE.rint(1, 4), d: HE.pk([100, 200, 250, 300, 400, 600, 750, 800]) }; LX.vu = {}; }
    else if (a === "lx-ex0") { LX.ex = null; LX.vu = {}; }
    else if (a === "lx-ip1") LX.ip1 = el.dataset.v;
    else if (a === "lx-ip3") LX.ip3 = el.dataset.v;
    else if (a === "lx-ipt") LX.ipt = !LX.ipt;
  }
  function exSauver() { var m = lire("fiches", {}); m[EXF.seq] = { n: EXF.n, opt: EXF.opt, niv: EXF.niv }; ecrire("fiches", m); }
  /* même numéro + même niveau = mêmes exercices ; les 3 niveaux d’un même numéro sont différents */
  function exTirer() { var X = exX(EXOS[EXF.seq]), graine = EXF.n + (X.niveaux ? EXF.niv * 100003 : 0); EXF.d = exAvec(graine, function () { return X.tirer(EXF.opt); }); EXF.vu = {}; EXF.i = 0; exSauver(); }
  function exGenerer(X, en, tbi) { EXTBI = !!tbi; EXK = 0; try { return exAvec(EXF.n + 1, function () { return X.exos(EXF.d, en); }); } finally { EXTBI = false; } }
  /* choix du niveau (fiches en 3 niveaux) : le numéro de fiche est gardé, les exercices changent */
  function exChoixNiveau(X0, en) {
    if (!X0.niveaux) return "";
    return '<div class="ex-niveaux" role="group" aria-label="' + (en ? "Level" : "Niveau") + '">' + [1, 2, 3].map(function (v) {
      return '<button type="button" class="ex-niv' + (EXF.niv === v ? " est-actif" : "") + '" data-action="ex-niv" data-v="' + v + '" aria-pressed="' + (EXF.niv === v) + '">' + (en ? EX_NIV_EN : EX_NIV_NOM)[v - 1] + " " + exEtoiles(v) + "</button>"; }).join("") + "</div>";
  }
  /* pour l’enseignante (pas imprimé) : les objectifs de la programmation travaillés et ce qui change à ce niveau */
  function exObjectifs(X0, X, en) {
    if (!X0.objectifs) return "";
    return '<details class="no-print ex-objectifs"><summary>' + (en ? "Objectives (P5 plan, in French) and this level" : "Objectifs travaillés (programmation P5) et ce niveau") + "</summary><ul>" + X0.objectifs.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul><p><b>" + (en ? EX_NIV_EN : EX_NIV_NOM)[EXF.niv - 1] + " :</b> " + esc(X.but || "") + "</p></details>";
  }
  function pageExos(seq) {
    var X0 = EXOS[seq], en = langue === "en";
    if (!EXF || EXF.seq !== seq) { var memo = lire("fiches", {})[seq] || {}; EXF = { seq: seq, opt: memo.opt || X0.optDefaut || "", niv: memo.niv || 2, n: memo.n || exNouveauNum(), corrige: EXF ? EXF.corrige : false, tbi: EXF ? EXF.tbi : false, vu: {}, i: 0 }; }
    if (!EXF.d) exTirer();
    var X = exX(X0), mat = MATIERE[X.matiere], num = (en ? "Worksheet no. " : "Fiche n° ") + EXF.n + (X0.niveaux ? " " + exEtoiles(EXF.niv) : "");
    if (EXF.tbi) return pageExosTbi(X, en, mat, num);
    var ex = exGenerer(X, en, false);
    var tete = '<header class="ex-tete"><div><small>' + esc(tr(mat.nom)) + " · " + (en ? "Worksheet" : "Fiche d’exercices") + "</small><h1>" + esc(X.titre()) + '</h1></div><p class="ex-nom">' + (en ? "Name: " : "Prénom : ") + '<span class="ex-ligne"></span><br>' + (en ? "Date: " : "Date : ") + '<span class="ex-ligne"></span><br><small class="ex-num">' + num + "</small></p></header>" +
      '<p class="ex-rappel"><b>' + (en ? "I remember" : "Je me rappelle") + "</b> " + X.rappel(en) + "</p>";
    var corps = ex.map(function (e, i) { return '<section class="ex"><h2><span>' + (i + 1) + "</span>" + e.c + "</h2>" + e.q + "</section>"; }).join("");
    var corrige = EXF.corrige ? '<section class="ex-corrige"><h2>' + (en ? "Answers" : "Corrigé") + " · " + num + "</h2><ol>" + ex.map(function (e) { return "<li>" + e.r + "</li>"; }).join("") + "</ol></section>" : "";
    return '<div class="no-print ex-outils coco-row"><a class="coco-btn coco-btn--secondaire" href="#' + X.seq + '">← ' + (en ? "Back to the unit" : "Retour à la séquence") + '</a>' +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="ex-nouveau">' + (en ? "New worksheet" : "Nouvelle fiche") + "</button>" +
      (X.reglage ? X.reglage(EXF, en) : "") + exChoixNiveau(X0, en) +
      '<label class="ex-case"><input type="checkbox" data-action="ex-corrige"' + (EXF.corrige ? " checked" : "") + "> " + (en ? "Add the answers (on a separate page)" : "Ajouter le corrigé (sur une page à part)") + "</label>" +
      '<button class="coco-btn" type="button" data-action="imprimer">' + (en ? "Print or save as PDF" : "Imprimer ou enregistrer en PDF") + "</button>" +
      '<button class="coco-btn" type="button" data-action="ex-tbi">' + (en ? "Correct on the board" : "Corriger au TBI") + "</button>" + choixLangue() + "</div>" +
      '<p class="no-print ex-aide">' + (en ? "To get a PDF file: in the print window, choose “Save as PDF”. Each click on “New worksheet” draws new exercises. The worksheet number (top right) lets you find the same exercises again to correct them on the board." : "Pour obtenir un fichier PDF : dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ». Chaque « Nouvelle fiche » tire d’autres exercices. Le numéro de la fiche (en haut à droite) permet de retrouver les mêmes exercices pour les corriger au TBI.") + (X0.niveaux ? (en ? " The three levels share the same worksheet number: each level has its own exercises." : " Les trois niveaux gardent le même numéro de fiche : chaque niveau a ses propres exercices.") : "") + "</p>" + exObjectifs(X0, X, en) +
      '<article class="exos ' + mat.classe + '">' + tete + corps + "</article>" + (corrige ? '<article class="exos ex-page ' + mat.classe + '">' + corrige + "</article>" : "");
  }
  /* correction au TBI (D-104) : un exercice par écran, on touche une case pour montrer la réponse */
  function pageExosTbi(X, en, mat, num) {
    var ex = exGenerer(X, en, true), n = ex.length, i = Math.min(EXF.i || 0, n - 1), e = ex[i];
    var cles = []; e.q.replace(/data-k="(\d+)"/g, function (_, k) { cles.push(+k); return ""; }); EXF.cles = cles; EXF.nb = n; EXF.i = i;
    var tout = cles.length && cles.every(function (k) { return EXF.vu[k]; });
    return '<div class="no-print ex-outils coco-row tb-barre"><button class="coco-btn coco-btn--secondaire" type="button" data-action="ex-feuille">← ' + (en ? "Printable worksheet" : "Fiche à imprimer") + "</button>" +
      '<label class="ex-case tb-num">' + (en ? "Worksheet no. " : "Fiche n° ") + '<input id="ex-num" inputmode="numeric" maxlength="5" value="' + EXF.n + '"></label><button class="coco-btn coco-btn--secondaire" type="button" data-action="ex-num">' + (en ? "Open" : "Ouvrir") + "</button>" +
      (X.reglage ? X.reglage(EXF, en) : "") + exChoixNiveau(EXOS[EXF.seq], en) +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="ex-plein">' + (en ? "Full screen" : "Plein écran") + "</button>" + choixLangue() + "</div>" +
      '<section class="exos tb-scene ' + mat.classe + '"><header class="tb-tete"><div><small>' + esc(tr(mat.nom)) + " · " + num + "</small><h1>" + esc(X.titre()) + "</h1></div>" +
      '<p class="ex-rappel"><b>' + (en ? "I remember" : "Je me rappelle") + "</b> " + X.rappel(en) + "</p></header>" +
      '<div class="ex tb-ex"><h2><span>' + (i + 1) + "</span>" + e.c + '</h2><div class="tb-zoom">' + e.q + "</div></div>" +
      (cles.length ? "" : '<p class="tb-note"><b>' + (en ? "To correct together: " : "Pour corriger ensemble : ") + "</b>" + e.r + "</p>") +
      '<nav class="tb-nav no-print"><button class="coco-btn coco-btn--secondaire" type="button" data-action="ex-prec"' + (i ? "" : " disabled") + ">◀ " + (en ? "Previous" : "Exercice précédent") + "</button>" +
      '<span class="tb-pos">' + (en ? "Exercise " : "Exercice ") + (i + 1) + " / " + n + "</span>" +
      (cles.length ? '<button class="coco-btn' + (tout ? " coco-btn--secondaire" : "") + '" type="button" data-action="' + (tout ? "ex-cacher" : "ex-tout") + '">' + (tout ? (en ? "Hide all" : "Tout cacher") : (en ? "Show all" : "Tout montrer")) + "</button>" : "") +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="ex-suiv"' + (i < n - 1 ? "" : " disabled") + ">" + (en ? "Next" : "Exercice suivant") + " ▶</button></nav></section>";
  }
  function actionExos(a, el) {
    if (!EXF) return;
    if (a === "ex-nouveau") { EXF.n = exNouveauNum(); exTirer(); }
    else if (a === "ex-corrige") EXF.corrige = el.checked;
    else if (a === "ex-niv") { var nv = +el.dataset.v; if (nv !== EXF.niv) { EXF.niv = nv; exTirer(); } }
    else if (a === "ex-tbi") { EXF.tbi = true; EXF.i = 0; window.scrollTo(0, 0); }
    else if (a === "ex-feuille") EXF.tbi = false;
    else if (a === "ex-vu") { var k = +el.dataset.k; EXF.vu[k] = !EXF.vu[k]; }
    else if (a === "ex-tout") (EXF.cles || []).forEach(function (k) { EXF.vu[k] = true; });
    else if (a === "ex-cacher") (EXF.cles || []).forEach(function (k) { delete EXF.vu[k]; });
    else if (a === "ex-prec") EXF.i = Math.max(0, (EXF.i || 0) - 1);
    else if (a === "ex-suiv") EXF.i = (EXF.i || 0) + 1;
    else if (a === "ex-num") { var v = parseInt((document.getElementById("ex-num") || {}).value, 10); if (v > 0 && v < 100000 && v !== EXF.n) { EXF.n = v; exTirer(); } }
    else if (a === "ex-plein") { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (x) {} }
  }
  function ficheHeure() {
    var li = function (a) { return a.map(function (x) { return "<li>" + x + "</li>"; }).join(""); };
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#ens-sequences">← Séquences d’apprentissage</a><a class="coco-btn" href="#tbi-heure">Au TBI</a><a class="coco-btn coco-btn--secondaire" href="#seq-heure">Voir la séquence</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche m-maths"><small>Maths · Grandeurs et mesures (durées) · Cycle 2, CE2, niveau de maîtrise 3</small><h1>Lire l’heure à aiguilles</h1>' +
      '' +
      encadreProgramme("heure") +
      '<section><h2>Les séances et les activités du site</h2><table class="f-table"><tbody>' + [
        ["Séance 1", "Reconnaître les différentes aiguilles d’une horloge ; lire les heures piles sur le cadran.", "Je me rappelle · Heures ou minutes ? · Lis l’horloge (niveau 1)"],
        ["Séance 2", "Lire les demi-heures ; lire les quarts d’heure (et quart, moins le quart) sur le cadran.", "Lis l’horloge (niveaux 2 et 3) · Règle l’horloge · Quelle heure est-il ? · Memory des heures"],
        ["Séance 3", "Lire les minutes multiples de 5 (jusqu’à « vingt-cinq », puis de « moins vingt-cinq » à « moins cinq »). Objectif ajusté aux repères du niveau 3 : la lecture de toutes les minutes n’y figure pas.", "Lis les minutes (niveaux 4 et 5) · Règle l’horloge · Quelle heure est-il ? · Memory des heures"],
        ["Séances 1 à 3", "Au TBI, en classe entière : découvrir la lecture de l’heure étape par étape, puis s’entraîner collectivement aux ardoises.", "Au TBI"],
        ["Séance 4", "Résoudre un problème simple sur l’heure à aiguilles.", "Problèmes d’horloge"],
        ["Séance 5", "Évaluation : objectifs précédents.", "Toutes les activités"]].map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>"; }).join("") + "</tbody></table></section>" +
      "<section><h2>Conseils d’utilisation</h2><ul>" + li(["Code des leçons : la petite aiguille et les heures en rouge, la grande aiguille et les minutes en bleu.", "Toutes les activités existent en français et en anglais britannique (o’clock, quarter past, half past, quarter to, twenty-five to…) : la bascule FR / EN est en haut à droite.", "« Je retiens » reprend mot pour mot les leçons GM5. La carte « De moins 25 à moins 5 » est un complément : absente de GM5, elle figure dans les repères du niveau 3. En anglais, « Je retiens » est une traduction, en attendant la leçon anglaise.", "Au TBI : Espace ou flèche droite = suite, flèche gauche = retour, P = pause du minuteur, F = plein écran, Échap = retour.", "Les deux problèmes ouverts de la séquence (« Les aiguilles sur le même nombre », « Un quart de tour ») seront ajoutés plus tard."]) + "</ul></section>" +
      '<p class="f-source">Sources : programmation périodique P5 2026, leçons de maths de la classe, programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, mathématiques).</p></article>';
  }

  /* ---------- problèmes ouverts (Sullivan) : briques communes ---------- */
  var PO = window.COCO_PO;
  function po(id) { return PO.problemes[id]; }
  function pieceBtn(v, act, k) {
    return '<button class="po-piece' + (v >= 10 ? " po-piece--grande" : "") + '" type="button" data-action="' + act + '" data-v="' + v + '"' + (k !== undefined ? ' data-k="' + k + '"' : "") + ' aria-label="' + v + ' F">' + v + "<small>F</small></button>";
  }
  function fruitBtn(f, act, choisi) {
    return '<button class="po-fruit' + (choisi ? " is-choisi" : "") + '" type="button" data-action="' + act + '" data-v="' + f.id + '" aria-pressed="' + !!choisi + '"><span>' + esc(f[langue] || f.fr) + "</span><b>" + f.prix + " F</b></button>";
  }
  /* zone de manipulation : pièces ou étals du marché */
  /* problèmes « réglages » (division…) : réglettes − / +, champs à taper et dessin */
  function depart(p) { if (p.depart) return p.depart(); if (!p.champs) return []; var s = {}; p.champs.forEach(function (c) { s[c.k] = c.saisie ? "" : c.depart; }); return s; }
  function pret(p, sel) { if (p.pret) return p.pret(sel); if (!p.champs) return sel.length > 0; return p.champs.every(function (c) { return !c.saisie || /^\d+$/.test(String(sel[c.k])); }); }
  function copie(p, sel) { return Array.isArray(sel) ? sel.slice() : JSON.parse(JSON.stringify(sel)); }
  function relancer(p, sel) { if (p.depart) return p.depart(); if (!p.champs) return []; var s = copie(p, sel); p.champs.forEach(function (c) { if (c.saisie) s[c.k] = ""; }); return s; }
  function regler(p, sel, el) {
    var c = p.champs.filter(function (x) { return x.k === el.dataset.k; })[0]; if (!c) return;
    sel[c.k] = Math.max(c.min, Math.min(c.max, sel[c.k] + (+el.dataset.d) * (c.pas || 1)));
  }
  function reglages(p, sel, pre, actif) {
    var en = langue === "en";
    return '<div class="po-champs">' + p.champs.map(function (c) {
      if (c.saisie) return '<label class="po-champ"><span>' + esc(tr(c)) + '</span><input type="text" inputmode="numeric" maxlength="3" autocomplete="off" data-po-champ="' + c.k + '" data-mode="' + pre + '" value="' + esc(sel[c.k]) + '"' + (actif ? "" : " disabled") + "></label>";
      var bouton = function (d, signe) {
        var ok = actif && (d < 0 ? sel[c.k] > c.min : sel[c.k] < c.max);
        return '<button class="po-pm" type="button" data-action="' + pre + '-champ" data-k="' + c.k + '" data-d="' + d + '" aria-label="' + esc(tr(c)) + (d < 0 ? (en ? ": one less" : " : un de moins") : (en ? ": one more" : " : un de plus")) + '"' + (ok ? "" : " disabled") + ">" + signe + "</button>";
      };
      return '<div class="po-champ"><span>' + esc(tr(c)) + '</span><div class="po-reglette">' + bouton(-1, "−") + "<b>" + (c.deux && sel[c.k] < 10 ? "0" : "") + sel[c.k] + "</b>" + bouton(1, "+") + "</div></div>";
    }).join("") + "</div>" + '<div class="po-dessin-zone">' + p.dessin(sel, langue) + "</div>";
  }
  function manipulation(p, sel, actAjout, actRetire, actif) {
    if (p.champs) return reglages(p, sel, actAjout.charAt(0), actif !== false);
    if (p.type === "panier") return maniPanier(sel, actAjout, actRetire);
    if (p.type === "etiquette") return maniEtiquette(sel, actAjout, actAjout.charAt(0), actif !== false);
    if (p.type === "pieces") {
      var total = sel.reduce(function (a, b) { return a + b; }, 0);
      return "<h3>" + (langue === "en" ? "The coins" : "Les pièces") + '</h3><div class="po-pieces">' + PO.PIECES.map(function (v) { return pieceBtn(v, actAjout); }).join("") + "</div>" +
        "<h3>" + (langue === "en" ? "Tom's purse · tap a coin to take it out" : "Le porte-monnaie de Tom · touche une pièce pour l'enlever") + '</h3><div class="po-bourse" data-vide="' + (langue === "en" ? "Empty" : "Vide") + '">' + sel.map(function (v, k) { return pieceBtn(v, actRetire, k); }).join("") + "</div>" +
        '<p class="po-total">= ' + total + " F</p>";
    }
    var tot = sel.reduce(function (a, id) { return a + PO.FRUITS.filter(function (f) { return f.id === id; })[0].prix; }, 0);
    return "<h3>" + (langue === "en" ? "The stall · tap a fruit to put it in the basket" : "L'étal · touche un fruit pour le mettre dans le panier") + '</h3><div class="po-etal">' +
      PO.FRUITS.map(function (f) { return fruitBtn(f, actAjout, sel.indexOf(f.id) >= 0); }).join("") + "</div>" +
      '<p class="po-total">' + (langue === "en" ? "Basket: " : "Panier : ") + tot + " F</p>";
  }
  function basculer(p, sel, v) {
    if (p.type === "pieces") { if (sel.length < 30) sel.push(+v); return; }
    if (p.type === "panier") { if (sel.length < 25) sel.push(v); return; }
    if (p.type === "etiquette") { var kv = v.split(":"); if (kv[0] === "o") { sel.o = sel.o === kv[1] ? "" : kv[1]; sel.libre = ""; } else sel.u = sel.u === kv[1] ? "" : kv[1]; return; }
    var i = sel.indexOf(v); if (i >= 0) sel.splice(i, 1); else sel.push(v);
  }
  function enonceBloc(p) {
    var prix = p.type === "marche" ? '<span class="po-prix">' + PO.FRUITS.map(function (f) { return esc(f[langue] || f.fr) + " <b>" + f.prix + " F</b>"; }).join(" · ") + "</span>" : "";
    return tr(p.enonce) + prix + (p.enonceExtra ? p.enonceExtra(langue) : "");
  }
  /* les masses (D-109) : le panier (on peut prendre plusieurs fois le même produit) et le tri des étiquettes */
  function maniPanier(sel, actAjout, actRetire) {
    var en = langue === "en";
    return "<h3>" + (en ? "The shop · tap a thing to put it in the basket" : "Le magasin · touche un produit pour le mettre dans le panier") + '</h3><div class="po-etal">' +
      PO.PRODUITS_M.map(function (f) { return '<button class="po-fruit" type="button" data-action="' + actAjout + '" data-v="' + f.id + '"><span>' + esc(f[en ? "en" : "fr"]) + "</span><b>" + f.etiq + "</b></button>"; }).join("") + "</div>" +
      "<h3>" + (en ? "My basket · tap a thing to take it out" : "Mon panier · touche un produit pour l’enlever") + '</h3><div class="po-bourse po-panier" data-vide="' + (en ? "Empty" : "Vide") + '">' +
      sel.map(function (id, k) { var f = PO.PRODUITS_M.filter(function (x) { return x.id === id; })[0]; return '<button class="po-fruit po-fruit--petit" type="button" data-action="' + actRetire + '" data-k="' + k + '" aria-label="' + esc((en ? "Take out " : "Enlever ") + f[en ? "en" : "fr"]) + '"><span>' + esc(f[en ? "en" : "fr"]) + "</span><b>" + f.etiq + "</b></button>"; }).join("") + "</div>" +
      '<p class="po-note">' + (sel.length ? (en ? sel.length + " thing" + (sel.length > 1 ? "s" : "") + " in the basket. How much does it weigh altogether? Work it out, then check." : sel.length + " produit" + (sel.length > 1 ? "s" : "") + " dans le panier. Combien pèse-t-il en tout ? Calcule, puis vérifie.") : (en ? "The scale will only show the total when you check." : "La balance ne montre le total que quand tu vérifies.")) + "</p>";
  }
  function maniEtiquette(sel, act, pre, actif) {
    var en = langue === "en", dis = actif ? "" : " disabled";
    var u = sel.u && sel.u !== "non" ? PO.UNITES_M.filter(function (x) { return x.k === sel.u; })[0].fr.slice(2) : "?";
    return '<div class="po-etiq"><div class="po-etiq-bal">' + PO.balance("5", u) + '<p class="po-etiq-quoi">' + (sel.o || sel.libre ? esc(sel.libre || PO.OBJETS_M.filter(function (o) { return o.id === sel.o; })[0][en ? "en" : "fr"]) : (en ? "Choose an object…" : "Choisis un objet…")) + "</p></div>" +
      "<div><h3>" + (en ? "1 · An object" : "1 · Un objet") + '</h3><div class="po-etal po-objets">' + PO.OBJETS_M.map(function (o) { return '<button class="po-fruit po-objet' + (sel.o === o.id ? " is-choisi" : "") + '" type="button" data-action="' + act + '" data-v="o:' + o.id + '" aria-pressed="' + (sel.o === o.id) + '"' + dis + "><span>" + esc(o[en ? "en" : "fr"]) + "</span></button>"; }).join("") + "</div>" +
      '<label class="po-libre"><span>' + (en ? "…or my own object:" : "… ou mon objet à moi :") + '</span><input type="text" maxlength="40" autocomplete="off" data-po-libre="1" data-mode="' + pre + '" value="' + esc(sel.libre || "") + '" placeholder="' + (en ? "e.g. a dog" : "par exemple : un chien") + '"' + dis + "></label>" +
      "<h3>" + (en ? "2 · The unit" : "2 · L’unité") + '</h3><div class="coco-row po-unites">' + PO.UNITES_M.map(function (x) { return '<button class="coco-btn ' + (sel.u === x.k ? "" : "coco-btn--secondaire") + '" type="button" data-action="' + act + '" data-v="u:' + x.k + '" aria-pressed="' + (sel.u === x.k) + '"' + dis + ">" + x[en ? "en" : "fr"] + "</button>"; }).join("") + "</div></div></div>";
  }

  /* ---------- mode autonome (élève) ---------- */
  var A = null;
  function poAutonome(id) {
    var p = po(id), m = MATIERE.maths, s = C[p.sequence], en = langue === "en";
    if (!A || A.id !== id) A = { id: id, sel: depart(p), sols: [], etape: "cherche", coches: {}, msg: "", pouce: false, relance: 0, strats: {}, range: false };
    var titre = { sous: tr(s.titre) + " · " + t("ouvert"), titre: tr(p.titre) };
    var liste = A.sols.slice(); if (A.range) liste.sort(p.ranger);
    var sols = liste.map(function (x) { return "<li>" + esc(p.ecrire(x, langue)) + (p.estLibre && p.estLibre(x) ? ' <b class="po-adiscuter">?</b>' : " <b>✓</b>") + "</li>"; }).join("");
    var blocSols = '<section class="po-sol"><h3>' + (en ? "My ways: " : "Mes solutions : ") + A.sols.length + "</h3>" + (sols ? "<ol>" + sols + "</ol>" : "") +
      '<p class="po-note">' + (en ? "There is more than one right answer." : "Il n'y a pas qu'une seule bonne réponse.") + "</p>" +
      (A.sols.length > 1 ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="a-ranger" aria-pressed="' + A.range + '">' + (A.range ? (en ? "Back to my order" : "Remettre dans mon ordre") : (en ? "Sort my ways" : "Ranger mes solutions")) + "</button>" : "") + "</section>";
    if (A.etape === "fin" || A.etape === "bilan") {
      if (A.etape === "fin") {
        return barre("maths") + hautJeu(m, "seq-" + p.sequence, titre) + bulle(p.perso, en ? "How did you find your ways? Tick <b>what you did</b>." : "Comment as-tu trouvé tes solutions ? Coche <b>ce que tu as fait</b>.", "reflechit") +
          '<section class="zone m-maths"><div class="po-coches">' + p.strategies.map(function (st, i) { return '<button class="po-coche" type="button" data-action="a-strat" data-i="' + i + '" aria-pressed="' + !!A.strats[i] + '"><span class="po-case">' + (A.strats[i] ? "✓" : "") + "</span>" + esc(tr(st)) + "</button>"; }).join("") + "</div>" +
          '<button class="coco-btn coco-btn--grand" type="button" data-action="a-terminer">' + (en ? "Finish" : "Terminer") + "</button></section>";
      }
      marquerFait("po-" + id);
      var faits = p.strategies.filter(function (st, i) { return A.strats[i]; }).map(function (st) { return "<li>" + esc(tr(st)) + "</li>"; }).join("");
      var ranges = A.sols.slice().sort(p.ranger).map(function (x) { return "<li>" + esc(p.ecrire(x, langue)) + "</li>"; }).join("");
      return barre("maths") + hautJeu(m, "seq-" + p.sequence, titre) + '<section class="bilan"><img src="' + POSE(p.perso, "victoire") + '" alt=""><h2>' + t("fini") + "</h2><p>" +
        (en ? "You found " + A.sols.length + " way" + (A.sols.length > 1 ? "s" : "") + ". We will compare them in class." : "Tu as trouvé " + A.sols.length + " solution" + (A.sols.length > 1 ? "s" : "") + ". On les comparera en classe.") + "</p>" +
        (ranges ? '<div class="po-bilan"><h3>' + (en ? "My ways, sorted" : "Mes solutions rangées") + "</h3><ol>" + ranges + "</ol>" + (faits ? "<h3>" + (en ? "How I did it" : "Comment j'ai fait") + "</h3><ul>" + faits + "</ul>" : "") + "</div>" : "") +
        '<div class="coco-row"><a class="coco-btn coco-btn--secondaire" href="#seq-' + p.sequence + '">' + t("versSequence") + "</a></div></section>";
    }
    var verif = "";
    if (A.etape === "verif") {
      verif = '<section class="po-verif"><h3>' + (en ? "Before checking: what have you checked yourself?" : "Avant de vérifier : qu'as-tu déjà vérifié toi-même ?") + '</h3><div class="po-coches">' +
        p.checklist.map(function (c) { return '<button class="po-coche" type="button" data-action="a-coche" data-v="' + c.id + '" aria-pressed="' + !!A.coches[c.id] + '"><span class="po-case">' + (A.coches[c.id] ? "✓" : "") + "</span>" + esc(tr(c)) + "</button>"; }).join("") +
        '</div><div class="coco-row"><button class="coco-btn coco-btn--grand" type="button" data-action="a-verifier">' + (en ? "Check my way" : "Vérifier ma solution") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="a-annuler">' + (en ? "Change it" : "Je la modifie") + "</button></div></section>";
    }
    if (A.etape === "ecrit") {
      verif = '<section class="po-verif po-ecrit"><h3>' + esc(tr(p.ecriture.titre)) + "</h3>" + p.ecriture.lignes(langue).map(function (l) {
        return '<p class="po-egalite">' + l.map(function (x) {
          if (x.charAt(0) !== "#") return "<span>" + esc(x) + "</span>";
          var k = x.slice(1);
          return '<input type="text" inputmode="numeric" maxlength="3" autocomplete="off" data-ecrit="' + k + '" value="' + esc(A.ecrit[k] || "") + '" aria-label="' + (en ? "Box to fill" : "Case à remplir") + '">';
        }).join("") + "</p>";
      }).join("") + '<div class="coco-row"><button class="coco-btn coco-btn--grand" type="button" data-action="a-ecrit-ok">' + (en ? "Check my writing" : "Vérifier mon écriture") + "</button></div></section>";
    }
    var relances = p.relances.slice(0, A.relance).map(function (r, i) { return "<li>" + esc(tr(r)) + "</li>"; }).join("");
    return barre("maths") + hautJeu(m, "seq-" + p.sequence, titre) + bulle(p.perso, enonceBloc(p)) +
      '<div class="po-corps m-maths"><section class="po-zone">' + manipulation(p, A.sel, "a-ajout", "a-retire", A.etape === "cherche") +
      (A.etape === "cherche" ? '<div class="coco-row"><button class="coco-btn coco-btn--grand" type="button" data-action="a-proposer"' + (pret(p, A.sel) ? "" : " disabled") + ">" + (en ? "I suggest this way" : "Je propose cette solution") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="a-vider">' + (en ? "Empty" : "Vider") + "</button></div>" : "") +
      "</section>" + blocSols + "</div>" + verif + '<div class="retour-zone">' + A.msg + "</div>" +
      '<div class="po-aides"><button class="po-aide po-aide--pouce" type="button" data-action="a-pouce" aria-expanded="' + A.pouce + '"><img src="' + POSE("margouille", "idee") + '" alt=""><span><strong>' + (en ? "Little help" : "Coup de pouce") + '</strong><span class="cache">' + esc(tr(p.pouce)) + "</span></span></button>" +
      '<div class="po-aide po-aide--defi"><span class="coco-pastille-icone">+</span><div><strong>' + (en ? "To go further" : "Pour aller plus loin") + "</strong>" + (relances ? '<ol class="po-relances">' + relances + "</ol>" : "") +
      (A.relance < p.relances.length ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="a-relance">' + (A.relance ? (en ? "Another challenge" : "Encore un défi") : (en ? "Show a challenge" : "Voir un défi")) + "</button>" : "") + "</div></div></div>" +
      '<div class="jeu-bas"><span></span><button class="coco-btn coco-btn--secondaire" type="button" data-action="a-fini"' + (A.sols.length ? "" : " disabled") + ">" + (en ? "I have finished" : "J'ai fini") + "</button></div>";
  }
  function noteVerif(rien) {
    var en = langue === "en";
    return rien ? (en ? "Next time, check it yourself before pressing ‘Check my way’." : "La prochaine fois, vérifie toi-même avant d'appuyer sur « Vérifier ma solution ».")
      : (en ? "And you checked it yourself: well done! Can you find another way?" : "Et tu l'avais vérifiée toi-même : bravo ! Trouves-tu une autre façon ?");
  }
  function actionAutonome(a, el) {
    var p = po(A.id), en = langue === "en";
    if (a === "a-ajout" && A.etape === "cherche") { basculer(p, A.sel, el.dataset.v); A.msg = ""; }
    else if (a === "a-retire" && A.etape === "cherche") { A.sel.splice(+el.dataset.k, 1); A.msg = ""; }
    else if (a === "a-champ" && A.etape === "cherche") { regler(p, A.sel, el); A.msg = ""; }
    else if (a === "a-vider") { A.sel = depart(p); A.msg = ""; }
    else if (a === "a-proposer" && pret(p, A.sel)) { A.etape = "verif"; A.coches = {}; A.msg = ""; }
    else if (a === "a-annuler") A.etape = "cherche";
    else if (a === "a-coche") A.coches[el.dataset.v] = !A.coches[el.dataset.v];
    else if (a === "a-verifier") {
      var r = p.verifier(A.sel), diag = p.diagnostic(A.sel), cle = p.cle(A.sel), dejaVu = A.sols.some(function (x) { return p.cle(x) === cle; });
      var faux = p.checklist.filter(function (c) { return A.coches[c.id] && !diag[c.id]; });
      var rien = !p.checklist.some(function (c) { return A.coches[c.id]; });
      A.etape = "cherche";
      if (r.ok && dejaVu) A.msg = retour("revoir", en ? "Already found!" : "Déjà trouvée !", en ? "You already have this way. Look for a different one." : "Tu as déjà cette solution. Cherche une autre façon.");
      else if (r.ok && p.ecriture) {
        A.attente = copie(p, A.sel); A.ecrit = {}; A.rien = rien; A.etape = "ecrit";
        A.msg = retour("bravo", en ? "It works!" : "Ça marche !", en ? "Now write it with numbers." : "Maintenant, écris-la avec des nombres.");
      }
      else if (r.ok && r.libre) {
        A.sols.push(copie(p, A.sel)); A.sel = relancer(p, A.sel);
        A.msg = retour("astuce", en ? "Noted!" : "C’est noté !", esc(r[langue]));
      }
      else if (r.ok) {
        A.sols.push(copie(p, A.sel)); A.sel = relancer(p, A.sel);
        A.msg = retour("bravo", t("bravo"), (r[langue] ? esc(r[langue]) + " " : (en ? "It works. " : "Ça marche. ")) + noteVerif(rien));
      } else {
        var meta = faux.length ? "<br>" + (en ? "You ticked « " + tr(faux[0]) + " », but it is not the case yet. Check again." : "Tu as coché « " + tr(faux[0]) + " », mais ce n'est pas encore le cas. Vérifie à nouveau.") : "";
        A.msg = retour("revoir", t("pasEncore"), r[langue] + meta);
      }
    }
    else if (a === "a-ecrit-ok" && A.etape === "ecrit") {
      if (p.ecriture.ok(A.attente, A.ecrit)) {
        A.sols.push(A.attente); A.sel = relancer(p, A.sel); A.etape = "cherche";
        A.msg = retour("bravo", t("bravo"), (en ? "Your division is written correctly. " : "Ta division est bien écrite. ") + noteVerif(A.rien));
      } else A.msg = retour("revoir", t("pasEncore"), esc(tr(p.ecriture.aide)));
    }
    else if (a === "a-ranger") A.range = !A.range;
    else if (a === "a-pouce") A.pouce = !A.pouce;
    else if (a === "a-relance") A.relance = Math.min(A.relance + 1, p.relances.length);
    else if (a === "a-fini") A.etape = "fin";
    else if (a === "a-strat") A.strats[el.dataset.i] = !A.strats[el.dataset.i];
    else if (a === "a-terminer") A.etape = "bilan";
  }

  /* ---------- mode classe (TBI, 4 temps de Sullivan) ---------- */
  var K = null, minuteur = null;
  function majMinuteur() {
    var el = document.getElementById("minuteur"); if (!el || !K) return;
    var reste = K.fin ? Math.max(0, Math.round((K.fin - Date.now()) / 1000)) : K.reste;
    el.textContent = Math.floor(reste / 60) + ":" + String(reste % 60).padStart(2, "0");
    if (K.fin && reste === 0) { K.fin = 0; K.reste = 0; clearInterval(minuteur); }
  }
  function poClasse(id) {
    var p = po(id), en = langue === "en";
    if (!K || K.id !== id) K = { id: id, temps: 1, aide: "cherche", tableau: [], sel: depart(p), range: false, reste: 15 * 60, fin: 0 };
    var onglets = ["La question", "On cherche", "On met en commun", "On retient"].map(function (n, i) {
      var nEn = ["The question", "We search", "We share", "We remember"][i];
      return '<button class="k-onglet" type="button" data-action="k-temps" data-v="' + (i + 1) + '" aria-pressed="' + (K.temps === i + 1) + '"><span>' + (i + 1) + "</span>" + (en ? nEn : n) + "</button>";
    }).join("");
    var haut = '<header class="k-haut"><nav class="k-onglets">' + onglets + '</nav><div class="coco-row">' + choixLangue() + '<a class="coco-btn coco-btn--secondaire" href="#enseignante">Fermer</a></div></header>';
    var corps = "";
    if (K.temps === 1) {
      corps = '<section class="k-question"><img src="' + POSE(p.perso, "presente") + '" alt=""><div class="k-bulle"><h1>' + esc(tr(p.titre)) + "</h1><div class=\"k-enonce\">" + enonceBloc(p) + "</div></div></section>";
    } else if (K.temps === 2) {
      var aide = K.aide === "pouce" ? ["margouille", en ? "Little help" : "Coup de pouce", "<p>" + esc(tr(p.pouce)) + "</p>"]
        : K.aide === "loin" ? [p.perso, en ? "To go further" : "Pour aller plus loin", "<ol>" + p.relances.map(function (r) { return "<li>" + esc(tr(r)) + "</li>"; }).join("") + "</ol>"]
        : [p.perso, en ? "We search" : "On cherche", "<p>" + (en ? "In pairs or threes, write down <b>all</b> the ways you find. You have one? Look for another!" : "Par 2 ou 3, écrivez <b>toutes</b> les solutions que vous trouvez. Vous en avez une ? Cherchez-en une autre !") + "</p>"];
      corps = '<div class="k-cherche"><div class="k-rappel">' + enonceBloc(p) + '</div><div class="k-minuteur"><p id="minuteur">15:00</p><div class="coco-row">' +
        [10, 15, 20].map(function (n) { return '<button class="coco-btn coco-btn--secondaire" type="button" data-action="k-duree" data-v="' + n + '">' + n + " min</button>"; }).join("") +
        '</div><div class="coco-row"><button class="coco-btn" type="button" data-action="k-lancer">' + (K.fin ? "Pause" : (en ? "Start" : "Lancer")) + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-remettre">' + (en ? "Reset" : "Remettre") + "</button></div></div></div>" +
        '<div class="k-aide"><div class="k-boutons">' + [["cherche", en ? "We search" : "On cherche"], ["pouce", en ? "Little help" : "Coup de pouce"], ["loin", en ? "To go further" : "Pour aller plus loin"]].map(function (b) { return '<button class="coco-btn ' + (K.aide === b[0] ? "" : "coco-btn--secondaire") + '" type="button" data-action="k-aide" data-v="' + b[0] + '">' + b[1] + "</button>"; }).join("") + "</div>" +
        '<img src="' + POSE(aide[0], K.aide === "cherche" ? "reflechit" : "idee") + '" alt=""><div class="k-bulle"><h2>' + aide[1] + "</h2>" + aide[2] + "</div></div>";
    } else if (K.temps === 3) {
      var tab = K.tableau.slice(); if (K.range) tab.sort(function (a, b) { return p.ranger(a.sol, b.sol); });
      var cartes = tab.map(function (c) {
        var idx = K.tableau.indexOf(c), r = p.verifier(c.sol), etat = c.vu ? (r.libre ? "libre" : r.ok ? "ok" : "non") : "";
        return '<button class="k-carte ' + etat + '" type="button" data-action="k-voir" data-k="' + idx + '"><span>' + esc(p.ecrire(c.sol, langue)) + "</span>" + (c.vu ? "<small>" + (r.libre ? "? " + (en ? "To discuss: does it really weigh that much? We weigh it or look it up." : "À discuter : ça pèse vraiment autant ? On le pèse ou on se renseigne.") : r.ok ? "✓ " + (r[langue] ? esc(r[langue]) : (en ? "It works" : "Ça marche")) : "↻ " + esc(r[langue])) + "</small>" : "<small>" + (en ? "Tap to check" : "Touche pour vérifier") + "</small>") + "</button>";
      }).join("");
      corps = '<div class="k-relances">' + [en ? "How do you know?" : "Comment le savez-vous ?", en ? "Is it really a new way?" : "Est-ce vraiment une nouvelle façon ?", en ? "Who did it differently?" : "Qui a fait autrement ?"].map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</div>" +
        '<div class="k-commun"><section class="po-zone m-maths">' + manipulation(p, K.sel, "k-ajout", "k-retire") + '<div class="coco-row"><button class="coco-btn" type="button" data-action="k-tableau"' + (pret(p, K.sel) ? "" : " disabled") + ">" + (en ? "Add to the board" : "Ajouter au tableau") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-vider">' + (en ? "Empty" : "Vider") + "</button></div></section>" +
        '<section class="k-tableau"><div class="coco-row"><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-tout">' + (en ? "Check all" : "Tout vérifier") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-ranger" aria-pressed="' + K.range + '">' + (en ? "Sort" : "Ranger") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-effacer">' + (en ? "Clear" : "Effacer") + "</button></div>" +
        (cartes ? '<div class="k-cartes">' + cartes + "</div>" : '<p class="po-note">' + (en ? "Enter each group's way, then tap it to check, once the class has given its opinion." : "Entre la solution de chaque groupe, puis touche-la pour la vérifier, une fois que la classe a donné son avis.") + "</p>") + "</section></div>";
    } else {
      var rangees = K.tableau.filter(function (c) { return p.verifier(c.sol).ok; }).map(function (c) { return c.sol; });
      var vus = {}; rangees = rangees.filter(function (s) { var k = p.cle(s); if (vus[k]) return false; vus[k] = 1; return true; }).sort(p.ranger);
      var toutes = p.vueToutes ? p.vueToutes(vus, langue) : p.toutes ? '<h3>' + (en ? "All the answers" : "Toutes les réponses") + "</h3><ol>" + p.toutes.slice().sort(p.ranger).map(function (s) { var trouve = vus[p.cle(s)]; return '<li class="' + (trouve ? "trouve" : "") + '">' + esc(p.ecrire(s, langue)) + (trouve ? " <b>✓</b>" : "") + "</li>"; }).join("") + "</ol>"
        : "<p>" + (en ? "There are " + p.nbToutes.toLocaleString("en-GB") + " ways in all: to find lots of them, we get organised!" : "Il y a " + p.nbToutes.toLocaleString("fr-FR") + " façons en tout : pour en trouver beaucoup, on s'organise !") + "</p>";
      corps = '<div class="k-retient"><div class="retiens"><img src="' + POSE("coralie", "idee") + '" alt=""><div><h3>' + (en ? "We remember" : "On retient") + "</h3><p>" + esc(tr(p.retenir)) + '</p><p class="lecon-ex">' + esc(tr(p.exemple)) + "</p></div></div>" +
        '<section class="po-sol"><h3>' + (en ? "The class's ways, sorted" : "Les solutions de la classe, rangées") + "</h3>" + (rangees.length ? "<ol>" + rangees.map(function (s) { return "<li>" + esc(p.ecrire(s, langue)) + "</li>"; }).join("") + "</ol>" : '<p class="po-note">—</p>') + toutes + "</section></div>";
    }
    return '<div class="k">' + haut + corps + "</div>";
  }
  function actionClasse(a, el) {
    var p = po(K.id);
    if (a === "k-temps") K.temps = +el.dataset.v;
    else if (a === "k-aide") K.aide = el.dataset.v;
    else if (a === "k-duree") { K.reste = +el.dataset.v * 60; K.fin = 0; clearInterval(minuteur); }
    else if (a === "k-lancer") {
      if (K.fin) { K.reste = Math.max(0, Math.round((K.fin - Date.now()) / 1000)); K.fin = 0; clearInterval(minuteur); }
      else { K.fin = Date.now() + K.reste * 1000; clearInterval(minuteur); minuteur = setInterval(majMinuteur, 500); }
    }
    else if (a === "k-remettre") { K.reste = 15 * 60; K.fin = 0; clearInterval(minuteur); }
    else if (a === "k-ajout") basculer(p, K.sel, el.dataset.v);
    else if (a === "k-champ") regler(p, K.sel, el);
    else if (a === "k-retire") K.sel.splice(+el.dataset.k, 1);
    else if (a === "k-vider") K.sel = depart(p);
    else if (a === "k-tableau" && pret(p, K.sel)) { K.tableau.push({ sol: copie(p, K.sel), vu: false }); K.sel = relancer(p, K.sel); }
    else if (a === "k-voir") { var c = K.tableau[+el.dataset.k]; c.vu = !c.vu; }
    else if (a === "k-tout") K.tableau.forEach(function (c) { c.vu = true; });
    else if (a === "k-ranger") K.range = !K.range;
    else if (a === "k-effacer") K.tableau = [];
  }

  /* ---------- feuille de recherche (à imprimer) ---------- */
  function poFeuille(id) {
    var p = po(id), s = C[p.sequence];
    var cases = ""; for (var i = 0; i < 8; i++) cases += '<div class="f-case"></div>';
    var rappel = p.type === "pieces" ? "<p><b>Les pièces :</b> " + PO.PIECES.map(function (v) { return v + " F"; }).join(" · ") + "</p>"
      : p.type === "marche" ? "<p><b>Les prix :</b> " + PO.FRUITS.map(function (f) { return esc(f.fr) + " " + f.prix + " F"; }).join(" · ") + "</p>"
      : p.enonceExtra ? "<p>" + p.enonceExtra(langue) + "</p>" : "";
    var zone = '<div class="f-cases">' + cases + "</div>";
    if (p.feuille) {
      var F = p.feuille, lignes = "";
      for (var j = 0; j < F.lignes; j++) lignes += "<tr>" + F.colonnes.map(function (c, k) { return "<td>" + ((F.fixe || {})[k] || "") + "</td>"; }).join("") + "</tr>";
      zone = '<table class="f-grille"><thead><tr>' + F.colonnes.map(function (c) { return "<th" + (c.large ? ' class="large"' : "") + ">" + esc(tr(c)) + "</th>"; }).join("") + "</tr></thead><tbody>" + lignes + "</tbody></table>" +
        (F.bas ? '<div class="f-bas"><p>' + esc(tr(F.bas)) + '</p><div class="f-lignes"></div></div>' : "");
    }
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#ens-sequences">← Séquences d’apprentissage</a><button class="coco-btn" type="button" data-action="imprimer">Imprimer</button>' + choixLangue() + "</div>" +
      '<article class="feuille"><header><div><small>Maths · ' + esc(tr(s.titre)) + " · Problème ouvert</small><h1>" + esc(tr(p.titre)) + '</h1></div><div class="f-nom">Prénom : ............................<br>Date : ................................</div></header>' +
      '<div class="f-enonce"><img src="' + IMG(p.perso) + '" alt=""><div><p>' + tr(p.enonce) + "</p>" + rappel + "</div></div>" +
      "<h2>" + (langue === "en" ? "My ways" : "Mes solutions") + "</h2>" + zone +
      '<div class="f-deux"><div><h2>' + (langue === "en" ? "I check" : "Je vérifie") + "</h2><ul>" + p.checklist.map(function (c) { return "<li>☐ " + esc(tr(c)) + "</li>"; }).join("") + "</ul></div>" +
      "<div><h2>" + (langue === "en" ? "How I did it" : "Comment j'ai fait") + "</h2><ul>" + p.strategies.map(function (c) { return "<li>☐ " + esc(tr(c)) + "</li>"; }).join("") + '<li>☐ ' + (langue === "en" ? "Another way: ............................" : "Autrement : ............................") + "</li></ul></div></div>" +
      '<div class="f-loin"><h2>' + (langue === "en" ? "To go further" : "Pour aller plus loin") + "</h2><ol>" + p.relances.map(function (r) { return "<li>" + esc(tr(r)) + "</li>"; }).join("") + "</ol></div></article>";
  }

  /* ---------- fiche enseignante ---------- */
  function poFiche(id) {
    var p = po(id), f = p.fiche, s = C[p.sequence], li = function (a) { return a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join(""); };
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#ens-sequences">← Séquences d’apprentissage</a><a class="coco-btn" href="#classe-' + id + '">Projeter en classe</a><a class="coco-btn coco-btn--secondaire" href="#feuille-' + id + '">Feuille de recherche</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche m-maths"><small>Maths · ' + esc(s.titre.fr) + " · Problème ouvert · CE2 · 45 min environ · par 2 ou 3" + (f.moment ? " · " + esc(f.moment) : "") + "</small><h1>" + esc(p.titre.fr) + '</h1><p class="f-q">« ' + esc(p.question.fr) + " »</p><p>" + p.enonce.fr + '</p><p class="f-source">' + esc(f.source) + "</p>" + encadreProgramme(p.sequence) +
      '<div class="f-deux"><section><h2>Ce que les élèves apprennent</h2><ul>' + li(f.apprend) + "</ul></section><section><h2>Pourquoi c'est une bonne question</h2><ul>" + li(f.pourquoi) + "</ul></section></div>" +
      "<section><h2>Matériel</h2><ul>" + li(f.materiel) + "</ul></section>" +
      '<section><h2>Le déroulé en 4 temps</h2><ol class="f-temps">' + f.temps.map(function (x) { return "<li><b>" + esc(x[0]) + "</b> <i>" + esc(x[1]) + "</i><p>" + esc(x[2]) + "</p>" + (x[3] ? '<p class="f-dire">' + esc(x[3]) + "</p>" : "") + "</li>"; }).join("") + "</ol></section>" +
      '<div class="f-deux"><section><h2>Coup de pouce</h2><p>' + esc(p.pouce.fr) + "</p></section><section><h2>Pour aller plus loin</h2><ol>" + li(p.relances.map(function (r) { return r.fr; })) + "</ol></section></div>" +
      "<section><h2>Les réponses</h2><p>" + esc(f.reponses) + "</p></section>" +
      '<section><h2>Les erreurs à guetter, et quoi demander</h2><table class="f-table"><tbody>' + f.erreurs.map(function (e) { return "<tr><td>" + esc(e[0]) + "</td><td>" + esc(e[1]) + "</td>" + (e[2] ? '<td class="f-dire">' + esc(e[2]) + "</td>" : "") + "</tr>"; }).join("") + "</tbody></table></section>" +
      '<section><h2>Évaluer sans note : les 5 niveaux</h2><table class="f-table"><tbody>' + ["Ne semble pas comprendre", "A fait un essai, mais comprend peu", "Comprend, mais pas tout", "Semble bien comprendre", "Dépasse les attentes"].map(function (n, i) { return "<tr><th>" + (i + 1) + " · " + n + "</th><td>" + esc(f.niveaux[i]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      '<p>Comportements à observer (Sullivan & Lilburn, chapitre 4) (coopère, persévère, essaie autre chose, organise l\'information, cherche toutes les possibilités, généralise, explique, utilise le matériel).</p></section>' +
      '<div class="f-deux"><section><h2>La trace écrite</h2><p>' + esc(p.retenir.fr) + '</p><p class="lecon-ex">' + esc(p.exemple.fr || p.exemple) + "</p></section><section><h2>Pour réinvestir un autre jour</h2><ul>" + li(f.reinvestir) + "</ul></section></div></article>";
  }

  /* ---------- espace enseignante ---------- */
  /* ---------- Espace enseignante : trois dossiers (D-87) ---------- */
  var ENS_DOSSIERS = [
    { id: "ens-suivi", t: "Suivi des élèves", d: "Les résultats et les bilans de la classe." },
    { id: "ens-sequences", t: "Séquences d’apprentissage", d: "Fiches, projection au TBI et feuilles de recherche, rangées par domaine." },
    { id: "ens-formation", t: "Formation", d: "Mes fiches de formation : lexique, didactique générale, mathématiques, français." }
  ];
  var DOSSIER_SVG = '<svg class="ens-dossier-ic" viewBox="0 0 64 52" aria-hidden="true"><path d="M4 10a5 5 0 0 1 5-5h15l6 6h25a5 5 0 0 1 5 5v27a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" class="ens-d-fond"/><path d="M4 18h56v25a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" class="ens-d-face"/></svg>';
  var CADENAS = '<svg class="ens-cadenas" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';
  function pageCode() {
    return barre("enseignante") + '<section class="entete ens-entete"><img src="' + IMG("coralie-avatar") + '" alt=""><div><h1>Espace enseignante</h1><p>Cet espace est réservé à la maîtresse.</p></div></section>' +
      '<form class="ens-code" data-ens-form novalidate><label for="ens-code">' + CADENAS + "Code d’accès</label>" +
      '<div class="ens-code-ligne"><input id="ens-code" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go"><button class="coco-btn" type="submit">Entrer</button></div>' +
      '<p class="ens-code-msg" role="status" aria-live="polite"></p></form>' +
      '<p class="ens-code-retour"><a class="coco-btn coco-btn--secondaire" href="#accueil">← Retour à l’accueil</a></p>';
  }
  document.addEventListener("submit", function (e) {
    var f = e.target; if (!f.matches || !f.matches("[data-ens-form]")) return; e.preventDefault();
    var champ = f.querySelector("#ens-code"), msg = f.querySelector(".ens-code-msg");
    if (ensCodeJuste(champ.value)) { ensOuvert = true; try { sessionStorage.setItem("coco-ens", "1"); } catch (x) {} derniere = ""; rendre(); return; }
    msg.textContent = champ.value ? "Ce n’est pas le bon code. Vérifiez et réessayez." : "Tapez le code d’accès.";
    msg.classList.add("est-visible"); champ.value = ""; champ.focus();
  });
  function ensEntete(sous) {
    return barre("enseignante") + '<section class="entete ens-entete"><img src="' + IMG("coralie") + '" alt=""><div><h1>Espace enseignante</h1>' +
      (sous ? '<p class="ens-fil"><a href="#enseignante">Espace enseignante</a> › ' + esc(sous) + "</p>" : "<p>Trois dossiers pour préparer, suivre et se former.</p>") + "</div>" +
      '<button class="coco-btn coco-btn--secondaire ens-verrou" type="button" data-action="ens-verrouiller">' + CADENAS + "Verrouiller</button></section>";
  }
  function ensLigne(img, titre, sous, liens, cls) {
    return '<div class="ens-pb' + (cls ? " " + cls : "") + '"><img src="' + IMG(img) + '" alt=""><div><b>' + titre + "</b><small>" + sous + '</small></div><div class="coco-row">' +
      liens.map(function (l, k) { return '<a class="coco-btn' + (k ? " coco-btn--secondaire" : "") + '" href="' + l[1] + '">' + l[0] + "</a>"; }).join("") + "</div></div>";
  }
  function ensPO(id) { var p = po(id); return ensLigne(p.perso, esc(p.titre.fr), "Problème ouvert · « " + esc(p.question.fr) + " »", [["Projeter en classe", "#classe-" + id], ["La fiche", "#fiche-" + id], ["Feuille de recherche", "#feuille-" + id]]); }
  function ensDomaine(cls, titre, lignes) { return '<section class="domaine domaine-matiere ' + cls + '"><h2>' + titre + '</h2><div class="ens-liste">' + lignes.join("") + "</div></section>"; }
  /* « Séquences d’apprentissage » en tiroirs (D-122) : chaque sous-domaine est fermé et s’ouvre d’un clic ;
     les tiroirs ouverts sont retenus dans l’onglet (sessionStorage), pour les retrouver au retour d’une fiche. */
  var ENS_TIROIRS = (function () { try { return JSON.parse(sessionStorage.getItem("coco-tiroirs") || "{}"); } catch (e) { return {}; } })();
  function ensTiroirsGarder() { try { sessionStorage.setItem("coco-tiroirs", JSON.stringify(ENS_TIROIRS)); } catch (e) {} }
  function ensTiroir(cls, titre, lignes) {
    var html = lignes.join(""), noms = [], nSeq = 0, nPO = (html.match(/class="ens-pb ens-po/g) || []).length;
    html.replace(/<div class="ens-pb( ens-seq)?(?![^"]*ens-po)[^"]*"><img[^>]*><div><b>([^<]*)<\/b>/g, function (_, seq, nom) { noms.push(nom); if (seq) nSeq++; return _; });
    var compte = [nSeq ? nSeq + " séquence" + (nSeq > 1 ? "s" : "") : "", nPO ? nPO + " problème" + (nPO > 1 ? "s" : "") + " ouvert" + (nPO > 1 ? "s" : "") : "", noms.length > nSeq ? (noms.length - nSeq) + " outil" + (noms.length - nSeq > 1 ? "s" : "") : ""].filter(Boolean).join(" · ");
    return '<details class="domaine domaine-matiere ens-tiroir ' + cls + '" data-tiroir="' + esc(titre) + '"' + (ENS_TIROIRS[titre] ? " open" : "") + '><summary><span class="ens-tiroir-tete"><h2>' + titre + '</h2><small>' + compte + '</small></span><span class="ens-tiroir-noms">' +
      noms.map(function (n, k) { return '<button type="button" data-action="ens-tiroir-aller" data-k="' + k + '">' + n + "</button>"; }).join("") + '</span><span class="ens-tiroir-fleche" aria-hidden="true"></span></summary><div class="ens-liste">' + html + "</div></details>";
  }
  document.addEventListener("toggle", function (e) { var d = e.target; if (!d.classList || !(d.classList.contains("ens-tiroir") || d.classList.contains("ens-po-tiroir"))) return; ENS_TIROIRS[d.dataset.tiroir] = d.open; ensTiroirsGarder(); }, true);
  function pageEnseignante() {
    var n = { "ens-suivi": "Étoiles de calcul et de grammaire", "ens-sequences": "12 séquences", "ens-formation": Object.keys(FO.fiches).filter(function (c) { return !FO.fiches[c].vide; }).length + " fiches" };
    return ensEntete("") + '<section class="ens-dossiers">' + ENS_DOSSIERS.map(function (d) {
      return '<a class="ens-dossier" href="#' + d.id + '">' + DOSSIER_SVG + "<b>" + d.t + "</b><small>" + d.d + '</small><span class="ens-compte">' + n[d.id] + "</span></a>";
    }).join("") + "</section>" + '<p class="ens-reglages"><a class="coco-btn coco-btn--secondaire" href="#ens-voix">' + "Voix de la dictée</a></p>";
  }
  /* Espace enseignante › Voix de la dictée (D-132) : réglage pour l’appareil (localStorage « coco-voix ») ; liste des voix françaises
     de l’appareil, écoute d’une phrase d’essai, choix de la vitesse ; « Choix automatique » prend la voix la plus naturelle. */
  var VOIX_ESSAI = "Le petit chat gris dort sur le tapis. Après l’école, Léo range son cartable.";
  function pageEnsVoix() {
    var V = window.COCO_VOIX, vs = V ? V.voixFrancaises() : [], p = V ? V.prefVoix() : {}, actuelle = V && V.meilleureVoix(), vit = p.vitesse || "lente";
    var tri = vs.slice().sort(function (a, b) { return V.scoreVoix(b) - V.scoreVoix(a); });
    var lignes = tri.map(function (v, i) { var choisie = actuelle && v.name === actuelle.name;
      return '<li class="voix-ligne' + (choisie ? " voix-choisie" : "") + '"><div><b>' + esc(v.name) + "</b><small>" + esc(v.lang) + (i === 0 ? " · la plus naturelle d’après son nom" : "") + "</small></div>" +
        '<div class="coco-row"><button class="coco-btn coco-btn--secondaire" type="button" data-action="voix-ecouter" data-v="' + esc(v.name) + '">Écouter</button>' +
        '<button class="coco-btn' + (choisie ? "" : " coco-btn--secondaire") + '" type="button" data-action="voix-choisir" data-v="' + esc(v.name) + '" aria-pressed="' + !!choisie + '">' + (choisie ? "Voix choisie" : "Choisir") + "</button></div></li>"; }).join("");
    return ensEntete("Voix de la dictée") +
      '<div class="voix-page"><p>La voix sert seulement aux jeux d’écoute et aux dictées. Ce réglage vaut <b>pour cet appareil</b> : à refaire sur chaque iPad.</p>' +
      '<section class="voix-bloc"><h2>Vitesse</h2><div class="coco-row">' + [["normale", "Normale"], ["lente", "Lente"], ["tres-lente", "Très lente"]].map(function (x) {
        return '<button class="coco-btn' + (vit === x[0] ? "" : " coco-btn--secondaire") + '" type="button" data-action="voix-vitesse" data-v="' + x[0] + '" aria-pressed="' + (vit === x[0]) + '">' + x[1] + "</button>"; }).join("") +
        '<button class="coco-btn coco-btn--secondaire" type="button" data-action="voix-ecouter" data-v="">Écouter la voix choisie</button></div><p class="et-note">Phrase d’essai : « ' + esc(VOIX_ESSAI) + " »</p></section>" +
      '<section class="voix-bloc"><h2>Voix françaises de cet appareil</h2>' + (vs.length ? '<p class="et-note">' + (p.nom ? 'Voix choisie à la main. <button class="ens-lien" type="button" data-action="voix-auto">Revenir au choix automatique</button>' : "Choix automatique : le site prend la voix la plus naturelle (en haut de la liste).") + "</p><ul class=\"voix-liste\">" + lignes + "</ul>"
        : "<p>Aucune voix française n’est proposée par ce navigateur pour l’instant. Rechargez la page ; sinon, ajoutez une voix française dans les réglages de l’appareil.</p>") + "</section>" +
      '<section class="voix-bloc voix-aide"><h2>Pour une voix plus naturelle sur iPad</h2><ol><li>Ouvrir <b>Réglages › Accessibilité › Contenu énoncé › Voix › Français (France)</b>.</li><li>Télécharger une voix <b>« améliorée »</b> ou <b>« premium »</b> (par exemple Audrey ou Thomas).</li><li>Fermer Safari complètement, le rouvrir, puis revenir sur cette page : la nouvelle voix apparaît dans la liste.</li></ol><p class="et-note">Toutes les voix de l’iPad ne sont pas toujours proposées à Safari : si la voix téléchargée n’apparaît pas, essayer une autre voix « améliorée ».</p></section></div>';
  }
  /* les voix arrivent parfois après le premier affichage : on redessine la page quand la liste change */
  try { if ("speechSynthesis" in window) speechSynthesis.addEventListener("voiceschanged", function () { if (location.hash === "#ens-voix") rendre(); }); } catch (e) {}
  function actionVoix(a, el) {
    var V = window.COCO_VOIX; if (!V) return; var p = V.prefVoix();
    if (a === "voix-vitesse") { p.vitesse = el.dataset.v; ecrire("voix", p); }
    else if (a === "voix-choisir") { p.nom = el.dataset.v; ecrire("voix", p); }
    else if (a === "voix-auto") { delete p.nom; ecrire("voix", p); }
    if (a === "voix-ecouter") { var nom = el.dataset.v, garde = p.nom; if (nom) { p.nom = nom; ecrire("voix", p); } V.dire([VOIX_ESSAI]); if (nom) { if (garde) p.nom = garde; else delete p.nom; ecrire("voix", p); } }
  }
  /* Espace enseignante › Séquences d’apprentissage (D-113) : pour chaque séquence, les mêmes 5 boutons dans le même ordre ;
     un bouton dont le contenu n’existe pas encore reste visible, grisé, avec « À venir ». Les problèmes ouverts sont rangés sous leur séquence. */
  function ensBouton(lib, lien, principal) {
    if (!lien) return '<span class="coco-btn coco-btn--secondaire ens-avenir" aria-disabled="true">' + lib + "<small>À venir</small></span>";
    return '<a class="coco-btn' + (principal ? "" : " coco-btn--secondaire") + '" href="' + lien + '">' + lib + "</a>";
  }
  function ensSeq(seq, img, titre, lecon, nbAct, tbi, cls) {
    var nbPO = (PO.sequences[seq] || []).length;
    var sous = [nbAct + " activité" + (nbAct > 1 ? "s" : ""), nbPO ? nbPO + " problème" + (nbPO > 1 ? "s" : "") + " ouvert" + (nbPO > 1 ? "s" : "") : ""].filter(Boolean).join(" · ");
    var boutons = [
      ensBouton("Fiche enseignante", ROUTES["fiche-" + seq] ? "#fiche-" + seq : "", true),
      ensBouton("La leçon", ROUTES["lecon-" + seq] ? "#lecon-" + seq : ""),
      ensBouton("Fiche d’exercices", ROUTES["exos-" + seq] ? "#exos-" + seq : ""),
      ensBouton("Au TBI", tbi || ""),
      ensBouton("Voir la séquence", "#seq-" + seq)
    ].join("");
    var ligne = '<div class="ens-pb ens-seq' + (cls ? " " + cls : "") + '"><img src="' + IMG(img) + '" alt=""><div><b>' + titre + "</b><small>" + sous + '</small></div><div class="coco-row ens-boutons">' + boutons + "</div></div>";
    var pos = (PO.sequences[seq] || []).map(function (id, k) { var p = po(id);
      return '<div class="ens-pb ens-po' + (cls ? " " + cls : "") + '"><img src="' + IMG(p.perso) + '" alt=""><div><b>' + esc(p.titre.fr) + "</b><small>Problème ouvert " + (k + 1) + " · « " + esc(p.question.fr) + ' »</small></div><div class="coco-row ens-boutons">' +
        ensBouton("Fiche enseignante", "#fiche-" + id, true) + ensBouton("Au TBI", "#classe-" + id) + ensBouton("Feuille de recherche", "#feuille-" + id) + "</div></div>"; }).join("");
    if (!nbPO) return ligne;
    /* D-122 : les problèmes ouverts sont repliés sous leur séquence */
    return ligne + '<details class="ens-po-tiroir' + (cls ? " " + cls : "") + '" data-tiroir="po-' + seq + '"' + (ENS_TIROIRS["po-" + seq] ? " open" : "") + '><summary><span class="ens-po-fleche" aria-hidden="true"></span><b>' + nbPO + " problème" + (nbPO > 1 ? "s" : "") + " ouvert" + (nbPO > 1 ? "s" : "") + "</b><span>" +
      (PO.sequences[seq] || []).map(function (id) { return esc(po(id).titre.fr); }).join(" · ") + '</span></summary><div class="ens-po-liste">' + pos + "</div></details>";
  }
  function pageEnsSequences() {
    var F = "ens-pb--francais", nQ = function (seq) { return QUIZ[seq] ? Object.keys(QUIZ[seq].jeux).length : 0; };
    return ensEntete("Séquences d’apprentissage") +
      '<p class="ens-legende">Pour chaque séquence, toujours les mêmes boutons : <b>Fiche enseignante</b>, La leçon, Fiche d’exercices, Au TBI, Voir la séquence. Un bouton grisé « À venir » montre ce qui reste à construire. Touchez un sous-domaine pour l’ouvrir.</p>' +
      '<div class="coco-row ens-tiroirs-boutons"><button class="coco-btn coco-btn--secondaire" type="button" data-action="ens-tiroirs" data-v="1">Tout ouvrir</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="ens-tiroirs" data-v="0">Tout fermer</button></div>' +
      ensTiroir("m-francais", "Français · Grammaire et conjugaison", [ensSeq("verbe", "tehani", "Le verbe", "CONJ2", 2 + nQ("verbe"), ROUTES["tbi-verbe"] ? "#tbi-verbe" : "", F), ensSeq("imparfait", "leo", "L’imparfait", "CONJ13 et CONJ14", nQ("imparfait"), ROUTES["tbi-imparfait"] ? "#tbi-imparfait" : "", F)]) +
      ensTiroir("m-francais", "Français · Orthographe", [ensSeq("mots", "sari", "Les mots invariables", "affiches 2026", Object.keys(JEUX_MOTS).length, ROUTES["tbi-mots"] ? "#tbi-mots" : "", F),
        ensSeq("nombres", "sari", "Les nombres en lettres", "", nQ("nombres"), "#tbi-nombres", F), ensSeq("muettes", "waeko", "Les consonnes muettes", "", nQ("muettes"), "#tbi-muettes", F), ensSeq("egroupe", "adi", "Le -e après un groupe de consonnes", "", nQ("egroupe"), "#tbi-egroupe", F)]) +
      ensTiroir("m-maths", "Maths · Techniques opératoires", [ensSeq("division", "nina", "La division en ligne", "CAL7 et CAL8", nQ("division"), ROUTES["tbi-division"] ? "#tbi-division" : "")]) +
      ensTiroir("m-maths", "Maths · Grandeurs et mesures", [
        ensSeq("monnaie", "mei", "La monnaie et les prix", "GM1", nQ("monnaie"), ROUTES["tbi-monnaie"] ? "#tbi-monnaie" : ""),
        ensSeq("digitale", "tehani", "Lire l’heure digitale", "GM5", nQ("digitale"), JEU_DIGITAL),
        ensSeq("heure", "coralie", "Lire l’heure à aiguilles", "GM5", Object.keys(JEUX_HEURE).length, "#tbi-heure"),
        ensSeq("masses", "sari", "Mesurer des masses", "GM8", nQ("masses"), ROUTES["tbi-masses"] ? "#tbi-masses" : "")]) +
      ensTiroir("m-maths", "Maths · Résolution de problèmes", [
        ensSeq("diagrammes", "waeko", "Lire un graphique en barres", "OGD1", Object.keys(JEUX_DIAG).length, ROUTES["tbi-diagrammes"] ? "#tbi-diagrammes" : ""),
        ensLigne("adi", "Banque de problèmes (Vergnaud)", "217 problèmes classés par type, avec leurs schémas", [["Ouvrir la banque", "#banque"]])]);
  }


  /* ==========================================================================================
     Suivi des étoiles de calcul (D-97) : Espace enseignante › Suivi des élèves
     Les 9 étoiles du fichier de la classe ; une date par étoile ; données sur l'appareil (localStorage « coco-etoiles »),
     jamais en ligne ; sauvegarde et restauration par fichier. À transférer dans la base en ligne quand elle existera.
     ========================================================================================== */
  var ETOILES = [["Blanche", "#ffffff", "Addition posée"], ["Jaune", "#f7f06a", "Addition posée"], ["Orange", "#f6a878", "Soustraction posée"], ["Rouge", "#f26565", "Soustraction posée"],
    ["Verte", "#94e8a0", "Multiplication à 1 chiffre"], ["Bleue", "#6fd6f4", "Multiplication à 1 chiffre"], ["Mauve", "#c2a6f2", "Multiplication à 2 chiffres"], ["Rose", "#f56fb6", "Multiplication à 2 chiffres"], ["Noire", "#bdbdbd", "Division"]];
  var ET = { sel: null, liste: false, msg: "", type: "calcul" };
  function etDonnees() { var d = lire("etoiles", null); if (!d || !d.eleves) d = { eleves: [], val: {}, sauve: "" }; d.val = d.val || {}; d.gram = d.gram || {}; return d; }
  function etEcrire(d) { ecrire("etoiles", d); }
  function etAujourdhui() { var j = new Date(); return j.getFullYear() + "-" + HE.pad(j.getMonth() + 1) + "-" + HE.pad(j.getDate()); }
  function etCourt(iso) { var p = iso.split("-"); return p[2] + "/" + p[1]; }
  function etLong(iso) { var p = iso.split("-"), M = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]; return (+p[2]) + " " + M[+p[1] - 1] + " " + p[0]; }
  /* étoile dessinée par Claude (D-98) : contour épais, pointes arrondies ; sans points (D-100), sans visage ni reflet (D-102) */
  var ET_FORME = "M41.4 13.4Q43.7 7.4 47.6 12.6L59.2 27.9Q61.3 30.7 64.6 31.0L82.8 32.5Q88.8 33.1 85.3 38.1L74.6 53.2Q72.7 56.0 73.7 59.4L79.4 78.1Q81.3 84.4 75.1 82.5L56.7 76.9Q53.4 75.9 50.5 77.6L34.9 87.0Q29.7 90.1 29.6 84.0L29.4 65.4Q29.3 62.1 26.5 59.9L10.9 48.1Q5.7 44.2 11.7 42.1L29.9 35.8Q33.2 34.6 34.5 31.4Z";
  function etEtoile(c, vide, grande) {
    return '<svg class="et-etoile' + (vide ? " et-vide" : "") + (grande ? " et-grande" : "") + '" viewBox="0 0 100 100" aria-hidden="true"><path class="et-forme" d="' + ET_FORME + '" style="fill:' + c + '"/></svg>';
  }

  /* ---------- Étoiles de grammaire (D-123) : fichier de la classe « Étoiles de grammaire » [CLASSE] (9 étoiles, mêmes couleurs que les étoiles de calcul ;
     6 entraînements et 3 évaluations chacune). Corrigés des évaluations rédigés par Claude, dans la présentation des corrections
     du fichier (déterminants en bleu, noms en rose avec NP / NC, adjectifs en vert et nom souligné, verbe en rouge). Le fichier ne contient
     pas la correction des évaluations. Ordre choisi par l’enseignante : rose = futur, noire = imparfait (comme la progression) ; être et avoir au 3e groupe (CONJ3). Balises : [d:mot] déterminant, [n:mot|NC] nom, [a:mot] adjectif, [u:mot] nom qualifié, [v:mot] verbe. ---------- */
  var ET_GRAM_SOUS = ["Déterminants", "Noms", "Adjectifs", "Passé, présent, futur", "Verbe", "Présent", "Passé composé", "Futur", "Imparfait"];
  var ETOILES_GRAM = ETOILES.map(function (e, k) { return [e[0], e[1], ET_GRAM_SOUS[k]]; });
  var ET_GRAM = [
    { t: "Les déterminants", k: "det", c: "Recopie les phrases, colorie en bleu les déterminants. Puis écris sur ton cahier les articles définis et les articles indéfinis.",
      ev: [{ p: ["[d:Cette] fois, tu prendras [d:l’]autre chemin.", "[d:Mes] stylos sont dans [d:la] trousse de Louis.", "[d:Un] jour, je deviendrai [d:une] artiste.", "[d:Tes] cousins sont [d:des] garçons polis."], art: ["l’ la", "un une des"] },
        { p: ["[d:Ma] mère a préparé [d:un] délicieux flan.", "[d:Ton] père travaille dans [d:l’]armée.", "Il a [d:une] peur incontrôlée [d:des] oiseaux.", "[d:Ce] monstre et [d:cette] fillette sont amis."], art: ["l’", "un une des"] },
        { p: ["Hier, [d:mon] cousin a partagé [d:notre] repas.", "Sur [d:la] table, il y avait [d:son] plat préféré.", "C’était [d:un] ragoût avec [d:des] carottes.", "Et pour [d:le] dessert : [d:une] tarte à [d:l’]abricot."], art: ["la le l’", "un des une"] }] },
    { t: "Les noms", k: "nom", c: "Recopie les phrases, colorie en rose les noms. Puis écris sous les noms : NP (nom propre) ou NC (nom commun).",
      ev: [{ p: ["La [n:police|NC] a arrêté le [n:tueur|NC] à [n:Miami|NP].", "Mes [n:parents|NC] partent à [n:Hawaï|NP] pour les [n:vacances|NC].", "Ton [n:chien|NC] a détruit mon beau [n:jardin|NC] !", "[n:Lisa|NP] m’a offert ce magnifique [n:cadeau|NC], c’est ma [n:couleur|NC] préférée !"] },
        { p: ["Mes [n:amis|NC] ont un [n:appartement|NC] à [n:Brisbane|NP].", "Le [n:cousin|NC] de [n:Louis|NP] adore les [n:gâteaux|NC] à la [n:crème|NC].", "Tous les [n:soirs|NC], je fais mes [n:devoirs|NC].", "La [n:veste|NC] de [n:Nicolas|NP] est tachée de [n:chocolat|NC]."] },
        { p: ["J’ai laissé mes [n:claquettes|NC] sur la [n:plage|NC] à [n:Poé|NP].", "Les [n:fenêtres|NC] de l’[n:immeuble|NC] ont été nettoyées ce [n:matin|NC].", "Nous avons regardé notre [n:série|NC] préférée sur [n:Netflix|NP].", "[n:Paul|NP] a garé sa [n:voiture|NC] dans le [n:parking|NC]."] }] },
    { t: "Les adjectifs", k: "adj", c: "Recopie les phrases. Colorie en vert les ADJECTIFS.",
      ev: [{ p: ["Cendrillon portait de [a:belles] [u:pantoufles] [a:transparentes].", "La princesse avait une [u:peau] [a:pâle] et une [u:bouche] [a:rouge] comme le sang.", "L’[u:ogre] [a:terrifiant] se jeta sur l’[u:enfant] [a:apeuré].", "L’[a:effrayante] [u:sorcière] chevauchait son [a:vieux] [u:balai] dans la [u:nuit] [a:sombre]."] },
        { p: ["Chaque nuit, le [a:gros] [u:chat] [a:noir] dormait sur le [u:tapis] [a:troué].", "Hier, j’ai mangé une [u:pomme] [a:rouge] et [a:sucrée].", "Contrairement à moi, mes [u:frères] sont [a:sages] et [a:calmes].", "Cette [a:magnifique] [u:maison] est [a:propre] et [a:agréable]."] },
        { p: ["La [a:petite] [u:fille] portait toujours un [u:chaperon] [a:rouge].", "Le [u:loup] [a:cruel] attendait dans la [a:sombre] [u:forêt].", "La [a:pauvre] [u:grand-mère] [a:malade] dormait dans son lit.", "Le [u:chasseur] [a:rusé] et [a:courageux] ouvrit le [u:ventre] [a:tendu] du loup."] }] },
    { t: "Passé, présent, futur", k: "temps", c: "Recopie chaque phrase puis indique leur temps (passé, présent ou futur).",
      ev: [{ p: [["Je rangerai ma chambre ce soir.", "FUTUR"], ["Maman prépare une soupe à l’oignon.", "PRÉSENT"], ["Nous avons éteint la lumière.", "PASSÉ"], ["Les feuilles tombent des arbres.", "PRÉSENT"]] },
        { p: [["Le mécanicien réparera la voiture.", "FUTUR"], ["Hier, la neige a recouvert tout le jardin.", "PASSÉ"], ["Vous choisirez un livre à la bibliothèque.", "FUTUR"], ["Nous écoutons le chant des oiseaux.", "PRÉSENT"]] },
        { p: [["L’avion a décollé avec du retard.", "PASSÉ"], ["Le loup se cachait derrière le buisson.", "PASSÉ"], ["Tu chercheras tes clés dans ton sac.", "FUTUR"], ["Je finis de manger mon goûter.", "PRÉSENT"]] }] },
    { t: "Le verbe", k: "verbe", c: "Recopie les phrases, colorie le VERBE en rouge, écris son infinitif et son groupe.",
      ev: [{ p: [["Mes amis [v:déjeunent] avec moi.", "DÉJEUNER", 1], ["J’[v:étendrai] mes vêtements plus tard.", "ÉTENDRE", 3], ["Nous lui [v:souhaitons] une belle journée.", "SOUHAITER", 1], ["Mon chat [v:grossit] à vue d’œil !", "GROSSIR", 2]] },
        { p: [["Les hommes [v:dormaient] dans les grottes.", "DORMIR", 3], ["Ils [v:chassaient] les animaux sauvages.", "CHASSER", 1], ["Les femmes [v:cueillaient] des baies.", "CUEILLIR", 3], ["Les petits [v:grandissaient] paisiblement.", "GRANDIR", 2]] },
        { p: [["Plus tard, je [v:serai] archéologue.", "ÊTRE", 3], ["Je [v:découvrirai] des fossiles !", "DÉCOUVRIR", 3], ["Ces dinosaures [v:peuplaient] la Terre.", "PEUPLER", 1], ["Une météorite [v:frappa] notre planète.", "FRAPPER", 1]] }] },
    { t: "Le présent", k: "conj", c: "Recopie et conjugue le verbe entre parenthèses au présent.",
      ev: [{ p: ["Tu ([v:brosses]) les chevaux.", "Vous ([v:prenez]) du congé.", "Ce tiroir ([v:reste]) toujours coincé.", "Les princesses ([v:viennent]) au bal.", "Nous ([v:allons]) chez le médecin."] },
        { p: ["On ne ([v:dérange]) pas la chambre.", "Je ([v:fais]) de mon mieux chaque jour.", "La maison ([v:prend]) de la valeur.", "Tom et Lucas ([v:discutent]) à la récré.", "Tu ([v:peux]) m’accompagner."] },
        { p: ["Nous ([v:disons]) la même chose.", "Elles ([v:observent]) l’éclipse.", "Wendy ([v:accroche]) sa casquette.", "Tes frères ([v:voient]) mieux avec des lunettes.", "Je ([v:veux]) être millionnaire."] }] },
    { t: "Le passé composé", k: "conj", c: "Recopie et conjugue le verbe entre parenthèses au passé composé.",
      ev: [{ p: ["Vous ([v:avez avoué]) le crime.", "Elles ([v:sont allées]) se cacher dans les grottes.", "Je ([v:suis arrivée]) la première.", "Emma ([v:a fait]) de beaux progrès.", "Tu ([v:as dansé]) toute la soirée !"] },
        { p: ["Nous ([v:avons plié]) nos vêtements.", "Tu ([v:as caché]) ton trésor sur cette île.", "Paul ([v:a pris]) deux tickets de cinéma.", "Mes copines ([v:sont venues]) me voir.", "Je ([v:suis allé]/[v:allée]) en Espagne."] },
        { p: ["Il ([v:a gagné]) le premier prix.", "Vous ([v:avez préparé]) une surprise.", "Elles ([v:ont dit]) des mensonges.", "Nina ([v:est entrée]) par cette porte.", "Mes frères ([v:sont restés]) toute la semaine."] }] },
    { t: "Le futur", k: "conj", c: "Recopie et conjugue le verbe entre parenthèses au futur.",
      ev: [{ p: ["Je ([v:ferai]) de mon mieux, promis !", "Tu n’([v:oublieras]) pas ton parapluie.", "Les élèves ([v:entreront]) par le portail.", "La maîtresse les ([v:saluera]) gentiment.", "Nous ([v:prendrons]) le déjeuner à la cantine."] },
        { p: ["Vous ([v:irez]) voir le film samedi prochain.", "On ([v:sera]) sur la première rangée.", "J’([v:achèterai]) du popcorn et de l’eau.", "Le son ([v:se diffusera]) dans toute la salle.", "Les spectateurs ([v:viendront]) en nombre."] },
        { p: ["Nous ([v:ferons]) une sortie à la piscine.", "Les enfants ([v:porteront]) leur bonnet.", "Théo ne ([v:verra]) pas bien sous l’eau.", "Vous ([v:sauterez]) du plongeoir.", "Tu ([v:pourras]) faire du toboggan !"] }] },
    { t: "L’imparfait", k: "conj", c: "Recopie et conjugue le verbe entre parenthèses à l’imparfait.",
      ev: [{ p: ["Mon papi ([v:jouait]) aux osselets.", "Mes parents n’([v:avaient]) pas de jouets.", "Nous ([v:venions]) de déménager.", "On ([v:faisait]) des gâteaux au chocolat.", "Je ([v:racontais]) des blagues près du feu."] },
        { p: ["Tu ([v:étais]) au chômage.", "Vous ([v:preniez]) un raccourci.", "Lucas ([v:faisait]) des roulades sur le tatami.", "Nous ([v:partagions]) la même chambre.", "Mes amis ([v:tricotaient]) des pulls."] },
        { p: ["J’([v:allais]) au cinéma chaque lundi.", "Lilou ([v:ramassait]) les feuilles mortes.", "Elles ([v:voyaient]) souvent leurs amies.", "Vous ([v:vouliez]) toujours dormir tôt.", "Les voisins ([v:râlaient]) à cause du bruit."] }] }
  ];
  function egPhrase(s) {
    return s.replace(/\[([dnavu]):([^\]|]+)(?:\|([^\]]+))?\]([.,!?]*)/g, function (_, t, mot, etq, ponct) {
      var m = '<span class="eg-' + t + '">' + mot + "</span>";
      return etq ? '<span class="eg-insec"><span class="eg-etq">' + m + "<small>" + etq + "</small></span>" + ponct + "</span>" : m + ponct;
    });
  }
  function egGroupes(g) { return '<span class="eg-gr">' + ["1<sup>er</sup>", "2<sup>ème</sup>", "3<sup>ème</sup>"].map(function (x, k) { return k + 1 === g ? "<b>" + x + "</b>" : "<span>" + x + "</span>"; }).join(" – ") + "</span>"; }
  function egItem(e, x) {
    if (e.k === "temps") return '<li><span class="eg-ph">' + egPhrase(x[0]) + '</span><b class="eg-rep">' + x[1] + "</b></li>";
    if (e.k === "verbe") return '<li><span class="eg-ph">' + egPhrase(x[0]) + '</span><span class="eg-rep"><b class="eg-v">' + x[1] + "</b> " + egGroupes(x[2]) + "</span></li>";
    if (e.k === "nom") return '<li><span class="eg-ph eg-ph--etq">' + egPhrase(x) + ' <small class="eg-nb">(' + x.match(/\[n:/g).length + ")</small></span></li>";
    return '<li><span class="eg-ph">' + egPhrase(x) + "</span></li>";
  }
  function pageEnsCorrigesGram() {
    var k = ET_CORR, s = ETOILES_GRAM[k], e = ET_GRAM[k];
    return ensEntete("Corrigés des étoiles de grammaire") +
      '<div class="coco-row et-outils">' + etBascule("grammaire", "corr") + '<a class="coco-btn coco-btn--secondaire" href="#ens-etoiles-grammaire">← Tableau de suivi</a></div>' +
      etChoix(ETOILES_GRAM, k) +
      '<div class="ec-tete ec-tete--fr">' + etEtoile(s[1], false, true) + "<p><b>Étoile " + s[0].toLowerCase() + "</b> · " + e.t + '<small>« ' + e.c + " »</small></p>" +
      '<img class="ec-perso" src="' + POSE("leo", "reflechit") + '" alt=""></div>' +
      '<div class="ec-evals">' + e.ev.map(function (v, i) {
        return '<section class="ec-eval ec-eval--fr"><h2>Évaluation ' + (i + 1) + '</h2><ul class="eg-liste">' + v.p.map(function (x) { return egItem(e, x); }).join("") + "</ul>" +
          (v.art ? '<p class="eg-art"><span>articles définis :</span> <b class="eg-d">' + v.art[0] + '</b><br><span>articles indéfinis :</span> <b class="eg-d">' + v.art[1] + "</b></p>" : "") + "</section>"; }).join("") + "</div>";
  }

  /* deux fichiers d'étoiles (D-123) : même liste d'élèves, un tableau chacun (d.val pour le calcul, d.gram pour la grammaire) */
  var ET_TYPES = {
    calcul: { titre: "Étoiles de calcul", liste: ETOILES, cle: "val", suivi: "ens-etoiles", corr: "ens-corriges", perso: "mei", mat: "maths", resume: "De l’addition posée à la division" },
    grammaire: { titre: "Étoiles de grammaire", liste: ETOILES_GRAM, cle: "gram", suivi: "ens-etoiles-grammaire", corr: "ens-corriges-grammaire", perso: "leo", mat: "francais", resume: "Des déterminants à l’imparfait" }
  };
  function etT() { return ET_TYPES[ET.type] || ET_TYPES.calcul; }
  function etBascule(type, page) {
    return '<nav class="et-bascule" aria-label="Choisir les étoiles">' + ["calcul", "grammaire"].map(function (t) { var T = ET_TYPES[t];
      return '<a class="et-bascule-' + T.mat + '" href="#' + (page === "corr" ? T.corr : T.suivi) + '"' + (t === type ? ' aria-current="page"' : "") + "><img src=\"" + POSE(T.perso, "presente") + '" alt="">' + T.titre + "</a>"; }).join("") + "</nav>";
  }
  function etChoix(liste, k) { return '<div class="ec-etoiles" role="group" aria-label="Choisir l’étoile">' + liste.map(function (e, i) { return '<button type="button" class="ec-choix" data-action="et-corr" data-v="' + i + '" aria-pressed="' + (i === k) + '">' + etEtoile(e[1]) + "<span>" + e[0] + "</span></button>"; }).join("") + "</div>"; }
  function etNiveau(d, id) { var T = etT(), v = d[T.cle][id] || {}; for (var k = 0; k < T.liste.length; k++) if (!v[k]) return k; return T.liste.length; }
  function pageEnsEtoiles(type) {
    ET.type = type || "calcul";
    var d = etDonnees(), n = d.eleves.length, T = etT(), V = d[T.cle];
    var outils = '<div class="no-print et-haut">' + etBascule(ET.type, "suivi") + '</div><div class="coco-row no-print et-outils"><a class="coco-btn coco-btn--secondaire" href="#ens-suivi">← Suivi des élèves</a>' +
      '<a class="coco-btn coco-btn--secondaire" href="#' + T.corr + '">Corrigés des évaluations</a>' +
      (ET.type === "calcul" ? '<a class="coco-btn coco-btn--secondaire" href="#ens-etoiles-fiches">Fiches à imprimer</a>' : "") +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="et-liste" aria-pressed="' + ET.liste + '">' + (ET.liste ? "Fermer la liste" : "Gérer la liste des élèves") + "</button>" +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer"' + (n ? "" : " disabled") + ">Imprimer le tableau</button>" +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="et-sauver"' + (n ? "" : " disabled") + ">Sauvegarder</button>" +
      '<label class="coco-btn coco-btn--secondaire et-restaurer">Restaurer<input type="file" accept=".json,application/json" id="et-fichier" hidden></label></div>' +
      '<p class="no-print et-note">Ces informations restent <b>sur cet appareil</b> (rien n’est envoyé en ligne). La liste des élèves est la même pour les étoiles de calcul et de grammaire. Pensez à <b>sauvegarder</b> de temps en temps : le fichier garde les deux tableaux et permet de les retrouver sur un autre appareil. ' +
      (d.sauve ? "Dernière sauvegarde : " + etLong(d.sauve) + "." : "<b>Aucune sauvegarde pour l’instant.</b>") + "</p>" + (ET.msg ? '<div class="no-print">' + ET.msg + "</div>" : "");
    var liste = "";
    if (ET.liste || !n) liste = '<section class="et-liste no-print"><h2>La liste des élèves</h2>' +
      (n ? '<ol class="et-noms">' + d.eleves.map(function (e) { return '<li><input type="text" value="' + esc(e.nom) + '" data-et-nom="' + e.id + '" aria-label="Prénom" maxlength="30"><button class="coco-btn coco-btn--secondaire" type="button" data-action="et-suppr" data-v="' + e.id + '">Retirer</button></li>'; }).join("") + "</ol>" : "<p>La liste est vide. Collez ou tapez les prénoms de vos élèves, un par ligne :</p>") +
      '<label class="et-ajout"><span>' + (n ? "Ajouter des élèves (un prénom par ligne) :" : "Prénoms :") + '</span><textarea id="et-nouveaux" rows="' + (n ? 3 : 8) + '" placeholder="Léa&#10;Noa&#10;…"></textarea></label>' +
      '<div class="coco-row"><button class="coco-btn" type="button" data-action="et-ajouter">Ajouter à la liste</button>' + (n ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="et-trier">Ranger par ordre alphabétique</button>' : "") + "</div>" +
      '<p class="et-note">Les prénoms se modifient directement dans les cases. Retirer un élève efface aussi ses étoiles.</p></section>';
    var tableau = "";
    if (n) {
      tableau = '<div class="et-cadre"><table class="et-tab"><thead><tr><th scope="col">Élève</th>' + T.liste.map(function (e) { return '<th scope="col">' + etEtoile(e[1]) + "<b>" + e[0] + "</b><span>" + e[2].replace("Multiplication", "Multipl.") + "</span></th>"; }).join("") + "</tr></thead><tbody>" +
        d.eleves.map(function (e) { var v = V[e.id] || {}, niv = etNiveau(d, e.id);
          return '<tr><th scope="row">' + esc(e.nom) + "</th>" + T.liste.map(function (s, k) { var date = v[k], sel = ET.sel && ET.sel.id === e.id && ET.sel.k === k;
            return '<td class="' + (k === niv ? "et-niveau" : "") + (sel ? " et-sel" : "") + '"><button type="button" class="et-case" data-action="et-etoile" data-id="' + e.id + '" data-k="' + k + '" aria-label="' + esc(e.nom) + " · étoile " + s[0].toLowerCase() + (date ? " · validée le " + etLong(date) : " · non validée") + '">' + etEtoile(s[1], !date) +
              (date ? "<small>" + etCourt(date) + "</small>" : k === niv ? '<small class="et-a-valider">à valider</small>' : "<small></small>") + "</button></td>"; }).join("") + "</tr>"; }).join("") +
        '<tr class="et-total"><th scope="row">Classe</th>' + T.liste.map(function (s, k) { var c = d.eleves.filter(function (e) { return (V[e.id] || {})[k]; }).length; return "<td>" + c + " / " + n + "</td>"; }).join("") + "</tr></tbody></table></div>";
    }
    var panneau = "";
    if (ET.sel) { var el = d.eleves.filter(function (x) { return x.id === ET.sel.id; })[0], s = T.liste[ET.sel.k], dt = el && (V[el.id] || {})[ET.sel.k];
      if (el && dt) panneau = '<div class="et-panneau no-print" role="dialog" aria-label="Étoile validée"><div>' + etEtoile(s[1], false, true) + "<p><b>" + esc(el.nom) + " · étoile " + s[0].toLowerCase() + "</b> (" + s[2].toLowerCase() + ")<br>Validée le " + etLong(dt) + ".</p></div>" +
        '<label>Changer la date : <input type="date" id="et-date" value="' + dt + '" max="' + etAujourdhui() + '"></label><div class="coco-row"><button class="coco-btn" type="button" data-action="et-date-ok">Enregistrer la date</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="et-retirer">Retirer la validation</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="et-fermer">Fermer</button></div></div>'; }
    return ensEntete(T.titre) + outils + '<div class="no-print et-intro et-intro--' + T.mat + '"><img src="' + POSE(T.perso, "content") + '" alt=""><p>Je touche l’étoile de l’élève : elle se colore et la date du jour s’écrit dessous. L’étoile à travailler est surlignée en jaune. Je touche une étoile déjà validée pour changer sa date ou la retirer.</p></div>' +
      liste + '<h2 class="et-titre-impr">Suivi des ' + T.titre.toLowerCase() + " · " + etLong(etAujourdhui()) + "</h2>" + tableau + panneau;
  }
  function actionEtoiles(a, el) {
    var d = etDonnees(), V = d[etT().cle]; ET.msg = "";
    if (a === "et-corr") { ET_CORR = +el.dataset.v; ET_POSE = {}; return; }
    if (a === "et-pose") { ET_POSE[el.dataset.v] = !ET_POSE[el.dataset.v]; return; }
    if (a === "et-etoile") {
      var id = el.dataset.id, k = +el.dataset.k; V[id] = V[id] || {};
      if (V[id][k]) ET.sel = { id: id, k: k };
      else { V[id][k] = etAujourdhui(); ET.sel = null; etEcrire(d); }
    } else if (a === "et-fermer") ET.sel = null;
    else if (a === "et-retirer" && ET.sel) { if (window.confirm("Retirer cette étoile validée ?")) { delete (V[ET.sel.id] || {})[ET.sel.k]; etEcrire(d); ET.sel = null; } }
    else if (a === "et-date-ok" && ET.sel) { var v = (document.getElementById("et-date") || {}).value; if (/^\d{4}-\d{2}-\d{2}$/.test(v || "")) { V[ET.sel.id][ET.sel.k] = v; etEcrire(d); ET.sel = null; } }
    else if (a === "et-liste") ET.liste = !ET.liste;
    else if (a === "et-ajouter") {
      var noms = ((document.getElementById("et-nouveaux") || {}).value || "").split(/\n|,|;/).map(function (x) { return x.trim(); }).filter(Boolean);
      noms.forEach(function (nom) { d.eleves.push({ id: "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nom: nom.slice(0, 30) }); });
      if (noms.length) { etEcrire(d); ET.liste = false; ET.msg = retour("bravo", "C’est fait", noms.length + " élève" + (noms.length > 1 ? "s ajoutés" : " ajouté") + " à la liste."); }
    }
    else if (a === "et-trier") { d.eleves.sort(function (x, y) { return x.nom.localeCompare(y.nom, "fr"); }); etEcrire(d); }
    else if (a === "et-suppr") { var e = d.eleves.filter(function (x) { return x.id === el.dataset.v; })[0]; if (e && window.confirm("Retirer " + e.nom + " de la liste ? Ses étoiles de calcul et de grammaire seront effacées.")) { d.eleves = d.eleves.filter(function (x) { return x !== e; }); delete d.val[e.id]; delete d.gram[e.id]; etEcrire(d); } }
    else if (a === "et-sauver") {
      d.sauve = etAujourdhui(); etEcrire(d);
      try { var blob = new Blob([JSON.stringify({ type: "coco-etoiles", version: 2, eleves: d.eleves, val: d.val, gram: d.gram, sauve: d.sauve }, null, 1)], { type: "application/json" }), url = URL.createObjectURL(blob), lien = document.createElement("a");
        lien.href = url; lien.download = "etoiles-calcul-et-grammaire-" + d.sauve + ".json"; document.body.appendChild(lien); lien.click(); setTimeout(function () { URL.revokeObjectURL(url); lien.remove(); }, 500);
        ET.msg = retour("bravo", "Sauvegardé", "Le fichier « etoiles-calcul-et-grammaire-" + d.sauve + ".json » (étoiles de calcul et de grammaire) est dans vos téléchargements. Gardez-le précieusement."); }
      catch (x) { ET.msg = retour("revoir", "Pas encore…", "Cet appareil n’a pas permis le téléchargement. Essayez depuis le site en ligne, dans Safari ou Chrome."); }
    }
  }
  /* prénoms modifiés, fichier de restauration */
  document.addEventListener("change", function (e) {
    var el = e.target;
    if (el.dataset && el.dataset.etNom !== undefined) { var d = etDonnees(), x = d.eleves.filter(function (y) { return y.id === el.dataset.etNom; })[0], nom = el.value.trim().slice(0, 30); if (x && nom) { x.nom = nom; etEcrire(d); } return; }
    if (el.id === "et-fichier" && el.files && el.files[0]) {
      var r = new FileReader();
      r.onload = function () {
        try { var j = JSON.parse(r.result); if (j.type !== "coco-etoiles" || !Array.isArray(j.eleves)) throw 0;
          if (window.confirm("Remplacer le tableau de cet appareil par celui du fichier (" + j.eleves.length + " élèves, sauvegardé le " + (j.sauve ? etLong(j.sauve) : "?") + ") ?")) { etEcrire({ eleves: j.eleves, val: j.val || {}, gram: j.gram || etDonnees().gram, sauve: j.sauve || "" }); ET.msg = retour("bravo", "Restauré", "Le tableau du fichier est maintenant sur cet appareil."); ET.sel = null; rendre(); } }
        catch (x) { ET.msg = retour("revoir", "Pas encore…", "Ce fichier n’est pas une sauvegarde des étoiles."); rendre(); }
      };
      r.readAsText(el.files[0]);
    }
  });

  /* ---------- Corrigés des évaluations des étoiles de calcul (D-101) : les 3 évaluations de chaque étoile, résultats seulement ;
     divisions écrites comme la leçon CAL8, avec les parenthèses du site : 681 = (9 × 75) + 6 ---------- */
  var ET_EVAL = [[["834 + 46", "62 + 387 + 455", "458 + 793 + 813", "265 + 191 + 84", "210 + 376 + 543"], ["765 + 87", "54 + 292 + 648", "529 + 619 + 443", "618 + 172 + 96", "340 + 485 + 466"], ["915 + 57", "48 + 273 + 541", "357 + 829 + 243", "607 + 391 + 75", "320 + 654 + 198"]], [["346 + 4659 + 79", "6215 + 87 + 863", "1458 + 3479 + 1602", "2165 + 183 + 7037", "2980 + 7653 + 1254"], ["245 + 2178 + 49", "4768 + 32 + 702", "2305 + 1219 + 9014", "4075 + 268 + 7943", "1096 + 6532 + 7630"], ["421 + 7658 + 86", "2350 + 58 + 129", "3256 + 4605 + 2541", "2875 + 528 + 3456", "6129 + 5783 + 2902"]], [["7654 + 54 + 321", "385 - 123", "916 - 145", "605 - 208", "712 - 237"], ["56 + 893 + 2192", "495 - 335", "827 - 153", "801 - 604", "332 - 287"], ["3761 + 496 + 75", "898 - 468", "728 - 346", "502 - 309", "345 - 286"]], [["763 + 1209 + 45", "1546 - 832", "5407 - 1285", "5681 - 2468", "2024 - 1989"], ["85 + 866 + 1653", "4196 - 862", "3551 - 2370", "7283 - 3075", "6162 - 3894"], ["763 + 1209 + 45", "7186 - 546", "4905 - 1633", "7654 - 3419", "9402 - 7658"]], [["7801 - 358", "58 x 6", "569 x 5", "891 x 3", "357 x 9"], ["9632 - 1575", "64 x 7", "667 x 5", "214 x 8", "395 x 4"], ["3141 - 295", "95 x 6", "751 x 9", "908 x 5", "474 x 4"]], [["9365 - 765", "892 x 4", "4518 x 6", "5913 x 3", "2145 x 5"], ["3651 + 479 + 2180", "608 x 5", "3519 x 7", "7168 x 2", "3186 x 3"], ["2903 - 1675", "854 x 8", "3679 x 2", "5983 x 6", "4178 x 5"]], [["2850 - 1749", "2748 x 7", "569 x 36", "195 x 25", "457 x 42"], ["4629 + 563 + 68", "1437 x 8", "352 x 43", "678 x 56", "856 x 27"], ["6561 - 3980", "536 x 6", "452 x 29", "659 x 35", "761 x 47"]], [["1428 - 1279", "587 x 27", "1746 x 39", "3852 x 54", "7150 x 68"], ["5628 + 6201 + 266", "561 x 63", "5789 x 29", "4718 x 75", "1462 x 48"], ["5108 - 4518", "376 x 49", "4619 x 26", "5617 x 38", "6471 x 57"]], [["3659 - 1963", "42 : 7", "681 : 9", "743 : 5", "337 : 6"], ["1740 x 65", "25 : 5", "832 : 8", "865 : 7", "450 : 6"], ["6735 x 34", "18 : 3", "285 : 4", "623 : 7", "966 : 8"]]];
  var ET_CORR = 0, ET_POSE = {};
  /* calcul posé (D-103), d'après les leçons de la classe : CAL1 addition (couleur par colonne, retenues entourées),
     CAL2 soustraction par compensation (« 1 » devant le chiffre du haut, « 1+ » devant le chiffre du bas),
     CAL5 multiplication posée, CAL6 multiplication à deux chiffres (retenues barrées puis nouvelles retenues, 0 en grisé) */
  var CP_COUL = ["cp-u", "cp-d", "cp-c"];
  function cpCol(k) { return CP_COUL[k] || "cp-m"; }            // k = rang de la colonne (0 = unités)
  function cpChiffres(n, L) { var t = String(n), r = []; for (var k = 0; k < L; k++) r.push(k < t.length ? t.charAt(t.length - 1 - k) : ""); return r; }
  function cpLigne(L, cases, signe, cls) {                        // cases[k] = html de la colonne k (unités à droite)
    var h = '<tr' + (cls ? ' class="' + cls + '"' : "") + '><td class="cp-signe">' + (signe || "") + "</td>";
    for (var k = L - 1; k >= 0; k--) h += "<td>" + (cases[k] || "") + "</td>";
    return h + "</tr>";
  }
  function cpC(ch, cls) { return ch === "" ? "" : '<span class="' + cls + '">' + ch + "</span>"; }
  function etPose(op) {
    var n = op.match(/\d+/g).map(Number), L, h = "", k, i;
    if (op.indexOf("x") >= 0) {
      var a = n[0], b = n[1], tot = a * b, bu = b % 10, bd = Math.floor(b / 10);
      L = Math.max(String(tot).length, String(a).length + (bd ? 1 : 0), String(b).length);
      var A = cpChiffres(a, L), ret = function (m) { var r = [], c = 0; for (var k = 0; k < String(a).length - 1; k++) { c = Math.floor((+A[k] * m + c) / 10); r[k + 1] = c; } return r; };
      if (!bd) {                                                   // CAL5 : couleur par colonne
        var r1 = ret(bu);
        h += cpLigne(L, r1.map(function (c, k) { return c ? '<span class="cp-ret ' + cpCol(k) + '">' + c + "</span>" : ""; }), "", "cp-rets");
        h += cpLigne(L, A.map(function (c, k) { return cpC(c, cpCol(k)); }));
        h += cpLigne(L, cpChiffres(b, L).map(function (c, k) { return cpC(c, cpCol(k)); }), "×", "cp-trait");
        h += cpLigne(L, cpChiffres(tot, L).map(function (c, k) { return cpC(c, cpCol(k)); }), "", "cp-res");
      } else {                                                     // CAL6 : ligne des unités en bleu, ligne des dizaines en rouge
        var ru = ret(bu), rd = ret(bd), p1 = a * bu, p2 = a * bd * 10;
        h += cpLigne(L, rd.map(function (c) { return c ? '<span class="cp-ret cp-d">' + c + "</span>" : ""; }), "", "cp-rets");
        h += cpLigne(L, ru.map(function (c) { return c ? '<span class="cp-barre">' + c + "</span>" : ""; }), "", "cp-rets");
        h += cpLigne(L, A.map(function (c) { return cpC(c, "cp-n"); }));
        h += cpLigne(L, cpChiffres(b, L).map(function (c, k) { return cpC(c, k === 0 ? "cp-u" : "cp-d"); }), "×", "cp-trait");
        h += cpLigne(L, cpChiffres(p1, L).map(function (c) { return cpC(c, "cp-u"); }));
        h += cpLigne(L, cpChiffres(p2, L).map(function (c, k) { return cpC(c, k === 0 ? "cp-zero" : "cp-d"); }), "+", "cp-trait");
        h += cpLigne(L, cpChiffres(tot, L).map(function (c) { return cpC(c, "cp-n"); }), "", "cp-res");
      }
      return '<table class="cp" aria-label="Calcul posé">' + h + "</table>";
    }
    if (op.indexOf("-") >= 0) {                                    // CAL2 : par compensation
      var x = n[0], y = n[1], X, Y, R = [], haut = [], bas = [], c = 0;
      L = String(x).length; X = cpChiffres(x, L); Y = cpChiffres(y, L);
      for (k = 0; k < L; k++) {
        var hx = +X[k], by = (Y[k] === "" ? 0 : +Y[k]) + c, emprunt = hx < by;
        haut[k] = (emprunt ? '<sup class="cp-pref ' + cpCol(k + 1) + '">1</sup>' : "") + cpC(X[k], cpCol(k));
        bas[k] = (c ? '<sup class="cp-pref ' + cpCol(k) + '">1+</sup>' : "") + cpC(Y[k], cpCol(k));
        R[k] = (emprunt ? hx + 10 : hx) - by; c = emprunt ? 1 : 0;
      }
      var res = String(x - y);
      h += cpLigne(L, haut, "", "cp-haut");
      h += cpLigne(L, bas, "−", "cp-trait");
      h += cpLigne(L, R.map(function (d, k) { return k < res.length ? cpC(String(d), cpCol(k)) : ""; }), "", "cp-res");
      return '<table class="cp cp--sous" aria-label="Calcul posé">' + h + "</table>";
    }
    var tot2 = n.reduce(function (p, q) { return p + q; }, 0), rets = [], cc = 0;   // CAL1 : addition
    L = String(tot2).length;
    var lignes = n.map(function (v) { return cpChiffres(v, L); });
    for (k = 0; k < L; k++) { var sm = cc; lignes.forEach(function (l) { sm += l[k] === "" ? 0 : +l[k]; }); cc = Math.floor(sm / 10); rets[k + 1] = cc; }
    h += cpLigne(L, rets.map(function (c, k) { return c && k < Math.max.apply(null, n.map(function (v) { return String(v).length; })) ? '<span class="cp-ret ' + cpCol(k) + '">' + c + "</span>" : ""; }), "", "cp-rets");
    for (i = 0; i < lignes.length; i++) h += cpLigne(L, lignes[i].map(function (c, k) { return cpC(c, cpCol(k)); }), i ? "+" : "", i === lignes.length - 1 ? "cp-trait" : "");
    h += cpLigne(L, cpChiffres(tot2, L).map(function (c, k) { return cpC(c, cpCol(k)); }), "", "cp-res");
    return '<table class="cp" aria-label="Calcul posé">' + h + "</table>";
  }
  function etResultat(op) {
    var n = op.match(/\d+/g).map(Number), joli = op.replace(/ x /g, " × ").replace(/ - /g, " − ");
    if (op.indexOf(":") >= 0) { var q = Math.floor(n[0] / n[1]), r = n[0] % n[1];
      return '<span class="ec-op">' + esc(joli) + "</span>" + (r ? ' <span class="ec-fl">→</span> <b>' + n[0] + " = (" + n[1] + " × " + q + ") + " + r + '</b><small>quotient ' + q + ", reste " + r + "</small>" : " = <b>" + q + "</b>"); }
    var v = op.indexOf("x") >= 0 ? n[0] * n[1] : op.indexOf("-") >= 0 ? n[0] - n[1] : n.reduce(function (a, b) { return a + b; }, 0);
    return '<span class="ec-op">' + esc(joli) + "</span> = <b>" + exMille(v) + "</b>";
  }
  function pageEnsCorriges() {
    var k = ET_CORR, s = ETOILES[k];
    return ensEntete("Corrigés des étoiles de calcul") +
      '<div class="coco-row et-outils">' + etBascule("calcul", "corr") + '<a class="coco-btn coco-btn--secondaire" href="#ens-etoiles">← Tableau de suivi</a></div>' +
      etChoix(ETOILES, k) +
      '<div class="ec-tete">' + etEtoile(s[1], false, true) + "<p><b>Étoile " + s[0].toLowerCase() + "</b> · " + s[2] + "</p>" + '<img class="ec-perso" src="' + POSE("mei", "reflechit") + '" alt=""></div>' +
      '<div class="ec-evals">' + ET_EVAL[k].map(function (ops, i) { return '<section class="ec-eval"><h2>Évaluation ' + (i + 1) + "</h2><ol>" + ops.map(function (op, j) { var cle = i + "-" + j, ouvert = ET_POSE[cle], div = op.indexOf(":") >= 0; return "<li>" + etResultat(op) + (div ? "" : '<button type="button" class="ec-voir" data-action="et-pose" data-v="' + cle + '" aria-expanded="' + !!ouvert + '">' + (ouvert ? "Cacher le calcul posé" : "Voir le calcul posé") + "</button>" + (ouvert ? etPose(op) : "")) + "</li>"; }).join("") + "</ol></section>"; }).join("") + "</div>";
  }
  /* Fiches à imprimer des étoiles de calcul (D-131, demande de l’enseignante) : pour chaque étoile, une feuille A4 avec les entraînements 1 à 6
     (une fois chacun) et une feuille avec les évaluations 1 à 3 en double, 6 cartes par feuille, en noir et blanc. Calculs repris du fichier
     de la classe « Étoiles de calcul » [CLASSE] (registre D24), entraînements extraits du PDF et vérifiés (cartes doublées identiques).
     Les PDF téléchargés sont produits à l’avance par outils/fiches_etoiles.js (dans 4-site/pdf/etoiles-calcul/) à partir de ces mêmes pages. */
  var ET_ENT = [[["34 + 46", "62 + 87", "458 + 79", "65 + 193"], ["156 + 67", "83 + 249", "394 + 265", "649 + 273"], ["364 + 496", "682 + 817", "538 + 75 + 37", "47 + 146 + 89"], ["35 + 46 + 519", "62 + 718 + 93", "58 + 796 + 335", "657 + 18 + 340"], ["47 + 375 + 934", "831 + 296 + 62", "394 + 195 + 616", "649 + 273 + 305"], ["364 + 496 + 562", "682 + 817 + 126", "538 + 759 + 81", "72 + 146 + 918"]], [["456 + 98 + 142", "623 + 871 + 206", "1048 + 45", "67 + 2932"], ["1956 + 76", "83 + 2149", "3694 + 369", "845 + 2973"], ["3364 + 490", "817 + 1234", "5138 + 2259 + 471", "347 + 1946 + 3185"], ["3354 + 2446 + 976", "6962 + 875 + 1093", "4589 + 2905", "2365 + 1935"], ["1956 + 6347", "8123 + 2349", "3946 + 1975 + 431", "6149 + 287 + 6435"], ["3364 + 849 + 28", "6812 + 87 + 935", "1538 + 7399 + 1045", "3547 + 1946 + 3188"]], [["326 + 4375 + 96", "98 - 22", "76 - 45", "87 - 63"], ["3097 + 45 + 431", "99 - 56", "268 - 38", "677 - 73"], ["2761 + 3470 + 59", "688 - 71", "538 - 204", "347 - 146"], ["2316 + 49 + 137", "683 - 251", "53 - 24", "34 - 16"], ["329 + 766 + 1564", "60 - 21", "533 - 28", "347 - 62"], ["7603 + 3428 + 1245", "608 - 373", "238 - 169", "771 - 289"]], [["761 - 218", "359 - 185", "1906 - 94", "2341 - 27"], ["4531 - 437", "2657 - 293", "3492 - 861", "6577 - 934"], ["4586 - 643", "1038 - 326", "7645 - 1594", "6540 - 2380"], ["2356 - 1924", "7312 - 3802", "9841 - 7651", "3109 - 1054"], ["2406 - 1285", "6471 - 2290", "8763 - 5495", "5220 - 1137"], ["6710 - 5434", "8436 - 1257", "7528 - 3769", "5013 - 2468"]], [["4298 + 6431 + 345", "68 x 2", "45 x 3", "73 x 5"], ["1604 - 945", "19 x 4", "38 x 5", "95 x 2"], ["289 + 3495 + 6710", "318 x 4", "875 x 3", "906 x 5"], ["4038 - 1246", "543 x 6", "961 x 8", "627 x 5"], ["604 + 96 + 3953", "459 x 7", "178 x 9", "395 x 4"], ["6143 - 2537", "273 x 5", "805 x 7", "689 x 3"]], [["3480 - 1279", "567 x 3", "2761 x 6", "4395 x 4"], ["7562 + 464 + 73", "419 x 5", "3196 x 2", "8012 x 7"], ["3125 - 659", "831 x 8", "1284 x 5", "6703 x 3"], ["5643 + 36 + 874", "456 x 9", "6532 x 6", "4173 x 3"], ["6701 - 1840", "753 x 5", "4865 x 7", "6901 x 4"], ["72 + 5678 + 2067", "433 x 8", "3654 x 2", "5749 x 5"]], [["3456 - 2658", "3782 x 5", "349 x 24", "456 x 53"], ["3451 + 42 + 678", "1897 x 6", "485 x 62", "276 x 37"], ["9412 - 1640", "1684 x 8", "685 x 29", "324 x 56"], ["3658 + 5610 + 916", "4801 x 3", "365 x 42", "708 x 57"], ["6702 - 1784", "9124 x 9", "495 x 36", "378 x 72"], ["471 + 4659 + 63", "2950 x 8", "519 x 63", "859 x 29"]], [["4510 - 1439", "349 x 26", "1856 x 34", "2834 x 57"], ["5638 + 174 + 495", "762 x 36", "1254 x 42", "4513 x 59"], ["4619 - 2794", "978 x 72", "7132 x 38", "2015 x 95"], ["5618 + 1702 + 254", "693 x 63", "7561 x 28", "5180 x 45"], ["3840 - 1942", "745 x 29", "6492 x 36", "3806 x 74"], ["5618 + 8201 + 1578", "461 x 75", "8569 x 26", "1863 x 38"]], [["3756 x 3", "42 : 7", "36 : 4", "21 : 3"], ["4591 - 1856", "49 : 7", "48 : 8", "18 : 2"], ["5721 x 24", "35 : 5", "18 : 6", "32 : 8"], ["6582 + 562 + 4810", "965 : 8", "952 : 9", "747 : 5"], ["5720 x 36", "528 : 3", "837 : 7", "822 : 6"], ["5620 - 3549", "917 : 7", "445 : 6", "831 : 4"]]];
  function efOp(op) { return esc(op).replace(/ x /g, " × ").replace(/ - /g, " − "); }
  function efCarte(k, titre, ops) {
    return '<div class="ef-carte"><div class="ef-tete"><svg class="ef-etoile" viewBox="0 0 100 100" aria-hidden="true"><path d="' + ET_FORME + '"/></svg><p><b>' + ETOILES[k][0].toUpperCase() + "</b><br>" + titre + '</p></div><p class="ef-consigne">Pose et calcule :</p><ul>' +
      ops.map(function (op) { return "<li>" + efOp(op) + "</li>"; }).join("") + "</ul></div>";
  }
  function efFeuilles(k) {
    var e = ET_ENT[k].map(function (ops, i) { return efCarte(k, "Entraînement " + (i + 1), ops); }).join("");
    var v = ET_EVAL[k].map(function (ops, i) { var c = efCarte(k, "Évaluation " + (i + 1), ops); return c + c; }).join("");
    return '<section class="ef-page" aria-label="Étoile ' + ETOILES[k][0].toLowerCase() + ' : entraînements">' + e + '</section><section class="ef-page" aria-label="Étoile ' + ETOILES[k][0].toLowerCase() + ' : évaluations">' + v + "</section>";
  }
  function efFichier(k) { return "pdf/etoiles-calcul/etoile-" + (k + 1) + "-" + ETOILES[k][0].toLowerCase() + ".pdf"; }
  var EF_TOUTES = "pdf/etoiles-calcul/etoiles-de-calcul-les-9-etoiles.pdf";
  function pageEnsFichesEtoiles(tout) {
    var k = ET_CORR, s = ETOILES[k];
    if (tout) return '<div class="ef-pages">' + ETOILES.map(function (_, i) { return efFeuilles(i); }).join("") + "</div>";
    return ensEntete("Fiches à imprimer des étoiles de calcul") +
      '<div class="no-print"><div class="coco-row et-outils">' + etBascule("calcul", "suivi") + '<a class="coco-btn coco-btn--secondaire" href="#ens-suivi">← Suivi des élèves</a><a class="coco-btn coco-btn--secondaire" href="#ens-etoiles">Tableau de suivi</a><a class="coco-btn coco-btn--secondaire" href="#ens-corriges">Corrigés</a></div>' +
      etChoix(ETOILES, k) +
      '<div class="ef-telecharger"><div class="ec-tete">' + etEtoile(s[1], false, true) + "<p><b>Étoile " + s[0].toLowerCase() + "</b> · " + s[2] + "<br>Feuille 1 : entraînements 1 à 6 · Feuille 2 : évaluations 1 à 3 en double</p></div>" +
      '<div class="coco-row"><a class="coco-btn" href="' + efFichier(k) + '" download>Télécharger l’étoile ' + s[0].toLowerCase() + " (PDF, 2 pages)</a>" +
      '<a class="coco-btn coco-btn--secondaire" href="' + EF_TOUTES + '" download>Les 9 étoiles (PDF, 18 pages)</a>' +
      '<button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer directement</button></div></div>' +
      '<p class="et-note">Aperçu des deux feuilles (format A4, cartes à découper) :</p></div>' +
      '<div class="ef-pages">' + efFeuilles(k) + "</div>";
  }
  /* Suivi des élèves (D-123) : un bloc compact par fichier d'étoiles, avec le personnage de la matière (Méi en maths, Léo en français) */
  function etFamille(type) {
    var T = ET_TYPES[type], d = etDonnees(), V = d[T.cle], n = d.eleves.length, v = 0;
    d.eleves.forEach(function (e) { v += Object.keys(V[e.id] || {}).length; });
    return '<article class="et-famille et-famille--' + T.mat + '"><img class="et-famille-perso" src="' + POSE(T.perso, "presente") + '" alt=""><div class="et-famille-corps"><h2>' + T.titre + "</h2>" +
      '<div class="et-famille-etoiles" aria-hidden="true">' + T.liste.map(function (e) { return etEtoile(e[1]); }).join("") + "</div>" +
      "<p>" + T.resume + " · " + (n ? v + " étoile" + (v > 1 ? "s validées" : " validée") : "tableau à remplir") + '</p><div class="coco-row"><a class="coco-btn" href="#' + T.suivi + '">Tableau de suivi</a><a class="coco-btn coco-btn--secondaire" href="#' + T.corr + '">Corrigés</a>' + (type === "calcul" ? '<a class="coco-btn coco-btn--secondaire" href="#ens-etoiles-fiches">Fiches à imprimer</a>' : "") + "</div></div></article>";
  }
  function pageEnsSuivi() {
    var n = etDonnees().eleves.length;
    return ensEntete("Suivi des élèves") + '<p class="et-classe">' + (n ? "<b>" + n + " élève" + (n > 1 ? "s" : "") + "</b> dans la liste (la même pour les deux fichiers d’étoiles)." : "La liste des élèves se remplit dans un des deux tableaux de suivi ; elle sert aux deux.") + "</p>" +
      '<section class="et-familles">' + etFamille("calcul") + etFamille("grammaire") + "</section>" +
      '<section class="ens-vide ens-vide--petit"><p>Le suivi des résultats des activités du site viendra avec la <b>base en ligne</b> : réussites par activité, bilans par séquence, repères pour le livret scolaire unique.</p></section>';
  }
  /* Espace enseignante › Formation (D-114) : organisé comme le sommaire des notes de l’enseignante (Lexique, Didactique générale,
     Mathématiques, Français ; fiches L, D, M, F) ; fiches vides grisées « À venir » ; encadré « Dans le site ». */
  var FO = window.COCO_FORMATION || { domaines: [], fiches: {} };
  /* Fiche de formation « La démarche de Peter Sullivan », sur le modèle des fiches de l’enseignante (tableau Origine / Définition / Utilité, puis sections).
     Contenu tiré de Sullivan & Lilburn, « Activités ouvertes en mathématiques », Chenelière, 2010, partie 1 (chapitres 1 à 4) et présentation de la partie 2,
     reformulé (livre sous droits : pas de longues citations, exemples du livre résumés). Demande de l’enseignante, 09/11/2026. */
  var FO_SULLIVAN = { titre: "La démarche de Peter Sullivan", auteur: "Peter SULLIVAN et Pat LILBURN", ouvrage: "Activités ouvertes en mathématiques. 600 « bonnes » questions pour développer la compréhension en mathématiques (Chenelière, 2010)",
    tableau: [
      ["Origine", "Notion de question ouverte, ou « bonne » question, mûrie au fil de recherches menées par Peter SULLIVAN et David CLARKE, puis mise à l’essai en classe à de nombreuses reprises. Le livre est l’adaptation française de <i>Open-ended Maths Activities</i> (Oxford University Press, 2004)."],
      ["Définition", "Une « bonne » question est une question ouverte qui :<ul><li>demande <b>plus qu’un rappel</b> de faits ou que la répétition d’une procédure ;</li><li>fait <b>apprendre l’élève</b> pendant qu’il y répond, et <b>renseigne l’enseignant</b> sur ce que l’élève comprend ;</li><li>accepte <b>plusieurs réponses</b>.</li></ul>"],
      ["Utilité dans la pratique", "Faire réfléchir, analyser, justifier et résoudre des problèmes inhabituels en mathématiques ; permettre à <b>chaque élève de répondre à son niveau</b> dans une classe hétérogène ; <b>évaluer sans noter</b> la compréhension réelle des notions."]],
    corps: '<h3>Questions fermées et questions ouvertes</h3><p>Une grande partie de ce que dit un enseignant en classe est faite de questions, le plus souvent improvisées. Les auteurs distinguent :</p>' +
      '<ul><li>les <b>questions fermées</b> : elles appellent surtout la mémoire (rappeler un fait, décrire, répéter une procédure) ;</li><li>les <b>questions ouvertes</b> : elles obligent à approfondir la réflexion et à aller au-delà du rappel.</li></ul>' +
      '<p>En français ou en histoire, les enseignants posent facilement des questions ouvertes (interpréter, justifier un avis). En mathématiques, les questions fermées dominent. SULLIVAN et LILBURN proposent d’en faire une place aux questions ouvertes, et en particulier aux « bonnes » questions.</p>' +
      '<h3>Les 3 caractéristiques d’une « bonne » question</h3>' +
      '<p><b>1. Elle demande plus qu’un rappel.</b> En s’appuyant sur la taxonomie de BLOOM, les auteurs notent que la plupart des exercices de mathématiques restent au niveau de la connaissance (se rappeler, reproduire). Une « bonne » question mobilise aussi la compréhension, l’application, l’analyse et la synthèse.<br><i>Exemple du livre :</i> une élève réussit tous ses calculs d’aire et de périmètre de rectangles, mais reste bloquée devant un jardin rectangulaire à clore avec 30 m de grillage, dont il faut trouver l’aire possible. La question révèle qu’elle appliquait des procédures sans avoir compris les notions.</p>' +
      '<p><b>2. L’élève apprend en y répondant, et l’enseignant apprend sur l’élève.</b> En cherchant, l’élève prend conscience de ce qu’il sait et de ce qu’il ne sait pas encore. Dans un exemple sur la mesure de longueurs, des élèves établissent eux-mêmes les règles du mesurage (partir de zéro, ni chevauchement ni espace vide, mesurer en ligne droite). Pour l’enseignant, la « bonne » question devient un <b>outil d’évaluation</b>.</p>' +
      '<p><b>3. Plusieurs réponses sont acceptables.</b> Chacun répond au niveau de sa compréhension, ce qui convient aux classes hétérogènes. À l’élève qui répond vite et en surface, on demande une autre réponse ou une solution plus générale.<br><i>Exemple du livre :</i> au lieu de calculer la moyenne de cinq nombres donnés, on demande quels peuvent être cinq nombres dont la moyenne est 6.</p>' +
      '<h3>Fabriquer ses propres « bonnes » questions</h3><p>Une « bonne » question <b>se prépare à l’avance</b> : elle ne s’improvise pas. Le livre propose deux méthodes en 3 étapes.</p>' +
      '<p><b>Méthode 1 : commencer par la fin</b></p><ol><li>Définir le sujet de la leçon.</li><li>Penser à une question fermée et écrire sa réponse.</li><li>Poser une question qui part de cette réponse.</li></ol>' +
      '<p><i>Exemples du livre :</i> « J’ai compté des objets dans la pièce : il y en a exactement quatre. Qu’ai-je pu compter ? » ; « Le caissier m’a rendu 35 ¢. Qu’ai-je acheté ? »</p>' +
      '<p><b>Méthode 2 : adapter une question conventionnelle</b></p><ol><li>Définir le sujet de la leçon.</li><li>Penser à une question habituelle du manuel.</li><li>La transformer en « bonne » question.</li></ol>' +
      '<p><i>Exemples du livre :</i> « Quelle heure indique ce cadran ? » devient « Quelle heure de la journée préférez-vous ? Indiquez-la sur un cadran. » ; « Combien de longueurs de main mesure ton pupitre ? » devient « Trouve un objet qui mesure trois longueurs de main. »</p>' +
      '<h3>La séance en 4 étapes</h3>' +
      '<p><b>Étape 1 : poser la question.</b> L’écrire au tableau et s’y référer. S’assurer que tous ont compris : faire reformuler par quelques élèves, laisser du temps pour les questions. Expliquer la tâche si besoin, mais <b>ne donner aucune méthode</b> : les élèves cherchent eux-mêmes comment faire.</p>' +
      '<p><b>Étape 2 : laisser chercher, de préférence en petits groupes.</b> Communiquer ses idées fait partie de l’apprentissage, et le groupe évite que l’élève en difficulté attende l’enseignant pour démarrer. Le rôle de l’enseignant est d’observer et d’ajuster :</p>' +
      '<ul><li>trop d’élèves bloqués : arrêter pour une courte mise au point collective ;</li><li>question trop difficile : la <b>simplifier</b>, ou proposer de représenter le problème (matériel, dessin, schéma) ; le matériel concret doit rester disponible ;</li>' +
      '<li>un groupe s’arrête après une réponse : lui demander d’<b>en chercher d’autres</b> ;</li><li>un groupe a tout trouvé : lui faire <b>décrire ses réponses</b>, chercher une régularité ou une règle, ou lui poser une <b>question liée</b> pour aller plus loin ;</li>' +
      '<li>arrêter quand l’intérêt est encore là, après un <b>préavis de 5 minutes</b>, sans attendre que tous les groupes aient fini.</li></ul>' +
      '<p><b>Étape 3 : revoir la question en grand groupe.</b> Chaque groupe donne ses réponses et explique son raisonnement ; on les note au tableau en accordant la même importance à chacun. Devant une réponse erronée, rester bienveillant et <b>chercher la cause de l’erreur</b> : en expliquant, les élèves repèrent souvent leurs erreurs eux-mêmes. Les réponses montrent des niveaux de compréhension différents ; on valorise chacune, puis on demande de préciser.</p>' +
      '<p><b>Étape 4 : faire un résumé.</b> Qu’un élève ait donné la réponse ne veut pas dire que tous ont compris : l’enseignant reprend les <b>éléments clés</b> pour toute la classe, avec des modèles et du matériel, et <b>revient à la question de départ</b>. Il propose ensuite des tâches semblables pour appliquer ce qui a été appris.</p>' +
      '<p>Cette démarche diffère de la leçon où l’enseignant montre une procédure puis la fait appliquer : il accueille toutes les réponses, en reconnaît la valeur, fixe clairement les limites, fait ressortir les contradictions et les idées erronées, et s’appuie sur des réponses partielles pour faire avancer la discussion.</p>' +
      '<h3>Évaluer sans noter</h3><p>Une « bonne » question montre ce que l’élève sait plus que ce qu’il ignore. Qualifier les réponses de « bonnes » ou « mauvaises » n’a pas de sens : les auteurs proposent deux approches complémentaires.</p>' +
      '<p><b>1. La compréhension du contenu mathématique</b> : une échelle globale en 5 niveaux.</p>' +
      '<table class="fo-table"><tbody><tr><th>1</th><td>Ne semble pas comprendre</td></tr><tr><th>2</th><td>A fait un essai, mais manifeste une compréhension limitée</td></tr><tr><th>3</th><td>Manifeste une compréhension acceptable mais incomplète</td></tr><tr><th>4</th><td>Semble clairement comprendre</td></tr><tr><th>5</th><td>Dépasse les attentes</td></tr></tbody></table>' +
      '<p>Si les élèves écrivent, on classe leurs productions dans ces catégories. S’ils manipulent ou dessinent, on tient une liste de la classe avec un espace de commentaires, remplie en les observant. <i>Exemple du livre (6-7 ans) :</i> « Un clown a trois ballons de plus que l’autre. Dessine combien chacun peut en tenir. » Du dessin sans écart de trois, à l’élève qui produit une suite organisée de dessins et explique que seul l’écart compte.</p>' +
      '<p><b>2. Les comportements adoptés</b> pendant la recherche. Exemples de la liste du livre : travaille en coopération ; pose des questions ; travaille de façon autonome ; organise l’information de manière stratégique ; prépare un plan ; explique clairement ses idées ; persévère ; cherche toutes les possibilités ; essaie autre chose quand il piétine ; généralise ; discute avec son groupe ; utilise le matériel quand c’est pertinent ; accepte l’aide des autres ; a confiance en ses capacités ; utilise plusieurs stratégies ; dessine des schémas au besoin ; reste concentré.</p>' +
      '<p>Deux façons de les noter : une feuille par élève avec les comportements à cocher ou à dater, ou un tableau de classe (élèves en lignes, comportements en colonnes) où l’on trace un trait oblique à la première observation, puis une croix quand le comportement devient constant. Conseil des auteurs : <b>observer un ou deux groupes à la fois</b>, pas toute la classe.</p>' +
      '<h3>La banque de questions du livre</h3><p>La partie 2 propose environ 600 « bonnes » questions, avec des notes pour l’enseignant, sur 16 sujets répartis en 4 domaines : le sens des nombres et des opérations, la mesure, la géométrie, la probabilité et la statistique. Chaque sujet a 3 niveaux : débutant (6 à 8 ans), <b>intermédiaire (8 à 10 ans, celui du CE2)</b> et avancé (10 à 12 ans).</p>' +
      '<h3>Liens avec les autres fiches</h3><ul><li><b>Étayage</b> (L1) et <b>ZPD</b> (D3) : simplifier la question pour un groupe bloqué, puis revenir à la question de départ, est une aide temporaire et ajustée.</li><li><b>Variables didactiques</b> (D2) : simplifier une question (des nombres plus petits, une fraction plus simple) ou poser une question liée revient à jouer sur une variable de la situation.</li></ul>',
    site: [["Les problèmes ouverts en mode autonome : l’élève coche ce qu’il a vérifié, range ses solutions et reçoit un coup de pouce (simplifier) ou des relances (aller plus loin).", "#po-coquillages"],
      ["Au TBI, les 4 temps : la question, on cherche (avec minuteur), on met en commun (vérification après l’avis de la classe), on retient.", "#classe-letchis"],
      ["La fiche enseignante de chaque problème : réponses, erreurs à guetter, évaluation en 5 niveaux et comportements à observer.", "#fiche-jus"],
      ["Toutes les séquences et leurs problèmes ouverts.", "#ens-sequences"]] };
  function foPastille(code) { return '<span class="fo-code">' + code + "</span>"; }
  function foCarte(code, f) {
    var lien = f && !f.vide ? "#ens-form-" + code : "";
    var sous = f ? [f.auteur, f.theme && f.theme !== f.titre ? f.theme : "", f.ouvrage ? "« " + f.ouvrage + " »" : ""].filter(Boolean).join(" · ") : "";
    var etat = !f || f.vide ? "À venir" : f.aCompleter ? "À compléter" : "";
    var corps = foPastille(code) + "<span><b>" + (f ? esc(f.titre) : "Fiche " + code) + "</b>" + (sous ? "<small>" + esc(sous) + "</small>" : "") + (f && f.liens ? "<small>" + esc(f.liens.join(" · ")) + "</small>" : "") + (etat ? '<em class="fo-etat">' + etat + "</em>" : "") + "</span>";
    return lien ? '<a class="fo-carte' + (f.synthese ? " fo-carte--synthese" : "") + (f.aCompleter ? " fo-carte--partielle" : "") + '" href="' + lien + '">' + corps + "</a>" : '<span class="fo-carte fo-carte--avenir" aria-disabled="true">' + corps + "</span>";
  }
  function pageEnsFormation() {
    return ensEntete("Formation") +
      '<p class="ens-legende">Vos fiches de formation professionnelle, rangées comme votre sommaire. Les fiches grisées « À venir » restent à rédiger ; « À compléter » : fiche commencée.</p>' +
      FO.domaines.map(function (d) {
        var cartes = []; for (var k = 1; k <= d.n; k++) cartes.push(foCarte(d.id + k, FO.fiches[d.id + k]));
        if (d.id === "M") cartes.push('<a class="fo-carte fo-carte--site" href="#ens-form-sullivan">' + foPastille("★") + "<span><b>La démarche de Peter Sullivan</b><small>Problèmes ouverts · « Activités ouvertes en mathématiques »</small><em class=\"fo-etat fo-etat--site\">Fiche du site</em></span></a>");
        return '<section class="domaine fo-domaine"><h2 class="ens-h2">' + d.nom + '</h2><div class="fo-grille">' + cartes.join("") + "</div></section>";
      }).join("");
  }
  function pageFormationFiche(code) {
    var retour = '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#ens-formation">← Formation</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>';
    var sul = code === "sullivan", f = sul ? FO_SULLIVAN : FO.fiches[code], d = sul ? { nom: "Mathématiques" } : FO.domaines.filter(function (x) { return x.id === code.charAt(0); })[0];
    var tab = f.tableau ? '<table class="fo-table fo-def"><tbody>' + f.tableau.map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + (r[1] || '<span class="fo-vide">À rédiger</span>') + "</td></tr>"; }).join("") + "</tbody></table>" : "";
    return retour + '<article class="fiche fo-fiche' + (sul ? " m-maths" : "") + '"><header class="fo-tete">' + foPastille(sul ? "★" : code) + "<div><small>Formation · " + esc(d.nom) + (sul ? " · Fiche du site" : "") + (f.aCompleter ? " · fiche à compléter" : "") + "</small><h1>" + esc(f.titre) + "</h1>" +
      (f.sousTitre || f.auteur ? '<p class="fo-auteur">' + esc(f.sousTitre || f.auteur) + "</p>" : "") + (f.ouvrage ? '<p class="fo-ouvrage">Ouvrage : <i>' + esc(f.ouvrage) + "</i></p>" : "") + "</div></header>" +
      tab + (f.corps || "") +
      (f.schemas ? '<p class="fo-schemas"><b>Schémas</b> (non repris sur le site, droits d’auteur) : ' + f.schemas.map(esc).join(" ") + "</p>" : "") +
      (f.site ? foSite(f.site) : "") +
      "</article>";
  }
  function foSite(l) { return '<section class="fo-site"><h2>Dans le site</h2><ul>' + l.map(function (x) { return '<li><a href="' + x[1] + '">' + esc(x[0]) + "</a></li>"; }).join("") + '</ul></section>'; }


  /* ---------- banque de problèmes (Vergnaud), reprise du site v0 ---------- */
  var BQ = window.COCO_BANQUE;
  var Bq = { fam: -1, sel: {}, shown: 24, ouverts: {}, vals: {}, res: {} };
  BQ.FILTRES.forEach(function (g) { Bq.sel[g.k] = {}; });
  /* signe écrit dans le cercle : « + » ou « − » (le tiret « - » compte aussi) ; référent en haut : + si l’état comparé (en bas) est le plus grand */
  function bqSigne(x) { var m = String(x || "").trim().match(/^([+\-−–])/); return m ? (m[1] === "+" ? "+" : "−") : ""; }
  /* transformation : + si on gagne ou ajoute, − si on perd ou enlève ; comparaison : référent en haut, + si l’état du bas est le plus grand */
  function bqSigneAttendu(p) { return p.t[0] === "2" ? (p.tr === "p" ? "+" : "−") : (p.ref ? "+" : "−"); }
  function bqAvecSigne(p) { return p.t[0] === "2" || p.t[0] === "3"; }
  function bqNum(x) { var d = String(x || "").replace(/[^\d]/g, ""); return d === "" ? NaN : parseInt(d, 10); }
  function bqAns(p) {
    var v = p.v, t = p.t;
    if (t === "1A") return ["tot", v[2]]; if (t === "1B") return ["pU", v[2]];
    if (t === "2A") return ["f", v[2]]; if (t === "2B") return ["d", v[1]]; if (t === "2C") return ["i", v[0]];
    if (t === "3A") return p.s ? ["big", v[0]] : ["small", v[1]]; if (t === "3B") return ["d", v[2]];
    if (t[0] === "4") return ["prod", v[2]]; return t === "5A" ? ["left", v[1]] : ["top", v[0]];
  }
  function bqAttendu(p) {
    var v = p.v, t = p.t;
    if (t === "1A") return { g: [["pA", "pB", v[0], v[1]]], e: { tot: v[2] } };
    if (t === "1B") return { g: [], e: { pK: v[1], pU: v[2], tot: v[0] } };
    if (t[0] === "2") return { g: [], e: { i: v[0], d: v[1], f: v[2] } };
    /* comparaison : chaque état à sa place (référent en haut) ; plus d’échange possible entre le haut et le bas */
    if (t[0] === "3") return { g: [], e: v[0] == null ? { d: v[2] } : { big: v[0], small: v[1], d: v[2] } };
    if (t[0] === "4") return { g: [["top", "left", v[0], v[1]]], e: { prod: v[2] } };
    return { g: [], e: { top: v[0], left: v[1], prod: v[2] } };
  }
  function bqVerifier(id) {
    var p = BQ.P[id], E = bqAttendu(p), V = Bq.vals[id] || {}, tout = true, k;
    for (k in E.e) if (bqNum(V[k]) !== E.e[k]) tout = false;
    E.g.forEach(function (x) { var a = bqNum(V[x[0]]), b = bqNum(V[x[1]]); if (!((a === x[2] && b === x[3]) || (a === x[3] && b === x[2]))) tout = false; });
    var ans = bqAns(p);
    /* comparaison : l’élève écrit lui-même + ou − dans le cercle (demande de l’enseignante, 09/11/2026) */
    if (p.t[0] === "3" && !tout && p.v[0] != null && bqNum(V.big) === p.v[1] && bqNum(V.small) === p.v[0] && bqNum(V.d) === p.v[2]) { Bq.res[id] = "place"; return; }
    if (tout && bqAvecSigne(p) && bqSigne(V.d) !== bqSigneAttendu(p)) { Bq.res[id] = "signe"; return; }
    Bq.res[id] = tout ? "ok" : (bqNum(V[ans[0]]) === ans[1] ? "part" : "no");
  }
  /* schémas : mêmes géométries que le site v0 (schéma de Vergnaud, barres, tableau) */
  function bqSchemas(p) {
    var en = langue === "en", t = p.t, A = bqAns(p)[0], out = [], S = [];
    var L = { verg: en ? "Vergnaud diagram" : "Schéma de Vergnaud", bars: en ? "Bar model" : "Schéma en barres", start: en ? "start" : "début", end: en ? "end" : "fin", time: en ? "Timeline" : "Ligne du temps", kn: en ? "known" : "connu", bar: en ? "Table" : "Tableau" };
    var tx = function (x, y, s) { return '<text x="' + x + '" y="' + y + '" class="bq-tx">' + s + "</text>"; };
    var bx = function (x, y, w, h, k) { S.push({ k: k, x: x, y: y, w: w, h: h, ph: k === A ? "?" : "" }); return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" class="bq-b' + (k === A ? " bq-u" : "") + '"/>'; };
    var ci = function (x, y, r, k) { var w = r * 1.8, h = r * 1.3; S.push({ k: k, x: x - w / 2, y: y - h / 2, w: w, h: h, ph: k === A ? "?" : "" }); return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="bq-b' + (k === A ? " bq-u" : "") + '"/>'; };
    var lb = function (k, x, y, w, h, ph) { S.push({ k: k, x: x, y: y, w: w, h: h, ph: k === A ? "?" : ph }); return ""; };
    var fl = function (x1, y1, x2, y2) { var a = Math.atan2(y2 - y1, x2 - x1), q = function (d) { return (x2 - 10 * Math.cos(a + d)) + "," + (y2 - 10 * Math.sin(a + d)); }; return '<path d="M' + x1 + " " + y1 + "L" + x2 + " " + y2 + '" class="bq-ar"/><polygon points="' + x2 + "," + y2 + " " + q(.45) + " " + q(-.45) + '" class="bq-pointe"/>'; };
    var svg = function (b, lab, H) { H = H || 130; out.push({ svg: '<svg viewBox="0 0 320 ' + H + '" role="img" aria-label="' + lab + '">' + b + "</svg>", S: S, H: H }); S = []; };
    if (t === "1A" || t === "1B") {
      var k1 = t === "1A" ? "pA" : "pK", k2 = t === "1A" ? "pB" : "pU";
      svg(bx(14, 14, 38, 38, k1) + bx(14, 64, 38, 38, k2) + '<path d="M60 14Q70 14 70 30V46Q70 58 80 58Q70 58 70 70V86Q70 102 60 102" class="bq-ar"/>' + bx(88, 40, 38, 38, "tot") + bx(168, 22, 128, 32, "tot") + bx(168, 54, 64, 32, k1) + bx(232, 54, 64, 32, k2) + tx(78, 124, L.verg) + tx(232, 124, L.bars), L.verg);
    } else if (t[0] === "2") {
      svg(bx(14, 56, 42, 42, "i") + fl(56, 77, 262, 77) + ci(160, 50, 27, "d") + bx(264, 56, 42, 42, "f") + tx(160, 124, L.verg), L.verg);
      if (t === "2B" && p.n === 4) {
        var tk = ""; for (var x = 76; x <= 250; x += 34) tk += '<path d="M' + x + ' 71V83" class="bq-ar"/>';
        svg(bx(14, 50, 42, 42, "i") + bx(264, 50, 42, 42, "f") + fl(56, 71, 262, 71) + tk + ci(160, 26, 26, "d") + '<path d="M160 52V71" class="bq-ar"/>' + tx(35, 112, L.start) + tx(285, 112, L.end) + tx(160, 124, L.time), L.time);
      }
    } else if (t[0] === "3") {
      /* référent en haut, état comparé en bas, cercle toujours à droite (p.ref : voir banque.js) */
      var kH = p.ref ? "small" : "big", kB = p.ref ? "big" : "small";
      svg(bx(139, 6, 42, 42, kH) + fl(160, 48, 160, 82) + ci(210, 66, 27, "d") + bx(139, 84, 42, 42, kB), L.verg);
    } else {
      var mult = t[0] === "4", g = '<rect x="76" y="30" width="220" height="88" class="bq-b"/>';
      for (var i = 1; i < 5; i++) g += '<path d="M' + (76 + 44 * i) + ' 30V118" class="' + (mult ? "bq-gd" : "bq-gs") + '"/>';
      for (var j = 1; j < 4; j++) g += '<path d="M76 ' + (30 + 22 * j) + 'H296" class="' + (mult ? "bq-gd" : "bq-gs") + '"/>';
      lb("top", 136, 3, 100, 24, L.kn); lb("left", 4, 62, 66, 26, L.kn); lb("prod", 156, 64, 60, 26, mult ? "" : L.kn); /* la division a aussi besoin du total (D-87) */
      svg(g, L.bar);
    }
    return out;
  }
  function bqSchema(p) {
    var id = p.i, V = Bq.vals[id] || {}, r = Bq.res[id], en = langue === "en";
    var w = bqSchemas(p).map(function (o) {
      return '<div class="bq-sw">' + o.svg + o.S.map(function (s) {
        return '<input class="bq-in' + (s.ph === "?" ? " bq-inc" : "") + '" data-bq="' + id + '" data-k="' + s.k + '" value="' + esc(V[s.k] || "") + '" placeholder="' + s.ph + '" inputmode="' + (bqAvecSigne(p) && s.k === "d" ? "text" : "numeric") + '" autocomplete="off" aria-label="' + (en ? "Write a number" : "Écris un nombre") + '" style="left:' + (s.x / 3.2).toFixed(2) + "%;top:" + (s.y / o.H * 100).toFixed(2) + "%;width:" + (s.w / 3.2).toFixed(2) + "%;height:" + (s.h / o.H * 100).toFixed(2) + '%">';
      }).join("") + "</div>";
    }).join("");
    var msg = "";
    if (r === "ok") msg = retour("bravo", t("bravo"), en ? "You found the answer, and your model is right." : "Tu as trouvé la réponse, et ton schéma est juste.");
    else if (r === "part") msg = retour("revoir", en ? "Almost!" : "Presque !", en ? "The answer is right! Check the other boxes of the model." : "La réponse est juste ! Vérifie les autres cases du schéma.");
    else if (r === "place") msg = retour("revoir", en ? "Almost!" : "Presque !", en ? "The numbers are right, but two of them are in the wrong place. At the top, write the amount we compare to." : "Les nombres sont justes, mais deux sont échangés. En haut, écris la quantité à laquelle on compare.");
    else if (r === "signe") msg = retour("revoir", en ? "Almost!" : "Presque !", en ? (p.t[0] === "2" ? "The numbers are right! Check the sign in the circle: + if we gain or add, − if we lose or take away." : "The numbers are right! Check the sign in the circle: + if the bottom box has more, − if it has less.") : (p.t[0] === "2" ? "Les nombres sont justes ! Vérifie le signe dans le cercle : + si on gagne ou si on ajoute, − si on perd ou si on enlève." : "Les nombres sont justes ! Vérifie le signe dans le cercle : + si la case du bas a plus, − si elle a moins."));
    else if (r === "no") msg = retour("revoir", t("pasEncore"), en ? "Read the problem again. What is the question? Where does the number you are looking for go in the model?" : "Relis l'énoncé. Quelle est la question ? Où va le nombre cherché dans le schéma ?");
    return w + '<p class="bq-aide">' + (en ? "Fill in the model with the numbers from the problem. The <b>?</b> box is the answer." : "Complète le schéma avec les nombres de l'énoncé. La case <b>?</b> est la réponse.") + (bqAvecSigne(p) ? (en ? " In the circle, write <b>+</b> or <b>−</b> before the number." : " Dans le cercle, écris <b>+</b> ou <b>−</b> devant le nombre.") : "") + "</p>" +
      '<div class="coco-row"><button class="coco-btn" type="button" data-action="bq-verifier" data-v="' + id + '">' + t("valider") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="bq-effacer" data-v="' + id + '">' + (en ? "Clear" : "Effacer") + "</button></div>" + msg;
  }
  function bqGarde(p) {
    if (Bq.fam >= 0 && BQ.TYPES[p.t].f !== Bq.fam) return false;
    return BQ.FILTRES.every(function (g) { var s = Bq.sel[g.k], ks = Object.keys(s).filter(function (x) { return s[x]; }); return !ks.length || (p[g.k] !== undefined && s[String(p[g.k])]); });
  }
  function pageBanque() {
    var m = MATIERE.maths, en = langue === "en", li = en ? 1 : 0;
    var liste = BQ.P.filter(bqGarde), vis = liste.slice(0, Bq.shown);
    var fams = '<button class="bq-fam" type="button" data-action="bq-fam" data-v="-1" aria-pressed="' + (Bq.fam === -1) + '">' + (en ? "All the problems" : "Tous les problèmes") + "</button>" +
      BQ.FAM.map(function (f, i) { var perso = BQ.WHO[Object.keys(BQ.TYPES).filter(function (k) { return BQ.TYPES[k].f === i; })[0]]; return '<button class="bq-fam" type="button" data-action="bq-fam" data-v="' + i + '" aria-pressed="' + (Bq.fam === i) + '"><img src="' + IMG(perso) + '" alt="">' + f[li] + "</button>"; }).join("");
    var nivs = [1, 2, 3, 4].map(function (n) { return '<button class="bq-niv" type="button" data-action="bq-filtre" data-k="n" data-v="' + n + '" aria-pressed="' + !!Bq.sel.n[n] + '">' + (en ? "Level " : "Niveau ") + n + (n === 4 ? (en ? " · challenge" : " · défi") : "") + "</button>"; }).join("");
    var reglages = BQ.FILTRES.filter(function (g) { return g.k !== "n"; }).map(function (g) {
      return '<fieldset class="bq-groupe"><legend>' + g[langue] + '</legend><div class="coco-row">' + g.o.filter(function (o) { return BQ.P.some(function (p) { return String(p[g.k]) === String(o); }); }).map(function (o) {
        var nb = BQ.P.filter(function (p) { return String(p[g.k]) === String(o); }).length;
        return '<button class="bq-chip" type="button" data-action="bq-filtre" data-k="' + g.k + '" data-v="' + o + '" aria-pressed="' + !!Bq.sel[g.k][o] + '">' + esc(g.l(o)[li]) + " <small>" + nb + "</small></button>";
      }).join("") + "</div></fieldset>";
    }).join("");
    var tSel = Object.keys(Bq.sel.t).filter(function (k) { return Bq.sel.t[k]; });
    var notes = tSel.length === 1 && BQ.NOTES[tSel[0]] ? '<div class="bq-notes"><h3>Repères didactiques · ' + tSel[0] + " " + esc(BQ.TYPES[tSel[0]].fr) + "</h3>" + BQ.NOTES[tSel[0]].map(function (x) {
      return "<div>" + esc(x.trim()).replace(/^(Enjeu|Schématisation|Progression fréquente|Difficultés souvent rencontrées|Forme prototypique|Forme moins prototypique|NIVEAU 4)\s*$/gm, "<b>$1</b>").replace(/\n/g, "<br>") + "</div>";
    }).join("") + "</div>" : '<p class="po-note">Choisis un seul type de problème pour voir ses repères didactiques.</p>';
    var cartes = vis.map(function (p) {
      var T = BQ.TYPES[p.t], ouvert = Bq.ouverts[p.i];
      return '<article class="bq-carte"><header><img src="' + IMG(BQ.WHO[p.t]) + '" alt=""><div><b>' + p.t + " · " + esc(T[langue]) + '</b><small>' + (en ? "Level " : "Niveau ") + p.n + (p.n === 4 ? ' · <span class="bq-defi">' + (en ? "Challenge!" : "Défi !") + "</span>" : "") + "</small></div></header>" +
        '<p class="bq-enonce">' + esc(p[langue] || p.fr).replace(/(\d) (\d{3})/g, "$1\u00a0$2") + "</p>" +
        '<button class="coco-btn coco-btn--secondaire" type="button" data-action="bq-ouvrir" data-v="' + p.i + '" aria-expanded="' + !!ouvert + '">' + (ouvert ? (en ? "Hide the model" : "Cacher le schéma") : (en ? "Fill in the model" : "Compléter le schéma")) + "</button>" +
        (ouvert ? '<div class="bq-schema">' + bqSchema(p) + "</div>" : "") + "</article>";
    }).join("");
    return barre("maths") + '<section class="entete m-maths"><img src="' + IMG("mei") + '" alt=""><div><h1>' + (en ? "Problem bank" : "Banque de problèmes") + "</h1><p>" + (en ? "Choose a type of problem, fill in the model, then check." : "Choisis un type de problème, complète le schéma, puis vérifie.") + "</p></div></section>" +
      '<section class="bq-choix"><div class="bq-fams">' + fams + '</div><div class="bq-nivs">' + nivs + "</div></section>" +
      '<details class="bq-reglages"' + (Bq.reglagesOuverts ? " open" : "") + '><summary data-action="bq-reglages">Pour la maîtresse : variables didactiques et repères</summary>' + reglages +
      '<div class="coco-row"><button class="coco-btn coco-btn--secondaire" type="button" data-action="bq-tout">Tout afficher</button></div>' + notes + "</details>" +
      '<p class="bq-compte" aria-live="polite">' + liste.length + (en ? " problem" + (liste.length > 1 ? "s" : "") + " out of " : " problème" + (liste.length > 1 ? "s" : "") + " sur ") + BQ.P.length + "</p>" +
      (liste.length ? '<div class="bq-grille">' + cartes + "</div>" : '<p class="po-note">' + (en ? "No problem matches. Remove a filter." : "Aucun problème ne correspond. Retire un filtre.") + "</p>") +
      (liste.length > Bq.shown ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="bq-plus" style="justify-self:center">' + (en ? "Show more (" : "Voir plus (") + (liste.length - Bq.shown) + ")</button>" : "");
  }
  function actionBanque(a, el) {
    var v = el.dataset.v;
    if (a === "bq-fam") { Bq.fam = +v; Bq.shown = 24; }
    else if (a === "bq-filtre") { var s = Bq.sel[el.dataset.k]; s[v] = !s[v]; Bq.shown = 24; }
    else if (a === "bq-tout") { Bq.fam = -1; BQ.FILTRES.forEach(function (g) { Bq.sel[g.k] = {}; }); Bq.shown = 24; }
    else if (a === "bq-plus") Bq.shown += 24;
    else if (a === "bq-ouvrir") Bq.ouverts[v] = !Bq.ouverts[v];
    else if (a === "bq-verifier") bqVerifier(+v);
    else if (a === "bq-effacer") { delete Bq.vals[v]; delete Bq.res[v]; }
    else if (a === "bq-reglages") { Bq.reglagesOuverts = !Bq.reglagesOuverts; }
  }
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el.dataset || el.dataset.bq === undefined) return;
    var id = el.dataset.bq; (Bq.vals[id] = Bq.vals[id] || {})[el.dataset.k] = el.value;
    if (Bq.res[id]) { delete Bq.res[id]; var c = el.closest(".bq-schema"), r = c && c.querySelector(".coco-retour"); if (r) r.remove(); }
  });
  document.addEventListener("keydown", function (e) {
    var el = e.target; if (e.key !== "Enter" || !el.dataset || el.dataset.bq === undefined) return;
    bqVerifier(+el.dataset.bq); rendre();
  });

  /* ==========================================================================================
     Séquence « L’imparfait » (demande de l’enseignante, 09/11/2026)
     Leçons de classe CONJ13 « L’imparfait des verbes du 1er groupe » et CONJ14 « L’imparfait » (2023, à jour) : phrases reprises mot pour mot.
     Programmation P5 de la classe, semaines 3 et 4 (du 9 au 20 novembre 2026) : objectifs opérationnels des séances.
     Compagnon : Léo (choix de l’enseignante). Code des leçons : verbe et terminaisons en rouge, pronoms en violet.
     Les textes et les phrases d’exercices sont écrits pour le site.
     ========================================================================================== */
  var IP_T = ["ais", "ais", "ait", "ions", "iez", "aient"];
  var IP_PRON = ["je", "tu", "il, elle, on", "nous", "vous", "ils, elles"];
  /* radical et complément pour les phrases d’exercices */
  var IP_V = {
    jouer: ["jou", "au ballon"], chanter: ["chant", "une chanson"], danser: ["dans", "sur la plage"], marcher: ["march", "jusqu’à l’école"], regarder: ["regard", "les étoiles"],
    parler: ["parl", "avec la maîtresse"], habiter: ["habit", "à Nouméa"], écouter: ["écout", "une histoire"], aimer: ["aim", "les mangues"], porter: ["port", "un chapeau"],
    sauter: ["saut", "dans les vagues"], préparer: ["prépar", "un gâteau"],
    être: ["ét", "à la plage"], avoir: ["av", "un chien"], aller: ["all", "à l’école"], venir: ["ven", "à la fête"], vouloir: ["voul", "un vélo"], prendre: ["pren", "le bus"],
    dire: ["dis", "bonjour"], pouvoir: ["pouv", "nager"], voir: ["voy", "la mer"], faire: ["fais", "un dessin"]
  };
  var IP_G1 = ["jouer", "chanter", "danser", "marcher", "regarder", "parler", "habiter", "écouter", "aimer", "porter", "sauter", "préparer"];
  var IP_EA = ["être", "avoir"], IP_IRR = ["aller", "venir", "vouloir", "prendre", "dire", "pouvoir", "voir", "faire"];
  var IP_LECON = ["chanter", "être", "venir", "aller", "avoir", "vouloir", "prendre", "dire", "pouvoir", "voir", "faire"]; /* les verbes de CONJ14, dans l’ordre de la leçon */
  var IP_SUJ = [[["Je"], 0], [["Tu"], 1], [["Léo", "Méi", "Kakou", "On", "Il", "Elle"], 2], [["Nous"], 3], [["Vous"], 4], [["Les enfants", "Mes cousins", "Tehani et Nina", "Ils", "Elles"], 5]];
  function ipForme(v, p) { return IP_V[v][0] + IP_T[p]; }
  function ipVoy(s) { return /^[aeéèêiouyh]/i.test(s); }
  function ipJe(f, maj) { return ipVoy(f) ? (maj ? "J’" : "j’") : (maj ? "Je " : "je "); }
  /* le pronom écrit devant la forme (« j’ » devant une voyelle) */
  function ipPron(p, f) { return p === 0 ? ipJe(f).trim() : IP_PRON[p]; }
  function ipCol(v, p) { return esc(IP_V[v][0]) + '<span class="coco-term">' + IP_T[p] + "</span>"; }
  function ipPronCol(p, f) { return '<span class="ip-pron">' + esc(ipPron(p, f)) + "</span>"; }
  /* tableau de conjugaison : pronom en violet, radical, terminaison en rouge ; o.pop = apparition ligne par ligne */
  function ipTable(v, o) {
    o = o || {};
    return '<table class="ip-table"><caption>' + esc(v) + "</caption>" + IP_T.map(function (_, p) { var f = ipForme(v, p), apo = p === 0 && ipVoy(f), lig = '<td class="ip-tp' + (apo ? " ip-apo" : "") + '">' + ipPronCol(p, f) + "</td><td" + (apo ? ' class="ip-apo2"' : "") + ">" + ipCol(v, p) + "</td>"; /* « j’étais » sans espace */
      return "<tr" + (o.pop ? ' class="ip-ligne" style="animation-delay:' + (0.2 + p * 0.3) + 's"' : "") + ">" + lig + "</tr>"; }).join("") + "</table>";
  }
  /* une phrase : sujet + verbe à l’imparfait + complément */
  function ipSujet(p) { var s = IP_SUJ.filter(function (x) { return x[1] === p; })[0][0]; return HE.pk(s); }
  function ipPhrase(v, p, suj, forme) { var f = forme || ipForme(v, p); suj = suj || ipSujet(p); return (suj === "Je" ? ipJe(f, true) : suj + " ") + f + " " + IP_V[v][1] + "."; }
  /* petits textes (contes, souvenirs) : les verbes à l’imparfait sont entre crochets ; {…} = verbe au présent (niveau 3) [PROPOSITION] */
  var IP_TEXTES = [
    "Il [était] une fois une sorcière. Elle [habitait] dans une grotte. Elle [avait] un grand chapeau noir. Le soir, elle [préparait] des potions.",
    "Autrefois, Papi Tao [pêchait] dans le lagon. Il [partait] tôt le matin. Les poissons [nageaient] autour de sa pirogue.",
    "Quand j’[étais] petit, je [jouais] sur la plage. Mes cousins [construisaient] des châteaux de sable. Nous [mangions] des mangues.",
    "Le cagou [vivait] dans la forêt. Il [cherchait] des vers sous les feuilles. Ses plumes [étaient] grises.",
    "Hier soir, il [pleuvait]. Les enfants [restaient] à la maison. Ils [regardaient] un film et ils [riaient]."
  ];
  var IP_TEXTES3 = [
    "Aujourd’hui, Léo {habite} à Nouméa. Avant, il [habitait] à Lifou. Il [allait] à l’école à pied et il [nageait] souvent. Maintenant, il {prend} le bus.",
    "Ce matin, Méi {lit} un conte. Dans ce conte, une princesse [vivait] dans un château. Elle [avait] un dragon. Méi {adore} cette histoire !",
    "Quand ma grand-mère [était] petite, elle [faisait] ses devoirs à la bougie. Elle [allait] chercher l’eau à la rivière. Aujourd’hui, nous {avons} l’électricité."
  ];
  function ipTexteMots(s) { /* pour le jeu « mots » : liste des mots et index des verbes à l’imparfait */
    var mots = [], v = [];
    s.split(" ").forEach(function (w) { var m = w.match(/^(.*?)\[([^\]]+)\](.*)$/); if (m) { v.push(mots.length); mots.push(m[1] + m[2] + m[3]); } else mots.push(w.replace(/[{}]/g, "")); });
    return { mots: mots, v: v };
  }
  function ipVerbesDe(s) { return (s.match(/\[([^\]]+)\]/g) || []).map(function (x) { return x.slice(1, -1); }); }
  function ipNorm(s) { return String(s || "").trim().toLowerCase().replace(/[’`´]/g, "'").replace(/\s+/g, " ").replace(/\.$/, ""); }

  C.imparfait = { matiere: "francais", titre: { fr: "L’imparfait", en: "The imparfait" }, objectif: { fr: "Je sais reconnaître et conjuguer les verbes à l’imparfait.", en: "I can recognise and conjugate verbs in the imparfait." } };

  /* ---------- activités (moteur commun) ---------- */
  QUIZ.imparfait = { matiere: "francais", jeux: {
    rappel: { perso: "leo", etape: 0, fr: "Je me rappelle", en: "I remember", dfr: "Passé, présent, futur ; le radical ; les pronoms.", den: "Past, present, future; the stem; pronouns.",
      gen: function () { return [
        { t: "choix", c: { fr: "« Hier, il pleuvait. » Cette phrase parle…", en: "« Hier, il pleuvait. » This sentence is about…" }, o: [{ fr: "du passé", en: "the past" }, { fr: "du présent", en: "the present" }, { fr: "du futur", en: "the future" }], a: 0,
          ex: { fr: "« Hier » : c’est déjà passé. L’action s’est déjà déroulée (leçon CONJ1).", en: "« Hier » (yesterday): it has already happened (lesson CONJ1)." } },
        { t: "choix", c: { fr: "Quel est le <b>radical</b> du verbe « chanter » ?", en: "What is the <b>stem</b> of the verb « chanter »?" }, o: [{ fr: "chant-", en: "chant-" }, { fr: "chanter", en: "chanter" }, { fr: "-er", en: "-er" }], a: 0,
          ex: { fr: "chanter = chant- + -er : le radical est « chant- », -er est la marque de l’infinitif (leçon CONJ3).", en: "chanter = chant- + -er: the stem is « chant- » (lesson CONJ3)." } },
        { t: "choix", c: { fr: "Quel pronom remplace « Tehani et Nina » ?", en: "Which pronoun replaces « Tehani et Nina »?" }, o: [{ fr: "elles", en: "elles" }, { fr: "nous", en: "nous" }, { fr: "elle", en: "elle" }], a: 0,
          ex: { fr: "Tehani et Nina : deux filles, c’est « elles ».", en: "Tehani and Nina: two girls, so « elles »." } }
      ]; } },
    texte: { perso: "leo", etape: 1, fr: "Il était une fois…", en: "Once upon a time…", dfr: "Je trouve les verbes à l’imparfait dans un texte.", den: "I find the verbs in the imparfait in a text.",
      gen: function () { return HE.shuf(IP_TEXTES).slice(0, 4).map(function (s) { var x = ipTexteMots(s), vs = ipVerbesDe(s);
        return { t: "mots", mots: x.mots, v: x.v, c: { fr: "Touche les <b>" + x.v.length + " verbes à l’imparfait</b> du texte, puis valide.", en: "Tap the <b>" + x.v.length + " verbs in the imparfait</b> in the text, then check." },
          ex: { fr: "Les verbes à l’imparfait : " + vs.join(", ") + ". Ils se terminent par ais, ait, ions, iez ou aient.", en: "The verbs in the imparfait: " + vs.join(", ") + ". They end in ais, ait, ions, iez or aient." } }; }); } },
    pronom: { perso: "leo", etape: 2, fr: "Le bon pronom", en: "The right pronoun", dfr: "J’associe le verbe au pronom qui correspond.", den: "I match the verb with the right pronoun.",
      gen: function () { var vs = HE.shuf(IP_G1.slice(0, 6).concat(IP_EA, IP_IRR)).slice(0, 8);
        return vs.map(function (v, k) { var p = [3, 4, 5, 2, 0, 1, 3, 5][k], f = ipForme(v, p), bons = { 0: "je", 1: "tu", 2: "il", 3: "nous", 4: "vous", 5: "ils" };
          var opts = p === 0 || p === 1 ? ["je", "tu", "nous"] : p === 2 || p === 5 ? ["il", "ils", "vous"] : ["nous", "vous", "tu"];
          if (p === 0 && ipVoy(f)) opts = ["j’", "tu", "nous"];
          var bon = p === 0 && ipVoy(f) ? "j’" : bons[p], o = HE.shuf(opts);
          return { t: "choix", c: { fr: "Quel pronom va avec « … <b>" + f + "</b> » ?", en: "Which pronoun goes with « … <b>" + f + "</b> »?" }, o: o.map(function (x) { return { fr: x, en: x }; }), a: o.indexOf(bon),
            ex: { fr: "« " + IP_T[p] + " » va avec " + IP_PRON[p] + " : " + ipPron(p, f) + (p === 0 && ipVoy(f) ? "" : " ") + f + ".", en: "« " + IP_T[p] + " » goes with " + IP_PRON[p] + ": " + ipPron(p, f) + (p === 0 && ipVoy(f) ? "" : " ") + f + "." } }; }); } },
    terminaison: { perso: "leo", etape: 2, fr: "La bonne terminaison", en: "The right ending", dfr: "Je choisis la terminaison qui va avec le sujet.", den: "I choose the ending that goes with the subject.",
      gen: function () { var vs = HE.shuf(IP_G1.concat(IP_EA, IP_IRR)).slice(0, 8);
        return vs.map(function (v, k) { var p = HE.rint(0, 5), suj = ipSujet(p), f = ipForme(v, p), rad = IP_V[v][0];
          var pieges = { 0: ["ait", "aient"], 1: ["ait", "ai"], 2: ["ais", "aient"], 3: ["iez", "ont"], 4: ["ions", "ez"], 5: ["ait", "ent"] }[p];
          var o = HE.shuf([IP_T[p]].concat(pieges)), deb = (suj === "Je" ? ipJe(f, true) : suj + " ") + rad;
          return { t: "choix", c: { fr: "Complète : « <b>" + deb + "…</b> " + IP_V[v][1] + ". »", en: "Complete: « <b>" + deb + "…</b> " + IP_V[v][1] + ". »" }, o: o.map(function (x) { return { fr: x, en: x }; }), a: o.indexOf(IP_T[p]),
            ex: { fr: ipPhrase(v, p, suj) + " Avec « " + suj.toLowerCase().replace(/^je$/, "je") + " », la terminaison est « " + IP_T[p] + " ».", en: ipPhrase(v, p, suj) + " With « " + suj + " », the ending is « " + IP_T[p] + " »." } }; }); } },
    ecrire: { perso: "leo", etape: 2, fr: "J’écris le verbe", en: "I write the verb", dfr: "J’écris le verbe à l’imparfait.", den: "I write the verb in the imparfait.",
      gen: function () { var vs = HE.shuf(IP_G1.slice(0, 8)).slice(0, 3).concat(HE.shuf(IP_EA.concat(IP_IRR)).slice(0, 5));
        return HE.shuf(vs).map(function (v) { var p = HE.rint(0, 5), suj = ipSujet(p), f = ipForme(v, p);
          return { t: "ecrire", c: { fr: "Écris le verbe <b>" + v + "</b> à l’imparfait.", en: "Write the verb <b>" + v + "</b> in the imparfait." }, avant: suj === "Je" ? ipJe(f, true).trim() : suj, apres: IP_V[v][1] + ".", r: [f],
            ex: { fr: ipPhrase(v, p, suj) + " (radical « " + IP_V[v][0] + " » + terminaison « " + IP_T[p] + " »)", en: ipPhrase(v, p, suj) + " (stem « " + IP_V[v][0] + " » + ending « " + IP_T[p] + " »)" } }; }); } },
    transposer: { perso: "leo", etape: 3, fr: "Je change le sujet", en: "I change the subject", dfr: "Je réécris la phrase avec un autre sujet.", den: "I rewrite the sentence with another subject.",
      gen: function () { var vs = HE.shuf(IP_G1.slice(0, 8).concat(IP_EA, IP_IRR)).slice(0, 6), paires = [[2, 5], [0, 3], [1, 4], [5, 2], [3, 0], [2, 3]];
        return vs.map(function (v, k) { var a = paires[k][0], b = paires[k][1], sa = ipSujet(a), sb = ipSujet(b), fb = ipForme(v, b);
          return { t: "ecrire", c: { fr: "Réécris la phrase avec le sujet « " + sb + " ».", en: "Rewrite the sentence with the subject « " + sb + " »." }, z: function () { return '<p class="qz-phrase">' + esc(ipPhrase(v, a, sa)) + "</p>"; },
            avant: sb === "Je" ? ipJe(fb, true).trim() : sb, apres: IP_V[v][1] + ".", r: [fb],
            ex: { fr: ipPhrase(v, b, sb) + " Le sujet change, donc la terminaison change : « " + IP_T[b] + " ».", en: ipPhrase(v, b, sb) + " The subject changes, so the ending changes: « " + IP_T[b] + " »." } }; }); } }
  } };

  /* ---------- la leçon ---------- */
  var IP_CONTE = "Il [était] une fois une sorcière. Elle [habitait] dans une grotte. Elle [avait] un grand chapeau noir et elle [préparait] des potions.";
  function ipConte(montrer) { return '<p class="ip-conte">' + esc(IP_CONTE).replace(/\[([^\]]+)\]/g, function (_, v) { return montrer ? '<span class="v-marque">' + v + "</span>" : v; }) + "</p>"; }
  function ipChoixVerbes(liste, action, sel) { return '<div class="coco-row ip-choix">' + liste.map(function (v) { return '<button class="coco-etiquette' + (v === sel ? " est-choisi" : "") + '" type="button" data-action="' + action + '" data-v="' + v + '" aria-pressed="' + (v === sel) + '">' + esc(v) + "</button>"; }).join("") + "</div>"; }
  function ipTerms() { return '<p class="ip-terms">' + IP_T.map(function (x) { return '<span class="coco-term">' + x + "</span>"; }).join(" – ") + "</p>"; }
  function pageLeconImparfait() {
    var en = langue === "en", v1 = LX.ip1 || "jouer", v3 = LX.ip3 || "chanter";
    var bloc1 = "<p>L’imparfait est un temps du passé qui est utilisé pour décrire des lieux ou des personnes. On l’emploie souvent dans les contes : <b>Il était une fois…</b></p>" + ipConte(LX.ipt) +
      '<div class="coco-row"><button class="coco-btn' + (LX.ipt ? " coco-btn--secondaire" : "") + '" type="button" data-action="lx-ipt">' + (LX.ipt ? (en ? "Hide the verbs" : "Cacher les verbes") : (en ? "Show the verbs" : "Montrer les verbes")) + "</button></div>";
    var bloc2 = "<p>Pour conjuguer les verbes du 1er groupe à l’imparfait, garde le <b>radical</b> et ajoute les <b>terminaisons</b> suivantes :</p>" + ipTerms() +
      ipChoixVerbes(IP_G1.slice(0, 8), "lx-ip1", v1) + '<div class="ip-tables" key="' + v1 + '">' + ipTable(v1, { pop: true }) + "</div>" +
      '<p class="mi-indice">' + (en ? "Choose a verb: the stem stays the same, only the ending changes." : "Choisis un verbe : le radical ne change pas, seule la terminaison change.") + "</p>";
    var bloc3 = "<p>Voici les verbes que tu dois savoir conjuguer à l’imparfait en CE2. Les terminaisons sont les mêmes pour chaque pronom personnel.</p>" +
      '<p class="ip-terms ip-terms--pron">' + IP_T.map(function (x, p) { return '<span><span class="ip-pron">' + IP_PRON[p] + "</span> : " + '<span class="coco-term">' + x + "</span></span>"; }).join("") + "</p>" +
      ipChoixVerbes(IP_LECON, "lx-ip3", v3) + '<div class="ip-tables" key="' + v3 + '">' + ipTable(v3, { pop: true }) + "</div>";
    return lxLecon("imparfait", tr(C.imparfait.titre), [[en ? "A past tense" : "Un temps du passé", bloc1], [en ? "Verbs of the 1st group" : "Les verbes du 1er groupe", bloc2], [en ? "The verbs to know" : "Les verbes à connaître", bloc3]], jrCartesImparfait, "francais");
  }
  /* « Je retiens » : leçons CONJ13 et CONJ14 mot pour mot, découpées ; les phrases restent en français en mode anglais */
  function jrCartesImparfait(en) {
    var mini = function (liste, k0) { return '<div class="ip-minis">' + liste.map(function (v, k) { return lxPop(ipTable(v), k0 + k); }).join("") + "</div>"; };
    return [
      { t: en ? "A past tense" : "Un temps du passé", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">Il <span class="v-marque">était</span> une fois…</span>', 0) + lxPop('<span class="jr-ph">Elle <span class="v-marque">habitait</span> dans une grotte.</span>', 2) + "</div>",
        txt: ["L’imparfait est un temps du passé qui est utilisé pour décrire des lieux ou des personnes.", "On l’emploie souvent dans les contes : <b>Il était une fois…</b>"] },
      { t: en ? "Verbs of the 1st group" : "Les verbes du 1er groupe", svg: '<div class="lx-illu">' + ipTable("jouer", { pop: true }) + "</div>",
        txt: ["Pour conjuguer les verbes du 1er groupe à l’imparfait, garde le radical et ajoute les terminaisons suivantes :", IP_T.map(function (x) { return '<span class="coco-term">' + x + "</span>"; }).join(" – ")] },
      { t: en ? "The same endings" : "Les mêmes terminaisons", svg: '<div class="lx-illu">' + jrCycle([ipTable("chanter"), ipTable("être"), ipTable("venir")]) + "</div>",
        txt: ["Les terminaisons sont les mêmes pour chaque pronom personnel.", IP_T.slice(0, 3).map(function (x, p) { return IP_PRON[p] + " : <b class=\"coco-term\">" + x + "</b>"; }).join(" · "), IP_T.slice(3).map(function (x, p) { return IP_PRON[p + 3] + " : <b class=\"coco-term\">" + x + "</b>"; }).join(" · ")] },
      { t: en ? "Être and avoir" : "Être et avoir", svg: mini(["être", "avoir"], 0),
        txt: ["Voici les verbes que tu dois savoir conjuguer à l’imparfait en CE2.", "j’étais, tu étais, il était, nous étions, vous étiez, ils étaient", "j’avais, tu avais, il avait, nous avions, vous aviez, ils avaient"] },
      { t: en ? "Aller, venir, vouloir, prendre" : "Aller, venir, vouloir, prendre", svg: mini(["aller", "venir", "vouloir", "prendre"], 0),
        txt: ["j’allais · je venais · je voulais · je prenais", "nous allions · nous venions · nous voulions · nous prenions"] },
      { t: en ? "Dire, pouvoir, voir, faire" : "Dire, pouvoir, voir, faire", svg: mini(["dire", "pouvoir", "voir", "faire"], 0),
        txt: ["je disais · je pouvais · je voyais · je faisais", "nous disions · nous pouvions · nous voyions · nous faisions"] }
    ];
  }
  jrCartesImparfait.persos = [["leo", "presente"], ["leo", "reflechit"], ["leo", "idee"], ["leo", "content"], ["leo", "reflechit"], ["leo", "victoire"]];

  /* ---------- mode « Au TBI » : découverte guidée, puis ardoises ---------- */
  function tqImparfait() {
    var qs = [], vs = HE.shuf(IP_G1.slice(0, 8).concat(IP_EA, IP_IRR));
    vs.slice(0, 6).forEach(function (v) { var p = HE.rint(0, 5), suj = ipSujet(p), f = ipForme(v, p);
      qs.push({ t: "champs", c: { fr: "Écris le verbe <b>" + v + "</b> à l’imparfait.", en: "Write the verb <b>" + v + "</b> in the imparfait." }, champs: [{ k: "v", avant: suj === "Je" ? ipJe(f, true).trim() : suj, apres: IP_V[v][1] + "." }], r: { v: f },
        ex: { fr: ipPhrase(v, p, suj), en: ipPhrase(v, p, suj) } }); });
    vs.slice(6, 12).forEach(function (v) { var p = HE.rint(0, 5), f = ipForme(v, p), o = HE.shuf([IP_T[p]].concat(HE.shuf(["ais", "ait", "ions", "iez", "aient"].filter(function (x) { return x !== IP_T[p]; })).slice(0, 2))); /* 3 terminaisons différentes */
      qs.push({ t: "choix", c: { fr: "Quelle terminaison ? « " + (p === 0 ? ipJe(f, true) : IP_PRON[p].split(",")[0].replace(/^./, function (c) { return c.toUpperCase(); }) + " ") + IP_V[v][0] + "… »", en: "Which ending? « " + (p === 0 ? ipJe(f, true) : IP_PRON[p].split(",")[0] + " ") + IP_V[v][0] + "… »" },
        o: o.map(function (x) { return { fr: x, en: x }; }), a: o.indexOf(IP_T[p]), ex: { fr: ipPron(p, f) + (p === 0 && ipVoy(f) ? "" : " ") + f, en: ipPron(p, f) + (p === 0 && ipVoy(f) ? "" : " ") + f } }); });
    return HE.shuf(qs);
  }
  TBI_SEQ.imparfait = { src: jrCartesImparfait, mat: "francais", pool: tqImparfait,
    questions: [
      { fr: "Quand se passe cette histoire ? Quels mots le montrent ?", en: "When does this story happen? Which words show it?", illu: function () { return '<p class="tq-phrases"><span>Il était une fois une sorcière.</span><span>Elle habitait dans une grotte.</span></p>'; } },
      { fr: "Observez : qu’est-ce qui ne change pas ? Qu’est-ce qui change ?", en: "Look: what stays the same? What changes?", illu: function () { return '<p class="tq-phrases"><span>je jouais · tu jouais · il jouait</span><span>nous jouions · vous jouiez · ils jouaient</span></p>'; } },
      { fr: "Comparez ces verbes. Que remarquez-vous à la fin ?", en: "Compare these verbs. What do you notice at the end?", illu: function () { return '<p class="tq-phrases"><span>je chantais · j’étais · je venais</span><span>nous chantions · nous étions · nous venions</span></p>'; } },
      { fr: "Comment conjuguer être et avoir à l’imparfait ?", en: "How do we conjugate être and avoir in the imparfait?", illu: function () { return '<p class="tq-phrases"><span>Hier, j’… content.</span><span>Hier, j’… un chien.</span></p>'; } },
      { fr: "Et aller, venir, vouloir, prendre ?", en: "What about aller, venir, vouloir, prendre?", illu: function () { return '<p class="tq-phrases"><span>Autrefois, nous … à l’école à pied.</span></p>'; } },
      { fr: "Et dire, pouvoir, voir, faire ?", en: "What about dire, pouvoir, voir, faire?", illu: function () { return '<p class="tq-phrases"><span>Quand j’étais petit, je … des dessins.</span></p>'; } }] };

  /* ---------- fiche enseignante ---------- */
  PROG.imparfait = { ref: "Français · Étude de la langue (orthographe grammaticale : le verbe)", att: PROG.verbe.att, socle: [1, 2],
    comp: "Mémoriser le présent, l’imparfait, le futur, le passé composé pour : être et avoir ; les verbes du premier groupe ; les verbes irréguliers du 3e groupe (faire, aller, dire, venir, pouvoir, voir, vouloir, prendre). Distinguer temps simples et temps composés.", rp: "français p. 34 et 35",
    reperes: ["Il identifie le radical et la terminaison.", "En appui sur l’oralisation correcte des formes verbales, il consolide l’orthographe du présent, de l’imparfait, du futur et du passé composé pour les verbes du 1er groupe et les verbes irréguliers du 3e groupe : faire, aller, dire, venir, pouvoir, voir, vouloir, prendre ainsi que « être » et « avoir ».", "Il repère par regroupements les formes verbales identiques (exemple : prendre, venir et vouloir ont les mêmes terminaisons au futur).", "Il distingue temps simples et temps composés."] };
  function ficheImparfait() {
    return ficheSeq({ seq: "imparfait", mat: "francais", prog: "imparfait", dom: "Français · Étude de la langue (grammaire et conjugaison)", tbi: "#tbi-imparfait",
      source: "Programmation périodique P5 de la classe : « L’imparfait », semaines 3 et 4 (du 9 au 20 novembre 2026). Leçons de classe : CONJ13 « L’imparfait des verbes du 1er groupe » et CONJ14 « L’imparfait » (2023). « La chanson de l’imparfait » de la classe, chantée en classe.",
      seances: [
        ["Séance 1", "L’élève identifie dans un texte les verbes conjugués à l’imparfait. L’élève mémorise les terminaisons de l’imparfait à partir de « La chanson de l’imparfait ».", "Je me rappelle · Revoir la leçon (bloc 1 : « Il était une fois… ») · Il était une fois… · Au TBI (découverte)"],
        ["Séance 2", "L’élève conjugue à l’oral les verbes des 1er et 3ème groupes à l’imparfait.", "Revoir la leçon (blocs 2 et 3, tableaux à faire défiler) · Au TBI (ardoises)"],
        ["Séance 3", "L’élève conjugue à l’écrit les verbes des 1er et 3ème groupes à l’imparfait.", "J’écris le verbe"],
        ["Séances 4 et 5 (exercices bilan et évaluation)", "L’élève est capable d’associer un de ces verbes conjugué à l’imparfait au pronom personnel qui correspond. L’élève choisit, selon le sujet, la bonne terminaison de ces verbes conjugués à l’imparfait. L’élève est capable de conjuguer à l’écrit ces verbes à l’imparfait. L’élève sera capable de transposer des phrases en modifiant le sujet et la terminaison de ces verbes à l’imparfait.", "Le bon pronom · La bonne terminaison · Je change le sujet · Fiche d’exercices en 3 niveaux (corrigé, correction au TBI)"]],
      erreurs: ["Écrire « je jouait » ou « il jouais » : ais, ais, ait se prononcent pareil ; faire chercher le sujet et redire la chanson de l’imparfait.",
        "Confondre « il jouait » et « ils jouaient » (même son) : le pluriel prend « aient ».",
        "Oublier le i de « nous jouions », « vous jouiez » ; pour voir : « nous voyions », « vous voyiez » (y puis i).",
        "Changer le radical : le radical ne change pas (« je chantais », « nous chantions »).",
        "Oublier « j’ » devant une voyelle : « j’étais », « j’avais », « j’allais »."],
      conseils: ["Code des leçons : le verbe et les terminaisons en rouge, les pronoms en violet.", "En mode anglais, les consignes passent en anglais mais les phrases restent en français.", "La fiche d’exercices existe en 3 niveaux (★, ★★, ★★★), avec les mêmes objectifs ; le même numéro redonne les mêmes exercices, pour corriger au TBI.", "Les étoiles de grammaire de la classe : l’étoile noire porte sur l’imparfait.", "« La chanson de l’imparfait » se chante en classe ; ses paroles ne sont pas reprises sur le site (droits d’auteur). Vidéo indiquée par l’enseignante : https://www.youtube.com/watch?v=LyJhmm35tlI"],
      prolonger: ["Réinvestissement de la programmation (séances 7 et 8 du futur) : faire rédiger la suite d’un conte à l’imparfait, puis relire en tenant compte des remarques (majuscules, points, accords sujet-verbe).", "Comparer l’imparfait et le futur : mêmes verbes irréguliers, mêmes regroupements (repère CC6)."],
      sources: "Sources : programmation périodique P5 de la classe, leçons CONJ13 et CONJ14 de la classe, programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, français, p. 34 et 35)." });
  }

  /* ---------- fiche d’exercices en 3 niveaux ---------- */
  function ipSouligne(s) { return esc(s).replace(/\[([^\]]+)\]/g, function (_, v) { return exC(v); }).replace(/[{}]/g, ""); }
  function ipTrouPron(p, f) { return p === 2 ? "il, elle ou on" : p === 5 ? "ils ou elles" : ipPron(p, f); }
  EXOS.imparfait = { seq: "seq-imparfait", matiere: "francais", titre: function () { return tr(C.imparfait.titre); },
    rappel: function (en) { return (en ? "In the imparfait, the endings are the same for every verb: " : "À l’imparfait, les terminaisons sont les mêmes pour tous les verbes : ") + IP_T.map(function (x, p) { return IP_PRON[p] + " <b class=\"coco-term\">" + x + "</b>"; }).join(" · ") + "."; },
    tirer: function () { var vs = HE.shuf(IP_G1.slice(0, 8)).slice(0, 2).concat(HE.shuf(IP_EA.concat(IP_IRR)).slice(0, 5));
      return { texte: HE.pk(IP_TEXTES), pron: HE.shuf(IP_G1.concat(IP_EA, IP_IRR)).slice(0, 4).map(function (v, k) { var p = [0, 3, 5, 1][k]; return [v, p]; }),
        term: vs.slice(0, 6).map(function (v) { var p = HE.rint(0, 5); return [v, p, ipSujet(p)]; }), conj: [HE.pk(IP_G1.slice(0, 8)), HE.pk(IP_IRR)], trans: HE.shuf(IP_G1.slice(0, 8).concat(IP_EA, IP_IRR)).slice(0, 2) }; },
    exos: function (d, en) {
      return [
        { c: en ? "Underline the verbs in the imparfait." : "Souligne les verbes à l’imparfait.", q: '<p class="ex-fr ex-texte">' + exG(ipSouligne(d.texte), "soul") + "</p>", r: ipVerbesDe(d.texte).map(function (v) { return "<b>" + esc(v) + "</b>"; }).join(" · ") },
        { c: en ? "Write the pronoun." : "Écris le pronom qui convient.", q: '<ul class="ex-fr ex-conv">' + d.pron.map(function (x) { var f = ipForme(x[0], x[1]); return "<li>" + exT(esc(ipTrouPron(x[1], f))) + " " + esc(f) + "</li>"; }).join("") + "</ul>", r: d.pron.map(function (x) { var f = ipForme(x[0], x[1]); return esc(ipTrouPron(x[1], f)) + " " + esc(f); }).join(" · ") },
        { c: en ? "Complete with the right ending." : "Complète avec la bonne terminaison.", q: '<ul class="ex-fr ex-conv">' + d.term.map(function (x) { var f = ipForme(x[0], x[1]), deb = (x[2] === "Je" ? ipJe(f, true) : x[2] + " ") + IP_V[x[0]][0]; return "<li>" + esc(deb) + exTe(IP_T[x[1]]) + " " + esc(IP_V[x[0]][1]) + ".</li>"; }).join("") + "</ul>", r: d.term.map(function (x) { return esc(ipForme(x[0], x[1])); }).join(" · ") },
        { c: en ? "Conjugate in the imparfait." : "Conjugue à l’imparfait.", q: '<div class="ex-deux-col ex-fr">' + d.conj.map(function (v) { return "<div><b>" + esc(v) + "</b>" + [0, 3, 5].map(function (p) { var f = ipForme(v, p); return "<p>" + esc(ipPron(p, f).split(",")[0]) + (p === 0 && ipVoy(f) ? "" : " ") + exT(esc(f)) + "</p>"; }).join("") + "</div>"; }).join("") + "</div>",
          r: d.conj.map(function (v) { return [0, 3, 5].map(function (p) { var f = ipForme(v, p); return ipPron(p, f).split(",")[0] + (p === 0 && ipVoy(f) ? "" : " ") + f; }).join(", "); }).join(" — ") },
        { c: en ? "Rewrite the sentence with « Nous »." : "Réécris la phrase avec « Nous ».", q: '<ul class="ex-fr ex-conv ex-une-col">' + d.trans.map(function (v) { return "<li>" + esc(ipPhrase(v, 2, "Léo")) + "<br>" + exT(esc(ipPhrase(v, 3, "Nous")), true) + "</li>"; }).join("") + "</ul>", r: d.trans.map(function (v) { return esc(ipPhrase(v, 3, "Nous")); }).join(" · ") }
      ];
    } };
  exNiveaux("imparfait", [
    "L’élève identifie dans un texte les verbes conjugués à l’imparfait.",
    "L’élève mémorise les terminaisons de l’imparfait à partir de « La chanson de l’imparfait ».",
    "L’élève conjugue à l’écrit les verbes des 1er et 3ème groupes à l’imparfait.",
    "L’élève est capable d’associer un de ces verbes conjugué à l’imparfait au pronom personnel qui correspond.",
    "L’élève choisit, selon le sujet, la bonne terminaison de ces verbes conjugués à l’imparfait.",
    "L’élève est capable de conjuguer à l’écrit ces verbes à l’imparfait.",
    "L’élève sera capable de transposer des phrases en modifiant le sujet et la terminaison de ces verbes à l’imparfait."
  ], {
    but: "Verbes du 1er groupe, être et avoir ; le tableau des terminaisons est rappelé ; entourer le bon pronom ; conjuguer un verbe du 1er groupe à toutes les personnes.",
    rappel: function (en) { return (en ? "Keep the stem and add the endings: " : "Je garde le radical et j’ajoute les terminaisons : ") + "je jou<b class=\"coco-term\">ais</b> · tu jou<b class=\"coco-term\">ais</b> · il jou<b class=\"coco-term\">ait</b> · nous jou<b class=\"coco-term\">ions</b> · vous jou<b class=\"coco-term\">iez</b> · ils jou<b class=\"coco-term\">aient</b>"; },
    tirer: function () { var g = HE.shuf(IP_G1.slice(0, 8)).concat(HE.shuf(IP_EA));
      return { texte: HE.pk(IP_TEXTES.filter(function (s) { return ipVerbesDe(s).length <= 4; })), pron: g.slice(0, 4).map(function (v, k) { var p = [3, 0, 5, 4][k]; var o = p === 0 || p === 3 ? ["je", "nous"] : p === 5 ? ["il", "ils"] : ["vous", "tu"]; return [v, p, HE.shuf(o)]; }),
        term: HE.shuf(g).slice(0, 4).map(function (v) { var p = HE.rint(0, 5); return [v, p, ipSujet(p)]; }), conj: HE.pk(IP_G1.slice(0, 8)) }; },
    exos: function (d, en) {
      return [
        { c: en ? "Underline the verbs in the imparfait." : "Souligne les verbes à l’imparfait.", q: '<p class="ex-fr ex-texte">' + exG(ipSouligne(d.texte), "soul") + "</p>", r: ipVerbesDe(d.texte).map(function (v) { return "<b>" + esc(v) + "</b>"; }).join(" · ") },
        { c: en ? "Circle the right pronoun." : "Entoure le bon pronom.", q: '<ul class="ex-fr ex-conv">' + d.pron.map(function (x) { var f = ipForme(x[0], x[1]), bon = x[1] === 0 ? "je" : ["je", "tu", "il", "nous", "vous", "ils"][x[1]];
            var o = x[2].map(function (y) { return y === "je" && ipVoy(f) ? "j’" : y; }), b = bon === "je" && ipVoy(f) ? "j’" : bon;
            return "<li>" + exG("( " + o.map(function (y) { return y === b ? exC(esc(y)) : esc(y); }).join(" / ") + " )", "cercle") + " " + esc(f) + "</li>"; }).join("") + "</ul>",
          r: d.pron.map(function (x) { var f = ipForme(x[0], x[1]); return esc(ipPron(x[1], f).split(",")[0]) + (x[1] === 0 && ipVoy(f) ? "" : " ") + esc(f); }).join(" · ") },
        { c: en ? "Complete with the right ending." : "Complète avec la bonne terminaison.", q: '<ul class="ex-fr ex-conv">' + d.term.map(function (x) { var f = ipForme(x[0], x[1]), deb = (x[2] === "Je" ? ipJe(f, true) : x[2] + " ") + IP_V[x[0]][0]; return "<li>" + esc(deb) + exTe(IP_T[x[1]]) + " " + esc(IP_V[x[0]][1]) + ".</li>"; }).join("") + "</ul>", r: d.term.map(function (x) { return esc(ipForme(x[0], x[1])); }).join(" · ") },
        { c: en ? "Conjugate the verb « " + d.conj + " » in the imparfait." : "Conjugue le verbe « " + d.conj + " » à l’imparfait.", q: '<ul class="ex-fr ex-conv">' + IP_T.map(function (_, p) { var f = ipForme(d.conj, p); return "<li>" + esc(ipPron(p, f)) + (p === 0 && ipVoy(f) ? "" : " ") + esc(IP_V[d.conj][0]) + exTe(IP_T[p]) + "</li>"; }).join("") + "</ul>",
          r: IP_T.map(function (_, p) { var f = ipForme(d.conj, p); return esc(ipPron(p, f)) + (p === 0 && ipVoy(f) ? "" : " ") + esc(f); }).join(" · ") }
      ];
    }
  }, "Les 11 verbes de la leçon ; souligner, écrire le pronom, la terminaison selon le sujet, conjuguer deux verbes, réécrire deux phrases avec « Nous ».", {
    but: "Repérer l’imparfait parmi d’autres temps ; écrire le verbe entre parenthèses, sans aide ; transformer un petit texte en changeant le sujet ; écrire deux phrases à l’imparfait.",
    rappel: EXOS.imparfait.rappel,
    tirer: function () { var vs = HE.shuf(IP_G1.slice(0, 8)).slice(0, 2).concat(HE.shuf(IP_EA.concat(IP_IRR)).slice(0, 4));
      return { texte: HE.pk(IP_TEXTES3), paren: HE.shuf(vs).map(function (v) { var p = HE.rint(0, 5); return [v, p, ipSujet(p)]; }), trans: HE.shuf(IP_EA.concat(IP_IRR, IP_G1.slice(0, 8))).slice(0, 3) }; },
    exos: function (d, en) {
      return [
        { c: en ? "Underline only the verbs in the imparfait." : "Souligne seulement les verbes à l’imparfait.", q: '<p class="ex-fr ex-texte">' + exG(ipSouligne(d.texte), "soul") + "</p>", r: ipVerbesDe(d.texte).map(function (v) { return "<b>" + esc(v) + "</b>"; }).join(" · ") + (en ? " (the other verbs are in the present)" : " (les autres verbes sont au présent)") },
        { c: en ? "Write the verb in brackets in the imparfait." : "Écris le verbe entre parenthèses à l’imparfait.", q: '<ul class="ex-fr ex-conv ex-une-col">' + d.paren.map(function (x) { var f = ipForme(x[0], x[1]); return "<li>" + esc(x[2] === "Je" ? (ipVoy(f) ? "J’" : "Je") : x[2]) + " (" + esc(x[0]) + ") " + exT(esc(f)) + " " + esc(IP_V[x[0]][1]) + ".</li>"; }).join("") + "</ul>", r: d.paren.map(function (x) { return esc(ipForme(x[0], x[1])); }).join(" · ") },
        { c: en ? "Rewrite the text with « Nous » instead of « Je »." : "Réécris le texte avec « Nous » à la place de « Je ».", q: '<p class="ex-fr">' + d.trans.map(function (v) { return esc(ipPhrase(v, 0, "Je")); }).join(" ") + '</p><p class="ex-fr ex-invente">' + exT(esc(d.trans.map(function (v) { return ipPhrase(v, 3, "Nous"); }).join(" ")), true) + EXLL + EXLL + "</p>",
          r: esc(d.trans.map(function (v) { return ipPhrase(v, 3, "Nous"); }).join(" ")) },
        { c: en ? "Write two sentences in the imparfait to describe the witch’s cave." : "Écris deux phrases à l’imparfait pour décrire la grotte de la sorcière.", q: '<p class="ex-invente">' + EXLL + EXLL + EXLL + "</p>",
          r: en ? "Answers will vary: check the subject, the stem and the ending (ais, ait, aient…)." : "Réponses variées : vérifier le sujet, le radical et la terminaison (ais, ait, aient…)." }
      ];
    }
  });

  /* ---------- routeur ---------- */
  /* ==========================================================================================
     Orthographe : les dictées par régularités (D-134, demande de l’enseignante, 10/11/2026)
     Trois séquences complètes : « Les nombres en lettres », « Les consonnes muettes », « Le -e après un groupe de consonnes ».
     Leçons de classe 2026 reprises mot pour mot (sans leur numéro : l’ordre change d’une année à l’autre) ; « gr » ajouté à la règle
     du -e (accord de l’enseignante). Démarche de Laura MARIE, « Mon répertoire de dictées par régularités » (registre D30) : de la
     reconnaissance à la production (j’écoute et je montre, je complète, j’écris les mots, la dictée). Aucun texte du livre n’est repris :
     mots, phrases et dictées écrits par Claude d’après les mots des leçons [PROPOSITION]. Jamais de mot mal écrit montré (Ouzoulias, D-132).
     Marques dans les mots : [x] orange (la régularité, comme dans les leçons), {x} en gras, |x| jaune moutarde (attention).
     ========================================================================================== */
  var ORTH_IDS = ["nombres", "muettes", "egroupe"], OR = {}, OR_VU = {}, OR_TIRET = 79;
  function orMarque(s) { return esc(s).replace(/\[([^\]]+)\]/g, '<span class="mi-c">$1</span>').replace(/\{([^}]+)\}/g, "<b>$1</b>").replace(/\|([^|]+)\|/g, '<span class="mi-m">$1</span>'); }
  function orPlain(s) { return String(s).replace(/[\[\]{}|]/g, ""); }
  function orCibles(s) { return esc(s).replace(/\[([^\]]+)\]/g, "<b>$1</b>"); }
  /* morceaux pour la dictée : on coupe aux signes de ponctuation, puis par groupes de 5 mots au plus */
  function orMorceaux(s) { var out = []; orPlain(s).replace(/([,.:;!?])\s+/g, "$1\n").split("\n").forEach(function (p) { var w = p.split(" "); while (w.length > 6) out.push(w.splice(0, 4).join(" ")); out.push(w.join(" ")); }); return out; }
  var OR_U = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
  /* nombres en lettres de 0 à 79, et 100, avec des tirets entre chaque mot (orthographe de la leçon) */
  function orNombre(n) { if (n === 100) return "cent"; if (n <= 16) return OR_U[n]; if (n < 20) return "dix-" + OR_U[n - 10];
    if (n >= 70) return "soixante-" + (n === 71 ? "et-onze" : orNombre(n - 60));
    var d = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"][Math.floor(n / 10)], u = n % 10; return u === 0 ? d : u === 1 ? d + "-et-un" : d + "-" + OR_U[u]; }
  function orEcoute(texte, en, lib) { return '<p class="or-ecoute"><button class="coco-btn coco-btn--secondaire" type="button" data-action="qz-dire" data-v="' + esc(texte) + '">' + esc(lib || (en ? "Listen to the word" : "Écouter le mot")) + "</button></p>"; }
  function orGros(s) { return '<p class="or-cue">' + esc(s) + "</p>"; }

  /* ---------- 1. Les nombres en lettres (perso : Sari) ---------- */
  OR.nombres = { titre: { fr: "Les nombres en lettres", en: "Numbers in words" }, objectif: { fr: "Je sais écrire les nombres en lettres.", en: "I can write numbers in words." }, perso: "sari",
    rappelFiche: { fr: "Je mets des tirets entre chaque mot : vingt-et-un, soixante-dix-neuf.", en: "I put hyphens between every word: vingt-et-un, soixante-dix-neuf." },
    rappel: [
      { t: "choix", c: { fr: "Comment lit-on ce nombre : <b>46</b> ?", en: "How do we read this number: <b>46</b>?" }, o: ["quarante-six", "soixante-quatre", "trente-six"], a: 0, ex: { fr: "46 : 4 dizaines et 6 unités, quarante-six.", en: "46: 4 tens and 6 ones, quarante-six." } },
      { t: "choix", c: { fr: "Quel nombre vient juste après <b>15</b> ?", en: "Which number comes just after <b>15</b>?" }, o: ["seize", "quatorze", "cinq"], a: 0, ex: { fr: "Après 15 vient 16 : seize.", en: "After 15 comes 16: seize." } },
      { t: "choix", c: { fr: "Dans <b>64</b>, quel est le chiffre des dizaines ?", en: "In <b>64</b>, which digit is the tens digit?" }, o: ["6", "4", "64"], a: 0, ex: { fr: "64 = 6 dizaines et 4 unités.", en: "64 = 6 tens and 4 ones." } }],
    /* « J’écoute et je montre » : le mot est dit, l’élève touche le mot qui l’écrit (tous les mots proposés sont bien écrits) */
    carte: { c: { fr: "Écoute le nombre, puis touche le mot qui l’écrit.", en: "Listen to the number, then tap the word that writes it." }, lib: { fr: "Écouter le nombre", en: "Listen to the number" },
      items: [["quatorze", ["quatre", "quatorze", "quarante"]], ["quarante", ["quatre", "quatorze", "quarante"]], ["quinze", ["cinq", "quinze", "cinquante"]], ["cinquante", ["cinq", "quinze", "cinquante"]],
        ["seize", ["six", "seize", "soixante"]], ["soixante", ["six", "seize", "soixante"]], ["douze", ["deux", "douze", "dix"]], ["treize", ["trois", "treize", "trente"]], ["trente", ["trois", "treize", "trente"]], ["cent", ["cent", "cinq", "seize"]]] },
    /* « Je complète » : [nombre, avant, lettres à écrire, après, aide] */
    trous: [[14, "quator", "ze", "", "Les nombres de 11 à 16 finissent par -ze : onze, douze, treize, quatorze, quinze, seize."], [5, "cin", "q", "", "Attention : cinq finit par q."], [20, "vin", "gt", "", "Vingt finit par deux lettres muettes : g et t."],
      [60, "soi", "x", "ante", "Soixante s’écrit avec un x."], [40, "", "qu", "arante", "Quarante commence par qu-, comme quatre."], [30, "tr", "en", "te", "Attention : trente s’écrit avec « en »."], [8, "", "h", "uit", "Huit commence par un h muet."],
      [7, "se", "p", "t", "Sept a un p muet."], [50, "cinqu", "ante", "", "Quarante, cinquante, soixante finissent par -ante."], [2, "deu", "x", "", "Deux finit par un x muet."], [12, "dou", "ze", "", "Douze finit par -ze."], [100, "cen", "t", "", "Cent finit par un t muet, comme dans centaine."]],
    ecrire: [14, 16, 21, 33, 46, 57, 60, 72, 79, 100, 18, 35],
    /* phrases à compléter avec un nombre écrit en lettres */
    gaps: [["Une semaine compte ___ jours.", "sept"], ["Dans une année, il y a ___ mois.", "douze"], ["Une heure dure ___ minutes.", "soixante"], ["Le mois de novembre compte ___ jours.", "trente"], ["Une araignée a ___ pattes.", "huit"],
      ["Un quart d’heure dure ___ minutes.", "quinze"], ["Un mètre mesure ___ centimètres.", "cent"], ["Un triangle a ___ côtés.", "trois"], ["Un insecte a ___ pattes.", "six"], ["Une main a ___ doigts.", "cinq"], ["Un carré a ___ côtés.", "quatre"], ["Les vélos ont ___ roues.", "deux"]],
    autres: function (w) { var G = [["quatre", "quatorze", "quarante"], ["cinq", "quinze", "cinquante"], ["six", "seize", "soixante"], ["deux", "douze", "dix"], ["trois", "treize", "trente"], ["sept", "cent", "seize"], ["huit", "dix", "trois"]], g = G.filter(function (x) { return x.indexOf(w) >= 0; })[0] || ["deux", "trois", "quatre"];
      return g.filter(function (x) { return x !== w; }).slice(0, 2); },
    entoure: { c: { fr: "Entoure la fin des nombres : -ze ou -ante.", en: "Circle the end of each number: -ze or -ante." }, mots: ["on[ze]", "dou[ze]", "trei[ze]", "quator[ze]", "quin[ze]", "sei[ze]", "quar[ante]", "cinqu[ante]", "soix[ante]"] },
    dictees: {
      1: ["Léo a [huit] ans.", "Il y a [douze] billes dans le sac.", "Nina mange [trois] letchis.", "Le chat a [quatre] pattes.", "Papa achète [six] mangues.", "Il est [onze] heures."],
      2: ["[Vingt-et-un] élèves sont dans la classe.", "Tao a [quinze] billes et [seize] cartes.", "Le bus arrive dans [cinq] minutes.", "Une heure dure [soixante] minutes.", "La maîtresse range [trente] cahiers.", "Méi a [quarante] perles dans sa boîte."],
      3: ["Le marchand vend [cinquante] letchis pour [cent] francs.", "Il y a [soixante-dix-neuf] coquillages dans le seau de Nina.", "Papi Tao a pêché [quatorze] poissons et [vingt-deux] crabes.", "Au marché, Sari compte [quarante-six] tomates et [trente-trois] citrons."] },
    textes: [{ n: 1, titre: "Le goûter", t: "Il est [quatre] heures. Léo a [deux] pommes. Nina a [trois] gâteaux. Ils mangent dans la cour." },
      { n: 2, titre: "À la plage", t: "Dimanche, nous sommes [quinze] à la plage. Tao trouve [vingt-et-un] coquillages. Méi en trouve [douze]. Le soir, nous rentrons à [six] heures." },
      { n: 3, titre: "Le marché", t: "Samedi, Maman va au marché. Elle achète [seize] letchis, [cinq] papayes et [trente-deux] bananes. Le petit sac coûte [quarante] francs. Elle paie avec une pièce de [cinquante] francs." }],
    objectifs: ["L’élève est capable d’écrire en lettres les nombres étudiés (de 0 à 79, et cent).", "L’élève écrit les fins -ze et -ante, le début qu- et les lettres muettes des nombres.", "L’élève met des tirets entre chaque mot d’un nombre écrit en lettres."] };
  function orNbCartes(L) { return L.map(function (x) { return [String(x[0]), x[1]]; }); }
  OR.nombres.blocs = function (en) {
    var tirets = [21, 35, 46, 57, 64, 71, 79], n = OR_TIRET, mot = orNombre(n);
    return [[en ? "-ze and -ante" : "-ze et -ante", "<p><b>-ze</b> : " + (en ? "tap a number to see how it is written." : "touche un nombre pour voir comment il s’écrit.") + "</p>" + orCartes("nombres", orNbCartes([[11, "on[ze]"], [12, "dou[ze]"], [13, "tr{ei}[ze]"], [14, "quator[ze]"], [15, "quin[ze]"], [16, "s{ei}[ze]"]])) +
        "<p><b>-ante</b></p>" + orCartes("nombres", orNbCartes([[40, "quar[ante]"], [50, "cinqu[ante]"], [60, "soix[ante]"]])) + '<p class="or-attention">⚠ ' + (en ? "Careful:" : "Attention :") + "</p>" + orCartes("nombres", orNbCartes([[30, "tr|en|te"], [100, "c|en|t"]]))],
      [en ? "qu-, silent letters and -x" : "qu-, lettres muettes et -x", "<p><b>qu-</b></p>" + orCartes("nombres", orNbCartes([[4, "[qu]atre"], [14, "[qu]atorze"], [40, "[qu]arante"], [15, "[qu]inze"], [50, "{c}in[qu]ante"]])) + '<p class="or-attention">⚠ ' + (en ? "Careful:" : "Attention :") + "</p>" + orCartes("nombres", orNbCartes([[5, "{c}in|q|"]])) +
        "<p><b>" + (en ? "Silent letters" : "Lettres muettes") + "</b></p>" + orCartes("nombres", orNbCartes([[2, "deu[x]"], [3, "troi[s]"], [7, "se[p]t"], [8, "[h]uit"], [20, "vin[gt]"], [100, "{c}en[t]"]])) + '<p class="or-note">troi<span class="mi-c">s</span>ième · cen<span class="mi-c">t</span>aine</p>' +
        "<p><b>-x</b></p>" + orCartes("nombres", orNbCartes([[6, "si[x]"], [60, "soi[x]ante"], [10, "di[x]"]]))],
      [en ? "Hyphens" : "Les tirets", "<p>Je mets des <b>tirets</b> entre chaque mot : vingt-et-un, soixante-dix-neuf</p>" + '<div class="coco-row or-tirets">' + tirets.map(function (k) { return '<button class="coco-btn' + (k === n ? "" : " coco-btn--secondaire") + '" type="button" data-action="or-tiret" data-v="' + k + '" aria-pressed="' + (k === n) + '">' + k + "</button>"; }).join("") + "</div>" +
        '<p class="or-tiret-mot"><b>' + n + "</b> = " + esc(mot).split("-").join('<span class="mi-c or-tiret">-</span>') + "</p>"]];
  };
  OR.nombres.jr = function (en) { return [
    { t: "-ze", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + orMarque("11 on[ze] · 12 dou[ze] · 13 tr{ei}[ze]") + "</span>", 0) + lxPop('<span class="jr-ph">' + orMarque("14 quator[ze] · 15 quin[ze] · 16 s{ei}[ze]") + "</span>", 2) + "</div>", txt: ["11 onze 12 douze", "13 treize 14 quatorze", "15 quinze 16 seize"] },
    { t: "-ante", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + orMarque("40 quar[ante] · 50 cinqu[ante] · 60 soix[ante]") + "</span>", 0) + lxPop('<span class="jr-ph">⚠ ' + orMarque("30 tr|en|te · 100 c|en|t") + "</span>", 2) + "</div>", txt: ["40 quarante", "50 cinquante", "60 soixante", "Attention : 30 trente, 100 cent"] },
    { t: "qu-", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + orMarque("4 [qu]atre · 14 [qu]atorze · 40 [qu]arante") + "</span>", 0) + lxPop('<span class="jr-ph">' + orMarque("15 [qu]inze · 50 {c}in[qu]ante") + "</span>", 1) + lxPop('<span class="jr-ph">⚠ ' + orMarque("5 {c}in|q|") + "</span>", 3) + "</div>", txt: ["4 quatre, 14 quatorze", "40 quarante", "15 quinze", "50 cinquante", "Attention : 5 cinq"] },
    { t: en ? "Silent letters and -x" : "Lettres muettes et -x", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + orMarque("2 deu[x] · 3 troi[s] · 7 se[p]t · 8 [h]uit") + "</span>", 0) + lxPop('<span class="jr-ph">' + orMarque("20 vin[gt] · 100 {c}en[t]") + "</span>", 1) + lxPop('<span class="jr-ph">' + orMarque("6 si[x] · 60 soi[x]ante · 10 di[x]") + "</span>", 3) + "</div>",
      txt: ["2 deux", "3 trois (troisième)", "7 sept, 8 huit, 20 vingt", "100 cent (centaine)", "-x : 6 six, 60 soixante, 10 dix"] },
    { t: en ? "Hyphens" : "Les tirets", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">21 = vingt<span class="mi-c">-</span>et<span class="mi-c">-</span>un</span>', 0) + lxPop('<span class="jr-ph">79 = soixante<span class="mi-c">-</span>dix<span class="mi-c">-</span>neuf</span>', 2) + "</div>",
      txt: ["Je mets des tirets entre chaque mot : vingt-et-un, soixante-dix-neuf"] }]; };
  OR.nombres.jrPersos = [["sari", "presente"], ["sari", "reflechit"], ["sari", "idee"], ["sari", "content"], ["sari", "victoire"]];
  OR.nombres.tbiQ = [
    { fr: "Que remarquez-vous à la fin de ces nombres ?", en: "What do you notice at the end of these numbers?", illu: function () { return '<p class="tq-phrases"><span>onze · douze · treize</span><span>quatorze · quinze · seize</span></p>'; } },
    { fr: "Écoutez : quarante, cinquante, soixante. Comment s’écrit la fin ?", en: "Listen: quarante, cinquante, soixante. How is the end written?", illu: function () { return '<p class="tq-phrases"><span>40 · 50 · 60</span></p>'; } },
    { fr: "Comment s’écrit le début de ces nombres ?", en: "How is the beginning of these numbers written?", illu: function () { return '<p class="tq-phrases"><span>4 · 14 · 40 · 15 · 50</span></p>'; } },
    { fr: "Quelles lettres ne s’entendent pas ?", en: "Which letters can’t you hear?", illu: function () { return '<p class="tq-phrases"><span>2 · 3 · 7 · 8 · 20 · 100</span></p>'; } },
    { fr: "Comment écrit-on 21 et 79 en lettres ?", en: "How do we write 21 and 79 in words?", illu: function () { return '<p class="tq-phrases"><span>21 · 79</span></p>'; } }];

  /* ---------- 2. Les consonnes muettes (perso : Waeko) ---------- */
  var OR_MU_T = ["trot", "pot", "robot", "port", "fort", "sport", "mort", "enfant", "éléphant", "biscuit", "fruit", "bruit"], OR_MU_S = ["pas", "cadenas", "bras", "tapis", "colis", "radis", "bois", "trois", "mois"],
    OR_MU_D = ["lézard", "cafard", "lard", "grand", "normand", "chaud", "crapaud"], OR_MU_X = ["amoureux", "vieux", "heureux", "doux", "roux", "époux"];
  function orMuet(w) { return w.slice(0, -1) + "[" + w.slice(-1) + "]"; }
  OR.muettes = { titre: { fr: "Les consonnes muettes", en: "Silent consonants" }, objectif: { fr: "Je sais écrire la consonne muette à la fin des mots.", en: "I can write the silent consonant at the end of words." }, perso: "waeko",
    rappelFiche: { fr: "Beaucoup de noms et d’adjectifs masculins ont une consonne muette à la fin : t, s, d, x. Un mot de la même famille aide à la trouver : fruit > fruité.", en: "Many masculine nouns and adjectives end with a silent consonant: t, s, d, x. A word from the same family helps to find it: fruit > fruité." },
    rappel: [
      { t: "choix", c: { fr: "Quel est le féminin de « petit » ?", en: "What is the feminine of « petit »?" }, o: ["petite", "petits", "grand"], a: 0, ex: { fr: "Un petit chat, une petite chatte : au féminin, on entend le t.", en: "Un petit chat, une petite chatte: in the feminine, we hear the t." } },
      { t: "choix", c: { fr: "Quel mot est de la même famille que « fruit » ?", en: "Which word is from the same family as « fruit »?" }, o: ["fruité", "frite", "fourmi"], a: 0, ex: { fr: "fruit, fruité, fruitier : ce sont des mots de la même famille.", en: "fruit, fruité, fruitier: these words are from the same family." } },
      { t: "choix", c: { fr: "« Un chat », c’est…", en: "« Un chat » is…" }, o: [{ fr: "masculin", en: "masculine" }, { fr: "féminin", en: "feminine" }], a: 0, ex: { fr: "On dit « un chat » : c’est un nom masculin.", en: "We say « un chat »: it is a masculine noun." } }],
    carte: { c: { fr: "Écoute le mot. Quelle est sa consonne muette ? Lève la bonne carte.", en: "Listen to the word. Which silent consonant does it end with? Raise the right card." }, cartes: ["t", "s", "d", "x"],
      items: [["robot", 0], ["sport", 0], ["enfant", 0], ["biscuit", 0], ["fruit", 0], ["cadenas", 1], ["tapis", 1], ["radis", 1], ["bois", 1], ["mois", 1], ["lézard", 2], ["cafard", 2], ["grand", 2], ["chaud", 2], ["crapaud", 2], ["heureux", 3], ["vieux", 3], ["doux", 3], ["roux", 3], ["époux", 3]] },
    trous: [["frui", "t", "", "Pense à : fruité."], ["spor", "t", "", "Pense à : sportif."], ["for", "t", "", "Pense à : forte."], ["peti", "t", "", "Pense à : petite."], ["enfan", "t", "", "Pense à : enfantin."], ["éléphan", "t", "", "Pense à : éléphanteau."],
      ["gri", "s", "", "Pense à : grise."], ["gro", "s", "", "Pense à : grosse."], ["bra", "s", "", "Pense à : brassard."], ["tapi", "s", "", "Pense à : tapisser."], ["gran", "d", "", "Pense à : grande."], ["chau", "d", "", "Pense à : chaude."],
      ["lézar", "d", "", "Pense à : lézarder."], ["heureu", "x", "", "Les mots en -eux s’écrivent avec un x : on ne l’entend jamais."], ["dou", "x", "", "Les mots en -oux s’écrivent avec un x : on ne l’entend jamais."], ["vieu", "x", "", "Les mots en -eux s’écrivent avec un x : on ne l’entend jamais."]],
    ecrire: ["fruit", "robot", "enfant", "sport", "tapis", "radis", "bois", "lézard", "grand", "chaud", "heureux", "doux"],
    devinettes: [["le contraire de petit", "grand"], ["le contraire de froid", "chaud"], ["un petit gâteau sec", "biscuit"], ["un animal qui saute dans la mare", "crapaud"], ["le contraire de jeune", "vieux"], ["on le met sur un vélo pour qu’on ne le vole pas", "cadenas"],
      ["il court sur les murs au soleil", "lézard"], ["le contraire de dur", "doux"], ["le judo, le foot, la natation", "sport"], ["on le pose par terre dans le salon", "tapis"], ["le contraire de triste", "heureux"], ["une machine qui bouge toute seule", "robot"]],
    gaps: [["Le ___ monte sur le mur.", "lézard"], ["Nina mange un ___ au chocolat.", "biscuit"], ["L’___ barrit dans la savane.", "éléphant"], ["Tao met un ___ sur son vélo.", "cadenas"], ["Maman achète des ___ au marché.", "radis"], ["Le ___ saute dans la mare.", "crapaud"],
      ["Les bateaux entrent dans le ___.", "port"], ["Le chat de Waeko est ___ comme une carotte.", "roux"], ["Il fait ___ en été.", "chaud"], ["Le cagou se cache dans les ___.", "bois"], ["Dylan range ses jouets sous le ___.", "tapis"], ["Le ___ danse avec ses bras en métal.", "robot"]],
    autres: function (w) { var L = OR_MU_T.concat(OR_MU_S, OR_MU_D, OR_MU_X).filter(function (x) { return x !== w; }); return HE.shuf(L).slice(0, 2); },
    entoure: { c: { fr: "Entoure la consonne muette à la fin de chaque mot.", en: "Circle the silent consonant at the end of each word." }, mots: ["robot", "sport", "enfant", "éléphant", "biscuit", "fruit", "cadenas", "bras", "tapis", "radis", "bois", "mois", "lézard", "grand", "chaud", "crapaud", "heureux", "vieux", "doux", "roux"].map(orMuet) },
    dictees: {
      1: ["Le [lézard] dort au soleil.", "Nina mange un [biscuit].", "Le [chat] est sur le [tapis].", "Papa a un [grand] [robot].", "Le [crapaud] saute dans l’eau.", "Tao a un [fruit] dans son sac."],
      2: ["Les [enfants] jouent dans les [bois].", "Le [vieux] [lézard] se cache sous le [tapis].", "Il fait [chaud] au [port] de Nouméa.", "Mon chat [roux] est très [heureux].", "Le [petit] [éléphant] suit sa maman.", "Maman met un [cadenas] sur le vélo."],
      3: ["Ce [matin], un [gros] [crapaud] est sorti du [bois] en faisant un [bruit] étrange.", "Pendant [trois] [mois], Tao a fait du [sport] au bord du [port].", "Sur le [tapis] du salon, le chat [roux] mange un [biscuit] aux [fruits].", "Le [vieux] [robot] de Dylan ne marche plus : il fait un [bruit] [doux] et [lent]."] },
    textes: [{ n: 1, titre: "Au jardin", t: "Le [chat] [gris] dort sous le [lit]. Le [lézard] court sur le [toit]. Il fait [chaud]." },
      { n: 2, titre: "Le goûter de Waeko", t: "Après l’école, Waeko prend un [biscuit] et un [fruit]. Son [petit] frère est très [heureux] : il boit un [chocolat] [chaud]." },
      { n: 3, titre: "Dans la forêt", t: "Au fond du [bois], Kakou le cagou cherche des vers. Un [gros] [crapaud] l’observe depuis un tronc. Soudain, un [bruit] [fort] fait fuir le [lézard] caché sous les feuilles. Le cagou, [heureux], reprend son repas." }],
    objectifs: ["L’élève est capable d’écrire la consonne muette (t, s, d, x) à la fin des mots étudiés.", "L’élève cherche un mot de la même famille pour trouver la consonne muette (sauf pour le x).", "L’élève écrit sans erreur les mots étudiés dans une dictée de phrases."] };
  OR.muettes.blocs = function (en) {
    var fam = [["fruit", "fruité"], ["grand", "grande"], ["petit", "petite"], ["gros", "grosse"]];
    return [[en ? "A silent consonant" : "Une consonne muette", "<ul><li>Beaucoup de <b>noms</b> et d’<b>adjectifs masculins</b> comportent une <b>consonne muette</b> en fin de mot.</li><li>Les plus courantes sont : <b class=\"mi-c\">t</b>, <b class=\"mi-c\">s</b>, <b class=\"mi-c\">d</b>, <b class=\"mi-c\">x</b>.</li><li>Les lettres <b class=\"mi-c\">c</b> et <b class=\"mi-c\">p</b> peuvent également se trouver à la fin des mots mais elles ne représentent que 2% des consonnes muettes</li></ul>"],
      [en ? "A word from the same family" : "Un mot de la même famille", "<p>Chercher un <b>mot de la même famille</b> peut aider à trouver la consonne muette finale, sauf pour le x.</p><p><u>Exemple</u> : frui<b>t</b> &gt; fruité</p><p>" + (en ? "Tap a word to see a word from its family." : "Touche un mot pour voir un mot de sa famille.") + "</p>" +
        orCartes("muettes", fam.map(function (x) { return [x[0].slice(0, -1) + "…", orMuet(x[0]) + " > " + x[1].replace(x[0].slice(-1), "[" + x[0].slice(-1) + "]")]; }))],
      [en ? "Words to pick" : "Les mots à piocher", "<p>" + (en ? "Tap a word to see its silent consonant." : "Touche un mot pour voir sa consonne muette.") + "</p>" +
        [["T", "38%", OR_MU_T], ["S", "15%", OR_MU_S], ["D", "5%", OR_MU_D], ["X", "8%", OR_MU_X]].map(function (g) { return '<p class="or-groupe"><b class="mi-c">' + g[0] + "</b> " + g[1] + "</p>" + orCartes("muettes", g[2].map(function (w) { return [w.slice(0, -1) + "…", orMuet(w)]; })); }).join("")]];
  };
  OR.muettes.jr = function (en) { var l = function (L) { return L.map(orMuet).map(orMarque).join(", "); }; return [
    { t: en ? "A silent consonant" : "Une consonne muette", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + orMarque("frui[t] · tapi[s]") + "</span>", 0) + lxPop('<span class="jr-ph">' + orMarque("gran[d] · dou[x]") + "</span>", 2) + "</div>",
      txt: ["Beaucoup de <b>noms</b> et d’<b>adjectifs masculins</b> comportent une <b>consonne muette</b> en fin de mot.", "Les plus courantes sont : t, s, d, x.", "Les lettres c et p peuvent également se trouver à la fin des mots mais elles ne représentent que 2% des consonnes muettes"] },
    { t: "T (38%)", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + l(["trot", "pot", "robot"]) + "</span>", 0) + lxPop('<span class="jr-ph">' + l(["port", "fort", "sport", "mort"]) + "</span>", 1) + lxPop('<span class="jr-ph">' + l(["enfant", "éléphant"]) + "</span>", 2) + lxPop('<span class="jr-ph">' + l(["biscuit", "fruit", "bruit"]) + "</span>", 3) + "</div>", txt: ["-ot, -ort, -ant, -uit"] },
    { t: "S (15%)", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + l(["pas", "cadenas", "bras"]) + "</span>", 0) + lxPop('<span class="jr-ph">' + l(["tapis", "colis", "radis"]) + "</span>", 1) + lxPop('<span class="jr-ph">' + l(["bois", "trois", "mois"]) + "</span>", 2) + "</div>", txt: ["-as, -is, -ois"] },
    { t: "D (5%) · X (8%)", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + l(["lézard", "cafard", "lard"]) + "</span>", 0) + lxPop('<span class="jr-ph">' + l(["grand", "normand", "chaud", "crapaud"]) + "</span>", 1) + lxPop('<span class="jr-ph">' + l(["amoureux", "vieux", "heureux"]) + "</span>", 2) + lxPop('<span class="jr-ph">' + l(["doux", "roux", "époux"]) + "</span>", 3) + "</div>", txt: ["-ard, -and, -aud", "-eux, -oux"] },
    { t: en ? "A word from the same family" : "Un mot de la même famille", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + orMarque("frui[t] > frui[t]é") + "</span>", 0) + lxPop('<span class="jr-ph">' + orMarque("gran[d] > gran[d]e") + "</span>", 2) + "</div>",
      txt: ["Chercher un <b>mot de la même famille</b> peut aider à trouver la consonne muette finale, sauf pour le x.", "Exemple : fruit > fruité"] }]; };
  OR.muettes.jrPersos = [["waeko", "presente"], ["waeko", "reflechit"], ["waeko", "content"], ["waeko", "reflechit"], ["waeko", "idee"]];
  OR.muettes.tbiQ = [
    { fr: "Lisez ces mots à voix haute. Quelle lettre ne s’entend pas ?", en: "Read these words aloud. Which letter can’t you hear?", illu: function () { return '<p class="tq-phrases"><span>fruit · tapis · grand · doux</span></p>'; } },
    { fr: "Quelle consonne muette ont tous ces mots ?", en: "Which silent consonant do all these words have?", illu: function () { return '<p class="tq-phrases"><span>robot · sport · enfant · biscuit</span></p>'; } },
    { fr: "Et ceux-là ?", en: "And these ones?", illu: function () { return '<p class="tq-phrases"><span>cadenas · radis · bois</span></p>'; } },
    { fr: "Et ceux-là ?", en: "And these ones?", illu: function () { return '<p class="tq-phrases"><span>lézard · grand · crapaud</span><span>heureux · doux · roux</span></p>'; } },
    { fr: "Comment savoir qu’il y a un t à la fin de « fruit » ?", en: "How can we know there is a t at the end of « fruit »?", illu: function () { return '<p class="tq-phrases"><span>un fruit… un jus fruité</span></p>'; } }];

  /* ---------- 3. Le -e après un groupe de consonnes (perso : Adi) ---------- */
  var OR_EG_R = ["sucre", "propre", "contre", "arbre", "coffre", "livre", "prendre", "tigre"], OR_EG_L = ["muscle", "souple", "cartable", "trèfle", "ongle", "règle"], OR_EG_CH = ["biche", "poche", "ruche", "bouche", "mouche", "tache"];
  function orGroupe(w) { return w.slice(0, -3) + "{" + w.slice(-3, -1) + "}[e]"; } /* sucre → su{cr}[e], biche → bi{ch}[e] */
  OR.egroupe = { titre: { fr: "Le -e après un groupe de consonnes", en: "The -e after a group of consonants" }, objectif: { fr: "Je sais écrire le -e à la fin des mots qui finissent par un groupe de consonnes.", en: "I can write the final -e of words that end with a group of consonants." }, perso: "adi",
    rappelFiche: { fr: "Tous les mots terminant par les groupes de consonnes cr, pr, tr, br, fr, vr, dr, gr, cl, pl, bl, fl, gl, ch prennent un -e à la fin.", en: "All words ending with the consonant groups cr, pr, tr, br, fr, vr, dr, gr, cl, pl, bl, fl, gl, ch take an -e at the end." },
    rappel: [
      { t: "choix", c: { fr: "Laquelle de ces lettres est une <b>voyelle</b> ?", en: "Which of these letters is a <b>vowel</b>?" }, o: ["a", "b", "r"], a: 0, ex: { fr: "Les voyelles : a, e, i, o, u, y. Les autres lettres sont des consonnes.", en: "The vowels: a, e, i, o, u, y. The other letters are consonants." } },
      { t: "choix", c: { fr: "Laquelle de ces lettres est une <b>consonne</b> ?", en: "Which of these letters is a <b>consonant</b>?" }, o: ["t", "e", "i"], a: 0, ex: { fr: "t est une consonne ; e et i sont des voyelles.", en: "t is a consonant; e and i are vowels." } },
      { t: "choix", c: { fr: "Écoute bien la fin du mot « livre ». Qu’entends-tu ?", en: "Listen carefully to the end of the word « livre ». What do you hear?" }, z: function (en) { return orEcoute("livre", en); }, o: ["vr", "li", "iv"], a: 0, ex: { fr: "Livre finit par les consonnes v et r : on entend « vr ».", en: "Livre ends with the consonants v and r: we hear « vr »." } }],
    carte: { c: { fr: "Écoute le mot. Par quel groupe de consonnes finit-il ? Lève la bonne carte.", en: "Listen to the word. Which group of consonants does it end with? Raise the right card." }, cartes: ["cr, pr, tr, br, fr, vr, dr, gr + e", "cl, pl, bl, fl, gl + e", "ch + e"],
      items: OR_EG_R.map(function (w) { return [w, 0]; }).concat(["table", "sable", "cercle"].map(function (w) { return [w, 1]; }), OR_EG_L.map(function (w) { return [w, 1]; }), OR_EG_CH.map(function (w) { return [w, 2]; }), [["chèvre", 0], ["zèbre", 0], ["vache", 2], ["niche", 2]]) },
    trous: [["su", "cre", "", "Le mot finit par le groupe cr : n’oublie pas le e."], ["ar", "bre", "", "Le mot finit par le groupe br : n’oublie pas le e."], ["li", "vre", "", "Le mot finit par le groupe vr : n’oublie pas le e."], ["ti", "gre", "", "Le mot finit par le groupe gr : n’oublie pas le e."],
      ["co", "ffre", "", "Le mot finit par le groupe fr (avec deux f) : n’oublie pas le e."], ["ta", "ble", "", "Le mot finit par le groupe bl : n’oublie pas le e."], ["rè", "gle", "", "Le mot finit par le groupe gl : n’oublie pas le e."], ["sou", "ple", "", "Le mot finit par le groupe pl : n’oublie pas le e."],
      ["mou", "che", "", "Le mot finit par ch : n’oublie pas le e."], ["po", "che", "", "Le mot finit par ch : n’oublie pas le e."], ["ru", "che", "", "Le mot finit par ch : n’oublie pas le e."], ["con", "tre", "", "Le mot finit par le groupe tr : n’oublie pas le e."]],
    ecrire: ["arbre", "livre", "tigre", "sucre", "table", "règle", "cartable", "mouche", "poche", "biche", "chèvre", "propre"],
    devinettes: [["on en met dans le gâteau", "sucre"], ["il a des branches et des feuilles", "arbre"], ["on le lit", "livre"], ["un grand félin rayé", "tigre"], ["on y cache un trésor", "coffre"], ["on mange dessus", "table"], ["elle sert à tracer des traits", "règle"],
      ["un petit insecte qui vole", "mouche"], ["on y met les mains", "poche"], ["la maison des abeilles", "ruche"], ["le contraire de sale", "propre"], ["on y range ses cahiers pour aller à l’école", "cartable"]],
    gaps: [["Le ___ se cache dans les herbes.", "tigre"], ["Je mets du ___ dans mon lait.", "sucre"], ["Léo range ses cahiers dans son ___.", "cartable"], ["Les abeilles vivent dans la ___.", "ruche"], ["Une ___ vole autour de la lampe.", "mouche"], ["Nina lit un ___ de contes.", "livre"],
      ["Le cagou se cache derrière un ___.", "arbre"], ["Je trace un trait avec ma ___.", "règle"], ["Il a une ___ de peinture sur son tee-shirt.", "tache"], ["Dylan met sa main dans sa ___.", "poche"], ["Une ___ court dans la forêt.", "biche"], ["Le pirate cache son trésor dans un ___.", "coffre"]],
    autres: function (w) { var L = OR_EG_R.concat(OR_EG_L, OR_EG_CH).filter(function (x) { return x !== w && x !== "prendre" && x !== "propre" && x !== "contre" && x !== "souple"; }); return HE.shuf(L).slice(0, 2); },
    entoure: { c: { fr: "Entoure le groupe de consonnes et le e à la fin de chaque mot.", en: "Circle the group of consonants and the e at the end of each word." }, mots: OR_EG_R.concat(OR_EG_L, OR_EG_CH).map(orGroupe) },
    dictees: {
      1: ["Le [tigre] dort.", "Léo lit un [livre].", "Il y a du [sable] sur la [table].", "La [mouche] vole.", "Nina ouvre son [cartable].", "La [chèvre] mange de l’herbe."],
      2: ["Les abeilles sortent de la [ruche].", "Tao range sa [règle] dans sa [poche].", "Le [tigre] se cache [contre] un [arbre].", "Maman met du [sucre] dans le gâteau.", "Une [biche] boit au bord de la rivière.", "Le pirate ouvre son [coffre] avec une clé."],
      3: ["Le [maître] dessine un [cercle] sur la [vitre] de la classe.", "Dans la forêt, une [biche] [souple] saute par-dessus un [arbre] tombé.", "Adi a fait une [tache] de [sucre] sur la couverture de son [livre].", "Sur la [table] du salon, Papi Tao a posé sa [montre] et un [cadre] doré."] },
    textes: [{ n: 1, titre: "Au zoo", t: "Au zoo, je vois un [tigre] et un [zèbre]. La [chèvre] mange de l’herbe." },
      { n: 2, titre: "Le cartable d’Adi", t: "Adi ouvre son [cartable]. Il prend son [livre], sa [règle] et un [cadre] pour sa photo. Une [mouche] se pose sur la [table]." },
      { n: 3, titre: "La ruche du jardin", t: "Au fond du jardin, Papi Tao a installé une [ruche] [contre] le vieil [arbre]. Les abeilles fabriquent du miel, plus doux que le [sucre]. Adi les regarde de loin, la main devant la [bouche] : il ne veut surtout pas les déranger." }],
    objectifs: ["L’élève est capable d’écrire le e final des mots qui finissent par cr, pr, tr, br, fr, vr, dr, gr, cl, pl, bl, fl, gl ou ch.", "L’élève écrit sans erreur les mots étudiés dans une dictée de phrases."] };
  OR.egroupe.blocs = function (en) {
    var c = function (L) { return orCartes("egroupe", L.map(function (w) { return [w.slice(0, -3) + "…", orGroupe(w)]; })); };
    return [[en ? "The rule" : "La règle", "<ul><li>Tous les mots terminant par les groupes de consonnes <b>cr</b>, <b>pr</b>, <b>tr</b>, <b>br</b>, <b>fr</b>, <b>vr</b>, <b>dr</b>, <b>gr</b>, <b>cl</b>, <b>pl</b>, <b>bl</b>, <b>fl</b>, <b>gl</b>, <b>ch</b>, prennent un -<b class=\"mi-c\">e</b> à la fin.</li></ul>" + '<p class="or-plus">+ <span class="mi-c">e</span></p>'],
      [en ? "Words to pick" : "Les mots à piocher", "<p>" + (en ? "Tap a word to see how it ends." : "Touche un mot pour voir comment il finit.") + '</p><p class="or-groupe"><b class="mi-c">cr, pr, tr, br, fr, vr, dr, gr</b></p>' + c(OR_EG_R) + '<p class="or-groupe"><b class="mi-c">cl, pl, bl, fl, gl</b></p>' + c(OR_EG_L) + '<p class="or-groupe"><b class="mi-c">ch</b></p>' + c(OR_EG_CH)]];
  };
  OR.egroupe.jr = function (en) { var l = function (L) { return L.map(orGroupe).map(orMarque).join(", "); }; return [
    { t: en ? "The rule" : "La règle", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph or-grand">+ <span class="mi-c">e</span></span>', 0) + "</div>", txt: ["Tous les mots terminant par les groupes de consonnes <b>cr</b>, <b>pr</b>, <b>tr</b>, <b>br</b>, <b>fr</b>, <b>vr</b>, <b>dr</b>, <b>gr</b>, <b>cl</b>, <b>pl</b>, <b>bl</b>, <b>fl</b>, <b>gl</b>, <b>ch</b>, prennent un -e à la fin."] },
    { t: "cr, pr, tr, br, fr, vr, dr, gr", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + l(["sucre", "propre", "contre"]) + "</span>", 0) + lxPop('<span class="jr-ph">' + l(["arbre", "coffre", "livre"]) + "</span>", 1) + lxPop('<span class="jr-ph">' + l(["prendre", "tigre"]) + "</span>", 2) + "</div>", txt: ["sucre, propre, contre, arbre, coffre, livre, prendre, tigre"] },
    { t: "cl, pl, bl, fl, gl", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + l(["muscle", "souple", "cartable"]) + "</span>", 0) + lxPop('<span class="jr-ph">' + l(["trèfle", "ongle", "règle"]) + "</span>", 2) + "</div>", txt: ["muscle, souple, cartable, trèfle, ongle, règle"] },
    { t: "ch", svg: '<div class="lx-illu lx-col jr-phrases">' + lxPop('<span class="jr-ph">' + l(["biche", "poche", "ruche"]) + "</span>", 0) + lxPop('<span class="jr-ph">' + l(["bouche", "mouche", "tache"]) + "</span>", 2) + "</div>", txt: ["biche, poche, ruche, bouche, mouche, tache"] }]; };
  OR.egroupe.jrPersos = [["adi", "presente"], ["adi", "reflechit"], ["adi", "idee"], ["adi", "victoire"]];
  OR.egroupe.tbiQ = [
    { fr: "Observez la fin de ces mots. Que remarquez-vous ?", en: "Look at the end of these words. What do you notice?", illu: function () { return '<p class="tq-phrases"><span>sucre · arbre · table · biche</span></p>'; } },
    { fr: "Par quelles consonnes finissent ces mots ? Qu’ajoute-t-on ?", en: "Which consonants do these words end with? What do we add?", illu: function () { return '<p class="tq-phrases"><span>su… · ar… · li… · ti…</span></p>'; } },
    { fr: "Et ceux-là ?", en: "And these ones?", illu: function () { return '<p class="tq-phrases"><span>carta… · rè… · tr…</span></p>'; } },
    { fr: "Et ceux-là ?", en: "And these ones?", illu: function () { return '<p class="tq-phrases"><span>bi… · po… · mou…</span></p>'; } }];

  /* ---------- outils communs ---------- */
  function orCartes(id, L) {
    return '<div class="or-cartes">' + L.map(function (x) { var cle = id + "|" + x[1], vu = OR_VU[cle];
      return '<button type="button" class="or-carte' + (vu ? " vu" : "") + '" data-action="or-voir" data-v="' + esc(cle) + '" aria-pressed="' + !!vu + '"><span class="or-cue">' + esc(x[0]) + '</span><span class="or-mot">' + (vu ? orMarque(x[1]) : "?") + "</span></button>"; }).join("") + "</div>";
  }
  function actionOrth(a, el) {
    if (a === "or-voir") OR_VU[el.dataset.v] = !OR_VU[el.dataset.v];
    else if (a === "or-tiret") OR_TIRET = +el.dataset.v;
  }
  function orLecon(id) { var O = OR[id], en = langue === "en"; return lxLecon(id, tr(O.titre), O.blocs(en), O.jrFn, "francais"); }
  /* le mot dit à l’oral (les nombres sont dits en lettres) */
  function orDit(id, x) { return id === "nombres" ? orNombre(x) : x; }
  function orDicteeQs(id) { var O = OR[id], n = lire("dictee-niv", 1), P = HE.shuf(O.dictees[n]).slice(0, 3), T = O.textes.filter(function (x) { return x.n === n; })[0];
    return P.map(function (s) { return { t: "dictee", texte: s, c: { fr: "Écoute la phrase, écris-la sur ton cahier, puis touche « J’ai fini ».", en: "Listen to the sentence, write it in your exercise book, then tap « I’ve finished »." } }; })
      .concat(T ? [{ t: "dictee", texte: T.t, titre: T.titre, c: { fr: "Écoute le petit texte, écris-le sur ton cahier, puis touche « J’ai fini ».", en: "Listen to the short text, write it in your exercise book, then tap « I’ve finished »." } }] : []); }
  function orQuiz(id) {
    var O = OR[id], p = O.perso, lbl = function (o) { return typeof o === "string" ? { fr: o, en: o } : o; };
    return { matiere: "francais", jeux: {
      rappel: { perso: p, etape: 0, fr: "Je me rappelle", en: "I remember", dfr: id === "nombres" ? "Lire un nombre ; les mots-nombres." : id === "muettes" ? "Masculin et féminin ; un mot de la même famille." : "Voyelles et consonnes.", den: id === "nombres" ? "Reading a number; number words." : id === "muettes" ? "Masculine and feminine; a word from the same family." : "Vowels and consonants.",
        gen: function () { return O.rappel.map(function (q) { return { t: q.t, c: q.c, z: q.z, o: q.o.map(lbl), a: q.a, ex: q.ex }; }); } },
      carte: { perso: p, etape: 1, fr: "J’écoute et je montre", en: "I listen and show", dfr: id === "nombres" ? "J’écoute un nombre et je touche le mot qui l’écrit." : "J’écoute un mot et je lève la bonne carte.", den: id === "nombres" ? "I listen to a number and tap the word that writes it." : "I listen to a word and raise the right card.",
        gen: function () { return HE.shuf(O.carte.items).slice(0, 8).map(function (x) {
          if (id === "nombres") { var o = HE.shuf(x[1]); return { t: "choix", c: O.carte.c, z: function (en) { return orEcoute(x[0], en, tr(O.carte.lib)); }, o: o.map(lbl), a: o.indexOf(x[0]), ex: { fr: "On écrit « " + x[0] + " ».", en: "We write « " + x[0] + " »." } }; }
          return { t: "choix", c: O.carte.c, z: function (en) { return orEcoute(x[0], en); }, o: O.carte.cartes.map(lbl), a: x[1],
            ex: { fr: "On écrit « " + orMarque(id === "muettes" ? orMuet(x[0]) : orGroupe(x[0])) + " ».", en: "We write « " + orMarque(id === "muettes" ? orMuet(x[0]) : orGroupe(x[0])) + " »." } }; }); } },
      completer: { perso: p, etape: 2, fr: "Je complète", en: "I complete", dfr: "J’écris les lettres qui manquent.", den: "I write the missing letters.",
        gen: function () { return HE.shuf(O.trous).slice(0, 8).map(function (x) { var nb = id === "nombres", T = nb ? x.slice(1) : x, mot = T[0] + T[1] + T[2];
          return { t: "ecrire", c: { fr: "Écris les lettres qui manquent.", en: "Write the missing letters." }, z: function (en) { return nb ? orGros(String(x[0])) : orEcoute(mot, en); }, avant: T[0], apres: T[2], r: [T[1]],
            ex: { fr: "« " + esc(T[0]) + '<span class="mi-c">' + esc(T[1]) + "</span>" + esc(T[2]) + " » — " + esc(T[3]), en: "« " + esc(T[0]) + '<span class="mi-c">' + esc(T[1]) + "</span>" + esc(T[2]) + " » — " + esc(T[3]) } }; }); } },
      ecrire: { perso: p, etape: 2, fr: id === "nombres" ? "J’écris les nombres" : "J’écris les mots", en: id === "nombres" ? "I write the numbers" : "I write the words", dfr: id === "nombres" ? "J’écris les nombres en lettres." : "J’écoute le mot, puis je l’écris.", den: id === "nombres" ? "I write numbers in words." : "I listen to the word, then I write it.",
        gen: function () { return HE.shuf(O.ecrire).slice(0, 8).map(function (x) { var nb = id === "nombres", mot = nb ? orNombre(x) : x;
          return { t: "ecrire", c: nb ? { fr: "Écris ce nombre en lettres, avec des tirets entre chaque mot.", en: "Write this number in words, with hyphens between every word." } : { fr: "Écoute le mot, puis écris-le.", en: "Listen to the word, then write it." },
            z: function (en) { return nb ? orGros(String(x)) : orEcoute(mot, en); }, r: [mot], ex: { fr: "On écrit « " + (nb ? esc(mot) : orMarque(id === "muettes" ? orMuet(mot) : orGroupe(mot))) + " ».", en: "We write « " + (nb ? esc(mot) : orMarque(id === "muettes" ? orMuet(mot) : orGroupe(mot))) + " »." } }; }); } },
      dictee: { perso: p, etape: 3, fr: "La dictée", en: "Dictation", dfr: "J’écris des phrases et un petit texte dictés, puis je me corrige.", den: "I write dictated sentences and a short text, then I check them.", gen: function () { return orDicteeQs(id); } }
    } };
  }
  /* au TBI : « j’écoute et je montre » puis « j’écris sur l’ardoise » */
  function orTq(id) { var O = OR[id], qs = [], lbl = function (o) { return typeof o === "string" ? { fr: o, en: o } : o; };
    var bouton = function (texte, en) { return '<p class="tq-ecoute"><button class="coco-btn" type="button" data-action="tq-dire" data-v="' + esc(texte) + '">' + (en ? "Listen" : "Écouter") + "</button></p>"; };
    HE.shuf(O.carte.items).slice(0, 5).forEach(function (x) {
      if (id === "nombres") { var o = HE.shuf(x[1]); qs.push({ t: "choix", c: O.carte.c, z: function (en, voir) { return voir ? '<span class="mi-mot">' + esc(x[0]) + "</span>" : bouton(x[0], en); }, o: o.map(lbl), a: o.indexOf(x[0]), ex: { fr: "On écrit « " + x[0] + " ».", en: "We write « " + x[0] + " »." } }); return; }
      var m = id === "muettes" ? orMuet(x[0]) : orGroupe(x[0]);
      qs.push({ t: "choix", c: O.carte.c, z: function (en, voir) { return voir ? '<span class="mi-mot">' + orMarque(m) + "</span>" : bouton(x[0], en); }, o: O.carte.cartes.map(lbl), a: x[1], ex: { fr: "On écrit « " + orPlain(m) + " ».", en: "We write « " + orPlain(m) + " »." } }); });
    HE.shuf(O.ecrire).slice(0, 5).forEach(function (x) { var nb = id === "nombres", mot = nb ? orNombre(x) : x, m = nb ? mot : id === "muettes" ? orMuet(mot) : orGroupe(mot);
      qs.push({ t: "ecrit", c: nb ? { fr: "Écris ce nombre en lettres sur ton ardoise.", en: "Write this number in words on your board." } : { fr: "Écoute le mot, puis écris-le sur ton ardoise.", en: "Listen to the word, then write it on your board." },
        z: function (en, voir) { return voir ? '<span class="mi-mot">' + orMarque(m) + "</span>" : nb ? '<p class="or-cue">' + x + "</p>" : bouton(mot, en); }, ex: { fr: "On écrit « " + mot + " ».", en: "We write « " + mot + " »." } }); });
    return HE.shuf(qs); }
  /* fiche enseignante : toutes les dictées, à lire en classe */
  function orDicteesFiche(id) { var O = OR[id], N = ["", "★ Niveau simple", "★★ Niveau modéré", "★★★ Niveau complexe"];
    return '<section><h2>Les dictées (à lire en classe)</h2><p>Les mots en gras sont les mots de la régularité. Les mêmes dictées sont lues par le site dans « La dictée ».</p><div class="f-deux">' + [1, 2, 3].map(function (n) { var T = O.textes.filter(function (x) { return x.n === n; })[0];
      return "<section><h3>" + N[n] + "</h3><ul>" + O.dictees[n].map(function (s) { return "<li>" + orCibles(s) + "</li>"; }).join("") + "</ul>" + (T ? "<p><b>« " + esc(T.titre) + " »</b> : " + orCibles(T.t) + "</p>" : "") + "</section>"; }).join("") + "</div></section>"; }
  function orFiche(id) { var O = OR[id], F = OR_FICHE[id];
    return ficheSeq({ seq: id, mat: "francais", prog: id, dom: "Français · Étude de la langue (orthographe)", tbi: "#tbi-" + id,
      seances: [
        ["Séance 1", "Découverte. Découvrir la régularité : observer des mots, formuler la règle avec les élèves.", "Au TBI (découverte guidée) · Revoir la leçon · Je me rappelle"],
        ["Séance 2", "Évocation et reconnaissance. Chercher d’autres mots ; reconnaître la régularité à l’oral (je te dis, tu montres).", "J’écoute et je montre · Au TBI (ardoises)"],
        ["Séance 3", "Écrire les mots. Compléter, puis écrire les mots de la leçon.", "Je complète · " + (id === "nombres" ? "J’écris les nombres" : "J’écris les mots")],
        ["Séance 4", "Dictées. Écrire des phrases puis un petit texte dictés, puis se corriger (3 niveaux).", "La dictée · dictées à lire en classe ci-dessous"],
        ["Séance 5", "Évaluation. Évaluer les objectifs de la séquence.", "Fiche d’exercices (3 niveaux, corrigé, correction au TBI)"]],
      erreurs: F.erreurs, conseils: F.conseils.concat(["Aucun mot mal écrit n’est montré aux élèves : on ne choisit jamais entre plusieurs écritures d’un même mot (principe d’Ouzoulias).", "La voix des activités se règle dans Espace enseignante › Voix de la dictée (voix et vitesse).", "La fiche d’exercices existe en 3 niveaux (★, ★★, ★★★), avec les mêmes objectifs ; le même numéro redonne les mêmes exercices, pour corriger au TBI."]),
      prolonger: F.prolonger, extra: orDicteesFiche(id), sources: F.sources }); }
  var OR_FICHE = {
    nombres: { erreurs: ["Oublier les tirets, ou n’en mettre qu’un : « vingt et un », « soixante dix-neuf » ; la leçon demande un tiret entre chaque mot.", "Écrire la fin -ze comme on l’entend (« -se ») : onze, douze… seize finissent par -ze.", "Oublier les lettres muettes : deux, trois, sept, huit, vingt, cent.", "Confondre trente et les mots en -ante (« trante ») ; écrire cinq sans q.", "Confondre quatorze, quarante et quatre, ou six, seize et soixante, à l’oral comme à l’écrit."],
      conseils: ["Code de la leçon : la partie qui se répète en orange, les points d’attention en jaune moutarde."], prolonger: ["Écrire les nombres en lettres sur les chèques fictifs de la classe (monnaie) ou dans les problèmes.", "Repérer les nombres écrits en lettres dans les albums et les documents de la classe.", "Plus tard : quatre-vingts, deux-cents (le s de vingt et de cent)."],
      sources: "Sources : leçon de classe « Les nombres en lettres » (2026) ; démarche de Laura MARIE, « Mon répertoire de dictées par régularités » (L’Atelier de l’orthophoniste, 2025), aucune dictée reprise ; programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, français p. 30, mathématiques p. 4 et 5)." },
    muettes: { erreurs: ["Écrire le mot sans sa consonne muette (« frui », « gran ») : faire chercher un mot de la même famille (fruité, grande).", "Choisir la mauvaise consonne (t, s ou d) : le mot de la même famille la fait entendre.", "Chercher un mot de la même famille pour le x : ça ne marche pas (doux, heureux) ; les mots en -eux, -oux s’apprennent.", "Ajouter une consonne muette là où il n’y en a pas : vérifier avec le féminin."],
      conseils: ["Code de la leçon : la consonne muette en orange."], prolonger: ["Construire une affiche de la classe : un mot, un mot de sa famille (petit / petite, sport / sportif).", "Jeu oral : « je dis le féminin, tu trouves la consonne muette ».", "Revoir les lettres muettes des nombres (deux, trois, vingt, cent) avec la séquence « Les nombres en lettres »."],
      sources: "Sources : leçon de classe « Écrire les mots avec des consonnes muettes » (2026), d’après la fiche 1 de Laura MARIE, « Mon répertoire de dictées par régularités » (2025), aucune dictée reprise ; pourcentages : Laura MARIE, « Mon répertoire des régularités orthographiques » ; programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, français p. 9, 28 et 30)." },
    egroupe: { erreurs: ["Oublier le e final (« sucr », « arbr ») : on ne l’entend pas, mais il est obligatoire après ces groupes.", "Écrire « ch » sans e (« mouch »).", "Mal écrire le groupe lui-même (« abre » pour arbre) : faire épeler la fin du mot à l’oral.", "Doubler une consonne à tort, ou oublier le double f de coffre."],
      conseils: ["Code de la leçon : le groupe de consonnes en gras, le e en orange."], prolonger: ["Chercher d’autres mots en -tre, -ble, -che dans les lectures de la classe et compléter l’affiche.", "Jeu oral « Lève la carte » : cr…, cl…, ch…", "Faire relire les écrits de la classe en cherchant les mots qui finissent par un groupe de consonnes : le e est-il là ?"],
      sources: "Sources : leçon de classe « Écrire les mots avec -e après un groupe de consonnes » (2026), d’après la fiche 3 de Laura MARIE, « Mon répertoire de dictées par régularités » (2025), aucune dictée reprise ; « gr » ajouté à la règle (accord de l’enseignante) ; programmes de Nouvelle-Calédonie 2021, repères de progressivité de la DENC (cycle 2, français p. 27, 28 et 30)." } };
  PROG.nombres = { ref: "Français · Étude de la langue (orthographe lexicale) · Mathématiques (nombres)", att: PROG.mots.att, socle: [1, 2], comp: "Comprendre le fonctionnement de la langue : s’initier à l’orthographe lexicale. En mathématiques : nommer, lire, écrire, représenter des nombres entiers.", rp: "français p. 30 ; mathématiques p. 4 et 5",
    reperes: ["Il connaît l’orthographe des mots étudiés.", "Il raisonne en fonction des catégories de mots et de la morphologie pour orthographier correctement les mots.", "Utiliser diverses représentations des nombres (écritures en chiffres et en lettres, noms à l’oral, graduations sur une demi-droite, constellations sur des dés, doigts de la main…)."] };
  PROG.muettes = { ref: "Français · Étude de la langue (orthographe lexicale)", att: PROG.mots.att, socle: [1, 2], comp: "Comprendre le fonctionnement de la langue : maîtriser les relations entre l’oral et l’écrit ; s’initier à l’orthographe lexicale.", rp: "français p. 9, 28 et 30",
    reperes: ["Il repère dans un mot la présence de lettres muettes en appui sur ses connaissances en grammaire.", "Il explique le rôle des lettres muettes.", "Il raisonne en fonction des catégories de mots et de la morphologie pour orthographier correctement les mots."] };
  PROG.egroupe = { ref: "Français · Étude de la langue (correspondances grapho-phoniques)", att: PROG.mots.att, socle: [1, 2], comp: "Comprendre le fonctionnement de la langue : maîtriser les relations entre l’oral et l’écrit ; s’initier à l’orthographe lexicale.", rp: "français p. 27, 28 et 30",
    reperes: ["Il consolide l’ensemble des phonèmes du français et des graphèmes associés.", "Il observe et relève les phénomènes irréguliers afin de les mémoriser progressivement.", "Il connaît l’orthographe des mots étudiés."] };

  /* ---------- fiches d’exercices en 3 niveaux (même structure que les mots invariables, D-132) ---------- */
  function orTrouFiche(id, x, premiere) { var nb = id === "nombres", T = nb ? x.slice(1) : x, mot = T[0] + T[1] + T[2];
    return premiere ? { cue: nb ? x[0] : "", before: mot.charAt(0), seg: mot.slice(1), after: "" } : { cue: nb ? x[0] : "", before: T[0], seg: T[1], after: T[2] }; }
  function orTrousHtml(L) { var dev = L.some(function (x) { return x.indice; });
    return '<ul class="ex-fr ' + (dev ? "ex-devinettes" : "ex-mots") + '">' + L.map(function (x) { return "<li>" + (x.cue !== "" ? "<b>" + x.cue + "</b> : " : "") + (x.indice ? '<span class="ex-indice">' + esc(x.indice) + "</span> → " : "") + esc(x.before) + exT(esc(x.seg)) + esc(x.after) + "</li>"; }).join("") + "</ul>"; }
  function orMotsDictee(id, n) { return HE.shuf(OR[id].ecrire).slice(0, n); }
  function orExos(id, d, en, niv) { var O = OR[id], nb = id === "nombres";
    var dev = d.trous.some(function (x) { return x.indice; });
    var ex = [{ c: dev ? (en ? "Find the word and write it: its first letter is given." : "Trouve le mot et écris-le : sa première lettre est donnée.") : (en ? "Fill in the missing letters." : "Complète les lettres qui manquent."), q: orTrousHtml(d.trous), r: d.trous.map(function (x) { return (x.cue !== "" ? x.cue + " : " : "") + esc(x.before + x.seg + x.after); }).join(" · ") }];
    ex.push({ c: niv === 3 ? (nb ? (en ? "Complete each sentence: write the number in words." : "Complète chaque phrase en écrivant le nombre en lettres.") : (en ? "Complete each sentence with a word from the lesson." : "Complète chaque phrase avec un mot de la leçon.")) : (en ? "Complete each sentence with a word from the list." : "Complète chaque phrase avec un mot de la liste."),
      q: (niv === 3 ? "" : '<p class="ex-fr ex-banque">' + HE.shuf(d.phrases.map(function (x) { return x[1]; })).map(esc).join(" · ") + "</p>") + '<ul class="ex-fr ex-phrases">' + d.phrases.map(function (x) { return "<li>" + esc(x[0]).split("___").join(exT(esc(x[1]))) + "</li>"; }).join("") + "</ul>", r: d.phrases.map(function (x) { return esc(x[1]); }).join(" · ") });
    if (nb) ex.push({ c: en ? "Write the numbers in words." : "Écris les nombres en lettres.", q: '<ol class="ex-dictee ex-deux-col-ol">' + d.mots.map(function (x) { return "<li><b>" + x + "</b> : " + exT(esc(orNombre(x)), true) + "</li>"; }).join("") + "</ol>", r: d.mots.map(function (x) { return x + " : " + orNombre(x); }).join(" · ") });
    else ex.push({ c: en ? "Word dictation: write the words your teacher reads." : "Dictée de mots : écris les mots que dit la maîtresse.", q: '<ol class="ex-dictee ex-deux-col-ol">' + d.mots.map(function (x) { return "<li>" + exT(esc(x), true) + "</li>"; }).join("") + "</ol>", r: (en ? "Words to read aloud: " : "Mots à dicter : ") + d.mots.join(" · ") });
    ex.push(moDicteePhrases(d.dicteePh.map(orPlain), en));
    return ex; }
  function orExosDef(id) { var O = OR[id];
    EXOS[id] = { seq: "seq-" + id, matiere: "francais", titre: function () { return tr(O.titre); }, rappel: function (en) { return en ? O.rappelFiche.en : O.rappelFiche.fr; },
      tirer: function () { return { trous: HE.shuf(O.trous).slice(0, 6).map(function (x) { return orTrouFiche(id, x); }), phrases: HE.shuf(O.gaps).slice(0, 4), mots: orMotsDictee(id, 6), dicteePh: HE.shuf(O.dictees[2]).slice(0, 1) }; },
      exos: function (d, en) { return orExos(id, d, en, 2); } };
    exNiveaux(id, O.objectifs, {
      but: id === "nombres" ? "Les mêmes nombres, avec des aides : entourer la fin -ze ou -ante, cocher le nombre qui complète la phrase, remettre les lettres dans l’ordre, remettre les mots de la phrase dans l’ordre." : "Les mêmes mots, avec des aides : entourer la régularité, cocher le mot qui complète la phrase, remettre les lettres dans l’ordre, remettre les mots de la phrase dans l’ordre.",
      rappel: EXOS[id].rappel,
      tirer: function () { var nb = id === "nombres", L = HE.shuf(O.ecrire).slice(0, 4);
        return { entoure: HE.shuf(O.entoure.mots).slice(0, 6), phrases: HE.shuf(O.gaps).slice(0, 3).map(function (x) { return { s: x[0], w: x[1], o: HE.shuf([x[1]].concat(O.autres(x[1]))) }; }),
          lettres: L.map(function (x) { var mot = nb ? orNombre(x) : x; return { cue: nb ? x : "", mot: mot, g: moMelanger(mot.replace(/-/g, " ")) }; }), ordre: HE.shuf(O.dictees[1]).slice(0, 1).map(function (s) { var p = orPlain(s); return { p: p, m: moMotsMelanges(p) }; }) }; },
      exos: function (d, en) {
        return [{ c: en ? O.entoure.c.en : O.entoure.c.fr, q: '<p class="ex-fr ex-banque">' + d.entoure.map(function (w) { return exS(esc(orPlain(w)), orMarque(w), true); }).join(" · ") + "</p>", r: d.entoure.map(orMarque).join(" · ") },
          { c: en ? "Tick the word that completes the sentence." : "Coche le mot qui complète la phrase.", q: '<ul class="ex-fr ex-phrases ex-cocher">' + d.phrases.map(function (x) { return "<li>" + esc(x.s).split("___").join("……") + '<span class="ex-coches">' + x.o.map(function (w) { return '<span class="ex-coche">' + exS("☐", w === x.w ? "☑" : "☐", true) + " " + esc(w) + "</span>"; }).join("") + "</span></li>"; }).join("") + "</ul>", r: d.phrases.map(function (x) { return esc(x.w); }).join(" · ") },
          { c: id === "nombres" ? (en ? "Put the letters in order to write the number." : "Remets les lettres dans l’ordre pour écrire le nombre.") : (en ? "Put the letters in order to write the word." : "Remets les lettres dans l’ordre pour écrire le mot."),
            q: '<ul class="ex-fr ex-lettres">' + d.lettres.map(function (x) { return "<li>" + (x.cue !== "" ? "<b>" + x.cue + "</b> " : "") + moCarreaux(x.g) + " → " + exT(esc(x.mot)) + "</li>"; }).join("") + "</ul>", r: d.lettres.map(function (x) { return esc(x.mot); }).join(" · ") },
          { c: en ? "Put the words in order to write the sentence." : "Remets les mots dans l’ordre pour écrire la phrase.", q: d.ordre.map(function (x) { return '<p class="ex-fr ex-banque">' + x.m.map(esc).join(" · ") + '</p><p class="ex-invente">' + exT(esc(x.p), true) + "</p>"; }).join(""), r: d.ordre.map(function (x) { return esc(x.p); }).join(" ") }];
      }
    }, "Fiche d’origine : lettres qui manquent, phrases à compléter avec un mot de la liste, " + (id === "nombres" ? "nombres à écrire en lettres" : "dictée de mots") + ", dictée d’une phrase.", {
      but: "Moins d’aide : " + (id === "nombres" ? "seule la première lettre est donnée" : "une devinette et la première lettre") + ", phrases à compléter sans la liste, " + (id === "nombres" ? "nombres plus grands à écrire en lettres" : "dictée de mots") + ", dictée de deux phrases plus longues.",
      rappel: EXOS[id].rappel,
      tirer: function () { var nb = id === "nombres";
        return { trous: nb ? HE.shuf(O.trous).slice(0, 6).map(function (x) { return orTrouFiche(id, x, true); }) : HE.shuf(O.devinettes).slice(0, 6).map(function (x) { return { cue: "", indice: x[0], before: x[1].charAt(0), seg: x[1].slice(1), after: "" }; }), phrases: HE.shuf(O.gaps).slice(0, 4), mots: nb ? HE.shuf(O.ecrire.filter(function (x) { return x > 16; })).slice(0, 6) : orMotsDictee(id, 8), dicteePh: HE.shuf(O.dictees[3]).slice(0, 2) }; },
      exos: function (d, en) { return orExos(id, d, en, 3); }
    });
  }
  ORTH_IDS.forEach(function (id) { var O = OR[id];
    C[id] = { matiere: "francais", titre: O.titre, objectif: O.objectif };
    QUIZ[id] = orQuiz(id);
    O.jrFn = function (en) { return O.jr(en); }; O.jrFn.persos = O.jrPersos;
    TBI_SEQ[id] = { src: O.jrFn, mat: "francais", pool: function () { return orTq(id); }, questions: O.tbiQ };
    orExosDef(id);
  });

  var ROUTES = {
    accueil: pageAccueil, "seq-verbe": function () { return pageSequence("verbe"); }, "seq-mots": pageSequenceMots, "lecon-mots": pageLeconMots, "fiche-mots": ficheMots,
    "seq-heure": pageSequenceHeure, "seq-digitale": pageSequenceDigitale, "ens-suivi": pageEnsSuivi, "ens-etoiles": function () { return pageEnsEtoiles("calcul"); }, "ens-etoiles-grammaire": function () { return pageEnsEtoiles("grammaire"); }, "ens-corriges": pageEnsCorriges, "ens-etoiles-fiches": function () { return pageEnsFichesEtoiles(false); }, "ens-voix": pageEnsVoix, "ens-etoiles-fiches-tout": function () { return pageEnsFichesEtoiles(true); }, "ens-corriges-grammaire": pageEnsCorrigesGram, "ens-sequences": pageEnsSequences, "ens-formation": pageEnsFormation, "fiche-digitale": ficheDigitale, "seq-diagrammes": pageSequenceDiagrammes, "lecon-diagrammes": pageLeconDiagrammes, "fiche-diagrammes": ficheDiagrammes, "fiche-masses": ficheMasses, "fiche-verbe": ficheVerbe, "fiche-division": ficheDivision, "fiche-monnaie": ficheMonnaie, "lecon-heure": function () { return pageLeconHeure(true); }, "maquette-retiens": function () { return pageLeconHeure(true); }, "fiche-heure": ficheHeure, "exos-heure": function () { return pageExos("heure"); }, "lecon-digitale": pageLeconDigitale, "lecon-division": pageLeconDivision, "lecon-monnaie": pageLeconMonnaie, "lecon-masses": pageLeconMasses, "exos-verbe": function () { return pageExos("verbe"); }, "exos-mots": function () { return pageExos("mots"); },
    "exos-monnaie": function () { return pageExos("monnaie"); }, "exos-division": function () { return pageExos("division"); }, "exos-masses": function () { return pageExos("masses"); }, "exos-digitale": function () { return pageExos("digitale"); }, "exos-diagrammes": function () { return pageExos("diagrammes"); }, "tbi-heure": pageTbiHeure,
    "seq-imparfait": function () { return pageSequence("imparfait"); }, "lecon-imparfait": pageLeconImparfait, "fiche-imparfait": ficheImparfait, "exos-imparfait": function () { return pageExos("imparfait"); },
    "lecon-verbe": pageLecon, "jeu-verbe-decouvre": jeuDecouvre, "jeu-verbe-chasse": jeuChasse, enseignante: pageEnseignante, banque: pageBanque
  };
  C.matieres.forEach(function (m) { ROUTES[m.id] = function () { return pageMatiere(m.id); }; });
  Object.keys(JEUX_MOTS).forEach(function (j) { ROUTES["mots-" + j] = function () { return jeuMots(j); }; });
  Object.keys(JEUX_HEURE).forEach(function (j) { ROUTES["heure-" + j] = function () { return jeuHeure(j); }; });
  Object.keys(JEUX_DIAG).forEach(function (j) { ROUTES["diag-" + j] = function () { return jeuDiag(j); }; });
  Object.keys(PO.sequences).forEach(function (sid) { ROUTES["seq-" + sid] = function () { return pageSequence(sid); }; });
  Object.keys(TBI_SEQ).forEach(function (sq) { ROUTES["tbi-" + sq] = function () { return pageTbiSeq(sq); }; });
  Object.keys(FO.fiches).concat(["sullivan"]).forEach(function (c) { if (c === "sullivan" || !FO.fiches[c].vide) ROUTES["ens-form-" + c] = function () { return pageFormationFiche(c); }; });
  Object.keys(PO.problemes).forEach(function (id) {
    ROUTES["po-" + id] = function () { return poAutonome(id); };
    ROUTES["classe-" + id] = function () { return poClasse(id); };
    ROUTES["fiche-" + id] = function () { return poFiche(id); };
    ROUTES["feuille-" + id] = function () { return poFeuille(id); };
  });
  Object.keys(QUIZ).forEach(function (seq) { Object.keys(QUIZ[seq].jeux).forEach(function (jeu) { ROUTES["qz-" + seq + "-" + jeu] = function () { return jeuQZ(seq, jeu); }; }); });
  ORTH_IDS.forEach(function (id) { ROUTES["seq-" + id] = function () { return pageSequence(id); }; ROUTES["lecon-" + id] = function () { return orLecon(id); }; ROUTES["fiche-" + id] = function () { return orFiche(id); }; ROUTES["exos-" + id] = function () { return pageExos(id); }; });
  function route() { if (UNIQUE) return UNIQUE; var h = (location.hash || "").slice(1); return ROUTES[h] ? h : "accueil"; }
  var derniere = "";
  /* sous-menus des onglets (D-87) */
  var cibleScroll = null;
  function allerCible() {
    if (!cibleScroll) return; var id = cibleScroll; cibleScroll = null;
    /* après l'affichage de la page : on attend une image pour que la mise en page soit faite */
    requestAnimationFrame(function () { var c = document.getElementById(id); if (!c) return; var y = c.getBoundingClientRect().top + window.pageYOffset - 16;
      try { window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } catch (x) { window.scrollTo(0, y); } });
  }
  function fermerSousMenus() { document.querySelectorAll(".onglet-groupe.est-ouvert").forEach(function (g) { g.classList.remove("est-ouvert"); var b = g.querySelector(".onglet-ouvrir"); if (b) b.setAttribute("aria-expanded", "false"); }); }
  document.addEventListener("click", function (e) { if (!e.target.closest(".onglet-groupe")) fermerSousMenus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fermerSousMenus(); });
  function rendre() {
    var r = route();
    if (r !== derniere) { if (r === "jeu-verbe-decouvre") D = null; if (r === "jeu-verbe-chasse") H = null; if (/^po-/.test(r)) A = null; if (/^mots-/.test(r)) G = null; if (/^heure-/.test(r)) HG = null; if (/^diag-/.test(r)) GD = null; if (r === "tbi-heure") { clearInterval(TB.tid); TB.part = "menu"; } if (/^tbi-/.test(r) && TQ) { clearInterval(TQ.tid); TQ = null; } try { if (MO.peutParler) speechSynthesis.cancel(); } catch (x) {} if (/^classe-/.test(r)) { K = null; clearInterval(minuteur); } if (r === "lecon-verbe") L = { carte: {}, moment: "present", machine: 0, phrase: 0 }; if (/^exos-/.test(r)) EXF = null; if (/^qz-/.test(r)) QZ = null; if (r === "ens-etoiles" || r === "ens-etoiles-grammaire") ET = { sel: null, liste: false, msg: "", type: r === "ens-etoiles" ? "calcul" : "grammaire" }; if (/^ens-corriges/.test(r) && !/^ens-corriges/.test(derniere)) { ET_CORR = 0; ET_POSE = {}; } if (/^lecon-/.test(r)) { LX = {}; JR = { i: 0, tout: false }; } window.scrollTo(0, 0); derniere = r; }
    document.documentElement.lang = langue;
    var ferme = !ensOuvert && !UNIQUE && ENS_ROUTES.test(r);
    document.body.classList.toggle("mode-classe", !ferme && /^classe-|^tbi-/.test(r));
    document.body.classList.toggle("mode-papier", !ferme && /^(fiche|feuille|exos)-/.test(r));
    document.body.classList.toggle("mode-etoiles", !ferme && (r === "ens-etoiles" || r === "ens-etoiles-grammaire"));
    app.innerHTML = ferme ? pageCode() : ROUTES[r]();
    if (ferme) { var ch = document.getElementById("ens-code"); if (ch) ch.focus(); }
    allerCible();
    if (r === "tbi-heure" && !ferme) tbAnimer();
    majMinuteur();
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]"); if (!el) return;
    var a = el.dataset.action;
    if (a === "ens-tiroir-aller") { e.preventDefault(); var dt = el.closest(".ens-tiroir"), cible = dt.querySelectorAll(":scope > .ens-liste > .ens-pb")[+el.dataset.k];
      dt.open = true; ENS_TIROIRS[dt.dataset.tiroir] = true; ensTiroirsGarder();
      if (cible) { cible.scrollIntoView({ behavior: "smooth", block: "center" }); cible.classList.remove("ens-flash"); void cible.offsetWidth; cible.classList.add("ens-flash"); }
      return; }
    if (a === "ens-tiroirs") { document.querySelectorAll(".ens-tiroir, .ens-po-tiroir").forEach(function (d) { d.open = el.dataset.v === "1"; ENS_TIROIRS[d.dataset.tiroir] = d.open; }); ensTiroirsGarder(); return; }
    if (a === "ens-verrouiller") { ensOuvert = false; try { sessionStorage.removeItem("coco-ens"); } catch (x) {} location.hash = "accueil"; return; }
    if (a === "sous-menu") { var g = el.closest(".onglet-groupe"), ouvert = !g.classList.contains("est-ouvert"); fermerSousMenus(); g.classList.toggle("est-ouvert", ouvert); el.setAttribute("aria-expanded", String(ouvert)); return; }
    if (a === "aller") { e.preventDefault(); cibleScroll = el.dataset.cible; fermerSousMenus(); if (location.hash !== "#" + el.dataset.route) location.hash = el.dataset.route; else allerCible(); return; }
    if (a === "langue") { langue = el.dataset.langue; ecrire("langue", langue); }
    else if (a === "dire") { dire(el.dataset.texte, el.dataset.lg); return; }
    else if (/^(rappel|moment|change|test|d-suite)$/.test(a)) actionDecouvre(a, el);
    else if (/^c-/.test(a)) actionChasse(a, el);
    else if (/^a-/.test(a)) actionAutonome(a, el);
    else if (/^k-/.test(a)) actionClasse(a, el);
    else if (/^m-/.test(a)) actionMots(a, el);
    else if (/^h-/.test(a)) actionHeure(a, el);
    else if (/^qz-/.test(a)) { actionQZ(a, el); if (a === "qz-dire") return; }
    else if (/^or-/.test(a)) actionOrth(a, el);
    else if (/^lx-/.test(a)) actionLX(a, el);
    else if (/^et-/.test(a)) actionEtoiles(a, el);
    else if (/^voix-/.test(a)) { actionVoix(a, el); if (a === "voix-ecouter") return; }
    else if (/^tq-/.test(a)) { actionTq(a, el); if (a === "tq-dire") return; }
    else if (/^t-/.test(a)) actionTbi(a, el);
    else if (/^g-/.test(a)) actionDiag(a, el);
    else if (/^jr-/.test(a)) actionJr(a, el);
    else if (/^bq-/.test(a)) { if (a === "bq-reglages") e.preventDefault(); actionBanque(a, el); }
    else if (a === "imprimer") { try { window.print(); } catch (x) {} return; }
    else if (/^ex-/.test(a)) actionExos(a, el);
    else if (/^l-/.test(a)) actionLecon(a, el);
    rendre();
    var focus = a === "a-verifier" && A && A.etape === "ecrit" ? document.querySelector("[data-ecrit]")
      : /^m-(cacher|suite|pret|erreurs|rejouer|dire-mot|dire-phrase|dire-dictee|modele|outil)$/.test(a) && document.getElementById("mi-reponse") && !document.getElementById("mi-reponse").disabled ? document.getElementById("mi-reponse")
      : /^m-(choix|valider)$/.test(a) ? document.querySelector('[data-action="m-suite"]')
      : document.querySelector('[data-action="' + a + '"]' + (el.dataset.k && el.dataset.d ? '[data-k="' + el.dataset.k + '"][data-d="' + el.dataset.d + '"]' : "")); if (focus && a !== "langue" && focus.focus) try { focus.focus({ preventScroll: true }); } catch (x) {}
  });
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el.dataset || (el.dataset.poChamp === undefined && el.dataset.ecrit === undefined)) return;
    var v = String(el.value).replace(/\D/g, "").slice(0, 3); if (v !== el.value) el.value = v;
    if (el.dataset.poChamp !== undefined) {
      var S = el.dataset.mode === "k" ? K : A; if (!S) return;
      S.sel[el.dataset.poChamp] = v;
      var dz = el.closest(".po-zone, .k-commun, section") && document.querySelector(".po-dessin-zone"); if (dz) dz.innerHTML = po(S.id).dessin(S.sel, langue);
      var b = document.querySelector('[data-action="' + (el.dataset.mode === "k" ? "k-tableau" : "a-proposer") + '"]'); if (b) b.disabled = !pret(po(S.id), S.sel);
      if (S === A && A.msg) { A.msg = ""; var rz = document.querySelector(".retour-zone"); if (rz) rz.innerHTML = ""; }
    } else if (el.dataset.ecrit !== undefined && A) A.ecrit[el.dataset.ecrit] = v;
  });
  document.addEventListener("input", function (e) { if (e.target.id === "mi-reponse" && G) G.typed = e.target.value; });
  /* « L’étiquette effacée » (D-109) : l’objet tapé par l’élève remplace l’objet choisi dans la liste */
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el.dataset || el.dataset.poLibre === undefined) return;
    var S = el.dataset.mode === "k" ? K : A; if (!S) return;
    S.sel.libre = el.value.slice(0, 40); if (S.sel.libre) S.sel.o = "";
    document.querySelectorAll(".po-objet.is-choisi").forEach(function (b) { b.classList.remove("is-choisi"); b.setAttribute("aria-pressed", "false"); });
    var q = document.querySelector(".po-etiq-quoi"); if (q) q.textContent = S.sel.libre || (langue === "en" ? "Choose an object…" : "Choisis un objet…");
    var b = document.querySelector('[data-action="' + (el.dataset.mode === "k" ? "k-tableau" : "a-proposer") + '"]'); if (b) b.disabled = !pret(po(S.id), S.sel);
    if (S === A && A.msg) { A.msg = ""; var rz = document.querySelector(".retour-zone"); if (rz) rz.innerHTML = ""; }
  });
  document.addEventListener("input", function (e) { var el = e.target; if (!el.dataset || el.dataset.qz === undefined || !QZ) return; if (el.classList.contains("qz-champ--mot")) { QZ.val[el.dataset.qz] = el.value.slice(0, 40); return; } var v = el.value.replace(/[^\d]/g, "").slice(0, 5); if (v !== el.value) el.value = v; QZ.val[el.dataset.qz] = v; });
  document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.dataset && e.target.dataset.qz !== undefined) { var b = document.querySelector('[data-action="qz-valider"]'); if (b) b.click(); } });
  document.addEventListener("change", function (e) { if (e.target.id === "ex-liste" && EXF) { EXF.opt = e.target.value; EXF.n = exNouveauNum(); exTirer(); rendre(); } });
  /* correction au TBI (D-104) : flèches pour changer d'exercice, Entrée dans le numéro de fiche, Entrée ou espace sur une case */
  document.addEventListener("keydown", function (e) {
    if (!EXF || !EXF.tbi || !/^exos-/.test(route())) return;
    if (e.target.id === "ex-num" && e.key === "Enter") { e.preventDefault(); actionExos("ex-num"); rendre(); return; }
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("tb-u") && e.target.tagName !== "BUTTON") { e.preventDefault(); e.target.click(); return; }
    if (e.key === "ArrowRight" && (EXF.i || 0) < (EXF.nb || 1) - 1) { e.preventDefault(); actionExos("ex-suiv"); rendre(); }
    else if (e.key === "ArrowLeft" && EXF.i > 0) { e.preventDefault(); actionExos("ex-prec"); rendre(); }
  });
  document.addEventListener("pointerdown", function (e) { if (e.target.closest && e.target.closest("[data-mi-acc]")) e.preventDefault(); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-mi-acc]"); if (!b || !G) return;
    var i = document.getElementById("mi-reponse"); if (!i || i.disabled) return;
    var s = i.selectionStart == null ? i.value.length : i.selectionStart, f = i.selectionEnd == null ? s : i.selectionEnd, c = b.dataset.miAcc;
    i.value = i.value.slice(0, s) + c + i.value.slice(f); G.typed = i.value; i.focus(); i.setSelectionRange(s + c.length, s + c.length);
  });
  document.addEventListener("keydown", function (e) {
    var el = e.target; if (e.key !== "Enter" || !el.dataset) return;
    if (el.id === "mi-reponse") { var bm = document.querySelector('[data-action="m-valider"]') || document.querySelector('[data-action="m-suite"]'); if (bm) { e.preventDefault(); bm.click(); } return; }
    var cible = el.dataset.ecrit !== undefined ? "a-ecrit-ok" : el.dataset.poChamp !== undefined || el.dataset.poLibre !== undefined ? (el.dataset.mode === "k" ? "k-tableau" : "a-proposer") : "";
    var b = cible && document.querySelector('[data-action="' + cible + '"]'); if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });
  window.addEventListener("hashchange", rendre);
  rendre();
})();
