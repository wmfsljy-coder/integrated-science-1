/* 통합과학1 Ⅰ-1 과학의 기본량 — 실제 자료
   r1 하루는 정말 86,400 초일까 — 지구 자전으로 잰 하루와 원자시계의 초(IERS)
   r2 보이저 1호의 빛 소식은 몇 시간 걸려 올까 — 과학적 표기법과 단위 바꾸기(NASA JPL)
   자료: data/iers-lod.js, data/voyager1.js */
(function () {
"use strict";
var LOD = (window.REAL_LOD || { rows: [] }).rows;               /* [연도, 초과 ms, 윤초 수, 날수] */
var VOY = (window.REAL_VOYAGER || { rows: [] }).rows;           /* [연도, au] */
/* ---- 밝은 스튜디오 말투 (../assets/kit.js 의 K.studio · K.chart · K.card) ---- */
var KT = window.sthKit, LC = KT.LT;
function lt(ctx, s, x, y, o) { o = o || {}; KT.t(ctx, s, x, y, { s: o.s || 12, w: o.w || "700", a: o.a, c: o.c || LC.ink }); }
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

function lodOf(y) { for (var i = 0; i < LOD.length; i++) if (LOD[i][0] === y) return LOD[i]; return null; }
var L72 = lodOf(1972) || [1972, 3.1, 0], DRIFT = L72[1] * 365.25 / 1000;
var LEAPS = LOD.reduce(function (s, r) { return s + r[2]; }, 0), LASTLEAP = LOD.reduce(function (s, r) { return r[2] ? r[0] : s; }, 0);
var V26 = VOY.length ? VOY[VOY.length - 1] : [2026, 170], AU = 1.496e8, C = 299792.458, LT = V26[1] * AU / C / 3600;
var SRC1 = "<small>출처: 국제 지구 자전·좌표계 사업(IERS) EOP 20 C04(파리 천문대) — 하루 길이가 86,400 SI 초보다 긴 시간(LOD)의 연평균과 윤초. 사본은 data/iers-lod.js.</small>";
var SRC2 = "<small>출처: NASA 제트추진연구소(JPL) Horizons 시스템, 보이저 1호의 지구 중심 거리(매년 1월 1일). 1 au(천문단위) = 1.496 × 10⁸ km, 빛의 속력 = 2.998 × 10⁵ km/s. 사본은 data/voyager1.js.</small>";

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 시간·길이의 기본 단위를 왜 자연 상수로 정하는지 실제 자료로 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "01", tag: "실제 자료 · 시간의 표준", title: "하루는 정말 86,400 초일까", short: "하루의 길이",
    who: "⏱️", name: "표준 시각 연구실",
    say: "“예전에는 하루(태양이 남중했다가 다시 남중하기까지 걸리는 평균 시간)를 86,400으로 나눈 것이 1 초였어요. 지금은 세슘-133 원자가 내는 전자기파(마이크로파)가 9,192,631,770 번 진동하는 시간이 1 초입니다. 아래는 원자시계로 잰 <b>실제 하루의 길이가 86,400 초보다 얼마나 길었는지</b>(밀리초, ms)를 해마다 평균한 값이에요. 1972년의 값으로 <b>그해 한 해 동안 쌓인 어긋남(초)</b>을 구해 주세요.”",
    predict: {
      q: "지구가 한 바퀴 도는 시간은 해마다 똑같을까요?",
      options: ["㉠ 정확히 똑같아서 시계의 기준으로 완벽하다", "㉡ 1천분의 몇 초씩 들쭉날쭉해, 정밀한 기준으로는 원자시계가 필요하다", "㉢ 해마다 1 분씩 늘어난다"],
      answer: 1
    },
    task: "그래프에서 1972년의 값을 읽고, 1년(365.25 일) 동안 쌓인 어긋남을 슬라이더로 맞추세요(± 0.1 초).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(266), ctx = cv.ctx, W = cv.W, yr = 1972, g = 0;
      /* 왼쪽: 받침 위 지구본과 원자시계(두 시계 바늘이 어긋난 만큼 = 내 답) · 가운데: 흰 카드 속 실제 자료 그래프 · 오른쪽: 판정 카드 */
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        var CH = cv.H, R = lodOf(yr) || L72;
        KT.studio(ctx, 0, 0, 340, CH, { x: 170, y: CH - 30, rx: 160, ry: 16 });
        KT.bigText(ctx, "하루 = 86,400 초 + " + R[1].toFixed(2) + " ms", 14, 34, 15, "#ffd35a");
        /* 지구본(자전축 23.5° 기울기) */
        var ex = 86, ey = 126, er = 48;
        floorShadow(ctx, ex + 6, CH - 30, 54, 9, 0.28);
        cylV(ctx, ex, ey + er + 18, CH - 32, 34, 10, "#ffffff", "#e9eef5", "#b9c3d2", "#f6f8fb");
        ctx.strokeStyle = metal(ctx, ex - er, 0, ex + er, 0, "#f3f5f8", "#aab3c3", "#5b6476"); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(ex, ey, er + 7, Math.PI * 0.55, Math.PI * 1.45); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ex, ey + er + 7); ctx.lineTo(ex, ey + er + 18); ctx.stroke();
        KT.planet(ctx, ex, ey, er, "#8fd3ff", "#1c4f8a");
        ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, er, 0, 6.2832); ctx.clip();
        ctx.fillStyle = "rgba(64,160,90,.85)";
        [[-18, -20, 16, 11], [8, -6, 20, 14], [-10, 18, 12, 9], [24, 22, 9, 7]].forEach(function (b) { ctx.beginPath(); ctx.ellipse(ex + b[0], ey + b[1], b[2], b[3], 0.4, 0, 6.2832); ctx.fill(); });
        ctx.restore();
        var ta = 23.5 * Math.PI / 180;
        ctx.strokeStyle = "#3d4454"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex - Math.sin(ta) * (er + 14), ey - Math.cos(ta) * (er + 14)); ctx.lineTo(ex + Math.sin(ta) * (er + 14), ey + Math.cos(ta) * (er + 14)); ctx.stroke();
        KT.arrow(ctx, { x: ex - 34, y: ey - er - 4 }, { x: ex + 30, y: ey - er - 6 }, LC.orange, 2.5, 9);
        lt(ctx, "지구 자전 1바퀴", ex, CH - 8, { s: 12, a: "center", c: LC.mute, w: "800" });
        /* 원자시계 상자: 숫자판 + 두 초바늘(원자시계 파랑 · 지구 시각 주황) */
        var bx = 178, by = 92;
        floorShadow(ctx, bx + 76, CH - 30, 80, 9, 0.26);
        slab(ctx, bx, by, 132, CH - 32 - by, 22, "#eef1f5", "#cfd5de", "#9aa3b0");
        ctx.fillStyle = "#12203a"; ctx.beginPath(); ctx.roundRect(bx + 10, by + 10, 112, 24, 5); ctx.fill();
        lt(ctx, "Cs-133 · 86,400 s", bx + 66, by + 27, { s: 11, w: "900", a: "center", c: "#8ce99a" });
        var dx = bx + 66, dy = by + 82, dr = 38;
        KT.planet(ctx, dx, dy, dr + 4, "#ffffff", "#7d8698");
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(dx, dy, dr, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = LC.ink; ctx.lineWidth = 1;
        for (var tk = 0; tk < 60; tk++) { var aa = tk / 60 * 6.2832, l0 = tk % 5 ? dr - 4 : dr - 8; ctx.beginPath(); ctx.moveTo(dx + Math.sin(aa) * l0, dy - Math.cos(aa) * l0); ctx.lineTo(dx + Math.sin(aa) * dr, dy - Math.cos(aa) * dr); ctx.stroke(); }
        var a1 = 0, a2 = -g / 60 * 6.2832;
        if (g > 0.01) { ctx.fillStyle = "rgba(232,89,12,.25)"; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.arc(dx, dy, dr - 6, -Math.PI / 2 + a2, -Math.PI / 2 + a1); ctx.closePath(); ctx.fill(); }
        ctx.lineCap = "round";
        ctx.strokeStyle = LC.blue; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.sin(a1) * (dr - 6), dy - Math.cos(a1) * (dr - 6)); ctx.stroke();
        ctx.strokeStyle = LC.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.sin(a2) * (dr - 6), dy - Math.cos(a2) * (dr - 6)); ctx.stroke();
        ctx.lineCap = "butt"; KT.planet(ctx, dx, dy, 4, "#ffffff", "#3d4454");
        lt(ctx, "원자시계", dx, CH - 8, { s: 12, a: "center", c: LC.mute, w: "800" });
        KT.pill(ctx, "어긋남 " + g.toFixed(2) + " 초", dx, by - 10, { a: "center", s: 12, c: "#ffc078", box: [0, 340] });
        /* 가운데: 흰 카드 속 그래프 */
        KT.card(ctx, 350, 0, 300, CH, "하루가 86,400 초보다 긴 시간 (ms)");
        var gc = KT.chart(ctx, { x: 352, y: 38, w: 294, h: CH - 42, pl: 34, pb: 30, x0: 1962, x1: 2026, y0: -1, y1: 4, xt: 4, yt: 5, light: true, xf: function (v2) { return String(Math.round(v2)); } });
        KT.line(ctx, { x: gc.L, y: gc.Y(0) }, { x: gc.R, y: gc.Y(0) }, LC.line, 1.2, [5, 4]);
        LOD.forEach(function (r) { if (r[2]) { ctx.fillStyle = "rgba(224,49,49,.75)"; ctx.fillRect(gc.X(r[0]) - 1.5, gc.B - r[2] * 10, 3, r[2] * 10); } });
        KT.plot(ctx, gc, LOD.map(function (r) { return [r[0], r[1]]; }), LC.blue, { light: true, w: 2.2 });
        KT.line(ctx, { x: gc.X(yr), y: gc.T }, { x: gc.X(yr), y: gc.B }, LC.orange, 1.2, [3, 3]);
        KT.planet(ctx, gc.X(yr), gc.Y(R[1]), 6, "#ffd8a8", "#d9480f");
        lt(ctx, "빨간 막대 = 그해 넣은 윤초", gc.R - 4, gc.T + 14, { s: 11, a: "right", c: LC.red, w: "800" });
        var cd = sideCard(ctx, 660, W, CH, "원자시계로 잰 하루");
        lt(ctx, R[1].toFixed(2) + " ms", cd.px, 62, { s: 24, w: "900", c: LC.blue });
        KT.row(ctx, "고른 해", yr + "년", cd.px, cd.R, 96, LC.orange);
        KT.row(ctx, "그해 윤초", R[2] + " 번", cd.px, cd.R, 120, LC.red);
        KT.row(ctx, "1 ms", "0.001 초", cd.px, cd.R, 144);
        KT.row(ctx, "내 답 (한 해 어긋남)", g.toFixed(2) + " 초", cd.px, cd.R, 174, LC.violet);
        KT.tip(ctx, "하루치 × 365.25 = 한 해치", cd.px - 4, 190, cd.w + 8, null);
      }
            cv.canvas._redraw = draw;
      api.slider({ label: "읽을 해", min: 1962, max: 2026, step: 1, value: 1972, fmt: function (x) { return x + "년"; }, onInput: function (x) { yr = x; draw(); } });
      api.slider({ label: "1972년 한 해 동안 쌓인 어긋남", min: 0, max: 3, step: 0.02, value: 0, fmt: function (x) { return x.toFixed(2) + " 초"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("1 ms = 0.001 초. 하루마다 조금씩 길어진 시간을 1년치 모두 더해 보세요. " + SRC1
        + "<div data-link='{\"id\":\"iers-leap\",\"title\":\"IERS 공지 C — 윤초\",\"src\":\"국제 지구 자전·좌표계 사업\",\"url\":\"https://hpiers.obspm.fr/iers/bul/bulc/bulletinc.dat\",\"ask\":\"가장 최근 공지에서 ‘다음에 윤초를 넣는다/넣지 않는다’ 중 어느 쪽인지, 그리고 지금 UTC와 원자시(TAI)가 몇 초 차이 나는지 찾아 오세요(영어 문서입니다. ‘leap second’와 ‘UTC-TAI’가 들어 있는 줄을 찾으세요).\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(g - DRIFT) <= 0.1) return { ok: true, msg: L72[1].toFixed(2) + " ms × 365.25 ≈ " + DRIFT.toFixed(2) + " 초 — 이 무렵에는 해마다 1 초 남짓 어긋나, 1972~1979년 8년 동안 윤초를 9번 넣었습니다(1972년에는 6월·12월 두 번)." };
          return { ok: false, msg: g.toFixed(2) + " 초는 " + (g < DRIFT ? "적습니다" : "많습니다") + ". 1972년 하루의 초과분이 한 해 동안 몇 번 쌓이는지 생각해 보세요." };
        }
      };
    },
    hints: ["1972년의 값은 약 " + L72[1].toFixed(1) + " ms입니다.", L72[1].toFixed(2) + " ms × 365.25 ÷ 1000 = ? 초"],
    solution: L72[1].toFixed(2) + " × 365.25 ÷ 1000 ≈ <b>" + DRIFT.toFixed(2) + " 초</b>.",
    why: "지구의 자전은 밀물·썰물의 마찰, 대기와 바다의 움직임, 지구 내부의 변화 때문에 1천분의 몇 초씩 빨라졌다 느려졌다 합니다. 특히 밀물·썰물의 마찰은 자전을 꾸준히 늦춰 하루가 100년에 약 2 ms씩 길어지는데, SI 초는 1800년대의 하루 길이에 맞춰 정해졌기 때문에 지금의 하루는 대개 86,400 초보다 조금 깁니다. 하루에 3 ms 라도 1년이면 1 초가 넘게 쌓여, 지구 자전으로 정한 시각과 원자시계가 어긋납니다. 그래서 1967년에 1 초를 세슘 원자의 진동으로 다시 정했고, 둘의 차이가 0.9 초를 넘지 않게 1972년부터 " + LASTLEAP + "년까지 윤초를 " + LEAPS + "번 넣었습니다.<br>"
      + "2020~2025년에는 지구가 오히려 조금 빨리 돌아(값이 0 아래) 윤초가 필요 없었고, 국제도량형총회는 2022년, 늦어도 2035년부터는 윤초를 넣지 않도록(허용 차이를 크게 늘리도록) 정했습니다. 기본 단위를 변하지 않는 자연 상수로 정하는 까닭이 바로 이것입니다."
  },
  {
    id: "r2", sec: "02", tag: "실제 자료 · 우주의 스케일", title: "보이저 1호의 소식은 몇 시간 걸려 올까", short: "보이저 1호",
    who: "🛰️", name: "심우주 통신 센터",
    say: "“1977년에 떠난 보이저 1호는 사람이 만든 것 가운데 가장 멀리 간 물체예요. NASA가 계산한 실제 위치로 보면 <b>" + V26[0] + "년 1월 1일</b>에 지구에서 <b>" + V26[1].toFixed(2) + " au</b> 떨어져 있었습니다. 1 au = 1.496 × 10⁸ km, 빛의 속력은 약 3.0 × 10⁵ km/s입니다. 보이저가 보낸 전파(빛)가 지구에 닿기까지 <b>몇 시간</b> 걸릴까요?”",
    predict: {
      q: "보이저 1호의 신호가 지구에 오는 데 걸리는 시간은 대략?",
      options: ["㉠ 몇 초", "㉡ 몇 분", "㉢ 하루 가까이"],
      answer: 2
    },
    task: "거리를 km로 바꾸고 빛의 속력으로 나누어, 신호가 오는 데 걸리는 시간을 슬라이더로 맞추세요(± 0.5 시간).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(260), ctx = cv.ctx, W = cv.W, h = 1;
      var SR = KT.rng(5), STARS = []; for (var si = 0; si < 40; si++) STARS.push([SR(), SR(), SR()]);
      /* 왼쪽: 아크릴 진열장 속 태양계 바깥(지구 → 보이저 1호, 전파가 오는 길) + 받침 위 24시간 시계(내 답) · 가운데: 흰 카드 속 거리 그래프 */
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        var CH = cv.H;
        KT.studio(ctx, 0, 0, 340, CH, { x: 170, y: CH - 28, rx: 160, ry: 14 });
        KT.bigText(ctx, V26[1].toFixed(1) + " au 떨어진 곳", 14, 34, 18, "#ffffff");
        var qx = 12, qy = 72, qw = 192, qh = 146, qd = 40;
        acrylic(ctx, qx, qy, qw, qh, qd, "rgba(16,26,58,.94)", function () {
          STARS.forEach(function (s) { ctx.fillStyle = "rgba(255,255,255," + (0.3 + s[2] * 0.6) + ")"; ctx.fillRect(qx + s[0] * (qw + qd), qy - qd * 0.6 + s[1] * (qh + qd * 0.6), 1.6, 1.6); });
          var sx = qx + 26, sy = qy + 92, vx = qx + qw - 4, vy = qy + 30;
          KT.glow(ctx, sx - 6, sy, 9, "rgba(255,200,80,.95)", 3);
          KT.planet(ctx, sx + 16, sy + 4, 5, "#a5d8ff", "#1c4f8a");
          ctx.strokeStyle = "rgba(165,216,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(sx - 6, sy, 22, 9, 0, 0, 6.2832); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(sx - 6, sy, 60, 24, 0, 0, 6.2832); ctx.stroke();
          /* 전파: 보이저 → 지구 쪽으로 퍼지는 둥근 물결 */
          for (var k = 1; k <= 4; k++) { var t = k / 5, wx2 = vx + (sx + 16 - vx) * t, wy2 = vy + (sy + 4 - vy) * t; ctx.strokeStyle = "rgba(255,212,59," + (0.85 - t * 0.5) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(wx2, wy2, 7, Math.PI * 0.5, Math.PI * 1.25); ctx.stroke(); }
          ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.beginPath(); ctx.moveTo(sx + 16, sy + 4); ctx.lineTo(vx, vy); ctx.stroke(); ctx.restore();
          /* 보이저 1호: 접시 안테나 + 몸체 */
          ctx.fillStyle = "#eef1f6"; ctx.beginPath(); ctx.ellipse(vx, vy, 5, 11, -0.5, 0, 6.2832); ctx.fill();
          ctx.fillStyle = metal(ctx, vx, 0, vx + 10, 0, "#fff3b8", "#e2a52a", "#8a5a10"); ctx.fillRect(vx + 3, vy - 3, 10, 7);
          ctx.strokeStyle = "#cfd5de"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(vx + 13, vy); ctx.lineTo(vx + 30, vy + 6); ctx.stroke();
        });
        lt(ctx, "지구", qx + 42, qy + 116, { s: 12, w: "900", c: "#ffffff" });
        KT.pill(ctx, "보이저 1호", qx + qw - 34, qy + 66, { a: "center", s: 12, c: "#ffd8a8", box: [0, 340] });
        KT.warn(ctx, qx + qw / 2 + 20, CH - 12, "⚠ 거리는 실제 비율이 아님", "center");
        /* 받침 위 24시간 시계 — 시침이 내 답(시간)을 가리킨다 */
        var cx = 296, cy = 146, cr = 36;
        floorShadow(ctx, cx + 4, CH - 30, 40, 7, 0.26);
        cylV(ctx, cx, cy + cr + 6, CH - 32, 24, 7, "#ffffff", "#e9eef5", "#b9c3d2", "#f6f8fb");
        KT.planet(ctx, cx, cy, cr + 4, "#ffffff", "#7d8698");
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 6.2832); ctx.fill();
        var hf = Math.min(h, 24) / 24;
        if (h > 0) { ctx.fillStyle = "rgba(112,72,232,.18)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, cr - 3, -Math.PI / 2, -Math.PI / 2 + hf * 6.2832); ctx.closePath(); ctx.fill(); }
        ctx.strokeStyle = LC.ink; ctx.lineWidth = 1;
        for (var tk = 0; tk < 24; tk++) { var aa = tk / 24 * 6.2832, l0 = tk % 6 ? cr - 4 : cr - 8; ctx.beginPath(); ctx.moveTo(cx + Math.sin(aa) * l0, cy - Math.cos(aa) * l0); ctx.lineTo(cx + Math.sin(aa) * cr, cy - Math.cos(aa) * cr); ctx.stroke(); }
        [[0, "0"], [6, "6"], [12, "12"], [18, "18"]].forEach(function (q) { var aa = q[0] / 24 * 6.2832; lt(ctx, q[1], cx + Math.sin(aa) * (cr - 16), cy - Math.cos(aa) * (cr - 16) + 4, { s: 11, a: "center", c: LC.mute, w: "900" }); });
        var ha = hf * 6.2832; ctx.lineCap = "round"; ctx.strokeStyle = LC.violet; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ha) * (cr - 8), cy - Math.cos(ha) * (cr - 8)); ctx.stroke(); ctx.lineCap = "butt";
        KT.planet(ctx, cx, cy, 4, "#ffffff", "#3d4454");
        KT.pill(ctx, h.toFixed(1) + " 시간", cx, cy - cr - 14, { a: "center", s: 12, c: "#d0bfff", box: [240, 340] });
        /* 가운데: 흰 카드 속 그래프 */
        KT.card(ctx, 350, 0, 300, CH, "지구에서 보이저 1호까지 (au)");
        var gr = KT.chart(ctx, { x: 352, y: 38, w: 294, h: CH - 42, pl: 34, pb: 30, x0: 1978, x1: 2028, y0: 0, y1: 200, xt: 5, yt: 4, light: true, xf: function (v2) { return String(Math.round(v2)); } });
        KT.line(ctx, { x: gr.L, y: gr.Y(40) }, { x: gr.R, y: gr.Y(40) }, LC.violet, 1.4, [5, 4]);
        lt(ctx, "명왕성 궤도 ≈ 40 au", gr.R - 4, gr.Y(40) + 14, { s: 11, a: "right", c: LC.violet, w: "800" });
        KT.plot(ctx, gr, VOY.map(function (r) { return [r[0], r[1]]; }), LC.blue, { light: true, w: 2.6 });
        KT.planet(ctx, gr.X(V26[0]), gr.Y(V26[1]), 5, "#ffd8a8", "#d9480f");
        var cd = sideCard(ctx, 660, W, CH, "빛 소식이 오는 시간");
        lt(ctx, h.toFixed(1) + " 시간", cd.px, 62, { s: 24, w: "900", c: LC.violet });
        KT.row(ctx, V26[0] + "년 거리", V26[1].toFixed(2) + " au", cd.px, cd.R, 96, LC.blue);
        KT.row(ctx, "1 au", "1.496 × 10⁸ km", cd.px, cd.R, 120);
        KT.row(ctx, "빛의 속력", "2.998 × 10⁵ km/s", cd.px, cd.R, 144);
        KT.tip(ctx, "시간 = 거리 ÷ 속력", cd.px - 4, 162, cd.w + 8, null);
        lt(ctx, "초 ÷ 3,600 = 시간", cd.px, CH - 14, { s: 12, c: LC.mute });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "신호가 오는 데 걸리는 시간", min: 0, max: 30, step: 0.1, value: 1, fmt: function (x) { return x.toFixed(1) + " 시간"; }, onInput: function (x) { h = x; api.changed(); draw(); } });
      api.info("시간 = 거리 ÷ 속력. 초로 나온 값을 3,600으로 나누면 시간입니다. " + SRC2
        + "<div data-link='{\"id\":\"voyager-now\",\"title\":\"NASA — 보이저 1·2호는 지금 어디에?\",\"src\":\"미국 항공우주국\",\"url\":\"https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/\",\"ask\":\"쪽 가운데 표(Voyager 1 열)에서 지금 지구와의 거리(Distance from Earth, AU 값)와 빛이 한 번 오는 데 걸리는 시간(One-Way Light Time)을 찾아, 이 사례의 값(2026년 1월 1일)과 비교해 오세요. 그사이 몇 au 더 멀어졌나요?\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(h - LT) <= 0.5) return { ok: true, msg: V26[1].toFixed(2) + " × 1.496 × 10⁸ km ≈ " + (V26[1] * AU / 1e10).toFixed(2) + " × 10¹⁰ km, ÷ 3.0 × 10⁵ km/s ≈ " + (V26[1] * AU / C / 1e4).toFixed(2) + " × 10⁴ 초 ≈ " + LT.toFixed(1) + " 시간." };
          return { ok: false, msg: h.toFixed(1) + " 시간은 " + (h < LT ? "짧습니다" : "깁니다") + ". 지수끼리 먼저 나누면 계산이 쉬워요(10¹⁰ ÷ 10⁵ = 10⁵)." };
        }
      };
    },
    hints: [V26[1].toFixed(2) + " × 1.496 × 10⁸ ≈ 2.54 × 10¹⁰ km 입니다(2.5로 줄이면 답이 0.4 시간쯤 짧아지니, 계산 중간에는 세 자리를 남기세요).", "2.54 × 10¹⁰ ÷ 3.0 × 10⁵ ≈ 8.5 × 10⁴ 초. 3,600으로 나누세요."],
    solution: "약 <b>" + LT.toFixed(1) + " 시간</b> — 하루(24 시간)에 거의 닿았습니다.",
    why: "아주 크거나 작은 수는 a × 10ⁿ 꼴의 과학적 표기로 쓰면 곱셈·나눗셈이 지수의 덧셈·뺄셈이 되어 계산이 쉬워집니다. 보이저 1호는 해마다 약 3.6 au씩 멀어져, " + V26[0] + "년 말에는 빛으로 꼬박 하루 걸리는 거리(1 광일 ≈ 173 au)에 이릅니다. 지구에서 명령을 보내면 대답을 듣기까지 이틀이 걸리는 셈입니다.<br>"
      + "거리를 km 로만 쓰면 0이 너무 많아 감이 오지 않습니다. 그래서 천문학에서는 au, 광년 같은 큰 단위를 함께 씁니다."
  }
  ]
});
})();
