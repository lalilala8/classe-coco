/* Classe Coco — « Les mots invariables » (orthographe).
   Données et règles reprises telles quelles du module « Mes mots invariables » du site v0 (listes identiques aux affiches 2026, D8).
   Écriture des mots : [..] = partie commune (orange), {..} = lettre muette ou finale (jaune), comme sur les affiches (D-58).
   Famille « -d » à 4 mots (D-59). */
(function () {
"use strict";
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const GROUPS = [
  {id:"g0", name:"Mots-outils du CP-CE1", color:"var(--g0)", kind:"list", fams:[
    ["1",["un","une","de{s}"]],["2",["le","la","le{s}"]],["3",["mon","ma","me{s}"]],["4",["ton","ta","te{s}"]],
    ["5",["j’ai","du","au"]],["6",["il [est]","elle [est]"]],["7",["c’[est]","et pui{s}"]],["8",["il y a","dan{s}","avec"]],
    ["9",["ne ... pa{s}","plu{s}"]],["10",["nou{s}","vou{s}"]],["11",["co[mm]e","au[ss]i"]],["12",["toi","moi"]],
    ["13",["aprè{s}","mai{s}"]],["14",["ass[ez]","déjà","ch[ez]"]],["15",["[qu]i","[qu]e","[qu]oi"]],["16",["[qu]an{d}","même"]]
  ]},
  {id:"g1", name:"Familles par dérivation", color:"var(--g1)", kind:"fam", fams:[
    ["[foi]{s}",["par[foi]{s}","autre[foi]{s}","toute[foi]{s}","quelque[foi]{s}"]],
    ["[tô]{t}",["bien[tô]{t}","aussi[tô]{t}","plu[tô]{t}","tan[tô]{t}"]],
    ["[prè]{s}",["a[prè]{s}","d’a[prè]{s}","au[prè]{s}","ex[prè]{s}"]],
    ["[tan]{t}",["au[tan]{t}","pour[tan]{t}","[tan]{t} pis","[tan]{t} mieux"]],
    ["[dessu]{s}",["au-[dessu]{s}","ci-[dessu]{s}","là-[dessu]{s}","par-[dessu]{s}"]],
    ["[sou]{s}",["des[sou]{s}","en des[sou]{s}","ci-des[sou]{s}","par-des[sou]{s}"]],
    ["[lor]{s}",["a[lor]{s}","[lor]{s}que","dès [lor]{s}"]],
    ["[fin]",["a[fin]","en[fin]"]],
    ["[ver]{s}",["tra[ver]{s}","(à) l’en[ver]{s}"]],
    ["[pui]{s}",["de[pui]{s}","[pui]{s}que","et [pui]{s}"]],
    ["[là]",["voi[là]","par-[là]"]],
    ["[mai]{s}",["ja[mai]{s}","désor[mai]{s}"]],
    ["[tou]{t}",["par[tou]{t}","[tou]{t} à coup","sur[tou]{t}"]],
    ["[quoi]",["[quoi]que","pour[quoi]"]]
  ]},
  {id:"g2", name:"Familles par analogie", color:"var(--g2)", kind:"fam", fams:[
    ["[en]-",["[en]core","[en]tre","[en]fin","[en]suite"]],
    ["[au]-",["[au]ssi","[au]tour","[au]tant","[au]jourd’hui"]],
    ["-[en]{t}",["vraim[en]{t}","seulem[en]{t}","comm[en]{t}","souv[en]{t}"]],
    ["-[or]{s}",["l[or]{s}","al[or]{s}","h[or]{s}","deh[or]{s}"]],
    ["-[ci]",["i[ci]","ce[ci]","voi[ci]"]],
    ["-[an]{s}",["d[an]{s}","ded[an]{s}","s[an]{s}"]],
    ["-[è]{s}",["d[è]{s} que","tr[è]{s}","pr[è]{s}","apr[è]{s}"]],
    ["-[que]",["pres[que]","lors[que]","puis[que]","parce [que]"]],
    ["-[van]{t}",["a[van]{t}","de[van]{t}","aupara[van]{t}","doréna[van]{t}"]],
    ["-[an]{t}",["dur[an]{t}","mainten[an]{t}","pend[an]{t}","cepend[an]{t}"]],
    ["-[ez]",["ass[ez]","ch[ez]"]],
    ["-[ain]",["dem[ain]","[ain]si","soud[ain]","m[ain]tenant"]],
    ["-[ien]",["r[ien]","b[ien]","b[ien]tôt","comb[ien]"]],
    ["-[eur]{s}",["aill[eur]{s}","plusi[eur]{s}"]]
  ]},
  {id:"g3", name:"Familles par lettre finale", color:"var(--g3)", kind:"fam", fams:[
    ["-{s}",["toujour{s}","moin{s}","plu{s}","longtemp{s}"]],
    ["-{d}",["tar{d}","quan{d}","d’accor{d}","d’abor{d}"]],
    ["-{i}",["auss{i}","ains{i}","parm{i}","aujourd’hu{i}"]],
    ["-{c}",["ave{c}","don{c}"]],
    ["-{p}",["tro{p}","beaucou{p}","tout à cou{p}"]],
    ["-{à}",["déj{à}","jusqu’{à}"]]
  ]}
];

/* Phrases d’écoute pour les mots qui se prononcent comme d’autres */
const SENT = {
  "mes":"Je range mes crayons.","mais":"Il est petit mais fort.","la":"Je mange la pomme.","là":"Pose ton sac là.",
  "des":"J’ai des billes.","dès que":"Viens dès que tu peux.","ton":"Prends ton cahier.","ta":"Range ta trousse.",
  "ma":"Voici ma maison.","mon":"C’est mon vélo.","les":"Je lave les assiettes.","tes":"Range tes affaires.",
  "et puis":"Je mange, et puis je joue.","il est":"Il est content.","elle est":"Elle est à l’école.","c’est":"C’est mon ami.",
  "au":"Je vais au marché.","du":"Je bois du lait.","plutôt":"Je préfère plutôt le bleu.","tant pis":"Il pleut, tant pis !",
  "tant mieux":"Il fait beau, tant mieux !","sans":"Il part sans son sac.","dans":"Le chat dort dans la boîte.",
  "vers":"Il marche vers la mer.","quand":"Quand il pleut, je reste à la maison.","sous":"Le chien est sous la table.",
  "enfin":"Enfin les vacances !","près":"J’habite près de l’école.","assez":"J’ai assez mangé.","chez":"Je vais chez ma mamie.",
  "hors":"Le ballon est hors du terrain.","lors":"Je l’ai vu lors de la fête.","autant":"J’ai autant de billes que toi.",
  "même":"Nous avons le même sac.","une":"J’ai une sœur.","un":"J’ai un frère.","qui":"Qui est là ?","que":"Que fais-tu ?",
  "quoi":"Tu manges quoi ?","toi":"C’est à toi.","moi":"Viens avec moi.","plus":"Je n’en veux plus.","tout à coup":"Tout à coup, le chat saute.",
  "ceci":"Regarde ceci.","ici":"Viens ici.","voici":"Voici mon livre.","avant":"Lave-toi les mains avant de manger.",
  "aussitôt":"Il est parti aussitôt.","alors":"Il pleut, alors je prends mon parapluie.","afin":"Je travaille afin de réussir.",
  "partout":"Il y a du sable partout.","surtout":"J’aime surtout les mangues.","tard":"Il est tard.","trop":"C’est trop lourd.",
  "dessous":"Regarde dessous.","après":"On joue après la classe.","exprès":"Il l’a fait exprès."
};

/* Phrases du « mot manquant » et de la dictée : [mot, phrase, mots proposés (tous bien écrits)] */
const GAP = [["un", "J’ai ___ frère et deux sœurs.", ["une", "des"]], ["une", "Mon amie a ___ jolie maison.", ["un", "des"]], ["des", "Je range ___ crayons dans ma trousse.", ["un", "une"]], ["le", "Je mange ___ gâteau.", ["la", "les"]], ["la", "Léa ouvre ___ porte.", ["le", "les"]], ["les", "Je lave ___ assiettes.", ["le", "la"]], ["mon", "Voici ___ cahier.", ["ma", "mes"]], ["ma", "Voici ___ trousse.", ["mon", "mes"]], ["mes", "Je range ___ stylos.", ["mon", "ma"]], ["ton", "Prends ___ manteau.", ["ta", "tes"]], ["ta", "Range ___ chambre.", ["ton", "tes"]], ["tes", "Montre-moi ___ dessins.", ["ton", "ta"]], ["j’ai", "___ un chat noir.", ["il", "elle"]], ["du", "Je bois ___ lait.", ["de la", "des"]], ["au", "Je vais ___ marché.", ["à la", "aux"]], ["il est", "___ midi, on mange.", ["elle est", "ils sont"]], ["elle est", "Ma sœur ___ à l’école.", ["il est", "ils sont"]], ["c’est", "Regarde, ___ un oiseau !", ["il est", "elle est"]], ["et puis", "Je prends mon sac, ___ je pars.", ["assez", "chez"]], ["il y a", "Dans la classe, ___ vingt élèves.", ["il est", "elle est"]], ["dans", "Les poissons nagent ___ l’eau.", ["sans", "chez"]], ["avec", "Je mange ma soupe ___ une cuillère.", ["chez", "vers"]], ["plus", "Léa a 5 billes et Tom en a 3 : Léa en a ___ que Tom.", ["moins", "trop"]], ["nous", "___ allons à la piscine.", ["vous", "tu"]], ["vous", "___ avez de beaux dessins.", ["nous", "tu"]], ["comme", "Il est grand ___ son père.", ["sous", "chez"]], ["aussi", "Tu aimes les mangues ? Moi ___ !", ["avant", "hors"]], ["toi", "Léa, c’est à ___ de jouer.", ["mais", "sans"]], ["moi", "Viens avec ___ !", ["mais", "sous"]], ["après", "Lundi vient avant mardi et mercredi vient ___ mardi.", ["sans", "chez"]], ["mais", "Il est petit, ___ il est fort.", ["dans", "chez"]], ["assez", "J’ai ___ mangé, merci.", ["sous", "chez"]], ["déjà", "Tu as ___ fini ton exercice ?", ["dans", "sans"]], ["chez", "Samedi, j’irai ___ mon cousin.", ["sur", "sous"]], ["qui", "___ a pris mon crayon ?", ["que", "quoi"]], ["que", "___ fais-tu ce soir ?", ["qui", "quoi"]], ["quoi", "Tu veux manger ___ ?", ["qui", "que"]], ["quand", "___ il pleut, je reste à la maison.", ["quoi", "qui"]], ["même", "Nous avons le ___ sac.", ["mais", "aussi"]], ["parfois", "Le dimanche, ___, je dors jusqu’à midi.", ["dans", "chez"]], ["autrefois", "Il y a très longtemps, ___, les gens n’avaient pas de voiture.", ["assez", "sous"]], ["toutefois", "Ce chemin est long ; ___, il est joli.", ["chez", "sans"]], ["quelquefois", "Papa lit ___ le soir.", ["sous", "chez"]], ["bientôt", "Attends un peu, le bus arrive ___.", ["sous", "chez"]], ["aussitôt", "Elle a entendu la sonnerie et elle est partie ___.", ["sans", "sous"]], ["plutôt", "Je préfère le thé ___ que le café.", ["dans", "sous"]], ["près", "J’habite ___ de l’école.", ["sans", "sous"]], ["d’après", "___ la météo, il fera beau demain.", ["chez", "sans"]], ["exprès", "Tu l’as fait ___ !", ["dans", "chez"]], ["autant", "J’ai ___ de billes que toi.", ["aussi", "assez"]], ["pourtant", "Il fait froid et ___ je n’ai pas de pull.", ["assez", "chez"]], ["tant pis", "Il n’y a plus de glace : ___ !", ["tant mieux"]], ["tant mieux", "Demain, il fera beau : ___ !", ["tant pis"]], ["alors", "Il pleut, ___ je prends mon parapluie.", ["sous", "chez"]], ["lorsque", "___ je suis arrivé, tout le monde riait.", ["presque", "chez"]], ["afin", "Je travaille bien ___ de réussir.", ["sous", "sans"]], ["enfin", "J’ai attendu longtemps ; ___ le bus arrive !", ["avant", "chez"]], ["depuis", "Je vis ici ___ trois ans.", ["dessus", "chez"]], ["puisque", "Je prends mon parapluie ___ il pleut.", ["presque", "chez"]], ["jamais", "___ je n’oublie mon cahier.", ["chez", "sans"]], ["désormais", "Hier, c’était difficile ; ___, c’est facile.", ["dessus", "chez"]], ["partout", "Il y a du sable ___.", ["chez", "sans"]], ["surtout", "J’aime les fruits, ___ les mangues.", ["sous", "chez"]], ["pourquoi", "___ tu pleures ?", ["pour", "qui"]], ["encore", "J’ai faim, je veux ___ du pain.", ["chez", "sans"]], ["entre", "Le chat est ___ la chaise et la table.", ["sans", "chez"]], ["ensuite", "Je me lave les mains, ___ je mange.", ["dessous", "chez"]], ["autour", "Les enfants dansent ___ du feu.", ["alors", "donc"]], ["aujourd’hui", "___, nous allons à la plage.", ["lors", "hors"]], ["vraiment", "Tu es ___ gentil !", ["dedans", "dessous"]], ["seulement", "J’ai ___ deux billes.", ["devant", "dedans"]], ["comment", "___ t’appelles-tu ?", ["comme", "combien"]], ["souvent", "Je vais ___ à la piscine : trois fois par semaine.", ["hors", "lors"]], ["hors", "Le ballon est ___ du terrain.", ["sous", "sans"]], ["très", "Ce gâteau est ___ bon.", ["tôt", "tard"]], ["presque", "J’ai ___ fini mon exercice.", ["lorsque", "puisque"]], ["avant", "Lave-toi les mains ___ de manger.", ["après", "sans"]], ["devant", "Le chat est ___ la porte.", ["dedans", "dehors"]], ["durant", "Il a plu ___ la nuit.", ["pourtant", "dessus"]], ["maintenant", "Hier, il pleuvait ; ___, il fait beau.", ["longtemps", "beaucoup"]], ["pendant", "Je lis ___ une heure.", ["pourtant", "dessus"]], ["cependant", "Il est petit ; ___, il est fort.", ["pendant", "dessus"]], ["demain", "Aujourd’hui, c’est lundi ; ___, c’est mardi.", ["hier", "jamais"]], ["ainsi", "Je fais ___ : je coupe, puis je colle.", ["dans", "chez"]], ["soudain", "Le ciel est calme, ___, un éclair !", ["dedans", "dessus"]], ["rien", "___ ne fait peur à Léo.", ["bien", "combien"]], ["bien", "Tu as ___ travaillé, bravo !", ["rien", "combien"]], ["combien", "___ coûte ce livre ?", ["comme", "bien"]], ["ailleurs", "Il n’y a plus de place ici, allons ___.", ["plusieurs", "trop"]], ["plusieurs", "J’ai ___ amis dans ma classe.", ["ailleurs", "beaucoup"]], ["sans", "Il part ___ son sac.", ["dans", "chez"]], ["toujours", "Le soleil se lève ___ à l’est.", ["jamais", "hier"]], ["moins", "Léa a 5 billes et Tom en a 3 : Tom en a ___ que Léa.", ["plus", "trop"]], ["longtemps", "Nous avons attendu ___ le bus.", ["dessous", "hors"]], ["tard", "Il est minuit : il est ___ !", ["tôt", "près"]], ["d’accord", "Tu viens ? Oui, ___ !", ["dehors", "dessus"]], ["d’abord", "___ je me lave, ensuite je mange.", ["dehors", "dessous"]], ["parmi", "Léo est ___ les meilleurs de la classe.", ["sous", "chez"]], ["donc", "Il pleut, ___ je prends mon parapluie.", ["chez", "sous"]], ["trop", "Ce sac est ___ lourd pour moi.", ["tôt", "tard"]], ["beaucoup", "Merci ___ !", ["tôt", "tard"]], ["jusqu’à", "Je marche ___ l’école.", ["jusque", "sans"]], ["ci-dessus", "Le début du texte est écrit ___ : regarde en haut de la page.", ["ci-dessous", "dedans"]], ["ci-dessous", "La réponse est écrite ___ : regarde en bas de la page.", ["ci-dessus", "dedans"]], ["travers", "Le chat passe à ___ la haie.", ["vers", "sans"]], ["par-là", "Toi, tu vas par ici et moi, je vais ___.", ["pourtant", "parfois"]], ["voilà", "Tu cherches ton stylo ? ___, il est là !", ["chez", "sans"]], ["voici", "___ ma maison : entre !", ["chez", "sans"]]];


const plain = m => m.replace(/[\[\]{}]/g,"");
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
function parse(m){
  const out=[]; const re=/\[([^\]]*)\]|\{([^}]*)\}|([^\[{]+)/g; let x;
  while((x=re.exec(m))){ if(x[1]!==undefined) out.push({t:x[1],c:"mi-c"}); else if(x[2]!==undefined) out.push({t:x[2],c:"mi-m"}); else out.push({t:x[3],c:""}); }
  return out;
}
const tokHTML = toks => toks.map(t=>t.c?`<span class="${t.c}">${esc(t.t)}</span>`:esc(t.t)).join("");
const html = m => tokHTML(parse(m));
function norm(s){
  return s.normalize("NFC").toLowerCase().replace(/[’'`´ʼ]/g,"'").replace(/…/g,"...").replace(/\s+/g," ").trim().replace(/[.!?]+$/,"").trim();
}
function forms(s){ // différentes écritures acceptées
  const n = norm(s); const set = new Set([n]);
  set.add(norm(n.replace(/\.{2,}/g," ")));
  if (/\(.*?\)/.test(n)){ set.add(norm(n.replace(/[()]/g,""))); set.add(norm(n.replace(/\(.*?\)/g,""))); }
  return set;
}
const sayText = p => p.replace(/\.{2,}/g," ").replace(/[()]/g,"");

/* Construction des familles (indices bilingues ; les mots restent en français) */
const NOMS = { g0: { fr: "Mots-outils du CP-CE1", en: "Key words from CP-CE1" }, g1: { fr: "Familles par dérivation", en: "Families of words built on the same word" },
  g2: { fr: "Familles par analogie", en: "Families of words that look alike" }, g3: { fr: "Familles par lettre finale", en: "Families with the same final letter" } };
const FAMS = []; const FAM = {};
GROUPS.forEach(g=>{
  g.nom = NOMS[g.id];
  g.fams = g.fams.map(([key,words],i)=>{
    const id = g.id+"-"+i;
    const k = plain(key).replace(/-/g,"");
    let hint;
    if (g.id==="g0") hint = { fr: "mots-outils, liste "+key, en: "key words, list "+key };
    else if (g.id==="g1") hint = { fr: "famille de « "+k+" »", en: "the « "+k+" » family" };
    else if (g.id==="g2") hint = key.startsWith("-") ? { fr: "mots avec « "+k+" »", en: "words with « "+k+" »" } : { fr: "mots qui commencent par « "+k+" »", en: "words that start with « "+k+" »" };
    else hint = { fr: "mots qui finissent par « "+k+" »", en: "words that end in « "+k+" »" };
    const f = {id,key,words,group:g,hint};
    FAMS.push(f); FAM[id]=f; return f;
  });
});
const ALL = new Set(); FAMS.forEach(f=>f.words.forEach(w=>forms(plain(w)).forEach(x=>ALL.add(x))));
const FAMS_OF = {}; FAMS.forEach(f=>{ if(f.group.id!=="g0") f.words.forEach(w=>{ const p=norm(plain(w)); (FAMS_OF[p]=FAMS_OF[p]||[]).push(f.id); }); });

/* Fautes plausibles */
const RULES = [
  ["ss",["s","c"]],["mm",["m"]],["ll",["l"]],["tt",["t"]],["pp",["p"]],
  ["ain",["in","ein"]],["ien",["ein"]],["an",["en"]],["en",["an"]],
  ["è",["e","ai","é"]],["é",["e","è"]],["ê",["è","e"]],["à",["a"]],["ô",["o","au"]],
  ["au",["o","eau"]],["ez",["é","er","et"]],["est",["et","ai","es"]],["qu",["k","c"]],
  ["’",[""]],["-",[" ",""]],["h",[""]],["eu",["e"]],["oi",["oa"]]
];
function applyRules(str){
  const out=[];
  RULES.forEach(([pat,reps])=>{ let i=str.indexOf(pat); while(i>=0){ reps.forEach(r=>out.push(str.slice(0,i)+r+str.slice(i+pat.length))); i=str.indexOf(pat,i+1); } });
  return out;
}
function endVariants(str){
  const out=[]; const last=str.slice(-1);
  if ("stdpcx".includes(last)) ["s","t","d","x","e",""].forEach(r=>{ if(r!==last) out.push(str.slice(0,-1)+r); });
  else if (/[aeiouyàâéèêîôû]/.test(last)){ out.push(str+"s",str+"t"); if(last==="e") out.push(str.slice(0,-1)); }
  return out;
}
const okVariant = (v,p) => v!==p && v.trim()===v && v.length>0 && !/\s{2}/.test(v) && !ALL.has(norm(v));
function misspell(p,n=2){
  let vs = [...new Set([...applyRules(p),...endVariants(p)])].filter(v=>okVariant(v,p));
  vs = shuffle(vs).slice(0,n);
  for (const x of [p+"s",p+"t",p+"x",p+"ee",p+"h"]) { if (vs.length>=n) break; if (okVariant(x,p) && !vs.includes(x)) vs.push(x); }
  return vs;
}

/* Partie à cacher dans « Lettres cachées » */
function hiddenPart(m){
  const toks = parse(m); const marked = toks.map((t,i)=>t.c?i:-1).filter(i=>i>=0);
  if (marked.length){
    const groups=[]; marked.forEach(i=>{ const g=groups[groups.length-1]; if(g && g[g.length-1]===i-1) g.push(i); else groups.push([i]); });
    const g = groups[Math.floor(Math.random()*groups.length)];
    const a=g[0], b=g[g.length-1];
    return { beforeH:tokHTML(toks.slice(0,a)), afterH:tokHTML(toks.slice(b+1)),
             before:toks.slice(0,a).map(t=>t.t).join(""), after:toks.slice(b+1).map(t=>t.t).join(""),
             seg:toks.slice(a,b+1).map(t=>t.t).join(""), segH:tokHTML(toks.slice(a,b+1)), isEnd:b===toks.length-1 };
  }
  const p = plain(m); let i = p.search(/[àâéèêëîïôûùç]/); if (i<0) i=p.length-1;
  return { beforeH:esc(p.slice(0,i)), afterH:esc(p.slice(i+1)), before:p.slice(0,i), after:p.slice(i+1),
           seg:p[i], segH:`<span class="mi-m">${esc(p[i])}</span>`, isEnd:i===p.length-1 };
}
function segOptions(h){
  const full = v => h.before+v+h.after;
  let vs = applyRules(h.seg); if (h.isEnd) vs = vs.concat(endVariants(h.seg));
  if (h.seg.length>1) vs.push(h.seg.slice(0,-1)); else vs.push("");
  vs.push(h.seg+"e", h.seg+"s");
  vs = [...new Set(vs)].filter(v=>v!==h.seg && !ALL.has(norm(full(v))) && !/\s{2}/.test(full(v)));
  return shuffle(vs).slice(0,2);
}


/* ---------- choix des mots (D-60 : l'élève choisit) ---------- */
function pool(selected, onlyFam){
  const seen=new Set(), out=[];
  FAMS.forEach(f=>{ if(!selected[f.id]) return; if(onlyFam && f.group.id==="g0") return;
    f.words.forEach(w=>{ const p=plain(w); const n=norm(p); if(seen.has(n)) return; seen.add(n); out.push({m:w,p,fam:f.id}); }); });
  return out;
}
function gapPool(selected){
  const by=new Map(pool(selected).map(x=>[norm(x.p),x]));
  return GAP.filter(g=>by.has(norm(g[0]))).map(g=>({...by.get(norm(g[0])),sent:g[1],opts:g[2]}));
}
const capFirst = s => s.charAt(0).toUpperCase()+s.slice(1);
const gapFull = (q,w) => q.sent.replace("___", q.sent.startsWith("___")?capFirst(w):w);
function htmlCap(m,cap){ const t=parse(m); if(cap&&t.length) t[0]={...t[0],t:capFirst(t[0].t)}; return tokHTML(t); }
/* famille(s) qui contiennent un mot (pour le tri) et intrus plausibles */
function famillesDe(p){ return FAMS_OF[norm(p)] || []; }
function intrus(q, selected){
  const mine = new Set(famillesDe(q.p));
  const selFams = FAMS.filter(f=>f.group.id!=="g0" && selected[f.id] && !mine.has(f.id));
  const sameGroup = FAMS.filter(f=>f.group===FAM[q.fam].group && !mine.has(f.id));
  const others = FAMS.filter(f=>f.group.id!=="g0" && !mine.has(f.id));
  const d=[]; [selFams,sameGroup,others].forEach(list=>{ shuffle(list).forEach(f=>{ if(d.length<3 && d.indexOf(f)<0) d.push(f); }); });
  return d;
}
/* réponse tapée : différentes écritures acceptées (apostrophes, parenthèses…) */
function accepte(val, p){ const a=forms(p); return [...forms(val)].some(v=>a.has(v)); }
function phraseJuste(val, q){
  const ns=s=>norm(s).replace(/[,;:!?«»"]/g," ").replace(/\s+/g," ").trim();
  const full=gapFull(q,q.p), tgt=ns(plain(q.p));
  return { mot: (" "+ns(val)+" ").includes(" "+tgt+" "), phrase: ns(val)===ns(full), full };
}

/* ---------- voix (seulement dans les jeux d'écoute et la dictée, D-31) ---------- */
const peutParler = typeof window !== "undefined" && "speechSynthesis" in window;
/* Choix de la voix (D-132) : la voix choisie dans l’Espace enseignante › Voix de la dictée (mémorisée sur l’appareil, « coco-voix »),
   sinon la voix française la plus naturelle de l’appareil (voix « améliorée », « premium », « naturelle » d’abord) ; vitesse lente par défaut. */
const VITESSES = { normale: .9, lente: .75, "tres-lente": .62 };
function prefVoix(){ try { return JSON.parse(localStorage.getItem("coco-voix")) || {}; } catch (e) { return {}; } }
function voixFrancaises(){ if(!peutParler) return []; try { return speechSynthesis.getVoices().filter(v=>/^fr/i.test(v.lang)); } catch (e) { return []; } }
function scoreVoix(v){ let s=0; if(/^fr[-_]FR/i.test(v.lang)) s+=4; if(/premium|enhanced|am[ée]lior|natural|naturel|neural/i.test(v.name)) s+=6; if(/google/i.test(v.name)) s+=3; if(/online/i.test(v.name)) s+=2;
  if(/audrey|thomas|aur[ée]lie|denise|henri|vivienne|eloise|remy|marie/i.test(v.name)) s+=1; if(/compact|eloquence|grandma|grandpa|jacques|rocko|shelley|sandy|flo|reed|eddy/i.test(v.name)) s-=3; return s; }
function meilleureVoix(){ const vs=voixFrancaises(), p=prefVoix(); if(p.nom){ const v=vs.find(x=>x.name===p.nom); if(v) return v; } return vs.slice().sort((a,b)=>scoreVoix(b)-scoreVoix(a))[0] || null; }
function vitesseVoix(){ return VITESSES[prefVoix().vitesse] || VITESSES.lente; }
function dire(liste){
  if(!peutParler) return;
  try { speechSynthesis.cancel(); const v=meilleureVoix(), r=vitesseVoix();
    liste.forEach(t=>{ const u=new SpeechSynthesisUtterance(t); u.lang="fr-FR"; if(v) u.voice=v; u.rate=r; speechSynthesis.speak(u); }); } catch (e) {}
}
if (typeof window !== "undefined") window.COCO_VOIX = { VITESSES, prefVoix, voixFrancaises, scoreVoix, meilleureVoix, vitesseVoix, dire };
const direMot = p => dire([sayText(p)]);
const direAvecPhrase = p => { const s=SENT[p]; dire(s?[sayText(p), s, sayText(p)]:[sayText(p)]); };

window.COCO_MOTS = { GROUPS, FAMS, FAM, GAP, SENT, plain, parse, tokHTML, html, norm, shuffle, misspell, hiddenPart, segOptions,
  pool, gapPool, gapFull, htmlCap, famillesDe, intrus, accepte, phraseJuste, capFirst, sayText,
  peutParler, dire, direMot, direAvecPhrase };
})();
