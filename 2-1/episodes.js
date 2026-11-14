/* 통합과학1 Ⅱ-1 자연의 구성 원소 — 소단원별 이야기 세 편
   01 우주가 남긴 지문 / 02 별의 부엌 / 03 존재비 저울
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is1-2-1");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function log10(x) { return Math.log(x) / Math.LN10; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function sup(n) {
  return String(n).split("").map(function (c) { return SUP[c] || c; }).join("");
}
function sci(x, d) {
  if (!x) return "0";
  var p = Math.floor(log10(Math.abs(x)));
  var m = x / Math.pow(10, p);
  if (m >= 9.995) { m = m / 10; p += 1; }
  return m.toFixed(d == null ? 1 : d) + "×10" + sup(p);
}
/* 세그먼트 단추 묶음에서 하나만 켠다 */
function segOn(wrapId, btn) {
  var bs = $(wrapId).querySelectorAll("button");
  Array.prototype.forEach.call(bs, function (b) { b.classList.toggle("on", b === btn); });
}

/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var KT = window.sthKit, KC = KT.C, REDUCE = KT.REDUCE;
function glass(ctx, x, y, w, h, r, edge, a) {
  var g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "rgba(255,255,255," + (a == null ? 0.10 : a) + ")"); g.addColorStop(1, "rgba(255,255,255,.025)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  ctx.strokeStyle = edge || "rgba(200,210,255,.22)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke();
}
function glowText(ctx, s, x, y, o) { ctx.save(); ctx.shadowColor = o.c; ctx.shadowBlur = o.blur || 14; text(ctx, s, x, y, o); ctx.restore(); }
function pauser(id, st) {
  var b = $(id); if (!b) return;
  function paint() { b.textContent = st.on ? "⏸ 움직임 멈추기" : "▶ 움직임 보기"; }
  b.addEventListener("click", function () { st.on = !st.on; paint(); });
  paint();
}
/* 빛나는 값 막대(사각) — fw 는 채운 너비 */
function gbar(ctx, x, y, w, h, fw, col) {
  ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 5); ctx.fill();
  if (fw > 0) {
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10;
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, Math.max(2, fw), h, 5); ctx.fill(); ctx.restore();
    var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "rgba(255,255,255,.28)"); g.addColorStop(0.45, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,20,.3)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, Math.max(2, fw), h, 5); ctx.fill();
  }
}
/* 핵자 — 양성자(붉은 공)·중성자(회색 공) */
function proton(ctx, x, y, r) { KT.planet(ctx, x, y, r, "#ff7b6b", "#7a1a14"); }
function neutron(ctx, x, y, r) { KT.planet(ctx, x, y, r, "#d5dae8", "#4a5066"); }

/* ---- 밝은 스튜디오 말투 (../assets/kit.js 의 K.studio · K.card · K.iso) ---- */
var LT = KT.LT;
function lt(ctx, s, x, y, o) { o = o || {}; KT.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function floorShadow(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || 0.28) + ")"); g.addColorStop(0.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
/* 비스듬히 내려다본 판·막대: 앞면 + 윗면 + 오른쪽 옆면 (d = 깊이) */
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w + d, y + h - d * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
function vgrad(ctx, y, h, hex) { var g = ctx.createLinearGradient(0, y, 0, y + Math.max(1, h)); g.addColorStop(0, KT.tint(hex, 1.1)); g.addColorStop(1, KT.tint(hex, 0.85)); return g; }
/* 한 색으로 칠한 입체 막대 */
function bar3(ctx, x, y, w, h, d, hex) { slab(ctx, x, y, w, h, d, KT.tint(hex, 1.25), vgrad(ctx, y, h, hex), KT.tint(hex, 0.68)); }
/* 오른쪽 흰 판정 카드 */
function sideCard(ctx, x, W, H, title) { KT.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
function tick(ctx, ok, s, x, y, w) { KT.tip(ctx, (ok ? "✅ " : "⬜ ") + s, x, y, w, ok ? true : null); }
function ball(ctx, x, y, r, hex) { KT.planet(ctx, x, y, r, hex, KT.tint(hex, 0.4)); }
/* 유리 원기둥(시료병·관) — 뒤쪽 벽, 안쪽 fn(), 앞쪽 반사 순서로 그린다 */
function jar(ctx, cx, top, bot, rx, fn) {
  var ry = rx * 0.28;
  ctx.save();
  ctx.fillStyle = "rgba(225,235,248,.55)"; ctx.beginPath(); ctx.ellipse(cx, bot, rx, ry, 0, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - rx, top); ctx.lineTo(cx - rx, bot); ctx.ellipse(cx, bot, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, top); ctx.ellipse(cx, top, rx, ry, 0, 0, Math.PI, false); ctx.closePath();
  var bg = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0); bg.addColorStop(0, "rgba(200,215,235,.35)"); bg.addColorStop(.5, "rgba(255,255,255,.12)"); bg.addColorStop(1, "rgba(170,190,215,.4)");
  ctx.fillStyle = bg; ctx.fill(); ctx.clip();
  if (fn) fn(ry);
  ctx.restore();
  var hl = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0); hl.addColorStop(0, "rgba(255,255,255,0)"); hl.addColorStop(.18, "rgba(255,255,255,.55)"); hl.addColorStop(.28, "rgba(255,255,255,0)"); hl.addColorStop(.85, "rgba(255,255,255,.25)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl; ctx.fillRect(cx - rx, top, rx * 2, bot - top);
  ctx.strokeStyle = "rgba(90,110,140,.55)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(cx - rx, top); ctx.lineTo(cx - rx, bot); ctx.ellipse(cx, bot, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, top); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, top, rx, ry, 0, 0, 6.2832); ctx.stroke();
}

/* =========================================================================
   이야기 ① 우주가 남긴 지문
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 (기존 단원의 게이트 key를 그대로 쓴다) */
  window.sthGate({
    gate: "g1", key: "solarspec", title: "조사관의 첫 추리",
    question: "태양 빛을 프리즘에 통과시키면 무지개가 보입니다. 태양의 스펙트럼은 <b>끊김 없는 연속</b>일까요?",
    options: ["㉠ 완전히 연속이다", "㉡ 검은 흡수선이 수백 개 있다", "㉢ 몇 개의 밝은 선만 있다", "㉣ 색이 일곱 개로 딱 나뉜다"],
    onPick: function () { ep.clear(0); }
  });

  /* ---------------------------------------------------------------------
     장면 2 — 스펙트럼 판독실
     수소선은 뤼드베리 식으로 계산한다: 1/λ = R(1/2² − 1/n²), R = 1.09678×10⁷ /m
     스펙트럼 띠의 무지개 색만은 '내용' 자체이므로 테마 토큰 대신 실제 색을 쓴다.
     --------------------------------------------------------------------- */
  (function () {
    var canvas = $("a-spec"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var RY = 1.09678e7, mode = "abs", wl = 550;
    var got = window.sthState("specFound") || { h: false, he: false };
    function balmer(n) { return 1e9 / (RY * (0.25 - 1 / (n * n))); }
    var HL = balmer(3), HEL = 587.6;
    var LINES = [
      { nm: balmer(3), el: "수소", d: 0.62, t: "발머 계열 n=3 → 2 (Hα)" },
      { nm: balmer(4), el: "수소", d: 0.46, t: "발머 계열 n=4 → 2 (Hβ)" },
      { nm: balmer(5), el: "수소", d: 0.32, t: "발머 계열 n=5 → 2 (Hγ)" },
      { nm: balmer(6), el: "수소", d: 0.24, t: "발머 계열 n=6 → 2 (Hδ)" },
      { nm: 587.6, el: "헬륨", d: 0.30, t: "1868년 일식 때 밝은 선으로 발견된 바로 그 파장 (뜨거운 별에서는 흡수선으로 보입니다)" },
      { nm: 501.6, el: "헬륨", d: 0.18, t: "헬륨의 초록빛 선" },
      { nm: 447.1, el: "헬륨", d: 0.16, t: "헬륨의 푸른 선" },
      { nm: 589.3, el: "나트륨", d: 0.55, t: "나트륨 D선 (가로등의 주황빛과 같은 파장)" },
      { nm: 396.8, el: "칼슘", d: 0.70, t: "칼슘 H선" },
      { nm: 393.4, el: "칼슘", d: 0.75, t: "칼슘 K선" },
      { nm: 518.4, el: "마그네슘", d: 0.35, t: "마그네슘 b선" },
      { nm: 527.0, el: "철", d: 0.28, t: "철의 흡수선" },
      { nm: 495.8, el: "철", d: 0.24, t: "철의 흡수선" },
      { nm: 438.4, el: "철", d: 0.32, t: "철의 흡수선" }
    ];
    function active() {
      if (mode === "cont") return [];
      if (mode === "emis") return LINES.filter(function (L) { return L.el === "수소" || L.el === "헬륨"; });
      return LINES;
    }
    function inten(nm) {
      var base = mode === "emis" ? 0.05 : 1 - 0.20 * Math.abs(nm - 560) / 180;
      var s = 0, a = active();
      for (var i = 0; i < a.length; i++) { var dx = (nm - a[i].nm) / 1.5; s += a[i].d * Math.exp(-dx * dx); }
      if (mode === "cont") return base;
      if (mode === "emis") return clamp(base + s * 1.6, 0, 1.15);
      return clamp(base - s, 0, 1.15);
    }
    /* 파장 → 눈에 보이는 색 (근사) */
    function wlRGB(nm) {
      var r = 0, g = 0, b = 0;
      if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
      else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
      else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
      else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
      else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
      else { r = 1; }
      var f = 1;
      if (nm < 420) f = 0.3 + 0.7 * (nm - 380) / 40;
      else if (nm > 645) f = 0.3 + 0.7 * (700 - nm) / 55;
      f = clamp(f, 0, 1);
      function ch(c) { return Math.round(255 * Math.pow(clamp(c, 0, 1) * f, 0.8)); }
      return "rgb(" + ch(r) + "," + ch(g) + "," + ch(b) + ")";
    }
    var X0 = 64, X1 = 616, LO = 380, HI = 700;
    function px(nm) { return X0 + (nm - LO) / (HI - LO) * (X1 - X0); }
    var MNAME = { cont: "연속 스펙트럼", emis: "방출 스펙트럼", abs: "흡수 스펙트럼" };
    var SRC = { cont: "백열전구", emis: "가열한 수소·헬륨 기체", abs: "별빛 (태양)" };
    function nearest() {
      var a = active(), best = null, bd = 9e9;
      for (var i = 0; i < a.length; i++) { var d = Math.abs(wl - a[i].nm); if (d < bd) { bd = d; best = a[i]; } }
      return { L: best, d: bd };
    }
    /* 분광기 미니어처(크게): 실험대 위 광원 → 슬릿 → 프리즘, 아래 세운 화면에 스펙트럼이 맺힌다 */
    var BT = 176, SCT = 232, SCH = 70;
    function device() {
      var by = BT;
      floorShadow(ctx, 440, by + 8, 200, 14, 0.24);
      slab(ctx, 250, by - 16, 340, 16, 24, "#eef2f7", "#c9d1dc", "#9ea8b6");
      /* 광원 */
      if (mode === "cont") {
        ball(ctx, 292, by - 62, 22, "#fff1c4"); KT.glow(ctx, 292, by - 62, 10, "rgba(255,220,150,.95)", 3.6);
        slab(ctx, 280, by - 42, 24, 22, 7, "#d8dde5", "#aab3c0", "#7f8896");
        KT.pill(ctx, "백열전구", 292, by - 98, { a: "center", s: 12, c: "#e8ecff" });
      } else if (mode === "emis") {
        var tg = ctx.createLinearGradient(274, 0, 310, 0); tg.addColorStop(0, "rgba(255,120,190,.55)"); tg.addColorStop(.5, "rgba(255,210,235,.95)"); tg.addColorStop(1, "rgba(255,120,190,.55)");
        ctx.save(); ctx.shadowColor = "#ff7ac0"; ctx.shadowBlur = 18; ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(276, by - 106, 32, 80, 14); ctx.fill(); ctx.restore();
        slab(ctx, 270, by - 28, 44, 12, 7, "#d8dde5", "#8b95a4", "#6f7886");
        KT.pill(ctx, "기체 방전관", 292, by - 114, { a: "center", s: 12, c: "#e8ecff" });
      } else {
        KT.sun(ctx, 292, by - 66, 13);
        KT.pill(ctx, "별빛", 292, by - 108, { a: "center", s: 12, c: "#e8ecff" });
      }
      /* 슬릿 */
      slab(ctx, 352, by - 88, 14, 72, 10, "#5b6476", "#3d4555", "#2c3240");
      ctx.fillStyle = "#fff7d6"; ctx.fillRect(357, by - 66, 4, 26);
      /* 들어가는 빛 */
      var col = mode === "emis" ? "rgba(255,150,205,.85)" : "rgba(255,236,170,.9)";
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.shadowColor = col; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(312, by - 60); ctx.lineTo(352, by - 54); ctx.moveTo(366, by - 54); ctx.lineTo(452, by - 56); ctx.stroke(); ctx.restore();
      /* 프리즘(유리 삼각기둥) */
      var a = { x: 448, y: by - 16 }, b = { x: 540, y: by - 16 }, c = { x: 494, y: by - 104 }, dd = 22;
      ctx.fillStyle = "rgba(190,220,250,.55)"; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + dd, b.y - dd * .6); ctx.lineTo(c.x + dd, c.y - dd * .6); ctx.lineTo(c.x, c.y); ctx.closePath(); ctx.fill();
      var pg = ctx.createLinearGradient(a.x, c.y, b.x, b.y); pg.addColorStop(0, "rgba(235,245,255,.92)"); pg.addColorStop(1, "rgba(150,190,230,.75)");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(80,110,150,.6)"; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.moveTo(a.x + 8, a.y - 6); ctx.lineTo(c.x - 3, c.y + 14); ctx.stroke();
      /* 퍼져 나가는 빛 — 아래 화면으로 */
      if (mode !== "emis") {
        var fg = ctx.createLinearGradient(X0, 0, X1, 0);
        for (var q = 0; q <= 8; q++) fg.addColorStop(q / 8, wlRGB(LO + q / 8 * (HI - LO)));
        ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(512, by - 58); ctx.lineTo(X1, SCT); ctx.lineTo(X0, SCT); ctx.closePath(); ctx.fill(); ctx.restore();
      } else {
        var em = active();
        ctx.save(); ctx.globalAlpha = .6; ctx.lineWidth = 1.6;
        em.forEach(function (L) { ctx.strokeStyle = wlRGB(L.nm); ctx.beginPath(); ctx.moveTo(512, by - 58); ctx.lineTo(px(L.nm), SCT); ctx.stroke(); });
        ctx.restore();
      }
      KT.pill(ctx, "슬릿", 359, by - 96, { a: "center", s: 12, c: "#e8ecff" });
      KT.pill(ctx, "프리즘", 560, by - 92, { s: 12, c: "#e8ecff", box: [0, 628] });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var SW = 630, bandTop = SCT + 8, bandH = SCH - 16, nb = nearest(), hit = nb.L && nb.d <= 1.5 && mode !== "cont";
      KT.studio(ctx, 0, 0, SW, H, { x: 330, y: 404, rx: 300, ry: 22 });
      KT.bigText(ctx, wl + " nm", 18, 46, 30, hit ? "#ffd35a" : "#ffffff");
      KT.bigText(ctx, hit ? nb.L.el + "의 선!" : (mode === "cont" ? "선이 하나도 없다" : SRC[mode]), 18, 78, 17, hit ? "#8ce99a" : "#ffd35a");
      device();
      /* 세운 화면(흰 틀 + 다리) */
      ctx.fillStyle = "#8f99a8"; ctx.fillRect(140, SCT + SCH, 8, 92); ctx.fillRect(566, SCT + SCH, 8, 92);
      slab(ctx, X0 - 10, SCT, X1 - X0 + 20, SCH, 12, "#f4f6fa", "#e1e6ee", "#aab3c0");
      for (var x = X0; x < X1; x++) {
        var nm = LO + (x - X0) / (X1 - X0) * (HI - LO), I = inten(nm);
        if (mode === "emis") { ctx.fillStyle = "#151a28"; ctx.fillRect(x, bandTop, 1, bandH); if (I > 0.08) { ctx.globalAlpha = clamp(I, 0, 1); ctx.fillStyle = wlRGB(nm); ctx.fillRect(x, bandTop, 1, bandH); ctx.globalAlpha = 1; } }
        else { ctx.fillStyle = "#151a28"; ctx.fillRect(x, bandTop, 1, bandH); ctx.fillStyle = wlRGB(nm); ctx.globalAlpha = clamp(I, 0, 1); ctx.fillRect(x, bandTop, 1, bandH); ctx.globalAlpha = 1; }
      }
      var sh = ctx.createLinearGradient(0, bandTop, 0, bandTop + bandH); sh.addColorStop(0, "rgba(255,255,255,.22)"); sh.addColorStop(0.3, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(0,0,0,.22)");
      ctx.fillStyle = sh; ctx.fillRect(X0, bandTop, X1 - X0, bandH);
      ctx.strokeStyle = "rgba(40,50,70,.55)"; ctx.lineWidth = 1.2; ctx.strokeRect(X0, bandTop, X1 - X0, bandH);
      /* 눈금 */
      for (var tk = 400; tk <= 700; tk += 50) { var tx = px(tk); KT.line(ctx, { x: tx, y: SCT + SCH }, { x: tx, y: SCT + SCH + 6 }, "rgba(40,50,70,.6)", 1.2); lt(ctx, tk + "", tx, SCT + SCH + 20, { s: 12, a: "center", c: LT.mute }); }
      lt(ctx, "파장 (nm)", X0, SCT + SCH + 40, { s: 12, c: LT.mute });
      /* 커서 */
      var cx = px(wl);
      KT.line(ctx, { x: cx, y: bandTop - 12 }, { x: cx, y: bandTop + bandH + 4 }, LT.orange, 2.4, [5, 4]);
      KT.planet(ctx, cx, bandTop - 14, 6, "#ffb35c", "#a4410c");
      var labR = cx > (X0 + X1) / 2;
      KT.pill(ctx, wl + " nm", labR ? cx - 8 : cx + 8, SCT + SCH + 60, { s: 12, c: "#ffd9a8", a: labR ? "right" : "left", box: [0, SW] });
      lt(ctx, mode === "abs" ? "검은 줄 = 흡수선" : (mode === "emis" ? "밝은 줄 = 방출선" : "줄 없이 이어진 무지개"), 18, 400, { s: 12, c: LT.mute });

      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 642, W, H, "분광기 판독");
      lt(ctx, MNAME[mode], cd.px, 64, { s: 21, w: "900", c: mode === "cont" ? LT.dim : (mode === "emis" ? LT.violet : LT.blue) });
      KT.row(ctx, "광원", SRC[mode], cd.px, cd.R, 100);
      KT.row(ctx, "커서 파장", wl + " nm", cd.px, cd.R, 128, LT.orange);
      KT.row(ctx, "가까운 선", nb.L ? nb.L.nm.toFixed(1) + " nm" : "없음", cd.px, cd.R, 156);
      KT.row(ctx, "그 선의 원소", nb.L ? nb.L.el : "—", cd.px, cd.R, 184, hit ? LT.green : LT.ink);
      KT.tip(ctx, mode === "cont" ? "모든 파장이 끊김 없이 이어집니다" : (hit ? "지문을 찾았습니다" : "커서를 " + (nb.L ? nb.d.toFixed(1) : "—") + " nm 더 옮기세요"), cd.px - 4, 200, cd.w + 8, mode === "cont" ? null : hit);
      tick(ctx, got.h, "수소 656 nm", cd.px - 4, 240, cd.w + 8);
      tick(ctx, got.he, "헬륨 588 nm", cd.px - 4, 278, cd.w + 8);
      lt(ctx, "빛의 세기 그래프", cd.px, 334, { s: 12, w: "800", c: LT.mute });
      var g = KT.chart(ctx, { x: cd.px - 12, y: 338, w: cd.w + 20, h: 78, pl: 12, pb: 20, pt: 6, pr: 6, x0: LO, x1: HI, y0: 0, y1: 1.2, xt: 4, yt: 2, light: true, yf: function () { return ""; } });
      var pts = []; for (var k = 0; k <= 160; k++) { var nm3 = LO + k / 160 * (HI - LO); pts.push([nm3, clamp(inten(nm3), 0, 1.15)]); }
      KT.plot(ctx, g, pts, "#1d2b4a", { w: 1.8, light: true });
      KT.line(ctx, { x: g.X(wl), y: g.T }, { x: g.X(wl), y: g.B }, LT.orange, 1.8, [4, 3]);
      say();
    }
    function say() {
      var a = active(), best = null, bd = 9e9;
      for (var i = 0; i < a.length; i++) { var d = Math.abs(wl - a[i].nm); if (d < bd) { bd = d; best = a[i]; } }
      var msg;
      if (mode === "cont") msg = "백열전구의 빛에는 <b>선이 하나도 없습니다</b>. 모든 파장이 끊김 없이 이어진 <b>연속 스펙트럼</b>입니다.";
      else if (best && bd <= 1.5) msg = "🔎 <b>" + best.nm.toFixed(1) + " nm</b> — <b>" + best.el + "</b>의 선입니다. " + best.t + (mode === "abs" ? " 별빛에서는 이 파장의 빛이 <b>빠져나가 검게</b> 보입니다." : " 가열한 기체는 이 파장의 빛을 <b>스스로 냅니다</b>.");
      else if (best) msg = "가까운 선은 <b>" + best.nm.toFixed(1) + " nm (" + best.el + ")</b>, 커서에서 " + bd.toFixed(1) + " nm 떨어져 있습니다. 커서를 그쪽으로 옮겨 보세요.";
      else msg = "이 파장에는 선이 없습니다.";
      $("a-spec-info").innerHTML = msg;
    }
    function check() {
      if (mode !== "cont") {
        var ch = false;
        if (Math.abs(wl - HL) <= 1.2 && !got.h) { got.h = true; ch = true; }
        if (Math.abs(wl - HEL) <= 1.2 && !got.he) { got.he = true; ch = true; }
        if (ch) window.sthState("specFound", got);
      }
      mission();
    }
    function mission() {
      if (got.h) done("m1-2a");
      if (got.he) done("m1-2b");
      if (got.h && got.he) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>가 본 적 없는 천체의 성분을 <b>빛만으로</b> 알아냈습니다. 흡수선의 파장은 원소마다 정해져 있어, 별빛을 펼치면 그 별의 구성 원소를 읽을 수 있습니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("a-wl").addEventListener("input", function (e) { wl = +e.target.value; $("a-wl-val").textContent = wl + " nm"; draw(); check(); });
    Array.prototype.forEach.call($("a-mode").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { mode = b.getAttribute("data-m"); segOn("a-mode", b); draw(); check(); });
    });
    draw(); mission();
  })();

  /* ---------------------------------------------------------------------
     장면 3 — 빅뱅 뒤 3분
     T ≈ 10¹⁰ K / √t  →  t = (10¹⁰/T)² 초
     중성자/양성자 비: T > T_f 에서는 exp(−Δmc²/kT), 그 아래로는 굳은 뒤 중성자 붕괴(880초)
     --------------------------------------------------------------------- */
  (function () {
    var canvas = $("a-bang"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var e = 13, got = window.sthState("bangGot") || { a: false, b: false };
    var DM = 1.5e10, TF = 8.2e9, TNUC = 0.9e9, TREC = 3000, TAU = 880;
    function tsec(T) { var x = 1e10 / T; return x * x; }
    function ratio(T) {
      if (T >= TF) return Math.exp(-DM / T);
      var rf = Math.exp(-DM / TF);
      return rf * Math.exp(-(tsec(Math.max(T, TNUC)) - tsec(TF)) / TAU);
    }
    function heY(T) { if (T > TNUC) return 0; var r = ratio(TNUC); return 2 * r / (1 + r); }
    function stage(T) {
      if (T >= 1e12) return 0;
      if (T >= TF) return 1;
      if (T > TNUC) return 2;
      if (T > TREC) return 3;
      return 4;
    }
    var SNAME = ["쿼크·경입자의 시대", "양성자와 중성자가 만들어지다", "중수소 병목 — 만들어지자마자 깨진다", "빅뱅 핵합성 완료 — 원자핵이 떠도는 플라스마", "재결합 — 원자가 생기고 빛이 풀려나다"];
    var SDESC = [
      "온도가 너무 높아 쿼크와 경입자(전자·중성미자)가 따로따로 날아다닙니다. 아직 양성자도 중성자도 없습니다.",
      "쿼크 셋이 뭉쳐 양성자와 중성자가 되었습니다. 둘은 서로 바뀔 수 있어서, 온도가 내려갈수록 <b>더 무거운 중성자가 점점 줄어듭니다</b>.",
      "중성자와 양성자의 비가 굳었습니다. 둘이 붙어 중수소(²H)가 되어도 뜨거운 광자가 곧바로 깨뜨려서, <b>헬륨으로 가는 길이 막혀 있습니다</b>. 그동안 중성자는 스스로 붕괴해 조금씩 줄어듭니다.",
      "드디어 중수소가 살아남고, 남아 있던 <b>중성자가 거의 모두 헬륨 원자핵으로 묶였습니다</b>. 빅뱅 뒤 약 3분, 여기서 수소 : 헬륨 비가 정해집니다. 전자는 아직 원자핵에 붙지 못한 채 떠돕니다.",
      "우주가 3,000 K 아래로 식자 원자핵이 전자를 붙잡아 <b>중성 원자</b>가 되었습니다. 빛을 가로막던 자유 전자가 사라져 빛이 곧게 뻗어 나갔고, 그 빛이 지금의 <b>우주 배경 복사</b>입니다."
    ];
    function timeStr(T) {
      var t = tsec(T);
      if (t < 1) return sci(t, 1) + " 초";
      if (t < 90) return t.toFixed(1) + " 초";
      if (t < 7200) return (t / 60).toFixed(1) + " 분";
      if (t < 3.15e7) return (t / 3600).toFixed(1) + " 시간";
      var yr = t / 3.156e7;
      if (yr < 10000) return Math.round(yr).toLocaleString() + " 년";
      return Math.round(yr / 10000).toLocaleString() + " 만 년";
    }
    /* 입자 자리 (한 번만 정한다) */
    var POS = [], i, ang;
    for (i = 0; i < 24; i++) { ang = i * 2.399; POS.push([Math.cos(ang) * (18 + (i % 5) * 16), Math.sin(ang) * (16 + (i % 4) * 15)]); }

    var ast = { on: !REDUCE }, tm = 0;
    function jig(i, a) { return [Math.sin(tm * 0.004 + i * 1.7) * a, Math.cos(tm * 0.0047 + i * 2.3) * a]; }
    /* 유리 상자 속 '우주 한 조각' — 아이소메트릭 유리 정육면체 */
    var CB = 190, I3 = KT.iso({ ox: 292, oy: 214, s: 0.62, L: CB, D: CB });
    var P3 = (function () { var R = KT.rng(31), a = [], k; for (k = 0; k < 40; k++) a.push([0.12 + R() * 0.76, 0.12 + R() * 0.76, 0.12 + R() * 0.76]); a.sort(function (p, q) { return (p[0] + p[1]) - (q[0] + q[1]); }); return a; })();
    function cp(k, amp) { var j = jig(k, amp), p = P3[k % P3.length]; return I3.P(p[0] * CB + j[0], p[1] * CB + j[1], p[2] * CB + j[0] * .5); }
    function photon(x, y, ang, len) {
      var dx = Math.cos(ang) * len, dy = Math.sin(ang) * len;
      ctx.save(); ctx.strokeStyle = "#f08c00"; ctx.lineWidth = 1.8; ctx.shadowColor = "#ffd36b"; ctx.shadowBlur = 5;
      ctx.beginPath();
      for (var s = 0; s <= 10; s++) { var f = s / 10, w = Math.sin(f * Math.PI * 4) * 2.5; var px = x + dx * f - Math.sin(ang) * w, py = y + dy * f + Math.cos(ang) * w; if (s) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke(); ctx.restore();
    }
    function elec(x, y) { ball(ctx, x, y, 3.4, "#4dabf7"); }
    function he4(x, y, r) { proton(ctx, x - r * .45, y - r * .4, r); neutron(ctx, x + r * .45, y - r * .4, r); neutron(ctx, x - r * .45, y + r * .45, r); proton(ctx, x + r * .45, y + r * .45, r); }
    function poly3(pts, fill, stroke) {
      ctx.beginPath(); pts.forEach(function (p, k) { if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.3; ctx.stroke(); }
    }
    function cube(hot, inside) {
      var P = I3.P, c = CB;
      floorShadow(ctx, P(c, c, 0).x, P(c, c, 0).y - 50, 170, 34, 0.26);
      /* 받침대 */
      I3.box(ctx, -10, -10, -14, c + 10, c + 10, 0, "#eef2f7", "#c9d1dc", "#9ea8b6");
      /* 뒤 벽 두 장 + 바닥 */
      poly3([P(0, 0, 0), P(c, 0, 0), P(c, c, 0), P(0, c, 0)], "rgba(190,205,225,.35)");
      poly3([P(0, 0, 0), P(0, c, 0), P(0, c, c), P(0, 0, c)], "rgba(200,215,235,.28)", "rgba(120,140,170,.35)");
      poly3([P(0, 0, 0), P(c, 0, 0), P(c, 0, c), P(0, 0, c)], "rgba(185,200,225,.30)", "rgba(120,140,170,.35)");
      /* 뜨거울수록 상자 속이 달아오른다 */
      var m = P(c / 2, c / 2, c / 2), gl = ctx.createRadialGradient(m.x, m.y, 6, m.x, m.y, 150);
      gl.addColorStop(0, "rgba(255," + Math.round(150 + 80 * hot) + ",70," + (0.12 + 0.55 * hot).toFixed(2) + ")"); gl.addColorStop(1, "rgba(255,120,60,0)");
      ctx.save(); poly3([P(0, 0, c), P(c, 0, c), P(c, 0, 0), P(c, c, 0), P(0, c, 0), P(0, c, c)]); ctx.clip();
      ctx.fillStyle = gl; ctx.fillRect(0, 0, 640, H);
      inside();
      ctx.restore();
      /* 앞 유리 세 장 */
      poly3([P(0, c, 0), P(c, c, 0), P(c, c, c), P(0, c, c)], "rgba(225,238,252,.16)");
      poly3([P(c, 0, 0), P(c, c, 0), P(c, c, c), P(c, 0, c)], "rgba(200,220,245,.22)");
      poly3([P(0, 0, c), P(c, 0, c), P(c, c, c), P(0, c, c)], "rgba(240,248,255,.20)");
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1.4;
      [[P(0, c, 0), P(c, c, 0)], [P(c, c, 0), P(c, 0, 0)], [P(0, c, 0), P(0, c, c)], [P(c, c, 0), P(c, c, c)], [P(c, 0, 0), P(c, 0, c)],
       [P(0, 0, c), P(c, 0, c)], [P(c, 0, c), P(c, c, c)], [P(c, c, c), P(0, c, c)], [P(0, c, c), P(0, 0, c)]].forEach(function (s) { ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y); ctx.lineTo(s[1].x, s[1].y); ctx.stroke(); });
      var a = P(c * .15, c, c * .95), b = P(c * .55, c, c * .1);
      var hl = ctx.createLinearGradient(a.x, a.y, b.x, b.y); hl.addColorStop(0, "rgba(255,255,255,0)"); hl.addColorStop(.5, "rgba(255,255,255,.22)"); hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save(); poly3([P(0, c, 0), P(c, c, 0), P(c, c, c), P(0, c, c)]); ctx.clip(); ctx.fillStyle = hl; ctx.fillRect(0, 0, 640, H); ctx.restore();
    }
    function legend(items, x, y) {
      items.forEach(function (it, k) {
        var yy = y + k * 30;
        if (it[0] === "p") proton(ctx, x + 8, yy - 5, 8);
        else if (it[0] === "n") neutron(ctx, x + 8, yy - 5, 8);
        else if (it[0] === "e") elec(x + 8, yy - 5);
        else if (it[0] === "q") { ball(ctx, x + 4, yy - 5, 4.5, "#9775fa"); ball(ctx, x + 13, yy - 5, 4.5, "#20c997"); }
        else if (it[0] === "h") he4(x + 8, yy - 5, 5);
        else if (it[0] === "g") photon(x - 2, yy - 5, 0, 20);
        else if (it[0] === "a") { ctx.strokeStyle = "rgba(28,126,214,.55)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x + 8, yy - 5, 11, 7, 0, 0, 6.2832); ctx.stroke(); proton(ctx, x + 8, yy - 5, 4.5); elec(x + 19, yy - 5); }
        lt(ctx, it[1], x + 28, yy, { s: 12, w: "800", c: LT.ink });
      });
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var T = Math.pow(10, e), st = stage(T), r = ratio(T), Y = heY(T), hot = clamp((e - 3) / 10, 0, 1), SW = 630, i, p;
      KT.studio(ctx, 0, 0, SW, H, null);
      KT.bigText(ctx, sci(T, 2) + " K", 18, 46, 30, hot > .55 ? "#ffb35c" : "#ffffff");
      KT.bigText(ctx, SNAME[st], 18, 78, 17, "#ffd35a");
      var nn = Math.max(1, Math.round(14 * r / (1 + r)));
      cube(hot, function () {
        if (st <= 3) for (i = 0; i < 6; i++) { p = cp(30 + i, 10); photon(p.x - 10, p.y, i * 1.1 + tm * 0.002 * (i % 2 ? 1 : -1), 18); }
        if (st === 0) {
          for (i = 0; i < 24; i++) { p = cp(i, 6); ball(ctx, p.x, p.y, 4.5, i % 3 === 0 ? "#9775fa" : "#20c997"); }
        } else if (st === 1 || st === 2) {
          for (i = 0; i < 14; i++) { p = cp(i * 2, 3); if (i < nn) neutron(ctx, p.x, p.y, 8.5); else proton(ctx, p.x, p.y, 8.5); }
        } else if (st === 3) {
          p = cp(12, 2); he4(p.x, p.y, 8.5);
          for (i = 0; i < 9; i++) { p = cp(i * 3 + 1, 3); proton(ctx, p.x, p.y, 7.5); }
          for (i = 0; i < 8; i++) { p = cp(i * 4 + 2, 7); elec(p.x, p.y); }
        } else {
          var oa = tm * 0.003, q = cp(14, 0);
          ctx.strokeStyle = "rgba(28,126,214,.5)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(q.x, q.y, 24, 15, 0, 0, 6.2832); ctx.stroke();
          he4(q.x, q.y, 6.5); elec(q.x + Math.cos(oa) * 24, q.y + Math.sin(oa) * 15); elec(q.x + Math.cos(oa + Math.PI) * 24, q.y + Math.sin(oa + Math.PI) * 15);
          [5, 22, 38].forEach(function (k, n) {
            var h = cp(k, 0); ctx.strokeStyle = "rgba(28,126,214,.5)"; ctx.beginPath(); ctx.ellipse(h.x, h.y, 15, 10, 0, 0, 6.2832); ctx.stroke();
            proton(ctx, h.x, h.y, 6); elec(h.x + Math.cos(-oa * 1.3 + n) * 15, h.y + Math.sin(-oa * 1.3 + n) * 10);
          });
        }
      });
      /* 재결합 뒤: 빛이 상자 밖으로 곧게 뻗어 나간다 */
      if (st === 4) for (i = 0; i < 4; i++) {
        var s0 = I3.P(CB * .3 + i * 30, CB * .5, CB * .3 + i * 22), s1 = { x: s0.x + 210, y: s0.y + 18 };
        KT.arrow(ctx, s0, s1, "rgba(240,140,0,.85)", 2.2, 10);
        var f = ((tm * 0.0004 + i * 0.27) % 1);
        KT.planet(ctx, s0.x + (s1.x - s0.x) * f, s0.y + (s1.y - s0.y) * f, 3.2, "#ffe066", "#e67700");
      }
      var LG = st === 0 ? [["q", "쿼크"], ["e", "전자 · 중성미자"], ["g", "빛 (광자)"]]
        : st <= 2 ? [["p", "양성자 " + (14 - nn) + "개"], ["n", "중성자 " + nn + "개"], ["g", "빛 (광자)"]]
        : st === 3 ? [["h", "헬륨 원자핵"], ["p", "양성자 = 수소 원자핵"], ["e", "자유 전자"], ["g", "빛 — 전자에 막혀 갇힘"]]
        : [["a", "헬륨 · 수소 원자"], ["g", "빛 — 곧게 뻗어 나감"]];
      legend(LG, 440, st === 4 ? 128 : 138);
      KT.warn(ctx, SW - 14, 30, "⚠ 입자 수·크기는 실제 비율이 아님", "right");

      /* 아래 — 온도 눈금 막대 (왼쪽 = 차가움 = 나중) */
      var ax0 = 36, ax1 = 596, ay = 392;
      function ex(ee) { return ax0 + (ee - 3) / 10 * (ax1 - ax0); }
      var tg = ctx.createLinearGradient(ax0, 0, ax1, 0); tg.addColorStop(0, "#74c0fc"); tg.addColorStop(0.5, "#ffd43b"); tg.addColorStop(1, "#ff6b4a");
      slab(ctx, ax0, ay - 6, ax1 - ax0, 12, 8, "#f1f3f5", tg, "#c25a2a");
      var MARK = [[log10(TREC), "재결합", 1], [log10(TNUC), "헬륨 생성", 1], [log10(TF), "비가 굳는 때", 0], [12, "쿼크 시대 끝", 1]];
      for (i = 0; i < MARK.length; i++) {
        var mx = ex(MARK[i][0]);
        ctx.strokeStyle = LT.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, ay - 12); ctx.lineTo(mx, ay + 8); ctx.stroke();
        lt(ctx, MARK[i][1], clamp(mx, ax0 + 34, ax1 - 34), MARK[i][2] ? ay + 24 : ay - 18, { s: 11, a: "center", c: LT.green, w: "800" });
      }
      var hx = ex(e);
      KT.planet(ctx, hx, ay, 8, "#ffffff", "#e67700");
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, ay, 11, 0, 6.2832); ctx.stroke();
      lt(ctx, "◀ 차가움 (나중)", ax0, ay - 18, { s: 10.5, c: LT.mute });
      lt(ctx, "뜨거움 (빅뱅 직후) ▶", ax1, ay - 18, { s: 10.5, c: LT.mute, a: "right" });

      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 642, W, H, "빅뱅 시계");
      KT.row(ctx, "우주의 온도", sci(T, 2) + " K", cd.px, cd.R, 62, LT.orange);
      KT.row(ctx, "빅뱅 이후 흐른 시간", timeStr(T), cd.px, cd.R, 90, LT.violet);
      KT.row(ctx, "중성자 : 양성자", st === 0 ? "아직 없음" : "1 : " + (1 / r).toFixed(1), cd.px, cd.R, 118, LT.green);
      lt(ctx, "원자핵의 질량비", cd.px, 150, { s: 12, c: LT.mute });
      ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(cd.px, 160, cd.w, 16, 8); ctx.fill();
      if (Y > 0) {
        ctx.save(); ctx.beginPath(); ctx.roundRect(cd.px, 160, cd.w, 16, 8); ctx.clip();
        ctx.fillStyle = "#ff8a6a"; ctx.fillRect(cd.px, 160, cd.w * (1 - Y), 16);
        ctx.fillStyle = "#845ef7"; ctx.fillRect(cd.px + cd.w * (1 - Y), 160, cd.w * Y, 16); ctx.restore();
        lt(ctx, "수소 " + ((1 - Y) * 100).toFixed(1) + "%", cd.px, 196, { s: 12.5, w: "900", c: "#d9480f" });
        lt(ctx, "헬륨 " + (Y * 100).toFixed(1) + "%", cd.R, 196, { s: 12.5, w: "900", a: "right", c: LT.violet });
        KT.tip(ctx, ((1 - Y) / Y).toFixed(2) + " : 1 — 증거물 ②와 일치", cd.px - 4, 206, cd.w + 8, true);
      } else {
        lt(ctx, "아직 헬륨이 없습니다", cd.px, 196, { s: 12.5, w: "800", c: LT.dim });
        KT.tip(ctx, st >= 1 ? "중성자가 조금씩 줄어드는 중" : "양성자·중성자도 아직 없음", cd.px - 4, 206, cd.w + 8, null);
      }
      tick(ctx, got.a, "헬륨이 만들어지는 순간", cd.px - 4, 262, cd.w + 8);
      tick(ctx, got.b, "빛이 풀려나는 순간", cd.px - 4, 300, cd.w + 8);
      lt(ctx, "온도 T ≈ 10¹⁰ K / √t", cd.px, 366, { s: 11.5, c: LT.mute });
      lt(ctx, "중성자 평균 수명 880초", cd.px, 388, { s: 11.5, c: LT.mute });
    }
    function draw() {
      render();
      var T = Math.pow(10, e), st = stage(T);
      $("a-bang-info").innerHTML = SDESC[st];
      check(T);
    }
    function check(T) {
      var ch = false;
      if (T <= TNUC && !got.a) { got.a = true; ch = true; }
      if (T <= TREC && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("bangGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-3a");
      if (got.b) done("m1-3b");
      if (got.a && got.b) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>빅뱅 뒤 약 <b>3분</b>에 수소 : 헬륨 ≈ <b>3 : 1</b>이 정해졌고, 약 <b>38만 년</b> 뒤 빛이 풀려나 우주 배경 복사가 되었습니다. 별이 태어나기도 전의 일입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("a-t").addEventListener("input", function (ev) { e = +ev.target.value; $("a-t-val").textContent = "n = " + e.toFixed(2); draw(); });
    pauser("a-bang-play", ast);
    KT.animate(canvas, function (dt) { if (ast.on) { tm += dt; render(); } });
    draw(); mission();
  })();

  /* ---------------------------------------------------------------------
     장면 4 — 질량수 5와 8의 벽
     --------------------------------------------------------------------- */
  (function () {
    var canvas = $("a-wall"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var A = 1, got = window.sthState("wallGot") || { a: false, b: false }, qOK = !!window.sthState("wallQ");
    var NUC = [null,
      { n: "¹H", nm: "양성자(수소 원자핵)", z: 1, k: 0, ba: 0, ok: true, w: "우주에서 가장 흔한 원자핵입니다. 핵합성은 여기서 출발합니다." },
      { n: "²H", nm: "중수소", z: 1, k: 1, ba: 1.112, ok: true, w: "핵합성의 첫 단추입니다. 결합이 약해서 뜨거운 광자에 쉽게 깨집니다." },
      { n: "³He", nm: "헬륨-3", z: 2, k: 1, ba: 2.573, ok: true, w: "헬륨-4로 가는 길목입니다." },
      { n: "⁴He", nm: "헬륨-4(알파 입자)", z: 2, k: 2, ba: 7.074, ok: true, w: "양성자 2 + 중성자 2가 <b>아주 단단히</b> 묶입니다. 그래서 중성자가 거의 모두 여기로 몰립니다." },
      { n: "⁵He · ⁵Li", nm: "질량수 5", z: 2, k: 3, ba: 0, ok: false, w: "🚧 <b>안정한 원자핵이 없습니다.</b> 만들어져도 약 10⁻²¹ 초 만에 부서져 원래대로 돌아갑니다." },
      { n: "⁶Li", nm: "리튬-6", z: 3, k: 3, ba: 5.332, ok: true, w: "안정하지만, 벽을 건너뛰어 여기까지 오기가 몹시 어렵습니다." },
      { n: "⁷Li", nm: "리튬-7", z: 3, k: 4, ba: 5.606, ok: true, w: "빅뱅 핵합성이 만들어 낸 <b>마지막 원소</b>입니다. 그나마 양이 아주 적습니다." },
      { n: "⁸Be", nm: "베릴륨-8", z: 4, k: 4, ba: 7.062, ok: false, w: "🚧 <b>안정한 원자핵이 없습니다.</b> ⁸Be는 약 10⁻¹⁶ 초 만에 헬륨 둘로 다시 쪼개집니다." },
      { n: "⁹Be", nm: "베릴륨-9", z: 4, k: 5, ba: 6.463, ok: true, w: "안정하지만 두 번째 벽 너머에 있습니다." },
      { n: "¹⁰B", nm: "붕소-10", z: 5, k: 5, ba: 6.475, ok: true, w: "안정합니다." },
      { n: "¹¹B", nm: "붕소-11", z: 5, k: 6, ba: 6.928, ok: true, w: "안정합니다." },
      { n: "¹²C", nm: "탄소-12", z: 6, k: 6, ba: 7.680, ok: true, w: "우리 몸의 뼈대가 되는 원소입니다. 별 속에서 헬륨 셋이 <b>거의 동시에</b> 부딪쳐야 만들어집니다(삼중 알파 반응)." }
    ];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var d2 = NUC[A], SW = 630, a, i;
      KT.studio(ctx, 0, 0, SW, H, { x: 330, y: 330, rx: 300, ry: 40 });
      KT.bigText(ctx, d2.n + (d2.ok ? "" : "  벽!"), 18, 46, 30, d2.ok ? "#ffffff" : "#ff8787");
      KT.bigText(ctx, d2.ok ? "핵자 하나당 " + d2.ba.toFixed(2) + " MeV" : "안정한 원자핵이 없다", 18, 76, 16, "#ffd35a");
      /* 핵합성 계단 — 칸 높이 = 핵자 하나당 결합 에너지. 5·8 칸은 계단이 빠져 있다 */
      var SWd = 38, DD = 76, HS = 13.5, WI = KT.iso({ ox: 170, oy: 122, s: 0.86, L: SWd * 12, D: DD });
      WI.box(ctx, -6, -6, -14, SWd * 12 + 6, DD + 6, 0, "#eef1f6", "#cfd6e1", "#aeb8c8");
      for (a = 1; a <= 12; a++) {
        var d = NUC[a], x0 = (a - 1) * SWd + 2, x1 = a * SWd - 2, sel = a === A;
        if (d.ok) {
          var hh = Math.max(3, d.ba * HS), col = sel ? "#339af0" : "#38c9a0";
          WI.box(ctx, x0, 4, 0, x1, DD - 4, hh, KT.tint(col, 1.25), KT.tint(col, 1), KT.tint(col, .7));
          var fp = WI.P((x0 + x1) / 2, DD - 4, hh * .5);
          if (hh > 26) KT.t(ctx, String(a), fp.x - 6, fp.y + 9, { s: 12, w: "900", a: "center", c: "#ffffff" });
          else KT.t(ctx, String(a), fp.x - 6, fp.y + 24, { s: 12, w: "900", a: "center", c: sel ? LT.blue : LT.mute });
        } else {
          /* 빠진 계단: 바닥에 뚫린 구멍 + 붉은 점선 유령 상자 */
          WI.plane(ctx, .5, "rgba(60,20,20,.55)", null, x0, x1, 4, DD - 4);
          var fp2 = WI.P((x0 + x1) / 2, DD - 4, 0);
          KT.t(ctx, String(a), fp2.x - 6, fp2.y + 22, { s: 12, w: "900", a: "center", c: "#e03131" });
        }
      }
      /* 빠진 칸 자리: 붉은 점선 유령 상자와 ✕ 를 맨 위에 덧그린다 */
      [5, 8].forEach(function (aw) {
        var x0 = (aw - 1) * SWd + 2, x1 = aw * SWd - 2, gh = 7.1 * HS, sel = aw === A;
        ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = sel ? "rgba(224,49,49,.95)" : "rgba(224,49,49,.6)"; ctx.lineWidth = sel ? 2.2 : 1.5;
        ctx.fillStyle = sel ? "rgba(255,135,135,.22)" : "rgba(255,135,135,.12)";
        var q = [WI.P(x0, DD - 4, 0), WI.P(x1, DD - 4, 0), WI.P(x1, 4, 0), WI.P(x1, 4, gh), WI.P(x0, 4, gh), WI.P(x0, DD - 4, gh), WI.P(x1, DD - 4, gh)];
        ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y); ctx.lineTo(q[5].x, q[5].y); ctx.lineTo(q[4].x, q[4].y); ctx.lineTo(q[3].x, q[3].y); ctx.lineTo(q[2].x, q[2].y); ctx.lineTo(q[1].x, q[1].y); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y); ctx.lineTo(q[5].x, q[5].y); ctx.lineTo(q[6].x, q[6].y); ctx.lineTo(q[1].x, q[1].y);
        ctx.moveTo(q[6].x, q[6].y); ctx.lineTo(q[3].x, q[3].y); ctx.lineTo(q[2].x, q[2].y); ctx.moveTo(q[3].x, q[3].y); ctx.lineTo(q[4].x, q[4].y); ctx.lineTo(q[5].x, q[5].y); ctx.stroke(); ctx.restore();
        var mp = WI.P((x0 + x1) / 2, DD - 4, gh * .5);
        KT.t(ctx, "✕", mp.x, mp.y + 8, { s: 22, w: "900", a: "center", c: "#e03131" });
        var tp = WI.P((x0 + x1) / 2, DD / 2, gh);
        if (aw !== A) KT.pill(ctx, "벽", tp.x, tp.y - 10, { a: "center", s: 12, c: "#ffc9c9" });
      });
      /* 고른 칸 위의 원자핵 미니어처(양성자·중성자 공) */
      var tot = d2.z + d2.k, cols = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(tot)))), rows = Math.ceil(tot / cols);
      var tps = [], pz = d2.z, nk = d2.k;
      while (pz > 0 || nk > 0) { if (pz > 0) { tps.push(1); pz--; } if (nk > 0) { tps.push(0); nk--; } }
      var topZ = d2.ok ? Math.max(3, d2.ba * HS) : 7.1 * HS, cp = WI.P((A - .5) * SWd, DD / 2, topZ), sp = d2.ok ? 15 : 24, rN = 9.5;
      var cyN = cp.y - 12 - (rows - 1) * sp / 2;
      if (!d2.ok) {
        ctx.save(); ctx.strokeStyle = "#e03131"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cp.x, cyN, 40, 0, 6.2832); ctx.stroke(); ctx.restore();
      } else {
        ctx.fillStyle = "rgba(20,30,50,.25)"; ctx.beginPath(); ctx.ellipse(cp.x + 3, cp.y, 22, 6, 0, 0, 6.2832); ctx.fill();
      }
      for (i = 0; i < tot; i++) {
        var cc = i % cols, rr = Math.floor(i / cols);
        var xx = cp.x - (cols - 1) * sp / 2 + cc * sp + (rr % 2 ? 4 : 0), yy2 = cyN - (rows - 1) * sp / 2 + rr * sp;
        if (tps[i]) proton(ctx, xx, yy2, rN); else neutron(ctx, xx, yy2, rN);
      }
      KT.pill(ctx, d2.ok ? d2.n : "약 " + (A === 5 ? "10⁻²¹" : "10⁻¹⁶") + " 초 만에 부서짐", cp.x, cyN - (rows - 1) * sp / 2 - (d2.ok ? 22 : 48), { a: "center", s: 12, c: d2.ok ? "#a5d8ff" : "#ffc9c9", box: [10, SW - 10] });
      proton(ctx, 26, 314, 7); lt(ctx, "양성자", 38, 319, { s: 12, c: LT.ink });
      neutron(ctx, 106, 314, 7); lt(ctx, "중성자", 118, 319, { s: 12, c: LT.ink });
      lt(ctx, "계단 높이 = 핵자 하나당", 20, 344, { s: 12, c: LT.mute });
      lt(ctx, "결합 에너지", 20, 362, { s: 12, c: LT.mute });
      lt(ctx, "질량수 A →", 520, 356, { s: 12, c: LT.mute });
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 642, W, H, "고른 원자핵");
      lt(ctx, d2.n, cd.px, 64, { s: 24, w: "900", c: d2.ok ? LT.ink : LT.red });
      lt(ctx, d2.nm, cd.px, 88, { s: 12.5, w: "800", c: LT.mute });
      KT.row(ctx, "양성자", d2.z + " 개", cd.px, cd.R, 122, "#d9480f");
      KT.row(ctx, "중성자", d2.k + " 개", cd.px, cd.R, 148, "#495057");
      KT.row(ctx, "결합 에너지", d2.ok ? d2.ba.toFixed(3) + " MeV" : "—", cd.px, cd.R, 174, d2.ok ? LT.green : LT.red);
      KT.tip(ctx, d2.ok ? "안정 — 다음 칸으로 올라갈 수 있음" : "안정한 원자핵 없음 — 길이 끊김", cd.px - 4, 192, cd.w + 8, d2.ok);
      tick(ctx, got.a, "첫 번째 벽", cd.px - 4, 246, cd.w + 8);
      tick(ctx, got.b, "두 번째 벽", cd.px - 4, 284, cd.w + 8);
      lt(ctx, "빅뱅 핵합성은 한 칸씩 올라갑니다.", cd.px, 346, { s: 11, c: LT.mute });
      lt(ctx, "벽을 만나면 더 못 갑니다.", cd.px, 366, { s: 11, c: LT.mute });
      $("a-wall-info").innerHTML = "<b>" + d2.n + "</b> (" + d2.nm + ") — " + d2.w;
    }
    function check() {
      var ch = false;
      if (A === 5 && !got.a) { got.a = true; ch = true; }
      if (A === 8 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("wallGot", got); }
      mission();
    }
    function mission() {
      if (got.a) done("m1-4a");
      if (got.b) done("m1-4b");
      if (qOK) done("m1-4c");
      if (got.a && got.b && qOK) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>질량수 <b>5와 8</b>에 안정한 원자핵이 없어, 한 칸씩 올라가던 핵합성이 헬륨에서 사실상 멈췄습니다. 우주에 탄소가 생기려면 별이 태어날 때까지 기다려야 했습니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("a-A").addEventListener("input", function (ev) { A = +ev.target.value; $("a-A-val").textContent = "A = " + A; draw(); check(); });
    window.sthPick({
      mount: "s1-q",
      q: "빅뱅 핵합성이 리튬에서 멈춘 까닭으로 가장 알맞은 것은?",
      options: [
        "양성자가 모자랐기 때문",
        "질량수 5와 8에 안정한 원자핵이 없는데, 벽을 건너뛸 만한 시간이 3분밖에 없었기 때문",
        "리튬보다 무거운 원소는 원래 만들어질 수 없기 때문",
        "중력이 약해 원자핵이 뭉치지 못했기 때문"
      ],
      answer: 1,
      why: [
        "양성자는 넘쳐났습니다. 실제로 지금도 우주의 4분의 3이 수소입니다.",
        "한 칸씩 올라가는 길이 두 곳에서 끊겨 있었고, 우주는 그 사이 이미 너무 차갑고 성글어졌습니다. 벽을 건너뛰려면 별 속처럼 <b>오래</b> 뜨거워야 합니다.",
        "탄소·철·금은 모두 나중에 별에서 만들어졌습니다.",
        "빅뱅 핵합성은 중력이 아니라 온도와 시간의 문제였습니다."
      ],
      onDone: function () { qOK = true; window.sthState("wallQ", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 */
  function finish() { window.sthState("r1", "해결 · 수소 : 헬륨 ≈ 3 : 1은 빅뱅 뒤 3분에 정해졌다"); }
  function showEnd(i) {
    if (i !== 4) return;
    var p = window.sthState("solarspec") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 이제 그 흡수선으로 우주의 나이까지 읽어 냈습니다."
        : "무지개처럼 보이지만, 정밀하게 펼치면 <b>수백 개의 검은 흡수선</b>이 있습니다. 바로 그 선들이 이 사건의 열쇠였습니다.");
    ep.clear(4);
  }
  ep.onShow(showEnd);
  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅱ-1] 이야기 ① 우주가 남긴 지문",
    items: [
      { id: "w1", label: "스펙트럼으로 알아내는 것", hint: "별빛의 스펙트럼에서 흡수선의 위치를 보고 무엇을 알 수 있는지, 왜 알 수 있는지 쓰세요." },
      { id: "a2", label: "우주 어디서나 수소 : 헬륨 = 3 : 1 인 까닭", hint: "‘별이 만든 것이 아니라 …’로 시작해, 빅뱅 뒤 3분 동안 무슨 일이 있었는지 온도와 시간을 넣어 쓰세요." }
    ]
  });
  if (ep.at() === 4) showEnd(4);
})();

/* =========================================================================
   이야기 ② 별의 부엌
   중심 온도는 실제 계산값 몇 개를 로그-로그로 이어 붙인 단순화 모형이다.
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "조사관의 첫 추리",
    question: "빅뱅은 수소·헬륨만 남기고 끝났습니다. 그렇다면 내 몸의 탄소와 반지의 금은 어디서 만들어졌을까요?",
    options: ["㉠ 빅뱅 때 한꺼번에 다 만들어졌다", "㉡ 지구가 만들어질 때 지구 안에서 만들어졌다", "㉢ 별의 속과 별의 최후에서 만들어졌다", "㉣ 원소는 원래부터 그냥 있었다"],
    onPick: function () { ep.clear(0); }
  });

  /* ------------------------------------------------------ 장면 2 — 별의 부엌 */
  (function () {
    var canvas = $("b-star"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var M = 1.0, got = window.sthState("starGot") || { a: false, b: false, c: false };
    var ANCH = [[0.08, 1.0e7], [0.5, 1.0e8], [1, 1.5e8], [2, 2.2e8], [8, 6.0e8], [9, 1.6e9], [10, 3.0e9], [30, 5.0e9]];
    var STEPS = [
      { t: 1.0e7, a: "수소 → 헬륨", e: ["H", "He"] },
      { t: 1.0e8, a: "헬륨 → 탄소 · 산소", e: ["C", "O"] },
      { t: 6.0e8, a: "탄소 → 네온 · 마그네슘", e: ["Ne", "Mg"] },
      { t: 1.5e9, a: "네온 · 산소 → 규소 · 황", e: ["Si", "S"] },
      { t: 2.7e9, a: "규소 → 철", e: ["Fe"] }
    ];
    function coreT(m) {
      if (m <= ANCH[0][0]) return ANCH[0][1];
      for (var i = 1; i < ANCH.length; i++) {
        if (m <= ANCH[i][0]) {
          var a = ANCH[i - 1], b = ANCH[i];
          var f = (log10(m) - log10(a[0])) / (log10(b[0]) - log10(a[0]));
          return Math.pow(10, log10(a[1]) + f * (log10(b[1]) - log10(a[1])));
        }
      }
      return ANCH[ANCH.length - 1][1];
    }
    function reached(m) { var T = coreT(m), k = 0; for (var i = 0; i < STEPS.length; i++) if (T >= STEPS[i].t) k = i + 1; return k; }
    function life(m) { return 10 * Math.pow(m, -2.5); }
    function lifeStr(m) {
      var g = life(m);                                  /* 단위: Gyr(10억 년) */
      if (g >= 1000) return (g / 1000).toFixed(1) + " 조 년";
      if (g >= 1) return (g * 10).toFixed(1) + " 억 년";
      return Math.round(g * 1000) + " 백만 년";
    }
    function fate(m) {
      if (m < 0.5) return "적색왜성 — 우주 나이보다 수명이 길어 아직 하나도 죽지 않았습니다";
      if (m < 8) return "적색거성 → 행성상 성운 → 백색왜성";
      if (m < 25) return "초신성 폭발 → 중성자별";
      return "초신성 폭발 → 블랙홀";
    }
    function els(k) { var o = []; for (var i = 0; i < k; i++) o = o.concat(STEPS[i].e); return o; }

    /* 질량에 따른 별빛 색 (작으면 붉고, 크면 푸르다) */
    function starCol(m) {
      if (m < 0.8) return ["#ffd2a8", "#ff8a4a", "#a8341a"];
      if (m < 1.5) return ["#fffbe8", "#ffd25a", "#c9761a"];
      if (m < 8) return ["#ffffff", "#dfe8ff", "#7d9cff"];
      return ["#ffffff", "#b9d4ff", "#4a76ff"];
    }
    var LAYER = ["#ff9a7a", "#ffd36b", "#7ff0c4", "#7fd3ff", "#b69cff"];
    var NAME = ["He", "C · O", "Ne · Mg", "Si · S", "Fe"];

    /* ── 위: 우주 진열장 속 '잘라 낸 별' (생애 마지막 무렵의 층 구조) ── */
    var DH = 412, I = KT.iso({ ox: 400, oy: 192, s: 0.62, L: 300, D: 300 }), L = I.L, D = I.D, ZT = 250, ZC = 125;
    var BOX = [0, W], ph = 0, fx = { on: !REDUCE };
    var SKY = (function () { var R = KT.rng(91), a = [], i; for (i = 0; i < 70; i++) a.push([R(), R(), R()]); return a; })();
    var GRAN = (function () { var R = KT.rng(57), a = [], i; for (i = 0; i < 90; i++) a.push([R(), R(), R()]); return a; })();
    function P(x, y, z) { return I.P(x, y, z); }
    function poly(pts, fill, stroke, lw) {
      ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }
    function seg(a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    function cabinet() {
      KT.studio(ctx, 0, 0, W, DH, { x: P(L, D, 0).x, y: P(L, D, -16).y - 4, rx: 250, ry: 34 });
      I.box(ctx, -8, -8, -16, L + 8, D + 8, 0, "#2b303c", "#1b1f28", "#12151c");
      var g1 = ctx.createLinearGradient(0, P(0, 0, ZT).y, 0, P(0, D, 0).y); g1.addColorStop(0, "#070a1c"); g1.addColorStop(1, "#141a3a");
      poly([P(0, 0, 0), P(0, D, 0), P(0, D, ZT), P(0, 0, ZT)], g1);
      poly([P(0, 0, 0), P(L, 0, 0), P(L, 0, ZT), P(0, 0, ZT)], g1);
      SKY.forEach(function (s, i) {
        var p = i % 2 ? P(0, s[0] * D, s[1] * ZT) : P(s[0] * L, 0, s[1] * ZT), z = s[2] > .8 ? 2 : 1.3;
        ctx.fillStyle = "rgba(230,236,255," + (0.35 + s[2] * 0.55).toFixed(2) + ")"; ctx.fillRect(p.x, p.y, z, z);
      });
      poly([P(0, 0, 0), P(L, 0, 0), P(L, D, 0), P(0, D, 0)], "#0d1230");
      ctx.strokeStyle = "rgba(140,160,255,.13)"; ctx.lineWidth = 1;
      for (var q = 30; q < L; q += 30) { seg(P(q, 0, 0), P(q, D, 0)); seg(P(0, q, 0), P(L, q, 0)); }
    }
    function glassFront() {
      poly([P(0, D, 0), P(L, D, 0), P(L, D, ZT), P(0, D, ZT)], "rgba(200,225,255,.06)");
      poly([P(L, 0, 0), P(L, D, 0), P(L, D, ZT), P(L, 0, ZT)], "rgba(190,215,255,.10)");
      poly([P(0, 0, ZT), P(L, 0, ZT), P(L, D, ZT), P(0, D, ZT)], "rgba(225,238,255,.05)");
      ctx.save(); poly([P(0, D, 0), P(L, D, 0), P(L, D, ZT), P(0, D, ZT)]); ctx.clip();
      var q = P(L * .15, D, ZT), r = P(L * .4, D, 0), gg = ctx.createLinearGradient(q.x, q.y, r.x + 60, r.y);
      gg.addColorStop(0, "rgba(255,255,255,0)"); gg.addColorStop(.45, "rgba(255,255,255,.10)"); gg.addColorStop(.55, "rgba(255,255,255,0)");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, DH); ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1; seg(P(0, 0, 0), P(0, 0, ZT));
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.3;
      [[P(0, D, 0), P(0, D, ZT)], [P(L, D, 0), P(L, D, ZT)], [P(L, 0, 0), P(L, 0, ZT)],
       [P(0, 0, ZT), P(L, 0, ZT)], [P(L, 0, ZT), P(L, D, ZT)], [P(L, D, ZT), P(0, D, ZT)], [P(0, D, ZT), P(0, 0, ZT)],
       [P(0, D, 0), P(L, D, 0)], [P(L, D, 0), P(L, 0, 0)]].forEach(function (e) { seg(e[0], e[1]); });
    }
    /* 층의 반지름: rad[0] = 가장 바깥 생성물 층(He) … rad[k-1] = 중심핵 */
    function radii(R, k) {
      var rc = k === 1 ? R * 0.3 : R * 0.17, out = [], j;
      for (j = 0; j < k; j++) out.push(k === 1 ? rc : rc + (R * 0.76 - rc) * (k - 1 - j) / (k - 1));
      return out;
    }
    function sector(cx, cy, r0, r1, a0, a1, fill) {
      ctx.beginPath(); ctx.arc(cx, cy, r1, a0, a1); if (r0 > 0) ctx.arc(cx, cy, r0, a1, a0, true); else ctx.lineTo(cx, cy); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
    }
    /* 잘라 낸 별: 오른쪽 위 4분의 1을 들어내 층을 보인다. 돌려준 값 = 층마다 이름표를 붙일 점 */
    function cutStar(cx, cy, R, k, sc) {
      var A0 = -Math.PI / 2, A1 = 0, AM = -Math.PI / 4, rad = radii(R, k), pts = [], j;
      var halo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.55);
      halo.addColorStop(0, sc[1]); halo.addColorStop(0.3, "rgba(255,210,150,.22)"); halo.addColorStop(1, "rgba(255,210,150,0)");
      ctx.globalAlpha = 0.6; ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.55, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
      /* 겉면(잘라 낸 부분 빼고) + 쌀알 무늬 */
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, A1, A0 + 2 * Math.PI); ctx.lineTo(cx, cy); ctx.closePath(); ctx.clip();
      var disk = ctx.createRadialGradient(cx - R * 0.3, cy + R * 0.1, R * 0.1, cx, cy, R);
      disk.addColorStop(0, sc[0]); disk.addColorStop(0.65, sc[1]); disk.addColorStop(1, sc[2]);
      ctx.fillStyle = disk; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      GRAN.forEach(function (g, i) {
        var a = g[0] * 6.2832, rr = Math.sqrt(g[1]) * R * 0.95, x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
        var al = 0.05 + 0.07 * (0.5 + 0.5 * Math.sin(ph * 1.4 + i));
        ctx.fillStyle = (i % 2 ? "rgba(255,255,255," : "rgba(120,40,10,") + al.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(x, y, 1.2 + g[2] * R * 0.03, 0, 6.2832); ctx.fill();
      });
      ctx.restore();
      /* 잘린 면: 겉층 → 생성물 층 → 중심핵 */
      sector(cx, cy, rad[0], R, A0, A1, KT.tint(sc[2], 0.75));
      var env = ctx.createRadialGradient(cx, cy, rad[0], cx, cy, R); env.addColorStop(0, "rgba(255,150,80,.85)"); env.addColorStop(1, "rgba(255,214,150,.55)");
      sector(cx, cy, rad[0], R, A0, A1, env);
      pts.push({ x: cx + (rad[0] + R) / 2 * Math.cos(AM - 0.25), y: cy + (rad[0] + R) / 2 * Math.sin(AM - 0.25), t: "H · 수소 겉층", c: "#ffd2a8" });
      for (j = 0; j < k; j++) {
        var r1 = rad[j], r0 = j < k - 1 ? rad[j + 1] : 0, core = j === k - 1, fe = core && k >= 5;
        var col = fe ? "#8d929c" : LAYER[j];
        var gr = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1); gr.addColorStop(0, KT.tint(col, 1.08)); gr.addColorStop(1, KT.tint(col, 0.78));
        sector(cx, cy, r0, r1, A0, A1, gr);
        var rm = core ? r1 * 0.5 : (r0 + r1) / 2, am = AM + (j % 2 ? 0.22 : -0.22);
        pts.push({ x: cx + rm * Math.cos(am), y: cy + rm * Math.sin(am), c: fe ? "#d6d9e0" : col,
          t: core ? (k === 1 ? "중심핵 · 수소가 타며 He가 쌓임" : fe ? "중심핵 · Fe (더는 타지 않음)" : "중심핵 · " + NAME[j]) : NAME[j] + " 층" });
      }
      /* 오른쪽 반을 살짝 어둡게 — 두 잘린 면이 접힌 것처럼 */
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, AM, A1); ctx.closePath(); ctx.fillStyle = "rgba(10,10,30,.18)"; ctx.fill(); ctx.restore();
      /* 층 경계: 껍질에서 타는 불(은은하게 깜빡) */
      for (j = 0; j < k; j++) {
        if (j === k - 1 && k >= 5) break;
        var al = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(ph * 2.6 + j * 1.3));
        ctx.save(); ctx.shadowColor = "#fff2c0"; ctx.shadowBlur = 8; ctx.strokeStyle = "rgba(255,246,210," + al.toFixed(2) + ")"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(cx, cy, rad[j], A0, A1); ctx.stroke(); ctx.restore();
      }
      /* 중심핵: 철이면 어두운 쇳덩이, 아니면 타는 불씨 */
      var rc = rad[k - 1];
      if (k >= 5) KT.planet(ctx, cx, cy, Math.max(4, rc * 0.55), "#c9ccd2", "#4a4e57");
      else KT.glow(ctx, cx, cy, Math.max(3, rc * (0.32 + 0.05 * Math.sin(ph * 3))), "rgba(255,245,215,.95)", 2.2);
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      return pts;
    }
    function paint() {
      var T = coreT(M), k = reached(M), sc = starCol(M);
      ctx.clearRect(0, 0, W, H);
      cabinet();
      var c = P(L / 2, D / 2, ZC), R = 52 + 58 * Math.pow(M / 30, 0.33), fl = P(L / 2, D / 2, 0);
      var pool = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, R * 1.4); pool.addColorStop(0, "rgba(255,190,120,.35)"); pool.addColorStop(1, "rgba(255,190,120,0)");
      ctx.save(); ctx.translate(fl.x, fl.y); ctx.scale(1, .5); ctx.translate(-fl.x, -fl.y); ctx.fillStyle = pool; ctx.beginPath(); ctx.arc(fl.x, fl.y, R * 1.4, 0, 6.2832); ctx.fill(); ctx.restore();
      var pts = cutStar(c.x, c.y, R, k, sc);
      glassFront();
      /* 층 이름표: 오른쪽에 바깥층부터 차례로 */
      pts.forEach(function (p, i) {
        var ly = 122 + i * 36;
        KT.line(ctx, { x: p.x, y: p.y }, { x: 592, y: ly - 4 }, "rgba(20,25,40,.75)", 1.1);
        ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 6.2832); ctx.fill();
        KT.pill(ctx, p.t, 598, ly, { s: 12, c: p.c, box: BOX });
      });
      KT.pill(ctx, "생애 마지막 무렵에 잘라 본 별의 속", 22, 392, { s: 11.5, c: "#e8ecff", box: BOX });
      var h1, h2;
      if (k === 1) { h1 = "헬륨에 불이 붙지 않는다"; h2 = M.toFixed(1) + " M☉ · 수소만 태우는 작은 부엌"; }
      else if (k === 2) { h1 = "탄소·산소에서 멈춘 부엌"; h2 = M.toFixed(1) + " M☉ · 탄소에 불을 붙일 열이 모자란다"; }
      else if (k < 5) { h1 = "탄소에 불이 붙었다"; h2 = M.toFixed(1) + " M☉ · 양파 껍질처럼 층층이 탄다"; }
      else { h1 = "철까지 태운 부엌"; h2 = M.toFixed(1) + " M☉ · 철이 쌓이면 더 버티지 못한다"; }
      KT.bigText(ctx, h1, 22, 50, 28, "#ffffff"); KT.bigText(ctx, h2, 22, 82, 16, "#ffd36b");
      KT.warn(ctx, W - 14, 28, "⚠ 별 크기·층 두께는 실제 비율이 아님", "right");
      /* ── 아래: 흰 판정 카드 ── */
      var y0 = DH + 8, cw = W;
      KT.card(ctx, 0, y0, cw, H - y0, "일생 동안 중심이 오르는 최고 온도");
      lt(ctx, sci(T, 2) + " K", 18, y0 + 62, { s: 26, w: "900", c: LT.red });
      KT.row(ctx, "주계열 수명", lifeStr(M), 300, 600, y0 + 28, LT.violet);
      lt(ctx, "최후: " + fate(M), 300, y0 + 56, { s: 12, w: "800", c: LT.mute });
      for (var i = 0; i < 5; i++) {
        var bx = 18 + i * 174, by = y0 + 78, on = i < k, LC = ["#ff8a6a", "#f59f00", "#20c997", "#339af0", "#845ef7"][i];
        ctx.fillStyle = on ? KT.tint(LC, 1.0) : "#e9edf3"; ctx.beginPath(); ctx.roundRect(bx, by, 166, 48, 12); ctx.fill();
        if (on) { var sh2 = ctx.createLinearGradient(0, by, 0, by + 48); sh2.addColorStop(0, "rgba(255,255,255,.35)"); sh2.addColorStop(1, "rgba(0,0,0,.08)"); ctx.fillStyle = sh2; ctx.beginPath(); ctx.roundRect(bx, by, 166, 48, 12); ctx.fill(); }
        lt(ctx, (on ? "✅ " : "⬜ ") + STEPS[i].a, bx + 10, by + 20, { s: 11.5, w: "900", c: on ? "#ffffff" : LT.dim });
        lt(ctx, "점화 " + sci(STEPS[i].t, 1) + " K", bx + 10, by + 39, { s: 11, w: "700", c: on ? "rgba(255,255,255,.92)" : LT.dim });
      }
      var made = els(k);
      lt(ctx, "이 별이 만들어 내는 원소", 18, y0 + 152, { s: 12, w: "800", c: LT.mute });
      for (var j = 0; j < made.length; j++) {
        var ex = 196 + j * 46;
        KT.planet(ctx, ex, y0 + 147, 17, "#b197fc", "#5f3dc4");
        lt(ctx, made[j], ex, y0 + 152, { s: 12.5, w: "900", a: "center", c: "#ffffff" });
      }
      if (k >= 5) lt(ctx, "+ 더 무거운 원소는 초신성·충돌에서", 600, y0 + 152, { s: 11.5, w: "800", c: LT.red });
    }
    function draw() {
      var T = coreT(M), k = reached(M);
      paint();
      $("b-star-info").innerHTML = "질량 <b>" + M.toFixed(1) + " M☉</b> · 일생 동안 중심이 오르는 최고 온도 <b>" + sci(T, 2) + " K</b> · 주계열 수명 <b>" + lifeStr(M) + "</b> (t ≈ 100억 년 × M<sup>−2.5</sup>)<br>" +
        "<small>지금 태양의 중심은 약 1.5×10⁷ K입니다. 수소를 다 태우면 중심이 수축하며 더 뜨거워져, 그다음 원소를 태울 온도에 이릅니다.</small><br>" +
        (k === 1 ? "중심이 1억 K에 이르지 못해 <b>헬륨에 불을 붙이지 못합니다</b>. 수소를 다 태우면 그대로 식어 갑니다."
        : k === 2 ? "태양처럼 <b>탄소·산소까지</b> 만들고 끝납니다. 바깥층을 행성상 성운으로 날려 보내고 백색왜성만 남깁니다."
        : k === 5 ? "중심이 27억 K를 넘어 규소까지 태워 <b>철</b>을 만듭니다. 철이 쌓이면 더는 버티지 못하고 <b>초신성</b>으로 폭발합니다."
        : "탄소에 불이 붙었습니다. 양파 껍질처럼 층층이 다른 원소를 태우며 중심으로 갈수록 무거운 원소가 쌓입니다.");
    }
    function check() {
      var k = reached(M), ch = false;
      if (k === 1 && !got.a) { got.a = true; ch = true; }
      if (k === 2 && M >= 7.5 && !got.b) { got.b = true; ch = true; }
      if (k === 5 && M <= 10.5 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("starGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.c) done("m2-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>질량이 부엌의 불 세기를 정합니다. <b>0.5 M☉</b> 밑이면 헬륨도 못 태우고, <b>8 M☉</b>을 넘어야 탄소에 불이 붙으며, <b>10 M☉</b> 쯤 되어야 철까지 갑니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("b-m").addEventListener("input", function (e) { M = +e.target.value; $("b-m-val").textContent = M.toFixed(1) + " M☉"; draw(); check(); });
    pauser("b-star-play", fx);
    KT.animate(canvas, function (dt) { if (fx.on) { ph += dt / 1000; paint(); } }, 24);
    draw(); mission();
  })();

  /* ------------------------------------------- 장면 3 — 결합 에너지 곡선 */
  (function () {
    var canvas = $("b-bind"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var A = 1, got = !!window.sthState("bindGot"), qOK = !!window.sthState("bindQ");
    var BE = [[1, 0], [2, 1.112], [3, 2.827], [4, 7.074], [6, 5.332], [7, 5.606], [9, 6.463], [12, 7.680], [16, 7.976],
              [20, 8.032], [24, 8.261], [28, 8.448], [40, 8.551], [56, 8.790], [84, 8.717], [107, 8.554], [132, 8.428],
              [144, 8.288], [184, 8.065], [208, 7.867], [238, 7.570]];
    var NAME = { 1: "수소(양성자)", 2: "중수소", 4: "헬륨-4", 7: "리튬-7", 12: "탄소-12", 16: "산소-16", 20: "네온-20",
                 24: "마그네슘-24", 28: "규소-28", 40: "칼슘-40", 56: "철-56", 84: "크립톤-84", 107: "은-107",
                 197: "금-197", 208: "납-208", 238: "우라늄-238" };
    function ba(a) {
      if (a <= BE[0][0]) return BE[0][1];
      for (var i = 1; i < BE.length; i++) if (a <= BE[i][0]) return lerp(BE[i - 1][1], BE[i][1], (a - BE[i - 1][0]) / (BE[i][0] - BE[i - 1][0]));
      return BE[BE.length - 1][1];
    }
    var X0 = 70, X1 = 850, Y0 = 56, Y1 = 250, MX = 9.2;
    function gx(a) { return X0 + a / 238 * (X1 - X0); }
    function gy(b) { return Y1 - b / MX * (Y1 - Y0); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var SW = 630, b = ba(A), a;
      KT.studio(ctx, 0, 0, SW, H, { x: 330, y: 340, rx: 290, ry: 30 });
      KT.bigText(ctx, "A = " + A + (NAME[A] ? "  " + NAME[A] : ""), 18, 46, 28, "#ffffff");
      KT.bigText(ctx, "핵자 하나당 " + b.toFixed(2) + " MeV", 18, 76, 17, "#ffd35a");
      /* 결합 에너지 산 — 앞면 윗선 = 핵자 하나당 결합 에너지. 뒤로 밀어 낸 입체 블록, 꼭대기는 철-56 */
      var BX0 = 44, BX1 = 520, BY = 326, ZS = 22, DX = 66, DY = -38;
      function bx(q) { return BX0 + (q - 1) / 237 * (BX1 - BX0); }
      function bz(q) { return Math.max(3, ba(q) * ZS); }
      var qs = []; for (a = 1; a <= 238; a += (a < 20 ? 1 : 3)) qs.push(a); if (qs[qs.length - 1] !== 238) qs.push(238);
      /* 윗면 띠 */
      for (var k = 0; k < qs.length - 1; k++) {
        var q0 = qs[k], q1 = qs[k + 1], x0 = bx(q0), x1 = bx(q1), y0 = BY - bz(q0), y1 = BY - bz(q1);
        var slope = (y1 - y0) / Math.max(1, x1 - x0), lit = clamp(1.08 + slope * .5, .82, 1.2);
        var base = q0 < 56 ? "#63e6be" : "#b197fc";
        ctx.fillStyle = KT.tint(base, lit); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x1 + DX, y1 + DY); ctx.lineTo(x0 + DX, y0 + DY); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = .8; ctx.stroke();
      }
      /* 오른쪽 끝 단면 */
      var xe = bx(238), ze = bz(238);
      ctx.fillStyle = "#5f3dc4"; ctx.beginPath(); ctx.moveTo(xe, BY); ctx.lineTo(xe, BY - ze); ctx.lineTo(xe + DX, BY - ze + DY); ctx.lineTo(xe + DX, BY + DY); ctx.closePath(); ctx.fill();
      /* 앞면 */
      ctx.save(); ctx.beginPath(); ctx.moveTo(bx(1), BY);
      qs.forEach(function (q) { ctx.lineTo(bx(q), BY - bz(q)); }); ctx.lineTo(xe, BY); ctx.closePath(); ctx.clip();
      var fg = ctx.createLinearGradient(BX0, 0, BX1, 0), fFe = (bx(56) - BX0) / (BX1 - BX0);
      fg.addColorStop(0, "#20c997"); fg.addColorStop(fFe, "#0ca678"); fg.addColorStop(fFe + .002, "#845ef7"); fg.addColorStop(1, "#6741d9");
      ctx.fillStyle = fg; ctx.fillRect(BX0, BY - 220, BX1 - BX0, 222);
      var sh2 = ctx.createLinearGradient(0, BY - 200, 0, BY); sh2.addColorStop(0, "rgba(255,255,255,.12)"); sh2.addColorStop(1, "rgba(0,0,30,.18)");
      ctx.fillStyle = sh2; ctx.fillRect(BX0, BY - 220, BX1 - BX0, 222);
      ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 1;
      for (var mv = 2; mv <= 8; mv += 2) { ctx.beginPath(); ctx.moveTo(BX0, BY - mv * ZS); ctx.lineTo(BX1, BY - mv * ZS); ctx.stroke(); }
      ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(255,230,140,.95)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx(56), BY); ctx.lineTo(bx(56), BY - bz(56)); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.6; ctx.beginPath(); qs.forEach(function (q, i2) { if (i2) ctx.lineTo(bx(q), BY - bz(q)); else ctx.moveTo(bx(q), BY - bz(q)); }); ctx.stroke();
      for (var mv2 = 2; mv2 <= 8; mv2 += 2) lt(ctx, mv2 + "", BX0 - 6, BY - mv2 * ZS + 4, { s: 12, a: "right", c: LT.mute });
      lt(ctx, "MeV", BX0 + 2, BY - 9 * ZS - 8, { s: 12, a: "right", c: LT.mute });
      /* 앞 모서리 눈금(질량수) */
      [1, 56, 120, 180].forEach(function (q) { lt(ctx, String(q), bx(q), BY + 18, { s: 12, w: "800", a: "center", c: LT.mute }); });
      lt(ctx, "질량수 A →", BX1 + DX, BY + 18, { s: 12, w: "800", a: "right", c: LT.mute });
      /* 철 꼭대기 깃발 */
      var fx = bx(56) + DX * .5, fy = BY - bz(56) + DY * .5;
      ctx.strokeStyle = "#495057"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 36); ctx.stroke();
      ctx.fillStyle = "#f59f00"; ctx.beginPath(); ctx.moveTo(fx, fy - 36); ctx.lineTo(fx + 18, fy - 30); ctx.lineTo(fx, fy - 24); ctx.closePath(); ctx.fill();
      KT.pill(ctx, "철-56 꼭대기", fx + 22, fy - 28, { s: 12, c: "#ffe08a" });
      /* 비탈 이름표 */
      KT.pill(ctx, "↗ 가벼운 핵: 융합하면 에너지", bx(4) + 4, BY - 10, { s: 12, c: "#c3fae8" });
      KT.pill(ctx, "분열하면 에너지 ↖", bx(238) - 8, BY - 10, { s: 12, a: "right", c: "#e5dbff" });
      /* 이름난 원자핵 점 + 지금 고른 원자핵 공 */
      [4, 12, 16, 238].forEach(function (a2) { KT.planet(ctx, bx(a2) + DX * .5, BY - bz(a2) + DY * .5 - 3, 4, "#ffffff", "#495057"); });
      var px2 = bx(A) + DX * .5, py2 = BY - bz(A) + DY * .5;
      ctx.fillStyle = "rgba(20,30,50,.3)"; ctx.beginPath(); ctx.ellipse(px2 + 2, py2, 13, 4, 0, 0, 6.2832); ctx.fill();
      KT.planet(ctx, px2, py2 - 12, 12, "#ffb35c", "#a4410c");
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px2, py2 - 12, 16, 0, 6.2832); ctx.stroke();
      lt(ctx, "윗면이 높을수록 핵자가 단단히 묶인 원자핵", 18, 366, { s: 12, c: LT.mute });
      /* 오른쪽 판정 카드 + 원자핵 미니어처 */
      var cd = sideCard(ctx, 642, W, H, "판정");
      var side = A < 50 ? "융합 쪽" : (A <= 62 ? "꼭대기" : "분열 쪽");
      lt(ctx, side, cd.px, 64, { s: 24, w: "900", c: A < 50 ? LT.green : (A <= 62 ? LT.yellow : LT.violet) });
      KT.row(ctx, "질량수", A + "", cd.px, cd.R, 98);
      KT.row(ctx, "핵자당 결합 에너지", b.toFixed(3) + " MeV", cd.px, cd.R, 124, LT.orange);
      KT.row(ctx, "총 결합 에너지", (b * A).toFixed(0) + " MeV", cd.px, cd.R, 150);
      tick(ctx, got, "곡선의 꼭대기 찾기", cd.px - 4, 168, cd.w + 8);
      /* 원자핵: 핵자 공을 둥글게 쌓은 모형 (많으면 일부만) */
      var nb = Math.min(A, 61), ncx = cd.px + cd.w / 2, ncy = 290, rr = 7, pr = Math.max(1, Math.round(nb * 0.45)), kk;
      floorShadow(ctx, ncx, ncy + 58, 70, 9, 0.22);
      var spots = []; for (kk = 0; kk < nb; kk++) { var ang = kk * 2.39996, rad = rr * 1.25 * Math.sqrt(kk); spots.push([ncx + Math.cos(ang) * rad, ncy + Math.sin(ang) * rad * .92, kk]); }
      spots.sort(function (p, q) { return p[1] - q[1]; });
      spots.forEach(function (sp2) { if (sp2[2] % 2 === 0 && sp2[2] / 2 < pr) proton(ctx, sp2[0], sp2[1], rr); else neutron(ctx, sp2[0], sp2[1], rr); });
      lt(ctx, A > 61 ? "핵자 " + A + "개 중 일부만 그림" : "핵자 " + A + "개", ncx, 372, { s: 11, a: "center", c: LT.mute });
      $("b-bind-info").innerHTML = "<b>질량수 " + A + "</b>" + (NAME[A] ? " (" + NAME[A] + ")" : "") + " · 핵자당 결합 에너지 <b>" + b.toFixed(3) + " MeV</b> · 총 <b>" + (b * A).toFixed(0) + " MeV</b><br>" +
        (A < 50 ? "꼭대기보다 <b>왼쪽</b>입니다. 이 원자핵끼리 융합하면 더 단단한 핵이 되면서 <b>에너지가 나옵니다</b>. 별이 빛나는 까닭입니다."
        : A <= 62 ? "곡선의 <b>꼭대기</b> 근처입니다. 더 융합해도 얻을 것이 없습니다. 별의 핵융합은 여기서 끝납니다."
        : "꼭대기보다 <b>오른쪽</b>입니다. 융합해서 더 무거운 핵을 만들려면 에너지를 오히려 <b>넣어 주어야</b> 합니다. 대신 쪼개지면(분열) 에너지가 나옵니다.");
    }
    function check() {
      if (A >= 54 && A <= 58 && !got) { got = true; window.sthState("bindGot", 1); }
      mission();
    }
    function mission() {
      if (got) done("m2-3a");
      if (qOK) done("m2-3b");
      if (got && qOK) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>결합 에너지의 꼭대기가 <b>철-56</b>이라, 별은 철에서 부엌 문을 닫습니다. 철보다 무거운 원소는 <b>다른 방법</b>으로 만들어져야 합니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("b-a").addEventListener("input", function (e) { A = +e.target.value; $("b-a-val").textContent = "A = " + A; draw(); check(); });
    window.sthPick({
      mount: "s2-q",
      q: "아무리 무거운 별도 철에서 핵융합을 멈춥니다. 그 까닭으로 가장 알맞은 것은?",
      options: [
        "철이 자연에 있는 가장 무거운 원소이기 때문",
        "철보다 무거운 핵을 융합으로 만들려면 에너지를 오히려 넣어 주어야 하기 때문",
        "철의 녹는점이 높아 별 속에서 녹지 않기 때문",
        "별 속에 철이 너무 많아 자리가 없기 때문"
      ],
      answer: 1,
      why: [
        "금·납·우라늄처럼 훨씬 무거운 원소도 자연에 있습니다.",
        "결합 에너지 곡선의 꼭대기가 철-56입니다. 꼭대기를 넘어가는 융합은 에너지를 내놓는 대신 <b>빨아들입니다</b>. 별은 그 순간 버틸 힘을 잃고 무너집니다.",
        "별의 중심은 수십억 K로, 녹는점과는 상관없습니다.",
        "양이 아니라 <b>에너지</b>의 문제입니다."
      ],
      onDone: function () { qOK = true; window.sthState("bindQ", 1); mission(); }
    });
    draw(); mission();
  })();

  /* ------------------------------------------- 장면 4 — 우리 몸의 원소 */
  (function () {
    var canvas = $("b-body"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var wkg = 60, got = !!window.sthState("bodyGot"), sorted = !!window.sthState("bodySort");
    var EL = [
      { n: "산소", p: 65.0, c: "--brand" },
      { n: "탄소", p: 18.5, c: "--violet" },
      { n: "수소", p: 9.5, c: "--coral" },
      { n: "질소", p: 3.2, c: "--teal" },
      { n: "칼슘", p: 1.5, c: "--amber" },
      { n: "인", p: 1.0, c: "--rose" },
      { n: "그 밖", p: 1.3, c: "--mist" }
    ];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var big = wkg * 9.5 / 100, star = wkg - big, SW = 560, i;
      var COL = ["#4dabf7", "#845ef7", "#ff922b", "#20c997", "#fcc419", "#f06595", "#adb5bd"];
      KT.studio(ctx, 0, 0, SW, H, null);
      KT.bigText(ctx, "별에서 온 " + star.toFixed(1) + " kg", 18, 46, 28, "#d0bfff");
      KT.bigText(ctx, "빅뱅에서 온 수소 " + big.toFixed(1) + " kg", 18, 76, 16, "#ffb35c");
      /* 저울 위에 원소 블록을 질량만큼 쌓는다 */
      var I = KT.iso({ ox: 250, oy: 262, s: 0.7, L: 110, D: 110 }), z = 0, kz = 2.0;
      floorShadow(ctx, I.P(55, 55, -18).x + 10, I.P(110, 110, -18).y - 20, 150, 26, 0.26);
      I.box(ctx, -18, -18, -18, 128, 128, 0, "#eef2f7", "#c9d1dc", "#9ea8b6");
      var mids = [];
      for (i = 0; i < EL.length; i++) {
        var h = wkg * EL[i].p / 100 * kz, c0 = COL[i];
        I.box(ctx, 10, 10, z, 100, 100, z + h, KT.tint(c0, 1.18), KT.tint(c0, 0.95), KT.tint(c0, 0.72));
        mids.push(z + h / 2); z += h;
      }
      function tag(zz, s, ty, col) { var p = I.P(100, 55, zz); I.label(ctx, 100, 55, zz, s, 80, ty - p.y, col, [0, SW]); }
      tag(mids[0], "산소 " + (wkg * .65).toFixed(1) + " kg", 262, "#a5d8ff");
      tag(mids[1], "탄소 " + (wkg * .185).toFixed(1) + " kg", 222, "#d0bfff");
      tag(mids[2], "수소 " + big.toFixed(1) + " kg · 빅뱅에서", 182, "#ffc078");
      tag(z - 2, "질소·칼슘·인·그 밖", 142, "#96f2d7");
      I.person(ctx, -40, 150, 0, "#ff6b81", 3.2);
      KT.pill(ctx, "저울 눈금 " + wkg + " kg", 40, H - 22, { s: 12.5, c: "#8ce99a" });
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 572, W, H, "몸무게를 원소별로 나누면");
      for (i = 0; i < EL.length; i++) {
        var yy = 56 + i * 25;
        ctx.fillStyle = COL[i]; ctx.beginPath(); ctx.roundRect(cd.px, yy - 10, 10, 10, 3); ctx.fill();
        lt(ctx, EL[i].n, cd.px + 16, yy, { s: 12, c: i === 2 ? "#d9480f" : LT.mute });
        lt(ctx, (wkg * EL[i].p / 100).toFixed(1) + " kg · " + EL[i].p.toFixed(1) + "%", cd.R, yy, { s: 13, w: "900", a: "right", c: i === 2 ? "#d9480f" : LT.ink });
      }
      KT.row(ctx, "빅뱅에서 온 질량 (수소)", big.toFixed(1) + " kg", cd.px, cd.R, 246, "#d9480f");
      KT.row(ctx, "별에서 온 질량 (나머지)", star.toFixed(1) + " kg", cd.px, cd.R, 272, LT.violet);
      KT.bar(ctx, cd.px, 284, cd.w, 0.905, "#845ef7");
      tick(ctx, got, "별에서 온 질량 50 kg 넘기기", cd.px - 4, 306, cd.w + 8);
      lt(ctx, "비율은 늘 9.5% 대 90.5%", cd.px, 364, { s: 11, c: LT.mute });
      $("b-body-info").innerHTML = "몸무게 <b>" + wkg + " kg</b> 가운데 빅뱅에서 온 수소는 <b>" + big.toFixed(1) + " kg</b>, 별에서 만들어진 원소는 <b>" + star.toFixed(1) + " kg</b>입니다. 비율로는 <b>9.5% 대 90.5%</b>로, 몸무게가 달라져도 이 비율은 그대로입니다.";
    }
    function check() {
      if (!got && wkg * 0.905 > 50 && wkg <= 58) { got = true; window.sthState("bodyGot", 1); mission(); }
    }
    function mission() {
      if (got) done("m2-4a");
      if (sorted) done("m2-4b");
      if (got && sorted) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>몸무게의 <b>9.5%</b>만 빅뱅에서 왔고, 나머지 <b>90.5%</b>는 모두 별이 만든 것입니다. 우리 몸은 별의 먼지로 지은 집입니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("b-w").addEventListener("input", function (e) { wkg = +e.target.value; $("b-w-val").textContent = wkg + " kg"; draw(); check(); });
    window.sthSort({
      mount: "s2-sort",
      buckets: [
        { id: "b", label: "빅뱅", sub: "우주 탄생 뒤 3분 안" },
        { id: "s", label: "별 속의 핵융합", sub: "별이 살아 있는 동안" },
        { id: "x", label: "초신성 · 중성자별 충돌", sub: "별의 마지막 순간" }
      ],
      items: [
        { t: "수소 (H)", a: "b", why: "빅뱅 핵합성이 만든 원소입니다. 지금도 우주 질량의 4분의 3입니다." },
        { t: "헬륨 (He)", a: "b", why: "빅뱅 핵합성이 만든 원소입니다. 별도 헬륨을 만들지만, 우주의 헬륨은 대부분 빅뱅에서 왔습니다.", hint: "질량비 3 : 1이 정해진 때를 떠올려 보세요." },
        { t: "탄소 (C)", a: "s", why: "별 속에서 헬륨 셋이 부딪쳐 만들어집니다(삼중 알파 반응)." },
        { t: "산소 (O)", a: "s", why: "헬륨 연소 단계에서 탄소와 함께 만들어집니다." },
        { t: "질소 (N)", a: "s", why: "별의 CNO 순환 과정에서 만들어집니다." },
        { t: "규소 (Si)", a: "s", why: "질량이 큰 별의 네온·산소 연소 단계에서 만들어집니다." },
        { t: "철 (Fe)", a: "s", why: "질량이 큰 별의 마지막 핵융합 단계에서 만들어집니다. 별이 살아 있는 동안의 일입니다.", hint: "결합 에너지 곡선의 꼭대기까지는 별이 스스로 오릅니다." },
        { t: "금 (Au)", a: "x", why: "철보다 무거우므로 융합으로는 만들 수 없습니다. 2017년 중성자별 충돌에서 실제로 확인되었습니다." },
        { t: "우라늄 (U)", a: "x", why: "중성자가 폭포처럼 쏟아지는 곳에서만 만들어집니다.", hint: "결합 에너지 곡선의 아주 오른쪽에 있습니다." }
      ],
      doneText: "출생지가 셋으로 갈립니다.",
      onDone: function () { sorted = true; window.sthState("bodySort", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 */
  function finish() { window.sthState("r2", "해결 · 몸무게의 90.5%는 별에서, 9.5%만 빅뱅에서 왔다"); }
  function showEnd(i) {
    if (i !== 4) return;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0 ? "처음부터 정확했습니다. 이제 ‘어느 별에서, 어떤 단계에서’까지 말할 수 있게 되었습니다."
        : "정답은 ㉢ 입니다. 빅뱅은 수소·헬륨까지, 별은 철까지, 그 너머는 초신성과 중성자별 충돌이 만들었습니다.");
    ep.clear(4);
  }
  ep.onShow(showEnd);
  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅱ-1] 이야기 ② 별의 부엌",
    items: [
      { id: "w2", label: "원소가 만들어진 곳", hint: "수소·헬륨과 철의 생성 장소가 다른 까닭을 쓰세요." },
      { id: "b2", label: "‘우리는 별의 먼지’라는 말의 뜻", hint: "내 몸의 탄소·산소·칼슘이 어떤 별에서 어떤 과정으로 만들어져 여기까지 왔는지 차례대로 쓰세요." }
    ]
  });
  if (ep.at() === 4) showEnd(4);
})();

/* =========================================================================
   이야기 ③ 존재비 저울
   기체가 달아나는지: 평균 제곱근 속력 v = √(3RT/M)가 탈출 속도의 1/6을 넘는가
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "p3", title: "조사관의 첫 추리",
    question: "우주 전체에서 가장 많은 원소는 수소입니다. 그렇다면 지각에서도 수소가 가장 많을까요?",
    options: ["㉠ 그렇다. 우주의 조성이 그대로 이어졌다", "㉡ 아니다. 산소가 가장 많다", "㉢ 아니다. 규소가 가장 많다", "㉣ 아니다. 철이 가장 많다"],
    onPick: function () { ep.clear(0); }
  });

  /* ------------------------------------------- 장면 2 — 탈출 속도 계산기 */
  (function () {
    var canvas = $("c-esc"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var body = "earth", T = 300, got = window.sthState("escGot") || { a: false, b: false, c: false };
    var BODY = {
      moon: { n: "달", esc: 2380, r: 34, c: "--mist" },
      mars: { n: "화성", esc: 5030, r: 44, c: "--coral" },
      earth: { n: "지구", esc: 11200, r: 58, c: "--brand" },
      jup: { n: "목성", esc: 59500, r: 86, c: "--amber" }
    };
    var GAS = [
      { n: "수소 H₂", m: 0.002, c: "--coral" },
      { n: "헬륨 He", m: 0.004, c: "--violet" },
      { n: "질소 N₂", m: 0.028, c: "--teal" },
      { n: "산소 O₂", m: 0.032, c: "--brand" },
      { n: "이산화 탄소 CO₂", m: 0.044, c: "--green" }
    ];
    function vrms(mol, t) { return Math.sqrt(3 * 8.314 * t / mol); }
    function thr() { return BODY[body].esc / 6; }
    function escapes(g) { return vrms(g.m, T) > thr(); }
    var X0 = 300, X1 = 740, VMAX = 5000;
    function bx(vv) { return X0 + clamp(vv, 0, VMAX) / VMAX * (X1 - X0); }

    var est = { on: !REDUCE }, tm = 0;
    function globe(B, cx, cy, r) {
      if (body === "earth") { KT.earth(ctx, cx, cy, r); return; }
      if (body === "moon") {
        KT.planet(ctx, cx, cy, r, "#d9dbe2", "#55586a");
        ctx.fillStyle = "rgba(60,62,80,.35)";
        [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.12], [-0.05, 0.35, 0.1]].forEach(function (c) { ctx.beginPath(); ctx.arc(cx + c[0] * r, cy + c[1] * r, c[2] * r, 0, Math.PI * 2); ctx.fill(); });
        return;
      }
      if (body === "mars") { KT.planet(ctx, cx, cy, r, "#ff9a6a", "#6a2210"); return; }
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      var jg = ctx.createLinearGradient(0, cy - r, 0, cy + r);
      ["#f3e2c4", "#c98a52", "#f0d9b0", "#b0703e", "#ead2a6", "#c48a5a", "#f3e2c4"].forEach(function (c, i, arr) { jg.addColorStop(i / (arr.length - 1), c); });
      ctx.fillStyle = jg; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      var sh = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r); sh.addColorStop(0, "rgba(255,255,255,.25)"); sh.addColorStop(1, "rgba(0,0,0,.55)");
      ctx.fillStyle = sh; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      ctx.fillStyle = "rgba(190,80,50,.8)"; ctx.beginPath(); ctx.ellipse(cx + r * 0.25, cy + r * 0.25, r * 0.16, r * 0.09, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var GC = ["#ff922b", "#845ef7", "#20c997", "#4dabf7", "#51cf66"];
      var B = BODY[body], th = thr(), RB = { moon: 58, mars: 72, earth: 88, jup: 100 }, r = RB[body], cx = 380, cy = 250, i, k, SW = 630;
      KT.studio(ctx, 0, 0, SW, H, { x: cx, y: cy + r + 34, rx: 150, ry: 18 });
      KT.bigText(ctx, B.n + " · 탈출 속도 " + (B.esc / 1000).toFixed(1) + " km/s", 18, 46, 26, "#ffffff");
      KT.bigText(ctx, "붙잡기 기준 " + Math.round(th).toLocaleString() + " m/s (탈출 속도 ÷ 6)", 18, 74, 15, "#ffd35a");
      /* 받침대 위의 큰 천체 미니어처 + 붙잡기 한계(점선 고리) */
      slab(ctx, cx - 74, cy + r + 18, 136, 14, 16, "#f1f3f5", "#c3cad5", "#97a1af");
      var R2 = r + 74;
      var held = 0; for (i = 0; i < GAS.length; i++) if (!escapes(GAS[i])) held++;
      if (held > 0) {
        var ah = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 14 + held * 8);
        ah.addColorStop(0, "rgba(77,171,247," + (0.22 + held * 0.07).toFixed(2) + ")"); ah.addColorStop(1, "rgba(77,171,247,0)");
        ctx.fillStyle = ah; ctx.beginPath(); ctx.arc(cx, cy, r + 14 + held * 8, 0, 6.2832); ctx.fill();
      }
      ctx.save(); ctx.strokeStyle = "rgba(232,89,12,.8)"; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.arc(cx, cy, R2, 0, 6.2832); ctx.stroke(); ctx.restore();
      KT.pill(ctx, "붙잡기 한계", cx + R2 * .72, cy - R2 * .72 - 8, { s: 12, c: "#ffd9a8", box: [0, SW - 4] });
      globe(B, cx, cy, r);
      /* 기체 분자: 속력에 비례해 높이 튀어 오른다. 기준보다 빠르면 고리를 넘어 우주로 */
      for (i = 0; i < GAS.length; i++) {
        var vv = vrms(GAS[i].m, T), out = vv > th, hop = clamp(vv / th, 0, 1) * (R2 - r - 10);
        for (k = 0; k < 4; k++) {
          var an = -Math.PI / 2 + (i * 4 + k) * 6.2832 / 20 + .12, alt, al = 1;
          if (out) {
            var ph = (tm * 0.00022 * (1 + i * .2) + k / 4 + i * .17) % 1;
            alt = r + 6 + ph * (R2 - r + 70); al = alt > R2 ? clamp(1 - (alt - R2) / 70, 0, 1) : 1;
            var tx0 = cx + Math.cos(an) * (alt - 18), ty0 = cy + Math.sin(an) * (alt - 18);
            ctx.globalAlpha = al * .5; ctx.strokeStyle = GC[i]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx0, ty0); ctx.lineTo(cx + Math.cos(an) * alt, cy + Math.sin(an) * alt); ctx.stroke();
          } else {
            alt = r + 6 + hop * Math.abs(Math.sin(tm * 0.0016 * (1 + i * .1) + k * 1.7 + i));
          }
          ctx.globalAlpha = al; ball(ctx, cx + Math.cos(an) * alt, cy + Math.sin(an) * alt, 5.5, GC[i]); ctx.globalAlpha = 1;
        }
      }
      KT.pill(ctx, B.n, cx, cy + r + 58, { a: "center", s: 13, c: "#e8ecff" });
      /* 왼쪽 범례: 기체별 평균 속력 */
      for (i = 0; i < GAS.length; i++) {
        var v2 = vrms(GAS[i].m, T), o3 = v2 > th, ly = 116 + i * 30;
        ball(ctx, 26, ly - 4, 6, GC[i]);
        lt(ctx, GAS[i].n, 38, ly, { s: 12, w: "800", c: LT.ink });
        lt(ctx, Math.round(v2).toLocaleString() + " m/s", 38, ly + 15, { s: 12, w: "800", c: o3 ? LT.red : LT.mute });
      }
      lt(ctx, "튀어 오르는 높이 ∝ 평균 속력", 18, 290, { s: 12, c: LT.mute });
      KT.warn(ctx, 16, H - 14, "⚠ 천체 크기·입자는 실제 비율이 아님");
      /* 오른쪽 판정 카드 */
      var nEsc = 0; for (i = 0; i < GAS.length; i++) if (escapes(GAS[i])) nEsc++;
      var cd = sideCard(ctx, 642, W, H, "대기 붙잡기 판정");
      lt(ctx, "달아나는 기체 " + nEsc + "가지", cd.px, 62, { s: 19, w: "900", c: nEsc ? LT.red : LT.green });
      KT.row(ctx, "대기 바깥층 온도", T + " K", cd.px, cd.R, 92, LT.orange);
      for (i = 0; i < GAS.length; i++) {
        var oo = escapes(GAS[i]), y3 = 122 + i * 24;
        ctx.fillStyle = GC[i]; ctx.beginPath(); ctx.arc(cd.px + 5, y3 - 5, 5, 0, 6.2832); ctx.fill();
        lt(ctx, GAS[i].n, cd.px + 16, y3, { s: 12, c: LT.mute });
        lt(ctx, oo ? "달아남" : "붙잡힘", cd.R, y3, { s: 13, w: "900", a: "right", c: oo ? LT.red : LT.green });
      }
      tick(ctx, got.a, "지구 조건", cd.px - 4, 252, cd.w + 8);
      tick(ctx, got.b, "질소도 놓침", cd.px - 4, 290, cd.w + 8);
      tick(ctx, got.c, "수소도 붙잡음", cd.px - 4, 328, cd.w + 8);
      lt(ctx, "가벼울수록 빠르다 v ∝ 1/√M", cd.px, 392, { s: 11, c: LT.mute });
    }
    function draw() {
      render();
      var B = BODY[body], esc = 0;
      for (var i = 0; i < GAS.length; i++) if (escapes(GAS[i])) esc++;

      $("c-esc-info").innerHTML = "<b>" + B.n + "</b> · 대기 바깥층 " + T + " K에서 달아나는 기체 <b>" + esc + "가지</b>, 붙잡는 기체 <b>" + (GAS.length - esc) + "가지</b>.<br>" +
        "같은 온도에서도 <b>가벼운 기체일수록 빠릅니다</b>(v ∝ 1/√M). 그래서 수소와 헬륨이 가장 먼저 달아납니다. " +
        (body === "moon" ? "달은 탈출 속도가 너무 작아 질소·산소마저 붙잡지 못합니다. 그래서 달에는 대기가 없습니다."
        : body === "jup" ? "목성은 탈출 속도가 커서 수소와 헬륨까지 붙잡았습니다. 그래서 목성의 조성은 <b>태양과 비슷합니다</b>."
        : body === "mars" ? "화성은 지구보다 작아 붙잡는 힘이 약합니다. 온도를 올려 보면 질소까지 놓치는 때가 옵니다."
        : "지구는 수소·헬륨은 놓치고 질소·산소는 붙잡는 딱 그 크기입니다. 우주의 74%가 수소인데 지각에는 0.14%뿐인 까닭입니다.");
      check();
    }
    function check() {
      var ch = false, th = thr();
      var h2 = vrms(0.002, T) > th, he = vrms(0.004, T) > th, n2 = vrms(0.028, T) > th, o2 = vrms(0.032, T) > th;
      if (body === "earth" && h2 && he && !n2 && !o2 && !got.a) { got.a = true; ch = true; }
      if (n2 && !got.b) { got.b = true; ch = true; }
      if (body === "jup" && !h2 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("escGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.c) done("m3-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>천체의 <b>크기</b>가 어떤 원소를 남길지 고릅니다. 지구는 우주에서 가장 흔한 수소·헬륨을 놓쳤고, 목성은 붙잡았으며, 달은 아무것도 붙잡지 못했습니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("c-t").addEventListener("input", function (e) { T = +e.target.value; $("c-t-val").textContent = T + " K"; draw(); });
    pauser("c-esc-play", est);
    KT.animate(canvas, function (dt) { if (est.on) { tm += dt; render(); } });
    Array.prototype.forEach.call($("c-body").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { body = b.getAttribute("data-b"); segOn("c-body", b); draw(); });
    });
    draw(); mission();
  })();

  /* ------------------------------------------- 장면 3 — 존재비 견주기 */
  (function () {
    var canvas = $("c-bars"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var el = "철", got = window.sthState("barsGot") || { a: false, b: false, c: false };
    var D = {
      "수소": { u: 73.8, k: 0.14, b: 9.5 },
      "헬륨": { u: 24.9, k: 0.0000008, b: 0.0000001 },
      "탄소": { u: 0.24, k: 0.02, b: 18.5 },
      "질소": { u: 0.07, k: 0.002, b: 3.2 },
      "산소": { u: 0.58, k: 46.6, b: 65.0 },
      "규소": { u: 0.07, k: 27.7, b: 0.002 },
      "철": { u: 0.13, k: 5.0, b: 0.006 },
      "칼슘": { u: 0.007, k: 3.6, b: 1.5 }
    };
    var ROWS = [["u", "우주 전체", "--violet"], ["k", "지각", "--coral"], ["b", "사람의 몸", "--teal"]];
    var X0 = 170, X1 = 840, LOW = -3, HIGH = 2;
    function bx(p) { return X0 + (clamp(log10(Math.max(p, 1e-4)), LOW, HIGH) - LOW) / (HIGH - LOW) * (X1 - X0); }
    function show(p) { return p < 0.001 ? "거의 0" : (p >= 10 ? p.toFixed(1) : (p >= 0.1 ? p.toFixed(2) : p.toFixed(3))) + " %"; }
    var RICON = ["🌌", "🪨", "🧍"];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var d = D[el];
      var SW = 630, BC = ["#845ef7", "#ff922b", "#20c997"];
      KT.studio(ctx, 0, 0, SW, H, { x: 330, y: 322, rx: 290, ry: 26 });
      KT.bigText(ctx, el + " — 어디에 많을까", 18, 46, 28, "#ffffff");
      KT.bigText(ctx, "질량 백분율 · 로그 눈금 (한 칸 = 10배)", 18, 74, 15, "#ffd35a");
      /* 시료 유리관 셋 — 채운 높이 = 질량 백분율(로그 눈금) */
      var JT = 108, JB = 296, JR = 44, JX = [150, 330, 510];
      function lv(p) { return JB - (clamp(log10(Math.max(p, 1e-4)), LOW, HIGH) - LOW) / (HIGH - LOW) * (JB - JT); }
      for (var dec = LOW; dec <= HIGH; dec++) {
        var gy = lv(Math.pow(10, dec));
        KT.line(ctx, { x: 92, y: gy }, { x: 570, y: gy }, "rgba(20,40,90,.10)", 1, [3, 4]);
        lt(ctx, (dec < 0 ? Math.pow(10, dec).toFixed(-dec) : String(Math.pow(10, dec))) + "%", 86, gy + 4, { s: 12, a: "right", c: LT.mute });
      }
      for (var i = 0; i < 3; i++) {
        var p = d[ROWS[i][0]], cx = JX[i], L0 = lv(p), col = BC[i];
        floorShadow(ctx, cx, JB + 22, 70, 9, .26);
        slab(ctx, cx - 60, JB + 12, 104, 12, 16, "#f1f3f5", "#c3cad5", "#97a1af");
        jar(ctx, cx, JT, JB, JR, function (ry) {
          var lg = ctx.createLinearGradient(cx - JR, 0, cx + JR, 0); lg.addColorStop(0, KT.tint(col, 1.15)); lg.addColorStop(.6, col); lg.addColorStop(1, KT.tint(col, .7));
          ctx.fillStyle = lg; ctx.fillRect(cx - JR, L0, JR * 2, JB - L0 + ry + 2);
          ctx.fillStyle = KT.tint(col, 1.3); ctx.beginPath(); ctx.ellipse(cx, L0, JR, ry, 0, 0, 6.2832); ctx.fill();
          if (i === 0) { var R = KT.rng(7); for (var s2 = 0; s2 < 14; s2++) { var sy = L0 + 4 + R() * (JB - L0); if (sy < JB) { ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.fillRect(cx - JR + 6 + R() * (JR * 2 - 12), sy, 1.6, 1.6); } } }
        });
        KT.pill(ctx, show(p), cx, Math.min(L0 - 14, JB - 20), { a: "center", s: 13, c: "#ffffff" });
        /* 받침 위 작은 모형: 우주(성운 큐브) · 지각(암석 블록) · 사람 */
        var ix = cx + JR + 4, iy = JB - 6;
        if (i === 0) {
          var cg = ctx.createRadialGradient(ix, iy - 8, 2, ix, iy - 8, 20); cg.addColorStop(0, "#ffd6ff"); cg.addColorStop(.5, "#7048e8"); cg.addColorStop(1, "#1b1f4a");
          slab(ctx, ix - 10, iy - 18, 22, 22, 10, "rgba(170,180,230,.9)", cg, "#2b2f6a");
        } else if (i === 1) {
          slab(ctx, ix - 12, iy - 10, 26, 7, 10, "#8c9a6b", "#c9a46c", "#7f5f45");
          ctx.fillStyle = "#9c6b4a"; ctx.fillRect(ix - 12, iy - 3, 26, 8);
          ctx.fillStyle = "#7a5638"; ctx.beginPath(); ctx.moveTo(ix + 14, iy - 10); ctx.lineTo(ix + 24, iy - 16); ctx.lineTo(ix + 24, iy - 1); ctx.lineTo(ix + 14, iy + 5); ctx.closePath(); ctx.fill();
        } else {
          var bg2 = ctx.createLinearGradient(ix - 8, 0, ix + 8, 0); bg2.addColorStop(0, "#ffa8a8"); bg2.addColorStop(1, "#c92a2a");
          ctx.fillStyle = bg2; ctx.beginPath(); ctx.roundRect(ix - 7, iy - 20, 14, 17, 6); ctx.fill();
          ctx.fillStyle = "#495057"; ctx.fillRect(ix - 6, iy - 4, 4, 8); ctx.fillRect(ix + 2, iy - 4, 4, 8);
          KT.planet(ctx, ix, iy - 26, 6, "#ffe3c8", "#c48a5a");
        }
        lt(ctx, ROWS[i][1], cx - 8, JB + 50, { s: 13, w: "900", a: "center", c: LT.ink });
      }
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 642, W, H, "질량 백분율");
      lt(ctx, el, cd.px, 64, { s: 24, w: "900", c: LT.ink });
      KT.row(ctx, "우주 전체", show(d.u), cd.px, cd.R, 98, LT.violet);
      KT.row(ctx, "지각", show(d.k), cd.px, cd.R, 124, "#d9480f");
      KT.row(ctx, "사람의 몸", show(d.b), cd.px, cd.R, 150, LT.green);
      var only = d.u > 10 && d.k < 1 ? "우주에만 흔합니다" : (d.k > 10 && d.b < 0.01 ? "지각에만 흔합니다" : (d.u < 1 && d.b > 10 ? "생명체에만 흔합니다" : ""));
      KT.tip(ctx, only || "세 곳의 차이를 견주어 보세요", cd.px - 4, 166, cd.w + 8, only ? true : null);
      tick(ctx, got.a, "우주에만 흔한 것", cd.px - 4, 222, cd.w + 8);
      tick(ctx, got.b, "지각에만 흔한 것", cd.px - 4, 260, cd.w + 8);
      tick(ctx, got.c, "생명체에만 흔한 것", cd.px - 4, 298, cd.w + 8);
      var rk = d.k > 0 ? d.u / d.k : Infinity, rb = d.u > 0 ? d.b / d.u : 0;
      $("c-bars-info").innerHTML = "<b>" + el + "</b> — 우주 " + show(d.u) + " · 지각 " + show(d.k) + " · 사람의 몸 " + show(d.b) + "<br>" +
        "우주에서 지각으로 가면 <b>" + (rk >= 1 ? (rk > 1e5 ? "10만 배 넘게 줄고" : Math.round(rk).toLocaleString() + "배 줄고") : Math.round(1 / rk).toLocaleString() + "배 늘고") + "</b>, " +
        "우주에서 사람의 몸으로 가면 <b>" + (rb >= 1 ? Math.round(rb).toLocaleString() + "배 늘어납니다" : (rb > 0 ? Math.round(1 / rb).toLocaleString() + "배 줄어듭니다" : "거의 사라집니다")) + "</b>.";
      check();
    }
    function check() {
      var d = D[el], ch = false;
      if (d.u > 10 && d.k < 1 && !got.a) { got.a = true; ch = true; }
      if (d.k > 10 && d.b < 0.01 && !got.b) { got.b = true; ch = true; }
      if (d.u < 1 && d.b > 10 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("barsGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (got.c) done("m3-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>수소·헬륨은 <b>지구가 붙잡지 못해서</b>, 규소는 <b>암석의 재료라서</b>, 탄소는 <b>생명의 뼈대라서</b> 이렇게 갈렸습니다. 같은 우주에서 온 물질인데 사는 곳에 따라 비율이 달라집니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call($("c-pick").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        el = b.getAttribute("data-el");
        Array.prototype.forEach.call($("c-pick").querySelectorAll("button"), function (x) { x.classList.toggle("on", x === b); });
        draw();
      });
    });
    draw(); mission();
  })();

  /* ------------------------------------------- 장면 4 — 수소·헬륨 걷어 내기 */
  (function () {
    var canvas = $("c-strip"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var s = 0, got = !!window.sthState("stripGot"), sorted = !!window.sthState("stripSort");
    var Z = [
      { n: "산소", p: 0.58, c: "--brand" },
      { n: "탄소", p: 0.24, c: "--violet" },
      { n: "네온", p: 0.17, c: "--mist" },
      { n: "철", p: 0.13, c: "--coral" },
      { n: "질소", p: 0.07, c: "--teal" },
      { n: "규소", p: 0.07, c: "--amber" },
      { n: "마그네슘", p: 0.06, c: "--green" },
      { n: "황", p: 0.03, c: "--rose" }
    ];
    var ZSUM = 0, i;
    for (i = 0; i < Z.length; i++) ZSUM += Z[i].p;
    var CRUST = "지각의 실제값: 산소 46.6% · 규소 27.7% · 알루미늄 8.1% · 철 5.0%";
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var f = s / 100, H0 = 73.8 * (1 - f), HE = 24.9 * (1 - f), rest = ZSUM;
      var tot = H0 + HE + rest;
      var SW = 630, ZC = ["#4dabf7", "#845ef7", "#adb5bd", "#ff922b", "#20c997", "#fcc419", "#51cf66", "#f06595"];
      KT.studio(ctx, 0, 0, SW, H, null);
      KT.bigText(ctx, "남은 시료 " + tot.toFixed(1) + " g", 18, 46, 28, "#ffffff");
      KT.bigText(ctx, "수소·헬륨을 " + s + "% 날려 보냄", 18, 74, 16, "#ffd35a");
      /* 유리 시료병 — 병 속 비율 */
      var jx = 128, jt = 128, jb = 330, jr = 66;
      floorShadow(ctx, jx, jb + 14, 96, 14, 0.28);
      var segs = [[H0 / tot, "#ff8a6a", "수소"], [HE / tot, "#9775fa", "헬륨"], [rest / tot, "#20c997", "나머지"]];
      jar(ctx, jx, jt, jb, jr, function (ry) {
        var cur = jt;
        for (var q = 0; q < 3; q++) {
          var hh = segs[q][0] * (jb - jt);
          if (hh > 0.3) {
            var lg = ctx.createLinearGradient(jx - jr, 0, jx + jr, 0); lg.addColorStop(0, KT.tint(segs[q][1], .78)); lg.addColorStop(.45, KT.tint(segs[q][1], 1.15)); lg.addColorStop(1, KT.tint(segs[q][1], .7));
            ctx.fillStyle = lg; ctx.fillRect(jx - jr, cur, jr * 2, hh + ry + 2);
            ctx.fillStyle = KT.tint(segs[q][1], 1.25); ctx.beginPath(); ctx.ellipse(jx, cur, jr, ry, 0, 0, 6.2832); ctx.fill();
          }
          cur += hh;
        }
      });
      var cur2 = jt;
      for (i = 0; i < 3; i++) {
        var h2 = segs[i][0] * (jb - jt);
        if (h2 > 20) KT.pill(ctx, segs[i][2] + " " + (segs[i][0] * 100).toFixed(1) + "%", jx, cur2 + h2 / 2 + 5, { a: "center", s: 11.5, c: "#ffffff" });
        cur2 += h2;
      }
      if (s > 0) for (i = 0; i < Math.round(s / 8); i++) {
        var ux = jx - 50 + (i * 37) % 100, uy = jt - 16 - (i * 13) % 20;
        ball(ctx, ux, uy, 4.5, i % 4 === 3 ? "#9775fa" : "#ff8a6a");
        KT.arrow(ctx, { x: ux, y: uy - 7 }, { x: ux + 2, y: uy - 19 }, "rgba(90,100,120,.45)", 1.4, 6);
      }
      if (s > 0) KT.pill(ctx, "↑ 수소·헬륨이 날아간다", jx, jb + 36, { a: "center", s: 11, c: "#ffc9c9", box: [0, 300] });
      /* 입체 막대 — 수소·헬륨을 뺀 나머지의 조성 */
      lt(ctx, "수소·헬륨을 뺀 나머지의 조성", 270, 108, { s: 12.5, w: "900", c: LT.ink });
      var bx0 = 340, bx1 = 560;
      for (i = 0; i < Z.length; i++) {
        var yy = 124 + i * 28, frac = Z[i].p / ZSUM, bw = Math.max(3, (bx1 - bx0) * frac / 0.45);
        lt(ctx, Z[i].n, bx0 - 10, yy + 14, { s: 12, w: "800", a: "right", c: LT.ink });
        bar3(ctx, bx0, yy + 2, bw, 15, 6, ZC[i]);
        lt(ctx, (frac * 100).toFixed(1) + "%", bx0 + bw + 12, yy + 15, { s: 11.5, w: "800", c: i === 0 ? LT.blue : LT.mute });
      }
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 642, W, H, "남은 것의 1위");
      lt(ctx, Z[0].n + " " + (Z[0].p / ZSUM * 100).toFixed(1) + "%", cd.px, 64, { s: 22, w: "900", c: LT.blue });
      KT.row(ctx, "병 속 수소", (segs[0][0] * 100).toFixed(1) + "%", cd.px, cd.R, 100, "#d9480f");
      KT.row(ctx, "병 속 헬륨", (segs[1][0] * 100).toFixed(1) + "%", cd.px, cd.R, 126, LT.violet);
      KT.row(ctx, "병 속 나머지", (segs[2][0] * 100).toFixed(1) + "%", cd.px, cd.R, 152, LT.green);
      KT.bar(ctx, cd.px, 166, cd.w, s / 100, "#ff8a6a");
      lt(ctx, "지각의 실제값", cd.px, 212, { s: 12, w: "800", c: LT.mute });
      lt(ctx, "산소 46.6% · 규소 27.7%", cd.px, 234, { s: 12.5, w: "900", c: LT.ink });
      lt(ctx, "알루미늄 8.1% · 철 5.0%", cd.px, 254, { s: 12.5, w: "900", c: LT.ink });
      tick(ctx, got, "1위 확인 (끝까지 날려 보내기)", cd.px - 4, 280, cd.w + 8);
      lt(ctx, "네온은 결합하지 않아 지구가 놓침", cd.px, 352, { s: 11, c: LT.mute });
      $("c-strip-info").innerHTML = s < 100
        ? "슬라이더를 올릴수록 왼쪽 시료에서 수소와 헬륨이 줄어듭니다. 지금은 " + tot.toFixed(1) + " g이 남았습니다. 끝까지 올려 보세요."
        : "수소와 헬륨이 모두 사라지자 <b>산소(43.3%)</b>가 1위, <b>탄소(17.9%)</b>가 2위가 되었습니다. 지각의 1위도 <b>산소(46.6%)</b>, 사람 몸의 1위도 <b>산소(65%)</b>입니다. 지구와 생명의 재료는 결국 <b>우주의 조성에서 가벼운 기체만 빠진 것</b>입니다. 다만 <b>네온</b>은 다른 원소와 결합하지 않는 비활성 기체라 지구가 붙잡지 못해, 지각에서는 거의 찾아볼 수 없습니다.";
      if (s === 100 && !got) { got = true; window.sthState("stripGot", 1); mission(); }
    }
    function mission() {
      if (got) done("m3-4a");
      if (sorted) done("m3-4b");
      if (got && sorted) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>우주 조성에서 수소·헬륨만 빼면 곧바로 <b>산소·탄소·철·규소</b>가 드러납니다. 지각과 생명체의 재료 목록이 그대로 나옵니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("c-s").addEventListener("input", function (e) { s = +e.target.value; $("c-s-val").textContent = s + "%"; draw(); });
    window.sthSort({
      mount: "s3-sort",
      buckets: [
        { id: "u", label: "우주 전체", sub: "분석표 B" },
        { id: "k", label: "지각", sub: "분석표 A" },
        { id: "b", label: "생명체", sub: "분석표 C" }
      ],
      items: [
        { t: "수소 73.8% · 헬륨 24.9%", a: "u", why: "빅뱅이 만든 두 원소가 질량의 98.7%를 차지합니다." },
        { t: "헬륨이 질량의 4분의 1을 차지한다", a: "u", why: "헬륨이 이만큼 많은 곳은 우주 전체뿐입니다.", hint: "지구는 헬륨을 붙잡지 못했습니다." },
        { t: "산소 46.6% · 규소 27.7% · 알루미늄 8.1%", a: "k", why: "규산염 광물의 주성분입니다." },
        { t: "규소가 질량의 4분의 1을 넘는다", a: "k", why: "규소가 이만큼 많은 곳은 암석뿐입니다.", hint: "사람 몸의 규소는 0.002%였습니다." },
        { t: "산소 65% · 탄소 18.5% · 수소 9.5% · 질소 3.2%", a: "b", why: "물과 탄소 화합물로 이루어진 몸의 조성입니다." },
        { t: "탄소가 질량의 5분의 1 가까이 된다", a: "b", why: "탄소가 이만큼 많은 곳은 생명체뿐입니다. 우주에서는 0.24%, 지각에서는 0.02%입니다.", hint: "탄소는 어디에서 유난히 많았나요?" }
      ],
      doneText: "이름표를 모두 되찾았습니다.",
      onDone: function () { sorted = true; window.sthState("stripSort", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 */
  function finish() { window.sthState("r3", "해결 · A=지각, B=우주, C=사람의 몸 — 지구는 수소·헬륨을 놓쳤다"); }
  function showEnd(i) {
    if (i !== 4) return;
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 지각의 1위는 산소(46.6%), 2위가 규소(27.7%)입니다."
        : "정답은 ㉡ 입니다. 지각의 1위는 <b>산소 46.6%</b>, 2위가 규소 27.7%이고, 수소는 0.14%뿐입니다.");
    ep.clear(4);
  }
  ep.onShow(showEnd);
  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅱ-1] 이야기 ③ 존재비 저울",
    items: [
      { id: "c1", label: "우주와 지각의 존재비가 다른 까닭", hint: "‘탈출 속도’와 ‘규산염’이라는 말을 넣어, 수소가 사라지고 산소·규소가 남은 과정을 쓰세요." },
      { id: "c2", label: "생명체의 존재비가 지각과도 다른 까닭", hint: "지각에 그렇게 흔한 규소가 사람 몸에는 거의 없고, 지각에 드문 탄소가 몸에는 18.5%나 되는 까닭을 쓰세요." }
    ]
  });
  if (ep.at() === 4) showEnd(4);
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅱ-1] 자연의 구성 원소 — 정리",
  recap: [
    { key: "r1", label: "① 우주가 남긴 지문" },
    { key: "r2", label: "② 별의 부엌" },
    { key: "r3", label: "③ 존재비 저울" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "빅뱅의 3분, 별의 일생, 그리고 지구의 크기. 세 이야기를 ‘지구와 생명의 역사는 우주 역사의 …’로 이어지는 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-2-1", unitLabel: "[통합과학1 Ⅱ-1] 자연의 구성 원소",
  rows: [
    { key: "r1", label: "① 우주가 남긴 지문" },
    { key: "r2", label: "② 별의 부엌" },
    { key: "r3", label: "③ 존재비 저울" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
