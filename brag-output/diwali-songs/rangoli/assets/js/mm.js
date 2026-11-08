// Shared pieces for the three Diwali song reels: easing, SVG helpers, the woven MM mark and the end card.
// Everything is a pure function of time so the render is deterministic and seekable.
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var MM = {};
  MM.clamp = function (x, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, x)); };
  MM.seg = function (t, a, b) { return MM.clamp((t - a) / (b - a)); };
  MM.lerp = function (a, b, k) { return a + (b - a) * k; };
  MM.out3 = function (x) { x = MM.clamp(x); return 1 - Math.pow(1 - x, 3); };
  MM.inOut = function (x) { x = MM.clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  MM.back = function (x, s) { x = MM.clamp(x); s = s || 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
  MM.el = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  MM.rnd = function (s) { var x = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

  // woven MM mark (LogoMark.astro geometry, unchanged)
  MM.markSVG = function (svgEl, id, inner, outer) {
    var a = 64, b = 112, s = 0.625, t2 = 24, B = 200, sw = 18, gap = 9;
    var v1 = a * s, v2 = t2 + b * s, yc = t2 + (b - a) * s;
    var P = function (pts) { return "M" + pts.map(function (q) { return q.join(","); }).join("L"); };
    var len = Math.hypot(1, s), ux = -1 / len, uy = s / len, r = function (k) { return +k.toFixed(2); };
    var sg = function (L) { return { left: "M" + -a + "," + r(yc - L) + "L" + -a + "," + r(yc + L), right: "M" + r(a - ux * L) + "," + r(yc - uy * L) + "L" + r(a + ux * L) + "," + r(yc + uy * L) }; };
    var cut = sg(sw * 2), redraw = sg(sw * 3.6), pad = sw;
    svgEl.setAttribute("viewBox", (-b - pad) + " " + (-pad * 2) + " " + (2 * (b + pad)) + " " + (B + pad * 3));
    var st = 'fill="none" stroke-width="' + sw + '" stroke-linejoin="miter" stroke-miterlimit="4"';
    svgEl.innerHTML = '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="-400" y="-400" width="800" height="800"><rect x="-400" y="-400" width="800" height="800" fill="#fff"/><path d="' + cut.left + cut.right + '" stroke="#000" stroke-width="' + (sw + 2 * gap) + '"/></mask>' +
      '<g><path d="' + P([[a, B], [b, B], [b, t2], [0, v2], [-b, t2], [-b, B], [-a, B]]) + '" stroke="' + outer + '" mask="url(#' + id + ')" ' + st + '/><path d="' + redraw.right + '" stroke="' + outer + '" ' + st + "/></g>" +
      '<g><path d="' + P([[-a, B], [-a, 0], [0, v1], [a, 0], [a, B]]) + '" stroke="' + inner + '" stroke-linecap="square" mask="url(#' + id + ')" ' + st + '/><path d="' + redraw.left + '" stroke="' + inner + '" ' + st + "/></g>";
  };

  // End card: the MM badge with "Market Movers" under it as one lockup, then the wish.
  // top: y of the badge centre. Returns update(t, t0) that animates it in from t0.
  MM.endCard = function (parent, top) {
    var wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;inset:0;pointer-events:none";
    wrap.innerHTML =
      '<div class="ec-badge" style="position:absolute;left:540px;top:' + top + 'px;width:270px;height:270px;margin:-135px 0 0 -135px;border-radius:50%;background:#fbf3e2;box-shadow:0 0 0 12px #f5c542,0 0 0 20px #2b1a10;display:flex;align-items:center;justify-content:center">' +
      '<svg class="ec-mm" style="position:relative;width:158px;height:auto;overflow:visible"></svg></div>' +
      '<p class="ec-name" style="position:absolute;left:0;right:0;top:' + (top + 185) + 'px;text-align:center;font-size:80px;font-weight:600;letter-spacing:-0.02em;color:#fbf3e2;line-height:1">Market Movers</p>' +
      '<p class="ec-hd" style="position:absolute;left:0;right:0;top:' + (top + 320) + 'px;text-align:center;font-size:140px;line-height:0.95;font-weight:900;color:#f5c542;-webkit-text-stroke:6px #2b1a10;paint-order:stroke fill;text-shadow:0 10px 0 #1c0307">Happy<br>Diwali</p>' +
      '<p class="ec-hi" style="position:absolute;left:0;right:0;top:' + (top + 600) + 'px;text-align:center;font-family:\'Plex Hindi\',sans-serif;font-size:58px;font-weight:600;color:#fbf3e2">शुभ दीपावली</p>' +
      '<p class="ec-loc" style="position:absolute;left:0;right:0;top:' + (top + 695) + 'px;text-align:center;font-size:30px;font-weight:700;letter-spacing:0.16em;color:#f5c542">MARHATAL, JABALPUR</p>';
    parent.appendChild(wrap);
    MM.markSVG(wrap.querySelector(".ec-mm"), "mmend" + Math.round(top), "#1b1b1b", "#0b5d63");
    var q = function (c) { return wrap.querySelector(c); };
    return function (t, t0) {
      wrap.style.display = t < t0 ? "none" : "block";
      if (t < t0) return;
      var kb = MM.back(MM.seg(t, t0, t0 + 0.45), 1.6);
      q(".ec-badge").style.transform = "scale(" + kb.toFixed(3) + ") rotate(" + (-120 * (1 - MM.out3(MM.seg(t, t0, t0 + 0.45)))).toFixed(1) + "deg)";
      var kn = MM.out3(MM.seg(t, t0 + 0.12, t0 + 0.42));
      q(".ec-name").style.cssText += ";opacity:" + kn.toFixed(3) + ";transform:translateY(" + (24 * (1 - kn)).toFixed(1) + "px)";
      var kh = MM.out3(MM.seg(t, t0 + 0.3, t0 + 0.58));
      q(".ec-hd").style.cssText += ";opacity:" + kh.toFixed(3) + ";transform:scale(" + (1.9 - 0.9 * kh).toFixed(3) + ")";
      var ki = MM.out3(MM.seg(t, t0 + 0.55, t0 + 0.85));
      q(".ec-hi").style.cssText += ";opacity:" + ki.toFixed(3) + ";transform:translateY(" + (24 * (1 - ki)).toFixed(1) + "px)";
      q(".ec-loc").style.opacity = MM.seg(t, t0 + 0.75, t0 + 1.05).toFixed(3);
    };
  };
  window.MM = MM;
})();
