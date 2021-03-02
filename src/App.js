import React, { useState } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './Components/Navigation/Navigation';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Logo from './Components/Logo/Logo';
import ImageLinkedForm from './Components/ImageLinkedForm/ImageLinkedForm';
import Rank from './Components/Rank/Rank';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';

const app = new Clarifai.App({
  apiKey: 'ae2dcc83e90641bea703faabfd39218d'
});

const particlesOptions ={
  particles: {
    number: {
      value: 120,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

function App() {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [box, setBox] = useState({});
  const [route, setRoute] = useState('signin');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState({});

  const loadUser = (data) => {
    setUser(data);
  }
 
  const calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  const displayFaceBox = (box) => {
    setBox(box);
  };
 
  const onInputChange = (e) => {
    setInput(e.target.value);
  };
 
  const onButtonSubmit = () => {
    setImageUrl(input);
    app.models
      .initModel({
        id: Clarifai.FACE_DETECT_MODEL,
      })
      .then((faceDetectModel) => {
        return faceDetectModel.predict(input);
      })
      .then((response) => {
        if(response){
          fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            setUser(user => ({...user, entries: count}))
          })
        }
        displayFaceBox(calculateFaceLocation(response))
      })
      .catch((err) => console.log(err));
  };

  const onRouteChange = (route) => {
    if(route === 'signout') {
      setIsSignedIn(false)
    } else if (route === 'home'){
      setIsSignedIn(true)
    }
    setRoute(route);
  }
 
  return (
    <div className="App">
      <Particles className="particles" params={particlesOptions} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange}/>
      { route === 'home'
        ? <div>
            <Logo />
            <Rank name={user.name} entries={user.entries}/>
            <ImageLinkedForm
              onInputChange={onInputChange}
              onButtonSubmit={onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
        :(
            route === 'signin'
            ? <Signin loadUser={loadUser} onRouteChange={onRouteChange}/>
            : <Register onRouteChange={onRouteChange} loadUser={loadUser}/>
          )  
      }
    </div>
  );
}
 
export default App;