import React from 'react'
import { getLastUrlElement } from '../helpers'

import '../css/Suggestion.css'

class Suggestion extends React.Component {
    render() {
        return(
            <div className="suggestion-box">
            {this.props.suggestionList.map( (element,idx) => {
                if (this.props.query.map( e => e.element.value ).indexOf(element.variable.value) !== -1) {
                    // Remove suggestions that have already been selected
                    return null
                }
                const url = element.variable.value
                const word = getLastUrlElement(url)
                return <div className="suggestion-item" key={idx} title={url} onClick={() => this.props.onItemSelect(element.variable)} >{word}</div>
                })
            }
            </div>
        )
    }
}

export default Suggestion