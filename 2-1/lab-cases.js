/* 통합과학1 Ⅱ-1 자연의 구성 원소 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";

/* ---- 밝은 스튜디오 + 입체 미니어처 (../assets/kit.js 의 K.studio · K.card) ---- */
var KT = window.sthKit, LT = KT.LT;
function lt(ctx, s, x, y, o) { o = o || {}; KT.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function floorShadow(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || 0.28) + ")"); g.addColorStop(0.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w + d, y + h - d * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
function bar3(ctx, x, y, w, h, d, hex) {
  var g = ctx.createLinearGradient(0, y, 0, y + Math.max(1, h)); g.addColorStop(0, KT.tint(hex, 1.1)); g.addColorStop(1, KT.tint(hex, .85));
  slab(ctx, x, y, w, h, d, KT.tint(hex, 1.25), g, KT.tint(hex, .68));
}
function sideCard(ctx, x, W, H, title) { KT.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
function ball(ctx, x, y, r, hex) { KT.planet(ctx, x, y, r, hex, KT.tint(hex, 0.4)); }
/* 핵자 공을 둥글게 쌓은 원자핵 (반지름 R, 공 n개) */
function nucleus(ctx, cx, cy, R, n) {
  var rb = Math.max(3, R / (1.25 * Math.sqrt(n)) * 1.05), sp = [], k;
  for (k = 0; k < n; k++) { var a = k * 2.39996, d = rb * 1.25 * Math.sqrt(k); sp.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * .92, k]); }
  sp.sort(function (p, q) { return p[1] - q[1]; });
  sp.forEach(function (p) { ball(ctx, p[0], p[1], rb, p[2] % 2 ? "#d5dae8" : "#ff7b6b"); });
}

/* 원소별 방출선 (nm) — 가시광선 영역의 대표선 */
var LINES = {
  H: { t: "수소 H", c: "--coral", l: [410, 434, 486, 656] },
  He: { t: "헬륨 He", c: "--amber", l: [447, 471, 492, 502, 588, 668] },
  Na: { t: "나트륨 Na", c: "--amber", l: [589] },
  Hg: { t: "수은 Hg", c: "--violet", l: [405, 436, 546, 577, 579] },
  Ne: { t: "네온 Ne", c: "--rose", l: [585, 614, 640, 650, 693] }
};
var LAMP = [405, 436, 546, 577, 579, 589];     /* 관측된 가로등 = 나트륨 + 수은 */

function wlRGB(nm) {
  var r = 0, g = 0, b = 0;
  if (nm < 440) { r = -(nm - 440) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; } else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; } else { r = 1; }
  return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
}

/* 원자핵 결합 에너지 — 반경험적 질량 공식(짝짓기 항 생략), 안정 계곡의 Z를 쓴다 */
function Zof(A) { return Math.round(A / (2 + 0.0154 * Math.pow(A, 2 / 3))); }
function Bind(A) { var z = Zof(A); return 15.75 * A - 17.8 * Math.pow(A, 2 / 3) - 0.711 * z * (z - 1) / Math.pow(A, 1 / 3) - 23.7 * Math.pow(A - 2 * z, 2) / A; }

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 선 스펙트럼 = 지문 */
  {
    id: "c1", about: "01", tag: "선 스펙트럼", title: "가로등 불빛의 정체", short: "가로등 스펙트럼",
    who: "🏮", name: "도시 조명 조사단",
    say: "“오래된 거리의 가로등 불빛을 분광기로 펼쳤더니 밝은 선이 <b>여섯 개</b> 나왔어요. 안에 든 기체가 무엇인지 기록이 없습니다. 한 가지 기체가 아닐 수도 있대요.”",
    predict: {
      q: "선 스펙트럼으로 가로등 속 기체를 알아낼 수 있는 까닭은?",
      options: ["㉠ 원소마다 한 가지 색의 빛만 내기 때문에", "㉡ 원소마다 내는 빛의 파장 묶음이 정해져 있기 때문에", "㉢ 밝은 원소일수록 선이 많기 때문에"], answer: 1
    },
    task: "원소를 켜고 끄며 <b>관측된 여섯 선을 빠짐없이, 남는 선 없이</b> 설명하는 조합을 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var on = { H: 0, He: 0, Na: 0, Hg: 0, Ne: 0 };
      function X(nm) { return 262 + (nm - 380) / 330 * 360; }
      function pred() { var a = []; Object.keys(on).forEach(function (k) { if (on[k]) a = a.concat(LINES[k].l); }); return a; }
      function near(list, x) { return list.some(function (y) { return Math.abs(y - x) <= 1.5; }); }      /* 밝은 스크린 띠: 연한 회청색 판 위에 색 선(테두리를 둘러 노란 선도 보이게) */
      function band(y, list, judgeIt) {
        slab(ctx, 262, y, 360, 40, 10, "#f8f9fb", "#e4e9f1", "#b8c1cf");
        ctx.strokeStyle = "rgba(60,75,110,.25)"; ctx.lineWidth = 1; ctx.strokeRect(262.5, y + .5, 359, 39);
        list.forEach(function (x) {
          var ok = !judgeIt || near(LAMP, x), c = ok ? wlRGB(x) : "#e03131";
          ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 6; ctx.fillStyle = c; ctx.fillRect(X(x) - 2.5, y + 2, 5, 36); ctx.restore();
          ctx.strokeStyle = "rgba(20,30,50,.45)"; ctx.lineWidth = 1; ctx.strokeRect(X(x) - 2.5, y + 2, 5, 36);
        });
      }
      var ECOL = { H: "#ff6b6b", He: "#fab005", Na: "#ffd43b", Hg: "#9775fa", Ne: "#ff8787" };
      function draw() {
        var CH = cv.H, p = pred(), k;
        var miss = LAMP.filter(function (x) { return !near(p, x); }).length, extra = p.filter(function (x) { return !near(LAMP, x); }).length, okAll = !miss && !extra;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 640, CH, null);
        var keys = Object.keys(on).filter(function (q) { return on[q]; });
        /* 가로등 미니어처 — 커다란 유리 등 속에 내가 넣어 본 기체 원자 */
        var bx = 118, by = 128, br = 70;
        floorShadow(ctx, bx, CH - 26, 92, 12, .3);
        slab(ctx, bx - 46, CH - 40, 80, 12, 14, "#eef1f5", "#b8c1cf", "#8e98a8");
        var pg = ctx.createLinearGradient(bx - 7, 0, bx + 7, 0); pg.addColorStop(0, "#495057"); pg.addColorStop(.5, "#ced4da"); pg.addColorStop(1, "#343a40");
        ctx.fillStyle = pg; ctx.fillRect(bx - 7, by + br + 26, 14, CH - 40 - (by + br + 26));
        var cg = ctx.createLinearGradient(bx - 30, 0, bx + 30, 0); cg.addColorStop(0, "#868e96"); cg.addColorStop(.45, "#dee2e6"); cg.addColorStop(1, "#495057");
        ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(bx - 30, by + br - 8, 60, 34, 6); ctx.fill();
        ctx.strokeStyle = "rgba(40,50,70,.35)"; ctx.lineWidth = 1; for (k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(bx - 30, by + br + k * 7); ctx.lineTo(bx + 30, by + br + k * 7); ctx.stroke(); }
        var glowC = keys.length ? ECOL[keys[0]] : "#ffffff";
        if (keys.length) KT.glow(ctx, bx, by, br * .55, "rgba(255,220,150,.55)", 2.2);
        var gl = ctx.createRadialGradient(bx - br * .35, by - br * .4, 4, bx, by, br);
        gl.addColorStop(0, "rgba(255,255,255,.95)"); gl.addColorStop(.6, keys.length ? "rgba(255,240,205,.55)" : "rgba(225,235,248,.55)"); gl.addColorStop(1, "rgba(150,170,200,.55)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(70,90,130,.55)"; ctx.lineWidth = 1.6; ctx.stroke();
        /* 원자: 켠 원소마다 공 3개 */
        var RR = KT.rng(5), ai = 0;
        keys.forEach(function (q, qi) {
          for (var m = 0; m < 3; m++) {
            var an = (ai * 2.39996) + .4, d = 16 + (ai % 4) * 11;
            ball(ctx, bx + Math.cos(an) * d, by + Math.sin(an) * d * .9, 9, ECOL[q]);
            KT.t(ctx, q, bx + Math.cos(an) * d, by + Math.sin(an) * d * .9 + 3.5, { s: q.length > 1 ? 8.5 : 10, w: "900", a: "center", c: "#1d2433" });
            ai++;
          }
        });
        if (!keys.length) lt(ctx, "기체를 켜 보세요", bx, by + 4, { s: 12, w: "800", a: "center", c: LT.mute });
        ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.ellipse(bx - br * .45, by - br * .45, br * .18, br * .09, -.7, 0, 6.2832); ctx.fill();
        KT.pill(ctx, "내가 넣어 본 기체", bx, CH - 10, { a: "center", s: 12, c: "#e8ecff" });
        /* 분광기(프리즘) — 빛을 받아 띠로 펼친다 */
        ctx.fillStyle = "rgba(255,225,150,.30)"; ctx.beginPath(); ctx.moveTo(bx + br - 6, by - 14); ctx.lineTo(214, 112); ctx.lineTo(214, 130); ctx.lineTo(bx + br - 6, by + 14); ctx.closePath(); ctx.fill();
        slab(ctx, 196, 150, 46, 10, 12, "#eef1f5", "#b8c1cf", "#8e98a8");
        var prg = ctx.createLinearGradient(200, 92, 244, 150); prg.addColorStop(0, "rgba(235,245,255,.95)"); prg.addColorStop(1, "rgba(130,170,220,.85)");
        ctx.fillStyle = prg; ctx.beginPath(); ctx.moveTo(200, 150); ctx.lineTo(246, 150); ctx.lineTo(223, 96); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(60,90,130,.6)"; ctx.lineWidth = 1.2; ctx.stroke();
        KT.pill(ctx, "분광기", 222, 176, { a: "center", s: 11.5, c: "#e8ecff" });
        var fg = ctx.createLinearGradient(262, 0, 622, 0); for (k = 0; k <= 6; k++) fg.addColorStop(k / 6, wlRGB(400 + k * 50));
        ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(236, 118); ctx.lineTo(262, 160); ctx.lineTo(622, 160); ctx.lineTo(622, 218); ctx.lineTo(262, 218); ctx.closePath(); ctx.fill(); ctx.restore();
        KT.bigText(ctx, okAll ? "여섯 선을 모두 설명!" : "남은 ? " + miss + "개 · 틀린 ✗ " + extra + "개", 262, 40, 22, okAll ? "#8ce99a" : "#ffffff");
        lt(ctx, "가로등 불빛 (관측)", 262, 70, { s: 12.5, w: "900" });
        band(78, LAMP, false);
        LAMP.forEach(function (x) { if (!near(p, x)) lt(ctx, "?", X(x), 138, { s: 16, w: "900", a: "center", c: LT.orange }); });
        lt(ctx, "내가 넣어 본 기체가 내야 할 선 (예상)", 262, 160, { s: 12.5, w: "900" });
        band(168, p, true);
        p.forEach(function (x) { if (!near(LAMP, x)) lt(ctx, "✗", X(x), 226, { s: 13, w: "900", a: "center", c: LT.red }); });
        for (var t = 400; t <= 700; t += 50) lt(ctx, t + "", X(t), 248, { s: 11, a: "center", c: LT.mute });
        lt(ctx, "파장 (nm)", 622, 266, { s: 11, a: "right", c: LT.mute });
        /* 판정 카드 */
        var cd = sideCard(ctx, 652, W, CH, "판정");
        lt(ctx, okAll ? "지문 일치" : "아직 맞지 않음", cd.px, 62, { s: 21, w: "900", c: okAll ? LT.green : LT.orange });
        var names = keys.map(function (q) { return LINES[q].t.split(" ")[0]; });
        lt(ctx, "켠 원소", cd.px, 94, { s: 12, c: LT.mute });
        lt(ctx, names.length ? names.join(" · ") : "없음", cd.px, 116, { s: 14, w: "900", c: LT.violet });
        KT.row(ctx, "설명 못 한 관측선 (?)", miss + " 개", cd.px, cd.R, 150, miss ? LT.orange : LT.green);
        KT.row(ctx, "관측에 없는 예상선 (✗)", extra + " 개", cd.px, cd.R, 176, extra ? LT.red : LT.green);
        KT.tip(ctx, okAll ? "섞인 기체를 모두 찾았습니다" : "선 하나하나를 설명해 보세요", cd.px - 4, 194, cd.w + 8, okAll);
        lt(ctx, "섞인 기체의 지문은", cd.px, 254, { s: 11.5, c: LT.mute });
        lt(ctx, "겹쳐 찍힐 뿐 지워지지 않습니다", cd.px, 274, { s: 11.5, c: LT.mute });
      }
      cv.canvas._redraw = draw;
      Object.keys(LINES).forEach(function (k) {
        api.seg({ label: LINES[k].t, value: 0, options: [{ v: 0, t: "끔" }, { v: 1, t: "켬" }], onPick: function (x) { on[k] = x; draw(); } });
      });
      api.info("위 띠 아래의 <b>?</b>는 아직 설명하지 못한 선, 아래 띠의 <b>✗</b>는 관측에 없는데 예상한 선입니다.");
      draw();
      return {
        judge: function () {
          var p = pred(), miss = LAMP.filter(function (x) { return !near(p, x); }).length, extra = p.filter(function (x) { return !near(LAMP, x); }).length;
          if (!miss && !extra) return { ok: true, msg: "나트륨의 589 nm 노란 선 하나와 수은의 선 다섯 개 — 두 기체가 섞인 가로등입니다." };
          return { ok: false, msg: "설명 못 한 선 " + miss + "개, 관측에 없는 선 " + extra + "개가 남습니다." };
        }
      };
    },
    hints: [
      "가장 밝고 노란 589 nm 선 하나부터 설명해 보세요. 선이 <b>딱 하나</b>인 원소가 있습니다.",
      "남은 다섯 선(405·436·546·577·579 nm)은 한 원소의 선 묶음입니다. 헬륨처럼 <b>관측에 없는 선까지 내는 원소</b>는 들어 있지 않은 것입니다."
    ],
    solution: "<b>나트륨</b>과 <b>수은</b>만 켜세요. 나트륨이 589 nm, 수은이 405·436·546·577·579 nm를 냅니다.",
    why: "원소마다 전자가 오르내릴 수 있는 에너지 계단이 정해져 있어서, 내는 빛의 파장도 <b>원소마다 고유한 묶음</b>이 됩니다. 그래서 선 스펙트럼은 원소의 지문입니다.<br>" +
      "여러 기체가 섞이면 지문이 <b>겹쳐 찍힐 뿐</b> 서로 지워지지 않습니다. 그래서 선 하나하나를 설명하는 원소를 찾아 나가면 섞인 성분을 모두 가려낼 수 있습니다. 별빛에서 수십 가지 원소를 찾아내는 것도 같은 방법입니다. 또 어떤 원소의 선이 <b>하나라도 빠져 있으면</b> 그 원소는 없다고 판단합니다."
  },

  /* ------------------------------------------------------------------ 2. 결합 에너지 */
  {
    id: "c2", about: "02", tag: "원자핵의 결합 에너지", title: "어디까지 합쳐야 에너지가 나올까", short: "핵융합의 한계",
    who: "⚛️", name: "핵융합 연구소",
    say: "“별은 가벼운 원자핵을 합치며 에너지를 얻습니다. 그런데 연구원이 묻네요. ‘<b>같은 원자핵 두 개를 합치면</b> 언제나 에너지가 나올까? 어느 원자핵까지 연료가 될 수 있지?’ 원자핵의 결합 에너지 곡선으로 따져 봅시다.”",
    predict: {
      q: "철(질량수 56)보다 무거운 원자핵 두 개를 합치면?",
      options: ["㉠ 에너지가 나온다", "㉡ 에너지를 넣어 주어야 한다", "㉢ 에너지 변화가 없다"], answer: 1
    },
    task: "반응을 ‘합치기’로 두고, <b>합쳐서 에너지가 나오는 원자핵 가운데 가장 무거운 것</b>을 찾으세요. ‘쪼개기’도 해 보세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var A = 20, mode = "fuse";
      function dE() { return mode === "fuse" ? Bind(2 * A) - 2 * Bind(A) : 2 * Bind(A / 2) - Bind(A); }
      var x0 = 70, x1 = 560, y0 = 60, y1 = 270;
      function X(a) { return x0 + (a - 0) / 240 * (x1 - x0); }
      function Y(b) { return y1 - (b - 6) / 3.2 * (y1 - y0); }
      function draw() {
        var CH = cv.H, d = dE(), good = d > 0, fA = A, tA = mode === "fuse" ? 2 * A : A / 2, a;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 600, CH, null);
        KT.bigText(ctx, (good ? "나오는 에너지 " : "넣어야 할 에너지 ") + Math.abs(d).toFixed(1) + " MeV", 18, 40, 22, good ? "#8ce99a" : "#ffa8a8");
        /* 원자핵 미니어처(주인공): 합치기는 둘 → 하나, 쪼개기는 하나 → 둘. 공 크기 = 질량수의 세제곱근 */
        function R(q) { return 12.5 * Math.pow(q, 1 / 3); }
        var lx = 150, rx = 432, cy = 180;
        floorShadow(ctx, 292, CH - 30, 250, 18, .22);
        slab(ctx, 52, CH - 46, 470, 12, 16, "#f4f6fa", "#cfd6e1", "#a6b0c0");
        function pad(x, y, rr) { floorShadow(ctx, x, CH - 46, rr * 1.1, 6, .25); }
        var aR = mode === "fuse" ? R(A) : R(A / 2), y1n = cy - Math.max(aR + 6, 56), y2n = cy + Math.max(aR + 6, 56);
        if (mode === "fuse") {
          pad(lx, 0, R(A)); pad(rx, 0, R(2 * A));
          nucleus(ctx, lx, y1n, R(A), Math.min(A, 50)); nucleus(ctx, lx, y2n, R(A), Math.min(A, 50));
          KT.arrow(ctx, { x: lx + R(A) + 10, y: cy }, { x: rx - R(2 * A) - 14, y: cy }, good ? LT.green : LT.red, 4, 14);
          nucleus(ctx, rx, cy, R(2 * A), Math.min(2 * A, 80));
          KT.pill(ctx, "A " + A + " × 2", lx - R(A) - 8, y1n - R(A) + 8, { a: "right", s: 12, c: "#a5d8ff" });
          KT.pill(ctx, "A " + 2 * A, rx, cy + R(2 * A) + 22, { a: "center", s: 12, c: "#ffc9c9" });
        } else {
          pad(lx, 0, R(A)); pad(rx, 0, R(A / 2));
          nucleus(ctx, lx, cy, R(A), Math.min(A, 80));
          KT.arrow(ctx, { x: lx + R(A) + 10, y: cy }, { x: rx - R(A / 2) - 14, y: cy }, good ? LT.green : LT.red, 4, 14);
          nucleus(ctx, rx, y1n, R(A / 2), Math.min(A / 2, 50)); nucleus(ctx, rx, y2n, R(A / 2), Math.min(A / 2, 50));
          KT.pill(ctx, "A " + A, lx, cy + R(A) + 22, { a: "center", s: 12, c: "#a5d8ff" });
          KT.pill(ctx, "A " + A / 2 + " × 2", rx + R(A / 2) + 8, y1n - R(A / 2) + 8, { a: "left", s: 12, c: "#ffc9c9" });
        }
        /* 나오는 에너지는 빛살, 넣어야 하면 밖에서 들어오는 번개 화살 */
        var ex = (lx + rx) / 2 + 20, ey = cy - 38, k, mag = Math.min(1, Math.abs(d) / 60);
        if (good) {
          for (k = 0; k < 8; k++) { var an = k * .785 + .2, r0 = 12, r1 = 22 + 26 * mag; KT.line(ctx, { x: ex + Math.cos(an) * r0, y: ey + Math.sin(an) * r0 }, { x: ex + Math.cos(an) * r1, y: ey + Math.sin(an) * r1 }, "#f59f00", 3); }
          KT.glow(ctx, ex, ey, 9, "rgba(255,212,59,.95)", 2.6);
          KT.pill(ctx, "+" + d.toFixed(1) + " MeV", ex, ey - 34 - 26 * mag, { a: "center", s: 13, c: "#ffe066" });
        } else {
          ctx.strokeStyle = LT.red; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ex - 6, ey - 52); ctx.lineTo(ex + 6, ey - 30); ctx.lineTo(ex - 4, ey - 28); ctx.lineTo(ex + 6, ey - 6); ctx.stroke();
          KT.arrow(ctx, { x: ex + 2, y: ey - 14 }, { x: ex + 6, y: ey }, LT.red, 3.5, 10);
          KT.pill(ctx, "−" + (-d).toFixed(1) + " MeV 넣기", ex, ey - 62, { a: "center", s: 13, c: "#ffc9c9" });
        }
        lt(ctx, "⚠ 원자핵 크기·공 수는 어림", 586, CH - 12, { s: 11, a: "right", c: LT.mute });
        /* 판정 카드 — 결합 에너지 곡선은 카드 안의 작은 그래프로 */
        var cd = sideCard(ctx, 612, W, CH, "에너지 장부");
        lt(ctx, mode === "fuse" ? "A " + A + " + A " + A + " → A " + 2 * A : "A " + A + " → A " + A / 2 + " + A " + A / 2, cd.px, 56, { s: 15, w: "900", c: LT.ink });
        KT.row(ctx, "반응 전 총 결합 에너지", (mode === "fuse" ? 2 * Bind(A) : Bind(A)).toFixed(0) + " MeV", cd.px, cd.R, 82);
        KT.row(ctx, "반응 뒤 총 결합 에너지", (mode === "fuse" ? Bind(2 * A) : 2 * Bind(A / 2)).toFixed(0) + " MeV", cd.px, cd.R, 104);
        KT.row(ctx, good ? "나오는 에너지" : "넣어야 하는 에너지", Math.abs(d).toFixed(1) + " MeV", cd.px, cd.R, 126, good ? LT.green : LT.red);
        KT.tip(ctx, good ? "뒤가 더 단단히 묶임 → 에너지 나옴" : "뒤가 덜 묶임 → 에너지를 넣어야 함", cd.px - 4, 136, cd.w + 8, good);
        var g = KT.chart(ctx, { x: cd.px - 10, y: 182, w: cd.w + 14, h: CH - 196, x0: 0, x1: 240, y0: 6, y1: 9.2, xt: 4, yt: 3, light: true, xl: "질량수 A", yl: "MeV/핵자", yf: function (q) { return q.toFixed(0); } });
        var pts = []; for (a = 10; a <= 240; a += 2) pts.push([a, Bind(a) / a]);
        KT.plot(ctx, g, pts, LT.teal, { w: 2.2, light: true });
        KT.planet(ctx, g.X(fA), g.Y(Bind(fA) / fA), 5, "#74c0fc", "#1864ab");
        if (tA >= 10 && tA <= 240) {
          KT.planet(ctx, g.X(tA), g.Y(Bind(tA) / tA), 5, "#ffa8a8", "#c92a2a");
          KT.arrow(ctx, { x: g.X(fA), y: g.Y(Bind(fA) / fA) - 9 }, { x: g.X(tA), y: g.Y(Bind(tA) / tA) - 9 }, good ? LT.green : LT.red, 1.8, 7);
        }
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "반응", value: "fuse", options: [{ v: "fuse", t: "둘을 합치기 (융합)" }, { v: "split", t: "둘로 쪼개기 (분열)" }],
        onPick: function (x) { mode = x; draw(); } });
      api.slider({ label: "원자핵의 질량수 A", min: 10, max: 120, step: 2, value: 20, fmt: function (x) { return "A = " + x; },
        onInput: function (x) { A = x; draw(); } });
      api.info("반응 뒤 원자핵들이 <b>더 단단히 묶이면(총 결합 에너지가 커지면)</b> 그 차이만큼 에너지가 나옵니다.");
      draw();
      return {
        judge: function () {
          var d = dE();
          if (mode !== "fuse") return { ok: false, msg: "쪼개기에서 " + (d > 0 ? d.toFixed(1) + " MeV가 나옵니다" : (-d).toFixed(1) + " MeV를 넣어야 합니다") + ". 과제는 ‘합치기’입니다." };
          var next = Bind(2 * A + 4) - 2 * Bind(A + 2);
          if (d > 0 && next <= 0 && A >= 40) return { ok: true, msg: "A " + A + " 두 개를 합치면 " + d.toFixed(1) + " MeV가 나오지만, A " + (A + 2) + " 부터는 " + (-next).toFixed(1) + " MeV를 넣어야 합니다." };
          if (d > 0) return { ok: false, msg: d.toFixed(1) + " MeV가 나옵니다. 더 무거운 원자핵도 되는지 보세요." };
          return { ok: false, msg: "합치면 " + (-d).toFixed(1) + " MeV를 넣어야 합니다. 너무 무겁습니다." };
        }
      };
    },
    hints: [
      "합친 결과(2A)가 곡선의 <b>꼭대기(A ≈ 60) 너머</b>로 가면 어떻게 될까요? 화살표가 곡선을 오르는지 내려가는지 보세요.",
      "합친 원자핵이 원래 둘보다 <b>핵자당 결합 에너지가 커야</b> 에너지가 나옵니다. 질량수를 2씩 올리며 ‘나오는 에너지’가 ‘넣어야 하는 에너지’로 바뀌는 경계를 찾으세요."
    ],
    solution: "‘합치기’에서 <b>A = 42</b>. 42 + 42 → 84는 에너지가 나오지만 44 + 44 → 88 부터는 에너지를 넣어야 합니다 (이 곡선 기준).",
    why: "에너지가 나오는지는 반응 전과 뒤의 <b>총 결합 에너지</b>를 견주면 알 수 있습니다. 뒤가 크면(더 단단히 묶이면) 차이만큼 에너지가 나옵니다.<br>" +
      "곡선이 철 근처(A ≈ 60)에서 꼭대기를 이루므로, 합친 결과가 꼭대기를 한참 넘어가면 오히려 에너지를 넣어야 합니다. 반대로 <b>무거운 원자핵은 쪼갤 때</b> 에너지가 나옵니다 — 원자력 발전(우라늄 분열)이 그렇습니다. 별이 핵융합으로 만들 수 있는 원소가 철 근처에서 멈추는 까닭도 같습니다.<br>" +
      "※ 이 곡선은 반경험적 질량 공식으로 그린 근사여서, 가벼운 원자핵(A < 20)에서는 실제 값과 차이가 있습니다."
  },

  /* ------------------------------------------------------------------ 3. 대기와 원소의 존재비 */
  {
    id: "c3", about: "03", tag: "원소의 존재비 · 대기", title: "달이 질소를 붙잡으려면", short: "달의 대기",
    who: "🌙", name: "행성 과학 동아리",
    say: "“토성의 위성 <b>타이탄</b>은 탈출 속도가 달(2.4 km/s)과 비슷한데도 <b>질소 대기</b>가 두껍게 있어요. 달은 거의 진공인데요. 무엇이 다른 걸까요? 달의 온도를 바꿔 가며 알아봅시다.”",
    predict: {
      q: "달에 대기가 거의 없는 까닭으로 가장 알맞은 것은?",
      options: ["㉠ 중력이 약하기 때문 — 온도와는 상관없다", "㉡ 중력과 온도를 함께 따져야 한다", "㉢ 달에는 질소 원소가 없기 때문"], answer: 1
    },
    task: "기체를 질소로 두고 온도를 바꿔, <b>달이 질소를 붙잡을 수 있는 가장 높은 온도</b>를 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var GAS = { H2: { t: "수소 H₂", m: 0.002 }, He: { t: "헬륨 He", m: 0.004 }, N2: { t: "질소 N₂", m: 0.028 }, CO2: { t: "이산화 탄소 CO₂", m: 0.044 } };
      var gas = "H2", T = 390, VE = 2380, R = 8.314;
      function vr(g) { return Math.sqrt(3 * R * T / GAS[g].m); }
      function keep(g) { return 6 * vr(g) <= VE; }
      var GC = { H2: "#ff922b", He: "#845ef7", N2: "#20c997", CO2: "#51cf66" };
      function draw() {
        var CH = cv.H, cx = 210, cy = 170, r = 92, k;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 640, CH, null);
        KT.bigText(ctx, "달 표면 " + T + " K", 18, 40, 24, "#ffffff");
        KT.bigText(ctx, (T - 273) + " ℃ · 탈출 속도 2.38 km/s", 18, 66, 14, "#ffd35a");
        /* 받침대 위의 큰 달 — 기체 분자: 붙잡힌 것은 표면 가까이 얇은 대기, 달아나는 것은 꼬리를 끌며 멀어진다 */
        floorShadow(ctx, cx, CH - 30, 150, 16, .28);
        slab(ctx, cx - 70, CH - 46, 124, 12, 16, "#f4f6fa", "#cfd6e1", "#a6b0c0");
        ctx.fillStyle = "#c3cad5"; ctx.beginPath(); ctx.moveTo(cx - 14, CH - 46); ctx.lineTo(cx - 6, cy + r - 6); ctx.lineTo(cx + 10, cy + r - 6); ctx.lineTo(cx + 18, CH - 46); ctx.closePath(); ctx.fill();
        var anyKeep = Object.keys(GAS).some(keep);
        if (anyKeep) { var ag = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 26); ag.addColorStop(0, "rgba(120,190,255,.38)"); ag.addColorStop(1, "rgba(120,190,255,0)"); ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, r + 26, 0, 6.2832); ctx.fill(); }
        var mols = [];
        Object.keys(GAS).forEach(function (g, i) {
          var kp = keep(g), R0 = KT.rng(i * 7 + 3), sp = Math.min(1.6, 6 * vr(g) / VE);
          for (var q = 0; q < 6; q++) {
            var an = i * 1.57 + q * 1.047 + R0() * .5, rr = kp ? r + 6 + R0() * 14 : Math.min(r + 150, r + 34 + q * 14 * sp + R0() * 18);
            var mx = cx + Math.cos(an) * rr, my = cy + Math.sin(an) * rr * .78;
            if (my < 86 || mx > 425 || my > CH - 40) continue;
            mols.push({ g: g, kp: kp, an: an, rr: rr, x: mx, y: my, back: Math.sin(an) < -.2 && rr < r + 30 });
          }
        });
        function mol(o) {
          var sel = o.g === gas;
          if (!o.kp) { var tx = cx + Math.cos(o.an) * (o.rr - 26), ty = cy + Math.sin(o.an) * (o.rr - 26) * .78; KT.line(ctx, { x: tx, y: ty }, { x: o.x, y: o.y }, sel ? "rgba(224,49,49,.55)" : "rgba(90,100,120,.28)", sel ? 2.2 : 1.4, [4, 3]); }
          ctx.globalAlpha = sel ? 1 : .6; ball(ctx, o.x, o.y, sel ? 7.5 : 5, GC[o.g]); ctx.globalAlpha = 1;
        }
        mols.filter(function (o) { return o.back; }).forEach(mol);
        KT.planet(ctx, cx, cy, r, "#eceef2", "#55596a");
        ctx.fillStyle = "rgba(60,62,80,.22)";
        [[-0.32, -0.22, 0.2], [0.28, 0.08, 0.13], [-0.06, 0.38, 0.11], [0.4, -0.4, 0.08], [-0.5, 0.2, 0.07]].forEach(function (c) { ctx.beginPath(); ctx.arc(cx + c[0] * r, cy + c[1] * r, c[2] * r, 0, 6.2832); ctx.fill(); });
        /* 낮의 온도: 뜨거울수록 햇빛 쪽 가장자리가 주황으로 달아오른다 */
        var hot = (T - 40) / 360, hg = ctx.createRadialGradient(cx - r * .55, cy - r * .2, 4, cx - r * .4, cy, r * 1.05);
        hg.addColorStop(0, "rgba(255,146,43," + (.42 * hot).toFixed(2) + ")"); hg.addColorStop(1, "rgba(255,146,43,0)");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill();
        mols.filter(function (o) { return !o.back; }).forEach(mol);
        KT.pill(ctx, "달", cx + r * .62, cy + r * .78, { a: "center", s: 13, c: "#e8ecff" });
        /* 온도계 미니어처 */
        var tx0 = 470, tTop = 92, tBot = CH - 66, lv = tBot - (T - 40) / 360 * (tBot - tTop);
        floorShadow(ctx, tx0, CH - 30, 46, 7, .25);
        slab(ctx, tx0 - 26, CH - 46, 46, 12, 12, "#f4f6fa", "#cfd6e1", "#a6b0c0");
        ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "rgba(60,75,110,.45)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.roundRect(tx0 - 10, tTop - 8, 20, tBot - tTop + 16, 10); ctx.fill(); ctx.stroke();
        var tg = ctx.createLinearGradient(0, tBot, 0, tTop); tg.addColorStop(0, "#4dabf7"); tg.addColorStop(1, "#f03e3e");
        ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(tx0 - 4, lv, 8, tBot - lv + 8, 4); ctx.fill();
        ball(ctx, tx0, tBot + 14, 13, T > 220 ? "#f03e3e" : "#4dabf7");
        [40, 165, 280, 400].forEach(function (q) { var yq = tBot - (q - 40) / 360 * (tBot - tTop); KT.line(ctx, { x: tx0 + 10, y: yq }, { x: tx0 + 17, y: yq }, LT.line, 1.2); lt(ctx, q + " K", tx0 + 21, yq + 4, { s: 11.5, c: q === 165 ? LT.teal : LT.mute }); });
        KT.pill(ctx, T + " K", tx0 - 16, lv + 4, { a: "right", s: 12.5, c: "#ffe066" });
        lt(ctx, "타이탄 94 K", 600, 70, { s: 11.5, w: "800", a: "right", c: LT.mute });
        /* 판정 카드 — 막대는 카드 안 작은 띠로: 평균 속력 × 6 와 탈출 속도(빨간 눈금) */
        var cd = sideCard(ctx, 652, W, CH, "붙잡을 수 있나");
        lt(ctx, GAS[gas].t + " " + (keep(gas) ? "붙잡힘" : "달아남"), cd.px, 58, { s: 17, w: "900", c: keep(gas) ? LT.green : LT.red });
        KT.row(ctx, "평균 속력 × 6", (6 * vr(gas) / 1000).toFixed(2) + " km/s", cd.px, cd.R, 86, LT.orange);
        KT.row(ctx, "달의 탈출 속도", "2.38 km/s", cd.px, cd.R, 108, LT.red);
        var MXV = 16000, vx = cd.px + cd.w * VE / MXV;
        Object.keys(GAS).forEach(function (g, i) {
          var y3 = 136 + i * 36, kp = keep(g);
          ctx.fillStyle = GC[g]; ctx.beginPath(); ctx.arc(cd.px + 5, y3 - 5, 5, 0, 6.2832); ctx.fill();
          lt(ctx, GAS[g].t, cd.px + 16, y3, { s: 12, w: g === gas ? "900" : "700", c: g === gas ? LT.ink : LT.mute });
          lt(ctx, kp ? "붙잡힘" : "달아남", cd.R, y3, { s: 12.5, w: "900", a: "right", c: kp ? LT.green : LT.red });
          KT.bar(ctx, cd.px, y3 + 7, cd.w, 6 * vr(g) / MXV, GC[g]);
          KT.line(ctx, { x: vx, y: y3 + 3 }, { x: vx, y: y3 + 21 }, LT.red, 2.2);
        });
        lt(ctx, "막대 = 평균 속력 × 6 · 빨간 선 = 탈출 속도", cd.px, CH - 16, { s: 11, c: LT.mute });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "살펴볼 기체", value: "H2", options: Object.keys(GAS).map(function (g) { return { v: g, t: GAS[g].t }; }), onPick: function (x) { gas = x; draw(); } });
      api.slider({ label: "달 표면 온도", min: 40, max: 400, step: 5, value: 390, fmt: function (x) { return x + " K"; }, onInput: function (x) { T = x; draw(); } });
      api.info("분자의 평균 속력의 <b>6 배</b>가 탈출 속도보다 작으면, 수십억 년 동안 그 기체를 붙잡아 둘 수 있다고 봅니다.");
      draw();
      return {
        judge: function () {
          if (gas !== "N2") return { ok: false, msg: "과제는 질소입니다. 살펴볼 기체를 질소로 바꾸세요." };
          if (keep("N2") && T >= 165) return { ok: true, msg: T + " K에서 질소 분자 속력 × 6 = " + (6 * vr("N2") / 1000).toFixed(2) + " km/s — 탈출 속도 아래입니다." };
          if (keep("N2")) return { ok: false, msg: "붙잡기는 하지만, 더 따뜻해도 됩니다. 가장 높은 온도를 찾으세요." };
          return { ok: false, msg: T + " K 에서는 질소가 달아납니다." };
        }
      };
    },
    hints: [
      "온도가 높을수록 분자는 빨리 움직입니다. 질소 막대가 빨간 선(탈출 속도)을 넘지 않는 온도를 찾아 온도를 내려 보세요.",
      "분자 속력은 √(온도 ÷ 분자 질량)에 비례합니다. 막대 끝이 빨간 선에 <b>막 닿기 직전</b>인 온도가 답입니다."
    ],
    solution: "질소로 두고 <b>165~175 K</b>. 계산하면 약 177 K 아래에서 달도 질소를 붙잡을 수 있습니다.",
    why: "기체가 행성에 남는지는 <b>중력(탈출 속도)</b>과 <b>분자의 속력</b>의 싸움입니다. 분자의 속력은 온도가 높을수록, 분자가 가벼울수록 빠릅니다.<br>" +
      "그래서 탈출 속도가 비슷해도 <b>94 K로 매우 추운 타이탄</b>은 질소를 붙잡고, 낮 기온이 약 390 K 인 달은 놓칩니다. 가벼운 수소·헬륨은 훨씬 추워야 붙잡을 수 있지요 — 우주에서 가장 흔한 두 원소가 <b>지구 대기에는 거의 없는</b> 까닭이 여기에 있습니다."
  }
  ]
});
})();
