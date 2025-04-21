import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import "./Commission.css";

const Commission = () => {
  const [data, setData] = useState({
    monthlyRevenue: [],
    commissionRates: {
      rider: 0.08,
    },
    totalCommissions: {
      fromSeller: 0,
      fromRider: 0,
      total: 0,
    },
    markupData: {
      totalMarkupValue: 0,
      markupDetails: [],
    },
    deliveryCommData: {
      totalDeliveryComm: 0,
      deliveryCommDetails: [],
    },
    topPerformers: {
      sellers: [],
      riders: [
        { name: "Carlo Mendoza", deliveries: 420, commission: 4200 },
        { name: "Anna Lim", deliveries: 385, commission: 3850 },
        { name: "Marco Garcia", deliveries: 310, commission: 3100 },
      ],
    },
  });

  useEffect(() => {
    const fetchCommissionData = async () => {
      try {
        const monthlyResponse = await axios.get("http://localhost:4000/api/monthly-commissions");
        console.log("Monthly Commissions API response:", monthlyResponse.data);

        const markupResponse = await axios.get("http://localhost:4000/api/markup-values");
        console.log("Markup API response:", markupResponse.data);

        const deliveryCommResponse = await axios.get("http://localhost:4000/api/delivery-comm");
        console.log("Delivery Comm API response:", deliveryCommResponse.data);

        const topSellersResponse = await axios.get("http://localhost:4000/api/top-sellers");
        console.log("Top Sellers API response:", topSellersResponse.data);

        const newData = { ...data };

        newData.monthlyRevenue = Array.isArray(monthlyResponse.data.monthlyRevenue)
          ? monthlyResponse.data.monthlyRevenue
          : [];

        if (!monthlyResponse.data.success) {
          console.error("Monthly Commissions API returned error:", monthlyResponse.data.message);
        }

        if (markupResponse.data.success) {
          newData.markupData = {
            totalMarkupValue: markupResponse.data.totalMarkupValue || 0,
            markupDetails: markupResponse.data.markupDetails || [],
          };
          newData.totalCommissions.fromSeller = newData.markupData.totalMarkupValue;
        } else {
          console.error("Markup API returned error:", markupResponse.data.message);
          newData.markupData.error = markupResponse.data.message || "No markup data available";
        }

        if (deliveryCommResponse.data.success) {
          newData.deliveryCommData = {
            totalDeliveryComm: deliveryCommResponse.data.totalDeliveryComm || 0,
            deliveryCommDetails: deliveryCommResponse.data.deliveryCommDetails || [],
          };
          newData.totalCommissions.fromRider = newData.deliveryCommData.totalDeliveryComm;
        } else {
          console.error("Delivery Comm API returned error:", deliveryCommResponse.data.message);
          newData.deliveryCommData.error = deliveryCommResponse.data.message || "No delivery commission data available";
        }

        if (topSellersResponse.data.success) {
          newData.topPerformers.sellers = topSellersResponse.data.topSellers || [];
        } else {
          console.error("Top Sellers API returned error:", topSellersResponse.data.message);
          newData.topPerformers.sellers = [];
        }

        newData.totalCommissions.total =
          newData.totalCommissions.fromSeller + newData.totalCommissions.fromRider;

        setData(newData);
      } catch (error) {
        console.error("Error fetching commission data:", error);
        setData((prevData) => ({
          ...prevData,
          monthlyRevenue: [],
          markupData: {
            ...prevData.markupData,
            error: `Failed to fetch commission data: ${error.message}`,
          },
          deliveryCommData: {
            ...prevData.deliveryCommData,
            error: `Failed to fetch commission data: ${error.message}`,
          },
          topPerformers: {
            ...prevData.topPerformers,
            sellers: [],
          },
        }));
      }
    };

    fetchCommissionData();
  }, []);

  useEffect(() => {
    if (data.monthlyRevenue.length > 0) {
      const ctx = document.getElementById("monthlyCommissionChart").getContext("2d");

      if (window.monthlyCommissionChart instanceof Chart) {
        window.monthlyCommissionChart.destroy();
      }

      const maxCommission = Math.max(
        ...data.monthlyRevenue.map((month) => month.seller + month.rider)
      );
      const suggestedMax = Math.ceil(maxCommission / 1000) * 1000;

      window.monthlyCommissionChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.monthlyRevenue.map((month) => month.month),
          datasets: [
            {
              label: "Seller Commission",
              data: data.monthlyRevenue.map((month) => month.seller),
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.4)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Rider Commission",
              data: data.monthlyRevenue.map((month) => month.rider),
              borderColor: "#16a34a",
              backgroundColor: "rgba(22, 163, 74, 0.4)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: suggestedMax,
              ticks: {
                callback: function (value) {
                  return "₱" + value.toLocaleString();
                },
              },
              title: {
                display: true,
                text: "Commission (₱)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Month",
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ₱${context.parsed.y.toLocaleString()}`;
                },
              },
            },
          },
        },
      });
    }
  }, [data.monthlyRevenue]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="header-title">BizGo Commission Dashboard</h1>
        <p className="header-subtitle">Track income from Seller and Rider commissions</p>
      </header>

      <main className="dashboard-main">
        {/* Summary and Chart Section */}
        <section className="summary-chart-grid">
          {/* Summary Cards */}
          <div className="summary-column">
            <div className="summary-card">
              <div className="card-content">
                <div className="card-text">
                  <div className="card-header">
                    <h3 className="card-title seller">Seller Commission</h3>
                  </div>
                  <p className="card-value">₱{data.totalCommissions.fromSeller.toLocaleString()}</p>
                  <p className="card-subtitle">From markup values</p>
                </div>
                <div className="card-icon-container">
                  <i className="fas fa-store card-icon"></i>
                </div>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-content">
                <div className="card-text">
                  <div className="card-header">
                    <h3 className="card-title rider">Rider Commission</h3>
                  </div>
                  <p className="card-value">₱{data.totalCommissions.fromRider.toLocaleString()}</p>
                  <p className="card-subtitle">From delivery fees</p>
                </div>
                <div className="card-icon-container">
                  <i className="fas fa-motorcycle card-icon"></i>
                </div>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-content">
                <div className="card-text">
                  <div className="card-header">
                    <h3 className="card-title total">Total Commission</h3>
                  </div>
                  <p className="card-value">₱{data.totalCommissions.total.toLocaleString()}</p>
                  <p className="card-subtitle">Combined income</p>
                </div>
                <div className="card-icon-container">
                  <i className="fas fa-money-bill card-icon"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-column">
            <div className="chart-card">
              <h2 className="chart-title">Monthly Commission Trend</h2>
              <div className="chart-container">
                {data.monthlyRevenue.length > 0 ? (
                  <canvas id="monthlyCommissionChart"></canvas>
                ) : (
                  <div className="chart-placeholder">
                    No monthly commission data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Top Performers Section */}
        <section className="performers-grid">
          {/* Top Sellers */}
          <div className="performers-card">
            <h2 className="performers-title">Top Sellers</h2>
            <div className="performers-list">
              {data.topPerformers.sellers.length > 0 ? (
                data.topPerformers.sellers.map((seller, index) => (
                  <div key={seller.id || `seller-${index}`} className="performer-item">
                    <div className="performer-info">
                      <span className={`rank-badge rank-${index + 1}`}>
                        {index + 1}
                      </span>
                      <div className="performer-details">
                        <p className="performer-name">
                          {seller.name} ({seller.shopName})
                          {seller.debugItems && seller.name === 'Unknown Seller' && (
                            <span className="debug-info">
                              Unmatched: {seller.debugItems.join(', ')}
                            </span>
                          )}
                        </p>
                        <p className="performer-stats">Sales: ₱{seller.sales.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="performer-commission">
                      <p className="commission-value">₱{seller.commission.toLocaleString()}</p>
                      <p className="commission-label">Commission</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">
                  No top sellers found. Check transaction item mappings.
                </p>
              )}
            </div>
          </div>

          {/* Top Riders */}
          <div className="performers-card">
            <h2 className="performers-title">Top Riders</h2>
            <div className="performers-list">
              {data.topPerformers.riders.map((rider, index) => (
                <div key={index} className="performer-item">
                  <div className="performer-info">
                    <span className={`rank-badge rank-${index + 1}`}>
                      {index + 1}
                    </span>
                    <div className="performer-details">
                      <p className="performer-name">{rider.name}</p>
                      <p className="performer-stats">Deliveries: {rider.deliveries}</p>
                    </div>
                  </div>
                  <div className="performer-commission">
                    <p className="commission-value">₱{rider.commission.toLocaleString()}</p>
                    <p className="commission-label">Commission</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Commission;