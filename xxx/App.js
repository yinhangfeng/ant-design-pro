import React, { Component } from 'react';

import img1 from './img1.png';

export default class App extends Component {
  render() {
    return (
      <div>
        <div>hello</div>
        <img src={img1} />
      </div>
    );
  }
}
