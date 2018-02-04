import React from 'react';
import axios from 'axios'

// formatResultQuery
import { executeQuery, constructPropertyQuery, constructObjectQuery, constructResultQuery, getLastUrlElement } from '../helpers'

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

  executeResultQuery = (query) => {
    if (query.length === 0) {
      this.setState({
        resultList: [],
        classSuggestions: [],
        propertySuggestions: [],
        objectSuggestions: [],
        loading: false
      })
      return
    }
    // const query = formatResultQuery(this.state.query);
    const queryString = constructResultQuery(query);
    this.setLoading(true)
    this.state.cancelToken.cancel('Request outdated')
    this.setCancelToken(axios.CancelToken.source())
    executeQuery(this.state.endpoint, queryString)
      .then((result) => {
        if (result === null) {
          return // catch outdated requests
        }

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
        const lastQueryElement = query[query.length - 1]
        if (lastQueryElement && lastQueryElement.type === 'property' && lastQueryElement.object === undefined) {
          const objectQuery = constructObjectQuery('', false, false, query)
          const objectPromise = executeQuery(this.state.endpoint, objectQuery)
          allPromises = Promise.all([propertyPromise, objectPromise])
        } else {
          allPromises = Promise.all([propertyPromise])
        }

        allPromises
          .then(([properties, objects]) => {
            if (properties === null || objects === null) {
              return // catch outdated requests
            }

            const propertyIndices = []
            query.forEach( (e, i) => {
              if (e.type === 'property') {
                propertyIndices.push(i)
              }
            })

            // Very often when chosing an uri as an object
            // dbpedia returns results that dont fully match the chosen object
            // Thatswhy there is additional filtering
            const resultFilter = (r) => {
              const values = Object.values(r)
              return values.every( (resultObject, i) => {
                if (i > 0) { // First element is always the subject -> ignore it
                  if (resultObject.type === 'uri') {
                    const resultObjectWord = getLastUrlElement(resultObject.value)
                    const chosenProperty = query[ propertyIndices[i - 1] ]
                    if (chosenProperty.object !== undefined) {
                      const chosenObjectWord = getLastUrlElement(chosenProperty.object.value)
                      return resultObjectWord === chosenObjectWord
                    }
                  }
                }
                return true
              })
            }

            this.setState({
              resultList: result.filter( resultFilter ),
              classSuggestions: [],
              propertySuggestions: properties || [],
              objectSuggestions: objects || [],
              cachedSuggestions: { propertySuggestions: properties, objectSuggestions: objects || [] },
              loading: false
            })
          })
          .catch( err => null )
      })
      .catch( err => null )
  }

  addElementToQuery = (element, type) => {
    const query = [...this.state.query]
    if (type === 'object') {
      const lastElement = query.pop()
      if (lastElement.type === 'property') {
        lastElement.object = element
        query.push(lastElement)
      } else {
        query.push(lastElement)
      }
    } else {
      query.push({ type, element })
    }
    this.setState({
      query,
      resultList: []
    })
    this.executeResultQuery(query);
  }

  removeElementFromQuery = (url) => {
    const query = [...this.state.query]
    query.forEach( (x, i) => {
      if (x.type === 'property') {
        if (x.element.value === url) {
          query.splice(i, 1)
          return
        }
        
        if (x.object !== undefined && x.object.value === url) {
          delete x.object
          return
        }
      } else {
        if (x.element.value === url) {
          query.splice(i, 1)
          return
        }
      }
    })
    this.setState({
      query,
      resultList: []
    })
    this.executeResultQuery(query)
  }

  translateQuery = () => {
    return (
      <span>Give me
        {
          this.state.query.map( (c, i) => {
            let spanEle;
            const word = getLastUrlElement(c.element.value)
            const firstLetterIsVowel = ['a', 'e', 'i', 'o', 'u'].indexOf(word[0].toLowerCase()) !== -1
            if (c.type === 'class') {
              if (i === 0) {
                spanEle = <span key={c.element.value}> every <span className="selection class" onClick={() => this.removeElementFromQuery(c.element.value)}>{word}</span></span>;
              } else if (i === 1) {
                spanEle = <span key={c.element.value}> that is also {firstLetterIsVowel ? 'an' : 'a'} <span className="selection class" onClick={() => this.removeElementFromQuery(c.element.value)}>{word}</span></span>;
              } else {
                spanEle = <span key={c.element.value}> and {firstLetterIsVowel ? 'an' : 'a'} <span className="selection class" onClick={() => this.removeElementFromQuery(c.element.value)}>{word}</span></span>;    
              }
            } else if (c.type === 'property') {
              spanEle = <span key={c.element.value}>{ i === 0 ? ' everything that has a property ' : ' and a property '}
                  <span className="selection property" onClick={() => this.removeElementFromQuery(c.element.value)}>{word}</span>
                  <span> </span>
                  { c.object !== undefined ? 
                    <span className="selection object" onClick={() => this.removeElementFromQuery(c.object.value)}>
                      ({getLastUrlElement(c.object.value)})
                    </span> : null 
                  }
                </span>;
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
            query={this.state.query}
            resultList={this.state.resultList}
          />
        </div>
      </div>
    );
  }
}

export default App;
