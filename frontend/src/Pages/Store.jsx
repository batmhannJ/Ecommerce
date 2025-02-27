import React from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Partner from '../Components/Partner/Partner'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import About from '../Components/About/About'
import { useUser } from '../Context/UserContext';

const Store = () => {
  return (
    <div>
      <Partner />
    </div>
  )
}

export default Store
