import quip from "quip-apps-api";
import AppUser from "./AppUser";

export interface DocsStampProps {
    id: string;
    name: boolean;
    reactions: AppUser[];
}

export default class DocsStamp extends quip.apps.Record {
    static getProperties = () => ({
        id: "string",
        name: "string",
        ractinons: "array"
    })

    static getDefaultProperties = () => ({
        disabled: false,
        time: 0,
        content: {
            RichText_placeholderText : ""
        },
        comment: {},
        likes: [],
        userPin: undefined,
        userUpdate: undefined,
        clickedPinList: [],
    })
    getData() {
        return {
            id: this.getId(),
            name: this.get("title") as string,
            reactions: this.get("reactions") as AppUser[],
        }
    }
}