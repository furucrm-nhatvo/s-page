import quip from "quip-apps-api";
import UserView from "./UserView";


export interface AppUserProps {
  id: string;
  name: string;
  views: UserView[];
  lastView:string
}

export default class AppUser extends quip.apps.Record {
    static getProperties = () => ({
      id: "string",
      name: "string",
      views: quip.apps.RecordList.Type(UserView),
      lastView:"string"
    });
  
    static getDefaultProperties = () => ({
      id: "",
      name: "",
      views: [],
      lastView:""
    });
  
    getId() {
        return this.get("id") as string;
      }
    
      setId(id: string) {
        this.set("id", id);
      }
    
      getName() {
        return this.get("name") as string;
      }
    
      setName(name: string) {
        this.set("name", name);
      }
  
      getViews = () => this.get("views") as quip.apps.RecordList<UserView>
  getLastView() {
    return this.get("lastView") as string
  }
    getData() {
      return {
        id: this.get("id") as string,
        name: this.get("name") as string,
        views: this.getViews().getRecords() as UserView[],
        lastView:this.get("lastView") as string
      };
    }
  }