import loadable from "@loadable/component";

// Return an external component by the specified name
const get_Component = (name: any) => {
  try {
    const Component = loadable(() => import(`./components/Custom`), {
      resolveComponent: (components: any) => components[name],
    });
    if(Component){
      return Component;
    }
  } catch (e) {
    alert("Custom component error");
    console.error("Custom component error", e);
  }
  return <>Component not found</>;
};

export default get_Component;
