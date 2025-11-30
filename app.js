
// app.js — main demo logic. Attempts to use AIPWidgets.render, but the shim will provide it if missing.
document.addEventListener('DOMContentLoaded', function(){
  const room = document.getElementById('room');
  const palette = document.getElementById('palette');
  const roomColor = document.getElementById('roomColor');
  const toggleGrid = document.getElementById('toggleGrid');
  const resetBtn = document.getElementById('resetBtn');
  const screenshotBtn = document.getElementById('screenshotBtn');

  // Initialize AIPWidgets (or shim)
  const widget = window.AIPWidgets && window.AIPWidgets.render ? window.AIPWidgets.render(room, {widget: 'decor_game'}) : null;

  // Simple furniture generator
  function createFurniture(type, x=60, y=60){
    const el = document.createElement('div');
    el.className = 'furniture';
    el.dataset.type = type;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = (type === 'sofa' ? 180 : type === 'table' ? 100 : 60) + 'px';
    el.style.height = (type === 'sofa' ? 90 : type === 'table' ? 60 : 60) + 'px';
    el.innerHTML = '<div class="label">' + type + '</div>';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.borderRadius = '8px';
    el.style.background = '#ffffff';
    el.style.border = '1px solid rgba(0,0,0,0.06)';
    el.style.boxShadow = '0 4px 12px rgba(2,6,23,0.06)';
    el.style.cursor = 'grab';
    makeDraggable(el);
    room.appendChild(el);
    return el;
  }

  // Drag helpers
  function makeDraggable(el){
    let dragging = false, startX=0, startY=0, origX=0, origY=0;
    el.addEventListener('pointerdown', (ev)=>{
      dragging = true;
      el.setPointerCapture(ev.pointerId);
      startX = ev.clientX; startY = ev.clientY;
      origX = parseInt(el.style.left || 0);
      origY = parseInt(el.style.top || 0);
      el.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', (ev)=>{
      if(!dragging) return;
      let dx = ev.clientX - startX;
      let dy = ev.clientY - startY;
      el.style.left = Math.max(0, Math.min(room.clientWidth - el.clientWidth, origX + dx)) + 'px';
      el.style.top = Math.max(0, Math.min(room.clientHeight - el.clientHeight, origY + dy)) + 'px';
    });
    window.addEventListener('pointerup', (ev)=>{
      if(dragging){
        dragging = false;
        try{ el.releasePointerCapture(ev.pointerId); }catch(e){}
        el.style.cursor = 'grab';
      }
    });
    // double-click to remove
    el.addEventListener('dblclick', ()=> el.remove());
  }

  // Palette drag-to-room
  palette.querySelectorAll('.item').forEach(item=>{
    item.addEventListener('dragstart', (e)=> e.dataTransfer.setData('text/plain', item.dataset.type));
    // Also support pointer-based pick-and-drop
    item.addEventListener('pointerdown', (ev)=>{
      ev.preventDefault();
      const type = item.dataset.type;
      const rect = room.getBoundingClientRect();
      const dropped = createFurniture(type, Math.max(20, ev.clientX - rect.left - 40), Math.max(20, ev.clientY - rect.top - 30));
      // small animation
      dropped.style.transform = 'scale(0.98)';
      setTimeout(()=> dropped.style.transform = '', 120);
    });
  });

  // Allow dropping via DOM drag events (for desktop)
  room.addEventListener('dragover', (e)=> e.preventDefault());
  room.addEventListener('drop', (e)=>{
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const rect = room.getBoundingClientRect();
    createFurniture(type, Math.max(8, e.clientX - rect.left - 40), Math.max(8, e.clientY - rect.top - 30));
  });

  // Options
  roomColor.addEventListener('input', ()=> room.style.background = roomColor.value);
  toggleGrid.addEventListener('change', ()=> {
    room.classList.toggle('grid', toggleGrid.checked);
  });
  resetBtn.addEventListener('click', ()=> {
    room.querySelectorAll('.furniture').forEach(n=> n.remove());
  });

  screenshotBtn.addEventListener('click', ()=> {
    // simple screenshot using HTMLCanvas drawImage with SVG foreignObject for crispness
    const width = room.clientWidth, height = room.clientHeight;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
      <foreignObject width='100%' height='100%'>${new XMLSerializer().serializeToString(room)}</foreignObject>
    </svg>`;
    const img = new Image();
    const svgBlob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    img.onload = function(){
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'decor_screenshot.png';
      a.click();
    };
    img.src = url;
  });

  // Minimal initial layout: add a couple of example items
  createFurniture('sofa', 40, 300);
  createFurniture('table', 260, 360);
  createFurniture('lamp', 540, 80);

});
