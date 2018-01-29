import React from 'react';
import axios from 'axios'
import { executeQuery, formatResultQuery, constructPropertyQuery, constructObjectQuery } from '../helpers'

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
    objectSuggestions: [],
    cachedSuggestions: {},
    resultList: [],
    loading: false,
    cancelToken: axios.CancelToken.source()
  }

  setLoading = (loadingState) => {
    this.setState({
      loading: loadingState
    })
  }

  setCancelToken = (token) => {
    this.setState({
      cancelToken: token
    })
  }

  executeResultQuery = () => {
    if (this.state.query.length === 0) {
      this.setState({
        resultList: [],
        classSuggestions: [],
        propertySuggestions: [],
        objectSuggestions: []
      })
      return
    }
    
    const query = formatResultQuery(this.state.query);
    this.setLoading(true)
    this.state.cancelToken.cancel('Request outdated')
    this.setCancelToken(axios.CancelToken.source())
    executeQuery(this.state.endpoint, query)
      .then((result) => {
        if (result.length === 0) {
          this.setState({
            resultList: result,
            loading: false
          })
          return
        }
        
        // Offer property and object suggestions
        const propertyQuery = constructPropertyQuery('', false, false, result)
        const propertyPromise = executeQuery(this.state.endpoint, propertyQuery)

        let allPromises
        if (this.state.query.filter( e => e.type === 'property').length !== 0) {
          const objectQuery = constructObjectQuery('', false, false, this.state.query)
          const objectPromise = executeQuery(this.state.endpoint, objectQuery)
          allPromises = Promise.all([propertyPromise, objectPromise])
        } else {
          allPromises = Promise.all([propertyPromise])
        }

        allPromises
          .then(([properties, objects]) => {
            const propertySuggestions = properties.map( p => p.prop.value )
            const objectSuggestions = objects ? objects.map( p => p.object.value ) : []
            this.setState({
              resultList: result,
              classSuggestions: [],
              propertySuggestions,
              objectSuggestions,
              cachedSuggestions: { propertySuggestions, objectSuggestions },
              loading: false
            })
          })
      })
  }

  addElementToQuery = (element, type) => {
    const query = this.state.query
    query.push({
      type,
      value: element
    })
    this.setState({
      query
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
                spanEle = <span key={c.value}> every <span className="selection class" onClick={() => this.removeElementFromQuery(c.value)}>{word}</span></span>;
              } else {
                spanEle = <span key={c.value}> that is also <span className="selection class" onClick={() => this.removeElementFromQuery(c.value)}>{word}</span></span>;
              }
            } else {
              if (i === 0) {
                spanEle = <span key={c.value}> everything that has a property <span className="selection property" onClick={() => this.removeElementFromQuery(c.value)}>{word}</span></span>;
              } else {
                spanEle = <span key={c.value}> and a property <span className="selection property" onClick={() => this.removeElementFromQuery(c.value)}>{word}</span></span>;
              }
            }

            return spanEle;
          })
        }
      </span>
    )
  }

  setSuggestions = ({ classSuggestions, propertySuggestions, objectSuggestions }) => {
    classSuggestions = classSuggestions || this.state.classSuggestions
    propertySuggestions = propertySuggestions || this.state.propertySuggestions
    objectSuggestions = objectSuggestions || this.state.objectSuggestions
    this.setState({
      classSuggestions,
      propertySuggestions,
      objectSuggestions
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
            query={this.state.query}
            resultList={this.state.resultList}
            loading={this.state.loading}
            setLoading={this.setLoading}
            cancelToken={this.state.cancelToken}
            setCancelToken={this.setCancelToken}
            classSuggestions={this.state.classSuggestions}
            propertySuggestions={this.state.propertySuggestions}
            objectSuggestions={this.state.objectSuggestions}
            setSuggestions={this.setSuggestions}
            cachedSuggestions={this.state.cachedSuggestions}
            addElementToQuery={this.addElementToQuery}
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
