/* 통합과학1 Ⅰ-1 과학의 기본량 — 실제 자료
   r1 하루는 정말 86,400 초일까 — 지구 자전으로 잰 하루와 원자시계의 초(IERS)
   r2 보이저 1호의 빛 소식은 몇 시간 걸려 올까 — 과학적 표기법과 단위 바꾸기(NASA JPL)
   자료: data/iers-lod.js, data/voyager1.js */
(function () {
"use strict";
var LOD = (window.REAL_LOD || { rows: [] }).rows;               /* [연도, 초과 ms, 윤초 수, 날수] */
var VOY = (window.REAL_VOYAGER || { rows: [] }).rows;           /* [연도, au] */
function lodOf(y) { for (var i = 0; i < LOD.length; i++) if (LOD[i][0] === y) return LOD[i]; return null; }
var L72 = lodOf(1972) || [1972, 3.1, 0], DRIFT = L72[1] * 365.25 / 1000;
var LEAPS = LOD.reduce(function (s, r) { return s + r[2]; }, 0), LASTLEAP = LOD.reduce(function (s, r) { return r[2] ? r[0] : s; }, 0);
var V26 = VOY.length ? VOY[VOY.length - 1] : [2026, 170], AU = 1.496e8, C = 299792.458, LT = V26[1] * AU / C / 3600;
var SRC1 = "<small>출처: 국제 지구 자전·좌표계 사업(IERS) EOP 20 C04(파리 천문대) — 하루 길이가 86,400 SI 초보다 긴 시간(LOD)의 연평균과 윤초. 사본은 data/iers-lod.js.</small>";
var SRC2 = "<small>출처: NASA 제트추진연구소(JPL) Horizons 시스템, 보이저 1호의 지구 중심 거리(매년 1월 1일). 1 au(천문단위) = 1.496 × 10⁸ km, 빛의 속력 = 2.998 × 10⁵ km/s. 사본은 data/voyager1.js.</small>";

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 시간·길이의 기본 단위를 왜 자연 상수로 정하는지 실제 자료로 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 시간의 표준", title: "하루는 정말 86,400 초일까", short: "하루의 길이",
    who: "⏱️", name: "표준 시각 연구실",
    say: "“예전에는 지구가 한 바퀴 도는 시간(하루)을 86,400 으로 나눈 것이 1 초였어요. 지금은 세슘 원자가 내는 빛이 9,192,631,770 번 진동하는 시간이 1 초입니다. 아래는 원자시계로 잰 <b>실제 하루의 길이가 86,400 초보다 얼마나 길었는지</b>(밀리초, ms)를 해마다 평균한 값이에요. 1972년의 값으로 <b>그해 한 해 동안 쌓인 어긋남(초)</b>을 구해 주세요.”",
    predict: {
      q: "지구가 한 바퀴 도는 시간은 해마다 똑같을까요?",
      options: ["㉠ 정확히 똑같아서 시계의 기준으로 완벽하다", "㉡ 1천분의 몇 초씩 들쭉날쭉해, 정밀한 기준으로는 원자시계가 필요하다", "㉢ 해마다 1 분씩 늘어난다"],
      answer: 1
    },
    task: "그래프에서 1972년의 값을 읽고, 1년(365.25 일) 동안 쌓인 어긋남을 슬라이더로 맞추세요(± 0.1 초).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, yr = 1972, g = 0;
      var x0 = 60, x1 = 640, y0 = 24, y1 = 230;
      function X(y) { return x0 + (y - 1962) / (2026 - 1962) * (x1 - x0); }
      function Y(v) { return y1 - (v + 1) / 5 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        [-1, 0, 1, 2, 3, 4].forEach(function (v) { H.text(ctx, v + " ms", x0 - 6, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        H.dash(ctx, x0, Y(0), x1, Y(0), H.v("--line"), 1);
        [1970, 1980, 1990, 2000, 2010, 2020].forEach(function (y) { H.text(ctx, y, X(y), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
        LOD.forEach(function (r) { if (r[2]) H.box(ctx, X(r[0]) - 2, y1 - r[2] * 10, 4, r[2] * 10, H.v("--coral-700"), 0.8); });
        H.line(ctx, LOD.map(function (r) { return [X(r[0]), Y(r[1])]; }), H.v("--brand"), 2.2);
        var R = lodOf(yr) || L72; H.dot(ctx, X(yr), Y(R[1]), 6, H.v("--amber-700"));
        H.text(ctx, "빨간 막대 = 그해 넣은 윤초(1 초)", x0 + 8, y0 + 4, { s: 11, w: "800", c: H.v("--coral-700") });
        H.rows(ctx, 680, 40, [["고른 해", yr + "년", "--amber-700"], ["하루가 더 길었던 시간", R[1].toFixed(2) + " ms"], ["그해 윤초", R[2] + " 번"], ["내 답 (한 해 어긋남)", g.toFixed(2) + " 초", null, true]], 52);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "읽을 해", min: 1962, max: 2026, step: 1, value: 1972, fmt: function (x) { return x + "년"; }, onInput: function (x) { yr = x; draw(); } });
      api.slider({ label: "1972년 한 해 동안 쌓인 어긋남", min: 0, max: 3, step: 0.02, value: 0, fmt: function (x) { return x.toFixed(2) + " 초"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("1 ms = 0.001 초. 하루마다 조금씩 길어진 시간을 1년치 모두 더해 보세요. " + SRC1
        + "<div data-link='{\"id\":\"iers-leap\",\"title\":\"IERS 공지 C — 윤초\",\"src\":\"국제 지구 자전·좌표계 사업\",\"url\":\"https://hpiers.obspm.fr/iers/bul/bulc/bulletinc.dat\",\"ask\":\"가장 최근 공지에서 ‘다음에 윤초를 넣는다/넣지 않는다’ 중 어느 쪽인지, 그리고 지금 UTC 와 원자시(TAI)가 몇 초 차이 나는지 찾아 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(g - DRIFT) <= 0.1) return { ok: true, msg: L72[1].toFixed(2) + " ms × 365.25 ≈ " + DRIFT.toFixed(2) + " 초 — 그래서 1972년에는 윤초를 두 번 넣었습니다(6월·12월)." };
          return { ok: false, msg: g.toFixed(2) + " 초는 " + (g < DRIFT ? "적습니다" : "많습니다") + ". 1972년 값(ms)에 365.25 를 곱하고 1000 으로 나누세요." };
        }
      };
    },
    hints: ["1972년의 값은 약 " + L72[1].toFixed(1) + " ms 입니다.", L72[1].toFixed(2) + " ms × 365.25 ÷ 1000 = ? 초"],
    solution: L72[1].toFixed(2) + " × 365.25 ÷ 1000 ≈ <b>" + DRIFT.toFixed(2) + " 초</b>.",
    why: "지구의 자전은 밀물·썰물의 마찰, 대기와 바다의 움직임, 지구 내부의 변화 때문에 1천분의 몇 초씩 빨라졌다 느려졌다 합니다. 하루에 3 ms 라도 1년이면 1 초가 넘게 쌓여, 지구 자전으로 정한 시각과 원자시계가 어긋납니다. 그래서 1967년에 1 초를 세슘 원자의 진동으로 다시 정했고, 둘의 차이가 0.9 초를 넘지 않게 1972년부터 " + LASTLEAP + "년까지 윤초를 " + LEAPS + "번 넣었습니다.<br>"
      + "2020년 무렵부터는 지구가 오히려 조금 빨리 돌아(값이 0 아래) 윤초가 필요 없었고, 국제도량형총회는 2035년까지 윤초를 없애기로 했습니다. 기본 단위를 변하지 않는 자연 상수로 정하는 까닭이 바로 이것입니다."
  },
  {
    id: "r2", tag: "실제 자료 · 우주의 스케일", title: "보이저 1호의 소식은 몇 시간 걸려 올까", short: "보이저 1호",
    who: "🛰️", name: "심우주 통신 센터",
    say: "“1977년에 떠난 보이저 1호는 사람이 만든 것 가운데 가장 멀리 간 물체예요. NASA 가 계산한 실제 위치로 보면 <b>" + V26[0] + "년 1월 1일</b>에 지구에서 <b>" + V26[1].toFixed(2) + " au</b> 떨어져 있었습니다. 1 au = 1.496 × 10⁸ km, 빛의 속력은 약 3.0 × 10⁵ km/s 입니다. 보이저가 보낸 전파(빛)가 지구에 닿기까지 <b>몇 시간</b> 걸릴까요?”",
    predict: {
      q: "보이저 1호의 신호가 지구에 오는 데 걸리는 시간은 대략?",
      options: ["㉠ 몇 초", "㉡ 몇 분", "㉢ 하루 가까이"],
      answer: 2
    },
    task: "거리를 km 로 바꾸고 빛의 속력으로 나누어, 신호가 오는 데 걸리는 시간을 슬라이더로 맞추세요(± 0.3 시간).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, h = 1;
      var x0 = 60, x1 = 600, y0 = 24, y1 = 230;
      function X(y) { return x0 + (y - 1980) / (2026 - 1980) * (x1 - x0); }
      function Y(a) { return y1 - a / 180 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        [0, 50, 100, 150].forEach(function (a) { H.text(ctx, a + " au", x0 - 6, Y(a) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        [1980, 1990, 2000, 2010, 2020].forEach(function (y) { H.text(ctx, y, X(y), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
        H.line(ctx, VOY.map(function (r) { return [X(r[0]), Y(r[1])]; }), H.v("--brand"), 2.5);
        H.dot(ctx, X(V26[0]), Y(V26[1]), 6, H.v("--amber-700"));
        H.text(ctx, "명왕성 궤도 ≈ 40 au", X(1981), Y(40) - 6, { s: 10, c: H.v("--mist") }); H.dash(ctx, x0, Y(40), x1, Y(40), H.v("--line"), 1);
        H.rows(ctx, 640, 40, [[V26[0] + "년 거리", V26[1].toFixed(2) + " au"], ["1 au", "1.496 × 10⁸ km"], ["내 답 (빛이 오는 시간)", h.toFixed(1) + " 시간", null, true]], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "신호가 오는 데 걸리는 시간", min: 0, max: 30, step: 0.1, value: 1, fmt: function (x) { return x.toFixed(1) + " 시간"; }, onInput: function (x) { h = x; api.changed(); draw(); } });
      api.info("시간 = 거리 ÷ 속력. 초로 나온 값을 3,600 으로 나누면 시간입니다. " + SRC2
        + "<div data-link='{\"id\":\"voyager-now\",\"title\":\"NASA — 보이저 1·2호는 지금 어디에?\",\"src\":\"미국 항공우주국\",\"url\":\"https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/\",\"ask\":\"오늘 보이저 1호까지의 거리(km)와 빛이 오가는 시간(round-trip light time)을 찾아, 이 사례의 값과 비교해 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(h - LT) <= 0.3) return { ok: true, msg: V26[1].toFixed(2) + " × 1.496 × 10⁸ km ≈ " + (V26[1] * AU / 1e10).toFixed(2) + " × 10¹⁰ km, ÷ 3.0 × 10⁵ km/s ≈ " + (V26[1] * AU / C / 1e4).toFixed(2) + " × 10⁴ 초 ≈ " + LT.toFixed(1) + " 시간." };
          return { ok: false, msg: h.toFixed(1) + " 시간은 " + (h < LT ? "짧습니다" : "깁니다") + ". 지수끼리 먼저 나누면 계산이 쉬워요(10¹⁰ ÷ 10⁵ = 10⁵)." };
        }
      };
    },
    hints: [V26[1].toFixed(2) + " × 1.496 × 10⁸ ≈ 2.5 × 10¹⁰ km 입니다.", "2.5 × 10¹⁰ ÷ 3.0 × 10⁵ ≈ 8.5 × 10⁴ 초. 3,600 으로 나누세요."],
    solution: "약 <b>" + LT.toFixed(1) + " 시간</b> — 하루(24 시간)에 거의 닿았습니다.",
    why: "아주 크거나 작은 수는 a × 10ⁿ 꼴의 과학적 표기로 쓰면 곱셈·나눗셈이 지수의 덧셈·뺄셈이 되어 계산이 쉬워집니다. 보이저 1호는 해마다 약 3.6 au 씩 멀어져, " + V26[0] + "년 말에는 빛으로 꼬박 하루 걸리는 거리(1 광일 ≈ 173 au)에 이릅니다. 지구에서 명령을 보내면 대답을 듣기까지 이틀이 걸리는 셈이에요.<br>"
      + "거리를 km 로만 쓰면 0 이 너무 많아 감이 오지 않습니다. 그래서 천문학에서는 au, 광년 같은 큰 단위를 함께 씁니다."
  }
  ]
});
})();
