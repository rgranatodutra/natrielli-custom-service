import app from "./app";
import "dotenv/config";

app.listen(+process.env.LISTEN_PORT || 7001, () => console.log(`App is running on port ${process.env.LISTEN_PORT}`));
