import React from 'react';

import ClassQuery from './ClassQuery'

class App extends React.Component {
  
  constructor() {
    super()
    
    this.setClassResults = this.setClassResults.bind(this)

    this.state = {
      classResults: [],
      propertyResults: []
    }
  }

  setClassResults(results) {
    this.setState({ classResults: results })
  }
  
  
  render() {
    return (
      <div>
        <ClassQuery setResults={this.setClassResults} results={this.state.classResults}/>
      </div>
    );
  }
}

export default App;
