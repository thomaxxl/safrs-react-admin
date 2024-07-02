import { useNotify, useRedirect } from "react-admin";
import { Create, Toolbar, SaveButton } from "react-admin";
import "./style/DynStyle.css";
import AttrForm from "./components/AttrForm";
import get_Component from "./get_Component";
import { useFormContext } from "react-hook-form";
import * as React from "react";


export const gen_DynResourceCreate = (resource: any) => (props: any) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const attributes = resource.attributes;

  if (resource.create) {
    const CreateComp = get_Component(resource.create);
    if (CreateComp) {
      return <CreateComp resource_name={resource.name} {...props}></CreateComp>;
    }
  }

  const Mytoolbar = (props: any) => {
    const { reset } = useFormContext();
    return (
      <Toolbar {...props}>
        <SaveButton
          type="button"
          label="save"
          // submitOnEnter={true}
          mutationOptions={{
            onSuccess: () => {
              notify("Element created");
              redirect(`/${resource.name}`);
            },
          }}
        />
        <div style={{ marginLeft: "1%" }}>
          <SaveButton
            type="button"
            label="save and add another"
            // submitOnEnter={false}
            variant="outlined"
            mutationOptions={{
              onSuccess: () => {
                notify("Element created");
                reset();
              },
            }}
            style={{ marginLeft: "1%" }}
          />
        </div>
        <div style={{ marginLeft: "1%" }}>
          <SaveButton
            type="button"
            label="save and show"
            // submitOnEnter={false}
            variant="outlined"
            mutationOptions={{
              onSuccess: (data) => {
                notify("Element created");
                redirect(`/${resource.name}/${data.id}/show`);
              },
            }}
            style={{ marginLeft: "1%" }}
          />
        </div>
      </Toolbar>
    );
  };

  return (
    <Create {...props}>
      <AttrForm attributes={attributes} toolbar={<Mytoolbar />} />
    </Create>
  );
};
