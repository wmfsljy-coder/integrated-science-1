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
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
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
    var last = null, shown = { b: 0, f: 0 }, box = { gen: 0 }, run = ticker(box);

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
    function draw() {
      paper(ctx, W, H);
      var f = air / 100, top = 46, bot = 318;
      /* 통 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(92, top, 336, bot - top);
      ctx.globalAlpha = 0.10 + 0.45 * f; ctx.fillStyle = v("--brand"); ctx.fillRect(92, top, 336, bot - top); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.strokeRect(92, top, 336, bot - top);
      ctx.fillStyle = v("--line"); ctx.fillRect(92, bot, 336, 5);
      text(ctx, f === 0 ? "진공 (공기 0%)" : "공기 " + air + "%", 104, top + 20, { s: 12, w: "800", c: v("--brand-700") });
      text(ctx, "높이 5.0 m", 416, top + 20, { s: 11, c: v("--mist"), a: "right" });
      /* 눈금 */
      for (var k = 0; k <= 5; k++) {
        var gy = top + (bot - top - 14) * k / 5;
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1; ctx.globalAlpha = .5;
        ctx.beginPath(); ctx.moveTo(92, gy); ctx.lineTo(108, gy); ctx.stroke(); ctx.globalAlpha = 1;
        text(ctx, (5 - k) + "m", 88, gy + 4, { s: 10, c: v("--mist"), a: "right" });
      }
      /* 쇠공 · 깃털 */
      function put(x, frac, kind) {
        var y = top + 12 + (bot - top - 26) * clamp(frac, 0, 1);
        if (kind === "ball") {
          ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
          text(ctx, "쇠공 0.5 kg", x, top - 10, { s: 11, w: "800", a: "center", c: v("--violet-700") });
        } else {
          ctx.fillStyle = v("--amber"); ctx.beginPath();
          ctx.ellipse(x, y, 6, 15, 0.5, 0, Math.PI * 2); ctx.fill();
          text(ctx, "깃털 1 g", x, top - 10, { s: 11, w: "800", a: "center", c: v("--amber-700") });
        }
      }
      put(176, shown.b, "ball"); put(348, shown.f, "feather");
      /* 오른쪽 기록 */
      var tb = fallTime(VB, f), tf = fallTime(VF, f);
      text(ctx, "실험 기록", 470, 44, { s: 14, w: "900" });
      var rows = [
        ["쇠공의 종단 속도", f === 0 ? "없음(공기 없음)" : (VB / Math.sqrt(f)).toFixed(0) + " m/s"],
        ["깃털의 종단 속도", f === 0 ? "없음(공기 없음)" : (VF / Math.sqrt(f)).toFixed(1) + " m/s"],
        ["쇠공이 닿는 시각", tb.toFixed(2) + " 초"],
        ["깃털이 닿는 시각", tf.toFixed(2) + " 초"],
        ["도착 시간 차이", (tf - tb).toFixed(2) + " 초"]
      ];
      rows.forEach(function (r, i) {
        var yy = 78 + i * 30;
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(466, yy - 16, 410, 25, 8); ctx.fill();
        text(ctx, r[0], 478, yy + 1, { s: 12, c: v("--mist") });
        text(ctx, r[1], 866, yy + 1, { s: 12.5, w: "800", a: "right", c: i === 4 ? v("--coral-700") : v("--ink") });
      });
      /* 시간 막대 */
      var tmax = Math.max(tb, tf, 1.2);
      text(ctx, "도착 시각 비교", 470, 252, { s: 11.5, w: "800", c: v("--mist") });
      [[tb, "--violet", "쇠공"], [tf, "--amber", "깃털"]].forEach(function (b, i) {
        var yy = 268 + i * 26;
        ctx.fillStyle = v("--card-2"); ctx.fillRect(530, yy, 280, 14);
        ctx.fillStyle = v(b[1]); ctx.fillRect(530, yy, 280 * b[0] / tmax, 14);
        text(ctx, b[2], 522, yy + 12, { s: 11, a: "right", c: v("--mist") });
        text(ctx, b[0].toFixed(2) + "초", 818, yy + 12, { s: 11, w: "800" });
      });
      text(ctx, "빨라질수록 공기 저항이 커져 결국 일정한 속도(종단 속도)로 떨어집니다.", 62, 348, { s: 10.5, c: v("--mist") });
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
        draw();
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

    function draw() {
      paper(ctx, W, H);
      var t = Math.sqrt(2 * h / g), vEnd = g * t;
      var top = 54, bot = 336;
      /* 왼쪽: 스트로브 사진 */
      text(ctx, pname + " · g = " + g.toFixed(2) + " m/s²", 62, 32, { s: 13, w: "900", c: v("--brand-700") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(96, top); ctx.lineTo(96, bot); ctx.stroke();
      ctx.fillStyle = v("--line"); ctx.fillRect(62, bot, 300, 5);
      text(ctx, "0 m", 90, top + 4, { s: 10.5, c: v("--mist"), a: "right" });
      text(ctx, h.toFixed(1) + " m", 90, bot + 2, { s: 10.5, c: v("--mist"), a: "right" });
      var n = 8;
      for (var i = 0; i <= n; i++) {
        var tt = t * i / n, yy = 0.5 * g * tt * tt;
        var py = top + (bot - top - 12) * (yy / h);
        ctx.globalAlpha = 0.25 + 0.75 * i / n;
        ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(150, py, 11, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        if (i % 2 === 0) text(ctx, tt.toFixed(2) + "초", 170, py + 4, { s: 10.5, c: v("--mist") });
      }
      text(ctx, "같은 시간 간격으로 찍은 사진 — 간격이 점점 벌어집니다", 62, 366, { s: 10.5, c: v("--mist") });

      /* 오른쪽: 계산 */
      text(ctx, "자유 낙하 계산", 420, 32, { s: 14, w: "900" });
      var rows = [
        ["떨어진 높이 h", h.toFixed(1) + " m"],
        ["걸린 시간 t = √(2h/g)", t.toFixed(3) + " 초"],
        ["닿는 순간 속도 v = gt", vEnd.toFixed(2) + " m/s"],
        ["1초 뒤까지 떨어진 거리", (0.5 * g * 1).toFixed(2) + " m"],
        ["2초 뒤까지", (0.5 * g * 4).toFixed(2) + " m"],
        ["3초 뒤까지", (0.5 * g * 9).toFixed(2) + " m"]
      ];
      rows.forEach(function (r, i) {
        var yy = 68 + i * 34;
        ctx.fillStyle = i < 3 ? v("--brand-100") : v("--card-2");
        ctx.beginPath(); ctx.roundRect(416, yy - 18, 460, 28, 9); ctx.fill();
        text(ctx, r[0], 430, yy + 1, { s: 12, c: i < 3 ? v("--brand-700") : v("--mist") });
        text(ctx, r[1], 862, yy + 2, { s: 13, w: "800", a: "right" });
      });
      text(ctx, "1초 : 2초 : 3초 동안 떨어진 거리는 언제나 1 : 4 : 9 입니다.", 416, 300, { s: 11.5, c: v("--mist") });
      text(ctx, "질량은 식 어디에도 들어 있지 않습니다.", 416, 322, { s: 11.5, w: "800", c: v("--coral-700") });

      $("a-fall-info").innerHTML = "<b>" + pname + "</b>에서 <b>" + h.toFixed(1) + " m</b> 높이에서 놓으면 <b>" + t.toFixed(2) + "초</b> 뒤 <b>" + vEnd.toFixed(1) + " m/s</b> 로 바닥에 닿습니다. (1 m/s = 시속 3.6 km 이므로 약 시속 " + (vEnd * 3.6).toFixed(0) + " km)";
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
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>같은 높이라도 <b>g</b> 가 크면 빨리 떨어집니다. 낙하를 정하는 것은 질량이 아니라 그 천체의 <b>중력 가속도</b>입니다.");
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
    var x0 = 108, top = 54, ground = 274, SX = 700 / 55;     // 1 m → SX px

    function draw() {
      paper(ctx, W, H);
      ctx.fillStyle = v("--line"); ctx.fillRect(40, ground, W - 80, 5);
      ctx.fillStyle = v("--card-2"); ctx.fillRect(40, top - 14, 68, ground - top + 14);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.strokeRect(40, top - 14, 68, ground - top + 14);
      text(ctx, "20 m", 46, top - 22, { s: 11, w: "800", c: v("--mist") });
      /* 같은 높이 표시 선 */
      var t = cur * T;
      var yA = top + (ground - top - 10) * (0.5 * G * t * t) / HH;
      var xB = x0 + vx * t * SX;
      ctx.strokeStyle = v("--teal"); ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, yA); ctx.lineTo(Math.min(xB, W - 30), yA); ctx.stroke(); ctx.setLineDash([]);
      /* 지나온 길 */
      ctx.strokeStyle = v("--coral"); ctx.globalAlpha = .45; ctx.lineWidth = 2; ctx.beginPath();
      for (var i = 0; i <= 40; i++) {
        var tt = T * i / 40, yy = top + (ground - top - 10) * (0.5 * G * tt * tt) / HH, xx = x0 + vx * tt * SX;
        if (xx > W - 26) break;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
      /* 두 공 */
      ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(x0, yA, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(Math.min(xB, W - 26), yA, 11, 0, Math.PI * 2); ctx.fill();
      text(ctx, "그냥 놓은 공", 40, 306, { s: 11.5, w: "800", c: v("--violet-700") });
      text(ctx, "수평으로 던진 공 (" + vx + " m/s)", 180, 306, { s: 11.5, w: "800", c: v("--coral-700") });
      text(ctx, "t = " + t.toFixed(2) + "초 · 높이 " + (0.5 * G * t * t).toFixed(1) + " m · 수평 " + (vx * t).toFixed(1) + " m", 880, 306, { s: 11.5, w: "800", a: "right" });
      text(ctx, "점선은 ‘같은 높이’ — 두 공은 언제나 나란히 내려옵니다", 880, 40, { s: 11, c: v("--mist"), a: "right" });
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
    var vk = 3.00, cx = 300, cy = 212, RPX = 176;

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
    function draw() {
      paper(ctx, W, H);
      var o = path(vk);
      var view = Math.max(o.rMax * 1.08, RE * 1.25);
      var S = RPX / view;
      /* 지구 */
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = .28;
      ctx.beginPath(); ctx.arc(cx, cy, RE * S, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--brand-700"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, RE * S, 0, Math.PI * 2); ctx.stroke();
      text(ctx, "지구", cx, cy + 4, { s: 12, w: "900", a: "center", c: v("--brand-700") });
      /* 궤도 */
      ctx.strokeStyle = o.hit !== null ? v("--coral") : (o.esc ? v("--violet") : v("--green"));
      ctx.lineWidth = 2.5; ctx.beginPath();
      o.pts.forEach(function (q, i) {
        var phi = -Math.PI / 2 + (q.nu - o.nu0);
        var xx = cx + q.r * S * Math.cos(phi), yy = cy + q.r * S * Math.sin(phi);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      });
      ctx.stroke();
      /* 발사점 */
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(cx, cy - r0 * S, 6, 0, Math.PI * 2); ctx.fill();
      text(ctx, "🔫 대포", cx + 12, cy - r0 * S - 8, { s: 11, w: "800", c: v("--amber-700") });
      /* 오른쪽 계기판 */
      var kind = o.hit !== null ? "땅에 떨어짐" : (o.esc ? "지구를 벗어남" : (o.e <= 0.03 ? "원에 가까운 궤도" : "타원 궤도"));
      var col = o.hit !== null ? "--coral" : (o.esc ? "--violet" : "--green");
      text(ctx, "궤도 판정", 512, 46, { s: 14, w: "900" });
      ctx.fillStyle = v(col); ctx.globalAlpha = .2; ctx.beginPath(); ctx.roundRect(508, 58, 370, 44, 12); ctx.fill(); ctx.globalAlpha = 1;
      text(ctx, kind, 524, 86, { s: 18, w: "900", c: v(col + "-700") || v("--ink") });
      var rows = [
        ["대포알의 속도", vk.toFixed(2) + " km/s"],
        ["궤도의 이심률 e", o.e >= 1 ? "1.00 이상 (열린 궤도)" : o.e.toFixed(3)],
        ["원궤도가 되는 속도", (VC / 1000).toFixed(2) + " km/s"],
        ["지구를 벗어나는 속도", (VE / 1000).toFixed(2) + " km/s"],
        ["날아간 각도", o.hit !== null ? o.hit.toFixed(1) + "° (약 " + (RE * o.hit * Math.PI / 180 / 1000).toFixed(0) + " km)" : "지구를 한 바퀴 이상"]
      ];
      rows.forEach(function (r, i) {
        var yy = 136 + i * 32;
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(508, yy - 18, 370, 27, 9); ctx.fill();
        text(ctx, r[0], 520, yy, { s: 11.5, c: v("--mist") });
        text(ctx, r[1], 868, yy + 1, { s: 12, w: "800", a: "right" });
      });
      text(ctx, "이심률 0 = 완전한 원, 1 미만 = 타원, 1 이상 = 돌아오지 않음", 508, 316, { s: 10.5, c: v("--mist") });
      text(ctx, "이 화면은 고도 100 km 에서 쏜다고 보았습니다.", 508, 336, { s: 10.5, c: v("--mist") });
      text(ctx, "지표면 기준 제1 우주 속도 7.9 km/s, 탈출 속도 11.2 km/s", 508, 356, { s: 10.5, c: v("--mist") });

      $("a-cannon-info").innerHTML = o.hit !== null
        ? "속도 <b>" + vk.toFixed(2) + " km/s</b> — 대포알은 약 <b>" + (RE * o.hit * Math.PI / 180 / 1000).toFixed(0) + " km</b> 날아가 땅에 떨어집니다. 더 세게 쏘면 떨어지는 지점이 멀어집니다."
        : (o.esc ? "속도 <b>" + vk.toFixed(2) + " km/s</b> — 지구의 중력을 이기고 <b>영영 돌아오지 않습니다.</b> 이 속도를 탈출 속도라고 합니다."
          : "속도 <b>" + vk.toFixed(2) + " km/s</b> — 대포알은 계속 떨어지지만, 떨어지는 만큼 지구 표면도 휘어져 <b>바닥에 닿지 못합니다.</b> 이것이 인공위성입니다. (이심률 " + o.e.toFixed(3) + ")");

      var ch = false;
      if (o.hit === null && !o.esc && o.e <= 0.03 && !got4.b) { got4.b = true; ch = true; }
      if (o.esc && !got4.c) { got4.c = true; ch = true; }
      if (ch) { window.sthState("proj4", got4); mission4(); }
    }
    canvas._redraw = draw;
    $("a-vc").addEventListener("input", function (e) {
      vk = +e.target.value; $("a-vc-val").textContent = vk.toFixed(2) + " km/s"; draw();
    });
    window.sthState("cirV", (VC / 1000).toFixed(2));
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
      { t: "📦 날아가는 비행기에서 떨어뜨린 구호 상자", a: "p", why: "떨어지는 순간 비행기와 같은 수평 속도를 가지고 있으므로 포물선을 그립니다.", hint: "상자는 가만히 있다가 떨어졌을까요?" },
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
      paper(ctx, W, H);
      var N = Math.max(0, M * (G + a));        // 수직 항력(N)
      var sc = N / G;                          // 체중계 눈금(kg중)
      var top = 40, bot = 344;
      /* 통로와 엘리베이터 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(64, top, 276, bot - top);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.strokeRect(64, top, 276, bot - top);
      ctx.fillStyle = v("--panel-2") || v("--card"); ctx.fillRect(96, top + 52, 212, 232);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.strokeRect(96, top + 52, 212, 232);
      /* 줄 */
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(202, top); ctx.lineTo(202, top + 52); ctx.stroke();
      /* 사람 + 체중계 */
      var fy = top + 252;
      ctx.fillStyle = v("--amber"); ctx.fillRect(160, fy, 84, 16);      // 체중계
      ctx.strokeStyle = v("--amber-700"); ctx.lineWidth = 2; ctx.strokeRect(160, fy, 84, 16);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(202, fy - 64, 17, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(190, fy - 46, 24, 46);
      text(ctx, "서윤 " + M + " kg", 202, top + 44, { s: 11.5, w: "800", a: "center", c: v("--mist") });
      /* 힘 화살표 */
      ctx.strokeStyle = v("--violet"); ctx.fillStyle = v("--violet"); ctx.lineWidth = 3;
      window.drawArrow(ctx, 136, fy - 20, 136, fy - 20 - clamp(N / 8, 8, 150), 11);
      text(ctx, "N = " + N.toFixed(0) + " N", 130, fy - 26 - clamp(N / 8, 8, 150), { s: 11.5, w: "800", a: "right", c: v("--violet-700") });
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 3;
      window.drawArrow(ctx, 272, fy - 130, 272, fy - 130 + M * G / 8, 11);
      text(ctx, "mg = " + (M * G).toFixed(0) + " N", 280, fy - 130 + M * G / 8 + 4, { s: 11.5, w: "800", c: v("--coral-700") });
      /* 가속도 화살표 */
      if (Math.abs(a) > 0.05) {
        ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal"); ctx.lineWidth = 4;
        var L = clamp(Math.abs(a) * 8, 12, 46);
        window.drawArrow(ctx, 348, 190, 348, a > 0 ? 190 - L : 190 + L, 12);
        text(ctx, "가속도", 356, 190, { s: 11, w: "800", c: v("--teal-700") });
      }
      /* 오른쪽 계기 */
      text(ctx, "체중계 눈금", 640, 56, { s: 13, w: "800", a: "center", c: v("--mist") });
      var col = sc > 50.5 ? "--rose" : (sc < 49.5 ? "--brand" : "--green");
      ctx.fillStyle = v(col); ctx.globalAlpha = .18;
      ctx.beginPath(); ctx.roundRect(470, 70, 340, 92, 20); ctx.fill(); ctx.globalAlpha = 1;
      text(ctx, sc.toFixed(1) + " kg중", 640, 132, { s: 38, w: "900", a: "center", c: v(col + "-700") || v("--ink") });
      /* 막대 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(470, 180, 340, 16);
      ctx.fillStyle = v(col); ctx.fillRect(470, 180, 340 * clamp(sc / 80, 0, 1), 16);
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(470 + 340 * 50 / 80, 174); ctx.lineTo(470 + 340 * 50 / 80, 202); ctx.stroke();
      text(ctx, "실제 질량 50 kg", 470 + 340 * 50 / 80, 216, { s: 10.5, a: "center", c: v("--mist") });
      /* 식 */
      var rows = [
        ["엘리베이터의 가속도 a", a.toFixed(1) + " m/s²"],
        ["떠받치는 힘 N = m(g + a)", N.toFixed(0) + " N"],
        ["몸무게(중력) mg", (M * G).toFixed(0) + " N"],
        ["알짜힘 N − mg = ma", (M * a).toFixed(0) + " N"]
      ];
      rows.forEach(function (r, i) {
        var yy = 252 + i * 30;
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(440, yy - 17, 436, 25, 8); ctx.fill();
        text(ctx, r[0], 452, yy, { s: 11.5, c: v("--mist") });
        text(ctx, r[1], 864, yy + 1, { s: 12, w: "800", a: "right" });
      });

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
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>체중계가 재는 것은 질량이 아니라 <b>떠받치는 힘</b>이었습니다. a = −9.8 m/s² 는 줄이 끊어져 <b>자유 낙하</b>하는 상태입니다.");
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
        "눈금이 0이 되려면 아래로 9.8 m/s² 로 가속(자유 낙하)해야 합니다."],
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

    function acc() { return (F - f) / m; }

    function draw() {
      paper(ctx, W, H);
      var a = acc(), net = F - f, ground = 236;
      ctx.fillStyle = v("--line"); ctx.fillRect(40, ground, W - 80, 5);
      for (var i = 0; i < 26; i++) { ctx.fillStyle = v("--card-2"); ctx.fillRect(44 + i * 32, ground + 5, 18, 7); }
      var s = 44 + m * 2.4, bx = 452, by = ground - s;
      ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.roundRect(bx - s / 2, by, s, s, 8); ctx.fill();
      text(ctx, m + " kg", bx, by + s / 2 + 5, { s: 13, w: "900", a: "center", c: v("--on-accent") });
      /* 미는 힘 */
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 5;
      var lf = 20 + F * 2.6;
      window.drawArrow(ctx, bx - s / 2 - lf, by + s / 2, bx - s / 2 - 6, by + s / 2, 13);
      text(ctx, "미는 힘 F = " + F + " N", bx - s / 2 - lf - 10, by + s / 2 + 5, { s: 12.5, w: "800", a: "right", c: v("--coral-700") });
      /* 마찰력 */
      ctx.strokeStyle = v("--violet"); ctx.fillStyle = v("--violet"); ctx.lineWidth = 5;
      var lr = 20 + f * 2.6;
      window.drawArrow(ctx, bx + s / 2 + lr, by + s - 8, bx + s / 2 + 6, by + s - 8, 13);
      text(ctx, "마찰력 f = " + f + " N", bx + s / 2 + lr + 10, by + s - 3, { s: 12.5, w: "800", c: v("--violet-700") });
      /* 알짜힘 · 가속도 */
      text(ctx, "알짜힘 = F − f = " + net + " N", 40, 36, { s: 14, w: "900", c: v("--brand-700") });
      text(ctx, "가속도 a = 알짜힘 ÷ m = " + net + " ÷ " + m + " = " + a.toFixed(2) + " m/s²", 40, 60, { s: 14, w: "900" });
      ctx.strokeStyle = v("--brand"); ctx.fillStyle = v("--brand"); ctx.lineWidth = 4;
      var la = clamp(Math.abs(a) * 16, 0, 300);
      if (la > 4) window.drawArrow(ctx, bx, 104, bx + (a > 0 ? la : -la), 104, 12);
      text(ctx, Math.abs(a) < 0.005 ? "가속도 0 — 속도가 변하지 않습니다" : (a > 0 ? "→ 점점 빨라집니다" : "← 점점 느려집니다"), bx, 92, { s: 11.5, w: "800", a: "center", c: v("--brand-700") });
      $("b-a-out").innerHTML = "가속도: <b>" + a.toFixed(2) + " m/s²</b> &nbsp;( a = (F − f) / m = (" + F + " − " + f + ") / " + m + " )";
      graph();
      check();
    }
    function graph() {
      paper(ctx2, W2, H2);
      var a = acc(), TM = 5, t = cur * TM;
      var vM = Math.max(Math.abs(a) * TM, 0.01), xM = Math.max(Math.abs(0.5 * a * TM * TM), 0.01);
      function panel(x0, x1, title, fn, max, col) {
        var y0 = 46, y1 = H2 - 42;
        axes(ctx2, x0, y0, x1, y1);
        text(ctx2, title, x0, 30, { s: 12.5, w: "800" });
        for (var s = 0; s <= 5; s++) {
          var gx = x0 + s / 5 * (x1 - x0);
          text(ctx2, s + "초", gx, y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
        }
        ctx2.strokeStyle = v(col); ctx2.lineWidth = 3; ctx2.beginPath();
        for (var i = 0; i <= 60; i++) {
          var tt = t * i / 60, val = fn(tt);
          var xx = x0 + tt / TM * (x1 - x0), yy = y1 - clamp(Math.abs(val) / max, 0, 1) * (y1 - y0);
          if (i === 0) ctx2.moveTo(xx, yy); else ctx2.lineTo(xx, yy);
        }
        ctx2.stroke();
        text(ctx2, fn(t).toFixed(1), x1, y1 - clamp(Math.abs(fn(t)) / max, 0, 1) * (y1 - y0) - 8, { s: 12, w: "900", a: "right", c: v(col + "-700") || v("--ink") });
      }
      panel(64, 414, "속도 v (m/s) — 시간", function (tt) { return a * tt; }, vM, "--teal");
      panel(506, 856, "위치 x (m) — 시간", function (tt) { return 0.5 * a * tt * tt; }, xM, "--coral");
      text(ctx2, "속도는 직선(등가속도), 위치는 휘어진 곡선(제곱에 비례)", 64, H2 - 12, { s: 10.5, c: v("--mist") });
      $("b-gr-info").innerHTML = "t = " + t.toFixed(1) + "초 · v = at = <b>" + (a * t).toFixed(1) + " m/s</b> · x = ½at² = <b>" + (0.5 * a * t * t).toFixed(1) + " m</b>" +
        (Math.abs(a) < 0.005 ? " — 가속도가 0이라 속도가 변하지 않습니다. 그래프도 평평합니다." : "");
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
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>가속도를 정하는 것은 미는 힘 하나가 아니라 <b>알짜힘</b>입니다. 알짜힘이 0이면 밀고 있어도 속도가 변하지 않고 <b>등속으로</b> 굴러갑니다.");
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
      why: ["a = 알짜힘 ÷ m 입니다. 질량이 커지면 가속도는 작아집니다.",
        "질량 슬라이더만 움직여 보세요. 가속도가 바뀝니다.",
        "a = 알짜힘 ÷ m 이므로 질량과 가속도는 <b>반비례</b>합니다. 힘과 가속도는 비례, 질량과 가속도는 반비례.",
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
      paper(ctx, W, H);
      var ice = 244;
      ctx.fillStyle = v("--brand-100"); ctx.fillRect(40, ice, W - 80, 30);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.strokeRect(40, ice, W - 80, 30);
      text(ctx, "마찰이 거의 없는 얼음판", 48, ice + 48, { s: 11, c: v("--mist") });
      var cxA = 380 - cur * vA() * 46, cxB = 520 + cur * vB() * 46;
      cxA = clamp(cxA, 70, 430); cxB = clamp(cxB, 470, 806);
      function person(x, label, mm, col) {
        var r = 14 + mm * 0.18;
        ctx.fillStyle = v(col); ctx.beginPath(); ctx.arc(x, ice - 60, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x - r * 0.6, ice - 60 + r, r * 1.2, 46 - r * 0.4);
        text(ctx, label + " " + mm + " kg", x, ice - 60 - r - 10, { s: 12, w: "800", a: "center", c: v(col + "-700") || v("--ink") });
      }
      person(cxA, "서윤 A", mA, "--coral");
      person(cxB, "친구 B", MB, "--teal");
      /* 힘 화살표 (미는 순간에만) */
      if (cur < 0.28) {
        ctx.strokeStyle = v("--violet"); ctx.fillStyle = v("--violet"); ctx.lineWidth = 5;
        window.drawArrow(ctx, 452, ice - 74, 392, ice - 74, 13);
        window.drawArrow(ctx, 452, ice - 74, 512, ice - 74, 13);
        text(ctx, "200 N", 452, ice - 86, { s: 12, w: "800", a: "center", c: v("--violet-700") });
        text(ctx, "두 힘은 크기가 같고 방향이 반대입니다", 452, ice - 104, { s: 11, a: "center", c: v("--mist") });
      }
      /* 계기 */
      text(ctx, "0.5초 동안 200 N → 각자 받은 충격량 100 N·s (크기는 같고 방향만 반대)", 40, 34, { s: 12.5, w: "800", c: v("--brand-700") });
      var rows = [
        ["서윤 A 의 질량", mA + " kg"],
        ["서윤 A 의 속도", vA().toFixed(2) + " m/s (왼쪽)"],
        ["친구 B 의 속도", vB().toFixed(2) + " m/s (오른쪽)"]
      ];
      rows.forEach(function (r, i) {
        var yy = 62 + i * 28;
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(516, yy - 17, 360, 24, 8); ctx.fill();
        text(ctx, r[0], 528, yy, { s: 11.5, c: v("--mist") });
        text(ctx, r[1], 866, yy, { s: 12, w: "800", a: "right" });
      });
      text(ctx, "같은 힘을 받아도 질량이 크면 덜 밀려납니다 (a = F/m)", 516, 158, { s: 11, c: v("--mist") });
    }
    canvas._redraw = draw;
    function say() {
      if (!ran) { $("b-push-info").innerHTML = "A의 질량을 정하고 ‘0.5초 동안 서로 밀기’를 눌러 보세요."; return; }
      $("b-push-info").innerHTML = "서윤(" + mA + " kg)은 <b>" + vA().toFixed(2) + " m/s</b>, 친구(60 kg)는 <b>" + vB().toFixed(2) + " m/s</b> 로 밀려났습니다. 받은 <b>힘도 충격량도 크기가 같은데</b> 속도가 다른 것은 <b>질량이 다르기</b> 때문입니다." +
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
        : "체중계 화면에서 가속도 슬라이더만 움직여도 눈금이 바뀌었지요. 답은 ㉣ 입니다 — 중력도 그대로였고, 고장도 아니었습니다.");
  }
  function finish() { window.sthState("r2", "해결 · 체중계는 질량이 아니라 떠받치는 힘 N = m(g+a) 를 잰다"); }
  window.sthPick({
    mount: "s2-q3",
    q: "같은 트럭이 <b>시속 20 km</b> 로 달릴 때와 <b>시속 80 km</b> 로 달릴 때, 이 트럭의 <b>관성</b>은 어떻게 다를까요?",
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
      { id: "e2b", label: "서윤이에게 보내는 답장", hint: "엘리베이터 눈금이 55 kg → 50 kg → 45 kg 으로 변한 세 구간에서 각각 가속도의 방향이 어땠는지 쓰고, N = m(g+a) 로 설명하세요.", ph: "0~2초: … / 2~4초: … / 4~6초: …" }
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
      paper(ctx, W, H);
      var rail = 250;
      ctx.fillStyle = v("--line"); ctx.fillRect(40, rail, W - 80, 5);
      var o = res || outcome();
      var xa, xb;
      if (phase === 0) { xa = 180; xb = 560; }
      else {
        var u = phase;
        if (o.merged) { xa = 560 - 26 + o.va * u * 52; xb = xa; }
        else { xa = 560 - 26 + o.va * u * 52; xb = 560 + o.vb * u * 52; }
      }
      xa = clamp(xa, 70, 796); xb = clamp(xb, 70, 806);
      function cart(x, mm, label, col) {
        var w = 34 + mm * 5, h = 26 + mm * 2.4;
        ctx.fillStyle = v(col); ctx.beginPath(); ctx.roundRect(x - w / 2, rail - h, w, h, 7); ctx.fill();
        text(ctx, label + " " + mm + "kg", x, rail - h / 2 + 5, { s: 12, w: "900", a: "center", c: v("--on-accent") });
        ctx.fillStyle = v("--mist");
        ctx.beginPath(); ctx.arc(x - w / 4, rail + 2, 7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + w / 4, rail + 2, 7, 0, Math.PI * 2); ctx.fill();
      }
      if (o.merged && phase > 0) {
        var wm = 34 + (ma + mb) * 5, hm = 26 + (ma + mb) * 2.0;
        ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.roundRect(xa - wm / 2, rail - hm, wm, hm, 7); ctx.fill();
        text(ctx, "A+B " + (ma + mb) + "kg", xa, rail - hm / 2 + 5, { s: 12, w: "900", a: "center", c: v("--on-accent") });
      } else { cart(xa, ma, "A", "--teal"); cart(xb, mb, "B", "--coral"); }
      /* 속도 화살표 */
      if (phase > 0) {
        [[xa, o.va, "--teal"], [xb, o.vb, "--coral"]].forEach(function (q) {
          if (Math.abs(q[1]) < 0.02) return;
          ctx.strokeStyle = v(q[2]); ctx.fillStyle = v(q[2]); ctx.lineWidth = 3;
          var L = clamp(Math.abs(q[1]) * 26, 10, 90);
          window.drawArrow(ctx, q[0], rail + 34, q[0] + (q[1] > 0 ? L : -L), rail + 34, 10);
        });
      } else {
        ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal"); ctx.lineWidth = 3;
        window.drawArrow(ctx, xa, rail + 34, xa + 74, rail + 34, 10);
        text(ctx, "3.0 m/s", xa + 82, rail + 38, { s: 11.5, w: "800", c: v("--teal-700") });
      }
      /* 위쪽 표 */
      var pB = ma * V0, pA = ma * o.va + mb * o.vb;
      var kB = 0.5 * ma * V0 * V0, kA = 0.5 * ma * o.va * o.va + 0.5 * mb * o.vb * o.vb;
      text(ctx, "충돌 전", 60, 38, { s: 12.5, w: "900", c: v("--mist") });
      text(ctx, "A " + ma + "kg × 3.0 m/s + B " + mb + "kg × 0 m/s", 60, 60, { s: 12 });
      text(ctx, "운동량의 합 = " + pB.toFixed(1) + " kg·m/s", 60, 82, { s: 13, w: "900", c: v("--brand-700") });
      text(ctx, "충돌 후 (예상)", 470, 38, { s: 12.5, w: "900", c: v("--mist") });
      text(ctx, o.merged ? "A+B 가 함께 " + o.va.toFixed(2) + " m/s" : "A " + o.va.toFixed(2) + " m/s, B " + o.vb.toFixed(2) + " m/s", 470, 60, { s: 12 });
      text(ctx, "운동량의 합 = " + pA.toFixed(1) + " kg·m/s", 470, 82, { s: 13, w: "900", c: v("--brand-700") });
      text(ctx, "운동량의 합은 충돌 전후가 언제나 같습니다 (운동량 보존)", 60, 112, { s: 11.5, c: v("--mist") });
      text(ctx, "운동 에너지 " + kB.toFixed(1) + " J → " + kA.toFixed(1) + " J", 470, 112, { s: 11.5, c: v("--mist") });
      /* 막대 비교 */
      var mx = Math.max(pB, 1);
      [["충돌 전 운동량", pB, "--brand"], ["충돌 후 운동량", pA, "--green"]].forEach(function (b, i) {
        var yy = 150 + i * 30;
        text(ctx, b[0], 60, yy + 12, { s: 11, c: v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(190, yy, 320, 15);
        ctx.fillStyle = v(b[2]); ctx.fillRect(190, yy, 320 * clamp(b[1] / mx, 0, 1), 15);
        text(ctx, b[1].toFixed(1), 520, yy + 13, { s: 11.5, w: "800" });
      });
      if (o.va < -0.001 && phase > 0) text(ctx, "← A가 뒤로 튕겨 나갔습니다", 60, 320, { s: 12.5, w: "800", c: v("--rose-700") });
    }
    canvas._redraw = draw;
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.a && got.b) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>충돌 방식이 바뀌어도 <b>운동량의 합은 늘 그대로</b>였습니다. 달라진 것은 운동 에너지였지요.");
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
        (res.merged ? "두 수레가 붙어 <b>" + res.va.toFixed(2) + " m/s</b> 로 함께 굴러갑니다."
          : "A는 <b>" + res.va.toFixed(2) + " m/s</b>, B는 <b>" + res.vb.toFixed(2) + " m/s</b> 가 되었습니다." + (res.va < 0 ? " A가 <b>뒤로 튕겨</b> 나갔습니다." : ""));
      $("c-energy").innerHTML = "운동 에너지: 충돌 전 " + kB.toFixed(2) + " J → 충돌 후 " + kA.toFixed(2) + " J" +
        (kind === "elastic" ? " — 완전 탄성 충돌은 <b>운동 에너지도 보존</b>됩니다."
          : " — 완전 비탄성 충돌은 <b>" + (kB - kA).toFixed(2) + " J 가 사라집니다.</b> 변형·열·소리로 바뀐 것입니다. 그래도 운동량은 그대로입니다.");
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
    var MB = 0.145, V0 = 40, DP = MB * V0;
    var t = 0.01;
    var got = window.sthState("catchGot") || { a: false, b: false };

    function draw() {
      paper(ctx, W, H);
      var F = DP / t;
      /* 왼쪽 그림 */
      text(ctx, "야구공 145 g · 40 m/s (시속 144 km)", 56, 36, { s: 12.5, w: "800" });
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(120, 150, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 4;
      window.drawArrow(ctx, 146, 150, 236, 150, 12);
      /* 손 */
      var back = clamp((t - 0.005) / 0.195, 0, 1) * 96;
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.roundRect(258 + back, 112, 40, 76, 12); ctx.fill();
      ctx.strokeStyle = v("--amber-700"); ctx.lineWidth = 2; ctx.strokeRect(258 + back, 112, 40, 76);
      text(ctx, "손", 278 + back, 158, { s: 13, w: "900", a: "center", c: v("--amber-700") });
      if (back > 4) {
        ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal"); ctx.lineWidth = 3;
        window.drawArrow(ctx, 258, 214, 258 + back, 214, 10);
        text(ctx, "손을 뒤로 " + (back / 96 * 20).toFixed(0) + " cm 빼며 받는다", 256, 236, { s: 11, c: v("--teal-700"), w: "800" });
      } else {
        text(ctx, "손을 고정하고 받으면 아주 짧은 시간에 멈춘다", 256, 236, { s: 11, c: v("--mist") });
      }
      text(ctx, "충격량 = 운동량의 변화 = 0.145 × 40 = " + DP.toFixed(2) + " N·s (바뀌지 않음)", 56, 290, { s: 12.5, w: "800", c: v("--brand-700") });
      text(ctx, "평균 힘 F = 충격량 ÷ 시간", 56, 314, { s: 12, c: v("--mist") });

      /* 오른쪽 힘-시간 그래프 : 넓이가 곧 충격량 */
      var x0 = 470, x1 = 868, y0 = 62, y1 = 280, TM = 0.2, FM = 1200;
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "힘 – 시간 그래프 (색칠한 넓이 = 충격량)", x0, 40, { s: 12.5, w: "800" });
      var bw = (x1 - x0) * clamp(t / TM, 0, 1), bh = (y1 - y0) * clamp(F / FM, 0, 1);
      ctx.fillStyle = v(F > 100 ? "--rose" : "--green"); ctx.globalAlpha = .35;
      ctx.fillRect(x0, y1 - bh, bw, bh); ctx.globalAlpha = 1;
      ctx.strokeStyle = v(F > 100 ? "--rose" : "--green"); ctx.lineWidth = 2.5;
      ctx.strokeRect(x0, y1 - bh, bw, bh);
      text(ctx, "0.2초", x1, y1 + 18, { s: 10.5, c: v("--mist"), a: "right" });
      text(ctx, "0", x0 - 6, y1 + 18, { s: 10.5, c: v("--mist"), a: "right" });
      text(ctx, "1200 N", x0 - 6, y0 + 4, { s: 10.5, c: v("--mist"), a: "right" });
      var gy = y1 - (y1 - y0) * 100 / FM;
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "합격선 100 N", x1, gy - 8, { s: 10.5, w: "800", a: "right", c: v("--amber-700") });
      text(ctx, "가로 " + t.toFixed(3) + "초 × 세로 " + F.toFixed(0) + " N = " + DP.toFixed(2) + " N·s", x0, y1 + 38, { s: 12, w: "800" });
      text(ctx, "시간을 늘리면 직사각형이 납작해질 뿐 넓이는 그대로입니다.", x0, y1 + 56, { s: 10.5, c: v("--mist") });

      $("c-catch-info").innerHTML = "멈추는 시간 <b>" + t.toFixed(3) + "초</b> → 손에 걸리는 평균 힘 <b>" + F.toFixed(0) + " N</b> (약 " + (F / G).toFixed(0) + " kg중). " +
        (F <= 100 ? "🎉 합격선 아래입니다. 손을 뒤로 빼며 받으면 <b>같은 충격량</b>을 <b>더 긴 시간</b>에 나누어 받게 됩니다."
          : "아직 너무 큽니다. 멈추는 시간을 늘려 보세요.");
      var ch = false;
      if (F <= 100 && !got.a) { got.a = true; ch = true; }
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
        "충격량 = 운동량의 변화 = 0.145 × 40 = 5.8 N·s 로 고정입니다. F = 충격량 ÷ Δt 이므로 시간이 2배면 힘은 절반입니다.",
        "충격량은 공의 운동량 변화로 정해져 있어 줄어들지 않습니다.",
        "그래프의 직사각형을 보세요. 가로가 길어지면 넓이가 같으려면 세로가 낮아져야 합니다."],
      onDone: function () { got.b = true; window.sthState("catchGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 크럼플 존 설계 ---------------------------------------------- */
  (function () {
    var canvas = $("c-crush"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var MC = 1400, V0 = 14, LIMIT = 1.20, GMAX = 20;
    var d = 0.20;
    var got = window.sthState("crushGot") || { a: false, b: false };

    function draw() {
      paper(ctx, W, H);
      var acc = V0 * V0 / (2 * d), gN = acc / G, F = MC * acc, dt = 2 * d / V0, J = MC * V0;
      var okG = gN <= GMAX, okL = d <= LIMIT, ok = okG && okL;
      /* 벽과 자동차 */
      var wall = 470, road = 232;
      ctx.fillStyle = v("--mist"); ctx.fillRect(wall, 70, 26, road - 70 + 10);
      ctx.fillStyle = v("--line"); ctx.fillRect(60, road, 430, 5);
      var SC = 150;                                     // 1 m → 150 px
      var crush = clamp(d, 0, 1.5) * SC * 0.62;
      var cabinW = 150, front = clamp(LIMIT, 0, 1.5) * SC * 0.62;
      var carL = wall - cabinW - front;
      /* 승객실 */
      ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.roundRect(carL, road - 72, cabinW, 72, 8); ctx.fill();
      text(ctx, "승객실", carL + cabinW / 2, road - 34, { s: 12.5, w: "900", a: "center", c: v("--on-accent") });
      /* 앞부분 (쓸 수 있는 길이) */
      ctx.strokeStyle = v("--mist"); ctx.setLineDash([4, 4]); ctx.lineWidth = 2;
      ctx.strokeRect(carL + cabinW, road - 58, front, 58); ctx.setLineDash([]);
      /* 실제 찌그러지는 부분 */
      ctx.fillStyle = v(ok ? "--green" : "--rose"); ctx.globalAlpha = .55;
      ctx.fillRect(wall - Math.min(crush, front + 90), road - 58, Math.min(crush, front + 90), 58); ctx.globalAlpha = 1;
      text(ctx, "찌그러짐 " + d.toFixed(2) + " m", carL + cabinW + 4, road - 68, { s: 11.5, w: "800", c: v(ok ? "--green-700" : "--rose-700") });
      text(ctx, "앞부분 길이 1.20 m", carL + cabinW, road + 26, { s: 10.5, c: v("--mist") });
      ctx.fillStyle = v("--mist");
      ctx.beginPath(); ctx.arc(carL + 36, road + 4, 12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(carL + cabinW - 20, road + 4, 12, 0, Math.PI * 2); ctx.fill();
      text(ctx, "1,400 kg · 14 m/s (시속 50 km)", 60, 46, { s: 12.5, w: "800" });
      if (!okL) text(ctx, "⚠ 찌그러짐이 승객실까지 밀고 들어왔습니다", 60, 284, { s: 12.5, w: "800", c: v("--rose-700") });
      else if (!okG) text(ctx, "⚠ 너무 단단합니다 — 탑승자가 견디지 못합니다", 60, 284, { s: 12.5, w: "800", c: v("--rose-700") });
      else text(ctx, "✅ 두 기준을 모두 통과했습니다", 60, 284, { s: 12.5, w: "800", c: v("--green-700") });
      text(ctx, "충격량 = 1,400 × 14 = " + J.toLocaleString() + " N·s — 설계를 바꿔도 이 값은 그대로입니다.", 60, 310, { s: 11, c: v("--mist") });

      /* 오른쪽 계기 */
      var rows = [
        ["멈추는 데 걸리는 시간 Δt", dt.toFixed(3) + " 초"],
        ["탑승자의 감속도", gN.toFixed(1) + " g  (" + acc.toFixed(0) + " m/s²)"],
        ["자동차가 받는 평균 힘", Math.round(F).toLocaleString() + " N"],
        ["감속도 기준 (20 g 이하)", okG ? "통과" : "탈락"],
        ["길이 기준 (1.20 m 이하)", okL ? "통과" : "탈락"]
      ];
      text(ctx, "시험 결과", 560, 46, { s: 14, w: "900" });
      rows.forEach(function (r, i) {
        var yy = 82 + i * 34;
        var good = i < 3 ? null : (i === 3 ? okG : okL);
        ctx.fillStyle = good === null ? v("--card-2") : (good ? v("--green-100") : v("--rose-100"));
        ctx.beginPath(); ctx.roundRect(556, yy - 19, 320, 28, 9); ctx.fill();
        text(ctx, r[0], 568, yy, { s: 11.5, c: v("--mist") });
        text(ctx, r[1], 866, yy + 1, { s: 12, w: "800", a: "right", c: good === null ? v("--ink") : (good ? v("--green-700") : v("--rose-700")) });
      });
      text(ctx, "찌그러지는 거리가 길수록 멈추는 시간이 늘어", 556, 268, { s: 10.5, c: v("--mist") });
      text(ctx, "같은 충격량을 더 작은 힘으로 나누어 받습니다.", 556, 288, { s: 10.5, c: v("--mist") });

      $("c-crush-info").innerHTML = "찌그러지는 거리 <b>" + d.toFixed(2) + " m</b> → 멈추는 시간 <b>" + dt.toFixed(3) + "초</b>, 탑승자의 감속도 <b>" + gN.toFixed(1) + " g</b>, 평균 힘 <b>" + Math.round(F).toLocaleString() + " N</b>. " +
        (ok ? "🎉 합격입니다. 앞부분이 알맞게 구겨져 멈추는 시간을 늘려 주었습니다."
          : (!okL ? "너무 무릅니다. 1.20 m 를 넘으면 찌그러짐이 <b>승객실</b>까지 들어옵니다."
            : "너무 단단합니다. 순식간에 멈추면 <b>힘이 커집니다.</b> 거리를 늘려 보세요."));
      var ch = false;
      if (ok && !got.a) { got.a = true; ch = true; }
      if (ch) { window.sthState("crushGot", got); window.sthState("crushD", d.toFixed(2)); mission(); }
    }
    function mission() {
      if (got.a) done("m3-4a");
      if (got.b) done("m3-4b");
      if (got.a && got.b) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>자동차 앞부분은 <b>튼튼하게</b>가 아니라 <b>잘 구겨지게</b> 만듭니다. 대신 승객실은 단단해야 하지요.");
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
    { key: "r3", label: "③ 충돌 실험실" }
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
    { key: "r3", label: "③ 충돌 실험실" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
