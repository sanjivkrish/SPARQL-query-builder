import React from 'react'

import { throttle, constructClassQuery, constructPropertyQuery, executeQuery } from '../helpers'
import Suggestion from './Suggestion'
import '../css/Concept.css'

class Concept extends React.Component {

  selectClass = (e) => {
    // When a class entity is clicked
    this.props.addClassToQuery(e.target.innerText)
    document.getElementById('conceptBox').value = "";
  }

  selectProperty = (e) => {
    // When a property entity is clicked
    this.props.addPropertyToQuery(e.target.innerText)
    document.getElementById('conceptBox').value = "";
  }

  updateSuggestion = () => {
    if (this.input.value === '') {
      this.props.setSuggestions({
        classSuggestions: [],
        propertySuggestions: []
      })
      return
    }

    const classQuery = constructClassQuery(this.input.value)
    const propertyQuery = constructPropertyQuery(this.input.value)

    const classPromise = executeQuery(this.props.endpoint, classQuery)
    const propertyPromise = executeQuery(this.props.endpoint, propertyQuery)

    Promise.all([classPromise, propertyPromise])
      .then(([classes, properties]) => {
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
        <input id="conceptBox" className="rounded" ref={(input) => this.input = input} type="text" onInput={throttle(this.updateSuggestion, 100)}/>
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