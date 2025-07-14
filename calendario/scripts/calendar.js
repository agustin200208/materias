(() => {
  // Referencias DOM
  const container = document.getElementById('calendar-container');
  const btnYear = document.getElementById('btn-year');
  const btnMes = document.getElementById('btn-mes');
  const btnDia = document.getElementById('btn-dia');

  // Datos
  const today = new Date();
  const añoActual = today.getFullYear();
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  let mesActivo = null;
  let diaActivo = null;

  // Limpia contenedor
  function clear() { container.innerHTML = ''; }

  // Reset clases botones (se puede mejorar toggling si se desea)
  function actualizarBotones() {
    if (diaActivo) btnDia.classList.add();
    else if (mesActivo !== null) btnMes.classList.add();
  }

  // Navegación
  function irAño() { mesActivo = null; diaActivo = null; actualizarBotones(); renderAño(); }
  function irMes() { if (mesActivo === null) mesActivo = today.getMonth(); diaActivo = null; actualizarBotones(); renderMes(); }
  function irDia() { if (!diaActivo) diaActivo = today; mesActivo = diaActivo.getMonth(); actualizarBotones(); renderDia(); }

  // Render Año
  function renderAño() {
    container.className = 'grid grid-cols-4 grid-rows-3 gap-4'; clear();
    meses.forEach((m, idx) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800 border-l-4 border-blue-400 rounded-lg p-4 hover:shadow-xl cursor-pointer';
      card.onclick = () => { mesActivo = idx; irMes(); };

      const h2 = document.createElement('h2');
      h2.className = 'text-lg font-semibold mb-2 text-center text-blue-300';
      h2.textContent = m; card.appendChild(h2);

      const head = document.createElement('div');
      head.className = 'grid grid-cols-7 text-xs font-medium text-center text-slate-400';
      diasSemana.forEach(d => { const span = document.createElement('div'); span.textContent = d; head.appendChild(span); });
      card.appendChild(head);

      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-7 text-xs text-center text-slate-300';
      const primerDia = new Date(añoActual, idx, 1).getDay();
      const offset = (primerDia + 6) % 7;
      for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));
      const totalDias = new Date(añoActual, idx + 1, 0).getDate();
      for (let d = 1; d <= totalDias; d++) { const cell = document.createElement('div'); cell.textContent = d; grid.appendChild(cell); }
      card.appendChild(grid);
      container.appendChild(card);
    });
  }

  // Render Mes
  function renderMes() {
    container.className = 'grid grid-cols-1 gap-4'; clear();
    const header = document.createElement('h2');
    header.className = 'text-2xl font-semibold text-center text-blue-300';
    header.textContent = `${meses[mesActivo]} ${añoActual}`; container.appendChild(header);

    const grid = document.createElement('div'); grid.className = 'grid grid-cols-7 gap-2';
    diasSemana.forEach(d => { const span = document.createElement('div'); span.className = 'text-lg font-semibold text-center text-slate-400'; span.textContent = d; grid.appendChild(span); });

    const primerDia = new Date(añoActual, mesActivo, 1).getDay();
    const offset = (primerDia + 6) % 7; for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));
    const totalDias = new Date(añoActual, mesActivo + 1, 0).getDate();
    for (let d = 1; d <= totalDias; d++) {
      const cell = document.createElement('div');
      cell.className = 'p-4 bg-slate-800 hover:bg-blue-500 rounded cursor-pointer text-xl text-slate-200';
      cell.textContent = d; cell.onclick = () => { diaActivo = new Date(añoActual, mesActivo, d); irDia(); };
      grid.appendChild(cell);
    }
    container.appendChild(grid);
  }

  // Render Día
  function renderDia() {
    container.className = 'grid grid-cols-1 gap-4'; clear();
    const y = diaActivo.getFullYear(), m = diaActivo.getMonth(), d = diaActivo.getDate();
    const header = document.createElement('h2');
    header.className = 'text-2xl font-semibold text-center text-blue-300';
    header.textContent = `${d} ${meses[m]} ${y}`; container.appendChild(header);

    const list = document.createElement('div'); list.className = 'grid gap-1';
    for (let h = 0; h < 24; h++) {
      const hora = document.createElement('div');
      hora.className = 'p-3 bg-slate-800 border border-slate-700 rounded-lg text-center text-slate-200';
      hora.textContent = `${h.toString().padStart(2, '0')}:00`;
      list.appendChild(hora);
    }
    container.appendChild(list);
  }

  // Agregar listeners y arrancar
  btnYear.addEventListener('click', irAño);
  btnMes.addEventListener('click', irMes);
  btnDia.addEventListener('click', irDia);
  irAño();
})();