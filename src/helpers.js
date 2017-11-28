export const throttle = (callback, delay) => {
  let previousCall = new Date().getTime();
  return function() {
    let currentCall = new Date().getTime();

    if ((currentCall - previousCall) >= delay) {
      previousCall = currentCall;
      callback.apply(null, arguments);
    }
  };
}

export const constructClassQuery = (string) => {
  return `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  SELECT DISTINCT ?class
  WHERE { 
    { ?class a rdfs:Class } 
    UNION { ?class a owl:Class }
    FILTER ( REGEX(str(?class), "${string}", 'i') )
    FILTER ( !( REGEX(str(?class), "^(http://www.w3.org/2002/07/owl#|http://www.openlinksw.com/|nodeID://)", 'i') ) )
  }
  LIMIT 200` 
}

export const constructPropertyQuery = (string) => {
  return `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  SELECT DISTINCT ?prop
  WHERE { 
    { ?prop a rdf:Property }
    UNION { ?prop a owl:ObjectProperty }
    UNION { ?prop a owl:DatatypeProperty }
    FILTER ( REGEX(str(?prop), "${string}", 'i') )
    FILTER ( !( REGEX(str(?prop), "^(http://www.w3.org/2002/07/owl#|http://www.openlinksw.com/|nodeID://)", 'i') ) )
  }
  LIMIT 200` 
}