/* 통합과학1 Ⅲ-3 생명 시스템 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";

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
    id: "c1", tag: "효소 · 변성", title: "파인애플 젤리가 안 굳어요", short: "파인애플 젤리",
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
        var f = left();
        H.text(ctx, FRUIT[fr].t + "를 " + T + " ℃에서 5분 익힌 뒤 젤라틴에 넣었다", 40, 32, { s: 14, w: "900" });
        ctx.fillStyle = H.v("--card-2"); ctx.beginPath(); ctx.moveTo(80, 120); ctx.lineTo(360, 120); ctx.quadraticCurveTo(350, 270, 220, 270); ctx.quadraticCurveTo(90, 270, 80, 120); ctx.fill();
        ctx.fillStyle = H.v(FRUIT[fr].c); ctx.globalAlpha = sets() ? 0.75 : 0.3;
        ctx.beginPath(); ctx.moveTo(90, sets() ? 135 : 180); ctx.lineTo(350, sets() ? 135 : 180); ctx.quadraticCurveTo(340, 262, 220, 262); ctx.quadraticCurveTo(100, 262, 90, sets() ? 135 : 180); ctx.fill(); ctx.globalAlpha = 1;
        H.text(ctx, sets() ? "탱글탱글 — 굳었다" : "흐물흐물 — 안 굳는다", 220, 105, { s: 15, w: "900", a: "center", c: sets() ? H.v("--green-700") : H.v("--rose-700") });
        /* 젤라틴 사슬: 효소가 남아 있으면 잘린다 */
        for (var i = 0; i < 6; i++) {
          var y = 180 + i * 12, cut = f > 0.1 && (i % 2 === 0);
          H.line(ctx, [[110, y], [cut ? 200 : 330, y]], H.v("--violet"), 2);
          if (cut) H.line(ctx, [[222, y], [330, y]], H.v("--violet"), 2);
        }
        H.rows(ctx, 440, 60, [
          ["과일 속 단백질 분해 효소", FRUIT[fr].prot ? "있음" : "거의 없음"],
          ["가열 뒤 남은 효소 활성", (f * 100).toFixed(0) + " %", f < 0.1 ? "--green-700" : "--rose-700", true],
          ["젤리", sets() ? "굳는다" : "굳지 않는다", sets() ? "--green-700" : "--rose-700"]
        ], 60);
        H.text(ctx, "효소 활성이 10 % 아래로 떨어져야 젤라틴이 굳습니다", 440, 270, { s: 11, c: H.v("--mist") });
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
    id: "c2", tag: "물질대사 · 세포 호흡", title: "숨차지 않게 달리기", short: "유산소 달리기",
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
      function draw() {
        H.paper(ctx, W, cv.H);
        var need = o2(), over = need > VO2MAX + 1e-9;
        H.text(ctx, "속력 " + v.toFixed(1) + " km/h로 달릴 때 1분 동안", 40, 32, { s: 14, w: "900" });
        H.text(ctx, "🏃", 60 + (v - 6) / 14 * 300, 120, { s: 40 });
        var x0 = 60, x1 = 460, sc = (x1 - x0) / 4.5;
        [["들이마셔 쓰는 산소", need, "--brand"], ["내쉬는 이산화 탄소", need, "--coral"]].forEach(function (r, i) {
          var y = 170 + i * 50;
          H.text(ctx, r[0], x0, y - 8, { s: 12, w: "800", c: H.v("--mist") });
          H.box(ctx, x0, y, x1 - x0, 22, H.v("--card-2"));
          H.box(ctx, x0, y, Math.min(x1 - x0, r[1] * sc), 22, H.v(r[2]), 0.8);
          H.text(ctx, r[1].toFixed(2) + " L", x0 + Math.min(x1 - x0, r[1] * sc) + 8, y + 16, { s: 12.5, w: "900", c: H.v(r[2] + "-700") });
        });
        H.dash(ctx, x0 + VO2MAX * sc, 150, x0 + VO2MAX * sc, 250, H.v("--rose"), 2);
        H.text(ctx, "최대 산소 3.0 L", x0 + VO2MAX * sc + 4, 146, { s: 11, w: "800", c: H.v("--rose-700") });
        H.rows(ctx, 560, 60, [
          ["쓰는 에너지", kcal().toFixed(1) + " kcal/분"],
          ["필요한 산소", need.toFixed(2) + " L/분", over ? "--rose-700" : "--green-700", true],
          ["상태", over ? "산소 부족 — 젖산이 쌓인다" : "산소로 충분 (유산소)", over ? "--rose-700" : "--green-700"]
        ], 60);
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
    id: "c3", tag: "유전정보의 흐름", title: "대장균이 만든 인슐린", short: "대장균 인슐린",
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
        H.text(ctx, (host === "ecoli" ? "대장균" : "사람 세포") + "의 리보솜이 읽은 결과", 40, 32, { s: 14, w: "900" });
        var x0 = 40, cw = 24;
        for (var i = 0; i < MRNA.length; i++) {
          var inCodon = i >= fr, k = Math.floor((i - fr) / 3);
          if (inCodon && (i - fr) % 3 === 0) H.box(ctx, x0 + i * cw - 1, 60, cw * 3 - 2, 34, k % 2 ? H.v("--brand-100") : H.v("--teal-100"));
          H.text(ctx, MRNA[i], x0 + i * cw + cw / 2 - 1, 84, { s: 17, w: "900", a: "center", c: MRNA.substr(i, 3) === "AUG" && i === fr ? H.v("--green-700") : H.v("--ink") });
        }
        H.text(ctx, "5'", x0 - 18, 84, { s: 11, c: H.v("--mist") });
        var c = chain();
        c.forEach(function (a, j) {
          var x = x0 + (fr + j * 3) * cw + cw * 1.5 - 1, stop = a === "종결", hit = TARGET[j] === a;
          H.dot(ctx, x, 140, 26, stop ? H.v("--rose") : (hit ? H.v("--green") : H.v("--amber")));
          H.text(ctx, a, x, 145, { s: 12, w: "900", a: "center", c: stop ? "#fff" : "#3a2a00" });
        });
        H.text(ctx, "목표: " + TARGET.join("-"), 40, 210, { s: 13, w: "800", c: H.v("--mist") });
        var ok = TARGET.every(function (a, j) { return c[j] === a; }) && c[TARGET.length] === "종결";
        H.text(ctx, ok ? "✅ 목표 사슬과 같습니다" : "만들어진 사슬: " + c.join("-"), 40, 244, { s: 13.5, w: "900", c: ok ? H.v("--green-700") : H.v("--rose-700") });
        H.text(ctx, "초록 = 목표와 같은 아미노산, 빨강 = 종결 코돈", 40, 280, { s: 11, c: H.v("--mist") });
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
