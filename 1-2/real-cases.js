/* 통합과학1 Ⅰ-2 과학의 측정과 우리 사회 — 실제 자료
   r1 GPS는 몇 mm까지 잴까 — 수원 관측소의 하루하루 위치(정밀도, 2024년 2월 하순 ~ 3월)
   r2 2011년 3월 11일, 수원이 움직였다 — 1,200 km 떨어진 동일본 대지진
   자료: data/gps-suwn.js (네바다 대학교 측지 연구소 GPS 시계열, 수원 SUWN, IGS20) */
(function () {
"use strict";
var G = window.REAL_GPS || { weekly: [], d2011: [], d2024: [] };
function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / (a.length || 1); }
/* 2024년 2월 21일 ~ 4월 1일: 직선(꾸준한 이동)을 빼고 남은 하루하루의 흩어짐 */
var D4 = G.d2024, FIT4 = (function () { var x = D4.map(function (r) { return r[1]; }), y = D4.map(function (r) { return r[2]; }), mx = mean(x), my = mean(y), b = 0, q = 0; x.forEach(function (v, i) { b += (v - mx) * (y[i] - my); q += (v - mx) * (v - mx); }); b = q ? b / q : 0; return { b: b, a: my - b * mx }; })();
var RES4 = D4.map(function (r) { return r[2] - (FIT4.a + FIT4.b * r[1]); }), SD4 = Math.sqrt(mean(RES4.map(function (v) { return v * v; })));
var D1 = G.d2011, EQ = 2011.1889;                                     /* 2011-03-11 05:46 UTC */
var PRE = D1.filter(function (r) { return r[1] < EQ - 0.001; }).map(function (r) { return r[2]; }), POST = D1.filter(function (r) { return r[1] > EQ + 0.0065; }).map(function (r) { return r[2]; });
var JUMP = mean(POST) - mean(PRE);
var SRC = "<small>출처: 네바다 대학교 측지 연구소(Nevada Geodetic Laboratory) GPS 시계열, 수원 SUWN 관측소(북위 37.28°, 동경 127.05°), IGS20 좌표계 하루 해. Blewitt, Hammond & Kreemer (2018). 사본은 data/gps-suwn.js.</small>";

function plot(H, ctx, W, CH, rows, ix, iy, col, opt) {
  H.paper(ctx, W, CH);
  var x0 = 70, x1 = 640, y0 = 24, y1 = CH - 36;
  var xs = rows.map(function (r) { return r[ix]; }), ys = rows.map(function (r) { return r[iy]; });
  var xa = Math.min.apply(null, xs), xb = Math.max.apply(null, xs), ya = opt.ya != null ? opt.ya : Math.min.apply(null, ys), yb = opt.yb != null ? opt.yb : Math.max.apply(null, ys);
  function X(v) { return x0 + (v - xa) / (xb - xa || 1) * (x1 - x0); }
  function Y(v) { return y1 - (v - ya) / (yb - ya || 1) * (y1 - y0); }
  H.axes(ctx, x0, y0, x1, y1);
  (opt.yt || []).forEach(function (v) { H.text(ctx, v + " mm", x0 - 6, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  (opt.xt || []).forEach(function (t) { H.text(ctx, t[1], X(t[0]), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
  rows.forEach(function (r) { H.dot(ctx, X(r[ix]), Y(r[iy]), opt.r || 2.4, H.v(col)); });
  return { X: X, Y: Y };
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 정밀한 측정이 사회에 어떻게 쓰이는지 실제 자료로 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 정밀도", title: "GPS는 몇 mm까지 잴까", short: "GPS 정밀도",
    who: "📡", name: "국토 측량 관측소",
    say: "“스마트폰 GPS는 위치가 몇 m씩 틀리기도 하죠. 그런데 측량용 GPS 관측소는 하루 동안 모은 신호로 위치를 계산합니다. 아래는 수원 관측소가 2024년 2월 하순 ~ 3월(39일) 동안 매일 잰 <b>동쪽 방향 위치</b>예요(땅이 꾸준히 움직이는 몫은 직선으로 빼고 남은 흩어짐). 하루하루 값이 <b>얼마나 흩어졌는지</b> 골라 주세요.”",
    predict: {
      q: "측량용 GPS가 하루하루 잰 위치는 얼마나 흩어질까요?",
      options: ["㉠ 몇 m — 스마트폰과 비슷하다", "㉡ 몇 cm", "㉢ 1 mm 안팎"],
      answer: 2
    },
    task: "점들의 흩어진 폭을 보고, 하루하루 위치의 흩어짐(표준 편차 — 값들이 평균에서 보통 벗어나는 정도)이 어느 정도인지 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, pick = "m";
      var rows = D4.map(function (r, i) { return [r[1], RES4[i]]; });
      function draw() {
        var p = plot(H, ctx, W, cv.H, rows, 0, 1, "--brand", { ya: -4, yb: 4, yt: [-4, -2, 0, 2, 4], xt: [[2024.1393, "2월 21일"], [2024.1639, "3월 1일"], [2024.2459, "4월 1일"]], r: 3.4 });
        H.dash(ctx, 70, p.Y(SD4), 640, p.Y(SD4), H.v("--amber-700"), 1); H.dash(ctx, 70, p.Y(-SD4), 640, p.Y(-SD4), H.v("--amber-700"), 1);
        H.rows(ctx, 680, 50, [["측정한 날", D4.length + " 일"], ["가장 크게 벗어난 값", Math.max.apply(null, RES4.map(Math.abs)).toFixed(1) + " mm"], ["노란 점선", "± 표준 편차"]], 60);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "하루하루 위치의 흩어짐", value: "m", options: [{ v: "m", t: "약 1 m" }, { v: "cm", t: "약 1 cm" }, { v: "mm", t: "약 1 mm" }, { v: "um", t: "약 0.001 mm" }], onPick: function (x) { pick = x; api.changed(); } });
      api.info("세로축 눈금이 mm입니다. " + SRC
        + "<div data-link='{\"id\":\"ngl-suwn\",\"title\":\"수원 SUWN 관측소 자료 쪽\",\"src\":\"네바다 대학교 측지 연구소\",\"url\":\"https://geodesy.unr.edu/NGLStationPages/stations/SUWN.sta\",\"ask\":\"관측소 쪽의 그래프에서 동쪽(East) 위치가 30년 가까이 어느 쪽으로 움직였는지, 한 해에 몇 mm 쯤인지 읽어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (pick === "mm") return { ok: true, msg: "표준 편차 약 " + SD4.toFixed(1) + " mm — 하루 동안 모은 신호로 계산하면 위치를 1 mm 안팎까지 정밀하게 잴 수 있습니다." };
          return { ok: false, msg: pick === "um" ? "그만큼 정밀하지는 않습니다. 점들이 몇 mm 범위에 흩어져 있습니다." : "눈금 단위를 다시 보세요. 세로축은 mm입니다." };
        }
      };
    },
    hints: ["세로축 한 칸은 2 mm입니다.", "대부분의 점이 ± 1 mm 안에 있습니다."],
    solution: "<b>약 1 mm</b> (표준 편차 약 " + SD4.toFixed(1) + " mm).",
    why: "같은 양을 여러 번 쟀을 때 값이 얼마나 모여 있는지가 <b>정밀도</b>, 참값에 얼마나 가까운지가 <b>정확도</b>입니다. 측량용 GPS는 여러 위성의 신호를 하루 동안 모으고, 위성 궤도·대기 지연·안테나 특성을 보정해 수평 위치를 1 mm 안팎(높이는 몇 mm)으로 정밀하게 정합니다. 국제 좌표계와 비교하는 기준점이 있어 정확도도 높습니다.<br>"
      + "이렇게 정밀한 기준점이 있어야 지도, 토지 경계, 자율 주행, 드론 배송, 지진 감시가 가능합니다. 측정 표준이 사회의 기반이 되는 예입니다."
  },
  {
    id: "r2", tag: "실제 자료 · 측정과 지진 감시", title: "2011년 3월 11일, 수원이 움직였다", short: "수원의 이동",
    who: "🌏", name: "지진 감시 센터",
    say: "“2011년 3월 11일, 수원에서 약 1,300 km 떨어진 일본 동북쪽 바다에서 규모 9.0 지진이 났어요. 그날 전후로 수원 관측소가 매일 잰 <b>동쪽 방향 위치</b>입니다. 지진 때 수원이 동쪽으로 <b>몇 mm</b> 움직였는지 구해 주세요.”",
    predict: {
      q: "1,200 km 떨어진 큰 지진 때 수원의 땅은?",
      options: ["㉠ 너무 멀어서 전혀 움직이지 않았다", "㉡ 몇 cm 움직였고, 정밀한 GPS로 잴 수 있다", "㉢ 몇 m 움직였다"],
      answer: 1
    },
    task: "지진 전과 후의 평균 위치 차이를 읽어, 수원이 동쪽으로 움직인 거리를 슬라이더로 맞추세요(± 4 mm).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, g = 0, view = "q";
      function draw() {
        if (view === "q") {
          var lo = Math.floor(Math.min.apply(null, D1.map(function (r) { return r[2]; })) / 10) * 10;
          var p = plot(H, ctx, W, cv.H, D1, 1, 2, "--brand", { ya: lo, yb: lo + 60, yt: [lo, lo + 20, lo + 40, lo + 60], xt: [[2011.085, "2월"], [2011.162, "3월"], [2011.247, "4월"]], r: 3 });
          H.dash(ctx, p.X(EQ), 24, p.X(EQ), cv.H - 36, H.v("--coral-700"), 1.5);
          H.text(ctx, "3월 11일", p.X(EQ) + 4, 36, { s: 11, w: "800", c: H.v("--coral-700") });
          H.dash(ctx, 70, p.Y(mean(PRE)), p.X(EQ), p.Y(mean(PRE)), H.v("--amber-700"), 1.2);
          H.dash(ctx, p.X(EQ), p.Y(mean(PRE) + g), 640, p.Y(mean(PRE) + g), H.v("--amber-700"), 2);
          H.text(ctx, "노란 선 = 지진 전 평균 + 내 답", 80, 36, { s: 10.5, w: "700", c: H.v("--amber-700") });
        } else {
          var lo2 = Math.min.apply(null, G.weekly.map(function (r) { return r[1]; }));
          plot(H, ctx, W, cv.H, G.weekly, 0, 1, "--brand", { ya: lo2, yb: Math.max.apply(null, G.weekly.map(function (r) { return r[1]; })), yt: [0, 200, 400, 600, 800], xt: [[2000, "2000"], [2010, "2010"], [2020, "2020"]], r: 1.4 });
          H.text(ctx, "1997년 말 ~ 2026 주간 평균: 한 해에 약 3 cm씩 동쪽으로", 80, 36, { s: 10.5, w: "700", c: H.v("--mist") });
        }
        H.rows(ctx, 680, 60, [["내 답 (동쪽으로)", g + " mm", null, true]], 60);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "보기", value: "q", options: [{ v: "q", t: "2011년 2~4월" }, { v: "all", t: "1997~2026 전체" }], onPick: function (x) { view = x; draw(); } });
      api.slider({ label: "지진 때 동쪽으로 움직인 거리", min: 0, max: 60, step: 1, value: 0, fmt: function (x) { return x + " mm"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("노란 굵은 선이 지진 뒤 점들 한가운데를 지나게 해 보세요. " + SRC
        + "<div data-map='{\"id\":\"suwn\",\"name\":\"수원 GPS 관측소 일대\",\"lat\":37.2755,\"lng\":127.0543,\"zoom\":16,\"ask\":\"관측소 안테나는 흔들리지 않는 단단한 곳에 세웁니다. 사진에서 어떤 건물·땅이 그런 자리로 보이는지 적어 보세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(g - JUMP) <= 4) return { ok: true, msg: "지진 전후 평균 차이 약 " + JUMP.toFixed(0) + " mm — 그중 약 26 mm는 3월 11일 하루 만에, 나머지는 지진 뒤 몇 주 동안 조금씩 더 움직인 몫입니다(일본 쪽, 동쪽으로)." };
          return { ok: false, msg: g + " mm는 " + (g < JUMP ? "작습니다" : "큽니다") + ". 3월 11일 전과 후 점들의 높이 차이를 보세요." };
        }
      };
    },
    hints: ["빨간 점선(3월 11일) 앞과 뒤의 점들 높이를 비교하세요.", "약 2~3 cm 차이가 납니다."],
    solution: "약 <b>" + JUMP.toFixed(0) + " mm</b> 동쪽으로.",
    why: "동일본 대지진 때 일본 동북부가 올라탄 판이 그 밑으로 파고드는 태평양판과의 경계에서 갑자기 미끄러져 동쪽으로 수 m 튕겨 나가면서, 약 1,300 km 떨어진 한반도의 땅까지 일본 쪽(동쪽)으로 몇 cm 끌려갔습니다. 몸으로는 전혀 느낄 수 없는 크기지만, mm까지 재는 GPS 로는 또렷하게 보입니다. 지진 뒤에도 한동안 조금씩 더 움직였습니다.<br>"
      + "전체 기간을 보면 수원은 지진과 상관없이 한 해에 약 3 cm씩 동쪽(조금 남쪽)으로 움직이는데, 이것은 한반도가 올라탄 판이 움직이는 속도입니다. 그래서 나라의 기준점 좌표도 몇 년마다 다시 정해야 합니다. 정밀한 측정이 국토 관리와 지진 연구에 쓰이는 예입니다."
  }
  ]
});
})();
