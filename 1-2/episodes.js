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
      var bx = CX + Math.cos(ANG) * bias, by = CY + Math.sin(ANG) * bias, i;
      KT.stage(ctx, 0, 0, 444, H, "lab", { seed: 2 });
      KT.stage(ctx, 452, 0, W - 452, H, "night", { seed: 6 });

      /* 과녁 — 종이 표적지 */
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      ctx.fillStyle = "#efe9da"; ctx.beginPath(); ctx.roundRect(CX - R - 18, CY - R - 18, 2 * R + 36, 2 * R + 36, 6); ctx.fill(); ctx.restore();
      for (i = 0; i < 4; i++) {
        var r = R * (1 - i * 0.25), inner = i >= 2;
        ctx.fillStyle = inner ? "#1c1f2b" : "#f6f1e4";
        ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = inner ? "rgba(255,255,255,.55)" : "rgba(30,30,40,.7)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.stroke();
      }
      var paperShade = ctx.createRadialGradient(CX - 60, CY - 70, 20, CX, CY, R + 30);
      paperShade.addColorStop(0, "rgba(255,255,255,.10)"); paperShade.addColorStop(1, "rgba(60,40,10,.18)");
      ctx.fillStyle = paperShade; ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill();
      KT.glow(ctx, CX, CY, 6, "rgba(255,90,110,.98)", 3);

      /* 10발 — 총알 자국 */
      for (i = 0; i < U.length; i++) {
        var x = bx + U[i][0] * noise, y = by + U[i][1] * noise;
        ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 10;
        ctx.strokeStyle = KC.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        var hg = ctx.createRadialGradient(x - 1.5, y - 1.5, 0.5, x, y, 5.5); hg.addColorStop(0, "#3a3f52"); hg.addColorStop(1, "#05060c");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
      }
      /* 평균 자리 */
      ctx.save(); ctx.shadowColor = KC.violet; ctx.shadowBlur = 8; ctx.strokeStyle = KC.violet; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx - 13, by); ctx.lineTo(bx + 13, by); ctx.moveTo(bx, by - 13); ctx.lineTo(bx, by + 13); ctx.stroke(); ctx.restore();
      if (bias > 0) KT.line(ctx, { x: CX, y: CY }, { x: bx, y: by }, KC.yellow, 1.5, [4, 3], 0.9);
      KT.pill(ctx, "10발의 평균", bx + 16, by - 12, { s: 10.5, c: KC.violet, box: [0, 444] });
      KT.pill(ctx, "과녁 — 가운데 붉은 점이 참값", 16, 28, { s: 13, c: KC.blue });
      text(ctx, "◯ 10발  ✛ 평균  ● 참값", CX, 418, { s: 11, a: "center", c: KC.mute });

      /* 오른쪽 — 성적표 */
      KT.pill(ctx, "이번 10발의 성적", 468, 28, { s: 13, c: KC.blue });
      text(ctx, "정확도 오차 — 평균이 중심에서 떨어진 거리", 468, 70, { s: 11.5, w: "800", c: KC.ink });
      glowText(ctx, bias + " mm", 880, 70, { s: 13, w: "900", a: "right", c: accurate() ? KC.green : KC.red, blur: 8 });
      glowBar(ctx, 468, 80, 412, 16, bias / 60, accurate() ? KC.green : KC.red);
      text(ctx, "10 mm 이내면 ‘정확하다’", 468, 114, { s: 10.5, c: KC.mute });

      text(ctx, "정밀도 — 열 발이 얼마나 모였나 (표준편차)", 468, 146, { s: 11.5, w: "800", c: KC.ink });
      glowText(ctx, noise + " mm", 880, 146, { s: 13, w: "900", a: "right", c: precise() ? KC.green : KC.red, blur: 8 });
      glowBar(ctx, 468, 156, 412, 16, noise / 40, precise() ? KC.green : KC.red);
      text(ctx, "8 mm 이하면 ‘정밀하다’", 468, 190, { s: 10.5, c: KC.mute });

      /* 2 × 2 판정표 */
      text(ctx, "정밀 ○ 모였다", 617, 218, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, "정밀 ✕ 흩어졌다", 792, 218, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, "정확 ○", 497, 268, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, "중심 맞음", 497, 284, { s: 10, a: "center", c: v("--mist") });
      text(ctx, "정확 ✕", 497, 358, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, "치우침", 497, 374, { s: 10, a: "center", c: v("--mist") });
      var cells = [
        { x: 530, y: 228, acc: true, pre: true, who: "가온", t: "이상적인 측정" },
        { x: 705, y: 228, acc: true, pre: false, who: "다인", t: "우연 오차가 크다" },
        { x: 530, y: 318, acc: false, pre: true, who: "나래", t: "계통 오차가 있다" },
        { x: 705, y: 318, acc: false, pre: false, who: "라온", t: "둘 다 크다" }
      ];
      for (i = 0; i < cells.length; i++) {
        var c = cells[i], on = (c.acc === accurate() && c.pre === precise());
        card(ctx, c.x, c.y, 175, 82, on, "--brand");
        /* 칸마다 작은 표적지 */
        var mx = c.x + 30, my = c.y + 41, mo = c.acc ? 0 : 7, ms = c.pre ? 2.2 : 7;
        ctx.strokeStyle = "rgba(220,226,255,.4)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(mx, my, 16, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2); ctx.stroke();
        for (var k = 0; k < 5; k++) { ctx.fillStyle = on ? KC.blue : KC.mute; ctx.beginPath(); ctx.arc(mx + mo * 0.7 + U[k][0] * ms, my - mo * 0.7 + U[k][1] * ms, 1.8, 0, Math.PI * 2); ctx.fill(); }
        if (on) glowText(ctx, c.who, c.x + 102, c.y + 34, { s: 17, w: "900", a: "center", c: KC.blue, blur: 10 });
        else text(ctx, c.who, c.x + 102, c.y + 34, { s: 17, w: "900", a: "center", c: KC.mute });
        text(ctx, c.t, c.x + 102, c.y + 58, { s: 10.5, a: "center", c: on ? KC.ink : KC.mute });
      }
      KT.pill(ctx, "지금 만든 표적지는 " + who() + " 의 것입니다.", 468, 420, { s: 11.5, c: KC.yellow });

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

    function yOf(x) { return 300 - (clamp(x, 47.5, 52.5) - 47.5) / 5 * 230; }
    function box(x, label, big, col) {
      glass(ctx, x, 322, 180, 58, 12, col, 0.1);
      text(ctx, label, x + 90, 342, { s: 10.5, a: "center", c: KC.mute });
      glowText(ctx, big, x + 90, 367, { s: 17, w: "900", a: "center", c: col, blur: 8 });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var st = stats(), i, zOk = Math.abs(z) < 0.05;
      KT.stage(ctx, 0, 0, 272, H, "lab", { seed: 4 });
      KT.stage(ctx, 280, 0, W - 280, H, "lab", { seed: 9 });

      /* 저울 — 표준 분동을 올린 전자저울 */
      KT.pill(ctx, "표준 분동을 올렸다 내렸다 한다", 136, 30, { a: "center", s: 12.5, c: KC.blue, box: [0, 272] });
      text(ctx, "참값 (표준 분동)", 145, 60, { s: 10.5, a: "center", c: KC.mute });
      var bg = ctx.createLinearGradient(110, 0, 180, 0); bg.addColorStop(0, "#8a6420"); bg.addColorStop(0.4, "#f6d58a"); bg.addColorStop(1, "#7a5418");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(112, 74, 66, 50, [6, 6, 3, 3]); ctx.fill();
      ctx.beginPath(); ctx.roundRect(134, 66, 22, 10, 4); ctx.fill();
      text(ctx, "50.00 g", 145, 105, { s: 12.5, w: "900", a: "center", c: "#3a2600" });
      var pg = ctx.createLinearGradient(0, 124, 0, 132); pg.addColorStop(0, "#f2f5fb"); pg.addColorStop(1, "#7c869c");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(145, 128, 82, 7, 0, 0, Math.PI * 2); ctx.fill();
      var body = ctx.createLinearGradient(0, 136, 0, 266); body.addColorStop(0, "#3a4260"); body.addColorStop(1, "#161a2e");
      ctx.fillStyle = body; ctx.beginPath(); ctx.roundRect(40, 140, 210, 126, 14); ctx.fill();
      ctx.strokeStyle = "rgba(200,210,255,.3)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(40, 140, 210, 126, 14); ctx.stroke();
      var lcd = ctx.createLinearGradient(0, 160, 0, 208); lcd.addColorStop(0, "#0e2a1c"); lcd.addColorStop(1, "#06140d");
      ctx.fillStyle = lcd; ctx.beginPath(); ctx.roundRect(60, 160, 170, 48, 8); ctx.fill();
      glowText(ctx, val(n - 1).toFixed(2) + " g", 145, 194, { s: 22, w: "900", a: "center", c: "#8dffc0", blur: 12 });
      text(ctx, "마지막으로 읽은 값", 145, 228, { s: 10.5, a: "center", c: KC.mute });
      text(ctx, "영점 " + (z >= 0 ? "+" : "−") + Math.abs(z).toFixed(1) + " g", 145, 252,
        { s: 12, w: "900", a: "center", c: zOk ? KC.green : KC.red });
      KT.glow(ctx, 228, 248, 3, zOk ? "rgba(63,211,163,.95)" : "rgba(255,107,129,.95)", 3);
      KT.pill(ctx, zOk ? "영점이 맞았다" : "영점이 틀어졌다", 145, 292, { a: "center", s: 11, c: zOk ? KC.green : KC.red });

      /* 측정값 그래프 */
      KT.pill(ctx, n + "번 재어 늘어놓은 값", 300, 30, { s: 12.5, c: KC.blue });
      for (i = 48; i <= 52; i++) {
        hline(ctx, 306, 870, yOf(i), KC.grid, 1);
        KT.t(ctx, i + ".0", 302, yOf(i) + 4, { s: 10, a: "right", c: KC.mute, w: "600" });
      }
      KT.line(ctx, { x: 306, y: yOf(TRUE) }, { x: 870, y: yOf(TRUE) }, KC.green, 1.6, [6, 5], 0.9);
      KT.pill(ctx, "참값 50.00 g", 866, yOf(TRUE) - 8, { s: 11, a: "right", c: KC.green });
      for (i = 0; i < n; i++) {
        var x = n === 1 ? 588 : 318 + (i / (n - 1)) * 540;
        KT.glow(ctx, x, yOf(val(i)), n > 30 ? 2.4 : 3.6, "rgba(127,211,255,.95)", 2.6);
      }
      ctx.save(); ctx.shadowColor = KC.violet; ctx.shadowBlur = 10; hline(ctx, 306, 870, yOf(st.mean), KC.violet, 2.5); ctx.restore();
      KT.pill(ctx, "평균 " + st.mean.toFixed(3) + " g", 312, yOf(st.mean) - 8, { s: 11.5, c: KC.violet });

      box(300, "평균", st.mean.toFixed(3) + " g", KC.violet);
      box(500, "평균의 오차 (참값과의 차)", (st.err >= 0 ? "+" : "−") + Math.abs(st.err).toFixed(3) + " g", KC.orange);
      box(700, "흩어짐 (표준편차)", st.sd.toFixed(3) + " g", KC.blue);

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
    function xOf(mm) { return 80 + mm * 9; }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = reading(), i;
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 15 });
      KT.pill(ctx, "실제 길이 " + L.toFixed(1) + " mm 인 막대를 최소 눈금 " +
        (minDiv === 10 ? "1 cm" : minDiv === 1 ? "1 mm" : "0.1 mm") + " 자로 잰다", 450, 36, { a: "center", s: 12.5, c: KC.blue });

      /* 막대 — 나무 결 */
      var wd = ctx.createLinearGradient(0, 60, 0, 98); wd.addColorStop(0, "#f0c48c"); wd.addColorStop(0.5, "#c98a4c"); wd.addColorStop(1, "#7a4a22");
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
      ctx.fillStyle = wd; ctx.beginPath(); ctx.roundRect(80, 62, Math.max(8, L * 9), 34, 6); ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.roundRect(80, 62, Math.max(8, L * 9), 34, 6); ctx.clip();
      ctx.strokeStyle = "rgba(110,60,20,.28)"; ctx.lineWidth = 1;
      for (i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(80, 68 + i * 6); ctx.bezierCurveTo(300, 64 + i * 6 + (i % 2 ? 4 : -3), 500, 72 + i * 6, 820, 66 + i * 6); ctx.stroke(); }
      ctx.restore();

      /* 자 — 반투명 플라스틱 */
      var rg = ctx.createLinearGradient(0, 110, 0, 156); rg.addColorStop(0, "#f4f1e6"); rg.addColorStop(1, "#d6cfb8");
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
      ctx.fillStyle = rg; ctx.beginPath(); ctx.roundRect(74, 110, 732, 46, 4); ctx.fill(); ctx.restore();
      var drawStep = minDiv === 10 ? 10 : minDiv === 1 ? 1 : 0.5;
      for (i = 0; i * drawStep <= 80.0001; i++) {
        var mm = i * drawStep, x = xOf(mm);
        if (x > 800) break;
        var big = Math.abs(mm / 10 - Math.round(mm / 10)) < 1e-9, half = !big && Math.abs(mm / 5 - Math.round(mm / 5)) < 1e-9;
        ctx.strokeStyle = big ? "#1b1d2a" : "#4a4d5c"; ctx.lineWidth = big ? 1.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x, big ? 136 : half ? 128 : 124); ctx.stroke();
        if (big) text(ctx, (mm / 10) + "", x, 152, { s: 10, w: "800", a: "center", c: "#1b1d2a" });
      }
      if (minDiv === 0.1) KT.t(ctx, "※ 실제로는 0.1 mm마다 눈금이 있지만 화면에서는 0.5 mm 마다만 그렸습니다", 80, 176, { s: 10, c: KC.mute, w: "600" });
      KT.t(ctx, "단위: cm", 812, 152, { s: 10.5, w: "800", c: KC.mute });

      /* 막대 끝 표시 */
      ctx.save(); ctx.shadowColor = KC.orange; ctx.shadowBlur = 8; vdash(ctx, xOf(L), 56, 140, KC.orange); ctx.restore();
      KT.glow(ctx, xOf(L), 140, 2.5, "rgba(255,179,92,.95)", 3);

      /* 읽은 값 */
      text(ctx, "이 자로 적을 수 있는 값", 450, 208, { s: 11.5, a: "center", c: KC.mute });
      glowText(ctx, r.cm + " cm", 450, 248, { s: 34, w: "900", a: "center", c: KC.yellow });
      KT.pill(ctx, "눈금으로 읽은 자리 " + (r.sig - 1) + "개 + 어림한 자리 1개 = 유효숫자 " + r.sig + "자리",
        450, 280, { a: "center", s: 13, c: KC.blue });
      var stepLabel = r.step >= 1 ? "1" : (r.step > 0.05 ? "0.1" : "0.01");
      text(ctx, "어림하는 자리는 최소 눈금의 1/10, 곧 " + stepLabel + " mm 자리입니다.",
        450, 310, { s: 11.5, a: "center", c: KC.mute });

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
      KT.stage(ctx, 0, y0, W, h, "lab", { seed: 23 });
      /* 왼쪽 — 늘어난 길이와 머리카락 */
      card(ctx, 20, y0 + 12, 420, 128, true, "--coral");
      text(ctx, "막대 끝을 크게 확대해 보면", 230, y0 + 34, { s: 11.5, w: "800", a: "center", c: KC.orange });
      var maxUm = 350, bx0 = 44, bw = 372;
      text(ctx, "늘어난 길이", bx0, y0 + 60, { s: 10.5, c: KC.mute });
      glowBar(ctx, bx0, y0 + 66, bw, 16, d / maxUm, KC.orange);
      text(ctx, d.toFixed(1) + " µm", bx0 + bw, y0 + 60, { s: 12, w: "900", a: "right", c: KC.orange });
      text(ctx, "머리카락 굵기", bx0, y0 + 102, { s: 10.5, c: KC.mute });
      glowBar(ctx, bx0, y0 + 108, bw, 16, HAIR / maxUm, "#c9cfe6");
      text(ctx, HAIR + " µm", bx0 + bw, y0 + 102, { s: 12, w: "900", a: "right", c: KC.ink });
      /* 오른쪽 — 이 자로 1 km를 재면 */
      card(ctx, 460, y0 + 12, 420, 128, true, "--violet");
      text(ctx, "이 원기를 베낀 자로 1 km를 재면", 670, y0 + 34, { s: 11.5, w: "800", a: "center", c: KC.violet });
      glowText(ctx, (ALPHA * T * 1000 * 1000).toFixed(1) + " mm", 670, y0 + 78, { s: 30, w: "900", a: "center", c: KC.violet });
      text(ctx, "만큼 어긋난다", 670, y0 + 100, { s: 11.5, a: "center", c: KC.mute });
      text(ctx, "ΔL = 1 m × 8.7 × 10⁻⁶ /℃ × " + T.toFixed(1) + " ℃", 670, y0 + 126, { s: 11.5, a: "center", c: KC.ink });
      KT.t(ctx, "금속은 데우면 늘어납니다. 기준이 ‘물건’이면 기준 자체가 날씨에 따라 달라집니다.", 24, H - 14, { s: 12, c: KC.mute, w: "600" });
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
      var n = spans(), i, PC = [KC.orange, KC.violet, KC.blue];
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 31 });
      KT.pill(ctx, mode === "span" ? "상인이 자기 뼘으로 재어 “" + n + " 뼘”이라고 말했다" : "상인이 미터자로 재어 “" + (L / 100).toFixed(2) + " m”라고 말했다",
        16, 30, { s: 13, c: KC.blue });

      /* 실제 천 — 줄무늬 천과 두루마리 */
      KT.t(ctx, "실제 천의 길이 " + L + " cm", 40, 64, { s: 11.5, w: "800", c: KC.ink });
      var cw = Math.max(8, L * 1.4), fg = ctx.createLinearGradient(0, 74, 0, 98);
      fg.addColorStop(0, "#5fe0b8"); fg.addColorStop(0.5, "#2aa889"); fg.addColorStop(1, "#13644f");
      ctx.save(); ctx.beginPath(); ctx.roundRect(60, 76, cw, 20, 4); ctx.clip();
      ctx.fillStyle = fg; ctx.fillRect(60, 76, cw, 20);
      ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.lineWidth = 3;
      for (var sx = 40; sx < 60 + cw + 20; sx += 12) { ctx.beginPath(); ctx.moveTo(sx, 96); ctx.lineTo(sx + 14, 76); ctx.stroke(); }
      ctx.restore();
      var rl = ctx.createLinearGradient(48, 0, 66, 0); rl.addColorStop(0, "#0f4d3c"); rl.addColorStop(0.5, "#5fe0b8"); rl.addColorStop(1, "#0f4d3c");
      ctx.fillStyle = rl; ctx.beginPath(); ctx.roundRect(50, 70, 14, 32, 6); ctx.fill();

      /* 세 사람이 떠올리는 길이 */
      for (i = 0; i < PEOPLE.length; i++) {
        var p = PEOPLE[i], y = 130 + i * 70, len = think(p), col = PC[i];
        KT.pill(ctx, p.icon + " " + p.who + " (뼘 " + p.hand + " cm)", 60, y - 9, { s: 11.5, c: col });
        glowBar(ctx, 60, y, 620, 26, clamp(len * 1.4, 8, 620) / 620, col);
        if (mode === "span") {
          ctx.strokeStyle = "rgba(10,12,30,.45)"; ctx.lineWidth = 1.5;
          for (var k = 1; k < n; k++) { var tx = 60 + k * p.hand * 1.4; if (tx > 676) break; ctx.beginPath(); ctx.moveTo(tx, y + 5); ctx.lineTo(tx, y + 21); ctx.stroke(); }
        }
        text(ctx, len + " cm라고 생각한다", 690, y + 18, { s: 12, w: "800", c: col });
      }
      /* 실제 길이 선 */
      ctx.save(); ctx.shadowColor = KC.green; ctx.shadowBlur = 8; vdash(ctx, 60 + L * 1.4, 70, 330, KC.green); ctx.restore();
      KT.pill(ctx, "실제", 60 + L * 1.4, 350, { a: "center", s: 10.5, c: KC.green });

      var lo = loss();
      glowText(ctx, mode === "span"
        ? "손님은 실제보다 " + lo + " cm 더 길다고 믿고 값을 치른다 → 손해 " + (lo * 200).toLocaleString() + " 원 (1 cm에 200원)"
        : "세 사람이 떠올리는 길이가 모두 같다 → 차이 0 cm, 손해 0 원",
        40, 374, { s: 13, w: "900", c: mode === "span" ? KC.red : KC.green, blur: 6 });

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
      var d = dist(), i, ok = Math.abs(d - 1) <= 0.005, xe = xOf(d);
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 37 });
      KT.pill(ctx, "진공에서 빛을 " + t.toFixed(2) + " ns 동안 달리게 하면", 16, 30, { s: 12.5, c: KC.blue });
      glowText(ctx, d.toFixed(4) + " m", 450, 92, { s: 34, w: "900", a: "center", c: ok ? KC.green : KC.yellow });

      /* 빛의 자취 — 레이저에서 나온 빛 펄스 */
      ctx.save(); ctx.shadowColor = KC.orange; ctx.shadowBlur = 14; ctx.lineCap = "round";
      var bm = ctx.createLinearGradient(80, 0, xe, 0); bm.addColorStop(0, "rgba(255,211,107,.95)"); bm.addColorStop(1, "rgba(255,160,60,.55)");
      ctx.strokeStyle = bm; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(80, 150); ctx.lineTo(xe, 150); ctx.stroke(); ctx.restore();
      for (i = 0; i < 4; i++) { var px = 80 + ((ph + i / 4) % 1) * (xe - 80); KT.glow(ctx, px, 150, 3, "rgba(255,250,220,.98)", 3.4); }
      KT.glow(ctx, xe, 150, 7, "rgba(255,200,90,.98)", 3.6);
      var lz = ctx.createLinearGradient(0, 138, 0, 162); lz.addColorStop(0, "#c9cfdf"); lz.addColorStop(0.5, "#6b7387"); lz.addColorStop(1, "#2c3242");
      ctx.fillStyle = lz; ctx.beginPath(); ctx.roundRect(28, 138, 50, 24, 5); ctx.fill();
      KT.glow(ctx, 80, 150, 3, "rgba(255,90,90,.95)", 3);
      KT.t(ctx, "빛원", 53, 178, { s: 10.5, a: "center", c: KC.mute });

      /* 자 — 금속 자 */
      var rg = ctx.createLinearGradient(0, 196, 0, 220); rg.addColorStop(0, "#e6eaf3"); rg.addColorStop(1, "#9aa3b6");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.roundRect(74, 196, 712, 22, 3); ctx.fill();
      for (i = 0; i <= 30; i++) {
        var m = i / 10, x = xOf(m), big = i % 5 === 0;
        ctx.strokeStyle = big ? "#141826" : "#3d4456"; ctx.lineWidth = big ? 1.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(x, 196); ctx.lineTo(x, big ? 214 : 206); ctx.stroke();
        if (big) KT.t(ctx, m.toFixed(1) + " m", x, 236, { s: 10, a: "center", c: KC.mute, w: "700" });
      }
      ctx.save(); ctx.shadowColor = KC.green; ctx.shadowBlur = 8; vdash(ctx, xOf(1), 130, 196, KC.green); ctx.restore();
      KT.pill(ctx, "여기가 1 m", xOf(1), 126, { a: "center", s: 11, c: KC.green });

      KT.pill(ctx, "1 m의 정의 (1983년~) : 빛이 진공에서 1/299,792,458 초 동안 간 거리", 450, 272, { a: "center", s: 13, c: KC.blue });
      text(ctx, "곧 3.3356 ns입니다. 시계만 정확하면 자가 없어도 1 m를 만들 수 있습니다.", 450, 300, { s: 11.5, a: "center", c: KC.mute });
      KT.t(ctx, "빛 펄스는 아주 느리게 돌린 모습", 884, 60, { s: 10, a: "right", c: KC.dim, w: "600" });
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
    function xOf(e) { return 80 + (e + 12) / 12 * 770; }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i;
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 41 });
      KT.pill(ctx, "정밀 측정이 떠받치고 있는 분야들 — 카드를 눌러 보세요", 30, 34, { s: 12.5, c: KC.blue });
      for (i = 0; i < FIELDS.length; i++) {
        var f = FIELDS[i], x = 30 + (i % 3) * 290, y = 60 + Math.floor(i / 3) * 135, on = i === sel;
        card(ctx, x, y, 260, 120, on, "--brand");
        var hg = ctx.createRadialGradient(x + 130, y + 40, 4, x + 130, y + 40, 60);
        hg.addColorStop(0, "rgba(127,211,255," + (on ? 0.22 : 0.08) + ")"); hg.addColorStop(1, "rgba(127,211,255,0)");
        ctx.fillStyle = hg; ctx.fillRect(x, y, 260, 120);
        text(ctx, f.icon, x + 130, y + 52, { s: 32, a: "center" });
        if (on) glowText(ctx, f.name, x + 130, y + 84, { s: 14, w: "800", a: "center", c: KC.blue, blur: 10 });
        else text(ctx, f.name, x + 130, y + 84, { s: 14, w: "800", a: "center", c: KC.ink });
        text(ctx, "약 10" + sup(f.e) + " " + f.unit + " 까지 잰다", x + 130, y + 106, { s: 10.5, a: "center", c: KC.mute });
      }
      /* 요구 정밀도 사다리 */
      KT.t(ctx, "어느 자릿수까지 재는가", 30, 356, { s: 11.5, w: "800", c: KC.mute });
      var lg = ctx.createLinearGradient(80, 0, 850, 0); lg.addColorStop(0, KC.violet); lg.addColorStop(1, KC.blue);
      ctx.save(); ctx.shadowColor = "rgba(180,200,255,.6)"; ctx.shadowBlur = 8; ctx.strokeStyle = lg; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(80, 392); ctx.lineTo(850, 392); ctx.stroke(); ctx.restore();
      for (i = -12; i <= 0; i += 3) {
        var x2 = xOf(i);
        ctx.strokeStyle = KC.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x2, 392); ctx.lineTo(x2, 400); ctx.stroke();
        KT.t(ctx, "10" + sup(i), x2, 416, { s: 10.5, a: "center", c: KC.mute, w: "700" });
      }
      KT.t(ctx, "← 더 미세하게", 80, 434, { s: 10, c: KC.mute });
      KT.t(ctx, "거칠게 →", 850, 434, { s: 10, a: "right", c: KC.mute });
      for (i = 0; i < FIELDS.length; i++) {
        var fx = xOf(FIELDS[i].e) + (i === 1 ? 14 : i === 4 ? 14 : 0), on2 = i === sel;
        if (on2) KT.glow(ctx, fx, 392, 6, "rgba(255,179,92,.98)", 3.4);
        else KT.glow(ctx, fx, 392, 3.5, "rgba(127,211,255,.9)", 2.6);
        if (on2) KT.pill(ctx, FIELDS[i].icon + " " + FIELDS[i].name, clamp(fx, 110, 800), 376, { a: "center", s: 11, c: KC.orange });
      }
      if (sel >= 0) {
        $("c-fields-info").innerHTML = "<b>" + FIELDS[sel].icon + " " + FIELDS[sel].name + "</b> — " + FIELDS[sel].desc +
          "<br>요구 정밀도는 약 <b>10" + sup(FIELDS[sel].e) + " " + FIELDS[sel].unit + "</b> 수준입니다.";
      }
    }
    canvas._redraw = draw;
    canvas.addEventListener("click", function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas._w / rect.width);
      var my = (e.clientY - rect.top) * (canvas._h / rect.height);
      for (var i = 0; i < FIELDS.length; i++) {
        var x = 30 + (i % 3) * 290, y = 60 + Math.floor(i / 3) * 135;
        if (mx >= x && mx <= x + 260 && my >= y && my <= y + 120) { sel = i; draw(); return; }
      }
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
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 43 });

      /* 지도 — 밤의 도시 */
      ctx.save(); ctx.beginPath(); ctx.roundRect(40, 52, 530, 320, 10); ctx.clip();
      var mg = ctx.createLinearGradient(40, 52, 570, 372); mg.addColorStop(0, "#141a3a"); mg.addColorStop(1, "#0a0e24");
      ctx.fillStyle = mg; ctx.fillRect(40, 52, 530, 320);
      ctx.strokeStyle = "rgba(255,211,107,.18)"; ctx.lineWidth = 6;
      for (i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(50 + i * 130, 52); ctx.lineTo(50 + i * 130, 372); ctx.stroke(); }
      for (j = 0; j <= 3; j++) { ctx.beginPath(); ctx.moveTo(40, 60 + j * 100); ctx.lineTo(570, 60 + j * 100); ctx.stroke(); }
      var RW = KT.rng(7);
      for (i = 0; i < 4; i++) {
        for (j = 0; j < 3; j++) {
          var bx = 60 + i * 130, by = 70 + j * 100, bgd = ctx.createLinearGradient(bx, by, bx, by + 80);
          bgd.addColorStop(0, "#2a3366"); bgd.addColorStop(1, "#161c40");
          ctx.fillStyle = bgd; ctx.beginPath(); ctx.roundRect(bx, by, 110, 80, 6); ctx.fill();
          ctx.strokeStyle = "rgba(160,175,255,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bx, by, 110, 80, 6); ctx.stroke();
          for (var w = 0; w < 10; w++) { if (RW() < 0.5) { ctx.fillStyle = "rgba(255,220,150,.55)"; ctx.fillRect(bx + 10 + (w % 5) * 19, by + 14 + Math.floor(w / 5) * 34, 7, 5); } }
        }
      }
      ctx.restore();
      ctx.strokeStyle = "rgba(200,210,255,.3)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(40, 52, 530, 320, 10); ctx.stroke();
      var Rs = clamp(e * 0.7, 3, 140);
      KT.pill(ctx, "🏫 학교", 375, Math.min(360, 200 + Rs + 24), { a: "center", s: 12, c: KC.green });
      KT.pill(ctx, "50 m", 100, 362, { s: 10, c: KC.mute });
      hline(ctx, 140, 175, 357, KC.ink, 2);

      /* 오차 원 — 퍼져 나가는 물결 */
      var R = clamp(e * 0.7, 3, 140);
      var cg = ctx.createRadialGradient(375, 200, 0, 375, 200, R);
      cg.addColorStop(0, "rgba(127,211,255,.05)"); cg.addColorStop(1, "rgba(127,211,255,.28)");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(375, 200, R, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 12; ctx.strokeStyle = KC.blue; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(375, 200, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      if (R > 8) { ctx.strokeStyle = "rgba(127,211,255," + (0.6 * (1 - ph)) + ")"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(375, 200, R * ph, 0, Math.PI * 2); ctx.stroke(); }
      KT.glow(ctx, 375, 200, 6, "rgba(255,107,129,.98)", 3);
      KT.pill(ctx, "내 자리는 이 원 안 어딘가", 375, 200 - R - 10 < 76 ? 76 : 200 - R - 10, { a: "center", s: 11, c: KC.blue, box: [40, 570] });
      KT.pill(ctx, "위성 시계가 " + dt + " ns 틀렸을 때 지도 위의 내 자리", 16, 30, { s: 12.5, c: KC.blue });

      /* 오른쪽 계산 */
      glass(ctx, 588, 52, 296, 296, 14, "rgba(200,210,255,.2)", 0.06);
      text(ctx, "거리 = 빛의 속력 × 시간", 600, 80, { s: 13, w: "900", c: KC.violet });
      text(ctx, "빛의 속력", 600, 112, { s: 11, c: KC.mute });
      text(ctx, "299,792,458 m/s", 870, 112, { s: 11.5, w: "800", a: "right", c: KC.ink });
      text(ctx, "시계 오차", 600, 140, { s: 11, c: KC.mute });
      text(ctx, dt + " ns", 870, 140, { s: 11.5, w: "800", a: "right", c: KC.ink });
      hline(ctx, 600, 870, 154, KC.line, 1.5);
      text(ctx, "위치 오차", 600, 186, { s: 12, w: "800", c: KC.mute });
      glowText(ctx, e.toFixed(2) + " m", 870, 192, { s: 26, w: "900", a: "right", c: ecol });

      var verdict = e <= 10 ? "🏫 같은 건물 안을 가리킨다" : e <= 30 ? "🚪 건물 앞마당쯤" : e <= 100 ? "🚸 길 건너편" : "🏙 옆 블록으로 건너뛴다";
      KT.pill(ctx, verdict, 600, 234, { s: 13, c: ecol });
      text(ctx, "시계가 1 ns 틀리면 위치가 30 cm,", 600, 272, { s: 11.5, w: "800", c: KC.violet });
      text(ctx, "1 µs(1000 ns) 틀리면 약 300 m 어긋난다", 600, 296, { s: 11.5, w: "800", c: KC.orange });
      text(ctx, "그래서 GPS 위성은 원자시계를 싣는다", 600, 324, { s: 11, c: KC.mute });
      KT.t(ctx, "상대성 이론 보정을 하지 않으면 위성 시계는 하루 약 38 µs 어긋나고, 그것은 하루 11 km가 넘는 위치 오차가 됩니다.", 40, 386, { s: 11, c: KC.mute, w: "600" });
    }
    function draw() {
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

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var y = yieldOf(), half = Math.max(4 * sd, 1.6 * tol()), i;
      function xOf(nm) { return 80 + (nm - (w - half)) / (2 * half) * 740; }
      function yOf(p) { return 280 - p * 200; }
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 47 });
      /* 웨이퍼 그림(장식) — 승자는 초록, 버리는 칩은 붉은색 */
      var wx = 850, wy = 112, wr = 34, RC = KT.rng(5);
      var wg = ctx.createRadialGradient(wx - 10, wy - 12, 4, wx, wy, wr); wg.addColorStop(0, "#e8ecff"); wg.addColorStop(0.4, "#8f9bc6"); wg.addColorStop(1, "#3b4470");
      ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(wx, wy, wr - 3, 0, Math.PI * 2); ctx.clip();
      for (var gx = wx - wr; gx < wx + wr; gx += 8) for (var gy = wy - wr; gy < wy + wr; gy += 8) {
        ctx.fillStyle = RC() < y ? "rgba(63,211,163,.75)" : "rgba(255,107,129,.8)"; ctx.fillRect(gx + 1, gy + 1, 6, 6);
      }
      ctx.restore();
      KT.t(ctx, "웨이퍼", wx, wy + wr + 16, { s: 10.5, a: "center", c: KC.mute });

      KT.pill(ctx, "웨이퍼 한 장에서 잰 선폭의 분포", 16, 30, { s: 12.5, c: KC.blue });
      text(ctx, "목표 " + w + " nm · 허용 범위 ± 10 % = ± " + tol().toFixed(1) + " nm · 측정·공정 오차 " + sd.toFixed(1) + " nm",
        884, 36, { s: 12, a: "right", c: KC.mute });

      /* 분포 곡선 + 색칠 */
      var lo = w - tol(), hi = w + tol();
      ctx.beginPath();
      for (i = 0; i <= 200; i++) {
        var nm = (w - half) + (2 * half) * i / 200;
        var p = Math.exp(-Math.pow((nm - w) / sd, 2) / 2);
        if (i === 0) ctx.moveTo(xOf(nm), yOf(p)); else ctx.lineTo(xOf(nm), yOf(p));
      }
      ctx.lineTo(xOf(w + half), 280); ctx.lineTo(xOf(w - half), 280); ctx.closePath();
      ctx.fillStyle = "rgba(255,107,129,.32)"; ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.rect(clamp(xOf(lo), 80, 820), 70, Math.max(0, clamp(xOf(hi), 80, 820) - clamp(xOf(lo), 80, 820)), 215); ctx.clip();
      ctx.beginPath();
      for (i = 0; i <= 200; i++) {
        var nm2 = (w - half) + (2 * half) * i / 200;
        var p2 = Math.exp(-Math.pow((nm2 - w) / sd, 2) / 2);
        if (i === 0) ctx.moveTo(xOf(nm2), yOf(p2)); else ctx.lineTo(xOf(nm2), yOf(p2));
      }
      ctx.lineTo(xOf(w + half), 280); ctx.lineTo(xOf(w - half), 280); ctx.closePath();
      var gf = ctx.createLinearGradient(0, 80, 0, 280); gf.addColorStop(0, "rgba(63,211,163,.8)"); gf.addColorStop(1, "rgba(63,211,163,.25)");
      ctx.fillStyle = gf; ctx.fill();
      ctx.restore();

      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 10;
      ctx.strokeStyle = "#e8f6ff"; ctx.lineWidth = 2.2; ctx.beginPath();
      for (i = 0; i <= 200; i++) {
        var nm3 = (w - half) + (2 * half) * i / 200;
        var p3 = Math.exp(-Math.pow((nm3 - w) / sd, 2) / 2);
        if (i === 0) ctx.moveTo(xOf(nm3), yOf(p3)); else ctx.lineTo(xOf(nm3), yOf(p3));
      }
      ctx.stroke(); ctx.restore();
      hline(ctx, 80, 820, 280, KC.line, 2);

      vdash(ctx, clamp(xOf(lo), 80, 820), 72, 280, KC.red);
      vdash(ctx, clamp(xOf(hi), 80, 820), 72, 280, KC.red);
      KT.pill(ctx, "허용 하한 " + lo.toFixed(1), clamp(xOf(lo), 110, 780) - 6, 66, { s: 10.5, a: "right", c: KC.red });
      KT.pill(ctx, "허용 상한 " + hi.toFixed(1), clamp(xOf(hi), 110, 780) + 6, 66, { s: 10.5, c: KC.red });
      vdash(ctx, xOf(w), 72, 280, KC.blue);
      KT.pill(ctx, "목표 " + w + " nm", xOf(w), 302, { a: "center", s: 11, c: KC.blue });
      KT.t(ctx, "초록 = 살아남는 칩 · 붉은색 = 버리는 칩", 820, 300, { s: 10.5, a: "right", c: KC.mute, w: "600" });

      /* 수율 막대 */
      var ycol = y >= 0.95 ? KC.green : y >= 0.8 ? KC.yellow : KC.red;
      glowBar(ctx, 80, 318, 600, 22, y, ycol);
      glowText(ctx, "수율 " + (y * 100).toFixed(1) + " %", 700, 336, { s: 17, w: "900", c: y >= 0.95 ? KC.green : KC.red, blur: 10 });

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
    function sx(t) { return 60 + t / TT * 800; }
    function sy(y) { return 160 - y * 90; }

    var sst = { on: !REDUCE }, sph = 0;
    function renderSamp() {
      ctx.clearRect(0, 0, W, H);
      var s = samples(), me = maxErr(s), i;
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 53, gridStep: 25 });
      KT.pill(ctx, "손목에서 오는 맥박 신호 (1초에 1.2번)를 1초에 " + rate + "번 잰다", 16, 30, { s: 12.5, c: KC.blue });
      hline(ctx, 60, 860, sy(0), KC.line, 1);

      /* 원래 신호 */
      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 10;
      ctx.strokeStyle = KC.blue; ctx.lineWidth = 2.5; ctx.beginPath();
      for (i = 0; i <= 400; i++) {
        var t = TT * i / 400;
        if (i === 0) ctx.moveTo(sx(t), sy(sig(t))); else ctx.lineTo(sx(t), sy(sig(t)));
      }
      ctx.stroke();
      /* 복원된 꺾은선 */
      ctx.shadowColor = KC.violet; ctx.strokeStyle = KC.violet; ctx.lineWidth = 2.5; ctx.setLineDash([7, 4]); ctx.beginPath();
      for (i = 0; i < s.t.length; i++) {
        if (i === 0) ctx.moveTo(sx(s.t[i]), sy(s.v[i])); else ctx.lineTo(sx(s.t[i]), sy(s.v[i]));
      }
      ctx.stroke(); ctx.restore();
      /* 표본점 */
      for (i = 0; i < s.t.length; i++) {
        KT.line(ctx, { x: sx(s.t[i]), y: sy(0) }, { x: sx(s.t[i]), y: sy(s.v[i]) }, "rgba(255,179,92,.35)", 1);
        KT.glow(ctx, sx(s.t[i]), sy(s.v[i]), rate > 30 ? 2.2 : 3.6, "rgba(255,179,92,.98)", 2.6);
      }
      /* 훑어 가는 신호 점 */
      var tp = TT * sph;
      KT.line(ctx, { x: sx(tp), y: 60 }, { x: sx(tp), y: 256 }, "rgba(127,211,255,.25)", 1);
      KT.glow(ctx, sx(tp), sy(sig(tp)), 4, "rgba(220,245,255,.98)", 3.6);
      /* 시간축 */
      for (i = 0; i <= 4; i++) {
        var tt = i * 0.5;
        ctx.strokeStyle = KC.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx(tt), 258); ctx.lineTo(sx(tt), 266); ctx.stroke();
        KT.t(ctx, tt.toFixed(1) + " s", sx(tt), 282, { s: 10, a: "center", c: KC.mute, w: "700" });
      }
      hline(ctx, 60, 860, 258, KC.line, 1.5);
      text(ctx, "— 원래 신호", 60, 306, { s: 11, w: "800", c: KC.blue });
      text(ctx, "┄ 표본을 이어 되살린 신호", 180, 306, { s: 11, w: "800", c: KC.violet });
      text(ctx, "● 표본 " + s.t.length + "개", 380, 306, { s: 11, w: "800", c: KC.orange });
      glowText(ctx, "복원 오차 " + (me * 100).toFixed(1) + " %", 860, 306,
        { s: 13, w: "900", a: "right", c: me <= 0.05 ? KC.green : KC.red, blur: 8 });
    }
    function drawSamp() {
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
    function qxOf(t) { return 80 + (t - LO) / (HI - LO) * 740; }

    function drawQuant() {
      qx.clearRect(0, 0, QW, QH);
      var st = step(), i;
      KT.stage(qx, 0, 0, QW, QH, "lab", { seed: 59 });
      KT.pill(qx, "체온계가 다루는 30 ℃~45 ℃를 " + Math.pow(2, bits).toLocaleString() + " 칸(" + bits + "비트)으로 쪼갠다", 16, 30, { s: 12.5, c: KC.blue });

      /* 칸으로 나눠진 눈금막대 — 차가운 쪽에서 뜨거운 쪽으로 */
      var tg = qx.createLinearGradient(80, 0, 820, 0); tg.addColorStop(0, "rgba(127,211,255,.35)"); tg.addColorStop(1, "rgba(255,107,129,.35)");
      qx.fillStyle = tg; qx.beginPath(); qx.roundRect(80, 84, 740, 44, 8); qx.fill();
      qx.strokeStyle = "rgba(220,226,255,.45)"; qx.lineWidth = 1.5; qx.beginPath(); qx.roundRect(80, 84, 740, 44, 8); qx.stroke();
      var cells = Math.pow(2, bits);
      if (cells <= 128) {
        for (i = 1; i < cells; i++) {
          var x = 80 + 740 * i / cells;
          qx.strokeStyle = "rgba(230,236,255,.55)"; qx.lineWidth = cells > 32 ? 0.5 : 1;
          qx.beginPath(); qx.moveTo(x, 84); qx.lineTo(x, 128); qx.stroke();
        }
      } else {
        text(qx, "칸이 너무 촘촘해 그릴 수 없습니다 (" + cells.toLocaleString() + "칸)", 450, 112, { s: 11.5, a: "center", c: KC.ink });
      }
      for (i = 30; i <= 45; i += 5) {
        KT.t(qx, i + " ℃", qxOf(i), 148, { s: 10.5, a: "center", c: KC.mute, w: "700" });
      }
      /* 세 온도가 눈금막대의 어느 칸에 떨어지나 */
      var TS = [36.5, 36.7, 37.0];
      for (i = 0; i < TS.length; i++) {
        var t0 = TS[i], sh0 = shown(t0), okq = Math.abs(sh0 - t0) <= 0.05;
        KT.glow(qx, qxOf(t0), 106, 3, okq ? "rgba(63,211,163,.98)" : "rgba(255,179,92,.98)", 3);
        KT.line(qx, { x: qxOf(t0), y: 128 }, { x: 80 + i * 250 + 120, y: 170 }, okq ? "rgba(63,211,163,.4)" : "rgba(255,179,92,.4)", 1, [3, 3]);
      }
      for (i = 0; i < TS.length; i++) {
        var bx = 80 + i * 250, t = TS[i], sh = shown(t), ok = Math.abs(sh - t) <= 0.05;
        card(qx, bx, 170, 240, 92, true, ok ? "--green" : "--coral");
        text(qx, "이마의 실제 온도 " + t.toFixed(1) + " ℃", bx + 120, 194, { s: 11, a: "center", c: KC.mute });
        var lc = qx.createLinearGradient(0, 206, 0, 236); lc.addColorStop(0, "#0e2a1c"); lc.addColorStop(1, "#06140d");
        qx.fillStyle = lc; qx.beginPath(); qx.roundRect(bx + 50, 204, 140, 32, 6); qx.fill();
        glowText(qx, sh.toFixed(2) + " ℃", bx + 120, 228, { s: 22, w: "900", a: "center", c: ok ? "#8dffc0" : KC.orange, blur: 10 });
        text(qx, "화면에 찍히는 값", bx + 120, 252, { s: 10, a: "center", c: KC.mute });
      }
      glowText(qx, "한 칸의 폭 " + st.toFixed(4) + " ℃ → 최대 오차 " + (st / 2).toFixed(4) + " ℃", 40, 288,
        { s: 13, w: "900", c: st / 2 <= 0.05 ? KC.green : KC.red, blur: 8 });
      KT.t(qx, "칸이 성기면 서로 다른 온도가 같은 숫자로 찍힙니다.", 470, 288, { s: 11, c: KC.mute, w: "600" });

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
