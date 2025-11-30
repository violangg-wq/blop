
// Minimal shim implementing a tiny AIPWidgets-like API if the real runtime isn't present.
// It exposes window.AIPWidgets.render(container, config) and returns a simple object.
(function(window){
  if(window.AIPWidgets) return; // real runtime present
  console.warn("AIPWidgets runtime not detected — using local shim for demo.");

  function createDecorGame(container, config){
    // config is ignored for the shim; we just wire the DOM and events
    return {
      mount: function(){ /*already mounted by app.js*/ },
      destroy: function(){ /*noop*/ }
    };
  }

  window.AIPWidgets = {
    render: function(selectorOrEl, config){
      var el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
      if(!el) throw new Error("container not found for AIPWidgets.render");
      return createDecorGame(el, config);
    }
  };
})(window);
