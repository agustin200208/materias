// public/scripts/script.js

document.addEventListener('DOMContentLoaded', initDashboard);

/**
 * Carga materias, calcula progresos por año y estadísticas
 * y actualiza el DOM: barras de progreso y contadores.
 */
async function initDashboard() {
  try {
    const res = await fetch('/api/materias');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const materias = await res.json();

    // Contadores generales
    const total = materias.length;
    const aprobadas = materias.filter(m => m.estado.toLowerCase() === 'aprobada').length;
    const cursando = materias.filter(m => m.estado.toLowerCase() === 'cursando').length;
    const finales  = materias.filter(m => m.estado.toLowerCase().includes('final')).length;
    const disponibles = materias.filter(m => m.estado.toLowerCase() === 'pendiente').length;

    document.getElementById('aprobadasCount').innerText    = aprobadas;
    document.getElementById('cursandoCount').innerText     = cursando;
    document.getElementById('finalesCount').innerText      = finales;
    document.getElementById('disponiblesCount').innerText  = disponibles;

    // Progreso por año
    const container = document.getElementById('progressContainer');
    container.innerHTML = '';

    [1,2,3,4,5].forEach(year => {
      const porAno = materias.filter(m => m.ano === year);
      const totalAno = porAno.length;
      const aproAno   = porAno.filter(m => m.estado.toLowerCase() === 'aprobada').length;
      const perc = totalAno ? Math.round((aproAno / totalAno) * 100) : 0;

      const bloque = document.createElement('div');
      bloque.className = 'space-y-1';
      bloque.innerHTML = `
        <div class="flex justify-between text-sm">
          <span>Año ${year}</span>
          <span>${aproAno}/${totalAno} (${perc}%)</span>
        </div>
        <progress class="progress progress-primary w-full" value="${perc}" max="100"></progress>
      `;
      container.appendChild(bloque);
    });

  } catch (err) {
    console.error('Error al inicializar dashboard:', err);
  }
}
