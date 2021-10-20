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