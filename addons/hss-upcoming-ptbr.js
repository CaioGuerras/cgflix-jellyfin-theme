/* Home Screen Sections ("Upcoming Movies/Shows"): Brazilian Portuguese dates.
   The plugin writes "Today! - 24/06/2026", "1 Week, 2 Days - 13/10/2026", "S01E43 - Episode 43" and "TBA", counts days in UTC
   and says "Today!" even for past dates. This rewrites the drawn text using the DATE in the device's time zone:
   "Já lançado", "Hoje", "Amanhã", "Em 9 dias", "Em 3 semanas e 2 dias", "Em 2 meses"; "Episódio 43"; "A definir".
   Only touches sections whose title contains "em breve" (the plugin's own pt-BR title). Load it with any JS injector
   (e.g. nginx sub_filter, see nginx/jellyfin-inject.conf.example). GPL-2.0-or-later. */
(function () {
  var P = "[0-9]+ (Days?|Weeks?|Months?|Years?)";
  var RD = new RegExp("^(Today!|" + P + "(, " + P + ")*) - ([0-9]{2})[/]([0-9]{2})[/]([0-9]{4})");
  var RE = new RegExp("^(S[0-9]+E[0-9]+ - )(Episode ([0-9]+)|TBA)");
  function rel(x) {
    if (x < 0) return "Já lançado";
    if (x === 0) return "Hoje";
    if (x === 1) return "Amanhã";
    if (x < 14) return "Em " + x + " dias";
    if (x < 61) {
      var w = Math.floor(x / 7), r = x % 7;
      return "Em " + w + (w > 1 ? " semanas" : " semana") + (r ? " e " + r + (r > 1 ? " dias" : " dia") : "");
    }
    var m = Math.round(x / 30.4);
    return "Em " + m + (m > 1 ? " meses" : " mês");
  }
  function tr(t) {
    var m = RD.exec(t);
    if (m) {
      var d = new Date(+m[7], +m[6] - 1, +m[5]), h = new Date();
      h.setHours(0, 0, 0, 0);
      return rel(Math.round((d - h) / 864e5)) + " · " + m[5] + "/" + m[6] + "/" + m[7];
    }
    m = RE.exec(t);
    if (m) return m[1] + (m[3] ? "Episódio " + m[3] : "A definir") + t.slice(m[0].length);
    if (t === "TBA") return "A definir";
    return null;
  }
  function scan() {
    var s = document.querySelectorAll(".homePage:not(.hide) .verticalSection");
    for (var i = 0; i < s.length; i++) {
      var title = s[i].querySelector(".sectionTitle");
      if (!title || title.textContent.toLowerCase().indexOf("em breve") < 0) continue;
      var w = document.createTreeWalker(s[i], NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        var t = n.nodeValue.trim();
        if (!t) continue;
        var r = tr(t);
        if (r && r !== t) n.nodeValue = r;
      }
    }
  }
  setInterval(scan, 1500);
})();
