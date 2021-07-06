import "./App.css";
import { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardMedia,
  Grid,
  makeStyles,
  Modal,
  Fade,
  Backdrop,
  CardActionArea,
  LinearProgress,
  Slider,
  Typography,
} from "@material-ui/core";

const useStyle = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  button: {
    margin: "30px 0",
  },
  slider: {
    width: "50vw",
  },
  media: {
    height: 0,
    paddingTop: "125%", // 16:9
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
  },
}));

function App() {
  const classes = useStyle();
  const [picState, setpicState] = useState([]);
  const [pagination, setPagination] = useState({ current: 0, pageSize: 1 });
  const socket = new WebSocket("ws://localhost:8080/ws");
  const [isProgressing, setIsProgressing] = useState(false);

  const handleCrawlClick = () => {
    setIsProgressing(true);
    const requestParam = JSON.stringify(pagination);
    socket.send(requestParam);
  };

  const [crawlProgress, setCrawlProgress] = useState(0);

  socket.onmessage = (e) => {
    const resData = JSON.parse(e.data);

    if (resData.isCompleted) {
      setIsProgressing(false);
      setCrawlProgress(0);
      setpicState((prev) => [...prev, ...resData.pics]);
      setPagination((prev) => ({ ...prev, current: resData.current }));
    } else {
      setCrawlProgress(resData.progress);
    }
  };

  useEffect(() => {
    socket.onopen = () => console.log("ws has opened");
  }, []);

  const [imgModalVisible, setImgModalVisible] = useState(false);
  const modalImgUrl = useRef();

  const handleImgClick = (e) => {
    const imgStyle = e.target.style.backgroundImage;
    modalImgUrl.current = imgStyle.substring(
      imgStyle.indexOf("http"),
      imgStyle.length - 2
    );
    setImgModalVisible(true);
  };

  const handlePageSizeChange = (e, newValue) => {
    setPagination((prev) => ({ ...prev, pageSize: newValue }));
  };

  const valueText = (value) => {
    const label = [];
    for (let i = 0; i < 7; i++) {
      if (i === 0) {
        label.push("a little");
      } else if (i === 6) {
        label.push("GIVE ME FUCKING ALL!!!");
      } else {
        let bangMark = "";
        for (let j = 0; j < i; j++) {
          bangMark += "!";
        }
        label.push(`I want more${bangMark}`);
      }
    }
    return label[value / 5];
  };

  return (
    <div className="App">
      <h1>No big Breast, No Unity</h1>
      <h4>Wish the Whole World Peace</h4>
      <Grid container spacing={1}>
        {picState.map((picUrl) => (
          <Grid item xs={3} key={picUrl}>
            <CardActionArea onClick={handleImgClick}>
              <Card className={classes.root}>
                <CardMedia
                  className={classes.media}
                  image={picUrl}
                  title="test"
                />
              </Card>
            </CardActionArea>
          </Grid>
        ))}
      </Grid>
      <br />
      <Typography>How many Nai Zi you want?</Typography>
      <Slider
        className={classes.slider}
        defaultValue={0}
        onChangeCommitted={handlePageSizeChange}
        aria-labelledby="discrete-slider"
        valueLabelDisplay="auto"
        step={5}
        marks
        min={0}
        max={30}
        valueLabelFormat={valueText}
      />
      <br />

      {isProgressing ? (
        <div style={{ width: "50vw", margin: "30px auto" }}>
          <LinearProgress variant="determinate" value={crawlProgress} />
        </div>
      ) : (
        <Button
          className={classes.button}
          onClick={handleCrawlClick}
          variant="contained"
          color="primary"
        >
          GIVE ME NAI ZI
        </Button>
      )}

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={imgModalVisible}
        onClose={() => setImgModalVisible(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={imgModalVisible}>
          <div className={classes.paper}>
            <img
              src={modalImgUrl.current}
              alt="img"
              style={{ height: "90vh" }}
            />
          </div>
        </Fade>
      </Modal>
    </div>
  );
}

export default App;
