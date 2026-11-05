/* 통합과학1 Ⅲ-1 지구시스템 — 실제 자료
   r1 2023년 한 해, 규모 5 이상 지진 1,780건은 어디에 몰렸나
   r2 깊은 지진(300 km 아래)은 어디에서 일어나나
   r3 우리 동네 바다와 공기 — 바닷가 창원과 내륙 대구의 일교차(기상청, 2026)
   자료: data/quakes-world-2023.js (미국 지질조사국 USGS 지진 목록, 공공 영역) */
(function () {
"use strict";
var Q = (window.REAL_QUAKES_WORLD || { rows: [] }).rows;   /* [위도, 경도, 깊이 km, 규모] */
var SRC = "<small>출처: 미국 지질조사국(USGS) Earthquake Catalog, 2023-01-01~12-31, 규모 5.0 이상 " + Q.length.toLocaleString() + "건. 사본은 이 단원의 data/quakes-world-2023.js.</small>";
var ZD = window.REAL_CWDG || { cw: [], dg: [] };
function zMon(a, m) { var r = 0, n = 0, t = 0; a.forEach(function (d) { if (+d[0].slice(0, 2) === m && d[2] != null && d[3] != null) { r += d[2] - d[3]; t += d[1]; n++; } }); return n ? { r: r / n, t: t / n } : { r: 0, t: 0 }; }
function zAll(a) { var r = 0, n = 0; a.forEach(function (d) { if (d[2] != null && d[3] != null) { r += d[2] - d[3]; n++; } }); return n ? r / n : 0; }
var ZCW = [], ZDG = []; for (var zm = 1; zm <= 9; zm++) { ZCW.push(zMon(ZD.cw, zm)); ZDG.push(zMon(ZD.dg, zm)); }
var Z_RC = zAll(ZD.cw), Z_RD = zAll(ZD.dg), Z_DIFF = Z_RD - Z_RC;
var SRC_Z = "<small>출처: 기상청 날씨누리 과거 관측 일별 자료 — 창원(155, 바닷가 마산합포구 가포동)과 대구(143, 내륙 분지), 2026년 1월 1일 ~ 9월 30일 날마다 최고·최저 기온. 일교차 = 최고 − 최저. 사본은 data/cw-dg-2026.js.</small>";
var KB = [33, 39, 124, 131];                               /* 한반도 상자: 북위 33~39°, 동경 124~131° */

/* ---- 밝은 스튜디오 + 블록 모형 (../assets/kit.js 의 K.studio · K.iso · K.card) ---- */
var K = window.sthKit, LT = K.LT;
function lt(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function sideCard(ctx, x, W, H, title) { K.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
/* 입체 막대(앞면·윗면·옆면) */
function bar3(ctx, x, yb, w, h, d, col) {
  if (h < .5) return;
  ctx.fillStyle = K.tint(col, 1.2); ctx.beginPath(); ctx.moveTo(x, yb - h); ctx.lineTo(x + d, yb - h - d * .55); ctx.lineTo(x + w + d, yb - h - d * .55); ctx.lineTo(x + w, yb - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = K.tint(col, .72); ctx.beginPath(); ctx.moveTo(x + w, yb - h); ctx.lineTo(x + w + d, yb - h - d * .55); ctx.lineTo(x + w + d, yb - d * .55); ctx.lineTo(x + w, yb); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col; ctx.fillRect(x, yb - h, w, h);
}
function world(H, ctx, W, CH, minDepth) {
  /* 두께가 있는 세계 지도판(태평양이 가운데)을 스튜디오에 놓고, 지진을 깊이별 색 점으로 찍는다 */
  var FH = ctx.canvas._h || CH + 18;
  ctx.clearRect(0, 0, W, FH);
  K.studio(ctx, 0, 0, W, FH, { x: W / 2, y: CH - 10, rx: W * .48, ry: 16 });
  var x0 = 30, x1 = W - 30, y0 = 14, y1 = CH - 26;
  function X(lon) { var l = lon - 20; if (l < 0) l += 360; return x0 + l / 360 * (x1 - x0); }
  function Y(lat) { return y0 + (80 - lat) / 150 * (y1 - y0); }
  ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#8e9aac"; ctx.beginPath(); ctx.roundRect(x0, y0 + 7, x1 - x0, y1 - y0, 8); ctx.fill(); ctx.restore();
  var sea = ctx.createLinearGradient(0, y0, 0, y1); sea.addColorStop(0, "#b5dcf4"); sea.addColorStop(1, "#7cbde8");
  ctx.fillStyle = sea; ctx.beginPath(); ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 8); ctx.fill();
  ctx.save(); ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1;
  for (var la = -60; la <= 60; la += 30) { ctx.beginPath(); ctx.moveTo(x0, Y(la)); ctx.lineTo(x1, Y(la)); ctx.stroke(); }
  for (var lo = 20; lo < 380; lo += 60) { ctx.beginPath(); ctx.moveTo(X(lo), y0); ctx.lineTo(X(lo), y1); ctx.stroke(); }
  ctx.restore();
  [0, 30, 60, -30, -60].forEach(function (la) { lt(ctx, (la > 0 ? "북위 " : (la < 0 ? "남위 " : "적도 ")) + (la ? Math.abs(la) + "°" : ""), x0 + 6, Y(la) - 3, { s: 9.5, c: "#3d5a78" }); });
  [80, 140, -160, -100, -40].forEach(function (lo) { lt(ctx, (lo > 0 ? "동경 " : "서경 ") + Math.abs(lo) + "°", X(lo), y1 + 20, { s: 9.5, a: "center", c: LT.mute }); });
  var n = 0, COL = { s: ["#4dabf7", "#1864ab"], m: ["#ffc078", "#d9480f"], d: ["#ff8787", "#a51111"] };
  Q.forEach(function (q) {
    if (q[2] < minDepth) return; n++;
    var c = q[2] >= 300 ? COL.d : (q[2] >= 70 ? COL.m : COL.s), r = 1.4 + (q[3] - 5) * 1.2;
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.arc(X(q[1]), Y(q[0]), r, 0, 6.2832); ctx.fill();
    if (r > 2.2) { ctx.strokeStyle = c[1]; ctx.lineWidth = .8; ctx.stroke(); }
  });
  ctx.save(); ctx.strokeStyle = LT.green; ctx.lineWidth = 2.4; ctx.strokeRect(X(KB[2]), Y(KB[1]), X(KB[3]) - X(KB[2]), Y(KB[0]) - Y(KB[1])); ctx.restore();
  K.pill(ctx, "한반도", X(KB[2]) - 4, Y(KB[1]) - 6, { s: 11, a: "right", c: "#b2f2bb" });
  return n;
}
function legend(H, ctx, x, y) {
  [["#4dabf7", "70 km보다 얕음"], ["#ffc078", "중간 (70~300 km)"], ["#ff8787", "깊음 (300 km 아래)"]].forEach(function (l, i) {
    ctx.fillStyle = l[0]; ctx.beginPath(); ctx.arc(x + i * 150, y, 4.5, 0, 6.2832); ctx.fill(); lt(ctx, l[1], x + i * 150 + 9, y + 4, { s: 10.5, c: LT.mute });
  });
}
window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 지진이 몰린 곳과 판의 경계를 이어 적어 보세요.",
  cases: [
  {
    id: "r1", sec: "03", tag: "실제 자료 · 지진 분포", title: "2023년 지진 1,780건은 어디에 몰렸나", short: "지진 지도",
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
      api.seg({ label: "한반도 상자 안 (규모 5 이상)", value: "many", options: [{ v: "0", t: "0 건" }, { v: "few", t: "1~5 건" }, { v: "mid", t: "6~20 건" }, { v: "many", t: "20 건 넘게" }], onPick: function (x) { kr = x; api.changed(); } });
      api.info("점의 크기는 규모, 색은 깊이입니다. 대서양 한가운데에도 가는 띠가 있습니다. " + SRC
        + "<div data-link='{\"id\":\"seismic-explorer\",\"title\":\"Seismic Explorer — 지진 탐색기 (교과서 연결 자료)\",\"src\":\"Concord Consortium · 비상교육 통합과학1 103 · 105쪽\",\"url\":\"https://seismic-explorer.concord.org/\",\"ask\":\"아래 Data Type 단추에서 Plate Boundaries(판 경계)를 켜고, Start 를 누르거나 시간 막대를 오른쪽 끝까지 끌어 지진 점을 띄우세요. 지진 점들이 판 경계와 어떻게 겹치는지 보고, 지진이 가장 많이 몰린 경계 한 곳과 한반도 둘레에 큰 지진 점이 있는지를 적어 오세요.\"}'></div>");
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
    id: "r2", sec: "03", tag: "실제 자료 · 진원의 깊이", title: "깊은 지진은 어디에서 일어나나", short: "깊은 지진",
    who: "⛏️", name: "지구 내부 연구팀",
    say: "“같은 자료에서 <b>깊은 지진만</b> 남겨 봅시다. 진원의 깊이가 300 km를 넘으면 맨틀 속이에요. 깊이 기준을 올려 가며 <b>300 km보다 깊은 지진</b>만 남기고, 그 지진들이 몰린 곳에 무엇이 있는지 골라 주세요.”",
    predict: {
      q: "300 km보다 깊은 곳에서도 지진이 일어날 수 있을까요?",
      options: ["㉠ 맨틀은 물렁해서 그렇게 깊은 지진은 없다", "㉡ 차가운 판이 맨틀 속으로 비스듬히 내려가는 곳에서는 일어난다", "㉢ 지구 어디에서나 일어난다"],
      answer: 1
    },
    task: "깊이 기준을 <b>300 km 이상</b>으로 올리고, 남은 지진이 몰린 곳의 공통점을 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W, dmin = 0, kind = "none";
      function draw() { var n = world(H, ctx, W, cv.H - 18, dmin); H.text(ctx, dmin + " km보다 깊은 지진 " + n + " 건", 40, cv.H - 4, { s: 12.5, w: "900", c: H.v("--ink") }); }
      cv.canvas._redraw = draw;
      api.slider({ label: "남길 진원의 깊이", min: 0, max: 600, step: 50, value: 0, fmt: function (x) { return x + " km 아래만"; }, onInput: function (x) { dmin = x; api.changed(); draw(); } });
      api.seg({ label: "깊은 지진이 몰린 곳", value: "none", options: [{ v: "none", t: "아직 모르겠다" }, { v: "ridge", t: "해령 (판이 갈라지는 곳)" }, { v: "sub", t: "해구 근처 (판이 내려가는 곳)" }, { v: "hot", t: "하와이 같은 화산섬" }], onPick: function (x) { kind = x; api.changed(); } });
      api.info("남는 곳은 통가·피지 아래, 인도네시아 자와섬 북쪽 바다 아래, 일본 남쪽 바다 아래, 남아메리카 대륙 안쪽(볼리비아·아르헨티나) 아래 같은 곳입니다. " + SRC
        + "<div data-map='{\"id\":\"tonga\",\"name\":\"통가 해구\",\"lat\":-21.5,\"lng\":-174.5,\"zoom\":6,\"ask\":\"섬들 동쪽으로 길게 뻗은 짙은 바다 골짜기(해구)가 보이나요? 깊은 지진은 해구의 어느 쪽(동쪽·서쪽) 아래에서 일어났는지 위 지도와 비교해 보세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var deep = Q.filter(function (q) { return q[2] >= 300; }).length;
          if (dmin < 300) return { ok: false, msg: "아직 얕은 지진이 섞여 있습니다. 깊이 기준을 300 km 이상으로 올려 보세요." };
          if (kind !== "sub") return { ok: false, msg: kind === "ridge" ? "해령의 지진은 대부분 얕습니다. 깊은 지진이 남은 곳은 해령이 아닙니다." : "남은 점들이 어떤 지형 근처인지 다시 보세요." };
          return { ok: true, msg: "300 km보다 깊은 지진 " + deep + "건이 모두 판이 맨틀로 내려가는 섭입대 아래에 있습니다." };
        }
      };
    },
    hints: ["슬라이더를 300 km 이상으로 옮기세요. 빨간 점만 남습니다.", "남은 곳은 모두 깊은 해구에서 대륙이나 섬 쪽으로 수백 km 들어간 곳 아래입니다."],
    solution: "깊이 <b>300 km 이상</b>, 공통점은 <b>해구 근처(섭입대)</b>.",
    why: "해양판이 다른 판 밑으로 들어가는 <b>섭입대</b>에서는 차갑고 단단한 판이 맨틀 속으로 비스듬히 내려가, 깊이 700 km 가까이에서도 지진이 납니다. 해구에서 대륙(섬) 쪽으로 갈수록 진원이 깊어지는 이 지진 띠를 <b>와다티-베니오프대</b>라고 합니다. 해령과 하와이 같은 열점의 지진은 대부분 얕습니다.<br>"
      + "진원의 깊이만 보아도 판이 어디로 내려가는지 알 수 있습니다. 지진은 지구 내부를 들여다보는 창이기도 합니다."
  },
  {
    id: "r3", sec: "01", tag: "실제 자료 · 우리 동네 바다와 공기", title: "바닷가 창원과 내륙 대구, 하루 기온은 얼마나 오르내리나", short: "바다와 일교차",
    who: "📍", name: "창원기상대(기상청)",
    say: "“지구시스템에서 수권(바다)과 기권(공기)은 열을 주고받습니다. 진해와 가까운 <b>창원기상대</b>는 바닷가에, <b>대구</b>는 바다에서 멀리 떨어진 분지에 있어요. 아래 막대는 2026년 달마다 <b>하루 최고 기온과 최저 기온의 차이(일교차)</b>를 평균한 것입니다. 1 ~ 9월 전체로 보면 대구의 일교차가 창원보다 몇 °C 큰지 구해 주세요.”",
    predict: {
      q: "바닷가와 내륙 가운데 하루 동안 기온이 더 크게 오르내리는 곳은 어디일까요?",
      options: ["㉠ 바닷가 — 바닷바람이 기온을 크게 흔든다", "㉡ 내륙 — 바다는 천천히 데워지고 천천히 식어 바닷가의 기온 변화를 누그러뜨린다", "㉢ 두 곳이 똑같다"],
      answer: 1
    },
    task: "막대와 오른쪽 값을 보고 <b>대구 일교차 − 창원 일교차(1 ~ 9월 평균)</b>를 슬라이더로 맞추세요(± 0.2 °C).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W, k = 0;
      var x0 = 50, x1 = 640, y0 = 24, y1 = 250, bw = (x1 - x0) / 9;
      function Y(v) { return y1 - v / 14 * (y1 - y0); }
      function draw() {
        /* 입체 막대(달마다 창원·대구 일교차) + 오른쪽 위 작은 블록 모형(바닷가 창원 · 산으로 둘러싸인 대구 분지) */
        var CH = cv.H, i;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, 660, CH, { x: 340, y: y1 + 18, rx: 320, ry: 16 });
        var g = K.chart(ctx, { x: x0 - 44, y: y0 - 14, w: x1 - x0 + 58, h: y1 - y0 + 46, pl: 44, pt: 14, pb: 32, light: true, x0: 0, x1: 9, y0: 0, y1: 14, xt: 9, yt: 7, xf: function () { return ""; }, yf: function (q) { return q + "°"; } });
        lt(ctx, "일교차 (°C)", g.L + 6, g.T + 12, { s: 11, c: LT.mute });
        for (i = 0; i < 9; i++) {
          var cx = x0 + i * bw;
          bar3(ctx, cx + 8, y1, bw / 2 - 12, y1 - Y(ZCW[i].r), 8, "#1c7ed6");
          bar3(ctx, cx + bw / 2 + 2, y1, bw / 2 - 12, y1 - Y(ZDG[i].r), 8, "#e8590c");
          lt(ctx, (i + 1) + "월", cx + bw / 2, y1 + 16, { s: 10, a: "center", c: LT.mute });
        }
        var cd = sideCard(ctx, 670, W, CH, "바닷가와 내륙");
        /* 작은 블록 모형 */
        var I = K.iso({ ox: 760, oy: 60, s: .46, L: 240, D: 120 });
        I.field(ctx, function (x, y) { var hills = 26 * Math.exp(-Math.pow((x - 200) / 30, 2)) + 22 * Math.exp(-Math.pow((x - 130) / 22, 2)) * (y < 50 || y > 80 ? 1 : .3); return x < 70 ? 6 + x * .05 : 14 + hills; },
          function (x, y, z, l) { return K.tint(x < 60 ? "#c9b38a" : (z > 30 ? "#7a8a5a" : "#8fbf55"), l); }, 24, 12, function (c, a0, b0, a1, b1, zMax, zMin) { if (12 > zMin + .2 && a1 <= 72) I.quad(c, I.P(a0, b0, 12), I.P(a1, b0, 12), I.P(a1, b1, 12), I.P(a0, b1, 12), "rgba(60,150,225,.75)"); });
        var pc = I.P(80, 60, 15), pd = I.P(172, 64, 15);
        K.planet(ctx, pc.x, pc.y - 6, 4.5, "#74c0fc", "#1864ab"); K.planet(ctx, pd.x, pd.y - 6, 4.5, "#ffa94d", "#d9480f");
        lt(ctx, "창원", pc.x - 6, pc.y - 14, { s: 11, a: "right", c: LT.blue, w: "900" }); lt(ctx, "대구", pd.x + 8, pd.y - 14, { s: 11, c: LT.orange, w: "900" });
        lt(ctx, "바다", I.P(20, 80, 12).x - 8, I.P(20, 80, 12).y + 10, { s: 10, c: LT.mute });
        K.row(ctx, "창원 1~9월 평균", Z_RC.toFixed(2) + " °C", cd.px, cd.R, 176, LT.blue);
        K.row(ctx, "대구 1~9월 평균", Z_RD.toFixed(2) + " °C", cd.px, cd.R, 200, LT.orange);
        K.row(ctx, "내 답 (대구 − 창원)", "+" + k.toFixed(1) + " °C", cd.px, cd.R, 232, LT.ink);
        K.tip(ctx, Math.abs(k - Z_DIFF) <= .2 ? "두 평균의 차이와 같음" : "두 평균의 차이를 구하세요", cd.px - 4, 248, cd.w + 8, Math.abs(k - Z_DIFF) <= .2 ? true : null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "대구 − 창원", min: 0, max: 4, step: 0.1, value: 0, fmt: function (x) { return "+" + x.toFixed(1) + " °C"; }, onInput: function (x) { k = x; api.changed(); draw(); } });
      api.info("일교차는 그날 최고 기온 − 최저 기온입니다. 1월 최저 기온의 평균은 창원 " + (function () { var s = 0, n = 0; ZD.cw.forEach(function (d) { if (d[0].slice(0, 2) === "01") { s += d[3]; n++; } }); return (s / n).toFixed(1); })() + " °C, 대구 " + (function () { var s = 0, n = 0; ZD.dg.forEach(function (d) { if (d[0].slice(0, 2) === "01") { s += d[3]; n++; } }); return (s / n).toFixed(1); })() + " °C였습니다. " + SRC_Z
        + "<div data-link='{\"id\":\"kma-cw155\",\"title\":\"창원 과거 관측 일별 자료\",\"src\":\"기상청 날씨누리\",\"url\":\"https://www.weather.go.kr/w/weather/land/past-obs/obs-by-day.do?stn=155&obs=1\",\"ask\":\"지점을 대구로 바꿔 올해 1월의 가장 낮은 기온을 찾고, 창원과 견주어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(k - Z_DIFF) <= 0.2) return { ok: true, msg: "대구 " + Z_RD.toFixed(2) + " − 창원 " + Z_RC.toFixed(2) + " ≈ " + Z_DIFF.toFixed(1) + " °C. 바닷가인 창원은 하루 기온이 덜 오르내립니다." };
          return { ok: false, msg: "+" + k.toFixed(1) + " °C는 " + (k < Z_DIFF ? "작습니다" : "큽니다") + ". 오른쪽 두 평균의 차이를 구하세요." };
        }
      };
    },
    hints: ["오른쪽의 두 평균 값을 보세요.", Z_RD.toFixed(2) + " − " + Z_RC.toFixed(2) + " = ?"],
    solution: "대구 " + Z_RD.toFixed(2) + " °C − 창원 " + Z_RC.toFixed(2) + " °C ≈ <b>" + Z_DIFF.toFixed(1) + " °C</b>.",
    why: "물은 같은 양의 열을 받아도 땅보다 훨씬 덜 데워지고(비열이 큼), 바다는 물이 섞이면서 열을 깊이 나눠 가집니다. 그래서 바다는 낮에 공기의 열을 받아 가고 밤에는 열을 내주어, 바닷가의 기온 변화를 누그러뜨립니다. 수권이 기권에 영향을 주는 지구시스템의 상호작용입니다. 겨울밤에 특히 차이가 커서, 2026년 1월 아침 기온은 대구가 창원보다 2 °C쯤 더 낮았습니다.<br>"
      + "※ 대구는 산으로 둘러싸인 분지라 바다와 먼 것 말고도 지형의 영향을 받습니다. 그리고 한 해 자료이므로 다른 해에도 같은지 날씨누리에서 확인해 보세요."
  }
  ]
});
})();
