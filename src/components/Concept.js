import React from 'react'
import axios from 'axios'

import { throttle, constructClassQuery, constructPropertyQuery } from '../helpers'
import Suggestion from './Suggestion'
import '../css/Concept.css'

class Concept extends React.Component {

  selectClass = (e) => {
    // When a class entity is clicked
    this.props.addClassToQuery(e.target.innerText)
  }

  selectProperty = (e) => {
    // When a property entity is clicked
    this.props.addPropertyToQuery(e.target.innerText)  
  }

  executeQuery = (query) => {
    return axios({
      url: this.props.endpoint,
      method: 'POST',
      headers: {
        'Accept': 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: { query } // using params instead of data because of urlencoded data
    })
      .then((res) => {
        // console.log(res)
        return res.data.results.bindings
      })
      .catch( err => console.log(err) )
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

    const classPromise = this.executeQuery(classQuery)
    const propertyPromise = this.executeQuery(propertyQuery)

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
        <input className="rounded" ref={(input) => this.input = input} type="text" onInput={throttle(this.updateSuggestion, 100)}/>
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