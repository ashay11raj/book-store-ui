import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [{
        headerName: "Book Id", field: "bookId"
      }, {
        headerName: "Book Name", field: "bookName"
      }, {
        headerName: "Author", field: "author"
      }, {
        headerName: "Published On", field: "dateOfPublication"
      }],
      rowData: [{
        bookId: 1, bookName: "Celica", author: "Author 1", dateOfPublication: "2019-02-19"
      }]
    }
  }
  componentDidMount(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('accept', 'application/json');
    let option = {
      method: "GET",
      mode: "no-cors",
      credentials: "include",
      headers: headers
    };
    let url = 'http://localhost:8080/bookstore/getbooks/bookName'; 
    fetch(url, option)
     .then(result => result)
     .then(rowData => console.log("rowData" + rowData))
     .catch(error => console.error('Error:', error));
      //.then(rowData => this.setState({rowData}));
  }
  render() {
    return (
      <div 
      className="app ag-theme-balham"
      style={{ 
        height: '500px', 
        width: '800px' }} 
      >
        <AgGridReact 
          columnDefs={this.state.columnDefs}
          rowData={this.state.rowData}>
        </AgGridReact>
      </div>
    );
  }
}

export default App;