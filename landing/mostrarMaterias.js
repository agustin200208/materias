// public/scripts/mostrarMaterias.js

// configuración de estados → emoji, color de borde y clase de badge
const statusConfig = {
  'aprobada':   { emoji: '✅', text: 'Aprobada', border: 'border-green-400', badge: 'badge-success' },
  'cursando':   { emoji: '⏳', text: 'Cursando', border: 'border-blue-400',  badge: 'badge-info' },
  'debo final': { emoji: '⚠️', text: 'Debo final', border: 'border-yellow-400', badge: 'badge-warning' },
  'pendiente':  { emoji: '🕒', text: 'Pendiente', border: 'border-gray-400', badge: 'badge-ghost' },
  'disponible': { emoji: '🔔', text: 'Disponible para rendir', border: 'border-indigo-400', badge: 'badge-primary' }
};

// helper para mostrar un toast rápido
function showToast(message, type = 'info') {
  const colors = { info: 'alert-info', success: 'alert-success', error: 'alert-error' };
  const toast = document.createElement('div');
  toast.className = `alert ${colors[type] || colors.info} shadow-lg`;
  toast.innerText = message;
  document.getElementById('toasts').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function obtenerNombresCorrelativas(codigosCorrelativas, todasLasMaterias) {
  return codigosCorrelativas.map(codigo => {
    const materia = todasLasMaterias.find(m => m.codigo === codigo);
    return materia ? materia.nombre : codigo; // Si no encuentra la materia, muestra el código
  });
}

async function guardarMateriasEnServer() {
  try {
    await fetch('/api/materias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materiasGlobales)
    });
  } catch (err) {
    console.error('Error guardando materias:', err);
    showToast('❌ Error al guardar cambios', 'error');
  }
}

function mostrarMaterias(lista) {
  // 1) limpio todas las secciones
  ['ano1','ano2','ano3','ano4','ano5','taller','optativas']
    .forEach(id => {
      const cont = document.getElementById(id);
      if (cont) cont.innerHTML = '';
    });

  // Función para obtener el estilo de una correlativa según su estado
  function getCorrelativaStyle(codigo) {
    const materia = materiasGlobales.find(m => m.codigo === codigo);
    if (!materia) return '';
    
    if (materia.estado.toLowerCase() === 'aprobada') {
      return 'text-green-400';
    } else if (materia.estado.toLowerCase().includes('final')) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  }

  // Función para mostrar las correlativas con estilos
  function renderCorrelativas(codigos) {
    if (!codigos.length) return 'Ninguna';
    
    return codigos.map(codigo => {
      const materia = materiasGlobales.find(m => m.codigo === codigo);
      const nombre = materia ? materia.nombre : codigo;
      const style = getCorrelativaStyle(codigo);
      return `<span class="${style}">${nombre}</span>`;
    }).join(', ');
  }

  // 2) genero cada tarjeta
  lista.forEach(m => {
    // Corregida la lógica de disponibilidad:
    const esDisponible = 
      m.estado.toLowerCase() === 'pendiente' && 
      m.correlativas.every(codigo => {
        const correlativa = materiasGlobales.find(m => m.codigo === codigo);
        return correlativa && 
              (correlativa.estado.toLowerCase() === 'aprobada' || 
               correlativa.estado.toLowerCase().includes('final'));
      });

    // Mostrar como disponible SOLO si es pendiente con correlativas aprobadas/debo final
    // Las materias en "Debo final" mantienen su estado original
    const estadoMostrar = esDisponible ? 'disponible' : m.estado.toLowerCase();
    const cfg = statusConfig[estadoMostrar] || statusConfig['pendiente'];
    
    const contId = m.tipo
      ? (m.tipo === 'taller' ? 'taller' : 'optativas')
      : 'ano' + m.ano;
    const cont = document.getElementById(contId);
    if (!cont) return;

    const bg = m.tipo
      ? (m.tipo === 'taller'
          ? 'bg-gradient-to-br from-purple-800 to-purple-700'
          : 'bg-gradient-to-br from-pink-800 to-pink-700')
      : ({1:'bg-gradient-to-br from-blue-800 to-blue-700',
          2:'bg-gradient-to-br from-teal-800 to-teal-700',
          3:'bg-gradient-to-br from-yellow-800 to-yellow-700',
          4:'bg-gradient-to-br from-indigo-800 to-indigo-700',
          5:'bg-gradient-to-br from-red-800 to-red-700'}[m.ano] || 'bg-gray-800');

    // construyo la tarjeta
    const card = document.createElement('div');
    card.className = [
      bg,
      'relative border-l-8', cfg.border,
      'shadow-2xl p-6 rounded-2xl flex-none w-72',
      'hover:scale-105 transition-transform duration-200 cursor-pointer'
    ].join(' ');

    card.innerHTML = `
      <div class="mb-4">
        <h3 class="font-extrabold text-xl mb-2">${m.nombre}</h3>
        <span class="absolute top-2 right-2 badge ${cfg.badge} flex items-center gap-1">
          ${cfg.emoji} ${cfg.text}
        </span>
      </div>
      <p class="text-sm text-gray-200 mb-2">
        <strong>Código:</strong> ${m.codigo}
      </p>
      <p class="text-sm">
        <strong class="text-gray-300">Correlativas:</strong> ${
          renderCorrelativas(m.correlativas)
        }
      </p>
    `;
    // 3) dropdown de día solo si cursando
    const header = card.querySelector('.mb-4');
    if (m.estado.toLowerCase() === 'cursando') {
      const select = document.createElement('select');
      select.className = 'select select-sm bg-gray-800 text-gray-100 border border-gray-600 mr-2 py-1 transform -translate-y-5';
      ['','Lunes','Martes','Miércoles','Jueves','Viernes'].forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d || '—';
        if (m.dia === d) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', async e => {
        m.dia = e.target.value;
        await guardarMateriasEnServer();
        showToast(`📅 "${m.nombre}" → ${m.dia || '—'}`, 'success');
      });
      header.insertBefore(select, header.firstChild);
    }

    // 4) click para cambiar estado SOLO en modo edición
    card.addEventListener('click', async () => {
      if (!window.editMode) {
        showToast('🔒 Activa "Editar Estado" para modificar', 'info');
        return;
      }
      const orden = ['pendiente','cursando','debo final','aprobada'];
      const cur   = m.estado.toLowerCase();
      const next  = orden[(orden.indexOf(cur) + 1) % orden.length];
      m.estado    = next.charAt(0).toUpperCase() + next.slice(1);

      // actualización de badge y borde
      const nuevoCfg = statusConfig[m.estado.toLowerCase()];
  const badgeEl = card.querySelector('.badge');
  badgeEl.className = `absolute top-2 right-2 badge ${nuevoCfg.badge} flex items-center gap-1`;
  badgeEl.innerHTML = `${nuevoCfg.emoji} ${nuevoCfg.text}`;
      Object.values(statusConfig).forEach(s => card.classList.remove(s.border));
      card.classList.add(nuevoCfg.border);

      showToast(`📌 "${m.nombre}" → ${m.estado}`, 'success');
      try { await guardarMateriasEnServer(); } catch { showToast('❌ Error guardando', 'error'); }
    });

    // 5) agrego la tarjeta al DOM
    cont.appendChild(card);
  });
}