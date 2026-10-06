/* 통합과학1 Ⅱ-2 물질의 규칙성과 성질 — 실제 자료
   r1 이온화 에너지의 봉우리 — 주기마다 가장 큰 원소
   r2 규칙의 예외 — 2주기에서 이온화 에너지가 앞 원소보다 작아지는 곳
   자료: data/elements.js (PubChem 주기율표, 이온화 에너지는 NIST 값) */
(function () {
"use strict";
var E = (window.REAL_ELEMENTS || { rows: [] }).rows;      /* [원자 번호, 기호, 첫 이온화 에너지 eV, 원자 반지름 pm, 분류] */
function ie(z) { var r = E[z - 1]; return r ? r[2] : null; }
function sym(z) { var r = E[z - 1]; return r ? r[1] : "?"; }
var KN = { 3: "리튬", 4: "베릴륨", 5: "붕소", 6: "탄소", 7: "질소", 8: "산소", 9: "플루오린", 10: "네온" };
var SRC = "<small>출처: 미국 국립보건원 PubChem 주기율표(이온화 에너지는 NIST 원자 스펙트럼 자료), 사본은 이 단원의 data/elements.js.</small>";

function plot(H, ctx, W, CH, from, to, mark) {
  H.paper(ctx, W, CH);
  var x0 = 60, x1 = W - 30, y0 = 24, y1 = CH - 40;
  function X(z) { return x0 + (z - from) / (to - from) * (x1 - x0); }
  function Y(e) { return y1 - e / 26 * (y1 - y0); }
  H.axes(ctx, x0, y0, x1, y1);
  [0, 5, 10, 15, 20, 25].forEach(function (e) { H.text(ctx, e, x0 - 8, Y(e) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  H.text(ctx, "첫 이온화 에너지 (eV)", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
  [3, 11, 19].forEach(function (z) { if (z > from && z <= to) H.dash(ctx, X(z - 0.5), y0, X(z - 0.5), y1, H.v("--line"), 1); });
  var pts = []; for (var z = from; z <= to; z++) if (ie(z) != null) pts.push([X(z), Y(ie(z))]);
  H.line(ctx, pts, H.v("--brand"), 2);
  for (z = from; z <= to; z++) {
    if (ie(z) == null) continue;
    var m = mark && mark[z];
    H.dot(ctx, X(z), Y(ie(z)), m ? 7 : 3.5, m ? H.v(m) : H.v("--brand-700"));
    H.text(ctx, sym(z), X(z), y1 + 15, { s: to - from > 20 ? 9.5 : 11.5, w: m ? "900" : "600", a: "center", c: m ? H.v(m) : H.v("--mist") });
  }
  return { X: X, Y: Y };
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료가 교과서의 규칙과 어떻게 맞았는지 적어 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 이온화 에너지", title: "이온화 에너지의 봉우리", short: "봉우리",
    who: "⚡", name: "원자 분광 연구실",
    say: "“원자에서 전자 하나를 떼어 내는 데 드는 에너지를 <b>첫 이온화 에너지</b>라고 해요. 아래는 원자 번호 1~36의 <b>실제 측정값</b>입니다. 그래프에 봉우리가 되풀이되는 게 보이나요? <b>2주기와 3주기에서 각각 가장 큰 원소</b>를 찾아 주세요.”",
    predict: {
      q: "같은 주기에서 이온화 에너지가 가장 큰 원소는 어느 족일까요?",
      options: ["㉠ 1족(알칼리 금속)", "㉡ 17족(할로젠)", "㉢ 18족(비활성 기체)"],
      answer: 2
    },
    task: "슬라이더 두 개로 <b>2주기(Li ~ Ne)</b>와 <b>3주기(Na ~ Ar)</b>에서 이온화 에너지가 가장 큰 원소를 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, a = 3, b = 11;
      function draw() {
        var mk = {}; mk[a] = "--coral-700"; mk[b] = "--amber-700";
        plot(H, ctx, W, cv.H, 1, 36, mk);
        H.text(ctx, "2주기 고른 원소: " + sym(a) + " " + ie(a).toFixed(2) + " eV", 520, 40, { s: 12.5, w: "800", c: H.v("--coral-700") });
        H.text(ctx, "3주기 고른 원소: " + sym(b) + " " + ie(b).toFixed(2) + " eV", 520, 62, { s: 12.5, w: "800", c: H.v("--amber-700") });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "2주기에서 고른 원소", min: 3, max: 10, step: 1, value: 3, fmt: function (x) { return x + "번 " + sym(x); }, onInput: function (x) { a = x; api.changed(); draw(); } });
      api.slider({ label: "3주기에서 고른 원소", min: 11, max: 18, step: 1, value: 11, fmt: function (x) { return x + "번 " + sym(x); }, onInput: function (x) { b = x; api.changed(); draw(); } });
      api.info("점선은 주기가 바뀌는 곳입니다. " + SRC
        + "<div data-link='{\"id\":\"pubchem-ie\",\"title\":\"PubChem 주기율표\",\"src\":\"미국 국립보건원\",\"url\":\"https://pubchem.ncbi.nlm.nih.gov/periodic-table/\",\"ask\":\"보기 방식을 Ionization Energy로 바꿔, 4주기(K ~ Kr)에서 가장 큰 원소와 그 값을 찾아 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var ok2 = a === 10, ok3 = b === 18;
          if (ok2 && ok3) return { ok: true, msg: "네온 21.56 eV, 아르곤 15.76 eV — 두 주기 모두 18족이 봉우리입니다." };
          return { ok: false, msg: (ok2 ? "2주기는 맞았습니다. " : "2주기의 " + sym(a) + "보다 큰 원소가 있습니다. ") + (ok3 ? "3주기는 맞았습니다." : "3주기의 " + sym(b) + "보다 큰 원소가 있습니다.") };
        }
      };
    },
    hints: ["그래프에서 각 주기의 오른쪽 끝을 보세요.", "주기마다 가장 높은 점은 마지막 원소입니다."],
    solution: "2주기 <b>네온(10번)</b>, 3주기 <b>아르곤(18번)</b> — 모두 18족.",
    why: "같은 주기에서는 오른쪽으로 갈수록 핵의 양전하가 커져 원자가 전자를 세게 당기므로 이온화 에너지가 대체로 커지고, 전자 껍질이 꽉 찬 18족에서 가장 큽니다. 다음 주기의 1족은 전자가 새 껍질에 들어가 핵에서 멀어지므로 이온화 에너지가 뚝 떨어집니다. 이 봉우리가 주기마다 되풀이되는 것이 <b>주기성</b>입니다.<br>"
      + "주기율표는 이런 측정값이 쌓인 결과입니다. 18족이 반응을 거의 하지 않고, 1족이 전자를 쉽게 잃어 양이온이 되는 까닭도 이 그래프로 설명됩니다."
  },
  {
    id: "r2", tag: "실제 자료 · 규칙의 예외", title: "규칙대로 가지 않는 두 곳", short: "예외",
    who: "🔍", name: "자료 분석 동아리",
    say: "“‘같은 주기에서는 오른쪽으로 갈수록 이온화 에너지가 커진다’고 배웠어요. 그런데 2주기 실제 자료를 하나씩 보면 <b>앞 원소보다 오히려 작아지는 곳이 두 군데</b> 있어요. 그 두 원소를 찾아 주세요.”",
    predict: {
      q: "실제 측정값이 교과서의 규칙과 조금 다를 때, 과학자는 어떻게 할까요?",
      options: ["㉠ 측정이 틀렸다고 보고 지운다", "㉡ 규칙을 통째로 버린다", "㉢ 큰 흐름은 규칙으로 두고, 예외가 생기는 까닭을 더 자세한 원리로 설명한다"],
      answer: 2
    },
    task: "슬라이더 두 개로 2주기에서 <b>앞 원소보다 이온화 에너지가 작아지는 원소 두 개</b>를 고르세요(앞쪽 하나, 뒤쪽 하나).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, a = 4, b = 7;
      function draw() {
        var mk = {}; mk[a] = "--coral-700"; mk[b] = "--amber-700";
        var p = plot(H, ctx, W, cv.H, 3, 10, mk);
        for (var z = 4; z <= 10; z++) {
          var d = ie(z) - ie(z - 1);
          H.text(ctx, (d >= 0 ? "+" : "") + d.toFixed(2), (p.X(z) + p.X(z - 1)) / 2, p.Y((ie(z) + ie(z - 1)) / 2) - 8, { s: 10.5, w: "800", a: "center", c: d < 0 ? H.v("--rose-700") : H.v("--mist") });
        }
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "앞쪽 예외", min: 4, max: 7, step: 1, value: 4, fmt: function (x) { return x + "번 " + sym(x) + " " + ie(x).toFixed(2) + " eV"; }, onInput: function (x) { a = x; api.changed(); draw(); } });
      api.slider({ label: "뒤쪽 예외", min: 7, max: 10, step: 1, value: 7, fmt: function (x) { return x + "번 " + sym(x) + " " + ie(x).toFixed(2) + " eV"; }, onInput: function (x) { b = x; api.changed(); draw(); } });
      api.info("점과 점 사이의 숫자는 앞 원소와의 차이(eV)입니다. " + SRC);
      draw();
      return {
        judge: function () {
          var ok1 = a === 5, ok2 = b === 8;
          if (ok1 && ok2) return { ok: true, msg: "붕소(8.30) < 베릴륨(9.32), 산소(13.62) < 질소(14.53) — 두 곳에서 흐름이 꺾입니다." };
          return { ok: false, msg: (ok1 ? "앞쪽은 맞았습니다. " : KN[a] + "의 값은 앞 원소보다 큽니다. ") + (ok2 ? "뒤쪽은 맞았습니다." : KN[b] + "의 값은 앞 원소보다 " + (ie(b) > ie(b - 1) ? "큽니다." : "작지만 앞쪽과 같은 곳이에요.")) };
        }
      };
    },
    hints: ["빨간 숫자(음수)가 붙은 곳을 찾으세요.", "Be → B, N → O 사이를 보세요."],
    solution: "<b>붕소(5번)</b>와 <b>산소(8번)</b>.",
    why: "붕소는 2p 오비탈에 처음 들어간 전자를 떼어 내는데, 이 전자는 2s 전자보다 에너지가 조금 높아 떼기 쉽습니다. 산소는 2p 오비탈 하나에 전자 두 개가 짝지어 들어가 서로 밀어내므로, 질소보다 전자 하나를 떼기가 쉬워요(자세한 원리는 화학 과목에서 배웁니다).<br>"
      + "실제 자료는 교과서의 규칙보다 울퉁불퉁합니다. 큰 흐름(주기성)은 그대로 두고, 예외가 나온 자리에서 더 깊은 원리를 찾아내는 것이 과학이 발전하는 방식입니다."
  }
  ]
});
})();
