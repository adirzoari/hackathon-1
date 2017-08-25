import './App.css';
import Confetti from 'react-confetti'
import React, { Component } from 'react';
var axios = require('axios');

var bottomMargin = {
    'marginBottom': 15
}

var bottomMargin2 = {
    'marginBottom': 50
}
  
var paddingTop = {
    'paddingTop': 200
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state= {
      randomWord: '',
      synonyms: [],
      image: '',
      guess: '',
      intro: true,
      revealAnswer: false,
      synLoading: '',
      imgLoading: ''
    }
    this.componentWillMount = this.componentWillMount.bind(this);
    this.generateWord = this.generateWord.bind(this);
    this.handleGuessChange = this.handleGuessChange.bind(this);
    this.startGame = this.startGame.bind(this);
    this.giveUp = this.giveUp.bind(this);
  }

  generateWord () {
    this.setState({ guess: '' });
    this.setState({ revealAnswer: false });
    this.setState({ synonyms: [] });
    this.setState({ image: '' });
    this.setState({ synLoading: 'Looking for related words...'});
    this.setState({ imgLoading: 'Searching for image...'});
    axios.get('http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=false&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=35&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=f44543f957a305b27813b0cb8f2c16438ae9a66b676cd5049')
    .then((response) => {
      console.log(response);
      this.setState({ randomWord: response.data.word });
    }).catch(function (error) {
      console.log(error);
    })
    .then(() => {
      axios.get('https://pixabay.com/api/?key=6240471-cd6eaf7f00a749663d67a1c3f&q=' + this.state.randomWord)
      .then((response) => {
        console.log(response);
        var imageLink;
        if ( response.data.hits.length === 0 ) {
          imageLink = '';
          this.setState({ imgLoading: 'No images found :(' })
        } else {
          imageLink = response.data.hits[0].webformatURL
        }
        this.setState({ image: imageLink });
      })
      .catch(function (error) {
        console.log(error);
      })
    }).then(() => {
      axios.get('http://words.bighugelabs.com/api/2/bceafa6957fa8ad26616f847894f07b0/' + this.state.randomWord + '/json')
      .then((response) => {
        console.log(response);
        var synList;
        if (response.data.noun === undefined) {
          synList = [];
          this.setState({ synLoading: 'No related words found :('})
        } else {
          synList = response.data.noun.syn;
        }
        this.setState({ synonyms: synList });
      })
      .catch(function (error) {
        console.log(error);

    });
    })
  
  }

  componentWillMount () {
    this.generateWord();
  }

  handleGuessChange (event) {
    this.setState({guess: event.target.value})
    console.log(this.state.guess);
  }

  startGame () {
    this.setState({ intro: false });
  }

  giveUp () {
    this.setState({ revealAnswer: true })
  }

  render() {
    if ( this.state.intro === true ) {
      return (
        <div className="container">
          <div className="text-center">
            <h1 style={bottomMargin2}>Wooord?</h1>
            <p style={bottomMargin2}>Welcome to Wooord?, a word guessing game!</p>
            <p style={bottomMargin2}>When you begin, the game will assign a random word as the target.</p>
            <p style={bottomMargin2}>It will then hide that word and then give you some related words, or synonyms, and the first image found using an image search using the target word.</p>
            <p style={bottomMargin2}>Type the hidden word in the text field and you win!</p>
            <p style={bottomMargin2}>Ready?</p>
            <button type="button" className="btn btn-success" onClick={this.startGame}>GO!</button>
          </div>
        </div>
      )
    } else if ( this.state.revealAnswer === true ) {
      return (
        <div className="container">
          <div className="text-center" style={paddingTop}>
            <h1>The word was:</h1>
            <h2>{this.state.randomWord}</h2>
            <hr />
            <button type="button" className="btn btn-success" onClick={this.generateWord}>Play Again</button>
          </div>
        </div>
      )
    } else if ( this.state.guess.toLowerCase() === this.state.randomWord ) {
      return (
        <div className="container">
        <Confetti />
          <div className="text-center" style={paddingTop}>
            <h1 className="text-success victory">You win!</h1>
            <hr />
            <button type="button" className="btn btn-success" onClick={this.generateWord}>Play Again</button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="text-center">
            <h1>Wooord?</h1>
            <input type="text" placeholder="type your guess here!"  style={bottomMargin} onChange={this.handleGuessChange} value={this.state.guess} className="" /><br />
            <button type="button" className="btn btn-success" style={bottomMargin} onClick={this.generateWord}>Skip!</button>
            <button type="button" className="btn btn-danger" style={bottomMargin} onClick={this.giveUp}>Reveal Word</button>
            <h3>Related Words</h3>
            <div className="row">
            <SynonymList listLoading={this.state.synLoading} synonyms={this.state.synonyms} randomWord={this.state.randomWord}/>
            </div>
            <hr />
            <Image imageLoad={this.state.imgLoading} imageURL={this.state.image} />
            <hr />
          </div>
        </div>
      );
    }
  }
}

class SynonymList extends Component {
  // constructor(props) {
  //   super(props);
  // }

  render () {
    if ( this.props.synonyms.length === 0 ) {
      return (
        <ul className="list-unstyled list-inline">
          <li classname="col-md-3">{this.props.listLoading}</li>
        </ul>
      )
    } else {
      var synList = this.props.synonyms.map((obj, index) => {
        if ( obj.toLowerCase().includes(this.props.randomWord) !== true ) {
        return (
          <li key={index} className="col-md-2 lead" style={bottomMargin}>{obj}</li>
        )} else {
          return
        }
      })
    } 
    return (
      <ul className="list-unstyled list-inline"> 
        {synList} 
      </ul>
    )
  }
}

class Image extends Component {
  // constructor(props) {
  //   super(props);
  // }

  render () {

    return (
      <img src={this.props.imageURL} alt={this.props.imageLoad} style={bottomMargin} className="img-responsive picture" /> 
    );
  }
}


export default App;
