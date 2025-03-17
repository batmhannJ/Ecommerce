import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import Items from '../Items/Items';

const NewCollections = () => {
  const [new_collection, setNew_Collection] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/newcollections')
      .then((response) => response.json())
      .then((data) => setNew_Collection(data.slice(0, 8))); 
  }, []);

  return (
    <div id='new-collections' className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item, i) => (
          <Items key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} />
        ))}
      </div>
    </div>
  );
};

export default NewCollections;
