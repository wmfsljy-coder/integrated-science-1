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
/* x를 A × 10ⁿ 꼴 문자열로 (계수는 d 자리) */
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

/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var KT = window.sthKit, KC = KT.C, REDUCE = KT.REDUCE;
/* 유리판 카드 */
function glass(ctx, x, y, w, h, r, edge, a) {
  var g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "rgba(255,255,255," + (a == null ? 0.10 : a) + ")"); g.addColorStop(1, "rgba(255,255,255,.025)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  ctx.strokeStyle = edge || "rgba(200,210,255,.22)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke();
}
/* 빛나는 글자 */
function glowText(ctx, s, x, y, o) { ctx.save(); ctx.shadowColor = o.c; ctx.shadowBlur = o.blur || 14; text(ctx, s, x, y, o); ctx.restore(); }
/* 움직임 멈추기 단추 */
function pauser(id, st) {
  var b = $(id); if (!b) return;
  function paint() { b.textContent = st.on ? "⏸ 움직임 멈추기" : "▶ 움직임 보기"; }
  b.addEventListener("click", function () { st.on = !st.on; paint(); });
  paint();
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
    question: "아홉 달 반을 날아온 궤도선은 왜 예정보다 169 km나 낮은 곳으로 들어갔을까요?",
    options: ["㉠ 엔진이 고장 나 속도를 줄이지 못했다", "㉡ 두 팀이 서로 다른 단위를 써서 값이 어긋났다", "㉢ 화성의 중력이 예상과 달랐다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 두 저울 (계산 모형: N ↔ lbf) */
  (function () {
    var canvas = $("a-gauge"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var F = 10, got = window.sthState("aGauge") || { a: false, b: false };

    function dial(cx, cy, r, frac, title, big, sub, col, max, nd) {
      var a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, f = clamp(frac, 0, 1), i, an;
      /* 금속 테두리 */
      var bz = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      bz.addColorStop(0, "#eef2fb"); bz.addColorStop(0.45, "#8e98b0"); bz.addColorStop(1, "#262c3c");
      ctx.fillStyle = bz; ctx.beginPath(); ctx.arc(cx, cy, r + 9, 0, Math.PI * 2); ctx.fill();
      /* 눈금판 */
      var fc = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
      fc.addColorStop(0, "#2a3570"); fc.addColorStop(1, "#090d28");
      ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      for (i = 0; i <= 50; i++) {
        an = a0 + (a1 - a0) * i / 50; var b5 = i % 5 === 0, rr = b5 ? 17 : 12;
        ctx.strokeStyle = b5 ? "rgba(232,236,255,.85)" : "rgba(160,175,255,.35)"; ctx.lineWidth = b5 ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * (r - 6), cy + Math.sin(an) * (r - 6));
        ctx.lineTo(cx + Math.cos(an) * (r - rr), cy + Math.sin(an) * (r - rr)); ctx.stroke();
      }
      for (i = 0; i <= 10; i += 2) {
        an = a0 + (a1 - a0) * i / 10;
        KT.t(ctx, (max * i / 10).toFixed(nd), cx + Math.cos(an) * (r - 31), cy + Math.sin(an) * (r - 31) + 4, { s: 10, a: "center", c: KC.mute, w: "700" });
      }
      /* 빛나는 바늘 자취 */
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(cx, cy, r - 47, a0, a0 + (a1 - a0) * Math.max(f, 0.003)); ctx.stroke(); ctx.restore();
      /* 바늘 */
      var na = a0 + (a1 - a0) * f, ca = Math.cos(na), sa = Math.sin(na);
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "#fff1e6"; ctx.beginPath();
      ctx.moveTo(cx + ca * (r - 14), cy + sa * (r - 14));
      ctx.lineTo(cx - sa * 3.5 - ca * 12, cy + ca * 3.5 - sa * 12);
      ctx.lineTo(cx + sa * 3.5 - ca * 12, cy - ca * 3.5 - sa * 12); ctx.closePath(); ctx.fill(); ctx.restore();
      var hub = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 8); hub.addColorStop(0, "#ffffff"); hub.addColorStop(1, "#59627a");
      ctx.fillStyle = hub; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      /* 유리 반사 */
      ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.beginPath(); ctx.ellipse(cx - r * 0.18, cy - r * 0.48, r * 0.62, r * 0.3, -0.25, 0, Math.PI * 2); ctx.fill();
      KT.pill(ctx, title, cx, cy - r - 22, { a: "center", s: 13, c: col });
      glowText(ctx, big, cx, cy + r + 40, { s: 24, w: "900", a: "center", c: col });
      text(ctx, sub, cx, cy + r - 12, { s: 10.5, a: "center", c: KC.mute });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 3, title: "같은 손잡이를 두 저울이 함께 잰다" });
      var lbf = F / LBF;
      /* 손잡이와 줄 */
      var hx = 450, hy = 150 + F * 1.1;
      ctx.strokeStyle = "rgba(220,226,245,.75)"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(308, 160); ctx.lineTo(hx - 26, hy); ctx.moveTo(592, 160); ctx.lineTo(hx + 26, hy); ctx.stroke();
      dial(215, 160, 84, F / 50, "뉴턴 저울 (SI 단위)", F.toFixed(1) + " N", "0~50 뉴턴", KC.blue, 50, 0);
      dial(685, 160, 84, lbf / (50 / LBF), "파운드힘 저울 (미국 관습 단위)", lbf.toFixed(2) + " lbf", "0~11.24 파운드힘", KC.orange, 50 / LBF, 1);
      var hg = ctx.createLinearGradient(0, hy - 9, 0, hy + 9);
      hg.addColorStop(0, "#f4f6fb"); hg.addColorStop(0.5, "#8a94aa"); hg.addColorStop(1, "#3a4152");
      ctx.fillStyle = hg; ctx.beginPath(); ctx.roundRect(hx - 30, hy - 9, 60, 18, 9); ctx.fill();
      if (F > 0.05) KT.arrow(ctx, { x: hx, y: hy + 12 }, { x: hx, y: hy + 20 + F * 1.1 }, KC.yellow, 3, 11);
      KT.pill(ctx, "당기는 힘 F", hx + 16, hy + 34 + F * 0.5, { s: 11.5, c: KC.yellow });
      KT.pill(ctx, "N ÷ 4.448222 = lbf", 450, 100, { a: "center", s: 15, c: KC.violet });
      text(ctx, "힘의 크기는 하나인데, 붙이는 이름이 둘이다 · 두 값의 비는 언제나 같습니다", 450, 308, { s: 11.5, a: "center", c: KC.mute });

      var msg = "뉴턴 저울 <b>" + F.toFixed(1) + " N</b> = 파운드힘 저울 <b>" + lbf.toFixed(3) + " lbf</b>.";
      if (Math.abs(lbf - 1) <= 0.02) msg += " 파운드힘 저울이 딱 1을 가리킵니다. 그때 뉴턴 저울은 <b>4.4 N 쯤</b>입니다.";
      else if (Math.abs(lbf - 10) <= 0.2) msg += " 10 배가 되어도 뉴턴 쪽은 여전히 4.45 배입니다.";
      else msg += " 손잡이를 움직여 파운드힘 저울의 눈금을 1.0과 10.0에 맞춰 보세요.";
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

    var st = { on: !REDUCE }, ph = (430 - 60) / 820;
    function verdict(h) {
      if (h < 80) return ["🔥 대기에서 부서짐", KC.red, "예정보다 훨씬 낮습니다. <b>1999년의 실제 결과(약 57 km)</b>가 바로 이 자리입니다."];
      if (h < 218) return ["⚠️ 너무 낮음", KC.orange, "대기권 위쪽을 스치며 저항을 받아 예정 궤도를 유지하지 못합니다. 계수를 더 키워 보세요."];
      if (h <= 234) return ["✅ 진입 성공", KC.green, "예정 고도에 들어갔습니다. 이때의 계수는 <b>4.448222</b>, 곧 1 lbf를 N으로 바꾸는 값입니다."];
      if (h <= 280) return ["⚠️ 너무 높음", KC.yellow, "궤도에는 들어가지만 예정보다 높아 관측 임무를 할 수 없습니다. 계수를 조금 줄여 보세요."];
      return ["🚀 화성을 지나침", KC.blue, "속도를 충분히 줄이지 못해 화성 중력에 붙잡히지 못합니다. 너무 커도 실패입니다."];
    }
    function trajY(x, yp) { var t = (x - 430) / 370; return Math.max(16, yp - t * t * 215); }
    function probe(x, y, ang) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      var pg = ctx.createLinearGradient(0, -5, 0, 5); pg.addColorStop(0, "#7fb0ff"); pg.addColorStop(1, "#1f4fb0");
      ctx.fillStyle = pg; ctx.fillRect(-24, -4, 15, 8); ctx.fillRect(9, -4, 15, 8);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(-16.5, -4); ctx.lineTo(-16.5, 4); ctx.moveTo(16.5, -4); ctx.lineTo(16.5, 4); ctx.stroke();
      var bg = ctx.createLinearGradient(-7, -7, 7, 7); bg.addColorStop(0, "#fff0b0"); bg.addColorStop(0.5, "#e0a52a"); bg.addColorStop(1, "#8a5a10");
      ctx.fillStyle = bg; ctx.fillRect(-8, -7, 16, 14);
      ctx.fillStyle = "#e8ecff"; ctx.beginPath(); ctx.arc(0, -9, 5, Math.PI, 0); ctx.fill();
      ctx.restore();
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var h = alt(k), yp = yOf(h), vd = verdict(h), i;
      KT.stage(ctx, 0, 0, W, H, "space", { seed: 13 });
      /* 화성 대기 빛무리 */
      var ag = ctx.createLinearGradient(0, yOf(80), 0, 330);
      ag.addColorStop(0, "rgba(255,150,100,0)"); ag.addColorStop(1, "rgba(255,150,100,.32)");
      ctx.fillStyle = ag; ctx.fillRect(0, yOf(80), W, 330 - yOf(80));
      /* 화성 표면 */
      var mg = ctx.createLinearGradient(0, 322, 0, H);
      mg.addColorStop(0, "#d8743f"); mg.addColorStop(0.35, "#a3421d"); mg.addColorStop(1, "#4a1608");
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, 336); ctx.quadraticCurveTo(450, 322, 900, 336); ctx.lineTo(900, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = mg; ctx.fill(); ctx.clip();
      var R = KT.rng(4);
      for (i = 0; i < 14; i++) { ctx.fillStyle = "rgba(60,15,5,.35)"; ctx.beginPath(); ctx.ellipse(R() * W, 338 + R() * 20, 6 + R() * 16, 2 + R() * 3, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      ctx.save(); ctx.shadowColor = "rgba(255,170,120,.9)"; ctx.shadowBlur = 10; ctx.strokeStyle = "rgba(255,200,160,.75)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 336); ctx.quadraticCurveTo(450, 322, 900, 336); ctx.stroke(); ctx.restore();
      KT.pill(ctx, "화성 표면", 24, 354, { s: 11.5, c: "#ffd9c2" });
      KT.pill(ctx, "화성 대기 — 이 아래로 들어가면 타 버린다", 70, 304, { s: 11.5, c: KC.orange });
      /* 고도 눈금 */
      for (var g = 0; g <= 300; g += 100) {
        KT.line(ctx, { x: 60, y: yOf(g) }, { x: 880, y: yOf(g) }, KC.grid, 1);
        KT.t(ctx, g + " km", 54, yOf(g) + 4, { s: 10.5, a: "right", c: KC.mute, w: "600" });
      }
      KT.line(ctx, { x: 60, y: yOf(226) }, { x: 880, y: yOf(226) }, KC.green, 1.6, [6, 5], 0.85);
      KT.pill(ctx, "예정 고도 226 km", 876, yOf(226) - 8, { s: 11.5, a: "right", c: KC.green });
      KT.line(ctx, { x: 60, y: yOf(80) }, { x: 880, y: yOf(80) }, KC.red, 1.6, [6, 5], 0.85);
      KT.pill(ctx, "생존 한계 80 km", 876, yOf(80) - 8, { s: 11.5, a: "right", c: KC.red });
      /* 접근 궤적 — 부서진 뒤의 길은 흐리게 */
      var burnt = h < 80;
      ctx.save(); ctx.shadowColor = KC.violet; ctx.shadowBlur = 10; ctx.strokeStyle = KC.violet; ctx.lineWidth = 3; ctx.beginPath();
      for (var x = 60; x <= 432; x += 4) { if (x === 60) ctx.moveTo(x, trajY(x, yp)); else ctx.lineTo(x, trajY(x, yp)); }
      ctx.stroke();
      if (burnt) { ctx.globalAlpha = 0.3; ctx.setLineDash([5, 6]); ctx.shadowBlur = 0; }
      ctx.beginPath(); for (x = 428; x <= 880; x += 4) { if (x === 428) ctx.moveTo(x, trajY(x, yp)); else ctx.lineTo(x, trajY(x, yp)); }
      ctx.stroke(); ctx.restore();
      /* 근화점 */
      if (burnt) { KT.glow(ctx, 430, yp, 9, "rgba(255,150,60,.95)", 5); KT.glow(ctx, 430, yp, 4, "rgba(255,240,200,1)", 3); }
      else { ctx.strokeStyle = KC.violet; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(430, yp, 7, 0, Math.PI * 2); ctx.stroke(); }
      KT.pill(ctx, "근화점 고도 " + Math.round(h) + " km", 452, yp + 5, { s: 13, c: KC.violet });
      /* 움직이는 궤도선 */
      var px = 60 + ph * 820, py = trajY(px, yp), tt = (px - 430) / 370;
      if (!(burnt && px > 436)) {
        for (i = 1; i <= 8; i++) { var qx = px - i * 9; if (qx < 60) break; KT.glow(ctx, qx, trajY(qx, yp), 1.4, "rgba(200,180,255," + (0.5 - i * 0.05) + ")", 2.5); }
        probe(px, py, Math.atan(-2 * tt * 215 / 370));
      }
      KT.pill(ctx, vd[0], 876, 36, { s: 14, a: "right", c: vd[1] });
      KT.pill(ctx, "화성 접근 궤도 재현", 16, 28, { s: 13, c: KC.blue });
      KT.warn(ctx, 884, 354, "⚠ 궤적 모양은 개념도 · 고도 눈금만 실제 값", "right");
    }
    function draw() {
      render();
      var h = alt(k), vd = verdict(h), mark = vd[0], note = vd[2], ok = h >= 218 && h <= 234;
      $("a-orbit-read").innerHTML =
        "<span class='k'>환산 계수</span><span class='v b'>× " + k.toFixed(1) + "</span>" +
        "<span class='k'>근화점 고도</span><span class='v y'>" + Math.round(h) + " km</span>" +
        "<span class='sub'>예정 226 km · 생존 한계 80 km</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + mark + "</span>";
      $("a-orbit-info").innerHTML = "환산 계수 <b>× " + k.toFixed(1) + "</b> → 근화점 고도 <b>" + Math.round(h) + " km</b> · " + mark + "<br>" + note;

      if (Math.abs(h - 226) <= 8) {
        if (window.sthState("aK") !== k) window.sthState("aK", k);
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>계수 <b>× " + k.toFixed(1) + "</b>으로 고도 <b>" + Math.round(h) + " km</b> 진입. 실제로 필요했던 값은 <b>4.448222</b>였습니다. 계수를 1로 두면 고도 57 km — 1999년에 일어난 그대로입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("a-k").addEventListener("input", function (e) {
      k = +e.target.value; $("a-k-val").textContent = "× " + k.toFixed(1); draw();
    });
    pauser("a-orbit-play", st);
    KT.animate(canvas, function (dt) { if (st.on) { ph = (ph + dt / 7000) % 1; render(); } });
    draw();
    if (ep.cleared(2)) window.sthMission("m1-3", true);
  })();

  /* 장면 4 — 기본량 카드 · 켈빈 온도계 · 분류 */
  (function () {
    var canvas = $("a-cards"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var sel = -1;
    var units = [
      { q: "길이", sym: "m", name: "미터", c: "--brand", desc: "빛이 진공에서 <b>1/299,792,458초</b> 동안 진행한 거리입니다. 자의 길이가 아니라 빛과 시간으로 정해 둔 것입니다." },
      { q: "질량", sym: "kg", name: "킬로그램", c: "--coral", desc: "1889년부터 130년 동안은 파리에 보관된 <b>금속 원기</b>가 기준이었습니다. <b>2019년</b>부터는 <b>플랑크 상수</b>의 값을 고정해 정의합니다." },
      { q: "시간", sym: "s", name: "초", c: "--violet", desc: "세슘-133 원자가 내는 특정 복사선이 <b>9,192,631,770번</b> 진동하는 데 걸리는 시간입니다. 이것이 원자시계의 원리입니다." },
      { q: "전류", sym: "A", name: "암페어", c: "--teal", desc: "전자 한 개의 전하량(기본 전하 e)의 값을 고정해 정의합니다. 1 A는 1초에 약 6.24×10¹⁸ 개의 전하가 지나가는 셈입니다." },
      { q: "온도", sym: "K", name: "켈빈", c: "--rose", desc: "볼츠만 상수의 값을 고정해 정의합니다. <b>0 K는 절대 영도</b>이고, 섭씨온도와는 273.15 만큼 차이가 납니다." },
      { q: "물질량", sym: "mol", name: "몰", c: "--green", desc: "입자 <b>6.02214076×10²³ 개</b>(아보가드로수)의 모임입니다. 눈에 보이지 않는 입자를 세기 위한 묶음 단위입니다." },
      { q: "광도", sym: "cd", name: "칸델라", c: "--amber", desc: "정해진 진동수의 빛을 내는 광원이 한 방향으로 보내는 밝기입니다. 촛불 한 개의 밝기에서 비롯한 단위입니다." }
    ];
    var ICOL = [KC.blue, KC.orange, KC.violet, KC.green, KC.red, "#7ff0c4", KC.yellow];
    /* 카드 오른쪽 위 작은 그림 */
    function icon(i, cx, cy, col) {
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.lineCap = "round";
      if (i === 0) { /* 자 */
        ctx.strokeRect(cx - 16, cy - 6, 32, 12);
        for (var k = -12; k <= 12; k += 6) { ctx.beginPath(); ctx.moveTo(cx + k, cy - 6); ctx.lineTo(cx + k, cy - (k % 12 ? 1 : -2)); ctx.stroke(); }
      } else if (i === 1) { /* 추 */
        var wg = ctx.createLinearGradient(cx - 12, 0, cx + 12, 0); wg.addColorStop(0, "#5a6378"); wg.addColorStop(0.5, "#e9edf6"); wg.addColorStop(1, "#4a5266");
        ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(cx - 8, cy - 6); ctx.lineTo(cx + 8, cy - 6); ctx.lineTo(cx + 13, cy + 11); ctx.lineTo(cx - 13, cy + 11); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#d7dcea"; ctx.beginPath(); ctx.arc(cx, cy - 10, 4.5, 0, Math.PI * 2); ctx.stroke();
      } else if (i === 2) { /* 시계 */
        ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 8); ctx.moveTo(cx, cy); ctx.lineTo(cx + 6, cy + 3); ctx.stroke();
      } else if (i === 3) { /* 번개 */
        ctx.shadowColor = col; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(cx + 3, cy - 14); ctx.lineTo(cx - 8, cy + 2); ctx.lineTo(cx, cy + 2); ctx.lineTo(cx - 3, cy + 14); ctx.lineTo(cx + 9, cy - 3); ctx.lineTo(cx + 1, cy - 3); ctx.closePath(); ctx.fill();
      } else if (i === 4) { /* 온도계 */
        ctx.strokeStyle = "rgba(230,235,255,.8)"; ctx.beginPath(); ctx.roundRect(cx - 4, cy - 15, 8, 22, 4); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy + 10, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx - 1.5, cy - 8, 3, 16);
      } else if (i === 5) { /* 입자 묶음 */
        [[-8, 4], [0, -6], [8, 4], [0, 8], [-4, -1], [5, -1]].forEach(function (p) { KT.planet(ctx, cx + p[0], cy + p[1], 4.2, col, "#0d4a38"); });
      } else { /* 촛불 */
        ctx.fillStyle = "#f1e6cf"; ctx.fillRect(cx - 4, cy - 2, 8, 16);
        KT.glow(ctx, cx, cy - 8, 3.4, "rgba(255,200,90,.95)", 4);
      }
      ctx.restore();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 8 });
      units.forEach(function (u, i) {
        var col = i % 4, row = (i / 4) | 0, x = col * 225 + 12, y = row * 150 + 16, c = ICOL[i], on = i === sel;
        if (on) { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 22; ctx.fillStyle = "rgba(20,26,60,.9)"; ctx.beginPath(); ctx.roundRect(x, y, 201, 120, 16); ctx.fill(); ctx.restore(); }
        glass(ctx, x, y, 201, 120, 16, on ? c : "rgba(200,210,255,.22)", on ? 0.16 : 0.08);
        var hg = ctx.createRadialGradient(x + 100, y + 44, 4, x + 100, y + 44, 70);
        hg.addColorStop(0, "rgba(255,255,255," + (on ? 0.10 : 0.05) + ")"); hg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = hg; ctx.fillRect(x, y, 201, 120);
        icon(i, x + 176, y + 28, c);
        glowText(ctx, u.sym, x + 100, y + 54, { s: 30, w: "900", a: "center", c: c, blur: on ? 18 : 8 });
        text(ctx, u.q, x + 100, y + 82, { s: 14, w: "800", a: "center", c: KC.ink });
        text(ctx, u.name, x + 100, y + 102, { s: 11, a: "center", c: KC.mute });
      });
      /* 빈 칸: 유도량 */
      var ex = 3 * 225 + 12, ey = 166;
      ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = "rgba(200,210,255,.3)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(ex, ey, 201, 120, 16); ctx.stroke(); ctx.restore();
      text(ctx, "그 밖의 모든 양", ex + 100, ey + 40, { s: 12.5, w: "800", a: "center", c: KC.mute });
      text(ctx, "m/s · N · J · kg/m³", ex + 100, ey + 68, { s: 14, w: "900", a: "center", c: KC.dim });
      text(ctx, "= 기본량을 곱하고 나눈 유도량", ex + 100, ey + 94, { s: 11, a: "center", c: KC.mute });
      text(ctx, "기본량은 이 7개가 전부입니다. 넓이·속력·힘·에너지는 모두 이 7개를 곱하고 나눠 만든 유도량입니다.", 16, 318, { s: 11.5, c: KC.mute });
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
    var st = { on: !REDUCE }, tm = 0, RP = KT.rng(9), parts = [];
    for (var pi = 0; pi < 10; pi++) parts.push({ x: RP(), y: RP(), p: RP() * 6.28, q: RP() * 6.28, w: 0.7 + RP() * 0.9 });
    function render() {
      ctx.clearRect(0, 0, W, H);
      var K = c + 273.15, x0 = xOf(c);
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 5, title: "섭씨(℃)와 켈빈(K) — 간격은 같고 출발점만 다르다" });
      /* 유리관 온도계 */
      var tube = ctx.createLinearGradient(0, 120, 0, 152); tube.addColorStop(0, "rgba(255,255,255,.10)"); tube.addColorStop(1, "rgba(255,255,255,.03)");
      ctx.fillStyle = tube; ctx.beginPath(); ctx.roundRect(90, 120, 740, 32, 16); ctx.fill();
      var grad = ctx.createLinearGradient(90, 0, 830, 0);
      grad.addColorStop(0, "#5fc2ff"); grad.addColorStop(0.55, "#ffd36b"); grad.addColorStop(1, "#ff6b5a");
      ctx.save(); ctx.shadowColor = K < 150 ? KC.blue : KC.orange; ctx.shadowBlur = 14;
      ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(92, 124, Math.max(8, x0 - 92), 24, 12); ctx.fill(); ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.beginPath(); ctx.roundRect(100, 125, 720, 4, 2); ctx.fill();
      ctx.strokeStyle = "rgba(210,220,255,.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(90, 120, 740, 32, 16); ctx.stroke();
      [-273, -200, -100, 0, 100, 200].forEach(function (t) {
        var x = xOf(t);
        ctx.strokeStyle = KC.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 152); ctx.lineTo(x, 162); ctx.stroke();
        KT.t(ctx, t + "", x, 178, { s: 10.5, a: "center", c: KC.yellow, w: "700" });
        KT.t(ctx, Math.round(t + 273.15) + "", x, 198, { s: 10.5, a: "center", c: KC.blue, w: "700" });
      });
      KT.t(ctx, "℃", 62, 178, { s: 11.5, w: "800", a: "right", c: KC.yellow });
      KT.t(ctx, "K", 62, 198, { s: 11.5, w: "800", a: "right", c: KC.blue });
      /* 지금 온도 표시 */
      KT.line(ctx, { x: x0, y: 112 }, { x: x0, y: 158 }, "#ffffff", 1.5, null, 0.7);
      ctx.save(); ctx.shadowColor = "#fff"; ctx.shadowBlur = 8; ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.moveTo(x0, 112); ctx.lineTo(x0 - 8, 98); ctx.lineTo(x0 + 8, 98); ctx.closePath(); ctx.fill(); ctx.restore();
      glowText(ctx, c + " ℃  =  " + K.toFixed(2) + " K", 400, 78, { s: 24, w: "900", a: "center", c: KC.red });
      /* 입자의 열운동 */
      var bx = 700, by = 12, bw = 184, bh = 92, amp = 11 * Math.sqrt(Math.max(K, 0) / 373.15);
      glass(ctx, bx, by, bw, bh, 12, "rgba(200,210,255,.25)", 0.06);
      KT.t(ctx, "입자의 열운동", bx + 10, by + 17, { s: 10.5, c: KC.mute });
      var hot = clamp(K / 473, 0, 1), pc = "rgba(" + Math.round(127 + 128 * hot) + "," + Math.round(211 - 60 * hot) + "," + Math.round(255 - 160 * hot) + ",.95)";
      parts.forEach(function (p) {
        var px = bx + 18 + p.x * (bw - 36) + Math.sin(tm * p.w * 0.012 + p.p) * amp;
        var py = by + 34 + p.y * (bh - 46) + Math.cos(tm * p.w * 0.015 + p.q) * amp * 0.6;
        KT.glow(ctx, px, py, 3.2, pc, 2.6);
      });
      if (K <= 0.5) KT.t(ctx, "열운동이 가장 약한 상태", bx + bw - 10, by + bh - 8, { s: 10, a: "right", c: KC.blue });
      KT.t(ctx, "0 K보다 낮은 온도는 없습니다. 그래서 켈빈에는 음수가 없습니다.", 90, 220, { s: 11, c: KC.mute, w: "600" });
    }
    function draw() {
      render();
      var K = c + 273.15;

      var note = "K = ℃ + 273.15입니다. 눈금의 <b>간격</b>은 같고 <b>시작점</b>만 다릅니다.";
      if (K <= 0.5) note = "−273 ℃(0.15 K)는 이 온도계에서 <b>절대 영도</b>(0 K = −273.15 ℃)에 가장 가까운 칸입니다. 절대 영도는 입자의 열운동이 더 줄어들 수 없는 한계로, 이보다 낮은 온도는 존재하지 않습니다.";
      else if (Math.abs(K - 273.15) <= 0.5) note = "물이 어는 온도 0 ℃는 켈빈으로 <b>273.15 K</b>입니다. 0이 아니라는 점이 중요합니다.";
      else if (Math.abs(K - 373.15) <= 0.5) note = "물이 끓는 온도 100 ℃ = <b>373.15 K</b>. 두 눈금의 차이는 언제나 273.15로 일정합니다.";
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
    pauser("a-temp-play", st);
    KT.animate(canvas, function (dt) { if (st.on) { tm += dt; render(); } });
    window.sthSort({
      mount: "s1-sort",
      buckets: [
        { id: "base", label: "SI 기본량", sub: "7개뿐이다" },
        { id: "der", label: "유도량", sub: "기본량을 곱하고 나눠 만든다" },
        { id: "non", label: "SI가 아닌 단위", sub: "분야·나라마다 다르게 쓴다" }
      ],
      items: [
        { t: "길이 (m)", a: "base", why: "기본량입니다." },
        { t: "질량 (kg)", a: "base", why: "기본량입니다. 유일하게 접두어 k가 붙은 기본단위입니다." },
        { t: "시간 (s)", a: "base", why: "기본량입니다." },
        { t: "전류 (A)", a: "base", why: "기본량입니다.", hint: "전기와 관련된 기본량이 하나 있습니다." },
        { t: "온도 (K)", a: "base", why: "기본량입니다. 기본단위는 ℃가 아니라 K입니다.", hint: "온도의 SI 기본단위는 무엇이었나요?" },
        { t: "물질량 (mol)", a: "base", why: "기본량입니다. 입자의 개수를 다루는 기본량입니다." },
        { t: "광도 (cd)", a: "base", why: "기본량입니다. 빛의 밝기도 기본량에 들어갑니다.", hint: "카드 7장을 다시 보세요." },
        { t: "넓이 (m²)", a: "der", why: "길이 × 길이 이므로 유도량입니다." },
        { t: "속력 (m/s)", a: "der", why: "길이 ÷ 시간 이므로 유도량입니다." },
        { t: "힘 (N = kg·m/s²)", a: "der", why: "질량 × 가속도, 곧 기본량 세 가지의 조합입니다." },
        { t: "밀도 (kg/m³)", a: "der", why: "질량 ÷ 부피 이므로 유도량입니다." },
        { t: "파운드힘 (lbf)", a: "non", why: "미국에서 쓰는 힘의 단위입니다. 이번 사고의 원인이 된 바로 그 단위입니다.", hint: "사고 보고서에 나온 단위입니다." },
        { t: "마일 (mile)", a: "non", why: "SI 단위가 아닙니다. 1 mile ≈ 1,609 m입니다." },
        { t: "칼로리 (cal)", a: "non", why: "SI에서 에너지의 단위는 줄(J)입니다. 1 cal ≈ 4.184 J입니다.", hint: "영양 성분표에서 보던 단위지요." }
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
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>기본량 7개, 그 밖은 모두 <b>유도량</b>. 그리고 파운드힘·마일·칼로리처럼 <b>SI가 아닌 단위</b>는 쓸 때마다 반드시 환산해야 합니다.");
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
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 이제 숫자로도 증명했습니다." : "처음 생각과 달랐지요? 추리를 증거로 고쳐 나가는 것이 과학입니다.") +
      "<br><b>내가 찾은 환산 계수</b> × " + (window.sthState("aK") || "-");
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();

  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅰ-1] 이야기 ① 단위를 잃어버린 우주선",
    items: [
      { id: "w1", label: "단위가 없으면 생기는 일", hint: "이 단원에서 본 사례 하나를 골라, 단위를 정하지 않으면 무엇이 어긋나는지 쓰세요." },
      { id: "e1b", label: "1 m를 다시 정의한다면", hint: "1 m의 기준을 ‘파리에 보관한 금속 막대’에서 ‘빛이 간 거리’로 바꾼 까닭을 쓰세요. 킬로그램이 2019년에 바뀐 일과 묶어 설명하면 좋습니다." }
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
    "18": ["✨", "밤하늘의 밝은 별들", "약 100 광년"],
    "19": ["✨", "별자리 하나", "약 1,000 광년"],
    "20": ["🌟", "우리은하 원반 두께의 열 배쯤", "약 1만 광년"],
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
    /* 크기 영역마다 다른 빛깔: 원자 세계 · 생명 · 사람 · 행성 · 우주 */
    function tint(e) {
      if (e < -8) return [182, 156, 255]; if (e < -3) return [63, 211, 163]; if (e < 5) return [255, 211, 107];
      if (e < 14) return [127, 211, 255]; return [200, 150, 255];
    }
    function frame(x, y, w, h, e, on) {
      var t = tint(e), g = ctx.createRadialGradient(x + w / 2, y + h * 0.42, 6, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
      g.addColorStop(0, "rgba(" + t.join(",") + "," + (on ? 0.30 : 0.16) + ")"); g.addColorStop(1, "rgba(" + t.join(",") + ",0.02)");
      ctx.fillStyle = "rgba(8,10,30,.55)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill();
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill();
      ctx.save();
      if (on) { ctx.shadowColor = "rgb(" + t.join(",") + ")"; ctx.shadowBlur = 16; }
      ctx.strokeStyle = on ? "rgba(" + t.join(",") + ",.9)" : "rgba(200,210,255,.25)"; ctx.lineWidth = on ? 2.5 : 1.5;
      if (!on) ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.stroke(); ctx.restore();
      if (on) { /* 뷰파인더 모서리 */
        ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 2;
        [[x + 14, y + 14, 1, 1], [x + w - 14, y + 14, -1, 1], [x + 14, y + h - 14, 1, -1], [x + w - 14, y + h - 14, -1, -1]].forEach(function (c) {
          ctx.beginPath(); ctx.moveTo(c[0], c[1] + 14 * c[3]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0] + 14 * c[2], c[1]); ctx.stroke();
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      KT.stage(ctx, 0, 0, W, H, "space", { seed: 21 });
      var here = place(n), low = place(n - 1), high = place(n + 1);
      KT.pill(ctx, "10의 거듭제곱 산책 — 가운데가 지금 보이는 것", 16, 30, { s: 13, c: KC.blue });
      /* 한 걸음 아래 */
      frame(40, 130, 110, 130, n - 1, false);
      text(ctx, n > -15 ? low[0] : "—", 95, 185, { s: 26, a: "center" });
      text(ctx, n > -15 ? low[1] : "끝", 95, 220, { s: 10.5, a: "center", c: KC.mute });
      text(ctx, "한 걸음 작게", 95, 120, { s: 10.5, w: "700", a: "center", c: KC.mute });
      /* 지금 보이는 것 */
      frame(176, 84, 244, 220, n, true);
      text(ctx, here[0], 298, 176, { s: 54, a: "center" });
      glowText(ctx, here[1], 298, 224, { s: 17, w: "900", a: "center", c: KC.yellow, blur: 10 });
      text(ctx, here[2], 298, 252, { s: 11.5, a: "center", c: KC.ink });
      text(ctx, "10" + sup(n) + " m", 298, 284, { s: 14, w: "800", a: "center", c: KC.blue });
      /* 한 걸음 위 */
      frame(446, 130, 110, 130, n + 1, false);
      text(ctx, n < 26 ? high[0] : "—", 501, 185, { s: 26, a: "center" });
      text(ctx, n < 26 ? high[1] : "끝", 501, 220, { s: 10.5, a: "center", c: KC.mute });
      text(ctx, "한 걸음 크게", 501, 120, { s: 10.5, w: "700", a: "center", c: KC.mute });
      KT.arrow(ctx, { x: 172, y: 195 }, { x: 154, y: 195 }, KC.mute, 2, 7);
      KT.arrow(ctx, { x: 424, y: 195 }, { x: 442, y: 195 }, KC.mute, 2, 7);
      KT.pill(ctx, "화면 한 변 = " + lenStr(n), 298, 338, { a: "center", s: 13, c: KC.violet, box: [10, 600] });
      text(ctx, "손톱(10⁻² m)에서 여기까지 " + Math.abs(n + 2) + "걸음", 298, 372, { s: 11.5, a: "center", c: KC.mute });
      /* 사다리 */
      function yOfN(e) { return 350 - (e + 15) * (290 / 41); }
      var lg = ctx.createLinearGradient(0, 354, 0, 56); lg.addColorStop(0, KC.violet); lg.addColorStop(0.45, KC.yellow); lg.addColorStop(1, KC.blue);
      ctx.save(); ctx.shadowColor = "rgba(180,200,255,.6)"; ctx.shadowBlur = 8; ctx.strokeStyle = lg; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(640, 56); ctx.lineTo(640, 354); ctx.stroke(); ctx.restore();
      for (var e = -15; e <= 26; e++) {
        ctx.strokeStyle = "rgba(200,210,255,.35)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(634, yOfN(e)); ctx.lineTo(646, yOfN(e)); ctx.stroke();
      }
      LADDER.forEach(function (e) {
        KT.t(ctx, "10" + sup(e), 628, yOfN(e) + 4, { s: 10.5, a: "right", c: KC.mute, w: "600" });
        KT.t(ctx, PLACES[String(e)][1], 654, yOfN(e) + 4, { s: 10.5, c: e === n ? KC.yellow : KC.mute, w: e === n ? "800" : "600" });
      });
      KT.glow(ctx, 640, yOfN(n), 5, "rgba(255,236,190,.95)", 3.4);
      ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(640, yOfN(n), 9, 0, Math.PI * 2); ctx.stroke();
      KT.t(ctx, "지금", 610, yOfN(n) - 12, { s: 10.5, w: "900", a: "right", c: KC.yellow });
      KT.t(ctx, "작은 쪽", 640, 374, { s: 10.5, a: "center", c: KC.mute });
      KT.t(ctx, "큰 쪽", 640, 46, { s: 10.5, a: "center", c: KC.mute });

      $("b-walk-info").innerHTML = "지금 보이는 것: <b>" + here[1] + "</b> · " + here[2] +
        "<br>화면 한 변은 <b>10" + sup(n) + " m</b>입니다. 손잡이를 한 칸 움직일 때마다 <b>10배</b>씩 달라집니다.";

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
      ctx.clearRect(0, 0, W, H);
      KT.stage(ctx, 0, 0, W, H, "space", { seed: 33 });
      var d = Math.abs(eB - eA);
      KT.pill(ctx, "표지 A · 10" + sup(eA) + " m — 가장 가까운 기준 " + near(eA), 20, 32, { s: 12, c: KC.orange });
      KT.pill(ctx, "표지 B · 10" + sup(eB) + " m — 가장 가까운 기준 " + near(eB), 20, 60, { s: 12, c: KC.blue });
      glowText(ctx, d === 0 ? "두 표지는 같은 크기" : "10" + sup(d) + " 배 차이", 450, 114, { s: 26, w: "900", a: "center", c: KC.violet });
      text(ctx, "큰 쪽 지수 " + Math.max(eA, eB) + " − 작은 쪽 지수 " + Math.min(eA, eB) + " = " + d, 450, 144, { s: 12.5, a: "center", c: KC.mute });
      /* 배율 괄호 */
      var xa = xOf(eA), xb = xOf(eB), lo = Math.min(xa, xb), hi = Math.max(xa, xb);
      if (hi - lo > 1) {
        var bg = ctx.createLinearGradient(lo, 0, hi, 0); bg.addColorStop(0, "rgba(182,156,255,.05)"); bg.addColorStop(0.5, "rgba(182,156,255,.22)"); bg.addColorStop(1, "rgba(182,156,255,.05)");
        ctx.fillStyle = bg; ctx.fillRect(lo, 186, hi - lo, 64);
        ctx.save(); ctx.shadowColor = KC.violet; ctx.shadowBlur = 8; ctx.strokeStyle = KC.violet; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lo, 186); ctx.lineTo(hi, 186); ctx.moveTo(lo, 178); ctx.lineTo(lo, 194); ctx.moveTo(hi, 178); ctx.lineTo(hi, 194); ctx.stroke(); ctx.restore();
      }
      /* 축: 작은 쪽(보라) → 큰 쪽(파랑) */
      var ag = ctx.createLinearGradient(60, 0, 840, 0); ag.addColorStop(0, KC.violet); ag.addColorStop(0.45, KC.yellow); ag.addColorStop(1, KC.blue);
      ctx.save(); ctx.shadowColor = "rgba(180,200,255,.6)"; ctx.shadowBlur = 8; ctx.strokeStyle = ag; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(60, 250); ctx.lineTo(840, 250); ctx.stroke(); ctx.restore();
      for (var e = -15; e <= 26; e++) {
        ctx.strokeStyle = "rgba(220,226,255,.45)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xOf(e), 244); ctx.lineTo(xOf(e), 256); ctx.stroke();
        if ((e + 15) % 5 === 0) KT.t(ctx, "10" + sup(e), xOf(e), 238, { s: 9.5, a: "center", c: KC.mute, w: "600" });
      }
      refs.forEach(function (r, i) {
        text(ctx, r.i, xOf(r.e), 280, { s: 15, a: "center" });
        KT.t(ctx, r.t, xOf(r.e), i % 2 ? 318 : 300, { s: 10, a: "center", c: KC.mute, w: "600" });
      });
      var sep = Math.abs(xa - xb) < 26 ? 13 : 0, aL = xa <= xb ? -sep : sep;
      KT.glow(ctx, xa, 250, 6, "rgba(255,179,92,.95)", 3);
      ctx.strokeStyle = KC.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xa, 250, 10, 0, Math.PI * 2); ctx.stroke();
      KT.pill(ctx, "A", xa + aL, 218, { a: "center", s: 13, c: KC.orange });
      KT.glow(ctx, xb, 250, 6, "rgba(127,211,255,.95)", 3);
      ctx.strokeStyle = KC.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xb, 250, 10, 0, Math.PI * 2); ctx.stroke();
      KT.pill(ctx, "B", xb - aL, 218, { a: "center", s: 13, c: KC.blue });

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
      q: "지구의 지름은 약 10⁷ m, 원자 한 개의 지름은 약 10⁻¹⁰ m입니다. 지구는 원자의 몇 배일까요?",
      options: ["10³ 배", "10¹⁷ 배", "10⁻¹⁷ 배", "10⁷⁰ 배"],
      answer: 1,
      why: [
        "지수끼리 더한 것이 아니라 <b>뺀</b> 값이어야 합니다. 7 − (−10)을 다시 계산해 보세요.",
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
    var st = { on: !REDUCE }, ph = 0;
    var BCOL = { "초": [63, 211, 163], "분": [127, 211, 255], "시간": [182, 156, 255], "일": [255, 211, 107], "년": [255, 120, 110] };
    function render() {
      ctx.clearRect(0, 0, W, H);
      var d = Math.pow(10, n), t = tOf(n);
      KT.stage(ctx, 0, 0, W, H, "space", { seed: 44, title: "빛이 이 거리를 가는 데 걸리는 시간" });
      text(ctx, "거리 " + sciStr(d, 1) + " m", 450, 70, { s: 13, a: "center", c: KC.mute });
      glowText(ctx, timeStr(t), 450, 112, { s: 30, w: "900", a: "center", c: KC.yellow });
      var x0 = 60;
      bands.forEach(function (b) {
        var x1 = xOf(b.to), c = BCOL[b.t], g = ctx.createLinearGradient(0, 150, 0, 180);
        g.addColorStop(0, "rgba(" + c.join(",") + ",.65)"); g.addColorStop(1, "rgba(" + c.join(",") + ",.25)");
        ctx.fillStyle = g; ctx.fillRect(x0, 150, Math.max(0, x1 - x0), 30);
        if (x1 - x0 > 26) KT.t(ctx, b.t, (x0 + x1) / 2, 170, { s: 11.5, w: "800", a: "center", c: "#ffffff" });
        x0 = x1;
      });
      ctx.strokeStyle = "rgba(220,226,255,.5)"; ctx.lineWidth = 1.5; ctx.strokeRect(60, 150, 780, 30);
      marks.forEach(function (m, i) {
        var x = xOf(m.n);
        ctx.strokeStyle = KC.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 180); ctx.lineTo(x, 190); ctx.stroke();
        KT.t(ctx, m.t, clamp(x, 70, 830), i % 2 ? 222 : 204, { s: 10.5, a: "center", c: KC.mute, w: "600" });
      });
      var cx = xOf(n);
      /* 빛줄기: 출발점에서 지금 거리까지 빛 덩어리가 흘러간다 */
      var by = 238;
      KT.line(ctx, { x: 60, y: by }, { x: cx, y: by }, "rgba(255,236,190,.35)", 2);
      for (var k = 0; k < 6; k++) {
        var px = 60 + ((ph + k / 6) % 1) * (cx - 60);
        if (cx - 60 > 12) KT.glow(ctx, px, by, 2.2, "rgba(255,240,200,.95)", 3.2);
      }
      KT.glow(ctx, 60, by, 4, "rgba(255,230,160,.95)", 4);
      KT.planet(ctx, cx, by, 6, "#9fb7ff", "#26306a");
      ctx.save(); ctx.shadowColor = "#fff"; ctx.shadowBlur = 8; ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.moveTo(cx, 148); ctx.lineTo(cx - 8, 134); ctx.lineTo(cx + 8, 134); ctx.closePath(); ctx.fill(); ctx.restore();
      KT.t(ctx, "n = " + n.toFixed(1), clamp(cx, 80, 820), 128, { s: 11, w: "900", a: "center", c: KC.ink });
      KT.t(ctx, "빛의 속력 299,792,458 m/s — 1초에 지구를 일곱 바퀴 반 돕니다.", 40, 270, { s: 12, c: KC.mute, w: "600" });
      KT.pill(ctx, "1 광년 = 빛이 1년 동안 가는 거리 = 9.46 × 10¹⁵ m", 40, 298, { s: 12, c: KC.green });
      KT.warn(ctx, 884, 298, "⚠ 가로축은 10배씩 늘어나는 눈금", "right");
    }
    function draw() {
      render();
      var d = Math.pow(10, n), t = tOf(n), okA = Math.abs(t - 1) <= 0.1, okB = Math.abs(t / YEAR - 1) <= 0.1;
      $("b-light-read").innerHTML =
        "<span class='k'>거리 d</span><span class='v b'>" + sciStr(d, 1) + " m</span>" +
        "<span class='k'>걸리는 시간 t = d ÷ c</span><span class='v y'>" + timeStr(t) + "</span>" +
        "<span class='sub'>c = 299,792,458 m/s</span>" +
        "<span class='ok " + (okA || okB ? "g" : "r") + "'>" + (okA ? "빛으로 약 1초 거리" : okB ? "빛으로 약 1년 = 1 광년" : "‘약 1초’와 ‘약 1년’을 찾아보세요") + "</span>";

      $("b-light-info").innerHTML = "거리 <b>" + sciStr(d, 1) + " m</b> → 빛으로 <b>" + timeStr(t) + "</b>. " +
        (Math.abs(t - 1) / 1 <= 0.1 ? "✅ 빛이 1초에 가는 거리입니다. 약 3×10⁸ m입니다." :
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
    pauser("b-light-play", st);
    KT.animate(canvas, function (dt) { if (st.on) { ph = (ph + dt / 2600) % 1; render(); } });
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
      (p.indexOf("㉠") === 0 ? " — 정확했습니다. 28걸음이었습니다." : " — 10배씩 걷기 때문에 걸음 수는 자릿수의 차이만큼입니다.") +
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
    function digits(T) {
      var s = T.full.replace(/,/g, ""), parts = s.split(".");
      return { D: (parts[0] + (parts[1] || "")).split(""), o: parts[0].length };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      KT.stage(ctx, 0, 0, W, H, "lab", { seed: 12 });
      var T = TARGETS[ti], A = T.val / Math.pow(10, p);
      KT.pill(ctx, T.name, 16, 30, { s: 13.5, c: KC.blue });
      KT.t(ctx, "원래 적은 수  " + T.full + " " + T.unit, 450, 50, { s: 12, a: "center", c: KC.mute, w: "700" });
      /* 숫자 타일 — 소수점이 칸을 뛰어 옮겨 간다 */
      var dg = digits(T), q = dg.o - p, lo = Math.min(0, q), hi = Math.max(dg.D.length, q), cnt = hi - lo;
      var tw = Math.min(40, 760 / cnt), x0 = 440 - cnt * tw / 2, ty = 92, th = 40, fn = 0;
      while (fn < dg.D.length - 1 && dg.D[fn] === "0") fn++;
      for (var j = lo; j < hi; j++) {
        var ghost = j < 0 || j >= dg.D.length, ch = ghost ? "0" : dg.D[j], X = x0 + (j - lo) * tw;
        glass(ctx, X + 2, ty, tw - 4, th, 7, ghost ? "rgba(200,210,255,.14)" : (j >= fn ? "rgba(127,211,255,.45)" : "rgba(200,210,255,.25)"), ghost ? 0.03 : 0.1);
        text(ctx, ch, X + tw / 2, ty + 28, { s: Math.min(22, tw * 0.6), w: "800", a: "center", c: ghost ? KC.dim : (j >= fn ? KC.ink : KC.mute) });
      }
      KT.t(ctx, T.unit, x0 + cnt * tw + 8, ty + 27, { s: 13, c: KC.mute });
      var xo = x0 + (dg.o - lo) * tw, xq = x0 + (q - lo) * tw, dy = ty + th + 9;
      ctx.strokeStyle = "rgba(200,210,255,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xo, dy, 4, 0, Math.PI * 2); ctx.stroke();
      if (p !== 0) {
        ctx.save(); ctx.shadowColor = KC.yellow; ctx.shadowBlur = 8; ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(xo, ty - 4); ctx.quadraticCurveTo((xo + xq) / 2, ty - 36, xq, ty - 4); ctx.stroke(); ctx.restore();
        KT.arrow(ctx, { x: xq + (xo - xq) * 0.04, y: ty - 10 }, { x: xq, y: ty - 3 }, KC.yellow, 2, 9);
      }
      KT.glow(ctx, xq, dy, 4.5, "rgba(255,211,107,.98)", 3.6);
      var move = p === 0 ? "소수점을 아직 옮기지 않았습니다" :
        (p > 0 ? "소수점을 왼쪽으로 " + p + "칸 옮김" : "소수점을 오른쪽으로 " + (-p) + "칸 옮김");
      KT.pill(ctx, "● " + move, 450, 166, { a: "center", s: 12.5, c: KC.yellow });
      var ok = A >= 1 && A < 10;
      glowText(ctx, aStr(A) + " × 10" + sup(p) + " " + T.unit, 450, 214, { s: 30, w: "900", a: "center", c: ok ? KC.green : KC.red });
      var verdict = ok ? "✅ 계수가 1 이상 10 미만 — 올바른 과학적 표기법입니다" :
        (A >= 10 ? "계수가 10 이상입니다. 소수점을 더 왼쪽으로 옮기세요" : "계수가 1보다 작습니다. 소수점을 오른쪽으로 되돌리세요");
      text(ctx, verdict, 450, 248, { s: 13, w: "800", a: "center", c: ok ? KC.green : KC.ink });
      if (ok) text(ctx, "유효숫자 두 자리로 어림하면 " + sciStr(T.val, 1) + " " + T.unit, 450, 278, { s: 11.5, a: "center", c: KC.mute });
      else text(ctx, "규칙: A × 10ⁿ에서 계수 A는 반드시 1 이상 10 미만", 450, 278, { s: 11.5, a: "center", c: KC.mute });

      $("c-sci-info").innerHTML = "<b>" + T.name + "</b> = " + T.full + " " + T.unit + " → 지금 만든 표기는 <b>" + aStr(A) + " × 10" + sup(p) + "</b>입니다. " +
        (ok ? "옳습니다. 위의 단추로 다른 수도 고쳐 보세요." : "계수가 1 이상 10 미만이 되도록 손잡이를 움직이세요.");

      if (ok && !got[T.key]) { got[T.key] = true; window.sthState("cSci", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.c) done("m3-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>3.0×10⁸ · 3.7×10¹³ · 1.0×10⁻¹⁰. <b>지수 n은 소수점을 옮긴 칸 수</b>이고, 왼쪽으로 옮기면 +, 오른쪽으로 옮기면 − 입니다.");
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
    var st = { on: !REDUCE }, tm = 0, RW = KT.rng(17), mols = [];
    for (var mi = 0; mi < 16; mi++) mols.push({ x: RW(), y: RW(), a: RW() * 6.28, p: RW() * 6.28, w: 0.6 + RW() * 0.8 });
    function h2o(x, y, a) {
      /* 물 분자: 산소(빨강) 하나에 수소(흰색) 둘, 결합각 약 104.5° */
      for (var s = -1; s <= 1; s += 2) { var b = a + s * 0.912; KT.planet(ctx, x + Math.cos(b) * 7, y + Math.sin(b) * 7, 3.3, "#f4f6ff", "#7d86a6"); }
      KT.planet(ctx, x, y, 5.3, "#ff7b7b", "#7a1020");
    }
    /* ── 잘라 보는 디오라마: 실험대 위 전자저울과, 반으로 잘라 속을 보인 비커 + 분자 확대경 ── */
    var DH = 410;                                         /* 위 모형 칸 높이(아래는 계산 칸) */
    var I = KT.iso({ ox: 330, oy: 140, s: 0.72, L: 400, D: 260 });
    var CX = 200, CY = 150, RB = 64, ZB = 22, ZT = 188;    /* 비커: 중심·반지름·안쪽 바닥·테두리 높이(그림 단위) */
    var DEG = Math.PI / 180;
    function zOfG(g) { return ZB + g / 360 * 150; }       /* 물 g → 수면 높이(물 1 g ≈ 1 mL) */
    var RM = KT.rng(29), mag = [];                        /* 확대경 속 물 분자: 액체라 양과 상관없이 늘 빽빽하다 */
    for (var gi = 0; gi < 6; gi++) for (var gj = 0; gj < 6; gj++)
      mag.push({ x: (gi + 0.5) / 6 + (RM() - 0.5) * 0.07, y: (gj + 0.5) / 6 + (RM() - 0.5) * 0.07, a: RM() * 6.28, p: RM() * 6.28, w: 0.6 + RM() * 0.8 });
    function cp(t, r, z) { return I.P(CX + r * Math.cos(t), CY + r * Math.sin(t), z); }
    function arcTo(t0, t1, r, z, first) {
      var n = Math.max(6, Math.round(Math.abs(t1 - t0) / (4 * DEG))), k;
      for (k = 0; k <= n; k++) { var p = cp(t0 + (t1 - t0) * k / n, r, z); if (first && k === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
    }
    function band(t0, t1, r, z0, z1, fill) {
      ctx.beginPath(); arcTo(t0, t1, r, z0, true); arcTo(t1, t0, r, z1, false); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
    }
    function pie(t0, t1, r, z, fill, stroke) {
      var c = I.P(CX, CY, z); ctx.beginPath(); ctx.moveTo(c.x, c.y); arcTo(t0, t1, r, z, false); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    function cutFace(t, z0, z1, fill, r0, r1) {           /* 반지름 방향 t 의 자른 면 */
      var a = cp(t, r0 || 0, z0), b = cp(t, r1 == null ? RB : r1, z0), c = cp(t, r1 == null ? RB : r1, z1), d = cp(t, r0 || 0, z1);
      I.quad(ctx, a, b, c, d, fill);
    }
    function h2oS(x, y, a, k) {
      for (var s = -1; s <= 1; s += 2) { var b = a + s * 0.912; KT.planet(ctx, x + Math.cos(b) * 7 * k, y + Math.sin(b) * 7 * k, 3.3 * k, "#f4f6ff", "#7d86a6"); }
      KT.planet(ctx, x, y, 5.3 * k, "#ff7b7b", "#7a1020");
    }
    function drawModel(mol, cnt) {
      var wz = m > 0 ? zOfG(m) : ZB, t;
      var flo = I.P(400, 260, -36);
      KT.studio(ctx, 0, 0, W, DH, { x: I.P(200, 130, -36).x, y: flo.y - 16, rx: 300, ry: 46 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      /* 실험대 · 공책 · 전자저울 */
      I.box(ctx, 0, 0, -36, 400, 260, 0, "#d2ab7c", "#a97f52", "#8a6540");
      ctx.strokeStyle = "rgba(90,60,30,.18)"; ctx.lineWidth = 1;
      for (t = 30; t < 400; t += 46) { var w0 = I.P(t, 0, 0), w1 = I.P(t, 260, 0); ctx.beginPath(); ctx.moveTo(w0.x, w0.y); ctx.lineTo(w1.x, w1.y); ctx.stroke(); }
      I.box(ctx, 316, 168, 0, 384, 240, 3, "#fbfbf6", "#dcdccf", "#c9c9bb");
      I.box(ctx, 106, 56, 0, 294, 244, 16, "#e9edf2", "#c7cdd6", "#a6aebb");
      I.box(ctx, 132, 82, 16, 268, 218, 18, "#f7f9fc", "#d8dde4", "#bcc3cc");
      var d0 = I.P(150, 244, 3), d1 = I.P(250, 244, 3), d2 = I.P(250, 244, 13), d3 = I.P(150, 244, 13);
      I.quad(ctx, d0, d1, d2, d3, "#163a2a");
      ctx.save(); ctx.transform(0.866 * 0.72, 0.5 * 0.72, 0, 0.72, d3.x, d3.y);   /* 표시창 면(앞면)에 맞춰 글자 기울이기 */
      ctx.font = "800 8px Consolas, monospace"; ctx.fillStyle = "#6dffb0"; ctx.textAlign = "right"; ctx.fillText(m.toFixed(1) + " g", 94, 8); ctx.restore();
      /* 비커 안쪽 뒷벽(유리 너머로 보이는 쪽) · 유리 바닥 */
      band(135 * DEG, 315 * DEG, RB - 3, 18, ZT, "rgba(214,232,250,.32)");
      pie(90 * DEG, 360 * DEG, RB, 18, "rgba(225,240,255,.55)");
      cutFace(0, 18, ZB, "rgba(235,245,255,.85)"); cutFace(90 * DEG, 18, ZB, "rgba(235,245,255,.85)");
      /* 물 */
      if (m > 0) {
        var wf = ctx.createLinearGradient(0, I.P(CX, CY, wz).y, 0, I.P(CX, CY, ZB).y + 30);
        wf.addColorStop(0, "rgba(96,178,240,.88)"); wf.addColorStop(1, "rgba(28,92,190,.92)");
        band(-45 * DEG, 0, RB - 3, ZB, wz, wf); band(90 * DEG, 135 * DEG, RB - 3, ZB, wz, wf);
        var cf = ctx.createLinearGradient(0, I.P(CX, CY, wz).y, 0, I.P(CX, CY, ZB).y + 20);
        cf.addColorStop(0, "rgba(120,196,250,.95)"); cf.addColorStop(1, "rgba(40,110,205,.97)");
        cutFace(0, ZB, wz, cf, 0, RB - 3); cutFace(90 * DEG, ZB, wz, cf, 0, RB - 3);
        /* 자른 면의 아주 작은 물방울 무늬(분자는 이보다 훨씬 작다) */
        var RS = KT.rng(5); ctx.fillStyle = "rgba(255,255,255,.22)";
        for (var q = 0; q < 70; q++) { var side = RS() < .5 ? 0 : 90 * DEG, pp = cp(side, RS() * (RB - 6), ZB + RS() * (wz - ZB)); ctx.fillRect(pp.x, pp.y, 1.4, 1.4); }
        pie(90 * DEG, 360 * DEG, RB - 3, wz, "rgba(150,212,255,.80)", "rgba(235,248,255,.9)");
        ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 1;
        for (var rr = 0; rr < 3; rr++) {
          var ph = tm * 0.0012 + rr * 2.1, rad = (RB - 14) * ((0.3 + ph / 6.28) % 1);
          ctx.beginPath(); arcTo(100 * DEG, 350 * DEG, Math.max(4, rad), wz, true); ctx.stroke();
        }
      }
      /* 유리: 바깥 앞쪽 띠·자른 단면의 유리 두께·테두리 */
      band(-45 * DEG, 0, RB, 18, ZT, "rgba(225,240,255,.16)"); band(90 * DEG, 135 * DEG, RB, 18, ZT, "rgba(225,240,255,.16)");
      cutFace(0, 18, ZT, "rgba(240,248,255,.95)", RB - 3, RB); cutFace(90 * DEG, 18, ZT, "rgba(240,248,255,.95)", RB - 3, RB);
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2;
      ctx.beginPath(); arcTo(90 * DEG, 360 * DEG, RB, ZT, true); ctx.stroke();
      ctx.strokeStyle = "rgba(150,170,200,.7)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); arcTo(-45 * DEG, 0, RB, 18, true); ctx.stroke(); ctx.beginPath(); arcTo(90 * DEG, 135 * DEG, RB, 18, true); ctx.stroke();
      var e1 = cp(135 * DEG, RB, 18), e2 = cp(135 * DEG, RB, ZT), e3 = cp(-45 * DEG, RB, 18), e4 = cp(-45 * DEG, RB, ZT);
      ctx.beginPath(); ctx.moveTo(e1.x, e1.y); ctx.lineTo(e2.x, e2.y); ctx.moveTo(e3.x, e3.y); ctx.lineTo(e4.x, e4.y); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 3;
      var h1 = cp(112 * DEG, RB + 0.5, 40), h2 = cp(112 * DEG, RB + 0.5, ZT - 20); ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(h2.x, h2.y); ctx.stroke();
      /* 눈금 100·200·300 mL (오른쪽 앞 유리) */
      [100, 200, 300].forEach(function (g) {
        var z = zOfG(g); ctx.strokeStyle = "rgba(40,60,90,.75)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); arcTo(-40 * DEG, -18 * DEG, RB, z, true); ctx.stroke();
        var lp = cp(-40 * DEG, RB, z); KT.t(ctx, g + " mL", lp.x + 5, lp.y + 4, { s: 10, c: "#3a4a66", w: "800" });
      });
      ctx.restore();
      /* 분자 확대경 */
      var MX = 742, MY = 218, MR = 104;
      var src = m > 0 ? cp(0, RB * 0.55, ZB + (wz - ZB) * 0.5) : cp(0, RB * 0.55, ZB + 10);
      if (m > 0) {
        KT.line(ctx, src, { x: MX - MR * 0.92, y: MY + 30 }, "rgba(30,45,70,.55)", 1.4, [5, 4]);
        KT.line(ctx, src, { x: MX - MR * 0.35, y: MY + MR * 0.93 }, "rgba(30,45,70,.55)", 1.4, [5, 4]);
        ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(src.x, src.y, 2.6, 0, 6.2832); ctx.fill();
      }
      ctx.save(); ctx.beginPath(); ctx.arc(MX, MY, MR, 0, 6.2832); ctx.clip();
      var mg = ctx.createRadialGradient(MX - 30, MY - 30, 10, MX, MY, MR);
      if (m > 0) { mg.addColorStop(0, "#2d6fb8"); mg.addColorStop(1, "#0d2650"); } else { mg.addColorStop(0, "#3a4458"); mg.addColorStop(1, "#151a26"); }
      ctx.fillStyle = mg; ctx.fillRect(MX - MR, MY - MR, MR * 2, MR * 2);
      if (m > 0) {
        mag.forEach(function (o) {
          var x = MX - MR + 6 + o.x * (MR * 2 - 12) + Math.sin(tm * 0.002 * o.w + o.p) * 4;
          var y = MY - MR + 6 + o.y * (MR * 2 - 12) + Math.cos(tm * 0.0023 * o.w + o.p) * 4;
          h2oS(x, y, o.a + tm * 0.0015 * o.w, 1.25);
        });
      }
      ctx.restore();
      ctx.strokeStyle = "#e8edf5"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(MX, MY, MR + 3, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = "#7f8ba0"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(MX, MY, MR + 7, 0, 6.2832); ctx.stroke();
      var mbox = [MX - 160, W];
      KT.pill(ctx, m > 0 ? "🔍 분자 수준으로 확대한 물" : "🔍 물이 없습니다", MX, MY + MR + 30, { a: "center", s: 12, c: KC.blue, box: mbox });
      if (m > 0) KT.pill(ctx, "빨강 산소 · 흰색 수소 — H₂O", MX, MY + MR + 54, { a: "center", s: 11, c: KC.ink, box: mbox });
      /* 이름표 */
      var box = [0, 600];
      I.label(ctx, 290, 150, 9, "전자저울 " + m + " g", 46, 30, "#bdf5d6", box);
      I.label(ctx, CX, CY + RB * 0.7, (ZB + ZT) / 2 + 26, "반으로 잘라 본 비커", -100, -38, "#e8ecff", box);
      if (m > 0) I.label(ctx, CX - 12, CY + RB * 0.5, (ZB + wz) / 2, "물 " + m + " g (약 " + m + " mL)", -96, 26, "#bfe6ff", box);
      /* 큰 제목 */
      var l1, l2;
      if (m === 0) { l1 = "빈 비커"; l2 = "저울에 물을 부어 보세요"; }
      else if (Math.abs(mol - 1) <= 0.02) { l1 = "딱 1 mol"; l2 = "분자 " + sciStr(cnt, 2) + " 개"; }
      else if (Math.abs(m - 200) <= 2) { l1 = "물 한 컵 속 분자"; l2 = sciStr(cnt, 1) + " 개"; }
      else { l1 = "물 " + m + " g 속 분자는?"; l2 = "약 " + sciStr(cnt, 1) + " 개"; }
      KT.bigText(ctx, l1, 22, 50, 28, "#ffffff");
      KT.bigText(ctx, l2, 22, 84, 19, "#ffd35a");
      KT.warn(ctx, W - 14, 30, "⚠ 분자는 약 0.3 nm — 확대한 그림, 실제 개수 아님", "right");
    }
    function box(x, y, w, h, label, big, col) {
      glass(ctx, x, y, w, h, 14, col, 0.1);
      KT.t(ctx, label, x + w / 2, y + 26, { s: 11, a: "center", c: KC.mute, w: "700" });
      glowText(ctx, big, x + w / 2, y + 56, { s: 18, w: "900", a: "center", c: col, blur: 10 });
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var mol = m / 18.0, cnt = mol * NA, i;
      drawModel(mol, cnt);
      /* 아래 칸: 계산 */
      var y0 = DH + 6;
      KT.stage(ctx, 0, y0, W, H - y0, "lab", { seed: 19 });
      box(30, y0 + 14, 170, 72, "질량", m + " g", KC.blue);
      box(250, y0 + 14, 170, 72, "물질량", mol.toFixed(2) + " mol", KC.violet);
      box(470, y0 + 14, 200, 72, "분자 수", sciStr(cnt, 1) + " 개", KC.orange);
      KT.arrow(ctx, { x: 206, y: y0 + 50 }, { x: 244, y: y0 + 50 }, KC.mute, 2, 9);
      KT.arrow(ctx, { x: 426, y: y0 + 50 }, { x: 464, y: y0 + 50 }, KC.mute, 2, 9);
      KT.t(ctx, "÷ 18.0 g/mol → 물질량", 696, y0 + 34, { s: 11.5, c: KC.violet, w: "800" });
      KT.t(ctx, "× 6.02×10²³ → 분자 수", 696, y0 + 58, { s: 11.5, c: KC.orange, w: "800" });
      KT.t(ctx, "물 1 mol = 18.0 g", 696, y0 + 82, { s: 11, c: KC.mute, w: "700" });
      var dots = clamp(Math.round(cnt / 1e23), 0, 60);
      for (i = 0; i < dots; i++) KT.glow(ctx, 40 + (i % 30) * 20, y0 + 112 + ((i / 30) | 0) * 22, 3.6, "rgba(63,211,163,.95)", 2.2);
      KT.t(ctx, "● 하나 = 10²³ 개", 696, y0 + 118, { s: 11, c: KC.green, w: "700" });
      KT.t(ctx, "(60개가 넘으면 더 그리지 않음)", 696, y0 + 140, { s: 10, c: KC.dim, w: "600" });
    }
    function draw() {
      render();
      var mol = m / 18.0, cnt = mol * NA;

      var note = "물 <b>" + m + " g</b> = <b>" + mol.toFixed(3) + " mol</b> = 분자 <b>" + sciStr(cnt, 2) + " 개</b>.";
      if (Math.abs(mol - 1) <= 0.02) note += " 딱 1 mol입니다. 이때 분자 수가 바로 <b>아보가드로수 6.02×10²³</b> 개입니다.";
      else if (Math.abs(m - 200) <= 2) note += " 물 한 컵이 이만큼입니다. 0을 스물넷이나 붙여야 하는 수라서, 과학적 표기법 없이는 적기도 어렵습니다.";
      else note += " 손잡이를 움직여 1 mol과 한 컵(약 200 g)을 만들어 보세요.";
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
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>물 <b>18 g이 1 mol</b>, 분자 <b>6.02×10²³ 개</b>. 한 컵(200 g)이면 <b>6.7×10²⁴ 개</b>입니다. 셀 수 없는 것을 세는 방법이 바로 기본량 <b>물질량</b>입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-m").addEventListener("input", function (e) {
      m = +e.target.value; $("c-m-val").textContent = m + " g"; draw();
    });
    pauser("c-water-play", st);
    KT.animate(canvas, function (dt) { if (st.on) { tm += dt; render(); } });
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m3-3", true);
  })();

  /* 장면 4 — 우리 반의 세포 수 (계산 모형) + 표기 분류 */
  (function () {
    var canvas = $("c-class"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var n = 1, got = window.sthState("cClass") || { a: false };
    var SHIRT = [["#7fd3ff", "#1f5fa8"], ["#7ff0c4", "#14785a"], ["#c9b4ff", "#5a3db0"], ["#ffc98a", "#a05a14"], ["#ff9aa8", "#a02a40"]];
    function person(x, y, i) {
      var c = SHIRT[i % SHIRT.length], g = ctx.createLinearGradient(x - 9, 0, x + 9, 0);
      g.addColorStop(0, c[1]); g.addColorStop(0.45, c[0]); g.addColorStop(1, c[1]);
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - 9, y - 16, 18, 20, [8, 8, 3, 3]); ctx.fill();
      KT.planet(ctx, x, y - 23, 6.5, "#f6cfae", "#a06a46");
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      KT.stage(ctx, 0, 0, W, H, "night", { seed: 27, title: "한 사람의 세포 3.7 × 10¹³ 개를 인원만큼 더하면" });
      var total = n * CELL, done15 = total >= 1e15;
      glass(ctx, 34, 52, 352, 186, 14, "rgba(200,210,255,.16)", 0.04);
      for (var i = 0; i < n; i++) person(60 + (i % 10) * 34, 88 + ((i / 10) | 0) * 44, i);
      text(ctx, "3.7 × 10¹³ 개", 470, 88, { s: 14, w: "800", c: KC.ink });
      text(ctx, "× " + n + " 명", 470, 120, { s: 14, w: "800", c: KC.mute });
      KT.line(ctx, { x: 470, y: 134 }, { x: 860, y: 134 }, KC.line, 2);
      glowText(ctx, "= " + sciStr(total, 2) + " 개", 470, 172, { s: 24, w: "900", c: KC.violet });
      ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(470, 196, 390, 18, 9); ctx.fill();
      ctx.save(); ctx.shadowColor = done15 ? KC.green : KC.yellow; ctx.shadowBlur = 12;
      var pg = ctx.createLinearGradient(470, 0, 860, 0); pg.addColorStop(0, done15 ? "#1fae84" : "#c98a00"); pg.addColorStop(1, done15 ? KC.green : KC.yellow);
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(470, 196, Math.max(6, 390 * clamp(total / 1e15, 0, 1)), 18, 9); ctx.fill(); ctx.restore();
      ctx.strokeStyle = "rgba(220,226,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(470, 196, 390, 18, 9); ctx.stroke();
      KT.t(ctx, "10¹⁵ 개", 860, 232, { s: 11, a: "right", c: KC.mute, w: "700" });
      KT.t(ctx, done15 ? "10¹⁵ 개를 넘었습니다" : "아직 10¹⁵ 개에 못 미칩니다", 470, 232, { s: 11, c: done15 ? KC.green : KC.yellow, w: "700" });
      KT.t(ctx, "계수만 더하면 됩니다. 3.7 × 10¹³이 " + n + "개 모이면 " + (3.7 * n).toFixed(1) + " × 10¹³이고, 이것을 다시 올바른 표기로 고칩니다.", 40, 264, { s: 11.5, c: KC.mute, w: "600" });

      $("c-class-info").innerHTML = "<b>" + n + "명</b> → " + (3.7 * n).toFixed(1) + " × 10¹³ 개 = <b>" + sciStr(total, 2) + " 개</b>. " +
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
        { id: "big", label: "계수가 너무 크다", sub: "A가 10 이상" },
        { id: "small", label: "계수가 너무 작다", sub: "A가 1보다 작다" }
      ],
      items: [
        { t: "3.7 × 10¹³", a: "ok", why: "계수 3.7은 1 이상 10 미만입니다." },
        { t: "6.02 × 10²³", a: "ok", why: "아보가드로수의 표준 표기입니다." },
        { t: "1.0 × 10⁻¹⁰", a: "ok", why: "지수가 음수여도 규칙은 같습니다." },
        { t: "9.46 × 10¹⁵", a: "ok", why: "1 광년을 나타낸 올바른 표기입니다." },
        { t: "37 × 10¹²", a: "big", why: "3.7 × 10¹³으로 고쳐야 합니다.", hint: "계수가 10을 넘으면 지수를 1 올립니다." },
        { t: "12 × 10⁻³", a: "big", why: "1.2 × 10⁻²로 고칩니다." },
        { t: "299.8 × 10⁶", a: "big", why: "2.998 × 10⁸로 고칩니다.", hint: "소수점을 두 칸 더 왼쪽으로." },
        { t: "0.37 × 10¹⁴", a: "small", why: "3.7 × 10¹³으로 고칩니다.", hint: "계수가 1보다 작으면 지수를 1 내립니다." },
        { t: "0.5 × 10⁶", a: "small", why: "5 × 10⁵로 고칩니다." }
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
      (p.indexOf("㉡") === 0 ? " — 정확했습니다. 25 × 3.7×10¹³ = 9.3×10¹⁴ 개, 곧 10¹⁵ 개에 가깝습니다." : " — 25 × 3.7×10¹³ = 9.3×10¹⁴ 개였습니다. 자릿수만 보면 10¹⁵ 개에 가깝습니다.") +
      "<br><b>내가 확인한 물 한 컵</b> 분자 6.7×10²⁴ 개";
  }
  ep.onShow(function (i) { if (i === 4) paintVs(); });
  paintVs();
  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅰ-1] 이야기 ③ 0을 세다가 밤을 새운 보고서",
    items: [
      { id: "e3a", label: "세민이에게 보내는 답장", hint: "아주 큰 수와 아주 작은 수를 과학적 표기법으로 쓰는 방법을 ‘계수’와 ‘지수’라는 말을 넣어 세 문장으로 설명하세요." },
      { id: "e3b", label: "3.7×10¹³과 37,000,000,000,000의 차이", hint: "두 표기가 나타내는 값은 같습니다. 그런데도 과학자들이 앞의 것을 쓰는 까닭을 ‘유효숫자’라는 말을 넣어 쓰세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅰ-1] 과학의 기본량 — 정리",
  recap: [
    { key: "r1", label: "① 단위를 잃어버린 우주선" },
    { key: "r2", label: "② 10의 거듭제곱으로 걷기" },
    { key: "r3", label: "③ 0을 세다가 밤을 새운 보고서" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
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
    { key: "r3", label: "③ 0을 세다가 밤을 새운 보고서" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
