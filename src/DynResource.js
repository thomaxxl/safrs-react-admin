import { useNotify, useRedirect } from "react-admin";
import { Create } from "react-admin";
import { Toolbar, SaveButton } from "react-admin";
import "./style/DynStyle.css";
import { makeStyles } from "@material-ui/core/styles";
import AttrForm from "./components/AttrForm.js";
import get_Component from "./get_Component";
import { useFormContext } from "react-hook-form";

const useStyles = makeStyles({
  join_attr: { color: "#3f51b5;" },
  delete_icon: { fill: "#3f51b5" },
  edit_grid: { width: "100%" },
  rel_icon: { paddingLeft: "0.4rem", color: "#666", marginBottom: "0px" },
  save_button: { marginLeft: "1%" },
});

export const gen_DynResourceCreate = (resource) => (props) => {
  const classes = useStyles();
  const notify = useNotify();
  const redirect = useRedirect();
  const attributes = resource.attributes;

  if (resource.create) {
    const CreateComp = get_Component(resource.create);
    return <CreateComp resource_name={resource.name} {...props}></CreateComp>;
  }

  const Mytoolbar = (props) => {
    const { reset } = useFormContext();
    return (
      <Toolbar {...props}>
        <SaveButton
          type="button"
          label="save"
          submitOnEnter={true}
          mutationOptions={{
            onSuccess: () => {
              notify("Element created");
              redirect(`/${resource.name}`);
            },
          }}
        />
        <div className={classes.save_button}>
          <SaveButton
            type="button"
            label="save and add another"
            submitOnEnter={false}
            variant="outlined"
            mutationOptions={{
              onSuccess: () => {
                notify("Element created");
                reset();
              },
            }}
          />
        </div>
        <div className={classes.save_button}>
          <SaveButton
            type="button"
            label="save and show"
            submitOnEnter={false}
            variant="outlined"
            mutationOptions={{
              onSuccess: (data) => {
                notify("Element created");
                redirect(`/${resource.name}/${data.id}/show`);
              },
            }}
          />
        </div>
      </Toolbar>
    );
  };

  return (
    <Create {...props}>
      <AttrForm
        attributes={attributes}
        toolbar={<Mytoolbar />}
        isInserting={false}
      />
    </Create>
  );
};
