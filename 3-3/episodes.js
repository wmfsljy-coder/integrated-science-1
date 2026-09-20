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
/* 표 한 줄 그리기 */
function row(ctx, x, y, w, label, val, tone) {
  ctx.fillStyle = tone ? v(tone + "-100") : v("--card-2");
  ctx.beginPath(); ctx.roundRect(x, y - 18, w, 27, 9); ctx.fill();
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

/* =========================================================================
   이야기 ① 익지 않는 김치
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 (기존 저장 키 enzyme 를 그대로 쓴다) */
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
    var jar = "fresh", T = 20, pH = 6.5;
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

    function curve(x0, x1, y0, y1, lo, hi, fn, cur, col, xlabel, ylabel, ticks) {
      axes(ctx, x0, y0, x1, y1);
      ctx.strokeStyle = v(col); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= 120; i++) {
        var xv = lo + (hi - lo) * i / 120, yy = y1 - fn(xv) * (y1 - y0);
        var xx = x0 + (x1 - x0) * i / 120;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      /* 95% 선 */
      var g95 = y1 - 0.95 * (y1 - y0);
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, g95); ctx.lineTo(x1, g95); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "95 %", x1 - 4, g95 - 6, { s: 10, w: "800", a: "right", c: v("--amber-700") });
      /* 지금 위치 */
      var cx = x0 + (x1 - x0) * (cur - lo) / (hi - lo), cy = y1 - fn(cur) * (y1 - y0);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1; ctx.globalAlpha = .7;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, y1); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      text(ctx, (fn(cur) * 100).toFixed(0) + " %", cx, cy - 12, { s: 11.5, w: "900", a: "center", c: v("--coral-700") });
      ticks.forEach(function (t2) {
        var tx = x0 + (x1 - x0) * (t2 - lo) / (hi - lo);
        text(ctx, String(t2), tx, y1 + 18, { s: 10, c: v("--mist"), a: "center" });
      });
      text(ctx, xlabel, (x0 + x1) / 2, y1 + 36, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, ylabel, x0 - 6, y0 - 10, { s: 11.5, w: "800", c: v(col + "-700") || v("--ink") });
    }

    function draw() {
      paper(ctx, W, H);
      curve(80, 420, 62, 196, -5, 80, tAct, T, "--teal", "보관 온도 (°C) →", "온도에 따른 효소 활성", [-5, 15, 30, 50, 80]);
      curve(80, 420, 262, 396, 2, 9, pAct, pH, "--violet", "pH →", "pH 에 따른 효소 활성", [2, 4, 5.5, 7, 9]);

      var ta = tAct(T), pa = pAct(pH), rate = ta * pa * surv();
      var d = rate <= 1e-6 ? Infinity : BASE / rate;
      var freshRate = ta * pa, freshD = freshRate <= 1e-6 ? Infinity : BASE / freshRate;

      text(ctx, jar === "fresh" ? "통 ㉮ · 한 번도 데운 적 없는 김치" : "통 ㉰ · 80 °C 국물을 부었다 식힌 김치", 470, 40, { s: 14, w: "900", c: v("--brand-700") });
      row(ctx, 466, 76, 410, "온도 활성", (ta * 100).toFixed(0) + " %", ta >= 0.95 ? "--green" : null);
      row(ctx, 466, 110, 410, "pH 활성", (pa * 100).toFixed(0) + " %", pa >= 0.95 ? "--green" : null);
      row(ctx, 466, 144, 410, "효소가 살아 있는 정도", jar === "boiled" ? "0 % (변성됨)" : "100 %", jar === "boiled" ? "--rose" : null);
      row(ctx, 466, 178, 410, "종합 반응 속도 (최적 대비)", (rate * 100).toFixed(1) + " %", null);
      row(ctx, 466, 212, 410, "잘 익는 데 걸리는 시간", daysText(d), isFinite(d) && d <= 7 ? "--green" : "--rose");

      /* 두 통 비교 막대 */
      text(ctx, "같은 온도 · 같은 pH 에서 두 통을 나란히", 470, 256, { s: 11.5, w: "800", c: v("--mist") });
      [["통 ㉮", freshRate, "--teal"], ["통 ㉰", 0, "--rose"]].forEach(function (b, i) {
        var yy = 274 + i * 30;
        text(ctx, b[0], 520, yy + 13, { s: 11.5, w: "800", a: "right", c: v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(532, yy, 260, 16);
        ctx.fillStyle = v(b[2]); ctx.fillRect(532, yy, 260 * clamp(b[1], 0, 1), 16);
        text(ctx, (b[1] * 100).toFixed(1) + " %", 800, yy + 13, { s: 11.5, w: "800" });
      });
      text(ctx, "통 ㉰ 는 다이얼을 아무리 잘 맞춰도 0 % 입니다.", 470, 350, { s: 11, c: v("--rose-700"), w: "800" });
      text(ctx, "효소는 단백질이라 한 번 높은 온도에서 모양이 풀리면", 470, 372, { s: 10.5, c: v("--mist") });
      text(ctx, "온도를 내려도 되돌아오지 않습니다 — 이것이 변성입니다.", 470, 390, { s: 10.5, c: v("--mist") });
      text(ctx, "곡선은 효소 자체의 성질이고, 실제로 익는 속도는 여기에 효소가 살아 있는 정도를 곱한 값입니다.", 80, 428, { s: 10.5, c: v("--mist") });

      $("a-rate-info").innerHTML = "<b>" + (jar === "fresh" ? "통 ㉮" : "통 ㉰") + "</b> · 온도 <b>" + T + " °C</b>, pH <b>" + pH.toFixed(1) + "</b> → 온도 활성 " + (ta * 100).toFixed(0) + " %, pH 활성 " + (pa * 100).toFixed(0) + " %, 종합 속도 <b>" + (rate * 100).toFixed(1) + " %</b>. " +
        (jar === "boiled"
          ? "이 통의 효소는 이미 <b>변성</b>되어 활성이 0 입니다. 온도와 pH 를 아무리 잘 맞춰도 김치는 익지 않습니다."
          : (d <= 3 ? "🎉 효소가 아주 잘 일하고 있습니다. <b>" + daysText(d) + "</b> 만에 시어집니다."
            : (d <= 30 ? "천천히 익고 있습니다. 다 익는 데 <b>" + daysText(d) + "</b> 걸립니다."
              : "거의 멈춘 것처럼 보이지만 <b>익고 있습니다.</b> 다만 <b>" + daysText(d) + "</b> 이 걸릴 뿐입니다."))) +
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
    segWire("a-jar", "data-j", function (x) { jar = x; draw(); });
    $("a-t").addEventListener("input", function (e) { T = +e.target.value; $("a-t-val").textContent = T; draw(); });
    $("a-ph").addEventListener("input", function (e) { pH = +e.target.value; $("a-ph-val").textContent = pH.toFixed(1); draw(); });
    draw(); mission();
  })();

  /* 장면 3 — 활성화 에너지 ----------------------------------------------- */
  (function () {
    var canvas = $("c-ea"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var EA0 = 75, T0 = 298.15;
    var ea = 75, temp = 25;
    var got = window.sthState("eaGot") || { a: false, b: false, c: false };

    function ratioEnz() { return Math.exp((EA0 - ea) * 1000 / (R * (temp + 273.15))); }
    function ratioTemp() { return Math.exp(EA0 * 1000 / R * (1 / T0 - 1 / (temp + 273.15))); }

    function draw() {
      paper(ctx, W, H);
      var base = 268, PX = 2.2;
      /* 에너지 그림 */
      axes(ctx, 84, 52, 84, 316);
      ctx.strokeStyle = v("--line"); ctx.beginPath(); ctx.moveTo(84, 316); ctx.lineTo(462, 316); ctx.stroke();
      text(ctx, "반응 경로 →", 273, 340, { s: 11, c: v("--mist"), a: "center" });
      ctx.save(); ctx.translate(62, 184); ctx.rotate(-Math.PI / 2);
      text(ctx, "에너지", 0, 0, { s: 11, c: v("--mist"), a: "center" }); ctx.restore();

      var prodY = base + 34;
      /* 반응물 · 생성물 수평선 */
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(96, base); ctx.lineTo(176, base); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(372, prodY); ctx.lineTo(452, prodY); ctx.stroke();
      text(ctx, "반응물", 96, base - 10, { s: 11, w: "800", c: v("--mist") });
      text(ctx, "생성물", 452, prodY + 18, { s: 11, w: "800", a: "right", c: v("--mist") });

      function hump(E, col, dash) {
        var peak = base - E * PX;
        ctx.strokeStyle = v(col); ctx.lineWidth = 2.6;
        if (dash) ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.moveTo(176, base);
        ctx.quadraticCurveTo(274, 2 * peak - (base + prodY) / 2, 372, prodY);
        ctx.stroke(); ctx.setLineDash([]);
        return peak;
      }
      var p1 = hump(EA0, "--coral", true);
      var p2 = hump(ea, "--teal", false);
      /* 언덕 높이 화살표 */
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 2;
      window.drawArrow(ctx, 210, base, 210, p1 + 6, 9);
      text(ctx, "효소 없음 " + EA0 + " kJ/mol", 218, p1 + 16, { s: 11.5, w: "800", c: v("--coral-700") });
      ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal"); ctx.lineWidth = 2;
      window.drawArrow(ctx, 330, base, 330, p2 + 6, 9);
      var ly = (p2 - p1 < 30) ? p2 + 40 : p2 + 16;      /* 두 글자가 겹치지 않게 */
      text(ctx, "효소 있음 " + ea + " kJ/mol", 338, ly, { s: 11.5, w: "800", c: v("--teal-700") });
      text(ctx, "효소가 있어도 반응물과 생성물의 에너지 차이는 그대로입니다.", 84, 368, { s: 10.5, c: v("--mist") });
      text(ctx, "효소가 바꾸는 것은 ‘넘어야 할 언덕의 높이’ 하나뿐입니다.", 84, 388, { s: 10.5, w: "800", c: v("--brand-700") });

      /* 오른쪽 계기 */
      var re = ratioEnz(), rt = ratioTemp();
      text(ctx, "속도 비교", 500, 40, { s: 14, w: "900" });
      row(ctx, 496, 76, 384, "반응 온도", temp + " °C (" + (temp + 273.15).toFixed(1) + " K)", null);
      row(ctx, 496, 110, 384, "효소가 낮춰 준 만큼", (EA0 - ea) + " kJ/mol", null);
      row(ctx, 496, 144, 384, "효소가 만든 속도 배수", sci(re) + " 배", re >= 1e8 ? "--green" : null);
      row(ctx, 496, 178, 384, "온도만 올려 얻은 배수", sci(rt) + " 배", rt >= 10 ? "--green" : null);

      /* 로그 막대 */
      text(ctx, "몇 배나 빨라졌나 (막대 한 칸 = 10배)", 500, 222, { s: 11.5, w: "800", c: v("--mist") });
      [["효소", re, "--teal"], ["온도", rt, "--coral"]].forEach(function (b, i) {
        var yy = 240 + i * 30, lg = Math.max(0, Math.log(Math.max(b[1], 1)) / Math.LN10);
        text(ctx, b[0], 534, yy + 13, { s: 11.5, w: "800", a: "right", c: v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(544, yy, 300, 16);
        ctx.fillStyle = v(b[2]); ctx.fillRect(544, yy, 300 * clamp(lg / 14, 0, 1), 16);
        text(ctx, "10" + sup(lg.toFixed(0)), 852, yy + 13, { s: 11.5, w: "800" });
      });
      text(ctx, "온도를 올리면 세포 속 다른 단백질까지 변성되지만,", 500, 316, { s: 10.5, c: v("--mist") });
      text(ctx, "효소는 체온 그대로 두고도 반응을 수억 배 빠르게 합니다.", 500, 336, { s: 10.5, c: v("--mist") });

      $("a-ea-out").innerHTML = "효소 쪽 <b>" + sci(re) + " 배</b> &nbsp;·&nbsp; 온도 쪽 <b>" + sci(rt) + " 배</b> (25 °C 때와 견줌)";
      $("a-ea-info").innerHTML = "활성화 에너지가 <b>" + EA0 + " → " + ea + " kJ/mol</b> 로 낮아지면, " + temp + " °C 에서 반응 속도가 <b>" + sci(re) + " 배</b>가 됩니다. " +
        (ea >= 74 ? "아직 효소를 넣지 않은 것과 같습니다. 슬라이더를 왼쪽으로 밀어 보세요."
          : (re >= 1e8 ? "🎉 <b>1억 배</b>를 넘겼습니다. 효소가 없으면 보이지도 않던 반응이 눈앞에서 부글거리게 됩니다."
            : "더 낮춰 보세요. 카탈레이스는 8 kJ/mol 까지 낮춥니다.")) +
        " 한편 효소 없이 온도만 " + temp + " °C 로 올렸다면 25 °C 때보다 <b>" + sci(rt) + " 배</b> 빨라졌을 뿐입니다.";
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
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>온도를 25 °C 나 올려야 겨우 10배였습니다. 효소는 <b>체온 그대로</b> 두고도 억 단위로 빠르게 합니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
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
    var stain = "pro", enz = "none", wt = 30;
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

    function draw() {
      paper(ctx, W, H);
      var rm = removal(wt), m = match(), a = act(wt);
      /* 왼쪽 — 앞치마 */
      text(ctx, "30분 세탁 뒤의 앞치마", 70, 40, { s: 13, w: "900" });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(70, 56, 240, 240, 16); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
      ctx.save();
      ctx.globalAlpha = clamp(1 - rm / 100, 0.04, 1);
      ctx.fillStyle = v(stain === "pro" ? "--rose" : (stain === "lip" ? "--amber" : "--violet"));
      ctx.beginPath(); ctx.ellipse(190, 168, 66, 52, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(136, 224, 22, 16, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(250, 108, 18, 13, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      text(ctx, SNAME[stain], 190, 316, { s: 12, w: "800", a: "center", c: v("--mist") });
      text(ctx, "얼룩이 " + rm.toFixed(0) + " % 지워졌습니다", 190, 340, { s: 13, w: "900", a: "center", c: v(rm >= 90 ? "--green-700" : (rm < 30 ? "--rose-700" : "--ink")) });

      /* 자물쇠와 열쇠 */
      text(ctx, m === 1 ? "🔑 열쇠가 자물쇠에 딱 맞습니다" : (enz === "none" ? "🧼 효소 없이 계면 활성제만으로" : "🔒 열쇠가 자물쇠에 맞지 않습니다"),
        70, 366, { s: 11.5, w: "800", c: v(m === 1 ? "--green-700" : (enz === "none" ? "--mist" : "--rose-700")) });

      /* 오른쪽 — 계기 + 온도 곡선 */
      text(ctx, "세탁 시험 결과", 356, 40, { s: 14, w: "900" });
      row(ctx, 352, 76, 300, "넣은 세제", ESHORT[enz], null);
      row(ctx, 352, 110, 300, "기질과의 짝 (특이성)", m === 1 ? "딱 맞음 (100 %)" : (enz === "none" ? "해당 없음" : "안 맞음 (12 %)"), m === 1 ? "--green" : null);
      row(ctx, 352, 144, 300, "효소 활성 (온도)", (a * 100).toFixed(0) + " %", a >= 0.77 ? "--green" : (a < 0.1 ? "--rose" : null));
      row(ctx, 352, 178, 300, "얼룩 제거율", rm.toFixed(0) + " %", rm >= 90 ? "--green" : (rm < 30 ? "--rose" : null));

      var x0 = 680, x1 = 872, y0 = 76, y1 = 196;
      axes(ctx, x0, y0, x1, y1);
      text(ctx, "온도별 제거율", x0, 62, { s: 11, w: "800", c: v("--mist") });
      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= 80; i++) {
        var tv = 10 + 80 * i / 80, yy = y1 - removal(tv) / 100 * (y1 - y0), xx = x0 + (x1 - x0) * i / 80;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      var cx = x0 + (x1 - x0) * (wt - 10) / 80, cy = y1 - rm / 100 * (y1 - y0);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      text(ctx, "10 °C", x0, y1 + 16, { s: 10, c: v("--mist") });
      text(ctx, "90 °C", x1, y1 + 16, { s: 10, c: v("--mist"), a: "right" });
      text(ctx, "물이 뜨겁다고 더 잘 지워지지 않습니다.", 352, 238, { s: 11.5, w: "800", c: v("--brand-700") });
      text(ctx, "55 °C 를 넘어서면 세제 속 효소도 변성되어 일을 멈춥니다.", 352, 260, { s: 11, c: v("--mist") });
      text(ctx, "그래서 효소 세제의 권장 수온은 30~40 °C 입니다.", 352, 280, { s: 11, c: v("--mist") });
      text(ctx, "소화제 · 연육제 · 콘택트 렌즈 세정제도 모두 같은 원리로", 352, 310, { s: 11, c: v("--mist") });
      text(ctx, "기질에 딱 맞는 효소를 골라 넣은 것입니다.", 352, 330, { s: 11, c: v("--mist") });

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
    segWire("a-stain", "data-s", function (x) { stain = x; draw(); });
    segWire("a-enz", "data-e", function (x) { enz = x; draw(); });
    $("a-wt").addEventListener("input", function (e) { wt = +e.target.value; $("a-wt-val").textContent = wt; draw(); });
    window.sthSort({
      mount: "s1-sort",
      buckets: [
        { id: "p", label: "단백질을 분해하는 효소", sub: "고기 · 핏자국 · 우유" },
        { id: "l", label: "지방을 분해하는 효소", sub: "기름때 · 버터 · 튀김" },
        { id: "c", label: "녹말을 분해하는 효소", sub: "밥 · 빵 · 감자" }
      ],
      items: [
        { t: "🧪 위액 속 펩신", a: "p", why: "펩신은 단백질을 분해하는 소화 효소입니다. 최적 pH 가 2 부근이라 강한 산성인 위 속에서 일합니다." },
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
        ? "정확했습니다. 효소가 없어도 반응은 일어납니다 — 다만 아주 느릴 뿐이지요. 김치냉장고 속 김치와 똑같습니다."
        : "정답은 ㉡ 입니다. 효소는 <b>반응물이 아니라 속도를 바꾸는 것</b>이었습니다. 이 한 문장이 김치냉장고의 비밀이기도 했습니다.");
  }
  function finish() { window.sthState("r1", "해결 · 효소는 활성화 에너지를 낮춰 속도만 바꾼다(최적 30 °C · pH 5.5, 변성은 되돌릴 수 없음)"); }
  window.sthPick({
    mount: "s1-q2",
    q: "김치냉장고를 <b>−2 °C</b> 로 맞춰 두면 김치에는 어떤 일이 일어날까요?",
    options: ["유산균의 효소가 죽어 김치가 영영 익지 않는다", "익는 반응이 아주 느려질 뿐, 김치는 계속 익고 있다", "효소가 변성되어 온도를 올려도 돌아오지 않는다", "저온에서는 활성화 에너지가 0이 되어 반응이 멈춘다"],
    answer: 1,
    why: ["낮은 온도는 효소를 <b>죽이지 않습니다.</b> 움직임이 느려져 일하는 속도가 떨어질 뿐, 온도를 올리면 다시 잘 일합니다.",
      "효소는 <b>속도만</b> 바꿉니다. 최적 조건에서 하루면 될 일이 −2 °C 에서는 몇 달로 늘어난 것뿐입니다. 김치냉장고에 오래 둔 김치가 결국 시어지는 까닭입니다.",
      "변성은 <b>높은 온도</b>에서 일어납니다. 통 ㉰ 가 그 경우였지요. 낮은 온도는 변성이 아닙니다.",
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
    question: "어떤 사람의 몸에서 지방 <b>10 kg</b> 이 줄었습니다. 그 10 kg 을 이루던 원자들은 <b>주로</b> 어디로 갔을까요?",
    options: ["㉠ 에너지로 바뀌어 사라졌다", "㉡ 대변으로 빠져나갔다", "㉢ 날숨 속 이산화 탄소가 되어 나갔다", "㉣ 땀과 오줌으로 빠져나갔다"],
    onPick: function (i) {
      window.sthState("metabOK", i === 2 ? "맞음" : "어긋남");
      ep.clear(0);
    }
  });

  /* 장면 2 — 세포 호흡 계량기 -------------------------------------------- */
  (function () {
    var canvas = $("c-resp"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var glu = 18;
    var got = window.sthState("respGot") || { a: false, b: false, c: false };

    function calc() {
      var mol = glu / 180;
      return { mol: mol, o2: mol * 6 * 32, co2: mol * 6 * 44, h2o: mol * 6 * 18,
               kJ: mol * 2802, kcal: mol * 2802 / 4.184, atp: mol * 32 };
    }
    function draw() {
      paper(ctx, W, H);
      var c = calc();
      text(ctx, "세포 호흡", 70, 40, { s: 14, w: "900", c: v("--brand-700") });
      text(ctx, "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + 에너지", 70, 66, { s: 16, w: "900" });

      /* 분자 그림 */
      function blob(x, y, r, col, label, n) {
        for (var i = 0; i < n; i++) {
          var ang = i / Math.max(n, 1) * Math.PI * 2, rr = n > 1 ? r * 1.5 : 0;
          ctx.fillStyle = v(col); ctx.globalAlpha = .85;
          ctx.beginPath(); ctx.arc(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr, r, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
        text(ctx, label, x, y + r * 2.6 + 18, { s: 11.5, w: "800", a: "center", c: v(col + "-700") || v("--ink") });
      }
      blob(128, 152, 17, "--violet", "포도당 1", 1);
      text(ctx, "+", 196, 158, { s: 20, w: "900", a: "center", c: v("--mist") });
      blob(268, 152, 9, "--teal", "산소 6", 6);
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 4;
      window.drawArrow(ctx, 336, 152, 408, 152, 12);
      text(ctx, "에너지 방출", 372, 132, { s: 11, w: "800", a: "center", c: v("--coral-700") });
      blob(470, 152, 9, "--coral", "이산화 탄소 6", 6);
      text(ctx, "+", 552, 158, { s: 20, w: "900", a: "center", c: v("--mist") });
      blob(628, 152, 9, "--brand", "물 6", 6);
      text(ctx, "🫁 날숨으로", 470, 216, { s: 11, a: "center", c: v("--mist") });
      text(ctx, "💧 오줌 · 땀 · 날숨으로", 628, 216, { s: 11, a: "center", c: v("--mist") });
      text(ctx, "포도당 1분자에서 ATP 가 약 32개 만들어집니다.", 70, 250, { s: 12, w: "800", c: v("--brand-700") });
      text(ctx, "큰 분자를 잘게 쪼개며 에너지를 내놓는 쪽 = 이화 작용", 70, 272, { s: 11.5, c: v("--mist") });

      /* 계기 */
      text(ctx, "포도당 " + glu + " g 을 태우면", 70, 312, { s: 13.5, w: "900" });
      row(ctx, 66, 348, 380, "포도당의 몰수 (1 mol = 180 g)", c.mol.toFixed(3) + " mol", null);
      row(ctx, 66, 382, 380, "들이마신 산소", c.o2.toFixed(1) + " g", null);
      row(ctx, 470, 312, 406, "날숨으로 나간 이산화 탄소", c.co2.toFixed(1) + " g", Math.abs(c.co2 - 44) < 0.5 ? "--green" : null);
      row(ctx, 470, 346, 406, "만들어진 물", c.h2o.toFixed(1) + " g", null);
      row(ctx, 470, 380, 406, "나온 에너지", Math.round(c.kJ).toLocaleString() + " kJ (" + Math.round(c.kcal).toLocaleString() + " kcal)", c.kcal >= 500 ? "--green" : null);
      text(ctx, "ATP " + c.atp.toFixed(2) + " mol 어치", 66, 414, { s: 11, c: v("--mist") });

      $("b-resp-info").innerHTML = "포도당 <b>" + glu + " g</b> (" + c.mol.toFixed(3) + " mol)을 세포 호흡으로 모두 분해하면 산소 <b>" + c.o2.toFixed(1) + " g</b> 을 쓰고, 이산화 탄소 <b>" + c.co2.toFixed(1) + " g</b> 과 물 <b>" + c.h2o.toFixed(1) + " g</b> 이 생기며 <b>" + Math.round(c.kcal).toLocaleString() + " kcal</b> 의 에너지가 나옵니다. " +
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
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>포도당 30 g 을 태우면 이산화 탄소가 <b>44 g</b> 나옵니다. 몸에서 나간 질량의 상당 부분이 <b>숨으로</b> 빠져나간 셈입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("b-glu").addEventListener("input", function (e) { glu = +e.target.value; $("b-glu-val").textContent = glu; draw(); });
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
    var n = 3, mode = "ana", prog = 0;
    var got = window.sthState("anabGot") || { a: false, b: false, ana: false, cat: false };

    function draw() {
      paper(ctx, W, H);
      var bonds = n - 1, water = n - 1, atp = 4 * (n - 1), mass = 110 * n + 18;
      text(ctx, "아미노산을 이어 붙이는 중", 70, 40, { s: 14, w: "900", c: v("--brand-700") });
      /* 사슬 */
      var perRow = 20, r = 11, x0 = 78, y0 = 84, dx = 38, dy = 54;
      for (var i = 0; i < n; i++) {
        var col = i % perRow, rw = Math.floor(i / perRow);
        var x = x0 + col * dx, y = y0 + rw * dy;
        if (col > 0) {
          ctx.strokeStyle = v("--coral"); ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(x - dx + r, y); ctx.lineTo(x - r, y); ctx.stroke();
        }
        ctx.fillStyle = v("--teal"); ctx.globalAlpha = .9;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        /* 빠져나온 물 */
        if (col > 0) {
          ctx.fillStyle = v("--brand"); ctx.globalAlpha = .55;
          ctx.beginPath(); ctx.arc(x - dx / 2, y - 22, 5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
      }
      text(ctx, "● 아미노산 " + n + "개", 78, y0 + Math.ceil(n / perRow) * dy + 6, { s: 11.5, w: "800", c: v("--teal-700") });
      text(ctx, "— 펩타이드 결합 " + bonds + "개", 220, y0 + Math.ceil(n / perRow) * dy + 6, { s: 11.5, w: "800", c: v("--coral-700") });
      text(ctx, "● 빠져나온 물 " + water + "분자", 400, y0 + Math.ceil(n / perRow) * dy + 6, { s: 11.5, w: "800", c: v("--brand-700") });

      row(ctx, 66, 268, 386, "아미노산의 개수", n + " 개", n === 10 ? "--green" : null);
      row(ctx, 66, 302, 386, "펩타이드 결합 · 빠져나온 물", bonds + " 개 · " + water + " 분자", n === 10 ? "--green" : null);
      row(ctx, 470, 268, 406, "조립에 드는 ATP (약 4개/결합)", atp + " 개", atp >= 100 ? "--green" : null);
      row(ctx, 470, 302, 406, "만들어진 사슬의 질량 (어림)", mass.toLocaleString() + " Da", null);
      text(ctx, "아미노산을 n 개 이으면 결합은 언제나 n − 1 개, 빠져나오는 물도 n − 1 분자입니다.", 66, 340, { s: 11.5, w: "800", c: v("--brand-700") });
      text(ctx, "작은 것을 크게 만드는 이 반응은 에너지를 ‘써야만’ 굴러갑니다 — 동화 작용.", 66, 362, { s: 11, c: v("--mist") });

      $("b-anab-info").innerHTML = "아미노산 <b>" + n + "개</b>를 이으면 펩타이드 결합 <b>" + bonds + "개</b>가 생기고 물 <b>" + water + "분자</b>가 빠져나옵니다. 여기에 ATP 가 약 <b>" + atp + "개</b> 쓰입니다. " +
        (n === 10 ? "🎉 열 개를 이으면 결합과 물은 아홉 개 — 언제나 하나가 적습니다."
          : (atp >= 100 ? "제법 긴 사슬입니다. 헤모글로빈의 β 사슬은 아미노산 146개짜리입니다."
            : "슬라이더를 움직여 사슬을 길게 해 보세요."));
      check();
    }
    function flow() {
      paper(ctx2, W2, H2);
      var isAna = mode === "ana", p = prog / 100;
      var smallN = isAna ? Math.round(6 * (1 - p)) : Math.round(6 * p);
      var bigN = isAna ? (p >= 0.999 ? 1 : 0) : (p >= 0.999 ? 0 : 1);
      var e = 2802 * p;

      text(ctx2, isAna ? "동화 작용 — 작은 것을 모아 큰 것으로" : "이화 작용 — 큰 것을 쪼개 작은 것으로",
        60, 38, { s: 14, w: "900", c: v(isAna ? "--violet-700" : "--coral-700") });

      function small(cx, cy, cnt) {
        for (var i = 0; i < cnt; i++) {
          var ang = i / 6 * Math.PI * 2;
          ctx2.fillStyle = v("--teal"); ctx2.globalAlpha = .85;
          ctx2.beginPath(); ctx2.arc(cx + Math.cos(ang) * 28, cy + Math.sin(ang) * 28, 11, 0, Math.PI * 2); ctx2.fill();
          ctx2.globalAlpha = 1;
        }
      }
      function big(cx, cy, cnt) {
        if (!cnt) return;
        ctx2.fillStyle = v("--violet"); ctx2.globalAlpha = .9;
        ctx2.beginPath(); ctx2.arc(cx, cy, 34, 0, Math.PI * 2); ctx2.fill(); ctx2.globalAlpha = 1;
      }
      if (isAna) { small(170, 150, smallN); big(610, 150, bigN); }
      else { big(170, 150, bigN); small(610, 150, smallN); }
      text(ctx2, isAna ? "작은 분자 (포도당 · 아미노산)" : "큰 분자 (녹말 · 단백질 · 지방)", 170, 214, { s: 11.5, w: "800", a: "center", c: v("--mist") });
      text(ctx2, isAna ? "큰 분자 (녹말 · 단백질 · 지방)" : "작은 분자 (CO₂ · H₂O · 아미노산)", 610, 214, { s: 11.5, w: "800", a: "center", c: v("--mist") });

      ctx2.strokeStyle = v(isAna ? "--violet" : "--coral"); ctx2.fillStyle = v(isAna ? "--violet" : "--coral"); ctx2.lineWidth = 5;
      window.drawArrow(ctx2, 250, 150, 250 + 280 * Math.max(p, 0.04), 150, 14);
      text(ctx2, isAna ? "에너지 흡수 ↑" : "에너지 방출 ↓", 390, 122, { s: 13, w: "900", a: "center", c: v(isAna ? "--violet-700" : "--coral-700") });
      text(ctx2, "진행률 " + prog + " %", 390, 180, { s: 12, w: "800", a: "center", c: v("--mist") });

      /* 에너지 막대 */
      text(ctx2, isAna ? "지금까지 쓴 에너지" : "지금까지 낸 에너지", 60, 258, { s: 11.5, w: "800", c: v("--mist") });
      ctx2.fillStyle = v("--card-2"); ctx2.fillRect(210, 246, 500, 16);
      ctx2.fillStyle = v(isAna ? "--violet" : "--coral"); ctx2.fillRect(210, 246, 500 * p, 16);
      text(ctx2, Math.round(e).toLocaleString() + " kJ", 720, 259, { s: 12, w: "800" });
      text(ctx2, "두 작용은 방향만 반대일 뿐 같은 저울 위에 있습니다. 몸속에서는 지금 이 순간에도 둘 다 돌아가고 있습니다.", 60, 296, { s: 11, c: v("--mist") });
      text(ctx2, "동화 작용과 이화 작용을 합쳐 물질대사라고 합니다.", 60, 318, { s: 11.5, w: "800", c: v("--brand-700") });

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
    $("b-n").addEventListener("input", function (e) { n = +e.target.value; $("b-n-val").textContent = n; draw(); });
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

    function draw() {
      paper(ctx, W, H);
      var B = bmr(), T = tdee(), sur = kcal - T, mo = monthly();
      text(ctx, "만 " + AGE + "세 · 키 " + HT + " cm · " + (sex === "m" ? "남" : "여") + " · " + wgt + " kg", 70, 40, { s: 13.5, w: "900", c: v("--brand-700") });

      /* 저울 그림 */
      var cxL = 240, cxR = 620, top = 76;
      function pan(cx, label, val, col, sub) {
        var hgt = clamp(val / 4000, 0, 1) * 130;
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(cx - 96, top, 192, 150, 14); ctx.fill();
        ctx.fillStyle = v(col); ctx.globalAlpha = .75;
        ctx.beginPath(); ctx.roundRect(cx - 88, top + 142 - hgt, 176, hgt, 10); ctx.fill(); ctx.globalAlpha = 1;
        text(ctx, label, cx, top - 10, { s: 12.5, w: "900", a: "center", c: v(col + "-700") || v("--ink") });
        text(ctx, Math.round(val).toLocaleString() + " kcal", cx, top + 84, { s: 20, w: "900", a: "center" });
        text(ctx, sub, cx, top + 110, { s: 10.5, a: "center", c: v("--mist") });
      }
      pan(cxL, "먹은 쪽 (동화로 저장)", kcal, "--violet", "하루 섭취 열량");
      pan(cxR, "쓴 쪽 (이화로 분해)", T, "--coral", "기초 대사량 × 활동량");
      ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); ctx.lineWidth = 3;
      if (sur > 0) window.drawArrow(ctx, 400, 150, 460, 150, 11);
      else if (sur < 0) window.drawArrow(ctx, 460, 150, 400, 150, 11);
      text(ctx, sur > 0 ? "남음" : (sur < 0 ? "모자람" : "딱 맞음"), 430, 128, { s: 12, w: "900", a: "center", c: v(Math.abs(mo) <= 0.2 ? "--green-700" : "--ink") });

      row(ctx, 66, 268, 386, "기초 대사량 (숨만 쉬어도 쓰는 양)", Math.round(B).toLocaleString() + " kcal", B >= 1600 ? "--green" : null);
      row(ctx, 66, 302, 386, "하루 소비 열량", Math.round(T).toLocaleString() + " kcal", null);
      row(ctx, 470, 268, 406, "하루에 남거나 모자란 몫", (sur >= 0 ? "+" : "−") + Math.abs(Math.round(sur)).toLocaleString() + " kcal", null);
      row(ctx, 470, 302, 406, "한 달 뒤 몸무게 변화",
        (mo >= 0 ? "+" : "−") + Math.abs(mo).toFixed(2) + " kg", Math.abs(mo) <= 0.2 ? "--green" : null);
      text(ctx, "지방 1 kg ≒ 7,700 kcal 로 어림했습니다.", 470, 330, { s: 10.5, c: v("--mist") });

      text(ctx, "기초 대사량은 체온을 지키고 심장을 뛰게 하고 세포가 새 단백질을 짓는 데 쓰입니다.", 66, 344, { s: 11, c: v("--mist") });
      text(ctx, "가만히 누워 있어도 몸속에서는 물질대사가 쉬지 않습니다.", 66, 364, { s: 11.5, w: "800", c: v("--brand-700") });
      text(ctx, "먹은 쪽이 크면 남은 몫이 지방으로 저장되고(동화), 쓴 쪽이 크면 저장해 둔 것을 꺼내 씁니다(이화).", 66, 392, { s: 11, c: v("--mist") });

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
        { t: "💪 아미노산을 이어 근육 단백질을 만든다", a: "a", why: "앞 장면에서 직접 조립해 본 반응입니다. ATP 를 씁니다." },
        { t: "🍠 남는 포도당을 이어 붙여 녹말로 저장한다", a: "a", why: "포도당 여러 개를 이어 큰 분자를 만듭니다." },
        { t: "🧈 남은 열량을 지방으로 저장한다", a: "a", why: "작은 분자를 모아 저장용 큰 분자를 만드는 합성 반응입니다." },
        { t: "🧬 DNA 를 복제해 새 DNA 사슬을 만든다", a: "a", why: "뉴클레오타이드라는 작은 단위를 이어 큰 분자를 만듭니다.", hint: "복제는 만드는 일일까요, 부수는 일일까요?" },
        { t: "🫁 세포가 포도당을 분해해 ATP 를 얻는다 (세포 호흡)", a: "c", why: "큰 분자를 쪼개며 에너지를 내놓습니다." },
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
    q: "살이 빠질 때 <b>지방을 이루던 원자</b>의 가장 많은 몫이 몸 밖으로 나가는 길은?",
    options: ["땀", "오줌", "날숨", "대변"],
    answer: 2,
    why: ["땀으로 나가는 것은 주로 물과 소금입니다. 지방을 이루던 탄소는 땀으로 나가지 않습니다.",
      "오줌으로도 물의 일부가 나가지만 가장 큰 몫은 아닙니다.",
      "지방을 이루던 원자의 약 <b>84 %</b> 는 세포 호흡을 거쳐 <b>이산화 탄소</b>가 되어 날숨으로 나갑니다. 나머지는 물이 되어 오줌·땀·날숨으로 나갑니다.",
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
    text(ctx, label, 16, y + 4, { s: 10.5, c: v("--mist") });
    for (var i = 0; i < seq.length; i++) {
      var x = 186 + i * 26;
      ctx.fillStyle = v(colOf(i)); ctx.globalAlpha = (hi === i) ? 1 : .8;
      ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      if (hi === i) { ctx.strokeStyle = v("--rose-700") || v("--ink"); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.stroke(); }
      text(ctx, seq.charAt(i), x, y + 4, { s: 11.5, w: "900", a: "center", c: v("--on-accent") });
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

  /* 장면 2 — 전사와 번역 -------------------------------------------------- */
  (function () {
    var canvas = $("c-express"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var rib = 0, box = { gen: 0 }, run = ticker(box);
    var got = window.sthState("exprGot") || { a: false, b: false };

    function draw() {
      paper(ctx, W, H);
      var coding = "";
      for (var k = 0; k < TPL.length; k++) coding += COMP[TPL.charAt(k)];
      text(ctx, "사람 헤모글로빈 β 유전자의 앞부분 (염기 27개)", 16, 34, { s: 13.5, w: "900", c: v("--brand-700") });

      strand(ctx, 74, TPL, function () { return "--mist"; }, "DNA 주형 가닥", -1);
      strand(ctx, 126, coding, function () { return "--cold"; }, "DNA 암호화 가닥", -1);
      ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal"); ctx.lineWidth = 3;
      window.drawArrow(ctx, 120, 150, 120, 176, 10);
      text(ctx, "전사", 112, 168, { s: 11.5, w: "800", a: "right", c: v("--teal-700") });
      strand(ctx, 196, NORMAL.mrna, function (i) { return i < rib * 3 ? "--teal" : "--line"; }, "전사된 mRNA", -1);

      /* 리보솜 */
      if (rib > 0) {
        var rx = 186 + (rib - 1) * 3 * 26 + 26;
        ctx.fillStyle = v("--amber"); ctx.globalAlpha = .35;
        ctx.beginPath(); ctx.roundRect(rx - 52, 172, 104, 48, 16); ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = v("--amber-700"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(rx - 52, 172, 104, 48, 16); ctx.stroke();
        text(ctx, "리보솜", rx, 236, { s: 11, w: "800", a: "center", c: v("--amber-700") });
      }

      /* 코돈 · 아미노산 */
      text(ctx, "코돈 → 아미노산", 16, 292, { s: 11.5, w: "800", c: v("--mist") });
      for (var i = 0; i < 9; i++) {
        var bx = 173 + i * 78, on = i < rib;
        ctx.fillStyle = on ? v("--violet-100") : v("--card-2");
        ctx.beginPath(); ctx.roundRect(bx, 262, 72, 56, 10); ctx.fill();
        if (on) { ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2; ctx.stroke(); }
        text(ctx, NORMAL.codons[i], bx + 36, 284, { s: 12, w: "800", a: "center", c: on ? v("--violet-700") : v("--mist") });
        text(ctx, on ? NORMAL.aas[i] : "—", bx + 36, 306, { s: 12.5, w: "900", a: "center", c: on ? v("--ink") : v("--mist") });
      }

      /* 완성된 사슬 */
      text(ctx, "만들어진 폴리펩타이드", 16, 356, { s: 11.5, w: "800", c: v("--mist") });
      for (var j = 0; j < rib; j++) {
        var cx = 200 + j * 62;
        if (j > 0) { ctx.strokeStyle = v("--coral"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 62 + 18, 352); ctx.lineTo(cx - 18, 352); ctx.stroke(); }
        ctx.fillStyle = v("--teal"); ctx.globalAlpha = .9;
        ctx.beginPath(); ctx.arc(cx, 352, 17, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        text(ctx, NORMAL.aas[j], cx, 356, { s: 10.5, w: "900", a: "center", c: v("--on-accent") });
      }
      if (rib === 0) text(ctx, "슬라이더를 밀면 리보솜이 코돈을 하나씩 읽습니다.", 200, 356, { s: 11.5, c: v("--mist") });

      text(ctx, "염기 " + (rib * 3) + "개를 읽어 아미노산 " + rib + "개 — 언제나 3 : 1 입니다.", 16, 400, { s: 11.5, w: "800", c: v("--brand-700") });
      text(ctx, "DNA → (전사) → mRNA → (번역) → 단백질. 정보는 한 방향으로만 흐릅니다. 이것을 중심 원리라고 합니다.", 16, 424, { s: 11, c: v("--mist") });

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
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>전사는 <b>DNA 를 본떠 mRNA 를 만드는 일</b>, 번역은 <b>코돈 세 글자를 아미노산 하나로 바꾸는 일</b>이었습니다.");
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
    window.sthPick({
      mount: "s3-q1",
      q: "전사와 번역에 대한 설명으로 <b>옳은</b> 것은?",
      options: ["전사는 mRNA 를 본떠 DNA 를 만드는 일이다", "번역은 코돈 한 글자가 아미노산 하나를 지정하는 일이다", "전사로 만들어진 mRNA 의 염기 3개가 아미노산 1개를 지정한다", "단백질의 아미노산 수와 mRNA 의 염기 수는 같다"],
      answer: 2,
      why: ["방향이 반대입니다. <b>DNA 를 본떠 mRNA</b> 를 만드는 일이 전사입니다.",
        "한 글자가 아니라 <b>세 글자(코돈)</b> 가 아미노산 하나를 지정합니다.",
        "맞습니다. 염기 3개가 모여 <b>코돈</b> 하나를 이루고, 코돈 하나가 아미노산 하나를 지정합니다. 화면에서 3 : 1 로 세어 보았지요.",
        "염기 수는 아미노산 수의 <b>약 3배</b> 입니다. 여기에 정지 코돈까지 더해집니다."],
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
    function draw() {
      paper(ctx, W, H);
      var s = seq(), o = express(s), changed = !!base && base !== TPL.charAt(pos - 1);
      var coding = "", k;
      for (k = 0; k < s.length; k++) coding += COMP[s.charAt(k)];

      text(ctx, changed ? "돌연변이 — " + pos + "번째 염기 " + TPL.charAt(pos - 1) + " → " + base : "정상 서열 (아직 바뀐 곳이 없습니다)",
        16, 34, { s: 13.5, w: "900", c: v(changed ? "--rose-700" : "--brand-700") });

      strand(ctx, 74, s, function (i) { return (changed && i === pos - 1) ? "--rose" : "--mist"; }, "DNA 주형 가닥", changed ? pos - 1 : -1);
      strand(ctx, 126, coding, function (i) { return (changed && i === pos - 1) ? "--rose" : "--cold"; }, "DNA 암호화 가닥", -1);
      strand(ctx, 186, o.mrna, function (i) { return (changed && i === pos - 1) ? "--rose" : "--teal"; }, "전사된 mRNA", changed ? pos - 1 : -1);

      /* 코돈 · 아미노산 비교 */
      text(ctx, "정상", 16, 264, { s: 11.5, w: "800", c: v("--mist") });
      text(ctx, "지금", 16, 330, { s: 11.5, w: "800", c: v(changed ? "--rose-700" : "--mist") });
      for (var i = 0; i < 9; i++) {
        var bx = 173 + i * 78;
        var nowC = o.codons[i], nowA = o.aas[i];
        var diff = (nowC !== NORMAL.codons[i]) || (nowA !== NORMAL.aas[i]);
        ctx.fillStyle = v("--card-2");
        ctx.beginPath(); ctx.roundRect(bx, 236, 72, 46, 10); ctx.fill();
        text(ctx, NORMAL.codons[i], bx + 36, 254, { s: 11, a: "center", c: v("--mist") });
        text(ctx, NORMAL.aas[i], bx + 36, 272, { s: 12, w: "800", a: "center", c: v("--mist") });

        var gone = nowC === undefined;
        var col = gone ? v("--mist") : (diff ? v("--rose-700") : v("--teal-700"));
        ctx.fillStyle = gone ? v("--card-2") : (diff ? v("--rose-100") : v("--teal-100"));
        ctx.beginPath(); ctx.roundRect(bx, 302, 72, 46, 10); ctx.fill();
        if (diff && !gone) { ctx.strokeStyle = v("--rose"); ctx.lineWidth = 2; ctx.stroke(); }
        text(ctx, gone ? "—" : nowC, bx + 36, 320, { s: 11, a: "center", c: col });
        text(ctx, nowA === undefined ? (o.stopped && i === o.codons.length - 1 ? "정지" : "—") : nowA, bx + 36, 338,
          { s: 12, w: "900", a: "center", c: col });
      }

      /* 판정 */
      var kind, tone, msg;
      if (!changed) { kind = "바뀐 곳 없음"; tone = "--mist"; msg = "자리를 고르고 아래 염기 단추를 눌러 한 글자를 바꿔 보세요."; }
      else if (o.stopped) { kind = "정지 코돈이 생김"; tone = "--rose"; msg = "단백질이 아미노산 " + o.aas.length + "개에서 <b>끊겼습니다.</b> 제구실을 하는 단백질이 만들어지지 못합니다."; }
      else if (o.aas.join("-") === NORMAL.aas.join("-")) { kind = "아미노산 서열 그대로"; tone = "--teal"; msg = "염기는 바뀌었는데 <b>아미노산은 그대로</b>입니다. 같은 아미노산을 가리키는 코돈이 여럿이기 때문입니다."; }
      else {
        var idx = 0;
        for (var j = 0; j < 9; j++) if (o.aas[j] !== NORMAL.aas[j]) { idx = j; break; }
        kind = (idx + 1) + "번째 아미노산이 바뀜";
        tone = o.aas[6] === "Val" ? "--rose" : "--amber";
        msg = (KOR[NORMAL.aas[idx]] || NORMAL.aas[idx]) + "(" + NORMAL.aas[idx] + ") 이 " + (KOR[o.aas[idx]] || o.aas[idx]) + "(" + o.aas[idx] + ") 로 바뀌었습니다." +
          (idx === 6 && o.aas[6] === "Val" ? " <b>바로 이것이 낫 모양 적혈구 빈혈증입니다.</b>" : "");
      }
      ctx.fillStyle = v(tone === "--mist" ? "--card-2" : tone + "-100");
      ctx.beginPath(); ctx.roundRect(16, 372, 868, 46, 12); ctx.fill();
      text(ctx, kind, 34, 400, { s: 15, w: "900", c: v(tone === "--mist" ? "--mist" : tone + "-700") });
      text(ctx, "아미노산 " + o.aas.length + "개 : " + (o.aas.length ? o.aas.join("-") : "없음"), 872, 401, { s: 12, w: "800", a: "right" });
      text(ctx, "코돈표에는 같은 아미노산을 가리키는 코돈이 여럿 있습니다. 그래서 한 글자가 바뀌어도 아무 일이 없기도 합니다.", 16, 442, { s: 11, c: v("--mist") });

      $("c-mut-info").innerHTML = (changed ? "주형 가닥 <b>" + pos + "번째</b> 염기를 <b>" + TPL.charAt(pos - 1) + " → " + base + "</b> 로 바꿨습니다. " : "") + msg;
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
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>같은 ‘한 글자’ 인데 결과는 셋이었습니다 — <b>아무 일 없음 · 아미노산 하나 바뀜 · 단백질이 끊김.</b>");
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
      paper(ctx, W, H);
      var bpp = bpPerPx(), view = bpp * BARW;
      var genePx = GENE / bpp, codonPx = 3 / bpp, basePx = 1 / bpp;

      text(ctx, "사람의 DNA 를 자로 재 보기", 60, 36, { s: 14, w: "900", c: v("--brand-700") });
      text(ctx, "배율 × " + sci(mag()) + " · 화면 가로 한 줄 = " + sci(view) + " 염기쌍", 860, 36, { s: 12, w: "800", a: "right" });

      /* 자 */
      var barY = 74;
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(X0, barY, BARW, 52, 10); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.stroke();
      /* 염기 글자가 보일 만큼 확대되면 */
      if (basePx >= 14) {
        var nShow = Math.min(TPL.length, Math.floor(BARW / basePx) + 1);
        ctx.save();
        ctx.beginPath(); ctx.rect(X0, barY, BARW, 52); ctx.clip();
        for (var i = 0; i < nShow; i++) {
          var bxx = X0 + (BARW - nShow * basePx) / 2 + i * basePx;
          ctx.fillStyle = v(i % 3 === 0 ? "--teal" : "--cold"); ctx.globalAlpha = .55;
          ctx.fillRect(bxx + 1, barY + 4, Math.max(basePx - 2, 2), 44); ctx.globalAlpha = 1;
        }
        ctx.restore();
        if (basePx >= 22) {
          for (var q = 0; q < nShow; q++) {
            var tx = X0 + (BARW - nShow * basePx) / 2 + q * basePx + basePx / 2;
            if (tx < X0 + 8 || tx > X0 + BARW - 8) continue;
            text(ctx, TPL.charAt(q), tx, barY + 34, { s: 15, w: "900", a: "center", c: v("--ink") });
          }
        }
      }
      /* 유전자 표시 */
      var gw = Math.max(genePx, 0.7), gx = X0 + BARW / 2 - gw / 2;
      ctx.fillStyle = v("--rose"); ctx.globalAlpha = .85;
      ctx.fillRect(clamp(gx, X0, X0 + BARW), barY - 6, clamp(gw, 0.7, BARW), 64); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--rose-700") || v("--rose"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X0 + BARW / 2, barY - 6); ctx.lineTo(X0 + BARW / 2, barY - 22); ctx.stroke();
      text(ctx, "헤모글로빈 β 유전자 (약 1,600 염기쌍) — 지금 화면에서 " + (genePx < 1 ? genePx.toFixed(3) : genePx.toFixed(1)) + " px",
        X0 + BARW / 2, barY - 28, { s: 11.5, w: "800", a: "center", c: v("--rose-700") });

      /* 계기 */
      row(ctx, 56, 190, 404, "사람의 DNA 전체", "약 30억 (3.1 × 10" + sup(9) + ") 염기쌍", null);
      row(ctx, 56, 224, 404, "그중 11번 염색체", "약 1억 3,500만 염기쌍", null);
      row(ctx, 56, 258, 404, "헤모글로빈 β 유전자", "약 1,600 염기쌍", null);
      row(ctx, 56, 292, 404, "그중 아미노산을 지정하는 부분", CODING + " 염기 (146 × 3 + 정지 코돈)", null);
      row(ctx, 480, 190, 404, "화면에서 유전자의 폭", (genePx < 1 ? genePx.toFixed(3) : genePx.toFixed(1)) + " px", genePx >= 1 ? "--green" : null);
      row(ctx, 480, 224, 404, "화면에서 코돈 하나의 폭", (codonPx < 1 ? codonPx.toFixed(4) : codonPx.toFixed(1)) + " px", codonPx >= 10 ? "--green" : null);
      row(ctx, 480, 258, 404, "유전자가 DNA 전체에서 차지하는 비율", "0.000052 %", null);
      row(ctx, 480, 292, 404, "DNA 전체 : 이 유전자", "약 1,940,000 : 1", null);

      text(ctx, "DNA 전체를 400 m 트랙에 펼친다면 이 유전자는 그 위의 0.2 mm 짜리 점입니다.", 56, 338, { s: 11.5, w: "800", c: v("--brand-700") });
      text(ctx, "전사는 이 점 하나만 본떠 RNA 를 만드는 일이지, DNA 전체를 옮겨 적는 일이 아닙니다.", 56, 360, { s: 11, c: v("--mist") });
      text(ctx, "세포는 필요한 유전자만 골라 그때그때 전사합니다. 그래서 같은 DNA 를 가진 세포들이 서로 다른 일을 합니다.", 56, 382, { s: 11, c: v("--mist") });

      $("c-scale-info").innerHTML = "배율 <b>× " + sci(mag()) + "</b> · 화면 가로 한 줄이 <b>" + sci(view) + " 염기쌍</b> 입니다. 이때 유전자의 폭은 <b>" + (genePx < 1 ? genePx.toFixed(3) : genePx.toFixed(1)) + " px</b>. " +
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
      options: ["DNA 전체가 옮겨 적히므로 DNA 와 크기가 거의 같다", "DNA 전체의 절반 정도 크기다", "유전자 한 토막만 옮겨 적히므로 DNA 에 비해 매우 작다", "RNA 가 DNA 보다 오히려 크다"],
      answer: 2,
      why: ["방금 자로 재 보았습니다. 유전자 하나는 DNA 전체의 약 200만 분의 1 이었습니다.",
        "절반이 아니라 <b>수백만 분의 일</b> 입니다.",
        "맞습니다. DNA 에는 수많은 유전자가 있고, 전사될 때는 <b>필요한 유전자 한 토막만</b> 본떠집니다. 그래서 만들어지는 RNA 는 DNA 에 비해 매우 작습니다.",
        "RNA 는 유전자 한 토막을 본뜬 것이므로 DNA 보다 훨씬 작습니다."],
      onDone: function () { got.c = true; window.sthState("scaleGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 -------------------------------------------------------- */
  var STEPS = [
    "DNA 주형 가닥의 염기 한 글자가 다른 염기로 바뀐다",
    "전사된 mRNA 에서 그 자리의 코돈이 GAG 에서 GUG 로 바뀐다",
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
    { key: "r3", label: "③ 한 글자가 바뀌면" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "익지 않는 김치, 숨으로 빠져나간 지방, 낫 모양 적혈구. 세 이야기에는 모두 ‘단백질’이 들어 있습니다. 생명 시스템이 유지되려면 무엇이 필요한지 ‘화학 반응’과 ‘정보’라는 말을 넣어 한 문장으로 쓰세요.", ph: "" },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다.", ph: "" }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-3-3", unitLabel: "[통합과학1 Ⅲ-3] 생명 시스템",
  rows: [
    { key: "r1", label: "① 익지 않는 김치" },
    { key: "r2", label: "② 빠진 살은 어디로 갔을까" },
    { key: "r3", label: "③ 한 글자가 바뀌면" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
