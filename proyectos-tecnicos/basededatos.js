// ============================================
// TECNI-YA - BASE DE DATOS MULTICATEGORÍA
// Varillas, Planchas, Tiras, Accesorios, Otros
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
// CATEGORÍAS
// ============================================
const CATEGORIAS = [
    { id: 'varillas', nombre: 'Varillas', icono: '🔩' },
    { id: 'planchas', nombre: 'Planchas', icono: '🪟' },
    { id: 'tiras', nombre: 'Tiras', icono: '📏' },
    { id: 'accesorios', nombre: 'Accesorios', icono: '🔧' },
    { id: 'otros', nombre: 'Otros', icono: '📦' }
];

// ============================================
// COLORES PARA VARILLAS
// ============================================
const COLORES_VARILLAS = [
    { id: 'natural', nombre: 'Natural', hex: '#808080' },
    { id: 'negro', nombre: 'Negro', hex: '#1a1a1a' },
    { id: 'negro_brillante', nombre: 'Negro Brillante', hex: '#000000' },
    { id: 'blanco', nombre: 'Blanco', hex: '#F5F5F5' },
    { id: 'madera', nombre: 'Madera', hex: '#8B5E3C' }
];

// ============================================
// COLORES PARA TIRAS
// ============================================
const COLORES_TIRAS = [
    { id: 'gris', nombre: 'Gris', hex: '#808080' },
    { id: 'negro', nombre: 'Negro', hex: '#1a1a1a' }
];

// ============================================
// COLORES PARA ACCESORIOS Y OTROS
// ============================================
const COLORES_ACC_OTROS = [
    { id: 'gris', nombre: 'Gris', hex: '#808080' },
    { id: 'negro', nombre: 'Negro', hex: '#1a1a1a' },
    { id: 'blanco', nombre: 'Blanco', hex: '#F5F5F5' },
    { id: 'madera', nombre: 'Madera', hex: '#8B5E3C' }
];

// ============================================
// ESTADO
// ============================================
// datos: { varillas: [...], planchas: [...], tiras: [...], accesorios: [...], otros: [...] }
let datos = {};
let categoriaActual = 'varillas';
let filtroBusqueda = '';
let colorVarillaActual = 'natural';
let colorTiraActual = 'gris';
let colorAccOtrosActual = 'gris';

// Inicializar estructura vacía para cada categoría
CATEGORIAS.forEach(cat => {
    datos[cat.id] = [];
});


// ============================================
// FUNCIONES DE CONEXIÓN
// ============================================

function actualizarEstado(estado, mensaje) {
    const el = document.getElementById('estadoConexion');
    if (!el) return;
    el.className = 'estado-conexion ' + estado;
    el.textContent = mensaje;
}

// Cargar TODOS los datos desde Firestore (todas las categorías)
async function cargarDatos() {
    actualizarEstado('loading', '⏳ Cargando datos desde Firebase...');
    try {
        const docRef = db.collection('materiales').doc('inventario');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            // Cargar cada categoría, manteniendo vacío si no existe
            CATEGORIAS.forEach(cat => {
                datos[cat.id] = data[cat.id] || [];
            });
            actualizarEstado('online', '✅ Conectado a Firebase');
        } else {
            // Primera vez: intentar migrar datos antiguos de aluminios
            actualizarEstado('loading', '⏳ Cargando datos iniciales...');
            await migrarDatosAntiguos();
        }
    } catch (error) {
        console.error('Error:', error);
        actualizarEstado('offline', '❌ Error de conexión: ' + error.message);
    }
    renderizarItems();
}

// Migrar datos antiguos del documento 'aluminios' al nuevo formato
async function migrarDatosAntiguos() {
    try {
        // Intentar cargar datos antiguos de aluminios
        const oldRef = db.collection('materiales').doc('aluminios');
        const oldSnap = await oldRef.get();
        if (oldSnap.exists) {
            const oldData = oldSnap.data();
            if (oldData.items && oldData.items.length > 0) {
                datos['varillas'] = oldData.items;
            }
        }
        
        // También cargar desde materiales.json para poblar datos iniciales
        await cargarDatosIniciales();
        
        // Guardar en el nuevo formato
        await guardarEnFirestore(false);
        actualizarEstado('online', '✅ Datos migrados correctamente');
    } catch (e) {
        console.error('Error en migración:', e);
        await cargarDatosIniciales();
    }
}

// Cargar datos iniciales desde materiales.json (solo para varillas)
async function cargarDatosIniciales() {
    try {
        const response = await fetch('materiales.json');
        const jsonData = await response.json();
        
        // Solo poblar varillas si está vacío
        if (datos['varillas'].length === 0) {
            const perfilesMap = new Map();
            const sistemas = ['sistema', 'serie60', 'serie80'];
            
            sistemas.forEach(sis => {
                const perfiles = jsonData[sis]?.perfiles;
                if (perfiles) {
                    [...(perfiles.estandar || []), ...(perfiles.pesados || [])].forEach(p => {
                        if (p.n && p.c && !perfilesMap.has(p.c)) {
                            // Inicializar con precios por color
                            const preciosPorColor = {};
                            COLORES_VARILLAS.forEach(color => {
                                preciosPorColor[color.id] = { compra: 0, venta: 0, xmetro: 0, apk: 0 };
                            });
                            perfilesMap.set(p.c, {
                                n: p.n,
                                c: p.c,
                                precios: preciosPorColor
                            });
                        }
                    });
                }
            });
            
            datos['varillas'] = Array.from(perfilesMap.values());
        }
    } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
    }
}


// Guardar TODAS las categorías en Firestore
async function guardarEnFirestore(mostrarNotificacion = true) {
    actualizarEstado('loading', '⏳ Guardando...');
    try {
        // Construir objeto con todas las categorías
        const dataToSave = {};
        CATEGORIAS.forEach(cat => {
            dataToSave[cat.id] = datos[cat.id];
        });
        
        await db.collection('materiales').doc('inventario').set(dataToSave);
        actualizarEstado('online', '✅ Guardado en Firebase');
        if (mostrarNotificacion) {
            mostrarToast('✅ Guardado en Firebase');
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        actualizarEstado('offline', '❌ Error al guardar');
        if (mostrarNotificacion) {
            mostrarToast('❌ Error al guardar');
        }
    }
}

// ============================================
// RENDERIZADO
// ============================================

function renderizarItems() {
    const contenedor = document.getElementById('listaItems');
    if (!contenedor) return;
    
    const termino = filtroBusqueda.trim().toLowerCase();
    let todosLosItems = [];
    let hayBusqueda = termino.length > 0;
    
    if (hayBusqueda) {
        // Buscar en TODAS las categorías
        CATEGORIAS.forEach(cat => {
            (datos[cat.id] || []).forEach((item, idx) => {
                const nombre = (item.n || '').toLowerCase();
                const codigo = (item.c || '').toLowerCase();
                if (nombre.includes(termino) || codigo.includes(termino)) {
                    todosLosItems.push({
                        ...item,
                        _categoria: cat.id,
                        _categoriaNombre: cat.nombre,
                        _categoriaIcono: cat.icono,
                        _idxReal: idx
                    });
                }
            });
        });
    } else {
        // Mostrar solo la categoría actual
        (datos[categoriaActual] || []).forEach((item, idx) => {
            const cat = CATEGORIAS.find(c => c.id === categoriaActual);
            todosLosItems.push({
                ...item,
                _categoria: categoriaActual,
                _categoriaNombre: cat ? cat.nombre : '',
                _categoriaIcono: cat ? cat.icono : '',
                _idxReal: idx
            });
        });
    }
    
    if (todosLosItems.length === 0) {
        let mensaje = hayBusqueda 
            ? '🔍 No se encontraron resultados'
            : `No hay items en "${CATEGORIAS.find(c => c.id === categoriaActual)?.nombre || categoriaActual}"`;
        contenedor.innerHTML = `<div class="loading">${mensaje}</div>`;
        return;
    }
    
    // Contar total de items en todas las categorías
    let totalItems = 0;
    CATEGORIAS.forEach(cat => {
        totalItems += (datos[cat.id] || []).length;
    });
    
    let html = `<div class="resultados-info">${todosLosItems.length} de ${totalItems} items`;
    if (hayBusqueda) {
        html += ` (búsqueda global)`;
    } else {
        const cat = CATEGORIAS.find(c => c.id === categoriaActual);
        html += ` en ${cat ? cat.icono + ' ' + cat.nombre : categoriaActual}`;
    }
    html += `</div>`;
    
    todosLosItems.forEach((item, idx) => {
        const catId = item._categoria;
        const idxReal = item._idxReal;
        
        // ============================================
        // RENDERIZADO ESPECIAL PARA PLANCHAS
        // ============================================
        if (catId === 'planchas') {
            const medidas = item.medidas || { ancho: 0, alto: 0 };
            const precios = item.precios || { compra: 0, venta_plancha: 0, pie_compra: 0, pie_venta: 0, apk: 0 };
            
            const ancho = medidas.ancho || 0;
            const alto = medidas.alto || 0;
            const areaCm2 = ancho * alto;
            const pie2 = areaCm2 > 0 ? areaCm2 / 900 : 0;
            const precioCompra = precios.compra || 0;
            const pieCompraCalculado = pie2 > 0 ? precioCompra / pie2 : 0;
            const pieVentaSugerido = pieCompraCalculado + 0.7;
            const apkSugerido = pieCompraCalculado + 1.00;
            
            html += `
            <div class="item item-plancha" data-categoria="${catId}" data-index="${idxReal}">
                <div style="display:flex;align-items:center;gap:6px;flex:1 1 100%;">
                    <span class="item-categoria-tag">${item._categoriaIcono} ${item._categoriaNombre}</span>
                    <button class="btn-eliminar-item" onclick="eliminarItem('${catId}', ${idxReal})" title="Eliminar">✕</button>
                </div>
                <div class="item-nombre">
                    <input type="text" class="form-control form-control-sm" 
                        style="background:#1a1a2a;border:1px solid #444;color:#fff;font-size:0.82rem;" 
                        value="${escapeHtml(item.n || '')}" 
                        onchange="actualizarItem('${catId}', ${idxReal}, 'n', this.value)" placeholder="Nombre">
                </div>
                <div class="item-medidas item-medidas-4">
                    <div class="medida-grupo">
                        <span class="medida-label">Ancho (cm)</span>
                        <input type="number" class="medida-input sin-spinner" value="${ancho || 0}" 
                            onchange="actualizarMedidaPlancha(${idxReal}, 'ancho', parseFloat(this.value) || 0)"
                            onfocus="this.select()">
                    </div>
                    <div class="medida-grupo">
                        <span class="medida-label">Alto (cm)</span>
                        <input type="number" class="medida-input sin-spinner" value="${alto || 0}" 
                            onchange="actualizarMedidaPlancha(${idxReal}, 'alto', parseFloat(this.value) || 0)"
                            onfocus="this.select()">
                    </div>
                    <div class="medida-grupo">
                        <span class="medida-label">Pie²</span>
                        <input type="number" class="medida-input precio-auto sin-spinner" value="${pie2.toFixed(2)}" readonly 
                            title="Automático: (ancho×alto)/900 = ${areaCm2.toFixed(1)}/900 = ${pie2.toFixed(2)}">
                    </div>
                    <div class="medida-grupo">
                        <span class="medida-label">Precio Compra</span>
                        <input type="number" class="medida-input sin-spinner" value="${precioCompra || 0}" 
                            onchange="actualizarPrecioPlancha(${idxReal}, 'compra', parseFloat(this.value) || 0)"
                            onfocus="this.select()">
                    </div>
                </div>
                <div class="precios precios-plancha">
                    <div class="precio-grupo">
                        <span class="precio-label">Venta Plancha</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" class="precio-input sin-spinner" style="padding-left:16px;" value="${precios.venta_plancha || 0}" 
                                onchange="actualizarPrecioPlancha(${idxReal}, 'venta_plancha', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">Pie Compra</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00bcd4;z-index:1;">S/</span>
                            <input type="number" class="precio-input precio-auto sin-spinner" style="padding-left:16px;" value="${pieCompraCalculado.toFixed(2)}" readonly 
                                title="Automático: Precio Compra / Pie² = ${precioCompra.toFixed(2)}/${pie2.toFixed(2)} = ${pieCompraCalculado.toFixed(2)}">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">Pie Venta</span>
                        <div class="precio-con-sugerido">
                            <div style="position:relative;width:100%;">
                                <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                                <input type="number" class="precio-input sin-spinner" style="padding-left:16px;" value="${(precios.pie_venta || pieVentaSugerido).toFixed(2)}" 
                                    onchange="actualizarPrecioPlancha(${idxReal}, 'pie_venta', parseFloat(this.value) || 0)"
                                    onfocus="mostrarSugerido(this, ${pieVentaSugerido.toFixed(2)})"
                                    onblur="ocultarSugerido(this)">
                            </div>
                            <span class="sugerido-flotante" style="display:none;">💡 Sugerido: ${pieVentaSugerido.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">APK</span>
                        <div class="precio-con-sugerido">
                            <div style="position:relative;width:100%;">
                                <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                                <input type="number" class="precio-input sin-spinner" style="padding-left:16px;" value="${(precios.apk || apkSugerido).toFixed(2)}" 
                                    onchange="actualizarPrecioPlancha(${idxReal}, 'apk', parseFloat(this.value) || 0)"
                                    onfocus="mostrarSugerido(this, ${apkSugerido.toFixed(2)})"
                                    onblur="ocultarSugerido(this)">
                            </div>
                            <span class="sugerido-flotante" style="display:none;">💡 Sugerido: ${apkSugerido.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>`;
            return;
        }
        
        // ============================================
        // RENDERIZADO ESPECIAL PARA TIRAS
        // ============================================
        if (catId === 'tiras') {
            const precios = item.precios || { compra: 0, venta: 0, xmetro: 0, apk: 0 };
            const xmetro = precios.xmetro || 0;
            const apkSugeridoTira = xmetro > 0 ? xmetro + 0.20 : 0;
            
            // Obtener info del color actual de tiras
            const colorInfoTira = COLORES_TIRAS.find(c => c.id === colorTiraActual) || COLORES_TIRAS[0];
            
            html += `
            <div class="item" data-categoria="${catId}" data-index="${idxReal}" style="border-color: ${colorInfoTira.hex} !important; border-left: 4px solid ${colorInfoTira.hex} !important;">
                <div style="display:flex;align-items:center;gap:6px;flex:1 1 100%;">
                    <span class="item-categoria-tag">${item._categoriaIcono} ${item._categoriaNombre}</span>
                    <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${colorInfoTira.hex};border:1px solid #888;flex-shrink:0;" title="${colorInfoTira.nombre}"></span>
                    <span style="font-size:0.65rem;color:#aaa;flex-shrink:0;">${colorInfoTira.nombre}</span>
                    <button class="btn-eliminar-item" onclick="eliminarItem('${catId}', ${idxReal})" title="Eliminar">✕</button>
                </div>
                <div class="item-nombre">
                    <input type="text" class="form-control form-control-sm" 
                        style="background:#1a1a2a;border:1px solid #444;color:#fff;font-size:0.82rem;" 
                        value="${escapeHtml(item.n || '')}" 
                        onchange="actualizarItem('${catId}', ${idxReal}, 'n', this.value)" placeholder="Nombre">
                </div>
                <div class="item-codigo">
                    <input type="text" class="form-control form-control-sm" 
                        style="background:#1a1a2a;border:1px solid #444;color:#f1f508;font-size:0.72rem;width:80px;text-align:center;font-family:monospace;display:inline-block;" 
                        value="${escapeHtml(item.c || '')}" 
                        onchange="actualizarItem('${catId}', ${idxReal}, 'c', this.value)" placeholder="Código">
                </div>
                <div class="precios">
                    <div class="precio-grupo">
                        <span class="precio-label">Compra</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${precios.compra || 0}" 
                                onchange="actualizarPrecioTira(${idxReal}, 'compra', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">Venta</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${precios.venta || 0}" 
                                onchange="actualizarPrecioTira(${idxReal}, 'venta', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">Precio Venta</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${xmetro.toFixed(2)}" 
                                onchange="actualizarPrecioTira(${idxReal}, 'xmetro', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">APK</span>
                        <div class="precio-con-sugerido">
                            <div style="position:relative;width:100%;">
                                <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                                <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${(precios.apk || apkSugeridoTira).toFixed(2)}" 
                                    onchange="actualizarPrecioTira(${idxReal}, 'apk', parseFloat(this.value) || 0)"
                                    onfocus="mostrarSugeridoTira(this, ${apkSugeridoTira.toFixed(2)})"
                                    onblur="ocultarSugerido(this)">
                            </div>
                            <span class="sugerido-flotante" style="display:none;">💡 Sugerido: ${apkSugeridoTira.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>`;
            return;
        }
        
        // ============================================
        // RENDERIZADO ESPECIAL PARA VARILLAS (con colores)
        // ============================================
        if (catId === 'varillas') {
            // Obtener precios del color actual
            const preciosPorColor = item.precios || {};
            const colorActual = colorVarillaActual;
            const preciosColor = preciosPorColor[colorActual] || { compra: 0, venta: 0, xmetro: 0, apk: 0 };
            const xmetro = preciosColor.xmetro || 0;
            const apkSugeridoVarilla = xmetro > 0 ? xmetro + 0.20 : 0;
            
            // Obtener info del color actual
            const colorInfo = COLORES_VARILLAS.find(c => c.id === colorActual) || COLORES_VARILLAS[0];
            
            html += `
            <div class="item" data-categoria="${catId}" data-index="${idxReal}" 
                style="border-color: ${colorInfo.hex} !important; border-left: 4px solid ${colorInfo.hex} !important;">
                <div style="display:flex;align-items:center;gap:6px;flex:1 1 100%;">
                    <span class="item-categoria-tag">${item._categoriaIcono} ${item._categoriaNombre}</span>
                    <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${colorInfo.hex};border:1px solid #888;flex-shrink:0;" title="${colorInfo.nombre}"></span>
                    <span style="font-size:0.65rem;color:#aaa;flex-shrink:0;">${colorInfo.nombre}</span>
                    <button class="btn-eliminar-item" onclick="eliminarItem('${catId}', ${idxReal})" title="Eliminar">✕</button>
                </div>
                <div class="item-nombre">
                    <input type="text" class="form-control form-control-sm" 
                        style="background:#1a1a2a;border:1px solid #444;color:#fff;font-size:0.82rem;" 
                        value="${escapeHtml(item.n || '')}" 
                        onchange="actualizarItem('${catId}', ${idxReal}, 'n', this.value)" placeholder="Nombre">
                </div>
                <div class="item-codigo">
                    <input type="text" class="form-control form-control-sm" 
                        style="background:#1a1a2a;border:1px solid #444;color:#f1f508;font-size:0.72rem;width:80px;text-align:center;font-family:monospace;display:inline-block;" 
                        value="${escapeHtml(item.c || '')}" 
                        onchange="actualizarItem('${catId}', ${idxReal}, 'c', this.value)" placeholder="Código">
                </div>
                <div class="precios">
                    <div class="precio-grupo">
                        <span class="precio-label">Compra</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${preciosColor.compra || 0}" 
                                onchange="actualizarPrecioVarilla(${idxReal}, 'compra', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">Venta</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${preciosColor.venta || 0}" 
                                onchange="actualizarPrecioVarilla(${idxReal}, 'venta', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">Precio Venta</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${xmetro.toFixed(2)}" 
                                onchange="actualizarPrecioVarilla(${idxReal}, 'xmetro', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">APK</span>
                        <div class="precio-con-sugerido">
                            <div style="position:relative;width:100%;">
                                <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                                <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${(preciosColor.apk || apkSugeridoVarilla).toFixed(2)}" 
                                    onchange="actualizarPrecioVarilla(${idxReal}, 'apk', parseFloat(this.value) || 0)"
                                    onfocus="mostrarSugeridoVarilla(this, ${apkSugeridoVarilla.toFixed(2)})"
                                    onblur="ocultarSugerido(this)">
                            </div>
                            <span class="sugerido-flotante" style="display:none;">💡 Sugerido: ${apkSugeridoVarilla.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>`;
            return;
        }
        
        // ============================================
        // RENDERIZADO ESPECIAL PARA ACCESORIOS Y OTROS (como Tiras pero sin Venta)
        // ============================================
        if (catId === 'accesorios' || catId === 'otros') {
            // Obtener precios del color actual
            const preciosPorColor = item.precios || {};
            const colorActual = colorAccOtrosActual;
            const preciosColor = preciosPorColor[colorActual] || { compra: 0, xmetro: 0, apk: 0 };
            const xmetro = preciosColor.xmetro || 0;
            const apkSugerido = xmetro > 0 ? xmetro + 0.20 : 0;
            
            // Obtener info del color actual
            const colorInfo = COLORES_ACC_OTROS.find(c => c.id === colorActual) || COLORES_ACC_OTROS[0];
            
            html += `
            <div class="item" data-categoria="${catId}" data-index="${idxReal}" 
                style="border-color: ${colorInfo.hex} !important; border-left: 4px solid ${colorInfo.hex} !important;">
                <div style="display:flex;align-items:center;gap:6px;flex:1 1 100%;">
                    <span class="item-categoria-tag">${item._categoriaIcono} ${item._categoriaNombre}</span>
                    <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${colorInfo.hex};border:1px solid #888;flex-shrink:0;" title="${colorInfo.nombre}"></span>
                    <span style="font-size:0.65rem;color:#aaa;flex-shrink:0;">${colorInfo.nombre}</span>
                    <button class="btn-eliminar-item" onclick="eliminarItem('${catId}', ${idxReal})" title="Eliminar">✕</button>
                </div>
                <div class="item-nombre">
                    <input type="text" class="form-control form-control-sm" 
                        style="background:#1a1a2a;border:1px solid #444;color:#fff;font-size:0.82rem;" 
                        value="${escapeHtml(item.n || '')}" 
                        onchange="actualizarItem('${catId}', ${idxReal}, 'n', this.value)" placeholder="Nombre">
                </div>
                <div class="item-codigo">
                    <input type="text" class="form-control form-control-sm" 
                        style="background:#1a1a2a;border:1px solid #444;color:#f1f508;font-size:0.72rem;width:80px;text-align:center;font-family:monospace;display:inline-block;" 
                        value="${escapeHtml(item.c || '')}" 
                        onchange="actualizarItem('${catId}', ${idxReal}, 'c', this.value)" placeholder="Código">
                </div>
                <div class="precios">
                    <div class="precio-grupo">
                        <span class="precio-label">Compra</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${preciosColor.compra || 0}" 
                                onchange="actualizarPrecioAccOtros(${idxReal}, 'compra', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">Precio Venta</span>
                        <div style="position:relative;width:100%;">
                            <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                            <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${xmetro.toFixed(2)}" 
                                onchange="actualizarPrecioAccOtros(${idxReal}, 'xmetro', parseFloat(this.value) || 0)"
                                onfocus="this.select()">
                        </div>
                    </div>
                    <div class="precio-grupo">
                        <span class="precio-label">APK</span>
                        <div class="precio-con-sugerido">
                            <div style="position:relative;width:100%;">
                                <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:0.65rem;color:#00ff00;z-index:1;">S/</span>
                                <input type="number" step="0.01" class="precio-input sin-spinner" style="padding-left:16px;" value="${(preciosColor.apk || apkSugerido).toFixed(2)}" 
                                    onchange="actualizarPrecioAccOtros(${idxReal}, 'apk', parseFloat(this.value) || 0)"
                                    onfocus="mostrarSugeridoAccOtros(this, ${apkSugerido.toFixed(2)})"
                                    onblur="ocultarSugerido(this)">
                            </div>
                            <span class="sugerido-flotante" style="display:none;">💡 Sugerido: ${apkSugerido.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>`;
            return;
        }

    });
    
    contenedor.innerHTML = html;
}

// ============================================
// FUNCIONES
// ============================================

function cambiarCategoria(categoria) {
    categoriaActual = categoria;
    // Mostrar/ocultar selector de color según la categoría
    const colorSelector = document.getElementById('colorSelectorWrapper');
    if (colorSelector) {
        colorSelector.style.display = categoria === 'varillas' ? 'flex' : 'none';
    }
    const colorSelectorTiras = document.getElementById('colorSelectorTirasWrapper');
    if (colorSelectorTiras) {
        colorSelectorTiras.style.display = categoria === 'tiras' ? 'flex' : 'none';
    }
    const colorSelectorAccOtros = document.getElementById('colorSelectorAccOtrosWrapper');
    if (colorSelectorAccOtros) {
        colorSelectorAccOtros.style.display = (categoria === 'accesorios' || categoria === 'otros') ? 'flex' : 'none';
    }
    // Si hay búsqueda activa, mantenerla (busca en todas)
    renderizarItems();
    mostrarToast(`📂 Categoría: ${CATEGORIAS.find(c => c.id === categoria)?.nombre || categoria}`);
}

function cambiarColorVarilla(colorId) {
    colorVarillaActual = colorId;
    renderizarItems();
    const colorInfo = COLORES_VARILLAS.find(c => c.id === colorId);
    if (colorInfo) {
        mostrarToast(`🎨 Color: ${colorInfo.nombre}`);
    }
}

function cambiarColorTira(colorId) {
    colorTiraActual = colorId;
    renderizarItems();
    const colorInfo = COLORES_TIRAS.find(c => c.id === colorId);
    if (colorInfo) {
        mostrarToast(`🎨 Color: ${colorInfo.nombre}`);
    }
}

function cambiarColorAccOtros(colorId) {
    colorAccOtrosActual = colorId;
    renderizarItems();
    const colorInfo = COLORES_ACC_OTROS.find(c => c.id === colorId);
    if (colorInfo) {
        mostrarToast(`🎨 Color: ${colorInfo.nombre}`);
    }
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

function actualizarItem(categoria, index, campo, valor) {
    if (datos[categoria] && datos[categoria][index]) {
        datos[categoria][index][campo] = valor;
    }
}

function actualizarPrecio(categoria, index, campo, valor) {
    if (!datos[categoria] || !datos[categoria][index]) return;
    if (!datos[categoria][index].precios) {
        datos[categoria][index].precios = { compra: 0, venta: 0, xmetro: 0, apk: 0 };
    }
    datos[categoria][index].precios[campo] = valor;
    renderizarItems();
}

function agregarItem() {
    // Agregar al INICIO del array de la categoría actual
    if (categoriaActual === 'planchas') {
        datos[categoriaActual].unshift({
            n: 'Nueva plancha',
            medidas: { ancho: 0, alto: 0 },
            precios: { compra: 0, venta_plancha: 0, pie_compra: 0, pie_venta: 0, apk: 0 }
        });
    } else if (categoriaActual === 'tiras') {
        datos[categoriaActual].unshift({
            n: 'Nueva tira',
            c: '0000',
            precios: { compra: 0, venta: 0, xmetro: 0, apk: 0 }
        });
    } else if (categoriaActual === 'varillas') {
        // Inicializar con precios por color
        const preciosPorColor = {};
        COLORES_VARILLAS.forEach(color => {
            preciosPorColor[color.id] = { compra: 0, venta: 0, xmetro: 0, apk: 0 };
        });
        datos[categoriaActual].unshift({
            n: 'Nueva varilla',
            c: '0000',
            precios: preciosPorColor
        });
    } else if (categoriaActual === 'accesorios' || categoriaActual === 'otros') {
        // Inicializar con precios por color para accesorios y otros
        const preciosPorColor = {};
        COLORES_ACC_OTROS.forEach(color => {
            preciosPorColor[color.id] = { compra: 0, xmetro: 0, apk: 0 };
        });
        datos[categoriaActual].unshift({
            n: 'Nuevo item',
            c: '0000',
            precios: preciosPorColor
        });
    } else {
        datos[categoriaActual].unshift({
            n: 'Nuevo item',
            c: '0000',
            precios: { compra: 0, venta: 0, xmetro: 0, apk: 0 }
        });
    }
    renderizarItems();
    mostrarToast(`➕ Item agregado a ${CATEGORIAS.find(c => c.id === categoriaActual)?.nombre || categoriaActual}`);
}


function eliminarItem(categoria, index) {
    if (datos[categoria] && datos[categoria][index]) {
        const nombre = datos[categoria][index].n || 'item';
        datos[categoria].splice(index, 1);
        renderizarItems();
        mostrarToast(`🗑️ "${nombre}" eliminado`);
    }
}

async function guardarCambios() {
    await guardarEnFirestore(true);
}

function importarDatos() {
    mostrarToast('📥 Función de importar próximamente');
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
// FUNCIONES ESPECÍFICAS PARA PLANCHAS
// ============================================

function actualizarMedidaPlancha(index, campo, valor) {
    if (!datos['planchas'] || !datos['planchas'][index]) return;
    if (!datos['planchas'][index].medidas) {
        datos['planchas'][index].medidas = { ancho: 0, alto: 0 };
    }
    datos['planchas'][index].medidas[campo] = valor;
    renderizarItems();
}

function actualizarPrecioPlancha(index, campo, valor) {
    if (!datos['planchas'] || !datos['planchas'][index]) return;
    if (!datos['planchas'][index].precios) {
        datos['planchas'][index].precios = { compra: 0, pie_compra: 0, pie_venta: 0, apk: 0 };
    }
    datos['planchas'][index].precios[campo] = valor;
    // Re-renderizar para actualizar cálculos automáticos (Pie², Pie Compra, sugeridos)
    renderizarItems();
}

function mostrarSugerido(inputEl, sugerido) {
    // Mostrar el precio sugerido flotante debajo del input
    const contenedor = inputEl.closest('.precio-con-sugerido');
    if (contenedor) {
        const span = contenedor.querySelector('.sugerido-flotante');
        if (span) {
            span.textContent = '💡 Sugerido: ' + sugerido;
            span.style.display = 'block';
        }
    }
}

function ocultarSugerido(inputEl) {
    const contenedor = inputEl.closest('.precio-con-sugerido');
    if (contenedor) {
        const span = contenedor.querySelector('.sugerido-flotante');
        if (span) {
            span.style.display = 'none';
        }
    }
}

// ============================================
// FUNCIONES ESPECÍFICAS PARA TIRAS
// ============================================

function actualizarPrecioTira(index, campo, valor) {
    if (!datos['tiras'] || !datos['tiras'][index]) return;
    if (!datos['tiras'][index].precios) {
        datos['tiras'][index].precios = { compra: 0, venta: 0, xmetro: 0, apk: 0 };
    }
    datos['tiras'][index].precios[campo] = valor;
    renderizarItems();
}

function mostrarSugeridoTira(inputEl, sugerido) {
    const contenedor = inputEl.closest('.precio-con-sugerido');
    if (contenedor) {
        const span = contenedor.querySelector('.sugerido-flotante');
        if (span) {
            span.textContent = '💡 Sugerido: ' + sugerido;
            span.style.display = 'block';
        }
    }
}

// ============================================
// FUNCIONES ESPECÍFICAS PARA VARILLAS (con colores)
// ============================================

function actualizarPrecioVarilla(index, campo, valor) {
    if (!datos['varillas'] || !datos['varillas'][index]) return;
    const colorActual = colorVarillaActual;
    if (!datos['varillas'][index].precios) {
        datos['varillas'][index].precios = {};
    }
    if (!datos['varillas'][index].precios[colorActual]) {
        datos['varillas'][index].precios[colorActual] = { compra: 0, venta: 0, xmetro: 0, apk: 0 };
    }
    datos['varillas'][index].precios[colorActual][campo] = valor;
    renderizarItems();
}

// ============================================
// FUNCIONES ESPECÍFICAS PARA ACCESORIOS, OTROS
// ============================================

function actualizarPrecioAccOtros(index, campo, valor) {
    const cat = categoriaActual;
    if (!datos[cat] || !datos[cat][index]) return;
    const colorActual = colorAccOtrosActual;
    if (!datos[cat][index].precios) {
        datos[cat][index].precios = {};
    }
    if (!datos[cat][index].precios[colorActual]) {
        datos[cat][index].precios[colorActual] = { compra: 0, xmetro: 0, apk: 0 };
    }
    datos[cat][index].precios[colorActual][campo] = valor;
    renderizarItems();
}

function mostrarSugeridoAccOtros(inputEl, sugerido) {
    const contenedor = inputEl.closest('.precio-con-sugerido');
    if (contenedor) {
        const span = contenedor.querySelector('.sugerido-flotante');
        if (span) {
            span.textContent = '💡 Sugerido: ' + sugerido;
            span.style.display = 'block';
        }
    }
}

function mostrarSugeridoVarilla(inputEl, sugerido) {
    const contenedor = inputEl.closest('.precio-con-sugerido');
    if (contenedor) {
        const span = contenedor.querySelector('.sugerido-flotante');
        if (span) {
            span.textContent = '💡 Sugerido: ' + sugerido;
            span.style.display = 'block';
        }
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================


document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatos();
});
