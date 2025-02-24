import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';

export const Dashboard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesData, setSalesData] = useState({
    avgOrderValue: 0,
    mostProducedProduct: '',
  });

  

  const [salesByCategoryData, setSalesByCategoryData] = useState([]);
  const [salesByProductData, setSalesByProductData] = useState([]);
  const [salesGrowthRateData, setSalesGrowthRateData] = useState([]);
  const [topPurchasesProductData, setTopPurchasesProductData] = useState([]);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        // Fetch from the cleaned-up backend route
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
        console.log('Most Produced Product data:', data);
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
        console.log('Sales by Product Data:', data); // Log the data fetched from the backend
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
        console.log('Fetched Sales by Category Data:', data); // Add this line for debugging
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
        
        // Check if data is an array and has items
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
  
  
  // Dummy data for graphs, replace with actual fetched data
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
    if (previousSales === null) return 'N/A'; // No previous day to compare
    const difference = currentSales - previousSales;
    return difference >= 0 ? `Increase of ${difference}` : `Decrease of ${Math.abs(difference)}`;
  };

// Function to export dashboard as PDF
const generatePDF = async () => {
  const jsPDF = (await import("jspdf")).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", putOnlyUsedFonts: true });

  const fontUrl = "https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap";

  // Load the font from Google Fonts (optional)
  doc.addFileToVFS("Roboto-Regular.ttf", fontUrl);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.setFont("Roboto");

  // Constants for margins
  const margin = 25.4; // 1 inch in mm
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - 2 * margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const title = "Tienda Sales Report";
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2; // Centering the title
  doc.text(title, titleX, margin);

  // Add a line below the title
  doc.line(margin, margin + 5, pageWidth - margin, margin + 5);


  // Initial Y-coordinate for text entries
  let currentY = margin + 15;

  // Function to check and add a new page if needed
  const checkPageOverflow = () => {
    if (currentY > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }
  };

  // "As of" Date
  const currentDate = new Date();
  const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`As of: ${formattedDate}`, doc.internal.pageSize.getWidth() - margin - 32, currentY);
  currentY += 10;
  checkPageOverflow();

  // Total Revenue
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Revenue: ", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`PHP ${totalRevenue}.00`, margin + 30, currentY);
  currentY += 10; // Move down by 10mm after this entry
  checkPageOverflow();

  // Average Order Value
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Average Order Value: ", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`PHP ${salesData.avgOrderValue.toFixed(2)}`, margin + 44, currentY);
  currentY += 10;
  checkPageOverflow();

  // Most Produced Product
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Most Produced Product: ", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(`${salesData.mostProducedProduct || 'N/A'}`, margin + 50, currentY);
  currentY += 10;
  checkPageOverflow();

  // Add a line
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;
  checkPageOverflow();

  // Sales by Category
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

  // Add a line
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;
  checkPageOverflow();

  // Sales by Product
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

  // Add a line
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;
  checkPageOverflow();

  // Sales Growth Rate
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Sales Growth Rate", margin, currentY);
  currentY += 10;

  // Table headers
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const headers = ["Date", "Sales", "Change"];
  const columnWidths = [40, 40, 80]; // Set width for each column
  const rowHeight = 8;

  // Draw the table headers
  headers.forEach((header, index) => {
    doc.text(header, margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY);
  });
  currentY += rowHeight;

  // Add a line after headers
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  // Variables to keep track of previous sales for calculating change
  let previousSales = null;

  // Iterate over sales growth rate data and generate rows
  salesGrowthRateData.forEach((item, index) => {
    const { date, totalSales } = item;
    const salesChange = getSalesChange(totalSales, previousSales);

    doc.setFont("helvetica", "normal");

    // Add the date
    doc.text(date, margin, currentY);

    // Add the sales for the day
    doc.text(`PHP ${totalSales}`, margin + columnWidths[0], currentY);

    // Add the increase/decrease compared to the previous day
    doc.text(salesChange, margin + columnWidths[0] + columnWidths[1], currentY);

    // Update the previous sales value for the next row
    previousSales = totalSales;

    // Move to the next row
    currentY += rowHeight;

    // Check if we need to add a new page
    if (currentY > pageHeight - margin) {
      doc.addPage();
      currentY = margin; // Reset Y coordinate for the new page
    }
  });

  // Save the PDF
  doc.save("dashboard_metrics.pdf");
};



  return (
    <div class="dashboard-container">
    <div className='dashboard'>
        <h1 id="yourElement">Dashboard</h1>

        <div className='dashboard-metrics'>
            {/* Revenue */}
            <div className='metric-box'>
                <h3>Total Revenue</h3>
                <p>₱{totalRevenue}</p>
            </div>

            {/* Average Order Value */}
            <div className='metric-box'>
                <h3>Average Order Value</h3>
                <p>
                    {salesData.avgOrderValue
                    ? `₱${salesData.avgOrderValue.toFixed(2)}`
                    : '₱0.00'}
                </p>
            </div>

            {/* Most Produced Product */}
            <div className='metric-box'>
                <h3>Most Produced Product</h3>
                <p>{salesData.mostProducedProduct || 'N/A'}</p>
            </div>
        </div>
        <div className="export-button-container">
              {/* Export Button */}
              <button className="action-button view" onClick={generatePDF}>Export to PDF</button>
            </div>
                <div className='chart-container'>
            {/* Sales Growth Rate Graph */}
            <div className='chart1'>
                <h3>Sales Growth Rate</h3>
                <Line data={salesGrowthRate} />
            </div>

            {/* Sales by Category Graph */}
            <div className='chart3'>
                <h3>Sales by Category</h3>
                <Pie data={salesByCategory} />
            </div>
            
        </div>
        {/* Sales by Product Graph */}
        <div className='chart2'>
            <h3>Sales by Product</h3>
            <Bar data={salesByProduct} />
        </div>
        </div>


        {/* Top Purchases Product Graph 
        <div className='chart'>
            <h3>Top Purchases Product</h3>
            <Bar data={topPurchasesProduct} />
        </div>*/}
    </div>
  );
};

export default Dashboard;
