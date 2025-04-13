import React, { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Features } from "./components/features";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Gallery } from "./components/gallery";
import { Testimonials } from "./components/testimonials";
import { Team } from "./components/Team";
import { Contact } from "./components/contact";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
//import CookieConsent from "react-cookie-consent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";


export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const doCookies = () => {
  CookieConsent.run({
    categories: {
      necessary: {
          enabled: true,  // this category is enabled by default
          readOnly: true  // this category cannot be disabled
      },
      analytics: {}
  },

  onFirstConsent: ({cookie}) => {
    console.log('onFirstConsent fired',cookie);
  },

  onConsent: ({cookie}) => {
    console.log('onConsent fired!', cookie)
  },

  onChange: ({changedCategories, changedServices}) => {
      console.log('onChange fired!', changedCategories, changedServices);
  },

  language: {
      default: 'en',
      translations: {
          en: {
              consentModal: {
                  title: 'This site uses cookies',
                  acceptAllBtn: 'Accept all',
                  acceptNecessaryBtn: 'Reject all',
                  description: '<a href="https://apifabric.ai/static/privacy-policy.html">Privacy Policy</a>',
                  //showPreferencesBtn: 'Manage Individual preferences'
              },
              preferencesModal: {
                  title: 'Manage cookie preferences',
                  acceptAllBtn: 'Accept all',
                  acceptNecessaryBtn: 'Reject all',
                  savePreferencesBtn: 'Accept current selection',
                  closeIconLabel: 'Close modal',
                  sections: [
                      {
                          title: 'Somebody said ... cookies?',
                          description: 'I want one!'
                      },
                      {
                          title: 'Strictly Necessary cookies',
                          description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',

                          //this field will generate a toggle linked to the 'necessary' category
                          linkedCategory: 'necessary'
                      },
                      {
                          title: 'Performance and Analytics',
                          description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                          linkedCategory: 'analytics'
                      },
                      {
                          title: 'More information',
                          description: 'For any queries in relation to my policy on cookies and your choices, please <a href="#contact-page">contact us</a>'
                      }
                  ]
              }
          }
      }
  }
});
}

const App = ({sections}) => {
  const [landingPageData, setLandingPageData] = useState({});
  const [condition, setCondition] = useState(document.location.hash.includes('/landing'));

  useEffect(() => {
    doCookies();
    setLandingPageData(JsonData);
    
  }, []);

  const loadStyles = async () => {
    if (condition) {
      
      await import("./App.css");
      await import('./css/bootstrap.css');
      await import('./css/style.css');
      await import('./fonts/font-awesome/css/font-awesome.css');
    }
  };

  useEffect(() => {
    loadStyles();
  }, [condition]);

  
  const header_data = sections.find(section => section.name === 'Header');
  return <>
    
    <div>
      <Navigation />
      <Header data={header_data} />
      <Gallery data={landingPageData.Gallery} />
      <Features data={landingPageData.Features} />
      <About data={landingPageData.About} />
      <Services data={landingPageData.Services} />
      
      {/*<Testimonials data={landingPageData.Testimonials} />
      <Team data={landingPageData.Team} />
      */}
      
      
      <Contact data={landingPageData.Contact} />
    </div>
  </>
};

export default App;
