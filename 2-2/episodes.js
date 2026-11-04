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
/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KS = K.C, REDUCE = K.REDUCE;
/* 캔버스마다 무대 종류와 별 씨앗 */
var STAGE = {
  "a-tab": ["lab", 3], "a-trend": ["lab", 5], "a-eka": ["lab", 9], "a-rx": ["lab", 13],
  "b-make": ["night", 21], "b-prop": ["lab", 23],
  "c-tet": ["earth", 31], "c-carb": ["night", 33], "c-poly": ["night", 35],
  "d-band": ["lab", 41], "d-dope": ["night", 43], "d-diode": ["lab", 45]
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
function chip(ctx, x, y, w, h, c) { glass(ctx, x, y, w, h, c && c !== "--card-2" ? c : "--brand", 12); }
function mark(ctx, ok, s, x, y, o) {
  o = o || {};
  pill(ctx, (ok ? "✔ " : "○ ") + s, x + 7, y, { s: o.s || 12, a: o.a || "left", c: ok ? KS.green : KS.mute, bg: ok ? "rgba(20,70,50,.55)" : KS.pill });
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
  function val(i) { if (GRP[i] === 18) return 0; var s = SHELL[i]; return s[s.length - 1]; }  /* 18족은 원자가 전자 0개로 본다 */

  window.sthGate({
    gate: "g1", key: "period1", title: "조사관의 첫 추리",
    question: "멘델레예프는 1869년 표에 빈칸을 남겼고, 1871년에는 <b>아직 발견되지도 않은 원소</b>의 원자량과 밀도를 예측해 적었습니다. 15년 뒤 그 값이 거의 맞는 것으로 드러났습니다. 어떻게 그럴 수 있었을까요?",
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
      pill(ctx1, "주기율표 · 원자 번호 1~20", 40, 25, { s: 12.5, c: KS.blue });
      var x0 = 40, y0 = 48, cw = 44, ch = 40, i;
      var gl = [1, 2, 13, 14, 15, 16, 17, 18];
      for (i = 0; i < 8; i++) text(ctx1, gl[i] + "족", x0 + i * cw + (cw - 3) / 2, 44, { s: 9, a: "center", c: v("--mist") });
      for (i = 1; i <= 4; i++) text(ctx1, i + "주기", x0 - 8, y0 + (i - 1) * ch + 25, { s: 9, a: "right", c: v("--mist") });
      for (i = 0; i < 20; i++) {
        var x = x0 + colOf(i) * cw, y = y0 + (PER[i] - 1) * ch, on = (i + 1 === z);
        var tint = on ? "--brand" : (METAL[i + 1] ? "--amber" : (GRP[i] === 18 ? "--violet" : "--brand"));
        var tg = ctx1.createLinearGradient(x, y, x, y + ch - 3);
        tg.addColorStop(0, rgba(tint, on ? .95 : .30)); tg.addColorStop(1, rgba(tint, on ? .55 : .10));
        ctx1.save();
        if (on) { ctx1.shadowColor = v("--brand"); ctx1.shadowBlur = 16; }
        ctx1.fillStyle = tg; ctx1.beginPath(); ctx1.roundRect(x, y, cw - 3, ch - 3, 6); ctx1.fill(); ctx1.restore();
        ctx1.strokeStyle = on ? "#d8f4ff" : rgba(tint, .45); ctx1.lineWidth = on ? 2 : 1;
        ctx1.beginPath(); ctx1.roundRect(x, y, cw - 3, ch - 3, 6); ctx1.stroke();
        text(ctx1, SYM[i], x + (cw - 3) / 2, y + 18, { s: 13, w: "900", a: "center", c: on ? v("--on-accent") : v("--ink") });
        text(ctx1, String(val(i)), x + (cw - 3) / 2, y + 31, { s: 9.5, w: "800", a: "center", c: on ? v("--on-accent") : v("--teal-700") });
      }
      text(ctx1, "칸 아래 작은 숫자 = 원자가 전자 수 · 노란 칸은 금속", x0, 226, { s: 10.5, c: v("--mist") });

      /* 전자 껍질 */
      var sh = SHELL[z - 1], cx = 560, cy = 128, k, j;
      var halo = ctx1.createRadialGradient(cx, cy, 0, cx, cy, 120);
      halo.addColorStop(0, "rgba(162,136,245,.16)"); halo.addColorStop(1, "rgba(162,136,245,0)");
      ctx1.fillStyle = halo; ctx1.beginPath(); ctx1.arc(cx, cy, 120, 0, Math.PI * 2); ctx1.fill();
      for (k = 0; k < sh.length; k++) {
        var r = 26 + k * 22, last = (k === sh.length - 1);
        ctx1.strokeStyle = last ? "rgba(255,157,99,.45)" : "rgba(200,210,255,.25)"; ctx1.lineWidth = last ? 1.6 : 1.2;
        ctx1.beginPath(); ctx1.arc(cx, cy, r, 0, Math.PI * 2); ctx1.stroke();
        for (j = 0; j < sh[k]; j++) {
          var a = -Math.PI / 2 + j * 2 * Math.PI / sh[k];
          if (last) dot(ctx1, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4.2, "--coral", 3.2);
          else dot(ctx1, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.6, "#b8c6f0", 2.4);
        }
      }
      ball(ctx1, cx, cy, 18, "--violet");
      text(ctx1, "+" + z, cx, cy + 4, { s: 11, w: "900", a: "center", c: "#ffffff" });
      pill(ctx1, "전자 껍질 · 주황 점이 원자가 전자", cx, 226, { s: 10.5, a: "center", c: KS.mute });

      /* 오른쪽 정보 */
      var ix = 700;
      glass(ctx1, ix - 14, 44, 186, 172, "--brand", 12);
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
      text(ctx1, "가로줄을 따라가면 원자가 전자가 1개씩 늘어 7개까지 가고, 18족(0개)을 지나 다음 줄에서 다시 1개부터 시작합니다.", 40, 280, { s: 11.5, c: v("--mist") });
    }

    function series(ctx, vals, y, h, Y1, yt, c, title, unit) {
      var g = K.chart(ctx, { x: 30, y: y, w: 860, h: h, pb: 22, pt: 26, x0: 1, x1: 20, y0: 0, y1: Y1, xt: 19, yt: yt,
        xf: function (q) { return SYM[Math.round(q) - 1]; }, yf: function (q) { return Math.round(q).toLocaleString(); } });
      var pts = vals.map(function (q, i) { return [i + 1, q]; }), i;
      /* 주기 구간 띠 */
      [[3, 10], [11, 18]].forEach(function (p) { ctx.fillStyle = "rgba(255,255,255,.035)"; ctx.fillRect(g.X(p[0] - .5), g.T, g.X(p[1] + .5) - g.X(p[0] - .5), g.B - g.T); });
      var zx = g.X(z);
      K.line(ctx, { x: zx, y: g.T }, { x: zx, y: g.B }, KS.orange, 1.4, [4, 4], .8);
      K.plot(ctx, g, pts, v(c), { dots: 3 });
      dot(ctx, zx, g.Y(vals[z - 1]), 5, "--coral", 3.4);
      pill(ctx, title, g.L + 8, y + 18, { s: 11.5, c: v(c) });
      pill(ctx, vals[z - 1].toLocaleString() + unit, zx + 12, Math.max(g.T + 30, g.Y(vals[z - 1]) - 8), { s: 11.5, c: KS.orange, box: [g.L, g.R] });
    }

    function drawTrend() {
      paper(ctx2, 900, 300);
      series(ctx2, RAD, 4, 146, 250, 2, "--teal", "원자 반지름 (pm) · 주기마다 톱니가 되풀이됩니다", " pm");
      series(ctx2, IE, 152, 148, 2500, 2, "--violet", "1차 이온화 에너지 (kJ/mol) · 1족에서 뚡 떨어집니다", " kJ/mol");
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
      if (hit) {
        var hg = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, w);
        hg.addColorStop(0, "rgba(79,195,236,.35)"); hg.addColorStop(1, "rgba(79,195,236,0)");
        ctx.fillStyle = hg; ctx.fillRect(x - w / 2, y - h / 2, w * 2, h * 2);
      }
      glass(ctx, x, y, w, h, hit ? "--brand" : (o && (o.s === "Ga" || o.s === "Sn") ? "--amber" : "--violet"), 12);
      if (hit) { ctx.strokeStyle = v("--brand"); ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.stroke(); ctx.setLineDash([]); }
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
      pill(ctx, title, X0, y - 50, { s: 12.5, c: KS.ink });
      var tg = ctx.createLinearGradient(X0, 0, X1, 0); tg.addColorStop(0, "rgba(127,211,255,.15)"); tg.addColorStop(1, "rgba(182,156,255,.4)");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(X0, y - 4, X1 - X0, 8, 4); ctx.fill();
      for (var tq = 0; tq <= 10; tq++) { ctx.fillStyle = "rgba(200,210,255,.35)"; ctx.fillRect(X0 + (X1 - X0) * tq / 10 - .5, y + 6, 1, 5); }
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
        ctx.save(); ctx.shadowColor = v("--green"); ctx.shadowBlur = 10; ctx.strokeStyle = v("--green"); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(tx, y - 14); ctx.lineTo(tx, y + 14); ctx.stroke(); ctx.restore();
        text(ctx, "네 이웃 평균 " + fmt(tgt), clamp(tx, X0 + 60, X1 - 60), y + 30, { s: 10.5, w: "900", a: "center", c: v("--green-700") });
      }
      var cx = px(cur);
      dot(ctx, cx, y, 7, "--coral", 2.6);
      text(ctx, "내 예측 " + fmt(cur) + unit, clamp(cx, X0 + 62, X1 - 72), y + 48, { s: 12, w: "900", a: "center", c: v("--coral-700") });
    }

    function f2(x) { return x.toFixed(2); }

    function draw() {
      paper(ctx, 900, 420);
      pill(ctx, "1871년 · 빈칸의 성질을 이웃으로 예측하기", 40, 28, { s: 13, c: KS.blue });
      var cw = 108, chh = 72, cx = 210, cy = 200;
      cell(cx - cw / 2, cy - chh / 2 - 84, cw, chh, N.up, false);
      cell(cx - cw / 2, cy - chh / 2 + 84, cw, chh, N.down, false);
      cell(cx - cw / 2 - 118, cy - chh / 2, cw, chh, N.left, false);
      cell(cx - cw / 2 + 118, cy - chh / 2, cw, chh, N.right, false);
      cell(cx - cw / 2, cy - chh / 2, cw, chh, null, true);
      text(ctx, "성질이 표를 따라 고르게 변한다면", 210, 344, { s: 11.5, a: "center", c: v("--mist") });
      text(ctx, "빈칸의 값은 이웃들의 가운데에 있어야 합니다", 210, 362, { s: 11.5, a: "center", c: v("--mist") });

      line(120, 60, 86, am, AM_LR, AM_UD, AM_T, got.a, "① 원자량 예측", function (x) { return x.toFixed(1); }, "");
      line(268, 4, 7, de, DE_LR, DE_UD, DE_T, got.d, "② 밀도 예측 (g/cm³)", f2, " g/cm³");

      mark(ctx, got.a, "원자량 맞힘", 430, 360);
      mark(ctx, got.d, "밀도 맞힘", 620, 360);
      if (got.a && got.d) {
        text(ctx, "1886년 빈클러의 실측 — 저마늄 원자량 72.63 · 밀도 5.32 g/cm³", 430, 390, { s: 12, w: "900", c: v("--green-700") });
      } else {
        text(ctx, "두 눈금을 모두 맞히면 1886년의 실측값을 보여 드립니다", 430, 390, { s: 11, c: v("--mist") });
      }
      pill(ctx, "🚧 표의 빈칸", 40, 390, { s: 11.5, c: v("--brand-700") });
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
      m += got.a ? "① 원자량 <b>맞혔습니다</b>. 네 이웃의 평균은 <b>" + AM_T.toFixed(2) + "</b>입니다. "
                 : "① 원자량 예측 <b>" + am.toFixed(1) + "</b> — 네 이웃의 평균보다 " + hint(am - AM_T, "am") + " ";
      m += "<br>";
      m += got.d ? "② 밀도 <b>맞혔습니다</b>. 네 이웃의 평균은 <b>" + DE_T.toFixed(2) + " g/cm³</b>입니다."
                 : "② 밀도 예측 <b>" + de.toFixed(2) + "</b> — 네 이웃의 평균보다 " + hint(de - DE_T, "de");
      if (got.a && got.d) m += "<br>멘델레예프가 적어 둔 값은 원자량 72, 밀도 5.5 였고, 실제 저마늄은 <b>72.63</b>과 <b>5.32</b> 였습니다. 이웃만 보고도 이만큼 맞힐 수 있었던 것은 성질이 <b>규칙적으로</b> 변하기 때문입니다.";
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
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>이웃 네 개의 평균만으로 원자량 <b>72.9</b>, 밀도 <b>5.32 g/cm³</b>를 얻었습니다. 1886년에 실제로 잰 저마늄은 <b>72.63</b>과 <b>5.32</b> — 표가 예언을 한 셈입니다.");
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
    var fam = "g1", per = 2, rxT = 0, rxPlay = !REDUCE;
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
        name: "18족 · 비활성 기체", val: 0, ion: "없음", act: "주지도 받지도 않는다", col: "--violet",
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

    /* 작은 실험 장면: 1족은 물에 넣기, 17족은 플라스크 속 홌원소, 18족은 방전관 */
    function vignette(x, y, w, h, R) {
      var e = cur(), i, cxv = x + w / 2, rr = K.rng(e.p * 7 + 3);
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.clip();
      ctx.fillStyle = "rgba(5,8,24,.55)"; ctx.fillRect(x, y, w, h);
      if (fam === "g1") {
        var wy = y + h * .38;
        var wg = ctx.createLinearGradient(0, wy, 0, y + h); wg.addColorStop(0, "rgba(90,170,255,.55)"); wg.addColorStop(1, "rgba(20,60,150,.75)");
        ctx.fillStyle = wg; ctx.fillRect(x + 8, wy, w - 16, y + h - wy - 8);
        ctx.strokeStyle = "rgba(190,225,255,.7)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + 8, wy); ctx.lineTo(x + w - 8, wy); ctx.stroke();
        var sp = e.p === 2 ? 0 : (e.p === 3 ? 1 : 1.6);
        var lx = cxv + Math.sin(rxT / 380) * (w * .28) * sp * .6, ly = wy - 2;
        var nb = Math.round(R / 7) + 2;
        /* 수소 기체 거품은 물 위에 떠 있는 금속 덩어리 둘레에서 생긴다 */
        for (i = 0; i < nb; i++) {
          var ph = (rxT / (900 - R * 5) + rr()) % 1, bx2 = lx + (rr() - .5) * (16 + R / 4), by2 = ly + 10 - ph * 22;
          ctx.strokeStyle = "rgba(220,240,255," + (.85 - ph * .7) + ")"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(bx2 + Math.sin(ph * 9 + i) * 2, by2, 1.4 + rr() * 2, 0, 6.2832); ctx.stroke();
        }
        if (e.p >= 3) {
          var fl = e.p === 4 ? 1 : (Math.sin(rxT / 260) > .55 ? .55 : 0);
          if (fl > 0) for (i = 0; i < 4; i++) dot(ctx, lx + (rr() - .5) * 8, ly - 10 - i * 8 - Math.sin(rxT / 90 + i) * 3, 5 - i, e.p === 4 ? "#c99cff" : "#ffb347", 3.2);
        }
        ctx.fillStyle = "#d9dde6"; ball(ctx, lx, ly - 2, 7, "#cfd6e2");
      } else if (fam === "g17") {
        var GC = { 2: ["rgba(240,240,150,", .18], 3: ["rgba(190,230,90,", .35], 4: ["rgba(170,60,30,", .45] }[e.p];
        var gg = ctx.createLinearGradient(0, y, 0, y + h); gg.addColorStop(0, GC[0] + GC[1] * .6 + ")"); gg.addColorStop(1, GC[0] + GC[1] + ")");
        ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(cxv, y + h * .6, w * .36, h * .32, 0, 0, 6.2832); ctx.fill();
        if (e.p === 4) { ctx.fillStyle = "rgba(140,40,20,.9)"; ctx.beginPath(); ctx.ellipse(cxv, y + h * .86, w * .26, 8, 0, 0, 6.2832); ctx.fill(); }
        for (i = 0; i < 14; i++) { var px2 = cxv + Math.sin(rxT / 900 + i * 2.1) * w * .28, py2 = y + h * .6 + Math.cos(rxT / 1100 + i * 1.3) * h * .22; ctx.fillStyle = GC[0] + ".9)"; ctx.beginPath(); ctx.arc(px2, py2, 2, 0, 6.2832); ctx.fill(); }
        ctx.strokeStyle = "rgba(200,225,255,.6)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cxv, y + h * .6, w * .36, h * .32, 0, 0, 6.2832); ctx.stroke();
        ctx.strokeRect(cxv - 9, y + 12, 18, h * .28 - 10);
      } else {
        var NC = { 2: "#ff6a3d", 3: "#c9a2ff", 4: "#e9e6ff" }[e.p], fk = .8 + .2 * Math.sin(rxT / 70) * Math.sin(rxT / 37);
        var tg2 = ctx.createLinearGradient(x + w * .3, 0, x + w * .7, 0);
        tg2.addColorStop(0, rgba(NC, .15)); tg2.addColorStop(.5, rgba(NC, .9 * fk)); tg2.addColorStop(1, rgba(NC, .15));
        ctx.save(); ctx.shadowColor = NC; ctx.shadowBlur = 22 * fk; ctx.fillStyle = tg2;
        ctx.beginPath(); ctx.roundRect(x + w * .3, y + 26, w * .4, h - 52, 14); ctx.fill(); ctx.restore();
        ctx.fillStyle = "#8a93a8"; ctx.fillRect(cxv - 8, y + 12, 16, 14); ctx.fillRect(cxv - 8, y + h - 26, 16, 14);
      }
      ctx.restore();
      ctx.strokeStyle = "rgba(200,225,255,.35)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.stroke();
      pill(ctx, fam === "g1" ? "물에 넣으면" : (fam === "g17" ? (e.p === 4 ? "액체 · 증기" : "기체의 색") : "전기를 걸면"), cxv, y + h + 18, { s: 10.5, a: "center", c: KS.mute });
    }

    function draw(quiet) {
      paper(ctx, 900, 400);
      var F = FAM[fam], e = cur(), R = react();
      pill(ctx, F.name + " — " + e.p + "주기 " + e.k, 40, 28, { s: 13.5, c: v(F.col) });

      /* 원자 그림 */
      var cx = 128, cy = 166, i, j;
      var hal = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110);
      hal.addColorStop(0, rgba(F.col, .14)); hal.addColorStop(1, rgba(F.col, 0));
      ctx.fillStyle = hal; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.fill();
      for (i = 0; i < e.sh.length; i++) {
        var r = 24 + i * 22;
        var cnt = Math.min(e.sh[i], 12), last = (i === e.sh.length - 1);
        ctx.strokeStyle = last ? rgba(F.col, .5) : "rgba(200,210,255,.22)"; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        for (j = 0; j < cnt; j++) {
          var a = -Math.PI / 2 + j * 2 * Math.PI / cnt;
          if (last) dot(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4.2, F.col, 3.2);
          else dot(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.4, "#b8c6f0", 2.4);
        }
        if (e.sh[i] > 12) text(ctx, "…", cx + r + 6, cy + 4, { s: 11, c: v("--mist") });
      }
      ball(ctx, cx, cy, 14, "--violet");
      text(ctx, e.s, cx, cy + 4, { s: 12, w: "900", a: "center", c: "#ffffff" });
      vignette(240, 66, 96, 186, R);
      pill(ctx, "원자가 전자 " + F.val + "개" + (F.val === 0 ? " (바깥 껍질은 꽉 참)" : ""), 180, 296, { s: 12.5, a: "center", c: v(F.col) });
      text(ctx, F.act, 180, 318, { s: 11.5, a: "center", c: v("--mist") });

      /* 오른쪽 */
      var ix = 360;
      chip(ctx, ix, 52, 500, 62, F.col);
      text(ctx, "만들어지는 이온", ix + 16, 74, { s: 11, c: v("--mist") });
      text(ctx, F.ion === "없음" ? "이온이 되지 않는다" : e.s + (F.ion === "+1" ? "⁺" : "⁻"), ix + 16, 100, { s: 20, w: "900", c: v(F.col) });
      text(ctx, fam === "g1" ? "이온화 에너지 " + e.n + " kJ/mol" : (fam === "g17" ? "전기음성도 " + e.n.toFixed(2) : "바깥 껍질이 이미 8개"),
        ix + 484, 100, { s: 12, w: "800", a: "right", c: v("--mist") });

      text(ctx, "반응성 (0~100 상대 눈금)", ix, 148, { s: 12, w: "800" });
      var bx = ix, bw = 420;
      meter(ctx, bx, 158, bw, 28, R / 100, F.col);
      text(ctx, R + "", 860, 180, { s: 16, w: "900", a: "right", c: v(F.col) });

      /* 같은 족의 세 원소 비교 */
      text(ctx, "같은 세로줄 안에서의 자리", ix, 218, { s: 12, w: "800" });
      for (i = 0; i < F.list.length; i++) {
        var q = F.list[i], on = q.p === per, yy = 230 + i * 26;
        var rr = fam === "g1" ? Math.round((560 - q.n) / 1.6) : (fam === "g17" ? Math.round((q.n - 2.4) / 1.6 * 100) : 0);
        text(ctx, q.p + "주기 " + q.k, ix, yy + 14, { s: 11.5, w: on ? "900" : "500", c: on ? v(F.col) : v("--mist") });
        meter(ctx, ix + 130, yy + 3, 300, 14, rr / 100, on ? F.col : "#5b6796");
        text(ctx, String(rr), 860, yy + 14, { s: 11, w: "800", a: "right", c: on ? v(F.col) : v("--mist") });
      }

      mark(ctx, got.a, "1족 1위", 40, 348);
      mark(ctx, got.b, "17족 1위", 180, 348);
      mark(ctx, got.c, "이온이 안 되는 줄", 340, 348);
      text(ctx, "세로줄이 같으면 원자가 전자 수가 같고, 행동도 닮습니다", 860, 348, { s: 11, a: "right", c: v("--mist") });
      text(ctx, e.w.replace(/<[^>]+>/g, ""), 40, 380, { s: 11.5, c: v("--mist") });
      if (quiet === true) return;
      $("a-rx-info").innerHTML = "<b>" + e.k + " (" + e.s + ")</b> — " + e.w + "<br>" +
        (fam === "g1" ? "1족은 아래로 갈수록 원자 반지름이 커져 바깥 전자를 느슨하게 붙잡습니다. 그래서 이온화 에너지가 <b>작아지고</b> 반응은 <b>격렬해집니다</b>."
        : fam === "g17" ? "17족은 위로 갈수록 원자 반지름이 작아 전자를 세게 끌어당깁니다. 그래서 <b>플루오린이 가장 반응성이 큽니다</b>. 1족과 <b>반대 방향</b>이라는 점에 주의하세요."
        : "18족은 바깥 껍질이 이미 8개(헬륨은 2개)로 꽉 차 있어 결합에 쓰는 전자가 없으므로 <b>원자가 전자를 0개</b>로 봅니다. 더 얻거나 잃을 까닭이 없습니다. 다른 원소가 <b>8개를 채우려고</b> 결합하는 것이라면, 이 줄은 이미 목적지에 있는 셈입니다.");
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
    playBtn("a-rx-play", "⏸ 실험 장면 멈추기", "▶ 실험 장면 움직이기", function () { return rxPlay; }, function (q) { rxPlay = q; });
    K.animate(cv, function (dt) { if (rxPlay) { rxT += dt; draw(true); } });
    onSeg("a-fam", function (b) { fam = b.getAttribute("data-f"); draw(); check(); });
    $("a-per").addEventListener("input", function (e) { per = +e.target.value; $("a-per-val").textContent = per + "주기"; draw(); check(); });
    window.sthPick({
      mount: "s1-q",
      q: "원소의 성질이 주기적으로 되풀이되는 가장 근본적인 까닭은?",
      options: [
        "원자량이 일정하게 늘어나기 때문",
        "원자 번호가 커지면서 <b>원자가 전자 수</b>가 1 → 7로 늘고 18족(0)을 지나 다시 1부터 되풀이되기 때문",
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
      (p.indexOf("㉡") === 0 ? "처음부터 정확했습니다. 이제 그 ‘되풀이’의 정체가 <b>원자가 전자 수</b>라는 것까지 말할 수 있게 되었습니다."
        : "정답은 ㉡ 입니다. 원자가 전자 수가 1부터 7까지 늘고 18족(0)을 지나 다시 1로 돌아오기 때문에 성질도 되풀이되고, 그래서 빈칸도 이웃으로 <b>계산</b>할 수 있었습니다.");
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
    var pair = "nacl", n = 0, mkT = 0;
    var got = window.sthState("bMake") || { nacl: false, mgo: false, h2o: false, ch4: false };
    var H2 = { s: "H", k: "수소", v: 1, t: 2 };
    var MAT = {
      nacl: { kind: "ion", need: 1, nm: "염화 나트륨 NaCl", A: { s: "Na", k: "나트륨", v: 1 }, B: { s: "Cl", k: "염소", v: 7 },
              w: "금속인 나트륨이 전자 1개를 <b>내주고</b>, 비금속인 염소가 그것을 <b>받습니다</b>. Na⁺와 Cl⁻가 서로 끌어당겨 결정을 이룹니다." },
      mgo:  { kind: "ion", need: 2, nm: "산화 마그네슘 MgO", A: { s: "Mg", k: "마그네슘", v: 2 }, B: { s: "O", k: "산소", v: 6 },
              w: "마그네슘은 전자 <b>2개</b>를 내주고 산소는 2개를 받습니다. 전하가 ±2로 커서 끌어당기는 힘이 훨씬 세고, 그래서 녹는점이 2,852 ℃나 됩니다." },
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
      var hg = ctx.createRadialGradient(x, y, r * .6, x, y, r + 26);
      hg.addColorStop(0, rgba(col, .22)); hg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r + 26, 0, Math.PI * 2); ctx.fill();
      ball(ctx, x, y, r, col);
      text(ctx, sym, x + r * .08, y + 6 + r * .1, { s: r > 40 ? 20 : 14, w: "900", a: "center", c: "#ffffff" });
      var i, rr = r + 13;
      ctx.strokeStyle = "rgba(200,210,255,.18)"; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      for (i = 0; i < cnt; i++) {
        var a = -Math.PI / 2 + i * 2 * Math.PI / Math.max(cnt, 1);
        dot(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr, 3.6, "#fff6c8", 3);
      }
      if (lab) pill(ctx, lab, x, y + r + 34, { s: 11, a: "center", c: KS.ink });
    }

    function draw(quiet) {
      paper(ctx, 900, 420);
      var M = MAT[pair], stable = false, i;
      pill(ctx, M.nm + " 만들기", 40, 28, { s: 13.5, c: v("--brand-700") });
      pill(ctx, "빛나는 점 = 가장 바깥 껍질의 전자 (원자가 전자)", 860, 28, { s: 11, a: "right", c: KS.mute });

      if (M.kind === "ion") {
        var bad = n > M.A.v;
        var av = Math.max(M.A.v - n, 0), bv = M.B.v + Math.min(n, M.A.v);
        atom(280, 190, 52, M.A.s, av, "--coral", M.A.k + " · 바깥 전자 " + av + "개");
        atom(620, 190, 52, M.B.s, bv, "--teal", M.B.k + " · 바깥 전자 " + bv + "개");
        if (n > 0 && !bad) {
          for (i = 0; i < n; i++) {
            var ay = 172 + i * 22, ph = REDUCE ? .5 : ((mkT / 1400 + i * .3) % 1);
            K.arrow(ctx, { x: 346, y: ay }, { x: 554, y: ay }, rgba("--amber", .75), 2.2, 11);
            dot(ctx, 352 + ph * 190, ay, 3.6, "#fff6c8", 3);
          }
          pill(ctx, "전자 " + n + "개 이동", 450, 150, { s: 12, a: "center", c: v("--amber-700") });
        }
        stable = (av === 0 && bv === 8 && !bad);
        if (stable) {
          var chg = n === 1 ? "" : sup(n);
          pill(ctx, M.A.s + chg + "⁺", 280, 118, { s: 18, a: "center", c: v("--coral-700") });
          pill(ctx, M.B.s + chg + "⁻", 620, 118, { s: 18, a: "center", c: v("--teal-700") });
          ctx.save(); ctx.shadowColor = v("--green"); ctx.shadowBlur = 10; ctx.strokeStyle = v("--green"); ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
          ctx.lineDashOffset = -(mkT / 40); ctx.beginPath(); ctx.moveTo(346, 190); ctx.lineTo(554, 190); ctx.stroke(); ctx.restore();
          pill(ctx, "＋ 와 － 가 끌어당긴다 — 이온 결합", 450, 262, { s: 13, a: "center", c: v("--green-700") });
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
          ctx.save();
          if (a2 > 0) { ctx.shadowColor = v("--brand"); ctx.shadowBlur = 12; }
          ctx.strokeStyle = a2 > 0 ? v("--brand") : "rgba(200,210,255,.3)"; ctx.lineWidth = a2 > 1 ? 7 : (a2 > 0 ? 4 : 1.5);
          ctx.setLineDash(a2 > 0 ? [] : [5, 4]);
          ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(pos[i][0], pos[i][1]); ctx.stroke(); ctx.restore();
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

      if (quiet === true) return stable;
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
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>안정해지는 방법은 둘뿐이었습니다. <b>주고받기(이온 결합)</b>와 <b>같이 쓰기(공유 결합)</b>. 어느 쪽을 택하는지는 만나는 원자가 금속인지 비금속인지가 정합니다.");
        ep.clear(1);
      }
    }
    function label() {
      var M = MAT[pair];
      $("b-n-label").textContent = M.kind === "ion" ? "옮길 전자 수" : "나눠 쓸 전자쌍 수";
      $("b-n-val").textContent = n + (M.kind === "ion" ? "개" : "쌍");
    }
    cv._redraw = draw;
    /* 전자가 옮겨 가는 모습을 바꾼 뒤 잠깐(약 4초) 보여 준다 */
    K.animate(cv, function (dt) { if (!REDUCE && mkT < 4200 && MAT[pair].kind === "ion" && n > 0) { mkT += dt; draw(true); } });
    onSeg("b-pair", function (b) { pair = b.getAttribute("data-p"); mkT = 0; label(); check(); });
    $("b-n").addEventListener("input", function (e) { n = +e.target.value; mkT = 0; label(); check(); });
    label(); draw(); mission();
  })();

  /* ------------------------------------------------ 장면 3 — 성질 시험대 */
  (function () {
    var cv = $("b-prop"), ctx = window.setupCanvas(cv);
    var sub = "nacl", wet = false, T = 20, pT = 0, pPlay = !REDUCE;
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
      if (md === "aq") return sub === "nacl" ? "물에 녹으면 Na⁺와 Cl⁻가 <b>따로 떨어져 물 속을 돌아다닙니다</b>. 움직이는 전하가 생겼으므로 전기가 통합니다."
        : (sub === "sugar" ? "설탕은 물에 잘 녹지만, 녹아도 <b>분자 그대로</b> 떠다닐 뿐 이온이 되지 않습니다. 움직이는 전하가 없어 전기가 통하지 않습니다."
        : "순수한 물에는 움직일 수 있는 이온이 거의 없어 전기가 <b>거의</b> 통하지 않습니다. 수돗물이 통하는 것은 녹아 있는 이온 때문입니다.");
      if (sub === "nacl") return phase(S) === "고체"
        ? "고체 소금에서는 Na⁺와 Cl⁻가 <b>제자리에 꽉 묶여</b> 있습니다. 전하가 있어도 움직이지 못하므로 전기가 통하지 않습니다."
        : "802 ℃를 넘겨 녹이자 이온들이 <b>풀려나 움직입니다</b>. 1807년 데이비가 본 것이 바로 이 장면입니다.";
      if (sub === "sugar") return phase(S) === "고체"
        ? "설탕 결정은 <b>분자</b>가 쌓여 있는 것입니다. 전하를 띤 알갱이가 아예 없습니다."
        : "녹여서 액체로 만들어도 <b>분자가 움직일 뿐</b> 전하는 없습니다. 그래서 전기가 통하지 않습니다. (실제 설탕은 녹으면서 서서히 분해됩니다.)";
      return "순수한 물은 대부분 중성 분자라 전기가 거의 통하지 않습니다.";
    }

    /* ── 잘라 보는 시험대: 위 0~440 은 아이소메트릭 유리 시험 칸(가열판·전극·입자 모형)과 회로, 아래는 읽음판 ── */
    var W = 900, H = 620, DH = 440;
    var I = K.iso({ ox: 330, oy: 206, s: 0.7, L: 360, D: 200 });
    var L = I.L, D = I.D, HC = 140, RODZ = 186;
    var NX = 7, NY = 4, NZ = 3;
    function hashf(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; x = x - Math.floor(x); x = Math.sin(x * 91.17 + n * 0.731) * 24634.6345; return x - Math.floor(x); }
    function heaterCol(T0) {
      if (T0 < 0) return "#9fc8e6";
      var f = clamp(T0 / 1200, 0, 1);
      return "rgb(" + Math.round(70 + 185 * f) + "," + Math.round(74 + 40 * f * (1 - f) * 2) + "," + Math.round(84 - 50 * f) + ")";
    }
    function fillOf(S, md, ph) {
      if (md === "aq") return { c: "rgba(70,150,230,.34)", z: 112, n: "물" };
      if (md === "ice") return { c: "rgba(205,236,255,.58)", z: 112, n: "얼음" };
      if (ph === "기체") return null;
      if (ph === "액체") {
        if (sub === "nacl") return { c: "rgba(255,150,70,.30)", z: 104 };
        if (sub === "cu") return { c: "rgba(255,140,70,.34)", z: 104 };
        if (sub === "sugar") return { c: "rgba(190,120,50,.38)", z: 104 };
        return { c: "rgba(70,150,230,.34)", z: 104 };
      }
      if (sub === "h2o") return { c: "rgba(205,236,255,.50)", z: 104 };
      return { c: "rgba(255,255,255,.12)", z: 104 };
    }
    function headline(S, md, ph, c) {
      var gone = wet && T >= 100;
      if (md === "ice") return ["얼음 속에 갇혔다", "물이 얼어 " + (sub === "nacl" ? "이온도" : "입자도") + " 멈췄다"];
      if (md === "aq") {
        if (sub === "nacl") return ["소금물에 불이 켜졌다", "물속을 돌아다니는 Na⁺와 Cl⁻"];
        if (sub === "sugar") return ["설탕물은 캄캄하다", "녹아도 분자는 분자 그대로"];
        if (sub === "cu") return ["구리는 물속에서도 켜진다", "자유 전자가 금속 안을 돈다"];
        return ["순수한 물은 거의 안 통한다", "움직일 이온이 거의 없다"];
      }
      if (sub === "cu") return ["구리는 늘 불이 켜진다", (ph === "액체" ? "녹아도 " : "") + "자유 전자가 금속 전체를 돈다"];
      if (sub === "nacl") {
        if (ph === "고체") return [gone ? "물이 날아가고 소금만 남았다" : "전하는 있는데 불이 꺼졌다", "Na⁺와 Cl⁻가 제자리에서 떨기만 한다"];
        return ["녹은 소금에 불이 켜졌다", "풀려난 이온이 전하를 나른다"];
      }
      if (sub === "sugar") {
        if (ph === "고체") return [gone ? "물이 날아가고 설탕만 남았다" : "설탕 결정 — 분자가 쌓였다", "전하를 띤 알갱이가 없다"];
        return ["녹여도 불이 꺼져 있다", "움직이는 것은 중성 분자뿐"];
      }
      if (ph === "고체") return ["얼음 — 거의 통하지 않는다", "중성인 물 분자가 얼어붙었다"];
      if (ph === "기체") return ["수증기로 흩어졌다", "중성 분자가 날아다닌다"];
      return ["순수한 물은 거의 안 통한다", "대부분 중성인 물 분자"];
    }
    /* 입자 목록: 질서 있는 격자(고체·얼음) 또는 흩어진 무리(액체·수용액·기체) */
    function particles(S, md, ph, t) {
      var out = [], i, j, k, n = 0;
      var ordered = ((ph === "고체" && md !== "aq") || md === "ice");
      var gas = (ph === "기체" && md !== "aq");
      var zTop = gas ? HC - 14 : 96;
      var keep = 1;
      if (md === "aq") keep = (sub === "nacl" || sub === "sugar") ? .42 : (sub === "cu" ? 1 : .3);
      if (gas) keep = .28;
      var amp = ordered ? 1.2 + T / 900 : (gas ? 24 : 12);
      for (i = 0; i < NX; i++) for (j = 0; j < NY; j++) for (k = 0; k < NZ; k++) {
        n++;
        if (hashf(n * 3.1) > keep) continue;
        var bx0 = 32 + i * (L - 64) / (NX - 1), by0 = 28 + j * (D - 56) / (NY - 1), bz0 = 18 + k * 34;
        var x, y, z;
        if (ordered) {
          x = bx0 + Math.sin(t * 9 + n * 1.7) * amp; y = by0 + Math.cos(t * 8 + n * 2.3) * amp; z = bz0 + Math.sin(t * 7 + n) * amp;
        } else {
          x = 24 + hashf(n * 17 + 3) * (L - 48) + Math.sin(t * 1.1 + n * 1.7) * amp;
          y = 22 + hashf(n * 31 + 7) * (D - 44) + Math.cos(t * 0.9 + n * 2.3) * amp;
          z = 12 + hashf(n * 53 + 11) * (zTop - 12) + Math.sin(t * 1.3 + n * .7) * amp * .6;
          x = clamp(x, 16, L - 16); y = clamp(y, 16, D - 16); z = clamp(z, 10, zTop);
        }
        var kind = sub === "cu" ? "cu" : (sub === "nacl" ? (((i + j + k) % 2 === 0) ? "na" : "cl") : "mol");
        out.push({ x: x, y: y, z: z, kind: kind, front: ordered ? j === NY - 1 : true });
      }
      return out;
    }
    var signPts = [];
    function drawBall(p) {
      var q = I.P(p.x, p.y, p.z), r;
      if (p.kind === "na") { r = 6.5; ball(ctx, q.x, q.y, r, "#b07cf0"); }
      else if (p.kind === "cl") { r = 9; ball(ctx, q.x, q.y, r, "#3fcf8e"); }
      else if (p.kind === "cu") { r = 9; ball(ctx, q.x, q.y, r, "#d98b5a"); }
      else { r = 8.5; ball(ctx, q.x, q.y, r, sub === "sugar" ? "#e8a838" : "#5aa9ff"); }
      if (p.front) {
        var sg = p.kind === "na" ? "+" : (p.kind === "cl" ? "−" : (p.kind === "cu" ? "+" : ""));
        /* 부호는 앞쪽 공에만, 이미 그린 부호와 가까우면 생략(글자 겹침 방지) */
        if (sg) signPts.push([q.x, q.y, sg, p.kind === "na" ? 10 : 12]);
      }
    }
    function rod(x0) {
      var y0 = D / 2 - 6, y1 = D / 2 + 6;
      I.box(ctx, x0 - 6, y0, 8, x0 + 6, y1, RODZ, "#e6ebf2", "#8d97a8", "#5f6878");
    }
    function polyDots(pts, t, n) {
      var segs = [], tot = 0, i;
      for (i = 1; i < pts.length; i++) { var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
      for (var m = 0; m < n; m++) {
        var d = (((m / n) + t * .22) % 1) * tot;
        for (i = 0; i < segs.length; i++) {
          if (d <= segs[i]) { var f = d / segs[i]; dot(ctx, pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, 2.2, "#ffe9a8", 3); break; }
          d -= segs[i];
        }
      }
    }
    function wire(pts) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "#7a4a26"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
      ctx.strokeStyle = "#e0a070"; ctx.lineWidth = 1.6; ctx.stroke(); ctx.lineCap = "butt"; ctx.lineJoin = "miter";
    }

    function draw(quiet) {
      var S = SUB[sub], md = mode(), ph = phase(S), c = conduct(), t = pT / 1000, k;
      ctx.clearRect(0, 0, W, H);
      /* ── 위: 스튜디오 ── */
      var fl = I.P(L / 2 + 40, D / 2 + 60, -34);
      K.studio(ctx, 0, 0, W, DH, { x: fl.x, y: fl.y + 6, rx: 300, ry: 52 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      /* 가열판(냉각판) */
      var hc = heaterCol(T);
      I.box(ctx, -14, -14, -30, L + 14, D + 14, 0, hc, "#3a3f4a", "#2a2e37");
      if (T >= 300) {
        var hg = I.P(L / 2, D / 2, 0), hot = clamp((T - 300) / 900, 0, 1);
        K.glow(ctx, hg.x, hg.y, 40 + 60 * hot, "rgba(255,120,40," + (.18 + .3 * hot).toFixed(2) + ")", 3);
      }
      /* 유리 칸 뒷벽 */
      I.quad(ctx, I.P(0, 0, 0), I.P(L, 0, 0), I.P(L, 0, HC), I.P(0, 0, HC), "rgba(210,232,255,.22)", "rgba(255,255,255,.55)");
      I.quad(ctx, I.P(0, 0, 0), I.P(0, D, 0), I.P(0, D, HC), I.P(0, 0, HC), "rgba(210,232,255,.16)", "rgba(255,255,255,.55)");
      I.quad(ctx, I.P(0, 0, 0), I.P(L, 0, 0), I.P(L, D, 0), I.P(0, D, 0), "rgba(30,40,60,.35)");
      /* 시료가 차 있는 부분 */
      var F = fillOf(S, md, ph);
      if (F) I.box(ctx, 4, 4, 0, L - 4, D - 4, F.z, F.c, F.c, F.c);
      /* 입자와 전극을 먼 것부터 */
      signPts = [];
      var items = particles(S, md, ph, t), ex1 = 56, ex2 = L - 56;
      items.forEach(function (p) { p.key = p.x + p.y + p.z * .8; });
      items.push({ rod: ex1, key: ex1 + D / 2 + 50 }, { rod: ex2, key: ex2 + D / 2 + 50 });
      items.sort(function (a, b) { return a.key - b.key; });
      items.forEach(function (p) { if (p.rod) rod(p.rod); else drawBall(p); });
      var shown = [];
      for (k = signPts.length - 1; k >= 0; k--) {             /* 앞쪽 공부터, 가까운 부호는 생략 */
        var sp = signPts[k];
        if (shown.some(function (s0) { return Math.abs(s0[0] - sp[0]) < 14 && Math.abs(s0[1] - sp[1]) < 14; })) continue;
        shown.push(sp); text(ctx, sp[2], sp[0] + .5, sp[1] + 4, { s: sp[3], w: "900", a: "center", c: "#fff" });
      }
      if (sub === "cu") for (k = 0; k < 26; k++) {
        var u = (hashf(k * 5.3) + t * (.05 + hashf(k) * .06)) % 1;
        var e = I.P(20 + u * (L - 40), 20 + hashf(k * 7.7) * (D - 40), 12 + hashf(k * 3.3) * 84 + Math.sin(t * 2 + k) * 6);
        dot(ctx, e.x, e.y, 2.2, "#ffd36b", 3);
      }
      /* 유리 앞벽 */
      I.quad(ctx, I.P(0, D, 0), I.P(L, D, 0), I.P(L, D, HC), I.P(0, D, HC), "rgba(220,240,255,.10)", "rgba(255,255,255,.75)");
      I.quad(ctx, I.P(L, 0, 0), I.P(L, D, 0), I.P(L, D, HC), I.P(L, 0, HC), "rgba(160,190,230,.12)", "rgba(255,255,255,.75)");
      if (F) { ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.2; var a1 = I.P(0, D, F.z), a2 = I.P(L, D, F.z), a3 = I.P(L, 0, F.z); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.lineTo(a3.x, a3.y); ctx.stroke(); }
      /* 회로: 전극 → 전구 → 전지 → 전극 */
      var t1 = I.P(ex1, D / 2, RODZ), t2 = I.P(ex2, D / 2, RODZ), BX = 790, BY = 140;
      var w1 = [[t1.x, t1.y], [t1.x, 100], [BX, 100], [BX, BY - 24]];
      var w2 = [[BX, BY + 26], [BX, 196], [t2.x, 196], [t2.x, t2.y]];
      wire(w1); wire(w2);
      /* 전지(가운데 끊고 극판) */
      var cx0 = 640;
      ctx.fillStyle = "#e4eaf1"; ctx.fillRect(cx0 - 10, 186, 20, 20);
      ctx.fillStyle = "#2b2f38"; ctx.fillRect(cx0 - 9, 180, 4, 32); ctx.fillRect(cx0 + 5, 187, 4, 18);
      if (c) { polyDots(w1, t, 9); polyDots(w2, t + 2.3, 9); }
      if (c) { var fk = REDUCE ? 1 : .92 + .08 * Math.sin(t * 13); K.glow(ctx, BX, BY, 26, "rgba(255,215,110," + (.85 * fk).toFixed(2) + ")", 3.4); }
      var bulb = ctx.createRadialGradient(BX - 8, BY - 10, 3, BX, BY, 28);
      bulb.addColorStop(0, c ? "#fffbe8" : "rgba(255,255,255,.7)"); bulb.addColorStop(.5, c ? "#ffd25a" : "rgba(190,205,230,.5)"); bulb.addColorStop(1, c ? "rgba(255,170,40,.8)" : "rgba(150,170,210,.35)");
      ctx.fillStyle = bulb; ctx.beginPath(); ctx.arc(BX, BY, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c ? "rgba(255,230,160,.95)" : "rgba(90,105,135,.7)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = c ? "#fff4c0" : "rgba(80,90,115,.8)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(BX - 10, BY + 8); ctx.lineTo(BX - 5, BY - 5); ctx.lineTo(BX, BY + 3); ctx.lineTo(BX + 5, BY - 5); ctx.lineTo(BX + 10, BY + 8); ctx.stroke();
      ctx.restore();
      /* 이름표 */
      var box = [0, W];
      pill(ctx, c ? "💡 켜짐" : "전구 꺼짐", BX + 34, BY + 5, { s: 12, c: c ? "#ffd36b" : KS.mute, box: box });
      pill(ctx, "전지", cx0, 232, { s: 11, a: "center", c: KS.ink, box: box });
      I.label(ctx, ex2, D / 2, RODZ - 20, "전극", 46, -6, KS.ink, box);
      I.label(ctx, L, D * .78, -15, (T < 0 ? "냉각판 " : "가열판 ") + T + " ℃", 40, 26, T >= 300 ? "#ffb35c" : KS.ink, box);
      var lp = I.P(0, D, F ? F.z : 60);
      pill(ctx, (md === "aq" ? S.k + " 수용액" : S.k + " · " + (md === "ice" ? "얼어붙음" : ph)), lp.x - 12, lp.y - 4, { s: 12, a: "right", c: col(S.col), box: box });
      /* 범례 */
      var ly = 352;
      if (sub === "nacl") {
        ball(ctx, 32, ly, 6.5, "#b07cf0"); text(ctx, "Na⁺", 44, ly + 4, { s: 12, w: "800", c: "#33204f" });
        ball(ctx, 96, ly, 9, "#3fcf8e"); text(ctx, "Cl⁻", 110, ly + 4, { s: 12, w: "800", c: "#14402c" });
      } else if (sub === "cu") {
        ball(ctx, 32, ly, 9, "#d98b5a"); text(ctx, "구리 양이온", 46, ly + 4, { s: 12, w: "800", c: "#5a2e14" });
        K.glow(ctx, 140, ly, 2.4, "rgba(240,180,40,.95)", 3); text(ctx, "자유 전자", 150, ly + 4, { s: 12, w: "800", c: "#5a4210" });
      } else {
        ball(ctx, 32, ly, 8.5, sub === "sugar" ? "#e8a838" : "#5aa9ff"); text(ctx, (sub === "sugar" ? "설탕" : "물") + " 분자 (전하 없음)", 46, ly + 4, { s: 12, w: "800", c: "#24324a" });
      }
      text(ctx, "입자는 확대한 모형", 22, ly + 26, { s: 11, w: "700", c: "#5b6780" });
      K.warn(ctx, W - 14, 30, "⚠ 입자는 수억 배 확대, 개수는 줄인 모형", "right");
      var hl = headline(S, md, ph, c);
      K.bigText(ctx, hl[0], 22, 52, 28, c ? "#ffd35a" : "#ffffff");
      K.bigText(ctx, hl[1], 22, 86, 18, c ? "#ffffff" : "#bfe6ff");

      /* ── 아래: 읽음판 ── */
      var y0 = DH + 8;
      K.stage(ctx, 0, y0, W, H - y0, "lab", { seed: 23 });
      pill(ctx, S.k + " (" + S.f + ") · " + S.bond, 22, y0 + 30, { s: 13, c: col(S.col) });
      pill(ctx, "나르개: " + (c ? (sub === "cu" ? "자유 전자" : "이온") : "없음"), 878, y0 + 30, { s: 12.5, a: "right", c: c ? KS.yellow : KS.mute });
      text(ctx, "녹는점 " + S.mp + " ℃" + (S.bp < 9000 ? " · 끓는점 " + S.bp + " ℃" : " (녹으면서 분해)") + "   |   현재 온도 " + T + " ℃ · " + (md === "aq" ? "물에 녹인 상태" : (md === "ice" ? "물이 얼어 있는 상태" : (wet ? "물이 끓어 날아간 상태" : "그대로"))), 22, y0 + 62, { s: 12, w: "800", c: KS.mute });
      var ordered = ((ph === "고체" && md !== "aq") || md === "ice");
      pill(ctx, sub === "cu" ? "빛나는 점 = 자유 전자, 금속 전체를 돌아다닌다"
        : (sub === "nacl" ? (!ordered ? "＋ － 이온이 자유롭게 움직인다" : "＋ － 이온이 제자리에 묶여 떨기만 한다")
        : "전하를 띠지 않은 분자뿐"), 22, y0 + 96, { s: 12.5, c: KS.ink });
      text(ctx, "움직일 수 있는 전하가 있어야 통한다", 878, y0 + 96, { s: 11.5, a: "right", c: KS.mute });
      mark(ctx, got.a, "소금 녹이기", 15, y0 + 140, { s: 11.5 });
      mark(ctx, got.b, "소금물", 170, y0 + 140, { s: 11.5 });
      mark(ctx, got.c, "설탕 녹이기", 285, y0 + 140, { s: 11.5 });
      mark(ctx, got.d, "구리 녹이기", 440, y0 + 140, { s: 11.5 });
      if (quiet === true) return;
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
    playBtn("b-prop-play", "⏸ 입자 멈추기", "▶ 입자 움직이기", function () { return pPlay; }, function (q) { pPlay = q; });
    K.animate(cv, function (dt) { if (pPlay) { pT += dt; draw(true); } });
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
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>녹는점과 전기 전도성 두 가지만으로 결합을 가려냈습니다. <b>높은 녹는점 + 녹이면 통함 = 이온 결합</b>, <b>낮은 녹는점 + 끝까지 통하지 않음 = 공유 결합(분자)</b>입니다.");
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
        { t: "시료 ㉰ — 녹는점 2,852 ℃ · 고체 ✕ · 녹인 것 ○", a: "ion", why: "±2가 이온이라 끌어당기는 힘이 아주 셉니다. 산화 마그네슘이었습니다." },
        { t: "시료 ㉱ — 녹는점 186 ℃ · 고체 ✕ · 녹인 것 ✕ · 물에 녹인 것 ✕", a: "cov", why: "물에 잘 녹지만 이온이 되지 않습니다. 설탕이었습니다.", hint: "물에 녹는다고 다 이온은 아닙니다." },
        { t: "시료 ㉲ — 녹는점 770 ℃ · 고체 ✕ · 물에 녹인 것 ○", a: "ion", why: "물에 녹자 이온이 풀려났습니다. 염화 칼륨이었습니다." },
        { t: "시료 ㉳ — 녹는점 0 ℃ · 액체 ✕ · 다른 것을 녹이면 ○", a: "cov", why: "스스로는 거의 통하지 않지만 이온을 녹이면 통하게 해 줍니다. 물이었습니다.", hint: "녹는점 0 ℃ 인 이 물질은 무엇일까요?" }
      ],
      doneText: "여섯 시료의 정체가 모두 드러났습니다.",
      onDone: function () { sorted = true; window.sthState("bSort", 1); mission(); }
    });
    window.sthPick({
      mount: "s2-q",
      q: "인류의 생존에 꼭 필요한 <b>물(H₂O)</b>, <b>산소(O₂)</b>, <b>소금(NaCl)</b>을 결합에 따라 나누면?",
      options: [
        "셋 다 이온 결합이다",
        "물과 산소는 공유 결합, 소금은 이온 결합이다",
        "물과 소금은 이온 결합, 산소는 공유 결합이다",
        "셋 다 공유 결합이다"
      ],
      answer: 1,
      why: [
        "물과 산소는 비금속 원소끼리 만난 것이라 이온이 되지 않습니다. 그래서 녹는점이 낮고 전기가 통하지 않습니다.",
        "물(수소+산소)과 산소(산소+산소)는 <b>비금속끼리</b>라 전자를 같이 쓰고, 소금은 <b>금속(나트륨) + 비금속(염소)</b>이라 전자를 주고받습니다.",
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
      (p.indexOf("㉡") === 0 ? "정확했습니다. 이제 ‘왜 설탕은 그렇지 않은가’까지 설명할 수 있게 되었습니다."
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
    question: "감람석 · 휘석 · 운모 · 석영은 모두 같은 부품인 <b>규산염 사면체(SiO₄)</b>로 만들어졌습니다. 그런데 성질이 전혀 다릅니다. 무엇이 다른 걸까요?",
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
        w: "사면체 <b>둘이 산소 하나</b>를 나눠 쓰며 짝을 이룹니다. 독립형과 사슬형 사이에 있는 구조로, 교과서의 다섯 구조(독립형·단사슬·복사슬·판상·망상)에는 따로 들지 않습니다." },
      { nm: "단사슬형", fx: "SiO₃²⁻", ratio: "1 : 3", min: "휘석", col: "--teal",
        w: "산소 <b>두 개</b>를 나눠 쓰며 사슬처럼 길게 이어집니다. 사슬과 사슬 사이가 약해 거의 직각인 <b>두 방향</b>으로 쪼개집니다. 사슬 두 줄이 나란히 붙은 <b>복사슬형</b>(각섬석)은 사면체마다 산소를 2개 또는 3개 나눠 써서 규소 : 산소 = <b>1 : 2.75</b>입니다." },
      { nm: "판상", fx: "Si₂O₅²⁻", ratio: "1 : 2.5", min: "흑운모 · 백운모 · 점토 광물", col: "--violet",
        w: "산소 <b>세 개</b>를 나눠 써서 넓은 판을 이룹니다. 판 안쪽은 튼튼하지만 판과 판 사이는 약해, <b>한 방향으로 얇게</b> 벗겨집니다." },
      { nm: "망상", fx: "SiO₂", ratio: "1 : 2", min: "석영 · 장석", col: "--brand",
        w: "산소 <b>네 개를 모두</b> 나눠 써서 삼차원 그물이 됩니다. 약한 면이 없어 쪼개짐이 없고 매우 단단합니다. 모래알이 바로 이것입니다." }
    ];
    function tet(cx, cy, r, shares) {
      var pts = [[0, -r], [r * 0.88, r * 0.52], [-r * 0.88, r * 0.52]], i;
      /* 사면체의 면(반투명 유리) */
      var fg = ctx.createLinearGradient(cx, cy - r, cx, cy + r * .52);
      fg.addColorStop(0, "rgba(120,230,215,.20)"); fg.addColorStop(1, "rgba(60,120,160,.10)");
      ctx.fillStyle = fg; ctx.beginPath();
      for (i = 0; i < 3; i++) { if (i === 0) ctx.moveTo(cx + pts[i][0], cy + pts[i][1]); else ctx.lineTo(cx + pts[i][0], cy + pts[i][1]); }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(200,235,255,.55)"; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.strokeStyle = "rgba(200,235,255,.32)";
      for (i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + pts[i][0], cy + pts[i][1]); ctx.stroke(); }
      ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy); ctx.lineTo(cx - r * .88, cy + r * .52); ctx.closePath(); ctx.fill();
      ball(ctx, cx, cy, r * 0.27, "--teal");
      text(ctx, "Si", cx, cy + r * 0.11, { s: r * 0.28, w: "900", a: "center", c: "#ffffff" });
      for (i = 0; i < 3; i++) ball(ctx, cx + pts[i][0], cy + pts[i][1], r * 0.21, i < shares ? "--amber" : "#ff6b5a");
      ball(ctx, cx, cy - r * 0.42, r * 0.18, shares > 3 ? "--amber" : "#ff6b5a");
    }
    function draw() {
      paper(ctx, 900, 420);
      var S = ST[sh], i, j;
      pill(ctx, "규산염 사면체 — 이웃과 나눠 쓰는 산소 " + sh + "개", 40, 28, { s: 13.5, c: v(S.col) });
      ball(ctx, 46, 48, 5, "#ff6b5a"); text(ctx, "혼자 쓰는 산소", 56, 52, { s: 11, c: v("--mist") });
      ball(ctx, 166, 48, 5, "--amber"); text(ctx, "이웃과 나눠 쓰는 산소", 176, 52, { s: 11, c: v("--mist") });
      ball(ctx, 320, 48, 5, "--teal"); text(ctx, "규소", 330, 52, { s: 11, c: v("--mist") });
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
      chip(ctx, ix - 10, 66, 250, 224, S.col);
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
    /* 분자식의 원자 수는 아래 첨자로 쓰고, 1은 쓰지 않는다 (CH₄, C₂H₆ …) */
    function sub(k) { return k === 1 ? "" : String(k).split("").map(function (c) { return "₀₁₂₃₄₅₆₇₈₉".charAt(+c); }).join(""); }
    function formula() { return "C" + sub(n) + "H" + sub(shape === "chain" ? 2 * n + 2 : 2 * n); }
    function state() { return bp() > 25 ? "액체" : "기체"; }

    function draw() {
      paper(ctx, 900, 400);
      pill(ctx, (shape === "chain" ? "사슬형" : "고리형") + " 탄화수소 · 탄소 " + n + "개", 40, 28, { s: 13.5, c: v("--violet-700") });
      pill(ctx, "탄소는 원자가 전자가 4개 — 결합을 네 개까지 만든다", 860, 28, { s: 11, a: "right", c: KS.mute });
      var i, x, y;
      if (!ok()) {
        pill(ctx, "🚫 탄소 " + n + "개로는 고리를 만들 수 없습니다", 450, 180, { s: 18, a: "center", c: v("--rose-700") });
        text(ctx, "고리가 되려면 탄소가 적어도 3개는 있어야 합니다.", 450, 212, { s: 13, a: "center", c: v("--mist") });
        $("c-carb-info").innerHTML = "고리를 닫으려면 탄소가 <b>3개 이상</b> 있어야 합니다. 슬라이더를 오른쪽으로 옮기거나 사슬형으로 바꿔 보세요.";
        return;
      }
      var cxm = 430, cym = 176;
      if (shape === "chain") {
        var sp = Math.min(72, 600 / Math.max(1, n - 1));
        var x0 = cxm - (n - 1) * sp / 2;
        ctx.strokeStyle = "rgba(197,180,251,.75)"; ctx.lineWidth = 3.4; ctx.shadowColor = "rgba(162,136,245,.8)"; ctx.shadowBlur = 8;
        for (i = 0; i < n - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(x0 + i * sp, cym + (i % 2 ? -26 : 26));
          ctx.lineTo(x0 + (i + 1) * sp, cym + ((i + 1) % 2 ? -26 : 26));
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        for (i = 0; i < n; i++) {
          x = x0 + i * sp; y = cym + (i % 2 ? -26 : 26);
          var hs = (i === 0 || i === n - 1) ? (n === 1 ? 4 : 3) : 2;
          ctx.strokeStyle = "rgba(255,218,124,.6)"; ctx.lineWidth = 2.2;
          for (var k = 0; k < hs; k++) {
            var a = -Math.PI / 2 + (k - (hs - 1) / 2) * 0.8 + (i % 2 ? Math.PI : 0);
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); ctx.stroke();
            ball(ctx, x + Math.cos(a) * 30, y + Math.sin(a) * 30, 7.5, "--amber");
          }
          ball(ctx, x, y, 15, "--violet");
          text(ctx, "C", x + 1, y + 5, { s: 13, w: "900", a: "center", c: "#ffffff" });
        }
      } else {
        var R = 26 + n * 5.4; cym = 158;
        ctx.strokeStyle = "rgba(197,180,251,.75)"; ctx.lineWidth = 3.4; ctx.shadowColor = "rgba(162,136,245,.8)"; ctx.shadowBlur = 8;
        ctx.beginPath();
        for (i = 0; i <= n; i++) {
          var an2 = -Math.PI / 2 + i * 2 * Math.PI / n;
          if (i === 0) ctx.moveTo(cxm + Math.cos(an2) * R, cym + Math.sin(an2) * R);
          else ctx.lineTo(cxm + Math.cos(an2) * R, cym + Math.sin(an2) * R);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        for (i = 0; i < n; i++) {
          var an3 = -Math.PI / 2 + i * 2 * Math.PI / n;
          x = cxm + Math.cos(an3) * R; y = cym + Math.sin(an3) * R;
          ctx.strokeStyle = "rgba(255,218,124,.6)"; ctx.lineWidth = 2.2;
          for (var k2 = 0; k2 < 2; k2++) {
            var a3 = an3 + (k2 ? 0.45 : -0.45);
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a3) * 28, y + Math.sin(a3) * 28); ctx.stroke();
            ball(ctx, x + Math.cos(a3) * 28, y + Math.sin(a3) * 28, 7.5, "--amber");
          }
          ball(ctx, x, y, 14, "--violet");
          text(ctx, "C", x + 1, y + 5, { s: 12, w: "900", a: "center", c: "#ffffff" });
        }
      }
      ball(ctx, 46, 50, 6, "--violet"); text(ctx, "탄소", 57, 54, { s: 11, c: v("--mist") }); ball(ctx, 96, 50, 5, "--amber"); text(ctx, "수소", 106, 54, { s: 11, c: v("--mist") });
      chip(ctx, 28, 276, 452, 58, "--violet");
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
          ? "탄소가 " + n + "개인 사슬이라 수소는 2 × " + n + " + 2 = <b>" + (2 * n + 2) + "개</b>입니다. 사슬 양 끝의 탄소는 수소 3개, 가운데 탄소는 2개를 붙잡습니다."
          : "고리를 닫으면서 양 끝이 서로 이어졌기 때문에, 같은 탄소 수의 사슬형보다 수소가 <b>2개 적은 " + 2 * n + "개</b>입니다.") +
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
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>탄소 수가 4개까지는 기체, <b>5개(펜테인)</b>부터 액체였습니다. 탄소를 어떻게 잇느냐(사슬 · 고리)만 바꿔도 분자식과 성질이 달라집니다.");
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
      pill(ctx, bio === "pro" ? "아미노산 20종을 이어 붙여 단백질 만들기" : "뉴클레오타이드 4종을 이어 붙여 DNA 만들기",
        40, 28, { s: 13.5, c: v(bio === "pro" ? "--coral-700" : "--teal-700") });
      pill(ctx, "단위체 " + k + "종 · " + len + "개를 이어 붙임", 860, 28, { s: 11.5, a: "right", c: KS.mute });

      /* 사슬 그림 — 살짝 물결치는 구슬 줄 */
      var x0 = 50, sp = Math.min(32, 800 / len), r = Math.min(13, sp / 2 - 1), y = 84;
      function wy(q) { return y + Math.sin(q * .55) * Math.min(8, r * .7); }
      ctx.save(); ctx.strokeStyle = "rgba(200,210,255,.55)"; ctx.lineWidth = 3; ctx.shadowColor = "rgba(127,211,255,.6)"; ctx.shadowBlur = 6;
      ctx.beginPath(); for (i = 0; i < len; i++) { if (i) ctx.lineTo(x0 + i * sp, wy(i)); else ctx.moveTo(x0, wy(0)); } ctx.stroke(); ctx.restore();
      for (i = 0; i < len; i++) {
        var ci = (i * 7 + len * 3) % (bio === "pro" ? 8 : 4);
        ball(ctx, x0 + i * sp, wy(i), r, COL[ci]);
        if (bio === "dna" && r >= 9) text(ctx, "ATGC".charAt(ci), x0 + i * sp + 1, wy(i) + 4, { s: Math.min(11, r), w: "900", a: "center", c: "#ffffff" });
      }
      text(ctx, bio === "pro" ? "구슬 하나 = 아미노산 하나 (20가지 가운데 하나)" : "구슬 하나 = 뉴클레오타이드 하나 (A · T · G · C 가운데 하나)",
        50, y + 36, { s: 11.5, c: v("--mist") });

      /* 가짓수 */
      chip(ctx, 50, 142, 380, 96, "--violet");
      text(ctx, "만들 수 있는 서열의 가짓수", 66, 166, { s: 11, c: v("--mist") });
      text(ctx, k + sup(len) + " =", 66, 202, { s: 17, w: "800" });
      text(ctx, sci(c, 2) + " 가지", 414, 202, { s: 21, w: "900", a: "right", c: v("--violet-700") });
      text(ctx, c < 1e15 ? "= " + Math.round(c).toLocaleString() + " 가지" : "자릿수가 " + (Math.floor(log10(c)) + 1) + "자리입니다",
        66, 226, { s: 11, c: v("--mist") });

      /* 로그 막대 */
      var bx = 470, bw = 390, by = 150, bh = 26;
      pill(ctx, "1조(10¹²) 기준선과 견주기 — 한 칸이 10배", bx, 136, { s: 11.5, c: KS.ink });
      var MAX = 34;
      var f = clamp(log10(c) / MAX, 0, 1);
      meter(ctx, bx, by, bw, bh, f, c > 1e12 ? "--green" : "#8fa0d8");
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
      text(ctx, "사람의 DNA는 염기쌍이 약 30억 개입니다.", 50, 360, { s: 11.5, c: v("--mist") });

      $("c-poly-info").innerHTML = "<b>" + (bio === "pro" ? "아미노산 20종" : "뉴클레오타이드 4종") + "</b>을 <b>" + len + "개</b> 이어 붙이면 순서가 다른 서열을 <b>" + sci(c, 2) + " 가지</b> 만들 수 있습니다.<br>" +
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
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>아미노산은 <b>10개</b>, 뉴클레오타이드는 <b>20개</b>만 이어 붙여도 1조 가지를 넘겼습니다. 다양성은 단위체의 종류가 아니라 <b>순서와 길이</b>에서 나옵니다.");
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
        { t: "RNA", a: "nu", why: "DNA와 같은 단위체로 된 한 가닥 핵산입니다.", hint: "핵산은 DNA 만이 아닙니다." }
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
      (p.indexOf("㉡") === 0 ? "정확했습니다. 이제 그 ‘나눠 쓰는 산소 수’가 운모의 벗겨짐과 석영의 단단함까지 설명한다는 것을 보았습니다."
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
    var gap = 1.1, T = 300, bT = 0, bPlay = !REDUCE;
    var got = window.sthState("dBand") || { a: false, b: false, c: false };
    function ratio() { return Math.exp(-gap / (2 * KB * T)); }
    function kind() { return gap < 0.3 ? 0 : (gap < 3.0 ? 1 : 2); }
    var KN = ["도체", "반도체", "절연체 (부도체)"];
    var KC = ["--teal", "--coral", "--violet"];
    var KE = ["구리 · 은 · 철 · 알루미늄", "저마늄 0.67 eV · 규소 1.12 eV", "다이아몬드 5.47 eV · 유리 · 고무"];

    function draw(quiet) {
      paper(ctx, 900, 420);
      var k = kind(), r = ratio(), i, t = bT / 1000;
      pill(ctx, "띠 간격 " + gap.toFixed(1) + " eV · 온도 " + T + " K", 40, 28, { s: 13.5, c: KS.ink });

      /* 왼쪽 — 분류 */
      chip(ctx, 40, 52, 250, 150, KC[k]);
      text(ctx, "이 물질은", 56, 78, { s: 11, c: v("--mist") });
      text(ctx, KN[k], 56, 112, { s: 24, w: "900", c: v(KC[k]) });
      text(ctx, "보기", 56, 142, { s: 11, c: v("--mist") });
      text(ctx, KE[k], 56, 164, { s: 11.5, w: "800", c: v(KC[k]) });
      text(ctx, "0.3 eV 미만 도체 · 3.0 eV 이상 절연체", 56, 188, { s: 10.5, c: v("--mist") });

      /* 가운데 — 띠 */
      var bx = 320, bw = 320, vTop = 330, gpx = gap * 34;
      var cBot = vTop - gpx, cTop = cBot - 50;
      K.t(ctx, "에너지 ↑", bx - 8, cTop - 8 > 52 ? cTop - 8 : 52, { s: 10.5, a: "right", c: KS.mute });
      /* 원자가 띠: 전자로 꽉 찬 띠 */
      var vb = ctx.createLinearGradient(0, vTop, 0, vTop + 50);
      vb.addColorStop(0, "rgba(127,150,230,.55)"); vb.addColorStop(1, "rgba(60,70,140,.55)");
      ctx.fillStyle = vb; ctx.beginPath(); ctx.roundRect(bx, vTop, bw, 50, 8); ctx.fill();
      for (i = 0; i < 30; i++) dot(ctx, bx + 12 + (i % 15) * 21.5 + Math.sin(t * 3 + i) * 1.2, vTop + 12 + Math.floor(i / 15) * 26, 2.2, "#c9d6ff", 2.2);
      pill(ctx, "원자가 띠 — 전자로 꽉 차 있다", bx + bw / 2, vTop + 31, { s: 11.5, a: "center", c: KS.ink });
      /* 전도띠 */
      var cb = ctx.createLinearGradient(0, cTop, 0, cTop + 50);
      cb.addColorStop(0, rgba(KC[k], .45)); cb.addColorStop(1, rgba(KC[k], .15));
      ctx.fillStyle = cb; ctx.beginPath(); ctx.roundRect(bx, cTop, bw, 50, 8); ctx.fill();
      ctx.strokeStyle = rgba(KC[k], .6); ctx.lineWidth = 1.2; ctx.stroke();
      if (gpx > 6) {
        ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.fillRect(bx, cBot, bw, gpx);
        ctx.strokeStyle = v(KC[k]); ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.strokeRect(bx, cBot, bw, gpx); ctx.setLineDash([]);
        pill(ctx, "띠 간격 " + gap.toFixed(1) + " eV", bx + bw / 2, cBot + gpx / 2 + 6, { s: 12.5, a: "center", c: v(KC[k]) });
      } else {
        pill(ctx, "띠가 거의 붙어 있다", bx + bw / 2, cBot + 8, { s: 12, a: "center", c: v(KC[k]) });
      }
      var nDot = clamp(Math.round(log10(Math.max(r, 1e-30)) + 13), 0, 12);
      for (i = 0; i < nDot; i++) {
        /* 건너뛴 전자는 전도띠 안을 떠돈다 */
        var ex = bx + 18 + ((i % 6) * 55 + t * (22 + i * 3)) % (bw - 36), ey = cTop + 14 + Math.floor(i / 6) * 22 + Math.sin(t * 2.4 + i * 1.3) * 3;
        dot(ctx, ex, ey, 4.5, "#ffd36b", 3.2);
      }
      pill(ctx, "빛나는 노란 점 = 건너뛴 전자 (그림은 어림)", bx + bw / 2, 400, { s: 11, a: "center", c: KS.mute });

      /* 오른쪽 — 수치 */
      var ix = 670;
      text(ctx, "건너뛴 전자의 비율", ix, 78, { s: 12, w: "800" });
      text(ctx, "exp(−Eg / 2kBT)", ix, 98, { s: 10.5, c: v("--mist") });
      text(ctx, r > 1e-30 ? sci(r, 2) : "0에 가깝다", 880, 132, { s: 19, w: "900", a: "right", c: v(KC[k]) });
      var by = 150, bh = 20, bw2 = 210;
      var f = clamp((log10(Math.max(r, 1e-24)) + 24) / 24, 0, 1);
      meter(ctx, ix, by, bw2, bh, f, KC[k]);
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

      if (quiet === true) return;
      $("d-band-info").innerHTML = "띠 간격 <b>" + gap.toFixed(1) + " eV</b> · 온도 <b>" + T + " K</b> · 이 물질은 <b style='color:var(" + KC[k] + ")'>" + KN[k] + "</b> · 건너뛴 전자 비율 <b>" + (r > 1e-30 ? sci(r, 2) : "0에 가까움") + "</b><br>" +
        (k === 0 ? "원자가 띠와 전도띠가 겹치거나 틈이 거의 없습니다. 전자가 언제든 움직일 수 있어 <b>온도와 상관없이</b> 전기가 잘 통합니다. 오히려 온도를 올리면 원자의 떨림이 커져 전자가 부딪히므로 저항이 조금 <b>커집니다</b>."
        : k === 1 ? "틈이 어중간해서, 상온에서는 아주 일부만 건너뜁니다. 그런데 온도를 올리면 건너뛰는 전자가 <b>지수 함수로</b> 늘어나 전기가 훨씬 잘 통하게 됩니다. 금속과 정반대입니다."
        : "틈이 너무 넓어 상온의 열에너지(약 0.026 eV)로는 아무도 건너뛰지 못합니다. 그래서 전기가 통하지 않습니다.");
    }
    function check() {
      var ch = false, r = ratio(), k = kind();
      if (k === 0 && !got.a) { got.a = true; ch = true; }
      if (k === 2 && !got.b) { got.b = true; ch = true; }
      if (k === 1 && r > 1e-6 && Math.exp(-gap / (2 * KB * 300)) <= 1e-6 && !got.c) { got.c = true; ch = true; }  /* 300 K 에서는 못 넘던 반도체를 온도로 넘긴 경우만 */
      if (ch) { window.sthState("dBand", got); mission(); }
    }
    function mission() {
      if (got.a) done("m4-2a");
      if (got.b) done("m4-2b");
      if (got.c) done("m4-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m4-2", true, "<span class='m-tag'>미션 완료</span>같은 식 하나로 <b>도체 · 반도체 · 절연체</b>가 갈렸습니다. 그리고 반도체만은 온도를 올릴수록 전기가 <b>더 잘</b> 통했습니다 — 금속과 반대입니다.");
        ep.clear(1);
      }
    }
    cv._redraw = draw;
    playBtn("d-band-play", "⏸ 전자 멈추기", "▶ 전자 움직이기", function () { return bPlay; }, function (q) { bPlay = q; });
    K.animate(cv, function (dt) { if (bPlay) { bT += dt; draw(true); } });
    $("d-gap").addEventListener("input", function (e) { gap = +e.target.value; $("d-gap-val").textContent = gap.toFixed(1); draw(); check(); });
    $("d-t").addEventListener("input", function (e) { T = +e.target.value; $("d-t-val").textContent = T + " K"; draw(); check(); });
    draw(); mission();
  })();

  /* ------------------------------------------------ 장면 3 — 도핑실 */
  (function () {
    var cv = $("d-dope"), ctx = window.setupCanvas(cv);
    var type = "pure", dop = 12, dT = 0, dPlay = !REDUCE;
    var got = window.sthState("dDope") || { a: false, b: false, c: false };
    var NI = 1.0e10;
    function N() { return Math.pow(10, dop); }
    function boost() { return type === "pure" ? 1 : (N() + NI) / NI; }

    function draw(quiet) {
      paper(ctx, 900, 420);
      var b = boost(), i, j, t = dT / 1000;
      pill(ctx, type === "pure" ? "순수한 규소" : (type === "n" ? "인(P)을 섞은 규소 — n형 반도체" : "붕소(B)를 섞은 규소 — p형 반도체"),
        40, 28, { s: 13.5, c: v(type === "pure" ? "--mist" : (type === "n" ? "--teal-700" : "--coral-700")) });

      /* 규소 결정 — 결합 하나 = 전자 두 개(전자쌍) */
      var x0 = 100, y0 = 98, sp = 110;
      var HB = [[1, 1], [1, 0], [0, 0], [0, 1], [0, 2], [1, 2]], hb = HB[Math.floor(t / 1.4) % HB.length];
      function bond(ax, ay, bx2, by2, hor, skipOne) {
        ctx.strokeStyle = "rgba(160,190,255,.35)"; ctx.lineWidth = 1.4;
        var o = 4;
        ctx.beginPath();
        if (hor) { ctx.moveTo(ax, ay - o); ctx.lineTo(bx2, by2 - o); ctx.moveTo(ax, ay + o); ctx.lineTo(bx2, by2 + o); }
        else { ctx.moveTo(ax - o, ay); ctx.lineTo(bx2 - o, by2); ctx.moveTo(ax + o, ay); ctx.lineTo(bx2 + o, by2); }
        ctx.stroke();
        var mx = (ax + bx2) / 2, my = (ay + by2) / 2;
        dot(ctx, mx + (hor ? -6 : 0), my + (hor ? 0 : -6), 2.4, "#c9d6ff", 2.4);
        if (!skipOne) dot(ctx, mx + (hor ? 6 : 0), my + (hor ? 0 : 6), 2.4, "#c9d6ff", 2.4);
        else { ctx.save(); ctx.shadowColor = v("--violet"); ctx.shadowBlur = 10; ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2.2; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.arc(mx + 6, my, 7, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); text(ctx, "+", mx + 6, my - 10, { s: 12, w: "900", a: "center", c: v("--violet-700") }); }
      }
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        if (i < 2) bond(x0 + i * sp + 26, y0 + j * sp, x0 + (i + 1) * sp - 26, y0 + j * sp, true, type === "p" && i === hb[0] && j === hb[1]);
        if (j < 2) bond(x0 + i * sp, y0 + j * sp + 26, x0 + i * sp, y0 + (j + 1) * sp - 26, false, false);
      }
      for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) {
        var mid = (i === 1 && j === 1), sym = "Si", col2 = "#7d8fb8";
        if (mid && type === "n") { sym = "P"; col2 = "--teal"; }
        if (mid && type === "p") { sym = "B"; col2 = "--coral"; }
        ball(ctx, x0 + i * sp, y0 + j * sp, 25, col2);
        text(ctx, sym, x0 + i * sp + 2, y0 + j * sp + 7, { s: 15, w: "900", a: "center", c: "#ffffff" });
      }
      if (type === "n") {
        /* 남는 전자가 결정 안을 떠돈다 */
        var ex = x0 + sp + 42 + Math.sin(t * .9) * 120 + Math.sin(t * 2.3) * 20, ey = y0 + sp - 38 + Math.cos(t * .7) * 70;
        dot(ctx, ex, ey, 6, "#ffd36b", 3.4);
        text(ctx, "−", ex, ey + 4, { s: 11, w: "900", a: "center", c: "#3a2a00" });
        dot(ctx, 52, 362, 5, "#ffd36b", 3);
        pill(ctx, "남는 전자 ⊖ — 자유롭게 돌아다닌다", 66, 366, { s: 11.5, c: v("--amber-700") });
      } else if (type === "p") {
        /* 양공: 옆 전자가 채우면 빈자리가 다른 결합으로 옮겨 간다 */
        ctx.save(); ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(52, 362, 7, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        pill(ctx, "전자가 빠진 자리 ⊕(양공) — 이 자리가 옮겨 다닌다", 66, 366, { s: 11.5, c: v("--violet-700") });
      } else {
        pill(ctx, "규소는 원자가 전자가 4개라 이웃 넷과 결합을 꽉 채웁니다", 40, 366, { s: 11.5, c: KS.mute });
      }

      /* 오른쪽 */
      var ix = 470;
      chip(ctx, ix, 52, 390, 104, type === "n" ? "--teal" : (type === "p" ? "--coral" : "--brand"));
      text(ctx, "1 cm³ 안의 전하 나르개 수", ix + 16, 76, { s: 11, c: v("--mist") });
      text(ctx, type === "pure" ? sci(NI, 1) + " 개 (고유 전자뿐)" : sci(N(), 1) + " 개", ix + 16, 108, { s: 18, w: "900", c: v("--violet-700") });
      text(ctx, type === "pure" ? "온도가 올라야만 늘어납니다" : ("나르개는 " + (type === "n" ? "⊖ 전자" : "⊕ 양공")), ix + 16, 136, { s: 11.5, w: "800", c: v("--mist") });

      text(ctx, "순수한 규소에 견준 전도도", ix, 190, { s: 12, w: "800" });
      text(ctx, b < 10 ? b.toFixed(1) + " 배" : (b >= 1e6 ? sci(b, 1) + " 배" : Math.round(b).toLocaleString() + " 배"),
        860, 226, { s: 24, w: "900", a: "right", c: v(b >= 1e6 ? "--green-700" : "--ink") });
      var by = 240, bw = 390, bh = 22;
      var f = clamp(log10(b) / 9, 0, 1);
      meter(ctx, ix, by, bw, bh, f, b >= 1e6 ? "--green" : "--brand");
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

      if (quiet === true) return;
      $("d-dope-info").innerHTML = (type === "pure"
        ? "순수한 규소에서는 열에너지로 스스로 건너뛴 <b>고유 전자</b>(1 cm³ 당 약 10¹⁰ 개)만이 전류를 나릅니다. 구리(약 10²³ 개)와 견주면 터무니없이 적어, 사실상 잘 통하지 않습니다."
        : type === "n"
        ? "인은 원자가 전자가 <b>5개</b>입니다. 이웃 규소 넷과 결합하고도 전자가 <b>하나 남아</b> 자유롭게 돌아다닙니다. 음(negative) 전하가 나르개라서 <b>n형</b>이라고 합니다."
        : "붕소는 원자가 전자가 <b>3개</b>입니다. 결합을 채우기에 전자가 <b>하나 모자라</b> 빈자리(양공)가 생기고, 옆 전자가 그 자리로 옮겨 오면 빈자리가 반대로 움직입니다. 양(positive) 전하가 움직이는 셈이라 <b>p형</b>이라고 합니다.") +
        "<br>지금 전도도는 순수한 규소의 <b>" + (b < 10 ? b.toFixed(1) : (b >= 1e6 ? sci(b, 1) : Math.round(b).toLocaleString())) + " 배</b>입니다.";
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
        window.sthMission("m4-3", true, "<span class='m-tag'>미션 완료</span>불순물을 아주 조금 넣는 것만으로 전도도가 <b>수백만 배</b> 뛰었습니다. 넣는 원소를 고르면 나르개가 <b>전자(n형)</b>가 될지 <b>양공(p형)</b>이 될지도 정할 수 있습니다.");
        ep.clear(2);
      }
    }
    cv._redraw = draw;
    playBtn("d-dope-play", "⏸ 나르개 멈추기", "▶ 나르개 움직이기", function () { return dPlay; }, function (q) { dPlay = q; });
    K.animate(cv, function (dt) { if (dPlay && type !== "pure") { dT += dt; draw(true); } });
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
    var V = 0, oT = 0, oPlay = !REDUCE;
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
    function draw(quiet) {
      paper(ctx, 900, 400);
      var I = cur(V), mA = I * 1000, fwd = V > 0, i, t = oT / 1000;
      pill(ctx, "p-n 접합 다이오드 · 걸어 준 전압 " + V.toFixed(2) + " V", 40, 28, { s: 13.5, c: KS.ink });

      /* 접합 그림 — 순방향이면 양공과 전자가 접합면으로 밀려와 만나고, 역방향이면 가운데가 빈다 */
      var jx = 50, jy = 70, jw = 370, jh = 150, mid = jx + jw / 2;
      var pg = ctx.createLinearGradient(jx, jy, jx, jy + jh); pg.addColorStop(0, "rgba(255,157,99,.32)"); pg.addColorStop(1, "rgba(160,80,40,.32)");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(jx, jy, jw / 2, jh, [10, 0, 0, 10]); ctx.fill();
      var ng = ctx.createLinearGradient(jx, jy, jx, jy + jh); ng.addColorStop(0, "rgba(46,211,189,.30)"); ng.addColorStop(1, "rgba(20,110,100,.30)");
      ctx.fillStyle = ng; ctx.beginPath(); ctx.roundRect(mid, jy, jw / 2, jh, [0, 10, 10, 0]); ctx.fill();
      /* 공핍층(나르개가 없는 띠) 폭: 역방향일수록 넓어지고 순방향일수록 좁아진다 */
      var dep = clamp(18 - V * 22, 4, 62);
      ctx.fillStyle = "rgba(5,8,24,.55)"; ctx.fillRect(mid - dep, jy, dep * 2, jh);
      ctx.strokeStyle = "rgba(200,210,255,.45)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(jx, jy, jw, jh, 10); ctx.stroke();
      ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mid, jy); ctx.lineTo(mid, jy + jh); ctx.stroke(); ctx.setLineDash([]);
      pill(ctx, "p형 — 양공 ⊕", jx + jw / 4, jy + 22, { s: 12, a: "center", c: v("--coral-700") });
      pill(ctx, "n형 — 전자 ⊖", jx + jw * 3 / 4, jy + 22, { s: 12, a: "center", c: v("--teal-700") });
      var on = mA >= 1, spd = on ? clamp(mA / 5, .2, 1) * 60 : 0;
      for (i = 0; i < 8; i++) {
        var row = Math.floor(i / 4), cc = i % 4, yy = jy + 62 + row * 44;
        /* 양공: 왼쪽에서 오른쪽으로, 전자: 오른쪽에서 왼쪽으로 */
        var span = jw / 2 - dep - 18, hxp = on ? jx + 12 + ((cc * span / 4 + t * spd) % span) : jx + 26 + cc * (jw / 2 - dep - 30) / 4;
        var exn = on ? mid + jw / 2 - 12 - ((cc * span / 4 + t * spd) % span) : mid + dep + 14 + cc * (jw / 2 - dep - 30) / 4;
        ctx.save(); ctx.shadowColor = v("--coral"); ctx.shadowBlur = 6; ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hxp, yy, 8, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        ball(ctx, exn, yy, 7.5, "--teal");
      }
      if (on) dot(ctx, mid, jy + jh / 2 + Math.sin(t * 7) * 30, 5, "#fff1b0", 3.4);
      if (on || V < 0) K.arrow(ctx, fwd ? { x: jx + 40, y: jy + jh + 28 } : { x: jx + jw - 40, y: jy + jh + 28 }, fwd ? { x: jx + jw - 40, y: jy + jh + 28 } : { x: jx + 40, y: jy + jh + 28 }, v(on ? "--green" : "--mist"), 3, 13);
      pill(ctx, V === 0 ? "전압 없음" : (fwd ? (on ? "순방향 — 전류가 흐른다" : "순방향이지만 전압이 모자라다") : "역방향 — 막힌다"),
        jx + jw / 2, jy + jh + 58, { s: 13, a: "center", c: v(on ? "--green-700" : "--mist") });
      text(ctx, Math.abs(mA) >= 0.001 ? "전류 " + mA.toFixed(3) + " mA" : "전류 " + sci(I, 1) + " A (거의 0)",
        jx + jw / 2, jy + jh + 84, { s: 13, w: "800", a: "center", c: v("--ink") });

      /* I-V 곡선 */
      pill(ctx, "전압 – 전류 곡선 · 한쪽으로만 흐른다", 500, 52, { s: 12, c: KS.blue });
      var g = K.chart(ctx, { x: 460, y: 62, w: 420, h: 248, pl: 44, x0: -2, x1: 1, y0: 0, y1: 5, xt: 3, yt: 5,
        xf: function (q) { return (q > 0 ? "+" : (q < 0 ? "−" : "")) + Math.abs(Math.round(q)) + " V"; }, yf: function (q) { return Math.round(q) + " mA"; } });
      K.line(ctx, { x: g.X(0), y: g.T }, { x: g.X(0), y: g.B }, "rgba(200,210,255,.4)", 1.2);
      K.line(ctx, { x: g.L, y: g.Y(1) }, { x: g.R, y: g.Y(1) }, KS.orange, 1.4, [4, 4]);
      pill(ctx, "1 mA", g.L + 8, g.Y(1) - 6, { s: 10.5, c: KS.orange });
      var pts = [];
      for (i = 0; i <= 120; i++) { var vv = -2 + i / 120 * 3; pts.push([vv, clamp(cur(vv) * 1000, 0, 5)]); }
      K.plot(ctx, g, pts, KS.blue);
      dot(ctx, g.X(V), g.Y(clamp(mA, 0, 5)), 5.5, "--coral", 3.4);

      mark(ctx, got.a, "순방향 1 mA 넘기기", 50, 332, { s: 11.5 });
      mark(ctx, got.b, "역방향에서 막히는 것 확인", 250, 332, { s: 11.5 });
      text(ctx, "이 문 하나가 LED · 태양 전지 · 트랜지스터의 바탕입니다", 870, 332, { s: 11, a: "right", c: v("--mist") });
      text(ctx, "순방향으로 약 0.6 V를 넘겨야 전류가 눈에 띄게 흐르기 시작합니다.", 50, 366, { s: 11.5, c: v("--mist") });

      if (quiet === true) return;
      $("d-diode-info").innerHTML = "전압 <b>" + V.toFixed(2) + " V</b> · 전류 <b>" + (Math.abs(mA) >= 0.001 ? mA.toFixed(3) + " mA" : sci(I, 1) + " A") + "</b><br>" +
        (V > 0
          ? "p형 쪽에 ＋, n형 쪽에 －를 건 <b>순방향</b>입니다. 양공과 전자가 접합면으로 서로 밀려와 만나면서 전류가 흐릅니다. 다만 접합면의 장벽을 넘어야 해서, 약 <b>0.6 V</b>를 넘기기 전에는 전류가 거의 흐르지 않습니다."
          : V < 0
          ? "반대로 건 <b>역방향</b>입니다. 양공과 전자가 접합면에서 서로 <b>멀어져</b> 가운데가 텅 비므로 전류가 거의 흐르지 않습니다. 지금 전류는 " + sci(Math.abs(I), 1) + " A, 순방향의 10억 분의 1도 되지 않습니다."
          : "전압이 0이라 전류도 0입니다. 슬라이더를 오른쪽(순방향)과 왼쪽(역방향)으로 움직여 견주어 보세요.");
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
    /* 전류가 흐를 때만 나르개가 움직인다 */
    playBtn("d-diode-play", "⏸ 나르개 멈추기", "▶ 나르개 움직이기", function () { return oPlay; }, function (q) { oPlay = q; });
    K.animate(cv, function (dt) { if (oPlay && cur(V) * 1000 >= 1) { oT += dt; draw(true); } });
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
        { t: "다이아몬드", a: "ins", why: "띠 간격 5.47 eV. 탄소로만 되어 있어도 전기는 통하지 않습니다. 같은 탄소인 흑연은 잘 통한다는 점과 견주어 보세요.", hint: "띠 간격이 3.0 eV를 넘으면 어디로 갈까요?" },
        { t: "고체 소금", a: "ins", why: "이온이 제자리에 묶여 있어 통하지 않습니다. 녹이면 통한다는 것은 이야기 ②에서 확인했습니다.", hint: "‘고체’ 상태라는 데 주의하세요." }
      ],
      doneText: "전기적 성질로 물질을 세 무리로 갈랐습니다.",
      onDone: function () { sorted = true; window.sthState("dSort", 1); mission(); }
    });
    window.sthPick({
      mount: "s4-q",
      q: "물질의 전기적 성질을 이용한 소재에 대한 설명으로 옳은 것은?",
      options: [
        "초전도체는 온도를 아주 <b>높이면</b> 저항이 0이 된다",
        "초전도체는 어떤 온도 <b>아래</b>에서 저항이 0이 되어, MRI의 강한 전자석에 쓰인다",
        "그래핀은 전기가 통하지 않아 절연체로 쓰인다",
        "반도체는 불순물을 넣으면 전기가 더 <b>안</b> 통하게 된다"
      ],
      answer: 1,
      why: [
        "반대입니다. 초전도 현상은 임계 온도 <b>아래로</b> 식혔을 때 나타납니다.",
        "저항이 0이면 전류가 흘러도 열이 나지 않아, 아주 센 전류를 계속 흘릴 수 있습니다. 그래서 MRI나 입자 가속기의 전자석에 씁니다.",
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
      (p.indexOf("㉢") === 0 ? "정확했습니다. 이제 그 까닭이 <b>띠 간격</b>에 있다는 것까지 설명할 수 있게 되었습니다."
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
    { key: "r4", label: "④ 거꾸로 가는 물질" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
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
    { key: "r4", label: "④ 거꾸로 가는 물질" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "네 사건을 꿰는 한 문장" }
});

})();
