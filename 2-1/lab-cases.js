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
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var on = { H: 0, He: 0, Na: 0, Hg: 0, Ne: 0 };
      function X(nm) { return 150 + (nm - 380) / 330 * 470; }
      function pred() { var a = []; Object.keys(on).forEach(function (k) { if (on[k]) a = a.concat(LINES[k].l); }); return a; }
      function near(list, x) { return list.some(function (y) { return Math.abs(y - x) <= 1.5; }); }
      function band(y, list, judgeIt) {
        slab(ctx, 150, y, 470, 46, 10, "#e9ecef", "#0e141b", "#868e96");
        list.forEach(function (x) { var ok = !judgeIt || near(LAMP, x); ctx.save(); ctx.shadowColor = ok ? wlRGB(x) : "#ff6b6b"; ctx.shadowBlur = 8; ctx.fillStyle = ok ? wlRGB(x) : "#ff6b6b"; ctx.fillRect(X(x) - 2, y, 4, 46); ctx.restore(); });
      }
      function draw() {
        var CH = cv.H, p = pred(), k;
        var miss = LAMP.filter(function (x) { return !near(p, x); }).length, extra = p.filter(function (x) { return !near(LAMP, x); }).length, okAll = !miss && !extra;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 640, CH, null);
        /* 가로등 미니어처 */
        floorShadow(ctx, 66, CH - 22, 50, 8, .3);
        slab(ctx, 44, CH - 34, 40, 10, 10, "#dee2e6", "#adb5bd", "#868e96");
        var pg = ctx.createLinearGradient(58, 0, 70, 0); pg.addColorStop(0, "#495057"); pg.addColorStop(.5, "#adb5bd"); pg.addColorStop(1, "#343a40");
        ctx.fillStyle = pg; ctx.fillRect(60, 100, 9, CH - 134);
        ctx.strokeStyle = "#495057"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(64, 104); ctx.quadraticCurveTo(66, 86, 96, 88); ctx.stroke();
        slab(ctx, 84, 88, 34, 8, 8, "#868e96", "#495057", "#343a40");
        KT.glow(ctx, 101, 102, 7, "rgba(255,196,110,.98)", 3.6);
        ctx.fillStyle = "rgba(255,210,140,.16)"; ctx.beginPath(); ctx.moveTo(101, 102); ctx.lineTo(150, 86); ctx.lineTo(150, 132); ctx.closePath(); ctx.fill();
        KT.pill(ctx, "가로등", 66, CH - 44, { a: "center", s: 11, c: "#e8ecff" });
        KT.bigText(ctx, okAll ? "여섯 선을 모두 설명!" : "남은 ? " + miss + "개 · 틀린 ✗ " + extra + "개", 150, 44, 22, okAll ? "#8ce99a" : "#ffffff");
        lt(ctx, "가로등 불빛 (관측)", 150, 76, { s: 12.5, w: "900" });
        band(86, LAMP, false);
        LAMP.forEach(function (x) { if (!near(p, x)) lt(ctx, "?", X(x), 156, { s: 16, w: "900", a: "center", c: LT.orange }); });
        lt(ctx, "내가 고른 원소가 내야 할 선 (예상)", 150, 172, { s: 12.5, w: "900" });
        band(182, p, true);
        p.forEach(function (x) { if (!near(LAMP, x)) lt(ctx, "✗", X(x), 250, { s: 13, w: "900", a: "center", c: LT.red }); });
        for (var t = 400; t <= 700; t += 50) lt(ctx, t + "", X(t), 274, { s: 10.5, a: "center", c: LT.mute });
        lt(ctx, "파장 (nm)", 620, 294, { s: 11, a: "right", c: LT.mute });
        /* 판정 카드 */
        var cd = sideCard(ctx, 652, W, CH, "판정");
        lt(ctx, okAll ? "지문 일치" : "아직 맞지 않음", cd.px, 62, { s: 21, w: "900", c: okAll ? LT.green : LT.orange });
        var names = Object.keys(on).filter(function (q) { return on[q]; }).map(function (q) { return LINES[q].t.split(" ")[0]; });
        lt(ctx, "켠 원소", cd.px, 94, { s: 12, c: LT.mute });
        lt(ctx, names.length ? names.join(" · ") : "없음", cd.px, 116, { s: 14, w: "900", c: LT.violet });
        KT.row(ctx, "설명 못 한 관측선 (?)", miss + " 개", cd.px, cd.R, 150, miss ? LT.orange : LT.green);
        KT.row(ctx, "관측에 없는 예상선 (✗)", extra + " 개", cd.px, cd.R, 176, extra ? LT.red : LT.green);
        KT.tip(ctx, okAll ? "섞인 기체를 모두 찾았습니다" : "선 하나하나를 설명해 보세요", cd.px - 4, 194, cd.w + 8, okAll);
        lt(ctx, "섞인 기체의 지문은", cd.px, 258, { s: 11.5, c: LT.mute });
        lt(ctx, "겹쳐 찍힐 뿐 지워지지 않습니다", cd.px, 278, { s: 11.5, c: LT.mute });
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
        KT.studio(ctx, 0, 0, 640, CH, null);
        KT.bigText(ctx, (good ? "나오는 에너지 " : "넣어야 할 에너지 ") + Math.abs(d).toFixed(1) + " MeV", 18, 40, 22, good ? "#8ce99a" : "#ffa8a8");
        var g = KT.chart(ctx, { x: 8, y: 58, w: 404, h: CH - 62, x0: 0, x1: 240, y0: 6, y1: 9.2, xt: 4, yt: 3, light: true, xl: "질량수 A", yl: "결합 에너지 (MeV/핵자)", yf: function (q) { return q.toFixed(0); } });
        var pts = []; for (a = 10; a <= 240; a += 2) pts.push([a, Bind(a) / a]);
        KT.plot(ctx, g, pts, LT.teal, { w: 2.8, light: true });
        KT.planet(ctx, g.X(fA), g.Y(Bind(fA) / fA), 7, "#74c0fc", "#1864ab");
        if (tA >= 10 && tA <= 240) {
          KT.planet(ctx, g.X(tA), g.Y(Bind(tA) / tA), 7, "#ffa8a8", "#c92a2a");
          KT.arrow(ctx, { x: g.X(fA), y: g.Y(Bind(fA) / fA) - 14 }, { x: g.X(tA), y: g.Y(Bind(tA) / tA) - 14 }, good ? LT.green : LT.red, 2.2, 10);
        }
        /* 원자핵 미니어처: 합치기는 둘 → 하나, 쪼개기는 하나 → 둘 */
        function R(q) { return 7 * Math.pow(q, 1 / 3); }
        var lx = 470, rx = 578;
        floorShadow(ctx, 524, CH - 30, 110, 12, .22);
        slab(ctx, 420, CH - 44, 200, 10, 12, "#f1f3f5", "#c3cad5", "#97a1af");
        if (mode === "fuse") {
          nucleus(ctx, lx, 112, R(A), Math.min(A, 40)); nucleus(ctx, lx, 212, R(A), Math.min(A, 40));
          KT.arrow(ctx, { x: lx + R(A) + 6, y: 162 }, { x: rx - R(2 * A) - 6, y: 162 }, good ? LT.green : LT.red, 3, 12);
          nucleus(ctx, rx, 162, R(2 * A), Math.min(2 * A, 60));
          KT.pill(ctx, "A " + A + " × 2", lx, 270, { a: "center", s: 11, c: "#a5d8ff" }); KT.pill(ctx, "A " + 2 * A, rx, 270, { a: "center", s: 11, c: "#ffc9c9" });
        } else {
          nucleus(ctx, lx, 162, R(A), Math.min(A, 60));
          KT.arrow(ctx, { x: lx + R(A) + 6, y: 162 }, { x: rx - R(A / 2) - 6, y: 162 }, good ? LT.green : LT.red, 3, 12);
          nucleus(ctx, rx, 112, R(A / 2), Math.min(A / 2, 40)); nucleus(ctx, rx, 212, R(A / 2), Math.min(A / 2, 40));
          KT.pill(ctx, "A " + A, lx, 270, { a: "center", s: 11, c: "#a5d8ff" }); KT.pill(ctx, "A " + A / 2 + " × 2", rx, 270, { a: "center", s: 11, c: "#ffc9c9" });
        }
        /* 판정 카드 */
        var cd = sideCard(ctx, 652, W, CH, "에너지 장부");
        lt(ctx, mode === "fuse" ? "A " + A + " + A " + A + " → A " + 2 * A : "A " + A + " → A " + A / 2 + " + A " + A / 2, cd.px, 60, { s: 15, w: "900", c: LT.ink });
        KT.row(ctx, "반응 전 총 결합 에너지", (mode === "fuse" ? 2 * Bind(A) : Bind(A)).toFixed(0) + " MeV", cd.px, cd.R, 96);
        KT.row(ctx, "반응 뒤 총 결합 에너지", (mode === "fuse" ? Bind(2 * A) : 2 * Bind(A / 2)).toFixed(0) + " MeV", cd.px, cd.R, 122);
        KT.row(ctx, good ? "나오는 에너지" : "넣어야 하는 에너지", Math.abs(d).toFixed(1) + " MeV", cd.px, cd.R, 148, good ? LT.green : LT.red);
        KT.tip(ctx, good ? "뒤가 더 단단히 묶임 → 에너지 나옴" : "뒤가 덜 묶임 → 에너지를 넣어야 함", cd.px - 4, 166, cd.w + 8, good);
        lt(ctx, "곡선의 꼭대기는 철 근처 (A ≈ 60)", cd.px, 236, { s: 11.5, c: LT.mute });
        lt(ctx, "⚠ 원자핵 크기·공 수는 어림", cd.px, 258, { s: 11, c: LT.dim });
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
        var CH = cv.H, x0 = 250, x1 = 600, sc = (x1 - x0) / 16000, cx = 112, cy = 166, r = 50;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 640, CH, null);
        KT.bigText(ctx, "달 표면 " + T + " K", 18, 40, 24, "#ffffff");
        KT.bigText(ctx, (T - 273) + " ℃ · 탈출 속도 2.38 km/s", 18, 66, 14, "#ffd35a");
        /* 받침대 위의 달 */
        floorShadow(ctx, cx, cy + r + 30, 86, 12, .28);
        slab(ctx, cx - 56, cy + r + 16, 100, 12, 12, "#f1f3f5", "#c3cad5", "#97a1af");
        Object.keys(GAS).forEach(function (g, i) {
          var k = keep(g), R0 = KT.rng(i * 5 + 3);
          for (var q = 0; q < 3; q++) {
            var an = i * 1.5 + q * 2.1, rr = k ? r + 8 + q * 2 : r + 20 + q * 16 + R0() * 6;
            var gx = cx + Math.cos(an) * rr, gy = cy + Math.sin(an) * rr * .5;
            ctx.globalAlpha = k ? 1 : 1 - q * .28; ball(ctx, gx, gy, g === gas ? 5 : 3.6, GC[g]); ctx.globalAlpha = 1;
            if (!k && q === 2) KT.arrow(ctx, { x: gx, y: gy }, { x: gx + Math.cos(an) * 14, y: gy + Math.sin(an) * 7 }, "rgba(90,100,120,.6)", 1.4, 6);
          }
        });
        KT.planet(ctx, cx, cy, r, "#e9ecef", "#5c5f6e");
        ctx.fillStyle = "rgba(60,62,80,.28)";
        [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.12], [-0.05, 0.35, 0.1]].forEach(function (c) { ctx.beginPath(); ctx.arc(cx + c[0] * r, cy + c[1] * r, c[2] * r, 0, 6.2832); ctx.fill(); });
        KT.pill(ctx, "달", cx, cy + r + 50, { a: "center", s: 12, c: "#e8ecff" });
        /* 입체 막대: 분자 평균 속력 × 6 */
        for (var t = 0; t <= 16000; t += 4000) { KT.line(ctx, { x: x0 + t * sc, y: 92 }, { x: x0 + t * sc, y: 280 }, "rgba(20,40,90,.10)", 1); lt(ctx, (t / 1000) + "", x0 + t * sc, 298, { s: 10.5, a: "center", c: LT.mute }); }
        lt(ctx, "평균 속력 × 6 (km/s)", x1, 314, { s: 10.5, a: "right", c: LT.mute });
        Object.keys(GAS).forEach(function (g, i) {
          var y = 112 + i * 44, w = Math.min(6 * vr(g) * sc, x1 - x0 + 20), k = keep(g);
          lt(ctx, GAS[g].t, x0, y - 6, { s: 12, w: g === gas ? "900" : "700", c: g === gas ? LT.ink : LT.mute });
          ctx.globalAlpha = g === gas ? 1 : .55; bar3(ctx, x0, y, Math.max(3, w), 20, 7, GC[g]); ctx.globalAlpha = 1;
          lt(ctx, (6 * vr(g) / 1000).toFixed(2), w > 120 ? x0 + 8 : x0 + w + 14, y + 15, { s: 11.5, w: "900", c: w > 120 ? "#ffffff" : LT.ink });
        });
        KT.line(ctx, { x: x0 + VE * sc, y: 88 }, { x: x0 + VE * sc, y: 280 }, LT.red, 2.2, [6, 4]);
        KT.pill(ctx, "탈출 속도", x0 + VE * sc, 84, { a: "center", s: 11, c: "#ffc9c9", box: [200, 640] });
        /* 판정 카드 */
        var cd = sideCard(ctx, 652, W, CH, "붙잡을 수 있나");
        lt(ctx, GAS[gas].t + " " + (keep(gas) ? "붙잡힘" : "달아남"), cd.px, 60, { s: 17, w: "900", c: keep(gas) ? LT.green : LT.red });
        KT.row(ctx, "평균 속력 × 6", (6 * vr(gas) / 1000).toFixed(2) + " km/s", cd.px, cd.R, 94, LT.orange);
        KT.row(ctx, "달의 탈출 속도", "2.38 km/s", cd.px, cd.R, 120, LT.red);
        Object.keys(GAS).forEach(function (g, i) { var y3 = 152 + i * 24; ctx.fillStyle = GC[g]; ctx.beginPath(); ctx.arc(cd.px + 5, y3 - 5, 5, 0, 6.2832); ctx.fill(); lt(ctx, GAS[g].t, cd.px + 16, y3, { s: 12, c: LT.mute }); lt(ctx, keep(g) ? "붙잡힘" : "달아남", cd.R, y3, { s: 12.5, w: "900", a: "right", c: keep(g) ? LT.green : LT.red }); });
        lt(ctx, "참고: 달 낮 약 390 K", cd.px, 268, { s: 11, c: LT.mute });
        lt(ctx, "타이탄 약 94 K", cd.px, 288, { s: 11, c: LT.mute });
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
