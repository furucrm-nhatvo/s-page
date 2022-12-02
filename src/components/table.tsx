import React from 'react';
import clsx from 'clsx';
import { createStyles, lighten, makeStyles, Theme } from '@material-ui/core/styles';
import {Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Paper} from '@material-ui/core'
import quip from 'quip-apps-api';

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

function getFontSize() {
    return quip.apps.isMobile() ? "10px" : "14px";
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
    <TableHead>
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


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        minWidth: "auto",
          width: "auto",
        maxWidth:'auto',
    },
    paper: {
        width: 'auto',
        minWidth: 'auto',
        maxWidth:'auto',
        marginBottom: theme.spacing(2),
        display:"inline-block"
      },
      container: {
        maxHeight:quip.apps.isMobile() ? "198px":"330px",
        minWidth: "auto",
        width:"auto",
        maxWidth:'auto',
        display:"inlineTable"
    },
    table: {
        minWidth: "auto",
        width:"auto",
        maxWidth:'auto',
        tableLayout: "fixed",
        whiteSpace: "nowrap",
      },
      head: {
          backgroundColor: "#207766",
          color: "#F0F0F0 !important",
          fill: "#F0F0F0 !important",
          accentColor: "#F0F0F0",
        fontSize:getFontSize(),
      },
      user: {
          display: "flex",
        marginLeft: "3px",
  justifyContent: "left",
  alignItems: "center",
    },
      cell: {
          fontSize: getFontSize(),
          width:"auto",
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
  }),
);

export default React.memo((props: any) => {
    const { allViews } = props;
    const rows = [] as any[];
    allViews.map((e: any) => {
        const userId = e.get("userId");
        const userName = e.get("userName");
        let lastViewDatetime = e.get("lastViewDate");
        if (!lastViewDatetime) {
            const datetimes = e.get("date");
            lastViewDatetime = datetimes[datetimes.length - 1];
        }
        const viewsTotal = e.get("date").length;
        const data = createData(userId, userName, viewsTotal, lastViewDatetime);
        const user: quip.apps.User | undefined = quip.apps.getUserById(userId);
        rows.push(data);
    });
    const classes = useStyles();
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

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
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
    return (
        <div className={classes.root}>
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
                                    return (
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={row.userId}
                                        >
                                            <TableCell component="th" id={labelId} scope="row" padding="normal" className={classes.cell} style={{width:nameWidth}} >
                                                <div className={classes.user}>
                                                {user && (
                                                    <quip.apps.ui.ProfilePicture
                                                    user={user}
                                                    size={iconSize}
                                                    round={true}
                                                    />
                                                    )}
                                                    <span style={{ marginLeft: "3px" }}>{row.userName}</span></div>
                                            </TableCell>
                                            <TableCell align="right" className={classes.cell} style={{width:countWidth}}>{row.viewsTotal}</TableCell>
                                            <TableCell align="left" className={classes.cell}>{row.lastViewDatetime}</TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
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
                </TableContainer>
            </Paper>
        </div>
    );
});
