import React from 'react'
import axios from 'axios'
import { throttle, constructClassQuery, constructPropertyQuery, constructObjectQuery, executeQuery, getLastUrlElement } from '../helpers'
import Suggestion from './Suggestion'
import '../css/Concept.css'

class Concept extends React.Component {

  selectElement = (type) => {
    return (element) => {
      this.props.addElementToQuery(element, type)
      this.input.value = ""
    }   
  }

  updateSuggestion = () => {
    if (this.input.value === '') {
      this.props.cancelToken.cancel('Request outdated') // cancel all remaining open requests
      this.props.setCancelToken(axios.CancelToken.source()) // generate new cancelToken
      this.props.setSuggestions({
        classSuggestions: [],
      })
      if (this.props.resultList.length === 0) {
        this.props.setSuggestions({
          classSuggestions: [],
          propertySuggestions: [],
          objectSuggestions: []
        })
      } else {
        this.props.setSuggestions(this.props.cachedSuggestions)
      }
      this.props.setLoading(false) // remove loading sign
      return
    }
    
    const classQuery = constructClassQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked)
    const propertyQuery = constructPropertyQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked, this.props.resultList)
    
    const classPromise = executeQuery(this.props.endpoint, classQuery, this.props.cancelToken.token)
    const propertyPromise = executeQuery(this.props.endpoint, propertyQuery, this.props.cancelToken.token)

    let allPromises
    const lastQueryElement = this.props.query[this.props.query.length - 1]
    if (lastQueryElement && lastQueryElement.type === 'property' && lastQueryElement.object === undefined) {
      const objectQuery = constructObjectQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked, this.props.query)
      const objectPromise = executeQuery(this.props.endpoint, objectQuery, this.props.cancelToken.token)
      allPromises = Promise.all([classPromise, propertyPromise, objectPromise])
    } else {
      allPromises = Promise.all([classPromise, propertyPromise])
    }
    this.props.setLoading(true) // add loading sign
    allPromises
      .then(([classes, properties, objects]) => {
        if (this.input.value === '' || classes === null || properties === null || objects === null) {
          // catch outdated requests
          return
        }

        // some extra filtering because dbpedia is not accurate enough
        const filterFunction = (e) => {
          const sensitive = this.checkSensitive.checked
          const whole = this.checkWhole.checked
          
          const input = this.input.value
          const word = getLastUrlElement(e.variable.value)
          
          if (!sensitive && !whole) {
            return word.toLowerCase().indexOf(input.toLowerCase()) !== -1
          }

          if (sensitive && !whole) {
            return word.indexOf(input) !== -1
          }

          if (!sensitive && whole) {
            const regex = `^${input.toLowerCase()}$`
            return word.toLowerCase().match(new RegExp(regex)) !== null
          }

          if (sensitive && whole) {
            const regex = `^${input}$`
            const a = word.indexOf(input) !== -1
            const b = word.match(new RegExp(regex)) !== null
            return a && b
          }
        }

        this.props.setSuggestions({
          classSuggestions: classes.filter( filterFunction ),
          propertySuggestions: properties.filter( filterFunction ),
          objectSuggestions: objects ? objects.filter( filterFunction ) : []
        })
        this.props.setLoading(false)
      })
      .catch( err => err)
  }
  
  throttleTime = 2000
  render() {
    return (
      <div>
        <h2>Concepts</h2>
        <input id="conceptBox" className="rounded" ref={(input) => this.input = input} type="text" onInput={throttle(this.updateSuggestion, this.throttleTime)}/>
        <span>
          <input id="check-sensitive" className="option" type="checkbox" ref={(input) => this.checkSensitive = input} onChange={throttle(this.updateSuggestion, this.throttleTime)}></input>
          <label onClick={() => this.checkSensitive.click()}>Case-sensitive</label>
          <input id="check-whole" className="option" type="checkbox" ref={(input) => this.checkWhole = input} onChange={throttle(this.updateSuggestion, this.throttleTime)}></input>
          <label onClick={() => this.checkWhole.click()}>Whole word only</label>
          {
            this.props.loading ?
            <span className="img-wrapper">
              <img className={`option loader ${this.props.loading ? '' : 'hidden'}`} src="./loader.gif" alt="Loading..."/>
            </span> : null
          }
        </span>
        <div className="ConceptContainer">
          <div className="Concept">
            <h4>Class</h4>
            <Suggestion
              suggestionList={this.props.classSuggestions}
              onItemSelect={this.selectElement('class')}
              query={this.props.query}
            />
          </div>
          <div className="Concept">
            <h4>Property</h4>
            <Suggestion
              suggestionList={this.props.propertySuggestions}
              onItemSelect={this.selectElement('property')}
              query={this.props.query}
            />
          </div>
            <div className="Concept">
            <h4>Property value</h4>
            <Suggestion
              suggestionList={this.props.objectSuggestions}
              onItemSelect={this.selectElement('object')}
              query={this.props.query}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Concept