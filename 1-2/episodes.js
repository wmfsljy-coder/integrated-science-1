/* 통합과학1 Ⅰ-2 과학의 측정과 우리 사회 — 소단원별 이야기 세 편
   01 과녁에 남은 자국 / 02 1미터를 다시 정하는 회의 / 03 30 cm 를 다투는 사람들
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
function card(ctx, x, y, w, h, on, col) {
  ctx.fillStyle = v(on ? "--card-2" : "--panel");
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = v(on ? (col || "--brand") : "--line"); ctx.lineWidth = on ? 3 : 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.stroke();
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
    question: "표적지 넉 장 가운데, 총을 정비실로 보내야 할 선수는 누구일까요?",
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

    /* 평균이 정확히 0, 중심에서의 제곱평균거리가 정확히 1 이 되도록 다듬은 10발의 흩어짐 */
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
      paper(ctx, W, H);
      var bx = CX + Math.cos(ANG) * bias, by = CY + Math.sin(ANG) * bias, i;

      /* 과녁 */
      text(ctx, "과녁 — 가운데 붉은 점이 참값", CX, 44, { s: 12.5, w: "800", a: "center", c: v("--teal-700") });
      for (i = 0; i < 4; i++) {
        var r = R * (1 - i * 0.25);
        ctx.fillStyle = v(i % 2 === 0 ? "--card-2" : "--panel");
        ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = v("--rose");
      ctx.beginPath(); ctx.arc(CX, CY, 7, 0, Math.PI * 2); ctx.fill();

      /* 10발 */
      for (i = 0; i < U.length; i++) {
        var x = bx + U[i][0] * noise, y = by + U[i][1] * noise;
        ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = v("--panel"); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
      }
      /* 평균 자리 */
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(bx - 12, by); ctx.lineTo(bx + 12, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by - 12); ctx.lineTo(bx, by + 12); ctx.stroke();
      text(ctx, "10발의 평균", bx + 15, by - 10, { s: 10.5, w: "800", c: v("--violet-700") });
      text(ctx, "● 10발  ✛ 평균  ● 참값", CX, 418, { s: 11, a: "center", c: v("--mist") });

      /* 오른쪽 — 성적표 */
      text(ctx, "이번 10발의 성적", 460, 44, { s: 12.5, w: "800", c: v("--teal-700") });
      text(ctx, "정확도 오차 — 평균이 중심에서 떨어진 거리", 460, 76, { s: 11.5, w: "800" });
      text(ctx, bias + " mm", 880, 76, { s: 13, w: "900", a: "right", c: v(accurate() ? "--green-700" : "--rose-700") });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(460, 86, 420, 18, 9); ctx.fill();
      ctx.fillStyle = v(accurate() ? "--green" : "--rose");
      ctx.beginPath(); ctx.roundRect(460, 86, Math.max(6, 420 * bias / 60), 18, 9); ctx.fill();
      text(ctx, "10 mm 이내면 ‘정확하다’", 460, 120, { s: 10.5, c: v("--mist") });

      text(ctx, "정밀도 — 열 발이 얼마나 모였나 (표준편차)", 460, 150, { s: 11.5, w: "800" });
      text(ctx, noise + " mm", 880, 150, { s: 13, w: "900", a: "right", c: v(precise() ? "--green-700" : "--rose-700") });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(460, 160, 420, 18, 9); ctx.fill();
      ctx.fillStyle = v(precise() ? "--green" : "--rose");
      ctx.beginPath(); ctx.roundRect(460, 160, Math.max(6, 420 * noise / 40), 18, 9); ctx.fill();
      text(ctx, "8 mm 이하면 ‘정밀하다’", 460, 194, { s: 10.5, c: v("--mist") });

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
        text(ctx, c.who, c.x + 87, c.y + 34, { s: 17, w: "900", a: "center", c: v(on ? "--brand-700" : "--mist") });
        text(ctx, c.t, c.x + 87, c.y + 58, { s: 10.5, a: "center", c: v("--mist") });
      }
      text(ctx, "지금 만든 표적지는 " + who() + " 의 것입니다.", 460, 418, { s: 11.5, w: "800", c: v("--brand-700") });

      $("a-target-info").innerHTML =
        "평균이 중심에서 <b>" + bias + " mm</b>, 열 발의 표준편차 <b>" + noise + " mm</b> → <b>" +
        (accurate() ? "정확" : "정확하지 않음") + " · " + (precise() ? "정밀" : "정밀하지 않음") + "</b> (" + who() + " 의 표적지)<br>" +
        (who() === "나래" ? "한곳에 빈틈없이 모였는데 중심이 아닙니다. <b>매번 같은 쪽으로 같은 만큼</b> 어긋났으니 사람이 아니라 총을 의심해야 합니다."
         : who() === "다인" ? "평균은 한가운데인데 발마다 흩어졌습니다. 조준선은 멀쩡하고 <b>우연 오차</b>가 큰 경우입니다."
         : who() === "가온" ? "정확하면서 정밀합니다. 측정이 바라는 모습이지요."
         : "치우치기도 하고 흩어지기도 했습니다. 두 손잡이를 따로 움직여 어느 쪽이 무엇을 바꾸는지 보세요.");

      var ch = false;
      if (bias >= 30 && noise <= 8 && !got.a) { got.a = true; ch = true; }
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
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(x, 322, 180, 58, 12); ctx.fill();
      ctx.strokeStyle = v(col); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, 322, 180, 58, 12); ctx.stroke();
      text(ctx, label, x + 90, 342, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, big, x + 90, 367, { s: 17, w: "900", a: "center", c: v(col + "-700") });
    }

    function draw() {
      paper(ctx, W, H);
      var st = stats(), i;

      /* 저울 */
      text(ctx, "표준 분동을 올렸다 내렸다 한다", 145, 44, { s: 12.5, w: "800", a: "center", c: v("--teal-700") });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(100, 92, 90, 34, 8); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(100, 92, 90, 34, 8); ctx.stroke();
      text(ctx, "50.00 g", 145, 114, { s: 13, w: "900", a: "center", c: v("--ink") });
      text(ctx, "참값 (표준 분동)", 145, 82, { s: 10.5, a: "center", c: v("--mist") });
      card(ctx, 40, 140, 210, 120, true, "--brand");
      ctx.fillStyle = v("--panel"); ctx.beginPath(); ctx.roundRect(60, 160, 170, 48, 8); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(60, 160, 170, 48, 8); ctx.stroke();
      text(ctx, val(n - 1).toFixed(2) + " g", 145, 194, { s: 22, w: "900", a: "center", c: v("--brand-700") });
      text(ctx, "마지막으로 읽은 값", 145, 228, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "영점 " + (z >= 0 ? "+" : "−") + Math.abs(z).toFixed(1) + " g", 145, 250,
        { s: 12, w: "900", a: "center", c: v(Math.abs(z) < 0.05 ? "--green-700" : "--rose-700") });
      text(ctx, Math.abs(z) < 0.05 ? "영점이 맞았다" : "영점이 틀어졌다", 145, 284, { s: 11, a: "center", c: v("--mist") });

      /* 측정값 그래프 */
      text(ctx, n + "번 재어 늘어놓은 값", 300, 44, { s: 12.5, w: "800", c: v("--teal-700") });
      for (i = 48; i <= 52; i++) {
        hline(ctx, 300, 870, yOf(i), v("--line"), 1);
        text(ctx, i + ".0", 296, yOf(i) + 4, { s: 10, a: "right", c: v("--mist") });
      }
      dash(ctx, 300, 870, yOf(TRUE), v("--teal"));
      text(ctx, "참값 50.00 g", 866, yOf(TRUE) - 8, { s: 11, w: "800", a: "right", c: v("--teal-700") });
      for (i = 0; i < n; i++) {
        var x = n === 1 ? 585 : 315 + (i / (n - 1)) * 540;
        ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(x, yOf(val(i)), n > 30 ? 3.5 : 5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
      hline(ctx, 300, 870, yOf(st.mean), v("--violet"), 2.5);
      text(ctx, "평균 " + st.mean.toFixed(3) + " g", 304, yOf(st.mean) - 8, { s: 11.5, w: "900", c: v("--violet-700") });

      box(300, "평균", st.mean.toFixed(3) + " g", "--violet");
      box(500, "평균의 오차 (참값과의 차)", (st.err >= 0 ? "+" : "−") + Math.abs(st.err).toFixed(3) + " g", "--coral");
      box(700, "흩어짐 (표준편차)", st.sd.toFixed(3) + " g", "--brand");

      var note;
      if (Math.abs(z) < 0.05) {
        note = n >= 25
          ? "영점이 맞은 저울입니다. <b>" + n + "번</b>을 재어 평균을 내니 오차가 <b>" + Math.abs(st.err).toFixed(3) + " g</b> 까지 줄었습니다. 흩어짐(표준편차)은 <b>" + st.sd.toFixed(3) + " g</b> 로 거의 그대로인데 <b>평균</b>만 참값에 다가갔다는 점이 중요합니다."
          : "아직 <b>" + n + "번</b>뿐입니다. 평균의 오차가 <b>" + Math.abs(st.err).toFixed(3) + " g</b> 입니다. 횟수를 늘려 보세요.";
      } else {
        note = n >= 25
          ? "영점이 <b>" + z.toFixed(1) + " g</b> 틀어져 있습니다. <b>" + n + "번</b>이나 재어 평균을 냈는데도 오차가 <b>" + Math.abs(st.err).toFixed(3) + " g</b> 로 남아 있습니다. <b>계통 오차는 반복으로 줄지 않습니다.</b>"
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
        { t: "영점이 0.5 g 틀어진 저울로 잰다", a: "sys", why: "모든 측정값이 같은 쪽으로 0.5 g 씩 밀립니다. 저울을 교정해야 사라집니다." },
        { t: "눈금을 읽을 때마다 눈의 위치가 조금씩 달라진다", a: "ran", why: "위로도 아래로도 어긋나므로 평균을 내면 줄어듭니다." },
        { t: "줄자가 더운 날 늘어난 채로 길이를 잰다", a: "sys", why: "늘어난 줄자는 언제나 실제보다 짧은 값을 내놓습니다.", hint: "매번 같은 쪽으로 틀리나요, 제멋대로 틀리나요?" },
        { t: "초시계를 누르는 반응이 매번 조금씩 빠르거나 늦다", a: "ran", why: "빠를 때도 늦을 때도 있으므로 여러 번 재어 평균을 냅니다." },
        { t: "언제나 눈금의 위쪽을 보는 버릇이 있다", a: "sys", why: "버릇이 일정하면 모든 값이 같은 쪽으로 치우칩니다. 이것도 계통 오차입니다.", hint: "‘언제나’ 라는 말에 주목하세요." },
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
      var dec = Math.round(-Math.log(step) / Math.LN10) + 1;   /* cm 로 적을 때의 소수 자릿수 */
      return { mm: mm, cm: (mm / 10).toFixed(dec), dec: dec, sig: dec + 1, step: step };
    }
    function xOf(mm) { return 80 + mm * 9; }

    function draw() {
      paper(ctx, W, H);
      var r = reading(), i;
      text(ctx, "실제 길이 " + L.toFixed(1) + " mm 인 막대를 최소 눈금 " +
        (minDiv === 10 ? "1 cm" : minDiv === 1 ? "1 mm" : "0.1 mm") + " 자로 잰다", 450, 40,
        { s: 12.5, w: "800", a: "center", c: v("--teal-700") });

      /* 막대 */
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.roundRect(80, 62, Math.max(8, L * 9), 34, 6); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--brand-700"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(80, 62, Math.max(8, L * 9), 34, 6); ctx.stroke();

      /* 자 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(80, 110, 720, 46);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.strokeRect(80, 110, 720, 46);
      var drawStep = minDiv === 10 ? 10 : minDiv === 1 ? 1 : 0.5;
      for (i = 0; i * drawStep <= 80.0001; i++) {
        var mm = i * drawStep, x = xOf(mm);
        if (x > 800) break;
        var big = Math.abs(mm / 10 - Math.round(mm / 10)) < 1e-9;
        ctx.strokeStyle = v(big ? "--ink" : "--mist"); ctx.lineWidth = big ? 1.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x, big ? 136 : 124); ctx.stroke();
        if (big) text(ctx, (mm / 10) + "", x, 152, { s: 10, a: "center", c: v("--mist") });
      }
      if (minDiv === 0.1) text(ctx, "※ 실제로는 0.1 mm 마다 눈금이 있지만 화면에서는 0.5 mm 마다만 그렸습니다", 80, 174, { s: 10, c: v("--mist") });
      text(ctx, "단위: cm", 806, 152, { s: 10.5, w: "800", c: v("--mist") });

      /* 막대 끝 표시 */
      vdash(ctx, xOf(L), 58, 140, v("--coral"));

      /* 읽은 값 */
      text(ctx, "이 자로 적을 수 있는 값", 450, 208, { s: 11.5, a: "center", c: v("--mist") });
      text(ctx, r.cm + " cm", 450, 248, { s: 34, w: "900", a: "center", c: v("--violet-700") });
      text(ctx, "눈금으로 읽은 자리 " + (r.sig - 1) + "개 + 어림한 자리 1개 = 유효숫자 " + r.sig + "자리",
        450, 278, { s: 13, w: "800", a: "center", c: v("--brand-700") });
      var stepLabel = r.step >= 1 ? "1" : (r.step > 0.05 ? "0.1" : "0.01");
      text(ctx, "어림하는 자리는 최소 눈금의 1/10, 곧 " + stepLabel + " mm 자리입니다.",
        450, 304, { s: 11.5, a: "center", c: v("--mist") });

      $("a-ruler-info").innerHTML = "최소 눈금 <b>" + (minDiv === 10 ? "1 cm" : minDiv === 1 ? "1 mm" : "0.1 mm") +
        "</b> 자로 읽으면 <b>" + r.cm + " cm</b> (유효숫자 " + r.sig + "자리). " +
        (minDiv === 10 ? "이 자로 4.27 이라고 적으면 재지도 않은 자리를 적은 것이 됩니다."
         : minDiv === 1 ? "마지막 자리는 눈금 사이를 눈으로 <b>어림한</b> 값이므로 사람마다 조금 다를 수 있습니다."
         : "자가 정밀해진 만큼 믿을 수 있는 자리가 한 자리 늘었습니다.");

      var ch = false;
      if (!got.seen[String(minDiv)]) { got.seen[String(minDiv)] = true; ch = true; }
      if (Math.round(L * 10) === 500 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("aRuler", got); mission(); }
    }

    window.sthPick({
      mount: "s1-pick",
      q: "최소 눈금이 1 mm 인 자로 잰 뒤 길이를 <b>4.2700 cm</b> 라고 적었습니다. 무엇이 잘못되었을까요?",
      options: [
        "단위를 cm 가 아니라 mm 로 적어야 한다",
        "이 자가 알려 줄 수 없는 자리까지 적었다",
        "소수점 아래는 언제나 두 자리까지만 적는 것이 규칙이다",
        "여러 번 재어 평균을 내지 않아서 틀렸다"
      ],
      answer: 1,
      why: [
        "단위는 cm 로 적어도 mm 로 적어도 됩니다. 문제는 <b>자릿수</b>입니다.",
        "1 mm 자는 0.1 mm 자리까지만 어림할 수 있습니다. 4.27 cm 가 맞고, 뒤의 0 두 개는 재지 않은 자리입니다.",
        "자릿수를 정하는 것은 규칙이 아니라 <b>쓰는 자</b>입니다. 0.1 mm 자라면 4.270 cm 까지 적을 수 있습니다.",
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
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 이제 숫자로도 증명했네요."
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
    question: "금고 온도가 0 ℃ 에서 20 ℃ 로 오르면, 1 m 짜리 미터원기는 얼마나 길어질까요?",
    options: [
      "㉠ 금속이라 전혀 길어지지 않는다",
      "㉡ 머리카락 두세 개 굵기쯤 (약 0.17 mm)",
      "㉢ 손가락 한 마디쯤 (약 2 cm)"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 원기의 열팽창 (계산 모형: ΔL = L·α·ΔT) */
  (function () {
    var canvas = $("b-bar"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var T = 5;
    var got = window.sthState("bBar") || { a: false, b: false };

    function dL() { return ALPHA * T * 1e6; }              /* µm */
    function draw() {
      paper(ctx, W, H);
      var d = dL();
      text(ctx, "국제 미터원기 — 1889년의 정의는 ‘얼음이 녹는 온도(0 ℃)에서의 길이’", 40, 36, { s: 12.5, w: "800", c: v("--teal-700") });

      /* 막대 */
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(80, 78, 740, 44, 8); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(80, 78, 740, 44, 8); ctx.stroke();
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.roundRect(80, 78, 740, 44, 8); ctx.fill(); ctx.globalAlpha = 1;
      text(ctx, "백금 90 % · 이리듐 10 % · 길이 1 m", 450, 106, { s: 13, w: "800", a: "center" });
      text(ctx, "0 m", 80, 140, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "1 m", 820, 140, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, T.toFixed(1) + " ℃", 450, 66, { s: 12, w: "900", a: "center", c: v(T <= 0.6 ? "--brand-700" : "--coral-700") });

      /* 왼쪽 — 확대해 본 늘어남 */
      card(ctx, 60, 166, 380, 140, true, "--coral");
      text(ctx, "막대 끝을 크게 확대해 보면", 250, 190, { s: 11.5, w: "800", a: "center", c: v("--coral-700") });
      var maxUm = 350, bx0 = 90, bw = 320;
      text(ctx, "늘어난 길이", 90, 218, { s: 10.5, c: v("--mist") });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(bx0, 224, bw, 18, 9); ctx.fill();
      ctx.fillStyle = v("--coral");
      ctx.beginPath(); ctx.roundRect(bx0, 224, Math.max(4, bw * clamp(d / maxUm, 0, 1)), 18, 9); ctx.fill();
      text(ctx, d.toFixed(1) + " µm", 410, 218, { s: 12, w: "900", a: "right", c: v("--coral-700") });
      text(ctx, "머리카락 굵기", 90, 264, { s: 10.5, c: v("--mist") });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(bx0, 270, bw, 18, 9); ctx.fill();
      ctx.fillStyle = v("--mist");
      ctx.beginPath(); ctx.roundRect(bx0, 270, bw * (HAIR / maxUm), 18, 9); ctx.fill();
      text(ctx, HAIR + " µm", 410, 264, { s: 12, w: "900", a: "right", c: v("--mist") });

      /* 오른쪽 — 이 자로 1 km 를 재면 */
      card(ctx, 460, 166, 380, 140, true, "--violet");
      text(ctx, "이 원기를 베낀 자로 1 km 를 재면", 650, 190, { s: 11.5, w: "800", a: "center", c: v("--violet-700") });
      text(ctx, (ALPHA * T * 1000 * 1000).toFixed(1) + " mm", 650, 236, { s: 30, w: "900", a: "center", c: v("--violet-700") });
      text(ctx, "만큼 어긋난다", 650, 260, { s: 11.5, a: "center", c: v("--mist") });
      text(ctx, "ΔL = 1 m × 8.7 × 10⁻⁶ /℃ × " + T.toFixed(1) + " ℃", 650, 288, { s: 11.5, a: "center", c: v("--mist") });

      text(ctx, "금속은 데우면 늘어납니다. 기준이 ‘물건’이면 기준 자체가 날씨에 따라 달라집니다.", 40, 336, { s: 12, c: v("--mist") });

      $("b-bar-info").innerHTML = "금고가 <b>" + T.toFixed(1) + " ℃</b> 일 때 원기는 <b>" + d.toFixed(1) + " µm</b> 늘어납니다" +
        (d < 1 ? " — 거의 0 입니다. 이 자리가 ‘정확히 1 m’ 입니다." :
          d < HAIR ? " — 아직 머리카락 굵기(70 µm)보다 작습니다." :
          " — 머리카락 " + (d / HAIR).toFixed(1) + "개 굵기입니다.") +
        " 이 자로 1 km 를 재면 <b>" + (ALPHA * T * 1000 * 1000).toFixed(1) + " mm</b> 어긋납니다.";

      var ch = false;
      if (d >= 99.5 && !got.a) { got.a = true; ch = true; }
      if (d <= 5 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("bBar", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.a && got.b) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>1 ℃ 마다 <b>8.7 µm</b>. 20 ℃ 면 <b>174 µm</b> 로 머리카락 두 개 반, 그 자로 1 km 를 재면 <b>17 cm</b> 넘게 어긋납니다. 기준이 물건이면 기준이 흔들립니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("b-t").addEventListener("input", function (e) {
      T = +e.target.value; $("b-t-val").textContent = T.toFixed(1) + " ℃"; draw();
    });
    $("b-t-val").textContent = T.toFixed(1) + " ℃";
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
      paper(ctx, W, H);
      var n = spans(), i;
      text(ctx, mode === "span" ? "상인이 자기 뼘으로 재어 “" + n + " 뼘” 이라고 말했다" : "상인이 미터자로 재어 “" + (L / 100).toFixed(2) + " m” 라고 말했다",
        40, 36, { s: 13, w: "800", c: v("--teal-700") });

      /* 실제 천 */
      text(ctx, "실제 천의 길이 " + L + " cm", 40, 66, { s: 11.5, w: "800", c: v("--mist") });
      ctx.fillStyle = v("--teal"); ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.roundRect(60, 76, Math.max(8, L * 1.4), 20, 6); ctx.fill(); ctx.globalAlpha = 1;

      /* 세 사람이 떠올리는 길이 */
      for (i = 0; i < PEOPLE.length; i++) {
        var p = PEOPLE[i], y = 130 + i * 70, len = think(p);
        text(ctx, p.icon + " " + p.who + " (뼘 " + p.hand + " cm)", 60, y - 8, { s: 11.5, w: "800", c: v(p.c + "-700") });
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(60, y, 620, 26, 8); ctx.fill();
        ctx.fillStyle = v(p.c); ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.roundRect(60, y, clamp(len * 1.4, 8, 620), 26, 8); ctx.fill(); ctx.globalAlpha = 1;
        text(ctx, len + " cm 라고 생각한다", 690, y + 18, { s: 12, w: "800", c: v(p.c + "-700") });
      }
      /* 실제 길이 선 */
      vdash(ctx, 60 + L * 1.4, 70, 330, v("--teal"));
      text(ctx, "실제", 60 + L * 1.4, 348, { s: 10.5, w: "800", a: "center", c: v("--teal-700") });

      var lo = loss();
      text(ctx, mode === "span"
        ? "손님은 실제보다 " + lo + " cm 더 길다고 믿고 값을 치른다 → 손해 " + (lo * 200).toLocaleString() + " 원 (1 cm 에 200원)"
        : "세 사람이 떠올리는 길이가 모두 같다 → 차이 0 cm, 손해 0 원",
        40, 372, { s: 13, w: "900", c: v(mode === "span" ? "--rose-700" : "--green-700") });

      $("b-market-info").innerHTML = mode === "span"
        ? "같은 말 “<b>" + n + " 뼘</b>” 을 듣고도 세 사람이 떠올리는 길이가 <b>" + think(PEOPLE[0]) + " cm · " + think(PEOPLE[1]) + " cm · " + think(PEOPLE[2]) + " cm</b> 로 다릅니다. 손님은 실제보다 <b>" + lo + " cm</b> 더 길다고 믿습니다."
        : "미터자로 재면 세 사람이 모두 <b>" + L + " cm</b> 를 떠올립니다. 손 크기와 상관없이 <b>같은 기준</b>으로 말하기 때문입니다. 이것이 측정 표준의 쓸모입니다.";

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
    var got = window.sthState("bLight") || { a: false, b: false };
    function dist() { return CLIGHT * t * 1e-9; }
    function xOf(m) { return 80 + clamp(m, 0, 3) / 3 * 700; }

    function draw() {
      paper(ctx, W, H);
      var d = dist(), i;
      text(ctx, "진공에서 빛을 " + t.toFixed(2) + " ns 동안 달리게 하면", 40, 36, { s: 12.5, w: "800", c: v("--teal-700") });
      text(ctx, d.toFixed(4) + " m", 450, 92, { s: 34, w: "900", a: "center", c: v(Math.abs(d - 1) <= 0.005 ? "--green-700" : "--violet-700") });

      /* 빛의 자취 */
      ctx.strokeStyle = v("--amber"); ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(80, 150); ctx.lineTo(xOf(d), 150); ctx.stroke();
      ctx.lineCap = "butt";
      ctx.fillStyle = v("--amber");
      ctx.beginPath(); ctx.arc(xOf(d), 150, 10, 0, Math.PI * 2); ctx.fill();
      text(ctx, "💡", 80, 156, { s: 20, a: "center" });

      /* 자 */
      hline(ctx, 80, 780, 200, v("--line"), 2);
      for (i = 0; i <= 30; i++) {
        var m = i / 10, x = xOf(m), big = i % 5 === 0;
        ctx.strokeStyle = v(big ? "--ink" : "--mist"); ctx.lineWidth = big ? 1.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(x, 200); ctx.lineTo(x, big ? 216 : 208); ctx.stroke();
        if (big) text(ctx, m.toFixed(1) + " m", x, 232, { s: 10, a: "center", c: v("--mist") });
      }
      vdash(ctx, xOf(1), 130, 200, v("--teal"));
      text(ctx, "여기가 1 m", xOf(1), 124, { s: 11, w: "800", a: "center", c: v("--teal-700") });

      text(ctx, "1 m 의 정의 (1983년~) : 빛이 진공에서 1/299,792,458 초 동안 간 거리", 450, 268, { s: 13, w: "800", a: "center", c: v("--brand-700") });
      text(ctx, "곧 3.3356 ns 입니다. 시계만 정확하면 자가 없어도 1 m 를 만들 수 있습니다.", 450, 294, { s: 11.5, a: "center", c: v("--mist") });

      $("b-light-info").innerHTML = "빛이 <b>" + t.toFixed(2) + " ns</b> 동안 간 거리는 <b>" + d.toFixed(4) + " m</b> 입니다. " +
        (Math.abs(d - 1) <= 0.005 ? "✅ 딱 1 m 입니다. 이때의 시간이 <b>1/299,792,458 초</b> 이지요."
          : Math.abs(t - 1) <= 0.005 ? "✅ 빛은 10억분의 1초에 <b>약 30 cm</b> 를 갑니다. 손 한 뼘 반쯤이지요."
          : "손잡이를 움직여 1.000 m 가 되는 시간과, 1.00 ns 일 때의 거리를 찾아보세요.");

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
        { t: "국제 킬로그램 원기(1889 ~ 2019년)", a: "thing", why: "2019년에 플랑크 상수로 정의가 바뀌면서 물건의 자리에서 내려왔습니다.", hint: "2019년에 무슨 일이 있었나요?" },
        { t: "지구 자오선의 4천만분의 1", a: "thing", why: "자연물이지만 결국 지구를 실제로 측량해야 알 수 있습니다. 당시 측량 오차 때문에 미터원기는 이 길이보다 약 0.2 mm 짧습니다.", hint: "이 기준을 쓰려면 무엇을 직접 재야 할까요?" },
        { t: "빛이 1/299,792,458 초 동안 간 거리 (1 m)", a: "const", why: "빛의 속력을 값으로 못 박아 정의합니다." },
        { t: "세슘-133 원자가 9,192,631,770번 진동하는 시간 (1 s)", a: "const", why: "원자시계의 원리이고, 어디서 재도 같습니다." },
        { t: "플랑크 상수로 정한 1 kg", a: "const", why: "2019년부터 쓰는 킬로그램의 정의입니다." },
        { t: "볼츠만 상수로 정한 1 K", a: "const", why: "온도의 기본단위도 자연 상수에 묶여 있습니다." },
        { t: "아보가드로수로 정한 1 mol", a: "const", why: "입자 6.02214076 × 10²³ 개를 1 mol 로 못 박았습니다." }
      ],
      doneText: "SI 의 기본단위는 이제 모두 오른쪽에 있습니다.",
      onDone: function () { window.sthState("bSortDone", 1); mission(); }
    });

    function mission() {
      var sorted = !!window.sthState("bSortDone");
      if (got.a) done("m2-4a");
      if (got.b) done("m2-4b");
      if (sorted) done("m2-4c");
      if (got.a && got.b && sorted) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>1 m = 빛이 <b>3.3356 ns</b> 동안 간 거리. 기준을 <b>물건</b>에서 <b>자연 상수</b>로 옮기자, 금고를 열지 않아도 세계 어디서나 같은 1 m 를 다시 만들 수 있게 되었습니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("b-ns").addEventListener("input", function (e) {
      t = +e.target.value; $("b-ns-val").textContent = t.toFixed(2) + " ns"; draw();
    });
    $("b-ns-val").textContent = t.toFixed(2) + " ns";
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("m2-4", true);
  })();

  /* 장면 5 — 결말 */
  function finish() {
    window.sthState("r2", "해결 · 원기는 20 ℃ 에서 174 µm 늘어남 · 1 m = 빛이 3.3356 ns 동안 간 거리");
  }
  function paintVs() {
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 어림</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 20 ℃ 에서 174 µm, 곧 0.17 mm 였지요."
        : "20 ℃ 에서 174 µm(0.17 mm)였습니다. 눈에는 안 보이지만, 그 자로 1 km 를 재면 17 cm 가 어긋납니다.") +
      "<br><b>내가 찾은 1 m</b> 빛이 3.3356 ns 동안 간 거리";
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();

  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅰ-2] 이야기 ② 1미터를 다시 정하는 회의",
    items: [
      { id: "w2", label: "표준이 필요한 이유", hint: "측정 표준이 없었다면 곤란해졌을 상황을 하나 들고, 왜 그런지 쓰세요." },
      { id: "e2b", label: "기준을 물건에서 옮긴 까닭", hint: "1 m 의 기준이 금속 막대에서 빛으로 바뀐 까닭을, 이 이야기에서 확인한 숫자를 들어 쓰세요. 2019년 킬로그램 재정의와 묶어 설명하면 좋습니다." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 30 cm 를 다투는 사람들
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
      { icon: "🏥", name: "의료 영상 진단", e: -3, unit: "m", desc: "MRI·CT 는 몸에서 오는 미세한 신호를 재어 <b>밀리미터</b> 단위의 단면 영상을 만듭니다." },
      { icon: "🌡️", name: "기후 관측", e: -1, unit: "℃", desc: "전 세계 관측소가 <b>같은 표준</b>으로 기온·기압을 재기 때문에, 수십 년치를 한 그래프에 올려 견줄 수 있습니다." },
      { icon: "⚖️", name: "거래와 무역", e: -3, unit: "kg", desc: "질량·부피의 표준 단위가 있어야 <b>공정한 상거래</b>가 됩니다. 저울 검정이 법으로 정해져 있는 까닭입니다." },
      { icon: "🚀", name: "우주 탐사", e: 0, unit: "m", desc: "탐사선의 거리와 속도를 정밀하게 재어 궤도를 계산합니다. 작은 오차가 아홉 달 뒤 큰 어긋남이 됩니다." }
    ];
    function xOf(e) { return 80 + (e + 12) / 12 * 770; }

    function draw() {
      paper(ctx, W, H);
      var i;
      text(ctx, "정밀 측정이 떠받치고 있는 분야들 — 카드를 눌러 보세요", 30, 36, { s: 12.5, w: "800", c: v("--teal-700") });
      for (i = 0; i < FIELDS.length; i++) {
        var f = FIELDS[i], x = 30 + (i % 3) * 290, y = 60 + Math.floor(i / 3) * 135;
        card(ctx, x, y, 260, 120, i === sel, "--brand");
        text(ctx, f.icon, x + 130, y + 52, { s: 32, a: "center" });
        text(ctx, f.name, x + 130, y + 84, { s: 14, w: "800", a: "center", c: v(i === sel ? "--brand-700" : "--ink") });
        text(ctx, "약 10" + sup(f.e) + " " + f.unit + " 까지 잰다", x + 130, y + 106, { s: 10.5, a: "center", c: v("--mist") });
      }
      /* 요구 정밀도 사다리 */
      text(ctx, "어느 자릿수까지 재는가", 30, 356, { s: 11.5, w: "800", c: v("--mist") });
      hline(ctx, 80, 850, 392, v("--line"), 2);
      for (i = -12; i <= 0; i += 3) {
        var x2 = xOf(i);
        ctx.strokeStyle = v("--mist"); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x2, 392); ctx.lineTo(x2, 400); ctx.stroke();
        text(ctx, "10" + sup(i), x2, 416, { s: 10.5, a: "center", c: v("--mist") });
      }
      text(ctx, "← 더 미세하게", 80, 434, { s: 10, c: v("--mist") });
      text(ctx, "거칠게 →", 850, 434, { s: 10, a: "right", c: v("--mist") });
      for (i = 0; i < FIELDS.length; i++) {
        var fx = xOf(FIELDS[i].e), on = i === sel;
        ctx.fillStyle = v(on ? "--coral" : "--brand");
        ctx.beginPath(); ctx.arc(fx + (i === 1 ? 14 : i === 4 ? 14 : 0), 392, on ? 8 : 5, 0, Math.PI * 2); ctx.fill();
        if (on) text(ctx, FIELDS[i].icon + " " + FIELDS[i].name, clamp(fx, 110, 800), 378, { s: 11, w: "900", a: "center", c: v("--coral-700") });
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
    var got = window.sthState("cGps") || { a: false, b: false };
    function err() { return CLIGHT * dt * 1e-9; }    /* m */

    function draw() {
      paper(ctx, W, H);
      var e = err(), i, j;
      text(ctx, "위성 시계가 " + dt + " ns 틀렸을 때 지도 위의 내 자리", 40, 36, { s: 12.5, w: "800", c: v("--teal-700") });

      /* 지도 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(40, 52, 530, 320);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.strokeRect(40, 52, 530, 320);
      for (i = 0; i < 4; i++) {
        for (j = 0; j < 3; j++) {
          var bx = 60 + i * 130, by = 70 + j * 100;
          ctx.fillStyle = v("--panel");
          ctx.beginPath(); ctx.roundRect(bx, by, 110, 80, 6); ctx.fill();
          ctx.strokeStyle = v("--line"); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(bx, by, 110, 80, 6); ctx.stroke();
        }
      }
      text(ctx, "🏫 학교", 375, 165, { s: 12, w: "800", a: "center", c: v("--teal-700") });
      text(ctx, "50 m", 100, 362, { s: 10, c: v("--mist") });
      hline(ctx, 140, 175, 358, v("--mist"), 2);

      /* 오차 원 */
      var R = clamp(e * 0.7, 3, 140);
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.18;
      ctx.beginPath(); ctx.arc(375, 200, R, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(375, 200, R, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = v("--rose");
      ctx.beginPath(); ctx.arc(375, 200, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "내 자리는 이 원 안 어딘가", 375, 200 - R - 10 < 62 ? 62 : 200 - R - 10, { s: 11, w: "800", a: "center", c: v("--brand-700") });

      /* 오른쪽 계산 */
      text(ctx, "거리 = 빛의 속력 × 시간", 600, 76, { s: 13, w: "900", c: v("--violet-700") });
      text(ctx, "빛의 속력", 600, 112, { s: 11, c: v("--mist") });
      text(ctx, "299,792,458 m/s", 870, 112, { s: 11.5, w: "800", a: "right" });
      text(ctx, "시계 오차", 600, 140, { s: 11, c: v("--mist") });
      text(ctx, dt + " ns", 870, 140, { s: 11.5, w: "800", a: "right" });
      hline(ctx, 600, 870, 154, v("--line"), 1.5);
      text(ctx, "위치 오차", 600, 186, { s: 12, w: "800", c: v("--mist") });
      text(ctx, e.toFixed(2) + " m", 870, 192, { s: 26, w: "900", a: "right", c: v(e <= 10 ? "--green-700" : e > 100 ? "--rose-700" : "--coral-700") });

      var verdict = e <= 10 ? "🏫 같은 건물 안을 가리킨다" : e <= 30 ? "🚪 건물 앞마당쯤" : e <= 100 ? "🚸 길 건너편" : "🏙 옆 블록으로 건너뛴다";
      text(ctx, verdict, 600, 232, { s: 13.5, w: "900", c: v("--ink") });
      text(ctx, "시계가 1 ns 틀리면 위치가 30 cm,", 600, 272, { s: 11.5, w: "800", c: v("--violet-700") });
      text(ctx, "1 µs(1000 ns) 틀리면 약 300 m 어긋난다", 600, 296, { s: 11.5, w: "800", c: v("--coral-700") });
      text(ctx, "그래서 GPS 위성은 원자시계를 싣는다", 600, 324, { s: 11, c: v("--mist") });
      text(ctx, "상대성 이론 보정을 하지 않으면 위성 시계는 하루 약 38 µs 어긋나고, 그것은 하루 11 km 가 넘는 위치 오차가 됩니다.", 40, 386, { s: 11, c: v("--mist") });

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
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>위치를 <b>10 m</b> 안쪽으로 맞추려면 시계가 <b>30 ns</b> 안쪽까지 맞아야 하고, <b>340 ns</b> 만 틀려도 <b>100 m</b> 를 넘어갑니다. 시간을 재는 일이 곧 위치를 재는 일입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("c-dt").addEventListener("input", function (e2) {
      dt = +e2.target.value; $("c-dt-val").textContent = dt + " ns"; draw();
    });
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
      paper(ctx, W, H);
      var y = yieldOf(), half = Math.max(4 * sd, 1.6 * tol()), i;
      function xOf(nm) { return 80 + (nm - (w - half)) / (2 * half) * 740; }
      function yOf(p) { return 280 - p * 200; }

      text(ctx, "웨이퍼 한 장에서 잰 선폭의 분포", 40, 36, { s: 12.5, w: "800", c: v("--teal-700") });
      text(ctx, "목표 " + w + " nm · 허용 범위 ± 10 % = ± " + tol().toFixed(1) + " nm · 측정·공정 오차 " + sd.toFixed(1) + " nm",
        860, 36, { s: 12, a: "right", c: v("--mist") });

      /* 분포 곡선 + 색칠 */
      var lo = w - tol(), hi = w + tol();
      ctx.beginPath();
      for (i = 0; i <= 200; i++) {
        var nm = (w - half) + (2 * half) * i / 200;
        var p = Math.exp(-Math.pow((nm - w) / sd, 2) / 2);
        if (i === 0) ctx.moveTo(xOf(nm), yOf(p)); else ctx.lineTo(xOf(nm), yOf(p));
      }
      ctx.lineTo(xOf(w + half), 280); ctx.lineTo(xOf(w - half), 280); ctx.closePath();
      ctx.fillStyle = v("--rose"); ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;

      ctx.save();
      ctx.beginPath(); ctx.rect(clamp(xOf(lo), 80, 820), 70, Math.max(0, clamp(xOf(hi), 80, 820) - clamp(xOf(lo), 80, 820)), 215); ctx.clip();
      ctx.beginPath();
      for (i = 0; i <= 200; i++) {
        var nm2 = (w - half) + (2 * half) * i / 200;
        var p2 = Math.exp(-Math.pow((nm2 - w) / sd, 2) / 2);
        if (i === 0) ctx.moveTo(xOf(nm2), yOf(p2)); else ctx.lineTo(xOf(nm2), yOf(p2));
      }
      ctx.lineTo(xOf(w + half), 280); ctx.lineTo(xOf(w - half), 280); ctx.closePath();
      ctx.fillStyle = v("--green"); ctx.globalAlpha = 0.55; ctx.fill();
      ctx.restore();

      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2; ctx.beginPath();
      for (i = 0; i <= 200; i++) {
        var nm3 = (w - half) + (2 * half) * i / 200;
        var p3 = Math.exp(-Math.pow((nm3 - w) / sd, 2) / 2);
        if (i === 0) ctx.moveTo(xOf(nm3), yOf(p3)); else ctx.lineTo(xOf(nm3), yOf(p3));
      }
      ctx.stroke();
      hline(ctx, 80, 820, 280, v("--line"), 2);

      vdash(ctx, clamp(xOf(lo), 80, 820), 72, 280, v("--rose"));
      vdash(ctx, clamp(xOf(hi), 80, 820), 72, 280, v("--rose"));
      text(ctx, "허용 하한 " + lo.toFixed(1), clamp(xOf(lo), 110, 780) - 6, 66, { s: 10.5, w: "800", a: "right", c: v("--rose-700") });
      text(ctx, "허용 상한 " + hi.toFixed(1), clamp(xOf(hi), 110, 780) + 6, 66, { s: 10.5, w: "800", c: v("--rose-700") });
      vdash(ctx, xOf(w), 72, 280, v("--brand"));
      text(ctx, "목표 " + w + " nm", xOf(w), 300, { s: 11, w: "800", a: "center", c: v("--brand-700") });
      text(ctx, "초록 = 살아남는 칩 · 붉은색 = 버리는 칩", 820, 300, { s: 10.5, a: "right", c: v("--mist") });

      /* 수율 막대 */
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(80, 318, 600, 22, 11); ctx.fill();
      ctx.fillStyle = v(y >= 0.95 ? "--green" : y >= 0.8 ? "--amber" : "--rose");
      ctx.beginPath(); ctx.roundRect(80, 318, Math.max(6, 600 * y), 22, 11); ctx.fill();
      text(ctx, "수율 " + (y * 100).toFixed(1) + " %", 700, 336, { s: 17, w: "900", c: v(y >= 0.95 ? "--green-700" : "--rose-700") });

      $("c-chip-info").innerHTML = "목표 선폭 <b>" + w + " nm</b> 의 허용 범위는 <b>± " + tol().toFixed(1) + " nm</b>, 오차는 <b>" + sd.toFixed(1) +
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
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>같은 오차라도 <b>선폭이 작아지면 치명적</b>이 됩니다. 허용 범위가 목표의 10 % 이기 때문이지요. 더 작게 만들려면 <b>더 정밀하게 재는 기술</b>이 먼저 있어야 합니다.");
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

    function drawSamp() {
      paper(ctx, W, H);
      var s = samples(), me = maxErr(s), i;
      text(ctx, "손목에서 오는 맥박 신호 (1초에 1.2번) 를 1초에 " + rate + "번 잰다", 40, 34, { s: 12.5, w: "800", c: v("--teal-700") });
      hline(ctx, 60, 860, sy(0), v("--line"), 1);

      /* 원래 신호 */
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (i = 0; i <= 400; i++) {
        var t = TT * i / 400;
        if (i === 0) ctx.moveTo(sx(t), sy(sig(t))); else ctx.lineTo(sx(t), sy(sig(t)));
      }
      ctx.stroke();
      /* 복원된 꺾은선 */
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (i = 0; i < s.t.length; i++) {
        if (i === 0) ctx.moveTo(sx(s.t[i]), sy(s.v[i])); else ctx.lineTo(sx(s.t[i]), sy(s.v[i]));
      }
      ctx.stroke();
      /* 표본점 */
      for (i = 0; i < s.t.length; i++) {
        ctx.fillStyle = v("--coral");
        ctx.beginPath(); ctx.arc(sx(s.t[i]), sy(s.v[i]), rate > 30 ? 2.5 : 4, 0, Math.PI * 2); ctx.fill();
      }
      /* 시간축 */
      for (i = 0; i <= 4; i++) {
        var tt = i * 0.5;
        ctx.strokeStyle = v("--mist"); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx(tt), 258); ctx.lineTo(sx(tt), 266); ctx.stroke();
        text(ctx, tt.toFixed(1) + " s", sx(tt), 282, { s: 10, a: "center", c: v("--mist") });
      }
      hline(ctx, 60, 860, 258, v("--line"), 1.5);
      text(ctx, "— 원래 신호", 60, 306, { s: 11, w: "800", c: v("--brand-700") });
      text(ctx, "— 표본을 이어 되살린 신호", 180, 306, { s: 11, w: "800", c: v("--violet-700") });
      text(ctx, "● 표본 " + s.t.length + "개", 380, 306, { s: 11, w: "800", c: v("--coral-700") });
      text(ctx, "복원 오차 " + (me * 100).toFixed(1) + " %", 860, 306,
        { s: 13, w: "900", a: "right", c: v(me <= 0.05 ? "--green-700" : "--rose-700") });

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
      paper(qx, QW, QH);
      var st = step(), i;
      text(qx, "체온계가 다루는 30 ℃ ~ 45 ℃ 를 " + Math.pow(2, bits).toLocaleString() + " 칸(" + bits + "비트)으로 쪼갠다", 40, 34,
        { s: 12.5, w: "800", c: v("--teal-700") });

      qx.fillStyle = v("--card-2"); qx.beginPath(); qx.roundRect(80, 84, 740, 44, 8); qx.fill();
      qx.strokeStyle = v("--line"); qx.lineWidth = 2; qx.beginPath(); qx.roundRect(80, 84, 740, 44, 8); qx.stroke();
      var cells = Math.pow(2, bits);
      if (cells <= 128) {
        for (i = 1; i < cells; i++) {
          var x = 80 + 740 * i / cells;
          qx.strokeStyle = v("--line"); qx.lineWidth = cells > 32 ? 0.5 : 1;
          qx.beginPath(); qx.moveTo(x, 84); qx.lineTo(x, 128); qx.stroke();
        }
      } else {
        qx.fillStyle = v("--brand"); qx.globalAlpha = 0.2; qx.fillRect(80, 84, 740, 44); qx.globalAlpha = 1;
        text(qx, "칸이 너무 촘촘해 그릴 수 없습니다 (" + cells.toLocaleString() + "칸)", 450, 112, { s: 11.5, a: "center", c: v("--mist") });
      }
      for (i = 30; i <= 45; i += 5) {
        text(qx, i + " ℃", qxOf(i), 148, { s: 10.5, a: "center", c: v("--mist") });
      }
      /* 세 온도가 어떻게 찍히는가 */
      var TS = [36.5, 36.7, 37.0];
      for (i = 0; i < TS.length; i++) {
        var bx = 80 + i * 250, t = TS[i], sh = shown(t);
        card(qx, bx, 170, 240, 92, true, Math.abs(sh - t) <= 0.05 ? "--green" : "--coral");
        text(qx, "이마의 실제 온도 " + t.toFixed(1) + " ℃", bx + 120, 194, { s: 11, a: "center", c: v("--mist") });
        text(qx, sh.toFixed(2) + " ℃", bx + 120, 228, { s: 22, w: "900", a: "center", c: v(Math.abs(sh - t) <= 0.05 ? "--green-700" : "--coral-700") });
        text(qx, "화면에 찍히는 값", bx + 120, 250, { s: 10, a: "center", c: v("--mist") });
      }
      text(qx, "한 칸의 폭 " + st.toFixed(4) + " ℃ → 최대 오차 " + (st / 2).toFixed(4) + " ℃", 40, 288,
        { s: 13, w: "900", c: v(st / 2 <= 0.05 ? "--green-700" : "--rose-700") });
      text(qx, "칸이 성기면 서로 다른 온도가 같은 숫자로 찍힙니다.", 470, 288, { s: 11, c: v("--mist") });

      $("c-quant-info").innerHTML = "<b>" + bits + "비트</b> = " + cells.toLocaleString() + "칸 → 한 칸이 <b>" + st.toFixed(4) +
        " ℃</b>, 최대 오차 <b>" + (st / 2).toFixed(4) + " ℃</b>. " +
        (st / 2 <= 0.05 ? "✅ 0.05 ℃ 까지 구분합니다. 36.5 와 36.7 이 다른 숫자로 찍히지요."
          : "36.5 ℃ 와 36.7 ℃ 가 같은 숫자로 찍히지 않는지 확인해 보세요. 비트를 올리면 칸이 촘촘해집니다.");

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
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>맥박은 <b>1초에 12번 이상</b> 재야 물결이 되살아나고, 체온계는 <b>8비트</b>는 되어야 0.05 ℃ 를 가릅니다. 이어지던 신호는 이 두 단계를 거쳐 <b>디지털 정보</b>가 됩니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = drawSamp;
    cq._redraw = drawQuant;
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
    window.sthState("r3", "해결 · 시계 오차 1 µs 는 위치 오차 300 m · 맥박은 12번/초, 체온계는 8비트라야 살아난다");
  }
  function paintVs() {
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 어림</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0 ? "정확했습니다. 빛이 1 µs 동안 가는 거리가 약 300 m 였지요."
        : "빛은 1초에 약 3억 m 를 갑니다. 그 100만분의 1인 1 µs 면 약 300 m 이지요.") +
      "<br><b>내가 확인한 것</b> 10 m 안쪽으로 맞추려면 시계는 30 ns 안쪽까지 맞아야 한다";
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();

  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅰ-2] 이야기 ③ 30 cm 를 다투는 사람들",
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
    { key: "r3", label: "③ 30 cm 를 다투는 사람들" }
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
    { key: "r3", label: "③ 30 cm 를 다투는 사람들" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
