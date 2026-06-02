// ============================================
// ALUMINIOS - TECNI-YA
// Base de datos simple: solo aluminios
// ============================================

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB4W_0bdRoL-VnN6FAiSWhnQWNO-fRairc",
    authDomain: "proyecto-libertad-38c2a.firebaseapp.com",
    projectId: "proyecto-libertad-38c2a",
    storageBucket: "proyecto-libertad-38c2a.firebasestorage.app",
    messagingSenderId: "115380076439",
    appId: "1:115380076439:web:85383b2c32cdb40c798ed2"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================
// ESTADO
// ============================================
let items = [];           // Lista de aluminios: { n, c, precios: { compra, venta, xmetro, apk } }
let colorActual = 'natural';
let filtroBusqueda = '';

// Colores disponibles
const COLORES = [
    { id: 'natural', nombre: 'Natural' },
    { id: 'negro', nombre: 'Negro' },
    { id: 'blanco', nombre: 'Blanco' },
    { id: 'madera', nombre: 'Madera' },
    { id: 'negro_brillante', nombre: 'Negro Brillante' },
    { id: 'dune', nombre: 'Dune' },
    { id: 'otro', nombre: 'Otro' }
];

// ============================================
// FUNCIONES DE CONEXIÓN
// ============================================

function actualizarEstado(estado, mensaje) {
    const el = document.getElementById('estadoConexion');
    if (!el) return;
    el.className = 'estado-conexion ' + estado;
    el.textContent = mensaje;
}

// Cargar datos desde Firestore
async function cargarDatos() {
    actualizarEstado('loading', '⏳ Cargando datos desde Firebase...');
    try {
        const docRef = db.collection('materiales').doc('aluminios');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            items = data.items || [];
            actualizarEstado('online', '✅ Conectado a Firebase');
        } else {
            // Primera vez: cargar datos iniciales desde el JSON
            actualizarEstado('loading', '⏳ Cargando datos iniciales...');
            await cargarDatosIniciales();
        }
    } catch (error) {
        console.error('Error:', error);
        actualizarEstado('offline', '❌ Error de conexión: ' + error.message);
        // Fallback: cargar desde JSON
        await cargarDatosIniciales();
    }
    renderizarItems();
}

// Cargar datos iniciales desde materiales.json (solo perfiles de aluminio)
async function cargarDatosIniciales() {
    try {
        const response = await fetch('materiales.json');
        const jsonData = await response.json();
        
        // Extraer perfiles de aluminio de sistema (estándar + pesados, sin duplicados)
        const perfilesMap = new Map();
        const sistemas = ['sistema', 'serie60', 'serie80'];
        
        sistemas.forEach(sis => {
            const perfiles = jsonData[sis]?.perfiles;
            if (perfiles) {
                [...(perfiles.estandar || []), ...(perfiles.pesados || [])].forEach(p => {
                    if (p.n && p.c && !perfilesMap.has(p.c)) {
                        perfilesMap.set(p.c, {
                            n: p.n,
                            c: p.c,
                            precios: { compra: 0, venta: 0, xmetro: 0, apk: 0 }
                        });
                    }
                });
            }
        });
        
        items = Array.from(perfilesMap.values());
        
        // Intentar guardar en Firebase
        try {
            await db.collection('materiales').doc('aluminios').set({ items: items });
            actualizarEstado('online', '✅ Datos guardados en Firebase');
        } catch (e) {
            actualizarEstado('offline', '⚠️ Usando datos locales');
        }
    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        actualizarEstado('offline', '❌ Error al cargar datos');
    }
}

// Guardar en Firestore
async function guardarEnFirestore() {
    actualizarEstado('loading', '⏳ Guardando...');
    try {
        await db.collection('materiales').doc('aluminios').set({ items: items });
        actualizarEstado('online', '✅ Guardado en Firebase');
        mostrarToast('✅ Guardado en Firebase');
    } catch (error) {
        console.error('Error al guardar:', error);
        actualizarEstado('offline', '❌ Error al guardar');
        mostrarToast('❌ Error al guardar');
    }
}

// ============================================
// RENDERIZADO
// ============================================

function renderizarItems() {
    const contenedor = document.getElementById('listaItems');
    if (!contenedor) return;
    
    // Aplicar filtro de búsqueda
    let itemsFiltrados = items;
    if (filtroBusqueda.trim()) {
        const termino = filtroBusqueda.trim().toLowerCase();
        itemsFiltrados = items.filter(item => 
            (item.n || '').toLowerCase().includes(termino) || 
            (item.c || '').toLowerCase().includes(termino)
        );
    }
    
    if (itemsFiltrados.length === 0) {
        const mensaje = items.length === 0 
            ? 'No hay aluminios registrados'
            : '🔍 No se encontraron resultados';
        contenedor.innerHTML = `<div class="loading">${mensaje}</div>`;
        return;
    }
    
    let html = `<div class="resultados-info">${itemsFiltrados.length} de ${items.length} items</div>`;
    
    itemsFiltrados.forEach((item, idx) => {
        // Encontrar índice real en el array original
        const idxReal = items.indexOf(item);
        const precios = item.precios || { compra: 0, venta: 0, xmetro: 0, apk: 0 };
        
        html += `
        <div class="item" data-index="${idxReal}">
            <div class="item-nombre">
                <input type="text" class="form-control form-control-sm" 
                    style="background:#1a1a2a;border:1px solid #444;color:#fff;font-size:0.85rem;width:100%;" 
                    value="${escapeHtml(item.n || '')}" 
                    onchange="actualizarItem(${idxReal}, 'n', this.value)" placeholder="Nombre">
            </div>
            <div class="item-codigo">
                <input type="text" class="form-control form-control-sm" 
                    style="background:#1a1a2a;border:1px solid #444;color:#f1f508;font-size:0.75rem;width:80px;text-align:center;font-family:monospace;display:inline-block;" 
                    value="${escapeHtml(item.c || '')}" 
                    onchange="actualizarItem(${idxReal}, 'c', this.value)" placeholder="Código">
            </div>
            <div class="precios">
                <div class="precio-grupo">
                    <span class="precio-label">Compra</span>
                    <input type="number" step="0.01" class="precio-input" value="${precios.compra || 0}" 
                        onchange="actualizarPrecio(${idxReal}, 'compra', parseFloat(this.value) || 0)">
                </div>
                <div class="precio-grupo">
                    <span class="precio-label">Venta</span>
                    <input type="number" step="0.01" class="precio-input" value="${precios.venta || 0}" 
                        onchange="actualizarPrecio(${idxReal}, 'venta', parseFloat(this.value) || 0)">
                </div>
                <div class="precio-grupo">
                    <span class="precio-label">x Metro</span>
                    <input type="number" step="0.01" class="precio-input" value="${precios.xmetro || 0}" 
                        onchange="actualizarPrecio(${idxReal}, 'xmetro', parseFloat(this.value) || 0)">
                </div>
                <div class="precio-grupo">
                    <span class="precio-label">APK</span>
                    <input type="number" step="0.01" class="precio-input" value="${precios.apk || 0}" 
                        onchange="actualizarPrecio(${idxReal}, 'apk', parseFloat(this.value) || 0)">
                </div>
            </div>
        </div>`;
    });
    
    // Botón agregar y guardar
    html += `<button class="btn-agregar" onclick="agregarItem()">+ Agregar nuevo perfil</button>`;
    html += `<button class="btn-guardar" onclick="guardarCambios()">💾 Guardar cambios en Firebase</button>`;
    
    contenedor.innerHTML = html;
}

// ============================================
// FUNCIONES
// ============================================

function cambiarColorGlobal(color) {
    colorActual = color;
    // El color es global, solo afecta visualmente si quisiéramos,
    // pero los precios son independientes del color ahora
    mostrarToast('🎨 Color cambiado a: ' + color);
}

function aplicarFiltro() {
    const input = document.getElementById('buscadorInput');
    const btnClear = document.getElementById('btnClear');
    if (input) {
        filtroBusqueda = input.value;
        btnClear.style.display = filtroBusqueda ? 'block' : 'none';
    }
    renderizarItems();
}

function limpiarBusqueda() {
    filtroBusqueda = '';
    const input = document.getElementById('buscadorInput');
    const btnClear = document.getElementById('btnClear');
    if (input) input.value = '';
    if (btnClear) btnClear.style.display = 'none';
    renderizarItems();
}

function actualizarItem(index, campo, valor) {
    if (items[index]) {
        items[index][campo] = valor;
    }
}

function actualizarPrecio(index, campo, valor) {
    if (!items[index]) return;
    if (!items[index].precios) {
        items[index].precios = { compra: 0, venta: 0, xmetro: 0, apk: 0 };
    }
    items[index].precios[campo] = valor;
}

function agregarItem() {
    items.push({
        n: 'Nuevo perfil',
        c: '0000',
        precios: { compra: 0, venta: 0, xmetro: 0, apk: 0 }
    });
    renderizarItems();
    mostrarToast('➕ Perfil agregado');
}

async function guardarCambios() {
    await guardarEnFirestore();
}

// ============================================
// UTILIDADES
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensaje;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatos();
});
