import RootRecord from "quip-apps-api/dist/root-record";
import React, { Component , useEffect} from "react";
import { AppData, RootEntity } from "../model/root";
import Tracker from "./tracker";
import Table from "./table";
import Charts from "./charts";
import DialogWrapperFixed from "./dialogWrapperFixed";
import Container from "./container";
import Admin from "./admin";
import Views from "../model/Views";
import AppUser from "../model/AppUser";
import UserView from "../model/UserView";
import quip from "quip-apps-api";
import { Collapse } from "@material-ui/core";
import { format, parse, differenceInCalendarDays, differenceInHours} from 'date-fns'
import { createStyles, lighten, makeStyles, Theme } from '@material-ui/core/styles';
import User from "quip-apps-api/dist/user";
import FullScreen from "./fullscreen";
import zIndex from "@material-ui/core/styles/zIndex";
import SalesforceSync from "./SalesforceSync";


interface data {
    name: string;
    id: string;
    isAdmin : boolean;
}
  
interface MainProps {
    rootRecord: RootEntity;
    isCreation: boolean;
    creationUrl?: string;
}

interface MainState {
    data: AppData;
    allViews: Views[];
    adminUserIds: String[];
    appUsers: AppUser[];
    isAdminOnly: boolean;
    isTableOpen: boolean;
    isAdminOpen: boolean;
    isFullScreen: boolean;
    isBlur: boolean;
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    width: {
        minWidth: "auto",
          width: "100%",
        maxWidth:'auto',
    },
  }),
);

export default class Main extends Component<MainProps, MainState> {
    setupMenuActions_(rootRecord: RootEntity) { }

    rootMinHeight = 100;
    constructor(props: MainProps) {
        super(props);
        const {rootRecord} = props;
        this.setupMenuActions_(rootRecord);
        const data = rootRecord.getData();
        this.state = {
            data,
            allViews: rootRecord.getAllViews().getRecords(),
            adminUserIds: rootRecord.getAdminUserIds(),
            appUsers: rootRecord.getAppUsers().getRecords(),
            isAdminOnly:rootRecord.getIsAdminOnly(),
            isTableOpen: false,
            isAdminOpen: false,
            isFullScreen: false,
            isBlur: true,
        };
    }
    interval:NodeJS.Timer;
    componentDidMount() {
        const {rootRecord} = this.props;
        rootRecord.listen(this.refreshData_);
        this.refreshData_();
        if (quip.apps.isOnline()) {
            this.handleLoad();
        }
        this.interval = setInterval(()=>{
            this.handleLoad()
        }, 5000)
        quip.apps.addEventListener(quip.apps.EventType.ONLINE_STATUS_CHANGED, this.handleLoad);
        quip.apps.addEventListener(quip.apps.EventType.BLUR, this.handleBlur);
        quip.apps.addEventListener(quip.apps.EventType.FOCUS, this.handleFocus);
    }
    componentWillUnmount() {
        const {rootRecord} = this.props;
        rootRecord.unlisten(this.refreshData_);
        clearInterval(this.interval)
        quip.apps.removeEventListener(quip.apps.EventType.BLUR, this.handleBlur);
        quip.apps.removeEventListener(quip.apps.EventType.FOCUS, this.handleFocus);
    }


    handleBlur = () => {
        this.setState({
          isBlur: true
        })
    }
    handleFocus = () => {
        this.setState({
          isBlur: false
        })
    }

    private refreshData_ = () => {
        const {rootRecord} = this.props;
        this.setupMenuActions_(rootRecord);
        this.setState({
            data: rootRecord.getData(),
            allViews: rootRecord.getAllViews().getRecords(),
            adminUserIds:rootRecord.getAdminUserIds(),
            appUsers: rootRecord.getAppUsers().getRecords(),
            isAdminOnly:rootRecord.getIsAdminOnly()
        });
    };
    private getIsAdmin = () => {
        const {adminUserIds} = this.state;
      const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
      if (currentUser) {
        // console.log("isAdmin", adminUserIds.includes(currentUser.id()),adminUserIds);
        if (adminUserIds.includes(currentUser.id())) {
        //   console.log(adminUserIds, currentUser.id());
        }
        return adminUserIds.includes(currentUser.id());
      }
      return false;
    }

    toggleFullScreen = (state: boolean) => {
        this.setState({
          isFullScreen: state
        })
    }

    handleView = (user: quip.apps.User) => {
        // console.log("in handle view.")
        const { rootRecord } = this.props;
        const allViews = rootRecord.getAllViews();
        const appUsers = rootRecord.getAppUsers();
        const isAdminOnly = rootRecord.getIsAdminOnly();
        const countingCycle = rootRecord.get("countingCycle");
        const datetime = new Date();
        const thisDatetime = format(new Date(), 'yyyy/MM/dd HH:mm:ss');
        const views = allViews.getRecords();
        // views.map((e: any) => console.log(e.get("userId"), e.get("userName"),  e.get("date")));
        const viewsIndex = views.findIndex((views: any) => views.get("userId") === user.getId());
        if (viewsIndex === -1) {
            allViews.add({
                userId: user.getId(),
                userName: user.getName(),
                date: [thisDatetime],
                lastViewDate: thisDatetime,
            });
            // console.log("First sight.");
        }
        else {
            const userViews = allViews.get(viewsIndex);
            const userDatetimes = userViews.get("date");
            const lastDateStr = userDatetimes[userDatetimes.length - 1];
            const lastDate = parse(lastDateStr, "yyyy/MM/dd HH:mm:ss", new Date());
            const differenceInC = differenceInCalendarDays(datetime, lastDate);
            const differenceInH = differenceInHours(datetime, lastDate);
            userViews.set("lastViewDate", thisDatetime);
            if (differenceInH >= countingCycle) {
                userDatetimes.push(thisDatetime);
                userViews.set("date", userDatetimes);
                // userViews.setUserDate(userDatetimes);
            }
            else {
                if (countingCycle == 24 && differenceInC >= 1) {
                    userDatetimes.push(thisDatetime);
                    userViews.set("date", userDatetimes);
                    // userViews.setUserDate(userDatetimes);
                }
                // console.log("You are viewing on the same day.")
            }
            // console.log(userViews);
        }
        // console.log("view", allViews);
        this.forceUpdate();
    }
    handleLoad = () => {
    //   console.log("in handleLoad.")
        const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
      if (currentUser) {
          this.handleView(currentUser);
      }
    };

    setFullScreenState = (state: boolean) => {
        this.setState({
            isFullScreen:state
        })        
    }

    render() {
        const { data, allViews, adminUserIds,appUsers, isTableOpen, isAdminOpen, isAdminOnly, isFullScreen } = this.state;
        
        const root=document.querySelector('.root') as HTMLElement
        const { rootRecord } = this.props;
        
        allViews.map((e: any) => {
            const userId = e.get("userId");
            const user: quip.apps.User | undefined = quip.apps.getUserById(userId);
        });
        const allMembers = quip.apps.getDocumentMembers();
        const initialRows = [] as data[];
        allMembers.forEach((user) => {
            const userId = user.getId();
            const isAdmin = adminUserIds.includes(userId);
            initialRows.push({
                name: user.getName(),
                id: userId,
                isAdmin:isAdmin
            })
        });
        initialRows.sort((a, b) => {
            if (!a.isAdmin && b.isAdmin) {
                return 1;
            }
                return -1
        });
        const handleChangeisAdminOnly = (isAdminOnly: boolean) => {
            rootRecord.set("isAdminOnly", isAdminOnly);
            this.forceUpdate();
        }
        const handleOpen = () => {
            if (rootRecord.getIsAdminOnly()) {
                const isAdmin = this.getIsAdmin();
                if (!isAdmin) {
                    // console.log("not admin");
                    return;  
                }
            }
            // console.log("is admin");
            this.refreshData_();
            this.handleLoad();
            this.setState({
                isTableOpen: !isTableOpen,
                isAdminOpen:false,
                isFullScreen:false,
            });
        }
        const handleAdminOpen = () => {
            this.refreshData_();
            this.handleLoad();
            this.setState({
                isAdminOpen: !isAdminOpen,
                isFullScreen:false,
                isTableOpen:false
            })
        }
        const closeFullScreen = () => {
            this.setState({
                isFullScreen: false
            })
        }

        const handleChartOpen = () => {
            if (rootRecord.getIsAdminOnly()) {
                const isAdmin = this.getIsAdmin();
                if (!isAdmin) {
                    return;
                }
            }
            this.refreshData_();
            this.handleLoad();
            this.setState({
                isFullScreen: !isFullScreen,
                isAdminOpen: false,
                isTableOpen: false
            })
            // console.log(this.state);
        }

        const addAdmin = (id:string) => {
            const adminUserIdList = adminUserIds;
            adminUserIdList.push(id);
            rootRecord.set("adminUserIds", Array.from(new Set(adminUserIdList)));
            this.forceUpdate();
        }
        const deleteAdmin = (id:string) => {
            const adminUserIdList = adminUserIds;
            const filetredAdmin = adminUserIdList.filter(item => item != id);
            if (filetredAdmin.length > 0) {
                rootRecord.set("adminUserIds", Array.from(new Set(filetredAdmin)));
            }
        }
        const tracker =
            <div>
                <Tracker
                    allViews={allViews}
                    handleView={this.handleView}
                    handleClick={handleOpen}
                    handleAdminOpen={handleAdminOpen}
                    handleChartOpen={handleChartOpen}
                    adminUserIds={adminUserIds}
                    isAdminOnly={isAdminOnly}
                />
            </div>
        
        const table = 
            <div>
                <Table
                    allViews={allViews}
                />
            </div>
        
        const admin =
            <div>
                <Admin
                    isAdminOnly={isAdminOnly}
                    addAdmin={addAdmin}
                    deleteAdmin={deleteAdmin}
                    adminUserIds={adminUserIds}
                    initialRows={initialRows}
                    handleChangeisAdminOnly = {handleChangeisAdminOnly}
                />
            </div>

        const fullscreen = 
            <div>
                <FullScreen
                    allViews={allViews}
                    appUsers={appUsers}
                    isFullScreen={this.state.isFullScreen}
                    closeFullScreen={closeFullScreen}
                    style={{ zIndex: isFullScreen ? "301" : "auto"}}
                />
            </div>

        return (
            <>
                <div className={"root"} style={{
                    minWidth: "auto",
                    width: "100%"
                }}>
                    <SalesforceSync></SalesforceSync>
                    <Container
                        allViews={allViews}
                        appUsers={appUsers}
                        isFullScreen={this.state.isFullScreen}
                        handleView = {this.handleView}
                        table={table}
                        refreshData={this.refreshData_}
                        adminUserIds={adminUserIds}
                        admin={admin}
                        isBlur={this.state.isBlur}
                        handleLoad={this.handleLoad}
                        toggleFullScreen={this.toggleFullScreen}
                    />
                    {/* <FullScreen
                        allViews={allViews}
                        appUsers={appUsers}
                        isFullScreen={this.state.isFullScreen}
                        closeFullScreen={closeFullScreen}
                        table={table}
                        admin={admin}
                        // style={{ zIndex: isFullScreen ? "301" : "auto"}}
                    /> 
                    {tracker}
                    <Collapse in={isTableOpen}>
                        {table}
                    </Collapse>
                    <Collapse in={isAdminOpen}>
                        {admin}
                    </Collapse> */}
                </div>
            </>
        );
    }
}
