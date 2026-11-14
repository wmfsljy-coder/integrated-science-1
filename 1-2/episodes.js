/* 통합과학1 Ⅰ-2 과학의 측정과 우리 사회 — 소단원별 이야기 세 편
   01 과녁에 남은 자국 / 02 1미터를 다시 정하는 회의 / 03 30 cm를 다투는 사람들
   공용 부품: ../assets/theme.js (sthUnit·sthState·sthGate·sthWork·setupCanvas·cssVar·drawArrow),
             ../assets/story.js (sthStory·sthMission·sthSort·sthOrder·sthPick), ../assets/share.js (sthShare) */
(function () {
"use strict";

window.sthUnit("is1-1-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
var CLIGHT = 299792458;

function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
function hline(ctx, x0, x1, y, col, w) {
  ctx.strokeStyle = col; ctx.lineWidth = w || 1;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
}
function dash(ctx, x0, x1, y, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
}
function vdash(ctx, x, y0, y1, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.setLineDash([]);
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
/* ---- 밝은 스튜디오 말투 (블록 모형 장면과 같은 도구: K.studio · K.card · K.bigText · K.iso) ---- */
var LT = KT.LT;
function lt(ctx, s, x, y, o) { o = o || {}; KT.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function floorShadow(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || 0.28) + ")"); g.addColorStop(0.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function metal(ctx, x0, y0, x1, y1, a, b, c) {
  var g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a || "#f6f8fb"); g.addColorStop(0.5, b || "#aab3c3"); g.addColorStop(1, c || "#5b6476"); return g;
}
/* 앞에서 비스듬히 내려다본 판(윗면이 조금 보이는 미니어처): 앞면 + 윗면 + 오른쪽 옆면 */
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w + d, y + h - d * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
/* 오른쪽 흰 판정 카드 한 벌 */
function sideCard(ctx, x, W, H, title) { KT.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
/* 빛나는 막대(값 막대) */
function glowBar(ctx, x, y, w, h, frac, col) {
  ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10;
  var g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, "rgba(255,255,255,.25)"); g.addColorStop(0.15, col); g.addColorStop(1, col);
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, Math.max(h * 0.6, w * clamp(frac, 0, 1)), h, h / 2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = "rgba(220,226,255,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.stroke();
}
/* 유리 카드 — 고른 카드는 빛난다 */
function card(ctx, x, y, w, h, on, col) {
  var c = v(col || "--brand");
  if (on) { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 18; ctx.fillStyle = "rgba(16,22,56,.92)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill(); ctx.restore(); }
  glass(ctx, x, y, w, h, 14, on ? c : "rgba(200,210,255,.22)", on ? 0.14 : 0.07);
}
var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function sup(n) {
  return String(n).split("").map(function (c) { return SUP[c] !== undefined ? SUP[c] : c; }).join("");
}
/* 오차 함수 — Abramowitz & Stegun 7.1.26 (소수점 아래 7자리까지 맞는 어림식) */
function erf(x) {
  var s = x < 0 ? -1 : 1; x = Math.abs(x);
  var t = 1 / (1 + 0.3275911 * x);
  var y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
/* 씨앗을 정해 둔 난수 — 다시 열어도 같은 측정값이 나오게 한다 */
function lcg(seed) {
  return function () { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
}

/* =========================================================================
   이야기 ① 과녁에 남은 자국
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 */
  window.sthGate({
    gate: "g1", key: "p1", title: "조사관의 첫 추리",
    question: "표적지 넉 장 가운데, <b>연습은 충분하고 총만 정비하면 되는</b> 선수는 누구일까요?",
    options: [
      "㉠ 가온 — 한가운데에 모였다",
      "㉡ 나래 — 오른쪽 위 한곳에 빈틈없이 모였다",
      "㉢ 다인 — 흩어졌지만 평균은 한가운데다",
      "㉣ 라온 — 치우친 채 넓게 흩어졌다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 사격 시뮬레이터 (계산 모형: 평균 = 조준 편향, 표준편차 = 손떨림) */
  (function () {
    var canvas = $("a-target"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var CX = 225, CY = 225, R = 150;                 /* 과녁 반지름 150 mm = 150 px */
    var ANG = -0.72;                                  /* 조준선이 틀어진 방향 — 오른쪽 위 */
    var bias = 0, noise = 20;
    var got = window.sthState("aShot") || { a: false, b: false };

    /* 평균이 정확히 0, 중심에서의 제곱평균거리가 정확히 1이 되도록 다듬은 10발의 흩어짐 */
    var U = (function () {
      var raw = [[0.62, -0.31], [-0.44, 0.78], [1.12, 0.36], [-0.85, -0.52], [0.21, 1.04],
                 [-1.06, 0.18], [0.48, -0.92], [-0.29, -1.11], [0.93, 0.71], [-0.72, -0.21]];
      var mx = 0, my = 0, i;
      for (i = 0; i < raw.length; i++) { mx += raw[i][0]; my += raw[i][1]; }
      mx /= raw.length; my /= raw.length;
      var s = 0;
      for (i = 0; i < raw.length; i++) s += Math.pow(raw[i][0] - mx, 2) + Math.pow(raw[i][1] - my, 2);
      s = Math.sqrt(s / raw.length);
      var out = [];
      for (i = 0; i < raw.length; i++) out.push([(raw[i][0] - mx) / s, (raw[i][1] - my) / s]);
      return out;
    })();

    function accurate() { return bias <= 10; }
    function precise() { return noise <= 8; }
    function who() {
      if (accurate() && precise()) return "가온";
      if (!accurate() && precise()) return "나래";
      if (accurate() && !precise()) return "다인";
      return "라온";
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, MK = 0.68, TR = 150 * MK, BH = TR + 12, BX = 250, BY = 148, LW = 512;   /* 1 mm = 0.68 px, 표적지는 오른쪽이 조금 뒤로 돌아간 모습 */
      var amx = Math.cos(ANG) * bias * MK, amy = Math.sin(ANG) * bias * MK;
      function SP(u, w2) { return { x: BX + 0.86 * u, y: BY - 0.17 * u + w2 }; }
      KT.studio(ctx, 0, 0, LW, H, { x: 258, y: 334, rx: 236, ry: 16 });
      /* 사격장 마루 — 얇은 나무 받침 */
      var fg = ctx.createLinearGradient(0, 258, 0, 328); fg.addColorStop(0, "#ead6b0"); fg.addColorStop(1, "#c99d68");
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(74, 258); ctx.lineTo(446, 258); ctx.lineTo(496, 328); ctx.lineTo(16, 328); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(120,72,30,.18)"; ctx.lineWidth = 1;
      for (i = 1; i < 6; i++) { var fy = 258 + i * 11.6, fk = (fy - 258) / 70; ctx.beginPath(); ctx.moveTo(74 - 58 * fk, fy); ctx.lineTo(446 + 50 * fk, fy); ctx.stroke(); }
      ctx.fillStyle = "#9a6a3c"; ctx.fillRect(16, 328, 480, 8);
      /* 이젤 뒷다리 */
      ctx.strokeStyle = "#8a5a2c"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(BX + 4, BY + 40); ctx.lineTo(BX + 40, 276); ctx.stroke();
      /* 표적지 두께(오른쪽·아래 옆면)와 그림자 */
      var c1 = SP(BH, -BH), c2 = SP(BH, BH), c3 = SP(-BH, BH);
      ctx.fillStyle = "rgba(20,30,50,.18)"; ctx.beginPath(); ctx.moveTo(c3.x + 14, c3.y + 10); ctx.lineTo(c2.x + 20, c2.y + 8); ctx.lineTo(c1.x + 20, c1.y + 8); ctx.lineTo(c1.x + 8, c1.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#b9a988"; ctx.beginPath(); ctx.moveTo(c1.x, c1.y); ctx.lineTo(c1.x + 8, c1.y - 4); ctx.lineTo(c2.x + 8, c2.y - 4); ctx.lineTo(c2.x, c2.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#a3936f"; ctx.beginPath(); ctx.moveTo(c3.x, c3.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c2.x + 8, c2.y - 4); ctx.lineTo(c3.x + 8, c3.y - 4); ctx.closePath(); ctx.fill();
      /* 표적지 앞면 — 판 좌표(u 가로, v 세로)로 그린다 */
      ctx.save(); ctx.transform(0.86, -0.17, 0, 1, BX, BY);
      var pg = ctx.createLinearGradient(-BH, -BH, BH, BH); pg.addColorStop(0, "#fffaf0"); pg.addColorStop(1, "#ece3cf");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(-BH, -BH, BH * 2, BH * 2, 5); ctx.fill();
      for (i = 0; i < 4; i++) {
        var rr = TR * (1 - i * 0.25), inner = i >= 2;
        ctx.fillStyle = inner ? "#1c1f2b" : "#fbf8f0";
        ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = inner ? "rgba(255,255,255,.6)" : "rgba(30,30,40,.7)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
      }
      KT.planet(ctx, 0, 0, 5, "#ff8787", "#a51111");
      /* 10발 — 총알 자국 */
      for (i = 0; i < U.length; i++) {
        var hx = amx + U[i][0] * noise * MK, hy = amy + U[i][1] * noise * MK;
        ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.beginPath(); ctx.arc(hx + 0.8, hy + 0.8, 6, 0, Math.PI * 2); ctx.fill();
        var hg = ctx.createRadialGradient(hx - 1.2, hy - 1.2, 0.4, hx, hy, 4.8); hg.addColorStop(0, "#5a6074"); hg.addColorStop(1, "#05060c");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, 4.8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#1c7ed6"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(hx, hy, 6.8, 0, Math.PI * 2); ctx.stroke();
      }
      /* 평균 자리와 조준이 틀어진 거리 */
      if (bias > 0) { ctx.strokeStyle = "#f59f00"; ctx.lineWidth = 2.4; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(amx, amy); ctx.stroke(); ctx.setLineDash([]); }
      ctx.strokeStyle = "#7048e8"; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(amx - 13, amy); ctx.lineTo(amx + 13, amy); ctx.moveTo(amx, amy - 13); ctx.lineTo(amx, amy + 13); ctx.stroke();
      ctx.restore();
      /* 이젤 앞다리와 받침턱 */
      var l1 = SP(-BH * 0.62, BH), l2 = SP(BH * 0.62, BH);
      ctx.strokeStyle = "#a8773f"; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(l1.x, l1.y - 30); ctx.lineTo(l1.x - 18, 312); ctx.moveTo(l2.x, l2.y - 30); ctx.lineTo(l2.x + 16, 290); ctx.stroke();
      ctx.lineCap = "butt";
      ctx.strokeStyle = "#7a5426"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(c3.x - 4, c3.y + 4); ctx.lineTo(c2.x + 10, c2.y); ctx.stroke();
      var mp = SP(amx, amy);
      KT.pill(ctx, "10발의 평균", mp.x + 16, mp.y - 12, { s: 12, c: "#d0bfff", box: [0, LW] });
      KT.bigText(ctx, who() + "의 표적지", 14, 38, 22, "#ffffff");
      KT.pill(ctx, "◯ 자국  ✛ 평균  ● 참값", 22, 318, { s: 12, c: "#e8ecff", box: [0, LW] });

      /* 오른쪽 판정 카드 */
      KT.card(ctx, 524, 0, W - 524, H, "이번 10발의 성적");
      var px = 542, RR = W - 18;
      KT.row(ctx, "정확도 오차 · 평균이 중심에서 떨어진 거리", bias + " mm", px, RR, 58, accurate() ? LT.green : LT.red);
      KT.bar(ctx, px, 68, RR - px, bias / 60, accurate() ? LT.green : LT.red);
      lt(ctx, "10 mm 이내면 ‘정확하다’", px, 94, { s: 11, c: LT.mute });
      KT.row(ctx, "정밀도 · 열 발이 흩어진 정도(표준편차)", noise + " mm", px, RR, 120, precise() ? LT.green : LT.red);
      KT.bar(ctx, px, 130, RR - px, noise / 40, precise() ? LT.green : LT.red);
      lt(ctx, "8 mm 이하면 ‘정밀하다’", px, 156, { s: 11, c: LT.mute });
      /* 2 × 2 판정표 */
      var cx0 = px + 52, cx1 = cx0 + 148;
      lt(ctx, "정밀 ○ 모였다", cx0 + 70, 180, { s: 11.5, w: "900", a: "center", c: LT.mute });
      lt(ctx, "정밀 ✕ 흩어졌다", cx1 + 70, 180, { s: 11.5, w: "900", a: "center", c: LT.mute });
      lt(ctx, "정확 ○", px + 22, 216, { s: 11.5, w: "900", a: "center", c: LT.mute });
      lt(ctx, "중심 맞음", px + 22, 232, { s: 10.5, a: "center", c: LT.mute });
      lt(ctx, "정확 ✕", px + 22, 284, { s: 11.5, w: "900", a: "center", c: LT.mute });
      lt(ctx, "치우침", px + 22, 300, { s: 10.5, a: "center", c: LT.mute });
      var cells = [
        { x: cx0, y: 188, acc: true, pre: true, who: "가온", t: "이상적인 측정" },
        { x: cx1, y: 188, acc: true, pre: false, who: "다인", t: "우연 오차가 크다" },
        { x: cx0, y: 256, acc: false, pre: true, who: "나래", t: "계통 오차가 있다" },
        { x: cx1, y: 256, acc: false, pre: false, who: "라온", t: "둘 다 크다" }
      ];
      for (i = 0; i < cells.length; i++) {
        var c = cells[i], on = (c.acc === accurate() && c.pre === precise());
        ctx.fillStyle = on ? "#e7f5ff" : "#f1f4f8"; ctx.beginPath(); ctx.roundRect(c.x, c.y, 140, 62, 12); ctx.fill();
        ctx.strokeStyle = on ? LT.blue : "rgba(20,40,90,.15)"; ctx.lineWidth = on ? 2.5 : 1; ctx.beginPath(); ctx.roundRect(c.x, c.y, 140, 62, 12); ctx.stroke();
        /* 칸마다 작은 표적지 */
        var mx = c.x + 25, my = c.y + 31, mo = c.acc ? 0 : 6, ms = c.pre ? 2 : 6.5;
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(mx, my, 16, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(20,30,50,.45)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(mx, my, 15, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#1c1f2b"; ctx.beginPath(); ctx.arc(mx, my, 7.5, 0, Math.PI * 2); ctx.fill();
        for (var k = 0; k < 5; k++) { ctx.fillStyle = on ? "#1c7ed6" : "#8a96a8"; ctx.beginPath(); ctx.arc(mx + mo * 0.7 + U[k][0] * ms, my - mo * 0.7 + U[k][1] * ms, 2, 0, Math.PI * 2); ctx.fill(); }
        lt(ctx, c.who, c.x + 88, c.y + 28, { s: 16, w: "900", a: "center", c: on ? LT.blue : LT.mute });
        lt(ctx, c.t, c.x + 88, c.y + 48, { s: 11, a: "center", c: on ? LT.ink : LT.mute });
      }
      KT.tip(ctx, "지금 만든 표적지는 " + who() + " 의 것입니다", px - 4, 324, RR - px + 8, who() === "가온" ? true : null);
      $("a-target-info").innerHTML =
        "평균이 중심에서 <b>" + bias + " mm</b>, 열 발의 표준편차 <b>" + noise + " mm</b> → <b>" +
        (accurate() ? "정확" : "정확하지 않음") + " · " + (precise() ? "정밀" : "정밀하지 않음") + "</b> (" + who() + " 의 표적지)<br>" +
        (who() === "나래" ? "한곳에 빈틈없이 모였는데 중심이 아닙니다. <b>매번 같은 쪽으로 같은 만큼</b> 어긋났으니 사람이 아니라 총을 의심해야 합니다."
         : who() === "다인" ? "평균은 한가운데인데 발마다 흩어졌습니다. 조준선은 멀쩡하고 <b>우연 오차</b>가 큰 경우입니다."
         : who() === "가온" ? "정확하면서 정밀합니다. 측정이 바라는 모습입니다."
         : "치우치기도 하고 흩어지기도 했습니다. 두 손잡이를 따로 움직여 어느 쪽이 무엇을 바꾸는지 보세요.");

      var ch = false;
      if (bias > 10 && noise <= 8 && !got.a) { got.a = true; ch = true; }
      if (bias <= 10 && noise <= 8 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("aShot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.a && got.b) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>두 표적지의 차이는 <b>손떨림이 아니라 조준선</b>이었습니다. 정확도와 정밀도는 서로 다른 것이고, 한쪽이 좋다고 다른 쪽이 좋아지지 않습니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("a-bias").addEventListener("input", function (e) {
      bias = +e.target.value; $("a-bias-val").textContent = bias + " mm"; draw();
    });
    $("a-noise").addEventListener("input", function (e) {
      noise = +e.target.value; $("a-noise-val").textContent = noise + " mm"; draw();
    });
    $("a-bias-val").textContent = bias + " mm";
    $("a-noise-val").textContent = noise + " mm";
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m1-2", true);
  })();

  /* 장면 3 — 전자저울 반복 측정 (계산 모형: 평균·표준편차·계통 오차) */
  (function () {
    var canvas = $("a-scale"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var TRUE = 50.00, n = 6, z = 0;
    var got = window.sthState("aScale") || { a: false, b: false };

    var NOISE = (function () {          /* 씨앗 31 · 표준편차 약 0.15 g 인 60개의 우연 오차 */
      var r = lcg(31), out = [], i;
      for (i = 0; i < 60; i++) out.push((r() + r() + r() + r() + r() + r() - 3) * 0.20);
      return out;
    })();
    function val(i) { return TRUE + z + NOISE[i]; }
    function stats() {
      var s = 0, i;
      for (i = 0; i < n; i++) s += val(i);
      var m = s / n, q = 0;
      for (i = 0; i < n; i++) q += Math.pow(val(i) - m, 2);
      return { mean: m, sd: n > 1 ? Math.sqrt(q / (n - 1)) : 0, err: m - TRUE };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var st = stats(), i, zOk = Math.abs(z) < 0.05, LW = 560;
      KT.studio(ctx, 0, 0, LW, H, { x: 290, y: 300, rx: 280, ry: 16 });
      KT.bigText(ctx, "참값 50.00 g", 16, 36, 20, "#ffd35a");
      KT.bigText(ctx, "한 번 잴 때마다 칩 하나", 16, 62, 14, "#ffffff");
      /* 전자저울(입체) — 표준 분동을 올려 두었다 */
      floorShadow(ctx, 132, 274, 122, 12, 0.26);
      slab(ctx, 24, 196, 214, 66, 16, "#eef2f6", "#dfe4eb", "#b9c1cc");
      ctx.fillStyle = "#c9d0da"; ctx.fillRect(24, 196, 214, 4);
      ctx.fillStyle = "#9aa3b0"; ctx.fillRect(122, 178, 30, 12);
      ctx.fillStyle = metal(ctx, 0, 176, 0, 192, "#ffffff", "#c4cbd6", "#7d8698"); ctx.beginPath(); ctx.ellipse(137, 180, 92, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(60,70,90,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(137, 180, 92, 13, 0, 0, Math.PI * 2); ctx.stroke();
      var bg = ctx.createLinearGradient(104, 0, 170, 0); bg.addColorStop(0, "#8a6420"); bg.addColorStop(0.4, "#f6d58a"); bg.addColorStop(1, "#7a5418");
      ctx.save(); ctx.shadowColor = "rgba(40,30,10,.35)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
      ctx.fillStyle = bg; ctx.fillRect(104, 120, 66, 58);
      ctx.beginPath(); ctx.ellipse(137, 178, 33, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.fillStyle = "#f8e2a8"; ctx.beginPath(); ctx.ellipse(137, 120, 33, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = bg; ctx.fillRect(127, 104, 20, 16); ctx.fillStyle = "#f8e2a8"; ctx.beginPath(); ctx.ellipse(137, 104, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
      lt(ctx, "50 g", 137, 156, { s: 14, w: "900", a: "center", c: "#3a2600" });
      var lcd = ctx.createLinearGradient(0, 208, 0, 246); lcd.addColorStop(0, "#1e3a2c"); lcd.addColorStop(1, "#0b1a12");
      ctx.fillStyle = lcd; ctx.beginPath(); ctx.roundRect(40, 208, 136, 38, 7); ctx.fill();
      lt(ctx, val(n - 1).toFixed(2) + " g", 108, 235, { s: 20, w: "900", a: "center", c: "#8dffc0" });
      /* 영점 손잡이 — 틀어진 만큼 돌아가 있다 */
      var ka = -Math.PI / 2 + z / 2 * 2.2;
      ctx.fillStyle = metal(ctx, 194, 214, 222, 242, "#ffffff", "#aab3c3", "#5b6476"); ctx.beginPath(); ctx.arc(208, 226, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = zOk ? LT.green : LT.red; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(208, 226); ctx.lineTo(208 + Math.cos(ka) * 11, 226 + Math.sin(ka) * 11); ctx.stroke(); ctx.lineCap = "butt";
      lt(ctx, "영점", 208, 256, { s: 12, w: "900", a: "center", c: LT.mute });
      KT.pill(ctx, zOk ? "영점이 맞았다" : "영점 " + (z > 0 ? "+" : "−") + Math.abs(z).toFixed(1) + " g 틀어짐", 132, 300, { a: "center", s: 12, c: zOk ? "#8ce99a" : "#ffa8a8", box: [0, LW] });

      /* 측정값 받침판 — 잰 값마다 칩 하나를 그 눈금 위에 쌓는다 */
      function XV(g2) { return 270 + (clamp(g2, 47.5, 52.5) - 47.5) / 5 * 270; }
      slab(ctx, 262, 258, 290, 18, 22, "#f3e6cc", "#c9a57a", "#a8835a");
      for (i = 48; i <= 52; i++) {
        ctx.strokeStyle = "#5a3a1c"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(XV(i), 258); ctx.lineTo(XV(i), 268); ctx.stroke();
        lt(ctx, i + "", XV(i), 294, { s: 12, w: "900", a: "center", c: LT.ink });
      }
      lt(ctx, "g", 552, 294, { s: 12, w: "900", a: "right", c: LT.mute });
      /* 깃발 두 개: 참값과 평균 */
      var tx = XV(TRUE), mx = XV(st.mean);
      KT.line(ctx, { x: tx, y: 250 }, { x: tx, y: 104 }, LT.green, 2.4, [6, 4]);
      ctx.strokeStyle = LT.violet; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx, 250); ctx.lineTo(mx, 136); ctx.stroke();
      ctx.fillStyle = LT.violet; ctx.beginPath(); ctx.moveTo(mx, 136); ctx.lineTo(mx + 14, 142); ctx.lineTo(mx, 148); ctx.closePath(); ctx.fill();
      var stack = {}, cw2 = 5;
      for (i = 0; i < n; i++) {
        var bin = Math.round((clamp(val(i), 47.5, 52.5) - 47.5) / 0.2), hgt = stack[bin] || 0; stack[bin] = hgt + 1;
        var cxv = XV(47.5 + bin * 0.2), cyv = 246 - hgt * 3.8, last = i === n - 1;
        ctx.fillStyle = last ? "#d9480f" : "#1864ab"; ctx.fillRect(cxv - cw2, cyv, cw2 * 2, 3.6);
        ctx.beginPath(); ctx.ellipse(cxv, cyv + 3.6, cw2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = last ? "#ffc078" : "#74c0fc"; ctx.beginPath(); ctx.ellipse(cxv, cyv, cw2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 0.8; ctx.stroke();
      }
      KT.pill(ctx, "참값 50.00 g", tx, 100, { a: "center", s: 12, c: "#8ce99a", box: [262, LW] });
      KT.pill(ctx, "평균 " + st.mean.toFixed(3) + " g", mx, 130, { a: "center", s: 12, c: "#d0bfff", box: [262, LW] });
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 568, W, H, n + "번 잰 결과"), px = cd.px, R = cd.R;
      lt(ctx, "평균 " + st.mean.toFixed(3) + " g", px, 64, { s: 24, w: "900", c: LT.violet });
      KT.row(ctx, "평균의 오차 (참값과의 차)", (st.err >= 0 ? "+" : "−") + Math.abs(st.err).toFixed(3) + " g", px, R, 100, LT.orange);
      KT.bar(ctx, px, 110, cd.w, Math.abs(st.err) / 2, Math.abs(st.err) <= 0.05 ? LT.green : LT.orange);
      KT.row(ctx, "흩어짐 (표준편차)", st.sd.toFixed(3) + " g", px, R, 146, LT.blue);
      KT.row(ctx, "측정 횟수", n + " 번", px, R, 170);
      KT.row(ctx, "영점", (z >= 0 ? "+" : "−") + Math.abs(z).toFixed(1) + " g", px, R, 194, zOk ? LT.green : LT.red);
      KT.tip(ctx, zOk ? "영점이 맞은 저울" : "영점이 틀어진 저울", px - 4, 212, cd.w + 8, zOk ? true : false);
      lt(ctx, "칩 하나 = 한 번 잰 값 (주황 = 마지막)", px, 272, { s: 11, c: LT.mute });
      lt(ctx, "보라 깃발 = 평균, 초록 점선 = 참값", px, 294, { s: 11, c: LT.mute });
      var note;
      if (Math.abs(z) < 0.05) {
        note = n >= 25
          ? "영점이 맞은 저울입니다. <b>" + n + "번</b>을 재어 평균을 내니 오차가 <b>" + Math.abs(st.err).toFixed(3) + " g</b>까지 줄었습니다. 흩어짐(표준편차)은 <b>" + st.sd.toFixed(3) + " g</b>로 거의 그대로인데 <b>평균</b>만 참값에 다가갔다는 점이 중요합니다."
          : "아직 <b>" + n + "번</b>뿐입니다. 평균의 오차가 <b>" + Math.abs(st.err).toFixed(3) + " g</b>입니다. 횟수를 늘려 보세요.";
      } else {
        note = n >= 25
          ? "영점이 <b>" + z.toFixed(1) + " g</b> 틀어져 있습니다. <b>" + n + "번</b>이나 재어 평균을 냈는데도 오차가 <b>" + Math.abs(st.err).toFixed(3) + " g</b>로 남아 있습니다. <b>계통 오차는 반복으로 줄지 않습니다.</b>"
          : "영점이 <b>" + z.toFixed(1) + " g</b> 틀어져 있습니다. 횟수를 크게 늘려도 평균이 참값으로 돌아오는지 확인해 보세요.";
      }
      $("a-scale-info").innerHTML = note;

      var ch = false;
      if (Math.abs(z) < 0.05 && n >= 25 && Math.abs(st.err) <= 0.05 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(z) >= 0.5 && n >= 25 && Math.abs(st.err) >= 0.3 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("aScale", got); mission(); }
    }

    window.sthSort({
      mount: "s1-sort",
      buckets: [
        { id: "sys", label: "계통 오차", sub: "한쪽으로 치우친다 · 반복해도 줄지 않는다" },
        { id: "ran", label: "우연 오차", sub: "제멋대로 흩어진다 · 여러 번 재어 평균 내면 줄어든다" }
      ],
      items: [
        { t: "영점이 0.5 g 틀어진 저울로 잰다", a: "sys", why: "모든 측정값이 같은 쪽으로 0.5 g씩 밀립니다. 저울을 교정해야 사라집니다." },
        { t: "눈금을 읽을 때마다 눈의 위치가 조금씩 달라진다", a: "ran", why: "위로도 아래로도 어긋나므로 평균을 내면 줄어듭니다." },
        { t: "줄자가 더운 날 늘어난 채로 길이를 잰다", a: "sys", why: "늘어난 줄자는 언제나 실제보다 짧은 값을 내놓습니다.", hint: "매번 같은 쪽으로 틀리나요, 제멋대로 틀리나요?" },
        { t: "초시계를 누르는 반응이 매번 조금씩 빠르거나 늦다", a: "ran", why: "빠를 때도 늦을 때도 있으므로 여러 번 재어 평균을 냅니다." },
        { t: "언제나 눈금의 위쪽을 보는 버릇이 있다", a: "sys", why: "버릇이 일정하면 모든 값이 같은 쪽으로 치우칩니다. 이것도 계통 오차입니다.", hint: "‘언제나’라는 말에 주목하세요." },
        { t: "실험대가 미세하게 흔들려 저울 값이 떨린다", a: "ran", why: "위아래로 무작위로 흔들리므로 평균을 내면 상쇄됩니다." },
        { t: "온도계를 물에 충분히 담그지 않고 읽는다", a: "sys", why: "언제나 실제보다 낮게(또는 높게) 나오므로 치우친 오차입니다.", hint: "이 실수를 하면 값이 어느 쪽으로 치우칠까요?" },
        { t: "바람이 불었다 말았다 하며 저울 값이 오르내린다", a: "ran", why: "방향이 정해져 있지 않으므로 우연 오차입니다." }
      ],
      doneText: "고칠 것과 견딜 것이 갈라졌습니다.",
      onDone: function () { window.sthState("aSortDone", 1); mission(); }
    });

    function mission() {
      var sorted = !!window.sthState("aSortDone");
      if (got.a) done("m1-3a");
      if (got.b) done("m1-3b");
      if (sorted) done("m1-3c");
      if (got.a && got.b && sorted) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span><b>우연 오차</b>는 여러 번 재어 평균 내면 줄어들지만, <b>계통 오차</b>는 60번을 재도 그대로 남습니다. 그래서 재기 전에 기기를 <b>교정</b>합니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("a-n").addEventListener("input", function (e) {
      n = +e.target.value; $("a-n-val").textContent = n + " 번"; draw();
    });
    $("a-z").addEventListener("input", function (e) {
      z = +e.target.value; $("a-z-val").textContent = (z >= 0 ? "+" : "−") + Math.abs(z).toFixed(1) + " g"; draw();
    });
    $("a-n-val").textContent = n + " 번";
    $("a-z-val").textContent = "+0.0 g";
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m1-3", true);
  })();

  /* 장면 4 — 자와 유효숫자 (계산 모형: 최소 눈금 → 읽는 자리) */
  (function () {
    var canvas = $("a-ruler"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var minDiv = 10, L = 42.7;                        /* minDiv: mm 단위 최소 눈금, L: 실제 길이 mm */
    var got = window.sthState("aRuler") || { seen: {}, b: false, c: false };
    if (!got.seen) got.seen = {};
    got.seen["10"] = got.seen["10"] || true;          /* 처음 보이는 자는 1 cm 자 */

    function reading() {
      var step = minDiv / 10;                          /* 어림하는 자리 = 최소 눈금의 1/10 */
      var mm = Math.round(L / step) * step;
      var dec = Math.round(-Math.log(step) / Math.LN10) + 1;   /* cm로 적을 때의 소수 자릿수 */
      return { mm: mm, cm: (mm / 10).toFixed(dec), dec: dec, sig: dec + 1, step: step };
    }
    function xOf(mm) { return 40 + mm * 7; }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = reading(), i, LW = 640, rul = minDiv === 10 ? "1 cm" : minDiv === 1 ? "1 mm" : "0.1 mm";
      KT.studio(ctx, 0, 0, LW, H, { x: 320, y: 318, rx: 330, ry: 26 });
      /* 작업대(원근으로 본 나무 책상) — 그 위에 자와 막대를 올려 둔 미니어처 */
      var dg = ctx.createLinearGradient(0, 118, 0, 300);
      dg.addColorStop(0, "#e9cfa5"); dg.addColorStop(1, "#c99a63");
      ctx.fillStyle = dg; ctx.beginPath(); ctx.moveTo(52, 118); ctx.lineTo(596, 118); ctx.lineTo(630, 300); ctx.lineTo(10, 300); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(120,72,30,.16)"; ctx.lineWidth = 1;
      for (i = 0; i < 9; i++) { var yy = 128 + i * 19, kx = (yy - 118) / 182 * 42; ctx.beginPath(); ctx.moveTo(52 - kx, yy); ctx.bezierCurveTo(220, yy - 4, 420, yy + 5, 596 + kx * .8, yy - 1); ctx.stroke(); }
      ctx.fillStyle = "#94643a"; ctx.beginPath(); ctx.moveTo(10, 300); ctx.lineTo(630, 300); ctx.lineTo(630, 316); ctx.lineTo(10, 316); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#7a4f2b"; ctx.fillRect(34, 316, 16, 18); ctx.fillRect(590, 316, 16, 18);
      /* 자 그림자 + 자(반투명 플라스틱, 두께가 보이게) */
      ctx.fillStyle = "rgba(60,35,10,.22)"; ctx.beginPath(); ctx.roundRect(40, 214, 590, 12, 6); ctx.fill();
      slab(ctx, 34, 176, 586, 40, 12, "#fffdf6", "#f1ead4", "#cfc5a6");
      var drawStep = minDiv === 10 ? 10 : minDiv === 1 ? 1 : 0.5;
      for (i = 0; i * drawStep <= 80.0001; i++) {
        var mm = i * drawStep, x = xOf(mm);
        if (x > 616) break;
        var big = Math.abs(mm / 10 - Math.round(mm / 10)) < 1e-9, half = !big && Math.abs(mm / 5 - Math.round(mm / 5)) < 1e-9;
        ctx.strokeStyle = big ? "#1b1d2a" : "#4a4d5c"; ctx.lineWidth = big ? 1.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(x, 176); ctx.lineTo(x, big ? 196 : half ? 189 : 185); ctx.stroke();
        if (big) lt(ctx, (mm / 10) + "", x, 210, { s: 12, w: "900", a: "center", c: "#1b1d2a" });
      }

      /* 막대(나무 각재) — 길이 L 만큼, 자 위에 0 을 맞춰 놓임 */
      var bw = Math.max(8, L * 7);
      ctx.fillStyle = "rgba(60,35,10,.25)"; ctx.beginPath(); ctx.roundRect(44, 160, bw + 8, 10, 5); ctx.fill();
      slab(ctx, 40, 136, bw, 30, 14, "#f6dcae", "#c98a4c", "#93602f");
      ctx.save(); ctx.beginPath(); ctx.rect(40, 136, bw, 30); ctx.clip();
      ctx.strokeStyle = "rgba(110,60,20,.3)"; ctx.lineWidth = 1;
      for (i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(40, 140 + i * 5.5); ctx.bezierCurveTo(200, 137 + i * 5.5 + (i % 2 ? 3 : -2), 400, 144 + i * 5.5, 640, 139 + i * 5.5); ctx.stroke(); }
      ctx.restore();
      /* 막대 끝 표시 */
      var ex = xOf(L);
      KT.line(ctx, { x: ex, y: 128 }, { x: ex, y: 198 }, LT.orange, 2, [5, 4]);
      /* 돋보기 — 막대 끝을 6배로 키워 본다(자마다 보이는 눈금이 달라진다) */
      var mx = ex > 380 ? clamp(ex - 130, 420, 560) : clamp(ex + 130, 420, 560), my = 70, mr = 54, Z = 6 * 7;          /* 1 mm = 42 px */
      ctx.strokeStyle = "rgba(30,40,60,.55)"; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(ex, 150); ctx.lineTo(mx - mr * .6, my + mr * .8); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.2832); ctx.clip();
      ctx.fillStyle = "#e7c896"; ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
      var by0 = my - 34, ry0 = my + 4;                                         /* 확대된 막대·자 */
      ctx.fillStyle = "#c98a4c"; ctx.fillRect(mx - mr, by0, mr + (ex - ex), 30);
      ctx.fillStyle = "#93602f"; ctx.fillRect(mx - 3, by0, 3, 30);
      ctx.fillStyle = "#f6f1e0"; ctx.fillRect(mx - mr, ry0, mr * 2, mr);
      var u0 = L - mr / Z - 1, u1 = L + mr / Z + 1, fst = minDiv === 0.1 ? 0.1 : minDiv;
      for (var t = Math.floor(u0 / fst) * fst; t <= u1; t += fst) {
        var tx = mx + (t - L) * Z, cmT = Math.abs(t / 10 - Math.round(t / 10)) < 1e-6, mmT = Math.abs(t - Math.round(t)) < 1e-6;
        ctx.strokeStyle = "#1b1d2a"; ctx.lineWidth = cmT ? 2.4 : mmT ? 1.5 : 0.9;
        ctx.beginPath(); ctx.moveTo(tx, ry0); ctx.lineTo(tx, ry0 + (cmT ? 30 : mmT ? 20 : 11)); ctx.stroke();
      }
      ctx.restore();
      var lg = ctx.createRadialGradient(mx - 20, my - 22, 4, mx, my, mr);
      lg.addColorStop(0, "rgba(255,255,255,.45)"); lg.addColorStop(.5, "rgba(255,255,255,.05)"); lg.addColorStop(1, "rgba(120,170,220,.18)");
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "#2b3242"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = "#2b3242"; ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(mx + mr * .72, my + mr * .72); ctx.lineTo(mx + mr * 1.12, my + mr * 1.12); ctx.stroke(); ctx.lineCap = "butt";
      KT.pill(ctx, minDiv === 10 ? "돋보기: 눈금이 안 보임" : minDiv === 1 ? "돋보기: 1 mm 칸 사이" : "돋보기: 0.1 mm 칸", mx < ex ? mx - mr - 10 : mx + mr + 12, my + 4, { a: mx < ex ? "right" : "left", s: 12, c: "#ffffff", box: [0, LW] });
      KT.pill(ctx, "막대 끝", ex, 124, { a: "center", s: 12, c: "#ffd8a8", box: [0, LW] });
      KT.warn(ctx, 624, 294, "⚠ 돋보기 속은 6배 확대", "right");
      KT.bigText(ctx, r.cm + " cm", 18, 48, 32, "#ffd35a");
      KT.bigText(ctx, "최소 눈금 " + rul + " 자로 읽은 값", 18, 78, 16, "#ffffff");
      lt(ctx, "자의 숫자 단위: cm", 40, 250, { s: 12, w: "800", c: "#5a3a1c" });
      if (minDiv === 0.1) lt(ctx, "※ 자 전체 그림은 0.5 mm 마다만 눈금을 그렸습니다(돋보기 속은 0.1 mm 눈금)", 40, 272, { s: 12, c: "#5a3a1c" });
      lt(ctx, "어림하는 자리는 최소 눈금의 1/10 입니다", 40, 294, { s: 12, w: "800", c: "#5a3a1c" });
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 650, W, H, "이 자로 적을 수 있는 값"), px = cd.px, RR = cd.R;
      lt(ctx, r.cm + " cm", px, 66, { s: 26, w: "900", c: LT.orange });
      KT.row(ctx, "최소 눈금", rul, px, RR, 100, LT.blue);
      KT.row(ctx, "눈금으로 읽은 자리", (r.sig - 1) + " 개", px, RR, 124);
      KT.row(ctx, "어림한 자리", "1 개", px, RR, 148, LT.violet);
      KT.row(ctx, "유효숫자", r.sig + " 자리", px, RR, 172, LT.green);
      var seen = ["10", "1", "0.1"].filter(function (s) { return got.seen[s] || String(minDiv) === s; }).length;
      lt(ctx, "세 자 모두 써 보기 " + seen + " / 3", px, 206, { s: 11.5, c: LT.mute });
      KT.bar(ctx, px, 214, cd.w, seen / 3, LT.green);
      KT.tip(ctx, minDiv === 10 ? "4.27 이라 적으면 재지 않은 자리" : minDiv === 1 ? "마지막 자리는 눈으로 어림" : "믿을 수 있는 자리가 한 자리 늘었다", px - 4, 240, cd.w + 8, minDiv === 10 ? false : true);
      
      $("a-ruler-info").innerHTML = "최소 눈금 <b>" + (minDiv === 10 ? "1 cm" : minDiv === 1 ? "1 mm" : "0.1 mm") +
        "</b> 자로 읽으면 <b>" + r.cm + " cm</b> (유효숫자 " + r.sig + "자리). " +
        (minDiv === 10 ? "이 자로 4.27이라고 적으면 재지도 않은 자리를 적은 것이 됩니다."
         : minDiv === 1 ? "마지막 자리는 눈금 사이를 눈으로 <b>어림한</b> 값이므로 사람마다 조금 다를 수 있습니다."
         : "자가 정밀해진 만큼 믿을 수 있는 자리가 한 자리 늘었습니다.");

      var ch = false;
      if (!got.seen[String(minDiv)]) { got.seen[String(minDiv)] = true; ch = true; }
      if (Math.round(L * 10) === 500 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("aRuler", got); mission(); }
    }

    window.sthPick({
      mount: "s1-pick",
      q: "최소 눈금이 1 mm 인 자로 잰 뒤 길이를 <b>4.2700 cm</b>라고 적었습니다. 무엇이 잘못되었을까요?",
      options: [
        "단위를 cm가 아니라 mm로 적어야 한다",
        "이 자가 알려 줄 수 없는 자리까지 적었다",
        "소수점 아래는 언제나 두 자리까지만 적는 것이 규칙이다",
        "여러 번 재어 평균을 내지 않아서 틀렸다"
      ],
      answer: 1,
      why: [
        "단위는 cm로 적어도 mm로 적어도 됩니다. 문제는 <b>자릿수</b>입니다.",
        "1 mm 자는 0.1 mm 자리까지만 어림할 수 있습니다. 4.27 cm가 맞고, 뒤의 0 두 개는 재지 않은 자리입니다.",
        "자릿수를 정하는 것은 규칙이 아니라 <b>쓰는 자</b>입니다. 0.1 mm 자라면 4.270 cm까지 적을 수 있습니다.",
        "평균을 내면 우연 오차는 줄지만, 자가 알려 주지 못하는 자리가 생겨나지는 않습니다."
      ],
      onDone: function () { got.c = true; window.sthState("aRuler", got); mission(); }
    });

    function mission() {
      var all = got.seen["10"] && got.seen["1"] && got.seen["0.1"];
      if (all) done("m1-4a");
      if (got.b) done("m1-4b");
      if (got.c) done("m1-4c");
      if (all && got.b && got.c) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>같은 막대라도 <b>1 cm 자로는 4.3 cm, 1 mm 자로는 4.27 cm, 0.1 mm 자로는 4.270 cm</b>. 적을 수 있는 자리는 자가 정합니다. 그 마지막 한 자리가 <b>어림</b>입니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("a-len").addEventListener("input", function (e) {
      L = +e.target.value; $("a-len-val").textContent = L.toFixed(1) + " mm"; draw();
    });
    var seg = $("a-mode");
    Array.prototype.forEach.call(seg.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(seg.querySelectorAll("button"), function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        minDiv = +b.getAttribute("data-m");
        draw();
      });
    });
    $("a-len-val").textContent = L.toFixed(1) + " mm";
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("m1-4", true);
  })();

  /* 장면 5 — 결말 */
  function finish() {
    window.sthState("r1", "해결 · 나래는 계통 오차(총), 다인은 우연 오차(연습) · 평균은 반복이 줄이고 영점 오차는 그대로");
  }
  function paintVs() {
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 이제 숫자로도 증명했습니다."
        : "처음 생각과 달랐지요? 모여 있다는 것은 솜씨가 좋다는 뜻이고, 그래도 중심을 벗어났다면 범인은 기계입니다.") +
      "<br><b>내가 확인한 것</b> 반복 측정은 우연 오차만 줄인다 · 적을 수 있는 자리는 자가 정한다";
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();

  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅰ-2] 이야기 ① 과녁에 남은 자국",
    items: [
      { id: "w1", label: "정밀도와 정확도", hint: "과녁 그림 네 가지 중 하나를 골라, 왜 그 조합인지 설명하세요.", ph: "내가 고른 것: … / 정밀도 …, 정확도 … 인 까닭은 …" },
      { id: "e1b", label: "총을 고칠까, 연습을 할까", hint: "반복해서 재면 줄어드는 오차와 아무리 반복해도 줄지 않는 오차를 각각 무엇이라 하는지 쓰고, 저울 화면에서 확인한 숫자를 근거로 들어 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 1미터를 다시 정하는 회의
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });
  var ALPHA = 8.7e-6;          /* 백금–이리듐 합금의 선팽창 계수 (약, 1/℃) */
  var HAIR = 70;               /* 머리카락 굵기 약 70 µm */

  /* 장면 1 — 첫 어림 */
  window.sthGate({
    gate: "g2", key: "p2", title: "견학생의 첫 어림",
    question: "금고 온도가 0 ℃에서 20 ℃로 오르면, 1 m 짜리 미터원기는 얼마나 길어질까요?",
    options: [
      "㉠ 금속이라 전혀 길어지지 않는다",
      "㉡ 머리카락 두세 개 굵기쯤 (약 0.17 mm)",
      "㉢ 손가락 한 마디쯤 (약 2 cm)"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 원기의 열팽창 (계산 모형: ΔL = L·α·ΔT)
     그림: 세브르 국제도량형국 지하 금고를 블록처럼 잘라 낸 모형(아이소메트릭) + 원자 확대경, 아래는 늘어남 읽음판 */
  (function () {
    var canvas = $("b-bar"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var T = 5;
    var got = window.sthState("bBar") || { a: false, b: false };
    var mv = { on: !REDUCE }, ph = 0;

    function dL() { return ALPHA * T * 1e6; }              /* µm */

    /* ── 금고 모형: x = 막대 방향, y = 깊이, z = 위. 벽 두께 50, 땅 높이 ZG ── */
    var DH = 410, ZG = 110, WT = 50;
    var I = KT.iso({ ox: 372, oy: 150, s: 0.6, L: 560, D: 300 });
    var L = I.L, D = I.D;
    var BX0 = 130, BX1 = 470, BY = 175, BZ = 34;            /* 막대(1 m)가 놓인 자리 */
    function strata(Lw, z0, z1) {                           /* 잘린 면: 흙·자갈·암반 띠 (face 안에서 u, z 좌표) */
      var bands = [["#5d8f43", ZG - 6, ZG], ["#7a5a3c", 78, ZG - 6], ["#9b7a52", 46, 78], ["#b59a72", 14, 46], ["#8d8a84", z0, 14]];
      bands.forEach(function (b) { if (b[2] > z0 && b[1] < z1) { ctx.fillStyle = b[0]; ctx.fillRect(0, Math.max(b[1], z0), Lw, Math.min(b[2], z1) - Math.max(b[1], z0)); } });
      var R = KT.rng(7 + Math.round(Lw));
      for (var i = 0; i < Lw * 1.2; i++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.16)" : "rgba(40,25,10,.22)"; ctx.fillRect(R() * Lw, z0 + R() * (z1 - z0), 1.8, 1.8); }
    }
    function stone(i) { return i % 2 ? "#cfc8bb" : "#c6bfb1"; }
    function heatCol(a) {                                   /* 차가우면 푸른빛, 데우면 주황빛 */
      var h = clamp(T / 40, 0, 1);
      return h < 0.05 ? "rgba(120,190,255," + a + ")" : "rgba(255," + Math.round(160 - h * 60) + ",70," + (a * (0.35 + h)) + ")";
    }

    function drawModel(d) {
      var heat = clamp(T / 40, 0, 1), box = [0, W];
      KT.studio(ctx, 0, 0, W, DH, { x: I.P(L, D, 0).x - 150, y: I.P(L, D, -20).y - 26, rx: 330, ry: 52 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();

      /* 뒤 벽(땅) — 안쪽 벽면은 돌, 오른쪽 잘린 면은 지층 */
      I.box(ctx, 0, 0, -20, L, WT, ZG, "#6ea24f", "#d8d1c4", "#9b7a52");
      I.face(ctx, "right", function () { ctx.save(); ctx.beginPath(); ctx.rect(0, -20, WT, ZG + 20); ctx.clip(); strata(WT, -20, ZG); ctx.restore(); });
      /* 안쪽 벽면 줄눈 */
      ctx.strokeStyle = "rgba(90,80,64,.28)"; ctx.lineWidth = 1;
      for (var z = 14; z < ZG; z += 16) { var a = I.P(WT, WT, z), b = I.P(L, WT, z); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      /* 왼쪽 벽(땅) */
      I.box(ctx, 0, WT, -20, WT, D, ZG, "#6ea24f", "#9b7a52", "#d2cbbd");
      I.face(ctx, "front", function () { ctx.save(); ctx.beginPath(); ctx.rect(0, -20, WT, ZG + 20); ctx.clip(); strata(WT, -20, ZG); ctx.restore(); });
      for (z = 14; z < ZG; z += 16) { var c1 = I.P(WT, WT, z), c2 = I.P(WT, D, z); ctx.beginPath(); ctx.moveTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.stroke(); }
      /* 바닥 — 돌판 */
      I.box(ctx, WT, WT, -20, L, D, 0, "#cfc8bb", "#8d8a84", "#7b7872");
      for (var i = 0; i < 9; i++) I.plane(ctx, 0, stone(i), "rgba(120,110,95,.35)", WT + (L - WT) * i / 9, WT + (L - WT) * (i + 1) / 9, WT, D);
      /* 금고 공기의 온도 빛 */
      I.plane(ctx, 0.5, heatCol(0.22), null, WT, L, WT, D);

      /* 땅 위: 국제도량형국 건물과 나무 */
      I.house(ctx, 250, 6, ZG, 120, 38, 26, "#55657c");
      [[22, 90], [18, 170], [30, 250], [120, 22], [470, 20], [520, 26]].forEach(function (t, k) { I.tree(ctx, t[0], t[1], ZG, 0.9 + (k % 3) * .12); });

      /* 받침대(돌) + 받침 롤러 두 개 */
      I.box(ctx, BX0 - 30, BY - 30, 0, BX1 + 30, BY + 30, 26, "#5b5f6b", "#474b56", "#3a3d47");
      /* 0 ℃에 가까우면 얼음을 채운 홈 */
      if (T <= 1) {
        var R = KT.rng(11);
        for (var k = 0; k < 26; k++) {
          var ix = BX0 - 20 + R() * (BX1 - BX0 + 40), iy = (k % 2 ? BY - 26 : BY + 12) + R() * 10;
          I.box(ctx, ix, iy, 26, ix + 9, iy + 8, 32, "rgba(240,250,255,.95)", "rgba(190,225,250,.9)", "rgba(160,205,240,.9)");
        }
      }
      [BX0 + 0.21 * (BX1 - BX0), BX1 - 0.21 * (BX1 - BX0)].forEach(function (rx) {
        I.box(ctx, rx - 5, BY - 12, 26, rx + 5, BY + 12, BZ, "#8a8f99", "#6d727c", "#585d66");
      });
      /* 미터원기 막대 — 늘어난 끝은 보기 쉽게 크게 과장 */
      var ext = clamp(d / 350, 0, 1) * 40;
      var tg = heat > 0.02 ? KT.tint("#c9cfda", 1 + heat * .08) : "#d9dee8";
      I.box(ctx, BX0, BY - 7, BZ, BX1 + ext, BY + 7, BZ + 12, tg, "#9aa2b2", "#6f7788");
      if (heat > 0.05) I.box(ctx, BX0, BY - 7, BZ, BX1 + ext, BY + 7, BZ + 12, "rgba(255,130,60," + (heat * .28).toFixed(2) + ")", "rgba(255,120,60," + (heat * .22).toFixed(2) + ")", "rgba(255,110,50," + (heat * .2).toFixed(2) + ")");
      /* 눈금선 두 개(0 m, 1 m) */
      [BX0 + 8, BX1 - 8 + ext].forEach(function (mx) { var p1 = I.P(mx, BY - 7, BZ + 12), p2 = I.P(mx, BY + 7, BZ + 12); ctx.strokeStyle = "#1b1f2e"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); });
      if (ext > 1) {
        var e0 = I.P(BX1, BY + 7, BZ + 20), e1 = I.P(BX1 + ext + 10, BY + 7, BZ + 20);
        KT.arrow(ctx, e0, e1, KC.orange, 3, 9);
      }

      /* 뒤 벽의 온도계 */
      var tx = 520, t0 = I.P(tx, WT + 1, 18), t1 = I.P(tx, WT + 1, 98), tm = I.P(tx, WT + 1, 18 + 80 * clamp(T / 40, 0, 1));
      ctx.strokeStyle = "#f4f6fb"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.stroke();
      ctx.strokeStyle = T <= 0.6 ? "#3f8fe0" : "#e0473f"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(tm.x, tm.y + 0.01); ctx.stroke(); ctx.lineCap = "butt";
      ctx.fillStyle = T <= 0.6 ? "#3f8fe0" : "#e0473f"; ctx.beginPath(); ctx.arc(t0.x, t0.y + 3, 5.5, 0, 6.2832); ctx.fill();

      /* 연구원 */
     I.edges(ctx, 0, ZG);
      ctx.restore();

      /* 이름표 */
      I.label(ctx, 310, 20, ZG + 40, "국제도량형국 (프랑스 세브르)", -150, -20, "#e8ecff", box);
      I.label(ctx, (BX0 + BX1) / 2 - 40, BY + 7, BZ + 6, "국제 미터원기 — 백금 90 %·이리듐 10 %", -150, 70, "#e8ecff", box);
      I.label(ctx, tx, WT + 1, 98, "금고 온도계 " + T.toFixed(1) + " ℃", 44, 52, T <= 0.6 ? "#bfe6ff" : "#ffc29a", box);
      I.label(ctx, 20, D, 60, "땅속 금고 — 바깥 날씨에서 떨어진 곳", -6, 54, "#e8ecff", box);
      if (T <= 1) I.label(ctx, BX0 - 10, BY - 24, 32, "얼음을 채워 0 ℃에 맞춤", -40, -46, "#bfe6ff", box);
      if (ext > 1) { var epx = I.P(BX1 + ext + 12, BY + 7, BZ + 20); KT.pill(ctx, "+" + d.toFixed(1) + " µm", epx.x + 8, epx.y + 4, { s: 12, c: KC.orange, box: box }); }

      /* 큰 제목 */
      var h1, h2;
      if (d <= 5) { h1 = "얼음 녹는 온도의 1 m"; h2 = "늘어난 길이 " + d.toFixed(1) + " µm — 거의 그대로"; }
      else if (d < HAIR) { h1 = "눈에 안 보이게 늘어났다"; h2 = T.toFixed(1) + " ℃ · " + d.toFixed(1) + " µm"; }
      else if (d < 99.5) { h1 = "머리카락 한 올보다 길어졌다"; h2 = T.toFixed(1) + " ℃ · " + d.toFixed(1) + " µm"; }
      else { h1 = "1 m가 1 m보다 길어졌다"; h2 = T.toFixed(1) + " ℃ · +" + (d / 1000).toFixed(2) + " mm"; }
      KT.bigText(ctx, h1, 22, 50, 27, "#ffffff");
      KT.bigText(ctx, h2, 22, 84, 17, d <= 5 ? "#bfe6ff" : "#ffd35a");
      KT.warn(ctx, W - 14, 30, "⚠ 크기 비율은 실제와 다름 · 늘어남·원자 흔들림은 크게 과장", "right");

      drawLens(heat);
    }

    /* 원자 확대경 — 데울수록 원자가 크게 흔들리고 사이가 벌어진다(과장) */
    function drawLens(heat) {
      var cx = 792, cy = 168, r = 66;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832);
      var g = ctx.createRadialGradient(cx - 20, cy - 20, 8, cx, cy, r); g.addColorStop(0, "#2a3158"); g.addColorStop(1, "#141a36");
      ctx.fillStyle = g; ctx.fill(); ctx.clip();
      var sp = 21 * (1 + heat * 0.22), amp = 0.8 + heat * 4.2, R = KT.rng(5);
      for (var j = -3; j <= 3; j++) for (var i = -3; i <= 3; i++) {
        var p = R() * 6.28, q = R() * 6.28;
        var x = cx + i * sp + Math.sin(ph * 1.9 + p) * amp, y = cy + j * sp + Math.cos(ph * 2.3 + q) * amp;
        var ag = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 7);
        ag.addColorStop(0, "#ffffff"); ag.addColorStop(.5, heat > 0.05 ? KT.tint("#d4b48a", 1 + heat * .1) : "#b9c3d6"); ag.addColorStop(1, heat > 0.05 ? "#8a5a3a" : "#6f7a90");
        ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(x, y, 6.5, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = "#e8ecf2"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = "#8a93a5"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, 6.2832); ctx.stroke();
      var tip = I.P(BX1 - 20, BY - 7, BZ + 12);
      ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(40,50,80,.55)"; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(cx - r * 0.7, cy + r * 0.7); ctx.stroke(); ctx.restore();
      KT.pill(ctx, "🔍 원자 확대 — 데울수록 크게 흔들림", cx, cy + r + 24, { s: 11, a: "center", c: KC.ink, box: [0, W - 6] });
    }

    function drawPanel(d) {
      var y0 = DH + 8, h = H - y0;
      KT.studio(ctx, 0, y0, W, h, null);
      /* 왼쪽 — 늘어난 길이와 머리카락 */
      KT.card(ctx, 20, y0 + 12, 420, 128, null);
      ctx.fillStyle = LT.orange; ctx.beginPath(); ctx.roundRect(20, y0 + 12, 7, 128, [14, 0, 0, 14]); ctx.fill();
      lt(ctx, "막대 끝을 크게 확대해 보면", 230, y0 + 34, { s: 12, w: "900", a: "center", c: LT.orange });
      var maxUm = 350, bx0 = 44, bw = 372;
      lt(ctx, "늘어난 길이", bx0, y0 + 60, { s: 11, c: LT.mute });
      KT.bar(ctx, bx0, y0 + 68, bw, d / maxUm, LT.orange);
      lt(ctx, d.toFixed(1) + " µm", bx0 + bw, y0 + 60, { s: 13, w: "900", a: "right", c: LT.orange });
      lt(ctx, "머리카락 굵기", bx0, y0 + 102, { s: 11, c: LT.mute });
      KT.bar(ctx, bx0, y0 + 110, bw, HAIR / maxUm, "#8a96a8");
      lt(ctx, HAIR + " µm", bx0 + bw, y0 + 102, { s: 13, w: "900", a: "right", c: LT.ink });
      /* 오른쪽 — 이 자로 1 km를 재면 */
      KT.card(ctx, 460, y0 + 12, 420, 128, null);
      ctx.fillStyle = LT.violet; ctx.beginPath(); ctx.roundRect(460, y0 + 12, 7, 128, [14, 0, 0, 14]); ctx.fill();
      lt(ctx, "이 원기를 베낀 자로 1 km를 재면", 670, y0 + 34, { s: 12, w: "900", a: "center", c: LT.violet });
      lt(ctx, (ALPHA * T * 1000 * 1000).toFixed(1) + " mm", 670, y0 + 78, { s: 30, w: "900", a: "center", c: LT.violet });
      lt(ctx, "만큼 어긋난다", 670, y0 + 100, { s: 11.5, a: "center", c: LT.mute });
      lt(ctx, "ΔL = 1 m × 8.7 × 10⁻⁶ /℃ × " + T.toFixed(1) + " ℃", 670, y0 + 126, { s: 11.5, a: "center", c: LT.ink });
      lt(ctx, "금속은 데우면 늘어납니다. 기준이 ‘물건’이면 기준 자체가 날씨에 따라 달라집니다.", 24, H - 14, { s: 12, c: LT.mute });
    }

    function paint() {
      var d = dL();
      ctx.clearRect(0, 0, W, H);
      drawModel(d);
      drawPanel(d);
    }
    function draw() {
      var d = dL();
      paint();
      $("b-bar-info").innerHTML = "금고가 <b>" + T.toFixed(1) + " ℃</b> 일 때 원기는 <b>" + d.toFixed(1) + " µm</b> 늘어납니다" +
        (d < 1 ? " — 거의 0입니다. 이 자리가 ‘정확히 1 m’입니다." :
          d < HAIR ? " — 아직 머리카락 굵기(70 µm)보다 작습니다." :
          " — 머리카락 " + (d / HAIR).toFixed(1) + "개 굵기입니다.") +
        " 이 자로 1 km를 재면 <b>" + (ALPHA * T * 1000 * 1000).toFixed(1) + " mm</b> 어긋납니다.";

      var ch = false;
      if (d >= 99.5 && !got.a) { got.a = true; ch = true; }
      if (d <= 5 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("bBar", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.a && got.b) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>1 ℃마다 <b>8.7 µm</b>. 20 ℃면 <b>174 µm</b>로 머리카락 두 개 반, 그 자로 1 km를 재면 <b>17 cm</b> 넘게 어긋납니다. 기준이 물건이면 기준이 흔들립니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("b-t").addEventListener("input", function (e) {
      T = +e.target.value; $("b-t-val").textContent = T.toFixed(1) + " ℃"; draw();
    });
    $("b-t-val").textContent = T.toFixed(1) + " ℃";
    pauser("b-bar-play", mv);
    KT.animate(canvas, function (dt) { if (!mv.on) return; ph += dt / 1000 * 6; paint(); }, 24);
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m2-2", true);
  })();

  /* 장면 3 — 표준이 없던 시장 (계산 모형: 같은 ‘뼘 수’, 다른 길이) */
  (function () {
    var canvas = $("b-market"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var L = 150, mode = "span";
    var got = window.sthState("bMarket") || { a: false, b: false };
    var PEOPLE = [
      { who: "상인", icon: "🧑‍🌾", hand: 12, c: "--coral" },
      { who: "장터 심판", icon: "🧑‍⚖️", hand: 15, c: "--violet" },
      { who: "손님", icon: "🧑", hand: 18, c: "--brand" }
    ];
    function spans() { return Math.round(L / 12); }        /* 상인이 자기 뼘으로 센 수 */
    function think(p) { return mode === "span" ? p.hand * spans() : L; }
    function loss() { return mode === "span" ? think(PEOPLE[2]) - L : 0; }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var n = spans(), i, LW = 620, SC = 1.17, lo = loss(), X0 = 66;
      var PC = ["#ff922b", "#9775fa", "#4dabf7"], PD = ["#d9480f", "#5f3dc4", "#1864ab"], PT = [LT.orange, LT.violet, LT.blue];
      KT.studio(ctx, 0, 0, LW, H, { x: 312, y: 290, rx: 300, ry: 12 });
      KT.bigText(ctx, mode === "span" ? "“" + n + " 뼘” 주세요" : "“" + (L / 100).toFixed(2) + " m” 주세요", 18, 40, 24, "#ffffff");
      KT.bigText(ctx, mode === "span" ? "같은 말, 사람마다 다른 길이" : "누구에게나 같은 길이", 18, 66, 15, mode === "span" ? "#ffa8a8" : "#8ce99a");
      /* 좌판 뒤에 선 세 사람 — 손 크기가 다르다 */
      for (i = 0; i < 3; i++) {
        var hx = 372 + i * 92, hy = 58, p = PEOPLE[i];
        ctx.fillStyle = PC[i]; ctx.beginPath(); ctx.roundRect(hx - 17, hy + 14, 34, 46, [12, 12, 0, 0]); ctx.fill();
        ctx.fillStyle = "#f1c7a5"; ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3b2a1e"; ctx.beginPath(); ctx.arc(hx, hy - 3, 12, Math.PI, 0); ctx.fill();
        /* 펼친 손 — 한 뼘의 크기 */
        var hs = p.hand * 0.95, ax = hx + 24, ay = hy + 4;
        ctx.strokeStyle = PC[i]; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(hx + 12, hy + 24); ctx.lineTo(ax, ay + 10); ctx.stroke();
        ctx.fillStyle = "#f1c7a5"; ctx.beginPath(); ctx.ellipse(ax + 2, ay, hs * 0.32, hs * 0.38, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#f1c7a5"; ctx.lineWidth = 3.2;
        for (var f = 0; f < 5; f++) { var fa = -2.6 + f * 0.48; ctx.beginPath(); ctx.moveTo(ax + 2, ay); ctx.lineTo(ax + 2 + Math.cos(fa) * hs * 0.75, ay + Math.sin(fa) * hs * 0.75); ctx.stroke(); }
        ctx.lineCap = "butt";
        KT.pill(ctx, p.who, hx, 30, { a: "center", s: 12, c: ["#ffd8a8", "#d0bfff", "#a5d8ff"][i], box: [0, LW] });
      }
      /* 장터 좌판(나무 탁자) */
      var tg = ctx.createLinearGradient(0, 118, 0, 258); tg.addColorStop(0, "#ecd4a8"); tg.addColorStop(1, "#c99a63");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(40, 118); ctx.lineTo(604, 118); ctx.lineTo(614, 258); ctx.lineTo(14, 258); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(120,72,30,.15)"; ctx.lineWidth = 1;
      for (i = 1; i < 7; i++) { var yy = 118 + i * 20; ctx.beginPath(); ctx.moveTo(40 - 26 * i / 7, yy); ctx.lineTo(604 + 10 * i / 7, yy); ctx.stroke(); }
      ctx.fillStyle = "#94643a"; ctx.fillRect(14, 258, 600, 12);
      ctx.fillStyle = "#7a4f2b"; ctx.fillRect(34, 270, 14, 16); ctx.fillRect(580, 270, 14, 16);
      /* 세 사람이 떠올리는 길이 — 탁자 위에 잘라 놓은 천 */
      for (i = 0; i < PEOPLE.length; i++) {
        var pp = PEOPLE[i], y = 146 + i * 30, len = think(pp), lw2 = Math.min(536, len * SC);
        ctx.fillStyle = "rgba(60,35,10,.18)"; ctx.fillRect(X0 + 4, y + 10, lw2, 5);
        slab(ctx, X0, y, lw2, 10, 8, KT.tint(PC[i], 1.15), PC[i], PD[i]);
        if (mode === "span") {
          ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.5;
          for (var k = 1; k < n; k++) { var tx = X0 + k * pp.hand * SC; if (tx > X0 + lw2 - 2) break; ctx.beginPath(); ctx.moveTo(tx, y + 1); ctx.lineTo(tx, y + 9); ctx.lineTo(tx + 5, y - 3); ctx.stroke(); }
        }
        lt(ctx, mode === "span" ? pp.who + " · 한 뼘 " + pp.hand + " cm × " + n + " = " + len + " cm" : pp.who + " · " + len + " cm", X0, y - 8, { s: 12, w: "900", c: PT[i] });
      }
      /* 진짜 천 — 두루마리를 풀어 놓았다 */
      var cy = 236, cw = Math.max(8, L * SC);
      ctx.fillStyle = "rgba(60,35,10,.2)"; ctx.fillRect(X0 + 4, cy + 12, cw, 5);
      slab(ctx, X0, cy, cw, 12, 8, "#63e6be", "#2aa889", "#0b7a5e");
      ctx.save(); ctx.beginPath(); ctx.rect(X0, cy, cw, 12); ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2; for (var sx = X0 - 10; sx < X0 + cw; sx += 9) { ctx.beginPath(); ctx.moveTo(sx, cy + 12); ctx.lineTo(sx + 8, cy); ctx.stroke(); }
      ctx.restore();
      var rg = ctx.createLinearGradient(0, cy - 10, 0, cy + 14); rg.addColorStop(0, "#96f2d7"); rg.addColorStop(1, "#087f5b");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.roundRect(X0 - 16, cy - 10, 18, 24, 8); ctx.fill();
      lt(ctx, "진짜 천 " + L + " cm", X0, cy - 8, { s: 12, w: "900", c: LT.green });
      /* 실제 길이 선 */
      var ex = X0 + L * SC;
      KT.line(ctx, { x: ex, y: 124 }, { x: ex, y: 262 }, LT.green, 2.2, [6, 4]);
      KT.pill(ctx, "실제 " + L + " cm", ex, 290, { a: "center", s: 12, c: "#8ce99a", box: [0, LW] });
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 630, W, H, mode === "span" ? "뼘으로 잰 거래" : "미터자로 잰 거래"), px = cd.px, R = cd.R;
      lt(ctx, mode === "span" ? "손해 " + (lo * 200).toLocaleString() + " 원" : "손해 0 원", px, 62, { s: 22, w: "900", c: mode === "span" ? LT.red : LT.green });
      KT.row(ctx, "🧑‍🌾 상인", think(PEOPLE[0]) + " cm", px, R, 94, LT.orange);
      KT.row(ctx, "🧑‍⚖️ 장터 심판", think(PEOPLE[1]) + " cm", px, R, 116, LT.violet);
      KT.row(ctx, "🧑 손님", think(PEOPLE[2]) + " cm", px, R, 138, LT.blue);
      KT.row(ctx, "실제 길이", L + " cm", px, R, 160, LT.green);
      KT.row(ctx, "손님이 더 믿는 길이", lo + " cm", px, R, 188, lo >= 140 ? LT.red : LT.ink);
      KT.bar(ctx, px, 198, cd.w, lo / 150, lo >= 140 ? LT.red : LT.yellow);
      KT.tip(ctx, mode === "span" ? (lo >= 140 ? "140 cm 넘게 어긋났습니다" : "천을 더 길게 해 보세요") : "같은 기준 = 차이 0 cm", px - 4, 218, cd.w + 8, mode === "span" ? (lo >= 140 ? false : null) : true);
      lt(ctx, "1 cm 에 200 원으로 셈", px, 278, { s: 11, c: LT.mute });
$("b-market-info").innerHTML = mode === "span"
        ? "같은 말 “<b>" + n + " 뼘</b>”을 듣고도 세 사람이 떠올리는 길이가 <b>" + think(PEOPLE[0]) + " cm · " + think(PEOPLE[1]) + " cm · " + think(PEOPLE[2]) + " cm</b>로 다릅니다. 손님은 실제보다 <b>" + lo + " cm</b> 더 길다고 믿습니다."
        : "미터자로 재면 세 사람이 모두 <b>" + L + " cm</b>를 떠올립니다. 손 크기와 상관없이 <b>같은 기준</b>으로 말하기 때문입니다. 이것이 측정 표준의 쓸모입니다.";

      var ch = false;
      if (mode === "span" && lo >= 140 && !got.a) { got.a = true; ch = true; }
      if (mode === "meter" && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("bMarket", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-3a");
      if (got.b) done("m2-3b");
      if (got.a && got.b) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>표준이 없으면 같은 숫자가 사람마다 다른 길이를 뜻합니다. <b>측정 표준은 서로 다른 사람의 측정을 같은 자 위에 올려놓는 약속</b>입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("b-len").addEventListener("input", function (e) {
      L = +e.target.value; $("b-len-val").textContent = L + " cm"; draw();
    });
    var seg = $("b-mode");
    Array.prototype.forEach.call(seg.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(seg.querySelectorAll("button"), function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        mode = b.getAttribute("data-m");
        draw();
      });
    });
    $("b-len-val").textContent = L + " cm";
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m2-3", true);
  })();

  /* 장면 4 — 빛으로 만든 자 (계산 모형: 거리 = c × t) + 기준 분류 */
  (function () {
    var canvas = $("b-light"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var t = 5;                                   /* ns */
    var st = { on: !REDUCE }, ph = 0;
    var got = window.sthState("bLight") || { a: false, b: false };
    function dist() { return CLIGHT * t * 1e-9; }
    function xOf(m) { return 80 + clamp(m, 0, 3) / 3 * 700; }

    function render() {
      ctx.clearRect(0, 0, W, H);
      var d = dist(), i, ok = Math.abs(d - 1) <= 0.005, LW = 650;
      function X(m) { return 100 + clamp(m, 0, 3) / 3 * 500; }
      var xe = X(d);
      KT.studio(ctx, 0, 0, LW, H, { x: 326, y: 236, rx: 310, ry: 12 });
      KT.bigText(ctx, d.toFixed(4) + " m", 18, 46, 30, ok ? "#8ce99a" : "#ffd35a");
      KT.bigText(ctx, "빛이 " + t.toFixed(2) + " ns 동안 간 거리", 18, 72, 15, "#ffffff");
      lt(ctx, "빛 펄스는 아주 느리게 돌린 모습", LW - 14, 18, { s: 11, a: "right", c: LT.dim });
      /* 원자시계(입체) — 빛이 달린 시간을 잰다 */
      slab(ctx, 420, 40, 196, 54, 12, "#eef2f6", "#d5dce6", "#aab4c3");
      var lcd = ctx.createLinearGradient(0, 50, 0, 84); lcd.addColorStop(0, "#1e3a2c"); lcd.addColorStop(1, "#0b1a12");
      ctx.fillStyle = lcd; ctx.beginPath(); ctx.roundRect(432, 50, 128, 34, 6); ctx.fill();
      lt(ctx, t.toFixed(2) + " ns", 496, 74, { s: 18, w: "900", a: "center", c: "#8dffc0" });
      KT.planet(ctx, 590, 62, 7, "#ffe066", "#e67700");
      lt(ctx, "원자시계", 590, 88, { s: 11, w: "900", a: "center", c: LT.mute });
      ctx.strokeStyle = "rgba(60,70,90,.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(430, 94); ctx.bezierCurveTo(330, 112, 120, 92, 66, 128); ctx.stroke();
      /* 광학 받침대(긴 탁자) */
      var tg = ctx.createLinearGradient(0, 118, 0, 176); tg.addColorStop(0, "#eef1f6"); tg.addColorStop(1, "#cfd6e0");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(44, 118); ctx.lineTo(624, 118); ctx.lineTo(640, 176); ctx.lineTo(22, 176); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(60,70,90,.18)";
      for (var hx = 60; hx < 620; hx += 22) for (var hy = 126; hy < 170; hy += 11) { ctx.beginPath(); ctx.arc(hx + (hy - 118) * -0.25, hy, 1.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = "#5f6b80"; ctx.fillRect(22, 176, 618, 20);
      ctx.fillStyle = "#8a94a8"; ctx.fillRect(46, 196, 8, 34); ctx.fillRect(608, 196, 8, 34);
      /* 금속 자 — 탁자 앞쪽에 눕혀 놓았다 */
      slab(ctx, X(0) - 10, 160, 522, 9, 8, "#fbfcfe", "#c9d0da", "#8a94a8");
      for (i = 0; i <= 30; i++) {
        var m = i / 10, x = X(m), big = i % 5 === 0;
        ctx.strokeStyle = big ? "#141826" : "#3d4456"; ctx.lineWidth = big ? 1.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(x + 3, 156); ctx.lineTo(x, big ? 168 : 163); ctx.stroke();
        if (big) lt(ctx, m.toFixed(1) + " m", x, 191, { s: 12, a: "center", c: "#ffffff", w: "900" });
      }
      /* 레이저 장치(입체) + 빛 펄스 */
      var by = 142;
      slab(ctx, 30, by - 14, 62, 26, 12, "#c9d0da", "#7d8698", "#4a5266");
      ctx.fillStyle = "#e03131"; ctx.fillRect(90, by - 3, 6, 6);
      lt(ctx, "레이저", 61, by + 4, { s: 11, w: "900", a: "center", c: "#ffffff" });
      ctx.fillStyle = "rgba(255,80,80,.3)"; ctx.fillRect(96, by - 3, Math.max(0, xe - 96), 6);
      ctx.fillStyle = "#ff6b6b"; ctx.fillRect(96, by - 1.2, Math.max(0, xe - 96), 2.4);
      for (i = 0; i < 4; i++) { var px2 = 96 + ((ph + i / 4) % 1) * Math.max(0, xe - 96); KT.glow(ctx, px2, by, 3, "rgba(255,120,120,.95)", 3); }
      /* 검출기 — 빛이 간 끝에 세워 둔 받침 */
      slab(ctx, xe - 9, 154, 18, 5, 6, "#c9d0da", "#7d8698", "#4a5266");
      ctx.fillStyle = "#5c6476"; ctx.fillRect(xe - 2, 132, 4, 22);
      ctx.fillStyle = metal(ctx, xe - 6, 0, xe + 8, 0, "#ffffff", "#aab3c3", "#5b6476"); ctx.beginPath(); ctx.roundRect(xe - 5, 124, 12, 30, 3); ctx.fill();
      KT.planet(ctx, xe - 3, by, 5, "#ffc9c9", "#c92a2a");
      /* 1 m 자리 */
      KT.line(ctx, { x: X(1), y: 112 }, { x: X(1), y: 170 }, LT.green, 2.2, [5, 4]);
      KT.pill(ctx, "여기가 1 m", X(1), 108, { a: "center", s: 12, c: "#8ce99a", box: [0, LW] });
      KT.pill(ctx, "1 m의 정의 (1983년~) : 빛이 진공에서 1/299,792,458 초 동안 간 거리", 18, 256, { s: 12, c: "#a5d8ff", box: [0, LW] });
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 660, W, H, "빛으로 만든 자"), qx = cd.px, R = cd.R, okB = Math.abs(t - 1) <= 0.005;
      lt(ctx, d.toFixed(4) + " m", qx, 60, { s: 24, w: "900", c: ok ? LT.green : LT.orange });
      KT.row(ctx, "빛이 달린 시간 t", t.toFixed(2) + " ns", qx, R, 90, LT.blue);
      KT.row(ctx, "빛의 속력 c", "299,792,458 m/s", qx, R, 112);
      KT.row(ctx, "거리 d = c × t", d.toFixed(4) + " m", qx, R, 134, LT.violet);
      lt(ctx, "목표 ① 딱 1.000 m", qx, 160, { s: 11.5, c: LT.mute }); lt(ctx, (got.a || ok) ? "✓" : "", R, 160, { s: 14, w: "900", a: "right", c: LT.green });
      lt(ctx, "목표 ② 1.00 ns 일 때의 거리", qx, 182, { s: 11.5, c: LT.mute }); lt(ctx, (got.b || okB) ? "✓" : "", R, 182, { s: 14, w: "900", a: "right", c: LT.green });
      KT.tip(ctx, ok ? "1 m = 빛의 3.3356 ns" : okB ? "1 ns 에 약 30 cm" : (d < 1 ? "1 m까지 모자랍니다" : "1 m를 넘쳤습니다"), qx - 4, 196, cd.w + 8, ok || okB ? true : null);
      lt(ctx, "1 ns = 10⁻⁹ 초", qx, 254, { s: 11, c: LT.mute });
    }
    function draw() {
      render();
      var d = dist(), i, okR = Math.abs(d - 1) <= 0.005;
      $("b-light-read").innerHTML =
        "<span class='k'>빛이 달린 시간 t</span><span class='v b'>" + t.toFixed(2) + " ns</span>" +
        "<span class='k'>간 거리 d = c × t</span><span class='v y'>" + d.toFixed(4) + " m</span>" +
        "<span class='sub'>c = 299,792,458 m/s · 1 ns = 10⁻⁹ s</span>" +
        "<span class='ok " + (okR ? "g" : "r") + "'>" + (okR ? "1 m 완성 · 이 시간이 1/299,792,458 초" : "1.000 m까지 " + (d < 1 ? "모자랍니다" : "넘쳤습니다")) + "</span>";

      $("b-light-info").innerHTML = "빛이 <b>" + t.toFixed(2) + " ns</b> 동안 간 거리는 <b>" + d.toFixed(4) + " m</b>입니다. " +
        (Math.abs(d - 1) <= 0.005 ? "✅ 딱 1 m입니다. 이때의 시간이 <b>1/299,792,458 초</b>입니다."
          : Math.abs(t - 1) <= 0.005 ? "✅ 빛은 10억분의 1초에 <b>약 30 cm</b>를 갑니다. 손 한 뼘 반쯤입니다."
          : "손잡이를 움직여 1.000 m가 되는 시간과, 1.00 ns 일 때의 거리를 찾아보세요.");

      var ch = false;
      if (Math.abs(d - 1) <= 0.005 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(t - 1) <= 0.005 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("bLight", got); mission(); }
    }

    window.sthSort({
      mount: "s2-sort",
      buckets: [
        { id: "thing", label: "물건이나 몸에 매인 기준", sub: "늘어나고 닳고 잃어버릴 수 있다" },
        { id: "const", label: "자연 상수에 매인 기준", sub: "언제 어디서든 다시 만들 수 있다" }
      ],
      items: [
        { t: "사람의 뼘", a: "thing", why: "사람마다 다르고 자라면서 변합니다." },
        { t: "왕의 팔뚝 길이(큐빗)", a: "thing", why: "왕이 바뀌면 기준도 바뀌었습니다." },
        { t: "파리에 보관한 미터원기 막대", a: "thing", why: "금속이라 온도에 따라 늘어나고, 닳거나 잃어버릴 수도 있습니다." },
        { t: "국제 킬로그램 원기(1889~2019년)", a: "thing", why: "2019년에 플랑크 상수로 정의가 바뀌면서 물건의 자리에서 내려왔습니다.", hint: "2019년에 무슨 일이 있었나요?" },
        { t: "지구 자오선의 4천만분의 1", a: "thing", why: "자연물이지만 결국 지구를 실제로 측량해야 알 수 있습니다. 당시 측량 오차 때문에 미터원기는 이 길이보다 약 0.2 mm 짧습니다.", hint: "이 기준을 쓰려면 무엇을 직접 재야 할까요?" },
        { t: "빛이 1/299,792,458 초 동안 간 거리 (1 m)", a: "const", why: "빛의 속력을 값으로 못 박아 정의합니다." },
        { t: "세슘-133 원자가 9,192,631,770번 진동하는 시간 (1 s)", a: "const", why: "원자시계의 원리이고, 어디서 재도 같습니다." },
        { t: "플랑크 상수로 정한 1 kg", a: "const", why: "2019년부터 쓰는 킬로그램의 정의입니다." },
        { t: "볼츠만 상수로 정한 1 K", a: "const", why: "온도의 기본단위도 자연 상수에 묶여 있습니다." },
        { t: "아보가드로수로 정한 1 mol", a: "const", why: "입자 6.02214076 × 10²³ 개를 1 mol로 못 박았습니다." }
      ],
      doneText: "SI의 기본단위는 이제 모두 오른쪽에 있습니다.",
      onDone: function () { window.sthState("bSortDone", 1); mission(); }
    });

    function mission() {
      var sorted = !!window.sthState("bSortDone");
      if (got.a) done("m2-4a");
      if (got.b) done("m2-4b");
      if (sorted) done("m2-4c");
      if (got.a && got.b && sorted) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>1 m = 빛이 <b>3.3356 ns</b> 동안 간 거리. 기준을 <b>물건</b>에서 <b>자연 상수</b>로 옮기자, 금고를 열지 않아도 세계 어디서나 같은 1 m를 다시 만들 수 있게 되었습니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("b-ns").addEventListener("input", function (e) {
      t = +e.target.value; $("b-ns-val").textContent = t.toFixed(2) + " ns"; draw();
    });
    pauser("b-light-play", st);
    KT.animate(canvas, function (dt) { if (st.on) { ph = (ph + dt / 2400) % 1; render(); } });
    $("b-ns-val").textContent = t.toFixed(2) + " ns";
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("m2-4", true);
  })();

  /* 장면 5 — 결말 */
  function finish() {
    window.sthState("r2", "해결 · 원기는 20 ℃에서 174 µm 늘어남 · 1 m = 빛이 3.3356 ns 동안 간 거리");
  }
  function paintVs() {
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 어림</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 20 ℃에서 174 µm, 곧 0.17 mm 였습니다."
        : "20 ℃에서 174 µm(0.17 mm)였습니다. 눈에는 안 보이지만, 그 자로 1 km를 재면 17 cm가 어긋납니다.") +
      "<br><b>내가 찾은 1 m</b> 빛이 3.3356 ns 동안 간 거리";
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();

  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅰ-2] 이야기 ② 1미터를 다시 정하는 회의",
    items: [
      { id: "w2", label: "표준이 필요한 이유", hint: "측정 표준이 없었다면 곤란해졌을 상황을 하나 들고, 왜 그런지 쓰세요." },
      { id: "e2b", label: "기준을 물건에서 옮긴 까닭", hint: "1 m의 기준이 금속 막대에서 빛으로 바뀐 까닭을, 이 이야기에서 확인한 숫자를 들어 쓰세요. 2019년 킬로그램 재정의와 묶어 설명하면 좋습니다." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 30 cm를 다투는 사람들
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  /* 장면 1 — 분야 지도 + 첫 어림 */
  (function () {
    var canvas = $("c-fields"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var sel = -1;
    var FIELDS = [
      { icon: "🛰️", name: "위성 항법(GPS)", e: -9, unit: "초", desc: "원자시계로 <b>10억분의 1초(ns)</b> 단위의 시간을 재어 거리를 계산합니다. 시간이 곧 위치입니다." },
      { icon: "🏭", name: "반도체 공정", e: -9, unit: "m", desc: "회로의 선폭을 <b>나노미터(10⁻⁹ m)</b> 단위로 재고 다스립니다. 머리카락 굵기의 만분의 일 수준입니다." },
      { icon: "🏥", name: "의료 영상 진단", e: -3, unit: "m", desc: "MRI·CT는 몸에서 오는 미세한 신호를 재어 <b>밀리미터</b> 단위의 단면 영상을 만듭니다." },
      { icon: "🌡️", name: "기후 관측", e: -1, unit: "℃", desc: "전 세계 관측소가 <b>같은 표준</b>으로 기온·기압을 재기 때문에, 수십 년치를 한 그래프에 올려 견줄 수 있습니다." },
      { icon: "⚖️", name: "거래와 무역", e: -3, unit: "kg", desc: "질량·부피의 표준 단위가 있어야 <b>공정한 상거래</b>가 됩니다. 저울 검정이 법으로 정해져 있는 까닭입니다." },
      { icon: "🚀", name: "우주 탐사", e: 0, unit: "m", desc: "탐사선의 거리와 속도를 정밀하게 재어 궤도를 계산합니다. 작은 오차가 아홉 달 뒤 큰 어긋남이 됩니다." }
    ];
    /* 측정 도시 미니어처 — 분야마다 작은 모형 하나. 모형을 누르면 고른다 */
    var IC = KT.iso({ ox: 272, oy: 104, s: 0.74, L: 400, D: 270 });
    var SPOT = [[200, 62], [332, 62], [200, 204], [70, 204], [332, 204], [70, 62]];   /* FIELDS 순서대로 놓인 자리(블록 좌표) */
    var HIT = [];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, I = IC, LW = 590;
      KT.studio(ctx, 0, 0, LW, H, { x: 314, y: 352, rx: 270, ry: 18 });
      /* 얇은 받침 + 잔디와 길 */
      I.face(ctx, "front", function (Lw) { ctx.fillStyle = "#b99a6e"; ctx.fillRect(0, -12, Lw, 12); });
      I.face(ctx, "right", function (Lw) { ctx.fillStyle = "#8f7451"; ctx.fillRect(0, -12, Lw, 12); });
      I.plane(ctx, 0, "#cfe3a8");
      I.plane(ctx, 0.2, "#c3c9d2", null, 0, 400, 128, 146);
      I.plane(ctx, 0.2, "#c3c9d2", null, 128, 144, 0, 270);
      I.plane(ctx, 0.2, "#c3c9d2", null, 262, 278, 0, 270);
      HIT = [];
      var order = [5, 0, 3, 1, 2, 4];
      for (var oi = 0; oi < order.length; oi++) {
        var k = order[oi], sx = SPOT[k][0], sy = SPOT[k][1], on = k === sel, p = I.P(sx, sy, 0);
        if (on) { ctx.fillStyle = "rgba(232,89,12,.28)"; ctx.beginPath(); ctx.ellipse(p.x, p.y, 62, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = LT.orange; ctx.lineWidth = 2.5; ctx.stroke(); }
        drawSpot(k, sx, sy, I);
        HIT.push({ k: k, x: p.x, y: p.y - 26 });
      }
      /* 이름표 — 모형 아래 땅 위에 */
      var LAB = [[0, 16], [30, 18], [0, 18], [-14, 18], [26, 18], [-34, 10]];
      for (i = 0; i < FIELDS.length; i++) {
        var q = I.P(SPOT[i][0], SPOT[i][1], 0), on2 = i === sel;
        KT.pill(ctx, FIELDS[i].name, q.x + LAB[i][0], q.y + LAB[i][1] + 12, { a: "center", s: 12, c: on2 ? "#ffd8a8" : "#ffffff", bg: on2 ? "rgba(160,60,10,.9)" : "rgba(20,28,48,.78)", box: [0, LW] });
      }
      KT.bigText(ctx, "정밀 측정이 떠받치는 분야", 22, 40, 20, "#ffffff");
      KT.pill(ctx, sel < 0 ? "👆 모형을 눌러 보세요" : "👆 다른 모형도 눌러 보세요", 22, 72, { s: 12, c: "#ffe8a3", box: [0, LW] });

      /* 오른쪽 카드 — 요구 정밀도 사다리 */
      var cd = sideCard(ctx, 600, W, H, "어느 자릿수까지 재는가"), px = cd.px, R = cd.R;
      if (sel >= 0) {
        lt(ctx, FIELDS[sel].icon + " " + FIELDS[sel].name, px, 60, { s: 18, w: "900", c: LT.orange });
        lt(ctx, "약 10" + sup(FIELDS[sel].e) + " " + FIELDS[sel].unit + " 까지 잰다", px, 84, { s: 13, w: "900", c: LT.ink });
      } else {
        lt(ctx, "모형을 고르면", px, 60, { s: 16, w: "900", c: LT.mute });
        lt(ctx, "사다리에서 그 자리가 빛납니다", px, 84, { s: 12, c: LT.mute });
      }
      function yE(e) { return 120 + (-e) / 12 * 214; }
      var bx = px + 52;
      var lg = ctx.createLinearGradient(0, yE(0), 0, yE(-12)); lg.addColorStop(0, "#4dabf7"); lg.addColorStop(1, "#9775fa");
      ctx.fillStyle = lg; ctx.beginPath(); ctx.roundRect(bx - 5, yE(0) - 6, 10, yE(-12) - yE(0) + 12, 5); ctx.fill();
      for (i = 0; i >= -12; i -= 3) {
        ctx.strokeStyle = LT.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx - 10, yE(i)); ctx.lineTo(bx - 5, yE(i)); ctx.stroke();
        lt(ctx, "10" + sup(i), bx - 14, yE(i) + 4, { s: 12, a: "right", c: LT.ink, w: "900" });
      }
      lt(ctx, "↑ 거칠게", px, 108, { s: 11, c: LT.mute }); lt(ctx, "↓ 더 미세하게", px, H - 14, { s: 11, c: LT.mute });
      var grp = {};
      for (i = 0; i < FIELDS.length; i++) { var e2 = FIELDS[i].e; (grp[e2] = grp[e2] || []).push(i); }
      Object.keys(grp).forEach(function (e3) {
        var ids = grp[e3], yy = yE(+e3), hit = ids.indexOf(sel) >= 0;
        KT.planet(ctx, bx, yy, hit ? 8 : 5.5, hit ? "#ffc078" : "#a5d8ff", hit ? "#d9480f" : "#1864ab");
        var s2 = ids.map(function (j) { return FIELDS[j].icon + " " + FIELDS[j].name.replace(/\(.*\)/, ""); }).join(" · ");
        lt(ctx, s2, bx + 14, yy + 4, { s: 12, w: hit ? "900" : "700", c: hit ? LT.orange : LT.mute });
      });
      if (sel >= 0) {
        $("c-fields-info").innerHTML = "<b>" + FIELDS[sel].icon + " " + FIELDS[sel].name + "</b> — " + FIELDS[sel].desc +
          "<br>요구 정밀도는 약 <b>10" + sup(FIELDS[sel].e) + " " + FIELDS[sel].unit + "</b> 수준입니다.";
      }
    }
    /* 분야별 작은 모형 */
    function drawSpot(k, x, y, I) {
      var p = I.P(x, y, 0), j;
      if (k === 0) {                         /* 위성 항법: 지상 안테나 + 하늘의 위성 */
        I.box(ctx, x - 14, y - 14, 0, x + 14, y + 14, 10, "#e9ecef", "#ced4da", "#adb5bd");
        var d0 = I.P(x, y, 34);
        ctx.fillStyle = "#868e96"; ctx.fillRect(d0.x - 2, d0.y, 4, 22);
        ctx.fillStyle = metal(ctx, d0.x - 22, 0, d0.x + 22, 0, "#ffffff", "#ced4da", "#868e96"); ctx.beginPath(); ctx.ellipse(d0.x, d0.y, 22, 11, -0.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#495057"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(d0.x, d0.y); ctx.lineTo(d0.x + 10, d0.y - 14); ctx.stroke();
        var sx = 470, sy = 46;
        KT.line(ctx, { x: sx, y: sy + 8 }, { x: d0.x + 10, y: d0.y - 14 }, "#f59f00", 1.6, [5, 4]);
        ctx.fillStyle = "#1c7ed6"; ctx.fillRect(sx - 40, sy - 6, 26, 12); ctx.fillRect(sx + 14, sy - 6, 26, 12);
        ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1; for (j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(sx - 40 + j * 9, sy - 6); ctx.lineTo(sx - 40 + j * 9, sy + 6); ctx.moveTo(sx + 14 + j * 9, sy - 6); ctx.lineTo(sx + 14 + j * 9, sy + 6); ctx.stroke(); }
        ctx.fillStyle = metal(ctx, sx - 12, 0, sx + 12, 0, "#ffe8a3", "#f2c94c", "#a8781d"); ctx.beginPath(); ctx.roundRect(sx - 12, sy - 10, 24, 20, 4); ctx.fill();
        KT.pill(ctx, "GPS 위성 · 원자시계", sx, sy - 18, { a: "center", s: 11, c: "#ffe8a3", box: [0, 590] });
      } else if (k === 1) {                  /* 반도체 공장 */
        I.box(ctx, x - 40, y - 30, 0, x + 40, y + 30, 34, "#f1f3f5", "#dee2e6", "#adb5bd");
        I.box(ctx, x - 30, y - 20, 34, x - 6, y + 4, 44, "#e9ecef", "#ced4da", "#868e96");
        I.box(ctx, x + 6, y - 20, 34, x + 30, y + 4, 44, "#e9ecef", "#ced4da", "#868e96");
        var w0 = I.P(x - 20, y + 30, 18);
        ctx.fillStyle = "#4dabf7"; ctx.beginPath(); ctx.ellipse(w0.x + 12, w0.y - 4, 9, 5, 0.52, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1; ctx.stroke();
      } else if (k === 2) {                  /* 병원 — 영상 진단 */
        I.box(ctx, x - 36, y - 26, 0, x + 36, y + 26, 46, "#ffffff", "#e9ecef", "#ced4da");
        var c0 = I.P(x + 4, y + 26, 30);
        ctx.fillStyle = "#e03131"; ctx.fillRect(c0.x - 3, c0.y - 9, 6, 18); ctx.fillRect(c0.x - 9, c0.y - 3, 18, 6);
        var r0 = I.P(x + 36, y - 6, 18);
        ctx.strokeStyle = "#748ffc"; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(r0.x, r0.y, 6, 11, 0.5, 0, Math.PI * 2); ctx.stroke();
        for (j = 0; j < 3; j++) { var wn = I.P(x - 26 + j * 16, y + 26, 38); ctx.fillStyle = "#a5d8ff"; ctx.fillRect(wn.x - 4, wn.y - 4, 8, 6); }
      } else if (k === 3) {                  /* 기후 관측소 — 백엽상과 풍향계 */
        for (j = 0; j < 4; j++) { var lg0 = I.P(x - 10 + (j % 2) * 20, y - 10 + Math.floor(j / 2) * 20, 0); ctx.fillStyle = "#adb5bd"; ctx.fillRect(lg0.x - 1, lg0.y - 18, 2, 18); }
        I.box(ctx, x - 14, y - 14, 18, x + 14, y + 14, 42, "#ffffff", "#f1f3f5", "#ced4da");
        var lv = I.P(x - 14, y + 14, 18);
        ctx.strokeStyle = "rgba(80,90,110,.35)"; ctx.lineWidth = 1; for (j = 1; j < 5; j++) { ctx.beginPath(); ctx.moveTo(lv.x + 2, lv.y - j * 4.4); ctx.lineTo(lv.x + 18, lv.y - j * 4.4 + 9); ctx.stroke(); }
        var pl = I.P(x + 30, y - 20, 0);
        ctx.fillStyle = "#868e96"; ctx.fillRect(pl.x - 1.5, pl.y - 66, 3, 66);
        for (j = 0; j < 3; j++) { var ca = j * 2.09; KT.planet(ctx, pl.x + Math.cos(ca) * 12, pl.y - 66 + Math.sin(ca) * 4, 3.5, "#ffa8a8", "#c92a2a"); }
      } else if (k === 4) {                  /* 거래와 무역 — 컨테이너와 계량대 */
        var CC = [["#f08c00", "#d9480f"], ["#1c7ed6", "#1864ab"], ["#2b8a3e", "#1e6b30"]];
        I.box(ctx, x - 40, y - 24, 0, x + 6, y - 4, 18, KT.tint(CC[0][0], 1.2), CC[0][0], CC[0][1]);
        I.box(ctx, x - 40, y, 0, x + 6, y + 20, 18, KT.tint(CC[1][0], 1.2), CC[1][0], CC[1][1]);
        I.box(ctx, x - 40, y - 24, 18, x + 6, y - 4, 36, KT.tint(CC[2][0], 1.2), CC[2][0], CC[2][1]);
        I.box(ctx, x + 14, y - 20, 0, x + 44, y + 22, 3, "#ced4da", "#adb5bd", "#868e96");
        I.box(ctx, x + 22, y - 6, 3, x + 38, y + 10, 16, "#ffe8cc", "#e8c191", "#c49a62");
      } else {                               /* 우주 탐사 — 발사대의 로켓 */
        I.box(ctx, x - 26, y - 26, 0, x + 26, y + 26, 8, "#dee2e6", "#adb5bd", "#868e96");
        var tw = I.P(x - 16, y - 16, 8);
        ctx.strokeStyle = "#e8590c"; ctx.lineWidth = 2; ctx.strokeRect(tw.x - 5, tw.y - 84, 10, 84);
        for (j = 0; j < 8; j++) { ctx.beginPath(); ctx.moveTo(tw.x - 5, tw.y - j * 10.5); ctx.lineTo(tw.x + 5, tw.y - j * 10.5 - 10.5); ctx.stroke(); }
        var rb = I.P(x + 4, y + 4, 8);
        var rg = ctx.createLinearGradient(rb.x - 9, 0, rb.x + 9, 0); rg.addColorStop(0, "#ffffff"); rg.addColorStop(1, "#adb5bd");
        ctx.fillStyle = rg; ctx.fillRect(rb.x - 8, rb.y - 76, 16, 70);
        ctx.beginPath(); ctx.moveTo(rb.x - 8, rb.y - 76); ctx.quadraticCurveTo(rb.x, rb.y - 100, rb.x + 8, rb.y - 76); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#e03131"; ctx.beginPath(); ctx.moveTo(rb.x - 8, rb.y - 22); ctx.lineTo(rb.x - 16, rb.y - 6); ctx.lineTo(rb.x - 8, rb.y - 8); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(rb.x + 8, rb.y - 22); ctx.lineTo(rb.x + 16, rb.y - 6); ctx.lineTo(rb.x + 8, rb.y - 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#1c7ed6"; ctx.beginPath(); ctx.arc(rb.x, rb.y - 56, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    canvas._redraw = draw;
    canvas.addEventListener("click", function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas._w / rect.width);
      var my = (e.clientY - rect.top) * (canvas._h / rect.height);
      var best = -1, bd = 70;
      for (var i = 0; i < HIT.length; i++) { var dd = Math.hypot(mx - HIT[i].x, (my - HIT[i].y) * 1.2); if (dd < bd) { bd = dd; best = HIT[i].k; } }
      if (best >= 0) { sel = best; draw(); }
    });
    draw();
  })();

  window.sthGate({
    gate: "g3", key: "p3", title: "하윤이의 첫 어림",
    question: "GPS 위성의 시계가 100만분의 1초(1 µs)만 틀리면, 내 위치는 얼마나 어긋날까요?",
    options: ["㉠ 1 mm 쯤", "㉡ 30 cm 쯤", "㉢ 300 m 쯤"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 시계 오차와 위치 오차 (계산 모형: 거리 = c × Δt) */
  (function () {
    var canvas = $("c-gps"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var dt = 200;                                    /* ns */
    var st = { on: !REDUCE }, ph = 0;
    var got = window.sthState("cGps") || { a: false, b: false };
    function err() { return CLIGHT * dt * 1e-9; }    /* m */

    function render() {
      ctx.clearRect(0, 0, W, H);
      var e = err(), i, j, ecol = e <= 10 ? KC.green : e > 100 ? KC.red : KC.orange;
      var LW = 632, L = 420, D = 220, I = KT.iso({ ox: 330, oy: 160, s: 0.76, L: L, D: D }), CXm = 215, CYm = 204;
      KT.studio(ctx, 0, 0, LW, H, { x: 330, y: 404, rx: 300, ry: 22 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 땅 블록: 앞·오른쪽 면은 흙과 암석 층 */
      I.box(ctx, 0, 0, -26, L, D, 0, "#cfd8c4", "#9b7651", "#7c5c3e");
      ["front", "right"].forEach(function (sd) {
        I.face(ctx, sd, function (Lw) {
          ctx.fillStyle = "#b08a5f"; ctx.fillRect(0, -9, Lw, 9);
          ctx.fillStyle = "#8a8f99"; ctx.fillRect(0, -26, Lw, 8);
          var R = KT.rng(sd === "front" ? 3 : 8); ctx.fillStyle = "rgba(60,40,20,.35)";
          for (var q = 0; q < Lw / 4; q++) ctx.fillRect(R() * Lw, -26 + R() * 26, 1.6, 1.6);
        });
      });
      I.shade(ctx, "right", function () { return 0; });
      /* 땅 윗면: 잔디 + 길 */
      I.plane(ctx, 0, "#b9d39a");
      I.plane(ctx, 0.2, "#5c6370", null, 0, L, 104, 118); I.plane(ctx, 0.2, "#5c6370", null, 134, 148, 0, D); I.plane(ctx, 0.2, "#5c6370", null, 284, 298, 0, D);
      /* 오차 원(땅 위) — 파란 점이 찍힐 수 있는 범위 */
      var Rm = Math.max(2, e), N = 72, k;
      ctx.save(); var t0 = I.P(0, 0, 0.5), t1 = I.P(L, 0, 0.5), t2 = I.P(L, D, 0.5), t3 = I.P(0, D, 0.5);
      ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.closePath(); ctx.clip();
      ctx.beginPath();
      for (k = 0; k <= N; k++) { var pp = I.P(CXm + Rm * Math.cos(k / N * 6.2832), CYm + Rm * Math.sin(k / N * 6.2832), 0.5); if (k) ctx.lineTo(pp.x, pp.y); else ctx.moveTo(pp.x, pp.y); }
      ctx.fillStyle = "rgba(28,126,214,.22)"; ctx.fill(); ctx.strokeStyle = "#1c7ed6"; ctx.lineWidth = 2.2; ctx.stroke();
      if (Rm > 8) {
        ctx.beginPath();
        for (k = 0; k <= N; k++) { var pq = I.P(CXm + Rm * ph * Math.cos(k / N * 6.2832), CYm + Rm * ph * Math.sin(k / N * 6.2832), 0.5); if (k) ctx.lineTo(pq.x, pq.y); else ctx.moveTo(pq.x, pq.y); }
        ctx.strokeStyle = "rgba(28,126,214," + (0.6 * (1 - ph)) + ")"; ctx.lineWidth = 1.5; ctx.stroke();
      }
      ctx.restore();
      /* 건물(뒤에서 앞으로) — 가운데 칸이 학교 */
      var B = [[14, 12, 120, 92, 60, "#dfe4ec"], [152, 12, 280, 92, 46, "#e6dccd"], [302, 12, 410, 92, 80, "#dfe4ec"],
               [14, 126, 120, 210, 22, "#e6dccd"], [302, 126, 410, 210, 26, "#dfe4ec"]];
      B.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
      function bld(b) { I.box(ctx, b[0], b[1], 0, b[2], b[3], b[4], "#f4f6f9", b[5], KT.tint(b[5].length === 7 ? b[5] : "#dfe4ec", 0.78));
        ctx.fillStyle = "rgba(60,90,130,.35)";
        for (var wy = 10; wy < b[4] - 6; wy += 14) for (var wx = b[0] + 8; wx < b[2] - 6; wx += 16) { var w0 = I.P(wx, b[3], wy), w1 = I.P(wx + 8, b[3], wy), w2 = I.P(wx + 8, b[3], wy + 7), w3 = I.P(wx, b[3], wy + 7); I.quad(ctx, w0, w1, w2, w3, "rgba(70,110,160,.45)"); } }
      B.forEach(function (b) { if (b[0] + b[1] < 300) bld(b); });
      I.house(ctx, 168, 132, 0, 94, 60, 26, "#c0553f");
      var fp = I.P(250, 140, 0); ctx.fillStyle = "#6b7384"; ctx.fillRect(fp.x, fp.y - 52, 2, 52); ctx.fillStyle = "#e03131"; ctx.fillRect(fp.x + 2, fp.y - 52, 12, 8);
      B.forEach(function (b) { if (b[0] + b[1] >= 300) bld(b); });
      I.person(ctx, CXm, CYm, 0, "#e03131", 1.6);
      /* 파란 점(지도 앱이 찍은 자리) — 오차 원의 가장자리 쪽 */
      var pin = I.P(CXm + Rm * 0.82 * Math.cos(-0.5), CYm + Rm * 0.82 * Math.sin(-0.5), 0);
      ctx.fillStyle = "rgba(20,30,60,.25)"; ctx.beginPath(); ctx.ellipse(pin.x, pin.y, 6, 2.4, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#1c7ed6"; ctx.beginPath(); ctx.arc(pin.x, pin.y - 22, 9, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(pin.x, pin.y - 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(pin.x, pin.y - 22, 3.6, 0, 6.2832); ctx.fill();
      /* 위성과 신호 */
      var me = I.P(CXm, CYm, 18);
      [[52, 52], [190, 30], [452, 26], [584, 66]].forEach(function (s, j2) {
        ctx.save(); ctx.strokeStyle = "rgba(255,170,40,.75)"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.lineDashOffset = -ph * 40;
        ctx.beginPath(); ctx.moveTo(s[0], s[1] + 6); ctx.lineTo(me.x, me.y); ctx.stroke(); ctx.restore();
        ctx.fillStyle = "#3b5bdb"; ctx.fillRect(s[0] - 26, s[1] - 4, 17, 8); ctx.fillRect(s[0] + 9, s[1] - 4, 17, 8);
        ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 0.8; ctx.strokeRect(s[0] - 26, s[1] - 4, 17, 8); ctx.strokeRect(s[0] + 9, s[1] - 4, 17, 8);
        ctx.fillStyle = metal(ctx, s[0] - 8, s[1] - 8, s[0] + 8, s[1] + 8, "#fff3b8", "#e2a52a", "#8a5a10"); ctx.fillRect(s[0] - 8, s[1] - 8, 16, 16);
      });
      ctx.restore();
      /* 이름표 */
      var lb = [0, LW];
      I.label(ctx, 215, 162, 40, "🏫 학교 — 내가 서 있는 곳", -150, -64, "#8ce99a", lb);
      if (Rm > 6) KT.pill(ctx, "📍 지도 앱이 찍은 자리", pin.x + 12, pin.y - 30, { s: 11.5, c: "#a5d8ff", box: lb });
      var s0 = I.P(0, D, 0), s1 = I.P(100, D, 0);
      ctx.strokeStyle = LT.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(s0.x, s0.y + 22); ctx.lineTo(s1.x, s1.y + 22); ctx.stroke();
      KT.pill(ctx, "100 m", (s0.x + s1.x) / 2 - 14, (s0.y + s1.y) / 2 + 44, { s: 11, c: "#e8ecff", box: lb });
      KT.bigText(ctx, "위치 오차 " + (e < 10 ? e.toFixed(1) : Math.round(e)) + " m", 16, 128, 24, e <= 10 ? "#8ce99a" : e > 100 ? "#ff8787" : "#ffd35a");
      KT.warn(ctx, 16, H - 14, "⚠ 위성 높이(약 2만 km)는 그림에 담을 수 없어 낮게 그림");
      /* 오른쪽 계산 카드 */
      var cd = sideCard(ctx, 642, W, H, "거리 = 빛의 속력 × 시간"), px = cd.px, R = cd.R;
      var verdict = e <= 10 ? "🏫 같은 건물 안을 가리킨다" : e <= 30 ? "🚪 건물 앞마당쯤" : e <= 100 ? "🚸 길 건너편" : "🏙 옆 블록으로 건너뛴다";
      lt(ctx, e.toFixed(2) + " m", px, 66, { s: 26, w: "900", c: e <= 10 ? LT.green : e > 100 ? LT.red : LT.orange });
      KT.row(ctx, "빛의 속력", "299,792,458 m/s", px, R, 100);
      KT.row(ctx, "위성 시계 오차", dt + " ns", px, R, 124, LT.blue);
      KT.row(ctx, "위치 오차", e.toFixed(2) + " m", px, R, 148, LT.violet);
      KT.tip(ctx, verdict, px - 4, 164, cd.w + 8, e <= 10 ? true : e > 100 ? false : null);
      lt(ctx, "목표 ① 10 m 이내", px, 222, { s: 11.5, c: LT.mute }); lt(ctx, (got.a || e <= 10) ? "✓" : "", R, 222, { s: 14, w: "900", a: "right", c: LT.green });
      lt(ctx, "목표 ② 100 m 넘게", px, 246, { s: 11.5, c: LT.mute }); lt(ctx, (got.b || e > 100) ? "✓" : "", R, 246, { s: 14, w: "900", a: "right", c: LT.green });
      lt(ctx, "1 ns 틀리면 30 cm,", px, 284, { s: 11.5, w: "900", c: LT.violet });
      lt(ctx, "1 µs 틀리면 약 300 m", px, 304, { s: 11.5, w: "900", c: LT.orange });
      lt(ctx, "상대성 이론 보정을 하지 않으면", px, 340, { s: 10.5, c: LT.mute });
      lt(ctx, "위성 시계는 하루 약 38 µs 어긋나", px, 358, { s: 10.5, c: LT.mute });
      lt(ctx, "하루 11 km가 넘는 위치 오차가 된다", px, 376, { s: 10.5, c: LT.mute });
      lt(ctx, "그래서 GPS 위성은 원자시계를 싣는다", px, 408, { s: 10.5, w: "900", c: LT.ink });
    }    function draw() {
      render();
      var e = err();
      var verdict = e <= 10 ? "🏫 같은 건물 안을 가리킨다" : e <= 30 ? "🚪 건물 앞마당쯤" : e <= 100 ? "🚸 길 건너편" : "🏙 옆 블록으로 건너뛴다";

      $("c-gps-info").innerHTML = "시계 오차 <b>" + dt + " ns</b> × 빛의 속력 = 위치 오차 <b>" + e.toFixed(2) + " m</b> · " + verdict +
        "<br>" + (e <= 10 ? "이 정도라야 지도 앱이 건물을 제대로 짚습니다."
          : e > 100 ? "파란 점이 엉뚱한 건물 위에 찍히는 수준입니다."
          : "손잡이를 움직여 10 m 이내와 100 m 초과를 각각 만들어 보세요.");

      var ch = false;
      if (e <= 10 && !got.a) { got.a = true; ch = true; }
      if (e > 100 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("cGps", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.a && got.b) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>위치를 <b>10 m</b> 안쪽으로 맞추려면 시계가 <b>30 ns</b> 안쪽까지 맞아야 하고, <b>340 ns</b>만 틀려도 <b>100 m</b>를 넘어갑니다. 시간을 재는 일이 곧 위치를 재는 일입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("c-dt").addEventListener("input", function (e2) {
      dt = +e2.target.value; $("c-dt-val").textContent = dt + " ns"; draw();
    });
    pauser("c-gps-play", st);
    KT.animate(canvas, function (t) { if (st.on) { ph = (ph + t / 1800) % 1; render(); } });
    $("c-dt-val").textContent = dt + " ns";
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m3-2", true);
  })();

  /* 장면 3 — 선폭과 수율 (계산 모형: 정규분포 · 허용 범위 ±10 %) */
  (function () {
    var canvas = $("c-chip"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var w = 10, sd = 0.8;
    var got = window.sthState("cChip") || { a: false, b: false };
    function tol() { return 0.1 * w; }
    function yieldOf() { return erf(tol() / (sd * Math.SQRT2)); }

    /* 웨이퍼 위 칩 자리(원 안의 격자) — 칩마다 정해 둔 난수로 살아남을지 정한다 */
    var DIES = (function () {
      var r = KT.rng(5), out = [], a, b, st = 0.105;
      for (a = -1; a < 1; a += st) for (b = -1; b < 1; b += st) {
        var ok = [[a, b], [a + st, b], [a, b + st], [a + st, b + st]].every(function (q) { return q[0] * q[0] + q[1] * q[1] < 0.9; });
        if (ok) out.push([a, b, r()]);
      }
      return out;
    })();
    var ZW = [-1.75, -0.95, -0.3, 0.35, 1.05, 2.05];         /* 돋보기 속 여섯 줄의 공정 오차(표준편차 배수) */
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var y = yieldOf(), half = Math.max(4 * sd, 1.6 * tol()), i, LW = 600, lo = w - tol(), hi = w + tol();
      KT.studio(ctx, 0, 0, LW, H, { x: 232, y: 282, rx: 200, ry: 16 });
      KT.bigText(ctx, "수율 " + (y * 100).toFixed(1) + " %", 16, 42, 26, y >= 0.95 ? "#8ce99a" : "#ff8787");
      KT.bigText(ctx, "목표 " + w + " nm ± " + tol().toFixed(1), 16, 68, 15, "#ffffff");
      /* 받침(척) + 웨이퍼 */
      var WX = 232, WY = 178, RX = 186, RY = 80;
      var cg = ctx.createLinearGradient(WX - 120, 0, WX + 120, 0); cg.addColorStop(0, "#ced4da"); cg.addColorStop(0.5, "#f1f3f5"); cg.addColorStop(1, "#868e96");
      ctx.fillStyle = cg; ctx.fillRect(WX - 118, WY + 20, 236, 58);
      ctx.beginPath(); ctx.ellipse(WX, WY + 78, 118, 26, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = "#5c6476"; ctx.beginPath(); ctx.ellipse(WX, WY + 9, RX, RY, 0, 0, Math.PI * 2); ctx.fill();
      var wg = ctx.createLinearGradient(WX - RX, WY - RY, WX + RX, WY + RY); wg.addColorStop(0, "#f5f7fb"); wg.addColorStop(0.5, "#b8c0d0"); wg.addColorStop(1, "#7d869c");
      ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(WX, WY, RX, RY, 0, 0, Math.PI * 2); ctx.fill();
      var mark = null;
      for (i = 0; i < DIES.length; i++) {
        var D0 = DIES[i], dx = WX + D0[0] * RX, dy = WY + D0[1] * RY, good = D0[2] < y;
        ctx.fillStyle = good ? "rgba(18,184,134,.9)" : "rgba(240,62,62,.9)";
        ctx.fillRect(dx + 1, dy + 0.8, 0.105 * RX - 2, 0.105 * RY - 1.6);
        if (!mark && D0[0] > 0.3 && D0[1] < -0.35) mark = { x: dx + 0.052 * RX, y: dy + 0.052 * RY };
      }
      ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.beginPath(); ctx.ellipse(WX - 60, WY - 34, 70, 14, -0.15, 0, Math.PI * 2); ctx.fill();
      /* 돋보기 — 칩 한 개의 회로선 여섯 줄 */
      var MX = 520, MY = 104, MR = 72;
      if (mark) {
        ctx.strokeStyle = "rgba(20,30,50,.55)"; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(mark.x, mark.y); ctx.lineTo(MX - MR * 0.8, MY + MR * 0.6); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = "#111622"; ctx.lineWidth = 2; ctx.strokeRect(mark.x - 9, mark.y - 4, 18, 8);
      }
      ctx.save(); ctx.beginPath(); ctx.arc(MX, MY, MR, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#e9edf4"; ctx.fillRect(MX - MR, MY - MR, MR * 2, MR * 2);
      var TW = 13, bad = 0;
      for (i = 0; i < ZW.length; i++) {
        var act = w + sd * ZW[i], out2 = Math.abs(act - w) > tol(), lw3 = clamp(TW * (1 + (act - w) / w * 4), 2, 26), lx = MX - 55 + i * 22;
        if (out2) bad++;
        var lg2 = ctx.createLinearGradient(lx - lw3 / 2, 0, lx + lw3 / 2, 0);
        lg2.addColorStop(0, out2 ? "#ffa8a8" : "#ffe066"); lg2.addColorStop(1, out2 ? "#c92a2a" : "#e67700");
        ctx.fillStyle = lg2; ctx.fillRect(lx - lw3 / 2, MY - MR, lw3, MR * 2);
      }
      ctx.restore();
      var gl = ctx.createRadialGradient(MX - 24, MY - 26, 4, MX, MY, MR);
      gl.addColorStop(0, "rgba(255,255,255,.4)"); gl.addColorStop(0.5, "rgba(255,255,255,.04)"); gl.addColorStop(1, "rgba(120,170,220,.18)");
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(MX, MY, MR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#2b3242"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(MX, MY, MR, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(MX + MR * 0.72, MY + MR * 0.72); ctx.lineTo(MX + MR * 1.02, MY + MR * 1.02); ctx.stroke(); ctx.lineCap = "butt";
      KT.pill(ctx, "회로선 6줄 중 " + bad + "줄 벗어남", MX, MY + MR + 26, { a: "center", s: 12, c: bad ? "#ffa8a8" : "#8ce99a", box: [380, LW] });
      KT.pill(ctx, "초록 칩 = 쓴다 · 붉은 칩 = 버린다", 16, 292, { s: 12, c: "#e8ecff", box: [0, LW] });
      KT.warn(ctx, LW - 8, 292, "⚠ 돋보기 속 굵기 차이는 4배 과장", "right");
      /* 오른쪽 카드 — 작은 분포 그래프 */
      var cd = sideCard(ctx, 610, W, H, "선폭 관리 판정"), px = cd.px, R = cd.R;
      lt(ctx, (y * 100).toFixed(1) + " %", px, 62, { s: 26, w: "900", c: y >= 0.95 ? LT.green : LT.red });
      KT.row(ctx, "목표 선폭", w + " nm", px, R, 90, LT.blue);
      KT.row(ctx, "허용 범위 (± 10 %)", "± " + tol().toFixed(1) + " nm", px, R, 112, LT.red);
      KT.row(ctx, "측정·공정 오차", sd.toFixed(1) + " nm", px, R, 134, LT.violet);
      var g = KT.chart(ctx, { x: px - 8, y: 144, w: cd.w + 16, h: 112, x0: w - half, x1: w + half, y0: 0, y1: 1.12, xt: 2, yt: 1, light: true, xl: "선폭 (nm)", yl: "칩 수", xf: function (v2) { return v2.toFixed(1); }, yf: function () { return ""; }, pl: 10, pr: 10, pt: 16 });
      function curve() { ctx.beginPath(); for (i = 0; i <= 160; i++) { var nm = (w - half) + (2 * half) * i / 160, pp = Math.exp(-Math.pow((nm - w) / sd, 2) / 2); if (i === 0) ctx.moveTo(g.X(nm), g.Y(pp)); else ctx.lineTo(g.X(nm), g.Y(pp)); } }
      curve(); ctx.lineTo(g.R, g.B); ctx.lineTo(g.L, g.B); ctx.closePath(); ctx.fillStyle = "rgba(240,62,62,.30)"; ctx.fill();
      ctx.save(); var cl = clamp(g.X(lo), g.L, g.R), cr = clamp(g.X(hi), g.L, g.R); ctx.beginPath(); ctx.rect(cl, g.T, Math.max(0, cr - cl), g.B - g.T); ctx.clip();
      curve(); ctx.lineTo(g.R, g.B); ctx.lineTo(g.L, g.B); ctx.closePath(); ctx.fillStyle = "rgba(18,184,134,.55)"; ctx.fill(); ctx.restore();
      curve(); ctx.strokeStyle = LT.ink; ctx.lineWidth = 2; ctx.stroke();
      KT.line(ctx, { x: cl, y: g.T }, { x: cl, y: g.B }, LT.red, 1.6, [5, 4]); KT.line(ctx, { x: cr, y: g.T }, { x: cr, y: g.B }, LT.red, 1.6, [5, 4]);
      KT.tip(ctx, y >= 0.95 ? "쓸 만합니다 (95 % 이상)" : "너무 많이 버립니다", px - 4, 262, cd.w + 8, y >= 0.95);
$("c-chip-info").innerHTML = "목표 선폭 <b>" + w + " nm</b>의 허용 범위는 <b>± " + tol().toFixed(1) + " nm</b>, 오차는 <b>" + sd.toFixed(1) +
        " nm</b> → 수율 <b>" + (y * 100).toFixed(1) + " %</b>." +
        (y >= 0.95 ? " 쓸 만합니다." : " 너무 많이 버리고 있습니다.") +
        "<br>선폭을 줄이면 허용 범위도 <b>같은 비율로 좁아진다</b>는 점에 주목하세요. 90 nm 에서는 ± 9 nm 지만 10 nm 에서는 ± 1 nm 뿐입니다.";

      var ch = false;
      if (w <= 10 && y >= 0.95 && !got.a) { got.a = true; ch = true; }
      if (sd >= 1.0 && y >= 0.95 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("cChip", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (got.a && got.b) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>같은 오차라도 <b>선폭이 작아지면 치명적</b>이 됩니다. 허용 범위가 목표의 10 % 이기 때문입니다. 더 작게 만들려면 <b>더 정밀하게 재는 기술</b>이 먼저 있어야 합니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-w").addEventListener("input", function (e) {
      w = +e.target.value; $("c-w-val").textContent = w + " nm"; draw();
    });
    $("c-sd").addEventListener("input", function (e) {
      sd = +e.target.value; $("c-sd-val").textContent = sd.toFixed(1) + " nm"; draw();
    });
    $("c-w-val").textContent = w + " nm";
    $("c-sd-val").textContent = sd.toFixed(1) + " nm";
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m3-3", true);
  })();

  /* 장면 4 — 아날로그를 숫자로 (계산 모형 ①: 표본화 / ②: 양자화) */
  (function () {
    var got = window.sthState("cAdc") || { a: false, b: false, c: false };

    /* 표본화 */
    var canvas = $("c-samp"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var rate = 4, F = 1.2, TT = 2;
    function sig(t) { return Math.sin(2 * Math.PI * F * t); }
    function samples() {
      var ts = [], vs = [], k;
      for (k = 0; k / rate <= TT + 1e-9; k++) { ts.push(k / rate); vs.push(sig(k / rate)); }
      if (ts[ts.length - 1] < TT) { ts.push(TT); vs.push(sig(TT)); }
      return { t: ts, v: vs };
    }
    function recon(s, t) {
      var j = 0;
      while (j < s.t.length - 2 && s.t[j + 1] < t) j++;
      var f = (t - s.t[j]) / (s.t[j + 1] - s.t[j]);
      return s.v[j] + (s.v[j + 1] - s.v[j]) * f;
    }
    function maxErr(s) {
      var m = 0, i;
      for (i = 0; i <= 800; i++) { var t = TT * i / 800; m = Math.max(m, Math.abs(recon(s, t) - sig(t))); }
      return m;
    }
    var sst = { on: !REDUCE }, sph = 0;
    function renderSamp() {
      ctx.clearRect(0, 0, W, H);
      var s = samples(), me = maxErr(s), i, LW = 620;
      KT.studio(ctx, 0, 0, LW, H, { x: 330, y: 268, rx: 300, ry: 12 });
      KT.bigText(ctx, "1초에 " + rate + "번 재기", 16, 40, 22, "#ffffff");
      /* 손끝 맥박 센서 — 잴 때마다 불빛이 깜박인다 */
      var tp = TT * sph, near = 1;
      for (i = 0; i < s.t.length; i++) near = Math.min(near, Math.abs(tp - s.t[i]));
      var flash = clamp(1 - near * 30, 0, 1);
      floorShadow(ctx, 92, 252, 86, 8, 0.22);
      var sk = ctx.createLinearGradient(0, 186, 0, 232); sk.addColorStop(0, "#f8d7bd"); sk.addColorStop(1, "#d9a47f");
      ctx.fillStyle = sk; ctx.beginPath(); ctx.roundRect(14, 196, 150, 34, 17); ctx.fill();
      ctx.beginPath(); ctx.roundRect(6, 214, 70, 34, 14); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.ellipse(150, 205, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
      slab(ctx, 96, 182, 52, 22, 10, "#ced4da", "#868e96", "#5c6476");
      slab(ctx, 96, 224, 52, 14, 10, "#ced4da", "#868e96", "#5c6476");
      KT.glow(ctx, 122, 193, 3.5, "rgba(255," + Math.round(90 + 140 * flash) + ",90," + (0.35 + 0.6 * flash) + ")", 2 + flash * 4);
      KT.pill(ctx, "손끝 맥박 센서", 104, 168, { a: "center", s: 12, c: "#ffd8a8", box: [0, LW] });
      ctx.strokeStyle = "#495057"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(150, 190); ctx.bezierCurveTo(186, 186, 178, 150, 214, 150); ctx.stroke();
      /* 병상 모니터(입체) — 화면에 원래 맥박과 잰 점이 찍힌다 */
      slab(ctx, 214, 54, 392, 188, 14, "#eef1f6", "#d5dce6", "#aab4c3");
      ctx.fillStyle = "#c3ccd9"; ctx.fillRect(394, 242, 24, 14);
      ctx.fillStyle = "#aab4c3"; ctx.beginPath(); ctx.ellipse(406, 260, 60, 7, 0, 0, Math.PI * 2); ctx.fill();
      var SX0 = 228, SY0 = 66, SW = 364, SHh = 146;
      var scg = ctx.createLinearGradient(0, SY0, 0, SY0 + SHh); scg.addColorStop(0, "#f7fcfa"); scg.addColorStop(1, "#e3f1ec");
      ctx.fillStyle = scg; ctx.beginPath(); ctx.roundRect(SX0, SY0, SW, SHh, 8); ctx.fill();
      ctx.strokeStyle = "rgba(20,90,70,.10)"; ctx.lineWidth = 1;
      for (i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(SX0 + SW * i / 8, SY0); ctx.lineTo(SX0 + SW * i / 8, SY0 + SHh); ctx.stroke(); }
      for (i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(SX0, SY0 + SHh * i / 4); ctx.lineTo(SX0 + SW, SY0 + SHh * i / 4); ctx.stroke(); }
      function GX(t2) { return SX0 + 14 + t2 / TT * (SW - 28); }
      function GY(v2) { return SY0 + SHh / 2 - v2 * 56; }
      ctx.strokeStyle = LT.blue; ctx.lineWidth = 2.6; ctx.beginPath();
      for (i = 0; i <= 300; i++) { var t = TT * i / 300; if (i === 0) ctx.moveTo(GX(t), GY(sig(t))); else ctx.lineTo(GX(t), GY(sig(t))); }
      ctx.stroke();
      ctx.save(); ctx.strokeStyle = LT.violet; ctx.lineWidth = 2.4; ctx.setLineDash([7, 4]); ctx.beginPath();
      for (i = 0; i < s.t.length; i++) { if (i === 0) ctx.moveTo(GX(s.t[i]), GY(s.v[i])); else ctx.lineTo(GX(s.t[i]), GY(s.v[i])); }
      ctx.stroke(); ctx.restore();
      for (i = 0; i < s.t.length; i++) {
        KT.line(ctx, { x: GX(s.t[i]), y: GY(0) }, { x: GX(s.t[i]), y: GY(s.v[i]) }, "rgba(232,89,12,.4)", 1.2);
        KT.planet(ctx, GX(s.t[i]), GY(s.v[i]), rate > 30 ? 2.8 : 4.5, "#ffc078", "#d9480f");
      }
      KT.line(ctx, { x: GX(tp), y: SY0 + 4 }, { x: GX(tp), y: SY0 + SHh - 4 }, "rgba(28,126,214,.25)", 1);
      KT.planet(ctx, GX(tp), GY(sig(tp)), 5, "#a5d8ff", "#1864ab");
      lt(ctx, "— 원래 맥박", 236, 232, { s: 12, w: "900", c: LT.blue });
      lt(ctx, "┄ 되살린 신호", 340, 232, { s: 12, w: "900", c: LT.violet });
      lt(ctx, "● 잰 순간", 456, 232, { s: 12, w: "900", c: LT.orange });
      lt(ctx, "2초", 590, 232, { s: 12, w: "900", a: "right", c: LT.mute });
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 630, W, H, "표본화 판정"), px = cd.px, R = cd.R;
      lt(ctx, "복원 오차 " + (me * 100).toFixed(1) + " %", px, 60, { s: 20, w: "900", c: me <= 0.05 ? LT.green : LT.red });
      KT.row(ctx, "맥박 신호", "1초에 1.2번", px, R, 92);
      KT.row(ctx, "재는 횟수", "1초에 " + rate + "번", px, R, 114, LT.orange);
      KT.row(ctx, "표본 수 (2초)", s.t.length + " 개", px, R, 136);
      KT.bar(ctx, px, 150, cd.w, 1 - clamp(me, 0, 1), me <= 0.05 ? LT.green : LT.red);
      KT.tip(ctx, me <= 0.05 ? "물결 모양을 믿을 수 있다" : rate <= 3 ? "다른 모양이 되어 버렸다" : "꼭짓점이 깎였다 · 더 자주", px - 4, 172, cd.w + 8, me <= 0.05);
      lt(ctx, "목표: 복원 오차 5 % 이하", px, 236, { s: 11, c: LT.mute });
      lt(ctx, "자주 잴수록 원래 모양에 가까워진다", px, 258, { s: 11, c: LT.mute });
    }    function drawSamp() {
      renderSamp();
      var s = samples(), me = maxErr(s), i;

      $("c-samp-info").innerHTML = "1초에 <b>" + rate + "번</b> 재면 되살린 신호가 원래 신호와 최대 <b>" + (me * 100).toFixed(1) + " %</b> 어긋납니다. " +
        (me <= 0.05 ? "✅ 이 정도면 물결 모양을 믿을 수 있습니다."
          : rate <= 3 ? "너무 드문드문 재어서 물결이 아예 <b>다른 모양</b>이 되어 버렸습니다. 센서가 아무리 좋아도 소용없습니다."
          : "아직 꼭짓점이 깎여 있습니다. 더 자주 재 보세요.");

      if (me <= 0.05 && !got.a) { got.a = true; window.sthState("cAdc", got); mission(); }
    }

    /* 양자화 */
    var cq = $("c-quant"), qx = window.setupCanvas(cq), QW = cq._w, QH = cq._h;
    var bits = 4, LO = 30, HI = 45;
    function step() { return (HI - LO) / Math.pow(2, bits); }
    function shown(t) { return LO + Math.round((t - LO) / step()) * step(); }
    function drawQuant() {
      qx.clearRect(0, 0, QW, QH);
      var st = step(), i, LW = 600, cells = Math.pow(2, bits), okAll = st / 2 <= 0.05;
      var T0 = 35.9, T1 = 37.6, BASE = 228;
      function SXq(t) { return 40 + (t - T0) / (T1 - T0) * 520; }
      function SYq(v2) { return BASE - clamp((v2 - 35.3) / (38.0 - 35.3), 0.03, 1) * 140; }
      KT.studio(qx, 0, 0, LW, QH, { x: 312, y: 246, rx: 290, ry: 12 });
      KT.bigText(qx, bits + "비트 = " + cells.toLocaleString() + "칸", 18, 40, 24, "#ffffff");
      KT.bigText(qx, "30~45 ℃ 를 칸으로 나눈 계단 · 36~37.5 ℃ 확대", 18, 64, 13, "#ffffff");
      /* 계단 — 칸 하나가 계단 한 단. 화면에는 그 단의 높이(값)만 찍힌다 */
      function colOf(v2) { var f = clamp((v2 - 35.3) / 2.7, 0, 1); return "rgb(" + Math.round(116 + 139 * f) + "," + Math.round(192 - 57 * f) + "," + Math.round(252 - 117 * f) + ")"; }
      var segs = [], t = T0;
      while (t < T1 - 1e-9 && segs.length < 400) {
        var k = Math.round((t - LO) / st), tE = Math.min(T1, LO + (k + 0.5) * st);
        if (tE <= t) tE = Math.min(T1, t + st);
        segs.push([t, tE, LO + k * st]); t = tE;
      }
      if (segs.length <= 120) {
        for (i = 0; i < segs.length; i++) {
          var x0 = SXq(segs[i][0]), x1 = SXq(segs[i][1]), top = SYq(segs[i][2]), c = colOf(segs[i][2]);
          slab(qx, x0, top, Math.max(1, x1 - x0), BASE - top, 14, KT.tint("#ffffff", 0.97), c, KT.tint("#868e96", 1));
          qx.fillStyle = "rgba(255,255,255,.55)"; qx.fillRect(x0, top, 1.2, BASE - top);
        }
      } else {
        qx.fillStyle = colOf(36.8); qx.beginPath(); qx.moveTo(SXq(T0), BASE); qx.lineTo(SXq(T0), SYq(T0)); qx.lineTo(SXq(T1), SYq(T1)); qx.lineTo(SXq(T1), BASE); qx.closePath(); qx.fill();
        qx.fillStyle = "#f1f3f5"; qx.beginPath(); qx.moveTo(SXq(T0), SYq(T0)); qx.lineTo(SXq(T0) + 14, SYq(T0) - 8.4); qx.lineTo(SXq(T1) + 14, SYq(T1) - 8.4); qx.lineTo(SXq(T1), SYq(T1)); qx.closePath(); qx.fill();
        KT.pill(qx, "칸이 너무 촘촘해 비탈처럼 보입니다 (" + segs.length + "단 이상)", 300, 214, { a: "center", s: 12, c: "#ffffff", box: [0, LW] });
      }
      qx.fillStyle = "#adb5bd"; qx.fillRect(SXq(T0), BASE, 520, 6);
      /* 실제 온도(이어진 값) */
      KT.line(qx, { x: SXq(T0), y: SYq(T0) }, { x: SXq(T1), y: SYq(T1) }, "#12203a", 2, [6, 4]);
      KT.pill(qx, "점선 = 실제 온도(이어진 값)", SXq(35.92), SYq(35.9) - 16, { a: "left", s: 11, c: "#e8ecff", box: [0, LW] });
      for (i = 36; i <= 37.5; i += 0.5) lt(qx, i.toFixed(1) + " ℃", SXq(i), BASE + 22, { s: 12, a: "center", c: LT.ink, w: "900" });
      /* 이마 온도 세 개 — 공이 떨어진 계단 높이 = 화면에 찍히는 값 */
      var TS = [36.5, 36.7, 37.0], DY = [-16, -40, -16];
      for (i = 0; i < TS.length; i++) {
        var t0 = TS[i], sh = shown(t0), ok = Math.abs(sh - t0) <= 0.05, bx = SXq(t0), byy = SYq(sh) - 9;
        KT.planet(qx, bx + 5, byy, 7, ok ? "#8ce99a" : "#ffc078", ok ? "#087f5b" : "#d9480f");
        KT.pill(qx, t0.toFixed(1) + " → " + sh.toFixed(2), bx + 5, byy + DY[i], { a: "center", s: 12, c: ok ? "#8ce99a" : "#ffd8a8", box: [0, LW] });
      }
      /* 오른쪽 카드 */
      var cd = sideCard(qx, 610, QW, QH, "이마 체온계 세 대"), px = cd.px, R = cd.R;
      lt(qx, "한 칸 " + st.toFixed(4) + " ℃", px, 58, { s: 19, w: "900", c: okAll ? LT.green : LT.red });
      KT.row(qx, "최대 오차 (한 칸의 절반)", (st / 2).toFixed(4) + " ℃", px, R, 86, okAll ? LT.green : LT.red);
      for (i = 0; i < TS.length; i++) {
        var sh2 = shown(TS[i]), ok2 = Math.abs(sh2 - TS[i]) <= 0.05;
        KT.row(qx, "실제 " + TS[i].toFixed(1) + " ℃ → 화면", sh2.toFixed(2) + " ℃", px, R, 114 + i * 22, ok2 ? LT.green : LT.orange);
      }
      KT.tip(qx, okAll ? "0.05 ℃까지 가른다" : "최대 오차가 0.05 ℃보다 크다", px - 4, 186, cd.w + 8, okAll ? true : false);
      lt(qx, "비트 하나 늘면 칸 수가 두 배", px, 244, { s: 11, c: LT.mute });
      $("c-quant-info").innerHTML = "<b>" + bits + "비트</b> = " + cells.toLocaleString() + "칸 → 한 칸이 <b>" + st.toFixed(4) +
        " ℃</b>, 최대 오차 <b>" + (st / 2).toFixed(4) + " ℃</b>. " +
        (st / 2 <= 0.05 ? "✅ 0.05 ℃까지 구분합니다. 36.5와 36.7이 다른 숫자로 찍힙니다."
          : "36.5 ℃와 36.7 ℃가 같은 숫자로 찍히지 않는지 확인해 보세요. 비트를 올리면 칸이 촘촘해집니다.");

      if (st / 2 <= 0.05 && !got.b) { got.b = true; window.sthState("cAdc", got); mission(); }
    }

    window.sthPick({
      mount: "s3-pick",
      q: "측정한 값을 <b>디지털</b>로 바꾸어 두면 좋은 점으로 가장 알맞은 것은 무엇일까요?",
      options: [
        "측정값이 실제 값보다 더 정확해진다",
        "여러 번 복사하고 멀리 보내도 값이 변하지 않는다",
        "측정 기기의 계통 오차가 사라진다",
        "표본화와 양자화를 하지 않아도 된다"
      ],
      answer: 1,
      why: [
        "디지털로 바꾼다고 없던 정확도가 생기지는 않습니다. 오히려 양자화 오차가 새로 더해집니다.",
        "숫자는 옮겨 적어도 흐려지지 않습니다. 그래서 세계의 관측값을 모아 수십 년치를 견줄 수 있습니다.",
        "계통 오차는 기기를 교정해야 사라집니다. 숫자로 바꾸는 일과는 상관이 없습니다.",
        "디지털로 바꾸는 과정이 바로 표본화와 양자화입니다."
      ],
      onDone: function () { got.c = true; window.sthState("cAdc", got); mission(); }
    });

    function mission() {
      if (got.a) done("m3-4a");
      if (got.b) done("m3-4b");
      if (got.c) done("m3-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>맥박은 <b>1초에 12번 이상</b> 재야 물결이 되살아나고, 체온계는 <b>8비트</b>는 되어야 0.05 ℃를 가릅니다. 이어지던 신호는 이 두 단계를 거쳐 <b>디지털 정보</b>가 됩니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = drawSamp;
    cq._redraw = drawQuant;
    pauser("c-samp-play", sst);
    KT.animate(canvas, function (dt) { if (sst.on) { sph = (sph + dt / 4000) % 1; renderSamp(); } });
    $("c-rate").addEventListener("input", function (e) {
      rate = +e.target.value; $("c-rate-val").textContent = rate + " 번/초"; drawSamp();
    });
    $("c-bits").addEventListener("input", function (e) {
      bits = +e.target.value; $("c-bits-val").textContent = bits + " 비트"; drawQuant();
    });
    $("c-rate-val").textContent = rate + " 번/초";
    $("c-bits-val").textContent = bits + " 비트";
    drawSamp(); drawQuant(); mission();
    if (ep.cleared(3)) window.sthMission("m3-4", true);
  })();

  /* 장면 5 — 결말 */
  function finish() {
    window.sthState("r3", "해결 · 시계 오차 1 µs는 위치 오차 300 m · 맥박은 12번/초, 체온계는 8비트라야 살아난다");
  }
  function paintVs() {
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 어림</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0 ? "정확했습니다. 빛이 1 µs 동안 가는 거리가 약 300 m 였습니다."
        : "빛은 1초에 약 3억 m를 갑니다. 그 100만분의 1인 1 µs면 약 300 m입니다.") +
      "<br><b>내가 확인한 것</b> 10 m 안쪽으로 맞추려면 시계는 30 ns 안쪽까지 맞아야 한다";
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();

  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅰ-2] 이야기 ③ 30 cm를 다투는 사람들",
    items: [
      { id: "e3a", label: "100만분의 1초가 만든 300 m", hint: "위성 시계의 작은 오차가 왜 큰 위치 오차가 되는지 ‘빛의 속력’과 ‘거리 = 속력 × 시간’이라는 말을 넣어 세 문장으로 설명하세요." },
      { id: "e3b", label: "숫자로 바꾼다는 것", hint: "이어지던 신호를 디지털로 바꾸는 두 단계(표본화·양자화)를 각각 한 문장으로 설명하고, 디지털로 바꾸어 두면 무엇이 좋은지 쓰세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅰ-2] 과학의 측정과 우리 사회 — 정리",
  recap: [
    { key: "r1", label: "① 과녁에 남은 자국" },
    { key: "r2", label: "② 1미터를 다시 정하는 회의" },
    { key: "r3", label: "③ 30 cm를 다투는 사람들" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "표적지 넉 장, 금고 속의 금속 막대, 옆 건물에 찍힌 파란 점. 세 이야기에 공통으로 들어 있는 생각을 ‘기준’과 ‘오차’라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-1-2", unitLabel: "[통합과학1 Ⅰ-2] 과학의 측정과 우리 사회",
  rows: [
    { key: "r1", label: "① 과녁에 남은 자국" },
    { key: "r2", label: "② 1미터를 다시 정하는 회의" },
    { key: "r3", label: "③ 30 cm를 다투는 사람들" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
