/* 통합과학1 Ⅲ-1 지구시스템 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";

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
    id: "c1", tag: "물질 순환 · 체류 시간", title: "오염된 댐 호수 비우기", short: "호수 체류 시간",
    who: "🏞️", name: "수자원 공사",
    say: "“상류 공장에서 흘러든 오염 물질이 댐 호수(<b>물 2.0 × 10⁸ m³</b>)에 퍼졌어요. 깨끗한 물을 흘려보내 호수 물을 갈아야 하는데, <b>두 달(60일) 안에</b> 한 번은 갈아 줘야 합니다. 다만 하류 마을이 잠기지 않으려면 방류량은 <b>초당 45 m³</b> 를 넘으면 안 돼요.”",
    predict: {
      q: "방류량을 두 배로 늘리면, 물이 호수에 머무는 평균 시간은?",
      options: ["㉠ 두 배로 는다", "㉡ 절반으로 준다", "㉢ 그대로다"], answer: 1
    },
    task: "방류량을 정해 <b>호수 물이 60일 안에 갈리면서(체류 시간 60일 이하) 하류가 안전하게</b>(45 m³/s 이하) 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(310), ctx = cv.ctx, W = cv.W;
      var Q = 10, V = 2.0e8;
      function tau() { return V / (Q * 86400); }
      function draw() {
        H.paper(ctx, W, cv.H);
        var t = tau();
        H.text(ctx, "댐 호수의 물 갈이", 40, 32, { s: 14, w: "900" });
        ctx.fillStyle = H.v("--brand"); ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(60, 110); ctx.lineTo(420, 110); ctx.lineTo(380, 220); ctx.lineTo(120, 220); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
        H.box(ctx, 420, 80, 18, 150, H.v("--mist"));
        H.arrow(ctx, 30, 100, 90, 116, H.v("--teal"), 4, 10);
        H.text(ctx, "유입", 30, 90, { s: 11.5, w: "800", c: H.v("--teal-700") });
        H.arrow(ctx, 440, 210, 440 + Math.min(120, 20 + Q * 2), 210, Q > 45 ? H.v("--rose") : H.v("--brand"), 4 + Q / 12, 12);
        H.text(ctx, "방류 " + Q + " m³/s", 450, 196, { s: 12.5, w: "900", c: Q > 45 ? H.v("--rose-700") : H.v("--brand-700") });
        /* 오염 농도가 줄어드는 모습 (완전 혼합 가정) */
        var gx0 = 80, gx1 = 420, gy0 = 240, gy1 = 295;
        H.axes(ctx, gx0, gy0, gx1, gy1);
        var pts = []; for (var d = 0; d <= 120; d += 2) pts.push([gx0 + d / 120 * (gx1 - gx0), gy1 - Math.exp(-d / t) * (gy1 - gy0)]);
        H.line(ctx, pts, H.v("--coral"), 2.5);
        H.dash(ctx, gx0 + 60 / 120 * (gx1 - gx0), gy0, gx0 + 60 / 120 * (gx1 - gx0), gy1, H.v("--mist"), 1);
        H.text(ctx, "오염 농도 (0 ~ 120일)", gx0, gy0 - 4, { s: 10.5, c: H.v("--mist") });
        H.text(ctx, "60일", gx0 + 60 / 120 * (gx1 - gx0), gy1 + 13, { s: 10, a: "center", c: H.v("--mist") });
        H.rows(ctx, 620, 60, [
          ["호수의 물", "2.0 × 10⁸ m³"],
          ["하루 방류량", (Q * 86400 / 1e6).toFixed(2) + " × 10⁶ m³"],
          ["물이 머무는 평균 시간", t.toFixed(0) + " 일", t <= 60 ? "--green-700" : "--rose-700", true],
          ["하류", Q > 45 ? "⚠ 범람 위험" : "안전", Q > 45 ? "--rose-700" : "--green-700"]
        ], 54);
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
      "60일 = 60 × 86,400 초. 2.0 × 10⁸ m³ 를 그 시간에 내보내려면 초당 몇 m³ 가 필요할까요?"
    ],
    solution: "2.0 × 10⁸ ÷ (60 × 86,400) ≈ 38.6 → 방류량 <b>39 ~ 45 m³/s</b>.",
    why: "체류 시간은 <b>저장량 ÷ 흐르는 양</b>입니다. 방류량을 두 배로 늘리면 체류 시간은 절반이 됩니다. 이야기에서 대기의 물은 열흘, 바닷물은 수천 년 머물렀던 것도 같은 계산이지요.<br>" +
      "체류 시간이 길수록 오염 물질도 오래 남습니다. 그래서 대기에 들어간 오염은 금방 씻겨 나가지만, 바다나 지하수에 든 오염은 아주 오래 갑니다. 다만 흐름을 무작정 늘릴 수 없는 것처럼, 지구 시스템의 한 부분을 바꾸면 <b>다른 권역(하류 마을)</b>에 영향이 갑니다."
  },

  /* ------------------------------------------------------------------ 2. 복사 평형 · 온실 효과 */
  {
    id: "c2", tag: "지구시스템의 에너지 · 복사 평형", title: "금성이 지구보다 차갑다고?", short: "금성의 온도",
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
      function draw() {
        H.paper(ctx, W, cv.H);
        var T = Te() - 273.15, s = S();
        H.text(ctx, P[p].t + " — 태양에서 " + P[p].d.toFixed(2) + " AU", 40, 32, { s: 14, w: "900" });
        H.dot(ctx, 170, 170, 70, H.v("--amber"));
        H.dot(ctx, 170, 170, 70 * Math.sqrt(A), "#ffffff");
        H.arrow(ctx, 30, 120, 100, 150, H.v("--amber"), 5, 12);
        H.arrow(ctx, 110, 190, 40, 230, H.v("--mist"), Math.max(1.5, 8 * A), 12);
        H.text(ctx, "반사 " + (A * 100).toFixed(0) + " %", 40, 252, { s: 12, w: "800", c: H.v("--mist") });
        H.text(ctx, "흰 부분 = 되돌려 보내는 빛(구름·얼음)", 60, 300, { s: 11, c: H.v("--mist") });
        H.rows(ctx, 330, 60, [
          ["들어오는 햇빛 (태양 상수)", s.toFixed(0) + " W/m²"],
          ["흡수하는 몫", (s * (1 - A) / 4).toFixed(0) + " W/m² (평균)"],
          ["복사 평형 온도", T.toFixed(0) + " ℃", "--brand-700", true]
        ], 58);
        H.rows(ctx, 620, 60, [
          ["실제 평균 표면 온도", P[p].s + " ℃", "--coral-700", true],
          ["차이 (대기가 더한 몫)", (P[p].s - T).toFixed(0) + " ℃", "--coral-700"]
        ], 64);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "행성", value: "ea", options: Object.keys(P).map(function (k) { return { v: k, t: P[k].t }; }), onPick: function (x) { p = x; draw(); } });
      api.slider({ label: "반사율 (알베도)", min: 0, max: 0.95, step: 0.01, value: 0.3, fmt: function (x) { return (x * 100).toFixed(0) + " %"; }, onInput: function (x) { A = x; draw(); } });
      api.info("지구는 반사율 30 % 에서 −18 ℃ 였습니다. 금성은 햇빛을 약 1.9 배 받습니다.");
      draw();
      return {
        judge: function () {
          var T = Te() - 273.15;
          if (p !== "ve") return { ok: false, msg: "과제는 금성입니다." };
          if (Math.abs(T + 46) <= 3) return { ok: true, msg: "반사율 " + (A * 100).toFixed(0) + " % 에서 " + T.toFixed(0) + " ℃ — 두꺼운 황산 구름이 햇빛 대부분을 되돌려 보냅니다." };
          return { ok: false, msg: "지금 금성의 복사 평형 온도 " + T.toFixed(0) + " ℃ 입니다." };
        }
      };
    },
    hints: [
      "금성은 햇빛을 많이 받는데도 복사 평형 온도가 낮습니다. 받은 햇빛의 <b>대부분을 되돌려 보낸다</b>면 어떨까요?",
      "반사율을 70 % 넘게 올려 보세요. 금성은 온통 두꺼운 구름으로 덮여 있습니다."
    ],
    solution: "금성을 고르고 반사율 <b>76 ~ 78 %</b>. 복사 평형 온도는 약 −46 ℃ 인데 실제 표면은 464 ℃ — 대기가 약 500 ℃ 를 더합니다.",
    why: "복사 평형 온도는 <b>받는 햇빛</b>과 <b>반사율</b>이 정합니다. 금성은 햇빛을 지구의 약 1.9 배 받지만 두꺼운 구름이 약 77 % 를 되돌려 보내, 흡수하는 양은 오히려 지구보다 적습니다. 그래서 복사 평형 온도는 지구보다 낮습니다.<br>" +
      "그런데도 표면이 464 ℃ 인 것은 이산화 탄소가 96 % 인 두꺼운 대기가 지표의 복사를 붙잡는 <b>온실 효과</b> 때문입니다. 지구의 온실 효과는 약 33 ℃ 를 더하지만 금성은 약 500 ℃ 를 더하지요. ‘태양에 가까울수록 뜨겁다’ 만으로는 행성의 온도를 설명할 수 없습니다."
  },

  /* ------------------------------------------------------------------ 3. 섭입대 */
  {
    id: "c3", tag: "판 구조론 · 수렴형 경계", title: "지진 깊이로 가라앉는 판 찾기", short: "섭입대 찾기",
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
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "단면 — 바다(왼쪽)에서 육지(오른쪽)로", 40, 24, { s: 14, w: "900" });
        H.box(ctx, x0, y0 - 14, X(xt) - x0, 14, H.v("--brand"), 0.45);
        H.box(ctx, X(xt), y0 - 14, x1 - X(xt), 14, H.v("--amber"), 0.45);
        H.text(ctx, "바다", x0 + 6, y0 - 3, { s: 11, w: "800", c: H.v("--brand-700") });
        H.text(ctx, "육지", x1 - 30, y0 - 3, { s: 11, w: "800", c: H.v("--amber-700") });
        [0, 200, 400, 600].forEach(function (z) { H.text(ctx, z + " km", x0 - 6, Y(z) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        QUAKES.forEach(function (q) { H.dot(ctx, X(q[0]), Y(q[1]), 4.5, q[1] < 70 ? H.v("--coral") : (q[1] < 300 ? H.v("--amber") : H.v("--violet"))); });
        var d = dip * Math.PI / 180, L = 800;
        H.line(ctx, [[X(xt), Y(0)], [X(xt + L * Math.cos(d)), Y(L * Math.sin(d))]], H.v("--teal-700"), 3);
        H.text(ctx, "▼ 해구", X(xt), y0 - 22, { s: 11.5, w: "900", a: "center", c: H.v("--teal-700") });
        var xv = xt + 110 / Math.tan(d);
        if (xv < 640 && X(xv) - X(xt) > 44) { H.text(ctx, "🌋", X(xv), y0 - 20, { s: 16, a: "center" }); }
        var e = fitErr(xt, dip);
        H.rows(ctx, 720, 80, [["판 선과 지진의 평균 어긋남", e.toFixed(1) + " km", e <= 12 ? "--green-700" : "--rose-700", true], ["판의 기울기", dip + "°"]], 70);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "해구 위치", min: 0, max: 300, step: 5, value: 250, fmt: function (x) { return x + " km"; }, onInput: function (x) { xt = x; draw(); } });
      api.slider({ label: "판의 기울기", min: 10, max: 80, step: 1, value: 20, fmt: function (x) { return x + "°"; }, onInput: function (x) { dip = x; draw(); } });
      api.info("빨강 = 얕은 지진(70 km 미만), 노랑 = 중간, 보라 = 깊은 지진(300 km 이상). 🌋 는 판이 약 110 km 깊이에 닿는 곳입니다.");
      draw();
      return {
        judge: function () {
          var e = fitErr(xt, dip);
          if (e <= 12) return { ok: true, msg: "해구 " + xt + " km · 기울기 " + dip + "° 에서 평균 어긋남 " + e.toFixed(1) + " km — 지진이 판의 윗면을 따라 늘어서 있습니다." };
          return { ok: false, msg: "평균 어긋남 " + e.toFixed(1) + " km 입니다." };
        }
      };
    },
    hints: [
      "가장 얕은 지진(빨강)이 시작되는 곳이 해구입니다. 해구 위치부터 맞추세요.",
      "그다음 기울기를 바꿔 선이 깊은 지진(보라)까지 지나가게 하세요. 기울기를 1° 씩 움직이며 어긋남 숫자가 가장 작아지는 곳을 찾으세요."
    ],
    solution: "해구 약 <b>100 km</b>, 기울기 약 <b>40°</b> 부근에서 어긋남이 가장 작습니다.",
    why: "해양판이 대륙판 아래로 가라앉는 <b>수렴형 경계</b>에서는, 가라앉는 판을 따라 지진이 일어나 해구에서 대륙 쪽으로 갈수록 <b>진원이 깊어집니다</b>. 이 기울어진 지진대를 따라가면 보이지 않는 판의 모양을 그릴 수 있습니다.<br>" +
      "판이 약 100 km 깊이에 이르면 물이 빠져나와 맨틀을 녹여 마그마가 생기고, 그 위 육지에 <b>화산이 줄지어</b> 섭니다 — 일본·안데스처럼요. 이야기에서 본 불의 고리의 화산과 지진이 판 경계에 몰린 까닭이 이것입니다."
  }
  ]
});
})();
