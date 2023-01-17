const express = require("express");
const morgan = require("morgan");
const app = express();
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");
const PORT = 3005;
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  //standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  //legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(morgan("combined"));
app.use(limiter);
app.use("/bookingservice", async (req, res, nex) => {
  try {
    console.log(req.headers["x-access-tokens"]);
    const response = await axios.get(
      "http://localhost:3001/api/v1/isAuthenticate",
      {
        headers: {
          "x-access-tokens": req.headers["x-access-tokens"],
        },
      }
    );
    console.log(response.data);
    if (response.data.success) nex();
    else {
        console.log('user is not authorized')
      return res.status(401).json({
        message: "unauthorized",
      });
    }
  } catch (error) {
    console.log('user is not authorized')
    return res.status(401).json({
      message: "Unauthorised",
    });
  }
});

app.use(
  "/bookingservice",
  createProxyMiddleware({
    target: "http://localhost:3002/",
    changeOrigin: true,
  })
);
app.get("/home", (req, res) => {
  return res.json({ message: "ok" });
});
app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});
