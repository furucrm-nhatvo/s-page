import quip from "quip-apps-api";
import React, { useEffect, useState } from "react";
import DialogWrapperFixed from "./dialogWrapperFixed";
import Charts from "./charts"

export default function FullScreen(props:any) {
  const [isBlur, setBlur] = useState(false)
  let isFullScreen = props.isFullScreen;
  const table = props.table;
  const root=document.querySelector('.root') as HTMLElement
  const allViews = props.allViews;
  const appUsers = props.appUsers;
  const closeFullScreen = props.closeFullScreen;
  useEffect(() => {
    quip.apps.addEventListener(quip.apps.EventType.BLUR, handleBlur)
    quip.apps.addEventListener(quip.apps.EventType.FOCUS, handleFocus)
    return () => {
      quip.apps.removeEventListener(quip.apps.EventType.BLUR, handleBlur)
      quip.apps.removeEventListener(quip.apps.EventType.FOCUS, handleFocus)
    }
  }, []);
  const scrollChange = () => {
    if (isFullScreen) {
      // console.log("scroll top");
      document.querySelector(".root")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    } else {
      // console.log("scroll bottom");
      document.querySelector(".root")?.scrollIntoView(false)
    }
  }
  useEffect(() => {
    scrollChange();
  }, [isFullScreen]);

  const handleBlur = () => {
    setBlur(true)
    closeFullScreen();
  };
  const handleFocus = () => {
    setBlur(false)
  };

  const charts =
  <div>
      <Charts
          allViews={allViews}
        appUsers={appUsers}
        closeFullScreen={closeFullScreen}
      />
  </div>


  return (
    <>{isFullScreen && (
        <DialogWrapperFixed>
          <div style={{ padding: '20px', position:'relative' }}>
            {isBlur?<div style={{position:'absolute', width:'100%', zIndex:'303', height:'90%', background:'white',left:'0', paddingTop:'215px', display:'flex', alignItems:'start', justifyContent:'top'}}>
              <p style={{textAlign:'center', border:'1px solid #aaaaaa', cursor:'pointer', padding:'5px', width:'300px'}}>The component is not in focus.<br/>Click here to gain focus</p>
          </div> : <></>}
          <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px'}}>
            {charts}
            </div>
          </div>
          </div>
        </DialogWrapperFixed>)}
    </>
  );
}