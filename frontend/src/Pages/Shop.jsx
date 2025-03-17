import React, { useEffect } from 'react';
import Hero from '../Components/Hero/Hero';
import Popular from '../Components/Popular/Popular';
import Offers from '../Components/Offers/Offers';
import NewCollections from '../Components/NewCollections/NewCollections';
import NewsLetter from '../Components/NewsLetter/NewsLetter';
import About from '../Components/About/About';
import { useUser } from '../Context/UserContext';

const Shop = () => {
  // Use useEffect to load the Chatbase script when the component mounts
  useEffect(() => {
    // Implement the Chatbase script
    if(!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        if(!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };
      
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if(prop === "q") {
            return target.q;
          }
          return (...args) => target(prop, ...args);
        }
      });
    }
    
    // Create and append the script element
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "D-CHtOaGn5kDQqm7ZTu-c";
    script.setAttribute("domain", "www.chatbase.co");
    document.body.appendChild(script);
    
    // Clean up function to remove the script when component unmounts
    return () => {
      const existingScript = document.getElementById("D-CHtOaGn5kDQqm7ZTu-c");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div>
      <Hero/>
      <NewCollections/>
    </div>
  );
};

export default Shop;