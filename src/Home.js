import { TextareaAutosize, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { useState, useEffect } from 'react';


const Home = () => {

    const saveEdit = (text) => {
        try{
            JSON.parse(text);
            setBgColor("#ddeedd");
            //text = JSON.stringify(JSON.parse(text),null,4)
            localStorage.setItem("raconf", text )
        }catch (e){
            setBgColor("#eedddd");
        }
        setTaConf(text)    
    }

    const conf = localStorage.getItem("raconf")
    const api_root = localStorage.getItem("api_root")
    const [taConf, setTaConf] = useState(JSON.stringify(JSON.parse(conf), null, 4));
    const [bgColor, setBgColor] = useState("#ddeedd");

    return <div>
                <TextField
                variant="outlined"
                id="outlined-helperText"
                label="API root URL"
                defaultValue="http://"
                />
                <br></br>
                <TextareaAutosize
                    variant="outlined"
                    minRows={3}
                    style={{ width: "80%", backgroundColor : bgColor }}
                    value= {taConf}
                    onChange={(evt)=>saveEdit(evt.target.value)}
                />
                <br/>
                <Button label="Clear" onClick={()=> alert()} color="primary" >Clear Config</Button>
            </div>
}

export default Home