/* 통합과학1 Ⅱ-1 자연의 구성 원소 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";

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
    id: "c1", tag: "선 스펙트럼", title: "가로등 불빛의 정체", short: "가로등 스펙트럼",
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
      function X(nm) { return 60 + (nm - 380) / 330 * 780; }
      function pred() { var a = []; Object.keys(on).forEach(function (k) { if (on[k]) a = a.concat(LINES[k].l); }); return a; }
      function near(list, x) { return list.some(function (y) { return Math.abs(y - x) <= 1.5; }); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "가로등 불빛 (관측)", 60, 34, { s: 13, w: "900" });
        H.box(ctx, 60, 44, 780, 56, "#0e141b");
        LAMP.forEach(function (x) { H.box(ctx, X(x) - 2, 44, 4, 56, wlRGB(x)); });
        var p = pred();
        H.text(ctx, "내가 고른 원소가 내야 할 선 (예상)", 60, 142, { s: 13, w: "900" });
        H.box(ctx, 60, 152, 780, 56, "#0e141b");
        p.forEach(function (x) {
          var ok = near(LAMP, x);
          H.box(ctx, X(x) - 2, 152, 4, 56, ok ? wlRGB(x) : H.v("--rose"));
          if (!ok) H.text(ctx, "✗", X(x), 224, { s: 12, w: "900", a: "center", c: H.v("--rose-700") });
        });
        LAMP.forEach(function (x) { if (!near(p, x)) H.text(ctx, "?", X(x), 118, { s: 14, w: "900", a: "center", c: H.v("--amber-700") }); });
        for (var t = 400; t <= 700; t += 50) H.text(ctx, t + " nm", X(t), 244, { s: 10.5, a: "center", c: H.v("--mist") });
        var miss = LAMP.filter(function (x) { return !near(p, x); }).length, extra = p.filter(function (x) { return !near(LAMP, x); }).length;
        H.text(ctx, "설명 못 한 관측선 " + miss + "개 (?)  ·  관측에 없는 예상선 " + extra + "개 (✗)", 60, 280,
          { s: 13, w: "900", c: miss || extra ? H.v("--rose-700") : H.v("--green-700") });
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
    id: "c2", tag: "원자핵의 결합 에너지", title: "어디까지 합쳐야 에너지가 나올까", short: "핵융합의 한계",
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
        H.paper(ctx, W, cv.H);
        H.text(ctx, "핵자 하나당 결합 에너지 (MeV) — 높을수록 단단히 묶인 원자핵", 40, 32, { s: 13, w: "900" });
        H.axes(ctx, x0, y0, x1, y1);
        [6, 7, 8, 9].forEach(function (b) { H.text(ctx, b + "", x0 - 8, Y(b) + 4, { s: 10.5, a: "right", c: H.v("--mist") }); });
        [0, 60, 120, 180, 240].forEach(function (a) { H.text(ctx, a + "", X(a), y1 + 18, { s: 10.5, a: "center", c: H.v("--mist") }); });
        H.text(ctx, "질량수 A", x1, y1 + 36, { s: 11, a: "right", c: H.v("--mist") });
        var pts = []; for (var a = 10; a <= 240; a += 2) pts.push([X(a), Y(Bind(a) / a)]);
        H.line(ctx, pts, H.v("--teal"), 3);
        var fA = A, tA = mode === "fuse" ? 2 * A : A / 2;
        H.dot(ctx, X(fA), Y(Bind(fA) / fA), 8, H.v("--brand"));
        if (tA >= 10 && tA <= 240) {
          H.dot(ctx, X(tA), Y(Bind(tA) / tA), 8, H.v("--coral"));
          H.arrow(ctx, X(fA), Y(Bind(fA) / fA) - 14, X(tA), Y(Bind(tA) / tA) - 14, H.v("--mist"), 2, 9);
        }
        var d = dE(), good = d > 0;
        H.rows(ctx, 600, 70, [
          ["반응", mode === "fuse" ? "A " + A + " + A " + A + " → A " + 2 * A : "A " + A + " → A " + A / 2 + " + A " + A / 2],
          ["반응 전 총 결합 에너지", (mode === "fuse" ? 2 * Bind(A) : Bind(A)).toFixed(0) + " MeV"],
          ["반응 뒤 총 결합 에너지", (mode === "fuse" ? Bind(2 * A) : 2 * Bind(A / 2)).toFixed(0) + " MeV"],
          [good ? "나오는 에너지" : "넣어야 하는 에너지", Math.abs(d).toFixed(1) + " MeV", good ? "--green-700" : "--rose-700", true]
        ], 48);
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
    id: "c3", tag: "원소의 존재비 · 대기", title: "달이 질소를 붙잡으려면", short: "달의 대기",
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
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "기체 분자의 평균 속력 × 6  vs  달의 탈출 속도", 40, 32, { s: 13, w: "900" });
        var x0 = 180, x1 = 760, sc = (x1 - x0) / 16000;
        H.dash(ctx, x0 + VE * sc, 48, x0 + VE * sc, 260, H.v("--rose"), 2);
        H.text(ctx, "달 탈출 속도 2.38 km/s", x0 + VE * sc + 6, 60, { s: 11.5, w: "800", c: H.v("--rose-700") });
        Object.keys(GAS).forEach(function (g, i) {
          var y = 90 + i * 44, w = 6 * vr(g) * sc, k = keep(g);
          H.text(ctx, GAS[g].t, x0 - 10, y + 16, { s: 12.5, w: g === gas ? "900" : "600", a: "right", c: g === gas ? H.v("--ink") : H.v("--mist") });
          H.box(ctx, x0, y, Math.min(w, x1 - x0 + 60), 24, k ? H.v("--teal") : H.v("--coral"), g === gas ? 0.95 : 0.4);
          H.text(ctx, (6 * vr(g) / 1000).toFixed(2) + " km/s " + (k ? "붙잡힘" : "달아남"), x0 + Math.min(w, x1 - x0 + 60) + 8, y + 17,
            { s: 11.5, w: "800", c: k ? H.v("--teal-700") : H.v("--coral-700") });
        });
        H.text(ctx, "달 표면 온도 " + T + " K (" + (T - 273) + " ℃)", 40, 290, { s: 15, w: "900", c: H.v("--brand-700") });
        H.text(ctx, "참고: 달 낮 약 390 K · 타이탄 약 94 K", 460, 290, { s: 12, c: H.v("--mist") });
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
