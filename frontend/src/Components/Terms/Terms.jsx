import React, { useState } from "react";
import "./Terms.css";

const Terms = () => {
  const [activeTab, setActiveTab] = useState('terms_of_use');

  // Define the content for each section
  const content = {
    terms_of_use: {
      title: 'Terms of Use',
      description: `
        <div style="text-align: justify;">
          Welcome to Tienda! By accessing or using our website, you agree to comply with and be bound by these Terms of Service. Please read them carefully. 
          By using Tienda’s platform, you agree to these Terms of Service, which govern your use of our website, including all content, features, and services offered on or through the site. 
          These Terms are a legally binding agreement between you and Tienda. If you do not agree with any part of these Terms, you must immediately discontinue using the website. 
          Tienda reserves the right to modify or update these Terms at any time, so please review them regularly. Any changes will be effective upon posting on this page. 
          Your continued use of the website after any such changes constitutes your acceptance of the new Terms. 
          If you have any questions or concerns regarding these Terms of Service, please contact us for further clarification.
        </div>
      `
    },    
    user_accounts: {
      title: 'User Accounts',
      description: `
      <div style="text-align: justify;">
      To use certain features on Tienda, you may be required to create an account. By doing so, you agree to:

        <ul style="text-align: justify; list-style-type: disc; padding-left: 0;">
          <li>Provide accurate, current, and complete information about yourself.</li>
          <li>Keep your account details confidential and secure.
          </li>
          <li>Be responsible for all activities under your account.</li>
        </ul>
        </div>
        `
    },
    product_listing: {
      title: 'Product Listing',
      description: `
      <div style="text-align: justify;">
        <ul style="text-align: justify; list-style-type: disc; padding-left: 0;">
          <li>Tienda is a platform that allows indigenous people to sell their products directly to buyers. Product descriptions, images, and prices are provided by the sellers.
          </li>
          <li>Tienda is not responsible for the accuracy of the product listings, though we strive to ensure that all items meet our standards.</li>
        </ul>
        </div>
      `
    },
    purchases_and_payments: {
      title: 'Purchases and Payments',
      description: `
      <div style="text-align: justify;">

        <ul style="text-align: justify; list-style-type: disc; padding-left: 0;">
          <li>When you make a purchase on Tienda, you agree to pay the listed price, including applicable taxes and shipping fees.
          </li>
          <li>Payment will be processed through the selected payment gateway.
          </li>
          <li>All transactions are subject to Tienda’s payment processing terms
          </li>
        </ul>
        </div>
        `
    },    
    contact_info: {
      title: 'Contact Information',
      description: `
      <div style="text-align: justify;">

      For questions or concerns regarding these Terms of Service, please contact us at:
        <ul style="text-align: justify; list-style-type: disc; padding-left: 0;">
          <li>Email: Email: chairperson@ncip.gov.ph
          </li>
          <li>Landline: (02) 8575 – 1200
          </li>
          <li>Address: 6th and 7th Floors, Sunnymede IT Center, 1614 Quezon Avenue, South Triangle, Quezon City 1103, Philippines.
          </li>
        </ul>
        </div>
        `
    }
  
  };

  const handleTabClick = (tabId) => {
    if (content[tabId]) { // Check if the tab content exists
      setActiveTab(tabId);
    }
  };

  return (
    <section id="terms" className="section__container location__container">
      <h2 className="section__header">Terms of Service</h2>
      <div className="terms">
        <div className="terms-container">
          <div className="sidebar">
            {['terms_of_use', 'user_accounts', 'product_listing', 'purchases_and_payments', 'contact_info'].map(tab => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
{tab.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
            ))}
          </div>

          <div className="content">
            <h3>{content[activeTab]?.title}</h3>
            {content[activeTab]?.description ? (
              <div dangerouslySetInnerHTML={{ __html: content[activeTab]?.description }}></div>
            ) : (
              <p>No content available for this section.</p> // Error handling for missing content
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Terms;
