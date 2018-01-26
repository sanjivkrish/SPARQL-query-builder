import React from 'react'
import axios from 'axios'
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

  cancelToken = axios.CancelToken.source()
  updateSuggestion = () => {
    
    if (this.input.value === '') {
      this.cancelToken.cancel('Request outdated') // cancel all remaining open requests
      this.cancelToken = axios.CancelToken.source() // generate new cancelToken
      this.props.setLoading(false) // remove loading sign
      this.props.setSuggestions({
        classSuggestions: [],
        propertySuggestions: []
      })
      return
    }
    
    
    const classQuery = constructClassQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked)
    const propertyQuery = constructPropertyQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked, this.props.resultList)

    const classPromise = executeQuery(this.props.endpoint, classQuery, this.cancelToken.token)
    const propertyPromise = executeQuery(this.props.endpoint, propertyQuery, this.cancelToken.token)
    this.props.setLoading(true) // add loading sign
    Promise.all([classPromise, propertyPromise])
      .then(([classes, properties]) => {
        if (classes === null || properties === null || this.input.value === '') {
          this.props.setLoading(false)
          return
        }
        const classSuggestions = classes.map( c => c.class.value )
        const propertySuggestions = properties.map( p => p.prop.value )
        this.cancelToken.cancel('Request outdated') // cancel all remaining open requests
        this.cancelToken = axios.CancelToken.source() // generate new cancelToken
        this.props.setLoading(false)
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
          <input id="check-sensitive" className="option" type="checkbox" ref={(input) => this.checkSensitive = input} onChange={throttle(this.updateSuggestion, 500)}></input>
          <label onClick={() => this.checkSensitive.click()}>Case-sensitive</label>
          <input id="check-whole" className="option" type="checkbox" ref={(input) => this.checkWhole = input} onChange={throttle(this.updateSuggestion, 500)}></input>
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