/* 통합과학1 Ⅲ-1 지구시스템 — 실제 자료
   r1 2023년 한 해, 규모 5 이상 지진 1,780건은 어디에 몰렸나
   r2 깊은 지진(300 km 아래)은 어디에서 일어나나
   자료: data/quakes-world-2023.js (미국 지질조사국 USGS 지진 목록, 공공 영역) */
(function () {
"use strict";
var Q = (window.REAL_QUAKES_WORLD || { rows: [] }).rows;   /* [위도, 경도, 깊이 km, 규모] */
var SRC = "<small>출처: 미국 지질조사국(USGS) Earthquake Catalog, 2023-01-01 ~ 12-31, 규모 5.0 이상 " + Q.length.toLocaleString() + "건. 사본은 이 단원의 data/quakes-world-2023.js.</small>";
var KB = [33, 39, 124, 131];                               /* 한반도 상자: 북위 33~39°, 동경 124~131° */

function world(H, ctx, W, CH, minDepth) {
  H.paper(ctx, W, CH);
  var x0 = 30, x1 = W - 30, y0 = 14, y1 = CH - 26;
  /* 태평양이 가운데 오게 경도 20° 를 왼쪽 끝으로 둔다 */
  function X(lon) { var l = lon - 20; if (l < 0) l += 360; return x0 + l / 360 * (x1 - x0); }
  function Y(lat) { return y0 + (80 - lat) / 150 * (y1 - y0); }
  ctx.fillStyle = H.v("--panel-2") || "rgba(120,140,170,.08)"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  ctx.save(); ctx.strokeStyle = H.v("--line"); ctx.lineWidth = 1;
  for (var la = -60; la <= 60; la += 30) { ctx.beginPath(); ctx.moveTo(x0, Y(la)); ctx.lineTo(x1, Y(la)); ctx.stroke(); }
  for (var lo = 20; lo < 380; lo += 60) { ctx.beginPath(); ctx.moveTo(X(lo), y0); ctx.lineTo(X(lo), y1); ctx.stroke(); }
  ctx.restore();
  [0, 30, 60, -30, -60].forEach(function (la) { H.text(ctx, (la > 0 ? "북위 " : (la < 0 ? "남위 " : "적도 ")) + (la ? Math.abs(la) + "°" : ""), x0 + 4, Y(la) - 3, { s: 9.5, c: H.v("--mist") }); });
  [80, 140, -160, -100, -40].forEach(function (lo) { H.text(ctx, (lo > 0 ? "동경 " : "서경 ") + Math.abs(lo) + "°", X(lo), y1 + 14, { s: 9.5, a: "center", c: H.v("--mist") }); });
  var n = 0;
  Q.forEach(function (q) {
    if (q[2] < minDepth) return; n++;
    var col = q[2] >= 300 ? "--rose-700" : (q[2] >= 70 ? "--amber-700" : "--brand");
    H.dot(ctx, X(q[1]), Y(q[0]), 1.2 + (q[3] - 5) * 1.1, H.v(col));
  });
  ctx.save(); ctx.strokeStyle = H.v("--green-700"); ctx.lineWidth = 2; ctx.strokeRect(X(KB[2]), Y(KB[1]), X(KB[3]) - X(KB[2]), Y(KB[0]) - Y(KB[1])); ctx.restore();
  H.text(ctx, "한반도", X(KB[2]) - 4, Y(KB[1]) - 4, { s: 10.5, w: "900", a: "right", c: H.v("--green-700") });
  return n;
}
function legend(H, ctx, x, y) {
  [["--brand", "얕음 (70 km 위)"], ["--amber-700", "중간 (70 ~ 300 km)"], ["--rose-700", "깊음 (300 km 아래)"]].forEach(function (l, i) {
    H.dot(ctx, x + i * 150, y, 4, H.v(l[0])); H.text(ctx, l[1], x + i * 150 + 9, y + 4, { s: 10.5, w: "700", c: H.v("--mist") });
  });
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 지진이 몰린 곳과 판의 경계를 이어 적어 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 지진 분포", title: "2023년 지진 1,780건은 어디에 몰렸나", short: "지진 지도",
    who: "🌏", name: "지진 관측 센터",
    say: "“2023년 한 해 동안 전 세계에서 일어난 <b>규모 5 이상 지진 " + Q.length.toLocaleString() + "건</b>을 실제 위치에 찍었습니다(해안선은 일부러 그리지 않았어요). 점이 어디에 몰렸는지 보고, 초록 상자로 표시한 <b>한반도 안</b>에는 몇 건이 있었는지 세어 주세요.”",
    predict: {
      q: "지진은 지구 표면에 어떻게 분포할까요?",
      options: ["㉠ 지구 전체에 고르게 퍼져 있다", "㉡ 좁은 띠를 따라 몰려 있다", "㉢ 대륙 한가운데에 몰려 있다"],
      answer: 1
    },
    task: "지도를 보고 <b>지진이 가장 많이 몰린 곳</b>과 <b>한반도 상자 안의 건수</b>를 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W, where = "even", kr = "many";
      function draw() { world(H, ctx, W, cv.H - 18, 0); legend(H, ctx, 40, cv.H - 6); }
      cv.canvas._redraw = draw;
      api.seg({ label: "지진이 가장 많이 몰린 곳", value: "even", options: [{ v: "even", t: "고르게 퍼짐" }, { v: "pac", t: "태평양 가장자리" }, { v: "atl", t: "대서양 한가운데" }, { v: "cont", t: "대륙 한가운데" }], onPick: function (x) { where = x; api.changed(); } });
      api.seg({ label: "한반도 상자 안 (규모 5 이상)", value: "many", options: [{ v: "0", t: "0 건" }, { v: "few", t: "1 ~ 5 건" }, { v: "mid", t: "6 ~ 20 건" }, { v: "many", t: "20 건 넘게" }], onPick: function (x) { kr = x; api.changed(); } });
      api.info("점의 크기는 규모, 색은 깊이입니다. 대서양 한가운데에도 가는 띠가 있어요. " + SRC
        + "<div data-link='{\"id\":\"usgs-map\",\"title\":\"USGS 실시간 지진 지도\",\"src\":\"미국 지질조사국\",\"url\":\"https://earthquake.usgs.gov/earthquakes/map/\",\"ask\":\"지난 며칠 동안 일어난 지진 가운데 가장 큰 것의 규모와 장소를 찾아 오세요.\"}'></div>");
      draw();
      var inK = Q.filter(function (q) { return q[0] >= KB[0] && q[0] <= KB[1] && q[1] >= KB[2] && q[1] <= KB[3]; }).length;
      return {
        judge: function () {
          var kOk = (kr === "0" && inK === 0) || (kr === "few" && inK >= 1 && inK <= 5);
          if (where === "pac" && kOk) {
            var pac = Q.filter(function (q) { return q[1] >= 120 || q[1] <= -60; }).length;
            return { ok: true, msg: "태평양 쪽(동경 120° ~ 서경 60°)에 " + pac + "건(" + Math.round(pac / Q.length * 100) + "%)이 몰렸고, 한반도 상자 안은 " + inK + "건입니다." };
          }
          if (where !== "pac") return { ok: false, msg: where === "atl" ? "대서양 한가운데에도 띠가 있지만, 가장 많이 몰린 곳은 아닙니다." : "점이 몰린 띠를 다시 보세요." };
          return { ok: false, msg: "한반도 상자 안의 점을 다시 세어 보세요." };
        }
      };
    },
    hints: ["지도 가운데가 태평양입니다. 태평양을 둘러싼 고리를 찾아보세요.", "초록 상자 안에 점이 하나라도 있나요?"],
    solution: "<b>태평양 가장자리</b>(환태평양 지진대), 한반도 상자 안 <b>0 건</b>.",
    why: "지진은 판과 판이 만나는 <b>경계</b>를 따라 좁은 띠로 일어납니다. 태평양판을 둘러싼 판의 경계가 ‘불의 고리’라 불리는 환태평양 지진대이고, 대서양 한가운데의 가는 띠는 판이 갈라지는 해령입니다. 한반도는 유라시아판 안쪽에 있어 규모 5 이상의 지진이 드뭅니다.<br>"
      + "하지만 드물 뿐 없지는 않습니다. 2016년 경주(규모 5.8), 2017년 포항(규모 5.4) 지진처럼 판 안쪽의 오래된 단층에서도 큰 지진이 날 수 있어, 우리나라도 내진 설계와 대피 훈련이 필요합니다."
  },
  {
    id: "r2", tag: "실제 자료 · 진원의 깊이", title: "깊은 지진은 어디에서 일어나나", short: "깊은 지진",
    who: "⛏️", name: "지구 내부 연구팀",
    say: "“같은 자료에서 <b>깊은 지진만</b> 남겨 봅시다. 진원의 깊이가 300 km 를 넘으면 맨틀 속이에요. 깊이 기준을 올려 가며 <b>300 km 보다 깊은 지진</b>만 남기고, 그 지진들이 몰린 곳에 무엇이 있는지 골라 주세요.”",
    predict: {
      q: "300 km 보다 깊은 곳에서도 지진이 일어날 수 있을까요?",
      options: ["㉠ 맨틀은 물렁해서 그렇게 깊은 지진은 없다", "㉡ 차가운 판이 맨틀 속으로 비스듬히 내려가는 곳에서는 일어난다", "㉢ 지구 어디에서나 일어난다"],
      answer: 1
    },
    task: "깊이 기준을 <b>300 km 이상</b>으로 올리고, 남은 지진이 몰린 곳의 공통점을 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W, dmin = 0, kind = "none";
      function draw() { var n = world(H, ctx, W, cv.H - 18, dmin); H.text(ctx, dmin + " km 보다 깊은 지진 " + n + " 건", 40, cv.H - 4, { s: 12.5, w: "900", c: H.v("--ink") }); }
      cv.canvas._redraw = draw;
      api.slider({ label: "남길 진원의 깊이", min: 0, max: 600, step: 50, value: 0, fmt: function (x) { return x + " km 아래만"; }, onInput: function (x) { dmin = x; api.changed(); draw(); } });
      api.seg({ label: "깊은 지진이 몰린 곳", value: "none", options: [{ v: "none", t: "아직 모르겠다" }, { v: "ridge", t: "해령 (판이 갈라지는 곳)" }, { v: "sub", t: "해구 근처 (판이 내려가는 곳)" }, { v: "hot", t: "하와이 같은 화산섬" }], onPick: function (x) { kind = x; api.changed(); } });
      api.info("남는 곳은 통가·피지 아래, 일본 남쪽 바다 아래, 남아메리카 서쪽 대륙 아래 같은 곳입니다. " + SRC
        + "<div data-map='{\"id\":\"tonga\",\"name\":\"통가 해구\",\"lat\":-21.5,\"lng\":-174.5,\"zoom\":6,\"ask\":\"섬들 동쪽으로 길게 뻗은 짙은 바다 골짜기(해구)가 보이나요? 깊은 지진은 해구의 어느 쪽(동쪽·서쪽) 아래에서 일어났는지 위 지도와 비교해 보세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var deep = Q.filter(function (q) { return q[2] >= 300; }).length;
          if (dmin < 300) return { ok: false, msg: "아직 얕은 지진이 섞여 있습니다. 깊이 기준을 300 km 이상으로 올려 보세요." };
          if (kind !== "sub") return { ok: false, msg: kind === "ridge" ? "해령의 지진은 대부분 얕습니다. 깊은 지진이 남은 곳은 해령이 아니에요." : "남은 점들이 어떤 지형 근처인지 다시 보세요." };
          return { ok: true, msg: "300 km 보다 깊은 지진 " + deep + "건이 모두 판이 맨틀로 내려가는 섭입대 아래에 있습니다." };
        }
      };
    },
    hints: ["슬라이더를 300 km 이상으로 옮기세요. 빨간 점만 남습니다.", "남은 곳은 모두 깊은 해구 바로 옆, 대륙이나 섬 쪽 아래입니다."],
    solution: "깊이 <b>300 km 이상</b>, 공통점은 <b>해구 근처(섭입대)</b>.",
    why: "해양판이 다른 판 밑으로 들어가는 <b>섭입대</b>에서는 차갑고 단단한 판이 맨틀 속으로 비스듬히 내려가, 깊이 700 km 가까이에서도 지진이 납니다. 해구에서 대륙(섬) 쪽으로 갈수록 진원이 깊어지는 이 지진 띠를 <b>베니오프대</b>라고 해요. 해령과 하와이 같은 열점의 지진은 대부분 얕습니다.<br>"
      + "진원의 깊이만 보아도 판이 어디로 내려가는지 알 수 있습니다. 지진은 지구 내부를 들여다보는 창이기도 해요."
  }
  ]
});
})();
