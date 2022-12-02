import React, { useRef, useState, useEffect } from "react";
import { createStyles, lighten, makeStyles, Theme } from '@material-ui/core/styles';
import {
  Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel,
  Paper, IconButton, Switch, TextField
} from '@material-ui/core';
import SearchBar from "material-ui-search-bar";
import { Delete, FilterList } from '@material-ui/icons';
import quip from 'quip-apps-api';
import Authorization from "../Service/Authorization";

interface data {
  name: string;
  id: string;
  isAdmin : boolean;
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        minWidth: "auto",
          width: "auto",
        maxWidth:'auto',
        marginLeft:"4px",
    },
    input: {
      display:"inline-flex",
      justifyContent: "center",
      alignItems: "center",
    },
    switchPrimary: {
      "&.Mui-checked": {
        color: "#207766",
      },
      "&.Mui-checked + .MuiSwitch-track": {
          backgroundColor: "#2077663A",
      },
    },
    container: {
      maxHeight:quip.apps.isMobile() ? "198px":"330px",
      minWidth: "auto",
      width:"auto",
      maxWidth:'auto',
  },
    table: {
        minWidth: "100%",
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
    searchInput: {
      
    },
    adminTable: {
      
    }
  }),
);

export default React.memo((props: any) => {
  const rootRecord = quip.apps.getRootRecord()
  const classes = useStyles();
  const allMembers = quip.apps.getDocumentMembers();
  const adminUserIds = props.adminUserIds;
  const initialRows = props.initialRows as data[];
  const [rows, setRows] = useState<data[]>(initialRows);
  const [searched, setSearched] = useState<string>("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [error, setError] = useState('')
  const [org, setOrg] = useState(rootRecord.get('salesforceUrl'))
  const [isLoading, setLoading] = useState(false)
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const requestSearch = (searchedVal: string) => {
    const filteredRows = initialRows.filter((row) => {
      return row.name.toLowerCase().includes(searchedVal.toLowerCase());
    });
    // rows = filteredRows;
    setRows(filteredRows);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
};

const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
};
  const cancelSearch = () => {
    setSearched("");
    requestSearch(searched);
  };

  let isAdminOnly = props.isAdminOnly;
  const handleChangeisAdminOnly = props.handleChangeisAdminOnly;

  let nameWidth = getTextWidth("User");
  let countWidth = getTextWidth("Total views") + 20;
    
  const iconSize = quip.apps.isMobile() ? 16 : 24;
  const handleChange = (event: any) => {
    const checked = event.target.checked;
    isAdminOnly = checked;
    handleChangeisAdminOnly(isAdminOnly);
  }

  const addAdmin = props.addAdmin;
  const deleteAdmin = props.deleteAdmin;
  const handleAdminChange = (event: any) => {
    const checked = event.target.checked;
    const id = event.target.value;
    if (checked) {
      addAdmin(id);
    }
    else {
      deleteAdmin(id);
    }
  }
  const renderSfButton = ()=>{
    if(org){
      return <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
        <p>Current org: {org}</p>
        <div onClick={logoutSalesforce} className='text-btn' style={{fontWeight:'bold'}}>Logout</div>
      </div>
    }
    return <>
      <div onClick={isLoading?()=>{}:connectToSf} className='btn-search' style={{ width: '200px', height: '40px', fontWeight: 'bold' }}>
        {isLoading?<span className="small-loader"></span>:<p>Connect to Salesforce</p>}
      </div>
      <p style={{color:'red'}}>{error}</p>
    </>
  }
  const connectToSf = async ()=>{
    setError('')
    setLoading(true)
    const res = await Authorization.getRefreshToken()
    if (res) {
      const { salesforce_url, error } = await Authorization.getAccessToken()
      setLoading(false)
      if (error) return setError(error)
      setOrg(salesforce_url)
    } else {
      setLoading(false)
      setError('Cannot connect to Salesforce. Please reload the component and try again')
    }
  }
  const logoutSalesforce=()=>{
    rootRecord.set('refreshToken', '')
    rootRecord.set('accessToken', '')
    rootRecord.set('salesforceUrl', '')
    rootRecord.set('salesforceId', '')
    setOrg('')
  }
    return (
      <div className={classes.root}>
        {renderSfButton()}
        <div className={classes.input}>
          <label>管理者のみ閲覧</label>
          <Switch defaultChecked={isAdminOnly} classes={{
    colorPrimary: classes.switchPrimary}} color="primary" onChange={handleChange}></Switch>
        </div>
        <Paper>
        <SearchBar
          value={searched}
          onChange={(searchVal) => requestSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
          placeholder="User name..."
        />
        <TableContainer className={classes.container}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left" className={classes.head}>User</TableCell>
                <TableCell align="right" className={classes.head}>Admin</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const labelId = `enhanced-table-checkbox-${index}`;
                const user: quip.apps.User | undefined = quip.apps.getUserById(row.id);
                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    key={row.id}
                  >
                    <TableCell component="th" id={labelId} scope="row" padding="normal" className={classes.cell} >
                      <div className={classes.user}>
                        {user && (
                          <quip.apps.ui.ProfilePicture
                            user={user}
                            size={iconSize}
                            round={true}
                          />
                        )}
                        <span style={{ marginLeft: "3px" }}>{row.name}</span></div>
                    </TableCell>
                    <TableCell align="right">
                      <Switch defaultChecked={row.isAdmin} classes={{
                        colorPrimary: classes.switchPrimary
                      }} color="primary" value={row.id} onChange={handleAdminChange}></Switch>
                    </TableCell>
                  </TableRow>);
                  }
              )}
            </TableBody>
            </Table>
            <TablePagination
                    rowsPerPageOptions={[10, 25]}
                    labelRowsPerPage = "1ページごとの表示数"
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
      </Paper>
      </div>
    );
});
