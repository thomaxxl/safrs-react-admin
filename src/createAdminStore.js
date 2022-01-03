import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import { all, fork } from 'redux-saga/effects';
import { put, takeEvery } from 'redux-saga/effects';
import { AutocompleteArrayInput, showNotification } from 'react-admin';

import {
    adminReducer,
    adminSaga,
    USER_LOGOUT,
} from 'react-admin';
import {get_Conf} from './Config'

const conf = get_Conf();

function* preSaga() {
    yield takeEvery('RA/CRUD_GET_LIST_SUCCESS', function* (args) {
        console.log(args)
        yield put(showNotification('preSaga'));
    })
}

function* postSaga() {
    yield takeEvery('RA/CRUD_GET_LIST_SUCCESS', function* (args) {
        console.log(args)
        yield put(showNotification('Update'));
    })
}

const sReducer = (previousState = 0, { type, payload }) => {
    
    if (type === 'RA/CRUD_GET_LIST_SUCCESS') {
        return previousState;
    }
    return previousState;
}

const type2resource = (type) => {
    // map the resource "type" (jsonapi type attr) to the resource_name (list/collection name)
    for(let [resource_name, resource] of Object.entries(conf.resources)){
        if(resource.type === type){
            return resource_name
        }
    }
    return false
}


const instance2store = (instance, result) => {

    if(!instance?.relationships){
        return result
    }
    for(let [rel_name , rel] of Object.entries(instance.relationships)){
        if(!rel?.data){
            continue
        }
        let rel_resource_name = type2resource(rel.data?.type)
        if(rel_resource_name){
            if(Array.isArray(rel.data)){
                instance.relationships[rel_name] = instance[rel_name] = rel.data.map(rel_inst => result['resources'][rel_resource_name][rel_inst.id])
            }
            else if(rel.data?.id){
                // link toone resources
                instance.relationships[rel_name] = instance[rel_name] = result['resources'][rel_resource_name][rel.data.id]
            }
        }
    }
    return result
}

const adminReducerWrapper = (previousState, action) => {
    
    let result = adminReducer(previousState, action)
    
    if(action.type == "CRUD_GET_ONE_SUCCESS"){
        return result;
    }
    /*
        Add the included resources to the redux store
        when items have been included we have to sort the corresponding resources per the resource conf
    */
    const inc_resources = new Set();
    for(let instance of action.payload?.included || []){
        const resource_name = type2resource(instance.type)
        if(instance.type !== undefined && instance.id !== undefined && resource_name){
            if(!result['resources'][resource_name]){
                result['resources'][resource_name] = {}
            }
            result['resources'][resource_name][instance.id] = instance;
            inc_resources.add(resource_name)
        }
    }

    for(let resource_name of inc_resources){
        //Object.entries(result['resources'][resource_name]).sort()
    }

    if(Array.isArray(action.payload?.data)){
        /*
            link all related data to the corresponding item in the store
            getList, getMany etc .. check action.type
        */
        let data = action.payload.data
        if(Array.isArray(action.payload.included)){
            //data += action.payload.included
        }
        for(let instance of data){
            result = instance2store(instance, result)
        }
    }
    else if(action.payload?.data?.type){
        result = instance2store(action.payload.data, result)
    }
    
    result.loading = 0 // todo!!
    return result;
}


export default ({
    authProvider,
    dataProvider,
    history,
}) => {
    const reducer = combineReducers({
        admin: adminReducerWrapper,
        router: connectRouter(history),
        sReducer: sReducer
        // add your own reducers here
    });
    const resettableAppReducer = (state, action) =>
        reducer(action.type !== USER_LOGOUT ? state : undefined, action);

    const saga = function* rootSaga() {
        yield all(
            [
                //preSaga,
                adminSaga(dataProvider, authProvider),
                //postSaga
                
            ].map(fork)
        );
    };
    const sagaMiddleware = createSagaMiddleware();

    const composeEnhancers =
        (process.env.NODE_ENV === 'development' &&
            typeof window !== 'undefined' &&
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                trace: true,
                traceLimit: 25,
            })) ||
        compose;
  
    const store = createStore(
        resettableAppReducer,
        { /* set your initial state here */ },
        composeEnhancers(
            applyMiddleware(
                sagaMiddleware,
                routerMiddleware(history),
                // add your own middlewares here
            ),
            // add your own enhancers here
        ),        
    );
    sagaMiddleware.run(saga);
    return store;
};