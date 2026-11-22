// Copy buttons on the hosted-tracker guide: <button data-copy-target="id" data-done="Copied">.
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy-target]');
    if (!b) return;
    var el = document.getElementById(b.getAttribute('data-copy-target'));
    if (!el) return;
    var label = b.textContent;
    function done() { b.textContent = b.getAttribute('data-done') || 'Copied'; setTimeout(function () { b.textContent = label; }, 2000); }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      try { if (document.execCommand('copy')) done(); } catch (x) {}
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(el.textContent).then(done, fallback);
    else fallback();
  });
})();
