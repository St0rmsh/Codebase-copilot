import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import config from "./src/config/config.js";
import dns from "dns"

dns.setServers(['8.8.8.8','8.8.4.8'])
dns.setDefaultResultOrder("ipv4first"); 


connectDB()


app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`)
})



