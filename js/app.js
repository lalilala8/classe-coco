/* Classe Coco — application (aperçu). Aucune donnée personnelle : seuls la langue et les activités faites sont gardées dans le navigateur. */
(function () {
  "use strict";
  var C = window.COCO_CONTENU;
  var app = document.getElementById("app");
  /* Fichier autonome à partager : window.COCO_PAGE_UNIQUE fixe la page, window.COCO_IMAGES fournit les images intégrées */
  var UNIQUE = window.COCO_PAGE_UNIQUE || "", IMAGES = window.COCO_IMAGES || {};
  var IMG = function (n) { return IMAGES[n] || "img/personnages/" + n + ".webp"; };
  var PICTO = function (n) { return IMAGES["picto-" + n] || "img/pictos/" + n + ".svg"; };

  /* ---------- mémoire locale (facultative) ---------- */
  function lire(k, d) { try { var v = localStorage.getItem("coco-" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function ecrire(k, v) { try { localStorage.setItem("coco-" + k, JSON.stringify(v)); } catch (e) {} }
  var langue = lire("langue", "fr");
  var faits = lire("faits", {});
  function marquerFait(id) { faits[id] = true; ecrire("faits", faits); }

  /* ---------- textes de l'interface ---------- */
  var T = {
    fr: { accueil: "Accueil", langue: "Langue", ecouter: "Écouter", retour: "Retour", bonjour: "Bonjour ! Choisis une matière pour commencer.",
      titre: "La classe de maîtresse Coco", bientot: "Bientôt", ancien: "Dans l'ancien site · à intégrer", demo: "Disponible",
      choisisSeq: "Choisis une séquence.", objectif: "Mon objectif :", decouvre: "Je découvre", entraine: "Je m'entraîne", reinvestis: "Je réinvestis",
      ouvert: "Le problème ouvert", rappelle: "Je me rappelle", lecon: "Revoir la leçon", valider: "Valider", suivant: "Suivant", reessayer: "Réessayer",
      indice: "Indice", bravo: "Bravo !", pasEncore: "Pas encore…", astuce: "Astuce de la leçon", fini: "Terminé !", rejouer: "Rejouer",
      versSequence: "Retour à la séquence", question: function (i, n) { return "Question " + i + " sur " + n; },
      fait: "fait ✓", noteFr: "", passe: "Passé", present: "Présent", futur: "Futur" },
    en: { accueil: "Home", langue: "Language", ecouter: "Listen", retour: "Back", bonjour: "Hello! Choose a subject to start.",
      titre: "Miss Coco's class", bientot: "Coming soon", ancien: "In the old site · to be added", demo: "Available",
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
      var u = new SpeechSynthesisUtterance(texte);
      u.lang = (lg || langue) === "en" ? "en-GB" : "fr-FR"; u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ---------- briques ---------- */
  var MATIERE = {}; C.matieres.forEach(function (m) { MATIERE[m.id] = m; });
  function barre(actif) {
    if (UNIQUE) return '<header class="barre"><span></span>' + choixLangue() + "</header>";
    var onglets = '<a class="coco-onglet" href="#accueil" aria-current="' + (actif === "accueil" ? "page" : "false") + '"><img src="' + PICTO("accueil") + '" alt="">' + t("accueil") + "</a>" +
      C.matieres.map(function (m) { return '<a class="coco-onglet coco-onglet--' + m.id + '" href="#' + m.id + '" aria-current="' + (actif === m.id ? "page" : "false") + '">' + esc(m.id === "qlm" ? "QLM" : tr(m.nom)) + "</a>"; }).join("");
    return '<header class="barre"><nav class="coco-onglets" aria-label="Menu">' + onglets + "</nav>" + choixLangue() + "</header>";
  }
  function choixLangue() {
    return '<div class="coco-langue" role="group" aria-label="' + t("langue") + '">' +
      '<button type="button" data-langue="fr" data-action="langue" aria-pressed="' + (langue === "fr") + '"><span class="coco-drapeau coco-drapeau--fr"></span>FR</button>' +
      '<button type="button" data-langue="en" data-action="langue" aria-pressed="' + (langue === "en") + '"><span class="coco-drapeau coco-drapeau--en"></span>EN</button></div>';
  }
  function bulle(perso, texte) {
    return '<div class="coco-bulle"><div class="coco-bulle-perso"><img src="' + IMG(perso) + '" alt=""></div><div class="coco-bulle-texte"><p>' + texte + "</p></div></div>";
  }
  function retour(type, titre, texte, actions) {
    var perso = type === "bravo" ? IMG("kakou") : IMG("margouille");
    var ic = type === "bravo" ? "✓" : "↻";
    if (type === "astuce") return '<div class="coco-retour coco-retour--astuce" role="note"><img class="coco-retour-perso" src="' + IMG("margouille") + '" alt=""><div><h4>' + titre + "</h4><p>" + texte + "</p></div></div>";
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
      '<section class="hero"><img src="' + IMG("coralie") + '" alt="Maîtresse Coco"><div><h1>' + t("titre") + "</h1>" + bulleSimple(t("bonjour")) + "</div></section>" +
      '<section class="portes">' + portes + "</section>" + '<p class="pied"><a href="#enseignante">Espace enseignante</a></p>';
  }
  function bulleSimple(texte) { return '<div class="coco-bulle-texte"><p>' + texte + "</p></div>"; }
  function pageMatiere(id) {
    var m = MATIERE[id];
    var corps = m.domaines.length ? m.domaines.map(function (d) {
      return '<section class="domaine"><h2>' + esc(tr(d.nom)) + '</h2><div class="sequences">' + d.sequences.map(function (s, i) {
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
        carte("francais", "3 · " + t("reinvestis"), t("bientot"), langue === "en" ? "To be designed with the teacher." : "À concevoir avec la maîtresse.", "nina", "", true);
    } else {
      cartes = carte("maths", "1 · " + t("decouvre"), t("bientot"), langue === "en" ? "I remember, then I discover." : "Je me rappelle, puis je découvre.", "adi", "", true) +
        carte("maths", "2 · " + t("entraine"), t("bientot"), "", "dylan", "", true) +
        carte("maths", "3 · " + t("reinvestis"), t("bientot"), "", "waeko", "", true) +
        (PO.sequences[id] || []).map(function (pid, k) { var p = po(pid); return carte("maths", "4 · " + t("ouvert") + " " + (k + 1), tr(p.titre), tr(p.question), p.perso, "po-" + pid); }).join("");
    }
    var lecon = id === "verbe" ? '<a class="coco-btn coco-btn--secondaire" href="#lecon-verbe" style="justify-self:start"><img src="' + PICTO("ampoule") + '" alt="">' + t("lecon") + "</a>" : "";
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
      '<section class="retiens"><img src="' + IMG("coralie") + '" alt=""><div><h3>' + (en ? "I remember" : "Je retiens") + "</h3>" +
      "<p>Le verbe est un mot qui exprime un <b>état</b> (être, sembler, paraître) ou une <b>action</b>. Il <b>change</b> selon le temps de la phrase.</p>" +
      "<p>Pour trouver le verbe conjugué dans une phrase, je la mets à la <b>forme négative</b> : le verbe est entre <span class=\"coco-negation\">ne</span> et <span class=\"coco-negation\">pas</span> !</p></div></section>" +
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
        '<section class="bilan"><img src="' + IMG("kakou") + '" alt=""><h2>' + t("fini") + "</h2><p>" + (langue === "en" ? "The verb changes with the time of the sentence, and it sits between <b>ne</b> and <b>pas</b>." : "Le verbe change selon le moment de la phrase, et il se met entre <b>ne</b> et <b>pas</b>.") + '</p><div class="coco-row"><a class="coco-btn" href="#jeu-verbe-chasse">' + t("entraine") + '</a><a class="coco-btn coco-btn--secondaire" href="#seq-verbe">' + t("versSequence") + "</a></div></section>";
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
      return barre("francais") + hautJeu(m, "seq-verbe", titre, galets(n, n)) + '<section class="bilan"><img src="' + IMG("kakou") + '" alt=""><h2>' + t("fini") + "</h2><p>" +
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
  function depart(p) { if (!p.champs) return []; var s = {}; p.champs.forEach(function (c) { s[c.k] = c.saisie ? "" : c.depart; }); return s; }
  function pret(p, sel) { if (!p.champs) return sel.length > 0; return p.champs.every(function (c) { return !c.saisie || /^\d+$/.test(String(sel[c.k])); }); }
  function copie(p, sel) { return p.champs ? JSON.parse(JSON.stringify(sel)) : sel.slice(); }
  function relancer(p, sel) { if (!p.champs) return []; var s = copie(p, sel); p.champs.forEach(function (c) { if (c.saisie) s[c.k] = ""; }); return s; }
  function regler(p, sel, el) {
    var c = p.champs.filter(function (x) { return x.k === el.dataset.k; })[0]; if (!c) return;
    sel[c.k] = Math.max(c.min, Math.min(c.max, sel[c.k] + (+el.dataset.d)));
  }
  function reglages(p, sel, pre, actif) {
    var en = langue === "en";
    return '<div class="po-champs">' + p.champs.map(function (c) {
      if (c.saisie) return '<label class="po-champ"><span>' + esc(tr(c)) + '</span><input type="text" inputmode="numeric" maxlength="3" autocomplete="off" data-po-champ="' + c.k + '" data-mode="' + pre + '" value="' + esc(sel[c.k]) + '"' + (actif ? "" : " disabled") + "></label>";
      var bouton = function (d, signe) {
        var ok = actif && (d < 0 ? sel[c.k] > c.min : sel[c.k] < c.max);
        return '<button class="po-pm" type="button" data-action="' + pre + '-champ" data-k="' + c.k + '" data-d="' + d + '" aria-label="' + esc(tr(c)) + (d < 0 ? (en ? ": one less" : " : un de moins") : (en ? ": one more" : " : un de plus")) + '"' + (ok ? "" : " disabled") + ">" + signe + "</button>";
      };
      return '<div class="po-champ"><span>' + esc(tr(c)) + '</span><div class="po-reglette">' + bouton(-1, "−") + "<b>" + sel[c.k] + "</b>" + bouton(1, "+") + "</div></div>";
    }).join("") + "</div>" + p.dessin(sel, langue);
  }
  function manipulation(p, sel, actAjout, actRetire, actif) {
    if (p.champs) return reglages(p, sel, actAjout.charAt(0), actif !== false);
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
    var i = sel.indexOf(v); if (i >= 0) sel.splice(i, 1); else sel.push(v);
  }
  function enonceBloc(p) {
    var prix = p.type === "marche" ? '<span class="po-prix">' + PO.FRUITS.map(function (f) { return esc(f[langue] || f.fr) + " <b>" + f.prix + " F</b>"; }).join(" · ") + "</span>" : "";
    return tr(p.enonce) + prix;
  }

  /* ---------- mode autonome (élève) ---------- */
  var A = null;
  function poAutonome(id) {
    var p = po(id), m = MATIERE.maths, s = C[p.sequence], en = langue === "en";
    if (!A || A.id !== id) A = { id: id, sel: depart(p), sols: [], etape: "cherche", coches: {}, msg: "", pouce: false, relance: 0, strats: {}, range: false };
    var titre = { sous: tr(s.titre) + " · " + t("ouvert"), titre: tr(p.titre) };
    var liste = A.sols.slice(); if (A.range) liste.sort(p.ranger);
    var sols = liste.map(function (x) { return "<li>" + esc(p.ecrire(x, langue)) + " <b>✓</b></li>"; }).join("");
    var blocSols = '<section class="po-sol"><h3>' + (en ? "My ways: " : "Mes solutions : ") + A.sols.length + "</h3>" + (sols ? "<ol>" + sols + "</ol>" : "") +
      '<p class="po-note">' + (en ? "There is more than one right answer." : "Il n'y a pas qu'une seule bonne réponse.") + "</p>" +
      (A.sols.length > 1 ? '<button class="coco-btn coco-btn--secondaire" type="button" data-action="a-ranger" aria-pressed="' + A.range + '">' + (A.range ? (en ? "Back to my order" : "Remettre dans mon ordre") : (en ? "Sort my ways" : "Ranger mes solutions")) + "</button>" : "") + "</section>";
    if (A.etape === "fin" || A.etape === "bilan") {
      if (A.etape === "fin") {
        return barre("maths") + hautJeu(m, "seq-" + p.sequence, titre) + bulle(p.perso, en ? "How did you find your ways? Tick <b>what you did</b>." : "Comment as-tu trouvé tes solutions ? Coche <b>ce que tu as fait</b>.") +
          '<section class="zone m-maths"><div class="po-coches">' + p.strategies.map(function (st, i) { return '<button class="po-coche" type="button" data-action="a-strat" data-i="' + i + '" aria-pressed="' + !!A.strats[i] + '"><span class="po-case">' + (A.strats[i] ? "✓" : "") + "</span>" + esc(tr(st)) + "</button>"; }).join("") + "</div>" +
          '<button class="coco-btn coco-btn--grand" type="button" data-action="a-terminer">' + (en ? "Finish" : "Terminer") + "</button></section>";
      }
      marquerFait("po-" + id);
      var faits = p.strategies.filter(function (st, i) { return A.strats[i]; }).map(function (st) { return "<li>" + esc(tr(st)) + "</li>"; }).join("");
      var ranges = A.sols.slice().sort(p.ranger).map(function (x) { return "<li>" + esc(p.ecrire(x, langue)) + "</li>"; }).join("");
      return barre("maths") + hautJeu(m, "seq-" + p.sequence, titre) + '<section class="bilan"><img src="' + IMG("kakou") + '" alt=""><h2>' + t("fini") + "</h2><p>" +
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
      '<div class="po-aides"><button class="po-aide po-aide--pouce" type="button" data-action="a-pouce" aria-expanded="' + A.pouce + '"><img src="' + IMG("margouille") + '" alt=""><span><strong>' + (en ? "Little help" : "Coup de pouce") + '</strong><span class="cache">' + esc(tr(p.pouce)) + "</span></span></button>" +
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
      else if (r.ok) {
        A.sols.push(copie(p, A.sel)); A.sel = relancer(p, A.sel);
        A.msg = retour("bravo", t("bravo"), (en ? "It works. " : "Ça marche. ") + noteVerif(rien));
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
      corps = '<section class="k-question"><img src="' + IMG(p.perso) + '" alt=""><div class="k-bulle"><h1>' + esc(tr(p.titre)) + "</h1><div class=\"k-enonce\">" + enonceBloc(p) + "</div></div></section>";
    } else if (K.temps === 2) {
      var aide = K.aide === "pouce" ? ["margouille", en ? "Little help" : "Coup de pouce", "<p>" + esc(tr(p.pouce)) + "</p>"]
        : K.aide === "loin" ? [p.perso, en ? "To go further" : "Pour aller plus loin", "<ol>" + p.relances.map(function (r) { return "<li>" + esc(tr(r)) + "</li>"; }).join("") + "</ol>"]
        : [p.perso, en ? "We search" : "On cherche", "<p>" + (en ? "In pairs or threes, write down <b>all</b> the ways you find. You have one? Look for another!" : "Par 2 ou 3, écrivez <b>toutes</b> les solutions que vous trouvez. Vous en avez une ? Cherchez-en une autre !") + "</p>"];
      corps = '<div class="k-cherche"><div class="k-rappel">' + enonceBloc(p) + '</div><div class="k-minuteur"><p id="minuteur">15:00</p><div class="coco-row">' +
        [10, 15, 20].map(function (n) { return '<button class="coco-btn coco-btn--secondaire" type="button" data-action="k-duree" data-v="' + n + '">' + n + " min</button>"; }).join("") +
        '</div><div class="coco-row"><button class="coco-btn" type="button" data-action="k-lancer">' + (K.fin ? "Pause" : (en ? "Start" : "Lancer")) + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-remettre">' + (en ? "Reset" : "Remettre") + "</button></div></div></div>" +
        '<div class="k-aide"><div class="k-boutons">' + [["cherche", en ? "We search" : "On cherche"], ["pouce", en ? "Little help" : "Coup de pouce"], ["loin", en ? "To go further" : "Pour aller plus loin"]].map(function (b) { return '<button class="coco-btn ' + (K.aide === b[0] ? "" : "coco-btn--secondaire") + '" type="button" data-action="k-aide" data-v="' + b[0] + '">' + b[1] + "</button>"; }).join("") + "</div>" +
        '<img src="' + IMG(aide[0]) + '" alt=""><div class="k-bulle"><h2>' + aide[1] + "</h2>" + aide[2] + "</div></div>";
    } else if (K.temps === 3) {
      var tab = K.tableau.slice(); if (K.range) tab.sort(function (a, b) { return p.ranger(a.sol, b.sol); });
      var cartes = tab.map(function (c) {
        var idx = K.tableau.indexOf(c), r = p.verifier(c.sol), etat = c.vu ? (r.ok ? "ok" : "non") : "";
        return '<button class="k-carte ' + etat + '" type="button" data-action="k-voir" data-k="' + idx + '"><span>' + esc(p.ecrire(c.sol, langue)) + "</span>" + (c.vu ? "<small>" + (r.ok ? "✓ " + (en ? "It works" : "Ça marche") : "↻ " + esc(r[langue])) + "</small>" : "<small>" + (en ? "Tap to check" : "Touche pour vérifier") + "</small>") + "</button>";
      }).join("");
      corps = '<div class="k-relances">' + [en ? "How do you know?" : "Comment le savez-vous ?", en ? "Is it really a new way?" : "Est-ce vraiment une nouvelle façon ?", en ? "Who did it differently?" : "Qui a fait autrement ?"].map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</div>" +
        '<div class="k-commun"><section class="po-zone m-maths">' + manipulation(p, K.sel, "k-ajout", "k-retire") + '<div class="coco-row"><button class="coco-btn" type="button" data-action="k-tableau"' + (pret(p, K.sel) ? "" : " disabled") + ">" + (en ? "Add to the board" : "Ajouter au tableau") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-vider">' + (en ? "Empty" : "Vider") + "</button></div></section>" +
        '<section class="k-tableau"><div class="coco-row"><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-tout">' + (en ? "Check all" : "Tout vérifier") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-ranger" aria-pressed="' + K.range + '">' + (en ? "Sort" : "Ranger") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="k-effacer">' + (en ? "Clear" : "Effacer") + "</button></div>" +
        (cartes ? '<div class="k-cartes">' + cartes + "</div>" : '<p class="po-note">' + (en ? "Enter each group's way, then tap it to check, once the class has given its opinion." : "Entre la solution de chaque groupe, puis touche-la pour la vérifier, une fois que la classe a donné son avis.") + "</p>") + "</section></div>";
    } else {
      var rangees = K.tableau.filter(function (c) { return p.verifier(c.sol).ok; }).map(function (c) { return c.sol; });
      var vus = {}; rangees = rangees.filter(function (s) { var k = p.cle(s); if (vus[k]) return false; vus[k] = 1; return true; }).sort(p.ranger);
      var toutes = p.vueToutes ? p.vueToutes(vus, langue) : p.toutes ? '<h3>' + (en ? "All the answers" : "Toutes les réponses") + "</h3><ol>" + p.toutes.slice().sort(p.ranger).map(function (s) { var trouve = vus[p.cle(s)]; return '<li class="' + (trouve ? "trouve" : "") + '">' + esc(p.ecrire(s, langue)) + (trouve ? " <b>✓</b>" : "") + "</li>"; }).join("") + "</ol>"
        : "<p>" + (en ? "There are " + p.nbToutes.toLocaleString("en-GB") + " ways in all: nobody can find them all, so we get organised!" : "Il y a " + p.nbToutes.toLocaleString("fr-FR") + " façons en tout : personne ne peut toutes les trouver, alors on s'organise !") + "</p>";
      corps = '<div class="k-retient"><div class="retiens"><img src="' + IMG("coralie") + '" alt=""><div><h3>' + (en ? "We remember" : "On retient") + "</h3><p>" + esc(tr(p.retenir)) + '</p><p class="lecon-ex">' + esc(tr(p.exemple)) + "</p></div></div>" +
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
    var rappel = p.type === "pieces" ? "<p><b>Les pièces :</b> 1 F · 2 F · 5 F · 10 F · 20 F · 50 F · 100 F</p>"
      : p.type === "marche" ? "<p><b>Les prix :</b> " + PO.FRUITS.map(function (f) { return esc(f.fr) + " " + f.prix + " F"; }).join(" · ") + "</p>" : "";
    var zone = '<div class="f-cases">' + cases + "</div>";
    if (p.feuille) {
      var F = p.feuille, lignes = "";
      for (var j = 0; j < F.lignes; j++) lignes += "<tr>" + F.colonnes.map(function (c, k) { return "<td>" + ((F.fixe || {})[k] || "") + "</td>"; }).join("") + "</tr>";
      zone = '<table class="f-grille"><thead><tr>' + F.colonnes.map(function (c) { return "<th" + (c.large ? ' class="large"' : "") + ">" + esc(tr(c)) + "</th>"; }).join("") + "</tr></thead><tbody>" + lignes + "</tbody></table>" +
        (F.bas ? '<div class="f-bas"><p>' + esc(tr(F.bas)) + '</p><div class="f-lignes"></div></div>' : "");
    }
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#enseignante">← Espace enseignante</a><button class="coco-btn" type="button" data-action="imprimer">Imprimer</button>' + choixLangue() + "</div>" +
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
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#enseignante">← Espace enseignante</a><a class="coco-btn" href="#classe-' + id + '">Projeter en classe</a><a class="coco-btn coco-btn--secondaire" href="#feuille-' + id + '">Feuille de recherche</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche m-maths"><small>Maths · ' + esc(s.titre.fr) + " · Problème ouvert · CE2 · 45 min environ · par 2 ou 3" + (f.moment ? " · " + esc(f.moment) : "") + "</small><h1>" + esc(p.titre.fr) + '</h1><p class="f-q">« ' + esc(p.question.fr) + " »</p><p>" + p.enonce.fr + '</p><p class="f-source">' + esc(f.source) + "</p>" +
      '<div class="f-deux"><section><h2>Ce que les élèves apprennent</h2><ul>' + li(f.apprend) + "</ul></section><section><h2>Pourquoi c'est une bonne question</h2><ul>" + li(f.pourquoi) + "</ul></section></div>" +
      "<section><h2>Matériel</h2><ul>" + li(f.materiel) + "</ul></section>" +
      '<section><h2>Le déroulé en 4 temps</h2><ol class="f-temps">' + f.temps.map(function (x) { return "<li><b>" + esc(x[0]) + "</b> <i>" + esc(x[1]) + "</i><p>" + esc(x[2]) + "</p>" + (x[3] ? '<p class="f-dire">' + esc(x[3]) + "</p>" : "") + "</li>"; }).join("") + "</ol></section>" +
      '<div class="f-deux"><section><h2>Coup de pouce</h2><p>' + esc(p.pouce.fr) + "</p></section><section><h2>Pour aller plus loin</h2><ol>" + li(p.relances.map(function (r) { return r.fr; })) + "</ol></section></div>" +
      "<section><h2>Les réponses</h2><p>" + esc(f.reponses) + "</p></section>" +
      '<section><h2>Les erreurs à guetter, et quoi demander</h2><table class="f-table"><tbody>' + f.erreurs.map(function (e) { return "<tr><td>" + esc(e[0]) + "</td><td>" + esc(e[1]) + "</td>" + (e[2] ? '<td class="f-dire">' + esc(e[2]) + "</td>" : "") + "</tr>"; }).join("") + "</tbody></table></section>" +
      '<section><h2>Évaluer sans note : les 5 niveaux</h2><table class="f-table"><tbody>' + ["Ne semble pas comprendre", "A fait un essai, mais comprend peu", "Comprend, mais pas tout", "Semble bien comprendre", "Dépasse les attentes"].map(function (n, i) { return "<tr><th>" + (i + 1) + " · " + n + "</th><td>" + esc(f.niveaux[i]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      '<p class="f-source">Échelle et liste de comportements à observer : Sullivan & Lilburn, chapitre 4 (coopère, persévère, essaie autre chose, organise l\'information, cherche toutes les possibilités, généralise, explique, utilise le matériel).</p></section>' +
      '<div class="f-deux"><section><h2>La trace écrite</h2><p>' + esc(p.retenir.fr) + '</p><p class="lecon-ex">' + esc(p.exemple.fr || p.exemple) + "</p></section><section><h2>Pour réinvestir un autre jour</h2><ul>" + li(f.reinvestir) + "</ul></section></div></article>";
  }

  /* ---------- espace enseignante ---------- */
  function pageEnseignante() {
    var seqs = Object.keys(PO.sequences).map(function (sid) {
      return '<section class="domaine"><h2>' + esc(C[sid].titre.fr) + '</h2><div class="ens-liste">' + PO.sequences[sid].map(function (id) {
        var p = po(id);
        return '<div class="ens-pb"><img src="' + IMG(p.perso) + '" alt=""><div><b>' + esc(p.titre.fr) + "</b><small>« " + esc(p.question.fr) + ' »</small></div><div class="coco-row"><a class="coco-btn" href="#classe-' + id + '">Projeter en classe</a><a class="coco-btn coco-btn--secondaire" href="#fiche-' + id + '">La fiche</a><a class="coco-btn coco-btn--secondaire" href="#feuille-' + id + '">Feuille de recherche</a></div></div>';
      }).join("") + "</div></section>";
    }).join("");
    return barre("") + '<section class="entete m-maths"><img src="' + IMG("coralie") + '" alt=""><div><h1>Espace enseignante</h1><p>Les problèmes ouverts : fiche, feuille de recherche et projection en classe.</p></div></section>' +
      '<details class="ens-sullivan"><summary>La démarche de Peter Sullivan, en bref</summary><p><b>Une « bonne » question</b> demande plus qu\'un rappel, fait apprendre l\'élève (et renseigne l\'enseignant), et accepte plusieurs réponses.</p><p><b>4 temps :</b> poser la question (sans donner de méthode) · chercher par 2 ou 3 (coup de pouce si on bloque, relance si on a fini) · mettre en commun (la classe donne son avis avant la vérification) · faire un résumé.</p><p><b>Évaluer sans note :</b> 5 niveaux de compréhension et une liste de comportements à observer.</p><p class="f-source">Sullivan & Lilburn, « Activités ouvertes en mathématiques », Chenelière, 2010, chapitres 1 à 4.</p></details>' +
      seqs + '<p class="apercu">Période 5 : la séquence 3 (division) est intégrée. Les 12 autres problèmes de l\'outil partagé avec votre collègue suivront, deux par séquence.</p>';
  }

  /* ---------- banque de problèmes (Vergnaud), reprise du site v0 ---------- */
  var BQ = window.COCO_BANQUE;
  var Bq = { fam: -1, sel: {}, shown: 24, ouverts: {}, vals: {}, res: {} };
  BQ.FILTRES.forEach(function (g) { Bq.sel[g.k] = {}; });
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
    if (t[0] === "3") return { g: v[0] == null ? [] : [["big", "small", v[0], v[1]]], e: { d: v[2] } };
    if (t[0] === "4") return { g: [["top", "left", v[0], v[1]]], e: { prod: v[2] } };
    return { g: [], e: { top: v[0], left: v[1] } };
  }
  function bqVerifier(id) {
    var p = BQ.P[id], E = bqAttendu(p), V = Bq.vals[id] || {}, tout = true, k;
    for (k in E.e) if (bqNum(V[k]) !== E.e[k]) tout = false;
    E.g.forEach(function (x) { var a = bqNum(V[x[0]]), b = bqNum(V[x[1]]); if (!((a === x[2] && b === x[3]) || (a === x[3] && b === x[2]))) tout = false; });
    var ans = bqAns(p);
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
      svg(bx(14, 56, 42, 42, "i") + fl(56, 77, 262, 77) + ci(160, 57, 20, "d") + bx(264, 56, 42, 42, "f") + tx(160, 124, L.verg), L.verg);
      if (t === "2B" && p.n === 4) {
        var tk = ""; for (var x = 76; x <= 250; x += 34) tk += '<path d="M' + x + ' 71V83" class="bq-ar"/>';
        svg(bx(14, 50, 42, 42, "i") + bx(264, 50, 42, 42, "f") + fl(56, 71, 262, 71) + tk + ci(160, 32, 20, "d") + '<path d="M160 52V71" class="bq-ar"/>' + tx(35, 112, L.start) + tx(285, 112, L.end) + tx(160, 124, L.time), L.time);
      }
    } else if (t[0] === "3") {
      var sg = t === "3A" ? (p.s ? 1 : -1) : 1;
      svg(bx(139, 6, 42, 42, "big") + fl(160, 48, 160, 82) + ci(160 + sg * 34, 66, 21, "d") + bx(139, 84, 42, 42, "small"), L.verg);
    } else {
      var mult = t[0] === "4", g = '<rect x="76" y="30" width="220" height="88" class="bq-b"/>';
      for (var i = 1; i < 5; i++) g += '<path d="M' + (76 + 44 * i) + ' 30V118" class="' + (mult ? "bq-gd" : "bq-gs") + '"/>';
      for (var j = 1; j < 4; j++) g += '<path d="M76 ' + (30 + 22 * j) + 'H296" class="' + (mult ? "bq-gd" : "bq-gs") + '"/>';
      lb("top", 136, 3, 100, 24, L.kn); lb("left", 4, 62, 66, 26, L.kn); if (mult) lb("prod", 156, 64, 60, 26, "");
      svg(g, L.bar);
    }
    return out;
  }
  function bqSchema(p) {
    var id = p.i, V = Bq.vals[id] || {}, r = Bq.res[id], en = langue === "en";
    var w = bqSchemas(p).map(function (o) {
      return '<div class="bq-sw">' + o.svg + o.S.map(function (s) {
        return '<input class="bq-in' + (s.ph === "?" ? " bq-inc" : "") + '" data-bq="' + id + '" data-k="' + s.k + '" value="' + esc(V[s.k] || "") + '" placeholder="' + s.ph + '" inputmode="numeric" autocomplete="off" aria-label="' + (en ? "Write a number" : "Écris un nombre") + '" style="left:' + (s.x / 3.2).toFixed(2) + "%;top:" + (s.y / o.H * 100).toFixed(2) + "%;width:" + (s.w / 3.2).toFixed(2) + "%;height:" + (s.h / o.H * 100).toFixed(2) + '%">';
      }).join("") + "</div>";
    }).join("");
    var msg = "";
    if (r === "ok") msg = retour("bravo", t("bravo"), en ? "You found the answer, and your model is right." : "Tu as trouvé la réponse, et ton schéma est juste.");
    else if (r === "part") msg = retour("revoir", en ? "Almost!" : "Presque !", en ? "The answer is right! Check the other boxes of the model." : "La réponse est juste ! Vérifie les autres cases du schéma.");
    else if (r === "no") msg = retour("revoir", t("pasEncore"), en ? "Read the problem again. What is the question? Where does the number you are looking for go in the model?" : "Relis l'énoncé. Quelle est la question ? Où va le nombre cherché dans le schéma ?");
    return w + '<p class="bq-aide">' + (en ? "Fill in the model with the numbers from the problem. The <b>?</b> box is the answer." : "Complète le schéma avec les nombres de l'énoncé. La case <b>?</b> est la réponse.") + "</p>" +
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
        '<p class="bq-enonce">' + esc(p[langue] || p.fr) + "</p>" +
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

  /* ---------- routeur ---------- */
  var ROUTES = {
    accueil: pageAccueil, "seq-verbe": function () { return pageSequence("verbe"); },
    "lecon-verbe": pageLecon, "jeu-verbe-decouvre": jeuDecouvre, "jeu-verbe-chasse": jeuChasse, enseignante: pageEnseignante, banque: pageBanque
  };
  C.matieres.forEach(function (m) { ROUTES[m.id] = function () { return pageMatiere(m.id); }; });
  Object.keys(PO.sequences).forEach(function (sid) { ROUTES["seq-" + sid] = function () { return pageSequence(sid); }; });
  Object.keys(PO.problemes).forEach(function (id) {
    ROUTES["po-" + id] = function () { return poAutonome(id); };
    ROUTES["classe-" + id] = function () { return poClasse(id); };
    ROUTES["fiche-" + id] = function () { return poFiche(id); };
    ROUTES["feuille-" + id] = function () { return poFeuille(id); };
  });
  function route() { if (UNIQUE) return UNIQUE; var h = (location.hash || "").slice(1); return ROUTES[h] ? h : "accueil"; }
  var derniere = "";
  function rendre() {
    var r = route();
    if (r !== derniere) { if (r === "jeu-verbe-decouvre") D = null; if (r === "jeu-verbe-chasse") H = null; if (/^po-/.test(r)) A = null; if (/^classe-/.test(r)) { K = null; clearInterval(minuteur); } if (r === "lecon-verbe") L = { carte: {}, moment: "present", machine: 0, phrase: 0 }; window.scrollTo(0, 0); derniere = r; }
    document.documentElement.lang = langue;
    document.body.classList.toggle("mode-classe", /^classe-/.test(r));
    document.body.classList.toggle("mode-papier", /^(fiche|feuille)-/.test(r));
    app.innerHTML = ROUTES[r]();
    majMinuteur();
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]"); if (!el) return;
    var a = el.dataset.action;
    if (a === "langue") { langue = el.dataset.langue; ecrire("langue", langue); }
    else if (a === "dire") { dire(el.dataset.texte, el.dataset.lg); return; }
    else if (/^(rappel|moment|change|test|d-suite)$/.test(a)) actionDecouvre(a, el);
    else if (/^c-/.test(a)) actionChasse(a, el);
    else if (/^a-/.test(a)) actionAutonome(a, el);
    else if (/^k-/.test(a)) actionClasse(a, el);
    else if (/^bq-/.test(a)) { if (a === "bq-reglages") e.preventDefault(); actionBanque(a, el); }
    else if (a === "imprimer") { try { window.print(); } catch (x) {} return; }
    else if (/^l-/.test(a)) actionLecon(a, el);
    rendre();
    var focus = a === "a-verifier" && A && A.etape === "ecrit" ? document.querySelector("[data-ecrit]")
      : document.querySelector('[data-action="' + a + '"]' + (el.dataset.k && el.dataset.d ? '[data-k="' + el.dataset.k + '"][data-d="' + el.dataset.d + '"]' : "")); if (focus && a !== "langue" && focus.focus) try { focus.focus({ preventScroll: true }); } catch (x) {}
  });
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el.dataset) return;
    var v = String(el.value).replace(/\D/g, "").slice(0, 3); if (v !== el.value) el.value = v;
    if (el.dataset.poChamp !== undefined) {
      var S = el.dataset.mode === "k" ? K : A; if (!S) return;
      S.sel[el.dataset.poChamp] = v;
      var b = document.querySelector('[data-action="' + (el.dataset.mode === "k" ? "k-tableau" : "a-proposer") + '"]'); if (b) b.disabled = !pret(po(S.id), S.sel);
      if (S === A && A.msg) { A.msg = ""; var rz = document.querySelector(".retour-zone"); if (rz) rz.innerHTML = ""; }
    } else if (el.dataset.ecrit !== undefined && A) A.ecrit[el.dataset.ecrit] = v;
  });
  document.addEventListener("keydown", function (e) {
    var el = e.target; if (e.key !== "Enter" || !el.dataset) return;
    var cible = el.dataset.ecrit !== undefined ? "a-ecrit-ok" : el.dataset.poChamp !== undefined ? (el.dataset.mode === "k" ? "k-tableau" : "a-proposer") : "";
    var b = cible && document.querySelector('[data-action="' + cible + '"]'); if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });
  window.addEventListener("hashchange", rendre);
  rendre();
})();
