import React from 'react';
import { Button } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import logo from './logo.svg';
import './App.css';

const App: React.FC = () => (
  <div className="App">
    <header className="App-header">
      <Button color="secondary">
        <Delete color="secondary" />
        Delete
      </Button>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
);

export default App;
