import React from "react";
import { Field, reduxForm } from "redux-form";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

const validate = (values: any) => {
  const errors: { [key: string]: any } = {};
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "favoriteColor",
    "notes",
  ];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = "Required";
    }
  });
  if (
    values.email &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
  ) {
    errors.email = "Invalid email address";
  }
  return errors;
};

interface RenderTextFieldProps {
  label: string;
  input: any; // Replace 'any' with the actual type
  children: any;
  meta: { touched: boolean; invalid: boolean; error: string };
  // Add any other properties that you expect to be in the object
}

const renderTextField = ({
  label,
  input,
  meta: { touched, invalid, error },
  ...custom
}: RenderTextFieldProps) => (
  <TextField
    label={label}
    placeholder={label}
    error={touched && invalid}
    helperText={touched && error}
    {...input}
    {...custom}
  />
);

const renderCheckbox = ({ input, label }: { input: any; label: any }) => (
  <div>
    <FormControlLabel
      control={
        <Checkbox
          checked={input.value ? true : false}
          onChange={input.onChange}
        />
      }
      label={label}
    />
  </div>
);

const radioButton = ({ input, ...rest }: { input: any }) => (
  <FormControl>
    <RadioGroup {...input} {...rest}>
      <FormControlLabel value="female" control={<Radio />} label="Female" />
      <FormControlLabel value="male" control={<Radio />} label="Male" />
      <FormControlLabel value="other" control={<Radio />} label="Other" />
    </RadioGroup>
  </FormControl>
);

const renderFromHelper = ({ touched, error }: { touched: any; error: any }) => {
  if (!(touched && error)) {
    return;
  } else {
    return <FormHelperText>{touched && error}</FormHelperText>;
  }
};

const renderSelectField = ({
  input,
  label,
  meta: { touched, error },
  children,
  ...custom
}: RenderTextFieldProps) => (
  <FormControl error={touched && !!error}>
    <InputLabel htmlFor="age-native-simple">Age</InputLabel>
    <Select
      native
      {...input}
      {...custom}
      inputProps={{
        name: "age",
        id: "age-native-simple",
      }}
    >
      {children}
    </Select>
    {renderFromHelper({ touched, error })}
  </FormControl>
);

const MaterialUiForm = (props: any) => {
  const { handleSubmit, pristine, reset, submitting, classes } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Field
          name="firstName"
          component={renderTextField}
          label="First Name"
        />
      </div>
      <div>
        <Field name="lastName" component={renderTextField} label="Last Name" />
      </div>
      <div>
        <Field name="email" component={renderTextField} label="Email" />
      </div>
      <div>
        <Field name="sex" component={radioButton}>
          <FormControlLabel control={<Radio />} value="male" label="male" />
          <FormControlLabel control={<Radio />} value="female" label="female" />
        </Field>
      </div>
      <div>
        <Field
          classes={classes}
          name="favoriteColor"
          component={renderSelectField}
          label="Favorite Color"
        >
          <option value="" />
          <option value={"ff0000"}>Red</option>
          <option value={"00ff00"}>Green</option>
          <option value={"0000ff"}>Blue</option>
        </Field>
      </div>
      <div>
        <Field name="employed" component={renderCheckbox} label="Employed" />
      </div>
      <div />
      <div>
        <Field
          name="notes"
          component={renderTextField}
          label="Notes"
          multiline
          rowsMax="4"
          margin="normal"
        />
      </div>
      <div>
        <button type="submit" disabled={pristine || submitting}>
          Submit
        </button>
        <button type="button" disabled={pristine || submitting} onClick={reset}>
          Clear Values
        </button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: "MaterialUiForm", // a unique identifier for this form
  validate,
})(MaterialUiForm);
