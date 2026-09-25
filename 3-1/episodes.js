/* 통합과학1 Ⅲ-1 지구시스템 — 소단원별 이야기 세 편
   01 모래 한 알의 여행 / 02 세 개의 난로 / 03 갈라지는 땅
   공용 부품: ../assets/theme.js (sthUnit·sthState·sthGate·sthWork·setupCanvas·cssVar·drawArrow),
             ../assets/story.js (sthStory·sthMission·sthSort·sthOrder·sthPick), ../assets/share.js (sthShare) */
(function () {
"use strict";

window.sthUnit("is1-3-1");

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
function wrap(ctx, s, maxW, o) {                 /* 글자 단위 줄바꿈 (한글) */
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  var line = "", lines = [];
  for (var i = 0; i < s.length; i++) {
    var t = line + s.charAt(i);
    if (ctx.measureText(t).width > maxW && line.length) { lines.push(line); line = s.charAt(i); }
    else line = t;
  }
  if (line.length) lines.push(line);
  return lines;
}
function wrapText(ctx, s, x, y, maxW, lh, o) {
  var lines = wrap(ctx, s, maxW, o);
  for (var i = 0; i < lines.length; i++) text(ctx, lines[i], x, y + i * lh, o);
  return lines.length;
}
function axes(ctx, x0, y0, x1, y1) {
  ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
}
function card(ctx, x, y, w, h, col) {
  ctx.fillStyle = col || v("--card-2");
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.fill();
}
function rows(ctx, list, x, y, w, gap, opt) {     /* [라벨, 값] 표 */
  opt = opt || {};
  for (var i = 0; i < list.length; i++) {
    var yy = y + i * gap;
    card(ctx, x, yy, w, gap - 5, list[i][2] ? v(list[i][2]) : null);
    text(ctx, list[i][0], x + 12, yy + (gap - 5) / 2 + 4, { s: opt.s || 11.5, c: v("--mist") });
    text(ctx, list[i][1], x + w - 12, yy + (gap - 5) / 2 + 4, { s: (opt.s || 11.5) + 0.5, w: "800", a: "right", c: list[i][3] ? v(list[i][3]) : v("--ink") });
  }
}
function pointOnCanvas(canvas, e) {
  var r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (canvas._w / r.width), y: (e.clientY - r.top) * (canvas._h / r.height) };
}

/* =========================================================================
   이야기 ① 모래 한 알의 여행
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 */
  window.sthGate({
    gate: "g1", key: "p1", title: "조사관의 첫 추리",
    question: "분석표를 보고 짐작해 보세요. 이 모래 한 알은 지금 내 손에 오기까지 지구시스템의 <b>어느 권역</b>을 거쳐 왔을까요?",
    options: ["㉠ 지권 한 곳", "㉡ 지권과 수권 두 곳", "㉢ 지권·수권·기권 세 곳", "㉣ 네 권역 모두"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 물의 체류 시간 ------------------------------------------------ */
  (function () {
    var canvas = $("c-water"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    /* 저장량 km³, 해마다 드나드는 양 km³/년 (널리 쓰이는 추정값) */
    var ST = [
      { id: "sea", name: "바닷물", vol: 1338000000, flow: 434000, col: "--brand", note: "지구 전체 물의 약 96.5%" },
      { id: "ice", name: "빙하", vol: 24100000, flow: 0, col: "--cold", note: "민물의 대부분이 여기 얼어 있다" },
      { id: "gnd", name: "지하수", vol: 23400000, flow: 0, col: "--violet", note: "우리가 쓰는 민물의 대부분" },
      { id: "riv", name: "하천", vol: 2120, flow: 36000, col: "--teal", note: "육지에서 바다로 돌려보내는 통로" },
      { id: "atm", name: "대기(수증기)", vol: 12900, flow: 505000, col: "--coral", note: "저장량은 가장 적은데 드나드는 양은 가장 많다" }
    ];
    var sel = "sea", k = 1;
    var got = window.sthState("waterGot") || { a: false, b: false };

    function resYears(s, kk) { return s.flow ? s.vol / (s.flow * kk) : null; }
    function resText(s, kk) {
      var y = resYears(s, kk);
      if (y === null) return "수백 ~ 수만 년 (이 모형에서는 계산하지 않음)";
      if (y < 1) return (y * 365.25).toFixed(1) + " 일";
      if (y < 100) return y.toFixed(1) + " 년";
      return Math.round(y).toLocaleString() + " 년";
    }
    function draw() {
      paper(ctx, W, H);
      text(ctx, "지구의 물은 어디에 얼마나 있고, 한곳에 얼마나 오래 머무는가", 40, 32, { s: 14, w: "900" });
      text(ctx, "막대는 저장량(로그 눈금)", 40, 52, { s: 10.5, c: v("--mist") });
      /* 왼쪽 : 저장량 막대 */
      var y0 = 76, gap = 52;
      for (var i = 0; i < ST.length; i++) {
        var s = ST[i], yy = y0 + i * gap;
        var wpx = clamp((Math.log(s.vol) / Math.LN10 + 0.5) / 9.7 * 260, 6, 260);
        text(ctx, s.name, 148, yy + 18, { s: 12, w: sel === s.id ? "900" : "700", a: "right", c: sel === s.id ? v("--brand-700") : v("--ink") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(156, yy, 260, 24);
        ctx.fillStyle = v(s.col); ctx.globalAlpha = sel === s.id ? 1 : 0.55;
        ctx.fillRect(156, yy, wpx, 24); ctx.globalAlpha = 1;
        text(ctx, s.vol.toLocaleString() + " km³", 452, yy + 17, { s: 11.5, w: "800", a: "right" });
        text(ctx, s.note, 156, yy + 40, { s: 10, c: v("--mist") });
      }
      /* 오른쪽 : 머무는 시간 */
      text(ctx, "머무는 시간 = 저장량 ÷ 해마다 드나드는 양", 470, 32, { s: 13, w: "900", c: v("--brand-700") });
      var list = [];
      for (var j = 0; j < ST.length; j++) {
        list.push([ST[j].name, resText(ST[j], k), sel === ST[j].id ? "--brand-100" : null, sel === ST[j].id ? "--brand-700" : null]);
      }
      rows(ctx, list, 470, 52, 406, 34);
      var cur = null;
      for (var q = 0; q < ST.length; q++) if (ST[q].id === sel) cur = ST[q];
      card(ctx, 470, 234, 406, 78, v("--card-2"));
      var n = wrapText(ctx, cur.flow
        ? cur.name + " : " + cur.vol.toLocaleString() + " km³ ÷ (" + Math.round(cur.flow * k).toLocaleString() + " km³/년) = " + resText(cur, k)
        : cur.name + " : 드나드는 양이 아주 적어 오래 갇혀 있습니다. 빙하와 지하수는 수백 년에서 수만 년까지 머뭅니다.",
        482, 258, 382, 18, { s: 12, w: "700" });
      text(ctx, "순환이 " + k.toFixed(2) + "배로 빨라지면 드나드는 양도 " + k.toFixed(2) + "배가 됩니다.", 482, 258 + n * 18 + 6, { s: 10.5, c: v("--mist") });
      text(ctx, "지금 지구에서는 해마다 약 505,000 km³ 의 물이 증발하고, 같은 양이 비와 눈으로 내립니다.", 40, 374, { s: 11, c: v("--mist") });
      say();
    }
    function say() {
      var sea = resYears(ST[0], k), atm = resYears(ST[4], k) * 365.25;
      $("a-water-info").innerHTML = "저장량이 가장 적은 <b>대기</b> 속의 물은 평균 <b>" + atm.toFixed(1) + "일</b> 만에 갈아치워지고, 가장 많은 <b>바닷물</b>은 평균 <b>" + Math.round(sea).toLocaleString() + "년</b>이 걸립니다. " +
        "저장량이 커서가 아니라 <b>저장량에 견주어 드나드는 양이 적어서</b> 오래 머무는 것입니다. 모래 한 알을 산에서 바다로 옮긴 것은 저 짧은 9일짜리 여행을 수없이 되풀이한 물입니다.";
    }
    function check() {
      var ch = false;
      if (sel === "atm" && !got.a) { got.a = true; ch = true; }
      if (resYears(ST[0], k) < 2000 && !got.b) { got.b = true; window.sthState("cycK", k.toFixed(2)); ch = true; }
      if (ch) { window.sthState("waterGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-2a");
      if (got.b) done("m1-2b");
      if (got.a && got.b) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>같은 물이 권역 사이를 돌고 있습니다. 대기 속 물은 <b>열흘도 안 되어</b> 갈아치워지고, 바닷물은 <b>3,000년쯤</b> 머뭅니다. 순환이 빨라지면 머무는 시간은 그만큼 짧아집니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call(document.querySelectorAll("#a-store button"), function (b) {
      b.addEventListener("click", function () {
        sel = b.getAttribute("data-s");
        Array.prototype.forEach.call(document.querySelectorAll("#a-store button"), function (x) { x.classList.toggle("on", x === b); });
        draw(); check();
      });
    });
    $("a-cyc").addEventListener("input", function (e) {
      k = +e.target.value; $("a-cyc-val").textContent = k.toFixed(2) + "배"; draw(); check();
    });
    draw(); mission();
  })();

  /* 장면 3 — 권역 지도 ---------------------------------------------------- */
  (function () {
    var canvas = $("c-map"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var N = [
      { n: "외권", x: 450, y: 52, r: 42, c: "--violet", d: "대기권 바깥의 우주 공간입니다. 지구는 <b>태양계라는 더 큰 시스템의 구성 요소</b>여서, 지구시스템을 돌리는 에너지의 거의 전부가 이곳에서 들어옵니다. 달과 태양의 인력, 운석도 외권에서 옵니다." },
      { n: "기권", x: 250, y: 158, r: 46, c: "--cold", d: "지구를 둘러싼 대기의 영역입니다. 질소 약 78%, 산소 약 21%로 이루어져 있고, 날씨와 기후 현상이 나타납니다. 높이에 따라 대류권·성층권·중간권·열권으로 나뉩니다." },
      { n: "지권", x: 650, y: 158, r: 46, c: "--coral", d: "지구의 표면과 내부입니다. 지각·맨틀·외핵·내핵으로 이루어져 있고, 지구 전체 부피의 대부분을 차지합니다. 판의 운동과 화산·지진이 일어나는 곳입니다." },
      { n: "수권", x: 250, y: 336, r: 46, c: "--brand", d: "바다·빙하·지하수·하천·호수 등 물이 있는 영역입니다. 97% 넘게가 바닷물이며, 비열이 커서 지구의 기온 변화를 누그러뜨립니다." },
      { n: "생물권", x: 650, y: 336, r: 46, c: "--green", d: "지구에 사는 모든 생명체와 그들이 사는 공간입니다. 다른 세 권역에 걸쳐 있고, 광합성으로 기권의 성분을 바꿔 놓은 장본인입니다." }
    ];
    var E = [
      { a: 0, b: 1, hx: 338, hy: 105, t: "외권 ↔ 기권", d: "태양 복사 에너지가 대기권 위로 들어와 기권과 지표를 데우고, 지구는 받은 만큼을 적외선으로 우주에 돌려보냅니다(복사 평형). 지구시스템을 움직이는 에너지의 <b>99.9% 이상</b>이 이 길로 들어옵니다." },
      { a: 0, b: 2, hx: 562, hy: 105, t: "외권 ↔ 지권·수권", d: "달과 태양의 인력이 바닷물을 끌어당겨 <b>밀물과 썰물</b>을 일으킵니다. 우주에서 떨어진 운석은 지권에 충돌구를 남기고, 지구의 자전축 기울기는 계절을 만듭니다." },
      { a: 1, b: 2, hx: 450, hy: 158, t: "기권 ↔ 지권", d: "바람이 모래를 날라 바위를 깎고(풍화·침식), 기온이 오르내리며 암석을 부숩니다. 거꾸로 화산이 뿜은 화산재와 기체는 기권의 성분과 기온을 바꿉니다." },
      { a: 1, b: 3, hx: 250, hy: 247, t: "기권 ↔ 수권", d: "바다에서 물이 증발해 기권으로 가고, 비와 눈이 되어 수권으로 돌아옵니다. 해마다 <b>약 505,000 km³</b> 가 오갑니다. 바다는 대기의 이산화 탄소를 녹여 품기도 합니다." },
      { a: 2, b: 4, hx: 650, hy: 247, t: "지권 ↔ 생물권", d: "토양은 생물의 서식 기반이 되고, 뿌리와 지의류는 암석의 풍화를 빠르게 합니다. 죽은 생물이 묻혀 <b>석탄·석유</b>가 되기도 합니다." },
      { a: 3, b: 4, hx: 450, hy: 336, t: "수권 ↔ 생물권", d: "생물은 물을 마시고 물속을 서식지로 삼습니다. 바다의 식물성 플랑크톤은 수권에서 광합성을 해 산소를 내놓습니다." },
      { a: 1, b: 4, cx: 330, cy: 300, hx: 390, hy: 274, t: "기권 ↔ 생물권", d: "식물의 광합성과 생물의 호흡이 대기의 산소·이산화 탄소 농도를 바꿉니다. 지금 대기에 산소가 21%나 있는 것은 <b>생물권이 한 일</b>입니다." },
      { a: 3, b: 2, cx: 570, cy: 194, hx: 510, hy: 221, t: "수권 ↔ 지권", d: "하천과 파도가 지권을 깎아 내고, 깎인 알갱이를 날라 삼각주와 모래 해변을 만듭니다. 강이 해마다 바다로 나르는 퇴적물은 <b>약 200억 t</b> 입니다." }
    ];
    var seen = window.sthState("mapSeen") || {};
    var got = window.sthState("mapGot") || { a: false, b: false };

    function count() { var c = 0; for (var i = 0; i < E.length; i++) if (seen["e" + i]) c++; return c; }
    function draw() {
      paper(ctx, W, H);
      text(ctx, "지구시스템 — 다섯 권역과 그 사이를 오가는 것들", 40, 32, { s: 14, w: "900" });
      /* 태양 */
      ctx.fillStyle = v("--amber"); ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.arc(92, 74, 26, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      text(ctx, "태양", 92, 79, { s: 12, w: "900", a: "center", c: v("--on-accent") });
      text(ctx, "태양계의 한 부품", 92, 116, { s: 10.5, a: "center", c: v("--mist") });
      ctx.strokeStyle = v("--amber"); ctx.fillStyle = v("--amber"); ctx.lineWidth = 2;
      window.drawArrow(ctx, 124, 66, 400, 46, 9);
      /* 선 */
      for (var i = 0; i < E.length; i++) {
        var e = E[i], A = N[e.a], B = N[e.b];
        ctx.strokeStyle = v(seen["e" + i] ? "--teal" : "--line"); ctx.lineWidth = seen["e" + i] ? 3 : 2;
        ctx.beginPath(); ctx.moveTo(A.x, A.y);
        if (e.cx != null) ctx.quadraticCurveTo(e.cx, e.cy, B.x, B.y); else ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }
      /* 상호 작용 표시 */
      for (var j = 0; j < E.length; j++) {
        var h = E[j], on = !!seen["e" + j];
        ctx.fillStyle = v(on ? "--teal" : "--card");
        ctx.strokeStyle = v(on ? "--teal" : "--mist"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(h.hx, h.hy, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        text(ctx, on ? "✓" : "?", h.hx, h.hy + 5, { s: 13, w: "900", a: "center", c: on ? v("--on-accent") : v("--mist") });
      }
      /* 권역 */
      for (var m = 0; m < N.length; m++) {
        var s = N[m];
        ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = v(s.c);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        text(ctx, s.n, s.x, s.y + 6, { s: 16, w: "900", a: "center", c: v("--on-accent") });
      }
      text(ctx, "확인한 상호 작용 " + count() + " / " + E.length, 40, 408, { s: 13, w: "900", c: v("--teal-700") });
      text(ctx, "시스템 = 서로 영향을 주고받는 요소들의 모임. 한 권역의 변화는 반드시 다른 권역에 나타납니다.", 40, 428, { s: 11, c: v("--mist") });
    }
    function check() {
      if (count() === E.length && !got.a) { got.a = true; window.sthState("mapGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-3a");
      if (got.b) done("m1-3b");
      if (got.a && got.b) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>권역 사이를 오가는 것은 <b>물질</b>과 <b>에너지</b> 둘 다입니다. 그래서 한 곳의 사건은 반드시 다른 곳에 자취를 남깁니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    canvas.addEventListener("click", function (e) {
      var p = pointOnCanvas(canvas, e), hit = null;
      for (var i = 0; i < E.length; i++) {
        if (Math.abs(p.x - E[i].hx) < 24 && Math.abs(p.y - E[i].hy) < 24) {
          seen["e" + i] = 1; window.sthState("mapSeen", seen);
          hit = "<b>" + E[i].t + "</b> — " + E[i].d; break;
        }
      }
      if (!hit) {
        for (var j = 0; j < N.length; j++) {
          if (Math.hypot(p.x - N[j].x, p.y - N[j].y) < N[j].r) { hit = "<b>" + N[j].n + "</b> — " + N[j].d; break; }
        }
      }
      if (hit) { $("a-map-info").innerHTML = hit; draw(); check(); }
    });
    window.sthSort({
      mount: "s1-sort",
      buckets: [
        { id: "ea", label: "지권 → 기권", sub: "땅에서 나온 것이 대기를 바꾼다" },
        { id: "ae", label: "기권 → 지권", sub: "대기가 땅을 깎고 부순다" },
        { id: "ba", label: "생물권 → 기권", sub: "생물이 대기의 성분을 바꾼다" },
        { id: "we", label: "수권 → 지권", sub: "물이 땅을 깎고 쌓는다" }
      ],
      items: [
        { t: "🌋 1991년 피나투보의 화산재가 성층권을 덮어 지구 평균 기온이 내려갔다", a: "ea", why: "지권에서 나온 물질이 기권의 상태를 바꾼 사례입니다." },
        { t: "🏜️ 봄마다 중국 내륙의 흙먼지가 바람에 실려 하늘을 뿌옇게 덮는다(황사)", a: "ea", why: "지권의 알갱이가 기권으로 올라간 사례입니다.", hint: "흙먼지는 원래 어디에 있던 물질일까요?" },
        { t: "🪨 바람에 실린 모래가 바위 아랫부분을 깎아 버섯바위를 만든다", a: "ae", why: "기권(바람)이 지권을 깎아 낸 사례입니다." },
        { t: "❄️ 기온이 오르내리며 바위가 팽창·수축을 되풀이하다 부서진다", a: "ae", why: "기권의 기온 변화가 암석을 부순 풍화입니다." },
        { t: "🦠 약 24억 년 전, 광합성 생물이 늘면서 대기에 산소가 쌓이기 시작했다", a: "ba", why: "생물권이 기권의 성분 자체를 바꾼 가장 큰 사건입니다." },
        { t: "🌳 숲이 광합성으로 이산화 탄소를 빨아들여 대기 중 농도를 낮춘다", a: "ba", why: "생물권이 기권의 조성을 바꾸는 현재진행형 사례입니다." },
        { t: "🏞️ 강물이 산을 깎고 알갱이를 날라 하구에 삼각주를 쌓는다", a: "we", why: "수권이 지권을 깎고 다시 쌓은 사례입니다. 모래 한 알이 바다로 온 길이기도 합니다." },
        { t: "🌊 파도가 해안 절벽을 깎아 해식 동굴을 만든다", a: "we", why: "수권이 지권의 지형을 바꾼 사례입니다." }
      ],
      doneText: "어느 쪽이 원인이고 어느 쪽이 결과인지 가려내는 것이 시스템으로 보는 첫걸음입니다.",
      onDone: function () { got.b = true; window.sthState("mapGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 화산 폭발 연쇄 ------------------------------------------------ */
  (function () {
    var canvas = $("c-volc"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var so2 = 6, mon = 6;
    var got = window.sthState("volcGot") || { a: false, b: false, c: false };

    function peak() { return -0.5 * so2 / 20; }                     /* 가장 많이 식었을 때(℃) */
    function frac(t) { return t <= 6 ? t / 6 : Math.exp(-(t - 6) / 12); }
    function dT(t) { return peak() * frac(t); }
    function sun(t) { return -2.5 * (so2 / 20) * frac(t); }          /* 지표에 닿는 햇빛 변화(%) */

    function draw() {
      paper(ctx, W, H);
      text(ctx, "화산 폭발이 만드는 연쇄 — 지권에서 시작해 네 권역으로", 40, 32, { s: 14, w: "900" });
      var a = frac(mon), now = dT(mon);
      /* 왼쪽 그림 */
      var x0 = 40, x1 = 430, sky = 54, ground = 292;
      ctx.fillStyle = v("--card-2"); ctx.fillRect(x0, sky, x1 - x0, ground - sky);
      ctx.fillStyle = v("--mist"); ctx.globalAlpha = clamp(0.12 + 0.75 * a * (so2 / 30), 0, 0.85);
      ctx.fillRect(x0, sky + 26, x1 - x0, 40); ctx.globalAlpha = 1;
      text(ctx, "성층권 에어로졸", x0 + 8, sky + 20, { s: 10.5, w: "800", c: v("--mist") });
      /* 햇빛 */
      ctx.strokeStyle = v("--amber"); ctx.fillStyle = v("--amber"); ctx.lineWidth = 3;
      window.drawArrow(ctx, x0 + 40, sky + 4, x0 + 96, ground - 10, 10);
      ctx.strokeStyle = v("--brand"); ctx.fillStyle = v("--brand"); ctx.lineWidth = 3;
      window.drawArrow(ctx, x0 + 120, sky + 44, x0 + 176, sky + 6, 10);
      text(ctx, "일부는 되돌아감", x0 + 182, sky + 16, { s: 10.5, c: v("--brand-700") });
      /* 화산 */
      ctx.fillStyle = v("--coral");
      ctx.beginPath(); ctx.moveTo(300, ground); ctx.lineTo(352, ground - 92); ctx.lineTo(404, ground); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 3; ctx.globalAlpha = clamp(0.2 + a, 0, 1);
      ctx.beginPath(); ctx.moveTo(352, ground - 96); ctx.quadraticCurveTo(352, sky + 92, 330, sky + 70); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = v("--line"); ctx.fillRect(x0, ground, x1 - x0, 8);
      text(ctx, "지권 — 이산화 황 " + so2 + " Tg 분출", x0 + 8, ground + 26, { s: 11.5, w: "800", c: v("--coral-700") });
      text(ctx, "이산화 황은 성층권에서 작은 황산 알갱이(에어로졸)가 되어 햇빛을 되돌려 보냅니다.", x0, ground + 46, { s: 10.5, c: v("--mist") });
      /* 오른쪽 표 */
      rows(ctx, [
        ["분출한 이산화 황", so2 + " Tg (피나투보 ≈ 20 Tg)"],
        ["가장 많이 식었을 때", peak().toFixed(2) + " ℃"],
        ["지금 남은 에어로졸", (a * 100).toFixed(0) + " %"],
        ["폭발 " + mon + "개월 뒤 기온 변화", now.toFixed(2) + " ℃", Math.abs(now) > 0.25 ? "--brand-100" : null, Math.abs(now) > 0.25 ? "--brand-700" : null],
        ["지표에 닿는 햇빛", sun(mon).toFixed(1) + " %"]
      ], 460, 52, 416, 34);
      /* 그래프 */
      var gx0 = 486, gx1 = 866, gy0 = 236, gy1 = 340;
      axes(ctx, gx0, gy0, gx1, gy1);
      text(ctx, "폭발 뒤 기온 변화 (48개월)", 460, 226, { s: 12, w: "800" });
      text(ctx, "0 ℃", gx0 - 6, gy0 + 4, { s: 10, a: "right", c: v("--mist") });
      text(ctx, "−1 ℃", gx0 - 6, gy1 + 4, { s: 10, a: "right", c: v("--mist") });
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= 96; i++) {
        var t = 48 * i / 96, xx = gx0 + (gx1 - gx0) * t / 48, yy = gy0 + (gy1 - gy0) * clamp(-dT(t), 0, 1);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      var mx = gx0 + (gx1 - gx0) * mon / 48, my = gy0 + (gy1 - gy0) * clamp(-now, 0, 1);
      ctx.strokeStyle = v("--mist"); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(mx, gy0); ctx.lineTo(mx, gy1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
      text(ctx, mon + "개월", clamp(mx, gx0, gx1 - 30), gy1 + 18, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      /* 아래 연쇄 */
      var chain = [
        ["지권", "화산이 이산화 황 " + so2 + " Tg 을 성층권까지 뿜어 올립니다.", "--coral"],
        ["기권", "황산 알갱이가 햇빛을 " + Math.abs(sun(mon)).toFixed(1) + "% 되돌려 보내 지구 평균 기온이 " + now.toFixed(2) + " ℃ 달라집니다.", "--cold"],
        ["생물권", "일조량이 줄어 광합성이 느려지고, 서늘한 여름에 농작물 수확이 줄어듭니다.", "--green"],
        ["수권", "기온이 내려가 증발량과 강수 분포가 달라지고, 바다 표층도 함께 식습니다.", "--brand"]
      ];
      for (var c = 0; c < chain.length; c++) {
        var bx = 40 + c * 215;
        card(ctx, bx, 354, 196, 64, v("--card-2"));
        text(ctx, (c + 1) + ". " + chain[c][0], bx + 10, 370, { s: 11.5, w: "900", c: v(chain[c][2] + "-700") || v("--ink") });
        wrapText(ctx, chain[c][1], bx + 10, 384, 176, 12, { s: 9.6, c: v("--mist") });
        if (c > 0) {
          ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); ctx.lineWidth = 2;
          window.drawArrow(ctx, bx - 17, 386, bx - 3, 386, 7);
        }
      }
      info();
    }
    function info() {
      var p = peak(), a = frac(mon);
      $("a-volc-info").innerHTML = "이산화 황 <b>" + so2 + " Tg</b> → 가장 많이 식었을 때 <b>" + p.toFixed(2) + " ℃</b>. 폭발 <b>" + mon + "개월</b> 뒤에는 에어로졸이 <b>" + (a * 100).toFixed(0) + "%</b> 남아 기온 변화는 <b>" + dT(mon).toFixed(2) + " ℃</b> 입니다. " +
        (Math.abs(p + 0.5) <= 0.03 ? "🎉 1991년 피나투보와 같은 규모입니다." : "피나투보는 약 20 Tg 을 뿜어 이듬해 지구 평균 기온을 약 0.5 ℃ 낮췄습니다.");
    }
    function check() {
      var ch = false;
      if (Math.abs(peak() + 0.5) <= 0.03 && !got.a) { got.a = true; window.sthState("so2Fit", so2 + " Tg"); ch = true; }
      if (mon > 6 && frac(mon) <= 0.5 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("volcGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-4a");
      if (got.b) done("m1-4b");
      if (got.c) done("m1-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>지권의 사건 하나가 <b>지구 전체의 기온</b>을 움직였습니다. 다만 에어로졸은 몇 년 만에 가라앉아, 화산의 냉각은 <b>일시적</b>입니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("a-so2").addEventListener("input", function (e) { so2 = +e.target.value; $("a-so2-val").textContent = so2 + " Tg"; draw(); check(); });
    $("a-mon").addEventListener("input", function (e) { mon = +e.target.value; $("a-mon-val").textContent = mon + "개월"; draw(); check(); });
    window.sthPick({
      mount: "s1-q1",
      q: "화산은 이산화 탄소도 내뿜습니다. 그렇다면 화산 활동은 지구를 <b>더워지게</b> 하는 쪽일까요, <b>식히는</b> 쪽일까요?",
      options: ["큰 폭발은 몇 해 동안 식히는 쪽으로 작용한다", "이산화 탄소 때문에 곧바로 크게 더워진다", "기권에는 아무 영향이 없다", "화산재가 땅에 쌓여 지표를 데운다"],
      answer: 0,
      why: ["성층권에 올라간 황산 알갱이가 햇빛을 되돌려 보내 <b>몇 해 동안</b> 식힙니다. 화산이 내뿜는 이산화 탄소의 양은 사람이 화석 연료를 태워 내놓는 양의 <b>1% 안팎</b>이라, 짧은 기간에 나타나는 효과는 냉각 쪽입니다.",
        "화산이 내놓는 이산화 탄소는 사람이 내놓는 양의 1% 안팎입니다. 단기적으로는 햇빛을 가리는 효과가 훨씬 큽니다.",
        "1991년 피나투보 이후 지구 평균 기온이 약 0.5 ℃ 내려갔습니다. 영향이 분명히 있습니다.",
        "화산재는 대부분 몇 달 안에 가라앉습니다. 기온을 움직인 것은 성층권에 오래 머문 황산 알갱이입니다."],
      onDone: function () { got.c = true; window.sthState("volcGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 --------------------------------------------------------- */
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉣") === 0 ? "정확했습니다. 분석표의 조개껍데기 조각(생물권)과 닳은 모서리(수권·기권)가 그 증거였습니다."
        : "답은 ㉣ 입니다. 석영은 지권에서 왔지만, 그것을 떼어 내고 굴리고 실어 나른 것은 수권·기권·생물권이었습니다. 조개껍데기 조각이 결정적인 증거였지요.") +
      "<br><b>내가 만든 화산</b> 이산화 황 " + (window.sthState("so2Fit") || "-") + " → 가장 많이 식었을 때 −0.5 ℃";
  }
  function finish() {
    window.sthState("r1", "해결 · 모래 한 알은 네 권역을 다 지나왔다, 대기의 물은 9.3일·바닷물은 3,083년 머문다");
  }
  window.sthOrder({
    mount: "s1-order",
    steps: [
      "① 기권 — 장기간 강수량이 크게 줄어드는 이상 기후가 발생한다",
      "② 수권 — 하천과 호수의 수위가 낮아지고 지하수면이 내려간다",
      "③ 생물권 — 물이 부족해 식생이 말라 죽고 농작물 수확량이 줄어든다",
      "④ 지권 — 식생이 사라진 토양이 바람에 쉽게 침식되어 사막화가 진행된다"
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학1 Ⅲ-1] 이야기 ① 모래 한 알의 여행",
    items: [
      { id: "w1", label: "권역 사이를 오가는 것", hint: "두 권역을 골라, 그 사이를 오가는 물질과 에너지를 각각 하나씩 쓰세요.", ph: "예: 기권 → 수권 : 물질은 …, 에너지는 …" },
      { id: "e1b", label: "모래 한 알의 여행기", hint: "이 모래 한 알이 화강암에서 떨어져 나와 해변에 닿기까지를, 네 권역의 이름을 모두 넣어 세 문장 안에 쓰세요.", ph: "" }
    ]
  });
})();

/* =========================================================================
   이야기 ② 세 개의 난로
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });
  var SUN_TW = 174000, IN_TW = 47, TIDE_TW = 3.7, AREA = 5.1e14;

  window.sthGate({
    gate: "g2", key: "p2", title: "조사관의 첫 추리",
    question: "내일 아침 태양이 빛을 잃는다면, 지구에서 <b>그래도 한동안 계속될</b> 현상은 무엇일까요?",
    options: ["㉠ 바람이 불고 비가 내리는 일", "㉡ 화산 폭발과 지진, 그리고 밀물과 썰물", "㉢ 광합성과 그 위에 놓인 먹이 사슬", "㉣ 아무것도 계속되지 않는다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 난로 세 대의 크기 -------------------------------------------- */
  (function () {
    var canvas = $("c-stove"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var scale = "log", area = 100;
    var got = window.sthState("stoveGot") || { a: false, b: false };
    var S = [
      { n: "태양 복사 에너지", tw: SUN_TW, col: "--amber", d: "대기와 해수의 순환, 바람·구름·비, 풍화와 침식, 광합성" },
      { n: "지구 내부 에너지", tw: IN_TW, col: "--coral", d: "맨틀 대류, 판의 운동, 화산 활동과 지진" },
      { n: "조력 에너지", tw: TIDE_TW, col: "--brand", d: "밀물과 썰물, 조류에 의한 퇴적물 이동" }
    ];
    function perM2(tw) { return tw * 1e12 / AREA; }
    function draw() {
      paper(ctx, W, H);
      text(ctx, "난로 세 대 — 얼마나 큰가", 40, 32, { s: 14, w: "900" });
      text(ctx, scale === "log" ? "로그 척도 : 막대 한 칸이 10배" : "선형 척도 : 실제 비율 그대로", 876, 32, { s: 11, w: "800", a: "right", c: v("--brand-700") });
      for (var i = 0; i < S.length; i++) {
        var s = S[i], y = 60 + i * 56, wpx;
        if (scale === "log") wpx = clamp((Math.log(s.tw) / Math.LN10 + 1) / 6.3 * 560, 4, 560);
        else wpx = Math.max(s.tw / SUN_TW * 560, 1);
        text(ctx, s.n, 40, y + 22, { s: 12.5, w: "800" });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(196, y, 560, 32);
        ctx.fillStyle = v(s.col); ctx.fillRect(196, y, wpx, 32);
        text(ctx, s.tw.toLocaleString() + " TW", 876, y + 21, { s: 12, w: "900", a: "right" });
        text(ctx, s.d, 40, y + 44, { s: 10, c: v("--mist") });
      }
      text(ctx, "전체에서 차지하는 비율 — 태양 99.971% · 지구 내부 0.027% · 조력 0.002%", 40, 246, { s: 11.5, w: "800", c: v("--brand-700") });
      /* 넓이 환산표 */
      text(ctx, "넓이 " + area.toLocaleString() + " m² 의 땅 위에서 견주면", 40, 278, { s: 13, w: "900" });
      text(ctx, "1 m² 당", 560, 278, { s: 11, a: "right", c: v("--mist") });
      text(ctx, "이 넓이에서", 866, 278, { s: 11, a: "right", c: v("--mist") });
      for (var j = 0; j < S.length; j++) {
        var t = S[j], yy = 292 + j * 34;
        card(ctx, 40, yy, 826, 29, j === 1 ? v("--coral-100") : v("--card-2"));
        text(ctx, t.n, 52, yy + 19, { s: 11.5, c: v("--mist") });
        text(ctx, perM2(t.tw).toFixed(perM2(t.tw) < 1 ? 4 : 1) + " W", 560, yy + 19, { s: 11.5, w: "800", a: "right" });
        var tot = perM2(t.tw) * area;
        text(ctx, tot >= 1000 ? Math.round(tot).toLocaleString() + " W" : tot.toFixed(1) + " W", 854, yy + 19, { s: 12.5, w: "900", a: "right", c: j === 1 ? v("--coral-700") : v("--ink") });
      }
      text(ctx, "태양 값은 대기권 위에서 잰 평균입니다. 그중 약 30%는 반사되고 나머지가 지구를 데웁니다.", 40, 392, { s: 10.5, c: v("--mist") });
      info();
    }
    function info() {
      var inW = perM2(IN_TW) * area, sunW = perM2(SUN_TW) * area;
      $("b-stove-info").innerHTML = "넓이 <b>" + area.toLocaleString() + " m²</b> 위에서, 태양은 <b>" + Math.round(sunW).toLocaleString() + " W</b>, 땅속에서 올라오는 열은 <b>" + inW.toFixed(1) + " W</b> 입니다. " +
        (Math.abs(inW - 60) <= 2 ? "🎉 백열전구 한 개(60 W)와 같아졌습니다. 운동장만 한 땅이 통째로 전구 하나인 셈입니다."
          : "지구 내부의 열은 <b>넓게 퍼져 있어 약합니다.</b> 그런데도 화산과 지진을 일으키는 것은, 그 에너지가 판 경계라는 <b>좁은 곳에 몰려</b> 쓰이기 때문입니다.");
    }
    function check() {
      var ch = false;
      if (scale === "linear" && !got.a) { got.a = true; ch = true; }
      if (Math.abs(perM2(IN_TW) * area - 60) <= 2 && !got.b) { got.b = true; window.sthState("bulbA", area.toLocaleString() + " m²"); ch = true; }
      if (ch) { window.sthState("stoveGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-2a");
      if (got.b) done("m2-2b");
      if (got.a && got.b) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>선형 척도에서는 내부·조력 막대가 <b>보이지도 않습니다.</b> 그래도 그 작은 난로가 화산과 조석을 일으킵니다 — <b>전체 양</b>과 <b>한곳에 몰리는 세기</b>는 다른 문제입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call(document.querySelectorAll("#b-scale button"), function (b) {
      b.addEventListener("click", function () {
        scale = b.getAttribute("data-s");
        Array.prototype.forEach.call(document.querySelectorAll("#b-scale button"), function (x) { x.classList.toggle("on", x === b); });
        draw(); check();
      });
    });
    $("b-area").addEventListener("input", function (e) {
      area = +e.target.value; $("b-area-val").textContent = area.toLocaleString() + " m²"; draw(); check();
    });
    draw(); mission();
  })();

  /* 장면 3 — 에너지 수지 --------------------------------------------------- */
  (function () {
    var canvas = $("c-budget"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var S0 = 340.25, SIG = 5.67e-8;
    var alb = 10, gh = 0;
    var got = window.sthState("budGot") || { a: false, b: false, c: false };

    function teff() { return Math.pow((1 - alb / 100) * S0 / SIG, 0.25) - 273.15; }
    function tsurf() { return teff() + gh; }
    function draw() {
      paper(ctx, W, H);
      var a = alb / 100, ref = S0 * a, abs = S0 * (1 - a);
      text(ctx, "지구의 에너지 수지 — 들어온 만큼 내보낸다", 40, 32, { s: 14, w: "900" });
      var top = 58, air0 = 150, air1 = 188, ground = 322, xL = 60, xR = 620;
      /* 대기층 · 지표 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(xL, top, xR - xL, ground - top);
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = .18; ctx.fillRect(xL, air0, xR - xL, air1 - air0); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.strokeRect(xL, air0, xR - xL, air1 - air0);
      text(ctx, "대기", xL + 10, air0 + 25, { s: 11.5, w: "800", c: v("--brand-700") });
      ctx.fillStyle = v("--line"); ctx.fillRect(xL, ground, xR - xL, 8);
      text(ctx, "지표", xL + 10, ground + 26, { s: 11.5, w: "800", c: v("--mist") });
      text(ctx, "우주(외권)", xL + 10, top + 16, { s: 11, c: v("--mist") });
      /* 들어오는 태양 복사 */
      ctx.strokeStyle = v("--amber"); ctx.fillStyle = v("--amber"); ctx.lineWidth = 4;
      window.drawArrow(ctx, 128, top + 6, 128, ground - 6, 11);
      text(ctx, "태양 복사", 128, top - 8, { s: 11.5, w: "800", a: "center", c: v("--amber-700") });
      text(ctx, S0.toFixed(0) + " W/m²", 128, top + 36, { s: 12.5, w: "900", a: "center", c: v("--amber-700") });
      /* 반사 */
      ctx.strokeStyle = v("--brand"); ctx.fillStyle = v("--brand"); ctx.lineWidth = 4;
      window.drawArrow(ctx, 272, ground - 20, 272, top + 6, 11);
      text(ctx, "반사 " + ref.toFixed(0) + " W/m²", 272, top - 8, { s: 11.5, w: "800", a: "center", c: v("--brand-700") });
      text(ctx, "반사율 " + alb + "%", 272, ground + 26, { s: 11, a: "center", c: v("--mist") });
      /* 흡수 */
      text(ctx, "흡수 " + abs.toFixed(0) + " W/m²", 400, ground + 26, { s: 11.5, w: "800", a: "center", c: v("--coral-700") });
      /* 지구가 내보내는 적외선 */
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 4;
      window.drawArrow(ctx, 448, ground - 20, 448, top + 6, 11);
      text(ctx, "지구가 내보냄", 448, top - 8, { s: 11.5, w: "800", a: "center", c: v("--coral-700") });
      text(ctx, abs.toFixed(0) + " W/m²", 448, top + 36, { s: 12.5, w: "900", a: "center", c: v("--coral-700") });
      /* 온실 효과 */
      if (gh > 0) {
        ctx.strokeStyle = v("--violet"); ctx.fillStyle = v("--violet"); ctx.lineWidth = 4;
        window.drawArrow(ctx, 556, air1 + 6, 556, ground - 6, 11);
        text(ctx, "온실 효과", 556, air0 - 10, { s: 11.5, w: "800", a: "center", c: v("--violet-700") });
        text(ctx, "+" + gh + " ℃", 556, ground + 26, { s: 12.5, w: "900", a: "center", c: v("--violet-700") });
      }
      text(ctx, "들어오는 양(흡수) = 나가는 양(적외선) 이면 온도가 더 오르지도 내리지도 않습니다 — 복사 평형", xL, 372, { s: 11.5, w: "800", c: v("--brand-700") });
      text(ctx, "이 화면은 지구를 온도가 하나뿐인 공으로 본 단순한 모형입니다.", xL, 392, { s: 10.5, c: v("--mist") });
      /* 오른쪽 계기 */
      var te = teff(), ts = tsurf();
      text(ctx, "복사 평형 온도", 768, 78, { s: 12, w: "800", a: "center", c: v("--mist") });
      card(ctx, 656, 88, 224, 58, v(Math.abs(te + 18) <= 1.5 ? "--green-100" : "--card-2"));
      text(ctx, te.toFixed(1) + " ℃", 768, 128, { s: 28, w: "900", a: "center", c: v(Math.abs(te + 18) <= 1.5 ? "--green-700" : "--ink") });
      text(ctx, "대기의 온실 효과가 없다면", 768, 166, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "지표의 평균 기온", 768, 208, { s: 12, w: "800", a: "center", c: v("--mist") });
      card(ctx, 656, 218, 224, 58, v(Math.abs(ts - 15) <= 1.5 ? "--green-100" : "--card-2"));
      text(ctx, ts.toFixed(1) + " ℃", 768, 258, { s: 28, w: "900", a: "center", c: v(Math.abs(ts - 15) <= 1.5 ? "--green-700" : "--ink") });
      text(ctx, "실제 지구 : 반사율 약 30%", 768, 300, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "평균 기온 약 15 ℃", 768, 318, { s: 10.5, a: "center", c: v("--mist") });
      info();
    }
    function info() {
      var te = teff(), ts = tsurf();
      $("b-budget-info").innerHTML = "반사율 <b>" + alb + "%</b> 일 때, 지구가 흡수하는 양과 내보내는 양이 같아지는 온도는 <b>" + te.toFixed(1) + " ℃</b> 입니다. 여기에 온실 효과 <b>+" + gh + " ℃</b> 를 더하면 지표의 평균 기온은 <b>" + ts.toFixed(1) + " ℃</b>. " +
        (Math.abs(te + 18) <= 1.5 ? (Math.abs(ts - 15) <= 1.5 ? "🎉 실제 지구의 장부와 같아졌습니다." : "복사 평형 온도는 맞췄습니다. 이제 온실 효과를 더해 15 ℃ 를 만들어 보세요.") :
          "반사율을 바꿔 보세요. 많이 반사할수록 흡수가 줄어 평형 온도가 내려갑니다.");
    }
    function check() {
      var ch = false;
      if (Math.abs(teff() + 18) <= 1.5 && !got.a) { got.a = true; ch = true; }
      if (Math.abs(tsurf() - 15) <= 1.5 && !got.b) { got.b = true; window.sthState("ghFit", gh + " ℃"); ch = true; }
      if (ch) { window.sthState("budGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-3a");
      if (got.b) done("m2-3b");
      if (got.c) done("m2-3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>지구는 받은 만큼 내보내며 <b>복사 평형</b>을 이룹니다. 대기가 없었다면 −18 ℃, 지금의 15 ℃ 는 <b>온실 효과</b>가 더해 준 몫입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("b-alb").addEventListener("input", function (e) { alb = +e.target.value; $("b-alb-val").textContent = alb + " %"; draw(); check(); });
    $("b-gh").addEventListener("input", function (e) { gh = +e.target.value; $("b-gh-val").textContent = gh + " ℃"; draw(); check(); });
    window.sthPick({
      mount: "s2-q1",
      q: "지구가 <b>복사 평형</b>을 이루고 있다는 것은 무슨 뜻일까요?",
      options: ["지구로 들어오는 태양 복사 에너지가 0이다", "지구가 흡수하는 에너지의 양과 우주로 내보내는 에너지의 양이 같다", "지구 어느 곳이나 온도가 똑같다", "지구가 에너지를 전혀 내보내지 않는다"],
      answer: 1,
      why: ["태양 복사는 끊임없이 들어옵니다. 들어오는 양이 0이라면 지구는 계속 식을 것입니다.",
        "흡수한 만큼 적외선으로 내보내기 때문에 지구의 평균 기온이 일정하게 유지됩니다. 이 균형이 깨지면 기온이 오르거나 내립니다.",
        "적도와 극지방의 온도는 크게 다릅니다. 복사 평형은 <b>지구 전체를 합친</b> 이야기입니다.",
        "지구도 온도에 맞는 적외선을 내보냅니다. 그 양이 흡수량과 같아진 상태가 복사 평형입니다."],
      onDone: function () { got.c = true; window.sthState("budGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 조석 + 난로 가려내기 ------------------------------------------ */
  (function () {
    var canvas = $("c-tide"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var AM = 2.2, AS = 1.0, MAXR = 3.2, INCHEON = 9.0;
    var ph = 45;
    var got = window.sthState("tideGot") || { a: false, b: false, c: false };

    function rad(d) { return d * Math.PI / 180; }
    function amp(d) { return Math.sqrt(AM * AM + AS * AS + 2 * AM * AS * Math.cos(2 * rad(d))); }
    function phaseName(d) {
      var x = ((d % 360) + 360) % 360;
      if (x < 8 || x > 352) return "그믐(삭)";
      if (Math.abs(x - 180) < 8) return "보름(망)";
      if (Math.abs(x - 90) < 8) return "상현";
      if (Math.abs(x - 270) < 8) return "하현";
      return x < 90 || (x > 180 && x < 270) ? "초승·그믐 사이" : "반달과 보름 사이";
    }
    function draw() {
      paper(ctx, W, H);
      var A = amp(ph), tide = INCHEON * A / MAXR;
      text(ctx, "조력 — 달과 태양이 함께 끌어당긴다", 40, 32, { s: 14, w: "900" });
      var ex = 250, ey = 190, er = 44, orb = 122;
      /* 태양 방향 */
      ctx.strokeStyle = v("--amber"); ctx.fillStyle = v("--amber"); ctx.lineWidth = 4;
      window.drawArrow(ctx, 48, ey, 96, ey, 11);
      text(ctx, "태양 쪽", 48, ey - 14, { s: 11.5, w: "800", c: v("--amber-700") });
      /* 달 궤도 */
      ctx.strokeStyle = v("--line"); ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ex, ey, orb, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      /* 조석 타원 */
      var num = AM * Math.sin(2 * rad(ph)) + AS * Math.sin(2 * rad(180));
      var den = AM * Math.cos(2 * rad(ph)) + AS * Math.cos(2 * rad(180));
      var psi = 0.5 * Math.atan2(num, den);
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(psi);
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = .35;
      ctx.beginPath(); ctx.ellipse(0, 0, er + 10 + A * 7, er + 4 - A * 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1;
      /* 지구 */
      ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
      text(ctx, "지구", ex, ey + 5, { s: 12.5, w: "900", a: "center", c: v("--on-accent") });
      /* 달 */
      var mx = ex - orb * Math.cos(rad(ph)), my = ey - orb * Math.sin(rad(ph));
      ctx.fillStyle = v("--mist"); ctx.beginPath(); ctx.arc(mx, my, 13, 0, Math.PI * 2); ctx.fill();
      text(ctx, "달", mx, my + 4, { s: 10.5, w: "900", a: "center", c: v("--panel") });
      text(ctx, phaseName(ph), ex, 334, { s: 12.5, w: "900", a: "center", c: v("--brand-700") });
      text(ctx, "달의 위상 " + ph + "°", ex, 352, { s: 11, a: "center", c: v("--mist") });
      /* 오른쪽 */
      rows(ctx, [
        ["달이 일으키는 힘", AM.toFixed(1) + " (기준)"],
        ["태양이 일으키는 힘", AS.toFixed(1) + " (달의 약 0.45배)"],
        ["두 힘을 합친 크기", A.toFixed(2)],
        ["이때의 조차 (인천 기준)", tide.toFixed(1) + " m", A >= 3.15 ? "--rose-100" : (A <= 1.25 ? "--brand-100" : null), A >= 3.15 ? "--rose-700" : (A <= 1.25 ? "--brand-700" : null)]
      ], 470, 60, 406, 36);
      /* 막대 */
      text(ctx, "조차", 470, 232, { s: 11.5, w: "800", c: v("--mist") });
      ctx.fillStyle = v("--card-2"); ctx.fillRect(470, 240, 406, 20);
      ctx.fillStyle = v("--brand"); ctx.fillRect(470, 240, 406 * clamp(A / MAXR, 0, 1), 20);
      text(ctx, "사리(최대)", 876, 278, { s: 10.5, a: "right", c: v("--mist") });
      text(ctx, "조금(최소)", 470, 278, { s: 10.5, c: v("--mist") });
      text(ctx, "달과 태양이 <일직선>에 놓이면 두 힘이 겹쳐 조차가 커지고(사리),", 470, 308, { s: 11, c: v("--mist") });
      text(ctx, "<직각>으로 놓이면 서로 어긋나 조차가 작아집니다(조금).", 470, 328, { s: 11, c: v("--mist") });
      text(ctx, "달은 태양보다 작지만 훨씬 가까워, 조석을 일으키는 힘은 달이 더 큽니다.", 470, 350, { s: 10.5, c: v("--mist") });
      info();
    }
    function info() {
      var A = amp(ph), tide = INCHEON * A / MAXR;
      $("b-tide-info").innerHTML = "달의 위상 <b>" + ph + "°</b>(" + phaseName(ph) + ") — 두 힘을 합친 크기 <b>" + A.toFixed(2) + "</b>, 인천이라면 조차 약 <b>" + tide.toFixed(1) + " m</b>. " +
        (A >= 3.15 ? "🎉 <b>사리</b>입니다. 달·지구·태양이 거의 일직선에 놓여 두 힘이 겹쳤습니다. 보름과 그믐 무렵에 일어납니다."
          : (A <= 1.25 ? "🎉 <b>조금</b>입니다. 달과 태양이 직각으로 놓여 서로의 효과를 깎아 먹습니다. 상현·하현 무렵입니다."
            : "달을 더 돌려 보세요. 두 힘이 겹치는 자리와 어긋나는 자리가 있습니다."));
    }
    function check() {
      var A = amp(ph), ch = false;
      if (A >= 3.15 && !got.a) { got.a = true; ch = true; }
      if (A <= 1.25 && !got.b) { got.b = true; ch = true; }
      if (ch) { window.sthState("tideGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m2-4a");
      if (got.b) done("m2-4b");
      if (got.c) done("m2-4c");
      if (got.a && got.b && got.c) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>조석은 <b>달과 태양의 인력</b>이 일으킵니다. 두 힘이 겹치면 사리, 어긋나면 조금 — 이 모형에서 조차는 <b>2.7배</b>까지 차이가 납니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("b-ph").addEventListener("input", function (e) { ph = +e.target.value; $("b-ph-val").textContent = ph + "°"; draw(); check(); });
    window.sthSort({
      mount: "s2-sort",
      buckets: [
        { id: "sun", label: "태양 복사 에너지", sub: "가장 큰 난로 (99.9% 이상)" },
        { id: "in", label: "지구 내부 에너지", sub: "방사성 원소의 붕괴열 등" },
        { id: "tide", label: "조력 에너지", sub: "달과 태양의 인력" }
      ],
      items: [
        { t: "🌬️ 저위도에서 고위도로 대기가 순환하며 무역풍과 편서풍이 분다", a: "sun", why: "위도에 따른 태양 에너지 차이가 대기 대순환을 일으킵니다." },
        { t: "☁️ 바닷물이 증발해 구름이 되고 비가 내린다", a: "sun", why: "물의 순환을 돌리는 것은 태양 에너지입니다." },
        { t: "🌱 식물이 광합성으로 양분을 만든다", a: "sun", why: "생물권 전체를 먹여 살리는 에너지도 태양에서 옵니다." },
        { t: "🌊 바람에 밀려 표층 해류가 일정한 방향으로 흐른다", a: "sun", why: "표층 해류를 미는 것은 바람, 바람을 만드는 것은 태양 에너지입니다.", hint: "바람은 무엇이 만들까요?" },
        { t: "🌋 백두산과 후지산 같은 화산이 분출한다", a: "in", why: "마그마를 만들고 밀어 올리는 것은 지구 내부 에너지입니다." },
        { t: "🏔️ 판이 움직이며 지진이 일어나고 산맥이 솟는다", a: "in", why: "판을 움직이는 맨틀 대류의 열원이 지구 내부 에너지입니다." },
        { t: "🔥 온천에서 뜨거운 물이 솟는다", a: "in", why: "땅속의 열이 지하수를 데운 것입니다. 지열 발전도 같은 난로를 씁니다." },
        { t: "🌕 하루에 두 번씩 밀물과 썰물이 드나든다", a: "tide", why: "달과 태양의 인력이 바닷물을 부풀린 결과입니다." },
        { t: "🦀 서해안 갯벌이 드러났다 잠겼다 한다", a: "tide", why: "조석이 만든 지형이자 생태계입니다. 조력 발전도 이 난로를 씁니다.", hint: "하루 두 번 되풀이되는 것은 무엇 때문일까요?" }
      ],
      doneText: "가장 큰 난로가 모든 일을 하는 것은 아닙니다.",
      onDone: function () { got.c = true; window.sthState("tideGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 5 — 결말 --------------------------------------------------------- */
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 화산과 지진은 <b>지구 내부 에너지</b>가 일으키고, 조석은 <b>인력</b>이 일으킵니다. 빛이 사라져도 인력은 그대로이니 밀물과 썰물은 계속됩니다."
        : "답은 ㉡ 입니다. 바람·비·광합성은 모두 태양 에너지가 하는 일이라 곧 멈추지만, 화산과 지진은 <b>지구 내부 에너지</b>가 일으키고, 밀물과 썰물은 <b>달과 태양의 인력</b>이 일으킵니다 — 빛이 사라져도 인력은 남습니다.") +
      "<br><b>내가 맞춘 온실 효과</b> " + (window.sthState("ghFit") || "-") + " · <b>전구 한 개가 되는 넓이</b> " + (window.sthState("bulbA") || "-");
  }
  function finish() {
    window.sthState("r2", "해결 · 태양 174,000 : 내부 47 : 조력 3.7 TW, 대기 없으면 −18 ℃ · 온실 효과로 15 ℃");
  }
  window.sthPick({
    mount: "s2-q2",
    q: "태양 에너지가 전체의 <b>99.9% 이상</b>인데, 화산 분출은 왜 태양 에너지로 설명할 수 없을까요?",
    options: ["태양 에너지는 지구 내부까지 들어가지 못하고 지표 부근에서 흡수되기 때문", "태양 에너지의 실제 양이 표에 적힌 것보다 훨씬 적기 때문", "화산은 달의 인력(조력)이 일으키기 때문", "태양 에너지는 빛이라서 물질의 온도를 높이지 못하기 때문"],
    answer: 0,
    why: ["태양 복사는 지표와 대기에서 거의 다 흡수되어 <b>표면 근처</b>의 일만 합니다. 맨틀을 대류시키고 마그마를 만드는 열은 지구 안에서 방사성 원소의 붕괴 등으로 <b>따로</b> 만들어집니다.",
      "표의 값은 널리 쓰이는 추정값입니다. 문제는 양이 아니라 그 에너지가 <b>어디까지 닿는가</b>입니다.",
      "조력은 바닷물을 움직일 뿐 마그마를 만들지 못합니다.",
      "태양 복사는 흡수되면 열로 바뀌어 지표를 데웁니다. 다만 땅속 깊은 곳까지는 닿지 못합니다."],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학1 Ⅲ-1] 이야기 ② 세 개의 난로",
    items: [
      { id: "w2", label: "지구 내부 에너지가 하는 일", hint: "태양 에너지로는 설명되지 않는 현상을 하나 들고, 무엇이 그 현상을 일으키는지 쓰세요.", ph: "" },
      { id: "e2b", label: "−18 ℃ 와 15 ℃ 사이", hint: "대기가 없는 지구의 평균 기온이 −18 ℃ 인데 실제로는 15 ℃ 인 까닭을, ‘흡수’와 ‘방출’이라는 말을 넣어 설명하세요.", ph: "" }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 갈라지는 땅
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "p3", title: "조사관의 첫 추리",
    question: "증거가 이렇게 많은데도 <b>베게너의 대륙 이동설</b>이 당시 받아들여지지 않은 가장 큰 까닭은 무엇일까요?",
    options: ["㉠ 화석 증거가 나중에 가짜로 밝혀져서", "㉡ 대륙을 움직이는 힘을 설명하지 못해서", "㉢ 해안선이 맞물리는 것이 우연이라고 증명되어서", "㉣ 지구가 팽창한다는 다른 이론이 이미 증명되어 있어서"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 판 경계 실험대 ------------------------------------------------ */
  (function () {
    var canvas = $("c-bnd"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var type = "divergent", vel = 5, tm = 500;
    var got = window.sthState("bndGot") || { a: false, b: false, c: false };
    var seen = window.sthState("bndSeen") || {};
    var INFO = {
      divergent: {
        name: "발산형 경계", land: "해령 · 열곡 · 새 해양 지각", quake: "얕은 지진 (깊이 70 km 이내)",
        place: "대서양 중앙 해령, 동아프리카 열곡대, 아이슬란드", fault: "정단층",
        txt: "두 판이 서로 멀어지고, 그 틈으로 맨틀 물질이 올라와 <b>새로운 해양 지각</b>이 만들어집니다. 지각이 늘어나므로 정단층이 생기고, 마그마가 얕은 곳에서 올라와 화산 활동이 활발합니다."
      },
      convergent: {
        name: "수렴형 경계", land: "해구 · 호상 열도 · 습곡 산맥", quake: "얕은 곳 ~ 깊이 700 km 까지",
        place: "일본 해구, 안데스 산맥, 히말라야 산맥", fault: "역단층",
        txt: "두 판이 부딪혀 밀도가 큰 해양판이 다른 판 아래로 <b>섭입</b>하거나, 두 대륙판이 충돌해 <b>습곡 산맥</b>을 만듭니다. 지각이 눌리므로 역단층이 생기고, 섭입하는 판을 따라 지진의 깊이가 점점 깊어집니다."
      },
      transform: {
        name: "보존형 경계", land: "긴 단층 골짜기 (생성·소멸 없음)", quake: "얕은 지진 (규모는 클 수 있다)",
        place: "산안드레아스 단층, 북아나톨리아 단층, 해령을 가로지르는 변환 단층", fault: "주향이동단층",
        txt: "두 판이 서로 반대 방향으로 <b>어긋나며 미끄러집니다.</b> 지각이 새로 생기지도, 사라지지도 않습니다. 화산은 거의 없지만 쌓인 힘이 한꺼번에 풀리며 큰 지진이 일어날 수 있습니다."
      }
    };
    function dist() { return vel * tm / 10; }        /* cm/년 × 만 년 → km */
    function draw() {
      paper(ctx, W, H);
      var I = INFO[type], d = dist();
      text(ctx, "판 경계 실험대 — " + I.name, 40, 32, { s: 14, w: "900" });
      text(ctx, "판을 움직이는 힘은 맨틀 대류, 그 열원은 지구 내부 에너지입니다.", 40, 52, { s: 10.5, c: v("--mist") });
      var x0 = 40, x1 = 556, surf = 196, mid = (x0 + x1) / 2, ph = 40;
      /* 맨틀 */
      ctx.fillStyle = v("--coral-100"); ctx.fillRect(x0, surf + ph, x1 - x0, 170);
      text(ctx, "맨틀", x1 - 10, surf + ph + 160, { s: 11, w: "800", a: "right", c: v("--coral-700") });
      /* 대류 화살표 */
      ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 3;
      if (type === "divergent") {
        window.drawArrow(ctx, mid, surf + ph + 150, mid, surf + ph + 20, 10);
        window.drawArrow(ctx, mid - 30, surf + ph + 30, mid - 120, surf + ph + 30, 10);
        window.drawArrow(ctx, mid + 30, surf + ph + 30, mid + 120, surf + ph + 30, 10);
      } else if (type === "convergent") {
        window.drawArrow(ctx, mid - 150, surf + ph + 40, mid - 40, surf + ph + 40, 10);
        window.drawArrow(ctx, mid + 150, surf + ph + 40, mid + 40, surf + ph + 40, 10);
      } else {
        window.drawArrow(ctx, mid - 40, surf + ph + 40, mid - 150, surf + ph + 40, 10);
        window.drawArrow(ctx, mid + 40, surf + ph + 40, mid + 150, surf + ph + 40, 10);
      }
      /* 판 */
      ctx.fillStyle = v("--teal");
      if (type === "divergent") {
        var gapx = clamp(18 + d / 400, 18, 90);
        ctx.fillRect(x0, surf, mid - gapx - x0, ph);
        ctx.fillRect(mid + gapx, surf, x1 - mid - gapx, ph);
        ctx.fillStyle = v("--violet");
        ctx.beginPath(); ctx.moveTo(mid, surf - 26); ctx.lineTo(mid - gapx, surf + ph); ctx.lineTo(mid + gapx, surf + ph); ctx.closePath(); ctx.fill();
        text(ctx, "새 해양 지각", mid, surf - 36, { s: 11, w: "800", a: "center", c: v("--violet-700") });
        text(ctx, "해령 · 열곡", mid, surf + ph + 18, { s: 10.5, w: "800", a: "center", c: v("--panel") });
        ctx.fillStyle = v("--amber");
        for (var q = 0; q < 5; q++) { ctx.beginPath(); ctx.arc(mid - 60 + q * 30, surf + 14, 4, 0, Math.PI * 2); ctx.fill(); }
      } else if (type === "convergent") {
        ctx.fillRect(x0, surf, mid - x0 - 10, ph);
        ctx.save(); ctx.translate(mid + 4, surf + 4); ctx.rotate(0.5);
        ctx.fillStyle = v("--brand"); ctx.fillRect(0, 0, 250, ph); ctx.restore();
        ctx.fillStyle = v("--mist");
        ctx.beginPath(); ctx.moveTo(mid - 30, surf); ctx.lineTo(mid + 6, surf + 24); ctx.lineTo(mid + 20, surf); ctx.closePath(); ctx.fill();
        text(ctx, "해구", mid + 30, surf - 10, { s: 10.5, w: "800", c: v("--mist") });
        ctx.fillStyle = v("--coral");
        ctx.beginPath(); ctx.moveTo(mid - 110, surf); ctx.lineTo(mid - 80, surf - 40); ctx.lineTo(mid - 50, surf); ctx.closePath(); ctx.fill();
        text(ctx, "화산 · 습곡 산맥", mid - 80, surf - 50, { s: 10.5, w: "800", a: "center", c: v("--coral-700") });
        ctx.fillStyle = v("--violet");
        for (var z = 0; z < 6; z++) {
          ctx.beginPath(); ctx.arc(mid + 10 + z * 32, surf + 20 + z * 24, 5, 0, Math.PI * 2); ctx.fill();
        }
        text(ctx, "지진이 점점 깊어짐", mid + 40, surf + 178, { s: 10.5, w: "800", c: v("--violet-700") });
      } else {
        ctx.fillRect(x0, surf - 4, x1 - x0, ph / 2 - 2);
        ctx.fillStyle = v("--brand"); ctx.fillRect(x0, surf + ph / 2 + 2, x1 - x0, ph / 2 - 2);
        ctx.strokeStyle = v("--ink"); ctx.setLineDash([7, 5]); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x0, surf + ph / 2); ctx.lineTo(x1, surf + ph / 2); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, "← 위쪽 판", x0 + 12, surf + 12, { s: 11, w: "800", c: v("--panel") });
        text(ctx, "아래쪽 판 →", x1 - 12, surf + ph - 4, { s: 11, w: "800", a: "right", c: v("--panel") });
      }
      text(ctx, I.land, x0, 392, { s: 12, w: "800", c: v("--brand-700") });
      text(ctx, "대표 지역 : " + I.place, x0, 412, { s: 10.5, c: v("--mist") });
      /* 오른쪽 표 */
      rows(ctx, [
        ["판의 이동 속력", vel.toFixed(1) + " cm/년"],
        ["지난 시간", tm.toLocaleString() + " 만 년"],
        [type === "divergent" ? "새로 생긴 해양 지각의 폭" : (type === "convergent" ? "사라진(섭입한) 거리" : "어긋난 거리"),
          Math.round(d).toLocaleString() + " km",
          type === "divergent" && Math.abs(d - 5000) <= 250 ? "--green-100" : null,
          type === "divergent" && Math.abs(d - 5000) <= 250 ? "--green-700" : null],
        ["생기는 지형", I.land],
        ["지진", I.quake],
        ["단층의 종류", I.fault]
      ], 580, 60, 296, 34, { s: 10.5 });
      var n = wrapText(ctx, I.txt.replace(/<[^>]+>/g, ""), 580, 284, 296, 17, { s: 11 });
      text(ctx, "실제 판의 이동 속력은 대개 2~10 cm/년 입니다.", 580, 284 + n * 17 + 10, { s: 10.5, c: v("--mist") });
      info();
    }
    function info() {
      var I = INFO[type], d = dist();
      $("c-bnd-info").innerHTML = "<b>" + I.name + "</b> — " + I.txt + " 속력 <b>" + vel.toFixed(1) + " cm/년</b> 으로 <b>" + tm.toLocaleString() + "만 년</b> 이 지나면 <b>" + Math.round(d).toLocaleString() + " km</b> 가 " +
        (type === "divergent" ? "새로 만들어집니다." : (type === "convergent" ? "사라집니다(섭입)." : "어긋납니다.")) +
        (type === "divergent" && Math.abs(d - 5000) <= 250 ? " 🎉 지금의 대서양 폭과 비슷합니다." : "");
    }
    function check() {
      var ch = false;
      if (!seen[type]) { seen[type] = 1; window.sthState("bndSeen", seen); }
      if (seen.divergent && seen.convergent && seen.transform && !got.a) { got.a = true; ch = true; }
      if (type === "divergent" && Math.abs(dist() - 5000) <= 250 && !got.b) {
        got.b = true; window.sthState("atlV", vel.toFixed(1) + " cm/년 × " + tm.toLocaleString() + "만 년"); ch = true;
      }
      if (ch) { window.sthState("bndGot", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a");
      if (got.b) done("m3-2b");
      if (got.c) done("m3-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>해마다 몇 cm 에 지나지 않지만, <b>수천만 년</b>이 쌓이면 대양 하나가 생깁니다. 경계의 종류가 지형·지진·단층의 종류를 결정합니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call(document.querySelectorAll("#c-type button"), function (b) {
      b.addEventListener("click", function () {
        type = b.getAttribute("data-t");
        Array.prototype.forEach.call(document.querySelectorAll("#c-type button"), function (x) { x.classList.toggle("on", x === b); });
        draw(); check();
      });
    });
    $("c-v").addEventListener("input", function (e) { vel = +e.target.value; $("c-v-val").textContent = vel.toFixed(1); draw(); check(); });
    $("c-t").addEventListener("input", function (e) { tm = +e.target.value; $("c-t-val").textContent = tm.toLocaleString() + "만 년"; draw(); check(); });
    window.sthPick({
      mount: "s3-q1",
      q: "어느 지역의 지진을 조사했더니 지각이 <b>양옆으로 잡아당겨져</b> 생기는 <b>정단층</b>이었고, 지진은 모두 얕은 곳에서 일어났습니다. 이 지역은 어떤 경계일까요?",
      options: ["발산형 경계", "수렴형 경계", "보존형 경계", "판 경계에서 멀리 떨어진 판 내부"],
      answer: 0,
      why: ["지각이 <b>늘어나며</b> 정단층이 생기고, 마그마가 얕은 곳에서 올라오므로 지진도 얕습니다. 해령과 열곡대가 그렇습니다.",
        "수렴형에서는 지각이 눌려 <b>역단층</b>이 생기고, 섭입하는 판을 따라 깊은 지진도 일어납니다.",
        "보존형에서는 옆으로 미끄러지는 <b>주향이동단층</b>이 생깁니다.",
        "판 내부에서도 지진이 일어나지만, 잡아당겨져 생긴 정단층과 얕은 지진이 줄지어 나타나는 것은 발산형 경계의 특징입니다."],
      onDone: function () { got.c = true; window.sthState("bndGot", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 3 — 불의 고리 ----------------------------------------------------- */
  (function () {
    var canvas = $("c-quake"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var R = 2000;
    var got = window.sthState("ringGot") || { a: false, b: false };
    /* 단순화한 판 경계선 (경도, 위도) */
    var BND = [
      [[-24, 68], [-30, 55], [-33, 45], [-30, 35], [-28, 20], [-24, 8], [-17, -2], [-13, -15], [-13, -25], [-15, -35], [-11, -45], [-5, -52]],
      [[-112, 22], [-107, 10], [-102, 0], [-98, -10], [-95, -20], [-100, -32], [-110, -45], [-120, -55]],
      [[-79, 3], [-81, -6], [-77, -16], [-73, -26], [-74, -36], [-76, -46], [-77, -52]],
      [[-106, 21], [-98, 15], [-90, 13], [-84, 9]],
      [[-128, 50], [-127, 45], [-125, 40], [-122, 37], [-117, 33]],
      [[-144, 59], [-152, 56], [-158, 55], [-165, 54], [-175, 52], [-179, 51]],
      [[-86, 16], [-78, 18.5], [-71, 19], [-64, 19], [-61, 16], [-61, 11], [-68, 11], [-77, 12], [-84, 10]],
      [[175, 51], [163, 53], [157, 50], [150, 45], [145, 40], [142, 36], [140, 32], [142, 26], [145, 18], [147, 12], [146, 5]],
      [[139, 34], [136, 33], [132, 32], [128, 28], [124, 24], [122, 22], [121, 19]],
      [[126, 18], [127, 12], [126, 5], [122, 2], [120, -4]],
      [[95, 14], [93, 7], [97, 0], [102, -6], [110, -10], [118, -11], [125, -12], [132, -6], [140, -4], [148, -6]],
      [[-176, -18], [-178, -26]], [[178, -30], [176, -40], [172, -44]],
      [[70, 37], [78, 33], [85, 28], [92, 27], [97, 26]],
      [[-6, 36], [8, 44], [18, 42], [28, 37], [38, 38], [45, 38], [55, 30], [62, 30], [70, 37]],
      [[35, 12], [37, 5], [36, -2], [34, -9], [33, -17], [34, -22]],
      [[33, 28], [38, 20], [43, 13], [51, 12]],
      [[68, -5], [70, -20], [60, -30], [50, -38], [40, -48]],
      [[80, -32], [100, -45], [120, -50], [140, -55]]
    ];
    var VOL = [
      [138.7, 35.4, "후지산 (일본)"], [131.1, 32.9, "아소산 (일본)"], [128.1, 42.0, "백두산"],
      [120.4, 15.1, "피나투보 (필리핀)"], [105.4, -6.1, "크라카타우 (인도네시아)"], [118.0, -8.3, "탐보라 (인도네시아)"],
      [-155.3, 19.4, "킬라우에아 (하와이) — 열점"], [-110.7, 44.4, "옐로스톤 (미국) — 열점"],
      [-122.2, 46.2, "세인트헬렌스 (미국)"], [-121.8, 46.9, "레이니어산 (미국)"],
      [-98.6, 19.0, "포포카테페틀 (멕시코)"], [-78.4, -0.7, "코토팍시 (에콰도르)"], [-71.9, -39.4, "비야리카 (칠레)"],
      [15.0, 37.8, "에트나 (이탈리아)"], [14.4, 40.8, "베수비오 (이탈리아)"],
      [-19.6, 63.6, "에이야퍄들라이외퀴들 (아이슬란드)"], [29.3, -1.5, "니라공고 (콩고민주공화국)"],
      [175.6, -39.3, "루아페후 (뉴질랜드)"]
    ];
    var EQ = [
      [142.4, 38.3, "2011 도호쿠 지진 M9.1"], [-73.4, -38.1, "1960 칠레 지진 M9.5"],
      [-147.7, 61.0, "1964 알래스카 지진 M9.2"], [95.9, 3.3, "2004 수마트라 지진 M9.1"],
      [-72.5, 18.5, "2010 아이티 지진 M7.0"], [-122.5, 37.8, "1906 샌프란시스코 지진 M7.9"],
      [103.4, 31.0, "2008 쓰촨 지진 M7.9"], [84.7, 28.2, "2015 네팔 지진 M7.8"],
      [37.0, 37.2, "2023 튀르키예 지진 M7.8"], [135.0, 34.6, "1995 고베 지진 M6.9"],
      [129.2, 35.8, "2016 경주 지진 M5.8 — 판 내부"], [129.4, 36.1, "2017 포항 지진 M5.4 — 판 내부"]
    ];
    var MX0 = 40, MY0 = 46, MSX = 840 / 360, MSY = 326 / 140;
    function mx(lon) { return MX0 + (lon + 180) * MSX; }
    function my(lat) { return MY0 + (80 - lat) * MSY; }
    function segDist(plon, plat, a, b) {
      var k = Math.cos(plat * Math.PI / 180) * 111.32;
      var px = plon * k, py = plat * 110.57;
      var ax = a[0] * k, ay = a[1] * 110.57, bx = b[0] * k, by = b[1] * 110.57;
      var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      var t = L ? clamp(((px - ax) * dx + (py - ay) * dy) / L, 0, 1) : 0;
      return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    }
    function nearest(lon, lat) {
      var best = 1e9;
      for (var i = 0; i < BND.length; i++) for (var j = 0; j < BND[i].length - 1; j++) {
        var d = segDist(lon, lat, BND[i][j], BND[i][j + 1]);
        if (d < best) best = d;
      }
      return best;
    }
    var VD = VOL.map(function (p) { return nearest(p[0], p[1]); });
    var ED = EQ.map(function (p) { return nearest(p[0], p[1]); });
    function ratio(arr) { var c = 0; for (var i = 0; i < arr.length; i++) if (arr[i] <= R) c++; return c / arr.length * 100; }
    var CONT = [
      [[-168, 65], [-165, 60], [-150, 59], [-135, 57], [-125, 49], [-124, 40], [-117, 32], [-105, 22], [-97, 18], [-90, 21], [-83, 23], [-81, 26], [-80, 32], [-76, 38], [-70, 44], [-60, 47], [-55, 52], [-64, 60], [-78, 62], [-95, 60], [-90, 68], [-110, 69], [-130, 70], [-155, 71]],
      [[-45, 60], [-20, 70], [-25, 82], [-60, 82], [-70, 76], [-55, 65]],
      [[-81, -2], [-75, -14], [-70, -18], [-70, -30], [-73, -45], [-70, -54], [-65, -52], [-58, -40], [-48, -25], [-40, -20], [-35, -8], [-45, -1], [-50, 3], [-60, 8], [-72, 11], [-77, 8], [-80, 2]],
      [[-17, 15], [-17, 21], [-10, 27], [0, 32], [10, 37], [20, 32], [32, 31], [35, 24], [43, 12], [51, 12], [48, 2], [41, -3], [40, -15], [35, -22], [32, -28], [20, -35], [18, -32], [12, -18], [9, -1], [2, 5], [-8, 5], [-13, 9]],
      [[-9, 43], [0, 49], [10, 57], [20, 60], [28, 65], [30, 70], [60, 71], [80, 74], [105, 77], [130, 73], [160, 70], [180, 66], [170, 60], [155, 57], [142, 54], [140, 45], [130, 42], [122, 40], [120, 33], [110, 21], [105, 10], [100, 13], [97, 16], [90, 22], [80, 10], [77, 8], [72, 20], [65, 25], [57, 25], [48, 30], [36, 36], [28, 41], [20, 40], [12, 45], [3, 43]],
      [[113, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -18], [153, -27], [150, -37], [141, -38], [131, -32], [123, -34], [115, -34]],
      [[95, 6], [105, -2], [115, -9], [130, -8], [140, -8], [141, -2], [130, 0], [118, -2], [105, -6], [100, 2]],
      [[172, -34], [178, -38], [177, -41], [174, -41], [171, -44], [167, -47], [166, -45], [170, -40]],
      [[130, 32], [135, 34], [140, 36], [142, 41], [145, 44], [141, 45], [136, 37], [131, 31]]
    ];
    function draw() {
      paper(ctx, W, H);
      text(ctx, "세계의 화산과 큰 지진 — 그리고 판 경계", 40, 32, { s: 14, w: "900" });
      /* 바다 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(MX0, MY0, 840, 326);
      /* 위도·경도 눈금 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1; ctx.globalAlpha = .6;
      for (var g = -180; g <= 180; g += 30) { ctx.beginPath(); ctx.moveTo(mx(g), MY0); ctx.lineTo(mx(g), MY0 + 326); ctx.stroke(); }
      for (var h2 = -60; h2 <= 80; h2 += 20) { ctx.beginPath(); ctx.moveTo(MX0, my(h2)); ctx.lineTo(MX0 + 840, my(h2)); ctx.stroke(); }
      ctx.globalAlpha = 1;
      /* 대륙 */
      ctx.fillStyle = v("--green"); ctx.globalAlpha = .28;
      for (var c = 0; c < CONT.length; c++) {
        ctx.beginPath();
        for (var p = 0; p < CONT[c].length; p++) {
          var X = mx(CONT[c][p][0]), Y = my(CONT[c][p][1]);
          if (p === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        }
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
      /* 판 경계 */
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2.5;
      for (var i = 0; i < BND.length; i++) {
        ctx.beginPath();
        for (var j = 0; j < BND[i].length; j++) {
          var xx = mx(BND[i][j][0]), yy = my(BND[i][j][1]);
          if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }
      /* 점 */
      for (var k = 0; k < VOL.length; k++) {
        var inR = VD[k] <= R;
        ctx.fillStyle = v(inR ? "--coral" : "--mist");
        ctx.beginPath(); ctx.moveTo(mx(VOL[k][0]), my(VOL[k][1]) - 6);
        ctx.lineTo(mx(VOL[k][0]) - 5.5, my(VOL[k][1]) + 4); ctx.lineTo(mx(VOL[k][0]) + 5.5, my(VOL[k][1]) + 4);
        ctx.closePath(); ctx.fill();
      }
      for (var m = 0; m < EQ.length; m++) {
        ctx.fillStyle = v(ED[m] <= R ? "--rose" : "--mist");
        ctx.beginPath(); ctx.arc(mx(EQ[m][0]), my(EQ[m][1]), 5, 0, Math.PI * 2); ctx.fill();
      }
      /* 범례 */
      text(ctx, "▲ 화산 (18곳)", 48, 396, { s: 10.5, w: "800", c: v("--coral-700") });
      text(ctx, "● 큰 지진 (12곳)", 150, 396, { s: 10.5, w: "800", c: v("--rose-700") });
      text(ctx, "— 판 경계 (단순화한 선)", 262, 396, { s: 10.5, w: "800", c: v("--violet-700") });
      text(ctx, "회색은 기준 거리 밖에 있는 것", 400, 396, { s: 10.5, c: v("--mist") });
      /* 비율 막대 */
      var rv = ratio(VD), re = ratio(ED);
      text(ctx, "판 경계에서 " + R.toLocaleString() + " km 안쪽에 있는 비율", 40, 424, { s: 12.5, w: "900" });
      [["화산", rv, "--coral"], ["큰 지진", re, "--rose"]].forEach(function (b, idx) {
        var yy = 438 + idx * 30;
        text(ctx, b[0], 96, yy + 15, { s: 11.5, w: "800", a: "right", c: v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(108, yy, 560, 20);
        ctx.fillStyle = v(b[2]); ctx.fillRect(108, yy, 560 * b[1] / 100, 20);
        text(ctx, b[1].toFixed(0) + " %", 680, yy + 16, { s: 12.5, w: "900" });
      });
      text(ctx, R <= 800 ? (rv >= 70 && re >= 70 ? "✅ 좁은 띠 안에 대부분이 들어왔습니다" : "이 거리에서는 아직 많이 빠집니다") : "기준이 너무 넓습니다 — 800 km 이하로 줄여 보세요",
        876, 424, { s: 12, w: "800", a: "right", c: v(R <= 800 && rv >= 70 && re >= 70 ? "--green-700" : "--mist") });
      text(ctx, "판 경계를 따라 화산과 지진이 늘어선 띠를 변동대라고 합니다. 띠에서 벗어난 것은 열점 화산이거나 판 내부 지진입니다.", 40, 504, { s: 10.5, c: v("--mist") });
      info(rv, re);
    }
    function info(rv, re) {
      $("c-quake-info").innerHTML = "판 경계에서 <b>" + R.toLocaleString() + " km</b> 안쪽에 화산의 <b>" + rv.toFixed(0) + "%</b>, 큰 지진의 <b>" + re.toFixed(0) + "%</b> 가 들어옵니다. " +
        (R <= 800 && rv >= 70 && re >= 70 ? "🎉 화산과 지진은 지구에 고르게 흩어져 있지 않고 <b>판 경계를 따라 좁은 띠</b>를 이룹니다. 이 띠를 <b>변동대</b>라고 합니다."
          : "거리를 줄여 가며, 어디까지 좁혀도 대부분이 남는지 확인해 보세요.") +
        " 지도의 점을 눌러 보세요 — 하와이·옐로스톤은 판 경계에서 멀리 떨어진 <b>열점</b> 화산이고, 경주·포항은 경계 위가 아닌 <b>판 내부</b>에서 일어난 지진입니다.";
    }
    function check() {
      if (R <= 800 && ratio(VD) >= 70 && ratio(ED) >= 70 && !got.a) {
        got.a = true; window.sthState("ringR", R.toLocaleString() + " km"); window.sthState("ringGot", got); mission();
      }
    }
    function mission() {
      if (got.a) done("m3-3a");
      if (got.b) done("m3-3b");
      if (got.a && got.b) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>화산과 지진은 <b>판 경계를 따라</b> 띠를 이룹니다. 태평양을 두른 이 띠가 ‘불의 고리’입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    canvas.addEventListener("click", function (e) {
      var p = pointOnCanvas(canvas, e), best = null, bd = 14;
      for (var i = 0; i < VOL.length; i++) {
        var d = Math.hypot(p.x - mx(VOL[i][0]), p.y - my(VOL[i][1]));
        if (d < bd) { bd = d; best = { t: "🌋 " + VOL[i][2], d: VD[i] }; }
      }
      for (var j = 0; j < EQ.length; j++) {
        var d2 = Math.hypot(p.x - mx(EQ[j][0]), p.y - my(EQ[j][1]));
        if (d2 < bd) { bd = d2; best = { t: "⚡ " + EQ[j][2], d: ED[j] }; }
      }
      if (best) {
        $("c-quake-info").innerHTML = "<b>" + best.t + "</b> — 가장 가까운 판 경계까지 <b>약 " + Math.round(best.d / 10) * 10 + " km</b> 입니다. " +
          (/열점|판 내부/.test(best.t)
            ? "판 경계 위가 아닙니다. 열점 위를 판이 지나가며 생긴 화산이거나, 판 내부의 오래된 단층이 다시 움직여 일어난 지진입니다."
            : "판 경계를 따라 늘어선 <b>변동대</b> 위에 있습니다.");
      }
    });
    window.sthSort({
      mount: "s3-sort",
      buckets: [
        { id: "div", label: "발산형 경계", sub: "멀어진다 · 새 지각이 생긴다" },
        { id: "con", label: "수렴형 경계", sub: "부딪힌다 · 지각이 사라지거나 솟는다" },
        { id: "tra", label: "보존형 경계", sub: "어긋난다 · 생기지도 사라지지도 않는다" }
      ],
      items: [
        { t: "대서양 중앙 해령에서 해저가 갈라지며 새로운 현무암질 지각이 계속 생성된다", a: "div", why: "해령은 대표적인 발산형 경계입니다." },
        { t: "동아프리카 열곡대는 대륙이 갈라지는 초기 단계로 여겨진다", a: "div", why: "대륙에서 일어나는 발산으로, 먼 훗날 새 바다가 될 수 있습니다." },
        { t: "아이슬란드는 해령이 바다 위로 솟은 섬이라, 섬 한가운데가 갈라지고 있다", a: "div", why: "대서양 중앙 해령이 지나가는 자리입니다.", hint: "아이슬란드 한가운데에는 무엇이 지나갈까요?" },
        { t: "일본 해구에서 태평양판이 유라시아판 아래로 가라앉으며 잦은 지진과 화산이 일어난다", a: "con", why: "해양판이 섭입하는 수렴형 경계입니다." },
        { t: "히말라야 산맥은 인도판과 유라시아판이 충돌해 솟아올랐다", a: "con", why: "두 대륙판이 충돌한 수렴형 경계로, 해구 없이 높은 습곡 산맥이 만들어집니다." },
        { t: "안데스 산맥 서쪽에서 나스카판이 남아메리카판 아래로 섭입하며 화산 활동이 활발하다", a: "con", why: "해양판이 대륙판 아래로 섭입하는 수렴형 경계입니다." },
        { t: "미국 캘리포니아의 산안드레아스 단층에서 두 판이 지각의 생성·소멸 없이 어긋나며 미끄러진다", a: "tra", why: "대표적인 보존형 경계입니다." },
        { t: "해령과 해령 사이를 가로지르는 변환 단층에서 두 조각이 반대 방향으로 스쳐 지나간다", a: "tra", why: "해령을 어긋나게 만드는 변환 단층이 보존형 경계입니다.", hint: "지각이 새로 생기나요, 사라지나요?" },
        { t: "튀르키예의 북아나톨리아 단층에서 두 판이 옆으로 미끄러지며 큰 지진이 일어난다", a: "tra", why: "화산은 거의 없지만 큰 지진이 되풀이되는 보존형 경계입니다." }
      ],
      doneText: "경계의 종류를 알면 그곳에 무엇이 생길지 예측할 수 있습니다.",
      onDone: function () { got.b = true; window.sthState("ringGot", got); mission(); }
    });
    $("c-r").addEventListener("input", function (e) {
      R = +e.target.value; $("c-r-val").textContent = R.toLocaleString() + " km"; draw(); check();
    });
    draw(); mission();
  })();

  /* 장면 4 — 열점과 미래 --------------------------------------------------- */
  var got4 = window.sthState("driftGot") || { a: false, b: false, c: false };
  function mission4() {
    if (got4.a) done("m3-4a");
    if (got4.b) done("m3-4b");
    if (got4.c) done("m3-4c");
    if (got4.a && got4.b && got4.c) {
      window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>하와이 열도는 <b>움직이는 판 위에 찍힌 발자국</b>입니다. 발자국의 간격과 나이로 판의 속력을 재고, 그 속력으로 미래의 지도를 그릴 수 있습니다.");
      ep.clear(3);
    }
  }
  (function () {
    var canvas = $("c-hot"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var vp = 14;
    var DATA = [{ n: "카우아이섬", km: 500, ma: 5.0 }, { n: "미드웨이섬", km: 2400, ma: 28.0 }];
    function err(d) { return Math.abs(vp * 10 * d.ma - d.km) / d.km; }
    function fit() { return err(DATA[0]) <= 0.15 && err(DATA[1]) <= 0.15; }
    function draw() {
      paper(ctx, W, H);
      text(ctx, "하와이 열도 — 열점이 남긴 발자국", 40, 32, { s: 14, w: "900" });
      /* 왼쪽 그림 */
      var y = 150, x0 = 48, x1 = 500;
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = .2; ctx.fillRect(x0, y, x1 - x0, 46); ctx.globalAlpha = 1;
      ctx.fillStyle = v("--teal"); ctx.fillRect(x0, y + 46, x1 - x0, 26);
      text(ctx, "태평양판", x0 + 10, y + 64, { s: 11.5, w: "800", c: v("--panel") });
      ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal"); ctx.lineWidth = 3;
      window.drawArrow(ctx, 250, y - 26, 140, y - 26, 10);
      text(ctx, "판이 움직이는 방향 (북서쪽)", 258, y - 22, { s: 11, w: "800", c: v("--teal-700") });
      /* 열점 */
      ctx.fillStyle = v("--coral");
      ctx.beginPath(); ctx.arc(452, y + 110, 16, 0, Math.PI * 2); ctx.fill();
      text(ctx, "열점", 452, y + 136, { s: 11, w: "800", a: "center", c: v("--coral-700") });
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(452, y + 94); ctx.lineTo(452, y + 46); ctx.stroke();
      /* 섬들 */
      var isl = [["하와이섬", 452, 0], ["마우이섬", 400, 1.3], ["오아후섬", 352, 3.0], ["카우아이섬", 300, 5.0], ["…", 240, 12], ["미드웨이섬", 150, 28]];
      for (var i = 0; i < isl.length; i++) {
        var sz = i === 0 ? 16 : Math.max(5, 15 - i * 2);
        ctx.fillStyle = v(i === 0 ? "--coral" : "--mist");
        ctx.beginPath(); ctx.moveTo(isl[i][1], y - sz); ctx.lineTo(isl[i][1] - sz, y); ctx.lineTo(isl[i][1] + sz, y); ctx.closePath(); ctx.fill();
        if (i !== 4) text(ctx, isl[i][0], isl[i][1], y + (i % 2 ? 30 : 16), { s: 10, w: "800", a: "center", c: v("--mist") });
      }
      text(ctx, "열점에서 멀수록 오래된 섬 — 판이 지나간 순서입니다", 48, 300, { s: 11, c: v("--mist") });
      text(ctx, "판은 움직이고 열점은 제자리에 있기 때문입니다.", 48, 320, { s: 11, c: v("--mist") });
      /* 오른쪽 그래프 */
      var gx0 = 590, gx1 = 872, gy0 = 70, gy1 = 276, MA = 32, KM = 2800;
      axes(ctx, gx0, gy0, gx1, gy1);
      text(ctx, "섬의 나이와 거리", 560, 44, { s: 12.5, w: "800" });
      text(ctx, "거리(km)", 560, 64, { s: 10, c: v("--mist") });
      text(ctx, "나이(백만 년)", gx1, gy1 + 30, { s: 10, a: "right", c: v("--mist") });
      for (var g = 0; g <= 30; g += 10) text(ctx, String(g), gx0 + (gx1 - gx0) * g / MA, gy1 + 16, { s: 10, a: "center", c: v("--mist") });
      text(ctx, "2,800", gx0 - 6, gy0 + 4, { s: 10, a: "right", c: v("--mist") });
      text(ctx, "0", gx0 - 6, gy1 + 4, { s: 10, a: "right", c: v("--mist") });
      ctx.strokeStyle = v(fit() ? "--green" : "--brand"); ctx.lineWidth = 3;
      var endMa = Math.min(MA, KM / (vp * 10));
      ctx.beginPath();
      ctx.moveTo(gx0, gy1);
      ctx.lineTo(gx0 + (gx1 - gx0) * endMa / MA, gy1 - (gy1 - gy0) * (vp * 10 * endMa) / KM);
      ctx.stroke();
      for (var d = 0; d < DATA.length; d++) {
        var px = gx0 + (gx1 - gx0) * DATA[d].ma / MA, py = gy1 - (gy1 - gy0) * DATA[d].km / KM;
        ctx.fillStyle = v(err(DATA[d]) <= 0.15 ? "--green" : "--rose");
        ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
        text(ctx, DATA[d].n, px - 10, py - 10, { s: 10.5, w: "800", a: "right", c: v("--mist") });
      }
      text(ctx, "모형 : 거리 = 속력 × 나이", 560, 306, { s: 11.5, w: "800", c: v("--brand-700") });
      text(ctx, "속력 " + vp.toFixed(1) + " cm/년 = " + (vp * 10).toFixed(0) + " km / 백만 년", 560, 326, { s: 11, c: v("--mist") });
      text(ctx, "카우아이 오차 " + (err(DATA[0]) * 100).toFixed(0) + "% · 미드웨이 오차 " + (err(DATA[1]) * 100).toFixed(0) + "%", 560, 346, { s: 11, w: "800", c: v(fit() ? "--green-700" : "--rose-700") });
      info();
    }
    function info() {
      $("c-hot-info").innerHTML = "속력 <b>" + vp.toFixed(1) + " cm/년</b> 으로 계산하면 카우아이섬(500 km · 500만 년)은 오차 <b>" + (err(DATA[0]) * 100).toFixed(0) + "%</b>, 미드웨이섬(2,400 km · 2,800만 년)은 오차 <b>" + (err(DATA[1]) * 100).toFixed(0) + "%</b> 입니다. " +
        (fit() ? "🎉 두 자료에 모두 들어맞습니다. 실제로 태평양판의 이동 속력은 이 정도로 알려져 있습니다."
          : (vp * 10 * DATA[1].ma > DATA[1].km ? "너무 빠릅니다. 속력을 줄여 보세요." : "너무 느립니다. 속력을 올려 보세요."));
    }
    function check() {
      if (fit() && !got4.a) { got4.a = true; window.sthState("vpFit", vp.toFixed(1) + " cm/년"); window.sthState("driftGot", got4); mission4(); }
    }
    canvas._redraw = draw;
    $("c-vp").addEventListener("input", function (e) { vp = +e.target.value; $("c-vp-val").textContent = vp.toFixed(1); draw(); check(); });
    draw();
  })();

  (function () {
    var canvas = $("c-future"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ft = 0;
    var M = [
      { n: "대서양이 넓어지는 거리", v: 2.5, note: "대서양 중앙 해령에서 새 지각이 생기며", col: "--brand" },
      { n: "태평양판이 일본 해구로 섭입하는 거리", v: 8.5, note: "태평양판이 유라시아판 아래로 가라앉으며", col: "--coral" },
      { n: "인도판이 북쪽으로 미는 거리", v: 5.0, note: "히말라야를 더 밀어 올리며", col: "--violet" }
    ];
    function km(v) { return v * ft / 10; }
    function draw() {
      paper(ctx, W, H);
      text(ctx, ft === 0 ? "지금으로부터 — 시간을 앞으로 돌려 보세요" : "지금으로부터 " + ft.toLocaleString() + "만 년 뒤", 40, 32, { s: 14, w: "900" });
      text(ctx, "지금 관측되는 판의 속력이 그대로 이어진다고 볼 때의 예측입니다.", 40, 52, { s: 10.5, c: v("--mist") });
      var maxKm = 8.5 * 10000 / 10;
      for (var i = 0; i < M.length; i++) {
        var y = 78 + i * 72, d = km(M[i].v);
        text(ctx, M[i].n, 40, y + 14, { s: 12.5, w: "800" });
        text(ctx, M[i].v.toFixed(1) + " cm/년", 40, y + 34, { s: 10.5, c: v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(360, y, 400, 26);
        ctx.fillStyle = v(M[i].col); ctx.fillRect(360, y, 400 * clamp(d / maxKm, 0, 1), 26);
        text(ctx, Math.round(d).toLocaleString() + " km", 872, y + 19, { s: 13, w: "900", a: "right", c: v(M[i].col + "-700") || v("--ink") });
        text(ctx, M[i].note, 360, y + 46, { s: 10, c: v("--mist") });
      }
      var atl = km(2.5);
      card(ctx, 40, 292, 832, 28, v(Math.abs(atl - 1000) <= 50 ? "--green-100" : "--card-2"));
      text(ctx, Math.abs(atl - 1000) <= 50
        ? "✅ 대서양이 지금보다 1,000 km 넓어졌습니다 — 해마다 2.5 cm 씩 " + ft.toLocaleString() + "만 년"
        : "대서양이 지금보다 1,000 km 넓어지는 때를 찾아보세요 (지금 " + Math.round(atl).toLocaleString() + " km)",
        52, 311, { s: 12, w: "800", c: v(Math.abs(atl - 1000) <= 50 ? "--green-700" : "--mist") });
      info();
    }
    function info() {
      var atl = km(2.5);
      $("c-future-info").innerHTML = "<b>" + ft.toLocaleString() + "만 년</b> 뒤 — 대서양은 <b>" + Math.round(atl).toLocaleString() + " km</b> 더 넓어지고, 태평양판은 일본 해구로 <b>" + Math.round(km(8.5)).toLocaleString() + " km</b> 가라앉으며, 인도판은 <b>" + Math.round(km(5.0)).toLocaleString() + " km</b> 북쪽으로 밀고 올라갑니다. " +
        "해마다 몇 cm 가 쌓여 대륙의 배치를 바꿉니다. 판의 운동은 지권에서 끝나지 않고, 바다의 모양과 대기의 흐름, 생물의 서식지까지 바꿉니다.";
    }
    function check() {
      if (Math.abs(km(2.5) - 1000) <= 50 && !got4.b) { got4.b = true; window.sthState("driftGot", got4); mission4(); }
    }
    canvas._redraw = draw;
    $("c-ft").addEventListener("input", function (e) { ft = +e.target.value; $("c-ft-val").textContent = ft.toLocaleString() + "만 년"; draw(); check(); });
    window.sthPick({
      mount: "s3-q2",
      q: "2016년 <b>경주 지진(규모 5.8)</b>은 판 경계에서 수백 km 넘게 떨어진 곳에서 일어났습니다. 어떻게 설명할 수 있을까요?",
      options: ["판 내부에도 예전에 만들어진 단층이 있어, 판이 밀리며 쌓인 힘이 그 단층을 움직였다", "우리나라 아래에 새로운 판 경계가 만들어졌다", "판 내부에서는 지진이 일어날 수 없으므로 관측이 잘못된 것이다", "백두산의 화산 활동이 일으킨 지진이다"],
      answer: 0,
      why: ["판은 완전히 단단한 한 덩어리가 아니라, 오래전에 만들어진 <b>단층</b>들을 품고 있습니다. 판이 서로 밀며 쌓인 힘이 그 단층을 다시 움직이면 판 내부에서도 지진이 일어납니다. 우리나라는 변동대에서 벗어나 있어 드물지만, <b>안전지대는 아닙니다.</b>",
        "판 경계는 수천만 년 규모로 움직입니다. 경주 지진 하나로 새 경계가 생긴 것이 아닙니다.",
        "지진계 여러 대가 함께 기록했고, 포항 지진도 뒤따랐습니다. 판 내부 지진은 세계 곳곳에서 관측됩니다.",
        "경주와 백두산은 멀리 떨어져 있고, 경주 지진은 화산이 아니라 <b>단층 운동</b>으로 일어났습니다."],
      onDone: function () { got4.c = true; window.sthState("driftGot", got4); mission4(); }
    });
    draw(); mission4();
  })();

  /* 장면 5 — 결말 --------------------------------------------------------- */
  function reveal() {
    $("e3-wrap").hidden = false;
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "정확했습니다. 증거는 충분했지만 <b>원동력</b>이 빠져 있었습니다. 베게너가 지질학자가 아니라 기상학자였던 것도 불신을 키웠지요."
        : "답은 ㉡ 입니다. 화석도 빙하 자국도 진짜였습니다. 빠진 것은 대륙을 움직이는 <b>힘</b>이었고, 그 답인 맨틀 대류와 해저 확장은 30년 뒤에야 나왔습니다.") +
      "<br><b>내가 잰 태평양판의 속력</b> " + (window.sthState("vpFit") || "-") + " · <b>내가 좁힌 변동대</b> " + (window.sthState("ringR") || "-");
  }
  function finish() {
    window.sthState("r3", "해결 · 판을 움직이는 것은 맨틀 대류, 하와이로 잰 태평양판 속력 " + (window.sthState("vpFit") || "-"));
  }
  window.sthOrder({
    mount: "s3-order",
    steps: [
      "1912년 — 베게너가 대륙 이동설을 내놓지만, 대륙을 움직이는 힘을 설명하지 못해 받아들여지지 않는다",
      "1920~30년대 — 홈스가 맨틀의 대류를 대륙을 움직이는 원동력으로 제안한다",
      "1950~60년대 — 음향 측심으로 해령과 해구 같은 해저 지형이 드러난다",
      "1962년 — 헤스 등이 해저 확장설을 내놓고, 해령을 축으로 대칭인 고지자기 줄무늬가 이를 뒷받침한다",
      "1960년대 후반 — 지구의 겉껍질을 여러 장의 판으로 보는 판구조론이 자리를 잡는다"
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();

  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학1 Ⅲ-1] 이야기 ③ 갈라지는 땅",
    items: [
      { id: "e3a", label: "세 경계, 세 가지 결과", hint: "발산·수렴·보존 경계에서 각각 어떤 지형과 어떤 단층이 만들어지는지 한 줄씩 쓰세요.", ph: "발산형: … / 수렴형: … / 보존형: …" },
      { id: "e3b", label: "지권의 변화가 다른 권역에 미치는 영향", hint: "화산 분출이나 큰 지진이 기권·수권·생물권에 어떤 영향을 주는지, 이 단원에서 본 사례를 하나 들어 설명하세요.", ph: "" }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학1 Ⅲ-1] 지구시스템 — 정리",
  recap: [
    { key: "r1", label: "① 모래 한 알의 여행" },
    { key: "r2", label: "② 세 개의 난로" },
    { key: "r3", label: "③ 갈라지는 땅" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "모래 한 알, 난로 세 대, 갈라지는 땅. 세 이야기에 공통으로 들어 있는 생각을 ‘에너지’와 ‘상호 작용’이라는 말을 넣어 한 문장으로 쓰세요.", ph: "" },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다.", ph: "" }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is1-3-1", unitLabel: "[통합과학1 Ⅲ-1] 지구시스템",
  rows: [
    { key: "r1", label: "① 모래 한 알의 여행" },
    { key: "r2", label: "② 세 개의 난로" },
    { key: "r3", label: "③ 갈라지는 땅" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
