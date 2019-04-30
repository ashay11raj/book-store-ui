import React, { Component } from 'react';
import './App.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { tsImportEqualsDeclaration } from '@babel/types';

const makeApiCall = (url, option = {}, credentials) => {
  let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');

    headers.append('Authorization', 'Basic '+ credentials);
    headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    option = {...{
      method: "GET",
      headers: headers
    }, ...option};
    let host = 'http://localhost:8080'; 
    return fetch(host + url, option);

}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      columnDefs: [{
        headerName: "Book Id", field: "bookId", editable: true, checkboxSelection: true, filter: "agNumberColumnFilter"
      }, {
        headerName: "Book Name", field: "bookName", editable: true, filter: "agTextColumnFilter"
      }, {
        headerName: "Author", field: "author", editable: true, filter: "agTextColumnFilter"
      }, {
        headerName: "Published On", field: "dateOfPublication", editable: true, filter: "agTextColumnFilter"
      }],
      rowData: []
    }
    //this.searchBook = this.searchBook.bind(this);
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
    makeApiCall(url, option, this.state.credentials)
     .then(result => {
        return result.json();
      })
     .then(resData => { 
        this.setState({authenticated: false});
      })
     .catch(error => { 
      this.setState({authenticated: false});
       });

  }
  removeRow = () => {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map( node => node.data );
    let option = {
      method: "DELETE"
    }
    let url = '/bookstore/removebook/' + selectedData[0].bookId; 
    makeApiCall(url, option, this.state.credentials)
     .then(result => {
        return result.json();
      })
     .then(resData => { 
       if(resData.status == 403){
        alert("User does not have permission for this action");
       } else{
        alert(resData.errormsg);        
        let url = '/bookstore/getbooks/bookName'; 
          makeApiCall(url, null, this.state.credentials)
          .then(result => {
            if(result.status === 200){
              return result.json();
            }  
            })
          .then(rowData => {
            if(rowData){
              this.setState({
                rowData: rowData
              });
            }            
          })
          .catch(error => console.error('Error:', error));
       }
       
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
    makeApiCall(url, option, this.state.credentials)
     .then(result => {
        return result.json();
      })
     .then(resData => { 
      alert(resData.errormsg);
      
      })
     .catch(error => { alert("Data save: FAILED") });
  }
  getAllBook = () => {
    let orderBy = this.state.orderBy ? this.state.orderBy : "bookId";
    let url = '/bookstore/getbooks/' + orderBy; 
    makeApiCall(url, null, btoa(this.state.username + ":" + this.state.password))
     .then(result => {
       if(result.status === 200){
        return result.json();
       } else{
        this.setState({
          errormsg: "Invalid user name or password."
         });
       }        
      })
     .then(rowData => {
      if(rowData){
        this.setState({
          rowData: rowData,
          authenticated: true, 
          credentials: btoa(this.state.username + ":" + this.state.password)
         });
      }
      
    })
     .catch(error => console.error('Error:', error));

  }
  updateRow = () => {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map( node => node.data );
    let option = {
      method: "POST",
      body: JSON.stringify(selectedData[0])
    }
    let url = '/bookstore/updatebook'; 
    makeApiCall(url, option, this.state.credentials)
     .then(result => {
        return result.json();
      })
     .then(resData => { 
      alert(resData.errormsg);
      
      })
     .catch(error => { alert("Data save: FAILED") });
    }
    searchBook() {
        let book = {
            bookId: "",
            bookName: "",
            author: "",
            dateOfPublication: ""
        };
        book[this.state.searchProp] = this.state.searchValue;
        let url = '/bookstore/getbooks';
        let option = {
            method: "POST",
            body: JSON.stringify(book)
          }
        makeApiCall(url, option, this.state.credentials)
        .then(result => {
            return result.json();
        })
        .then(resData => { 
            this.setState({rowData: resData});        
        });
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
            <br/>
            Search Book: <select name="bookDropDown" onChange={e => {this.setState({searchProp: e.target.selectedOptions[0].value})}}>
                <option></option>
                <option value="bookId">Book Id</option>
                <option value="bookName">Book Name</option>
                <option value="author">Author</option>
                <option value="dateOfPublication">Date Of Publication</option>
            </select>
            <input name="bookProp" type="text" onBlur={e => {this.setState({searchValue: e.target.value})}}></input>
            <button onClick={this.searchBook.bind(this)}>Search Book</button>
            <br/>
            Get All Books(Order by):<select name="bookOrderByDropDown" onChange={e => {this.setState({orderBy: e.target.selectedOptions[0].value})}}>
                <option></option>
                <option value="bookId">Book Id</option>
                <option value="bookName">Book Name</option>
                <option value="author">Author</option>
                <option value="dateOfPublication">Date Of Publication</option>
            </select>
            <button onClick={this.getAllBook}>Get All Books</button>
          </div>
          <AgGridReact 
            columnDefs={this.state.columnDefs}
            rowData={this.state.rowData}
            rowSelection="single"
            onGridReady={ params => this.gridApi = params.api }>
          </AgGridReact>
      </div>);
      if(!this.state.authenticated){
        bookStorePage = (
          <div className="app">
            <MuiThemeProvider>
          <div>
          <strong style={{color: "red"}}>{this.state.errormsg}</strong>
            <br/>
           <TextField
             hintText="Enter your Username"
             floatingLabelText="Username"
             onChange = {(event,newValue) => this.setState({username:newValue})}
             />
           <br/>
             <TextField
               type="password"
               hintText="Enter your Password"
               floatingLabelText="Password"
               onChange = {(event,newValue) => this.setState({password:newValue})}
               />
             <br/>
             <RaisedButton label="Submit" primary={true} 
             onClick={this.getAllBook}/>
         </div>
         </MuiThemeProvider>
          </div>
        );
      }
    return (      
      <div>
        {bookStorePage}
      </div>  
    );
  }
}

export default App;