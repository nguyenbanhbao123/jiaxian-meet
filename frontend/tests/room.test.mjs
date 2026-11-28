import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const clip = fileURLToPath(new URL("./fixtures/local-video.webm", import.meta.url));
const accountApi = "http://localhost:8080";
let server, browser, origin;

before(async () => {
  server = await createServer({ server: { host: "127.0.0.1", port: 0 }, logLevel: "error" });
  await server.listen();
  origin = server.resolvedUrls.local[0];
  browser = await chromium.launch(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
});

after(async () => {
  await browser?.close();
  await server?.close();
});

async function visit(t, hash = "", width = 1280, height = 720) {
  const context = await browser.newContext({ viewport: { width, height } });
  t.after(() => context.close());
  // Account tests install page-level mocks. Never send test credentials to a running backend.
  const unexpectedApiRequests = [];
  await context.route(accountApi + "/**", route => {
    unexpectedApiRequests.push(route.request().url());
    return route.abort();
  });
  t.after(() => assert.deepEqual(unexpectedApiRequests, []));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, []));
  await page.goto(origin + hash);
  await page.getByRole("main").waitFor();
  return page;
}

const button = (page, name) => page.getByRole("button", { name, exact: true });
const focused = locator => locator.evaluate(element => element === document.activeElement);

async function assertLayout(page) {
  const issues = await page.evaluate(() => {
    const failures = [];
    if (document.documentElement.scrollWidth > innerWidth) failures.push("horizontal overflow");
    const controls = [...document.querySelectorAll("button, a, textarea, select, input:not([type=file])")]
      .filter(el => el.checkVisibility() && el.getBoundingClientRect().bottom > 0 && !el.closest("[hidden]"));
    for (let i = 0; i < controls.length; i++) {
      const a = controls[i], box = a.getBoundingClientRect();
      if (a.matches("button") && !a.textContent.trim() && (!a.ariaLabel || !a.title)) failures.push("unnamed icon");
      if (a.matches("button") && (box.width < 43.9 || box.height < 43.9)) failures.push("small button " + a.outerHTML.slice(0, 100));
      for (const other of controls.slice(i + 1)) {
        const b = other.getBoundingClientRect();
        if (Math.min(box.right,b.right) - Math.max(box.left,b.left) > 1 &&
            Math.min(box.bottom,b.bottom) - Math.max(box.top,b.top) > 1) failures.push("overlapping controls: " + a.outerHTML.slice(0, 80));
      }
    }
    return failures;
  });
  assert.deepEqual(issues, []);
}

for (const [width, height] of [[1440,900], [1280,720], [768,1024], [390,844], [320,568]]) {
  test(`Home, room and chat at ${width} × ${height}`, async t => {
    const page = await visit(t, "", width, height);
    for (const name of ["Create Room", "Join Room"]) {
      const box = await button(page, name).boundingBox();
      assert.ok(box.y >= 0 && box.y + box.height <= height);
    }
    await assertLayout(page);
    await button(page, "Create Room").click();
    await button(page, "Enter Watch Room").click();
    const toggle = button(page, "Chat");
    const closeChat = button(page, "Close chat");
    if (width < 1024) {
      await toggle.focus();
      await toggle.press("Enter");
    }
    await closeChat.waitFor();
    assert.equal(await toggle.isVisible(), width < 1024);
    await assertLayout(page);
    const draft = page.getByLabel("Message the room");
    const emojiButton = button(page, "Choose emoji");
    await emojiButton.focus();
    await emojiButton.press("Enter");
    const picker = page.getByRole("dialog", {name:"Choose emoji"});
    const search = picker.getByRole("combobox", {name:"Search emojis"});
    await picker.getByRole("gridcell").first().waitFor();
    assert.ok(await focused(search));
    const popup = await picker.boundingBox();
    const send = await button(page, "Send local message").boundingBox();
    assert.ok(popup.x >= 0 && popup.y >= 0 && popup.x + popup.width <= width && popup.y + popup.height <= height);
    assert.ok(popup.y + popup.height <= send.y || popup.y >= send.y + send.height);
    const categories = await picker.getByRole("tab").all();
    assert.equal(categories.length, 9);
    for (const tab of categories) {
      const box = await tab.boundingBox();
      assert.ok(box.x >= popup.x && box.x + box.width <= popup.x + popup.width + 1);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await search.fill("rocket");
    await search.press("Escape");
    await picker.waitFor({state:"hidden"});
    assert.ok(await focused(emojiButton));
    await draft.fill("A local message");
    await draft.press("Enter");
    await draft.fill("Keep this draft");
    await closeChat.focus();
    await closeChat.press("Enter");
    assert.ok(await focused(toggle));
    assert.equal(await draft.isVisible(), false);
    await toggle.press("Enter");
    assert.ok(await focused(page.getByRole("region", {name: "Local chat", exact: true})));
    assert.equal(await toggle.isVisible(), width < 1024);
    assert.equal(await draft.inputValue(), "Keep this draft");
    assert.equal(await page.getByText("A local message", { exact: true }).count(), 1);
    await button(page, "Guide").click();
    await assertLayout(page);
    const sections = page.locator("#guide-main section");
    for (const section of await sections.all()) {
      await section.scrollIntoViewIfNeeded();
      const box = await section.boundingBox();
      assert.ok(box.y >= -1 && box.y + box.height <= height + 1);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const lastSection = await sections.last().boundingBox();
    const lastLink = await page.getByRole("link", {name:"Sign Up", exact:true}).boundingBox();
    assert.ok(lastSection.y >= 0 && lastSection.y + lastSection.height <= height);
    assert.ok(lastLink.y + lastLink.height <= height - 16);
    await button(page, "Back").click();
    await draft.waitFor();
    assert.equal(await draft.inputValue(), "Keep this draft");
    assert.ok(await focused(button(page, "Guide")));
    await button(page, "Close chat").click();
    const box = await page.locator(".room-video-stage").boundingBox();
    assert.ok(box.width >= width * .7);
    await page.getByRole("link", {name: "Leave room"}).click();
    await button(page, "Create Room").waitFor();
  });
}

test("invitation, clipboard, form validation, cancellation and history", async t => {
  const page = await visit(t);
  const create = button(page, "Create Room");
  await create.focus();
  await page.keyboard.press("Enter");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", {name: /Copy code/}).click();
  await page.getByText("Sample code copied.").waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "DEMO-2SEATS");
  await page.keyboard.press("Escape");
  assert.ok(await focused(create));
  const input = page.getByLabel("Room code", {exact:true});
  await input.focus();
  await input.press("Tab");
  assert.equal(await page.getByRole("alert").count(), 0);
  await input.fill("DE");
  await input.press("Tab");
  assert.equal(await input.getAttribute("aria-invalid"), "false");
  assert.equal(await input.locator("..").getAttribute("data-validation"), "idle");
  await input.fill("");
  await button(page, "Join Room").click();
  await page.getByRole("alert").waitFor();
  assert.ok(await focused(input));
  await input.fill("invalid");
  await input.press("Enter");
  assert.match(await page.getByRole("alert").textContent(), /six/);
  await input.fill("demo-2seats");
  assert.equal(await page.getByRole("alert").count(), 0);
  await button(page, "Clear room code").click();
  assert.equal(await input.inputValue(), "");
  await input.fill(" demo-ab1234 ");
  await button(page, "Guide").click();
  await page.goBack();
  assert.equal(await input.inputValue(), " demo-ab1234 ");
  await page.goForward();
  await button(page, "Back").click();
  await input.press("Enter");
  await button(page, "Cancel demo join").click();
  await page.getByText("Join canceled.").waitFor();
  await input.press("Enter");
  await page.waitForURL("**/#watch-room");
  await page.goBack();
  await create.waitFor();
  await page.goForward();
  await button(page,"Choose Video").waitFor();
});

test("local media selection, transport, replacement, errors and URL lifetime", async t => {
  const page = await visit(t, "#watch-room");
  const choose = button(page, "Choose Video");
  assert.ok(await button(page, "Play video").isDisabled());
  const chooser = page.waitForEvent("filechooser");
  await choose.click();
  await (await chooser).setFiles(clip);
  const video = page.locator("video");
  await page.waitForFunction(() => document.querySelector("video")?.duration > 0);
  const first = await video.getAttribute("src");
  const play = button(page, "Play video");
  await play.click();
  await page.waitForFunction(() => document.querySelector("video").currentTime > .1);
  await button(page,"Pause video").click();
  assert.ok(await video.evaluate(v => v.paused));
  const range = page.getByRole("slider", {name:"Video timeline"});
  await range.press("End");
  await range.press("ArrowLeft");
  assert.ok(await video.evaluate(v => v.currentTime > 4));
  await range.press("Home");
  await page.getByRole("slider", {name:"Video volume"}).press("Home");
  assert.equal(await video.evaluate(v => v.volume), 0);
  await button(page,"Mute video").click();
  assert.ok(await video.evaluate(v => v.volume > 0 && !v.muted));
  await button(page,"Mute video").click();
  assert.ok(await video.evaluate(v => v.muted));
  await button(page, "Playback settings").click();
  await page.getByRole("button", {name:/Playback speed/}).click();
  const speed = page.getByRole("slider", { name: "Playback speed" });
  await speed.press("ArrowRight");
  await speed.press("Escape");
  assert.equal(await video.evaluate(v => v.playbackRate), 1.25);
  await button(page,"Theater view").click();
  assert.equal(await button(page,"Chat").getAttribute("aria-expanded"), "false");
  await button(page,"Enter fullscreen").click();
  await page.waitForFunction(() => !!document.fullscreenElement);
  await button(page,"Exit fullscreen").click();
  await page.waitForFunction(() => !document.fullscreenElement);
  await play.click();
  await button(page,"Guide").click();
  await page.waitForFunction(() => document.querySelector("video").paused);
  const pausedAt = await video.evaluate(v => v.currentTime);
  await button(page,"Back").click();
  assert.equal(await video.evaluate(v => v.currentTime), pausedAt);
  assert.equal(await video.getAttribute("src"), first);
  assert.equal(await video.evaluate(v => v.playbackRate), 1.25);

  const replacement = page.waitForEvent("filechooser");
  await button(page,"Change video").click();
  await (await replacement).setFiles({name:"bad.txt", mimeType:"text/plain", buffer:Buffer.from("hello")});
  await page.getByText("Choose a video file,", {exact:false}).waitFor();
  assert.equal(await video.getAttribute("src"), first);
  const fileInput = page.getByLabel("Choose a local video file");
  await fileInput.setInputFiles({name:"broken.webm", mimeType:"video/webm", buffer:Buffer.from("broken")});
  await page.getByRole("alert").waitFor();
  assert.ok(await button(page,"Play video").isDisabled());
  // A dropped file follows the same browser File -> blob URL path as a selection.
  const transfer = await page.evaluateHandle(bytes => {
    const data = new DataTransfer();
    data.items.add(new File([new Uint8Array(bytes)], "dropped.webm", {type:"video/webm"}));
    return data;
  }, [...await readFile(clip)]);
  const canvas = page.locator(".room-canvas");
  await canvas.dispatchEvent("dragenter", {dataTransfer: transfer});
  await page.getByText("Drop to open locally").waitFor();
  await canvas.dispatchEvent("drop", {dataTransfer: transfer});
  await page.waitForFunction(() => document.querySelector("video")?.duration > 0);
  const last = await video.getAttribute("src");
  const released = url => page.evaluate(async value => {
    try { await fetch(value); return false; } catch { return true; }
  }, url);
  assert.ok(await released(first));
  await page.getByRole("link", {name:"Leave room"}).click();
  await button(page,"Create Room").waitFor();
  assert.ok(await released(last));
});

test("secondary controls, dialog keyboard behavior and Guide account navigation", async t => {
  const page = await visit(t, "?diagnostics=1#watch-room");
  const mic = button(page, "Preview microphone");
  await mic.click();
  assert.equal(await mic.getAttribute("aria-pressed"), "true");
  await page.getByText("No audio connection").waitFor();
  await button(page, "Sample participants").click();
  await page.getByText("· Sample guest").waitFor();
  await page.keyboard.press("Tab");
  assert.ok(await page.evaluate(() => !!document.activeElement.closest("dialog")));
  await page.keyboard.press("Escape");
  const theaterSetting = button(page, "Theater view");
  await theaterSetting.click();
  assert.equal(await theaterSetting.getAttribute("aria-pressed"), "true");
  await theaterSetting.click();
  const preview = button(page, "Preview video UI states");
  await preview.click();
  const options = page.getByLabel("Preview state");
  await button(page,"Use sample video").click();
  const progress = page.getByRole("slider", {name:/Mock progress/});
  await progress.press("End");
  assert.equal(await progress.inputValue(), "100");
  await button(page,"Cancel demo upload").click();
  await options.selectOption("error");
  await button(page,"Retry demo").click();
  assert.equal(await options.inputValue(), "uploading");
  await options.selectOption("waiting-for-host");
  await button(page,"Exit preview").waitFor();
  await options.selectOption("ready");
  await button(page,"Return to local player").click();
  assert.ok(await focused(preview));
  const draft = page.getByLabel("Message the room");
  await draft.fill("hello");
  await button(page,"Choose emoji").click();
  const picker = page.getByRole("dialog", {name:"Choose emoji"});
  await picker.getByRole("gridcell", {name:"grinning face", exact:true}).click();
  await draft.press("Shift+Enter");
  assert.equal(await draft.inputValue(), "hello😀\n");
  await button(page,"Send local message").click();
  assert.ok(await button(page,"Send local message").isDisabled());
  await button(page,"Guide").click();
  await page.getByRole("link", {name:"Log In", exact:true}).click();
  await page.getByRole("heading", {name:"Welcome back"}).waitFor();
  await page.getByRole("link", {name:"Jiaxian Meet home"}).click();
  await button(page,"Create Room").waitFor();
});

test("direct Guide link, manual copy fallback and modal backdrop", async t => {
  const page = await visit(t, "#guide", 390, 844);
  await button(page,"Back").click();
  const create = button(page,"Create Room");
  await create.click();
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {value:undefined}));
  await page.getByRole("button", {name:/Copy code/}).click();
  await page.getByText(/Automatic copying isn’t available/).waitFor();
  const code = page.getByLabel("Sample room code");
  assert.deepEqual(await code.evaluate(el => [el.selectionStart,el.selectionEnd]), [0,11]);
  await page.mouse.click(1,1);
  await page.getByRole("dialog").waitFor({state:"hidden"});
  assert.ok(await focused(create));
});

test("pending join cancels on Guide and layouts adapt during an open room", async t => {
  const page = await visit(t);
  await page.clock.install();
  await page.getByLabel("Room code", {exact:true}).fill("DEMO-2SEATS");
  await button(page,"Join Room").click();
  await button(page,"Guide").click();
  await page.clock.runFor(1100);
  assert.equal(new URL(page.url()).hash, "#guide");
  await button(page,"Back").click();
  await button(page,"Create Room").click();
  await button(page,"Enter Watch Room").click();
  const draft = page.getByLabel("Message the room");
  await draft.fill("Resize me");
  for (const width of [390, 320, 768, 1440]) {
    await page.setViewportSize({width, height:844});
    await assertLayout(page);
    assert.equal(await draft.inputValue(), "Resize me");
  }
  const scroller = page.getByRole("region", {name:"Chat history"});
  for (let i = 0; i < 12; i++) {
    await draft.fill("Scrolling message " + i);
    await draft.press("Enter");
  }
  await scroller.evaluate(el => { el.scrollTop = 30; });
  const before = await scroller.evaluate(el => el.scrollTop);
  assert.ok(before > 0);
  await button(page,"Close chat").click();
  await button(page,"Chat").click();
  assert.equal(await scroller.evaluate(el => el.scrollTop), before);
});

for (const [width, height] of [[1440, 900], [390, 844], [320, 568]]) {
  test(`Original account layout and login/signup navigation at ${width}px`, async t => {
    const page = await visit(t, "#home", width, height);
    const link = name => page.getByRole("link", {name, exact:true});
    const heading = name => page.getByRole("heading", {name, exact:true});
    for (const [name, hash, title] of [
      ["Log In", "login", "Welcome back"], ["Sign Up", "sign-up", "Create your account"]
    ]) {
      await link(name).click();
      await page.waitForURL("**/#" + hash);
      await heading(title).waitFor();
      const inputs = page.locator("form input");
      assert.equal(await inputs.count(), hash === "login" ? 2 : 3);
      assert.ok(await page.getByLabel("Username", {exact:true}).isEditable());
      const email = page.getByLabel("Email Address");
      if (hash === "sign-up") assert.ok(await email.isEditable());
      else assert.equal(await email.count(), 0);
      assert.ok(await page.getByLabel("Password", {exact:true}).isEditable());
      const panels = page.getByRole("main").locator(":scope > div");
      const formBox = await panels.first().boundingBox();
      assert.equal(formBox.width, width < 768 ? width : width / 2);
      assert.equal(await panels.nth(1).isVisible(), width >= 768);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      await page.reload();
      await heading(title).waitFor();
      await link("Jiaxian Meet home").click();
    }
    await link("Log In").click();
    await button(page,"Sign Up").first().click();
    await page.waitForURL("**/#sign-up");
    await heading("Create your account").waitFor();
    await page.goBack();
    await heading("Welcome back").waitFor();
    await page.goForward();
    await heading("Create your account").waitFor();
    await page.getByRole("button", {name:"Log In", exact:true}).last().click();
    await heading("Welcome back").waitFor();
    await page.route(accountApi + "/login", route => route.fulfill({status: 401, json: {error: "username or password is incorrect"}}));
    await page.route(accountApi + "/register", route => route.fulfill({status: 409, json: {error: "username or email is already in use"}}));
    const requests = [];
    page.on("request", r => { if (["xhr","fetch","document"].includes(r.resourceType())) requests.push(r.url()); });
    await page.getByLabel("Username", {exact:true}).fill("Viewer");
    await page.getByLabel("Password", {exact:true}).fill("local-test-example");
    await page.locator("form button[type=submit]").click();
    await page.getByText("Incorrect username or password.", {exact:true}).waitFor();
    for (const provider of ["Google","Apple"]) await page.getByRole("button", {name: new RegExp("Continue with " + provider + "$")}).click();
    await heading("Welcome back").waitFor();
    await button(page,"Sign Up").first().click();
    await page.getByLabel("Username", {exact:true}).fill("Viewer");
    await page.getByLabel("Email Address").fill("viewer@example.invalid");
    await button(page,"Create Account").click();
    await heading("Create your account").waitFor();
    await page.getByText("That username or email is already in use.").waitFor();
    assert.deepEqual(requests, [accountApi + "/login", accountApi + "/register"]);
    await button(page,"Log In").first().click();
    await link("Forgot password?").click();
    await button(page,"Create Room").waitFor();
  });
}

test("emoji search, cursor insertion, replacement, recents and local delivery", async t => {
  const page = await visit(t, "#watch-room");
  const draft = page.getByLabel("Message the room");
  const trigger = button(page, "Choose emoji");
  const picker = page.getByRole("dialog", {name:"Choose emoji"});
  const search = picker.getByRole("combobox", {name:"Search emojis"});
  const log = page.getByRole("log", {name:"Chat messages"});
  const initialCount = await log.getByRole("listitem").count();
  await draft.fill("Watch it tonight");
  await draft.evaluate(el => el.setSelectionRange(6, 8));
  await trigger.click();
  await search.fill("rocket");
  const rocket = picker.getByRole("gridcell", {name:"rocket", exact:true});
  await rocket.waitFor();
  await search.press("ArrowDown");
  assert.ok(await focused(search));
  const selected = await search.evaluate(el => {
    const cell = document.getElementById(el.getAttribute("aria-activedescendant"));
    return { role: cell?.getAttribute("role"), name: cell?.ariaLabel, glyph: cell?.textContent.trim() };
  });
  assert.equal(selected.role, "gridcell");
  assert.ok(selected.glyph && selected.name);
  await search.press("Enter");
  assert.equal(await draft.inputValue(), `Watch ${selected.glyph} tonight`);
  assert.ok(await focused(draft));
  const caret = 6 + selected.glyph.length;
  assert.deepEqual(await draft.evaluate(el => [el.selectionStart, el.selectionEnd]), [caret, caret]);
  await trigger.click();
  const recent = picker.getByRole("rowgroup", {name:"Recently Used"}).getByRole("gridcell", {name:selected.name, exact:true});
  await recent.click();
  const message = `Watch ${selected.glyph.repeat(2)} tonight`;
  assert.equal(await draft.inputValue(), message);
  assert.equal(await log.getByRole("listitem").count(), initialCount);
  await trigger.click();
  await picker.getByRole("tab", {name:"Food & Drink"}).click();
  await picker.getByRole("rowgroup", {name:"Food & Drink"}).getByRole("gridcell").first().waitFor();
  await draft.click();
  await picker.waitFor({state:"hidden"});
  await button(page, "Close chat").click();
  await button(page, "Chat").click();
  assert.equal(await draft.inputValue(), message);
  await draft.press("Enter");
  await log.getByText(message, {exact:true}).waitFor();
  assert.equal(await draft.inputValue(), "");
});

test("skin tones and whole-emoji handling at the draft length limit", async t => {
  const page = await visit(t, "#watch-room");
  const draft = page.getByLabel("Message the room");
  const trigger = button(page, "Choose emoji");
  const picker = page.getByRole("dialog", {name:"Choose emoji"});
  await trigger.click();
  await picker.getByRole("button", {name:"Skin tone NEUTRAL", exact:true}).click();
  await picker.getByRole("button", {name:"Skin tone MEDIUM", exact:true}).click();
  await picker.getByRole("combobox", {name:"Search emojis"}).fill("thumbs up");
  await picker.getByRole("gridcell", {name:/^thumbs up/}).first().click();
  assert.equal(await draft.inputValue(), "👍🏽");

  await draft.fill("a".repeat(1999));
  await trigger.click();
  await picker.getByRole("combobox", {name:"Search emojis"}).fill("rocket");
  await picker.getByRole("gridcell", {name:"rocket", exact:true}).click();
  await picker.getByText("This emoji exceeds the 2000-character limit.").waitFor();
  assert.equal(await draft.inputValue(), "a".repeat(1999));
  await page.keyboard.press("Escape");
  await draft.focus();
  await draft.evaluate(el => el.setSelectionRange(0, 1));
  await trigger.click();
  await picker.getByRole("combobox", {name:"Search emojis"}).fill("rocket");
  await picker.getByRole("gridcell", {name:"rocket", exact:true}).click();
  assert.equal(await draft.inputValue(), "🚀" + "a".repeat(1998));
});

for (const [width, height] of [[1440, 900], [1280, 720], [768, 1024], [390, 844], [320, 568]]) {
  test(`Player settings fit the video and support keyboard navigation at ${width} × ${height}`, async t => {
    const page = await visit(t, "#watch-room", width, height);
    const gear = button(page, "Playback settings");
    const panel = page.getByRole("dialog", { name: "Playback settings" });
    assert.ok(await gear.isDisabled());
    assert.equal(await button(page, "Preview video UI states").count(), 0);
    assert.equal(await page.getByRole("navigation").getByRole("button", {name: /settings/i}).count(), 0);
    await page.getByLabel("Choose a local video file").setInputFiles(clip);
    await page.waitForFunction(() => document.querySelector("video")?.duration > 0);
    for (const fullscreen of [false, true]) {
      if (fullscreen) {
        await gear.click();
        await panel.getByRole("button", {name: /Brightness/}).click();
        const slider = panel.getByRole("slider", {name: "Brightness"});
        await slider.press("ArrowLeft");
        await slider.press("Escape");
        await button(page, "Enter fullscreen").click();
        await page.waitForFunction(() => !!document.fullscreenElement);
        assert.equal(await page.locator("video").evaluate(v => getComputedStyle(v).filter), "brightness(0.95)");
      }
      await gear.press("Enter");
      await panel.waitFor();
      assert.equal(await gear.getAttribute("aria-expanded"), "true");
      assert.ok(await focused(panel.getByRole("button", {name: /Playback speed/})));
      const bounds = await panel.evaluate(el => {
        const box = el.getBoundingClientRect();
        const canvas = el.closest(".room-canvas").getBoundingClientRect();
        const controls = el.closest(".room-player-controls").getBoundingClientRect();
        return box.left >= Math.max(0, canvas.left) && box.right <= Math.min(innerWidth, canvas.right) &&
          box.top >= Math.max(0, canvas.top) && box.bottom <= Math.min(innerHeight, controls.top) &&
          el.scrollHeight <= el.clientHeight + 1 && document.documentElement.scrollWidth <= innerWidth;
      });
      assert.ok(bounds, "All rows fit above the controls, inside the video and viewport");
      for (const row of await panel.getByRole("button").all()) {
        assert.ok(await row.evaluate(el => {
          const r = el.getBoundingClientRect();
          return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
        }));
      }
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      const brightness = panel.getByRole("slider", {name: "Brightness"});
      assert.ok(await focused(brightness));
      if (fullscreen) await brightness.press("ArrowRight");
      await brightness.press("ArrowRight");
      assert.equal(await page.locator("video").evaluate(v => getComputedStyle(v).filter), "brightness(1.05)");
      await brightness.press("Shift+Tab");
      await page.keyboard.press("Enter");
      assert.ok(await focused(panel.getByRole("button", {name: /Brightness 105%/})));
      await page.keyboard.press("Escape");
      await panel.waitFor({state: "hidden"});
      assert.ok(await focused(gear));
      assert.equal(await gear.getAttribute("aria-expanded"), "false");
      await gear.click();
      await button(panel, "Reset to defaults").click();
      await gear.click();
      await panel.waitFor({state: "hidden"});
      await gear.click();
      await page.locator("video").click({position: {x: 5, y: 5}});
      await panel.waitFor({state: "hidden"});
      if (fullscreen) await button(page, "Exit fullscreen").click();
    }
    await assertLayout(page);
  });
}

test("Player adjustments update local media and reset preserves the session", async t => {
  const page = await visit(t, "#watch-room");
  const file = page.getByLabel("Choose a local video file");
  await file.setInputFiles(clip);
  await page.waitForFunction(() => document.querySelector("video")?.duration > 0);
  const video = page.locator("video");
  const gear = button(page, "Playback settings");
  const panel = page.getByRole("dialog", {name: "Playback settings"});
  const draft = page.getByLabel("Message the room");
  await draft.fill("Saved in chat");
  await draft.press("Enter");
  await draft.fill("Unsent draft");
  await page.getByRole("slider", {name: "Video volume"}).press("ArrowLeft");
  await button(page, "Mute video").click();
  await button(page, "Theater view").click();
  const timeline = page.getByRole("slider", {name: "Video timeline"});
  await timeline.press("ArrowRight");
  const session = () => video.evaluate(v => [v.currentSrc, v.currentTime, v.volume, v.muted, v.paused, location.href]);
  const initial = await session();
  assert.ok(initial[1] > 0);
  const values = () => video.evaluate(v => [v.playbackRate, getComputedStyle(v).filter, v.loop]);
  const defaults = [1, "none", false];
  assert.deepEqual(await values(), defaults);
  await gear.click();
  await panel.getByRole("button", {name: /Playback speed 1×/}).click();
  const speed = panel.getByRole("slider", {name: "Playback speed"});
  await speed.press("Home");
  assert.equal(await video.evaluate(v => v.playbackRate), 0.5);
  await speed.press("End");
  assert.equal(await video.evaluate(v => v.playbackRate), 2);
  await speed.press("ArrowLeft");
  assert.equal(await speed.getAttribute("aria-valuetext"), "1.75 times normal speed");
  await button(panel, "Back to playback settings").click();
  assert.ok(await focused(panel.getByRole("button", {name: /Playback speed 1.75×/})));
  await panel.getByRole("button", {name: /Brightness 100%/}).click();
  const brightness = panel.getByRole("slider", {name: "Brightness"});
  await brightness.press("Home");
  assert.equal(await video.evaluate(v => getComputedStyle(v).filter), "brightness(0.5)");
  await brightness.press("End");
  await button(panel, "Back to playback settings").click();
  const loop = button(panel, "Loop video");
  await loop.press("Space");
  assert.equal(await loop.getAttribute("aria-pressed"), "true");
  assert.deepEqual(await values(), [1.75, "brightness(1.5)", true]);
  assert.deepEqual(await session(), initial);
  assert.ok(await page.locator(".room-player-controls, #room-chat, video").evaluateAll(elements =>
    elements.every(el => {
      for (let node = el.tagName === "VIDEO" ? el.parentElement : el; node; node = node.parentElement) {
        if (getComputedStyle(node).filter !== "none") return false;
      }
      return true;
    })));
  await button(panel, "Reset to defaults").click();
  assert.deepEqual(await values(), defaults);
  assert.deepEqual(await session(), initial);
  assert.equal(await button(page, "Theater view").getAttribute("aria-pressed"), "true");
  await page.keyboard.press("Escape");
  await button(page, "Theater view").click();
  assert.equal(await draft.inputValue(), "Unsent draft");
  await page.getByText("Saved in chat", {exact: true}).waitFor();

  // Seek close to the end to observe both native loop and native ended behavior.
  await gear.click();
  await loop.click();
  await page.keyboard.press("Escape");
  await timeline.press("End");
  await timeline.press("ArrowLeft");
  await button(page, "Play video").click();
  await page.waitForFunction(() => {
    const v = document.querySelector("video");
    return !v.paused && v.currentTime > 0.05 && v.currentTime < 1;
  });
  await gear.click();
  await panel.getByRole("button", {name: /Playback speed/}).click();
  await speed.press("ArrowRight");
  assert.ok(await video.evaluate(v => !v.paused && v.playbackRate === 1.25));
  await button(panel, "Back to playback settings").click();
  await loop.click();
  assert.equal(await video.evaluate(v => v.loop), false);
  await page.keyboard.press("Escape");
  await video.evaluate(v => { v.currentTime = v.duration - 0.2; });
  await page.waitForFunction(() => document.querySelector("video").ended);

  await gear.click();
  await loop.click();
  await panel.getByRole("button", {name: /Brightness/}).click();
  await brightness.press("End");
  await brightness.press("Escape");
  await file.setInputFiles({name:"invalid.txt", mimeType:"text/plain", buffer:Buffer.from("invalid")});
  assert.deepEqual(await values(), [1.25, "brightness(1.5)", true]);
  await file.setInputFiles(clip);
  await page.waitForFunction(old => {
    const v = document.querySelector("video");
    return v.currentSrc && v.currentSrc !== old && v.duration > 0;
  }, initial[0]);
  assert.deepEqual(await values(), defaults);
});

const credentials = {username: "mock_viewer", password: "synthetic-test-only"};
const profile = {id: 17, username: "MockViewer", email: "viewer@example.invalid", avatar_url: null};

async function fillAccountForm(page, register = false) {
  await page.getByLabel("Username", {exact: true}).fill(credentials.username);
  if (register) await page.getByLabel("Email Address").fill(profile.email);
  await page.getByLabel("Password", {exact: true}).fill(credentials.password);
  return page.locator("form button[type=submit]");
}

for (const register of [true, false]) {
  const endpoint = register ? "/register" : "/login";
  test(`Mock ${endpoint} normalizes the returned account and keeps it in memory`, async t => {
    const page = await visit(t, register ? "#sign-up" : "#login");
    const avatarUrl = origin + "mock-avatar.svg";
    await page.route(avatarUrl, route => route.fulfill({
      contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"/>'
    }));
    const user = {...profile, avatar_url: register ? avatarUrl : null};
    const payloads = [];
    let reply;
    const pending = new Promise(resolve => { reply = resolve; });
    await page.route(accountApi + endpoint, async route => {
      payloads.push([route.request().method(), route.request().postDataJSON()]);
      await pending;
      await route.fulfill({status: register ? 201 : 200, json: register ? user : {message: "Login successful", user}});
    });

    const submit = await fillAccountForm(page, register);
    const requestStarted = page.waitForRequest(accountApi + endpoint);
    // Submit twice in the same turn, before React can disable the button.
    await page.locator("form").evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
    await requestStarted;
    assert.ok(await submit.isDisabled());
    assert.equal(await page.locator("form").getAttribute("aria-busy"), "true");
    assert.match(await page.getByRole("status").innerText(), register ? /Creating/ : /Logging in/);
    reply();

    await page.waitForURL("**/#home");
    assert.deepEqual(payloads, [["POST", register ? {...credentials, email: profile.email} : credentials]]);
    const account = button(page, profile.username + " account menu");
    await account.waitFor();
    if (register) {
      const img = account.getByRole("img", {name: profile.username});
      assert.equal(await img.getAttribute("src"), avatarUrl);
      await page.waitForFunction(() => document.querySelector(".home-nav img")?.naturalWidth > 0);
    } else assert.equal(await account.innerText(), "M");
    await account.click();
    await page.getByText(profile.username, {exact:true}).waitFor();
    if (register) await button(page, "Log Out").click();
    else await page.reload();
    await page.getByRole("link", {name:"Log In", exact:true}).waitFor();
    assert.equal(await account.count(), 0);
  });
}

const unexpected = "The account service returned an unexpected response. Please try again.";
for (const [name, endpoint, mock, message] of [
  ["bad credentials", "/login", {status: 401, json: {error: "username or password is incorrect"}}, "Incorrect username or password."],
  ["duplicate account", "/register", {status: 409, json: {error: "username or email is already in use"}}, "That username or email is already in use."],
  ["validation error", "/register", {status: 400, json: {error: "password must be at least 6 characters"}}, "password must be at least 6 characters"],
  ["network failure", "/login", null, "Could not reach the account service. Check your connection and try again."],
  ["non-JSON response", "/login", {status: 200, contentType: "text/html", body: "<html>Unavailable</html>"}, unexpected],
  ["missing ID", "/register", {status: 201, json: {username: "Viewer", email: profile.email}}, unexpected],
  ["invalid avatar type", "/login", {status: 200, json: {message: "ok", user: {...profile, avatar_url: 7}}}, unexpected],
  ["wrong login envelope", "/login", {status: 200, json: profile}, unexpected],
]) {
  test("Mock account error preserves the form: " + name, async t => {
    const register = endpoint === "/register";
    const hash = register ? "#sign-up" : "#login";
    const page = await visit(t, hash);
    await page.route(accountApi + endpoint, route => mock ? route.fulfill(mock) : route.abort("failed"));
    const submit = await fillAccountForm(page, register);
    await submit.click();
    const alert = page.getByRole("alert");
    await alert.waitFor();
    assert.equal(await alert.innerText(), message);
    assert.equal(await page.getByLabel("Username", {exact:true}).inputValue(), credentials.username);
    assert.equal(await page.getByLabel("Password", {exact:true}).inputValue(), credentials.password);
    if (register) assert.equal(await page.getByLabel("Email Address").inputValue(), profile.email);
    assert.equal(new URL(page.url()).hash, hash);
    assert.ok(await submit.isEnabled());
  });
}

test("An abandoned login cannot replace a later registration", async t => {
  const page = await visit(t, "#login");
  let release;
  const delayed = new Promise(resolve => { release = resolve; });
  await page.route(accountApi + "/login", async route => {
    await delayed;
    await route.fulfill({json: {message: "ok", user: profile}});
  });
  const requestStarted = page.waitForRequest(accountApi + "/login");
  await (await fillAccountForm(page)).click();
  await requestStarted;
  const canceled = page.waitForEvent("requestfailed", r => r.url() === accountApi + "/login");
  await button(page, "Sign Up").first().click();
  await page.getByRole("heading", {name:"Create your account"}).waitFor();
  release();
  await canceled;
  assert.ok(await button(page, "Create Account").isEnabled());
  assert.equal(await page.getByRole("alert").count(), 0);
  await page.route(accountApi + "/register", route => route.fulfill({status: 201, json: {...profile, avatar_url: origin + "broken-avatar.png"}}));
  await page.route(origin + "broken-avatar.png", route => route.fulfill({status:404, body:""}));
  await (await fillAccountForm(page, true)).click();
  await page.waitForURL("**/#home");
  await button(page, profile.username + " account menu").getByText("M", {exact:true}).waitFor();
});

async function visitWithDeferredRooms(t) {
  const page = await visit(t);
  // Replace only the local adapter. Late replies deliberately ignore abort signals.
  await page.route("**/src/components/home/roomOperations.ts*", route => route.fulfill({
    contentType: "text/javascript",
    body: `
      window.roomCalls = [];
      function defer(kind, signal, code) {
        return new Promise((resolve, reject) => {
          window.roomCalls.push({kind, signal, code, resolve, reject});
        });
      }
      export const demoRoomOperations = {
        createRoom: signal => defer("create", signal),
        joinRoom: (code, signal) => defer("join", signal, code),
      };
    `,
  }));
  await page.reload();
  await button(page, "Create Room").waitFor();
  return page;
}

test("deferred creation blocks duplicates and retries with the returned invitation code", async t => {
  const page = await visitWithDeferredRooms(t);
  const create = button(page, "Create Room");
  await create.evaluate(el => { el.click(); el.click(); });
  await page.getByText("Creating the local demo room…").waitFor({state:"attached"});
  assert.ok(await button(page, "Creating demo…").isDisabled());
  assert.ok(await button(page, "Join Room").isDisabled());
  assert.deepEqual(await page.evaluate(() => roomCalls.map(call => call.kind)), ["create"]);
  await page.evaluate(() => roomCalls[0].reject(new Error("simulated failure")));
  await page.getByRole("alert").waitFor();
  assert.equal(await page.getByRole("dialog").count(), 0);
  await create.click();
  await page.evaluate(() => roomCalls[1].resolve("DEMO-ABC123"));
  const code = page.getByLabel("Sample room code");
  await code.waitFor();
  assert.equal(await code.inputValue(), "DEMO-ABC123");
  await button(page, "Enter Watch Room").click();
  await page.waitForURL("**/#watch-room");
});

test("deferred join validates, cancels, ignores late results and retries after an error", async t => {
  const page = await visitWithDeferredRooms(t);
  const input = page.getByLabel("Room code", {exact:true});
  const form = page.getByRole("form", {name:"Join room"});
  await input.fill("bad");
  await input.press("Enter");
  assert.equal(await input.getAttribute("aria-invalid"), "true");
  assert.equal(await page.evaluate(() => roomCalls.length), 0);
  await input.fill(" demo-2seats ");
  await form.evaluate(el => { el.requestSubmit(); el.requestSubmit(); });
  assert.deepEqual(await page.evaluate(() => roomCalls.map(c => [c.kind, c.code])), [["join", "DEMO-2SEATS"]]);
  assert.ok(await button(page, "Joining demo…").isDisabled());
  await button(page, "Cancel demo join").click();
  await page.getByText("Join canceled.").waitFor();
  assert.ok(await focused(input));
  assert.ok(await page.evaluate(() => roomCalls[0].signal.aborted));
  await input.press("Enter");
  await page.evaluate(() => roomCalls[0].resolve());
  assert.ok(await button(page, "Joining demo…").isDisabled());
  await page.evaluate(() => roomCalls[1].reject(new Error("simulated failure")));
  await page.getByRole("alert").waitFor();
  assert.equal(await input.inputValue(), " demo-2seats ");
  await button(page, "Join Room").click();
  await page.evaluate(() => roomCalls[2].resolve());
  await page.waitForURL("**/#watch-room");
});

test("leaving Home invalidates outstanding creation and join results", async t => {
  const page = await visitWithDeferredRooms(t);
  await button(page, "Create Room").click();
  await button(page, "Guide").click();
  await button(page, "Back").click();
  await button(page, "Create Room").click();
  assert.ok(await page.evaluate(() => roomCalls[0].signal.aborted));
  await page.evaluate(() => roomCalls[0].resolve("DEMO-STALE1"));
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.ok(await button(page, "Creating demo…").isDisabled());
  await page.evaluate(() => roomCalls[1].resolve("DEMO-2SEATS"));
  await button(page, "Close dialog").click();
  const input = page.getByLabel("Room code", {exact:true});
  await input.fill("demo-2seats");
  await input.press("Enter");
  await page.getByRole("link", {name:"Log In", exact:true}).click();
  await page.getByRole("heading", {name:"Welcome back"}).waitFor();
  assert.ok(await page.evaluate(() => roomCalls[2].signal.aborted));
  await page.evaluate(() => roomCalls[2].resolve());
  assert.equal(new URL(page.url()).hash, "#login");
  await page.goBack();
  await button(page, "Create Room").waitFor();
  assert.equal(await page.getByRole("alert").count(), 0);
});

test("media preparation clamps progress and ignores callbacks from superseded attempts", async t => {
  const page = await visit(t);
  const result = await page.evaluate(async () => {
    const {createMediaPreparation} = await import("/src/components/watch-room/mediaPreparation.ts");
    const states = [];
    const media = createMediaPreparation(state => states.push(state));
    const firstFile = new File([], "same.mp4");
    const first = media.begin(firstFile);
    const duplicate = media.begin(firstFile);
    for (const value of [-8, 23.6, 140, NaN, Infinity]) first.progress(value);
    // Release this successful reply only after a different file with the same name was selected.
    let release;
    const lateReply = new Promise(resolve => { release = resolve; }).then(() => {
      first.progress(55);
      first.ready();
      first.fail("obsolete");
    });
    const second = media.begin(new File([], firstFile.name));
    release();
    await lateReply;
    media.cancel();
    second.progress(85);
    second.ready();
    const third = media.begin(firstFile);
    third.fail("mock failure");
    const retry = media.begin(firstFile);
    retry.ready();
    retry.progress(12);
    return {states, duplicate, replaced: first.signal.aborted, canceled: second.signal.aborted};
  });
  assert.equal(result.duplicate, null);
  assert.ok(result.replaced && result.canceled);
  assert.deepEqual(result.states.map(s => s.kind === "uploading" ? s.progress : s.kind),
    [0, 0, 24, 100, 0, 0, 0, "canceled", 0, "error", 0, "ready"]);
  assert.equal(result.states.at(-3).message, "mock failure");
});

test("closing the diagnostic dialog invalidates pending preparation callbacks", async t => {
  const page = await visit(t, "?diagnostics=1#watch-room");
  // Observe the real controller through the dialog's mount and cleanup.
  await page.route("**/src/components/watch-room/mediaPreparation.ts", route => route.fulfill({
    contentType: "text/javascript", body: `
      import { createMediaPreparation as create } from "./mediaPreparation.ts?original";
      export { normalizeProgress } from "./mediaPreparation.ts?original";
      export function createMediaPreparation(publish) {
        const media = create(state => { window.updates++; publish(state); });
        return { ...media, begin(file) {
          const attempt = media.begin(file);
          window.lastAttempt = attempt;
          return attempt;
        }};
      }
    `,
  }));
  await page.reload();
  await page.evaluate(() => { window.updates = 0; });
  const open = button(page, "Preview video UI states");
  await open.click();
  await button(page, "Use sample video").click();
  const state = page.getByLabel("Preview state");
  await button(page, "Cancel demo upload").click();
  assert.equal(await state.inputValue(), "canceled");
  assert.ok(await focused(state));
  await button(page, "Retry demo").click();
  const updates = await page.evaluate(() => window.updates);
  await page.keyboard.press("Escape");
  assert.ok(await focused(open));
  assert.ok(await page.evaluate(() => window.lastAttempt.signal.aborted));
  await page.evaluate(() => {
    window.lastAttempt.progress(75);
    window.lastAttempt.fail("late failure");
    window.lastAttempt.ready();
  });
  assert.equal(await page.evaluate(() => window.updates), updates);
  await open.click();
  assert.equal(await state.inputValue(), "empty");
});

test("previewing every synchronization state leaves local media and preferences intact", async t => {
  const page = await visit(t, "?diagnostics=1#watch-room", 390, 844);
  await page.getByLabel("Choose a local video file").setInputFiles(clip);
  await page.waitForFunction(() => document.querySelector("video")?.duration > 0);
  await page.getByRole("slider", {name:"Video volume"}).press("ArrowLeft");
  await page.getByRole("slider", {name:"Video timeline"}).press("ArrowRight");
  await button(page, "Playback settings").click();
  const panel = page.getByRole("dialog", {name:"Playback settings"});
  await panel.getByRole("button", {name:/Playback speed/}).click();
  await panel.getByRole("slider", {name:"Playback speed"}).press("ArrowRight");
  await button(panel, "Back to playback settings").click();
  await panel.getByRole("button", {name:/Brightness/}).click();
  await panel.getByRole("slider", {name:"Brightness"}).press("Home");
  await button(panel, "Back to playback settings").click();
  await button(panel, "Loop video").click();
  await page.keyboard.press("Escape");
  const readMedia = () => page.locator("video").evaluate(v =>
    [v.currentSrc, v.currentTime, v.paused, v.volume, v.muted, v.playbackRate, v.loop, getComputedStyle(v).filter]);
  const original = await readMedia();
  assert.deepEqual(original.slice(-3), [1.25, true, "brightness(0.5)"]);
  const open = button(page, "Preview video UI states");
  await open.click();
  const sync = page.getByRole("combobox", {name:/Playback sync preview/});
  const states = ["local-only", "connecting", "connected", "synchronizing", "disconnected", "reconnecting", "error"];
  assert.equal(await sync.inputValue(), "local-only");
  assert.deepEqual(await sync.locator("option").evaluateAll(opts => opts.map(option => option.value)), states);
  for (const state of states) {
    await sync.selectOption(state);
    assert.equal(await sync.inputValue(), state);
    assert.deepEqual(await readMedia(), original);
  }
  await sync.press("Escape");
  assert.ok(await focused(open));
  await open.click();
  assert.equal(await sync.inputValue(), "local-only");
});
