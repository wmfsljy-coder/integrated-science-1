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
    var X0 = 70, X1 = 860, LO = 380, HI = 700;
    function px(nm) { return X0 + (nm - LO) / (HI - LO) * (X1 - X0); }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var bandTop = 52, bandH = 56;
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 61 });
      KT.pill(ctx, mode === "cont" ? "백열전구의 스펙트럼 — 연속 스펙트럼" : (mode === "emis" ? "가열한 수소·헬륨 기체의 스펙트럼 — 방출 스펙트럼" : "별빛(태양)의 스펙트럼 — 흡수 스펙트럼"),
        16, 30, { s: 13, c: KC.blue });
      /* 광원 표시 */
      if (mode === "cont") KT.glow(ctx, 862, 26, 5, "rgba(255,220,150,.98)", 3.6);
      else if (mode === "emis") KT.glow(ctx, 862, 26, 5, "rgba(255,120,190,.95)", 3.6);
      else KT.sun(ctx, 862, 26, 5);
      /* 스펙트럼 띠 — 빛나는 띠 */
      ctx.save(); ctx.shadowColor = mode === "emis" ? "rgba(255,120,190,.45)" : "rgba(255,240,200,.35)"; ctx.shadowBlur = 22;
      ctx.fillStyle = "#05070f"; ctx.fillRect(X0, bandTop, X1 - X0, bandH); ctx.restore();
      for (var x = X0; x < X1; x++) {
        var nm = LO + (x - X0) / (X1 - X0) * (HI - LO), I = inten(nm);
        if (mode === "emis") { if (I > 0.08) { ctx.globalAlpha = clamp(I, 0, 1); ctx.fillStyle = wlRGB(nm); ctx.fillRect(x, bandTop, 1, bandH); ctx.globalAlpha = 1; } }
        else { ctx.fillStyle = wlRGB(nm); ctx.globalAlpha = clamp(I, 0, 1); ctx.fillRect(x, bandTop, 1, bandH); ctx.globalAlpha = 1; }
      }
      var sh = ctx.createLinearGradient(0, bandTop, 0, bandTop + bandH); sh.addColorStop(0, "rgba(255,255,255,.18)"); sh.addColorStop(0.3, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(0,0,0,.25)");
      ctx.fillStyle = sh; ctx.fillRect(X0, bandTop, X1 - X0, bandH);
      ctx.strokeStyle = "rgba(220,226,255,.4)"; ctx.lineWidth = 1.5; ctx.strokeRect(X0, bandTop, X1 - X0, bandH);
      /* 세기 그래프 — 곡선 아래를 무지개빛으로 */
      var gy0 = 140, gy1 = 282;
      ctx.fillStyle = "rgba(255,255,255,.03)"; ctx.fillRect(X0, gy0, X1 - X0, gy1 - gy0);
      for (var gl = 1; gl <= 4; gl++) KT.line(ctx, { x: X0, y: gy1 - gl * (gy1 - gy0) / 4 }, { x: X1, y: gy1 - gl * (gy1 - gy0) / 4 }, KC.grid, 1);
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X0, gy0); ctx.lineTo(X0, gy1); ctx.lineTo(X1, gy1); ctx.stroke();
      KT.t(ctx, "빛의 세기", X0 - 8, gy0 + 6, { s: 10.5, c: KC.mute, a: "right", w: "700" });
      var rb = ctx.createLinearGradient(X0, 0, X1, 0);
      for (var q = 0; q <= 8; q++) rb.addColorStop(q / 8, wlRGB(LO + q / 8 * (HI - LO)));
      ctx.beginPath(); ctx.moveTo(X0, gy1);
      for (var k = 0; k <= X1 - X0; k++) {
        var nm2 = LO + k / (X1 - X0) * (HI - LO), yy = gy1 - clamp(inten(nm2), 0, 1.15) / 1.2 * (gy1 - gy0);
        ctx.lineTo(X0 + k, yy);
      }
      ctx.lineTo(X1, gy1); ctx.closePath(); ctx.globalAlpha = 0.3; ctx.fillStyle = rb; ctx.fill(); ctx.globalAlpha = 1;
      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 8; ctx.strokeStyle = "#e8f6ff"; ctx.lineWidth = 2; ctx.beginPath();
      for (k = 0; k <= X1 - X0; k++) {
        var nm3 = LO + k / (X1 - X0) * (HI - LO), y3 = gy1 - clamp(inten(nm3), 0, 1.15) / 1.2 * (gy1 - gy0);
        if (k === 0) ctx.moveTo(X0 + k, y3); else ctx.lineTo(X0 + k, y3);
      }
      ctx.stroke(); ctx.restore();
      /* 눈금 */
      for (var t = 400; t <= 700; t += 50) {
        var gx = px(t);
        ctx.strokeStyle = KC.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy1); ctx.lineTo(gx, gy1 + 5); ctx.stroke();
        KT.t(ctx, t + "", gx, gy1 + 19, { s: 10.5, c: KC.mute, a: "center", w: "700" });
      }
      KT.t(ctx, "파장 (nm)", X1, gy1 + 34, { s: 11, c: KC.mute, a: "right" });
      /* 커서 */
      var cx = px(wl);
      ctx.save(); ctx.shadowColor = KC.orange; ctx.shadowBlur = 8;
      ctx.strokeStyle = KC.orange; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(cx, bandTop - 12); ctx.lineTo(cx, gy1); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      KT.glow(ctx, cx, bandTop - 16, 4, "rgba(255,179,92,.98)", 3);
      var lab = wl + " nm", labR = cx > (X0 + X1) / 2;
      KT.pill(ctx, lab, labR ? cx - 8 : cx + 8, bandTop + bandH + 20, { s: 12, c: KC.orange, a: labR ? "right" : "left" });
      /* 찾아낸 표시 */
      KT.pill(ctx, (got.h ? "✅" : "⬜") + " 수소 656 nm", X0, 326, { s: 12, c: got.h ? KC.green : KC.mute });
      KT.pill(ctx, (got.he ? "✅" : "⬜") + " 헬륨 588 nm", X0 + 180, 326, { s: 12, c: got.he ? KC.green : KC.mute });
      KT.t(ctx, "선의 자리가 원소의 지문입니다", X1, 346, { s: 11, c: KC.mute, a: "right", w: "600" });
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
    function photon(x, y, ang, len) {
      var dx = Math.cos(ang) * len, dy = Math.sin(ang) * len;
      ctx.save(); ctx.strokeStyle = "rgba(255,226,140,.9)"; ctx.lineWidth = 1.6; ctx.shadowColor = "#ffd36b"; ctx.shadowBlur = 6;
      ctx.beginPath();
      for (var s = 0; s <= 10; s++) { var f = s / 10, w = Math.sin(f * Math.PI * 4) * 2.5; var px = x + dx * f - Math.sin(ang) * w, py = y + dy * f + Math.cos(ang) * w; if (s) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke(); ctx.restore();
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var T = Math.pow(10, e), st = stage(T), r = ratio(T), Y = heY(T), hot = clamp((e - 3) / 10, 0, 1);
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 67 });
      /* 뜨거울수록 우주 전체가 달아오른다 */
      var pg = ctx.createRadialGradient(440, 180, 20, 440, 180, 520);
      pg.addColorStop(0, "rgba(255," + Math.round(120 + 100 * hot) + ",60," + (0.08 + 0.32 * hot) + ")"); pg.addColorStop(1, "rgba(255,90,40,0)");
      ctx.fillStyle = pg; ctx.fillRect(0, 0, W, H);
      glowText(ctx, SNAME[st], 450, 34, { s: 17, w: "800", a: "center", c: KC.yellow, blur: 10 });

      /* 왼쪽 카드 — 온도와 시간 */
      glass(ctx, 30, 56, 250, 76, 14, "rgba(255,179,92,.45)", 0.08);
      text(ctx, "우주의 온도", 42, 78, { s: 11, c: KC.mute });
      glowText(ctx, sci(T, 2) + " K", 42, 112, { s: 21, w: "900", c: KC.orange, blur: 10 });
      glass(ctx, 30, 142, 250, 76, 14, "rgba(182,156,255,.45)", 0.08);
      text(ctx, "빅뱅 이후 흐른 시간", 42, 164, { s: 11, c: KC.mute });
      glowText(ctx, timeStr(T), 42, 198, { s: 21, w: "900", c: KC.violet, blur: 10 });

      /* 가운데 — 입자 상자 */
      var bx = 306, by = 56, bw = 268, bh = 250;
      ctx.save(); ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 16); ctx.clip();
      var bg = ctx.createRadialGradient(bx + bw / 2, by + bh / 2, 10, bx + bw / 2, by + bh / 2, bw * 0.75);
      bg.addColorStop(0, "rgba(255," + Math.round(140 + 80 * hot) + ",80," + (0.06 + 0.3 * hot) + ")"); bg.addColorStop(1, "rgba(10,12,40,.5)");
      ctx.fillStyle = bg; ctx.fillRect(bx, by, bw, bh);
      var cx = bx + bw / 2, cy = by + bh / 2 - 6, j;
      if (st <= 3) for (i = 0; i < 7; i++) { var pa = i * 0.9 + tm * 0.002 * (i % 2 ? 1 : -1); photon(cx - 110 + ((i * 47 + tm * 0.05) % 220), by + 20 + (i * 31) % (bh - 60), pa, 16); }
      if (st === 0) {
        for (i = 0; i < 24; i++) { j = jig(i, 5); KT.glow(ctx, cx + POS[i][0] * 1.5 + j[0], cy + POS[i][1] * 1.4 + j[1], 3, i % 3 === 0 ? "rgba(182,156,255,.95)" : "rgba(63,211,195,.95)", 3); }
      } else if (st === 1 || st === 2) {
        var nn = Math.max(1, Math.round(14 * r / (1 + r)));
        for (i = 0; i < 14; i++) {
          var p = POS[i]; j = jig(i, 3);
          if (i < nn) neutron(ctx, cx + p[0] * 1.45 + j[0], cy + p[1] * 1.35 + j[1], 9); else proton(ctx, cx + p[0] * 1.45 + j[0], cy + p[1] * 1.35 + j[1], 9);
        }
      } else if (st === 3) {
        j = jig(1, 2);
        proton(ctx, cx - 56 + j[0], cy - 40 + j[1], 10); neutron(ctx, cx - 38 + j[0], cy - 40 + j[1], 10);
        neutron(ctx, cx - 56 + j[0], cy - 22 + j[1], 10); proton(ctx, cx - 38 + j[0], cy - 22 + j[1], 10);
        KT.pill(ctx, "⁴He", cx - 47, cy - 60, { a: "center", s: 11, c: KC.violet });
        for (i = 0; i < 10; i++) { j = jig(i + 3, 3); proton(ctx, cx + 10 + (i % 5) * 24 + j[0], cy - 34 + Math.floor(i / 5) * 26 + j[1], 9); }
        for (i = 0; i < 8; i++) { j = jig(i + 20, 6); KT.glow(ctx, cx - 60 + i * 26 + j[0], cy + 42 + j[1], 2.6, "rgba(127,211,255,.95)", 3); }
      } else {
        var oa = tm * 0.003;
        proton(ctx, cx - 50, cy - 34, 10); neutron(ctx, cx - 32, cy - 34, 10);
        neutron(ctx, cx - 50, cy - 16, 10); proton(ctx, cx - 32, cy - 16, 10);
        ctx.strokeStyle = "rgba(127,211,255,.45)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(cx - 41, cy - 25, 34, 26, 0, 0, Math.PI * 2); ctx.stroke();
        KT.glow(ctx, cx - 41 + Math.cos(oa) * 34, cy - 25 + Math.sin(oa) * 26, 3, "rgba(127,211,255,.98)", 3);
        KT.glow(ctx, cx - 41 + Math.cos(oa + Math.PI) * 34, cy - 25 + Math.sin(oa + Math.PI) * 26, 3, "rgba(127,211,255,.98)", 3);
        KT.pill(ctx, "헬륨 원자", cx - 41, cy + 24, { a: "center", s: 11, c: KC.violet });
        proton(ctx, cx + 56, cy - 25, 9);
        ctx.beginPath(); ctx.ellipse(cx + 56, cy - 25, 26, 20, 0, 0, Math.PI * 2); ctx.stroke();
        KT.glow(ctx, cx + 56 + Math.cos(-oa * 1.3) * 26, cy - 25 + Math.sin(-oa * 1.3) * 20, 3, "rgba(127,211,255,.98)", 3);
        KT.pill(ctx, "수소 원자", cx + 56, cy + 24, { a: "center", s: 11, c: KC.orange });
        for (i = 0; i < 3; i++) {
          var fx = bx + 24 + ((tm * 0.12 + i * 70) % (bw - 60));
          KT.arrow(ctx, { x: bx + 18, y: cy + 62 + i * 14 }, { x: bx + bw - 18, y: cy + 62 + i * 14 }, "rgba(255,211,107,.55)", 2, 9);
          KT.glow(ctx, fx, cy + 62 + i * 14, 2.4, "rgba(255,240,190,.98)", 3);
        }
      }
      ctx.restore();
      ctx.strokeStyle = "rgba(200,210,255,.35)"; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 16); ctx.stroke(); ctx.setLineDash([]);
      var cap = st === 0 ? "쿼크 · 전자 · 중성미자" : (st <= 2 ? "🔴 양성자 " + (14 - Math.max(1, Math.round(14 * r / (1 + r)))) + "개   ⚪ 중성자 " + Math.max(1, Math.round(14 * r / (1 + r))) + "개" : (st === 3 ? "헬륨 원자핵 + 양성자(수소 원자핵) + 자유 전자" : "빛이 곧게 뻗어 나간다 → 우주 배경 복사"));
      KT.pill(ctx, cap, cx, by + bh - 12, { a: "center", s: 11, c: st === 4 ? KC.yellow : KC.ink, box: [bx, bx + bw] });

      /* 오른쪽 — 비율 */
      var rx = 598, rw = 272;
      text(ctx, "중성자 : 양성자", rx, 76, { s: 12, w: "800", c: KC.ink });
      if (st === 0) text(ctx, "아직 없음", rx, 102, { s: 17, w: "900", c: KC.mute });
      else glowText(ctx, "1 : " + (1 / r).toFixed(1), rx, 104, { s: 20, w: "900", c: KC.green, blur: 8 });
      text(ctx, "원자핵의 질량비", rx, 140, { s: 12, w: "800", c: KC.ink });
      var by2 = 152, bh2 = 30;
      ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.beginPath(); ctx.roundRect(rx, by2, rw, bh2, 6); ctx.fill();
      if (Y > 0) {
        ctx.save(); ctx.beginPath(); ctx.roundRect(rx, by2, rw, bh2, 6); ctx.clip();
        var hg = ctx.createLinearGradient(0, by2, 0, by2 + bh2); hg.addColorStop(0, "#ff9a7a"); hg.addColorStop(1, "#b8402a");
        ctx.fillStyle = hg; ctx.fillRect(rx, by2, rw * (1 - Y), bh2);
        var vg = ctx.createLinearGradient(0, by2, 0, by2 + bh2); vg.addColorStop(0, "#d2c2ff"); vg.addColorStop(1, "#6a4ad0");
        ctx.fillStyle = vg; ctx.fillRect(rx + rw * (1 - Y), by2, rw * Y, bh2); ctx.restore();
        text(ctx, "■ 수소 " + ((1 - Y) * 100).toFixed(1) + "%", rx, by2 + 48, { s: 12, w: "800", c: KC.orange });
        text(ctx, "■ 헬륨 " + (Y * 100).toFixed(1) + "%", rx + 136, by2 + 48, { s: 12, w: "800", c: KC.violet });
        text(ctx, "= " + ((1 - Y) / Y).toFixed(2) + " : 1 — 증거물 ②와 일치", rx, by2 + 70, { s: 12, w: "800", c: KC.green });
      } else {
        text(ctx, "아직 헬륨이 없습니다", rx, by2 + 48, { s: 12, w: "800", c: KC.mute });
      }
      KT.pill(ctx, (got.a ? "✅" : "⬜") + " 헬륨이 만들어지는 순간", rx, 260, { s: 12, c: got.a ? KC.green : KC.mute });
      KT.pill(ctx, (got.b ? "✅" : "⬜") + " 빛이 풀려나는 순간", rx, 286, { s: 12, c: got.b ? KC.green : KC.mute });

      /* 아래 — 온도 눈금자 (왼쪽이 낮은 온도 = 슬라이더 방향과 같다) */
      var ax0 = 40, ax1 = 860, ay = 340;
      var ag = ctx.createLinearGradient(ax0, 0, ax1, 0); ag.addColorStop(0, "#5fa8ff"); ag.addColorStop(0.5, "#ffd36b"); ag.addColorStop(1, "#ff6b4a");
      ctx.save(); ctx.shadowColor = "rgba(255,200,140,.6)"; ctx.shadowBlur = 8; ctx.strokeStyle = ag; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.stroke(); ctx.restore();
      function ex(ee) { return ax0 + (ee - 3) / 10 * (ax1 - ax0); }
      var MARK = [[log10(TREC), "재결합"], [log10(TNUC), "헬륨 생성"], [log10(TF), "비가 굳는 때"], [12, "쿼크 시대 끝"]];
      for (i = 0; i < MARK.length; i++) {
        var mx = ex(MARK[i][0]);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(mx, ay - 7); ctx.lineTo(mx, ay + 7); ctx.stroke();
        KT.t(ctx, MARK[i][1], clamp(mx, ax0 + 40, ax1 - 40), ay + 22, { s: 10.5, c: KC.green, a: "center", w: "800" });
      }
      var hx = ex(e);
      KT.glow(ctx, hx, ay, 6, "rgba(255,240,200,.98)", 3);
      ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, ay, 9, 0, Math.PI * 2); ctx.stroke();
      KT.t(ctx, "◀ 차가움 (나중)", ax0, ay - 14, { s: 10.5, c: KC.mute, w: "700" });
      KT.t(ctx, "뜨거움 (빅뱅 직후) ▶", ax1, ay - 14, { s: 10.5, c: KC.mute, a: "right", w: "700" });
      KT.warn(ctx, 884, 30, "⚠ 입자 수·크기는 실제 비율이 아님", "right");
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
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 71 });
      glass(ctx, 600, 44, 270, 200, 16, "rgba(200,210,255,.25)", 0.06);
      KT.pill(ctx, "핵자 하나당 결합 에너지 (MeV) — 클수록 단단히 묶인 원자핵", 16, 28, { s: 12.5, c: KC.blue, box: [0, 590] });
      var gx0 = 60, gx1 = 560, gy0 = 48, gy1 = 232, mx = 8.2;
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
      for (var g = 0; g <= 8; g += 2) {
        var yy = gy1 - g / mx * (gy1 - gy0);
        KT.line(ctx, { x: gx0, y: yy }, { x: gx1, y: yy }, KC.grid, 1);
        KT.t(ctx, g + "", gx0 - 8, yy + 4, { s: 10, c: KC.mute, a: "right", w: "700" });
      }
      var bw = (gx1 - gx0) / 12;
      for (var a = 1; a <= 12; a++) {
        var d = NUC[a], x = gx0 + (a - 1) * bw + 4, ww = bw - 8, sel = a === A;
        var hh = d.ok ? d.ba / mx * (gy1 - gy0) : 0;
        if (d.ok) {
          if (hh > 0) {
            ctx.save(); ctx.shadowColor = sel ? KC.blue : "rgba(63,211,195,.6)"; ctx.shadowBlur = sel ? 16 : 6;
            var bg = ctx.createLinearGradient(0, gy1 - hh, 0, gy1); bg.addColorStop(0, sel ? "#bfe9ff" : "#7ff0d8"); bg.addColorStop(1, sel ? "#2f7fd0" : "#167a6a");
            ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, gy1 - hh, ww, hh, [5, 5, 0, 0]); ctx.fill(); ctx.restore();
          } else if (sel) { KT.glow(ctx, x + ww / 2, gy1 - 3, 3, "rgba(127,211,255,.95)", 3); }
        } else {
          ctx.fillStyle = sel ? "rgba(255,107,129,.18)" : "rgba(255,107,129,.07)"; ctx.fillRect(x, gy0 + 20, ww, gy1 - gy0 - 20);
          ctx.save(); if (sel) { ctx.shadowColor = KC.red; ctx.shadowBlur = 12; }
          ctx.strokeStyle = sel ? KC.red : "rgba(255,107,129,.5)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
          ctx.strokeRect(x, gy0 + 20, ww, gy1 - gy0 - 20); ctx.setLineDash([]); ctx.restore();
          text(ctx, "✕", x + ww / 2, (gy0 + gy1) / 2 + 8, { s: 20, w: "900", a: "center", c: KC.red });
          text(ctx, "벽", x + ww / 2, gy0 + 14, { s: 11, w: "900", a: "center", c: KC.red });
        }
        KT.t(ctx, a + "", x + ww / 2, gy1 + 18, { s: 10.5, c: sel ? KC.blue : KC.mute, a: "center", w: sel ? "900" : "600" });
      }
      KT.t(ctx, "질량수 A", gx1, gy1 + 36, { s: 11, c: KC.mute, a: "right" });

      /* 오른쪽 — 고른 원자핵 그림 */
      var d2 = NUC[A], px2 = 735, py2 = 128;
      KT.pill(ctx, "조립대", 608, 28, { s: 12.5, c: KC.blue });
      var tot = d2.z + d2.k, cols = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(tot)))), rows = Math.ceil(tot / cols);
      var halo = ctx.createRadialGradient(px2, py2, 4, px2, py2, 70);
      halo.addColorStop(0, d2.ok ? "rgba(127,211,255,.22)" : "rgba(255,107,129,.25)"); halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(px2, py2, 70, 0, Math.PI * 2); ctx.fill();
      var tps = [], pz = d2.z, nk = d2.k;
      while (pz > 0 || nk > 0) { if (pz > 0) { tps.push(1); pz--; } if (nk > 0) { tps.push(0); nk--; } }
      for (var i = 0; i < tot; i++) {
        var cc = i % cols, rr = Math.floor(i / cols), sp = d2.ok ? 18 : 26;
        var xx = px2 - (cols - 1) * sp / 2 + cc * sp + (rr % 2 ? 4 : 0), yy2 = py2 - (rows - 1) * sp / 2 + rr * sp;
        if (tps[i]) proton(ctx, xx, yy2, 11); else neutron(ctx, xx, yy2, 11);
      }
      if (!d2.ok) { ctx.save(); ctx.strokeStyle = KC.red; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px2, py2, 52, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      KT.pill(ctx, d2.n + " · " + d2.nm, 735, 72, { a: "center", s: 13.5, c: d2.ok ? KC.ink : KC.red, box: [600, 870] });
      text(ctx, "양성자 " + d2.z + " · 중성자 " + d2.k, 735, 210, { s: 11.5, w: "800", a: "center", c: KC.mute });
      text(ctx, d2.ok ? "결합 에너지 " + d2.ba.toFixed(3) + " MeV/핵자" : "안정한 원자핵 없음", 735, 230, { s: 11.5, w: "800", a: "center", c: d2.ok ? KC.green : KC.red });

      KT.pill(ctx, (got.a ? "✅" : "⬜") + " 첫 번째 벽", 60, 292, { s: 12.5, c: got.a ? KC.green : KC.mute });
      KT.pill(ctx, (got.b ? "✅" : "⬜") + " 두 번째 벽", 220, 292, { s: 12.5, c: got.b ? KC.green : KC.mute });
      KT.t(ctx, "🔴 양성자   ⚪ 중성자", 860, 292, { s: 11.5, c: KC.mute, a: "right" });
      KT.t(ctx, "빅뱅 핵합성은 수소 → 중수소 → 헬륨 순서로 한 칸씩 올라갑니다. 벽을 만나면 더 못 갑니다.", 60, 322, { s: 11.5, c: KC.mute, w: "600" });
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var T = coreT(M), k = reached(M);
      KT.stage(ctx, 0, 0, W, H, "space", { seed: 79 });
      KT.pill(ctx, "별의 부엌 — 질량 " + M.toFixed(1) + " M☉", 16, 30, { s: 13, c: KC.blue });
      text(ctx, "일생 동안 중심이 오르는 최고 온도", 40, 60, { s: 11, c: KC.mute });
      glowText(ctx, sci(T, 2) + " K", 40, 90, { s: 20, w: "900", c: KC.red, blur: 10 });
      /* 별 — 빛무리 + 겉면 + 양파 껍질 같은 연소층 */
      var cx = 160, cy = 186, r = 24 + 42 * Math.pow(M / 30, 0.33), sc = starCol(M);
      var halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.2);
      halo.addColorStop(0, sc[1]); halo.addColorStop(0.35, "rgba(255,220,160,.18)"); halo.addColorStop(1, "rgba(255,220,160,0)");
      ctx.globalAlpha = 0.55; ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      var disk = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
      disk.addColorStop(0, sc[0]); disk.addColorStop(0.6, sc[1]); disk.addColorStop(1, sc[2]);
      ctx.fillStyle = disk; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      var core = Math.max(7, r * 0.22), shell = (r * 0.62 - core) / Math.max(1, k);
      for (var L2 = 0; L2 < k; L2++) {
        var rad = core + shell * (k - L2);
        ctx.strokeStyle = LAYER[L2]; ctx.globalAlpha = 0.75; ctx.lineWidth = Math.max(2, shell * 0.7);
        ctx.beginPath(); ctx.arc(cx, cy, rad - shell * 0.5, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
      KT.glow(ctx, cx, cy, core, "rgba(255,90,70,.95)", 1.8);
      KT.pill(ctx, "붉은 점은 핵융합이 일어나는 중심핵", 40, 270, { s: 10.5, c: KC.mute });
      for (var i = 0; i < 5; i++) {
        var yy = 54 + i * 46, on = i < k;
        if (on) { ctx.save(); ctx.shadowColor = LAYER[i]; ctx.shadowBlur = 12; ctx.fillStyle = "rgba(14,20,50,.9)"; ctx.beginPath(); ctx.roundRect(330, yy, 540, 38, 12); ctx.fill(); ctx.restore(); }
        glass(ctx, 330, yy, 540, 38, 12, on ? LAYER[i] : "rgba(200,210,255,.18)", on ? 0.12 : 0.05);
        if (on) KT.glow(ctx, 346, yy + 19, 3.2, "rgba(255,240,200,.95)", 2.4);
        text(ctx, (on ? "✅ " : "⬜ ") + STEPS[i].a, 358, yy + 24, { s: 13, w: "800", c: on ? LAYER[i] : KC.mute });
        text(ctx, "점화 " + sci(STEPS[i].t, 1) + " K", 858, yy + 24, { s: 11.5, w: "800", a: "right", c: on ? KC.ink : KC.dim });
      }
      var made = els(k);
      text(ctx, "이 별이 만들어 내는 원소", 40, 306, { s: 12, w: "800", c: KC.ink });
      for (var j = 0; j < made.length; j++) {
        var bx = 40 + j * 54;
        ctx.save(); ctx.shadowColor = KC.violet; ctx.shadowBlur = 10;
        var eg = ctx.createLinearGradient(0, 318, 0, 348); eg.addColorStop(0, "rgba(182,156,255,.45)"); eg.addColorStop(1, "rgba(90,60,200,.35)");
        ctx.fillStyle = eg; ctx.beginPath(); ctx.roundRect(bx, 318, 46, 30, 10); ctx.fill(); ctx.restore();
        ctx.strokeStyle = "rgba(210,195,255,.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bx, 318, 46, 30, 10); ctx.stroke();
        text(ctx, made[j], bx + 23, 338, { s: 13, w: "900", a: "center", c: "#ffffff" });
      }
      if (k >= 5) text(ctx, "+ 초신성·중성자별 충돌에서 더 무거운 원소", 40 + made.length * 54 + 6, 338, { s: 11.5, w: "800", c: KC.red });
      text(ctx, "주계열 수명 " + lifeStr(M) + "  ·  최후: " + fate(M), 40, 378, { s: 12, w: "800", c: KC.mute });
      KT.warn(ctx, 884, 34, "⚠ 별·연소층 크기는 실제 비율이 아님", "right");
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
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 83 });
      KT.pill(ctx, "핵자 하나당 결합 에너지 (MeV) — 높을수록 단단히 묶인 원자핵", 16, 30, { s: 13, c: KC.blue });
      ctx.fillStyle = "rgba(255,255,255,.03)"; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
      var g;
      for (g = 0; g <= 9; g += 3) {
        KT.line(ctx, { x: X0, y: gy(g) }, { x: X1, y: gy(g) }, KC.grid, 1);
        KT.t(ctx, g + "", X0 - 8, gy(g) + 4, { s: 10.5, c: KC.mute, a: "right", w: "700" });
      }
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.stroke();
      for (g = 0; g <= 238; g += 40) KT.t(ctx, g + "", gx(g), Y1 + 18, { s: 10.5, c: KC.mute, a: "center", w: "700" });
      KT.t(ctx, "질량수 A", X1, Y1 + 36, { s: 11, c: KC.mute, a: "right" });
      /* 곡선 아래 — 융합 쪽(초록) · 분열 쪽(보라) */
      var a;
      ctx.beginPath(); ctx.moveTo(gx(1), Y1);
      for (a = 1; a <= 56; a++) ctx.lineTo(gx(a), gy(ba(a)));
      ctx.lineTo(gx(56), Y1); ctx.closePath();
      var fg = ctx.createLinearGradient(0, Y0, 0, Y1); fg.addColorStop(0, "rgba(63,211,163,.35)"); fg.addColorStop(1, "rgba(63,211,163,.03)");
      ctx.fillStyle = fg; ctx.fill();
      ctx.beginPath(); ctx.moveTo(gx(56), Y1);
      for (a = 56; a <= 238; a++) ctx.lineTo(gx(a), gy(ba(a)));
      ctx.lineTo(gx(238), Y1); ctx.closePath();
      var vg2 = ctx.createLinearGradient(0, Y0, 0, Y1); vg2.addColorStop(0, "rgba(182,156,255,.32)"); vg2.addColorStop(1, "rgba(182,156,255,.03)");
      ctx.fillStyle = vg2; ctx.fill();
      ctx.save(); ctx.shadowColor = KC.green; ctx.shadowBlur = 10; ctx.strokeStyle = "#bff7e6"; ctx.lineWidth = 2.6; ctx.beginPath();
      for (a = 1; a <= 238; a++) { var xx = gx(a), yy = gy(ba(a)); if (a === 1) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
      ctx.stroke(); ctx.restore();
      ctx.save(); ctx.shadowColor = KC.yellow; ctx.shadowBlur = 8;
      ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(gx(56), Y0); ctx.lineTo(gx(56), Y1); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      KT.pill(ctx, "철-56 (꼭대기)", gx(56) + 8, Y0 + 14, { s: 11, c: KC.yellow });
      KT.pill(ctx, "융합하면 에너지가 나온다", gx(56) - 10, Y1 - 12, { s: 11.5, a: "right", c: KC.green });
      KT.pill(ctx, "분열하면 에너지가 나온다", gx(56) + 10, Y1 - 12, { s: 11.5, c: KC.violet });
      [4, 12, 16, 56, 238].forEach(function (a2) { KT.glow(ctx, gx(a2), gy(ba(a2)), 2.4, "rgba(230,236,255,.9)", 2.4); });
      var b = ba(A);
      KT.glow(ctx, gx(A), gy(b), 6, "rgba(255,179,92,.98)", 3);
      ctx.strokeStyle = KC.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx(A), gy(b), 10, 0, Math.PI * 2); ctx.stroke();
      KT.pill(ctx, "A = " + A + " · " + b.toFixed(2) + " MeV", clamp(gx(A), X0 + 70, X1 - 70), Math.min(gy(b) - 16, Y1 - 36), { a: "center", s: 12, c: KC.orange });
      KT.pill(ctx, (got ? "✅" : "⬜") + " 곡선의 꼭대기 찾기", 70, 294, { s: 12.5, c: got ? KC.green : KC.mute });
      KT.t(ctx, "총 결합 에너지 = " + b.toFixed(2) + " × " + A + " = " + (b * A).toFixed(0) + " MeV", 850, 322, { s: 12, w: "800", a: "right", c: KC.ink });
      KT.t(ctx, "별은 이 곡선을 오르며 에너지를 얻습니다. 꼭대기에 닿으면 더 오를 데가 없습니다.", 70, 322, { s: 11.5, c: KC.mute, w: "600" });
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
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 89 });
      KT.pill(ctx, "몸무게 " + wkg + " kg을 원소별로 나누면", 16, 30, { s: 13, c: KC.blue });
      KT.pill(ctx, (got ? "✅" : "⬜") + " 별에서 온 질량 50 kg 넘기기", 884, 30, { s: 12, a: "right", c: got ? KC.green : KC.mute });
      var x0 = 150, x1 = 690, top = 44, rowH = 28;
      for (var i = 0; i < EL.length; i++) {
        var yy = top + i * rowH, e = EL[i], m = wkg * e.p / 100;
        text(ctx, e.n, x0 - 12, yy + 15, { s: 12.5, w: "800", a: "right", c: e.n === "수소" ? KC.orange : KC.ink });
        gbar(ctx, x0, yy + 2, x1 - x0, 18, (x1 - x0) * e.p / 70, v(e.c));
        text(ctx, m.toFixed(1) + " kg (" + e.p.toFixed(1) + "%)", x1 + 10, yy + 16, { s: 11.5, w: "800", c: KC.mute });
      }
      var big = wkg * 9.5 / 100, star = wkg - big, cy = 284;
      glass(ctx, 40, cy - 32, 380, 54, 14, "rgba(255,138,107,.6)", 0.1);
      KT.glow(ctx, 62, cy - 16, 3, "rgba(255,220,180,.95)", 3);
      text(ctx, "빅뱅에서 온 질량 (수소)", 74, cy - 12, { s: 11.5, w: "800", c: KC.orange });
      glowText(ctx, big.toFixed(1) + " kg", 404, cy + 12, { s: 20, w: "900", a: "right", c: KC.orange, blur: 10 });
      glass(ctx, 440, cy - 32, 420, 54, 14, "rgba(182,156,255,.6)", 0.1);
      KT.glow(ctx, 462, cy - 16, 3, "rgba(230,215,255,.95)", 3);
      text(ctx, "별에서 온 질량 (나머지 전부)", 474, cy - 12, { s: 11.5, w: "800", c: KC.violet });
      glowText(ctx, star.toFixed(1) + " kg", 844, cy + 12, { s: 20, w: "900", a: "right", c: KC.violet, blur: 10 });
      KT.t(ctx, "막대는 70%를 가득 찬 길이로 잡았습니다", 40, 244, { s: 11, c: KC.mute, w: "600" });
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
      var B = BODY[body], th = thr(), r = Math.min(B.r, 62), cx = 100, cy = 110, i, k;
      KT.stage(ctx, 0, 0, W, H, "space", { seed: 97 });
      KT.pill(ctx, B.n + " 의 대기 붙잡기 시험", 16, 30, { s: 13, c: KC.blue });
      /* 대기 빛무리 — 붙잡은 기체가 많을수록 두껍다 */
      var held = 0; for (i = 0; i < GAS.length; i++) if (!escapes(GAS[i])) held++;
      if (held > 0) {
        var ah = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 6 + held * 3);
        ah.addColorStop(0, "rgba(127,200,255," + (0.12 + held * 0.06) + ")"); ah.addColorStop(1, "rgba(127,200,255,0)");
        ctx.fillStyle = ah; ctx.beginPath(); ctx.arc(cx, cy, r + 6 + held * 3, 0, Math.PI * 2); ctx.fill();
      }
      /* 기체 입자 — 붙잡힌 것은 둘레를 돌고, 달아나는 것은 멀어지며 흐려진다 */
      for (i = 0; i < GAS.length; i++) {
        var gc = v(GAS[i].c), out = escapes(GAS[i]);
        for (k = 0; k < 3; k++) {
          var ph = (tm * 0.00025 * (1 + i * 0.15) + k / 3 + i * 0.13) % 1, an = (i * 1.3 + k * 2.1) + (out ? 0 : ph * Math.PI * 2);
          var rr2 = out ? r + 6 + ph * 70 : r + 5 + (i % 3) * 3 + k;
          var gx = cx + Math.cos(an) * rr2, gy = cy + Math.sin(an) * rr2 * 0.9;
          if (gy > 46 && gy < 174) { ctx.globalAlpha = out ? 1 - ph : 0.95; KT.glow(ctx, gx, gy, 1.8, gc, 2.6); ctx.globalAlpha = 1; }
        }
      }
      globe(B, cx, cy, r);
      KT.pill(ctx, B.n, 100, 198, { a: "center", s: 14, c: KC.ink });
      text(ctx, "탈출 속도", 100, 226, { s: 11, c: KC.mute, a: "center" });
      text(ctx, (B.esc / 1000).toFixed(2) + " km/s", 100, 250, { s: 16, w: "900", a: "center", c: KC.ink });
      text(ctx, "붙잡기 기준 = 탈출 속도 ÷ 6", 100, 280, { s: 10.5, c: KC.mute, a: "center" });
      glowText(ctx, Math.round(th).toLocaleString() + " m/s", 100, 304, { s: 14, w: "900", a: "center", c: KC.yellow, blur: 8 });
      /* 막대 */
      for (i = 0; i < GAS.length; i++) {
        var g = GAS[i], yy = 56 + i * 54, vv = vrms(g.m, T), o2 = vv > th;
        text(ctx, g.n, X0 - 12, yy + 20, { s: 12, w: "800", a: "right", c: KC.ink });
        gbar(ctx, X0, yy + 4, X1 - X0, 24, bx(vv) - X0, v(g.c));
        text(ctx, Math.round(vv).toLocaleString() + " m/s", X1 + 12, yy + 21, { s: 11.5, w: "800", c: KC.mute });
        text(ctx, o2 ? "달아남" : "붙잡힘", 870, yy + 21, { s: 12, w: "900", a: "right", c: o2 ? KC.red : KC.green });
      }
      /* 기준선 */
      var tx = bx(th), clipped = th > VMAX;
      ctx.save(); ctx.shadowColor = KC.yellow; ctx.shadowBlur = 10;
      ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(tx, 48); ctx.lineTo(tx, 326); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      KT.pill(ctx, clipped ? "기준선은 화면 밖 (" + Math.round(th).toLocaleString() + " m/s)" : "붙잡기 기준선",
        clamp(tx, X0 + 10, 726), 42, { s: 11, c: KC.yellow, a: clipped ? "right" : "left", box: [200, 900] });
      KT.t(ctx, "가로 눈금 0~5,000 m/s · 기준선을 넘어가면 오랜 세월에 걸쳐 우주로 달아납니다", 40, 352, { s: 11, c: KC.mute, w: "600" });
      text(ctx, (got.a ? "✅" : "⬜") + " 지구 조건", 530, 352, { s: 11.5, w: "800", c: got.a ? KC.green : KC.mute });
      text(ctx, (got.b ? "✅" : "⬜") + " 질소도 놓침", 650, 352, { s: 11.5, w: "800", c: got.b ? KC.green : KC.mute });
      text(ctx, (got.c ? "✅" : "⬜") + " 수소도 붙잡음", 870, 352, { s: 11.5, w: "800", a: "right", c: got.c ? KC.green : KC.mute });
      KT.t(ctx, "천체 크기·입자는 실제 비율이 아님", 40, 374, { s: 10, c: KC.dim, w: "600" });
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
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 101 });
      KT.pill(ctx, el + " 는(은) 어디에 얼마나 있을까 — 질량 백분율(로그 눈금)", 16, 30, { s: 13, c: KC.blue });
      /* 눈금 */
      var dec;
      for (dec = LOW; dec <= HIGH; dec++) {
        var gx = bx(Math.pow(10, dec));
        KT.line(ctx, { x: gx, y: 48 }, { x: gx, y: 246 }, KC.grid, 1);
        KT.t(ctx, (dec < 0 ? Math.pow(10, dec).toFixed(-dec) : String(Math.pow(10, dec))) + "%", gx, 266, { s: 10.5, c: KC.mute, a: "center", w: "700" });
      }
      for (var i = 0; i < 3; i++) {
        var row = ROWS[i], yy = 62 + i * 62, p = d[row[0]], bw = Math.max(2, bx(p) - X0), col = v(row[2]);
        text(ctx, RICON[i] + " " + row[1], X0 - 14, yy + 28, { s: 13, w: "800", a: "right", c: KC.ink });
        gbar(ctx, X0, yy + 6, X1 - X0, 34, bw, col);
        if (bw > 100) text(ctx, show(p), X0 + 10, yy + 29, { s: 13, w: "900", c: "#0b0f26" });
        else glowText(ctx, show(p), X0 + bw + 10, yy + 29, { s: 13, w: "900", c: KC.ink, blur: 6 });
      }
      KT.t(ctx, "한 칸 = 10배", X1 + 40, 286, { s: 10.5, c: KC.mute, a: "right" });
      KT.pill(ctx, (got.a ? "✅" : "⬜") + " 우주에만 흔한 것", 40, 302, { s: 11.5, c: got.a ? KC.green : KC.mute });
      KT.pill(ctx, (got.b ? "✅" : "⬜") + " 지각에만 흔한 것", 330, 302, { s: 11.5, c: got.b ? KC.green : KC.mute });
      KT.pill(ctx, (got.c ? "✅" : "⬜") + " 생명체에만 흔한 것", 620, 302, { s: 11.5, c: got.c ? KC.green : KC.mute });

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
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 103 });
      KT.pill(ctx, "우주 시료 100 g에서 수소·헬륨을 " + s + "% 날려 보냈을 때", 16, 30, { s: 13, c: KC.blue });
      /* 왼쪽 — 유리 시료병 안의 구성 */
      var sx = 60, sw = 150, sy = 54, sh = 220;
      ctx.save(); ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, [6, 6, 16, 16]); ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,.04)"; ctx.fillRect(sx, sy, sw, sh);
      var cur = sy;
      var segs = [[H0 / tot, ["#ffb0a0", "#d0503a"], "수소"], [HE / tot, ["#d8caff", "#6a4ad0"], "헬륨"], [rest / tot, ["#9ff5e0", "#178a74"], "나머지"]];
      for (i = 0; i < 3; i++) {
        var hh = segs[i][0] * sh;
        if (hh > 0.5) {
          var lg = ctx.createLinearGradient(sx, 0, sx + sw, 0); lg.addColorStop(0, segs[i][1][1]); lg.addColorStop(0.45, segs[i][1][0]); lg.addColorStop(1, segs[i][1][1]);
          ctx.fillStyle = lg; ctx.fillRect(sx, cur, sw, hh);
          ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(sx, cur, sw, 1.5);
        }
        if (hh > 18) text(ctx, segs[i][2] + " " + (segs[i][0] * 100).toFixed(1) + "%", sx + sw / 2, cur + hh / 2 + 5, { s: 11.5, w: "900", a: "center", c: "#0b0f26" });
        cur += hh;
      }
      ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(sx + 10, sy + 6, 5, sh - 14);
      ctx.restore();
      ctx.strokeStyle = "rgba(220,230,255,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, [6, 6, 16, 16]); ctx.stroke();
      /* 날아간 수소·헬륨 */
      if (s > 0) for (i = 0; i < Math.round(s / 10); i++) { var ux = sx + 20 + (i * 37) % (sw - 30), uy = sy - 6 - (i % 3) * 5; KT.glow(ctx, ux, uy, 1.8, i % 4 === 3 ? "rgba(214,200,255,.9)" : "rgba(255,170,150,.9)", 2.4); }
      KT.pill(ctx, "남은 시료 " + tot.toFixed(1) + " g", sx + sw / 2, sy + sh + 21, { a: "center", s: 12, c: KC.ink });
      /* 오른쪽 — 수소·헬륨을 뺀 나머지의 조성 */
      text(ctx, "수소·헬륨을 뺀 나머지의 조성", 270, 52, { s: 12.5, w: "800", c: KC.ink });
      var bx0 = 400, bx1 = 800;
      for (i = 0; i < Z.length; i++) {
        var yy = 64 + i * 26, frac = Z[i].p / ZSUM;
        text(ctx, Z[i].n, bx0 - 12, yy + 14, { s: 11.5, w: "800", a: "right", c: KC.ink });
        gbar(ctx, bx0, yy + 2, bx1 - bx0, 16, (bx1 - bx0) * frac / 0.45, v(Z[i].c));
        text(ctx, (frac * 100).toFixed(1) + "%", bx1 + 10, yy + 15, { s: 11, w: "800", c: i === 0 ? KC.blue : KC.mute });
      }
      glowText(ctx, "1위는 " + Z[0].n + " (" + (Z[0].p / ZSUM * 100).toFixed(1) + "%)", 270, 292, { s: 13, w: "900", c: KC.blue, blur: 8 });
      KT.t(ctx, CRUST, 270, 316, { s: 11.5, c: KC.mute, w: "600" });
      KT.pill(ctx, (got ? "✅" : "⬜") + " 1위 확인", 60, 326, { s: 12, c: got ? KC.green : KC.mute });

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
