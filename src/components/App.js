import React from 'react';

import '../css/App.css'
import '../css/Query.css'
import Query from './Query'
import Header from './Header'

class App extends React.Component {
  
  constructor() {
    super()
    
    this.setClassResults = this.setClassResults.bind(this)
    this.setPropertyResults = this.setPropertyResults.bind(this)

    this.state = {
      endpoint: 'http://live.dbpedia.org/sparql',
      scentence: 'Give me...',
      classResults: [],
      propertyResults: []
    }
  }

  setClassResults(results) {
    this.setState({ classResults: results })
  }

  setPropertyResults(results) {
    this.setState({ propertyResults: results })
  }
  
  
  render() {
    return (
      <div className="App">
        <Header />
        <div className="body">
          <div className="query-scentence">
            {this.state.scentence}
          </div>
          <div className="QueryContainer">
            <Query 
              queryType="Class"
              setResults={this.setClassResults}
              results={this.state.classResults}
              endpoint={this.state.endpoint}
            />
            <Query 
              queryType="Property"
              setResults={this.setPropertyResults}
              results={this.state.propertyResults}
              endpoint={this.state.endpoint}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
