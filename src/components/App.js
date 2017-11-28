import React from 'react';

import '../css/App.css'
import '../css/Concept.css'
import Concept from './Concept'
import Header from './Header'

class App extends React.Component {
  
  constructor() {
    super()

    this.state = {
      endpoint: 'http://live.dbpedia.org/sparql',
      sentence: 'Give me...'
    }
  }
  
  render() {
    return (
      <div className="App">
        <Header />
        <div className="body">
          <div className="query-sentence">
            {this.state.sentence}
          </div>
          <Concept
            endpoint={this.state.endpoint}
          />
        </div>
      </div>
    );
  }
}

export default App;
