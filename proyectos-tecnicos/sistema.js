var perfiles = {
    estandar: [
        {n: "m fija corrediza", c: "3185", p: 3.64},
        {n: "m doble corrediza", c: "3188", p: 4.45},
        {n: "puente standar", c: "5283", p: 8.26},
        {n: "puente doble corr", c: "5284", p: 10.14},
        {n: "riel inferior", c: "8413", p: 1.86},
        {n: "riel doble", c: "8444", p: 3.51},
        {n: "u-12", c: "0012", p: 2.30},
        {n: "perfil H", c: "8220", p: 5.55},
        {n: "portafelpa", c: "8116", p: 0.81},
        {n: "angulo", c: "4104", p: 0.83},
        {n: "soporte", c: "0001", p: 20.00},
        {n: "U-13", c: "0013", p: 2.50}, 
        {n: "u bajita", c: "3206", p: 2.00}
    ],
    pesados: [
        {n: "m fija corrediza", c: "3185", p: 3.64},
        {n: "m doble corrediza", c: "3188", p: 4.45},
        {n: "puente pesado", c: "5282", p: 10.54},
        {n: "puente doble corr", c: "5284", p: 10.14},
        {n: "riel inferior", c: "83132", p: 2.77},
        {n: "riel doble", c: "8445", p: 3.61},
        {n: "U baja", c: "3003", p: 2.80},
        {n: "perfil H", c: "8221", p: 6.38},
        {n: "portafelpa", c: "8115", p: 0.85},
        {n: "ángulo", c: "4103", p: 1.02},
        {n: "soporte", c: "0001", p: 20.00},
        {n: "u-alta", c: "7955", p: 3.00}, 
        {n: "u alta pesada", c: "3009", p: 3.50} 
    ]
};

var vidrios = [
    { n: "Incoloro 2 mm", p: 1.50 },
    { n: "Incoloro 4 mm", p: 3.00 },
    { n: "Incoloro 5.5 mm", p: 4.50 },
    { n: "Reflejante 6 mm", p: 8.50 },
    { n: "Catedral 4 mm", p: 5.00 }
];
var accesorios = {
    estandar: [
        {n: "Seguro F C", c: "s-s", p: 2.50},
        {n: "Seguro C C", c: "s-b", p: 1.50},
        {n: "Garruchas", c: "r-15", p: 1.05},
        {n: "Plaquitas", c: "p-q", p: 0.50}
    ],
    pesados: [
        {n: "Seguro F C", c: "s-s", p: 2.50},
        {n: "Seguro C C", c: "s-b", p: 1.50},
        {n: "Garruchas", c: "r-15", p: 1.05},
        {n: "Plaquitas", c: "p-q", p: 0.50}
    ]
};

var tiras = {
    estandar: [
        {n: "Felpa 10", c: "f-10", p: 0.50},
        {n: "Felpa 15", c: "f-15", p: 0.75}
    ],
    pesados: [
        {n: "Felpa 10", c: "f-10", p: 0.50},
        {n: "Felpa 15", c: "f-15", p: 0.75}
    ]
};

// Buscar "Incoloro 5.5 mm" en el array de vidrios para ponerlo por defecto
// Se recalcula al inicializar con los datos de configuracionCompleta
let vidrioSeleccionadoIndex = 0;
let materialSeleccionadoReq = 'estandar';

function gestionarMateriales() {
    const sw = document.getElementById('switch_materiales').checked;
    const tipo = document.getElementById('alum_estandar').checked ? 'estandar' : 'pesados';
    document.getElementById('seccion_materiales').classList.toggle('seccion-oculta', !sw);
    
    let perfilesActuales = [];
    
    if (window.configuracionCompleta && window.tipoPedidoActual) {
        const datos = window.configuracionCompleta[window.tipoPedidoActual];
        if (datos && datos.perfiles && datos.perfiles[tipo]) {
            perfilesActuales = datos.perfiles[tipo];
        }
    }
    
    // Si no hay datos del JSON, usar los internos
    if (perfilesActuales.length === 0) {
        perfilesActuales = perfiles[tipo];
    }
    
    // ========== BUSCAR PRECIOS DESDE BD SEGÚN COLOR ==========
    const colorSelect = document.getElementById('color_aluminio');
    const color = colorSelect ? colorSelect.value : '';
    let preciosBD = {};
    let errores = [];
    
    if (color) {
        try {
            const baseDatosItems = JSON.parse(localStorage.getItem('baseDatosItems') || '{}');
            const varillasColor = baseDatosItems[`varillas_${color}`] || [];
            
            perfilesActuales.forEach(p => {
                const itemBD = varillasColor.find(item => String(item.codigo) === String(p.c));
                if (itemBD && itemBD.apk !== undefined && itemBD.apk !== null && itemBD.apk > 0) {
                    preciosBD[p.c] = itemBD.apk;
                } else {
                    errores.push(`⚠️ Falta registrar código ${p.c} (${p.n}) en color ${color}`);
                }
            });
        } catch (e) {
            console.warn('Error leyendo baseDatosItems:', e.message);
        }
    }
    
    // Actualizar precios con los de BD
    perfilesActuales.forEach(p => {
        if (preciosBD[p.c] !== undefined) {
            p.p = preciosBD[p.c];
        }
    });
    
    let html = "";
    perfilesActuales.forEach((p, index) => {
        html += `<li class="list-group-item d-flex align-items-center">
            <div class="col-5 text-uppercase small"><span class="num-fila">${index + 1}. </span>${p.n}</div>
            <div class="col-3 text-center"><span class="caja-dato">${p.c}</span></div>
            <div class="col-4 text-center">
                <input type="number" step="0.01" class="caja-dato price-input" 
                data-index="${index}" value="${p.p}" oninput="actualizarPrecioManual(this)" onfocus="this.select()">
            </div>
        </li>`;
    });
    document.getElementById('tabla_precios_body').innerHTML = html;
    
    // Mostrar mensaje único si faltan códigos
    const warningDiv = document.getElementById('warning_precios_sistema');
    if (errores.length > 0) {
        console.warn('⚠️ Sistema - Perfiles faltantes en BD:', errores);
        // Extraer solo los códigos únicos
        const codigosFaltantes = errores.map(e => e.match(/código (\S+)/)?.[1]).filter(Boolean);
        const mensaje = `📋 En base de datos, registra los códigos: ${codigosFaltantes.join(', ')} en color ${color}`;
        
        if (warningDiv) {
            warningDiv.innerHTML = mensaje;
            warningDiv.style.display = 'block';
        }
    } else {
        if (warningDiv) warningDiv.style.display = 'none';
    }
}


function gestionarVidriosUI() {
    if (!window.configuracionCompleta) return;
    
    const datos = window.configuracionCompleta[window.tipoPedidoActual];
    const vidriosActuales = (datos && datos.vidrios) ? datos.vidrios : vidrios;
    const buscador = document.getElementById('buscador_vidrios_sistema');
    const tbody = document.getElementById('tabla_vidrios_body');
    
    // Mostrar el vidrio seleccionado actualmente
    if (tbody) {
        if (vidrioSeleccionadoIndex >= 0 && vidrioSeleccionadoIndex < vidriosActuales.length) {
            const v = vidriosActuales[vidrioSeleccionadoIndex];
            tbody.innerHTML = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><span class="num-fila">🪟</span> ${v.n}</span>
                    <span class="corte-medida">S/ ${v.p.toFixed(2)} / P2</span>
                </li>
            `;
            if (buscador) buscador.value = v.n;
        } else {
            tbody.innerHTML = '<li class="list-group-item text-center text-muted">Seleccione un vidrio</li>';
            if (buscador) buscador.value = '';
        }
    }
}

function buscarVidrioSistema(texto) {
    const datos = window.configuracionCompleta ? window.configuracionCompleta[window.tipoPedidoActual] : null;
    const vidriosActuales = (datos && datos.vidrios) ? datos.vidrios : vidrios;
    const listaDiv = document.getElementById('lista_vidrios_sistema');
    
    if (!texto || texto.trim() === '') {
        listaDiv.style.display = 'none';
        return;
    }
    
    const filtro = texto.toLowerCase().trim();
    const resultados = vidriosActuales
        .map((v, i) => ({ v, i }))
        .filter(item => item.v.n.toLowerCase().includes(filtro));
    
    if (resultados.length === 0) {
        listaDiv.innerHTML = '<div class="list-group-item text-muted">Sin resultados</div>';
        listaDiv.style.display = 'block';
        return;
    }
    
    listaDiv.innerHTML = resultados.map(item => 
        `<div class="list-group-item list-group-item-action" onclick="seleccionarVidrioSistema(${item.i})" style="cursor: pointer; padding: 6px 12px; font-size: 0.85rem;">
            ${item.v.n}
        </div>`
    ).join('');
    listaDiv.style.display = 'block';
}

function mostrarListaVidriosSistema() {
    const datos = window.configuracionCompleta ? window.configuracionCompleta[window.tipoPedidoActual] : null;
    const vidriosActuales = (datos && datos.vidrios) ? datos.vidrios : vidrios;
    const listaDiv = document.getElementById('lista_vidrios_sistema');
    
    if (listaDiv.style.display === 'block') {
        listaDiv.style.display = 'none';
        return;
    }
    
    listaDiv.innerHTML = vidriosActuales.map((v, i) => 
        `<div class="list-group-item list-group-item-action" onclick="seleccionarVidrioSistema(${i})" style="cursor: pointer; padding: 6px 12px; font-size: 0.85rem;">
            ${v.n}
        </div>`
    ).join('');
    listaDiv.style.display = 'block';
}

function seleccionarVidrioSistema(index) {
    const datos = window.configuracionCompleta ? window.configuracionCompleta[window.tipoPedidoActual] : null;
    const vidriosActuales = (datos && datos.vidrios) ? datos.vidrios : vidrios;
    
    if (index < 0 || index >= vidriosActuales.length) {
        vidrioSeleccionadoIndex = -1;
        const tbody = document.getElementById('tabla_vidrios_body');
        if (tbody) tbody.innerHTML = '<li class="list-group-item text-center text-muted">Seleccione un vidrio</li>';
        document.getElementById('buscador_vidrios_sistema').value = '';
        document.getElementById('lista_vidrios_sistema').style.display = 'none';
        calcularTodo();
        return;
    }
    
    vidrioSeleccionadoIndex = index;
    const v = vidriosActuales[index];
    
    document.getElementById('buscador_vidrios_sistema').value = v.n;
    document.getElementById('lista_vidrios_sistema').style.display = 'none';
    
    const tbody = document.getElementById('tabla_vidrios_body');
    if (tbody) {
        tbody.innerHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><span class="num-fila">🪟</span> ${v.n}</span>
                <span class="corte-medida">S/ ${v.p.toFixed(2)} / P2</span>
            </li>
        `;
    }
    calcularTodo();
}

function actualizarPrecioManual(input) {
    const index = parseInt(input.dataset.index);
    const tipo = document.getElementById('alum_estandar').checked ? 'estandar' : 'pesados';
    
    if (window.configuracionCompleta && window.tipoPedidoActual) {
        const datos = window.configuracionCompleta[window.tipoPedidoActual];
        if (datos && datos.perfiles && datos.perfiles[tipo] && datos.perfiles[tipo][index]) {
            datos.perfiles[tipo][index].p = parseFloat(input.value) || 0;
        }
    } else {
        perfiles[tipo][index].p = parseFloat(input.value) || 0;
    }
    calcularTodo();
}

function actualizarPrecioVidrio(input, index) {
    if (window.configuracionCompleta && window.tipoPedidoActual) {
        const datos = window.configuracionCompleta[window.tipoPedidoActual];
        if (datos && datos.vidrios && datos.vidrios[index]) {
            datos.vidrios[index].p = parseFloat(input.value) || 0;
        }
    } else {
        vidrios[index].p = parseFloat(input.value) || 0;
    }
    calcularTodo();
}
function gestionarAccesorios() {
    const sw = document.getElementById('switch_accesorios').checked;
    const tipo = document.getElementById('alum_estandar').checked ? 'estandar' : 'pesados';
    document.getElementById('seccion_accesorios').classList.toggle('seccion-oculta', !sw);
    
    let accesoriosActuales = [];
    
    if (window.configuracionCompleta && window.tipoPedidoActual) {
        const datos = window.configuracionCompleta[window.tipoPedidoActual];
        if (datos && datos.accesorios && datos.accesorios[tipo]) {
            accesoriosActuales = datos.accesorios[tipo];
        }
    }
    
    if (accesoriosActuales.length === 0) {
        accesoriosActuales = accesorios[tipo];
    }
    
    let html = "";
    accesoriosActuales.forEach((item, index) => {
        html += `<li class="list-group-item d-flex align-items-center">
            <div class="col-5 text-uppercase small"><span class="num-fila">${index + 1}. </span>${item.n}</div>
            <div class="col-3 text-center"><span class="caja-dato">${item.c}</span></div>
            <div class="col-4 text-center">
                <input type="number" step="0.01" class="caja-dato price-input" 
                data-accesorio-index="${index}" value="${item.p.toFixed(2)}" 
                oninput="actualizarPrecioAccesorio(this, ${index})" onfocus="this.select()">
            </div>
        </li>`;
    });
    document.getElementById('tabla_accesorios_body').innerHTML = html;
}

function gestionarTiras() {
    const sw = document.getElementById('switch_tiras').checked;
    const tipo = document.getElementById('alum_estandar').checked ? 'estandar' : 'pesados';
    document.getElementById('seccion_tiras').classList.toggle('seccion-oculta', !sw);
    
    let tirasActuales = [];
    
    if (window.configuracionCompleta && window.tipoPedidoActual) {
        const datos = window.configuracionCompleta[window.tipoPedidoActual];
        if (datos && datos.tiras && datos.tiras[tipo]) {
            tirasActuales = datos.tiras[tipo];
        }
    }
    
    if (tirasActuales.length === 0) {
        tirasActuales = tiras[tipo];
    }
    
    let html = "";
    tirasActuales.forEach((item, index) => {
        html += `<li class="list-group-item d-flex align-items-center">
            <div class="col-5 text-uppercase small"><span class="num-fila">${index + 1}. </span>${item.n}</div>
            <div class="col-3 text-center"><span class="caja-dato">${item.c}</span></div>
            <div class="col-4 text-center">
                <input type="number" step="0.01" class="caja-dato price-input" 
                data-tira-index="${index}" value="${item.p.toFixed(2)}" 
                oninput="actualizarPrecioTira(this, ${index})" onfocus="this.select()">
            </div>
        </li>`;
    });
    document.getElementById('tabla_tiras_body').innerHTML = html;
}

function actualizarPrecioAccesorio(input, index) {
    const tipo = document.getElementById('alum_estandar').checked ? 'estandar' : 'pesados';
    
    if (window.configuracionCompleta && window.tipoPedidoActual) {
        const datos = window.configuracionCompleta[window.tipoPedidoActual];
        if (datos && datos.accesorios && datos.accesorios[tipo] && datos.accesorios[tipo][index]) {
            datos.accesorios[tipo][index].p = parseFloat(input.value) || 0;
        }
    } else {
        accesorios[tipo][index].p = parseFloat(input.value) || 0;
    }
}

function actualizarPrecioTira(input, index) {
    const tipo = document.getElementById('alum_estandar').checked ? 'estandar' : 'pesados';
    
    if (window.configuracionCompleta && window.tipoPedidoActual) {
        const datos = window.configuracionCompleta[window.tipoPedidoActual];
        if (datos && datos.tiras && datos.tiras[tipo] && datos.tiras[tipo][index]) {
            datos.tiras[tipo][index].p = parseFloat(input.value) || 0;
        }
    } else {
        tiras[tipo][index].p = parseFloat(input.value) || 0;
    }
}
function setMaterialReq(tipo) {
    materialSeleccionadoReq = tipo;
    document.getElementById('btn_req_estandar').classList.toggle('active', tipo === 'estandar');
    document.getElementById('btn_req_pesado').classList.toggle('active', tipo === 'pesados');
    if (tipo === 'estandar') document.getElementById('alum_estandar').checked = true;
    else document.getElementById('alum_pesados').checked = true;
    gestionarMateriales();
    calcularTodo();
}

function validarInputs(i) {
    if (i.value < 0) i.value = 0;
    if (i.id === 'espesor' && i.value > 19) i.value = 19.0;
    calcularTodo();
}

function sugerirAlturaPuente(h) {
    let s = 0;
    if (h >= 30 && h < 80) s = Math.round(h - 15);
    else if (h >= 80 && h <= 120) s = Math.round(h - 20);
    else if (h > 120 && h <= 133) s = Math.round((h - 25) / 5) * 5;
    else if (h > 133 && h <= 150) s = Math.round((h - 30) / 5) * 5;
    else if (h > 150 && h <= 165) s = Math.round((h - 35) / 5) * 5;
    else if (h > 165 && h <= 180) s = Math.round((h - 40) / 5) * 5;
    else if (h > 180 && h <= 190) s = Math.round((h - 45) / 5) * 5;
    else if (h > 190 && h <= 210) s = Math.round((h - 50) / 5) * 5;

    const inp = document.getElementById('alt_puente');
    if (s > 0) {
        inp.value = s.toFixed(1);
        inp.style.color = "#00ff00";
    }
}
// Función para sugerir cantidad de fijas en el puente (modo Solo Fijos)
function sugerirCantidadFijasPuente() {
    // Tomar el ancho del campo ANCHO SOBRE VENTANA (dentro del puente)
    let anchoFinal = parseFloat(document.getElementById('ancho_sup_auto').value) || 0;
    
    // Mostrar el ancho actual en la interfaz
    const anchoSpan = document.getElementById('ancho_actual_sugerencia');
    const sugerenciaSpan = document.getElementById('sugerencia_fijos_texto');
    
    if (anchoSpan) anchoSpan.innerText = anchoFinal.toFixed(1);
    
    const inputFijosPuente = document.getElementById('fijos_solo_puente');
    
    // Si el usuario está editando actualmente, NO sobreescribir
    if (inputFijosPuente.dataset.editando === "true") {
        if (sugerenciaSpan) sugerenciaSpan.innerText = inputFijosPuente.value + " (✏️ manual)";
        return;
    }
    
    if (anchoFinal <= 0) {
        inputFijosPuente.value = 1;
        if (sugerenciaSpan) sugerenciaSpan.innerText = "1 (sin ancho)";
        calcularTodo();
        return;
    }
    
    let sugerido = 1;
    
    if (anchoFinal <= 120) {
        sugerido = 1;
    } else if (anchoFinal > 120 && anchoFinal <= 215) {
        sugerido = 2;
    } else if (anchoFinal > 215 && anchoFinal <= 360) {
        sugerido = 3;
    } else if (anchoFinal > 360 && anchoFinal <= 430) {
        sugerido = 4;
    } else {
        sugerido = Math.ceil(anchoFinal / 160);
        if (sugerido < 5) sugerido = 5;
    }
    
    while ((anchoFinal / sugerido) > 160) {
        sugerido++;
    }
    
    if (sugerido < 1) sugerido = 1;
    
    // Solo aplicar si NO está en modo edición manual
    if (!inputFijosPuente.dataset.editando) {
        inputFijosPuente.value = sugerido;
        if (sugerenciaSpan) sugerenciaSpan.innerText = sugerido + " (🤖 automático)";
    } else {
        if (sugerenciaSpan) sugerenciaSpan.innerText = inputFijosPuente.value + " (✏️ manual)";
    }
    calcularTodo();
}
function activarSugerenciaPuente() {
    const incluirPuente = document.getElementById('incluir_en_calculos').checked;
    const esModoSoloFijos = !document.getElementById('radio_corr').checked;
    
    // Si se activó INCLUIR PUENTE Y estamos en modo Solo Fijos
    if (incluirPuente && esModoSoloFijos) {
        // Pequeño delay para asegurar que el panel esté visible si se abre
        setTimeout(function() {
            sugerirCantidadFijasPuente();
        }, 100);
    }
}

function validarAlturaPuente(input) {
    let val = parseFloat(input.value) || 0;
    input.style.color = (val <= 9.9 && val > 0) ? "#ff0000" : "#00ff00";
    calcularTodo();
}

function autoHojas() {
    const aInf = parseFloat(document.getElementById('ancho_inf').value) || 0;
    const aSupAuto = parseFloat(document.getElementById('ancho_sup_auto').value) || aInf;
    
    if (aInf > 0) {
        let hV = (aInf <= 135) ? 2 : (aInf <= 185) ? 3 : (aInf <= 427) ? 4 : (aInf <= 527) ? 5 : (aInf <= 642) ? 6 : Math.ceil(aInf / 107);
        document.getElementById('cant_hojas').value = hV;
    }
    if (aSupAuto > 0) {
        let hP = (aSupAuto <= 135) ? 2 : (aSupAuto <= 185) ? 3 : (aSupAuto <= 427) ? 4 : (aSupAuto <= 527) ? 5 : (aSupAuto <= 642) ? 6 : Math.ceil(aSupAuto / 107);
        document.getElementById('hojas_puente').value = hP;
    }
    calcularFijas();
    calcularFijasPuente();
    
    // Si estamos en modo Solo Fijos, actualizar sugerencia
    if (!document.getElementById('radio_corr').checked) {
        sugerirCantidadFijasPuente();
    }
}

function calcularFijas() {
    const h = parseInt(document.getElementById('cant_hojas').value) || 1;
    if (h === 1) {
        document.getElementById('cant_fijas').value = 1;
    } else {
        document.getElementById('cant_fijas').value = (h % 2 === 0) ? h / 2 : Math.floor(h / 2) + 1;
    }
    calcularTodo();
}

function calcularFijasPuente() {
    const hojas = parseInt(document.getElementById('hojas_puente').value) || 1;
    const inputFijas = document.getElementById('fijos_puente');
    
    if (!inputFijas.dataset.editando && !inputFijas.dataset.editadoManual) {
        if (hojas === 1) {
            inputFijas.value = 1;
        } else {
            const fijasSugeridas = (hojas % 2 === 0) ? hojas / 2 : Math.floor(hojas / 2) + 1;
            inputFijas.value = fijasSugeridas;
        }
    }
    
    const fijas = parseInt(inputFijas.value) || 0;
    document.getElementById('corredizos_puente').value = Math.max(0, hojas - fijas);
    calcularTodo();
}
// Validación para Hojas P. (con color rojo)
function validarHojasPuenteInput(input) {
    let val = parseInt(input.value);
    if (isNaN(val) || input.value === "") {
        input.style.color = "#ff0000";
        return;
    }
    if (val < 2) {
        input.style.color = "#ff0000";
    } else {
        input.style.color = "#00ff00";
    }
}

function validarHojasPuenteChange(input) {
    let val = parseInt(input.value);
    if (isNaN(val) || val < 2) {
        input.value = 2;
        val = 2;
    }
    input.style.color = "#00ff00";
    
    // Resetear flags de fijos
    const inputFijas = document.getElementById('fijos_puente');
    delete inputFijas.dataset.editadoManual;
    delete inputFijas.dataset.editando;
    
    calcularFijasPuente();
    // Validar también los fijos después de cambiar hojas
    validarFijosPuenteChange(inputFijas);
}
function validarFijosPuentePrincipal(input) {
    // Si el usuario está escribiendo y el campo está vacío, permitir temporalmente
    if (input.value === "") {
        // No hacer nada, esperar a que termine de escribir
        return;
    }
    
    let val = parseInt(input.value);
    
    if (isNaN(val)) {
        return;
    }
    
    if (val < 0) {
        input.value = 0;
        val = 0;
    }
    
    // Marcar que el usuario ha editado manualmente
    input.dataset.editadoManual = "true";
    input.dataset.editando = "true";
    
    const hojas = parseInt(document.getElementById('hojas_puente').value) || 2;
    const fijas = val;
    const corredizos = Math.max(0, hojas - fijas);
    document.getElementById('corredizos_puente').value = corredizos;
    
    calcularTodo();
}
// Validación para Fijos P. (con color rojo)
function validarFijosPuenteInput(input) {
    let val = parseInt(input.value);
    const hojas = parseInt(document.getElementById('hojas_puente').value) || 2;
    const maxFijos = hojas - 1;  // Máximo es Hojas-1 (para que haya al menos 1 corrediza)
    
    if (isNaN(val) || input.value === "") {
        input.style.color = "#ff0000";
        return;
    }
    if (val < 0 || val > maxFijos) {
        input.style.color = "#ff0000";
    } else {
        input.style.color = "#00ff00";
    }
}

function validarFijosPuenteChange(input) {
    let val = parseInt(input.value);
    const hojas = parseInt(document.getElementById('hojas_puente').value) || 2;
    const maxFijos = hojas - 1;  // Máximo es Hojas-1
    
    if (isNaN(val)) {
        val = 0;
    }
    if (val < 0) {
        val = 0;
    }
    if (val > maxFijos) {
        val = maxFijos;
    }
    
    input.value = val;
    input.style.color = "#00ff00";
    input.dataset.editadoManual = "true";
    input.dataset.editando = "true";
    
    const corredizos = hojas - val;
    document.getElementById('corredizos_puente').value = Math.max(0, corredizos);
    
    calcularTodo();
}

function calcularTodo() {
    const hI = parseFloat(document.getElementById('alt_izq').value) || 0;
    const hD = parseFloat(document.getElementById('alt_der').value) || 0;
    const aI = parseFloat(document.getElementById('ancho_inf').value) || 0;
    const aSManual = parseFloat(document.getElementById('ancho_sup').value) || 0;
    const eRiel = parseFloat(document.getElementById('espesor').value) || 1.6;
    const inpP = document.getElementById('alt_puente');
    const qV = parseInt(document.getElementById('cantidad').value) || 1;

    const aS_Auto = (aSManual > 0) ? aSManual : aI;
    document.getElementById('ancho_sup_auto').value = aS_Auto.toFixed(1);

    const hRef = (hI > 0) ? hI : hD;
    const hMinPasada = inpP.dataset.hMinPasada || "0";

    if (hRef >= 30) {
        if (hRef.toString() !== hMinPasada || inpP.value === "" || inpP.value === "0") {
            sugerirAlturaPuente(hRef);
            inpP.dataset.hMinPasada = hRef.toString();
        }
    }

    const pVal = parseFloat(inpP.value) || 0;
    const hV = parseInt(document.getElementById('cant_hojas').value) || 2;
    const fV = parseInt(document.getElementById('cant_fijas').value) || 0;
    document.getElementById('cant_corr').value = Math.max(0, hV - fV);

    const hV_SP = parseInt(document.getElementById('hojas_puente').value) || 0;
    const fV_SP = parseInt(document.getElementById('fijos_puente').value) || 0;
    document.getElementById('corredizos_puente').value = Math.max(0, hV_SP - fV_SP);

    document.getElementById('sp_izq').value = (hI > 0 && pVal > 0) ? Math.max(0, hI - pVal - eRiel).toFixed(1) : "0.0";
    document.getElementById('sp_der').value = (hD > 0 && pVal > 0) ? Math.max(0, hD - pVal - eRiel).toFixed(1) : "0.0";

    renderCortes(qV, hI, hD, aI, pVal, fV, hV, aS_Auto);
    renderRequeridos();
    renderVidriosRequeridos(qV, hI, hD, aI, aS_Auto, pVal, hV, hV_SP);
    renderAccesoriosRequeridos();
    renderTirasRequeridas();
    renderResumen();
}
function refrescarResumenCompleto() {
    calcularTodo();  // Esto está bien, pero sin el bucle
}

function renderCortes(qV, hI, hD, aI, pVal, fV, hV, aS) {
    const tipo = materialSeleccionadoReq;
    const cV = parseInt(document.getElementById('cant_corr').value) || 0;
    const fV_SP = parseInt(document.getElementById('fijos_puente').value) || 0;
    const cV_SP = parseInt(document.getElementById('corredizos_puente').value) || 0;
    const hV_SP = parseInt(document.getElementById('hojas_puente').value) || 0;
    
    let html = "";
    const ordenCortes = [
        {idx: 1, sp: false}, {idx: 2, sp: false}, {idx: 3, sp: false}, {idx: 4, sp: false}, 
        {idx: 5, sp: false}, {idx: 6, sp: false}, {idx: 7, sp: false}, {idx: 8, sp: false}, 
        {idx: 9, sp: false}, {idx: 10, sp: false}, 
        {idx: 10, sp: false, especial: "ANGULOS CENTRALES"}, 
        {idx: 12, sp: false}, {idx: 13, sp: false}, 
        {idx: 1, sp: true}, {idx: 2, sp: true}, {idx: 5, sp: true}, {idx: 6, sp: true}, 
        {idx: 7, sp: true}, {idx: 8, sp: true}, {idx: 9, sp: true}, {idx: 10, sp: true},
        {idx: 10, sp: true, especial: "ANGULOS CENTRALES (S.P.)"}, 
        {idx: 11, sp: true}
    ]; 

    const spI = parseFloat(document.getElementById('sp_izq').value) || 0;
    const spD = parseFloat(document.getElementById('sp_der').value) || 0;
    const hSPMax = Math.max(spI, spD);
    
    // Determinar qué altura usar para filas 9,10,11 según si el puente está incluido
    const incluirPuenteCalc = document.getElementById('incluir_en_calculos').checked;
    const alturaPuenteVal = incluirPuenteCalc ? pVal : 0;
    const alturaParaFilas911 = (incluirPuenteCalc && alturaPuenteVal > 0) ? alturaPuenteVal : Math.max(hI, hD);

    ordenCortes.forEach((item, index) => {
        const p = perfiles[tipo][item.idx - 1];
        if (!p) return;
        
        const esSP = item.sp, hayP = pVal > 0;
        let hRef = esSP ? hSPMax : Math.max(hI, hD);
        let curF = esSP ? fV_SP : fV, curC = esSP ? cV_SP : cV, curH = esSP ? hV_SP : hV;
        let aRef = esSP ? aS : aI;
        let medida = 0, cant = (esSP && !hayP) ? 0 : qV;

        if (item.especial) {
            // Para ángulos centrales: usar altura del puente SOLO si NO es S.P.
            if (esSP) {
                // Es S.P. (sobreventana) - usar hSPMax
                medida = (hSPMax - 1.5).toFixed(1);
            } else {
                // No es S.P. - usar altura del puente si está incluido
                medida = (alturaParaFilas911 - 1.5).toFixed(1);
            }
            cant = qV * (curF * 2);
        } else if (item.idx <= 6) {
            medida = aRef.toFixed(1);
        } else if (item.idx === 12 || item.idx === 13) {
            medida = Math.max(aI, aS).toFixed(1);
            cant = qV;
        } else if (item.idx === 7) {
            medida = curH > 0 ? (Math.ceil((aRef/curH)*10)/10).toFixed(1) : 0;
            cant = qV * curF;
        } else if (item.idx === 8) {
            medida = curH > 0 ? (parseFloat((Math.ceil((aRef/curH)*10)/10).toFixed(1)) + 0.5).toFixed(1) : 0;
            cant = qV * curC;
        } else if (item.idx === 9) {
            // portafelpa: usar altura del puente SOLO si NO es S.P.
            if (esSP) {
                // Es S.P. (sobreventana) - usar hSPMax
                medida = (hSPMax - 1.8).toFixed(1);
            } else {
                // No es S.P. - usar altura del puente si está incluido
                medida = (alturaParaFilas911 - 1.8).toFixed(1);
            }
            let extras = (curF >= 1 ? 1 : 0) + (curF >= 2 ? 1 : 0) + (curF > 2 ? (curF - 2) * 2 : 0);
            cant = qV * ((curC * 2) + extras);
        } else if (item.idx === 10) {
            // ángulo: usar altura del puente SOLO si NO es S.P.
            if (esSP) {
                // Es S.P. (sobreventana) - usar hSPMax
                medida = (hSPMax - 1.5).toFixed(1);
            } else {
                // No es S.P. - usar altura del puente si está incluido
                medida = (alturaParaFilas911 - 1.5).toFixed(1);
            }
            cant = qV * 2;
        } else if (item.idx === 11) {
            medida = hRef.toFixed(1);
        }

        let nNom = item.especial || p.n;
        if (esSP && !item.especial) nNom += " (S.P.)";

        if (cant > 0 || (!esSP && hRef > 0)) {
            html += `<li class="list-group-item d-flex align-items-center" data-perfil-id="${item.idx - 1}">
                <div class="col-5 text-uppercase small"><span class="num-fila">${index + 1}. </span>${nNom}</div>
                <div class="col-3 text-center"><span class="codigo-resaltado">${p.c}</span></div>
                <div class="col-4 text-center"><span class="corte-medida">${medida}</span> x${cant}</div>
            </li>`;
        }
    });
    document.getElementById('lista_cortes_detallada').innerHTML = html;
}

function renderRequeridos() {
    const cuerpo = document.getElementById('lista_requeridos_body');
    const listaCortes = document.getElementById('lista_cortes_detallada');
    if (!cuerpo || !listaCortes) return;
    
    const tipo = materialSeleccionadoReq;
    const incluirPuente = document.getElementById('incluir_en_calculos').checked;
    const esPuenteCorredizo = document.getElementById('radio_corr').checked;
    const cantF = parseInt(document.getElementById('cant_fijas').value) || 0;
    const cantC = parseInt(document.getElementById('cant_corr').value) || 0;
    
    // Obtener espesor de soportes para condición
    const espSoportes = parseFloat(document.getElementById('esp_soportes').value) || 0;

    let filasInteres = [];
    if (incluirPuente) {
        if (cantF > 0 && cantC === 0) filasInteres = [11, 12, 3];
        else if (cantC > 0 && cantF === 0) filasInteres = [4, 6, 8, 9, 10];
        else filasInteres = [3, 5, 7, 8, 9, 10];

        if (esPuenteCorredizo) {
            const cantF_SP = parseInt(document.getElementById('fijos_puente').value) || 0;
            const cantC_SP = parseInt(document.getElementById('corredizos_puente').value) || 0;
            if (cantF_SP > 0 && cantC_SP === 0) filasInteres.push(23);
            else if (cantC_SP > 0 && cantF_SP === 0) filasInteres.push(15, 17, 19, 20, 21);
            else filasInteres.push(14, 16, 18, 19, 20, 21);
        } else {
            // MODO SOLO FIJOS - Aquí agregamos las filas 12, 21 y 23 condicional
            filasInteres.push(12);  // U-13 siempre en Solo Fijos
            filasInteres.push(22);  // ángulo siempre en Solo Fijos
            
            // Soporte (fila 23) solo si espesor > 0
            if (espSoportes > 0) {
                filasInteres.push(23);
            }
        }
    } else {
        if (cantF > 0 && cantC === 0) filasInteres = [11, 12, 13];
        else if (cantC > 0 && cantF === 0) filasInteres = [2, 6, 8, 9, 10];
        else filasInteres = [1, 5, 7, 8, 9, 10];
    }

    let htmlFinal = "";
    let granTotal = 0;

    listaCortes.querySelectorAll('li').forEach(item => {
        const numText = item.querySelector('.num-fila').innerText.replace('.', '').trim();
        const num = parseInt(numText);
        if (filasInteres.includes(num)) {
            const pId = item.dataset.perfilId;
            if (pId !== undefined && perfiles[tipo][pId]) {
                const pData = perfiles[tipo][pId]; 
                const med = parseFloat(item.querySelector('.corte-medida').innerText) || 0;
                const cant = parseInt(item.querySelector('.col-4').innerText.split('x')[1]) || 0;
                if (cant > 0 && med > 0) {
                    const costo = (med * cant / 100) * pData.p;
                    granTotal += costo;
                    // Determinar si es sobreventana (color celeste)
let esSobreventana = item.innerText.includes("(S.P.)");
// Excepción: fila 12 en modo Solo Fijos también es sobreventana
const esModoSoloFijos = incluirPuente && !esPuenteCorredizo;
if (esModoSoloFijos && num === 12) {
    esSobreventana = true;
}

const claseSP = esSobreventana ? 'fila-sp' : '';
const claseMedida = esSobreventana ? 'medida-destacada' : 'text-info';

htmlFinal += `
<li class="list-group-item d-flex align-items-center py-2 ${claseSP}">
    <div class="col-5">
        <span class="badge bg-primary me-2" style="font-size: 0.65rem;">#${num}</span>
        <div class="text-uppercase fw-bold ${esSobreventana ? 'text-info' : 'text-white'} small d-inline" style="font-size: 0.7rem;">
            ${esSobreventana ? '↳ ' : ''}${pData.n}
        </div>
        <div class="small text-muted mt-1">
            <span class="badge bg-secondary" style="font-family: monospace; font-size: 0.7rem;">Código: ${pData.c}</span>
        </div>
    </div>
    <div class="col-2 text-center fw-bold ${claseMedida}">${med} cm</div>
    <div class="col-2 text-center"><span class="badge bg-warning text-dark">x ${cant}</span></div>
    <div class="col-3 text-end text-success fw-bold">S/. ${costo.toFixed(2)}</div>
</li>`;
                }
            }
        }
    });

    if(htmlFinal) {
        htmlFinal += `<li class="list-group-item d-flex justify-content-between align-items-center mt-2 border-top border-warning bg-dark">
            <span class="text-warning fw-bold">TOTAL ALUMINIOS:</span>
            <span class="h5 text-white mb-0">S/. ${granTotal.toFixed(2)}</span>
        </li>`;
    }
    cuerpo.innerHTML = htmlFinal || `<li class="list-group-item text-center text-muted">No hay aluminios</li>`;
}

function renderVidriosRequeridos(qV, hI, hD, aI, aS, pVal, hV, hV_SP) {
    const cuerpo = document.getElementById('lista_vidrios_req_body');
    if (!cuerpo) return;

    let vData = null;
    if (window.configuracionCompleta && window.tipoPedidoActual) {
        const datos = window.configuracionCompleta[window.tipoPedidoActual];
        if (datos && datos.vidrios && datos.vidrios[vidrioSeleccionadoIndex]) {
            vData = datos.vidrios[vidrioSeleccionadoIndex];
        }
    }
    if (!vData) {
        vData = vidrios[vidrioSeleccionadoIndex];
    }
    const incluirPuente = document.getElementById('incluir_en_calculos').checked;
    const esPuenteCorredizo = document.getElementById('radio_corr').checked;
    
    // Determinar qué alturas usar para la ventana principal
    let alturaIzqPrincipal = hI;
    let alturaDerPrincipal = hD;
    if (incluirPuente && pVal > 0) {
        alturaIzqPrincipal = pVal;
        alturaDerPrincipal = pVal;
    }
    
    // Obtener valores para sobreventana
    const spI = parseFloat(document.getElementById('sp_izq').value) || 0;
    const spD = parseFloat(document.getElementById('sp_der').value) || 0;
    const espSoportes = parseFloat(document.getElementById('esp_soportes').value) || 0;
    const fijosSoloPuente = parseInt(document.getElementById('fijos_solo_puente').value) || 1;
    
    // --- VENTANA PRINCIPAL ---
    const cantF = parseInt(document.getElementById('cant_fijas').value) || 0;
    const cantC = parseInt(document.getElementById('cant_corr').value) || 0;
    const soloFijasPrincipal = (cantC === 0 && cantF > 0);
    const hayCorredizasPrincipal = (cantC > 0);
    
    // Calcular ancho base para ventana principal
    let anchoBasePrincipal = aI / hV;
    anchoBasePrincipal = Math.ceil(anchoBasePrincipal * 10) / 10;
    
    // Calcular vidrios para fijas (ventana principal)
    let vidriosFijos = [];
    if (cantF > 0) {
        const alturasFijas = calcularAlturasFijas(alturaIzqPrincipal, alturaDerPrincipal, cantF);
        for (let i = 0; i < cantF; i++) {
            let ancho = anchoBasePrincipal;
            if (soloFijasPrincipal) {
                ancho = ancho - 0.5;
            }
            const alto = alturasFijas[i] - 1.2;
            vidriosFijos.push({
                tipo: 'Fija',
                esPuente: false,
                ancho: ancho,
                alto: alto,
                cantidad: qV
            });
        }
    }
    
    // Calcular vidrios para corredizas (ventana principal)
    let vidriosCorredizas = [];
    if (cantC > 0 && hayCorredizasPrincipal) {
        const alturaCorrediza = (alturaIzqPrincipal === alturaDerPrincipal || alturaDerPrincipal === 0) ? 
            (Math.max(alturaIzqPrincipal, alturaDerPrincipal) - 3.5) : 
            (Math.min(alturaIzqPrincipal, alturaDerPrincipal) - 3.3);
        
        for (let i = 0; i < cantC; i++) {
            vidriosCorredizas.push({
                tipo: 'Corrediza',
                esPuente: false,
                ancho: anchoBasePrincipal,
                alto: alturaCorrediza,
                cantidad: qV
            });
        }
    }
    
    // --- PUENTE ---
    let vidriosPuente = [];
    if (incluirPuente && pVal > 0) {
        if (esPuenteCorredizo) {
            // Modo Corredizos + Fijos
            const fV_SP = parseInt(document.getElementById('fijos_puente').value) || 0;
            const cV_SP = parseInt(document.getElementById('corredizos_puente').value) || 0;
            const hV_SP_hojas = parseInt(document.getElementById('hojas_puente').value) || 2;
            
            let anchoBasePuente = aS / hV_SP_hojas;
            anchoBasePuente = Math.ceil(anchoBasePuente * 10) / 10;
            
            // Fijas del puente
            if (fV_SP > 0) {
                const alturasFijasPuente = calcularAlturasFijas(spI, spD, fV_SP);
                for (let i = 0; i < fV_SP; i++) {
                    let ancho = anchoBasePuente;
                    const alto = alturasFijasPuente[i] - 1.2;
                    vidriosPuente.push({
                        tipo: 'Fija Puente',
                        esPuente: true,
                        ancho: ancho,
                        alto: alto,
                        cantidad: qV
                    });
                }
            }
            
            // Corredizas del puente
            if (cV_SP > 0) {
                const alturaCorredizaPuente = (spI === spD || spD === 0) ? 
                    (Math.max(spI, spD) - 3.5) : 
                    (Math.min(spI, spD) - 3.3);
                
                for (let i = 0; i < cV_SP; i++) {
                    vidriosPuente.push({
                        tipo: 'Corrediza Puente',
                        esPuente: true,
                        ancho: anchoBasePuente,
                        alto: alturaCorredizaPuente,
                        cantidad: qV
                    });
                }
            }
        } else {
            // Modo Solo Fijos
            if (fijosSoloPuente > 0 && (spI > 0 || spD > 0)) {
                const anchoUtil = aS - espSoportes;
                const anchoPorPanel = anchoUtil / fijosSoloPuente;
                let anchoBaseSoloFijos = anchoPorPanel - 0.5;
                
                const alturasFijasPuente = calcularAlturasFijas(spI, spD, fijosSoloPuente);
                for (let i = 0; i < fijosSoloPuente; i++) {
                    const alto = alturasFijasPuente[i] - 0.9;
                    vidriosPuente.push({
                        tipo: 'Fija SP',
                        esPuente: true,
                        ancho: anchoBaseSoloFijos,
                        alto: alto,
                        cantidad: qV
                    });
                }
            }
        }
    }
    
    // --- CALCULAR COSTOS ---
    let html = '';
    let totalVidrio = 0;
    
    function redondearMultiplo5(valor) {
        return Math.ceil(valor / 5) * 5;
    }
    
    function calcularCostoVidrio(ancho, alto, cantidad, precio) {
        const anchoRedondeado = redondearMultiplo5(ancho);
        const altoRedondeado = redondearMultiplo5(alto);
        const areaP2 = (anchoRedondeado * altoRedondeado) / 900;
        return areaP2 * precio * cantidad;
    }
    
    // Procesar todos los vidrios
    const todosVidrios = [...vidriosFijos, ...vidriosCorredizas, ...vidriosPuente];
    
    // Agrupar por tipo y medida
    const grupos = new Map();
    todosVidrios.forEach(v => {
        const clave = `${v.tipo}_${v.ancho.toFixed(1)}_${v.alto.toFixed(1)}`;
        if (!grupos.has(clave)) {
            grupos.set(clave, {
                tipo: v.tipo,
                esPuente: v.esPuente,
                ancho: v.ancho,
                alto: v.alto,
                cantidad: 0
            });
        }
        const grupo = grupos.get(clave);
        grupo.cantidad += v.cantidad;
    });
    
    // Calcular costo para cada grupo
    grupos.forEach(grupo => {
        const costo = calcularCostoVidrio(grupo.ancho, grupo.alto, grupo.cantidad, vData.p);
        totalVidrio += costo;
        
        const anchoRedondeado = redondearMultiplo5(grupo.ancho);
        const altoRedondeado = redondearMultiplo5(grupo.alto);
        
        // Color diferente si es del puente
        const colorTexto = grupo.esPuente ? '#03dac6' : '#bb86fc';
        const bgColor = grupo.esPuente ? 'bg-dark' : 'bg-dark';
        
        html += `
        <li class="list-group-item d-flex align-items-center py-2 ${bgColor} text-white">
            <div class="col-4">
                <div class="fw-bold text-uppercase small" style="color: ${colorTexto};">${grupo.tipo}</div>
                <div class="small text-muted">${vData.n}</div>
            </div>
            <div class="col-4 text-center">
                <span class="text-success fw-bold">${grupo.ancho.toFixed(1)} x ${grupo.alto.toFixed(1)}</span>
                <div class="small">→ redondeado: ${anchoRedondeado} x ${altoRedondeado}</div>
                <div class="small">Cant: <span class="badge bg-secondary">${grupo.cantidad}</span></div>
            </div>
            <div class="col-4 text-end text-success fw-bold">S/. ${costo.toFixed(2)}</div>
        </li>`;
    });
    
    if (todosVidrios.length === 0) {
        html = `<li class="list-group-item text-center text-muted">No hay vidrios para calcular</li>`;
    } else {
        html += `
        <li class="list-group-item d-flex justify-content-between align-items-center mt-2 border-top border-warning" style="background: #252525;">
            <span class="text-warning fw-bold">TOTAL VIDRIOS:</span>
            <span class="h5 text-white mb-0">S/. ${totalVidrio.toFixed(2)}</span>
        </li>`;
    }
    
    cuerpo.innerHTML = html;
}

// Función auxiliar para calcular alturas de fijas según cantidad
function calcularAlturasFijas(hI, hD, cantFijas) {
    const alturas = [];
    const hMayor = Math.max(hI, hD);
    const hMenor = Math.min(hI, hD);
    const hayDosAlturas = (hI !== hD && hI > 0 && hD > 0);
    
    if (!hayDosAlturas || hMenor === 0) {
        // Una sola altura
        for (let i = 0; i < cantFijas; i++) {
            alturas.push(hMayor);
        }
    } else if (cantFijas === 1) {
        // Una fija: usar altura mayor
        alturas.push(hMayor);
    } else if (cantFijas === 2) {
        // Dos fijas: una con cada altura
        alturas.push(hI);
        alturas.push(hD);
    } else {
        // Más de 2 fijas: una con altura menor, el resto con altura mayor
        alturas.push(hMenor);
        for (let i = 1; i < cantFijas; i++) {
            alturas.push(hMayor);
        }
    }
    
    return alturas;
}

// Función auxiliar para calcular alturas de fijas según cantidad
function calcularAlturasFijas(hI, hD, cantFijas) {
    const alturas = [];
    const hMayor = Math.max(hI, hD);
    const hMenor = Math.min(hI, hD);
    const hayDosAlturas = (hI !== hD && hI > 0 && hD > 0);
    
    if (!hayDosAlturas || hMenor === 0) {
        // Una sola altura
        for (let i = 0; i < cantFijas; i++) {
            alturas.push(hMayor);
        }
    } else if (cantFijas === 1) {
        // Una fija: usar altura mayor
        alturas.push(hMayor);
    } else if (cantFijas === 2) {
        // Dos fijas: una con cada altura
        alturas.push(hI);
        alturas.push(hD);
    } else {
        // Más de 2 fijas: una con altura menor, el resto con altura mayor
        alturas.push(hMenor);
        for (let i = 1; i < cantFijas; i++) {
            alturas.push(hMayor);
        }
    }
    
    return alturas;
}

function actualizarAnchoSuperior() { 
    calcularTodo(); 
    autoHojas();
    // Si estamos en modo Solo Fijos, sugerir nuevamente
    if (!document.getElementById('radio_corr').checked) {
        sugerirCantidadFijasPuente();
    }
}
function toggleVistaPuente() { 
    const panel = document.getElementById('seccion_puente_master');
    panel.classList.toggle('seccion-oculta'); 
    gestionarSecciones();
    
    // Si el panel se está mostrando y el checkbox de incluir puente está activado
    if (!panel.classList.contains('seccion-oculta')) {
        const incluirPuente = document.getElementById('incluir_en_calculos').checked;
        const esModoSoloFijos = !document.getElementById('radio_corr').checked;
        
        if (incluirPuente && esModoSoloFijos) {
            setTimeout(function() {
                sugerirCantidadFijasPuente();
            }, 50);
        }
    }
}
function gestionarSecciones() {
    const isCorr = document.getElementById('radio_corr').checked;
    const configCorredizos = document.getElementById('config_corredizos_puente');
    const configFijos = document.getElementById('config_fijos_puente');
    
    if (isCorr) {
        // Modo Corredizos
        configCorredizos.classList.remove('seccion-oculta');
        configFijos.classList.add('seccion-oculta');
    } else {
        // Modo Solo Fijos
        configCorredizos.classList.add('seccion-oculta');
        configFijos.classList.remove('seccion-oculta');
        // Sugerir cantidad de fijas automáticamente
        sugerirCantidadFijasPuente();
    }
    calcularTodo();
}
function gestionarCortes() { document.getElementById('resultados_cortes').classList.toggle('seccion-oculta', !document.getElementById('switch_cortes').checked); calcularTodo(); }
function gestionarRequeridos() { document.getElementById('resultados_requeridos').classList.toggle('seccion-oculta', !document.getElementById('switch_req').checked); calcularTodo(); }
function gestionarVidriosReq() { document.getElementById('resultados_vidrios_req').classList.toggle('seccion-oculta', !document.getElementById('switch_vidrios_req').checked); calcularTodo(); }
function gestionarAccesoriosReq() {
    const sw = document.getElementById('switch_accesorios_req').checked;
    document.getElementById('resultados_accesorios_req').classList.toggle('seccion-oculta', !sw);
    if (sw) {
        renderAccesoriosRequeridos();
    }
}

function gestionarTirasReq() {
    const sw = document.getElementById('switch_tiras_req').checked;
    document.getElementById('resultados_tiras_req').classList.toggle('seccion-oculta', !sw);
    if (sw) {
        renderTirasRequeridas();
    }
}
function renderAccesoriosRequeridos() {
    const cuerpo = document.getElementById('lista_accesorios_req_body');
    if (!cuerpo) return;
    
    const tipo = materialSeleccionadoReq;
    const qV = parseInt(document.getElementById('cantidad').value) || 1;
    const incluirPuente = document.getElementById('incluir_en_calculos').checked;
    const esPuenteCorredizo = document.getElementById('radio_corr').checked;
    
    // ========== VENTANA PRINCIPAL ==========
    const hojas = parseInt(document.getElementById('cant_hojas').value) || 2;
    const fijas = parseInt(document.getElementById('cant_fijas').value) || 0;
    const corredizas = parseInt(document.getElementById('cant_corr').value) || 0;
    
    // Verificar si el usuario modificó los valores
    const hojasRecomendadas = parseInt(document.getElementById('cant_hojas').defaultValue) || 2;
    const esModificado = (hojas !== hojasRecomendadas);
    
    let seguroFC_principal = 0;
    let seguroCC_principal = 0;
    let garruchas_principal = 0;
    let plaquitas_principal = 0;
    
    // Casos especiales para 4 hojas o menos y modificado
    if ((esModificado && hojas <= 4) || (hojas === 2 && fijas === 0 && corredizas === 2)) {
        if (hojas === 2 && fijas === 0 && corredizas === 2) {
            seguroFC_principal = 0;
            seguroCC_principal = 1;
        }
        else if (hojas === 3 && fijas === 1 && corredizas === 2) {
            seguroFC_principal = 1;
            seguroCC_principal = 1;
        }
        else if (hojas === 3 && fijas === 0 && corredizas === 3) {
            seguroFC_principal = 1;
            seguroCC_principal = 2;
        }
        else if (hojas === 4 && fijas === 0 && corredizas === 4) {
            seguroFC_principal = 2;
            seguroCC_principal = 2;
        }
        else if (hojas === 4 && fijas === 1 && corredizas === 3) {
            seguroFC_principal = 1;
            seguroCC_principal = 2;
        }
        else {
            seguroFC_principal = corredizas;
            seguroCC_principal = 0;
        }
    } else {
        seguroFC_principal = corredizas;
        seguroCC_principal = 0;
    }
    
    garruchas_principal = corredizas * 2;
    plaquitas_principal = seguroFC_principal;
    
    // ========== PUENTE (solo en modo Corredizos + Fijos) ==========
    let seguroFC_puente = 0;
    let seguroCC_puente = 0;
    let garruchas_puente = 0;
    let plaquitas_puente = 0;
    
    if (incluirPuente && esPuenteCorredizo) {
        const hojasPuente = parseInt(document.getElementById('hojas_puente').value) || 2;
        const fijasPuente = parseInt(document.getElementById('fijos_puente').value) || 0;
        const corredizasPuente = parseInt(document.getElementById('corredizos_puente').value) || 0;
        
        // Verificar si el usuario modificó en el puente
        const hojasPuenteRecomendadas = parseInt(document.getElementById('hojas_puente').defaultValue) || 2;
        const esModificadoPuente = (hojasPuente !== hojasPuenteRecomendadas);
        
        if ((esModificadoPuente && hojasPuente <= 4) || (hojasPuente === 2 && fijasPuente === 0 && corredizasPuente === 2)) {
            if (hojasPuente === 2 && fijasPuente === 0 && corredizasPuente === 2) {
                seguroFC_puente = 0;
                seguroCC_puente = 1;
            }
            else if (hojasPuente === 3 && fijasPuente === 1 && corredizasPuente === 2) {
                seguroFC_puente = 1;
                seguroCC_puente = 1;
            }
            else if (hojasPuente === 3 && fijasPuente === 0 && corredizasPuente === 3) {
                seguroFC_puente = 1;
                seguroCC_puente = 2;
            }
            else if (hojasPuente === 4 && fijasPuente === 0 && corredizasPuente === 4) {
                seguroFC_puente = 2;
                seguroCC_puente = 2;
            }
            else if (hojasPuente === 4 && fijasPuente === 1 && corredizasPuente === 3) {
                seguroFC_puente = 1;
                seguroCC_puente = 2;
            }
            else {
                seguroFC_puente = corredizasPuente;
                seguroCC_puente = 0;
            }
        } else {
            seguroFC_puente = corredizasPuente;
            seguroCC_puente = 0;
        }
        
        garruchas_puente = corredizasPuente * 2;
        plaquitas_puente = seguroFC_puente;
    }
    
    // ========== SUMAR TOTALES ==========
    let seguroFC = (seguroFC_principal + seguroFC_puente) * qV;
    let seguroCC = (seguroCC_principal + seguroCC_puente) * qV;
    let garruchas = (garruchas_principal + garruchas_puente) * qV;
    let plaquitas = (plaquitas_principal + plaquitas_puente) * qV;
    
    const accs = accesorios[tipo];
    let html = '';
    let totalAccesorios = 0;
    
    // Seguro F C
    if (seguroFC > 0) {
        const costo = seguroFC * accs[0].p;
        totalAccesorios += costo;
        html += `<li class="list-group-item d-flex align-items-center py-2 bg-dark text-white">
            <div class="col-5">${accs[0].n}</div>
            <div class="col-3 text-center"><span class="badge bg-secondary" style="font-family: monospace;">${accs[0].c}</span></div>
            <div class="col-2 text-center"><span class="badge bg-warning text-dark">${seguroFC}</span></div>
            <div class="col-2 text-end text-success fw-bold">S/. ${costo.toFixed(2)}</div>
        </li>`;
    }
    
    // Seguro C C
    if (seguroCC > 0) {
        const costo = seguroCC * accs[1].p;
        totalAccesorios += costo;
        html += `<li class="list-group-item d-flex align-items-center py-2 bg-dark text-white">
            <div class="col-5">${accs[1].n}</div>
            <div class="col-3 text-center"><span class="badge bg-secondary" style="font-family: monospace;">${accs[1].c}</span></div>
            <div class="col-2 text-center"><span class="badge bg-warning text-dark">${seguroCC}</span></div>
            <div class="col-2 text-end text-success fw-bold">S/. ${costo.toFixed(2)}</div>
        </li>`;
    }
    
    // Garruchas
    if (garruchas > 0) {
        const costo = garruchas * accs[2].p;
        totalAccesorios += costo;
        html += `<li class="list-group-item d-flex align-items-center py-2 bg-dark text-white">
            <div class="col-5">${accs[2].n}</div>
            <div class="col-3 text-center"><span class="badge bg-secondary" style="font-family: monospace;">${accs[2].c}</span></div>
            <div class="col-2 text-center"><span class="badge bg-warning text-dark">${garruchas}</span></div>
            <div class="col-2 text-end text-success fw-bold">S/. ${costo.toFixed(2)}</div>
        </li>`;
    }
    
    // Plaquitas
    if (plaquitas > 0) {
        const costo = plaquitas * accs[3].p;
        totalAccesorios += costo;
        html += `<li class="list-group-item d-flex align-items-center py-2 bg-dark text-white">
            <div class="col-5">${accs[3].n}</div>
            <div class="col-3 text-center"><span class="badge bg-secondary" style="font-family: monospace;">${accs[3].c}</span></div>
            <div class="col-2 text-center"><span class="badge bg-warning text-dark">${plaquitas}</span></div>
            <div class="col-2 text-end text-success fw-bold">S/. ${costo.toFixed(2)}</div>
        </li>`;
    }
    
    if (html === '') {
        html = `<li class="list-group-item text-center text-muted">No hay accesorios para calcular</li>`;
    } else {
        html += `<li class="list-group-item d-flex justify-content-between align-items-center mt-2 border-top border-warning" style="background: #252525;">
            <span class="text-warning fw-bold">TOTAL ACCESORIOS:</span>
            <span class="h5 text-white mb-0">S/. ${totalAccesorios.toFixed(2)}</span>
        </li>`;
    }
    
    cuerpo.innerHTML = html;
}
function renderTirasRequeridas() {
    const cuerpo = document.getElementById('lista_tiras_req_body');
    if (!cuerpo) return;
    
    const tipo = materialSeleccionadoReq;
    const qV = parseInt(document.getElementById('cantidad').value) || 1;
    
    // Obtener la lista de ALUMINIOS REQUERIDOS
    const listaRequeridos = document.getElementById('lista_requeridos_body');
    if (!listaRequeridos) return;
    
    let totalFelpa10 = 0;
    let totalFelpa15 = 0;
    
    // Recorrer cada perfil en ALUMINIOS REQUERIDOS
    listaRequeridos.querySelectorAll('li').forEach(item => {
        // Saltar el ítem de total (tiene border-top)
        if (item.classList.contains('border-top')) return;
        
        const texto = item.innerText.toLowerCase();
        
        // Extraer la medida (primer número con "cm")
        const medidaMatch = texto.match(/(\d+(?:\.\d+)?)\s*cm/);
        if (!medidaMatch) return;
        const medida = parseFloat(medidaMatch[1]);
        
        // Extraer la cantidad (después de "x")
        const cantMatch = texto.match(/x\s*(\d+)/);
        if (!cantMatch) return;
        const cantidadPerfil = parseInt(cantMatch[1]);
        
        // Determinar si el perfil lleva felpa y con qué factor
        let factor = 0;
        let llevaFelpa10 = false;
        let llevaFelpa15 = false;
        
        // Portafelpa
        if (texto.includes('portafelpa')) {
            llevaFelpa15 = true;
            factor = 1;
        }
        // M fija corrediza
        else if (texto.includes('m fija corrediza')) {
            llevaFelpa10 = true;
            llevaFelpa15 = true;
            factor = 1;
        }
        // M doble corrediza
        else if (texto.includes('m doble corrediza')) {
            llevaFelpa10 = true;
            llevaFelpa15 = true;
            factor = 2;
        }
        // Puente standar o puente pesado
        else if (texto.includes('puente standar') || texto.includes('puente pesado')) {
            llevaFelpa10 = true;
            llevaFelpa15 = true;
            factor = 1;
        }
        // Puente doble
        else if (texto.includes('puente doble')) {
            llevaFelpa10 = true;
            llevaFelpa15 = true;
            factor = 2;
        }
        
        // Calcular metros totales para este perfil
        const metrosTotales = (medida * cantidadPerfil * qV * factor) / 100;
        
        if (llevaFelpa10) {
            totalFelpa10 += metrosTotales;
        }
        if (llevaFelpa15) {
            totalFelpa15 += metrosTotales;
        }
    });
    
    const tirs = tiras[tipo];
    let html = '';
    let totalTiras = 0;
    
    // Felpa 10
    if (totalFelpa10 > 0) {
        const costo = totalFelpa10 * tirs[0].p;
        totalTiras += costo;
        html += `<li class="list-group-item d-flex align-items-center py-2 bg-dark text-white">
            <div class="col-5">${tirs[0].n}</div>
            <div class="col-3 text-center"><span class="badge bg-secondary" style="font-family: monospace;">${tirs[0].c}</span></div>
            <div class="col-2 text-center"><span class="badge bg-warning text-dark">${totalFelpa10.toFixed(2)} m</span></div>
            <div class="col-2 text-end text-success fw-bold">S/. ${costo.toFixed(2)}</div>
        </li>`;
    }
    
    // Felpa 15
    if (totalFelpa15 > 0) {
        const costo = totalFelpa15 * tirs[1].p;
        totalTiras += costo;
        html += `<li class="list-group-item d-flex align-items-center py-2 bg-dark text-white">
            <div class="col-5">${tirs[1].n}</div>
            <div class="col-3 text-center"><span class="badge bg-secondary" style="font-family: monospace;">${tirs[1].c}</span></div>
            <div class="col-2 text-center"><span class="badge bg-warning text-dark">${totalFelpa15.toFixed(2)} m</span></div>
            <div class="col-2 text-end text-success fw-bold">S/. ${costo.toFixed(2)}</div>
        </li>`;
    }
    
    if (html === '') {
        html = `<li class="list-group-item text-center text-muted">No hay tiras para calcular</li>`;
    } else {
        html += `<li class="list-group-item d-flex justify-content-between align-items-center mt-2 border-top border-warning" style="background: #252525;">
            <span class="text-warning fw-bold">TOTAL TIRAS:</span>
            <span class="h5 text-white mb-0">S/. ${totalTiras.toFixed(2)}</span>
        </li>`;
    }
    
    cuerpo.innerHTML = html;
}
function reiniciarTodo() { if(confirm("¿Reiniciar?")) location.reload(); }

// ... (código anterior de gestionarVidriosReq y reiniciarTodo)

// BUSCA ESTA PARTE Y REEMPLÁZALA:
function validarHojas(input) {
    let val = parseInt(input.value);
    if (isNaN(val) || val < 1) {
        input.value = 1;
    } else {
        input.value = val;
    }
    calcularTodo();
}
function gestionarResumen() {
    const sw = document.getElementById('switch_resumen').checked;
    const div = document.getElementById('resultados_resumen');
    if (div) {
        div.classList.toggle('seccion-oculta', !sw);
        if (sw) {
            renderResumen();
        }
    }
}

function renderResumen() {
    const contenedor = document.getElementById('contenedor_resumen');
    if (!contenedor) return;
    
    let texto = '';
    let totalGeneral = 0;
    
    // ========== CLIENTE / PEDIDO ==========
    const nombre = document.getElementById('nombre_ventana')?.value || '1';
    const colorSelect = document.getElementById('color_aluminio');
    const color = colorSelect?.options[colorSelect.selectedIndex]?.text || 'Blanco';
    const pedidoSelect = document.getElementById('pedido');
    let pedidoTexto = '';
    if (pedidoSelect) {
        const selectedOption = pedidoSelect.options[pedidoSelect.selectedIndex];
        pedidoTexto = selectedOption ? selectedOption.text : 'Ventanas Sistema';
    }
    const cantidadVentanas = document.getElementById('cantidad')?.value || '1';
    
    const hojas = document.getElementById('cant_hojas')?.value || '2';
    const fijas = document.getElementById('cant_fijas')?.value || '1';
    const corredizas = parseInt(hojas) - parseInt(fijas);
    let modelo = '';
    if (parseInt(fijas) > 0 && corredizas > 0) modelo = `${fijas}F + ${corredizas}C`;
    else if (parseInt(fijas) > 0) modelo = `${fijas}F`;
    else if (corredizas > 0) modelo = `${corredizas}C`;
    else modelo = `${hojas}H`;
    
    texto += 'RESUMEN DE PRODUCCIÓN\n\n';
    
    texto += `Cliente/Nombre: ${nombre}\n`;
    texto += `Color: ${color}\n`;
    texto += `Pedido: ${pedidoTexto}\n`;
    texto += `Modelo: ${modelo}\n`;
    texto += `Cantidad: ${cantidadVentanas} und\n\n`;
    
    // ========== ALUMINIOS ==========
const listaAluminios = document.getElementById('lista_requeridos_body');
if (listaAluminios) {
    let aluminiosPrincipal = '';
    let aluminiosPuente = '';
    let totalPrincipal = 0;
    let totalPuente = 0;
    
    listaAluminios.querySelectorAll('li').forEach(item => {
        // Saltar el total general y bordes
        if (item.classList.contains('border-top')) return;
        if (item.innerText.includes('TOTAL ALUMINIOS')) return;
        
        // Detectar si es sobreventana por la clase CSS
        const esSobreventana = item.classList.contains('fila-sp');
        
        // Extraer código (badge bg-secondary)
        const codigoSpan = item.querySelector('.badge.bg-secondary');
        let codigo = codigoSpan ? codigoSpan.innerText.replace('Código:', '').trim() : '';
        
        // Extraer medida (está en la clase medida-destacada o text-info)
        let medidaSpan = item.querySelector('.medida-destacada');
        if (!medidaSpan) medidaSpan = item.querySelector('.text-info.fw-bold');
        let medida = medidaSpan ? medidaSpan.innerText.trim() : '';
        const medidaSinCm = medida.replace(' cm', '');
        
        // Extraer cantidad
        const cantSpan = item.querySelector('.badge.bg-warning');
        let cantidad = cantSpan ? cantSpan.innerText.replace('x', '').trim() : '1';
        
        // Extraer subtotal
        const totalSpan = item.querySelector('.text-success.fw-bold');
        let subtotal = 0;
        if (totalSpan) {
            subtotal = parseFloat(totalSpan.innerText.replace('S/.', '').trim());
        }
        
        if (codigo && subtotal > 0 && medidaSinCm && medidaSinCm !== '0') {
            const linea = `${codigo.padEnd(8)} ${medidaSinCm.padEnd(8)} =${cantidad.padEnd(4)} S/. ${subtotal.toFixed(2)}`;
            
            if (esSobreventana) {
                totalPuente += subtotal;
                aluminiosPuente += linea + '\n';
            } else {
                totalPrincipal += subtotal;
                aluminiosPrincipal += linea + '\n';
            }
            totalGeneral += subtotal;
        }
    });
    
    if (aluminiosPrincipal) {
        texto += '--- ALUMINIOS (VENTANA PRINCIPAL) ---\n';
        texto += aluminiosPrincipal + '\n';
    }
    
    if (aluminiosPuente) {
        texto += '--- ALUMINIOS (SOBREVENTANA) ---\n';
        texto += aluminiosPuente + '\n';
    }
}
    
    // ========== VIDRIOS ==========
    const listaVidrios = document.getElementById('lista_vidrios_req_body');
    if (listaVidrios) {
        let vidriosTexto = '';
        let totalVidrios = 0;
        
        listaVidrios.querySelectorAll('li').forEach(item => {
            if (item.classList.contains('border-top')) return;
            
            const tipoDiv = item.querySelector('.fw-bold.text-uppercase');
            const tipo = tipoDiv ? tipoDiv.innerText.trim() : '';
            
            const vidrioSpan = item.querySelector('.small.text-muted');
            let vidrio = vidrioSpan ? vidrioSpan.innerText.trim() : '';
            if (vidrio.length > 20) vidrio = vidrio.substring(0, 18) + '..';
            
            const medidaSpan = item.querySelector('.text-success.fw-bold');
            let medida = medidaSpan ? medidaSpan.innerText.trim() : '';
            
            const cantSpan = item.querySelector('.badge.bg-secondary');
            let cantidad = cantSpan ? cantSpan.innerText.replace('Cant:', '').trim() : '1';
            
            const totalSpan = item.querySelector('.col-4.text-end.text-success.fw-bold');
            let subtotal = 0;
            if (totalSpan) {
                subtotal = parseFloat(totalSpan.innerText.replace('S/.', '').trim());
            }
            
            if (subtotal > 0) {
                totalVidrios += subtotal;
                // Convertir tipo a abreviatura
let tipoAbrev = tipo;
if (tipo === 'Fija') tipoAbrev = 'F';
else if (tipo === 'Corrediza') tipoAbrev = 'C';
else if (tipo === 'Fija Puente') tipoAbrev = 'F/SP';
else if (tipo === 'Corrediza Puente') tipoAbrev = 'C/SP';
else if (tipo === 'Fija SP') tipoAbrev = 'F/SP';

const tipoMedida = `${tipoAbrev}- ${medida} =${cantidad}`;
const linea = `${vidrio.padEnd(20)} ${tipoMedida.padEnd(20)} S/. ${subtotal.toFixed(2)}`;
                vidriosTexto += linea + '\n';
            }
        });
        
        if (vidriosTexto) {
            texto += '--- VIDRIOS ---\n';
            texto += vidriosTexto + '\n';
            totalGeneral += totalVidrios;
        }
    }
    
    // ========== ACCESORIOS ==========
    const listaAccesorios = document.getElementById('lista_accesorios_req_body');
    if (listaAccesorios) {
        let accesoriosTexto = '';
        let totalAccesorios = 0;
        
        listaAccesorios.querySelectorAll('li').forEach(item => {
            if (item.classList.contains('border-top')) return;
            
            const nombreDiv = item.querySelector('.col-5');
            const nombre = nombreDiv ? nombreDiv.innerText.trim() : '';
            
            const codigoSpan = item.querySelector('.col-3 .badge');
            const codigo = codigoSpan ? codigoSpan.innerText.trim() : '';
            
            const cantSpan = item.querySelector('.col-2 .badge');
            let cantidad = cantSpan ? cantSpan.innerText.trim() : '1';
            
            const totalSpan = item.querySelector('.col-2.text-end.text-success.fw-bold');
            let subtotal = 0;
            if (totalSpan) {
                subtotal = parseFloat(totalSpan.innerText.replace('S/.', '').trim());
            }
            
            if (nombre && subtotal > 0) {
                totalAccesorios += subtotal;
                const linea = `${nombre.padEnd(18)} =${cantidad.padEnd(6)} S/. ${subtotal.toFixed(2)}`;
                accesoriosTexto += linea + '\n';
            }
        });
        
        if (accesoriosTexto) {
            texto += '--- ACCESORIOS ---\n';
            texto += accesoriosTexto + '\n';
            totalGeneral += totalAccesorios;
        }
    }
    
    // ========== TIRAS ==========
    const listaTiras = document.getElementById('lista_tiras_req_body');
    if (listaTiras) {
        let tirasTexto = '';
        let totalTiras = 0;
        
        listaTiras.querySelectorAll('li').forEach(item => {
            if (item.classList.contains('border-top')) return;
            
            const nombreDiv = item.querySelector('.col-5');
            const nombre = nombreDiv ? nombreDiv.innerText.trim() : '';
            
            const codigoSpan = item.querySelector('.col-3 .badge');
            const codigo = codigoSpan ? codigoSpan.innerText.trim() : '';
            
            const metrosSpan = item.querySelector('.col-2 .badge');
            let metros = metrosSpan ? metrosSpan.innerText.trim().replace('m', '').trim() : '0';
            
            const totalSpan = item.querySelector('.col-2.text-end.text-success.fw-bold');
            let subtotal = 0;
            if (totalSpan) {
                subtotal = parseFloat(totalSpan.innerText.replace('S/.', '').trim());
            }
            
            if (nombre && subtotal > 0) {
                totalTiras += subtotal;
                const linea = `${nombre.padEnd(18)} ${metros.padEnd(8)} m  S/. ${subtotal.toFixed(2)}`;
                tirasTexto += linea + '\n';
            }
        });
        
        if (tirasTexto) {
            texto += '--- TIRAS ---\n';
            texto += tirasTexto + '\n';
            totalGeneral += totalTiras;
        }
    }
    
    // ========== TOTAL GENERAL ==========
texto += `\nTOTAL GENERAL: S/. ${totalGeneral.toFixed(2)}\n`;
    
    contenedor.innerHTML = texto;
}

function imprimirResumen() {
    const contenido = document.getElementById('contenedor_resumen')?.innerText;
    if (!contenido) {
        alert('No hay datos para imprimir');
        return;
    }
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resumen de Producción</title>
            <style>
                body { 
                    font-family: monospace; 
                    font-size: 12px; 
                    margin: 20px; 
                    background-color: white;
                    color: black;
                }
                pre { 
                    white-space: pre-wrap; 
                    font-family: monospace;
                }
            </style>
        </head>
        <body>
            <pre>${contenido}</pre>
            <script>
                window.print();
            <\/script>
        </body>
        </html>
    `);
    ventana.document.close();
}
function refrescarResumenCompleto() {
    // Primero recalcular todos los materiales con la cantidad actual
    calcularTodo();
    
    // Luego mostrar el resumen actualizado
    renderResumen();
}

function inicializarSistema(configuracion) {
    window.configuracionCompleta = configuracion;
    window.tipoPedidoActual = 'sistema';
    
    // Calcular vidrioSeleccionadoIndex basado en los vidrios de configuracionCompleta
    const datos = window.configuracionCompleta ? window.configuracionCompleta[window.tipoPedidoActual] : null;
    const vidriosActuales = (datos && datos.vidrios) ? datos.vidrios : vidrios;
    const idx = vidriosActuales.findIndex(v => v.n.toLowerCase().includes("5.5"));
    vidrioSeleccionadoIndex = idx >= 0 ? idx : 0;
    
    // Inicializar todo (igual que en tu cargarConfiguracion)
    gestionarMateriales();
    gestionarVidriosUI();
    gestionarAccesorios();
    gestionarTiras();
    gestionarSecciones();
    calcularTodo();
}

// Exportar funciones globalmente para que el HTML pueda llamarlas
window.buscarVidrioSistema = buscarVidrioSistema;
window.mostrarListaVidriosSistema = mostrarListaVidriosSistema;
window.seleccionarVidrioSistema = seleccionarVidrioSistema;
