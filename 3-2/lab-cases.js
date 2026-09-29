/* 통합과학1 Ⅲ-2 역학 시스템 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";
var G = 9.8;

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 자유 낙하 거꾸로 */
  {
    id: "c1", tag: "자유 낙하", title: "미지의 행성에서 온 영상", short: "미지의 행성",
    who: "🛰️", name: "탐사선 관제실",
    say: "“탐사선 로봇팔이 <b>1.50 m</b> 높이에서 시료 캡슐을 놓았습니다. 영상으로 재 보니 바닥에 닿기까지 <b>0.90초</b>. 이곳의 중력 가속도를 알아내 주세요. 착륙 지점 기록이 지워져서, 이 영상이 유일한 단서입니다.”",
    predict: {
      q: "지구에서라면 1.50 m 를 떨어지는 데 약 0.55초면 됩니다. 이 행성의 중력 가속도 g 는 지구(9.8 m/s²)보다?",
      options: ["㉠ 크다", "㉡ 같다", "㉢ 작다"], answer: 2
    },
    task: "중력 가속도 슬라이더를 움직여 <b>내 시뮬레이션의 낙하 시간이 영상과 같아지게</b>(0.90 ± 0.015초) 만드세요. 캡슐 질량 슬라이더도 바꿔 보세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var g = 9.8, m = 1.0, h = 1.5, T_REC = 0.90, tNow = 0, running = false, touched = false;
      var run = api.ticker();
      function tFall(gg) { return Math.sqrt(2 * h / gg); }
      function draw() {
        H.paper(ctx, W, cv.H);
        var top = 70, bot = 280, sc = (bot - top) / h;
        H.text(ctx, "같은 높이 1.50 m 에서 동시에 놓는다", 40, 34, { s: 14, w: "900" });
        [[210, "영상 (실제 기록)", T_REC, "--coral"], [470, "내 시뮬레이션", tFall(g), "--brand"]].forEach(function (col) {
          var x = col[0], T = col[2], k = Math.min(tNow, T) / T, y = top + (k * k) * (bot - top);
          H.text(ctx, col[1], x, top - 18, { s: 12.5, w: "800", a: "center", c: H.v(col[3] + "-700") });
          ctx.strokeStyle = H.v("--line"); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x - 60, bot + 14); ctx.lineTo(x + 60, bot + 14); ctx.stroke();
          ctx.fillStyle = H.v(col[3]); ctx.beginPath(); ctx.arc(x, y, 12 + m * 1.6, 0, Math.PI * 2); ctx.fill();
          var shown = Math.min(tNow, T);
          H.text(ctx, (tNow >= T ? "착지 " : "") + shown.toFixed(2) + " s", x, bot + 40, { s: 13, w: "900", a: "center", c: H.v(col[3] + "-700") });
        });
        ctx.strokeStyle = H.v("--mist"); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(110, top); ctx.lineTo(110, bot + 14); ctx.stroke(); ctx.setLineDash([]);
        H.text(ctx, "1.50 m", 100, (top + bot) / 2, { s: 11.5, a: "right", c: H.v("--mist") });
        var px = 640;
        H.text(ctx, "중력 가속도 g", px, 90, { s: 12, w: "800", c: H.v("--mist") });
        H.text(ctx, g.toFixed(2) + " m/s²", px, 124, { s: 24, w: "900", c: H.v("--brand-700") });
        H.text(ctx, "캡슐 질량 " + m.toFixed(1) + " kg", px, 160, { s: 12.5, w: "800", c: H.v("--mist") });
        H.text(ctx, "예상 낙하 시간 " + tFall(g).toFixed(3) + " s", px, 196, { s: 13, w: "800" });
        var d = tFall(g) - T_REC;
        H.text(ctx, Math.abs(d) <= 0.015 ? "영상과 같습니다" : (d > 0 ? "영상보다 느리게 떨어짐" : "영상보다 빨리 떨어짐"), px, 222,
          { s: 12.5, w: "800", c: Math.abs(d) <= 0.015 ? H.v("--green-700") : H.v("--rose-700") });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "중력 가속도 g", min: 1, max: 25, step: 0.05, value: 9.8, fmt: function (x) { return x.toFixed(2) + " m/s²"; },
        onInput: function (x) { g = x; tNow = 0; draw(); } });
      api.slider({ label: "캡슐 질량", min: 0.2, max: 5, step: 0.1, value: 1, fmt: function (x) { return x.toFixed(1) + " kg"; },
        onInput: function (x) { m = x; touched = true; draw(); } });
      api.button("▶ 동시에 떨어뜨려 보기", function () {
        var T = Math.max(T_REC, tFall(g)) + 0.15;
        run(60, 25, function (k) { tNow = k * T; draw(); });
      });
      api.info("두 캡슐을 같은 순간에 놓습니다. 먼저 닿는 쪽을 보고 g 를 어느 쪽으로 옮길지 정하세요.");
      draw();
      return {
        judge: function () {
          var t = tFall(g);
          if (Math.abs(t - T_REC) <= 0.015) return { ok: true, msg: "g ≈ " + g.toFixed(2) + " m/s² 에서 낙하 시간 " + t.toFixed(3) + " s — 영상과 같습니다." + (touched ? " 캡슐 질량을 바꿔도 시간은 그대로였지요." : "") };
          return { ok: false, msg: "지금 낙하 시간 " + t.toFixed(3) + " s (목표 0.90 s) — " + (t > T_REC ? "너무 느립니다." : "너무 빠릅니다.") };
        }
      };
    },
    hints: [
      "영상 속 캡슐은 지구보다 <b>오래</b> 걸려 떨어집니다. 오래 걸린다는 것은 아래로 당기는 가속이 약하다는 뜻이죠. g 를 어느 쪽으로 옮겨야 할까요?",
      "h = ½ g t² 를 g 에 대해 풀면 g = 2h ÷ t² 입니다. h = 1.50 m, t = 0.90 s 를 넣어 보세요."
    ],
    solution: "g = 2 × 1.50 ÷ 0.90² ≈ <b>3.70 m/s²</b>. 슬라이더를 3.60 ~ 3.80 사이에 두고 판정하세요.",
    why: "떨어지는 데 걸리는 시간은 <b>t = √(2h / g)</b> — 높이와 <b>g</b> 만으로 정해지고, 질량은 식에 없습니다. 진공 통에서 깃털과 쇠공이 함께 떨어진 것과 같은 까닭이지요.<br>" +
      "이 관계를 거꾸로 쓰면 <b>시간을 재서 g 를 알아낼 수 있습니다.</b> 3.7 m/s² 는 화성(3.71)과 수성(3.70)의 값인데, 영상 속 붉은 모래를 보면 화성이겠지요. 같은 식을 앞으로도 뒤로도 쓸 수 있을 때 개념을 제대로 가진 것입니다."
  },

  /* ------------------------------------------------------------------ 2. 알짜힘 · 겉보기 무게 */
  {
    id: "c2", tag: "뉴턴 운동 법칙", title: "화물 드론의 줄", short: "드론 줄",
    who: "🚁", name: "재난 구조대",
    say: "“섬에 <b>20.0 kg</b> 구호품을 줄에 매달아 드론으로 올려 보냅니다. 줄은 <b>250 N</b> 까지만 견뎌요. 시간이 없으니 최대한 빨리 가속해 떠올려야 하는데… 어디까지 밀어붙여도 될까요?”",
    predict: {
      q: "드론이 짐을 위로 가속시키며 올라가는 동안, 줄이 짐을 당기는 힘은 짐의 무게(196 N)와 비교해?",
      options: ["㉠ 무게보다 작다", "㉡ 무게와 같다", "㉢ 무게보다 크다"], answer: 2
    },
    task: "위쪽 가속도를 조절해 <b>줄이 끊어지지 않는 범위에서 가장 빠르게</b> 올리세요. 장력이 <b>240 N 이상 250 N 이하</b>면 합격입니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var M = 20, a = 0, y = 0, snapped = false, lifting = false;
      var run = api.ticker();
      function T() { return M * (G + a); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "짐에 작용하는 두 힘", 40, 34, { s: 14, w: "900" });
        var cx = 250, dy = 82 - Math.min(y * 26, 48), by = dy + 150;
        if (!snapped) {
          ctx.strokeStyle = H.v("--mist"); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, dy + 18); ctx.lineTo(cx, by - 26); ctx.stroke();
        }
        ctx.fillStyle = H.v("--ink"); ctx.fillRect(cx - 50, dy, 100, 16);
        H.text(ctx, "🚁", cx, dy - 4, { s: 26, a: "center" });
        var boxY = snapped ? Math.min(300, by + 40) : by;
        ctx.fillStyle = H.v("--amber"); ctx.fillRect(cx - 28, boxY - 26, 56, 52);
        H.text(ctx, "20 kg", cx, boxY + 5, { s: 12, w: "900", a: "center", c: "#3a2a00" });
        if (!snapped) {
          var sc = 0.42;
          H.arrow(ctx, cx + 60, boxY, cx + 60, boxY - T() * sc, H.v("--brand"), 5, 12);
          H.text(ctx, "장력 " + T().toFixed(0) + " N", cx + 72, boxY - T() * sc + 8, { s: 12.5, w: "900", c: H.v("--brand-700") });
          H.arrow(ctx, cx - 60, boxY, cx - 60, boxY + M * G * sc, H.v("--coral"), 5, 12);
          H.text(ctx, "무게 196 N", cx - 72, boxY + M * G * sc - 4, { s: 12.5, w: "900", a: "right", c: H.v("--coral-700") });
        } else {
          H.text(ctx, "💥 줄이 끊어졌습니다", 720, 290, { s: 15, w: "900", c: H.v("--rose-700") });
        }
        /* 장력 계기 */
        var gx = 560, gy0 = 80, gy1 = 280, gh = gy1 - gy0;
        function GY(t) { return gy1 - Math.max(0, Math.min(t, 320)) / 320 * gh; }
        ctx.fillStyle = H.v("--card-2"); ctx.fillRect(gx, gy0, 40, gh);
        ctx.fillStyle = T() > 250 ? H.v("--rose") : (T() >= 240 ? H.v("--green") : H.v("--brand"));
        ctx.fillRect(gx, GY(T()), 40, gy1 - GY(T()));
        ctx.strokeStyle = H.v("--rose"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx - 8, GY(250)); ctx.lineTo(gx + 48, GY(250)); ctx.stroke();
        H.text(ctx, "250 N (끊어짐)", gx + 54, GY(250) + 4, { s: 11.5, w: "800", c: H.v("--rose-700") });
        ctx.strokeStyle = H.v("--coral"); ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(gx - 8, GY(196)); ctx.lineTo(gx + 48, GY(196)); ctx.stroke(); ctx.setLineDash([]);
        H.text(ctx, "무게 196 N", gx + 54, GY(196) + 4, { s: 11.5, w: "800", c: H.v("--coral-700") });
        H.text(ctx, "줄의 장력", gx + 20, gy1 + 22, { s: 11.5, w: "800", a: "center", c: H.v("--mist") });
        var px = 720;
        H.text(ctx, "가속도", px, 110, { s: 12, w: "800", c: H.v("--mist") });
        H.text(ctx, (a >= 0 ? "+" : "") + a.toFixed(1) + " m/s²", px, 140, { s: 20, w: "900" });
        H.text(ctx, "장력", px, 180, { s: 12, w: "800", c: H.v("--mist") });
        H.text(ctx, T().toFixed(1) + " N", px, 210, { s: 20, w: "900", c: T() > 250 ? H.v("--rose-700") : H.v("--brand-700") });
        H.text(ctx, a > 0 ? "위로 빨라지는 중" : (a < 0 ? "위로 가며 느려지는 중" : "일정한 속력"), px, 240, { s: 11.5, c: H.v("--mist") });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "위쪽 가속도", min: -3, max: 5, step: 0.1, value: 0, fmt: function (x) { return (x >= 0 ? "+" : "") + x.toFixed(1) + " m/s²"; },
        onInput: function (x) { a = x; snapped = false; y = 0; draw(); } });
      api.button("▶ 띄워 보기", function () {
        snapped = false; y = 0;
        if (T() > 250) { run(20, 30, function (k) { y = k * 0.5; if (k >= 1) snapped = true; draw(); }); return; }
        run(40, 30, function (k) { y = Math.max(0, a) * 0.5 * k * k + k * 1.2; draw(); });
      });
      api.info("가속도를 키울수록 장력이 어떻게 변하는지 계기를 보세요. 가속도가 0 일 때 장력은 얼마인가요?");
      draw();
      return {
        judge: function () {
          var t = T();
          if (t >= 240 && t <= 250 && a > 0) return { ok: true, msg: "가속도 +" + a.toFixed(1) + " m/s² · 장력 " + t.toFixed(1) + " N — 줄이 견디는 한계 바로 아래입니다." };
          if (t > 250) return { ok: false, msg: "장력 " + t.toFixed(1) + " N — 줄이 끊어집니다." };
          return { ok: false, msg: "장력 " + t.toFixed(1) + " N — 안전하지만 더 빨리 올릴 수 있습니다." };
        }
      };
    },
    hints: [
      "짐이 위로 <b>빨라지려면</b> 위로 끄는 힘이 아래로 당기는 무게보다 커야 합니다. 두 힘의 차가 알짜힘이에요.",
      "알짜힘 = 장력 − 무게 = 질량 × 가속도. 장력 250 N, 무게 196 N, 질량 20 kg 을 넣으면 가속도는?"
    ],
    solution: "a = (250 − 196) ÷ 20 = <b>2.7 m/s²</b>. 가속도를 +2.2 ~ +2.7 m/s² 사이에 두고 판정하세요.",
    why: "짐에는 위로 <b>장력</b>, 아래로 <b>무게</b>가 작용합니다. 알짜힘 = 장력 − 무게 = ma 이므로 <b>장력 = m(g + a)</b>.<br>" +
      "위로 가속할 때(a > 0) 장력은 무게보다 크고, 속력이 일정할 때(a = 0)에야 무게와 같으며, 위로 가며 느려질 때(a < 0)는 무게보다 작습니다. " +
      "엘리베이터 저울 눈금이 오르내린 것과 <b>같은 원리</b>입니다 — 이번에는 저울 대신 줄이 그 힘을 받았을 뿐이지요. 크레인이 짐을 천천히 들어 올리기 시작하는 까닭이 여기에 있습니다."
  },

  /* ------------------------------------------------------------------ 3. 충격량 */
  {
    id: "c3", tag: "충격량과 운동량", title: "달걀 낙하 대회", short: "달걀 낙하",
    who: "🥚", name: "과학 동아리 부장",
    say: "“올해 규칙: <b>60 g</b> 달걀을 <b>2.0 m</b> 에서 떨어뜨리고, 바닥 쿠션 <b>두께는 6 cm 이하</b>. 재료는 신문지 뭉치, 에어캡(뽁뽁이), 스펀지 중 하나. 이 모형에서는 달걀이 멈추는 동안 받는 평균 힘이 <b>30 N</b> 을 넘으면 깨진다고 봅니다.”",
    predict: {
      q: "쿠션이 달걀을 지켜 주는 까닭은 무엇일까요?",
      options: ["㉠ 달걀이 받는 충격량(운동량의 변화)을 줄여 주어서", "㉡ 같은 충격량을 더 긴 시간에 나눠 받게 해서", "㉢ 달걀이 떨어지는 속력을 미리 줄여 주어서"],
      answer: 1
    },
    task: "재료와 두께를 골라 <b>두께 6 cm 이하에서 달걀이 깨지지 않게</b>(평균 힘 30 N 이하) 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var MAT = { news: { t: "신문지 뭉치", k: 0.30, c: "--mist" }, cap: { t: "에어캡", k: 0.55, c: "--brand" }, sponge: { t: "스펀지", k: 0.85, c: "--amber" } };
      var mat = "news", th = 3.0, m = 0.060, h = 2.0, fall = 0, squash = 0, result = null;
      var run = api.ticker();
      var vHit = Math.sqrt(2 * G * h), dp = m * vHit;
      function calc() {
        var d = MAT[mat].k * th / 100;                 /* 실제로 눌리며 멈추는 거리 (m) */
        var dt = 2 * d / vHit;                         /* 고르게 느려진다고 본 멈춤 시간 */
        var F = dp / dt + m * G;                       /* 바닥이 달걀을 미는 평균 힘 */
        return { d: d, dt: dt, F: F };
      }
      function draw() {
        H.paper(ctx, W, cv.H);
        var c = calc(), gy = 290, top = 70, cushH = th * 8;
        H.text(ctx, "2.0 m 에서 떨어뜨린 달걀", 40, 34, { s: 14, w: "900" });
        ctx.strokeStyle = H.v("--mist"); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(110, top); ctx.lineTo(110, gy); ctx.stroke(); ctx.setLineDash([]);
        H.text(ctx, "2.0 m", 100, (top + gy) / 2, { s: 11.5, a: "right", c: H.v("--mist") });
        ctx.fillStyle = H.v(MAT[mat].c); ctx.globalAlpha = .55;
        ctx.fillRect(150, gy - cushH + squash * cushH * MAT[mat].k, 200, cushH - squash * cushH * MAT[mat].k); ctx.globalAlpha = 1;
        ctx.strokeStyle = H.v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(120, gy); ctx.lineTo(380, gy); ctx.stroke();
        H.text(ctx, MAT[mat].t + " " + th.toFixed(1) + " cm", 250, gy + 22, { s: 12, w: "800", a: "center", c: H.v("--mist") });
        var ey = top + fall * (gy - cushH - top - 14) + squash * cushH * MAT[mat].k;
        if (result === "break") H.text(ctx, "💥", 250, ey + 12, { s: 30, a: "center" });
        else H.text(ctx, "🥚", 250, ey + 12, { s: 30, a: "center" });
        var px = 470;
        H.text(ctx, "닿는 순간 속력", px, 80, { s: 12, w: "800", c: H.v("--mist") });
        H.text(ctx, vHit.toFixed(2) + " m/s", px + 150, 80, { s: 13, w: "900" });
        H.text(ctx, "충격량 (운동량 변화)", px, 110, { s: 12, w: "800", c: H.v("--mist") });
        H.text(ctx, dp.toFixed(3) + " N·s", px + 150, 110, { s: 13, w: "900", c: H.v("--teal-700") });
        H.text(ctx, "← 쿠션과 상관없음", px + 250, 110, { s: 11, c: H.v("--mist") });
        H.text(ctx, "멈추는 거리", px, 140, { s: 12, w: "800", c: H.v("--mist") });
        H.text(ctx, (c.d * 100).toFixed(1) + " cm", px + 150, 140, { s: 13, w: "900" });
        H.text(ctx, "멈추는 시간", px, 170, { s: 12, w: "800", c: H.v("--mist") });
        H.text(ctx, (c.dt * 1000).toFixed(1) + " ms", px + 150, 170, { s: 13, w: "900" });
        H.text(ctx, "평균 힘", px, 212, { s: 13, w: "800", c: H.v("--mist") });
        H.text(ctx, c.F.toFixed(1) + " N", px + 150, 214, { s: 22, w: "900", c: c.F <= 30 ? H.v("--green-700") : H.v("--rose-700") });
        H.text(ctx, "기준 30 N", px + 260, 214, { s: 11.5, c: H.v("--mist") });
        H.text(ctx, "평균 힘 = 충격량 ÷ 멈추는 시간 (+ 달걀 무게)", px, 250, { s: 11.5, c: H.v("--mist") });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "쿠션 재료", value: "news", options: [{ v: "news", t: "신문지 뭉치" }, { v: "cap", t: "에어캡" }, { v: "sponge", t: "스펀지" }],
        onPick: function (x) { mat = x; result = null; fall = 0; squash = 0; draw(); } });
      api.slider({ label: "쿠션 두께", min: 0.5, max: 15, step: 0.5, value: 3, fmt: function (x) { return x.toFixed(1) + " cm"; },
        onInput: function (x) { th = x; result = null; fall = 0; squash = 0; draw(); } });
      api.button("▶ 떨어뜨리기", function () {
        result = null; squash = 0;
        run(50, 22, function (k) {
          if (k < 0.7) { fall = (k / 0.7) * (k / 0.7); squash = 0; }
          else { fall = 1; squash = (k - 0.7) / 0.3; }
          if (k >= 1) result = calc().F <= 30 ? "ok" : "break";
          draw();
        });
      });
      api.info("같은 두께라도 재료마다 <b>얼마나 깊이 눌리며 멈추는지</b>가 다릅니다. 두께 제한 6 cm 를 기억하세요.");
      draw();
      return {
        judge: function () {
          var c = calc();
          if (th > 6) return { ok: false, msg: "두께 " + th.toFixed(1) + " cm — 규칙(6 cm 이하)을 넘었습니다." };
          if (c.F <= 30) return { ok: true, msg: MAT[mat].t + " " + th.toFixed(1) + " cm · 멈추는 시간 " + (c.dt * 1000).toFixed(1) + " ms · 평균 힘 " + c.F.toFixed(1) + " N — 달걀이 무사합니다." };
          return { ok: false, msg: "평균 힘 " + c.F.toFixed(1) + " N — 달걀이 깨집니다." };
        }
      };
    },
    hints: [
      "쿠션이 있든 없든 달걀은 약 6.3 m/s 로 닿아 멈춥니다. <b>충격량(운동량 변화)은 같아요.</b> 바꿀 수 있는 것은 멈추는 데 걸리는 <b>시간</b>뿐입니다.",
      "평균 힘 = 충격량 ÷ 시간. 시간을 늘리려면 달걀이 <b>더 긴 거리를 눌리며</b> 멈춰야 합니다. 같은 두께에서 가장 깊이 눌리는 재료는 무엇이었나요?"
    ],
    solution: "<b>스펀지</b>를 고르고 두께를 <b>5.0 ~ 6.0 cm</b> 로 두세요. 약 4 cm 를 눌리며 멈추면 시간이 약 13 ms 가 되어 평균 힘이 30 N 아래로 내려갑니다.",
    why: "쿠션을 무엇으로 바꾸든 <b>충격량 = 운동량 변화 = 0.060 kg × 6.26 m/s ≈ 0.38 N·s</b> 는 같습니다. 쿠션은 충격량을 줄이는 것이 아니라 <b>같은 충격량을 더 긴 시간에 나눠</b> 받게 해 평균 힘(= 충격량 ÷ 시간)을 줄입니다.<br>" +
      "그래서 두께가 같아도 깊이 눌리는 재료일수록 유리합니다. 야구공을 받을 때 손을 뒤로 빼는 것, 자동차 앞부분이 찌그러지게 만든 것과 <b>같은 원리</b>이지요. " +
      "※ 이 화면은 달걀이 고르게 느려진다고 본 단순한 모형이고, 30 N 은 모형 속 기준값입니다."
  }
  ]
});
})();
