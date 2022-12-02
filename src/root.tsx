import quip from "quip-apps-api";
import React from "react";
import ReactDOM from "react-dom";
import Main from "./components/main";
import {updateToolbar} from "./menus";
import { RootEntity } from "./model/root";
import AppUser from "./model/AppUser";
import DocsStamp from "./model/DocsStamp";
import Views from "./model/Views"
import UserView from "./model/UserView";
// import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
// import IconSettings from '@salesforce/design-system-react/components/icon-settings';
// const LDS_ROOT = 'assets/lds';

quip.apps.registerClass(RootEntity, RootEntity.ID);
quip.apps.registerClass(AppUser, "app-user");
quip.apps.registerClass(DocsStamp, "docs-stamp");
quip.apps.registerClass(Views, "views");
quip.apps.registerClass(UserView, "user-views");


quip.apps.initialize({
    initializationCallback: function (
        rootNode: Element,
        params: {
            isCreation: boolean;
            creationUrl?: string;
        }
    ) {
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        const threadId = quip.apps.getThreadId();
        const nowThreadId = rootRecord.get("threadId");
        if (nowThreadId === "" || nowThreadId==null|| nowThreadId==undefined) {
            rootRecord.set("threadId", threadId);
        }
        else if (threadId != nowThreadId) {
            rootRecord.clear("allViews");
            rootRecord.clear("adminUserIds");
            rootRecord.clear("appUsers");
            rootRecord.clear("userViews");
            rootRecord.clear("isAdminOnly");
        }
        rootRecord.set("threadId", threadId);
        const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
        const adminUsers = rootRecord.get("adminUserIds");
        if (currentUser && adminUsers.length < 1) {
            rootRecord.set("adminUserIds",[currentUser.id()]);
        }
        else {
            if (currentUser) {
                // console.log("currentUser", currentUser.id());
            }
            // console.log("adminUsers", adminUsers);
            // console.log("no changes");
        }
        ReactDOM.render(
            <Main
                rootRecord={rootRecord}
                isCreation={params.isCreation}
                creationUrl={params.creationUrl}
            />,
            rootNode
        );
        updateToolbar();
    },
});
