import sparqljs from 'sparqljs'
import axios from 'axios'
import getFormData from 'form-data-urlencoded'

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

export const getLastUrlElement = (url) => {
  url = url.split('/')
  const word = url[url.length - 1]
  return word
}

export const constructClassQuery = (string, sensitive, wholeWord) => {
  return `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  SELECT DISTINCT ?variable
  WHERE { 
    { ?variable a rdfs:Class } 
    UNION { ?variable a owl:Class }
    FILTER ( REGEX(str(?variable), "http://dbpedia.org/.*/${wholeWord ? `${string}$` : `.*${string}`}" ${sensitive ? '' : ', "i"'}) )
    FILTER ( !( REGEX(str(?variable), "^(http://www.w3.org/2002/07/owl#|http://www.openlinksw.com/|nodeID://)", 'i') ) )
  }
  LIMIT 200` 
}

export const constructPropertyQuery = (string, sensitive, wholeWord, resultList) => {
  return `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  SELECT DISTINCT ?variable
  WHERE { 
    ${
      resultList.length === 0 ? 
      `{ ?variable a rdf:Property }
      UNION { ?variable a owl:ObjectProperty }
      UNION { ?variable a owl:DatatypeProperty }` :
      resultList.map( x => {
        return `{ <${x[0].value}> ?variable ?value }`
      }).join('\n UNION')
    }
    
    FILTER ( REGEX(str(?variable), "http://.*/.*/${wholeWord ? `${string}$` : `.*${string}`}" ${sensitive ? '' : ', "i"'}) )
    FILTER ( !( REGEX(str(?variable), "^(http://www.w3.org/2002/07/owl#|http://www.openlinksw.com/|nodeID://)", "i") ) )
  }
  LIMIT 200` 
}

export const constructObjectQuery = (string, sensitive, wholeWord, query) => {
  return `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  SELECT DISTINCT ?variable
  WHERE { 
    ${
      query
        .filter( e => e.type === 'class' )
        .map( e => `?thing a <${e.element.value}>.`)
        .join('\n')
    }
    ${
      `?thing <${query
        .filter( e => e.type === 'property')
        .pop().element.value
      }> ?variable.`
    }
    
    FILTER ( REGEX(str(?variable), "${wholeWord ? `${string}$` : `.*${string}`}" ${sensitive ? '' : ', "i"'}) )
  }
  LIMIT 200` 
}

// export const formatResultQuery = (inputQuery) => {
//   let SparqlGenerator = sparqljs.Generator;
//   let generator = new SparqlGenerator();

//   let query = {
//     "type": "query",
//     "prefixes": {
//         "dbo": "http://dbpedia.org/ontology/",
//         "dbr": "http://dbpedia.org/resource/"
//     },
//     "queryType": "SELECT",
//     "distinct": true,
//     "variables": ["?0"],
//     "where": [
//       {
//           "type": "bgp",
//           "triples": []
//       }
//     ],
//     "limit":  200
//   }

//   let variableCount = 0;

//   inputQuery.forEach(function(elem, idx) {
//     if (elem.type === 'class') {
//       // Element of type class
//       let rdf = {
//         subject : query.variables[query.variables.length-1],
//         predicate : "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
//         object : elem.value
//       }

//       query.where[0].triples.push(rdf);
//     } else if (elem.type === 'property' && (idx !== 0)) {
//       // Element of type property
//       if (inputQuery[idx-1].type === 'class') {
//         // Element of type property on top of class
//         variableCount++;

//         let rdf = {
//           subject : query.variables[query.variables.length-1],
//           predicate : elem.value,
//           object : "?" + (variableCount)
//         }

//         if (inputQuery[idx-1].type === 'class') {
//           query.variables.push(rdf.object);
//         }

//         query.where[0].triples.push(rdf);
//       } else {
//         // Element of type property on top of property
//         query.variables.push("?"+(variableCount+1));
//         variableCount++;

//         let rdf = {
//           subject : query.variables[0],
//           predicate : elem.value,
//           object : query.variables[query.variables.length-1]
//         }

//         if (inputQuery[idx-1].type === 'class') {
//           query.variables.push(rdf.object);
//         }

//         query.where[0].triples.push(rdf);
//       }

//     } else if (idx === 0) {
//       // First element as a property
//       query.variables.push("?"+(variableCount+1));
//       variableCount++;

//       let rdf = {
//         subject : query.variables[0],
//         predicate : elem.value,
//         object : query.variables[1]
//       }

//       query.where[0].triples.push(rdf);
//     }
//   })

//   let generatedQuery = generator.stringify(query);
//   return generatedQuery;
// }

export const constructResultQuery = (query) => {
  let SparqlGenerator = sparqljs.Generator;
  let generator = new SparqlGenerator();
  let jsonQuery = {
    "type": "query",
    "queryType": "SELECT",
    "distinct": true,
    "variables": [],
    "where": [
      {
          "type": "bgp",
          "triples": []
      }
    ],
    "limit":  200
  }

  let variableCount = 1;
  const triples = jsonQuery.where[0].triples
  query.forEach( (e, i) => {
    switch (e.type) {
      case 'class':
        triples.push({
          subject: '?0',
          predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          object: e.element.value
        })
        break;
      case 'property':
        let triple = {
          subject: '?0',
          predicate: e.element.value,
          object: `?${variableCount++}`
        }
        triples.push(triple)
        if (e.object !== undefined) {
          triple = Object.assign({}, triple) // create a deep copy and make a second triple defining the object
          switch (e.object.type) {
            case 'uri':
              triple.object = e.object.value
              break;
            case 'literal':
              // eslint-disable-next-line
              triple.object = `\"${e.object.value}\"@${e.object['xml:lang']}`
              break;
            case 'typed-literal':
              // eslint-disable-next-line
              triple.object = `\"${e.object.value}\"^^${e.object.datatype}`
              break;
            default:
              break;
          }
          triples.push(triple)
        }

        
        break;
      default:
        break;
    }
  })

  for (let i = 0; i < variableCount; i++) {
    jsonQuery.variables.push(`?${i}`)
  }
  const stringQuery = generator.stringify(jsonQuery)
  return stringQuery
}

let nextId = 0
export const executeQuery = (endpoint, query, cancelToken) => {
  const id = nextId++
  return axios({
      url: endpoint,
      method: 'POST',
      headers: {
      'Accept': 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: getFormData({ query }), // using params instead of data because of urlencoded data
      cancelToken: cancelToken,
      timeout: 45000
    })
    .then((res) => {
      if (id === (nextId - 1) || id === (nextId - 2) || id === (nextId - 3)) {
        return res.data.results.bindings
      } else {
        return null
      }
    })
    .catch( err => console.log(err) )
}