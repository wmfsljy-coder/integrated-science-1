/* 통합과학1 Ⅱ-2 물질의 규칙성과 성질 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";

/* 태양(5778 K 흑체) 광자로 얻을 수 있는 궁극 효율 — 띠 간격 Eg(eV)의 함수 */
var KT = 8.617e-5 * 5778, DEN = Math.pow(Math.PI, 4) / 15;
function integ(f, a, b, n) { var h = (b - a) / n, s = 0; for (var i = 0; i < n; i++) s += f(a + (i + 0.5) * h); return s * h; }
function eff(Eg) { var xg = Eg / KT; return xg * integ(function (x) { return x * x / (Math.exp(x) - 1); }, xg, 40, 1500) / DEN; }
var EFF_MAX = 0; (function () { for (var e = 0.3; e <= 3.0001; e += 0.05) EFF_MAX = Math.max(EFF_MAX, eff(e)); })();

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 주기성으로 예측 */
  {
    id: "c1", tag: "원소의 주기성", title: "지워진 녹는점", short: "루비듐 예측",
    who: "📕", name: "화학 자료집 편집부",
    say: "“1족 금속의 녹는점 표를 옮기다가 <b>루비듐(Rb)</b> 칸에 잉크를 쏟았어요. 멘델레예프가 빈칸의 성질을 이웃 원소로 예측했듯이, 위아래 원소로 루비듐의 녹는점을 예측해 주세요.”",
    predict: {
      q: "1족 금속(Li → Na → K → Rb → Cs)은 아래로 갈수록 녹는점이?",
      options: ["㉠ 높아진다", "㉡ 낮아진다", "㉢ 뚜렷한 규칙이 없다"], answer: 1
    },
    task: "예측값 슬라이더로 <b>루비듐의 녹는점</b>을 정하세요. 실제 값과 ±7 ℃ 안이면 합격입니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var DATA = [["Li", 2, 180.5], ["Na", 3, 97.8], ["K", 4, 63.5], ["Rb", 5, null], ["Cs", 6, 28.4]];
      var guess = 100;
      var x0 = 90, x1 = 520, y0 = 50, y1 = 270;
      function X(p) { return x0 + (p - 1.5) / 5 * (x1 - x0); }
      function Y(t) { return y1 - t / 200 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "1족 금속의 녹는점", 40, 32, { s: 14, w: "900" });
        H.axes(ctx, x0, y0, x1, y1);
        [0, 50, 100, 150, 200].forEach(function (t) { H.text(ctx, t + " ℃", x0 - 8, Y(t) + 4, { s: 10.5, a: "right", c: H.v("--mist") }); });
        DATA.forEach(function (d) {
          H.text(ctx, d[0] + " (" + d[1] + "주기)", X(d[1]), y1 + 20, { s: 11, a: "center", c: H.v("--mist") });
          if (d[2] != null) { H.dot(ctx, X(d[1]), Y(d[2]), 8, H.v("--teal")); H.text(ctx, d[2].toFixed(1), X(d[1]) + 12, Y(d[2]) - 8, { s: 11.5, w: "800", c: H.v("--teal-700") }); }
        });
        H.dot(ctx, X(5), Y(guess), 9, H.v("--coral"));
        H.text(ctx, "내 예측 " + guess + " ℃", X(5) + 12, Y(guess) + 4, { s: 12, w: "900", c: H.v("--coral-700") });
        H.dash(ctx, X(4), Y(63.5), X(6), Y(28.4), H.v("--mist"), 1);
        H.rows(ctx, 580, 70, [["칼륨 K (위)", "63.5 ℃"], ["루비듐 Rb (예측)", guess + " ℃", "--coral-700", true], ["세슘 Cs (아래)", "28.4 ℃"]], 56);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "루비듐 녹는점 예측", min: 0, max: 150, step: 1, value: 100, fmt: function (x) { return x + " ℃"; }, onInput: function (x) { guess = x; draw(); } });
      api.info("점선은 칼륨과 세슘을 잇는 곧은 선입니다. 위에서부터 녹는점이 떨어지는 <b>간격</b>도 눈여겨보세요.");
      draw();
      return {
        judge: function () {
          var d = guess - 39.3;
          if (Math.abs(d) <= 7) return { ok: true, msg: "실제 루비듐의 녹는점은 39.3 ℃ — 예측 " + guess + " ℃와 " + Math.abs(d).toFixed(1) + " ℃ 차이입니다." };
          return { ok: false, msg: "실제 값과 " + (d > 0 ? "너무 높습니다" : "너무 낮습니다") + "." };
        }
      };
    },
    hints: [
      "루비듐은 칼륨(63.5 ℃)과 세슘(28.4 ℃) 사이에 있습니다. 녹는점은 그 <b>사이</b> 어딘가일 것입니다.",
      "위에서 아래로 갈수록 떨어지는 폭이 점점 줄어듭니다(83 → 34 → …). 두 이웃의 평균(약 46 ℃)보다 조금 아래를 노려 보세요."
    ],
    solution: "칼륨과 세슘의 평균은 약 46 ℃, 떨어지는 폭이 줄어드는 추세를 따르면 조금 더 낮게 — <b>32~46 ℃</b>면 합격, 실제 값은 <b>39.3 ℃</b>.",
    why: "같은 족 원소는 <b>원자가 전자 수가 같아서</b> 성질이 비슷하고, 아래로 갈수록 원자가 커지며 성질이 <b>일정한 방향으로</b> 변합니다. 1족 금속은 원자가 커질수록 금속 결합이 약해져 녹는점이 낮아집니다.<br>" +
      "그래서 빈칸의 성질을 이웃으로 예측할 수 있습니다 — 멘델레예프가 에카규소(저마늄)를 예측한 방법 그대로입니다. 다만 변화가 늘 곧은 선은 아니어서, 단순 평균보다 <b>변화의 흐름</b>까지 읽으면 더 정확해집니다."
  },

  /* ------------------------------------------------------------------ 2. 결합 구조와 성질 */
  {
    id: "c2", tag: "공유 결합 · 전기적 성질", title: "연필심은 왜 전기가 통할까", short: "흑연과 다이아몬드",
    who: "✏️", name: "과학 탐구 대회",
    say: "“다이아몬드와 연필심(흑연)은 둘 다 <b>탄소 원자만</b>으로 되어 있어요. 그런데 다이아몬드는 가장 단단하고 전기가 안 통하고, 연필심은 종이에 묻어날 만큼 무르고 전기가 통합니다. 탄소 원자를 어떻게 이어야 연필심이 될까요?”",
    predict: {
      q: "탄소로만 된 다이아몬드와 흑연 가운데 전기가 통하는 것은?",
      options: ["㉠ 다이아몬드", "㉡ 흑연", "㉢ 둘 다 통하지 않는다"], answer: 1
    },
    task: "탄소를 잇는 방식을 골라 <b>무르고(층이 미끄러지고) 전기가 통하는</b> 연필심을 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var n = 4, layer = "strong";
      function props() {
        var free = 4 - n;
        var cond = n === 3 ? "잘 통한다 (층을 따라)" : (n === 4 ? "통하지 않는다" : "불안정해 곧 다른 구조로 바뀐다");
        var hard = n === 4 ? "매우 단단하다" : (n === 3 ? (layer === "weak" ? "무르다 — 층이 미끄러진다" : "(이런 탄소는 자연에 없다)") : "—");
        return { free: free, cond: cond, hard: hard };
      }
      function draw() {
        H.paper(ctx, W, cv.H);
        var p = props();
        H.text(ctx, "탄소 원자 하나가 이웃 " + n + "개와 공유 결합", 40, 32, { s: 14, w: "900" });
        var cx = 250, cy = 170;
        if (n === 4) {
          for (var i = -2; i <= 2; i++) for (var j = -2; j <= 2; j++) {
            var x = cx + i * 48 + (j % 2 ? 24 : 0), y = cy + j * 36;
            if (i < 2) H.line(ctx, [[x, y], [x + 48, y]], H.v("--line"), 2);
            if (j < 2) H.line(ctx, [[x, y], [x + 24, y + 36]], H.v("--line"), 2);
            H.dot(ctx, x, y, 7, H.v("--ink"));
          }
        } else if (n === 3) {
          [0, 1, 2].forEach(function (k) {
            var y = 90 + k * 70;
            for (var i = 0; i < 7; i++) {
              var x = 120 + i * 44;
              H.line(ctx, [[x, y], [x + 22, y - 12], [x + 44, y]], H.v("--line"), 2);
              H.dot(ctx, x, y, 6, H.v("--ink"));
              H.dot(ctx, x + 22 + ((i * 0.37 + k * 0.21) % 1) * 20, y - 20, 3, H.v("--amber"));
            }
            if (k < 2) {
              if (layer === "weak") H.dash(ctx, 110, y + 35, 430, y + 35, H.v("--mist"), 1);
              else H.line(ctx, [[110, y + 35], [430, y + 35]], H.v("--coral"), 3);
            }
          });
          H.text(ctx, "노란 점 = 결합에 쓰이지 않고 층을 따라 움직이는 전자", 110, 290, { s: 11, c: H.v("--amber-700") });
        } else {
          for (var i2 = 0; i2 < 9; i2++) { H.dot(ctx, 90 + i2 * 44, cy, 7, H.v("--ink")); if (i2 < 8) H.line(ctx, [[90 + i2 * 44, cy], [134 + i2 * 44, cy]], H.v("--line"), 3); }
        }
        H.rows(ctx, 520, 70, [
          ["결합에 쓰이지 않은 전자 (탄소 1개당)", p.free + " 개"],
          ["전기", p.cond, n === 3 ? "--green-700" : "--rose-700"],
          ["단단함", p.hard, n === 4 ? "--brand-700" : (layer === "weak" && n === 3 ? "--green-700" : "--mist")]
        ], 62);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "탄소 하나가 공유 결합하는 이웃 수", value: 4, options: [{ v: 2, t: "2개" }, { v: 3, t: "3개" }, { v: 4, t: "4개" }], onPick: function (x) { n = x; draw(); } });
      api.seg({ label: "층과 층 사이", value: "strong", options: [{ v: "strong", t: "공유 결합으로 단단히" }, { v: "weak", t: "약한 힘으로만" }], onPick: function (x) { layer = x; draw(); } });
      api.info("탄소의 원자가 전자는 4개입니다. 이웃과 결합하는 데 몇 개를 쓰고, 몇 개가 남을까요?");
      draw();
      return {
        judge: function () {
          if (n === 3 && layer === "weak") return { ok: true, msg: "이웃 3개와 결합하고 남은 전자 1개가 층을 따라 움직이며 전기를 나르고, 약하게 붙은 층은 쉽게 미끄러집니다 — 흑연입니다." };
          if (n === 4) return { ok: false, msg: "이웃 4개 — 전자를 모두 결합에 써서 전기가 통하지 않고 매우 단단합니다. 다이아몬드입니다." };
          if (n === 3) return { ok: false, msg: "전기는 통하지만, 층끼리 단단히 묶여 있으면 종이에 묻어나지 않습니다." };
          return { ok: false, msg: "이웃 2개인 사슬은 불안정합니다." };
        }
      };
    },
    hints: [
      "전기가 통하려면 <b>자리를 옮겨 다닐 수 있는 전자</b>가 있어야 합니다. 탄소의 원자가 전자 4개를 결합에 모두 쓰면 남는 전자가 있을까요?",
      "종이에 묻어나려면 <b>층과 층이 쉽게 떨어져야</b> 합니다. 층 사이를 무엇으로 이어야 할까요?"
    ],
    solution: "이웃 <b>3개</b>, 층 사이는 <b>약한 힘으로만</b>.",
    why: "같은 탄소라도 <b>어떻게 이어졌느냐</b>가 성질을 정합니다. 다이아몬드는 탄소 하나가 이웃 4개와 공유 결합해 전자를 모두 써 버리므로 전기가 통하지 않고, 3차원 그물 구조라 매우 단단합니다.<br>" +
      "흑연은 이웃 3개와만 결합해 평평한 층을 이루고, 남은 전자 하나가 층을 따라 자유롭게 움직여 <b>전기가 통합니다</b>. 층 사이는 약한 힘으로만 붙어 있어 쉽게 미끄러집니다. 흑연 층 한 장을 떼어 낸 것이 <b>그래핀</b>입니다."
  },

  /* ------------------------------------------------------------------ 3. 반도체의 띠 간격 */
  {
    id: "c3", tag: "반도체 · 띠 간격", title: "태양전지 재료 고르기", short: "태양전지 띠 간격",
    who: "☀️", name: "태양광 스타트업",
    say: "“새 태양전지 재료를 고르고 있어요. 재료마다 <b>띠 간격</b>이 다르죠. 띠 간격보다 에너지가 큰 빛(광자)만 전자를 들뜨게 해 전류를 만드는데, 남는 에너지는 열로 사라져요. 햇빛을 가장 잘 쓰는 띠 간격은 얼마일까요?”",
    predict: {
      q: "태양전지 재료의 띠 간격이 넓을수록 효율은?",
      options: ["㉠ 계속 좋아진다", "㉡ 계속 나빠진다", "㉢ 알맞은 값에서 가장 좋다"], answer: 2
    },
    task: "띠 간격을 조절해 <b>햇빛에서 얻는 효율이 최고에 가까운(최고값의 98% 이상)</b> 재료를 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var Eg = 2.5, cur = eff(Eg);
      var x0 = 70, x1 = 560, y0 = 60, y1 = 270;
      function X(e) { return x0 + e / 4 * (x1 - x0); }
      function n(e) { var x = e / KT; return x * x / (Math.exp(x) - 1); }
      var NMAX = 0; for (var e0 = 0.05; e0 < 4; e0 += 0.05) NMAX = Math.max(NMAX, n(e0));
      function Y(v) { return y1 - v / NMAX * (y1 - y0) * 0.95; }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "햇빛의 광자 수 — 광자 에너지별", 40, 32, { s: 14, w: "900" });
        H.axes(ctx, x0, y0, x1, y1);
        for (var e = 0.02; e < 4; e += 0.02) {
          var h = y1 - Y(n(e));
          H.box(ctx, X(e), Y(n(e)), X(0.02) - X(0) + 0.5, h, e < Eg ? H.v("--mist") : H.v("--amber"), e < Eg ? 0.35 : 0.8);
        }
        H.dash(ctx, X(Eg), y0 - 6, X(Eg), y1, H.v("--brand"), 2);
        H.text(ctx, "띠 간격 " + Eg.toFixed(2) + " eV", X(Eg) + 6, y0 + 4, { s: 12, w: "900", c: H.v("--brand-700") });
        [0, 1, 2, 3, 4].forEach(function (k) { H.text(ctx, k + " eV", X(k), y1 + 18, { s: 10.5, a: "center", c: H.v("--mist") }); });
        H.text(ctx, "회색 = 에너지가 모자라 그냥 지나가는 빛   노랑 = 흡수되는 빛", x0, y1 + 40, { s: 11, c: H.v("--mist") });
        H.rows(ctx, 610, 70, [
          ["흡수되는 광자", (100 * integ(function (x) { return x * x / (Math.exp(x) - 1); }, Eg / KT, 40, 600) / 2.404).toFixed(0) + " %"],
          ["광자 하나에서 얻는 에너지", Eg.toFixed(2) + " eV"],
          ["햇빛 에너지 가운데 쓰는 몫", (cur * 100).toFixed(1) + " %", cur >= 0.98 * EFF_MAX ? "--green-700" : "--brand-700", true]
        ], 60);
        H.text(ctx, "참고: 규소 1.12 eV · 비소화 갈륨 1.42 eV", 610, 270, { s: 11, c: H.v("--mist") });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "재료의 띠 간격", min: 0.3, max: 3, step: 0.05, value: 2.5, fmt: function (x) { return x.toFixed(2) + " eV"; },
        onInput: function (x) { Eg = x; cur = eff(Eg); draw(); } });
      api.info("띠 간격을 낮추면 더 많은 빛을 흡수하지만, 광자 하나에서 얻는 에너지(= 띠 간격)는 줄어듭니다.");
      draw();
      return {
        judge: function () {
          if (cur >= 0.98 * EFF_MAX) return { ok: true, msg: "띠 간격 " + Eg.toFixed(2) + " eV에서 " + (cur * 100).toFixed(1) + " % — 최고값(" + (EFF_MAX * 100).toFixed(1) + " %)에 가깝습니다." };
          return { ok: false, msg: "지금 " + (cur * 100).toFixed(1) + " % — " + (Eg > 1.2 ? "띠 간격이 넓어 지나가는 빛이 너무 많습니다." : "띠 간격이 좁아 광자 하나에서 얻는 에너지가 너무 적습니다.") };
        }
      };
    },
    hints: [
      "띠 간격을 아주 넓게 하면 회색(그냥 지나가는 빛)이 많아지고, 아주 좁게 하면 광자마다 얻는 에너지가 작아집니다. <b>두 손해의 균형</b>을 찾으세요.",
      "오른쪽 ‘쓰는 몫’이 가장 커지는 곳을 찾으세요. 1 eV 근처를 천천히 훑어 보세요."
    ],
    solution: "<b>0.95~1.25 eV</b>. 가장 좋은 곳은 약 1.1 eV — 규소(1.12 eV)가 태양전지에 널리 쓰이는 까닭입니다.",
    why: "반도체는 띠 간격보다 에너지가 큰 광자만 흡수하고, 광자 하나로 <b>띠 간격만큼의 에너지</b>만 전기로 얻습니다(남는 에너지는 열).<br>" +
      "띠 간격이 넓으면 광자 하나에서 많이 얻지만 흡수하는 빛이 적고, 좁으면 대부분 흡수하지만 하나에서 얻는 양이 적습니다. 그래서 효율은 <b>알맞은 띠 간격(약 1.1 eV)</b>에서 가장 높습니다.<br>" +
      "※ 이 값은 다른 손실을 모두 뺀 이론적 상한(약 44 %)이고, 실제 규소 태양전지는 20 % 대입니다. 띠 간격이 다른 재료를 여러 층 겹치면 이 한계를 넘을 수 있습니다."
  }
  ]
});
})();
