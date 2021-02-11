import React from 'react';

import $ from 'jquery';

import './Morph.css';

const axios = require('axios');

const imageSize = 230;

class Morph extends React.Component {
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

  onChangeHandler(field, startX, startY, endX, endY) {
    return (e) => {
      let ctx = document.getElementById('canvas').getContext('2d');

      let file = e.target.files[0];
      this.setState({[field]: file});

      let url = URL.createObjectURL(file);
      let img = new Image();
      let that = this;
      img.onload = function(){
        that.setState({imageRatio: img.width/imageSize});
        ctx.drawImage(img, startX, startY, endX, endY);
      };
      img.src = url;
    }
  }

  onUpload = () => {
    const formData = new FormData();
    formData.append( 
      "srcImg", 
      this.state.srcImg, 
    );
    formData.append( 
      "dstImg", 
      this.state.dstImg, 
    );
    formData.append( 
      "pairs", 
      this.state.pairs.map((v) => {
        return JSON.stringify(v);
      }),
    );

    for (let v of this.state.pairs.map((v) => {
      return JSON.stringify(v);
    })) {
      console.log(v);
    }

    this.setState({loading: true});
    axios.post("http://localhost:8080/morph", formData, {headers: {"Content-type": "multipart/form-data"}})
    .then((res) => {
      let gifUrl = "data:image/gif;base64," + res.data
      this.setState({gifResultUrl: gifUrl, loading: false});
    }).catch((error) => {
      console.log(error);
    });;
  }

  onImageClick = (e) => {
    console.log(this.state.imageRatio);
    let ctx = document.getElementById('canvas').getContext('2d');

    let p = this.getMousePos($('#canvas')[0], e);
    if (p.x < imageSize && p.y < imageSize) {
      ctx.beginPath();
      ctx.fillStyle = '#ff000066';
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#ff0000';
      ctx.fill();
      ctx.stroke();

      if (!!this.state.dstPoint) {
        let pair = {
          startX: p.x * this.state.imageRatio,
          startY: p.y * this.state.imageRatio,
          endX: (this.state.dstPoint.x - imageSize) * this.state.imageRatio,
          endY: this.state.dstPoint.y * this.state.imageRatio,
        };

        ctx.moveTo(p.x, p.y);
        ctx.lineTo(this.state.dstPoint.x, this.state.dstPoint.y);
        ctx.strokeStyle = '#ff000066';
        ctx.stroke();

        this.setState({pairs: [...this.state.pairs, pair], srcPoint: null, dstPoint: null});

      } else {
        this.setState({srcPoint: p});
      }

    } else if (p.x >= imageSize && p.y >= 0 && p.x < 2*imageSize && p.y < imageSize) {
      ctx.beginPath();
      ctx.fillStyle = '#ff000066';
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#ff0000';
      ctx.fill();
      ctx.stroke();

      if (!!this.state.srcPoint) {
        let pair = {
          startX: this.state.srcPoint.x * this.state.imageRatio,
          startY: this.state.srcPoint.y * this.state.imageRatio,
          endX: (p.x - imageSize) * this.state.imageRatio,
          endY: p.y * this.state.imageRatio,
        };

        ctx.moveTo(this.state.srcPoint.x, this.state.srcPoint.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = '#ff000066';
        ctx.stroke();

        this.setState({pairs: [...this.state.pairs, pair], srcPoint: null, dstPoint: null});

      } else {
        this.setState({dstPoint: p});
      }  
    }

  }

  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
  }

  render() {
    return (
      <div className="App">
        <div>
          <canvas id="canvas"
                  onClick={this.onImageClick}
                  width={imageSize*2} height={imageSize}/>
        </div>
        <div>
          <div><input type="file" name="file" onChange={this.onChangeHandler('srcImg', 0, 0, imageSize, imageSize)}/></div>
          <div><input type="file" name="file" onChange={this.onChangeHandler('dstImg', imageSize, 0, imageSize, imageSize)}/></div>
          <div><button onClick={this.onUpload}>Morph!</button></div>
        </div>
        <div>
          {!!this.state.gifResultUrl && !this.state.loading &&
            <img src={this.state.gifResultUrl} alt="" width="500" height="500"/>
          }
          {!this.state.gifResultUrl && this.state.loading &&
            <img src="https://media1.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif" alt="" width="500" height="500"/>
          }
        </div>
      </div>
    );
  }
}

export default Morph;
