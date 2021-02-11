import React from 'react';

import './Filter.css';

const axios = require('axios');

class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      img: null,
      imgUrl: null,
      kernel: null,
      resultUrl: null,
      loading: false,
    };
  }

  onFileChange = (e) => {
    let file = e.target.files[0];
    let url = URL.createObjectURL(file);

    this.setState({img: file, imgUrl: url});
  }

  onKernelChange = (e) => {
    this.setState({kernel: e.target.value});
  }

  onUpload = () => {
    const formData = new FormData();
    formData.append( 
      "img", 
      this.state.img, 
    );
    formData.append( 
      "kernel", 
      this.state.kernel,
    );

    this.setState({loading: true});
    axios.post("http://localhost:8080/filter", formData, {headers: {"Content-type": "multipart/form-data"}})
    .then((res) => {
      let resultUrl = "data:image/png;base64," + res.data;
      this.setState({resultUrl: resultUrl, loading: false});
    }).catch((error) => {
      console.log(error);
    });;
  }

  render() {
    return (
      <div className="App">
        <div>
        <label>Choose a kernel:</label>
        <select name="kernel" id="kernel" onChange={this.onKernelChange}>
          <option value="" disabled selected>Select your option</option>
          <option value="BoxBlur3x3">Box Blur 3x3</option>
          <option value="BoxBlur5x5">Box Blur 5x5</option>
          <option value="Sobel">Sobel</option>
        </select> 
        </div>
        <div>
          <div><input type="file" name="file" onChange={this.onFileChange}/></div>
          <div><button onClick={this.onUpload}>Apply!</button></div>
        </div>
        <div>
          {!!this.state.imgUrl && 
            <img src={this.state.imgUrl} alt="" width="500" height="500"/>
          }
          {!!this.state.resultUrl && !this.state.loading && 
            <img src={this.state.resultUrl} alt="" width="500" height="500"/>
          }
          {!this.state.gifResultUrl && this.state.loading &&
            <img src="https://media1.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif" alt="" width="500" height="500"/>
          }
        </div>
      </div>
    );
  }
}

export default Filter;
