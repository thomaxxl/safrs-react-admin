import { Image } from "./image";
import React from "react";
import ReactPlayer from 'react-player';


function embedYouTubeVideo() {
  const videoContainer = document.getElementById('videoContainer');
  
  // YouTube video ID
  const videoId = 'YSjQPDYPdGE'; // Replace with your desired YouTube video ID

  // Create the iframe element
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  
  // Remove the button after embedding the video
  videoContainer.innerHTML = '';
  
  // Append the iframe to the container
  videoContainer.appendChild(iframe);
}

export const Gallery = (props) => {
  
  return (
    <div id="portfolio" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Demo Video</h2>
        </div>
        <div className="row" >
          <center><ReactPlayer style={{textAlign:'center'}} url="https://apifabric.ai/static/istart_demo.mp4" controls /></center>
        </div>
      </div>
    </div>
  );
};
