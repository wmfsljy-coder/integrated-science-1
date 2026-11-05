/* 통합과학1 Ⅲ-3 생명 시스템 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";
var K = window.sthKit, LT = K.LT;          /* 밝은 스튜디오 + 입체 미니어처 (STUDIO_GUIDE) */
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

/* 표준 유전 암호 (U C A G 순) */
var AA1 = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
var AA3 = { F: "Phe", L: "Leu", S: "Ser", Y: "Tyr", "*": "종결", C: "Cys", W: "Trp", P: "Pro", H: "His", Q: "Gln", R: "Arg", I: "Ile", M: "Met",
  T: "Thr", N: "Asn", K: "Lys", V: "Val", A: "Ala", D: "Asp", E: "Glu", G: "Gly" };
function codon(c) { var k = "UCAG"; return AA1.charAt(16 * k.indexOf(c[0]) + 4 * k.indexOf(c[1]) + k.indexOf(c[2])); }
var MRNA = "GCAUGUUCGUUAAUCAACACUUGUGCGGCUAAG";
var TARGET = ["Met", "Phe", "Val", "Asn", "Gln", "His", "Leu", "Cys", "Gly"];

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 효소와 변성 */
  {
    id: "c1", about: "01", tag: "효소 · 변성", title: "파인애플 젤리가 안 굳어요", short: "파인애플 젤리",
    who: "🍍", name: "디저트 카페 사장님",
    say: "“생파인애플을 넣은 젤리만 끝내 안 굳어요. 딸기 젤리는 잘 굳는데 말이죠. 통조림 파인애플을 넣으면 또 굳는다네요. 생파인애플을 살짝 익혀서 쓰고 싶은데, 맛이 변하지 않게 <b>되도록 낮은 온도</b>로만 익히고 싶어요. (가열 시간은 5분)”",
    predict: {
      q: "생파인애플을 넣은 젤리가 굳지 않는 까닭은?",
      options: ["㉠ 파인애플이 산성이라서", "㉡ 파인애플 속 효소가 젤라틴(단백질)을 잘라서", "㉢ 파인애플에 당분이 많아서"], answer: 1
    },
    task: "과일을 고르고 가열 온도를 정해, <b>파인애플 젤리가 굳는 가장 낮은 온도</b>(최저 온도에서 4 ℃ 이내)를 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var FRUIT = { pine: { t: "파인애플", prot: true, c: "--amber" }, kiwi: { t: "키위", prot: true, c: "--green" }, straw: { t: "딸기", prot: false, c: "--rose" } };
      var fr = "pine", T = 20;
      function left() { return FRUIT[fr].prot ? 1 / (1 + Math.exp((T - 62) / 3)) : 0; }   /* 5분 가열 뒤 남은 단백질 분해 효소 활성 */
      function sets() { return left() < 0.1; }
      function draw() {
        H.paper(ctx, W, cv.H);
        var f = left(), st = sets(), fc = { pine: "#fcc419", kiwi: "#82c91e", straw: "#ff6b6b" }[fr];
        K.bigText(ctx, "남은 효소 활성 " + (f * 100).toFixed(0) + " %", 18, 34, 22, st ? "#8ff0c8" : "#ffb0b0");
        K.t(ctx, FRUIT[fr].t + "를 " + T + " ℃에서 5분 익힌 뒤 젤라틴에 넣었다", 18, 58, { s: 12, w: "800", c: LT.mute });
        /* 냄비와 가열판 */
        ctx.fillStyle = "rgba(20,30,50,.2)"; ctx.beginPath(); ctx.ellipse(110, 272, 80, 12, 0, 0, 6.2832); ctx.fill();
        var hp = ctx.createLinearGradient(40, 0, 180, 0); hp.addColorStop(0, "#495057"); hp.addColorStop(.5, "#868e96"); hp.addColorStop(1, "#343a40");
        ctx.fillStyle = hp; ctx.fillRect(40, 248, 140, 18); ctx.fillStyle = T > 40 ? "rgba(255,80,40," + clamp((T - 40) / 60, 0, 1) * .8 + ")" : "#adb5bd"; ctx.beginPath(); ctx.ellipse(110, 248, 54, 8, 0, 0, 6.2832); ctx.fill();
        var pg = ctx.createLinearGradient(56, 0, 164, 0); pg.addColorStop(0, "#adb5bd"); pg.addColorStop(.45, "#f1f3f5"); pg.addColorStop(1, "#868e96");
        ctx.fillStyle = pg; ctx.fillRect(56, 172, 108, 72); ctx.beginPath(); ctx.ellipse(110, 244, 54, 9, 0, 0, Math.PI); ctx.fill();
        ctx.fillStyle = "#4dabf7"; ctx.beginPath(); ctx.ellipse(110, 178, 52, 8, 0, 0, 6.2832); ctx.fill();
        for (var k = 0; k < 5; k++) K.planet(ctx, 82 + k * 13, 177 + (k % 2) * 2, 6, fc, K.tint(fc, .55));
        if (T > 60) for (k = 0; k < 4; k++) { ctx.strokeStyle = "rgba(140,150,170,.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(84 + k * 16, 166); ctx.bezierCurveTo(78 + k * 16, 150, 92 + k * 16, 140, 86 + k * 16, 124); ctx.stroke(); }
        K.pill(ctx, T + " ℃ · 5분", 110, 112, { s: 12, a: "center", c: "#ffe8cc" });
        /* 젤리 컵 */
        var cx = 300, top = st ? 176 : 214;
        ctx.fillStyle = "rgba(20,30,50,.2)"; ctx.beginPath(); ctx.ellipse(cx + 6, 276, 70, 10, 0, 0, 6.2832); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.moveTo(cx - 70, 150); ctx.lineTo(cx + 70, 150); ctx.lineTo(cx + 50, 270); ctx.lineTo(cx - 50, 270); ctx.closePath(); ctx.clip();
        var jg = ctx.createLinearGradient(0, top, 0, 270); jg.addColorStop(0, K.tint(fc, st ? 1.1 : 1.2)); jg.addColorStop(1, K.tint(fc, .75));
        ctx.globalAlpha = st ? .9 : .55; ctx.fillStyle = jg; ctx.fillRect(cx - 80, top, 160, 120); ctx.globalAlpha = 1;
        if (st) { ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(cx - 62, top, 124, 4); }
        else { ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.2; for (k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(cx - 20 + k * 22, top + 3, 10, 2, 0, 0, 6.2832); ctx.stroke(); } }
        for (k = 0; k < 6; k++) { var fy = st ? 196 + (k % 3) * 22 : 248 + (k % 2) * 8; ctx.fillStyle = K.tint(fc, .9); ctx.fillRect(cx - 40 + k * 14, fy, 10, 10); ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fillRect(cx - 40 + k * 14, fy, 10, 2); }
        ctx.restore();
        var gl = ctx.createLinearGradient(cx - 70, 0, cx + 70, 0); gl.addColorStop(0, "rgba(255,255,255,.55)"); gl.addColorStop(.25, "rgba(255,255,255,.05)"); gl.addColorStop(1, "rgba(255,255,255,.3)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.moveTo(cx - 70, 150); ctx.lineTo(cx + 70, 150); ctx.lineTo(cx + 50, 270); ctx.lineTo(cx - 50, 270); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(80,100,130,.55)"; ctx.lineWidth = 1.5; ctx.stroke();
        K.pill(ctx, st ? "탱글탱글 — 굳었다" : "흐물흐물 — 안 굳는다", cx, 132, { s: 12.5, a: "center", c: st ? "#d3f9d8" : "#ffd0d0" });
        /* 확대: 젤라틴(단백질) 사슬과 단백질 분해 효소 */
        var zx = 482, zy = 196, zr = 74;
        var rg = ctx.createRadialGradient(zx, zy, 8, zx, zy, zr); rg.addColorStop(0, "#ffffff"); rg.addColorStop(1, "#e7ecf3");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(zx, zy, zr, 0, 6.2832); ctx.fill(); ctx.strokeStyle = "#343a40"; ctx.lineWidth = 4; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(zx, zy, zr - 2, 0, 6.2832); ctx.clip();
        for (var i = 0; i < 5; i++) {
          var y = zy - 44 + i * 22, cut = f > 0.1 && (i % 2 === 0);
          for (var j = 0; j < 9; j++) { var bx = zx - 64 + j * 16 + (cut && j >= 5 ? 8 : 0); if (j && !(cut && j === 5)) { ctx.strokeStyle = "#9775fa"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(bx - 16, y); ctx.lineTo(bx, y); ctx.stroke(); } K.planet(ctx, bx, y, 4.5, "#b197fc", "#5f3dc4"); }
          if (cut) { K.planet(ctx, zx + 6, y - 6, 7, fc, K.tint(fc, .45)); K.planet(ctx, zx + 11, y - 2, 5, fc, K.tint(fc, .45)); }
        }
        ctx.restore();
        K.t(ctx, "🔍 젤라틴 사슬" + (f > 0.1 ? " — 효소가 자름" : " — 이어진 그물"), zx, zy + zr + 18, { s: 11, w: "800", a: "center", c: f > 0.1 ? LT.red : LT.green });
        /* 판정 카드 */
        var p0 = 616, p1 = 870;
        K.card(ctx, 598, 14, 288, cv.H - 28, "판정");
        K.t(ctx, st ? "젤리가 굳는다" : "젤리가 안 굳는다", p0, 70, { s: 19, w: "900", c: st ? LT.green : LT.red });
        K.row(ctx, "과일 속 단백질 분해 효소", FRUIT[fr].prot ? "있음" : "거의 없음", p0, p1, 108);
        K.row(ctx, "가열 뒤 남은 효소 활성", (f * 100).toFixed(0) + " %", p0, p1, 136, f < 0.1 ? LT.green : LT.red);
        K.bar(ctx, p0, 146, p1 - p0, f, f < 0.1 ? LT.green : LT.red);
        K.tip(ctx, "활성이 10 % 아래면 젤라틴이 굳습니다", p0 - 4, 176, p1 - p0 + 8, st);
        K.t(ctx, "효소도 단백질 — 뜨거우면 변성", p0, 240, { s: 11, w: "700", c: LT.mute });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "과일", value: "pine", options: Object.keys(FRUIT).map(function (k) { return { v: k, t: FRUIT[k].t }; }), onPick: function (x) { fr = x; draw(); } });
      api.slider({ label: "가열 온도 (5분)", min: 20, max: 100, step: 2, value: 20, fmt: function (x) { return x + " ℃"; }, onInput: function (x) { T = x; draw(); } });
      api.info("보라색 줄이 젤라틴 단백질 사슬입니다. 잘린 사슬은 그물을 만들지 못해 젤리가 굳지 않습니다.");
      draw();
      return {
        judge: function () {
          if (fr !== "pine") return { ok: false, msg: "과제는 파인애플입니다. " + FRUIT[fr].t + (FRUIT[fr].prot ? "도 같은 까닭으로 익혀야 합니다." : "는 익히지 않아도 젤리가 굳습니다.") };
          if (sets() && T <= 74) return { ok: true, msg: T + " ℃에서 5분 — 효소 활성 " + (left() * 100).toFixed(0) + " %, 젤리가 굳습니다." };
          if (sets()) return { ok: false, msg: "굳기는 하지만, 더 낮은 온도로도 됩니다." };
          return { ok: false, msg: T + " ℃ 로는 효소가 " + (left() * 100).toFixed(0) + " % 남아 젤라틴을 자릅니다." };
        }
      };
    },
    hints: [
      "파인애플에는 <b>단백질을 자르는 효소</b>가 있고, 젤라틴은 단백질입니다. 효소도 단백질이라 뜨거우면 모양이 망가지지요(변성).",
      "온도를 2 ℃씩 올리며 ‘남은 효소 활성’이 10 % 아래로 처음 떨어지는 온도를 찾으세요."
    ],
    solution: "파인애플, <b>70~74 ℃</b>. 약 69 ℃를 넘으면 효소가 변성되어 젤리가 굳습니다.",
    why: "파인애플에는 <b>브로멜라인</b>이라는 단백질 분해 효소가 있어 젤라틴(단백질) 사슬을 잘라 버립니다. 키위도 같은 까닭으로 젤리를 망치지만, 딸기는 그런 효소가 없어 괜찮습니다 — 효소는 <b>짝이 맞는 기질에만</b> 작용합니다.<br>" +
      "효소도 단백질이라 높은 온도에서 입체 구조가 풀리면(<b>변성</b>) 다시 식혀도 돌아오지 않습니다. 통조림 파인애플이 젤리에 괜찮은 것은 만들 때 가열했기 때문입니다. 김치가 익지 않던 이야기의 ‘끓였다 식힌 국물’과 같은 원리입니다."
  },

  /* ------------------------------------------------------------------ 2. 세포 호흡 */
  {
    id: "c2", about: "02", tag: "물질대사 · 세포 호흡", title: "숨차지 않게 달리기", short: "유산소 달리기",
    who: "🏃", name: "육상부 코치",
    say: "“몸무게 <b>60 kg</b> 인 선수가 1 km를 달릴 때마다 대략 <b>60 kcal</b>를 씁니다. 세포 호흡에서 산소 1 L를 쓸 때 약 <b>5 kcal</b>가 나오고요. 이 선수가 1분에 받아들일 수 있는 산소는 최대 <b>3.0 L</b>. 숨이 차지 않게(산소로만) 달릴 수 있는 가장 빠른 속력은?”",
    predict: {
      q: "포도당을 세포 호흡으로 쓸 때, 들이마신 산소와 내쉬는 이산화 탄소의 부피는?",
      options: ["㉠ 산소가 훨씬 많다", "㉡ 거의 같다", "㉢ 이산화 탄소가 훨씬 많다"], answer: 1
    },
    task: "달리는 속력을 조절해 <b>산소가 모자라지 않는 가장 빠른 속력</b>(0.5 km/h 이내)을 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var v = 8, VO2MAX = 3.0;
      function kcal() { return 60 * v / 60; }            /* 1 km 당 60 kcal → 분당 kcal = 속력(km/h) */
      function o2() { return kcal() / 5; }
      var TI = K.iso({ ox: 70, oy: 150, s: 0.8, L: 250, D: 90 }), tph = 0;
      function draw() {
        H.paper(ctx, W, cv.H);
        var need = o2(), over = need > VO2MAX + 1e-9, I = TI;
        K.bigText(ctx, "산소 " + need.toFixed(2) + " L/분", 18, 34, 22, over ? "#ffb0b0" : "#8ff0c8");
        /* 육상 트랙 블록: 앞면은 흙·고무 단면, 윗면은 붉은 트랙과 흰 줄 */
        var fc = I.P(I.L / 2, I.D / 2, 0);
        ctx.fillStyle = "rgba(20,30,50,.2)"; ctx.beginPath(); ctx.ellipse(fc.x + 10, fc.y + 30, 150, 22, 0, 0, 6.2832); ctx.fill();
        I.box(ctx, 0, 0, 0, I.L, I.D, 18, "#d9534f", "#8d6e4f", "#6f5640");
        ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.5;
        [22, 45, 68].forEach(function (y) { var a = I.P(0, y, 18), b = I.P(I.L, y, 18); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
        var px = 40 + ((v - 6) / 14) * 170;
        /* 달리는 사람과 바람결 */
        var p = I.P(px, 56, 18), sc = 2.2;
        for (var s2 = 0; s2 < 4; s2++) { var q1 = I.P(px - 18 - s2 * 10, 50 + s2 * 4, 30), q2 = I.P(px - 18 - s2 * 10 - 8 - v, 50 + s2 * 4, 30); ctx.strokeStyle = "rgba(28,126,214," + (.25 + v / 40).toFixed(2) + ")"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke(); }
        I.person(ctx, px, 56, 18, over ? "#e03131" : "#1c7ed6", 3.2);
        /* 숨: 산소 들어가고 이산화 탄소 나오기 */
        K.pill(ctx, over ? "숨이 차다 — 젖산이 쌓인다" : "산소로 충분 (유산소)", p.x, p.y - 44, { s: 12, a: "center", c: over ? "#ffd0d0" : "#d3f9d8", box: [0, 560] });
        /* 그래프: 속력에 따른 필요한 산소 */
        var g = K.chart(ctx, { x: 300, y: 50, w: 260, h: 244, pl: 42, pb: 34, pt: 10, pr: 10, x0: 6, x1: 20, y0: 0, y1: 4.5, xt: 7, yt: 3, light: true, xl: "속력 (km/h)", yl: "산소 (L/분)" });
        K.plot(ctx, g, [[6, 1.2], [20, 4]], LT.blue, { light: true, w: 2.6 });
        K.line(ctx, { x: g.L, y: g.Y(VO2MAX) }, { x: g.R, y: g.Y(VO2MAX) }, LT.red, 1.6, [6, 4]);
        K.t(ctx, "최대 3.0", g.L + 6, g.Y(VO2MAX) - 6, { s: 11, w: "800", c: LT.red });
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.X(v), g.Y(need), 6.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = over ? LT.red : LT.green; ctx.beginPath(); ctx.arc(g.X(v), g.Y(need), 4.5, 0, 6.2832); ctx.fill();
        /* 판정 카드 */
        var p0 = 594, p1 = 868;
        K.card(ctx, 576, 14, 310, cv.H - 28, "1분 동안");
        K.row(ctx, "쓰는 에너지", kcal().toFixed(1) + " kcal", p0, p1, 70);
        K.row(ctx, "들이마셔 쓰는 산소", need.toFixed(2) + " L", p0, p1, 102, over ? LT.red : LT.green);
        K.bar(ctx, p0, 112, p1 - p0, need / 4.5, over ? LT.red : LT.blue);
        K.row(ctx, "내쉬는 이산화 탄소", need.toFixed(2) + " L", p0, p1, 152, LT.orange);
        K.bar(ctx, p0, 162, p1 - p0, need / 4.5, LT.orange);
        K.t(ctx, "산소 6분자 → 이산화 탄소 6분자", p0, 202, { s: 11, w: "700", c: LT.mute });
        K.tip(ctx, over ? "산소 부족 — 최대 3.0 L 초과" : "산소로 충분 (유산소)", p0 - 4, 222, p1 - p0 + 8, !over);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "달리는 속력", min: 6, max: 20, step: 0.5, value: 8, fmt: function (x) { return x.toFixed(1) + " km/h"; }, onInput: function (x) { v = x; draw(); } });
      api.info("포도당 + 산소 → 이산화 탄소 + 물 + 에너지. 산소와 이산화 탄소 막대를 함께 보세요.");
      draw();
      return {
        judge: function () {
          var need = o2();
          if (need <= VO2MAX + 1e-9 && v >= 14.5) return { ok: true, msg: v.toFixed(1) + " km/h — 산소 " + need.toFixed(2) + " L/분, 이산화 탄소도 같은 부피를 내쉽니다." };
          if (need > VO2MAX + 1e-9) return { ok: false, msg: "산소가 분당 " + need.toFixed(2) + " L 필요 — 최대 3.0 L를 넘습니다." };
          return { ok: false, msg: "산소가 아직 남습니다. 더 빨리 달려도 됩니다." };
        }
      };
    },
    hints: [
      "속력(km/h) × 60 kcal ÷ 60분 = 분당 에너지. 그 에너지를 내려면 산소가 5 kcal 당 1 L 필요합니다.",
      "산소 3.0 L로 낼 수 있는 에너지는 3.0 × 5 = 15 kcal/분. 1분에 15 kcal를 쓰는 속력은?"
    ],
    solution: "<b>15 km/h</b>. 분당 15 kcal → 산소 3.0 L. (14.5 km/h도 합격)",
    why: "세포 호흡은 <b>포도당 + 산소 → 이산화 탄소 + 물 + 에너지(ATP)</b>입니다. 포도당 1분자에 산소 6분자가 쓰이고 이산화 탄소 6분자가 나오므로, 들이마신 산소와 내쉬는 이산화 탄소의 <b>부피가 거의 같습니다</b>.<br>" +
      "더 빨리 달리면 에너지가 더 필요하고, 그만큼 산소도 필요합니다. 몸이 받아들일 수 있는 산소에는 한계가 있어서, 그보다 빠르면 산소 없이 포도당을 조금만 분해하는 길(젖산 생성)을 함께 쓰게 됩니다. 그래서 숨이 차고 오래 달리지 못하지요 — 이화 작용의 속도가 산소 공급에 묶여 있다는 뜻입니다."
  },

  /* ------------------------------------------------------------------ 3. 유전 암호 */
  {
    id: "c3", about: "03", tag: "유전정보의 흐름", title: "대장균이 만든 인슐린", short: "대장균 인슐린",
    who: "💉", name: "제약 회사 연구실",
    say: "“당뇨병 환자에게 필요한 <b>사람 인슐린</b>을 대장균에게 만들게 하려 합니다. 사람 인슐린 유전자의 mRNA 앞부분을 대장균에 넣었어요. 리보솜이 <b>어디서부터</b> 세 글자씩 읽어야 인슐린 사슬이 나올까요?”",
    predict: {
      q: "사람의 유전자를 대장균에 넣으면, 대장균은 사람과 같은 단백질을 만들 수 있을까요?",
      options: ["㉠ 만든다 — 유전 암호가 거의 모든 생물에서 같아서", "㉡ 못 만든다 — 생물마다 암호가 달라서", "㉢ 크기가 절반인 단백질만 만든다"], answer: 0
    },
    task: "읽기 시작하는 위치를 골라, 목표 사슬 <b>Met-Phe-Val-Asn-Gln-His-Leu-Cys-Gly</b>가 나오게 하세요. 세포 종류도 바꿔 보세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var fr = 0, host = "ecoli";
      function chain() {
        var out = [];
        for (var i = fr; i + 3 <= MRNA.length; i += 3) { var a = AA3[codon(MRNA.substr(i, 3))]; out.push(a); if (a === "종결") break; }
        return out;
      }
      function draw() {
        H.paper(ctx, W, cv.H);
        var cw = 24, x0 = 40, c = chain(), i;
        var ok = TARGET.every(function (a, j) { return c[j] === a; }) && c[TARGET.length] === "종결";
        K.bigText(ctx, (host === "ecoli" ? "대장균" : "사람 세포") + "의 리보솜이 읽은 결과", 18, 30, 18, "#ffffff");
        /* 리보솜(큰·작은 단위체)이 첫 코돈을 감싼다 — 염기 블록 뒤에 그린다 */
        var rx = x0 + fr * cw + cw * 1.5;
        var rg = ctx.createRadialGradient(rx - 14, 54, 4, rx, 66, 44); rg.addColorStop(0, "#fff3bf"); rg.addColorStop(1, "#d9a31c");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(rx, 64, 44, 17, 0, 0, 6.2832); ctx.fill();
        var rg2 = ctx.createRadialGradient(rx - 10, 92, 3, rx, 98, 36); rg2.addColorStop(0, "#ffe8a3"); rg2.addColorStop(1, "#b7861a");
        ctx.fillStyle = rg2; ctx.beginPath(); ctx.ellipse(rx, 96, 38, 10, 0, 0, 6.2832); ctx.fill();
        /* mRNA: 염기 블록 줄 */        var BC = { A: "#e8590c", U: "#f59f00", G: "#0f9f76", C: "#1c7ed6" };
        for (i = 0; i < MRNA.length; i++) {
          var x = x0 + i * cw, b = MRNA[i], col = BC[b];
          ctx.fillStyle = "rgba(20,30,50,.14)"; ctx.fillRect(x + 3, 92, cw - 3, 4);
          ctx.fillStyle = K.tint(col, 1.25); ctx.beginPath(); ctx.moveTo(x + 1, 62); ctx.lineTo(x + 5, 57); ctx.lineTo(x + cw + 3, 57); ctx.lineTo(x + cw - 1, 62); ctx.closePath(); ctx.fill();
          ctx.fillStyle = K.tint(col, .72); ctx.beginPath(); ctx.moveTo(x + cw - 1, 62); ctx.lineTo(x + cw + 3, 57); ctx.lineTo(x + cw + 3, 87); ctx.lineTo(x + cw - 1, 92); ctx.closePath(); ctx.fill();
          ctx.fillStyle = col; ctx.fillRect(x + 1, 62, cw - 2, 30);
          K.t(ctx, b, x + cw / 2, 83, { s: 15, w: "900", a: "center", c: "#ffffff" });
        }
        K.t(ctx, "5'", x0 - 18, 83, { s: 11, w: "800", c: LT.mute });
        /* 코돈 묶음 괄호 */
        for (i = fr; i + 3 <= MRNA.length; i += 3) { var k = (i - fr) / 3; if (k >= c.length) break; ctx.strokeStyle = k % 2 ? LT.blue : LT.teal; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + i * cw + 2, 100); ctx.lineTo(x0 + i * cw + 2, 104); ctx.lineTo(x0 + (i + 3) * cw - 2, 104); ctx.lineTo(x0 + (i + 3) * cw - 2, 100); ctx.stroke(); }
        /* 리보솜: 큰 단위체 + 작은 단위체(첫 코돈 위에 앉아 있음) */

        /* 아미노산 구슬 사슬 */
        var nA = c.filter(function (a) { return a !== "종결"; }).length;
        if (nA > 1) { ctx.strokeStyle = "#8a96a8"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0 + fr * cw + cw * 1.5, 146); ctx.lineTo(x0 + (fr + (nA - 1) * 3) * cw + cw * 1.5, 146); ctx.stroke(); }
        c.forEach(function (a, j) {
          var bx = x0 + (fr + j * 3) * cw + cw * 1.5, stop = a === "종결", hit = TARGET[j] === a;
          ctx.fillStyle = "rgba(20,30,50,.16)"; ctx.beginPath(); ctx.ellipse(bx + 4, 172, 20, 5, 0, 0, 6.2832); ctx.fill();
          var cc = stop ? "#e03131" : (hit ? "#0f9f76" : "#f59f00");
          K.planet(ctx, bx, 146, 22, cc, K.tint(cc, .45));
          K.t(ctx, a, bx, 151, { s: 12, w: "900", a: "center", c: "#ffffff" });
        });
        K.t(ctx, "목표: " + TARGET.join("-"), 40, 214, { s: 13, w: "800", c: LT.mute });
        K.t(ctx, "초록 = 목표와 같은 아미노산, 빨강 = 종결 코돈", 40, 276, { s: 11, c: LT.mute });
        /* 판정 카드 + 세포 미니어처 */
        K.card(ctx, 560, 192, 326, 98, null);
        if (host === "ecoli") {
          var eg = ctx.createLinearGradient(0, 214, 0, 250); eg.addColorStop(0, "#c5f6c7"); eg.addColorStop(1, "#40c057");
          ctx.fillStyle = eg; ctx.beginPath(); ctx.roundRect(578, 214, 70, 32, 16); ctx.fill();
          ctx.strokeStyle = "#2b8a3e"; ctx.lineWidth = 1.4; ctx.stroke();
          ctx.strokeStyle = "rgba(43,138,62,.6)"; ctx.beginPath(); ctx.moveTo(648, 230); ctx.bezierCurveTo(660, 220, 664, 244, 676, 232); ctx.stroke();
        } else {
          var hg = ctx.createRadialGradient(604, 222, 4, 612, 230, 26); hg.addColorStop(0, "#ffe3e3"); hg.addColorStop(1, "#ff8787");
          ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(612, 230, 24, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "#9775fa"; ctx.beginPath(); ctx.arc(616, 232, 9, 0, 6.2832); ctx.fill();
        }
        K.t(ctx, ok ? "목표 사슬과 같습니다" : "다른 사슬이 나왔습니다", 690, 226, { s: 14, w: "900", c: ok ? LT.green : LT.red });
        K.t(ctx, "아미노산 " + c.filter(function (a) { return a !== "종결"; }).length + "개", 690, 248, { s: 12, w: "800", c: LT.ink });
        K.t(ctx, ok ? "읽기 시작 = 셋째 염기 (AUG)" : "시작 코돈 AUG를 찾아보세요", 578, 276, { s: 11.5, w: "800", c: ok ? LT.teal : LT.mute });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "읽기 시작하는 위치", value: 0, options: [{ v: 0, t: "첫째 염기" }, { v: 1, t: "둘째 염기" }, { v: 2, t: "셋째 염기" }], onPick: function (x) { fr = x; draw(); } });
      api.seg({ label: "단백질을 만드는 세포", value: "ecoli", options: [{ v: "ecoli", t: "대장균" }, { v: "human", t: "사람 세포" }], onPick: function (x) { host = x; draw(); } });
      api.info("리보솜은 mRNA를 <b>세 염기(코돈)</b>씩 끊어 읽습니다. 어디서 끊기 시작하느냐에 따라 전혀 다른 단백질이 나옵니다.");
      draw();
      return {
        judge: function () {
          var c = chain(), ok = TARGET.every(function (a, j) { return c[j] === a; });
          if (ok) return { ok: true, msg: "셋째 염기의 AUG부터 읽어 Met-Phe-Val-Asn-Gln-His-Leu-Cys-Gly — " + (host === "ecoli" ? "대장균" : "사람 세포") + "에서도 똑같이 나옵니다." };
          if (c.indexOf("종결") >= 0 && c.indexOf("종결") < 5) return { ok: false, msg: "몇 개 읽지도 못하고 종결 코돈을 만났습니다." };
          return { ok: false, msg: "사슬이 " + c.slice(0, 5).join("-") + "… 로 전혀 다른 단백질입니다." };
        }
      };
    },
    hints: [
      "번역은 <b>시작 코돈 AUG</b>(메싸이오닌, Met)에서 시작합니다. mRNA에서 AUG를 찾아보세요.",
      "AUG는 몇 번째 염기부터 시작하나요? 거기서부터 세 글자씩 끊으면 목표 사슬이 나옵니다. 세포 종류를 바꿔도 결과가 같은지 확인해 보세요."
    ],
    solution: "<b>셋째 염기</b>부터 읽습니다(G C | AUG UUC GUU …). 대장균이든 사람 세포든 결과는 같습니다.",
    why: "리보솜은 mRNA를 <b>세 염기씩</b> 읽고, 번역은 <b>시작 코돈 AUG</b>에서 시작합니다. 시작 위치가 한 글자만 어긋나도 코돈이 모두 바뀌어 전혀 다른 단백질이 되거나 곧 종결 코돈을 만나 끊깁니다.<br>" +
      "그리고 유전 암호(어떤 코돈이 어떤 아미노산인지)는 대장균부터 사람까지 <b>거의 모든 생물이 같습니다</b>. 그래서 사람 인슐린 유전자를 대장균에 넣으면 대장균이 사람 인슐린을 만들어 냅니다 — 1980년대부터 당뇨병 치료에 쓰는 인슐린 대부분이 이렇게 만들어집니다."
  }
  ]
});
})();
