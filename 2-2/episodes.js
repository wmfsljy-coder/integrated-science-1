/* 통합과학1 Ⅱ-2 물질의 규칙성과 성질 — 소단원별 이야기 네 편
   01 빈칸이 있는 표 / 02 녹이면 통한다 / 03 같은 부품, 다른 물건 / 04 거꾸로 가는 물질
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is1-2-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function log10(x) { return Math.log(x) / Math.LN10; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
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
function chip(ctx, x, y, w, h, col) { ctx.fillStyle = v(col); ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill(); }
function mark(ctx, ok, s, x, y, o) {
  o = o || {};
  text(ctx, (ok ? "✅ " : "⬜ ") + s, x, y, { s: o.s || 12, w: "800", a: o.a || "left", c: ok ? v("--green-700") : v("--mist") });
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
  function val(i) { var s = SHELL[i]; return s[s.length - 1]; }

  window.sthGate({
    gate: "g1", key: "period1", title: "조사관의 첫 추리",
    question: "멘델레예프는 1869년에 <b>아직 발견되지도 않은 원소</b>의 원자량과 밀도를 표의 빈칸에 적어 두었고, 17년 뒤 그 값이 거의 맞는 것으로 드러났습니다. 어떻게 그럴 수 있었을까요?",
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
      paper(ctx1, 900, 300);
      text(ctx1, "주기율표 (원자 번호 1 ~ 20)", 40, 26, { s: 13.5, w: "800" });
      var x0 = 40, y0 = 48, cw = 44, ch = 40, i;
      var gl = [1, 2, 13, 14, 15, 16, 17, 18];
      for (i = 0; i < 8; i++) text(ctx1, gl[i] + "족", x0 + i * cw + (cw - 3) / 2, 42, { s: 9, a: "center", c: v("--mist") });
      for (i = 1; i <= 4; i++) text(ctx1, i + "주기", x0 - 8, y0 + (i - 1) * ch + 25, { s: 9, a: "right", c: v("--mist") });
      for (i = 0; i < 20; i++) {
        var x = x0 + colOf(i) * cw, y = y0 + (PER[i] - 1) * ch, on = (i + 1 === z);
        ctx1.fillStyle = on ? v("--brand") : (METAL[i + 1] ? v("--amber-100") : v("--card-2"));
        ctx1.fillRect(x, y, cw - 3, ch - 3);
        ctx1.strokeStyle = on ? v("--brand-700") : v("--line"); ctx1.lineWidth = on ? 2 : 1;
        ctx1.strokeRect(x, y, cw - 3, ch - 3);
        text(ctx1, SYM[i], x + (cw - 3) / 2, y + 18, { s: 13, w: "900", a: "center", c: on ? v("--on-accent") : v("--ink") });
        text(ctx1, String(val(i)), x + (cw - 3) / 2, y + 31, { s: 9.5, w: "800", a: "center", c: on ? v("--on-accent") : v("--teal-700") });
      }
      text(ctx1, "칸 아래 작은 숫자 = 원자가 전자 수 · 노란 칸은 금속", x0, 226, { s: 10.5, c: v("--mist") });

      /* 전자 껍질 */
      var sh = SHELL[z - 1], cx = 560, cy = 128, k, j;
      for (k = 0; k < sh.length; k++) {
        var r = 26 + k * 22;
        ctx1.strokeStyle = v("--line"); ctx1.lineWidth = 1.5;
        ctx1.beginPath(); ctx1.arc(cx, cy, r, 0, Math.PI * 2); ctx1.stroke();
        for (j = 0; j < sh[k]; j++) {
          var a = -Math.PI / 2 + j * 2 * Math.PI / sh[k];
          var last = (k === sh.length - 1);
          ctx1.fillStyle = v(last ? "--coral" : "--mist");
          ctx1.beginPath(); ctx1.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, last ? 5 : 3.5, 0, Math.PI * 2); ctx1.fill();
        }
      }
      ctx1.fillStyle = v("--violet"); ctx1.beginPath(); ctx1.arc(cx, cy, 15, 0, Math.PI * 2); ctx1.fill();
      text(ctx1, "+" + z, cx, cy + 4, { s: 11, w: "900", a: "center", c: v("--on-accent") });
      text(ctx1, "전자 껍질 — 붉은 점이 원자가 전자", cx, 226, { s: 10.5, a: "center", c: v("--mist") });

      /* 오른쪽 정보 */
      var ix = 700;
      text(ctx1, SYM[z - 1] + " · " + KOR[z - 1], ix, 70, { s: 17, w: "900", c: v("--brand-700") });
      text(ctx1, "원자 번호 " + z + " · " + PER[z - 1] + "주기 " + GRP[z - 1] + "족", ix, 92, { s: 11.5, w: "800", c: v("--mist") });
      text(ctx1, "전자 배치  " + sh.join(", "), ix, 120, { s: 12, w: "800" });
      text(ctx1, "원자가 전자  " + val(z - 1) + "개", ix, 142, { s: 12, w: "800", c: v("--coral-700") });
      text(ctx1, "원자 반지름  " + RAD[z - 1] + " pm", ix, 164, { s: 12, w: "800", c: v("--teal-700") });
      text(ctx1, "이온화 에너지", ix, 186, { s: 12, w: "800", c: v("--violet-700") });
      text(ctx1, IE[z - 1].toLocaleString() + " kJ/mol", ix, 204, { s: 12, w: "800", c: v("--violet-700") });

      mark(ctx1, got.ones.length >= 4, "원자가 전자 1개 (" + got.ones.length + "/4)", 40, 252);
      mark(ctx1, got.ie, "이온화 에너지 1위", 300, 252);
      mark(ctx1, got.rad, "원자 반지름 1위", 540, 252);
      text(ctx1, "가로줄을 따라가면 원자가 전자가 1개씩 늘고, 8개를 채우면 다음 줄에서 다시 1개부터 시작합니다.", 40, 280, { s: 11.5, c: v("--mist") });
    }

    function series(ctx, vals, X0, X1, Y0, Y1, col, title, unit) {
      var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), i;
      function px(i) { return X0 + i / 19 * (X1 - X0); }
      function py(x) { return Y1 - (x - mn) / (mx - mn) * (Y1 - Y0); }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X0, Y0 - 6); ctx.lineTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.strokeStyle = v(col); ctx.lineWidth = 2.5; ctx.beginPath();
      for (i = 0; i < 20; i++) { if (i === 0) ctx.moveTo(px(i), py(vals[i])); else ctx.lineTo(px(i), py(vals[i])); }
      ctx.stroke();
      for (i = 0; i < 20; i++) {
        var on = (i + 1 === z);
        ctx.fillStyle = on ? v("--coral") : v(col);
        ctx.beginPath(); ctx.arc(px(i), py(vals[i]), on ? 6.5 : 3, 0, Math.PI * 2); ctx.fill();
      }
      text(ctx, title, X0, Y0 - 12, { s: 12, w: "800", c: v(col) });
      text(ctx, "최대 " + mx.toLocaleString() + unit, X1, Y0 - 12, { s: 10.5, a: "right", c: v("--mist") });
      var lx = clamp(px(z - 1), X0 + 46, X1 - 96);
      text(ctx, vals[z - 1].toLocaleString() + unit, lx, py(vals[z - 1]) - 12, { s: 11.5, w: "900", a: "center", c: v("--coral-700") });
      return px;
    }

    function drawTrend() {
      paper(ctx2, 900, 300);
      text(ctx2, "원자 번호에 따른 되풀이 — 톱니 모양이 보이나요?", 40, 22, { s: 13.5, w: "800" });
      var X0 = 70, X1 = 855;
      series(ctx2, RAD, X0, X1, 62, 140, "--teal", "원자 반지름 (pm)", " pm");
      var px = series(ctx2, IE, X0, X1, 190, 262, "--violet", "1차 이온화 에너지 (kJ/mol)", "");
      for (var i = 0; i < 20; i++) {
        text(ctx2, SYM[i], px(i), 282, { s: 9.5, a: "center", w: (i + 1 === z) ? "900" : "500", c: (i + 1 === z) ? v("--coral-700") : v("--mist") });
      }
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

    function cell(x, y, w, h, o, hit) {
      ctx.fillStyle = v(hit ? "--brand-100" : "--card-2");
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
      ctx.strokeStyle = v(hit ? "--brand" : "--line"); ctx.lineWidth = 2;
      ctx.setLineDash(hit ? [5, 4] : []); ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.stroke(); ctx.setLineDash([]);
      if (!o) {
        text(ctx, "?", x + w / 2, y + h / 2 + 4, { s: 26, w: "900", a: "center", c: v("--brand-700") });
        text(ctx, "에카규소", x + w / 2, y + h - 8, { s: 10.5, w: "800", a: "center", c: v("--brand-700") });
        return;
      }
      text(ctx, o.s, x + w / 2, y + 22, { s: 15, w: "900", a: "center" });
      text(ctx, o.k, x + w / 2, y + 36, { s: 10, a: "center", c: v("--mist") });
      text(ctx, "원자량 " + o.m.toFixed(2), x + w / 2, y + 50, { s: 10.5, w: "800", a: "center", c: v("--violet-700") });
      text(ctx, "밀도 " + o.d.toFixed(2), x + w / 2, y + 62, { s: 10.5, w: "800", a: "center", c: v("--teal-700") });
    }

    function line(y, lo, hi, cur, lr, ud, tgt, ok, title, fmt, unit) {
      var X0 = 430, X1 = 860;
      function px(x) { return X0 + (clamp(x, lo, hi) - lo) / (hi - lo) * (X1 - X0); }
      text(ctx, title, X0, y - 50, { s: 12.5, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X1, y); ctx.stroke();
      text(ctx, fmt(lo), X0, y + 34, { s: 10, c: v("--mist") });
      text(ctx, fmt(hi), X1, y + 34, { s: 10, a: "right", c: v("--mist") });
      function tick(x, lab, col, up) {
        var gx = px(x);
        ctx.strokeStyle = v(col); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(gx, y - 9); ctx.lineTo(gx, y + 9); ctx.stroke();
        text(ctx, lab, clamp(gx, X0 + 52, X1 - 52), y - 15 - (up || 0), { s: 10, w: "800", a: "center", c: v(col) });
      }
      tick(lr, "왼·오른 평균 " + fmt(lr), "--teal-700");
      tick(ud, "위·아래 평균 " + fmt(ud), "--amber-700", 16);
      if (ok) {
        var tx = px(tgt);
        ctx.strokeStyle = v("--green"); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(tx, y - 14); ctx.lineTo(tx, y + 14); ctx.stroke();
        text(ctx, "네 이웃 평균 " + fmt(tgt), clamp(tx, X0 + 60, X1 - 60), y + 30, { s: 10.5, w: "900", a: "center", c: v("--green-700") });
      }
      var cx = px(cur);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(cx, y, 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, "내 예측 " + fmt(cur) + unit, clamp(cx, X0 + 62, X1 - 72), y + 48, { s: 12, w: "900", a: "center", c: v("--coral-700") });
    }

    function f2(x) { return x.toFixed(2); }

    function draw() {
      paper(ctx, 900, 420);
      text(ctx, "1871년 · 빈칸의 성질을 이웃으로 예측하기", 40, 28, { s: 13.5, w: "800" });
      var cw = 108, chh = 72, cx = 210, cy = 200;
      cell(cx - cw / 2, cy - chh / 2 - 84, cw, chh, N.up, false);
      cell(cx - cw / 2, cy - chh / 2 + 84, cw, chh, N.down, false);
      cell(cx - cw / 2 - 118, cy - chh / 2, cw, chh, N.left, false);
      cell(cx - cw / 2 + 118, cy - chh / 2, cw, chh, N.right, false);
      cell(cx - cw / 2, cy - chh / 2, cw, chh, null, true);
      text(ctx, "성질이 표를 따라 고르게 변한다면", 210, 320, { s: 11.5, a: "center", c: v("--mist") });
      text(ctx, "빈칸의 값은 이웃들의 가운데에 있어야 합니다", 210, 338, { s: 11.5, a: "center", c: v("--mist") });

      line(120, 60, 86, am, AM_LR, AM_UD, AM_T, got.a, "① 원자량 예측", function (x) { return x.toFixed(1); }, "");
      line(268, 4, 7, de, DE_LR, DE_UD, DE_T, got.d, "② 밀도 예측 (g/cm³)", f2, " g/cm³");

      mark(ctx, got.a, "원자량 맞힘", 430, 360);
      mark(ctx, got.d, "밀도 맞힘", 620, 360);
      if (got.a && got.d) {
        text(ctx, "1886년 빈클러의 실측 — 저마늄 원자량 72.63 · 밀도 5.32 g/cm³", 430, 390, { s: 12, w: "900", c: v("--green-700") });
      } else {
        text(ctx, "두 눈금을 모두 맞히면 1886년의 실측값을 보여 드립니다", 430, 390, { s: 11, c: v("--mist") });
      }
      text(ctx, "🚧 표의 빈칸", 40, 390, { s: 11.5, w: "800", c: v("--brand-700") });
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
      m += got.a ? "① 원자량 <b>맞혔습니다</b>. 네 이웃의 평균은 <b>" + AM_T.toFixed(2) + "</b> 입니다. "
                 : "① 원자량 예측 <b>" + am.toFixed(1) + "</b> — 네 이웃의 평균보다 " + hint(am - AM_T, "am") + " ";
      m += "<br>";
      m += got.d ? "② 밀도 <b>맞혔습니다</b>. 네 이웃의 평균은 <b>" + DE_T.toFixed(2) + " g/cm³</b> 입니다."
                 : "② 밀도 예측 <b>" + de.toFixed(2) + "</b> — 네 이웃의 평균보다 " + hint(de - DE_T, "de");
      if (got.a && got.d) m += "<br>멘델레예프가 적어 둔 값은 원자량 72, 밀도 5.5 였고, 실제 저마늄은 <b>72.63</b> 과 <b>5.32</b> 였습니다. 이웃만 보고도 이만큼 맞힐 수 있었던 것은 성질이 <b>규칙적으로</b> 변하기 때문입니다.";
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
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>이웃 네 개의 평균만으로 원자량 <b>72.9</b>, 밀도 <b>5.32 g/cm³</b> 를 얻었습니다. 1886년에 실제로 잰 저마늄은 <b>72.63</b> 과 <b>5.32</b> — 표가 예언을 한 셈입니다.");
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
    var fam = "g1", per = 2;
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
        name: "18족 · 비활성 기체", val: 8, ion: "없음", act: "주지도 받지도 않는다", col: "--violet",
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

    function draw() {
      paper(ctx, 900, 400);
      var F = FAM[fam], e = cur(), R = react();
      text(ctx, F.name + " — " + e.p + "주기 " + e.k, 40, 28, { s: 14, w: "800", c: v(F.col) });

      /* 원자 그림 */
      var cx = 180, cy = 170, i, j;
      for (i = 0; i < e.sh.length; i++) {
        var r = 24 + i * 22;
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        var cnt = Math.min(e.sh[i], 12), last = (i === e.sh.length - 1);
        for (j = 0; j < cnt; j++) {
          var a = -Math.PI / 2 + j * 2 * Math.PI / cnt;
          ctx.fillStyle = v(last ? F.col : "--mist");
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, last ? 5 : 3, 0, Math.PI * 2); ctx.fill();
        }
        if (e.sh[i] > 12) text(ctx, "…", cx + r + 10, cy + 4, { s: 11, c: v("--mist") });
      }
      ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
      text(ctx, e.s, cx, cy + 4, { s: 12, w: "900", a: "center", c: v("--on-accent") });
      text(ctx, "원자가 전자 " + F.val + "개", cx, 296, { s: 12.5, w: "900", a: "center", c: v(F.col) });
      text(ctx, F.act, cx, 316, { s: 11.5, a: "center", c: v("--mist") });

      /* 오른쪽 */
      var ix = 360;
      chip(ctx, ix, 52, 500, 62, "--card-2");
      text(ctx, "만들어지는 이온", ix + 16, 74, { s: 11, c: v("--mist") });
      text(ctx, F.ion === "없음" ? "이온이 되지 않는다" : e.s + (F.ion === "+1" ? "⁺" : "⁻"), ix + 16, 100, { s: 20, w: "900", c: v(F.col) });
      text(ctx, fam === "g1" ? "이온화 에너지 " + e.n + " kJ/mol" : (fam === "g17" ? "전기음성도 " + e.n.toFixed(2) : "바깥 껍질이 이미 8개"),
        ix + 484, 100, { s: 12, w: "800", a: "right", c: v("--mist") });

      text(ctx, "반응성 (0 ~ 100 상대 눈금)", ix, 148, { s: 12, w: "800" });
      var bx = ix, bw = 420;
      ctx.fillStyle = v("--card-2"); ctx.fillRect(bx, 158, bw, 28);
      ctx.fillStyle = v(F.col); ctx.fillRect(bx, 158, bw * R / 100, 28);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.strokeRect(bx, 158, bw, 28);
      text(ctx, R + "", 860, 180, { s: 16, w: "900", a: "right", c: v(F.col) });

      /* 같은 족의 세 원소 비교 */
      text(ctx, "같은 세로줄 안에서의 자리", ix, 218, { s: 12, w: "800" });
      for (i = 0; i < F.list.length; i++) {
        var q = F.list[i], on = q.p === per, yy = 230 + i * 26;
        var rr = fam === "g1" ? Math.round((560 - q.n) / 1.6) : (fam === "g17" ? Math.round((q.n - 2.4) / 1.6 * 100) : 0);
        text(ctx, q.p + "주기 " + q.k, ix, yy + 14, { s: 11.5, w: on ? "900" : "500", c: on ? v(F.col) : v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(ix + 130, yy + 3, 300, 14);
        ctx.fillStyle = v(on ? F.col : "--line"); ctx.fillRect(ix + 130, yy + 3, 300 * rr / 100, 14);
        text(ctx, String(rr), 860, yy + 14, { s: 11, w: "800", a: "right", c: on ? v(F.col) : v("--mist") });
      }

      mark(ctx, got.a, "1족 1위", 40, 348);
      mark(ctx, got.b, "17족 1위", 180, 348);
      mark(ctx, got.c, "이온이 안 되는 줄", 340, 348);
      text(ctx, "세로줄이 같으면 원자가 전자 수가 같고, 행동도 닮습니다", 860, 348, { s: 11, a: "right", c: v("--mist") });
      text(ctx, e.w.replace(/<[^>]+>/g, ""), 40, 380, { s: 11.5, c: v("--mist") });
      $("a-rx-info").innerHTML = "<b>" + e.k + " (" + e.s + ")</b> — " + e.w + "<br>" +
        (fam === "g1" ? "1족은 아래로 갈수록 원자 반지름이 커져 바깥 전자를 느슨하게 붙잡습니다. 그래서 이온화 에너지가 <b>작아지고</b> 반응은 <b>격렬해집니다</b>."
        : fam === "g17" ? "17족은 위로 갈수록 원자 반지름이 작아 전자를 세게 끌어당깁니다. 그래서 <b>플루오린이 가장 반응성이 큽니다</b>. 1족과 <b>반대 방향</b>이라는 점에 주의하세요."
        : "18족은 바깥 껍질이 이미 8개(헬륨은 2개)라 더 얻거나 잃을 까닭이 없습니다. 다른 원소가 <b>8개를 채우려고</b> 결합하는 것이라면, 이 줄은 이미 목적지에 있는 셈입니다.");
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
    onSeg("a-fam", function (b) { fam = b.getAttribute("data-f"); draw(); check(); });
    $("a-per").addEventListener("input", function (e) { per = +e.target.value; $("a-per-val").textContent = per + "주기"; draw(); check(); });
    window.sthPick({
      mount: "s1-q",
      q: "원소의 성질이 주기적으로 되풀이되는 가장 근본적인 까닭은?",
      options: [
        "원자량이 일정하게 늘어나기 때문",
        "원자 번호가 커지면서 <b>원자가 전자 수</b>가 1 → 8 을 되풀이하기 때문",
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
      (p.indexOf("㉡") === 0 ? "처음부터 정확했습니다. 이제 그 ‘되풀이’의 정체가 <b>원자가 전자 수</b>라는 것까지 말할 수 있게 되었네요."
        : "정답은 ㉡ 입니다. 원자가 전자 수가 1부터 8까지 갔다가 다시 1로 돌아오기 때문에 성질도 되풀이되고, 그래서 빈칸도 이웃으로 <b>계산</b>할 수 있었습니다.");
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
    var pair = "nacl", n = 0;
    var got = window.sthState("bMake") || { nacl: false, mgo: false, h2o: false, ch4: false };
    var H2 = { s: "H", k: "수소", v: 1, t: 2 };
    var MAT = {
      nacl: { kind: "ion", need: 1, nm: "염화 나트륨 NaCl", A: { s: "Na", k: "나트륨", v: 1 }, B: { s: "Cl", k: "염소", v: 7 },
              w: "금속인 나트륨이 전자 1개를 <b>내주고</b>, 비금속인 염소가 그것을 <b>받습니다</b>. Na⁺ 와 Cl⁻ 가 서로 끌어당겨 결정을 이룹니다." },
      mgo:  { kind: "ion", need: 2, nm: "산화 마그네슘 MgO", A: { s: "Mg", k: "마그네슘", v: 2 }, B: { s: "O", k: "산소", v: 6 },
              w: "마그네슘은 전자 <b>2개</b>를 내주고 산소는 2개를 받습니다. 전하가 ±2 로 커서 끌어당기는 힘이 훨씬 세고, 그래서 녹는점이 2,852 ℃ 나 됩니다." },
      h2o:  { kind: "cov", need: 2, nm: "물 H₂O", C: { s: "O", k: "산소", v: 6, t: 8 }, O: [H2, H2],
              w: "산소가 수소 두 개와 전자쌍을 <b>하나씩 나누어</b> 씁니다. 산소는 8개, 수소는 2개를 채웁니다." },
      ch4:  { kind: "cov", need: 4, nm: "메테인 CH₄", C: { s: "C", k: "탄소", v: 4, t: 8 }, O: [H2, H2, H2, H2],
              w: "탄소는 원자가 전자가 4개라 <b>네 방향</b>으로 결합을 만듭니다. 탄소 화합물이 그토록 다양한 까닭입니다." },
      o2:   { kind: "cov", need: 2, nm: "산소 O₂", C: { s: "O", k: "산소", v: 6, t: 8 }, O: [{ s: "O", k: "산소", v: 6, t: 8 }],
              w: "산소 원자 둘이 전자쌍을 <b>두 쌍</b> 나눠 씁니다(이중 결합). 우리가 숨 쉬는 산소는 이렇게 만들어진 분자입니다." }
    };
    function perOut(M) { return M.need / M.O.length; }
    function assign(M, i) { return clamp(n - i * perOut(M), 0, perOut(M)); }

    function atom(x, y, r, sym, cnt, col, lab) {
      ctx.fillStyle = v(col); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      text(ctx, sym, x, y + 6, { s: r > 40 ? 20 : 14, w: "900", a: "center", c: v("--on-accent") });
      var i, rr = r + 13;
      for (i = 0; i < cnt; i++) {
        var a = -Math.PI / 2 + i * 2 * Math.PI / Math.max(cnt, 1);
        ctx.fillStyle = v("--ink");
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 4.5, 0, Math.PI * 2); ctx.fill();
      }
      if (lab) text(ctx, lab, x, y + r + 32, { s: 11.5, w: "800", a: "center", c: v("--mist") });
    }

    function draw() {
      paper(ctx, 900, 420);
      var M = MAT[pair], stable = false, i;
      text(ctx, M.nm + " 만들기", 40, 28, { s: 14, w: "800", c: v("--brand-700") });
      text(ctx, "검은 점 = 가장 바깥 껍질의 전자 (원자가 전자)", 860, 28, { s: 11, a: "right", c: v("--mist") });

      if (M.kind === "ion") {
        var bad = n > M.A.v;
        var av = Math.max(M.A.v - n, 0), bv = M.B.v + Math.min(n, M.A.v);
        atom(280, 190, 52, M.A.s, av, "--coral", M.A.k + " · 바깥 전자 " + av + "개");
        atom(620, 190, 52, M.B.s, bv, "--teal", M.B.k + " · 바깥 전자 " + bv + "개");
        if (n > 0 && !bad) {
          ctx.strokeStyle = v("--amber"); ctx.fillStyle = v("--amber"); ctx.lineWidth = 2.5;
          for (i = 0; i < n; i++) window.drawArrow(ctx, 346, 172 + i * 22, 554, 172 + i * 22, 10);
          text(ctx, "전자 " + n + "개 이동", 450, 152, { s: 12, w: "900", a: "center", c: v("--amber-700") });
        }
        stable = (av === 0 && bv === 8 && !bad);
        if (stable) {
          var chg = n === 1 ? "" : sup(n);
          text(ctx, M.A.s + chg + "⁺", 280, 118, { s: 19, w: "900", a: "center", c: v("--coral-700") });
          text(ctx, M.B.s + chg + "⁻", 620, 118, { s: 19, w: "900", a: "center", c: v("--teal-700") });
          ctx.strokeStyle = v("--green"); ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
          ctx.beginPath(); ctx.moveTo(346, 190); ctx.lineTo(554, 190); ctx.stroke(); ctx.setLineDash([]);
          text(ctx, "＋ 와 － 가 끌어당긴다 — 이온 결합", 450, 262, { s: 13, w: "900", a: "center", c: v("--green-700") });
        }
        text(ctx, bad ? "❌ " + M.A.k + "에는 내줄 전자가 " + M.A.v + "개뿐입니다" :
          (stable ? "✅ 두 원자 모두 안정해졌습니다" : "옮긴 전자 " + n + "개 — 아직 8개(또는 0개)가 되지 않았습니다"),
          450, 300, { s: 13, w: "900", a: "center", c: v(bad ? "--rose-700" : (stable ? "--green-700" : "--mist")) });
      } else {
        var C = M.C, cnt = M.O.length, ok = true;
        var cc = C.v + Math.min(n, M.need);
        var pos = [];
        if (cnt === 1) pos = [[620, 190]];
        else if (cnt === 2) pos = [[300, 120], [600, 120]];
        else pos = [[450, 82], [450, 318], [286, 200], [614, 200]];
        var ccx = cnt === 1 ? 300 : 450, ccy = cnt === 2 ? 236 : 200;
        for (i = 0; i < cnt; i++) {
          var a2 = assign(M, i), ov = M.O[i].v + a2;
          if (ov !== M.O[i].t) ok = false;
          ctx.strokeStyle = v(a2 > 0 ? "--brand" : "--line"); ctx.lineWidth = a2 > 1 ? 7 : (a2 > 0 ? 4 : 1.5);
          ctx.setLineDash(a2 > 0 ? [] : [5, 4]);
          ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(pos[i][0], pos[i][1]); ctx.stroke(); ctx.setLineDash([]);
          atom(pos[i][0], pos[i][1], M.O[i].s === "H" ? 26 : 46, M.O[i].s, ov, M.O[i].s === "H" ? "--amber" : "--teal",
            M.O[i].s + " · " + ov + "개" + (ov === M.O[i].t ? " ✅" : ""));
        }
        atom(ccx, ccy, 50, C.s, cc, "--violet", C.k + " · 바깥 전자 " + cc + "개" + (cc === C.t ? " ✅" : ""));
        stable = ok && cc === C.t && n === M.need;
        text(ctx, "나눠 쓰는 전자쌍 " + n + "쌍 — 굵은 선 하나가 전자쌍 하나입니다", 450, 392, { s: 12, w: "800", a: "center", c: v("--mist") });
        text(ctx, stable ? "✅ 모든 원자가 8개(수소는 2개)를 채웠습니다 — 공유 결합" : "아직 채우지 못한 원자가 있습니다",
          450, 414, { s: 13, w: "900", a: "center", c: v(stable ? "--green-700" : "--mist") });
      }

      if (M.kind === "ion") {
        mark(ctx, got.nacl, "염화 나트륨", 40, 348, { s: 11.5 });
        mark(ctx, got.mgo, "산화 마그네슘", 190, 348, { s: 11.5 });
        mark(ctx, got.h2o, "물", 370, 348, { s: 11.5 });
        mark(ctx, got.ch4, "메테인", 470, 348, { s: 11.5 });
        text(ctx, "금속 + 비금속 → 주고받는다", 860, 348, { s: 11, a: "right", c: v("--mist") });
        text(ctx, "비금속 + 비금속 → 같이 쓴다", 860, 372, { s: 11, a: "right", c: v("--mist") });
      } else {
        mark(ctx, got.nacl, "염화 나트륨", 40, 348, { s: 11.5 });
        mark(ctx, got.mgo, "산화 마그네슘", 190, 348, { s: 11.5 });
        mark(ctx, got.h2o, "물", 40, 372, { s: 11.5 });
        mark(ctx, got.ch4, "메테인", 140, 372, { s: 11.5 });
      }

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
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>안정해지는 방법은 둘뿐이었습니다. <b>주고받기(이온 결합)</b> 와 <b>같이 쓰기(공유 결합)</b>. 어느 쪽을 택하는지는 만나는 원자가 금속인지 비금속인지가 정합니다.");
        ep.clear(1);
      }
    }
    function label() {
      var M = MAT[pair];
      $("b-n-label").textContent = M.kind === "ion" ? "옮길 전자 수" : "나눠 쓸 전자쌍 수";
      $("b-n-val").textContent = n + (M.kind === "ion" ? "개" : "쌍");
    }
    cv._redraw = draw;
    onSeg("b-pair", function (b) { pair = b.getAttribute("data-p"); label(); check(); });
    $("b-n").addEventListener("input", function (e) { n = +e.target.value; label(); check(); });
    label(); draw(); mission();
  })();

  /* ------------------------------------------------ 장면 3 — 성질 시험대 */
  (function () {
    var cv = $("b-prop"), ctx = window.setupCanvas(cv);
    var sub = "nacl", wet = false, T = 20;
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
      if (md === "aq") return sub === "nacl" ? "물에 녹으면 Na⁺ 와 Cl⁻ 가 <b>따로 떨어져 물 속을 돌아다닙니다</b>. 움직이는 전하가 생겼으므로 전기가 통합니다."
        : (sub === "sugar" ? "설탕은 물에 잘 녹지만, 녹아도 <b>분자 그대로</b> 떠다닐 뿐 이온이 되지 않습니다. 움직이는 전하가 없어 전기가 통하지 않습니다."
        : "순수한 물에는 움직일 수 있는 이온이 거의 없어 전기가 <b>거의</b> 통하지 않습니다. 수돗물이 통하는 것은 녹아 있는 이온 때문입니다.");
      if (sub === "nacl") return phase(S) === "고체"
        ? "고체 소금에서는 Na⁺ 와 Cl⁻ 가 <b>제자리에 꽉 묶여</b> 있습니다. 전하가 있어도 움직이지 못하므로 전기가 통하지 않습니다."
        : "802 ℃ 를 넘겨 녹이자 이온들이 <b>풀려나 움직입니다</b>. 1807년 데이비가 본 것이 바로 이 장면입니다.";
      if (sub === "sugar") return phase(S) === "고체"
        ? "설탕 결정은 <b>분자</b>가 쌓여 있는 것입니다. 전하를 띤 알갱이가 아예 없습니다."
        : "녹여서 액체로 만들어도 <b>분자가 움직일 뿐</b> 전하는 없습니다. 그래서 전기가 통하지 않습니다. (실제 설탕은 녹으면서 서서히 분해됩니다.)";
      return "순수한 물은 대부분 중성 분자라 전기가 거의 통하지 않습니다.";
    }

    function draw() {
      paper(ctx, 900, 400);
      var S = SUB[sub], md = mode(), ph = phase(S), c = conduct(), i, j;
      text(ctx, S.k + " (" + S.f + ") · " + S.bond, 40, 28, { s: 14, w: "800", c: v(S.col) });
      text(ctx, md === "aq" ? "수용액" : (md === "ice" ? "얼어붙음" : ph), 430, 28, { s: 14, w: "900", a: "right", c: v("--violet-700") });

      /* 왼쪽 — 입자 그림 */
      var bx = 50, by = 52, bw = 380, bh = 230;
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.stroke();
      var ionic = (sub === "nacl"), metal = (sub === "cu");
      var free = c && !(metal && false);
      if (md === "aq") {
        ctx.globalAlpha = 0.18; ctx.fillStyle = v("--brand");
        ctx.beginPath(); ctx.roundRect(bx + 6, by + 6, bw - 12, bh - 12, 12); ctx.fill(); ctx.globalAlpha = 1;
      }
      for (i = 0; i < 6; i++) for (j = 0; j < 4; j++) {
        var ordered = (ph === "고체" && md !== "aq");
        var jx = ordered ? 0 : ((i * 37 + j * 53) % 23) - 11;
        var jy = ordered ? 0 : ((i * 61 + j * 29) % 21) - 10;
        var px = bx + 46 + i * 58 + jx, py = by + 44 + j * 50 + jy;
        if (md === "aq" && !S.dis && !metal) { if (i > 2 || j > 1) continue; }
        if (metal) {
          ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.arc(px, py, 13, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(px + 15, py - 13, 4, 0, Math.PI * 2); ctx.fill();
        } else if (ionic && (md === "aq" || ph !== "고체")) {
          var pos = (i + j) % 2 === 0;
          ctx.fillStyle = v(pos ? "--coral" : "--teal");
          ctx.beginPath(); ctx.arc(px, py, 13, 0, Math.PI * 2); ctx.fill();
          text(ctx, pos ? "+" : "−", px, py + 5, { s: 14, w: "900", a: "center", c: v("--on-accent") });
        } else if (ionic) {
          var pos2 = (i + j) % 2 === 0;
          ctx.fillStyle = v(pos2 ? "--coral" : "--teal");
          ctx.fillRect(px - 13, py - 13, 26, 26);
          text(ctx, pos2 ? "+" : "−", px, py + 5, { s: 14, w: "900", a: "center", c: v("--on-accent") });
        } else {
          ctx.fillStyle = v(S.col); ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fill();
          text(ctx, "0", px, py + 4, { s: 10, w: "800", a: "center", c: v("--on-accent") });
        }
      }
      text(ctx, metal ? "🟡 자유 전자가 금속 전체를 돌아다닌다"
        : (ionic ? ((md === "aq" || ph !== "고체") ? "＋ － 이온이 자유롭게 움직인다" : "＋ － 이온이 제자리에 묶여 있다")
        : "전하를 띠지 않은 분자뿐"), bx + bw / 2, by + bh + 22, { s: 12, w: "800", a: "center", c: v("--mist") });

      /* 오른쪽 — 회로 */
      var rx = 470;
      text(ctx, "전기 전도성 시험", rx, 52, { s: 13, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rx + 20, 200); ctx.lineTo(rx + 20, 110); ctx.lineTo(rx + 150, 110);
      ctx.moveTo(rx + 230, 110); ctx.lineTo(rx + 360, 110); ctx.lineTo(rx + 360, 200);
      ctx.stroke();
      /* 전구 */
      var lx = rx + 190, ly = 110;
      ctx.fillStyle = v(c ? "--amber" : "--card-2");
      ctx.beginPath(); ctx.arc(lx, ly, 32, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v(c ? "--amber-700" : "--line"); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(lx, ly, 32, 0, Math.PI * 2); ctx.stroke();
      if (c) {
        ctx.strokeStyle = v("--amber"); ctx.lineWidth = 3;
        for (i = 0; i < 8; i++) {
          var an = i * Math.PI / 4;
          ctx.beginPath();
          ctx.moveTo(lx + Math.cos(an) * 40, ly + Math.sin(an) * 40);
          ctx.lineTo(lx + Math.cos(an) * 52, ly + Math.sin(an) * 52);
          ctx.stroke();
        }
      }
      text(ctx, c ? "💡" : "○", lx, ly + 8, { s: 22, a: "center", c: v(c ? "--abyss" : "--mist") });
      text(ctx, c ? "전구가 켜졌다 — 전기가 통한다" : "전구가 켜지지 않는다", lx, ly + 66, { s: 13, w: "900", a: "center", c: v(c ? "--green-700" : "--mist") });
      /* 시료 그릇 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rx + 10, 210); ctx.lineTo(rx + 10, 274); ctx.lineTo(rx + 370, 274); ctx.lineTo(rx + 370, 210); ctx.stroke();
      ctx.fillStyle = v(md === "aq" ? "--brand-100" : (ph === "고체" ? "--card-2" : "--coral-100"));
      ctx.fillRect(rx + 13, 224, 354, 48);
      ctx.fillStyle = v("--mist"); ctx.fillRect(rx + 20, 196, 14, 44); ctx.fillRect(rx + 346, 196, 14, 44);
      text(ctx, md === "aq" ? S.k + " 수용액" : S.k + " " + ph, rx + 190, 254, { s: 13, w: "900", a: "center", c: v("--ink") });
      text(ctx, "나르개: " + (c ? (metal ? "자유 전자" : "이온") : "없음"), rx + 190, 296, { s: 11.5, w: "800", a: "center", c: v("--mist") });

      text(ctx, "녹는점 " + S.mp + " ℃" + (S.bp < 9000 ? " · 끓는점 " + S.bp + " ℃" : " (녹으면서 분해)"), 40, 320, { s: 12, w: "800", c: v("--mist") });
      mark(ctx, got.a, "소금 녹이기", 40, 350, { s: 11.5 });
      mark(ctx, got.b, "소금물", 190, 350, { s: 11.5 });
      mark(ctx, got.c, "설탕 녹이기", 300, 350, { s: 11.5 });
      mark(ctx, got.d, "구리 녹이기", 460, 350, { s: 11.5 });
      text(ctx, "움직일 수 있는 전하가 있어야 통한다", 860, 350, { s: 11, a: "right", c: v("--mist") });
      text(ctx, "현재 온도 " + T + " ℃ · " + (md === "aq" ? "물에 녹인 상태" : (md === "ice" ? "물이 얼어 있는 상태" : (wet ? "물이 끓어 날아간 상태" : "그대로"))), 40, 380, { s: 11.5, c: v("--mist") });
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
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>녹는점과 전기 전도성 두 가지만으로 결합을 가려냈습니다. <b>높은 녹는점 + 녹이면 통함 = 이온 결합</b>, <b>낮은 녹는점 + 끝까지 통하지 않음 = 공유 결합(분자)</b> 입니다.");
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
        { t: "시료 ㉰ — 녹는점 2,852 ℃ · 고체 ✕ · 녹인 것 ○", a: "ion", why: "±2 가 이온이라 끌어당기는 힘이 아주 셉니다. 산화 마그네슘이었습니다." },
        { t: "시료 ㉱ — 녹는점 186 ℃ · 고체 ✕ · 녹인 것 ✕ · 물에 녹인 것 ✕", a: "cov", why: "물에 잘 녹지만 이온이 되지 않습니다. 설탕이었습니다.", hint: "물에 녹는다고 다 이온은 아닙니다." },
        { t: "시료 ㉲ — 녹는점 770 ℃ · 고체 ✕ · 물에 녹인 것 ○", a: "ion", why: "물에 녹자 이온이 풀려났습니다. 염화 칼륨이었습니다." },
        { t: "시료 ㉳ — 녹는점 0 ℃ · 액체 ✕ · 다른 것을 녹이면 ○", a: "cov", why: "스스로는 거의 통하지 않지만 이온을 녹이면 통하게 해 줍니다. 물이었습니다.", hint: "녹는점 0 ℃ 인 이 물질은 무엇일까요?" }
      ],
      doneText: "여섯 시료의 정체가 모두 드러났습니다.",
      onDone: function () { sorted = true; window.sthState("bSort", 1); mission(); }
    });
    window.sthPick({
      mount: "s2-q",
      q: "인류의 생존에 꼭 필요한 <b>물(H₂O)</b>, <b>산소(O₂)</b>, <b>소금(NaCl)</b> 을 결합에 따라 나누면?",
      options: [
        "셋 다 이온 결합이다",
        "물과 산소는 공유 결합, 소금은 이온 결합이다",
        "물과 소금은 이온 결합, 산소는 공유 결합이다",
        "셋 다 공유 결합이다"
      ],
      answer: 1,
      why: [
        "물과 산소는 비금속 원소끼리 만난 것이라 이온이 되지 않습니다. 그래서 녹는점이 낮고 전기가 통하지 않습니다.",
        "물(수소+산소)과 산소(산소+산소)는 <b>비금속끼리</b>라 전자를 같이 쓰고, 소금은 <b>금속(나트륨) + 비금속(염소)</b> 이라 전자를 주고받습니다.",
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
      (p.indexOf("㉡") === 0 ? "정확했습니다. 이제 ‘왜 설탕은 그렇지 않은가’까지 설명할 수 있게 되었네요."
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
    question: "감람석 · 휘석 · 운모 · 석영은 모두 같은 부품인 <b>규산염 사면체(SiO₄)</b> 로 만들어졌습니다. 그런데 성질이 전혀 다릅니다. 무엇이 다른 걸까요?",
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
        w: "사면체 <b>둘이 산소 하나</b>를 나눠 쓰며 짝을 이룹니다. 독립형과 사슬형 사이에 있는 구조입니다." },
      { nm: "사슬형", fx: "SiO₃²⁻", ratio: "1 : 3", min: "휘석 (사슬 두 줄이면 각섬석)", col: "--teal",
        w: "산소 <b>두 개</b>를 나눠 쓰며 사슬처럼 길게 이어집니다. 사슬과 사슬 사이가 약해 거의 직각인 <b>두 방향</b>으로 쪼개집니다." },
      { nm: "판상", fx: "Si₂O₅²⁻", ratio: "1 : 2.5", min: "흑운모 · 백운모 · 점토 광물", col: "--violet",
        w: "산소 <b>세 개</b>를 나눠 써서 넓은 판을 이룹니다. 판 안쪽은 튼튼하지만 판과 판 사이는 약해, <b>한 방향으로 얇게</b> 벗겨집니다." },
      { nm: "망상", fx: "SiO₂", ratio: "1 : 2", min: "석영 · 장석", col: "--brand",
        w: "산소 <b>네 개를 모두</b> 나눠 써서 삼차원 그물이 됩니다. 약한 면이 없어 쪼개짐이 없고 매우 단단합니다. 모래알이 바로 이것입니다." }
    ];
    function tet(cx, cy, r, shares) {
      var pts = [[0, -r], [r * 0.88, r * 0.52], [-r * 0.88, r * 0.52]], i;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath();
      for (i = 0; i < 3; i++) { if (i === 0) ctx.moveTo(cx + pts[i][0], cy + pts[i][1]); else ctx.lineTo(cx + pts[i][0], cy + pts[i][1]); }
      ctx.closePath(); ctx.stroke();
      for (i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + pts[i][0], cy + pts[i][1]); ctx.stroke(); }
      for (i = 0; i < 3; i++) {
        ctx.fillStyle = v(i < shares ? "--amber" : "--coral");
        ctx.beginPath(); ctx.arc(cx + pts[i][0], cy + pts[i][1], r * 0.21, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = v(shares > 3 ? "--amber" : "--coral");
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.42, r * 0.18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.arc(cx, cy, r * 0.27, 0, Math.PI * 2); ctx.fill();
      text(ctx, "Si", cx, cy + r * 0.11, { s: r * 0.28, w: "900", a: "center", c: v("--on-accent") });
    }
    function draw() {
      paper(ctx, 900, 420);
      var S = ST[sh], i, j;
      text(ctx, "규산염 사면체 — 이웃과 나눠 쓰는 산소 " + sh + "개", 40, 28, { s: 14, w: "800", c: v(S.col) });
      text(ctx, "🔴 혼자 쓰는 산소   🟠 이웃과 나눠 쓰는 산소   🟢 규소", 40, 48, { s: 11, c: v("--mist") });
      if (sh === 0) {
        for (i = 0; i < 3; i++) tet(150 + i * 170, 190, 44, 0);
      } else if (sh === 1) {
        for (j = 0; j < 2; j++) for (i = 0; i < 2; i++) tet(150 + j * 220 + i * 74, 190, 42, i === 0 ? 1 : 1);
      } else if (sh === 2) {
        for (i = 0; i < 6; i++) tet(105 + i * 78, 190 + (i % 2 ? 16 : -16), 38, 2);
      } else if (sh === 3) {
        for (j = 0; j < 2; j++) for (i = 0; i < 6; i++) tet(105 + i * 78 + (j ? 34 : 0), 130 + j * 108, 34, 3);
      } else {
        for (j = 0; j < 3; j++) for (i = 0; i < 6; i++) tet(100 + i * 76 + (j % 2 ? 36 : 0), 110 + j * 80, 30, 4);
      }
      var ix = 640;
      chip(ctx, ix - 10, 66, 250, 224, "--card-2");
      text(ctx, S.nm, ix + 4, 96, { s: 20, w: "900", c: v(S.col) });
      text(ctx, "단위 화학식", ix + 4, 126, { s: 10.5, c: v("--mist") });
      text(ctx, S.fx, ix + 4, 148, { s: 17, w: "900" });
      text(ctx, "규소 : 산소", ix + 4, 176, { s: 10.5, c: v("--mist") });
      text(ctx, S.ratio, ix + 4, 198, { s: 17, w: "900", c: v("--violet-700") });
      text(ctx, "대표 광물", ix + 4, 226, { s: 10.5, c: v("--mist") });
      text(ctx, S.min, ix + 4, 248, { s: 12.5, w: "800", c: v("--teal-700") });
      text(ctx, "산소 4 − " + sh + "/2 = " + (4 - sh / 2) + "개", ix + 4, 274, { s: 11.5, w: "800", c: v("--mist") });

      mark(ctx, got.a, "1 : 3 구조", 40, 330);
      mark(ctx, got.b, "1 : 2 구조", 200, 330);
      mark(ctx, got.c, "얇게 벗겨지는 구조", 360, 330);
      text(ctx, "나눠 쓴 산소는 두 사면체가 반씩 가진 셈입니다", 860, 330, { s: 11, a: "right", c: v("--mist") });
      text(ctx, "규소 하나가 차지하는 산소 수 = 4 − (나눠 쓰는 산소 수) ÷ 2. 이 값 하나가 광물의 이름을 정합니다.", 40, 362, { s: 11.5, c: v("--mist") });
      text(ctx, "지각 질량의 1위가 산소(46.6%), 2위가 규소(27.7%) 인 까닭도 여기에 있습니다.", 40, 388, { s: 11.5, c: v("--mist") });
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
    function formula() { return "C" + sup(n) + "H" + sup(shape === "chain" ? 2 * n + 2 : 2 * n); }
    function state() { return bp() > 25 ? "액체" : "기체"; }

    function draw() {
      paper(ctx, 900, 400);
      text(ctx, (shape === "chain" ? "사슬형" : "고리형") + " 탄화수소 · 탄소 " + n + "개", 40, 28, { s: 14, w: "800", c: v("--violet-700") });
      text(ctx, "탄소는 원자가 전자가 4개 — 결합을 네 개까지 만든다", 860, 28, { s: 11, a: "right", c: v("--mist") });
      var i, x, y;
      if (!ok()) {
        text(ctx, "🚫 탄소 " + n + "개로는 고리를 만들 수 없습니다", 450, 180, { s: 18, w: "900", a: "center", c: v("--rose-700") });
        text(ctx, "고리가 되려면 탄소가 적어도 3개는 있어야 합니다.", 450, 212, { s: 13, a: "center", c: v("--mist") });
        $("c-carb-info").innerHTML = "고리를 닫으려면 탄소가 <b>3개 이상</b> 있어야 합니다. 슬라이더를 오른쪽으로 옮기거나 사슬형으로 바꿔 보세요.";
        return;
      }
      var cxm = 430, cym = 176;
      if (shape === "chain") {
        var sp = Math.min(72, 600 / Math.max(1, n - 1));
        var x0 = cxm - (n - 1) * sp / 2;
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 3;
        for (i = 0; i < n - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(x0 + i * sp, cym + (i % 2 ? -26 : 26));
          ctx.lineTo(x0 + (i + 1) * sp, cym + ((i + 1) % 2 ? -26 : 26));
          ctx.stroke();
        }
        for (i = 0; i < n; i++) {
          x = x0 + i * sp; y = cym + (i % 2 ? -26 : 26);
          var hs = (i === 0 || i === n - 1) ? (n === 1 ? 4 : 3) : 2;
          ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2;
          for (var k = 0; k < hs; k++) {
            var a = -Math.PI / 2 + (k - (hs - 1) / 2) * 0.8 + (i % 2 ? Math.PI : 0);
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); ctx.stroke();
            ctx.fillStyle = v("--amber");
            ctx.beginPath(); ctx.arc(x + Math.cos(a) * 30, y + Math.sin(a) * 30, 7, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();
          text(ctx, "C", x, y + 5, { s: 13, w: "900", a: "center", c: v("--on-accent") });
        }
      } else {
        var R = 26 + n * 5.4;
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 3;
        ctx.beginPath();
        for (i = 0; i <= n; i++) {
          var an2 = -Math.PI / 2 + i * 2 * Math.PI / n;
          if (i === 0) ctx.moveTo(cxm + Math.cos(an2) * R, cym + Math.sin(an2) * R);
          else ctx.lineTo(cxm + Math.cos(an2) * R, cym + Math.sin(an2) * R);
        }
        ctx.stroke();
        for (i = 0; i < n; i++) {
          var an3 = -Math.PI / 2 + i * 2 * Math.PI / n;
          x = cxm + Math.cos(an3) * R; y = cym + Math.sin(an3) * R;
          ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2;
          for (var k2 = 0; k2 < 2; k2++) {
            var a3 = an3 + (k2 ? 0.45 : -0.45);
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a3) * 28, y + Math.sin(a3) * 28); ctx.stroke();
            ctx.fillStyle = v("--amber");
            ctx.beginPath(); ctx.arc(x + Math.cos(a3) * 28, y + Math.sin(a3) * 28, 7, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = v("--violet"); ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
          text(ctx, "C", x, y + 5, { s: 12, w: "900", a: "center", c: v("--on-accent") });
        }
      }
      text(ctx, "🟠 수소", 40, 52, { s: 11, c: v("--mist") });
      text(ctx, nm(), 40, 296, { s: 19, w: "900", c: v("--violet-700") });
      text(ctx, formula(), 40, 324, { s: 17, w: "900" });
      text(ctx, "끓는점 " + bp() + " ℃", 300, 296, { s: 13, w: "800", c: v("--mist") });
      text(ctx, "실온(25 ℃)에서 " + state(), 300, 324, { s: 16, w: "900", c: v(state() === "액체" ? "--brand-700" : "--teal-700") });
      mark(ctx, got.a, "실온에서 액체인 가장 작은 것", 500, 296, { s: 11.5 });
      mark(ctx, got.b, "C₈H₁₈ 확인", 500, 320, { s: 11.5 });
      mark(ctx, got.c, "고리형은 수소 2개 적음", 500, 344, { s: 11.5 });
      text(ctx, "탄소 수가 늘수록 분자가 무거워져 끓는점이 높아집니다. 같은 탄소 수라도 고리를 닫으면 수소 2개가 줄어듭니다.", 40, 380, { s: 11.5, c: v("--mist") });
      $("c-carb-info").innerHTML = "<b>" + nm() + "</b> · " + formula() + " · 끓는점 <b>" + bp() + " ℃</b> · 실온에서 <b>" + state() + "</b><br>" +
        (shape === "chain"
          ? "탄소가 " + n + "개인 사슬이라 수소는 2 × " + n + " + 2 = <b>" + (2 * n + 2) + "개</b> 입니다. 사슬 양 끝의 탄소는 수소 3개, 가운데 탄소는 2개를 붙잡습니다."
          : "고리를 닫으면서 양 끝이 서로 이어졌기 때문에, 같은 탄소 수의 사슬형보다 수소가 <b>2개 적은 " + 2 * n + "개</b> 입니다.") +
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
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>탄소 수가 4개까지는 기체, <b>5개(펜테인)</b> 부터 액체였습니다. 탄소를 어떻게 잇느냐(사슬 · 고리)만 바꿔도 분자식과 성질이 달라집니다.");
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
      var k = kinds(), c = count(), i;
      text(ctx, bio === "pro" ? "아미노산 20종을 이어 붙여 단백질 만들기" : "뉴클레오타이드 4종을 이어 붙여 DNA 만들기",
        40, 28, { s: 14, w: "800", c: v(bio === "pro" ? "--coral-700" : "--teal-700") });
      text(ctx, "단위체 " + k + "종 · " + len + "개를 이어 붙임", 860, 28, { s: 11.5, w: "800", a: "right", c: v("--mist") });

      /* 사슬 그림 */
      var x0 = 50, sp = Math.min(32, 800 / len), r = Math.min(13, sp / 2 - 1), y = 86;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (len - 1) * sp, y); ctx.stroke();
      for (i = 0; i < len; i++) {
        var ci = (i * 7 + len * 3) % (bio === "pro" ? 8 : 4);
        ctx.fillStyle = v(COL[ci]);
        ctx.beginPath(); ctx.arc(x0 + i * sp, y, r, 0, Math.PI * 2); ctx.fill();
      }
      text(ctx, bio === "pro" ? "구슬 하나 = 아미노산 하나 (20가지 가운데 하나)" : "구슬 하나 = 뉴클레오타이드 하나 (A · T · G · C 가운데 하나)",
        50, y + 34, { s: 11.5, c: v("--mist") });

      /* 가짓수 */
      chip(ctx, 50, 142, 380, 96, "--card-2");
      text(ctx, "만들 수 있는 서열의 가짓수", 66, 166, { s: 11, c: v("--mist") });
      text(ctx, k + sup(len) + " =", 66, 202, { s: 17, w: "800" });
      text(ctx, sci(c, 2) + " 가지", 414, 202, { s: 21, w: "900", a: "right", c: v("--violet-700") });
      text(ctx, c < 1e15 ? "= " + Math.round(c).toLocaleString() + " 가지" : "자릿수가 " + (Math.floor(log10(c)) + 1) + "자리입니다",
        66, 226, { s: 11, c: v("--mist") });

      /* 로그 막대 */
      var bx = 470, bw = 390, by = 150, bh = 26;
      text(ctx, "1조(10¹²) 기준선과 견주기 — 한 칸이 10배", bx, 140, { s: 11.5, w: "800" });
      var MAX = 34;
      ctx.fillStyle = v("--card-2"); ctx.fillRect(bx, by, bw, bh);
      var f = clamp(log10(c) / MAX, 0, 1);
      ctx.fillStyle = v(c > 1e12 ? "--green" : "--mist"); ctx.fillRect(bx, by, bw * f, bh);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, bw, bh);
      var tx = bx + bw * 12 / MAX;
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(tx, by - 10); ctx.lineTo(tx, by + bh + 10); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "1조", tx, by + bh + 24, { s: 11, w: "900", a: "center", c: v("--coral-700") });
      text(ctx, "10⁰", bx, by + bh + 24, { s: 10, c: v("--mist") });
      text(ctx, "10" + sup(MAX), bx + bw, by + bh + 24, { s: 10, a: "right", c: v("--mist") });
      text(ctx, c > 1e12 ? "✅ 1조 가지를 넘었습니다" : "아직 1조 가지에 못 미칩니다", bx, by + bh + 52,
        { s: 13, w: "900", c: v(c > 1e12 ? "--green-700" : "--mist") });

      mark(ctx, got.a, "아미노산으로 1조 넘기기 (최소 개수)", 50, 278, { s: 11.5 });
      mark(ctx, got.b, "뉴클레오타이드로 1조 넘기기 (최소 개수)", 50, 302, { s: 11.5 });
      text(ctx, "사람의 단백질 하나는 보통 아미노산 수백 개로 되어 있습니다.", 50, 336, { s: 11.5, c: v("--mist") });
      text(ctx, "사람의 DNA 는 염기쌍이 약 30억 개입니다.", 50, 360, { s: 11.5, c: v("--mist") });

      $("c-poly-info").innerHTML = "<b>" + (bio === "pro" ? "아미노산 20종" : "뉴클레오타이드 4종") + "</b> 을 <b>" + len + "개</b> 이어 붙이면 순서가 다른 서열을 <b>" + sci(c, 2) + " 가지</b> 만들 수 있습니다.<br>" +
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
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>아미노산은 <b>10개</b>, 뉴클레오타이드는 <b>20개</b> 만 이어 붙여도 1조 가지를 넘겼습니다. 다양성은 단위체의 종류가 아니라 <b>순서와 길이</b>에서 나옵니다.");
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
        { t: "RNA", a: "nu", why: "DNA 와 같은 단위체로 된 한 가닥 핵산입니다.", hint: "핵산은 DNA 만이 아닙니다." }
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
      (p.indexOf("㉡") === 0 ? "정확했습니다. 이제 그 ‘나눠 쓰는 산소 수’가 운모의 벗겨짐과 석영의 단단함까지 설명한다는 것을 보았네요."
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
    var gap = 1.1, T = 300;
    var got = window.sthState("dBand") || { a: false, b: false, c: false };
    function ratio() { return Math.exp(-gap / (2 * KB * T)); }
    function kind() { return gap < 0.3 ? 0 : (gap < 3.0 ? 1 : 2); }
    var KN = ["도체", "반도체", "절연체 (부도체)"];
    var KC = ["--teal", "--coral", "--violet"];
    var KE = ["구리 · 은 · 철 · 알루미늄", "저마늄 0.67 eV · 규소 1.12 eV", "다이아몬드 5.47 eV · 유리 · 고무"];

    function draw() {
      paper(ctx, 900, 420);
      var k = kind(), r = ratio(), i;
      text(ctx, "띠 간격 " + gap.toFixed(1) + " eV · 온도 " + T + " K", 40, 28, { s: 14, w: "800" });

      /* 왼쪽 — 분류 */
      chip(ctx, 40, 52, 250, 150, "--card-2");
      text(ctx, "이 물질은", 56, 78, { s: 11, c: v("--mist") });
      text(ctx, KN[k], 56, 112, { s: 24, w: "900", c: v(KC[k]) });
      text(ctx, "보기", 56, 142, { s: 11, c: v("--mist") });
      text(ctx, KE[k], 56, 164, { s: 11.5, w: "800", c: v(KC[k]) });
      text(ctx, "0.3 eV 미만 도체 · 3.0 eV 이상 절연체", 56, 188, { s: 10.5, c: v("--mist") });

      /* 가운데 — 띠 */
      var bx = 320, bw = 320, vTop = 330, gpx = gap * 34;
      var cBot = vTop - gpx, cTop = cBot - 50;
      ctx.fillStyle = v("--mist"); ctx.globalAlpha = 0.45;
      ctx.fillRect(bx, vTop, bw, 50); ctx.globalAlpha = 1;
      text(ctx, "원자가 띠 — 전자로 꽉 차 있다", bx + bw / 2, vTop + 30, { s: 11.5, w: "800", a: "center", c: v("--ink") });
      ctx.fillStyle = v(KC[k]); ctx.globalAlpha = 0.35;
      ctx.fillRect(bx, cTop, bw, 50); ctx.globalAlpha = 1;
      text(ctx, "전도띠 — 여기 올라온 전자가 전류를 나른다", bx + bw / 2, cTop + 30, { s: 11.5, w: "800", a: "center", c: v("--ink") });
      if (gpx > 6) {
        ctx.strokeStyle = v(KC[k]); ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
        ctx.strokeRect(bx, cBot, bw, gpx); ctx.setLineDash([]);
        text(ctx, "띠 간격 " + gap.toFixed(1) + " eV", bx + bw / 2, cBot + gpx / 2 + 5, { s: 13, w: "900", a: "center", c: v(KC[k]) });
      } else {
        text(ctx, "띠가 거의 붙어 있다", bx + bw / 2, cBot - 4, { s: 12, w: "900", a: "center", c: v(KC[k]) });
      }
      var nDot = clamp(Math.round(log10(Math.max(r, 1e-30)) + 13), 0, 12);
      for (i = 0; i < nDot; i++) {
        ctx.fillStyle = v("--amber");
        ctx.beginPath(); ctx.arc(bx + 24 + (i % 6) * 55, cTop + 16 + Math.floor(i / 6) * 20, 6, 0, Math.PI * 2); ctx.fill();
      }
      text(ctx, "🟡 건너뛴 전자 (그림은 어림)", bx + bw / 2, 398, { s: 11, a: "center", c: v("--mist") });

      /* 오른쪽 — 수치 */
      var ix = 670;
      text(ctx, "건너뛴 전자의 비율", ix, 78, { s: 12, w: "800" });
      text(ctx, "exp(−Eg / 2kBT)", ix, 98, { s: 10.5, c: v("--mist") });
      text(ctx, r > 1e-30 ? sci(r, 2) : "0 에 가깝다", 880, 132, { s: 19, w: "900", a: "right", c: v(KC[k]) });
      var by = 150, bh = 20, bw2 = 210;
      ctx.fillStyle = v("--card-2"); ctx.fillRect(ix, by, bw2, bh);
      var f = clamp((log10(Math.max(r, 1e-24)) + 24) / 24, 0, 1);
      ctx.fillStyle = v(KC[k]); ctx.fillRect(ix, by, bw2 * f, bh);
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

      $("d-band-info").innerHTML = "띠 간격 <b>" + gap.toFixed(1) + " eV</b> · 온도 <b>" + T + " K</b> · 이 물질은 <b style='color:var(" + KC[k] + ")'>" + KN[k] + "</b> · 건너뛴 전자 비율 <b>" + (r > 1e-30 ? sci(r, 2) : "0 에 가까움") + "</b><br>" +
        (k === 0 ? "원자가 띠와 전도띠가 겹치거나 틈이 거의 없습니다. 전자가 언제든 움직일 수 있어 <b>온도와 상관없이</b> 전기가 잘 통합니다. 오히려 온도를 올리면 원자의 떨림이 커져 전자가 부딪히므로 저항이 조금 <b>커집니다</b>."
        : k === 1 ? "틈이 어중간해서, 상온에서는 아주 일부만 건너뜁니다. 그런데 온도를 올리면 건너뛰는 전자가 <b>지수 함수로</b> 늘어나 전기가 훨씬 잘 통하게 됩니다. 금속과 정반대입니다."
        : "틈이 너무 넓어 상온의 열에너지(약 0.026 eV)로는 아무도 건너뛰지 못합니다. 그래서 전기가 통하지 않습니다.");
    }
    function check() {
      var ch = false, r = ratio(), k = kind();
      if (k === 0 && !got.a) { got.a = true; ch = true; }
      if (k === 2 && !got.b) { got.b = true; ch = true; }
      if (k === 1 && r > 1e-6 && !got.c) { got.c = true; ch = true; }
      if (ch) { window.sthState("dBand", got); mission(); }
    }
    function mission() {
      if (got.a) done("m4-2a");
      if (got.b) done("m4-2b");
      if (got.c) done("m4-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m4-2", true, "<span class='m-tag'>미션 완료</span>같은 식 하나로 <b>도체 · 반도체 · 절연체</b> 가 갈렸습니다. 그리고 반도체만은 온도를 올릴수록 전기가 <b>더 잘</b> 통했습니다 — 금속과 반대입니다.");
        ep.clear(1);
      }
    }
    cv._redraw = draw;
    $("d-gap").addEventListener("input", function (e) { gap = +e.target.value; $("d-gap-val").textContent = gap.toFixed(1); draw(); check(); });
    $("d-t").addEventListener("input", function (e) { T = +e.target.value; $("d-t-val").textContent = T + " K"; draw(); check(); });
    draw(); mission();
  })();

  /* ------------------------------------------------ 장면 3 — 도핑실 */
  (function () {
    var cv = $("d-dope"), ctx = window.setupCanvas(cv);
    var type = "pure", dop = 12;
    var got = window.sthState("dDope") || { a: false, b: false, c: false };
    var NI = 1.0e10;
    function N() { return Math.pow(10, dop); }
    function boost() { return type === "pure" ? 1 : (N() + NI) / NI; }

    function draw() {
      paper(ctx, 900, 420);
      var b = boost(), i, j;
      text(ctx, type === "pure" ? "순수한 규소" : (type === "n" ? "인(P)을 섞은 규소 — n형 반도체" : "붕소(B)를 섞은 규소 — p형 반도체"),
        40, 28, { s: 14, w: "800", c: v(type === "pure" ? "--mist" : (type === "n" ? "--teal-700" : "--coral-700")) });

      /* 규소 격자 */
      var x0 = 100, y0 = 110, sp = 110;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        if (i < 2) { ctx.beginPath(); ctx.moveTo(x0 + i * sp + 26, y0 + j * sp); ctx.lineTo(x0 + (i + 1) * sp - 26, y0 + j * sp); ctx.stroke(); }
        if (j < 2) { ctx.beginPath(); ctx.moveTo(x0 + i * sp, y0 + j * sp + 26); ctx.lineTo(x0 + i * sp, y0 + (j + 1) * sp - 26); ctx.stroke(); }
      }
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        var mid = (i === 1 && j === 1), sym = "Si", col = "--brand";
        if (mid && type === "n") { sym = "P"; col = "--teal"; }
        if (mid && type === "p") { sym = "B"; col = "--coral"; }
        ctx.fillStyle = v(col);
        ctx.beginPath(); ctx.arc(x0 + i * sp, y0 + j * sp, 25, 0, Math.PI * 2); ctx.fill();
        text(ctx, sym, x0 + i * sp, y0 + j * sp + 6, { s: 15, w: "900", a: "center", c: v("--on-accent") });
      }
      if (type === "n") {
        ctx.fillStyle = v("--amber");
        ctx.beginPath(); ctx.arc(x0 + sp + 42, y0 + sp - 38, 9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(52, 362, 7, 0, Math.PI * 2); ctx.fill();
        text(ctx, "남는 전자 ⊖ — 자유롭게 돌아다닌다", 66, 366, { s: 11.5, w: "800", c: v("--amber-700") });
      } else if (type === "p") {
        ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2.5; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(x0 + sp + 42, y0 + sp - 38, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(52, 362, 7, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, "전자가 빠진 자리 ⊕(양공) — 이 자리가 옮겨 다닌다", 66, 366, { s: 11.5, w: "800", c: v("--violet-700") });
      } else {
        text(ctx, "규소는 원자가 전자가 4개라 이웃 넷과 결합을 꽉 채웁니다", 40, 366, { s: 11.5, c: v("--mist") });
      }

      /* 오른쪽 */
      var ix = 470;
      chip(ctx, ix, 52, 390, 104, "--card-2");
      text(ctx, "1 cm³ 안의 전하 나르개 수", ix + 16, 76, { s: 11, c: v("--mist") });
      text(ctx, type === "pure" ? sci(NI, 1) + " 개 (고유 전자뿐)" : sci(N(), 1) + " 개", ix + 16, 108, { s: 18, w: "900", c: v("--violet-700") });
      text(ctx, type === "pure" ? "온도가 올라야만 늘어납니다" : ("나르개는 " + (type === "n" ? "⊖ 전자" : "⊕ 양공")), ix + 16, 136, { s: 11.5, w: "800", c: v("--mist") });

      text(ctx, "순수한 규소에 견준 전도도", ix, 190, { s: 12, w: "800" });
      text(ctx, b < 10 ? b.toFixed(1) + " 배" : (b >= 1e6 ? sci(b, 1) + " 배" : Math.round(b).toLocaleString() + " 배"),
        860, 226, { s: 24, w: "900", a: "right", c: v(b >= 1e6 ? "--green-700" : "--ink") });
      var by = 240, bw = 390, bh = 22;
      ctx.fillStyle = v("--card-2"); ctx.fillRect(ix, by, bw, bh);
      var f = clamp(log10(b) / 9, 0, 1);
      ctx.fillStyle = v(b >= 1e6 ? "--green" : "--brand"); ctx.fillRect(ix, by, bw * f, bh);
      var mx = ix + bw * 6 / 9;
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(mx, by - 8); ctx.lineTo(mx, by + bh + 8); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "100만 배", mx, by + bh + 22, { s: 10.5, w: "800", a: "center", c: v("--coral-700") });
      text(ctx, "1배", ix, by + bh + 22, { s: 10, c: v("--mist") });
      text(ctx, "10억 배", ix + bw, by + bh + 22, { s: 10, a: "right", c: v("--mist") });
      text(ctx, "섞는 양 " + sci(N(), 1) + " 개/cm³ (규소 원자는 5×10²² 개)", ix, 300, { s: 11, c: v("--mist") });

      mark(ctx, got.a, "인으로 100만 배 넘기기", 470, 340, { s: 11.5 });
      mark(ctx, got.b, "붕소로 p형 만들기", 470, 364, { s: 11.5 });
      mark(ctx, got.c, "순수한 규소 확인", 470, 388, { s: 11.5 });
      text(ctx, "불순물을 ‘일부러’ 넣어 성질을 고르는 것을 도핑이라고 합니다.", 40, 392, { s: 11.5, c: v("--mist") });

      $("d-dope-info").innerHTML = (type === "pure"
        ? "순수한 규소에서는 열에너지로 스스로 건너뛴 <b>고유 전자</b>(1 cm³ 당 약 10¹⁰ 개)만이 전류를 나릅니다. 구리(약 10²³ 개)와 견주면 터무니없이 적어, 사실상 잘 통하지 않습니다."
        : type === "n"
        ? "인은 원자가 전자가 <b>5개</b> 입니다. 이웃 규소 넷과 결합하고도 전자가 <b>하나 남아</b> 자유롭게 돌아다닙니다. 음(negative) 전하가 나르개라서 <b>n형</b> 이라고 합니다."
        : "붕소는 원자가 전자가 <b>3개</b> 입니다. 결합을 채우기에 전자가 <b>하나 모자라</b> 빈자리(양공)가 생기고, 옆 전자가 그 자리로 옮겨 오면 빈자리가 반대로 움직입니다. 양(positive) 전하가 움직이는 셈이라 <b>p형</b> 이라고 합니다.") +
        "<br>지금 전도도는 순수한 규소의 <b>" + (b < 10 ? b.toFixed(1) : (b >= 1e6 ? sci(b, 1) : Math.round(b).toLocaleString())) + " 배</b> 입니다.";
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
        window.sthMission("m4-3", true, "<span class='m-tag'>미션 완료</span>불순물을 아주 조금 넣는 것만으로 전도도가 <b>수백만 배</b> 뛰었습니다. 넣는 원소를 고르면 나르개가 <b>전자(n형)</b> 가 될지 <b>양공(p형)</b> 이 될지도 정할 수 있습니다.");
        ep.clear(2);
      }
    }
    cv._redraw = draw;
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
    var V = 0;
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
    function draw() {
      paper(ctx, 900, 400);
      var I = cur(V), mA = I * 1000, fwd = V > 0, i;
      text(ctx, "p-n 접합 다이오드 · 걸어 준 전압 " + V.toFixed(2) + " V", 40, 28, { s: 14, w: "800" });

      /* 접합 그림 */
      var jx = 50, jy = 70, jw = 370, jh = 150;
      ctx.fillStyle = v("--coral-100"); ctx.fillRect(jx, jy, jw / 2, jh);
      ctx.fillStyle = v("--teal-100"); ctx.fillRect(jx + jw / 2, jy, jw / 2, jh);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.strokeRect(jx, jy, jw, jh);
      ctx.beginPath(); ctx.moveTo(jx + jw / 2, jy); ctx.lineTo(jx + jw / 2, jy + jh); ctx.stroke();
      text(ctx, "p형 — 양공 ⊕", jx + jw / 4, jy + 22, { s: 12, w: "900", a: "center", c: v("--coral-700") });
      text(ctx, "n형 — 전자 ⊖", jx + jw * 3 / 4, jy + 22, { s: 12, w: "900", a: "center", c: v("--teal-700") });
      for (i = 0; i < 8; i++) {
        ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(jx + 26 + (i % 4) * 38, jy + 62 + Math.floor(i / 4) * 44, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = v("--teal");
        ctx.beginPath(); ctx.arc(jx + jw / 2 + 26 + (i % 4) * 38, jy + 62 + Math.floor(i / 4) * 44, 8, 0, Math.PI * 2); ctx.fill();
      }
      var on = mA >= 1;
      ctx.strokeStyle = v(on ? "--green" : "--mist"); ctx.fillStyle = v(on ? "--green" : "--mist"); ctx.lineWidth = 3;
      if (fwd) window.drawArrow(ctx, jx + 40, jy + jh + 28, jx + jw - 40, jy + jh + 28, 12);
      else window.drawArrow(ctx, jx + jw - 40, jy + jh + 28, jx + 40, jy + jh + 28, 12);
      text(ctx, V === 0 ? "전압 없음" : (fwd ? (on ? "순방향 — 전류가 흐른다" : "순방향이지만 전압이 모자라다") : "역방향 — 막힌다"),
        jx + jw / 2, jy + jh + 56, { s: 13.5, w: "900", a: "center", c: v(on ? "--green-700" : "--mist") });
      text(ctx, Math.abs(mA) >= 0.001 ? "전류 " + mA.toFixed(3) + " mA" : "전류 " + sci(I, 1) + " A (거의 0)",
        jx + jw / 2, jy + jh + 84, { s: 13, w: "800", a: "center", c: v("--ink") });

      /* I-V 곡선 */
      var X0 = 500, X1 = 870, Y0 = 70, Y1 = 290, VL = -2, VH = 1, IH = 5;
      function px(x) { return X0 + (x - VL) / (VH - VL) * (X1 - X0); }
      function py(y) { return Y1 - clamp(y, -0.5, IH) / IH * (Y1 - Y0 - 30) - 22; }
      text(ctx, "전압 – 전류 곡선", X0, 52, { s: 12.5, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X0, py(0)); ctx.lineTo(X1, py(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px(0), Y0); ctx.lineTo(px(0), Y1); ctx.stroke();
      text(ctx, "0 V", px(0), Y1 + 16, { s: 10, a: "center", c: v("--mist") });
      text(ctx, "−2 V", X0 + 2, Y1 + 16, { s: 10, c: v("--mist") });
      text(ctx, "+1 V", X1, Y1 + 16, { s: 10, a: "right", c: v("--mist") });
      text(ctx, "5 mA", X0 - 6, py(5) + 4, { s: 10, a: "right", c: v("--mist") });
      text(ctx, "1 mA", X0 - 6, py(1) + 4, { s: 10, a: "right", c: v("--coral-700") });
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(X0, py(1)); ctx.lineTo(X1, py(1)); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.beginPath();
      for (i = 0; i <= 120; i++) {
        var vv = VL + i / 120 * (VH - VL), yy = py(cur(vv) * 1000);
        if (i === 0) ctx.moveTo(px(vv), yy); else ctx.lineTo(px(vv), yy);
      }
      ctx.stroke();
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(px(V), py(mA), 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "전류 (mA)", X0, Y0 - 4, { s: 10.5, c: v("--mist") });
      text(ctx, "한쪽으로만 흐른다", X1, Y0 - 4, { s: 10.5, a: "right", c: v("--mist") });

      mark(ctx, got.a, "순방향 1 mA 넘기기", 50, 332, { s: 11.5 });
      mark(ctx, got.b, "역방향에서 막히는 것 확인", 250, 332, { s: 11.5 });
      text(ctx, "이 문 하나가 LED · 태양 전지 · 트랜지스터의 바탕입니다", 870, 332, { s: 11, a: "right", c: v("--mist") });
      text(ctx, "순방향으로 약 0.6 V 를 넘겨야 전류가 눈에 띄게 흐르기 시작합니다.", 50, 366, { s: 11.5, c: v("--mist") });

      $("d-diode-info").innerHTML = "전압 <b>" + V.toFixed(2) + " V</b> · 전류 <b>" + (Math.abs(mA) >= 0.001 ? mA.toFixed(3) + " mA" : sci(I, 1) + " A") + "</b><br>" +
        (V > 0
          ? "p형 쪽에 ＋, n형 쪽에 －를 건 <b>순방향</b>입니다. 양공과 전자가 접합면으로 서로 밀려와 만나면서 전류가 흐릅니다. 다만 접합면의 장벽을 넘어야 해서, 약 <b>0.6 V</b> 를 넘기기 전에는 전류가 거의 흐르지 않습니다."
          : V < 0
          ? "반대로 건 <b>역방향</b>입니다. 양공과 전자가 접합면에서 서로 <b>멀어져</b> 가운데가 텅 비므로 전류가 거의 흐르지 않습니다. 지금 전류는 " + sci(Math.abs(I), 1) + " A, 순방향의 10억 분의 1 도 되지 않습니다."
          : "전압이 0 이라 전류도 0 입니다. 슬라이더를 오른쪽(순방향)과 왼쪽(역방향)으로 움직여 견주어 보세요.");
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
        { t: "다이아몬드", a: "ins", why: "띠 간격 5.47 eV. 탄소로만 되어 있어도 전기는 통하지 않습니다. 같은 탄소인 흑연은 잘 통한다는 점과 견주어 보세요.", hint: "띠 간격이 3.0 eV 를 넘으면 어디로 갈까요?" },
        { t: "고체 소금", a: "ins", why: "이온이 제자리에 묶여 있어 통하지 않습니다. 녹이면 통한다는 것은 이야기 ②에서 확인했습니다.", hint: "‘고체’ 상태라는 데 주의하세요." }
      ],
      doneText: "전기적 성질로 물질을 세 무리로 갈랐습니다.",
      onDone: function () { sorted = true; window.sthState("dSort", 1); mission(); }
    });
    window.sthPick({
      mount: "s4-q",
      q: "물질의 전기적 성질을 이용한 소재에 대한 설명으로 옳은 것은?",
      options: [
        "초전도체는 온도를 아주 <b>높이면</b> 저항이 0 이 된다",
        "초전도체는 어떤 온도 <b>아래</b>에서 저항이 0 이 되어, MRI 의 강한 전자석에 쓰인다",
        "그래핀은 전기가 통하지 않아 절연체로 쓰인다",
        "반도체는 불순물을 넣으면 전기가 더 <b>안</b> 통하게 된다"
      ],
      answer: 1,
      why: [
        "반대입니다. 초전도 현상은 임계 온도 <b>아래로</b> 식혔을 때 나타납니다.",
        "저항이 0 이면 전류가 흘러도 열이 나지 않아, 아주 센 전류를 계속 흘릴 수 있습니다. 그래서 MRI 나 입자 가속기의 전자석에 씁니다.",
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
      (p.indexOf("㉢") === 0 ? "정확했습니다. 이제 그 까닭이 <b>띠 간격</b>에 있다는 것까지 설명할 수 있게 되었네요."
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
    { key: "r4", label: "④ 거꾸로 가는 물질" }
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
    { key: "r4", label: "④ 거꾸로 가는 물질" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
