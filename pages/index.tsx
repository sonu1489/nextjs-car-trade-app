import { GetServerSideProps } from "next";
import { getMakes, Make } from "../database/getMakes";
import { Formik, Form, Field, useField, useFormikContext } from "formik";
import {
  Paper,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  makeStyles,
  SelectProps,
  Button,
} from "@material-ui/core";
// import {  } from "@material-ui/core";
// import  from "@material-ui/core/InputLabel";
// import MenuItem from "@material-ui/core/MenuItem";

// import  from "@material-ui/core/FormControl";
// import Select from "@material-ui/core/Select";
// import { makeStyles } from "@material-ui/core/styles";
import { useRouter } from "next/router";
// import { getMakes,Make } from "../database/getMakes";
import { Model } from "../database/getModels";
import { getAsString } from "../getAsString";
import { getModels } from "../database/getModels";
// import { SelectProps } from "@material-ui/core";
import useSWR from "swr";
import { useState, useEffect } from "react";
import { addAbortSignal } from "stream";
// import {  } from "formik";

export interface SearchProps {
  makes: Make[];
  models: Model[];
  singleColumn?: boolean;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: "auto",
    maxWidth: 500,
    padding: theme.spacing(3),
  },
}));

const prices = [500, 1000, 5000, 15000, 25000, 50000, 250000];

export default function Search({ makes, models, singleColumn }: SearchProps) {
  const classed = useStyles();
  const { query } = useRouter();
  const smValue = singleColumn ? 12 : 6;

  const [initialValues] = useState({
    make: getAsString(query.make) || "all",
    model: getAsString(query.model) || "all",
    minPrice: getAsString(query.minPrice) || "all",
    maxPrice: getAsString(query.maxPrice) || "all",
  });
  const router = useRouter();
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        router.push(
          {
            pathname: "/cars",
            query: { ...values, page: 1 },
          },
          undefined,
          { shallow: true }
        );
      }}
    >
      {({ values }) => (
        <Form>
          <Paper elevation={5} className={classed.paper}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={smValue}>
                <FormControl fullWidth>
                  <InputLabel id="search-make">Make</InputLabel>
                  <Field
                    name="make"
                    as={Select}
                    labelId="search-make"
                    label="Make"
                  >
                    <MenuItem value="all">
                      <em>All Makes</em>
                    </MenuItem>
                    {makes.map((make) => (
                      <MenuItem
                        value={make.make}
                        key={make.make}
                      >{`${make.make}(${make.count})`}</MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <ModelSelect
                  initialMake={initialValues.make}
                  make={values.make}
                  name="model"
                  models={models}
                />
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <FormControl fullWidth>
                  <InputLabel id="search-min-price">Min Price</InputLabel>
                  <Field
                    name="minPrice"
                    as={Select}
                    labelId="search-min-price"
                    label="Min Price"
                  >
                    <MenuItem value="all">
                      <em>All Min</em>
                    </MenuItem>
                    {prices.map((price) => (
                      <MenuItem value={price} key={price}>
                        {price}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <FormControl fullWidth>
                  <InputLabel id="search-max-price">Max Price</InputLabel>
                  <Field
                    name="maxPrice"
                    as={Select}
                    labelId="search-max-price"
                    label="Max Price"
                  >
                    <MenuItem value="all">
                      <em>All Max</em>
                    </MenuItem>
                    {prices.map((price) => (
                      <MenuItem value={price} key={price}>
                        {price}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Form>
      )}
    </Formik>
  );
}

export interface ModelSelectProps extends SelectProps {
  name: string;
  models: Model[];
  make: string;
  initialMake: string;
}
export function ModelSelect({
  initialMake,
  models,
  make,
  ...props
}: ModelSelectProps) {
  const { setFieldValue } = useFormikContext();
  const [field] = useField({
    name: props.name,
  });

  const initialModelsOrUndefined = make === initialMake ? models : undefined;
  const { data: newModels } = useSWR<Model[]>("/api/models?make=" + make, {
    dedupingInterval: 60000,
    initialData: make === "all" ? [] : initialModelsOrUndefined,
  });
  useEffect(() => {
    if (!newModels?.map((a) => a.model).includes(field.value)) {
      // we want to make this field.value = 'all'
      setFieldValue("model", "all");
    }
  }, [make, newModels]);

  return (
    <FormControl fullWidth>
      <InputLabel id="search-model">Model</InputLabel>
      <Select
        name="model"
        labelId="search-model"
        label="Model"
        {...field}
        {...props}
      >
        <MenuItem value="all">
          <em> ALL Model</em>
        </MenuItem>
        {newModels?.map((model) => (
          <MenuItem
            value={model.model}
            key={model.model}
          >{`${model.model}(${model.count})`}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export const getServerSideProps: GetServerSideProps<SearchProps> = async (
  context
) => {
  const make = getAsString(context.query.make);

  const [makes, models] = await Promise.all([getMakes(), getModels(make)]);

  return {
    props: { makes, models },
  };
};
