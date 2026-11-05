/* 통합과학1 Ⅲ-3 생명 시스템 — 실제 자료
   r1 사람 인슐린 유전자를 직접 번역하기 — 읽는 틀과 단백질의 길이
   r2 한 글자가 바뀌면: 낫 모양 적혈구 빈혈증의 실제 돌연변이(헤모글로빈 β)
   자료: data/genes.js (NCBI RefSeq 염기 서열, 공공 영역) */
(function () {
"use strict";
var GN = window.REAL_GENES || { INS: { cds: "" }, HBB: { cds: "" } };
var B = "TCAG", A = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG", CODE = {};
(function () { var i = 0; for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) for (var c = 0; c < 4; c++) CODE[B[a] + B[b] + B[c]] = A[i++]; })();
var KO = { A: "알라닌", R: "아르지닌", N: "아스파라진", D: "아스파트산", C: "시스테인", Q: "글루타민", E: "글루탐산", G: "글리신", H: "히스티딘", I: "아이소류신",
  L: "류신", K: "라이신", M: "메싸이오닌", F: "페닐알라닌", P: "프롤린", S: "세린", T: "트레오닌", W: "트립토판", Y: "타이로신", V: "발린", "*": "멈춤" };
function tr(s, f) { var o = []; for (var i = f; i + 3 <= s.length; i += 3) o.push(CODE[s.substr(i, 3)] || "?"); return o; }
var INS = GN.INS.cds, HBB = GN.HBB.cds;
var LEN = (function () { var p = tr(INS, 0), n = p.indexOf("*"); return n < 0 ? p.length : n; })();
var COL = { A: "#e4572e", T: "#f3a712", G: "#29a36a", C: "#1f8fbf" };
var SRC = "<small>출처: 미국 국립생물공학정보센터(NCBI) RefSeq — 사람 인슐린 NM_000207.3, 헤모글로빈 β NM_000518.5의 단백질 암호화 부분(CDS). 코돈표는 표준 유전 암호. 사본은 data/genes.js.</small>";

function dna(H, ctx, s, from, n, x0, y, cw, hiFrom, hiTo) {     /* 염기 한 칸 = 작은 입체 블록 */
  var K = window.sthKit;
  for (var i = 0; i < n && from + i < s.length; i++) {
    var b = s[from + i], on = from + i >= hiFrom && from + i < hiTo, c = COL[b], x = x0 + i * cw + 1, w = cw - 2, h = 26, d = on ? 5 : 3;
    ctx.globalAlpha = on ? 1 : .55;
    ctx.fillStyle = K.tint(c, 1.25); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d); ctx.lineTo(x + w + d, y - d); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = K.tint(c, .7); ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + d, y - d); ctx.lineTo(x + w + d, y + h - d); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
    H.text(ctx, b, x0 + i * cw + cw / 2, y + 18, { s: 12, w: "900", a: "center", c: "#fff" });
  }
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 유전자로 DNA → RNA → 단백질의 흐름을 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "03", tag: "실제 자료 · 유전 정보의 번역", title: "사람 인슐린 유전자를 직접 번역하기", short: "인슐린 번역",
    who: "🧬", name: "생명 정보 연구실",
    say: "“NCBI에 공개된 <b>사람 인슐린 유전자</b>의 단백질 암호화 부분은 염기 " + INS.length + "개입니다. 세 글자(코돈)가 아미노산 하나를 정하는데, <b>어디서부터 세 글자씩 끊느냐(읽는 틀)</b>에 따라 전혀 다른 단백질이 됩니다. 메싸이오닌(ATG)으로 시작하는 올바른 읽는 틀을 고르고, 멈춤 코돈 전까지 <b>아미노산이 몇 개</b>인지 구해 주세요.”",
    predict: {
      q: "읽기 시작하는 자리를 한 글자만 옮기면 단백질은?",
      options: ["㉠ 아미노산 하나만 바뀐다", "㉡ 그 뒤의 코돈이 모두 달라져 전혀 다른 서열이 된다", "㉢ 그대로다"],
      answer: 1
    },
    task: "읽는 틀(1·2·3번째 글자부터)을 골라 번역해 보고, <b>올바른 틀</b>과 멈춤 코돈 전까지의 <b>아미노산 수</b>를 맞추세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(260), ctx = cv.ctx, W = cv.W, f = 1, n = 50;
      function draw() {
        H.paper(ctx, W, cv.H);
        var cw = 22, x0 = 20, per = 36, K = window.sthKit, LT = K.LT;
        K.t(ctx, "DNA(암호화 가닥) 처음 " + per + " 글자", x0, 22, { s: 11, w: "800", c: LT.mute });
        dna(H, ctx, INS, 0, per, x0, 34, cw, f, per);
        var p = tr(INS, f), stop = p.indexOf("*");
        K.t(ctx, "번역 (" + (f + 1) + "번째 글자부터 세 글자씩)", x0, 88, { s: 11, w: "800", c: LT.mute });
        var nK = 0; while (nK < 11 && x0 + (f + nK * 3) * cw + 3 * cw <= W && (nK === 0 || p[nK - 1] !== "*")) nK++;
        if (nK > 1) { ctx.strokeStyle = "#8a96a8"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + f * cw + 1.5 * cw, 118); ctx.lineTo(x0 + (f + (nK - 1) * 3) * cw + 1.5 * cw, 118); ctx.stroke(); }
        for (var k2 = 0; k2 < nK; k2++) {
          var x = x0 + (f + k2 * 3) * cw + 1.5 * cw;
          if (x + 1.5 * cw > W) break;
          var cc = p[k2] === "*" ? "#e03131" : (p[k2] === "M" && k2 === 0 ? "#0f9f76" : "#4dabf7");
          ctx.fillStyle = "rgba(20,30,50,.14)"; ctx.beginPath(); ctx.ellipse(x + 3, 140, 22, 4, 0, 0, 6.2832); ctx.fill();
          K.planet(ctx, x, 118, 25, cc, K.tint(cc, .45));
          K.t(ctx, KO[p[k2]] || p[k2], x, 122, { s: 9, w: "800", a: "center", c: "#fff" });
          if (p[k2] === "*") break;
        }
        K.card(ctx, 14, 156, 420, 90, null);
        K.row(ctx, "이 틀의 첫 아미노산", KO[p[0]] || p[0], 32, 418, 188, p[0] === "M" ? LT.green : LT.red);
        K.row(ctx, "처음 멈춤 코돈", stop < 0 ? "없음" : (stop + 1) + "번째 코돈", 32, 418, 220);
        K.card(ctx, 450, 156, 436, 90, null);
        K.t(ctx, "내 답 (아미노산 수)", 470, 186, { s: 12, w: "800", c: LT.mute });
        K.t(ctx, n + " 개", 470, 224, { s: 24, w: "900", c: LT.ink });
        K.t(ctx, "염기 " + INS.length + "개 ÷ 3 = 코돈 수", 866, 224, { s: 11.5, w: "700", a: "right", c: LT.mute });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "읽는 틀", value: "1", options: [{ v: "0", t: "1번째 글자부터" }, { v: "1", t: "2번째 글자부터" }, { v: "2", t: "3번째 글자부터" }], onPick: function (x) { f = +x; api.changed(); draw(); } });
      api.slider({ label: "멈춤 전까지 아미노산 수", min: 50, max: 150, step: 1, value: 50, fmt: function (x) { return x + " 개"; }, onInput: function (x) { n = x; api.changed(); draw(); } });
      api.info("올바른 틀에서는 멈춤 코돈이 맨 끝에 한 번만 나옵니다. 염기 수 ÷ 3을 생각해 보세요. " + SRC
        + "<div data-link='{\"id\":\"ncbi-ins\",\"title\":\"NCBI — 사람 인슐린 mRNA (NM_000207)\",\"src\":\"미국 국립생물공학정보센터\",\"url\":\"https://www.ncbi.nlm.nih.gov/nuccore/NM_000207\",\"ask\":\"영어 화면입니다. Ctrl+F로 translation을 찾으면 됩니다. 쪽 아래 FEATURES의 CDS 항목에서 /translation= 뒤의 아미노산 서열이 어떤 글자로 시작하는지(처음 5 글자) 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (f !== 0) return { ok: false, msg: "이 틀은 메싸이오닌으로 시작하지 않거나 곧 멈춥니다. 다른 틀을 골라 보세요." };
          if (n !== LEN) return { ok: false, msg: "틀은 맞았습니다. 염기 " + INS.length + "개 = 코돈 " + INS.length / 3 + "개, 그 가운데 마지막 하나는 멈춤 코돈이에요." };
          return { ok: true, msg: INS.length + " ÷ 3 = " + INS.length / 3 + " 코돈 − 멈춤 1 = 아미노산 " + LEN + "개(프리프로인슐린). 몸속에서 잘려 51개짜리 인슐린이 됩니다." };
        }
      };
    },
    hints: ["첫 코돈이 ATG(메싸이오닌)인 틀을 찾으세요.", INS.length + " 개 ÷ 3 = 코돈 수. 마지막 코돈은 멈춤입니다."],
    solution: "<b>1번째 글자부터</b>, 아미노산 <b>" + LEN + "개</b>.",
    why: "DNA의 염기 서열은 mRNA로 전사된 뒤 리보솜에서 세 글자(코돈)씩 읽혀 아미노산이 이어집니다. 시작 코돈 AUG(DNA 로는 ATG)가 읽는 틀을 정하고, 멈춤 코돈(UAA·UAG·UGA)에서 번역이 끝납니다. 틀이 한 글자만 어긋나도 뒤의 모든 코돈이 바뀌어 전혀 다른 단백질이 되거나 금방 멈춥니다.<br>"
      + "사람 인슐린 유전자가 만드는 " + LEN + "개짜리 사슬은 세포 안에서 앞부분(신호 서열)과 가운데(C 펩타이드)가 잘려 나가고, A 사슬(21개)과 B 사슬(30개)이 남아 인슐린이 됩니다. 이 서열 정보 덕분에 인슐린 사슬을 만드는 DNA(사람 유전자 정보로 만든 것)를 대장균에 넣어 당뇨병 치료제를 만들 수 있게 되었습니다."
  },
  {
    id: "r2", sec: "03", tag: "실제 자료 · 돌연변이", title: "한 글자가 바뀌면 — 낫 모양 적혈구", short: "낫 모양 적혈구",
    who: "🩸", name: "유전 상담 클리닉",
    say: "“적혈구 속 헤모글로빈 β 사슬의 실제 유전자예요. 낫 모양 적혈구 빈혈증은 이 유전자에서 <b>염기 단 한 글자</b>가 바뀌어 생깁니다. 그 결과 단백질의 앞쪽에 있는 <b>글루탐산 하나가 발린으로</b> 바뀌어요. 어느 코돈의 가운데 글자가 무엇으로 바뀐 것인지 찾아 주세요.”",
    predict: {
      q: "DNA 염기 하나가 바뀌면 단백질은 어떻게 될까요?",
      options: ["㉠ 언제나 아무 일도 없다", "㉡ 그 코돈이 정하는 아미노산 하나가 바뀔 수 있고, 그것만으로 단백질의 성질이 크게 달라질 수 있다", "㉢ 단백질 전체가 사라진다"],
      answer: 1
    },
    task: "코돈 번호를 고르고 그 코돈의 <b>가운데 글자</b>를 바꿔 보아, 글루탐산이 발린이 되는 자리를 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(250), ctx = cv.ctx, W = cv.W, k = 1, nb = "A";
      function draw() {
        H.paper(ctx, W, cv.H);
        var cw = 22, x0 = 20, per = 36, p = tr(HBB, 0), K = window.sthKit, LT = K.LT;
        var old = HBB.substr((k - 1) * 3, 3), nw = old[0] + nb + old[2], hit = CODE[old] === "E" && CODE[nw] === "V";
        K.t(ctx, "헤모글로빈 β DNA 처음 " + per + " 글자 (코돈 " + per / 3 + "개)", x0, 22, { s: 11, w: "800", c: LT.mute });
        dna(H, ctx, HBB, 0, per, x0, 34, cw, (k - 1) * 3, k * 3);
        ctx.strokeStyle = "#8a96a8"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 1.5 * cw, 96); ctx.lineTo(x0 + (per - 1.5) * cw, 96); ctx.stroke();
        for (var j = 0; j < per / 3; j++) {
          var x = x0 + j * 3 * cw + 3 * cw / 2, on = j === k - 1, cc = on ? "#f59f00" : "#4dabf7";
          K.planet(ctx, x, 96, on ? 15 : 12, cc, K.tint(cc, .45));
          K.t(ctx, p[j], x, 100, { s: 11, w: "900", a: "center", c: "#fff" });
          K.t(ctx, String(j + 1), x, 124, { s: 9.5, w: "700", a: "center", c: LT.mute });
        }
        K.card(ctx, 14, 140, 420, 96, null);
        K.row(ctx, k + "번째 코돈", old + " → " + nw, 32, 418, 172);
        K.row(ctx, "아미노산", (KO[CODE[old]] || "?") + " → " + (KO[CODE[nw]] || "?"), 32, 418, 200, hit ? LT.green : LT.ink);
        K.t(ctx, "E 글루탐산 · V 발린 · L 류신 · H 히스티딘 · T 트레오닌", 32, 224, { s: 10, c: LT.mute });
        /* 적혈구 미니어처 */
        K.card(ctx, 450, 140, 436, 96, null);
        var sick = hit && k === 7, rx = 520, ry = 186;
        ctx.fillStyle = "rgba(20,30,50,.18)"; ctx.beginPath(); ctx.ellipse(rx + 4, ry + 26, 42, 6, 0, 0, 6.2832); ctx.fill();
        if (!sick) {
          var g = ctx.createRadialGradient(rx - 12, ry - 8, 3, rx, ry, 40); g.addColorStop(0, "#ff8787"); g.addColorStop(1, "#a51111");
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(rx, ry, 40, 22, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "rgba(130,10,10,.55)"; ctx.beginPath(); ctx.ellipse(rx + 2, ry + 2, 20, 9, 0, 0, 6.2832); ctx.fill();
        } else {
          var g2 = ctx.createLinearGradient(rx - 40, ry - 20, rx + 40, ry + 20); g2.addColorStop(0, "#ff8787"); g2.addColorStop(1, "#8f1010");
          ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(rx - 44, ry + 8); ctx.quadraticCurveTo(rx, ry - 40, rx + 44, ry + 8); ctx.quadraticCurveTo(rx, ry - 12, rx - 44, ry + 8); ctx.closePath(); ctx.fill();
        }
        K.t(ctx, sick ? "낫 모양 적혈구" : "정상 적혈구 (가운데가 눌린 원반)", 580, 180, { s: 14, w: "900", c: sick ? LT.red : LT.green });
        K.t(ctx, sick ? "β 사슬 6번째(β6) Glu → Val" : "코돈의 가운데 글자를 바꿔 보세요", 580, 204, { s: 11.5, w: "700", c: LT.mute });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "코돈 번호", min: 1, max: 12, step: 1, value: 1, fmt: function (x) { return x + "번째"; }, onInput: function (x) { k = x; api.changed(); draw(); } });
      api.seg({ label: "가운데 글자를 바꿀 염기", value: "A", options: [{ v: "A", t: "A" }, { v: "T", t: "T" }, { v: "G", t: "G" }, { v: "C", t: "C" }], onPick: function (x) { nb = x; api.changed(); draw(); } });
      api.info("단백질의 아미노산 기호는 위 막대에 있습니다(E = 글루탐산). " + SRC);
      draw();
      return {
        judge: function () {
          var old = HBB.substr((k - 1) * 3, 3), nw = old[0] + nb + old[2];
          if (CODE[old] === "E" && CODE[nw] === "V" && k === 7) return { ok: true, msg: "7번째 코돈 GAG → GTG, 글루탐산 → 발린. 메싸이오닌을 떼어 낸 성숙한 β 사슬로는 6번째 아미노산(β6 Glu→Val)입니다." };
          if (CODE[old] === "E" && CODE[nw] === "V") return { ok: false, msg: "글루탐산 → 발린이 되긴 하지만, 낫 모양 적혈구 빈혈증의 자리는 이보다 하나 앞입니다." };
          if (CODE[old] !== "E") return { ok: false, msg: k + "번째 코돈은 " + (KO[CODE[old]] || "?") + " 입니다. 글루탐산(E) 코돈을 찾으세요." };
          return { ok: false, msg: "글루탐산 자리는 맞았습니다. 가운데 글자를 다른 것으로 바꿔 발린이 되게 해 보세요." };
        }
      };
    },
    hints: ["E(글루탐산)가 처음 나오는 코돈을 찾으세요. 바로 옆에 하나 더 있습니다.", "GAG의 가운데 A를 T로 바꾸면 GTG(발린)."],
    solution: "<b>7번째 코돈</b> GAG의 가운데 A → <b>T</b> (GTG, 발린).",
    why: "헤모글로빈 β 유전자의 염기 하나(A → T)가 바뀌면 글루탐산(물과 잘 어울리는 아미노산)이 발린(물을 싫어하는 아미노산)으로 바뀝니다. 그러면 산소가 적을 때 헤모글로빈끼리 달라붙어 긴 섬유를 이루고, 적혈구가 낫 모양으로 찌그러져 혈관을 막거나 쉽게 터집니다. 염기 한 글자 → 아미노산 하나 → 단백질의 모양 → 세포 → 몸, 유전 정보의 흐름이 한 줄로 이어지는 예입니다.<br>"
      + "이 돌연변이를 한 쌍 가운데 하나만 가진 사람(보인자)은 빈혈이 거의 없고, 말라리아에 걸려도 심하게 앓거나 목숨을 잃을 위험이 낮아, 말라리아가 흔한 지역에 많이 남아 있습니다. 병은 두 대립유전자가 모두 이렇게 바뀐 사람에게 나타납니다. 같은 변이가 환경에 따라 해롭기도 이롭기도 한 셈입니다."
  }
  ]
});
})();
