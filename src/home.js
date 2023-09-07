import React from "react";

import logo from './logo.svg';



function Home() {

  return (
    <div className="home-wrapper">
        <img src={logo} className="App-logo" alt="logo" />
        <p className='rabbit'>
         · Atmósfera mental ·
        </p>
        <p className="rabbit2">
          ...Introduce tus pensamientos...
        </p>

    </div>
  );
}

export default Home;