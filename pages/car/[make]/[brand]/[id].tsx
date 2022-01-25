import { GetServerSideProps } from "next";
import { openDB } from "../../../../openDB";
import { CarModel } from "../../../api/Car";
import { styled } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useState } from "react";
import { Skeleton } from "@material-ui/lab";
import Head from "next/head";
import ButtonBase from "@material-ui/core/ButtonBase";

interface CarDetailsProps {
  car: CarModel | null | undefined;
}

const Img = styled("img")({
  margin: "auto",
  display: "block",
  maxWidth: "100%",
  maxHeight: "100%",
});

export default function carDetails({ car }: CarDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);

  setTimeout(() => {
    setIsLoading(false);
  }, 3000);

  if (!car) {
    return <h1>Sorry car not found!</h1>;
  }
  if (isLoading) {
    return <Skeleton variant="rect" width={800} height={450} />;
  }
  if (!isLoading) {
    return (
      <div>
        <Head>
          <title>{`${car.make}-${car.model}`}</title>
        </Head>
        <Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={5}>
              <Img alt="complex" src={car.photoUrl} />
            </Grid>
            <Grid item xs={12} sm container>
              <Grid item xs container direction="column" spacing={2}>
                <Grid item xs>
                  <Typography variant="h4" component="div">
                    {`${car.make} ${car.model}`}
                  </Typography>
                  <Typography gutterBottom variant="h5" component="div">
                    ${car.price}
                  </Typography>
                  <Typography
                    gutterBottom
                    variant="body2"
                    color="textSecondary"
                  >
                    Year : {car.year}
                  </Typography>
                  <Typography
                    gutterBottom
                    variant="body2"
                    color="textSecondary"
                  >
                    KiloMeter : {car.kilometers}
                  </Typography>
                  <Typography
                    gutterBottom
                    variant="body2"
                    color="textSecondary"
                  >
                    fuel Type : {car.fuelType}
                  </Typography>
                  <Typography
                    gutterBottom
                    variant="body1"
                    color="textSecondary"
                  >
                    details : {car.details}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params.id;
  const db = await openDB();
  const car = await db.get<CarModel | undefined>(
    "SELECT * FROM Car Where id = ?",
    id
  );

  return {
    props: { car: car || null },
  };
};
