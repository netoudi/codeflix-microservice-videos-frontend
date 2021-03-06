import * as React from 'react';
import { Box, Container, makeStyles, Theme, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    color: '#999999',
    marginTop: theme.spacing(3),
  },
}));

interface Props {
  title: string;
  children: any;
}

export const Page: React.FC<Props> = ({ title, children }: Props) => {
  const classes = useStyles();

  return (
    <Container>
      <Typography className={classes.title} component="h1" variant="h5">
        {title}
      </Typography>

      <Box paddingTop={2} paddingBottom={5}>
        {children}
      </Box>
    </Container>
  );
};
