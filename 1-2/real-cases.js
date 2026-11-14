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

/* ---- 밝은 스튜디오 말투 (../assets/kit.js 의 K.studio · K.card) ---- */
var KT = window.sthKit, LT = KT.LT;
function lt(ctx, s, x, y, o) { o = o || {}; KT.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function sideCard(ctx, x, W, H, title) { KT.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
/* 흰 카드 안 작은 점 그래프: K.chart(light) 위에 점을 찍는다 */
function dots(ctx, g, rows, ix, iy, r, ya, yb) {
  rows.forEach(function (q) {
    var px = g.X(q[ix]), py = g.Y(Math.max(ya, Math.min(yb, q[iy])));
    if (r >= 2.5) KT.planet(ctx, px, py, r, "#74c0fc", "#1864ab");
    else { ctx.fillStyle = LT.blue; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill(); }
  });
}
/* 관측소 미니어처: 얇은 땅 받침 + 콘크리트 기둥 + 안테나 돔. I 는 K.iso, (x, y) 는 기둥 자리 */
function station(ctx, I, x, y, hgt) {
  I.box(ctx, x - 16, y - 16, 0, x + 16, y + 16, hgt, "#e9ecef", "#ced4da", "#9aa3b0");
  I.box(ctx, x - 22, y - 22, hgt, x + 22, y + 22, hgt + 4, "#f8f9fa", "#dee2e6", "#adb5bd");
  var p = I.P(x, y, hgt + 4), dg = ctx.createRadialGradient(p.x - 6, p.y - 14, 2, p.x, p.y - 6, 18);
  dg.addColorStop(0, "#ffffff"); dg.addColorStop(1, "#c3ccd9");
  ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(p.x, p.y - 2, 15, 7, 0, Math.PI, 0); ctx.lineTo(p.x + 15, p.y - 2); ctx.bezierCurveTo(p.x + 15, p.y - 22, p.x - 15, p.y - 22, p.x - 15, p.y - 2); ctx.fill();
  return { x: p.x, y: p.y - 10 };
}
window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 정밀한 측정이 사회에 어떻게 쓰이는지 실제 자료로 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "01", tag: "실제 자료 · 정밀도", title: "GPS는 몇 mm까지 잴까", short: "GPS 정밀도",
    who: "📡", name: "국토 측량 관측소",
    say: "“스마트폰 GPS는 위치가 몇 m씩 틀리기도 하죠. 그런데 측량용 GPS 관측소는 하루 동안 모은 신호로 위치를 계산합니다. 아래는 수원 관측소가 2024년 2월 하순 ~ 3월(39일) 동안 매일 잰 <b>동쪽 방향 위치</b>예요(땅이 꾸준히 움직이는 몫은 직선으로 빼고 남은 흩어짐). 하루하루 값이 <b>얼마나 흩어졌는지</b> 골라 주세요.”",
    predict: {
      q: "측량용 GPS가 하루하루 잰 위치는 얼마나 흩어질까요?",
      options: ["㉠ 몇 m — 스마트폰과 비슷하다", "㉡ 몇 cm", "㉢ 1 mm 안팎"],
      answer: 2
    },
    task: "점들의 흩어진 폭을 보고, 하루하루 위치의 흩어짐(표준 편차 — 값들이 평균에서 보통 벗어나는 정도)이 어느 정도인지 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(260), ctx = cv.ctx, W = cv.W, pick = "m";
      var rows = D4.map(function (r, i) { return [r[1], RES4[i]]; });
      var IS1 = KT.iso({ ox: 118, oy: 150, s: 0.6, L: 160, D: 160 });
      var HW = { m: 1000, cm: 10, mm: 1, um: 0.001 }, PNAME = { m: "약 1 m", cm: "약 1 cm", mm: "약 1 mm", um: "약 0.001 mm" };
      function draw() {
        var CH = cv.H, I = IS1, i, LW = 560;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, LW, CH, { x: 260, y: 246, rx: 240, ry: 12 });
        /* 얇은 땅 받침 + 관측소 기둥 */
        I.face(ctx, "front", function (Lw) { ctx.fillStyle = "#a98b62"; ctx.fillRect(0, -8, Lw, 8); });
        I.face(ctx, "right", function (Lw) { ctx.fillStyle = "#8a6f4a"; ctx.fillRect(0, -8, Lw, 8); });
        I.plane(ctx, 0, "#cfe3a8");
        I.plane(ctx, 0.3, "#dee2e6", null, 40, 120, 40, 120);
        var top = station(ctx, I, 80, 80, 120);
        KT.pill(ctx, "수원 GPS 관측소", 118, 248, { a: "center", s: 12, c: "#ffffff", box: [0, LW] });
        /* 돋보기 — 안테나 자리를 위에서 내려다본 모습(동서 방향만) */
        var MX = 400, MY = 128, MR = 108, PXMM = 24;
        ctx.strokeStyle = "rgba(20,30,50,.5)"; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(top.x + 8, top.y - 4); ctx.lineTo(MX - MR * 0.92, MY - MR * 0.38); ctx.moveTo(top.x + 8, top.y + 6); ctx.lineTo(MX - MR * 0.8, MY + MR * 0.6); ctx.stroke(); ctx.setLineDash([]);
        ctx.save(); ctx.beginPath(); ctx.arc(MX, MY, MR, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(MX - MR, MY - MR, MR * 2, MR * 2);
        var hw = HW[pick] * PXMM;
        ctx.fillStyle = "rgba(112,72,232,.16)"; ctx.fillRect(MX - hw, MY - MR, hw * 2, MR * 2);
        ctx.strokeStyle = LT.violet; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        if (hw < MR) { ctx.beginPath(); ctx.moveTo(MX - hw, MY - MR); ctx.lineTo(MX - hw, MY + MR); ctx.moveTo(MX + hw, MY - MR); ctx.lineTo(MX + hw, MY + MR); ctx.stroke(); }
        ctx.setLineDash([]);
        for (i = -4; i <= 4; i++) { ctx.strokeStyle = i ? "rgba(20,40,90,.10)" : "rgba(20,40,90,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(MX + i * PXMM, MY - MR); ctx.lineTo(MX + i * PXMM, MY + MR); ctx.stroke(); }
        rows.forEach(function (q, k) { KT.planet(ctx, MX + q[1] * PXMM, MY - 62 + (k % 13) * 9.5 + Math.floor(k / 13) * 3, 4, "#74c0fc", "#1864ab"); });
        for (i = -4; i <= 4; i += 2) lt(ctx, (i > 0 ? "+" : "") + i + " mm", MX + i * PXMM, MY + 82, { s: 11, a: "center", c: LT.mute, w: "800" });
        ctx.restore();
        ctx.strokeStyle = "#2b3242"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(MX, MY, MR, 0, Math.PI * 2); ctx.stroke();
        lt(ctx, "서 ←", MX - MR - 10, MY + 4, { s: 12, w: "900", a: "right", c: LT.ink });
        lt(ctx, "→ 동", MX + MR + 10, MY + 4, { s: 12, w: "900", c: LT.ink });
        KT.pill(ctx, "내가 고른 흩어짐 " + PNAME[pick] + (hw >= MR ? " — 돋보기 밖까지" : ""), MX, 252, { a: "center", s: 12, c: "#d0bfff", box: [240, LW] });
        KT.bigText(ctx, "하루에 한 점 · " + D4.length + "일", 16, 34, 19, "#ffffff");
        KT.bigText(ctx, "돋보기 1칸 = 1 mm", 16, 58, 14, "#ffffff");
        /* 오른쪽 카드 — 날짜별 작은 그래프 */
        var cd = sideCard(ctx, 570, W, CH, "수원 관측소 · 동쪽 위치");
        KT.row(ctx, "측정한 날", D4.length + " 일", cd.px, cd.R, 56);
        KT.row(ctx, "가장 크게 벗어난 값", Math.max.apply(null, RES4.map(Math.abs)).toFixed(1) + " mm", cd.px, cd.R, 78);
        KT.row(ctx, "내가 고른 흩어짐", PNAME[pick], cd.px, cd.R, 100, LT.violet);
        var g = KT.chart(ctx, { x: cd.px - 12, y: 108, w: cd.w + 24, h: 148, x0: 2024.1393, x1: 2024.2459, y0: -4, y1: 4, xt: 2, yt: 4, light: true, yl: "mm", xf: function (v2) { return v2 < 2024.15 ? "2월 21일" : v2 > 2024.24 ? "4월 1일" : "3월 12일"; }, pl: 30, pr: 26, pb: 22 });
        KT.line(ctx, { x: g.L, y: g.Y(SD4) }, { x: g.R, y: g.Y(SD4) }, "#e67700", 1.2, [5, 4]);
        KT.line(ctx, { x: g.L, y: g.Y(-SD4) }, { x: g.R, y: g.Y(-SD4) }, "#e67700", 1.2, [5, 4]);
        dots(ctx, g, rows, 0, 1, 3, -4, 4);
        lt(ctx, "주황 점선 = ± 표준 편차", cd.R, 120, { s: 11, a: "right", c: "#e67700", w: "800" });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "하루하루 위치의 흩어짐", value: "m", options: [{ v: "m", t: "약 1 m" }, { v: "cm", t: "약 1 cm" }, { v: "mm", t: "약 1 mm" }, { v: "um", t: "약 0.001 mm" }], onPick: function (x) { pick = x; draw(); api.changed(); } });
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
    id: "r2", sec: "03", tag: "실제 자료 · 측정과 지진 감시", title: "2011년 3월 11일, 수원이 움직였다", short: "수원의 이동",
    who: "🌏", name: "지진 감시 센터",
    say: "“2011년 3월 11일, 수원에서 약 1,300 km 떨어진 일본 동북쪽 바다에서 규모 9.0 지진이 났어요. 그날 전후로 수원 관측소가 매일 잰 <b>동쪽 방향 위치</b>입니다. 지진 때 수원이 동쪽으로 <b>몇 mm</b> 움직였는지 구해 주세요.”",
    predict: {
      q: "1,200 km 떨어진 큰 지진 때 수원의 땅은?",
      options: ["㉠ 너무 멀어서 전혀 움직이지 않았다", "㉡ 몇 cm 움직였고, 정밀한 GPS로 잴 수 있다", "㉢ 몇 m 움직였다"],
      answer: 1
    },
    task: "지진 전과 후의 평균 위치 차이를 읽어, 수원이 동쪽으로 움직인 거리를 슬라이더로 맞추세요(± 4 mm).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, g = 0, view = "q";
      var IS2 = KT.iso({ ox: 108, oy: 22, s: 0.86, L: 400, D: 120 });
      var WK = G.weekly, DRIFT = WK.length ? WK[WK.length - 1][1] - WK[0][1] : 0;
      function draw() {
        var CH = cv.H, I = IS2, i, LW = 480, P0 = mean(PRE);
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, LW, CH, { x: 240, y: 258, rx: 230, ry: 10 });
        /* 한반도 ~ 일본 블록(얇은 받침): 바다 위에 두 땅 */
        I.face(ctx, "front", function (Lw) { ctx.fillStyle = "#3f78b5"; ctx.fillRect(0, -8, Lw, 8); ctx.fillStyle = "#a98b62"; ctx.fillRect(0, -8, 130, 8); ctx.fillRect(250, -8, 70, 8); });
        I.face(ctx, "right", function (Lw) { ctx.fillStyle = "#2f5f93"; ctx.fillRect(0, -8, Lw, 8); });
        I.plane(ctx, 0, "#74b4e8");
        I.plane(ctx, 0.5, "#cfe3a8", null, 0, 130, 0, 120);
        ctx.fillStyle = "#cfe3a8"; var j0 = I.P(250, 120, 0.5), j1 = I.P(290, 10, 0.5), j2 = I.P(330, 0, 0.5), j3 = I.P(320, 120, 0.5);
        ctx.beginPath(); ctx.moveTo(j0.x, j0.y); ctx.lineTo(j1.x, j1.y); ctx.lineTo(j2.x, j2.y); ctx.lineTo(j3.x, j3.y); ctx.closePath(); ctx.fill();
        /* 진원 — 일본 동북쪽 바다 */
        var ep = I.P(365, 40, 0.6);
        for (i = 3; i >= 1; i--) { ctx.strokeStyle = "rgba(224,49,49," + (0.15 * i) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(ep.x, ep.y, 10 * i, 5 * i, 0, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = "#e03131"; ctx.beginPath(); for (i = 0; i < 10; i++) { var ra = i % 2 ? 4 : 10, an = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(ep.x + Math.cos(an) * ra, ep.y + Math.sin(an) * ra * 0.7); } ctx.closePath(); ctx.fill();
        I.label(ctx, 365, 40, 0.6, "진원 · 규모 9.0", 10, -34, "#ffc9c9", [0, LW]);
        [[14, 104], [44, 110], [118, 30], [270, 100], [300, 40], [310, 80]].forEach(function (t) { I.tree(ctx, t[0], t[1], 0.5, 1.1); });
        I.label(ctx, 290, 70, 0.5, "일본", 44, 40, "#ffffff", [0, LW]);
        /* 수원 관측소와 움직인 거리(크게 과장한 화살표) */
        var top = station(ctx, I, 70, 60, 32);
        var mvx = view === "q" ? g * 2.2 : DRIFT * 0.16;
        if (mvx > 0.5) {
          var a0 = I.P(70, 60, 58), a1 = I.P(70 + mvx, 60, 58);
          KT.arrow(ctx, a0, a1, view === "q" ? LT.violet : LT.orange, 5, 14);
        }
        KT.pill(ctx, view === "q" ? "내 답 → 동쪽으로 " + g + " mm" : "1997~2026 동쪽으로 약 " + Math.round(DRIFT / 10) + " cm", top.x + 62, top.y + 62, { s: 12, c: view === "q" ? "#d0bfff" : "#ffd8a8", box: [0, LW] });
        KT.pill(ctx, "수원 GPS 관측소", top.x - 34, top.y + 78, { a: "center", s: 12, c: "#ffffff", box: [0, LW] });
        KT.warn(ctx, LW - 8, 26, "⚠ 땅·거리·화살표는 실제 비율이 아님", "right");
        KT.bigText(ctx, view === "q" ? "지진 때 수원이 동쪽으로" : "29년 동안 한 해 약 3 cm씩", 14, 226, 16, "#ffffff");
        /* 오른쪽 카드 — 지진 전후 그래프 */
        var cd = sideCard(ctx, 488, W, CH, "2011년 3월 11일 동일본 대지진");
        if (view === "q") {
          var lo = Math.floor(Math.min.apply(null, D1.map(function (r) { return r[2]; })) / 10) * 10;
          var gq = KT.chart(ctx, { x: cd.px - 10, y: 66, w: cd.w + 20, h: 196, x0: D1[0][1], x1: D1[D1.length - 1][1], y0: lo, y1: lo + 60, xt: 2, yt: 3, light: true, yl: "동쪽 위치 (mm)", xf: function (v2) { return v2 < 2011.12 ? "2월" : v2 > 2011.22 ? "4월" : "3월"; }, pl: 40, pr: 10, pb: 24 });
          KT.line(ctx, { x: gq.X(EQ), y: gq.T }, { x: gq.X(EQ), y: gq.B }, LT.red, 1.5, [5, 4]);
          lt(ctx, "3월 11일", gq.X(EQ) + 4, gq.T + 12, { s: 11, w: "800", c: LT.red });
          dots(ctx, gq, D1, 1, 2, 2.8, lo, lo + 60);
          KT.line(ctx, { x: gq.L, y: gq.Y(P0) }, { x: gq.X(EQ), y: gq.Y(P0) }, "#e67700", 1.2, [5, 4]);
          KT.line(ctx, { x: gq.X(EQ), y: gq.Y(Math.min(lo + 60, P0 + g)) }, { x: gq.R, y: gq.Y(Math.min(lo + 60, P0 + g)) }, "#e67700", 2.6, [7, 4]);
        } else {
          var ys = WK.map(function (r) { return r[1]; }), lo2 = Math.min.apply(null, ys), hi2 = Math.max.apply(null, ys);
          var ga = KT.chart(ctx, { x: cd.px - 10, y: 66, w: cd.w + 20, h: 196, x0: WK[0][0], x1: WK[WK.length - 1][0], y0: lo2, y1: hi2, xt: 3, yt: 4, light: true, yl: "동쪽 위치 (mm)", xf: function (v2) { return String(Math.round(v2)); }, yf: function (v2) { return String(Math.round(v2 - lo2)); }, pl: 40, pr: 14, pb: 24 });
          dots(ctx, ga, WK, 0, 1, 1.4, lo2, hi2);
        }
        KT.row(ctx, "내 답 (동쪽으로)", g + " mm", cd.px, cd.R, 54, LT.violet);
        lt(ctx, view === "q" ? "가는 선 = 지진 전 평균 · 굵은 선 = 내 답" : "1997년 말 ~ 2026 주간 평균", cd.R, 74, { s: 11, a: "right", c: "#e67700", w: "800" });
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
