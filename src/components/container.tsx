import quip from "quip-apps-api";
import React, { useEffect, useState } from "react";
import DialogWrapperFixed from "./dialogWrapperFixed";
import Charts from "./charts";
import { Collapse } from "@material-ui/core";
import { IconButton, withWidth } from "@material-ui/core";
import { Visibility, PeopleAlt, Star, BarChart, CloudOffOutlined, CloudOutlined } from "@material-ui/icons";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles({
  iconButton: {
    color: "#207766",
    margin: "2px 2px 2px 5px",
    backgroundColor: "##A4D8CD3D",
    "&:hover": {
      background: "#A4D8CD5D",
    },
  },
  iconButtonFix: {
    color: "#207766",
    margin: "2px 2px 2px 5px",
    backgroundColor: "##A4D8CD3D",
    "&:hover": {
      background: "##A4D8CD3D",
    },
  },
  iconButtonRight: {
    color: "#207766",
    marginLeft: "auto",
    marginRight: "5px",
    backgroundColor: "##A4D8CD3D",
    "&:hover": {
      background: "#A4D8CD5D",
    },
  },
});

export default function FullScreen(props: any) {
  const [isChartOpen, setChartOpen] = useState(false);
  const [viewsTotal, setAllViewsTotal] = useState<number>(0);
  const [isAdminOpen, setAdminOpen] = useState<boolean>(false);
  const [isTableOpen, setTableOpen] = useState<boolean>(false);
  let isFullScreen = props.isFullScreen;
  const root = document.querySelector(".root") as HTMLElement;
  const {
    allViews,
    adminUserIds,
    table,
    admin,
    isAdminOnly,
    handleView,
    refreshData,
    handleLoad,
  } = props;
  const closeFullScreen = props.closeFullScreen;
  const classes = useStyles();

  useEffect(() => {
    const viewsTotal = allViews
      .map((e: any) => e.get("date"))
      .reduce((count: number, date: string[]) => count + date.length, 0);
    setAllViewsTotal(viewsTotal);
  }, [allViews]);
  const onChartDismiss = () => {
    if (!quip.apps.isAppFocused()) {
      setTimeout(onChartDismiss, 300);
      return;
    }
    document.querySelector(".root")?.scrollIntoView(false);
    const root = document.querySelector(".root") as HTMLElement;
    root.style.height = "auto";
    // root.style.minHeight = "200px";
    setChartOpen(false);
  };

  const openZoomChart = () => {
    const root = document.querySelector(".root") as HTMLElement;
    if (!quip.apps.isAppFocused()) {
      setTimeout(openZoomChart, 300);
      return;
    }
    root.style.height = "1000px";
    setTimeout(() => {
      document.querySelector(".root")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      setChartOpen(true);
    }, 100);
  };
  useEffect(() => {
    props.toggleFullScreen(isChartOpen);
  }, [isChartOpen]);

  const handleTableOpen = () => {
    if (isAdminOnly) {
      const isAdmin = this.getIsAdmin();
      if (!isAdmin) {
        // console.log("not admin");
        return;
      }
    }
    // console.log("is Admin")
    refreshData();
    handleLoad();
    setTableOpen(!isTableOpen);
    setAdminOpen(false);
    setChartOpen(false);
    props.toggleFullScreen(false);
  };
  const handleAdminOpen = () => {
    refreshData();
    handleLoad();
    setAdminOpen(!isAdminOpen);
    setTableOpen(false);
    setChartOpen(false);
    props.toggleFullScreen(false);
  };
  const handleChartOpen = () => {
    refreshData();
    handleLoad();
    openZoomChart();
    setAdminOpen(false);
    setTableOpen(false);
    setChartOpen(!isChartOpen);
    props.toggleFullScreen(isChartOpen);
  };
  const getIsAdmin = () => {
    const adminUsers = adminUserIds;
    const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
    if (currentUser) {
      return adminUsers.includes(currentUser.id());
    }
    return false;
  };
  const getAdminIcon = () => {
    const isAdmin = getIsAdmin();
    if (isAdmin) {
      return (
        <>
          <IconButton
            className={classes.iconButtonRight}
            aria-label="Admin User"
            onClick={handleAdminOpen}
          >
            <Star />
          </IconButton>
        </>
      );
    }
  };
  const getOrgIcon = () => {
    const isAdmin = getIsAdmin();
    if (isAdmin) {
      return (
        <>
          {quip.apps.getRootRecord().get('salesforceUrl')
          ?<IconButton
              className={classes.iconButton}
              aria-label="open org"
              onClick={openOrg}
            >
              <CloudOutlined />
            </IconButton>
            : <IconButton 
                className={classes.iconButton}
                aria-label="Admin User"
                onClick={handleAdminOpen}
              >
                  <CloudOffOutlined />
              </IconButton>
            }
        </>
      );
    }
  };
  const getChartIcon = () => {
    const isAdmin = getIsAdmin();
    if (!(isAdminOnly && !isAdmin)) {
      return (
        <>
          <IconButton
            className={classes.iconButton}
            aria-label="Chart"
            onClick={handleChartOpen}
          >
            <BarChart />
          </IconButton>
        </>
      );
    }
  };

  const charts = (
    <div>
      <Charts allViews={allViews} toggleFullScreen={props.toggleFullScreen} />
    </div>
  );
  const openOrg = ()=>{
    quip.apps.openLink(quip.apps.getRootRecord().get('salesforceUrl'))
  }
  return (
    <>
      {isFullScreen ? (
        <DialogWrapperFixed onDismiss={onChartDismiss}>
          <div style={{ position: "relative", height: "100%" }}>
            {props.isBlur ? (
              <div
                style={{
                  position: "fixed",
                  width: "100%",
                  zIndex: "303",
                  height: "180%",
                  background: "white",
                  left: "0",
                  paddingTop: "215px",
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    textAlign: "center",
                    border: "1px solid #aaaaaa",
                    cursor: "pointer",
                    padding: "5px",
                    width: "300px",
                  }}
                >
                  The component is not in focus.
                  <br />
                  Click here to gain focus
                </p>
              </div>
            ) : (
              <></>
            )}
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                {charts}
              </div>
            </div>
          </div>
        </DialogWrapperFixed>
      ) : (
        <>
          <div
            className="tracker"
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              position: "relative",
              width: "100%",
            }}
          >
            <IconButton
              className={classes.iconButton}
              aria-label="all view counts"
              onClick={handleTableOpen}
            >
              <Visibility />
            </IconButton>
            <div className="inline">{viewsTotal}</div>

            <IconButton
              className={classes.iconButton}
              aria-label="all view counts"
              onClick={handleTableOpen}
            >
              <PeopleAlt />
            </IconButton>
            <div className="inline">{allViews.length}</div>
            {getChartIcon()}
            {getOrgIcon()}
            {getAdminIcon()}
          </div>
          <Collapse in={isTableOpen}>{table}</Collapse>
          <Collapse in={isAdminOpen}>{admin}</Collapse>
        </>
      )}
    </>
  );
}
