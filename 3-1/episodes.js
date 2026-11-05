/* 통합과학1 Ⅲ-1 지구시스템 — 소단원별 이야기 세 편
   01 모래 한 알의 여행 / 02 세 개의 난로 / 03 갈라지는 땅
   공용 부품: ../assets/theme.js (sthUnit·sthState·sthGate·sthWork·setupCanvas·cssVar·drawArrow),
             ../assets/story.js (sthStory·sthMission·sthSort·sthOrder·sthPick), ../assets/share.js (sthShare) */
(function () {
"use strict";

window.sthUnit("is1-3-1");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KS = K.C, REDUCE = K.REDUCE;
/* 캔버스마다 무대 종류와 별 씨앗 */
var STAGE = {
  "c-water": ["ocean", 3], "c-map": ["space", 5], "c-volc": ["night", 9],
  "c-stove": ["night", 21], "c-budget": ["space", 23], "c-tide": ["space", 25],
  "c-bnd": ["earth", 31], "c-quake": ["ocean", 33], "c-hot": ["ocean", 35], "c-future": ["ocean", 37]
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
function wrap(ctx, s, maxW, o) {                 /* 글자 단위 줄바꿈 (한글) */
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  var line = "", lines = [];
  for (var i = 0; i < s.length; i++) {
    var t = line + s.charAt(i);
    if (ctx.measureText(t).width > maxW && line.length) { lines.push(line); line = s.charAt(i); }
    else line = t;
  }
  if (line.length) lines.push(line);
  return lines;
}
function wrapText(ctx, s, x, y, maxW, lh, o) {
  var lines = wrap(ctx, s, maxW, o);
  for (var i = 0; i < lines.length; i++) text(ctx, lines[i], x, y + i * lh, o);
  return lines.length;
}
function axes(ctx, x0, y0, x1, y1) {
  ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
}
function card(ctx, x, y, w, h, c) {      /* 유리판 칸: 색을 주면 그 색으로 물든 칸 */
  if (!c) { glass(ctx, x, y, w, h, "#8fa6ff", 9); return; }
  var g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, rgba(c, .95)); g.addColorStop(1, rgba(c, .7));
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.stroke();
}
function rows(ctx, list, x, y, w, gap, opt) {     /* [라벨, 값] 표 */
  opt = opt || {};
  for (var i = 0; i < list.length; i++) {
    var yy = y + i * gap;
    card(ctx, x, yy, w, gap - 5, list[i][2] ? v(list[i][2]) : null);
    text(ctx, list[i][0], x + 12, yy + (gap - 5) / 2 + 4, { s: opt.s || 11.5, c: v("--mist") });
    text(ctx, list[i][1], x + w - 12, yy + (gap - 5) / 2 + 4, { s: (opt.s || 11.5) + 0.5, w: "800", a: "right", c: list[i][3] ? v(list[i][3]) : v("--ink") });
  }
}
function pointOnCanvas(canvas, e) {
  var r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (canvas._w / r.width), y: (e.clientY - r.top) * (canvas._h / r.height) };
}

/* ---- 밝은 스튜디오 + 블록 모형 (../assets/kit.js 의 K.studio · K.iso · K.card) ---- */
var LT = K.LT;
function lerp(a, b, t) { return a + (b - a) * t; }
function lt(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function sideCard(ctx, x, W, H, title) { K.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
function lWrap(ctx, s, x, y, maxW, lh, o) { o = o || {}; return wrapText(ctx, s, x, y, maxW, lh, { s: o.s || 11, w: o.w || "600", c: o.c || LT.mute }); }
function hexMix(a, b, t) {
  var p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16);
  function ch(s) { return Math.round(((p >> s) & 255) * (1 - t) + ((q >> s) & 255) * t); }
  return "#" + ("000000" + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16)).slice(-6);
}
/* 입체 구름 덩어리 */
function puffCloud(ctx, x, y, r, a) {
  var P = [[-1.1, .25, .62], [-.45, -.15, .82], [.3, -.3, .95], [1, .1, .7], [.2, .3, .8], [-.5, .35, .7]];
  ctx.save(); ctx.globalAlpha = a == null ? 1 : a;
  P.forEach(function (q) {
    var px = x + q[0] * r, py = y + q[1] * r, rr = q[2] * r;
    var g = ctx.createRadialGradient(px - rr * .35, py - rr * .45, rr * .1, px, py, rr);
    g.addColorStop(0, "#ffffff"); g.addColorStop(.65, "#e6ebf2"); g.addColorStop(1, "#a9b4c5");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rr, 0, 6.2832); ctx.fill();
  });
  ctx.restore();
}
/* 구불구불한 복사(적외선) 화살표 */
function wavyArrow(ctx, a, b, col, w, ph, amp) {
  var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, s;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 3; ctx.lineCap = "round"; ctx.beginPath();
  for (s = 0; s <= L - 14; s += 2) { var o = Math.sin(s / 8 + (ph || 0)) * (amp || 5), px = a.x + ux * s + nx * o, py = a.y + uy * s + ny * o; if (s) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
  ctx.stroke(); ctx.restore();
  K.arrow(ctx, { x: b.x - ux * 16, y: b.y - uy * 16 }, b, col, w || 3, 12);
}
/* 블록 모형 위의 원뿔(화산·섬): 바닥 원 중심 (x, y, z0), 반지름 r, 높이 h — 왼쪽 위에서 빛 */
function isoCone(ctx, I, x, y, z0, r, h, c1, c2, zCut) {
  var top = zCut != null ? Math.min(h, zCut - z0) : h, rr = r * (1 - top / h), N = 28, i, a;
  var base = [], up = [];
  for (i = 0; i <= N; i++) { a = Math.PI * i / N; base.push(I.P(x + r * Math.cos(a + Math.PI * -.25), y + r * Math.sin(a + Math.PI * -.25), z0)); }
  var ap = I.P(x, y, z0 + top);
  for (i = 0; i <= N; i++) { a = Math.PI * i / N; up.push(rr > .5 ? I.P(x + rr * Math.cos(a + Math.PI * -.25), y + rr * Math.sin(a + Math.PI * -.25), z0 + top) : ap); }
  var xs = base.map(function (p) { return p.x; }), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  var g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath();
  base.forEach(function (p, k) { if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
  for (i = up.length - 1; i >= 0; i--) ctx.lineTo(up[i].x, up[i].y);
  ctx.closePath(); ctx.fill();
  if (rr > .5) {
    ctx.fillStyle = c1; ctx.beginPath();
    for (i = 0; i <= 2 * N; i++) { a = Math.PI * i / N; var q = I.P(x + rr * Math.cos(a), y + rr * Math.sin(a), z0 + top); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
    ctx.closePath(); ctx.fill();
  }
  return ap;
}
/* 납작한 이름 띠(밝은 바탕 위): 흰 바탕 + 색 글자 */
function tag(ctx, s, x, y, col, a) { return K.pill(ctx, s, x, y, { s: 11.5, a: a, c: col || LT.ink, bg: "rgba(255,255,255,.88)", line: "rgba(20,40,90,.18)" }); }

/* =========================================================================
   이야기 ① 모래 한 알의 여행
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 */
  window.sthGate({
    gate: "g1", key: "p1", title: "조사관의 첫 추리",
    question: "분석표를 보고 짐작해 보세요. 이 모래 한 알은 지금 내 손에 오기까지 지구시스템의 <b>어느 권역</b>을 거쳐 왔을까요?",
    options: ["㉠ 지권 한 곳", "㉡ 지권과 수권 두 곳", "㉢ 지권·수권·기권 세 곳", "㉣ 네 권역 모두"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 물의 체류 시간 ------------------------------------------------ */
  (function () {
    var canvas = $("c-water"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    /* 저장량 km³, 해마다 드나드는 양 km³/년 (널리 쓰이는 추정값) */
    var ST = [
      { id: "sea", name: "바닷물", vol: 1338000000, flow: 434000, col: "--brand", note: "지구 전체 물의 약 96.5%" },
      { id: "ice", name: "빙하", vol: 24100000, flow: 0, col: "--cold", note: "민물의 대부분이 여기 얼어 있다" },
      { id: "gnd", name: "지하수", vol: 23400000, flow: 0, col: "--violet", note: "우리가 쓰는 민물의 대부분" },
      { id: "riv", name: "하천", vol: 2120, flow: 36000, col: "--teal", note: "육지에서 바다로 돌려보내는 통로" },
      { id: "atm", name: "대기(수증기)", vol: 12900, flow: 505000, col: "--coral", note: "저장량은 가장 적은데 드나드는 양은 가장 많다" }
    ];
    var sel = "sea", k = 1, wT = 0;
    var got = window.sthState("waterGot") || { a: false, b: false };

    function resYears(s, kk) { return s.flow ? s.vol / (s.flow * kk) : null; }
    function resText(s, kk) {
      var y = resYears(s, kk);
      if (y === null) return "수백 ~ 수만 년 (이 모형에서는 계산하지 않음)";
      if (y < 1) return (y * 365.25).toFixed(1) + " 일";
      if (y < 100) return y.toFixed(1) + " 년";
      return Math.round(y).toLocaleString() + " 년";
    }
    /* 블록 모형: 왼쪽 바다 → 모래 해안 → 하천이 흐르는 들판 → 뒤쪽 오른편 빙하 덮인 산. 앞면 단면에 지하수층, 위로 구름·증발·비 */
    var LW = 600, SLW = 54;
    var I = K.iso({ ox: 300, oy: 176, s: 0.62, L: 420, D: 230 });
    function coastX(y) { return 140 + 14 * Math.sin(y / 31); }
    function riverY(x) { return 150 + 26 * Math.sin(x / 55 + .6); }
    function mtn(x, y) { var a = (x - 350) / 60, b = (y - 50) / 52, c = (x - 272) / 48, d = (y - 28) / 38; return 128 * Math.exp(-(a * a + b * b)) + 66 * Math.exp(-(c * c + d * d)); }
    function zg(x, y) {
      var c = coastX(y);
      if (x < c) return 16 + (SLW - 22) * Math.pow(Math.max(0, x) / c, 2.2);
      var z = SLW + 5 + Math.min(14, (x - c) * .22) + mtn(x, y), rd = Math.abs(y - riverY(x));
      if (x < 330 && rd < 9) z -= (9 - rd) * .7;
      return z;
    }
    function isRiver(x, y) { return x > coastX(y) - 4 && x < 322 && Math.abs(y - riverY(x)) < 6; }
    function colW(x, y, z, l) {
      if (z < SLW - .5) return K.tint("#c9b38a", l);
      if (isRiver(x, y)) return K.tint(sel === "riv" ? "#3d9cf0" : "#5aa6e0", l);
      if (z > SLW + 104) return K.tint(sel === "ice" ? "#ffffff" : "#eef5fc", l);
      if (z > SLW + 86) return K.tint("#c8d9e8", l);
      if (z > SLW + 42) return K.tint("#8d8170", l);
      if (z < SLW + 9) return K.tint("#e2cf98", l);
      return K.tint((Math.floor(x / 22 + y / 31) % 2) ? "#79b04e" : "#6ea645", l);
    }
    function resShort(s, kk) { var y = resYears(s, kk); if (y === null) return "수백~수만 년"; if (y < 1) return (y * 365.25).toFixed(1) + "일"; if (y < 100) return y.toFixed(1) + "년"; return Math.round(y).toLocaleString() + "년"; }
    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var ph = wT / 1000, i, BX = [0, LW];
      K.studio(ctx, 0, 0, LW, H, { x: 310, y: 392, rx: 300, ry: 44 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 지형 + 칸마다 바닷물 */
      I.field(ctx, zg, colW, 52, 28, function (c, x0, y0, x1, y1, zMax, zMin) {
        if (SLW > zMin + .2) {
          var dp = SLW - zMin, al = Math.min(.8, .32 + dp / 60);
          I.quad(c, I.P(x0, y0, SLW), I.P(x1, y0, SLW), I.P(x1, y1, SLW), I.P(x0, y1, SLW), "rgba(" + Math.round(60 - dp * .4) + "," + Math.round(150 - dp * .5) + ",225," + al.toFixed(2) + ")");
        }
      });
      /* 앞면·오른쪽 면: 땅속 단면(앞면에 지하수층) */
      ["front", "right"].forEach(function (side) {
        var zf = function (u) { return side === "front" ? zg(u, I.D) : zg(I.L, u); };
        I.face(ctx, side, function (Lw) {
          I.profile(ctx, side, zf, 0);
          var g = ctx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, "#5b4a3c"); g.addColorStop(.6, "#8a735a"); g.addColorStop(1, "#b39673");
          ctx.fillStyle = g; ctx.fill();
          ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
          var R = K.rng(side === "front" ? 11 : 13);
          for (i = 0; i < Lw; i++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.14)" : "rgba(40,28,18,.22)"; ctx.fillRect(R() * Lw, R() * 120, 1.6, 1.6); }
          if (side === "front") {
            var c0 = coastX(I.D) - 10, on = sel === "gnd";
            ctx.fillStyle = on ? "rgba(60,150,255,.62)" : "rgba(80,150,230,.42)"; ctx.fillRect(c0, 20, Lw - c0, 18);
            for (i = 0; i < 70; i++) { ctx.fillStyle = "rgba(220,240,255,.75)"; ctx.fillRect(c0 + R() * (Lw - c0), 21 + R() * 16, 1.6, 1.6); }
          }
          ctx.restore();
        });
      });
      I.water(ctx, SLW, function (u, side) { return side === "front" ? zg(u, I.D) : zg(I.L, u); }, { surface: false });
      I.shade(ctx, "front", function (u) { return Math.max(zg(u, I.D), SLW); });
      I.shade(ctx, "right", function (u) { return Math.max(zg(I.L, u), SLW); });
      I.edges(ctx, zg(I.L, I.D), zg(I.L, I.D));
      [[205, 40], [228, 210], [250, 30], [300, 200], [190, 90], [360, 180]].forEach(function (q, k) { I.tree(ctx, q[0], q[1], zg(q[0], q[1]), .7 + (k % 3) * .1); });
      /* 증발(바다 → 대기) · 비(대기 → 땅) · 유출(하천 → 바다) — 순환 배율에 따라 빨라진다 */
      var sp = k, cS = I.P(110, 110, 205), cL = I.P(300, 140, 225);
      for (i = 0; i < 12; i++) {
        var u = (ph * .35 * sp + i / 12) % 1, ex = 40 + (i * 37) % 110, ey = 40 + (i * 53) % 170, q = I.P(ex, ey, SLW + u * 140);
        ctx.fillStyle = "rgba(90,160,230," + (.75 * (1 - u)).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(q.x, q.y, 2.2, 0, 6.2832); ctx.fill();
      }
      ctx.strokeStyle = "rgba(60,120,200,.65)"; ctx.lineWidth = 1.3;
      for (i = 0; i < 26; i++) {
        var ru = (ph * .9 * sp + i * .137) % 1, rx = 250 + (i * 29) % 110, ry = 100 + (i * 41) % 90, zt = 205 - ru * (205 - zg(rx, ry));
        var a1 = I.P(rx, ry, zt), b1 = I.P(rx, ry, zt - 9); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x - 1.5, b1.y); ctx.stroke();
      }
      ctx.save(); ctx.globalAlpha = .9;
      K.arrow(ctx, I.P(90, 120, SLW + 20), I.P(100, 112, 170), "#1c7ed6", 3, 12);
      K.arrow(ctx, { x: cS.x + 40, y: cS.y - 6 }, { x: cL.x - 44, y: cL.y - 2 }, "#5c7086", 3, 12);
      K.arrow(ctx, I.P(250, riverY(250), zg(250, riverY(250)) + 6), I.P(160, riverY(160), SLW + 6), "#1c7ed6", 3, 11);
      ctx.restore();
      puffCloud(ctx, cS.x, cS.y, 24, .96); puffCloud(ctx, cL.x, cL.y, 28, .98);
      if (sel === "atm") { ctx.strokeStyle = "#f59f00"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cS.x, cS.y, 46, 30, 0, 0, 6.2832); ctx.stroke(); }
      ctx.restore();
      /* 이름표 — 고른 저장소는 노란 글자와 고리 */
      function Lc(id) { return sel === id ? "#ffd35a" : "#e8ecff"; }
      function ring(x, y, z) { if (true) { var p = I.P(x, y, z); ctx.strokeStyle = "#f59f00"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, 6.2832); ctx.stroke(); } }
      var spot = { sea: [60, 200, SLW], ice: [350, 50, zg(350, 50)], gnd: [280, I.D, 29], riv: [235, riverY(235), zg(235, riverY(235))] };
      if (spot[sel]) ring(spot[sel][0], spot[sel][1], spot[sel][2]);
      I.label(ctx, 60, 200, SLW, "바닷물", -34, 44, Lc("sea"), BX);
      I.label(ctx, 350, 50, zg(350, 50), "빙하", 52, -14, Lc("ice"), BX);
      I.label(ctx, 280, I.D, 29, "지하수", 56, 40, Lc("gnd"), BX);
      I.label(ctx, 235, riverY(235), zg(235, riverY(235)), "하천", 70, 26, Lc("riv"), BX);
      K.pill(ctx, "대기(수증기)", cS.x - 30, cS.y - 34, { s: 12, a: "center", c: Lc("atm"), box: BX });
      K.pill(ctx, "증발", I.P(100, 112, 120).x - 14, I.P(100, 112, 120).y, { s: 11, a: "right", c: "#bfe6ff", box: BX });
      K.pill(ctx, "비·눈", cL.x + 40, cL.y + 34, { s: 11, c: "#bfe6ff", box: BX });
      var cur = null; for (i = 0; i < ST.length; i++) if (ST[i].id === sel) cur = ST[i];
      K.bigText(ctx, cur.name + " · " + resShort(cur, k), 18, 46, 25, "#ffffff");
      K.bigText(ctx, "저장량 " + cur.vol.toLocaleString() + " km³", 18, 76, 16, "#ffd35a");
      K.warn(ctx, 16, H - 16, "⚠ 높이·크기는 보기 쉽게 바꾼 것");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LW + 10, W, H, "머무는 시간 = 저장량 ÷ 해마다 드나드는 양");
      lt(ctx, resShort(cur, k), cd.px, 66, { s: 24, w: "900", c: LT.orange });
      lt(ctx, cur.name, cd.R, 66, { s: 13, w: "800", a: "right", c: LT.mute });
      for (i = 0; i < ST.length; i++) K.row(ctx, (ST[i].id === sel ? "▶ " : "") + ST[i].name, resShort(ST[i], k), cd.px, cd.R, 100 + i * 25, ST[i].id === sel ? LT.orange : LT.ink);
      lt(ctx, "순환 빠르기 × " + k.toFixed(2), cd.px, 238, { s: 12.5, w: "900", c: LT.blue });
      K.bar(ctx, cd.px, 248, cd.w, (k - .5) / 2.5, LT.blue);
      var seaY = resYears(ST[0], k);
      K.tip(ctx, seaY < 2000 ? "바닷물도 " + Math.round(seaY).toLocaleString() + "년이면 갈아치워짐" : "바닷물 " + Math.round(seaY).toLocaleString() + "년 → 2,000년 안으로?", cd.px - 4, 272, cd.w + 8, seaY < 2000 ? true : null);
      lWrap(ctx, cur.flow ? cur.vol.toLocaleString() + " km³ ÷ " + Math.round(cur.flow * k).toLocaleString() + " km³/년" : cur.note, cd.px, 330, cd.w, 16, { s: 11.5, c: LT.ink });
      lWrap(ctx, "해마다 약 505,000 km³가 증발하고 같은 양이 비·눈으로 내립니다.", cd.px, 380, cd.w, 16);
      if (quiet !== true) say();
    }
    function say() {
      var sea = resYears(ST[0], k), atm = resYears(ST[4], k) * 365.25;
      $("a-water-info").innerHTML = "저장량이 가장 적은 <b>대기</b> 속의 물은 평균 <b>" + atm.toFixed(1) + "일</b> 만에 갈아치워지고, 가장 많은 <b>바닷물</b>은 평균 <b>" + Math.round(sea).toLocaleString() + "년</b>이 걸립니다. " +
        "저장량이 커서가 아니라 <b>저장량에 견주어 드나드는 양이 적어서</b> 오래 머무는 것입니다. 모래 한 알을 산에서 바다로 옮긴 것은 저 짧은 9일짜리 여행을 수없이 되풀이한 물입니다.";
    }
    function check() {
      var ch = false;
      if (sel === "atm" && !got.a) { got.a = true; ch = true; }
      if (resYears(ST[0], k) < 2000 && !got.b) { got.b = true; window.sthState("cycK", k.toFixed(2)); ch = true; }
      if (ch) { window.sthState("waterGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.a && got.b) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>같은 물이 권역 사이를 돌고 있습니다. 대기 속 물은 <b>열흘도 안 되어</b> 갈아치워지고, 바닷물은 <b>3,000년쯤</b> 머뭅니다. 순환이 빨라지면 머무는 시간은 그만큼 짧아집니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    /* 막대 속 물방울이 바꾼 뒤 잠깐(약 3초) 일렁인다 */
    K.animate(canvas, function (dt) { if (!REDUCE && wT < 3000) { wT += dt; draw(true); } });
    Array.prototype.forEach.call(document.querySelectorAll("#a-store button"), function (b) {
      b.addEventListener("click", function () {
        sel = b.getAttribute("data-s");
        Array.prototype.forEach.call(document.querySelectorAll("#a-store button"), function (x) { x.classList.toggle("on", x === b); });
        wT = 0; draw(); check();
      });
    });
    $("a-cyc").addEventListener("input", function (e) {
      k = +e.target.value; $("a-cyc-val").textContent = k.toFixed(2) + "배"; wT = 0; draw(); check();
    });
    draw(); mission();
  })();

  /* 장면 3 — 권역 지도 ---------------------------------------------------- */
  (function () {
    var canvas = $("c-map"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var N = [
      { n: "외권", x: 450, y: 52, r: 42, c: "--violet", d: "대기권 바깥의 우주 공간입니다. 지구는 <b>태양계라는 더 큰 시스템의 구성 요소</b>여서, 지구시스템을 돌리는 에너지의 거의 전부가 이곳에서 들어옵니다. 달과 태양의 인력, 운석도 외권에서 옵니다." },
      { n: "기권", x: 250, y: 158, r: 46, c: "--cold", d: "지구를 둘러싼 대기의 영역입니다. 질소 약 78%, 산소 약 21%로 이루어져 있고, 날씨와 기후 현상이 나타납니다. 높이에 따라 대류권·성층권·중간권·열권으로 나뉩니다." },
      { n: "지권", x: 650, y: 158, r: 46, c: "--coral", d: "지구의 표면과 내부입니다. 지각·맨틀·외핵·내핵으로 이루어져 있고, 지구 전체 부피의 대부분을 차지합니다. 판의 운동과 화산·지진이 일어나는 곳입니다." },
      { n: "수권", x: 250, y: 336, r: 46, c: "--brand", d: "바다·빙하·지하수·하천·호수 등 물이 있는 영역입니다. 97% 넘게가 바닷물이며, 비열이 커서 지구의 기온 변화를 누그러뜨립니다." },
      { n: "생물권", x: 650, y: 336, r: 46, c: "--green", d: "지구에 사는 모든 생명체와 그들이 사는 공간입니다. 다른 세 권역에 걸쳐 있고, 광합성으로 기권의 성분을 바꿔 놓은 장본인입니다." }
    ];
    var E = [
      { a: 0, b: 1, hx: 338, hy: 105, t: "외권 ↔ 기권", d: "태양 복사 에너지가 대기권 위로 들어와 기권과 지표를 데우고, 지구는 받은 만큼을 적외선으로 우주에 돌려보냅니다(복사 평형). 지구시스템을 움직이는 에너지의 <b>99.9% 이상</b>이 이 길로 들어옵니다." },
      { a: 0, b: 2, hx: 562, hy: 105, t: "외권 ↔ 지권·수권", d: "달과 태양의 인력이 바닷물을 끌어당겨 <b>밀물과 썰물</b>을 일으킵니다. 우주에서 떨어진 운석은 지권에 충돌구를 남기고, 지구의 자전축 기울기는 계절을 만듭니다." },
      { a: 1, b: 2, hx: 450, hy: 158, t: "기권 ↔ 지권", d: "바람이 모래를 날라 바위를 깎고(풍화·침식), 기온이 오르내리며 암석을 부숩니다. 거꾸로 화산이 뿜은 화산재와 기체는 기권의 성분과 기온을 바꿉니다." },
      { a: 1, b: 3, hx: 250, hy: 247, t: "기권 ↔ 수권", d: "바다에서 물이 증발해 기권으로 가고, 비와 눈이 되어 수권으로 돌아옵니다. 해마다 <b>약 505,000 km³</b>가 오갑니다. 바다는 대기의 이산화 탄소를 녹여 품기도 합니다." },
      { a: 2, b: 4, hx: 650, hy: 247, t: "지권 ↔ 생물권", d: "토양은 생물의 서식 기반이 되고, 뿌리와 지의류는 암석의 풍화를 빠르게 합니다. 죽은 생물이 묻혀 <b>석탄·석유</b>가 되기도 합니다." },
      { a: 3, b: 4, hx: 450, hy: 336, t: "수권 ↔ 생물권", d: "생물은 물을 마시고 물속을 서식지로 삼습니다. 바다의 식물성 플랑크톤은 수권에서 광합성을 해 산소를 내놓습니다." },
      { a: 1, b: 4, cx: 330, cy: 300, hx: 390, hy: 274, t: "기권 ↔ 생물권", d: "식물의 광합성과 생물의 호흡이 대기의 산소·이산화 탄소 농도를 바꿉니다. 지금 대기에 산소가 21%나 있는 것은 <b>생물권이 한 일</b>입니다." },
      { a: 3, b: 2, cx: 570, cy: 194, hx: 510, hy: 221, t: "수권 ↔ 지권", d: "하천과 파도가 지권을 깎아 내고, 깎인 알갱이를 날라 삼각주와 모래 해변을 만듭니다. 강이 해마다 바다로 나르는 퇴적물은 <b>약 200억 t</b>입니다." }
    ];
    var seen = window.sthState("mapSeen") || {}, mapT = 0, mapPlay = !REDUCE;
    var got = window.sthState("mapGot") || { a: false, b: false };

    function count() { var c = 0; for (var i = 0; i < E.length; i++) if (seen["e" + i]) c++; return c; }
    function along(e, u) {                      /* 선 위의 한 점 (u: 0~1) */
      var A = N[e.a], B = N[e.b];
      if (e.cx == null) return { x: A.x + (B.x - A.x) * u, y: A.y + (B.y - A.y) * u };
      var q = 1 - u; return { x: q * q * A.x + 2 * q * u * e.cx + u * u * B.x, y: q * q * A.y + 2 * q * u * e.cy + u * u * B.y };
    }
    /* 권역마다 작은 블록 모형(바위·물·공기·숲·우주) 을 스튜디오 바닥에 놓고, 그 사이를 오가는 길을 잇는다.
       그림은 왼쪽으로 MOFF 만큼 옮겨 그리고(오른쪽은 판정 카드), 누르는 자리도 같은 만큼 되돌려 잰다. */
    var MOFF = -150, MOFFY = 30, LWm = 600;
    function token(s) {
      var x = s.x, y = s.y, I = K.iso({ ox: x, oy: y - 14, s: .95, L: 48, D: 48 }), Z = 40, i, R = K.rng(s.n.length * 7 + 3);
      var fl = ctx.createRadialGradient(x + 6, y + 40, 4, x + 6, y + 40, 60); fl.addColorStop(0, "rgba(20,30,50,.28)"); fl.addColorStop(1, "rgba(20,30,50,0)");
      ctx.fillStyle = fl; ctx.beginPath(); ctx.ellipse(x + 6, y + 40, 60, 16, 0, 0, 6.2832); ctx.fill();
      if (s.n === "지권") {
        I.box(ctx, 0, 0, 0, 48, 48, Z, "#a58e72", "#8a6a4c", "#6e5038");
        I.face(ctx, "front", function () { ["#c9a46c", "#8a6a4c", "#b07a52", "#6c5a4a"].forEach(function (c, k) { ctx.fillStyle = c; ctx.fillRect(0, k * 10, 48, 10); }); ctx.fillStyle = "rgba(255,140,60,.8)"; ctx.fillRect(18, 0, 6, 12); });
        I.face(ctx, "right", function () { ["#b0916a", "#7a5c42", "#9c6c48", "#5e4e40"].forEach(function (c, k) { ctx.fillStyle = c; ctx.fillRect(0, k * 10, 48, 10); }); });
        var vp0 = isoCone(ctx, I, 26, 22, Z, 15, 24, "#a8866a", "#4a3626"); K.glow(ctx, vp0.x, vp0.y, 2.6, "rgba(255,120,50,.95)", 3);
      } else if (s.n === "수권") {
        I.box(ctx, 0, 0, 0, 48, 48, Z, "#7cc4f0", "#2f80d0", "#1f5fa8");
        ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.2;
        for (i = 0; i < 4; i++) { var a = I.P(8 + i * 10, 10 + i * 8, Z), b = I.P(18 + i * 10, 10 + i * 8, Z); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo((a.x + b.x) / 2, a.y - 3, b.x, b.y); ctx.stroke(); }
      } else if (s.n === "기권") {
        I.box(ctx, 0, 0, 0, 48, 48, Z, "rgba(200,230,255,.55)", "rgba(150,200,245,.45)", "rgba(110,165,225,.5)");
        ctx.strokeStyle = "rgba(60,120,200,.55)"; ctx.lineWidth = 1; I.quad(ctx, I.P(0, 48, 0), I.P(48, 48, 0), I.P(48, 48, Z), I.P(0, 48, Z), null, "rgba(60,120,200,.55)");
        var cp = I.P(24, 24, Z + 6); puffCloud(ctx, cp.x, cp.y, 13, 1);
      } else if (s.n === "생물권") {
        I.box(ctx, 0, 0, 0, 48, 48, Z, "#6fae47", "#7a5a3c", "#5e4430");
        I.face(ctx, "front", function () { ctx.fillStyle = "#5f9a3c"; ctx.fillRect(0, Z - 6, 48, 6); });
        I.tree(ctx, 14, 16, Z, 1.15); I.tree(ctx, 34, 30, Z, 1.3); I.tree(ctx, 20, 38, Z, .95);
      } else {
        I.box(ctx, 0, 0, 0, 48, 48, Z, "#2a2f66", "#151a44", "#0d1133");
        for (i = 0; i < 14; i++) { var sp = I.P(R() * 48, R() * 48, Z); ctx.fillStyle = "#ffffff"; ctx.fillRect(sp.x, sp.y, 1.4, 1.4); }
        var e1 = I.P(24, 24, Z + 12); K.earth(ctx, e1.x, e1.y, 9);
      }
      K.bigText(ctx, s.n, x, y + 64, 17, "#ffffff", "center");
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.studio(ctx, 0, 0, LWm, H, { x: 300, y: 330, rx: 290, ry: 60 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LWm, H, 14); ctx.clip();
      ctx.translate(MOFF, MOFFY);
      /* 태양 → 외권 */
      K.sun(ctx, 336, 38, 9);
      ctx.save(); ctx.globalAlpha = .9; K.arrow(ctx, { x: 358, y: 40 }, { x: 404, y: 48 }, "#f59f00", 3, 10); ctx.restore();
      for (var i = 0; i < E.length; i++) {
        var e = E[i], A = N[e.a], B = N[e.b], sn = !!seen["e" + i];
        ctx.save(); ctx.lineCap = "round";
        ctx.strokeStyle = sn ? "rgba(12,133,153,.9)" : "rgba(92,112,134,.45)"; ctx.lineWidth = sn ? 5 : 2.2;
        if (!sn) ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(A.x, A.y);
        if (e.cx != null) ctx.quadraticCurveTo(e.cx, e.cy, B.x, B.y); else ctx.lineTo(B.x, B.y);
        ctx.stroke();
        if (sn) { ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.4; ctx.stroke(); }
        ctx.restore();
        if (sn) for (var f = 0; f < 3; f++) {
          var u = ((mapT / 2600) + f / 3 + i * .13) % 1, pA = along(e, u), pB = along(e, 1 - u);
          K.planet(ctx, pA.x, pA.y, 3.4, "#7ce0cf", "#0c6b5e"); K.planet(ctx, pB.x, pB.y, 3, "#ffd27a", "#b06d00");
        }
      }
      for (var m = 0; m < N.length; m++) token(N[m]);
      for (var j = 0; j < E.length; j++) {
        var h = E[j], on = !!seen["e" + j];
        ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
        var hb = ctx.createRadialGradient(h.hx - 4, h.hy - 5, 2, h.hx, h.hy, 16);
        hb.addColorStop(0, on ? "#c3f5ea" : "#ffffff"); hb.addColorStop(1, on ? "#0c8599" : "#dfe5ee");
        ctx.fillStyle = hb; ctx.beginPath(); ctx.arc(h.hx, h.hy, 15, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.strokeStyle = on ? "#0c6b5e" : "rgba(28,126,214,.8)"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(h.hx, h.hy, 15, 0, Math.PI * 2); ctx.stroke();
        lt(ctx, on ? "✓" : "?", h.hx, h.hy + 5, { s: 14, w: "900", a: "center", c: on ? "#ffffff" : LT.blue });
      }
      ctx.restore();
      K.bigText(ctx, "다섯 권역", 18, 44, 24, "#ffffff");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWm + 10, W, H, "확인한 상호 작용"), n = count();
      lt(ctx, n + " / " + E.length, cd.px, 66, { s: 26, w: "900", c: n === E.length ? LT.green : LT.blue });
      K.bar(ctx, cd.px, 78, cd.w, n / E.length, n === E.length ? LT.green : LT.blue);
      for (var r = 0; r < E.length; r++) lt(ctx, (seen["e" + r] ? "✓ " : "· ") + E[r].t, cd.px, 118 + r * 24, { s: 12.5, w: seen["e" + r] ? "800" : "600", c: seen["e" + r] ? LT.teal : LT.dim });
      K.tip(ctx, n === E.length ? "여덟 길을 모두 찾았습니다" : "남은 길 " + (E.length - n) + "개", cd.px - 4, 314, cd.w + 8, n === E.length ? true : null);
      lWrap(ctx, "권역 사이를 오가는 것은 물질과 에너지. 한 권역의 변화는 반드시 다른 권역에 나타납니다.", cd.px, 372, cd.w, 16);
    }
    function check() {
      if (count() === E.length && !got.a) { got.a = true; window.sthState("mapGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-3a");
      if (got.b) done("m1-3b");
      if (got.a && got.b) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>권역 사이를 오가는 것은 <b>물질</b>과 <b>에너지</b> 둘 다입니다. 그래서 한 곳의 사건은 반드시 다른 곳에 자취를 남깁니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    playBtn("a-map-play", "⏸ 흐름 멈추기", "▶ 흐름 보기", function () { return mapPlay; }, function (q) { mapPlay = q; });
    K.animate(canvas, function (dt) { if (mapPlay && count() > 0) { mapT += dt; draw(); } });
    canvas.addEventListener("click", function (e) {
      var p = pointOnCanvas(canvas, e), hit = null; p.x -= MOFF; p.y -= MOFFY;
      for (var i = 0; i < E.length; i++) {
        if (Math.abs(p.x - E[i].hx) < 24 && Math.abs(p.y - E[i].hy) < 24) {
          seen["e" + i] = 1; window.sthState("mapSeen", seen);
          hit = "<b>" + E[i].t + "</b> — " + E[i].d; break;
        }
      }
      if (!hit) {
        for (var j = 0; j < N.length; j++) {
          if (Math.hypot(p.x - N[j].x, p.y - N[j].y) < N[j].r) { hit = "<b>" + N[j].n + "</b> — " + N[j].d; break; }
        }
      }
      if (hit) { $("a-map-info").innerHTML = hit; draw(); check(); }
    });
    window.sthSort({
      mount: "s1-sort",
      buckets: [
        { id: "ea", label: "지권 → 기권", sub: "땅에서 나온 것이 대기를 바꾼다" },
        { id: "ae", label: "기권 → 지권", sub: "대기가 땅을 깎고 부순다" },
        { id: "ba", label: "생물권 → 기권", sub: "생물이 대기의 성분을 바꾼다" },
        { id: "we", label: "수권 → 지권", sub: "물이 땅을 깎고 쌓는다" }
      ],
      items: [
        { t: "🌋 1991년 피나투보의 화산재가 성층권을 덮어 지구 평균 기온이 내려갔다", a: "ea", why: "지권에서 나온 물질이 기권의 상태를 바꾼 사례입니다." },
        { t: "🏜️ 봄마다 중국 내륙의 흙먼지가 바람에 실려 하늘을 뿌옇게 덮는다(황사)", a: "ea", why: "지권의 알갱이가 기권으로 올라간 사례입니다.", hint: "흙먼지는 원래 어디에 있던 물질일까요?" },
        { t: "🪨 바람에 실린 모래가 바위 아랫부분을 깎아 버섯바위를 만든다", a: "ae", why: "기권(바람)이 지권을 깎아 낸 사례입니다." },
        { t: "❄️ 기온이 오르내리며 바위가 팽창·수축을 되풀이하다 부서진다", a: "ae", why: "기권의 기온 변화가 암석을 부순 풍화입니다." },
        { t: "🦠 약 24억 년 전, 광합성 생물이 늘면서 대기에 산소가 쌓이기 시작했다", a: "ba", why: "생물권이 기권의 성분 자체를 바꾼 가장 큰 사건입니다." },
        { t: "🌳 숲이 광합성으로 이산화 탄소를 빨아들여 대기 중 농도를 낮춘다", a: "ba", why: "생물권이 기권의 조성을 바꾸는 현재진행형 사례입니다." },
        { t: "🏞️ 강물이 산을 깎고 알갱이를 날라 하구에 삼각주를 쌓는다", a: "we", why: "수권이 지권을 깎고 다시 쌓은 사례입니다. 모래 한 알이 바다로 온 길이기도 합니다." },
        { t: "🌊 파도가 해안 절벽을 깎아 해식 동굴을 만든다", a: "we", why: "수권이 지권의 지형을 바꾼 사례입니다." }
      ],
      doneText: "어느 쪽이 원인이고 어느 쪽이 결과인지 가려내는 것이 시스템으로 보는 첫걸음입니다.",
      onDone: function () { got.b = true; window.sthState("mapGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 화산 폭발 연쇄 ------------------------------------------------ */
  (function () {
    var canvas = $("c-volc"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var so2 = 6, mon = 6, vT = 0, vPlay = !REDUCE;
    var got = window.sthState("volcGot") || { a: false, b: false, c: false };

    function peak() { return -0.5 * so2 / 20; }                     /* 가장 많이 식었을 때(℃) */
    function frac(t) { return t <= 6 ? t / 6 : Math.exp(-(t - 6) / 12); }
    function dT(t) { return peak() * frac(t); }
    function sun(t) { return -2.5 * (so2 / 20) * frac(t); }          /* 지표에 닿는 햇빛 변화(%) */

    /* ── 위: 바다·땅·화산을 블록으로 잘라 낸 모형(아이소메트릭) + 성층권 장막 · 아래: 그래프·표·네 권역 연쇄 ──
       x 오른쪽 아래(바다 → 땅), y 왼쪽 아래, z 위(그림 단위). 높이·크기는 보기 쉽게 바꾸었다(실제 비율 아님). */
    var DH = 412;
    var I = K.iso({ ox: 520, oy: 166, s: 0.6, L: 560, D: 230 });
    var BL = I.L, BD = I.D, SL = 56, STR = 262;            /* 해수면 · 성층권 장막 높이 */
    var VX = 380, VY = 150, VR = 112, VH = 104;               /* 화산 자리·반지름·높이 */
    function vcone(x, y) {
      var r = Math.sqrt((x - VX) * (x - VX) + (y - VY) * (y - VY)); if (r > VR) return -1;
      var h = SL + 12 + VH * Math.pow(1 - r / VR, 1.25); if (r < 11) h -= (11 - r) * 1.3; return h;
    }
    function coast(y) { return 200 + 22 * Math.sin(y / 37); }
    function ground(x, y) {
      var c = coast(y), z = x < c ? SL - 30 + 28 * Math.pow(x / c, 3) + 1.5 * Math.sin(x / 23) * Math.cos(y / 19)
                                  : SL - 2 + Math.min(14, (x - c) * .3) + 1.6 * Math.sin(x / 31 + y / 43);
      return Math.max(z, vcone(x, y));
    }
    function mixHex(a, b, t) {
      var p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16);
      function ch(s) { return Math.round(((p >> s) & 255) * (1 - t) + ((q >> s) & 255) * t); }
      var n = (ch(16) << 16) | (ch(8) << 8) | ch(0); return "#" + ("000000" + n.toString(16)).slice(-6);
    }
    function lerp(a, b, t) { return a + (b - a) * t; }
    var COOL = 0;                                          /* 0 보통 ~ 1 가장 서늘함(색만 바꾼다) */
    function landCol(x, y, z, light) {
      var c;
      if (z < SL - 1) c = "#b39d78";                                     /* 바다 밑 모래 */
      else if (z < SL + 2.5) c = "#dcc590";                              /* 바닷가 */
      else if (vcone(x, y) >= z - .3 && z > SL + 34) c = z > SL + VH ? "#4f4039" : "#6f5a4c";   /* 화산 사면 */
      else if (x > 410 && y < 96) c = Math.floor((x * .9 + y * .35) / 17) % 2 ? mixHex("#8fbf4a", "#c9b26a", COOL) : mixHex("#6fa63e", "#b3a05a", COOL); /* 논밭 */
      else c = mixHex("#4f8f3c", "#7d8a4a", COOL * .8);                 /* 숲 */
      return K.tint(c, light);
    }
    function faceZ(side) { return function (u) { return side === "front" ? ground(u, BD) : ground(BL, u); }; }
    var RAYS = [[250, 60], [330, 210], [470, 60]];            /* 햇빛이 닿는 땅·바다 자리 */

    function drawModel(a, now, t, haze) {
      var box = [0, W], wz = SL;
      K.studio(ctx, 0, 0, W, DH, { x: I.P(BL, BD, 0).x - 150, y: I.P(BL, BD, 0).y - 18, rx: 320, ry: 46 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      /* 해: 오른쪽 위 */
      K.glow(ctx, 856, 44, 20, "rgba(255,206,84,.98)", 2.6);
      /* 지형 + 칸마다 바닷물 */
      I.field(ctx, function (x, y) { return ground(x, y); }, landCol, 56, 23, function (c, x0, y0, x1, y1, zMax, zMin) {
        if (wz > zMin + 0.2) {
          var p1 = I.P(x0, y0, wz), p2 = I.P(x1, y0, wz), p3 = I.P(x1, y1, wz), p4 = I.P(x0, y1, wz);
          var dp = wz - zMin, al = Math.min(.82, .34 + dp / 50);
          c.beginPath(); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.lineTo(p3.x, p3.y); c.lineTo(p4.x, p4.y); c.closePath();
          c.fillStyle = "rgba(" + Math.round(lerp(60, 80, COOL) - dp * .5) + "," + Math.round(lerp(150, 140, COOL) - dp * .6) + "," + Math.round(lerp(222, 205, COOL)) + "," + al.toFixed(2) + ")"; c.fill();
        }
      });
      /* 앞면·오른쪽 면: 땅속 단면 */
      ["front", "right"].forEach(function (side) {
        var zf = faceZ(side);
        I.face(ctx, side, function (Lw) {
          I.profile(ctx, side, zf, 0);
          var g = ctx.createLinearGradient(0, 0, 0, 130); g.addColorStop(0, "#4a3f39"); g.addColorStop(.6, "#7d6a58"); g.addColorStop(1, "#a88f70");
          ctx.fillStyle = g; ctx.fill();
          ctx.save(); I.profile(ctx, side, zf, 0); ctx.clip();
          var R = K.rng(side === "front" ? 41 : 43);
          for (var i = 0; i < Lw * 1.2; i++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.14)" : "rgba(40,28,18,.25)"; ctx.fillRect(R() * Lw, R() * 130, 1.6, 1.6); }
          ctx.strokeStyle = "rgba(50,35,20,.28)"; ctx.lineWidth = 1;
          for (var y2 = 12; y2 < 120; y2 += 13) { ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(Lw, y2 + 2); ctx.stroke(); }
          if (side === "front") {
            /* 화산 아래 마그마 굄과 화도(지각 속, 앞면 단면에 드러남) */
            var mg = ctx.createRadialGradient(VX, 16, 2, VX, 16, 42);
            mg.addColorStop(0, "#ffd27a"); mg.addColorStop(.45, "#f0782e"); mg.addColorStop(1, "rgba(150,40,20,0)");
            ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(VX, 16, 40, 10, 0, 0, 6.283); ctx.fill();
            ctx.strokeStyle = "#ff8a3a"; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(VX, 22);
            ctx.quadraticCurveTo(VX + 4, (22 + zf(VX)) / 2, VX - 1, zf(VX) - 1); ctx.stroke();
          }
          ctx.restore();
        });
      });
      I.water(ctx, wz, function (u, side) { return faceZ(side)(u); }, { surface: false });
      I.shade(ctx, "front", function (u) { return Math.max(ground(u, BD), wz); });
      I.shade(ctx, "right", function (u) { return Math.max(ground(BL, u), wz); });
      I.edges(ctx, ground(BL, BD), ground(BL, BD));
      /* 마을·숲 */
      [[470, 150], [500, 175], [452, 196]].forEach(function (h, i) { I.house(ctx, h[0], h[1], ground(h[0] + 7, h[1] + 7), 14, 12, 10, ["#c0553f", "#3f6fb5", "#d08a2e"][i]); });
      [[262, 140], [280, 196], [300, 20], [520, 120], [540, 214], [255, 30], [520, 22]].forEach(function (q, i) { I.tree(ctx, q[0], q[1], ground(q[0], q[1]), .75 + (i % 3) * .1); });
      /* 분연 기둥: 화구에서 성층권까지 */
      var cr = I.P(VX, VY, SL + 12 + VH - 6), top = I.P(VX, VY, STR), pa = clamp(.4 + a * .8, 0, 1) * (so2 > 0 ? 1 : 0);
      K.glow(ctx, cr.x, cr.y, 4.5, "rgba(255,130,50,.95)", 3);
      if (pa > 0) {
        var sz = .6 + so2 / 40;
        for (var k = 0; k < 18; k++) {
          var u = ((k / 18) + t * .06) % 1, px = cr.x + Math.sin(t * 1.4 + k * 1.7) * 2.5 * (1 + u), py = lerp(cr.y - 2, top.y + 4, u), pr = 3.5 + u * 9 * sz;
          var pg = ctx.createRadialGradient(px - pr * .3, py - pr * .3, 1, px, py, pr);
          pg.addColorStop(0, "rgba(176,168,158," + (.92 * pa).toFixed(3) + ")"); pg.addColorStop(1, "rgba(80,72,66," + (.25 * pa).toFixed(3) + ")");
          ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, pr, 0, 6.2832); ctx.fill();
        }
        /* 성층권에 닿아 옆으로 퍼지는 우산 모양 구름 */
        for (var e = 0; e < 7; e++) {
          var sp = (e - 3) / 3, ex = top.x + sp * (30 + 70 * a * sz) + Math.sin(t * .8 + e) * 3, ey = top.y + 6 + Math.abs(sp) * 4, er = 14 * sz * (1 - Math.abs(sp) * .35);
          ctx.fillStyle = "rgba(196,188,176," + (.55 * pa * (1 - Math.abs(sp) * .4)).toFixed(3) + ")";
          ctx.beginPath(); ctx.ellipse(ex, ey, er * 1.8, er * .7, 0, 0, 6.2832); ctx.fill();
        }
      }
      /* 성층권 장막: 황산 알갱이(에어로졸) 층 */
      I.plane(ctx, STR, "rgba(238,226,196," + (haze * .62).toFixed(3) + ")", "rgba(120,130,160," + (.35 + haze * .4).toFixed(2) + ")");
      var R2 = K.rng(77), nd = Math.round(90 * haze);
      for (var d = 0; d < nd; d++) {
        var qx = (R2() * BL + t * (4 + R2() * 6)) % BL, qy = R2() * BD, q = I.P(qx, qy, STR + R2() * 6);
        ctx.fillStyle = "rgba(150,120,60,.55)"; ctx.beginPath(); ctx.arc(q.x, q.y, 1.4, 0, 6.2832); ctx.fill();
      }
      /* 햇빛: 장막에서 일부가 되돌아가고 나머지가 지표에 닿는다 */
      var thru = clamp(1 - haze * .8, .25, 1);
      RAYS.forEach(function (r) {
        var pp = I.P(r[0], r[1], STR), gp = I.P(r[0], r[1], Math.max(ground(r[0], r[1]), SL));
        ctx.save(); ctx.shadowColor = "#ffcf4a"; ctx.shadowBlur = 8;
        K.line(ctx, { x: 846, y: 54 }, pp, "#f2b01e", 3);
        K.arrow(ctx, pp, gp, "rgba(242,176,30," + thru.toFixed(2) + ")", 1 + 2.2 * thru, 10);
        if (haze > .07) K.arrow(ctx, pp, { x: pp.x - 46, y: pp.y - 40 }, "rgba(70,140,220," + clamp(haze * 1.3, .25, 1).toFixed(2) + ")", 1.2 + 2 * haze, 9);
        ctx.restore();
      });
      ctx.restore();

      /* 이름표 — 네 권역 */
      var dTxt = (now <= -0.005 ? "−" + Math.abs(now).toFixed(2) : "0.00") + " ℃";
      I.label(ctx, 40, 200, STR, "② 기권 — 성층권 황산 알갱이층" + (haze > .07 ? " · 햇빛 일부를 되돌림" : " · 지금은 맑음"), -24, 40, "#e8ecff", box);
      I.label(ctx, VX + 30, VY + 20, ground(VX + 30, VY + 20), (so2 > 0 ? "① 지권 — 화산이 이산화 황 " + so2 + " Tg 분출" : "① 지권 — 화산이 잠잠함"), 150, 70, "#ffd2b0", box);
      I.label(ctx, 500, 40, ground(500, 40), "③ 생물권 — " + (COOL > .35 ? "일조량이 줄어 작물이 덜 자람" : "햇빛을 받아 광합성"), 60, -34, COOL > .35 ? "#ffe39a" : "#bff0b5", box);
      I.label(ctx, 90, 150, SL, "④ 수권 — 바다 표층 " + dTxt, -60, 34, "#bfe6ff", box);
      I.label(ctx, 300, BD, 16, "마그마", -60, 40, "#ffcf9a", box);
      K.warn(ctx, W - 14, DH - 16, "⚠ 높이·크기는 보기 쉽게 바꾼 것 (성층권은 지상 약 10~50 km)", "right");
      /* 큰 글자 */
      var head, sub, hc = "#ffffff", sc = "#ffd35a";
      if (so2 === 0) { head = "화산이 조용한 해"; sub = "성층권이 맑아 햇빛이 그대로 닿습니다"; }
      else if (mon === 0) { head = "막 터진 화산"; sub = "이산화 황 " + so2 + " Tg이 하늘로 올라가는 중"; }
      else if (a < .2) { head = "장막이 걷혔다"; sub = mon + "개월 뒤 · 에어로졸 " + Math.round(a * 100) + "% · " + dTxt; hc = "#bfe6ff"; }
      else if (Math.abs(peak() + 0.5) <= 0.03) { head = "피나투보급 — 지구가 식는다"; sub = "폭발 " + mon + "개월 뒤 · 지구 평균 기온 " + dTxt; hc = "#ffd35a"; sc = "#ffffff"; }
      else { head = "화산 하나가 지구를 식힌다"; sub = "이산화 황 " + so2 + " Tg · " + mon + "개월 뒤 " + dTxt; }
      K.bigText(ctx, head, 22, 48, 25, hc);
      K.bigText(ctx, sub, 22, 80, 15, sc);
    }

    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var a = frac(mon), now = dT(mon), t = vT / 1000, i;
      var haze = so2 > 0 ? clamp(0.06 + 0.75 * a * (so2 / 30), 0, 0.85) : 0;
      COOL = clamp(-now / 0.7, 0, 1);
      drawModel(a, now, t, haze);
      /* ── 아래 판: 밝은 그래프 · 판정 카드 · 네 권역 연쇄 ── */
      var Y0 = DH + 8;
      K.studio(ctx, 0, Y0, W, H - Y0, null);
      var g = K.chart(ctx, { x: 6, y: Y0 + 12, w: 500, h: 168, pl: 56, pt: 14, pb: 26, x0: 0, x1: 48, y0: -1, y1: 0, xt: 4, yt: 2, light: true,
        xf: function (q) { return Math.round(q) + "개월"; }, yf: function (q) { return (q < 0 ? "−" : "") + Math.abs(q).toFixed(1) + " ℃"; } });
      var pts = [];
      for (i = 0; i <= 96; i++) { var tt = 48 * i / 96; pts.push([tt, clamp(dT(tt), -1, 0)]); }
      ctx.save(); ctx.beginPath(); ctx.moveTo(g.X(0), g.Y(0)); pts.forEach(function (p) { ctx.lineTo(g.X(p[0]), g.Y(p[1])); }); ctx.lineTo(g.X(48), g.Y(0)); ctx.closePath();
      ctx.fillStyle = "rgba(28,126,214,.12)"; ctx.fill(); ctx.restore();
      K.plot(ctx, g, pts, LT.blue, { light: true, w: 3 });
      var mx = g.X(mon), my = g.Y(clamp(now, -1, 0));
      K.line(ctx, { x: mx, y: g.T }, { x: mx, y: g.B }, "rgba(20,40,90,.45)", 1.3, [4, 4]);
      K.planet(ctx, mx, my, 6, "#ff8a5c", "#b4400c");
      tag(ctx, "폭발 뒤 지구 평균 기온 변화", g.R - 6, g.B - 10, LT.blue, "right");
      tag(ctx, mon + "개월 · " + now.toFixed(2) + " ℃", mx + 10, Math.min(g.B - 34, my + 24), LT.orange);
      var cx0 = 520, cw = W - cx0 - 10;
      K.card(ctx, cx0, Y0 + 10, cw, 172, "폭발 " + mon + "개월 뒤");
      var rr = [["분출한 이산화 황", so2 + " Tg (피나투보 ≈ 20)"], ["가장 많이 식었을 때", peak().toFixed(2) + " ℃", LT.blue], ["지금 남은 에어로졸", (a * 100).toFixed(0) + " %"],
        ["지금 기온 변화", now.toFixed(2) + " ℃", Math.abs(now) > 0.25 ? LT.orange : LT.ink], ["지표에 닿는 햇빛", sun(mon).toFixed(1) + " %"]];
      rr.forEach(function (r, k) { K.row(ctx, r[0], r[1], cx0 + 18, cx0 + cw - 18, Y0 + 62 + k * 25, r[2]); });
      var chain = [
        ["지권", "화산이 이산화 황 " + so2 + " Tg을 성층권까지 뿜어 올립니다.", LT.red],
        ["기권", "황산 알갱이가 햇빛을 " + Math.abs(sun(mon)).toFixed(1) + "% 되돌려 보내 지구 평균 기온이 " + now.toFixed(2) + " ℃ 달라집니다.", LT.blue],
        ["생물권", "일조량이 줄어 광합성이 느려지고, 서늘한 여름에 농작물 수확이 줄어듭니다.", LT.green],
        ["수권", "기온이 내려가 증발량과 강수 분포가 달라지고, 바다 표층도 함께 식습니다.", LT.teal]
      ];
      var cy = Y0 + 196;
      for (var c = 0; c < chain.length; c++) {
        var bx = 16 + c * 220;
        K.card(ctx, bx, cy, 200, 68, null);
        ctx.fillStyle = chain[c][2]; ctx.beginPath(); ctx.roundRect(bx, cy, 6, 68, [14, 0, 0, 14]); ctx.fill();
        lt(ctx, (c + 1) + ". " + chain[c][0], bx + 16, cy + 19, { s: 12, w: "900", c: chain[c][2] });
        wrapText(ctx, chain[c][1], bx + 16, cy + 36, 176, 13, { s: 10.5, w: "600", c: LT.mute });
        if (c > 0) K.arrow(ctx, { x: bx - 18, y: cy + 34 }, { x: bx - 4, y: cy + 34 }, LT.mute, 2, 7);
      }
      if (quiet !== true) info();
    }
    function info() {
      var p = peak(), a = frac(mon);
      $("a-volc-info").innerHTML = "이산화 황 <b>" + so2 + " Tg</b> → 가장 많이 식었을 때 <b>" + p.toFixed(2) + " ℃</b>. 폭발 <b>" + mon + "개월</b> 뒤에는 에어로졸이 <b>" + (a * 100).toFixed(0) + "%</b> 남아 기온 변화는 <b>" + dT(mon).toFixed(2) + " ℃</b>입니다. " +
        (Math.abs(p + 0.5) <= 0.03 ? "🎉 1991년 피나투보와 같은 규모입니다." : "피나투보는 약 20 Tg을 뿜어 이듬해 지구 평균 기온을 약 0.5 ℃ 낮췄습니다.");
    }
    function check() {
      var ch = false;
      if (Math.abs(peak() + 0.5) <= 0.03 && !got.a) { got.a = true; window.sthState("so2Fit", so2 + " Tg"); ch = true; }
      if (mon > 6 && frac(mon) <= 0.5 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("volcGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-4a");
      if (got.b) done("m1-4b");
      if (got.c) done("m1-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>지권의 사건 하나가 <b>지구 전체의 기온</b>을 움직였습니다. 다만 에어로졸은 몇 년 만에 가라앉아, 화산의 냉각은 <b>일시적</b>입니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    playBtn("a-volc-play", "⏸ 분연 멈추기", "▶ 분연 움직이기", function () { return vPlay; }, function (q) { vPlay = q; });
    K.animate(canvas, function (dt) { if (vPlay) { vT += dt; draw(true); } });
    $("a-so2").addEventListener("input", function (e) { so2 = +e.target.value; $("a-so2-val").textContent = so2 + " Tg"; draw(); check(); });
    $("a-mon").addEventListener("input", function (e) { mon = +e.target.value; $("a-mon-val").textContent = mon + "개월"; draw(); check(); });
    window.sthPick({
      mount: "s1-q1",
      q: "화산은 이산화 탄소도 내뿜습니다. 그렇다면 화산 활동은 지구를 <b>더워지게</b> 하는 쪽일까요, <b>식히는</b> 쪽일까요?",
      options: ["큰 폭발은 몇 해 동안 식히는 쪽으로 작용한다", "이산화 탄소 때문에 곧바로 크게 더워진다", "기권에는 아무 영향이 없다", "화산재가 땅에 쌓여 지표를 데운다"],
      answer: 0,
      why: ["성층권에 올라간 황산 알갱이가 햇빛을 되돌려 보내 <b>몇 해 동안</b> 식힙니다. 화산이 내뿜는 이산화 탄소의 양은 사람이 화석 연료를 태워 내놓는 양의 <b>1% 안팎</b>이라, 짧은 기간에 나타나는 효과는 냉각 쪽입니다.",
        "화산이 내놓는 이산화 탄소는 사람이 내놓는 양의 1% 안팎입니다. 단기적으로는 햇빛을 가리는 효과가 훨씬 큽니다.",
        "1991년 피나투보 이후 지구 평균 기온이 약 0.5 ℃ 내려갔습니다. 영향이 분명히 있습니다.",
        "화산재는 대부분 몇 달 안에 가라앉습니다. 기온을 움직인 것은 성층권에 오래 머문 황산 알갱이입니다."],
      onDone: function () { got.c = true; window.sthState("volcGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 --------------------------------------------------------- */
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉣") === 0 ? "정확했습니다. 분석표의 조개껍데기 조각(생물권)과 닳은 모서리(수권·기권)가 그 증거였습니다."
        : "답은 ㉣ 입니다. 석영은 지권에서 왔지만, 그것을 떼어 내고 굴리고 실어 나른 것은 수권·기권·생물권이었습니다. 조개껍데기 조각이 결정적인 증거였습니다.") +
      "<br><b>내가 만든 화산</b> 이산화 황 " + (window.sthState("so2Fit") || "-") + " → 가장 많이 식었을 때 −0.5 ℃";
  }
  function finish() {
    window.sthState("r1", "해결 · 모래 한 알은 네 권역을 다 지나왔다, 대기의 물은 9.3일·바닷물은 3,083년 머문다");
  }
  window.sthOrder({
    mount: "s1-order",
    steps: [
      "기권 — 장기간 강수량이 크게 줄어드는 이상 기후가 발생한다",
      "수권 — 하천과 호수의 수위가 낮아지고 지하수면이 내려간다",
      "생물권 — 물이 부족해 식생이 말라 죽고 농작물 수확량이 줄어든다",
      "지권 — 식생이 사라진 토양이 바람에 쉽게 침식되어 사막화가 진행된다"
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅲ-1] 이야기 ① 모래 한 알의 여행",
    items: [
      { id: "w1", label: "권역 사이를 오가는 것", hint: "두 권역을 골라, 그 사이를 오가는 물질과 에너지를 각각 하나씩 쓰세요.", ph: "예: 기권 → 수권 : 물질은 …, 에너지는 …" },
      { id: "e1b", label: "모래 한 알의 여행기", hint: "이 모래 한 알이 화강암에서 떨어져 나와 해변에 닿기까지를, 네 권역의 이름을 모두 넣어 세 문장 안에 쓰세요.", ph: "" }
    ]
  });
})();

/* =========================================================================
   이야기 ② 세 개의 난로
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });
  var SUN_TW = 174000, IN_TW = 47, TIDE_TW = 3.7, AREA = 5.1e14;

  window.sthGate({
    gate: "g2", key: "p2", title: "조사관의 첫 추리",
    question: "내일 아침 태양이 빛을 잃는다면, 지구에서 <b>그래도 한동안 계속될</b> 현상은 무엇일까요?",
    options: ["㉠ 바람이 불고 비가 내리는 일", "㉡ 화산 폭발과 지진, 그리고 밀물과 썰물", "㉢ 광합성과 그 위에 놓인 먹이 사슬", "㉣ 아무것도 계속되지 않는다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 난로 세 대의 크기 -------------------------------------------- */
  (function () {
    var canvas = $("c-stove"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var scale = "log", area = 100;
    var got = window.sthState("stoveGot") || { a: false, b: false };
    var S = [
      { n: "태양 복사 에너지", tw: SUN_TW, col: "--amber", d: "대기와 해수의 순환, 바람·구름·비, 풍화와 침식, 광합성" },
      { n: "지구 내부 에너지", tw: IN_TW, col: "--coral", d: "맨틀 대류, 판의 운동, 화산 활동과 지진" },
      { n: "조력 에너지", tw: TIDE_TW, col: "--brand", d: "밀물과 썰물, 조류에 의한 퇴적물 이동" }
    ];
    function perM2(tw) { return tw * 1e12 / AREA; }
    /* 블록 모형: 고른 넓이만큼 잘라 낸 땅 한 조각. 위에서는 햇빛이 쏟아지고, 아래 단면에서는 땅속 열이 가늘게 올라온다.
       옆의 전구는 그 땅에서 올라오는 땅속 열(W)만큼 밝아진다. */
    var LW = 560;
    function fmtW(w) { return w >= 10000 ? Math.round(w / 1000).toLocaleString() + " kW" : (w >= 1000 ? (w / 1000).toFixed(1) + " kW" : (w >= 10 ? w.toFixed(0) : w.toFixed(1)) + " W"); }
    function lbar(x, y, w, f, c) {
      ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(x, y, w, 12, 6); ctx.fill();
      var ww = w * clamp(f, 0, 1); ctx.fillStyle = c;
      if (ww >= 3) { ctx.beginPath(); ctx.roundRect(x, y, ww, 12, 6); ctx.fill(); } else ctx.fillRect(x, y + 1, Math.max(1, ww), 10);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var side = Math.sqrt(area), inW = perM2(IN_TW) * area, sunW = perM2(SUN_TW) * area, tdW = perM2(TIDE_TW) * area, i;
      var Ls = 50 + side * 5.2, cxm = 250, cym = 262, I = K.iso({ ox: cxm, oy: cym - Ls * .42, s: .84, L: Ls, D: Ls }), Z = 34;
      K.studio(ctx, 0, 0, LW, H, { x: cxm + 40, y: cym + 70, rx: 230, ry: 40 });
      /* 받침(땅 한 조각) — 단면에 흙·암석, 바닥으로 갈수록 따뜻한 색 */
      I.box(ctx, 0, 0, 0, Ls, Ls, Z, "#78b04c", "#8a6a4c", "#6b5038");
      ["front", "right"].forEach(function (sd) {
        I.face(ctx, sd, function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, Z); g.addColorStop(0, "#d0703a"); g.addColorStop(.35, "#8a5a3c"); g.addColorStop(.8, "#7a6048"); g.addColorStop(1, "#5c8a3a");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, Z);
          ctx.strokeStyle = "rgba(255,170,90,.85)"; ctx.lineWidth = 1.2;
          for (var q = 1; q < 5; q++) { var u = Lw * q / 5; ctx.beginPath(); for (var zz = 0; zz <= Z - 8; zz += 2) ctx.lineTo(u + Math.sin(zz / 3 + q) * 1.5, zz); ctx.stroke(); }
        });
      });
      I.shade(ctx, "right", function () { return Z; });
      var R = K.rng(3);
      for (i = 0; i < Math.min(160, area / 6); i++) { var gp = I.P(R() * Ls, R() * Ls, Z); ctx.fillStyle = R() > .5 ? "rgba(40,90,30,.35)" : "rgba(200,240,150,.35)"; ctx.fillRect(gp.x, gp.y, 2, 1.2); }
      I.edges(ctx, Z, Z);
      /* 햇빛 — 넓을수록 더 많은 빛줄기가 닿는다 */
      var sx = 60, sy = 58; K.sun(ctx, sx, sy, 13);
      var nR = clamp(Math.round(2 + side / 6), 2, 9);
      for (i = 0; i < nR; i++) {
        var fx = (i + .5) / nR, tp = I.P(Ls * (.15 + .7 * fx), Ls * (.85 - .7 * fx), Z);
        ctx.save(); ctx.globalAlpha = .85; K.arrow(ctx, { x: sx + 12 + i * 3, y: sy + 10 }, tp, "#f59f00", 2.6, 10); ctx.restore();
      }
      /* 아래에서 올라오는 땅속 열(가는 주황 화살표) */
      var b1 = I.P(Ls * .5, Ls, 0), b2 = I.P(Ls, Ls * .5, 0);
      K.arrow(ctx, { x: b1.x, y: b1.y + 20 }, { x: b1.x, y: b1.y + 2 }, "#e8590c", 1.6, 7);
      K.arrow(ctx, { x: b2.x, y: b2.y + 20 }, { x: b2.x, y: b2.y + 2 }, "#e8590c", 1.6, 7);
      /* 크기 표시 */
      var e0 = I.P(0, Ls, 0), e1 = I.P(Ls, Ls, 0);
      K.line(ctx, { x: e0.x, y: e0.y + 12 }, { x: e1.x, y: e1.y + 12 }, "rgba(20,40,90,.6)", 1.4);
      tag(ctx, "한 변 " + side.toFixed(1) + " m", (e0.x + e1.x) / 2 - 30, (e0.y + e1.y) / 2 + 34, LT.ink);
      /* 전구: 땅속 열 ÷ 60 W 만큼 밝아진다 */
      var bx = 470, by = 210, on = clamp(inW / 60, 0, 1.6), ok = Math.abs(inW - 60) <= 2;
      var halo = ctx.createRadialGradient(bx, by, 4, bx, by, 30 + 50 * Math.min(1, on));
      halo.addColorStop(0, "rgba(255,214,90," + (.65 * Math.min(1, on)).toFixed(2) + ")"); halo.addColorStop(1, "rgba(255,214,90,0)");
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(bx, by, 80, 0, 6.2832); ctx.fill();
      var gb = ctx.createRadialGradient(bx - 8, by - 10, 3, bx, by, 26);
      gb.addColorStop(0, "#ffffff"); gb.addColorStop(.5, hexMix("#e6ebf2", "#ffe08a", Math.min(1, on))); gb.addColorStop(1, hexMix("#b8c2d0", "#f5b324", Math.min(1, on)));
      ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(bx, by, 24, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#9aa3b0"; ctx.fillRect(bx - 11, by + 20, 22, 16); ctx.fillStyle = "#6b7484"; ctx.fillRect(bx - 11, by + 24, 22, 3); ctx.fillRect(bx - 11, by + 30, 22, 3);
      tag(ctx, "땅속 열 " + inW.toFixed(1) + " W", bx, by + 58, ok ? LT.green : LT.orange, "center");
      tag(ctx, "백열전구 60 W 기준", bx, by + 82, LT.mute, "center");
      K.bigText(ctx, "땅 " + area.toLocaleString() + " m²", 110, 46, 26, "#ffffff");
      K.bigText(ctx, "햇빛 " + fmtW(sunW) + " · 땅속 열 " + inW.toFixed(1) + " W", 110, 76, 16, "#ffd35a");
      K.warn(ctx, LW - 14, 30, "⚠ 땅 두께·화살표 수는 보기 쉽게 그린 것", "right");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LW + 10, W, H, "난로 세 대 — 지구 전체");
      lt(ctx, scale === "log" ? "로그 척도 · 한 칸이 10배" : "선형 척도 · 실제 비율", cd.R, 28, { s: 11, w: "800", a: "right", c: LT.blue });
      var COL = [LT.yellow, LT.orange, LT.blue];
      for (i = 0; i < S.length; i++) {
        var s = S[i], y = 58 + i * 46, f = scale === "log" ? (Math.log(s.tw) / Math.LN10 + 1) / 6.3 : s.tw / SUN_TW;
        K.row(ctx, s.n, s.tw.toLocaleString() + " TW", cd.px, cd.R, y, COL[i]);
        lbar(cd.px, y + 8, cd.w, f, COL[i]);
      }
      lt(ctx, "이 넓이에서 받는 에너지", cd.px, 212, { s: 12.5, w: "900", c: LT.mute });
      K.row(ctx, "태양", fmtW(sunW), cd.px, cd.R, 238, LT.yellow);
      K.row(ctx, "지구 내부", inW.toFixed(1) + " W", cd.px, cd.R, 262, LT.orange);
      K.row(ctx, "조력", tdW.toFixed(2) + " W", cd.px, cd.R, 286, LT.blue);
      K.tip(ctx, ok ? "땅속 열 = 전구 한 개(60 W)!" : "넓이를 바꿔 땅속 열 60 W 찾기", cd.px - 4, 304, cd.w + 8, ok ? true : null);
      lWrap(ctx, "태양 값은 대기권 위의 평균입니다. 그중 약 30%는 반사되고 나머지가 지구를 데웁니다.", cd.px, 362, cd.w, 15, { s: 10.5 });
      info();
    }
    function info() {
      var inW = perM2(IN_TW) * area, sunW = perM2(SUN_TW) * area;
      $("b-stove-info").innerHTML = "넓이 <b>" + area.toLocaleString() + " m²</b> 위에서, 태양은 <b>" + Math.round(sunW).toLocaleString() + " W</b>, 땅속에서 올라오는 열은 <b>" + inW.toFixed(1) + " W</b>입니다. " +
        (Math.abs(inW - 60) <= 2 ? "🎉 백열전구 한 개(60 W)와 같아졌습니다. 운동장만 한 땅이 통째로 전구 하나인 셈입니다."
          : "지구 내부의 열은 <b>넓게 퍼져 있어 약합니다.</b> 그런데도 화산과 지진을 일으키는 것은, 그 에너지가 판 경계라는 <b>좁은 곳에 몰려</b> 쓰이기 때문입니다.");
    }
    function check() {
      var ch = false;
      if (scale === "linear" && !got.a) { got.a = true; ch = true; }
      if (Math.abs(perM2(IN_TW) * area - 60) <= 2 && !got.b) { got.b = true; window.sthState("bulbA", area.toLocaleString() + " m²"); ch = true; }
      if (ch) { window.sthState("stoveGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.a && got.b) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>선형 척도에서는 내부·조력 막대가 <b>보이지도 않습니다.</b> 그래도 그 작은 난로가 화산과 조석을 일으킵니다 — <b>전체 양</b>과 <b>한곳에 몰리는 세기</b>는 다른 문제입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call(document.querySelectorAll("#b-scale button"), function (b) {
      b.addEventListener("click", function () {
        scale = b.getAttribute("data-s");
        Array.prototype.forEach.call(document.querySelectorAll("#b-scale button"), function (x) { x.classList.toggle("on", x === b); });
        draw(); check();
      });
    });
    $("b-area").addEventListener("input", function (e) {
      area = +e.target.value; $("b-area-val").textContent = area.toLocaleString() + " m²"; draw(); check();
    });
    draw(); mission();
  })();

  /* 장면 3 — 에너지 수지 --------------------------------------------------- */
  (function () {
    var canvas = $("c-budget"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var S0 = 340.25, SIG = 5.67e-8;
    var alb = 10, gh = 0, gT = 0, gPlay = !REDUCE;
    var got = window.sthState("budGot") || { a: false, b: false, c: false };

    function teff() { return Math.pow((1 - alb / 100) * S0 / SIG, 0.25) - 273.15; }
    function tsurf() { return teff() + gh; }
    /* 블록 모형: 바다와 땅이 있는 지표 블록 위에 대기층(투명한 상자)을 얹었다. 반사율만큼 구름·얼음이 덮이고,
       온실 기체가 많을수록 대기층이 보랏빛으로 짙어지며 지표로 되돌아오는 적외선이 굵어진다. */
    var LWb = 580, IB = K.iso({ ox: 300, oy: 214, s: .74, L: 330, D: 170 }), ZG = 34, ZA = 150;
    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var a = alb / 100, ref = S0 * a, abs = S0 * (1 - a), t = gT / 1000, i, BX = [0, LWb], gk = gh / 80;
      var te = teff(), ts = tsurf(), okA = Math.abs(te + 18) <= 1.5, okB = Math.abs(ts - 15) <= 1.5;
      K.studio(ctx, 0, 0, LWb, H, { x: 330, y: 400, rx: 270, ry: 40 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LWb, H, 14); ctx.clip();
      /* 지표 블록 */
      IB.box(ctx, 0, 0, 0, IB.L, IB.D, ZG, "#7ab04e", "#8a6a4c", "#6b5038");
      IB.face(ctx, "front", function (Lw) { var g = ctx.createLinearGradient(0, 0, 0, ZG); g.addColorStop(0, "#6b5038"); g.addColorStop(1, "#a4825e"); ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, ZG); ctx.fillStyle = "#2f80d0"; ctx.fillRect(0, ZG - 12, 120, 12); });
      IB.plane(ctx, ZG, "#3d8fd8", null, 0, 120, 0, IB.D);
      IB.plane(ctx, ZG, "#e2cf98", null, 120, 132, 0, IB.D);
      IB.shade(ctx, "right", function () { return ZG; });
      /* 반사율만큼 구름·눈·얼음 조각이 지표를 덮는다 */
      var R = K.rng(17), nP = Math.round(a * 26);
      for (i = 0; i < nP; i++) {
        var px = R() * (IB.L - 30) + 15, py = R() * (IB.D - 24) + 12, c = IB.P(px, py, ZG);
        ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.beginPath(); ctx.ellipse(c.x, c.y, 15, 7, 0, 0, 6.2832); ctx.fill();
      }
      [[160, 40], [230, 30], [290, 120], [200, 140]].forEach(function (q, k) { IB.tree(ctx, q[0], q[1], ZG, .8 + (k % 2) * .2); });
      /* 대기층 — 온실 기체가 많을수록 보랏빛 */
      var ac = "rgba(" + Math.round(lerp(150, 150, gk)) + "," + Math.round(lerp(200, 120, gk)) + "," + Math.round(lerp(245, 230, gk)) + ",";
      IB.quad(ctx, IB.P(0, IB.D, ZG), IB.P(IB.L, IB.D, ZG), IB.P(IB.L, IB.D, ZA), IB.P(0, IB.D, ZA), ac + (.16 + .2 * gk).toFixed(2) + ")", "rgba(60,110,190,.35)");
      IB.quad(ctx, IB.P(IB.L, 0, ZG), IB.P(IB.L, IB.D, ZG), IB.P(IB.L, IB.D, ZA), IB.P(IB.L, 0, ZA), ac + (.22 + .22 * gk).toFixed(2) + ")", "rgba(60,110,190,.35)");
      IB.plane(ctx, ZA, ac + (.18 + .2 * gk).toFixed(2) + ")", "rgba(60,110,190,.45)");
      for (i = 0; i < Math.round(a * 8); i++) { var cp = IB.P(30 + (i * 83) % 280, 30 + (i * 47) % 120, ZA - 40); puffCloud(ctx, cp.x, cp.y, 12, .95); }
      /* 복사의 흐름 */
      var sun = { x: 58, y: 150 }; K.sun(ctx, sun.x, sun.y, 14);
      var hit = IB.P(110, 90, ZG), up1 = IB.P(220, 80, ZG + 4), top1 = IB.P(220, 80, ZA + 70);
      ctx.save(); ctx.lineCap = "round";
      K.arrow(ctx, { x: sun.x + 16, y: sun.y + 12 }, hit, "#f59f00", 6, 15);
      if (a > 0) K.arrow(ctx, { x: hit.x - 4, y: hit.y - 6 }, { x: hit.x - 26, y: 106 }, "rgba(28,126,214,.9)", 1.5 + 9 * a, 13);
      wavyArrow(ctx, up1, top1, "#e8590c", 2 + 4 * (abs / S0), -t * 6, 5);
      if (gh > 0) wavyArrow(ctx, IB.P(280, 120, ZA - 8), IB.P(280, 120, ZG + 4), "#7048e8", 1.5 + 4 * gk, t * 6, 4);
      for (i = 0; i < 4; i++) {
        var u = (t * .5 + i / 4) % 1;
        K.planet(ctx, lerp(sun.x + 16, hit.x, u), lerp(sun.y + 12, hit.y, u), 3, "#ffe08a", "#c27c00");
        K.planet(ctx, lerp(up1.x, top1.x, u), lerp(up1.y, top1.y, u), 2.8, "#ffb38a", "#b4400c");
      }
      ctx.restore();
      ctx.restore();
      IB.label(ctx, 0, IB.D * .5, ZA - 20, "대기" + (gh > 0 ? " · 온실 기체가 적외선을 붙잡음" : ""), -18, -30, gh > 0 ? "#d0bfff" : "#cfe8ff", BX);
      IB.label(ctx, 60, IB.D, ZG, "지표(바다·땅)", -20, 40, "#e8ecff", BX);
      K.pill(ctx, "햇빛 " + S0.toFixed(0) + " W/m²", sun.x + 26, sun.y + 52, { s: 11.5, c: "#ffd35a", box: BX });
      if (a > 0) K.pill(ctx, "반사 " + ref.toFixed(0), hit.x - 26, 98, { s: 11.5, a: "center", c: "#bfe6ff", box: BX });
      K.pill(ctx, "적외선으로 내보냄 " + abs.toFixed(0), top1.x + 12, top1.y + 14, { s: 11.5, c: "#ffc49a", box: BX });
      if (gh > 0) { var gp = IB.P(280, 120, ZG + 50); K.pill(ctx, "온실 효과 +" + gh + " ℃", gp.x + 14, gp.y, { s: 11.5, c: "#d0bfff", box: BX }); }
      K.bigText(ctx, "지표 " + ts.toFixed(1) + " ℃", 150, 46, 27, okB ? "#8ff0c4" : "#ffffff");
      K.bigText(ctx, "흡수 " + abs.toFixed(0) + " = 방출 " + abs.toFixed(0) + " W/m²", 150, 76, 16, "#ffd35a");
      K.warn(ctx, LWb - 14, H - 16, "⚠ 온도가 하나뿐인 공으로 본 단순 모형", "right");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWb + 10, W, H, "지구의 에너지 장부 (1 m² 당)");
      K.row(ctx, "들어오는 햇빛", S0.toFixed(0) + " W/m²", cd.px, cd.R, 58, LT.yellow);
      K.row(ctx, "반사 (반사율 " + alb + "%)", ref.toFixed(0) + " W/m²", cd.px, cd.R, 82, LT.blue);
      K.row(ctx, "흡수", abs.toFixed(0) + " W/m²", cd.px, cd.R, 106, LT.orange);
      K.row(ctx, "적외선으로 내보냄", abs.toFixed(0) + " W/m²", cd.px, cd.R, 130, LT.red);
      lt(ctx, "복사 평형 온도", cd.px, 166, { s: 12, c: LT.mute });
      lt(ctx, te.toFixed(1) + " ℃", cd.R, 170, { s: 22, w: "900", a: "right", c: okA ? LT.green : LT.ink });
      K.row(ctx, "+ 온실 효과", "+" + gh + " ℃", cd.px, cd.R, 198, LT.violet);
      lt(ctx, "= 지표 평균 기온", cd.px, 232, { s: 12, c: LT.mute });
      lt(ctx, ts.toFixed(1) + " ℃", cd.R, 236, { s: 22, w: "900", a: "right", c: okB ? LT.green : LT.ink });
      K.bar(ctx, cd.px, 250, cd.w, (ts + 40) / 120, okB ? LT.green : LT.orange);
      K.tip(ctx, okA ? (okB ? "실제 지구의 장부와 같습니다" : "이제 온실 효과로 15 ℃ 만들기") : "반사율로 평형 온도 −18 ℃ 찾기", cd.px - 4, 276, cd.w + 8, okA && okB ? true : null);
      lWrap(ctx, "실제 지구: 반사율 약 30% · 평균 기온 약 15 ℃. 대기가 없다면 −18 ℃입니다.", cd.px, 336, cd.w, 16);
      if (quiet !== true) info();
    }
    function info() {
      var te = teff(), ts = tsurf();
      $("b-budget-info").innerHTML = "반사율 <b>" + alb + "%</b> 일 때, 지구가 흡수하는 양과 내보내는 양이 같아지는 온도는 <b>" + te.toFixed(1) + " ℃</b>입니다. 여기에 온실 효과 <b>+" + gh + " ℃</b>를 더하면 지표의 평균 기온은 <b>" + ts.toFixed(1) + " ℃</b>. " +
        (Math.abs(te + 18) <= 1.5 ? (Math.abs(ts - 15) <= 1.5 ? "🎉 실제 지구의 장부와 같아졌습니다." : "복사 평형 온도는 맞췄습니다. 이제 온실 효과를 더해 15 ℃를 만들어 보세요.") :
          "반사율을 바꿔 보세요. 많이 반사할수록 흡수가 줄어 평형 온도가 내려갑니다.");
    }
    function check() {
      var ch = false;
      if (Math.abs(teff() + 18) <= 1.5 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(tsurf() - 15) <= 1.5 && !got.b) { got.b = true; window.sthState("ghFit", gh + " ℃"); ch = true; }
      if (ch) { window.sthState("budGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-3a");
      if (got.b) done("m2-3b");
      if (got.c) done("m2-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>지구는 받은 만큼 내보내며 <b>복사 평형</b>을 이룹니다. 대기가 없었다면 −18 ℃, 지금의 15 ℃는 <b>온실 효과</b>가 더해 준 몫입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    playBtn("b-budget-play", "⏸ 복사 멈추기", "▶ 복사 흐르기", function () { return gPlay; }, function (q) { gPlay = q; });
    K.animate(canvas, function (dt) { if (gPlay) { gT += dt; draw(true); } });
    $("b-alb").addEventListener("input", function (e) { alb = +e.target.value; $("b-alb-val").textContent = alb + " %"; draw(); check(); });
    $("b-gh").addEventListener("input", function (e) { gh = +e.target.value; $("b-gh-val").textContent = gh + " ℃"; draw(); check(); });
    window.sthPick({
      mount: "s2-q1",
      q: "지구가 <b>복사 평형</b>을 이루고 있다는 것은 무슨 뜻일까요?",
      options: ["지구로 들어오는 태양 복사 에너지가 0이다", "지구가 흡수하는 에너지의 양과 우주로 내보내는 에너지의 양이 같다", "지구 어느 곳이나 온도가 똑같다", "지구가 에너지를 전혀 내보내지 않는다"],
      answer: 1,
      why: ["태양 복사는 끊임없이 들어옵니다. 들어오는 양이 0이라면 지구는 계속 식을 것입니다.",
        "흡수한 만큼 적외선으로 내보내기 때문에 지구의 평균 기온이 일정하게 유지됩니다. 이 균형이 깨지면 기온이 오르거나 내립니다.",
        "적도와 극지방의 온도는 크게 다릅니다. 복사 평형은 <b>지구 전체를 합친</b> 이야기입니다.",
        "지구도 온도에 맞는 적외선을 내보냅니다. 그 양이 흡수량과 같아진 상태가 복사 평형입니다."],
      onDone: function () { got.c = true; window.sthState("budGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 조석 + 난로 가려내기 ------------------------------------------ */
  (function () {
    var canvas = $("c-tide"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var AM = 2.2, AS = 1.0, MAXR = 3.2, INCHEON = 9.0;
    var ph = 45;
    var got = window.sthState("tideGot") || { a: false, b: false, c: false };

    function rad(d) { return d * Math.PI / 180; }
    function amp(d) { return Math.sqrt(AM * AM + AS * AS + 2 * AM * AS * Math.cos(2 * rad(d))); }
    function phaseName(d) {
      var x = ((d % 360) + 360) % 360;
      if (x < 8 || x > 352) return "삭(신월)";
      if (Math.abs(x - 180) < 8) return "보름(망)";
      if (Math.abs(x - 90) < 8) return "상현";
      if (Math.abs(x - 270) < 8) return "하현";
      return x < 90 ? "초승달 무렵" : (x < 180 ? "상현과 보름 사이" : (x < 270 ? "보름과 하현 사이" : "그믐달 무렵"));
    }
    /* 입체 미니어처: 둥근 받침 위의 지구본(바닷물 부풂)과 그 둘레를 도는 달, 왼쪽 멀리 태양 등.
       오른쪽 아래에는 인천 앞바다 갯벌을 잘라 낸 작은 블록 — 만조·간조 물높이가 조차만큼 벌어진다. */
    var LWt = 580, IT = K.iso({ ox: 498, oy: 262, s: .56, L: 150, D: 110 });
    function flat(x) { return 4 + x * .22; }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var A = amp(ph), tide = INCHEON * A / MAXR, BX = [0, LWt], i;
      var spring = A >= 3.15, neap = A <= 1.25;
      K.studio(ctx, 0, 0, LWt, H, { x: 230, y: 330, rx: 240, ry: 34 });
      /* 태양 등(왼쪽 멀리) */
      var ex = 230, ey = 206, orb = 150, sq = .42, er = 38;
      var cone = ctx.createLinearGradient(0, 0, 200, 0); cone.addColorStop(0, "rgba(255,200,80,.35)"); cone.addColorStop(1, "rgba(255,200,80,0)");
      ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(14, ey - 60); ctx.lineTo(200, ey - 110); ctx.lineTo(200, ey + 90); ctx.lineTo(14, ey + 40); ctx.closePath(); ctx.fill();
      K.sun(ctx, 22, ey - 10, 15);
      /* 받침(둥근 판) */
      ctx.fillStyle = "#b9c3d1"; ctx.beginPath(); ctx.ellipse(ex, ey + 24, orb + 26, (orb + 26) * sq, 0, 0, 6.2832); ctx.fill();
      var tg = ctx.createRadialGradient(ex - 40, ey - 10, 10, ex, ey + 14, orb + 30); tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#dfe5ee");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(ex, ey + 14, orb + 26, (orb + 26) * sq, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(20,40,90,.3)"; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(ex, ey + 14, orb, orb * sq, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      /* 달 위치(받침 위 원 궤도) */
      var mx = ex - orb * Math.cos(rad(ph)), myF = ey + 14 - orb * sq * Math.sin(rad(ph)), my = myF - 22;
      function moon() {
        ctx.fillStyle = "rgba(20,30,50,.22)"; ctx.beginPath(); ctx.ellipse(mx + 3, myF, 14, 5, 0, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(20,40,90,.35)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mx, myF); ctx.lineTo(mx, my + 12); ctx.stroke();
        K.planet(ctx, mx, my, 13, "#e3e6ec", "#7d8493");
        ctx.fillStyle = "rgba(10,14,30,.55)"; ctx.beginPath(); ctx.arc(mx, my, 13, -Math.PI / 2, Math.PI / 2); ctx.fill();
      }
      if (my < ey) moon();
      /* 조석 부풂(받침 면에 비친 타원) + 지구본 */
      var num = AM * Math.sin(2 * rad(ph)) + AS * Math.sin(2 * rad(180)), den = AM * Math.cos(2 * rad(ph)) + AS * Math.cos(2 * rad(180)), psi = .5 * Math.atan2(num, den);
      ctx.save(); ctx.translate(ex, ey); ctx.scale(1, sq * 1.6); ctx.rotate(psi);
      var oa = er + 12 + A * 8, ob = er + 4 - A * 2;
      var og = ctx.createRadialGradient(0, 0, er * .7, 0, 0, oa); og.addColorStop(0, "rgba(40,130,230,.75)"); og.addColorStop(1, "rgba(80,170,240,.35)");
      ctx.fillStyle = og; ctx.beginPath(); ctx.ellipse(0, 0, oa, ob, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      ctx.fillStyle = "rgba(20,30,50,.25)"; ctx.beginPath(); ctx.ellipse(ex + 4, ey + 16, er, er * .3, 0, 0, 6.2832); ctx.fill();
      K.earth(ctx, ex, ey - 10, er);
      var ns = ctx.createLinearGradient(ex - er, 0, ex + er, 0); ns.addColorStop(0, "rgba(0,0,20,0)"); ns.addColorStop(.55, "rgba(0,0,20,.05)"); ns.addColorStop(1, "rgba(0,0,20,.55)");
      ctx.fillStyle = ns; ctx.beginPath(); ctx.arc(ex, ey - 10, er, 0, 6.2832); ctx.fill();
      if (my >= ey) moon();
      K.pill(ctx, "달", mx, my - 20, { s: 11, a: "center", c: "#e8ecff", box: BX });
      K.pill(ctx, "태양 쪽 →", 16, ey + 70, { s: 11, c: "#ffd35a", box: BX });
      /* 인천 앞바다 갯벌 블록 */
      var midZ = 26, half = tide * 1.25, zHi = midZ + half, zLo = midZ - half;
      IT.field(ctx, function (x) { return flat(x); }, function (x, y, z, l) { return K.tint(z < zLo ? "#b49b72" : (z < zHi ? "#9c8a6a" : "#7fae55"), l); }, 20, 8);
      IT.face(ctx, "front", function (Lw) { I0(Lw); });
      IT.face(ctx, "right", function (Lw) { ctx.fillStyle = "#7a6048"; ctx.fillRect(0, 0, Lw, flat(IT.L)); });
      function I0(Lw) { ctx.beginPath(); ctx.moveTo(0, 0); for (var u = 0; u <= Lw; u += 5) ctx.lineTo(u, flat(u)); ctx.lineTo(Lw, 0); ctx.closePath(); var g = ctx.createLinearGradient(0, 0, 0, 40); g.addColorStop(0, "#6b5038"); g.addColorStop(1, "#a88f70"); ctx.fillStyle = g; ctx.fill(); }
      var zW = zHi, xs = clamp((zW - 4) / .22, 0, IT.L);
      IT.water(ctx, zW, function (u, side) { return side === "front" ? flat(u) : flat(IT.L); }, { clipSurface: function (c) { c.beginPath(); var q1 = IT.P(0, 0, zW), q2 = IT.P(xs, 0, zW), q3 = IT.P(xs, IT.D, zW), q4 = IT.P(0, IT.D, zW); c.moveTo(q1.x, q1.y); c.lineTo(q2.x, q2.y); c.lineTo(q3.x, q3.y); c.lineTo(q4.x, q4.y); c.closePath(); c.clip(); } });
      IT.face(ctx, "front", function (Lw) {
        ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
        ctx.strokeStyle = "#1c7ed6"; ctx.beginPath(); ctx.moveTo(0, zHi); ctx.lineTo(Lw, zHi); ctx.stroke();
        ctx.strokeStyle = "#e8590c"; ctx.beginPath(); ctx.moveTo(0, zLo); ctx.lineTo(Lw, zLo); ctx.stroke(); ctx.setLineDash([]);
      });
      IT.edges(ctx, flat(IT.L), flat(IT.L));
      var ph1 = IT.P(0, IT.D, zHi), pl1 = IT.P(0, IT.D, zLo);
      tag(ctx, "만조", ph1.x - 8, ph1.y + 4, LT.blue, "right"); tag(ctx, "간조", pl1.x - 8, pl1.y + 12, LT.orange, "right");
      K.pill(ctx, "인천 갯벌 · 조차 " + tide.toFixed(1) + " m", 568, 232, { s: 11.5, a: "right", c: "#bfe6ff", box: BX });
      K.bigText(ctx, phaseName(ph), 18, 46, 26, "#ffffff");
      K.bigText(ctx, spring ? "사리 — 조차 " + tide.toFixed(1) + " m" : (neap ? "조금 — 조차 " + tide.toFixed(1) + " m" : "조차 " + tide.toFixed(1) + " m"), 18, 76, 17, spring ? "#ff9db0" : (neap ? "#8fd3ff" : "#ffd35a"));
      K.warn(ctx, 16, H - 14, "⚠ 크기·거리·부푼 정도는 실제 비율이 아님");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWt + 10, W, H, "조석을 일으키는 힘");
      lt(ctx, "달의 위상 " + ph + "°", cd.px, 62, { s: 20, w: "900", c: LT.ink });
      K.row(ctx, "달이 일으키는 힘", AM.toFixed(1) + " (기준)", cd.px, cd.R, 96);
      K.row(ctx, "태양이 일으키는 힘", AS.toFixed(1), cd.px, cd.R, 120);
      K.row(ctx, "두 힘을 합친 크기", A.toFixed(2), cd.px, cd.R, 144, LT.blue);
      K.row(ctx, "조차 (인천 기준)", tide.toFixed(1) + " m", cd.px, cd.R, 168, spring ? LT.red : (neap ? LT.blue : LT.ink));
      K.bar(ctx, cd.px, 182, cd.w, A / MAXR, spring ? LT.red : LT.blue);
      lt(ctx, "조금(최소)", cd.px, 210, { s: 10.5, c: LT.mute }); lt(ctx, "사리(최대)", cd.R, 210, { s: 10.5, a: "right", c: LT.mute });
      K.tip(ctx, spring ? "사리 — 달·지구·태양이 일직선" : (neap ? "조금 — 달과 태양이 직각" : "달을 더 돌려 보세요"), cd.px - 4, 224, cd.w + 8, spring || neap ? true : null);
      lWrap(ctx, "일직선이면 두 힘이 겹쳐 조차가 커지고(사리), 직각이면 서로 어긋나 작아집니다(조금). 달은 태양보다 작지만 훨씬 가까워 힘이 더 큽니다.", cd.px, 282, cd.w, 16);
      info();
    }
    function info() {
      var A = amp(ph), tide = INCHEON * A / MAXR;
      $("b-tide-info").innerHTML = "달의 위상 <b>" + ph + "°</b>(" + phaseName(ph) + ") — 두 힘을 합친 크기 <b>" + A.toFixed(2) + "</b>, 인천이라면 조차 약 <b>" + tide.toFixed(1) + " m</b>. " +
        (A >= 3.15 ? "🎉 <b>사리</b>입니다. 달·지구·태양이 거의 일직선에 놓여 두 힘이 겹쳤습니다. 보름과 그믐 무렵에 일어납니다."
          : (A <= 1.25 ? "🎉 <b>조금</b>입니다. 달과 태양이 직각으로 놓여 서로의 효과를 깎아 먹습니다. 상현·하현 무렵입니다."
            : "달을 더 돌려 보세요. 두 힘이 겹치는 자리와 어긋나는 자리가 있습니다."));
    }
    function check() {
      var A = amp(ph), ch = false;
      if (A >= 3.15 && !got.a) { got.a = true; ch = true; }
      if (A <= 1.25 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("tideGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-4a");
      if (got.b) done("m2-4b");
      if (got.c) done("m2-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>조석은 <b>달과 태양의 인력</b>이 일으킵니다. 두 힘이 겹치면 사리, 어긋나면 조금 — 이 모형에서 조차는 <b>2.7배</b>까지 차이가 납니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("b-ph").addEventListener("input", function (e) { ph = +e.target.value; $("b-ph-val").textContent = ph + "°"; draw(); check(); });
    window.sthSort({
      mount: "s2-sort",
      buckets: [
        { id: "sun", label: "태양 복사 에너지", sub: "가장 큰 난로 (99.9% 이상)" },
        { id: "in", label: "지구 내부 에너지", sub: "방사성 원소의 붕괴열 등" },
        { id: "tide", label: "조력 에너지", sub: "달과 태양의 인력" }
      ],
      items: [
        { t: "🌬️ 저위도에서 고위도로 대기가 순환하며 무역풍과 편서풍이 분다", a: "sun", why: "위도에 따른 태양 에너지 차이가 대기 대순환을 일으킵니다." },
        { t: "☁️ 바닷물이 증발해 구름이 되고 비가 내린다", a: "sun", why: "물의 순환을 돌리는 것은 태양 에너지입니다." },
        { t: "🌱 식물이 광합성으로 양분을 만든다", a: "sun", why: "생물권 전체를 먹여 살리는 에너지도 태양에서 옵니다." },
        { t: "🌊 바람에 밀려 표층 해류가 일정한 방향으로 흐른다", a: "sun", why: "표층 해류를 미는 것은 바람, 바람을 만드는 것은 태양 에너지입니다.", hint: "바람은 무엇이 만들까요?" },
        { t: "🌋 백두산과 후지산 같은 화산이 분출한다", a: "in", why: "마그마를 만들고 밀어 올리는 것은 지구 내부 에너지입니다." },
        { t: "🏔️ 판이 움직이며 지진이 일어나고 산맥이 솟는다", a: "in", why: "판을 움직이는 맨틀 대류의 열원이 지구 내부 에너지입니다." },
        { t: "🔥 온천에서 뜨거운 물이 솟는다", a: "in", why: "땅속의 열이 지하수를 데운 것입니다. 지열 발전도 같은 난로를 씁니다." },
        { t: "🌕 하루에 두 번씩 밀물과 썰물이 드나든다", a: "tide", why: "달과 태양의 인력이 바닷물을 부풀린 결과입니다." },
        { t: "🦀 서해안 갯벌이 드러났다 잠겼다 한다", a: "tide", why: "조석이 만든 지형이자 생태계입니다. 조력 발전도 이 난로를 씁니다.", hint: "하루 두 번 되풀이되는 것은 무엇 때문일까요?" }
      ],
      doneText: "가장 큰 난로가 모든 일을 하는 것은 아닙니다.",
      onDone: function () { got.c = true; window.sthState("tideGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 --------------------------------------------------------- */
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 화산과 지진은 <b>지구 내부 에너지</b>가 일으키고, 조석은 <b>인력</b>이 일으킵니다. 빛이 사라져도 인력은 그대로이니 밀물과 썰물은 계속됩니다."
        : "답은 ㉡ 입니다. 바람·비·광합성은 모두 태양 에너지가 하는 일이라 곧 멈추지만, 화산과 지진은 <b>지구 내부 에너지</b>가 일으키고, 밀물과 썰물은 <b>달과 태양의 인력</b>이 일으킵니다 — 빛이 사라져도 인력은 남습니다.") +
      "<br><b>내가 맞춘 온실 효과</b> " + (window.sthState("ghFit") || "-") + " · <b>전구 한 개가 되는 넓이</b> " + (window.sthState("bulbA") || "-");
  }
  function finish() {
    window.sthState("r2", "해결 · 태양 174,000 : 내부 47 : 조력 3.7 TW, 대기 없으면 −18 ℃ · 온실 효과로 15 ℃");
  }
  window.sthPick({
    mount: "s2-q2",
    q: "태양 에너지가 전체의 <b>99.9% 이상</b>인데, 화산 분출은 왜 태양 에너지로 설명할 수 없을까요?",
    options: ["태양 에너지는 지구 내부까지 들어가지 못하고 지표 부근에서 흡수되기 때문", "태양 에너지의 실제 양이 표에 적힌 것보다 훨씬 적기 때문", "화산은 달의 인력(조력)이 일으키기 때문", "태양 에너지는 빛이라서 물질의 온도를 높이지 못하기 때문"],
    answer: 0,
    why: ["태양 복사는 지표와 대기에서 거의 다 흡수되어 <b>표면 근처</b>의 일만 합니다. 맨틀을 대류시키고 마그마를 만드는 열은 지구 안에서 방사성 원소의 붕괴 등으로 <b>따로</b> 만들어집니다.",
      "표의 값은 널리 쓰이는 추정값입니다. 문제는 양이 아니라 그 에너지가 <b>어디까지 닿는가</b>입니다.",
      "조력은 바닷물을 움직일 뿐 마그마를 만들지 못합니다.",
      "태양 복사는 흡수되면 열로 바뀌어 지표를 데웁니다. 다만 땅속 깊은 곳까지는 닿지 못합니다."],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅲ-1] 이야기 ② 세 개의 난로",
    items: [
      { id: "w2", label: "지구 내부 에너지가 하는 일", hint: "태양 에너지로는 설명되지 않는 현상을 하나 들고, 무엇이 그 현상을 일으키는지 쓰세요.", ph: "" },
      { id: "e2b", label: "−18 ℃와 15 ℃ 사이", hint: "대기가 없는 지구의 평균 기온이 −18 ℃인데 실제로는 15 ℃ 인 까닭을, ‘흡수’와 ‘방출’이라는 말을 넣어 설명하세요.", ph: "" }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 갈라지는 땅
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "p3", title: "조사관의 첫 추리",
    question: "증거가 이렇게 많은데도 <b>베게너의 대륙 이동설</b>이 당시 받아들여지지 않은 가장 큰 까닭은 무엇일까요?",
    options: ["㉠ 화석 증거가 나중에 가짜로 밝혀져서", "㉡ 대륙을 움직이는 힘을 설명하지 못해서", "㉢ 해안선이 맞물리는 것이 우연이라고 증명되어서", "㉣ 지구가 팽창한다는 다른 이론이 이미 증명되어 있어서"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 판 경계 실험대 ------------------------------------------------ */
  (function () {
    var canvas = $("c-bnd"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var type = "divergent", vel = 5, tm = 500, T = 0, bPlay = !REDUCE;
    var got = window.sthState("bndGot") || { a: false, b: false, c: false };
    var seen = window.sthState("bndSeen") || {};
    var INFO = {
      divergent: {
        name: "발산형 경계", land: "해령 · 열곡 · 새 해양 지각", quake: "얕은 지진 (깊이 70 km 이내)",
        place: "대서양 중앙 해령, 동아프리카 열곡대, 아이슬란드", fault: "정단층",
        txt: "두 판이 서로 멀어지고, 그 틈으로 맨틀 물질이 올라와 <b>새로운 해양 지각</b>이 만들어집니다. 지각이 늘어나므로 정단층이 생기고, 마그마가 얕은 곳에서 올라와 화산 활동이 활발합니다."
      },
      convergent: {
        name: "수렴형 경계", land: "해구 · 호상 열도 · 습곡 산맥", quake: "얕은 곳 ~ 깊이 700 km까지",
        place: "일본 해구, 안데스 산맥, 히말라야 산맥", fault: "역단층",
        txt: "두 판이 부딪혀 밀도가 큰 해양판이 다른 판 아래로 <b>섭입</b>하거나, 두 대륙판이 충돌해 <b>습곡 산맥</b>을 만듭니다. 지각이 눌리므로 역단층이 생기고, 섭입하는 판을 따라 지진의 깊이가 점점 깊어집니다."
      },
      transform: {
        name: "보존형 경계", land: "긴 단층 골짜기 (생성·소멸 없음)", quake: "얕은 지진 (규모는 클 수 있다)",
        place: "산안드레아스 단층, 북아나톨리아 단층, 해령을 가로지르는 변환 단층", fault: "변환 단층",
        txt: "두 판이 서로 반대 방향으로 <b>어긋나며 미끄러집니다.</b> 지각이 새로 생기지도, 사라지지도 않습니다. 화산은 거의 없지만 쌓인 힘이 한꺼번에 풀리며 큰 지진이 일어날 수 있습니다."
      }
    };
    function dist() { return vel * tm / 10; }        /* cm/년 × 만 년 → km */
    /* 블록 모형: 판 경계를 가로질러 잘라 낸 땅덩어리. 앞면(y = D) 이 단면 — 맨틀·암석권(판)·바다.
       x 0~440(가운데 220 이 경계), y 0~150(경계를 따라 안쪽), z 위. 판 무늬는 판과 함께 움직인다. */
    var LWd = 600, B = K.iso({ ox: 300, oy: 190, s: .68, L: 440, D: 150 }), MZ = 88, LZ = 118, SEA = 140, XB = 220;
    function F(u, z) { return B.P(u, B.D, z); }
    function poly(pts, fill, stroke) {
      ctx.beginPath(); pts.forEach(function (p, k) { var q = p.x != null ? p : F(p[0], p[1]); if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    }
    function mantle() {
      B.face(ctx, "front", function (Lw) { var g = ctx.createLinearGradient(0, 0, 0, MZ); g.addColorStop(0, "#d2692e"); g.addColorStop(1, "#8a3f22"); ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, MZ); });
      B.face(ctx, "right", function (Lw) { var g = ctx.createLinearGradient(0, 0, 0, MZ); g.addColorStop(0, "#c2602a"); g.addColorStop(1, "#7a3820"); ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, MZ); });
    }
    function flow(pts, sh) {             /* 맨틀 대류: 앞면 위의 움직이는 점선 + 화살촉 */
      ctx.save(); ctx.strokeStyle = "rgba(255,226,170,.95)"; ctx.lineWidth = 2.6; ctx.setLineDash([9, 7]); ctx.lineDashOffset = -sh * .8;
      ctx.beginPath(); pts.forEach(function (p, k) { var q = F(p[0], p[1]); if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke(); ctx.restore();
      var a = F(pts[pts.length - 2][0], pts[pts.length - 2][1]), b = F(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      K.arrow(ctx, { x: lerp(a.x, b.x, .6), y: lerp(a.y, b.y, .6) }, b, "rgba(255,226,170,.95)", 2.6, 10);
    }
    function stripes(u0, u1, z0, z1, dir, sh, c1, c2, top) {   /* dir +1: 오른쪽(+x)으로, −1: 왼쪽으로 흐르는 무늬 */
      var w = 22, off = ((sh % (2 * w)) + 2 * w) % (2 * w), x, k = 0;
      ctx.save(); ctx.beginPath(); var q = [F(u0, z0), F(u1, z0), F(u1, z1), F(u0, z1)];
      if (top) q = [B.P(u0, 0, z1), B.P(u1, 0, z1), B.P(u1, B.D, z1), B.P(u0, B.D, z1)];
      ctx.moveTo(q[0].x, q[0].y); q.forEach(function (p) { ctx.lineTo(p.x, p.y); }); ctx.closePath(); ctx.clip();
      for (x = (dir > 0 ? u0 - 2 * w + off : u1 + 2 * w - off); dir > 0 ? x < u1 + w : x > u0 - 2 * w; x += dir * w, k++) {
        var xa = dir > 0 ? x : x - w, xb = xa + w + .6;
        if (top) poly([B.P(xa, 0, z1), B.P(xb, 0, z1), B.P(xb, B.D, z1), B.P(xa, B.D, z1)], k % 2 ? c2 : c1);
        else poly([[xa, z0], [xb, z0], [xb, z1], [xa, z1]], k % 2 ? c2 : c1);
      }
      ctx.restore();
    }
    function quakeAt(p, k) { var bl = Math.max(0, Math.sin(T * 3 + k * 1.9)); ctx.globalAlpha = .35 + .65 * bl; K.planet(ctx, p.x, p.y, 3 + bl * 2.5, "#ffe08a", "#e03131"); ctx.globalAlpha = 1; }
    function drawDiv(d, sh) {
      var gw = clamp(18 + d / 400, 18, 90), xl = XB - gw / 2, xr = XB + gw / 2;
      mantle();
      flow([[XB, 10], [XB, 74]], sh); flow([[XB - 26, 76], [60, 76], [40, 40]], sh); flow([[XB + 26, 76], [380, 76], [400, 40]], sh);
      /* 판(암석권) — 해령에서 양쪽으로 밀려 나간다 */
      stripes(0, xl, MZ, LZ, -1, sh, "#1f8a8a", "#16696e"); stripes(xr, B.L, MZ, LZ, 1, sh, "#1f8a8a", "#16696e");
      stripes(0, xl, MZ, LZ, -1, sh, "#2aa39a", "#1d7a78", true); stripes(xr, B.L, MZ, LZ, 1, sh, "#2aa39a", "#1d7a78", true);
      B.face(ctx, "right", function (Lw) { ctx.fillStyle = "#1d7a78"; ctx.fillRect(0, MZ, Lw, LZ - MZ); });
      /* 해령 틈의 마그마 */
      var mg = ctx.createLinearGradient(0, F(XB, MZ).y, 0, F(XB, LZ + 14).y); mg.addColorStop(0, "#ffb347"); mg.addColorStop(1, "#ff5a2a");
      poly([[xl, MZ], [xr, MZ], [XB + 4, LZ + 12], [XB - 4, LZ + 12]], mg);
      poly([B.P(XB - 4, 0, LZ + 2), B.P(XB + 4, 0, LZ + 2), B.P(XB + 4, B.D, LZ + 2), B.P(XB - 4, B.D, LZ + 2)], "#ff7a3a");
      for (var q = 0; q < 12; q++) { var u = (T * .35 + q / 12) % 1, p = F(XB + Math.sin(q * 2.3 + T * 2) * gw * .3 * u, 6 + u * 100); ctx.globalAlpha = .3 + .6 * u; K.planet(ctx, p.x, p.y, 2.2 + u * 1.6, "#ffe08a", "#e8590c"); }
      ctx.globalAlpha = 1;
      B.water(ctx, SEA, function () { return LZ; }, { phase: T * 8 });
      for (var e = 0; e < 5; e++) quakeAt(F(XB - 40 + e * 20, LZ - 6), e);
      return { gw: gw };
    }
    function drawCon(sh) {
      var tx = 236, ang = .62, ca = Math.cos(ang), sa = Math.sin(ang), th = LZ - MZ;
      mantle();
      flow([[420, 40], [300, 40], [300, 60]], sh); flow([[60, 20], [120, 60], [170, 70]], sh);
      /* 섭입하는 해양판 */
      function sl(s, off) { var flatL = B.L - tx; if (s <= flatL) return [B.L - s, LZ - off]; var r = s - flatL; return [tx - r * ca + off * sa, LZ - r * sa - off * ca]; }
      var SL = 170, tot = B.L - tx + SL, pts = [], k;
      for (k = 0; k <= 30; k++) pts.push(sl(tot * k / 30, 0)); for (k = 30; k >= 0; k--) pts.push(sl(tot * k / 30, th));
      var sg = ctx.createLinearGradient(0, F(0, LZ).y, 0, F(0, 0).y); sg.addColorStop(0, "#3c8fca"); sg.addColorStop(1, "#1d4f86");
      ctx.save(); ctx.beginPath(); var c0 = F(0, 0), c1 = F(B.L, 0), c2 = F(B.L, 200), c3 = F(0, 200); ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y); ctx.closePath(); ctx.clip();
      poly(pts, sg);
      for (k = 0; k < 16; k++) { var s3 = (sh + k * tot / 16) % tot, a1 = F(sl(s3, 2)[0], sl(s3, 2)[1]), a2 = F(sl(s3, th - 3)[0], sl(s3, th - 3)[1]); ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke(); }
      ctx.restore();
      B.face(ctx, "right", function (Lw) { ctx.fillStyle = "#2f7ab8"; ctx.fillRect(0, MZ, Lw, th); });
      poly([B.P(tx, 0, LZ), B.P(B.L, 0, LZ), B.P(B.L, B.D, LZ), B.P(tx, B.D, LZ)], "#3c8fca");
      /* 대륙판(두껍고 가벼움) — 위가 바다 위로 솟은 땅 */
      var ZC = LZ + 26, cg = ctx.createLinearGradient(0, F(0, ZC).y, 0, F(0, MZ - 14).y); cg.addColorStop(0, "#9b7a52"); cg.addColorStop(1, "#5a4030");
      poly([[0, MZ - 14], [tx - 34, MZ - 14], [tx - 4, LZ - 2], [tx - 8, ZC], [0, ZC]], cg);
      poly([B.P(0, 0, ZC), B.P(tx - 8, 0, ZC), B.P(tx - 8, B.D, ZC), B.P(0, B.D, ZC)], "#7aa84e");
      B.water(ctx, SEA, function (u, side) { return side === "front" ? (u < tx - 8 ? ZC : (u < tx + 14 ? LZ - 10 : LZ)) : LZ; },
        { phase: T * 8, clipSurface: function (c) { c.beginPath(); var q1 = B.P(tx - 8, 0, SEA), q2 = B.P(B.L, 0, SEA), q3 = B.P(B.L, B.D, SEA), q4 = B.P(tx - 8, B.D, SEA); c.moveTo(q1.x, q1.y); c.lineTo(q2.x, q2.y); c.lineTo(q3.x, q3.y); c.lineTo(q4.x, q4.y); c.closePath(); c.clip(); } });
      /* 마그마 — 섭입판이 약 100 km 깊이에 닿는 곳에서 화산으로 */
      var src = sl(B.L - tx + 110, 0), vx = 120;
      for (k = 0; k < 8; k++) { var pm = (T * .4 + k / 8) % 1, mp = F(lerp(src[0], vx, pm) + Math.sin(k * 1.7 + T * 3) * 3, lerp(src[1], ZC - 4, pm)); ctx.globalAlpha = .35 + .6 * pm; K.planet(ctx, mp.x, mp.y, 2.6, "#ffe08a", "#e8590c"); }
      ctx.globalAlpha = 1;
      [[60, 40], [150, 30], [40, 110]].forEach(function (q, i) { isoCone(ctx, B, q[0], q[1], ZC, 18, 16, "#a89070", "#6a5640"); });
      var ap = isoCone(ctx, B, vx, B.D * .55, ZC, 30, 46, "#8a6a55", "#4a3626");
      K.glow(ctx, ap.x, ap.y, 3.5, "rgba(255,120,50,.95)", 3.2);
      for (k = 0; k < 4; k++) { var pp = (T * .5 + k / 4) % 1; ctx.fillStyle = "rgba(120,114,108," + (.55 * (1 - pp)).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(ap.x + pp * 16, ap.y - 8 - pp * 34, 5 + pp * 9, 0, 6.2832); ctx.fill(); }
      for (k = 0; k < 6; k++) { var qq = sl(B.L - tx + 14 + k * 30, -3); quakeAt(F(qq[0], qq[1]), k); }
      return { tx: tx, vx: vx, ap: ap, ZC: ZC, sl: sl };
    }
    function drawTra(sh) {
      mantle();
      flow([[40, 50], [200, 50]], sh); flow([[400, 30], [240, 30]], sh);
      var ZT = LZ + 6;
      poly([[0, MZ], [XB, MZ], [XB, ZT], [0, ZT]], "#2aa39a"); poly([[XB, MZ], [B.L, MZ], [B.L, ZT], [XB, ZT]], "#3c8fca");
      B.face(ctx, "right", function (Lw) { ctx.fillStyle = "#2f7ab8"; ctx.fillRect(0, MZ, Lw, ZT - MZ); });
      poly([B.P(0, 0, ZT), B.P(XB, 0, ZT), B.P(XB, B.D, ZT), B.P(0, B.D, ZT)], "#c9b27a"); poly([B.P(XB, 0, ZT), B.P(B.L, 0, ZT), B.P(B.L, B.D, ZT), B.P(XB, B.D, ZT)], "#bba56e");
      /* 단층을 가로지르는 길 — 양쪽이 서로 반대로 미끄러진다 */
      var gap = 34, k;
      for (k = -1; k < 6; k++) {
        var yl = ((k * gap + sh * .5) % (gap * 5) + gap * 5) % (gap * 5), yr = ((k * gap - sh * .5) % (gap * 5) + gap * 5) % (gap * 5);
        K.line(ctx, B.P(10, yl, ZT), B.P(XB - 2, yl, ZT), "#5b5e66", 3); K.line(ctx, B.P(XB + 2, yr, ZT), B.P(B.L - 10, yr, ZT), "#5b5e66", 3);
      }
      K.line(ctx, B.P(XB, 0, ZT), B.P(XB, B.D, ZT), "#e03131", 2.4, [7, 5]);
      K.line(ctx, F(XB, MZ), F(XB, ZT), "#e03131", 2.4, [7, 5]);
      var la = F(XB / 2, (MZ + ZT) / 2), lb = F((XB + B.L) / 2, (MZ + ZT) / 2);
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(la.x, la.y, 8, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.arc(lb.x, lb.y, 8, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#12203a"; ctx.beginPath(); ctx.arc(la.x, la.y, 2.6, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "#12203a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lb.x - 4, lb.y - 4); ctx.lineTo(lb.x + 4, lb.y + 4); ctx.moveTo(lb.x + 4, lb.y - 4); ctx.lineTo(lb.x - 4, lb.y + 4); ctx.stroke();
      var cyc = T % 3.2, qn = Math.floor(T / 3.2), qy = 20 + (qn * 47) % 110;
      if (T > 0 && cyc < .7) {
        var c = B.P(XB, qy, ZT), r0 = 6 + cyc * 60;
        ctx.save(); ctx.globalAlpha = 1 - cyc / .7; ctx.strokeStyle = "#e03131"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(c.x, c.y, r0, r0 * .55, 0, 0, 6.2832); ctx.stroke(); ctx.beginPath(); ctx.ellipse(c.x, c.y, r0 * .55, r0 * .3, 0, 0, 6.2832); ctx.stroke(); ctx.restore();
        K.pill(ctx, "지진!", c.x, c.y - 16, { s: 11, a: "center", c: "#ffd35a" });
      }
      return { ZT: ZT, la: la, lb: lb };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var IN = INFO[type], d = dist(), pv = 8 + vel * 5, sh = T * pv, BX = [0, LWd], r;
      K.studio(ctx, 0, 0, LWd, H, { x: 330, y: 410, rx: 280, ry: 40 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LWd, H, 14); ctx.clip();
      if (type === "divergent") r = drawDiv(d, sh); else if (type === "convergent") r = drawCon(sh); else r = drawTra(sh);
      B.edges(ctx, MZ, MZ);
      ctx.restore();
      if (type === "divergent") {
        B.label(ctx, XB, B.D * .3, LZ + 2, "해령 · 열곡", 30, -54, "#ffc49a", BX);
        B.label(ctx, XB + r.gw / 2 + 30, B.D, LZ, "새 해양 지각 →", 70, 30, "#bff0e6", BX);
        B.label(ctx, XB, B.D, 40, "맨틀 대류 (솟아오름)", -150, 50, "#ffe0b0", BX);
        B.label(ctx, XB - 30, B.D, LZ - 6, "얕은 지진", -110, 6, "#ffe08a", BX);
      } else if (type === "convergent") {
        B.label(ctx, r.tx + 4, B.D * .2, LZ - 8, "▼ 해구", 40, -40, "#bfe6ff", BX);
        B.label(ctx, r.vx, B.D * .55, r.ZC + 46, "화산 · 습곡 산맥", -30, -40, "#ffc49a", BX);
        B.label(ctx, 30, B.D, r.ZC - 10, "대륙판", -24, 26, "#f4e6c4", BX);
        B.label(ctx, 400, B.D, LZ - 10, "← 해양판", 30, 40, "#cfe8ff", BX);
        var dq = r.sl(B.L - tx2() + 120, -3); B.label(ctx, dq[0], B.D, dq[1], "섭입 — 지진이 점점 깊어짐", 40, 64, "#ffe08a", BX);
      } else {
        B.label(ctx, XB, B.D * .25, r.ZT, "변환 단층", 40, -46, "#ffb0b0", BX);
        K.pill(ctx, "⊙ 다가옴", r.la.x, r.la.y + 26, { s: 11, a: "center", c: "#e8ecff", box: BX });
        K.pill(ctx, "⊗ 멀어짐", r.lb.x, r.lb.y + 26, { s: 11, a: "center", c: "#e8ecff", box: BX });
      }
      K.bigText(ctx, IN.name, 18, 46, 26, "#ffffff");
      K.bigText(ctx, vel.toFixed(1) + " cm/년 × " + tm.toLocaleString() + "만 년 = " + Math.round(d).toLocaleString() + " km", 18, 76, 16, "#ffd35a");
      K.warn(ctx, 16, H - 14, "⚠ 두께·속도는 보기 쉽게 과장");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, LWd + 10, W, H, "판 경계 판정"), ok = type === "divergent" && Math.abs(d - 5000) <= 250;
      lt(ctx, IN.name, cd.px, 62, { s: 20, w: "900", c: type === "divergent" ? LT.teal : (type === "convergent" ? LT.blue : LT.red) });
      K.row(ctx, "판의 이동 속력", vel.toFixed(1) + " cm/년", cd.px, cd.R, 94);
      K.row(ctx, "지난 시간", tm.toLocaleString() + "만 년", cd.px, cd.R, 118);
      K.row(ctx, type === "divergent" ? "새로 생긴 해양 지각" : (type === "convergent" ? "섭입한 거리" : "어긋난 거리"), Math.round(d).toLocaleString() + " km", cd.px, cd.R, 142, ok ? LT.green : LT.orange);
      [["생기는 지형", IN.land], ["지진", IN.quake], ["단층", IN.fault]].forEach(function (q, k) {
        lt(ctx, q[0], cd.px, 174 + k * 40, { s: 11.5, c: LT.mute }); lt(ctx, q[1], cd.px, 192 + k * 40, { s: 13, w: "800" });
      });
      K.tip(ctx, ok ? "지금의 대서양 폭(약 5,000 km)!" : (type === "divergent" ? "대서양 폭 5,000 km를 만들어 보세요" : "경계 셋을 모두 살펴보세요"), cd.px - 4, 292, cd.w + 8, ok ? true : null);
      lt(ctx, "대표 지역", cd.px, 350, { s: 11.5, c: LT.mute });
      lWrap(ctx, IN.place, cd.px, 368, cd.w, 16, { s: 11, c: LT.ink, w: "700" });
      lWrap(ctx, "실제 판의 이동 속력은 대개 2~10 cm/년입니다.", cd.px, 430, cd.w, 15, { s: 10.5 });
    }
    function tx2() { return 236; }
    function info() {
      var I = INFO[type], d = dist();
      $("c-bnd-info").innerHTML = "<b>" + I.name + "</b> — " + I.txt + " 속력 <b>" + vel.toFixed(1) + " cm/년</b>으로 <b>" + tm.toLocaleString() + "만 년</b>이 지나면 <b>" + Math.round(d).toLocaleString() + " km</b>가 " +
        (type === "divergent" ? "새로 만들어집니다." : (type === "convergent" ? "사라집니다(섭입)." : "어긋납니다.")) +
        (type === "divergent" && Math.abs(d - 5000) <= 250 ? " 🎉 지금의 대서양 폭과 비슷합니다." : "");
    }
    function check() {
      var ch = false;
      if (!seen[type]) { seen[type] = 1; window.sthState("bndSeen", seen); }
      if (seen.divergent && seen.convergent && seen.transform && !got.a) { got.a = true; ch = true; }
      if (type === "divergent" && Math.abs(dist() - 5000) <= 250 && !got.b) {
        got.b = true; window.sthState("atlV", vel.toFixed(1) + " cm/년 × " + tm.toLocaleString() + "만 년"); ch = true;
      }
      if (ch) { window.sthState("bndGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.c) done("m3-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>해마다 몇 cm에 지나지 않지만, <b>수천만 년</b>이 쌓이면 대양 하나가 생깁니다. 경계의 종류가 지형·지진·단층의 종류를 결정합니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call(document.querySelectorAll("#c-type button"), function (b) {
      b.addEventListener("click", function () {
        type = b.getAttribute("data-t");
        Array.prototype.forEach.call(document.querySelectorAll("#c-type button"), function (x) { x.classList.toggle("on", x === b); });
        draw(); info(); check();
      });
    });
    $("c-v").addEventListener("input", function (e) { vel = +e.target.value; $("c-v-val").textContent = vel.toFixed(1); draw(); info(); check(); });
    $("c-t").addEventListener("input", function (e) { tm = +e.target.value; $("c-t-val").textContent = tm.toLocaleString() + "만 년"; draw(); info(); check(); });
    window.sthPick({
      mount: "s3-q1",
      q: "어느 지역의 지진을 조사했더니 지각이 <b>양옆으로 잡아당겨져</b> 생기는 <b>정단층</b>이었고, 지진은 모두 얕은 곳에서 일어났습니다. 이 지역은 어떤 경계일까요?",
      options: ["발산형 경계", "수렴형 경계", "보존형 경계", "판 경계에서 멀리 떨어진 판 내부"],
      answer: 0,
      why: ["지각이 <b>늘어나며</b> 정단층이 생기고, 마그마가 얕은 곳에서 올라오므로 지진도 얕습니다. 해령과 열곡대가 그렇습니다.",
        "수렴형에서는 지각이 눌려 <b>역단층</b>이 생기고, 섭입하는 판을 따라 깊은 지진도 일어납니다.",
        "보존형에서는 옆으로 미끄러지는 <b>변환 단층</b>이 생깁니다.",
        "판 내부에서도 지진이 일어나지만, 잡아당겨져 생긴 정단층과 얕은 지진이 줄지어 나타나는 것은 발산형 경계의 특징입니다."],
      onDone: function () { got.c = true; window.sthState("bndGot", got); mission(); }
    });
    draw(); info(); mission();
    /* 판·맨틀 대류는 늘 흐른다 — setTimeout 으로 약 30번/초 */
    playBtn("c-bnd-play", "⏸ 판 멈추기", "▶ 판 움직이기", function () { return bPlay; }, function (q) { bPlay = q; });
    K.animate(canvas, function (dt) { if (bPlay) { T += dt / 1000; draw(); } });
  })();

  /* 장면 3 — 불의 고리 ----------------------------------------------------- */
  (function () {
    var canvas = $("c-quake"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var R = 2000;
    var got = window.sthState("ringGot") || { a: false, b: false };
    /* 단순화한 판 경계선 (경도, 위도) */
    var BND = [
      [[-24, 68], [-30, 55], [-33, 45], [-30, 35], [-28, 20], [-24, 8], [-17, -2], [-13, -15], [-13, -25], [-15, -35], [-11, -45], [-5, -52]],
      [[-112, 22], [-107, 10], [-102, 0], [-98, -10], [-95, -20], [-100, -32], [-110, -45], [-120, -55]],
      [[-79, 3], [-81, -6], [-77, -16], [-73, -26], [-74, -36], [-76, -46], [-77, -52]],
      [[-106, 21], [-98, 15], [-90, 13], [-84, 9]],
      [[-128, 50], [-127, 45], [-125, 40], [-122, 37], [-117, 33]],
      [[-144, 59], [-152, 56], [-158, 55], [-165, 54], [-175, 52], [-179, 51]],
      [[-86, 16], [-78, 18.5], [-71, 19], [-64, 19], [-61, 16], [-61, 11], [-68, 11], [-77, 12], [-84, 10]],
      [[175, 51], [163, 53], [157, 50], [150, 45], [145, 40], [142, 36], [140, 32], [142, 26], [145, 18], [147, 12], [146, 5]],
      [[139, 34], [136, 33], [132, 32], [128, 28], [124, 24], [122, 22], [121, 19]],
      [[126, 18], [127, 12], [126, 5], [122, 2], [120, -4]],
      [[95, 14], [93, 7], [97, 0], [102, -6], [110, -10], [118, -11], [125, -12], [132, -6], [140, -4], [148, -6]],
      [[-176, -18], [-178, -26]], [[178, -30], [176, -40], [172, -44]],
      [[70, 37], [78, 33], [85, 28], [92, 27], [97, 26]],
      [[-6, 36], [8, 44], [18, 42], [28, 37], [38, 38], [45, 38], [55, 30], [62, 30], [70, 37]],
      [[35, 12], [37, 5], [36, -2], [34, -9], [33, -17], [34, -22]],
      [[33, 28], [38, 20], [43, 13], [51, 12]],
      [[68, -5], [70, -20], [60, -30], [50, -38], [40, -48]],
      [[80, -32], [100, -45], [120, -50], [140, -55]]
    ];
    var VOL = [
      [138.7, 35.4, "후지산 (일본)"], [131.1, 32.9, "아소산 (일본)"], [128.1, 42.0, "백두산 — 판 내부"],
      [120.4, 15.1, "피나투보 (필리핀)"], [105.4, -6.1, "크라카타우 (인도네시아)"], [118.0, -8.3, "탐보라 (인도네시아)"],
      [-155.3, 19.4, "킬라우에아 (하와이) — 열점"], [-110.7, 44.4, "옐로스톤 (미국) — 열점"],
      [-122.2, 46.2, "세인트헬렌스 (미국)"], [-121.8, 46.9, "레이니어산 (미국)"],
      [-98.6, 19.0, "포포카테페틀 (멕시코)"], [-78.4, -0.7, "코토팍시 (에콰도르)"], [-71.9, -39.4, "비야리카 (칠레)"],
      [15.0, 37.8, "에트나 (이탈리아)"], [14.4, 40.8, "베수비오 (이탈리아)"],
      [-19.6, 63.6, "에이야퍄들라이외퀴들 (아이슬란드)"], [29.3, -1.5, "니라공고 (콩고민주공화국)"],
      [175.6, -39.3, "루아페후 (뉴질랜드)"]
    ];
    var EQ = [
      [142.4, 38.3, "2011 도호쿠 지진 M9.1"], [-73.4, -38.1, "1960 칠레 지진 M9.5"],
      [-147.7, 61.0, "1964 알래스카 지진 M9.2"], [95.9, 3.3, "2004 수마트라 지진 M9.1"],
      [-72.5, 18.5, "2010 아이티 지진 M7.0"], [-122.5, 37.8, "1906 샌프란시스코 지진 M7.9"],
      [103.4, 31.0, "2008 쓰촨 지진 M7.9"], [84.7, 28.2, "2015 네팔 지진 M7.8"],
      [37.0, 37.2, "2023 튀르키예 지진 M7.8"], [135.0, 34.6, "1995 고베 지진 M6.9"],
      [129.2, 35.8, "2016 경주 지진 M5.8 — 판 내부"], [129.4, 36.1, "2017 포항 지진 M5.4 — 판 내부"]
    ];
    var MX0 = 40, MY0 = 46, MSX = 840 / 360, MSY = 326 / 140;
    function mx(lon) { return MX0 + (lon + 180) * MSX; }
    function my(lat) { return MY0 + (80 - lat) * MSY; }
    function segDist(plon, plat, a, b) {
      var k = Math.cos(plat * Math.PI / 180) * 111.32;
      var px = plon * k, py = plat * 110.57;
      var ax = a[0] * k, ay = a[1] * 110.57, bx = b[0] * k, by = b[1] * 110.57;
      var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      var t = L ? clamp(((px - ax) * dx + (py - ay) * dy) / L, 0, 1) : 0;
      return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    }
    function nearest(lon, lat) {
      var best = 1e9;
      for (var i = 0; i < BND.length; i++) for (var j = 0; j < BND[i].length - 1; j++) {
        var d = segDist(lon, lat, BND[i][j], BND[i][j + 1]);
        if (d < best) best = d;
      }
      return best;
    }
    var VD = VOL.map(function (p) { return nearest(p[0], p[1]); });
    var ED = EQ.map(function (p) { return nearest(p[0], p[1]); });
    function ratio(arr) { var c = 0; for (var i = 0; i < arr.length; i++) if (arr[i] <= R) c++; return c / arr.length * 100; }
    var CONT = [
      [[-168, 65], [-165, 60], [-150, 59], [-135, 57], [-125, 49], [-124, 40], [-117, 32], [-105, 22], [-97, 18], [-90, 21], [-83, 23], [-81, 26], [-80, 32], [-76, 38], [-70, 44], [-60, 47], [-55, 52], [-64, 60], [-78, 62], [-95, 60], [-90, 68], [-110, 69], [-130, 70], [-155, 71]],
      [[-45, 60], [-20, 70], [-25, 82], [-60, 82], [-70, 76], [-55, 65]],
      [[-81, -2], [-75, -14], [-70, -18], [-70, -30], [-73, -45], [-70, -54], [-65, -52], [-58, -40], [-48, -25], [-40, -20], [-35, -8], [-45, -1], [-50, 3], [-60, 8], [-72, 11], [-77, 8], [-80, 2]],
      [[-17, 15], [-17, 21], [-10, 27], [0, 32], [10, 37], [20, 32], [32, 31], [35, 24], [43, 12], [51, 12], [48, 2], [41, -3], [40, -15], [35, -22], [32, -28], [20, -35], [18, -32], [12, -18], [9, -1], [2, 5], [-8, 5], [-13, 9]],
      [[-9, 43], [0, 49], [10, 57], [20, 60], [28, 65], [30, 70], [60, 71], [80, 74], [105, 77], [130, 73], [160, 70], [180, 66], [170, 60], [155, 57], [142, 54], [140, 45], [130, 42], [122, 40], [120, 33], [110, 21], [105, 10], [100, 13], [97, 16], [90, 22], [80, 10], [77, 8], [72, 20], [65, 25], [57, 25], [48, 30], [36, 36], [28, 41], [20, 40], [12, 45], [3, 43]],
      [[113, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -18], [153, -27], [150, -37], [141, -38], [131, -32], [123, -34], [115, -34]],
      [[95, 6], [105, -2], [115, -9], [130, -8], [140, -8], [141, -2], [130, 0], [118, -2], [105, -6], [100, 2]],
      [[172, -34], [178, -38], [177, -41], [174, -41], [171, -44], [167, -47], [166, -45], [170, -40]],
      [[130, 32], [135, 34], [140, 36], [142, 41], [145, 44], [141, 45], [136, 37], [131, 31]]
    ];
    /* 입체 지도판: 두께가 있는 세계 지도 판을 스튜디오 바닥에 놓고, 화산은 작은 원뿔, 큰 지진은 붉은 점.
       아래 흰 판정 카드에 판 경계에서 R km 안쪽 비율. (눌러 보는 좌표 mx·my 는 그대로) */
    function vcone(x, y, on) {
      ctx.fillStyle = "rgba(20,30,50,.25)"; ctx.beginPath(); ctx.ellipse(x + 2, y + 4, 7, 2.4, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = on ? "#f08a4b" : "#c4cad4"; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x - 7, y + 4); ctx.lineTo(x, y + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = on ? "#b4400c" : "#8a929e"; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 4); ctx.lineTo(x + 7, y + 4); ctx.closePath(); ctx.fill();
      if (on) { ctx.fillStyle = "#ffd27a"; ctx.beginPath(); ctx.arc(x, y - 8, 1.8, 0, 6.2832); ctx.fill(); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.studio(ctx, 0, 0, W, H, { x: 460, y: 380, rx: 440, ry: 26 });
      var X0 = MX0, Y0 = MY0, MW = 840, MH = 326;
      /* 지도판 두께와 그림자 */
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#8e9aac"; ctx.beginPath(); ctx.roundRect(X0, Y0 + 8, MW, MH, 8); ctx.fill(); ctx.restore();
      var sea = ctx.createLinearGradient(0, Y0, 0, Y0 + MH); sea.addColorStop(0, "#a9d6f2"); sea.addColorStop(.5, "#7cbde8"); sea.addColorStop(1, "#5ea6d8");
      ctx.fillStyle = sea; ctx.beginPath(); ctx.roundRect(X0, Y0, MW, MH, 8); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1;
      for (var g = -180; g <= 180; g += 30) { ctx.beginPath(); ctx.moveTo(mx(g), Y0); ctx.lineTo(mx(g), Y0 + MH); ctx.stroke(); }
      for (var h2 = -60; h2 <= 80; h2 += 20) { ctx.beginPath(); ctx.moveTo(X0, my(h2)); ctx.lineTo(X0 + MW, my(h2)); ctx.stroke(); }
      var land = ctx.createLinearGradient(0, Y0, 0, Y0 + MH); land.addColorStop(0, "#c9d6a4"); land.addColorStop(.45, "#b9c98a"); land.addColorStop(.6, "#d8c48e"); land.addColorStop(1, "#a9c48a");
      for (var c = 0; c < CONT.length; c++) {
        ctx.beginPath();
        for (var p = 0; p < CONT[c].length; p++) { var X = mx(CONT[c][p][0]), Y = my(CONT[c][p][1]); if (p === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
        ctx.closePath();
        ctx.save(); ctx.translate(0, 2.5); ctx.fillStyle = "rgba(60,70,40,.35)"; ctx.fill(); ctx.restore();
        ctx.fillStyle = land; ctx.fill(); ctx.strokeStyle = "rgba(90,80,40,.4)"; ctx.lineWidth = 1; ctx.stroke();
      }
      /* 판 경계 */
      ctx.save(); ctx.lineJoin = "round";
      [["rgba(255,255,255,.85)", 5.5], ["#d6336c", 2.4]].forEach(function (st) {
        ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
        for (var i = 0; i < BND.length; i++) { ctx.beginPath(); for (var j = 0; j < BND[i].length; j++) { var xx = mx(BND[i][j][0]), yy = my(BND[i][j][1]); if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); } ctx.stroke(); }
      });
      ctx.restore();
      for (var k = 0; k < VOL.length; k++) vcone(mx(VOL[k][0]), my(VOL[k][1]), VD[k] <= R);
      for (var m = 0; m < EQ.length; m++) {
        var ex = mx(EQ[m][0]), ey = my(EQ[m][1]), inE = ED[m] <= R;
        ctx.strokeStyle = inE ? "rgba(224,49,49,.75)" : "rgba(120,130,150,.6)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.stroke();
        K.planet(ctx, ex, ey, 4.2, inE ? "#ff6b6b" : "#c4cad4", inE ? "#a51111" : "#6b7484");
      }
      K.pill(ctx, "세계의 화산과 큰 지진 — 그리고 판 경계", X0 + 8, 30, { s: 13, c: "#e8ecff" });
      /* 아래 판정 카드 */
      var rv = ratio(VD), re = ratio(ED), ok = R <= 800 && rv >= 70 && re >= 70, cy = 386;
      K.card(ctx, 20, cy, 860, H - cy - 6, "판 경계에서 " + R.toLocaleString() + " km 안쪽에 있는 비율");
      lt(ctx, "▲ 화산 18곳 · ● 큰 지진 12곳 · ━ 판 경계(단순화) · 회색 = 기준 밖", 862, cy + 28, { s: 11, c: LT.mute, a: "right" });
      [["화산", rv, LT.orange], ["큰 지진", re, LT.red]].forEach(function (b, i) {
        var yy = cy + 52 + i * 28;
        lt(ctx, b[0], 40, yy + 10, { s: 12.5, w: "800", c: LT.mute });
        K.bar(ctx, 110, yy, 470, b[1] / 100, b[2]);
        lt(ctx, b[1].toFixed(0) + " %", 596, yy + 11, { s: 14, w: "900", c: b[2] });
      });
      K.tip(ctx, R > 800 ? "기준이 너무 넓습니다 — 800 km 이하로" : (ok ? "좁은 띠 안에 대부분이 들어옵니다" : "이 거리에서는 아직 많이 빠집니다"), 644, cy + 46, 220, R > 800 ? null : ok);
      lt(ctx, "판 경계를 따라 늘어선 띠 = 변동대. 띠에서 벗어난 것은 열점 화산이거나 판 내부 지진입니다.", 40, H - 16, { s: 11, c: LT.mute, w: "600" });
      info(rv, re);
    }
    function info(rv, re) {
      $("c-quake-info").innerHTML = "판 경계에서 <b>" + R.toLocaleString() + " km</b> 안쪽에 화산의 <b>" + rv.toFixed(0) + "%</b>, 큰 지진의 <b>" + re.toFixed(0) + "%</b>가 들어옵니다. " +
        (R <= 800 && rv >= 70 && re >= 70 ? "🎉 화산과 지진은 지구에 고르게 흩어져 있지 않고 <b>판 경계를 따라 좁은 띠</b>를 이룹니다. 이 띠를 <b>변동대</b>라고 합니다."
          : "거리를 줄여 가며, 어디까지 좁혀도 대부분이 남는지 확인해 보세요.") +
        " 지도의 점을 눌러 보세요 — 하와이·옐로스톤은 판 경계에서 멀리 떨어진 <b>열점</b> 화산이고, 경주·포항은 경계 위가 아닌 <b>판 내부</b>에서 일어난 지진입니다.";
    }
    function check() {
      if (R <= 800 && ratio(VD) >= 70 && ratio(ED) >= 70 && !got.a) {
        got.a = true; window.sthState("ringR", R.toLocaleString() + " km"); window.sthState("ringGot", got); mission();
      }
    }
    function mission() {
      if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (got.a && got.b) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>화산과 지진은 <b>판 경계를 따라</b> 띠를 이룹니다. 태평양을 두른 이 띠가 ‘불의 고리’입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    canvas.addEventListener("click", function (e) {
      var p = pointOnCanvas(canvas, e), best = null, bd = 14;
      for (var i = 0; i < VOL.length; i++) {
        var d = Math.hypot(p.x - mx(VOL[i][0]), p.y - my(VOL[i][1]));
        if (d < bd) { bd = d; best = { t: "🌋 " + VOL[i][2], d: VD[i] }; }
      }
      for (var j = 0; j < EQ.length; j++) {
        var d2 = Math.hypot(p.x - mx(EQ[j][0]), p.y - my(EQ[j][1]));
        if (d2 < bd) { bd = d2; best = { t: "⚡ " + EQ[j][2], d: ED[j] }; }
      }
      if (best) {
        $("c-quake-info").innerHTML = "<b>" + best.t + "</b> — 가장 가까운 판 경계까지 <b>약 " + Math.round(best.d / 10) * 10 + " km</b>입니다. " +
          (/열점|판 내부/.test(best.t)
            ? "판 경계 위가 아닙니다. 열점 위를 판이 지나가며 생긴 화산이거나, 판 내부의 오래된 단층이 다시 움직여 일어난 지진입니다."
            : (best.d <= 300 ? "판 경계를 따라 늘어선 <b>변동대</b> 위에 있습니다."
               : "이 지도에 그린 판 경계에서는 꽤 떨어져 있습니다. 대륙끼리 부딪치는 넓은 충돌대나 갈라지는 열곡대처럼 이 지도에 선으로 다 그리지 못한 변동대에 속한 곳입니다."));
      }
    });
    window.sthSort({
      mount: "s3-sort",
      buckets: [
        { id: "div", label: "발산형 경계", sub: "멀어진다 · 새 지각이 생긴다" },
        { id: "con", label: "수렴형 경계", sub: "부딪힌다 · 지각이 사라지거나 솟는다" },
        { id: "tra", label: "보존형 경계", sub: "어긋난다 · 생기지도 사라지지도 않는다" }
      ],
      items: [
        { t: "대서양 중앙 해령에서 해저가 갈라지며 새로운 현무암질 지각이 계속 생성된다", a: "div", why: "해령은 대표적인 발산형 경계입니다." },
        { t: "동아프리카 열곡대는 대륙이 갈라지는 초기 단계로 여겨진다", a: "div", why: "대륙에서 일어나는 발산으로, 먼 훗날 새 바다가 될 수 있습니다." },
        { t: "아이슬란드는 해령이 바다 위로 솟은 섬이라, 섬 한가운데가 갈라지고 있다", a: "div", why: "대서양 중앙 해령이 지나가는 자리입니다.", hint: "아이슬란드 한가운데에는 무엇이 지나갈까요?" },
        { t: "일본 해구에서 태평양판이 유라시아판 아래로 가라앉으며 잦은 지진과 화산이 일어난다", a: "con", why: "해양판이 섭입하는 수렴형 경계입니다." },
        { t: "히말라야 산맥은 인도판과 유라시아판이 충돌해 솟아올랐다", a: "con", why: "두 대륙판이 충돌한 수렴형 경계로, 해구 없이 높은 습곡 산맥이 만들어집니다." },
        { t: "안데스 산맥 서쪽에서 나스카판이 남아메리카판 아래로 섭입하며 화산 활동이 활발하다", a: "con", why: "해양판이 대륙판 아래로 섭입하는 수렴형 경계입니다." },
        { t: "미국 캘리포니아의 산안드레아스 단층에서 두 판이 지각의 생성·소멸 없이 어긋나며 미끄러진다", a: "tra", why: "대표적인 보존형 경계입니다." },
        { t: "해령과 해령 사이를 가로지르는 변환 단층에서 두 조각이 반대 방향으로 스쳐 지나간다", a: "tra", why: "해령을 어긋나게 만드는 변환 단층이 보존형 경계입니다.", hint: "지각이 새로 생기나요, 사라지나요?" },
        { t: "튀르키예의 북아나톨리아 단층에서 두 판이 옆으로 미끄러지며 큰 지진이 일어난다", a: "tra", why: "화산은 거의 없지만 큰 지진이 되풀이되는 보존형 경계입니다." }
      ],
      doneText: "경계의 종류를 알면 그곳에 무엇이 생길지 예측할 수 있습니다.",
      onDone: function () { got.b = true; window.sthState("ringGot", got); mission(); }
    });
    $("c-r").addEventListener("input", function (e) {
      R = +e.target.value; $("c-r-val").textContent = R.toLocaleString() + " km"; draw(); check();
    });
    draw(); mission();
  })();

  /* 장면 4 — 열점과 미래 --------------------------------------------------- */
  var got4 = window.sthState("driftGot") || { a: false, b: false, c: false };
  function mission4() {
    if (got4.a) done("m3-4a");
    if (got4.b) done("m3-4b");
    if (got4.c) done("m3-4c");
    if (got4.a && got4.b && got4.c) {
      window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>하와이 열도는 <b>움직이는 판 위에 찍힌 발자국</b>입니다. 발자국의 간격과 나이로 판의 속력을 재고, 그 속력으로 미래의 지도를 그릴 수 있습니다.");
      ep.clear(3);
    }
  }
  (function () {
    var canvas = $("c-hot"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var vp = 14, T = 0, hPlay = !REDUCE;
    var DATA = [{ n: "카우아이섬", km: 500, ma: 5.0 }, { n: "미드웨이섬", km: 2400, ma: 28.0 }];
    function err(d) { return Math.abs(vp * 10 * d.ma - d.km) / d.km; }
    function fit() { return err(DATA[0]) <= 0.15 && err(DATA[1]) <= 0.15; }
    /* 블록 모형: 태평양 바닥을 잘라 낸 블록. 앞면 단면에 판(암석권)과 맨틀, 제자리에 있는 열점 기둥.
       판은 북서쪽(왼쪽 위)으로 흘러가고, 열점 위에서 생긴 섬들이 판에 실려 가며 낮아진다. 오른쪽은 나이-거리 그래프 카드. */
    var LWh = 520, HB = K.iso({ ox: 248, oy: 190, s: .66, L: 460, D: 110 }), HM = 60, HP = 84, HS = 118, HX = 400;
    var ISL = [["하와이섬", 0, 0, 40, 64], ["마우이섬", 1.3, 45, 32, 52], ["오아후섬", 3.0, 95, 28, 44], ["카우아이섬", 5.0, 150, 26, 39], ["", 12, 240, 22, 26], ["미드웨이섬", 28, 360, 22, 35]];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var pv = 6 + vp * 2.2, sh = T * pv, BX = [0, LWh], i;
      K.studio(ctx, 0, 0, LWh, H, { x: 270, y: 380, rx: 250, ry: 34 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LWh, H, 14); ctx.clip();
      /* 앞면·오른쪽 면: 맨틀과 판 */
      ["front", "right"].forEach(function (sd) {
        HB.face(ctx, sd, function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, HM); g.addColorStop(0, "#c95f2c"); g.addColorStop(1, "#8a3f22"); ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, HM);
          var pg = ctx.createLinearGradient(0, HM, 0, HP); pg.addColorStop(0, "#2c3640"); pg.addColorStop(1, "#56626e"); ctx.fillStyle = pg; ctx.fillRect(0, HM, Lw, HP - HM);
          if (sd === "front") {
            var w = 26, off = (sh % (2 * w) + 2 * w) % (2 * w); ctx.fillStyle = "rgba(255,255,255,.1)";
            for (var bx = Lw + 2 * w - off; bx > -w; bx -= 2 * w) ctx.fillRect(bx - w, HM, w, HP - HM);
            var pl = ctx.createLinearGradient(HX - 22, 0, HX + 22, 0); pl.addColorStop(0, "rgba(255,150,60,0)"); pl.addColorStop(.5, "rgba(255,190,90,.95)"); pl.addColorStop(1, "rgba(255,150,60,0)");
            ctx.fillStyle = pl; ctx.fillRect(HX - 22, 0, 44, HM + 2);
            ctx.fillStyle = "rgba(255,150,60,.85)"; ctx.fillRect(HX - 3, HM, 6, HP - HM);
          }
        });
      });
      HB.shade(ctx, "right", function () { return HP; });
      for (i = 0; i < 9; i++) { var pm = (T * .45 + i / 9) % 1, mp = HB.P(HX + Math.sin(i * 2.1 + T * 2.4) * 6, HB.D, 4 + pm * (HM - 4)); ctx.globalAlpha = .35 + .6 * pm; K.planet(ctx, mp.x, mp.y, 2.4, "#ffe08a", "#e8590c"); }
      ctx.globalAlpha = 1;
      /* 바다 밑 판 윗면(무늬가 북서쪽으로 흐름) */
      var w2 = 30, off2 = (sh % (2 * w2) + 2 * w2) % (2 * w2);
      for (var xx = HB.L + 2 * w2 - off2, k = 0; xx > -w2; xx -= w2, k++) {
        var xa = Math.max(0, xx - w2), xb = Math.min(HB.L, xx); if (xb <= xa) continue;
        HB.quad(ctx, HB.P(xa, 0, HP), HB.P(xb, 0, HP), HB.P(xb, HB.D, HP), HB.P(xa, HB.D, HP), k % 2 ? "#4a5866" : "#55636f");
      }
      /* 섬: 물에 잠긴 아래쪽 → 바닷물 → 물 위로 나온 꼭대기 */
      var yc = HB.D * .5;
      ISL.forEach(function (s) { isoCone(ctx, HB, HX - s[2], yc, HP, s[3], s[4], "#7c8a74", "#3e4a40", HS); });
      HB.water(ctx, HS, function () { return HP; }, { phase: T * 6 });
      var tops = ISL.map(function (s, n) {
        var x = HX - s[2], ap;
        if (s[4] > HS - HP) {
          var rr = s[3] * (1 - (HS - HP) / s[4]);
          ap = isoCone(ctx, HB, x, yc, HS, rr, s[4] - (HS - HP), n === 0 ? "#8a6a55" : "#7fae55", n === 0 ? "#4a3626" : "#3f6b2e");
        } else ap = HB.P(x, yc, HP + s[4]);
        return ap;
      });
      K.glow(ctx, tops[0].x, tops[0].y, 3.5, "rgba(255,120,50,.95)", 3.2);
      ctx.restore();
      /* 판 이동 방향 */
      var a0 = HB.P(340, -10, HS + 110), a1 = HB.P(200, -10, HS + 110);
      K.arrow(ctx, a0, a1, "#0c8599", 4, 14);
      K.pill(ctx, "← 판 이동(북서쪽)", a1.x - 8, a1.y + 6, { s: 11, a: "right", c: "#bff0e6", box: BX });
      HB.label(ctx, HX, HB.D, 30, "열점 (제자리)", 40, 40, "#ffc49a", BX);
      HB.label(ctx, HX, yc, HS + 30, "하와이섬 · 0 (활화산)", 24, -40, "#ffc49a", BX);
      HB.label(ctx, HX - 150, yc, HS + 4, "카우아이섬 · 500만 년", -10, -64, "#e8ecff", BX);
      HB.label(ctx, HX - 360, yc, HS + 2, "미드웨이섬 · 2,800만 년", -6, -40, "#e8ecff", BX);
      HB.label(ctx, 30, HB.D, (HM + HP) / 2, "태평양판", -20, 30, "#cfd8e2", BX);
      K.bigText(ctx, "판 속력 " + vp.toFixed(1) + " cm/년", 18, 46, 25, fit() ? "#8ff0c4" : "#ffffff");
      K.bigText(ctx, "= " + (vp * 10).toFixed(0) + " km / 백만 년", 18, 76, 16, "#ffd35a");
      K.warn(ctx, 16, H - 14, "⚠ 섬 크기·간격은 보기 쉽게 바꾼 것");
      /* 오른쪽 그래프 카드 */
      var cx0 = LWh + 10, MA = 32, KM = 2800;
      K.card(ctx, cx0, 0, W - cx0, H, "섬의 나이와 거리");
      var gq = K.chart(ctx, { x: cx0 + 8, y: 40, w: W - cx0 - 20, h: 220, pl: 50, light: true, x0: 0, x1: MA, y0: 0, y1: KM, xt: 4, yt: 4, xl: "나이(백만 년)", yl: "거리(km)",
        xf: function (q) { return String(Math.round(q)); }, yf: function (q) { return Math.round(q).toLocaleString(); } });
      var endMa = Math.min(MA, KM / (vp * 10));
      K.plot(ctx, gq, [[0, 0], [endMa, vp * 10 * endMa]], fit() ? LT.green : LT.blue, { light: true, w: 3 });
      for (var d = 0; d < DATA.length; d++) {
        var px = gq.X(DATA[d].ma), py = gq.Y(DATA[d].km), okd = err(DATA[d]) <= .15;
        K.planet(ctx, px, py, 6, okd ? "#5fe0b0" : "#ff8a8a", okd ? "#0f7a5a" : "#b02020");
        tag(ctx, DATA[d].n, px - 10, py - 10, LT.ink, "right");
      }
      var R0 = W - 18, P0 = cx0 + 18;
      K.row(ctx, "카우아이 오차", (err(DATA[0]) * 100).toFixed(0) + " %", P0, R0, 290, err(DATA[0]) <= .15 ? LT.green : LT.red);
      K.row(ctx, "미드웨이 오차", (err(DATA[1]) * 100).toFixed(0) + " %", P0, R0, 314, err(DATA[1]) <= .15 ? LT.green : LT.red);
      K.tip(ctx, fit() ? "두 섬 모두 오차 15% 안" : (vp * 10 * DATA[1].ma > DATA[1].km ? "너무 빠릅니다 — 속력을 줄이기" : "너무 느립니다 — 속력을 올리기"), P0 - 4, 330, R0 - P0 + 8, fit() ? true : null);
      lt(ctx, "거리 = 속력 × 나이", P0, 384, { s: 12, w: "800", c: LT.blue });
    }
    function info() {
      $("c-hot-info").innerHTML = "속력 <b>" + vp.toFixed(1) + " cm/년</b>으로 계산하면 카우아이섬(500 km · 500만 년)은 오차 <b>" + (err(DATA[0]) * 100).toFixed(0) + "%</b>, 미드웨이섬(2,400 km · 2,800만 년)은 오차 <b>" + (err(DATA[1]) * 100).toFixed(0) + "%</b>입니다. " +
        (fit() ? "🎉 두 자료에 모두 들어맞습니다. 실제로 태평양판의 이동 속력은 이 정도로 알려져 있습니다."
          : (vp * 10 * DATA[1].ma > DATA[1].km ? "너무 빠릅니다. 속력을 줄여 보세요." : "너무 느립니다. 속력을 올려 보세요."));
    }
    function check() {
      if (fit() && !got4.a) { got4.a = true; window.sthState("vpFit", vp.toFixed(1) + " cm/년"); window.sthState("driftGot", got4); mission4(); }
    }
    canvas._redraw = draw;
    $("c-vp").addEventListener("input", function (e) { vp = +e.target.value; $("c-vp-val").textContent = vp.toFixed(1); draw(); info(); check(); });
    draw(); info();
    playBtn("c-hot-play", "⏸ 판 멈추기", "▶ 판 움직이기", function () { return hPlay; }, function (q) { hPlay = q; });
    K.animate(canvas, function (dt) { if (hPlay) { T += dt / 1000; draw(); } });
  })();

  (function () {
    var canvas = $("c-future"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ft = 0;
    var M = [
      { n: "대서양이 넓어지는 거리", v: 2.5, note: "대서양 중앙 해령에서 새 지각이 생기며", col: "--brand" },
      { n: "태평양판이 일본 해구로 섭입하는 거리", v: 8.5, note: "태평양판이 유라시아판 아래로 가라앉으며", col: "--coral" },
      { n: "인도판이 북쪽으로 미는 거리", v: 5.0, note: "히말라야를 더 밀어 올리며", col: "--violet" }
    ];
    function km(v) { return v * ft / 10; }
    /* 블록 모형: 대서양을 동서로 잘라 낸 블록. 가운데 해령에서 새 해양 지각이 생기며 두 대륙(해안선이 맞물리는 모양)이 벌어진다. */
    var LWf = 560, FB = K.iso({ ox: 250, oy: 128, s: .6, L: 420, D: 170 }), FM = 40, FO = 56, FS = 70, FC = 80;
    function coastF(y) { return 10 * Math.sin(y / 26) + 4 * Math.sin(y / 11 + 1); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var atl = km(2.5), wid = 110 + atl * .07, xl = 210 - wid / 2, xr = 210 + wid / 2, BX = [0, LWf], i, okF = Math.abs(atl - 1000) <= 50;
      K.studio(ctx, 0, 0, LWf, H, { x: 280, y: 350, rx: 260, ry: 30 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LWf, H, 14); ctx.clip();
      /* 앞면 단면: 맨틀 · 해양 지각 · 대륙 지각 */
      FB.face(ctx, "front", function (Lw) {
        var g = ctx.createLinearGradient(0, 0, 0, FM); g.addColorStop(0, "#c95f2c"); g.addColorStop(1, "#8a3f22"); ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, FM);
        ctx.fillStyle = "#3a4652"; ctx.fillRect(0, FM, Lw, FO - FM);
        ctx.fillStyle = "#2aa39a"; ctx.fillRect(210 - (wid - 110) / 2 - 6, FM, wid - 110 + 12, FO - FM);
        var cg = ctx.createLinearGradient(0, FC, 0, FM - 16); cg.addColorStop(0, "#9b7a52"); cg.addColorStop(1, "#5a4030"); ctx.fillStyle = cg;
        ctx.beginPath(); ctx.moveTo(0, FM - 16); ctx.lineTo(xl + coastF(FB.D) + 12, FM - 16); ctx.lineTo(xl + coastF(FB.D), FC); ctx.lineTo(0, FC); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(Lw, FM - 16); ctx.lineTo(xr + coastF(FB.D) - 12, FM - 16); ctx.lineTo(xr + coastF(FB.D), FC); ctx.lineTo(Lw, FC); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#ff7a3a"; ctx.beginPath(); ctx.moveTo(204, FM); ctx.lineTo(216, FM); ctx.lineTo(210, FO + 4); ctx.closePath(); ctx.fill();
      });
      FB.face(ctx, "right", function (Lw) { var g = ctx.createLinearGradient(0, 0, 0, FM); g.addColorStop(0, "#c95f2c"); g.addColorStop(1, "#8a3f22"); ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, FM); ctx.fillStyle = "#7a5a3c"; ctx.fillRect(0, FM - 16, Lw, FC - FM + 16); });
      /* 바다 밑 — 해령 가까이의 새 지각(밝은 띠) */
      FB.plane(ctx, FO, "#46525e");
      for (i = 0; i < 6; i++) { var f0 = i / 6, f1 = (i + 1) / 6, h = (wid - 110) / 2 + 6; FB.plane(ctx, FO + .2, i % 2 ? "#2aa39a" : "#23888a", null, 210 + h * f0, 210 + h * f1); FB.plane(ctx, FO + .2, i % 2 ? "#2aa39a" : "#23888a", null, 210 - h * f1, 210 - h * f0); }
      FB.plane(ctx, FO + .4, "#ff7a3a", null, 207, 213);
      /* 두 대륙(해안선이 맞물림) */
      var N = 34;
      for (i = 0; i < N; i++) {
        var y0 = FB.D * i / N, y1 = FB.D * (i + 1) / N, c0 = coastF(y0), c1 = coastF(y1);
        FB.quad(ctx, FB.P(0, y0, FC), FB.P(xl + c0, y0, FC), FB.P(xl + c1, y1, FC), FB.P(0, y1, FC), "#7fae55");
        FB.quad(ctx, FB.P(xl + c0, y0, FO), FB.P(xl + c0, y0, FC), FB.P(xl + c1, y1, FC), FB.P(xl + c1, y1, FO), "#8a6a4c");
      }
      FB.water(ctx, FS, function (u, side) { return side === "front" ? (u < xl + coastF(FB.D) || u > xr + coastF(FB.D) ? FC : FO) : FC; },
        { clipSurface: function (c) { c.beginPath(); var q = [FB.P(xl, 0, FS), FB.P(xr, 0, FS), FB.P(xr, FB.D, FS), FB.P(xl, FB.D, FS)]; c.moveTo(q[0].x, q[0].y); q.forEach(function (p) { c.lineTo(p.x, p.y); }); c.closePath(); c.clip(); } });
      for (i = 0; i < N; i++) {
        var ya = FB.D * i / N, yb = FB.D * (i + 1) / N;
        FB.quad(ctx, FB.P(xr + coastF(ya), ya, FC), FB.P(FB.L, ya, FC), FB.P(FB.L, yb, FC), FB.P(xr + coastF(yb), yb, FC), "#c9b27a");
      }
      FB.edges(ctx, FC, FC);
      ctx.restore();
      var b0 = FB.P(210 - (wid - 110) / 2, FB.D, FO), b1 = FB.P(210 + (wid - 110) / 2, FB.D, FO);
      if (atl > 0) { K.line(ctx, { x: b0.x, y: b0.y + 26 }, { x: b1.x, y: b1.y + 26 }, "#0c8599", 3); tag(ctx, "+" + Math.round(atl).toLocaleString() + " km", (b0.x + b1.x) / 2, (b0.y + b1.y) / 2 + 52, okF ? LT.green : LT.teal, "center"); }
      FB.label(ctx, 60, FB.D * .4, FC, "아메리카", 40, -40, "#d9f7c8", BX);
      FB.label(ctx, FB.L - 40, FB.D * .5, FC, "아프리카", 30, -20, "#f4e6c4", BX);
      FB.label(ctx, 210, 10, FO, "대서양 중앙 해령", 40, -46, "#ffc49a", BX);
      K.bigText(ctx, ft === 0 ? "지금" : ft.toLocaleString() + "만 년 뒤", 18, 46, 26, "#ffffff");
      K.bigText(ctx, "대서양 +" + Math.round(atl).toLocaleString() + " km", 18, 76, 17, okF ? "#8ff0c4" : "#ffd35a");
      K.warn(ctx, 16, H - 14, "⚠ 대륙 크기·바다 폭은 실제 비율이 아님");
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, LWf + 10, W, H, "지금 속력이 그대로 이어진다면"), maxKm = 8.5 * 10000 / 10, COL = [LT.teal, LT.blue, LT.violet];
      for (i = 0; i < M.length; i++) {
        var y = 60 + i * 62, dd = km(M[i].v);
        lt(ctx, M[i].n, cd.px, y, { s: 11.5, w: "800", c: LT.mute });
        lt(ctx, M[i].v.toFixed(1) + " cm/년", cd.px, y + 18, { s: 11, c: LT.dim });
        lt(ctx, Math.round(dd).toLocaleString() + " km", cd.R, y + 18, { s: 15, w: "900", a: "right", c: COL[i] });
        K.bar(ctx, cd.px, y + 26, cd.w, dd / maxKm, COL[i]);
      }
      K.tip(ctx, okF ? "대서양 +1,000 km — 2.5 cm × " + ft.toLocaleString() + "만 년" : "대서양이 1,000 km 넓어지는 때 찾기", cd.px - 4, 252, cd.w + 8, okF ? true : null);
      lWrap(ctx, "해마다 몇 cm가 쌓여 대륙의 배치를 바꿉니다.", cd.px, 308, cd.w, 15);
    }
    function info() {
      var atl = km(2.5);
      $("c-future-info").innerHTML = "<b>" + ft.toLocaleString() + "만 년</b> 뒤 — 대서양은 <b>" + Math.round(atl).toLocaleString() + " km</b> 더 넓어지고, 태평양판은 일본 해구로 <b>" + Math.round(km(8.5)).toLocaleString() + " km</b> 가라앉으며, 인도판은 <b>" + Math.round(km(5.0)).toLocaleString() + " km</b> 북쪽으로 밀고 올라갑니다. " +
        "해마다 몇 cm가 쌓여 대륙의 배치를 바꿉니다. 판의 운동은 지권에서 끝나지 않고, 바다의 모양과 대기의 흐름, 생물의 서식지까지 바꿉니다.";
    }
    function check() {
      if (Math.abs(km(2.5) - 1000) <= 50 && !got4.b) { got4.b = true; window.sthState("driftGot", got4); mission4(); }
    }
    canvas._redraw = draw;
    $("c-ft").addEventListener("input", function (e) { stop(); ft = +e.target.value; $("c-ft-val").textContent = ft.toLocaleString() + "만 년"; draw(); info(); check(); });
    /* ▶ 시간 흐르게 하기 — 슬라이더를 저절로 밀어 판이 쌓아 가는 거리를 보여 준다. 대서양이 1,000 km 넓어지는 때에 잠깐 멈춘다 */
    var timer = null, playBtn = $("c-ft-play");
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } if (playBtn) playBtn.textContent = "▶ 시간 흐르게 하기"; }
    if (playBtn) playBtn.addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (ft >= 10000) ft = 0;
      playBtn.textContent = "⏸ 멈추기";
      var paused = 0;
      timer = window.setInterval(function () {
        if (paused > 0) { paused--; return; }
        ft = Math.min(10000, ft + 100);
        $("c-ft").value = ft; $("c-ft-val").textContent = ft.toLocaleString() + "만 년";
        draw(); info(); check();
        if (ft === 4000) paused = 25;                        /* 대서양 +1,000 km — 잠깐 멈춰 보여 준다 */
        if (ft >= 10000) stop();
      }, 60);
    });
    window.sthPick({
      mount: "s3-q2",
      q: "2016년 <b>경주 지진(규모 5.8)</b>은 판 경계에서 수백 km 넘게 떨어진 곳에서 일어났습니다. 어떻게 설명할 수 있을까요?",
      options: ["판 내부에도 예전에 만들어진 단층이 있어, 판이 밀리며 쌓인 힘이 그 단층을 움직였다", "우리나라 아래에 새로운 판 경계가 만들어졌다", "판 내부에서는 지진이 일어날 수 없으므로 관측이 잘못된 것이다", "백두산의 화산 활동이 일으킨 지진이다"],
      answer: 0,
      why: ["판은 완전히 단단한 한 덩어리가 아니라, 오래전에 만들어진 <b>단층</b>들을 품고 있습니다. 판이 서로 밀며 쌓인 힘이 그 단층을 다시 움직이면 판 내부에서도 지진이 일어납니다. 우리나라는 변동대에서 벗어나 있어 드물지만, <b>안전지대는 아닙니다.</b>",
        "판 경계는 수천만 년 규모로 움직입니다. 경주 지진 하나로 새 경계가 생긴 것이 아닙니다.",
        "지진계 여러 대가 함께 기록했고, 포항 지진도 뒤따랐습니다. 판 내부 지진은 세계 곳곳에서 관측됩니다.",
        "경주와 백두산은 멀리 떨어져 있고, 경주 지진은 화산이 아니라 <b>단층 운동</b>으로 일어났습니다."],
      onDone: function () { got4.c = true; window.sthState("driftGot", got4); mission4(); }
    });
    draw(); info(); mission4();
  })();

  /* 장면 5 — 결말 --------------------------------------------------------- */
  function reveal() {
    $("e3-wrap").hidden = false;
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 증거는 충분했지만 <b>원동력</b>이 빠져 있었습니다. 베게너가 지질학자가 아니라 기상학자였던 것도 불신을 키웠습니다."
        : "답은 ㉡ 입니다. 화석도 빙하 자국도 진짜였습니다. 빠진 것은 대륙을 움직이는 <b>힘</b>이었고, 그 답인 맨틀 대류와 해저 확장은 30년 뒤에야 나왔습니다.") +
      "<br><b>내가 잰 태평양판의 속력</b> " + (window.sthState("vpFit") || "-") + " · <b>내가 좁힌 변동대</b> " + (window.sthState("ringR") || "-");
  }
  function finish() {
    window.sthState("r3", "해결 · 판을 움직이는 것은 맨틀 대류, 하와이로 잰 태평양판 속력 " + (window.sthState("vpFit") || "-"));
  }
  window.sthOrder({
    mount: "s3-order",
    steps: [
      "1912년 — 베게너가 대륙 이동설을 내놓지만, 대륙을 움직이는 힘을 설명하지 못해 받아들여지지 않는다",
      "1920~30년대 — 홈스가 맨틀의 대류를 대륙을 움직이는 원동력으로 제안한다",
      "1950~60년대 — 음향 측심으로 해령과 해구 같은 해저 지형이 드러난다",
      "1962년 — 헤스 등이 해저 확장설을 내놓고, 해령을 축으로 대칭인 고지자기 줄무늬가 이를 뒷받침한다",
      "1960년대 후반 — 지구의 겉껍질을 여러 장의 판으로 보는 판구조론이 자리를 잡는다"
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅲ-1] 이야기 ③ 갈라지는 땅",
    items: [
      { id: "e3a", label: "세 경계, 세 가지 결과", hint: "발산·수렴·보존 경계에서 각각 어떤 지형과 어떤 단층이 만들어지는지 한 줄씩 쓰세요.", ph: "발산형: … / 수렴형: … / 보존형: …" },
      { id: "e3b", label: "지권의 변화가 다른 권역에 미치는 영향", hint: "화산 분출이나 큰 지진이 기권·수권·생물권에 어떤 영향을 주는지, 이 단원에서 본 사례를 하나 들어 설명하세요.", ph: "" }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅲ-1] 지구시스템 — 정리",
  recap: [
    { key: "r1", label: "① 모래 한 알의 여행" },
    { key: "r2", label: "② 세 개의 난로" },
    { key: "r3", label: "③ 갈라지는 땅" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "모래 한 알, 난로 세 대, 갈라지는 땅. 세 이야기에 공통으로 들어 있는 생각을 ‘에너지’와 ‘상호 작용’이라는 말을 넣어 한 문장으로 쓰세요.", ph: "" },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다.", ph: "" }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-3-1", unitLabel: "[통합과학1 Ⅲ-1] 지구시스템",
  rows: [
    { key: "r1", label: "① 모래 한 알의 여행" },
    { key: "r2", label: "② 세 개의 난로" },
    { key: "r3", label: "③ 갈라지는 땅" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
