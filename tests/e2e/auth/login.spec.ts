import {test,expect} from "@playwright/test"
test("login FEVOCO responsive, password toggle and service error",async({page},info)=>{
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message))
 await page.goto("/login")
 await expect(page.getByRole("heading",{name:"Espace institutionnel"})).toBeVisible()
 await page.getByLabel("Adresse e-mail").fill("validation@example.org")
 await page.getByLabel("Mot de passe",{exact:true}).fill("Phrase de validation 2026")
 await page.getByRole("button",{name:"Afficher le mot de passe"}).click()
 await expect(page.getByLabel("Mot de passe",{exact:true})).toHaveAttribute("type","text")
 await page.getByRole("button",{name:"Masquer le mot de passe"}).click()
 await expect(page.getByLabel("Mot de passe",{exact:true})).toHaveAttribute("type","password")
 for (const [width,height] of [[1440,1000],[390,844],[320,640],[844,390]]) {
  await page.setViewportSize({width,height})
  await page.evaluate(()=>window.scrollTo(0,0))
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  if(width<1024){const brand=await page.getByRole("img",{name:"FEVOCO",exact:true}).boundingBox();expect(brand!.y).toBeGreaterThanOrEqual(0)}
  await expect(page.getByRole("button",{name:"Se connecter",exact:true})).toBeVisible()
  await page.screenshot({path:info.outputPath("login-"+width+"x"+height+".png"),fullPage:true})
 }
 const response=page.waitForResponse(res=>res.url().endsWith("/api/auth/login"))
 await page.getByRole("button",{name:"Se connecter",exact:true}).click()
 expect((await response).status()).toBe(503)
 await expect(page.locator("#login-error")).toContainText("momentanément indisponible")
 await expect(page.getByRole("button",{name:"Se connecter",exact:true})).toBeEnabled()
 expect(errors).toEqual([])
})
test("all business pages and APIs reject anonymous requests, including dotted identifiers",async({request,baseURL})=>{
 for(const path of ["/","/athletes","/clubs","/competitions","/parametres","/mon-compte","/activation","/clubs/unknown.png"]){
  const response=await request.get(path,{maxRedirects:0})
  expect(response.status(),path).toBe(307)
  expect(new URL(response.headers().location,baseURL).href).toBe(baseURL+"/login")
 }
 for(const path of ["/api/athletes","/api/clubs","/api/licences/acteurs","/api/avatars/private.jpg","/api/club-logos/private.png"]){
  expect((await request.get(path)).status(),path).toBe(401)
 }
 expect((await request.get("/logo-fevoco.png")).status()).toBe(200)
 expect((await request.get("/images/login/volleyball.svg")).status()).toBe(200)
})
test("server validates login payloads and rejects foreign origins",async({request,baseURL})=>{
 for(const data of [null,[],{}, {email:"",password:"x"}]){
  const response=await request.post("/api/auth/login",{headers:{origin:baseURL!},data})
  expect(response.status()).toBe(400)
 }
 expect((await request.post("/api/auth/login",{headers:{origin:"https://foreign.example"},data:{email:"validation@example.org",password:"x"}})).status()).toBe(403)
 expect((await request.post("/api/athletes",{headers:{origin:baseURL!},data:{}})).status()).toBe(401)
})
test("login keeps a single submission and uses a safe full navigation",async({page})=>{
 let count=0
 await page.route("**/api/auth/login",async route=>{
  count++;await new Promise(resolve=>setTimeout(resolve,300))
  await route.fulfill({json:{ok:true,redirectTo:"https://foreign.example"}})
 })
 // Isolated UI response; no account or database row is created.
 await page.route("http://127.0.0.1:3107/",route=>route.fulfill({contentType:"text/html; charset=utf-8",body:"<h1>Navigation locale validée</h1>"}))
 await page.goto("/login")
 await page.getByLabel("Adresse e-mail").fill("validation@example.org")
 await page.getByLabel("Mot de passe",{exact:true}).fill("Phrase de validation 2026")
 await page.locator("form").evaluate(form=>{form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))})
 await expect(page.getByRole("heading",{name:"Navigation locale validée"})).toBeVisible()
 expect(count).toBe(1);expect(page.url()).toBe("http://127.0.0.1:3107/")
})
