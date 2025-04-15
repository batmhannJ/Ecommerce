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
      sellers: [
        { id: 1, name: "Juan Dela Cruz", sales: 128000, commission: 0 },
        { id: 2, name: "Maria Santos", sales: 98000, commission: 0 },
        { id: 3, name: "Pedro Reyes", sales: 87000, commission: 0 },
      ],
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

        const newData = { ...data };

        // Ensure monthlyRevenue is always an array
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
        }));
      }
    };

    fetchCommissionData();
  }, []);

  useEffect(() => {
    if (data.monthlyRevenue.length > 0) {
      const ctx = document.getElementById("monthlyCommissionChart").getContext("2d");

      // Destroy existing chart if it exists to prevent overlap
      if (window.monthlyCommissionChart instanceof Chart) {
        window.monthlyCommissionChart.destroy();
      }

      // Compute max value for dynamic scaling
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
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">BizGo Admin Commission Dashboard</h1>
          <p className="text-gray-500">Income generated from Seller and Rider commissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-blue-600 text-lg font-semibold mb-2">Partner Commission</div>
            <div className="text-3xl font-bold">₱{data.totalCommissions.fromSeller.toLocaleString()}</div>
            <div className="text-gray-500 text-sm mt-1">Based on markup values</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-green-600 text-lg font-semibold mb-2">Commission from Rider</div>
            <div className="text-3xl font-bold">₱{data.totalCommissions.fromRider.toLocaleString()}</div>
            <div className="text-gray-500 text-sm mt-1">Based on delivery commission</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-purple-600 text-lg font-semibold mb-2">Total Commission</div>
            <div className="text-3xl font-bold">₱{data.totalCommissions.total.toLocaleString()}</div>
            <div className="text-gray-500 text-sm mt-1">Combined income from all sources</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Monthly Commission Income</h2>
          <div className="h-64">
            {data.monthlyRevenue.length > 0 ? (
              <canvas id="monthlyCommissionChart" className="w-full h-full"></canvas>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No monthly commission data available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Sellers</h2>
            <div className="space-y-4">
              {data.topPerformers.sellers.map((seller, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : index === 1
                          ? "bg-gray-100 text-gray-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{seller.name}</div>
                      <div className="text-sm text-gray-500">Sales: ₱{seller.sales.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">₱{seller.commission.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Commission</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Riders</h2>
            <div className="space-y-4">
              {data.topPerformers.riders.map((rider, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-800"
                          : index === 1
                          ? "bg-gray-100 text-gray-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{rider.name}</div>
                      <div className="text-sm text-gray-500">Deliveries: {rider.deliveries}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">₱{rider.commission.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Commission</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commission;