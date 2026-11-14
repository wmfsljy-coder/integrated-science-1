/* 통합과학1 Ⅲ-2 역학 시스템 — 소단원별 이야기 세 편
   01 피사에서 달까지 / 02 엘리베이터 저울 / 03 충돌 실험실
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is1-3-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
var G = 9.8;
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KS = K.C, REDUCE = K.REDUCE;
/* 캔버스마다 무대 종류와 별 씨앗 */
var STAGE = {
  "c-vac": ["lab", 3], "c-fall": ["lab", 5], "c-proj": ["sky", 7], "c-cannon": ["space", 9],
  "c-elev": ["lab", 21], "c-fma": ["lab", 23], "c-gr": ["lab", 25], "c-push": ["lab", 27],
  "c-cart": ["lab", 31], "c-catch": ["lab", 33], "c-crush": ["lab", 35]
};
function paper(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  var s = STAGE[ctx.canvas.id] || ["night", 7];
  K.stage(ctx, 0, 0, W, H, s[0], { seed: s[1] });
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
function pill(ctx, s, x, y, o) { o = o || {}; return K.pill(ctx, s, x, y, { a: o.a, s: o.s, w: o.w, c: col(o.c), box: o.box, bg: o.bg, line: o.line }); }
/* 입체 공(원자·이온·입자) */
function ball(ctx, x, y, r, c) { var b = col(c); K.planet(ctx, x, y, r, b, shade(b, .38)); }
/* 빛나는 점(전자·불꽃) */
function dot(ctx, x, y, r, c, halo) { K.glow(ctx, x, y, r, rgba(c, .95), halo || 3); }
/* 유리판 상자 */
function glass(ctx, x, y, w, h, c, r) {
  var g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, rgba(c || "--brand", .20)); g.addColorStop(1, rgba(c || "--brand", .05));
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 12 : r); ctx.fill();
  ctx.strokeStyle = rgba(c || "--brand", .38); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 12 : r); ctx.stroke();
}
/* 빛나는 막대 눈금 */
function meter(ctx, x, y, w, h, f, c) {
  ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = "rgba(200,210,255,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.stroke();
  f = clamp(f, 0, 1); if (f <= 0) return;
  var g = ctx.createLinearGradient(x, 0, x + w * f, 0);
  g.addColorStop(0, shade(c, .55)); g.addColorStop(1, col(c));
  ctx.save(); ctx.shadowColor = col(c); ctx.shadowBlur = 10; ctx.fillStyle = g;
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
function axes(ctx, x0, y0, x1, y1) {
  ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
}
/* setTimeout 기반 애니메이션. 새로 부르면 앞의 것은 저절로 멈춘다(버튼을 잠그지 않는다). */
function ticker(box) {
  return function (steps, ms, onStep) {
    var my = ++box.gen, i = 0;
    (function step() {
      if (my !== box.gen) return;
      onStep(i / steps);
      if (i++ < steps) window.setTimeout(step, ms);
    })();
  };
}

/* ---- 밝은 스튜디오 + 입체 미니어처 (../assets/kit.js 의 K.studio · K.iso · K.card) ---- */
var LT = K.LT;
function lt(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function sideCard(ctx, x, W, H, title) { K.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
function tag(ctx, s, x, y, c, a) { return K.pill(ctx, s, x, y, { s: 11.5, a: a, c: c || LT.ink, bg: "rgba(255,255,255,.9)", line: "rgba(20,40,90,.18)" }); }
function lWrap(ctx, s, x, y, maxW, lh, o) {
  o = o || {}; ctx.font = (o.w || "600") + " " + (o.s || 11) + "px " + FONT;
  var line = "", n = 0, i;
  for (i = 0; i < s.length; i++) { var t = line + s.charAt(i); if (ctx.measureText(t).width > maxW && line.length) { lt(ctx, line, x, y + n * lh, { s: o.s || 11, w: o.w || "600", c: o.c || LT.mute }); n++; line = s.charAt(i); } else line = t; }
  if (line) { lt(ctx, line, x, y + n * lh, { s: o.s || 11, w: o.w || "600", c: o.c || LT.mute }); n++; }
  return n;
}
function floorSh(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function metalG(ctx, x0, y0, x1, y1) { var g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, "#f6f8fb"); g.addColorStop(.5, "#aab3c3"); g.addColorStop(1, "#5b6476"); return g; }
/* 서 있는 사람(화면 좌표, 발 위치 x·y, 키 h px) */
function figure(ctx, x, y, h, col, face) {
  var u = h / 10;
  floorSh(ctx, x + u * .4, y + u * .2, u * 2.6, u * .7, .25);
  ctx.fillStyle = "#2b2f3a"; ctx.beginPath(); ctx.roundRect(x - u * 1.1, y - u * 4.2, u * .9, u * 4.2, u * .4); ctx.fill(); ctx.beginPath(); ctx.roundRect(x + u * .2, y - u * 4.2, u * .9, u * 4.2, u * .4); ctx.fill();
  var bg = ctx.createLinearGradient(x - u * 1.6, 0, x + u * 1.6, 0); bg.addColorStop(0, K.tint(col, 1.15)); bg.addColorStop(1, K.tint(col, .7));
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - u * 1.6, y - u * 8, u * 3.2, u * 4.2, u * .9); ctx.fill();
  ctx.fillStyle = K.tint(col, .8); ctx.beginPath(); ctx.roundRect(x - u * 2.1, y - u * 7.6, u * .7, u * 3.4, u * .35); ctx.fill(); ctx.beginPath(); ctx.roundRect(x + u * 1.4, y - u * 7.6, u * .7, u * 3.4, u * .35); ctx.fill();
  K.planet(ctx, x, y - u * 9, u * 1.2, "#f6cfae", "#b9845e");
  ctx.fillStyle = "#3a2a20"; ctx.beginPath(); ctx.arc(x, y - u * 9.2, u * 1.22, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
}
/* 앞에서 비스듬히 내려다본 판(바닥·레일): 윗면 + 앞면 + 오른쪽 옆면 */
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * .55); ctx.lineTo(x + w + d, y - d * .55); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * .55); ctx.lineTo(x + w + d, y + h - d * .55); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
/* 비스듬한 상자(수레·로봇·짐): 앞면 x..x+w, 바닥 y, 높이 h, 깊이 d */
function box3(ctx, x, y, w, h, d, col) {
  ctx.fillStyle = K.tint(col, 1.18); ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + d, y - h - d * .55); ctx.lineTo(x + w + d, y - h - d * .55); ctx.lineTo(x + w, y - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = K.tint(col, .72); ctx.beginPath(); ctx.moveTo(x + w, y - h); ctx.lineTo(x + w + d, y - h - d * .55); ctx.lineTo(x + w + d, y - d * .55); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  var g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, K.tint(col, 1.02)); g.addColorStop(1, K.tint(col, .85)); ctx.fillStyle = g; ctx.fillRect(x, y - h, w, h);
}
function wheel(ctx, x, y, r) { K.planet(ctx, x, y, r, "#6b7484", "#1f232b"); ctx.fillStyle = "#c9d0da"; ctx.beginPath(); ctx.arc(x, y, r * .38, 0, 6.2832); ctx.fill(); }
/* =========================================================================
   이야기 ① 피사에서 달까지
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 */
  window.sthGate({
    gate: "g1", key: "p1", title: "조사관의 첫 추리",
    question: "쇠공과 깃털을 같은 높이에서 동시에 놓습니다. <b>공기를 모두 빼낸</b> 통 안이라면 어떻게 될까요?",
    options: ["㉠ 무거운 쇠공이 먼저 닿는다", "㉡ 둘이 똑같이 떨어져 동시에 닿는다", "㉢ 깃털이 한참 떠 있다가 천천히 닿는다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 진공 통 (공기 저항: 종단 속도 모형) ------------------------- */
  (function () {
    var canvas = $("c-vac"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var H0 = 5.0, VB = 93, VF = 1.26;            // 1기압에서의 종단 속도(m/s)
    var air = 60, got = window.sthState("vacGot") || { a: false, b: false };
    var last = null, shown = { b: 0, f: 0 }, box = { gen: 0 }, run = ticker(box), vT = 0;

    function fallTime(base, f) {
      if (f <= 0) return Math.sqrt(2 * H0 / G);
      var V = base / Math.sqrt(f), x = Math.exp(H0 * G / (V * V));
      return (V / G) * Math.log(x + Math.sqrt(x * x - 1));
    }
    function dropped(base, f, t) {                // t초 동안 떨어진 거리(m)
      if (f <= 0) return 0.5 * G * t * t;
      var V = base / Math.sqrt(f);
      return Math.min(H0, (V * V / G) * Math.log(Math.cosh(G * t / V)));
    }
    /* 입체 미니어처: 스튜디오 바닥 위의 높이 5 m 유리 진공 통(금속 뚜껑·받침)과 공기 펌프.
       떨어뜨리면 같은 시간 간격의 잔상이 남는다(쇠공·깃털). 공기가 많을수록 통 안이 뿌옇고 공기 알갱이가 많다. */
    var LWv = 560;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var f = air / 100, top = 64, bot = 330, cx = 270, rx = 120, ry = 20, i, t = vT / 1000;
      var tb = fallTime(VB, f), tf = fallTime(VF, f), dd = tf - tb;
      K.studio(ctx, 0, 0, LWv, H, null);
      floorSh(ctx, cx + 20, bot + 22, 220, 26, .3);
      /* 펌프와 호스 */
      floorSh(ctx, 80, bot + 22, 60, 10, .25);
      ctx.fillStyle = "#3f6fb5"; ctx.beginPath(); ctx.roundRect(36, bot - 34, 84, 54, 10); ctx.fill();
      ctx.fillStyle = "#5b8ad0"; ctx.beginPath(); ctx.roundRect(40, bot - 30, 76, 18, 8); ctx.fill();
      ctx.fillStyle = "#26324a"; for (i = 0; i < 4; i++) ctx.fillRect(46 + i * 7, bot - 6, 4, 20);
      ctx.strokeStyle = "#4a5266"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(100, bot - 34); ctx.bezierCurveTo(100, 20, 210, 24, cx - 40, top - 16); ctx.stroke(); ctx.lineCap = "butt";
      tag(ctx, "공기 펌프", 78, bot + 44, LT.blue, "center");
      /* 받침 */
      ctx.fillStyle = "#7d8698"; ctx.beginPath(); ctx.ellipse(cx, bot + 12, rx + 14, ry + 6, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = metalG(ctx, cx - rx, 0, cx + rx, 0); ctx.fillRect(cx - rx - 14, bot - 2, 2 * rx + 28, 14);
      ctx.fillStyle = "#e3e8ef"; ctx.beginPath(); ctx.ellipse(cx, bot - 2, rx + 14, ry + 6, 0, 0, 6.2832); ctx.fill();
      /* 유리 통 안 — 공기 */
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx - rx, top); ctx.lineTo(cx - rx, bot); ctx.ellipse(cx, bot, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, top); ctx.ellipse(cx, top, rx, ry, 0, 0, Math.PI, true); ctx.closePath(); ctx.clip();
      ctx.fillStyle = "rgba(170,205,235," + (0.08 + 0.3 * f).toFixed(2) + ")"; ctx.fillRect(cx - rx, top - ry, 2 * rx, bot - top + 2 * ry);
      var RA = K.rng(9), na = Math.round(110 * f);
      for (var q = 0; q < na; q++) { var ax = cx - rx + 6 + RA() * (2 * rx - 12) + Math.sin(vT / 300 + q) * 3, ay = top + 6 + RA() * (bot - top - 12) + Math.cos(vT / 340 + q * 1.3) * 3; ctx.fillStyle = "rgba(60,110,180,.45)"; ctx.beginPath(); ctx.arc(ax, ay, 1.5, 0, 6.2832); ctx.fill(); }
      /* 눈금 */
      for (var k2 = 0; k2 <= 5; k2++) { var gy = top + 12 + (bot - top - 26) * k2 / 5; ctx.strokeStyle = "rgba(20,40,90,.5)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx + rx - 18, gy); ctx.lineTo(cx + rx - 4, gy); ctx.stroke(); lt(ctx, (5 - k2) + " m", cx + rx - 22, gy + 4, { s: 10, a: "right", c: LT.mute }); }
      /* 잔상(같은 시간 간격) + 지금 위치 */
      function yOf(frac) { return top + 30 + (bot - top - 44) * clamp(frac, 0, 1); }
      function ballAt(y, al) { ctx.globalAlpha = al; K.planet(ctx, cx - 44, y, 13, "#dfe5ee", "#3b4252"); ctx.globalAlpha = 1; }
      function featherAt(y, al) {
        ctx.save(); ctx.globalAlpha = al; ctx.translate(cx + 40, y); ctx.rotate(.5 + (f > 0 && al === 1 && shown.f < 1 ? Math.sin(vT / 160) * .25 : 0));
        var fg = ctx.createLinearGradient(-6, 0, 6, 0); fg.addColorStop(0, "#fffaf0"); fg.addColorStop(1, "#e2c48a");
        ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#8a6a30"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 19); ctx.stroke(); ctx.restore();
      }
      if (t > 0) for (i = 1; i < 6; i++) { var ti = t * i / 6; ballAt(yOf(dropped(VB, f, ti) / H0), .25); featherAt(yOf(dropped(VF, f, ti) / H0), .25); }
      ballAt(yOf(shown.b), 1); featherAt(yOf(shown.f), 1);
      ctx.restore();
      /* 유리 테두리·반사 */
      ctx.strokeStyle = "rgba(90,120,160,.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - rx, top); ctx.lineTo(cx - rx, bot); ctx.moveTo(cx + rx, top); ctx.lineTo(cx + rx, bot); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, bot, rx, ry, 0, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(cx - rx + 10, top + 6, 7, bot - top - 12);
      /* 뚜껑 */
      ctx.fillStyle = metalG(ctx, cx - rx, 0, cx + rx, 0); ctx.fillRect(cx - rx - 8, top - 14, 2 * rx + 16, 14);
      ctx.fillStyle = "#eef1f6"; ctx.beginPath(); ctx.ellipse(cx, top - 14, rx + 8, ry, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#9aa3b0"; ctx.beginPath(); ctx.ellipse(cx - 40, top - 16, 9, 4, 0, 0, 6.2832); ctx.fill();
      tag(ctx, "● 왼쪽: 쇠공 0.5 kg", 18, 108, LT.ink); tag(ctx, "● 오른쪽: 깃털 1 g", 18, 134, LT.orange);
      K.bigText(ctx, f === 0 ? "진공" : "공기 " + air + "%", 18, 46, 26, f === 0 ? "#8ff0c4" : "#ffffff");
      K.bigText(ctx, last ? "도착 차이 " + (last.tf - last.tb).toFixed(2) + "초" : "떨어뜨려 보세요", 18, 76, 16, "#ffd35a");
      K.warn(ctx, LWv - 14, H - 14, "⚠ 통·물체 크기는 보기 쉽게 바꾼 것", "right");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWv + 10, W, H, "실험 기록 (지금 공기 " + air + "%)");
      lt(ctx, dd.toFixed(2) + " 초", cd.px, 64, { s: 24, w: "900", c: dd <= .05 ? LT.green : LT.orange });
      lt(ctx, "깃털이 늦게 닿는 시간", cd.R, 64, { s: 11.5, a: "right", c: LT.mute });
      K.row(ctx, "쇠공의 종단 속도", f === 0 ? "없음" : (VB / Math.sqrt(f)).toFixed(0) + " m/s", cd.px, cd.R, 100);
      K.row(ctx, "깃털의 종단 속도", f === 0 ? "없음" : (VF / Math.sqrt(f)).toFixed(1) + " m/s", cd.px, cd.R, 124);
      K.row(ctx, "쇠공이 닿는 시각", tb.toFixed(2) + " 초", cd.px, cd.R, 160, LT.ink);
      K.bar(ctx, cd.px, 168, cd.w, tb / Math.max(tb, tf, 1.2), "#7d8698");
      K.row(ctx, "깃털이 닿는 시각", tf.toFixed(2) + " 초", cd.px, cd.R, 202, LT.orange);
      K.bar(ctx, cd.px, 210, cd.w, tf / Math.max(tb, tf, 1.2), LT.orange);
      K.tip(ctx, dd <= .05 ? "동시에 닿습니다 — 공기 저항이 범인" : (dd >= 2.5 ? "깃털이 한참 늦습니다 (공기 저항)" : "공기의 양을 바꿔 보세요"), cd.px - 4, 236, cd.w + 8, dd <= .05 ? true : (dd >= 2.5 ? true : null));
      lWrap(ctx, "빨라질수록 공기 저항이 커져 결국 일정한 속도(종단 속도)로 떨어집니다.", cd.px, 300, cd.w, 16);
    }
    canvas._redraw = draw;

    function say() {
      if (!last) { $("a-vac-info").innerHTML = "공기의 양을 정하고 버튼을 눌러 떨어뜨려 보세요."; return; }
      var d = last.tf - last.tb;
      $("a-vac-info").innerHTML = "공기 <b>" + last.air + "%</b> · 쇠공 <b>" + last.tb.toFixed(2) + "초</b>, 깃털 <b>" + last.tf.toFixed(2) + "초</b> → 차이 <b>" + d.toFixed(2) + "초</b>. " +
        (d <= 0.05 ? "🎉 공기가 없으니 <b>질량이 달라도 똑같이</b> 떨어집니다. 갈릴레이가 옳았습니다."
          : (d < 1 ? "공기가 조금만 있어도 깃털이 눈에 띄게 늦어집니다. 더 빼 보세요." :
            "깃털은 금세 종단 속도에 이르러 천천히 내려옵니다. 공기의 양을 줄여 보세요."));
    }
    function mission() {
      if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.a && got.b) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>범인은 무게가 아니라 <b>공기 저항</b>이었습니다. 공기를 빼면 0.5 kg 쇠공과 1 g 깃털이 <b>같은 시각</b>에 바닥에 닿습니다.");
        ep.clear(1);
      }
    }
    $("a-air").addEventListener("input", function (e) {
      air = +e.target.value; $("a-air-val").textContent = air + "%"; draw();
    });
    $("a-drop").addEventListener("click", function () {
      var f = air / 100, tb = fallTime(VB, f), tf = fallTime(VF, f), d = Math.abs(tf - tb), ch = false;
      last = { air: air, tb: tb, tf: tf };
      if (d <= 0.05 && !got.a) { got.a = true; ch = true; }
      if (d >= 2.5 && !got.b) { got.b = true; ch = true; }
      if (ch) window.sthState("vacGot", got);
      say(); mission();
      var T = Math.max(tb, tf), N = 44;
      run(N, 28, function (u) {                      // 실제 시간 약 1.2초로 압축해 보여 준다
        var t = u * T;
        shown.b = dropped(VB, f, t) / H0; shown.f = dropped(VF, f, t) / H0;
        vT = t * 1000; draw();
      });
    });
    shown.b = shown.f = 0;
    $("a-air-val").textContent = air + "%";
    draw(); say(); mission();
  })();

  /* 장면 3 — 낙하 계산기 ------------------------------------------------- */
  (function () {
    var canvas = $("c-fall"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var g = 9.80, pname = "지구", h = 10;
    var got = window.sthState("fallGot") || { a: false, b: false };

    /* 입체 미니어처: 천체 표면을 잘라 낸 바닥 블록 위에 높이 h 의 눈금 기둥을 세우고, 같은 시간 간격으로 찍은 공의 잔상(스트로브). */
    var LWf = 560, GROUND = { "지구": ["#7ab04e", "#8a6a4c"], "달": ["#c9ccd2", "#8d9099"], "화성": ["#c8743f", "#8a4a2a"], "목성": ["#e0c08a", "#a8865a"] };
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = Math.sqrt(2 * h / g), vEnd = g * t, top = 100, bot = 318, px = 330, i, gc = GROUND[pname] || GROUND["지구"];
      K.studio(ctx, 0, 0, LWf, H, null);
      floorSh(ctx, 340, bot + 30, 220, 26, .3);
      /* 천체 표면 블록 */
      slab(ctx, 150, bot, 350, 30, 46, gc[0], gc[1], K.tint(gc[1], .75));
      if (pname === "달") { ctx.fillStyle = "rgba(90,95,105,.35)"; [[230, -10], [410, -18], [320, -6]].forEach(function (c) { ctx.beginPath(); ctx.ellipse(c[0], bot + c[1], 14, 4, 0, 0, 6.2832); ctx.fill(); }); }
      /* 눈금 기둥 */
      ctx.fillStyle = metalG(ctx, 256, 0, 276, 0); ctx.fillRect(256, top - 20, 18, bot - top + 20);
      ctx.fillStyle = "#e9c46a"; ctx.fillRect(276, top, 16, bot - top);
      ctx.strokeStyle = "rgba(60,40,10,.8)"; ctx.lineWidth = 1;
      for (var mk = 0; mk <= 20; mk++) { var ry2 = top + (bot - top - 12) * mk / 20; ctx.beginPath(); ctx.moveTo(292, ry2); ctx.lineTo(mk % 5 ? 286 : 280, ry2); ctx.stroke(); }
      ctx.fillStyle = "#5b6476"; ctx.fillRect(256, top - 24, 90, 8);
      lt(ctx, "0 m", 250, top + 4, { s: 10.5, a: "right", c: LT.mute }); lt(ctx, h.toFixed(1) + " m", 250, bot - 8, { s: 10.5, a: "right", c: LT.mute, w: "900" });
      /* 스트로브 잔상 */
      var n = 8;
      for (i = 0; i <= n; i++) {
        var tt = t * i / n, yy = .5 * g * tt * tt, py = top + (bot - top - 12) * (yy / h);
        ctx.globalAlpha = .3 + .7 * i / n; K.planet(ctx, px, py, 11, "#ff9d7a", "#b4400c"); ctx.globalAlpha = 1;
        if (i % 2 === 0) lt(ctx, tt.toFixed(2) + "초", px + 18, py + 4, { s: 10.5, c: LT.mute });
      }
      K.arrow(ctx, { x: px + 70, y: top + 40 }, { x: px + 70, y: top + 110 }, LT.red, 3, 11);
      tag(ctx, "g = " + g.toFixed(2) + " m/s²", px + 80, top + 80, LT.red);
      tag(ctx, pname + " 표면", 200, bot + 22, LT.ink, "center");
      K.bigText(ctx, t.toFixed(2) + "초 만에 " + vEnd.toFixed(1) + " m/s", 18, 44, 24, "#ffffff");
      K.bigText(ctx, pname + " · 높이 " + h.toFixed(1) + " m", 18, 72, 16, "#ffd35a");
      K.warn(ctx, LWf - 14, H - 12, "⚠ 같은 시간 간격 사진 — 간격이 점점 벌어짐", "right");
      /* 오른쪽 계산 카드 */
      var cd = sideCard(ctx, LWf + 10, W, H, "자유 낙하 계산");
      K.row(ctx, "떨어진 높이 h", h.toFixed(1) + " m", cd.px, cd.R, 60);
      K.row(ctx, "걸린 시간 √(2h/g)", t.toFixed(3) + " 초", cd.px, cd.R, 86, LT.blue);
      K.row(ctx, "닿는 순간 속도 gt", vEnd.toFixed(2) + " m/s", cd.px, cd.R, 112, LT.orange);
      lt(ctx, "떨어진 거리", cd.px, 148, { s: 12, w: "800", c: LT.mute });
      [1, 2, 3].forEach(function (s, k) { var d = .5 * g * s * s; K.row(ctx, s + "초 뒤까지", d.toFixed(1) + " m", cd.px, cd.R, 172 + k * 24); K.bar(ctx, cd.px + 74, 164 + k * 24, cd.w - 150, d / (.5 * g * 9), LT.teal); });
      K.tip(ctx, "1초 : 2초 : 3초 → 1 : 4 : 9", cd.px - 4, 238, cd.w + 8, null);
      lt(ctx, "질량은 식 어디에도 없습니다.", cd.px, 300, { s: 12, w: "800", c: LT.red });
      lt(ctx, "1 m/s = 시속 3.6 km", cd.px, 324, { s: 11, c: LT.mute });
      $("a-fall-info").innerHTML = "<b>" + pname + "</b>에서 <b>" + h.toFixed(1) + " m</b> 높이에서 놓으면 <b>" + t.toFixed(2) + "초</b> 뒤 <b>" + vEnd.toFixed(1) + " m/s</b>로 바닥에 닿습니다. (1 m/s = 시속 3.6 km이므로 약 시속 " + (vEnd * 3.6).toFixed(0) + " km)";
      check(t, vEnd);
    }
    function check(t, vEnd) {
      var ch = false;
      if (pname === "지구" && Math.abs(t - 2) <= 0.05 && !got.a) { got.a = true; ch = true; }
      if (pname === "달" && vEnd >= 10 && !got.b) { got.b = true; ch = true; }
      if (ch) window.sthState("fallGot", got);
      mission();
    }
    function mission() {
      if (got.a) done("m1-3a");
      if (got.b) done("m1-3b");
      if (got.a && got.b) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>같은 높이라도 <b>g</b>가 크면 빨리 떨어집니다. 낙하를 정하는 것은 질량이 아니라 그 천체의 <b>중력 가속도</b>입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call(document.querySelectorAll("#a-planet button"), function (b) {
      b.addEventListener("click", function () {
        g = +b.getAttribute("data-g"); pname = b.getAttribute("data-n");
        Array.prototype.forEach.call(document.querySelectorAll("#a-planet button"), function (x) { x.classList.toggle("on", x === b); });
        draw();
      });
    });
    $("a-h").addEventListener("input", function (e) {
      h = +e.target.value; $("a-h-val").textContent = h.toFixed(1) + " m"; draw();
    });
    draw(); mission();
  })();

  /* 장면 4 — 수평으로 던지기 + 뉴턴의 대포 ------------------------------- */
  var got4 = window.sthState("proj4") || { a: false, b: false, c: false };
  function mission4() {
    if (got4.a) done("m1-4a");
    if (got4.b) done("m1-4b");
    if (got4.c) done("m1-4c");
    if (got4.a && got4.b && got4.c) {
      window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>수평으로 아무리 세게 던져도 <b>떨어지는 데 걸리는 시간은 같습니다.</b> 그리고 충분히 세게 던지면 떨어지는 곡선이 지구를 비켜 가 <b>인공위성</b>이 됩니다.");
      ep.clear(3);
    }
  }
  (function () {
    var canvas = $("c-proj"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var HH = 20, vx = 0, box = { gen: 0 }, run = ticker(box), cur = 0;
    var T = Math.sqrt(2 * HH / G);
    var GF = 330, GD = 76, PF = .25, PX = GD * PF, PY = -GD * .55 * PF, ground = GF + PY;   // 앞 가장자리·깊이, 공이 움직이는 면(건물 앞면)
    var x0 = 34 + PX + 68, top = 54, SX = 14;     // 1 m → SX px

    /* 입체 미니어처: 땅째 잘라 낸 풀밭 블록(앞면은 흙 단면) 위의 20 m 아파트(층마다 창·발코니, 옆면 창, 옥상 물탱크, 옥상의 사람).
       옥상에서 한 공은 그냥 놓고, 한 공은 수평으로 던진다. 같은 시간 간격 잔상과 '같은 높이' 점선 — 두 공은 언제나 나란히 내려온다. */
    function tree2(x, y, sc) {
      floorSh(ctx, x + 4 * sc, y + 1, 10 * sc, 3 * sc, .22);
      ctx.fillStyle = "#6b4a2e"; ctx.fillRect(x - 1.6 * sc, y - 9 * sc, 3.2 * sc, 9 * sc);
      [[34, 12], [25, 19]].forEach(function (q) {
        var g = ctx.createLinearGradient(x - 10 * sc, 0, x + 10 * sc, 0); g.addColorStop(0, "#5aa04a"); g.addColorStop(1, "#2a5e24");
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - q[0] * sc); ctx.lineTo(x + 10 * sc, y - q[1] * sc); ctx.lineTo(x - 10 * sc, y - q[1] * sc); ctx.closePath(); ctx.fill();
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = cur * T, yA = top + (ground - top - 10) * (.5 * G * t * t) / HH, xB = x0 + vx * t * SX, i;
      K.studio(ctx, 0, 0, W, H, null);
      floorSh(ctx, 470, GF + 40, 450, 26, .28);
      /* 풀밭 블록: 윗면 풀, 앞면 흙 단면(겉흙·속흙·자갈) */
      var gt = ctx.createLinearGradient(0, GF - GD * .55, 0, GF); gt.addColorStop(0, "#9ccc65"); gt.addColorStop(1, "#6fa845");
      slab(ctx, 20, GF, 850, 34, GD, gt, "#8a6a4c", "#6b5038");
      ctx.fillStyle = "#5f4430"; ctx.fillRect(20, GF, 850, 7);
      ctx.fillStyle = "#a07f5c"; ctx.fillRect(20, GF + 20, 850, 14);
      var Rg = K.rng(5); ctx.fillStyle = "rgba(60,40,25,.35)";
      for (i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc(24 + Rg() * 842, GF + 22 + Rg() * 10, 1 + Rg() * 1.6, 0, 6.2832); ctx.fill(); }
      ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1;
      for (i = 0; i < 40; i++) { var gx2 = 40 + Rg() * 800, gy2 = GF - 4 - Rg() * 36; ctx.beginPath(); ctx.moveTo(gx2, gy2); ctx.lineTo(gx2 + 3, gy2 - 4); ctx.stroke(); }
      /* 뒤쪽 나무 */
      [[330, .9], [470, 1.05], [610, .85], [760, 1], [840, .8]].forEach(function (q) { tree2(q[0] + 40, GF - GD * .55 + 8, q[1]); });
      /* 거리 눈금(공이 움직이는 면 위) */
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.4;
      for (i = 0; i <= 50; i += 10) { var mx2 = x0 + i * SX; if (mx2 > 860) break; ctx.beginPath(); ctx.moveTo(mx2 - 6, ground + 3); ctx.lineTo(mx2 + 6, ground - 3); ctx.stroke(); lt(ctx, i + " m", mx2 - PX, GF + 18, { s: 11, w: "800", a: "center", c: "#fff7e6" }); }
      /* 아파트: 앞면(층마다 창·발코니) · 옆면 창 · 옥상 */
      var bx = 34 + PX, bw = 68, bh = ground - top, bd = 44, fl = 7, fh = bh / fl;
      box3(ctx, bx, ground, bw, bh, bd, "#e9dfcf");
      for (i = 0; i < fl; i++) {
        var fy = ground - (i + 1) * fh;
        [[bx + 8], [bx + 38]].forEach(function (q) {
          var wg = ctx.createLinearGradient(0, fy + 6, 0, fy + 24); wg.addColorStop(0, "#bfe3ff"); wg.addColorStop(1, "#5d8fbf");
          ctx.fillStyle = i === 0 && q[0] === bx + 38 ? "#5b4636" : wg;
          ctx.fillRect(q[0], fy + 7, 22, i === 0 && q[0] === bx + 38 ? fh - 7 : 17);
        });
        if (i > 0) { ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(bx - 2, fy + fh - 9, bw + 4, 3); ctx.fillStyle = "rgba(60,70,90,.25)"; ctx.fillRect(bx - 2, fy + fh - 6, bw + 4, 2); }
        ctx.fillStyle = "rgba(60,90,130,.55)";
        for (var sw = 0; sw < 2; sw++) { var sx0 = bx + bw + 8 + sw * 18; ctx.beginPath(); ctx.moveTo(sx0, fy + 9 - (sx0 - bx - bw) * .55); ctx.lineTo(sx0 + 10, fy + 9 - (sx0 + 10 - bx - bw) * .55); ctx.lineTo(sx0 + 10, fy + 24 - (sx0 + 10 - bx - bw) * .55); ctx.lineTo(sx0, fy + 24 - (sx0 - bx - bw) * .55); ctx.closePath(); ctx.fill(); }
      }
      ctx.strokeStyle = "rgba(90,80,70,.45)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx, top); ctx.lineTo(bx + bd, top - bd * .55); ctx.lineTo(bx + bw + bd, top - bd * .55); ctx.stroke();
      box3(ctx, bx + 12, top - 10, 18, 12, 12, "#b8c2d0");
      figure(ctx, x0 - 16, top - 6, 30, "#4dabf7");
      /* 높이 치수선 */
      K.line(ctx, { x: 26, y: top }, { x: 26, y: ground }, "rgba(20,40,90,.55)", 1.4);
      K.line(ctx, { x: 20, y: top }, { x: 32, y: top }, "rgba(20,40,90,.55)", 1.4); K.line(ctx, { x: 20, y: ground }, { x: 32, y: ground }, "rgba(20,40,90,.55)", 1.4);
      tag(ctx, "20 m", 26, (top + ground) / 2 + 4, LT.ink, "center");
      /* 지나온 길(점선) */
      ctx.save(); ctx.strokeStyle = "rgba(232,89,12,.6)"; ctx.lineWidth = 2; ctx.setLineDash([3, 4]); ctx.beginPath();
      for (i = 0; i <= 40; i++) { var tt = T * i / 40, yy = top + (ground - top - 10) * (.5 * G * tt * tt) / HH, xx = x0 + vx * tt * SX; if (xx > W - 26) break; if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
      ctx.stroke(); ctx.restore();
      /* 같은 시간 간격 잔상 */
      for (var gi = 1; gi <= 3; gi++) {
        var tg2 = T * gi / 4, ya2 = top + (ground - top - 10) * (.5 * G * tg2 * tg2) / HH;
        if (tg2 <= cur * T) { ctx.globalAlpha = .3; K.planet(ctx, x0, ya2, 9, "#b49cff", "#4c2fb0"); var xg = x0 + vx * tg2 * SX; if (xg < W - 26) K.planet(ctx, xg, ya2, 9, "#ffb38a", "#b4400c"); ctx.globalAlpha = 1; K.line(ctx, { x: x0, y: ya2 }, { x: Math.min(xg, W - 30), y: ya2 }, "rgba(12,133,153,.35)", 1.2, [4, 4]); }
      }
      K.line(ctx, { x: x0, y: yA }, { x: Math.min(xB, W - 30), y: yA }, "#0c8599", 2, [5, 5]);
      floorSh(ctx, x0 + 4, ground - 1, 16, 4.5, .32); floorSh(ctx, Math.min(xB, W - 26) + 4, ground - 1, 16, 4.5, .32);
      K.planet(ctx, x0, yA, 11, "#b49cff", "#4c2fb0");
      K.planet(ctx, Math.min(xB, W - 26), yA, 11, "#ffb38a", "#b4400c");
      if (vx > 0) K.arrow(ctx, { x: Math.min(xB, W - 26) + 14, y: yA }, { x: Math.min(xB, W - 26) + 14 + Math.min(60, vx * 2.4), y: yA }, LT.orange, 2.4, 9);
      if (cur < .97) K.arrow(ctx, { x: x0 - 34, y: yA - 6 }, { x: x0 - 34, y: Math.min(yA + 14 + 30 * cur, ground - 4) }, LT.violet, 2.4, 9);
      tag(ctx, "그냥 놓은 공", 110, H - 14, LT.violet, "center");
      tag(ctx, "수평으로 던진 공 (" + vx + " m/s)", 300, H - 14, LT.orange, "center");
      K.bigText(ctx, "옥상 20 m", 190, 40, 24, "#ffffff");
      /* 작은 판정 카드 */
      K.card(ctx, 616, 10, 274, 116, "t = " + t.toFixed(2) + " 초");
      K.row(ctx, "떨어진 높이 (둘 다)", (.5 * G * t * t).toFixed(1) + " m", 634, 872, 62, LT.violet);
      K.row(ctx, "수평 거리", (vx * t).toFixed(1) + " m", 634, 872, 86, LT.orange);
      K.row(ctx, "바닥까지 (둘 다)", T.toFixed(2) + " 초", 634, 872, 110, LT.teal);
      K.warn(ctx, 886, 152, "⚠ 공 크기는 보기 쉽게 키움", "right");
    }
    canvas._redraw = draw;
    $("a-vx").addEventListener("input", function (e) { vx = +e.target.value; $("a-vx-val").textContent = vx + " m/s"; draw(); });
    $("a-throw").addEventListener("click", function () {
      $("a-proj-info").innerHTML = "수평 속도 <b>" + vx + " m/s</b> · 두 공이 바닥에 닿기까지 걸린 시간은 <b>둘 다 " + T.toFixed(2) + "초</b>입니다. 수평으로 던진 공은 " + (vx * T).toFixed(1) + " m 앞에 떨어졌지만, <b>떨어지는 데 걸린 시간은 똑같습니다.</b> 수평 방향 운동과 연직 방향 운동은 서로를 방해하지 않기 때문입니다.";
      if (vx >= 5 && !got4.a) { got4.a = true; window.sthState("proj4", got4); mission4(); }
      run(40, 30, function (u) { cur = u; draw(); });
    });
    draw();
  })();

  (function () {
    var canvas = $("c-cannon"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var GM = 3.986e14, RE = 6.371e6, ALT = 1.0e5, r0 = RE + ALT;
    var VC = Math.sqrt(GM / r0), VE = Math.sqrt(2 * GM / r0);
    var vk = 3.00, cx = 255, cy = 228, RPX = 146, cT = 0, cPlay = !REDUCE;

    function path(vkm) {                       // 두 물체 문제의 원뿔 곡선
      var vv = vkm * 1000;
      var p = (vv * r0) * (vv * r0) / GM;
      var e = vv * vv * r0 / GM - 1;           // + 면 발사점이 근지점, − 면 원지점
      var ecc = Math.abs(e), nu0 = e >= 0 ? 0 : Math.PI;
      var pts = [], hit = null, esc = vv >= VE, rMax = r0;
      for (var k = 0; k <= 720; k++) {
        var nu = nu0 + k * Math.PI / 360;
        var den = 1 + ecc * Math.cos(nu);
        if (den <= 1e-6) break;
        var r = p / den;
        if (r > 8 * RE) { rMax = Math.max(rMax, r); pts.push({ nu: nu, r: 8 * RE }); break; }
        rMax = Math.max(rMax, r);
        if (r < RE) { hit = (nu - nu0) * 180 / Math.PI; break; }
        pts.push({ nu: nu, r: r });
      }
      return { pts: pts, nu0: nu0, e: ecc, hit: hit, esc: esc, rMax: rMax, p: p };
    }
    /* 입체 미니어처: 밝은 스튜디오 위에 놓인 투명 아크릴 진열장(큐브) 속 우주. 큐브 안에 지구본과 높은 산 위의 대포(뉴턴의 대포).
       궤도 색 — 땅에 떨어짐 주황 · 궤도 초록 · 탈출 보라. 산과 대포는 보이게 키웠다(고도만 화면에서 +14px). */
    var CB = { x: 26, y: 114, w: 384, h: 272, dx: 74, dy: 46 };
    function cubePath() {
      ctx.beginPath(); ctx.moveTo(CB.x, CB.y); ctx.lineTo(CB.x + CB.dx, CB.y - CB.dy); ctx.lineTo(CB.x + CB.w + CB.dx, CB.y - CB.dy);
      ctx.lineTo(CB.x + CB.w + CB.dx, CB.y + CB.h - CB.dy); ctx.lineTo(CB.x + CB.w, CB.y + CB.h); ctx.lineTo(CB.x, CB.y + CB.h); ctx.closePath();
    }
    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var o = path(vk), view = Math.max(o.rMax * 1.08, RE * 1.25), S = RPX / view, er = RE * S, LWc = 500;
      var kind = o.hit !== null ? "땅에 떨어짐" : (o.esc ? "지구를 벗어남" : (o.e <= .03 ? "원에 가까운 궤도" : "타원 궤도"));
      var oc = o.hit !== null ? LT.orange : (o.esc ? LT.violet : LT.green);
      function rad(r) { return r * S + 14 * clamp((r - RE) / ALT, 0, 1); }
      K.studio(ctx, 0, 0, LWc, H, null);
      floorSh(ctx, CB.x + CB.w / 2 + 40, CB.y + CB.h + 6, 280, 22, .32);
      /* 받침대 */
      var bx0 = CB.x - 8, bx1 = CB.x + CB.w + 8, by0 = CB.y + CB.h - 2;
      ctx.fillStyle = "#59606e"; ctx.beginPath(); ctx.moveTo(bx1, by0); ctx.lineTo(bx1 + CB.dx, by0 - CB.dy); ctx.lineTo(bx1 + CB.dx, by0 - CB.dy + 12); ctx.lineTo(bx1, by0 + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = metalG(ctx, 0, by0, 0, by0 + 12); ctx.fillRect(bx0, by0, bx1 - bx0, 12);
      /* 큐브 안 — 짙은 남색 우주 */
      ctx.save(); cubePath(); ctx.clip();
      var sp = ctx.createLinearGradient(0, CB.y - CB.dy, 0, CB.y + CB.h); sp.addColorStop(0, "#0a1230"); sp.addColorStop(1, "#1b2559");
      ctx.fillStyle = sp; ctx.fillRect(CB.x, CB.y - CB.dy, CB.w + CB.dx, CB.h + CB.dy);
      var Rs = K.rng(9), si;
      for (si = 0; si < 90; si++) { ctx.globalAlpha = .3 + Rs() * .6; ctx.fillStyle = "#ffffff"; ctx.fillRect(CB.x + Rs() * (CB.w + CB.dx), CB.y - CB.dy + Rs() * (CB.h + CB.dy), Rs() > .9 ? 2 : 1.2, Rs() > .9 ? 2 : 1.2); }
      ctx.globalAlpha = 1;
      /* 진열장 안쪽 모서리(뒤) */
      var bk = { x: CB.x + CB.dx, y: CB.y + CB.h - CB.dy };
      ctx.strokeStyle = "rgba(180,200,255,.22)"; ctx.lineWidth = 1.2; ctx.beginPath();
      ctx.moveTo(bk.x, CB.y - CB.dy); ctx.lineTo(bk.x, bk.y); ctx.lineTo(bk.x + CB.w, bk.y); ctx.moveTo(bk.x, bk.y); ctx.lineTo(CB.x, CB.y + CB.h); ctx.stroke();
      var atm = ctx.createRadialGradient(cx, cy, er * .96, cx, cy, er * 1.14); atm.addColorStop(0, "rgba(110,190,255,.55)"); atm.addColorStop(1, "rgba(110,190,255,0)");
      ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, er * 1.14, 0, Math.PI * 2); ctx.fill();
      K.earth(ctx, cx, cy, er);
      ctx.fillStyle = "rgba(90,190,110,.6)"; ctx.beginPath(); ctx.ellipse(cx - er * .35, cy + er * .25, er * .28, er * .18, -.4, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + er * .3, cy + er * .45, er * .2, er * .12, .5, 0, 6.2832); ctx.fill();
      var shd = ctx.createRadialGradient(cx - er * .4, cy - er * .4, er * .2, cx, cy, er * 1.05); shd.addColorStop(0, "rgba(0,0,0,0)"); shd.addColorStop(1, "rgba(0,0,20,.5)");
      ctx.fillStyle = shd; ctx.beginPath(); ctx.arc(cx, cy, er, 0, Math.PI * 2); ctx.fill();
      function scr(q) { var phi = -Math.PI / 2 + (q.nu - o.nu0), rr = rad(q.r); return { x: cx + rr * Math.cos(phi), y: cy + rr * Math.sin(phi) }; }
      ctx.save(); ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.beginPath();
      o.pts.forEach(function (q, i) { var s2 = scr(q); if (i === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y); });
      ctx.stroke(); ctx.strokeStyle = oc; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
      /* 높은 산 위의 대포 (과장) */
      var py0 = cy - rad(r0), sy0 = cy - er;
      var mg = ctx.createLinearGradient(cx - 26, 0, cx + 26, 0); mg.addColorStop(0, "#b8946e"); mg.addColorStop(.55, "#8a6a4c"); mg.addColorStop(1, "#4e3a2a");
      ctx.fillStyle = mg; ctx.beginPath(); var mw = Math.min(30, er * .3 + 7); ctx.moveTo(cx - mw, sy0 + 7); ctx.lineTo(cx - 3, py0 + 3); ctx.lineTo(cx + 3, py0 + 3); ctx.lineTo(cx + mw, sy0 + 7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#f4f7fb"; ctx.beginPath(); ctx.moveTo(cx - 9, py0 + 9); ctx.lineTo(cx - 3, py0 + 3); ctx.lineTo(cx + 3, py0 + 3); ctx.lineTo(cx + 9, py0 + 9); ctx.lineTo(cx + 3, py0 + 7); ctx.lineTo(cx - 2, py0 + 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = metalG(ctx, 0, py0 - 7, 0, py0 + 1); ctx.beginPath(); ctx.roundRect(cx - 5, py0 - 7, 24, 7, 3); ctx.fill();
      K.planet(ctx, cx - 1, py0 + 1, 4.5, "#8a6a4c", "#3a2a1a");
      if (o.pts.length > 1) {
        var nst = Math.floor(cT / 40), last = o.pts.length - 1, closed = o.hit === null && !o.esc;
        var qi = REDUCE ? last : (closed ? nst % o.pts.length : Math.min(nst, last));
        for (var gk = 1; gk <= 4; gk++) { var qg = scr(o.pts[Math.max(0, qi - gk * 6)]); ctx.globalAlpha = .5 - gk * .1; K.planet(ctx, qg.x, qg.y, 4.5, "#e3e8ef", "#3b4252"); }
        ctx.globalAlpha = 1; var qq = scr(o.pts[qi]); K.glow(ctx, qq.x, qq.y, 3, "rgba(255,240,200,.9)", 3); K.planet(ctx, qq.x, qq.y, 5.5, "#ffffff", "#5b6476");
      }
      ctx.restore();
      /* 아크릴 판: 윗면·옆면·앞면 반사와 모서리 */
      ctx.fillStyle = "rgba(235,245,255,.16)"; ctx.beginPath(); ctx.moveTo(CB.x, CB.y); ctx.lineTo(CB.x + CB.dx, CB.y - CB.dy); ctx.lineTo(CB.x + CB.w + CB.dx, CB.y - CB.dy); ctx.lineTo(CB.x + CB.w, CB.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(235,245,255,.08)"; ctx.beginPath(); ctx.moveTo(CB.x + CB.w, CB.y); ctx.lineTo(CB.x + CB.w + CB.dx, CB.y - CB.dy); ctx.lineTo(CB.x + CB.w + CB.dx, CB.y + CB.h - CB.dy); ctx.lineTo(CB.x + CB.w, CB.y + CB.h); ctx.closePath(); ctx.fill();
      var gl = ctx.createLinearGradient(CB.x, CB.y, CB.x + CB.w * .6, CB.y + CB.h); gl.addColorStop(0, "rgba(255,255,255,.16)"); gl.addColorStop(.35, "rgba(255,255,255,0)"); gl.addColorStop(1, "rgba(255,255,255,.05)");
      ctx.fillStyle = gl; ctx.fillRect(CB.x, CB.y, CB.w, CB.h);
      ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 2; cubePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CB.x, CB.y); ctx.lineTo(CB.x + CB.w, CB.y); ctx.lineTo(CB.x + CB.w + CB.dx, CB.y - CB.dy); ctx.moveTo(CB.x + CB.w, CB.y); ctx.lineTo(CB.x + CB.w, CB.y + CB.h); ctx.stroke();
      tag(ctx, "대포 (고도 100 km)", Math.min(cx + 26, CB.x + CB.w - 4), Math.max(py0 - 10, CB.y - CB.dy + 22), LT.ink);
      K.bigText(ctx, vk.toFixed(2) + " km/s", 18, 40, 26, "#ffffff");
      ctx.font = "900 26px " + K.FONT; var kx = 36 + ctx.measureText(vk.toFixed(2) + " km/s").width;
      K.bigText(ctx, kind, kx, 40, 18, o.hit !== null ? "#ffb38a" : (o.esc ? "#d0bfff" : "#8ff0c4"));
      K.warn(ctx, LWc - 14, H - 12, "⚠ 산·대포 크기는 실제 비율이 아님", "right");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWc + 10, W, H, "궤도 판정");
      lt(ctx, kind, cd.px, 64, { s: 22, w: "900", c: oc });
      K.row(ctx, "대포알의 속도", vk.toFixed(2) + " km/s", cd.px, cd.R, 100, LT.ink);
      K.row(ctx, "궤도의 이심률 e", o.e >= 1 ? "1 이상 (열린 궤도)" : o.e.toFixed(3), cd.px, cd.R, 126);
      K.row(ctx, "원궤도가 되는 속도", (VC / 1000).toFixed(2) + " km/s", cd.px, cd.R, 152, LT.green);
      K.row(ctx, "지구를 벗어나는 속도", (VE / 1000).toFixed(2) + " km/s", cd.px, cd.R, 178, LT.violet);
      K.row(ctx, "날아간 거리", o.hit !== null ? "약 " + (RE * o.hit * Math.PI / 180 / 1000).toFixed(0) + " km" : "한 바퀴 이상", cd.px, cd.R, 204, LT.orange);
      K.bar(ctx, cd.px, 218, cd.w, vk / 12, oc);
      lt(ctx, "0", cd.px, 244, { s: 10, c: LT.dim }); lt(ctx, "12 km/s", cd.R, 244, { s: 10, a: "right", c: LT.dim });
      K.tip(ctx, o.hit !== null ? "더 세게 쏘면 더 멀리 떨어진다" : (o.esc ? "돌아오지 않는다 — 탈출" : "계속 떨어지지만 땅에 닿지 못한다"), cd.px - 4, 258, cd.w + 8, o.hit === null ? true : null);
      lWrap(ctx, "이심률 0 = 원, 1 미만 = 타원, 1 이상 = 돌아오지 않음. 지표면 기준 제1 우주 속도 7.9 km/s, 탈출 속도 11.2 km/s.", cd.px, 318, cd.w, 16);
      if (quiet === true) return;
      $("a-cannon-info").innerHTML = o.hit !== null
        ? "속도 <b>" + vk.toFixed(2) + " km/s</b> — 대포알은 약 <b>" + (RE * o.hit * Math.PI / 180 / 1000).toFixed(0) + " km</b> 날아가 땅에 떨어집니다. 더 세게 쏘면 떨어지는 지점이 멀어집니다."
        : (o.esc ? "속도 <b>" + vk.toFixed(2) + " km/s</b> — 지구의 중력을 이기고 <b>영영 돌아오지 않습니다.</b>이 속도를 탈출 속도라고 합니다."
          : "속도 <b>" + vk.toFixed(2) + " km/s</b> — 대포알은 계속 떨어지지만, 떨어지는 만큼 지구 표면도 휘어져 <b>바닥에 닿지 못합니다.</b> 이것이 인공위성입니다. (이심률 " + o.e.toFixed(3) + ")");

      var ch = false;
      if (o.hit === null && !o.esc && o.e <= 0.03 && !got4.b) { got4.b = true; ch = true; }
      if (o.esc && !got4.c) { got4.c = true; ch = true; }
      if (ch) { window.sthState("proj4", got4); mission4(); }
    }
    canvas._redraw = draw;
    $("a-vc").addEventListener("input", function (e) {
      vk = +e.target.value; $("a-vc-val").textContent = vk.toFixed(2) + " km/s"; cT = 0; draw();
    });
    window.sthState("cirV", (VC / 1000).toFixed(2));
    playBtn("a-cannon-play", "⏸ 대포알 멈추기", "▶ 대포알 날리기", function () { return cPlay; }, function (q) { cPlay = q; if (q) cT = 0; });
    K.animate(canvas, function (dt) { if (cPlay) { cT += dt; draw(true); } });
    draw(); mission4();
  })();

  /* 장면 5 — 결말 -------------------------------------------------------- */
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 정확했습니다. 이제 진공 통과 달의 실험이 증거가 되어 줍니다."
        : "눈에 보이는 대로라면 자연스러운 생각입니다. 아리스토텔레스도 2000년 동안 그렇게 생각했으니까요. 공기를 빼는 순간 답이 달라졌습니다.") +
      "<br><b>내가 찾은 원궤도 속도</b> " + (window.sthState("cirV") || "-") + " km/s";
  }
  function finish() {
    window.sthState("r1", "해결 · 진공에서는 쇠공과 깃털이 동시에 낙하, 원궤도 속도 " + (window.sthState("cirV") || "-") + " km/s");
  }
  window.sthSort({
    mount: "s1-end",
    buckets: [
      { id: "f", label: "자유 낙하", sub: "가만히 놓아 연직으로만 떨어진다" },
      { id: "p", label: "수평으로 던진 물체", sub: "수평 등속 + 연직 자유 낙하" },
      { id: "o", label: "궤도 운동", sub: "계속 떨어지지만 땅에 닿지 못한다" }
    ],
    items: [
      { t: "🍎 나뭇가지에서 저절로 떨어진 사과", a: "f", why: "가만히 놓인 상태에서 떨어졌으므로 자유 낙하입니다." },
      { t: "🪶 진공 통 안에서 놓은 깃털", a: "f", why: "공기 저항이 없으니 완전한 자유 낙하입니다." },
      { t: "🔨 달 표면에서 스콧이 놓은 망치", a: "f", why: "달에는 공기가 없어 자유 낙하합니다." },
      { t: "⚾ 절벽에서 수평으로 던진 공", a: "p", why: "수평으로는 등속, 아래로는 자유 낙하하여 포물선을 그립니다." },
      { t: "📦 날아가는 비행기에서 떨어뜨린 구호 상자", a: "p", why: "떨어지는 순간 비행기와 같은 수평 속도로 날아가고 있으므로 포물선을 그립니다.", hint: "상자는 가만히 있다가 떨어졌을까요?" },
      { t: "🎯 수평으로 쏜 화살", a: "p", why: "수평 방향 등속 + 연직 방향 자유 낙하입니다." },
      { t: "🛰️ 지구를 도는 국제 우주 정거장", a: "o", why: "계속 떨어지지만 수평 속도가 커서 지구를 비켜 갑니다." },
      { t: "🌕 지구 주위를 도는 달", a: "o", why: "달도 지구의 중력에 이끌려 끝없이 떨어지는 중입니다.", hint: "달은 왜 지구로 곤두박질치지 않을까요?" },
      { t: "📡 한자리에 떠 있는 듯 보이는 정지 궤도 위성", a: "o", why: "지구가 도는 것과 같은 주기로 궤도를 돌아 멈춘 듯 보일 뿐, 궤도 운동입니다." }
    ],
    doneText: "셋 다 중력 하나가 만든 운동입니다.",
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅲ-2] 이야기 ① 피사에서 달까지",
    items: [
      { id: "e1a", label: "아리스토텔레스에게 보내는 반박문", hint: "공기 중에서는 깃털이 늦게 떨어지는데 왜 ‘무거운 것이 빨리 떨어진다’가 틀린 말인지, 진공 통 실험 결과를 근거로 세 문장 안에 쓰세요.", ph: "" },
      { id: "e1b", label: "달은 왜 지구로 떨어지지 않을까", hint: "‘떨어진다’와 ‘돈다’를 한 문장 안에서 이어 설명해 보세요. 대포 화면에서 본 것을 근거로 드세요.", ph: "" }
    ]
  });
})();

/* =========================================================================
   이야기 ② 엘리베이터 저울
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "조사관의 첫 추리",
    question: "엘리베이터 안 체중계의 눈금이 오르내린 까닭은 무엇일까요?",
    options: ["㉠ 엘리베이터 안에서는 중력이 달라지기 때문", "㉡ 체중계가 흔들려 생긴 오차일 뿐", "㉢ 엘리베이터의 속도가 빠를수록 눈금이 커지기 때문", "㉣ 엘리베이터가 속도를 바꾸는 동안(가속도) 떠받치는 힘이 달라지기 때문"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 엘리베이터 저울 -------------------------------------------- */
  (function () {
    var canvas = $("c-elev"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var M = 50, a = 0;
    var got = window.sthState("elevGot") || { a: false, b: false, c: false };

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var N = Math.max(0, M * (G + a)), sc = N / G, LWe = 430, i;
      /* 입체 미니어처: 앞벽을 뗀 승강로(뒷벽·옆벽·레일·도르래)와 그 안의 엘리베이터 칸. 칸 안 체중계 위의 서윤, 힘 화살표 */
      var I = K.iso({ ox: 180, oy: 290, s: .8, L: 150, D: 120 }), Z0 = 0, Z1 = 260, cz = 92 + clamp(a, -10, 5) * 3, ch = 110;
      K.studio(ctx, 0, 0, LWe, H, null);
      floorSh(ctx, 210, I.P(75, 60, 0).y + 30, 190, 26, .28);
      I.quad(ctx, I.P(0, 0, Z0), I.P(I.L, 0, Z0), I.P(I.L, 0, Z1), I.P(0, 0, Z1), "#d7dde6");
      I.quad(ctx, I.P(0, 0, Z0), I.P(0, I.D, Z0), I.P(0, I.D, Z1), I.P(0, 0, Z1), "#c3cbd6");
      I.plane(ctx, Z0, "#b4bcc8");
      ctx.strokeStyle = "#8a94a8"; ctx.lineWidth = 3;
      [[20, 0], [130, 0]].forEach(function (r) { var p0 = I.P(r[0], 2, Z0), p1 = I.P(r[0], 2, Z1); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); });
      for (i = 1; i < 3; i++) I.quad(ctx, I.P(0, 0, i * 90), I.P(I.L, 0, i * 90), I.P(I.L, 0, i * 90 + 3), I.P(0, 0, i * 90 + 3), "#aab3c3");
      /* 도르래와 줄 */
      var pt = I.P(75, 60, Z1 - 6), ctop = I.P(75, 60, cz + ch);
      ctx.strokeStyle = "#5b6476"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(pt.x - 2, pt.y); ctx.lineTo(ctop.x - 2, ctop.y); ctx.moveTo(pt.x + 3, pt.y); ctx.lineTo(ctop.x + 3, ctop.y); ctx.stroke();
      K.planet(ctx, pt.x, pt.y - 6, 13, "#e8ecf2", "#4a5266"); ctx.fillStyle = "#2b2f3a"; ctx.beginPath(); ctx.arc(pt.x, pt.y - 6, 3, 0, 6.2832); ctx.fill();
      /* 엘리베이터 칸(앞벽·오른쪽 벽 없음) */
      var x0 = 18, x1 = 132, y0 = 14, y1 = 106;
      I.quad(ctx, I.P(x0, y0, cz), I.P(x1, y0, cz), I.P(x1, y0, cz + ch), I.P(x0, y0, cz + ch), "#eef1f6");
      I.quad(ctx, I.P(x0, y0, cz), I.P(x0, y1, cz), I.P(x0, y1, cz + ch), I.P(x0, y0, cz + ch), "#dfe4ec");
      I.box(ctx, x0, y0, cz - 8, x1, y1, cz, "#c9d0da", "#9aa3b0", "#7d8698");
      I.quad(ctx, I.P(x0, y0, cz + ch), I.P(x1, y0, cz + ch), I.P(x1, y1, cz + ch), I.P(x0, y1, cz + ch), null, "rgba(80,90,110,.7)");
      var lamp = I.P(75, 60, cz + ch - 4); K.glow(ctx, lamp.x, lamp.y, 4, "rgba(255,240,200,.95)", 3);
      /* 체중계와 사람 */
      I.box(ctx, 55, 46, cz, 95, 78, cz + 5, "#f4f6f9", "#c9d0da", "#9aa3b0");
      var lc = I.P(75, 78, cz + 3); ctx.fillStyle = "#0a2a1a"; ctx.fillRect(lc.x - 13, lc.y - 4, 26, 9);
      K.t(ctx, sc.toFixed(0), lc.x, lc.y + 3.5, { s: 8, w: "900", a: "center", c: "#7ff0a8" });
      var ft = I.P(75, 62, cz + 5); figure(ctx, ft.x, ft.y, 66, "#ff8a5c");
      /* 힘 화살표: 떠받치는 힘 N(위) · 중력 mg(아래) · 가속도 */
      var nL = clamp(N / 8, 0, 150), gL = M * G / 8;
      if (N > 1) K.arrow(ctx, { x: ft.x - 34, y: ft.y - 4 }, { x: ft.x - 34, y: ft.y - 4 - nL }, LT.violet, 4, 13);
      K.arrow(ctx, { x: ft.x + 34, y: ft.y - 70 }, { x: ft.x + 34, y: ft.y - 70 + gL }, LT.orange, 4, 13);
      K.pill(ctx, "N = " + N.toFixed(0) + " N", ft.x - 40, ft.y - 10 - nL, { s: 11.5, a: "right", c: "#d0bfff" });
      K.pill(ctx, "mg = " + (M * G).toFixed(0) + " N", ft.x + 42, ft.y - 74 + gL, { s: 11.5, c: "#ffc49a" });
      if (Math.abs(a) > .05) { var aL = clamp(Math.abs(a) * 8, 12, 50), ax = I.P(I.L + 18, 60, cz + ch / 2); K.arrow(ctx, ax, { x: ax.x, y: a > 0 ? ax.y - aL : ax.y + aL }, LT.teal, 4, 13); K.pill(ctx, "가속도", ax.x + 10, a > 0 ? ax.y - aL - 8 : ax.y + aL + 20, { s: 11, c: "#bff0e6" }); }
      K.bigText(ctx, sc.toFixed(1) + " kg중", 18, 44, 26, sc > 50.5 ? "#ff9db0" : (sc < 49.5 ? "#8fd3ff" : "#ffffff"));
      K.bigText(ctx, sc <= .1 ? "자유 낙하 — 눈금 0" : (a > .05 ? "위로 가속 중" : (a < -.05 ? "아래로 가속 중" : "가속도 0")), 18, 72, 16, "#ffd35a");
      K.warn(ctx, LWe - 14, H - 12, "⚠ 칸 움직임·화살표 길이는 보기 쉽게", "right");
      /* 오른쪽 판정 카드: 체중계 화면 */
      var cd = sideCard(ctx, LWe + 10, W, H, "체중계 눈금 (서윤 " + M + " kg)"), col2 = sc > 50.5 ? LT.red : (sc < 49.5 ? LT.blue : LT.green);
      var lcd = ctx.createLinearGradient(0, 44, 0, 116); lcd.addColorStop(0, "#f1fbf5"); lcd.addColorStop(1, "#d3efdf");
      ctx.fillStyle = lcd; ctx.beginPath(); ctx.roundRect(cd.px, 44, cd.w, 72, 16); ctx.fill();
      ctx.strokeStyle = "rgba(15,120,80,.35)"; ctx.lineWidth = 2; ctx.stroke();
      K.t(ctx, sc.toFixed(1) + " kg중", cd.px + cd.w / 2, 94, { s: 32, w: "900", a: "center", c: col2 });
      K.bar(ctx, cd.px, 130, cd.w, sc / 80, col2);
      var mk = cd.px + cd.w * 50 / 80; ctx.strokeStyle = LT.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mk, 124); ctx.lineTo(mk, 146); ctx.stroke();
      lt(ctx, "실제 질량 50 kg", mk, 160, { s: 10.5, a: "center", c: LT.mute });
      K.row(ctx, "엘리베이터의 가속도 a", a.toFixed(1) + " m/s²", cd.px, cd.R, 192, LT.teal);
      K.row(ctx, "떠받치는 힘 N = m(g + a)", N.toFixed(0) + " N", cd.px, cd.R, 218, LT.violet);
      K.row(ctx, "몸무게(중력) mg", (M * G).toFixed(0) + " N", cd.px, cd.R, 244, LT.orange);
      K.row(ctx, "알짜힘 N − mg = ma", (M * a).toFixed(0) + " N", cd.px, cd.R, 270);
      K.tip(ctx, Math.abs(sc - 60) <= 1 ? "60 kg중 — 위로 약 2 m/s² 가속" : (sc <= .1 ? "줄이 끊긴 자유 낙하" : "눈금 60 kg중, 0 kg중을 찾아보세요"), cd.px - 4, 290, cd.w + 8, Math.abs(sc - 60) <= 1 || sc <= .1 ? true : null);
      lWrap(ctx, "체중계가 재는 것은 질량이 아니라 바닥이 발을 떠받치는 힘입니다.", cd.px, 346, cd.w, 16);
      var msg;
      if (sc <= 0.1) msg = "눈금이 <b>0</b>입니다. 엘리베이터와 서윤이가 <b>함께 자유 낙하</b>하고 있어서 바닥이 발을 전혀 떠받치지 않습니다. 이것이 ‘무중력처럼 느껴지는’ 상태입니다. 중력이 사라진 것이 아닙니다.";
      else if (a > 0.05) msg = "위로 가속하는 중입니다. 바닥이 평소보다 <b>더 세게</b> 떠받쳐야 몸이 위로 가속되므로 눈금이 <b>커집니다</b>.";
      else if (a < -0.05) msg = "아래로 가속하는 중입니다. 떠받치는 힘이 <b>줄어</b> 눈금이 작아집니다.";
      else msg = "가속도가 0입니다. 정지해 있든, 일정한 속도로 오르내리든 <b>눈금은 실제 질량 그대로</b>입니다. 알짜힘이 0이면 물체는 가속되지 않습니다(관성의 법칙).";
      $("b-elev-info").innerHTML = msg;

      var ch = false;
      if (Math.abs(sc - 60) <= 1.0 && !got.a) { got.a = true; ch = true; }
      if (sc <= 0.1 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("elevGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.c) done("m2-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>체중계가 재는 것은 질량이 아니라 <b>떠받치는 힘</b>이었습니다. a = −9.8 m/s²는 줄이 끊어져 <b>자유 낙하</b>하는 상태입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("b-a").addEventListener("input", function (e) { a = +e.target.value; $("b-a-val").textContent = a.toFixed(1); draw(); });
    window.sthPick({
      mount: "s2-q1",
      q: "엘리베이터가 <b>일정한 속도</b>로 빠르게 올라가는 동안(2~4초 구간) 체중계 눈금은 어떻게 될까요?",
      options: ["빠를수록 눈금이 커진다", "실제 질량 그대로 50 kg중", "조금씩 계속 커진다", "0이 된다"],
      answer: 1,
      why: ["속도가 아니라 <b>가속도</b>가 눈금을 바꿉니다. 슬라이더를 0에 두고 확인해 보세요.",
        "일정한 속도 = 가속도 0 = 알짜힘 0. 떠받치는 힘은 중력과 똑같아지고 눈금은 그대로입니다.",
        "가속도가 0이면 눈금도 변하지 않습니다.",
        "눈금이 0이 되려면 아래로 9.8 m/s²로 가속(자유 낙하)해야 합니다."],
      onDone: function () { got.c = true; window.sthState("elevGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 3 — 화물 로봇 F = ma ------------------------------------------- */
  (function () {
    var canvas = $("c-fma"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var canvas2 = $("c-gr"), ctx2 = window.setupCanvas(canvas2), W2 = canvas2._w, H2 = canvas2._h;
    var F = 10, f = 0, m = 5, box = { gen: 0 }, run = ticker(box), cur = 1;
    var got = window.sthState("fmaGot") || { a: false, b: false, c: false };

    /* 정지해 있던 로봇에서 마찰력은 미는 힘보다 커질 수 없다(정지 마찰력 = 미는 힘) */
    function fe() { return Math.min(f, F); }
    function acc() { return (F - fe()) / m; }

    function draw() {
      var a = acc(), net = F - fe(), i;
      /* 입체 미니어처: 창고 바닥 블록(앞면 경고 띠) 위의 화물 로봇과 짐 상자(질량이 클수록 몸집·상자 수가 늘어난다).
         뒤에서 미는 사람, 미는 힘·마찰력·가속도 화살표, 바닥은 마찰력만큼 거친 고무 매트가 깔린다. 흐린 상자 = 1초 간격 위치 */
      ctx.clearRect(0, 0, W, H);
      var LWm = 600, GF = 272, GD = 84, ox = 26, oy = -14, foot = GF + oy, bw = 60 + m * .9, bh = 34, bd = 34, bx = 196;
      K.studio(ctx, 0, 0, LWm, H, null);
      floorSh(ctx, 300, GF + 34, 300, 22, .28);
      var ft = ctx.createLinearGradient(0, GF - GD * .55, 0, GF); ft.addColorStop(0, "#dde3ea"); ft.addColorStop(1, "#b9c2ce");
      slab(ctx, 14, GF, 490, 28, GD, ft, "#7d8698", "#5b6476");
      ctx.save(); ctx.beginPath(); ctx.rect(14, GF + 14, 490, 14); ctx.clip(); for (i = 0; i < 19; i++) { ctx.fillStyle = i % 2 ? "#2b2f3a" : "#f5b400"; ctx.beginPath(); ctx.moveTo(14 + i * 27.2 - 14, GF + 28); ctx.lineTo(14 + i * 27.2, GF + 14); ctx.lineTo(14 + (i + 1) * 27.2, GF + 14); ctx.lineTo(14 + (i + 1) * 27.2 - 14, GF + 28); ctx.closePath(); ctx.fill(); } ctx.restore();

      /* 바닥 상태: 마찰력이 클수록 거친 매트(점이 촘촘), 0 이면 반들반들 */
      var rough = clamp(f / 50, 0, 1), Rm = K.rng(11);
      if (rough > 0) {
        ctx.save(); ctx.beginPath(); ctx.moveTo(14 + 20, GF - 4); ctx.lineTo(14 + 20 + GD * .9, GF - 4 - GD * .5); ctx.lineTo(496 + GD * .9, GF - 4 - GD * .5); ctx.lineTo(496, GF - 4); ctx.closePath();
        ctx.fillStyle = "rgba(70,60,50," + (.12 + .38 * rough).toFixed(2) + ")"; ctx.fill(); ctx.clip();
        ctx.fillStyle = "rgba(30,25,20,.55)";
        for (i = 0; i < 40 + rough * 520; i++) { var rx = 30 + Rm() * 620, ry = GF - 4 - Rm() * 46; ctx.fillRect(rx, ry, 1.6, 1.6); }
        ctx.restore();
      } else {
        ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 2;
        for (i = 0; i < 5; i++) { var sx = 60 + i * 90; ctx.beginPath(); ctx.moveTo(sx, GF - 8); ctx.lineTo(sx + 34, GF - 27); ctx.stroke(); }
      }
      /* 잔상: 1초 간격 위치 (½at²) */
      if (a > .005) for (i = 1; i <= 3; i++) { var gx = bx + Math.min(300, .5 * a * i * i * 12); ctx.globalAlpha = .2; box3(ctx, gx, foot - 8, bw, bh, bd, "#2ed3bd"); ctx.globalAlpha = 1; if (gx - bx > 40 * i) lt(ctx, i + "초", gx + bw / 2 + bd / 2, foot - 8 - bh - bd * .55 - 6, { s: 11, a: "center", c: LT.mute }); }
      /* 미는 사람 */
      figure(ctx, bx - 30, foot + 2, 80, "#4dabf7");
      ctx.strokeStyle = "#3f88c5"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(bx - 26, foot - 58); ctx.lineTo(bx - 2, foot - 30); ctx.stroke(); ctx.lineCap = "butt";
      /* 로봇: 바퀴 · 몸통 · 화면 · 위에 실은 짐 상자 */
      wheel(ctx, bx + 12, foot - 4, 8); wheel(ctx, bx + bw - 10, foot - 4, 8);
      box3(ctx, bx, foot - 8, bw, bh, bd, "#2ed3bd");
      ctx.fillStyle = "rgba(5,20,30,.85)"; ctx.beginPath(); ctx.roundRect(bx + bw - 30, foot - 8 - bh + 7, 22, 14, 5); ctx.fill();
      K.glow(ctx, bx + bw - 24, foot - 8 - bh + 14, 2.2, "rgba(127,255,224,.95)", 2.4); K.glow(ctx, bx + bw - 14, foot - 8 - bh + 14, 2.2, "rgba(127,255,224,.95)", 2.4);
      var nc = clamp(Math.round(m / 7), 0, 7), per = Math.max(1, Math.floor((bw - 8) / 26)), ctop = foot - 8 - bh - bd * .3;
      for (i = 0; i < nc; i++) { var row = Math.floor(i / per), colI = i % per; box3(ctx, bx + 6 + colI * 26 + row * 6, ctop - row * 20, 22, 18, 12, "#c8955a"); }
      tag(ctx, m + " kg", bx + bw / 2, foot - 8 - bh / 2 + 6, "#06302c", "center");
      var cyF = foot - 8 - bh / 2, lf = 20 + F * 2.6, lr = 20 + fe() * 2.6;
      if (F > 0) K.arrow(ctx, { x: bx - 12 - lf, y: cyF }, { x: bx - 4, y: cyF }, LT.orange, 5, 15);
      if (fe() > 0) K.arrow(ctx, { x: bx + bw + 14 + lr, y: foot + 6 }, { x: bx + bw + 14, y: foot + 6 }, LT.violet, 5, 15);
      tag(ctx, "미는 힘 " + F + " N", Math.max(16, bx - 12 - lf), cyF - 24, LT.orange);
      tag(ctx, (f > F ? "정지 마찰력 " : "마찰력 ") + fe() + " N", bx + bw + 14, GF + 46, LT.violet);
      var la = clamp(Math.abs(a) * 16, 0, 230), ay = foot - 8 - bh - bd * .55 - (nc ? 20 + Math.floor((nc - 1) / per) * 20 : 0) - 22;
      if (a > .005) { la = Math.max(18, la); K.arrow(ctx, { x: bx + bw / 2, y: ay }, { x: bx + bw / 2 + la, y: ay }, LT.blue, 4, 13); tag(ctx, "가속도", bx + bw / 2 + la + 8, ay + 5, LT.blue); }
      K.bigText(ctx, "a = " + a.toFixed(2) + " m/s²", 18, 44, 26, Math.abs(a - 4) < .005 ? "#8ff0c4" : "#ffffff");
      K.bigText(ctx, "알짜힘 " + net + " N ÷ " + m + " kg", 18, 72, 16, "#ffd35a");
      K.warn(ctx, LWm - 14, 30, "⚠ 화살표 길이·로봇 크기는 보기 쉽게", "right");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWm + 10, W, H, "F = ma 계산");
      K.row(ctx, "미는 힘 F", F + " N", cd.px, cd.R, 58, LT.orange);
      K.row(ctx, f > F ? "마찰력 (정지 마찰력)" : "마찰력", fe() + " N", cd.px, cd.R, 82, LT.violet);
      K.row(ctx, "알짜힘 F − 마찰력", net + " N", cd.px, cd.R, 106, LT.ink);
      K.row(ctx, "질량 m", m + " kg", cd.px, cd.R, 130);
      K.row(ctx, "가속도 a = 알짜힘 ÷ m", a.toFixed(2) + " m/s²", cd.px, cd.R, 154, LT.blue);
      K.bar(ctx, cd.px, 166, cd.w, a / 10, LT.blue);
      K.tip(ctx, Math.abs(a - 4) < .005 ? "a = 4 m/s² — 목표 달성" : (Math.abs(a) < .005 ? "알짜힘 0 → 속도가 변하지 않음" : "a = 4 m/s², a = 0 을 만들어 보세요"), cd.px - 4, 186, cd.w + 8, Math.abs(a - 4) < .005 || Math.abs(a) < .005 ? true : null);
      lWrap(ctx, Math.abs(a) < .005 ? "가속도 0 — 정지해 있던 로봇은 그대로 정지합니다." : (a > 0 ? "→ 점점 빨라집니다. 흐린 상자 = 1초 간격 위치" : ""), cd.px, 250, cd.w, 16);
      $("b-a-out").innerHTML = "가속도: <b>" + a.toFixed(2) + " m/s²</b> &nbsp;( a = (F − 마찰력) / m = (" + F + " − " + fe() + ") / " + m + " )" +
        (f > F ? "<br>바닥이 버틸 수 있는 마찰력(" + f + " N)이 미는 힘보다 큽니다. 이때 마찰력은 미는 힘과 똑같은 " + F + " N만 작용해(정지 마찰력) 알짜힘이 0이 되므로, 정지해 있던 로봇은 <b>그대로 멈춰 있습니다</b>. 마찰력이 미는 힘보다 커져 로봇을 뒤로 밀지는 않습니다." : "");
      graph();
      check();
    }
    function graph() {
      /* 입체 미니어처: 긴 창고 통로 블록 위에 1초마다 찍은 로봇 6대(스트로브). 간격이 벌어지는 모습과 속도 화살표가 주인공,
         오른쪽 흰 카드 안에 작은 속도-시간 · 위치-시간 그래프 */
      ctx2.clearRect(0, 0, W2, H2);
      var a = acc(), TM = 5, t = cur * TM, i, LW2 = 560;
      var vM = Math.max(Math.abs(a) * TM, .01), xM = Math.max(Math.abs(.5 * a * TM * TM), .01);
      K.studio(ctx2, 0, 0, LW2, H2, null);
      var GF = 280, GD = 110, ox = 48, oy = -27, X0 = 24, X1 = 384;
      floorSh(ctx2, 270, GF + 34, 270, 20, .28);
      var ft = ctx2.createLinearGradient(0, GF - GD * .55, 0, GF); ft.addColorStop(0, "#dde3ea"); ft.addColorStop(1, "#b9c2ce");
      slab(ctx2, 14, GF, 420, 30, GD, ft, "#7d8698", "#5b6476");
      ctx2.strokeStyle = "#f5b400"; ctx2.lineWidth = 2; ctx2.setLineDash([12, 9]);
      [[.12], [.88]].forEach(function (q) { ctx2.beginPath(); ctx2.moveTo(14 + GD * q[0], GF - GD * .55 * q[0]); ctx2.lineTo(434 + GD * q[0], GF - GD * .55 * q[0]); ctx2.stroke(); });
      ctx2.setLineDash([]);
      var cardX = LW2 + 10;
      for (i = 0; i <= 5; i++) {
        var fr = xM > .01 ? .5 * a * i * i / xM : 0, xx = X0 + ox + (X1 - X0) * fr, yb = GF + oy, on = i <= t + 1e-6, curI = i === Math.min(5, Math.floor(t + 1e-6));
        ctx2.globalAlpha = on ? (curI ? 1 : .42) : .12;
        wheel(ctx2, xx + 9, yb - 4, 6.5); wheel(ctx2, xx + 33, yb - 4, 6.5);
        box3(ctx2, xx, yb - 8, 42, 30, 24, "#2ed3bd");
        if (on && a > .005 && i > 0) { var vl = 8 + 64 * (a * i) / vM, vy = yb - 62 - (i % 2) * 14; K.arrow(ctx2, { x: xx + 20, y: vy }, { x: xx + 20 + vl, y: vy }, LT.teal, 3.4, 11); }
        ctx2.globalAlpha = 1;
        lt(ctx2, i + "초", xx - ox + 20, GF + (i % 2 ? 27 : 14), { s: 11, w: "800", a: "center", c: on ? "#ffffff" : "rgba(255,255,255,.5)" });
      }
      var xt = .5 * a * t * t, vt = a * t;
      K.bigText(ctx2, "x = " + xt.toFixed(1) + " m", 18, 44, 26, "#ffffff");
      K.bigText(ctx2, "t = " + t.toFixed(1) + "초 · v = " + vt.toFixed(1) + " m/s", 18, 72, 16, "#ffd35a");
      lt(ctx2, "청록 화살표 = 그 순간의 속도", LW2 - 16, 108, { s: 11.5, w: "800", a: "right", c: LT.teal });
      /* 오른쪽 카드: 작은 밝은 그래프 둘 */
      K.card(ctx2, cardX, 0, W2 - cardX, H2, "같은 설정으로 5초 동안");
      function panel(y0, h, title, fn, max, c) {
        var g = K.chart(ctx2, { x: cardX + 6, y: y0, w: W2 - cardX - 16, h: h, pl: 44, pt: 22, pb: 24, pr: 10, x0: 0, x1: TM, y0: 0, y1: max, xt: 5, yt: 2, light: true, xf: function (q) { return Math.round(q) + "초"; } });
        lt(ctx2, title, W2 - 16, y0 + 14, { s: 12, w: "900", a: "right", c: c });
        var pts = []; for (var k = 0; k <= 60; k++) { var tt = t * k / 60; pts.push([tt, clamp(Math.abs(fn(tt)), 0, max)]); }
        K.plot(ctx2, g, pts, c, { light: true, w: 3 });
        K.planet(ctx2, g.X(t), g.Y(clamp(Math.abs(fn(t)), 0, max)), 5, "#ffffff", c);
      }
      panel(40, 144, "속도 v — 곧은 직선", function (tt) { return a * tt; }, vM, LT.teal);
      panel(188, 148, "위치 x — 휘어진 곡선", function (tt) { return .5 * a * tt * tt; }, xM, LT.orange);
      $("b-gr-info").innerHTML = "t = " + t.toFixed(1) + "초 · v = at = <b>" + (a * t).toFixed(1) + " m/s</b> · x = ½at² = <b>" + (.5 * a * t * t).toFixed(1) + " m</b>" +
        (Math.abs(a) < .005 ? " — 가속도가 0이라 속도가 변하지 않습니다. 그래프도 평평합니다." : "");
    }
    function check() {
      var a = acc(), ch = false;
      if (Math.abs(a - 4) < 0.005 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(a) < 0.005 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("fmaGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-3a");
      if (got.b) done("m2-3b");
      if (got.c) done("m2-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>가속도를 정하는 것은 미는 힘 하나가 아니라 <b>알짜힘</b>입니다. 알짜힘이 0이면 밀고 있어도 <b>속도가 변하지 않습니다</b>. 정지해 있던 로봇은 계속 정지해 있고, 이미 움직이던 로봇이라면 같은 속도로 계속 움직입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw; canvas2._redraw = graph;
    $("b-F").addEventListener("input", function (e) { F = +e.target.value; $("b-F-val").textContent = F; draw(); });
    $("b-f").addEventListener("input", function (e) { f = +e.target.value; $("b-f-val").textContent = f; draw(); });
    $("b-m").addEventListener("input", function (e) { m = +e.target.value; $("b-m-val").textContent = m; draw(); });
    $("b-play").addEventListener("click", function () { run(40, 30, function (u) { cur = Math.max(u, 0.02); graph(); }); });
    window.sthPick({
      mount: "s2-q2",
      q: "같은 크기의 알짜힘으로 <b>질량이 2배</b>인 짐을 밀면 가속도는 어떻게 될까요?",
      options: ["2배가 된다", "그대로다", "절반이 된다", "4배가 된다"],
      answer: 2,
      why: ["a = 알짜힘 ÷ m입니다. 질량이 커지면 가속도는 작아집니다.",
        "질량 슬라이더만 움직여 보세요. 가속도가 바뀝니다.",
        "a = 알짜힘 ÷ m이므로 질량과 가속도는 <b>반비례</b>합니다. 힘과 가속도는 비례, 질량과 가속도는 반비례.",
        "반비례입니다. 4배가 되려면 질량이 ¼ 이 되어야 합니다."],
      onDone: function () { got.c = true; window.sthState("fmaGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 얼음판 위에서 밀기 ------------------------------------------ */
  (function () {
    var canvas = $("c-push"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var FP = 200, DT = 0.5, J = FP * DT, MB = 60;
    var mA = 60, box = { gen: 0 }, run = ticker(box), cur = 0, ran = false;
    var got = window.sthState("pushGot") || { a: false, b: false };

    function vA() { return J / mA; }
    function vB() { return J / MB; }
    function draw() {
      /* 입체 미니어처: 아이스링크를 잘라 낸 얼음 블록(뒤쪽 펜스·빨강/파랑 선) 위의 두 사람(질량이 클수록 몸집이 크다).
         미는 순간 크기가 같고 방향이 반대인 두 힘, 그 뒤 같은 시간 간격 잔상과 속도 화살표 */
      ctx.clearRect(0, 0, W, H);
      var GF = 270, GD = 96, LWp = 600, ox = 46, oy = -25, foot = GF + oy, C0 = 300, sA = 60, i;
      K.studio(ctx, 0, 0, LWp, H, null);
      floorSh(ctx, 300, GF + 36, 300, 22, .28);
      var ig = ctx.createLinearGradient(0, GF - GD * .55, 0, GF); ig.addColorStop(0, "#f2fbff"); ig.addColorStop(1, "#c4e8f8");
      slab(ctx, 16, GF, 478, 28, GD, ig, "#7cc4e8", "#5aa6d0");
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(16, GF, 478, 6);
      /* 뒤쪽 펜스 */
      var fx0 = 16 + GD, fy = GF - GD * .55;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(fx0, fy - 24, 478, 24);
      ctx.fillStyle = "#1c7ed6"; ctx.fillRect(fx0, fy - 10, 478, 4); ctx.fillStyle = "#e03131"; ctx.fillRect(fx0, fy - 5, 478, 3);
      ctx.fillStyle = "#c9d6e2"; ctx.beginPath(); ctx.moveTo(fx0 + 478, fy - 24); ctx.lineTo(fx0 + 478, fy); ctx.lineTo(fx0 + 470, fy + 4); ctx.lineTo(fx0 + 470, fy - 20); ctx.closePath(); ctx.fill();
      /* 링크 선: 가운데 빨강, 양쪽 파랑 */
      [[255, "#e03131", 4], [120, "#1c7ed6", 3], [390, "#1c7ed6", 3]].forEach(function (q) { ctx.strokeStyle = q[1]; ctx.globalAlpha = .55; ctx.lineWidth = q[2]; ctx.beginPath(); ctx.moveTo(q[0], GF); ctx.lineTo(q[0] + GD, fy); ctx.stroke(); ctx.globalAlpha = 1; });
      ctx.strokeStyle = "rgba(120,170,200,.55)"; ctx.lineWidth = 1;
      for (var sk = 0; sk < 10; sk++) { var kx = 40 + sk * 46, ky = GF - 8 - (sk % 4) * 11; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.quadraticCurveTo(kx + 20, ky - 6, kx + 44, ky - 4); ctx.stroke(); }
      var cA = clamp(C0 - 28 - cur * vA() * sA, 50, C0 - 28), cB = clamp(C0 + 28 + cur * vB() * sA, C0 + 28, 540);
      var hA = 96 + (mA - 60) * .9, hB = 96;
      if (cur > .05) for (i = 1; i <= 3; i++) { var u = cur * i / 4; ctx.globalAlpha = .22; figure(ctx, clamp(C0 - 28 - u * vA() * sA, 50, C0 - 28), foot, hA, "#ff6b6b"); figure(ctx, clamp(C0 + 28 + u * vB() * sA, C0 + 28, 540), foot, hB, "#20c997"); ctx.globalAlpha = 1; }
      figure(ctx, cA, foot, hA, "#ff6b6b"); figure(ctx, cB, foot, hB, "#20c997");
      tag(ctx, "서윤 A " + mA + " kg", cA + 14, foot - hA - 14, LT.red, "right");
      tag(ctx, "친구 B 60 kg", cB - 14, foot - hB - 14, LT.teal);
      if (cur < .28) {
        var ay = foot - hB * .6;
        K.arrow(ctx, { x: C0, y: ay }, { x: C0 - 66, y: ay }, LT.violet, 5, 15); K.arrow(ctx, { x: C0, y: ay }, { x: C0 + 66, y: ay }, LT.violet, 5, 15);
        tag(ctx, "200 N ↔ 200 N", C0, ay + 36, LT.violet, "center");
      }
      if (cur > .05) [[cA, -vA(), LT.red], [cB, vB(), LT.teal]].forEach(function (q) { var L = clamp(Math.abs(q[1]) * 34, 12, 100); K.arrow(ctx, { x: q[0], y: foot + 14 }, { x: q[0] + (q[1] > 0 ? L : -L), y: foot + 14 }, q[2], 4, 12); });
      K.bigText(ctx, "같은 힘 200 N", 18, 44, 25, "#ffffff");
      K.bigText(ctx, ran ? "A " + vA().toFixed(2) + " m/s · B " + vB().toFixed(2) + " m/s" : "0.5초 동안 서로 밀기", 18, 72, 16, "#ffd35a");
      K.warn(ctx, LWp - 14, 30, "⚠ 몸집 차이는 질량을 보기 쉽게 나타낸 것", "right");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWp + 10, W, H, "0.5초 동안 200 N → 충격량 100 N·s");
      K.row(ctx, "서윤 A의 질량", mA + " kg", cd.px, cd.R, 60, LT.red);
      K.row(ctx, "친구 B의 질량", "60 kg", cd.px, cd.R, 84, LT.teal);
      K.row(ctx, "A의 속도 (왼쪽)", vA().toFixed(2) + " m/s", cd.px, cd.R, 116, LT.red);
      K.bar(ctx, cd.px, 124, cd.w, vA() / 3.4, LT.red);
      K.row(ctx, "B의 속도 (오른쪽)", vB().toFixed(2) + " m/s", cd.px, cd.R, 158, LT.teal);
      K.bar(ctx, cd.px, 166, cd.w, vB() / 3.4, LT.teal);
      K.tip(ctx, mA > MB ? "무거운 A가 덜 밀려남" : (mA < MB ? "가벼운 A가 더 밀려남" : "질량이 같으면 똑같이"), cd.px - 4, 188, cd.w + 8, vA() < vB() - .001 ? true : null);
      lWrap(ctx, "힘의 크기가 같아도 질량이 크면 덜 밀려납니다.", cd.px, 246, cd.w, 16); lt(ctx, "a = F ÷ m", cd.px, 290, { s: 13, w: "900", c: LT.violet });
    }
    canvas._redraw = draw;
    function say() {
      if (!ran) { $("b-push-info").innerHTML = "A의 질량을 정하고 ‘0.5초 동안 서로 밀기’를 눌러 보세요."; return; }
      $("b-push-info").innerHTML = "서윤(" + mA + " kg)은 <b>" + vA().toFixed(2) + " m/s</b>, 친구(60 kg)는 <b>" + vB().toFixed(2) + " m/s</b>로 밀려났습니다. 받은 <b>힘도 충격량도 크기가 같은데</b> 속도가 다른 것은 <b>질량이 다르기</b> 때문입니다." +
        (mA > MB ? " 무거운 쪽이 덜 밀려납니다." : (mA < MB ? " 가벼운 쪽이 더 많이 밀려납니다." : " 질량이 같으면 똑같이 밀려납니다."));
    }
    function mission() {
      if (got.a) done("m2-4a");
      if (got.b) done("m2-4b");
      if (got.a && got.b) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>힘은 언제나 <b>서로 다른 두 물체</b>에 짝으로 나타납니다. 크기는 같지만 질량이 다르면 <b>결과(가속도)는 다릅니다.</b>");
        ep.clear(3);
      }
    }
    $("b-ma").addEventListener("input", function (e) { mA = +e.target.value; $("b-ma-val").textContent = mA + " kg"; cur = 0; draw(); });
    $("b-push").addEventListener("click", function () {
      ran = true; say();
      if (vA() < vB() - 0.001 && !got.a) { got.a = true; window.sthState("pushGot", got); mission(); }
      run(40, 30, function (u) { cur = u; draw(); });
    });
    window.sthSort({
      mount: "s2-sort",
      buckets: [
        { id: "r", label: "작용 반작용", sub: "서로 다른 두 물체에 하나씩" },
        { id: "e", label: "한 물체에 작용하는 평형력", sub: "한 물체에 두 힘이 함께" }
      ],
      items: [
        { t: "로켓이 가스를 아래로 밀고, 가스가 로켓을 위로 민다", a: "r", why: "로켓과 가스, 두 물체가 주고받는 힘입니다. 로켓은 공기를 밀어 나아가는 것이 아닙니다." },
        { t: "내가 땅을 뒤로 밀고, 땅이 나를 앞으로 민다", a: "r", why: "걸을 때마다 일어나는 작용 반작용입니다." },
        { t: "노가 물을 뒤로 밀고, 물이 배를 앞으로 민다", a: "r", why: "노와 물 사이의 작용 반작용입니다." },
        { t: "지구가 사과를 당기고, 사과가 지구를 당긴다", a: "r", why: "크기는 같지만 지구는 질량이 너무 커서 움직임이 보이지 않을 뿐입니다.", hint: "사과도 지구를 당길까요?" },
        { t: "헬리콥터 날개가 공기를 아래로 밀고, 공기가 헬리콥터를 위로 민다", a: "r", why: "날개와 공기 사이의 작용 반작용입니다." },
        { t: "책상 위의 책 — 책에 작용하는 중력과 책상이 책을 떠받치는 힘", a: "e", why: "두 힘이 모두 <b>책 하나</b>에 작용하므로 평형력입니다.", hint: "힘을 받는 물체가 몇 개인지 세어 보세요." },
        { t: "천장에 매달린 전등 — 전등에 작용하는 중력과 줄이 당기는 힘", a: "e", why: "둘 다 전등 하나에 작용합니다." },
        { t: "일정한 속도로 밀리는 상자 — 미는 힘과 마찰력", a: "e", why: "상자 하나에 작용하는 두 힘이 균형을 이루어 알짜힘이 0입니다.", hint: "상자 하나만 보세요." }
      ],
      doneText: "작용 반작용은 힘을 받는 <b>물체가 둘</b>, 평형력은 <b>하나</b>입니다.",
      onDone: function () { got.b = true; window.sthState("pushGot", got); mission(); }
    });
    draw(); say(); mission();
  })();

  /* 장면 5 — 결말 -------------------------------------------------------- */
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉣") === 0 ? "정확했습니다. 눈금을 바꾼 것은 속도가 아니라 가속도였습니다."
        : "체중계 화면에서 가속도 슬라이더만 움직여도 눈금이 바뀌었습니다. 답은 ㉣ 입니다 — 중력도 그대로였고, 고장도 아니었습니다.");
  }
  function finish() { window.sthState("r2", "해결 · 체중계는 질량이 아니라 떠받치는 힘 N = m(g+a)를 잰다"); }
  window.sthPick({
    mount: "s2-q3",
    q: "같은 트럭이 <b>시속 20 km</b>로 달릴 때와 <b>시속 80 km</b>로 달릴 때, 이 트럭의 <b>관성</b>은 어떻게 다를까요?",
    options: ["빠를수록 관성이 크다", "느릴수록 관성이 크다", "속도와 관계없이 같다", "짐의 양에 따라서만 달라진다"],
    answer: 2,
    why: ["빠른 트럭이 멈추기 어려운 것은 <b>운동량(mv)</b>이 커서이지 관성이 커진 것이 아닙니다.",
      "관성은 속도와 아무 관계가 없습니다.",
      "관성은 <b>질량에만</b> 관계가 있습니다. 같은 트럭이라면 서 있든 달리든 관성은 똑같습니다. 달라지는 것은 운동량과, 그것을 없애는 데 필요한 충격량입니다.",
      "짐을 실으면 질량이 커지니 관성도 커지는 것은 맞지만, 이 문제는 <b>같은 트럭</b>의 속도만 다른 경우입니다."],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅲ-2] 이야기 ② 엘리베이터 저울",
    items: [
      { id: "w1", label: "관성은 무엇에 달렸나", hint: "같은 속도로 달리는 트럭과 자전거 중 어느 쪽이 멈추기 어려운지, 그 까닭을 관성으로 설명하세요.", ph: "" },
      { id: "e2b", label: "서윤이에게 보내는 답장", hint: "엘리베이터 눈금이 55 kg → 50 kg → 45 kg으로 변한 세 구간에서 각각 가속도의 방향이 어땠는지 쓰고, N = m(g+a)로 설명하세요.", ph: "0~2초: … / 2~4초: … / 4~6초: …" }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 충돌 실험실
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "impulse", title: "신입 연구원의 첫 판단",
    question: "질량이 크게 다른 두 자동차가 정면으로 충돌합니다. <b>어느 쪽이 받는 충격량</b>이 더 클까요?",
    options: ["㉠ 가벼운 자동차", "㉡ 무거운 자동차", "㉢ 둘이 같다", "㉣ 속도에 따라 달라진다"],
    onPick: function (i) {
      window.sthState("impulseOK", i === 2 ? "맞음" : "어긋남");
      ep.clear(0);
    }
  });

  /* 장면 2 — 수레 충돌 --------------------------------------------------- */
  (function () {
    var canvas = $("c-cart"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var V0 = 3.0, ma = 4, mb = 2, kind = "elastic";
    var box = { gen: 0 }, run = ticker(box), phase = 0, res = null;
    var got = window.sthState("cartGot") || { a: false, b: false };

    function outcome() {
      if (kind === "elastic") {
        return { va: (ma - mb) * V0 / (ma + mb), vb: 2 * ma * V0 / (ma + mb), merged: false };
      }
      var vc = ma * V0 / (ma + mb);
      return { va: vc, vb: vc, merged: true };
    }
    function draw() {
      /* 입체 미니어처: 긴 금속 레일 위의 두 수레(질량만큼 큰 상자). 충돌 뒤에는 같은 시간 간격 잔상과 속도 화살표.
         오른쪽 흰 카드: 충돌 전후 운동량의 합(늘 같음)과 운동 에너지 */
      ctx.clearRect(0, 0, W, H);
      /* 공기 부상 궤도(에어 트랙) 블록: 윗면에 공기 구멍, 양 끝에 멈춤 블록. 수레는 질량만큼 크다 */
      var GFc = 300, LWc = 600, o = res || outcome(), i, rail = GFc - 18;
      K.studio(ctx, 0, 0, LWc, H, null);
      floorSh(ctx, 300, GFc + 40, 300, 22, .28);
      slab(ctx, 16, GFc, 506, 30, 66, metalG(ctx, 0, GFc - 36, 0, GFc), "#8a94a8", "#5b6476");
      ctx.fillStyle = "#6b7484"; ctx.fillRect(16, GFc + 22, 506, 8);
      ctx.fillStyle = "rgba(20,40,90,.35)";
      for (i = 0; i < 46; i++) for (var hr = 0; hr < 3; hr++) { ctx.beginPath(); ctx.arc(30 + i * 11 + 12 + hr * 12, GFc - 8 - hr * 11, 1.3, 0, 6.2832); ctx.fill(); }
      box3(ctx, 22, GFc - 4, 16, 26, 50, "#5b6476"); box3(ctx, 500, GFc - 4, 16, 26, 50, "#5b6476");
      var SC = .8;
      function posA(u) { return 390 - (44 + 3 * (ma + mb)) + o.va * u * 52 * SC; }
      function posB(u) { return o.merged ? posA(u) : 390 + o.vb * u * 52 * SC; }
      var xa = phase === 0 ? 150 : posA(phase), xb = phase === 0 ? 390 : posB(phase);
      xa = clamp(xa, 70, 480); xb = clamp(xb, 70, 490);
      function cart(x, mm, col, label, al) {
        var w = 44 + mm * 6, h = 30 + mm * 3, d = 26;
        ctx.globalAlpha = al == null ? 1 : al;
        if (al == null) floorSh(ctx, x + 8, rail + 2, w * .6, 5, .25);
        wheel(ctx, x - w / 2 + 11, rail - 6, 7.5); wheel(ctx, x + w / 2 - 5, rail - 6, 7.5);
        box3(ctx, x - w / 2, rail - 10, w, h, d, col);
        ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.fillRect(x - w / 2 + 4, rail - 10 - h + 4, w - 8, 4);
        if (al == null) lt(ctx, label, x + 2, rail - 10 - h / 2 + 5, { s: 13, w: "900", a: "center", c: "#ffffff" });
        ctx.globalAlpha = 1;
      }
      if (phase > 0) for (i = 1; i <= 3; i++) { var u = phase * i / 4; if (o.merged) cart(clamp(posA(u), 60, 520), ma + mb, "#7048e8", "", .2); else { cart(clamp(posA(u), 60, 520), ma, "#0c8599", "", .2); cart(clamp(posB(u), 60, 540), mb, "#e8590c", "", .2); } }
      if (o.merged && phase > 0) cart(xa, ma + mb, "#7048e8", "A+B " + (ma + mb) + "kg");
      else { cart(xa, ma, "#0c8599", "A " + ma + "kg"); cart(xb, mb, "#e8590c", "B " + mb + "kg"); }
      if (phase > 0 && phase < .18) K.glow(ctx, 386, rail - 36, 12 * (1 - phase / .18) + 2, "rgba(255,220,120,.95)", 3);
      if (phase > 0) [[xa, o.va, LT.teal], [xb, o.vb, LT.orange]].forEach(function (q) { if (Math.abs(q[1]) < .02) return; var L = clamp(Math.abs(q[1]) * 26, 10, 90); K.arrow(ctx, { x: q[0], y: GFc + 50 }, { x: q[0] + (q[1] > 0 ? L : -L), y: GFc + 50 }, q[2], 3.5, 11); });
      else { K.arrow(ctx, { x: xa, y: GFc + 50 }, { x: xa + 74, y: GFc + 50 }, LT.teal, 3.5, 11); tag(ctx, "3.0 m/s", xa + 84, GFc + 55, LT.teal); }
      var pB = ma * V0, pA = ma * o.va + mb * o.vb, kB = .5 * ma * V0 * V0, kA = .5 * ma * o.va * o.va + .5 * mb * o.vb * o.vb;
      K.bigText(ctx, "운동량 " + pB.toFixed(1) + " → " + pA.toFixed(1), 18, 44, 25, "#ffffff");
      K.bigText(ctx, kind === "elastic" ? "완전 탄성 충돌" : "완전 비탄성 충돌 (붙는다)", 18, 72, 16, "#ffd35a");
      if (o.va < -.001 && phase > 0) tag(ctx, "← A가 뒤로 튕겨 나감", 40, 130, LT.red);
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWc + 10, W, H, "충돌 전 → 충돌 후 (예상)");
      lt(ctx, "A " + ma + "kg × 3.0 + B " + mb + "kg × 0", cd.px, 56, { s: 11.5, c: LT.mute });
      K.row(ctx, "충돌 전 운동량의 합", pB.toFixed(1) + " kg·m/s", cd.px, cd.R, 80, LT.blue);
      K.bar(ctx, cd.px, 88, cd.w, pB / Math.max(pB, 1) * .95, LT.blue);
      lt(ctx, o.merged ? "A+B 함께 " + o.va.toFixed(2) + " m/s" : "A " + o.va.toFixed(2) + " m/s · B " + o.vb.toFixed(2) + " m/s", cd.px, 126, { s: 11.5, c: LT.mute });
      K.row(ctx, "충돌 후 운동량의 합", pA.toFixed(1) + " kg·m/s", cd.px, cd.R, 150, LT.green);
      K.bar(ctx, cd.px, 158, cd.w, pA / Math.max(pB, 1) * .95, LT.green);
      K.row(ctx, "운동 에너지", kB.toFixed(1) + " → " + kA.toFixed(1) + " J", cd.px, cd.R, 196, kA < kB - .01 ? LT.orange : LT.ink);
      K.tip(ctx, "운동량의 합은 충돌 전후 늘 같음", cd.px - 4, 214, cd.w + 8, true);
      lWrap(ctx, kind === "elastic" ? "완전 탄성 충돌은 운동 에너지도 보존됩니다." : "붙는 충돌은 운동 에너지 일부가 변형·열·소리로 바뀝니다.", cd.px, 272, cd.w, 16);
    }
    canvas._redraw = draw;
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.a && got.b) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>충돌 방식이 바뀌어도 <b>운동량의 합은 늘 그대로</b>였습니다. 달라진 것은 운동 에너지였습니다.");
        ep.clear(1);
      }
    }
    Array.prototype.forEach.call(document.querySelectorAll("#c-kind button"), function (b) {
      b.addEventListener("click", function () {
        kind = b.getAttribute("data-k");
        Array.prototype.forEach.call(document.querySelectorAll("#c-kind button"), function (x) { x.classList.toggle("on", x === b); });
        phase = 0; res = null; draw();
      });
    });
    $("c-ma").addEventListener("input", function (e) { ma = +e.target.value; $("c-ma-val").textContent = ma; phase = 0; res = null; draw(); });
    $("c-mb").addEventListener("input", function (e) { mb = +e.target.value; $("c-mb-val").textContent = mb; phase = 0; res = null; draw(); });
    $("c-go").addEventListener("click", function () {
      res = outcome();
      var pB = ma * V0, pA = ma * res.va + mb * res.vb;
      var kB = 0.5 * ma * V0 * V0, kA = 0.5 * ma * res.va * res.va + 0.5 * mb * res.vb * res.vb;
      $("c-cart-info").innerHTML = "충돌 전 운동량 <b>" + pB.toFixed(2) + " kg·m/s</b> → 충돌 후 <b>" + pA.toFixed(2) + " kg·m/s</b>. <b>운동량은 언제나 보존</b>됩니다. " +
        (res.merged ? "두 수레가 붙어 <b>" + res.va.toFixed(2) + " m/s</b>로 함께 굴러갑니다."
          : "A는 <b>" + res.va.toFixed(2) + " m/s</b>, B는 <b>" + res.vb.toFixed(2) + " m/s</b>가 되었습니다." + (res.va < 0 ? " A가 <b>뒤로 튕겨</b> 나갔습니다." : ""));
      $("c-energy").innerHTML = "운동 에너지: 충돌 전 " + kB.toFixed(2) + " J → 충돌 후 " + kA.toFixed(2) + " J" +
        (kind === "elastic" ? " — 완전 탄성 충돌은 <b>운동 에너지도 보존</b>됩니다."
          : " — 완전 비탄성 충돌은 <b>" + (kB - kA).toFixed(2) + " J가 사라집니다.</b> 변형·열·소리로 바뀐 것입니다. 그래도 운동량은 그대로입니다.");
      var ch = false;
      if (res.merged && Math.abs(res.va - V0 / 2) < 0.02 && !got.a) { got.a = true; ch = true; }
      if (!res.merged && res.va < -0.001 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("cartGot", got); mission(); }
      run(40, 30, function (u) { phase = Math.max(u, 0.02); draw(); });
    });
    draw(); mission();
  })();

  /* 장면 3 — 야구공 받기 ------------------------------------------------- */
  (function () {
    var canvas = $("c-catch"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var MB = 0.145, V0 = 40, DP = MB * V0, LIM = 400;   /* 합격선: 손을 30 cm 쯤 빼면 닿는 힘 */
    var t = 0.01;
    var got = window.sthState("catchGot") || { a: false, b: false };

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var F = DP / t, LWc = 560, GF = 292, i;
      /* 입체 미니어처: 야구장 흙바닥 블록 위로 날아오는 야구공(같은 시간 간격 잔상)과 글러브 낀 팔.
         손을 뒤로 빼는 거리만큼 글러브가 밀려나고(흐린 글러브 = 지나온 자리), 손이 받는 힘이 클수록 화살표·충격 표시가 커진다 */
      K.studio(ctx, 0, 0, LWc, H, null);
      floorSh(ctx, 280, GF + 32, 270, 20, .28);
      var dt2 = ctx.createLinearGradient(0, GF - 40, 0, GF); dt2.addColorStop(0, "#e2b98a"); dt2.addColorStop(1, "#c99a66");
      slab(ctx, 16, GF, 466, 26, 72, dt2, "#9a6a44", "#74502f");
      ctx.fillStyle = "#7a5233"; ctx.fillRect(16, GF + 16, 466, 10);
      ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, GF - 10); ctx.lineTo(500, GF - 10); ctx.stroke();
      var Rd = K.rng(4); ctx.fillStyle = "rgba(120,80,40,.35)"; for (i = 0; i < 60; i++) ctx.fillRect(30 + Rd() * 500, GF - 6 - Rd() * 32, 2, 1.4);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LWc, H, 14); ctx.clip();
      var dist = V0 * t / 2, back = clamp(dist / .6, 0, 1) * 150, g0 = 262, gx = g0 + back, by = 172;
      /* 공 그림자와 잔상 */
      floorSh(ctx, 150, GF - 22, 26, 6, .25);
      for (var gh = 3; gh >= 1; gh--) { ctx.globalAlpha = .14 * (4 - gh); K.planet(ctx, 190 - gh * 40, by, 20, "#f4f1ea", "#9a968c"); }
      ctx.globalAlpha = 1;
      K.planet(ctx, 190, by, 20, "#f4f1ea", "#9a968c");
      ctx.strokeStyle = "#d0383a"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(175, by, 14, -.9, .9); ctx.stroke(); ctx.beginPath(); ctx.arc(205, by, 14, Math.PI - .9, Math.PI + .9); ctx.stroke();
      K.arrow(ctx, { x: 214, y: by }, { x: g0 - 8, y: by }, LT.orange, 4, 14);
      /* 지나온 글러브 자리 */
      if (back > 6) for (i = 1; i <= 3; i++) { var gp = g0 + back * (i - 1) / 3; ctx.globalAlpha = .16; ctx.fillStyle = "#a8622e"; ctx.beginPath(); ctx.roundRect(gp, 118, 60, 112, 24); ctx.fill(); ctx.globalAlpha = 1; }
      /* 팔(소매)과 글러브 */
      var arm = ctx.createLinearGradient(0, 166, 0, 210); arm.addColorStop(0, "#6b9ae0"); arm.addColorStop(1, "#2f5ea8");
      ctx.fillStyle = arm; ctx.beginPath(); ctx.roundRect(gx + 40, 170, LWc - gx, 38, 18); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(gx + 50, 176, LWc - gx - 60, 5);
      var gl = ctx.createLinearGradient(gx, 118, gx + 60, 230); gl.addColorStop(0, "#e8ad72"); gl.addColorStop(.5, "#a8622e"); gl.addColorStop(1, "#6a3a1a");
      ctx.fillStyle = gl; ctx.beginPath(); ctx.roundRect(gx, 118, 60, 112, 24); ctx.fill();
      ctx.strokeStyle = "#f0c890"; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.roundRect(gx + 6, 124, 48, 100, 19); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#5a2f14"; ctx.beginPath(); ctx.ellipse(gx + 10, by, 9, 26, 0, 0, 6.2832); ctx.fill();
      /* 충격 표시와 손이 받는 힘 — 클수록 크게 */
      var hit = clamp(Math.log(F / 20) * 7, 4, 30), fl = clamp(16 + Math.sqrt(F) * 3.6, 24, 128);
      ctx.save(); ctx.strokeStyle = F <= LIM ? "rgba(15,159,118,.85)" : "rgba(224,49,49,.85)"; ctx.lineWidth = 2.6; ctx.lineCap = "round";
      for (i = 0; i < 8; i++) { var an = i * Math.PI / 4 + .3; ctx.beginPath(); ctx.moveTo(gx - 4 + Math.cos(an) * 10, by + Math.sin(an) * 10); ctx.lineTo(gx - 4 + Math.cos(an) * (10 + hit), by + Math.sin(an) * (10 + hit)); ctx.stroke(); }
      ctx.restore();
      K.arrow(ctx, { x: gx + 8, y: 98 }, { x: gx + 8 + fl, y: 98 }, F <= LIM ? LT.green : LT.red, 5 + Math.min(5, F / 250), 15);
      tag(ctx, "손이 받는 힘 " + Math.round(F) + " N", gx + 8, 80, F <= LIM ? LT.green : LT.red);
      if (back > 4) { K.arrow(ctx, { x: g0, y: GF - 24 }, { x: g0 + back, y: GF - 24 }, LT.teal, 3, 11); tag(ctx, "손을 약 " + (dist < 1 ? (dist * 100).toFixed(0) + " cm" : dist.toFixed(1) + " m") + " 빼며 받기", g0, GF + 16, LT.teal); }
      else tag(ctx, "손을 고정하고 받기 — 아주 짧은 시간에 멈춤", 30, GF + 16, LT.mute);
      ctx.restore();
      K.bigText(ctx, Math.round(F).toLocaleString() + " N", 18, 46, 28, F <= LIM ? "#8ff0c4" : "#ff9db0");
      K.bigText(ctx, "약 " + (F / G).toFixed(0) + " kg중이 손에", 18, 76, 16, "#ffd35a");
      tag(ctx, "야구공 145 g · 40 m/s", 110, 226, LT.ink, "center");
      K.warn(ctx, LWc - 14, H - 12, "⚠ 공·글러브 크기는 보기 쉽게", "right");
      /* 오른쪽 카드: 작은 힘-시간 그래프 */
      K.card(ctx, LWc + 10, 0, W - LWc - 10, H, "힘 – 시간 그래프 (색칠한 넓이 = 충격량)");
      var g = K.chart(ctx, { x: LWc + 14, y: 38, w: W - LWc - 24, h: 172, pl: 50, pr: 12, light: true, x0: 0, x1: .2, y0: 0, y1: 1200, xt: 4, yt: 4, xl: "시간 (초)", yl: "힘 (N)", xf: function (q) { return q.toFixed(2); } });
      var rx = g.X(Math.min(t, .2)), ry = g.Y(Math.min(F, 1200)), ok = F <= LIM;
      ctx.fillStyle = ok ? "rgba(15,159,118,.25)" : "rgba(224,49,49,.22)"; ctx.fillRect(g.L, ry, rx - g.L, g.B - ry);
      ctx.strokeStyle = ok ? LT.green : LT.red; ctx.lineWidth = 2.4; ctx.strokeRect(g.L, ry, rx - g.L, g.B - ry);
      var gy = g.Y(LIM); K.line(ctx, { x: g.L, y: gy }, { x: g.R, y: gy }, LT.yellow, 2, [6, 5]);
      tag(ctx, "합격선 " + LIM + " N", g.R - 4, gy - 8, LT.orange, "right");
      lt(ctx, t.toFixed(3) + "초 × " + F.toFixed(0) + " N = " + DP.toFixed(2) + " N·s", LWc + 28, 234, { s: 13, w: "900", c: LT.ink });
      lt(ctx, "충격량 = 0.145 × 40 = " + DP.toFixed(2) + " N·s (바뀌지 않음)", LWc + 28, 256, { s: 11.5, w: "800", c: LT.blue });
      K.tip(ctx, ok ? "합격선 아래 — 시간을 늘려 힘을 줄였다" : "아직 큽니다 — 멈추는 시간을 늘리기", LWc + 24, 272, W - LWc - 48, ok ? true : null);
      $("c-catch-info").innerHTML = "멈추는 시간 <b>" + t.toFixed(3) + "초</b> → 손에 걸리는 평균 힘 <b>" + F.toFixed(0) + " N</b> (약 " + (F / G).toFixed(0) + " kg중). " +
        (F <= LIM ? "🎉 합격선 아래입니다. 손을 뒤로 빼며 받으면 <b>같은 충격량</b>을 <b>더 긴 시간</b>에 나누어 받게 됩니다."
          : "아직 너무 큽니다. 멈추는 시간을 늘려 보세요.");
      var ch = false;
      if (F <= LIM && !got.a) { got.a = true; ch = true; }
      if (ch) { window.sthState("catchGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (got.a && got.b) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>충격량(F × Δt)은 정해져 있습니다. <b>시간을 늘리는 것만이</b> 힘을 줄이는 길입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-t").addEventListener("input", function (e) { t = +e.target.value; $("c-t-val").textContent = t.toFixed(3) + " 초"; draw(); });
    window.sthPick({
      mount: "s3-q1",
      q: "손을 뒤로 빼서 공이 멈추는 <b>시간을 2배</b>로 늘렸습니다. 충격량과 평균 힘은 어떻게 될까요?",
      options: ["충격량도 2배, 힘도 2배", "충격량은 그대로, 힘은 절반", "충격량은 절반, 힘은 그대로", "충격량은 그대로, 힘도 그대로"],
      answer: 1,
      why: ["공을 멈추려면 없애야 할 운동량이 정해져 있습니다. 충격량은 달라지지 않습니다.",
        "충격량 = 운동량의 변화 = 0.145 × 40 = 5.8 N·s로 고정입니다. F = 충격량 ÷ Δt이므로 시간이 2배면 힘은 절반입니다.",
        "충격량은 공의 운동량 변화로 정해져 있어 줄어들지 않습니다.",
        "그래프의 직사각형을 보세요. 가로가 길어지면 넓이가 같으려면 세로가 낮아져야 합니다."],
      onDone: function () { got.b = true; window.sthState("catchGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 크럼플 존 설계 (아이소메트릭 단면 모형: 벽과 자동차를 반으로 잘라 속을 보여 준다) */
  (function () {
    var canvas = $("c-crush"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var MC = 1400, V0 = 14, LIMIT = 1.20, GMAX = 20;
    var d = 0.20;
    var got = window.sthState("crushGot") || { a: false, b: false };

    /* ── 모형 좌표: x = 벽(먼 쪽) → 차 뒤쪽, y = 차 폭 방향(YC 에서 반으로 자름), z 위. 1 m = M 그림 단위 ── */
    var DH = 410, M = 70, XW = 40, YA = 37, YC = 100, ZW = 112;
    var I = K.iso({ ox: 480, oy: 126, s: 0.92, L: 420, D: 150 });
    var I2 = K.iso({ ox: 480, oy: 126, s: 0.92, L: 420, D: YC });     /* 자른 면(y = YC) 위에 그릴 때 */
    /* 차 옆모습 윤곽(앞 끝 0 m → 뒤 4.3 m). 셋째 값은 구겨질 때 주름이 지는 방향 */
    var TOP = [[0, 0.25], [0, 0.55], [0.1, 0.78]], BOT = [[4.0, 0.25], [3.0, 0.25], [2.4, 0.25], [1.2, 0.25], [0.9, 0.25, 1], [0.6, 0.25, -1], [0.3, 0.25, 1]], k;
    for (k = 1; k <= 15; k++) { var hs = 0.1 + 1.1 * k / 15; TOP.push([hs, 0.78 + 0.12 * (hs - 0.1) / 1.1, k < 15 ? (k % 2 ? 1 : -1) : 0]); }
    TOP.push([1.75, 1.42], [2.4, 1.43], [3.2, 1.45], [3.85, 1.0], [4.25, 0.95], [4.3, 0.3]);
    var NT = TOP.length, BODY = TOP.concat(BOT);

    /* 찌그러진 c m 일 때 원래 s 자리가 앞 끝에서 얼마나 떨어져 있나(앞부분 1.2 m 가 고르게 접힌다고 봄) */
    function sDef(s, c) {
      if (c <= LIMIT) { var r = (LIMIT - c) / LIMIT; return s < LIMIT ? s * r : s - c; }
      var e = c - (LIMIT);                       /* 앞부분이 다 접힌 뒤 승객실이 밀린 길이 */
      if (s < LIMIT) return 0;
      if (s < 2.4) return (s - LIMIT) * (1.2 - e) / 1.2;
      return s - c;
    }
    function amp(c) { var r = clamp((LIMIT - c) / LIMIT, 0, 1); return 0.09 * Math.sqrt(1 - r * r); }
    function wx(s, c, gap) { return XW + (gap + sDef(s, c)) * M; }
    function pc(s, z, c, gap) { return I.P(wx(s, c, gap), YC, z * M); }
    function pts(c, gap) {
      var A = amp(c);
      return BODY.map(function (p) { return { x: wx(p[0], c, gap), z: (p[1] + (p[2] || 0) * A) * M, s: p[0] }; });
    }
    function path(list, y) { ctx.beginPath(); list.forEach(function (q, i) { var p = I.P(q.x, y, q.z); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath(); }
    function seg(a, b, col2, w) { ctx.strokeStyle = col2; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }

    function metrics() {
      var acc = V0 * V0 / (2 * d);
      return { acc: acc, gN: acc / G, F: MC * acc, dt: 2 * d / V0, J: MC * V0, okG: acc / G <= GMAX, okL: d <= LIMIT };
    }

    /* 그림 상태: 재생 중이 아니면 충돌이 끝난 모습 */
    var play = false, ph = 1, APP = 1.1;
    function view() {
      if (!play || ph >= 0.92) return { gap: 0, c: d, q: 1 };
      if (ph < 0.45) return { gap: APP * (1 - ph / 0.45), c: 0, q: 0 };
      var q = (ph - 0.45) / 0.47;
      return { gap: 0, c: d * (1 - (1 - q) * (1 - q)), q: q };   /* 고르게 느려지며 멈춘다 */
    }

    function drawModel(m) {
      var st = view(), c = st.c, gap = st.gap, ok = m.okG && m.okL, box = [0, W];
      K.studio(ctx, 0, 0, W, DH, { x: I.P(210, 75, 0).x, y: I.P(420, 150, 0).y - 40, rx: 330, ry: 56 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      /* 시험장 바닥 */
      I.box(ctx, 0, 0, -10, 420, 150, 0, "#d9dee5", "#a3abb6", "#8a93a0");
      ctx.save(); ctx.setLineDash([12, 9]);
      seg(I.P(60, 128, 0), I.P(420, 128, 0), "rgba(240,190,40,.9)", 2.2);
      ctx.restore();
      /* 콘크리트 벽(자른 면이 보이게 반만) */
      I.box(ctx, 8, 10, 0, XW, YC, ZW, "#d7dbe1", "#a9afb8", "#c3c8cf");
      I2.face(ctx, "front", function () {
        ctx.save(); ctx.beginPath(); ctx.rect(8, 0, XW - 8, ZW); ctx.clip();
        var R = K.rng(41);
        for (var i = 0; i < 140; i++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.35)" : "rgba(60,60,70,.3)"; ctx.fillRect(8 + R() * (XW - 8), R() * ZW, 1.6, 1.6); }
        ctx.restore();
      });
      for (k = 0; k < 6; k++) {
        var z0 = 64 + k * 8, z1 = z0 + 8;
        I.quad(ctx, I.P(XW, 10, z0), I.P(XW, YC, z0), I.P(XW, YC, z1), I.P(XW, 10, z1), k % 2 ? "#2b2b30" : "#f2c230");
      }
      /* 충돌 순간의 차(점선) — 찌그러진 만큼 차가 더 나아갔다 */
      if (c > 0.005 && gap === 0) {
        ctx.save(); ctx.setLineDash([5, 4]); path(pts(0, 0), YC); ctx.strokeStyle = "rgba(30,45,70,.55)"; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
      }
      /* 차의 먼 쪽 절반 — 윗면과 뒷면 */
      var P = pts(c, gap), segs = [], i;
      for (i = 0; i < NT - 1; i++) {
        var a = P[i], b = P[i + 1], dx = b.x - a.x, dz = b.z - a.z;
        if (dx > 0.01 || dz < -0.01) segs.push({ a: a, b: b, dx: dx, dz: dz, s: (a.s + b.s) / 2 });
      }
      segs.sort(function (u, w) { return (u.a.x + u.b.x) - (w.a.x + w.b.x); });
      var paint = !m.okL && c > LIMIT ? "#c94f5c" : "#2ba493";
      segs.forEach(function (g) {
        var len = Math.sqrt(g.dx * g.dx + g.dz * g.dz) || 1, nz = g.dx / len, nx = -g.dz / len;
        var glassy = (g.s > 1.2 && g.s < 1.75) || (g.s > 3.2 && g.s < 3.85);
        var col2 = glassy ? "rgba(40,70,100,.82)" : K.tint(g.s < LIMIT ? (c > 0.02 ? "#3fb7a3" : "#2ba493") : paint, 0.7 + 0.36 * nz + 0.1 * nx);
        I.quad(ctx, I.P(g.a.x, YA, g.a.z), I.P(g.b.x, YA, g.b.z), I.P(g.b.x, YC, g.b.z), I.P(g.a.x, YC, g.a.z), col2);
        ctx.strokeStyle = col2; ctx.lineWidth = .6; ctx.stroke();
      });
      /* 자른 면: 차 속 */
      var t0 = I.P(wx(0, c, gap), YC, 100), t1 = I.P(wx(0, c, gap), YC, 0);
      var ig = ctx.createLinearGradient(0, t0.y, 0, t1.y); ig.addColorStop(0, "#eef2f6"); ig.addColorStop(1, "#c4ccd6");
      path(P, YC); ctx.fillStyle = ig; ctx.fill(); ctx.strokeStyle = "#1d5f56"; ctx.lineWidth = 2.4; ctx.stroke();
      /* 옆 유리 */
      [[1.8, 2.85], [2.95, 3.7]].forEach(function (wv) {
        var q1 = pc(wv[0], 1.0, c, gap), q2 = pc(wv[0] + 0.02, 1.36, c, gap), q3 = pc(wv[1], 1.38, c, gap), q4 = pc(wv[1], 1.0, c, gap);
        ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.lineTo(q3.x, q3.y); ctx.lineTo(q4.x, q4.y); ctx.closePath();
        ctx.fillStyle = "rgba(120,175,215,.35)"; ctx.fill();
      });
      /* 앞부분: 엔진과 구겨지는 뼈대(주황) */
      var fw = sDef(LIMIT, c), e1 = fw - 0.05, e0 = e1 - 0.55;
      if (e0 < 0.03) { e0 = 0.03; e1 = 0.58; }
      var ea = I.P(XW + (gap + e0) * M, YC, 0.32 * M), eb = I.P(XW + (gap + e1) * M, YC, 0.32 * M), ec = I.P(XW + (gap + e1) * M, YC, 0.74 * M), ed = I.P(XW + (gap + e0) * M, YC, 0.74 * M);
      var eg = ctx.createLinearGradient(0, ed.y, 0, ea.y); eg.addColorStop(0, "#8d96a3"); eg.addColorStop(1, "#4b525d");
      ctx.beginPath(); ctx.moveTo(ea.x, ea.y); ctx.lineTo(eb.x, eb.y); ctx.lineTo(ec.x, ec.y); ctx.lineTo(ed.x, ed.y); ctx.closePath(); ctx.fillStyle = eg; ctx.fill();
      var A = amp(c);
      [0.36, 0.84].forEach(function (zb) {
        ctx.strokeStyle = "#e07b24"; ctx.lineWidth = 3.4; ctx.lineJoin = "round"; ctx.beginPath();
        for (var j = 0; j <= 8; j++) { var p = pc(LIMIT * j / 8, zb + (j > 0 && j < 8 ? (j % 2 ? A : -A) : 0), c, gap); if (j) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
        ctx.stroke();
      });
      /* 승객실 뼈대 */
      var cage = !m.okL && c > LIMIT ? "#b3263a" : "#24434d";
      [[[LIMIT, 0.3], [LIMIT, 0.9]], [[LIMIT, 0.3], [4.0, 0.3]], [[1.25, 0.9], [1.75, 1.4]], [[1.75, 1.4], [3.2, 1.42]], [[2.92, 0.3], [2.92, 1.42]], [[3.2, 1.42], [3.85, 0.98]]].forEach(function (l2) {
        seg(pc(l2[0][0], l2[0][1], c, gap), pc(l2[1][0], l2[1][1], c, gap), cage, 4.6);
      });
      /* 바퀴 */
      I2.face(ctx, "front", function () {
        [0.85, 3.6].forEach(function (sw) {
          var x = XW + (gap + Math.max(sDef(sw, c), 0.34)) * M, r = 0.31 * M;   /* 바퀴는 벽을 뚫지 않는다 */
          ctx.fillStyle = "#23262c"; ctx.beginPath(); ctx.arc(x, 0.31 * M, r, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "#aab2bd"; ctx.beginPath(); ctx.arc(x, 0.31 * M, r * .52, 0, 6.2832); ctx.fill();
        });
      });
      /* 의자·탑승자·안전띠·에어백 */
      seg(pc(2.55, 0.5, c, gap), pc(3.05, 0.45, c, gap), "#3b3f46", 7);
      seg(pc(3.05, 0.45, c, gap), pc(2.97, 1.12, c, gap), "#3b3f46", 7);
      var lean = clamp(m.gN / 30, 0, 1) * 0.24 * (play ? st.q : 1);
      var hip = [2.86, 0.6], sh = [2.8 - lean * 0.7, 1.02], hd = [2.76 - lean, 1.2], kn = [2.45, 0.63], ft = [2.28, 0.32];
      seg(pc(hip[0], hip[1], c, gap), pc(kn[0], kn[1], c, gap), "#2f3f63", 6);
      seg(pc(kn[0], kn[1], c, gap), pc(ft[0], ft[1], c, gap), "#2f3f63", 5);
      seg(pc(hip[0], hip[1], c, gap), pc(sh[0], sh[1], c, gap), "#3f6fb5", 8);
      seg(pc(sh[0], sh[1], c, gap), pc(2.3, 0.95, c, gap), "#e9b996", 4);
      seg(pc(2.18, 0.84, c, gap), pc(2.3, 1.06, c, gap), "#1d2026", 3.6);
      if (c > 0.02) {
        var bag = pc(2.38, 1.02, c, gap), br = 0.17 * M * 0.92 * clamp(c / 0.12, 0.3, 1);
        var bg = ctx.createRadialGradient(bag.x - br * .3, bag.y - br * .3, 2, bag.x, bag.y, br);
        bg.addColorStop(0, "rgba(255,255,255,.98)"); bg.addColorStop(1, "rgba(205,212,222,.92)");
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bag.x, bag.y, br, 0, 6.2832); ctx.fill();
      }
      var hp = pc(hd[0], hd[1], c, gap);
      ctx.fillStyle = "#f1c7a5"; ctx.beginPath(); ctx.arc(hp.x, hp.y, 6.4, 0, 6.2832); ctx.fill();
      seg(pc(sh[0] + 0.03, sh[1] + 0.02, c, gap), pc(hip[0] - 0.05, hip[1] + 0.02, c, gap), "#ff9a3c", 2.6);
      /* 다가가는 동안: 속도 줄 */
      if (gap > 0) {
        for (k = 0; k < 4; k++) { var zl = (0.4 + k * 0.25) * M, xr = wx(4.3, 0, gap); seg(I.P(xr + 8, YC + 6, zl), I.P(xr + 30 + k * 6, YC + 6, zl), "rgba(40,60,90,.35)", 2); }
      }
      ctx.restore();

      /* 이름표 */
      I.label(ctx, 20, 10, ZW, "콘크리트 벽", -34, -10, "#f4f0e6", box);
      if (c <= LIMIT) I.label(ctx, wx(0.55 * LIMIT, c, gap), YC, 0.9 * M, "구겨지는 앞부분(크럼플 존)", -46, 34, "#ffd08a", box);
      else I.label(ctx, wx(1.5, c, gap), YC, 0.95 * M, "⚠ 승객실이 " + (c - LIMIT).toFixed(2) + " m 밀려 들어옴", -50, 44, "#ff9aac", box);
      I.label(ctx, wx(2.5, c, gap), YA, 1.44 * M, "단단한 승객실 뼈대", 46, -34, "#bfe6ff", box);
      I.label(ctx, wx(2.8, c, gap), YC, 1.2 * M, "탑승자 · 안전띠 · 에어백", 130, -6, "#f4f0e6", box);
      if (c > 0.005 && gap === 0) {
        var r0 = I.P(wx(4.3, c, 0), 128, 0), r1 = I.P(wx(4.3, 0, 0), 128, 0);
        seg(r0, r1, "#c0392b", 2.4);
        seg({ x: r0.x, y: r0.y - 6 }, { x: r0.x, y: r0.y + 6 }, "#c0392b", 2); seg({ x: r1.x, y: r1.y - 6 }, { x: r1.x, y: r1.y + 6 }, "#c0392b", 2);
        K.pill(ctx, "충돌 뒤 차가 더 나아간 거리 = 찌그러진 거리 " + c.toFixed(2) + " m", (r0.x + r1.x) / 2, r1.y + 30, { s: 11.5, a: "center", c: "#ffd08a", box: box });
      }
      /* 큰 글자 */
      var h1, h2, c2 = "#ffd35a";
      if (play && ph < 0.45) { h1 = "벽을 향해 시속 50 km"; h2 = "벽까지 " + gap.toFixed(2) + " m · 느린 화면"; c2 = "#ffffff"; }
      else if (play && ph < 0.92) { h1 = "앞부분이 접히는 중"; h2 = m.dt.toFixed(3) + "초 만에 멈춘다"; c2 = "#ffffff"; }
      else if (!m.okL) { h1 = "너무 물렀다"; h2 = "찌그러짐이 승객실까지"; c2 = "#ff9aac"; }
      else if (!m.okG) { h1 = "너무 단단하다"; h2 = "순식간에 멈춰 " + m.gN.toFixed(1) + " g"; c2 = "#ff9aac"; }
      else { h1 = "알맞게 구겨졌다"; h2 = "승객실은 그대로 · " + m.gN.toFixed(1) + " g"; c2 = "#7ff0c4"; }
      K.bigText(ctx, h1, 22, 54, 28, "#ffffff");
      K.bigText(ctx, h2, 22, 88, 18, c2);
      K.pill(ctx, "1,400 kg · 14 m/s (시속 50 km)", 22, 124, { s: 12, c: "#e8ecff" });
      K.warn(ctx, W - 14, 30, "⚠ 벽과 차를 반으로 잘라 속을 보임 · 주름은 과장", "right");
    }

    function drawPanel(m) {
      var y0 = DH + 8, ok = m.okG && m.okL;
      K.studio(ctx, 0, y0, W, H - y0, null);
      var g = K.chart(ctx, { x: 4, y: y0 + 4, w: 516, h: H - y0 - 8, pt: 30, pb: 34, light: true, x0: 0, x1: 0.24, y0: 0, y1: 1400, xt: 6, yt: 4, xl: "멈추는 데 걸린 시간 Δt (초)", yl: "평균 힘 (kN)", xf: function (q) { return q.toFixed(2); } });
      var rx1 = g.X(Math.min(m.dt, 0.24)), ry = g.Y(Math.min(m.F / 1000, 1400));
      ctx.fillStyle = ok ? "rgba(15,159,118,.25)" : "rgba(224,49,49,.22)"; ctx.fillRect(g.L, ry, rx1 - g.L, g.B - ry);
      ctx.strokeStyle = ok ? LT.green : LT.red; ctx.lineWidth = 2.4; ctx.strokeRect(g.L, ry, rx1 - g.L, g.B - ry);
      var fy = g.Y(MC * GMAX * G / 1000), lx = g.X(2 * LIMIT / V0);
      K.line(ctx, { x: g.L, y: fy }, { x: g.R, y: fy }, LT.orange, 1.8, [6, 5]);
      K.line(ctx, { x: lx, y: g.T }, { x: lx, y: g.B }, LT.violet, 1.8, [6, 5]);
      tag(ctx, "20 g 한계", g.R - 4, fy - 6, LT.orange, "right");
      tag(ctx, "길이 1.20 m 한계", lx + 6, g.T + 30, LT.violet);
      tag(ctx, "넓이 = 충격량 " + m.J.toLocaleString() + " N·s (설계와 상관없이 같음)", g.R, y0 + 20, LT.blue, "right");
      var cx0 = 530, cd = { px: cx0 + 18, R: W - 18 };
      K.card(ctx, cx0, y0 + 6, W - cx0 - 6, H - y0 - 12, "시험 결과");
      K.row(ctx, "멈추는 데 걸리는 시간 Δt", m.dt.toFixed(3) + " 초", cd.px, cd.R, y0 + 58);
      K.row(ctx, "탑승자의 감속도", m.gN.toFixed(1) + " g (" + m.acc.toFixed(0) + " m/s²)", cd.px, cd.R, y0 + 80, m.okG ? LT.green : LT.red);
      K.row(ctx, "자동차가 받는 평균 힘", Math.round(m.F).toLocaleString() + " N", cd.px, cd.R, y0 + 102);
      K.tip(ctx, "감속도 기준 (20 g 이하) — " + (m.okG ? "통과" : "탈락"), cd.px - 4, y0 + 110, W - cx0 - 42, m.okG);
      K.tip(ctx, "길이 기준 (1.20 m 이하) — " + (m.okL ? "통과" : "탈락"), cd.px - 4, y0 + 140, W - cx0 - 42, m.okL);
    }
    function paintAll() { var m = metrics(); ctx.clearRect(0, 0, W, H); drawModel(m); drawPanel(m); }

    function draw() {
      var m = metrics(), acc = m.acc, gN = m.gN, F = m.F, dt = m.dt, ok = m.okG && m.okL;
      paintAll();
      $("c-crush-info").innerHTML = "찌그러지는 거리 <b>" + d.toFixed(2) + " m</b> → 멈추는 시간 <b>" + dt.toFixed(3) + "초</b>, 탑승자의 감속도 <b>" + gN.toFixed(1) + " g</b>, 평균 힘 <b>" + Math.round(F).toLocaleString() + " N</b>. " +
        (ok ? "🎉 합격입니다. 앞부분이 알맞게 구겨져 멈추는 시간을 늘려 주었습니다."
          : (!m.okL ? "너무 무릅니다. 1.20 m를 넘으면 찌그러짐이 <b>승객실</b>까지 들어옵니다."
            : "너무 단단합니다. 순식간에 멈추면 <b>힘이 커집니다.</b> 거리를 늘려 보세요."));
      var ch = false;
      if (ok && !got.a) { got.a = true; ch = true; }
      if (ch) { window.sthState("crushGot", got); window.sthState("crushD", d.toFixed(2)); mission(); }
    }
    /* ▶ 충돌을 느리게 다시 보기 — 그림만 움직인다(미션 판정과 상관없음). 움직임 줄이기 설정이어도 누를 때만 돈다 */
    var pb = $("c-crush-play");
    function pbLab() { if (pb) pb.textContent = play ? "⏸ 멈추기" : "▶ 충돌 느리게 보기"; }
    if (pb) pb.addEventListener("click", function () { if (play) { play = false; } else { play = true; ph = 0; } pbLab(); paintAll(); });
    pbLab();
    K.animate(canvas, function (dt2) {
      if (!play) return;
      ph += dt2 / 4200;
      if (ph >= 1) { ph = 1; play = false; pbLab(); }
      paintAll();
    }, 30);
    function mission() {
      if (got.a) done("m3-4a");
      if (got.b) done("m3-4b");
      if (got.a && got.b) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>자동차 앞부분은 <b>튼튼하게</b>가 아니라 <b>잘 구겨지게</b> 만듭니다. 대신 승객실은 단단해야 합니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("c-d").addEventListener("input", function (e) { d = +e.target.value; $("c-d-val").textContent = d.toFixed(2) + " m"; draw(); });
    window.sthSort({
      mount: "s3-sort",
      buckets: [
        { id: "t", label: "시간을 늘려 힘을 줄인다", sub: "몸을 지키려는 쪽" },
        { id: "s", label: "시간을 줄여 힘을 키운다", sub: "세게 때리려는 쪽" }
      ],
      items: [
        { t: "🎈 에어백이 부풀어 오른다", a: "t", why: "멈추는 시간을 늘리고 힘이 걸리는 넓이도 넓힙니다." },
        { t: "🔗 안전띠가 조금 늘어난다", a: "t", why: "몸이 멈추는 시간을 늘려 평균 힘을 줄입니다." },
        { t: "🚗 자동차 앞부분이 구겨진다", a: "t", why: "방금 설계한 크럼플 존입니다." },
        { t: "🪢 번지점프 줄이 쭉 늘어난다", a: "t", why: "늘어나는 동안 천천히 멈추게 합니다." },
        { t: "🤸 체조 선수가 두꺼운 매트에 착지한다", a: "t", why: "매트가 눌리는 동안 멈추는 시간이 길어집니다." },
        { t: "⚾ 포수가 글러브를 뒤로 빼며 공을 받는다", a: "t", why: "앞 장면에서 직접 확인했습니다." },
        { t: "🔨 단단한 망치로 못을 내리친다", a: "s", why: "아주 짧은 시간에 멈추게 해 큰 힘을 냅니다.", hint: "망치는 몸을 지키려는 도구일까요?" },
        { t: "🥋 태권도 선수가 송판을 순간적으로 가격한다", a: "s", why: "짧은 시간에 멈춰야 힘이 커져 송판이 부러집니다." },
        { t: "⛏️ 단단한 모루 위에 쇠를 올리고 두드린다", a: "s", why: "무른 바닥이면 시간이 길어져 힘이 작아집니다.", hint: "왜 푹신한 바닥 위에서는 대장일을 못할까요?" }
      ],
      doneText: "같은 식(F = 충격량 ÷ 시간)을 반대 방향으로 쓴 것뿐입니다.",
      onDone: function () { got.b = true; window.sthState("crushGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 -------------------------------------------------------- */
  var STEPS = [
    "자동차가 벽에 부딪혀 차체가 멈추기 시작한다",
    "몸은 관성 때문에 원래 속도 그대로 앞으로 나아간다",
    "안전띠가 몸을 붙잡아, 몸이 멈추는 데 걸리는 시간을 늘린다",
    "에어백이 펴져 몸이 닿는 넓이를 넓히고 멈추는 시간을 더 늘린다",
    "운동량의 변화(충격량)는 그대로지만, 시간이 길어진 만큼 평균 힘이 줄어든다"
  ];
  function reveal() {
    $("e3-wrap").hidden = false;
    var p = window.sthState("impulse") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 판단</b> " + (p || "기록 없음") + " — " +
      (window.sthState("impulseOK") === "맞음" ? "정확했습니다. 충격량은 둘이 같습니다."
        : "정답은 ㉢ 입니다. 받는 충격량은 둘이 같고, 달라지는 것은 속도 변화입니다.") +
      "<br><b>내가 통과시킨 설계</b> 앞부분이 " + (window.sthState("crushD") || "-") + " m 찌그러지는 자동차";
  }
  function finish() { window.sthState("r3", "해결 · 안전장치는 충격량을 줄이는 것이 아니라 시간을 늘린다 (설계 " + (window.sthState("crushD") || "-") + " m)"); }
  window.sthOrder({
    mount: "s3-order", steps: STEPS,
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅲ-2] 이야기 ③ 충돌 실험실",
    items: [
      { id: "w2", label: "충격량은 같은데 피해는 다르다", hint: "두 자동차가 충돌할 때 무엇이 같고 무엇이 다른지, 오개념 상자를 근거로 정리해 쓰세요.", ph: "같은 것: … / 다른 것: … / 그래서 …" },
      { id: "w3", label: "안전장치가 하는 일", hint: "에어백이나 안전벨트가 충격량 식의 어느 값을 바꾸는지 쓰세요.", ph: "" }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅲ-2] 역학 시스템 — 정리",
  recap: [
    { key: "r1", label: "① 피사에서 달까지" },
    { key: "r2", label: "② 엘리베이터 저울" },
    { key: "r3", label: "③ 충돌 실험실" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "떨어지는 깃털, 오르내리는 체중계 눈금, 구겨지는 자동차. 세 이야기에 공통으로 들어 있는 생각을 ‘힘’과 ‘질량’이라는 말을 넣어 한 문장으로 쓰세요.", ph: "" },
    { id: "w4", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다.", ph: "" }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-3-2", unitLabel: "[통합과학1 Ⅲ-2] 역학 시스템",
  rows: [
    { key: "r1", label: "① 피사에서 달까지" },
    { key: "r2", label: "② 엘리베이터 저울" },
    { key: "r3", label: "③ 충돌 실험실" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
