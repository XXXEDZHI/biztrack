function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openSidebar() {
    var side = document.getElementById('sidebar');
    side.style.display = (side.style.display === "block") ? "none" : "block";
}
function closeSidebar() {
    document.getElementById('sidebar').style.display = 'none';
}
function openForm() {
    var form = document.getElementById("order-form");
    form.style.display = (form.style.display === "block") ? "none" : "block";
}
function closeForm() {
    document.getElementById("order-form").style.display = "none";
}

// 辅助函数：把 "Baseball caps" 变成 "baseballcaps"
function getItemNameKey(name) {
    return name.replace(/\s+/g, '').replace(/-/g, '').toLowerCase();
}

let orders = [];

// ✅ 核心函数：渲染表格（可以被 i18n 反复调用）
window.renderOrdersTable = function() {
    const orderTableBody = document.getElementById("tableBody");
    if (!orderTableBody) return;
    
    orderTableBody.innerHTML = "";
    
    // 获取翻译函数
    const t = window.i18n ? window.i18n.t : (key => key);

    const statusMap = {
        "Pending": "pending",
        "Processing": "processing",
        "Shipped": "shipped",
        "Delivered": "delivered"
    };

    orders.forEach(order => {
        const row = document.createElement("tr");
        
        // ✅ 翻译商品名
        const itemKey = getItemNameKey(order.itemName);
        const itemNameText = t('products.names.' + itemKey);
        
        // ✅ 翻译状态
        const statusText = t('orders.status.' + order.orderStatus.toLowerCase());

        const formattedPrice = `$${order.itemPrice.toFixed(2)}`;
        const formattedShipping = `$${order.shipping.toFixed(2)}`;
        const formattedTaxes = `$${order.taxes.toFixed(2)}`;
        const formattedTotal = `$${order.orderTotal.toFixed(2)}`;

        row.innerHTML = `
            <td>${escapeHTML(order.orderID)}</td>
            <td>${escapeHTML(order.orderDate)}</td>
            <td>${escapeHTML(itemNameText)}</td>
            <td>${formattedPrice}</td>
            <td>${order.qtyBought}</td>
            <td>${formattedShipping}</td>
            <td>${formattedTaxes}</td>
            <td class="order-total">${formattedTotal}</td>
            <td>
                <div class="status ${statusMap[order.orderStatus] || ''}">
                    <span>${escapeHTML(statusText)}</span>
                </div>
            </td>
            <td class="action">
                <i title="Edit" onclick="editRow('${order.orderID}')" class="edit-icon fa-solid fa-pen-to-square"></i>
                <i onclick="deleteOrder('${order.orderID}')" class="delete-icon fas fa-trash-alt"></i>
            </td>
        `;
        orderTableBody.appendChild(row);
    });
    
    updateTotalRevenue();
};

function updateTotalRevenue() {
    const t = window.i18n ? window.i18n.t : (key => key);
    const total = orders.reduce((sum, o) => sum + o.orderTotal, 0);
    const el = document.getElementById("total-revenue");
    if (el) {
        el.innerHTML = `<span>${t('orders.revenueLabel')}: $${total.toFixed(2)}</span>`;
    }
}

// 初始化数据
window.onload = function() {
    const stored = localStorage.getItem("bizTrackOrders");
    if (stored) {
        orders = JSON.parse(stored);
    } else {
        orders = [
            { orderID: "1001", orderDate: "2024-01-05", itemName: "Baseball caps", itemPrice: 25.00, qtyBought: 2, shipping: 2.50, taxes: 9.00, orderTotal: 61.50, orderStatus: "Pending" },
            { orderID: "1002", orderDate: "2024-03-05", itemName: "Water bottles", itemPrice: 17.00, qtyBought: 3, shipping: 3.50, taxes: 6.00, orderTotal: 60.50, orderStatus: "Processing" },
            { orderID: "1003", orderDate: "2024-02-05", itemName: "Tote bags", itemPrice: 20.00, qtyBought: 4, shipping: 2.50, taxes: 2.00, orderTotal: 84.50, orderStatus: "Shipped" },
            { orderID: "1004", orderDate: "2023-01-05", itemName: "Canvas prints", itemPrice: 55.00, qtyBought: 1, shipping: 2.50, taxes: 19.00, orderTotal: 76.50, orderStatus: "Delivered" },
            { orderID: "1005", orderDate: "2024-01-15", itemName: "Beanies", itemPrice: 15.00, qtyBought: 2, shipping: 3.90, taxes: 4.00, orderTotal: 37.90, orderStatus: "Pending" }
        ];
        localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
    }
    
    // 首次渲染
    window.renderOrdersTable();
};

// 添加/更新逻辑
function addOrUpdate(event) {
    event.preventDefault();
    const btnText = document.getElementById("submitBtn").textContent;
    if (btnText === 'Add' || btnText === '添加') {
        createNewOrder();
    } else {
        const id = document.getElementById("order-id").value;
        updateExistingOrder(id);
    }
}

function createNewOrder() {
    const newOrder = {
        orderID: document.getElementById("order-id").value,
        orderDate: document.getElementById("order-date").value,
        itemName: document.getElementById("item-name").value,
        itemPrice: parseFloat(document.getElementById("item-price").value),
        qtyBought: parseInt(document.getElementById("qty-bought").value),
        shipping: parseFloat(document.getElementById("shipping").value),
        taxes: parseFloat(document.getElementById("taxes").value),
        orderStatus: document.getElementById("order-status").value,
        orderTotal: 0
    };
    newOrder.orderTotal = (newOrder.itemPrice * newOrder.qtyBought) + newOrder.shipping + newOrder.taxes;

    if (orders.some(o => o.orderID === newOrder.orderID)) {
        alert("ID exists!"); return;
    }

    orders.push(newOrder);
    saveAndRender();
    document.getElementById("order-form").reset();
}

function updateExistingOrder(id) {
    const idx = orders.findIndex(o => o.orderID === id);
    if (idx === -1) return;

    orders[idx] = {
        orderID: document.getElementById("order-id").value,
        orderDate: document.getElementById("order-date").value,
        itemName: document.getElementById("item-name").value,
        itemPrice: parseFloat(document.getElementById("item-price").value),
        qtyBought: parseInt(document.getElementById("qty-bought").value),
        shipping: parseFloat(document.getElementById("shipping").value),
        taxes: parseFloat(document.getElementById("taxes").value),
        orderStatus: document.getElementById("order-status").value,
        orderTotal: 0
    };
    orders[idx].orderTotal = (orders[idx].itemPrice * orders[idx].qtyBought) + orders[idx].shipping + orders[idx].taxes;
    
    saveAndRender();
    document.getElementById("order-form").reset();
    document.getElementById("submitBtn").textContent = window.i18n ? window.i18n.t('orders.form.submit') : 'Add';
}

function editRow(id) {
    const order = orders.find(o => o.orderID === id);
    if (!order) return;

    document.getElementById("order-id").value = order.orderID;
    document.getElementById("order-date").value = order.orderDate;
    document.getElementById("item-name").value = order.itemName;
    document.getElementById("item-price").value = order.itemPrice;
    document.getElementById("qty-bought").value = order.qtyBought;
    document.getElementById("shipping").value = order.shipping;
    document.getElementById("taxes").value = order.taxes;
    document.getElementById("order-total").value = order.orderTotal;
    document.getElementById("order-status").value = order.orderStatus;

    document.getElementById("submitBtn").textContent = window.i18n ? window.i18n.t('orders.form.update') : 'Update';
    openForm();
}

function deleteOrder(id) {
    orders = orders.filter(o => o.orderID !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
    window.renderOrdersTable();
}

// 搜索和排序 (保持原样)
document.getElementById("searchInput").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        const term = document.getElementById("searchInput").value.toLowerCase();
        document.querySelectorAll(".order-row").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? "table-row" : "none";
        });
    }
});

function sortTable(col) {
    // 简化版排序，保持原有逻辑即可
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    rows.sort((a, b) => {
        const aVal = a.cells[getColumnIndex(col)].innerText;
        const bVal = b.cells[getColumnIndex(col)].innerText;
        return aVal.localeCompare(bVal, undefined, {numeric: true});
    });
    rows.forEach(r => tbody.appendChild(r));
}
function getColumnIndex(col) {
    const map = {'orderID':0, 'orderDate':1, 'itemName':2, 'itemPrice':3, 'qtyBought':4, 'shipping':5, 'taxes':6, 'orderTotal':7, 'orderStatus':8};
    return map[col] || 0;
}

function exportToCSV() {
    let csv = "ID,Date,Item,Price,Qty,Ship,Tax,Total,Status\n";
    orders.forEach(o => {
        csv += `${o.orderID},${o.orderDate},${o.itemName},${o.itemPrice},${o.qtyBought},${o.shipping},${o.taxes},${o.orderTotal},${o.orderStatus}\n`;
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
}
