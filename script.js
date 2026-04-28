// SIDEBAR TOGGLE
function openSidebar() {
  var side = document.getElementById('sidebar');
  side.style.display = (side.style.display === "block") ? "none" : "block";
}

function closeSidebar() {
  document.getElementById('sidebar').style.display = 'none';
}

// ✅ 核心修复：更新 Dashboard 卡片
function updateDashboardCards() {
  const expenses = JSON.parse(localStorage.getItem('bizTrackTransactions')) || [
    { trID: 1, trDate: "2024-01-05", trCategory: "Rent", trAmount: 100.00, trNotes: "January Rent" },
    { trID: 2, trDate: "2024-01-15", trCategory: "Order Fulfillment", trAmount: 35.00, trNotes: "Order #1005" },
    { trID: 3, trDate: "2024-01-08", trCategory: "Utilities", trAmount: 120.00, trNotes: "Internet" },
    { trID: 4, trDate: "2024-02-05", trCategory: "Supplies", trAmount: 180.00, trNotes: "Embroidery Machine" },
    { trID: 5, trDate: "2024-01-25", trCategory: "Miscellaneous", trAmount: 20.00, trNotes: "Pizza" },
  ];
  
  const revenues = JSON.parse(localStorage.getItem('bizTrackOrders')) || [
    { orderID: "1001", orderDate: "2024-01-05", itemName: "Baseball caps", itemPrice: 25.00, qtyBought: 2, shipping: 2.50, taxes: 9.00, orderTotal: 61.50, orderStatus: "Pending" },
    { orderID: "1002", orderDate: "2024-03-05", itemName: "Water bottles", itemPrice: 17.00, qtyBought: 3, shipping: 3.50, taxes: 6.00, orderTotal: 60.50, orderStatus: "Processing" },
    { orderID: "1003", orderDate: "2024-02-05", itemName: "Tote bags", itemPrice: 20.00, qtyBought: 4, shipping: 2.50, taxes: 2.00, orderTotal: 84.50, orderStatus: "Shipped" },
    { orderID: "1004", orderDate: "2023-01-05", itemName: "Canvas prints", itemPrice: 55.00, qtyBought: 1, shipping: 2.50, taxes: 19.00, orderTotal: 76.50, orderStatus: "Delivered" },
    { orderID: "1005", orderDate: "2024-01-15", itemName: "Beanies", itemPrice: 15.00, qtyBought: 2, shipping: 3.90, taxes: 4.00, orderTotal: 37.90, orderStatus: "Pending" },
  ];

  const totalExpenses = calculateExpTotal(expenses);
  const totalRevenues = calculateRevTotal(revenues);
  const totalBalance = totalRevenues - totalExpenses;
  const numOrders = revenues.length;

  const revDiv = document.getElementById('rev-amount');
  const expDiv = document.getElementById('exp-amount');
  const balDiv = document.getElementById('balance');
  const ordDiv = document.getElementById('num-orders');

  if (!revDiv) return;

  const t = window.t || ((key) => key);

  revDiv.innerHTML = `<span class="title">${t('dashboard.cards.revenue')}</span><span class="amount-value">$${totalRevenues.toFixed(2)}</span>`;
  expDiv.innerHTML = `<span class="title">${t('dashboard.cards.expenses')}</span><span class="amount-value">$${totalExpenses.toFixed(2)}</span>`;
  balDiv.innerHTML = `<span class="title">${t('dashboard.cards.balance')}</span><span class="amount-value">$${totalBalance.toFixed(2)}</span>`;
  ordDiv.innerHTML = `<span class="title">${t('dashboard.cards.orders')}</span><span class="amount-value">${numOrders}</span>`;
}

function calculateExpTotal(transactions) {
  return transactions.reduce((total, transaction) => total + transaction.trAmount, 0);
}

function calculateRevTotal(orders) {
  return orders.reduce((total, order) => total + order.orderTotal, 0);
}

// ✅ 核心修复：将图表渲染逻辑封装，支持多次调用（切换语言时重绘）
function renderCharts() {
    // 1. 清空旧图表，防止重复渲染
    document.getElementById('bar-chart').innerHTML = '';
    document.getElementById('donut-chart').innerHTML = '';

    // 获取翻译函数，如果没有则使用英文兜底
    const t = window.t || ((key) => key);

    // --- BAR CHART DATA ---
    const items = JSON.parse(localStorage.getItem('bizTrackProducts')) || [
        { prodID: "PD001", prodName: "Baseball caps", prodDesc: "Peace embroidered cap", prodCat: "Hats", prodPrice: 25.00, prodSold: 20 },
        { prodID: "PD002", prodName: "Water bottles", prodDesc: "Floral lotus printed bottle", prodCat: "Drinkware", prodPrice: 48.50, prodSold: 10 },
        { prodID: "PD003", prodName: "Sweatshirt", prodDesc: "Palestine sweater", prodCat: "Clothing", prodPrice: 17.50, prodSold: 70 },
        { prodID: "PD004", prodName: "Posters", prodDesc: "Vibes printed poster", prodCat: "Home decor", prodPrice: 12.00, prodSold: 60 },
        { prodID: "PD005", prodName: "Pillow cases", prodDesc: "Morrocan print pillow case", prodCat: "Accessories", prodPrice: 17.00, prodSold: 40 },
    ];

    const categorySales = {};
    items.forEach(p => {
        categorySales[p.prodCat] = (categorySales[p.prodCat] || 0) + (p.prodPrice * p.prodSold);
    });

    const sortedCategorySales = Object.entries(categorySales).sort((a, b) => b[1] - a[1]).reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

    const barChartOptions = {
        series: [{ name: t('dashboard.charts.totalSalesLabel'),  Object.values(sortedCategorySales) }],
        chart: { type: 'bar', height: 350, toolbar: { show: false } },
        theme: { palette: 'palette9' },
        plotOptions: { bar: { distributed: true, borderRadius: 3, columnWidth: '50%' } },
        dataLabels: { enabled: false },
        legend: { show: false },
        fill: { opacity: 0.7 },
        xaxis: { categories: Object.keys(sortedCategorySales), axisTicks: { show: false } },
        yaxis: { 
            title: { text: t('dashboard.charts.totalSales') }, // ✅ 翻译 Y 轴
            axisTicks: { show: false } 
        },
        tooltip: { y: { formatter: val => '$' + val.toFixed(2) } },
        title: { 
            text: t('dashboard.charts.salesByCategory'), // ✅ 翻译标题
            align: 'left', 
            style: { fontSize: '16px' } 
        }
    };
    new ApexCharts(document.querySelector('#bar-chart'), barChartOptions).render();

    // --- DONUT CHART DATA ---
    const expItems = JSON.parse(localStorage.getItem('bizTrackTransactions')) || [
        { trID: 1, trCategory: "Rent", trAmount: 100.00 },
        { trID: 2, trCategory: "Order Fulfillment", trAmount: 35.00 },
        { trID: 3, trCategory: "Utilities", trAmount: 120.00 },
        { trID: 4, trCategory: "Supplies", trAmount: 180.00 },
        { trID: 5, trCategory: "Miscellaneous", trAmount: 20.00 },
    ];

    const categoryExp = {};
    expItems.forEach(item => { categoryExp[item.trCategory] = (categoryExp[item.trCategory] || 0) + item.trAmount; });

    const donutChartOptions = {
        series: Object.values(categoryExp),
        labels: Object.keys(categoryExp),
        chart: { type: 'donut', width: '100%', toolbar: { show: false } },
        theme: { palette: 'palette1' },
        dataLabels: { enabled: true, style: { fontSize: '14px' } },
        plotOptions: { pie: { customScale: 0.8, donut: { size: '60%' }, offsetY: 20 } },
        legend: { position: 'left', offsetY: 55 },
        tooltip: { y: { formatter: val => '$' + val.toFixed(2) } },
        title: { 
            text: t('dashboard.charts.expenses'), // ✅ 翻译标题
            align: 'left', 
            style: { fontSize: '16px' } 
        }
    };
    new ApexCharts(document.querySelector('#donut-chart'), donutChartOptions).render();
}

// 页面加载执行
window.onload = function () {
  updateDashboardCards();
  renderCharts(); // 初次渲染图表
};
