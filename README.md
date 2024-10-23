# Getting Started with React Admin Dashboard for ApiLogicServer

React based Web Admin Dashboard for [APILogicServer](https://github.com/valhuber/ApiLogicServer). 

[Check out the live demo!](https://apilogicserver.pythonanywhere.com/admin-app/index.html) 

## Installation

```bash
git clone https://github.com/thomaxxl/safrs-react-admin
cd safrs-react-admin
git clone https://github.com/thomaxxl/rav3-jsonapi-client # modified data provider used, installed in the project root
npm install
npm run build
```


# Customization

## SPA

Example with dataProvider:

[src/components/Layout.tsx:Layout](src/components/Layout.tsx) -> [src/components/Spa.tsx:Spa](src/components/Spa.tsx)

## Custom Components

### Configuration

In `admin.yaml`, for example:

```yaml
User:
    show: UserShow
    list: UserList
    attributes:
        - name: username
          component: SampleColumnField
```

### Attribute Components

Implementation:  `src/components/DynInstance.tsx` -> `get_Component()` -> `src/components/Custom.tsx` 

**Parameters**

* attribute
  * `name`, `label`, `type`, ... (from admin.yaml)
  * `resource`
* mode
  * `list`, `show`

** Components **
* [`SampleColumnField`](src/components/Custom.tsx)
* [`UserPasswordField`]

### List Components

Example: [`TileList`](src/components/custom/TileList.tsx)

### Show Components

