// Reference: https://github.com/brianseidman/scriptable-pocket-widget/blob/main/pocket_widget/pocket_widget_code.js
// Preview: https://github.com/brianseidman/scriptable-pocket-widget/blob/72495ad9cc488b9790bb2ee6eac8dcedcf36dd96/Resources/scriptable-pocket-widget-image.png
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

const API_ENDPOINT = (UID) => `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?offset=&host_mid=${UID}&timezone_offset=-480`

function renderADynamic(w, item) {
    fontArticle = Font.semiboldSystemFont(12),
        lineLimit = 2,
        fontCompany = Font.regularRoundedSystemFont(10),
        grayAttribution = new Color("#949494"),
        imageSize = new Size(40, 40),
        cornerRadius = 5,
        containerRelativeShape = false

    if (data.length == 0) {
        for (mi = 0; mi < 2; mi++) {
            module.exports.filler(widget, mi)
        }
    }

    for (ix = 0; ix < data.length; ix++) {

        let title = module.exports.propertyCheck(data[ix], 'resolved_title'),
            company = module.exports.propertyCheck(data[ix], 'domain_metadata')
        image = module.exports.propertyCheck(data[ix], 'top_image_url'),
            min = module.exports.propertyCheck(data[ix], 'time_to_read')

        if (ix > 0) {
            module.exports.horizontalRule(widget)
        }

        let entryStack = widget.addStack(),
            textStackLeft = entryStack.addStack()
        textStackLeft.layoutVertically()
        textStackLeft.size = textRowSize

        if (title) {
            let textTitle = textStackLeft.addText(data[ix].resolved_title)
            textTitle.font = fontArticle
            textTitle.lineLimit = lineLimit
        }

        if (company) {
            textCompany = data[ix].domain_metadata.name
            textStackLeft.addSpacer(3)

            if (min) {
                var lineCompany = textStackLeft.addText(textCompany + " • " + data[ix].time_to_read + " min read")
            } else {
                var lineCompany = textStackLeft.addText(textCompany)
            }

            lineCompany.font = fontCompany
            lineCompany.lineLimit = lineLimit
            lineCompany.textColor = grayAttribution
        }

        entryStack.addSpacer()

        let imageStack = entryStack.addStack()
        imageStack.size = imageSize
        imageStack.cornerRadius = cornerRadius

        if (image) {
            let loadImage = await(new Request(data[ix].top_image_url)).loadImage()
            imageContainer = imageStack.addImage(loadImage)
            imageContainer.containerRelativeShape = containerRelativeShape
            imageContainer.applyFillingContentMode()
        }

        if (data.length == 1) {
            module.exports.filler(widget)
        }
    }
}
async function loadItems(uid) {
    if (!uid || !args.widgetParameter) throw new Error("UID not defined")
    let url = API_ENDPOINT(uid || args.widgetParameter)
    let req = new Request(url, {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
        }
    })
    let json = await req.loadJSON()
    return json.data.items.slice(0, 2)
}
async function createWidget(items) {
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
    const title = w.addText('Bilibili关注')
    title.font = Font.boldSystemFont(16)
    title.textColor = new Color('#f9d423')
    title.centerAlignText()
    list.forEach((i, idx) => {
        let widget = renderADynamic(i)

    })
    w.addSpacer()
    return w
}

/**
 * Description: Bilibili关注
 */
let items = await loadItems()
let widget = await createWidget(items)
// Check if the script is running in
// a widget. If not, show a preview of
// the widget to easier debug it.
if (!config.runsInWidget) {
    await widget.presentMiddle()
}
// Tell the system to show the widget.
Script.setWidget(widget)
Script.complete()