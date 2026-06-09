let currentFocus = null;
let isNewInput = false;
let kerf = 0.3;
let lastPieceCode = "";
const stockTableBody = document.querySelector("#stockTable tbody");
const piecesTableBody = document.querySelector("#piecesTable tbody");
const floatingNumpad = document.getElementById("floatingNumpad");

function showNumpad() {
    floatingNumpad.classList.remove('hidden');
    document.body.style.paddingBottom = '220px';
}

function hideNumpad() {
    floatingNumpad.classList.add('hidden');
    document.body.style.paddingBottom = '200px';
}

function scrollToVisible(element) {
    const wrapper = element.closest('.table-wrapper');
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

function setFocus(el) {
    if (currentFocus) currentFocus.classList.remove('active-cell');
    currentFocus = el;
    currentFocus.classList.add('active-cell');
    isNewInput = true;
    scrollToVisible(el);
}

function adjustKerf(val) {
    kerf = Math.round((kerf + val) * 10) / 10;
    if (kerf < 0.2) kerf = 0.2;
    if (kerf > 0.6) kerf = 0.6;
    document.getElementById("kerfValue").innerText = kerf.toFixed(1);
    saveToLocal();
}

function pressNum(n) {
    if (!currentFocus) return;
    
    let currentValue = currentFocus.value;
    
    // Verificar si es campo de cantidad (s-qty o p-qty)
    const isQtyField = currentFocus.classList && (currentFocus.classList.contains('s-qty') || currentFocus.classList.contains('p-qty'));
    
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
    
    // Guardar en localStorage
    if (typeof saveToLocal === 'function') saveToLocal();
    
    // Guardar el código de la pieza
    if (currentFocus.classList && currentFocus.classList.contains("p-name")) {
        lastPieceCode = currentFocus.value.trim().toUpperCase();
    }
}

function deleteLast() {
    if (currentFocus) {
        let val = currentFocus.value.toString();
        currentFocus.value = val.slice(0, -1);
        if (currentFocus.value === "") isNewInput = true;
        saveToLocal();
    }
}

function moveFocus(dir) {
    if (!currentFocus) return;
    const allInputs = Array.from(document.querySelectorAll('.input-field'));
    const globalIndex = allInputs.indexOf(currentFocus);
    const actualColClass = Array.from(currentFocus.classList).find(c => c !== 'input-field' && c !== 'active-cell');
    const allInCol = Array.from(document.querySelectorAll(`.${actualColClass}`));
    const colIndex = allInCol.indexOf(currentFocus);

    if (dir === 'next') {
        const isLastInStock = currentFocus.classList.contains('s-qty') && currentFocus === Array.from(document.querySelectorAll('.s-qty')).pop();
        const isLastInPieces = currentFocus.classList.contains('p-qty') && currentFocus === Array.from(document.querySelectorAll('.p-qty')).pop();
        if (isLastInStock) { addStockRow(); saveToLocal(); setTimeout(() => setFocus(Array.from(document.querySelectorAll('.input-field'))[globalIndex + 1]), 10); }
        else if (isLastInPieces) { addPieceRow(); saveToLocal(); setTimeout(() => setFocus(Array.from(document.querySelectorAll('.input-field'))[globalIndex + 1]), 10); }
        else if (globalIndex < allInputs.length - 1) { setFocus(allInputs[globalIndex + 1]); }
    } 
    else if (dir === 'down') {
        if (colIndex < allInCol.length - 1) { setFocus(allInCol[colIndex + 1]); }
    }
    else if (dir === 'up' && colIndex > 0) { setFocus(allInCol[colIndex - 1]); }
    else if (dir === 'prev' && globalIndex > 0) { setFocus(allInputs[globalIndex - 1]); }
}

document.addEventListener('click', (e) => { 
    if (e.target.classList && e.target.classList.contains('input-field')) {
        setFocus(e.target);
        showNumpad();
    }
});

function addStockRow() {
    let row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" inputmode="numeric" class="input-field s-name" placeholder="0" readonly></td>
        <td><input type="text" inputmode="numeric" class="input-field s-len" value="595" readonly></td>
        <td><input type="text" inputmode="numeric" class="input-field s-qty" value="999" readonly></td>
        <td><button class="remove" onclick="this.parentElement.parentElement.remove(); saveToLocal();">×</button></td>
    `;
    stockTableBody.appendChild(row);
    showNumpad();
}

function addPieceRow() {
    let row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="checkbox" class="use-check" checked onchange="saveToLocal()"></td>
        <td><input type="text" inputmode="numeric" class="input-field p-name" placeholder="0" readonly></td>
        <td><input type="text" inputmode="numeric" class="input-field p-len" placeholder="0" readonly></td>
        <td><input type="text" inputmode="numeric" class="input-field p-qty" placeholder="0" readonly></td>
        <td><button class="remove" onclick="this.parentElement.parentElement.remove(); saveToLocal();">×</button></td>
    `;
    piecesTableBody.appendChild(row);
    if (lastPieceCode) {
        row.querySelector(".p-name").value = lastPieceCode;
    }
    showNumpad();
    
    setTimeout(() => {
        const nuevoCampo = row.querySelector('.p-name');
        if (nuevoCampo) {
            setFocus(nuevoCampo);
        }
    }, 80);
}

// Botones de expandir/contraer
const stockToggle = document.getElementById('toggleStockTable');
const piecesToggle = document.getElementById('togglePiecesTable');
const stockWrapper = document.querySelector('.stock-wrapper');
const piecesWrapper = document.querySelector('.pieces-wrapper');

if (stockToggle && stockWrapper) {
    stockToggle.onclick = () => {
        stockWrapper.classList.toggle('expanded');
        stockToggle.innerHTML = stockWrapper.classList.contains('expanded') ? '▲ Contraer' : '▼ Expandir';
    };
}

if (piecesToggle && piecesWrapper) {
    piecesToggle.onclick = () => {
        piecesWrapper.classList.toggle('expanded');
        piecesToggle.innerHTML = piecesWrapper.classList.contains('expanded') ? '▲ Contraer' : '▼ Expandir';
    };
}

document.getElementById("addStock").onclick = () => { addStockRow(); saveToLocal(); };
document.getElementById("addPiece").onclick = () => { addPieceRow(); saveToLocal(); };

document.getElementById("optimize").onclick = () => {
    let stock = [];
    let stockCodesSet = new Set();
    let stockRows = document.querySelectorAll("#stockTable tbody tr");
    
    for (let i = 0; i < stockRows.length; i++) {
        let codeInput = stockRows[i].querySelector(".s-name");
        let code = codeInput.value.trim().toUpperCase();
        let len = Number(stockRows[i].querySelector(".s-len").value);
        let qty = Number(stockRows[i].querySelector(".s-qty").value);
        
        if (len > 0 && !code) { 
            alert(`Falta Cód/Mat en la fila ${i + 1} de Varillas Base`); 
            setFocus(codeInput); return; 
        }
        if (code && len > 0) {
            stock.push({ code, len, qty });
            stockCodesSet.add(code);
        }
    }

    if (stock.length === 0) return alert("Carga material base");
    
    let pieces = [];
    let pieceRows = document.querySelectorAll("#piecesTable tbody tr");
    for (let i = 0; i < pieceRows.length; i++) {
        if (pieceRows[i].querySelector(".use-check").checked) {
            let codeInput = pieceRows[i].querySelector(".p-name");
            let code = codeInput.value.trim().toUpperCase();
            let len = Number(pieceRows[i].querySelector(".p-len").value);
            let qty = Number(pieceRows[i].querySelector(".p-qty").value);

            if (len > 0 && !code) { 
                alert(`Falta Cód/Nombre en la fila ${i + 1} de Piezas`); 
                setFocus(codeInput); return; 
            }
            if (len > 0 && code && !stockCodesSet.has(code)) {
                alert(`Error: El código "${code}" (fila ${i+1} de Piezas) no existe en el Material Base.`);
                setFocus(codeInput); return;
            }
            if (len > 0 && qty > 0) { for (let j = 0; j < qty; j++) pieces.push({ code, len }); }
        }
    }

    if (pieces.length === 0) return alert("No hay piezas");
    pieces.sort((a, b) => b.len - a.len);

    let usedRods = [];
    let uniqueCodes = [...new Set(pieces.map(p => p.code))];
    uniqueCodes.forEach(currentCode => {
        let codePieces = pieces.filter(p => p.code === currentCode);
        codePieces.forEach(p => {
            let fit = usedRods.find(r => r.code === p.code && r.free >= p.len);
            if (fit) { fit.parts.push({ x: fit.total - fit.free, len: p.len }); fit.free -= (p.len + kerf); }
            else {
                let sItem = stock.find(s => s.code === p.code && s.qty > 0);
                if (sItem) { 
                    let globalColor = document.getElementById("globalColor").value;
                    usedRods.push({ 
                        code: p.code, 
                        color: globalColor,
                        total: sItem.len, 
                        free: sItem.len - p.len - kerf, 
                        parts: [{ x: 0, len: p.len }] 
                    }); 
                    sItem.qty--; 
                }
            }
        });
    });

    renderFinalSolution(usedRods);
    renderSummary();
    renderRodCounts(usedRods);
    document.getElementById("resultPanel").style.display = "block";
};

function renderRodCounts(rods) {
    const rodDiv = document.getElementById("rodsPerCode");
    rodDiv.innerHTML = "";
    let counts = {};
    rods.forEach(r => { counts[r.code] = (counts[r.code] || 0) + 1; });
    for (let code in counts) {
        rodDiv.innerHTML += `<div>• <b>${code}:</b> ${counts[code]} varilla(s)</div>`;
    }
}

function renderSummary() {
    const summaryDiv = document.getElementById("summaryList");
    summaryDiv.innerHTML = "";
    let groups = {};
    document.querySelectorAll("#piecesTable tbody tr").forEach(row => {
        if (row.querySelector(".use-check").checked) {
            let code = row.querySelector(".p-name").value.trim().toUpperCase() || "SIN CÓDIGO";
            let len = row.querySelector(".p-len").value;
            let qty = row.querySelector(".p-qty").value;
            if (len > 0 && qty > 0) {
                if (!groups[code]) groups[code] = [];
                groups[code].push(`${code} - ${len} = ${qty}`);
            }
        }
    });

    for (let code in groups) {
        let groupBlock = document.createElement("div");
        groupBlock.style.borderLeft = "3px solid var(--accent-blue)";
        groupBlock.style.paddingLeft = "8px";
        groupBlock.style.marginBottom = "5px";
        groupBlock.style.background = "rgba(255,255,255,0.05)";
        groups[code].forEach(line => {
            let d = document.createElement("div");
            d.style.fontFamily = "monospace";
            d.innerText = line;
            groupBlock.appendChild(d);
        });
        summaryDiv.appendChild(groupBlock);
    }
}

function renderFinalSolution(rods) {
    const container = document.getElementById("sheetsContainer");
    container.innerHTML = '';
    const colorMap = {};
    const colors = ["#3498db", "#e67e22", "#9b59b6", "#1abc9c", "#f1c40f", "#e74c3c", "#95a5a6", "#d35400"];
    let colorIdx = 0;
    rods.forEach((rod, idx) => {
        const div = document.createElement('div');
        div.className = 'panel';
        div.innerHTML = `<div style="font-size:10px; color:#aaa; margin-bottom:4px;">
${rod.code} (${rod.color || "Sin color"}) - Varilla ${idx+1}
</div><canvas id="canv-${idx}" width="450" height="50" style="width:100%;"></canvas>`;
        container.appendChild(div);
        const ctx = document.getElementById(`canv-${idx}`).getContext('2d');
        const scale = 410 / rod.total;
        ctx.fillStyle = "#333"; ctx.fillRect(20, 10, rod.total * scale, 30);
        rod.parts.forEach(p => {
            if (!colorMap[p.len]) { colorMap[p.len] = colors[colorIdx % colors.length]; colorIdx++; }
            ctx.fillStyle = colorMap[p.len];
            ctx.fillRect(20 + p.x * scale, 10, p.len * scale, 30);
            ctx.strokeStyle = "white"; ctx.strokeRect(20 + p.x * scale, 10, p.len * scale, 30);
            ctx.fillStyle = "white"; ctx.font = "bold 10px Arial";
            if (p.len * scale > 15) ctx.fillText(p.len, 22 + p.x * scale, 28);
        });
    });
}

function saveToLocal() {
    const s = []; document.querySelectorAll("#stockTable tbody tr").forEach(r => { s.push({ n: r.querySelector(".s-name").value, l: r.querySelector(".s-len").value, q: r.querySelector(".s-qty").value }); });
    const p = []; document.querySelectorAll("#piecesTable tbody tr").forEach(r => { p.push({ n: r.querySelector(".p-name").value, l: r.querySelector(".p-len").value, q: r.querySelector(".p-qty").value, c: r.querySelector(".use-check").checked }); });
    localStorage.setItem('opt_v_final_v9', JSON.stringify({ s, p, k: kerf }));
}

// Eventos del teclado flotante
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
            target.classList.contains('input-field')) {
            showNumpad();
        }
    });
}

window.onload = () => {
    setupNumpadEvents();
    bindNumpadToNumericFields();
    document.body.style.paddingBottom = '200px';
    stockTableBody.innerHTML = ""; 
    piecesTableBody.innerHTML = "";
    const data = JSON.parse(localStorage.getItem('opt_v_final_v9'));
    if (data) {
        kerf = data.k || 0.3; 
        document.getElementById("kerfValue").innerText = kerf;
        data.s.forEach(i => { 
            addStockRow(); 
            let r = stockTableBody.lastElementChild; 
            r.querySelector(".s-name").value = i.n; 
            r.querySelector(".s-len").value = i.l; 
            r.querySelector(".s-qty").value = i.q; 
        });
        data.p.forEach(i => { 
            addPieceRow(); 
            let r = piecesTableBody.lastElementChild; 
            r.querySelector(".p-name").value = i.n; 
            r.querySelector(".p-len").value = i.l; 
            r.querySelector(".p-qty").value = i.q; 
            r.querySelector(".use-check").checked = i.c; 
        });
    } else { 
        addStockRow(); 
        addPieceRow(); 
    }
    setFocus(document.querySelector(".input-field"));
    showNumpad();
};