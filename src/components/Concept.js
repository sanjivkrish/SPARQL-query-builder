import React from 'react'
import axios from 'axios'

import { throttle, constructClassQuery, constructPropertyQuery } from '../helpers'
import Suggestion from './Suggestion'
import '../css/Concept.css'

class Concept extends React.Component {
  
  constructor() {
    super()

    this.state = {
      classResults: [],
      propertyResults: []
    }
    
    this.executeQuery = this.executeQuery.bind(this)
    this.selectClass = this.selectClass.bind(this)
    this.selectProperty = this.selectProperty.bind(this)
    this.updateSuggestion = this.updateSuggestion.bind(this)
  }

  selectClass(e) {
    // When a class entity is clicked
  }

  selectProperty(e) {
    // When a property entity is clicked
  }

  executeQuery(query) {
    axios({
      url: this.props.endpoint,
      method: 'POST',
      headers: {
        'Accept': 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: { query } // using params instead of data because of urlencoded data
    })
      .then((res) => res.data.results.bindings)
      .then((data) => {
        //
        // Check if data belongs to class/property query by inspecting first element
        //
        if (Array.isArray(data) && data[0].hasOwnProperty('class')) {
          this.setState({classResults : data.map( d => {
            return d.class.value
          })})
        } else {
          this.setState({propertyResults : data.map( d => {
            return d.prop.value
          })})
        }
      })
  }

  updateSuggestion() {
    if (this.input.value === '') {
      this.setState({classResults : []})
      this.setState({propertyResults : []})
      return
    }

    let classQuery = constructClassQuery(this.input.value)
    let propertyQuery = constructPropertyQuery(this.input.value)

    this.executeQuery(classQuery)
    this.executeQuery(propertyQuery)
  }
  
  render() {
    return (
      <div>
      <h2>Concepts</h2>
      <input className="rounded" ref={(input) => this.input = input} type="text" onInput={throttle(this.updateSuggestion, 100)}/>
      <div className="ConceptContainer">
        <div className="Concept">
          <h4>Class</h4>
          <Suggestion
            suggestionList={this.state.classResults}
            onItemSelect={this.selectClass}
          />
        </div>
        <div className="Concept">
        <h4>Property</h4>
          <Suggestion
            suggestionList={this.state.propertyResults}
            onItemSelect={this.selectProperty}
          />
        </div>
      </div>
      </div>
    )
  }
 
}

export default Concept