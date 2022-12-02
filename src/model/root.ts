import quip from "quip-apps-api";
import Views from "./Views";
import AppUser from "./AppUser";

export interface AppData {
    allViews: Views[]
    appUsers:AppUser[]
    adminUserIds: string[]
    threadId:string
    isAdminOnly:boolean
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "investigateApp";

    static getProperties() {
        return {
            allViews: quip.apps.RecordList.Type(Views),
            appUsers:quip.apps.RecordList.Type(AppUser),
            countingCycle: "number",
            adminUserIds: "array",
            threadId: "string",
            isAdminOnly:"boolean",
            refreshToken:"string",
            accessToken:"string",
            salesforceUrl:"string",
            salesforceId:"string",
            syncing:'boolean',
            nextSync:'number',
            snapshot: 'object'
        };
    }
    
    static getDefaultProperties(): { [property: string]: any } {
        return {
            allViews: [],
            appUsers:[],
            countingCycle: 1,
            adminUserIds: [],
            threadId: "",
            isAdminOnly:false,
            syncing:false,
            nextSync:0,
            snapshot:{}
        };
    }

    getAllViews = () => this.get("allViews") as quip.apps.RecordList<Views>
    getAppUsers = () => this.get("appUsers") as quip.apps.RecordList<AppUser>
    getAdminUserIds = () => this.get("adminUserIds") as string[]
    getIsAdminOnly = () => this.get("isAdminOnly") as boolean
    getData(): AppData {
        const threadId = quip.apps.getThreadId();
        return {
            allViews: this.getAllViews().getRecords() as Views[],
            adminUserIds: this.getAdminUserIds() as string[],
            appUsers:this.getAppUsers().getRecords() as AppUser[],
            threadId: this.get("threadId") as string,
            isAdminOnly:this.getIsAdminOnly() as boolean
        }
    }

    getActions() {
        return {
        };
    }
}
