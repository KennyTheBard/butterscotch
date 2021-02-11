import React from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import { Helmet } from 'react-helmet'

import Morph from './morph/Morph';
import Filter from './filter/Filter';
import Mapping from './mapping/Mapping';
import Color from './color/Color';
import Equalize from './equalize/Equalize';

import Logo from './logo.png';

import './App.css';

const TITLE = "Vodkajello"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      srcImg: null,
      dstImg: null,
      srcPoint: null,
      dstPoint: null,
      pairs: [],
      gifResultUrl: null,
      imageRatio: 1,
      loading: false,
    };
  }

  render() {
    return (
      <div className="app">
        <Helmet>
          <title>{ TITLE }</title>
        </Helmet>
        <BrowserRouter>
        <br/><br/>
          <div class="topnav">
            <img align="left" class="logo" src={Logo}/>
            <Link to="/morph">Morph</Link>
            <Link to="/filter">Filter</Link>
            <Link to="/mapping">Mapping</Link>
            <Link to="/color">Color palette</Link>
            <Link to="/equalize">Equalize</Link>
          </div> 

          <Switch>
            <Route path="/morph">
              <Morph/>
            </Route>
            <Route path="/filter">
              <Filter/>
            </Route>
            <Route path="/mapping">
              <Mapping/>
            </Route>
            <Route path="/color">
              <Color/>
            </Route>
            <Route path="/equalize">
              <Equalize/>
            </Route>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
