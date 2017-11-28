import React from 'react'
import axios from 'axios'

import { throttle, constructClassQuery, constructPropertyQuery } from '../helpers'
import '../css/Query.css'

class Query extends React.Component {x
  
  constructor() {
    super()
    
    this.executeQuery = this.executeQuery.bind(this)
    this.selectResult = this.selectResult.bind(this)
  }

  selectResult(e) {
    switch (this.props.queryType) {
      case 'Class':
        break;
      case 'Property':
        break;
      default: break
    } 
  }
  
  executeQuery() {
    if (this.input.value === '') {
      this.props.setResults([])
      return
    }
    let query = ''
    switch (this.props.queryType) {
      case 'Class': query = constructClassQuery(this.input.value); break
      case 'Property': query = constructPropertyQuery(this.input.value); break
      default: break
    }
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
      .then((data) => this.props.setResults(data.map( d => {
        switch (this.props.queryType) {
          case 'Class': {
            const url = d.class.value.split('/')
            return url[url.length-1]
          }
          case 'Property': {
            const url = d.prop.value.split('/')
            return url[url.length-1]
          }
          default: return d
        } 
      })))
  }
  
  render() {
    const results = this.props.results
    return (
      <div className="Query">
        <h2>{this.props.queryType} Query</h2>
        <input ref={(input) => this.input = input} type="text" onInput={throttle(this.executeQuery, 100)}/>
        <div className="query-results">
          {results.map( res => {
              return <div className="result" key={res} onClick={this.selectResult} >{res}</div>
            })
          }
        </div>
      </div>
    )
  }
 
}

export default Query