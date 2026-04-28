// SIDEBAR TOGGLE
function openSidebar() {
  var side = document.getElementById('sidebar');
  side.style.display = (side.style.display === "block") ? "none" : "block";
}

function closeSidebar() {
  document.getElementById('sidebar').style.display = 'none';
}

function updateDashboardCards() {
  const expenses = JSON.parse(localStorage.getItem('bizTrackTransactions')) || [];
  const revenues = JSON.parse(localStorage.getItem('bizTrackOrders')) || [];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.trAmount, 0);
  const totalRevenues = revenues.reduce((sum, r) => sum + r.orderTotal, 0);
  const totalBalance = totalRevenues - totalExpenses;
  const numOrders = revenues.length;

  const revDiv = document.getElementById('rev-amount');
  const expDiv = document.getElementById('exp-amount');
  const balDiv = document.getElementById('balance');
  const ordDiv = document.getElementById('num-orders');

  if (!revDiv) return;

  const t = (window.i18n && window.i18n.t) ? window.i18n.t : (key => {
    const fallback = {
      'dashboard.cards.revenue': 'Revenue',
      'dashboard.cards.expenses': 'Expenses',
      'dashboard.cards.orders': 'Orders',
      'dashboard.cards.balance': 'Balance'
    };
    return fallback[key] || key;
  });

  revDiv.innerHTML = `<span class="title">${t('dashboard.cards.revenue')}</span><span class="amount-value">$${totalRevenues.toFixed(2)}</span>`;
  expDiv.innerHTML = `<span class="title">${t('dashboard.cards.expenses')}</span><span class="amount-value">$${totalExpenses.toFixed(2)}</span>`;
  balDiv.innerHTML = `<span class="title">${t('dashboard.cards.balance')}</span><span class="amount-value">$${totalBalance.toFixed(2)}</span>`;
  ordDiv.innerHTML = `<span class="title">${t('dashboard.cards.orders')}</span><span class="amount-value">${numOrders}</span>`;
}

// ✅ 核心修复：封装图表渲染函数，使其可重复调用
window.renderDashboardCharts = function() {
  // 清空旧图表
  document.getElementById('bar-chart').innerHTML = '';
  document.getElementById('donut-chart').innerHTML = '';

  const t = (window.i18n && window.i18n.t) ? window.i18n.t : (key => {
    const fallback = {
      'dashboard.charts.totalSalesLabel': 'Total Sales',
      'dashboard.charts.totalSales': 'Total Sales ($)',
      'dashboard.charts.salesByCategory': 'Sales by Product Category',
      'dashboard.charts.expenses': 'Expenses'
    };
    return fallback[key] || key;
  });

  // BAR CHART
  const items = JSON.parse(localStorage.getItem('bizTrackProducts')) || [
    { prodCat: "Hats", prodPrice: 25.00, prodSold: 20 },
    { prodCat: "Drinkware", prodPrice: 48.50, prodSold: 10 },
    { prodCat: "Clothing", prodPrice: 17.50, prodSold: 70 },
    { prodCat: "Home decor", prodPrice: 12.00, prodSold: 60 },
    { prodCat: "Accessories", prodPrice: 17.00, prodSold: 40 },
  ];

  const categorySales = {};
  items.forEach(p => {
    categorySales[p.prodCat] = (categorySales[p.prodCat] || 0) + (p.prodPrice * p.prodSold);
  });

  const sortedSales = Object.entries(categorySales).sort((a, b) => b[1] - a[1]);

  const barOptions = {
    series: [{ name: t('dashboard.charts.totalSalesLabel'),  sortedSales.map(x => x[1]) }],
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    plotOptions: { bar: { distributed: true, borderRadius: 3 } },
    dataLabels: { enabled: false },
    xaxis: { categories: sortedSales.map(x => x[0]) },
    yaxis: { title: { text: t('dashboard.charts.totalSales') } },
    title: { text: t('dashboard.charts.salesByCategory'), align: 'left' }
  };

  if (document.querySelector('#bar-chart')) {
    new ApexCharts(document.querySelector('#bar-chart'), barOptions).render();
  }

  // DONUT CHART
  const transactions = JSON.parse(localStorage.getItem('bizTrackTransactions')) || [
    { trCategory: "Rent", trAmount: 100 },
    { trCategory: "Order Fulfillment", trAmount: 35 },
    { trCategory: "Utilities", trAmount: 120 },
    { trCategory: "Supplies", trAmount: 180 },
    { trCategory: "Miscellaneous", trAmount: 20 },
  ];

  const categoryExp = {};
  transactions.forEach(t => {
    categoryExp[t.trCategory] = (categoryExp[t.trCategory] || 0) + t.trAmount;
  });

  const donutOptions = {
    series: Object.values(categoryExp),
    chart: { type: 'donut', width: '100%' },
    labels: Object.keys(categoryExp),
    title: { text: t('dashboard.charts.expenses'), align: 'left' },
    legend: { position: 'left' }
  };

  if (document.querySelector('#donut-chart')) {
    new ApexCharts(document.querySelector('#donut-chart'), donutOptions).render();
  }
};

// 页面加载时执行
window.addEventListener('load', function() {
  setTimeout(function() {
    updateDashboardCards();
    if (typeof ApexCharts !== 'undefined') {
      window.renderDashboardCharts();
    }
  }, 100);
});
