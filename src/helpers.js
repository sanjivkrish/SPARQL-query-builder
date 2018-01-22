import sparqljs from 'sparqljs'
import axios from 'axios'

export const throttle = (callback, delay) => {
  let previousCall = new Date().getTime();
  let timeoutIsRunning = false
  return function() {
    let currentCall = new Date().getTime();
    if ((currentCall - previousCall) >= delay) {
      previousCall = currentCall;
      callback.apply(null, arguments);
    } else {
      if (!timeoutIsRunning) {
        setTimeout(() => {
          callback.apply(null, arguments)
          timeoutIsRunning = false
        }, delay)
        timeoutIsRunning = true
      }
    }
  };
}

export const constructClassQuery = (string, sensitive, wholeWord) => {
  return `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  SELECT DISTINCT ?class
  WHERE { 
    { ?class a rdfs:Class } 
    UNION { ?class a owl:Class }
    FILTER ( REGEX(str(?class), "http://dbpedia.org/.*/${wholeWord ? `${string}$` : `.*${string}`}" ${sensitive ? '' : ', "i"'}) )
    FILTER ( !( REGEX(str(?class), "^(http://www.w3.org/2002/07/owl#|http://www.openlinksw.com/|nodeID://)", 'i') ) )
  }
  LIMIT 200` 
}

export const constructPropertyQuery = (string, sensitive, wholeWord, query) => {
  return `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  SELECT DISTINCT ?prop
  WHERE { 
    ${
      query.filter( x => x.type === 'class').length === 0 ?
      `{ ?prop a rdf:Property }
      UNION { ?prop a owl:ObjectProperty }
      UNION { ?prop a owl:DatatypeProperty }` :
      query
        .filter( x => x.type === 'class')
        .map( x => `?thing a <${x.value}>.`)
        .join('\n')
        + '\n?thing ?prop ?value.'
    }
    
    FILTER ( REGEX(str(?prop), "http://.*/.*/${wholeWord ? `${string}$` : `.*${string}`}" ${sensitive ? '' : ', "i"'}) )
    FILTER ( !( REGEX(str(?prop), "^(http://www.w3.org/2002/07/owl#|http://www.openlinksw.com/|nodeID://)", "i") ) )
  }
  LIMIT 200` 
}

export const formatResultQuery = (inputQuery) => {
  let SparqlGenerator = sparqljs.Generator;
  let generator = new SparqlGenerator();

  let query = {
    "type": "query",
    "prefixes": {
        "dbo": "http://dbpedia.org/ontology/",
        "dbr": "http://dbpedia.org/resource/"
    },
    "queryType": "SELECT",
    "distinct": true,
    "variables": ["?0"],
    "where": [
      {
          "type": "bgp",
          "triples": []
      }
    ],
    "limit":  200
  }

  let variableCount = 0;

  inputQuery.forEach(function(elem, idx) {
    if (elem.type === 'class') {
      // Element of type class
      let rdf = {
        subject : query.variables[query.variables.length-1],
        predicate : "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        object : elem.value
      }

      query.where[0].triples.push(rdf);
    } else if (elem.type === 'property' && (idx !== 0)) {
      // Element of type property
      if (inputQuery[idx-1].type === 'class') {
        // Element of type property on top of class
        variableCount++;

        let rdf = {
          subject : query.variables[query.variables.length-1],
          predicate : elem.value,
          object : "?" + (variableCount)
        }

        if (inputQuery[idx-1].type === 'class') {
          query.variables.push(rdf.object);
        }

        query.where[0].triples.push(rdf);
      } else {
        // Element of type property on top of property
      }

    } else if (idx === 0) {
      // First element as a property
      query.variables.push("?"+(variableCount+1));
      variableCount++;

      let rdf = {
        subject : query.variables[0],
        predicate : elem.value,
        object : query.variables[1]
      }

      query.where[0].triples.push(rdf);
    }
  })

  let generatedQuery = generator.stringify(query);
  return generatedQuery;
}

export const executeQuery = (endpoint, query, cancelToken) => {
  return axios({
      url: endpoint,
      method: 'GET',
      headers: {
      'Accept': 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: { query } // using params instead of data because of urlencoded data
    })
    .then((res) => {
        // console.log(res)
        return res.data.results.bindings
    })
    .catch( err => console.log(err) )
}