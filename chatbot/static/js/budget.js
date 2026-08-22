/**
 * Globe Trotter - Budget Analytics & Chart.js Visualizer
 */

document.addEventListener("DOMContentLoaded", () => {
  const tripId = window.CURRENT_TRIP_ID;
  if (!tripId) return;

  let categoryChartInstance = null;
  let dailyChartInstance = null;

  async function loadBudgetData() {
    try {
      const res = await fetch(`/trips/${tripId}/budget/chart-data`);
      const data = await res.json();
      if (!data || data.error) return;

      renderCategoryDonut(data.donut);
      renderDailySpending(data.daily, data.summary.currency);
    } catch (err) {
      console.error("Failed to load budget chart data:", err);
    }
  }

  function renderCategoryDonut(donutData) {
    const ctx = document.getElementById("categoryDonutChart");
    if (!ctx) return;

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    const hasData = donutData.values.some((v) => v > 0);

    categoryChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: hasData ? donutData.labels : ["No expenses recorded"],
        datasets: [
          {
            data: hasData ? donutData.values : [1],
            backgroundColor: hasData ? donutData.colors : ["#e2e8f0"],
            borderWidth: 2,
            borderColor: "#ffffff",
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 15,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          tooltip: {
            enabled: hasData,
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const val = context.parsed || 0;
                return ` ${label}: $${val.toFixed(2)}`;
              }
            }
          }
        },
        cutout: "68%"
      }
    });
  }

  function renderDailySpending(dailyData, currency = "USD") {
    const ctx = document.getElementById("dailySpendingChart");
    if (!ctx) return;

    if (dailyChartInstance) {
      dailyChartInstance.destroy();
    }

    dailyChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dailyData.labels,
        datasets: [
          {
            label: `Daily Expenses (${currency})`,
            data: dailyData.values,
            backgroundColor: "rgba(2, 132, 199, 0.8)",
            hoverBackgroundColor: "#0284c7",
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              color: "#64748b"
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              color: "#64748b",
              callback: function (val) {
                return "$" + val;
              }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` Spent: ${currency} ${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }

  // Add Expense Form Submit
  const addExpenseForm = document.getElementById("add-expense-form");
  if (addExpenseForm) {
    addExpenseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(addExpenseForm);

      try {
        const res = await fetch(`/trips/${tripId}/expenses/add`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || "Failed to log expense.");
        }
      } catch (err) {
        console.error(err);
        alert("Network error logging expense.");
      }
    });
  }

  // Delete Expense
  window.deleteExpense = async function (expId, title) {
    if (!confirm(`Delete expense "${title}"?`)) return;

    try {
      const res = await fetch(`/expenses/${expId}/delete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense.");
    }
  };

  // Initial load
  loadBudgetData();
});
