import React from 'react';

import '../css/App.css'
import '../css/Concept.css'
import Concept from './Concept'

class App extends React.Component {
  
  render() {
    return (
      <div className="App">
        <div className="Header">
          <h2 className="title">SPARQL Query Builder</h2>
        </div>
        <div className="body">
          <Concept />
        </div>
      </div>
    );
  }
}

export default App;
