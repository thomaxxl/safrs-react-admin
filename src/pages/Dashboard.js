import React from 'react'
import { Card, CardContent, CardHeader } from '@material-ui/core'
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
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
