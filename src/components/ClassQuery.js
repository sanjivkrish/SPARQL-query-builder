import React from 'react'
import axios from 'axios'

import { throttle, constructClassQuery } from '../helpers'

class ClassQuery extends React.Component {
  
  constructor() {
    super()
    this.endpoint = 'http://live.dbpedia.org/sparql'
  }
  
  executeQuery() {
    axios({
      url: this.endpoint,
      method: 'POST',
      headers: {
        'Accept': 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: { query: constructClassQuery(this.classInput.value) } // using params instead of data because of urlencoded data
    })
      .then((res) => res.data.results.bindings)
      .then((data) => this.props.setResults(data.map( d => d.class.value)))
  }
  
  render() {
    const results = this.props.results
    return (
      <div>
        <h2>Class Query</h2>
        <input ref={(input) => this.classInput = input} type="text" onInput={throttle(this.executeQuery.bind(this), 500)}/>
        {results.map( url => <div key={url}>{url}</div>)}
      </div>
    )
  }
 
}

export default ClassQuery