import "./App.css";
import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardMedia,
  Grid,
  makeStyles,
  Paper,
} from "@material-ui/core";

const useStyle = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
}));

function App() {
  const classes = useStyle();
  const [picState, setpicState] = useState([]);
  const [pagination, setPagination] = useState({ current: 0, pageSize: 5 });
  const socket = new WebSocket("ws://localhost:8080/ws");

  const handleClick = () => {
    const requestParam = JSON.stringify(pagination);
    socket.send(requestParam);
  };

  socket.onmessage = (e) => {
    const resData = JSON.parse(e.data);

    setpicState(resData.pics);
    setPagination((prev) => ({ ...prev, current: resData.current }));
  };

  useEffect(() => {
    socket.onopen = () => console.log("ws has opened");
  }, []);

  const mockData = [1, 2, 3, 4, 5, 65, 6, 7, 4, 2, 1, 3, 5];

  return (
    <div className="App">
      Nothing but CRAWL
      <br />
      <Button onClick={handleClick} variant="contained" color="primary">
        CRAWL
      </Button>
      <Grid container spacing={1}>
        {picState.map((picUrl) => (
          <Grid item xs={3} key={picUrl}>
            <Card className={classes.root}>
              <CardMedia
                className={classes.media}
                style
                image={picUrl}
                title="test"
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default App;
