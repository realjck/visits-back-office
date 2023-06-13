import './App.css';
import {useState} from "react";
import VisitRow from './components/VisitRow';

function App(){
  // state

  // behave

  // render

  const renderList = () => {
    const components = [];

    for (let i = 0; i < 100; i++) {
      components.push(<VisitRow key={i} />);
    }

    return components;
  };

  return (
    <div>
        <div className='container'>
          <div className='back-office-header'>
            <h1>visits back-office</h1>
            <div className='back-office-header-navbar'>
              <div className='active back-office-header-date'>
                <button>📅</button><img src="/arrow.svg" alt="arrow"/>
              </div>
              <div className="back-office-header-name">
                <button>👥</button><img src="/arrow.svg" alt="arrow"/>
              </div>
              <div className="back-office-header-duration">
                <button>⌚️</button><img src="/arrow.svg" alt="arrow"/>
              </div>
            </div>
          </div>
          <div className='back-office-body'>
            {renderList()}
          </div>
          
        </div>
    </div>
  );
}

export default App;
