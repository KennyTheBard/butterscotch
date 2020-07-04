import React from 'react';

import './Equalize.css';

const axios = require('axios');

class Equalize extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      img: null,
      imgUrl: null,
      resultUrl: null,
      loading: false,
    };
  }

  onFileChange = (e) => {
    let file = e.target.files[0];
    let url = URL.createObjectURL(file);

    this.setState({img: file, imgUrl: url});
  }

  onPaletteSizeChange = (e) => {
    this.setState({paletteSize: e.target.value});
  }

  onUpload = () => {
    const formData = new FormData();
    formData.append( 
      "img", 
      this.state.img, 
    );

    this.setState({loading: true});
    axios.post("http://localhost:8080/equalize", formData, {headers: {"Content-type": "multipart/form-data"}})
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
          <div><input type="file" name="file" onChange={this.onFileChange}/></div>
          <div><button onClick={this.onUpload}>Equalize!</button></div>
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

export default Equalize;
