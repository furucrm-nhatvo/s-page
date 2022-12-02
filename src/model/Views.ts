import quip from "quip-apps-api";
import AppUser from "./AppUser";

export interface ViewsProps {
    date: string[];
    lastViewDate: string;
    userId: string;
    userName: string;
}

export default class Views extends quip.apps.Record {
    static getProperties = () => ({
        date: "array",
        lastViewDate:"string",
        userId: "string",
        userName: "string",
    });

    static getDefaultProperties = () => ({
        date: [],
        lastViewDate:"",
        userId: "",
        userName: "",
    });
    getViewCount = () => {
        const date = this.get("date") as string[];
        return date.length;
    }
    getUserId = () => {
        return this.get("userId") as string;
    }
    getUserName = () => {
        return this.get("userName") as string;
    }
    setUserDate = (viewDate : string[]) => {
        this.set("date", viewDate);
    }
    getData() {
        return {
            id: this.getId(),
            date: this.get("date") as string[],
            lastViewDate: this.get("lastViewDate") as string,
            userId: this.get("userId") as string,
            userName: this.get("userName") as string,
      };
    }
  }