import React from "react";

const bgUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-dOcZfrVPaNFitvorJ6g4BYPf/user-9BJjLNWZ2aLeDR36zlsxA6c7/img-ywbmjUtNUoubOXbNSyPwzEch.png?st=2024-10-24T05%3A17%3A27Z&se=2024-10-24T07%3A17%3A27Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-10-23T20%3A24%3A37Z&ske=2024-10-24T20%3A24%3A37Z&sks=b&skv=2024-08-04&sig=h9M18tDLHq4JuJw5x8P9DPOxQMN%2BZ/Nh8jkxd4fX084%3D';

export const Header = (props) => {

  const introStyle = {
    //background: `url(${props.data.background}) no-repeat center / cover`
    //backgroundImage: `url(${props.data.background}), radial-gradient(circle, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.5));`,
    backgroundImage: `url("${bgUrl}"), radial-gradient(circle, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.5))`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    //, radial-gradient(circle, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.5));
    //background: 'url(https://www.w3schools.com/images/compatible_chrome.png) center center no-repeat'
  }
  
  return (
    <header id="header">
      <div className="intro" style={introStyle}>
        <div className="overlay" style={{background: "linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))", paddingTop:"80px" }}>
        
        <div class="container" style={{paddingRight : "20%"}}>

            <div className="row">
              
              <div className="col-md-8 intro-text" >
                <div >
                <h1>
                 
                {props.data ? props.data.title : "Loading"}
                <br/>
                  <span></span>
                </h1>
                <p className="headerParagraph" >{props.data ? props.data.paragraph : "Loading"}
                <br/><br/>
                <a
                  href="/admin-app/index.html#/Home"
                  className="btn btn-custom btn-lg page-scroll"
                >
                  Order
                </a>
                </p>
                {" "}
                <p>&nbsp;</p>

                </div>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
