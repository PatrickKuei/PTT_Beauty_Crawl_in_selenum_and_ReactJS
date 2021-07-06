const beautyCrawl = require("./beautyCrawl").beautyCrawl;
const Websocket = require("ws");
const ws = new Websocket.Server({ port: 8080 });

ws.on("open", () => {
  console.log("connect open");
});
ws.on("close", () => console.log("connect close"));
ws.on("connection", (ws, req) => {
  ws.on("message", async (message) => {
    console.log("message", message);

    const requestParams = JSON.parse(message);
    const beautyResult = await beautyCrawl(
      parseInt(requestParams.current),
      parseInt(requestParams.pageSize),
      ws
    );
    const responseJson = JSON.stringify({
      isCompleted: true,
      pics: beautyResult.urls,
      current: beautyResult.current,
    });
    ws.send(responseJson);
  });
});
