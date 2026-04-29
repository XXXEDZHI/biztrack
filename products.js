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
    var form = document.getElementById("product-form");
    form.style.display = (form.style.display === "block") ? "none" : "block";
}

function closeForm() {
  document.getElementById("product-form").style.display = "none";
}

// ✅ 辅助函数：把 "Baseball caps" 转成 "baseballcaps" 用于翻译 key
function getProductNameKey(name) {
    return name.replace(/\s+/g, '').replace(/-/g, '').toLowerCase();
}

let products = [];

// ✅ 核心函数：渲染产品表格（可被 i18n 重复调用）
window.renderProductsTable = function() {
  const prodTableBody = document.getElementById("tableBody");
  if (!prodTableBody) return;
  
  prodTableBody.innerHTML = "";

  // ✅ 新增：空状态处理（缺陷修复）
  if (!products || products.length === 0) {
      prodTableBody.innerHTML = `
          <tr>
              <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                  <i class="fas fa-box-open" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
                  <p style="font-size: 16px;">No products found. Click "Add Product" to create one!</p>
              </td>
          </tr>
      `;
      return;
  }

  // 获取翻译函数
  const t = window.i18n ? window.i18n.t : (key => key);

  products.forEach(product => {
      const prodRow = document.createElement("tr");
      prodRow.className = "product-row";

      prodRow.dataset.prodID = product.prodID;
      prodRow.dataset.prodName = product.prodName;
      prodRow.dataset.prodDesc = product.prodDesc;
      prodRow.dataset.prodCat = product.prodCat;
      prodRow.dataset.prodPrice = product.prodPrice;
      prodRow.dataset.prodSold = product.prodSold;

      // ✅ 翻译商品名称：products.names.baseballcaps -> "棒球帽"
      const nameKey = getProductNameKey(product.prodName);
      const translatedName = t('products.names.' + nameKey);

      // ✅ 翻译类别：products.categories.hats -> "帽子"
      const catKey = product.prodCat.replace(/\s+/g, '').toLowerCase();
      const translatedCat = t('products.categories.' + catKey);

      prodRow.innerHTML = `
          <td>${escapeHTML(product.prodID)}</td>
          <td>${escapeHTML(translatedName)}</td>
          <td>${escapeHTML(product.prodDesc)}</td>
          <td>${escapeHTML(translatedCat)}</td>
          <td>$${product.prodPrice.toFixed(2)}</td>
          <td>${product.prodSold}</td>
          <td class="action">
            <i title="${t('common.edit')}" onclick="editRow('${escapeHTML(product.prodID)}')" class="edit-icon fa-solid fa-pen-to-square"></i>
            <i onclick="deleteProduct('${product.prodID}')" class="delete-icon fas fa-trash-alt" title="${t('common.delete')}"></i>
          </td>
      `;
      prodTableBody.appendChild(prodRow);
  });
};

function init() {
  const storedProducts = localStorage.getItem("bizTrackProducts");
  if (storedProducts) {
      products = JSON.parse(storedProducts);
  } else {
      products = [
        {
          prodID: "PD001",
          prodName: "Baseball caps",
          prodDesc: "Peace embroidered cap",
          prodCat: "Hats",
          prodPrice: 25.00,
          prodSold: 20
        },
        {
          prodID: "PD002",
          prodName: "Water bottles",
          prodDesc: "Floral lotus printed bottle",
          prodCat: "Drinkware",
          prodPrice: 48.50,
          prodSold: 10
        },
        {
          prodID: "PD003",
          prodName: "Sweatshirts",
          prodDesc: "Palestine sweater",
          prodCat: "Clothing",
          prodPrice: 17.50,
          prodSold: 70
        },
        {
          prodID: "PD004",
          prodName: "Posters",
          prodDesc: "Vibes printed poster",
          prodCat: "Home decor",
          prodPrice: 12.00,
          prodSold: 60
        },
        {
          prodID: "PD005",
          prodName: "Pillow cases",
          prodDesc: "Morrocan print pillow case",
          prodCat: "Accessories",
          prodPrice: 17.00,
          prodSold: 40
        },
      ];
      localStorage.setItem("bizTrackProducts", JSON.stringify(products));
  }

  // ✅ 首次渲染表格
  window.renderProductsTable();
}

function addOrUpdate(event) {
  event.preventDefault();
  let type = document.getElementById("submitBtn").textContent;
  const t = window.i18n ? window.i18n.t : (key => key);
  
  if (type === t('products.form.submit') || type === 'Add') {
      newProduct(event);
  } else if (type === t('products.form.update') || type === 'Update'){
      const prodID = document.getElementById("product-id").value;
      updateProduct(prodID);
  }
}

function newProduct(event) {
  const prod = {
    prodID: document.getElementById("product-id").value,
    prodName: document.getElementById("product-name").value,
    prodDesc: document.getElementById("product-desc").value,
    prodCat: document.getElementById("product-cat").value,
    prodPrice: parseFloat(document.getElementById("product-price").value),
    prodSold: parseInt(document.getElementById("product-sold").value),
  };

  if (isDuplicateID(prod.prodID, null)) {
    alert("Product ID already exists. Please use a unique ID.");
    return;
  }

  products.push(prod);
  saveAndRender();
  document.getElementById("product-form").reset();
}

function editRow(prodID) {
  const product = products.find(p => p.prodID === prodID);
  if (!product) return;

  document.getElementById("product-id").value = product.prodID;
  document.getElementById("product-name").value = product.prodName;
  document.getElementById("product-desc").value = product.prodDesc;
  document.getElementById("product-cat").value = product.prodCat;
  document.getElementById("product-price").value = product.prodPrice;
  document.getElementById("product-sold").value = product.prodSold;

  const t = window.i18n ? window.i18n.t : (key => key);
  document.getElementById("submitBtn").textContent = t('products.form.update');

  openForm();
}

function deleteProduct(prodID) {
  products = products.filter(p => p.prodID !== prodID);
  saveAndRender();
}

function updateProduct(prodID) {
    const index = products.findIndex(p => p.prodID === prodID);
    if (index === -1) return;

    products[index] = {
        prodID: document.getElementById("product-id").value,
        prodName: document.getElementById("product-name").value,
        prodDesc: document.getElementById("product-desc").value,
        prodCat: document.getElementById("product-cat").value,
        prodPrice: parseFloat(document.getElementById("product-price").value),
        prodSold: parseInt(document.getElementById("product-sold").value),
    };

    if (isDuplicateID(products[index].prodID, prodID)) {
        alert("Product ID already exists. Please use a unique ID.");
        return;
    }

    saveAndRender();
    document.getElementById("product-form").reset();
    
    const t = window.i18n ? window.i18n.t : (key => key);
    document.getElementById("submitBtn").textContent = t('products.form.submit');
}

function isDuplicateID(prodID, currentID) {
    return products.some(p => p.prodID === prodID && p.prodID !== currentID);
}

function saveAndRender() {
    localStorage.setItem("bizTrackProducts", JSON.stringify(products));
    window.renderProductsTable();
}

// 搜索和排序（保持原样）
document.getElementById("searchInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        performSearch();
    }
});

function performSearch() {
    const term = document.getElementById("searchInput").value.toLowerCase();
    document.querySelectorAll(".product-row").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(term) ? "table-row" : "none";
    });
}

function sortTable(column) {
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const isNumeric = column === "prodPrice" || column === "prodSold";

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

function exportToCSV() {
  const csv = products.map(p => ({
    prodID: p.prodID,
    prodName: p.prodName,
    prodDesc: p.prodDesc,
    prodCategory: p.prodCat,
    prodPrice: p.prodPrice.toFixed(2),
    QtySold: p.prodSold,
  }));
  
  const headers = Object.keys(csv[0]).join(',');
  const rows = csv.map(row => Object.values(row).join(','));
  const content = `${headers}\n${rows.join('\n')}`;
  
  const blob = new Blob([content], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'biztrack_products.csv';
  link.click();
}

// ✅ 页面加载时初始化
window.addEventListener('load', init);
