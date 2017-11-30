import React from 'react'
import axios from 'axios'

import { throttle, constructClassQuery, constructPropertyQuery } from '../helpers'
import Suggestion from './Suggestion'
import '../css/Concept.css'

class Concept extends React.Component {
  
  constructor() {
    super()

    this.state = {
      endpoint: 'http://live.dbpedia.org/sparql',
      sentence: 'Give me...',
      classResults: [],
      propertyResults: []
    }
  }

  selectClass = (e) => {
    // When a class entity is clicked
  }

  selectProperty = (e) => {
    // When a property entity is clicked
  }

  executeQuery = (query) => {
    return axios({
      url: this.state.endpoint,
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
      this.setState({
        classResults : [],
        propertyResults: []
      })
      return
    }

    const classQuery = constructClassQuery(this.input.value)
    const propertyQuery = constructPropertyQuery(this.input.value)

    const classPromise = this.executeQuery(classQuery)
    const propertyPromise = this.executeQuery(propertyQuery)

    Promise.all([classPromise, propertyPromise])
      .then(([classes, properties]) => {
        const classResults = classes.map( c => c.class.value )
        const propertyResults = properties.map( p => p.prop.value )
        this.setState({
          classResults,
          propertyResults
        })
      })
      .catch( err => console.error(err) )
  }
  
  render() {
    return (
      <div>
        <div className="query-sentence">
          {this.state.sentence}
        </div>
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