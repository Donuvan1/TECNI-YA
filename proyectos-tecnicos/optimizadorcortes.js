let currentFocus = null;
let isNewInput = false;
const tableBody = document.querySelector("#piecesTable tbody");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 450; canvas.height = 450;

const sheetsContainer = document.getElementById("sheetsContainer");
const floatingNumpad = document.getElementById("floatingNumpad");

let solutions = [];
let currentSolution = 0;
let sheets = [];

const colorMap = new Map();
function getColorForPiece(w, h) {
    const dims = [w, h].sort((a, b) => a - b);
    const key = `${dims[0]}x${dims[1]}`;
    if (!colorMap.has(key)) {
        const hue = Math.floor(Math.random() * 360);
        colorMap.set(key, `hsl(${hue}, 70%, 75%)`);
    }
    return colorMap.get(key);
}

function setFocus(el) {
    if (currentFocus) currentFocus.classList.remove('active-cell');
    currentFocus = el;
    currentFocus.classList.add('active-cell');
    isNewInput = true;
    scrollToVisible(el);
}

function scrollToVisible(element) {
    const wrapper = document.querySelector('.table-wrapper');
    if (!wrapper) return;
    
    const elementRect = element.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    
    const isAbove = elementRect.top < wrapperRect.top;
    const isBelow = elementRect.bottom > wrapperRect.bottom;
    
    if (isAbove) {
        const scrollOffset = elementRect.top - wrapperRect.top - 20;
        wrapper.scrollTop += scrollOffset;
    } else if (isBelow) {
        const scrollOffset = elementRect.bottom - wrapperRect.bottom + 20;
        wrapper.scrollTop += scrollOffset;
    }
}

function showNumpad() {
    floatingNumpad.classList.remove('hidden');
}

function hideNumpad() {
    floatingNumpad.classList.add('hidden');
}

function pressNum(n) {
    if (!currentFocus) return;
    
    let currentValue = currentFocus.value;
    
    // Verificar si es campo de cantidad (qty)
    const isQtyField = currentFocus.classList && currentFocus.classList.contains('qty');
    
    // Si es un número (0-9)
    if (n >= '0' && n <= '9') {
        if (isNewInput || currentValue === '0') {
            currentFocus.value = n;
            isNewInput = false;
        } else {
            // Para campos que no son cantidad, verificar decimales
            if (!isQtyField && currentValue.includes('.')) {
                let partes = currentValue.split('.');
                if (partes.length === 2 && partes[1].length >= 1) {
                    return;
                }
            }
            currentFocus.value += n;
        }
    }
    // Si es punto decimal
    else if (n === '.') {
        // Si es campo de cantidad, NO permitir punto
        if (isQtyField) {
            return;
        }
        if (currentValue.includes('.')) return;
        if (isNewInput || currentValue === '' || currentValue === '0') {
            currentFocus.value = '0.';
        } else {
            currentFocus.value += '.';
        }
        isNewInput = false;
    }
    // Si es delete (borrar)
    else if (n === 'delete') {
        if (currentValue.length > 0) {
            currentFocus.value = currentValue.slice(0, -1);
            if (currentFocus.value === '') isNewInput = true;
        }
    }
    
    // Guardar en localStorage si existe la función
    if (typeof saveToLocal === 'function') saveToLocal();
    
    // Solo para optimizadorvarillas.js (guarda el código de la pieza)
    if (currentFocus.classList && currentFocus.classList.contains("p-name")) {
        lastPieceCode = currentFocus.value.trim().toUpperCase();
    }
}

function deleteLast() { 
    if (currentFocus) { 
        let val = currentFocus.value.toString();
        currentFocus.value = val.slice(0, -1);
        if (currentFocus.value === "") isNewInput = true;
    } 
}

function moveFocus(dir) {
    if (!currentFocus) return;
    const inputs = Array.from(document.querySelectorAll('.input-field'));
    let index = inputs.indexOf(currentFocus);
    if (dir === 'next') {
        if (index < inputs.length - 1) setFocus(inputs[index + 1]);
        else { 
            document.getElementById("addPiece").click();
            setTimeout(() => { 
                const newInputs = Array.from(document.querySelectorAll('.input-field'));
                if (index + 1 < newInputs.length) setFocus(newInputs[index + 1]);
            }, 50);
        }
    } else if (dir === 'prev' && index > 0) setFocus(inputs[index - 1]);
    else if (dir === 'up') {
        let newIndex = index - 3;
        if (newIndex >= 0) setFocus(inputs[newIndex]);
        else setFocus(inputs[0]);
    }
    else if (dir === 'down') {
        let newIndex = index + 3;
        if (newIndex < inputs.length) setFocus(inputs[newIndex]);
        else setFocus(inputs[inputs.length-1]);
    }
}

function setupNumpadEvents() {
    document.querySelectorAll('.num[data-num]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-num');
            if (val === 'delete') deleteLast();
            else pressNum(val);
        });
    });
    
    document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => {
            const nav = btn.getAttribute('data-nav');
            moveFocus(nav);
        });
    });
    
    const closeBtn = document.getElementById('closeNumpad');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            floatingNumpad.classList.add('hidden');
        });
    }
}

function bindNumpadToNumericFields() {
    document.addEventListener('focusin', (e) => {
        const target = e.target;
        if (target.classList && 
            target.classList.contains('input-field') && 
            !target.classList.contains('text-input')) {
            showNumpad();
        }
    });
}

document.addEventListener('click', (e) => { 
    if (e.target.classList && e.target.classList.contains('input-field')) {
        setFocus(e.target);
    }
});

document.getElementById("addPiece").onclick = () => {
    let row = document.createElement("tr");
    row.innerHTML = `<td><input type="checkbox" class="use-check" checked></td><td><input type="text" inputmode="numeric" class="input-field width" readonly></td><td><input type="text" inputmode="numeric" class="input-field height" readonly></td><td><input type="text" inputmode="numeric" class="input-field qty" readonly></td><td><button class="remove" onclick="this.parentElement.parentElement.remove()">×</button></td>`;
    tableBody.appendChild(row);
    saveToLocal();
    showNumpad();
    setTimeout(() => {
        const newRow = tableBody.lastChild;
        const widthField = newRow.querySelector('.width');
        if (widthField) setFocus(widthField);
    }, 50);
};

document.getElementById("optimize").onclick = () => {
    colorMap.clear();
    solutions = [];

    for (let strategy = 0; strategy < 8; strategy++) { 
        let result = runOptimization(strategy);
        solutions.push(result);
    }

    currentSolution = 0;
    loadSolution();
};

function runOptimization(strategy) {
    let sheetW = Number(document.getElementById("sheetWidth").value);
    let sheetH = Number(document.getElementById("sheetHeight").value);
    let pieces = [];
    
    document.querySelectorAll("#piecesTable tbody tr").forEach(row => {
        if (row.querySelector(".use-check").checked) {
            let w = Number(row.querySelector(".width").value);
            let h = Number(row.querySelector(".height").value);
            let q = Number(row.querySelector(".qty").value);
            
            for (let i = 0; i < q; i++) {
                let finalW = w, finalH = h;
                
                if (strategy === 1 && w > h) { finalW = h; finalH = w; } 
                else if (strategy === 2 && h > w) { finalW = h; finalH = w; }
                else if (strategy === 4 && Math.random() > 0.5) { finalW = h; finalH = w; }
                
                pieces.push({ w: finalW, h: finalH, area: finalW * finalH });
            }
        }
    });

    switch(strategy) {
    case 0: pieces.sort((a, b) => b.area - a.area); break;
    case 1: pieces.sort((a, b) => b.h - a.h || b.w - a.w); break; // Altura
    case 2: pieces.sort((a, b) => b.w - a.w || b.h - a.h); break; // Ancho
    case 3: pieces.sort((a, b) => (b.w + b.h) - (a.w + a.h)); break; // Suma
    case 4: pieces.sort(() => Math.random() - 0.5); break; // Aleatorio
    case 5: pieces.sort((a, b) => {
        let ratioA = Math.max(a.w, a.h) / Math.min(a.w, a.h);
        let ratioB = Math.max(b.w, b.h) / Math.min(b.w, b.h);
        return ratioB - ratioA; // Más alargadas primero
    }); break;
    case 6: pieces.sort((a, b) => (b.w + b.h) * 2 - (a.w + a.h) * 2); break; // Perímetro
    case 7: 
    // Estrategia: Apilamiento vertical (columnas de altura completa)
    pieces.sort((a, b) => b.h - a.h); // Ordenar por altura descendente
    // Forzar que la altura sea la que domine (rotar si es necesario)
    for (let p of pieces) {
        if (p.h < p.w) {
            // Rotar para que la altura sea la mayor dimensión
            let temp = p.w;
            p.w = p.h;
            p.h = temp;
        }
    }
    break;
}

    let currentSheets = [];
    pieces.forEach(piece => {
        let placed = false;
        for (let s = 0; s < currentSheets.length; s++) {
            if (placePieceBestFit(currentSheets[s], piece, strategy)) { placed = true; break; }
        }
        if (!placed) {
            let newSheet = { free: [{ x: 0, y: 0, w: sheetW, h: sheetH }], used: [] };
            placePieceBestFit(newSheet, piece, strategy);
            currentSheets.push(newSheet);
        }
    });
    return currentSheets;
}

function placePieceBestFit(sheet, piece, strategy) {
    let bestIdx = -1;
    let bestOri = { w: 0, h: 0 };
    let minWaste = Infinity;

    sheet.free.forEach((space, index) => {
        let oris = [{ w: piece.w, h: piece.h }];
        if (piece.w !== piece.h) oris.push({ w: piece.h, h: piece.w });

        oris.forEach(ori => {
            if (ori.w <= space.w && ori.h <= space.h) {
                let waste = (space.w * space.h) - (ori.w * ori.h);
                if (Math.abs(ori.w - space.w) < 1 || Math.abs(ori.h - space.h) < 1) {
                    waste -= 1000000;
                }
                if (waste < minWaste) {
                    minWaste = waste;
                    bestIdx = index;
                    bestOri = ori;
                }
            }
        });
    });

    if (bestIdx === -1) return false;

    let space = sheet.free[bestIdx];
    sheet.free.splice(bestIdx, 1);
    sheet.used.push({ x: space.x, y: space.y, w: bestOri.w, h: bestOri.h });

    let remW = space.w - bestOri.w;
    let remH = space.h - bestOri.h;
    let splitVertical = (remW > remH);

    if (splitVertical) {
        if (remW > 0) {
            sheet.free.push({
                x: space.x + bestOri.w,
                y: space.y,
                w: remW,
                h: space.h
            });
        }
        if (remH > 0) {
            sheet.free.push({
                x: space.x,
                y: space.y + bestOri.h,
                w: bestOri.w,
                h: remH
            });
        }
    } else {
        if (remH > 0) {
            sheet.free.push({
                x: space.x,
                y: space.y + bestOri.h,
                w: space.w,
                h: remH
            });
        }
        if (remW > 0) {
            sheet.free.push({
                x: space.x + bestOri.w,
                y: space.y,
                w: remW,
                h: bestOri.h
            });
        }
    }

    sheet.free.sort((a, b) => (a.y - b.y) || (a.x - b.x));
    return true;
}

function loadSolution() {
    if (!solutions || solutions.length === 0) return;

    let index = currentSolution;
    let attempts = 0;
    while ((!solutions[index] || solutions[index].length === 0) && attempts < solutions.length) {
        index = (index + 1) % solutions.length;
        attempts++;
    }

    if (!solutions[index] || solutions[index].length === 0) {
        sheetsContainer.innerHTML = "<p style='color:red'>No se pudo generar corte</p>";
        return;
    }

    currentSolution = index;
    sheets = solutions[currentSolution];

    document.getElementById("solutionIndex").innerText = currentSolution + 1;
    document.getElementById("sheetsNeeded").innerText = sheets.length;

    sheetsContainer.innerHTML = '';
    drawAllSheets();
}

function drawAllSheets() {
    if (!sheets || sheets.length === 0) return;
    
    sheets.forEach((sheet, index) => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.marginBottom = '15px';
        wrapper.style.background = '#fff';
        wrapper.style.padding = '5px';
        wrapper.style.borderRadius = '8px';

        const label = document.createElement('span');
        label.innerText = `Plancha ${index + 1}`;
        label.style.position = 'absolute';
        label.style.top = '5px';
        label.style.right = '8px';
        label.style.background = 'rgba(0,0,0,0.6)';
        label.style.color = '#fff';
        label.style.padding = '2px 8px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '11px';
        label.style.fontWeight = 'bold';
        wrapper.appendChild(label);

        const canvasEl = document.createElement('canvas');
        canvasEl.width = 450;
        canvasEl.height = 450;
        canvasEl.style.width = '100%';
        canvasEl.style.display = 'block';
        wrapper.appendChild(canvasEl);
        
        sheetsContainer.appendChild(wrapper);

        const currentCtx = canvasEl.getContext('2d');
        drawSingleSheet(currentCtx, sheet);
    });
}

function drawSingleSheet(targetCtx, sheet) {
    targetCtx.clearRect(0, 0, 450, 450);
    
    let sW = Number(document.getElementById("sheetWidth").value);
    let sH = Number(document.getElementById("sheetHeight").value);
    const offset = 35; 
    const infoHeight = 60; 
    let scale = Math.min((450 - 60) / sW, (450 - 60 - infoHeight) / sH);

    targetCtx.fillStyle = "#f1c40f"; 
    targetCtx.font = "bold 14px Arial"; 
    targetCtx.textAlign = "center";
    targetCtx.fillText(sW, offset + (sW * scale) / 2, offset - 12);
    targetCtx.save(); 
    targetCtx.translate(offset - 12, offset + (sH * scale) / 2); 
    targetCtx.rotate(-Math.PI / 2); 
    targetCtx.fillText(sH, 0, 0); 
    targetCtx.restore();

    sheet.free.forEach(f => {
        targetCtx.fillStyle = "rgba(0, 255, 255, 0.1)"; 
        targetCtx.fillRect(offset + f.x * scale, offset + f.y * scale, f.w * scale, f.h * scale);
        if (f.w * scale > 15 && f.h * scale > 10) {
            targetCtx.fillStyle = "#aaa"; 
            targetCtx.font = "italic 9px Arial";
            targetCtx.save();
            targetCtx.translate(offset + (f.x + f.w/2) * scale, offset + (f.y + f.h/2) * scale);
            if (f.w < f.h && (f.w * scale) < 25) { targetCtx.rotate(-Math.PI / 2); }
            targetCtx.fillText(`${f.w}x${f.h}`, 0, 4);
            targetCtx.restore();
        }
    });

    sheet.used.forEach(p => {
        targetCtx.fillStyle = getColorForPiece(p.w, p.h);
        targetCtx.fillRect(offset + p.x * scale, offset + p.y * scale, p.w * scale, p.h * scale);
        targetCtx.strokeStyle = "#000"; 
        targetCtx.strokeRect(offset + p.x * scale, offset + p.y * scale, p.w * scale, p.h * scale);
        
        if (p.w * scale > 15 && p.h * scale > 10) {
            targetCtx.fillStyle = "black"; 
            targetCtx.font = "bold 10px Arial";
            targetCtx.save();
            targetCtx.translate(offset + (p.x + p.w / 2) * scale, offset + (p.y + p.h / 2) * scale);
            if (p.w < p.h && (p.w * scale) < 30) { targetCtx.rotate(-Math.PI / 2); }
            targetCtx.fillText(`${p.w}x${p.h}`, 0, 4);
            targetCtx.restore();
        }
    });

    targetCtx.strokeStyle = "#fff"; 
    targetCtx.strokeRect(offset, offset, sW * scale, sH * scale);

    const cli = document.getElementById("clientName").value || "SIN NOMBRE";
    const vid = document.getElementById("glassType").value || "SIN TIPO";
    const fecha = new Date().toLocaleDateString();

    targetCtx.textAlign = "left";
    targetCtx.fillStyle = "#000"; 
    
    let yPos = offset + (sH * scale) + 25;

    targetCtx.font = "bold 12px Arial";
    targetCtx.fillText(`CLIENTE: ${cli.toUpperCase()}`, offset, yPos);
    
    targetCtx.font = "bold 12px Arial";
    targetCtx.fillText(`VIDRIO: ${vid.toUpperCase()}`, offset, yPos + 18);

    targetCtx.font = "italic 10px Arial";
    targetCtx.fillStyle = "#666"; 
    targetCtx.fillText(`FECHA: ${fecha}`, offset, yPos + 35);
}

document.getElementById("prevSolution").onclick = () => { 
    if (currentSolution > 0) { 
        currentSolution--; 
        loadSolution(); 
    } 
};
document.getElementById("nextSolution").onclick = () => { 
    if (currentSolution < solutions.length - 1) { 
        currentSolution++; 
        loadSolution(); 
    } 
};

function saveToLocal() {
    const pieces = [];
    document.querySelectorAll("#piecesTable tbody tr").forEach(row => {
        const w = row.querySelector(".width").value;
        const h = row.querySelector(".height").value;
        const q = row.querySelector(".qty").value;
        if (w || h || q) pieces.push({ w, h, q });
    });

    const data = {
        client: document.getElementById("clientName").value,
        glass: document.getElementById("glassType").value,
        sw: document.getElementById("sheetWidth").value,
        sh: document.getElementById("sheetHeight").value,
        pieces: pieces
    };
    localStorage.setItem('optimizador_data', JSON.stringify(data));
}

window.addEventListener('load', () => {
    setupNumpadEvents();
    bindNumpadToNumericFields();
    
    const saved = JSON.parse(localStorage.getItem('optimizador_data'));
    if(saved) {
        document.getElementById("clientName").value = saved.client || "";
        document.getElementById("glassType").value = saved.glass || "";
        document.getElementById("sheetWidth").value = saved.sw || 330;
        document.getElementById("sheetHeight").value = saved.sh || 214;
        
        if(saved.pieces && saved.pieces.length > 0) {
    tableBody.innerHTML = "";
    saved.pieces.forEach(p => {
        let row = document.createElement("tr");
        row.innerHTML = `<td><input type="checkbox" class="use-check" checked></td><td><input type="text" inputmode="numeric" class="input-field width" value="${p.w}" readonly></td><td><input type="text" inputmode="numeric" class="input-field height" value="${p.h}" readonly></td><td><input type="text" inputmode="numeric" class="input-field qty" value="${p.q}" readonly></td><td><button class="remove" onclick="this.parentElement.parentElement.remove()">×</button></td>`;
        tableBody.appendChild(row);
    });
}
    }
    
    if (tableBody.children.length === 0) {
        document.getElementById("addPiece").click();
    }
    
    setFocus(document.getElementById("sheetWidth"));
    showNumpad();
});

document.getElementById("downloadBtn").onclick = () => {
    const firstCanvas = document.querySelector("#sheetsContainer canvas");
    if(!firstCanvas) return alert("Primero optimiza para exportar");
    const link = document.createElement('a');
    link.download = `Corte_${document.getElementById("clientName").value || 'Pedido'}.png`;
    link.href = firstCanvas.toDataURL();
    link.click();
};
// Botón expandir/contraer tabla
const toggleBtn = document.getElementById('toggleTableHeight');
const tableWrapper = document.querySelector('.table-wrapper');

if (toggleBtn && tableWrapper) {
    toggleBtn.onclick = () => {
        if (tableWrapper.classList.contains('expanded')) {
            tableWrapper.classList.remove('expanded');
            toggleBtn.innerHTML = '▼ Expandir';
        } else {
            tableWrapper.classList.add('expanded');
            toggleBtn.innerHTML = '▲ Contraer';
        }
    };
}

document.addEventListener('input', saveToLocal);