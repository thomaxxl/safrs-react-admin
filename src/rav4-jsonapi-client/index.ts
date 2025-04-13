import { jsonapiClient } from "./rav4-jsonapi-client/ra-jsonapi-client";
import { getConf, loadHomeConf } from './Config';
import { resolve } from "path";
require('./globals');

const fetchList = async (dataProvider: any, resource_name: string) => {
  try {
    const result = await dataProvider.getList(resource_name, { pagination: { page: 1, perPage: 2 }, meta: { include: ['+all'] } });
    return result.data;
  } catch (error) {
    console.error('Error loading:', error);
  }
};

const fetchOne = async (dataProvider: any, resource_name: string, id: string) => {
  try {
    const result = await dataProvider.getOne(resource_name, { id: id, meta: { include: ['+all'] } });
    return result.data;
  } catch (error) {
    console.error('Error loading:', error);
  }
};

const fetchMany = async (dataProvider: any, resource_name: string, ids: string[]) => {
  try {
    const result = await dataProvider.getMany(resource_name, { ids: ids, meta: { include: ['+all'] } });
    return result.data;
  } catch (error) {
    console.error('Error loading:', error);
  }
};

const isEqual = (obj1: any, obj2: any): boolean => {
  const keysToExclude = ["validUntil", "S_CheckSum", "_check_sum_"];
  const filteredObj1 = Object.keys(obj1)
    .filter(key => !keysToExclude.includes(key))
    .reduce((acc, key) => {
      acc[key] = obj1[key];
      return acc;
    }, {} as any);

  const filteredObj2 = Object.keys(obj2)
    .filter(key => !keysToExclude.includes(key))
    .reduce((acc, key) => {
      acc[key] = obj2[key];
      return acc;
    }, {} as any);

  return JSON.stringify(filteredObj1) === JSON.stringify(filteredObj2);
};

const main = async () => {
  try {
    await loadHomeConf("http://localhost:5656/ui/admin/admin.yaml?v=0");
    const conf = getConf();
    const dataProvider = jsonapiClient(conf.api_root, { conf: {} }, null);
    const resource_name = Object.keys(conf.resources)[1];
    const listData = await fetchList(dataProvider, resource_name);

    const firstItem = listData[0];
    const itemData = await fetchOne(dataProvider, resource_name, firstItem.id);

    const ids = listData.map((item: any) => item.id);
    const manyData = await fetchMany(dataProvider, resource_name, ids);

    // Verify that firstItem is equal to itemData
    localStorage.setItem('firstItem', JSON.stringify(firstItem));
    localStorage.setItem('itemData', JSON.stringify(itemData));
    localStorage.setItem('manyData', JSON.stringify(manyData));
    let itemsAreEqual = isEqual(firstItem.attributes, itemData.attributes);
    console.log(`firstItem attrs equal to itemData: ${itemsAreEqual}`);
    itemsAreEqual = isEqual(firstItem.relationships, itemData.relationships);
    console.log(`firstItem rels equal to itemData: ${itemsAreEqual}`);

    // Verify that firstItem is equal to manyData[0]
    itemsAreEqual = isEqual(firstItem.attributes, manyData[0].attributes);
    console.log(`firstItem attrs equal to manyData[0]: ${itemsAreEqual}`);

  } catch (error) {
    console.error('Error loading home configuration:', error);
    process.exit(1);
  }
};

main();