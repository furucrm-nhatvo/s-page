
import quip from "quip-apps-api";
import { apiWrapper } from "./apiWrapper";

const proxy='https://asia-northeast1-rqa-backend.cloudfunctions.net/cors-corsProxy?url='

const QUERY_RECORDS_URL = ({ url, queryString }: any) =>
    `${proxy}${url}/services/data/v55.0/query?q=${queryString}`;
const GET_RECORD_URL = ({ url, sObject, recordId }: any) =>
    `${proxy}${url}/services/data/v55.0/sobjects/${sObject}/${recordId}`;
const GET_OBJECT_INFO = ({ url, sObject }: any) =>
    `${proxy}${url}/services/data/v55.0/sobjects/${sObject}/describe`;
const UPDATE_RECORD_URL = ({ url, path }: any) =>
    `${proxy}${url}${path}`;
const ADD_RECORD_URL = ({ url, sObject }: any) =>
    `${proxy}${url}/services/data/v55.0/sobjects/${sObject}/`;
const ADD_RECORDS_URL = ({ url, sObject }: any) =>
`${proxy}${url}/services/data/v56.0/composite/tree/${sObject}/`;
const UPSERT_RECORDS_URL = ({ url, sObject }: any) =>
`${proxy}${url}/services/data/v55.0/composite/sobjects/${sObject}/`;
const DESCRIBE_GLOBAL = ({ url }: any) =>
    `${proxy}${url}/services/data/v55.0/sobjects`;
const COMPOSITE_REQUEST = ({ url }: any) =>
`${proxy}${url}/services/data/v55.0/composite`;



export default class SalesforceApi {
    public static queryRecords = async ({ queryString = '' }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: QUERY_RECORDS_URL({
                url,
                queryString
            })
        });
    };
    public static getRecordById = async ({ sObject = 'Task', recordId = '' }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: GET_RECORD_URL({
                url,
                sObject,
                recordId
            })
        });
    }
    public static getObjectInfo = async ({ sObject = 'Task' }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: GET_OBJECT_INFO({
                url,
                sObject,
            })
        });
    }
    public static describeGlobal = async (): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: DESCRIBE_GLOBAL({
                url,
            })
        });
    }
    public static patchRecord = async ({ path = '', data = {} }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: UPDATE_RECORD_URL({ url, path }),
            method: "PATCH",
            data,
        });
    };
    public static addRecord = async ({ sObject = '', data = {} }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: ADD_RECORD_URL({ url, sObject }),
            method: "POST",
            data,
        });
    };
    public static addRecords = async ({ sObject = '', data = {} }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: ADD_RECORDS_URL({ url, sObject }),
            method: "POST",
            data,
        });
    };
    public static compositeRequest = async ({ sObject = '', data = {} }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: COMPOSITE_REQUEST({ url, sObject }),
            method: "POST",
            data,
        });
    };
    public static upsertRecords = async ({ sObject = '', data = {} }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: UPSERT_RECORDS_URL({ url, sObject }),
            method: "PATCH",
            data,
        });
    };
    public static deleteRecord = async ({ path = '' }): Promise<any> => {
        const url = quip.apps.getRootRecord().get('salesforceUrl')
        if (!url) return false
        return await apiWrapper({
            url: UPDATE_RECORD_URL({ url, path }),
            method: "DELETE",
        });
    };
}
