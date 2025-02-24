import React, { useEffect } from "react";

const Verify = () => {
  useEffect(() => {
    // Call the processTransaction function when the component mounts
    processTransaction();
  }, []);

  const processTransaction = async () => {
    try {
      // Retrieve query parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('id');
      
      // Check if orderId is present
      if (!orderId) {
        throw new Error('Missing transaction ID parameter');
      }

      // Save transaction information (you might want to send this to your backend)
      await fetch('http://localhost:4000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date(),
          name: 'Customer Name', // You might want to get this from the context or a previous state
          transactionId: orderId,
          status: 'Pending', // Status can be set based on your requirement
        }),
      });

      // Redirect to the Transaction Management page
      window.location.href = '/transaction-management';
    } catch (error) {
      console.error('Error processing transaction:', error);
      // Handle error case (show error message, etc.)
    }
  };

  return (
    <div>
      <h1>Processing Transaction...</h1>
    </div>
  );
};

export default Verify;
