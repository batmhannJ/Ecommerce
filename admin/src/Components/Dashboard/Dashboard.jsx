import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import Plot from "react-plotly.js"; // Import Plotly

export const Dashboard = () => {
  const [ribbonData, setRibbonData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesData, setSalesData] = useState({
    avgOrderValue: 0,
    mostProducedProduct: '',
  });

  const [salesByCategoryData, setSalesByCategoryData] = useState([]);
  const [salesByProductData, setSalesByProductData] = useState([]);
  const [salesGrowthRateData, setSalesGrowthRateData] = useState([]);
  const [topPurchasesProductData, setTopPurchasesProductData] = useState([]);

  // All useEffect hooks remain unchanged
  useEffect(() => {
    const fetchRibbonData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/plotly/datasets/master/3d-ribbon.json"
        );
        const figure = await response.json();
        setRibbonData(figure.data);
      } catch (error) {
        console.error("Error fetching ribbon data:", error);
      }
    };
    fetchRibbonData();
  }, []);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/transactions/totalAmount');
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Total revenue data:', data);
        setTotalRevenue(data);
      } catch (error) {
        console.error('Error fetching total revenue:', error);
      }
    };
    fetchTotalRevenue();
  }, []);

  useEffect(() => {
    const fetchAverageOrderValue = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/transactions/averageOrderValue');
        console.log('AOV Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Average Order Value data:', data);
        setSalesData(prevData => ({
          ...prevData,
          avgOrderValue: data,
        }));
      } catch (error) {
        console.error('Error fetching average order value:', error);
      }
    };
    fetchAverageOrderValue();
  }, []);

  useEffect(() => {
    const fetchMostProducedProduct = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/transactions/mostProducedProduct');
        console.log('Most Produced Product Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Most Purchased Product data:', data);
        setSalesData(prevData => ({
          ...prevData,
          mostProducedProduct: data,
        }));
      } catch (error) {
        console.error('Error fetching most produced product:', error);
      }
    };
    fetchMostProducedProduct();
  }, []);

  useEffect(() => {
    const fetchSalesByProduct = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/transactions/salesByProduct');
        if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
        const data = await response.json();
        console.log('Sales by Product Data:', data);
        setSalesByProductData(data);
      } catch (error) {
        console.error('Error fetching sales by product:', error);
      }
    };
    fetchSalesByProduct();
  }, []);

  useEffect(() => {
    const fetchSalesByCategory = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/transactions/salesByCategory');
        if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched Sales by Category Data:', data);
        setSalesByCategoryData(data);
      } catch (error) {
        console.error('Error fetching sales by category:', error);
      }
    };
    fetchSalesByCategory();
  }, []);

  useEffect(() => {
    const fetchSalesGrowthRate = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/transactions/salesGrowthRate');
        if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
        const data = await response.json();
        console.log('Sales Growth Rate Data:', data);
        setSalesGrowthRateData(data);
      } catch (error) {
        console.error('Error fetching sales growth rate:', error);
      }
    };
    fetchSalesGrowthRate();
  }, []);

  useEffect(() => {
    const fetchTopPurchasesProduct = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/transactions/topPurchasesProduct');
        if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
        const data = await response.json();
        console.log('Top Purchases Product Data:', data);
        if (Array.isArray(data) && data.length) {
          setTopPurchasesProductData(data);
        } else {
          console.log('No data available for Top Purchases Product.');
        }
      } catch (error) {
        console.error('Error fetching top purchases product:', error);
      }
    };
    fetchTopPurchasesProduct();
  }, []);

  // Chart data preparation (unchanged)
  const salesByProduct = {
    labels: salesByProductData.length ? salesByProductData.map(item => item.product) : ['No data'],
    datasets: [
      {
        label: 'Sales by Product',
        data: salesByProductData.length ? salesByProductData.map(item => item.totalSales) : [0],
        backgroundColor: '#ff6384',
      },
    ],
  };

  const salesByCategory = {
    labels: salesByCategoryData.map(item => item.category),
    datasets: [
      {
        label: 'Sales by Category',
        data: salesByCategoryData.map(item => item.totalSales),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
      },
    ],
  };

  const salesGrowthRate = {
    labels: salesGrowthRateData.map(item => item.date),
    datasets: [
      {
        label: 'Sales Growth Rate',
        data: salesGrowthRateData.map(item => item.totalSales),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  const topPurchasesProduct = {
    labels: topPurchasesProductData.length ? topPurchasesProductData.map(item => item.product) : ['No data'],
    datasets: [
      {
        label: 'Top Purchases Product',
        data: topPurchasesProductData.length ? topPurchasesProductData.map(item => item.totalPurchases) : [0],
        backgroundColor: '#36a2eb',
      },
    ],
  };

  const getSalesChange = (currentSales, previousSales) => {
    if (previousSales === null) return 'N/A';
    const difference = currentSales - previousSales;
    return difference >= 0 ? `Increase of ${difference}` : `Decrease of ${Math.abs(difference)}`;
  };

  // PDF generation function with corrected typo
  const generatePDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", putOnlyUsedFonts: true });

    const fontUrl = "https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap";
    doc.addFileToVFS("Roboto-Regular.ttf", fontUrl);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    const margin = 25.4;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - 2 * margin;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const title = "BizGo Sales Report";
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, margin);

    doc.line(margin, margin + 5, pageWidth - margin, margin + 5);

    let currentY = margin + 15;

    const checkPageOverflow = () => {
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    };

    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`As of: ${formattedDate}`, doc.internal.pageSize.getWidth() - margin - 32, currentY);
    currentY += 10;
    checkPageOverflow();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Revenue: ", margin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`PHP ${totalRevenue}.00`, margin + 30, currentY);
    currentY += 10;
    checkPageOverflow();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Average Order Value: ", margin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`PHP ${salesData.avgOrderValue.toFixed(2)}`, margin + 44, currentY);
    currentY += 10;
    checkPageOverflow();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Most Purchased Product: ", margin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${salesData.mostProducedProduct || 'N/A'}`, margin + 50, currentY);
    currentY += 10;
    checkPageOverflow();

    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;
    checkPageOverflow();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sales by Category:", margin, currentY);
    currentY += 10;
    salesByCategoryData.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.text(`    ${item.category}: PHP ${item.totalSales}.00`, margin, currentY);
      currentY += 10;
      checkPageOverflow();
    });

    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;
    checkPageOverflow();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sales by Product:", margin, currentY);
    currentY += 10;
    salesByProductData.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.text(`    ${item.product}: PHP ${item.totalSales}.00`, margin, currentY);
      currentY += 10;
      checkPageOverflow();
    });

    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;
    checkPageOverflow();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Growth Rate", margin, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const headers = ["Date", "Sales", "Change"];
    const columnWidths = [40, 40, 80];
    const rowHeight = 8;

    headers.forEach((header, index) => {
      doc.text(header, margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY);
    });
    currentY += rowHeight;

    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    let previousSales = null;

    salesGrowthRateData.forEach((item, index) => {
      const { date, totalSales } = item;
      const salesChange = getSalesChange(totalSales, previousSales);

      doc.setFont("helvetica", "normal");
      doc.text(date, margin, currentY);
      doc.text(`PHP ${totalSales}`, margin + columnWidths[0], currentY);
      doc.text(salesChange, margin + columnWidths[0] + columnWidths[1], currentY);
      previousSales = totalSales;
      currentY += rowHeight;

      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    });

    doc.save("dashboard_metrics.pdf");
  };

  const generateXLSX = async () => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      const summaryData = [
        ['BizGo Sales Report'],
        [`As of: ${new Date().toLocaleDateString()}`],
        [''],
        ['Total Revenue', `₱${totalRevenue}`],
        ['Average Order Value', `₱${salesData.avgOrderValue.toFixed(2)}`],
        ['Most Purchased Product', salesData.mostProducedProduct || 'N/A'],
        ['']
      ];
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
      XLSX.writeFile(wb, 'bizgo_sales_data.xlsx');
      console.log('Excel file generated successfully');
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>BizGo Insights</h1>
        <div className="action-buttons">
          <button className="btn btn-pdf" onClick={generatePDF}>PDF</button>
          <button className="btn btn-xlsx" onClick={generateXLSX}>XLSX</button>
        </div>
      </header>
      <main className="dashboard-main">
        <section className="metrics-section">
          <div className="metric">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-value">₱{totalRevenue}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Avg. Order Value</span>
            <span className="metric-value">
              {salesData.avgOrderValue ? `₱${salesData.avgOrderValue.toFixed(2)}` : '₱0.00'}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Top Product</span>
            <span className="metric-value">{salesData.mostProducedProduct || 'N/A'}</span>
          </div>
        </section>
        <section className="charts-section">
          <div className="chart">
            <h2>Sales Growth</h2>
            <div className="chart-content">
              <Line data={salesGrowthRate} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="chart">
            <h2>By Category</h2>
            <div className="chart-content">
              <Pie data={salesByCategory} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="chart chart-wide">
            <h2>By Product</h2>
            <div className="chart-content">
              <Bar data={salesByProduct} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;