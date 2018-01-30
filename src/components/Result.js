import React from 'react'
import { getLastUrlElement } from '../helpers'

import '../css/Result.css'

class Result extends React.Component {
	// const headers = 
	render() {
		return(
			<div>
				<h4>Result</h4>
				<div className="result-box">
					<table>
						<thead>
							<tr>
								{
									// create header from query
									this.props.resultList.length > 0 ?
										this.props.query.map((e, i) => {
											const word = getLastUrlElement(e.element.value)
											return <th key={i}>{word}</th>
										}) : null
								}
							</tr>
						</thead>
						<tbody>
							{
								// display every result in a row with the selected properties
								this.props.resultList.map((result, i) => {
									let keys = Object.keys(result)
									let rows = [];

									keys.forEach((key, j) => {
										const word = getLastUrlElement(result[key].value)
										rows.push(<td key={j}>{word}</td>)
									})
			
									return <tr key={i}>{rows}</tr>
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