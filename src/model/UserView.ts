import quip from "quip-apps-api";

export interface UserViewProps {
    userId: string;
    datetime: string;
}

export default class UserView extends quip.apps.Record {
    static getProperties = () => ({
        userId: "string",
        datetime: "string",
    });

    static getDefaultProperties = () => ({
        userId: "",
        datetime: "",
    });
    getUserId = () => {
        return this.get("userId") as string
    }
    getDatetime = () => {
        return this.get("datetime") as string
    }
    getData() {
        return {
            id: this.getId(),
            datetime: this.get("datetime") as string,
            userId: this.get("userId") as string,
      };
    }
  }