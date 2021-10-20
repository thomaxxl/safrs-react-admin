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
    return <div> {employee.FirstName} {employee.LastName}</div>
}

export const CustomerLabel = (props) => {
    const customer = props.instance
    return <div> <b>{customer.CompanyName}</b> <i>{customer.ContactName}</i></div>
}