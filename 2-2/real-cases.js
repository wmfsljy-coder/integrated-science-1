/* 통합과학1 Ⅱ-2 물질의 규칙성과 성질 — 실제 자료
   r1 이온화 에너지의 봉우리 — 주기마다 가장 큰 원소
   r2 규칙의 예외 — 2주기에서 이온화 에너지가 앞 원소보다 작아지는 곳
   자료: data/elements.js (PubChem 주기율표, 이온화 에너지는 NIST 값) */
(function () {
"use strict";
var E = (window.REAL_ELEMENTS || { rows: [] }).rows;      /* [원자 번호, 기호, 첫 이온화 에너지 eV, 원자 반지름 pm, 분류] */
function ie(z) { var r = E[z - 1]; return r ? r[2] : null; }
function sym(z) { var r = E[z - 1]; return r ? r[1] : "?"; }
var KN = { 3: "리튬", 4: "베릴륨", 5: "붕소", 6: "탄소", 7: "질소", 8: "산소", 9: "플루오린", 10: "네온" };
var SRC = "<small>출처: 미국 국립보건원 PubChem 주기율표(이온화 에너지는 NIST 원자 스펙트럼 자료), 사본은 이 단원의 data/elements.js.</small>";


/* ---- 밝은 스튜디오 + 입체 미니어처 (../assets/kit.js 의 K.studio · K.card) ---- */
var KK = window.sthKit, LT = KK.LT;
function lt(ctx, s, x, y, o) { o = o || {}; KK.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LT.ink }); }
function floorShadow(ctx, x, y, rx, ry, a) {
  var g = ctx.createRadialGradient(x, y, 2, x, y, rx);
  g.addColorStop(0, "rgba(20,30,50," + (a || 0.28) + ")"); g.addColorStop(0.6, "rgba(20,30,50,.07)"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function slab(ctx, x, y, w, h, d, cTop, cFront, cSide) {
  ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d * 0.6); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  if (cSide) { ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d * 0.6); ctx.lineTo(x + w + d, y + h - d * 0.6); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = cFront; ctx.fillRect(x, y, w, h);
}
function bar3(ctx, x, y, w, h, d, hex) {
  var g = ctx.createLinearGradient(0, y, 0, y + Math.max(1, h)); g.addColorStop(0, KK.tint(hex, 1.1)); g.addColorStop(1, KK.tint(hex, .85));
  slab(ctx, x, y, w, h, d, KK.tint(hex, 1.25), g, KK.tint(hex, .68));
}
function sideCard(ctx, x, W, H, title) { KK.card(ctx, x, 0, W - x, H, title); return { px: x + 18, R: W - 18, w: W - x - 36 }; }
function ball(ctx, x, y, r, hex) { KK.planet(ctx, x, y, r, hex, KK.tint(hex, 0.4)); }
/* 핵자 공을 둥글게 쌓은 원자핵 (반지름 R, 공 n개) */
function nucleus(ctx, cx, cy, R, n) {
  var rb = Math.max(3, R / (1.25 * Math.sqrt(n)) * 1.05), sp = [], k;
  for (k = 0; k < n; k++) { var a = k * 2.39996, d = rb * 1.25 * Math.sqrt(k); sp.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * .92, k]); }
  sp.sort(function (p, q) { return p[1] - q[1]; });
  sp.forEach(function (p) { ball(ctx, p[0], p[1], rb, p[2] % 2 ? "#d5dae8" : "#ff7b6b"); });
}

/* 전자 껍질 (1~18번만 쓴다) */
function shells(z) { return z <= 2 ? [z] : (z <= 10 ? [2, z - 2] : [2, 8, z - 10]); }
/* 원자 미니어처: 원자핵 공 + 껍질 고리 + 전자 공(가장 바깥 전자는 주황) */
function atom(ctx, cx, cy, z, label, colr) {
  var sh = shells(z), k, j;
  floorShadow(ctx, cx, cy + 46, 40, 6, .2);
  for (k = 0; k < sh.length; k++) {
    var r = 14 + k * 11, last = k === sh.length - 1;
    ctx.strokeStyle = last ? "rgba(232,89,12,.55)" : "rgba(40,60,110,.25)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * .9, 0, 0, 6.2832); ctx.stroke();
    for (j = 0; j < sh[k]; j++) { var a = -Math.PI / 2 + j * 2 * Math.PI / sh[k]; ball(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r * .9, last ? 3.4 : 2.4, last ? "#ff922b" : "#748ffc"); }
  }
  ball(ctx, cx, cy, 9, "#7048e8");
  KK.t(ctx, sym(z), cx, cy + 4, { s: 10, w: "900", a: "center", c: "#ffffff" });
  lt(ctx, label, cx, cy + 62, { s: 11.5, w: "900", a: "center", c: colr });
}
var MC = { "--coral-700": "#d9480f", "--amber-700": "#e67700" };
function plot(H, ctx, W, CH, from, to, mark) {
  ctx.clearRect(0, 0, W, CH);
  KK.studio(ctx, 0, 0, 640, CH, null);
  var g = KK.chart(ctx, { x: 6, y: 50, w: 628, h: CH - 54, x0: from - 0.5, x1: to + 0.5, y0: 0, y1: 25, xt: 1, yt: 5, light: true, yl: "첫 이온화 에너지 (eV)", xf: function () { return ""; } });
  function X(z) { return g.X(z); }
  function Y(e) { return g.Y(e); }
  [3, 11, 19].forEach(function (z) { if (z > from && z <= to) KK.line(ctx, { x: X(z - 0.5), y: g.T }, { x: X(z - 0.5), y: g.B }, "rgba(20,40,90,.28)", 1, [4, 4]); });
  var pts = []; for (var z = from; z <= to; z++) if (ie(z) != null) pts.push([z, ie(z)]);
  KK.plot(ctx, g, pts, LT.blue, { w: 2.2, light: true });
  for (z = from; z <= to; z++) {
    if (ie(z) == null) continue;
    var m = mark && mark[z];
    if (m) KK.planet(ctx, X(z), Y(ie(z)), 7.5, MC[m] === "#d9480f" ? "#ff8a6a" : "#ffc04d", MC[m]); else KK.planet(ctx, X(z), Y(ie(z)), 3.6, "#74c0fc", "#1864ab");
    lt(ctx, sym(z), X(z), g.B + 15, { s: to - from > 20 ? 9.5 : 11.5, w: m ? "900" : "700", a: "center", c: m ? MC[m] : LT.mute });
  }
  return { X: X, Y: Y };
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료가 교과서의 규칙과 어떻게 맞았는지 적어 보세요.",
  cases: [
  {
    id: "r1", sec: "01", tag: "실제 자료 · 이온화 에너지", title: "이온화 에너지의 봉우리", short: "봉우리",
    who: "⚡", name: "원자 분광 연구실",
    say: "“원자에서 전자 하나를 떼어 내는 데 드는 에너지를 <b>첫 이온화 에너지</b>라고 해요. 아래는 원자 번호 1~36의 <b>실제 측정값</b>입니다. 그래프에 봉우리가 되풀이되는 게 보이나요? <b>2주기와 3주기에서 각각 가장 큰 원소</b>를 찾아 주세요.”",
    predict: {
      q: "같은 주기에서 이온화 에너지가 가장 큰 원소는 어느 족일까요?",
      options: ["㉠ 1족(알칼리 금속)", "㉡ 17족(할로젠)", "㉢ 18족(비활성 기체)"],
      answer: 2
    },
    task: "슬라이더 두 개로 <b>2주기(Li ~ Ne)</b>와 <b>3주기(Na ~ Ar)</b>에서 이온화 에너지가 가장 큰 원소를 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W, a = 3, b = 11;
      function draw() {
        var mk = {}; mk[a] = "--coral-700"; mk[b] = "--amber-700";
        plot(H, ctx, W, cv.H, 1, 36, mk);
        KK.bigText(ctx, "주기마다 가장 큰 곳 찾기", 18, 36, 20, "#ffffff");
        var cd = sideCard(ctx, 652, W, cv.H, "고른 두 원소");
        KK.row(ctx, "2주기 " + sym(a), ie(a).toFixed(2) + " eV", cd.px, cd.R, 60, "#d9480f");
        KK.row(ctx, "3주기 " + sym(b), ie(b).toFixed(2) + " eV", cd.px, cd.R, 86, "#e67700");
        KK.tip(ctx, "바깥 껍질이 꽉 찰수록 떼기 어렵다", cd.px - 4, 100, cd.w + 8, null);
        if (a <= 18) atom(ctx, cd.px + 52, 196, a, sym(a) + " (2주기)", "#d9480f");
        if (b <= 18) atom(ctx, cd.R - 52, 196, b, sym(b) + " (3주기)", "#e67700");
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "2주기에서 고른 원소", min: 3, max: 10, step: 1, value: 3, fmt: function (x) { return x + "번 " + sym(x); }, onInput: function (x) { a = x; api.changed(); draw(); } });
      api.slider({ label: "3주기에서 고른 원소", min: 11, max: 18, step: 1, value: 11, fmt: function (x) { return x + "번 " + sym(x); }, onInput: function (x) { b = x; api.changed(); draw(); } });
      api.info("점선은 주기가 바뀌는 곳입니다. " + SRC
        + "<div data-link='{\"id\":\"pubchem-ie\",\"title\":\"PubChem 주기율표\",\"src\":\"미국 국립보건원\",\"url\":\"https://pubchem.ncbi.nlm.nih.gov/periodic-table/\",\"ask\":\"보기 방식을 Ionization Energy로 바꿔, 4주기(K ~ Kr)에서 가장 큰 원소와 그 값을 찾아 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var ok2 = a === 10, ok3 = b === 18;
          if (ok2 && ok3) return { ok: true, msg: "네온 21.56 eV, 아르곤 15.76 eV — 두 주기 모두 18족이 봉우리입니다." };
          return { ok: false, msg: (ok2 ? "2주기는 맞았습니다. " : "2주기의 " + sym(a) + "보다 큰 원소가 있습니다. ") + (ok3 ? "3주기는 맞았습니다." : "3주기의 " + sym(b) + "보다 큰 원소가 있습니다.") };
        }
      };
    },
    hints: ["그래프에서 각 주기의 오른쪽 끝을 보세요.", "주기마다 가장 높은 점은 마지막 원소입니다."],
    solution: "2주기 <b>네온(10번)</b>, 3주기 <b>아르곤(18번)</b> — 모두 18족.",
    why: "같은 주기에서는 오른쪽으로 갈수록 핵의 양전하가 커져 원자가 전자를 세게 당기므로 이온화 에너지가 대체로 커지고, 전자 껍질이 꽉 찬 18족에서 가장 큽니다. 다음 주기의 1족은 전자가 새 껍질에 들어가 핵에서 멀어지므로 이온화 에너지가 뚝 떨어집니다. 이 봉우리가 주기마다 되풀이되는 것이 <b>주기성</b>입니다.<br>"
      + "주기율표는 이런 측정값이 쌓인 결과입니다. 18족이 반응을 거의 하지 않고, 1족이 전자를 쉽게 잃어 양이온이 되는 까닭도 이 그래프로 설명됩니다."
  },
  {
    id: "r2", sec: "01", tag: "실제 자료 · 규칙의 예외", title: "규칙대로 가지 않는 두 곳", short: "예외",
    who: "🔍", name: "자료 분석 동아리",
    say: "“‘같은 주기에서는 오른쪽으로 갈수록 이온화 에너지가 커진다’고 배웠어요. 그런데 2주기 실제 자료를 하나씩 보면 <b>앞 원소보다 오히려 작아지는 곳이 두 군데</b> 있어요. 그 두 원소를 찾아 주세요.”",
    predict: {
      q: "실제 측정값이 교과서의 규칙과 조금 다를 때, 과학자는 어떻게 할까요?",
      options: ["㉠ 측정이 틀렸다고 보고 지운다", "㉡ 규칙을 통째로 버린다", "㉢ 큰 흐름은 규칙으로 두고, 예외가 생기는 까닭을 더 자세한 원리로 설명한다"],
      answer: 2
    },
    task: "슬라이더 두 개로 2주기에서 <b>앞 원소보다 이온화 에너지가 작아지는 원소 두 개</b>를 고르세요(앞쪽 하나, 뒤쪽 하나).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W, a = 4, b = 7;
      function draw() {
        var mk = {}; mk[a] = "--coral-700"; mk[b] = "--amber-700";
        var p = plot(H, ctx, W, cv.H, 3, 10, mk);
        KK.bigText(ctx, "앞 원소보다 작아지는 곳", 18, 36, 20, "#ffffff");
        for (var z = 4; z <= 10; z++) {
          var d = ie(z) - ie(z - 1);
          KK.pill(ctx, (d >= 0 ? "+" : "") + d.toFixed(2), (p.X(z) + p.X(z - 1)) / 2, p.Y((ie(z) + ie(z - 1)) / 2) - 12, { s: 10.5, a: "center", c: d < 0 ? "#ffa8a8" : "#e8ecff", box: [0, 640] });
        }
        var cd = sideCard(ctx, 652, W, cv.H, "고른 두 곳");
        KK.row(ctx, "앞쪽 " + sym(a), ie(a).toFixed(2) + " eV", cd.px, cd.R, 60, "#d9480f");
        KK.row(ctx, "뒤쪽 " + sym(b), ie(b).toFixed(2) + " eV", cd.px, cd.R, 86, "#e67700");
        KK.tip(ctx, "빨간 숫자 = 앞 원소보다 작아짐", cd.px - 4, 100, cd.w + 8, null);
        atom(ctx, cd.px + 52, 196, a, sym(a) + " " + a + "번", "#d9480f");
        atom(ctx, cd.R - 52, 196, b, sym(b) + " " + b + "번", "#e67700");
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "앞쪽 예외", min: 4, max: 7, step: 1, value: 4, fmt: function (x) { return x + "번 " + sym(x) + " " + ie(x).toFixed(2) + " eV"; }, onInput: function (x) { a = x; api.changed(); draw(); } });
      api.slider({ label: "뒤쪽 예외", min: 7, max: 10, step: 1, value: 7, fmt: function (x) { return x + "번 " + sym(x) + " " + ie(x).toFixed(2) + " eV"; }, onInput: function (x) { b = x; api.changed(); draw(); } });
      api.info("점과 점 사이의 숫자는 앞 원소와의 차이(eV)입니다. " + SRC);
      draw();
      return {
        judge: function () {
          var ok1 = a === 5, ok2 = b === 8;
          if (ok1 && ok2) return { ok: true, msg: "붕소(8.30) < 베릴륨(9.32), 산소(13.62) < 질소(14.53) — 두 곳에서 흐름이 꺾입니다." };
          return { ok: false, msg: (ok1 ? "앞쪽은 맞았습니다. " : KN[a] + "의 값은 앞 원소보다 큽니다. ") + (ok2 ? "뒤쪽은 맞았습니다." : KN[b] + "의 값은 앞 원소보다 " + (ie(b) > ie(b - 1) ? "큽니다." : "작지만 앞쪽과 같은 곳이에요.")) };
        }
      };
    },
    hints: ["빨간 숫자(음수)가 붙은 곳을 찾으세요.", "Be → B, N → O 사이를 보세요."],
    solution: "<b>붕소(5번)</b>와 <b>산소(8번)</b>.",
    why: "붕소는 2p 오비탈에 처음 들어간 전자를 떼어 내는데, 이 전자는 2s 전자보다 에너지가 조금 높아 떼기 쉽습니다. 산소는 2p 오비탈 하나에 전자 두 개가 짝지어 들어가 서로 밀어내므로, 질소보다 전자 하나를 떼기가 쉬워요(자세한 원리는 화학 과목에서 배웁니다).<br>"
      + "실제 자료는 교과서의 규칙보다 울퉁불퉁합니다. 큰 흐름(주기성)은 그대로 두고, 예외가 나온 자리에서 더 깊은 원리를 찾아내는 것이 과학이 발전하는 방식입니다."
  }
  ]
});
})();
