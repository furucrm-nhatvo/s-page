import quip, { MenuCommand } from "quip-apps-api";
import quiptext from "quiptext";
import RootRecord from "quip-apps-api/dist/root-record";
import { RootEntity } from "./model/root";
import { format, parse, differenceInCalendarDays } from 'date-fns'

function handleCountingCycle(cycle: number) {
  const rootRecord = quip.apps.getRootRecord() as RootEntity;
  rootRecord.set("countingCycle", cycle);
}

const countingCycleCommands: MenuCommand[] = [
  {
    id: "counting-cycle",
    label: quiptext("🕛　"),
    subCommands: ["counting-cycle-header","1h", "3h", "6h", "12h", "24h"],
  },
  {
    id: "counting-cycle-header",
    label: quiptext("Counting Cycle"),
    isHeader:true,
  },
  {
    id: "1h",
    label: quiptext("1h"),
    handler: () => {
      handleCountingCycle(1);
      updateToolbar();
    },
  },
  {
    id: "3h",
    label: quiptext("3h"),
    handler: () => {
      handleCountingCycle(3);
      updateToolbar();
    },
  },
  {
    id: "6h",
    label: quiptext("6h"),
    handler: () => {
      handleCountingCycle(6);
      updateToolbar();
    },
  },
  {
    id: "12h",
    label: quiptext("12h"),
    handler: () => {
      handleCountingCycle(12);
      updateToolbar();
    },
  },
  {
    id: "24h",
    label: quiptext("Every other day"),
    handler: () => {
      handleCountingCycle(24);
      updateToolbar();
    },
  },
];

const infoCommands: MenuCommand[] = [
  {
    id: "help",
    label: quiptext("ヘルプ"),
    subCommands: ["about", "youtube-channel", "contact"],
  },
  {
    id: "about",
    label: quiptext("リゾルバについて"),
    handler: () => {
      quip.apps.openLink("https://www.re-solver.co.jp");
    },
  },
  {
    id: "youtube-channel",
    label: quiptext("Youtubeチャンネル"),
    handler: () => {
      quip.apps.openLink(
        "https://www.youtube.com/channel/UCIBIz9kZp7XhLn77vD5a26g",
      );
    },
  },
  {
    id: "contact",
    label: quiptext("お問い合わせ"),
    handler: () => {
      quip.apps.openLink("https://www.re-solver.co.jp/contact");
    },
  },
];

const getHighlightedCommandIds = () => {
  const rootRecord = quip.apps.getRootRecord() as RootEntity;
  let countingCycle = rootRecord.get("countingCycle");
  let highlightedCommandId = countingCycle + "h";
  const highlightedCommandIds: string[] = [highlightedCommandId];
  return highlightedCommandIds;
};

const getToolbarCommandIds = () => {
  const toolbarCommandIds: string[] = ["counting-cycle","help" ];
  return toolbarCommandIds;
};

export const updateToolbar = () => {
  quip.apps.updateToolbar({
    menuCommands: [...countingCycleCommands, ...infoCommands],
    toolbarCommandIds: getToolbarCommandIds(),
    highlightedCommandIds:getHighlightedCommandIds(),
  });
};