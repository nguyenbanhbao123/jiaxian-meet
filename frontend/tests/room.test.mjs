import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const clip = fileURLToPath(new URL("./fixtures/local-video.webm", import.meta.url));
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
  await page.getByRole("button", {name:/Playback speed/}).click();
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
  const page = await visit(t, "#watch-room");
  const mic = button(page, "Preview microphone");
  await mic.click();
  assert.equal(await mic.getAttribute("aria-pressed"), "true");
  await page.getByText("No audio connection").waitFor();
  await button(page, "Sample participants").click();
  await page.getByText("· Sample guest").waitFor();
  await page.keyboard.press("Tab");
  assert.ok(await page.evaluate(() => !!document.activeElement.closest("dialog")));
  await page.keyboard.press("Escape");
  const settings = button(page, "Room settings");
  await settings.click();
  const theaterSetting = page.getByRole("dialog").getByRole("button", {name:"Theater view"});
  await theaterSetting.click();
  assert.equal(await theaterSetting.getAttribute("aria-pressed"), "true");
  await theaterSetting.click();
  await button(page, "Preview video UI states").click();
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
  assert.ok(await focused(settings));
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
      assert.ok(await page.getByLabel("Email Address").isEditable());
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
    const requests = [];
    page.on("request", r => { if (["xhr","fetch","document"].includes(r.resourceType())) requests.push(r.url()); });
    await page.getByLabel("Email Address").fill("viewer@example.invalid");
    await page.getByLabel("Password", {exact:true}).fill("local-test-example");
    await page.locator("form button[type=submit]").click();
    for (const provider of ["Google","Apple"]) await page.getByRole("button", {name: new RegExp("Continue with " + provider + "$")}).click();
    await heading("Welcome back").waitFor();
    await button(page,"Sign Up").first().click();
    await page.getByLabel("Name", {exact:true}).fill("Viewer");
    await button(page,"Create Account").click();
    await heading("Create your account").waitFor();
    assert.deepEqual(requests, []);
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
