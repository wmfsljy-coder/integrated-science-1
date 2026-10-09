/* 통합과학1 Ⅲ-2 역학 시스템 — 실제 자료
   r1 볼트의 100 m — 가장 빠른 10 m 구간
   r2 최고 속력은 시속 몇 km이고, 출발 직후 가속도는 얼마인가
   자료: 2009 베를린 세계육상선수권 남자 100 m 결승(9.58초) 10 m 구간 기록
         (국제육상경기연맹 생체역학 보고서, Graubner & Nixdorf 2011). 출발 반응 시간 0.146 초가 첫 구간에 들어 있다. */
(function () {
"use strict";
var CUM = [1.89, 2.88, 3.78, 4.64, 5.47, 6.29, 7.10, 7.92, 8.75, 9.58];   /* 10 m마다 누적 시간(초) */
var SPL = CUM.map(function (t, i) { return +(t - (i ? CUM[i - 1] : 0)).toFixed(2); });
var SRC = "<small>출처: 국제육상경기연맹(IAAF) 2009 베를린 세계선수권 생체역학 보고서(Graubner & Nixdorf, 2011), 우사인 볼트 9.58 초 결승의 10 m 구간 기록. 첫 구간에는 출발 신호에 반응한 시간 0.146 초가 들어 있습니다.</small>";

function bars(H, ctx, W, CH, pick) {
  H.paper(ctx, W, CH);
  var x0 = 60, y0 = 24, y1 = CH - 40, bw = 52;
  function Y(t) { return y1 - t / 2 * (y1 - y0); }
  H.axes(ctx, x0, y0, x0 + 10 * (bw + 8) + 10, y1);
  [0, 0.5, 1, 1.5, 2].forEach(function (t) { H.text(ctx, t.toFixed(1), x0 - 8, Y(t) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  H.text(ctx, "10 m를 달리는 데 걸린 시간 (초)", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
  SPL.forEach(function (s, i) {
    var x = x0 + 10 + i * (bw + 8), on = pick === i + 1;
    H.box(ctx, x, Y(s), bw, y1 - Y(s), on ? H.v("--coral-700") : H.v("--brand"), on ? 0.95 : 0.6);
    H.text(ctx, s.toFixed(2), x + bw / 2, Y(s) - 5, { s: 11, w: "800", a: "center", c: on ? H.v("--coral-700") : H.v("--mist") });
    H.text(ctx, (i * 10) + "~" + (i * 10 + 10), x + bw / 2, y1 + 15, { s: 10, a: "center", c: H.v("--mist") });
  });
  H.text(ctx, "구간 (m)", x0 + 10 * (bw + 8) - 30, y1 + 30, { s: 10, w: "700", c: H.v("--mist") });
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 속력과 가속도로 볼트의 달리기를 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "02", tag: "실제 자료 · 세계 기록의 구간 시간", title: "볼트는 어디에서 가장 빨랐을까", short: "가장 빠른 구간",
    who: "🏃", name: "육상 경기 분석가",
    say: "“2009년 베를린에서 우사인 볼트가 100 m를 <b>9.58 초</b>에 달렸어요. 연맹은 10 m마다 몇 초에 지났는지를 기록했습니다. 아래 막대는 <b>각 10 m 구간을 달린 시간</b>이에요. 볼트가 <b>가장 빨랐던 구간</b>을 찾아 주세요.”",
    predict: {
      q: "100 m 달리기에서 가장 빠른 때는 언제일까요?",
      options: ["㉠ 출발 직후", "㉡ 중간을 조금 지난 때", "㉢ 결승선 바로 앞"],
      answer: 1
    },
    task: "슬라이더로 구간을 골라 <b>10 m를 가장 짧은 시간에 달린 구간</b>을 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, k = 1;
      function draw() {
        bars(H, ctx, W, cv.H, k);
        var v = 10 / SPL[k - 1];
        H.rows(ctx, 690, 50, [["고른 구간", ((k - 1) * 10) + " ~ " + (k * 10) + " m"], ["걸린 시간", SPL[k - 1].toFixed(2) + " 초"], ["평균 속력", v.toFixed(2) + " m/s", "--coral-700", true]], 56);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "구간", min: 1, max: 10, step: 1, value: 1, fmt: function (x) { return ((x - 1) * 10) + " ~ " + (x * 10) + " m"; }, onInput: function (x) { k = x; api.changed(); draw(); } });
      api.info("속력 = 거리 ÷ 시간. 같은 10 m라면 시간이 짧을수록 빠릅니다. " + SRC
        + "<div data-map='{\"id\":\"berlin\",\"name\":\"베를린 올림피아슈타디온\",\"lat\":52.5147,\"lng\":13.2395,\"zoom\":17,\"ask\":\"트랙의 곧은 주로를 찾아, 지도 아래의 축척 막대로 길이를 어림해 보세요. 100 m가 다 들어가나요?\"}'></div>");
      draw();
      return {
        judge: function () {
          var best = SPL.indexOf(Math.min.apply(null, SPL)) + 1;
          if (k === best) return { ok: true, msg: "60~70 m 구간 0.81 초 → 평균 " + (10 / 0.81).toFixed(2) + " m/s로 가장 빨랐습니다." };
          return { ok: false, msg: ((k - 1) * 10) + " ~ " + (k * 10) + " m는 " + SPL[k - 1].toFixed(2) + " 초입니다. 더 짧은 막대가 있습니다." };
        }
      };
    },
    hints: ["막대가 가장 낮은 구간을 찾으세요.", "60 m와 70 m 사이를 보세요."],
    solution: "<b>60~70 m</b> 구간 (0.81 초, 약 12.3 m/s).",
    why: "출발 직후에는 정지 상태에서 속력을 올리는 중이라 구간 시간이 깁니다. 60~70 m 구간에서 속력이 가장 커졌다가, 끝으로 갈수록 몸이 지쳐 조금씩 느려집니다(0.81 → 0.83 초). 세계 최고의 선수도 마지막 30 m 에서는 <b>감속</b>을 합니다. 이기는 선수는 덜 느려지는 선수입니다.<br>"
      + "평균 속력(100 m ÷ 9.58 초 = 10.44 m/s)은 이런 변화를 모두 뭉뚱그린 값이라, 구간 기록이 있어야 운동을 자세히 볼 수 있습니다."
  },
  {
    id: "r2", sec: "02", tag: "실제 자료 · 속력과 가속도", title: "최고 속력은 시속 몇 km 일까", short: "최고 속력",
    who: "🚗", name: "과학 기자",
    say: "“독자들이 ‘볼트는 자동차만큼 빠른가?’ 물어 와요. 가장 빠른 10 m 구간의 기록으로 <b>최고 속력을 시속(km/h)</b>으로 바꿔 주세요. 1 m/s는 3.6 km/h입니다.”",
    predict: {
      q: "볼트의 최고 속력은 대략 얼마일까요?",
      options: ["㉠ 시속 약 25 km", "㉡ 시속 약 45 km", "㉢ 시속 약 80 km"],
      answer: 1
    },
    task: "가장 빠른 구간의 평균 속력을 km/h로 바꿔 슬라이더로 맞추세요(± 0.6 km/h).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, kmh = 30;
      function draw() {
        bars(H, ctx, W, cv.H, 7);
        H.rows(ctx, 690, 50, [["내가 맞춘 최고 속력", kmh.toFixed(1) + " km/h", null, true], ["= 초속", (kmh / 3.6).toFixed(2) + " m/s"], ["100 m 평균", (100 / 9.58 * 3.6).toFixed(1) + " km/h"]], 56);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "최고 속력", min: 30, max: 60, step: 0.5, value: 30, fmt: function (x) { return x.toFixed(1) + " km/h"; }, onInput: function (x) { kmh = x; api.changed(); draw(); } });
      api.info("가장 빠른 구간: 60~70 m, 0.81 초. " + SRC);
      draw();
      return {
        judge: function () {
          var t = 10 / 0.81 * 3.6;
          if (Math.abs(kmh - t) <= 0.6) return { ok: true, msg: "10 ÷ 0.81 = 12.35 m/s, × 3.6 = 약 " + t.toFixed(1) + " km/h입니다." };
          return { ok: false, msg: kmh.toFixed(1) + " km/h는 " + (kmh < t ? "작습니다" : "큽니다") + ". 먼저 m/s를 구한 뒤 3.6을 곱하세요." };
        }
      };
    },
    hints: ["10 m ÷ 0.81 초 = ? m/s", "12.35 m/s × 3.6 = ? km/h"],
    solution: "10 ÷ 0.81 ≈ 12.35 m/s → <b>약 44.4 km/h</b>.",
    why: "시속 약 44 km는 도심 도로를 달리는 자동차 속력쯤입니다. 볼트는 반응 시간을 빼면 첫 10 m를 약 1.74 초에 달렸습니다. 정지 상태에서 일정하게 빨라졌다고 보면 가속도는 2 × 10 ÷ 1.74² ≈ 6.6 m/s²로, 중력 가속도의 3분의 2쯤 되는 큰 값입니다. 이렇게 큰 가속도를 내려면 발이 땅을 뒤로 세게 밀고, 땅이 그만큼 몸을 앞으로 밀어 주어야 합니다(작용 반작용).<br>"
      + "구간 기록 하나로 속력·가속도·힘까지 이어서 따질 수 있습니다. 운동을 숫자로 기록하는 까닭입니다."
  }
  ]
});
})();
