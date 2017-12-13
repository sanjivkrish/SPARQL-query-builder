import React from 'react';

import '../css/App.css'
import '../css/Concept.css'
import Concept from './Concept'

class App extends React.Component {
  
  state = {
    endpoint: 'http://live.dbpedia.org/sparql',
    query: {
      classes: [],
      properties: [],
      literals: []
    },
    classSuggestions: [],
    propertySuggestions: []
  }

  addClassToQuery = (newClass) => {
    const query = this.state.query
    if (query.classes.indexOf(newClass) !== -1) {
      // prevent duplicates
      return
    } 
    query.classes.push(newClass)
    this.setState({
      query
    })
  }

  removeClassFromQuery = (rClass) => {
    const query = this.state.query
    const i = query.classes.indexOf(rClass)
    if (i === -1) return
    query.classes.splice(i, 1)
    this.setState({
      query
    })
  }

  addPropertyToQuery = (newProperty) => {
    const query = this.state.query
    if (query.properties.indexOf(newProperty) !== -1) {
      // prevent duplicates
      return
    }
    query.properties.push(newProperty)
    this.setState({
      query
    })
  }

  addLiteralToQuery = (newLiteral) => {
    const query = this.state.query
    if (query.literals.indexOf(newLiteral) !== -1) {
      // prevent duplicates
      return
    }
    query.literals.push(newLiteral)
    this.setState({
      query
    })
  }

  handleQueryElementClick = (e) => {
    this.removeClassFromQuery(e.target.innerText)
  }

  translateQuery = () => {
    return (
      <span>Give me
        {
          this.state.query.classes.map( (c, i) => {
            let spanEle;

            switch (i) {
              case 0:
                spanEle = <span key={c}> every <mark onClick={this.handleQueryElementClick}>{c}</mark></span>;
                break;
              case 1:
                spanEle = <span key={c}> that is also a <mark onClick={this.handleQueryElementClick}>{c}</mark></span>;
                break;
              default:
                spanEle = <span key={c}> and a <mark onClick={this.handleQueryElementClick}>{c}</mark></span>;
                break;
            }

            return spanEle;
          })
        }
      </span>
    )
  }

  setSuggestions = ({ classSuggestions, propertySuggestions }) => {
    this.setState({
      classSuggestions,
      propertySuggestions
    })
  }

  render() {
    return (
      <div className="App">
        <div className="Header">
          <h2 className="title">SPARQL Query Builder</h2>
        </div>
        <div className="body">
          <div className="query-sentence">
            {this.translateQuery()}
          </div>
          <Concept
            endpoint={this.state.endpoint}
            classSuggestions={this.state.classSuggestions}
            propertySuggestions={this.state.propertySuggestions}
            setSuggestions={this.setSuggestions}
            addClassToQuery={this.addClassToQuery}
            addPropertyToQuery={this.addPropertyToQuery}
            addLiteralToQuery={this.addLiteralToQuery}
          />
        </div>
      </div>
    );
  }
}

export default App;
