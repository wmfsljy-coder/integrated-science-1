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
/* 가로로 누운 원통(유리관·금속 막대): 위→아래 그라데이션 + 둥근 끝 */
function tubeH(ctx, x0, x1, cy, r, c0, c1, c2, cap) {
  var g = ctx.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, c0); g.addColorStop(0.38, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, cy - r); ctx.lineTo(x1, cy - r);
  ctx.ellipse(x1, cy, r * 0.32, r, 0, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x0, cy + r);
  ctx.ellipse(x0, cy, r * 0.32, r, 0, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fill();
  if (cap) { ctx.fillStyle = cap; ctx.beginPath(); ctx.ellipse(x1, cy, r * 0.32, r, 0, 0, 6.2832); ctx.fill(); }
}
/* 서 있는 원통(받침대·추·시계 몸통): 옆면 가로 그라데이션 + 윗면 타원 */
function cylV(ctx, cx, yTop, yBot, rx, ry, c0, c1, c2, cTop) {
  var g = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0); g.addColorStop(0, c0); g.addColorStop(0.4, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - rx, yTop); ctx.lineTo(cx - rx, yBot); ctx.ellipse(cx, yBot, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(cx + rx, yTop); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cTop || c1; ctx.beginPath(); ctx.ellipse(cx, yTop, rx, ry, 0, 0, 6.2832); ctx.fill();
}
/* 투명 아크릴 진열장(앞에서 비스듬히 본 정육면체): 뒤 모서리 → fn(속 그림) → 앞 유리·모서리 */
function acrylic(ctx, x, y, w, h, d, inner, fn) {
  var dx = d, dy = d * 0.6;
  floorShadow(ctx, x + w / 2 + dx / 2, y + h - dy / 2 + 4, w * 0.62, 12, 0.22);
  ctx.fillStyle = inner || "rgba(225,235,248,.55)";
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y - dy); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w + dx, y + h - dy); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(120,140,170,.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + dx, y - dy); ctx.lineTo(x + dx, y + h - dy); ctx.lineTo(x, y + h); ctx.moveTo(x + dx, y + h - dy); ctx.lineTo(x + w + dx, y + h - dy); ctx.stroke();
  if (fn) { ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y - dy); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w + dx, y + h - dy); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.clip(); fn(); ctx.restore(); }
  ctx.fillStyle = "rgba(255,255,255,.10)"; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.beginPath(); ctx.moveTo(x + 8, y + 6); ctx.lineTo(x + 26, y + 6); ctx.lineTo(x + 8, y + h * 0.45); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.moveTo(x, y); ctx.lineTo(x + dx, y - dy); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w, y); ctx.moveTo(x + w + dx, y - dy); ctx.lineTo(x + w + dx, y + h - dy); ctx.lineTo(x + w, y + h); ctx.stroke();
  ctx.strokeStyle = "rgba(90,110,140,.45)"; ctx.lineWidth = 1; ctx.strokeRect(x - .5, y - .5, w + 1, h + 1);
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

    /* 실험대 위 입체 미니어처: 기둥 고리 → 뉴턴 용수철저울 → 파운드힘 용수철저울 → 손잡이.
       두 저울은 한 줄로 이어져 같은 힘을 받는다. 용수철은 똑같이 늘어나지만 눈금 숫자가 다르다 */
    var LW = 622, CY = 150, TB = 140, SP = 100, RT = 17;
    function coil(x0, x1, cy, r) {
      var n = 11, p = (x1 - x0) / n, i;
      for (i = 0; i < n; i++) {
        var xc = x0 + p * (i + 0.5);
        ctx.strokeStyle = "#8f98a8"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(xc, cy, Math.max(1.5, p * 0.5), r, 0, Math.PI, 0); ctx.stroke();
        ctx.strokeStyle = "#3f4758"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(xc, cy, Math.max(1.5, p * 0.5), r, 0, 0, Math.PI); ctx.stroke();
      }
    }
    function scale(x0, e, unit, max, step, nd, col, light) {
      var ix = x0 + 22 + e, re = x0 + TB + 12 + e, i;
      /* 받침 다리와 바닥 그림자 */
      floorShadow(ctx, x0 + TB / 2 + 14, 234, TB * 0.62, 7, 0.2);
      [x0 + 9, x0 + TB - 9].forEach(function (lx) {
        ctx.fillStyle = metal(ctx, lx - 3, 0, lx + 3, 0, "#f3f5f8", "#a7afbd", "#5b6476"); ctx.fillRect(lx - 2.5, CY + RT - 2, 5, 232 - CY - RT);
        ctx.fillStyle = "#4a5266"; ctx.beginPath(); ctx.ellipse(lx, 233, 7, 3, 0, 0, 6.2832); ctx.fill();
      });
      /* 유리관 속: 뒤쪽 반투명 → 용수철 → 빨간 표시판 */
      tubeH(ctx, x0, x0 + TB, CY, RT, "rgba(255,255,255,.95)", "rgba(226,236,248,.92)", "rgba(168,186,212,.95)");
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(x0 + 18, CY - RT + 3, SP + 10, 9);
      /* 눈금(관 아래쪽 앞면) */
      for (i = 0; i <= max + 1e-9; i += step / 2) {
        var tx = x0 + 22 + i / max * SP, big = Math.abs(i / step - Math.round(i / step)) < 1e-6;
        if (tx > x0 + TB - 8) break;
        ctx.strokeStyle = LT.ink; ctx.lineWidth = big ? 1.5 : 0.8; ctx.beginPath(); ctx.moveTo(tx, CY + RT - 1); ctx.lineTo(tx, CY + RT - (big ? 9 : 5)); ctx.stroke();
        if (big) lt(ctx, i.toFixed(nd), tx, CY + RT + 14, { s: 12, a: "center", c: col, w: "900" });
      }
      coil(x0 + 5, ix, CY - 1, RT - 6);
      ctx.fillStyle = "#d9302c"; ctx.beginPath(); ctx.ellipse(ix, CY, 3.2, RT - 3, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "#d9302c"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ix, CY + RT - 3); ctx.lineTo(ix, CY + RT + 1); ctx.stroke();
      /* 당기는 막대(관 밖으로 나온 금속) */
      tubeH(ctx, ix, re, CY, 3, "#ffffff", "#aab3c3", "#4e5768");
      ctx.strokeStyle = "#5b6476"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(re + 4, CY, 4, 0, 6.2832); ctx.stroke();
      /* 유리 앞면 반사·테두리·마개 */
      ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(x0 + 4, CY - RT + 4, TB - 8, 3);
      ctx.strokeStyle = "rgba(90,110,140,.65)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, CY - RT); ctx.lineTo(x0 + TB, CY - RT); ctx.moveTo(x0, CY + RT); ctx.lineTo(x0 + TB, CY + RT); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x0, CY, RT * 0.36, RT, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = metal(ctx, 0, CY - RT, 0, CY + RT, "#ffffff", "#c4cbd6", "#7d8698"); ctx.beginPath(); ctx.ellipse(x0 + TB, CY, RT * 0.32, RT, 0, 0, 6.2832); ctx.fill();
      KT.pill(ctx, light, x0 + TB / 2, CY - RT - 14, { a: "center", s: 12, c: unit === "N" ? "#a5d8ff" : "#ffd8a8", box: [0, LW] });
      return re + 4;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var lbf = F / LBF, e = F / 50 * SP;
      KT.studio(ctx, 0, 0, LW, H, { x: 320, y: 250, rx: 330, ry: 22 });
      /* 실험대(얇은 나무 상판) */
      slab(ctx, 10, 246, 572, 12, 40, "#e2c497", "#a87d4f", "#8a6540");
      ctx.fillStyle = "rgba(255,255,255,.18)"; for (var gi = 0; gi < 6; gi++) { ctx.fillRect(30 + gi * 92, 236 - (gi % 2) * 4, 60, 1.5); }
      /* 왼쪽 기둥과 고리 */
      floorShadow(ctx, 40, 236, 22, 5, 0.3);
      cylV(ctx, 34, 104, 234, 9, 3.5, "#f3f5f8", "#aab3c3", "#5b6476", "#dfe4eb");
      ctx.fillStyle = metal(ctx, 0, 96, 0, 110, "#ffffff", "#9aa3b3", "#4a5266"); ctx.beginPath(); ctx.roundRect(20, 98, 30, 10, 4); ctx.fill();
      ctx.fillStyle = "#4a5266"; ctx.fillRect(34, CY - 3, 18, 6);
      var x2 = 218 + e;
      var r1 = scale(56, e, "N", 50, 10, 0, LT.blue, "뉴턴 저울 · SI 단위");
      ctx.strokeStyle = "#5b6476"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(r1, CY); ctx.lineTo(x2 - 4, CY); ctx.stroke();
      var r2 = scale(x2, e, "lbf", 50 / LBF, 2, 0, LT.orange, "파운드힘 저울 · 미국 관습 단위");
      /* 손잡이(T자 금속) — 두 용수철이 늘어난 만큼 끌려간다 */
      var hx = r2 + 10;
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
      ctx.fillStyle = metal(ctx, hx - 6, 0, hx + 10, 0, "#ffffff", "#9aa3b3", "#4a5266"); ctx.beginPath(); ctx.roundRect(hx - 5, CY - 30, 15, 60, 7); ctx.fill(); ctx.restore();
      ctx.fillStyle = "#3d4454"; ctx.fillRect(r2 - 2, CY - 2.5, hx - r2 - 2, 5);
      if (F > 0.05) KT.arrow(ctx, { x: hx + 14, y: CY }, { x: Math.min(LW - 6, hx + 26 + F * 0.5), y: CY }, LT.red, 4, 12);
      /* 두 저울이 읽은 값 */
      KT.bigText(ctx, F.toFixed(1) + " N", 56 + TB / 2, 290, 22, "#74c0fc", "center");
      KT.bigText(ctx, lbf.toFixed(2) + " lbf", x2 + TB / 2, 290, 22, "#ffa94d", "center");
      KT.bigText(ctx, "힘은 하나, 숫자는 둘", 18, 40, 24, "#ffffff");
      KT.bigText(ctx, "N ÷ 4.448 = lbf", 18, 66, 17, "#ffd35a");
      KT.warn(ctx, LW - 12, 30, "⚠ 두 저울을 한 줄로 이어 같은 힘을 받게 함", "right");
      lt(ctx, "용수철이 늘어난 길이는 같다", LW - 12, 62, { s: 12, a: "right", c: LT.mute, w: "800" });

      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 632, W, H, "두 저울이 가리키는 값"), px = cd.px, R = cd.R;
      lt(ctx, lbf.toFixed(2) + " lbf", px, 62, { s: 26, w: "900", c: LT.orange });
      lt(ctx, "= " + F.toFixed(1) + " N", R, 62, { s: 15, w: "900", a: "right", c: LT.blue });
      KT.row(ctx, "뉴턴 저울", F.toFixed(1) + " N", px, R, 94, LT.blue);
      KT.row(ctx, "파운드힘 저울", lbf.toFixed(3) + " lbf", px, R, 118, LT.orange);
      KT.row(ctx, "두 값의 비 (N ÷ lbf)", F > 0 ? (F / lbf).toFixed(3) : "—", px, R, 142, LT.violet);
      var g1 = Math.abs(lbf - 1) <= 0.02 || got.a, g2 = Math.abs(lbf - 10) <= 0.2 || got.b;
      lt(ctx, "목표 ① 파운드힘 1.0", px, 172, { s: 12, c: LT.mute });
      lt(ctx, g1 ? "✓" : "", R, 172, { s: 14, w: "900", a: "right", c: LT.green });
      KT.bar(ctx, px, 179, cd.w, clamp(lbf / 1, 0, 1), g1 ? LT.green : LT.yellow);
      lt(ctx, "목표 ② 파운드힘 10.0", px, 206, { s: 12, c: LT.mute });
      lt(ctx, g2 ? "✓" : "", R, 206, { s: 14, w: "900", a: "right", c: LT.green });
      KT.bar(ctx, px, 213, cd.w, clamp(lbf / 10, 0, 1), g2 ? LT.green : LT.yellow);
      var near1 = Math.abs(lbf - 1) <= 0.02, near10 = Math.abs(lbf - 10) <= 0.2;
      KT.tip(ctx, near1 ? "1 lbf = 4.45 N 입니다" : near10 ? "10 lbf = 44.5 N 입니다" : "손잡이로 1.0 · 10.0 lbf 에 맞춰요", px - 4, 234, cd.w + 8, near1 || near10 ? true : null);
      lt(ctx, "1 lbf = 4.448222 N · 비는 늘 같다", px, 288, { s: 12.5, w: "900", c: LT.violet });

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
    var BASIS = ["빛의 속력 c 로 정함", "플랑크 상수 h 로 정함", "세슘 원자의 진동으로 정함", "기본 전하 e 로 정함", "볼츠만 상수 k 로 정함", "아보가드로수로 정함", "정해진 빛의 밝기로 정함"];
    var PX = 56, PG = 96, TOP = 168;
    /* 받침대 위 입체 소품(기본량마다 그 단위를 떠올리게 하는 물건) */
    function prop(i, cx, by, col) {
      var k;
      if (i === 0) { /* 세워 둔 나무 미터자 + 빛줄기 */
        ctx.fillStyle = metal(ctx, cx - 8, 0, cx + 8, 0, "#f6dfb4", "#d9b17a", "#a97f4c"); ctx.fillRect(cx - 7, by - 86, 14, 86);
        ctx.fillStyle = "#b98d58"; ctx.beginPath(); ctx.moveTo(cx + 7, by - 86); ctx.lineTo(cx + 12, by - 89); ctx.lineTo(cx + 12, by - 3); ctx.lineTo(cx + 7, by); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#5b4022"; ctx.lineWidth = 1;
        for (k = 0; k <= 20; k++) { var ty = by - 4 - k * 4; ctx.beginPath(); ctx.moveTo(cx - 7, ty); ctx.lineTo(cx - 7 + (k % 5 ? 4 : 8), ty); ctx.stroke(); }
        ctx.strokeStyle = "rgba(255,190,40,.9)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - 26, by - 70); ctx.lineTo(cx - 9, by - 70); ctx.stroke();
        KT.glow(ctx, cx - 26, by - 70, 3, "rgba(255,190,40,.95)", 3);
      } else if (i === 1) { /* 유리 종 속 백금 원기 */
        cylV(ctx, cx, by - 40, by - 6, 15, 5, "#f8f9fb", "#c3cad6", "#6b7384", "#eef1f5");
        ctx.fillStyle = "rgba(210,225,245,.35)"; ctx.strokeStyle = "rgba(120,140,170,.7)"; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(cx - 28, by - 2); ctx.lineTo(cx - 28, by - 54); ctx.quadraticCurveTo(cx - 28, by - 78, cx, by - 78); ctx.quadraticCurveTo(cx + 28, by - 78, cx + 28, by - 54); ctx.lineTo(cx + 28, by - 2); ctx.fill(); ctx.stroke();
        cylV(ctx, cx, by - 84, by - 78, 4, 2, "#dfe4eb", "#aab3c3", "#5b6476");
        ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillRect(cx - 22, by - 62, 4, 40);
      } else if (i === 2) { /* 원자시계 상자 */
        slab(ctx, cx - 30, by - 50, 54, 48, 10, "#e9edf3", "#c9d0da", "#9aa3b0");
        ctx.fillStyle = "#12203a"; ctx.beginPath(); ctx.roundRect(cx - 25, by - 44, 44, 20, 4); ctx.fill();
        lt(ctx, "Cs-133", cx - 3, by - 30, { s: 11, w: "900", a: "center", c: "#8ce99a" });
        for (k = 0; k < 3; k++) { ctx.fillStyle = k === 1 ? col : "#7d8698"; ctx.beginPath(); ctx.arc(cx - 16 + k * 13, by - 13, 3.2, 0, 6.2832); ctx.fill(); }
        ctx.strokeStyle = "#7d8698"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 14, by - 55); ctx.lineTo(cx + 22, by - 74); ctx.stroke();
        KT.planet(ctx, cx + 22, by - 76, 3.5, "#ffffff", "#5b6476");
      } else if (i === 3) { /* 건전지 + 구리 전선 고리 + 흐르는 전하 */
        ctx.strokeStyle = "#c27c2c"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 16, by - 30); ctx.bezierCurveTo(cx - 40, by - 96, cx + 40, by - 96, cx + 16, by - 30); ctx.stroke();
        ctx.strokeStyle = "rgba(255,230,190,.6)"; ctx.lineWidth = 1.2; ctx.stroke();
        [0.25, 0.5, 0.75].forEach(function (t) {
          var u = 1 - t, x = u * u * u * (cx - 16) + 3 * u * u * t * (cx - 40) + 3 * u * t * t * (cx + 40) + t * t * t * (cx + 16), y = u * u * u * (by - 30) + 3 * u * u * t * (by - 96) + 3 * u * t * t * (by - 96) + t * t * t * (by - 30);
          KT.planet(ctx, x, y, 3.6, "#c3fae8", col);
        });
        cylV(ctx, cx, by - 34, by - 4, 18, 6, "#4a5266", "#2b2f3a", "#151820", "#9aa3b0");
        ctx.fillStyle = col; ctx.fillRect(cx - 18, by - 24, 36, 9);
      } else if (i === 4) { /* 유리 온도계 */
        ctx.fillStyle = "rgba(225,236,248,.9)"; ctx.strokeStyle = "#8a96a8"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(cx - 6, by - 92, 12, 80, 6); ctx.fill(); ctx.stroke();
        KT.planet(ctx, cx, by - 12, 10, "#ff8787", "#a51111");
        ctx.fillStyle = "#e03131"; ctx.fillRect(cx - 2, by - 60, 4, 50);
        ctx.strokeStyle = LT.ink; ctx.lineWidth = 1;
        for (k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(cx + 6, by - 24 - k * 9); ctx.lineTo(cx + 11, by - 24 - k * 9); ctx.stroke(); }
        ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(cx - 4, by - 88, 2, 60);
      } else if (i === 5) { /* 입자 더미(피라미드) */
        var rows = [[-24, -12, 0, 12, 24], [-18, -6, 6, 18], [-12, 0, 12], [-6, 6], [0]];
        rows.forEach(function (r, ri) { r.forEach(function (dx) { KT.planet(ctx, cx + dx, by - 8 - ri * 11, 6.4, "#b2f2bb", "#0b6b4f"); }); });
      } else { /* 촛불 */
        cylV(ctx, cx, by - 54, by - 4, 10, 3.5, "#fffaf0", "#efe2c4", "#c9b48a", "#fff6e0");
        ctx.strokeStyle = "#3b2a12"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, by - 54); ctx.lineTo(cx, by - 60); ctx.stroke();
        KT.glow(ctx, cx, by - 68, 7, "rgba(255,170,40,.95)", 4);
        ctx.fillStyle = "#fff4c2"; ctx.beginPath(); ctx.ellipse(cx, by - 68, 4, 9, 0, 0, 6.2832); ctx.fill();
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      KT.studio(ctx, 0, 0, 690, H, { x: 345, y: 214, rx: 340, ry: 26 });
      KT.bigText(ctx, "SI 기본량은 7개", 18, 38, 22, "#ffffff");
      units.forEach(function (u, i) {
        var cx = PX + i * PG, c = ICOL[i], on = i === sel, lift = on ? -8 : 0;
        if (on) { /* 위에서 비추는 조명 */
          var sp = ctx.createLinearGradient(0, 40, 0, TOP); sp.addColorStop(0, "rgba(255,240,180,0)"); sp.addColorStop(1, "rgba(255,240,180,.55)");
          ctx.fillStyle = sp; ctx.beginPath(); ctx.moveTo(cx - 12, 40); ctx.lineTo(cx + 12, 40); ctx.lineTo(cx + 40, TOP); ctx.lineTo(cx - 40, TOP); ctx.closePath(); ctx.fill();
        }
        floorShadow(ctx, cx + 6, 206, 46, 8, on ? 0.32 : 0.22);
        /* 받침대: 흰 원기둥, 앞면에 단위 기호 */
        cylV(ctx, cx, TOP + lift, 202, 40, 12, "#ffffff", "#e9eef5", "#b9c3d2", on ? KT.tint("#ffffff", 1) : "#f6f8fb");
        ctx.strokeStyle = on ? c : "rgba(20,40,90,.18)"; ctx.lineWidth = on ? 3 : 1.2; ctx.beginPath(); ctx.ellipse(cx, TOP + lift, 40, 12, 0, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = c; ctx.globalAlpha = on ? 1 : 0.85; ctx.fillRect(cx - 40, 196, 80, 4); ctx.globalAlpha = 1;
        lt(ctx, u.sym, cx, 192 + lift * 0.3, { s: 22, w: "900", a: "center", c: c });
        prop(i, cx, TOP + lift + 2, c);
        lt(ctx, u.q, cx, 228, { s: 14, w: "900", a: "center", c: on ? c : LT.ink });
        lt(ctx, u.name, cx, 246, { s: 12, a: "center", c: LT.mute });
      });
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 700, W, H, sel < 0 ? "받침대를 눌러 보세요" : "고른 기본량"), px = cd.px, R = cd.R;
      if (sel < 0) {
        lt(ctx, "기본량 7개", px, 62, { s: 22, w: "900", c: LT.violet });
        lt(ctx, "그 밖의 모든 양은", px, 96, { s: 12, c: LT.mute });
        lt(ctx, "기본량을 곱하고 나눈", px, 116, { s: 12, c: LT.mute });
        lt(ctx, "유도량입니다", px, 136, { s: 12, w: "900", c: LT.ink });
        lt(ctx, "m/s · N · J · kg/m³", px, 168, { s: 14, w: "900", c: LT.violet });
        KT.tip(ctx, "👆 받침대를 눌러 보세요", px - 4, 196, cd.w + 8, null);
      } else {
        var u = units[sel];
        lt(ctx, u.sym, px, 66, { s: 34, w: "900", c: ICOL[sel] });
        lt(ctx, u.name, px + 8 + u.sym.length * 22, 64, { s: 15, w: "900", c: LT.ink });
        KT.row(ctx, "기본량", u.q, px, R, 104, ICOL[sel]);
        KT.row(ctx, "기준", "자연 상수", px, R, 130, LT.ink);
        KT.tip(ctx, BASIS[sel], px - 4, 146, cd.w + 8, true);
        lt(ctx, "유도량 예: m/s · N · J", px, 212, { s: 12, c: LT.mute });
        lt(ctx, "아래 설명을 읽어 보세요", px, 236, { s: 12, c: LT.mute });
      }
    }    canvas._redraw = draw;
    canvas.addEventListener("click", function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas._w / rect.width);
      var my = (e.clientY - rect.top) * (canvas._h / rect.height);
      var idx = Math.floor((mx - 8) / 96);
      if (mx > 690 || my < 40 || idx < 0 || !units[idx]) return;
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
    for (var pi = 0; pi < 26; pi++) parts.push({ x: RP(), y: RP(), z: RP(), p: RP() * 6.28, q: RP() * 6.28, w: 0.7 + RP() * 0.9 });
    var LW = 640, TX = 372, TY0 = 206, TY1 = 52;
    function yOf(t) { return TY0 - (t + 273) / 473 * (TY0 - TY1); }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var K = c + 273.15, hot = clamp(K / 473, 0, 1), amp = 15 * Math.sqrt(Math.max(K, 0) / 373.15);
      KT.studio(ctx, 0, 0, LW, H, { x: 300, y: 236, rx: 300, ry: 18 });
      /* 가열·냉각 판(아래) — 뜨거우면 붉게, 차가우면 서리 낀 파랑 */
      var warm = clamp((c - 25) / 175, 0, 1), cold = clamp((25 - c) / 298, 0, 1);
      var plateTop = warm > 0 ? "rgb(" + Math.round(225 + 30 * warm) + "," + Math.round(220 - 120 * warm) + "," + Math.round(210 - 150 * warm) + ")" : "rgb(" + Math.round(225 - 90 * cold) + "," + Math.round(228 - 30 * cold) + "," + Math.round(232 + 23 * cold) + ")";
      slab(ctx, 22, 230, 236, 10, 40, plateTop, "#8a93a3", "#6b7384");
      if (warm > 0.15) KT.glow(ctx, 160, 222, 40 * warm, "rgba(255,120,40," + (0.25 * warm) + ")", 3);
      /* 투명 상자 속 기체 입자 — 온도가 오를수록 빠르고 크게 흔들린다 */
      var pb = "rgb(" + Math.round(70 + 170 * hot) + "," + Math.round(140 - 60 * hot) + "," + Math.round(230 - 180 * hot) + ")";
      acrylic(ctx, 24, 86, 228, 140, 40, "rgba(232,240,250,.6)", function () {
        parts.slice().sort(function (a, b) { return a.z - b.z; }).forEach(function (p) {
          var dz = p.z * 34, px = 40 + dz + p.x * 196 + Math.sin(tm * p.w * 0.012 + p.p) * amp;
          var py = 98 - dz * 0.6 + p.y * 110 + Math.cos(tm * p.w * 0.015 + p.q) * amp * 0.7;
          if (amp > 1) { ctx.strokeStyle = "rgba(" + (hot > .5 ? "224,49,49" : "28,126,214") + ",.18)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.cos(tm * p.w * 0.012 + p.p) * amp * 0.5, py + Math.sin(tm * p.w * 0.015 + p.q) * amp * 0.4); ctx.stroke(); }
          KT.planet(ctx, px, py, 5.5 + p.z * 1.6, pb, "#1b2a4a");
        });
      });
      /* 세워 둔 유리 온도계: 왼쪽 ℃ · 오른쪽 K 눈금 */
      floorShadow(ctx, TX + 6, 236, 34, 6, 0.28);
      cylV(ctx, TX, 222, 234, 26, 6, "#e9edf3", "#c3cad6", "#7d8698", "#f3f5f8");
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.22)"; ctx.shadowBlur = 8; ctx.shadowOffsetX = 4;
      ctx.fillStyle = "rgba(236,243,251,.96)"; ctx.beginPath(); ctx.roundRect(TX - 11, TY1 - 16, 22, TY0 - TY1 + 30, 11); ctx.fill(); ctx.restore();
      KT.planet(ctx, TX, TY0 + 6, 14, "#ff8787", "#9c1c1c");
      var lq = ctx.createLinearGradient(TX - 4, 0, TX + 4, 0); lq.addColorStop(0, "#ff8787"); lq.addColorStop(0.5, "#e03131"); lq.addColorStop(1, "#9c1c1c");
      var yl = yOf(c); ctx.fillStyle = lq; ctx.beginPath(); ctx.roundRect(TX - 4, yl, 8, TY0 - yl + 4, 3); ctx.fill();
      ctx.strokeStyle = "rgba(120,140,170,.7)"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.roundRect(TX - 11, TY1 - 16, 22, TY0 - TY1 + 30, 11); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(TX - 8, TY1 - 8, 3, TY0 - TY1);
      lt(ctx, "℃", TX - 20, TY1 - 22, { s: 13, w: "900", a: "right", c: LT.orange });
      lt(ctx, "K", TX + 20, TY1 - 22, { s: 13, w: "900", c: LT.blue });
      [-273, -200, -100, 0, 100, 200].forEach(function (t) {
        var y = yOf(t);
        ctx.strokeStyle = LT.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(TX - 17, y); ctx.lineTo(TX - 11, y); ctx.moveTo(TX + 11, y); ctx.lineTo(TX + 17, y); ctx.stroke();
        lt(ctx, t + "", TX - 21, y + 4, { s: 12, a: "right", c: LT.orange, w: "900" });
        lt(ctx, Math.round(t + 273.15) + "", TX + 21, y + 4, { s: 12, c: LT.blue, w: "900" });
      });
      /* 지금 온도 화살표 */
      ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.moveTo(TX + 52, yl); ctx.lineTo(TX + 62, yl - 6); ctx.lineTo(TX + 62, yl + 6); ctx.closePath(); ctx.fill();
      [[100, "물이 끓는 온도"], [0, "물이 어는 온도"], [-273, "절대 영도 근처"]].forEach(function (q) {
        var y = yOf(q[0]); ctx.strokeStyle = "rgba(20,40,90,.3)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(TX + 66, y); ctx.lineTo(TX + 82, y); ctx.stroke(); ctx.setLineDash([]);
        lt(ctx, q[1], TX + 88, y + 4, { s: 12, c: LT.mute, w: "800" });
      });
      KT.bigText(ctx, c + " ℃ = " + K.toFixed(2) + " K", 18, 40, 24, "#ffffff");
      lt(ctx, "간격은 같고 출발점만 273.15 다르다", LW - 14, 236, { s: 12, a: "right", c: LT.mute, w: "800" });
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 650, W, H, "두 눈금으로 읽기"), bx = cd.px;
      lt(ctx, K.toFixed(2) + " K", bx, 62, { s: 24, w: "900", c: LT.blue });
      KT.row(ctx, "섭씨", c + " ℃", bx, cd.R, 96, LT.orange);
      KT.row(ctx, "켈빈 = ℃ + 273.15", K.toFixed(2) + " K", bx, cd.R, 120, LT.blue);
      lt(ctx, "입자가 흔들리는 정도", bx, 150, { s: 12, c: LT.mute });
      KT.bar(ctx, bx, 158, cd.w, amp / 17, hot > 0.6 ? LT.red : LT.blue);
      KT.tip(ctx, K <= 0.5 ? "움직임이 가장 약한 상태" : Math.abs(K - 273.15) <= 0.5 ? "물이 어는 온도 = 273.15 K" : "온도가 오르면 더 세게 흔들린다", bx - 4, 182, cd.w + 8, K <= 0.5 || Math.abs(K - 273.15) <= 0.5 ? true : null);
      lt(ctx, "0 K 보다 낮은 온도는 없다", bx, 240, { s: 12, w: "800", c: LT.violet });
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
    /* 겹친 진열장: 가운데 상자(지금 크기) 안 구석의 1/10 상자 = 한 걸음 작게, 가운데 상자는 점선 거대 상자(한 걸음 크게)의 1/10 */
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var here = place(n), low = place(n - 1), high = place(n + 1), LW = 612, t = tint(n), col = "rgb(" + t.join(",") + ")";
      var CX = 232, CY0 = 112, CS = 186, CD = 44, BY = CY0 + CS;
      KT.studio(ctx, 0, 0, LW, H, { x: 330, y: BY + 4, rx: 280, ry: 20 });
      /* 한 걸음 크게: 점선 거대 상자의 모서리(가운데 상자가 그 1/10) */
      if (n < 26) {
        ctx.save(); ctx.setLineDash([7, 5]); ctx.strokeStyle = "rgba(112,72,232,.55)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(CX, BY); ctx.lineTo(LW, BY); ctx.moveTo(CX, BY); ctx.lineTo(CX, 0);
        ctx.moveTo(CX, 0 + 0); ctx.moveTo(CX + CD, BY - CD * 0.6); ctx.lineTo(CX + CD, 0); ctx.stroke(); ctx.restore();
        ctx.fillStyle = "rgba(112,72,232,.05)"; ctx.fillRect(CX, 0, LW - CX, BY);
        KT.pill(ctx, "×10 한 걸음 크게 · " + high[1] + " " + high[0], LW - 14, 30, { a: "right", s: 12, c: "#d0bfff", box: [0, LW] });
      }
      /* 받침(얇은 흰 판) */
      slab(ctx, CX - 18, BY, CS + 36, 8, CD + 6, "#f6f8fb", "#cfd6e0", "#aab3c3");
      /* 가운데 진열장: 지금 크기 */
      acrylic(ctx, CX, CY0, CS, CS, CD, "rgba(" + t.join(",") + ",.16)", function () {
        var g = ctx.createRadialGradient(CX + CS / 2 + CD / 2, CY0 + CS * 0.42, 6, CX + CS / 2, CY0 + CS / 2, CS * 0.75);
        g.addColorStop(0, "rgba(" + t.join(",") + ",.42)"); g.addColorStop(1, "rgba(" + t.join(",") + ",.05)");
        ctx.fillStyle = g; ctx.fillRect(CX, CY0 - CD, CS + CD, CS + CD);
        lt(ctx, here[0], CX + CS / 2 + CD * 0.4, CY0 + 92, { s: 70, a: "center" });
      });
      lt(ctx, here[1], CX + CS / 2, CY0 + 128, { s: 18, w: "900", a: "center", c: LT.ink });
      lt(ctx, here[2], CX + CS / 2, CY0 + 150, { s: 12, a: "center", c: LT.mute, w: "800" });
      /* 한 걸음 작게: 안쪽 구석 1/10 상자 */
      if (n > -15) {
        var s1 = CS / 10, sx = CX + 8, sy = BY - 8 - s1;
        ctx.fillStyle = "rgba(232,89,12,.22)"; ctx.fillRect(sx, sy, s1, s1);
        ctx.fillStyle = "rgba(232,89,12,.35)"; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + s1 * 0.24, sy - s1 * 0.14); ctx.lineTo(sx + s1 * 1.24, sy - s1 * 0.14); ctx.lineTo(sx + s1, sy); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = LT.orange; ctx.lineWidth = 1.6; ctx.strokeRect(sx, sy, s1, s1);
        ctx.strokeStyle = "rgba(20,25,40,.75)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sx, sy + s1 / 2); ctx.lineTo(CX - 28, sy + s1 / 2); ctx.stroke();
        KT.pill(ctx, "÷10 한 걸음 작게", CX - 32, sy - 6, { a: "right", s: 12, c: "#ffc078", box: [0, LW] });
        lt(ctx, low[0] + " " + low[1], CX - 32, sy + 26, { s: 12, a: "right", c: LT.ink, w: "800" });
      }
      KT.bigText(ctx, "10" + sup(n) + " m", 18, 48, 30, "#ffffff");
      KT.bigText(ctx, "손톱에서 " + Math.abs(n + 2) + "걸음", 18, 78, 18, "#ffd35a");
      KT.pill(ctx, "진열장 한 변 = " + lenStr(n), CX + CS / 2 + 10, H - 10, { a: "center", s: 12.5, c: "#d0bfff", box: [0, LW] });
      /* 오른쪽 사다리 카드 */
      var cd = sideCard(ctx, 622, W, H, "크기의 사다리 (10배씩)");
      function yOfN(e) { return H - 22 - (e + 15) * ((H - 66) / 41); }
      var LX = 682;
      var lg = ctx.createLinearGradient(0, H - 22, 0, 44); lg.addColorStop(0, LT.violet); lg.addColorStop(0.45, LT.yellow); lg.addColorStop(1, LT.blue);
      ctx.strokeStyle = lg; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(LX, 44); ctx.lineTo(LX, H - 22); ctx.stroke(); ctx.lineCap = "butt";
      for (var e = -15; e <= 26; e++) { ctx.strokeStyle = "rgba(20,40,90,.3)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(LX - 7, yOfN(e)); ctx.lineTo(LX + 7, yOfN(e)); ctx.stroke(); }
      LADDER.forEach(function (e) {
        lt(ctx, "10" + sup(e), LX - 12, yOfN(e) + 4, { s: 11, a: "right", c: LT.mute, w: "800" });
        lt(ctx, PLACES[String(e)][1], LX + 14, yOfN(e) + 4, { s: 11.5, c: e === n ? LT.orange : LT.ink, w: e === n ? "900" : "700" });
      });
      KT.planet(ctx, LX, yOfN(n), 8, "#ffe8a3", "#c77700");
      ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(LX, yOfN(n), 12, 0, 6.2832); ctx.stroke();
      lt(ctx, "큰 쪽 ▲", W - 18, 28, { s: 11, a: "right", c: LT.dim });
      lt(ctx, "작은 쪽 ▼", W - 18, H - 10, { s: 11, a: "right", c: LT.dim });
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
    /* 나무 막대자(한 칸 = 10배) 미니어처: 윗면에 기준 물건들이 서 있고, 두 깃발 핀을 꽂아 그 사이를 잰다 */
      var d = Math.abs(eB - eA), LW = 640, RY = 196, RD = 46, ox = RD * 0.5, oy = RD * 0.3;
      function X(e) { return 36 + (e + 15) / 41 * 534; }
      KT.studio(ctx, 0, 0, LW, H, { x: 330, y: RY + 26, rx: 330, ry: 20 });
      KT.bigText(ctx, d === 0 ? "같은 크기" : "10" + sup(d) + " 배 차이", 18, 44, 30, "#ffffff");
      KT.bigText(ctx, "지수 " + Math.max(eA, eB) + " − (" + Math.min(eA, eB) + ") = " + d, 18, 74, 18, "#ffd35a");
      /* 두꺼운 나무 막대자(윗면 + 앞면 + 옆면) */
      floorShadow(ctx, 330, RY + 28, 320, 12, 0.25);
      slab(ctx, 18, RY, 570, 24, RD, "#ecd3a5", "#bb8f59", "#93693c");
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(18, RY, 570, 2);
      ctx.strokeStyle = "rgba(120,80,40,.18)"; ctx.lineWidth = 1;
      for (var gi = 0; gi < 5; gi++) { ctx.beginPath(); ctx.moveTo(22 + gi * 7, RY - 6 - gi * 6); ctx.lineTo(584 + gi * 7, RY - 6 - gi * 6); ctx.stroke(); }
      /* 사이 구간: 막대자 윗면에 보라색 띠 */
      var xa = X(eA), xb = X(eB), lo = Math.min(xa, xb), hi = Math.max(xa, xb);
      if (hi - lo > 1) {
        ctx.fillStyle = "rgba(112,72,232,.30)"; ctx.beginPath(); ctx.moveTo(lo, RY); ctx.lineTo(lo + RD, RY - RD * 0.6); ctx.lineTo(hi + RD, RY - RD * 0.6); ctx.lineTo(hi, RY); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(112,72,232,.45)"; ctx.fillRect(lo, RY, hi - lo, 24);
      }
      /* 눈금(앞 모서리) + 지수 글자(앞면) */
      for (var e = -15; e <= 26; e++) {
        var gx = X(e), big = (e + 15) % 5 === 0;
        ctx.strokeStyle = "#4a3418"; ctx.lineWidth = big ? 1.6 : 0.8;
        ctx.beginPath(); ctx.moveTo(gx, RY); ctx.lineTo(gx + (big ? 9 : 5), RY - (big ? 5.4 : 3)); ctx.stroke();
        if (big) lt(ctx, "10" + sup(e), gx, RY + 17, { s: 12, a: "center", c: "#fff8ec", w: "900" });
      }
      /* 기준 물건(윗면 뒤쪽에 선 작은 소품) */
      refs.forEach(function (r, i) {
        var x = X(r.e) + ox + 8, y = RY - oy - 4;
        ctx.fillStyle = "rgba(60,40,20,.22)"; ctx.beginPath(); ctx.ellipse(x + 3, y + 2, 9, 3, 0, 0, 6.2832); ctx.fill();
        lt(ctx, r.i, x, y, { s: 17, a: "center" });
        lt(ctx, r.t, X(r.e), i % 2 ? RY + 58 : RY + 42, { s: 12, a: "center", c: LT.mute, w: "800" });
      });
      /* 두 깃발 핀(막대자 윗면에 꽂힘) */
      function flag(x, name, colr) {
        var bx = x + ox * 0.5, by = RY - oy * 0.5, top = 100;
        ctx.fillStyle = "rgba(20,30,50,.28)"; ctx.beginPath(); ctx.ellipse(bx + 4, by + 1, 7, 2.5, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = metal(ctx, bx - 2, 0, bx + 2, 0); ctx.fillRect(bx - 1.5, top, 3, by - top);
        ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
        var fg = ctx.createLinearGradient(bx, top, bx + 36, top + 22); fg.addColorStop(0, colr); fg.addColorStop(1, KT.tint(colr === LT.orange ? "#e8590c" : "#1c7ed6", 0.75));
        ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(bx + 1.5, top); ctx.quadraticCurveTo(bx + 18, top + 4, bx + 34, top + 11); ctx.quadraticCurveTo(bx + 18, top + 16, bx + 1.5, top + 22); ctx.closePath(); ctx.fill(); ctx.restore();
        lt(ctx, name, bx + 12, top + 16, { s: 12, w: "900", c: "#ffffff" });
        KT.planet(ctx, bx, top, 4.5, "#ffffff", colr);
        return bx;
      }
      var sep = Math.abs(xa - xb) < 30 ? 8 : 0;
      var fa = flag(xa - sep, "A", LT.orange), fb = flag(xb + sep, "B", LT.blue);
      if (d > 0 && Math.abs(fb - fa) > 1) {
        var l2 = Math.min(fa, fb), h2 = Math.max(fa, fb);
        ctx.strokeStyle = LT.violet; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(l2, 92); ctx.lineTo(h2, 92); ctx.moveTo(l2, 85); ctx.lineTo(l2, 99); ctx.moveTo(h2, 85); ctx.lineTo(h2, 99); ctx.stroke();
        KT.pill(ctx, "× 10" + sup(d), (l2 + h2) / 2, 86, { a: "center", s: 13, c: "#d0bfff", box: [0, LW] });
      }
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 650, W, H, "두 표지 비교"), px = cd.px, R = cd.R;
      lt(ctx, d === 0 ? "1 배" : "10" + sup(d) + " 배", px, 62, { s: 26, w: "900", c: LT.violet });
      KT.row(ctx, "표지 A", "10" + sup(eA) + " m", px, R, 94, LT.orange);
      lt(ctx, "가까운 기준 " + near(eA), R, 112, { s: 12, a: "right", c: LT.mute });
      KT.row(ctx, "표지 B", "10" + sup(eB) + " m", px, R, 136, LT.blue);
      lt(ctx, "가까운 기준 " + near(eB), R, 154, { s: 12, a: "right", c: LT.mute });
      KT.row(ctx, "자릿수 차이", d + " 자리", px, R, 180, LT.violet);
      KT.bar(ctx, px, 188, cd.w, d / 41, LT.violet);
      KT.tip(ctx, d === 20 ? "10²⁰ 배를 맞췄습니다" : "목표: 10²⁰ 배 차이 만들기", px - 4, 208, cd.w + 8, d === 20 ? true : null);
      lt(ctx, "배율 = 10^(큰 지수 − 작은 지수)", px, 262, { s: 12, c: LT.mute });
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
      var LW = 652, TY = 200, TD = 40;
      function X(nn) { return 62 + (clamp(nn, 5, 26) - 5) / 21 * 520; }
      KT.studio(ctx, 0, 0, LW, H, { x: 330, y: TY + 24, rx: 330, ry: 16 });
      KT.bigText(ctx, "빛으로 " + timeStr(t), 18, 44, 29, "#ffd35a");
      KT.bigText(ctx, "거리 " + sciStr(d, 1) + " m", 18, 72, 17, "#ffffff");
      KT.warn(ctx, LW - 12, 26, "⚠ 한 칸마다 10배씩 늘어나는 길", "right");
      /* 시간 단위 띠로 칠한 두꺼운 길(윗면 + 앞면) */
      floorShadow(ctx, 330, TY + 26, 300, 10, 0.22);
      var x0 = 62, BCL = { "초": "#20c997", "분": "#4dabf7", "시간": "#9775fa", "일": "#fcc419", "년": "#ff6b6b" };
      bands.forEach(function (b) {
        var x1 = X(b.to), c0 = BCL[b.t];
        slab(ctx, x0, TY, Math.max(0, x1 - x0), 22, TD, KT.tint(c0, 1.12), KT.tint(c0, 0.9), null);
        if (x1 - x0 > 26) lt(ctx, b.t, (x0 + x1) / 2, TY + 16, { s: 12, w: "900", a: "center", c: "#ffffff" });
        x0 = x1;
      });
      var e0 = X(26);
      ctx.fillStyle = KT.tint(BCL["년"], 0.7); ctx.beginPath(); ctx.moveTo(e0, TY); ctx.lineTo(e0 + TD, TY - TD * 0.6); ctx.lineTo(e0 + TD, TY + 22 - TD * 0.6); ctx.lineTo(e0, TY + 22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(62, TY + .5); ctx.lineTo(e0, TY + .5); ctx.stroke();
      /* 이정표: 길 뒤쪽 모서리에 꽂힌 작은 팻말 */
      marks.forEach(function (m, i) {
        var x = X(m.n) + TD * 0.8, yb = TY - TD * 0.48, yt = i % 2 ? 108 : 132;
        ctx.fillStyle = metal(ctx, x - 1.5, 0, x + 1.5, 0); ctx.fillRect(x - 1, yt, 2.4, yb - yt);
        ctx.fillStyle = "rgba(20,30,50,.25)"; ctx.beginPath(); ctx.ellipse(x + 3, yb, 5, 2, 0, 0, 6.2832); ctx.fill();
        KT.pill(ctx, m.t, clamp(x, 70, 600), yt - 2, { a: "center", s: 12, c: "#ffffff", box: [0, LW] });
      });
      /* 손전등(받침 위) → 빛줄기 → 도착점 공 */
      var by = TY - TD * 0.3 - 26, cx = X(n) + TD * 0.3;
      floorShadow(ctx, 40, TY - 10, 24, 5, 0.3);
      cylV(ctx, 40, by + 6, TY - 12, 6, 2.5, "#f3f5f8", "#aab3c3", "#5b6476");
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
      tubeH(ctx, 18, 50, by, 9, "#ffffff", "#8a94a8", "#3a4152");
      ctx.fillStyle = metal(ctx, 0, by - 13, 0, by + 13, "#ffffff", "#8a94a8", "#3a4152"); ctx.beginPath(); ctx.moveTo(48, by - 9); ctx.lineTo(58, by - 13); ctx.lineTo(58, by + 13); ctx.lineTo(48, by + 9); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.fillStyle = "#fff3bf"; ctx.beginPath(); ctx.ellipse(58, by, 3, 12, 0, 0, 6.2832); ctx.fill();
      var bm = ctx.createLinearGradient(58, 0, Math.max(66, cx), 0); bm.addColorStop(0, "rgba(255,212,59,.85)"); bm.addColorStop(1, "rgba(255,169,77,.35)");
      ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(58, by - 8); ctx.lineTo(Math.max(62, cx), by - 2); ctx.lineTo(Math.max(62, cx), by + 2); ctx.lineTo(58, by + 8); ctx.closePath(); ctx.fill();
      for (var k = 0; k < 6; k++) { var px = 58 + ((ph + k / 6) % 1) * (cx - 58); if (cx - 58 > 12) KT.glow(ctx, px, by, 2.6, "rgba(255,190,60,.95)", 2.6); }
      ctx.fillStyle = metal(ctx, cx - 1.5, 0, cx + 1.5, 0); ctx.fillRect(cx - 1.2, by, 2.4, TY - TD * 0.3 - by);
      ctx.fillStyle = "rgba(20,30,50,.3)"; ctx.beginPath(); ctx.ellipse(cx + 3, TY - TD * 0.3, 7, 2.5, 0, 0, 6.2832); ctx.fill();
      KT.planet(ctx, cx, by, 11, "#a5d8ff", "#1c4f8a");
      KT.pill(ctx, "여기까지", Math.max(cx, 110), by + 30, { a: "center", s: 12, c: "#ffffff", box: [0, LW] });
      lt(ctx, "빛의 속력 299,792,458 m/s — 1초에 지구를 일곱 바퀴 반", 18, H - 12, { s: 12, c: LT.mute, w: "800" });
      /* 오른쪽 카드 */
      var cd = sideCard(ctx, 662, W, H, "빛이 걸리는 시간"), qx = cd.px, R = cd.R, okA = Math.abs(t - 1) <= 0.1, okB = Math.abs(t / YEAR - 1) <= 0.1;
      lt(ctx, timeStr(t), qx, 60, { s: 24, w: "900", c: LT.orange });
      KT.row(ctx, "거리 d", sciStr(d, 1) + " m", qx, R, 92, LT.blue);
      KT.row(ctx, "속력 c", "3.00 × 10⁸ m/s", qx, R, 114);
      KT.row(ctx, "t = d ÷ c", t < 1e4 ? t.toPrecision(3) + " s" : sciStr(t, 2) + " s", qx, R, 136, LT.violet);
      lt(ctx, "목표 ① 약 1초", qx, 164, { s: 12, c: LT.mute }); lt(ctx, (got.a || okA) ? "✓" : "", R, 164, { s: 14, w: "900", a: "right", c: LT.green });
      lt(ctx, "목표 ② 약 1년 (1 광년)", qx, 186, { s: 12, c: LT.mute }); lt(ctx, (got.b || okB) ? "✓" : "", R, 186, { s: 14, w: "900", a: "right", c: LT.green });
      KT.tip(ctx, okA ? "빛이 1초에 가는 거리" : okB ? "1 광년 = 9.46 × 10¹⁵ m" : "‘약 1초’와 ‘약 1년’을 찾아요", qx - 4, 200, cd.w + 8, okA || okB ? true : null);
      lt(ctx, "1 광년 = 빛이 1년 동안 간 거리", qx, H - 14, { s: 12, c: LT.mute });
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
      KT.studio(ctx, 0, 0, LW, H, { x: 360, y: 186, rx: 300, ry: 16 });
      KT.bigText(ctx, T.name, 18, 42, 24, "#ffffff");
      KT.bigText(ctx, T.full + " " + T.unit, 18, 70, 16, "#ffd35a");
      /* 왼쪽 받침대 위 작은 모형: 그 수가 가리키는 것 */
      var mx = 74, my = 196;
      floorShadow(ctx, mx + 6, my + 30, 52, 9, 0.25);
      cylV(ctx, mx, my, my + 26, 46, 13, "#ffffff", "#e9eef5", "#b9c3d2", "#f6f8fb");
      if (ti === 0) {
        var by = my - 22;
        tubeH(ctx, mx - 34, mx - 6, by, 8, "#ffffff", "#8a94a8", "#3a4152");
        ctx.fillStyle = metal(ctx, 0, by - 11, 0, by + 11, "#ffffff", "#8a94a8", "#3a4152"); ctx.beginPath(); ctx.moveTo(mx - 7, by - 8); ctx.lineTo(mx + 2, by - 11); ctx.lineTo(mx + 2, by + 11); ctx.lineTo(mx - 7, by + 8); ctx.closePath(); ctx.fill();
        var bm = ctx.createLinearGradient(mx + 2, 0, mx + 60, 0); bm.addColorStop(0, "rgba(255,212,59,.9)"); bm.addColorStop(1, "rgba(255,169,77,0)");
        ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(mx + 2, by - 7); ctx.lineTo(mx + 62, by - 18); ctx.lineTo(mx + 62, by + 18); ctx.lineTo(mx + 2, by + 7); ctx.closePath(); ctx.fill();
        cylV(ctx, mx - 20, by + 8, my - 2, 3, 1.2, "#f3f5f8", "#aab3c3", "#5b6476");
      } else if (ti === 1) {
        ctx.fillStyle = "rgba(20,30,50,.2)"; ctx.beginPath(); ctx.ellipse(mx + 2, my + 1, 14, 4, 0, 0, 6.2832); ctx.fill();
        var bg = ctx.createLinearGradient(mx - 10, 0, mx + 10, 0); bg.addColorStop(0, "#74c0fc"); bg.addColorStop(1, "#1c4f8a");
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(mx - 9, my - 58, 18, 40, 8); ctx.fill();
        ctx.fillStyle = "#2b2f3a"; ctx.fillRect(mx - 8, my - 22, 7, 22); ctx.fillRect(mx + 1, my - 22, 7, 22);
        KT.planet(ctx, mx, my - 68, 9, "#ffe3c8", "#c98a5a");
        /* 돋보기 속 세포 */
        ctx.strokeStyle = "#5b6476"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mx + 30, my - 34); ctx.lineTo(mx + 40, my - 20); ctx.stroke();
        ctx.fillStyle = "rgba(220,240,255,.85)"; ctx.beginPath(); ctx.arc(mx + 26, my - 46, 16, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "#5b6476"; ctx.lineWidth = 2.5; ctx.stroke();
        [[-7, -5], [5, -8], [0, 4], [9, 4], [-8, 7]].forEach(function (q) { KT.planet(ctx, mx + 26 + q[0], my - 46 + q[1], 3.6, "#ffc9c9", "#c92a2a"); });
      } else {
        var ay = my - 44;
        ctx.strokeStyle = "rgba(28,126,214,.6)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(mx, ay, 40, 15, -0.25, 0, 6.2832); ctx.stroke();
        KT.planet(ctx, mx, ay, 8, "#ffa8a8", "#a51111");
        KT.planet(ctx, mx + 36, ay - 12, 4.5, "#a5d8ff", "#1c4f8a");
        cylV(ctx, mx, ay + 10, my - 2, 2, 1, "#f3f5f8", "#aab3c3", "#5b6476");
      }
      /* 숫자 나무 블록이 놓인 쟁반 — 소수점(노란 구슬)이 칸을 뛰어 옮겨 간다 */
      var dg = digits(T), q = dg.o - p, lo = Math.min(0, q), hi = Math.max(dg.D.length, q), cnt = hi - lo;
      var tw = Math.min(36, 440 / cnt), x0 = 384 - cnt * tw / 2, ty = 118, th = 40, fn = 0, dd = Math.min(12, tw * 0.32);
      while (fn < dg.D.length - 1 && dg.D[fn] === "0") fn++;
      slab(ctx, x0 - 14, ty + th, cnt * tw + 28, 12, 30, "#e2c497", "#a87d4f", "#8a6540");
      for (var j = lo; j < hi; j++) {
        var ghost = j < 0 || j >= dg.D.length, ch = ghost ? "0" : dg.D[j], X = x0 + (j - lo) * tw, sig = !ghost && j >= fn;
        if (ghost) {
          ctx.fillStyle = "rgba(225,235,248,.55)"; ctx.fillRect(X + 2, ty, tw - 4, th);
          ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = "rgba(20,40,90,.35)"; ctx.lineWidth = 1.2; ctx.strokeRect(X + 2, ty, tw - 4, th); ctx.restore();
        } else {
          slab(ctx, X + 2, ty, tw - 4, th, dd, sig ? "#f6e3bf" : "#e6e9ef", sig ? "#e7c690" : "#d3d9e3", sig ? "#b8935a" : "#a9b2c2");
        }
        lt(ctx, ch, X + tw / 2, ty + 28, { s: Math.min(22, tw * 0.62), w: "900", a: "center", c: ghost ? LT.dim : (sig ? "#3b2a12" : LT.mute) });
      }
      lt(ctx, T.unit, x0 + cnt * tw + 46, ty + 30, { s: 13, c: LT.mute, w: "800" });
      var xo = x0 + (dg.o - lo) * tw, xq = x0 + (q - lo) * tw, dy = ty + th + 20;
      ctx.strokeStyle = "rgba(20,40,90,.45)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xo, dy, 4.5, 0, 6.2832); ctx.stroke();
      if (p !== 0) {
        ctx.save(); ctx.strokeStyle = LT.orange; ctx.lineWidth = 2.4; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(xo, ty - 14); ctx.quadraticCurveTo((xo + xq) / 2, ty - 46, xq, ty - 14); ctx.stroke(); ctx.restore();
        KT.arrow(ctx, { x: xq + (xo - xq) * 0.05, y: ty - 20 }, { x: xq, y: ty - 12 }, LT.orange, 2.4, 10);
      }
      floorShadow(ctx, xq + 2, dy + 6, 9, 3, 0.3);
      KT.planet(ctx, xq, dy, 7, "#ffe066", "#c77700");
      var move = p === 0 ? "소수점을 아직 옮기지 않았습니다" : (p > 0 ? "소수점을 왼쪽으로 " + p + "칸 옮김" : "소수점을 오른쪽으로 " + (-p) + "칸 옮김");
      KT.pill(ctx, "● " + move, 384, dy + 28, { a: "center", s: 12, c: "#ffd35a", box: [150, LW] });
      KT.bigText(ctx, aStr(A) + " × 10" + sup(p) + " " + T.unit, 384, H - 12, 26, ok ? "#8ce99a" : "#ffffff", "center");
      /* 오른쪽 판정 카드 */
      var cd = sideCard(ctx, 650, W, H, "과학적 표기 판정"), px = cd.px, R = cd.R;
      lt(ctx, ok ? "올바른 표기" : (A >= 10 ? "계수가 너무 큼" : "계수가 너무 작음"), px, 60, { s: 20, w: "900", c: ok ? LT.green : LT.orange });
      KT.row(ctx, "계수 A", aStr(A), px, R, 92, ok ? LT.green : LT.orange);
      KT.row(ctx, "지수 n (옮긴 칸 수)", (p > 0 ? "+" : "") + p, px, R, 116, LT.violet);
      KT.row(ctx, "규칙", "1 ≤ A < 10", px, R, 140);
      KT.tip(ctx, ok ? "유효숫자 두 자리: " + sciStr(T.val, 1) : (A >= 10 ? "소수점을 더 왼쪽으로" : "소수점을 오른쪽으로 되돌려요"), px - 4, 154, cd.w + 8, ok ? true : false);
      var dn = ["a", "b", "c"].filter(function (kk) { return got[kk]; }).length + (ok && !got[T.key] ? 1 : 0);
      lt(ctx, "고친 수 " + dn + " / 3", px, 212, { s: 12, w: "900", c: LT.ink });
      KT.bar(ctx, px, 220, cd.w, dn / 3, LT.green);
      lt(ctx, "왼쪽으로 옮기면 +, 오른쪽은 −", px, H - 12, { s: 12, c: LT.mute });
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
