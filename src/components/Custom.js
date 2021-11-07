import { React } from "react";
import { List,
    Datagrid,
    TextField,
    EditButton,
} from "react-admin";


export const SampleColumnField = ({column}) => {
    return <TextField source={column.name} key={column.name} style={{color : "red" }} />
}

export const EmployeeLabel = (props) => {
    const employee = props.instance
    return <div> {employee.attributes?.FirstName} {employee.attributes?.LastName}</div>
}

export const CustomerLabel = (props) => {
    const customer = props.instance
    return <div> <b>{customer.attributes?.CompanyName}</b> <i>{customer.attributes?.ContactName}</i></div>
}