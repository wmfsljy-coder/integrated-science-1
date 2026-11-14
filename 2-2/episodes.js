/* 통합과학1 Ⅱ-2 물질의 규칙성과 성질 — 소단원별 이야기 네 편
   01 빈칸이 있는 표 / 02 녹이면 통한다 / 03 같은 부품, 다른 물건 / 04 거꾸로 가는 물질
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is1-2-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
/* 밝은 스튜디오 화면용 색: 캔버스 위 글자·선은 진한 색으로 (이름표 pill 은 어두운 바탕이라 무대 색 그대로) */
var LIGHT = { "--ink": "#12203a", "--mist": "#5c7086", "--brand": "#1c7ed6", "--brand-700": "#1864ab", "--teal": "#0ca678", "--teal-700": "#087f5b",
  "--violet": "#7048e8", "--violet-700": "#5f3dc4", "--coral": "#e8590c", "--coral-700": "#c2410c", "--amber": "#f59f00", "--amber-700": "#d9480f",
  "--green": "#0f9f76", "--green-700": "#087f5b", "--rose": "#e64980", "--rose-700": "#c2255c", "--on-accent": "#ffffff", "--card-2": "#eef2f8" };
function v(name) { return LIGHT[name] || window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function log10(x) { return Math.log(x) / Math.LN10; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KS = K.C, REDUCE = K.REDUCE;
/* 캔버스마다 무대 종류와 별 씨앗 */
var STAGE = {
  "a-tab": ["lab", 3], "a-trend": ["lab", 5], "a-eka": ["lab", 9], "a-rx": ["lab", 13],
  "b-make": ["night", 21], "b-prop": ["lab", 23],
  "c-tet": ["earth", 31], "c-carb": ["night", 33], "c-poly": ["night", 35],
  "d-band": ["lab", 41], "d-dope": ["night", 43], "d-diode": ["lab", 45]
};
function paper(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  K.studio(ctx, 0, 0, W, H, null);
}
var LT = K.LT;
/* 바닥 그림자 */
function floorShadow(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || 0.28) + ")"); g.addColorStop(0.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
/* 비스듬히 내려다본 판·타일: 앞면 + 윗면 + 오른쪽 옆면 (d = 깊이) */
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w + d, y + h - d * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
function hexOf(c) { var r = rgbOf(c); return "#" + r.map(function (q) { return ("0" + Math.round(q).toString(16)).slice(-2); }).join(""); }
/* 한 색으로 칠한 입체 타일·막대 */
function tile(ctx, x, y, w, h, d, c) {
  var hx = hexOf(c), g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, K.tint(hx, 1.08)); g.addColorStop(1, K.tint(hx, .88));
  slab(ctx, x, y, w, h, d, K.tint(hx, 1.22), g, K.tint(hx, .68));
}
function col(c) { return !c ? KS.ink : (c.indexOf("--") === 0 ? v(c) : c); }
function rgbOf(c) {
  c = col(c);
  if (c.charAt(0) === "#") {
    if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
  }
  var m = /(\d+)\D+(\d+)\D+(\d+)/.exec(c); return m ? [+m[1], +m[2], +m[3]] : [200, 210, 255];
}
function rgba(c, a) { var r = rgbOf(c); return "rgba(" + r[0] + "," + r[1] + "," + r[2] + "," + a + ")"; }
function shade(c, k) { var r = rgbOf(c); return "rgb(" + Math.round(r[0] * k) + "," + Math.round(r[1] * k) + "," + Math.round(r[2] * k) + ")"; }
/* 반투명 이름표 */
var PILLC = { brand: "blue", teal: "green", violet: "violet", coral: "orange", amber: "yellow", green: "green", rose: "red", mist: "mute", ink: "ink" };
var REV = {}; Object.keys(LIGHT).forEach(function (k) { REV[LIGHT[k]] = k; });
function pill(ctx, s, x, y, o) { o = o || {}; var c0 = o.c && REV[o.c] ? REV[o.c] : o.c; var c = c0 && c0.indexOf("--") === 0 ? KS[PILLC[c0.slice(2).split("-")[0]] || "ink"] : col(c0); return K.pill(ctx, s, x, y, { a: o.a, s: o.s, w: o.w, c: c, box: o.box, bg: o.bg, line: o.line }); }
/* 입체 공(원자·이온·입자) */
function ball(ctx, x, y, r, c) { var b = col(c); K.planet(ctx, x, y, r, b, shade(b, .38)); }
/* 빛나는 점(전자·불꽃) */
function dot(ctx, x, y, r, c, halo) {
  var hr = r * (halo || 3), g = ctx.createRadialGradient(x, y, r * .6, x, y, hr);
  g.addColorStop(0, rgba(c, .35)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, hr, 0, 6.2832); ctx.fill();
  ball(ctx, x, y, r * 1.05, c);
}
/* 유리판 상자 */
function glass(ctx, x, y, w, h, c, r) {
  var rr = r == null ? 12 : r, g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#eef2f8");
  ctx.save(); ctx.shadowColor = "rgba(20,30,60,.16)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2; ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, rr); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, rr); ctx.clip(); ctx.fillStyle = col(c || "--brand"); ctx.fillRect(x, y, 5, h); ctx.restore();
}
/* 빛나는 막대 눈금 */
function meter(ctx, x, y, w, h, f, c) {
  ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = "rgba(40,60,110,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.stroke();
  f = clamp(f, 0, 1); if (f <= 0) return;
  var g = ctx.createLinearGradient(x, 0, x + w * f, 0);
  g.addColorStop(0, shade(c, .55)); g.addColorStop(1, col(c));
  ctx.save(); ctx.shadowColor = "rgba(20,30,60,.25)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1; ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * f), h, h / 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.beginPath(); ctx.roundRect(x + 2, y + 2, Math.max(h - 4, w * f - 4), h * .35, h / 4); ctx.fill();
}
/* ⏸ 멈추기 단추 연결 */
function playBtn(id, onLabel, offLabel, get, set) {
  var b = $(id); if (!b) return;
  function lab() { b.textContent = get() ? onLabel : offLabel; }
  b.addEventListener("click", function () { set(!get()); lab(); }); lab();
}
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function sup(n) { return String(n).split("").map(function (c) { return SUP[c] || c; }).join(""); }
function sci(x, d) {
  if (!x) return "0";
  var p = Math.floor(log10(Math.abs(x)));
  var m = x / Math.pow(10, p);
  if (m >= 9.995) { m = m / 10; p += 1; }
  return m.toFixed(d == null ? 1 : d) + "×10" + sup(p);
}
function segOn(wrapId, btn) {
  var bs = $(wrapId).querySelectorAll("button");
  Array.prototype.forEach.call(bs, function (b) { b.classList.toggle("on", b === btn); });
}
function onSeg(wrapId, fn) {
  Array.prototype.forEach.call($(wrapId).querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { segOn(wrapId, b); fn(b); });
  });
}
function chip(ctx, x, y, w, h, c) { glass(ctx, x, y, w, h, c && c !== "--card-2" ? c : "--brand", 12); }
function mark(ctx, ok, s, x, y, o) {
  o = o || {};
  pill(ctx, (ok ? "✔ " : "○ ") + s, x + 7, y, { s: o.s || 12, a: o.a || "left", c: ok ? KS.green : KS.mute, bg: ok ? "rgba(20,70,50,.55)" : KS.pill });
}

/* =========================================================================
   이야기 ① 빈칸이 있는 표
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  var SYM = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca"];
  var KOR = ["수소", "헬륨", "리튬", "베릴륨", "붕소", "탄소", "질소", "산소", "플루오린", "네온",
             "나트륨", "마그네슘", "알루미늄", "규소", "인", "황", "염소", "아르곤", "칼륨", "칼슘"];
  var RAD = [53, 31, 152, 112, 85, 77, 75, 73, 71, 69, 186, 160, 143, 118, 110, 103, 99, 97, 227, 197];
  var IE  = [1312, 2372, 520, 899, 801, 1086, 1402, 1314, 1681, 2081, 496, 738, 578, 786, 1012, 1000, 1251, 1521, 419, 590];
  var GRP = [1, 18, 1, 2, 13, 14, 15, 16, 17, 18, 1, 2, 13, 14, 15, 16, 17, 18, 1, 2];
  var PER = [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4];
  var SHELL = [[1], [2], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8],
               [2, 8, 1], [2, 8, 2], [2, 8, 3], [2, 8, 4], [2, 8, 5], [2, 8, 6], [2, 8, 7], [2, 8, 8],
               [2, 8, 8, 1], [2, 8, 8, 2]];
  var METAL = { 3: 1, 4: 1, 11: 1, 12: 1, 13: 1, 19: 1, 20: 1 };
  function colOf(i) { var g = GRP[i]; return g === 1 ? 0 : (g === 2 ? 1 : g - 11); }
  function val(i) { if (GRP[i] === 18) return 0; var s = SHELL[i]; return s[s.length - 1]; }  /* 18족은 원자가 전자 0개로 본다 */

  window.sthGate({
    gate: "g1", key: "period1", title: "조사관의 첫 추리",
    question: "멘델레예프는 1869년 표에 빈칸을 남겼고, 1871년에는 <b>아직 발견되지도 않은 원소</b>의 원자량과 밀도를 예측해 적었습니다. 15년 뒤 그 값이 거의 맞는 것으로 드러났습니다. 어떻게 그럴 수 있었을까요?",
    options: [
      "㉠ 운이 좋았을 뿐이다",
      "㉡ 원소를 순서대로 늘어놓으면 성질이 일정하게 되풀이되기 때문",
      "㉢ 실험으로 그 원소를 먼저 만들어 보았기 때문",
      "㉣ 빈칸의 원소는 이웃과 성질이 전혀 달라 따로 계산했기 때문"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ------------------------------------------------ 장면 2 — 주기율표 판독기 */
  (function () {
    var cv1 = $("a-tab"), ctx1 = window.setupCanvas(cv1);
    var cv2 = $("a-trend"), ctx2 = window.setupCanvas(cv2);
    var z = 1;
    var got = window.sthState("pTab") || { ones: [], ie: false, rad: false };
    if (!got.ones) got.ones = [];

    function drawTable() {
      paper(ctx1, 900, 280);
      /* 입체 주기율표 — 칸마다 블록, 고른 원소는 위로 솟는다 */
      var CP = 46, I = K.iso({ ox: 168, oy: 44, s: 0.74, L: CP * 8, D: CP * 4 }), cells = [], i;
      floorShadow(ctx1, 290, 232, 230, 26, .22);
      I.box(ctx1, -10, -10, -12, CP * 8 + 10, CP * 4 + 10, 0, "#eef1f6", "#cfd6e1", "#aeb8c8");
      var gl = [1, 2, 13, 14, 15, 16, 17, 18];
      for (i = 0; i < 8; i++) { var gp = I.P(i * CP + CP / 2, -22, 0); K.t(ctx1, gl[i] + "족", gp.x + 12, gp.y - 4, { s: 11, w: "800", a: "center", c: LT.mute }); }
      for (i = 1; i <= 4; i++) { var pp = I.P(-14, (i - 1) * CP + CP / 2, 0); K.t(ctx1, i + "주기", pp.x - 12, pp.y + 10, { s: 11, w: "800", a: "right", c: LT.mute }); }
      for (var gy = 0; gy < 4; gy++) for (var gx = 0; gx < 8; gx++) cells.push({ gx: gx, gy: gy, el: -1 });
      for (i = 0; i < 20; i++) cells[(PER[i] - 1) * 8 + colOf(i)].el = i;
      cells.sort(function (p, q) { return (p.gx + p.gy) - (q.gx + q.gy) || p.gx - q.gx; });
      cells.forEach(function (c) {
        var x0 = c.gx * CP + 4, y0 = c.gy * CP + 4, x1 = x0 + CP - 8, y1 = y0 + CP - 8;
        if (c.el < 0) { I.plane(ctx1, .5, "rgba(255,255,255,.55)", "rgba(120,135,165,.22)", x0, x1, y0, y1); return; }
        var on = c.el === z - 1, h = on ? 34 : 12, b = on ? "#339af0" : (METAL[c.el + 1] ? "#ffc078" : (GRP[c.el] === 18 ? "#b197fc" : "#74c0fc"));
        I.box(ctx1, x0, y0, 0, x1, y1, h, K.tint(b, 1.22), K.tint(b, 1.0), K.tint(b, .72));
        var tp = I.P((x0 + x1) / 2, (y0 + y1) / 2, h);
        K.t(ctx1, SYM[c.el], tp.x, tp.y + 1, { s: 13, w: "900", a: "center", c: on ? "#ffffff" : "#1d2b45" });
        K.t(ctx1, String(val(c.el)), tp.x, tp.y + 13, { s: 11, w: "900", a: "center", c: on ? "#ffffff" : "#0b7285" });
      });

      /* 입체 원자 모형 — 기울어진 껍질 궤도 위의 전자, 주황 = 원자가 전자 */
      var sh = SHELL[z - 1], cx = 548, cy = 116, k, j, TL = .38, OR = 56 + 14 * sh.length;
      function shR(q) { return Math.max(32, OR * (q + 1) / sh.length); }
      floorShadow(ctx1, cx, 226, 92, 12, .26);
      slab(ctx1, cx - 40, 214, 72, 10, 12, "#f4f6fa", "#cfd6e1", "#a6b0c0");
      ctx1.fillStyle = "#c3cad5"; ctx1.beginPath(); ctx1.moveTo(cx - 6, 214); ctx1.lineTo(cx - 3, cy); ctx1.lineTo(cx + 3, cy); ctx1.lineTo(cx + 6, 214); ctx1.closePath(); ctx1.fill();
      var halo = ctx1.createRadialGradient(cx, cy, 0, cx, cy, 112);
      halo.addColorStop(0, "rgba(162,136,245,.20)"); halo.addColorStop(1, "rgba(162,136,245,0)");
      ctx1.fillStyle = halo; ctx1.beginPath(); ctx1.arc(cx, cy, 112, 0, Math.PI * 2); ctx1.fill();
      var elc = [];
      for (k = 0; k < sh.length; k++) {
        var r = shR(k), last = (k === sh.length - 1);
        ctx1.strokeStyle = last ? "rgba(232,89,12,.55)" : "rgba(40,60,110,.30)"; ctx1.lineWidth = last ? 2 : 1.4;
        ctx1.beginPath(); ctx1.ellipse(cx, cy, r, r * TL, 0, Math.PI, Math.PI * 2); ctx1.stroke();
        for (j = 0; j < sh[k]; j++) {
          var a = j * 2 * Math.PI / sh[k] + k * .4 + .3;
          elc.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * TL, f: Math.sin(a) >= 0, last: last });
        }
      }
      function eDot(e) { if (e.last) dot(ctx1, e.x, e.y, 5.2, "--coral", 3); else dot(ctx1, e.x, e.y, 3.4, "#748ffc", 2.4); }
      elc.filter(function (e) { return !e.f; }).forEach(eDot);
      ball(ctx1, cx, cy, 20, "--violet");
      text(ctx1, "+" + z, cx, cy + 4, { s: 12, w: "900", a: "center", c: "#ffffff" });
      for (k = 0; k < sh.length; k++) {
        var r2 = shR(k), l2 = (k === sh.length - 1);
        ctx1.strokeStyle = l2 ? "rgba(232,89,12,.7)" : "rgba(40,60,110,.38)"; ctx1.lineWidth = l2 ? 2 : 1.4;
        ctx1.beginPath(); ctx1.ellipse(cx, cy, r2, r2 * TL, 0, 0, Math.PI); ctx1.stroke();
      }
      elc.filter(function (e) { return e.f; }).forEach(eDot);
      pill(ctx1, "전자 껍질 · 주황 = 원자가 전자", cx, 254, { s: 12, a: "center", c: KS.mute });

      /* 오른쪽 흰 카드 */
      var cx0 = 680, cw0 = 206, bx0 = cx0 + 16, R0 = cx0 + cw0 - 16;
      K.card(ctx1, cx0, 8, cw0, 264, "판독 · 고른 원소");
      K.t(ctx1, SYM[z - 1] + " · " + KOR[z - 1], bx0, 66, { s: 22, w: "900", c: "#1c7ed6" });
      K.t(ctx1, "원자 번호 " + z + " · " + PER[z - 1] + "주기 " + GRP[z - 1] + "족", bx0, 88, { s: 12, w: "800", c: LT.mute });
      K.row(ctx1, "전자 배치", sh.join(", "), bx0, R0, 114);
      K.row(ctx1, "원자가 전자", val(z - 1) + "개", bx0, R0, 138, LT.orange);
      K.row(ctx1, "원자 반지름", RAD[z - 1] + " pm", bx0, R0, 162, LT.teal);
      K.row(ctx1, "이온화 에너지", IE[z - 1].toLocaleString(), bx0, R0, 186, LT.violet);
      K.t(ctx1, "kJ/mol", R0, 200, { s: 11, a: "right", c: LT.mute });
      mark(ctx1, got.ones.length >= 4, "원자가 전자 1개 (" + got.ones.length + "/4)", bx0 - 8, 218, { s: 11.5 });
      mark(ctx1, got.ie, "이온화 에너지 1위", bx0 - 8, 238, { s: 11.5 });
      mark(ctx1, got.rad, "원자 반지름 1위", bx0 - 8, 258, { s: 11.5 });
      text(ctx1, "블록 위 숫자 = 원자가 전자 수 · 주황 = 금속 · 가로줄마다 1 → 7, 18족(0) 뒤 다시 1", 18, 274, { s: 11.5, c: LT.mute });
    }

    /* 입체 주기율표 두 판 — 칸마다 기둥 높이 = 원자 반지름 / 이온화 에너지. 지금 고른 원소는 주황 */
    function skyline(ox, oy, vals, vmax, base, title, unit) {
      var CP = 38, IN = 8, HM = 92, I = K.iso({ ox: ox, oy: oy, s: 0.72, L: CP * 8, D: CP * 4 }), cells = [], i;
      I.box(ctx2, -8, -8, -9, CP * 8 + 8, CP * 4 + 8, 0, "#eef1f6", "#cfd6e1", "#aeb8c8");
      for (var gy = 0; gy < 4; gy++) for (var gx = 0; gx < 8; gx++) cells.push({ gx: gx, gy: gy, el: -1 });
      for (i = 0; i < 20; i++) cells[(PER[i] - 1) * 8 + colOf(i)].el = i;
      cells.sort(function (p, q) { return (p.gx + p.gy) - (q.gx + q.gy) || p.gx - q.gx; });
      cells.forEach(function (c) {
        var x0 = c.gx * CP + IN, y0 = c.gy * CP + IN, x1 = x0 + CP - IN * 2, y1 = y0 + CP - IN * 2;
        if (c.el < 0) { I.plane(ctx2, .5, "rgba(255,255,255,.6)", "rgba(120,135,165,.25)", x0, x1, y0, y1); return; }
        var on = c.el === z - 1, h = Math.max(4, vals[c.el] / vmax * HM), b = on ? "#f76707" : base;
        var lt = on ? 1 : 1.12 - c.gy * .07;
        I.box(ctx2, x0, y0, 0, x1, y1, h, K.tint(b, 1.28 * lt), K.tint(b, 1.0 * lt), K.tint(b, .7 * lt));
        var tp = I.P((x0 + x1) / 2, (y0 + y1) / 2, h);
        K.t(ctx2, SYM[c.el], tp.x, tp.y + 4, { s: 12, w: "900", a: "center", c: on ? "#ffffff" : "#1d2b45" });
      });
      var sel = z - 1, sx = colOf(sel) * CP + CP - IN, sy = (PER[sel] - 1) * CP + IN;
      I.label(ctx2, sx, sy, Math.max(4, vals[sel] / vmax * HM), vals[sel].toLocaleString() + unit, 26, -34, "#ffc078", [ox - 100, ox + 200]);
      pill(ctx2, title, ox - 95, 30, { s: 12.5, c: base === "#12b886" ? KS.green : KS.violet });
      var r1 = I.P(CP * 8 + 8, CP * 4 + 8, -9), l1 = I.P(-8, CP * 4 + 8, -9);
      K.t(ctx2, "족 →", (r1.x * 2 + I.P(CP * 8 + 8, -8, -9).x) / 3 + 10, (r1.y * 2 + I.P(CP * 8 + 8, -8, -9).y) / 3 + 18, { s: 12, w: "800", c: LT.mute });
      K.t(ctx2, "← 주기", (l1.x + r1.x) / 2 - 70, (l1.y + r1.y) / 2 + 22, { s: 12, w: "800", c: LT.mute });
    }

    function drawTrend() {
      paper(ctx2, 900, 340);
      floorShadow(ctx2, 165, 300, 160, 22, .22);
      floorShadow(ctx2, 470, 300, 160, 22, .22);
      skyline(110, 112, RAD, 227, "#12b886", "원자 반지름 (pm) · 기둥이 높을수록 큰 원자", " pm");
      skyline(415, 112, IE, 2372, "#845ef7", "1차 이온화 에너지 (kJ/mol) · 높을수록 떼기 어렵다", " kJ/mol");
      var i = z - 1, cx0 = 640, cw0 = 246, bx0 = cx0 + 16;
      K.card(ctx2, cx0, 14, cw0, 312, "판독 · 지금 고른 원소");
      K.t(ctx2, SYM[i] + "  " + KOR[i], bx0, 72, { s: 24, w: "900", c: "#e8590c" });
      K.row(ctx2, "자리", PER[i] + "주기 " + GRP[i] + "족", bx0, cx0 + cw0 - 16, 104);
      K.row(ctx2, "원자 반지름", RAD[i] + " pm", bx0, cx0 + cw0 - 16, 130, LT.green);
      K.bar(ctx2, bx0, 140, cw0 - 32, RAD[i] / 227, LT.green);
      K.row(ctx2, "이온화 에너지", IE[i].toLocaleString() + " kJ/mol", bx0, cx0 + cw0 - 16, 180, LT.violet);
      K.bar(ctx2, bx0, 190, cw0 - 32, IE[i] / 2372, LT.violet);
      var tip = GRP[i] === 1 ? "1족: 반지름 크고 이온화 E 작다" : GRP[i] === 18 ? "18족: 이온화 E 가 주기에서 최대" : "오른쪽으로 갈수록 반지름↓ E↑";
      K.tip(ctx2, tip, bx0, 216, cw0 - 32, null);
      K.t(ctx2, "같은 주기(가로줄)마다", bx0, 278, { s: 12, c: LT.mute });
      K.t(ctx2, "높낮이 톱니가 되풀이됩니다", bx0, 298, { s: 12, c: LT.mute });
    }

    function say() {
      var i = z - 1;
      var msg = "<b>" + SYM[i] + "</b>(" + KOR[i] + ") · " + PER[i] + "주기 " + GRP[i] + "족 · 원자가 전자 <b>" + val(i) + "개</b> · 원자 반지름 <b>" + RAD[i] + " pm</b> · 이온화 에너지 <b>" + IE[i].toLocaleString() + " kJ/mol</b><br>";
      if (GRP[i] === 18) msg += "바깥 껍질이 꽉 찼습니다. 전자를 주고받을 까닭이 없어 <b>거의 반응하지 않습니다</b>. 이온화 에너지가 그 주기에서 가장 큽니다.";
      else if (GRP[i] === 1) msg += "원자가 전자가 <b>1개</b>뿐이라 그것만 내주면 안정해집니다. 그래서 이온화 에너지가 그 주기에서 가장 작고, 아주 잘 반응합니다.";
      else if (GRP[i] === 17) msg += "원자가 전자가 <b>7개</b>라 1개만 얻으면 8개가 됩니다. 그래서 전자를 아주 잘 빼앗습니다.";
      else msg += "같은 가로줄(주기)에서 오른쪽으로 갈수록 원자핵의 전하가 커져 전자를 더 세게 당깁니다. 그래서 반지름은 <b>작아지고</b> 이온화 에너지는 <b>커집니다</b>.";
      $("a-tab-info").innerHTML = msg;
    }

    function check() {
      var ch = false;
      if (val(z - 1) === 1 && got.ones.indexOf(z) < 0) { got.ones.push(z); ch = true; }
      if (z === 2 && !got.ie) { got.ie = true; ch = true; }
      if (z === 19 && !got.rad) { got.rad = true; ch = true; }
      if (ch) { window.sthState("pTab", got); mission(); }
    }
    function mission() {
      if (got.ones.length >= 4) done("m1-2a");
      if (got.ie) done("m1-2b");
      if (got.rad) done("m1-2c");
      if (got.ones.length >= 4 && got.ie && got.rad) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>원자가 전자 1개인 자리가 <b>1 · 3 · 11 · 19</b> 번으로 되풀이되고, 이온화 에너지 1위는 껍질이 꽉 찬 <b>헬륨</b>, 원자 반지름 1위는 껍질이 가장 많은 <b>칼륨</b>이었습니다. 표 전체가 규칙으로 짜여 있습니다.");
        ep.clear(1);
      }
    }
    function redraw() { drawTable(); drawTrend(); say(); }
    cv1._redraw = redraw; cv2._redraw = function () {};
    $("a-z").addEventListener("input", function (e) {
      z = +e.target.value; $("a-z-val").textContent = z + " · " + KOR[z - 1];
      redraw(); check();
    });
    redraw(); mission();
  })();

  /* ------------------------------------------------ 장면 3 — 에카규소 예측기 */
  (function () {
    var cv = $("a-eka"), ctx = window.setupCanvas(cv);
    var am = 60, de = 4;
    var got = window.sthState("pEka") || { a: false, d: false };
    var N = {
      up:   { s: "Si", k: "규소", m: 28.09, d: 2.33 },
      down: { s: "Sn", k: "주석", m: 118.71, d: 7.31 },
      left: { s: "Ga", k: "갈륨", m: 69.72, d: 5.91 },
      right:{ s: "As", k: "비소", m: 74.92, d: 5.73 }
    };
    var AM_LR = (N.left.m + N.right.m) / 2;      /* 72.32 */
    var AM_UD = (N.up.m + N.down.m) / 2;         /* 73.40 */
    var AM_T  = (AM_LR + AM_UD) / 2;             /* 72.86 */
    var DE_LR = (N.left.d + N.right.d) / 2;      /* 5.82 */
    var DE_UD = (N.up.d + N.down.d) / 2;         /* 4.82 */
    var DE_T  = (DE_LR + DE_UD) / 2;             /* 5.32 */

    /* 입체 주기율표 조각 — 다섯 칸을 십자로 놓고 칸마다 원자량(보라)·밀도(청록) 기둥을 세운다 */
    var EI = K.iso({ ox: 230, oy: 140, s: 0.62, L: 390, D: 390 }), PT = 150, CW = 90, MH = 1.08, DH = 17.6;
    var CELLS = [
      { o: N.up, gx: 1, gy: 0, dx: -12, dy: -40 }, { o: N.left, gx: 0, gy: 1, dx: -12, dy: -36 },
      { o: null, gx: 1, gy: 1, dx: 0, dy: -22 },
      { o: N.right, gx: 2, gy: 1, dx: 22, dy: -22 }, { o: N.down, gx: 1, gy: 2, dx: -22, dy: -18 }
    ];
    function prism(x0, y0, x1, y1, h, base, ghost, okc) {
      if (ghost) {
        var fc = okc ? "rgba(15,159,118,.85)" : "rgba(232,89,12,.30)", rc = okc ? "rgba(8,110,80,.9)" : "rgba(194,65,12,.38)", tc = okc ? "rgba(99,230,190,.95)" : "rgba(255,192,150,.55)";
        EI.box(ctx, x0, y0, 10, x1, y1, 10 + h, tc, fc, rc);
        ctx.save(); ctx.strokeStyle = okc ? "#087f5b" : "#c2410c"; ctx.lineWidth = 1.6; ctx.setLineDash(okc ? [] : [5, 4]);
        var a = EI.P(x0, y1, 10), b = EI.P(x1, y1, 10), c = EI.P(x1, y0, 10), d = EI.P(x0, y1, 10 + h), e = EI.P(x1, y1, 10 + h), f = EI.P(x1, y0, 10 + h), g = EI.P(x0, y0, 10 + h);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.moveTo(a.x, a.y); ctx.lineTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.lineTo(f.x, f.y); ctx.lineTo(g.x, g.y); ctx.lineTo(d.x, d.y);
        ctx.moveTo(b.x, b.y); ctx.lineTo(e.x, e.y); ctx.moveTo(c.x, c.y); ctx.lineTo(f.x, f.y); ctx.stroke(); ctx.restore();
        return;
      }
      EI.box(ctx, x0, y0, 10, x1, y1, 10 + h, K.tint(base, 1.25), K.tint(base, 1.0), K.tint(base, .72));
    }
    function cellDraw(cd) {
      var x0 = cd.gx * PT, y0 = cd.gy * PT, o = cd.o, mid = !o;
      EI.box(ctx, x0, y0, 0, x0 + CW, y0 + CW, 10, mid ? "#e7f5ff" : "#f8f9fb", mid ? "#a5d8ff" : "#d5dbe5", mid ? "#74c0fc" : "#b3bcca");
      var mH = (mid ? am : o.m) * MH, dH = (mid ? de : o.d) * DH;
      prism(x0 + 12, y0 + 14, x0 + CW / 2 - 3, y0 + CW - 14, mH, "#845ef7", mid, mid && got.a);
      prism(x0 + CW / 2 + 3, y0 + 14, x0 + CW - 12, y0 + CW - 14, dH, "#12b886", mid, mid && got.d);
    }
    function cellLabel(cd) {
      var x0 = cd.gx * PT, y0 = cd.gy * PT, o = cd.o, mid = !o;
      var mH = (mid ? am : o.m) * MH, dH = (mid ? de : o.d) * DH;
      var top = EI.P(x0 + CW / 2, y0 + CW / 2, 10 + Math.max(mH, dH));
      if (mid) pill(ctx, "? 에카규소", top.x, top.y - 16, { s: 13, a: "center", c: KS.orange });
      else EI.label(ctx, x0 + CW / 2, y0 + CW / 2, 10 + Math.max(mH, dH), o.s + "  " + o.m.toFixed(1) + " · " + o.d.toFixed(2), cd.dx, cd.dy, "#ffffff");
    }

    function line(y, lo, hi, cur, lr, ud, tgt, ok, title, fmt, unit) {
      var X0 = 474, X1 = 860;
      function px(x) { return X0 + (clamp(x, lo, hi) - lo) / (hi - lo) * (X1 - X0); }
      K.t(ctx, title, X0, y - 48, { s: 13, w: "900", c: LT.ink });
      var tg = ctx.createLinearGradient(X0, 0, X1, 0); tg.addColorStop(0, "rgba(127,211,255,.25)"); tg.addColorStop(1, "rgba(182,156,255,.5)");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(X0, y - 4, X1 - X0, 8, 4); ctx.fill();
      for (var tq = 0; tq <= 10; tq++) { ctx.fillStyle = "rgba(40,60,110,.35)"; ctx.fillRect(X0 + (X1 - X0) * tq / 10 - .5, y + 6, 1, 5); }
      K.t(ctx, fmt(lo), X0, y + 26, { s: 12, c: LT.mute });
      K.t(ctx, fmt(hi), X1, y + 26, { s: 12, a: "right", c: LT.mute });
      function tick(x, lab, colr, up) {
        var gx = px(x);
        ctx.strokeStyle = colr; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(gx, y - 9); ctx.lineTo(gx, y + 9); ctx.stroke();
        K.t(ctx, lab, clamp(gx, X0 + 60, X1 - 60), y - 14 - (up || 0), { s: 12, w: "800", a: "center", c: colr });
      }
      tick(lr, "왼·오른 평균 " + fmt(lr), "#087f5b");
      tick(ud, "위·아래 평균 " + fmt(ud), "#d9480f", 16);
      if (ok) {
        var tx = px(tgt);
        ctx.save(); ctx.shadowColor = LT.green; ctx.shadowBlur = 8; ctx.strokeStyle = LT.green; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(tx, y - 14); ctx.lineTo(tx, y + 14); ctx.stroke(); ctx.restore();
        K.t(ctx, "네 이웃 평균 " + fmt(tgt), clamp(tx, X0 + 70, X1 - 70), y + 26, { s: 12, w: "900", a: "center", c: "#087f5b" });
      }
      var cx = px(cur);
      dot(ctx, cx, y, 7, "--coral", 2.6);
      K.t(ctx, "내 예측 " + fmt(cur) + unit, clamp(cx, X0 + 70, X1 - 80), y + 46, { s: 13, w: "900", a: "center", c: "#c2410c" });
    }

    function f2(x) { return x.toFixed(2); }

    function draw() {
      paper(ctx, 900, 420);
      floorShadow(ctx, 232, 398, 220, 26, .28);
      /* 주기율표 판(빈 모서리 칸 포함) */
      EI.box(ctx, -14, -14, -10, 404, 404, 0, "#eef1f6", "#cfd6e1", "#aeb8c8");
      [[0, 0], [2, 0], [0, 2], [2, 2]].forEach(function (e) {
        EI.plane(ctx, 0.5, "rgba(255,255,255,.75)", "rgba(120,135,165,.35)", e[0] * PT, e[0] * PT + CW, e[1] * PT, e[1] * PT + CW);
      });
      [CELLS[0], CELLS[1], CELLS[2], CELLS[3], CELLS[4]].forEach(cellDraw);
      CELLS.forEach(cellLabel);
      K.bigText(ctx, "1871년 · 빈칸 예측", 18, 38, 24, "#ffffff");
      pill(ctx, "보라 = 원자량 · 청록 = 밀도 · 주황 점선 = 내 예측", 18, 66, { s: 12, c: KS.mute });
      K.t(ctx, "Si 규소 · Ga 갈륨 · As 비소 · Sn 주석 (원자량 · 밀도)", 18, 410, { s: 12, w: "700", c: LT.mute });

      K.card(ctx, 452, 16, 434, 392, "판정 · 이웃 네 칸으로 빈칸 채우기");
      line(124, 60, 86, am, AM_LR, AM_UD, AM_T, got.a, "① 원자량 예측", function (x) { return x.toFixed(1); }, "");
      line(258, 4, 7, de, DE_LR, DE_UD, DE_T, got.d, "② 밀도 예측 (g/cm³)", f2, " g/cm³");
      K.t(ctx, (got.a ? "✔ " : "○ ") + "원자량 맞힘", 474, 340, { s: 13, w: "800", c: got.a ? LT.green : LT.mute });
      K.t(ctx, (got.d ? "✔ " : "○ ") + "밀도 맞힘", 640, 340, { s: 13, w: "800", c: got.d ? LT.green : LT.mute });
      if (got.a && got.d) {
        K.t(ctx, "1886년 빈클러의 실측 — 저마늄", 474, 370, { s: 12.5, w: "900", c: "#087f5b" });
        K.t(ctx, "원자량 72.63 · 밀도 5.32 g/cm³", 474, 390, { s: 12.5, w: "900", c: "#087f5b" });
      } else {
        K.t(ctx, "두 눈금을 모두 맞히면 1886년의", 474, 370, { s: 12, c: LT.mute });
        K.t(ctx, "실측값을 보여 드립니다", 474, 390, { s: 12, c: LT.mute });
      }
      say();
    }
    function hint(d, unit) {
      var a = Math.abs(d);
      if (a < 0.0001) return "정확합니다.";
      var dir = d > 0 ? "높습니다" : "낮습니다";
      if (a > (unit === "am" ? 4 : 0.5)) return "많이 " + dir + ".";
      if (a > (unit === "am" ? 1.2 : 0.15)) return "조금 " + dir + ".";
      return "거의 다 왔습니다 — 아주 조금 " + dir + ".";
    }
    function say() {
      var m = "";
      m += got.a ? "① 원자량 <b>맞혔습니다</b>. 네 이웃의 평균은 <b>" + AM_T.toFixed(2) + "</b>입니다. "
                 : "① 원자량 예측 <b>" + am.toFixed(1) + "</b> — 네 이웃의 평균보다 " + hint(am - AM_T, "am") + " ";
      m += "<br>";
      m += got.d ? "② 밀도 <b>맞혔습니다</b>. 네 이웃의 평균은 <b>" + DE_T.toFixed(2) + " g/cm³</b>입니다."
                 : "② 밀도 예측 <b>" + de.toFixed(2) + "</b> — 네 이웃의 평균보다 " + hint(de - DE_T, "de");
      if (got.a && got.d) m += "<br>멘델레예프가 적어 둔 값은 원자량 72, 밀도 5.5 였고, 실제 저마늄은 <b>72.63</b>과 <b>5.32</b> 였습니다. 이웃만 보고도 이만큼 맞힐 수 있었던 것은 성질이 <b>규칙적으로</b> 변하기 때문입니다.";
      $("a-eka-info").innerHTML = m;
    }
    function check() {
      var ch = false;
      if (!got.a && Math.abs(am - AM_T) <= 0.5) { got.a = true; ch = true; }
      if (!got.d && Math.abs(de - DE_T) <= 0.06) { got.d = true; ch = true; }
      if (ch) { window.sthState("pEka", got); mission(); draw(); }
    }
    function mission() {
      if (got.a) done("m1-3a");
      if (got.d) done("m1-3b");
      if (got.a && got.d) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>이웃 네 개의 평균만으로 원자량 <b>72.9</b>, 밀도 <b>5.32 g/cm³</b>를 얻었습니다. 1886년에 실제로 잰 저마늄은 <b>72.63</b>과 <b>5.32</b> — 표가 예언을 한 셈입니다.");
        ep.clear(2);
      }
    }
    cv._redraw = draw;
    $("a-am").addEventListener("input", function (e) { am = +e.target.value; $("a-am-val").textContent = am.toFixed(1); draw(); check(); });
    $("a-de").addEventListener("input", function (e) { de = +e.target.value; $("a-de-val").textContent = de.toFixed(2); draw(); check(); });
    draw(); mission();
  })();

  /* ------------------------------------------------ 장면 4 — 반응 실험대 */
  (function () {
    var cv = $("a-rx"), ctx = window.setupCanvas(cv);
    var fam = "g1", per = 2, rxT = 0, rxPlay = !REDUCE;
    var got = window.sthState("pRx") || { a: false, b: false, c: false }, qOK = !!window.sthState("pRxQ");
    var FAM = {
      g1: {
        name: "1족 · 알칼리 금속", val: 1, ion: "+1", act: "전자 1개를 잃는다", col: "--coral",
        list: [
          { p: 2, s: "Li", k: "리튬", n: 520, sh: [2, 1], w: "물 위에 뜬 채 조용히 거품(수소 기체)을 냅니다." },
          { p: 3, s: "Na", k: "나트륨", n: 496, sh: [2, 8, 1], w: "물 위에서 녹아 공 모양이 되어 빠르게 돌아다니며, 때때로 불꽃이 붙습니다." },
          { p: 4, s: "K", k: "칼륨", n: 419, sh: [2, 8, 8, 1], w: "물에 닿자마자 <b>보랏빛 불꽃</b>을 내며 격렬하게 탑니다." }
        ]
      },
      g17: {
        name: "17족 · 할로젠", val: 7, ion: "−1", act: "전자 1개를 얻는다", col: "--teal",
        list: [
          { p: 2, s: "F", k: "플루오린", n: 3.98, sh: [2, 7], w: "연노란색 기체. 거의 모든 원소와 반응하는 <b>가장 반응성이 큰</b> 원소입니다." },
          { p: 3, s: "Cl", k: "염소", n: 3.16, sh: [2, 8, 7], w: "황록색 기체. 나트륨과 만나면 밝은 빛을 내며 염화 나트륨이 됩니다." },
          { p: 4, s: "Br", k: "브로민", n: 2.96, sh: [2, 8, 18, 7], w: "실온에서 <b>액체</b>인 적갈색 물질. 염소보다는 덜 반응합니다." }
        ]
      },
      g18: {
        name: "18족 · 비활성 기체", val: 0, ion: "없음", act: "주지도 받지도 않는다", col: "--violet",
        list: [
          { p: 2, s: "Ne", k: "네온", n: 0, sh: [2, 8], w: "바깥 껍질이 꽉 찼습니다. 전기를 걸면 붉은빛을 내지만 <b>화학 반응은 하지 않습니다</b>." },
          { p: 3, s: "Ar", k: "아르곤", n: 0, sh: [2, 8, 8], w: "공기의 0.93%를 차지합니다. 반응하지 않아 백열전구와 용접에서 보호 기체로 씁니다." },
          { p: 4, s: "Kr", k: "크립톤", n: 0, sh: [2, 8, 18, 8], w: "반응하지 않습니다. 밝은 조명등에 씁니다." }
        ]
      }
    };
    function cur() { var L = FAM[fam].list, i; for (i = 0; i < L.length; i++) if (L[i].p === per) return L[i]; return L[0]; }
    function react() {
      var e = cur();
      if (fam === "g1") return Math.round((560 - e.n) / 1.6);
      if (fam === "g17") return Math.round((e.n - 2.4) / 1.6 * 100);
      return 0;
    }

    /* 입체 실험 장치: 1족은 물을 담은 큰 비커, 17족은 둥근 플라스크 속 홑원소, 18족은 받침대 위 방전관 */
    function vignette(cx, base, R) {
      var e = cur(), i, rr = K.rng(e.p * 7 + 3);
      floorShadow(ctx, cx, base + 4, 120, 14, .28);
      slab(ctx, cx - 100, base - 10, 180, 12, 20, "#f4f6fa", "#cfd6e1", "#a6b0c0");
      if (fam === "g1") {
        var bw = 86, top = 96, bot = base - 14, wy = top + 62;
        /* 비커 뒤쪽 벽 */
        ctx.fillStyle = "rgba(225,235,248,.55)"; ctx.beginPath(); ctx.ellipse(cx, top, bw, 14, 0, Math.PI, Math.PI * 2); ctx.fill();
        var wg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0); wg.addColorStop(0, "rgba(90,170,240,.55)"); wg.addColorStop(.5, "rgba(140,200,255,.45)"); wg.addColorStop(1, "rgba(40,110,200,.62)");
        ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(cx - bw, wy); ctx.lineTo(cx - bw, bot); ctx.ellipse(cx, bot, bw, 14, 0, Math.PI, 0, true); ctx.lineTo(cx + bw, wy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(170,215,255,.75)"; ctx.beginPath(); ctx.ellipse(cx, wy, bw, 14, 0, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.2; ctx.stroke();
        var sp = e.p === 2 ? .25 : (e.p === 3 ? 1 : 1.6);
        var lx = cx + Math.sin(rxT / 380) * 46 * sp, ly = wy - 2;
        var nb = Math.round(R / 5) + 3;
        for (i = 0; i < nb; i++) {
          var ph = (rxT / (900 - R * 5) + rr()) % 1, bx2 = lx + (rr() - .5) * (22 + R / 3), by2 = ly + 26 - ph * 40;
          ctx.strokeStyle = "rgba(255,255,255," + (.95 - ph * .7) + ")"; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(bx2 + Math.sin(ph * 9 + i) * 2, by2, 2 + rr() * 2.6, 0, 6.2832); ctx.stroke();
        }
        if (e.p >= 3) {
          var fl = e.p === 4 ? 1 : (Math.sin(rxT / 260) > .55 || REDUCE ? .6 : 0);
          if (fl > 0) for (i = 0; i < 5; i++) dot(ctx, lx + (rr() - .5) * 10, ly - 16 - i * 11 - Math.sin(rxT / 90 + i) * 3, 8 - i * 1.2, e.p === 4 ? "#c99cff" : "#ffb347", 3.2);
        }
        ball(ctx, lx, ly - 4, 12, "#cfd6e2");
        K.t(ctx, e.s, lx, ly, { s: 11, w: "900", a: "center", c: "#334" });
        /* 비커 유리 앞벽·테두리·눈금 */
        var gg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0); gg.addColorStop(0, "rgba(255,255,255,.55)"); gg.addColorStop(.18, "rgba(255,255,255,.08)"); gg.addColorStop(.85, "rgba(255,255,255,.05)"); gg.addColorStop(1, "rgba(255,255,255,.4)");
        ctx.fillStyle = gg; ctx.fillRect(cx - bw, top, bw * 2, bot - top);
        ctx.strokeStyle = "rgba(70,90,130,.55)"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(cx - bw, top); ctx.lineTo(cx - bw, bot); ctx.ellipse(cx, bot, bw, 14, 0, Math.PI, 0, true); ctx.lineTo(cx + bw, top); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, top, bw, 14, 0, 0, 6.2832); ctx.stroke();
        for (i = 1; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(cx - bw + 10, bot - i * 22); ctx.lineTo(cx - bw + 26, bot - i * 22); ctx.stroke(); }
      } else if (fam === "g17") {
        var GC = { 2: ["rgba(240,236,140,", .35], 3: ["rgba(170,220,80,", .5], 4: ["rgba(170,60,30,", .55] }[e.p];
        var fy = base - 84, fr = 74;
        ctx.fillStyle = "rgba(225,235,248,.55)"; ctx.beginPath(); ctx.roundRect(cx - 16, 70, 32, fy - fr - 60, 4); ctx.fill();
        var gg2 = ctx.createRadialGradient(cx - 20, fy - 20, 6, cx, fy, fr); gg2.addColorStop(0, GC[0] + GC[1] * .5 + ")"); gg2.addColorStop(1, GC[0] + GC[1] + ")");
        ctx.fillStyle = gg2; ctx.beginPath(); ctx.arc(cx, fy, fr, 0, 6.2832); ctx.fill();
        if (e.p === 4) { ctx.fillStyle = "rgba(130,35,15,.92)"; ctx.beginPath(); ctx.ellipse(cx, fy + fr * .72, fr * .62, 12, 0, 0, 6.2832); ctx.fill(); }
        for (i = 0; i < 16; i++) { var px2 = cx + Math.sin(rxT / 900 + i * 2.1) * fr * .62, py2 = fy + Math.cos(rxT / 1100 + i * 1.3) * fr * .55; ball(ctx, px2 - 3, py2, 3.4, GC[0] + ".95)"); ball(ctx, px2 + 3, py2, 3.4, GC[0] + ".95)"); }
        ctx.strokeStyle = "rgba(70,90,130,.6)"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(cx, fy, fr, 0, 6.2832); ctx.stroke();
        ctx.strokeRect(cx - 16, 70, 32, fy - fr - 60 + 2);
        ctx.fillStyle = "#8a6d4a"; ctx.fillRect(cx - 19, 60, 38, 14);
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.ellipse(cx - fr * .45, fy - fr * .45, fr * .2, fr * .1, -.7, 0, 6.2832); ctx.fill();
        pill(ctx, e.s + "₂ 분자", cx + fr - 4, fy - fr + 6, { s: 12, a: "left", c: KS.ink });
      } else {
        var NC = { 2: "#ff6a3d", 3: "#c9a2ff", 4: "#e9e6ff" }[e.p], fk = REDUCE ? 1 : .8 + .2 * Math.sin(rxT / 70) * Math.sin(rxT / 37);
        var ty = base - 120, tx0 = cx - 110, tx1 = cx + 90;
        [tx0 + 30, tx1 - 30].forEach(function (sx) { ctx.fillStyle = "#adb5bd"; ctx.fillRect(sx - 3, ty + 30, 6, base - 10 - ty - 30); ctx.fillStyle = "#868e96"; ctx.fillRect(sx - 12, base - 14, 24, 6); });
        var tg2 = ctx.createLinearGradient(0, ty - 26, 0, ty + 26);
        tg2.addColorStop(0, rgba(NC, .35 * fk)); tg2.addColorStop(.5, rgba(NC, .95 * fk)); tg2.addColorStop(1, rgba(NC, .35 * fk));
        ctx.save(); ctx.shadowColor = NC; ctx.shadowBlur = 26 * fk; ctx.fillStyle = tg2;
        ctx.beginPath(); ctx.roundRect(tx0, ty - 26, tx1 - tx0, 52, 26); ctx.fill(); ctx.restore();
        ctx.strokeStyle = "rgba(70,90,130,.55)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(tx0, ty - 26, tx1 - tx0, 52, 26); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(tx0 + 20, ty - 18, tx1 - tx0 - 40, 6);
        ctx.fillStyle = "#6c757d"; ctx.fillRect(tx0 - 14, ty - 9, 18, 18); ctx.fillRect(tx1 - 4, ty - 9, 18, 18);
        ctx.strokeStyle = "#c2410c"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(tx0 - 14, ty); ctx.lineTo(tx0 - 30, ty); ctx.lineTo(tx0 - 30, ty - 60); ctx.lineTo(tx1 + 30, ty - 60); ctx.lineTo(tx1 + 30, ty); ctx.lineTo(tx1 + 14, ty); ctx.stroke();
        K.t(ctx, "⚡ 전원", cx - 10, ty - 66, { s: 12, w: "900", a: "center", c: "#c2410c" });
        for (i = 0; i < 9; i++) ball(ctx, tx0 + 26 + i * (tx1 - tx0 - 52) / 8, ty + Math.sin(i * 1.7 + rxT / 600) * 10, 5, NC === "#e9e6ff" ? "#bac8ff" : NC);
      }
      pill(ctx, fam === "g1" ? "물에 넣으면" : (fam === "g17" ? (e.p === 4 ? "액체 · 증기" : "기체의 색") : "전기를 걸면 빛만 낸다"), cx - 10, base + 22, { s: 12, a: "center", c: KS.mute });
    }

    function draw(quiet) {
      paper(ctx, 900, 372);
      var F = FAM[fam], e = cur(), R = react();
      K.bigText(ctx, F.name + " — " + e.p + "주기 " + e.k, 18, 36, 21, "#ffffff");

      /* 입체 원자 모형(받침대 위): 기울어진 궤도, 앞쪽 전자는 핵 앞에 */
      var cx = 140, cy = 168, i, j, TL = .4, OR = 62 + 13 * e.sh.length;
      function shR(q) { return Math.max(32, OR * (q + 1) / e.sh.length); }
      floorShadow(ctx, cx, 302, 96, 12, .26);
      slab(ctx, cx - 44, 290, 76, 10, 14, "#f4f6fa", "#cfd6e1", "#a6b0c0");
      ctx.fillStyle = "#c3cad5"; ctx.beginPath(); ctx.moveTo(cx - 6, 290); ctx.lineTo(cx - 3, cy); ctx.lineTo(cx + 3, cy); ctx.lineTo(cx + 6, 290); ctx.closePath(); ctx.fill();
      var hal = ctx.createRadialGradient(cx, cy, 0, cx, cy, 116);
      hal.addColorStop(0, rgba(F.col, .18)); hal.addColorStop(1, rgba(F.col, 0));
      ctx.fillStyle = hal; ctx.beginPath(); ctx.arc(cx, cy, 116, 0, Math.PI * 2); ctx.fill();
      var elc = [];
      for (i = 0; i < e.sh.length; i++) {
        var r = shR(i), cnt = Math.min(e.sh[i], 12), last = (i === e.sh.length - 1);
        ctx.strokeStyle = last ? rgba(F.col, .55) : "rgba(40,60,110,.28)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(cx, cy, r, r * TL, 0, Math.PI, Math.PI * 2); ctx.stroke();
        for (j = 0; j < cnt; j++) { var a = j * 2 * Math.PI / cnt + i * .5 + .3; elc.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * TL, f: Math.sin(a) >= 0, last: last }); }
      }
      function eDot(q) { if (q.last) dot(ctx, q.x, q.y, 5.4, F.col, 3); else dot(ctx, q.x, q.y, 3.2, "#748ffc", 2.4); }
      elc.filter(function (q) { return !q.f; }).forEach(eDot);
      ball(ctx, cx, cy, 20, "--violet");
      text(ctx, e.s, cx, cy + 5, { s: 14, w: "900", a: "center", c: "#ffffff" });
      for (i = 0; i < e.sh.length; i++) {
        var r2 = shR(i), l2 = (i === e.sh.length - 1);
        ctx.strokeStyle = l2 ? rgba(F.col, .75) : "rgba(40,60,110,.36)"; ctx.lineWidth = l2 ? 2 : 1.4;
        ctx.beginPath(); ctx.ellipse(cx, cy, r2, r2 * TL, 0, 0, Math.PI); ctx.stroke();
      }
      elc.filter(function (q) { return q.f; }).forEach(eDot);
      if (e.sh.some(function (q) { return q > 12; })) text(ctx, "(18개 껍질은 12개만 그림)", cx, 232, { s: 11, a: "center", c: v("--mist") });
      pill(ctx, "원자가 전자 " + F.val + "개" + (F.val === 0 ? " (꽉 참)" : ""), cx, 326, { s: 13, a: "center", c: v(F.col) });
      vignette(400, 290, R);

      /* 오른쪽 흰 판정 카드 */
      var cx0 = 600, cw0 = 286, bx0 = cx0 + 18, R0 = cx0 + cw0 - 18;
      K.card(ctx, cx0, 12, cw0, 318, "만들어지는 이온");
      K.t(ctx, F.ion === "없음" ? "이온이 되지 않는다" : e.s + (F.ion === "+1" ? "⁺" : "⁻"), bx0, 68, { s: F.ion === "없음" ? 20 : 28, w: "900", c: v(F.col) });
      K.t(ctx, F.act, bx0, 90, { s: 12, w: "800", c: LT.mute });
      K.row(ctx, fam === "g1" ? "이온화 에너지" : (fam === "g17" ? "전기음성도" : "바깥 껍질"), fam === "g1" ? e.n + " kJ/mol" : (fam === "g17" ? e.n.toFixed(2) : "이미 8개"), bx0, R0, 114);
      K.row(ctx, "반응성 (0~100 상대 눈금)", String(R), bx0, R0, 140, v(F.col));
      meter(ctx, bx0, 149, R0 - bx0, 14, R / 100, F.col);
      K.t(ctx, "같은 세로줄 안에서의 자리", bx0, 190, { s: 12, w: "800", c: LT.mute });
      for (i = 0; i < F.list.length; i++) {
        var q = F.list[i], on = q.p === per, yy = 198 + i * 27;
        var rv = fam === "g1" ? Math.round((560 - q.n) / 1.6) : (fam === "g17" ? Math.round((q.n - 2.4) / 1.6 * 100) : 0);
        K.t(ctx, q.p + "주기 " + q.k, bx0, yy + 13, { s: 12, w: on ? "900" : "700", c: on ? v(F.col) : LT.mute });
        meter(ctx, bx0 + 96, yy + 3, R0 - bx0 - 126, 12, rv / 100, on ? F.col : "#adb5bd");
        K.t(ctx, String(rv), R0, yy + 13, { s: 12, w: "900", a: "right", c: on ? v(F.col) : LT.mute });
      }
      mark(ctx, got.a, "1족 1위", bx0 - 8, 292, { s: 11.5 });
      mark(ctx, got.b, "17족 1위", bx0 + 96, 292, { s: 11.5 });
      mark(ctx, got.c, "이온이 안 되는 줄", bx0 - 8, 316, { s: 11.5 });
      K.t(ctx, "세로줄이 같으면 원자가 전자 수가 같다", 886, 360, { s: 11.5, a: "right", c: LT.mute });
      text(ctx, e.w.replace(/<[^>]+>/g, ""), 18, 360, { s: 12, c: LT.mute });
      if (quiet === true) return;
      $("a-rx-info").innerHTML = "<b>" + e.k + " (" + e.s + ")</b> — " + e.w + "<br>" +
        (fam === "g1" ? "1족은 아래로 갈수록 원자 반지름이 커져 바깥 전자를 느슨하게 붙잡습니다. 그래서 이온화 에너지가 <b>작아지고</b> 반응은 <b>격렬해집니다</b>."
        : fam === "g17" ? "17족은 위로 갈수록 원자 반지름이 작아 전자를 세게 끌어당깁니다. 그래서 <b>플루오린이 가장 반응성이 큽니다</b>. 1족과 <b>반대 방향</b>이라는 점에 주의하세요."
        : "18족은 바깥 껍질이 이미 8개(헬륨은 2개)로 꽉 차 있어 결합에 쓰는 전자가 없으므로 <b>원자가 전자를 0개</b>로 봅니다. 더 얻거나 잃을 까닭이 없습니다. 다른 원소가 <b>8개를 채우려고</b> 결합하는 것이라면, 이 줄은 이미 목적지에 있는 셈입니다.");
    }
    function check() {
      var ch = false;
      if (fam === "g1" && per === 4 && !got.a) { got.a = true; ch = true; }
      if (fam === "g17" && per === 2 && !got.b) { got.b = true; ch = true; }
      if (fam === "g18" && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("pRx", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-4a");
      if (got.b) done("m1-4b");
      if (got.c) done("m1-4c");
      if (qOK) done("m1-4d");
      if (got.a && got.b && got.c && qOK) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>같은 세로줄은 원자가 전자 수가 같아 <b>같은 방식으로 반응</b>했습니다. 1족은 아래로 갈수록, 17족은 위로 갈수록 반응성이 커졌고, 18족은 아예 반응하지 않았습니다.");
        ep.clear(3);
      }
    }
    cv._redraw = draw;
    playBtn("a-rx-play", "⏸ 실험 장면 멈추기", "▶ 실험 장면 움직이기", function () { return rxPlay; }, function (q) { rxPlay = q; });
    K.animate(cv, function (dt) { if (rxPlay) { rxT += dt; draw(true); } });
    onSeg("a-fam", function (b) { fam = b.getAttribute("data-f"); draw(); check(); });
    $("a-per").addEventListener("input", function (e) { per = +e.target.value; $("a-per-val").textContent = per + "주기"; draw(); check(); });
    window.sthPick({
      mount: "s1-q",
      q: "원소의 성질이 주기적으로 되풀이되는 가장 근본적인 까닭은?",
      options: [
        "원자량이 일정하게 늘어나기 때문",
        "원자 번호가 커지면서 <b>원자가 전자 수</b>가 1 → 7로 늘고 18족(0)을 지나 다시 1부터 되풀이되기 때문",
        "원자 반지름이 계속 커지기 때문",
        "모든 원소가 같은 개수의 전자 껍질을 가지기 때문"
      ],
      answer: 1,
      why: [
        "원자량은 계속 늘기만 할 뿐 되풀이되지 않습니다. 멘델레예프도 원자량으로 줄을 세웠지만, 되풀이를 만든 것은 다른 것이었습니다.",
        "화학적 성질을 정하는 것은 가장 바깥 껍질의 전자입니다. 껍질이 8개로 차면 다음 껍질이 1개부터 다시 시작하므로, 성질도 함께 되풀이됩니다.",
        "원자 반지름은 새 주기가 시작될 때마다 <b>확 커졌다가 다시 줄어드는</b> 톱니 모양이었습니다. 계속 커지지 않습니다.",
        "껍질 수는 주기마다 하나씩 늘어납니다. 1주기는 1개, 4주기는 4개입니다."
      ],
      onDone: function () { qOK = true; window.sthState("pRxQ", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 */
  function finish() { window.sthState("r1", "해결 · 원자가 전자 수가 되풀이되어 성질도 되풀이된다 — 빈칸의 저마늄까지 맞혔다"); }
  function showEnd(i) {
    if (i !== 4) return;
    var p = window.sthState("period1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 정확했습니다. 이제 그 ‘되풀이’의 정체가 <b>원자가 전자 수</b>라는 것까지 말할 수 있게 되었습니다."
        : "정답은 ㉡ 입니다. 원자가 전자 수가 1부터 7까지 늘고 18족(0)을 지나 다시 1로 돌아오기 때문에 성질도 되풀이되고, 그래서 빈칸도 이웃으로 <b>계산</b>할 수 있었습니다.");
    ep.clear(4);
  }
  ep.onShow(showEnd);
  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅱ-2] 이야기 ① 빈칸이 있는 표",
    items: [
      { id: "w1", label: "주기성이 나타나는 까닭", hint: "같은 족 원소들이 비슷하게 행동하는 이유를 전자 배치로 설명하세요." },
      { id: "wA", label: "멘델레예프가 빈칸을 채운 방법", hint: "‘성질이 규칙적으로 변하므로 …’로 시작해, 에카규소의 원자량과 밀도를 어떻게 구했는지 이웃 원소의 이름을 넣어 쓰세요." }
    ]
  });
  if (ep.at() === 4) showEnd(4);
})();

/* =========================================================================
   이야기 ② 녹이면 통한다
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "bond1", title: "조사관의 첫 추리",
    question: "소금(염화 나트륨) 덩어리는 전기가 통하지 않습니다. 그런데 <b>녹여서 액체로 만들면</b> 전기가 통합니다. 왜 그럴까요?",
    options: [
      "㉠ 녹으면 금속으로 바뀌기 때문",
      "㉡ 제자리에 묶여 있던 이온이 풀려나 움직일 수 있게 되기 때문",
      "㉢ 열이 원자에서 전자를 떼어 내기 때문",
      "㉣ 액체는 원래 모두 전기가 통하기 때문"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ------------------------------------------------ 장면 2 — 전자 조립대 */
  (function () {
    var cv = $("b-make"), ctx = window.setupCanvas(cv);
    var pair = "nacl", n = 0, mkT = 0;
    var got = window.sthState("bMake") || { nacl: false, mgo: false, h2o: false, ch4: false };
    var H2 = { s: "H", k: "수소", v: 1, t: 2 };
    var MAT = {
      nacl: { kind: "ion", need: 1, nm: "염화 나트륨 NaCl", A: { s: "Na", k: "나트륨", v: 1 }, B: { s: "Cl", k: "염소", v: 7 },
              w: "금속인 나트륨이 전자 1개를 <b>내주고</b>, 비금속인 염소가 그것을 <b>받습니다</b>. Na⁺와 Cl⁻가 서로 끌어당겨 결정을 이룹니다." },
      mgo:  { kind: "ion", need: 2, nm: "산화 마그네슘 MgO", A: { s: "Mg", k: "마그네슘", v: 2 }, B: { s: "O", k: "산소", v: 6 },
              w: "마그네슘은 전자 <b>2개</b>를 내주고 산소는 2개를 받습니다. 전하가 ±2로 커서 끌어당기는 힘이 훨씬 세고, 그래서 녹는점이 2,852 ℃나 됩니다." },
      h2o:  { kind: "cov", need: 2, nm: "물 H₂O", C: { s: "O", k: "산소", v: 6, t: 8 }, O: [H2, H2],
              w: "산소가 수소 두 개와 전자쌍을 <b>하나씩 나누어</b> 씁니다. 산소는 8개, 수소는 2개를 채웁니다." },
      ch4:  { kind: "cov", need: 4, nm: "메테인 CH₄", C: { s: "C", k: "탄소", v: 4, t: 8 }, O: [H2, H2, H2, H2],
              w: "탄소는 원자가 전자가 4개라 <b>네 방향</b>으로 결합을 만듭니다. 탄소 화합물이 그토록 다양한 까닭입니다." },
      o2:   { kind: "cov", need: 2, nm: "산소 O₂", C: { s: "O", k: "산소", v: 6, t: 8 }, O: [{ s: "O", k: "산소", v: 6, t: 8 }],
              w: "산소 원자 둘이 전자쌍을 <b>두 쌍</b> 나눠 씁니다(이중 결합). 우리가 숨 쉬는 산소는 이렇게 만들어진 분자입니다." }
    };
    function perOut(M) { return M.need / M.O.length; }
    function assign(M, i) { return clamp(n - i * perOut(M), 0, perOut(M)); }

    /* 입체 원자: 공 + 기울어진 바깥 껍질 고리(뒤쪽 전자는 공 뒤, 앞쪽 전자는 공 앞) */
    function atom(x, y, r, sym, cnt, col, lab) {
      floorShadow(ctx, x, BENCH + 6, r * 1.15, r * .18, .24);
      var hg = ctx.createRadialGradient(x, y, r * .6, x, y, r + 30);
      hg.addColorStop(0, rgba(col, .22)); hg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r + 30, 0, Math.PI * 2); ctx.fill();
      var i, rr = r + 16, ry = rr * .42, tl = -.18, es = [];
      for (i = 0; i < cnt; i++) { var a = i * 2 * Math.PI / Math.max(cnt, 1) + .5; es.push({ a: a, f: Math.sin(a) >= 0 }); }
      function ring(a0, a1) { ctx.strokeStyle = "rgba(200,140,0,.55)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x, y, rr, ry, tl, a0, a1); ctx.stroke(); }
      function ePt(q) { var px = Math.cos(q.a) * rr, py = Math.sin(q.a) * ry; dot(ctx, x + px * Math.cos(tl) - py * Math.sin(tl), y + px * Math.sin(tl) + py * Math.cos(tl), q.f ? 5 : 4, "#fab005", 3); }
      ring(Math.PI, Math.PI * 2); es.filter(function (q) { return !q.f; }).forEach(ePt);
      ball(ctx, x, y, r, col);
      text(ctx, sym, x + r * .08, y + 6 + r * .1, { s: r > 40 ? 22 : 15, w: "900", a: "center", c: "#ffffff" });
      ring(0, Math.PI); es.filter(function (q) { return q.f; }).forEach(ePt);
      if (lab) pill(ctx, lab, x, y + r + 30, { s: 12, a: "center", c: KS.ink });
    }
    var BENCH = 318;
    /* 완성되면 생기는 물질의 미니어처(카드 안): 이온 결정 또는 공-막대 분자 */
    function product(M, x, y, ok) {
      if (!ok) {
        ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(90,110,150,.45)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x - 112, y - 46, 224, 92, 12); ctx.stroke(); ctx.restore();
        K.t(ctx, "완성하면 여기에", x, y - 4, { s: 12, w: "800", a: "center", c: LT.mute });
        K.t(ctx, "만들어진 물질이 나타납니다", x, y + 14, { s: 12, w: "800", a: "center", c: LT.mute });
        return;
      }
      floorShadow(ctx, x, y + 42, 80, 9, .22);
      if (M.kind === "ion") {
        var a = M.A.s === "Mg" ? "#ff8787" : "#ff922b", b = M.B.s === "O" ? "#ff6b6b" : "#20c997", s = 17, list = [];
        for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) for (var k = 0; k < 3; k++) list.push([i, j, k]);
        list.sort(function (p, q) { return (p[0] + p[1] - p[2] * 2) - (q[0] + q[1] - q[2] * 2); });
        list.forEach(function (p) {
          var px = x + (p[0] - p[1]) * s * .86, py = y + 6 + (p[0] + p[1]) * s * .5 - p[2] * s - 10, big = (p[0] + p[1] + p[2]) % 2;
          ball(ctx, px, py, big ? 8.5 : 6.5, big ? (M.B.s === "O" ? "#e64980" : "#12b886") : (M.A.s === "Mg" ? "#adb5bd" : "#845ef7"));
        });
        K.t(ctx, M.A.s + "⁺ · " + M.B.s + "⁻ 가 번갈아 쌓인 결정", x, y + 60, { s: 12, w: "800", a: "center", c: LT.ink });
      } else {
        var C0 = M.C, n0 = M.O.length, pos = n0 === 1 ? [[34, 0]] : (n0 === 2 ? [[-30, 18], [30, 18]] : [[0, -34], [-32, 10], [32, 10], [8, 30]]);
        pos.forEach(function (p) { ctx.strokeStyle = "#868e96"; ctx.lineWidth = n0 === 1 ? 7 : 4; ctx.beginPath(); ctx.moveTo(x - (n0 === 1 ? 17 : 0), y); ctx.lineTo(x + p[0] - (n0 === 1 ? 17 : 0), y + p[1]); ctx.stroke(); });
        ball(ctx, x - (n0 === 1 ? 17 : 0), y, 15, C0.s === "C" ? "#495057" : "#e03131");
        pos.forEach(function (p) { var o = M.O[0].s; ball(ctx, x + p[0] - (n0 === 1 ? 17 : 0), y + p[1], o === "H" ? 9 : 15, o === "H" ? "#f1f3f5" : "#e03131"); });
        K.t(ctx, "전자쌍을 같이 쓰는 분자", x, y + 60, { s: 12, w: "800", a: "center", c: LT.ink });
      }
    }

    function draw(quiet) {
      paper(ctx, 900, 372);
      var M = MAT[pair], stable = false, i, bad = false, msg = "";
      K.bigText(ctx, M.nm + " 만들기", 18, 36, 21, "#ffffff");
      pill(ctx, "빛나는 노란 점 = 가장 바깥 껍질의 전자", 18, 62, { s: 12, c: KS.mute });
      /* 조립대(흰 작업대) */
      floorShadow(ctx, 300, BENCH + 30, 280, 18, .2);
      slab(ctx, 30, BENCH, 520, 14, 30, "#f6f8fb", "#d4dae4", "#aab4c4");
      var rowsA = [];
      if (M.kind === "ion") {
        bad = n > M.A.v;
        var av = Math.max(M.A.v - n, 0), bv = M.B.v + Math.min(n, M.A.v);
        atom(150, 196, 60, M.A.s, av, "--coral", M.A.k + " · 바깥 전자 " + av + "개");
        atom(450, 196, 60, M.B.s, bv, "--teal", M.B.k + " · 바깥 전자 " + bv + "개");
        if (n > 0 && !bad) {
          for (i = 0; i < n; i++) {
            var ay = 182 + i * 26 - (n - 1) * 13, ph = REDUCE ? .5 : ((mkT / 1400 + i * .3) % 1);
            K.arrow(ctx, { x: 236, y: ay }, { x: 366, y: ay }, rgba("--amber", .8), 2.6, 12);
            dot(ctx, 242 + ph * 118, ay, 4.4, "#fab005", 3);
          }
          pill(ctx, "전자 " + n + "개 이동", 300, 150 - (n - 1) * 13, { s: 12.5, a: "center", c: v("--amber-700") });
        }
        stable = (av === 0 && bv === 8 && !bad);
        if (stable) {
          var chg = n === 1 ? "" : sup(n);
          pill(ctx, M.A.s + chg + "⁺", 150, 112, { s: 18, a: "center", c: v("--coral-700") });
          pill(ctx, M.B.s + chg + "⁻", 450, 112, { s: 18, a: "center", c: v("--teal-700") });
          ctx.save(); ctx.strokeStyle = v("--green"); ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
          ctx.lineDashOffset = -(mkT / 40); ctx.beginPath(); ctx.moveTo(236, 238); ctx.lineTo(366, 238); ctx.stroke(); ctx.restore();
          pill(ctx, "＋ 와 － 가 끌어당긴다", 300, 258, { s: 12.5, a: "center", c: v("--green-700") });
        }
        rowsA = [[M.A.k + " 바깥 전자", av + "개", av === 0 ? LT.green : LT.ink], [M.B.k + " 바깥 전자", bv + "개", bv === 8 ? LT.green : LT.ink], ["옮긴 전자", n + "개", LT.orange]];
        msg = bad ? "❌ " + M.A.k + "에는 내줄 전자가 " + M.A.v + "개뿐" : (stable ? "✅ 이온 결합 — 둘 다 안정" : "아직 8개(또는 0개)가 안 됨");
      } else {
        var C = M.C, cnt = M.O.length, ok = true;
        var cc = C.v + Math.min(n, M.need);
        var pos = [];
        var ccx = cnt === 1 ? 190 : 300, ccy = cnt === 2 ? 226 : 186;
        if (cnt === 1) pos = [[420, 186]];
        else if (cnt === 2) pos = [[148, 118], [452, 118]];
        else pos = [[300, 80], [300, 290], [120, 186], [480, 186]];
        for (i = 0; i < cnt; i++) {
          var a2 = assign(M, i), ov = M.O[i].v + a2;
          if (ov !== M.O[i].t) ok = false;
          ctx.save();
          if (a2 > 0) { ctx.shadowColor = v("--brand"); ctx.shadowBlur = 12; }
          ctx.strokeStyle = a2 > 0 ? v("--brand") : "rgba(40,60,110,.3)"; ctx.lineWidth = a2 > 1 ? 8 : (a2 > 0 ? 5 : 1.5);
          ctx.setLineDash(a2 > 0 ? [] : [5, 4]);
          ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(pos[i][0], pos[i][1]); ctx.stroke(); ctx.restore();
        }
        var lab4 = cnt === 4;
        for (i = 0; i < cnt; i++) {
          var a3 = assign(M, i), ov3 = M.O[i].v + a3, isH = M.O[i].s === "H";
          atom(pos[i][0], pos[i][1], isH ? (lab4 ? 24 : 28) : 50, M.O[i].s, ov3, isH ? "--amber" : "--teal",
            lab4 && i < 2 ? null : M.O[i].s + " · " + ov3 + "개" + (ov3 === M.O[i].t ? " ✅" : ""));
        }
        atom(ccx, ccy, 52, C.s, cc, "--violet", lab4 ? null : C.k + " · " + cc + "개" + (cc === C.t ? " ✅" : ""));
        stable = ok && cc === C.t && n === M.need;
        var hOk = M.O.filter(function (o, q) { return o.v + assign(M, q) === o.t; }).length;
        rowsA = [[C.k + " 바깥 전자", cc + "개", cc === C.t ? LT.green : LT.ink], ["다 채운 " + (M.O[0].s === "H" ? "수소" : "산소"), hOk + " / " + cnt, hOk === cnt ? LT.green : LT.ink], ["나눠 쓰는 전자쌍", n + "쌍", LT.blue]];
        msg = stable ? "✅ 공유 결합 — 모두 채움" : "아직 못 채운 원자가 있음";
        if (lab4) pill(ctx, "굵은 선 하나 = 전자쌍 하나", 560, 300, { s: 12, a: "right", c: KS.mute });
      }

      /* 오른쪽 흰 판정 카드 */
      var cx0 = 596, cw0 = 290, bx0 = cx0 + 18, R0 = cx0 + cw0 - 18;
      K.card(ctx, cx0, 12, cw0, 348, "판정 · 지금 만드는 물질");
      K.t(ctx, M.nm, bx0, 64, { s: 19, w: "900", c: M.kind === "ion" ? "#e8590c" : "#1c7ed6" });
      rowsA.forEach(function (rw, q) { K.row(ctx, rw[0], rw[1], bx0, R0, 94 + q * 22, rw[2]); });
      K.tip(ctx, msg, bx0, 150, R0 - bx0, bad ? false : (stable ? true : null));
      product(M, (bx0 + R0) / 2, 236, stable);
      mark(ctx, got.nacl, "염화 나트륨", bx0 - 8, 316, { s: 11.5 });
      mark(ctx, got.mgo, "산화 마그네슘", bx0 + 100, 316, { s: 11.5 });
      mark(ctx, got.h2o, "물", bx0 - 8, 340, { s: 11.5 });
      mark(ctx, got.ch4, "메테인", bx0 + 50, 340, { s: 11.5 });
      text(ctx, M.kind === "ion" ? "금속 + 비금속 → 전자를 주고받는다" : "비금속 + 비금속 → 전자를 같이 쓴다", 18, 362, { s: 12, w: "800", c: LT.mute });

      if (quiet === true) return stable;
      $("b-make-info").innerHTML = "<b>" + M.nm + "</b> — " + M.w + "<br>" +
        (stable ? "✅ <b>완성</b>. " + (M.kind === "ion" ? "전자를 <b>주고받아</b> 이온이 되었습니다. 금속 원소와 비금속 원소가 만나면 이렇게 <b>이온 결합</b>을 합니다."
                                     : "전자를 <b>같이 써서</b> 분자가 되었습니다. 비금속 원소끼리 만나면 이렇게 <b>공유 결합</b>을 합니다.")
                : "슬라이더로 " + (M.kind === "ion" ? "옮길 전자 수" : "나눠 쓸 전자쌍 수") + "를 바꿔, 모든 원자의 바깥 전자가 <b>8개</b>(수소는 2개)가 되게 하세요.");
      return stable;
    }
    function check() {
      var st = draw();
      if (st && !got[pair] && pair !== "o2") { got[pair] = true; window.sthState("bMake", got); mission(); draw(); }
    }
    function mission() {
      if (got.nacl) done("m2-2a");
      if (got.mgo) done("m2-2b");
      if (got.h2o) done("m2-2c");
      if (got.ch4) done("m2-2d");
      if (got.nacl && got.mgo && got.h2o && got.ch4) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>안정해지는 방법은 둘뿐이었습니다. <b>주고받기(이온 결합)</b>와 <b>같이 쓰기(공유 결합)</b>. 어느 쪽을 택하는지는 만나는 원자가 금속인지 비금속인지가 정합니다.");
        ep.clear(1);
      }
    }
    function label() {
      var M = MAT[pair];
      $("b-n-label").textContent = M.kind === "ion" ? "옮길 전자 수" : "나눠 쓸 전자쌍 수";
      $("b-n-val").textContent = n + (M.kind === "ion" ? "개" : "쌍");
    }
    cv._redraw = draw;
    /* 전자가 옮겨 가는 모습을 바꾼 뒤 잠깐(약 4초) 보여 준다 */
    K.animate(cv, function (dt) { if (!REDUCE && mkT < 4200 && MAT[pair].kind === "ion" && n > 0) { mkT += dt; draw(true); } });
    onSeg("b-pair", function (b) { pair = b.getAttribute("data-p"); mkT = 0; label(); check(); });
    $("b-n").addEventListener("input", function (e) { n = +e.target.value; mkT = 0; label(); check(); });
    label(); draw(); mission();
  })();

  /* ------------------------------------------------ 장면 3 — 성질 시험대 */
  (function () {
    var cv = $("b-prop"), ctx = window.setupCanvas(cv);
    var sub = "nacl", wet = false, T = 20, pT = 0, pPlay = !REDUCE;
    var got = window.sthState("bProp") || { a: false, b: false, c: false, d: false };
    var SUB = {
      nacl:  { k: "염화 나트륨", f: "NaCl", bond: "이온 결합", mp: 802, bp: 1413, dis: true, disCond: true, col: "--coral" },
      sugar: { k: "설탕", f: "C₁₂H₂₂O₁₁", bond: "공유 결합 (분자)", mp: 186, bp: 9999, dis: true, disCond: false, col: "--amber" },
      cu:    { k: "구리", f: "Cu", bond: "금속 결합", mp: 1085, bp: 2562, dis: false, disCond: false, col: "--teal" },
      h2o:   { k: "물", f: "H₂O", bond: "공유 결합 (분자)", mp: 0, bp: 100, dis: false, disCond: false, col: "--brand" }
    };
    function phase(S) { return T < S.mp ? "고체" : (T < S.bp ? "액체" : "기체"); }
    function mode() {
      if (!wet) return "dry";
      if (T >= 100) return "dry";
      if (T < 0) return "ice";
      return "aq";
    }
    function conduct() {
      var S = SUB[sub], md = mode();
      if (sub === "cu") return true;
      if (md === "aq") return S.dis ? S.disCond : false;
      if (md === "ice") return false;
      return sub === "nacl" ? phase(S) !== "고체" : false;
    }
    function why() {
      var S = SUB[sub], md = mode(), c = conduct();
      if (sub === "cu") return "구리는 <b>자유 전자</b>가 금속 전체를 돌아다닙니다. 그래서 고체든 액체든, 물에 담가도 늘 전기가 통합니다. 녹여도 통한다는 점이 이온 물질과 다릅니다.";
      if (md === "ice") return "물이 얼어붙어 이온이 움직일 수 없습니다. <b>얼음은 전기가 통하지 않습니다.</b>";
      if (md === "aq") return sub === "nacl" ? "물에 녹으면 Na⁺와 Cl⁻가 <b>따로 떨어져 물 속을 돌아다닙니다</b>. 움직이는 전하가 생겼으므로 전기가 통합니다."
        : (sub === "sugar" ? "설탕은 물에 잘 녹지만, 녹아도 <b>분자 그대로</b> 떠다닐 뿐 이온이 되지 않습니다. 움직이는 전하가 없어 전기가 통하지 않습니다."
        : "순수한 물에는 움직일 수 있는 이온이 거의 없어 전기가 <b>거의</b> 통하지 않습니다. 수돗물이 통하는 것은 녹아 있는 이온 때문입니다.");
      if (sub === "nacl") return phase(S) === "고체"
        ? "고체 소금에서는 Na⁺와 Cl⁻가 <b>제자리에 꽉 묶여</b> 있습니다. 전하가 있어도 움직이지 못하므로 전기가 통하지 않습니다."
        : "802 ℃를 넘겨 녹이자 이온들이 <b>풀려나 움직입니다</b>. 1807년 데이비가 본 것이 바로 이 장면입니다.";
      if (sub === "sugar") return phase(S) === "고체"
        ? "설탕 결정은 <b>분자</b>가 쌓여 있는 것입니다. 전하를 띤 알갱이가 아예 없습니다."
        : "녹여서 액체로 만들어도 <b>분자가 움직일 뿐</b> 전하는 없습니다. 그래서 전기가 통하지 않습니다. (실제 설탕은 녹으면서 서서히 분해됩니다.)";
      return "순수한 물은 대부분 중성 분자라 전기가 거의 통하지 않습니다.";
    }

    /* ── 잘라 보는 시험대: 위 0~440 은 아이소메트릭 유리 시험 칸(가열판·전극·입자 모형)과 회로, 아래는 읽음판 ── */
    var W = 900, H = 576, DH = 440;
    var I = K.iso({ ox: 330, oy: 206, s: 0.7, L: 360, D: 200 });
    var L = I.L, D = I.D, HC = 140, RODZ = 186;
    var NX = 7, NY = 4, NZ = 3;
    function hashf(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; x = x - Math.floor(x); x = Math.sin(x * 91.17 + n * 0.731) * 24634.6345; return x - Math.floor(x); }
    function heaterCol(T0) {
      if (T0 < 0) return "#9fc8e6";
      var f = clamp(T0 / 1200, 0, 1);
      return "rgb(" + Math.round(70 + 185 * f) + "," + Math.round(74 + 40 * f * (1 - f) * 2) + "," + Math.round(84 - 50 * f) + ")";
    }
    function fillOf(S, md, ph) {
      if (md === "aq") return { c: "rgba(70,150,230,.34)", z: 112, n: "물" };
      if (md === "ice") return { c: "rgba(205,236,255,.58)", z: 112, n: "얼음" };
      if (ph === "기체") return null;
      if (ph === "액체") {
        if (sub === "nacl") return { c: "rgba(255,150,70,.30)", z: 104 };
        if (sub === "cu") return { c: "rgba(255,140,70,.34)", z: 104 };
        if (sub === "sugar") return { c: "rgba(190,120,50,.38)", z: 104 };
        return { c: "rgba(70,150,230,.34)", z: 104 };
      }
      if (sub === "h2o") return { c: "rgba(205,236,255,.50)", z: 104 };
      return { c: "rgba(255,255,255,.12)", z: 104 };
    }
    function headline(S, md, ph, c) {
      var gone = wet && T >= 100;
      if (md === "ice") return ["얼음 속에 갇혔다", "물이 얼어 " + (sub === "nacl" ? "이온도" : "입자도") + " 멈췄다"];
      if (md === "aq") {
        if (sub === "nacl") return ["소금물에 불이 켜졌다", "물속을 돌아다니는 Na⁺와 Cl⁻"];
        if (sub === "sugar") return ["설탕물은 캄캄하다", "녹아도 분자는 분자 그대로"];
        if (sub === "cu") return ["구리는 물속에서도 켜진다", "자유 전자가 금속 안을 돈다"];
        return ["순수한 물은 거의 안 통한다", "움직일 이온이 거의 없다"];
      }
      if (sub === "cu") return ["구리는 늘 불이 켜진다", (ph === "액체" ? "녹아도 " : "") + "자유 전자가 금속 전체를 돈다"];
      if (sub === "nacl") {
        if (ph === "고체") return [gone ? "물이 날아가고 소금만 남았다" : "전하는 있는데 불이 꺼졌다", "Na⁺와 Cl⁻가 제자리에서 떨기만 한다"];
        return ["녹은 소금에 불이 켜졌다", "풀려난 이온이 전하를 나른다"];
      }
      if (sub === "sugar") {
        if (ph === "고체") return [gone ? "물이 날아가고 설탕만 남았다" : "설탕 결정 — 분자가 쌓였다", "전하를 띤 알갱이가 없다"];
        return ["녹여도 불이 꺼져 있다", "움직이는 것은 중성 분자뿐"];
      }
      if (ph === "고체") return ["얼음 — 거의 통하지 않는다", "중성인 물 분자가 얼어붙었다"];
      if (ph === "기체") return ["수증기로 흩어졌다", "중성 분자가 날아다닌다"];
      return ["순수한 물은 거의 안 통한다", "대부분 중성인 물 분자"];
    }
    /* 입자 목록: 질서 있는 격자(고체·얼음) 또는 흩어진 무리(액체·수용액·기체) */
    function particles(S, md, ph, t) {
      var out = [], i, j, k, n = 0;
      var ordered = ((ph === "고체" && md !== "aq") || md === "ice");
      var gas = (ph === "기체" && md !== "aq");
      var zTop = gas ? HC - 14 : 96;
      var keep = 1;
      if (md === "aq") keep = (sub === "nacl" || sub === "sugar") ? .42 : (sub === "cu" ? 1 : .3);
      if (gas) keep = .28;
      var amp = ordered ? 1.2 + T / 900 : (gas ? 24 : 12);
      for (i = 0; i < NX; i++) for (j = 0; j < NY; j++) for (k = 0; k < NZ; k++) {
        n++;
        if (hashf(n * 3.1) > keep) continue;
        var bx0 = 32 + i * (L - 64) / (NX - 1), by0 = 28 + j * (D - 56) / (NY - 1), bz0 = 18 + k * 34;
        var x, y, z;
        if (ordered) {
          x = bx0 + Math.sin(t * 9 + n * 1.7) * amp; y = by0 + Math.cos(t * 8 + n * 2.3) * amp; z = bz0 + Math.sin(t * 7 + n) * amp;
        } else {
          x = 24 + hashf(n * 17 + 3) * (L - 48) + Math.sin(t * 1.1 + n * 1.7) * amp;
          y = 22 + hashf(n * 31 + 7) * (D - 44) + Math.cos(t * 0.9 + n * 2.3) * amp;
          z = 12 + hashf(n * 53 + 11) * (zTop - 12) + Math.sin(t * 1.3 + n * .7) * amp * .6;
          x = clamp(x, 16, L - 16); y = clamp(y, 16, D - 16); z = clamp(z, 10, zTop);
        }
        var kind = sub === "cu" ? "cu" : (sub === "nacl" ? (((i + j + k) % 2 === 0) ? "na" : "cl") : "mol");
        out.push({ x: x, y: y, z: z, kind: kind, front: ordered ? j === NY - 1 : true });
      }
      return out;
    }
    var signPts = [];
    function drawBall(p) {
      var q = I.P(p.x, p.y, p.z), r;
      if (p.kind === "na") { r = 6.5; ball(ctx, q.x, q.y, r, "#b07cf0"); }
      else if (p.kind === "cl") { r = 9; ball(ctx, q.x, q.y, r, "#3fcf8e"); }
      else if (p.kind === "cu") { r = 9; ball(ctx, q.x, q.y, r, "#d98b5a"); }
      else { r = 8.5; ball(ctx, q.x, q.y, r, sub === "sugar" ? "#e8a838" : "#5aa9ff"); }
      if (p.front) {
        var sg = p.kind === "na" ? "+" : (p.kind === "cl" ? "−" : (p.kind === "cu" ? "+" : ""));
        /* 부호는 앞쪽 공에만, 이미 그린 부호와 가까우면 생략(글자 겹침 방지) */
        if (sg) signPts.push([q.x, q.y, sg, p.kind === "na" ? 10 : 12]);
      }
    }
    function rod(x0) {
      var y0 = D / 2 - 6, y1 = D / 2 + 6;
      I.box(ctx, x0 - 6, y0, 8, x0 + 6, y1, RODZ, "#e6ebf2", "#8d97a8", "#5f6878");
    }
    function polyDots(pts, t, n) {
      var segs = [], tot = 0, i;
      for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
      for (var m = 0; m < n; m++) {
        var d = (((m / n) + t * .22) % 1) * tot;
        for (i = 0; i < segs.length; i++) {
          if (d <= segs[i]) { var f = d / segs[i]; dot(ctx, pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, 2.2, "#ffe9a8", 3); break; }
          d -= segs[i];
        }
      }
    }
    function wire(pts) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "#7a4a26"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
      ctx.strokeStyle = "#e0a070"; ctx.lineWidth = 1.6; ctx.stroke(); ctx.lineCap = "butt"; ctx.lineJoin = "miter";
    }

    function draw(quiet) {
      var S = SUB[sub], md = mode(), ph = phase(S), c = conduct(), t = pT / 1000, k;
      ctx.clearRect(0, 0, W, H);
      /* ── 위: 스튜디오 ── */
      var fl = I.P(L / 2 + 40, D / 2 + 60, -34);
      K.studio(ctx, 0, 0, W, DH, { x: fl.x, y: fl.y + 6, rx: 300, ry: 52 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      /* 가열판(냉각판) */
      var hc = heaterCol(T);
      I.box(ctx, -14, -14, -30, L + 14, D + 14, 0, hc, "#3a3f4a", "#2a2e37");
      if (T >= 300) {
        var hg = I.P(L / 2, D / 2, 0), hot = clamp((T - 300) / 900, 0, 1);
        K.glow(ctx, hg.x, hg.y, 40 + 60 * hot, "rgba(255,120,40," + (.18 + .3 * hot).toFixed(2) + ")", 3);
      }
      /* 유리 칸 뒷벽 */
      I.quad(ctx, I.P(0, 0, 0), I.P(L, 0, 0), I.P(L, 0, HC), I.P(0, 0, HC), "rgba(210,232,255,.22)", "rgba(255,255,255,.55)");
      I.quad(ctx, I.P(0, 0, 0), I.P(0, D, 0), I.P(0, D, HC), I.P(0, 0, HC), "rgba(210,232,255,.16)", "rgba(255,255,255,.55)");
      I.quad(ctx, I.P(0, 0, 0), I.P(L, 0, 0), I.P(L, D, 0), I.P(0, D, 0), "rgba(30,40,60,.35)");
      /* 시료가 차 있는 부분 */
      var F = fillOf(S, md, ph);
      if (F) I.box(ctx, 4, 4, 0, L - 4, D - 4, F.z, F.c, F.c, F.c);
      /* 입자와 전극을 먼 것부터 */
      signPts = [];
      var items = particles(S, md, ph, t), ex1 = 56, ex2 = L - 56;
      items.forEach(function (p) { p.key = p.x + p.y + p.z * .8; });
      items.push({ rod: ex1, key: ex1 + D / 2 + 50 }, { rod: ex2, key: ex2 + D / 2 + 50 });
      items.sort(function (a, b) { return a.key - b.key; });
      items.forEach(function (p) { if (p.rod) rod(p.rod); else drawBall(p); });
      var shown = [];
      for (k = signPts.length - 1; k >= 0; k--) {             /* 앞쪽 공부터, 가까운 부호는 생략 */
        var sp = signPts[k];
        if (shown.some(function (s0) { return Math.abs(s0[0] - sp[0]) < 14 && Math.abs(s0[1] - sp[1]) < 14; })) continue;
        shown.push(sp); text(ctx, sp[2], sp[0] + .5, sp[1] + 4, { s: sp[3], w: "900", a: "center", c: "#fff" });
      }
      if (sub === "cu") for (k = 0; k < 26; k++) {
        var u = (hashf(k * 5.3) + t * (.05 + hashf(k) * .06)) % 1;
        var e = I.P(20 + u * (L - 40), 20 + hashf(k * 7.7) * (D - 40), 12 + hashf(k * 3.3) * 84 + Math.sin(t * 2 + k) * 6);
        dot(ctx, e.x, e.y, 2.2, "#f59f00", 3);
      }
      /* 유리 앞벽 */
      I.quad(ctx, I.P(0, D, 0), I.P(L, D, 0), I.P(L, D, HC), I.P(0, D, HC), "rgba(220,240,255,.10)", "rgba(255,255,255,.75)");
      I.quad(ctx, I.P(L, 0, 0), I.P(L, D, 0), I.P(L, D, HC), I.P(L, 0, HC), "rgba(160,190,230,.12)", "rgba(255,255,255,.75)");
      if (F) { ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.2; var a1 = I.P(0, D, F.z), a2 = I.P(L, D, F.z), a3 = I.P(L, 0, F.z); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.lineTo(a3.x, a3.y); ctx.stroke(); }
      /* 회로: 전극 → 전구 → 전지 → 전극 */
      var t1 = I.P(ex1, D / 2, RODZ), t2 = I.P(ex2, D / 2, RODZ), BX = 790, BY = 140;
      var w1 = [[t1.x, t1.y], [t1.x, 100], [BX, 100], [BX, BY - 24]];
      var w2 = [[BX, BY + 26], [BX, 196], [t2.x, 196], [t2.x, t2.y]];
      wire(w1); wire(w2);
      /* 전지(가운데 끊고 극판) */
      var cx0 = 640;
      ctx.fillStyle = "#e4eaf1"; ctx.fillRect(cx0 - 10, 186, 20, 20);
      ctx.fillStyle = "#2b2f38"; ctx.fillRect(cx0 - 9, 180, 4, 32); ctx.fillRect(cx0 + 5, 187, 4, 18);
      if (c) { polyDots(w1, t, 9); polyDots(w2, t + 2.3, 9); }
      if (c) { var fk = REDUCE ? 1 : .92 + .08 * Math.sin(t * 13); K.glow(ctx, BX, BY, 26, "rgba(255,215,110," + (.85 * fk).toFixed(2) + ")", 3.4); }
      var bulb = ctx.createRadialGradient(BX - 8, BY - 10, 3, BX, BY, 28);
      bulb.addColorStop(0, c ? "#fffbe8" : "rgba(255,255,255,.7)"); bulb.addColorStop(.5, c ? "#ffd25a" : "rgba(190,205,230,.5)"); bulb.addColorStop(1, c ? "rgba(255,170,40,.8)" : "rgba(150,170,210,.35)");
      ctx.fillStyle = bulb; ctx.beginPath(); ctx.arc(BX, BY, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c ? "rgba(255,230,160,.95)" : "rgba(90,105,135,.7)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = c ? "#fff4c0" : "rgba(80,90,115,.8)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(BX - 10, BY + 8); ctx.lineTo(BX - 5, BY - 5); ctx.lineTo(BX, BY + 3); ctx.lineTo(BX + 5, BY - 5); ctx.lineTo(BX + 10, BY + 8); ctx.stroke();
      ctx.restore();
      /* 이름표 */
      var box = [0, W];
      pill(ctx, c ? "💡 켜짐" : "전구 꺼짐", BX + 34, BY + 5, { s: 12, c: c ? "#f59f00" : KS.mute, box: box });
      pill(ctx, "전지", cx0, 232, { s: 11, a: "center", c: KS.ink, box: box });
      I.label(ctx, ex2, D / 2, RODZ - 20, "전극", 46, -6, KS.ink, box);
      I.label(ctx, L, D * .78, -15, (T < 0 ? "냉각판 " : "가열판 ") + T + " ℃", 40, 26, T >= 300 ? "#ffb35c" : KS.ink, box);
      var lp = I.P(0, D, F ? F.z : 60);
      pill(ctx, (md === "aq" ? S.k + " 수용액" : S.k + " · " + (md === "ice" ? "얼어붙음" : ph)), lp.x - 12, lp.y - 4, { s: 12, a: "right", c: col(S.col), box: box });
      /* 범례 */
      var ly = 352;
      if (sub === "nacl") {
        ball(ctx, 32, ly, 6.5, "#b07cf0"); text(ctx, "Na⁺", 44, ly + 4, { s: 12, w: "800", c: "#33204f" });
        ball(ctx, 96, ly, 9, "#3fcf8e"); text(ctx, "Cl⁻", 110, ly + 4, { s: 12, w: "800", c: "#14402c" });
      } else if (sub === "cu") {
        ball(ctx, 32, ly, 9, "#d98b5a"); text(ctx, "구리 양이온", 46, ly + 4, { s: 12, w: "800", c: "#5a2e14" });
        K.glow(ctx, 140, ly, 2.4, "rgba(240,180,40,.95)", 3); text(ctx, "자유 전자", 150, ly + 4, { s: 12, w: "800", c: "#5a4210" });
      } else {
        ball(ctx, 32, ly, 8.5, sub === "sugar" ? "#e8a838" : "#5aa9ff"); text(ctx, (sub === "sugar" ? "설탕" : "물") + " 분자 (전하 없음)", 46, ly + 4, { s: 12, w: "800", c: "#24324a" });
      }
      text(ctx, "입자는 확대한 모형", 22, ly + 26, { s: 11, w: "700", c: "#5b6780" });
      K.warn(ctx, W - 14, 30, "⚠ 입자는 수억 배 확대, 개수는 줄인 모형", "right");
      var hl = headline(S, md, ph, c);
      K.bigText(ctx, hl[0], 22, 52, 28, c ? "#ffd35a" : "#ffffff");
      K.bigText(ctx, hl[1], 22, 86, 18, c ? "#ffffff" : "#bfe6ff");

      /* ── 아래: 읽음판 ── */
      var y0 = DH + 8;
      K.card(ctx, 0, y0, W, H - y0, null);
      pill(ctx, S.k + " (" + S.f + ") · " + S.bond, 22, y0 + 30, { s: 13, c: col(S.col) });
      pill(ctx, "나르개: " + (c ? (sub === "cu" ? "자유 전자" : "이온") : "없음"), 878, y0 + 30, { s: 12.5, a: "right", c: c ? KS.yellow : KS.mute });
      text(ctx, "녹는점 " + S.mp + " ℃" + (S.bp < 9000 ? " · 끓는점 " + S.bp + " ℃" : " (녹으면서 분해)") + "   |   현재 온도 " + T + " ℃ · " + (md === "aq" ? "물에 녹인 상태" : (md === "ice" ? "물이 얼어 있는 상태" : (wet ? "물이 끓어 날아간 상태" : "그대로"))), 22, y0 + 56, { s: 12, w: "800", c: LT.mute });
      var ordered = ((ph === "고체" && md !== "aq") || md === "ice");
      pill(ctx, sub === "cu" ? "빛나는 점 = 자유 전자, 금속 전체를 돌아다닌다"
        : (sub === "nacl" ? (!ordered ? "＋ － 이온이 자유롭게 움직인다" : "＋ － 이온이 제자리에 묶여 떨기만 한다")
        : "전하를 띠지 않은 분자뿐"), 22, y0 + 84, { s: 12.5, c: KS.ink });
      text(ctx, "움직일 수 있는 전하가 있어야 통한다", 878, y0 + 84, { s: 11.5, a: "right", c: LT.mute });
      mark(ctx, got.a, "소금 녹이기", 15, y0 + 112, { s: 11.5 });
      mark(ctx, got.b, "소금물", 170, y0 + 112, { s: 11.5 });
      mark(ctx, got.c, "설탕 녹이기", 285, y0 + 112, { s: 11.5 });
      mark(ctx, got.d, "구리 녹이기", 440, y0 + 112, { s: 11.5 });
      if (quiet === true) return;
      $("b-prop-info").innerHTML = "<b>" + S.k + "</b> · " + S.bond + " · 현재 " + (md === "aq" ? "수용액" : ph) + " · 전기 " + (c ? "<b>통함</b>" : "<b>통하지 않음</b>") + "<br>" + why();
    }
    function check() {
      var S = SUB[sub], ch = false, c = conduct(), md = mode();
      if (sub === "nacl" && md === "dry" && !wet && phase(S) !== "고체" && c && !got.a) { got.a = true; ch = true; }
      if (sub === "nacl" && md === "aq" && c && !got.b) { got.b = true; ch = true; }
      if (sub === "sugar" && !wet && phase(S) !== "고체" && !c && !got.c) { got.c = true; ch = true; }
      if (sub === "cu" && !wet && phase(S) !== "고체" && c && !got.d) { got.d = true; ch = true; }
      if (ch) { window.sthState("bProp", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-3a");
      if (got.b) done("m2-3b");
      if (got.c) done("m2-3c");
      if (got.d) done("m2-3d");
      if (got.a && got.b && got.c && got.d) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>같은 하얀 가루라도 <b>이온 결합</b>이면 녹이거나 물에 녹일 때 전기가 통하고, <b>공유 결합(분자)</b>이면 어떻게 해도 통하지 않았습니다. 구리는 자유 전자 덕분에 늘 통했습니다.");
        ep.clear(2);
      }
    }
    cv._redraw = draw;
    playBtn("b-prop-play", "⏸ 입자 멈추기", "▶ 입자 움직이기", function () { return pPlay; }, function (q) { pPlay = q; });
    K.animate(cv, function (dt) { if (pPlay) { pT += dt; draw(true); } });
    onSeg("b-sub", function (b) { sub = b.getAttribute("data-s"); draw(); check(); });
    onSeg("b-sol", function (b) { wet = b.getAttribute("data-w") === "wet"; draw(); check(); });
    $("b-t").addEventListener("input", function (e) { T = +e.target.value; $("b-t-val").textContent = T + " ℃"; draw(); check(); });
    draw(); mission();
  })();

  /* ------------------------------------------------ 장면 4 — 감식실 */
  (function () {
    var sorted = !!window.sthState("bSort"), qOK = !!window.sthState("bQ");
    function mission() {
      if (sorted) done("m2-4a");
      if (qOK) done("m2-4b");
      if (sorted && qOK) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>녹는점과 전기 전도성 두 가지만으로 결합을 가려냈습니다. <b>높은 녹는점 + 녹이면 통함 = 이온 결합</b>, <b>낮은 녹는점 + 끝까지 통하지 않음 = 공유 결합(분자)</b>입니다.");
        ep.clear(3);
      }
    }
    window.sthSort({
      mount: "s2-sort",
      buckets: [
        { id: "ion", label: "이온 결합", sub: "금속 + 비금속 · 전자를 주고받음" },
        { id: "cov", label: "공유 결합 (분자)", sub: "비금속 + 비금속 · 전자를 같이 씀" }
      ],
      items: [
        { t: "시료 ㉮ — 녹는점 801 ℃ · 고체 ✕ · 녹인 것 ○", a: "ion", why: "녹는점이 높고 녹이면 통합니다. 염화 나트륨이었습니다." },
        { t: "시료 ㉯ — 녹는점 −114 ℃ · 고체 ✕ · 액체 ✕", a: "cov", why: "녹는점이 아주 낮고 액체가 되어도 통하지 않습니다. 에탄올이었습니다.", hint: "이온 결정은 녹는점이 수백 ℃ 이상입니다." },
        { t: "시료 ㉰ — 녹는점 2,852 ℃ · 고체 ✕ · 녹인 것 ○", a: "ion", why: "±2가 이온이라 끌어당기는 힘이 아주 셉니다. 산화 마그네슘이었습니다." },
        { t: "시료 ㉱ — 녹는점 186 ℃ · 고체 ✕ · 녹인 것 ✕ · 물에 녹인 것 ✕", a: "cov", why: "물에 잘 녹지만 이온이 되지 않습니다. 설탕이었습니다.", hint: "물에 녹는다고 다 이온은 아닙니다." },
        { t: "시료 ㉲ — 녹는점 770 ℃ · 고체 ✕ · 물에 녹인 것 ○", a: "ion", why: "물에 녹자 이온이 풀려났습니다. 염화 칼륨이었습니다." },
        { t: "시료 ㉳ — 녹는점 0 ℃ · 액체 ✕ · 다른 것을 녹이면 ○", a: "cov", why: "스스로는 거의 통하지 않지만 이온을 녹이면 통하게 해 줍니다. 물이었습니다.", hint: "녹는점 0 ℃ 인 이 물질은 무엇일까요?" }
      ],
      doneText: "여섯 시료의 정체가 모두 드러났습니다.",
      onDone: function () { sorted = true; window.sthState("bSort", 1); mission(); }
    });
    window.sthPick({
      mount: "s2-q",
      q: "인류의 생존에 꼭 필요한 <b>물(H₂O)</b>, <b>산소(O₂)</b>, <b>소금(NaCl)</b>을 결합에 따라 나누면?",
      options: [
        "셋 다 이온 결합이다",
        "물과 산소는 공유 결합, 소금은 이온 결합이다",
        "물과 소금은 이온 결합, 산소는 공유 결합이다",
        "셋 다 공유 결합이다"
      ],
      answer: 1,
      why: [
        "물과 산소는 비금속 원소끼리 만난 것이라 이온이 되지 않습니다. 그래서 녹는점이 낮고 전기가 통하지 않습니다.",
        "물(수소+산소)과 산소(산소+산소)는 <b>비금속끼리</b>라 전자를 같이 쓰고, 소금은 <b>금속(나트륨) + 비금속(염소)</b>이라 전자를 주고받습니다.",
        "물이 이온 결합이라면 순수한 물도 전기가 잘 통해야 합니다. 실제로는 거의 통하지 않습니다.",
        "소금은 녹이면 전기가 통합니다. 움직이는 <b>이온</b>이 있다는 뜻입니다."
      ],
      onDone: function () { qOK = true; window.sthState("bQ", 1); mission(); }
    });
    mission();
  })();

  /* 장면 5 — 결말 */
  function finish() { window.sthState("r2", "해결 · 소금은 녹으면 이온이 풀려나 전기가 통한다 — 설탕은 분자라서 통하지 않는다"); }
  function showEnd(i) {
    if (i !== 4) return;
    var p = window.sthState("bond1") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 이제 ‘왜 설탕은 그렇지 않은가’까지 설명할 수 있게 되었습니다."
        : "정답은 ㉡ 입니다. 고체 소금에도 이온은 있었습니다. 다만 <b>움직이지 못했을</b> 뿐입니다.");
    ep.clear(4);
  }
  ep.onShow(showEnd);
  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅱ-2] 이야기 ② 녹이면 통한다",
    items: [
      { id: "w2", label: "결합이 다르면 성질이 다르다", hint: "물과 소금을 골라, 결합의 차이가 어떤 성질의 차이로 이어지는지 짝지어 쓰세요." },
      { id: "wB", label: "고체 소금은 안 통하고 소금물은 통하는 까닭", hint: "‘전기가 통하려면 …가 있어야 한다’로 시작해, 고체·액체·수용액 세 경우를 이온의 움직임으로 견주어 쓰세요." }
    ]
  });
  if (ep.at() === 4) showEnd(4);
})();

/* =========================================================================
   이야기 ③ 같은 부품, 다른 물건
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "mineral1", title: "조사관의 첫 추리",
    question: "감람석 · 휘석 · 운모 · 석영은 모두 같은 부품인 <b>규산염 사면체(SiO₄)</b>로 만들어졌습니다. 그런데 성질이 전혀 다릅니다. 무엇이 다른 걸까요?",
    options: [
      "㉠ 사면체의 모양이 광물마다 조금씩 다르다",
      "㉡ 사면체가 이어지는 방식 — 이웃과 나눠 쓰는 산소 수가 다르다",
      "㉢ 규소 대신 다른 원소가 들어 있다",
      "㉣ 만들어진 온도만 다르고 구조는 같다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ------------------------------------------------ 장면 2 — 사면체 조립대 */
  (function () {
    var cv = $("c-tet"), ctx = window.setupCanvas(cv);
    var sh = 0;
    var got = window.sthState("cTet") || { a: false, b: false, c: false };
    var ST = [
      { nm: "독립형", fx: "SiO₄⁴⁻", ratio: "1 : 4", min: "감람석", col: "--coral",
        w: "사면체가 서로 붙지 않고 <b>따로따로</b> 떨어져 있습니다. 사이사이를 철·마그네슘 이온이 메워 줍니다. 쪼개지는 방향이 거의 없어 불규칙하게 부서집니다." },
      { nm: "짝사면체", fx: "Si₂O₇⁶⁻", ratio: "1 : 3.5", min: "녹렴석 무리", col: "--amber",
        w: "사면체 <b>둘이 산소 하나</b>를 나눠 쓰며 짝을 이룹니다. 독립형과 사슬형 사이에 있는 구조로, 교과서의 다섯 구조(독립형·단사슬·복사슬·판상·망상)에는 따로 들지 않습니다." },
      { nm: "단사슬형", fx: "SiO₃²⁻", ratio: "1 : 3", min: "휘석", col: "--teal",
        w: "산소 <b>두 개</b>를 나눠 쓰며 사슬처럼 길게 이어집니다. 사슬과 사슬 사이가 약해 거의 직각인 <b>두 방향</b>으로 쪼개집니다. 사슬 두 줄이 나란히 붙은 <b>복사슬형</b>(각섬석)은 사면체마다 산소를 2개 또는 3개 나눠 써서 규소 : 산소 = <b>1 : 2.75</b>입니다." },
      { nm: "판상", fx: "Si₂O₅²⁻", ratio: "1 : 2.5", min: "흑운모 · 백운모 · 점토 광물", col: "--violet",
        w: "산소 <b>세 개</b>를 나눠 써서 넓은 판을 이룹니다. 판 안쪽은 튼튼하지만 판과 판 사이는 약해, <b>한 방향으로 얇게</b> 벗겨집니다." },
      { nm: "망상", fx: "SiO₂", ratio: "1 : 2", min: "석영 · 장석", col: "--brand",
        w: "산소 <b>네 개를 모두</b> 나눠 써서 삼차원 그물이 됩니다. 약한 면이 없어 쪼개짐이 없고 매우 단단합니다. 모래알이 바로 이것입니다." }
    ];
    function tet(cx, cy, r, shares) {
      floorShadow(ctx, cx, cy + r * .78, r * 1.05, r * .2, .2);
      var pts = [[0, -r], [r * 0.88, r * 0.52], [-r * 0.88, r * 0.52]], i;
      /* 사면체의 면(반투명 유리) */
      var fg = ctx.createLinearGradient(cx, cy - r, cx, cy + r * .52);
      fg.addColorStop(0, "rgba(120,230,215,.20)"); fg.addColorStop(1, "rgba(60,120,160,.10)");
      ctx.fillStyle = fg; ctx.beginPath();
      for (i = 0; i < 3; i++) { if (i === 0) ctx.moveTo(cx + pts[i][0], cy + pts[i][1]); else ctx.lineTo(cx + pts[i][0], cy + pts[i][1]); }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(20,90,110,.55)"; ctx.lineWidth = 1.6; ctx.stroke();
      [.30, .16, .44].forEach(function (al, f) {
        var p1 = pts[f], p2 = pts[(f + 1) % 3]; ctx.fillStyle = "rgba(12,133,153," + al + ")";
        ctx.beginPath(); ctx.moveTo(cx, cy - r * .42); ctx.lineTo(cx + p1[0], cy + p1[1]); ctx.lineTo(cx + p2[0], cy + p2[1]); ctx.closePath(); ctx.fill();
      });
      ctx.strokeStyle = "rgba(20,90,110,.32)";
      for (i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + pts[i][0], cy + pts[i][1]); ctx.stroke(); }
      ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy); ctx.lineTo(cx - r * .88, cy + r * .52); ctx.closePath(); ctx.fill();
      ball(ctx, cx, cy, r * 0.27, "--teal");
      text(ctx, "Si", cx, cy + r * 0.11, { s: r * 0.28, w: "900", a: "center", c: "#ffffff" });
      for (i = 0; i < 3; i++) ball(ctx, cx + pts[i][0], cy + pts[i][1], r * 0.21, i < shares ? "--amber" : "#ff6b5a");
      ball(ctx, cx, cy - r * 0.42, r * 0.18, shares > 3 ? "--amber" : "#ff6b5a");
    }
    function draw() {
      paper(ctx, 900, 372);
      var S = ST[sh], i, j;
      K.bigText(ctx, S.nm + " · 나눠 쓰는 산소 " + sh + "개", 18, 38, 24, "#ffffff");
      /* 진열대(광물 표본 받침) 위에 사면체 모형을 늘어놓는다 */
      slab(ctx, 34, 334, 520, 16, 30, "#f4f6fa", "#cfd7e3", "#a9b4c5");
      floorShadow(ctx, 310, 354, 300, 14, .22);
      if (sh === 0) {
        for (i = 0; i < 3; i++) tet(130 + i * 170, 228 + (i % 2 ? -22 : 0), 72, 0);
      } else if (sh === 1) {
        for (j = 0; j < 2; j++) for (i = 0; i < 2; i++) tet(120 + j * 250 + i * 112, 220 + j * 10, 66, 1);
      } else if (sh === 2) {
        for (i = 0; i < 6; i++) tet(90 + i * 88, 220 + (i % 2 ? 24 : -24), 58, 2);
      } else if (sh === 3) {
        for (j = 0; j < 2; j++) for (i = 0; i < 5; i++) tet(105 + i * 92 + (j ? 46 : 0), 162 + j * 124, 52, 3);
      } else {
        for (j = 0; j < 3; j++) for (i = 0; i < 6; i++) tet(85 + i * 78 + (j % 2 ? 39 : 0), 138 + j * 86, 44, 4);
      }
      ball(ctx, 26, 74, 6, "#ff6b5a"); K.t(ctx, "혼자 쓰는 산소", 37, 79, { s: 12, w: "700", c: LT.mute });
      ball(ctx, 148, 74, 6, "--amber"); K.t(ctx, "나눠 쓰는 산소", 159, 79, { s: 12, w: "700", c: LT.mute });
      ball(ctx, 270, 74, 6, "--teal"); K.t(ctx, "규소", 281, 79, { s: 12, w: "700", c: LT.mute });

      var ix = 600, iw = 284, bx = ix + 18;
      K.card(ctx, ix, 14, iw, 344, "판정 · 사면체가 이어진 모양");
      K.t(ctx, S.nm, bx, 74, { s: 24, w: "900", c: col(S.col) });
      K.row(ctx, "단위 화학식", S.fx, bx, ix + iw - 18, 108);
      K.row(ctx, "규소 : 산소", S.ratio, bx, ix + iw - 18, 134, LT.violet);
      K.row(ctx, "대표 광물", S.min.length > 10 ? S.min.slice(0, 10) + "…" : S.min, bx, ix + iw - 18, 160, LT.teal);
      K.tip(ctx, "산소 4 − " + sh + "/2 = " + (4 - sh / 2) + "개 (규소 1개당)", bx, 176, iw - 36, null);
      K.bar(ctx, bx, 220, iw - 36, (4 - sh / 2) / 4, LT.orange);
      K.t(ctx, "규소 하나가 차지하는 산소 수", bx, 248, { s: 12, c: LT.mute });
      [[got.a, "1 : 3 구조"], [got.b, "1 : 2 구조"], [got.c, "얇게 벗겨지는 구조"]].forEach(function (m2, q) {
        K.t(ctx, (m2[0] ? "✔ " : "○ ") + m2[1], bx, 274 + q * 22, { s: 13, w: "800", c: m2[0] ? LT.green : LT.mute });
      });
      K.t(ctx, "나눠 쓴 산소는 두 사면체가 반씩 가진 셈", bx, 342, { s: 12, c: LT.mute });
      $("c-tet-info").innerHTML = "<b>" + S.nm + "</b> (" + S.fx + ", 규소 : 산소 = " + S.ratio + ") · 대표 광물 <b>" + S.min + "</b><br>" + S.w;
    }
    function check() {
      var ch = false;
      if (sh === 2 && !got.a) { got.a = true; ch = true; }
      if (sh === 4 && !got.b) { got.b = true; ch = true; }
      if (sh === 3 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("cTet", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.c) done("m3-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>부품은 하나인데 <b>나눠 쓰는 산소 수</b>만으로 감람석 · 휘석 · 운모 · 석영이 갈렸습니다. 운모가 벗겨지고 석영이 단단한 까닭도 구조에 있었습니다.");
        ep.clear(1);
      }
    }
    cv._redraw = draw;
    $("c-share").addEventListener("input", function (e) { sh = +e.target.value; $("c-share-val").textContent = sh + "개"; draw(); check(); });
    draw(); mission();
  })();

  /* ------------------------------------------------ 장면 3 — 탄소 조립대 */
  (function () {
    var cv = $("c-carb"), ctx = window.setupCanvas(cv);
    var shape = "chain", n = 1;
    var got = window.sthState("cCarb") || { a: false, b: false, c: false };
    var CNM = ["메테인", "에테인", "프로페인", "뷰테인", "펜테인", "헥세인", "헵테인", "옥테인", "노네인", "데케인"];
    var CBP = [-162, -89, -42, -0.5, 36, 69, 98, 126, 151, 174];
    var RNM = ["사이클로프로페인", "사이클로뷰테인", "사이클로펜테인", "사이클로헥세인", "사이클로헵테인", "사이클로옥테인", "사이클로노네인", "사이클로데케인"];
    var RBP = [-33, 12, 49, 81, 118, 151, 178, 201];
    function ok() { return shape === "chain" || n >= 3; }
    function nm() { return shape === "chain" ? CNM[n - 1] : RNM[n - 3]; }
    function bp() { return shape === "chain" ? CBP[n - 1] : RBP[n - 3]; }
    /* 분자식의 원자 수는 아래 첨자로 쓰고, 1은 쓰지 않는다 (CH₄, C₂H₆ …) */
    function sub(k) { return k === 1 ? "" : String(k).split("").map(function (c) { return "₀₁₂₃₄₅₆₇₈₉".charAt(+c); }).join(""); }
    function formula() { return "C" + sub(n) + "H" + sub(shape === "chain" ? 2 * n + 2 : 2 * n); }
    function state() { return bp() > 25 ? "액체" : "기체"; }

    /* 입체 공-막대 분자 — 진열대 위에 떠 있는 모형. 사슬은 지그재그, 고리는 눕힌 고리 */
    function stand(cx, cy, rx) {
      floorShadow(ctx, cx, cy + 22, rx * 1.15, 22, .26);
      var g = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0); g.addColorStop(0, "#c3ccd9"); g.addColorStop(.5, "#e9eef5"); g.addColorStop(1, "#9aa5b6");
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + 12, rx, rx * .2, 0, 0, Math.PI); ctx.lineTo(cx - rx, cy); ctx.ellipse(cx, cy, rx, rx * .2, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
      var tg = ctx.createRadialGradient(cx - rx * .3, cy - 6, 4, cx, cy, rx); tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#dfe5ee");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(cx, cy, rx, rx * .2, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(90,105,140,.35)"; ctx.lineWidth = 1.2; ctx.stroke();
    }
    function molecule(cx, cy) {
      var at = [], bd = [], i, k, sc, CR, HR, BL;
      function add(X, Y, Z, isC) { at.push({ X: X, Y: Y, Z: Z, c: isC }); return at.length - 1; }
      if (shape === "chain") {
        var sp = n > 1 ? Math.min(82, 450 / (n - 1)) : 82; sc = n === 1 ? 1.7 : clamp(sp / 82, .62, 1.1);
        CR = 25 * sc; HR = 13 * sc; BL = 50 * sc;
        var zz = 30 * sc, x0 = -(n - 1) * sp / 2, cIdx = [];
        for (i = 0; i < n; i++) cIdx.push(add(x0 + i * sp, n === 1 ? 0 : (i % 2 ? -zz : zz), 0, true));
        for (i = 0; i < n - 1; i++) bd.push([cIdx[i], cIdx[i + 1]]);
        for (i = 0; i < n; i++) {
          var C0 = at[cIdx[i]], up = n === 1 ? -1 : (i % 2 ? -1 : 1), hs = [];
          if (n === 1) hs = [[0, -1, 0], [.94, .33, 0], [-.47, .33, .82], [-.47, .33, -.82]];
          else {
            hs = [[0, up * .58, .82], [0, up * .58, -.82]];
            if (i === 0) hs.push([-.94, up * .33, 0]);
            if (i === n - 1) hs.push([.94, up * .33, 0]);
          }
          for (k = 0; k < hs.length; k++) bd.push([cIdx[i], add(C0.X + hs[k][0] * BL, C0.Y + hs[k][1] * BL, C0.Z + hs[k][2] * BL, false)]);
        }
      } else {
        var R = Math.max(78, n * 86 / 6.2832); sc = clamp(1.3 - n * .05, .78, 1.15);
        CR = 23 * sc; HR = 12 * sc; BL = 44 * sc;
        var rIdx = [];
        for (i = 0; i < n; i++) { var a = i * 6.2832 / n; rIdx.push(add(Math.cos(a) * R, n > 3 ? (i % 2 ? -8 : 8) : 0, Math.sin(a) * R, true)); }
        for (i = 0; i < n; i++) bd.push([rIdx[i], rIdx[(i + 1) % n]]);
        for (i = 0; i < n; i++) {
          var a2 = i * 6.2832 / n, C1 = at[rIdx[i]];
          [[-1], [1]].forEach(function (s0) {
            bd.push([rIdx[i], add(C1.X + Math.cos(a2) * BL * .8, C1.Y + s0[0] * BL * .6, C1.Z + Math.sin(a2) * BL * .8, false)]);
          });
        }
      }
      var TZ = shape === "chain" ? .34 : .5;
      at.forEach(function (p) { p.sx = cx + p.X + p.Z * (shape === "chain" ? .38 : 0); p.sy = cy + p.Y + p.Z * TZ * (shape === "chain" ? -.6 : 1); p.d = p.Z; });
      var items = at.map(function (p) { return { t: 0, p: p, d: p.d }; }).concat(bd.map(function (b) { return { t: 1, a: at[b[0]], b: at[b[1]], d: (at[b[0]].d + at[b[1]].d) / 2 - 3 }; }));
      items.sort(function (p, q) { return p.d - q.d; });
      items.forEach(function (it) {
        if (it.t === 1) {
          var cc = it.a.c && it.b.c;
          ctx.lineCap = "round";
          ctx.strokeStyle = cc ? "rgba(90,70,170,.9)" : "rgba(150,120,60,.75)"; ctx.lineWidth = (cc ? 8 : 5) * sc;
          ctx.beginPath(); ctx.moveTo(it.a.sx, it.a.sy); ctx.lineTo(it.b.sx, it.b.sy); ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = (cc ? 2.4 : 1.6) * sc;
          ctx.beginPath(); ctx.moveTo(it.a.sx, it.a.sy - 1); ctx.lineTo(it.b.sx, it.b.sy - 1); ctx.stroke(); ctx.lineCap = "butt";
        } else {
          var p = it.p, dk = .85 + clamp(p.d / 80, -.15, .15);
          if (p.c) { ball(ctx, p.sx, p.sy, CR * dk, "--violet"); K.t(ctx, "C", p.sx + 1, p.sy + 5, { s: Math.max(12, 15 * sc), w: "900", a: "center", c: "#ffffff" }); }
          else ball(ctx, p.sx, p.sy, HR * dk, "#f5b041");
        }
      });
    }

    function draw() {
      paper(ctx, 900, 360);
      K.bigText(ctx, (shape === "chain" ? "사슬형" : "고리형") + " · 탄소 " + n + "개", 18, 38, 24, "#ffffff");
      pill(ctx, "보라 공 = 탄소 · 노란 공 = 수소 · 탄소는 결합을 네 개까지", 18, 66, { s: 12, c: KS.mute });
      var cxm = 290, cym = 192;
      stand(cxm, 306, shape === "chain" ? 220 : 170);
      if (!ok()) {
        for (var q = 0; q < n; q++) ball(ctx, cxm - 30 + q * 60, 282, 22, "--violet");
        pill(ctx, "🚫 탄소 " + n + "개로는 고리를 만들 수 없습니다", cxm, 190, { s: 16, a: "center", c: v("--rose-700") });
        K.t(ctx, "고리가 되려면 탄소가 적어도 3개는 있어야 합니다.", cxm, 222, { s: 13, a: "center", c: LT.mute });
        $("c-carb-info").innerHTML = "고리를 닫으려면 탄소가 <b>3개 이상</b> 있어야 합니다. 슬라이더를 오른쪽으로 옮기거나 사슬형으로 바꿔 보세요.";
        return;
      }
      molecule(cxm, shape === "chain" ? cym : 190);

      var cx0 = 588, cw0 = 296, bx0 = cx0 + 18, bw0 = cw0 - 36;
      K.card(ctx, cx0, 14, cw0, 332, "판정 · 지금 조립한 분자");
      K.t(ctx, nm(), bx0, 76, { s: 22, w: "900", c: LT.violet });
      K.t(ctx, formula(), cx0 + cw0 - 18, 76, { s: 22, w: "900", a: "right", c: LT.ink });
      K.row(ctx, "탄소 · 수소", n + "개 · " + (shape === "chain" ? 2 * n + 2 : 2 * n) + "개", bx0, bx0 + bw0, 104);
      K.row(ctx, "끓는점", bp() + " ℃", bx0, bx0 + bw0, 127);
      var fb = clamp((bp() + 170) / 380, 0, 1), f25 = (25 + 170) / 380;
      K.bar(ctx, bx0, 138, bw0, fb, state() === "액체" ? LT.blue : LT.teal);
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(bx0 + bw0 * f25, 132); ctx.lineTo(bx0 + bw0 * f25, 154); ctx.stroke(); ctx.setLineDash([]);
      K.t(ctx, "−170 ℃", bx0, 168, { s: 12, c: LT.mute });
      K.t(ctx, "실온 25 ℃", bx0 + bw0 * f25, 168, { s: 12, w: "800", a: "center", c: LT.orange });
      K.t(ctx, "210 ℃", bx0 + bw0, 168, { s: 12, a: "right", c: LT.mute });
      K.tip(ctx, "실온(25 ℃)에서 " + state(), bx0, 182, bw0, state() === "액체" ? true : null);
      [[got.a, "실온에서 액체인 가장 작은 것"], [got.b, "C₈H₁₈ 확인"], [got.c, "고리형은 수소 2개 적음"]].forEach(function (m2, q2) {
        K.t(ctx, (m2[0] ? "✔ " : "○ ") + m2[1], bx0, 244 + q2 * 24, { s: 12.5, w: "800", c: m2[0] ? LT.green : LT.mute });
      });
      K.t(ctx, "탄소가 늘수록 무거워져 끓는점↑", bx0, 312, { s: 12, c: LT.mute });
      K.t(ctx, "고리를 닫으면 수소 2개가 줄어든다", bx0, 332, { s: 12, c: LT.mute });
      $("c-carb-info").innerHTML = "<b>" + nm() + "</b> · " + formula() + " · 끓는점 <b>" + bp() + " ℃</b> · 실온에서 <b>" + state() + "</b><br>" +
        (shape === "chain"
          ? "탄소가 " + n + "개인 사슬이라 수소는 2 × " + n + " + 2 = <b>" + (2 * n + 2) + "개</b>입니다. 사슬 양 끝의 탄소는 수소 3개, 가운데 탄소는 2개를 붙잡습니다."
          : "고리를 닫으면서 양 끝이 서로 이어졌기 때문에, 같은 탄소 수의 사슬형보다 수소가 <b>2개 적은 " + 2 * n + "개</b>입니다.") +
        " 탄소끼리 잇는 방법이 사슬 · 가지 · 고리로 갈라지고 결합도 단일 · 이중 · 삼중이 되므로, 탄소 화합물의 종류는 <b>1억 가지</b>가 넘습니다.";
    }
    function check() {
      var ch = false;
      if (shape === "chain" && n === 5 && !got.a) { got.a = true; ch = true; }
      if (shape === "chain" && n === 8 && !got.b) { got.b = true; ch = true; }
      if (shape === "ring" && n >= 3 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("cCarb", got); mission(); draw(); }
    }
    function mission() {
      if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (got.c) done("m3-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>탄소 수가 4개까지는 기체, <b>5개(펜테인)</b>부터 액체였습니다. 탄소를 어떻게 잇느냐(사슬 · 고리)만 바꿔도 분자식과 성질이 달라집니다.");
        ep.clear(2);
      }
    }
    cv._redraw = draw;
    onSeg("c-shape", function (b) { shape = b.getAttribute("data-k"); draw(); check(); });
    $("c-n").addEventListener("input", function (e) { n = +e.target.value; $("c-n-val").textContent = n + "개"; draw(); check(); });
    draw(); mission();
  })();

  /* ------------------------------------------------ 장면 4 — 단위체 계산실 */
  (function () {
    var cv = $("c-poly"), ctx = window.setupCanvas(cv);
    var bio = "pro", len = 2;
    var got = window.sthState("cPoly") || { a: false, b: false }, sorted = !!window.sthState("cSort");
    var COL = ["--coral", "--teal", "--violet", "--amber", "--brand", "--green", "--rose", "--mist"];
    function kinds() { return bio === "pro" ? 20 : 4; }
    function count() { return Math.pow(kinds(), len); }

    function draw() {
      paper(ctx, 900, 380);
      var k = kinds(), c = count(), i, isP = bio === "pro";
      K.bigText(ctx, (isP ? "아미노산 20종" : "뉴클레오타이드 4종") + " · " + len + "개 잇기", 18, 38, 24, "#ffffff");

      /* 입체 사슬 — 단백질은 한 가닥 나선, DNA는 두 가닥 나선(짝 가닥은 저절로 정해진다) */
      /* 짧은 사슬일수록 구슬을 크게 — 조작 전(2개)에도 모형이 화면을 채운다 */
      var HX0 = 64, HX1 = 516, HCY = 178, TW = isP ? 0.62 : 0.58;
      var sp = len > 1 ? Math.min(isP ? 96 : 84, (HX1 - HX0) / (len - 1)) : 0, hx0 = (HX0 + HX1) / 2 - sp * (len - 1) / 2;
      var br = clamp(sp * .36 + 4, 8, 30), AMP = (isP ? 34 : 46) * Math.min(1.5, Math.max(1, br / 15));
      floorShadow(ctx, (HX0 + HX1) / 2, 262, Math.max(70, sp * (len - 1) / 2 + 40), 16, .22);
      var DNAC = ["#e8590c", "#0ca678", "#1c7ed6", "#f59f00"], PAIR = [1, 0, 3, 2];
      function seqOf(q) { return (q * 7 + len * 3 + (q * q) % 5) % (isP ? 8 : 4); }
      function colOf2(q) { return isP ? col(COL[seqOf(q)]) : DNAC[seqOf(q)]; }
      var beads = [];
      for (i = 0; i < len; i++) {
        var th = i * TW + (isP ? 0 : 1.25), bx = hx0 + i * sp;
        beads.push({ x: bx, y: HCY - Math.sin(th) * AMP + Math.cos(th) * 12, z: Math.cos(th), c: colOf2(i), s: 0, q: i });
        if (!isP) beads.push({ x: bx, y: HCY - Math.sin(th + Math.PI) * AMP + Math.cos(th + Math.PI) * 12, z: Math.cos(th + Math.PI), c: DNAC[PAIR[seqOf(i)]], s: 1, q: i });
      }
      /* 염기쌍 가로대(DNA) — 두 공 사이, 깊이는 가운데 */
      var rungs = [];
      if (!isP) for (i = 0; i < len; i++) rungs.push({ a: beads[i * 2], b: beads[i * 2 + 1], z: 0 });
      /* 등뼈(같은 가닥 이웃끼리 잇는 막대) */
      var sticks = [];
      for (i = 0; i < beads.length; i++) {
        var nx = isP ? beads[i + 1] : beads[i + 2];
        if (nx && nx.s === beads[i].s) sticks.push({ a: beads[i], b: nx, z: (beads[i].z + nx.z) / 2 - .01 });
      }
      var all = beads.map(function (o) { return { t: "b", o: o, z: o.z }; })
        .concat(sticks.map(function (o) { return { t: "s", o: o, z: o.z }; }))
        .concat(rungs.map(function (o) { return { t: "r", o: o, z: -0.02 }; }));
      all.sort(function (p, q) { return p.z - q.z; });
      all.forEach(function (it) {
        var o = it.o, dk = .55 + .45 * (it.z + 1) / 2;
        if (it.t === "s") {
          ctx.strokeStyle = "rgba(60,75,110," + (.35 + .45 * dk).toFixed(2) + ")"; ctx.lineWidth = 3 + 2 * dk; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(o.a.x, o.a.y); ctx.lineTo(o.b.x, o.b.y); ctx.stroke(); ctx.lineCap = "butt";
        } else if (it.t === "r") {
          var mx2 = (o.a.x + o.b.x) / 2, my2 = (o.a.y + o.b.y) / 2;
          ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.strokeStyle = o.a.c; ctx.globalAlpha = .75; ctx.beginPath(); ctx.moveTo(o.a.x, o.a.y); ctx.lineTo(mx2, my2); ctx.stroke();
          ctx.strokeStyle = o.b.c; ctx.beginPath(); ctx.moveTo(mx2, my2); ctx.lineTo(o.b.x, o.b.y); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = "butt";
        } else {
          var rr = br * (.78 + .22 * (o.z + 1) / 2);
          ctx.globalAlpha = o.s ? .82 : 1;
          K.planet(ctx, o.x, o.y, rr, o.c, shade(o.c, .38 + .2 * (1 - dk)));
          ctx.globalAlpha = 1;
          if (!isP && rr >= 10 && o.z > -.2) K.t(ctx, "ATGC".charAt(o.s ? PAIR[seqOf(o.q)] : seqOf(o.q)), o.x + .5, o.y + 4.5, { s: 12, w: "900", a: "center", c: "#ffffff" });
        }
      });
      pill(ctx, isP ? "구슬 하나 = 아미노산 하나" : "앞 가닥 순서를 정하면 짝 가닥(A–T, G–C)은 저절로 정해짐", 18, 66, { s: 12, c: KS.mute });

      /* 부품 상자 — 고를 수 있는 단위체 종류 */
      var tx0 = 52, ty0 = 318, tw0 = isP ? 330 : 230, td = 46;
      slab(ctx, tx0, ty0, tw0, 30, td, "#f4f6fa", "#cfd7e3", "#a9b4c5");
      var nr = isP ? 2 : 1, ncol = isP ? 10 : 4, cr = isP ? 9 : 14;
      for (var rw = 0; rw < nr; rw++) for (var cc = 0; cc < ncol; cc++) {
        var f0 = nr === 1 ? .5 : (rw === 0 ? .74 : .3), gx2 = tx0 + 18 + cc * (tw0 - 36) / (ncol - 1) + td * f0, gy2 = ty0 - td * .6 * f0;
        var kc = isP ? col(COL[(rw * 10 + cc) % 8]) : DNAC[cc];
        ctx.fillStyle = "rgba(20,30,50,.18)"; ctx.beginPath(); ctx.ellipse(gx2 + 2, gy2 + cr * .55, cr * .9, cr * .3, 0, 0, 6.2832); ctx.fill();
        K.planet(ctx, gx2, gy2 - cr * .35, cr, kc, shade(kc, .38));
        if (!isP) K.t(ctx, "ATGC".charAt(cc), gx2 + .5, gy2 - cr * .35 + 5, { s: 13, w: "900", a: "center", c: "#ffffff" });
      }
      K.t(ctx, "부품 상자 · " + k + "종", tx0 + 12, ty0 + 21, { s: 13, w: "900", c: "#3b4a63" });
      if (isP) K.t(ctx, "색 8가지로 줄여 그림 · 실제는 20종", tx0 + tw0 + td - 150, ty0 + 52, { s: 12, c: LT.mute });

      /* 오른쪽 흰 판정 카드 */
      var cx0 = 552, cw0 = 330, bx0 = cx0 + 18, bw0 = cw0 - 36;
      K.card(ctx, cx0, 18, cw0, 344, "만들 수 있는 서열의 가짓수");
      K.t(ctx, k + sup(len) + " =", bx0, 72, { s: 18, w: "800", c: LT.ink });
      K.t(ctx, sci(c, 2) + " 가지", cx0 + cw0 - 18, 104, { s: 26, w: "900", a: "right", c: c > 1e12 ? LT.green : LT.violet });
      K.t(ctx, c < 1e15 ? "= " + Math.round(c).toLocaleString() + " 가지" : "자릿수가 " + (Math.floor(log10(c)) + 1) + "자리", bx0, 128, { s: 12, c: LT.mute });
      K.t(ctx, "1조(10¹²)와 견주기 · 한 칸 = 10배", bx0, 158, { s: 12, w: "800", c: LT.mute });
      var MAX = 34, f = clamp(log10(c) / MAX, 0, 1);
      K.bar(ctx, bx0, 168, bw0, f, c > 1e12 ? LT.green : LT.violet);
      var t12 = bx0 + bw0 * 12 / MAX;
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(t12, 162); ctx.lineTo(t12, 184); ctx.stroke(); ctx.setLineDash([]);
      K.t(ctx, "10⁰", bx0, 198, { s: 12, c: LT.mute });
      K.t(ctx, "1조", t12, 198, { s: 12, w: "900", a: "center", c: LT.orange });
      K.t(ctx, "10" + sup(MAX), bx0 + bw0, 198, { s: 12, a: "right", c: LT.mute });
      K.tip(ctx, c > 1e12 ? "✅ 1조 가지를 넘었습니다" : "아직 1조 가지에 못 미칩니다", bx0, 210, bw0, c > 1e12 ? true : null);
      [[got.a, "아미노산으로 1조 넘기기 (최소 개수)"], [got.b, "뉴클레오타이드로 1조 넘기기 (최소 개수)"]].forEach(function (m2, q) {
        K.t(ctx, (m2[0] ? "✔ " : "○ ") + m2[1], bx0, 268 + q * 24, { s: 12.5, w: "800", c: m2[0] ? LT.green : LT.mute });
      });
      K.t(ctx, "사람 단백질 하나 = 아미노산 수백 개", bx0, 324, { s: 12, c: LT.mute });
      K.t(ctx, "사람 DNA = 염기쌍 약 30억 개", bx0, 344, { s: 12, c: LT.mute });

      $("c-poly-info").innerHTML = "<b>" + (bio === "pro" ? "아미노산 20종" : "뉴클레오타이드 4종") + "</b>을 <b>" + len + "개</b> 이어 붙이면 순서가 다른 서열을 <b>" + sci(c, 2) + " 가지</b> 만들 수 있습니다.<br>" +
        (bio === "pro"
          ? "단백질은 아미노산이 이어진 사슬이 접혀서 만들어집니다. 종류가 20가지뿐인데도 <b>순서</b>가 다르면 전혀 다른 단백질이 되므로, 효소 · 근육 · 항체 · 머리카락이 모두 같은 단위체로 지어집니다."
          : "핵산(DNA · RNA)은 뉴클레오타이드가 이어진 사슬입니다. 염기는 A · T · G · C 네 가지뿐이지만 <b>순서</b>에 유전 정보가 담깁니다. 종류가 적어도 길이만 길면 정보량은 얼마든지 커집니다.");
    }
    function check() {
      var ch = false;
      if (bio === "pro" && len === 10 && !got.a) { got.a = true; ch = true; }
      if (bio === "dna" && len === 20 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("cPoly", got); mission(); draw(); }
    }
    function mission() {
      if (got.a) done("m3-4a");
      if (got.b) done("m3-4b");
      if (sorted) done("m3-4c");
      if (got.a && got.b && sorted) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>아미노산은 <b>10개</b>, 뉴클레오타이드는 <b>20개</b>만 이어 붙여도 1조 가지를 넘겼습니다. 다양성은 단위체의 종류가 아니라 <b>순서와 길이</b>에서 나옵니다.");
        ep.clear(3);
      }
    }
    cv._redraw = draw;
    onSeg("c-bio", function (b) { bio = b.getAttribute("data-b"); draw(); check(); });
    $("c-len").addEventListener("input", function (e) { len = +e.target.value; $("c-len-val").textContent = len + "개"; draw(); check(); });
    window.sthSort({
      mount: "s3-sort",
      buckets: [
        { id: "si", label: "규산염 사면체 (SiO₄)", sub: "지각을 이루는 단위체" },
        { id: "aa", label: "아미노산", sub: "생명체를 이루는 단위체 ①" },
        { id: "nu", label: "뉴클레오타이드", sub: "생명체를 이루는 단위체 ②" }
      ],
      items: [
        { t: "감람석", a: "si", why: "사면체가 따로 떨어진 독립형 규산염 광물입니다." },
        { t: "석영 (모래알)", a: "si", why: "사면체가 산소를 모두 나눠 쓴 망상 구조입니다." },
        { t: "흑운모", a: "si", why: "사면체가 판을 이룬 구조라 얇게 벗겨집니다." },
        { t: "머리카락의 케라틴", a: "aa", why: "아미노산이 길게 이어져 꼬인 단백질입니다." },
        { t: "녹말을 분해하는 효소 아밀레이스", a: "aa", why: "효소도 단백질이므로 단위체는 아미노산입니다.", hint: "효소는 무엇으로 만들어져 있을까요?" },
        { t: "DNA", a: "nu", why: "뉴클레오타이드가 이어진 두 가닥이 나선으로 꼬여 있습니다." },
        { t: "RNA", a: "nu", why: "DNA와 같은 단위체로 된 한 가닥 핵산입니다.", hint: "핵산은 DNA 만이 아닙니다." }
      ],
      doneText: "지각도 생명체도 ‘단위체를 이어 붙인다’는 같은 설계도를 씁니다.",
      onDone: function () { sorted = true; window.sthState("cSort", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 */
  function finish() { window.sthState("r3", "해결 · 단위체는 같아도 잇는 방식이 다르면 다른 물질 — 지각도 생명체도 같은 설계도"); }
  function showEnd(i) {
    if (i !== 4) return;
    var p = window.sthState("mineral1") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 이제 그 ‘나눠 쓰는 산소 수’가 운모의 벗겨짐과 석영의 단단함까지 설명한다는 것을 보았습니다."
        : "정답은 ㉡ 입니다. 사면체는 어느 광물에서나 똑같이 생겼습니다. 달랐던 것은 <b>몇 개를 나눠 쓰는가</b> 뿐이었습니다.");
    ep.clear(4);
  }
  ep.onShow(showEnd);
  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅱ-2] 이야기 ③ 같은 부품, 다른 물건",
    items: [
      { id: "wC", label: "운모는 벗겨지고 석영은 단단한 까닭", hint: "‘나눠 쓰는 산소 수’와 ‘규소 : 산소 비’를 넣어, 두 광물의 구조 차이가 성질의 차이로 이어지는 과정을 쓰세요." },
      { id: "wD", label: "적은 종류의 단위체에서 다양성이 나오는 까닭", hint: "아미노산 20종과 염기 4종을 예로 들어, 계산한 가짓수를 근거로 쓰세요. 규산염 광물과 어떤 점이 닮았는지도 한 문장 덧붙이세요." }
    ]
  });
  if (ep.at() === 4) showEnd(4);
})();

/* =========================================================================
   이야기 ④ 거꾸로 가는 물질
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep4", key: "ep4", name: "사건 파일 ④", onDone: finish });
  var KB = 8.617e-5;      /* eV/K */

  window.sthGate({
    gate: "g4", key: "semi1", title: "조사관의 첫 추리",
    question: "온도를 올리면 전기가 통하는 정도는 어떻게 될까요? <b>구리선</b>과 <b>저마늄</b>을 견주어 보세요.",
    options: [
      "㉠ 둘 다 더 잘 통하게 된다",
      "㉡ 둘 다 덜 통하게 된다",
      "㉢ 구리는 덜 통하게 되고, 저마늄은 더 잘 통하게 된다",
      "㉣ 구리는 더 잘 통하게 되고, 저마늄은 덜 통하게 된다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ------------------------------------------------ 장면 2 — 띠 간격 실험대 */
  (function () {
    var cv = $("d-band"), ctx = window.setupCanvas(cv);
    var gap = 1.1, T = 300, bT = 0, bPlay = !REDUCE;
    var got = window.sthState("dBand") || { a: false, b: false, c: false };
    function ratio() { return Math.exp(-gap / (2 * KB * T)); }
    function kind() { return gap < 0.3 ? 0 : (gap < 3.0 ? 1 : 2); }
    var KN = ["도체", "반도체", "절연체 (부도체)"];
    var KC = ["--teal", "--coral", "--violet"];
    var KE = ["구리 · 은 · 철 · 알루미늄", "저마늄 0.67 eV · 규소 1.12 eV", "다이아몬드 5.47 eV · 유리 · 고무"];

    function draw(quiet) {
      paper(ctx, 900, 420);
      var k = kind(), r = ratio(), i, t = bT / 1000;
      K.bigText(ctx, "띠 간격 " + gap.toFixed(1) + " eV · 온도 " + T + " K", 18, 34, 19, "#ffffff");

      /* 왼쪽 — 분류 */
      chip(ctx, 40, 52, 250, 150, KC[k]);
      text(ctx, "이 물질은", 56, 78, { s: 11, c: v("--mist") });
      text(ctx, KN[k], 56, 112, { s: 24, w: "900", c: v(KC[k]) });
      text(ctx, "보기", 56, 142, { s: 11, c: v("--mist") });
      text(ctx, KE[k], 56, 164, { s: 11.5, w: "800", c: v(KC[k]) });
      text(ctx, "0.3 eV 미만 도체 · 3.0 eV 이상 절연체", 56, 188, { s: 10.5, c: v("--mist") });

      /* 가운데 — 띠 */
      var bx = 320, bw = 320, vTop = 330, gpx = gap * 34;
      var cBot = vTop - gpx, cTop = cBot - 50;
      K.t(ctx, "에너지 ↑", bx - 8, cTop - 8 > 52 ? cTop - 8 : 52, { s: 10.5, a: "right", c: LT.mute });
      /* 원자가 띠: 전자로 꽉 찬 띠 */
      var vb = ctx.createLinearGradient(0, vTop, 0, vTop + 50);
      vb.addColorStop(0, "#91a7ff"); vb.addColorStop(1, "#4c6ef5");
      floorShadow(ctx, bx + bw / 2 + 8, vTop + 56, bw * .62, 9, .25);
      slab(ctx, bx, vTop, bw, 50, 16, "#bac8ff", vb, "#3b5bdb");
      for (i = 0; i < 30; i++) dot(ctx, bx + 12 + (i % 15) * 21.5 + Math.sin(t * 3 + i) * 1.2, vTop + 12 + Math.floor(i / 15) * 26, 2.2, "#4c6ef5", 2.2);
      pill(ctx, "원자가 띠 — 전자로 꽉 차 있다", bx + bw / 2, vTop + 31, { s: 11.5, a: "center", c: KS.ink });
      /* 전도띠 */
      var cb = ctx.createLinearGradient(0, cTop, 0, cTop + 50);
      cb.addColorStop(0, rgba(KC[k], .45)); cb.addColorStop(1, rgba(KC[k], .15));
      tile(ctx, bx, cTop, bw, 50, 16, K.tint(hexOf(v(KC[k])), 1.45));
      ctx.strokeStyle = rgba(KC[k], .6); ctx.lineWidth = 1.2; ctx.stroke();
      if (gpx > 6) {
        ctx.fillStyle = "rgba(20,30,60,.10)"; ctx.fillRect(bx, cBot, bw, gpx);
        ctx.strokeStyle = v(KC[k]); ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.strokeRect(bx, cBot, bw, gpx); ctx.setLineDash([]);
        pill(ctx, "띠 간격 " + gap.toFixed(1) + " eV", bx + bw / 2, cBot + gpx / 2 + 6, { s: 12.5, a: "center", c: v(KC[k]) });
      } else {
        pill(ctx, "띠가 거의 붙어 있다", bx + bw / 2, cBot + 8, { s: 12, a: "center", c: v(KC[k]) });
      }
      var nDot = clamp(Math.round(log10(Math.max(r, 1e-30)) + 13), 0, 12);
      for (i = 0; i < nDot; i++) {
        /* 건너뛴 전자는 전도띠 안을 떠돈다 */
        var ex = bx + 18 + ((i % 6) * 55 + t * (22 + i * 3)) % (bw - 36), ey = cTop + 14 + Math.floor(i / 6) * 22 + Math.sin(t * 2.4 + i * 1.3) * 3;
        dot(ctx, ex, ey, 4.5, "#f59f00", 3.2);
      }
      pill(ctx, "빛나는 노란 점 = 건너뛴 전자 (그림은 어림)", bx + bw / 2, 400, { s: 11, a: "center", c: KS.mute });

      /* 오른쪽 — 수치 */
      var ix = 670;
      text(ctx, "건너뛴 전자의 비율", ix, 78, { s: 12, w: "800" });
      text(ctx, "exp(−Eg / 2kBT)", ix, 98, { s: 10.5, c: v("--mist") });
      text(ctx, r > 1e-30 ? sci(r, 2) : "0에 가깝다", 880, 132, { s: 19, w: "900", a: "right", c: v(KC[k]) });
      var by = 150, bh = 20, bw2 = 210;
      var f = clamp((log10(Math.max(r, 1e-24)) + 24) / 24, 0, 1);
      meter(ctx, ix, by, bw2, bh, f, KC[k]);
      var mx = ix + bw2 * (log10(1e-6) + 24) / 24;
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(mx, by - 8); ctx.lineTo(mx, by + bh + 8); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "10⁻⁶", mx, by + bh + 22, { s: 10, w: "800", a: "center", c: v("--coral-700") });
      text(ctx, "10⁻²⁴", ix, by + bh + 22, { s: 10, c: v("--mist") });
      text(ctx, "1", ix + bw2, by + bh + 22, { s: 10, a: "right", c: v("--mist") });
      text(ctx, "온도 " + T + " K (" + (T - 273) + " ℃)", ix, 216, { s: 12, w: "800", c: v("--mist") });
      text(ctx, "온도를 올리면 건너뛰는 전자가", ix, 244, { s: 11, c: v("--mist") });
      text(ctx, "지수 함수로 늘어납니다", ix, 262, { s: 11, c: v("--mist") });

      mark(ctx, got.a, "도체 만들기", 40, 236, { s: 11.5 });
      mark(ctx, got.b, "절연체 만들기", 170, 236, { s: 11.5 });
      mark(ctx, got.c, "반도체를 데워 10⁻⁶ 넘기기", 40, 262, { s: 11.5 });

      if (quiet === true) return;
      $("d-band-info").innerHTML = "띠 간격 <b>" + gap.toFixed(1) + " eV</b> · 온도 <b>" + T + " K</b> · 이 물질은 <b style='color:var(" + KC[k] + ")'>" + KN[k] + "</b> · 건너뛴 전자 비율 <b>" + (r > 1e-30 ? sci(r, 2) : "0에 가까움") + "</b><br>" +
        (k === 0 ? "원자가 띠와 전도띠가 겹치거나 틈이 거의 없습니다. 전자가 언제든 움직일 수 있어 <b>온도와 상관없이</b> 전기가 잘 통합니다. 오히려 온도를 올리면 원자의 떨림이 커져 전자가 부딪히므로 저항이 조금 <b>커집니다</b>."
        : k === 1 ? "틈이 어중간해서, 상온에서는 아주 일부만 건너뜁니다. 그런데 온도를 올리면 건너뛰는 전자가 <b>지수 함수로</b> 늘어나 전기가 훨씬 잘 통하게 됩니다. 금속과 정반대입니다."
        : "틈이 너무 넓어 상온의 열에너지(약 0.026 eV)로는 아무도 건너뛰지 못합니다. 그래서 전기가 통하지 않습니다.");
    }
    function check() {
      var ch = false, r = ratio(), k = kind();
      if (k === 0 && !got.a) { got.a = true; ch = true; }
      if (k === 2 && !got.b) { got.b = true; ch = true; }
      if (k === 1 && r > 1e-6 && Math.exp(-gap / (2 * KB * 300)) <= 1e-6 && !got.c) { got.c = true; ch = true; }  /* 300 K 에서는 못 넘던 반도체를 온도로 넘긴 경우만 */
      if (ch) { window.sthState("dBand", got); mission(); }
    }
    function mission() {
      if (got.a) done("m4-2a");
      if (got.b) done("m4-2b");
      if (got.c) done("m4-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m4-2", true, "<span class='m-tag'>미션 완료</span>같은 식 하나로 <b>도체 · 반도체 · 절연체</b>가 갈렸습니다. 그리고 반도체만은 온도를 올릴수록 전기가 <b>더 잘</b> 통했습니다 — 금속과 반대입니다.");
        ep.clear(1);
      }
    }
    cv._redraw = draw;
    playBtn("d-band-play", "⏸ 전자 멈추기", "▶ 전자 움직이기", function () { return bPlay; }, function (q) { bPlay = q; });
    K.animate(cv, function (dt) { if (bPlay) { bT += dt; draw(true); } });
    $("d-gap").addEventListener("input", function (e) { gap = +e.target.value; $("d-gap-val").textContent = gap.toFixed(1); draw(); check(); });
    $("d-t").addEventListener("input", function (e) { T = +e.target.value; $("d-t-val").textContent = T + " K"; draw(); check(); });
    draw(); mission();
  })();

  /* ------------------------------------------------ 장면 3 — 도핑실 */
  (function () {
    var cv = $("d-dope"), ctx = window.setupCanvas(cv);
    var type = "pure", dop = 12, dT = 0, dPlay = !REDUCE;
    var got = window.sthState("dDope") || { a: false, b: false, c: false };
    var NI = 1.0e10;
    function N() { return Math.pow(10, dop); }
    function boost() { return type === "pure" ? 1 : (N() + NI) / NI; }

    function draw(quiet) {
      paper(ctx, 900, 420);
      var b = boost(), t = dT / 1000;
      /* 입체 규소 결정(5×5×2 공 격자) — 결합 막대 하나 = 전자 두 개. 바뀔 때만 숨은 캔버스에 다시 그린다 */
      var nd = type === "pure" ? 0 : 1 + Math.round((dop - 12) / 7 * 5);
      var DS = [[2, 2, 0], [0, 3, 0], [4, 1, 0], [1, 0, 0], [3, 4, 0], [4, 4, 0]].slice(0, nd);
      var hop = type === "p" ? Math.floor(t / 1.4) : 0;
      var LI = K.iso({ ox: 262, oy: 134, s: 0.84, L: 264, D: 264 }), SP = 66, ZH = 0, Z0 = 16;
      function dopAt(i, j, k) { for (var q = 0; q < DS.length; q++) if (DS[q][0] === i && DS[q][1] === j && DS[q][2] === k) return true; return false; }
      /* 양공 자리: 붕소마다 이웃 결합 하나가 전자 하나를 잃는다(시간에 따라 옆 결합으로 옮겨 감) */
      var NB = [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]];
      var holes = [];
      if (type === "p") DS.forEach(function (d, q) {
        var tries = 0, h = (hop + q * 2) % NB.length;
        while (tries < 4) {
          var nb = NB[(h + tries) % NB.length], ni = d[0] + nb[0], nj = d[1] + nb[1], nk = d[2] + nb[2];
          if (ni >= 0 && ni <= 4 && nj >= 0 && nj <= 4 && nk === 0) { holes.push([d[0], d[1], d[2], ni, nj, nk]); break; }
          tries++;
        }
      });
      function isHole(a, c) {
        for (var q = 0; q < holes.length; q++) {
          var h = holes[q];
          if ((h[0] === a[0] && h[1] === a[1] && h[2] === a[2] && h[3] === c[0] && h[4] === c[1] && h[5] === c[2]) ||
              (h[3] === a[0] && h[4] === a[1] && h[5] === a[2] && h[0] === c[0] && h[1] === c[1] && h[2] === c[2])) return true;
        }
        return false;
      }
      function WP(i, j, k) { return LI.P(i * SP, j * SP, Z0 + k * ZH); }
      var key = type + "|" + nd + "|" + hop;
      if (!cv._lat || cv._latKey !== key) {
        cv._latKey = key;
        var off = cv._lat || document.createElement("canvas");
        off.width = cv.width; off.height = cv.height;
        var oc = off.getContext("2d"); oc.setTransform(cv.width / 900, 0, 0, cv.width / 900, 0, 0);
        oc.clearRect(0, 0, 900, 420);
        floorShadow(oc, 268, 398, 250, 30, .3);
        /* 규소 결정 덩어리를 잘라 낸 블록 — 윗면에 원자 한 겹, 옆면에 아래 층들이 이어진다 */
        LI.box(oc, -33, -33, -44, 297, 297, 0, "#e9eef5", "#cdd5e2", "#aab4c6");
        /* 옆면: 아래 층 원자 줄이 비치는 단면 */
        [[-22, .42], [-38, .3]].forEach(function (zr) {
          var a1 = LI.P(-33, 297, zr[0]), a2 = LI.P(297, 297, zr[0]), a3 = LI.P(297, -33, zr[0]);
          oc.strokeStyle = "rgba(80,95,130," + zr[1] * .6 + ")"; oc.lineWidth = 1.5;
          oc.beginPath(); oc.moveTo(a1.x, a1.y); oc.lineTo(a2.x, a2.y); oc.lineTo(a3.x, a3.y); oc.stroke();
          for (var uu = 0; uu <= 264; uu += SP) {
            var pf = LI.P(uu, 297, zr[0]), pr = LI.P(297, uu, zr[0]);
            oc.fillStyle = "rgba(80,95,130," + zr[1] + ")"; oc.beginPath(); oc.ellipse(pf.x, pf.y, 6, 5, 0, 0, 6.2832); oc.fill();
            oc.fillStyle = "rgba(50,62,90," + zr[1] + ")"; oc.beginPath(); oc.ellipse(pr.x, pr.y, 6, 5, 0, 0, 6.2832); oc.fill();
          }
        });
        var items = [], i, j, k = 0;
        for (i = 0; i < 5; i++) for (j = 0; j < 5; j++) {
          items.push({ d: i * SP + j * SP + 0.5, at: [i, j, 0] });
          if (i < 4) items.push({ d: (i + .5) * SP + j * SP, bd: [[i, j, 0], [i + 1, j, 0]] });
          if (j < 4) items.push({ d: i * SP + (j + .5) * SP, bd: [[i, j, 0], [i, j + 1, 0]] });
        }
        items.sort(function (p, q) { return (p.at ? 1e4 : 0) + p.d - (q.at ? 1e4 : 0) - q.d; });
        items.forEach(function (it) {
          if (it.bd) {
            var a = WP.apply(null, it.bd[0]), c = WP.apply(null, it.bd[1]);
            oc.lineCap = "round";
            oc.strokeStyle = "rgba(70,90,130,.55)"; oc.lineWidth = 6; oc.beginPath(); oc.moveTo(a.x, a.y); oc.lineTo(c.x, c.y); oc.stroke();
            oc.strokeStyle = "rgba(225,232,245,.95)"; oc.lineWidth = 2.4; oc.beginPath(); oc.moveTo(a.x, a.y); oc.lineTo(c.x, c.y); oc.stroke();
            oc.lineCap = "butt";
            var hole = isHole(it.bd[0], it.bd[1]);
            [.4, .6].forEach(function (f, q) {
              var ex = a.x + (c.x - a.x) * f, ey = a.y + (c.y - a.y) * f;
              if (hole && q === 1) {
                oc.save(); oc.strokeStyle = "#7048e8"; oc.lineWidth = 2.4; oc.setLineDash([3, 2]); oc.beginPath(); oc.arc(ex, ey, 7, 0, 6.2832); oc.stroke(); oc.restore();
                K.t(oc, "+", ex, ey + 4.5, { s: 12, w: "900", a: "center", c: "#5f3dc4" });
              } else { K.planet(oc, ex, ey, 4.2, "#4c6ef5", "#1b2a7a"); }
            });
          } else {
            var p = WP.apply(null, it.at), dp = dopAt(it.at[0], it.at[1], it.at[2]);
            var c0 = dp ? (type === "n" ? "#12b886" : "#f76707") : "#9aa7bf", r = dp ? 22 : 19;
            K.planet(oc, p.x, p.y, r, c0, shade(c0, .38));
            K.t(oc, dp ? (type === "n" ? "P" : "B") : "Si", p.x + 1, p.y + 4.5, { s: dp ? 14 : 12, w: "900", a: "center", c: "#ffffff" });
          }
        });
        cv._lat = off;
      }
      ctx.drawImage(cv._lat, 0, 0, 900, 420);

      /* 떠도는 전자(n형) — 인 하나마다 남는 전자 하나 */
      if (type === "n") DS.forEach(function (d, q) {
        var ph = q * 1.7, wx = 132 + Math.sin(t * .8 + ph) * 118 + Math.sin(t * 2.1 + ph) * 12, wy = 132 + Math.cos(t * .62 + ph * 1.3) * 118, wz = Z0 + 26 + Math.sin(t * 1.3 + ph) * 10;
        var ep2 = LI.P(wx, wy, wz);
        dot(ctx, ep2.x, ep2.y, 7, "#f59f00", 3.2);
        K.t(ctx, "−", ep2.x, ep2.y + 4.5, { s: 13, w: "900", a: "center", c: "#3a2a00" });
      });

      K.bigText(ctx, type === "pure" ? "순수한 규소" : (type === "n" ? "인(P)을 섞은 규소 — n형" : "붕소(B)를 섞은 규소 — p형"), 18, 38, 24, "#ffffff");
      if (type === "n") pill(ctx, "주황 공 ⊖ = 남는 전자 · 결정 속을 떠돈다", 18, 66, { s: 12, c: v("--amber-700") });
      else if (type === "p") pill(ctx, "보라 점선 ⊕ = 전자가 빠진 자리(양공) · 옆으로 옮겨 간다", 18, 66, { s: 12, c: v("--violet-700") });
      else pill(ctx, "파란 점 두 개 = 결합 하나 · 원자가 전자 4개로 이웃 넷과 꽉 찬 결합", 18, 66, { s: 12, c: KS.mute });
      if (nd) K.warn(ctx, 18, 96, "⚠ 불순물 개수는 과장");

      /* 오른쪽 흰 판정 카드 */
      var cx0 = 520, cw0 = 362;
      K.card(ctx, cx0, 18, cw0, 384, "도핑 판정 · 1 cm³ 안의 전하 나르개");
      K.t(ctx, type === "pure" ? sci(NI, 1) + " 개" : sci(N(), 1) + " 개", cx0 + 18, 82, { s: 26, w: "900", c: type === "n" ? "#087f5b" : (type === "p" ? "#c2410c" : LT.blue) });
      K.row(ctx, "나르개", type === "pure" ? "열로 생긴 고유 전자뿐" : (type === "n" ? "⊖ 전자" : "⊕ 양공"), cx0 + 18, cx0 + cw0 - 18, 110);
      K.row(ctx, "섞은 불순물", type === "pure" ? "없음" : sci(N(), 1) + " 개/cm³", cx0 + 18, cx0 + cw0 - 18, 132);
      K.row(ctx, "순수한 규소에 견준 전도도", b < 10 ? b.toFixed(1) + " 배" : (b >= 1e6 ? sci(b, 1) + " 배" : Math.round(b).toLocaleString() + " 배"), cx0 + 18, cx0 + cw0 - 18, 156, b >= 1e6 ? LT.green : LT.ink);
      var bx0 = cx0 + 18, bw0 = cw0 - 36;
      K.bar(ctx, bx0, 170, bw0, clamp(log10(b) / 9, 0, 1), b >= 1e6 ? LT.green : LT.blue);
      var mx6 = bx0 + bw0 * 6 / 9;
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(mx6, 164); ctx.lineTo(mx6, 186); ctx.stroke(); ctx.setLineDash([]);
      K.t(ctx, "1배", bx0, 200, { s: 12, c: LT.mute });
      K.t(ctx, "100만 배", mx6, 200, { s: 12, w: "800", a: "center", c: LT.orange });
      K.t(ctx, "10억 배", bx0 + bw0, 200, { s: 12, a: "right", c: LT.mute });
      K.tip(ctx, type === "pure" ? "결합이 꽉 차 움직일 전자가 거의 없다" : (b >= 1e6 ? "아주 조금 섞어도 100만 배 넘게 통한다" : "섞는 양을 늘리면 나르개가 늘어난다"), bx0, 214, bw0, type === "pure" ? null : b >= 1e6);
      K.t(ctx, "규소 원자는 1 cm³ 에 5×10²² 개", bx0, 266, { s: 12, c: LT.mute });
      if (nd) K.t(ctx, "→ 실제 불순물은 원자 수천~수백억 개에 1개", bx0, 284, { s: 12, c: LT.mute });
      [[got.a, "인으로 100만 배 넘기기"], [got.b, "붕소로 p형 만들기"], [got.c, "순수한 규소 확인"]].forEach(function (m2, q) {
        K.t(ctx, (m2[0] ? "✔ " : "○ ") + m2[1], bx0, 318 + q * 26, { s: 13, w: "800", c: m2[0] ? LT.green : LT.mute });
      });
      if (quiet === true) return;
      $("d-dope-info").innerHTML = (type === "pure"
        ? "순수한 규소에서는 열에너지로 스스로 건너뛴 <b>고유 전자</b>(1 cm³ 당 약 10¹⁰ 개)만이 전류를 나릅니다. 구리(약 10²³ 개)와 견주면 터무니없이 적어, 사실상 잘 통하지 않습니다."
        : type === "n"
        ? "인은 원자가 전자가 <b>5개</b>입니다. 이웃 규소 넷과 결합하고도 전자가 <b>하나 남아</b> 자유롭게 돌아다닙니다. 음(negative) 전하가 나르개라서 <b>n형</b>이라고 합니다."
        : "붕소는 원자가 전자가 <b>3개</b>입니다. 결합을 채우기에 전자가 <b>하나 모자라</b> 빈자리(양공)가 생기고, 옆 전자가 그 자리로 옮겨 오면 빈자리가 반대로 움직입니다. 양(positive) 전하가 움직이는 셈이라 <b>p형</b>이라고 합니다.") +
        "<br>지금 전도도는 순수한 규소의 <b>" + (b < 10 ? b.toFixed(1) : (b >= 1e6 ? sci(b, 1) : Math.round(b).toLocaleString())) + " 배</b>입니다.";
    }
    function check() {
      var ch = false;
      if (type === "n" && boost() >= 1e6 && !got.a) { got.a = true; ch = true; }
      if (type === "p" && dop >= 14 && !got.b) { got.b = true; ch = true; }
      if (type === "pure" && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("dDope", got); mission(); }
    }
    function mission() {
      if (got.a) done("m4-3a");
      if (got.b) done("m4-3b");
      if (got.c) done("m4-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m4-3", true, "<span class='m-tag'>미션 완료</span>불순물을 아주 조금 넣는 것만으로 전도도가 <b>수백만 배</b> 뛰었습니다. 넣는 원소를 고르면 나르개가 <b>전자(n형)</b>가 될지 <b>양공(p형)</b>이 될지도 정할 수 있습니다.");
        ep.clear(2);
      }
    }
    cv._redraw = draw;
    playBtn("d-dope-play", "⏸ 나르개 멈추기", "▶ 나르개 움직이기", function () { return dPlay; }, function (q) { dPlay = q; });
    K.animate(cv, function (dt) { if (dPlay && type !== "pure") { dT += dt; draw(true); } });
    onSeg("d-type", function (b) { type = b.getAttribute("data-d"); draw(); check(); });
    $("d-dop").addEventListener("input", function (e) {
      dop = +e.target.value;
      $("d-dop-val").textContent = "10" + sup(dop === Math.round(dop) ? dop : dop.toFixed(1)) + "개";
      draw(); check();
    });
    draw(); mission();
  })();

  /* ------------------------------------------------ 장면 4 — 다이오드 */
  (function () {
    var cv = $("d-diode"), ctx = window.setupCanvas(cv);
    var V = 0, oT = 0, oPlay = !REDUCE;
    var got = window.sthState("dDio") || { a: false, b: false };
    var sorted = !!window.sthState("dSort"), qOK = !!window.sthState("dQ");
    var I0 = 1e-12, VT = 0.02585, R = 100;
    function cur(x) {
      if (x <= 0) return I0 * (Math.exp(Math.max(x, -2) / VT) - 1);
      var lo = 0, hi = x / R, m, i;
      for (i = 0; i < 60; i++) {
        m = (lo + hi) / 2;
        if (VT * Math.log(m / I0 + 1) + m * R - x > 0) hi = m; else lo = m;
      }
      return (lo + hi) / 2;
    }
    function draw(quiet) {
      paper(ctx, 900, 400);
      var I = cur(V), mA = I * 1000, fwd = V > 0, i, t = oT / 1000;
      K.bigText(ctx, "p-n 접합 다이오드 · 걸어 준 전압 " + V.toFixed(2) + " V", 18, 34, 19, "#ffffff");

      /* 접합 그림 — 순방향이면 양공과 전자가 접합면으로 밀려와 만나고, 역방향이면 가운데가 빈다 */
      var jx = 50, jy = 70, jw = 370, jh = 150, mid = jx + jw / 2;
      floorShadow(ctx, jx + jw / 2 + 10, jy + jh + 6, jw * .62, 12, .26);
      slab(ctx, jx - 16, jy + 14, 16, jh - 28, 10, "#f1f3f5", "#adb5bd", null);
      slab(ctx, jx, jy, jw / 2, jh, 20, "#ffd8c2", "rgba(0,0,0,0)", null);
      slab(ctx, mid, jy, jw / 2, jh, 20, "#b2f2e0", "rgba(0,0,0,0)", "#38b28f");
      slab(ctx, jx + jw, jy + 14, 16, jh - 28, 10, "#f1f3f5", "#adb5bd", "#868e96");
      var pg = ctx.createLinearGradient(jx, jy, jx, jy + jh); pg.addColorStop(0, "rgba(255,157,99,.32)"); pg.addColorStop(1, "rgba(160,80,40,.32)");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(jx, jy, jw / 2, jh, [10, 0, 0, 10]); ctx.fill();
      var ng = ctx.createLinearGradient(jx, jy, jx, jy + jh); ng.addColorStop(0, "rgba(46,211,189,.30)"); ng.addColorStop(1, "rgba(20,110,100,.30)");
      ctx.fillStyle = ng; ctx.beginPath(); ctx.roundRect(mid, jy, jw / 2, jh, [0, 10, 10, 0]); ctx.fill();
      /* 공핍층(나르개가 없는 띠) 폭: 역방향일수록 넓어지고 순방향일수록 좁아진다 */
      var dep = clamp(18 - V * 22, 4, 62);
      ctx.fillStyle = "rgba(20,30,60,.16)"; ctx.fillRect(mid - dep, jy, dep * 2, jh);
      ctx.strokeStyle = "rgba(40,60,110,.45)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(jx, jy, jw, jh, 10); ctx.stroke();
      ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mid, jy); ctx.lineTo(mid, jy + jh); ctx.stroke(); ctx.setLineDash([]);
      pill(ctx, "p형 — 양공 ⊕", jx + jw / 4, jy + 22, { s: 12, a: "center", c: v("--coral-700") });
      pill(ctx, "n형 — 전자 ⊖", jx + jw * 3 / 4, jy + 22, { s: 12, a: "center", c: v("--teal-700") });
      var on = mA >= 1, spd = on ? clamp(mA / 5, .2, 1) * 60 : 0;
      for (i = 0; i < 8; i++) {
        var row = Math.floor(i / 4), cc = i % 4, yy = jy + 62 + row * 44;
        /* 양공: 왼쪽에서 오른쪽으로, 전자: 오른쪽에서 왼쪽으로 */
        var span = jw / 2 - dep - 18, hxp = on ? jx + 12 + ((cc * span / 4 + t * spd) % span) : jx + 26 + cc * (jw / 2 - dep - 30) / 4;
        var exn = on ? mid + jw / 2 - 12 - ((cc * span / 4 + t * spd) % span) : mid + dep + 14 + cc * (jw / 2 - dep - 30) / 4;
        ctx.save(); ctx.shadowColor = v("--coral"); ctx.shadowBlur = 6; ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hxp, yy, 8, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        ball(ctx, exn, yy, 7.5, "--teal");
      }
      if (on) dot(ctx, mid, jy + jh / 2 + Math.sin(t * 7) * 30, 5, "#fab005", 3.4);
      if (on || V < 0) K.arrow(ctx, fwd ? { x: jx + 40, y: jy + jh + 28 } : { x: jx + jw - 40, y: jy + jh + 28 }, fwd ? { x: jx + jw - 40, y: jy + jh + 28 } : { x: jx + 40, y: jy + jh + 28 }, v(on ? "--green" : "--mist"), 3, 13);
      pill(ctx, V === 0 ? "전압 없음" : (fwd ? (on ? "순방향 — 전류가 흐른다" : "순방향이지만 전압이 모자라다") : "역방향 — 막힌다"),
        jx + jw / 2, jy + jh + 58, { s: 13, a: "center", c: v(on ? "--green-700" : "--mist") });
      text(ctx, Math.abs(mA) >= 0.001 ? "전류 " + mA.toFixed(3) + " mA" : "전류 " + sci(I, 1) + " A (거의 0)",
        jx + jw / 2, jy + jh + 84, { s: 13, w: "800", a: "center", c: v("--ink") });

      /* I-V 곡선 */
      pill(ctx, "전압 – 전류 곡선 · 한쪽으로만 흐른다", 500, 52, { s: 12, c: KS.blue });
      var g = K.chart(ctx, { light: true, x: 460, y: 62, w: 420, h: 248, pl: 44, x0: -2, x1: 1, y0: 0, y1: 5, xt: 3, yt: 5,
        xf: function (q) { return (q > 0 ? "+" : (q < 0 ? "−" : "")) + Math.abs(Math.round(q)) + " V"; }, yf: function (q) { return Math.round(q) + " mA"; } });
      K.line(ctx, { x: g.X(0), y: g.T }, { x: g.X(0), y: g.B }, "rgba(40,60,110,.4)", 1.2);
      K.line(ctx, { x: g.L, y: g.Y(1) }, { x: g.R, y: g.Y(1) }, KS.orange, 1.4, [4, 4]);
      pill(ctx, "1 mA", g.L + 8, g.Y(1) - 6, { s: 10.5, c: KS.orange });
      var pts = [];
      for (i = 0; i <= 120; i++) { var vv = -2 + i / 120 * 3; pts.push([vv, clamp(cur(vv) * 1000, 0, 5)]); }
      K.plot(ctx, g, pts, LT.blue, { light: true });
      dot(ctx, g.X(V), g.Y(clamp(mA, 0, 5)), 5.5, "--coral", 3.4);

      mark(ctx, got.a, "순방향 1 mA 넘기기", 50, 332, { s: 11.5 });
      mark(ctx, got.b, "역방향에서 막히는 것 확인", 250, 332, { s: 11.5 });
      text(ctx, "이 문 하나가 LED · 태양 전지 · 트랜지스터의 바탕입니다", 870, 332, { s: 11, a: "right", c: v("--mist") });
      text(ctx, "순방향으로 약 0.6 V를 넘겨야 전류가 눈에 띄게 흐르기 시작합니다.", 50, 366, { s: 11.5, c: v("--mist") });

      if (quiet === true) return;
      $("d-diode-info").innerHTML = "전압 <b>" + V.toFixed(2) + " V</b> · 전류 <b>" + (Math.abs(mA) >= 0.001 ? mA.toFixed(3) + " mA" : sci(I, 1) + " A") + "</b><br>" +
        (V > 0
          ? "p형 쪽에 ＋, n형 쪽에 －를 건 <b>순방향</b>입니다. 양공과 전자가 접합면으로 서로 밀려와 만나면서 전류가 흐릅니다. 다만 접합면의 장벽을 넘어야 해서, 약 <b>0.6 V</b>를 넘기기 전에는 전류가 거의 흐르지 않습니다."
          : V < 0
          ? "반대로 건 <b>역방향</b>입니다. 양공과 전자가 접합면에서 서로 <b>멀어져</b> 가운데가 텅 비므로 전류가 거의 흐르지 않습니다. 지금 전류는 " + sci(Math.abs(I), 1) + " A, 순방향의 10억 분의 1도 되지 않습니다."
          : "전압이 0이라 전류도 0입니다. 슬라이더를 오른쪽(순방향)과 왼쪽(역방향)으로 움직여 견주어 보세요.");
    }
    function check() {
      var I = cur(V), ch = false;
      if (I * 1000 >= 1 && !got.a) { got.a = true; ch = true; }
      if (V <= -0.5 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("dDio", got); mission(); }
    }
    function mission() {
      if (got.a) done("m4-4a");
      if (got.b) done("m4-4b");
      if (sorted) done("m4-4c");
      if (qOK) done("m4-4d");
      if (got.a && got.b && sorted && qOK) {
        window.sthMission("m4-4", true, "<span class='m-tag'>미션 완료</span>다이오드는 전류를 <b>한쪽으로만</b> 흘렸습니다. 전기적 성질을 구분하는 데서 나아가 <b>원하는 대로 설계하는</b> 단계에 온 것입니다.");
        ep.clear(3);
      }
    }
    cv._redraw = draw;
    /* 전류가 흐를 때만 나르개가 움직인다 */
    playBtn("d-diode-play", "⏸ 나르개 멈추기", "▶ 나르개 움직이기", function () { return oPlay; }, function (q) { oPlay = q; });
    K.animate(cv, function (dt) { if (oPlay && cur(V) * 1000 >= 1) { oT += dt; draw(true); } });
    $("d-v").addEventListener("input", function (e) { V = +e.target.value; $("d-v-val").textContent = V.toFixed(2) + " V"; draw(); check(); });
    window.sthSort({
      mount: "s4-sort",
      buckets: [
        { id: "cond", label: "도체", sub: "전기가 잘 통한다" },
        { id: "semi", label: "반도체", sub: "그 중간 · 조절할 수 있다" },
        { id: "ins", label: "절연체 (부도체)", sub: "전기가 통하지 않는다" }
      ],
      items: [
        { t: "구리", a: "cond", why: "자유 전자가 많아 전선에 씁니다. 비저항 1.7×10⁻⁸ Ω·m." },
        { t: "은", a: "cond", why: "금속 가운데 전기가 가장 잘 통합니다." },
        { t: "철", a: "cond", why: "금속이므로 자유 전자가 전류를 나릅니다." },
        { t: "규소 (Si)", a: "semi", why: "띠 간격 1.12 eV. 오늘날 거의 모든 반도체 칩의 재료입니다.", hint: "구리와 유리 사이 어디쯤일까요?" },
        { t: "저마늄 (Ge)", a: "semi", why: "띠 간격 0.67 eV. 1947년 첫 트랜지스터의 재료였습니다." },
        { t: "고무", a: "ins", why: "전선의 껍질에 씁니다. 전류가 새어 나가지 않게 막습니다." },
        { t: "유리", a: "ins", why: "띠 간격이 매우 넓어 상온에서는 전자가 건너뛰지 못합니다." },
        { t: "다이아몬드", a: "ins", why: "띠 간격 5.47 eV. 탄소로만 되어 있어도 전기는 통하지 않습니다. 같은 탄소인 흑연은 잘 통한다는 점과 견주어 보세요.", hint: "띠 간격이 3.0 eV를 넘으면 어디로 갈까요?" },
        { t: "고체 소금", a: "ins", why: "이온이 제자리에 묶여 있어 통하지 않습니다. 녹이면 통한다는 것은 이야기 ②에서 확인했습니다.", hint: "‘고체’ 상태라는 데 주의하세요." }
      ],
      doneText: "전기적 성질로 물질을 세 무리로 갈랐습니다.",
      onDone: function () { sorted = true; window.sthState("dSort", 1); mission(); }
    });
    window.sthPick({
      mount: "s4-q",
      q: "물질의 전기적 성질을 이용한 소재에 대한 설명으로 옳은 것은?",
      options: [
        "초전도체는 온도를 아주 <b>높이면</b> 저항이 0이 된다",
        "초전도체는 어떤 온도 <b>아래</b>에서 저항이 0이 되어, MRI의 강한 전자석에 쓰인다",
        "그래핀은 전기가 통하지 않아 절연체로 쓰인다",
        "반도체는 불순물을 넣으면 전기가 더 <b>안</b> 통하게 된다"
      ],
      answer: 1,
      why: [
        "반대입니다. 초전도 현상은 임계 온도 <b>아래로</b> 식혔을 때 나타납니다.",
        "저항이 0이면 전류가 흘러도 열이 나지 않아, 아주 센 전류를 계속 흘릴 수 있습니다. 그래서 MRI나 입자 가속기의 전자석에 씁니다.",
        "그래핀은 탄소 원자가 육각형으로 한 겹 깔린 구조로, 전기가 <b>아주 잘</b> 통하면서도 얇고 잘 휘어집니다.",
        "직접 확인했듯이 도핑을 하면 전도도가 <b>수백만 배</b> 커집니다. 반도체가 쓸모 있어진 결정적인 까닭입니다."
      ],
      onDone: function () { qOK = true; window.sthState("dQ", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 */
  function finish() { window.sthState("r4", "해결 · 반도체는 온도와 불순물로 전기적 성질을 설계할 수 있다 — 다이오드는 한쪽으로만"); }
  function showEnd(i) {
    if (i !== 4) return;
    var p = window.sthState("semi1") || "";
    $("e4-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0 ? "정확했습니다. 이제 그 까닭이 <b>띠 간격</b>에 있다는 것까지 설명할 수 있게 되었습니다."
        : "정답은 ㉢ 입니다. 금속은 온도가 오르면 원자의 떨림이 커져 저항이 커지지만, 반도체는 건너뛰는 전자가 지수 함수로 늘어나 전기가 <b>더 잘</b> 통합니다.");
    ep.clear(4);
  }
  ep.onShow(showEnd);
  window.sthWork({
    mount: "wk4", unitLabel: "[통합과학1 Ⅱ-2] 이야기 ④ 거꾸로 가는 물질",
    items: [
      { id: "wE", label: "도체 · 반도체 · 절연체의 차이", hint: "‘띠 간격’이라는 말을 넣어 셋을 구분하고, 온도를 올렸을 때 도체와 반도체가 서로 반대로 행동하는 까닭을 쓰세요." },
      { id: "wF", label: "반도체가 세상을 바꾼 까닭", hint: "도핑(n형 · p형)과 다이오드를 예로 들어, ‘성질을 골라 설계할 수 있다’는 것이 왜 중요한지 쓰세요." }
    ]
  });
  if (ep.at() === 4) showEnd(4);
})();

/* ========================================================================= 05 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅱ-2] 물질의 규칙성과 성질 — 정리",
  recap: [
    { key: "r1", label: "① 빈칸이 있는 표" },
    { key: "r2", label: "② 녹이면 통한다" },
    { key: "r3", label: "③ 같은 부품, 다른 물건" },
    { key: "r4", label: "④ 거꾸로 가는 물질" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "네 사건을 꿰는 한 문장", hint: "원자가 전자의 되풀이 → 결합 → 단위체를 잇는 방식 → 전기적 성질. 네 이야기를 ‘물질의 성질은 …에서 나온다’로 이어지는 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 06 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-2-2", unitLabel: "[통합과학1 Ⅱ-2] 물질의 규칙성과 성질",
  rows: [
    { key: "r1", label: "① 빈칸이 있는 표" },
    { key: "r2", label: "② 녹이면 통한다" },
    { key: "r3", label: "③ 같은 부품, 다른 물건" },
    { key: "r4", label: "④ 거꾸로 가는 물질" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
