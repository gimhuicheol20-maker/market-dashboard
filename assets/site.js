/* 시스템 트레이딩 공용 스크립트: 머리글(탭), 링크, 숫자 표시 */
(function () {
  // 텔레그램·구글 시트 주소. 비어 있으면 버튼이 '준비 중'으로 보여요.
  var LINKS = { telegram: "", sheet: "" };

  // 탭 묶음: 큰 탭 4개 + 묶음 안의 작은 탭. 첫 페이지가 큰 탭의 기본 화면이에요.
  var GROUPS = [
    ["실매매 현황", [["index.html", "실매매 현황"]]],
    ["시장", [["market.html", "시장"], ["score.html", "매력 점수"], ["stocks.html", "개별주"]]],
    ["AI", [["ai.html", "미장 AI"], ["kr.html", "국장 AI"], ["wyckoff.html", "와이코프"]]],
    ["퇴근 후 5분", [["five.html", "퇴근 후 5분"]]]
  ];

  var BELL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path></svg>';

  function header() {
    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var cur = null;
    GROUPS.forEach(function (g) { g[1].forEach(function (t) { if (t[0] === here) cur = g; }); });
    var el = document.createElement("header");
    el.className = "site-head";
    var main = GROUPS.map(function (g) {
      var on = g === cur ? ' aria-current="page"' : "";
      return '<a href="' + g[1][0][0] + '"' + on + ">" + g[0] + "</a>";
    }).join("");
    var sub = cur && cur[1].length > 1 ? '<nav class="subtabs" aria-label="' + cur[0] + '">' + cur[1].map(function (t) {
      return '<a href="' + t[0] + '"' + (t[0] === here ? ' aria-current="page"' : "") + ">" + t[1] + "</a>";
    }).join("") + "</nav>" : "";
    var bellOn = here === "app.html" ? ' aria-current="page"' : "";
    el.innerHTML =
      '<div class="in"><div class="head-row"><a class="brand" href="index.html"><b>시스템 트레이딩</b><span>시스템 기반 · 매일 아침·저녁 자동 갱신 · 알림으로 확인</span></a>' +
      '<a class="bell" href="app.html" title="앱 · 알림" aria-label="앱 · 알림"' + bellOn + ">" + BELL + "</a></div>" +
      '<nav class="tabs" aria-label="페이지">' + main + "</nav>" + sub + "</div>";
    document.body.insertBefore(el, document.body.firstChild);
    var c = el.querySelector('.tabs [aria-current="page"]');
    if (c && c.scrollIntoView) { try { c.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
  }

  function links() {
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var url = LINKS[a.getAttribute("data-link")];
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
      else { a.setAttribute("aria-disabled", "true"); a.removeAttribute("href"); a.title = "준비 중"; }
    });
  }

  window.MD = {
    json: function (url) {
      return fetch(url, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    },
    pct: function (v, d) {
      if (v === null || v === undefined || isNaN(v)) return "—";
      d = d === undefined ? 1 : d;
      return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d) + "%";
    },
    signed: function (v, d) {
      if (v === null || v === undefined || isNaN(v)) return "—";
      return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d === undefined ? 1 : d);
    },
    esc: function (s) {
      return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    },
    md: function (iso) { // "2026-11-18" → "11.18"
      if (!iso) return "";
      var p = String(iso).slice(0, 10).split("-");
      return p.length === 3 ? p[1] + "." + p[2] : iso;
    }
  };

  // 앱(홈 화면에 추가)과 푸시 알림용 서비스 워커
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (e) { console.log("[앱] 서비스 워커 등록 실패", e); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () { header(); links(); });
})();
