import { Edit } from "react-admin";
import { useRefresh } from "react-admin";
import { useNotify, useRedirect } from "react-admin";
import { useNavigate } from "react-router-dom";
import UpdateAttrForm from "./UpdateAttrForm";
import * as React from "react";

const DynEdit = (props: any) => {
  console.log('DynEdit props: ', props);
  return (
    <Edit {...props}>
      <UpdateAttrForm attributes={props.attributes} isInserting={true} />
      
    </Edit>
  );
};

export const gen_DynResourceEdit = (resource: any) => {
  
  if (!resource) {
    console.warn("Invalid resource");
    return <span />;
  }
  const attributes = resource.attributes.filter((attr: any) => attr.hide_edit !== "true");
  
  const Result = (props: any) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const redirect = useRedirect();
    const navigate = useNavigate();

    const onFailure = (error: any) => {
      notify(`Error Saving Changes`, { type: "warning" });
      redirect("edit", props.basePath, props.id);
      refresh();
    };

    const onSuccess = () => {
      notify(`Changes Saved`);
      navigate(-1);
      refresh();
    };

    return (
      <DynEdit
        {...props}
        attributes={attributes}
        onFailure={onFailure}
        onError={onFailure}
        onSuccess={onSuccess}
        mutationMode="pessimistic"
      />
    );
  };
  return Result;
};
