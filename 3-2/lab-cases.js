/* 통합과학1 Ⅲ-2 역학 시스템 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";
/* ---- 밝은 스튜디오 + 입체 미니어처 (../assets/kit.js 의 K.studio · K.card) ---- */
var K = window.sthKit, LT = K.LT;
function lt(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function sideCard(ctx, x, W, H, title) { K.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
function tag(ctx, s, x, y, c, a) { return K.pill(ctx, s, x, y, { s: 11.5, a: a, c: c || LT.ink, bg: "rgba(255,255,255,.9)", line: "rgba(20,40,90,.18)" }); }
function floorSh(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function metalG(ctx, x0, y0, x1, y1) { var g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, "#f6f8fb"); g.addColorStop(.5, "#aab3c3"); g.addColorStop(1, "#5b6476"); return g; }
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * .55); ctx.lineTo(x + w + d, y - d * .55); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * .55); ctx.lineTo(x + w + d, y + h - d * .55); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
function box3(ctx, x, y, w, h, d, col) {
  if (h < .5) return;
  ctx.fillStyle = K.tint(col, 1.18); ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + d, y - h - d * .55); ctx.lineTo(x + w + d, y - h - d * .55); ctx.lineTo(x + w, y - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = K.tint(col, .72); ctx.beginPath(); ctx.moveTo(x + w, y - h); ctx.lineTo(x + w + d, y - h - d * .55); ctx.lineTo(x + w + d, y - d * .55); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  var g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, K.tint(col, 1.02)); g.addColorStop(1, K.tint(col, .85)); ctx.fillStyle = g; ctx.fillRect(x, y - h, w, h);
}
var G = 9.8;

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 자유 낙하 거꾸로 */
  {
    id: "c1", about: "01", tag: "자유 낙하", title: "미지의 행성에서 온 영상", short: "미지의 행성",
    who: "🛰️", name: "탐사선 관제실",
    say: "“탐사선 로봇팔이 <b>1.50 m</b> 높이에서 시료 캡슐을 놓았습니다. 영상으로 재 보니 바닥에 닿기까지 <b>0.90초</b>. 이곳의 중력 가속도를 알아내 주세요. 착륙 지점 기록이 지워져서, 이 영상이 유일한 단서입니다.”",
    predict: {
      q: "지구에서라면 1.50 m를 떨어지는 데 약 0.55초면 됩니다. 이 행성의 중력 가속도 g는 지구(9.8 m/s²)보다?",
      options: ["㉠ 크다", "㉡ 같다", "㉢ 작다"], answer: 2
    },
    task: "중력 가속도 슬라이더를 움직여 <b>내 시뮬레이션의 낙하 시간이 영상과 같아지게</b>(0.90 ± 0.015초) 만드세요. 캡슐 질량 슬라이더도 바꿔 보세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var g = 9.8, m = 1.0, h = 1.5, T_REC = 0.90, tNow = 0, running = false, touched = false;
      var run = api.ticker();
      function tFall(gg) { return Math.sqrt(2 * h / gg); }
      function draw() {
        /* 입체 미니어처: 미지의 행성 바닥 블록 위의 낙하 받침대 두 개(영상 기록 · 내 시뮬레이션), 같은 시간 간격 잔상 */
        var CH = cv.H, LW = 600, top = 80, bot = 270, i;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, null);
        floorSh(ctx, 330, bot + 34, 270, 22, .28);
        slab(ctx, 110, bot, 440, 24, 40, "#b8a6d9", "#7b68a6", "#5f4f86");
        [[270, "영상 (실제 기록)", T_REC, "#e8590c", "#ffb38a"], [470, "내 시뮬레이션", tFall(g), "#1c7ed6", "#74c0fc"]].forEach(function (col) {
          var x = col[0], T = col[2], k = Math.min(tNow, T) / T, rr = 11 + m * 1.6;
          ctx.fillStyle = metalG(ctx, x - 70, 0, x - 58, 0); ctx.fillRect(x - 72, top - 30, 10, bot - top + 30);
          ctx.fillStyle = "#5b6476"; ctx.fillRect(x - 72, top - 34, 82, 7);
          for (i = 1; i < 5; i++) { var ti = Math.min(tNow, T) * i / 5, ki = ti / T; if (ti <= 0) continue; ctx.globalAlpha = .22; K.planet(ctx, x, top + ki * ki * (bot - top - rr), rr, col[4], col[3]); ctx.globalAlpha = 1; }
          var y = top + k * k * (bot - top - rr);
          floorSh(ctx, x + 3, bot - 8, rr * 1.4, 4, .3);
          K.planet(ctx, x, y, rr, col[4], col[3]);
          tag(ctx, col[1], x, top - 46, col[3], "center");
          lt(ctx, (tNow >= T ? "착지 " : "") + Math.min(tNow, T).toFixed(2) + " s", x, bot + 52, { s: 13, w: "900", a: "center", c: col[3] });
        });
        K.line(ctx, { x: 120, y: top }, { x: 120, y: bot }, "rgba(20,40,90,.45)", 1.2, [4, 4]);
        lt(ctx, "1.50 m", 112, (top + bot) / 2, { s: 11.5, a: "right", c: LT.mute });
        var d = tFall(g) - T_REC, ok = Math.abs(d) <= .015;
        K.bigText(ctx, "g = " + g.toFixed(2) + " m/s²", 18, 44, 24, ok ? "#8ff0c4" : "#ffffff");
        var cd = sideCard(ctx, LW + 10, W, CH, "같은 1.50 m에서 동시에 놓기");
        K.row(ctx, "영상 기록 낙하 시간", T_REC.toFixed(3) + " s", cd.px, cd.R, 62, LT.orange);
        K.row(ctx, "내 시뮬레이션", tFall(g).toFixed(3) + " s", cd.px, cd.R, 88, LT.blue);
        K.bar(ctx, cd.px, 98, cd.w, tFall(g) / 1.8, LT.blue);
        K.row(ctx, "캡슐 질량", m.toFixed(1) + " kg", cd.px, cd.R, 136);
        K.tip(ctx, ok ? "영상과 같습니다" : (d > 0 ? "영상보다 느리게 떨어짐" : "영상보다 빨리 떨어짐"), cd.px - 4, 154, cd.w + 8, ok ? true : null);
        lt(ctx, "t = √(2h / g)", cd.px, 222, { s: 13, w: "900", c: LT.violet });
        lt(ctx, "질량은 식에 없습니다", cd.px, 244, { s: 11.5, c: LT.mute });
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
      api.info("두 캡슐을 같은 순간에 놓습니다. 먼저 닿는 쪽을 보고 g를 어느 쪽으로 옮길지 정하세요.");
      draw();
      return {
        judge: function () {
          var t = tFall(g);
          if (Math.abs(t - T_REC) <= 0.015) return { ok: true, msg: "g ≈ " + g.toFixed(2) + " m/s²에서 낙하 시간 " + t.toFixed(3) + " s — 영상과 같습니다." + (touched ? " 캡슐 질량을 바꿔도 시간은 그대로였지요." : "") };
          return { ok: false, msg: "지금 낙하 시간 " + t.toFixed(3) + " s (목표 0.90 s) — " + (t > T_REC ? "너무 느립니다." : "너무 빠릅니다.") };
        }
      };
    },
    hints: [
      "영상 속 캡슐은 지구보다 <b>오래</b> 걸려 떨어집니다. 오래 걸린다는 것은 아래로 당기는 가속이 약하다는 뜻입니다. g를 어느 쪽으로 옮겨야 할까요?",
      "h = ½ g t²를 g에 대해 풀면 g = 2h ÷ t²입니다. h = 1.50 m, t = 0.90 s를 넣어 보세요."
    ],
    solution: "g = 2 × 1.50 ÷ 0.90² ≈ <b>3.70 m/s²</b>. 슬라이더를 3.60~3.80 사이에 두고 판정하세요.",
    why: "떨어지는 데 걸리는 시간은 <b>t = √(2h / g)</b> — 높이와 <b>g</b> 만으로 정해지고, 질량은 식에 없습니다. 진공 통에서 깃털과 쇠공이 함께 떨어진 것과 같은 까닭입니다.<br>" +
      "이 관계를 거꾸로 쓰면 <b>시간을 재서 g를 알아낼 수 있습니다.</b> 3.7 m/s²는 화성(3.71)과 수성(3.70)의 값인데, 영상 속 붉은 모래를 보면 화성일 것입니다. 같은 식을 앞으로도 뒤로도 쓸 수 있을 때 개념을 제대로 가진 것입니다."
  },

  /* ------------------------------------------------------------------ 2. 알짜힘 · 겉보기 무게 */
  {
    id: "c2", about: "02", tag: "뉴턴 운동 법칙", title: "화물 드론의 줄", short: "드론 줄",
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
        /* 입체 미니어처: 프로펠러 넷 달린 화물 드론, 줄에 매달린 20 kg 상자, 장력·무게 화살표. 오른쪽 카드에 장력 계기 */
        var CH = cv.H, LW = 560, cx = 250, dy = 92 - Math.min(y * 26, 48), by = dy + 150, i;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, null);
        floorSh(ctx, cx + 10, 318, 150, 14, .25);
        slab(ctx, 60, 318, 400, 14, 24, "#c9cfd8", "#9aa3b0", "#7d8698");
        var boxY = snapped ? Math.min(296, by + 40) : by;
        if (!snapped) { ctx.strokeStyle = "#5b4636"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx + 8, dy + 14); ctx.lineTo(cx + 8, boxY - 30); ctx.stroke(); }
        else { ctx.strokeStyle = "#5b4636"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx + 8, dy + 14); ctx.lineTo(cx + 2, dy + 50); ctx.stroke(); }
        /* 드론 */
        box3(ctx, cx - 40, dy + 14, 80, 18, 18, "#3b4252");
        [[-62, -6], [62, -6], [-44, -22], [80, -22]].forEach(function (p) {
          ctx.strokeStyle = "#5b6476"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 8, dy + 2); ctx.lineTo(cx + p[0], dy + p[1] + 6); ctx.stroke();
          ctx.fillStyle = "rgba(160,180,210,.55)"; ctx.beginPath(); ctx.ellipse(cx + p[0], dy + p[1], 26, 7, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "#2b2f3a"; ctx.beginPath(); ctx.arc(cx + p[0], dy + p[1], 3, 0, 6.2832); ctx.fill();
        });
        K.glow(ctx, cx + 30, dy + 8, 2, "rgba(80,255,160,.95)", 3);
        /* 상자 */
        box3(ctx, cx - 26, boxY + 26, 56, 52, 18, "#d9a441");
        lt(ctx, "20 kg", cx + 2, boxY + 5, { s: 12, w: "900", a: "center", c: "#4a3200" });
        if (!snapped) {
          var sc = .42;
          K.arrow(ctx, { x: cx + 74, y: boxY }, { x: cx + 74, y: boxY - T() * sc }, LT.blue, 5, 13);
          tag(ctx, "장력 " + T().toFixed(0) + " N", cx + 84, boxY - T() * sc + 10, LT.blue);
          K.arrow(ctx, { x: cx - 46, y: boxY }, { x: cx - 46, y: boxY + M * G * sc }, LT.orange, 5, 13);
          tag(ctx, "무게 196 N", cx - 56, boxY + M * G * sc - 2, LT.orange, "right");
        } else K.bigText(ctx, "줄이 끊어졌다!", 300, 300, 20, "#ff9db0");
        K.bigText(ctx, "장력 " + T().toFixed(0) + " N", 18, 44, 24, T() > 250 ? "#ff9db0" : (T() >= 240 ? "#8ff0c4" : "#ffffff"));
        K.bigText(ctx, "가속도 " + (a >= 0 ? "+" : "") + a.toFixed(1) + " m/s²", 18, 72, 16, "#ffd35a");
        /* 오른쪽 카드: 장력 계기(입체 기둥) */
        var cd = sideCard(ctx, LW + 10, W, CH, "줄의 장력");
        var gx = cd.px + 10, gy0 = 60, gy1 = 280, gh = gy1 - gy0;
        function GY(t) { return gy1 - Math.max(0, Math.min(t, 320)) / 320 * gh; }
        ctx.fillStyle = "#e3e9f1"; ctx.fillRect(gx, gy0, 40, gh);
        box3(ctx, gx, gy1, 40, gy1 - GY(T()), 12, T() > 250 ? "#e03131" : (T() >= 240 ? "#0f9f76" : "#1c7ed6"));
        K.line(ctx, { x: gx - 8, y: GY(250) }, { x: gx + 56, y: GY(250) }, LT.red, 3);
        lt(ctx, "250 N 끊어짐", gx + 62, GY(250) + 4, { s: 11.5, w: "800", c: LT.red });
        K.line(ctx, { x: gx - 8, y: GY(196) }, { x: gx + 56, y: GY(196) }, LT.orange, 2, [4, 4]);
        lt(ctx, "무게 196 N", gx + 62, GY(196) + 4, { s: 11.5, w: "800", c: LT.orange });
        lt(ctx, a > 0 ? "위로 빨라지는 중" : (a < 0 ? "위로 가며 느려지는 중" : "일정한 속력"), gx + 62, 274, { s: 11.5, c: LT.mute });
        lt(ctx, "T = m(g + a)", gx + 62, 250, { s: 13, w: "900", c: LT.violet });
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
      "짐이 위로 <b>빨라지려면</b> 위로 끄는 힘이 아래로 당기는 무게보다 커야 합니다. 두 힘의 차가 알짜힘입니다.",
      "알짜힘 = 장력 − 무게 = 질량 × 가속도. 장력 250 N, 무게 196 N, 질량 20 kg을 넣으면 가속도는?"
    ],
    solution: "a = (250 − 196) ÷ 20 = <b>2.7 m/s²</b>. 가속도를 +2.2 ~ +2.7 m/s² 사이에 두고 판정하세요.",
    why: "짐에는 위로 <b>장력</b>, 아래로 <b>무게</b>가 작용합니다. 알짜힘 = 장력 − 무게 = ma이므로 <b>장력 = m(g + a)</b>.<br>" +
      "위로 가속할 때(a > 0) 장력은 무게보다 크고, 속력이 일정할 때(a = 0)에야 무게와 같으며, 위로 가며 느려질 때(a < 0)는 무게보다 작습니다. " +
      "엘리베이터 저울 눈금이 오르내린 것과 <b>같은 원리</b>입니다 — 이번에는 저울 대신 줄이 그 힘을 받았을 뿐입니다. 크레인이 짐을 천천히 들어 올리기 시작하는 까닭이 여기에 있습니다."
  },

  /* ------------------------------------------------------------------ 3. 충격량 */
  {
    id: "c3", about: "03", tag: "충격량과 운동량", title: "달걀 낙하 대회", short: "달걀 낙하",
    who: "🥚", name: "과학 동아리 부장",
    say: "“올해 규칙: <b>60 g</b> 달걀을 <b>2.0 m</b>에서 떨어뜨리고, 바닥 쿠션 <b>두께는 6 cm 이하</b>. 재료는 신문지 뭉치, 에어캡(뽁뽁이), 스펀지 중 하나. 이 모형에서는 달걀이 멈추는 동안 받는 평균 힘이 <b>30 N</b>을 넘으면 깨진다고 봅니다.”",
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
        /* 입체 미니어처: 바닥 블록 위 쿠션(재료별 색·두께), 2.0 m에서 떨어지는 달걀(입체 타원), 눌리는 쿠션 */
        var c = calc(), CH = cv.H, LW = 470, gy = 290, top = 70, cushH = th * 8, i;
        var MC = { news: ["#e9ecef", "#adb5bd"], cap: ["#d0ebff", "#74c0fc"], sponge: ["#ffe066", "#f59f00"] }[mat];
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, null);
        floorSh(ctx, 260, gy + 22, 200, 16, .25);
        slab(ctx, 80, gy, 330, 16, 30, "#c9cfd8", "#9aa3b0", "#7d8698");
        var sq = squash * cushH * MAT[mat].k, ch2 = Math.max(2, cushH - sq);
        box3(ctx, 150, gy - 2, 200, ch2, 24, MC[1]);
        if (mat === "cap") { ctx.fillStyle = "rgba(255,255,255,.7)"; for (i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(160 + i * 16, gy - 2 - ch2 / 2, Math.min(5, ch2 / 3), 0, 6.2832); ctx.fill(); } }
        K.line(ctx, { x: 110, y: top }, { x: 110, y: gy }, "rgba(20,40,90,.45)", 1.2, [4, 4]);
        lt(ctx, "2.0 m", 100, (top + gy) / 2, { s: 11.5, a: "right", c: LT.mute });
        var ey = top + fall * (gy - cushH - top - 14) + sq;
        if (result === "break") {
          ctx.fillStyle = "#fff3bf"; ctx.beginPath(); ctx.ellipse(262, gy - ch2 - 4, 30, 6, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "#ffa94d"; ctx.beginPath(); ctx.arc(262, gy - ch2 - 6, 7, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "#f8f0e3"; ctx.beginPath(); ctx.moveTo(236, gy - ch2 - 4); ctx.lineTo(244, gy - ch2 - 18); ctx.lineTo(250, gy - ch2 - 6); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(276, gy - ch2 - 4); ctx.lineTo(286, gy - ch2 - 16); ctx.lineTo(290, gy - ch2 - 4); ctx.closePath(); ctx.fill();
        } else {
          floorSh(ctx, 262, gy - ch2 - 2, 16, 4, .25 * fall);
          var eg = ctx.createRadialGradient(256, ey - 6, 2, 262, ey, 18); eg.addColorStop(0, "#ffffff"); eg.addColorStop(.6, "#f4e7d2"); eg.addColorStop(1, "#c9b08a");
          ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(262, ey, 12, 16, 0, 0, 6.2832); ctx.fill();
        }
        tag(ctx, MAT[mat].t + " " + th.toFixed(1) + " cm", 250, gy + 32, LT.ink, "center");
        K.bigText(ctx, c.F.toFixed(1) + " N", 18, 44, 26, c.F <= 30 ? "#8ff0c4" : "#ff9db0");
        K.bigText(ctx, "멈추는 시간 " + (c.dt * 1000).toFixed(1) + " ms", 18, 72, 16, "#ffd35a");
        var cd = sideCard(ctx, LW + 10, W, CH, "달걀이 받는 힘");
        K.row(ctx, "닿는 순간 속력", vHit.toFixed(2) + " m/s", cd.px, cd.R, 62);
        K.row(ctx, "충격량 (쿠션과 상관없음)", dp.toFixed(3) + " N·s", cd.px, cd.R, 88, LT.teal);
        K.row(ctx, "멈추는 거리", (c.d * 100).toFixed(1) + " cm", cd.px, cd.R, 114);
        K.row(ctx, "멈추는 시간", (c.dt * 1000).toFixed(1) + " ms", cd.px, cd.R, 140, LT.blue);
        K.row(ctx, "평균 힘 (기준 30 N)", c.F.toFixed(1) + " N", cd.px, cd.R, 166, c.F <= 30 ? LT.green : LT.red);
        K.bar(ctx, cd.px, 176, cd.w, c.F / 120, c.F <= 30 ? LT.green : LT.red);
        K.tip(ctx, c.F <= 30 ? "30 N 이하 — 달걀이 무사" : "아직 힘이 큽니다 — 멈추는 시간을 늘리기", cd.px - 4, 198, cd.w + 8, c.F <= 30 ? true : null);
        lt(ctx, "평균 힘 = 충격량 ÷ 멈추는 시간 (+ 달걀 무게)", cd.px, 262, { s: 11, c: LT.mute });
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
      api.info("같은 두께라도 재료마다 <b>얼마나 깊이 눌리며 멈추는지</b>가 다릅니다. 두께 제한 6 cm를 기억하세요.");
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
      "쿠션이 있든 없든 달걀은 약 6.3 m/s로 닿아 멈춥니다. <b>충격량(운동량 변화)은 같습니다.</b> 바꿀 수 있는 것은 멈추는 데 걸리는 <b>시간</b>뿐입니다.",
      "평균 힘 = 충격량 ÷ 시간. 시간을 늘리려면 달걀이 <b>더 긴 거리를 눌리며</b> 멈춰야 합니다. 같은 두께에서 가장 깊이 눌리는 재료는 무엇이었나요?"
    ],
    solution: "<b>스펀지</b>를 고르고 두께를 <b>5.0~6.0 cm</b>로 두세요. 약 4 cm를 눌리며 멈추면 시간이 약 13 ms가 되어 평균 힘이 30 N 아래로 내려갑니다.",
    why: "쿠션을 무엇으로 바꾸든 <b>충격량 = 운동량 변화 = 0.060 kg × 6.26 m/s ≈ 0.38 N·s</b>는 같습니다. 쿠션은 충격량을 줄이는 것이 아니라 <b>같은 충격량을 더 긴 시간에 나눠</b> 받게 해 평균 힘(= 충격량 ÷ 시간)을 줄입니다.<br>" +
      "그래서 두께가 같아도 깊이 눌리는 재료일수록 유리합니다. 야구공을 받을 때 손을 뒤로 빼는 것, 자동차 앞부분이 찌그러지게 만든 것과 <b>같은 원리</b>입니다. " +
      "※ 이 화면은 달걀이 고르게 느려진다고 본 단순한 모형이고, 30 N은 모형 속 기준값입니다."
  }
  ]
});
})();
