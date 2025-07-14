// landing/init.js

// Guarda globalmente las materias para poder filtrarlas y editarlas
let materiasGlobales = [];

/**
 * Carga las materias desde el backend,
 * imprime en consola lo que llega, y dispara el render + filtros.
 */
async function cargarMaterias() {
  try {
    const res = await fetch('/api/materias');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    materiasGlobales = await res.json();

    // 🔍 Debug: inspeccioná aquí qué trae el servidor
    console.log('Materias recibidas:', materiasGlobales);

    // Render principal y setup de filtros
    mostrarMaterias(materiasGlobales);
    setupFiltros(materiasGlobales);
  } catch (err) {
    console.error('Error cargando materias:', err);
    if (typeof showToast === 'function') {
      showToast('❌ Error al cargar materias', 'error');
    }
  }
}

// ➡️ Modo edición On/Off
window.editMode = false;
const btnEditar = document.getElementById('btnEditar');
btnEditar.addEventListener('click', () => {
  window.editMode = !window.editMode;
  btnEditar.textContent = window.editMode
    ? '💾 Guardar Cambios'
    : '✏️ Editar Estado';

  // Al salir de modo edición, persisto automáticamente
  if (!window.editMode) {
    guardarMateriasEnServer();
  }

  // Re-render para reflejar el cambio de modo (habilita selects, etc)
  mostrarMaterias(materiasGlobales);
});

/** 
 * Configura los botones de filtro. 
 * Cada uno muestra solo el subset deseado.
 */
const btnTodas       = document.getElementById('filtroTodas');
const btnCursando    = document.getElementById('filtroCursando');
const btnFinal       = document.getElementById('filtroFinal');
const btnAprobadas   = document.getElementById('filtroAprobadas');
const btnDisponibles = document.getElementById('filtroDisponibles');

function setupFiltros(materias) {
  btnTodas.onclick       = () => mostrarMaterias(materias);
  btnCursando.onclick    = () => mostrarMaterias(
                              materias.filter(m => m.estado.toLowerCase() === 'cursando')
                            );
  btnFinal.onclick       = () => mostrarMaterias(
                              materias.filter(m => m.estado.toLowerCase().includes('final'))
                            );
  btnAprobadas.onclick   = () => mostrarMaterias(
                              materias.filter(m => m.estado.toLowerCase() === 'aprobada')
                            );
  btnDisponibles.onclick = () => {
    const materiasDisponibles = materias.filter(m => {
      // Solo considerar materias pendientes
      if (m.estado.toLowerCase() !== 'pendiente') return false;
      
      // Verificar que todas las correlativas estén aprobadas
      return m.correlativas.every(codigoCorrelativa => {
        const correlativa = materias.find(m => m.codigo === codigoCorrelativa);
        return correlativa && correlativa.estado.toLowerCase() === 'aprobada';
      });
    });
    mostrarMaterias(materiasDisponibles);
  };
}

// 🏁 Arranco todo al cargar el script
cargarMaterias();
