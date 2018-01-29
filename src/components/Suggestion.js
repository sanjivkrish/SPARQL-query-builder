import React from 'react'

import '../css/Suggestion.css'

class Suggestion extends React.Component {
    render() {
        return(
            <div className="suggestion-box">
            {this.props.suggestionList.map( (url,idx) => {
                if (this.props.query.map( e => e.value ).indexOf(url) !== -1) {
                    return null
                }
                const urlParts = url.split('/')
                const word = urlParts[urlParts.length - 1]
                return <div className="suggestion-item" key={idx} title={url} onClick={() => this.props.onItemSelect(url)} >{word}</div>
                })
            }
            </div>
        )
    }
}

export default Suggestion