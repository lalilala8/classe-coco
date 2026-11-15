/* Classe Coco — les solides en 3D (séquence « Les solides », leçons GEOM11 et GEOM12).
   Dessins faits pour le site en SVG (aucune image du fichier de géométrie) :
   - 8 solides en perspective, qu’on fait tourner avec le doigt ; arêtes cachées en pointillés, comme dans les leçons ;
   - faces, arêtes et sommets qu’on allume (comptage animé) ou qu’on marque en les touchant ;
   - la trace d’une face trempée dans la peinture, sur le cahier quadrillé ;
   - les patrons (cube, pavé droit) qui se plient et se déplient, et le test « ce dessin forme-t-il un cube ? » ;
   - les assemblages de cubes ; les objets de la vie courante de la leçon GEOM11 (dessins au trait).
   Vocabulaire choisi par l’enseignante : « boule » (pas « sphère »), 14/11/2026. */
window.COCO_SOLIDES = (function () {
  "use strict";
  var PI = Math.PI;
  /* ---------- petits outils de géométrie ---------- */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.sqrt(dot(a, a)) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function centre(pts) { var c = [0, 0, 0]; pts.forEach(function (p) { c = add(c, p); }); return mul(c, 1 / pts.length); }
  function dist(a, b) { return Math.sqrt(dot(sub(a, b), sub(a, b))); }
  /* rotation autour d’un axe (Rodrigues) */
  function rotAxe(p, o, d, a) {
    var v = sub(p, o), c = Math.cos(a), s = Math.sin(a);
    var r = add(add(mul(v, c), mul(cross(d, v), s)), mul(d, dot(d, v) * (1 - c)));
    return add(r, o);
  }
  /* vue : on tourne autour de l’axe vertical (yaw), puis on penche (pitch) ; z vient vers l’œil */
  function vue(p, yaw, pitch) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1];
    var cp = Math.cos(pitch), sp = Math.sin(pitch);
    return [x, y * cp - z * sp, y * sp + z * cp];
  }
  var LUM = norm([-0.45, 0.75, 0.55]);
  function hex(c) { return "#" + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
  function melange(a, b, k) { return hex([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]); }
  /* couleurs : turquoise du lagon (charte) ; jaune pour ce qu’on allume ou marque ; blanc papier pour l’intérieur d’un patron */
  var TEINTES = { lagon: [[79, 166, 178], [222, 244, 246]], jaune: [[214, 160, 20], [255, 228, 140]], papier: [[196, 208, 214], [252, 253, 253]], peinture: [[200, 92, 40], [246, 170, 110]] };
  function teinte(nom, lum) { var t = TEINTES[nom] || TEINTES.lagon; return melange(t[0], t[1], 0.25 + 0.75 * Math.max(0, lum)); }
  function f1(n) { return Math.round(n * 10) / 10; }

  /* ---------- les 8 solides ---------- */
  function boite(a, b, c) { /* demi-dimensions : x, y (hauteur), z */
    var V = []; [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sy) { [-1, 1].forEach(function (sz) { V.push([sx * a, sy * b, sz * c]); }); }); });
    /* indice = 4*(sx>0) + 2*(sy>0) + (sz>0) */
    return { V: V, F: [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]] };
  }
  function prismeRond(r, h, n, pointe) {
    var V = [], F = [], bas = [], haut = [];
    for (var i = 0; i < n; i++) { var a = 2 * PI * i / n; V.push([r * Math.cos(a), -h / 2, r * Math.sin(a)]); bas.push(i); }
    if (pointe) { V.push([0, h / 2, 0]); for (var j = 0; j < n; j++) F.push({ i: [j, (j + 1) % n, n], courbe: true }); }
    else { for (var k = 0; k < n; k++) { V.push([r * Math.cos(2 * PI * k / n), h / 2, r * Math.sin(2 * PI * k / n)]); haut.push(n + k); }
      for (var m = 0; m < n; m++) F.push({ i: [m, (m + 1) % n, n + (m + 1) % n, n + m], courbe: true });
      F.push({ i: haut.slice() }); }
    F.push({ i: bas.slice() });
    return { V: V, F: F };
  }
  function pyramide(base, h) { var V = base.slice(), n = base.length; V.push([0, h, 0]); var F = [{ i: base.map(function (_, k) { return k; }) }]; for (var k = 0; k < n; k++) F.push({ i: [k, (k + 1) % n, n] }); return { V: V, F: F }; }
  var TRI = (function () { var r = 1.35, y = -0.85; return [0, 1, 2].map(function (k) { var a = -PI / 2 + 0.35 + 2 * PI * k / 3; return [r * Math.cos(a), y, r * Math.sin(a)]; }); })();
  var DEFS = {
    cube: { fr: "le cube", en: "a cube", nom: { fr: "cube", en: "cube" }, g: boite(1, 1, 1) },
    pave: { fr: "le pavé droit", en: "a cuboid", nom: { fr: "pavé droit", en: "cuboid" }, g: boite(1.5, 0.5, 1) },
    paveCarre: { fr: "le pavé droit à bouts carrés", en: "a cuboid with square ends", nom: { fr: "pavé droit à bouts carrés", en: "cuboid with square ends" }, g: boite(1.5, 0.75, 0.75) },
    cylindre: { fr: "le cylindre", en: "a cylinder", nom: { fr: "cylindre", en: "cylinder" }, g: prismeRond(1, 2.2, 36) },
    cone: { fr: "le cône", en: "a cone", nom: { fr: "cône", en: "cone" }, g: prismeRond(1.05, 2.3, 36, true) },
    boule: { fr: "la boule", en: "a sphere", nom: { fr: "boule", en: "sphere" }, boule: 1.15 },
    pyrCarree: { fr: "la pyramide à base carrée", en: "a square-based pyramid", nom: { fr: "pyramide à base carrée", en: "square-based pyramid" }, g: pyramide([[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], 1.2) },
    pyrTri: { fr: "la pyramide à base triangulaire", en: "a triangular-based pyramid", nom: { fr: "pyramide à base triangulaire", en: "triangular-based pyramid" }, g: pyramide(TRI, 1.25) }
  };
  var ORDRE = ["cube", "pave", "paveCarre", "cylindre", "cone", "boule", "pyrCarree", "pyrTri"];
  /* préparation : faces (forme, normale), arêtes (avec leurs deux faces), sommets, rayon pour l’échelle */
  Object.keys(DEFS).forEach(function (id) {
    var D = DEFS[id]; D.id = id;
    if (D.boule) { D.R = D.boule; D.faces = []; D.aretes = []; D.sommets = []; return; }
    var V = D.g.V, cg = centre(V);
    D.faces = D.g.F.map(function (f) {
      var ix = Array.isArray(f) ? f : f.i, P = ix.map(function (k) { return V[k]; }), c = centre(P);
      var n = norm(cross(sub(P[1], P[0]), sub(P[2], P[0]))); if (dot(n, sub(c, cg)) < 0) n = mul(n, -1);
      var forme = f.courbe ? "courbe" : ix.length > 8 ? "disque" : ix.length === 3 ? "tri" : "quad";
      if (forme === "quad") { var l1 = dist(P[0], P[1]), l2 = dist(P[1], P[2]); forme = Math.abs(l1 - l2) < 1e-6 ? "carre" : "rect"; }
      return { i: ix, n: n, c: c, forme: forme };
    });
    var vus = {}; D.aretes = [];
    D.faces.forEach(function (f, fi) { f.i.forEach(function (a, k) { var b = f.i[(k + 1) % f.i.length], cle = Math.min(a, b) + "-" + Math.max(a, b);
      if (vus[cle] === undefined) { vus[cle] = D.aretes.length; D.aretes.push({ a: Math.min(a, b), b: Math.max(a, b), f: [fi] }); } else D.aretes[vus[cle]].f.push(fi); }); });
    /* arêtes « vraies » : entre deux faces planes, ou le bord d’un disque ; les lignes entre deux morceaux de surface courbe ne sont pas des arêtes */
    D.aretes.forEach(function (e) { e.lisse = e.f.every(function (fi) { return D.faces[fi].forme === "courbe"; }); });
    D.sommets = D.faces.some(function (f) { return f.forme === "courbe" || f.forme === "disque"; }) ? [] : V.map(function (_, k) { return k; });
    D.R = Math.max.apply(null, V.map(function (p) { return Math.sqrt(dot(p, p)); }));
  });
  /* comptes de la leçon GEOM12 (et des autres solides, pour les jeux) */
  function compte(id) { var D = DEFS[id], courbe = D.boule || D.faces.some(function (f) { return f.forme === "courbe"; });
    return { faces: D.faces.filter(function (f) { return f.forme !== "courbe"; }).length, aretes: courbe ? null : D.aretes.length, sommets: courbe ? null : D.sommets.length, formes: D.faces.map(function (f) { return f.forme; }).filter(function (f) { return f !== "courbe"; }) }; }

  /* ---------- dessin d’un solide ----------
     o : yaw, pitch, taille (px), hl {faces:[], aretes:[], sommets:[]}, marques (idem), montre ("sommets" pour dessiner les points),
     tap ("faces" | "aretes" | "sommets") pour rendre touchables, id (pour tourner au doigt) */
  var VUES = {};
  var DEFAUT = { yaw: -0.62, pitch: 0.42 };
  function angles(o) { var v = o.id && VUES[o.id]; return { yaw: v ? v.yaw : (o.yaw !== undefined ? o.yaw : DEFAUT.yaw), pitch: v ? v.pitch : (o.pitch !== undefined ? o.pitch : DEFAUT.pitch) }; }
  function contenu(id, o) {
    var D = DEFS[id], A = angles(o), S = 84 / D.R, P = function (p) { var q = vue(p, A.yaw, A.pitch); return [100 + q[0] * S, 100 - q[1] * S, q[2]]; };
    var st = o.id && VUES[o.id] ? VUES[o.id] : {}, hl = st.hl || o.hl || {}, mk = st.mk || o.marques || {}, dans = function (L, k) { return (L || []).indexOf(k) >= 0; };
    var s = "";
    if (D.boule) {
      var r = D.R * S;
      s += '<defs><radialGradient id="so-bg-' + (o.id || "x") + '" cx="38%" cy="32%" r="70%">' + (o.papier ? '<stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#e2e7eb"/><stop offset="1" stop-color="#a9b4be"/>' : '<stop offset="0" stop-color="#f2fbfc"/><stop offset="0.55" stop-color="#9fd8de"/><stop offset="1" stop-color="#3f97a3"/>') + '</radialGradient></defs>' +
        '<circle cx="100" cy="100" r="' + f1(r) + '" fill="url(#so-bg-' + (o.id || "x") + ')" class="so-boule"' + (o.tap ? ' data-so-courbe="1"' : "") + "/>";
      /* équateur et méridien, pour voir la boule tourner : moitié cachée en pointillés */
      [function (a) { return [D.R * Math.cos(a), 0, D.R * Math.sin(a)]; }, function (a) { return [D.R * Math.cos(a), D.R * Math.sin(a), 0]; }].forEach(function (cer) {
        var av = "", ar = "";
        for (var i = 0; i < 48; i++) { var p1 = P(cer(2 * PI * i / 48)), p2 = P(cer(2 * PI * (i + 1) / 48)), seg = "M" + f1(p1[0]) + " " + f1(p1[1]) + "L" + f1(p2[0]) + " " + f1(p2[1]); if (p1[2] + p2[2] >= 0) av += seg; else ar += seg; }
        s += '<path d="' + ar + '" class="so-cache"/><path d="' + av + '" class="so-ligne-boule"/>';
      });
      return s + '<circle cx="100" cy="100" r="' + f1(r) + '" class="so-contour"/>';
    }
    var V2 = D.g.V.map(P), Vr = D.g.V.map(function (p) { return vue(p, A.yaw, A.pitch); });
    var devant = D.faces.map(function (f) { return vue(f.n, A.yaw, A.pitch)[2] > 1e-6; });
    /* faces : les faces visibles seulement (solides convexes) */
    D.faces.forEach(function (f, k) {
      if (!devant[k]) return;
      var n = vue(f.n, A.yaw, A.pitch), l = dot(n, LUM), coul = dans(hl.faces, k) || dans(mk.faces, k) ? teinte("jaune", l) : teinte(o.papier ? "papier" : "lagon", l);
      var tap = o.tap === "faces" || o.tap === "tampon";
      s += '<polygon points="' + f.i.map(function (i) { return f1(V2[i][0]) + "," + f1(V2[i][1]); }).join(" ") + '" fill="' + coul + '" stroke="' + coul + '" stroke-width="0.6" class="so-f' + (dans(hl.faces, k) ? " so-hl" : "") + '"' + (tap ? (f.forme === "courbe" ? ' data-so-courbe="1"' : ' data-so-f="' + k + '"') : "") + "/>";
    });
    /* arêtes : vues (trait plein), cachées (pointillés), silhouette des surfaces courbes */
    var cachees = "", vues = "", hlA = "", tapA = "";
    D.aretes.forEach(function (e, k) {
      var av = e.f.some(function (fi) { return devant[fi]; }), seg = "M" + f1(V2[e.a][0]) + " " + f1(V2[e.a][1]) + "L" + f1(V2[e.b][0]) + " " + f1(V2[e.b][1]);
      if (e.lisse) { if (e.f.length === 2 && devant[e.f[0]] !== devant[e.f[1]]) vues += seg; return; }
      if (dans(hl.aretes, k) || dans(mk.aretes, k)) hlA += '<path d="' + seg + '" class="so-a-hl' + (av ? "" : " so-a-hl--cache") + '"/>';
      if (av) vues += seg; else cachees += seg;
      if (o.tap === "aretes" && av) tapA += '<path d="' + seg + '" class="so-tap-a" data-so-a="' + k + '"/>';
    });
    s += '<path d="' + cachees + '" class="so-cache"/><path d="' + vues + '" class="so-ligne"/>' + hlA + tapA;
    /* sommets */
    if (o.montre === "sommets" || (hl.sommets && hl.sommets.length) || (mk.sommets && mk.sommets.length) || o.tap === "sommets") {
      D.sommets.forEach(function (k) {
        var vis = D.faces.some(function (f, fi) { return devant[fi] && f.i.indexOf(k) >= 0; }), on = dans(hl.sommets, k) || dans(mk.sommets, k);
        s += '<circle cx="' + f1(V2[k][0]) + '" cy="' + f1(V2[k][1]) + '" r="' + (on ? 7 : 4.5) + '" class="so-s' + (on ? " so-s--on" : "") + (vis ? "" : " so-s--cache") + '"/>';
        if (o.tap === "sommets" && vis) s += '<circle cx="' + f1(V2[k][0]) + '" cy="' + f1(V2[k][1]) + '" r="13" class="so-tap-s" data-so-s="' + k + '"/>';
      });
    }
    return s;
  }
  function dessin(id, o) {
    o = o || {};
    var t = o.taille || 160, attr = o.id ? ' data-so-id="' + o.id + '" data-so="' + id + '"' + (o.fixe ? "" : ' data-so-tourne="1"') + (o.tap ? ' data-so-tap="' + o.tap + '"' : "") : "";
    if (o.id) { var v = VUES[o.id] || (VUES[o.id] = { yaw: o.yaw !== undefined ? o.yaw : DEFAUT.yaw, pitch: o.pitch !== undefined ? o.pitch : DEFAUT.pitch }); v.o = o; v.solide = id; }
    return '<svg class="so3d' + (o.cls ? " " + o.cls : "") + (o.id && !o.fixe ? " so-tournable" : "") + '" viewBox="0 0 200 200" width="' + t + '" height="' + t + '"' + attr + ' role="img" aria-label="' + DEFS[id].nom.fr + '">' + contenu(id, o) + "</svg>";
  }
  function redessiner(svg) { var id = svg.dataset.soId, v = VUES[id]; if (!v) return; svg.innerHTML = v.pli ? pliContenu(v) : contenu(v.solide, v.o); }
  /* comptage animé : les faces (ou arêtes, ou sommets) s’allument une par une, le compteur avance */
  var anim = {};
  function compter(idSvg, quoi, sortie, fini) {
    var v = VUES[idSvg]; if (!v) return; var D = DEFS[v.solide];
    var L = quoi === "faces" ? D.faces.map(function (f, k) { return f.forme === "courbe" ? -1 : k; }).filter(function (k) { return k >= 0; }) : quoi === "aretes" ? D.aretes.map(function (e, k) { return e.lisse ? -1 : k; }).filter(function (k) { return k >= 0; }) : D.sommets.slice();
    clearInterval(anim[idSvg]); v.mk = {}; v.hl = {}; v.hl[quoi] = []; var i = 0;
    var pas = function () {
      var svg = document.querySelector('svg[data-so-id="' + idSvg + '"]'); if (!svg) { clearInterval(anim[idSvg]); return; }
      if (i < L.length) {
        v.hl[quoi].push(L[i]);
        /* une face cachée : on tourne le solide pour la montrer */
        if (quoi === "faces") { var n = D.faces[L[i]].n; if (vue(n, v.yaw, v.pitch)[2] <= 0.05) { if (Math.abs(n[1]) > 0.7) v.pitch = n[1] > 0 ? 0.75 : -0.75; else { v.yaw = Math.atan2(-n[0], n[2]) - 0.35; v.pitch = 0.35; } } }
        i++; redessiner(svg); var o = document.getElementById(sortie); if (o) o.textContent = i;
      } else { clearInterval(anim[idSvg]); if (fini) fini(L.length); }
    };
    pas(); anim[idSvg] = setInterval(pas, 750);
  }

  /* ---------- la trace d’une face (tampon) sur le cahier quadrillé ---------- */
  function forme2D(id, k) {
    var D = DEFS[id], f = D.faces[k], P = f.i.map(function (i) { return D.g.V[i]; });
    var u = norm(sub(P[1], P[0])), w = norm(cross(f.n, u));
    return P.map(function (p) { var d = sub(p, P[0]); return [dot(d, u), dot(d, w)]; });
  }
  /* un carreau du cahier = 0,5 unité ; la trace est centrée */
  function trace(id, k, o) {
    o = o || {}; var L = 12, carre = 15, W = L * carre, s = '<svg class="so-trace" viewBox="0 0 ' + W + " " + W + '" width="' + (o.taille || 150) + '" height="' + (o.taille || 150) + '" role="img" aria-label="' + (o.label || "") + '">' + '<rect width="' + W + '" height="' + W + '" class="so-cahier"/>';
    for (var i = 1; i < L; i++) s += '<path d="M' + i * carre + " 0V" + W + "M0 " + i * carre + "H" + W + '" class="so-grille"/>';
    if (k !== null && k !== undefined && k >= 0) {
      var p = forme2D(id, k), mx = Math.min.apply(null, p.map(function (q) { return q[0]; })), Mx = Math.max.apply(null, p.map(function (q) { return q[0]; })), my = Math.min.apply(null, p.map(function (q) { return q[1]; })), My = Math.max.apply(null, p.map(function (q) { return q[1]; }));
      var e = 2 * carre, ox = (W - (Mx - mx) * e) / 2, oy = (W - (My - my) * e) / 2;
      /* calage sur les carreaux quand c’est possible (carrés et rectangles) */
      if (DEFS[id].faces[k].forme === "carre" || DEFS[id].faces[k].forme === "rect") { ox = Math.round(ox / carre) * carre; oy = Math.round(oy / carre) * carre; }
      s += '<polygon points="' + p.map(function (q) { return f1(ox + (q[0] - mx) * e) + "," + f1(oy + (q[1] - my) * e); }).join(" ") + '" class="so-peinture"/>';
    }
    return s + "</svg>";
  }

  /* ---------- patrons : pliage d’un dessin de rectangles ----------
     un patron = liste de rectangles [x, y, l, h] (unités du quadrillage) ; pour le cube : cellules « x,y » */
  function rectsDe(cells) { return cells.map(function (c) { var p = String(c).split(",").map(Number); return [p[0], p[1], 1, 1]; }); }
  function charniere(r1, r2) { /* segment commun à deux rectangles, ou null */
    var e = 1e-6;
    if (Math.abs(r1[0] + r1[2] - r2[0]) < e || Math.abs(r2[0] + r2[2] - r1[0]) < e) { var x = Math.abs(r1[0] + r1[2] - r2[0]) < e ? r2[0] : r1[0], y0 = Math.max(r1[1], r2[1]), y1 = Math.min(r1[1] + r1[3], r2[1] + r2[3]); if (y1 - y0 > e) return [[x, y0], [x, y1]]; }
    if (Math.abs(r1[1] + r1[3] - r2[1]) < e || Math.abs(r2[1] + r2[3] - r1[1]) < e) { var y = Math.abs(r1[1] + r1[3] - r2[1]) < e ? r2[1] : r1[1], x0 = Math.max(r1[0], r2[0]), x1 = Math.min(r1[0] + r1[2], r2[0] + r2[2]); if (x1 - x0 > e) return [[x0, y], [x1, y]]; }
    return null;
  }
  function arbre(R) { /* arbre de pliage depuis la face qui a le plus de voisines */
    var n = R.length, vois = R.map(function (r, i) { var v = []; R.forEach(function (q, j) { if (i !== j) { var c = charniere(r, q); if (c) v.push([j, c]); } }); return v; });
    var racine = 0; vois.forEach(function (v, i) { if (v.length > vois[racine].length) racine = i; });
    var pere = new Array(n), vu = {}, file = [racine]; vu[racine] = 1; pere[racine] = null; var ordre = [];
    while (file.length) { var i = file.shift(); ordre.push(i); vois[i].forEach(function (x) { if (!vu[x[0]]) { vu[x[0]] = 1; pere[x[0]] = { p: i, c: x[1] }; file.push(x[0]); } }); }
    return { racine: racine, pere: pere, ordre: ordre, connexe: ordre.length === n };
  }
  /* coins 3D de chaque face pliée d’un angle t (0 : à plat sur la table ; 1 : pliée à 90°) ; la table est le plan y = 0 */
  function plier(R, t) {
    var A = arbre(R), coins = new Array(R.length), cx = 0, cz = 0;
    R.forEach(function (r) { cx += r[0] + r[2] / 2; cz += r[1] + r[3] / 2; }); cx /= R.length; cz /= R.length;
    var P3 = function (x, y) { return [x - cx, 0, y - cz]; };
    var trans = new Array(R.length); /* chaque transformation : liste de rotations à appliquer (de la plus proche à la racine) */
    A.ordre.forEach(function (i) {
      if (A.pere[i] === null) { trans[i] = []; return; }
      var pr = A.pere[i], o = P3(pr.c[0][0], pr.c[0][1]), d = norm(sub(P3(pr.c[1][0], pr.c[1][1]), o)), r = R[i], c = P3(r[0] + r[2] / 2, r[1] + r[3] / 2);
      var sg = rotAxe(c, o, d, 0.1)[1] > 0 ? 1 : -1;
      trans[i] = [[o, d, sg * t * PI / 2]].concat(trans[pr.p]);
    });
    /* les rotations sont exprimées dans le repère à plat : on les applique de l’enfant vers la racine, en transportant les axes */
    R.forEach(function (r, i) {
      var pts = [P3(r[0], r[1]), P3(r[0] + r[2], r[1]), P3(r[0] + r[2], r[1] + r[3]), P3(r[0], r[1] + r[3])], n = [0, 1, 0];
      if (trans[i]) trans[i].forEach(function (T) { pts = pts.map(function (p) { return rotAxe(p, T[0], T[1], T[2]); }); n = rotAxe(n, [0, 0, 0], T[1], T[2]); });
      coins[i] = { pts: pts, n: n };
    });
    return { faces: coins, connexe: A.connexe };
  }
  /* le dessin forme-t-il un cube (ou un pavé) fermé ? À 90°, deux faces au même endroit = elles se chevauchent */
  function chevauchements(R) {
    var P = plier(R, 1); if (!P.connexe) return null;
    var cles = P.faces.map(function (f) { var c = centre(f.pts); return c.map(function (v) { return Math.round(v * 100); }).join(","); }), dbl = {};
    cles.forEach(function (k, i) { cles.forEach(function (k2, j) { if (i !== j && k === k2) dbl[i] = 1; }); });
    return Object.keys(dbl).map(Number);
  }
  function estPatronCube(cells) { if (cells.length !== 6) return false; var c = chevauchements(rectsDe(cells)); return !!c && c.length === 0; }
  function connexe(cells) { return cells.length > 0 && arbre(rectsDe(cells)).connexe; }
  /* formes canoniques (dessins tournés ou retournés = le même patron) */
  function canon(cells) {
    var P = cells.map(function (c) { return String(c).split(",").map(Number); }), best = null;
    [[1, 0, 0, 1], [-1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, -1], [0, 1, 1, 0], [0, -1, 1, 0], [0, 1, -1, 0], [0, -1, -1, 0]].forEach(function (m) {
      var Q = P.map(function (p) { return [m[0] * p[0] + m[1] * p[1], m[2] * p[0] + m[3] * p[1]]; }), mx = Math.min.apply(null, Q.map(function (q) { return q[0]; })), my = Math.min.apply(null, Q.map(function (q) { return q[1]; }));
      var s = Q.map(function (q) { return (q[0] - mx) + "," + (q[1] - my); }).sort().join(";"); if (best === null || s < best) best = s;
    });
    return best;
  }
  /* même patron, dessiné « en largeur » pour l’affichage */
  function joli(cells) {
    var P = cells.map(function (c) { return String(c).split(",").map(Number); }), best = null;
    [[1, 0, 0, 1], [-1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, -1], [0, 1, 1, 0], [0, -1, 1, 0], [0, 1, -1, 0], [0, -1, -1, 0]].forEach(function (m) {
      var Q = P.map(function (p) { return [m[0] * p[0] + m[1] * p[1], m[2] * p[0] + m[3] * p[1]]; }), mx = Math.min.apply(null, Q.map(function (q) { return q[0]; })), my = Math.min.apply(null, Q.map(function (q) { return q[1]; }));
      Q = Q.map(function (q) { return [q[0] - mx, q[1] - my]; }); var w = Math.max.apply(null, Q.map(function (q) { return q[0]; })), h = Math.max.apply(null, Q.map(function (q) { return q[1]; }));
      var s = Q.map(function (q) { return q[0] + "," + q[1]; }).sort(), cle = (w >= h ? "0" : "1") + s.join(";");
      if (best === null || cle < best.cle) best = { cle: cle, cells: s };
    });
    return best.cells;
  }
  /* les 11 patrons du cube, trouvés en essayant tous les dessins de 6 carrés, puis rangés comme dans l’outil de la collègue :
     6 avec une ligne de 4 carrés, 3 avec une ligne de 3, 1 en escalier, 1 avec deux lignes de 3 */
  var PATRONS = (function () {
    var formes = { "0,0": ["0,0"] }, n;
    for (n = 2; n <= 6; n++) {
      var nouv = {};
      Object.keys(formes).forEach(function (k) { var c = formes[k]; c.forEach(function (x) { var p = x.split(",").map(Number); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var q = (p[0] + d[0]) + "," + (p[1] + d[1]); if (c.indexOf(q) >= 0) return; var c2 = c.concat([q]), k2 = canon(c2); if (!nouv[k2]) nouv[k2] = k2.split(";"); }); }); });
      formes = nouv;
    }
    var ligne = function (cells) { var best = 0, S = {}; cells.forEach(function (c) { S[c] = 1; }); cells.forEach(function (c) { var p = c.split(",").map(Number); [[1, 0], [0, 1]].forEach(function (d) { var k = 0; while (S[(p[0] + d[0] * k) + "," + (p[1] + d[1] * k)]) k++; if (k > best) best = k; }); }); return best; };
    /* deux lignes de 3 carrés parallèles */
    var deux3 = function (cells) { var S = {}, n3 = [0, 0]; cells.forEach(function (c) { S[c] = 1; }); cells.forEach(function (c) { var p = c.split(",").map(Number); [[1, 0], [0, 1]].forEach(function (d, k) { if (!S[(p[0] - d[0]) + "," + (p[1] - d[1])] && S[(p[0] + d[0]) + "," + (p[1] + d[1])] && S[(p[0] + 2 * d[0]) + "," + (p[1] + 2 * d[1])] && !S[(p[0] + 3 * d[0]) + "," + (p[1] + 3 * d[1])]) n3[k]++; }); }); return n3[0] >= 2 || n3[1] >= 2; };
    var L = Object.keys(formes).map(function (k) { return formes[k]; }).filter(function (c) { return estPatronCube(c); }).map(function (c) {
      var l = ligne(c), g = l === 4 ? 0 : l === 3 ? (deux3(c) ? 3 : 1) : 2; return { cells: joli(c), canon: canon(c), g: g };
    });
    L.sort(function (a, b) { return a.g - b.g || (a.canon < b.canon ? -1 : 1); });
    return L;
  })();
  function numeroPatron(cells) { var k = canon(cells); for (var i = 0; i < PATRONS.length; i++) if (PATRONS[i].canon === k) return i + 1; return 0; }

  /* dessin d’un patron plié (t entre 0 et 1) ; les faces se trient de la plus loin à la plus proche */
  function pliContenu(v) {
    var R = v.R, P = plier(R, v.t);
    /* échelle : le patron à plat remplit le dessin ; plié, le solide grossit et reste au centre */
    if (!v.rs) {
      var r0 = 0, r1 = 0, F1 = plier(R, 1).faces, c1 = centre([].concat.apply([], F1.map(function (f) { return f.pts; })));
      plier(R, 0).faces.forEach(function (f) { f.pts.forEach(function (p) { r0 = Math.max(r0, Math.sqrt(p[0] * p[0] + p[2] * p[2])); }); });
      F1.forEach(function (f) { f.pts.forEach(function (p) { r1 = Math.max(r1, dist(p, c1)); }); });
      v.rs = [r0, r1];
    }
    var S = (96 / v.rs[0]) * (1 - v.t) + (74 / v.rs[1]) * v.t, pitch = Math.max(-1.45, Math.min(1.45, v.pitch + 0.45 * (1 - v.t)));
    var tous = [].concat.apply([], P.faces.map(function (f) { return f.pts; })), cq = vue(centre(tous), v.yaw, pitch), cx = 100 - cq[0] * S, cy = 104 + cq[1] * S;
    var dbl = v.t > 0.97 ? (chevauchements(R) || []) : [];
    var L = P.faces.map(function (f, i) {
      var Q = f.pts.map(function (p) { var q = vue(p, v.yaw, pitch); return [cx + q[0] * S, cy - q[1] * S, q[2]]; }), n = vue(f.n, v.yaw, pitch);
      return { i: i, Q: Q, z: Q.reduce(function (a, q) { return a + q[2]; }, 0) / 4, dessus: n[2] > 0, l: Math.abs(dot(n, LUM)) };
    }).sort(function (a, b) { return a.z - b.z; });
    /* le papier est turquoise des deux côtés, un peu plus clair à l’intérieur ; les carrés qui se chevauchent en jaune */
    return L.map(function (F) {
      var coul = dbl.indexOf(F.i) >= 0 ? teinte("jaune", F.l) : teinte("lagon", F.dessus ? Math.min(1, F.l + 0.25) : F.l);
      return '<polygon points="' + F.Q.map(function (q) { return f1(q[0]) + "," + f1(q[1]); }).join(" ") + '" fill="' + coul + '" class="so-pf' + (dbl.indexOf(F.i) >= 0 ? " so-pf--dbl" : "") + '"/>';
    }).join("");
  }
  /* o : id (obligatoire pour tourner et plier), t (0 à 1), taille, yaw, pitch */
  function pli(R, o) {
    o = o || {}; var id = o.id || "pli";
    var v = VUES[id]; if (!v || v.cle !== JSON.stringify(R)) v = VUES[id] = { yaw: o.yaw !== undefined ? o.yaw : -0.5, pitch: o.pitch !== undefined ? o.pitch : 0.62, t: o.t || 0, cle: JSON.stringify(R) };
    v.R = R; v.pli = true; v.rs = null;
    return '<svg class="so3d so-pli so-tournable" viewBox="0 0 200 200" width="' + (o.taille || 200) + '" height="' + (o.taille || 200) + '" data-so-id="' + id + '" data-so-tourne="1" role="img" aria-label="patron">' + pliContenu(v) + "</svg>";
  }
  function pliT(id) { return VUES[id] ? VUES[id].t : 0; }
  function animerPli(id, vers, fini) {
    var v = VUES[id]; if (!v) return; clearInterval(anim[id]); var depart = v.t, t0 = Date.now(), duree = 1600 * Math.abs(vers - depart) + 200;
    anim[id] = setInterval(function () {
      var svg = document.querySelector('svg[data-so-id="' + id + '"]'); if (!svg) { clearInterval(anim[id]); return; }
      var k = Math.min(1, (Date.now() - t0) / duree), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; v.t = depart + (vers - depart) * e; redessiner(svg);
      var r = document.querySelector('input[data-so-pli="' + id + '"]'); if (r) r.value = Math.round(v.t * 100);
      if (k >= 1) { clearInterval(anim[id]); if (fini) fini(); }
    }, 30);
  }
  /* patron à plat, dessiné sur le quadrillage (cases données ou rectangles) */
  function patronPlat(R, o) {
    o = o || {}; var c = o.carre || 18, mx = Math.min.apply(null, R.map(function (r) { return r[0]; })), my = Math.min.apply(null, R.map(function (r) { return r[1]; }));
    var w = Math.max.apply(null, R.map(function (r) { return r[0] + r[2]; })) - mx, h = Math.max.apply(null, R.map(function (r) { return r[1] + r[3]; })) - my, m = o.marge === undefined ? 4 : o.marge;
    return '<svg class="so-patron' + (o.cls ? " " + o.cls : "") + '" viewBox="' + (-m) + " " + (-m) + " " + (w * c + 2 * m) + " " + (h * c + 2 * m) + '" width="' + (w * c + 2 * m) * (o.echelle || 1) + '" height="' + (h * c + 2 * m) * (o.echelle || 1) + '" aria-hidden="true">' +
      R.map(function (r, i) { return '<rect x="' + (r[0] - mx) * c + '" y="' + (r[1] - my) * c + '" width="' + r[2] * c + '" height="' + r[3] * c + '" class="so-pr' + ((o.dbl || []).indexOf(i) >= 0 ? " so-pr--dbl" : "") + '"/>'; }).join("") + "</svg>";
  }
  /* patrons de pavés droits (comme la leçon GEOM12, page 30) : a × b × c, en carreaux */
  function patronPave(a, b, c, sorte) {
    /* colonne : bande (a×c), fond (a×b), bande (a×c), dessus (a×b) ; deux rabats (c×b) */
    var R = [[c, 0, a, c], [c, c, a, b], [c, c + b, a, c], [c, 2 * c + b, a, b]];
    if (sorte === 1) R.push([0, c, c, b], [c + a, 2 * c + b, c, b]); else if (sorte === 2) R.push([0, 2 * c + b, c, b], [c + a, 2 * c + b, c, b]); else R.push([0, c, c, b], [c + a, c, c, b]);
    return R;
  }


  /* ---------- patrons à imprimer : bords à découper, languettes, lignes de pliage ----------
     chaque bord libre retrouve, une fois le patron plié, le bord avec lequel il se colle : un des deux porte la languette */
  function charnieres(R) { var L = []; R.forEach(function (r, i) { R.forEach(function (q, j) { if (j > i) { var c = charniere(r, q); if (c) L.push(c); } }); }); return L; }
  function bords(R) {
    var H = charnieres(R), proche = function (p, q, tol) { return Math.abs(p[0] - q[0]) < tol && Math.abs(p[1] - q[1]) < tol && (p.length < 3 || Math.abs(p[2] - q[2]) < tol); };
    var segs = [], N = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    R.forEach(function (r, i) {
      var c = [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0] + r[2], r[1] + r[3]], [r[0], r[1] + r[3]]];
      for (var k = 0; k < 4; k++) { var a = c[k], b = c[(k + 1) % 4];
        var partage = H.some(function (h) { return (proche(h[0], a, 1e-6) && proche(h[1], b, 1e-6)) || (proche(h[0], b, 1e-6) && proche(h[1], a, 1e-6)); });
        if (!partage) segs.push({ i: i, k: k, a: a, b: b, n: N[k] }); }
    });
    var P = plier(R, 1);
    segs.forEach(function (g) { var f = P.faces[g.i].pts; g.A = f[g.k]; g.B = f[(g.k + 1) % 4]; });
    segs.forEach(function (g, x) { if (g.paire !== undefined) return; for (var y = x + 1; y < segs.length; y++) { var h = segs[y]; if (h.paire !== undefined) continue;
      if ((proche(g.A, h.A, 1e-3) && proche(g.B, h.B, 1e-3)) || (proche(g.A, h.B, 1e-3) && proche(g.B, h.A, 1e-3))) { g.paire = y; h.paire = x; g.tab = true; h.tab = false; break; } } });
    return segs;
  }
  /* les faces, arêtes et sommets qu’on voit sur le dessin (vue de départ) */
  function visibles(id, o) {
    o = o || {}; var D = DEFS[id], yaw = o.yaw !== undefined ? o.yaw : DEFAUT.yaw, pitch = o.pitch !== undefined ? o.pitch : DEFAUT.pitch;
    var dev = D.faces.map(function (f) { return vue(f.n, yaw, pitch)[2] > 1e-6; });
    return { faces: D.faces.map(function (f, k) { return dev[k] && f.forme !== "courbe" ? k : -1; }).filter(function (k) { return k >= 0; }),
      aretes: D.aretes.map(function (e, k) { return !e.lisse && e.f.every(function (fi) { return dev[fi]; }) ? k : -1; }).filter(function (k) { return k >= 0; }),
      sommets: D.sommets.filter(function (k) { return D.faces.every(function (f, fi) { return f.i.indexOf(k) < 0 || dev[fi]; }); }) };
  }

  /* ---------- assemblages de cubes (tous les cubes sont visibles) ---------- */
  function assemblage(cubes, o) {
    o = o || {}; var yaw = o.yaw !== undefined ? o.yaw : -0.7, pitch = o.pitch !== undefined ? o.pitch : 0.5, S = o.S || 22;
    var occ = {}; cubes.forEach(function (c) { occ[c.join(",")] = 1; });
    var faces = [], DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    cubes.forEach(function (c) { DIRS.forEach(function (d) {
      if (occ[(c[0] + d[0]) + "," + (c[1] + d[1]) + "," + (c[2] + d[2])]) return;
      var n = vue(d, yaw, pitch); if (n[2] <= 1e-6) return;
      var u = d[0] ? [0, 1, 0] : [1, 0, 0], w = cross(d, u), m = add(c, mul(d, 0.5));
      var pts = [add(add(m, mul(u, -0.5)), mul(w, -0.5)), add(add(m, mul(u, 0.5)), mul(w, -0.5)), add(add(m, mul(u, 0.5)), mul(w, 0.5)), add(add(m, mul(u, -0.5)), mul(w, 0.5))];
      faces.push({ pts: pts.map(function (p) { return vue(p, yaw, pitch); }), l: dot(n, LUM), z: vue(m, yaw, pitch)[2] });
    }); });
    faces.sort(function (a, b) { return a.z - b.z; });
    var X = [], Y = []; faces.forEach(function (f) { f.pts.forEach(function (p) { X.push(p[0]); Y.push(p[1]); }); });
    var mx = Math.min.apply(null, X), Mx = Math.max.apply(null, X), my = Math.min.apply(null, Y), My = Math.max.apply(null, Y), W = (Mx - mx) * S + 8, H = (My - my) * S + 8;
    return '<svg class="so-assemblage' + (o.cls ? " " + o.cls : "") + '" viewBox="0 0 ' + f1(W) + " " + f1(H) + '" width="' + f1(W * (o.echelle || 1)) + '" height="' + f1(H * (o.echelle || 1)) + '" role="img" aria-label="' + (o.label || "") + '">' +
      faces.map(function (f) { return '<polygon points="' + f.pts.map(function (p) { return f1(4 + (p[0] - mx) * S) + "," + f1(4 + (My - p[1]) * S); }).join(" ") + '" fill="' + (o.papier ? (f.l > 0.6 ? "#ffffff" : f.l > 0.2 ? "#e6eaee" : "#c9d0d8") : teinte("lagon", f.l)) + '" class="so-cube-f"/>'; }).join("") + "</svg>";
  }
  /* assemblages proposés : [cubes, nombre] ; tous les cubes se voient (pas de cube caché derrière un autre) */
  var ASSEMBLAGES = [
    [[0, 0, 0], [1, 0, 0], [2, 0, 0]], [[0, 0, 0], [0, 1, 0], [0, 2, 0]], [[0, 0, 0], [1, 0, 0], [0, 1, 0]], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [1, 1, 0], [0, 2, 0]],
    [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [0, 1, 0]], [[0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [0, 0, 2]],
    [[0, 0, 0], [1, 0, 0], [2, 0, 0], [2, 1, 0], [2, 2, 0]], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [2, 1, 0]], [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1]],
    [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [1, 0, 1], [2, 0, 1]], [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [1, 1, 0], [2, 1, 0], [1, 2, 0]],
    [[0, 0, 0], [0, 1, 0], [0, 2, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0], [0, 0, 1], [0, 1, 1], [0, 0, 2]],
    [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [0, 0, 2], [0, 1, 0], [0, 1, 1], [1, 1, 0], [0, 2, 0], [0, 1, 2]]
  ];

  /* ---------- objets de la vie courante (leçon GEOM11), dessins au trait ---------- */
  var ENC = 'stroke="#1d2744" stroke-width="3" stroke-linejoin="round"';
  var OBJETS = {
    allumettes: { s: "pave", fr: "une boîte d’allumettes", en: "a matchbox", svg: '<svg class="so-obj" viewBox="0 0 120 80" aria-hidden="true"><path d="M10 34 40 18h72L82 34z" fill="#f4d58d" ' + ENC + '/><path d="M10 34h72v36H10z" fill="#e9a43c" ' + ENC + '/><path d="M82 34l30-16v36L82 70z" fill="#c97f21" ' + ENC + '/><path d="M20 44h52v16H20z" fill="#c0262d"/><circle cx="46" cy="52" r="5" fill="#f6c343"/></svg>' },
    canette: { s: "cylindre", fr: "une canette", en: "a can", svg: '<svg class="so-obj" viewBox="0 0 80 110" aria-hidden="true"><path d="M14 18v76a26 9 0 0 0 52 0V18" fill="#c0262d" ' + ENC + '/><ellipse cx="40" cy="18" rx="26" ry="9" fill="#d9dee5" ' + ENC + '/><ellipse cx="40" cy="18" rx="8" ry="3" fill="#8a95a5"/><path d="M14 46h52M14 70h52" stroke="#fff" stroke-width="5"/></svg>' },
    ballon: { s: "boule", fr: "un ballon de basket", en: "a basketball", svg: '<svg class="so-obj" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="#e8742a" ' + ENC + '/><path d="M8 50h84M50 8v84M20 20c16 14 16 46 0 60M80 20c-16 14-16 46 0 60" fill="none" stroke="#1d2744" stroke-width="3"/></svg>' },
    de: { s: "cube", fr: "un dé", en: "a dice", svg: '<svg class="so-obj" viewBox="0 0 100 100" aria-hidden="true"><path d="M14 34 40 18h48L62 34z" fill="#fff" ' + ENC + '/><path d="M14 34h48v52H14z" fill="#f4f6f8" ' + ENC + '/><path d="M62 34l26-16v52L62 86z" fill="#d9dee5" ' + ENC + '/><circle cx="26" cy="46" r="5" fill="#1d2744"/><circle cx="38" cy="60" r="5" fill="#1d2744"/><circle cx="50" cy="74" r="5" fill="#1d2744"/><circle cx="51" cy="26" r="4" fill="#1d2744"/><circle cx="75" cy="52" r="3.5" fill="#1d2744"/><circle cx="75" cy="40" r="3.5" fill="#1d2744"/></svg>' },
    pyramide: { s: "pyrCarree", fr: "une pyramide", en: "a pyramid", svg: '<svg class="so-obj" viewBox="0 0 120 90" aria-hidden="true"><path d="M60 8 12 74h64z" fill="#f2cf7a" ' + ENC + '/><path d="M60 8 76 74l34-14z" fill="#d6a447" ' + ENC + '/><path d="M28 52h38M20 63h52M40 41h24M48 30h14" stroke="#b9852c" stroke-width="2"/></svg>' },
    cornet: { s: "cone", fr: "un cornet de glace", en: "an ice-cream cone", svg: '<svg class="so-obj" viewBox="0 0 80 110" aria-hidden="true"><circle cx="40" cy="30" r="22" fill="#f6b6c2" ' + ENC + '/><path d="M14 40h52L40 104z" fill="#e2b06a" ' + ENC + '/><path d="M24 48l26 26M34 44l22 22M20 58l20 20M50 46 26 70M60 48 32 78" stroke="#b9852c" stroke-width="2"/></svg>' }
  };

  /* ---------- tourner au doigt, toucher pour marquer ---------- */
  var glisse = null;
  document.addEventListener("pointerdown", function (e) {
    var s = e.target.closest && e.target.closest("svg[data-so-tourne]"); if (!s) return;
    glisse = { s: s, x: e.clientX, y: e.clientY, bouge: 0, cible: e.target };
    try { s.setPointerCapture(e.pointerId); } catch (x) {}
    e.preventDefault();
  });
  document.addEventListener("pointermove", function (e) {
    if (!glisse) return; var v = VUES[glisse.s.dataset.soId]; if (!v) return;
    var dx = e.clientX - glisse.x, dy = e.clientY - glisse.y; glisse.bouge += Math.abs(dx) + Math.abs(dy); glisse.x = e.clientX; glisse.y = e.clientY;
    if (glisse.bouge < 6) return;
    v.yaw -= dx * 0.012; v.pitch = Math.max(-1.45, Math.min(1.45, v.pitch + dy * 0.012)); redessiner(glisse.s);
  });
  document.addEventListener("pointerup", function (e) {
    if (!glisse) return; var g = glisse; glisse = null;
    if (g.bouge >= 6) return;
    /* un toucher sans glisser : on marque (ou on choisit) la face, l’arête ou le sommet */
    var el = document.elementFromPoint(e.clientX, e.clientY) || g.cible, s = g.s, v = VUES[s.dataset.soId]; if (!v || !s.dataset.soTap) return;
    var k = null, quoi = null;
    if (el && el.dataset) { if (el.dataset.soF !== undefined) { k = +el.dataset.soF; quoi = "faces"; } else if (el.dataset.soA !== undefined) { k = +el.dataset.soA; quoi = "aretes"; } else if (el.dataset.soS !== undefined) { k = +el.dataset.soS; quoi = "sommets"; } else if (el.dataset.soCourbe) quoi = "courbe"; }
    if (!quoi) return;
    if (api.surTap && api.surTap(s.dataset.soId, quoi, k, s) === false) return;
    if (quoi === "courbe") return;
    v.o.marques = v.o.marques || {}; var L = v.o.marques[quoi] = v.o.marques[quoi] || [], i = L.indexOf(k); if (i >= 0) L.splice(i, 1); else L.push(k);
    redessiner(s);
    var c = document.querySelector('[data-so-compte="' + s.dataset.soId + '"]'); if (c) c.textContent = L.length;
  });
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el.dataset || el.dataset.soPli === undefined) return; var v = VUES[el.dataset.soPli]; if (!v) return;
    clearInterval(anim[el.dataset.soPli]); v.t = (+el.value) / 100; var svg = document.querySelector('svg[data-so-id="' + el.dataset.soPli + '"]'); if (svg) redessiner(svg);
  });

  var api = {
    DEFS: DEFS, ORDRE: ORDRE, OBJETS: OBJETS, PATRONS: PATRONS, ASSEMBLAGES: ASSEMBLAGES, VUES: VUES,
    dessin: dessin, compte: compte, compter: compter, trace: trace, redessiner: redessiner,
    rectsDe: rectsDe, pli: pli, pliT: pliT, animerPli: animerPli, patronPlat: patronPlat, patronPave: patronPave, chevauchements: chevauchements,
    estPatronCube: estPatronCube, bords: bords, charnieres: charnieres, visibles: visibles, connexe: connexe, canon: canon, joli: joli, numeroPatron: numeroPatron, assemblage: assemblage,
    oublier: function (id) { delete VUES[id]; clearInterval(anim[id]); },
    marques: function (id, quoi) { var v = VUES[id]; return v && v.o && v.o.marques && v.o.marques[quoi] ? v.o.marques[quoi].slice() : []; },
    surTap: null
  };
  return api;
})();
