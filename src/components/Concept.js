import React from 'react'

import { throttle, constructClassQuery, constructPropertyQuery, executeQuery } from '../helpers'
import Suggestion from './Suggestion'
import '../css/Concept.css'

class Concept extends React.Component {

  selectClass = (url) => {
    // When a class entity is clicked
    this.props.addClassToQuery(url)
    this.input.value = "";
  }

  selectProperty = (url) => {
    // When a property entity is clicked
    this.props.addPropertyToQuery(url)
    this.input.value = "";
  }

  updateSuggestion = () => {
    
    if (this.input.value === '') {
      this.props.setSuggestions({
        classSuggestions: [],
        propertySuggestions: []
      })
      return
    }
    
    
    const classQuery = constructClassQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked)
    const propertyQuery = constructPropertyQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked, this.props.resultList)

    const classPromise = executeQuery(this.props.endpoint, classQuery)
    const propertyPromise = executeQuery(this.props.endpoint, propertyQuery)
    
    Promise.all([classPromise, propertyPromise])
      .then(([classes, properties]) => {
        if (classes === null || properties === null || this.input.value === '') {
          return
        }
        const classSuggestions = classes.map( c => c.class.value )
        const propertySuggestions = properties.map( p => p.prop.value )
        this.props.setSuggestions({
          classSuggestions,
          propertySuggestions
        })
      })
      .catch( err => console.error(err) )
  }
  
  render() {
    return (
      <div>
        <h2>Concepts</h2>
        <input id="conceptBox" className="rounded" ref={(input) => this.input = input} type="text" onInput={throttle(this.updateSuggestion, 500)}/>
        <span>
          <input id="check-sensitive" className="checkbox" type="checkbox" ref={(input) => this.checkSensitive = input} onChange={throttle(this.updateSuggestion, 500)}></input>
          <label onClick={() => this.checkSensitive.click()}>Case-sensitive</label>
          <input id="check-whole" className="checkbox" type="checkbox" ref={(input) => this.checkWhole = input} onChange={throttle(this.updateSuggestion, 500)}></input>
          <label onClick={() => this.checkWhole.click()}>Whole word only</label>
        </span>
        <div className="ConceptContainer">
          <div className="Concept">
            <h4>Class</h4>
            <Suggestion
              suggestionList={this.props.classSuggestions}
              onItemSelect={this.selectClass}
            />
          </div>
          <div className="Concept">
          <h4>Property</h4>
            <Suggestion
              suggestionList={this.props.propertySuggestions}
              onItemSelect={this.selectProperty}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Concept