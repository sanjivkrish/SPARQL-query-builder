import React from 'react';
import { executeQuery, formatResultQuery, constructPropertyQuery } from '../helpers'

import '../css/App.css'
import '../css/Concept.css'
import '../css/Result.css'
import Concept from './Concept'
import Result from './Result'

class App extends React.Component {
  
  state = {
    endpoint: 'https://dbpedia.org/sparql',
    query: [],
    classSuggestions: [],
    propertySuggestions: [],
    resultList: [],
    loading: false
  }

  setLoading = (loadingState) => {
    this.setState({
      loading: loadingState
    })
  }

  executeResultQuery = () => {
    if (this.state.query.length === 0) {
      this.setState({
        resultList: [],
        propertySuggestions: []
      })
      return
    }
    
    const query = formatResultQuery(this.state.query);
    this.setLoading(true)
    executeQuery(this.state.endpoint, query)
      .then((result) => {
        if (result.length === 0) {
          this.setState({
            resultList: result,
            loading: false
          })
          return
        }
        const propertyQuery = constructPropertyQuery('', false, false, result)
        executeQuery(this.state.endpoint, propertyQuery)
          .then( propertyResult => {
            const propertySuggestions = propertyResult.map( p => p.prop.value )
            this.setState({
              resultList: result,
              propertySuggestions,
              loading: false
            })
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

  removeElementFromQuery = (url) => {
    const query = this.state.query
    const i = query.findIndex( x => x.value === url )
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

  translateQuery = () => {
    return (
      <span>Give me
        {
          this.state.query.map( (c, i) => {
            let spanEle;
            const url = c.value.split('/')
            const word = url[url.length - 1]
            if (c.type === 'class') {
              if (i === 0) {
                spanEle = <span key={c.value}> every <mark onClick={() => this.removeElementFromQuery(c.value)}>{word}</mark></span>;
              } else {
                spanEle = <span key={c.value}> that is also <mark onClick={() => this.removeElementFromQuery(c.value)}>{word}</mark></span>;
              }
            } else {
              if (i === 0) {
                spanEle = <span key={c.value}> everything that has a property <mark onClick={() => this.removeElementFromQuery(c.value)}>{word}</mark></span>;
              } else {
                spanEle = <span key={c.value}> and a property <mark onClick={() => this.removeElementFromQuery(c.value)}>{word}</mark></span>;
              }
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
            resultList={this.state.resultList}
            loading={this.state.loading}
            setLoading={this.setLoading}
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
