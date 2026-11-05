/* 통합과학1 Ⅲ-1 지구시스템 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";

/* ---- 밝은 스튜디오 + 블록 모형 (../assets/kit.js 의 K.studio · K.iso · K.card) ---- */
var K = window.sthKit, LT = K.LT;
function lt(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function sideCard(ctx, x, W, H, title) { K.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
/* 입체 막대(앞면·윗면·옆면) */
function bar3(ctx, x, yb, w, h, d, col) {
  if (h < .5) return;
  ctx.fillStyle = K.tint(col, 1.2); ctx.beginPath(); ctx.moveTo(x, yb - h); ctx.lineTo(x + d, yb - h - d * .55); ctx.lineTo(x + w + d, yb - h - d * .55); ctx.lineTo(x + w, yb - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = K.tint(col, .72); ctx.beginPath(); ctx.moveTo(x + w, yb - h); ctx.lineTo(x + w + d, yb - h - d * .55); ctx.lineTo(x + w + d, yb - d * .55); ctx.lineTo(x + w, yb); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col; ctx.fillRect(x, yb - h, w, h);
}
/* 섭입대 지진 자료 — 해구 x=100 km, 경사 40°, 판 선에서 ±16 km 흩어짐 (고정된 난수) */
var QUAKES = (function () {
  var s = 7, out = [], dip = 40 * Math.PI / 180;
  function r() { s = (s * 16807) % 2147483647; return s / 2147483647; }
  for (var i = 0; i < 70; i++) {
    var along = 20 + r() * 700;                         /* 판을 따라간 거리 (km) */
    var off = (r() - 0.5) * 32;                         /* 판에 수직으로 흩어진 거리 */
    var x = 100 + along * Math.cos(dip) - off * Math.sin(dip);
    var z = along * Math.sin(dip) + off * Math.cos(dip);
    if (z > 5 && z < 600 && x < 640) out.push([x, z]);
  }
  return out;
})();
function fitErr(xt, dipDeg) {
  var d = dipDeg * Math.PI / 180, nx = Math.sin(d), nz = -Math.cos(d), s = 0;
  QUAKES.forEach(function (q) { s += Math.abs((q[0] - xt) * nx + q[1] * nz); });
  return s / QUAKES.length;
}

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 체류 시간 */
  {
    id: "c1", about: "01", tag: "물질 순환 · 체류 시간", title: "오염된 댐 호수 비우기", short: "호수 체류 시간",
    who: "🏞️", name: "수자원 공사",
    say: "“상류 공장에서 흘러든 오염 물질이 댐 호수(<b>물 2.0 × 10⁸ m³</b>)에 퍼졌어요. 깨끗한 물을 흘려보내 호수 물을 갈아야 하는데, <b>두 달(60일) 안에</b> 한 번은 갈아 줘야 합니다. 다만 하류 마을이 잠기지 않으려면 방류량은 <b>초당 45 m³</b>를 넘으면 안 돼요.”",
    predict: {
      q: "방류량을 두 배로 늘리면, 물이 호수에 머무는 평균 시간은?",
      options: ["㉠ 두 배로 는다", "㉡ 절반으로 준다", "㉢ 그대로다"], answer: 1
    },
    task: "방류량을 정해 <b>호수 물이 60일 안에 갈리면서(체류 시간 60일 이하) 하류가 안전하게</b>(45 m³/s 이하) 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var Q = 10, V = 2.0e8;
      function tau() { return V / (Q * 86400); }
      /* 블록 모형: 골짜기에 물을 가둔 댐 호수(뒤) → 댐 → 하류 마을(앞). 60일 뒤 오염 농도만큼 호수 물빛이 바뀌고, 45 m³/s 를 넘으면 하류가 잠긴다 */
      var I = K.iso({ ox: 250, oy: 120, s: .6, L: 420, D: 200 }), WL = 74, DX = 296;
      function zv(x, y) { var c = (y - 100) / 100, v = 30 + 74 * c * c; if (x > DX + 24) v = 10 + 56 * c * c + Math.max(0, (x - 360) * .02); return v; }
      function draw() {
        var CH = cv.H, LW = 600, t = tau(), left = Math.exp(-60 / t), flood = Q > 45, lv = flood ? 22 + (Q - 45) * .25 : 16, i;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: 300, y: CH - 20, rx: 280, ry: 30 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, CH, 14); ctx.clip();
        var wc = [60 + 100 * left, 150 - 20 * left, 225 - 130 * left];
        I.field(ctx, zv, function (x, y, z, l) { return K.tint(z > 60 ? "#7aa84e" : (z > 30 ? "#8fbf55" : "#b9a77a"), l); }, 42, 20, function (c, x0, y0, x1, y1, zMax, zMin) {
          var lev = x1 <= DX ? WL : (x0 >= DX + 24 ? lv : -1);
          if (lev > zMin + .2) I.quad(c, I.P(x0, y0, lev), I.P(x1, y0, lev), I.P(x1, y1, lev), I.P(x0, y1, lev), x1 <= DX ? "rgba(" + Math.round(wc[0]) + "," + Math.round(wc[1]) + "," + Math.round(wc[2]) + ",.78)" : "rgba(60,150,225,.7)");
        });
        ["front", "right"].forEach(function (sd) { I.face(ctx, sd, function (Lw) { I.profile(ctx, sd, function (u) { return sd === "front" ? zv(u, I.D) : zv(I.L, u); }, 0); var g = ctx.createLinearGradient(0, 0, 0, 110); g.addColorStop(0, "#5b4a3c"); g.addColorStop(1, "#a88f70"); ctx.fillStyle = g; ctx.fill(); }); });
        I.shade(ctx, "right", function (u) { return zv(I.L, u); });
        I.box(ctx, DX, 0, 0, DX + 24, I.D, WL + 10, "#e3e6ea", "#c4c9d1", "#a9b0bb");
        var j0 = I.P(DX + 24, 100, WL - 10), j1 = I.P(DX + 60, 100, lv + 2);
        ctx.strokeStyle = "rgba(90,170,240,.85)"; ctx.lineWidth = 2 + Q / 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(j0.x, j0.y); ctx.quadraticCurveTo(j0.x + 26, j0.y, j1.x, j1.y); ctx.stroke(); ctx.lineCap = "butt";
        [[360, 36], [384, 150], [400, 52], [372, 168]].forEach(function (h, k) { I.house(ctx, h[0], h[1], zv(h[0] + 6, h[1] + 6), 14, 12, 10, ["#c0553f", "#3f6fb5", "#d08a2e", "#7048e8"][k]); });
        var ri = I.P(0, 100, WL + 6); K.arrow(ctx, { x: ri.x - 40, y: ri.y - 20 }, ri, LT.teal, 3, 10);
        ctx.restore();
        I.label(ctx, 150, 100, WL, "댐 호수 2.0 × 10⁸ m³", -40, -40, "#e8ecff", [0, LW]);
        I.label(ctx, DX + 12, 20, WL + 10, "댐", 30, -30, "#e8ecff", [0, LW]);
        I.label(ctx, 384, 150, zv(390, 156) + 10, flood ? "하류 마을 — 범람!" : "하류 마을", 40, 20, flood ? "#ffb0b0" : "#d9f7c8", [0, LW]);
        K.bigText(ctx, "물 갈이 " + t.toFixed(0) + "일", 18, 44, 25, t <= 60 ? "#8ff0c4" : "#ffffff");
        K.bigText(ctx, "방류 " + Q + " m³/s", 18, 72, 16, flood ? "#ff9db0" : "#ffd35a");
        var cd = sideCard(ctx, LW + 10, W, CH, "체류 시간 = 저장량 ÷ 방류량");
        K.row(ctx, "하루 방류량", (Q * 86400 / 1e6).toFixed(2) + " × 10⁶ m³", cd.px, cd.R, 58);
        K.row(ctx, "물이 머무는 평균 시간", t.toFixed(1) + " 일", cd.px, cd.R, 82, t <= 60 ? LT.green : LT.red);
        K.row(ctx, "하류", flood ? "범람 위험" : "안전", cd.px, cd.R, 106, flood ? LT.red : LT.green);
        var g = K.chart(ctx, { x: cd.px - 18, y: 116, w: cd.w + 30, h: 150, pl: 40, light: true, x0: 0, x1: 120, y0: 0, y1: 1, xt: 4, yt: 2, xl: "일", xf: function (q) { return Math.round(q); }, yf: function (q) { return Math.round(q * 100) + "%"; } });
        var pts = []; for (i = 0; i <= 60; i++) pts.push([i * 2, Math.exp(-i * 2 / t)]);
        K.plot(ctx, g, pts, LT.orange, { light: true, w: 2.6 });
        K.line(ctx, { x: g.X(60), y: g.T }, { x: g.X(60), y: g.B }, "rgba(20,40,90,.45)", 1.2, [4, 4]);
        lt(ctx, "오염 농도 · 60일 뒤 " + Math.round(left * 100) + "%", cd.px, CH - 16, { s: 11.5, w: "800", c: LT.orange });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "방류량", min: 5, max: 80, step: 1, value: 10, fmt: function (x) { return x + " m³/s"; }, onInput: function (x) { Q = x; draw(); } });
      api.info("체류 시간 = 저장된 양 ÷ 드나드는 양. 1일 = 86,400초.");
      draw();
      return {
        judge: function () {
          var t = tau();
          if (t <= 60 && Q <= 45) return { ok: true, msg: "초당 " + Q + " m³ → 체류 시간 " + t.toFixed(1) + " 일, 하류도 안전합니다." };
          if (Q > 45) return { ok: false, msg: "체류 시간은 " + t.toFixed(1) + " 일이지만 하류가 잠깁니다." };
          return { ok: false, msg: "체류 시간 " + t.toFixed(1) + " 일 — 60일보다 깁니다." };
        }
      };
    },
    hints: [
      "호수 물 전체를 한 번 내보내는 데 걸리는 시간이 체류 시간입니다. 방류량이 크면 그 시간은 어떻게 될까요?",
      "60일 = 60 × 86,400 초. 2.0 × 10⁸ m³를 그 시간에 내보내려면 초당 몇 m³가 필요할까요?"
    ],
    solution: "2.0 × 10⁸ ÷ (60 × 86,400) ≈ 38.6 → 방류량 <b>39~45 m³/s</b>.",
    why: "체류 시간은 <b>저장량 ÷ 흐르는 양</b>입니다. 방류량을 두 배로 늘리면 체류 시간은 절반이 됩니다. 이야기에서 대기의 물은 열흘, 바닷물은 수천 년 머물렀던 것도 같은 계산입니다.<br>" +
      "체류 시간이 길수록 오염 물질도 오래 남습니다. 그래서 대기에 들어간 오염은 금방 씻겨 나가지만, 바다나 지하수에 든 오염은 아주 오래 갑니다. 다만 흐름을 무작정 늘릴 수 없는 것처럼, 지구 시스템의 한 부분을 바꾸면 <b>다른 권역(하류 마을)</b>에 영향이 갑니다."
  },

  /* ------------------------------------------------------------------ 2. 복사 평형 · 온실 효과 */
  {
    id: "c2", about: "02", tag: "지구시스템의 에너지 · 복사 평형", title: "금성이 지구보다 차갑다고?", short: "금성의 온도",
    who: "🪐", name: "금성 탐사 계획팀",
    say: "“금성 궤도선이 잰 금성의 <b>복사 평형 온도는 약 −46 ℃</b>. 그런데 금성은 지구보다 태양에 <b>훨씬 가까운데요</b>? 한편 착륙선이 잰 <b>표면 온도는 464 ℃</b> 였습니다. 무엇이 이 두 숫자를 만든 걸까요?”",
    predict: {
      q: "태양에 더 가까운 금성의 복사 평형 온도는 지구(약 −18 ℃)와 비교해?",
      options: ["㉠ 더 높다", "㉡ 더 낮다", "㉢ 같다"], answer: 1
    },
    task: "금성을 고른 뒤 반사율을 조절해, 관측된 <b>복사 평형 온도 −46 ℃(±3)</b>를 재현하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var P = { me: { t: "수성", d: 0.39, s: 167 }, ve: { t: "금성", d: 0.72, s: 464 }, ea: { t: "지구", d: 1.0, s: 15 }, ma: { t: "화성", d: 1.52, s: -63 } };
      var p = "ea", A = 0.3;
      function S() { return 1361 / (P[p].d * P[p].d); }
      function Te() { return Math.pow(S() * (1 - A) / (4 * 5.67e-8), 0.25); }
      /* 입체 미니어처: 왼쪽 태양 등에서 오는 빛이 행성 공에 닿고, 반사율만큼 구름·얼음 띠가 행성을 덮어 빛을 되돌린다 */
      var PC = { me: ["#c9c4bc", "#5f5a54"], ve: ["#f3dfa2", "#a0763a"], ea: ["#7cc4f0", "#1f4f9a"], ma: ["#e0956a", "#7a3218"] };
      function draw() {
        var CH = cv.H, LW = 560, T = Te() - 273.15, s = S(), r = 70 + 18 * (1 - P[p].d / 1.6), cx = 300, cy = 170, i;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: cx, y: CH - 26, rx: 160, ry: 18 });
        K.sun(ctx, 30, cy, 22);
        var nR = Math.round(3 + 3 * s / 2600);
        for (i = 0; i < nR; i++) { var yy = cy - 60 + i * 120 / Math.max(1, nR - 1); K.arrow(ctx, { x: 70, y: yy }, { x: cx - r * .9, y: yy * .6 + cy * .4 }, "#f59f00", 3, 11); }
        K.planet(ctx, cx, cy, r, PC[p][0], PC[p][1]);
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.clip();
        var nb = Math.round(A * 12);
        for (i = 0; i < nb; i++) { var by = cy - r + (i + .5) * 2 * r / 12 + ((i * 7) % 5) * 3; ctx.fillStyle = "rgba(255,255,255," + (.55 + .35 * A).toFixed(2) + ")"; ctx.beginPath(); ctx.ellipse(cx + ((i * 37) % 30) - 15, by, r * (.7 + ((i * 13) % 4) * .1), 6 + A * 6, 0, 0, 6.2832); ctx.fill(); }
        ctx.restore();
        var nRf = Math.round(A * 5);
        for (i = 0; i < nRf; i++) K.arrow(ctx, { x: cx - r * .8, y: cy - 30 + i * 18 }, { x: cx - r * .8 - 90, y: cy - 90 + i * 34 }, "rgba(28,126,214,.85)", 2.4, 10);
        K.pill(ctx, P[p].t, cx, cy + r + 30, { s: 13, a: "center", c: "#ffffff" });
        K.bigText(ctx, "복사 평형 " + T.toFixed(0) + " ℃", 18, 44, 25, Math.abs(T + 46) <= 3 && p === "ve" ? "#8ff0c4" : "#ffffff");
        K.bigText(ctx, "반사율 " + (A * 100).toFixed(0) + "% · " + P[p].d.toFixed(2) + " AU", 18, 72, 16, "#ffd35a");
        var cd = sideCard(ctx, LW + 10, W, CH, P[p].t + "의 에너지 장부");
        K.row(ctx, "들어오는 햇빛", s.toFixed(0) + " W/m²", cd.px, cd.R, 58, LT.yellow);
        K.row(ctx, "흡수 (평균)", (s * (1 - A) / 4).toFixed(0) + " W/m²", cd.px, cd.R, 82, LT.orange);
        K.row(ctx, "복사 평형 온도", T.toFixed(0) + " ℃", cd.px, cd.R, 112, LT.blue);
        K.bar(ctx, cd.px, 120, cd.w, (T + 150) / 650, LT.blue);
        K.row(ctx, "실제 평균 표면 온도", P[p].s + " ℃", cd.px, cd.R, 156, LT.red);
        K.bar(ctx, cd.px, 164, cd.w, (P[p].s + 150) / 650, LT.red);
        K.row(ctx, "차이 (대기가 더한 몫)", (P[p].s - T).toFixed(0) + " ℃", cd.px, cd.R, 200, LT.violet);
        K.tip(ctx, p !== "ve" ? "과제는 금성입니다" : (Math.abs(T + 46) <= 3 ? "관측값 −46 ℃ 재현!" : "반사율로 −46 ℃ 맞추기"), cd.px - 4, 218, cd.w + 8, p === "ve" && Math.abs(T + 46) <= 3 ? true : null);
        K.warn(ctx, 16, CH - 12, "⚠ 행성 크기·거리는 실제 비율이 아님");
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "행성", value: "ea", options: Object.keys(P).map(function (k) { return { v: k, t: P[k].t }; }), onPick: function (x) { p = x; draw(); } });
      api.slider({ label: "반사율 (알베도)", min: 0, max: 0.95, step: 0.01, value: 0.3, fmt: function (x) { return (x * 100).toFixed(0) + " %"; }, onInput: function (x) { A = x; draw(); } });
      api.info("지구는 반사율 30 %에서 −18 ℃ 였습니다. 금성은 햇빛을 약 1.9 배 받습니다.");
      draw();
      return {
        judge: function () {
          var T = Te() - 273.15;
          if (p !== "ve") return { ok: false, msg: "과제는 금성입니다." };
          if (Math.abs(T + 46) <= 3) return { ok: true, msg: "반사율 " + (A * 100).toFixed(0) + " %에서 " + T.toFixed(0) + " ℃ — 두꺼운 황산 구름이 햇빛 대부분을 되돌려 보냅니다." };
          return { ok: false, msg: "지금 금성의 복사 평형 온도 " + T.toFixed(0) + " ℃입니다." };
        }
      };
    },
    hints: [
      "금성은 햇빛을 많이 받는데도 복사 평형 온도가 낮습니다. 받은 햇빛의 <b>대부분을 되돌려 보낸다</b>면 어떨까요?",
      "반사율을 70 % 넘게 올려 보세요. 금성은 온통 두꺼운 구름으로 덮여 있습니다."
    ],
    solution: "금성을 고르고 반사율 <b>76~78 %</b>. 복사 평형 온도는 약 −46 ℃인데 실제 표면은 464 ℃ — 대기가 약 500 ℃를 더합니다.",
    why: "복사 평형 온도는 <b>받는 햇빛</b>과 <b>반사율</b>이 정합니다. 금성은 햇빛을 지구의 약 1.9 배 받지만 두꺼운 구름이 약 77 %를 되돌려 보내, 흡수하는 양은 오히려 지구보다 적습니다. 그래서 복사 평형 온도는 지구보다 낮습니다.<br>" +
      "그런데도 표면이 464 ℃ 인 것은 이산화 탄소가 96 % 인 두꺼운 대기가 지표의 복사를 붙잡는 <b>온실 효과</b> 때문입니다. 지구의 온실 효과는 약 33 ℃를 더하지만 금성은 약 500 ℃를 더합니다. ‘태양에 가까울수록 뜨겁다’ 만으로는 행성의 온도를 설명할 수 없습니다."
  },

  /* ------------------------------------------------------------------ 3. 섭입대 */
  {
    id: "c3", about: "03", tag: "판 구조론 · 수렴형 경계", title: "지진 깊이로 가라앉는 판 찾기", short: "섭입대 찾기",
    who: "🌋", name: "지진 연구소",
    say: "“어느 섬나라의 지진 70개를 단면에 찍었어요. 바다 쪽에는 얕은 지진, 육지 쪽으로 갈수록 깊은 지진이 줄지어 있습니다. 바다 밑에 <b>가라앉는 판</b>이 있다면, 해구는 어디고 판은 몇 도로 기울어 있을까요?”",
    predict: {
      q: "해구에서 육지 쪽으로 갈수록, 지진이 일어나는 깊이는?",
      options: ["㉠ 점점 깊어진다", "㉡ 점점 얕아진다", "㉢ 거의 일정하다"], answer: 0
    },
    task: "해구 위치와 판의 기울기를 조절해 <b>판을 나타내는 선이 지진들을 가장 잘 따라가게</b>(평균 어긋남 12 km 이하) 하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(356), ctx = cv.ctx, W = cv.W;
      var xt = 250, dip = 20;
      var x0 = 60, x1 = 700, y0 = 76, y1 = 336;
      function X(km) { return x0 + km / 640 * (x1 - x0); }
      function Y(km) { return y0 + km / 600 * (y1 - y0); }
      /* 블록 모형: 바다 → 육지를 잘라 낸 블록의 앞면 단면에 지진 70개를 찍고, 해구 위치·기울기에 따라 가라앉는 판(띠)을 그린다 */
      var B = K.iso({ ox: 320, oy: 150, s: .78, L: 400, D: 70 }), ZT = 150, UK = 400 / 640;
      function F(km, dz) { return B.P(km * UK, B.D, ZT - dz / 4); }
      function draw() {
        var CH = cv.H, LW = 610, e = fitErr(xt, dip), d = dip * Math.PI / 180, xv = xt + 110 / Math.tan(d), i;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: 320, y: CH - 14, rx: 290, ry: 20 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, CH, 14); ctx.clip();
        B.face(ctx, "front", function (Lw) { var g = ctx.createLinearGradient(0, 0, 0, ZT); g.addColorStop(0, "#b4572a"); g.addColorStop(.75, "#c97a4a"); g.addColorStop(1, "#8a6a4c"); ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, ZT); });
        B.face(ctx, "right", function (Lw) { var g = ctx.createLinearGradient(0, 0, 0, ZT); g.addColorStop(0, "#9a4a24"); g.addColorStop(1, "#7a5a3c"); ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, ZT); });
        var xs = xt * UK;
        B.plane(ctx, ZT, "#3d8fd8", null, 0, xs, 0, B.D); B.plane(ctx, ZT, "#8fbf55", null, xs, B.L, 0, B.D);
        /* 가라앉는 판(두께 30 km 띠) */
        var L = 900, a0 = F(xt, 0), a1 = F(xt + L * Math.cos(d), L * Math.sin(d)), b0 = F(xt + 30 * Math.sin(d), 30 * Math.cos(d)) , b1 = F(xt + L * Math.cos(d) + 30 * Math.sin(d), L * Math.sin(d) + 30 * Math.cos(d));
        ctx.save(); ctx.beginPath(); var f0 = B.P(0, B.D, 0), f1 = B.P(B.L, B.D, 0), f2 = B.P(B.L, B.D, ZT), f3 = B.P(0, B.D, ZT); ctx.moveTo(f0.x, f0.y); ctx.lineTo(f1.x, f1.y); ctx.lineTo(f2.x, f2.y); ctx.lineTo(f3.x, f3.y); ctx.closePath(); ctx.clip();
        ctx.fillStyle = e <= 12 ? "rgba(12,133,153,.45)" : "rgba(28,126,214,.35)"; ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(b0.x, b0.y); ctx.closePath(); ctx.fill();
        K.line(ctx, a0, a1, e <= 12 ? LT.teal : LT.blue, 3);
        QUAKES.forEach(function (q) { var p = F(q[0], q[1]); K.planet(ctx, p.x, p.y, 4.2, q[1] < 70 ? "#ff8a8a" : (q[1] < 300 ? "#ffd27a" : "#c3b0ff"), q[1] < 70 ? "#c92a2a" : (q[1] < 300 ? "#b06d00" : "#5f3dc4")); });
        ctx.restore(); ctx.restore();
        [0, 200, 400, 600].forEach(function (z) { var p = F(0, z); lt(ctx, z + " km", p.x - 6, p.y + 4, { s: 10, a: "right", c: LT.mute }); });
        if (xv < 640 && (xv - xt) * UK > 30) { var vp = B.P(xv * UK, B.D * .5, ZT); var vs = 16; ctx.fillStyle = "#6b5040"; ctx.beginPath(); ctx.moveTo(vp.x, vp.y - vs); ctx.lineTo(vp.x - vs, vp.y + 4); ctx.lineTo(vp.x + vs, vp.y + 4); ctx.closePath(); ctx.fill(); K.glow(ctx, vp.x, vp.y - vs, 2.6, "rgba(255,120,50,.95)", 3); }
        var tp = B.P(xs, B.D * .5, ZT); K.pill(ctx, "▼ 해구", tp.x, tp.y - 14, { s: 11.5, a: "center", c: "#bfe6ff" });
        K.pill(ctx, "바다", B.P(xs * .4, B.D * .3, ZT).x, B.P(xs * .4, B.D * .3, ZT).y - 6, { s: 11, a: "center", c: "#bfe6ff" });
        K.bigText(ctx, "어긋남 " + e.toFixed(1) + " km", 18, 44, 24, e <= 12 ? "#8ff0c4" : "#ffffff");
        K.bigText(ctx, "해구 " + xt + " km · 기울기 " + dip + "°", 18, 72, 16, "#ffd35a");
        var cd = sideCard(ctx, LW + 10, W, CH, "판 선 맞추기");
        K.row(ctx, "평균 어긋남", e.toFixed(1) + " km", cd.px, cd.R, 60, e <= 12 ? LT.green : LT.red);
        K.bar(ctx, cd.px, 70, cd.w, 1 - Math.min(1, e / 80), e <= 12 ? LT.green : LT.orange);
        K.row(ctx, "해구 위치", xt + " km", cd.px, cd.R, 108);
        K.row(ctx, "판의 기울기", dip + "°", cd.px, cd.R, 132);
        K.tip(ctx, e <= 12 ? "판의 윗면을 따라 지진이 늘어섬" : "12 km 이하로 맞춰 보세요", cd.px - 4, 150, cd.w + 8, e <= 12 ? true : null);
        [["#c92a2a", "얕은 지진 (70 km 미만)"], ["#b06d00", "중간 (70~300 km)"], ["#5f3dc4", "깊은 지진 (300 km 이상)"]].forEach(function (l, k) { K.planet(ctx, cd.px + 5, 214 + k * 22, 5, "#ffffff", l[0]); lt(ctx, l[1], cd.px + 16, 218 + k * 22, { s: 11.5, c: LT.mute }); });
        lt(ctx, "▲ 화산 = 판이 약 110 km 깊이에 닿는 곳", cd.px, 300, { s: 11, c: LT.mute });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "해구 위치", min: 0, max: 300, step: 5, value: 250, fmt: function (x) { return x + " km"; }, onInput: function (x) { xt = x; draw(); } });
      api.slider({ label: "판의 기울기", min: 10, max: 80, step: 1, value: 20, fmt: function (x) { return x + "°"; }, onInput: function (x) { dip = x; draw(); } });
      api.info("빨강 = 얕은 지진(70 km 미만), 노랑 = 중간, 보라 = 깊은 지진(300 km 이상). 🌋 는 판이 약 110 km 깊이에 닿는 곳입니다.");
      draw();
      return {
        judge: function () {
          var e = fitErr(xt, dip);
          if (e <= 12) return { ok: true, msg: "해구 " + xt + " km · 기울기 " + dip + "°에서 평균 어긋남 " + e.toFixed(1) + " km — 지진이 판의 윗면을 따라 늘어서 있습니다." };
          return { ok: false, msg: "평균 어긋남 " + e.toFixed(1) + " km입니다." };
        }
      };
    },
    hints: [
      "가장 얕은 지진(빨강)이 시작되는 곳이 해구입니다. 해구 위치부터 맞추세요.",
      "그다음 기울기를 바꿔 선이 깊은 지진(보라)까지 지나가게 하세요. 기울기를 1°씩 움직이며 어긋남 숫자가 가장 작아지는 곳을 찾으세요."
    ],
    solution: "해구 약 <b>100 km</b>, 기울기 약 <b>40°</b> 부근에서 어긋남이 가장 작습니다.",
    why: "해양판이 대륙판 아래로 가라앉는 <b>수렴형 경계</b>에서는, 가라앉는 판을 따라 지진이 일어나 해구에서 대륙 쪽으로 갈수록 <b>진원이 깊어집니다</b>. 이 기울어진 지진대를 따라가면 보이지 않는 판의 모양을 그릴 수 있습니다.<br>" +
      "판이 약 100 km 깊이에 이르면 물이 빠져나와 맨틀을 녹여 마그마가 생기고, 그 위 육지에 <b>화산이 줄지어</b> 섭니다 — 일본·안데스처럼요. 이야기에서 본 불의 고리의 화산과 지진이 판 경계에 몰린 까닭이 이것입니다."
  }
  ]
});
})();
