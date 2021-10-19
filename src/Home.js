import { TextareaAutosize } from '@material-ui/core';
import Button from '@material-ui/core/Button';



const Home = () => {

    const conf = localStorage.getItem("raconf")
    return <div>
                <Button label="Save Config" onClick={()=> alert()} color="primary" ><h1>Save Config</h1></Button>
                <br/>
                <TextareaAutosize 
                    minRows={3}
                    style={{ width: "80%" }}
                    value= {JSON.stringify(JSON.parse(conf), null, 4)} 
                />
            </div>
}

export default Home