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
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var A = [0.6, -0.9, 0.3, -0.4, 0.8, -0.7, 0.2, 0.5, -0.6, 0.2].map(function (d) { return 50 + d; });
      var BN = [0.08, -0.05, 0.02, -0.09, 0.06, -0.03, 0.04, -0.07, 0.01, 0.03];
      var off = 0;
      function B() { return BN.map(function (d) { return 51.5 + d + off; }); }
      function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
      function spread(a) { return Math.max.apply(null, a) - Math.min.apply(null, a); }
      function X(kg) { return 150 + (kg - 47) / 8 * 480; }
      function draw() {
        var CH = cv.H, k;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 650, CH, null);
        KT.bigText(ctx, "50.00 kg 기준 추를 열 번씩", 18, 38, 19, "#ffffff");
        for (k = 47; k <= 55; k++) {
          KT.line(ctx, { x: X(k), y: 62 }, { x: X(k), y: 246 }, "rgba(20,40,90,.08)", 1);
          lt(ctx, k + "", X(k), 290, { s: 11, a: "center", c: LT.mute, w: "800" });
        }
        KT.pill(ctx, "참값 50.00", X(50), 270, { a: "center", s: 11, c: "#8ce99a" });
        [["A", A, 112, "#ff922b", "#d9480f"], ["B", B(), 200, "#4dabf7", "#1864ab"]].forEach(function (s) {
          /* 체중계 미니어처 */
          floorShadow(ctx, 72, s[2] + 22, 52, 6, 0.22);
          slab(ctx, 22, s[2] - 6, 96, 22, 12, "#f6f8fb", "#c9d0da", "#9aa3b0");
          ctx.fillStyle = "#1e3a2c"; ctx.fillRect(50, s[2] - 2, 40, 13);
          lt(ctx, "체중계 " + s[0], 70, s[2] - 22, { s: 13, w: "900", a: "center", c: s[4] });
          ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.roundRect(140, s[2] - 30, 500, 60, 12); ctx.fill();
          s[1].forEach(function (x, i) { KT.planet(ctx, X(x), s[2] + (i % 3 - 1) * 12, 6.5, s[3], s[4]); });
          var m = mean(s[1]);
          ctx.strokeStyle = LT.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(X(m), s[2] - 30); ctx.lineTo(X(m), s[2] + 30); ctx.stroke();
        });
        KT.line(ctx, { x: X(50), y: 58 }, { x: X(50), y: 250 }, LT.green, 2.2, [6, 4]);
        var cd = sideCard(ctx, 660, W, CH, "열 번 잰 결과"), bb = B();
        KT.row(ctx, "A 평균", mean(A).toFixed(2) + " kg", cd.px, cd.R, 62, LT.orange);
        KT.row(ctx, "A 흩어진 폭", spread(A).toFixed(2) + " kg", cd.px, cd.R, 88, LT.orange);
        KT.row(ctx, "B 평균", mean(bb).toFixed(2) + " kg", cd.px, cd.R, 124, LT.blue);
        KT.row(ctx, "B 흩어진 폭", spread(bb).toFixed(2) + " kg", cd.px, cd.R, 150, LT.blue);
        KT.row(ctx, "B 영점 조절", (off >= 0 ? "+" : "") + off.toFixed(1) + " kg", cd.px, cd.R, 186, LT.violet);
        KT.tip(ctx, "검은 선 = 평균 · 초록 점선 = 참값", cd.px - 4, 204, cd.w + 8, null);
        lt(ctx, "영점은 모든 값을 한꺼번에 옮깁니다", cd.px, 266, { s: 11, c: LT.mute });
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
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var tool = "stick", sf = 5;
      function width() { return tool === "stick" ? { v: 3.2, e: 0.05 } : { v: 3.21, e: 0.005 }; }
      var LEN = { v: 4.37, e: 0.005 };
      function roundSF(x, n) { var p = Math.floor(Math.log(x) / Math.LN10), k = Math.pow(10, p - n + 1); return { v: Math.round(x / k) * k, k: k }; }
      function fmt(x, k) { var d = Math.max(0, -Math.round(Math.log(k) / Math.LN10)); return x.toFixed(d); }
      function X(a) { return 40 + (a - 13.4) / 1.2 * 580; }
      function draw() {
        var CH = cv.H, w = width(), lo = (LEN.v - LEN.e) * (w.v - w.e), hi = (LEN.v + LEN.e) * (w.v + w.e), mid = LEN.v * w.v;
        var r = roundSF(mid, sf), rlo = r.v - r.k / 2, rhi = r.v + r.k / 2, over = (rhi - rlo) < (hi - lo) * 0.5;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 650, CH, null);
        KT.bigText(ctx, fmt(r.v, r.k) + " m²", 18, 44, 28, over ? "#ff8787" : "#8ce99a");
        KT.bigText(ctx, "가로 " + LEN.v.toFixed(2) + " m × 세로 " + (tool === "stick" ? "3.2" : "3.21") + " m", 18, 72, 15, "#ffffff");
        for (var t = 13.4; t <= 14.6 + 1e-9; t += 0.2) {
          KT.line(ctx, { x: X(t), y: 96 }, { x: X(t), y: 236 }, "rgba(20,40,90,.10)", 1);
          lt(ctx, t.toFixed(1), X(t), 256, { s: 11, a: "center", c: LT.mute, w: "800" });
        }
        lt(ctx, "넓이 (m²)", 630, 276, { s: 11, a: "right", c: LT.mute });
        slab(ctx, X(lo), 120, Math.max(3, X(hi) - X(lo)), 30, 9, "#96f2d7", "#20c997", "#0ca678");
        lt(ctx, "실제 넓이가 있을 수 있는 범위 " + lo.toFixed(2) + " ~ " + hi.toFixed(2), KT.clamp(X(lo), 40, 330), 108, { s: 11.5, w: "900", c: LT.teal });
        var a0 = Math.max(40, X(rlo)), a1 = Math.min(620, X(rhi));
        slab(ctx, a0, 190, Math.max(3, a1 - a0), 30, 9, over ? "#ffc9c9" : "#a5d8ff", over ? "#fa5252" : "#339af0", over ? "#c92a2a" : "#1864ab");
        lt(ctx, "내가 적은 값이 뜻하는 범위 " + fmt(rlo, r.k / 10) + " ~ " + fmt(rhi, r.k / 10), 40, 178, { s: 11.5, w: "900", c: over ? LT.red : LT.blue });
        var cd = sideCard(ctx, 660, W, CH, "넓이를 몇 자리로 적을까");
        lt(ctx, sf + " 자리", cd.px, 62, { s: 24, w: "900", c: over ? LT.red : LT.green });
        KT.row(ctx, "계산기 값", mid.toFixed(4) + " m²", cd.px, cd.R, 98);
        KT.row(ctx, "세로를 잰 도구", tool === "stick" ? "1 m 눈금 막대" : "10 cm 줄자", cd.px, cd.R, 124, LT.blue);
        KT.row(ctx, "내가 적은 값", fmt(r.v, r.k) + " m²", cd.px, cd.R, 150, over ? LT.red : LT.green);
        KT.tip(ctx, over ? "잰 것보다 좁은 범위를 주장합니다" : "잰 만큼만 적었습니다", cd.px - 4, 170, cd.w + 8, !over);
        lt(ctx, "청록 = 실제 범위, 파랑·빨강 = 내 주장", cd.px, 236, { s: 10.5, c: LT.mute });
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
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
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
      function draw() {
        H.paper(ctx, W, cv.H);
        var CH = cv.H;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 650, CH, null);
        var g = KT.chart(ctx, { x: 8, y: 44, w: 636, h: CH - 48, x0: 0, x1: 1440, y0: 0, y1: 25, xt: 4, yt: 5, light: true, xl: "시각", yl: "기온 (℃)", xf: function (v2) { return Math.round(v2 / 60) + "시"; } });
        function X(m) { return g.X(m); }
        function Y(t) { return g.Y(t); }
        ctx.fillStyle = "rgba(240,62,62,.14)"; ctx.fillRect(X(840), g.T, X(850) - X(840), g.B - g.T);
        KT.pill(ctx, "전선 통과", X(845), g.T + 18, { a: "center", s: 11, c: "#ffa8a8" });
        var pts = []; for (var m = 0; m <= 1440; m += 2) pts.push([m, T(m)]);
        KT.plot(ctx, g, pts, "#8a96a8", { light: true, w: 2.2, glow: false });
        var q = res(), rec = [];
        for (var m2 = 0; m2 <= 1440; m2 += dt) {
          var v = Math.round(T(m2) / q) * q;
          if (rec.length) rec.push([m2, rec[rec.length - 1][1]]);
          rec.push([m2, v]);
        }
        KT.plot(ctx, g, rec, LT.blue, { light: true, w: 2.6 });
        KT.bigText(ctx, "하루 기온 기록", 18, 34, 19, "#ffffff");
        KT.pill(ctx, "회색 = 실제 · 파랑 = 기록기", 630, 30, { a: "right", s: 11, c: "#a5d8ff" });
        var n10 = inside(), okT = n10 >= 1, okR = q <= 0.1 + 1e-9, okM = mem() <= 400;
        var cd = sideCard(ctx, 660, W, CH, "기록기 설계 점검");
        KT.row(ctx, "떨어지는 도중의 기록", n10 + " 번 " + (okT ? "✓" : "✗"), cd.px, cd.R, 64, okT ? LT.green : LT.red);
        KT.row(ctx, "구분하는 온도", q.toFixed(3) + " ℃ " + (okR ? "✓" : "✗"), cd.px, cd.R, 94, okR ? LT.green : LT.red);
        KT.row(ctx, "하루 저장 공간", mem() + " 바이트 " + (okM ? "✓" : "✗"), cd.px, cd.R, 124, okM ? LT.green : LT.red);
        lt(ctx, "저장 공간 (한도 400 바이트)", cd.px, 160, { s: 11, c: LT.mute });
        KT.bar(ctx, cd.px, 168, cd.w, mem() / 800, okM ? LT.teal : LT.red);
        ctx.fillStyle = LT.red; ctx.fillRect(cd.px + cd.w / 2 - 1.5, 162, 3, 22);
        lt(ctx, "400", cd.px + cd.w / 2, 198, { s: 10.5, a: "center", c: LT.red, w: "900" });
        KT.tip(ctx, okT && okR && okM ? "세 조건을 모두 만족" : "세 조건을 모두 맞춰 보세요", cd.px - 4, 214, cd.w + 8, okT && okR && okM ? true : null);
        lt(ctx, "자주·촘촘히 잴수록 저장 공간이 는다", cd.px, 282, { s: 10.5, c: LT.mute });
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
