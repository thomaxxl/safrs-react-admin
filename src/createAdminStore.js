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
}

const adminReducerWrapper = (previousState, action) => {
    
    const result = adminReducer(previousState, action)
    //console.log(action)
    if(action.type == "CRUD_GET_ONE_SUCCESS"){
        return result;
    }
    // Add the included resources to the redux store
    for(let instance of action.payload?.included || []){
        const resource_name = type2resource(instance.type)
        if(instance.type !== undefined && instance.id !== undefined){
            result['resources'][resource_name][instance.id] = instance;
        }
    }

    if(Array.isArray(action.payload?.data)){
        /*
            link all related data to the corresponding item in the store
            getList, getMany etc .. check action.type
        */
        for(let instance of action.payload.data){
            if(!instance.relationships){
                continue;
            }
            for(let [rel_name , rel] of Object.entries(instance.relationships)){
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
        }
    }
    else if(action.payload?.data?.type){

    }
    
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