import React, { useRef, useState, useEffect } from "react";
import quip from "quip-apps-api";
import { IconButton, withWidth } from "@material-ui/core";
import { Visibility,PeopleAlt,Star,BarChart } from '@material-ui/icons';
import AppUser from "../model/AppUser";
import { RootEntity } from '../model/root';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { format, parse, differenceInCalendarDays } from 'date-fns'

const useStyles = makeStyles({
  iconButton: {
    color: "#207766",
    margin: "2px 2px 2px 5px",
    backgroundColor:"##A4D8CD3D",
    "&:hover": {
      background: "#A4D8CD5D"
    },
  },
  iconButtonFix: {
    color: "#207766",
    margin: "2px 2px 2px 5px",
    backgroundColor:"##A4D8CD3D",
    "&:hover": {
      background: "##A4D8CD3D"
    },
  },
  iconButtonRight: {
    color: "#207766",
    marginLeft: "auto",
    marginRight: "5px",
    backgroundColor:"##A4D8CD3D",
    "&:hover": {
      background: "#A4D8CD5D"
    },
  }
});
export default React.memo((props: any) => {
    const { allViews, adminUserIds} = props;
    const [viewsTotal, setAllViewsTotal] = useState<number>(0);
  const handleClick = props.handleClick;
  const handleAdminOpen = props.handleAdminOpen;
  const handleChartOpen = props.handleChartOpen;
  const isAdminOnly = props.isAdminOnly;
  const classes = useStyles();
  const root = document.querySelector('.root') as HTMLElement
  let full = false;
  
  useEffect(() => {
        const viewsTotal = allViews.map((e: any) => e.get("date")).reduce((count: number, date: string[]) => count + date.length, 0);
        setAllViewsTotal(viewsTotal);
  }, [allViews]);

  const handleTableOpen = () => {
      handleClick();
  }
  const height = window.screen.width / window.screen.height < 1.7 ? window.screen.height * 0.85 : window.screen.height * 0.76;

  const handleChartClick = () => {
    full = true;
      handleChartOpen();
  }

  const handleAdminClick = () => {
    const isAdmin = getIsAdmin();
    const allMembers = quip.apps.getDocumentMembers();
    // allMembers.forEach(user => console.log(user.getName() + " is a member of this document"));
    if (isAdmin) {
      handleAdminOpen();
    }
  }
  const getIsAdmin = () => {
    const adminUsers = adminUserIds;
    const currentUser: quip.apps.User | undefined = quip.apps.getViewingUser();
    if (currentUser) {
      return adminUsers.includes(currentUser.id());
    }
    return false;
  }
  const getAdminIcon = () => {
    const isAdmin = getIsAdmin();
      if (isAdmin) {
        return (
          <>
            <IconButton className={classes.iconButtonRight} aria-label="Admin User" onClick={handleAdminClick}>
              <Star/>
            </IconButton>
          </>
        )
    }
  }

  const getChartIcon = () => {
    const isAdmin = getIsAdmin();
    if (!(isAdminOnly && !isAdmin)) {return (
      <>
      <IconButton className={classes.iconButton} aria-label="Chart" onClick={handleChartClick}>
      <BarChart/>
    </IconButton>
          </>
        )
    }
  }

    return (
      <>
        <div className="tracker" style={{marginLeft:"auto", marginRight:"auto",position:"relative",minHeight:full?height:"auto"}}>
          <IconButton className={classes.iconButton} aria-label="all view counts" onClick={handleTableOpen}>
            <Visibility />
          </IconButton>
          <div className="inline">
              {viewsTotal}
          </div>
      
          <IconButton className={classes.iconButton} aria-label="all view counts" onClick={handleTableOpen}>
              <PeopleAlt />
          </IconButton>
          <div
              data-tip
              data-for="uuCount"
              data-event="click focus"
              className="inline"
              >
              {allViews.length}
          </div>
          {getChartIcon()}
          {getAdminIcon()}
        </div>
      </>
    );
});