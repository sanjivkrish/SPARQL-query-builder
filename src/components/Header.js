import React from 'react'

import '../css/Header.css'

class Header extends React.Component {
  render() {
    return (
      <div className="Header">
        <h2 className="title">SPARQL Query Builder</h2>
      </div>
    )
  }
}

export default Header