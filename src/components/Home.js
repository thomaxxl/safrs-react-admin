import * as React from 'react';
import { TextareaAutosize, TextField } from '@material-ui/core';
import Checkbox from "@material-ui/core/Checkbox";
import Button from '@material-ui/core/Button';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {reset_Conf} from "../Config"
import MonacoEditor from '@uiw/react-monacoeditor';
import { TabbedShowLayout, Tab } from 'react-admin';

const yaml = require('js-yaml')


const useStyles = makeStyles((theme) => ({
    widget : {
        border: "1px solid #3f51b5",
        marginRight: "1em",
        marginTop : "1em",
        marginBottom : "1em"
    },
    textInput : {
        width : "80%"
    }
}));


const Home = () => {

    const save_yaml = (ystr, ev) => {
        console.log(ystr)
        try{
            const jj = yaml.load(ystr)
            saveEdit(JSON.stringify(jj))
            setBgColor("black");
        }
        catch(e){
            console.warn(`Failed to process`, ystr)
            setBgColor("red");
        }
    }

    const classes = useStyles();

    const saveEdit = (text) => {
        try{
            if(text){
                const parsed_conf = JSON.parse(text);
                setApiroot(parsed_conf.api_root);
            }
            setBgColor("#ddeedd");
            localStorage.setItem("raconf", text);
            if(!taConf){
                window.location.reload();
            }
        }catch (e){
            //setBgColor("#eedddd");
            setBgColor("red");
        }
        setTaConf(text)
    }

    let conf = localStorage.getItem("raconf") ||  JSON.stringify(reset_Conf())
    const [taConf, setTaConf] = useState(conf ? JSON.stringify(JSON.parse(conf), null, 4) : "");
    //const [bgColor, setBgColor] = useState("#ddeedd");
    const [bgColor, setBgColor] = useState("black");
    const [autosave, setAutosave] = useState(true);
    const [api_root, setApiroot] = useState(JSON.parse(conf)?.api_root);
    
    const handleAutoSaveChange = (event) => {
        setAutosave(event.target.checked);
    };
    
    return <div>
                <div>
                    <br/>
                    <TextField
                        className={classes.textInput}
                        variant="outlined"
                        id="outlined-helperText"
                        label="API root URL"
                        size="small"
                        defaultValue={api_root}
                    />
                    <br/>
                    <Button className={classes.widget} onClick={()=> saveEdit("")} color="primary" >Clear</Button>
                    <Button className={classes.widget} onClick={()=> saveEdit(JSON.stringify(reset_Conf(), null, 4))} color="primary" >Reset</Button>
                    <Button className={classes.widget} onClick={()=> window.location.reload()} color="primary" >Apply</Button>
                    <FormControlLabel
                        control={<Checkbox checked={autosave} onChange={handleAutoSaveChange} />}
                        label="Auto Save Config"
                    />
                </div>
                <div>
                    <TabbedShowLayout>
                        <Tab label="yaml">
                            <MonacoEditor
                                language="yaml"
                                value={yaml.dump(JSON.parse(taConf))}
                                options={{
                                    theme: 'vs-dark',
                                }}
                                height="1000px"
                                style = {{ borderLeft: `8px solid ${bgColor}`}}
                                onChange={(ystr, ev) => save_yaml(ystr, ev)}
                            />
                        </Tab>
                        <Tab label="json">
                            <pre>
                                {JSON.stringify(JSON.parse(taConf), null, 4)}
                            </pre>
                        </Tab>
                    </TabbedShowLayout>
                </div>
            </div>
}


/*const ta = <TextareaAutosize
variant="outlined"
minRows={3}
className={classes.textInput}
style={{ backgroundColor : bgColor }}
value= {taConf}
onChange={(evt)=>saveEdit(evt.target.value)}
/>*/
export default Home