import React from 'react';
import './NewsLetter.css';
import News_image from '../Assets/tll.png';

const NewsLetter = () => {
  return (
    <div className='newsletter'>
      <div className='newsletter-content'>
        <img src={News_image} alt="Newsletter" />
      </div>
    </div>
  );
};

export default NewsLetter;
