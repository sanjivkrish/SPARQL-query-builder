import axios from 'axios'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

let endpoint = 'http://live.dbpedia.org/sparql'

function constructClassQuery(string) {
  return `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT DISTINCT ?class WHERE { { ?class a rdfs:Class } UNION { ?class a owl:Class } FILTER ( REGEX(str(?class), "${string}", 'i') )FILTER ( !( REGEX(str(?class), "^(http://www.w3.org/2002/07/owl#|http://www.openlinksw.com/|nodeID://)", 'i') ) ) } LIMIT 200` 
}

function constructPropertyQuery(string) {
  return `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT DISTINCT ?prop WHERE { { ?prop a rdf:Property } UNION { ?prop a owl:ObjectProperty } UNION { ?prop a owl:DatatypeProperty } FILTER ( REGEX(str(?prop), "${string}", 'i') )FILTER ( !( REGEX(str(?prop), "^(http://www.w3.org/2002/07/owl#|http://www.openlinksw.com/|nodeID://)", 'i') ) ) } LIMIT 200`
}

function throttle(callback, delay) {
  let previousCall = new Date().getTime();
  return function() {
    let currentCall = new Date().getTime();

    if ((currentCall - previousCall) >= delay) {
      previousCall = currentCall;
      callback.apply(null, arguments);
    }
  };
}

function executeQuery(endpoint, query) {
  return axios({
    url: endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: { query } // using params instead of data because of urlencoded data
  })
}

function onInput(e) {
  if (e.target.value == '') {
    return
  }
  const classQuery = constructClassQuery(e.target.value)
  const propertyQuery = constructPropertyQuery(e.target.value)

  // make SPARQL endpoint codes
  const classPromise = executeQuery(endpoint, classQuery)
  const propertyPromise = executeQuery(endpoint, propertyQuery)

  const resultDiv = $('.result')
  resultDiv.innerHTML = '' // clear previous response

  // wait for all responses to come back
  Promise.all([classPromise, propertyPromise])
    .then( response => {
      const [classResults, propertyResults] = response
      const classDiv = document.createElement('div')
      const propertyDiv = document.createElement('div')

      // loop through results and add new div for each result
      classResults.data.results.bindings.forEach( result => {
        const div = document.createElement('div')
        div.textContent = result.class.value
        classDiv.appendChild(div)
      })

      propertyResults.data.results.bindings.forEach( result => {
        const div = document.createElement('div')
        div.textContent = result.prop.value
        propertyDiv.appendChild(div)
      })

      // add results to the page
      resultDiv.appendChild(classDiv)
      resultDiv.appendChild(propertyDiv)
    })
    .catch( err => console.error(err))
}

const input = $('#topicInput')
input.addEventListener('input', throttle(onInput.bind(this), 500))