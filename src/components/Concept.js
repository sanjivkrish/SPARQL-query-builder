import React from 'react'
import axios from 'axios'
import { throttle, constructClassQuery, constructPropertyQuery, constructObjectQuery, executeQuery } from '../helpers'
import Suggestion from './Suggestion'
import '../css/Concept.css'

class Concept extends React.Component {

  selectElement = (type) => {
    return (url) => {
      this.props.addElementToQuery(url, type)
      this.input.value = ""
    }   
  }

  updateSuggestion = () => {
    if (this.input.value === '') {
      this.props.cancelToken.cancel('Request outdated') // cancel all remaining open requests
      this.props.setCancelToken(axios.CancelToken.source()) // generate new cancelToken
      this.props.setSuggestions({
        classSuggestions: []
      })
      if (this.props.resultList.length === 0) {
        this.props.setSuggestions({
          propertySuggestions: []
        })
      }
      this.props.setLoading(false) // remove loading sign
      return
    }
    
    const classQuery = constructClassQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked)
    const propertyQuery = constructPropertyQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked, this.props.resultList)
    
    const classPromise = executeQuery(this.props.endpoint, classQuery, this.props.cancelToken.token)
    const propertyPromise = executeQuery(this.props.endpoint, propertyQuery, this.props.cancelToken.token)

    let allPromises
    if (this.props.query.filter( e => e.type === 'property').length !== 0) {
      const objectQuery = constructObjectQuery(this.input.value, this.checkSensitive.checked, this.checkWhole.checked, this.props.query)
      const objectPromise = executeQuery(this.props.endpoint, objectQuery, this.props.cancelToken.token)
      allPromises = Promise.all([classPromise, propertyPromise, objectPromise])
    } else {
      allPromises = Promise.all([classPromise, propertyPromise])
    }
    this.props.setLoading(true) // add loading sign
    allPromises
      .then(([classes, properties, objects]) => {
        if (this.input.value === '') {
          this.props.setLoading(false)
          return
        }
        const classSuggestions = classes.map( c => c.class.value )
        const propertySuggestions = properties.map( p => p.prop.value )
        const objectSuggestions = objects ? objects.map( p => p.object.value ) : []
        this.props.cancelToken.cancel('Request outdated') // cancel all remaining open requests
        this.props.setCancelToken(axios.CancelToken.source()) // generate new cancelToken
        this.props.setSuggestions({
          classSuggestions,
          propertySuggestions,
          objectSuggestions
        })
        this.props.setLoading(false)
      })
      .catch( err => err)
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
              onItemSelect={this.selectElement('class')}
            />
          </div>
          <div className="Concept">
            <h4>Property</h4>
            <Suggestion
              suggestionList={this.props.propertySuggestions}
              onItemSelect={this.selectElement('property')}
            />
          </div>
            <div className="Concept">
            <h4>Property value</h4>
            <Suggestion
              suggestionList={this.props.objectSuggestions}
              onItemSelect={this.selectElement('object')}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Concept