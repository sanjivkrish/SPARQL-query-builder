import React from 'react';
import { executeQuery, formatResultQuery } from '../helpers'

import '../css/App.css'
import '../css/Concept.css'
import '../css/Result.css'
import Concept from './Concept'
import Result from './Result'

class App extends React.Component {
  
  state = {
    endpoint: 'http://live.dbpedia.org/sparql',
    query: [],
    classSuggestions: [],
    propertySuggestions: [],
    resultList: []
  }

  executeResultQuery = () => {
    let query = formatResultQuery(this.state.query);
    executeQuery(this.state.endpoint, query)
      .then((result) => {
        this.setState({
          resultList: result
        })
      })

  }

  addClassToQuery = (newClass) => {
    const query = this.state.query
    const newElem = {
      type  : 'class',
      value :  newClass
    }

    query.push(newElem)

    this.setState({
      query,
      classSuggestions : [],
      propertySuggestions : []
    })

    this.executeResultQuery();
  }

  removeClassFromQuery = (rClass) => {
    const query = this.state.query
    const i = query.findIndex( x => x.value === rClass )
    query.splice(i, 1)
    this.setState({
      query
    })
    this.executeResultQuery()
  }

  addPropertyToQuery = (newProperty) => {
    const query = this.state.query
    const newElem = {
      type  : 'property',
      value :  newProperty
    }

    query.push(newElem)

    this.setState({
      query,
      classSuggestions : [],
      propertySuggestions : []
    })

    this.executeResultQuery();
  }

  addLiteralToQuery = (newLiteral) => {
    // const query = this.state.query
    // TODO
  }

  handleQueryElementClick = (e) => {
    this.removeClassFromQuery(e.target.innerText)
  }

  translateQuery = () => {
    return (
      <span>Give me
        {
          this.state.query.map( (c, i) => {
            let spanEle;

            if (c.type === 'class') {
              if (i === 0) {
                spanEle = <span key={c.value}> every <mark onClick={this.handleQueryElementClick}>{c.value}</mark></span>;
              } else {
                spanEle = <span key={c.value}> that is also <mark onClick={this.handleQueryElementClick}>{c.value}</mark></span>;
              }
            } else {
              spanEle = <span key={c.value}> and a property <mark onClick={this.handleQueryElementClick}>{c.value}</mark></span>;
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

  setResultList = (resultList) => {
    this.setState({
      resultList
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
          />
          <Result
            resultList={this.state.resultList}
          />
        </div>
      </div>
    );
  }
}

export default App;
