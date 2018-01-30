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
										[...this.props.query] // create deep copy for sorting
												.sort( (a, b) => { // sorting so that classes are the first elements in the array
													if (a.type === 'class' && b.type !== 'class') {
														return -1
													} else if (a.type !== 'class' && b.type === 'class') {
														return 1
													} else {
														return 0
													}
												})
											.map((e, i) => {
												const word = getLastUrlElement(e.element.value)
												if (e.type === 'property' && i === 0) {
													// If there are no classes but properties, add an extra label ("Thing") for the results that have these properties
													return [ <th key={-1}>Thing</th>, <th key={i}>{word}</th> ] 
												}
												if (e.type === 'class' && i > 0) {
													return null
												}
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