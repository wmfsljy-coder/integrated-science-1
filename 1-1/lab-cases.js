/* 통합과학1 Ⅰ-1 과학의 기본량 — 응용 실험실 (공용 엔진 ../assets/lab.js) */
(function () {
"use strict";
var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function sup(n) { return String(n).split("").map(function (ch) { return SUP[ch] || ch; }).join(""); }

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 단위 환산 */
  {
    id: "c1", tag: "SI 단위 · 환산", title: "약 용량 사고 막기", short: "약 용량",
    who: "🧑‍⚕️", name: "해외 병원 간호사",
    say: "“열이 나는 아이가 왔어요. 처방은 <b>몸무게 1 kg 당 15 mg</b>. 그런데 진료 기록에 몸무게가 <b>44 lb(파운드)</b>로만 적혀 있네요. 시럽은 <b>5 mL에 160 mg</b> 들어 있습니다. 주사기에 몇 mL를 담아야 할까요?”",
    predict: {
      q: "간호사가 44를 그대로 kg이라고 여기고 약을 재면 어떻게 될까요?",
      options: ["㉠ 처방의 두 배가 넘는 약을 준다", "㉡ 처방보다 조금 더 준다", "㉢ 처방과 같다"], answer: 0
    },
    task: "주사기에 시럽을 담아 <b>아이 몸무게 1 kg 당 15 mg</b>(14.5~15.5 mg)이 되게 하세요. 1 lb = 0.4536 kg입니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(290), ctx = cv.ctx, W = cv.W;
      var vol = 5, CONC = 160 / 5, KG = 44 * 0.4536;
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "시럽: 5 mL에 160 mg", 40, 34, { s: 14, w: "900" });
        var x0 = 110, x1 = 610, y = 140, sc = (x1 - x0) / 25;
        H.box(ctx, x0, y - 30, x1 - x0, 60, H.v("--card-2"));
        H.box(ctx, x0, y - 30, vol * sc, 60, H.v("--coral"), 0.75);
        ctx.strokeStyle = H.v("--line"); ctx.lineWidth = 2; ctx.strokeRect(x0, y - 30, x1 - x0, 60);
        H.box(ctx, x0 + vol * sc - 6, y - 44, 10, 88, H.v("--ink"));
        H.box(ctx, x0 - 40, y - 5, 40, 10, H.v("--mist"));
        for (var i = 0; i <= 25; i++) {
          var xx = x0 + i * sc;
          ctx.strokeStyle = H.v("--ink"); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xx, y + 30); ctx.lineTo(xx, y + (i % 5 ? 38 : 46)); ctx.stroke();
          if (i % 5 === 0) H.text(ctx, i + " mL", xx, y + 64, { s: 11, a: "center", c: H.v("--mist") });
        }
        H.text(ctx, "진료 기록: 몸무게 44 lb", x0, 250, { s: 13, w: "800", c: H.v("--brand-700") });
        H.rows(ctx, 680, 80, [["담은 부피", vol.toFixed(1) + " mL"], ["들어 있는 약", (vol * CONC).toFixed(0) + " mg", "--coral-700", true]], 44);
      }
      cv.canvas._redraw = draw;
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
    id: "c2", tag: "규모 · 과학적 표기법", title: "현미경 사진 속 세포", short: "세포 크기",
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
        H.paper(ctx, W, cv.H);
        H.box(ctx, 30, 40, 490, 270, H.v("--card-2"));
        ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = H.v("--teal");
        ctx.beginPath(); ctx.arc(270, 170, 120, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.strokeStyle = H.v("--teal-700"); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(270, 170, 120, 0, Math.PI * 2); ctx.stroke();
        H.dot(ctx, 290, 160, 34, H.v("--violet")); H.text(ctx, "핵", 290, 165, { s: 12, w: "900", a: "center", c: "#fff" });
        H.box(ctx, 350, 285, 160, 8, H.v("--ink"));
        H.text(ctx, "20 µm", 430, 278, { s: 12, w: "900", a: "center" });
        /* 자 */
        ctx.strokeStyle = H.v("--coral"); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(150, 325); ctx.lineTo(150 + L, 325); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(150, 315); ctx.lineTo(150, 335); ctx.moveTo(150 + L, 315); ctx.lineTo(150 + L, 335); ctx.stroke();
        H.dash(ctx, 150, 170, 150, 315, H.v("--coral"), 1); H.dash(ctx, 150 + L, 170, 150 + L, 315, H.v("--coral"), 1);
        H.text(ctx, "현미경 사진", 40, 30, { s: 14, w: "900" });
        H.rows(ctx, 580, 70, [
          ["자로 잰 길이", L + " 칸 → " + (L / PX).toFixed(1) + " µm", "--coral-700"],
          ["내가 기록한 지름", a.toFixed(1) + " × 10" + sup(n) + " m", "--brand-700", true],
          ["비교: 머리카락", "약 1 × 10⁻⁴ m"]
        ], 58);
      }
      cv.canvas._redraw = draw;
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
    id: "c3", tag: "기본량 · 유도량", title: "단위를 조립하라", short: "단위 조립",
    who: "🚲", name: "자전거 가게 사장님",
    say: "“타이어 공기압계가 <b>kPa(킬로파스칼)</b>로 나오는데, 손님이 파스칼이 대체 뭐냐고 묻네요. 압력은 <b>힘을 넓이로 나눈 값</b>이라던데… 파스칼을 kg, m, s 같은 기본 단위만으로 풀어 보여 줄 수 있을까요?”",
    predict: {
      q: "압력의 단위(Pa)를 기본 단위로 풀어 쓰면, 기본량이 몇 가지 들어갈까요?",
      options: ["㉠ 한 가지", "㉡ 두 가지", "㉢ 세 가지"], answer: 2
    },
    task: "kg · m · s의 지수를 조절해 <b>압력의 단위</b>를 만드세요. 가는 길에 다른 물리량도 찾아보세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(260), ctx = cv.ctx, W = cv.W;
      var e = { kg: 0, m: 1, s: 0 }, seen = {};
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
        H.text(ctx, "지금 만든 단위", 40, 40, { s: 13, w: "800", c: H.v("--mist") });
        H.text(ctx, unitText(), 40, 100, { s: 40, w: "900", c: H.v("--brand-700") });
        H.text(ctx, name ? "이 단위로 재는 양: " + name : "아직 이름이 붙지 않은 조합", 40, 150,
          { s: 16, w: "900", c: name ? H.v("--teal-700") : H.v("--mist") });
        H.text(ctx, "찾은 물리량 " + Object.keys(seen).length + "개", 560, 40, { s: 13, w: "800", c: H.v("--mist") });
        Object.keys(seen).slice(-8).forEach(function (k, i) {
          H.text(ctx, "· " + seen[k], 560, 66 + i * 22, { s: 12.5, c: H.v("--ink") });
        });
      }
      cv.canvas._redraw = draw;
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
