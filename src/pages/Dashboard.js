import { Card, CardContent, CardHeader } from '@material-ui/core'
import {useConf} from '../Config.js'

const Dashboard = () => {
  const config = useConf()
  
  return (
    <Card>
      <CardHeader title="Dashboard"> 
      </CardHeader>
      <CardContent>
        <ul>
          <li>
            <a href={config.api_root}> API </a>
          </li>
        </ul>
      </CardContent>

    </Card>
  )
}

export default Dashboard
