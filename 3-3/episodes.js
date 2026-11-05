/* 통합과학1 Ⅲ-3 생명 시스템 — 소단원별 이야기 세 편
   01 익지 않는 김치 / 02 빠진 살은 어디로 갔을까 / 03 한 글자가 바뀌면
   공용 부품: ../assets/theme.js (sthUnit·sthState·sthGate·sthWork·setupCanvas·cssVar·drawArrow),
              ../assets/story.js (sthStory·sthMission·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is1-3-3");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
var R = 8.314;                                   // 기체 상수 J/(mol·K)
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KS = K.C, REDUCE = K.REDUCE;
/* 캔버스마다 무대 종류와 별 씨앗 */
var STAGE = {
  "c-rate": ["lab", 3], "c-ea": ["lab", 5], "c-wash": ["night", 7],
  "c-resp": ["night", 21], "c-anab": ["night", 23], "c-flow": ["night", 25], "c-bmr": ["lab", 27],
  "c-express": ["night", 31], "c-mut": ["night", 33], "c-scale": ["night", 35]
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
/* 표 한 줄 그리기 */
function row(ctx, x, y, w, label, val, tone) {
  glass(ctx, x, y - 18, w, 27, tone || "#8fa6ff", 9);
  text(ctx, label, x + 12, y, { s: 11.5, c: v("--mist") });
  text(ctx, val, x + w - 12, y + 1, { s: 12.5, w: "800", a: "right", c: tone ? v(tone + "-700") : v("--ink") });
}
var SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
function sup(n) {
  var s = String(n), out = "";
  for (var i = 0; i < s.length; i++) out += SUP[+s.charAt(i)] || s.charAt(i);
  return out;
}
function sci(x) {
  if (!isFinite(x)) return "무한대";
  if (x < 1) return x.toFixed(3);
  if (x < 10000) return x < 10 ? x.toFixed(2) : Math.round(x).toLocaleString();
  var e = Math.floor(Math.log(x) / Math.LN10), m = x / Math.pow(10, e);
  return m.toFixed(1) + " × 10" + sup(e);
}
/* setTimeout 기반 애니메이션. 새로 부르면 앞의 것이 저절로 멈춘다(버튼을 잠그지 않는다). */
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
function segWire(id, attr, fn) {
  var bs = Array.prototype.slice.call(document.querySelectorAll("#" + id + " button"));
  bs.forEach(function (b) {
    b.addEventListener("click", function () {
      bs.forEach(function (x) { x.classList.toggle("on", x === b); });
      fn(b.getAttribute(attr));
    });
  });
}

/* ---- 밝은 스튜디오 + 입체 미니어처 (STUDIO_GUIDE) ---- */
var LT = K.LT;
function lt(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
/* 밝은 바탕 이름표(흰 알약) */
function lp(ctx, s, x, y, o) { o = o || {}; return K.pill(ctx, s, x, y, { a: o.a, s: o.s || 12, w: o.w || "800", c: o.c || LT.ink, bg: o.bg || "rgba(255,255,255,.92)", line: o.line || "rgba(20,40,90,.18)", box: o.box }); }
/* 바닥 그림자 */
function shadowE(ctx, x, y, rx, ry, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  var g = ctx.createRadialGradient(0, 0, 1, 0, 0, rx); g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
/* 지시선 이름표: 점(px,py) → 글(qx,qy) */
function callout(ctx, s, px, py, qx, qy, c, box) {
  ctx.strokeStyle = "rgba(20,25,40,.7)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
  ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 6.283); ctx.fill();
  return K.pill(ctx, s, qx + (qx < px ? -4 : 4), qy + 4, { s: 12, a: qx < px ? "right" : "left", c: c || "#e8ecff", box: box });
}
/* 입체 공(밝은 바탕) · 결합 막대 */
function atom(ctx, x, y, r, c, sh) { var b = col(c); if (sh !== false) shadowE(ctx, x + r * .25, y + r * 1.15, r * 1.05, r * .32, .16); K.planet(ctx, x, y, r, b, shade(b, .42)); }
function bond(ctx, x1, y1, x2, y2, w) {
  ctx.lineCap = "round"; ctx.strokeStyle = "#7d8798"; ctx.lineWidth = w || 3.2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.65)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y1 - 1); ctx.lineTo(x2, y2 - 1); ctx.stroke(); ctx.lineCap = "butt";
}
var ATOM = { C: "#5b6272", O: "#ff4d3d", H: "#f4f6fa", N: "#4c7dff" };
/* 효소(단백질) 입체 덩어리 — 공을 뭉친 접힌 모양에 기질이 들어갈 홈(오른쪽 위). unf 0~1 = 풀린 정도(변성) */
var BLOB = (function () {
  var r = K.rng(808), a = [], i = 0;
  while (a.length < 26 && i < 999) {
    i++; var th = r() * 6.2832, rho = Math.sqrt(r()) * .82;
    var dth = Math.atan2(Math.sin(th + 0.7), Math.cos(th + 0.7));
    if (Math.abs(dth) < 0.55 && rho > 0.3) continue;            /* 홈 자리는 비워 둔다 */
    a.push({ x: Math.cos(th) * rho, y: Math.sin(th) * rho * .86, s: .26 + r() * .12 });
  }
  a.sort(function (p, q) { return Math.atan2(p.y, p.x) - Math.atan2(q.y, q.x); });
  return a;
})();
function enzymeBlob(ctx, x, y, r, c, unf, wob) {
  unf = clamp(unf || 0, 0, 1); wob = wob || 0;
  var n = BLOB.length, pts = [], i;
  for (i = 0; i < n; i++) {
    var b = BLOB[i], ux = -1.7 + 3.4 * i / (n - 1), uy = Math.sin(i * 1.3) * .28;
    var fx = b.x + Math.sin(wob + i) * .03, fy = b.y + Math.cos(wob * 1.3 + i) * .03;
    pts.push({ x: x + r * lerpN(fx, ux, unf), y: y + r * lerpN(fy, uy, unf), s: b.s * r * (1 - unf * .35) });
  }
  shadowE(ctx, x, y + r * (1.05 - unf * .55), r * (1.1 + unf * .8), r * .26, .22);
  if (unf > .15) {
    ctx.strokeStyle = rgba(c, .85); ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.beginPath();
    pts.forEach(function (p, k) { if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke();
  }
  pts.slice().sort(function (p, q) { return p.y - q.y; }).forEach(function (p) { var b = col(c); K.planet(ctx, p.x, p.y, p.s, b, shade(b, .45)); });
}
function lerpN(a, b, t) { return a + (b - a) * t; }
/* 밝은 그래프 곡선: 아래를 옅게 채우고, 지금 값에 점과 값 이름표 */
function lcurve(ctx, g, fn, x0, x1, colr, cur, label) {
  var pts = [], i, xv;
  for (i = 0; i <= 120; i++) { xv = x0 + (x1 - x0) * i / 120; pts.push([xv, fn(xv)]); }
  var ag = ctx.createLinearGradient(0, g.T, 0, g.B); ag.addColorStop(0, rgba(colr, .30)); ag.addColorStop(1, rgba(colr, .03));
  ctx.beginPath(); pts.forEach(function (p, k) { if (k) ctx.lineTo(g.X(p[0]), g.Y(p[1])); else ctx.moveTo(g.X(p[0]), g.Y(p[1])); });
  ctx.lineTo(g.R, g.B); ctx.lineTo(g.L, g.B); ctx.closePath(); ctx.fillStyle = ag; ctx.fill();
  K.plot(ctx, g, pts, colr, { light: true, w: 2.6 });
  if (cur != null) {
    var cx = g.X(cur), cy = g.Y(fn(cur));
    K.line(ctx, { x: cx, y: cy }, { x: cx, y: g.B }, "rgba(20,40,90,.45)", 1.2, [3, 3]);
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 6.2832); ctx.fill();
    ctx.fillStyle = LT.red; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 6.2832); ctx.fill();
    if (label) lp(ctx, label, cx, Math.max(g.T + 14, cy - 10), { s: 11.5, a: "center", c: LT.red, box: [g.L, g.R + 10] });
  }
}

/* =========================================================================
   이야기 ① 익지 않는 김치
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 (기존 저장 키 enzyme를 그대로 쓴다) */
  window.sthGate({
    gate: "g1", key: "enzyme", title: "조사관의 첫 추리",
    question: "과산화 수소에 카탈레이스(효소)를 <b>넣지 않으면</b> 어떻게 될까요?",
    options: ["㉠ 전혀 분해되지 않는다", "㉡ 아주 느리게 분해된다", "㉢ 오히려 더 빨리 분해된다", "㉣ 다른 물질로 바뀐다"],
    onPick: function (i) {
      window.sthState("enzymeOK", i === 1 ? "맞음" : "어긋남");
      ep.clear(0);
    }
  });

  /* 장면 2 — 온도·pH 다이얼 --------------------------------------------- */
  (function () {
    var canvas = $("c-rate"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var BASE = 0.6;                       // 최적 조건에서 잘 익는 데 걸리는 날 수
    var jar = "fresh", T = 20, pH = 6.5, rT = 0, rPlay = !REDUCE;
    var got = window.sthState("rateGot") || { a: false, b: false, c: false };

    function tAct(t) { return Math.exp(-(t - 30) * (t - 30) / (2 * 12 * 12)); }
    function pAct(p) { return Math.exp(-(p - 5.5) * (p - 5.5) / (2 * 1.2 * 1.2)); }
    function surv() { return jar === "boiled" ? 0 : 1; }
    function daysText(d) {
      if (!isFinite(d) || d > 3650) return "익지 않음";
      if (d >= 365) return "약 " + (d / 365).toFixed(1) + "년";
      if (d >= 30) return "약 " + (d / 30).toFixed(1) + "달 (" + Math.round(d) + "일)";
      return d.toFixed(1) + "일";
    }

    /* 김치통 입체 미니어처: 유리 밀폐 용기 + 붉은 김치 + 국물 속 기포 */
    function jarModel(cx, by, wJ, hJ, f, boiled, lab) {
      var x0 = cx - wJ / 2, y0 = by - hJ, i;
      shadowE(ctx, cx + 10, by + 4, wJ * .72, 13, .3);
      /* 뒷벽(유리) */
      var gb = ctx.createLinearGradient(x0, 0, x0 + wJ, 0); gb.addColorStop(0, "rgba(210,225,240,.55)"); gb.addColorStop(.5, "rgba(245,250,255,.35)"); gb.addColorStop(1, "rgba(190,205,225,.6)");
      ctx.fillStyle = gb; ctx.beginPath(); ctx.roundRect(x0, y0, wJ, hJ, 14); ctx.fill();
      /* 김치와 국물 */
      var ky = y0 + hJ * .26, kg = ctx.createLinearGradient(0, ky, 0, by);
      kg.addColorStop(0, boiled ? "#b8562f" : "#e0452c"); kg.addColorStop(1, boiled ? "#6e2a18" : "#9c1f14");
      ctx.fillStyle = kg; ctx.beginPath(); ctx.roundRect(x0 + 5, ky, wJ - 10, by - ky - 5, [4, 4, 11, 11]); ctx.fill();
      /* 배춧잎 줄기(흰 줄) */
      var R = K.rng(boiled ? 17 : 13);
      ctx.strokeStyle = boiled ? "rgba(240,220,190,.55)" : "rgba(255,240,215,.75)"; ctx.lineWidth = 3; ctx.lineCap = "round";
      for (i = 0; i < 7; i++) { var lx = x0 + 14 + R() * (wJ - 28), ly = ky + 12 + R() * (by - ky - 30); ctx.beginPath(); ctx.moveTo(lx - 12, ly + 6); ctx.quadraticCurveTo(lx, ly - 6, lx + 14, ly + 2); ctx.stroke(); }
      ctx.lineCap = "butt";
      ctx.fillStyle = "rgba(60,120,40,.7)"; for (i = 0; i < 10; i++) { ctx.fillRect(x0 + 10 + R() * (wJ - 20), ky + 6 + R() * (by - ky - 20), 5, 1.6); }
      /* 기포: 효소가 일할수록 많이, 빨리 오른다 */
      var nb = Math.round(f * 14);
      for (i = 0; i < nb; i++) {
        var u = ((rT / (1500 - 700 * f)) + i / Math.max(nb, 1)) % 1, bx = x0 + 14 + ((i * 37) % (wJ - 28)), byy = by - 10 - u * (by - ky - 6);
        ctx.strokeStyle = "rgba(255,245,235," + (0.9 - u * .5).toFixed(2) + ")"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(bx + Math.sin(u * 7 + i) * 3, byy, 1.6 + (i % 3) * .9, 0, 6.2832); ctx.stroke();
      }
      /* 앞 유리 반사 */
      var gl = ctx.createLinearGradient(x0, 0, x0 + wJ, 0); gl.addColorStop(0, "rgba(255,255,255,.45)"); gl.addColorStop(.18, "rgba(255,255,255,.05)"); gl.addColorStop(.8, "rgba(255,255,255,0)"); gl.addColorStop(1, "rgba(255,255,255,.3)");
      ctx.fillStyle = gl; ctx.beginPath(); ctx.roundRect(x0, y0, wJ, hJ, 14); ctx.fill();
      ctx.strokeStyle = "rgba(90,110,140,.55)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(x0, y0, wJ, hJ, 14); ctx.stroke();
      /* 뚜껑: 기체가 차면 살짝 부푼다 */
      var bulge = 3 + f * 9, lg = ctx.createLinearGradient(0, y0 - 16, 0, y0 + 4); lg.addColorStop(0, "#dfe7f1"); lg.addColorStop(1, "#8e9bb0");
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x0 - 5, y0 + 4); ctx.lineTo(x0 - 5, y0 - 4); ctx.quadraticCurveTo(cx, y0 - 4 - bulge * 2, x0 + wJ + 5, y0 - 4); ctx.lineTo(x0 + wJ + 5, y0 + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#6c7a90"; ctx.fillRect(x0 + 6, y0 - 1, 10, 9); ctx.fillRect(x0 + wJ - 16, y0 - 1, 10, 9);
      lp(ctx, lab, cx, by + 26, { s: 12, a: "center", c: boiled ? LT.red : LT.ink, box: [0, 596] });
    }
    /* 온도계 */
    function thermo(x, by, hh, t) {
      shadowE(ctx, x + 4, by + 3, 14, 4, .25);
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.roundRect(x - 7, by - hh, 14, hh, 7); ctx.fill();
      ctx.strokeStyle = "rgba(60,80,110,.55)"; ctx.lineWidth = 1.2; ctx.stroke();
      var f = clamp((t + 10) / 90, 0, 1), top = by - 14 - f * (hh - 26);
      ctx.fillStyle = "#e03131"; ctx.fillRect(x - 2.2, top, 4.4, by - 10 - top);
      K.planet(ctx, x, by - 8, 7, "#ff6b6b", "#a51111");
      lp(ctx, t + " °C", x, by - hh - 8, { s: 11.5, a: "center", c: LT.red, box: [0, 596] });
    }
    /* pH 시험지 */
    function phStrip(x, by, p) {
      var hue = clamp((p - 2) / 7, 0, 1), c1 = "hsl(" + Math.round(hue * 120) + ",75%,52%)";
      ctx.save(); ctx.translate(x, by); ctx.rotate(-.08);
      ctx.fillStyle = "rgba(20,30,50,.14)"; ctx.fillRect(3, 3, 16, 60);
      ctx.fillStyle = "#f7f3e8"; ctx.fillRect(0, 0, 16, 60);
      ctx.fillStyle = c1; ctx.fillRect(2, 4, 12, 18);
      ctx.restore();
      lp(ctx, "pH " + p.toFixed(1), x + 8, by + 82, { s: 11.5, a: "center", c: LT.teal, box: [0, 596] });
    }
    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var ta = tAct(T), pa = pAct(pH), rate = ta * pa * surv();
      var d = rate <= 1e-6 ? Infinity : BASE / rate;
      var freshRate = ta * pa, freshD = freshRate <= 1e-6 ? Infinity : BASE / freshRate;
      var LW = 596, boiled = jar === "boiled";
      K.studio(ctx, 0, 0, LW, H, { x: 455, y: 392, rx: 150, ry: 26 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 왼쪽: 효소 자체의 성질(밝은 그래프 두 장) */
      var g1 = K.chart(ctx, { x: 6, y: 94, w: 300, h: 164, pl: 44, pb: 30, pt: 12, pr: 12, x0: -10, x1: 80, y0: 0, y1: 1, xt: 9, yt: 2, light: true,
        xl: "보관 온도 (°C)", yf: function (q) { return Math.round(q * 100) + "%"; } });
      K.line(ctx, { x: g1.L, y: g1.Y(.95) }, { x: g1.R, y: g1.Y(.95) }, LT.yellow, 1.4, [6, 5]);
      lcurve(ctx, g1, tAct, -10, 80, LT.teal, T, "온도 활성 " + (ta * 100).toFixed(0) + "%");
      var g2 = K.chart(ctx, { x: 6, y: 270, w: 300, h: 164, pl: 44, pb: 30, pt: 12, pr: 12, x0: 2, x1: 9, y0: 0, y1: 1, xt: 7, yt: 2, light: true,
        xl: "김치 국물의 pH", yf: function (q) { return Math.round(q * 100) + "%"; } });
      K.line(ctx, { x: g2.L, y: g2.Y(.95) }, { x: g2.R, y: g2.Y(.95) }, LT.yellow, 1.4, [6, 5]);
      lcurve(ctx, g2, pAct, 2, 9, LT.violet, pH, "pH 활성 " + (pa * 100).toFixed(0) + "%");
      /* 오른쪽: 김치통 미니어처 + 그 속에서 일하는 효소 */
      var unf = boiled ? 1 : clamp((T - 48) / 32, 0, .75);
      jarModel(400, 372, 112, 150, rate, boiled, boiled ? "통 ㉰ · 끓는 국물을 맞음" : "통 ㉮ · 데운 적 없음");
      thermo(486, 372, 128, T);
      phStrip(512, 300, pH);
      /* 효소 확대(지시선) */
      var ex = 430, ey = 122;
      ctx.strokeStyle = "rgba(20,40,90,.35)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(400, 250); ctx.lineTo(ex - 30, ey + 46); ctx.stroke(); ctx.setLineDash([]);
      var rg = ctx.createRadialGradient(ex, ey, 10, ex, ey, 92); rg.addColorStop(0, "rgba(255,255,255,.95)"); rg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(ex, ey, 92, 0, 6.2832); ctx.fill();
      enzymeBlob(ctx, ex, ey, 46, "#7c9cf5", unf, rT / 600);
      /* 기질(당)이 홈에 들어갔다 나온다 */
      var su = (rT / 1600) % 1, inPocket = rate > 0.02 && unf < .5;
      var px = ex + 46 * .56, py = ey - 46 * .48;
      if (inPocket) {
        var away = su < .5 ? 0 : (su - .5) * 2;
        K.planet(ctx, px + away * 50, py - away * 26, 9, "#ffd35a", "#b7791f");
        if (away > 0) K.planet(ctx, px + away * 40 + 10, py + away * 18, 6, "#ffa94d", "#b8560f");
      } else K.planet(ctx, ex + 70, ey - 52, 9, "#ffd35a", "#b7791f");
      lp(ctx, unf >= .5 ? "변성된 효소 — 홈이 사라짐" : "유산균의 효소 (단백질)", ex - 20, ey + 72, { s: 11.5, a: "center", c: unf >= .5 ? LT.red : LT.blue, box: [318, LW] });
      lp(ctx, inPocket ? "당 → 젖산" : "기질이 못 들어감", Math.min(px + 56, 560), py - 34, { s: 11, a: "center", c: inPocket ? LT.orange : LT.mute, box: [318, LW] });
      ctx.restore();
      K.bigText(ctx, "종합 속도 " + (rate * 100).toFixed(rate < .1 ? 1 : 0) + " %", 18, 48, 27, boiled ? "#ffb0b0" : (rate >= .9 ? "#8ff0c8" : "#ffffff"));
      K.bigText(ctx, boiled ? "변성된 효소는 되돌아오지 않는다" : "다 익는 데 " + daysText(d), 18, 78, 16, "#ffd35a");
      /* 판정 카드 */
      var RX = LW + 10, px0 = RX + 18, px1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "판정");
      K.t(ctx, boiled ? "익지 않음 (변성)" : (d <= 3 ? "빠르게 익는 중" : (d <= 30 ? "천천히 익는 중" : "아주 느리게 익는 중")), px0, 62, { s: 20, w: "900", c: boiled ? LT.red : (d <= 3 ? LT.green : LT.blue) });
      K.row(ctx, "온도 활성", (ta * 100).toFixed(0) + " %", px0, px1, 100, ta >= .95 ? LT.green : LT.ink);
      K.row(ctx, "pH 활성", (pa * 100).toFixed(0) + " %", px0, px1, 128, pa >= .95 ? LT.green : LT.ink);
      K.row(ctx, "효소가 살아 있는 정도", boiled ? "0 %" : "100 %", px0, px1, 156, boiled ? LT.red : LT.ink);
      K.row(ctx, "종합 반응 속도", (rate * 100).toFixed(1) + " %", px0, px1, 184);
      K.row(ctx, "다 익는 시간", daysText(d), px0, px1, 212, isFinite(d) && d <= 7 ? LT.green : LT.red);
      K.t(ctx, "같은 온도·pH에서 두 통을 나란히", px0, 248, { s: 11.5, w: "800", c: LT.mute });
      K.t(ctx, "통 ㉮", px0, 274, { s: 11.5, w: "800", c: LT.ink }); K.t(ctx, (freshRate * 100).toFixed(1) + " %", px1, 274, { s: 11.5, w: "900", a: "right", c: LT.teal });
      K.bar(ctx, px0, 282, px1 - px0, freshRate, LT.teal);
      K.t(ctx, "통 ㉰", px0, 314, { s: 11.5, w: "800", c: LT.ink }); K.t(ctx, "0.0 %", px1, 314, { s: 11.5, w: "900", a: "right", c: LT.red });
      K.bar(ctx, px0, 322, px1 - px0, 0, LT.red);
      K.tip(ctx, boiled ? "다이얼을 맞춰도 0 % — 되돌릴 수 없음" : (ta >= .95 && pa >= .95 ? "최적 온도·최적 pH에 가깝습니다" : "다이얼을 하나씩 돌려 보세요"), px0 - 4, 346, px1 - px0 + 8, boiled ? false : (ta >= .95 && pa >= .95 ? true : null));
      K.t(ctx, "곡선은 효소 자체의 성질이고, 실제 속도는", px0, 404, { s: 10.5, c: LT.mute });
      K.t(ctx, "여기에 효소가 살아 있는 정도를 곱한 값", px0, 421, { s: 10.5, c: LT.mute });

      if (quiet === true) return;
      $("a-rate-info").innerHTML = "<b>" + (jar === "fresh" ? "통 ㉮" : "통 ㉰") + "</b> · 온도 <b>" + T + " °C</b>, pH <b>" + pH.toFixed(1) + "</b> → 온도 활성 " + (ta * 100).toFixed(0) + " %, pH 활성 " + (pa * 100).toFixed(0) + " %, 종합 속도 <b>" + (rate * 100).toFixed(1) + " %</b>. " +
        (jar === "boiled"
          ? "이 통의 효소는 이미 <b>변성</b>되어 활성이 0입니다. 온도와 pH를 아무리 잘 맞춰도 김치는 익지 않습니다."
          : (d <= 3 ? "🎉 효소가 아주 잘 일하고 있습니다. <b>" + daysText(d) + "</b> 만에 시어집니다."
            : (d <= 30 ? "천천히 익고 있습니다. 다 익는 데 <b>" + daysText(d) + "</b> 걸립니다."
              : "거의 멈춘 것처럼 보이지만 <b>익고 있습니다.</b> 다만 <b>" + daysText(d) + "</b>이 걸릴 뿐입니다."))) +
        (isFinite(freshD) && T <= 0 && jar === "fresh" ? " — 김치냉장고가 하는 일이 바로 이것입니다." : "");
      check(ta, pa);
    }
    function check(ta, pa) {
      var ch = false;
      if (ta >= 0.95 && !got.a) { got.a = true; ch = true; }
      if (pa >= 0.95 && !got.b) { got.b = true; ch = true; }
      if (jar === "boiled" && ta >= 0.80 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("rateGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.c) done("m1-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>이 효소의 최적 조건은 <b>30 °C · pH 5.5</b> 였습니다. 그리고 한 번 끓는 국물을 맞은 통 ㉰ 는 <b>되돌릴 수 없습니다.</b>");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    playBtn("a-rate-play", "⏸ 거품 멈추기", "▶ 거품 보기", function () { return rPlay; }, function (q) { rPlay = q; });
    K.animate(canvas, function (dt) { if (rPlay) { rT += dt; draw(true); } });
    segWire("a-jar", "data-j", function (x) { jar = x; draw(); });
    $("a-t").addEventListener("input", function (e) { T = +e.target.value; $("a-t-val").textContent = T; draw(); });
    $("a-ph").addEventListener("input", function (e) { pH = +e.target.value; $("a-ph-val").textContent = pH.toFixed(1); draw(); });
    draw(); mission();
  })();

  /* 장면 3 — 활성화 에너지 ----------------------------------------------- */
  (function () {
    var canvas = $("c-ea"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var EA0 = 75, T0 = 298.15;
    var ea = 75, temp = 25, eT = 0, ePlay = !REDUCE;
    var got = window.sthState("eaGot") || { a: false, b: false, c: false };

    function ratioEnz() { return Math.exp((EA0 - ea) * 1000 / (R * (temp + 273.15))); }
    function ratioTemp() { return Math.exp(EA0 * 1000 / R * (1 / T0 - 1 / (temp + 273.15))); }

    function pathPt(E, u) {                              /* 반응 경로 위의 점 (u: 0~1) → [경로, 에너지] */
      if (u < .2) return [u, 0];
      if (u > .8) return [u, -15];
      var t = (u - .2) / .6, ctrl = 2 * E + 7.5, q = 1 - t;
      return [.2 + .6 * t, 2 * q * t * ctrl + t * t * -15];
    }
    function h2o2(x, y, s) {                              /* 과산화 수소 H–O–O–H 공 막대 모형 */
      s = s || 1;
      bond(ctx, x - 5 * s, y, x + 5 * s, y, 2.6); bond(ctx, x - 5 * s, y, x - 10 * s, y - 6 * s, 2); bond(ctx, x + 5 * s, y, x + 10 * s, y + 6 * s, 2);
      atom(ctx, x - 10 * s, y - 6 * s, 3.2 * s, ATOM.H, false); atom(ctx, x + 10 * s, y + 6 * s, 3.2 * s, ATOM.H, false);
      atom(ctx, x - 5 * s, y, 5 * s, ATOM.O, false); atom(ctx, x + 5 * s, y, 5 * s, ATOM.O, false);
    }
    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var t = eT / 1000, LW = 596, re = ratioEnz(), rt = ratioTemp();
      K.studio(ctx, 0, 0, LW, H, { x: 512, y: 300, rx: 80, ry: 14 });
      K.bigText(ctx, "효소 × " + sci(re), 18, 46, 27, re >= 1e8 ? "#8ff0c8" : "#ffffff");
      K.bigText(ctx, "온도만 올리면 × " + sci(rt), 18, 74, 16, "#ffd35a");
      var g = K.chart(ctx, { x: 6, y: 90, w: 430, h: 304, pl: 48, pb: 32, pt: 14, pr: 12, x0: 0, x1: 1, y0: -30, y1: 90, xt: 1, yt: 4, light: true,
        xl: "반응 경로 →", yl: "에너지 (kJ/mol)", xf: function () { return ""; } });
      function curvePts(E) { var a = []; for (var i = 0; i <= 100; i++) { var p = pathPt(E, i / 100); a.push(p); } return a; }
      K.plot(ctx, g, curvePts(EA0), LT.red, { light: true, w: 2.4, dash: [7, 5], glow: false });
      var lo = curvePts(ea);
      var ag = ctx.createLinearGradient(0, g.T, 0, g.B); ag.addColorStop(0, "rgba(12,133,153,.22)"); ag.addColorStop(1, "rgba(12,133,153,.02)");
      ctx.beginPath(); lo.forEach(function (p, k) { if (k) ctx.lineTo(g.X(p[0]), g.Y(p[1])); else ctx.moveTo(g.X(p[0]), g.Y(p[1])); });
      ctx.lineTo(g.R, g.B); ctx.lineTo(g.L, g.B); ctx.closePath(); ctx.fillStyle = ag; ctx.fill();
      K.plot(ctx, g, lo, LT.teal, { light: true, w: 3 });
      /* 높이 화살표 */
      K.arrow(ctx, { x: g.X(.1), y: g.Y(0) }, { x: g.X(.1), y: g.Y(EA0) + 2 }, LT.red, 2, 9);
      K.arrow(ctx, { x: g.X(.16), y: g.Y(0) }, { x: g.X(.16), y: g.Y(ea) + 2 }, LT.teal, 2, 9);
      K.line(ctx, { x: g.X(.1), y: g.Y(EA0) }, { x: g.X(.5), y: g.Y(EA0) }, "rgba(224,49,49,.45)", 1, [3, 3]);
      K.line(ctx, { x: g.X(.16), y: g.Y(ea) }, { x: g.X(.5), y: g.Y(ea) }, "rgba(12,133,153,.5)", 1, [3, 3]);
      lp(ctx, "효소 없음 " + EA0 + " kJ/mol", g.X(.5), g.Y(EA0) - 10, { s: 11.5, a: "center", c: LT.red, box: [g.L, g.R] });
      lp(ctx, "효소 있음 " + ea + " kJ/mol", g.X(.6), g.Y(ea) + 18, { s: 11.5, c: LT.teal, box: [g.L, g.R] });
      lp(ctx, "반응물 H₂O₂", g.X(.01), g.Y(0) + 20, { s: 11, c: LT.ink, box: [g.L, g.R] });
      lp(ctx, "생성물 H₂O + O₂", g.R - 2, g.Y(-15) + 20, { s: 11, a: "right", c: LT.ink, box: [g.L, g.R] });
      /* 언덕을 넘는 분자 — 언덕이 낮을수록 더 많이 넘는다 */
      var nOver = clamp(1 + Math.floor(Math.log(Math.max(re, 1)) / Math.LN10 / 2), 1, 7), k;
      for (k = 0; k < nOver; k++) { var pp = pathPt(ea, (t * .22 + k / nOver) % 1); h2o2(g.X(pp[0]), g.Y(pp[1]) - 10, .9); }
      var p0 = pathPt(EA0, (t * .04) % 1); h2o2(g.X(p0[0]), g.Y(p0[1]) - 10, .9);
      /* 오른쪽: 카탈레이스 입체 모형과 산소 거품 */
      var cx = 514, cy = 236;
      enzymeBlob(ctx, cx, cy, 42, "#ff8787", 0, t);
      var nb = ea >= 74 ? 0 : Math.round(clamp(Math.log(Math.max(re, 1)) / Math.LN10, 0, 14) / 14 * 10);
      for (k = 0; k < nb; k++) { var bu = (t * .5 + k / Math.max(nb, 1)) % 1; ctx.strokeStyle = "rgba(28,126,214," + (.85 - bu * .6).toFixed(2) + ")"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx - 26 + (k * 17) % 52, cy - 50 - bu * 70, 3 + (k % 3), 0, 6.2832); ctx.stroke(); }
      lp(ctx, ea >= 74 ? "효소를 아직 넣지 않음" : "카탈레이스 · 산소 거품", cx, 318, { s: 11.5, a: "center", c: ea >= 74 ? LT.mute : LT.red, box: [440, LW] });
      lt(ctx, "출발점·도착점은 그대로,", cx, 344, { s: 10.5, w: "700", a: "center", c: LT.mute });
      lt(ctx, "언덕 높이만 바뀝니다", cx, 361, { s: 10.5, w: "700", a: "center", c: LT.mute });
      /* 판정 카드 */
      var RX = LW + 10, q0 = RX + 18, q1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "속도 비교");
      K.t(ctx, re >= 1e8 ? "1억 배를 넘었다" : (ea >= 74 ? "효소 없음" : "빨라지는 중"), q0, 62, { s: 21, w: "900", c: re >= 1e8 ? LT.green : LT.ink });
      K.row(ctx, "반응 온도", temp + " °C (" + (temp + 273.15).toFixed(1) + " K)", q0, q1, 98);
      K.row(ctx, "효소가 낮춘 만큼", (EA0 - ea) + " kJ/mol", q0, q1, 124);
      K.row(ctx, "효소 쪽 배수", sci(re) + " 배", q0, q1, 150, re >= 1e8 ? LT.green : LT.ink);
      K.row(ctx, "온도 쪽 배수", sci(rt) + " 배", q0, q1, 176, rt >= 10 ? LT.green : LT.ink);
      K.t(ctx, "몇 배나 빨라졌나 (한 칸 = 10배)", q0, 210, { s: 11.5, w: "800", c: LT.mute });
      var lgE = Math.max(0, Math.log(Math.max(re, 1)) / Math.LN10), lgT = Math.max(0, Math.log(Math.max(rt, 1)) / Math.LN10);
      K.t(ctx, "효소", q0, 236, { s: 11.5, w: "800", c: LT.teal }); K.t(ctx, "10" + sup(lgE.toFixed(0)), q1, 236, { s: 12, w: "900", a: "right", c: LT.teal });
      K.bar(ctx, q0, 244, q1 - q0, lgE / 14, LT.teal);
      K.t(ctx, "온도", q0, 276, { s: 11.5, w: "800", c: LT.red }); K.t(ctx, "10" + sup(lgT.toFixed(0)), q1, 276, { s: 12, w: "900", a: "right", c: LT.red });
      K.bar(ctx, q0, 284, q1 - q0, lgT / 14, LT.red);
      K.tip(ctx, re >= 1e8 ? "효소가 온도보다 훨씬 셉니다" : "활성화 에너지를 더 낮춰 보세요", q0 - 4, 306, q1 - q0 + 8, re >= 1e8 ? true : null);
      K.t(ctx, "온도를 올리면 다른 단백질까지 변성되지만,", q0, 362, { s: 10.5, c: LT.mute });
      K.t(ctx, "효소는 체온 그대로 수억 배 빠르게 합니다.", q0, 380, { s: 10.5, c: LT.mute });


      if (quiet === true) return;
      $("a-ea-out").innerHTML = "효소 쪽 <b>" + sci(re) + " 배</b> &nbsp;·&nbsp; 온도 쪽 <b>" + sci(rt) + " 배</b> (25 °C 때와 견줌)";
      $("a-ea-info").innerHTML = "활성화 에너지가 <b>" + EA0 + " → " + ea + " kJ/mol</b>로 낮아지면, " + temp + " °C에서 반응 속도가 <b>" + sci(re) + " 배</b>가 됩니다. " +
        (ea >= 74 ? "아직 효소를 넣지 않은 것과 같습니다. 슬라이더를 왼쪽으로 밀어 보세요."
          : (re >= 1e8 ? "🎉 <b>1억 배</b>를 넘겼습니다. 효소가 없으면 보이지도 않던 반응이 눈앞에서 부글거리게 됩니다."
            : "더 낮춰 보세요. 카탈레이스는 8 kJ/mol까지 낮춥니다.")) +
        " 한편 효소 없이 온도만 " + temp + " °C로 올렸다면 25 °C 때보다 <b>" + sci(rt) + " 배</b> 빨라졌을 뿐입니다.";
      check(re, rt);
    }
    function check(re, rt) {
      var ch = false;
      if (re >= 1e8 && !got.a) { got.a = true; ch = true; }
      if (rt >= 10 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("eaGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-3a");
      if (got.b) done("m1-3b");
      if (got.c) done("m1-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>온도를 25 °C나 올려야 겨우 10배였습니다. 효소는 <b>체온 그대로</b> 두고도 억 단위로 빠르게 합니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    playBtn("a-ea-play", "⏸ 분자 멈추기", "▶ 분자 움직이기", function () { return ePlay; }, function (q) { ePlay = q; });
    K.animate(canvas, function (dt) { if (ePlay) { eT += dt; draw(true); } });
    $("a-ea").addEventListener("input", function (e) { ea = +e.target.value; $("a-ea-val").textContent = ea; draw(); });
    $("a-temp").addEventListener("input", function (e) { temp = +e.target.value; $("a-temp-val").textContent = temp; draw(); });
    window.sthPick({
      mount: "s1-q1",
      q: "효소를 넣었을 때 <b>달라지는 것</b>과 <b>달라지지 않는 것</b>을 바르게 짝지은 것은?",
      options: ["활성화 에너지가 낮아지고, 생성물의 종류도 달라진다", "활성화 에너지가 낮아지지만, 반응물과 생성물의 에너지 차이는 그대로다", "반응물의 에너지가 높아져 반응이 빨라진다", "효소가 반응물과 함께 소모되어 없어진다"],
      answer: 1,
      why: ["효소는 반응의 <b>길</b>을 바꿀 뿐 만들어지는 물질을 바꾸지 않습니다. 과산화 수소는 효소가 있든 없든 물과 산소가 됩니다.",
        "그림에서 두 곡선의 <b>출발점과 도착점은 같고</b> 봉우리 높이만 다릅니다. 효소는 반응을 빠르게 할 뿐, 일어날 수 없는 반응을 일어나게 하지는 못합니다.",
        "효소는 반응물의 에너지를 올리지 않습니다. 언덕을 낮출 뿐입니다.",
        "효소는 반응이 끝나도 <b>그대로 남아</b> 다음 기질에 또 작용합니다. 그래서 아주 적은 양으로도 많은 일을 합니다."],
      onDone: function () { got.c = true; window.sthState("eaGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 세탁기 속의 효소 -------------------------------------------- */
  (function () {
    var canvas = $("c-wash"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var stain = "pro", enz = "none", wt = 30, wT = 0;
    var got = window.sthState("washGot") || { a: false, b: false, c: false };
    var SNAME = { pro: "핏자국 (단백질)", lip: "기름때 (지방)", amy: "눌어붙은 밥풀 (녹말)" };
    var ENAME = { none: "효소가 없는 세제", pro: "단백질 분해 효소 세제", lip: "지방 분해 효소 세제", amy: "녹말 분해 효소 세제" };
    var ESHORT = { none: "없음", pro: "단백질 분해 효소", lip: "지방 분해 효소", amy: "녹말 분해 효소" };

    function match() { return enz === "none" ? 0.25 : (enz === stain ? 1 : 0.12); }
    function act(t) {
      var g = Math.exp(-(t - 40) * (t - 40) / (2 * 12 * 12));
      if (t >= 55) g *= Math.max(0, 1 - (t - 55) / 12);
      return g;
    }
    function removal(t) { return 100 * (1 - Math.exp(-3.0 * match() * act(t))); }

    var WI = K.iso({ ox: 140, oy: 252, s: 0.85, L: 150, D: 120 }), WZ = 170;
    var ECOL = { none: "#adb5bd", pro: "#4dabf7", lip: "#fab005", amy: "#b197fc" };
    /* 기질 모양: 단백질 = 구슬 사슬, 지방 = 머리 하나에 꼬리 셋, 녹말 = 육각 고리 사슬 */
    function substrate(x, y, kind, cut) {
      var i, g = cut || 0;
      if (kind === "pro") { for (i = 0; i < 4; i++) { var xx = x + i * 11 + (i >= 2 ? g * 10 : 0); if (i && !(i === 2 && g > 0)) bond(ctx, xx - 11, y, xx, y, 3); K.planet(ctx, xx, y, 5.5, "#e64980", "#8f1d4a"); } }
      else if (kind === "lip") {
        K.planet(ctx, x, y, 6, "#ffd43b", "#a07800");
        for (i = -1; i <= 1; i++) { ctx.strokeStyle = "#e0a800"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 6 + g * 8, y + i * 7); for (var s2 = 1; s2 <= 5; s2++) ctx.lineTo(x + 6 + g * 8 + s2 * 7, y + i * 7 + (s2 % 2 ? -3 : 3)); ctx.stroke(); }
      } else {
        for (i = 0; i < 3; i++) {
          var hx = x + i * 16 + (i >= 1 ? g * 10 : 0);
          ctx.fillStyle = "#f1e3c2"; ctx.strokeStyle = "#a6895a"; ctx.lineWidth = 1.6; ctx.beginPath();
          for (var k2 = 0; k2 < 6; k2++) { var a = k2 * Math.PI / 3; ctx.lineTo(hx + Math.cos(a) * 7, y + Math.sin(a) * 7); }
          ctx.closePath(); ctx.fill(); ctx.stroke();
        }
      }
    }
    function machine(rm) {
      var I = WI, L = I.L, D = I.D;
      shadowE(ctx, I.P(L, D, 0).x - 10, I.P(L, D, 0).y - 18, 140, 26, .3);
      I.box(ctx, 0, 0, 0, L, D, WZ, "#f1f4f8", "#e3e8ef", "#bcc5d2");
      I.face(ctx, "front", function () {
        /* 조작판 */
        ctx.fillStyle = "#cfd6e0"; ctx.fillRect(0, WZ - 30, L, 30);
        ctx.fillStyle = "#5c6b80"; ctx.beginPath(); ctx.arc(L * .78, WZ - 15, 9, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "#ffd43b"; ctx.save(); ctx.translate(L * .78, WZ - 15); ctx.rotate(-(wt - 10) / 80 * 4.2 + 2.1); ctx.fillRect(-1.2, 0, 2.4, 8); ctx.restore();
        ctx.fillStyle = "#2b8a3e"; ctx.fillRect(L * .14, WZ - 20, 26, 10);
        /* 문(둥근 유리창) */
        var cx = L * .46, cz = 74, r = 50;
        ctx.fillStyle = "#9aa4b6"; ctx.beginPath(); ctx.arc(cx, cz, r + 8, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "#dfe5ee"; ctx.beginPath(); ctx.arc(cx, cz, r + 4, 0, 6.2832); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cz, r, 0, 6.2832); ctx.clip();
        var wg = ctx.createLinearGradient(0, cz - r, 0, cz + r); wg.addColorStop(0, "#a5d8ff"); wg.addColorStop(1, "#4dabf7");
        ctx.fillStyle = wg; ctx.fillRect(cx - r, cz - r, r * 2, r * 2);
        ctx.fillStyle = "#f3ede1"; ctx.beginPath(); ctx.moveTo(cx - 34, cz - 30); ctx.lineTo(cx + 34, cz - 30); ctx.lineTo(cx + 26, cz + 40); ctx.lineTo(cx - 26, cz + 40); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(120,100,70,.18)"; ctx.lineWidth = .8; for (var t = -34; t < 34; t += 4) { ctx.beginPath(); ctx.moveTo(cx + t, cz - 30); ctx.lineTo(cx + t * .8, cz + 40); ctx.stroke(); }
        ctx.globalAlpha = clamp(1 - rm / 100, 0.04, 1);
        var sc2 = stain === "pro" ? "#9a2a3a" : (stain === "lip" ? "#c9a040" : "#d8ccb0");
        ctx.fillStyle = sc2; ctx.beginPath(); ctx.ellipse(cx, cz + 4, 20, 15, .4, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - 14, cz - 18, 7, 5, -.3, 0, 6.2832); ctx.fill();
        ctx.globalAlpha = 1;
        for (var fb = 0; fb < 12; fb++) { var fu = ((wT / 2200) + fb / 12) % 1, fx = cx - 40 + (fb * 29) % 80; ctx.strokeStyle = "rgba(255,255,255," + (.85 - fu * .6).toFixed(2) + ")"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(fx + Math.sin(fu * 8 + fb) * 4, cz - r + 6 + fu * (r * 2 - 12), 2.5 + (fb % 3) * 1.5, 0, 6.2832); ctx.stroke(); }
        var gl = ctx.createLinearGradient(cx - r, cz + r, cx + r, cz - r); gl.addColorStop(0, "rgba(255,255,255,0)"); gl.addColorStop(.55, "rgba(255,255,255,.35)"); gl.addColorStop(.7, "rgba(255,255,255,0)");
        ctx.fillStyle = gl; ctx.fillRect(cx - r, cz - r, r * 2, r * 2);
        ctx.restore();
      });
      I.shade(ctx, "front", function () { return WZ; });
      I.edges(ctx, WZ, WZ);
    }
    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var rm = removal(wt), m = match(), a = act(wt), LW = 596;
      K.studio(ctx, 0, 0, LW, H, { x: 200, y: 352, rx: 190, ry: 24 });
      machine(rm);
      K.bigText(ctx, "얼룩 " + rm.toFixed(0) + " % 지움", 18, 46, 27, rm >= 90 ? "#8ff0c8" : (rm < 30 ? "#ffb0b0" : "#ffffff"));
      K.bigText(ctx, SNAME[stain] + " · " + wt + " °C", 18, 74, 16, "#ffd35a");
      lp(ctx, "30분 세탁 뒤의 앞치마", 165, 100, { s: 11.5, a: "center", c: LT.ink, box: [0, 320] });
      /* 오른쪽 위: 자물쇠와 열쇠 — 효소 입체 모형과 기질 */
      var ex = 438, ey = 150, unf = clamp((wt - 55) / 20, 0, 1), dock = m === 1 && unf < .5, su = (wT / 1800) % 1;
      var rg = ctx.createRadialGradient(ex, ey, 10, ex, ey, 100); rg.addColorStop(0, "rgba(255,255,255,.95)"); rg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(ex, ey, 100, 0, 6.2832); ctx.fill();
      if (enz !== "none") enzymeBlob(ctx, ex, ey, 40, ECOL[enz], unf, wT / 700);
      else { for (var bb = 0; bb < 6; bb++) { ctx.strokeStyle = "rgba(80,140,220,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ex - 30 + bb * 12, ey + Math.sin(bb) * 14, 6 + (bb % 2) * 3, 0, 6.2832); ctx.stroke(); } }
      if (dock) substrate(ex + 18, ey - 20, stain, Math.max(0, su - .5) * 2);
      else substrate(ex + 52, ey - 58, stain, 0);
      lp(ctx, m === 1 && unf >= .5 ? "🔥 효소가 변성 — 홈이 사라짐" : (dock ? "🔑 열쇠가 자물쇠에 딱 맞음" : (enz === "none" ? "🧼 효소 없이 계면 활성제만" : "🔒 열쇠가 자물쇠에 맞지 않음")),
        ex, 226, { s: 11.5, a: "center", c: dock ? LT.green : (enz === "none" ? LT.mute : LT.red), box: [330, LW] });
      lt(ctx, enz === "none" ? "" : ESHORT[enz] + " (단백질)", ex, ey - 64, { s: 11, w: "800", a: "center", c: LT.mute });
      /* 오른쪽 아래: 온도별 제거율 */
      var g = K.chart(ctx, { x: 326, y: 244, w: 266, h: 132, pl: 40, pb: 30, pt: 10, pr: 12, x0: 10, x1: 90, y0: 0, y1: 100, xt: 4, yt: 2, light: true, xl: "물 온도 (°C)" });
      lcurve(ctx, g, removal, 10, 90, LT.teal, wt, null);
      /* 판정 카드 */
      var RX = LW + 10, p0 = RX + 18, p1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "세탁 시험 결과");
      K.t(ctx, rm >= 90 ? "깨끗이 지워짐" : (rm < 30 ? "거의 그대로" : "덜 지워짐"), p0, 62, { s: 21, w: "900", c: rm >= 90 ? LT.green : (rm < 30 ? LT.red : LT.orange) });
      K.row(ctx, "넣은 세제", ESHORT[enz], p0, p1, 100);
      K.row(ctx, "기질과의 짝", m === 1 ? "딱 맞음" : (enz === "none" ? "해당 없음" : "안 맞음"), p0, p1, 126, m === 1 ? LT.green : LT.ink);
      K.row(ctx, "효소 활성 (온도)", (a * 100).toFixed(0) + " %", p0, p1, 152, a >= 0.77 ? LT.green : (a < 0.1 ? LT.red : LT.ink));
      K.row(ctx, "얼룩 제거율", rm.toFixed(0) + " %", p0, p1, 178, rm >= 90 ? LT.green : (rm < 30 ? LT.red : LT.ink));
      K.bar(ctx, p0, 188, p1 - p0, rm / 100, rm >= 90 ? LT.green : LT.yellow);
      K.tip(ctx, m === 1 && wt >= 75 ? "너무 뜨거워 효소가 변성됨" : (rm >= 90 ? "짝도 맞고 온도도 알맞음" : "짝이 맞는 효소와 온도를 찾기"), p0 - 4, 212, p1 - p0 + 8, rm >= 90 ? true : (m === 1 && wt >= 75 ? false : null));
      K.t(ctx, "물이 뜨겁다고 더 잘 지워지지 않습니다.", p0, 272, { s: 11, w: "800", c: LT.blue });
      K.t(ctx, "55 °C를 넘으면 효소도 변성되어", p0, 294, { s: 11, c: LT.mute });
      K.t(ctx, "일을 멈춥니다 (권장 30~40 °C).", p0, 311, { s: 11, c: LT.mute });
      K.t(ctx, "소화제·연육제·렌즈 세정제도", p0, 338, { s: 11, c: LT.mute });
      K.t(ctx, "기질에 맞는 효소를 골라 넣은 것", p0, 355, { s: 11, c: LT.mute });

      if (quiet === true) return;
      $("a-wash-info").innerHTML = "<b>" + SNAME[stain] + "</b> + <b>" + ENAME[enz] + "</b> · 물 온도 <b>" + wt + " °C</b> → 제거율 <b>" + rm.toFixed(0) + " %</b>. " +
        (m === 1 && rm >= 90 ? "🎉 짝이 맞는 효소를 알맞은 온도에서 쓰면 얼룩이 거의 사라집니다."
          : (m === 1 && wt >= 75 ? "짝은 맞는데 물이 너무 뜨겁습니다. 효소가 <b>변성</b>되어 일을 못 합니다."
            : (m === 1 ? "짝은 맞았습니다. 이제 효소가 가장 잘 일하는 온도를 찾아보세요."
              : (enz === "none" ? "효소 없이 계면 활성제만으로는 한계가 있습니다. 얼룩에 맞는 효소를 넣어 보세요."
                : "이 효소는 이 얼룩에 <b>맞지 않습니다.</b> 효소는 자물쇠와 열쇠처럼 짝이 맞는 기질에만 작용합니다(기질 특이성)."))));
      check(rm);
    }
    function check(rm) {
      var ch = false;
      if (rm >= 90 && !got.a) { got.a = true; ch = true; }
      if (match() === 1 && wt >= 75 && rm < 30 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("washGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-4a");
      if (got.b) done("m1-4b");
      if (got.c) done("m1-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>효소는 <b>짝이 맞는 기질</b>에만, 그것도 <b>알맞은 온도</b>에서만 일합니다. 둘 중 하나만 어긋나도 얼룩은 남습니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    /* 조건을 바꾸면 거품이 잠깐(약 4초) 일었다 가라앉는다 */
    K.animate(canvas, function (dt) { if (!REDUCE && wT < 4400) { wT += dt; draw(true); } });
    segWire("a-stain", "data-s", function (x) { stain = x; wT = 0; draw(); });
    segWire("a-enz", "data-e", function (x) { enz = x; wT = 0; draw(); });
    $("a-wt").addEventListener("input", function (e) { wt = +e.target.value; $("a-wt-val").textContent = wt; wT = 0; draw(); });
    window.sthSort({
      mount: "s1-sort",
      buckets: [
        { id: "p", label: "단백질을 분해하는 효소", sub: "고기 · 핏자국 · 우유" },
        { id: "l", label: "지방을 분해하는 효소", sub: "기름때 · 버터 · 튀김" },
        { id: "c", label: "녹말을 분해하는 효소", sub: "밥 · 빵 · 감자" }
      ],
      items: [
        { t: "🧪 위액 속 펩신", a: "p", why: "펩신은 단백질을 분해하는 소화 효소입니다. 최적 pH가 2 부근이라 강한 산성인 위 속에서 일합니다." },
        { t: "🥩 연육제에 든 파파인(파파야에서 뽑음)", a: "p", why: "고기의 단백질을 끊어 질긴 고기를 부드럽게 만듭니다." },
        { t: "🩸 핏자국 세제에 든 프로테이스", a: "p", why: "핏자국은 단백질이라 단백질 분해 효소가 필요합니다.", hint: "피를 이루는 주된 물질이 무엇일까요?" },
        { t: "🧈 이자액 속 라이페이스", a: "l", why: "라이페이스는 지방을 지방산과 모노글리세리드로 분해합니다." },
        { t: "🍳 기름때 전용 주방 세제 속 효소", a: "l", why: "기름때는 지방이므로 지방 분해 효소가 붙습니다." },
        { t: "🍟 튀김기 기름을 분해하는 배수구 약품", a: "l", why: "굳은 기름을 분해하려면 지방 분해 효소가 필요합니다.", hint: "굳은 기름은 어떤 물질일까요?" },
        { t: "👅 침 속 아밀레이스", a: "c", why: "밥을 오래 씹으면 단맛이 나는 까닭입니다. 녹말이 엿당으로 분해됩니다." },
        { t: "🍚 밥솥에 눌어붙은 밥풀용 세제 효소", a: "c", why: "밥풀의 주된 성분은 녹말입니다." },
        { t: "🍬 물엿을 만들 때 쓰는 엿기름 속 효소", a: "c", why: "엿기름의 아밀레이스가 녹말을 당으로 바꿉니다.", hint: "식혜를 만들 때 무엇이 달아지나요?" }
      ],
      doneText: "효소마다 열 수 있는 자물쇠가 따로 있습니다.",
      onDone: function () { got.c = true; window.sthState("washGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 -------------------------------------------------------- */
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("enzyme") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (window.sthState("enzymeOK") === "맞음"
        ? "정확했습니다. 효소가 없어도 반응은 일어납니다 — 다만 아주 느릴 뿐입니다. 김치냉장고 속 김치와 똑같습니다."
        : "정답은 ㉡ 입니다. 효소는 <b>반응물이 아니라 속도를 바꾸는 것</b>이었습니다. 이 한 문장이 김치냉장고의 비밀이기도 했습니다.");
  }
  function finish() { window.sthState("r1", "해결 · 효소는 활성화 에너지를 낮춰 속도만 바꾼다(최적 30 °C · pH 5.5, 변성은 되돌릴 수 없음)"); }
  window.sthPick({
    mount: "s1-q2",
    q: "김치냉장고를 <b>−2 °C</b>로 맞춰 두면 김치에는 어떤 일이 일어날까요?",
    options: ["유산균의 효소가 죽어 김치가 영영 익지 않는다", "익는 반응이 아주 느려질 뿐, 김치는 계속 익고 있다", "효소가 변성되어 온도를 올려도 돌아오지 않는다", "저온에서는 활성화 에너지가 0이 되어 반응이 멈춘다"],
    answer: 1,
    why: ["낮은 온도는 효소를 <b>죽이지 않습니다.</b> 움직임이 느려져 일하는 속도가 떨어질 뿐, 온도를 올리면 다시 잘 일합니다.",
      "효소는 <b>속도만</b> 바꿉니다. 최적 조건에서 하루면 될 일이 −2 °C 에서는 몇 달로 늘어난 것뿐입니다. 김치냉장고에 오래 둔 김치가 결국 시어지는 까닭입니다.",
      "변성은 <b>높은 온도</b>에서 일어납니다. 통 ㉰ 가 그 경우였습니다. 낮은 온도는 변성이 아닙니다.",
      "활성화 에너지는 반응이 가진 성질이라 온도로 바뀌지 않습니다. 온도가 바꾸는 것은 언덕을 넘을 만큼 에너지가 큰 분자의 <b>비율</b>입니다."],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅲ-3] 이야기 ① 익지 않는 김치",
    items: [
      { id: "w1", label: "효소가 바꾸는 것과 바꾸지 않는 것", hint: "효소가 있을 때와 없을 때 무엇이 같고 무엇이 다른지, 활성화 에너지로 설명하세요.", ph: "" },
      { id: "e1a", label: "정 선생님께 보내는 답장", hint: "세 통(㉮ 냉장고 · ㉯ 실온 · ㉰ 끓는 국물)이 왜 서로 다른 결과가 나왔는지, 세 통을 각각 한 문장씩으로 설명하세요. ㉮ 와 ㉰ 의 차이가 핵심입니다.", ph: "통 ㉮: … / 통 ㉯: … / 통 ㉰: …" }
    ]
  });
})();

/* =========================================================================
   이야기 ② 빠진 살은 어디로 갔을까
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "metab", title: "조사관의 첫 추리",
    question: "어떤 사람의 몸에서 지방 <b>10 kg</b>이 줄었습니다. 그 10 kg의 질량은 <b>주로</b> 어디로 갔을까요?",
    options: ["㉠ 에너지로 바뀌어 사라졌다", "㉡ 대변으로 빠져나갔다", "㉢ 날숨 속 이산화 탄소가 되어 나갔다", "㉣ 땀과 오줌으로 빠져나갔다"],
    onPick: function (i) {
      window.sthState("metabOK", i === 2 ? "맞음" : "어긋남");
      ep.clear(0);
    }
  });

  /* 장면 2 — 세포 호흡 계량기 -------------------------------------------- */
  (function () {
    var canvas = $("c-resp"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var glu = 18, rpT = 0;
    var got = window.sthState("respGot") || { a: false, b: false, c: false };

    function calc() {
      var mol = glu / 180;
      return { mol: mol, o2: mol * 6 * 32, co2: mol * 6 * 44, h2o: mol * 6 * 18,
               kJ: mol * 2802, kcal: mol * 2802 / 4.184, atp: mol * 32 };
    }
    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var c = calc(), LW = 596, hit = Math.abs(c.co2 - 44) < 0.5;
      K.studio(ctx, 0, 0, LW, H, { x: 300, y: 330, rx: 260, ry: 26 });
      K.bigText(ctx, "날숨 CO₂ " + c.co2.toFixed(1) + " g", 18, 46, 27, hit ? "#8ff0c8" : "#ffffff");
      K.bigText(ctx, "포도당 " + glu + " g → 에너지 " + Math.round(c.kcal).toLocaleString() + " kcal", 18, 74, 16, "#ffd35a");
      lt(ctx, "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + 에너지", 18, 104, { s: 14, w: "900", c: LT.ink });
      /* 가운데: 미토콘드리아 단면 미니어처 */
      var mx = 300, my = 250, rx = 92, ry = 50;
      shadowE(ctx, mx + 8, my + ry + 10, rx + 10, 12, .28);
      var og = ctx.createRadialGradient(mx - 30, my - 24, 6, mx, my, rx); og.addColorStop(0, "#ffd8a8"); og.addColorStop(1, "#e8590c");
      ctx.fillStyle = og; ctx.beginPath(); ctx.ellipse(mx, my, rx, ry, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#fff4e6"; ctx.beginPath(); ctx.ellipse(mx, my, rx - 9, ry - 8, 0, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(mx, my, rx - 9, ry - 8, 0, 0, 6.2832); ctx.clip();
      ctx.fillStyle = "#ffc078"; ctx.fillRect(mx - rx, my - ry, rx * 2, ry * 2);
      ctx.strokeStyle = "#d9480f"; ctx.lineWidth = 3.4; ctx.lineJoin = "round";
      for (var k = -3; k <= 3; k++) {                         /* 안쪽 막의 주름(크리스타) */
        var xx = mx + k * 24, up = k % 2 === 0;
        ctx.beginPath(); ctx.moveTo(xx - 8, up ? my - ry : my + ry); ctx.lineTo(xx - 6, up ? my + 10 : my - 10); ctx.quadraticCurveTo(xx, up ? my + 20 : my - 20, xx + 6, up ? my + 10 : my - 10); ctx.lineTo(xx + 8, up ? my - ry : my + ry); ctx.stroke();
      }
      ctx.restore();
      var hl = ctx.createLinearGradient(mx, my - ry, mx, my); hl.addColorStop(0, "rgba(255,255,255,.45)"); hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hl; ctx.beginPath(); ctx.ellipse(mx - 10, my - ry * .45, rx * .7, ry * .38, 0, 0, 6.2832); ctx.fill();
      callout(ctx, "미토콘드리아", mx + 34, my - ry + 5, mx + 52, my - ry - 22, "#ffe8cc", [0, LW]);
      /* 들어가는 것: 포도당 고리 + 산소 */
      var gx = 74, gy = 196, gi;
      for (gi = 0; gi < 6; gi++) { var a1 = -Math.PI / 2 + gi * Math.PI / 3, a2 = a1 + Math.PI / 3; bond(ctx, gx + Math.cos(a1) * 17, gy + Math.sin(a1) * 17, gx + Math.cos(a2) * 17, gy + Math.sin(a2) * 17, 3); }
      for (gi = 0; gi < 6; gi++) { var a3 = -Math.PI / 2 + gi * Math.PI / 3; atom(ctx, gx + Math.cos(a3) * 17, gy + Math.sin(a3) * 17, 6.5, gi === 0 ? ATOM.O : ATOM.C, false); }
      shadowE(ctx, gx + 4, gy + 32, 26, 5, .16);
      lp(ctx, "포도당 " + c.mol.toFixed(3) + " mol", gx, 240, { s: 11.5, a: "center", c: LT.violet, box: [0, LW] });
      function o2(x, y) { bond(ctx, x - 6, y, x + 6, y, 3); atom(ctx, x - 6, y, 6, ATOM.O, false); atom(ctx, x + 6, y, 6, ATOM.O, false); }
      function co2(x, y) { bond(ctx, x - 9, y, x + 9, y, 3); atom(ctx, x - 9, y, 5, ATOM.O, false); atom(ctx, x + 9, y, 5, ATOM.O, false); atom(ctx, x, y, 5.6, ATOM.C, false); }
      function h2o(x, y) { bond(ctx, x, y, x - 7, y + 6, 2.4); bond(ctx, x, y, x + 7, y + 6, 2.4); atom(ctx, x - 7, y + 6, 3.8, ATOM.H, false); atom(ctx, x + 7, y + 6, 3.8, ATOM.H, false); atom(ctx, x, y, 6, ATOM.O, false); }
      for (gi = 0; gi < 6; gi++) o2(46 + (gi % 3) * 28, 280 + Math.floor(gi / 3) * 22);
      lp(ctx, "산소 6분자", 74, 338, { s: 11.5, a: "center", c: LT.red, box: [0, LW] });
      /* 나오는 것 */
      for (gi = 0; gi < 6; gi++) co2(480 + (gi % 3) * 34, 168 + Math.floor(gi / 3) * 22);
      lp(ctx, "CO₂ 6분자 → 날숨", 514, 226, { s: 11.5, a: "center", c: LT.ink, box: [0, LW] });
      for (gi = 0; gi < 6; gi++) h2o(484 + (gi % 3) * 30, 268 + Math.floor(gi / 3) * 24);
      lp(ctx, "물 6분자 → 오줌·땀·날숨", 514, 330, { s: 11.5, a: "center", c: LT.blue, box: [0, LW] });
      /* 흐름 화살표와 움직이는 입자 */
      K.arrow(ctx, { x: 120, y: 240 }, { x: 200, y: 246 }, "#868e96", 3, 11);
      K.arrow(ctx, { x: 398, y: 230 }, { x: 452, y: 200 }, "#868e96", 3, 11);
      K.arrow(ctx, { x: 398, y: 266 }, { x: 452, y: 284 }, "#868e96", 3, 11);
      var fl = REDUCE ? 0 : ((rpT / 900) % 1);
      if (rpT < 3000 && !REDUCE) { K.glow(ctx, 120 + 80 * fl, 240 + 6 * fl, 2.6, "rgba(112,72,232,.9)", 3); K.glow(ctx, 398 + 54 * fl, 230 - 30 * fl, 2.6, "rgba(60,60,70,.9)", 3); }
      /* ATP — 위로 튀는 에너지 */
      for (var sp = 0; sp < 5; sp++) { var su = ((rpT / 900) + sp / 5) % 1; ctx.globalAlpha = REDUCE ? .8 : 1 - su; K.glow(ctx, mx - 30 + sp * 15, my - ry - 8 - su * 30, 2.6, "rgba(255,200,60,.95)", 3.2); }
      ctx.globalAlpha = 1;
      lp(ctx, "에너지 → ATP 약 32개 / 포도당 1분자", mx, 378, { s: 11.5, a: "center", c: LT.orange, box: [0, LW] });
      atom(ctx, 26, 404, 5, ATOM.C, false); lt(ctx, "탄소", 36, 408, { s: 10.5, c: LT.mute });
      atom(ctx, 82, 404, 5, ATOM.O, false); lt(ctx, "산소", 92, 408, { s: 10.5, c: LT.mute });
      atom(ctx, 138, 404, 4, ATOM.H, false); lt(ctx, "수소 (포도당의 수소는 생략)", 148, 408, { s: 10.5, c: LT.mute });
      /* 판정 카드 */
      var RX = LW + 10, p0 = RX + 18, p1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "계량기");
      K.t(ctx, "포도당 " + glu + " g", p0, 62, { s: 21, w: "900", c: LT.violet });
      K.row(ctx, "몰수 (1 mol = 180 g)", c.mol.toFixed(3) + " mol", p0, p1, 98);
      K.row(ctx, "들이마신 산소", c.o2.toFixed(1) + " g", p0, p1, 124);
      K.row(ctx, "날숨 이산화 탄소", c.co2.toFixed(1) + " g", p0, p1, 150, hit ? LT.green : LT.ink);
      K.row(ctx, "만들어진 물", c.h2o.toFixed(1) + " g", p0, p1, 176);
      K.row(ctx, "나온 에너지", Math.round(c.kJ).toLocaleString() + " kJ", p0, p1, 202);
      K.row(ctx, "", Math.round(c.kcal).toLocaleString() + " kcal", p0, p1, 226, c.kcal >= 500 ? LT.green : LT.ink);
      K.bar(ctx, p0, 236, p1 - p0, c.kcal / 700, c.kcal >= 500 ? LT.green : LT.yellow);
      K.row(ctx, "ATP", c.atp.toFixed(2) + " mol 어치", p0, p1, 274);
      K.tip(ctx, glu === 0 ? "포도당 양을 늘려 보세요" : "나온 CO₂가 넣은 포도당보다 무겁다", p0 - 4, 290, p1 - p0 + 8, glu === 0 ? null : true);
      K.t(ctx, "산소가 함께 붙어 나가기 때문 —", p0, 350, { s: 11, c: LT.mute });
      K.t(ctx, "원자는 사라지지 않습니다.", p0, 367, { s: 11, c: LT.mute });
      K.t(ctx, "큰 분자를 쪼개 에너지를 내놓는 쪽", p0, 394, { s: 11.5, w: "800", c: LT.orange });
      K.t(ctx, "= 이화 작용", p0, 411, { s: 11.5, w: "800", c: LT.orange });

      if (quiet === true) return;
      $("b-resp-info").innerHTML = "포도당 <b>" + glu + " g</b> (" + c.mol.toFixed(3) + " mol)을 세포 호흡으로 모두 분해하면 산소 <b>" + c.o2.toFixed(1) + " g</b>을 쓰고, 이산화 탄소 <b>" + c.co2.toFixed(1) + " g</b>과 물 <b>" + c.h2o.toFixed(1) + " g</b>이 생기며 <b>" + Math.round(c.kcal).toLocaleString() + " kcal</b>의 에너지가 나옵니다. " +
        (glu === 0 ? "슬라이더를 오른쪽으로 밀어 보세요."
          : "들어간 포도당보다 <b>나온 이산화 탄소가 더 무겁습니다.</b> 산소가 함께 붙어 나갔기 때문이지요 — 원자는 사라지지 않습니다.");
      check(c);
    }
    function check(c) {
      var ch = false;
      if (Math.abs(c.co2 - 44) < 0.5 && !got.a) { got.a = true; ch = true; }
      if (c.kcal >= 500 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("respGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.c) done("m2-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>포도당 30 g을 태우면 이산화 탄소가 <b>44 g</b> 나옵니다. 몸에서 나간 질량의 상당 부분이 <b>숨으로</b> 빠져나간 셈입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    /* 슬라이더를 움직이면 에너지 불꽃이 잠깐(약 3초) 튄다 */
    K.animate(canvas, function (dt) { if (!REDUCE && rpT < 3000) { rpT += dt; draw(true); } });
    $("b-glu").addEventListener("input", function (e) { glu = +e.target.value; $("b-glu-val").textContent = glu; rpT = 0; draw(); });
    window.sthPick({
      mount: "s2-q1",
      q: "세포 호흡이 <b>이화 작용</b>인 까닭으로 가장 알맞은 것은?",
      options: ["작은 분자를 큰 분자로 합성하면서 에너지를 흡수하기 때문", "큰 분자를 작은 분자로 분해하면서 에너지를 방출하기 때문", "산소를 쓰기 때문", "세포 안에서 일어나기 때문"],
      answer: 1,
      why: ["그것은 동화 작용의 설명입니다. 광합성이나 단백질 합성이 여기에 해당합니다.",
        "맞습니다. 포도당이라는 <b>큰 분자</b>가 이산화 탄소와 물이라는 <b>작은 분자</b>로 쪼개지며 에너지를 <b>내놓습니다.</b> 소화도 같은 갈래입니다.",
        "산소를 쓰는지 여부가 갈래를 정하지 않습니다. 산소 없이 일어나는 발효도 이화 작용입니다.",
        "동화 작용도 세포 안에서 일어납니다. 갈래를 가르는 기준은 <b>분자의 크기 변화와 에너지의 방향</b>입니다."],
      onDone: function () { got.c = true; window.sthState("respGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 3 — 단백질 공장 + 두 방향 비교 ---------------------------------- */
  (function () {
    var canvas = $("c-anab"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var canvas2 = $("c-flow"), ctx2 = window.setupCanvas(canvas2), W2 = canvas2._w, H2 = canvas2._h;
    var n = 3, mode = "ana", prog = 0, abT = 2000;
    var got = window.sthState("anabGot") || { a: false, b: false, ana: false, cat: false };

    var AAPAL = ["#20c997", "#4dabf7", "#ffa94d", "#f783ac", "#9775fa", "#69db7c", "#ffd43b", "#ff8787"];
    function draw(quiet) {
      ctx.clearRect(0, 0, W, H);
      var bonds = n - 1, water = n - 1, atp = 4 * (n - 1), mass = 110 * n + 18;
      var LW = 596;
      K.studio(ctx, 0, 0, LW, H, { x: 300, y: 384, rx: 270, ry: 14 });
      K.bigText(ctx, "펩타이드 결합 " + bonds + "개", 18, 46, 27, n === 10 ? "#8ff0c8" : "#ffffff");
      K.bigText(ctx, "물 " + water + "분자가 빠지고 ATP " + atp + "개를 씀", 18, 74, 16, "#ffd35a");
      /* 사슬: 줄마다 방향을 바꿔 이어 간다(뱀 모양) */
      var perRow = 12, dx = 42, dy = 46, x0 = 58, y0 = 146, r = 13, i, pts = [];
      for (i = 0; i < n; i++) {
        var rw = Math.floor(i / perRow), cI = i % perRow, cc = rw % 2 ? perRow - 1 - cI : cI;
        pts.push({ x: x0 + cc * dx, y: y0 + rw * dy });
      }
      var rows = Math.ceil(n / perRow);
      for (var t2 = 0; t2 < rows; t2++) shadowE(ctx, x0 + (perRow - 1) * dx / 2 + 6, y0 + t2 * dy + r + 6, (perRow - 1) * dx / 2 + 26, 6, .12);
      for (i = 1; i < n; i++) {
        ctx.save(); ctx.lineCap = "round"; ctx.strokeStyle = "#e8590c"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y - 1.5); ctx.lineTo(pts[i].x, pts[i].y - 1.5); ctx.stroke(); ctx.restore();
      }
      pts.forEach(function (q, k) { var b = AAPAL[k % AAPAL.length]; K.planet(ctx, q.x, q.y, r, b, shade(b, .42)); });
      /* 결합마다 빠져나온 물 분자(산소 1 + 수소 2) — 가장 최근 것은 떠오른다 */
      var lift = REDUCE ? 1 : clamp(abT / 1200, 0, 1);
      for (i = 1; i < n; i++) {
        var mx = (pts[i - 1].x + pts[i].x) / 2, my = (pts[i - 1].y + pts[i].y) / 2 - 22 - (i === n - 1 ? lift * 10 : 0);
        ctx.globalAlpha = i === n - 1 ? .35 + .65 * lift : .9;
        bond(ctx, mx, my, mx - 5, my + 4, 1.6); bond(ctx, mx, my, mx + 5, my + 4, 1.6);
        K.planet(ctx, mx - 5, my + 4, 2.6, "#ffffff", "#9aa4b6"); K.planet(ctx, mx + 5, my + 4, 2.6, "#ffffff", "#9aa4b6");
        K.planet(ctx, mx, my, 4.4, "#ff6b5a", "#a51111");
        ctx.globalAlpha = 1;
      }
      lp(ctx, "● 아미노산 " + n + "개", 26, 108, { s: 11.5, c: LT.teal, box: [0, LW] });
      lp(ctx, "━ 펩타이드 결합 " + bonds + "개", 160, 108, { s: 11.5, c: LT.orange, box: [0, LW] });
      lp(ctx, "● 빠져나온 물 " + water + "분자", 330, 108, { s: 11.5, c: LT.red, box: [0, LW] });
      /* 재료 접시: 아직 이어지지 않은 아미노산(세포질 속 재료) */
      var tg = ctx.createLinearGradient(0, 352, 0, 388); tg.addColorStop(0, "rgba(255,255,255,.85)"); tg.addColorStop(1, "rgba(170,185,205,.85)");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(300, 372, 250, 16, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(90,110,140,.45)"; ctx.lineWidth = 1.2; ctx.stroke();
      var left = Math.min(60 - n, 36);
      for (i = 0; i < left; i++) { var bb = AAPAL[(i * 3) % AAPAL.length]; K.planet(ctx, 90 + (i % 18) * 24 + (i >= 18 ? 12 : 0), 368 - (i >= 18 ? 9 : 0), 7, bb, shade(bb, .42)); }
      lt(ctx, "재료: 세포질 속 아미노산", 300, 398, { s: 10.5, w: "700", a: "center", c: LT.mute });
      /* 판정 카드 */
      var RX = LW + 10, p0 = RX + 18, p1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "조립 기록");
      K.t(ctx, n === 10 ? "결합 9개 · 물 9분자" : "아미노산 " + n + "개 사슬", p0, 62, { s: 20, w: "900", c: n === 10 ? LT.green : LT.ink });
      K.row(ctx, "아미노산의 개수", n + " 개", p0, p1, 100, n === 10 ? LT.green : LT.ink);
      K.row(ctx, "펩타이드 결합", bonds + " 개", p0, p1, 126);
      K.row(ctx, "빠져나온 물", water + " 분자", p0, p1, 152);
      K.row(ctx, "드는 ATP (결합당 약 4개)", atp + " 개", p0, p1, 178, atp >= 100 ? LT.green : LT.ink);
      K.bar(ctx, p0, 188, p1 - p0, atp / 236, atp >= 100 ? LT.green : LT.yellow);
      K.row(ctx, "사슬의 질량 (어림)", mass.toLocaleString() + " Da", p0, p1, 226);
      K.tip(ctx, atp >= 100 ? "ATP 100개 넘게 드는 큰 사슬" : "사슬을 더 길게 이어 보세요", p0 - 4, 244, p1 - p0 + 8, atp >= 100 ? true : null);
      K.t(ctx, "n개를 이으면 결합은 언제나 n − 1개,", p0, 306, { s: 11, c: LT.mute });
      K.t(ctx, "빠져나오는 물도 n − 1분자입니다.", p0, 323, { s: 11, c: LT.mute });
      K.t(ctx, "작은 것을 크게 만드는 반응은", p0, 350, { s: 11.5, w: "800", c: LT.violet });
      K.t(ctx, "에너지를 써야 굴러갑니다 — 동화 작용", p0, 368, { s: 11.5, w: "800", c: LT.violet });

      if (quiet === true) return;
      $("b-anab-info").innerHTML = "아미노산 <b>" + n + "개</b>를 이으면 펩타이드 결합 <b>" + bonds + "개</b>가 생기고 물 <b>" + water + "분자</b>가 빠져나옵니다. 여기에 ATP가 약 <b>" + atp + "개</b> 쓰입니다. " +
        (n === 10 ? "🎉 열 개를 이으면 결합과 물은 아홉 개 — 언제나 하나가 적습니다."
          : (atp >= 100 ? "제법 긴 사슬입니다. 헤모글로빈의 β 사슬은 아미노산 146개짜리입니다."
            : "슬라이더를 움직여 사슬을 길게 해 보세요."));
      check();
    }
    function flow() {
      ctx2.clearRect(0, 0, W2, H2);
      var isAna = mode === "ana", p = prog / 100;
      var e = 2802 * p, LW = 596, moved = Math.round(6 * p);
      var c2 = isAna ? "#7048e8" : "#e8590c";
      K.studio(ctx2, 0, 0, LW, H2, { x: 300, y: 300, rx: 260, ry: 22 });
      K.bigText(ctx2, isAna ? "동화 작용 · 에너지 흡수" : "이화 작용 · 에너지 방출", 18, 44, 25, isAna ? "#d0bfff" : "#ffc9a8");
      K.bigText(ctx2, "진행률 " + prog + " % · " + Math.round(e).toLocaleString() + " kJ", 18, 72, 16, "#ffd35a");
      /* 받침대 두 개 */
      function stand(cx) {
        shadowE(ctx2, cx + 6, 296, 96, 12, .25);
        var g = ctx2.createLinearGradient(cx - 90, 0, cx + 90, 0); g.addColorStop(0, "#b9c2d0"); g.addColorStop(.5, "#f3f6fa"); g.addColorStop(1, "#9aa4b6");
        ctx2.fillStyle = g; ctx2.fillRect(cx - 90, 262, 180, 26); ctx2.beginPath(); ctx2.ellipse(cx, 288, 90, 14, 0, 0, Math.PI); ctx2.fill();
        ctx2.fillStyle = "#e9eef5"; ctx2.beginPath(); ctx2.ellipse(cx, 262, 90, 14, 0, 0, 6.2832); ctx2.fill();
        ctx2.strokeStyle = "rgba(90,100,120,.35)"; ctx2.lineWidth = 1; ctx2.stroke();
      }
      stand(130); stand(466);
      function unit(x, y, r) { var b = "#20c997"; shadowE(ctx2, x + 3, y + r + 2, r, r * .3, .15); K.planet(ctx2, x, y, r, b, shade(b, .42)); }
      /* 사슬(큰 분자): k 개의 단위체가 고리 모양으로 이어진 덩어리 */
      function chain(cx, cy, k) {
        if (k <= 0) return;
        var pts = [], i;
        for (i = 0; i < k; i++) { var a = -Math.PI + i * (Math.PI / 2.6); pts.push({ x: cx - 52 + i * 21, y: cy - 8 + Math.sin(i * 1.4) * 10 }); }
        for (i = 1; i < pts.length; i++) bond(ctx2, pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, 5);
        var hg = ctx2.createRadialGradient(cx, cy - 8, 6, cx, cy - 8, 70); hg.addColorStop(0, "rgba(112,72,232,.18)"); hg.addColorStop(1, "rgba(112,72,232,0)");
        ctx2.fillStyle = hg; ctx2.beginPath(); ctx2.arc(cx, cy - 8, 70, 0, 6.2832); ctx2.fill();
        pts.forEach(function (q) { var b = "#9775fa"; K.planet(ctx2, q.x, q.y, 13, b, shade(b, .45)); });
      }
      function loose(cx, cy, k) {
        for (var i = 0; i < k; i++) unit(cx - 54 + (i % 3) * 54, cy - 18 + Math.floor(i / 3) * 30 - (i % 2) * 6, 12);
      }
      /* 왼쪽 받침 = 시작 물질, 오른쪽 받침 = 결과 물질 */
      if (isAna) { loose(130, 250, 6 - moved); chain(466, 240, moved); }
      else { chain(130, 240, 6 - moved); loose(466, 250, moved); }
      lt(ctx2, isAna ? "작은 분자 (포도당 · 아미노산)" : "큰 분자 (녹말 · 단백질 · 지방)", 130, 320, { s: 11.5, w: "800", a: "center", c: LT.ink });
      lt(ctx2, isAna ? "큰 분자 (녹말 · 단백질 · 지방)" : "작은 분자 (CO₂ · H₂O · 아미노산)", 466, 320, { s: 11.5, w: "800", a: "center", c: LT.ink });
      /* 가운데: 반응 화살표와 에너지 */
      ctx2.save(); ctx2.shadowColor = c2; ctx2.shadowBlur = 8; K.arrow(ctx2, { x: 236, y: 200 }, { x: 236 + 124 * Math.max(p, .06), y: 200 }, c2, 5, 15); ctx2.restore();
      var ey = 132;
      if (isAna) {
        K.arrow(ctx2, { x: 298, y: ey - 26 }, { x: 298, y: 186 }, LT.yellow, 3, 12);
        lp(ctx2, "에너지 흡수 ↓ (ATP를 씀)", 298, ey - 34, { s: 12, a: "center", c: LT.violet, box: [0, LW] });
      } else {
        K.arrow(ctx2, { x: 298, y: 186 }, { x: 298, y: ey - 26 }, LT.yellow, 3, 12);
        lp(ctx2, "에너지 방출 ↑ (ATP를 만듦)", 298, ey - 34, { s: 12, a: "center", c: LT.orange, box: [0, LW] });
      }
      for (var sp = 0; sp < Math.round(6 * p); sp++) K.glow(ctx2, 270 + (sp % 3) * 28, 150 + Math.floor(sp / 3) * 18, 2.4, "rgba(255,200,60,.95)", 3);
      /* 판정 카드 */
      var RX = LW + 10, p0 = RX + 18, p1 = W2 - 18;
      K.card(ctx2, RX, 0, W2 - RX, H2, "에너지 저울");
      K.t(ctx2, isAna ? "동화 작용" : "이화 작용", p0, 62, { s: 21, w: "900", c: c2 });
      K.row(ctx2, "방향", isAna ? "작은 것 → 큰 것" : "큰 것 → 작은 것", p0, p1, 98);
      K.row(ctx2, "진행률", prog + " %", p0, p1, 126);
      K.row(ctx2, isAna ? "지금까지 쓴 에너지" : "지금까지 낸 에너지", Math.round(e).toLocaleString() + " kJ", p0, p1, 154, c2);
      K.bar(ctx2, p0, 164, p1 - p0, p, c2);
      K.row(ctx2, "예", isAna ? "광합성 · 단백질 합성" : "세포 호흡 · 소화", p0, p1, 204);
      K.tip(ctx2, prog === 100 ? "끝까지 진행했습니다" : "진행률을 100 %까지 밀어 보세요", p0 - 4, 222, p1 - p0 + 8, prog === 100 ? true : null);
      K.t(ctx2, "두 작용은 방향만 반대일 뿐", p0, 286, { s: 11, c: LT.mute });
      K.t(ctx2, "같은 저울 위에 있습니다.", p0, 303, { s: 11, c: LT.mute });
      K.t(ctx2, "둘을 합쳐 물질대사라고 합니다.", p0, 326, { s: 11.5, w: "800", c: LT.blue });

      $("b-flow-info").innerHTML = (isAna
        ? "<b>동화 작용</b> — 작고 간단한 물질을 크고 복잡한 물질로 합성하며 에너지를 <b>흡수</b>합니다. 광합성, 단백질 합성, 녹말 합성이 여기에 듭니다."
        : "<b>이화 작용</b> — 크고 복잡한 물질을 작고 간단한 물질로 분해하며 에너지를 <b>방출</b>합니다. 세포 호흡, 소화, 발효가 여기에 듭니다.") +
        " 진행률 <b>" + prog + " %</b> · 지금까지 " + (isAna ? "쓴" : "낸") + " 에너지 <b>" + Math.round(e).toLocaleString() + " kJ</b>.";
      if (prog === 100) {
        var ch = false;
        if (isAna && !got.ana) { got.ana = true; ch = true; }
        if (!isAna && !got.cat) { got.cat = true; ch = true; }
        if (ch) { window.sthState("anabGot", got); mission(); }
      }
    }
    function check() {
      var ch = false;
      if (n === 10 && !got.a) { got.a = true; ch = true; }
      if (4 * (n - 1) >= 100 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("anabGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-3a");
      if (got.b) done("m2-3b");
      if (got.ana && got.cat) done("m2-3c");
      if (got.a && got.b && got.ana && got.cat) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>짓는 쪽은 에너지를 <b>쓰고</b>, 부수는 쪽은 에너지를 <b>냅니다.</b> 몸은 이 둘을 동시에 굴립니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw; canvas2._redraw = flow;
    K.animate(canvas, function (dt) { if (!REDUCE && abT < 1300) { abT += dt; draw(true); } });
    $("b-n").addEventListener("input", function (e) { n = +e.target.value; $("b-n-val").textContent = n; abT = 0; draw(); });
    segWire("b-mode", "data-m", function (x) { mode = x; flow(); });
    $("b-p").addEventListener("input", function (e) { prog = +e.target.value; $("b-p-val").textContent = prog; flow(); });
    draw(); flow(); mission();
  })();

  /* 장면 4 — 하루의 수지 맞추기 ------------------------------------------ */
  (function () {
    var canvas = $("c-bmr"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var sex = "m", wgt = 60, actf = 1.55, kcal = 2000, HT = 170, AGE = 17;
    var got = window.sthState("bmrGot") || { a: false, b: false, c: false };

    function bmr() { return 10 * wgt + 6.25 * HT - 5 * AGE + (sex === "m" ? 5 : -161); }
    function tdee() { return bmr() * actf; }
    function monthly() { return (kcal - tdee()) * 30 / 7700; }

    /* 열량 블록(입체 정육면체) */
    function cube(x, y, s, c) {                       /* (x, y) = 윗면 가운데 */
      var a = s * .87, b = s * .5;
      function q(p, f) { ctx.fillStyle = f; ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); ctx.fill(); }
      q([x - a, y, x, y + b, x, y + b + s, x - a, y + s], K.tint(c, .95));
      q([x, y + b, x + a, y, x + a, y + s, x, y + b + s], K.tint(c, .7));
      q([x, y - b, x + a, y, x, y + b, x - a, y], K.tint(c, 1.25));
    }
    /* 저울 접시 위에 열량 블록 쌓기 (블록 하나 = 250 kcal) */
    function pan(cx, py, val, c, lab, sub) {
      ctx.strokeStyle = "#8a94a8"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(cx, py - 150); ctx.lineTo(cx - 70, py); ctx.moveTo(cx, py - 150); ctx.lineTo(cx + 70, py); ctx.stroke();
      shadowE(ctx, cx + 6, py + 16, 80, 8, .2);
      var pg = ctx.createLinearGradient(cx - 80, 0, cx + 80, 0); pg.addColorStop(0, "#c3cbd8"); pg.addColorStop(.45, "#f4f7fb"); pg.addColorStop(1, "#8e98aa");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(cx, py + 2, 80, 13, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#a9b2c2"; ctx.beginPath(); ctx.ellipse(cx, py, 76, 10, 0, 0, Math.PI); ctx.fill();
      var nb = Math.round(clamp(val, 0, 4400) / 250), s = 15, i;
      for (i = 0; i < nb; i++) cube(cx - 39 + (i % 4) * 26, py - 20 - Math.floor(i / 4) * s, s, c);
      lp(ctx, Math.round(val).toLocaleString() + " kcal", cx, py - 136, { s: 14, a: "center", c: c, box: [0, 596] });
      lt(ctx, lab, cx, py + 40, { s: 12, w: "900", a: "center", c: LT.ink });
      lt(ctx, sub, cx, py + 58, { s: 10.5, w: "600", a: "center", c: LT.mute });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var B = bmr(), T = tdee(), sur = kcal - T, mo = monthly();
      var LW = 596, ok = Math.abs(mo) <= 0.2;
      K.studio(ctx, 0, 0, LW, H, { x: 300, y: 356, rx: 240, ry: 26 });
      K.bigText(ctx, "한 달 뒤 " + (mo >= 0 ? "+" : "−") + Math.abs(mo).toFixed(2) + " kg", 18, 46, 27, ok ? "#8ff0c8" : "#ffffff");
      K.bigText(ctx, "만 " + AGE + "세 · " + HT + " cm · " + (sex === "m" ? "남" : "여") + " · " + wgt + " kg", 18, 74, 16, "#ffd35a");
      /* 저울대: 남으면 먹은 쪽이 내려간다 */
      var tilt = clamp(sur / 1500, -1, 1) * 0.08, cx = 300, cy = 128, half = 180;
      var lx = cx - half * Math.cos(tilt), ly = cy + half * Math.sin(tilt), rx = cx + half * Math.cos(tilt), ry = cy - half * Math.sin(tilt);
      /* 받침 */
      shadowE(ctx, cx + 8, 356, 70, 10, .3);
      var bg = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0); bg.addColorStop(0, "#9aa4b6"); bg.addColorStop(.5, "#eef2f7"); bg.addColorStop(1, "#7b8598");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(cx, 350, 56, 12, 0, 0, 6.2832); ctx.fill(); ctx.fillRect(cx - 56, 336, 112, 14); ctx.beginPath(); ctx.ellipse(cx, 336, 56, 12, 0, 0, 6.2832); ctx.fillStyle = "#dfe5ee"; ctx.fill();
      var pg2 = ctx.createLinearGradient(cx - 8, 0, cx + 8, 0); pg2.addColorStop(0, "#8a94a8"); pg2.addColorStop(.5, "#f4f7fb"); pg2.addColorStop(1, "#6b7488");
      ctx.fillStyle = pg2; ctx.fillRect(cx - 7, cy, 14, 208);
      var bm = ctx.createLinearGradient(0, cy - 5, 0, cy + 5); bm.addColorStop(0, "#f4f7fb"); bm.addColorStop(1, "#7b8598");
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-tilt); ctx.fillStyle = bm; ctx.beginPath(); ctx.roundRect(-half - 6, -5, half * 2 + 12, 10, 5); ctx.fill(); ctx.restore();
      K.planet(ctx, cx, cy, 10, "#ffd35a", "#b7791f");
      pan(lx, ly + 150, kcal, "#7048e8", "먹은 쪽 (동화로 저장)", "하루 섭취 열량");
      pan(rx, ry + 150, T, "#e8590c", "쓴 쪽 (이화로 분해)", "기초 대사량 × 활동량");
      lp(ctx, sur > 0 ? "남음 ◀" : (sur < 0 ? "▶ 모자람" : "딱 맞음"), cx, 100, { s: 12, a: "center", c: ok ? LT.green : LT.ink, box: [0, LW] });
      lt(ctx, "블록 하나 = 250 kcal", LW - 16, 400, { s: 10.5, w: "700", a: "right", c: LT.mute });
      /* 판정 카드 */
      var RX = LW + 10, p0 = RX + 18, p1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "하루 수지");
      K.t(ctx, ok ? "균형 · 몸무게 그대로" : (mo > 0 ? "남는 몫 → 지방으로" : "모자란 몫 → 지방을 꺼냄"), p0, 62, { s: 17, w: "900", c: ok ? LT.green : (mo > 0 ? LT.violet : LT.orange) });
      K.row(ctx, "기초 대사량", Math.round(B).toLocaleString() + " kcal", p0, p1, 100, B >= 1600 ? LT.green : LT.ink);
      K.bar(ctx, p0, 110, p1 - p0, B / 2200, B >= 1600 ? LT.green : LT.blue);
      K.row(ctx, "하루 소비 열량", Math.round(T).toLocaleString() + " kcal", p0, p1, 150);
      K.row(ctx, "하루 섭취 열량", kcal.toLocaleString() + " kcal", p0, p1, 176);
      K.row(ctx, "남거나 모자란 몫", (sur >= 0 ? "+" : "−") + Math.abs(Math.round(sur)).toLocaleString() + " kcal", p0, p1, 202);
      K.row(ctx, "한 달 뒤 몸무게", (mo >= 0 ? "+" : "−") + Math.abs(mo).toFixed(2) + " kg", p0, p1, 228, ok ? LT.green : LT.red);
      K.tip(ctx, ok ? "먹은 쪽과 쓴 쪽이 비겼습니다" : "±0.2 kg 안으로 맞춰 보세요", p0 - 4, 246, p1 - p0 + 8, ok);
      K.t(ctx, "지방 1 kg ≒ 7,700 kcal로 어림", p0, 302, { s: 10.5, c: LT.mute });
      K.t(ctx, "기초 대사량은 체온 유지, 심장 박동,", p0, 330, { s: 10.5, c: LT.mute });
      K.t(ctx, "새 단백질 합성에 쓰입니다.", p0, 347, { s: 10.5, c: LT.mute });
      K.t(ctx, "가만히 누워 있어도 물질대사는", p0, 376, { s: 11, w: "800", c: LT.blue });
      K.t(ctx, "쉬지 않습니다.", p0, 394, { s: 11, w: "800", c: LT.blue });

      $("b-bmr-info").innerHTML = "기초 대사량 <b>" + Math.round(B).toLocaleString() + " kcal</b>, 하루 소비 <b>" + Math.round(T).toLocaleString() + " kcal</b>, 하루 섭취 <b>" + kcal.toLocaleString() + " kcal</b> → 한 달 뒤 몸무게가 <b>" + (mo >= 0 ? "+" : "−") + Math.abs(mo).toFixed(2) + " kg</b> 달라집니다. " +
        (Math.abs(mo) <= 0.2 ? "🎉 먹는 쪽과 쓰는 쪽이 거의 균형을 이뤘습니다. 몸은 그대로여도 안에서는 쉼 없이 짓고 허물고 있습니다."
          : (mo > 0 ? "남은 몫이 <b>지방으로 저장</b>됩니다(동화 작용)." : "모자란 몫을 저장해 둔 지방에서 꺼내 씁니다(이화 작용) — 그 지방은 결국 <b>숨으로</b> 나갑니다."));
      check(B, mo);
    }
    function check(B, mo) {
      var ch = false;
      if (B >= 1600 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(mo) <= 0.2 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("bmrGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-4a");
      if (got.b) done("m2-4b");
      if (got.c) done("m2-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>몸무게가 그대로라는 말은 <b>아무 일도 없다</b>는 뜻이 아니라, 짓는 쪽과 허무는 쪽이 <b>비겼다</b>는 뜻입니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    segWire("b-sex", "data-x", function (x) { sex = x; draw(); });
    segWire("b-act", "data-a", function (x) { actf = +x; draw(); });
    $("b-w").addEventListener("input", function (e) { wgt = +e.target.value; $("b-w-val").textContent = wgt; draw(); });
    $("b-kcal").addEventListener("input", function (e) { kcal = +e.target.value; $("b-kcal-val").textContent = kcal; draw(); });
    window.sthSort({
      mount: "s2-sort",
      buckets: [
        { id: "a", label: "동화 작용", sub: "작은 것 → 큰 것 · 에너지 흡수" },
        { id: "c", label: "이화 작용", sub: "큰 것 → 작은 것 · 에너지 방출" }
      ],
      items: [
        { t: "🌱 식물이 이산화 탄소와 물로 포도당을 만든다 (광합성)", a: "a", why: "작고 간단한 물질을 크고 복잡한 물질로 만들며 빛에너지를 흡수합니다." },
        { t: "💪 아미노산을 이어 근육 단백질을 만든다", a: "a", why: "앞 장면에서 직접 조립해 본 반응입니다. ATP를 씁니다." },
        { t: "🍠 남는 포도당을 이어 붙여 녹말로 저장한다", a: "a", why: "포도당 여러 개를 이어 큰 분자를 만듭니다." },
        { t: "🧈 남은 열량을 지방으로 저장한다", a: "a", why: "작은 분자를 모아 저장용 큰 분자를 만드는 합성 반응입니다." },
        { t: "🧬 DNA를 복제해 새 DNA 사슬을 만든다", a: "a", why: "뉴클레오타이드라는 작은 단위를 이어 큰 분자를 만듭니다.", hint: "복제는 만드는 일일까요, 부수는 일일까요?" },
        { t: "🫁 세포가 포도당을 분해해 ATP를 얻는다 (세포 호흡)", a: "c", why: "큰 분자를 쪼개며 에너지를 내놓습니다." },
        { t: "🍚 입과 위와 소장에서 음식물이 분해된다 (소화)", a: "c", why: "녹말·단백질·지방이라는 큰 분자를 작은 단위로 쪼갭니다." },
        { t: "🥛 유산균이 당을 젖산으로 바꾼다 (발효)", a: "c", why: "김치가 익는 그 반응입니다. 산소 없이도 일어나는 이화 작용입니다.", hint: "이야기 ① 에서 본 반응입니다." },
        { t: "🏃 달릴 때 저장해 둔 지방을 꺼내 쓴다", a: "c", why: "큰 지방 분자를 쪼개 에너지를 꺼냅니다. 그 원자는 이산화 탄소가 되어 날숨으로 나갑니다." },
        { t: "🍞 침 속 아밀레이스가 녹말을 엿당으로 바꾼다", a: "c", why: "큰 녹말을 작은 당으로 쪼갭니다." }
      ],
      doneText: "방향과 에너지, 이 두 가지만 보면 갈래가 갈립니다.",
      onDone: function () { got.c = true; window.sthState("bmrGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 -------------------------------------------------------- */
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("metab") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (window.sthState("metabOK") === "맞음"
        ? "정확했습니다. 의사와 영양사들도 대부분 놓친 답을 맞혔습니다."
        : "정답은 ㉢ 입니다. 에너지는 물질이 아니므로 ‘에너지로 사라졌다’는 답은 성립하지 않습니다. 원자는 반드시 어디론가 갑니다 — 그 길은 <b>날숨</b>이었습니다.") +
      "<br><b>내가 맞춘 균형</b> 하루 섭취 " + (window.sthState("balKcal") || "-") + " kcal";
  }
  function finish() { window.sthState("r2", "해결 · 빠진 지방은 날숨 속 이산화 탄소로 나간다, 몸은 동화와 이화를 함께 굴린다"); }
  window.sthPick({
    mount: "s2-q2",
    q: "살이 빠질 때 <b>지방의 질량</b> 가운데 가장 많은 몫이 몸 밖으로 나가는 길은?",
    options: ["땀", "오줌", "날숨", "대변"],
    answer: 2,
    why: ["땀으로 나가는 것은 주로 물과 소금입니다. 지방을 이루던 탄소는 땀으로 나가지 않습니다.",
      "오줌으로도 물의 일부가 나가지만 가장 큰 몫은 아닙니다.",
      "지방 질량의 약 <b>84 %</b>는 세포 호흡을 거쳐 <b>이산화 탄소</b>가 되어 날숨으로 나갑니다. 나머지는 물이 되어 오줌·땀·날숨으로 나갑니다.",
      "대변의 대부분은 애초에 흡수되지 않은 음식물과 세균입니다. 이미 몸에 저장된 지방이 나가는 길이 아닙니다."],
    onDone: function () {
      var f = document.getElementById("b-kcal");
      window.sthState("balKcal", f ? f.value : "-");
      reveal(); ep.clear(4);
    }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅲ-3] 이야기 ② 빠진 살은 어디로 갔을까",
    items: [
      { id: "e2a", label: "하윤이에게 보내는 답장", hint: "‘살이 없어졌다’는 말이 왜 과학적으로 틀린 표현인지, 지방을 이루던 원자를 따라가며 세 문장 안에 설명하세요.", ph: "" },
      { id: "e2b", label: "동화 작용과 이화 작용을 가르는 기준", hint: "두 작용을 ‘분자 크기의 변화’와 ‘에너지의 방향’ 두 가지로 견주고, 각각 내 몸에서 일어나는 예를 하나씩 드세요.", ph: "동화 작용: … / 이화 작용: …" }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 한 글자가 바뀌면
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  /* 사람 헤모글로빈 β 유전자 앞부분 — DNA 주형 가닥 27 염기 */
  var TPL = "TACCACGTGGACTGAGGACTCCTCTTC";
  var RNA_OF = { A: "U", T: "A", G: "C", C: "G" };
  var COMP = { A: "T", T: "A", G: "C", C: "G" };
  var CODON = {
    UUU: "Phe", UUC: "Phe", UUA: "Leu", UUG: "Leu", CUU: "Leu", CUC: "Leu", CUA: "Leu", CUG: "Leu",
    AUU: "Ile", AUC: "Ile", AUA: "Ile", AUG: "Met", GUU: "Val", GUC: "Val", GUA: "Val", GUG: "Val",
    UCU: "Ser", UCC: "Ser", UCA: "Ser", UCG: "Ser", CCU: "Pro", CCC: "Pro", CCA: "Pro", CCG: "Pro",
    ACU: "Thr", ACC: "Thr", ACA: "Thr", ACG: "Thr", GCU: "Ala", GCC: "Ala", GCA: "Ala", GCG: "Ala",
    UAU: "Tyr", UAC: "Tyr", UAA: "정지", UAG: "정지", CAU: "His", CAC: "His", CAA: "Gln", CAG: "Gln",
    AAU: "Asn", AAC: "Asn", AAA: "Lys", AAG: "Lys", GAU: "Asp", GAC: "Asp", GAA: "Glu", GAG: "Glu",
    UGU: "Cys", UGC: "Cys", UGA: "정지", UGG: "Trp", CGU: "Arg", CGC: "Arg", CGA: "Arg", CGG: "Arg",
    AGU: "Ser", AGC: "Ser", AGA: "Arg", AGG: "Arg", GGU: "Gly", GGC: "Gly", GGA: "Gly", GGG: "Gly"
  };
  var KOR = { Met: "메싸이오닌", Val: "발린", His: "히스티딘", Leu: "류신", Thr: "트레오닌", Pro: "프롤린", Glu: "글루탐산", Lys: "라이신" };

  function express(tpl) {
    var mrna = "", i;
    for (i = 0; i < tpl.length; i++) mrna += RNA_OF[tpl.charAt(i)];
    var codons = [], aas = [], stopped = false;
    for (i = 0; i + 3 <= mrna.length; i += 3) {
      var c = mrna.slice(i, i + 3), aa = CODON[c] || "?";
      codons.push(c);
      if (aa === "정지") { stopped = true; break; }
      aas.push(aa);
    }
    return { mrna: mrna, codons: codons, aas: aas, stopped: stopped };
  }
  var NORMAL = express(TPL);

  /* 염기 한 줄 그리기 */
  function strand(ctx, y, seq, colOf, label, hi) {
    ctx.textAlign = "left";
    pill(ctx, label, 16, y + 4, { s: 10.5, c: KS.mute });
    /* 당-인산 뼈대 */
    ctx.save(); ctx.strokeStyle = "rgba(200,210,255,.35)"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(186, y); ctx.lineTo(186 + (seq.length - 1) * 26, y); ctx.stroke(); ctx.restore();
    for (var i = 0; i < seq.length; i++) {
      var x = 186 + i * 26;
      if (hi === i) K.glow(ctx, x, y, 14, "rgba(255,110,150,.55)", 1.8);
      ctx.globalAlpha = (hi === i) ? 1 : .92;
      ball(ctx, x, y, 11, colOf(i)); ctx.globalAlpha = 1;
      if (hi === i) { ctx.strokeStyle = v("--rose-700") || v("--ink"); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 13.5, 0, Math.PI * 2); ctx.stroke(); }
      text(ctx, seq.charAt(i), x + 1, y + 4.5, { s: 11.5, w: "900", a: "center", c: "#ffffff" });
    }
  }

  window.sthGate({
    gate: "g3", key: "gene", title: "조사관의 첫 추리",
    question: "노엘의 적혈구가 <b>낫 모양</b>으로 굳은 원인은 무엇이었을까요?",
    options: ["㉠ 적혈구가 영양을 제대로 받지 못해서", "㉡ 헤모글로빈의 아미노산 146개 가운데 단 하나가 달라서", "㉢ 몸속에 철이 모자라서", "㉣ 적혈구의 수가 모자라서"],
    onPick: function (i) {
      window.sthState("geneOK", i === 1 ? "맞음" : "어긋남");
      ep.clear(0);
    }
  });

  /* 장면 2 — 전사와 번역 (위: 세포를 잘라 본 블록 모형 · 아래: 염기 서열 읽기판) -------- */
  (function () {
    var canvas = $("c-express"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var rib = 0, box = { gen: 0 }, run = ticker(box);
    var got = window.sthState("exprGot") || { a: false, b: false };
    var DH = 444;                                     /* 위 모형 칸 높이(아래는 서열 읽기판) */
    var ph = 0, moving = !REDUCE;

    /* ── 세포 블록: x 0~L(화면 오른쪽 아래로), y 0~D, z 0~Z. 앞면(y = D)이 잘라 낸 단면 ── */
    var I = K.iso({ ox: 440, oy: 178, s: 0.66, L: 640, D: 110 });
    var L = I.L, D = I.D, Z = 240;
    function F(u, z) { return I.P(u, D, z); }         /* 앞면(단면) 위의 점 → 화면 */
    var NU = 150, NZ = 120, NR = 75;                   /* 핵 단면: 가운데·반지름(그림 단위) */
    var PORE = { u: NU + NR * Math.cos(-0.45), z: NZ + NR * Math.sin(-0.45) };
    var POL = { u: 192, z: 108 };                      /* RNA 중합 효소 */
    var M0 = 300, MS = 32, MZ = 80;                   /* 세포질 속 mRNA: 첫 코돈 시작, 코돈 폭, 높이 */
    function mz(u) { return MZ + 3 * Math.sin(u / 23); }
    function ribU(n) { return n > 0 ? M0 + (n - 0.5) * MS : M0 - 22; }
    /* mRNA 길: 중합 효소 → 핵공 → 세포질로 나와 리보솜 쪽으로 */
    function mPath() {
      var p = [], t;
      for (t = 0; t <= 1.0001; t += 0.1) p.push({ u: POL.u + (PORE.u - POL.u) * t, z: POL.z + (PORE.z - POL.z) * t + 5 * Math.sin(t * Math.PI) });
      for (t = 0.05; t <= 1.0001; t += 0.05) {
        var u = PORE.u + (M0 - 8 - PORE.u) * t, z = PORE.z + (mz(M0 - 8) - PORE.z) * (1 - Math.pow(1 - t, 2));
        p.push({ u: u, z: z });
      }
      for (var uu = M0 - 8; uu <= M0 + 9 * MS + 10; uu += 4) p.push({ u: uu, z: mz(uu) });
      return p;
    }
    var PATH = mPath();
    function poly(pts, close) {
      ctx.beginPath();
      pts.forEach(function (q, i) { var s = F(q.u, q.z); if (i) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y); });
      if (close) ctx.closePath();
    }
    function ring(cu, cz, r, n) { var a = []; for (var i = 0; i <= (n || 48); i++) { var t = i / (n || 48) * Math.PI * 2; a.push({ u: cu + r * Math.cos(t), z: cz + r * Math.sin(t) }); } return a; }
    function oval(cu, cz, ru, rz, n) { var a = []; for (var i = 0; i <= (n || 36); i++) { var t = i / (n || 36) * Math.PI * 2; a.push({ u: cu + ru * Math.cos(t), z: cz + rz * Math.sin(t) }); } return a; }

    /* 단면 속 미토콘드리아 */
    function mito(cu, cz, ru, rz) {
      poly(oval(cu, cz, ru, rz), true);
      var c = F(cu, cz), g = ctx.createRadialGradient(c.x - 6, c.y - 4, 2, c.x, c.y, ru * .6);
      g.addColorStop(0, "#ffd29a"); g.addColorStop(1, "#e08a3c"); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = "#a8551c"; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.strokeStyle = "rgba(150,70,20,.75)"; ctx.lineWidth = 1.2;
      for (var k = -2; k <= 2; k++) {
        var uu = cu + k * ru * .32;
        poly([{ u: uu, z: cz - rz * .75 }, { u: uu + ru * .08, z: cz }, { u: uu, z: cz + rz * .75 }]); ctx.stroke();
      }
    }

    function drawCell() {
      var lp = Math.sin(ph * 2.2) * 1.2;                /* 리보솜 살짝 들썩임 */
      K.studio(ctx, 0, 0, W, DH, { x: 600, y: 410, rx: 300, ry: 40 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();

      /* 블록 세 면 */
      var a = I.P(0, 0, Z), c2 = I.P(L, D, Z);
      var tg = ctx.createLinearGradient(a.x, a.y, c2.x, c2.y); tg.addColorStop(0, "#fbe6e0"); tg.addColorStop(1, "#f0c4ba");
      I.plane(ctx, Z, tg, "rgba(160,90,80,.35)");
      I.quad(ctx, I.P(L, 0, 0), I.P(L, D, 0), I.P(L, D, Z), I.P(L, 0, Z), "#cf8f86");
      var fa = F(0, Z), fb = F(0, 0), fg = ctx.createLinearGradient(fa.x, fa.y, fb.x, fb.y + 60);
      fg.addColorStop(0, "#f8d8d1"); fg.addColorStop(1, "#e6aaa1");
      I.quad(ctx, F(0, 0), F(L, 0), F(L, Z), F(0, Z), fg);

      /* 윗면: 세포질 속에 흩어진 것들 */
      var R = K.rng(41), i;
      for (i = 0; i < 70; i++) { var q = I.P(R() * L, R() * D, Z); ctx.fillStyle = "rgba(120,70,150," + (.25 + R() * .25).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(q.x, q.y, 1.3, 0, 6.283); ctx.fill(); }
      [[100, 40], [420, 66], [590, 30]].forEach(function (m) {
        var q = I.P(m[0], m[1], Z); ctx.save(); ctx.translate(q.x, q.y); ctx.scale(1, .55); ctx.rotate(.5);
        var g = ctx.createRadialGradient(-4, -3, 1, 0, 0, 16); g.addColorStop(0, "#ffd29a"); g.addColorStop(1, "#e08a3c");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 17, 8, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = "#a8551c"; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
      });
      /* 윗면 아래로 비치는 핵 */
      var nt = I.P(NU, D - 55, Z); ctx.fillStyle = "rgba(150,120,210,.20)"; ctx.beginPath(); ctx.ellipse(nt.x, nt.y, 46, 22, 0, 0, 6.283); ctx.fill();

      /* 앞면(단면) 안쪽만 */
      ctx.save(); poly([{ u: 0, z: 0 }, { u: L, z: 0 }, { u: L, z: Z }, { u: 0, z: Z }], true); ctx.clip();
      for (i = 0; i < 160; i++) { var fu = R() * L, fz = R() * Z; var fq = F(fu, fz); ctx.fillStyle = "rgba(110,60,140," + (.2 + R() * .3).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(fq.x, fq.y, 1.2, 0, 6.283); ctx.fill(); }
      mito(40, 212, 30, 13);
      mito(612, 206, 30, 13);
      mito(410, 30, 34, 12);

      /* 핵: 두 겹 핵막, 핵공, 인 */
      poly(ring(NU, NZ, NR + 3), true); ctx.fillStyle = "rgba(120,80,170,.35)"; ctx.fill();
      poly(ring(NU, NZ, NR), true);
      var nc = F(NU, NZ), ng = ctx.createRadialGradient(nc.x - 10, nc.y - 10, 4, nc.x, nc.y, 48);
      ng.addColorStop(0, "#d9cbf2"); ng.addColorStop(1, "#a993d8"); ctx.fillStyle = ng; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#5b3f9a"; poly(ring(NU, NZ, NR + 3)); ctx.stroke(); poly(ring(NU, NZ, NR)); ctx.stroke();
      var pa = Math.atan2(PORE.z - NZ, PORE.u - NU);
      [pa, pa + 1.9, pa + 3.3, pa - 1.5].forEach(function (t, k) {      /* 핵공(핵막의 구멍) */
        var p1 = F(NU + (NR - 2) * Math.cos(t), NZ + (NR - 2) * Math.sin(t));
        ctx.fillStyle = k === 0 ? "#ffe9a8" : "#f2e6ff"; ctx.strokeStyle = "#5b3f9a"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(p1.x, p1.y, k === 0 ? 4.6 : 3.2, 0, 6.283); ctx.fill(); ctx.stroke();
      });
      var nl = F(NU - 30, NZ + 34); ctx.fillStyle = "rgba(90,60,150,.55)"; ctx.beginPath(); ctx.ellipse(nl.x, nl.y, 14, 10, -.4, 0, 6.283); ctx.fill();

      /* DNA 이중 나선(핵 안에만) */
      ctx.save(); poly(ring(NU, NZ, NR - 3), true); ctx.clip();
      for (var sgn = -1; sgn <= 1; sgn += 2) {
        var pts = []; for (var u = NU - NR; u <= NU + NR; u += 2) pts.push({ u: u, z: NZ - 12 + sgn * 8 * Math.sin(u / 8) });
        ctx.strokeStyle = sgn < 0 ? "#2d4fa3" : "#c43d6e"; ctx.lineWidth = 2.4; poly(pts); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(60,60,110,.45)"; ctx.lineWidth = 1;
      for (u = NU - NR; u <= NU + NR; u += 5) { if (Math.abs(u - POL.u) < 10) continue; var r1 = F(u, NZ - 12 - 8 * Math.sin(u / 8)), r2 = F(u, NZ - 12 + 8 * Math.sin(u / 8)); ctx.beginPath(); ctx.moveTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.stroke(); }
      ctx.restore();

      /* mRNA: 중합 효소에서 나와 핵공을 지나 세포질로 */
      ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 5.5; poly(PATH); ctx.stroke();
      ctx.strokeStyle = "#0e9b88"; ctx.lineWidth = 3; poly(PATH); ctx.stroke(); ctx.restore();
      /* 코돈 아홉 칸: 읽은 칸은 밝게 */
      for (i = 0; i <= 9; i++) {
        var cu = M0 + i * MS, t1 = F(cu, mz(cu) - 5), t2 = F(cu, mz(cu) + 5);
        ctx.strokeStyle = "#0b6e61"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.stroke();
      }
      for (i = 0; i < Math.min(rib, 9); i++) {
        var seg = []; for (var su = M0 + i * MS; su <= M0 + (i + 1) * MS; su += 4) seg.push({ u: su, z: mz(su) });
        ctx.strokeStyle = "rgba(95,240,220,.9)"; ctx.lineWidth = 4.5; poly(seg); ctx.stroke();
      }
      /* 정보가 흐르는 방향: 길을 따라 움직이는 빛 */
      var n = PATH.length;
      for (var k2 = 0; k2 < 3; k2++) {
        var idx = Math.floor((((ph * .12) + k2 / 3) % 1) * (n - 1)), pp = F(PATH[idx].u, PATH[idx].z);
        K.glow(ctx, pp.x, pp.y, 3.2, "rgba(120,255,230,.95)", 2.6);
      }

      /* RNA 중합 효소 */
      var pc = F(POL.u, POL.z), pg = ctx.createRadialGradient(pc.x - 3, pc.y - 4, 1, pc.x, pc.y, 13);
      pg.addColorStop(0, "#b6f0c8"); pg.addColorStop(1, "#2f9a5e"); ctx.fillStyle = pg;
      ctx.beginPath(); ctx.ellipse(pc.x, pc.y, 12, 9, -.5, 0, 6.283); ctx.fill(); ctx.strokeStyle = "#1d6b40"; ctx.lineWidth = 1.2; ctx.stroke();

      /* 폴리펩타이드: 새 아미노산이 리보솜 옆에 붙고, 먼저 붙은 것이 멀리 밀려난다 */
      var ru = ribU(rib), rz = mz(ru), chainEnd = null;
      for (var j = rib; j >= 1; j--) {
        var kk = rib - j + 1;                       /* 1 = 방금 붙은 것 */
        var bu = ru - 14 * kk + 6 * Math.sin(kk * 1.3), bz = rz + 24 + 6.4 * kk;
        var bp = F(bu, bz);
        if (kk > 1) { var prv = F(ru - 14 * (kk - 1) + 6 * Math.sin((kk - 1) * 1.3), rz + 24 + 6.4 * (kk - 1)); ctx.strokeStyle = "#b5481f"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(prv.x, prv.y); ctx.lineTo(bp.x, bp.y); ctx.stroke(); }
        K.planet(ctx, bp.x, bp.y, 5.4, "#ff9a5a", "#b5481f");
        if (j === 1) chainEnd = { u: bu, z: bz };
      }
      /* 리보솜: 큰 단위체(위)·작은 단위체(아래)가 mRNA를 물고 있다 */
      var rp = F(ru, rz), al = rib > 0 ? 1 : .55;
      ctx.globalAlpha = al;
      K.planet(ctx, rp.x + 1, rp.y - 9 + lp, 15, "#f6c565", "#b77a1c");
      ctx.save(); ctx.translate(rp.x, rp.y + 7 - lp * .5); ctx.scale(1, .62); K.planet(ctx, 0, 0, 12, "#f3d28c", "#b58a2c"); ctx.restore();
      ctx.globalAlpha = 1;
      ctx.restore();                                /* 앞면 자르기 끝 */

      I.edges(ctx, Z, Z);
      /* 윗면·앞면 경계 밝은 선 */
      var e1 = F(0, Z), e2 = F(L, Z); ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(e1.x, e1.y); ctx.lineTo(e2.x, e2.y); ctx.stroke();

      /* 이름표 */
      var bx = [0, W];
      I.label(ctx, 110, D, 180, "핵 — DNA 원본은 여기 머문다", -70, -8, "#e8ecff", bx);
      I.label(ctx, POL.u, D, POL.z, "RNA 중합 효소 — 전사", -150, 34, "#b6f0c8", bx);
      I.label(ctx, PORE.u, D, PORE.z, "핵공 — 핵막의 구멍", -60, 80, "#ffe9a8", bx);
      I.label(ctx, 380, D, mz(380), "mRNA — DNA를 본뜬 복사본", -40, 80, "#7ff5e2", bx);
      I.label(ctx, ru, D, rz - 6, rib > 0 ? "리보솜 — 번역" : "리보솜 — 아직 읽기 전", 18, 78, "#ffd36b", bx);
      if (chainEnd) I.label(ctx, chainEnd.u, D, chainEnd.z, "폴리펩타이드 — 아미노산 " + rib + "개", 50, -62, "#ffb08a", bx);
      I.label(ctx, 600, D, 218, "미토콘드리아 — ATP 공급", 34, 62, "#ffd29a", bx);

      /* 큰 글자 · 상태 */
      if (rib === 0) { K.bigText(ctx, "설계도를 읽기 전", 22, 52, 28, "#ffffff"); K.bigText(ctx, "mRNA가 핵공을 지나 나왔다", 22, 86, 18, "#7ff5e2"); }
      else if (rib < 9) { K.bigText(ctx, "리보솜이 mRNA를 읽는다", 22, 52, 28, "#ffffff"); K.bigText(ctx, "코돈 " + rib + "개 → 아미노산 " + rib + "개", 22, 86, 19, "#ffd36b"); }
      else { K.bigText(ctx, "β 사슬 첫 아홉 자리 완성", 22, 52, 28, "#ffd36b"); K.bigText(ctx, "실제 사슬은 146개까지 이어진다", 22, 86, 18, "#ffffff"); }
      K.warn(ctx, W - 14, 30, "⚠ 세포 속 구조의 크기·개수는 보기 쉽게 과장", "right");
      pill(ctx, "🩸 적혈구가 되기 전의 세포 — 헤모글로빈을 만드는 중", 22, 428, { s: 11.5, c: "#e8ecff" });
      ctx.restore();
    }

    /* 아래: 염기 서열 읽기판 (예전 그림 그대로) — 따로 그린 뒤 모형 아래에 붙인다 */
    var off = document.createElement("canvas"), octx = null;
    function detailCtx() {
      var k = canvas.width / W, w = canvas.width, h = Math.round((H - DH) * k);
      if (!octx || off.width !== w || off.height !== h) { off.width = w; off.height = h; off._w = W; off._h = H - DH; off.id = "c-express-detail"; octx = off.getContext("2d"); }
      octx.setTransform(k, 0, 0, k, 0, 0); octx.clearRect(0, 0, W, H - DH);
      return octx;
    }
    function drawDetail() {
      var ctx = detailCtx();
      ctx.save();
      K.stage(ctx, 0, 0, W, H - DH, "night", { seed: 31 });
      var coding = "";
      for (var k = 0; k < TPL.length; k++) coding += COMP[TPL.charAt(k)];
      pill(ctx, "사람 헤모글로빈 β 유전자의 앞부분 (염기 27개)", 16, 32, { s: 13, c: v("--brand-700") });

      /* 이중 나선의 두 가닥: 염기쌍 수소 결합 */
      ctx.strokeStyle = "rgba(200,210,255,.25)"; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
      for (var hb = 0; hb < TPL.length; hb++) { ctx.beginPath(); ctx.moveTo(186 + hb * 26, 86); ctx.lineTo(186 + hb * 26, 114); ctx.stroke(); }
      ctx.setLineDash([]);
      strand(ctx, 74, TPL, function () { return "#7d8fb8"; }, "DNA 주형 가닥", -1);
      strand(ctx, 126, coding, function () { return "--cold"; }, "DNA 암호화 가닥", -1);
      ctx.save(); ctx.shadowColor = "#2ed3bd"; ctx.shadowBlur = 8; K.arrow(ctx, { x: 120, y: 148 }, { x: 120, y: 178 }, "#5ff0dc", 3, 11); ctx.restore();
      pill(ctx, "전사", 112, 168, { s: 11.5, a: "right", c: v("--teal-700") });
      strand(ctx, 196, NORMAL.mrna, function (i) { return i < rib * 3 ? "--teal" : "#4a5680"; }, "전사된 mRNA", -1);

      /* 리보솜 — 큰 단위체와 작은 단위체 */
      if (rib > 0) {
        var rx = 186 + (rib - 1) * 3 * 26 + 26;
        var rg1 = ctx.createRadialGradient(rx - 14, 168, 4, rx, 178, 60);
        rg1.addColorStop(0, "rgba(255,230,160,.75)"); rg1.addColorStop(1, "rgba(200,140,40,.35)");
        ctx.fillStyle = rg1; ctx.beginPath(); ctx.ellipse(rx, 178, 54, 22, 0, Math.PI, 0); ctx.lineTo(rx + 54, 186); ctx.lineTo(rx - 54, 186); ctx.closePath(); ctx.fill();
        var rg2 = ctx.createRadialGradient(rx - 10, 210, 3, rx, 214, 46);
        rg2.addColorStop(0, "rgba(255,230,160,.65)"); rg2.addColorStop(1, "rgba(200,140,40,.3)");
        ctx.fillStyle = rg2; ctx.beginPath(); ctx.ellipse(rx, 210, 46, 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,218,124,.8)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(rx, 178, 54, 22, 0, Math.PI, 0); ctx.stroke();
        pill(ctx, "리보솜", rx, 240, { s: 11, a: "center", c: v("--amber-700") });
      }

      /* 코돈 · 아미노산 */
      text(ctx, "코돈 → 아미노산", 16, 292, { s: 11.5, w: "800", c: v("--mist") });
      for (var i = 0; i < 9; i++) {
        var bx = 173 + i * 78, on = i < rib;
        glass(ctx, bx, 262, 72, 56, on ? "--violet" : "#8fa6ff", 10);
        if (on) { ctx.save(); ctx.strokeStyle = v("--violet"); ctx.shadowColor = v("--violet"); ctx.shadowBlur = 8; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(bx, 262, 72, 56, 10); ctx.stroke(); ctx.restore(); }
        text(ctx, NORMAL.codons[i], bx + 36, 284, { s: 12, w: "800", a: "center", c: on ? v("--violet-700") : v("--mist") });
        text(ctx, on ? NORMAL.aas[i] : "—", bx + 36, 306, { s: 12.5, w: "900", a: "center", c: on ? v("--ink") : v("--mist") });
      }

      /* 완성된 사슬 */
      text(ctx, "만들어진 폴리펩타이드", 16, 356, { s: 11.5, w: "800", c: v("--mist") });
      for (var j = 0; j < rib; j++) {
        var cx = 200 + j * 62;
        if (j > 0) { ctx.save(); ctx.shadowColor = "#ff9d63"; ctx.shadowBlur = 8; ctx.strokeStyle = "#ffb08a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 62 + 18, 352); ctx.lineTo(cx - 18, 352); ctx.stroke(); ctx.restore(); }
        ball(ctx, cx, 352, 17, "--teal");
        text(ctx, NORMAL.aas[j], cx + 1, 356, { s: 10.5, w: "900", a: "center", c: "#ffffff" });
      }
      if (rib === 0) text(ctx, "슬라이더를 밀면 리보솜이 코돈을 하나씩 읽습니다.", 200, 356, { s: 11.5, c: v("--mist") });

      pill(ctx, "염기 " + (rib * 3) + "개를 읽어 아미노산 " + rib + "개 — 언제나 3 : 1입니다.", 16, 400, { s: 11.5, c: v("--brand-700") });
      text(ctx, "DNA → (전사) → mRNA → (번역) → 단백질. 정보는 한 방향으로만 흐릅니다. 이것을 중심 원리라고 합니다.", 16, 424, { s: 11, c: v("--mist") });
      ctx.restore();
    }
    function paint() { ctx.clearRect(0, 0, W, H); drawCell(); drawDetail(); ctx.drawImage(off, 0, DH, W, H - DH); }

    function draw() {
      paint();
      $("c-express-info").innerHTML = rib === 0
        ? "아직 아무것도 번역하지 않았습니다. 리보솜 슬라이더를 밀거나 자동 진행 단추를 눌러 보세요."
        : "mRNA 염기 <b>" + (rib * 3) + "개</b>를 읽어 아미노산 <b>" + rib + "개</b>를 이었습니다 — <b>" + NORMAL.aas.slice(0, rib).join("-") + "</b>. " +
          (rib === 9 ? "🎉 여기까지가 헤모글로빈 β 사슬의 첫 아홉 자리입니다. 실제 β 사슬은 이런 식으로 <b>146개</b>까지 이어집니다."
            : "코돈은 염기 <b>3개</b>가 아미노산 <b>1개</b>를 지정합니다.");
      if (rib === 9 && !got.a) { got.a = true; window.sthState("exprGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.a && got.b) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>전사는 <b>DNA를 본떠 mRNA를 만드는 일</b>, 번역은 <b>코돈 세 글자를 아미노산 하나로 바꾸는 일</b>이었습니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("c-rib").addEventListener("input", function (e) { rib = +e.target.value; $("c-rib-val").textContent = rib; draw(); });
    $("c-play").addEventListener("click", function () {
      run(9, 340, function (u) {
        rib = Math.min(9, Math.round(u * 9));
        var s = $("c-rib"); s.value = String(rib); $("c-rib-val").textContent = rib;
        draw();
      });
    });
    /* 움직임(정보가 흐르는 빛·리보솜 들썩임) — 그림만 다시 그린다 */
    playBtn("c-expr-anim", "⏸ 움직임 멈추기", "▶ 움직임 보기", function () { return moving; }, function (q) { moving = q; });
    K.animate(canvas, function (dt) { if (moving) { ph += dt / 1000; ctx.clearRect(0, 0, W, DH); drawCell(); } }, 24);
    window.sthPick({
      mount: "s3-q1",
      q: "전사와 번역에 대한 설명으로 <b>옳은</b> 것은?",
      options: ["전사는 mRNA를 본떠 DNA를 만드는 일이다", "번역은 코돈 한 글자가 아미노산 하나를 지정하는 일이다", "전사로 만들어진 mRNA의 염기 3개가 아미노산 1개를 지정한다", "단백질의 아미노산 수와 mRNA의 염기 수는 같다"],
      answer: 2,
      why: ["방향이 반대입니다. <b>DNA를 본떠 mRNA</b>를 만드는 일이 전사입니다.",
        "한 글자가 아니라 <b>세 글자(코돈)</b>가 아미노산 하나를 지정합니다.",
        "맞습니다. 염기 3개가 모여 <b>코돈</b> 하나를 이루고, 코돈 하나가 아미노산 하나를 지정합니다. 화면에서 3 : 1로 세어 보았습니다.",
        "염기 수는 아미노산 수의 <b>약 3배</b>입니다. 여기에 정지 코돈까지 더해집니다."],
      onDone: function () { got.b = true; window.sthState("exprGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 3 — 한 글자 바꾸기 ---------------------------------------------- */
  (function () {
    var canvas = $("c-mut"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var pos = 20, base = null;
    var got = window.sthState("mutGot") || { a: false, b: false, c: false };

    function seq() {
      if (!base) return TPL;
      return TPL.slice(0, pos - 1) + base + TPL.slice(pos);
    }
    var BCOL = { A: "#e8590c", T: "#f59f00", U: "#f59f00", G: "#0f9f76", C: "#1c7ed6" };
    /* 염기 한 칸 = 작은 입체 블록 */
    function tile(x, y, w, h, b, hi) {
      var c = BCOL[b] || "#8a96a8", dz = 5;
      ctx.fillStyle = "rgba(20,30,50,.16)"; ctx.fillRect(x + 3, y + h - 1, w, 4);
      ctx.fillStyle = K.tint(c, 1.25); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dz, y - dz); ctx.lineTo(x + w + dz, y - dz); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = K.tint(c, .7); ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + dz, y - dz); ctx.lineTo(x + w + dz, y + h - dz); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
      var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, K.tint(c, 1.08)); g.addColorStop(1, K.tint(c, .86));
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      if (hi) { ctx.save(); ctx.strokeStyle = "#e03131"; ctx.lineWidth = 2.6; ctx.shadowColor = "#e03131"; ctx.shadowBlur = 10; ctx.strokeRect(x - 2, y - 2, w + 4, h + 4); ctx.restore(); }
      lt(ctx, b, x + w / 2, y + h - 7, { s: 12, w: "900", a: "center", c: "#ffffff" });
    }
    function strandRow(y, sq, hiIdx, name) {
      lt(ctx, name, 14, y + 17, { s: 11, w: "800", c: LT.mute });
      for (var i = 0; i < sq.length; i++) tile(76 + i * 19.5, y, 16, 22, sq.charAt(i), i === hiIdx);
    }
    var AAC = { Met: "#7048e8", Val: "#e03131", His: "#1c7ed6", Leu: "#0c8599", Thr: "#0f9f76", Pro: "#e8590c", Glu: "#f59f00", Lys: "#c2255c" };
    function aaRow(y, codons, aas, ref, label, stopped) {
      lt(ctx, label, 14, y + 4, { s: 11.5, w: "800", c: LT.mute });
      var i, nA = 0;
      while (nA < 9 && aas[nA] !== undefined) nA++;
      if (nA > 1) bond(ctx, 100, y, 100 + (nA - 1) * 58, y, 4);
      for (i = 0; i < 9; i++) {
        var x = 100 + i * 58, cdn = codons[i], aa = aas[i], diff = ref && (cdn !== ref.codons[i] || aa !== ref.aas[i]);
        lt(ctx, cdn === undefined ? "—" : cdn, x, y - 25, { s: 10.5, w: "800", a: "center", c: diff ? LT.red : LT.mute });
        if (aa === undefined) { if (stopped && i === codons.length - 1) lp(ctx, "정지", x, y + 4, { s: 11, a: "center", c: LT.red }); continue; }
        atom(ctx, x, y, 18, AAC[aa] || "#8a96a8");
        if (diff) { ctx.save(); ctx.strokeStyle = "#e03131"; ctx.lineWidth = 2.4; ctx.shadowColor = "#e03131"; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, 21, 0, 6.2832); ctx.stroke(); ctx.restore(); }
        lt(ctx, aa, x, y + 4, { s: 10, w: "900", a: "center", c: "#ffffff" });
      }
    }
    /* 적혈구: 가운데가 눌린 원반 또는 낫 모양 */
    function rbc(x, y, sick) {
      shadowE(ctx, x + 4, y + 30, 46, 8, .25);
      if (!sick) {
        var g = ctx.createRadialGradient(x - 12, y - 10, 4, x, y, 44); g.addColorStop(0, "#ff8787"); g.addColorStop(1, "#a51111");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 44, 24, 0, 0, 6.2832); ctx.fill();
        var g2 = ctx.createRadialGradient(x + 4, y + 3, 2, x, y, 22); g2.addColorStop(0, "#8f1010"); g2.addColorStop(1, "rgba(200,40,40,0)");
        ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(x, y, 24, 11, 0, 0, 6.2832); ctx.fill();
      } else {
        var g3 = ctx.createLinearGradient(x - 40, y - 20, x + 40, y + 20); g3.addColorStop(0, "#ff8787"); g3.addColorStop(1, "#8f1010");
        ctx.fillStyle = g3; ctx.beginPath(); ctx.moveTo(x - 48, y + 6); ctx.quadraticCurveTo(x, y - 46, x + 48, y + 6); ctx.quadraticCurveTo(x, y - 14, x - 48, y + 6); ctx.closePath(); ctx.fill();
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var s = seq(), o = express(s), changed = !!base && base !== TPL.charAt(pos - 1);
      var coding = "", k;
      for (k = 0; k < s.length; k++) coding += COMP[s.charAt(k)];
      var kind, tone, msg;
      if (!changed) { kind = "바뀐 곳 없음"; tone = "--mist"; msg = "자리를 고르고 아래 염기 단추를 눌러 한 글자를 바꿔 보세요."; }
      else if (o.stopped) { kind = "정지 코돈이 생김"; tone = "--rose"; msg = "단백질이 아미노산 " + o.aas.length + "개에서 <b>끊겼습니다.</b> 제구실을 하는 단백질이 만들어지지 못합니다."; }
      else if (o.aas.join("-") === NORMAL.aas.join("-")) { kind = "아미노산 서열 그대로"; tone = "--teal"; msg = "염기는 바뀌었는데 <b>아미노산은 그대로</b>입니다. 같은 아미노산을 가리키는 코돈이 여럿이기 때문입니다."; }
      else {
        var idx = 0;
        for (var j = 0; j < 9; j++) if (o.aas[j] !== NORMAL.aas[j]) { idx = j; break; }
        kind = (idx + 1) + "번째 아미노산이 바뀜";
        tone = o.aas[6] === "Val" ? "--rose" : "--amber";
        msg = (KOR[NORMAL.aas[idx]] || NORMAL.aas[idx]) + "(" + NORMAL.aas[idx] + ")이 " + (KOR[o.aas[idx]] || o.aas[idx]) + "(" + o.aas[idx] + ")로 바뀌었습니다." +
          (idx === 6 && o.aas[6] === "Val" ? " <b>바로 이것이 낫 모양 적혈구 빈혈증입니다.</b>" : "");
      }
      var TC = { "--mist": LT.mute, "--rose": LT.red, "--teal": LT.green, "--amber": LT.orange }[tone];
      var LW = 620, hi = changed ? pos - 1 : -1;
      K.studio(ctx, 0, 0, LW, H);
      K.bigText(ctx, changed ? pos + "번째 " + TPL.charAt(pos - 1) + " → " + base : "정상 서열", 18, 44, 26, changed ? "#ffb0b0" : "#ffffff");
      K.bigText(ctx, kind, 18, 72, 16, "#ffd35a");
      strandRow(96, s, hi, "주형 가닥");
      strandRow(132, coding, -1, "암호화 가닥");
      K.arrow(ctx, { x: 600, y: 160 }, { x: 600, y: 180 }, LT.teal, 2, 8);
      lt(ctx, "전사", 594, 174, { s: 10.5, w: "800", a: "right", c: LT.teal });
      strandRow(186, o.mrna, hi, "mRNA");
      aaRow(270, NORMAL.codons, NORMAL.aas, null, "정상", false);
      aaRow(352, o.codons, o.aas, NORMAL, "지금", o.stopped);
      lt(ctx, "윗줄 글자 = 코돈 · 공 하나 = 아미노산", 18, 420, { s: 11, w: "700", c: LT.mute });
      lt(ctx, "같은 아미노산을 가리키는 코돈이 여럿이라 아무 일이 없기도 합니다.", 18, 440, { s: 11, w: "600", c: LT.mute });
      /* 판정 카드 */
      var RX = LW + 10, p0 = RX + 18, p1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "판정");
      K.t(ctx, kind, p0, 62, { s: kind.length > 10 ? 16 : 19, w: "900", c: TC });
      K.row(ctx, "바꾼 자리", changed ? pos + "번째" : "—", p0, p1, 98);
      K.row(ctx, "염기", changed ? TPL.charAt(pos - 1) + " → " + base : "그대로", p0, p1, 124, changed ? LT.red : LT.ink);
      K.row(ctx, "아미노산 수", o.aas.length + " / 9", p0, p1, 150, o.stopped ? LT.red : LT.ink);
      K.row(ctx, "7번째 아미노산", o.aas[6] || "없음", p0, p1, 176, o.aas[6] === "Val" ? LT.red : LT.ink);
      var sick = !o.stopped && o.aas[6] === "Val";
      rbc((RX + W) / 2, 248, sick);
      lt(ctx, sick ? "낫 모양 적혈구" : (o.stopped ? "헤모글로빈이 끊김" : "가운데가 눌린 원반"), (RX + W) / 2, 306, { s: 12, w: "900", a: "center", c: sick || o.stopped ? LT.red : LT.green });
      K.tip(ctx, !changed ? "한 글자를 바꿔 보세요" : (o.stopped ? "단백질이 도중에 끊깁니다" : (tone === "--teal" ? "아미노산 서열은 그대로" : "단백질 하나가 달라집니다")), p0 - 4, 326, p1 - p0 + 8, !changed ? null : tone === "--teal");
      K.t(ctx, "아미노산 " + o.aas.length + "개", p0, 388, { s: 11.5, w: "800", c: LT.ink });
      K.t(ctx, o.aas.length ? o.aas.slice(0, 5).join("-") : "없음", p0, 408, { s: 11, w: "700", c: LT.mute });
      if (o.aas.length > 5) K.t(ctx, o.aas.slice(5).join("-"), p0, 426, { s: 11, w: "700", c: LT.mute });

      $("c-mut-info").innerHTML = (changed ? "주형 가닥 <b>" + pos + "번째</b> 염기를 <b>" + TPL.charAt(pos - 1) + " → " + base + "</b>로 바꿨습니다. " : "") + msg;
      check(o, changed);
    }
    function check(o, changed) {
      var ch = false;
      if (changed && !o.stopped && o.aas[6] === "Val" && !got.a) { got.a = true; window.sthState("mutPos", pos + "번째 " + TPL.charAt(pos - 1) + "→" + base); ch = true; }
      if (changed && !o.stopped && o.aas.join("-") === NORMAL.aas.join("-") && !got.b) { got.b = true; ch = true; }
      if (changed && o.stopped && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("mutGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (got.c) done("m3-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>같은 ‘한 글자’인데 결과는 셋이었습니다 — <b>아무 일 없음 · 아미노산 하나 바뀜 · 단백질이 끊김.</b>");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-pos").addEventListener("input", function (e) {
      pos = +e.target.value; base = null; $("c-pos-val").textContent = pos; draw();
    });
    ["A", "T", "G", "C"].forEach(function (b) {
      $("c-b" + b).addEventListener("click", function () { base = b; draw(); });
    });
    draw(); mission();
  })();

  /* 장면 4 — 30억 분의 1,600 --------------------------------------------- */
  (function () {
    var canvas = $("c-scale"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var TOTAL = 3.1e9, CHR11 = 1.35e8, GENE = 1600, CODING = 441, BARW = 800, X0 = 60;
    var zoom = 0;
    var got = window.sthState("scaleGot") || { a: false, b: false, c: false };

    function mag() { return Math.pow(10, zoom / 10); }
    function bpPerPx() { return TOTAL / mag() / BARW; }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var bpp = bpPerPx(), view = bpp * BARW;
      var genePx = GENE / bpp, codonPx = 3 / bpp, basePx = 1 / bpp;
      K.studio(ctx, 0, 0, W, H, { x: 160, y: 392, rx: 150, ry: 22 });
      K.bigText(ctx, "배율 × " + sci(mag()), 18, 46, 27, "#ffffff");
      K.bigText(ctx, "화면 한 줄 = " + sci(view) + " 염기쌍", 18, 74, 16, "#ffd35a");
      K.warn(ctx, W - 16, 30, "⚠ 나선·염색체 모형은 크기 비율이 아님", "right");
      /* 자 — 유리 막대 속 DNA (약 10.5 염기쌍마다 한 바퀴) */
      var barY = 112, bh = 48, dd = 12;
      ctx.fillStyle = "rgba(20,30,50,.16)"; ctx.beginPath(); ctx.ellipse(X0 + BARW / 2 + 10, barY + bh + 10, BARW / 2 + 20, 9, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#e3eefa"; ctx.beginPath(); ctx.moveTo(X0, barY); ctx.lineTo(X0 + dd, barY - dd * .7); ctx.lineTo(X0 + BARW + dd, barY - dd * .7); ctx.lineTo(X0 + BARW, barY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#9fb9d6"; ctx.beginPath(); ctx.moveTo(X0 + BARW, barY); ctx.lineTo(X0 + BARW + dd, barY - dd * .7); ctx.lineTo(X0 + BARW + dd, barY + bh - dd * .7); ctx.lineTo(X0 + BARW, barY + bh); ctx.closePath(); ctx.fill();
      var fg = ctx.createLinearGradient(0, barY, 0, barY + bh); fg.addColorStop(0, "#f4f9ff"); fg.addColorStop(1, "#c6daf0");
      ctx.fillStyle = fg; ctx.fillRect(X0, barY, BARW, bh);
      var per = 10.5 * basePx;
      ctx.save(); ctx.beginPath(); ctx.rect(X0, barY, BARW, bh); ctx.clip();
      if (per >= 6 && basePx < 14) {
        for (var sgi = 0; sgi < 2; sgi++) {
          ctx.strokeStyle = sgi ? LT.orange : LT.blue; ctx.lineWidth = 2.2; ctx.beginPath();
          for (var hx = 0; hx <= BARW; hx += 2) { var hy = barY + bh / 2 + Math.sin(hx / per * Math.PI * 2 + sgi * Math.PI) * 16; if (hx === 0) ctx.moveTo(X0 + hx, hy); else ctx.lineTo(X0 + hx, hy); }
          ctx.stroke();
        }
      } else if (per < 6) {
        ctx.fillStyle = "rgba(28,126,214,.22)"; for (var st = 0; st < BARW; st += 4) ctx.fillRect(X0 + st, barY + 8 + (st % 8 ? 0 : 2), 1, bh - 16);
      }
      if (basePx >= 14) {
        var nShow = Math.min(TPL.length, Math.floor(BARW / basePx) + 1), BC = { A: "#e8590c", T: "#f59f00", G: "#0f9f76", C: "#1c7ed6" };
        for (var i = 0; i < nShow; i++) {
          var bxx = X0 + (BARW - nShow * basePx) / 2 + i * basePx;
          ctx.fillStyle = BC[TPL.charAt(i)] || LT.blue; ctx.globalAlpha = .75;
          ctx.fillRect(bxx + 1, barY + 5, Math.max(basePx - 2, 2), bh - 10); ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
      if (basePx >= 22) {
        for (var q = 0; q < Math.min(TPL.length, Math.floor(BARW / basePx) + 1); q++) {
          var nS = Math.min(TPL.length, Math.floor(BARW / basePx) + 1), tx = X0 + (BARW - nS * basePx) / 2 + q * basePx + basePx / 2;
          if (tx < X0 + 8 || tx > X0 + BARW - 8) continue;
          lt(ctx, TPL.charAt(q), tx, barY + 30, { s: 15, w: "900", a: "center", c: "#ffffff" });
        }
      }
      ctx.strokeStyle = "rgba(90,110,140,.6)"; ctx.lineWidth = 1.2; ctx.strokeRect(X0, barY, BARW, bh);
      /* 유전자 표시 */
      var gw = Math.max(genePx, 0.7), gx = X0 + BARW / 2 - gw / 2;
      if (gw < 6) K.glow(ctx, X0 + BARW / 2, barY + bh / 2, 4, "rgba(240,60,120,.9)", 4);
      ctx.save(); ctx.shadowColor = "#f03e7a"; ctx.shadowBlur = 10; ctx.fillStyle = "rgba(240,62,122,.45)";
      ctx.fillRect(clamp(gx, X0, X0 + BARW), barY - 6, clamp(gw, 0.7, BARW), bh + 12); ctx.restore();
      ctx.strokeStyle = "#c2255c"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X0 + BARW / 2, barY - 6); ctx.lineTo(X0 + BARW / 2, barY - 14); ctx.stroke();
      lp(ctx, "헤모글로빈 β 유전자 (약 1,600 염기쌍) — 화면에서 " + (genePx < 1 ? genePx.toFixed(3) : genePx.toFixed(1)) + " px", X0 + BARW / 2, barY - 20, { s: 11.5, a: "center", c: "#c2255c" });
      lt(ctx, "0", X0, barY + bh + 18, { s: 10.5, c: LT.mute });
      lt(ctx, sci(view) + " 염기쌍", X0 + BARW, barY + bh + 18, { s: 10.5, a: "right", c: LT.mute });
      /* 아래 왼쪽: 염색체와 이중 나선 미니어처 */
      function arm(x1, y1, x2, y2) {
        ctx.lineCap = "round"; ctx.strokeStyle = "#6741d9"; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = "#9775fa"; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(x1 - 2, y1 - 2); ctx.lineTo(x2 - 2, y2 - 2); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x1 - 5, y1 - 4); ctx.lineTo(x2 - 5, y2 - 4); ctx.stroke(); ctx.lineCap = "butt";
      }
      var cx = 112, cy = 300;
      shadowE(ctx, cx + 8, 384, 70, 12, .25);
      arm(cx - 26, cy - 62, cx, cy - 6); arm(cx + 26, cy - 62, cx, cy - 6); arm(cx, cy - 6, cx - 34, cy + 70); arm(cx, cy - 6, cx + 34, cy + 70);
      ctx.strokeStyle = "rgba(40,20,90,.45)"; ctx.lineWidth = 3;
      [[-.3, -.7], [.62, .4], [-.62, .4], [.3, -.7], [-.85, .85], [.85, .85]].forEach(function (b) { var bx = cx + b[0] * 34, by = cy + (b[1] < 0 ? b[1] * 62 : b[1] * 66); ctx.beginPath(); ctx.moveTo(bx - 9, by); ctx.lineTo(bx + 9, by); ctx.stroke(); });
      K.glow(ctx, cx - 23, cy - 54, 3.5, "rgba(240,60,120,.95)", 3.2);
      callout(ctx, "11번 염색체 · β 유전자 자리", cx - 23, cy - 54, cx + 52, cy - 84, "#ffd0e0", [0, 600]);
      /* 이중 나선 */
      var hx0 = 250, hx1 = 580, hyc = 300, amp = 30, rungs = 22, k;
      shadowE(ctx, (hx0 + hx1) / 2, 372, (hx1 - hx0) / 2 + 20, 10, .2);
      var BCL = ["#e8590c", "#f59f00", "#0f9f76", "#1c7ed6"];
      for (k = 0; k <= rungs; k++) {
        var ux2 = hx0 + (hx1 - hx0) * k / rungs, ph2 = k / 10.5 * Math.PI * 2, ya = hyc - Math.sin(ph2) * amp, yb = hyc + Math.sin(ph2) * amp;
        ctx.strokeStyle = BCL[k % 4]; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(ux2, ya); ctx.lineTo(ux2, (ya + yb) / 2); ctx.stroke();
        ctx.strokeStyle = BCL[(k + 2) % 4]; ctx.beginPath(); ctx.moveTo(ux2, (ya + yb) / 2); ctx.lineTo(ux2, yb); ctx.stroke();
      }
      for (k = 0; k <= rungs; k++) {
        var ux3 = hx0 + (hx1 - hx0) * k / rungs, ph3 = k / 10.5 * Math.PI * 2, zf = Math.cos(ph3);
        var r1 = 5 + zf * 1.6, r2 = 5 - zf * 1.6;
        K.planet(ctx, ux3, hyc - Math.sin(ph3) * amp, r1, "#74c0fc", "#1864ab");
        K.planet(ctx, ux3, hyc + Math.sin(ph3) * amp, r2, "#ffa94d", "#b8560f");
      }
      lp(ctx, "이중 나선 · 약 10.5 염기쌍에 한 바퀴", (hx0 + hx1) / 2, 252, { s: 11.5, a: "center", c: LT.blue, box: [0, 600] });
      lp(ctx, "DNA 전체를 400 m 트랙에 펼치면 이 유전자는 0.2 mm 점", 18, 404, { s: 11.5, c: "#c2255c", box: [0, 600] });
      lt(ctx, "전사는 이 점 하나만 본떠 RNA를 만드는 일입니다.", 18, 424, { s: 11, w: "600", c: LT.mute });
      /* 판정 카드 */
      var RX = 612, p0 = RX + 18, p1 = W - 18;
      K.card(ctx, RX, 186, W - RX - 8, H - 192, "자로 재 본 값");
      K.row(ctx, "DNA 전체", "약 31억 염기쌍", p0, p1 - 8, 238);
      K.row(ctx, "11번 염색체", "약 1억 3,500만", p0, p1 - 8, 263);
      K.row(ctx, "β 유전자", "약 1,600 염기쌍", p0, p1 - 8, 288);
      K.row(ctx, "아미노산 지정 부분", CODING + " 염기", p0, p1 - 8, 313);
      K.row(ctx, "화면 속 유전자 폭", (genePx < 1 ? genePx.toFixed(3) : genePx.toFixed(1)) + " px", p0, p1 - 8, 338, genePx >= 1 ? LT.green : LT.red);
      K.row(ctx, "화면 속 코돈 폭", (codonPx < 1 ? codonPx.toFixed(4) : codonPx.toFixed(1)) + " px", p0, p1 - 8, 363, codonPx >= 10 ? LT.green : LT.ink);
      K.tip(ctx, codonPx >= 10 ? "코돈 하나하나가 보입니다" : (genePx >= 1 ? "유전자가 보입니다 · 더 확대" : "아직 1 px도 안 됩니다"), p0 - 4, 380, p1 - p0 - 4, genePx >= 1 ? true : false);

      $("c-scale-info").innerHTML = "배율 <b>× " + sci(mag()) + "</b> · 화면 가로 한 줄이 <b>" + sci(view) + " 염기쌍</b>입니다. 이때 유전자의 폭은 <b>" + (genePx < 1 ? genePx.toFixed(3) : genePx.toFixed(1)) + " px</b>. " +
        (genePx < 1 ? "아직 머리카락보다도 가늘어 보이지도 않습니다. 더 확대해 보세요."
          : (codonPx >= 10 ? "🎉 코돈 하나하나가 보일 만큼 들어왔습니다. 여기까지 오는 데 배율이 천만 배를 넘었습니다."
            : "유전자가 드디어 눈에 띕니다. 코돈 하나가 보일 때까지 더 확대해 보세요."));
      check(genePx, codonPx);
    }
    function check(genePx, codonPx) {
      var ch = false;
      if (genePx >= 1 && !got.a) { got.a = true; ch = true; }
      if (codonPx >= 10 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("scaleGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-4a");
      if (got.b) done("m3-4b");
      if (got.c) done("m3-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>유전자 하나는 DNA 전체의 <b>약 200만 분의 1</b> 이었습니다. 전사되는 것은 그 작은 한 토막뿐입니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("c-zoom").addEventListener("input", function (e) {
      zoom = +e.target.value; $("c-zoom-val").textContent = "×" + sci(mag()); draw();
    });
    window.sthPick({
      mount: "s3-q2",
      q: "특정 유전자가 발현될 때 만들어지는 <b>RNA 분자의 크기</b>에 대한 설명으로 옳은 것은?",
      options: ["DNA 전체가 옮겨 적히므로 DNA와 크기가 거의 같다", "DNA 전체의 절반 정도 크기다", "유전자 한 토막만 옮겨 적히므로 DNA에 비해 매우 작다", "RNA가 DNA보다 오히려 크다"],
      answer: 2,
      why: ["방금 자로 재 보았습니다. 유전자 하나는 DNA 전체의 약 200만 분의 1 이었습니다.",
        "절반이 아니라 <b>수백만 분의 일</b>입니다.",
        "맞습니다. DNA 에는 수많은 유전자가 있고, 전사될 때는 <b>필요한 유전자 한 토막만</b> 본떠집니다. 그래서 만들어지는 RNA는 DNA에 비해 매우 작습니다.",
        "RNA는 유전자 한 토막을 본뜬 것이므로 DNA보다 훨씬 작습니다."],
      onDone: function () { got.c = true; window.sthState("scaleGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 -------------------------------------------------------- */
  var STEPS = [
    "DNA 주형 가닥의 염기 한 글자가 다른 염기로 바뀐다",
    "전사된 mRNA에서 그 자리의 코돈이 GAG에서 GUG로 바뀐다",
    "번역에서 리보솜이 그 코돈을 읽어 글루탐산 대신 발린을 붙인다",
    "아미노산 하나가 달라진 헤모글로빈이 서로 들러붙어 긴 막대를 이룬다",
    "막대에 밀려 적혈구가 낫처럼 길쭉하게 굳는다",
    "굳은 적혈구가 좁은 모세 혈관을 막아 통증과 숨참이 나타난다"
  ];
  function reveal() {
    $("e3-wrap").hidden = false;
    var p = window.sthState("gene") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (window.sthState("geneOK") === "맞음"
        ? "정확했습니다. 146개 가운데 단 하나였습니다."
        : "정답은 ㉡ 입니다. 철도, 영양도, 적혈구의 수도 아니었습니다. 아미노산 <b>하나</b> 였습니다.") +
      "<br><b>내가 만든 낫 모양 돌연변이</b> 주형 가닥 " + (window.sthState("mutPos") || "-");
  }
  function finish() { window.sthState("r3", "해결 · DNA 염기 한 글자가 아미노산 하나를 바꾸고 적혈구 모양까지 바꾼다"); }
  window.sthOrder({
    mount: "s3-order", steps: STEPS,
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅲ-3] 이야기 ③ 한 글자가 바뀌면",
    items: [
      { id: "w2", label: "전사에서 실제로 일어나는 일", hint: "DNA 전체가 아니라 무엇이 RNA로 옮겨지는지, 오개념 상자를 근거로 쓰세요.", ph: "" },
      { id: "e3b", label: "한 글자가 바뀌어도 아무 일이 없을 때", hint: "염기 하나가 바뀌었는데 아미노산 서열이 그대로인 경우가 왜 생기는지, 코돈표의 성질을 들어 설명하세요.", ph: "" }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅲ-3] 생명 시스템 — 정리",
  recap: [
    { key: "r1", label: "① 익지 않는 김치" },
    { key: "r2", label: "② 빠진 살은 어디로 갔을까" },
    { key: "r3", label: "③ 한 글자가 바뀌면" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "익지 않는 김치, 숨으로 빠져나간 지방, 낫 모양 적혈구. 세 이야기에는 모두 ‘단백질’이 들어 있습니다. 생명 시스템이 유지되려면 무엇이 필요한지 ‘화학 반응’과 ‘정보’라는 말을 넣어 한 문장으로 쓰세요.", ph: "" },
    { id: "rs1", label: "생활 속 화학 반응 조사·발표", hint: "생활에서 쓰는 효소·화학 반응 사례를 하나 조사하세요(예: 효소 세제, 소화제, 발효 식품, 연육제). ① 무엇이 무엇으로 바뀌는지(반응물 → 생성물) ② 가장 잘 일어나는 조건(온도·pH) ③ 어떻게 쓰이는지를 세 줄로 쓰고, 우리 반 탭에 올려 발표해 보세요.", ph: "" },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다.", ph: "" }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-3-3", unitLabel: "[통합과학1 Ⅲ-3] 생명 시스템",
  rows: [
    { key: "r1", label: "① 익지 않는 김치" },
    { key: "r2", label: "② 빠진 살은 어디로 갔을까" },
    { key: "r3", label: "③ 한 글자가 바뀌면" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
