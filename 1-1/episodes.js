/* 통합과학1 Ⅰ-1 과학의 기본량 — 소단원별 이야기 세 편
   01 단위를 잃어버린 우주선 / 02 10의 거듭제곱으로 걷기 / 03 0을 세다가 밤을 새운 보고서
   공용 부품: ../assets/theme.js (sthUnit·sthState·sthGate·sthWork·setupCanvas·cssVar·drawArrow),
             ../assets/story.js (sthStory·sthMission·sthSort·sthOrder·sthPick), ../assets/share.js (sthShare) */
(function () {
"use strict";

window.sthUnit("is1-1-1");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
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
function dash(ctx, x0, y, x1, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
}
var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", ".": "·" };
function sup(n) {
  return String(n).split("").map(function (c) { return SUP[c] !== undefined ? SUP[c] : c; }).join("");
}
/* x 를 A × 10ⁿ 꼴 문자열로 (계수는 d 자리) */
function sciStr(x, d) {
  if (d == null) d = 1;
  if (!x) return "0";
  var e = Math.floor(Math.log(Math.abs(x)) / Math.LN10);
  var a = x / Math.pow(10, e);
  a = +a.toFixed(d);
  if (Math.abs(a) >= 10) { a = a / 10; e = e + 1; }
  return a.toFixed(d) + " × 10" + sup(e);
}
/* 사람이 읽기 좋은 수 */
function numStr(x) {
  if (x === 0) return "0";
  if (Math.abs(x) >= 1e5 || Math.abs(x) < 0.01) return sciStr(x, 1);
  return (Math.round(x * 100) / 100).toLocaleString();
}

/* =========================================================================
   이야기 ① 단위를 잃어버린 우주선
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });
  var LBF = 4.448222;

  /* 장면 1 — 첫 추리 */
  window.sthGate({
    gate: "g1", key: "p1", title: "조사관의 첫 추리",
    question: "아홉 달 반을 날아온 궤도선은 왜 예정보다 169 km 나 낮은 곳으로 들어갔을까요?",
    options: ["㉠ 엔진이 고장 나 속도를 줄이지 못했다", "㉡ 두 팀이 서로 다른 단위를 써서 값이 어긋났다", "㉢ 화성의 중력이 예상과 달랐다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 두 저울 (계산 모형: N ↔ lbf) */
  (function () {
    var canvas = $("a-gauge"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var F = 10, got = window.sthState("aGauge") || { a: false, b: false };

    function dial(cx, cy, r, frac, title, big, sub, col) {
      var a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, f = clamp(frac, 0, 1);
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 2;
      for (var i = 0; i <= 10; i++) {
        var an = a0 + (a1 - a0) * i / 10;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(an) * (r - 7), cy + Math.sin(an) * (r - 7));
        ctx.lineTo(cx + Math.cos(an) * (r - 17), cy + Math.sin(an) * (r - 17));
        ctx.stroke();
      }
      ctx.strokeStyle = v(col); ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(cx, cy, r - 12, a0, a0 + (a1 - a0) * f); ctx.stroke();
      ctx.lineCap = "butt";
      var na = a0 + (a1 - a0) * f;
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(na) * (r - 26), cy + Math.sin(na) * (r - 26)); ctx.stroke();
      ctx.fillStyle = v("--ink"); ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      text(ctx, title, cx, cy - r - 16, { s: 13, w: "800", a: "center" });
      text(ctx, big, cx, cy + r + 30, { s: 24, w: "900", a: "center", c: v(col) });
      text(ctx, sub, cx, cy + r + 50, { s: 11, a: "center", c: v("--mist") });
    }

    function draw() {
      paper(ctx, W, H);
      var lbf = F / LBF;
      dial(215, 160, 84, F / 50, "뉴턴 저울 (SI 단위)", F.toFixed(1) + " N", "0 ~ 50 뉴턴", "--brand");
      dial(685, 160, 84, lbf / (50 / LBF), "파운드힘 저울 (미국 관습 단위)", lbf.toFixed(2) + " lbf", "0 ~ 11.24 파운드힘", "--coral");
      text(ctx, "같은 손잡이를 두 저울이 함께 잰다", 450, 96, { s: 13, w: "800", a: "center" });
      ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); ctx.lineWidth = 2;
      window.drawArrow(ctx, 390, 132, 330, 132, 9);
      window.drawArrow(ctx, 510, 132, 570, 132, 9);
      text(ctx, "N ÷ 4.448222 = lbf", 450, 178, { s: 15, w: "900", a: "center", c: v("--violet-700") });
      text(ctx, "힘의 크기는 하나인데, 붙이는 이름이 둘이다", 450, 210, { s: 11.5, a: "center", c: v("--mist") });
      text(ctx, "눈금이 달라도 두 값의 비는 언제나 같습니다", 450, 236, { s: 11.5, a: "center", c: v("--mist") });

      var msg = "뉴턴 저울 <b>" + F.toFixed(1) + " N</b> = 파운드힘 저울 <b>" + lbf.toFixed(3) + " lbf</b>.";
      if (Math.abs(lbf - 1) <= 0.02) msg += " 파운드힘 저울이 딱 1 을 가리킵니다. 그때 뉴턴 저울은 <b>4.4 N 쯤</b>이지요.";
      else if (Math.abs(lbf - 10) <= 0.2) msg += " 10 배가 되어도 뉴턴 쪽은 여전히 4.45 배입니다.";
      else msg += " 손잡이를 움직여 파운드힘 저울의 눈금을 1.0 과 10.0 에 맞춰 보세요.";
      $("a-gauge-info").innerHTML = msg;

      var ch = false;
      if (Math.abs(lbf - 1) <= 0.02 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(lbf - 10) <= 0.2 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("aGauge", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.a && got.b) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>1 lbf = <b>4.448222 N</b>. 파운드힘으로 적힌 숫자를 그대로 뉴턴으로 읽으면, 실제 힘의 <b>4.45분의 1</b>만 있다고 착각하게 됩니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("a-f").addEventListener("input", function (e) {
      F = +e.target.value; $("a-f-val").textContent = F.toFixed(1) + " N"; draw();
    });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m1-2", true);
  })();

  /* 장면 3 — 궤도 재계산 (계산 모형: 환산 계수 → 근화점 고도) */
  (function () {
    var canvas = $("a-orbit"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var k = 1;
    function alt(kk) { return 8 + 49 * kk; }
    function yOf(h) { return 330 - h * 0.78; }

    function draw() {
      paper(ctx, W, H);
      var h = alt(k), yp = yOf(h);
      /* 화성 표면과 대기 */
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.16; ctx.fillRect(0, yOf(80), W, 330 - yOf(80)); ctx.globalAlpha = 1;
      ctx.fillStyle = v("--coral"); ctx.fillRect(0, 330, W, 30);
      text(ctx, "화성 표면", 24, 350, { s: 12, w: "800", c: v("--on-accent") });
      text(ctx, "화성 대기 — 이 아래로 들어가면 타 버린다", 24, 300, { s: 11.5, w: "800", c: v("--brand-700") });
      /* 고도 눈금 */
      for (var g = 0; g <= 300; g += 100) {
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(60, yOf(g)); ctx.lineTo(880, yOf(g)); ctx.stroke();
        text(ctx, g + " km", 54, yOf(g) + 4, { s: 10.5, a: "right", c: v("--mist") });
      }
      dash(ctx, 60, yOf(226), 880, v("--teal"));
      text(ctx, "예정 고도 226 km", 876, yOf(226) - 8, { s: 11.5, w: "800", a: "right", c: v("--teal-700") });
      dash(ctx, 60, yOf(80), 880, v("--rose"));
      text(ctx, "생존 한계 80 km", 876, yOf(80) - 8, { s: 11.5, w: "800", a: "right", c: v("--rose-700") });
      /* 접근 궤적 */
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 3; ctx.beginPath();
      for (var x = 60; x <= 880; x += 4) {
        var t = (x - 430) / 370, yy = Math.max(16, yp - t * t * 215);
        if (x === 60) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
      text(ctx, "🛰️", 430, yp + 8, { s: 24, a: "center" });
      ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(430, yp, 5, 0, Math.PI * 2); ctx.fill();
      text(ctx, "근화점 고도 " + Math.round(h) + " km", 452, yp + 5, { s: 13, w: "900", c: v("--violet-700") });

      var mark, note;
      if (h < 80) { mark = "🔥 대기에서 부서짐"; note = "예정보다 훨씬 낮습니다. <b>1999년의 실제 결과(약 57 km)</b>가 바로 이 자리입니다."; }
      else if (h < 218) { mark = "⚠️ 너무 낮음"; note = "대기권 위쪽을 스치며 저항을 받아 예정 궤도를 유지하지 못합니다. 계수를 더 키워 보세요."; }
      else if (h <= 234) { mark = "✅ 진입 성공"; note = "예정 고도에 들어갔습니다. 이때의 계수는 <b>4.448222</b>, 곧 1 lbf 를 N 으로 바꾸는 값입니다."; }
      else if (h <= 280) { mark = "⚠️ 너무 높음"; note = "궤도에는 들어가지만 예정보다 높아 관측 임무를 할 수 없습니다. 계수를 조금 줄여 보세요."; }
      else { mark = "🚀 화성을 지나침"; note = "속도를 충분히 줄이지 못해 화성 중력에 붙잡히지 못합니다. 너무 커도 실패입니다."; }
      text(ctx, mark, 876, 36, { s: 14, w: "900", a: "right", c: v("--ink") });
      $("a-orbit-info").innerHTML = "환산 계수 <b>× " + k.toFixed(1) + "</b> → 근화점 고도 <b>" + Math.round(h) + " km</b> · " + mark + "<br>" + note;

      if (Math.abs(h - 226) <= 8) {
        if (window.sthState("aK") !== k) window.sthState("aK", k);
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>계수 <b>× " + k.toFixed(1) + "</b> 으로 고도 <b>" + Math.round(h) + " km</b> 진입. 실제로 필요했던 값은 <b>4.448222</b>였습니다. 계수를 1 로 두면 고도 57 km — 1999년에 일어난 그대로입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("a-k").addEventListener("input", function (e) {
      k = +e.target.value; $("a-k-val").textContent = "× " + k.toFixed(1); draw();
    });
    draw();
    if (ep.cleared(2)) window.sthMission("m1-3", true);
  })();

  /* 장면 4 — 기본량 카드 · 켈빈 온도계 · 분류 */
  (function () {
    var canvas = $("a-cards"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var sel = -1;
    var units = [
      { q: "길이", sym: "m", name: "미터", c: "--brand", desc: "빛이 진공에서 <b>1/299,792,458초</b> 동안 진행한 거리입니다. 자의 길이가 아니라 빛과 시간으로 정해 둔 것이지요." },
      { q: "질량", sym: "kg", name: "킬로그램", c: "--coral", desc: "1889년부터 130년 동안은 파리에 보관된 <b>금속 원기</b>가 기준이었습니다. <b>2019년</b>부터는 <b>플랑크 상수</b>의 값을 고정해 정의합니다." },
      { q: "시간", sym: "s", name: "초", c: "--violet", desc: "세슘-133 원자가 내는 특정 복사선이 <b>9,192,631,770번</b> 진동하는 데 걸리는 시간입니다. 이것이 원자시계의 원리입니다." },
      { q: "전류", sym: "A", name: "암페어", c: "--teal", desc: "전자 한 개의 전하량(기본 전하 e)의 값을 고정해 정의합니다. 1 A 는 1초에 약 6.24×10¹⁸ 개의 전하가 지나가는 셈입니다." },
      { q: "온도", sym: "K", name: "켈빈", c: "--rose", desc: "볼츠만 상수의 값을 고정해 정의합니다. <b>0 K 는 절대 영도</b>이고, 섭씨온도와는 273.15 만큼 차이가 납니다." },
      { q: "물질량", sym: "mol", name: "몰", c: "--green", desc: "입자 <b>6.02214076×10²³ 개</b>(아보가드로수)의 모임입니다. 눈에 보이지 않는 입자를 세기 위한 묶음 단위이지요." },
      { q: "광도", sym: "cd", name: "칸델라", c: "--amber", desc: "정해진 진동수의 빛을 내는 광원이 한 방향으로 보내는 밝기입니다. 촛불 한 개의 밝기에서 비롯한 단위입니다." }
    ];
    function draw() {
      paper(ctx, W, H);
      units.forEach(function (u, i) {
        var col = i % 4, row = (i / 4) | 0, x = col * 225 + 12, y = row * 150 + 16;
        ctx.fillStyle = v(i === sel ? "--card-2" : "--panel");
        ctx.beginPath(); ctx.roundRect(x, y, 201, 120, 16); ctx.fill();
        ctx.strokeStyle = v(i === sel ? u.c : "--line"); ctx.lineWidth = i === sel ? 3 : 2;
        ctx.beginPath(); ctx.roundRect(x, y, 201, 120, 16); ctx.stroke();
        text(ctx, u.sym, x + 100, y + 54, { s: 30, w: "900", a: "center", c: v(u.c) });
        text(ctx, u.q, x + 100, y + 82, { s: 14, w: "800", a: "center" });
        text(ctx, u.name, x + 100, y + 102, { s: 11, a: "center", c: v("--mist") });
      });
      text(ctx, "기본량은 이 7개가 전부입니다. 넓이·속력·힘·에너지는 모두 이 7개를 곱하고 나눠 만든 유도량입니다.", 16, 318, { s: 11.5, c: v("--mist") });
    }
    canvas._redraw = draw;
    canvas.addEventListener("click", function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas._w / rect.width);
      var my = (e.clientY - rect.top) * (canvas._h / rect.height);
      var col = Math.floor(mx / 225), row = Math.floor(my / 150), idx = row * 4 + col;
      if (row < 0 || row > 1 || col < 0 || col > 3 || !units[idx]) return;
      sel = idx; draw();
      $("a-cards-info").innerHTML = "<b>" + units[idx].q + " · " + units[idx].sym + " (" + units[idx].name + ")</b> — " + units[idx].desc;
    });
    draw();
  })();

  (function () {
    var canvas = $("a-temp"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var c = 25, got = window.sthState("aTemp") || { b: false, c: false };
    function xOf(t) { return 90 + (t + 273) / 473 * 740; }
    function draw() {
      paper(ctx, W, H);
      var K = c + 273.15;
      var grad = ctx.createLinearGradient(90, 0, 830, 0);
      grad.addColorStop(0, v("--brand")); grad.addColorStop(0.55, v("--amber")); grad.addColorStop(1, v("--coral"));
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(90, 120, 740, 32, 16); ctx.fill();
      ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(90, 120, Math.max(6, xOf(c) - 90), 32, 16); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(90, 120, 740, 32, 16); ctx.stroke();
      [-273, -200, -100, 0, 100, 200].forEach(function (t) {
        var x = xOf(t);
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 152); ctx.lineTo(x, 162); ctx.stroke();
        text(ctx, t + "", x, 178, { s: 10.5, a: "center", c: v("--mist") });
        text(ctx, Math.round(t + 273.15) + "", x, 198, { s: 10.5, a: "center", c: v("--mist") });
      });
      text(ctx, "℃", 62, 178, { s: 11.5, w: "800", a: "right" });
      text(ctx, "K", 62, 198, { s: 11.5, w: "800", a: "right" });
      ctx.fillStyle = v("--ink");
      ctx.beginPath(); ctx.moveTo(xOf(c), 112); ctx.lineTo(xOf(c) - 8, 98); ctx.lineTo(xOf(c) + 8, 98); ctx.closePath(); ctx.fill();
      text(ctx, c + " ℃  =  " + K.toFixed(2) + " K", 450, 70, { s: 22, w: "900", a: "center", c: v("--rose-700") });
      text(ctx, "0 K 보다 낮은 온도는 없습니다. 그래서 켈빈에는 음수가 없습니다.", 90, 220, { s: 11, c: v("--mist") });

      var note = "K = ℃ + 273.15 입니다. 눈금의 <b>간격</b>은 같고 <b>시작점</b>만 다릅니다.";
      if (K <= 0.5) note = "<b>절대 영도</b>입니다. 입자의 열운동이 더 줄어들 수 없는 한계로, 이보다 낮은 온도는 존재하지 않습니다.";
      else if (Math.abs(K - 273.15) <= 0.5) note = "물이 어는 온도 0 ℃ 는 켈빈으로 <b>273.15 K</b> 입니다. 0 이 아니라는 점이 중요합니다.";
      else if (Math.abs(K - 373.15) <= 0.5) note = "물이 끓는 온도 100 ℃ = <b>373.15 K</b>. 두 눈금의 차이는 언제나 273.15 로 일정합니다.";
      $("a-temp-info").innerHTML = note;

      var ch = false;
      if (K <= 0.5 && !got.b) { got.b = true; ch = true; }
      if (Math.abs(K - 273.15) <= 0.5 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("aTemp", got); mission(); }
    }
    canvas._redraw = draw;
    $("a-c").addEventListener("input", function (e) {
      c = +e.target.value; $("a-c-val").textContent = c + " ℃"; draw();
    });
    window.sthSort({
      mount: "s1-sort",
      buckets: [
        { id: "base", label: "SI 기본량", sub: "7개뿐이다" },
        { id: "der", label: "유도량", sub: "기본량을 곱하고 나눠 만든다" },
        { id: "non", label: "SI 가 아닌 단위", sub: "분야·나라마다 다르게 쓴다" }
      ],
      items: [
        { t: "길이 (m)", a: "base", why: "기본량입니다." },
        { t: "질량 (kg)", a: "base", why: "기본량입니다. 유일하게 접두어 k 가 붙은 기본단위이지요." },
        { t: "시간 (s)", a: "base", why: "기본량입니다." },
        { t: "전류 (A)", a: "base", why: "기본량입니다.", hint: "전기와 관련된 기본량이 하나 있습니다." },
        { t: "온도 (K)", a: "base", why: "기본량입니다. 기본단위는 ℃ 가 아니라 K 입니다.", hint: "온도의 SI 기본단위는 무엇이었나요?" },
        { t: "물질량 (mol)", a: "base", why: "기본량입니다. 입자의 개수를 다루는 기본량이지요." },
        { t: "광도 (cd)", a: "base", why: "기본량입니다. 빛의 밝기도 기본량에 들어갑니다.", hint: "카드 7장을 다시 보세요." },
        { t: "넓이 (m²)", a: "der", why: "길이 × 길이 이므로 유도량입니다." },
        { t: "속력 (m/s)", a: "der", why: "길이 ÷ 시간 이므로 유도량입니다." },
        { t: "힘 (N = kg·m/s²)", a: "der", why: "질량 × 가속도, 곧 기본량 세 가지의 조합입니다." },
        { t: "밀도 (kg/m³)", a: "der", why: "질량 ÷ 부피 이므로 유도량입니다." },
        { t: "파운드힘 (lbf)", a: "non", why: "미국에서 쓰는 힘의 단위입니다. 이번 사고의 원인이 된 바로 그 단위이지요.", hint: "사고 보고서에 나온 단위입니다." },
        { t: "마일 (mile)", a: "non", why: "SI 단위가 아닙니다. 1 mile ≈ 1,609 m 입니다." },
        { t: "칼로리 (cal)", a: "non", why: "SI 에서 에너지의 단위는 줄(J)입니다. 1 cal ≈ 4.184 J 입니다.", hint: "영양 성분표에서 보던 단위지요." }
      ],
      doneText: "기준이 7개로 정리되었습니다.",
      onDone: function () { window.sthState("aSort", 1); mission(); }
    });
    function mission() {
      var sorted = !!window.sthState("aSort");
      if (sorted) done("m1-4a");
      if (got.b) done("m1-4b");
      if (got.c) done("m1-4c");
      if (sorted && got.b && got.c) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>기본량 7개, 그 밖은 모두 <b>유도량</b>. 그리고 파운드힘·마일·칼로리처럼 <b>SI 가 아닌 단위</b>는 쓸 때마다 반드시 환산해야 합니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("m1-4", true);
  })();

  /* 장면 5 — 결말 */
  function finish() {
    window.sthState("r1", "해결 · 환산 계수 × " + (window.sthState("aK") || "-") + " 로 고도 226 km 진입 성공");
  }
  function paintVs() {
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 이제 숫자로도 증명했네요." : "처음 생각과 달랐지요? 추리를 증거로 고쳐 나가는 것이 과학입니다.") +
      "<br><b>내가 찾은 환산 계수</b> × " + (window.sthState("aK") || "-");
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();

  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅰ-1] 이야기 ① 단위를 잃어버린 우주선",
    items: [
      { id: "w1", label: "단위가 없으면 생기는 일", hint: "이 단원에서 본 사례 하나를 골라, 단위를 정하지 않으면 무엇이 어긋나는지 쓰세요." },
      { id: "e1b", label: "1 m 를 다시 정의한다면", hint: "1 m 의 기준을 ‘파리에 보관한 금속 막대’에서 ‘빛이 간 거리’로 바꾼 까닭을 쓰세요. 킬로그램이 2019년에 바뀐 일과 묶어 설명하면 좋습니다." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 10의 거듭제곱으로 걷기
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });
  var LY = 9.4607e15, CLIGHT = 299792458;

  var PLACES = {
    "-15": ["⚛", "원자핵", "원자핵의 지름 약 10⁻¹⁵ m"],
    "-14": ["⚛", "원자핵 열 개", "원자핵을 열 개 늘어놓은 길이"],
    "-13": ["⚛", "원자핵 백 개", "아직 원자 하나에도 한참 못 미친다"],
    "-12": ["📡", "X선의 파장", "몸속을 찍는 X선의 파장쯤"],
    "-11": ["🌀", "원자 속 빈 공간", "원자 대부분은 텅 비어 있다"],
    "-10": ["⚛️", "원자", "수소 원자의 지름 약 10⁻¹⁰ m"],
    "-9": ["🧬", "DNA 이중 나선", "이중 나선의 굵기 약 2×10⁻⁹ m"],
    "-8": ["🧫", "세포막", "세포막 두께의 몇 배"],
    "-7": ["🦠", "바이러스", "코로나바이러스의 지름 약 10⁻⁷ m"],
    "-6": ["🧫", "세균", "대장균의 길이 약 2×10⁻⁶ m"],
    "-5": ["🔬", "사람의 세포", "사람 세포의 지름 약 10⁻⁵ m"],
    "-4": ["💇", "머리카락 굵기", "머리카락의 굵기 약 10⁻⁴ m"],
    "-3": ["⏳", "모래알", "모래알 하나 = 1 mm"],
    "-2": ["🖐", "손톱", "손톱의 너비 = 1 cm"],
    "-1": ["✋", "손바닥", "손바닥 너비 = 10 cm"],
    "0": ["🧍", "사람의 키", "사람의 키 약 1.7 m"],
    "1": ["🏫", "교실", "교실 한 변 약 10 m"],
    "2": ["🏟", "운동장", "학교 운동장 약 100 m"],
    "3": ["🏘", "동네", "걸어서 15분 = 1 km"],
    "4": ["🌆", "도시", "도시 하나 약 10 km"],
    "5": ["🚄", "서울~부산", "약 3×10⁵ m (325 km)"],
    "6": ["🗺", "한반도", "남북 길이 약 10⁶ m"],
    "7": ["🌍", "지구", "지구의 지름 1.27×10⁷ m"],
    "8": ["🌕", "지구에서 달까지", "3.84×10⁸ m"],
    "9": ["☀️", "태양", "태양의 지름 약 1.4×10⁹ m"],
    "10": ["🌗", "달 궤도의 서른 배", "아직 태양 근처에도 못 갔다"],
    "11": ["🌞", "지구에서 태양까지", "1 AU = 1.50×10¹¹ m"],
    "12": ["🪐", "목성 궤도", "목성 궤도의 지름 약 1.6×10¹² m"],
    "13": ["🪐", "태양계", "해왕성 궤도의 지름 약 9×10¹² m"],
    "14": ["☄️", "태양계 바깥 경계", "혜성이 돌아오는 자리"],
    "15": ["🌌", "성간 공간", "별과 별 사이의 빈 곳"],
    "16": ["💡", "1 광년", "1 광년 = 9.46×10¹⁵ m"],
    "17": ["✨", "가장 가까운 별", "프록시마 켄타우리까지 4.2 광년"],
    "18": ["✨", "이웃 별들", "약 10 광년"],
    "19": ["✨", "밤하늘의 밝은 별들", "약 100 광년"],
    "20": ["🌟", "별자리 하나", "약 1,000 광년"],
    "21": ["🌠", "우리은하", "우리은하의 지름 약 10만 광년"],
    "22": ["🌠", "이웃 은하", "안드로메다까지 250만 광년"],
    "23": ["🌌", "국부 은하군", "약 1,000만 광년"],
    "24": ["🌌", "은하단", "은하 수백 개의 모임"],
    "25": ["🌌", "초은하단", "은하단들의 모임"],
    "26": ["🌌", "관측 가능한 우주", "반지름 약 4.4×10²⁶ m"]
  };
  var LADDER = [-15, -10, -7, -5, -2, 0, 7, 11, 16, 21, 26];

  function lenStr(n) {
    var us = [[-15, "fm"], [-12, "pm"], [-9, "nm"], [-6, "µm"], [-3, "mm"], [0, "m"], [3, "km"]], u = us[0];
    for (var i = 0; i < us.length; i++) if (n >= us[i][0]) u = us[i];
    var d = n - u[0];
    var s = (d >= 6 ? "10" + sup(d) : Math.pow(10, d).toLocaleString()) + " " + u[1];
    if (n >= 16) s += " (약 " + numStr(Math.pow(10, n) / LY) + " 광년)";
    return s;
  }

  /* 장면 1 */
  window.sthGate({
    gate: "g2", key: "p2", title: "동아리원의 첫 어림",
    question: "손톱(10⁻² m)에서 출발해 한 걸음마다 10배씩 넓히면, 관측 가능한 우주(10²⁶ m)까지 몇 걸음일까요?",
    options: ["㉠ 서른 걸음쯤", "㉡ 삼천 걸음쯤", "㉢ 삼백만 걸음쯤"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 배율 산책 (계산 모형) */
  (function () {
    var canvas = $("b-walk"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var n = -2, got = window.sthState("bWalk") || { a: false, b: false, c: false };
    function place(e) { return PLACES[String(clamp(e, -15, 26))] || ["·", "이름 없는 자리", ""]; }
    function box(x, y, w, h, on) {
      ctx.fillStyle = v(on ? "--card-2" : "--panel");
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill();
      ctx.strokeStyle = v(on ? "--brand" : "--line"); ctx.lineWidth = on ? 3 : 2;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.stroke();
    }
    function draw() {
      paper(ctx, W, H);
      var here = place(n), low = place(n - 1), high = place(n + 1);
      text(ctx, "10의 거듭제곱 산책 — 가운데가 지금 보이는 것", 40, 34, { s: 12.5, w: "800", c: v("--teal-700") });
      /* 한 걸음 아래 */
      box(40, 130, 110, 130, false);
      text(ctx, n > -15 ? low[0] : "—", 95, 185, { s: 26, a: "center" });
      text(ctx, n > -15 ? low[1] : "끝", 95, 220, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "한 걸음 작게", 95, 120, { s: 10.5, a: "center", c: v("--mist") });
      /* 지금 보이는 것 */
      box(176, 84, 244, 220, true);
      text(ctx, here[0], 298, 176, { s: 54, a: "center" });
      text(ctx, here[1], 298, 224, { s: 17, w: "900", a: "center", c: v("--brand-700") });
      text(ctx, here[2], 298, 252, { s: 11.5, a: "center", c: v("--mist") });
      text(ctx, "10" + sup(n) + " m", 298, 284, { s: 14, w: "800", a: "center" });
      /* 한 걸음 위 */
      box(446, 130, 110, 130, false);
      text(ctx, n < 26 ? high[0] : "—", 501, 185, { s: 26, a: "center" });
      text(ctx, n < 26 ? high[1] : "끝", 501, 220, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "한 걸음 크게", 501, 120, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "화면 한 변 = " + lenStr(n), 298, 336, { s: 13, w: "800", a: "center", c: v("--violet-700") });
      text(ctx, "손톱(10⁻² m)에서 여기까지 " + Math.abs(n + 2) + "걸음", 298, 362, { s: 11.5, a: "center", c: v("--mist") });
      /* 사다리 */
      function yOfN(e) { return 350 - (e + 15) * (290 / 41); }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(640, 56); ctx.lineTo(640, 354); ctx.stroke();
      for (var e = -15; e <= 26; e++) {
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(634, yOfN(e)); ctx.lineTo(646, yOfN(e)); ctx.stroke();
      }
      LADDER.forEach(function (e) {
        text(ctx, "10" + sup(e), 628, yOfN(e) + 4, { s: 10.5, a: "right", c: v("--mist") });
        text(ctx, PLACES[String(e)][1], 654, yOfN(e) + 4, { s: 10.5, c: v("--mist") });
      });
      ctx.fillStyle = v("--brand");
      ctx.beginPath(); ctx.arc(640, yOfN(n), 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, "지금", 610, yOfN(n) - 12, { s: 10.5, w: "900", a: "right", c: v("--brand-700") });
      text(ctx, "작은 쪽", 640, 372, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "큰 쪽", 640, 46, { s: 10.5, a: "center", c: v("--mist") });

      $("b-walk-info").innerHTML = "지금 보이는 것: <b>" + here[1] + "</b> · " + here[2] +
        "<br>화면 한 변은 <b>10" + sup(n) + " m</b> 입니다. 손잡이를 한 칸 움직일 때마다 <b>10배</b>씩 달라집니다.";

      var ch = false;
      if (n === -5 && !got.a) { got.a = true; ch = true; }
      if (n === -15 && !got.b) { got.b = true; ch = true; }
      if (n === 21 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("bWalk", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.c) done("m2-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>세포(10⁻⁵ m) · 원자핵(10⁻¹⁵ m) · 우리은하(10²¹ m). 손잡이를 <b>41칸</b>만 움직이면 우주의 끝에서 끝까지 갑니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("b-n").addEventListener("input", function (e) {
      n = +e.target.value; $("b-n-val").textContent = "n = " + (n < 0 ? "−" + Math.abs(n) : n); draw();
    });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m2-2", true);
  })();

  /* 장면 3 — 두 표지 비교 (계산 모형) */
  (function () {
    var canvas = $("b-cmp"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var eA = 0, eB = 26, got = window.sthState("bCmp") || { a: false, b: false };
    var refs = [
      { e: -15, i: "⚛", t: "원자핵" }, { e: -10, i: "⚛️", t: "원자" }, { e: -7, i: "🦠", t: "바이러스" },
      { e: -5, i: "🔬", t: "세포" }, { e: -3, i: "⏳", t: "모래알" }, { e: 0, i: "🧍", t: "사람" },
      { e: 7, i: "🌍", t: "지구" }, { e: 11, i: "🌞", t: "1 AU" }, { e: 16, i: "💡", t: "1 광년" },
      { e: 21, i: "🌠", t: "우리은하" }, { e: 26, i: "🌌", t: "우주" }
    ];
    function xOf(e) { return 60 + (e + 15) / 41 * 780; }
    function near(e) {
      var best = refs[0], bd = 1e9;
      refs.forEach(function (r) { var d = Math.abs(r.e - e); if (d < bd) { bd = d; best = r; } });
      return best.i + " " + best.t;
    }
    function draw() {
      paper(ctx, W, H);
      var d = Math.abs(eB - eA);
      text(ctx, "표지 A · 10" + sup(eA) + " m — 가장 가까운 기준 " + near(eA), 60, 36, { s: 12, w: "800", c: v("--coral-700") });
      text(ctx, "표지 B · 10" + sup(eB) + " m — 가장 가까운 기준 " + near(eB), 60, 58, { s: 12, w: "800", c: v("--brand-700") });
      text(ctx, d === 0 ? "두 표지는 같은 크기" : "10" + sup(d) + " 배 차이", 450, 112, { s: 26, w: "900", a: "center", c: v("--violet-700") });
      text(ctx, "큰 쪽 지수 " + Math.max(eA, eB) + " − 작은 쪽 지수 " + Math.min(eA, eB) + " = " + d, 450, 142, { s: 12.5, a: "center", c: v("--mist") });
      /* 배율 괄호 */
      var xa = xOf(eA), xb = xOf(eB), lo = Math.min(xa, xb), hi = Math.max(xa, xb);
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lo, 186); ctx.lineTo(hi, 186); ctx.moveTo(lo, 178); ctx.lineTo(lo, 194); ctx.moveTo(hi, 178); ctx.lineTo(hi, 194); ctx.stroke();
      /* 축 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(60, 250); ctx.lineTo(840, 250); ctx.stroke();
      for (var e = -15; e <= 26; e++) {
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xOf(e), 246); ctx.lineTo(xOf(e), 254); ctx.stroke();
        if ((e + 15) % 5 === 0) text(ctx, "10" + sup(e), xOf(e), 238, { s: 9.5, a: "center", c: v("--mist") });
      }
      refs.forEach(function (r, i) {
        text(ctx, r.i, xOf(r.e), 278, { s: 15, a: "center" });
        text(ctx, r.t, xOf(r.e), i % 2 ? 316 : 298, { s: 10, a: "center", c: v("--mist") });
      });
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(xa, 250, 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, "A", xa, 220, { s: 13, w: "900", a: "center", c: v("--coral-700") });
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(xb, 250, 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, "B", xb, 220, { s: 13, w: "900", a: "center", c: v("--brand-700") });

      $("b-cmp-info").innerHTML = "두 표지의 배율 차이는 <b>10" + sup(d) + " 배</b>입니다. 자릿수가 " + d + "개 차이 난다는 뜻이지요." +
        (d === 20 ? " ✅ 미션의 10²⁰ 배를 맞췄습니다." : " 지수를 빼기만 하면 배율이 나옵니다.");

      if (d === 20 && !got.a) { got.a = true; window.sthState("bCmp", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-3a");
      if (got.b) done("m2-3b");
      if (got.a && got.b) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>배율은 <b>지수의 뺄셈</b>입니다. 10²⁰ 배는 ‘0이 스무 개 더 붙는다’와 같은 말입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("b-ea").addEventListener("input", function (e) {
      eA = +e.target.value; $("b-ea-val").textContent = "n = " + (eA < 0 ? "−" + Math.abs(eA) : eA); draw();
    });
    $("b-eb").addEventListener("input", function (e) {
      eB = +e.target.value; $("b-eb-val").textContent = "n = " + (eB < 0 ? "−" + Math.abs(eB) : eB); draw();
    });
    window.sthPick({
      mount: "s2-q1",
      q: "지구의 지름은 약 10⁷ m, 원자 한 개의 지름은 약 10⁻¹⁰ m 입니다. 지구는 원자의 몇 배일까요?",
      options: ["10³ 배", "10¹⁷ 배", "10⁻¹⁷ 배", "10⁷⁰ 배"],
      answer: 1,
      why: [
        "지수끼리 더한 것이 아니라 <b>뺀</b> 값이어야 합니다. 7 − (−10) 을 다시 계산해 보세요.",
        "7 − (−10) = 17. 지구는 원자보다 <b>10¹⁷ 배</b> 큽니다. 음수를 빼면 더해진다는 점이 열쇠입니다.",
        "부호가 반대입니다. 더 큰 쪽이 지구이므로 배율은 1보다 커야 합니다.",
        "지수는 곱하는 것이 아니라 빼는 것입니다."
      ],
      onDone: function () { got.b = true; window.sthState("bCmp", got); mission(); }
    });
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m2-3", true);
  })();

  /* 장면 4 — 빛으로 거리 재기 (계산 모형) */
  (function () {
    var canvas = $("b-light"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var n = 7, got = window.sthState("bLight") || { a: false, b: false };
    var YEAR = 365.25 * 24 * 3600;
    function tOf(nn) { return Math.pow(10, nn) / CLIGHT; }
    function timeStr(t) {
      if (t < 60) return t.toFixed(2) + " 초";
      if (t < 3600) return (t / 60).toFixed(1) + " 분";
      if (t < 86400) return (t / 3600).toFixed(1) + " 시간";
      if (t < YEAR) return (t / 86400).toFixed(1) + " 일";
      return numStr(t / YEAR) + " 년";
    }
    function xOf(nn) { return 60 + (clamp(nn, 5, 26) - 5) / 21 * 780; }
    var bands = [
      { to: 10.2554, c: "--teal", t: "초" },
      { to: 12.0331, c: "--brand", t: "분" },
      { to: 13.4144, c: "--violet", t: "시간" },
      { to: 15.9759, c: "--amber", t: "일" },
      { to: 26, c: "--coral", t: "년" }
    ];
    var marks = [
      { n: 8.584, t: "달 1.3초" }, { n: 11.176, t: "태양 8분 20초" }, { n: 12.653, t: "해왕성 4시간" },
      { n: 16.602, t: "가장 가까운 별 4.2년" }, { n: 20.978, t: "우리은하 10만 년" }
    ];
    function draw() {
      paper(ctx, W, H);
      var d = Math.pow(10, n), t = tOf(n);
      text(ctx, "빛이 이 거리를 가는 데 걸리는 시간", 40, 34, { s: 12.5, w: "800", c: v("--teal-700") });
      text(ctx, "거리 " + sciStr(d, 1) + " m", 450, 70, { s: 13, a: "center", c: v("--mist") });
      text(ctx, timeStr(t), 450, 112, { s: 30, w: "900", a: "center", c: v("--violet-700") });
      var x0 = 60;
      bands.forEach(function (b) {
        var x1 = xOf(b.to);
        ctx.fillStyle = v(b.c); ctx.globalAlpha = 0.45; ctx.fillRect(x0, 150, Math.max(0, x1 - x0), 30); ctx.globalAlpha = 1;
        if (x1 - x0 > 26) text(ctx, b.t, (x0 + x1) / 2, 170, { s: 11.5, w: "800", a: "center", c: v("--ink") });
        x0 = x1;
      });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.strokeRect(60, 150, 780, 30);
      marks.forEach(function (m, i) {
        var x = xOf(m.n);
        ctx.strokeStyle = v("--mist"); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 180); ctx.lineTo(x, 190); ctx.stroke();
        text(ctx, m.t, clamp(x, 70, 830), i % 2 ? 222 : 204, { s: 10.5, a: "center", c: v("--mist") });
      });
      var cx = xOf(n);
      ctx.fillStyle = v("--ink");
      ctx.beginPath(); ctx.moveTo(cx, 148); ctx.lineTo(cx - 8, 134); ctx.lineTo(cx + 8, 134); ctx.closePath(); ctx.fill();
      text(ctx, "n = " + n.toFixed(1), clamp(cx, 80, 820), 128, { s: 11, w: "900", a: "center" });
      text(ctx, "빛의 속력 299,792,458 m/s — 1초에 지구를 일곱 바퀴 반 돕니다.", 40, 258, { s: 12, c: v("--mist") });
      text(ctx, "1 광년 = 빛이 1년 동안 가는 거리 = 9.46 × 10¹⁵ m", 40, 284, { s: 12, w: "800", c: v("--teal-700") });

      $("b-light-info").innerHTML = "거리 <b>" + sciStr(d, 1) + " m</b> → 빛으로 <b>" + timeStr(t) + "</b>. " +
        (Math.abs(t - 1) / 1 <= 0.1 ? "✅ 빛이 1초에 가는 거리입니다. 약 3×10⁸ m 이지요." :
          (Math.abs(t / YEAR - 1) <= 0.1 ? "✅ 빛이 1년 걸리는 거리, 곧 <b>1 광년</b>입니다." :
            "거리를 바꿔 가며 ‘약 1초’와 ‘약 1년’이 되는 자리를 찾아보세요."));

      var ch = false;
      if (Math.abs(t - 1) <= 0.1 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(t / YEAR - 1) <= 0.1 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("bLight", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-4a");
      if (got.b) done("m2-4b");
      if (got.a && got.b) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>빛은 1초에 약 <b>3×10⁸ m</b>, 1년에 <b>9.46×10¹⁵ m</b>를 갑니다. 그래서 먼 우주의 거리는 미터 대신 <b>광년</b>으로 말합니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("b-d").addEventListener("input", function (e) {
      n = +e.target.value; $("b-d-val").textContent = "n = " + n.toFixed(1); draw();
    });
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("m2-4", true);
  })();

  /* 장면 5 — 결말 */
  var STEPS = [
    "원자핵 (10⁻¹⁵ m)", "원자 (10⁻¹⁰ m)", "바이러스 (10⁻⁷ m)", "사람의 세포 (10⁻⁵ m)",
    "손톱 (10⁻² m)", "지구의 지름 (10⁷ m)", "지구에서 태양까지 (10¹¹ m)", "우리은하의 지름 (10²¹ m)"
  ];
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 어림</b> " + (p || "기록 없음") +
      (p.indexOf("㉠") === 0 ? " — 정확했습니다. 28걸음이었지요." : " — 10배씩 걷기 때문에 걸음 수는 자릿수의 차이만큼입니다.") +
      "<br><b>내가 확인한 1 광년</b> 9.46×10¹⁵ m";
  }
  function finish() { window.sthState("r2", "해결 · 손톱에서 우주까지 28걸음, 1 광년 = 9.46×10¹⁵ m"); }
  if (ep.cleared(4)) {
    $("s2-order").innerHTML = "<div class='order sort'><div class='slots'>" +
      STEPS.map(function (s) { return "<div class='slot filled'>" + s + "</div>"; }).join("") + "</div></div>";
    reveal();
  } else {
    window.sthOrder({ mount: "s2-order", steps: STEPS, onDone: function () { reveal(); ep.clear(4); } });
  }
  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅰ-1] 이야기 ② 10의 거듭제곱으로 걷기",
    items: [
      { id: "w2", label: "스케일 비교", hint: "가장 큰 것과 가장 작은 것을 골라 몇 자릿수 차이인지 계산하고, 그 차이를 실감할 수 있는 비유를 하나 만들어 보세요." },
      { id: "e2b", label: "왜 우주의 거리는 미터로 말하지 않을까", hint: "우리은하의 지름을 미터로 적어 보고, 광년으로도 적어 보세요. 둘을 견주어 광년을 쓰는 까닭을 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 0을 세다가 밤을 새운 보고서
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });
  var NA = 6.02214076e23, CELL = 3.7e13;

  /* 장면 1 */
  window.sthGate({
    gate: "g3", key: "p3", title: "세민이의 첫 어림",
    question: "한 사람 몸에 세포가 약 3.7×10¹³ 개 있다면, 우리 반 25명의 세포를 모두 더하면 몇 개쯤일까요?",
    options: ["㉠ 10억(10⁹) 개쯤", "㉡ 1,000조(10¹⁵) 개쯤", "㉢ 10²⁴ 개쯤"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 소수점 옮기기 (계산 모형) */
  (function () {
    var canvas = $("c-sci"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var TARGETS = [
      { name: "빛의 속력", full: "299,792,458", unit: "m/s", val: 299792458, p: 8, key: "a" },
      { name: "사람 몸의 세포 수", full: "37,000,000,000,000", unit: "개", val: 3.7e13, p: 13, key: "b" },
      { name: "수소 원자의 지름", full: "0.0000000001", unit: "m", val: 1e-10, p: -10, key: "c" }
    ];
    var ti = 0, p = 0, got = window.sthState("cSci") || { a: false, b: false, c: false };

    function aStr(A) {
      if (Math.abs(A) >= 1e5 || (Math.abs(A) < 1e-4 && A !== 0)) return A.toExponential(2);
      var s = A.toPrecision(4);
      if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
      if (s.indexOf(".") < 0) s = s + ".0";
      return s;
    }
    function draw() {
      paper(ctx, W, H);
      var T = TARGETS[ti], A = T.val / Math.pow(10, p);
      text(ctx, T.name, 40, 36, { s: 13.5, w: "900", c: v("--teal-700") });
      text(ctx, "원래 적은 수", 450, 62, { s: 11, a: "center", c: v("--mist") });
      text(ctx, T.full + " " + T.unit, 450, 94, { s: 20, w: "800", a: "center" });
      var move = p === 0 ? "소수점을 아직 옮기지 않았습니다" :
        (p > 0 ? "소수점을 왼쪽으로 " + p + "칸 옮김" : "소수점을 오른쪽으로 " + (-p) + "칸 옮김");
      ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); ctx.lineWidth = 2;
      if (p > 0) window.drawArrow(ctx, 500, 124, 400, 124, 10);
      else if (p < 0) window.drawArrow(ctx, 400, 124, 500, 124, 10);
      text(ctx, move, 450, 150, { s: 12.5, a: "center", c: v("--mist") });
      var ok = A >= 1 && A < 10;
      text(ctx, aStr(A) + " × 10" + sup(p) + " " + T.unit, 450, 202, { s: 30, w: "900", a: "center", c: v(ok ? "--green-700" : "--rose-700") });
      var verdict = ok ? "✅ 계수가 1 이상 10 미만 — 올바른 과학적 표기법입니다" :
        (A >= 10 ? "계수가 10 이상입니다. 소수점을 더 왼쪽으로 옮기세요" : "계수가 1보다 작습니다. 소수점을 오른쪽으로 되돌리세요");
      text(ctx, verdict, 450, 240, { s: 13, w: "800", a: "center", c: v(ok ? "--green-700" : "--mist") });
      if (ok) text(ctx, "유효숫자 두 자리로 어림하면 " + sciStr(T.val, 1) + " " + T.unit, 450, 274, { s: 11.5, a: "center", c: v("--mist") });
      else text(ctx, "규칙: A × 10ⁿ 에서 계수 A 는 반드시 1 이상 10 미만", 450, 274, { s: 11.5, a: "center", c: v("--mist") });

      $("c-sci-info").innerHTML = "<b>" + T.name + "</b> = " + T.full + " " + T.unit + " → 지금 만든 표기는 <b>" + aStr(A) + " × 10" + sup(p) + "</b> 입니다. " +
        (ok ? "옳습니다. 위의 단추로 다른 수도 고쳐 보세요." : "계수가 1 이상 10 미만이 되도록 손잡이를 움직이세요.");

      if (ok && !got[T.key]) { got[T.key] = true; window.sthState("cSci", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.c) done("m3-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>3.0×10⁸ · 3.7×10¹³ · 1.0×10⁻¹⁰. <b>지수 n 은 소수점을 옮긴 칸 수</b>이고, 왼쪽으로 옮기면 +, 오른쪽으로 옮기면 − 입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("c-p").addEventListener("input", function (e) {
      p = +e.target.value;
      $("c-p-val").textContent = (p > 0 ? "왼쪽 " + p : (p < 0 ? "오른쪽 " + (-p) : "0")) + "칸";
      draw();
    });
    var seg = $("c-pick");
    Array.prototype.forEach.call(seg.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(seg.querySelectorAll("button"), function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        ti = +b.getAttribute("data-t");
        draw();
      });
    });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m3-2", true);
  })();

  /* 장면 3 — 물 한 컵의 분자 수 (계산 모형) */
  (function () {
    var canvas = $("c-water"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var m = 50, got = window.sthState("cWater") || { a: false, b: false };
    function box(x, y, w, h, label, big, col) {
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
      ctx.strokeStyle = v(col); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.stroke();
      text(ctx, label, x + w / 2, y + 26, { s: 11, a: "center", c: v("--mist") });
      text(ctx, big, x + w / 2, y + 56, { s: 18, w: "900", a: "center", c: v(col + "-700") });
    }
    function draw() {
      paper(ctx, W, H);
      var mol = m / 18.0, cnt = mol * NA;
      text(ctx, "물 한 컵에 분자가 몇 개나 들어 있을까?", 40, 36, { s: 12.5, w: "800", c: v("--teal-700") });
      /* 비커 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(70, 90); ctx.lineTo(80, 270); ctx.lineTo(200, 270); ctx.lineTo(210, 90); ctx.stroke();
      var hgt = (m / 360) * 172, top = 270 - hgt;
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(80 + (270 - top) * 0.055, top); ctx.lineTo(200 - (270 - top) * 0.055, top); ctx.lineTo(200, 270); ctx.lineTo(80, 270); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      text(ctx, "물 " + m + " g", 140, 294, { s: 13, w: "800", a: "center" });
      /* 계산 상자 */
      box(270, 140, 150, 76, "질량", m + " g", "--brand");
      box(490, 140, 150, 76, "물질량", mol.toFixed(2) + " mol", "--violet");
      box(700, 140, 180, 76, "분자 수", sciStr(cnt, 1) + " 개", "--coral");
      ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); ctx.lineWidth = 2;
      window.drawArrow(ctx, 428, 178, 482, 178, 9);
      window.drawArrow(ctx, 648, 178, 692, 178, 9);
      text(ctx, "÷ 18.0 g/mol", 455, 130, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, "× 6.02×10²³", 670, 130, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      /* 점으로 보기 */
      var dots = clamp(Math.round(cnt / 1e23), 0, 60);
      ctx.fillStyle = v("--teal");
      for (var i = 0; i < dots; i++) {
        ctx.beginPath(); ctx.arc(280 + (i % 20) * 20, 248 + ((i / 20) | 0) * 22, 6, 0, Math.PI * 2); ctx.fill();
      }
      text(ctx, "● 하나 = 10²³ 개", 700, 254, { s: 11, c: v("--mist") });
      text(ctx, "물 1 mol = 18.0 g", 700, 276, { s: 11, c: v("--mist") });

      var note = "물 <b>" + m + " g</b> = <b>" + mol.toFixed(3) + " mol</b> = 분자 <b>" + sciStr(cnt, 2) + " 개</b>.";
      if (Math.abs(mol - 1) <= 0.02) note += " 딱 1 mol 입니다. 이때 분자 수가 바로 <b>아보가드로수 6.02×10²³</b> 개이지요.";
      else if (Math.abs(m - 200) <= 2) note += " 물 한 컵이 이만큼입니다. 0을 스물넷이나 붙여야 하는 수라서, 과학적 표기법 없이는 적기도 어렵습니다.";
      else note += " 손잡이를 움직여 1 mol 과 한 컵(약 200 g)을 만들어 보세요.";
      $("c-water-info").innerHTML = note;

      var ch = false;
      if (Math.abs(mol - 1) <= 0.02 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(m - 200) <= 2 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("cWater", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (got.a && got.b) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>물 <b>18 g 이 1 mol</b>, 분자 <b>6.02×10²³ 개</b>. 한 컵(200 g)이면 <b>6.7×10²⁴ 개</b>입니다. 셀 수 없는 것을 세는 방법이 바로 기본량 <b>물질량</b>입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-m").addEventListener("input", function (e) {
      m = +e.target.value; $("c-m-val").textContent = m + " g"; draw();
    });
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m3-3", true);
  })();

  /* 장면 4 — 우리 반의 세포 수 (계산 모형) + 표기 분류 */
  (function () {
    var canvas = $("c-class"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var n = 1, got = window.sthState("cClass") || { a: false };
    function draw() {
      paper(ctx, W, H);
      var total = n * CELL;
      text(ctx, "한 사람의 세포 3.7 × 10¹³ 개를 인원만큼 더하면", 40, 34, { s: 12.5, w: "800", c: v("--teal-700") });
      for (var i = 0; i < n; i++) {
        text(ctx, "🧍", 60 + (i % 10) * 34, 84 + ((i / 10) | 0) * 44, { s: 20, a: "center" });
      }
      text(ctx, "3.7 × 10¹³ 개", 470, 88, { s: 14, w: "800" });
      text(ctx, "× " + n + " 명", 470, 120, { s: 14, w: "800", c: v("--mist") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(470, 134); ctx.lineTo(860, 134); ctx.stroke();
      text(ctx, "= " + sciStr(total, 1) + " 개", 470, 172, { s: 24, w: "900", c: v("--violet-700") });
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(470, 196, 390, 18, 9); ctx.fill();
      ctx.fillStyle = v(total >= 1e15 ? "--green" : "--amber");
      ctx.beginPath(); ctx.roundRect(470, 196, Math.max(6, 390 * clamp(total / 1e15, 0, 1)), 18, 9); ctx.fill();
      text(ctx, "10¹⁵ 개", 860, 232, { s: 11, a: "right", c: v("--mist") });
      text(ctx, total >= 1e15 ? "10¹⁵ 개를 넘었습니다" : "아직 10¹⁵ 개에 못 미칩니다", 470, 232, { s: 11, c: v("--mist") });
      text(ctx, "계수만 더하면 됩니다. 3.7 × 10¹³ 이 " + n + "개 모이면 " + (3.7 * n).toFixed(1) + " × 10¹³ 이고, 이것을 다시 올바른 표기로 고칩니다.", 40, 262, { s: 11.5, c: v("--mist") });

      $("c-class-info").innerHTML = "<b>" + n + "명</b> → " + (3.7 * n).toFixed(1) + " × 10¹³ 개 = <b>" + sciStr(total, 1) + " 개</b>. " +
        (n === 28 ? "✅ 여기서 처음으로 10¹⁵ 개를 넘습니다." : (total >= 1e15 ? "이미 10¹⁵ 개를 넘었습니다. 더 줄여 보세요." : "아직 모자랍니다. 인원을 늘려 보세요."));

      if (n === 28 && !got.a) { got.a = true; window.sthState("cClass", got); mission(); }
    }
    function mission() {
      var sorted = !!window.sthState("cSort");
      if (got.a) done("m3-4a");
      if (sorted) done("m3-4b");
      if (got.a && sorted) {
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>28명이면 1.0×10¹⁵ 개. 우리 반 25명이면 <b>9.3×10¹⁴ 개</b>입니다. 계수가 10을 넘으면 지수를 1 올려 다시 <b>1 이상 10 미만</b>으로 고쳐 씁니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("c-n").addEventListener("input", function (e) {
      n = +e.target.value; $("c-n-val").textContent = n + "명"; draw();
    });
    window.sthSort({
      mount: "s3-sort",
      buckets: [
        { id: "ok", label: "올바른 표기", sub: "1 ≤ A < 10" },
        { id: "big", label: "계수가 너무 크다", sub: "A 가 10 이상" },
        { id: "small", label: "계수가 너무 작다", sub: "A 가 1보다 작다" }
      ],
      items: [
        { t: "3.7 × 10¹³", a: "ok", why: "계수 3.7 은 1 이상 10 미만입니다." },
        { t: "6.02 × 10²³", a: "ok", why: "아보가드로수의 표준 표기입니다." },
        { t: "1.0 × 10⁻¹⁰", a: "ok", why: "지수가 음수여도 규칙은 같습니다." },
        { t: "9.46 × 10¹⁵", a: "ok", why: "1 광년을 나타낸 올바른 표기입니다." },
        { t: "37 × 10¹²", a: "big", why: "3.7 × 10¹³ 으로 고쳐야 합니다.", hint: "계수가 10을 넘으면 지수를 1 올립니다." },
        { t: "12 × 10⁻³", a: "big", why: "1.2 × 10⁻² 로 고칩니다." },
        { t: "299.8 × 10⁶", a: "big", why: "2.998 × 10⁸ 로 고칩니다.", hint: "소수점을 두 칸 더 왼쪽으로." },
        { t: "0.37 × 10¹⁴", a: "small", why: "3.7 × 10¹³ 으로 고칩니다.", hint: "계수가 1보다 작으면 지수를 1 내립니다." },
        { t: "0.5 × 10⁶", a: "small", why: "5 × 10⁵ 로 고칩니다." }
      ],
      doneText: "계수는 언제나 1 이상 10 미만입니다.",
      onDone: function () { window.sthState("cSort", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("m3-4", true);
  })();

  /* 장면 5 — 결말 */
  function finish() { window.sthState("r3", "해결 · 우리 반 25명의 세포 약 9.3×10¹⁴ 개, 물 한 컵 분자 6.7×10²⁴ 개"); }
  function paintVs() {
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 어림</b> " + (p || "기록 없음") +
      (p.indexOf("㉡") === 0 ? " — 정확했습니다. 25 × 3.7×10¹³ = 9.3×10¹⁴ 개, 곧 10¹⁵ 개에 가깝습니다." : " — 25 × 3.7×10¹³ = 9.3×10¹⁴ 개였습니다. 자릿수만 보면 10¹⁵ 개에 가깝지요.") +
      "<br><b>내가 확인한 물 한 컵</b> 분자 6.7×10²⁴ 개";
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();
  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅰ-1] 이야기 ③ 0을 세다가 밤을 새운 보고서",
    items: [
      { id: "e3a", label: "세민이에게 보내는 답장", hint: "아주 큰 수와 아주 작은 수를 과학적 표기법으로 쓰는 방법을 ‘계수’와 ‘지수’라는 말을 넣어 세 문장으로 설명하세요." },
      { id: "e3b", label: "3.7×10¹³ 과 37,000,000,000,000 의 차이", hint: "두 표기가 나타내는 값은 같습니다. 그런데도 과학자들이 앞의 것을 쓰는 까닭을 ‘유효숫자’라는 말을 넣어 쓰세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅰ-1] 과학의 기본량 — 정리",
  recap: [
    { key: "r1", label: "① 단위를 잃어버린 우주선" },
    { key: "r2", label: "② 10의 거듭제곱으로 걷기" },
    { key: "r3", label: "③ 0을 세다가 밤을 새운 보고서" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "화성 궤도선, 손톱에서 우주까지의 걸음, 0이 스물넷인 수. 세 이야기에 공통으로 들어 있는 생각을 ‘기준’과 ‘단위’라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-1-1", unitLabel: "[통합과학1 Ⅰ-1] 과학의 기본량",
  rows: [
    { key: "r1", label: "① 단위를 잃어버린 우주선" },
    { key: "r2", label: "② 10의 거듭제곱으로 걷기" },
    { key: "r3", label: "③ 0을 세다가 밤을 새운 보고서" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
