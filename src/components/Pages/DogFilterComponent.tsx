import { TextField, Button, Box, Grid, Typography, Paper } from "@mui/material";
import { useFormik } from "formik";
import SelectBreedComponent from "../MultiSelectChipComponent";
import { useFetchBreeds } from "../fetchData/useFetchBreeds";
import dogAction from "../../Actions/DogAction";

function DogFilterComponent({}) {
  const [breeds] = useFetchBreeds();

  // console.log(breeds);

  const formik = useFormik({
    initialValues: {
      breeds: [],
      zipCodes: "",
      ageMin: "",
      ageMax: "",
    },

    onSubmit: (values, { resetForm }) => {
      console.log(values);
      dogAction
        .searchDogs(
          values.breeds.join("&"),
          values.ageMin,
          values.ageMax,
          values.zipCodes.split(",").join("&")
        )
        .then((res) => {
          console.log(res);
          setDogDataArray(res);
        })
        .catch((err) => {
          console.log(err);
        });

      resetForm();
    },
  });

  return (
    <Paper sx={{ width: "100%", mb: 2 }}>
      <Box sx={{ mt: 1 }}>
        <Typography color="orange" align="center" variant="h4">
          Search By ...
        </Typography>
      </Box>
      <Box
        component="form"
        noValidate
        onSubmit={formik.handleSubmit}
        sx={{ mt: 3, padding: 2 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              color="warning"
              name="ageMin"
              label="Min-Age"
              id="ageMin"
              autoComplete="ageMin"
              value={formik.values.ageMin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              color="warning"
              name="ageMax"
              label="Max-Age"
              id="ageMax"
              autoComplete="ageMax"
              value={formik.values.ageMax}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SelectBreedComponent
              selectedItems={formik.values.breeds}
              setSelectedItems={(field, value) =>
                formik.setFieldValue(field, value)
              }
              items={breeds}
              label={"Breed"}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              color="warning"
              name="zipCodes"
              label="Enter zipcode/zipcodes seprated by comma"
              id="zipCodes"
              autoComplete="zipCodes"
              value={formik.values.zipCodes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="outlined"
          color="success"
          sx={{ mt: 3, mb: 2 }}
        >
          Filter
        </Button>
      </Box>
    </Paper>
  );
}

export default DogFilterComponent;