import React, { useContext, useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import { Alert, Avatar, Box, Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { visuallyHidden } from "@mui/utils";
import { useNavigate } from "react-router-dom";
import { DogContext } from "../context/DogContext";
import DogAction from "../Actions/DogAction";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}
interface apiResultObject {
  next: string;
  prev: string;
  resultIds: string[];
  total: number;
}

interface ResultObjectComponentProps {
  apiResultObject: apiResultObject;
}
const isObjectEmpty = (obj: {}) => Object.keys(obj).length === 0;

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Dog;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "name",
    numeric: true,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "breed",
    numeric: true,
    disablePadding: true,
    label: "Breed",
  },
  {
    id: "age",
    numeric: true,
    disablePadding: false,
    label: "Age",
  },
  {
    id: "zip_code",
    numeric: true,
    disablePadding: false,
    label: "Zip_Code",
  },
  {
    id: "favorite",
    numeric: true,
    disablePadding: false,
    label: "Favorite",
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Dog
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Dog) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
      // console.log("sorting breeds");
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell align="center"> Image</TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={
              headCell.id === "breed" && orderBy === headCell.id ? order : false
            }
          >
            {headCell.id === "breed" ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {/* {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null} */}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 && (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} Favorite
        </Typography>
      )}
    </Toolbar>
  );
}

export default function DogTableResult({
  apiResultObject,
}: ResultObjectComponentProps) {
  /**useState hooks */
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Dog>("breed");
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [nextUrl, setNextUrl] = useState<string | null>("");
  const [prevUrl, setPrevUrl] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tablesData, setTablesData] = useState<Dog[]>([]);
  const [tablePaginationCount, setTablePaginationCount] = useState<number>(0);
  const [initialRender, setInitialRender] = useState<boolean>(true);

  /**useContext hooks */
  const {
    setFavoriteDogsId,
    setAiGeneratedActivities,
    setMatchDogData,
    sortingStrategy,
    setSortingStrategy,
    initialPageLoadSort,
    setInitialPageLoadSort,
  } = useContext(DogContext);

  /**router dom hooks */
  const navigate = useNavigate();
  // console.log(tablesData);
  useEffect(() => {
    const fetchDogData = async () => {
      console.log("intial render is being called" + initialRender);
      if (initialRender && isObjectEmpty(apiResultObject)) {
        try {
          const allDogsResponse = await DogAction.fetchAllDogs(
            initialPageLoadSort
          );
          // console.log(allDogsResponse);
          setTablePaginationCount(allDogsResponse.total);
          setNextUrl(allDogsResponse.next);

          const dogDetailsResponse = await DogAction.fetchDogs(
            allDogsResponse.resultIds
          );
          setTablesData(dogDetailsResponse);
          // console.log(dogDetailsResponse);
        } catch (error) {
          console.error("Error fetching dog data:", error);
        }
      }
      // debugger;
      if (apiResultObject.resultIds.length > 0) {
        setPage(0);
        setInitialRender(false);
        const dogDetailsResponse = await DogAction.fetchDogs(
          apiResultObject.resultIds
        );
        console.log("is called");

        setTablesData(dogDetailsResponse);
        setTablePaginationCount(apiResultObject.total);
        setNextUrl(apiResultObject.next);
      }
    };

    fetchDogData();
  }, [apiResultObject, initialPageLoadSort]);

  const fetchNextData = async (url: string) => {
    console.log("loading next data");
    try {
      setIsLoading(true);
      const nextPageResponse = await DogAction.fetchNextPageData(url);

      const newDogsData = await DogAction.fetchDogs(nextPageResponse.resultIds);

      setTablesData(newDogsData);

      setNextUrl(nextPageResponse.next);
      setPrevUrl(nextPageResponse.prev);

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Dog
  ) => {
    if (property !== "breed") return;

    if (initialRender) {
      initialPageLoadSort === "asc"
        ? setInitialPageLoadSort("desc")
        : setInitialPageLoadSort("asc");
      console.log("initial page sort requested");
      return;
    }
    if (sortingStrategy === "asc") {
      setSortingStrategy("desc");
    } else {
      setSortingStrategy("asc");
    }

    console.log("sort breeds on handle request");
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = tablesData.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    setInitialRender(false);

    if (newPage > page && nextUrl) {
      fetchNextData(nextUrl);
    } else if (newPage < page && prevUrl) {
      fetchNextData(prevUrl);
      console.log(prevUrl + "calling prev end point");
    } else {
      console.log("Check the newPage ore event");
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const visibleRows = React.useMemo(
    () => stableSort(tablesData, getComparator(order, orderBy)),
    [order, orderBy, page, rowsPerPage, tablesData]
  );

  // console.log(selected);

  const matchMyFavDogs = () => {
    setFavoriteDogsId(selected);
    setMatchDogData([]);
    setAiGeneratedActivities({});
    navigate("/favoritedogs");
  };

  return (
    <>
      <Box sx={{ width: "100%", mt: 4 }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={tablesData.length}
              />
              <TableBody>
                {visibleRows.map((dog, index) => {
                  const isItemSelected = isSelected(dog.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, dog.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={dog.id}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Avatar
                          alt="Man's best friend"
                          src={String(dog.img)}
                          sx={{
                            height: { xs: 80, md: 120 },
                            width: { xs: 80, md: 120 },
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">{dog.name}</TableCell>
                      <TableCell align="right">{dog.breed}</TableCell>

                      <TableCell align="right">{dog.age}</TableCell>
                      <TableCell align="right">{dog.zip_code}</TableCell>
                      <TableCell align="right">
                        <Checkbox
                          color="success"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                          icon={<FavoriteBorderIcon />}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[20]}
            component="div"
            count={tablePaginationCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          {isLoading && <Alert severity="info">Loading Next Data</Alert>}
          {error && <Alert severity="info">Error Loading Next Data</Alert>}
        </Paper>
        <Button
          variant="contained"
          disabled={selected ? false : true}
          onClick={() => matchMyFavDogs()}
        >
          Match My Fav Dogs
        </Button>
      </Box>
    </>
  );
}
