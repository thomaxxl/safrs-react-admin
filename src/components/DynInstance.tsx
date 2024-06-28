/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-eval */
/* eslint-disable no-throw-literal */
import { useState, useEffect } from "react";
import {
  Datagrid,
  EditButton,
  useGetOne,
  useNotify,
  useRedirect,
} from "react-admin";

import Grid from "@mui/material/Grid";
import { TabbedShowLayout, Tab } from "react-admin";
import {
  Show,
  SimpleShowLayout,
  TabbedShowLayoutTabs,
  ReferenceManyField,
  useRecordContext,
  Link,
} from "react-admin";
import { Typography } from "@mui/material";
import { useRefresh } from "react-admin";
import { useDataProvider } from "react-admin";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useConf } from "../Config";
import Button from "@mui/material/Button";
import { Loading, Error } from "react-admin";
import { type2resource } from "../util";
import { ShowAttrField } from "./DynFields";
import { attr_fields } from "./DynFields";
import { DynPagination } from "../util";
import { TopToolbar } from "react-admin";
import InfoModal from "./InfoModal";
import get_Component from "../get_Component";
import BlockIcon from "@mui/icons-material/Block";
import DynReferenceCreate from "./DynReferenceCreate";
import { useInfoToggle } from "../InfoToggleContext";
import * as React from "react";

const ResourceTitle = ({
  record,
  resource,
}: {
  record: any;
  resource: any;
}) => {
  const key = resource?.user_key || "id";
  if (!(record && key in record)) {
    return <span />;
  }
  return (
    <span>
      {resource?.label || resource?.name || record?.type} &mdash; {record[key]}
    </span>
  );
};

export const DetailPanel = ({
  attributes,
  path,
}: {
  attributes: any;
  path: any;
}) => {
  return (
    <Grid container spacing={3}>
      {attributes.map((attr: any) => (
        <ShowRecordField
          source={attr}
          key={attr.name}
          path={path}
          tabs={1}
          id={0}
        />
      ))}
    </Grid>
  );
};

export const ShowRecordField = ({
  source,
  tabs,
  path,
  id,
}: {
  source: any;
  tabs: any;
  path: any;
  id: any;
}) => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const notify = useNotify();
  const attr_name = source.name;
  let value = record[attr_name];
  // eslint-disable-next-line no-unused-vars
  const isInserting = false;
  if (source.show_when) {
    try {
      const pattern1 = /record\["[a-zA-Z]+"] (==|!=) "[a-zA-Z]+"/;
      const pattern2 = /isInserting (==|!=) (true|false)/;
      const arr = source.show_when.split(/&&|\|\|/);
      let index = -1;
      for (let i = 0; i < arr.length; ++i) {
        if (arr[i].match(pattern1)) {
          index = i;
        }
        if (arr[i].match(pattern1) || arr[i].match(pattern2)) {
          continue;
        } else {
          throw "invalid expression";
        }
      }

      if (index === -1) {
        if (!eval(source.show_when)) {
          return <></>;
        }
      } else {
        if (eval(arr[index].split(/>|=|<|!/)[0])) {
          if (!eval(source.show_when)) {
            return <></>;
          }
        } else {
          throw "invalid attribute name";
        }
      }
    } catch (e) {
      console.log(e);
      notify(
        "Error occurred while evaluating 'show_when' : Invalid Expression",
        { type: "error" }
      );
      redirect(path);
      refresh();
    }
  }

  if (source.component) {
    const Component: any = get_Component(source.component);
    if (Component !== null) {
      return <Component attr={source} value={value} mode="show" />;
    }
  }
  return <ShowAttrField attr={source} value={value} id={id} />;
};

const ShowInstance = ({
  attributes,
  tab_groups,
  resource_name,
}: {
  attributes: any;
  tab_groups: any;
  resource_name: any;
}) => {
  const record = useRecordContext();
  const id = record?.id;
  const basePath = `/${resource_name}`;
  const title = (
    <Typography variant="h5" component="h5" style={{ margin: "30px 0px 30px" }}>
      {resource_name}
      <i style={{ color: "#ccc" }}> #{id}</i>
    </Typography>
  );

  // eslint-disable-next-line array-callback-return
  const tabs = tab_groups?.map((tab: any) => {
    if (tab.component) {
      const Component = get_Component(tab.component);
      if (Component !== null) {
        return (
          <Tab label={tab.label || tab.name || "InstanceTab"} key={tab.name}>
            <Component />
          </Tab>
        );
      }
    }
    if (tab.direction === "tomany") {
      // <> "toone"
      return DynRelationshipMany(resource_name, id, tab, basePath);
    }
    if (tab.direction === "toone") {
      return DynRelationshipOne(resource_name, id, tab);
    }
  });

  return (
    <SimpleShowLayout>
      {title}
      <Grid container spacing={3}>
        {attributes.map((attr: any) => (
          <ShowRecordField
            key={attr.name}
            source={attr}
            tabs={tabs}
            path={basePath}
            id={id}
          />
        ))}
      </Grid>
      <hr style={{ margin: "30px 0px 30px" }} />
      <TabbedShowLayout
        tabs={
          <TabbedShowLayoutTabs variant="scrollable" scrollButtons="auto" />
        }
      >
        {tabs}
      </TabbedShowLayout>
    </SimpleShowLayout>
  );
};

const DynRelationshipOne = (resource_name: any, id: any, relationship: any) => {
  const [rel_data, setRelData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rel_error, setRelError] = useState(false);
  const dataProvider = useDataProvider();
  const { data, error } = useGetOne(resource_name, { id: id });
  const rel_id =
    data &&
    relationship.fks.map((fk: any) => (data[fk] ? data[fk] : "")).join("_");
  let tab_content: React.ReactNode = " - ";
  useEffect(() => {
    if (rel_id === undefined || rel_id === "") {
      setLoading(false);
      return;
    }
    dataProvider
      .getOne(relationship.resource, { id: rel_id })
      .then(({ data }) => {
        setRelData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        setRelError(error || "Relationship Error");
        setLoading(false);
      });
  }, [data]);
  const resetErrorBoundary = () => {
    console.log("error");
  };
  if (!rel_data) {
    tab_content = loading ? (
      <Loading key={relationship.name} />
    ) : (
      <BlockIcon style={{ fill: "#ccc" }} />
    );
  } else if (error || rel_error) {
    let err: any = error;
    tab_content = (
      <Error
        key={relationship.name}
        error={err || rel_error}
        resetErrorBoundary={resetErrorBoundary}
      />
    );
  } else if (rel_data) {
    tab_content = <RelatedInstance instance={rel_data} resource_name={""} />;
  } else {
    // Deprecated.. Delete this stmt??
    console.warn("Hit deprecated code!");
    if (data[relationship.name]?.data === null) {
      tab_content = "Empty";
    } else if (
      data &&
      data[relationship.name]?.type &&
      data[relationship.name].type === relationship?.target_resource?.type
    ) {
      tab_content = (
        <RelatedInstance
          instance={data[relationship.name]}
          resource_name={""}
        />
      );
    } else if (data[relationship.name]?.data) {
      // todo: might be obsolote, tbd
      // todo: fix the data provider so we can simplify this conditional and use <RelatedInstance> instead
      const rel_resource = type2resource(
        data[relationship.name].data?.type,
        {}
      );
      if (!rel_resource) {
        console.warn(
          `Related resource not found ${resource_name}.${relationship.name}`
        );
      } else {
        tab_content = <div>LoadingRelatedInstance</div>;
      }
    }
  }

  return (
    <Tab
      label={relationship.label || relationship.name}
      key={relationship.name}
    >
      {tab_content}
    </Tab>
  );
};

const DynRelationshipMany = (
  resource_name: any,
  id: any,
  relationship: any,
  path: any
) => {
  const [loading, setLoading] = useState(true);
  const [, setError] = useState();
  const [related, setRelated] = useState(false);
  const dataProvider = useDataProvider();
  console.log("related: ", related);
  console.log("loading: ", loading);

  const conf = useConf();

  useEffect(() => {
    dataProvider
      .getOne(resource_name, { id: id })
      .then(({ data }) => {
        setRelated(data.relationships);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const target_resource = conf?.resources?.[relationship?.resource];
  if (!target_resource) {
    console.warn(
      `${resource_name}: No resource conf for ${relationship.resource}`
    );
    // console.log({ relationship });
    return null;
  }

  if (!target_resource?.attributes) {
    console.log("No target resource attributes");
    return null;
  }

  /*
        Render the datagrid, this is similar to the grid in gen_DynResourceList
        todo: merge these into one component
    */
  let attributes = target_resource.attributes.filter(
    (attr: any) => attr.relationship?.target !== resource_name
  ); // ignore relationships pointing back to the parent resource
  attributes = relationship.attributes
    ? attributes.filter((attr: any) =>
        relationship.attributes.find((r_attr: any) => r_attr.name === attr.name)
      )
    : attributes;

  const fields = attr_fields(attributes, {});
  const col_nr = target_resource.max_list_columns;
  const fk = relationship.fks.join("_");
  const label = relationship.label || relationship.name;
  return (
    <Tab label={label} key={relationship.name} style={{ color: "#3f51b5" }}>
      <ReferenceManyField
        reference={relationship.resource}
        target={fk}
        // addLabel={false}
        pagination={<DynPagination />}
        perPage={target_resource.perPage || 25}
      >
        <Datagrid
          rowClick="show"
          expand={
            <DetailPanel attributes={target_resource.attributes} path={path} />
          }
          isPending={loading}
        >
          {fields.slice(0, col_nr)}
          <EditButton />
        </Datagrid>
      </ReferenceManyField>
      <DynReferenceCreate
        resource_name={relationship.resource}
        path={path}
        currentid={id}
        currentParent={resource_name}
      ></DynReferenceCreate>
    </Tab>
  );
};

interface RelatedInstanceProps {
  instance: any;
  resource_name: any;
}

export const RelatedInstance: React.FC<RelatedInstanceProps> = ({
  instance,
}) => {
  const conf = useConf();
  if (!instance?.type) {
    return <span></span>;
  }
  const resource_name = type2resource(instance?.type, conf);
  if (!resource_name) {
    return <span>...</span>;
  }

  const resource_conf = conf?.resources?.[resource_name];
  const attributes = resource_conf?.attributes || [];

  // ugly manual styling because adding to TabbedShowLayout didn't work
  const result = (
    <div style={{ left: "-16px", position: "relative" }}>
      <div style={{ textAlign: "right", width: "100%" }}>
        <Button
          title="edit"
          component={Link}
          to={{
            pathname: `${resource_name}/${instance.id}`,
          }}
          label="Link"
        >
          <EditIcon />
          Edit
        </Button>
        <Button
          title="view"
          component={Link}
          to={{
            pathname: `/${resource_name}/${instance.id}/show`,
          }}
          label="Link"
        >
          <KeyboardArrowRightIcon />
          View
        </Button>
      </div>
      <Grid container spacing={3}>
        {
          //{attributes.map((attr) => <ShowField label={attr.name} key={attr.name} value={instance.attributes[attr.name]}/> )}
          attributes.map((attr: any) => (
            <ShowAttrField
              key={attr.name}
              attr={attr}
              value={instance.attributes[attr.name]}
              id={0}
            />
          ))
        }
      </Grid>
    </div>
  );

  return result;
};

const ShowInfoContent = (props: any) => {
  const [infoToggle] = useInfoToggle();
  const content = props.resource[`info_show`];
  return (
    <>
      {infoToggle ? (
        <div>
          <Typography
            id="modal-modal-description"
            style={{ marginTop: "2rem" }}
          >
            <div
              id="info_content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </Typography>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

const ShowActions = ({ resource }: { resource: any }) => {
  return (
    <>
      <ShowInfoContent resource={resource} />
      <TopToolbar>
        <InfoModal resource={resource} mode="show" />
        <EditButton />
      </TopToolbar>
    </>
  );
};

export const gen_DynResourceShow = (resource_conf: any) => {
  let attributes = resource_conf.attributes;
  attributes = attributes.filter((attribute) => attribute.hide_list !== "true");
  const tab_groups = resource_conf.tab_groups;
  let show = (
    <ShowInstance
      attributes={attributes}
      tab_groups={tab_groups}
      resource_name={resource_conf.name}
    />
  );
  if (resource_conf.components?.show) {
    const Wrapper: any = get_Component(resource_conf.components?.show);
    if (Wrapper !== null) show = <Wrapper show={show} />;
  }

  return (
    <Show
      title={<ResourceTitle resource={resource_conf} record={""} />}
      actions={<ShowActions resource={resource_conf} />}
    >
      {show}
    </Show>
  );
};
