import React, { Component } from 'react';
import './App.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const makeApiCall = (url, option = {}, credentials = "include") => {
  let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');

    //headers.append('Authorization', 'Basic '+ credentials);
    headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    option = {...{
      method: "GET",
      credentials: credentials,
      headers: headers
    }, ...option};
    let host = 'http://localhost:8080'; 
    return fetch(host + url, option);

}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [{
        headerName: "Book Id", field: "bookId", editable: true, checkboxSelection: true
      }, {
        headerName: "Book Name", field: "bookName", editable: true
      }, {
        headerName: "Author", field: "author", editable: true
      }, {
        headerName: "Published On", field: "dateOfPublication", editable: true
      }],
      rowData: []
    }
  }
  addNewRow = () => {
    let newItem = {
      bookId: '',
      bookName: '',
      author: '',
      dateOfPublication: ''
    };
    this.gridApi.updateRowData({ add: [newItem] });
  }
  logout = () => {
    let option = {
      method: "GET"
    }
    let url = '/bookstore/logout'; 
    makeApiCall(url, option)
     .then(result => {
        return result.json();
      })
     .then(resData => { 
        alert("User Logged Out Successfully..");        
        window.location.reload(true);
      })
     .catch(error => { 
       alert("User Logout: FAILED");
       window.location.reload(true);
       });
  }
  removeRow = () => {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map( node => node.data );
    let option = {
      method: "DELETE"
    }
    let url = '/bookstore/removebook/' + selectedData[0].bookId; 
    makeApiCall(url, option)
     .then(result => {
        return result.json();
      })
     .then(resData => { 
       if(resData.status == 403){
        alert("User does not have permission for this action");
       } else{
        alert(resData.errormsg);        
       }
       window.location.reload(true);
      })
     .catch(error => { 
       alert("Data save: FAILED");
       });
  }
  saveNewRow = () => {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map( node => node.data );
    let option = {
      method: "POST",
      body: JSON.stringify(selectedData[0])
    }
    let url = '/bookstore/addbook'; 
    makeApiCall(url, option)
     .then(result => {
        return result.json();
      })
     .then(resData => { 
      alert(resData.errormsg);
      window.location.reload(true);
      })
     .catch(error => { alert("Data save: FAILED") });
  }
  updateRow = () => {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map( node => node.data );
    let option = {
      method: "POST",
      body: JSON.stringify(selectedData[0])
    }
    let url = '/bookstore/updatebook'; 
    makeApiCall(url, option)
     .then(result => {
        return result.json();
      })
     .then(resData => { 
      alert(resData.errormsg);
      window.location.reload(true);
      })
     .catch(error => { alert("Data save: FAILED") });
    }
  componentDidMount(){
    let url = '/bookstore/getbooks/bookName'; 
    makeApiCall(url, null, this.state.credentials)
     .then(result => {
        return result.json();
      })
     .then(rowData => this.setState({rowData}))
     .catch(error => console.error('Error:', error));
  }
    
  render() {
    let bookStorePage = (
        <div className="app ag-theme-balham"
        style={{ 
          height: '500px', 
          width: '800px' }} 
        >
          <div className="ag-theme-balham">
            <button onClick={this.addNewRow}>Add New Row</button>
            <button onClick={this.saveNewRow}>Save New Row</button>
            <button onClick={this.updateRow}>Update Selected Row</button>
            <button onClick={this.removeRow}>Remove Selected Row</button>
            <button onClick={this.logout}>Logout</button>
          </div>
          <AgGridReact 
            columnDefs={this.state.columnDefs}
            rowData={this.state.rowData}
            rowSelection="single"
            onGridReady={ params => this.gridApi = params.api }>
          </AgGridReact>
      </div>);
    return (      
      <div>
        {bookStorePage}
      </div>  
    );
  }
}

export default App;