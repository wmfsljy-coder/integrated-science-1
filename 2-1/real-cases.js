/* 통합과학1 Ⅱ-1 자연의 구성 원소 — 실제 자료
   r1 햇빛 속 검은 선(프라운호퍼 선)의 주인 찾기 — 실험실 측정 파장(NIST 원자 스펙트럼 자료, 공기 중 nm)
   r2 태양의 수소 : 헬륨 원자 수 — 태양 광구의 원소 함량(Asplund 외 2009, Annual Review of Astronomy and Astrophysics 47:481)
   자료는 이 파일 안에 숫자로 적어 두었다(수업 중 접속 실패 대비). */
(function () {
"use strict";

/* ---- 밝은 스튜디오 + 입체 미니어처 (../assets/kit.js 의 K.studio · K.card) ---- */
var KT = window.sthKit, LT = KT.LT;
function lt(ctx, s, x, y, o) { o = o || {}; KT.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function floorShadow(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || 0.28) + ")"); g.addColorStop(0.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w + d, y + h - d * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
function bar3(ctx, x, y, w, h, d, hex) {
  var g = ctx.createLinearGradient(0, y, 0, y + Math.max(1, h)); g.addColorStop(0, KT.tint(hex, 1.1)); g.addColorStop(1, KT.tint(hex, .85));
  slab(ctx, x, y, w, h, d, KT.tint(hex, 1.25), g, KT.tint(hex, .68));
}
function sideCard(ctx, x, W, H, title) { KT.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
function ball(ctx, x, y, r, hex) { KT.planet(ctx, x, y, r, hex, KT.tint(hex, 0.4)); }
/* 핵자 공을 둥글게 쌓은 원자핵 (반지름 R, 공 n개) */
function nucleus(ctx, cx, cy, R, n) {
  var rb = Math.max(3, R / (1.25 * Math.sqrt(n)) * 1.05), sp = [], k;
  for (k = 0; k < n; k++) { var a = k * 2.39996, d = rb * 1.25 * Math.sqrt(k); sp.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * .92, k]); }
  sp.sort(function (p, q) { return p[1] - q[1]; });
  sp.forEach(function (p) { ball(ctx, p[0], p[1], rb, p[2] % 2 ? "#d5dae8" : "#ff7b6b"); });
}

/* 태양 스펙트럼의 주요 흡수선 — 프라운호퍼가 붙인 이름, 파장(nm), 실제 원인 */
var FR = [["A", 759.37, "O₂"], ["B", 686.72, "O₂"], ["C", 656.28, "H"], ["D₁", 589.59, "Na"], ["D₂", 589.00, "Na"], ["E", 527.04, "Fe"],
  ["b₁", 518.36, "Mg"], ["F", 486.13, "H"], ["G′", 434.05, "H"], ["G", 430.79, "Fe"], ["h", 410.17, "H"], ["H", 396.85, "Ca⁺"], ["K", 393.37, "Ca⁺"]];
/* 실험실에서 각 원소를 가열했을 때 나오는 밝은 선(NIST) */
var LAB = {
  H: { n: "수소", l: [656.28, 486.13, 434.05, 410.17] },
  Na: { n: "나트륨", l: [589.00, 589.59] },
  He: { n: "헬륨", l: [587.56, 667.82, 501.57, 447.15] },
  Fe: { n: "철", l: [527.04, 430.79, 438.35, 440.48] },
  Ca: { n: "칼슘 이온", l: [393.37, 396.85] }
};
/* Asplund 외(2009) 태양 광구 함량: log ε = log(N원소/N수소) + 12 */
var AB = [["H", "수소", 12.00], ["He", "헬륨", 10.93], ["O", "산소", 8.69], ["C", "탄소", 8.43], ["Ne", "네온", 7.93], ["N", "질소", 7.83], ["Mg", "마그네슘", 7.60], ["Si", "규소", 7.51], ["Fe", "철", 7.50]];

function wlColor(w) {
  var r = 0, g = 0, b = 0;
  if (w < 440) { r = (440 - w) / 60; b = 1; } else if (w < 490) { g = (w - 440) / 50; b = 1; } else if (w < 510) { g = 1; b = (510 - w) / 20; }
  else if (w < 580) { r = (w - 510) / 70; g = 1; } else if (w < 645) { r = 1; g = (645 - w) / 65; } else r = 1;
  var f = w < 420 ? 0.3 + 0.7 * (w - 380) / 40 : (w > 700 ? 0.3 + 0.7 * (780 - w) / 80 : 1);
  return "rgb(" + Math.round(255 * r * f) + "," + Math.round(255 * g * f) + "," + Math.round(255 * b * f) + ")";
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료가 이야기와 어떻게 맞았는지 적어 보세요.",
  cases: [
  {
    id: "r1", sec: "01", tag: "실제 자료 · 태양 스펙트럼", title: "햇빛 속 검은 선의 주인 찾기", short: "검은 선",
    who: "🔭", name: "태양 관측소 연구원",
    say: "“햇빛을 프리즘으로 펼치면 무지개 사이사이에 <b>검은 선</b>이 수백 개 있어요. 1814년 프라운호퍼가 큰 선마다 A, B, C … 이름을 붙였지요. 아래 그림의 검은 선은 그와 뒤의 과학자들이 이름 붙인 선들의 <b>실제 파장</b>입니다. 실험실에서 원소를 가열할 때 나오는 밝은 선과 파장을 맞춰, <b>C·F·G′·h 선</b>과 <b>D 선</b>의 주인 원소를 찾아 주세요.”",
    predict: {
      q: "햇빛 속 검은 선은 무엇을 알려 줄까요?",
      options: ["㉠ 태양 표면에 난 구멍의 위치", "㉡ 태양 대기 속 원소가 자기 고유의 파장의 빛을 흡수한 흔적", "㉢ 지구로 오는 동안 우주 먼지가 빛을 가린 흔적"],
      answer: 1
    },
    task: "원소를 바꿔 가며 밝은 선(실험실)과 검은 선(햇빛)을 겹쳐 보고, <b>C·F·G′·h 선의 주인</b>과 <b>D 선의 주인</b>을 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(290), ctx = cv.ctx, W = cv.W, g1 = "He", g2 = "He";
      var x0 = 30, x1 = 612;
      function X(w) { return x0 + (w - 380) / (780 - 380) * (x1 - x0); }
      function hits(el, names) { return FR.filter(function (f) { return names.indexOf(f[0]) >= 0 && LAB[el].l.some(function (w) { return Math.abs(w - f[1]) < 0.05; }); }).length; }
      function draw() {
        var CH = cv.H, w;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 640, CH, null);
        /* 햇빛 → 프리즘 미니어처 */
        KT.sun(ctx, 30, 30, 8);
        ctx.fillStyle = "rgba(255,230,160,.5)"; ctx.fillRect(40, 28, 52, 4);
        var pg = ctx.createLinearGradient(92, 14, 120, 46); pg.addColorStop(0, "rgba(235,245,255,.95)"); pg.addColorStop(1, "rgba(140,180,225,.8)");
        ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(92, 46); ctx.lineTo(124, 46); ctx.lineTo(108, 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(60,90,130,.6)"; ctx.lineWidth = 1; ctx.stroke();
        var fg = ctx.createLinearGradient(x0, 0, x1, 0); for (w = 0; w <= 8; w++) fg.addColorStop(w / 8, wlColor(380 + w * 50));
        ctx.save(); ctx.globalAlpha = .22; ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(116, 34); ctx.lineTo(x1, 76); ctx.lineTo(x0 + 120, 76); ctx.closePath(); ctx.fill(); ctx.restore();
        lt(ctx, "햇빛 (검은 선 = 흡수)", x1, 26, { s: 11.5, w: "800", a: "right", c: LT.mute });
        slab(ctx, x0, 82, x1 - x0, 54, 8, "#e9ecef", "#000", "#868e96");
        for (w = 380; w < 780; w += 0.5) { ctx.fillStyle = wlColor(w); ctx.fillRect(X(w), 82, X(w + 0.5) - X(w) + 0.6, 54); }
        FR.forEach(function (f) {
          var hi = (f[0] === "C" || f[0] === "F" || f[0] === "G′" || f[0] === "h") ? 1 : ((f[0] === "D₁" || f[0] === "D₂") ? 2 : 0);
          ctx.fillStyle = "#111"; ctx.fillRect(X(f[1]) - 1, 82, 2.2, 54);
          if (f[0] !== "D₁") lt(ctx, f[0] === "D₂" ? "D" : f[0], X(f[1]) + (f[0] === "K" || f[0] === "G" ? -2 : (f[0] === "H" || f[0] === "G′" ? 2 : 0)), 74, { s: 12, w: "900", a: f[0] === "K" || f[0] === "G" ? "right" : (f[0] === "H" || f[0] === "G′" ? "left" : "center"), c: hi === 1 ? LT.blue : (hi === 2 ? LT.orange : LT.mute) });
        });
        [400, 500, 600, 700].forEach(function (q) { lt(ctx, q + " nm", X(q), 152, { s: 10, a: "center", c: LT.mute }); });
        function labRow(el, y, colr, label) {
          slab(ctx, x0, y, x1 - x0, 32, 7, "#e9ecef", "#15171c", "#868e96");
          LAB[el].l.forEach(function (q) { ctx.save(); ctx.shadowColor = wlColor(q); ctx.shadowBlur = 6; ctx.fillStyle = wlColor(q); ctx.fillRect(X(q) - 1.2, y, 2.6, 32); ctx.restore(); });
          lt(ctx, label + LAB[el].n + " (가열한 기체의 밝은 선)", x0, y + 48, { s: 11.5, w: "800", c: colr });
        }
        labRow(g1, 166, LT.blue, "C·F·G′·h 후보: ");
        labRow(g2, 232 - 6, LT.orange, "D 후보: ");
        /* 판정 카드 */
        var a = hits(g1, ["C", "F", "G′", "h"]), b = hits(g2, ["D₁", "D₂"]), cd = sideCard(ctx, 652, W, CH, "선 맞추기");
        lt(ctx, a === 4 && b === 2 ? "두 주인 모두 찾음" : "겹쳐 보는 중", cd.px, 60, { s: 18, w: "900", c: a === 4 && b === 2 ? LT.green : LT.orange });
        KT.row(ctx, "C·F·G′·h 후보", LAB[g1].n, cd.px, cd.R, 94, LT.blue);
        KT.row(ctx, "맞는 검은 선", a + " / 4", cd.px, cd.R, 118, a === 4 ? LT.green : LT.red);
        KT.bar(ctx, cd.px, 128, cd.w, a / 4, LT.blue);
        KT.row(ctx, "D 후보", LAB[g2].n, cd.px, cd.R, 166, LT.orange);
        KT.row(ctx, "맞는 검은 선", b + " / 2", cd.px, cd.R, 190, b === 2 ? LT.green : LT.red);
        KT.bar(ctx, cd.px, 200, cd.w, b / 2, LT.orange);
        lt(ctx, "0.05 nm 안에서 겹치면 맞음", cd.px, 244, { s: 11, c: LT.mute });
        lt(ctx, "자료: NIST 원자 스펙트럼", cd.px, 264, { s: 11, c: LT.dim });
      }
      cv.canvas._redraw = draw;
      var opts = Object.keys(LAB).map(function (k) { return { v: k, t: LAB[k].n }; });
      api.seg({ label: "C·F·G′·h 선의 주인 후보", value: "He", options: opts, onPick: function (x) { g1 = x; api.changed(); draw(); } });
      api.seg({ label: "D 선의 주인 후보", value: "He", options: opts, onPick: function (x) { g2 = x; api.changed(); draw(); } });
      api.info("검은 선의 파장(nm): " + FR.map(function (f) { return f[0] + " " + f[1].toFixed(2); }).join(" · ") + "<br><small>출처: 프라운호퍼 선 이름과 파장 — 미국 국립표준기술연구소(NIST) 원자 스펙트럼 자료(공기 중 파장). A·B 선은 지구 대기의 산소가 만든 것입니다.</small>"
        + "<div data-link='{\"id\":\"nist-h\",\"title\":\"NIST 원자 스펙트럼 자료\",\"src\":\"미국 국립표준기술연구소\",\"url\":\"https://physics.nist.gov/PhysRefData/ASD/lines_form.html\",\"ask\":\"영어 화면입니다. Spectrum 칸에 H I, 파장 범위에 600과 700 (nm)을 넣고 검색한 뒤, Rel. Int.(상대 세기) 값이 가장 큰 선의 파장을 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var a = g1 === "H", b = g2 === "Na";
          if (a && b) return { ok: true, msg: "C(656.28)·F(486.13)·G′(434.05)·h(410.17)는 수소, D(589.00·589.59)는 나트륨의 선과 소수 둘째 자리까지 같습니다." };
          if (!a && !b) return { ok: false, msg: "두 후보 모두 선의 자리가 맞지 않습니다. 검은 선 바로 아래에 밝은 선이 오는 원소를 찾으세요." };
          if (!a) return { ok: false, msg: "D 선은 맞았습니다. " + LAB[g1].n + "의 밝은 선은 C·F·G′·h 자리에 오지 않아요." };
          return { ok: false, msg: "C·F·G′·h는 맞았습니다. " + (g2 === "He" ? "헬륨의 587.56 nm 선은 D 선(589.0) 바로 옆이지만 약 1.5 nm 어긋나요." : LAB[g2].n + "의 선은 D 자리에 오지 않아요.") };
        }
      };
    },
    hints: ["밝은 선 하나하나가 검은 선 바로 아래에 오는지 보세요. 하나만 맞아서는 안 되고 여러 줄이 모두 맞아야 합니다.",
      "C·F·G′·h는 우주에서 가장 흔한 원소, D는 소금 속 원소입니다."],
    solution: "C·F·G′·h 선 = <b>수소</b>, D 선 = <b>나트륨</b>.",
    why: "원자는 저마다 정해진 에너지 준위를 가져, 자기 고유의 파장의 빛만 내고 흡수합니다. 그래서 태양 대기를 지나온 햇빛에는 그 원소가 흡수한 자리에 검은 선이 남고, 실험실에서 가열한 같은 원소는 같은 자리에 밝은 선을 냅니다. 이 방법으로 사람은 가 보지 못한 별의 성분을 알아냈습니다.<br>"
      + "헬륨은 1868년 일식 때 태양 가장자리에서 587.56 nm의 밝은 선으로 처음 발견되었고(그래서 이름이 태양을 뜻하는 helios), 지구에서는 27년 뒤에야 찾았습니다. D 선 옆에 있지만 D 선과는 다른 선입니다."
  },
  {
    id: "r2", sec: "03", tag: "실제 자료 · 태양의 원소 함량", title: "태양에는 수소가 헬륨보다 몇 배 많을까", short: "수소·헬륨 비",
    who: "☀️", name: "천문학 연구실",
    say: "“천문학자들은 태양 스펙트럼의 선이 얼마나 짙은지 재어 원소의 양을 구합니다. 아래는 2009년에 정리된 태양 광구(태양의 빛나는 겉면)의 함량이에요(헬륨만은 광구 스펙트럼에 선이 거의 없어, 태양의 진동을 재는 방법으로 구한 값입니다). 숫자가 너무 커서 <b>로그 눈금(log ε)</b>으로 적는데, 수소를 12로 두고 1이 작아질 때마다 원자 수가 10분의 1이 됩니다. 이 표를 읽어 <b>수소 원자 수 ÷ 헬륨 원자 수</b>를 구해 주세요.”",
    predict: {
      q: "태양에서 수소 원자는 헬륨 원자보다 대략 몇 배 많을까요?",
      options: ["㉠ 거의 같다", "㉡ 약 3 배", "㉢ 약 12 배"],
      answer: 2
    },
    task: "표의 log ε 값을 읽고, <b>수소 원자 수 ÷ 헬륨 원자 수</b>를 슬라이더로 맞추세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(290), ctx = cv.ctx, W = cv.W, r = 3;
      function draw() {
        var CH = cv.H, x0 = 52, y1 = 250, y0 = 70, i;
        function Y(e) { return y1 - (e - 6) / 6.5 * (y1 - y0); }
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 640, CH, null);
        KT.bigText(ctx, "수소 ÷ 헬륨 = " + r.toFixed(1) + " 배", 18, 40, 22, Math.abs(r - Math.pow(10, 1.07)) <= 0.5 ? "#8ce99a" : "#ffffff");
        for (i = 6; i <= 12; i += 2) { KT.line(ctx, { x: x0, y: Y(i) }, { x: 420, y: Y(i) }, "rgba(20,40,90,.10)", 1); lt(ctx, i + "", x0 - 8, Y(i) + 4, { s: 10.5, a: "right", c: LT.mute }); }
        lt(ctx, "log ε (태양 광구)", x0 - 30, y0 - 8, { s: 11, c: LT.mute });
        floorShadow(ctx, 236, y1 + 8, 200, 10, .18);
        slab(ctx, x0 - 6, y1, 376, 6, 10, "#eef2f7", "#c9d1dc", "#9ea8b6");
        AB.forEach(function (a, k) {
          var x = x0 + 8 + k * 40;
          bar3(ctx, x, Y(a[2]), 26, y1 - Y(a[2]), 8, k === 0 ? "#ff922b" : (k === 1 ? "#845ef7" : "#adb5bd"));
          lt(ctx, a[0], x + 13, y1 + 22, { s: 12, w: "900", a: "center" });
          lt(ctx, a[2].toFixed(2), x + 13, Y(a[2]) - 10, { s: 10, w: "800", a: "center", c: LT.mute });
        });
        /* 태양 겉면 한 조각 속 원자 수 (내가 맞춘 비) */
        var bx = 440, by = 94, bw = 180, bh = 150, n = Math.min(30, Math.round(r));
        floorShadow(ctx, bx + bw / 2, by + bh + 10, 110, 10, .22);
        ctx.fillStyle = "rgba(255,190,110,.20)"; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();
        ctx.strokeStyle = "rgba(200,120,40,.5)"; ctx.lineWidth = 1.4; ctx.stroke();
        var R0 = KT.rng(11);
        for (i = 0; i < n; i++) ball(ctx, bx + 16 + R0() * (bw - 32), by + 16 + R0() * (bh - 32), 6, "#ff922b");
        ball(ctx, bx + bw / 2, by + bh / 2, 11, "#845ef7");
        KT.pill(ctx, "수소 " + n + " : 헬륨 1 (원자 수)", bx + bw / 2, by + bh + 34, { a: "center", s: 11.5, c: "#ffd8a8", box: [bx - 20, 640] });
        /* 판정 카드 */
        var cd = sideCard(ctx, 652, W, CH, "원자 수의 비");
        lt(ctx, r.toFixed(1) + " 배", cd.px, 62, { s: 24, w: "900", c: LT.blue });
        KT.row(ctx, "로그 차이 12.00 − 10.93", "1.07", cd.px, cd.R, 98);
        KT.row(ctx, "질량으로 헬륨은", (100 * (4 / r) / (1 + 4 / r)).toFixed(0) + " %", cd.px, cd.R, 124, LT.violet);
        KT.tip(ctx, "차이 1 = 10배, 1.07 = 10의 1.07제곱", cd.px - 4, 142, cd.w + 8, null);
        lt(ctx, "헬륨 원자는 수소보다", cd.px, 212, { s: 11.5, c: LT.mute });
        lt(ctx, "약 4배 무겁습니다", cd.px, 232, { s: 11.5, c: LT.mute });
        lt(ctx, "자료: Asplund 외 (2009)", cd.px, 266, { s: 11, c: LT.dim });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "수소 원자 수 ÷ 헬륨 원자 수", min: 1, max: 30, step: 0.5, value: 3, fmt: function (x) { return x.toFixed(1) + " 배"; }, onInput: function (x) { r = x; api.changed(); draw(); } });
      api.info("로그 눈금 읽기: 차이가 1이면 10배, 2이면 100배, 차이가 1.07이면 10<sup>1.07</sup> 배입니다(계산기의 10<sup>x</sup>를 쓰세요).<br><small>출처: Asplund, Grevesse, Sauval & Scott (2009), The Chemical Composition of the Sun, Annu. Rev. Astron. Astrophys. 47, 481–522. 수소를 12로 둔 값.</small>"
        + "<div data-link='{\"id\":\"asplund\",\"title\":\"(도전) The Chemical Composition of the Sun (2009) 논문 초록\",\"src\":\"arXiv 공개 논문 저장소\",\"url\":\"https://arxiv.org/abs/0909.0948\",\"ask\":\"초록(Abstract)을 번역기로 읽고, 이 논문이 태양의 성분을 어떤 방법으로 다시 구했는지 한 문장으로 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var t = Math.pow(10, 12 - 10.93);
          if (Math.abs(r - t) <= 0.5) return { ok: true, msg: "10<sup>1.07</sup> ≈ " + t.toFixed(1) + " — 수소 원자가 헬륨 원자보다 약 12 배 많습니다." };
          return { ok: false, msg: r.toFixed(1) + " 배는 " + (r < t ? "작습니다" : "큽니다") + ". 로그 차이 1.07은 10 배보다 조금 더 큰 비율이에요." };
        }
      };
    },
    hints: ["수소 12.00, 헬륨 10.93 — 차이는 1.07입니다.", "10<sup>1</sup> = 10, 10<sup>1.07</sup>은 10보다 조금 큽니다(약 11.7)."],
    solution: "10<sup>12.00 − 10.93</sup> = 10<sup>1.07</sup> ≈ <b>11.7 배</b> (11.5~12).",
    why: "원자 수로는 수소가 헬륨의 약 12 배이지만, 헬륨 원자는 수소보다 약 4 배 무거워 질량으로 따지면 헬륨이 약 25%, 수소가 약 74%입니다. 이 3 : 1의 질량비는 빅뱅 뒤 처음 몇 분 동안 만들어진 비율과 거의 같습니다. 태양은 46억 년 동안 수소를 헬륨으로 바꿔 왔지만, 그 변화는 대부분 핵이 있는 중심부에서 일어나 표면의 성분은 태어날 때와 거의 같습니다.<br>"
      + "산소·탄소·철처럼 무거운 원소는 다 합쳐도 질량의 약 1.3% 뿐인데, 이것들은 태양보다 먼저 살다 간 별들이 만들어 흩뿌린 것입니다."
  }
  ]
});
})();
