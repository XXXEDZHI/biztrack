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
    var form = document.getElementById("order-form")
    form.style.display = (form.style.display === "block") ? "none" : "block";
}

function closeForm() {
    document.getElementById("order-form").style.display = "none";
}

// 辅助函数：将商品英文名转换为翻译 Key (例如 "Baseball caps" -> "baseballcaps")
function getItemNameKey(name) {
    return name.replace(/\s+/g, '').replace(/-/g, '').toLowerCase();
}

let orders = [];

window.onload = function () {
    const storedOrders = localStorage.getItem("bizTrackOrders");
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    } else {
        orders = [
        {
            orderID: "1001",
            orderDate: "2024-01-05",
            itemName: "Baseball caps",
            itemPrice: 25.00,
            qtyBought: 2,
            shipping: 2.50,
            taxes: 9.00,
            orderTotal: 61.50,
            orderStatus: "Pending"
        },
        {
            orderID: "1002",
            orderDate: "2024-03-05",
            itemName: "Water bottles",
            itemPrice: 17.00,
            qtyBought: 3,
            shipping: 3.50,
            taxes: 6.00,
            orderTotal: 60.50,
            orderStatus: "Processing"
        },
        {
            orderID: "1003",
            orderDate: "2024-02-05",
            itemName: "Tote bags",
            itemPrice: 20.00,
            qtyBought: 4,
            shipping: 2.50,
            taxes: 2.00,
            orderTotal: 84.50,
            orderStatus: "Shipped"
        },
        {
            orderID: "1004",
            orderDate: "2023-01-05",
            itemName: "Canvas prints",
            itemPrice: 55.00,
            qtyBought: 1,
            shipping: 2.50,
            taxes: 19.00,
            orderTotal: 76.50,
            orderStatus: "Delivered"
        },
        {
            orderID: "1005",
            orderDate: "2024-01-15",
            itemName: "Beanies",
            itemPrice: 15.00,
            qtyBought: 2,
            shipping: 3.90,
            taxes: 4.00,
            orderTotal: 37.90,
            orderStatus: "Pending"
        },
        ];
        localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
    }
    renderOrders(orders);
}

function addOrUpdate(event) {
    let type = document.getElementById("submitBtn").textContent;
    // 兼容中英文判断
    if (type === 'Add' || type === '添加') {
        newOrder(event);
    } else {
        const orderID = document.getElementById("order-id").value;
        updateOrder(orderID);
    }
}

function newOrder(event) {
  event.preventDefault();
  const order = {
    orderID: document.getElementById("order-id").value,
    orderDate: document.getElementById("order-date").value,
    itemName: document.getElementById("item-name").value,
    itemPrice: parseFloat(document.getElementById("item-price").value),
    qtyBought: parseInt(document.getElementById("qty-bought").value),
    shipping: parseFloat(document.getElementById("shipping").value),
    taxes: parseFloat(document.getElementById("taxes").value),
    orderStatus: document.getElementById("order-status").value,
  };
  
  // 重新计算总价
  order.orderTotal = (order.itemPrice * order.qtyBought) + order.shipping + order.taxes;

  if (isDuplicateID(order.orderID, null)) {
    alert("Order ID already exists. Please use a unique ID.");
    return;
  }

  orders.push(order);
  renderOrders(orders);
  localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
  document.getElementById("order-form").reset();
}

function renderOrders(orders) {
    const orderTableBody = document.getElementById("tableBody");
    orderTableBody.innerHTML = "";
    
    const statusMap = {
        "Pending": "pending",
        "Processing": "processing",
        "Shipped": "shipped",
        "Delivered": "delivered"
    }

    // 获取翻译函数，如果没有加载则使用默认英文
    const t = window.t || ((key) => key);

    orders.forEach(order => {
      const orderRow = document.createElement("tr");
      orderRow.className = "order-row";

      // ✅ 核心修改 1：翻译商品名称
      // 将 "Baseball caps" 转为 "products.names.baseballcaps" 去查找翻译
      const itemNameKey = getItemNameKey(order.itemName);
      const translatedItemName = t('products.names.' + itemNameKey);

      // ✅ 核心修改 2：翻译状态
      const statusKey = 'orders.status.' + order.orderStatus.toLowerCase();
      const translatedStatus = t(statusKey);

      const formattedPrice = typeof order.itemPrice === 'number' ? `$${order.itemPrice.toFixed(2)}` : '';
      const formattedShipping = typeof order.shipping === 'number' ? `$${order.shipping.toFixed(2)}` : '';
      const formattedTaxes = typeof order.taxes === 'number' ? `$${order.taxes.toFixed(2)}` : '';
      const formattedTotal = typeof order.orderTotal === 'number' ? `$${order.orderTotal.toFixed(2)}` : '';

      orderRow.innerHTML = `
        <td>${escapeHTML(order.orderID)}</td>
        <td>${escapeHTML(order.orderDate)}</td>
        <td>${escapeHTML(translatedItemName)}</td> <!-- 使用翻译后的商品名 -->
        <td>${formattedPrice}</td>
        <td>${order.qtyBought}</td>
        <td>${formattedShipping}</td>
        <td>${formattedTaxes}</td>
        <td class="order-total">${formattedTotal}</td>
        <td>
            <div class="status ${statusMap[order.orderStatus] || ''}">
                <span>${escapeHTML(translatedStatus)}</span> <!-- 使用翻译后的状态 -->
            </div>
        </td>
        <td class="action">
            <i title="Edit" onclick="editRow('${escapeHTML(order.orderID)}')" class="edit-icon fa-solid fa-pen-to-square"></i>
            <i onclick="deleteOrder('${order.orderID}')" class="delete-icon fas fa-trash-alt"></i>
        </td>
      `;
      orderTableBody.appendChild(orderRow);
  });
  displayRevenue();
}

function displayRevenue() {
    const resultElement = document.getElementById("total-revenue");
    const t = window.t || ((key) => key);

    const totalRevenue = orders
        .reduce((total, order) => total + order.orderTotal, 0);

    // ✅ 核心修改 3：使用正确的 Key
    resultElement.innerHTML = `
        <span>${t('orders.revenueLabel')}: $${totalRevenue.toFixed(2)}</span>
    `;
}

function editRow(orderID) {
    const orderToEdit = orders.find(order => order.orderID === orderID);
    const t = window.t || ((key) => key);

    document.getElementById("order-id").value = orderToEdit.orderID;
    document.getElementById("order-date").value = orderToEdit.orderDate;
    document.getElementById("item-name").value = orderToEdit.itemName;
    document.getElementById("item-price").value = orderToEdit.itemPrice;
    document.getElementById("qty-bought").value = orderToEdit.qtyBought;
    document.getElementById("shipping").value = orderToEdit.shipping;
    document.getElementById("taxes").value = orderToEdit.taxes;
    document.getElementById("order-total").value = orderToEdit.orderTotal;
    document.getElementById("order-status").value = orderToEdit.orderStatus;

    // ✅ 修改按钮文字为中文
    document.getElementById("submitBtn").textContent = t('orders.form.update');

    document.getElementById("order-form").style.display = "block";
}

function deleteOrder(orderID) {
  const indexToDelete = orders.findIndex(order => order.orderID === orderID);

  if (indexToDelete !== -1) {
      orders.splice(indexToDelete, 1);
      localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
      renderOrders(orders);
  }
}

function updateOrder(orderID) {
    const indexToUpdate = orders.findIndex(order => order.orderID === orderID);
    const t = window.t || ((key) => key);

    if (indexToUpdate !== -1) {
        const itemPrice = parseFloat(document.getElementById("item-price").value);
        const qtyBought = parseInt(document.getElementById("qty-bought").value);
        const shipping = parseFloat(document.getElementById("shipping").value);
        const taxes = parseFloat(document.getElementById("taxes").value);
        
        const updatedOrder = {
            orderID: document.getElementById("order-id").value,
            orderDate: document.getElementById("order-date").value,
            itemName: document.getElementById("item-name").value,
            itemPrice: itemPrice,
            qtyBought: qtyBought,
            shipping: shipping,
            taxes: taxes,
            orderStatus: document.getElementById("order-status").value,
        };

        // 重新计算总价
        updatedOrder.orderTotal = ((updatedOrder.itemPrice * updatedOrder.qtyBought) + updatedOrder.shipping + updatedOrder.taxes);

        if (isDuplicateID(updatedOrder.orderID, orderID)) {
            alert("Order ID already exists. Please use a unique ID.");
            return;
        }

        orders[indexToUpdate] = updatedOrder;
        localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
        renderOrders(orders);

        document.getElementById("order-form").reset();
        // ✅ 修改按钮文字为中文
        document.getElementById("submitBtn").textContent = t('orders.form.submit');
    }
}

function isDuplicateID(orderID, currentID) {
    return orders.some(order => order.orderID === orderID && order.orderID !== currentID);
}

function sortTable(column) {
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const isNumeric = column === "itemPrice" || column === "qtyBought" || column === "shipping"|| column === "taxes"|| column === "orderTotal";

    const sortedRows = rows.sort((a, b) => {
        const aValue = isNumeric ? parseFloat(a.dataset[column]) : a.dataset[column];
        const bValue = isNumeric ? parseFloat(b.dataset[column]) : b.dataset[column];
        if (typeof aValue === "string" && typeof bValue === "string") {
            return aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
        } else {
            return aValue - bValue;
        }
    });

    rows.forEach(row => tbody.removeChild(row));
    sortedRows.forEach(row => tbody.appendChild(row));
}

document.getElementById("searchInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        performSearch();
    }
});

function performSearch() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll(".order-row");

    rows.forEach(row => {
        const visible = row.innerText.toLowerCase().includes(searchInput);
        row.style.display = visible ? "table-row" : "none";
    });
}

function exportToCSV() {
    const ordersToExport = orders.map(order => {
        return {
            orderID: order.orderID,
            orderDate: order.orderDate,
            itemName: order.itemName,
            itemPrice: order.itemPrice.toFixed(2),
            qtyBought: order.qtyBought,
            shipping: order.shipping.toFixed(2),
            taxes: order.taxes.toFixed(2),
            orderTotal: order.orderTotal.toFixed(2),
            orderStatus: order.orderStatus,
        };
    });
  
    const csvContent = generateCSV(ordersToExport);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'biztrack_order_table.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
  
function generateCSV(data) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(order => Object.values(order).join(','));
    return `${headers}\n${rows.join('\n')}`;
}
