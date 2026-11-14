/* 통합과학1 Ⅰ-2 과학의 측정과 우리 사회 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";

/* ---- 밝은 스튜디오 말투 (../assets/kit.js 의 K.studio · K.chart · K.card) ---- */
var KT = window.sthKit, LT = KT.LT;
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

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 정밀도와 정확도 · 계통 오차 */
  {
    id: "c1", about: "01", tag: "정밀도 · 정확도", title: "어느 체중계를 믿을까", short: "체중계 영점",
    who: "🏋️", name: "학교 보건실",
    say: "“새 체중계 두 대를 시험했어요. <b>50.00 kg 기준 추</b>를 열 번씩 올렸더니 A는 49 kg 대에서 51 kg 대까지 들쭉날쭉, B는 늘 51.5 kg 근처만 가리킵니다. B 밑에 <b>영점 조절 나사</b>가 있네요.”",
    predict: {
      q: "B의 영점 나사를 돌려 평균을 맞추면, B 측정값들이 흩어진 폭은 어떻게 될까요?",
      options: ["㉠ 흩어진 폭도 줄어든다", "㉡ 흩어진 폭은 그대로다", "㉢ 흩어진 폭이 커진다"], answer: 1
    },
    task: "B의 영점을 조절해 <b>B의 평균이 50.00 kg(±0.05)</b>이 되게 하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W;
      var A = [0.6, -0.9, 0.3, -0.4, 0.8, -0.7, 0.2, 0.5, -0.6, 0.2].map(function (d) { return 50 + d; });
      var BN = [0.08, -0.05, 0.02, -0.09, 0.06, -0.03, 0.04, -0.07, 0.01, 0.03];
      var off = 0;
      function B() { return BN.map(function (d) { return 51.5 + d + off; }); }
      function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
      function spread(a) { return Math.max.apply(null, a) - Math.min.apply(null, a); }
      function X(kg) { return 176 + (kg - 47) / 8 * 452; }
      function draw() {
        var CH = cv.H, k, LW = 650;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, LW, CH, { x: 326, y: 222, rx: 310, ry: 14 });
        KT.bigText(ctx, "50.00 kg 기준 추를 열 번씩", 18, 34, 19, "#ffffff");
        [["A", A, 104, "#ff922b", "#d9480f", 0], ["B", B(), 186, "#4dabf7", "#1864ab", off]].forEach(function (s) {
          var ry = s[2];
          /* 체중계 미니어처 + 기준 추 */
          floorShadow(ctx, 80, ry + 22, 62, 7, 0.24);
          slab(ctx, 22, ry, 112, 18, 16, "#f6f8fb", "#c9d0da", "#9aa3b0");
          ctx.fillStyle = "#1e3a2c"; ctx.beginPath(); ctx.roundRect(40, ry + 3, 46, 12, 3); ctx.fill();
          lt(ctx, mean(s[1]).toFixed(1), 63, ry + 13.5, { s: 10.5, w: "900", a: "center", c: "#8dffc0" });
          var wg = ctx.createLinearGradient(66, 0, 124, 0); wg.addColorStop(0, "#5c6476"); wg.addColorStop(0.45, "#adb5bd"); wg.addColorStop(1, "#343a40");
          ctx.fillStyle = wg; ctx.beginPath(); ctx.roundRect(66, ry - 40, 58, 34, 6); ctx.fill();
          ctx.strokeStyle = "#495057"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(95, ry - 40, 11, Math.PI, 0); ctx.stroke();
          lt(ctx, "50 kg", 95, ry - 18, { s: 12, w: "900", a: "center", c: "#ffffff" });
          lt(ctx, "체중계", 22, ry - 28, { s: 11, w: "900", c: s[4] }); lt(ctx, s[0], 30, ry - 8, { s: 18, w: "900", a: "center", c: s[4] });
          if (s[0] === "B") {                 /* 영점 조절 나사 — 돌린 만큼 돌아가 있다 */
            var ka = -Math.PI / 2 + s[5] / 3 * 2.4;
            ctx.fillStyle = metal(ctx, 100, ry, 122, ry + 18, "#ffffff", "#aab3c3", "#5b6476"); ctx.beginPath(); ctx.arc(111, ry + 9, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = LT.violet; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(111 - Math.cos(ka) * 6, ry + 9 - Math.sin(ka) * 6); ctx.lineTo(111 + Math.cos(ka) * 6, ry + 9 + Math.sin(ka) * 6); ctx.stroke();
            KT.pill(ctx, "영점 나사", 111, ry + 40, { a: "center", s: 11, c: "#d0bfff", box: [0, LW] });
          }
          /* 눈금 받침판 — 잰 값마다 구슬 하나를 그 눈금 위에 놓는다 */
          slab(ctx, 160, ry + 2, 476, 12, 22, "#f3e6cc", "#c9a57a", "#a8835a");
          for (k = 47; k <= 55; k++) { ctx.strokeStyle = "rgba(90,58,28,.55)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(k), ry + 2); ctx.lineTo(X(k), ry + 10); ctx.stroke(); }
          var m = mean(s[1]);
          ctx.strokeStyle = LT.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(m), ry + 6); ctx.lineTo(X(m), ry - 40); ctx.stroke();
          ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.moveTo(X(m), ry - 40); ctx.lineTo(X(m) + 14, ry - 35); ctx.lineTo(X(m), ry - 30); ctx.closePath(); ctx.fill();
          var pts = s[1].map(function (x, i) { return [X(x) + ((i % 3) - 1) * 2, ry - 6 + ((i % 3) - 1) * 3.5]; }).sort(function (a, b) { return a[1] - b[1]; });
          pts.forEach(function (q) { KT.planet(ctx, q[0], q[1], 6, s[3], s[4]); });
        });
        for (k = 47; k <= 55; k++) lt(ctx, k === 55 ? "55 kg" : k + "", X(k), 222, { s: 12, a: "center", c: LT.mute, w: "800" });
       KT.line(ctx, { x: X(50), y: 50 }, { x: X(50), y: 204 }, LT.green, 2.2, [6, 4]);
        KT.pill(ctx, "참값 50.00 kg", X(50), 250, { a: "center", s: 12, c: "#8ce99a" });
        var cd = sideCard(ctx, 660, W, CH, "열 번 잰 결과"), bb = B();
        KT.row(ctx, "A 평균", mean(A).toFixed(2) + " kg", cd.px, cd.R, 58, LT.orange);
        KT.row(ctx, "A 흩어진 폭", spread(A).toFixed(2) + " kg", cd.px, cd.R, 82, LT.orange);
        KT.row(ctx, "B 평균", mean(bb).toFixed(2) + " kg", cd.px, cd.R, 112, LT.blue);
        KT.row(ctx, "B 흩어진 폭", spread(bb).toFixed(2) + " kg", cd.px, cd.R, 136, LT.blue);
        KT.row(ctx, "B 영점 조절", (off >= 0 ? "+" : "") + off.toFixed(1) + " kg", cd.px, cd.R, 166, LT.violet);
        KT.tip(ctx, "검은 깃발 = 평균 · 초록 점선 = 참값", cd.px - 4, 182, cd.w + 8, null);
        lt(ctx, "영점은 모든 값을 한꺼번에 옮깁니다", cd.px, 248, { s: 11, c: LT.mute });
      }      cv.canvas._redraw = draw;
      api.slider({ label: "B의 영점 조절", min: -3, max: 3, step: 0.1, value: 0, fmt: function (x) { return (x >= 0 ? "+" : "") + x.toFixed(1) + " kg"; },
        onInput: function (x) { off = x; draw(); } });
      api.info("검은 세로선이 평균, 초록 점선이 참값입니다. 영점을 옮기며 <b>흩어진 폭</b> 숫자도 함께 보세요.");
      draw();
      return {
        judge: function () {
          var m = mean(B());
          if (Math.abs(m - 50) <= 0.05) return { ok: true, msg: "B 평균 " + m.toFixed(2) + " kg · 흩어진 폭은 여전히 " + spread(B()).toFixed(2) + " kg — A(" + spread(A).toFixed(2) + " kg)보다 훨씬 좁습니다." };
          return { ok: false, msg: "B 평균이 " + m.toFixed(2) + " kg입니다." };
        }
      };
    },
    hints: [
      "B는 늘 약 51.5 kg을 가리킵니다. 모든 값이 <b>한쪽으로 같은 만큼</b> 밀려 있다는 뜻입니다. 얼마나 되돌려야 할까요?",
      "영점 조절은 모든 측정값을 똑같이 옮깁니다. 평균 51.50 → 50.00이 되려면 −1.5 kg."
    ],
    solution: "영점 조절을 <b>−1.5 kg</b>에 두세요.",
    why: "B처럼 <b>늘 같은 방향으로 같은 만큼</b> 틀리는 것이 <b>계통 오차</b>입니다. 원인(영점)을 찾으면 보정해서 없앨 수 있고, 그러면 <b>정확도</b>가 좋아집니다.<br>" +
      "하지만 값들이 흩어진 폭 — <b>정밀도</b> — 는 영점과 상관없이 그대로입니다. 그래서 들쭉날쭉한 A보다, 한쪽으로 치우쳤지만 촘촘한 B를 보정해 쓰는 편이 낫습니다. A의 흩어짐(우연 오차)은 여러 번 재어 평균을 내야 줄일 수 있습니다."
  },

  /* ------------------------------------------------------------------ 2. 유효숫자 */
  {
    id: "c2", about: "01", tag: "측정값의 자릿수", title: "방 넓이는 몇 자리까지", short: "유효숫자",
    who: "📐", name: "교실 리모델링 담당",
    say: "“교실 바닥에 새 매트를 깔려고 넓이를 쟀어요. 가로는 10 cm 눈금 줄자로 <b>4.37 m</b>. 세로는 줄자가 모자라 1 m마다 눈금이 있는 <b>긴 막대</b>로 재서 <b>3.2 m</b>. 계산기는 13.984 m² 라는데, 이렇게 적어도 될까요?”",
    predict: {
      q: "넓이를 계산기에 나온 그대로 ‘13.984 m²’로 적으면?",
      options: ["㉠ 가장 정확하게 적은 것이다", "㉡ 재지 못한 자리까지 적은 것이다", "㉢ 오히려 너무 적게 적은 것이다"], answer: 1
    },
    task: "세로를 잰 도구를 고르고, 넓이를 <b>그 측정이 보장하는 자릿수</b>까지만 적으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W;
      var tool = "stick", sf = 5;
      function width() { return tool === "stick" ? { v: 3.2, e: 0.05 } : { v: 3.21, e: 0.005 }; }
      var LEN = { v: 4.37, e: 0.005 };
      function roundSF(x, n) { var p = Math.floor(Math.log(x) / Math.LN10), k = Math.pow(10, p - n + 1); return { v: Math.round(x / k) * k, k: k }; }
      function fmt(x, k) { var d = Math.max(0, -Math.round(Math.log(k) / Math.LN10)); return x.toFixed(d); }
      /* 교실 바닥 미니어처: x = 가로(1 m = 100), y = 세로 */
      var IR = KT.iso({ ox: 226, oy: 16, s: 0.56, L: 480, D: 380 });
      function draw() {
        var CH = cv.H, w = width(), lo = (LEN.v - LEN.e) * (w.v - w.e), hi = (LEN.v + LEN.e) * (w.v + w.e), mid = LEN.v * w.v;
        var r = roundSF(mid, sf), rlo = r.v - r.k / 2, rhi = r.v + r.k / 2, over = (rhi - rlo) < (hi - lo) * 0.5;
        var I = IR, i, LW = 552, MX0 = 20, MY0 = 22, MXL = 437, MYL = w.v * 100, EX = 5;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, LW, CH, { x: 270, y: 268, rx: 250, ry: 12 });
        /* 얇은 받침 + 마룻바닥 */
        I.face(ctx, "front", function (Lw) { ctx.fillStyle = "#a77b4c"; ctx.fillRect(0, -10, Lw, 10); });
        I.face(ctx, "right", function (Lw) { ctx.fillStyle = "#8a6238"; ctx.fillRect(0, -10, Lw, 10); });
        I.plane(ctx, 0, "#e6cb9c");
        ctx.strokeStyle = "rgba(120,80,40,.18)"; ctx.lineWidth = 1;
        for (i = 1; i < 12; i++) { var a0 = I.P(0, i * 32, 0), a1 = I.P(480, i * 32, 0); ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke(); }
        /* 매트 */
        I.box(ctx, MX0, MY0, 0, MX0 + MXL, MY0 + MYL, 3, "#9cc3e6", "#5b8fc2", "#3f6f9e");
        /* 세로를 잰 값의 불확실한 띠(과장) */
        var be = w.e * 100 * EX;
        I.plane(ctx, 3.5, over ? "rgba(240,62,62,.30)" : "rgba(12,166,120,.30)", null, MX0, MX0 + MXL, MY0 + MYL - be, MY0 + MYL + be);
        /* 가로 — 10 cm 눈금 줄자(앞 왼쪽 가장자리) */
        I.plane(ctx, 4, "#ffe066", null, MX0, MX0 + MXL, MY0 + MYL + 8, MY0 + MYL + 22);
        for (i = 0; i <= 43; i++) { var t0 = I.P(MX0 + i * 10, MY0 + MYL + 8, 4), t1 = I.P(MX0 + i * 10, MY0 + MYL + (i % 10 ? 13 : 20), 4); ctx.strokeStyle = "#5c3d00"; ctx.lineWidth = i % 10 ? 0.8 : 1.6; ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.stroke(); }
        I.box(ctx, MX0 + MXL + 2, MY0 + MYL + 4, 0, MX0 + MXL + 26, MY0 + MYL + 28, 14, "#ffd43b", "#f59f00", "#e67700");
        /* 세로 — 고른 도구(앞 오른쪽 가장자리) */
        var sx = MX0 + MXL + 10;
        if (tool === "stick") {
          for (i = 0; i < 3; i++) I.box(ctx, sx, MY0 + i * 100, 0, sx + 12, MY0 + (i + 1) * 100, 6, i % 2 ? "#ffffff" : "#ffa8a8", i % 2 ? "#e9ecef" : "#e03131", i % 2 ? "#ced4da" : "#c92a2a");
          var q0 = I.P(sx + 6, MY0 + 300, 6), q1 = I.P(sx + 6, MY0 + MYL, 6);
          KT.line(ctx, q0, q1, LT.red, 2, [3, 3]);
        } else {
          I.plane(ctx, 1, "#ffe066", null, sx, sx + 12, MY0, MY0 + MYL);
          for (i = 0; i <= Math.round(MYL / 10); i++) { var u0 = I.P(sx, MY0 + i * 10, 1), u1 = I.P(sx + (i % 10 ? 5 : 11), MY0 + i * 10, 1); ctx.strokeStyle = "#5c3d00"; ctx.lineWidth = i % 10 ? 0.8 : 1.6; ctx.beginPath(); ctx.moveTo(u0.x, u0.y); ctx.lineTo(u1.x, u1.y); ctx.stroke(); }
        }
        I.label(ctx, MX0 + 300, MY0 + MYL + 18, 4, "가로 4.37 m · 10 cm 눈금 줄자", -20, 30, "#ffe8a3", [0, LW]);
        I.label(ctx, sx + 10, MY0 + 150, 6, "세로 " + (tool === "stick" ? "3.2 m · 1 m 막대" : "3.21 m · 10 cm 줄자"), 24, 14, tool === "stick" ? "#ffc9c9" : "#ffe8a3", [0, LW]);
        var mc = I.P(MX0 + MXL / 2, MY0 + MYL / 2, 3);
        KT.pill(ctx, "넓이 " + fmt(r.v, r.k) + " m²", mc.x, mc.y + 6, { a: "center", s: 14, c: over ? "#ffc9c9" : "#b2f2bb", box: [0, LW] });
        KT.warn(ctx, 14, 26, "⚠ 오차 띠는 5배 과장");
        KT.bigText(ctx, fmt(r.v, r.k) + " m²", LW - 10, 42, 28, over ? "#ff8787" : "#8ce99a", "right");
        KT.bigText(ctx, "가로 " + LEN.v.toFixed(2) + " m × 세로 " + (tool === "stick" ? "3.2" : "3.21") + " m", LW - 10, 66, 14, "#ffffff", "right");
        /* 오른쪽 카드 — 범위 비교 띠 */
        var cd = sideCard(ctx, 560, W, CH, "넓이를 몇 자리로 적을까");
        lt(ctx, sf + " 자리", cd.px, 60, { s: 24, w: "900", c: over ? LT.red : LT.green });
        KT.row(ctx, "계산기 값", mid.toFixed(4) + " m²", cd.px, cd.R, 88);
        KT.row(ctx, "세로를 잰 도구", tool === "stick" ? "1 m 눈금 막대" : "10 cm 줄자", cd.px, cd.R, 110, LT.blue);
        KT.row(ctx, "실제 넓이의 범위", lo.toFixed(2) + " ~ " + hi.toFixed(2), cd.px, cd.R, 132, LT.teal);
        KT.row(ctx, "내가 적은 값의 범위", fmt(rlo, r.k / 10) + " ~ " + fmt(rhi, r.k / 10), cd.px, cd.R, 154, over ? LT.red : LT.blue);
        function XN(a) { return cd.px + (KT.clamp(a, 13.4, 14.6) - 13.4) / 1.2 * cd.w; }
        ctx.fillStyle = "#e3e9f1"; ctx.fillRect(cd.px, 166, cd.w, 36);
        ctx.fillStyle = "#20c997"; ctx.beginPath(); ctx.roundRect(XN(lo), 168, Math.max(3, XN(hi) - XN(lo)), 14, 4); ctx.fill();
        ctx.fillStyle = over ? "#fa5252" : "#339af0"; ctx.beginPath(); ctx.roundRect(XN(rlo), 186, Math.max(3, XN(rhi) - XN(rlo)), 14, 4); ctx.fill();
        for (var tt = 13.4; tt <= 14.6 + 1e-9; tt += 0.4) lt(ctx, tt.toFixed(1), XN(tt), 218, { s: 11, a: "center", c: LT.mute, w: "800" });
        KT.tip(ctx, over ? "잰 것보다 좁은 범위를 주장합니다" : "잰 만큼만 적었습니다", cd.px - 4, 230, cd.w + 8, !over);
      }      cv.canvas._redraw = draw;
      api.seg({ label: "세로를 잰 도구", value: "stick", options: [{ v: "stick", t: "1 m 눈금 막대 (3.2 m)" }, { v: "tape", t: "10 cm 눈금 줄자 (3.21 m)" }],
        onPick: function (x) { tool = x; draw(); } });
      api.slider({ label: "적을 유효숫자 개수", min: 1, max: 5, step: 1, value: 5, fmt: function (x) { return x + " 자리"; },
        onInput: function (x) { sf = x; draw(); } });
      api.info("청록 띠는 두 측정값의 눈금 오차로 생기는 실제 범위입니다. 내가 적은 값이 주장하는 범위(파랑·빨강 띠)와 견주어 보세요.");
      draw();
      return {
        judge: function () {
          var need = tool === "stick" ? 2 : 3;
          if (sf === need) return { ok: true, msg: (tool === "stick" ? "14 m²" : "14.0 m²") + " — 세로를 " + (tool === "stick" ? "두" : "세") + " 자리로 쟀으니 넓이도 " + need + " 자리까지입니다." };
          if (sf > need) return { ok: false, msg: sf + " 자리는 재지 못한 자리까지 적은 것입니다." };
          return { ok: false, msg: sf + " 자리는 잰 것보다 덜 적은 것입니다. 한 자리 더 적어도 됩니다." };
        }
      };
    },
    hints: [
      "넓이는 두 값을 곱한 것입니다. 두 값 가운데 <b>덜 정밀하게 잰 쪽</b>이 넓이의 정밀도를 정합니다.",
      "곱셈의 결과는 <b>유효숫자가 가장 적은 값</b>의 자릿수에 맞춥니다. 4.37은 세 자리, 3.2는 두 자리, 3.21은 세 자리."
    ],
    solution: "1 m 눈금 막대(3.2 m)라면 <b>두 자리 → 14 m²</b>, 10 cm 눈금 줄자(3.21 m)라면 <b>세 자리 → 14.0 m²</b>.",
    why: "측정값의 마지막 자리는 ‘여기까지는 믿을 수 있다’는 약속입니다. 13.984 m²라고 쓰면 넓이를 0.001 m² 단위까지 안다고 주장하는 셈인데, 실제 범위는 13.75~14.22 m²로 훨씬 넓습니다.<br>" +
      "그래서 곱하거나 나눈 결과는 <b>가장 덜 정밀한 측정값의 유효숫자 개수</b>에 맞춥니다. 더 많은 자리를 적고 싶다면 계산이 아니라 <b>측정을 더 정밀하게</b> 해야 합니다 — 도구를 줄자로 바꾸자 한 자리가 늘어난 것처럼요."
  },

  /* ------------------------------------------------------------------ 3. 디지털 변환 */
  {
    id: "c3", about: "03", tag: "측정과 디지털 변환", title: "기온 기록기 설계", short: "기록기 설계",
    who: "🌡️", name: "기상 동아리",
    say: "“학교 옥상에 기온 기록기를 달아요. 하루 동안 기록해 저장하는데 <b>저장 공간은 400 바이트</b>뿐. 오늘 오후엔 <b>한랭 전선</b>이 지나가며 <b>10분 만에 6 ℃</b>가 떨어질 거래요. 그 순간도 놓치지 말고, 기온은 <b>0.1 ℃까지</b> 구분해야 합니다. (측정 범위는 0~50 ℃)”",
    predict: {
      q: "기록 간격을 절반으로 줄이면, 하루치 기록에 필요한 저장 공간은?",
      options: ["㉠ 절반으로 준다", "㉡ 그대로다", "㉢ 두 배로 는다"], answer: 2
    },
    task: "기록 간격과 비트 수를 골라 <b>세 조건</b>을 모두 지키세요: 기온이 떨어지는 <b>도중에</b> 한 번 이상 기록 · 0.1 ℃ 이하로 구분 · 400 바이트 이하.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var dt = 30, bits = 6;
      function T(min) {
        var h = min / 60, base = 14 + 8 * Math.sin((h - 9) / 24 * 2 * Math.PI);
        if (min >= 840 && min < 850) base -= 6 * (min - 840) / 10; else if (min >= 850) base -= 6;
        return base;
      }
      function res() { return 50 / Math.pow(2, bits); }
      /* 14:00~14:10 사이(양 끝 제외)에 찍힌 기록 수 — 끝점만 찍히면 떨어지는 모습은 남지 않는다 */
      function inside() { var n = 0; for (var m = 0; m <= 1440; m += dt) if (m > 840 && m < 850) n++; return n; }
      function mem() { return Math.round(1440 / dt * bits / 8); }
      /* 학교 옥상 미니어처(얇은 받침) */
      var IW = KT.iso({ ox: 236, oy: 104, s: 0.62, L: 340, D: 210 });
      function draw() {
        var CH = cv.H, I = IW, i, LW = 560, q = res();
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, LW, CH, { x: 290, y: 286, rx: 260, ry: 12 });
        var n10 = inside(), okT = n10 >= 1, okR = q <= 0.1 + 1e-9, okM = mem() <= 400;
        I.face(ctx, "front", function (Lw) { ctx.fillStyle = "#9aa3b0"; ctx.fillRect(0, -10, Lw, 10); });
        I.face(ctx, "right", function (Lw) { ctx.fillStyle = "#7d8698"; ctx.fillRect(0, -10, Lw, 10); });
        I.plane(ctx, 0, "#d9dee6");
        ctx.strokeStyle = "rgba(60,70,90,.12)"; ctx.lineWidth = 1;
        for (i = 1; i < 8; i++) { var a0 = I.P(i * 42, 0, 0), a1 = I.P(i * 42, 210, 0); ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke(); }
        /* 한랭 전선 기호(파란 선과 세모) — 옥상을 지나간다 */
        var f0 = I.P(250, 0, 1), f1 = I.P(140, 210, 1);
        ctx.strokeStyle = "#1c7ed6"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(f0.x, f0.y); ctx.lineTo(f1.x, f1.y); ctx.stroke();
        for (i = 1; i < 6; i++) { var fm = { x: f0.x + (f1.x - f0.x) * i / 6, y: f0.y + (f1.y - f0.y) * i / 6 }; ctx.fillStyle = "#1c7ed6"; ctx.beginPath(); ctx.moveTo(fm.x - 7, fm.y - 3); ctx.lineTo(fm.x + 7, fm.y + 3); ctx.lineTo(fm.x + 6, fm.y - 10); ctx.closePath(); ctx.fill(); }
        /* 백엽상(흰 기상 상자) */
        for (i = 0; i < 4; i++) { var lg = I.P(70 + (i % 2) * 34, 70 + Math.floor(i / 2) * 34, 0); ctx.fillStyle = "#868e96"; ctx.fillRect(lg.x - 1.5, lg.y - 34, 3, 34); }
        I.box(ctx, 64, 64, 34, 110, 110, 84, "#ffffff", "#f1f3f5", "#ced4da");
        var lv = I.P(64, 110, 34);
        ctx.strokeStyle = "rgba(80,90,110,.4)"; ctx.lineWidth = 1; for (i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(lv.x + 2, lv.y - i * 3.8); ctx.lineTo(lv.x + 24, lv.y - i * 3.8 + 13); ctx.stroke(); }
        I.label(ctx, 64, 110, 70, "백엽상 · 온도 센서", -22, -36, "#ffffff", [0, LW]);
        /* 구름 */
        [[120, 40, 24], [146, 32, 30], [176, 42, 22]].forEach(function (c) { var g = ctx.createRadialGradient(c[0] - 6, c[1] - 8, 2, c[0], c[1], c[2]); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#a5b4c8"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0] + 200, c[1] + 24, c[2], 0, Math.PI * 2); ctx.fill(); });
        KT.pill(ctx, "한랭 전선 14:00~14:10 · 6 ℃ 하강", 300, 244, { a: "center", s: 12, c: "#a5d8ff", box: [0, LW] });
        /* 기록기 — 시계판 눈금 = 한 시간에 몇 번 재는가 */
        var cab = I.P(104, 87, 60);
        ctx.strokeStyle = "#495057"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cab.x + 20, cab.y + 10); ctx.bezierCurveTo(260, 200, 380, 120, 428, 96); ctx.stroke();
        slab(ctx, 428, 40, 120, 78, 12, "#eef1f6", "#d5dce6", "#aab4c3");
        var DX = 460, DY = 79;
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(DX, DY, 25, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#495057"; ctx.lineWidth = 1.5; ctx.stroke();
        var nt = Math.round(60 / dt);
        for (i = 0; i < nt; i++) { var an = -Math.PI / 2 + i / nt * Math.PI * 2; ctx.fillStyle = LT.blue; ctx.beginPath(); ctx.arc(DX + Math.cos(an) * 19, DY + Math.sin(an) * 19, nt > 20 ? 1.4 : 2.6, 0, Math.PI * 2); ctx.fill(); }
        lt(ctx, "1시간", DX, DY + 4, { s: 10, w: "900", a: "center", c: LT.mute });
        lt(ctx, dt + "분마다", 494, 70, { s: 12, w: "900", c: LT.ink });
        lt(ctx, bits + "비트", 494, 90, { s: 12, w: "900", c: LT.violet });
        lt(ctx, "기록기", 488, 34, { s: 12, w: "900", a: "center", c: LT.mute });
        /* 저장 칩 — 400 바이트를 80칸(칸마다 5 바이트)으로 */
        var used = Math.ceil(mem() / 5), CX0 = 432, CY0 = 140;
        ctx.fillStyle = "#2f9e44"; ctx.beginPath(); ctx.roundRect(CX0 - 6, CY0 - 6, 124, 86, 6); ctx.fill();
        ctx.fillStyle = "#ffd43b"; for (i = 0; i < 10; i++) { ctx.fillRect(CX0 + 2 + i * 11.2, CY0 - 10, 4, 4); ctx.fillRect(CX0 + 2 + i * 11.2, CY0 + 80, 4, 4); }
        for (i = 0; i < 80; i++) {
          var cx = CX0 + (i % 10) * 11.2, cy = CY0 + Math.floor(i / 10) * 9.4;
          ctx.fillStyle = i < used ? (okM ? "#63e6be" : "#ff8787") : "#1e3a2c"; ctx.fillRect(cx, cy, 9.6, 7.8);
        }
        KT.pill(ctx, okM ? "저장 칩 " + mem() + " / 400 바이트" : "넘침! " + mem() + " 바이트", CX0 + 56, CY0 + 108, { a: "center", s: 12, c: okM ? "#b2f2bb" : "#ffa8a8", box: [0, LW] });
        KT.bigText(ctx, "옥상 기온 기록기", 16, 34, 19, "#ffffff");
        /* 오른쪽 카드 — 13~15시 확대 그래프 */
        var cd = sideCard(ctx, 570, W, CH, "기록기 설계 점검");
        KT.row(ctx, "떨어지는 도중의 기록", n10 + " 번 " + (okT ? "✓" : "✗"), cd.px, cd.R, 56, okT ? LT.green : LT.red);
        KT.row(ctx, "구분하는 온도", q.toFixed(3) + " ℃ " + (okR ? "✓" : "✗"), cd.px, cd.R, 78, okR ? LT.green : LT.red);
        KT.row(ctx, "하루 저장 공간", mem() + " 바이트 " + (okM ? "✓" : "✗"), cd.px, cd.R, 100, okM ? LT.green : LT.red);
        var g = KT.chart(ctx, { x: cd.px - 10, y: 110, w: cd.w + 20, h: 150, x0: 780, x1: 900, y0: 14, y1: 24, xt: 4, yt: 2, light: true, xl: "13시 ~ 15시 확대", yl: "기온 (℃)", xf: function (v2) { var hh = Math.floor(v2 / 60), mm = Math.round(v2 % 60); return hh + ":" + (mm < 10 ? "0" : "") + mm; }, pl: 34, pr: 8 });
        ctx.fillStyle = "rgba(240,62,62,.16)"; ctx.fillRect(g.X(840), g.T, g.X(850) - g.X(840), g.B - g.T);
        var pts = []; for (var m = 780; m <= 900; m += 1) pts.push([m, T(m)]);
        KT.plot(ctx, g, pts, "#8a96a8", { light: true, w: 2, glow: false });
        var rec = [], last = null;
        for (var m2 = 0; m2 <= 1440; m2 += dt) {
          var v = Math.round(T(m2) / q) * q;
          if (m2 >= 780 && m2 <= 900) { if (last) rec.push([m2, last[1]]); else if (m2 > 780) rec.push([780, Math.round(T(m2 - dt) / q) * q]); rec.push([m2, v]); }
          last = (m2 >= 780 && m2 <= 900) ? [m2, v] : null;
        }
        KT.plot(ctx, g, rec, LT.blue, { light: true, w: 2.4, dots: 2.8 });
        KT.tip(ctx, okT && okR && okM ? "세 조건을 모두 만족" : "회색 = 실제 · 파랑 = 기록기", cd.px - 4, 266, cd.w + 8, okT && okR && okM ? true : null);
      }      cv.canvas._redraw = draw;
      api.seg({ label: "기록 간격", value: 30, options: [1, 2, 5, 10, 15, 30].map(function (m) { return { v: m, t: m + "분" }; }),
        onPick: function (x) { dt = x; draw(); } });
      api.slider({ label: "한 번 기록에 쓰는 비트 수", min: 4, max: 12, step: 1, value: 6, fmt: function (x) { return x + " 비트 (" + Math.pow(2, x) + " 단계)"; },
        onInput: function (x) { bits = x; draw(); } });
      api.info("비트 수가 n이면 0~50 ℃를 2ⁿ 단계로 나눕니다. 하루 기록 수 × 비트 수 ÷ 8 = 바이트.");
      draw();
      return {
        judge: function () {
          var n10 = inside();
          var bad = [];
          if (n10 < 1) bad.push("기온이 떨어지는 도중의 기록이 없음");
          if (res() > 0.1 + 1e-9) bad.push("온도를 " + res().toFixed(2) + " ℃ 단위로만 구분");
          if (mem() > 400) bad.push("저장 공간 " + mem() + " 바이트로 초과");
          if (!bad.length) return { ok: true, msg: dt + "분 간격 · " + bits + " 비트 → " + mem() + " 바이트, " + res().toFixed(3) + " ℃ 구분." };
          return { ok: false, msg: bad.join(" · ") };
        }
      };
    },
    hints: [
      "14시 00분 ~ 14시 10분 <b>사이</b>에 기록이 하나라도 있으려면 간격이 몇 분이어야 할까요? 끝점(14:00, 14:10)만 찍히면 떨어지는 모습이 남지 않습니다.",
      "0~50 ℃를 0.1 ℃ 이하로 나누려면 500 단계보다 많아야 합니다. 2⁹ = 512. 그다음 저장 공간을 계산해 보세요."
    ],
    solution: "간격 <b>5분</b>, 비트 <b>9~11</b>. 예) 5분 × 9비트 → 하루 288번 × 9 ÷ 8 = 324 바이트, 0.098 ℃ 구분.",
    why: "아날로그 신호를 디지털로 바꿀 때는 <b>얼마나 자주 재는가(표본화)</b>와 <b>얼마나 잘게 나누는가(양자화)</b>를 정해야 합니다. 둘 다 올리면 정보는 정확해지지만 저장 공간이 늘어납니다.<br>" +
      "간격을 절반으로 줄이면 기록 수가 두 배, 비트를 하나 늘리면 단계 수가 두 배가 됩니다. 그래서 설계는 ‘가장 좋게’가 아니라 <b>필요한 만큼만</b> — 급변을 잡을 만큼 자주, 필요한 정밀도만큼 잘게 — 정하는 일입니다."
  }
  ]
});
})();
