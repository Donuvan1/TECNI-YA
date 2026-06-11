function inicializarSerie80(configuracion) {
    console.log('Serie 80 cargada - Validaciones Parte 1');
    
    // ========== REFERENCIAS A ELEMENTOS ==========
    const anchoInf = document.getElementById('ancho_inf_s80');
    const anchoSup = document.getElementById('ancho_sup_s80');
    const altIzq = document.getElementById('alt_izq_s80');
    const altDer = document.getElementById('alt_der_s80');
    const hojasInput = document.getElementById('cant_hojas_s80');
    const fijasInput = document.getElementById('cant_fijas_s80');
    const corrOutput = document.getElementById('cant_corr_s80');
    const anchoSupAuto = document.getElementById('ancho_sup_auto_s80');

        // ========== FUNCIÓN PARA CALCULAR ANCHOS DE HOJAS ==========
    function calcularAnchosHojas(anchoTotal, hojas, fijas) {
        // Para 1 hoja
        if (hojas === 1) {
            let ancho = anchoTotal - 0.4;
            ancho = Math.ceil(ancho * 10) / 10;
            return { corrediza: ancho, fija: ancho };
        }
        
        // Para 2 hojas (CC o FC)
        if (hojas === 2) {
            let ancho = (anchoTotal / 2) + 1.5;
            ancho = Math.ceil(ancho * 10) / 10;
            return { corrediza: ancho, fija: ancho };
        }
        
        // Para 3 hojas
        if (hojas === 3) {
            if (fijas === 1) { // FCC
                let corrediza = (anchoTotal + 9.5) / 3;
                corrediza = Math.ceil(corrediza * 10) / 10;
                let fija = corrediza + 4;
                fija = Math.ceil(fija * 10) / 10;
                return { corrediza: corrediza, fija: fija };
            } else { // CCC (fijas === 0)
                let corrediza = (anchoTotal + 11) / 3;
                corrediza = Math.ceil(corrediza * 10) / 10;
                return { corrediza: corrediza, fija: corrediza };
            }
        }
        
        // Para 4 hojas
        if (hojas === 4) {
            if (fijas === 2) { // FCCF
                let ancho = (anchoTotal + 10.7) / 4;
                ancho = Math.ceil(ancho * 10) / 10;
                return { corrediza: ancho, fija: ancho };
            } else if (fijas === 1) { // FCCC
                let corrediza = (anchoTotal + 17.6) / 4;
                corrediza = Math.ceil(corrediza * 10) / 10;
                let fija = corrediza + 4;
                fija = Math.ceil(fija * 10) / 10;
                return { corrediza: corrediza, fija: fija };
            } else { // CCCC (fijas === 0)
                let ancho = (anchoTotal + 10.7) / 4;
                ancho = Math.ceil(ancho * 10) / 10;
                return { corrediza: ancho, fija: ancho };
            }
        }
        
        // Para 6 hojas
        if (hojas === 6) {
            if (fijas === 2) { // FCCCCF
                let corrediza = (anchoTotal + 24.2) / 6;
                corrediza = Math.ceil(corrediza * 10) / 10;
                let fija = corrediza + 4;
                fija = Math.ceil(fija * 10) / 10;
                return { corrediza: corrediza, fija: fija };
            } else { // CCCCCC (fijas === 0)
                let corrediza = (anchoTotal + 27.2) / 6;
                corrediza = Math.ceil(corrediza * 10) / 10;
                return { corrediza: corrediza, fija: corrediza };
            }
        }
        
        // Para 8 hojas (fórmula por definir, por ahora igual para todas)
        if (hojas === 8) {
            let ancho = (anchoTotal / hojas) + 1.5;
            ancho = Math.ceil(ancho * 10) / 10;
            return { corrediza: ancho, fija: ancho };
        }
        
        // Default
        let ancho = (anchoTotal / hojas) + 1.5;
        ancho = Math.ceil(ancho * 10) / 10;
        return { corrediza: ancho, fija: ancho };
    }
    
    // Elementos del puente
    const incluirPuenteCheck = document.getElementById('incluir_en_calculos_s80');
    const altPuente = document.getElementById('alt_puente_s80');
    const spIzq = document.getElementById('sp_izq_s80');
    const spDer = document.getElementById('sp_der_s80');
    const espesor = document.getElementById('espesor_s80');
    const hojasPuente = document.getElementById('hojas_puente_s80');
    const fijosPuente = document.getElementById('fijos_puente_s80');
    const corrPuente = document.getElementById('corredizos_puente_s80');

        // ========== FUNCIONES PARA CARGAR COSTOS ==========
    
    function cargarCostosAluminios() {
        if (!configuracionCompleta) return;
        
        const perfiles = configuracionCompleta.serie80?.perfiles || [];
        const tbody = document.getElementById('tabla_precios_body_s80');
        
        // Obtener color seleccionado
        const colorSelect = document.getElementById('color_aluminio');
        const color = colorSelect ? colorSelect.value : '';
        
        // Buscar precios desde la BD según el color
        let preciosBD = {};
        let errores = [];
        
        if (color) {
            try {
                const baseDatosItems = JSON.parse(localStorage.getItem('baseDatosItems') || '{}');
                const varillasColor = baseDatosItems[`varillas_${color}`] || [];
                
                perfiles.forEach(p => {
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
        
        // Actualizar precios: si hay color, usar BD; si no, poner a 0
        perfiles.forEach(p => {
            if (preciosBD[p.c] !== undefined) {
                p.p = preciosBD[p.c];
            } else if (!color) {
                p.p = 0;  // Sin color seleccionado → precio 0
            }
        });
        
        if (tbody) {
            tbody.innerHTML = perfiles.map((p, index) => `
                <li class="list-group-item d-flex align-items-center">
                    <div class="col-5 text-uppercase small"><span class="num-fila">${index + 1}. </span>${p.n}</div>
                    <div class="col-3 text-center"><span class="caja-dato">${p.c}</span></div>
                    <div class="col-4 text-center">
                        <input type="number" step="0.01" class="caja-dato price-input" 
                        data-index="${index}" value="${p.p}" oninput="actualizarPrecioManualS80(this)" onfocus="this.select()">
                    </div>
                </li>
            `).join('');
        }
        
        // Mostrar mensaje único si faltan códigos
        const warningDiv = document.getElementById('warning_precios_s80');
        if (errores.length > 0) {
            console.warn('⚠️ Serie 80 - Perfiles faltantes en BD:', errores);
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
    
    function cargarCostosAccesorios() {
        if (!configuracionCompleta) return;
        
        const accesorios = configuracionCompleta.serie80?.accesorios || [];
        const tbody = document.getElementById('tabla_accesorios_body_s80');
        
        if (tbody) {
            tbody.innerHTML = accesorios.map((item, index) => `
                <li class="list-group-item d-flex align-items-center">
                    <div class="col-5 text-uppercase small"><span class="num-fila">${index + 1}. </span>${item.n}</div>
                    <div class="col-3 text-center"><span class="caja-dato">${item.c}</span></div>
                    <div class="col-4 text-center">
                        <input type="number" step="0.01" class="caja-dato price-input" 
                        data-accesorio-index="${index}" value="${item.p.toFixed(2)}" 
                        oninput="actualizarPrecioAccesorioS80(this, ${index})" onfocus="this.select()">
                    </div>
                </li>
            `).join('');
        }
    }
    
    function cargarCostosTiras() {
        if (!configuracionCompleta) return;
        
        const tiras = configuracionCompleta.serie80?.tiras || [];
        const tbody = document.getElementById('tabla_tiras_body_s80');
        
        if (tbody) {
            tbody.innerHTML = tiras.map((item, index) => `
                <li class="list-group-item d-flex align-items-center">
                    <div class="col-5 text-uppercase small"><span class="num-fila">${index + 1}. </span>${item.n}</div>
                    <div class="col-3 text-center"><span class="caja-dato">${item.c}</span></div>
                    <div class="col-4 text-center">
                        <input type="number" step="0.01" class="caja-dato price-input" 
                        data-tira-index="${index}" value="${item.p.toFixed(2)}" 
                        oninput="actualizarPrecioTiraS80(this, ${index})" onfocus="this.select()">
                    </div>
                </li>
            `).join('');
        }
    }
    
    // ========== VARIABLES GLOBALES DEL MÓDULO ==========
    // Buscar "Incoloro 5.5 mm" en el array de vidrios para ponerlo por defecto
    let vidrioSeleccionadoIndexS80 = (() => {
        const vidrios = configuracionCompleta?.serie80?.vidrios || [];
        const idx = vidrios.findIndex(v => v.n.toLowerCase().includes("5.5"));
        return idx >= 0 ? idx : 0;
    })();
    let vidriosListaS80 = [];
    
    function cargarCostosVidrios() {
        if (!configuracionCompleta) return;
        
        const vidrios = configuracionCompleta.serie80?.vidrios || [];
        const buscador = document.getElementById('buscador_vidrios_s80');
        const tbody = document.getElementById('tabla_vidrios_body_s80');
        
        if (tbody) {
            if (vidrioSeleccionadoIndexS80 >= 0 && vidrioSeleccionadoIndexS80 < vidrios.length) {
                const v = vidrios[vidrioSeleccionadoIndexS80];
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
    
    function buscarVidrioS80(texto) {
        const vidrios = configuracionCompleta?.serie80?.vidrios || [];
        const listaDiv = document.getElementById('lista_vidrios_s80');
        
        if (!texto || texto.trim() === '') {
            listaDiv.style.display = 'none';
            return;
        }
        
        const filtro = texto.toLowerCase().trim();
        const resultados = vidrios
            .map((v, i) => ({ v, i }))
            .filter(item => item.v.n.toLowerCase().includes(filtro));
        
        if (resultados.length === 0) {
            listaDiv.innerHTML = '<div class="list-group-item text-muted">Sin resultados</div>';
            listaDiv.style.display = 'block';
            return;
        }
        
        listaDiv.innerHTML = resultados.map(item => 
            `<div class="list-group-item list-group-item-action" onclick="seleccionarVidrioS80(${item.i})" style="cursor: pointer; padding: 6px 12px; font-size: 0.85rem;">
                ${item.v.n}
            </div>`
        ).join('');
        listaDiv.style.display = 'block';
    }
    
    function mostrarListaVidriosS80() {
        const vidrios = configuracionCompleta?.serie80?.vidrios || [];
        const listaDiv = document.getElementById('lista_vidrios_s80');
        
        if (listaDiv.style.display === 'block') {
            listaDiv.style.display = 'none';
            return;
        }
        
        listaDiv.innerHTML = vidrios.map((v, i) => 
            `<div class="list-group-item list-group-item-action" onclick="seleccionarVidrioS80(${i})" style="cursor: pointer; padding: 6px 12px; font-size: 0.85rem;">
                ${v.n}
            </div>`
        ).join('');
        listaDiv.style.display = 'block';
    }
    
    function seleccionarVidrioS80(index) {
        const vidrios = configuracionCompleta?.serie80?.vidrios || [];
        
        if (index < 0 || index >= vidrios.length) {
            vidrioSeleccionadoIndexS80 = -1;
            const tbody = document.getElementById('tabla_vidrios_body_s80');
            if (tbody) tbody.innerHTML = '<li class="list-group-item text-center text-muted">Seleccione un vidrio</li>';
            document.getElementById('buscador_vidrios_s80').value = '';
            document.getElementById('lista_vidrios_s80').style.display = 'none';
            return;
        }
        
        vidrioSeleccionadoIndexS80 = index;
        const v = vidrios[index];
        
        document.getElementById('buscador_vidrios_s80').value = v.n;
        document.getElementById('lista_vidrios_s80').style.display = 'none';
        
        const tbody = document.getElementById('tabla_vidrios_body_s80');
        if (tbody) {
            tbody.innerHTML = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><span class="num-fila">🪟</span> ${v.n}</span>
                    <span class="corte-medida">S/ ${v.p.toFixed(2)} / P2</span>
                </li>
            `;
        }
        
        // Siempre actualizar vidrios requeridos
        if (typeof renderVidriosRequeridos === 'function') {
            renderVidriosRequeridos();
        }
        
        // Actualizar resumen si está visible
        const switchResumen = document.getElementById('switch_resumen_s80');
        if (switchResumen && switchResumen.checked && typeof renderResumenS80 === 'function') {
            renderResumenS80();
        }
    }
    
    function actualizarPrecioManualS80(input) {
        const index = parseInt(input.dataset.index);
        
        if (window.configuracionCompleta && window.tipoPedidoActual) {
            const datos = window.configuracionCompleta[window.tipoPedidoActual];
            if (datos && datos.perfiles && datos.perfiles[index]) {
                datos.perfiles[index].p = parseFloat(input.value) || 0;
            }
        }
    }
    
    function actualizarPrecioAccesorioS80(input, index) {
        if (window.configuracionCompleta && window.tipoPedidoActual) {
            const datos = window.configuracionCompleta[window.tipoPedidoActual];
            if (datos && datos.accesorios && datos.accesorios[index]) {
                datos.accesorios[index].p = parseFloat(input.value) || 0;
            }
        }
    }
    
    function actualizarPrecioTiraS80(input, index) {
        if (window.configuracionCompleta && window.tipoPedidoActual) {
            const datos = window.configuracionCompleta[window.tipoPedidoActual];
            if (datos && datos.tiras && datos.tiras[index]) {
                datos.tiras[index].p = parseFloat(input.value) || 0;
            }
        }
    }
    
    function actualizarPrecioVidrioS80(input, index) {
        if (window.configuracionCompleta && window.tipoPedidoActual) {
            const datos = window.configuracionCompleta[window.tipoPedidoActual];
            if (datos && datos.vidrios && datos.vidrios[index]) {
                datos.vidrios[index].p = parseFloat(input.value) || 0;
            }
        }
    }
    
    // ========== EVENTOS PARA LOS SWITCHES ==========
    function toggleSeccion(switchId, seccionId) {
        const switchElem = document.getElementById(switchId);
        const seccionElem = document.getElementById(seccionId);
        if (switchElem && seccionElem) {
            if (switchElem.checked) {
                seccionElem.classList.remove('seccion-oculta');
            } else {
                seccionElem.classList.add('seccion-oculta');
            }
        }
    }
    
    // Asignar eventos a los switches
    const switchMateriales = document.getElementById('switch_materiales_s80');
    if (switchMateriales) {
        switchMateriales.addEventListener('change', () => {
            toggleSeccion('switch_materiales_s80', 'seccion_materiales_s80');
            cargarCostosAluminios();
        });
    }
    
    const switchAccesorios = document.getElementById('switch_accesorios_s80');
    if (switchAccesorios) {
        switchAccesorios.addEventListener('change', () => {
            toggleSeccion('switch_accesorios_s80', 'seccion_accesorios_s80');
            cargarCostosAccesorios();
        });
    }
    
    const switchTiras = document.getElementById('switch_tiras_s80');
    if (switchTiras) {
        switchTiras.addEventListener('change', () => {
            toggleSeccion('switch_tiras_s80', 'seccion_tiras_s80');
            cargarCostosTiras();
        });
    }
    
    // Nota: Serie 80 no tiene radios de estándar/pesado, es único
    
    // Cargar costos al inicio
    cargarCostosAluminios();
    cargarCostosAccesorios();
    cargarCostosTiras();
    cargarCostosVidrios();
    
    // ========== FUNCIÓN PARA VALIDAR COLOR ROJO ==========
    function validarColor(input, esInvalido) {
        if (esInvalido) {
            input.style.color = "#ff0000";
            input.style.borderColor = "#ff0000";
            return false;
        } else {
            input.style.color = "#00ff00";
            input.style.borderColor = "#444";
            return true;
        }
    }
    
    // ========== MOSTRAR ALERTA ==========
    function mostrarAlerta(mensaje) {
        alert(mensaje);
    }
    
    // ========== VALIDAR MÍNIMO ANCHO (40 cm) ==========
    function validarMinimoAncho(input) {
        const valor = parseFloat(input.value) || 0;
        const esInvalido = valor > 0 && valor < 40;
        validarColor(input, esInvalido);
        return !esInvalido;
    }
    
    // ========== VALIDAR MÍNIMO ALTURA (30 cm) ==========
    function validarMinimoAltura(input) {
        const valor = parseFloat(input.value) || 0;
        const esInvalido = valor > 0 && valor < 30;
        validarColor(input, esInvalido);
        return !esInvalido;
    }
    
    // ========== VALIDAR DIFERENCIA DE ALTURAS (máx 1 cm, o uno es 0) ==========
    function validarDiferenciaAlturas() {
        const izq = parseFloat(altIzq.value) || 0;
        const der = parseFloat(altDer.value) || 0;
        
        if (izq === 0 || der === 0) {
            validarColor(altIzq, false);
            validarColor(altDer, false);
            return true;
        }
        
        const diferencia = Math.abs(izq - der);
        const esInvalido = diferencia > 1;
        
        validarColor(altIzq, esInvalido);
        validarColor(altDer, esInvalido);
        
        if (esInvalido) {
            altIzq.title = "Diferencia máxima 1 cm (o un lado en 0)";
            altDer.title = "Diferencia máxima 1 cm (o un lado en 0)";
        } else {
            altIzq.title = "";
            altDer.title = "";
        }
        
        return !esInvalido;
    }
    
    // ========== VALIDAR DIFERENCIA DE ANCHOS (máx 5 cm, o uno es 0) ==========
    function validarDiferenciaAnchos() {
        const inf = parseFloat(anchoInf.value) || 0;
        const sup = parseFloat(anchoSup.value) || 0;
        
        if (inf === 0 || sup === 0) {
            validarColor(anchoInf, false);
            validarColor(anchoSup, false);
            return true;
        }
        
        const diferencia = Math.abs(inf - sup);
        const esInvalido = diferencia > 5;
        
        validarColor(anchoInf, esInvalido);
        validarColor(anchoSup, esInvalido);
        
        if (esInvalido) {
            anchoInf.title = "Diferencia máxima 5 cm (o un lado en 0)";
            anchoSup.title = "Diferencia máxima 5 cm (o un lado en 0)";
        } else {
            anchoInf.title = "";
            anchoSup.title = "";
        }
        
        return !esInvalido;
    }
    
    // ========== VALIDAR HOJAS (solo 2,4,6,8) ==========
        // ========== VALIDAR HOJAS (admitir 1,2,3,4,6,8) ==========
        // ========== VALIDAR HOJAS (admitir 1,2,3,4,6) ==========
    function validarHojas() {
        let valor = parseInt(hojasInput.value) || 2;
        const permitidos = [1, 2, 3, 4, 6];  // ← 8 ya no está permitido
        let esInvalido = !permitidos.includes(valor);
        
        // Corregir solo valores no permitidos (excepto 8)
        if (esInvalido && valor !== 0) {
            if (valor === 5) {
                valor = 4;
                mostrarAlerta(`⚠️ Cantidad de hojas no permitida. Se ha ajustado a ${valor}. Permitidas: 1,2,3,4,6`);
            } else if (valor === 7) {
                valor = 6;
                mostrarAlerta(`⚠️ Cantidad de hojas no permitida. Se ha ajustado a ${valor}. Permitidas: 1,2,3,4,6`);
            } else if (valor === 8) {
                // No corregir, solo marcar rojo
                esInvalido = true;
            } else if (valor > 8) {
                valor = 6;
                mostrarAlerta(`⚠️ Cantidad de hojas no permitida. Se ha ajustado a ${valor}. Permitidas: 1,2,3,4,6`);
            } else if (valor < 1) {
                valor = 2;
                esInvalido = false;
            } else {
                valor = 4;
                mostrarAlerta(`⚠️ Cantidad de hojas no permitida. Se ha ajustado a ${valor}. Permitidas: 1,2,3,4,6`);
            }
            
            if (valor !== 8) {
                hojasInput.value = valor;
                esInvalido = false;
            }
        }
        
        validarColor(hojasInput, esInvalido);
        
        if (esInvalido) {
            hojasInput.title = "Permitidas: 1, 2, 3, 4, 6 (8 en desarrollo)";
        } else {
            hojasInput.title = "";
        }
        
        actualizarCorredizas();
        
        return !esInvalido;
    }
    
    // ========== SUGERIR HOJAS SEGÚN ANCHO ==========
    function sugerirHojasPorAncho() {
        const ancho = parseFloat(anchoInf.value) || 0;
        let sugerido = 2;
        
        if (ancho <= 0) {
            sugerido = 2;
        } else if (ancho <= 290) {
            sugerido = 2;
        } else if (ancho <= 580) {
            sugerido = 4;
        } else if (ancho <= 870) {
            sugerido = 6;
        } else {
            sugerido = 8;
        }
        
        hojasInput.value = sugerido;
        validarHojas();
        sugerirFijasPorHojas();
        actualizarCorredizas();
    }
    
    
        // ========== SUGERIR FIJAS SEGÚN HOJAS ==========
    function sugerirFijasPorHojas() {
        const hojas = parseInt(hojasInput.value) || 2;
        let sugerido = 0;
        
        switch(hojas) {
            case 1:
                sugerido = 1;
                break;
            case 2:
                sugerido = 0;
                break;
            case 3:
                sugerido = 0;
                break;
            case 4:
                sugerido = 0;
                break;
            case 6:
                sugerido = 2;
                break;
            case 8:
                sugerido = 2;
                break;
            default:
                sugerido = 0;
        }
        
        fijasInput.value = sugerido;
        actualizarCorredizas();
    }
    
    // ========== ACTUALIZAR CORREDIZAS ==========
    function actualizarCorredizas() {
        const hojas = parseInt(hojasInput.value) || 0;
        const fijas = parseInt(fijasInput.value) || 0;
        corrOutput.value = Math.max(0, hojas - fijas);
    }
        // ========== VALIDAR FIJAS SEGÚN HOJAS ==========
    function validarFijas() {
        const hojas = parseInt(hojasInput.value) || 1;
        let fijas = parseInt(fijasInput.value) || 0;
        let fijasValidas = false;
        let fijasPermitidas = [];
        
        // Definir fijas permitidas según cantidad de hojas
        switch(hojas) {
            case 1:
                fijasPermitidas = [1];
                break;
            case 2:
                fijasPermitidas = [0, 1];
                break;
            case 3:
                fijasPermitidas = [0, 1];
                break;
            case 4:
                fijasPermitidas = [0, 1, 2];
                break;
            case 6:
                fijasPermitidas = [2];
                break;
            case 8:
                fijasPermitidas = [2];
                break;
            default:
                fijasPermitidas = [0];
        }
        
        fijasValidas = fijasPermitidas.includes(fijas);
        
        // Si no es válido, corregir al primer valor permitido
        if (!fijasValidas && fijasPermitidas.length > 0) {
            fijas = fijasPermitidas[0];
            fijasInput.value = fijas;
        }
        
        // Poner en rojo si es inválido (igual que los otros campos)
        validarColor(fijasInput, !fijasValidas);
        
        // Actualizar corredizas
        actualizarCorredizas();
        
        return fijasValidas;
    }
    
    // ========== ACTUALIZAR ANCHO SUPERIOR AUTO ==========
    function actualizarAnchoAuto() {
        const aI = parseFloat(anchoInf.value) || 0;
        const aS = parseFloat(anchoSup.value) || 0;
        anchoSupAuto.value = (aS > 0 ? aS : aI).toFixed(1);
        
        const anchoSpan = document.getElementById('ancho_actual_sugerencia_s80');
        if (anchoSpan) anchoSpan.innerText = anchoSupAuto.value;
    }
    
    // ========== SUGERIR FIJAS EN SOBREVENTANA ==========
    function sugerirFijasSobreVentana() {
        let anchoFinal = parseFloat(anchoSupAuto.value) || 0;
        const inputFijos = document.getElementById('fijos_solo_puente_s80');
        const sugerenciaSpan = document.getElementById('sugerencia_fijos_texto_s80');
        
        if (anchoFinal <= 0) {
            inputFijos.value = 1;
            if (sugerenciaSpan) sugerenciaSpan.innerText = "1 (sin ancho)";
            return;
        }
        
        let sugerido = 1;
        if (anchoFinal <= 120) sugerido = 1;
        else if (anchoFinal <= 215) sugerido = 2;
        else if (anchoFinal <= 360) sugerido = 3;
        else if (anchoFinal <= 430) sugerido = 4;
        else sugerido = Math.ceil(anchoFinal / 160);
        
        if (sugerido < 1) sugerido = 1;
        
        inputFijos.value = sugerido;
        if (sugerenciaSpan) sugerenciaSpan.innerText = sugerido + " (automático)";
    }
    
    // ========== ACTUALIZAR CORREDIZAS DEL PUENTE ==========
    function actualizarCorrPuente() {
        const h = parseInt(hojasPuente.value) || 0;
        const f = parseInt(fijosPuente.value) || 0;
        corrPuente.value = Math.max(0, h - f);
        
        const permitidos = [2, 4, 6, 8];
        const esInvalido = !permitidos.includes(h);
        validarColor(hojasPuente, esInvalido);
        if (esInvalido && h > 0) {
            let sugerido = 2;
            if (h >= 3 && h <= 5) sugerido = 4;
            else if (h >= 5 && h <= 7) sugerido = 6;
            else if (h >= 7) sugerido = 8;
            hojasPuente.value = sugerido;
            actualizarCorrPuente();
        }
    }
    
        function generarHojaHTML(tipoTexto, tipoClase, altura, ancho, anchoArriba, anchoAbajo, index) {
        const alturaText = altura > 0 ? altura + ' cm' : '---';
        const anchoArribaText = (anchoArriba && anchoArriba > 0) ? anchoArriba + ' cm' : '';
        const anchoAbajoText = (anchoAbajo && anchoAbajo > 0) ? anchoAbajo + ' cm' : (ancho > 0 ? ancho + ' cm' : '---');
        
        const alturaRectangulo = Math.min(150, Math.max(80, altura * 0.8));
        const anchoRectangulo = Math.min(120, Math.max(50, ancho * 1.5));
        
        return `
        <div class="hoja-item" style="position: relative;">
            <div class="hoja-rectangulo ${tipoClase}" style="height: ${alturaRectangulo}px; width: ${anchoRectangulo}px; position: relative;">
                ${anchoArribaText ? `<div class="hoja-ancho-arriba" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: #ff9800;">${anchoArribaText}</div>` : ''}
                <div class="hoja-altura-vertical" style="writing-mode: vertical-rl; text-orientation: mixed; font-size: 0.7rem; font-weight: bold; color: #bb86fc; position: absolute; left: 3px; top: 50%; transform: translateY(-50%);">${alturaText}</div>
                <div class="hoja-tipo" style="font-size: 0.7rem; font-weight: bold; position: absolute; bottom: 5px; left: 0; right: 0; text-align: center;">${tipoTexto}</div>
            </div>
            <div class="hoja-ancho" style="margin-top: 8px; font-size: 0.75rem; font-weight: bold; color: #00ff00; text-align: center;">${anchoAbajoText}</div>
        </div>
        `;
    }
    
    // ========== RENDERIZAR VISTA PREVIA DE HOJAS ==========
    function renderVistaPrevia() {
    const contenedor = document.getElementById('vista_previa_hojas_s80');
    if (!contenedor) return;
    
    const anchoTotal = parseFloat(anchoInf.value) || 0;
    const alturaIzqVal = parseFloat(altIzq.value) || 0;
    const alturaDerVal = parseFloat(altDer.value) || 0;
    const alturaMayor = Math.max(alturaIzqVal, alturaDerVal);
    const hojas = parseInt(hojasInput.value) || 2;
    const fijas = parseInt(fijasInput.value) || 0;
    const corredizas = hojas - fijas;
    
            let anchoCorrediza = 0;
        let anchoFija = 0;
        if (anchoTotal > 0 && hojas > 0) {
            const anchos = calcularAnchosHojas(anchoTotal, hojas, fijas);
            anchoCorrediza = anchos.corrediza;
            anchoFija = anchos.fija;
        }
        
        // Para mantener compatibilidad con el resto del código
        let anchoPorHoja = anchoCorrediza;
    
    // ========== CALCULAR ALTURAS CON REGLA ESPECIAL ==========
    const alturaFijaBase = alturaMayor > 0 ? (alturaMayor - 0.5) : 0;
    const alturaCorredizaBase = alturaMayor > 0 ? (alturaMayor - 5.5) : 0;
    
    // Aplicar regla especial para fijas
    let alturaFija = alturaFijaBase;
    if (hojas === 2 && fijas === 1) {
        alturaFija = alturaCorredizaBase;
    } else if (hojas === 4 && fijas === 2) {
        alturaFija = alturaCorredizaBase;
    }
    
    // Convertir a string con 1 decimal para mostrar
    const alturaFijaMostrar = alturaFija.toFixed(1);
    const alturaCorredizaMostrar = alturaCorredizaBase.toFixed(1);
    
    const difAlturas = Math.abs(alturaIzqVal - alturaDerVal);
    const anchoInfVal = parseFloat(anchoInf.value) || 0;
    const anchoSupVal = parseFloat(anchoSup.value) || 0;
    const difAnchos = Math.abs(anchoInfVal - anchoSupVal);
    
    const hayDescuadreAlturas = difAlturas > 0.6 && alturaIzqVal > 0 && alturaDerVal > 0;
    const hayDescuadreAnchos = difAnchos > 0.6 && anchoInfVal > 0 && anchoSupVal > 0;
    
    // Descuadre de altura
    let alturaFijaIzq = alturaFijaMostrar;
    let alturaFijaDer = alturaFijaMostrar;
    let alturaCorredizaIzq = alturaCorredizaMostrar;
    let alturaCorredizaDer = alturaCorredizaMostrar;
    
    if (hayDescuadreAlturas && alturaMayor > 0) {
        // Para descuadre, también aplicar la regla especial
        let fijaIzqBase = (alturaIzqVal - 0.5);
        let fijaDerBase = (alturaDerVal - 0.5);
        let corrIzqBase = (alturaIzqVal - 5.5);
        let corrDerBase = (alturaDerVal - 5.5);
        
        if (hojas === 2 && fijas === 1) {
            fijaIzqBase = corrIzqBase;
            fijaDerBase = corrDerBase;
        } else if (hojas === 4 && fijas === 2) {
            fijaIzqBase = corrIzqBase;
            fijaDerBase = corrDerBase;
        }
        
        alturaFijaIzq = fijaIzqBase.toFixed(1);
        alturaFijaDer = fijaDerBase.toFixed(1);
        alturaCorredizaIzq = corrIzqBase.toFixed(1);
        alturaCorredizaDer = corrDerBase.toFixed(1);
    }
    
    // Descuadre de ancho
        let anchoPorHojaArriba = anchoPorHoja;
        let anchoPorHojaAbajo = anchoPorHoja;
        
        if (hayDescuadreAnchos && Math.max(anchoInfVal, anchoSupVal) > 0) {
            const anchosInf = calcularAnchosHojas(anchoInfVal, hojas, fijas);
            const anchosSup = calcularAnchosHojas(anchoSupVal, hojas, fijas);
            anchoPorHojaArriba = anchosSup.corrediza;
            anchoPorHojaAbajo = anchosInf.corrediza;
        }
    
    let anchoFijaAbajo = anchoFija;  // ← usar anchoFija real
let anchoFijaArriba = anchoFija;  // ← usar anchoFija real
let anchoArribaCorrediza = null;
let anchoAbajoCorrediza = anchoPorHoja;
    
    if (hayDescuadreAnchos) {
    const anchosFijaInf = calcularAnchosHojas(anchoInfVal, hojas, fijas);
    const anchosFijaSup = calcularAnchosHojas(anchoSupVal, hojas, fijas);
    anchoFijaAbajo = anchosFijaInf.fija;
    anchoFijaArriba = anchosFijaSup.fija;
    anchoArribaCorrediza = anchoPorHojaArriba;
    anchoAbajoCorrediza = anchoPorHojaAbajo;
}
    
    // Ambas fijas usan los mismos valores de ancho
    let anchoFijaIzq = anchoFijaAbajo;
    let anchoFijaDer = anchoFijaAbajo;
    let anchoFijaIzqArriba = anchoFijaArriba;
    let anchoFijaDerArriba = anchoFijaArriba;
    
    let alturaFijaMostrarVar = alturaFijaMostrar;
    let alturaCorredizaMostrarVar = alturaCorredizaMostrar;
    let alturaFijaMostrarDer = alturaFijaMostrar;
    
    if (hayDescuadreAlturas) {
        alturaFijaMostrarVar = alturaFijaIzq;
        alturaCorredizaMostrarVar = alturaCorredizaIzq;
        alturaFijaMostrarDer = alturaFijaDer;
    }
    
    let html = '';
    let textoInfo = '';
    if (corredizas > 0) {
        textoInfo += `<div>corredizas = ${corredizas}</div>`;
    }
    if (fijas > 0) {
        textoInfo += `<div>fijas = ${fijas}</div>`;
    }
    
    if (textoInfo) {
        html += `<div class="text-center text-info mb-2" style="font-size: 0.85rem;">📊 ${textoInfo}</div>`;
    }
    
    html += `<div class="d-flex flex-wrap justify-content-center align-items-end gap-4">`;
    
    if (fijas === 0 && corredizas > 0) {
        const alturaMostrar = hayDescuadreAlturas ? alturaCorredizaMostrarVar : alturaCorredizaMostrar;
        const anchoMostrar = hayDescuadreAnchos ? anchoAbajoCorrediza : anchoPorHoja;
        const anchoArriba = hayDescuadreAnchos ? anchoArribaCorrediza : null;
        html += generarHojaHTML('Corredizas', 'corrediza', alturaMostrar, anchoMostrar, anchoArriba, anchoMostrar, 0);
    } else if (fijas > 0 && corredizas > 0) {
        // Fija izquierda + Corredizas + posible fija derecha
        const alturaFijaMostrarIzq = hayDescuadreAlturas ? alturaFijaMostrarVar : alturaFijaMostrar;
        html += generarHojaHTML('Fija', 'fija', alturaFijaMostrarIzq, anchoFijaIzq, anchoFijaIzqArriba, anchoFijaIzq, 0);
        
        const alturaCorrMostrar = hayDescuadreAlturas ? alturaCorredizaMostrarVar : alturaCorredizaMostrar;
        const anchoCorrMostrar = hayDescuadreAnchos ? anchoAbajoCorrediza : anchoPorHoja;
        const anchoCorrArriba = hayDescuadreAnchos ? anchoArribaCorrediza : null;
        html += generarHojaHTML('Corredizas', 'corrediza', alturaCorrMostrar, anchoCorrMostrar, anchoCorrArriba, anchoCorrMostrar, 1);
        
        if (fijas >= 2) {
            let alturaFijaDerMostrar = alturaFijaMostrar;
            if (hayDescuadreAlturas) {
                let fijaDerBase = (alturaDerVal - 0.5);
                if (hojas === 2 && fijas === 1) {
                    fijaDerBase = (alturaDerVal - 5.5);
                } else if (hojas === 4 && fijas === 2) {
                    fijaDerBase = (alturaDerVal - 5.5);
                }
                alturaFijaDerMostrar = fijaDerBase.toFixed(1);
            }
            html += generarHojaHTML('Fija', 'fija', alturaFijaDerMostrar, anchoFijaDer, anchoFijaDerArriba, anchoFijaDer, 2);
        }
    } else if (fijas > 0 && corredizas === 0) {
        // Solo fijas (sin corredizas)
        const alturaFijaMostrarIzq = hayDescuadreAlturas ? alturaFijaMostrarVar : alturaFijaMostrar;
        html += generarHojaHTML('Fija', 'fija', alturaFijaMostrarIzq, anchoFijaIzq, anchoFijaIzqArriba, anchoFijaIzq, 0);
        
        if (fijas >= 2) {
            let alturaFijaDerMostrar = alturaFijaMostrar;
            if (hayDescuadreAlturas) {
                let fijaDerBase = (alturaDerVal - 0.5);
                if (hojas === 2 && fijas === 1) {
                    fijaDerBase = (alturaDerVal - 5.5);
                } else if (hojas === 4 && fijas === 2) {
                    fijaDerBase = (alturaDerVal - 5.5);
                }
                alturaFijaDerMostrar = fijaDerBase.toFixed(1);
            }
            html += generarHojaHTML('Fija', 'fija', alturaFijaDerMostrar, anchoFijaDer, anchoFijaDerArriba, anchoFijaDer, 2);
        }
    }
    
    html += `</div>`;
    
    if ((fijas === 0 && corredizas === 0)) {
        html = '<div class="text-center text-muted">Configure hojas y fijas para ver la vista previa</div>';
    }
    
    contenedor.innerHTML = html;
}
 
// ========== RENDERIZAR VIDRIOS REQUERIDOS ==========
function renderVidriosRequeridos() {
    const contenedor = document.getElementById('lista_vidrios_req_body_s80');
    if (!contenedor) return;
    
    // Obtener valores actuales
    const anchoInf = parseFloat(document.getElementById('ancho_inf_s80').value) || 0;
    const anchoSup = parseFloat(document.getElementById('ancho_sup_s80').value) || 0;
    const altIzq = parseFloat(document.getElementById('alt_izq_s80').value) || 0;
    const altDer = parseFloat(document.getElementById('alt_der_s80').value) || 0;
    const hojas = parseInt(document.getElementById('cant_hojas_s80').value) || 2;
    const fijas = parseInt(document.getElementById('cant_fijas_s80').value) || 0;
    const corredizas = hojas - fijas;
    const cantidadVentanas = parseInt(document.getElementById('cantidad').value) || 1;
    
    // Detectar descuadres
    const hayDescuadreAnchos = Math.abs(anchoInf - anchoSup) > 0.6 && anchoInf > 0 && anchoSup > 0;
    const hayDescuadreAlturas = Math.abs(altIzq - altDer) > 0.6 && altIzq > 0 && altDer > 0;
    
    // Calcular alturas base de hojas
    const alturaTotal = Math.max(altIzq, altDer);
    const alturaFijaBase = alturaTotal > 0 ? alturaTotal - 0.5 : 0;
    const alturaCorredizaBase = alturaTotal > 0 ? alturaTotal - 5.5 : 0;
    
    // Aplicar regla especial para fijas (misma altura que corredizas en ciertos casos)
    let alturaFija = alturaFijaBase;
    if ((hojas === 2 && fijas === 1) || (hojas === 4 && fijas === 2)) {
        alturaFija = alturaCorredizaBase;
    }
    
    // Alturas con descuadre
    let alturaFijaIzq = alturaFija;
    let alturaFijaDer = alturaFija;
    let alturaCorredizaIzq = alturaCorredizaBase;
    let alturaCorredizaDer = alturaCorredizaBase;
    
    if (hayDescuadreAlturas && alturaTotal > 0) {
        let fijaIzqBase = altIzq - 0.5;
        let fijaDerBase = altDer - 0.5;
        let corrIzqBase = altIzq - 5.5;
        let corrDerBase = altDer - 5.5;
        
        if ((hojas === 2 && fijas === 1) || (hojas === 4 && fijas === 2)) {
            fijaIzqBase = corrIzqBase;
            fijaDerBase = corrDerBase;
        }
        
        alturaFijaIzq = fijaIzqBase;
        alturaFijaDer = fijaDerBase;
        alturaCorredizaIzq = corrIzqBase;
        alturaCorredizaDer = corrDerBase;
    }
    
    // Calcular anchos por hoja usando la función existente
    let anchoHojaInf = 0;
    let anchoHojaSup = 0;
    if (anchoInf > 0 && hojas > 0) {
        const anchosInf = calcularAnchosHojas(anchoInf, hojas, fijas);
        anchoHojaInf = anchosInf.corrediza;
        
        if (hayDescuadreAnchos && anchoSup > 0) {
            const anchosSup = calcularAnchosHojas(anchoSup, hojas, fijas);
            anchoHojaSup = anchosSup.corrediza;
        } else {
            anchoHojaSup = anchoHojaInf;
        }
    }
    
    // Calcular anchos para fijas
    let anchoFijaInf = anchoHojaInf;
    let anchoFijaSup = anchoHojaSup;
    if (fijas > 0) {
        if (anchoInf > 0 && hojas > 0) {
            const anchosFija = calcularAnchosHojas(anchoInf, hojas, fijas);
            anchoFijaInf = anchosFija.fija;
            if (hayDescuadreAnchos && anchoSup > 0) {
                const anchosFijaSup = calcularAnchosHojas(anchoSup, hojas, fijas);
                anchoFijaSup = anchosFijaSup.fija;
            } else {
                anchoFijaSup = anchoFijaInf;
            }
        }
    }
    
    // Determinar distribución de fijas (izquierda y/o derecha)
    let tieneFijaIzq = false;
    let tieneFijaDer = false;
    
    if (hojas === 1 && fijas === 1) {
        tieneFijaIzq = true;
    } else if (hojas === 2 && fijas === 1) {
        tieneFijaIzq = true;
    } else if (hojas === 3 && fijas === 1) {
        tieneFijaIzq = true;
    } else if (hojas === 4 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
    } else if (hojas === 6 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
    } else if (hojas === 8 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
    }
    
        // Obtener precio del vidrio seleccionado
    let vidrioSeleccionado = null;
    if (configuracionCompleta?.serie80?.vidrios && vidrioSeleccionadoIndexS80 !== undefined) {
        vidrioSeleccionado = configuracionCompleta.serie80.vidrios[vidrioSeleccionadoIndexS80];
    }
    if (!vidrioSeleccionado && configuracionCompleta?.serie80?.vidrios?.length > 0) {
        vidrioSeleccionado = configuracionCompleta.serie80.vidrios[0];
    }
    
    if (!vidrioSeleccionado) {
        contenedor.innerHTML = '<li class="list-group-item text-center text-muted">No hay vidrios configurados</li>';
        return;
    }
    
    // Función para redondear a múltiplo de 5 superior
    function redondearMultiplo5(valor) {
        return Math.ceil(valor / 5) * 5;
    }
    
    // Función para calcular costo de un vidrio
    function calcularCostoVidrio(anchoReal, altoReal, precio) {
        const anchoRedondeado = redondearMultiplo5(anchoReal);
        const altoRedondeado = redondearMultiplo5(altoReal);
        const areaP2 = (anchoRedondeado * altoRedondeado) / 900;
        return areaP2 * precio;
    }
    
    // Colección de vidrios por tipo
    const vidriosPorTipo = [];
    
    // === VIDRIOS DE FIJAS ===
    if (tieneFijaIzq) {
        const alto = alturaFijaIzq > 0 ? alturaFijaIzq : alturaFija;
        const ancho = anchoFijaInf;
        const anchoSupFija = hayDescuadreAnchos ? anchoFijaSup : anchoFijaInf;
        const cantidad = 1 * cantidadVentanas;
        
        vidriosPorTipo.push({
            tipo: 'FIJA',
            anchoInf: ancho - 13.4,
            alto: alto - 13.4,
            anchoSup: anchoSupFija - 13.4,
            hayDescuadre: hayDescuadreAnchos,
            cantidad: cantidad
        });
    }
    
    if (tieneFijaDer) {
        const alto = alturaFijaDer > 0 ? alturaFijaDer : alturaFija;
        const ancho = anchoFijaInf;
        const anchoSupFija = hayDescuadreAnchos ? anchoFijaSup : anchoFijaInf;
        const cantidad = 1 * cantidadVentanas;
        
        vidriosPorTipo.push({
            tipo: 'FIJA',
            anchoInf: ancho - 13.4,
            alto: alto - 13.4,
            anchoSup: anchoSupFija - 13.4,
            hayDescuadre: hayDescuadreAnchos,
            cantidad: cantidad
        });
    }
    
    // === VIDRIOS DE CORREDIZAS ===
    if (corredizas > 0) {
        const alto = hayDescuadreAlturas ? alturaCorredizaIzq : alturaCorredizaBase;
        const ancho = anchoHojaInf;
        const anchoSupHoja = hayDescuadreAnchos ? anchoHojaSup : anchoHojaInf;
        const cantidad = corredizas * cantidadVentanas;
        
        vidriosPorTipo.push({
            tipo: 'CORREDIZA',
            anchoInf: ancho - 13.4,
            alto: alto - 13.4,
            anchoSup: anchoSupHoja - 13.4,
            hayDescuadre: hayDescuadreAnchos,
            cantidad: cantidad
        });
    }
    
    // Agrupar vidrios del mismo tipo y misma medida
    const grupos = new Map();
    
    vidriosPorTipo.forEach(v => {
        let clave;
        if (v.hayDescuadre) {
            clave = `${v.tipo}_${v.anchoInf.toFixed(1)}_${v.alto.toFixed(1)}_${v.anchoSup.toFixed(1)}`;
        } else {
            clave = `${v.tipo}_${v.anchoInf.toFixed(1)}_${v.alto.toFixed(1)}`;
        }
        
        if (grupos.has(clave)) {
            grupos.get(clave).cantidad += v.cantidad;
        } else {
            grupos.set(clave, {
                tipo: v.tipo,
                anchoInf: v.anchoInf,
                alto: v.alto,
                anchoSup: v.anchoSup,
                hayDescuadre: v.hayDescuadre,
                cantidad: v.cantidad
            });
        }
    });
    
    // Generar HTML
    let html = '';
    let totalVidrios = 0;
    
    grupos.forEach(grupo => {
        // Determinar ancho para precio (el mayor si hay descuadre)
        const anchoParaPrecio = grupo.hayDescuadre ? Math.max(grupo.anchoInf, grupo.anchoSup) : grupo.anchoInf;
        const anchoRedondeado = redondearMultiplo5(anchoParaPrecio);
        const altoRedondeado = redondearMultiplo5(grupo.alto);
        
        const costoUnitario = calcularCostoVidrio(anchoParaPrecio, grupo.alto, vidrioSeleccionado.p);
        const costoTotal = costoUnitario * grupo.cantidad;
        totalVidrios += costoTotal;
        
        // Construir medida visual
        let medidaVisual = '';
        if (grupo.hayDescuadre) {
            medidaVisual = `${grupo.anchoInf.toFixed(1)} x ${grupo.alto.toFixed(1)} x ${grupo.anchoSup.toFixed(1)}`;
        } else {
            medidaVisual = `${grupo.anchoInf.toFixed(1)} x ${grupo.alto.toFixed(1)}`;
        }
        
        html += `
            <li class="list-group-item d-flex align-items-center py-2">
                <div class="col-4">
                    <div class="fw-bold text-uppercase small text-info">${grupo.tipo}</div>
                    <div class="small text-muted">${vidrioSeleccionado.n}</div>
                </div>
                <div class="col-4 text-center">
                    <span class="text-success fw-bold">${medidaVisual}</span>
                    <div class="small">→ redondeado: ${anchoRedondeado} x ${altoRedondeado}</div>
                    <div class="small">Cant: <span class="badge bg-secondary">${grupo.cantidad}</span></div>
                </div>
                <div class="col-4 text-end text-success fw-bold">S/. ${costoTotal.toFixed(2)}</div>
            </li>
        `;
    });
    
    if (html === '') {
        html = '<li class="list-group-item text-center text-muted">No hay vidrios para calcular</li>';
    } else {
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center mt-2 border-top border-warning bg-dark">
                <span class="text-warning fw-bold">TOTAL VIDRIOS:</span>
                <span class="h5 text-white mb-0">S/. ${totalVidrios.toFixed(2)}</span>
            </li>
        `;
    }
    
        contenedor.innerHTML = html;
    
    // Actualizar resumen si está visible
    const switchResumen = document.getElementById('switch_resumen_s80');
    if (switchResumen && switchResumen.checked) {
        renderResumenS80();
    }
}

// ========== RENDERIZAR ACCESORIOS REQUERIDOS ==========
function renderAccesoriosRequeridos() {
    const contenedor = document.getElementById('lista_accesorios_req_body_s80');
    if (!contenedor) return;
    
    // Obtener valores actuales
    const hojas = parseInt(document.getElementById('cant_hojas_s80').value) || 2;
    const fijas = parseInt(document.getElementById('cant_fijas_s80').value) || 0;
    const corredizas = hojas - fijas;
    const cantidadPedido = parseInt(document.getElementById('cantidad').value) || 1;
    
    // Obtener modelo actual para cierre automático y manija
    let modeloActual = '';
    if (hojas === 1 && fijas === 1) modeloActual = 'F';
    else if (hojas === 2 && fijas === 0) modeloActual = 'CC';
    else if (hojas === 2 && fijas === 1) modeloActual = 'FC';
    else if (hojas === 3 && fijas === 0) modeloActual = 'CCC';
    else if (hojas === 3 && fijas === 1) modeloActual = 'FCC';
    else if (hojas === 4 && fijas === 0) modeloActual = 'CCCC';
    else if (hojas === 4 && fijas === 1) modeloActual = 'FCCC';
    else if (hojas === 4 && fijas === 2) modeloActual = 'FCCF';
    else if (hojas === 6 && fijas === 0) modeloActual = 'CCCCCC';
    else if (hojas === 6 && fijas === 2) modeloActual = 'FCCCCF';
    else if (hojas === 8 && fijas === 2) modeloActual = 'FCCCCCCF';
    
    // Obtener traslapes desde medidas generales
    let totalTraslapes = 0;
    const listaCortes = document.getElementById('lista_cortes_detallada_s80');
    if (listaCortes) {
        listaCortes.querySelectorAll('li').forEach(item => {
            const nombre = item.querySelector('strong')?.innerText || '';
            if (nombre.includes('TRASLAPE')) {
                const medidaCantidad = item.querySelector('.corte-medida');
                if (medidaCantidad) {
                    const match = medidaCantidad.innerText.match(/x\s*(\d+)/);
                    if (match) {
                        totalTraslapes += parseInt(match[1]);
                    }
                }
            }
        });
    }
    
    const accesorios = configuracionCompleta?.serie80?.accesorios || [];
    
    // ========== CALCULAR CANTIDADES ==========
    const cantidadVentanas = cantidadPedido;
    
    // 1. GARRUCHA
    let garrucha = corredizas * 2 * cantidadVentanas;
    
    // 2. CIERRE MULTIPUNTO
    let cierreMultipunto = 0;
    if (hojas !== 1) {
        cierreMultipunto = 1 * cantidadVentanas;
    }
    
    // 3. ESCUADRA DE PRECISION
    let escPrecision = 4 * cantidadVentanas;
    
    // 4. ESCUADRA DE ENSAMBLE
    let escEnsamble = hojas * 4 * cantidadVentanas;
    
    // 5. ESCUADRA DE ALINEAMIENTO
    let escAlineamiento = hojas * 8 * cantidadVentanas;
    
    // 6. CORTAVIENTO
    let cortaviento = 0;
    if (hojas === 1) cortaviento = 0;
    else if (hojas === 2) cortaviento = 2;
    else if (hojas === 3) cortaviento = 4;
    else if (hojas === 4 && fijas === 0) cortaviento = 4;
    else if (hojas === 4 && fijas === 1) cortaviento = 6;
    else if (hojas === 4 && fijas === 2) cortaviento = 4;
    else if (hojas === 6) cortaviento = 8;
    else if (hojas === 8) cortaviento = 12;
    cortaviento = cortaviento * cantidadVentanas;
    
    // 7. GUIA PLASTICA
    let guiaPlastica = totalTraslapes * 2 * cantidadVentanas;
    
    // 8. CIERRE AUTOMATICO
    let cierreAutomatico = 0;
    if (modeloActual === 'CC' || modeloActual === 'CCC') cierreAutomatico = 1;
    else if (modeloActual === 'CCCC' || modeloActual === 'FCCCCF') cierreAutomatico = 2;
    else if (modeloActual === 'FCCCCCCF') cierreAutomatico = 2;
    cierreAutomatico = cierreAutomatico * cantidadVentanas;
    
    // 9. MANIJA ADICIONAL
    let manija = 0;
    if (modeloActual === 'CCCC' || modeloActual === 'FCCF' || 
        modeloActual === 'FCCCCF' || modeloActual === 'FCCCCCCF') {
        manija = 1 * cantidadVentanas;
    }
    
    // Crear array con cantidades (en el orden del JSON)
    const cantidades = [
        garrucha,           // GARRUCHA SERIE 80
        cierreMultipunto,   // CIERRE MULTIPUNTO
        escPrecision,       // ESCUADRA DE PRECISION
        escEnsamble,        // ESCUADRA DE ENSAMBLE
        escAlineamiento,    // ESCUADRA DE ALINEAMIENTO
        cortaviento,        // CORTAVIENTO SERIE 80
        guiaPlastica,       // GUIA PLASTICA SERIE 80
        cierreAutomatico,   // CIERRE AUTOMATICO S-60
        manija              // MANIJA ADICIONAL
    ];
    
    // Generar HTML
    let html = '';
    let totalAccesorios = 0;
    
    accesorios.forEach((item, index) => {
        const cantidad = cantidades[index] || 0;
        if (cantidad > 0) {
            const subtotal = cantidad * item.p;
            totalAccesorios += subtotal;
            
            html += `
                <li class="list-group-item d-flex align-items-center py-2">
                    <div class="col-5">
                        <div class="text-uppercase fw-bold text-white small">${item.n}</div>
                    </div>
                    <div class="col-3 text-center">
                        <span class="badge bg-secondary" style="font-family: monospace; font-size: 0.7rem;">${item.c}</span>
                    </div>
                    <div class="col-2 text-center">
                        <span class="badge bg-warning text-dark">${cantidad}</span>
                    </div>
                    <div class="col-2 text-end text-success fw-bold">S/. ${subtotal.toFixed(2)}</div>
                </li>
            `;
        }
    });
    
    if (html === '') {
        html = '<li class="list-group-item text-center text-muted">No hay accesorios para calcular</li>';
    } else {
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center mt-2 border-top border-warning bg-dark">
                <span class="text-warning fw-bold">TOTAL ACCESORIOS:</span>
                <span class="h5 text-white mb-0">S/. ${totalAccesorios.toFixed(2)}</span>
            </li>
        `;
    }
    
        contenedor.innerHTML = html;
    
    // Actualizar resumen si está visible
    const switchResumen = document.getElementById('switch_resumen_s80');
    if (switchResumen && switchResumen.checked) {
        renderResumenS80();
    }
}
    
// ========== CALCULAR FELPA HERMETIK ==========
// ========== CALCULAR FELPA HERMETIK ==========
function calcularFelpaHermetik() {
    const anchoInf = parseFloat(document.getElementById('ancho_inf_s80').value) || 0;
    const anchoSup = parseFloat(document.getElementById('ancho_sup_s80').value) || 0;
    const altIzq = parseFloat(document.getElementById('alt_izq_s80').value) || 0;
    const altDer = parseFloat(document.getElementById('alt_der_s80').value) || 0;
    const hojas = parseInt(document.getElementById('cant_hojas_s80').value) || 2;
    const fijas = parseInt(document.getElementById('cant_fijas_s80').value) || 0;
    const cantidadPedido = parseInt(document.getElementById('cantidad').value) || 1;
    
    const hayDescuadreAlturas = Math.abs(altIzq - altDer) > 0.6 && altIzq > 0 && altDer > 0;
    const hayDescuadreAnchos = Math.abs(anchoInf - anchoSup) > 0.6 && anchoInf > 0 && anchoSup > 0;
    const alturaTotal = Math.max(altIzq, altDer);
    
    // Altura de hojas
    let alturaCorredizaBase = alturaTotal > 0 ? alturaTotal - 5.5 : 0;
    let alturaFijaBase = alturaTotal > 0 ? alturaTotal - 0.5 : 0;
    
    // Regla especial: en FC y FCCF la fija tiene misma altura que corrediza
    const esModeloFC = (hojas === 2 && fijas === 1);
    const esModeloFCCF = (hojas === 4 && fijas === 2);
    if (esModeloFC || esModeloFCCF) {
        alturaFijaBase = alturaCorredizaBase;
    }
    
    let alturaFijaIzq = alturaFijaBase, alturaFijaDer = alturaFijaBase;
    let alturaCorredizaIzq = alturaCorredizaBase, alturaCorredizaDer = alturaCorredizaBase;
    
    if (hayDescuadreAlturas && alturaTotal > 0) {
        let fijaIzqBase = altIzq - 0.5;
        let fijaDerBase = altDer - 0.5;
        let corrIzqBase = altIzq - 5.5;
        let corrDerBase = altDer - 5.5;
        
        if (esModeloFC || esModeloFCCF) {
            fijaIzqBase = corrIzqBase;
            fijaDerBase = corrDerBase;
        }
        
        alturaFijaIzq = fijaIzqBase;
        alturaFijaDer = fijaDerBase;
        alturaCorredizaIzq = corrIzqBase;
        alturaCorredizaDer = corrDerBase;
    }
    
    // Anchos de hojas
    let anchoHoja = 0, anchoFija = 0;
    if (anchoInf > 0 && hojas > 0) {
        const anchos = calcularAnchosHojas(anchoInf, hojas, fijas);
        anchoHoja = anchos.corrediza;
        anchoFija = anchos.fija;
    }
    
    let anchoHojaSup = anchoHoja, anchoFijaSup = anchoFija;
    if (hayDescuadreAnchos && anchoSup > 0) {
        const anchosSup = calcularAnchosHojas(anchoSup, hojas, fijas);
        anchoHojaSup = anchosSup.corrediza;
        anchoFijaSup = anchosSup.fija;
    }
    
    // Determinar distribución de fijas
    let tieneFijaIzq = false, tieneFijaDer = false;
    let modeloFija = '4LADOS'; // 4LADOS o 1PARANTE o NINGUNA
    
    if (hojas === 1 && fijas === 1) {
        modeloFija = 'NINGUNA';
    } else if (hojas === 2 && fijas === 1) {
        tieneFijaIzq = true;
        modeloFija = '4LADOS';  // FC
    } else if (hojas === 3 && fijas === 1) {
        tieneFijaIzq = true;
        modeloFija = '1PARANTE';  // FCC
    } else if (hojas === 4 && fijas === 1) {
        tieneFijaIzq = true;
        modeloFija = '1PARANTE';  // FCCC
    } else if (hojas === 4 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
        modeloFija = '4LADOS';  // FCCF
    } else if (hojas === 6 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
        modeloFija = '1PARANTE';  // FCCCCF
    } else if (hojas === 8 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
        modeloFija = '1PARANTE';  // FCCCCCCF
    }
    
    const corredizas = hojas - fijas;
    const mult = cantidadPedido;
    let totalFelpaCm = 0;
    const detalles = [];
    
    // ========== CORREDIZAS (SIEMPRE 4 LADOS) ==========
    // Fórmula: (altura × 4) + (ancho × 4)
    if (corredizas > 0) {
        let altura = hayDescuadreAlturas ? alturaCorredizaIzq : alturaCorredizaBase;
        let ancho = anchoHoja;
        let anchoSuperior = hayDescuadreAnchos ? anchoHojaSup : anchoHoja;
        
        let felpaPorHoja;
        if (hayDescuadreAnchos) {
            // (4 × altura) + (2 × ancho_inf) + (2 × ancho_sup)
            felpaPorHoja = (4 * altura) + (2 * ancho) + (2 * anchoSuperior);
        } else {
            // (4 × altura) + (4 × ancho)
            felpaPorHoja = (4 * altura) + (4 * ancho);
        }
        
        const totalCorredizas = felpaPorHoja * corredizas * mult;
        totalFelpaCm += totalCorredizas;
        detalles.push({
            tipo: 'CORREDIZA',
            cantidad: corredizas * mult,
            valorCm: felpaPorHoja,
            totalCm: totalCorredizas
        });
    }
    
    // ========== FIJAS ==========
    function calcularFelpaFija(altura, anchoInfFija, anchoSupFija, modelo, hayDescuadreAltura, hayDescuadreAncho, alturaIzqVal, alturaDerVal) {
        if (modelo === 'NINGUNA') return 0;
        
        if (modelo === '1PARANTE') {
            // Solo 2 felpas en ese parante
            if (hayDescuadreAltura) {
                return alturaIzqVal + alturaDerVal;
            } else {
                return 2 * altura;
            }
        } else { // 4 LADOS
            if (hayDescuadreAncho) {
                // (4 × altura) + (2 × ancho_inf) + (2 × ancho_sup)
                return (4 * altura) + (2 * anchoInfFija) + (2 * anchoSupFija);
            } else {
                // (4 × altura) + (4 × ancho)
                return (4 * altura) + (4 * anchoInfFija);
            }
        }
    }
    
    // Fija izquierda
    if (tieneFijaIzq) {
        let altura = hayDescuadreAlturas ? alturaFijaIzq : alturaFijaBase;
        let felpa = calcularFelpaFija(
            altura, anchoFija, anchoFijaSup, modeloFija,
            hayDescuadreAlturas, hayDescuadreAnchos, alturaFijaIzq, alturaFijaDer
        );
        let total = felpa * 1 * mult;
        totalFelpaCm += total;
        detalles.push({
            tipo: 'FIJA IZQUIERDA',
            cantidad: 1 * mult,
            valorCm: felpa,
            totalCm: total
        });
    }
    
    // Fija derecha
    if (tieneFijaDer) {
        let altura = hayDescuadreAlturas ? alturaFijaDer : alturaFijaBase;
        let felpa = calcularFelpaFija(
            altura, anchoFija, anchoFijaSup, modeloFija,
            hayDescuadreAlturas, hayDescuadreAnchos, alturaFijaIzq, alturaFijaDer
        );
        let total = felpa * 1 * mult;
        totalFelpaCm += total;
        detalles.push({
            tipo: 'FIJA DERECHA',
            cantidad: 1 * mult,
            valorCm: felpa,
            totalCm: total
        });
    }
    
    return {
        totalMetros: totalFelpaCm / 100,
        totalCm: totalFelpaCm,
        detalles: detalles
    };
}

// ========== CALCULAR BURLETE CUÑA ==========
function calcularBurleteCuna() {
    const anchoInf = parseFloat(document.getElementById('ancho_inf_s80').value) || 0;
    const anchoSup = parseFloat(document.getElementById('ancho_sup_s80').value) || 0;
    const altIzq = parseFloat(document.getElementById('alt_izq_s80').value) || 0;
    const altDer = parseFloat(document.getElementById('alt_der_s80').value) || 0;
    const hojas = parseInt(document.getElementById('cant_hojas_s80').value) || 2;
    const fijas = parseInt(document.getElementById('cant_fijas_s80').value) || 0;
    const cantidadPedido = parseInt(document.getElementById('cantidad').value) || 1;
    
    const hayDescuadreAlturas = Math.abs(altIzq - altDer) > 0.6 && altIzq > 0 && altDer > 0;
    const hayDescuadreAnchos = Math.abs(anchoInf - anchoSup) > 0.6 && anchoInf > 0 && anchoSup > 0;
    const alturaTotal = Math.max(altIzq, altDer);
    
    let alturaCorredizaBase = alturaTotal > 0 ? alturaTotal - 5.5 : 0;
    let alturaFija = alturaTotal > 0 ? alturaTotal - 0.5 : 0;
    if ((hojas === 2 && fijas === 1) || (hojas === 4 && fijas === 2)) alturaFija = alturaCorredizaBase;
    
    let alturaFijaIzq = alturaFija, alturaFijaDer = alturaFija;
    let alturaCorredizaIzq = alturaCorredizaBase, alturaCorredizaDer = alturaCorredizaBase;
    
    if (hayDescuadreAlturas && alturaTotal > 0) {
        let fijaIzqBase = altIzq - 0.5, fijaDerBase = altDer - 0.5;
        let corrIzqBase = altIzq - 5.5, corrDerBase = altDer - 5.5;
        if ((hojas === 2 && fijas === 1) || (hojas === 4 && fijas === 2)) {
            fijaIzqBase = corrIzqBase;
            fijaDerBase = corrDerBase;
        }
        alturaFijaIzq = fijaIzqBase;
        alturaFijaDer = fijaDerBase;
        alturaCorredizaIzq = corrIzqBase;
        alturaCorredizaDer = corrDerBase;
    }
    
    let anchoHoja = 0, anchoFija = 0;
    if (anchoInf > 0 && hojas > 0) {
        const anchos = calcularAnchosHojas(anchoInf, hojas, fijas);
        anchoHoja = anchos.corrediza;
        anchoFija = anchos.fija;
    }
    
    let tieneFijaIzq = false, tieneFijaDer = false;
    if (hojas === 2 && fijas === 1) tieneFijaIzq = true;
    else if (hojas === 3 && fijas === 1) tieneFijaIzq = true;
    else if (hojas === 4 && fijas === 1) tieneFijaIzq = true;
    else if (hojas === 4 && fijas === 2) { tieneFijaIzq = true; tieneFijaDer = true; }
    else if (hojas === 6 && fijas === 2) { tieneFijaIzq = true; tieneFijaDer = true; }
    else if (hojas === 8 && fijas === 2) { tieneFijaIzq = true; tieneFijaDer = true; }
    
    const corredizas = hojas - fijas;
    const mult = cantidadPedido;
    let totalBurleteCm = 0;
    const detalles = [];
    
    function burletePorVidrio(alturaHoja, anchoHojaVal, anchoSupHoja) {
        const altoVidrio = alturaHoja - 13.4;
        const anchoInfVidrio = anchoHojaVal - 13.4;
        const anchoSupVidrio = anchoSupHoja - 13.4;
        if (hayDescuadreAnchos && anchoSupHoja !== anchoHojaVal) {
            return (2 * altoVidrio + anchoInfVidrio + anchoSupVidrio) * 2;
        } else {
            return (2 * altoVidrio + 2 * anchoInfVidrio) * 2;
        }
    }
    
    if (corredizas > 0) {
        let altura = hayDescuadreAlturas ? alturaCorredizaIzq : alturaCorredizaBase;
        let burlete = burletePorVidrio(altura, anchoHoja, anchoHoja);
        let total = burlete * corredizas * mult;
        totalBurleteCm += total;
        detalles.push({ tipo: 'CORREDIZA', cantidad: corredizas * mult, valorCm: burlete, totalCm: total });
    }
    
    if (tieneFijaIzq) {
        let altura = hayDescuadreAlturas ? alturaFijaIzq : alturaFija;
        let burlete = burletePorVidrio(altura, anchoFija, anchoFija);
        let total = burlete * 1 * mult;
        totalBurleteCm += total;
        detalles.push({ tipo: 'FIJA IZQUIERDA', cantidad: 1 * mult, valorCm: burlete, totalCm: total });
    }
    
    if (tieneFijaDer) {
        let altura = hayDescuadreAlturas ? alturaFijaDer : alturaFija;
        let burlete = burletePorVidrio(altura, anchoFija, anchoFija);
        let total = burlete * 1 * mult;
        totalBurleteCm += total;
        detalles.push({ tipo: 'FIJA DERECHA', cantidad: 1 * mult, valorCm: burlete, totalCm: total });
    }
    
    if (hojas === 1 && fijas === 1 && anchoFija > 0) {
        let burlete = burletePorVidrio(alturaFija, anchoFija, anchoFija);
        let total = burlete * 1 * mult;
        totalBurleteCm += total;
        detalles.push({ tipo: 'FIJA UNICA', cantidad: 1 * mult, valorCm: burlete, totalCm: total });
    }
    
    return { totalMetros: totalBurleteCm / 100, totalCm: totalBurleteCm, detalles: detalles };
}

// ========== RENDERIZAR TIRAS REQUERIDAS ==========
function renderTirasRequeridas() {
    const contenedor = document.getElementById('lista_tiras_req_body_s80');
    if (!contenedor) return;
    
    const felpa = calcularFelpaHermetik();
    const burlete = calcularBurleteCuna();
    
    let html = '';
    
    html += `<li class="list-group-item bg-dark border-bottom border-info"><div class="d-flex justify-content-between"><span class="text-info fw-bold">🔹 FELPA HERMETIK</span><span class="badge bg-info">Total: ${felpa.totalMetros.toFixed(2)} m</span></div></li>`;
    felpa.detalles.forEach(d => {
        html += `<li class="list-group-item d-flex align-items-center py-2">
            <div class="col-5"><span class="text-white">${d.tipo}</span></div>
            <div class="col-3 text-center"><span class="text-info">${(d.valorCm / 100).toFixed(2)} m/hoja</span></div>
            <div class="col-2 text-center"><span class="badge bg-warning text-dark">x ${d.cantidad}</span></div>
            <div class="col-2 text-end text-success fw-bold">${(d.totalCm / 100).toFixed(2)} m</div>
        </li>`;
    });
    html += `<li class="list-group-item d-flex justify-content-between bg-dark"><span class="text-warning">SUBTOTAL FELPA:</span><span class="text-white fw-bold">${felpa.totalMetros.toFixed(2)} m</span></li>`;
    
    html += `<li class="list-group-item bg-dark border-bottom border-info mt-2"><div class="d-flex justify-content-between"><span class="text-info fw-bold">🔸 BURLETE CUÑA</span><span class="badge bg-info">Total: ${burlete.totalMetros.toFixed(2)} m</span></div></li>`;
    burlete.detalles.forEach(d => {
        html += `<li class="list-group-item d-flex align-items-center py-2">
            <div class="col-5"><span class="text-white">${d.tipo}</span></div>
            <div class="col-3 text-center"><span class="text-info">${(d.valorCm / 100).toFixed(2)} m/vidrio</span></div>
            <div class="col-2 text-center"><span class="badge bg-warning text-dark">x ${d.cantidad}</span></div>
            <div class="col-2 text-end text-success fw-bold">${(d.totalCm / 100).toFixed(2)} m</div>
        </li>`;
    });
    html += `<li class="list-group-item d-flex justify-content-between bg-dark"><span class="text-warning">SUBTOTAL BURLETE:</span><span class="text-white fw-bold">${burlete.totalMetros.toFixed(2)} m</span></li>`;
    
    const totalGeneral = felpa.totalMetros + burlete.totalMetros;
    html += `<li class="list-group-item d-flex justify-content-between align-items-center mt-2 border-top border-warning bg-dark">
        <span class="text-warning fw-bold">📏 TOTAL TIRAS (FELPA + BURLETE):</span>
        <span class="h5 text-white mb-0">${totalGeneral.toFixed(2)} m</span>
    </li>`;
    
        contenedor.innerHTML = html;
    
    // Actualizar resumen si está visible
    const switchResumen = document.getElementById('switch_resumen_s80');
    if (switchResumen && switchResumen.checked) {
        renderResumenS80();
    }
}
// ========== MOSTRAR MEDIDAS GENERALES ==========
function mostrarMedidasGenerales() {
    const contenedor = document.getElementById('lista_cortes_detallada_s80');
    if (!contenedor) return;
    
    // Obtener valores actuales
    const anchoInf = parseFloat(document.getElementById('ancho_inf_s80').value) || 0;
    const anchoSup = parseFloat(document.getElementById('ancho_sup_s80').value) || 0;
    const altIzq = parseFloat(document.getElementById('alt_izq_s80').value) || 0;
    const altDer = parseFloat(document.getElementById('alt_der_s80').value) || 0;
    const hojas = parseInt(document.getElementById('cant_hojas_s80').value) || 2;
    const fijas = parseInt(document.getElementById('cant_fijas_s80').value) || 0;
    const corredizas = hojas - fijas;
    const cantidadPedido = parseInt(document.getElementById('cantidad').value) || 1;
    
    // Detectar descuadres
    const hayDescuadreAlturas = Math.abs(altIzq - altDer) > 0.6 && altIzq > 0 && altDer > 0;
    const hayDescuadreAnchos = Math.abs(anchoInf - anchoSup) > 0.6 && anchoInf > 0 && anchoSup > 0;
    
    // Calcular alturas base
    const alturaTotal = Math.max(altIzq, altDer);
    const alturaFijaBase = alturaTotal > 0 ? alturaTotal - 0.5 : 0;
    const alturaCorredizaBase = alturaTotal > 0 ? alturaTotal - 5.5 : 0;
    
    // Aplicar regla especial para fijas
    let alturaFija = alturaFijaBase;
    if (hojas === 2 && fijas === 1) {
        alturaFija = alturaCorredizaBase;
    } else if (hojas === 4 && fijas === 2) {
        alturaFija = alturaCorredizaBase;
    }
    
    // Alturas con descuadre (aplicando misma regla)
    let alturaFijaIzq = alturaFija;
    let alturaFijaDer = alturaFija;
    let alturaCorredizaIzq = alturaCorredizaBase;
    let alturaCorredizaDer = alturaCorredizaBase;
    
    if (hayDescuadreAlturas && alturaTotal > 0) {
        let fijaIzqBase = altIzq - 0.5;
        let fijaDerBase = altDer - 0.5;
        let corrIzqBase = altIzq - 5.5;
        let corrDerBase = altDer - 5.5;
        
        if (hojas === 2 && fijas === 1) {
            fijaIzqBase = corrIzqBase;
            fijaDerBase = corrDerBase;
        } else if (hojas === 4 && fijas === 2) {
            fijaIzqBase = corrIzqBase;
            fijaDerBase = corrDerBase;
        }
        
        alturaFijaIzq = fijaIzqBase;
        alturaFijaDer = fijaDerBase;
        alturaCorredizaIzq = corrIzqBase;
        alturaCorredizaDer = corrDerBase;
    }
    
        // Anchos por hoja
    let anchoHojaInf = 0;
    let anchoHojaSup = 0;
    if (anchoInf > 0 && hojas > 0) {
        const anchosInf = calcularAnchosHojas(anchoInf, hojas, fijas);
        anchoHojaInf = anchosInf.corrediza;
        
        if (hayDescuadreAnchos && anchoSup > 0) {
            const anchosSup = calcularAnchosHojas(anchoSup, hojas, fijas);
            anchoHojaSup = anchosSup.corrediza;
        } else {
            anchoHojaSup = anchoHojaInf;
        }
    }
    
    // Determinar distribución de fijas (izquierda y/o derecha)
    let tieneFijaIzq = false;
    let tieneFijaDer = false;
    
    if (hojas === 1 && fijas === 1) {
        tieneFijaIzq = true;
    } else if (hojas === 2 && fijas === 1) {
        tieneFijaIzq = true;
    } else if (hojas === 3 && fijas === 1) {
        tieneFijaIzq = true;
    } else if (hojas === 4 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
    } else if (hojas === 6 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
    } else if (hojas === 8 && fijas === 2) {
        tieneFijaIzq = true;
        tieneFijaDer = true;
    }
    
    // Calcular traslape central
    let traslapeCentral = 0;
    if (hojas === 3) traslapeCentral = 1;
    else if (hojas === 6) traslapeCentral = 2;
    else if (hojas === 8) traslapeCentral = 4;
    else if (hojas === 4 && fijas === 1) traslapeCentral = 1;
    
    // Calcular adaptador
    let adaptador = 0;
    if (hojas >= 4 && !(hojas === 4 && fijas === 1)) {
        adaptador = 1;
    }
    
    // Multiplicar por cantidad del pedido
    const mult = cantidadPedido;
    
    // ========== GENERAR LAS 21 LÍNEAS ==========
    const items = [];
    let contador = 0;
    
    // ========== DETERMINAR QUÉ MARCO SEGÚN MODELO ==========
// Modelos que usan MARCO DOBLE (items 1-4)
const modelosMarcoDoble = ['CC', 'FC', 'FCC', 'CCCC', 'FCCF', 'FCCCCF'];
// Modelos que usan MARCO TRIPLE (items 5-8)
const modelosMarcoTriple = ['CCC', 'FCCC', 'CCCCCC'];

// Determinar el modelo actual según hojas y fijas
let modeloActual = '';
if (hojas === 1 && fijas === 1) modeloActual = 'F';
else if (hojas === 2 && fijas === 0) modeloActual = 'CC';
else if (hojas === 2 && fijas === 1) modeloActual = 'FC';
else if (hojas === 3 && fijas === 0) modeloActual = 'CCC';
else if (hojas === 3 && fijas === 1) modeloActual = 'FCC';
else if (hojas === 4 && fijas === 0) modeloActual = 'CCCC';
else if (hojas === 4 && fijas === 1) modeloActual = 'FCCC';
else if (hojas === 4 && fijas === 2) modeloActual = 'FCCF';
else if (hojas === 6 && fijas === 0) modeloActual = 'CCCCCC';
else if (hojas === 6 && fijas === 2) modeloActual = 'FCCCCF';
else if (hojas === 8 && fijas === 2) modeloActual = 'FCCCCCCF';  // Triple pero inconcluso

// Calcular cantidades según modelo
let cantidadMarcoDoble = modelosMarcoDoble.includes(modeloActual) ? (1 * mult) : 0;
let cantidadMarcoTriple = modelosMarcoTriple.includes(modeloActual) ? (1 * mult) : 0;

// 1-4. MARCO DOBLE (8001)
contador++;
items.push({ num: contador, nombre: 'MARCO DOBLE', codigo: '8001', medida: anchoInf, cantidad: cantidadMarcoDoble });

contador++;
items.push({ num: contador, nombre: 'MARCO DOBLE', codigo: '8001', medida: hayDescuadreAnchos ? anchoSup : anchoInf, cantidad: cantidadMarcoDoble });

contador++;
items.push({ num: contador, nombre: 'MARCO DOBLE', codigo: '8001', medida: altIzq, cantidad: cantidadMarcoDoble });

contador++;
items.push({ num: contador, nombre: 'MARCO DOBLE', codigo: '8001', medida: hayDescuadreAlturas ? altDer : altIzq, cantidad: cantidadMarcoDoble });

// 5-8. MARCO TRIPLE (8002)
contador++;
items.push({ num: contador, nombre: 'MARCO TRIPLE', codigo: '8002', medida: anchoInf, cantidad: cantidadMarcoTriple });

contador++;
items.push({ num: contador, nombre: 'MARCO TRIPLE', codigo: '8002', medida: hayDescuadreAnchos ? anchoSup : anchoInf, cantidad: cantidadMarcoTriple });

contador++;
items.push({ num: contador, nombre: 'MARCO TRIPLE', codigo: '8002', medida: altIzq, cantidad: cantidadMarcoTriple });

contador++;
items.push({ num: contador, nombre: 'MARCO TRIPLE', codigo: '8002', medida: hayDescuadreAlturas ? altDer : altIzq, cantidad: cantidadMarcoTriple });
    
    // 9. Parante de corrediza
    contador++;
    items.push({ num: contador, nombre: 'PARANTE CORREDIZA', codigo: '8005', medida: hayDescuadreAlturas ? alturaCorredizaIzq : alturaCorredizaBase, cantidad: (corredizas * 2) * mult });
    
    // 10. Marco inf corrediza
    contador++;
    items.push({ num: contador, nombre: 'MARCO INF CORREDIZA', codigo: '8005', medida: anchoHojaInf, cantidad: corredizas * mult });
    
    // 11. Marco sup corrediza
    contador++;
    items.push({ num: contador, nombre: 'MARCO SUP CORREDIZA', codigo: '8005', medida: anchoHojaSup, cantidad: corredizas * mult });
    
    // 12. Parante fija izquierda
    contador++;
    items.push({ num: contador, nombre: 'PARANTE FIJA IZQUIERDA', codigo: '8005', medida: hayDescuadreAlturas ? alturaFijaIzq : alturaFija, cantidad: tieneFijaIzq ? 2 * mult : 0 });
    
    // 13. Parante fija derecha
    contador++;
    items.push({ num: contador, nombre: 'PARANTE FIJA DERECHA', codigo: '8005', medida: hayDescuadreAlturas ? alturaFijaDer : alturaFija, cantidad: tieneFijaDer ? 2 * mult : 0 });
    
        // Calcular anchos para fijas
    let anchoFijaInf = anchoHojaInf;
    let anchoFijaSup = anchoHojaSup;
    if (fijas > 0 && ((hojas === 3 && fijas === 1) || (hojas === 4 && fijas === 1) || (hojas === 4 && fijas === 2) || (hojas === 6 && fijas === 2) || (hojas === 8 && fijas === 2))) {
        if (anchoInf > 0 && hojas > 0) {
            const anchosFija = calcularAnchosHojas(anchoInf, hojas, fijas);
            anchoFijaInf = anchosFija.fija;
            if (hayDescuadreAnchos && anchoSup > 0) {
                const anchosFijaSup = calcularAnchosHojas(anchoSup, hojas, fijas);
                anchoFijaSup = anchosFijaSup.fija;
            } else {
                anchoFijaSup = anchoFijaInf;
            }
        }
    }
        // 14. Marco inf fija izquierda
    contador++;
    items.push({ num: contador, nombre: 'MARCO INF FIJA IZQ', codigo: '8005', medida: anchoFijaInf, cantidad: tieneFijaIzq ? 1 * mult : 0 });
    
    // 15. Marco sup fija izquierda
    contador++;
    items.push({ num: contador, nombre: 'MARCO SUP FIJA IZQ', codigo: '8005', medida: anchoFijaSup, cantidad: tieneFijaIzq ? 1 * mult : 0 });
    
    // 16. Marco inf fija derecha
    contador++;
    items.push({ num: contador, nombre: 'MARCO INF FIJA DER', codigo: '8005', medida: anchoFijaInf, cantidad: tieneFijaDer ? 1 * mult : 0 });
    
    // 17. Marco sup fija derecha
    contador++;
    items.push({ num: contador, nombre: 'MARCO SUP FIJA DER', codigo: '8005', medida: anchoFijaSup, cantidad: tieneFijaDer ? 1 * mult : 0 });
    
        // 18. Traslape de fija
    let traslapeFija = 0;
    if (hojas > 1 && fijas > 0) {
        traslapeFija = fijas * mult;
    }
    contador++;
    items.push({ num: contador, nombre: 'TRASLAPE FIJA', codigo: '8003', medida: hayDescuadreAlturas ? alturaFija : alturaFija, cantidad: traslapeFija });
    
    // 19. Traslape de corrediza
    contador++;
    items.push({ num: contador, nombre: 'TRASLAPE CORREDIZA', codigo: '8003', medida: hayDescuadreAlturas ? alturaCorredizaBase : alturaCorredizaBase, cantidad: corredizas * mult });
    
    // 20. Traslape central
    contador++;
    items.push({ num: contador, nombre: 'TRASLAPE CENTRAL', codigo: '8003', medida: hayDescuadreAlturas ? alturaCorredizaBase : alturaCorredizaBase, cantidad: traslapeCentral * mult });
    
    // 21. Adaptador de hoja
    contador++;
    items.push({ num: contador, nombre: 'ADAPTADOR DE HOJA', codigo: '8004', medida: hayDescuadreAlturas ? alturaCorredizaBase : alturaCorredizaBase, cantidad: adaptador * mult });
    
    // ========== RENDERIZAR HTML ==========
    let html = '';
    items.forEach(item => {
        const medidaText = item.medida > 0 ? item.medida.toFixed(1) : '0.0';
        html += `
            <li class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong class="text-white">${item.num}. ${item.nombre}</strong>
                        <br>
                        <span class="codigo-resaltado" style="font-size: 0.8rem;">${item.codigo}</span>
                    </div>
                    <div class="text-end">
                        <div class="corte-medida">${medidaText} cm x ${item.cantidad}</div>
                    </div>
                </div>
            </li>
        `;
    });
    
    contenedor.innerHTML = html;
}
// ========== CALCULAR ALUMINIOS REQUERIDOS ==========
function calcularAluminiosRequeridos() {
    if (!configuracionCompleta) return [];
    
    // Obtener valores actuales
    const anchoInf = parseFloat(document.getElementById('ancho_inf_s80').value) || 0;
    const anchoSup = parseFloat(document.getElementById('ancho_sup_s80').value) || 0;
    const altIzq = parseFloat(document.getElementById('alt_izq_s80').value) || 0;
    const altDer = parseFloat(document.getElementById('alt_der_s80').value) || 0;
    const hojas = parseInt(document.getElementById('cant_hojas_s80').value) || 2;
    const fijas = parseInt(document.getElementById('cant_fijas_s80').value) || 0;
    const corredizas = hojas - fijas;
    
    const perfiles = configuracionCompleta.serie80?.perfiles || [];
    
    // Calcular alturas base
    const alturaTotal = Math.max(altIzq, altDer);
    const alturaFijaBase = alturaTotal > 0 ? alturaTotal - 0.5 : 0;
    const alturaCorredizaBase = alturaTotal > 0 ? alturaTotal - 5.5 : 0;
    
    // Aplicar regla especial para fijas
    let alturaFija = alturaFijaBase;
    if (hojas === 2 && fijas === 1) {
        alturaFija = alturaCorredizaBase;
    } else if (hojas === 4 && fijas === 2) {
        alturaFija = alturaCorredizaBase;
    }
    
    // Detectar descuadres
    const hayDescuadreAlturas = Math.abs(altIzq - altDer) > 0.6 && altIzq > 0 && altDer > 0;
    const hayDescuadreAnchos = Math.abs(anchoInf - anchoSup) > 0.6 && anchoInf > 0 && anchoSup > 0;
    
    // Calcular ancho por hoja
    let anchoPorHoja = 0;
    let anchoPorHojaArriba = 0;
    let anchoPorHojaAbajo = 0;
    
    if (anchoInf > 0 && hojas > 0) {
        anchoPorHojaAbajo = (anchoInf / hojas) + 1.5;
        anchoPorHojaAbajo = Math.round(anchoPorHojaAbajo * 10) / 10;
        
        if (hayDescuadreAnchos && anchoSup > 0) {
            anchoPorHojaArriba = (anchoSup / hojas) + 1.5;
            anchoPorHojaArriba = Math.round(anchoPorHojaArriba * 10) / 10;
        } else {
            anchoPorHojaArriba = anchoPorHojaAbajo;
        }
        anchoPorHoja = anchoPorHojaAbajo;
    }
    
    // ========== 1. MARCO DOBLE O TRIPLE ==========
    let marcoTipo = 'Doble';
    let marcoPerfil = '';
    let marcoMedidas = [];
    
    if (hojas === 3 && fijas === 0) {
        marcoTipo = 'Triple';
    } else if (hojas === 6 && fijas === 0) {
        marcoTipo = 'Triple';
    } else if (hojas === 1) {
        marcoTipo = 'Ninguno';
    } else {
        marcoTipo = 'Doble';
    }
    
    if (marcoTipo !== 'Ninguno') {
        marcoPerfil = marcoTipo === 'Doble' ? 'Marco doble' : 'Marco triple';
        
        if (hayDescuadreAnchos || hayDescuadreAlturas) {
            if (anchoInf > 0) marcoMedidas.push({ medida: anchoInf, cantidad: 1 });
            if (anchoSup > 0 && hayDescuadreAnchos) marcoMedidas.push({ medida: anchoSup, cantidad: 1 });
            else if (anchoInf > 0 && !hayDescuadreAnchos) marcoMedidas.push({ medida: anchoInf, cantidad: 2 });
            
            if (altIzq > 0) marcoMedidas.push({ medida: altIzq, cantidad: 1 });
            if (altDer > 0 && hayDescuadreAlturas) marcoMedidas.push({ medida: altDer, cantidad: 1 });
            else if (altIzq > 0 && !hayDescuadreAlturas) marcoMedidas.push({ medida: altIzq, cantidad: 2 });
        } else {
            if (anchoInf > 0) marcoMedidas.push({ medida: anchoInf, cantidad: 2 });
            if (altIzq > 0) marcoMedidas.push({ medida: altIzq, cantidad: 2 });
        }
    }
    
    // ========== 2. MARCO DE HOJA ==========
    let marcosHoja = [];
    let distribucion = [];
    
    if (hojas === 1) {
        distribucion = ['F'];
    } else if (hojas === 2) {
        distribucion = fijas === 1 ? ['F', 'C'] : ['C', 'C'];
    } else if (hojas === 3) {
        distribucion = ['F', 'C', 'C'];
    } else if (hojas === 4) {
        distribucion = fijas === 2 ? ['F', 'C', 'C', 'F'] : ['C', 'C', 'C', 'C'];
    } else if (hojas === 6) {
        distribucion = ['F', 'C', 'C', 'C', 'C', 'F'];
    } else if (hojas === 8) {
        distribucion = ['F', 'C', 'C', 'C', 'C', 'C', 'C', 'F'];
    }
    
    for (let i = 0; i < distribucion.length; i++) {
        const esFija = distribucion[i] === 'F';
        const alturaHoja = esFija ? alturaFija : alturaCorredizaBase;
        
        if (hayDescuadreAnchos || hayDescuadreAlturas) {
            let alturaHIzq = alturaHoja;
            let alturaHDer = alturaHoja;
            
            if (hayDescuadreAlturas) {
                if (esFija) {
                    let fijaIzqBase = altIzq - 0.5;
                    let fijaDerBase = altDer - 0.5;
                    if (hojas === 2 && fijas === 1) {
                        fijaIzqBase = altIzq - 5.5;
                        fijaDerBase = altDer - 5.5;
                    } else if (hojas === 4 && fijas === 2) {
                        fijaIzqBase = altIzq - 5.5;
                        fijaDerBase = altDer - 5.5;
                    }
                    alturaHIzq = fijaIzqBase;
                    alturaHDer = fijaDerBase;
                } else {
                    alturaHIzq = altIzq - 5.5;
                    alturaHDer = altDer - 5.5;
                }
                alturaHIzq = Math.round(alturaHIzq * 10) / 10;
                alturaHDer = Math.round(alturaHDer * 10) / 10;
            }
            
                        // Determinar qué ancho usar para fijas
            let anchoArribaActual = anchoPorHojaArriba;
            let anchoAbajoActual = anchoPorHojaAbajo;
            let anchoActual = anchoPorHoja;
            
            if (esFija) {
                // Para fijas, usar anchoFija (calculado aparte)
                if (anchoInf > 0 && hojas > 0) {
                    const anchosFija = calcularAnchosHojas(anchoInf, hojas, fijas);
                    anchoAbajoActual = anchosFija.fija;
                    if (hayDescuadreAnchos && anchoSup > 0) {
                        const anchosFijaSup = calcularAnchosHojas(anchoSup, hojas, fijas);
                        anchoArribaActual = anchosFijaSup.fija;
                    } else {
                        anchoArribaActual = anchoAbajoActual;
                    }
                    anchoActual = anchoAbajoActual;
                }
            }
            
            marcosHoja.push({ tipo: esFija ? 'Fija' : 'Corrediza', medidas: [
                { medida: anchoArribaActual, cantidad: 1 },
                { medida: anchoAbajoActual, cantidad: 1 },
                { medida: alturaHIzq, cantidad: 1 },
                { medida: alturaHDer, cantidad: 1 }
            ] });
        } else {
            let anchoActual = anchoPorHoja;
            if (esFija) {
                if (anchoInf > 0 && hojas > 0) {
                    const anchosFija = calcularAnchosHojas(anchoInf, hojas, fijas);
                    anchoActual = anchosFija.fija;
                }
            }
            marcosHoja.push({ tipo: esFija ? 'Fija' : 'Corrediza', medidas: [
                { medida: anchoActual, cantidad: 2 },
                { medida: alturaHoja, cantidad: 2 }
            ] });
        }
    }
    
    // ========== 3. TRASLAPE ==========
    let traslapes = [];
    let traslapesFijas = 0;
    let traslapesCorredizas = 0;
    
    if (hojas === 2) {
        if (fijas === 1) { traslapesFijas = 1; traslapesCorredizas = 1; }
        else { traslapesCorredizas = 2; }
    } else if (hojas === 3) {
        if (fijas === 1) { traslapesFijas = 1; traslapesCorredizas = 3; }
        else { traslapesCorredizas = 4; }
    } else if (hojas === 4) {
        if (fijas === 2) { traslapesFijas = 2; traslapesCorredizas = 2; }
        else { traslapesCorredizas = 4; }
    } else if (hojas === 6) {
        traslapesFijas = 2;
        traslapesCorredizas = 6;
    } else if (hojas === 8) {
        traslapesFijas = 2;
        traslapesCorredizas = 10;
    }
    
    for (let i = 0; i < traslapesFijas; i++) {
        traslapes.push({ tipo: 'Fija', altura: alturaFija });
    }
    for (let i = 0; i < traslapesCorredizas; i++) {
        traslapes.push({ tipo: 'Corrediza', altura: alturaCorredizaBase });
    }
    
    // ========== 4. ADAPTADOR ==========
    let adaptador = null;
    if (hojas >= 4) {
        adaptador = { medida: alturaCorredizaBase, cantidad: 1 };
    }
    
    // ========== CONSTRUIR RESULTADOS ==========
    const resultados = [];
    
    if (marcoTipo !== 'Ninguno' && marcoPerfil) {
        const perfil = perfiles.find(p => p.n === marcoPerfil);
        if (perfil) {
            resultados.push({
                nombre: marcoPerfil,
                codigo: perfil.c,
                medidas: marcoMedidas,
                totalMetros: marcoMedidas.reduce((sum, m) => sum + (m.medida * m.cantidad), 0) / 100
            });
        }
    }
    
    const marcoHojaPerfil = perfiles.find(p => p.n === 'Marco de hoja');
    if (marcoHojaPerfil && marcosHoja.length > 0) {
        let totalMetrosMarcoHoja = 0;
        marcosHoja.forEach(mh => {
            totalMetrosMarcoHoja += mh.medidas.reduce((sum, m) => sum + (m.medida * m.cantidad), 0);
        });
        resultados.push({
            nombre: 'Marco de hoja',
            codigo: marcoHojaPerfil.c,
            medidas: null,
            totalMetros: totalMetrosMarcoHoja / 100,
            detalleHojas: marcosHoja
        });
    }
    
    const traslapePerfil = perfiles.find(p => p.n === 'Traslape');
    if (traslapePerfil && traslapes.length > 0) {
        let totalMetrosTraslape = 0;
        traslapes.forEach(t => {
            totalMetrosTraslape += t.altura;
        });
        resultados.push({
            nombre: 'Traslape',
            codigo: traslapePerfil.c,
            medidas: null,
            totalMetros: totalMetrosTraslape / 100,
            detalleTraslapes: traslapes
        });
    }
    
    const adaptadorPerfil = perfiles.find(p => p.n === 'Adaptador de hoja');
    if (adaptador && adaptadorPerfil) {
        resultados.push({
            nombre: 'Adaptador de hoja',
            codigo: adaptadorPerfil.c,
            medidas: [{ medida: adaptador.medida, cantidad: adaptador.cantidad }],
            totalMetros: adaptador.medida / 100
        });
    }
    
    return resultados;
}

// ========== MOSTRAR ALUMINIOS REQUERIDOS ==========
function mostrarAluminiosRequeridos() {
    // Primero generar medidas generales para tener datos actualizados
    mostrarMedidasGenerales();
    
    const contenedor = document.getElementById('lista_requeridos_body_s80');
    if (!contenedor) return;
    
    const perfiles = configuracionCompleta?.serie80?.perfiles || [];
    const agrupados = new Map();
    const listaCortes = document.getElementById('lista_cortes_detallada_s80');
    
    if (!listaCortes) {
        contenedor.innerHTML = '<li class="list-group-item text-center text-muted">No hay datos para mostrar</li>';
        return;
    }
    
    listaCortes.querySelectorAll('li').forEach(item => {
        const codigoSpan = item.querySelector('.codigo-resaltado');
        const nombreStrong = item.querySelector('strong');
        const medidaCantidad = item.querySelector('.corte-medida');
        
        if (!codigoSpan || !nombreStrong || !medidaCantidad) return;
        
        const codigo = codigoSpan.innerText.trim();
        const nombre = nombreStrong.innerText.trim();
        const texto = medidaCantidad.innerText;
        const match = texto.match(/(\d+(?:\.\d+)?)\s*cm\s*x\s*(\d+)/);
        
        if (!match) return;
        
        const medida = parseFloat(match[1]);
        const cantidad = parseInt(match[2]);
        
        if (cantidad < 1) return;
        
        const perfil = perfiles.find(p => p.c === codigo);
        if (!perfil) return;
        
        const clave = `${codigo}_${medida}`;
        
        if (agrupados.has(clave)) {
            agrupados.get(clave).cantidad += cantidad;
        } else {
            agrupados.set(clave, {
                codigo: codigo,
                nombre: nombre,
                medida: medida,
                cantidad: cantidad,
                precioUnitario: perfil.p
            });
        }
    });
    
    const itemsArray = Array.from(agrupados.values());
    
    itemsArray.forEach(item => {
        const numMatch = item.nombre.match(/^(\d+)\./);
        item.numero = numMatch ? parseInt(numMatch[1]) : 999;
    });
    itemsArray.sort((a, b) => a.numero - b.numero);
    
    if (itemsArray.length === 0) {
        contenedor.innerHTML = '<li class="list-group-item text-center text-muted">No hay aluminios requeridos</li>';
        return;
    }
    
    let html = '';
    let totalGeneral = 0;
    
    itemsArray.forEach(item => {
        const subtotal = (item.medida * item.cantidad / 100) * item.precioUnitario;
        totalGeneral += subtotal;
        
        html += `
            <li class="list-group-item d-flex align-items-center py-2">
                <div class="col-5">
                    <span class="badge bg-primary me-2" style="font-size: 0.65rem;">#${item.numero}</span>
                    <div class="text-uppercase fw-bold text-white small d-inline" style="font-size: 0.7rem;">
                        ${item.nombre.replace(/^\d+\.\s*/, '')}
                    </div>
                    <div class="small text-muted mt-1">
                        <span class="badge bg-secondary" style="font-family: monospace; font-size: 0.7rem;">Código: ${item.codigo}</span>
                    </div>
                </div>
                <div class="col-2 text-center text-info fw-bold">${item.medida.toFixed(1)} cm</div>
                <div class="col-2 text-center"><span class="badge bg-warning text-dark">x ${item.cantidad}</span></div>
                <div class="col-3 text-end text-success fw-bold">S/. ${subtotal.toFixed(2)}</div>
            </li>
        `;
    });
    
    html += `
        <li class="list-group-item d-flex justify-content-between align-items-center mt-2 border-top border-warning bg-dark">
            <span class="text-warning fw-bold">TOTAL ALUMINIOS:</span>
            <span class="h5 text-white mb-0">S/. ${totalGeneral.toFixed(2)}</span>
        </li>
    `;
    
        contenedor.innerHTML = html;
    
    // Actualizar resumen si está visible
    const switchResumen = document.getElementById('switch_resumen_s80');
    if (switchResumen && switchResumen.checked) {
        renderResumenS80();
    }
}
    
    // ========== VALIDAR ALTURA PUENTE ==========
    function validarAlturaPuente() {
        const altura = parseFloat(altPuente.value) || 0;
        const esInvalido = altura > 0 && altura < 10;
        validarColor(altPuente, esInvalido);
    }
    
    // ========== CALCULAR ESPACIOS DEL PUENTE ==========
    function calcularEspaciosPuente() {
        if (!incluirPuenteCheck.checked) {
            spIzq.value = "0.0";
            spDer.value = "0.0";
            return;
        }
        
        const hI = parseFloat(altIzq.value) || 0;
        const hD = parseFloat(altDer.value) || 0;
        const pVal = parseFloat(altPuente.value) || 0;
        const eRiel = parseFloat(espesor.value) || 1.6;
        
        spIzq.value = (hI > 0 && pVal > 0) ? Math.max(0, hI - pVal - eRiel).toFixed(1) : "0.0";
        spDer.value = (hD > 0 && pVal > 0) ? Math.max(0, hD - pVal - eRiel).toFixed(1) : "0.0";
    }
    
    // ========== VALIDAR TODO ==========
    function validarTodo() {
        validarMinimoAncho(anchoInf);
        validarMinimoAncho(anchoSup);
        validarMinimoAltura(altIzq);
        validarMinimoAltura(altDer);
        validarDiferenciaAnchos();
        validarDiferenciaAlturas();
        validarHojas();
    }
    // ========== ACTUALIZAR TODAS LAS SECCIONES ==========
function actualizarTodasSecciones() {
    // Aluminios requeridos
    mostrarAluminiosRequeridos();
    
    // Vidrios requeridos (siempre)
    renderVidriosRequeridos();
    
    // Accesorios requeridos (siempre)
    renderAccesoriosRequeridos();
    
    // Tiras requeridas (siempre)
    renderTirasRequeridas();
    
    // Resumen (solo si switch activo)
    const switchResumen = document.getElementById('switch_resumen_s80');
    if (switchResumen && switchResumen.checked) {
        renderResumenS80();
    }
}
    
    // ========== ACTUALIZAR TODO ==========
function actualizarTodo() {
    validarTodo();
    actualizarAnchoAuto();
    calcularEspaciosPuente();
    validarAlturaPuente();
    renderVistaPrevia();
    actualizarTodasSecciones();
}

    
    // ========== EVENTO ENTER PARA ALERTA ==========
    function manejarEnter(event) {
        if (event.key === 'Enter') {
            validarTodo();
            if (!validarDiferenciaAnchos() || !validarDiferenciaAlturas()) {
                mostrarAlerta('⚠️ Verifique las diferencias:\n- Alturas: máximo 1 cm (o un lado en 0)\n- Anchos: máximo 5 cm (o un lado en 0)');
            } else if (!validarMinimoAncho(anchoInf) || !validarMinimoAncho(anchoSup)) {
                mostrarAlerta('⚠️ Ancho mínimo: 40 cm');
            } else if (!validarMinimoAltura(altIzq) || !validarMinimoAltura(altDer)) {
                mostrarAlerta('⚠️ Altura mínima: 30 cm');
            } else if (!validarHojas()) {
                mostrarAlerta('⚠️ Hojas permitidas: 1, 2, 3, 4, 6 (8 en desarrollo)');
            }
        }
    }
    
    // ========== CONFIGURAR TOGGLE PUENTE ==========
    const btnToggle = document.getElementById('btn_toggle_vista_s80');
    const panelPuente = document.getElementById('seccion_puente_master_s80');
    if (btnToggle && panelPuente) {
        btnToggle.addEventListener('click', () => {
            panelPuente.classList.toggle('seccion-oculta');
        });
    }
    
    // ========== CONFIGURAR MODOS DEL PUENTE ==========
    const radioFijos = document.getElementById('radio_fijos_s80');
    const radioCorr = document.getElementById('radio_corr_s80');
    const configCorredizos = document.getElementById('config_corredizos_puente_s80');
    const configFijos = document.getElementById('config_fijos_puente_s80');
    
    if (radioFijos && radioCorr) {
        radioFijos.addEventListener('change', () => {
            if (radioFijos.checked) {
                configCorredizos.classList.add('seccion-oculta');
                configFijos.classList.remove('seccion-oculta');
            }
        });
        
        radioCorr.addEventListener('change', () => {
            if (radioCorr.checked) {
                configCorredizos.classList.remove('seccion-oculta');
                configFijos.classList.add('seccion-oculta');
            }
        });
    }
    
    // Botón sugerir fijos
    const btnSugerirFijos = document.getElementById('btn_sugerir_fijos_s80');
    if (btnSugerirFijos) {
        btnSugerirFijos.addEventListener('click', sugerirFijasSobreVentana);
    }
    
    // ========== ASIGNAR EVENTOS ==========
    anchoInf.addEventListener('input', () => {
        validarMinimoAncho(anchoInf);
        validarDiferenciaAnchos();
        sugerirHojasPorAncho();
        actualizarTodo();
    });
    
    anchoSup.addEventListener('input', () => {
        validarMinimoAncho(anchoSup);
        validarDiferenciaAnchos();
        actualizarTodo();
    });
    
    altIzq.addEventListener('input', () => {
        validarMinimoAltura(altIzq);
        validarDiferenciaAlturas();
        actualizarTodo();
    });
    
    altDer.addEventListener('input', () => {
        validarMinimoAltura(altDer);
        validarDiferenciaAlturas();
        actualizarTodo();
    });
    
    hojasInput.addEventListener('input', () => {
        validarHojas();
        sugerirFijasPorHojas();
        actualizarCorredizas();
        actualizarTodo();
    });
    
        fijasInput.addEventListener('input', () => {
        validarFijas();
        actualizarTodo();
    });
    
    incluirPuenteCheck.addEventListener('change', actualizarTodo);
    altPuente.addEventListener('input', () => {
        validarAlturaPuente();
        actualizarTodo();
    });
    espesor.addEventListener('input', actualizarTodo);
    
    hojasPuente.addEventListener('input', () => {
        actualizarCorrPuente();
        actualizarTodo();
    });
    fijosPuente.addEventListener('input', () => {
        actualizarCorrPuente();
        actualizarTodo();
    });
    
    // Evento Enter
    const inputs = [anchoInf, anchoSup, altIzq, altDer, hojasInput, fijasInput];
    inputs.forEach(input => {
        if (input) input.addEventListener('keypress', manejarEnter);
    });

        // ========== EVENTOS PARA ALUMINIOS REQUERIDOS ==========
    const switchReq = document.getElementById('switch_req_s80');
    if (switchReq) {
        switchReq.addEventListener('change', () => {
            const seccion = document.getElementById('resultados_requeridos_s80');
            if (seccion) {
                if (switchReq.checked) {
                    seccion.classList.remove('seccion-oculta');
                    mostrarAluminiosRequeridos();
                } else {
                    seccion.classList.add('seccion-oculta');
                }
            }
        });
    }
    
    // Actualizar requeridos cuando cambian las medidas
    const inputsParaRequeridos = [anchoInf, anchoSup, altIzq, altDer, hojasInput, fijasInput];
    inputsParaRequeridos.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                
                    mostrarAluminiosRequeridos();
                
            });
        }
    });
    
    // Nota: Serie 80 no tiene radios de estándar/pesado
        // ========== EVENTO PARA MEDIDAS GENERALES ==========
    const switchCortes = document.getElementById('switch_cortes_s80');
    if (switchCortes) {
        switchCortes.addEventListener('change', () => {
            const seccion = document.getElementById('resultados_cortes_s80');
            if (seccion) {
                if (switchCortes.checked) {
                    seccion.classList.remove('seccion-oculta');
                    mostrarMedidasGenerales();
                } else {
                    seccion.classList.add('seccion-oculta');
                }
            }
        });
    }
    
    // Actualizar medidas generales cuando cambian las medidas
    const inputsParaMedidas = [anchoInf, anchoSup, altIzq, altDer, hojasInput, fijasInput];
    inputsParaMedidas.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                if (switchCortes && switchCortes.checked) {
                    mostrarMedidasGenerales();
                }
            });
        }
    });
    
    // Eventos para vidrios requeridos
const switchVidriosReq = document.getElementById('switch_vidrios_req_s80');
if (switchVidriosReq) {
    switchVidriosReq.addEventListener('change', () => {
        const seccion = document.getElementById('resultados_vidrios_req_s80');
        if (seccion) {
            if (switchVidriosReq.checked) {
                seccion.classList.remove('seccion-oculta');
                renderVidriosRequeridos();
            } else {
                seccion.classList.add('seccion-oculta');
            }
        }
    });
}

// Actualizar vidrios cuando cambian las medidas
const inputsParaVidrios = [anchoInf, anchoSup, altIzq, altDer, hojasInput, fijasInput];
inputsParaVidrios.forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            if (switchVidriosReq && switchVidriosReq.checked) {
                renderVidriosRequeridos();
            }
        });
    }
});

// Nota: Serie 80 no tiene radios de estándar/pesado
// Eventos para accesorios requeridos
const switchAccesoriosReq = document.getElementById('switch_accesorios_req_s80');
if (switchAccesoriosReq) {
    switchAccesoriosReq.addEventListener('change', () => {
        const seccion = document.getElementById('resultados_accesorios_req_s80');
        if (seccion) {
            if (switchAccesoriosReq.checked) {
                seccion.classList.remove('seccion-oculta');
                renderAccesoriosRequeridos();
            } else {
                seccion.classList.add('seccion-oculta');
            }
        }
    });
}

// Eventos para tiras requeridas (FELPA + BURLETE)
const switchTirasReq = document.getElementById('switch_tiras_req_s80');
if (switchTirasReq) {
    switchTirasReq.addEventListener('change', () => {
        const seccion = document.getElementById('resultados_tiras_req_s80');
        if (seccion) {
            if (switchTirasReq.checked) {
                seccion.classList.remove('seccion-oculta');
                renderTirasRequeridas();
            } else {
                seccion.classList.add('seccion-oculta');
            }
        }
    });
}

// Actualizar tiras cuando cambian las medidas
const inputsParaTiras = [anchoInf, anchoSup, altIzq, altDer, hojasInput, fijasInput];
inputsParaTiras.forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            if (switchTirasReq && switchTirasReq.checked) {
                renderTirasRequeridas();
            }
        });
    }
});

// Actualizar accesorios cuando cambian las medidas
const inputsParaAccesorios = [anchoInf, anchoSup, altIzq, altDer, hojasInput, fijasInput];
inputsParaAccesorios.forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            if (switchAccesoriosReq && switchAccesoriosReq.checked) {
                renderAccesoriosRequeridos();
            }
        });
    }
});

// Nota: Serie 80 no tiene radios de estándar/pesado
// ========== RENDERIZAR RESUMEN DE PRODUCCIÓN ==========
// ========== RENDERIZAR RESUMEN DE PRODUCCIÓN (COMPACTO - estilo sistema) ==========
function renderResumenS80() {
    const contenedor = document.getElementById('contenedor_resumen_s80');
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
    
    const hojas = document.getElementById('cant_hojas_s80')?.value || '2';
    const fijas = document.getElementById('cant_fijas_s80')?.value || '0';
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
    const listaAluminios = document.getElementById('lista_requeridos_body_s80');
    if (listaAluminios) {
        let aluminiosTexto = '';
        
        listaAluminios.querySelectorAll('li').forEach(item => {
            if (item.classList.contains('border-top')) return;
            if (item.innerText.includes('TOTAL ALUMINIOS')) return;
            
            // Extraer código (badge bg-secondary)
            const codigoSpan = item.querySelector('.badge.bg-secondary');
            let codigo = codigoSpan ? codigoSpan.innerText.replace('Código:', '').trim() : '';
            
            // Extraer medida
            let medidaSpan = item.querySelector('.text-info.fw-bold');
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
                aluminiosTexto += linea + '\n';
                totalGeneral += subtotal;
            }
        });
        
        if (aluminiosTexto) {
            texto += '--- ALUMINIOS ---\n';
            texto += aluminiosTexto + '\n';
        }
    }
    
    // ========== VIDRIOS ==========
    const listaVidrios = document.getElementById('lista_vidrios_req_body_s80');
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
                let tipoAbrev = tipo;
                if (tipo === 'FIJA') tipoAbrev = 'F';
                else if (tipo === 'CORREDIZA') tipoAbrev = 'C';
                
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
    const listaAccesorios = document.getElementById('lista_accesorios_req_body_s80');
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
    const tirasConfig = configuracionCompleta?.serie80?.tiras || [];
    const precioFelpa = tirasConfig.find(t => t.n === 'felpa hermetik')?.p || 0;
    const precioBurlete = tirasConfig.find(t => t.n === 'burlete cuña S-80')?.p || 0;
    
    let totalFelpaMetros = 0;
    let totalBurleteMetros = 0;
    
    const listaTiras = document.getElementById('lista_tiras_req_body_s80');
    if (listaTiras) {
        listaTiras.querySelectorAll('li').forEach(item => {
            const textoItem = item.innerText;
            if (textoItem.includes('SUBTOTAL FELPA:')) {
                const match = textoItem.match(/(\d+(?:\.\d+)?)\s*m/);
                if (match) totalFelpaMetros = parseFloat(match[1]);
            }
            if (textoItem.includes('SUBTOTAL BURLETE:')) {
                const match = textoItem.match(/(\d+(?:\.\d+)?)\s*m/);
                if (match) totalBurleteMetros = parseFloat(match[1]);
            }
        });
    }
    
    let tirasTexto = '';
    if (totalFelpaMetros > 0) {
        const costo = totalFelpaMetros * precioFelpa;
        tirasTexto += `Felpa Hermetik         F-HER     ${totalFelpaMetros.toFixed(2)} m  S/. ${costo.toFixed(2)}\n`;
        totalGeneral += costo;
    }
    if (totalBurleteMetros > 0) {
        const costo = totalBurleteMetros * precioBurlete;
        tirasTexto += `Burlete Cuña           bu-3mm    ${totalBurleteMetros.toFixed(2)} m  S/. ${costo.toFixed(2)}\n`;
        totalGeneral += costo;
    }
    
    if (tirasTexto) {
        texto += '--- TIRAS ---\n';
        texto += tirasTexto + '\n';
    }
    
    // ========== TOTAL GENERAL ==========
    texto += `\nTOTAL GENERAL: S/. ${totalGeneral.toFixed(2)}\n`;
    
    contenedor.innerHTML = texto;
}

// ========== EVENTOS PARA RESUMEN ==========
const switchResumen = document.getElementById('switch_resumen_s80');
if (switchResumen) {
    switchResumen.addEventListener('change', () => {
        const seccion = document.getElementById('resultados_resumen_s80');
        if (seccion) {
            if (switchResumen.checked) {
                seccion.classList.remove('seccion-oculta');
                renderResumenS80();
            } else {
                seccion.classList.add('seccion-oculta');
            }
        }
    });
}

// Botón Refrescar (si existe)
const btnRefrescar = document.querySelector('#resultados_resumen_s80 .btn-outline-info');
if (btnRefrescar) {
    btnRefrescar.addEventListener('click', () => {
        renderResumenS80();
    });
}

// Botón Imprimir (si existe)
const btnImprimir = document.querySelector('#resultados_resumen_s80 .btn-outline-secondary');
if (btnImprimir) {
    btnImprimir.addEventListener('click', () => {
        const contenido = document.getElementById('contenedor_resumen_s80')?.innerText;
        if (!contenido) {
            alert('No hay datos para imprimir');
            return;
        }
        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resumen de Producción - Serie 80</title>
                <style>
                    body { font-family: monospace; font-size: 12px; margin: 20px; background-color: white; color: black; }
                    pre { white-space: pre-wrap; font-family: monospace; }
                </style>
            </head>
            <body>
                <pre>${contenido}</pre>
                <script>window.print();<\/script>
            </body>
            </html>
        `);
        ventana.document.close();
    });
}
    // ========== INICIALIZAR ==========
    console.log('Serie 80 inicializada - Validaciones activas');
    sugerirHojasPorAncho();
    actualizarCorredizas();
    actualizarAnchoAuto();
    actualizarCorrPuente();
    validarTodo();
        // ========== EXPORTAR FUNCIONES GLOBALMENTE ==========
    window.cargarCostosAluminios = cargarCostosAluminios;
    window.mostrarAluminiosRequeridos = mostrarAluminiosRequeridos;
    window.renderTirasRequeridas = renderTirasRequeridas;
    window.calcularFelpaHermetik = calcularFelpaHermetik;
    window.calcularBurleteCuna = calcularBurleteCuna;
    window.renderResumenS80 = renderResumenS80;
    window.seleccionarVidrioS80 = seleccionarVidrioS80;
    window.buscarVidrioS80 = buscarVidrioS80;
    window.mostrarListaVidriosS80 = mostrarListaVidriosS80;
    window.cargarCostosVidrios = cargarCostosVidrios;
}

// Nota: Serie 80 no tiene función setMaterialReqS80 (no hay estándar/pesado)
