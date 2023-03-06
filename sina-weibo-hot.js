const textFormat = {
  defaultText: { size: 14, color: "ffffff", font: "regular" },
  battery: { size: 10, color: "", font: "bold" },
  title: { size: 16, color: "", font: "semibold" },
  SFMono: { size: 12, color: "ffffff", font: "SF Mono" }
}
/**
 * @description Provide a font based on the input.
 * @param {*} fontName 
 * @param {*} fontSize 
 */
const provideFont = (fontName, fontSize) => {
  const fontGenerator = {
    "ultralight": function () { return Font.ultraLightSystemFont(fontSize) },
    "light": function () { return Font.lightSystemFont(fontSize) },
    "regular": function () { return Font.regularSystemFont(fontSize) },
    "medium": function () { return Font.mediumSystemFont(fontSize) },
    "semibold": function () { return Font.semiboldSystemFont(fontSize) },
    "bold": function () { return Font.boldSystemFont(fontSize) },
    "heavy": function () { return Font.heavySystemFont(fontSize) },
    "black": function () { return Font.blackSystemFont(fontSize) },
    "italic": function () { return Font.italicSystemFont(fontSize) }
  }

  const systemFont = fontGenerator[fontName]
  if (systemFont) { return systemFont() }
  return new Font(fontName, fontSize)
}
/**
 * @description Add formatted text to a container.
 * @param {*} string 
 * @param {*} container widget container
 * @param {*} format Object: size, color, font
 */
const provideText = (string, container, format) => {
  let url
  if (typeof string !== 'string') {
    url = string.url
    string = string.text
  }
  const stackItem = container.addStack()

  if (url) {
    stackItem.url = url
  }

  const textItem = stackItem.addText(string)
  const textFont = format.font || textFormat.defaultText.font
  const textSize = format.size || textFormat.defaultText.size
  const textColor = format.color || textFormat.defaultText.color

  textItem.font = provideFont(textFont, textSize)
  textItem.textColor = new Color(textColor)
  return stackItem
}

/**
 * @description 返回电池百分比
 */
const renderBattery = () => {
  const batteryLevel = Device.batteryLevel()
  const batteryAscii = `${Math.round(batteryLevel * 100)}%`
  return batteryAscii
}

// Add a battery element to the widget; consisting of a battery icon and percentage.
function battery(column, title) {
  const batteryLevel = Device.batteryLevel()
  // Set up the battery level item
  let batteryStack = column.addStack()
  provideText(title, batteryStack, textFormat.title)
  batteryStack.centerAlignContent()
  batteryStack.addSpacer()
  let batteryIcon = batteryStack.addImage(provideBatteryIcon())
  batteryIcon.imageSize = new Size(20, 20)
  // Change the battery icon to red if battery level is <= 20 to match system behavior
  if (Math.round(batteryLevel * 100) > 20 || Device.isCharging()) {
    batteryIcon.tintColor = Color.white()
  } else {
    batteryIcon.tintColor = Color.red()
  }
  // Display the battery status
  let batteryInfo = provideText('  ' + renderBattery(), batteryStack, textFormat.battery)
}
// Provide a battery SFSymbol with accurate level drawn on top of it.
function provideBatteryIcon() {
  if (Device.isCharging()) { return SFSymbol.named("battery.100.bolt").image }
  // Set the size of the battery icon.
  const batteryWidth = 87
  const batteryHeight = 41
  // Start our draw context.
  let draw = new DrawContext()
  draw.opaque = false
  draw.respectScreenScale = true
  draw.size = new Size(batteryWidth, batteryHeight)
  // Draw the battery.
  draw.drawImageInRect(SFSymbol.named("battery.0").image, new Rect(0, 0, batteryWidth, batteryHeight))
  // Match the battery level values to the SFSymbol.
  const x = batteryWidth * 0.1525
  const y = batteryHeight * 0.247
  const width = batteryWidth * 0.602
  const height = batteryHeight * 0.505
  // Prevent unreadable icons.
  let level = Device.batteryLevel()
  if (level < 0.05) { level = 0.05 }
  // Determine the width and radius of the battery level.
  const current = width * level
  let radius = height / 6.5
  // When it gets low, adjust the radius to match.
  if (current < (radius * 2)) { radius = current / 2 }
  // Make the path for the battery level.
  let barPath = new Path()
  barPath.addRoundedRect(new Rect(x, y, current, height), radius, radius)
  draw.addPath(barPath)
  draw.setFillColor(Color.black())
  draw.fillPath()
  return draw.getImage()
}
const API_ENDPOINT = "https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot"
const API_FUN_ENDPOINT = "https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Dfun"

/**
 * Description: 新浪微博热搜
 */
let items = await loadItems()
let widget = await createWidget(items)
// Check if the script is running in
// a widget. If not, show a preview of
// the widget to easier debug it.
if (!config.runsInWidget) {
  await widget.presentLarge()
}
// Tell the system to show the widget.
Script.setWidget(widget)
Script.complete()
function weiboIconRenderer(url) {
  if (!url) return ""
  if (url.indexOf("new") > -1) return "[新]";
  if (url.indexOf("fei") > -1) return "[沸]";
  if (url.indexOf("hot") > -1) return "[热]";
  if (url.indexOf("boom") > -1) return "[💥]";
  return ""
}

async function createWidget(items) {
  let item = items[0].card_group
  const exceptions = await loadExceptions(1000000)
  const list = item.filter((i, idx) => {
    if (
      !i.promotion// 非推广热搜
      && !(i.desc_extr && typeof i.desc_extr === "string" && ["剧集", "综艺", "盛典"].includes(i.desc_extr.split(" ")[0])) // 非“剧集”、“综艺”类型热搜
      && !exceptions.includes(i.desc) // 或者从文娱榜里剔除了阅读量 < 100w的
    ) {
      return i
    }
  })
  // 去掉第一个置顶热搜，因为一般是人工设置的，非事件性的
  list.shift()
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color("#ff5858"),
    new Color("#f09819")
  ]
  let w = new ListWidget()
  w.setPadding(-3, 15, 5, 15)
  w.backgroundGradient = gradient
  // Add spacer above content to center it vertically.
  w.addSpacer()
  // const title = w.addText('微博热搜')
  // title.font = Font.boldSystemFont(16)
  // title.textColor = new Color('#f9d423')
  // title.centerAlignText()
  battery(w, '微博热搜')
  w.addSpacer(5)
  list.forEach((i, idx) => {
    if (idx < 18) {
      const titleTxt = w.addText("· " + weiboIconRenderer(i.icon) + i.desc)
      titleTxt.font = Font.boldSystemFont(14)
      titleTxt.textColor = Color.white()
      titleTxt.url = i.scheme
    }
  })
  // Add spacing below content to center it vertically.
  w.addSpacer()
  return w
}

async function loadItems() {
  let url = API_ENDPOINT
  let req = new Request(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
    }
  })
  let json = await req.loadJSON()
  return (json.data && json.data.cards && Array.isArray(json.data.cards)) ? json.data.cards : []
}
async function loadExceptions(keepNum) {
  let exceptReq = await new Request(API_FUN_ENDPOINT, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
    }
  })
  let json = await exceptReq.loadJSON()
  return json.data.cards.map(card => {
    if(typeof card.desc_extr === "string") card.desc_extr = parseInt(card.desc_extr.split(" ")[1])
    if(card.desc_extr === NaN) card.desc_extr = 0;
    if(card.desc_extr < keepNum) return card.desc;
    return ""
  })
}
