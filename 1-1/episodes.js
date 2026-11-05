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
/* ---- 밝은 스튜디오 말투 (블록 모형 장면과 같은 도구: K.studio · K.card · K.bigText · K.iso) ---- */
var LT = KT.LT;
function lt(ctx, s, x, y, o) { o = o || {}; KT.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function floorShadow(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || 0.28) + ")"); g.addColorStop(0.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function metal(ctx, x0, y0, x1, y1, a, b, c) {
  var g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a || "#f6f8fb"); g.addColorStop(0.5, b || "#aab3c3"); g.addColorStop(1, c || "#5b6476"); return g;
}
/* 앞에서 비스듬히 내려다본 판(윗면이 조금 보이는 미니어처): 앞면 + 윗면 + 오른쪽 옆면 */
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w + d, y + h - d * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
/* 오른쪽 흰 판정 카드 한 벌 */
function sideCard(ctx, x, W, H, title) { KT.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }

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

        /* 밝은 스튜디오 위 미니어처: 벽 고리 → 뉴턴 저울 → 파운드힘 저울 → 손잡이. 두 저울이 한 줄로 이어져 있으니 같은 힘을 받는다 */
    var LW = 622, CY = 184, RD = 64;
    function dial(cx, cy, r, frac, title, big, col, max, nd) {
      var a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, f = clamp(frac, 0, 1), i, an;
      floorShadow(ctx, cx + 8, cy + r + 66, r * 1.1, 10, 0.22);
      /* 크롬 테두리 + 걸쇠 고리 */
      ctx.strokeStyle = metal(ctx, 0, cy - r, 0, cy + r); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx - r - 14, cy, 7, 0, 6.2832); ctx.moveTo(cx + r + 21, cy); ctx.arc(cx + r + 14, cy, 7, 0, 6.2832); ctx.stroke();
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.35)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
      ctx.fillStyle = metal(ctx, cx - r, cy - r, cx + r, cy + r, "#ffffff", "#b5bdcb", "#4e5768");
      ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, 6.2832); ctx.fill(); ctx.restore();
      ctx.fillStyle = metal(ctx, cx + r, cy + r, cx - r, cy - r, "#ffffff", "#c4cbd6", "#7d8698");
      ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, 6.2832); ctx.fill();
      /* 흰 눈금판 */
      var fc = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
      fc.addColorStop(0, "#ffffff"); fc.addColorStop(1, "#e2e8f0");
      ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill();
      for (i = 0; i <= 50; i++) {
        an = a0 + (a1 - a0) * i / 50; var b5 = i % 5 === 0, rr = b5 ? 14 : 9;
        ctx.strokeStyle = b5 ? LT.ink : "rgba(18,32,58,.45)"; ctx.lineWidth = b5 ? 1.8 : 0.9;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * (r - 5), cy + Math.sin(an) * (r - 5));
        ctx.lineTo(cx + Math.cos(an) * (r - rr), cy + Math.sin(an) * (r - rr)); ctx.stroke();
      }
      for (i = 0; i <= 10; i += 2) {
        an = a0 + (a1 - a0) * i / 10;
        lt(ctx, (max * i / 10).toFixed(nd), cx + Math.cos(an) * (r - 25), cy + Math.sin(an) * (r - 25) + 4, { s: 9.5, a: "center", c: LT.mute, w: "800" });
      }
      /* 색 띠(지금까지 돈 만큼) */
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(cx, cy, r - 40, a0, a0 + (a1 - a0) * Math.max(f, 0.003)); ctx.stroke(); ctx.lineCap = "butt";
      lt(ctx, title, cx, cy + r * 0.52, { s: 10.5, a: "center", c: LT.mute, w: "900" });
      /* 바늘 */
      var na = a0 + (a1 - a0) * f, ca = Math.cos(na), sa = Math.sin(na);
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "#d9302c"; ctx.beginPath();
      ctx.moveTo(cx + ca * (r - 10), cy + sa * (r - 10));
      ctx.lineTo(cx - sa * 3.2 - ca * 12, cy + ca * 3.2 - sa * 12);
      ctx.lineTo(cx + sa * 3.2 - ca * 12, cy - ca * 3.2 - sa * 12); ctx.closePath(); ctx.fill(); ctx.restore();
      var hub = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 7); hub.addColorStop(0, "#ffffff"); hub.addColorStop(1, "#4a5266");
      ctx.fillStyle = hub; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 6.2832); ctx.fill();
      /* 유리 반사 */
      ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.ellipse(cx - r * 0.25, cy - r * 0.52, r * 0.5, r * 0.18, -0.3, 0, 6.2832); ctx.fill();
      KT.bigText(ctx, big, cx, cy + r + 40, 22, col, "center");
    }
    function rope(x0, x1, y) {
      ctx.strokeStyle = "#8a6a3c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.strokeStyle = "rgba(255,240,210,.6)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0, y - 1); ctx.lineTo(x1, y - 1); ctx.stroke(); ctx.setLineDash([]);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var lbf = F / LBF, i;
      KT.studio(ctx, 0, 0, LW, H, { x: 320, y: 336, rx: 330, ry: 30 });
      /* 실험대(나무판) */
      slab(ctx, 26, 318, 560, 18, 16, "#d8b98d", "#a87d4f", "#8a6540");
      /* 왼쪽 벽 기둥과 고리 */
      ctx.fillStyle = metal(ctx, 36, 0, 62, 0); ctx.fillRect(38, 112, 22, 208);
      ctx.fillStyle = "#6b7384"; ctx.fillRect(34, 104, 30, 10);
      ctx.strokeStyle = "#5b6476"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(66, CY, 6, -1.4, 1.4); ctx.stroke();
      /* 손잡이는 당긴 힘만큼 오른쪽으로 끌려간다(용수철이 늘어난 모습) */
      var c1 = 168, c2 = 398, hx = 520 + F * 0.55;
      rope(70, c1 - RD - 21, CY); rope(c1 + RD + 21, c2 - RD - 21, CY); rope(c2 + RD + 21, hx - 12, CY);
      dial(c1, CY, RD, F / 50, "N", F.toFixed(1) + " N", LT.blue, 50, 0);
      dial(c2, CY, RD, lbf / (50 / LBF), "lbf", lbf.toFixed(2) + " lbf", LT.orange, 50 / LBF, 1);
      KT.pill(ctx, "뉴턴 저울 · SI 단위", c1, CY - RD - 22, { a: "center", s: 12, c: "#a5d8ff", box: [0, LW] });
      KT.pill(ctx, "파운드힘 저울 · 미국 관습 단위", c2, CY - RD - 22, { a: "center", s: 12, c: "#ffd8a8", box: [0, LW] });
      /* 손잡이(T자 금속) */
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
      ctx.fillStyle = metal(ctx, hx - 12, 0, hx + 12, 0, "#ffffff", "#9aa3b3", "#4a5266"); ctx.beginPath(); ctx.roundRect(hx - 12, CY - 34, 22, 68, 9); ctx.fill(); ctx.restore();
      ctx.fillStyle = "#3d4454"; ctx.fillRect(hx - 18, CY - 3, 8, 6);
      if (F > 0.05) KT.arrow(ctx, { x: hx + 16, y: CY }, { x: Math.min(LW - 10, hx + 30 + F * 0.8), y: CY }, LT.red, 4, 13);
      KT.pill(ctx, "당기는 힘 F", hx - 2, CY + 58, { a: "center", s: 11.5, c: "#ffc9c9", box: [0, LW] });
      KT.bigText(ctx, "힘은 하나, 숫자는 둘", 18, 42, 24, "#ffffff");
      KT.bigText(ctx, "N ÷ 4.448 = lbf", 18, 70, 17, "#ffd35a");
      KT.warn(ctx, LW - 12, 30, "⚠ 두 저울을 한 줄로 이어 같은 힘을 받게 함", "right");

      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 632, W, H, "두 저울이 가리키는 값"), px = cd.px, R = cd.R;
      lt(ctx, lbf.toFixed(2) + " lbf", px, 66, { s: 26, w: "900", c: LT.orange });
      lt(ctx, "= " + F.toFixed(1) + " N", R, 66, { s: 15, w: "900", a: "right", c: LT.blue });
      KT.row(ctx, "뉴턴 저울", F.toFixed(1) + " N", px, R, 102, LT.blue);
      KT.row(ctx, "파운드힘 저울", lbf.toFixed(3) + " lbf", px, R, 128, LT.orange);
      KT.row(ctx, "두 값의 비 (N ÷ lbf)", F > 0 ? (F / lbf).toFixed(3) : "—", px, R, 154, LT.violet);
      var g1 = Math.abs(lbf - 1) <= 0.02 || got.a, g2 = Math.abs(lbf - 10) <= 0.2 || got.b;
      lt(ctx, "목표 ① 파운드힘 1.0", px, 190, { s: 11.5, c: LT.mute });
      lt(ctx, g1 ? "✓" : "", R, 190, { s: 14, w: "900", a: "right", c: LT.green });
      KT.bar(ctx, px, 198, cd.w, clamp(lbf / 1, 0, 1), g1 ? LT.green : LT.yellow);
      lt(ctx, "목표 ② 파운드힘 10.0", px, 232, { s: 11.5, c: LT.mute });
      lt(ctx, g2 ? "✓" : "", R, 232, { s: 14, w: "900", a: "right", c: LT.green });
      KT.bar(ctx, px, 240, cd.w, clamp(lbf / 10, 0, 1), g2 ? LT.green : LT.yellow);
      var near1 = Math.abs(lbf - 1) <= 0.02, near10 = Math.abs(lbf - 10) <= 0.2;
      KT.tip(ctx, near1 ? "1 lbf = 4.45 N 입니다" : near10 ? "10 lbf = 44.5 N 입니다" : "손잡이로 1.0 · 10.0 lbf 에 맞춰요", px - 4, 268, cd.w + 8, near1 || near10 ? true : null);
      lt(ctx, "1 lbf = 4.448222 N", px, 330, { s: 12.5, w: "900", c: LT.violet });
      lt(ctx, "비는 힘이 커져도 늘 같습니다", px, 350, { s: 11, c: LT.mute });

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
      if (h < 80) return ["🔥 대기에서 부서짐", LT.red, "예정보다 훨씬 낮습니다. <b>1999년의 실제 결과(약 57 km)</b>가 바로 이 자리입니다."];
      if (h < 218) return ["⚠️ 너무 낮음", LT.orange, "대기권 위쪽을 스치며 저항을 받아 예정 궤도를 유지하지 못합니다. 계수를 더 키워 보세요."];
      if (h <= 234) return ["✅ 진입 성공", LT.green, "예정 고도에 들어갔습니다. 이때의 계수는 <b>4.448222</b>, 곧 1 lbf를 N으로 바꾸는 값입니다."];
      if (h <= 280) return ["⚠️ 너무 높음", LT.yellow, "궤도에는 들어가지만 예정보다 높아 관측 임무를 할 수 없습니다. 계수를 조금 줄여 보세요."];
      return ["🚀 화성을 지나침", LT.blue, "속도를 충분히 줄이지 못해 화성 중력에 붙잡히지 못합니다. 너무 커도 실패입니다."];
    }
    /* 화성 미니어처: 큰 공의 윗부분이 스튜디오 바닥에 놓인 모습. 고도는 보기 쉽게 크게 과장(1 km = 0.5 px) */
    var LW = 622, MX = 300, MY = 650, MR = 380, AK = 0.5, TH = 0.95;
    var off = null;                                   /* 화성·대기·고도 껍질은 한 번 그려 두고 다시 쓴다 */
    function rOf(th, h) { return MR + h * AK + 560 * th * th; }
    function pOf(th, h) { var r = rOf(th, h); return { x: MX + r * Math.sin(th), y: MY - r * Math.cos(th) }; }
    function shell(c, h, col, dash, w) {
      c.save(); c.strokeStyle = col; c.lineWidth = w || 1.6; if (dash) c.setLineDash(dash);
      c.beginPath(); c.arc(MX, MY, MR + h * AK, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); c.restore();
    }
    function base() {
      if (off) return off;
      off = document.createElement("canvas"); off.width = W * 2; off.height = H * 2;
      var c = off.getContext("2d"); c.scale(2, 2);
      KT.studio(c, 0, 0, LW, H, { x: MX + 20, y: H - 4, rx: 340, ry: 26 });
      c.save(); c.beginPath(); c.roundRect(0, 0, LW, H, 14); c.clip();
      /* 대기(옅은 주황 껍질, 80 km 위까지) */
      var ag = c.createRadialGradient(MX, MY, MR, MX, MY, MR + 80 * AK + 14);
      ag.addColorStop(0, "rgba(240,150,90,.55)"); ag.addColorStop(0.75, "rgba(250,190,140,.22)"); ag.addColorStop(1, "rgba(250,200,160,0)");
      c.fillStyle = ag; c.beginPath(); c.arc(MX, MY, MR + 80 * AK + 14, 0, 6.2832); c.fill();
      /* 화성 공 */
      var mg = c.createRadialGradient(MX - 90, MY - MR + 50, 20, MX - 40, MY - MR + 120, 420);
      mg.addColorStop(0, "#f4b48a"); mg.addColorStop(0.35, "#d7713f"); mg.addColorStop(0.75, "#9a3d1b"); mg.addColorStop(1, "#5e200e");
      c.fillStyle = mg; c.beginPath(); c.arc(MX, MY, MR, 0, 6.2832); c.fill();
      c.save(); c.beginPath(); c.arc(MX, MY, MR, 0, 6.2832); c.clip();
      var R = KT.rng(4), i;
      for (i = 0; i < 46; i++) {
        var a = -Math.PI / 2 + (R() - 0.5) * 1.7, d = MR * (0.35 + R() * 0.62), x = MX + Math.cos(a) * d, y = MY + Math.sin(a) * d, rr = 3 + R() * 11;
        c.fillStyle = "rgba(90,30,12,.30)"; c.beginPath(); c.ellipse(x, y, rr, rr * 0.55, 0, 0, 6.2832); c.fill();
        c.strokeStyle = "rgba(255,200,170,.35)"; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y - 1, rr, rr * 0.55, 0, Math.PI, 6.2832); c.stroke();
      }
      c.fillStyle = "rgba(80,25,10,.25)"; c.beginPath(); c.ellipse(MX + 60, MY - 300, 120, 22, -0.1, 0, 6.2832); c.fill();
      c.restore();
      c.strokeStyle = "rgba(255,220,190,.8)"; c.lineWidth = 1.5; c.beginPath(); c.arc(MX, MY, MR, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      /* 기준 껍질: 생존 한계 80 km, 예정 226 km */
      shell(c, 80, "rgba(224,49,49,.85)", [7, 5], 1.8);
      shell(c, 226, "rgba(15,159,118,.9)", [7, 5], 1.8);
      c.restore();
      return off;
    }
    function probe(x, y, ang) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      var pg = ctx.createLinearGradient(0, -5, 0, 5); pg.addColorStop(0, "#5d8fe0"); pg.addColorStop(1, "#173a86");
      ctx.fillStyle = pg; ctx.fillRect(-36, -3.5, 26, 7);
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 0.8;
      for (var k = -32; k < -10; k += 5) { ctx.beginPath(); ctx.moveTo(k, -3.5); ctx.lineTo(k, 3.5); ctx.stroke(); }
      var bg = ctx.createLinearGradient(-8, -8, 8, 8); bg.addColorStop(0, "#fff3b8"); bg.addColorStop(0.5, "#e2a52a"); bg.addColorStop(1, "#8a5a10");
      ctx.fillStyle = bg; ctx.fillRect(-10, -8, 18, 16);
      ctx.fillStyle = "#eef1f6"; ctx.beginPath(); ctx.arc(10, -2, 6, -1.6, 1.6); ctx.fill();
      ctx.strokeStyle = "#6b7384"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(10, -2, 6, -1.6, 1.6); ctx.stroke();
      ctx.restore();
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var h = alt(k), vd = verdict(h), i, burnt = h < 80;
      ctx.drawImage(base(), 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 접근 궤적 — 부서진 뒤의 길은 흐리게 */
      var N = 90;
      ctx.lineCap = "round";
      for (var pass = 0; pass < 2; pass++) {
        ctx.save();
        if (pass === 1 && burnt) { ctx.globalAlpha = 0.3; ctx.setLineDash([5, 6]); }
        ctx.strokeStyle = "#7048e8"; ctx.lineWidth = 3; ctx.beginPath();
        for (i = 0; i <= N; i++) {
          var th = pass === 0 ? -TH + TH * i / N : TH * i / N, p = pOf(th, h);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke(); ctx.restore();
      }
      var pe = pOf(0, h);
      if (burnt) {
        KT.glow(ctx, pe.x, pe.y, 10, "rgba(255,140,40,.95)", 4.2); KT.glow(ctx, pe.x, pe.y, 4, "rgba(255,240,200,1)", 3);
        var RF = KT.rng(9);
        for (i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? "#e2a52a" : "#5d6b86"; ctx.fillRect(pe.x + 8 + RF() * 40, pe.y + 2 + RF() * 18, 3, 2); }
      } else { ctx.strokeStyle = "#7048e8"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(pe.x, pe.y, 7, 0, 6.2832); ctx.stroke(); }
      /* 근화점 고도 자 */
      var sf = { x: MX, y: MY - MR };
      ctx.strokeStyle = "#12203a"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sf.x, sf.y); ctx.lineTo(pe.x, pe.y + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sf.x - 6, sf.y); ctx.lineTo(sf.x + 6, sf.y); ctx.stroke();
      /* 움직이는 궤도선 */
      var thp = -TH + 2 * TH * ph;
      if (!(burnt && thp > 0.03)) {
        for (i = 1; i <= 7; i++) { var q = pOf(thp - i * 0.018, h); ctx.fillStyle = "rgba(112,72,232," + (0.45 - i * 0.05) + ")"; ctx.beginPath(); ctx.arc(q.x, q.y, 2, 0, 6.2832); ctx.fill(); }
        var p0 = pOf(thp, h), p1 = pOf(thp + 0.01, h);
        probe(p0.x, p0.y, Math.atan2(p1.y - p0.y, p1.x - p0.x));
      }
      ctx.restore();
      /* 이름표 */
      var lb = [0, LW];
      KT.pill(ctx, "예정 226 km", 20, MY - Math.sqrt(Math.pow(MR + 226 * AK, 2) - Math.pow(MX - 60, 2)) + 4, { s: 11.5, c: "#8ce99a", box: lb });
      KT.pill(ctx, "생존 한계 80 km", 20, MY - Math.sqrt(Math.pow(MR + 80 * AK, 2) - Math.pow(MX - 40, 2)) + 22, { s: 11.5, c: "#ffa8a8", box: lb });
      KT.pill(ctx, "화성 대기", 520, MY - Math.sqrt(Math.pow(MR + 30, 2) - Math.pow(520 - MX, 2)) + 30, { s: 11.5, c: "#ffd8a8", box: lb });
      KT.pill(ctx, "근화점 " + Math.round(h) + " km", pe.x + 14, pe.y - 12, { s: 12.5, c: "#d0bfff", box: lb });
      KT.bigText(ctx, "근화점 " + Math.round(h) + " km", 18, 44, 26, "#ffffff");
      KT.bigText(ctx, vd[0].replace(/^\S+\s/, ""), 18, 74, 18, burnt ? "#ff8787" : (h >= 218 && h <= 234 ? "#8ce99a" : "#ffd35a"));
      KT.warn(ctx, LW - 12, 30, "⚠ 고도는 화성 크기에 비해 크게 과장", "right");

      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 632, W, H, "화성 진입 판정"), px = cd.px, R = cd.R;
      lt(ctx, vd[0], px, 64, { s: 19, w: "900", c: vd[1] });
      KT.row(ctx, "환산 계수", "× " + k.toFixed(1), px, R, 100, LT.blue);
      KT.row(ctx, "근화점 고도", Math.round(h) + " km", px, R, 126, LT.violet);
      KT.row(ctx, "예정 고도", "226 km", px, R, 152, LT.green);
      KT.row(ctx, "살아남는 최저 고도", "80 km", px, R, 178, LT.red);
      /* 고도 막대: 0~300 km */
      var bx = px, bw = cd.w, by = 204;
      ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(bx, by, bw, 12, 6); ctx.fill();
      ctx.fillStyle = "rgba(224,49,49,.25)"; ctx.fillRect(bx, by, bw * 80 / 300, 12);
      ctx.fillStyle = "rgba(15,159,118,.35)"; ctx.fillRect(bx + bw * 218 / 300, by, bw * 16 / 300, 12);
      var hx = bx + bw * clamp(h / 300, 0, 1);
      ctx.fillStyle = vd[1]; ctx.beginPath(); ctx.moveTo(hx, by - 2); ctx.lineTo(hx - 6, by - 11); ctx.lineTo(hx + 6, by - 11); ctx.closePath(); ctx.fill();
      ctx.fillRect(hx - 1.5, by, 3, 12);
      lt(ctx, "0", bx, by + 28, { s: 10, c: LT.dim }); lt(ctx, "80", bx + bw * 80 / 300, by + 28, { s: 10, a: "center", c: LT.red });
      lt(ctx, "226", bx + bw * 226 / 300, by + 28, { s: 10, a: "center", c: LT.green }); lt(ctx, "300 km", bx + bw, by + 28, { s: 10, a: "right", c: LT.dim });
      var good = h >= 218 && h <= 234;
      KT.tip(ctx, good ? "예정 궤도에 들어갔습니다" : burnt ? "1999년에 일어난 그대로입니다" : h < 218 ? "아직 낮습니다 · 계수를 키워요" : "너무 높습니다 · 계수를 줄여요", px - 4, 256, cd.w + 8, good ? true : (burnt ? false : null));
      lt(ctx, "고도 = 8 + 49 × 계수 (km)", px, 318, { s: 11, c: LT.mute });
      lt(ctx, "계수 1 → 57 km (실제 사고)", px, 338, { s: 11, c: LT.mute });
      lt(ctx, "1 lbf = 4.448222 N", px, 370, { s: 12.5, w: "900", c: LT.violet });
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
    var ICOL = [LT.blue, LT.orange, LT.violet, LT.teal, LT.red, LT.green, LT.yellow];
    /* 카드 오른쪽 위 작은 입체 소품 */
    function icon(i, cx, cy, col) {
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.lineCap = "round";
      if (i === 0) { /* 나무 자 */
        ctx.fillStyle = metal(ctx, 0, cy - 7, 0, cy + 7, "#f6dfb4", "#d9b17a", "#a97f4c"); ctx.fillRect(cx - 18, cy - 6, 36, 12);
        ctx.strokeStyle = "#5b4022"; ctx.lineWidth = 1;
        for (var k = -14; k <= 14; k += 4) { ctx.beginPath(); ctx.moveTo(cx + k, cy - 6); ctx.lineTo(cx + k, cy - (k % 8 ? 2 : -1)); ctx.stroke(); }
      } else if (i === 1) { /* 금속 추 */
        ctx.fillStyle = metal(ctx, cx - 13, 0, cx + 13, 0, "#ffffff", "#aab3c3", "#4a5266");
        ctx.beginPath(); ctx.moveTo(cx - 8, cy - 6); ctx.lineTo(cx + 8, cy - 6); ctx.lineTo(cx + 13, cy + 11); ctx.lineTo(cx - 13, cy + 11); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#6b7384"; ctx.beginPath(); ctx.arc(cx, cy - 10, 4.5, 0, Math.PI * 2); ctx.stroke();
      } else if (i === 2) { /* 탁상시계 */
        KT.planet(ctx, cx, cy, 13, "#f3e9ff", "#7048e8");
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = LT.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 6); ctx.moveTo(cx, cy); ctx.lineTo(cx + 5, cy + 2); ctx.stroke();
      } else if (i === 3) { /* 전선과 전류 */
        ctx.strokeStyle = "#b08850"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx - 16, cy + 6); ctx.quadraticCurveTo(cx, cy - 14, cx + 16, cy + 6); ctx.stroke();
        ctx.fillStyle = col; [-10, 0, 10].forEach(function (d) { ctx.beginPath(); ctx.arc(cx + d, cy - 4 + Math.abs(d) * 0.6, 2.2, 0, 6.2832); ctx.fill(); });
      } else if (i === 4) { /* 유리 온도계 */
        ctx.fillStyle = "rgba(200,215,235,.6)"; ctx.strokeStyle = "#8a96a8"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(cx - 4, cy - 15, 8, 22, 4); ctx.fill(); ctx.stroke();
        KT.planet(ctx, cx, cy + 10, 6, "#ff8787", "#a51111"); ctx.fillStyle = "#e03131"; ctx.fillRect(cx - 1.5, cy - 8, 3, 16);
      } else if (i === 5) { /* 입자 묶음 */
        [[-8, 4], [0, -6], [8, 4], [0, 8], [-4, -1], [5, -1]].forEach(function (p) { KT.planet(ctx, cx + p[0], cy + p[1], 4.2, "#8ce99a", "#0b6b4f"); });
      } else { /* 촛불 */
        ctx.fillStyle = metal(ctx, cx - 4, 0, cx + 4, 0, "#fffaf0", "#efe2c4", "#c9b48a"); ctx.fillRect(cx - 4, cy - 2, 8, 16);
        KT.glow(ctx, cx, cy - 8, 3.4, "rgba(255,170,40,.95)", 3.4);
      }
      ctx.restore();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      KT.studio(ctx, 0, 0, W, H, null);
      units.forEach(function (u, i) {
        var col = i % 4, row = (i / 4) | 0, x = col * 225 + 12, y = row * 150 + 16, c = ICOL[i], on = i === sel, lift = on ? -4 : 0;
        /* 두께가 있는 흰 타일(눌러 고른 타일은 살짝 들린다) */
        floorShadow(ctx, x + 104, y + 124, 100, 9, on ? 0.3 : 0.2);
        ctx.fillStyle = "#c9d2de"; ctx.beginPath(); ctx.roundRect(x, y + 6 + lift, 201, 120, 16); ctx.fill();
        var tg = ctx.createLinearGradient(x, y, x, y + 120); tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#eef2f7");
        ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(x, y + lift, 201, 120, 16); ctx.fill();
        ctx.fillStyle = c; ctx.globalAlpha = on ? 0.95 : 0.75; ctx.beginPath(); ctx.roundRect(x, y + lift, 8, 120, [16, 0, 0, 16]); ctx.fill(); ctx.globalAlpha = 1;
        if (on) { ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x + 1.5, y + lift + 1.5, 198, 117, 15); ctx.stroke(); }
        icon(i, x + 174, y + 28 + lift, c);
        lt(ctx, u.sym, x + 100, y + 58 + lift, { s: 32, w: "900", a: "center", c: c });
        lt(ctx, u.q, x + 100, y + 84 + lift, { s: 14.5, w: "900", a: "center", c: LT.ink });
        lt(ctx, u.name, x + 100, y + 104 + lift, { s: 11, a: "center", c: LT.mute });
      });
      /* 빈 칸: 유도량 */
      var ex = 3 * 225 + 12, ey = 166;
      ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = "rgba(20,40,90,.35)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(ex, ey, 201, 120, 16); ctx.stroke(); ctx.restore();
      lt(ctx, "그 밖의 모든 양", ex + 100, ey + 36, { s: 12.5, w: "800", a: "center", c: LT.mute });
      lt(ctx, "m/s · N · J · kg/m³", ex + 100, ey + 66, { s: 14, w: "900", a: "center", c: LT.violet });
      lt(ctx, "= 기본량을 곱하고 나눈 유도량", ex + 100, ey + 94, { s: 11, a: "center", c: LT.mute });
      lt(ctx, "기본량은 이 7개가 전부입니다. 넓이·속력·힘·에너지는 모두 이 7개를 곱하고 나눠 만든 유도량입니다.", 16, 318, { s: 11.5, c: LT.mute });
      if (sel < 0) KT.pill(ctx, "👆 카드를 눌러 보세요", ex + 100, ey - 10, { a: "center", s: 11.5, c: "#ffd35a" });
    }    canvas._redraw = draw;
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
    function xOf(t) { return 70 + (t + 273) / 473 * 520; }
    var st = { on: !REDUCE }, tm = 0, RP = KT.rng(9), parts = [];
    for (var pi = 0; pi < 12; pi++) parts.push({ x: RP(), y: RP(), p: RP() * 6.28, q: RP() * 6.28, w: 0.7 + RP() * 0.9 });
    var LW = 640;
    function render() {
      ctx.clearRect(0, 0, W, H);
      var K = c + 273.15, x0 = xOf(c);
      KT.studio(ctx, 0, 0, LW, H, { x: 330, y: 136, rx: 320, ry: 9 });
      /* 유리관 온도계(누운 모습): 왼쪽 끝 알코올 통 + 유리관 + 붉은 액체 기둥 */
      var ty = 112;
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.25)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6;
      ctx.fillStyle = "rgba(235,242,250,.95)"; ctx.beginPath(); ctx.roundRect(36, ty - 15, 590, 30, 15); ctx.fill(); ctx.restore();
      KT.planet(ctx, 46, ty, 21, "#ff8787", "#9c1c1c");
      var lq = ctx.createLinearGradient(0, ty - 6, 0, ty + 6); lq.addColorStop(0, "#ff8787"); lq.addColorStop(0.5, "#e03131"); lq.addColorStop(1, "#9c1c1c");
      ctx.fillStyle = lq; ctx.beginPath(); ctx.roundRect(56, ty - 5, Math.max(8, x0 - 56), 10, 5); ctx.fill();
      ctx.strokeStyle = "rgba(120,140,170,.7)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.roundRect(36, ty - 15, 590, 30, 15); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.beginPath(); ctx.roundRect(60, ty - 12, 556, 4, 2); ctx.fill();
      [-273, -200, -100, 0, 100, 200].forEach(function (t) {
        var x = xOf(t);
        ctx.strokeStyle = LT.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, ty + 15); ctx.lineTo(x, ty + 25); ctx.stroke();
        lt(ctx, t + "", x, ty + 42, { s: 11, a: "center", c: LT.orange, w: "900" });
        lt(ctx, Math.round(t + 273.15) + "", x, ty + 62, { s: 11, a: "center", c: LT.blue, w: "900" });
      });
      lt(ctx, "℃", 26, ty + 42, { s: 12, w: "900", a: "center", c: LT.orange });
      lt(ctx, "K", 26, ty + 62, { s: 12, w: "900", a: "center", c: LT.blue });
      /* 지금 온도 표시 */
      ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.moveTo(x0, ty - 18); ctx.lineTo(x0 - 7, ty - 30); ctx.lineTo(x0 + 7, ty - 30); ctx.closePath(); ctx.fill();
      KT.bigText(ctx, c + " ℃ = " + K.toFixed(2) + " K", 18, 46, 25, "#ffffff");
      [[0, "물이 어는 온도"], [100, "물이 끓는 온도"]].forEach(function (q) { var x = xOf(q[0]); ctx.strokeStyle = "rgba(20,40,90,.3)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x, ty + 68); ctx.lineTo(x, ty + 82); ctx.stroke(); ctx.setLineDash([]); lt(ctx, q[1], x, ty + 96, { s: 10.5, a: "center", c: LT.mute }); });
      lt(ctx, "간격은 같고 출발점만 273.15 다릅니다", 20, 240, { s: 11.5, c: LT.mute });
      KT.pill(ctx, K <= 0.5 ? "절대 영도에 가장 가까운 칸" : "0 K보다 낮은 온도는 없다", LW - 16, 240, { a: "right", s: 11.5, c: K <= 0.5 ? "#a5d8ff" : "#ffd35a" });
      /* 오른쪽 카드: 유리 상자 속 입자의 열운동 */
      var cd = sideCard(ctx, 650, W, H, "입자의 열운동"), bx = cd.px, by = 44, bw = cd.w - 10, bh = 120, d = 10;
      var amp = 13 * Math.sqrt(Math.max(K, 0) / 373.15), hot = clamp(K / 473, 0, 1);
      ctx.fillStyle = "rgba(200,220,240,.55)"; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + d, by - d * 0.6); ctx.lineTo(bx + bw + d, by - d * 0.6); ctx.lineTo(bx + bw, by); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(170,190,215,.5)"; ctx.beginPath(); ctx.moveTo(bx + bw, by); ctx.lineTo(bx + bw + d, by - d * 0.6); ctx.lineTo(bx + bw + d, by + bh - d * 0.6); ctx.lineTo(bx + bw, by + bh); ctx.closePath(); ctx.fill();
      var gb = ctx.createLinearGradient(0, by, 0, by + bh); gb.addColorStop(0, "rgba(225,236,248,.9)"); gb.addColorStop(1, "rgba(200,214,232,.9)");
      ctx.fillStyle = gb; ctx.fillRect(bx, by, bw, bh);
      ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
      var pb = "rgb(" + Math.round(70 + 170 * hot) + "," + Math.round(140 - 60 * hot) + "," + Math.round(230 - 180 * hot) + ")";
      parts.forEach(function (p) {
        var px = bx + 14 + p.x * (bw - 28) + Math.sin(tm * p.w * 0.012 + p.p) * amp;
        var py = by + 14 + p.y * (bh - 28) + Math.cos(tm * p.w * 0.015 + p.q) * amp * 0.7;
        KT.planet(ctx, px, py, 6, pb, "#1b2a4a");
      });
      ctx.restore();
      ctx.strokeStyle = "rgba(120,140,170,.8)"; ctx.lineWidth = 1.2; ctx.strokeRect(bx, by, bw, bh);
      KT.row(ctx, "섭씨", c + " ℃", bx, cd.R, by + bh + 28, LT.orange);
      KT.row(ctx, "켈빈", K.toFixed(2) + " K", bx, cd.R, by + bh + 52, LT.blue);
      KT.tip(ctx, K <= 0.5 ? "움직임이 가장 약한 상태" : Math.abs(K - 273.15) <= 0.5 ? "물이 어는 온도 = 273.15 K" : "온도가 오르면 더 세게 흔들린다", bx - 4, by + bh + 64, cd.w + 8, K <= 0.5 || Math.abs(K - 273.15) <= 0.5 ? true : null);
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
      var here = place(n), low = place(n - 1), high = place(n + 1), LW = 612, i;
      KT.studio(ctx, 0, 0, LW, H, { x: 300, y: 372, rx: 300, ry: 22 });
      /* 두께 있는 흰 사진 액자(뷰파인더) — 가운데가 지금 보이는 것 */
      function tile(x, y, s, e, on) {
        var t = tint(e), col = "rgb(" + t.join(",") + ")";
        floorShadow(ctx, x + s / 2 + 6, y + s + 14, s * 0.55, 8, on ? 0.3 : 0.2);
        ctx.fillStyle = "#c3ccd9"; ctx.beginPath(); ctx.roundRect(x + 5, y + 7, s, s, 16); ctx.fill();
        var g = ctx.createLinearGradient(x, y, x + s, y + s); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#e9eef5");
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, s, s, 16); ctx.fill();
        var ig = ctx.createRadialGradient(x + s / 2, y + s * 0.42, 4, x + s / 2, y + s / 2, s * 0.7);
        ig.addColorStop(0, "rgba(" + t.join(",") + ",.40)"); ig.addColorStop(1, "rgba(" + t.join(",") + ",.08)");
        ctx.fillStyle = ig; ctx.beginPath(); ctx.roundRect(x + 10, y + 10, s - 20, s - 20, 10); ctx.fill();
        ctx.strokeStyle = on ? col : "rgba(20,40,90,.22)"; ctx.lineWidth = on ? 3 : 1.5; ctx.beginPath(); ctx.roundRect(x + 10, y + 10, s - 20, s - 20, 10); ctx.stroke();
        return col;
      }
      /* 한 걸음 작게 · 지금 · 한 걸음 크게 */
      tile(22, 150, 118, n - 1, false);
      lt(ctx, n > -15 ? low[0] : "—", 81, 212, { s: 30, a: "center" });
      lt(ctx, n > -15 ? low[1] : "끝", 81, 246, { s: 10.5, a: "center", c: LT.mute, w: "800" });
      lt(ctx, "한 걸음 작게 (÷10)", 81, 140, { s: 11, a: "center", c: LT.mute, w: "900" });
      var col = tile(172, 96, 262, n, true);
      lt(ctx, here[0], 303, 196, { s: 64, a: "center" });
      lt(ctx, here[1], 303, 246, { s: 19, w: "900", a: "center", c: LT.ink });
      lt(ctx, here[2], 303, 272, { s: 11.5, a: "center", c: LT.mute, w: "700" });
      /* 이 화면 안의 1/10 크기 칸 — 한 걸음 전의 화면 */
      ctx.strokeStyle = LT.ink; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); ctx.strokeRect(390, 310, 24.2, 24.2); ctx.setLineDash([]);
      lt(ctx, "↙ 한 걸음 전 화면은 이 칸", 384, 324, { s: 9.5, a: "right", c: LT.mute, w: "800" });
      tile(466, 150, 118, n + 1, false);
      lt(ctx, n < 26 ? high[0] : "—", 525, 212, { s: 30, a: "center" });
      lt(ctx, n < 26 ? high[1] : "끝", 525, 246, { s: 10.5, a: "center", c: LT.mute, w: "800" });
      lt(ctx, "한 걸음 크게 (×10)", 525, 140, { s: 11, a: "center", c: LT.mute, w: "900" });
      KT.arrow(ctx, { x: 166, y: 209 }, { x: 146, y: 209 }, LT.mute, 2.5, 9);
      KT.arrow(ctx, { x: 442, y: 209 }, { x: 462, y: 209 }, LT.mute, 2.5, 9);
      KT.bigText(ctx, "10" + sup(n) + " m", 18, 50, 30, "#ffffff");
      KT.bigText(ctx, "손톱에서 " + Math.abs(n + 2) + "걸음", 18, 82, 18, "#ffd35a");
      KT.pill(ctx, "화면 한 변 = " + lenStr(n), 303, 390, { a: "center", s: 12.5, c: "#d0bfff", box: [0, LW] });
      /* 오른쪽 사다리 카드 */
      var cd = sideCard(ctx, 622, W, H, "크기의 사다리 (10배씩)");
      function yOfN(e) { return 366 - (e + 15) * (306 / 41); }
      var LX = 680;
      var lg = ctx.createLinearGradient(0, 366, 0, 60); lg.addColorStop(0, LT.violet); lg.addColorStop(0.45, LT.yellow); lg.addColorStop(1, LT.blue);
      ctx.strokeStyle = lg; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(LX, 60); ctx.lineTo(LX, 366); ctx.stroke(); ctx.lineCap = "butt";
      for (var e = -15; e <= 26; e++) { ctx.strokeStyle = "rgba(20,40,90,.3)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(LX - 7, yOfN(e)); ctx.lineTo(LX + 7, yOfN(e)); ctx.stroke(); }
      LADDER.forEach(function (e) {
        lt(ctx, "10" + sup(e), LX - 12, yOfN(e) + 4, { s: 10.5, a: "right", c: LT.mute, w: "800" });
        lt(ctx, PLACES[String(e)][1], LX + 14, yOfN(e) + 4, { s: 11, c: e === n ? LT.orange : LT.ink, w: e === n ? "900" : "700" });
      });
      KT.planet(ctx, LX, yOfN(n), 8, "#ffe8a3", "#c77700");
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(LX, yOfN(n), 12, 0, 6.2832); ctx.stroke();
      lt(ctx, "큰 쪽 ▲", W - 18, 52, { s: 10.5, a: "right", c: LT.dim });
      lt(ctx, "작은 쪽 ▼", W - 18, 384, { s: 10.5, a: "right", c: LT.dim });
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
      var d = Math.abs(eB - eA), LW = 640;
      function X(e) { return 44 + (e + 15) / 41 * 566; }
      KT.studio(ctx, 0, 0, LW, H, { x: 330, y: 268, rx: 330, ry: 16 });
      KT.bigText(ctx, d === 0 ? "같은 크기" : "10" + sup(d) + " 배 차이", 18, 48, 30, "#ffffff");
      KT.bigText(ctx, "지수 " + Math.max(eA, eB) + " − (" + Math.min(eA, eB) + ") = " + d, 18, 80, 18, "#ffd35a");
      /* 나무 자(로그 눈금) — 한 칸이 10배 */
      slab(ctx, 30, 236, 594, 20, 14, "#ead2a6", "#b98d58", "#93693c");
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(30, 236, 594, 3);
      for (var e = -15; e <= 26; e++) {
        var gx = X(e), big = (e + 15) % 5 === 0;
        ctx.strokeStyle = "#4a3418"; ctx.lineWidth = big ? 1.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(gx + 6, 227); ctx.lineTo(gx + 6 + (big ? -4 : -2), 227 + (big ? 7 : 4)); ctx.stroke();
        if (big) lt(ctx, "10" + sup(e), gx, 251, { s: 10, a: "center", c: "#3b2a12", w: "900" });
      }
      refs.forEach(function (r, i) {
        lt(ctx, r.i, X(r.e), 286, { s: 16, a: "center" });
        lt(ctx, r.t, X(r.e), i % 2 ? 324 : 306, { s: 10.5, a: "center", c: LT.mute, w: "800" });
      });
      /* 두 깃발 핀과 배율 괄호 */
      var xa = X(eA), xb = X(eB), lo = Math.min(xa, xb), hi = Math.max(xa, xb);
      if (hi - lo > 1) {
        ctx.fillStyle = "rgba(112,72,232,.12)"; ctx.fillRect(lo, 150, hi - lo, 78);
        ctx.strokeStyle = LT.violet; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(lo, 150); ctx.lineTo(hi, 150); ctx.moveTo(lo, 142); ctx.lineTo(lo, 158); ctx.moveTo(hi, 142); ctx.lineTo(hi, 158); ctx.stroke();
        KT.pill(ctx, "× 10" + sup(d), (lo + hi) / 2, 136, { a: "center", s: 13, c: "#d0bfff", box: [0, LW] });
      }
      function flag(x, name, colr, up) {
        var top = 168 - (up ? 0 : 0);
        ctx.fillStyle = metal(ctx, x - 2, 0, x + 2, 0); ctx.fillRect(x - 1.5, top, 3, 62);
        ctx.fillStyle = colr; ctx.beginPath(); ctx.moveTo(x + 1.5, top); ctx.lineTo(x + 30, top + 9); ctx.lineTo(x + 1.5, top + 18); ctx.closePath(); ctx.fill();
        lt(ctx, name, x + 11, top + 13, { s: 11, w: "900", c: "#ffffff" });
        KT.planet(ctx, x, top, 4.5, "#ffffff", colr);
      }
      var sep = Math.abs(xa - xb) < 30 ? 8 : 0;
      flag(xa - sep, "A", LT.orange); flag(xb + sep, "B", LT.blue);
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 650, W, H, "두 표지 비교"), px = cd.px, R = cd.R;
      lt(ctx, d === 0 ? "1 배" : "10" + sup(d) + " 배", px, 66, { s: 26, w: "900", c: LT.violet });
      KT.row(ctx, "표지 A", "10" + sup(eA) + " m", px, R, 104, LT.orange);
      lt(ctx, "가까운 기준 " + near(eA), R, 124, { s: 10.5, a: "right", c: LT.mute });
      KT.row(ctx, "표지 B", "10" + sup(eB) + " m", px, R, 152, LT.blue);
      lt(ctx, "가까운 기준 " + near(eB), R, 172, { s: 10.5, a: "right", c: LT.mute });
      KT.row(ctx, "자릿수 차이", d + " 자리", px, R, 204, LT.violet);
      KT.bar(ctx, px, 214, cd.w, d / 41, LT.violet);
      KT.tip(ctx, d === 20 ? "10²⁰ 배를 맞췄습니다" : "목표: 10²⁰ 배 차이 만들기", px - 4, 240, cd.w + 8, d === 20 ? true : null);
      lt(ctx, "배율 = 10^(큰 지수 − 작은 지수)", px, 304, { s: 11, c: LT.mute });
      lt(ctx, "곱셈이 지수의 뺄셈이 됩니다", px, 324, { s: 11, c: LT.mute });
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
      var LW = 652;
      function X(nn) { return 50 + (clamp(nn, 5, 26) - 5) / 21 * 580; }
      KT.studio(ctx, 0, 0, LW, H, { x: 330, y: 214, rx: 330, ry: 12 });
      KT.bigText(ctx, "빛으로 " + timeStr(t), 18, 48, 29, "#ffd35a");
      KT.bigText(ctx, "거리 " + sciStr(d, 1) + " m", 18, 78, 17, "#ffffff");
      /* 손전등 미니어처와 빛줄기 */
      var by = 124, cx = X(n);
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
      ctx.fillStyle = metal(ctx, 0, by - 11, 0, by + 11, "#ffffff", "#8a94a8", "#3a4152"); ctx.beginPath(); ctx.roundRect(14, by - 9, 30, 18, 4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(44, by - 9); ctx.lineTo(52, by - 13); ctx.lineTo(52, by + 13); ctx.lineTo(44, by + 9); ctx.closePath(); ctx.fill(); ctx.restore();
      var bm = ctx.createLinearGradient(52, 0, Math.max(60, cx), 0); bm.addColorStop(0, "rgba(255,212,59,.85)"); bm.addColorStop(1, "rgba(255,169,77,.35)");
      ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(52, by - 6); ctx.lineTo(Math.max(56, cx), by - 2); ctx.lineTo(Math.max(56, cx), by + 2); ctx.lineTo(52, by + 6); ctx.closePath(); ctx.fill();
      for (var k = 0; k < 6; k++) { var px = 52 + ((ph + k / 6) % 1) * (cx - 52); if (cx - 52 > 12) KT.glow(ctx, px, by, 2.4, "rgba(255,190,60,.95)", 2.6); }
      KT.planet(ctx, cx, by, 9, "#a5d8ff", "#1c4f8a");
      KT.pill(ctx, "여기까지", cx, by - 18, { a: "center", s: 11, c: "#ffffff", box: [0, LW] });
      /* 시간 단위 띠(입체 막대) */
      var x0 = 50, BCL = { "초": "#20c997", "분": "#4dabf7", "시간": "#9775fa", "일": "#fcc419", "년": "#ff6b6b" };
      bands.forEach(function (b) {
        var x1 = X(b.to), c0 = BCL[b.t];
        slab(ctx, x0, 172, Math.max(0, x1 - x0), 24, 10, KT.tint(c0, 1.15), c0, null);
        if (x1 - x0 > 26) lt(ctx, b.t, (x0 + x1) / 2, 190, { s: 12, w: "900", a: "center", c: "#ffffff" });
        x0 = x1;
      });
      ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.beginPath(); ctx.moveTo(630, 172); ctx.lineTo(640, 166); ctx.lineTo(640, 190); ctx.lineTo(630, 196); ctx.closePath(); ctx.fill();
      ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.moveTo(cx, 168); ctx.lineTo(cx - 7, 156); ctx.lineTo(cx + 7, 156); ctx.closePath(); ctx.fill();
      marks.forEach(function (m, i) {
        var x = X(m.n);
        ctx.strokeStyle = LT.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 196); ctx.lineTo(x, i % 2 ? 222 : 206); ctx.stroke();
        lt(ctx, m.t, clamp(x, 60, 600), i % 2 ? 236 : 220, { s: 10.5, a: "center", c: LT.ink, w: "800" });
      });
      lt(ctx, "빛의 속력 299,792,458 m/s — 1초에 지구를 일곱 바퀴 반", 18, 272, { s: 11.5, c: LT.mute });
      KT.warn(ctx, LW - 12, 300, "⚠ 가로축은 한 칸마다 10배씩 늘어나는 눈금", "right");
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 662, W, H, "빛이 걸리는 시간"), qx = cd.px, R = cd.R, okA = Math.abs(t - 1) <= 0.1, okB = Math.abs(t / YEAR - 1) <= 0.1;
      lt(ctx, timeStr(t), qx, 66, { s: 24, w: "900", c: LT.orange });
      KT.row(ctx, "거리 d", sciStr(d, 1) + " m", qx, R, 102, LT.blue);
      KT.row(ctx, "속력 c", "3.00 × 10⁸ m/s", qx, R, 128);
      KT.row(ctx, "t = d ÷ c", t < 1e4 ? t.toPrecision(3) + " s" : sciStr(t, 2) + " s", qx, R, 154, LT.violet);
      lt(ctx, "목표 ① 약 1초", qx, 190, { s: 11.5, c: LT.mute }); lt(ctx, (got.a || okA) ? "✓" : "", R, 190, { s: 14, w: "900", a: "right", c: LT.green });
      lt(ctx, "목표 ② 약 1년 (1 광년)", qx, 214, { s: 11.5, c: LT.mute }); lt(ctx, (got.b || okB) ? "✓" : "", R, 214, { s: 14, w: "900", a: "right", c: LT.green });
      KT.tip(ctx, okA ? "빛이 1초에 가는 거리" : okB ? "1 광년 = 9.46 × 10¹⁵ m" : "‘약 1초’와 ‘약 1년’을 찾아요", qx - 4, 232, cd.w + 8, okA || okB ? true : null);
      lt(ctx, "1 광년 = 빛이 1년 동안 간 거리", qx, 292, { s: 11, c: LT.mute });
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
      var T = TARGETS[ti], A = T.val / Math.pow(10, p), LW = 640;
      var ok = A >= 1 && A < 10;
      KT.studio(ctx, 0, 0, LW, H, { x: 320, y: 190, rx: 320, ry: 14 });
      KT.bigText(ctx, T.name, 18, 44, 24, "#ffffff");
      KT.bigText(ctx, T.full + " " + T.unit, 18, 72, 16, "#ffd35a");
      /* 숫자 나무 블록 — 소수점(노란 구슬)이 칸을 뛰어 옮겨 간다 */
      var dg = digits(T), q = dg.o - p, lo = Math.min(0, q), hi = Math.max(dg.D.length, q), cnt = hi - lo;
      var tw = Math.min(40, 580 / cnt), x0 = 316 - cnt * tw / 2, ty = 128, th = 42, fn = 0, dd = Math.min(8, tw * 0.2);
      while (fn < dg.D.length - 1 && dg.D[fn] === "0") fn++;
      for (var j = lo; j < hi; j++) {
        var ghost = j < 0 || j >= dg.D.length, ch = ghost ? "0" : dg.D[j], X = x0 + (j - lo) * tw, sig = !ghost && j >= fn;
        if (ghost) {
          ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = "rgba(20,40,90,.35)"; ctx.lineWidth = 1.2; ctx.strokeRect(X + 2, ty, tw - 4, th); ctx.restore();
        } else {
          slab(ctx, X + 2, ty, tw - 4, th, dd, sig ? "#f6e3bf" : "#e6e9ef", sig ? "#e7c690" : "#d3d9e3", sig ? "#b8935a" : "#a9b2c2");
        }
        lt(ctx, ch, X + tw / 2, ty + 29, { s: Math.min(22, tw * 0.6), w: "900", a: "center", c: ghost ? LT.dim : (sig ? "#3b2a12" : LT.mute) });
      }
      lt(ctx, T.unit, x0 + cnt * tw + 10, ty + 28, { s: 13, c: LT.mute, w: "800" });
      var xo = x0 + (dg.o - lo) * tw, xq = x0 + (q - lo) * tw, dy = ty + th + 10;
      ctx.strokeStyle = "rgba(20,40,90,.45)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xo, dy, 4.5, 0, 6.2832); ctx.stroke();
      if (p !== 0) {
        ctx.save(); ctx.strokeStyle = LT.orange; ctx.lineWidth = 2.4; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(xo, ty - 10); ctx.quadraticCurveTo((xo + xq) / 2, ty - 46, xq, ty - 10); ctx.stroke(); ctx.restore();
        KT.arrow(ctx, { x: xq + (xo - xq) * 0.05, y: ty - 16 }, { x: xq, y: ty - 8 }, LT.orange, 2.4, 10);
      }
      KT.planet(ctx, xq, dy, 6.5, "#ffe066", "#c77700");
      var move = p === 0 ? "소수점을 아직 옮기지 않았습니다" : (p > 0 ? "소수점을 왼쪽으로 " + p + "칸 옮김" : "소수점을 오른쪽으로 " + (-p) + "칸 옮김");
      KT.pill(ctx, "● " + move, 316, dy + 34, { a: "center", s: 12, c: "#ffd35a", box: [0, LW] });
      KT.bigText(ctx, aStr(A) + " × 10" + sup(p) + " " + T.unit, 316, 274, 28, ok ? "#8ce99a" : "#ffffff", "center");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 650, W, H, "과학적 표기 판정"), px = cd.px, R = cd.R;
      lt(ctx, ok ? "올바른 표기" : (A >= 10 ? "계수가 너무 큼" : "계수가 너무 작음"), px, 64, { s: 20, w: "900", c: ok ? LT.green : LT.orange });
      KT.row(ctx, "계수 A", aStr(A), px, R, 100, ok ? LT.green : LT.orange);
      KT.row(ctx, "지수 n (옮긴 칸 수)", (p > 0 ? "+" : "") + p, px, R, 126, LT.violet);
      KT.row(ctx, "규칙", "1 ≤ A < 10", px, R, 152);
      KT.tip(ctx, ok ? "유효숫자 두 자리: " + sciStr(T.val, 1) : (A >= 10 ? "소수점을 더 왼쪽으로" : "소수점을 오른쪽으로 되돌려요"), px - 4, 172, cd.w + 8, ok ? true : false);
      var dn = ["a", "b", "c"].filter(function (kk) { return got[kk]; }).length + (ok && !got[T.key] ? 1 : 0);
      lt(ctx, "고친 수 " + dn + " / 3", px, 236, { s: 12, w: "900", c: LT.ink });
      KT.bar(ctx, px, 246, cd.w, dn / 3, LT.green);
      lt(ctx, "왼쪽으로 옮기면 +, 오른쪽은 −", px, 284, { s: 11, c: LT.mute });
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
      KT.card(ctx, x, y, w, h, null);
      ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, 7, h, [14, 0, 0, 14]); ctx.fill();
      lt(ctx, label, x + w / 2, y + 26, { s: 11.5, a: "center", c: LT.mute, w: "800" });
      lt(ctx, big, x + w / 2, y + 56, { s: 20, w: "900", a: "center", c: col });
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var mol = m / 18.0, cnt = mol * NA, i;
      drawModel(mol, cnt);
      /* 아래 칸: 계산 */
      var y0 = DH + 6;
      KT.studio(ctx, 0, y0, W, H - y0, null);
      box(30, y0 + 14, 170, 72, "질량", m + " g", LT.blue);
      box(250, y0 + 14, 170, 72, "물질량", mol.toFixed(2) + " mol", LT.violet);
      box(470, y0 + 14, 200, 72, "분자 수", sciStr(cnt, 1) + " 개", LT.orange);
      KT.arrow(ctx, { x: 206, y: y0 + 50 }, { x: 244, y: y0 + 50 }, LT.mute, 2.5, 10);
      KT.arrow(ctx, { x: 426, y: y0 + 50 }, { x: 464, y: y0 + 50 }, LT.mute, 2.5, 10);
      lt(ctx, "÷ 18.0 g/mol → 물질량", 696, y0 + 34, { s: 11.5, c: LT.violet, w: "900" });
      lt(ctx, "× 6.02×10²³ → 분자 수", 696, y0 + 58, { s: 11.5, c: LT.orange, w: "900" });
      lt(ctx, "물 1 mol = 18.0 g", 696, y0 + 82, { s: 11, c: LT.mute, w: "800" });
      var dots = clamp(Math.round(cnt / 1e23), 0, 60);
      for (i = 0; i < dots; i++) KT.planet(ctx, 40 + (i % 30) * 20, y0 + 116 + ((i / 30) | 0) * 22, 6, "#63e6be", "#087f5b");
      lt(ctx, "● 하나 = 10²³ 개", 696, y0 + 120, { s: 11, c: LT.green, w: "900" });
      lt(ctx, "(60개가 넘으면 더 그리지 않음)", 696, y0 + 142, { s: 10, c: LT.dim, w: "700" });
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
      var total = n * CELL, done15 = total >= 1e15, LW = 610, i;
      KT.studio(ctx, 0, 0, LW, H, { x: 300, y: 268, rx: 300, ry: 26 });
      /* 교실 바닥 블록 + 책상에 앉은 학생들 */
      var I = KT.iso({ ox: 300, oy: 108, s: 0.7, L: 330, D: 150 });
      I.box(ctx, 0, 0, -18, 330, 150, 0, "#d9b98a", "#b08656", "#8a6540");
      ctx.strokeStyle = "rgba(110,75,35,.22)"; ctx.lineWidth = 1;
      for (var fx = 30; fx < 330; fx += 30) { var a = I.P(fx, 0, 0), b = I.P(fx, 150, 0); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      I.box(ctx, 0, -6, 0, 330, 0, 70, "#eef2f6", "#e9edf2", "#c9d1dc");
      I.box(ctx, 120, -5, 26, 230, -2, 62, "#2f5a46", "#2f5a46", "#244636");
      I.edges(ctx, 0, 0);
      for (i = 0; i < 40; i++) {
        var col = i % 10, row = (i / 10) | 0, x = 24 + col * 31, y = 26 + row * 33, on = i < n;
        I.box(ctx, x - 9, y - 6, 0, x + 9, y + 2, 9, on ? "#f1e4c8" : "rgba(241,228,200,.45)", on ? "#c9a56b" : "rgba(201,165,107,.35)", on ? "#a8844d" : "rgba(168,132,77,.3)");
        if (on) I.person(ctx, x, y + 9, 0, SHIRT[i % SHIRT.length][1], 1.7);
      }
      KT.bigText(ctx, "= " + sciStr(total, 2) + " 개", 18, 46, 26, done15 ? "#8ce99a" : "#ffffff");
      KT.bigText(ctx, n + "명의 세포", 18, 76, 17, "#ffd35a");
      KT.pill(ctx, "빈 책상 = 아직 더하지 않은 자리", LW - 14, 290, { a: "right", s: 11, c: "#e8ecff", box: [0, LW] });
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 620, W, H, "세포 수 더하기"), px = cd.px, R = cd.R;
      lt(ctx, sciStr(total, 2), px, 64, { s: 24, w: "900", c: done15 ? LT.green : LT.violet });
      KT.row(ctx, "한 사람", "3.7 × 10¹³ 개", px, R, 98);
      KT.row(ctx, "인원", "× " + n + " 명", px, R, 122, LT.blue);
      KT.row(ctx, "계수만 곱하면", (3.7 * n).toFixed(1) + " × 10¹³", px, R, 146, LT.orange);
      lt(ctx, "10¹⁵ 개까지", px, 178, { s: 11.5, c: LT.mute }); lt(ctx, (total / 1e15 * 100).toFixed(0) + " %", R, 178, { s: 12, w: "900", a: "right", c: done15 ? LT.green : LT.yellow });
      KT.bar(ctx, px, 186, cd.w, total / 1e15, done15 ? LT.green : LT.yellow);
      KT.tip(ctx, n === 28 ? "여기서 처음 10¹⁵ 개를 넘습니다" : (done15 ? "이미 넘었어요 · 줄여 보세요" : "아직 모자랍니다 · 늘려 보세요"), px - 4, 212, cd.w + 8, n === 28 ? true : null);
      lt(ctx, "계수가 10을 넘으면 지수를 1 올립니다", px, 272, { s: 10.5, c: LT.mute });

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
