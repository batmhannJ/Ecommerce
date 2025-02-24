import React from 'react';
import './Offices.css';
import Offices0 from '../Assets/aa.png';
import Offices1 from '../Assets/bb.png';
import Offices2 from '../Assets/cc.png';
import Offices3 from '../Assets/dd.png';
import Offices4 from '../Assets/ee.png';
import Offices5 from '../Assets/ff.png';
import Offices6 from '../Assets/gg.png';
import Offices7 from '../Assets/hh.png';
import Offices8 from '../Assets/ii.png';
import Offices10 from '../Assets/jj.png';
import Offices11 from '../Assets/kk.png';
import Offices12 from '../Assets/ll.png';
import Offices13 from '../Assets/mm.png';
import Offices14 from '../Assets/nn.png';
import Offices15 from '../Assets/oo.png';
import Offices16 from '../Assets/pp.png';
import Offices17 from '../Assets/qq.png';

const Offices = () => {
  // Array of office images
  const officeImages = [Offices0, Offices1, Offices2, Offices3, Offices4, Offices5, Offices6, Offices7, Offices8, Offices10, Offices11, Offices12, Offices13, Offices14,
    Offices15, Offices16, Offices17];

  return (
    <div className='offices'>
      <h1>Our Offices</h1>
      <div className='offices-content'>
        {officeImages.map((image, index) => (
          <img key={index} src={image} alt={`Office ${index + 1}`} />
        ))}
      </div>
    </div>
  );
};

export default Offices;
