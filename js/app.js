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
    var onglets = '<a class="coco-onglet" href="#accueil" aria-current="' + (actif === "accueil" ? "page" : "false") + '"><svg class="onglet-maison" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 23 24 8l18 15"/><path d="M11 20v20h26V20"/><path d="M20 40V29h8v11"/></svg>' + t("accueil") + "</a>" +
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
      '<section class="hero"><img src="' + IMG("coralie") + '" alt="Maîtresse Coco"><div><h1>' + t("titre") + "</h1></div></section>" +
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
    hidden: { perso: "vaka", etape: 1, fr: "Lettres cachées", en: "Hidden letters", dfr: "Je retrouve les lettres qui manquent.", den: "I find the missing letters." },
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
    if (G.jeu === "hidden") { G.h = MO.hiddenPart(q.m); G.opts = MO.shuffle([G.h.seg].concat(MO.segOptions(G.h))); }
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
      '<a class="coco-btn coco-btn--secondaire" href="#lecon-mots" style="justify-self:start"><img src="' + PICTO("ampoule") + '" alt="">' + t("lecon") + "</a>" +
      miChoixMots() + '<section class="etapes">' + cartes + "</section>";
  }
  function pageLeconMots() {
    var m = MATIERE.francais, en = langue === "en";
    return barre("francais") + hautJeu(m, "seq-mots", { sous: tr(C.mots.titre), titre: t("lecon") }) + (en ? '<p class="apercu">' + t("noteFr") + "</p>" : "") +
      bulle("coralie", en ? "Look at the <b>common part</b>, in orange, and the <b>silent or final letter</b>, in yellow." : "Observe la <b>partie commune</b>, en orange, et la <b>lettre muette</b> ou finale, en jaune.") +
      '<div class="mi-lecon">' + miFamillesHTML(false) + "</div>" +
      '<section class="retiens"><img src="' + IMG("coralie") + '" alt=""><div><h3>' + (en ? "I remember" : "Je retiens") + "</h3><p>" + (en ? "Invariable words never change: we learn them by heart!" : "Les mots invariables ne changent jamais : on les apprend par cœur !") + "</p></div></section>" +
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
      consigne = en ? "Which letters are missing?" : "Quelles lettres manquent ?";
      zone = indice + '<span class="mi-mot">' + G.h.beforeH + '<span class="mi-trou' + (G.rep ? " est-rempli" : "") + '">' + (G.rep ? G.h.segH : "?") + "</span>" + G.h.afterH + "</span>" +
        choix(function (o) { return o === "" ? "<i>" + (en ? "nothing" : "rien") + "</i>" : esc(o); });
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
    return haut + bulle(J.perso, consigne) + '<section class="zone m-francais mi-zone">' + zone + "</section>" +
      '<div class="retour-zone">' + G.msg + "</div>" + (bas ? '<footer class="jeu-bas"><span></span><span class="coco-row">' + bas + "</span></footer>" : "");
  }
  function miBilan(J) {
    var en = langue === "en", n = G.qs.length, sc = G.score, r = n ? sc / n : 0;
    marquerFait("mots-" + G.jeu);
    if (G.jeu === "rappel") return '<section class="bilan"><img src="' + IMG("kakou") + '" alt=""><h2>' + t("fini") + "</h2><p>" + (en ? "You remembered " + sc + " key word" + (sc > 1 ? "s" : "") + " out of " + n + ". Now, let's discover new words!" : "Tu t'es rappelé " + sc + " mot" + (sc > 1 ? "s" : "") + "-outil" + (sc > 1 ? "s" : "") + " sur " + n + ". Maintenant, découvrons de nouveaux mots !") + '</p><div class="coco-row"><a class="coco-btn" href="#mots-look">' + (en ? "Look, cover, write" : "Regarde, cache, écris") + '</a><a class="coco-btn coco-btn--secondaire" href="#seq-mots">' + t("versSequence") + "</a></div></section>";
    var msg = r === 1 ? (en ? "Perfect: you know all these words!" : "Parfait, tu connais tous ces mots !") : r >= 0.6 ? (en ? "Good work! A little more effort on a few words." : "Beau travail ! Encore un petit effort sur quelques mots.") : (en ? "Keep practising: you will get there!" : "Continue de t'entraîner, tu vas y arriver !");
    var erreurs = G.res.filter(function (x) { return !x.ok; });
    var plus = G.jeu === "dict" ? "<p>" + (G.vus ? (en ? "You looked at the model " + G.vus + " time" + (G.vus > 1 ? "s" : "") + ". Try to look a little less next time!" : "Tu as regardé le modèle " + G.vus + " fois. Essaie de le regarder un peu moins la prochaine fois !") : (en ? "Well done: you did not look at the model!" : "Bravo : tu n'as pas regardé le modèle !")) + "</p>"
      : G.jeu === "listen" && G.outils ? "<p>" + (en ? "You used your toolbox " + G.outils + " time" + (G.outils > 1 ? "s" : "") + ": that is a good strategy!" : "Tu as utilisé ton outil " + G.outils + " fois : c'est une bonne stratégie !") + "</p>" : "";
    return '<section class="bilan"><img src="' + IMG("kakou") + '" alt=""><h2>' + t("fini") + '</h2><p class="mi-score">' + sc + " / " + n + "</p><p>" + msg + "</p>" + plus +
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
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#enseignante">← Espace enseignante</a><a class="coco-btn" href="#seq-mots">Voir la séquence</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche m-francais"><small>Français · Étude de la langue · Orthographe lexicale · CE2</small><h1>Les mots invariables</h1>' +
      '<p class="f-source">Module « Mes mots invariables » du premier site de la classe, repris dans le nouveau site. Listes et familles : affiches « Mots-outils du CP-CE1 et mots invariables » (2026).</p>' +
      '<div class="f-deux"><section><h2>Compétence et attendu</h2><ul>' + li(["Compétence travaillée : s'initier à l'orthographe lexicale (cycle 2, CE2, niveau de maîtrise 3).", "Attendu de fin de cycle : orthographier les mots les plus fréquents (notamment en situation scolaire) et les mots invariables mémorisés.", "Connaissances et compétences associées : mémoriser les principaux mots invariables ; regrouper des mots par séries (familles de mots, mots reliés par des analogies morphologiques)."]) + "</ul></section>" +
      "<section><h2>Repères de progressivité (niveau 3)</h2><ul>" + li(["Mémoriser et restituer, grâce à des pratiques variées (épellation, copie, mise en mémoire), un corpus organisé de mots invariables : listes analogiques, listes thématiques.", "Reconnaître la partie commune de certains mots."]) + "</ul></section></div>" +
      '<section><h2>La séquence sur le site</h2><table class="f-table"><tbody>' +
      [["Revoir la leçon", "Revoir les familles : repérer la partie commune (orange) et la lettre muette ou finale (jaune) d'un groupe de mots, comme sur les affiches."],
       ["1 · Je me rappelle", "Trois phrases à compléter avec les mots-outils du CP-CE1. En cas d'erreur, l'élève revoit la liste concernée."],
       ["1 · Regarde, cache, écris", "Écrire de mémoire un mot invariable après l'avoir observé."],
       ["1 · Lettres cachées", "Retrouver la partie commune ou la lettre muette d'un mot. Seul jeu qui propose des lettres à choisir."],
       ["2 · Le mot manquant", "Choisir, parmi des mots correctement écrits, celui qui convient pour compléter une phrase."],
       ["2 · Le tri des familles", "Associer un mot invariable à sa famille orthographique."],
       ["2 · Écoute et écris", "Écrire sous la dictée un mot invariable, en cherchant si besoin dans « Mon outil » (je connais le mot, je le cherche, ou je demande)."],
       ["3 · La dictée sans erreur", "Se préparer (réseau de mots, partie à retenir), puis écrire cinq phrases dictées en regardant le modèle le moins possible."]].map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>"; }).join("") + "</tbody></table></section>" +
      "<section><h2>Conseils d'utilisation</h2><ul>" + li(["L'élève choisit les listes et les familles qu'il révise, sur la page de la séquence. Le choix est gardé sur l'iPad d'une fois sur l'autre.", "Les jeux d'écriture refusent les fautes d'accent : la barre de lettres accentuées aide les élèves sur iPad.", "L'écoute utilise la voix française de l'appareil : penser à monter le son et à désactiver le mode silencieux. La voix n'est utilisée que dans « Écoute et écris » et dans la dictée (décision D-31).", "En fin de partie, « Rejouer mes erreurs » relance uniquement les mots ratés.", "« Le mot manquant » ne montre que des mots bien écrits, et les productions erronées des élèves ne sont pas réaffichées : l'orthographe lexicale se mémorise en limitant les occasions de produire ou de rencontrer des graphies fautives.", "La dictée sans erreur comporte cinq phrases : le nombre de fois où l'élève regarde le modèle est donné en fin de partie, l'objectif étant de le diminuer d'une fois à l'autre."]) + "</ul></section>" +
      "<section><h2>Ressources pédagogiques</h2><ul>" + li(["A. Ouzoulias, « La mémorisation de l'orthographe lexicale, un enjeu décisif ».", "Éduscol : « Installer les bases de l'orthographe lexicale au cycle 2 » ; « Différentes formes de dictées » (dictée sans erreur) ; « La copie » ; « Lecture et orthographe : un renforcement mutuel »."]) + "</ul></section></article>";
  }

  /* ---------- Maths : lire l'heure digitale (P5 séquence 1) : pour l'instant, les jeux collectifs au TBI (D-73) ---------- */
  var JEU_DIGITAL = "jeux/heure-digitale-ardoise.html";
  function pageSequenceDigitale() {
    var s = C.digitale, m = MATIERE.maths, en = langue === "en";
    var tbi = '<a class="coco-carte coco-carte--maths" href="' + JEU_DIGITAL + '"><span class="coco-carte-vignette"><img src="' + IMG("tehani") + '" alt=""></span><span><span class="coco-carte-etape">' + (en ? "On the whiteboard · sessions 1 to 3" : "Au TBI · séances 1 à 3") + "</span><h3>" + (en ? "Boards up!" : "L’heure à l’ardoise") + "</h3><p>" +
      (en ? "Whole-class games with the teacher: slates, thumbs and fingers. In French." : "Jeux collectifs avec la maîtresse : à l’ardoise, avec les pouces ou avec les doigts.") + "</p></span></a>";
    var cartes = tbi + carte("maths", "1 · " + t("decouvre"), t("bientot"), en ? "I remember, then I discover." : "Je me rappelle, puis je découvre.", "adi", "", true) +
      carte("maths", "2 · " + t("entraine"), t("bientot"), "", "tao", "", true) + carte("maths", "3 · " + t("reinvestis"), t("bientot"), "", "nina", "", true) +
      carte("maths", "4 · " + t("ouvert") + " 1", t("bientot"), en ? "The magic time" : "L’heure magique", "adi", "", true) +
      carte("maths", "4 · " + t("ouvert") + " 2", t("bientot"), en ? "Half an hour of reading" : "La demi-heure de lecture", "adi", "", true);
    return barre("maths") + '<section class="entete m-maths"><img src="' + IMG(m.perso) + '" alt=""><div><h1>' + esc(tr(s.titre)) + "</h1><p>" + esc(tr(m.nom)) + " · " + (en ? "Measures" : "Grandeurs et mesures") + "</p></div></section>" +
      '<p class="objectif m-maths">' + t("objectif") + " <b>" + esc(tr(s.objectif)) + "</b></p>" + '<section class="etapes">' + cartes + "</section>";
  }

  /* ---------- Maths : lire l'heure à aiguilles (module du v0 repris et rendu bilingue : D-64 à D-67) ---------- */
  var HE = window.COCO_HEURE;
  var JEUX_HEURE = {
    rappel: { perso: "adi", etape: 1, fr: "Je me rappelle", en: "I remember", dfr: "Je retrouve ce que je sais sur l'heure digitale et les durées.", den: "I remember what I know about digital time and durations." },
    aig: { perso: "waeko", etape: 1, fr: "Quelle aiguille ?", en: "Which hand?", dfr: "Je reconnais la petite et la grande aiguille.", den: "I can tell the short hand from the long hand." },
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
    }).join("") + carte("maths", "4 · " + t("ouvert") + " 1", t("bientot"), en ? "Hands on the same number" : "Les aiguilles sur le même nombre", "dylan", "", true) +
      carte("maths", "4 · " + t("ouvert") + " 2", t("bientot"), en ? "A quarter turn" : "Un quart de tour", "dylan", "", true);
    return barre("maths") + '<section class="entete m-maths"><img src="' + IMG(m.perso) + '" alt=""><div><h1>' + esc(tr(s.titre)) + "</h1><p>" + esc(tr(m.nom)) + " · " + (en ? "Measures" : "Grandeurs et mesures") + "</p></div></section>" +
      '<p class="objectif m-maths">' + t("objectif") + " <b>" + esc(tr(s.objectif)) + "</b></p>" +
      '<a class="coco-btn coco-btn--secondaire" href="#lecon-heure" style="justify-self:start"><img src="' + PICTO("ampoule") + '" alt="">' + t("lecon") + "</a>" +
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
  function pageLeconHeure() {
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
      '<section class="retiens m-maths"><img src="' + IMG("coralie") + '" alt=""><div><h3>' + (en ? "I remember" : "Je retiens") + '</h3><div class="hr-cartes">' + cartes.map(function (c, k) { return '<div' + (k === 4 ? ' class="hr-complement"' : "") + "><b>" + esc(typo(c[0])) + "</b><p>" + esc(typo(c[1])) + "</p></div>"; }).join("") + "</div></div></section>" +
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
      consigne = en ? "Tap the <b>" + (qa.t === "hh" ? "short hand" : "long hand") + "</b>." : "Touche <b>" + (qa.t === "hh" ? "la petite aiguille" : "la grande aiguille") + "</b>.";
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
    return haut + bulle(J.perso, consigne) + '<section class="zone m-maths hr-zone">' + zone + "</section>" + '<div class="retour-zone">' + HG.msg + "</div>" +
      (bas ? '<footer class="jeu-bas"><span></span>' + bas + "</footer>" : "");
  }
  function heBilan() {
    var en = langue === "en", jeu = HG.jeu, n = heNombre(jeu), sc = HG.score;
    marquerFait("heure-" + jeu);
    var txt = jeu === "mem" ? (en ? "You found all the pairs in " + HG.coups + " moves." : "Tu as trouvé toutes les paires en " + HG.coups + " coups.")
      : jeu === "rappel" ? (en ? "You remembered " + sc + " out of " + n + ". Now, let’s read the clock!" : "Tu t’es rappelé " + sc + " réponse" + (sc > 1 ? "s" : "") + " sur " + n + ". Maintenant, lisons l’horloge !")
      : (en ? "You got " + sc + " out of " + n + " right first time." : "Tu as réussi " + sc + " sur " + n + " du premier coup.");
    return '<section class="bilan"><img src="' + IMG("kakou") + '" alt=""><h2>' + t("fini") + "</h2>" + (jeu === "mem" || jeu === "rappel" ? "" : '<p class="mi-score">' + sc + " / " + n + "</p>") + "<p>" + esc(typo(txt)) + "</p>" +
      '<div class="coco-row">' + (jeu === "rappel" ? '<a class="coco-btn" href="#heure-aig">' + (en ? "Which hand?" : "Quelle aiguille ?") + "</a>" : '<button class="coco-btn" type="button" data-action="h-rejouer">' + t("rejouer") + "</button>") +
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
      heFinir(ok, ok ? (en ? "That’s the right hand!" : "C’est la bonne aiguille !") : (en ? "This is the " + (qa.t === "hh" ? "long hand, for the minutes. The short hand shows the hours." : "short hand, for the hours. The long hand shows the minutes.") : "Celle-ci, c’est " + (qa.t === "hh" ? "la grande aiguille, celle des minutes. La petite aiguille indique les heures." : "la petite aiguille, celle des heures. La grande aiguille indique les minutes.")));
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
  function tbRetour() { clearInterval(TB.tid); if (TB.part === "menu") location.hash = "#enseignante"; else TB.part = "menu"; }
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
    else corps = '<section class="bilan"><img src="' + IMG("kakou") + '" alt=""><h2>' + titres.fin + '</h2><div class="coco-row"><button class="coco-btn" type="button" data-action="t-lancer">' + t("rejouer") + '</button><button class="coco-btn coco-btn--secondaire" type="button" data-action="t-retour">' + (en ? "Whiteboard menu" : "Menu du TBI") + "</button></div></section>";
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
  function ficheHeure() {
    var li = function (a) { return a.map(function (x) { return "<li>" + x + "</li>"; }).join(""); };
    return '<div class="no-print coco-row"><a class="coco-btn coco-btn--secondaire" href="#enseignante">← Espace enseignante</a><a class="coco-btn" href="#tbi-heure">Au TBI</a><a class="coco-btn coco-btn--secondaire" href="#seq-heure">Voir la séquence</a><button class="coco-btn coco-btn--secondaire" type="button" data-action="imprimer">Imprimer la fiche</button></div>' +
      '<article class="fiche m-maths"><small>Maths · Grandeurs et mesures (durées) · Cycle 2, CE2, niveau de maîtrise 3</small><h1>Lire l’heure à aiguilles</h1>' +
      '<p class="f-source">Module du premier site de la classe, repris et rendu bilingue. Programmation : période 5, semaine 2 (du 2 au 6 novembre), séquence 2. Leçons : GM5 « Lire l’heure digitale » et GM5 « Lire l’heure avec aiguilles » (reçues le 06/11/2026) ; leçon anglaise (Read the time) non reçue.</p>' +
      '<div class="f-deux"><section><h2>Attendus de fin de cycle</h2><ul>' + li(["Comparer, estimer, mesurer des longueurs, des masses, des contenances, des durées.", "Utiliser le lexique, les unités, les instruments de mesures spécifiques de ces grandeurs.", "Résoudre des problèmes impliquant des longueurs, des masses, des contenances, des durées, des prix."]) + "</ul><p><b>Compétences travaillées :</b> chercher, modéliser, représenter, raisonner, calculer, communiquer.</p></section>" +
      "<section><h2>Repères de progressivité (niveau 3)</h2><ul>" + li(["Indiquer l’heure sur un affichage à aiguilles (heure entière, demi-heure, « et quart », « moins le quart », multiples de 5 jusqu’à « vingt-cinq » et de « moins vingt-cinq » à « moins cinq »).", "Connaître et utiliser la relation 1 h = 60 min pour comparer des durées.", "Connaître et utiliser des rapports simples de durée : 1 demi-heure = 30 min ; 1 quart d’heure = 15 min.", "Résoudre des problèmes de mesurage et de comparaison avec les unités usuelles de durée."]) + "</ul></section></div>" +
      '<section><h2>Les séances et les activités du site</h2><table class="f-table"><tbody>' + [
        ["Séance 1", "Reconnaître les différentes aiguilles d’une horloge ; lire les heures piles sur le cadran.", "Je me rappelle · Quelle aiguille ? · Lis l’horloge (niveau 1)"],
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
    seqs = '<section class="domaine"><h2>Maths · Lire l’heure digitale</h2><div class="ens-liste"><div class="ens-pb"><img src="' + IMG("tehani") + '" alt=""><div><b>L’heure à l’ardoise</b><small>10 jeux collectifs au TBI pour les séances 1 à 3 (outil de la collègue, adapté)</small></div><div class="coco-row"><a class="coco-btn" href="' + JEU_DIGITAL + '">Au TBI</a><a class="coco-btn coco-btn--secondaire" href="#seq-digitale">Voir la séquence</a></div></div></div></section>' + seqs;
    seqs = '<section class="domaine"><h2>Maths · Lire l’heure à aiguilles</h2><div class="ens-liste"><div class="ens-pb"><img src="' + IMG("coralie") + '" alt=""><div><b>Lire l’heure à aiguilles</b><small>Découverte guidée et jeu des ardoises au TBI ; leçon, 8 activités</small></div><div class="coco-row"><a class="coco-btn" href="#tbi-heure">Au TBI</a><a class="coco-btn coco-btn--secondaire" href="#fiche-heure">La fiche</a><a class="coco-btn coco-btn--secondaire" href="#seq-heure">Voir la séquence</a></div></div></div></section>' + seqs;
    seqs = '<section class="domaine"><h2>Français · Les mots invariables</h2><div class="ens-liste"><div class="ens-pb ens-pb--francais"><img src="' + IMG("coralie") + '" alt=""><div><b>Les mots invariables</b><small>7 activités, de « Je me rappelle » à la dictée sans erreur</small></div><div class="coco-row"><a class="coco-btn" href="#fiche-mots">La fiche</a><a class="coco-btn coco-btn--secondaire" href="#seq-mots">Voir la séquence</a></div></div></div></section>' + seqs;
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
    accueil: pageAccueil, "seq-verbe": function () { return pageSequence("verbe"); }, "seq-mots": pageSequenceMots, "lecon-mots": pageLeconMots, "fiche-mots": ficheMots,
    "seq-heure": pageSequenceHeure, "seq-digitale": pageSequenceDigitale, "lecon-heure": pageLeconHeure, "fiche-heure": ficheHeure, "tbi-heure": pageTbiHeure,
    "lecon-verbe": pageLecon, "jeu-verbe-decouvre": jeuDecouvre, "jeu-verbe-chasse": jeuChasse, enseignante: pageEnseignante, banque: pageBanque
  };
  C.matieres.forEach(function (m) { ROUTES[m.id] = function () { return pageMatiere(m.id); }; });
  Object.keys(JEUX_MOTS).forEach(function (j) { ROUTES["mots-" + j] = function () { return jeuMots(j); }; });
  Object.keys(JEUX_HEURE).forEach(function (j) { ROUTES["heure-" + j] = function () { return jeuHeure(j); }; });
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
    if (r !== derniere) { if (r === "jeu-verbe-decouvre") D = null; if (r === "jeu-verbe-chasse") H = null; if (/^po-/.test(r)) A = null; if (/^mots-/.test(r)) G = null; if (/^heure-/.test(r)) HG = null; if (r === "tbi-heure") { clearInterval(TB.tid); TB.part = "menu"; } try { if (MO.peutParler) speechSynthesis.cancel(); } catch (x) {} if (/^classe-/.test(r)) { K = null; clearInterval(minuteur); } if (r === "lecon-verbe") L = { carte: {}, moment: "present", machine: 0, phrase: 0 }; window.scrollTo(0, 0); derniere = r; }
    document.documentElement.lang = langue;
    document.body.classList.toggle("mode-classe", /^classe-|^tbi-/.test(r));
    document.body.classList.toggle("mode-papier", /^(fiche|feuille)-/.test(r));
    app.innerHTML = ROUTES[r]();
    if (r === "tbi-heure") tbAnimer();
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
    else if (/^m-/.test(a)) actionMots(a, el);
    else if (/^h-/.test(a)) actionHeure(a, el);
    else if (/^t-/.test(a)) actionTbi(a, el);
    else if (/^bq-/.test(a)) { if (a === "bq-reglages") e.preventDefault(); actionBanque(a, el); }
    else if (a === "imprimer") { try { window.print(); } catch (x) {} return; }
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
      var b = document.querySelector('[data-action="' + (el.dataset.mode === "k" ? "k-tableau" : "a-proposer") + '"]'); if (b) b.disabled = !pret(po(S.id), S.sel);
      if (S === A && A.msg) { A.msg = ""; var rz = document.querySelector(".retour-zone"); if (rz) rz.innerHTML = ""; }
    } else if (el.dataset.ecrit !== undefined && A) A.ecrit[el.dataset.ecrit] = v;
  });
  document.addEventListener("input", function (e) { if (e.target.id === "mi-reponse" && G) G.typed = e.target.value; });
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
    var cible = el.dataset.ecrit !== undefined ? "a-ecrit-ok" : el.dataset.poChamp !== undefined ? (el.dataset.mode === "k" ? "k-tableau" : "a-proposer") : "";
    var b = cible && document.querySelector('[data-action="' + cible + '"]'); if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });
  window.addEventListener("hashchange", rendre);
  rendre();
})();
