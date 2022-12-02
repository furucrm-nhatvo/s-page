import quip from "quip-apps-api";
import React, { useEffect, useRef, useState } from "react";

export default function DialogWrapperFixed(props: any) {
  const containerRef = useRef(null);
  const style: any = {
    position: "fixed",
    overflow: "scroll",
    width: "100%",
    height: window.screen.width/window.screen.height<1.7?window.screen.height*0.81:window.screen.height*0.74,
    background: "white",
    left: "0",
    zIndex: "301",
  };
  useEffect(() => {
    quip.apps.showBackdrop(props.onDismiss);
    if (containerRef.current) {
      quip.apps.addDetachedNode(containerRef.current);
    }
    return () => {
      quip.apps.dismissBackdrop();
      if (containerRef.current) {
        quip.apps.removeDetachedNode(containerRef.current);
      }
    };
  }, []);
  return (
    <div ref={containerRef} style={style}>
      {props.children}
    </div>
  );
}