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
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, yr = 1972, g = 0;
      var x0 = 60, x1 = 640, y0 = 24, y1 = 230;
      function X(y) { return x0 + (y - 1962) / (2026 - 1962) * (x1 - x0); }
      function Y(v) { return y1 - (v + 1) / 5 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        ctx.clearRect(0, 0, W, cv.H);
        var CH = cv.H, R = lodOf(yr) || L72;
        KT.studio(ctx, 0, 0, 650, CH, null);
        var gc = KT.chart(ctx, { x: 8, y: 30, w: 636, h: CH - 34, x0: 1962, x1: 2026, y0: -1, y1: 4, xt: 8, yt: 5, light: true, xl: "연도", yl: "하루가 86,400 초보다 길었던 시간 (ms)", xf: function (v2) { return String(Math.round(v2)); } });
        KT.line(ctx, { x: gc.L, y: gc.Y(0) }, { x: gc.R, y: gc.Y(0) }, LC.line, 1.2, [5, 4]);
        LOD.forEach(function (r) { if (r[2]) { ctx.fillStyle = "rgba(224,49,49,.75)"; ctx.fillRect(gc.X(r[0]) - 2.5, gc.B - r[2] * 12, 5, r[2] * 12); } });
        KT.plot(ctx, gc, LOD.map(function (r) { return [r[0], r[1]]; }), LC.blue, { light: true, w: 2.6 });
        KT.line(ctx, { x: gc.X(yr), y: g.T }, { x: gc.X(yr), y: g.B }, LC.orange, 1.2, [3, 3]);
        KT.planet(ctx, gc.X(yr), gc.Y(R[1]), 6.5, "#ffd8a8", "#d9480f");
        KT.pill(ctx, "빨간 막대 = 그해 넣은 윤초(1 초)", gc.R - 6, gc.T + 20, { a: "right", s: 11, c: "#ffa8a8" });
        var cd = sideCard(ctx, 660, W, CH, "원자시계로 잰 하루");
        lt(ctx, R[1].toFixed(2) + " ms", cd.px, 64, { s: 24, w: "900", c: LC.blue });
        KT.row(ctx, "고른 해", yr + "년", cd.px, cd.R, 100, LC.orange);
        KT.row(ctx, "그해 윤초", R[2] + " 번", cd.px, cd.R, 126, LC.red);
        KT.row(ctx, "1 ms", "0.001 초", cd.px, cd.R, 152);
        KT.row(ctx, "내 답 (한 해 어긋남)", g.toFixed(2) + " 초", cd.px, cd.R, 186, LC.violet);
        KT.tip(ctx, "하루치 × 365.25 = 한 해치", cd.px - 4, 204, cd.w + 8, null);
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
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, h = 1;
      var x0 = 60, x1 = 600, y0 = 24, y1 = 230;
      function X(y) { return x0 + (y - 1980) / (2026 - 1980) * (x1 - x0); }
      function Y(a) { return y1 - a / 180 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        ctx.clearRect(0, 0, W, cv.H);
        var CH = cv.H;
        KT.studio(ctx, 0, 0, 650, CH, null);
        var gr = KT.chart(ctx, { x: 8, y: 30, w: 636, h: CH - 34, x0: 1978, x1: 2028, y0: 0, y1: 200, xt: 5, yt: 4, light: true, xl: "연도", yl: "지구에서 보이저 1호까지 (au)", xf: function (v2) { return String(Math.round(v2)); } });
        KT.line(ctx, { x: gr.L, y: gr.Y(40) }, { x: gr.R, y: gr.Y(40) }, LC.violet, 1.4, [5, 4]);
        KT.pill(ctx, "명왕성 궤도 ≈ 40 au", gr.X(1981), gr.Y(40) - 8, { s: 10.5, c: "#d0bfff" });
        KT.plot(ctx, gr, VOY.map(function (r) { return [r[0], r[1]]; }), LC.blue, { light: true, w: 2.8 });
        /* 끝점의 작은 탐사선 */
        var ex = gr.X(V26[0]), ey = gr.Y(V26[1]);
        ctx.fillStyle = "#eef1f6"; ctx.beginPath(); ctx.arc(ex - 2, ey - 14, 9, Math.PI * 0.1, Math.PI * 0.9, true); ctx.fill();
        ctx.strokeStyle = "#6b7384"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = metal(ctx, ex - 5, 0, ex + 5, 0, "#fff3b8", "#e2a52a", "#8a5a10"); ctx.fillRect(ex - 5, ey - 12, 10, 8);
        KT.planet(ctx, ex, ey, 5, "#ffd8a8", "#d9480f");
        var cd = sideCard(ctx, 660, W, CH, "빛 소식이 오는 시간");
        lt(ctx, h.toFixed(1) + " 시간", cd.px, 64, { s: 24, w: "900", c: LC.violet });
        KT.row(ctx, V26[0] + "년 거리", V26[1].toFixed(2) + " au", cd.px, cd.R, 100, LC.blue);
        KT.row(ctx, "1 au", "1.496 × 10⁸ km", cd.px, cd.R, 126);
        KT.row(ctx, "빛의 속력", "2.998 × 10⁵ km/s", cd.px, cd.R, 152);
        KT.tip(ctx, "시간 = 거리 ÷ 속력", cd.px - 4, 172, cd.w + 8, null);
        lt(ctx, "초 ÷ 3,600 = 시간", cd.px, 236, { s: 11, c: LC.mute });
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
