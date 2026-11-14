/* 통합과학1 Ⅰ-1 과학의 기본량 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";
var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function sup(n) { return String(n).split("").map(function (ch) { return SUP[ch] || ch; }).join(""); }
/* ---- 밝은 스튜디오 말투 (../assets/kit.js 의 K.studio · K.card) ---- */
var KT = window.sthKit, LT = KT.LT;
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


window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 단위 환산 */
  {
    id: "c1", about: "01", tag: "SI 단위 · 환산", title: "약 용량 사고 막기", short: "약 용량",
    who: "🧑‍⚕️", name: "해외 병원 간호사",
    say: "“열이 나는 아이가 왔어요. 처방은 <b>몸무게 1 kg 당 15 mg</b>. 그런데 진료 기록에 몸무게가 <b>44 lb(파운드)</b>로만 적혀 있네요. 시럽은 <b>5 mL에 160 mg</b> 들어 있습니다. 주사기에 몇 mL를 담아야 할까요?”",
    predict: {
      q: "간호사가 44를 그대로 kg이라고 여기고 약을 재면 어떻게 될까요?",
      options: ["㉠ 처방의 두 배가 넘는 약을 준다", "㉡ 처방보다 조금 더 준다", "㉢ 처방과 같다"], answer: 0
    },
    task: "주사기에 시럽을 담아 <b>아이 몸무게 1 kg 당 15 mg</b>(14.5~15.5 mg)이 되게 하세요. 1 lb = 0.4536 kg입니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(260), ctx = cv.ctx, W = cv.W;
      var vol = 5, CONC = 160 / 5, KG = 44 * 0.4536;
      /* 바닥에 놓인 입체 미니어처: 시럽 병 · 받침 위 큰 주사기 · 체중계 위 아이(44 lb) */
      function draw() {
        var CH = cv.H, LW = 650, x0 = 170, sc = 8, by = 132, R0 = 24, px = x0 + vol * sc, i;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, LW, CH, { x: 330, y: 226, rx: 320, ry: 22 });
        KT.bigText(ctx, "약 " + (vol * CONC).toFixed(0) + " mg", 18, 42, 26, "#ffffff");
        KT.bigText(ctx, "몸무게는 44 lb — kg 로는?", 18, 70, 16, "#ffd35a");
        /* 시럽 병(갈색 유리) */
        floorShadow(ctx, 70, 236, 42, 8, 0.28);
        cylV(ctx, 66, 132, 232, 30, 9, "#5a2e0c", "#c47a2c", "#4a240a", "#8a4a16");
        cylV(ctx, 66, 116, 134, 14, 4.5, "#f1f3f6", "#c9d0da", "#7d8698", "#ffffff");
        ctx.fillStyle = "#fffaf0"; ctx.fillRect(40, 166, 52, 40);
        lt(ctx, "시럽", 66, 184, { s: 12, w: "900", a: "center", c: "#7a3b0a" });
        lt(ctx, "5 mL 160 mg", 66, 200, { s: 8.5, w: "900", a: "center", c: "#7a3b0a" });
        ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(44, 140, 5, 84);
        /* 주사기 받침(V자 두 개) */
        [x0 + 30, x0 + 170].forEach(function (sx) {
          floorShadow(ctx, sx + 4, 228, 22, 5, 0.25);
          ctx.fillStyle = metal(ctx, sx - 14, 0, sx + 14, 0, "#f3f5f8", "#aab3c3", "#5b6476");
          ctx.beginPath(); ctx.moveTo(sx - 16, by + R0 - 4); ctx.lineTo(sx - 4, by + R0 + 8); ctx.lineTo(sx - 4, 226); ctx.lineTo(sx + 4, 226); ctx.lineTo(sx + 4, by + R0 + 8); ctx.lineTo(sx + 16, by + R0 - 4); ctx.lineTo(sx + 12, by + R0 - 6); ctx.lineTo(sx, by + R0 + 3); ctx.lineTo(sx - 12, by + R0 - 6); ctx.closePath(); ctx.fill();
        });
        /* 바늘과 바늘 끝 */
        tubeH(ctx, x0 - 70, x0 - 18, by, 1.6, "#ffffff", "#aab3c3", "#4e5768");
        tubeH(ctx, x0 - 20, x0, by, 7, "#ffffff", "#c9d0da", "#7d8698");
        /* 유리 통 뒤쪽 → 시럽 → 고무 마개 → 밀대 → 유리 앞면 */
        tubeH(ctx, x0, x0 + 200, by, R0, "rgba(240,246,252,.95)", "rgba(220,232,246,.85)", "rgba(170,188,212,.9)");
        if (vol > 0) tubeH(ctx, x0 + 2, px, by, R0 - 3, "#ffb3a7", "#e8735c", "#a8402a");
        tubeH(ctx, px, px + 220, by, 4, "#ffffff", "#aab3c3", "#4e5768");
        ctx.fillStyle = "#2b2f3a"; ctx.beginPath(); ctx.ellipse(px, by, 6, R0 - 3, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "#454b5a"; ctx.fillRect(px - 2, by - R0 + 3, 8, 2 * R0 - 6);
        var ex = px + 220;
        ctx.fillStyle = metal(ctx, 0, by - 26, 0, by + 26, "#ffffff", "#c9d0da", "#7d8698"); ctx.beginPath(); ctx.ellipse(ex, by, 6, 24, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(x0 + 6, by - R0 + 5, 188, 4);
        ctx.strokeStyle = "rgba(90,110,140,.7)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, by - R0); ctx.lineTo(x0 + 200, by - R0); ctx.moveTo(x0, by + R0); ctx.lineTo(x0 + 200, by + R0); ctx.stroke();
        ctx.fillStyle = "rgba(200,215,235,.95)"; ctx.beginPath(); ctx.ellipse(x0 + 200, by, 8, R0 + 10, 0, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(90,110,140,.6)"; ctx.stroke();
        for (i = 0; i <= 25; i++) {
          var xx = x0 + i * sc;
          ctx.strokeStyle = LT.ink; ctx.lineWidth = i % 5 ? 0.8 : 1.4; ctx.beginPath(); ctx.moveTo(xx, by + R0 - 2); ctx.lineTo(xx, by + R0 - (i % 5 ? 7 : 13)); ctx.stroke();
          if (i % 5 === 0) lt(ctx, i + "", xx, by + R0 + 16, { s: 12, a: "center", c: LT.ink, w: "900" });
        }
        lt(ctx, "mL", x0 + 218, by + R0 + 16, { s: 12, c: LT.mute, w: "900" });
        /* 체중계 위 아이: 화면에는 44 lb */
        var kx = 560;
        floorShadow(ctx, kx + 6, 236, 46, 8, 0.28);
        slab(ctx, kx - 34, 218, 64, 12, 18, "#f1f3f6", "#c9d0da", "#9aa3b0");
        ctx.fillStyle = "#12203a"; ctx.beginPath(); ctx.roundRect(kx - 22, 220, 38, 9, 3); ctx.fill();
        lt(ctx, "44 lb", kx - 3, 228.5, { s: 9.5, w: "900", a: "center", c: "#8ce99a" });
        var cg = ctx.createLinearGradient(kx - 10, 0, kx + 12, 0); cg.addColorStop(0, "#ffa8a8"); cg.addColorStop(1, "#c92a2a");
        ctx.fillStyle = "#2b2f3a"; ctx.fillRect(kx - 5, 192, 6, 22); ctx.fillRect(kx + 4, 192, 6, 22);
        ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(kx - 9, 164, 23, 32, 8); ctx.fill();
        KT.planet(ctx, kx + 2, 154, 10, "#ffe3c8", "#c98a5a");
        lt(ctx, "체중계 44 lb", kx + 2, 254, { s: 12, a: "center", c: LT.mute, w: "800" });
        /* 오른쪽 카드 */
        var cd = sideCard(ctx, 660, W, CH, "주사기에 담은 양");
        lt(ctx, vol.toFixed(1) + " mL", cd.px, 62, { s: 24, w: "900", c: LT.orange });
        KT.row(ctx, "들어 있는 약", (vol * CONC).toFixed(0) + " mg", cd.px, cd.R, 96, LT.red);
        KT.row(ctx, "시럽 1 mL 에", "32 mg", cd.px, cd.R, 120);
        KT.row(ctx, "처방", "1 kg 당 15 mg", cd.px, cd.R, 144, LT.blue);
        KT.row(ctx, "진료 기록 몸무게", "44 lb", cd.px, cd.R, 168, LT.violet);
        KT.tip(ctx, "1 lb = 0.4536 kg", cd.px - 4, 184, cd.w + 8, null);
        lt(ctx, "단위부터 맞춘 뒤 계산하세요", cd.px, CH - 14, { s: 12, c: LT.mute });
      }      cv.canvas._redraw = draw;
      api.slider({ label: "주사기에 담는 시럽", min: 0, max: 25, step: 0.1, value: 5, fmt: function (x) { return x.toFixed(1) + " mL"; },
        onInput: function (x) { vol = x; draw(); } });
      api.info("약의 양은 mg, 처방은 kg 당 mg, 몸무게는 lb. 세 단위가 섞여 있습니다.");
      draw();
      return {
        judge: function () {
          var perKg = vol * CONC / KG;
          if (perKg >= 14.5 && perKg <= 15.5) return { ok: true, msg: vol.toFixed(1) + " mL = " + (vol * CONC).toFixed(0) + " mg — 아이 몸무게 " + KG.toFixed(1) + " kg에 1 kg 당 " + perKg.toFixed(1) + " mg입니다." };
          if (Math.abs(vol * CONC - 44 * 15) < 40) return { ok: false, msg: "44를 kg으로 계산했나요? 이 양은 1 kg 당 " + perKg.toFixed(1) + " mg — 처방의 " + (perKg / 15).toFixed(1) + " 배입니다." };
          return { ok: false, msg: "지금은 아이 몸무게 1 kg 당 " + perKg.toFixed(1) + " mg입니다." };
        }
      };
    },
    hints: [
      "처방은 <b>kg</b> 기준인데 몸무게는 <b>lb</b>로 적혀 있습니다. 먼저 단위를 맞추세요. 44 lb × 0.4536 = ?",
      "필요한 약 = (몸무게 kg) × 15 mg. 시럽 1 mL 에는 160 ÷ 5 = <b>32 mg</b>이 들어 있습니다."
    ],
    solution: "44 lb × 0.4536 ≈ <b>20.0 kg</b> → 20.0 × 15 ≈ <b>300 mg</b> → 300 ÷ 32 ≈ <b>9.4 mL</b>. 9.1~9.6 mL 사이에 두세요.",
    why: "같은 44 라도 <b>lb</b>와 <b>kg</b>은 2.2 배 차이가 납니다. 숫자만 보고 단위를 확인하지 않으면, 화성 기후 궤도선을 잃게 한 ‘파운드힘과 뉴턴’ 사고와 <b>똑같은 구조</b>의 실수가 사람에게 일어납니다.<br>" +
      "그래서 과학과 의료는 단위를 <b>국제 단위계(SI)</b>로 통일하고, 계산할 때 단위까지 함께 적어 나갑니다 — (lb) × (kg/lb) = (kg)처럼 단위가 약분되는지 보면 환산이 맞았는지 스스로 확인할 수 있습니다."
  },

  /* ------------------------------------------------------------------ 2. 규모 · 과학적 표기 */
  {
    id: "c2", about: "02", tag: "규모 · 과학적 표기법", title: "현미경 사진 속 세포", short: "세포 크기",
    who: "🔬", name: "생물 실험실",
    say: "“현미경 사진을 찍었는데 사진마다 확대 배율이 달라서 크기를 비교할 수가 없어요. 다행히 사진 귀퉁이에 <b>눈금 막대(20 µm)</b>가 찍혀 있습니다. 이 세포의 실제 지름을 <b>미터 단위의 과학적 표기</b>로 기록해 주세요.”",
    predict: {
      q: "사진 속 세포의 실제 지름은 머리카락 굵기(약 0.1 mm)와 비교해?",
      options: ["㉠ 머리카락보다 굵다", "㉡ 머리카락과 비슷하다", "㉢ 머리카락보다 가늘다"], answer: 2
    },
    task: "자를 대어 세포 지름을 잰 뒤, 실제 지름을 <b>a × 10ⁿ m</b>(1 ≤ a < 10)로 맞추세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(350), ctx = cv.ctx, W = cv.W;
      var L = 120, a = 1.0, n = -3, PX = 8;          /* 사진에서 1 µm = 8 px, 세포 지름 240 px = 30 µm */
      function draw() {
        var CH = cv.H, i;
        ctx.clearRect(0, 0, W, CH);
        KT.studio(ctx, 0, 0, 570, CH, { x: 280, y: 330, rx: 260, ry: 12 });
        /* 인화한 현미경 사진(흰 테두리 + 그림자) */
        ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.roundRect(22, 32, 506, 286, 6); ctx.fill(); ctx.restore();
        var bf = ctx.createRadialGradient(270, 170, 30, 270, 170, 300); bf.addColorStop(0, "#f5f8f2"); bf.addColorStop(1, "#c9d6c8");
        ctx.fillStyle = bf; ctx.fillRect(30, 40, 490, 270);
        /* 세포(입체 음영) — 지름 240칸 */
        var cg = ctx.createRadialGradient(240, 135, 20, 270, 170, 122); cg.addColorStop(0, "rgba(180,235,225,.9)"); cg.addColorStop(0.8, "rgba(90,190,175,.75)"); cg.addColorStop(1, "rgba(40,130,120,.9)");
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(270, 170, 120, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#0c8599"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(270, 170, 120, 0, Math.PI * 2); ctx.stroke();
        var R = KT.rng(11); for (i = 0; i < 26; i++) { var a0 = R() * 6.28, d0 = 30 + R() * 80; KT.planet(ctx, 270 + Math.cos(a0) * d0, 170 + Math.sin(a0) * d0, 2.5 + R() * 3, "#e9fbf5", "#2b8a7e"); }
        KT.planet(ctx, 290, 160, 34, "#d0bfff", "#5f3dc4");
        lt(ctx, "핵", 290, 166, { s: 12, w: "900", a: "center", c: "#ffffff" });
        ctx.fillStyle = "#111622"; ctx.fillRect(350, 285, 160, 8);
        lt(ctx, "20 µm", 430, 278, { s: 12, w: "900", a: "center", c: "#111622" });
        lt(ctx, "현미경 사진", 30, 24, { s: 13, w: "900", c: LT.mute });
        /* 투명 플라스틱 자(입체) */
        KT.line(ctx, { x: 150, y: 170 }, { x: 150, y: 315 }, LT.orange, 1.5, [4, 4]); KT.line(ctx, { x: 150 + L, y: 170 }, { x: 150 + L, y: 315 }, LT.orange, 1.5, [4, 4]);
        ctx.fillStyle = "rgba(255,146,43,.35)"; ctx.fillRect(150, 316, L, 18);
        ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fillRect(150, 316, L, 4);
        ctx.strokeStyle = LT.orange; ctx.lineWidth = 2.5; ctx.strokeRect(150, 316, L, 18);
        for (i = 0; i <= L; i += 10) { ctx.strokeStyle = "#d9480f"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(150 + i, 316); ctx.lineTo(150 + i, 322); ctx.stroke(); }
        /* 오른쪽 카드 */
        var cd = sideCard(ctx, 580, W, CH, "세포 지름 기록");
        lt(ctx, a.toFixed(1) + " × 10" + sup(n) + " m", cd.px, 64, { s: 22, w: "900", c: LT.blue });
        KT.row(ctx, "자로 잰 길이", L + " 칸", cd.px, cd.R, 102, LT.orange);
        KT.row(ctx, "→ 실제 길이", (L / PX).toFixed(1) + " µm", cd.px, cd.R, 128, LT.orange);
        KT.row(ctx, "눈금 막대", "160 칸 = 20 µm", cd.px, cd.R, 154);
        KT.row(ctx, "비교: 머리카락", "약 1 × 10⁻⁴ m", cd.px, cd.R, 180, LT.violet);
        KT.tip(ctx, "1 µm = 10⁻⁶ m", cd.px - 4, 200, cd.w + 8, null);
        lt(ctx, "자 끝을 세포 양 끝에 맞추세요", cd.px, 262, { s: 11, c: LT.mute });
      }      cv.canvas._redraw = draw;
      api.slider({ label: "자 길이 (사진 칸)", min: 40, max: 400, step: 5, value: 120, fmt: function (x) { return x + " 칸"; },
        onInput: function (x) { L = x; draw(); } });
      api.slider({ label: "앞자리 수 a", min: 1, max: 9.9, step: 0.1, value: 1, fmt: function (x) { return x.toFixed(1); },
        onInput: function (x) { a = x; draw(); } });
      api.slider({ label: "10의 지수 n", min: -9, max: -1, step: 1, value: -3, fmt: function (x) { return "10" + sup(x); },
        onInput: function (x) { n = x; draw(); } });
      api.info("눈금 막대가 사진에서 몇 칸인지 먼저 보세요. 자 끝을 세포 양 끝에 맞추면 됩니다.");
      draw();
      return {
        judge: function () {
          var val = a * Math.pow(10, n), err = Math.abs(val - 3.0e-5) / 3.0e-5;
          if (err <= 0.035) return { ok: true, msg: "세포 지름 30 µm = " + a.toFixed(1) + " × 10" + sup(n) + " m. 머리카락 굵기의 약 3분의 1입니다." };
          if (Math.abs(val - 3.0e-6) / 3.0e-6 <= 0.04) return { ok: false, msg: "10 배 작습니다. 30 µm를 3.0으로 바꾸면서 지수를 하나 올려야 합니다." };
          if (Math.abs(val - 3.0e-4) / 3.0e-4 <= 0.04) return { ok: false, msg: "10 배 큽니다. 지수를 한 번 더 확인하세요." };
          return { ok: false, msg: "기록한 지름 " + a.toFixed(1) + " × 10" + sup(n) + " m — 사진과 맞지 않습니다." };
        }
      };
    },
    hints: [
      "눈금 막대 <b>20 µm = 160 칸</b>. 그러면 1 µm는 몇 칸일까요? 자를 세포 양 끝에 맞춰 칸 수를 재 보세요.",
      "1 µm = 10⁻⁶ m입니다. 30 µm = 30 × 10⁻⁶ m. 앞자리를 1과 10 사이로 만들려면 30 → 3.0으로 바꾸고 지수는?"
    ],
    solution: "세포 지름 240 칸 ÷ 8 칸/µm = <b>30 µm</b> = 30 × 10⁻⁶ m = <b>3.0 × 10⁻⁵ m</b>. a = 3.0, n = −5.",
    why: "사진 속 크기는 배율에 따라 달라지지만, <b>함께 찍힌 눈금 막대</b>와의 비례로 실제 크기를 구할 수 있습니다. 지도에서 축척을 쓰는 것과 같은 원리입니다.<br>" +
      "과학적 표기법은 앞자리를 1과 10 사이로 두고 크기를 <b>10의 거듭제곱</b>에 맡깁니다. 지수만 보면 규모가 바로 보이지요 — 세포(10⁻⁵ m), 머리카락(10⁻⁴ m), 원자(10⁻¹⁰ m)처럼. 30 µm는 지수로는 머리카락보다 한 칸 아래이고, 실제 굵기로는 머리카락의 <b>약 3분의 1</b>입니다."
  },

  /* ------------------------------------------------------------------ 3. 기본량 → 유도량 */
  {
    id: "c3", about: "01", tag: "기본량 · 유도량", title: "단위를 조립하라", short: "단위 조립",
    who: "🚲", name: "자전거 가게 사장님",
    say: "“타이어 공기압계가 <b>kPa(킬로파스칼)</b>로 나오는데, 손님이 파스칼이 대체 뭐냐고 묻네요. 압력은 <b>힘을 넓이로 나눈 값</b>이라던데… 파스칼을 kg, m, s 같은 기본 단위만으로 풀어 보여 줄 수 있을까요?”",
    predict: {
      q: "압력의 단위(Pa)를 기본 단위로 풀어 쓰면, 기본량이 몇 가지 들어갈까요?",
      options: ["㉠ 한 가지", "㉡ 두 가지", "㉢ 세 가지"], answer: 2
    },
    task: "kg · m · s의 지수를 조절해 <b>압력의 단위</b>를 만드세요. 가는 길에 다른 물리량도 찾아보세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(290), ctx = cv.ctx, W = cv.W;      var e = { kg: 0, m: 1, s: 0 }, seen = {};
      var BOOK = {
        "0,1,0": "길이 (m)", "0,2,0": "넓이 (m²)", "0,3,0": "부피 (m³)", "1,0,0": "질량 (kg)", "0,0,1": "시간 (s)",
        "0,1,-1": "속력 (m/s)", "0,1,-2": "가속도 (m/s²)", "1,-3,0": "밀도 (kg/m³)", "1,1,-2": "힘 (N, 뉴턴)",
        "1,2,-2": "에너지 (J, 줄)", "1,2,-3": "일률 (W, 와트)", "1,-1,-2": "압력 (Pa, 파스칼)", "1,1,-1": "운동량 (kg·m/s)",
        "0,0,-1": "진동수 (Hz, 헤르츠)", "0,3,-1": "흐르는 양 (m³/s)"
      };
      function unitText() {
        var parts = [];
        [["kg", e.kg], ["m", e.m], ["s", e.s]].forEach(function (p) {
          if (p[1] === 0) return;
          parts.push(p[0] + (p[1] === 1 ? "" : sup(p[1])));
        });
        return parts.length ? parts.join(" · ") : "(단위 없음)";
      }
      function draw() {
        H.paper(ctx, W, cv.H);
        var key = e.kg + "," + e.m + "," + e.s, name = BOOK[key];
        if (name) seen[key] = name;
        ctx.clearRect(0, 0, W, cv.H);
        var CH = cv.H, LW = 560, SY = 148, CS = 28;
        KT.studio(ctx, 0, 0, LW, CH, { x: 300, y: CH - 20, rx: 280, ry: 16 });
        KT.bigText(ctx, unitText(), 18, 42, 28, "#ffffff");
        KT.bigText(ctx, name ? name : "아직 이름이 붙지 않은 조합", 18, 70, 15, name ? "#8ce99a" : "#ffd35a");
        /* 왼쪽: 자전거 바퀴와 공기압계(사장님 가게의 물건) */
        var wx = 92, wy = 206, wr = 56;
        floorShadow(ctx, wx + 6, wy + wr + 6, 60, 8, 0.28);
        ctx.strokeStyle = "#23262e"; ctx.lineWidth = 13; ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(wx, wy, wr + 3, 3.6, 5.2); ctx.stroke();
        ctx.strokeStyle = metal(ctx, wx - wr, wy - wr, wx + wr, wy + wr, "#ffffff", "#aab3c3", "#5b6476"); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, wy, wr - 9, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = "rgba(90,100,120,.6)"; ctx.lineWidth = 1;
        for (var sk = 0; sk < 12; sk++) { var an = sk * Math.PI / 6; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + Math.cos(an) * (wr - 10), wy + Math.sin(an) * (wr - 10)); ctx.stroke(); }
        KT.planet(ctx, wx, wy, 7, "#ffffff", "#5b6476");
        /* 공기압계: 바퀴 꼭지에 연결된 둥근 계기 */
        var gx = wx + 62, gy = wy - 74, ok = e.kg === 1 && e.m === -1 && e.s === -2;
        ctx.strokeStyle = "#3d4454"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + 26, wy - wr + 8); ctx.quadraticCurveTo(wx + 30, gy + 20, gx - 18, gy + 14); ctx.stroke();
        KT.planet(ctx, gx, gy, 27, "#ffffff", "#7d8698");
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(gx, gy, 21, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = LT.ink; ctx.lineWidth = 1;
        for (var tk = 0; tk <= 8; tk++) { var ta = Math.PI * (0.75 + tk * 1.5 / 8); ctx.beginPath(); ctx.moveTo(gx + Math.cos(ta) * 17, gy + Math.sin(ta) * 17); ctx.lineTo(gx + Math.cos(ta) * 21, gy + Math.sin(ta) * 21); ctx.stroke(); }
        var na = Math.PI * (0.75 + 1.5 * 0.62);
        ctx.strokeStyle = "#d9302c"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(na) * 16, gy + Math.sin(na) * 16); ctx.stroke();
        lt(ctx, "kPa", gx, gy + 13, { s: 9.5, w: "900", a: "center", c: LT.mute });
        KT.pill(ctx, ok ? "Pa = kg·m⁻¹·s⁻²" : "Pa = ?", gx, gy - 38, { a: "center", s: 12, c: ok ? "#8ce99a" : "#ffd35a", box: [0, LW] });
        /* 유리 분수 선반: 위 = 곱하는 단위, 아래 = 나누는 단위 */
        slab(ctx, 236, SY, 288, 10, 26, "rgba(225,236,248,.95)", "rgba(170,190,215,.9)", "rgba(130,150,180,.9)");
        ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(236, SY, 288, 2);
        lt(ctx, "▲ 곱하기", 234, SY - 8, { s: 12, w: "900", a: "right", c: LT.green });
        lt(ctx, "▼ 나누기", 234, SY + 28, { s: 12, w: "900", a: "right", c: LT.red });
        [["kg", e.kg, "#ff922b", 290, "질량"], ["m", e.m, "#4dabf7", 382, "길이"], ["s", e.s, "#9775fa", 474, "시간"]].forEach(function (c) {
          var nAbs = Math.abs(c[1]), k;
          if (!nAbs) { ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = "rgba(20,40,90,.3)"; ctx.lineWidth = 1.2; ctx.strokeRect(c[3] - CS / 2, SY - CS - 2, CS, CS); ctx.restore(); }
          for (k = 0; k < nAbs; k++) {
            var y = c[1] > 0 ? SY - (k + 1) * CS - 1 : SY + 12 + k * CS;
            if (c[1] < 0) { ctx.strokeStyle = "#7d8698"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c[3] - 6, y); ctx.lineTo(c[3] - 6, y - 3); ctx.moveTo(c[3] + 6, y); ctx.lineTo(c[3] + 6, y - 3); ctx.stroke(); }
            ctx.save(); if (c[1] < 0) ctx.globalAlpha = 0.7;
            slab(ctx, c[3] - CS / 2, y + 8, CS - 4, CS - 8, 9, KT.tint(c[2], 1.18), c[2], KT.tint(c[2], 0.72)); ctx.restore();
            if (c[1] < 0) { ctx.save(); ctx.setLineDash([3, 2]); ctx.strokeStyle = KT.tint(c[2], 0.6); ctx.lineWidth = 1.2; ctx.strokeRect(c[3] - CS / 2, y + 8, CS - 4, CS - 8); ctx.restore(); }
            lt(ctx, c[0], c[3] - 2, y + 26, { s: 12, w: "900", a: "center", c: "#ffffff" });
          }
          lt(ctx, c[0] + (c[1] === 0 ? "⁰" : sup(c[1])), c[3], CH - 26, { s: 14, w: "900", a: "center", c: KT.tint(c[2], 0.75) });
          lt(ctx, c[4], c[3], CH - 10, { s: 12, w: "800", a: "center", c: LT.mute });
        });
        /* 오른쪽 카드: 찾은 물리량 */
        var cd = sideCard(ctx, 570, W, CH, "찾은 물리량 " + Object.keys(seen).length + "개");
        Object.keys(seen).slice(-9).forEach(function (k2, i2) { lt(ctx, "· " + seen[k2], cd.px, 58 + i2 * 24, { s: 12.5, w: "800", c: k2 === key ? LT.green : LT.ink }); });
      }      cv.canvas._redraw = draw;
      api.slider({ label: "kg의 지수", min: -2, max: 2, step: 1, value: 0, fmt: function (x) { return "kg" + sup(x); }, onInput: function (x) { e.kg = x; draw(); } });
      api.slider({ label: "m의 지수", min: -3, max: 3, step: 1, value: 1, fmt: function (x) { return "m" + sup(x); }, onInput: function (x) { e.m = x; draw(); } });
      api.slider({ label: "s의 지수", min: -3, max: 3, step: 1, value: 0, fmt: function (x) { return "s" + sup(x); }, onInput: function (x) { e.s = x; draw(); } });
      api.info("지수가 음수이면 ‘나누기’입니다. 예) m·s⁻¹ = m/s");
      draw();
      return {
        judge: function () {
          if (e.kg === 1 && e.m === -1 && e.s === -2) return { ok: true, msg: "Pa = kg · m⁻¹ · s⁻² — 질량·길이·시간 세 기본량으로 이루어졌습니다." };
          if (e.kg === 1 && e.m === 1 && e.s === -2) return { ok: false, msg: "그건 힘(N)입니다. 이제 넓이(m²)로 나누어 보세요." };
          return { ok: false, msg: "지금은 " + unitText() + " — 압력의 단위가 아닙니다." };
        }
      };
    },
    hints: [
      "먼저 <b>힘</b>의 단위를 만들어 보세요. F = ma이므로 N = kg × m/s²입니다.",
      "압력 = 힘 ÷ 넓이. kg·m·s⁻²을 m²로 나누면 m의 지수는 1 − 2 = ?"
    ],
    solution: "Pa = N ÷ m² = (kg·m·s⁻²) ÷ m² = <b>kg · m⁻¹ · s⁻²</b>. kg 1, m −1, s −2.",
    why: "힘·에너지·압력처럼 이름이 따로 있는 단위도 <b>기본량(질량·길이·시간…) 몇 개의 조합</b>으로 풀어집니다. 이것이 기본량과 유도량의 관계입니다.<br>" +
      "이 조합을 알면 공식이 맞는지 <b>단위로 검산</b>할 수 있습니다. 예) 운동 에너지 ½mv²의 단위는 kg·(m/s)² = kg·m²·s⁻² — 방금 찾은 J과 같습니다. 단위가 안 맞는 식은 틀린 식입니다."
  }
  ]
});
})();
