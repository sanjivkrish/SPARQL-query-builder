import React from 'react'

import Suggestion from './Suggestion'
import '../css/Result.css'

class Result extends React.Component {
    
    formatResult = (resultList) => {
        let result = [];
        this.props.resultList.map((elem, idx) => {
            if (!elem) {
                return
            }
            let keys = Object.keys(elem);

            keys.forEach((key, index)=> {
                if (result[index] == undefined) {
                    result[index] = [];
                }

                result[index].push(elem[key].value)
            })
        })

       return result;
    }

    selectResult = () => {}

    render() {
        let list = this.formatResult(this.props.resultList);

        return(
            <div>
                <h4>Result</h4>
                <div className="result-box">
                    <table>
                        <tbody>
                        {
                            this.props.resultList.map((elem, idx) => {
                                let keys = Object.keys(elem)
                                let rows = [];

                                keys.forEach((key, idn) => {
                                    const url = elem[key].value.split('/')
                                    const word = url[url.length - 1]

                                    rows.push(<td key={idn}>{word}</td>)
                                })
                                
                                return (
                                    <tr key={idx}>
                                        {rows}
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default Result