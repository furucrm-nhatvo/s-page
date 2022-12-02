import React, {  useState, useEffect } from "react";
import quip from "quip-apps-api";
import { IconButton,  } from "@material-ui/core";
import { Visibility,PeopleAlt,Close, ChevronLeft, ChevronRight } from '@material-ui/icons';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "chartjs-adapter-date-fns";
import { format, parse, addDays,addWeeks, addMonths,addQuarters,addYears, subDays } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { ja,de } from 'date-fns/locale';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TableSortLabel, Paper
} from '@material-ui/core';
import { Chart as ChartJS, registerables,TimeScale } from "chart.js";
ChartJS.register(...registerables, TimeScale);
import { Line, Bar } from 'react-chartjs-2';

interface Data {
  userId: string;
  userName: string;
  viewsTotal: number;
  lastViewDatetime: string;
}

function createData(
  userId: string,
  userName: string,
  viewsTotal: number,
  lastViewDatetime: string,
  ): Data {
  return {userId, userName,  viewsTotal ,lastViewDatetime};
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'asc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const sortArrayByDate = (array: any[]) => {
  const sortArray = [...array];
  sortArray.sort((a: any, b: any) => {
    const date1 = parse(a.date, "yyyy/MM/dd HH:mm:ss", new Date());
    const date2 = parse(b.date, "yyyy/MM/dd HH:mm:ss", new Date());
    return date1 < date2 ? 1 : -1;
  });
  // sortArray.reverse();
  return [...sortArray];
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'userName', numeric: false, disablePadding: false, label: 'User' },
  { id: 'viewsTotal', numeric: true, disablePadding: false, label: 'Total views' },
  { id: 'lastViewDatetime', numeric: false, disablePadding: false, label: 'Last viewed' },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
const { classes, order, orderBy,onRequestSort } = props;
const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
  onRequestSort(event, property);
};

return (
  <TableHead style={{zIndex:0}}>
    <TableRow>
      {headCells.map((headCell) => (
        <TableCell
              key={headCell.id}
              // align="left"
          align={headCell.numeric ? 'right' : 'left'}
          padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
              className={classes.head}
        >
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={orderBy === headCell.id ? order : 'asc'}
            onClick={createSortHandler(headCell.id)}
            className={classes.head}
          >
            {headCell.label}
            {orderBy === headCell.id ? (
              <span className={classes.visuallyHidden}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </span>
            ) : null}
          </TableSortLabel>
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);
}

function getFontSize() {
  return quip.apps.isMobile() ? "10px" : "14px";
}

function getTextWidth(text : string) {
  const span = document.createElement('span');

  span.style.position =  'absolute';
  span.style.top = '-1000px';
  span.style.left =  '-1000px';

  span.style.whiteSpace =  'nowrap';
  span.style.fontSize = getFontSize();
  
  span.innerHTML = text;

  document.body.appendChild(span);

  const spanWidth = span.clientWidth;

  if (span.parentElement) {
      span.parentElement.removeChild(span);
  }
  return spanWidth;
}
const useStyles = makeStyles((theme: Theme)=>createStyles({
  chartContainer: {
      minWidth: "auto",
    maxWidth: 'auto',
    overflow: "scroll",
    height: "100%",
    paddingBottom: "50px",
  },
  iconButton: {
    color: "#207766",
    margin: "2px 2px 2px 5px",
    backgroundColor:"#A4D8CD3D",
    "&:hover": {
      background: "#A4D8CD5D"
    },
  },
  datePickers: {
    margin: "5px 0px",
    display:"flex",
    padding:"0"
  },
  datePicker: {
    margin: "0px 5px 0px 0px",
    border:"1px solid rgba()"
  },
  buttonGroup: {
    height: "fit-content",
    margin: "5px 0px",
  },
  toggleButton: {
    height: "30px",
    color:"#207766",
    "&:active":{
      backgroundColor: "#207766",
      color:"#F0F0F0"
    },
    "&:selected":{
      backgroundColor: "#207766",
      color:"#F0F0F0"
    },
    "&.Mui-selected, &.Mui-selected:hover": {
      backgroundColor: "#207766",
      color:"#F0F0F0"
    }
  },
  MuiSelected: {
    backgroundColor: "#207766 !important",
    color:"#F0F0F0"
  },
  toggleButtonSelected:{
    backgroundColor: "#207766",
    color:"#F0F0F0"},
  chartWrap: {
  padding: "2%",
  width: "96%",
  display: "inline-block",
  },
  paper: {
      minWidth: 'auto',
      maxWidth:'auto',
      marginBottom: theme.spacing(2),
    },
    container: {
      maxHeight:quip.apps.isMobile() ? "198px":"450px",
      minWidth: "auto",
      maxWidth: 'auto',
      display:"inlineTable"
  },
  tables: {
    display:"inline-block"
  },
  inline: {
    display:"contents"
  },
  table: {
      minWidth: "auto",
      maxWidth:'auto',
      tableLayout: "fixed",
      whiteSpace: "nowrap",
    },
    head: {
        backgroundColor: "#207766",
        color: "#F0F0F0 !important",
        fill: "#F0F0F0 !important",
        accentColor: "#F0F0F0",
      fontSize: getFontSize(),
      zIndex:0
    },
    user: {
        display: "flex",
      marginLeft: "3px",
justifyContent: "left",
alignItems: "center",
  },
    cell: {
        fontSize: getFontSize(),
        minWidth: "auto",
  },
  pagenater: {
      display:"contents"
    },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    color: "#F0F0F0 !important",
    fill: "#F0F0F0 !important",
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  selectScorp: {
    display:"flex"
  },
  detailTable: {
    marginRight:"20px"
  },
  totalTable: {
    display: "flex"
  }
}));

const initLineGraphData = (allViews: any) => {
  const datasets = [] as any[];
  let startDatetime = new Date();
  let endDatetime = new Date(-8640000000000000);
  allViews.map((userView: any) => {
    const datetimes = userView.get("date");
    const sortedDatetimes = datetimes.slice();
    sortedDatetimes.sort();
    const thisStartDatetime =parse(sortedDatetimes[0], "yyyy/MM/dd HH:mm:ss", new Date());
    const thisEndDatetime = parse(sortedDatetimes[sortedDatetimes.length - 1], "yyyy/MM/dd HH:mm:ss", new Date());
    if (startDatetime > thisStartDatetime) {
      startDatetime = thisStartDatetime;
    }
    if (endDatetime < thisEndDatetime) {
      endDatetime = thisEndDatetime;
    }

    const userId = userView.get("userId");
    sortedDatetimes.map((datetime: any) => {
      const [date, time] = datetime.split(" ");
      const data = datasets.find((dataset) => {
        return dataset["x"] == date;
      });
      if (data) {
        data["data"].push({ time: time, userId: userId });
        data["y"] += 1;
      }
      else {
        datasets.push({ x: date, y:1, data: [{ time: time, userId: userId }] });
      }
    });
  })
  datasets.sort((data1, data2) => {
    return data1["x"] > data2["x"] ? 1 : -1;
  })
  return datasets;
};

export default React.memo((props: any) => {
  const { allViews, toggleFullScreen} = props;
  const [viewsTotal, setAllViewsTotal] = useState<number>(0);
  const [graphUnit, setGraphUnit] = useState<string>("day");
  const classes = useStyles();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date(-8640000000000000));
  const [minDate, setMinDate] = useState<string | null>("2022/01/01");
  const [maxDate, setMaxDate] = useState<string | null>(format(new Date(), "yyyy/MM/dd"));
  const defaultDetailTable = [] as any[];
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [detailTablePage, setDetailTablePage] = useState<number>(0);
  const rows = [] as any[];
  registerLocale("ja", ja);
  const userIds = [] as any[];
  allViews.map((e: any) => {
      const userId = e.get("userId");
      const userName = e.get("userName");
      let lastViewDatetime = e.get("lastViewDate");
      if (!lastViewDatetime) {
          const datetimes = e.get("date");
          lastViewDatetime = datetimes[datetimes.length - 1];
      }
    const viewsTotal = e.get("date").length;
    const date = e.get("date");
    const data = createData(userId, userName, viewsTotal, lastViewDatetime);
    date.map((m: any) => {
      defaultDetailTable.push({
        date: m,
        userName: userName,
        userId: userId,
        countView: "",
        totalViews: viewsTotal
      });
    });
    userIds.push(userId);
      rows.push(data);
  });
  const sortedDetailTable = sortArrayByDate(defaultDetailTable);
  const uniqueUserIds = Array.from(new Set(userIds));
  uniqueUserIds.map((id) => {
    const filteredRows = sortedDetailTable.filter(row => row.userId === id);
    sortedDetailTable.filter(row => row.userId == id).map((row, index) => {
      row.viewsNum = filteredRows.length - index;
    });
  });
  const [detailTable, setDetailTable] = useState(sortedDetailTable);
  const [allLineChartData, setAllLineChartData] = useState([] as any[]);
  const defaultLineData = [...initLineGraphData(allViews)];
  const [lineChartData, setLineChartData] = useState({
    datasets: [
      {
        label: "",
        data: defaultLineData,
        borderColor: "#207766",
      }
    ]
  });
  const defaultBarDatasets = [...Array(24)].map((m, index) => {
    return { label: index + "時", data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: "#207766" }
  });
  const [barChartData, setBarChartData] = useState({
    labels: ["日", "月", "火", "水", "木", "金", "土"],
    datasets: defaultBarDatasets
  });
  const getRefDate = (unit: string, date: Date) => {
    switch (unit) {
      case "day":
        return format(date, "yyyy/MM/dd");
      case "week":
        const weekNum = date.getDay();
        const sunDate = subDays(date, weekNum);
        return format(sunDate, "yyyy/MM/dd");
      case "month":
        const firstMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
        return format(firstMonthDate, "yyyy/MM/dd");
      case "quarter":
        const firstQuarterDate = new Date(date.getFullYear(), Math.floor(date.getMonth() / 3)*3 , 1);
        return format(firstQuarterDate, "yyyy/MM/dd");
      case "year":
        const firstYearDate = new Date(date.getFullYear(), 0, 1);
        return format(firstYearDate, "yyyy/MM/dd");
      default:
        return format(date, "yyyy/MM/dd");
    }
  }
  const addDateByUnit = (unit:string, date:Date) => {
    switch (unit) {
      case "day":
        return addDays(date, 1);
      case "week":
        const weekNum = date.getDay();
        const sunDate = subDays(date, weekNum);
        return addWeeks(sunDate,1);
      case "month":
        const firstMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
        return addMonths(firstMonthDate, 1);
      case "quarter":
        const firstQuarterDate = new Date(date.getFullYear(), Math.floor(date.getMonth() / 3)*3, 1);
        return addQuarters(firstQuarterDate, 1);
      case "year":
        const firstYearDate = new Date(date.getFullYear(), 0, 1);
        return addYears(firstYearDate, 1);
      default:
        return addDays(date, 1);
    }
  }

  useEffect(() => {
    let startDatetime = startDate;
    let endDatetime = endDate;
    if (selectedUserId === "") {
      const newLineChartData = [] as any[];
      allViews.map((views: any) => {
        const dates = views.get("date");
        const userId = views.get("userId");
        dates.map((m: any) => {
          const datetime = parse(m, "yyyy/MM/dd HH:mm:ss", new Date());
          const formattedDate = format(datetime, "yyyy/MM/dd HH:mm:ss");
          const refDate = getRefDate(graphUnit, datetime);
          const [date, time] = formattedDate.split(" ");
          const data = newLineChartData.find((dataset) => {
            return dataset["x"] == refDate;
          });
          if (data) {
            data["data"].push({ time: time, userId: userId });
            data["y"] += 1;
          }
          else {
            newLineChartData.push({x: refDate, y: 1, data:[{ time: time, userId: userId }]});
          }
        });
      });
      const sortedLineChartData = newLineChartData.sort((data1: any, data2: any) => {
        return data1["x"] < data2["x"] ? 1 : -1;
      }) ;

    const thisStartDatetime = parse(sortedLineChartData[0], "yyyy/MM/dd HH:mm:ss", new Date());
    const thisEndDatetime = parse(sortedLineChartData[sortedLineChartData.length - 1], "yyyy/MM/dd HH:mm:ss", new Date());

    if (startDatetime) {
      if (startDatetime > thisStartDatetime) {
        startDatetime = thisStartDatetime;
      }
    }
    if (endDatetime) {
      if (endDatetime < thisEndDatetime) {
        endDatetime = thisEndDatetime;
      }
    }
      if (startDatetime && endDatetime) {
        for (let thisDate = startDatetime; thisDate < endDatetime; thisDate =  addDateByUnit(graphUnit,thisDate)) {
          
        const formatedThisDate = format(thisDate, "yyyy/MM/dd");
        const data = sortedLineChartData.find((dataset) => {
          return dataset["x"] == formatedThisDate;
        });
        if (!data) {
          sortedLineChartData.push({ x: formatedThisDate, y: 0});
        }
        }
      }
      const chartLineData = sortedLineChartData.sort((data1: any, data2: any) => {
        return data1["x"] < data2["x"] ? 1 : -1;
      }) ;
      const chartData = {
        datasets: [
          {
            label: "",
            data: chartLineData,
            borderColor: "#207766",
          }
        ]
      };
      setMinDate(chartLineData[0]["x"]);
      setMaxDate(chartLineData[chartLineData.length-1]["x"]);
      setLineChartData(chartData);
    }
    else {
     const newLineChartData = [] as any[];
      const userViews = allViews.find((views: any) => {
        return views.get("userId") === selectedUserId;
      });
      const dates = userViews.get("date");
      dates.map((m: any) => {
        const datetime = parse(m, "yyyy/MM/dd HH:mm:ss", new Date());
        const formattedDate = format(datetime, "yyyy/MM/dd HH:mm:ss");
        const refDate = getRefDate(graphUnit, datetime);
        const [date, time] = formattedDate.split(" ");
        const data = newLineChartData.find((dataset) => {
          return dataset["x"] == refDate;
        });
        if (data) {
          data["data"].push({ time: time, userId: selectedUserId });
          data["y"] += 1;
        }
        else {
          newLineChartData.push({x: refDate, y: 1, data:[{ time: time, userId: selectedUserId }]});
        }
      });
      
      const sortedLineChartData = newLineChartData.sort((data1: any, data2: any) => {
        return data1["x"] < data2["x"] ? 1 : -1;
      }) ;

    const thisStartDatetime = parse(sortedLineChartData[0], "yyyy/MM/dd HH:mm:ss", new Date());
    const thisEndDatetime = parse(sortedLineChartData[sortedLineChartData.length - 1], "yyyy/MM/dd HH:mm:ss", new Date());

    if (startDatetime) {
      if (startDatetime > thisStartDatetime) {
        startDatetime = thisStartDatetime;
      }
    }
    if (endDatetime) {
      if (endDatetime < thisEndDatetime) {
        endDatetime = thisEndDatetime;
      }
    }
      if (startDatetime && endDatetime) {
        for (let thisDate = startDatetime; thisDate < endDatetime;thisDate =  addDateByUnit(graphUnit,thisDate)) {
            
          const formatedThisDate = format(thisDate, "yyyy/MM/dd");
          const data = sortedLineChartData.find((dataset) => {
            return dataset["x"] == formatedThisDate;
          });
          if (!data) {
            sortedLineChartData.push({ x: formatedThisDate, y: 0});
          }
        }
      }
      const chartLineData = sortedLineChartData.sort((data1: any, data2: any) => {
        return data1["x"] < data2["x"] ? 1 : -1;
      }) ;
      const chartData = {
        datasets: [
          {
            label: "",
            data: chartLineData,
            borderColor: "#207766",
          }
        ]
      };
      setMinDate(chartLineData[0]["x"]);
      setMaxDate(chartLineData[chartLineData.length-1]["x"]);
      setLineChartData(chartData);
    }
    // console.log("lc",lineChartData);
  }, [allViews, graphUnit, selectedUserId])

  useEffect(() => {
    if (selectedUserId === "") {
      const newBarDatasets = [...defaultBarDatasets];
      allViews.map((views: any) => {
        const dates = views.get("date");
        dates.map((m: any) => {
          const datetime = parse(m, "yyyy/MM/dd HH:mm:ss", new Date());
          
          const weekDay = datetime.getDay();
          const hour = datetime.getHours();
          newBarDatasets[hour]["data"][weekDay] += 1;
        });
      });
      const barData ={
        labels:["日","月", "火","水", "木", "金", "土"],
        datasets: newBarDatasets
      }
      setBarChartData(barData);

      const thisMinDate = minDate ? parse(minDate, "yyyy/MM/dd", new Date()) : "1900/1/1";
      const thisMaxDate = maxDate ? addDays(parse(maxDate, "yyyy/MM/dd", new Date()) ,1): new Date();
      const newDetailTable = [] as any[];
      [...defaultDetailTable].map((detailRow) => {
        const date = parse(detailRow.date, "yyyy/MM/dd HH:mm:ss", new Date());
        if (thisMinDate <= date && date <= thisMaxDate) {
          newDetailTable.push(detailRow);
        }
      });
      const sortedNewDetailTable = newDetailTable.length > 0 ? sortArrayByDate(newDetailTable) : [];
      const uniqueUserIds = Array.from(new Set(userIds));
      uniqueUserIds.map((id) => {
        const filteredRows = sortedNewDetailTable.filter(row => row.userId === id);
        sortedNewDetailTable.filter(row => row.userId == id).map((row, index) => {
          row.viewsNum = filteredRows.length - index;
          row.totalViews = filteredRows.length;
        });
      });
      setDetailTablePage(0);
      setDetailTable(sortedNewDetailTable);
    }
    else {
      const thisMinDate = minDate ? parse(minDate, "yyyy/MM/dd", new Date()) : "1900/1/1";
      const thisMaxDate = maxDate ? addDays(parse(maxDate, "yyyy/MM/dd", new Date()) ,1): new Date();
      const newBarDatasets = [...defaultBarDatasets];
      const userViews = allViews.find((views: any) => {
        return views.get("userId") === selectedUserId;
      });
      const dates = userViews.get("date");
      dates.map((m: any) => {
        const datetime = parse(m, "yyyy/MM/dd HH:mm:ss", new Date());
        if (thisMinDate <= datetime && datetime <= thisMaxDate) {
          const weekDay = datetime.getDay();
          const hour = datetime.getHours();
          newBarDatasets[hour]["data"][weekDay] += 1;
        }
      });
      const barData ={
        labels:["日","月", "火","水", "木", "金", "土"],
        datasets: newBarDatasets
      }
      setBarChartData(barData);
      const newDetailTable = [] as any[];
      [...defaultDetailTable].map((detailRow) => {
        if (selectedUserId === detailRow.userId) {
          const date = parse(detailRow.date, "yyyy/MM/dd HH:mm:ss", new Date());
          if (thisMinDate <= date && date <= thisMaxDate) {
            newDetailTable.push(detailRow);
          }
        }
      });
      const sortedNewDetailTable = newDetailTable.length > 0 ? sortArrayByDate(newDetailTable) : [];
      sortedNewDetailTable.map((row, index) => {
        row.viewsNum = sortedNewDetailTable.length - index;
        row.totalViews = sortedNewDetailTable.length;
      });
      setDetailTablePage(0);
      setDetailTable(sortedNewDetailTable);
    }
  }, [allViews, minDate, maxDate, selectedUserId, graphUnit]);

  useEffect(() => {
        const viewsTotal = allViews.map((e: any) => e.get("date")).reduce((count: number, date: string[]) => count + date.length, 0);
        setAllViewsTotal(viewsTotal);
  }, [allViews]);
  useEffect(() => {
    const dataList = [] as any[];
    let startDatetime = startDate;
    let endDatetime = endDate;
    allViews.map((userView: any) => {
      const datetimes = userView.get("date");
      const sortedDatetimes = datetimes.slice();
      sortedDatetimes.sort();
      const thisStartDatetime = parse(sortedDatetimes[0], "yyyy/MM/dd HH:mm:ss", new Date());
      const thisEndDatetime = parse(sortedDatetimes[sortedDatetimes.length - 1], "yyyy/MM/dd HH:mm:ss", new Date());

      if (startDatetime) {
        if (startDatetime > thisStartDatetime) {
          startDatetime = thisStartDatetime;
        }
      }
      if (endDatetime) {
        if (endDatetime < thisEndDatetime) {
          endDatetime = thisEndDatetime;
        }
      }
      const userId = userView.get("userId");
    });
    if (startDatetime && endDatetime) {
      setMinDate(format(startDatetime, "yyyy/MM/dd"));
      setMaxDate(format(endDatetime, "yyyy/MM/dd"));
    }
    setStartDate(startDatetime);
    setEndDate(endDatetime);
    if (startDatetime) {
      setMinDate(format(startDatetime, "yyyy/MM/dd"));
    }
    if (endDatetime) {
      setMaxDate(format(endDatetime, "yyyy/MM/dd"));
    }
    // setLineChartData(chartData);
  }, [allViews]);

  let nameWidth = getTextWidth("User");
  let countWidth = getTextWidth("Total views") + 20;
  allViews.map((e: any) => {
      let nWidth = getTextWidth(e.get("userName"));
      if (nameWidth < nWidth) {
          nameWidth = nWidth;
      }
      const dateLength = e.get("date").length;
      let cWidth = getTextWidth(dateLength.toString());
      if (countWidth < cWidth) {
          countWidth = cWidth;
      }
  });
  const iconSize = quip.apps.isMobile() ? 16 : 24;
  const [lineOptions, setLineOptions] = useState({
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '閲覧数推移'
      },
      legend: { display: false },
    },
    scales: {
      y: {
        title: { display: true, text: "閲覧数" },
        min: 0,
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: {
          display: true,
          text: "閲覧日"
        },offsetAfterAutoskip:true,
        type: "time",
        date: { locale: ja },
        distribution: "linear",
        min: minDate,
        max:maxDate,
        time: {
          parser: "yyyy/MM/dd",
          unit: graphUnit,
          displayFormats: {
            year: "yyyy",
            quarter:"yyyy/MM",
            month: "yyyy/MM",
            week: 'yyyy/MM/dd',
            day: "yyyy/MM/dd"
          }
        },
      }
    }
  });

  useEffect(() => {
    const newOption = {
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '閲覧数推移'
        },
        legend: { display: false },
      },
      scales: {
        y: {
          title: { display: true, text: "閲覧数" },
          min: 0,
          ticks: {
            stepSize: 1
          }
        },
        x: {
          title: {
            display: true,
            text: "閲覧日"
          }, offsetAfterAutoskip: true,
          type: "time",
          date: { locale: ja },
          distribution: "linear",
          min: minDate,
          max: maxDate,
          time: {
            parser: "yyyy/MM/dd",
            unit: graphUnit,
            displayFormats: {
              year: "yyyy",
              quarter: "yyyy/MM",
              month: "yyyy/MM",
              week: 'yyyy/MM/dd',
              day: "yyyy/MM/dd"
            }
          },
        }
      }
    };
    setLineOptions(newOption);
  }, [graphUnit, minDate, maxDate]);

  const [barOptions, setBarOptions] = useState({
    responsive: true,
    plugins:{
      legend: {
        display: false
      },
      
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1
        }
      }
    },
    type: "bar"
  });

  const changeStartDate = (newDate: Date | null): void => {
    setStartDate(newDate);
    if (newDate) {
      const newMinDate = format(newDate, "yyyy/MM/dd");
      setMinDate(newMinDate);
    }
  };
  const changeEndDate = (newDate: Date | null): void => {
    setEndDate(newDate);
    if (newDate) {
      const newMaxDate = format(newDate, "yyyy/MM/dd");
      setMaxDate(newMaxDate);
    }
  };

  // 期間単位変更時に折れ線グラフの変更も行う
  const handleDateRangeToggle = (event: React.MouseEvent<HTMLElement>,
    newDateRange: string | null) => {
    if (newDateRange != null) {
      setGraphUnit(newDateRange);
    }
  };
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('viewsTotal');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const closeFullScreen = () => {
    toggleFullScreen(false);
  }

  const subtractDetailTablePage = () => {
    if (detailTablePage > 0) {
      setDetailTablePage(detailTablePage - 1);
      // console.log("subtract", detailTablePage);
    }
  }

  const addDetailTablePage = () => {
    if (detailTable.length/10 >detailTablePage+1) {
      setDetailTablePage(detailTablePage + 1);
      // console.log("add", detailTablePage);
    }
  }

  const handleCellClick = (event: any) => {
    const userId = event.target.dataset.value;
    if (selectedUserId === userId) {
      setSelectedUserId("");
      // const chartData = {
      //   datasets: [
      //     {
      //       label: "",
      //       data: allLineChartData,
      //       borderColor: "#207766",
      //     }
      //   ]
      // };

      // setLineChartData(chartData);
    }
    else {
      // const userData = [...defaultLineData];
      // userData.map((data) => {
      //   data.data = data.data.filter((item: any) => {
      //     return item.userId === userId;
      //   });
      //   data.y = data.data.length;
      // });
      // if (startDate && endDate) {
      //   for (let thisDate = startDate; thisDate < endDate; thisDate = addDays(thisDate, 1)){
      //     const formatedThisDate = format(thisDate, "yyyy/MM/dd");
      //     const data = userData.find((dataset) => {
      //       return dataset["x"] == formatedThisDate;
      //     });
      //     if (!data) {
      //       userData.push({ x: formatedThisDate, y: 0});
      //     }
      //   }
      // }

      // userData.sort((data1, data2) => {
      // return data1["x"] > data2["x"] ? 1 : -1;
      // });
      // const lineData = {
      //   datasets: [
      //     {
      //       label: "",
      //       data: userData,
      //       borderColor: "#207766",
      //     }
      //   ]
      // };

      // setLineChartData(lineData);
      setSelectedUserId(userId);
    }
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
  };

    return (
      <>
        <div className={classes.chartContainer}>

        <div className="tracker" style={{paddingLeft:"10px", marginRight:"auto", display:"flex"}}>
          <div className={classes.inline}>
              <Visibility style={{
                color: "#207766",
                margin: "8px",
              }} />
              <span style={{
                margin: "4px"
              }}>
                {viewsTotal}
              </span>
          </div>
      
          <div className={classes.inline} style={{marginLeft:"4px"}}>
              <PeopleAlt style={{
                color: "#207766",
                margin: "8px",
              }}/>
              <span style={{
                margin: "4px"
              }}>
                {allViews.length}
              </span>
          </div>
          <div style={{ marginLeft: "auto",marginRight: "5px",}}>
            <IconButton onClick={closeFullScreen}>
              <Close/>
            </IconButton>
          </div>
          </div>
          <div style={{height:"4px", backgroundColor:"#207766",marginBottom:"5px"}}></div>
        <div  style={{ marginLeft: "auto", marginRight: "auto", padding:"0px 10px" }}>
          <div className={classes.selectScorp}>
              <div className={classes.datePickers}>
                <div>
                  <label>Start Date</label>
                  <DatePicker
                    className={classes.datePicker}
                    dateFormat="yyyy/MM/dd"
                    locale='ja'
                    selected={startDate}
                    onChange={(selectedDate) => {changeStartDate(selectedDate||null)}}
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <DatePicker
                    className={classes.datePicker}
                    dateFormat="yyyy/MM/dd"
                    locale='ja'
                    selected={endDate}
                    onChange={(selectedDate) => {changeEndDate(selectedDate||null)}}
                  />
                </div>
              </div>
            <ToggleButtonGroup value={graphUnit} 
              onChange={handleDateRangeToggle}
              exclusive
            className={classes.buttonGroup}>
              <ToggleButton className={classes.toggleButton} value="year" aria-label="year">
                year
              </ToggleButton>
              <ToggleButton className={classes.toggleButton} value="quarter" aria-label="quarter">
                quarter
              </ToggleButton>
              <ToggleButton className={classes.toggleButton} value="month" aria-label="month">
                month
              </ToggleButton>
              <ToggleButton className={classes.toggleButton} value="week" aria-label="week">
                week
              </ToggleButton>
              <ToggleButton className={classes.toggleButton} value="day" aria-label="day">
                day
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className={classes.chartWrap}>
            <Line
              data={lineChartData}
              options={lineOptions}
              id="chart-line"
              redraw={true}
          />
            </div>
            {
              selectedUserId && (
                <div style={{ marginBottom: "15px", display:"flex", justifyContent:"center"}}>
                <quip.apps.ui.ProfilePicture
                                                    user={quip.apps.getUserById(selectedUserId)}
                                                    size={iconSize}
                                                    round={true}
                                                    />
                  <div style={{marginLeft:"3px"}}>{quip.apps.getUserById(selectedUserId).getName()}</div>
                </div>
                        )}
            <div className={classes.tables}>
              <div className={classes.totalTable}>

              <div style={{ marginBottom: "15px", width:"50%"}}>
          <Paper className={classes.paper}>
                <TableContainer className={classes.container}>
                    <Table
                        stickyHeader
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size="small"
                        aria-label="enhanced table"
                    >
                        <EnhancedTableHead
                            classes={classes}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {stableSort(rows, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                  const user: quip.apps.User | undefined = quip.apps.getUserById(row.userId);
                                  const userDetailTable = detailTable.filter(tableRow => tableRow.userId === row.userId);
                                  const totalViews = userDetailTable.length >0? userDetailTable[0].totalViews : 0;
                                  const lastViewDatetime = userDetailTable.length >0? userDetailTable[0].date :"---";
                                    return (
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={row.userId} data-value={row.userId} onClick={handleCellClick}
                                        >
                                            <TableCell component="th" id={labelId} scope="row" data-value={row.userId} padding="normal" className={classes.cell} style={{width:nameWidth}} >
                                                <div className={classes.user} data-value={row.userId} >
                                                {user && (
                                                    <quip.apps.ui.ProfilePicture
                                                    user={user}
                                                    size={iconSize}
                                                    round={true}
                                                    />
                                                    )}
                                                    <span style={{ paddingLeft: "3px",width:"100%" , margin:"0px"}} data-value={row.userId} >{row.userName}</span></div>
                                            </TableCell>
                                            <TableCell align="right" className={classes.cell} style={{width:countWidth}}  data-value={row.userId}>{totalViews}</TableCell>
                                            <TableCell align="left" className={classes.cell}  data-value={row.userId}>{lastViewDatetime}</TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                <TablePagination
                    rowsPerPageOptions={[10, 25]}
                    labelRowsPerPage = "1ページごとの表示数"
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    className={classes.pagenater}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                    </Table>
                </TableContainer>
                  </Paper>
                  </div>
                <div style={{ margin: "15px", width:"50%",maxHeight:"400px"}}>
                  <Bar
                    data={barChartData}
                      options={barOptions}
                      style={{maxHeight:"240px"}}
                  />
                </div>
              </div>
              <div className={classes.detailTable}>
          <Paper className={classes.paper}>
                  <table style={{width:"100%"}}>
                    <tr style={{ backgroundColor: "#207766", color:"white", height:"39px", }}>
                      <th style={{padding: "6px 24px 6px 16px"}}>
                        User
                      </th>
                      <th>
                        View Date
                      </th>
                      <th>
                        View Times
                      </th>
                    </tr>
                    {detailTable && detailTable.slice(detailTablePage*10, detailTablePage * 10 + 10).map((row, index) => {
                      return (
                        <tr style={{borderBottom:"1px solid rgba(224, 224, 224, 1)",height:"39px",}}>
                          <td style={{padding: "6px 24px 6px 16px"}}>
                            {row.userName}
                          </td>
                          <td>
                            {row.date}
                          </td>
                          <td>
                            {row.viewsNum} / {row.totalViews}
                          </td>
                        </tr>);
                    })}
                  </table>
                  <div style={{ display: "flex", alignItems:"center" }}>
                    <div style={{ marginLeft: "30px" }}> {detailTablePage * 10 + 1}-{(detailTablePage+1) * 10 < detailTable.length ? (detailTablePage+1) * 10 : detailTable.length} of {detailTable.length}</div>
                    <IconButton onClick={subtractDetailTablePage}>
                      <ChevronLeft/>
                    </IconButton>
                    <IconButton onClick={addDetailTablePage}>
                      <ChevronRight/>
                    </IconButton>
                  </div>
              </Paper>
              </div>
          </div>
        </div>
      </div>
        </>
    );
});