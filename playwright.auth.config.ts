import { defineConfig } from "@playwright/test"
import { randomBytes } from "node:crypto"
export default defineConfig({
 testDir:"./tests/e2e/auth", outputDir:"./test-results/auth", timeout:45000, workers:1,
 use:{baseURL:"http://127.0.0.1:3107",headless:true},
 webServer:{command:"npm.cmd run start -- --hostname 127.0.0.1 --port 3107",url:"http://127.0.0.1:3107/login",reuseExistingServer:false,timeout:60000,
 env:{AUTH_SECRET:randomBytes(32).toString("hex"),AUTH_TELEMETRY_HMAC_KEY:randomBytes(32).toString("hex"),FEVOCO_USERS_SPREADSHEET_ID:"",GOOGLE_SHEETS_USERS_SPREADSHEET_ID:""}},
 reporter:[["list"]],
})
