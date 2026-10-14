// ddax — drive the native macOS Diamond District app through the Accessibility API.
// Nothing here moves the user's cursor or needs the window in front.
//   ddax ls [filter]            numbered list of visible elements (role, label, frame, actions)
//   ddax text                   static texts only, in tree order (read the screen)
//   ddax press "<query>" [nth] [--times N]  AXPress the nth pressable element whose label contains query
//   ddax pressat X Y            AXPress the smallest pressable element containing screen point X,Y
//   ddax set "<query>" "text"   set the value of the text field matched by query (or @X,Y)
//   ddax scroll X Y down|up|top|bottom [n]   page-scroll the scroll area under X,Y
//   ddax click X Y [--drag X2 Y2]   REAL mouse, politely: waits until the user has been idle ≥ DDAX_IDLE s (default 2),
//                               clicks (or drags), then restores the cursor and the previously frontmost app (~0.3 s)
//   ddax catalog [limit] [skip]  (Karat workshop open, no gems placed) place → select → read COL/ORI/CLA → remove,
//                               for every library row; prints TSV: carat type cut colour origin clarity
//   ddax shot out.png           capture the game window (works when it's behind other windows)
import Cocoa

func die(_ s: String) -> Never { print(s); exit(1) }
guard let app = NSRunningApplication.runningApplications(withBundleIdentifier: "geek.Gemstone-Restore").first
else { die("NOAPP: Diamond District isn't running") }
let pid = app.processIdentifier
let root = AXUIElementCreateApplication(pid)
AXUIElementSetMessagingTimeout(root, 3)

func attr(_ e: AXUIElement, _ n: String) -> AnyObject? { var v: AnyObject?; AXUIElementCopyAttributeValue(e, n as CFString, &v); return v }
func str(_ e: AXUIElement, _ n: String) -> String { (attr(e, n) as? String) ?? "" }
func actions(_ e: AXUIElement) -> [String] { var n: CFArray?; AXUIElementCopyActionNames(e, &n); return (n as? [String]) ?? [] }
func frame(_ e: AXUIElement) -> CGRect? {
    guard let p = attr(e, "AXPosition"), let z = attr(e, "AXSize") else { return nil }
    var pt = CGPoint(), sz = CGSize()
    AXValueGetValue(p as! AXValue, .cgPoint, &pt); AXValueGetValue(z as! AXValue, .cgSize, &sz)
    return CGRect(origin: pt, size: sz)
}
func label(_ e: AXUIElement) -> String {
    var parts: [String] = []
    for n in ["AXTitle", "AXDescription", "AXValue", "AXPlaceholderValue"] {
        if let v = attr(e, n) { let s = "\(v)"; if !s.isEmpty && !parts.contains(s) { parts.append(s) } }
    }
    let id = str(e, "AXIdentifier")
    if !id.isEmpty && id.count < 40 { parts.append("#" + id) }
    return parts.joined(separator: " | ")
}
struct El { let e: AXUIElement; let role: String; let label: String; let f: CGRect?; let acts: [String] }
func all() -> [El] {
    var out: [El] = []
    func walk(_ e: AXUIElement, _ d: Int) {
        let role = str(e, "AXRole")
        if role == "AXMenuBar" || d > 40 { return }
        out.append(El(e: e, role: role, label: label(e), f: frame(e), acts: actions(e)))
        if let k = attr(e, "AXChildren") as? [AXUIElement] { for c in k { walk(c, d + 1) } }
    }
    walk(root, 0)
    return out
}
func fr(_ f: CGRect?) -> String { guard let f = f else { return "" }; return "[\(Int(f.minX)),\(Int(f.minY)) \(Int(f.width))x\(Int(f.height))]" }
let a = Array(CommandLine.arguments.dropFirst())
guard let cmd = a.first else { die("usage: ddax ls|text|press|pressat|set|scroll|shot …") }

switch cmd {
case "ls":
    let q = a.count > 1 ? a[1].lowercased() : ""
    for (i, x) in all().enumerated() {
        let pressable = x.acts.contains("AXPress")
        if x.label.isEmpty && !pressable && !x.role.contains("Scroll") && !x.role.contains("Text") { continue }
        let line = "\(i) \(x.role.replacingOccurrences(of: "AX", with: "")) \(x.label.prefix(110)) \(fr(x.f))\(pressable ? " P" : "")"
        if q.isEmpty || line.lowercased().contains(q) { print(line) }
    }
case "text":
    var last = ""
    for x in all() where x.role == "AXStaticText" || x.role == "AXTextField" || x.role == "AXTextArea" {
        let s = x.label; if s.isEmpty || s == last { continue }
        print(x.role == "AXStaticText" ? s : "[\(x.role.dropFirst(2)): \(s)]"); last = s
    }
case "press":
    guard a.count > 1 else { die("press needs a query") }
    let q = a[1].lowercased(); let nth = a.count > 2 ? Int(a[2]) ?? 0 : 0
    let hits = all().filter { $0.acts.contains("AXPress") && $0.label.lowercased().contains(q) }
    guard nth < hits.count else { die("NOHIT '\(a[1])' (\(hits.count) matches)") }
    let times = a.count > 4 && a[3] == "--times" ? Int(a[4]) ?? 1 : 1
    var r = AXError.success
    for _ in 0..<times { r = AXUIElementPerformAction(hits[nth].e, "AXPress" as CFString); if times > 1 { usleep(60_000) } }
    print(r == .success ? "pressed '\(hits[nth].label.prefix(60))' \(fr(hits[nth].f)) [\(nth + 1)/\(hits.count)]\(times > 1 ? " ×\(times)" : "")" : "FAIL \(r.rawValue)")
case "pressat":
    guard a.count > 2, let x = Double(a[1]), let y = Double(a[2]) else { die("pressat X Y") }
    let p = CGPoint(x: x, y: y)
    let hits = all().filter { $0.acts.contains("AXPress") && ($0.f?.contains(p) ?? false) }
        .sorted { ($0.f!.width * $0.f!.height) < ($1.f!.width * $1.f!.height) }
    guard let h = hits.first else { die("NOHIT at \(Int(x)),\(Int(y))") }
    let r = AXUIElementPerformAction(h.e, "AXPress" as CFString)
    print(r == .success ? "pressed '\(h.label.prefix(60))' \(fr(h.f))" : "FAIL \(r.rawValue)")
case "set":
    guard a.count > 2 else { die("set \"<query>|@X,Y\" \"text\"") }
    let fields = all().filter { ["AXTextField", "AXTextArea", "AXComboBox", "AXSearchField"].contains($0.role) }
    var target: El?
    if a[1].hasPrefix("@") {
        let c = a[1].dropFirst().split(separator: ",").compactMap { Double($0) }
        target = fields.first { $0.f?.contains(CGPoint(x: c[0], y: c[1])) ?? false }
    } else { target = fields.first { $0.label.lowercased().contains(a[1].lowercased()) } ?? (a[1] == "*" ? fields.first : nil) }
    guard let t = target else { die("NOFIELD (\(fields.map { $0.label }.joined(separator: " ; ")))") }
    AXUIElementSetAttributeValue(t.e, "AXFocused" as CFString, kCFBooleanTrue)
    let r = AXUIElementSetAttributeValue(t.e, "AXValue" as CFString, a[2] as CFString)
    print(r == .success ? "set → '\(str(t.e, "AXValue"))'" : "FAIL \(r.rawValue)")
    if a.count > 3 && a[3] == "--enter" {
        usleep(150_000)
        let c = AXUIElementPerformAction(t.e, "AXConfirm" as CFString)
        if c != .success {   // fall back: Return key to the app process
            for down in [true, false] { let k = CGEvent(keyboardEventSource: nil, virtualKey: 36, keyDown: down)!; k.postToPid(pid); usleep(40_000) }
            print("enter via key event (AXConfirm \(c.rawValue))")
        } else { print("enter via AXConfirm") }
    }
case "scroll":
    guard a.count > 3, let x = Double(a[1]), let y = Double(a[2]) else { die("scroll X Y down|up|top|bottom [n]") }
    let p = CGPoint(x: x, y: y); let n = a.count > 4 ? Int(a[4]) ?? 1 : 1
    let acts: [String: String] = ["down": "AXScrollDownByPage", "up": "AXScrollUpByPage", "left": "AXScrollLeftByPage", "right": "AXScrollRightByPage",
               "top": "AXScrollToTop", "bottom": "AXScrollToBottom"]
    guard let act = acts[a[3]] else { die("bad direction") }
    let hits = all().filter { $0.acts.contains(act) && ($0.f?.contains(p) ?? false) }
        .sorted { ($0.f!.width * $0.f!.height) < ($1.f!.width * $1.f!.height) }
    guard let h = hits.first else { die("NOSCROLL at \(Int(x)),\(Int(y)) for \(act)") }
    for _ in 0..<n { AXUIElementPerformAction(h.e, act as CFString); usleep(250_000) }
    print("scrolled \(a[3]) ×\(n) \(fr(h.f))")
case "shot":
    // Captures every on-screen game window and composites them over the main one (child panels like Karat are separate windows).
    let out = a.count > 1 ? a[1] : "/tmp/ddmac.png"
    let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly], kCGNullWindowID) as! [[String: Any]]
    let wins = list.filter { ($0["kCGWindowOwnerPID"] as? Int32) == pid && ($0["kCGWindowLayer"] as? Int) == 0 }
    guard !wins.isEmpty else { die("NOWINDOW") }
    var spec: [String] = []
    for (i, w) in wins.reversed().enumerated() {   // back to front
        let b = w["kCGWindowBounds"] as! [String: Any]
        let f = "/tmp/ddax_w\(i).png"
        let t = Process(); t.launchPath = "/usr/sbin/screencapture"; t.arguments = ["-x", "-o", "-l", "\(w["kCGWindowNumber"]!)", f]
        t.launch(); t.waitUntilExit()
        spec.append("\(f),\(b["X"]!),\(b["Y"]!),\(b["Width"]!),\(b["Height"]!)")
    }
    let py = """
import sys
from PIL import Image
out, specs = sys.argv[1], [s.split(',') for s in sys.argv[2:]]
big = max(specs, key=lambda s: float(s[3]) * float(s[4]))
ox, oy, W, H = (float(v) for v in big[1:])
canvas = Image.new('RGB', (int(W * 2), int(H * 2)), (0, 0, 0))
for f, x, y, w, h in specs:
    im = Image.open(f).convert('RGBA')
    im = im.resize((int(float(w) * 2), int(float(h) * 2)))
    canvas.paste(im, (int((float(x) - ox) * 2), int((float(y) - oy) * 2)), im)
canvas.save(out)
print(f'saved {out} origin {ox:.0f},{oy:.0f} {W:.0f}x{H:.0f} pt (image px = 2x points; screen = origin + px/2)')
"""
    let t = Process(); t.launchPath = "/usr/bin/env"; t.arguments = ["python3", "-c", py, out] + spec
    t.launch(); t.waitUntilExit()
case "catalog":
    let limit = a.count > 1 ? Int(a[1]) ?? 100000 : 100000
    let skip = a.count > 2 ? Int(a[2]) ?? 0 : 0
    func press(_ e: AXUIElement) { AXUIElementPerformAction(e, "AXPress" as CFString) }
    func settle() { usleep(300_000) }
    guard let win = (attr(root, "AXWindows") as? [AXUIElement])?.first(where: { (frame($0)?.width ?? 0) > 1000 }) else { die("NOWINDOW") }
    let everything = all()
    guard let props = everything.first(where: { $0.role == "AXScrollArea" && ($0.f?.width ?? 0) > 300 && ($0.f?.width ?? 0) < 340 && ($0.f?.height ?? 0) > 600 })?.e
    else { die("NOPROPS: open the Karat workshop first") }
    // Fast walk: whole window except the library rows (inside props, stop once LIBRARY is reached).
    func quick() -> [El] {
        var out: [El] = []; var stop = false
        func walk(_ e: AXUIElement, _ d: Int, _ inProps: Bool) {
            if d > 30 { return }
            if !inProps && CFEqual(e, props) { return }
            if inProps && stop { return }
            let role = str(e, "AXRole"); let lab = label(e)
            if inProps && role == "AXButton" && lab.hasPrefix("LIBRARY") { stop = true; return }
            out.append(El(e: e, role: role, label: lab, f: nil, acts: []))
            if let k = attr(e, "AXChildren") as? [AXUIElement] { for c in k { walk(c, d + 1, inProps) } }
        }
        walk(win, 0, false); walk(props, 0, true)
        return out
    }
    let libRows = everything.filter { $0.role == "AXButton" && $0.label.range(of: #"^\d+\.\d+ct \w+, \w"#, options: .regularExpression) != nil && !$0.label.contains(" · y ") }
    func findRow(_ lab: String, _ k: Int) -> AXUIElement? {
        var n = 0; var hit: AXUIElement?
        func walk(_ e: AXUIElement, _ d: Int) {
            if hit != nil || d > 30 { return }
            if str(e, "AXRole") == "AXButton" && label(e) == lab { if n == k { hit = e; return }; n += 1 }
            if let c = attr(e, "AXChildren") as? [AXUIElement] { for x in c { walk(x, d + 1) } }
        }
        walk(props, 0)
        return hit
    }
    // DDAX_ONLY=<file of labels, one per line>: only catalogue those rows (retry pass for misses)
    var only: [String: Int]? = nil
    if let f = ProcessInfo.processInfo.environment["DDAX_ONLY"], let txt = try? String(contentsOfFile: f, encoding: .utf8) {
        only = [:]; for l in txt.split(separator: "\n") where !l.isEmpty { only![String(l), default: 0] += 1 }
    }
    var seen: [String: Int] = [:]; var done = 0
    print("carat\ttype\tcut\tcolour\torigin\tclarity")
    for (i, row) in libRows.enumerated() {
        let lab = row.label
        let k = seen[lab, default: 0]; seen[lab] = k + 1
        if i < skip { continue }
        if done >= limit { break }
        if only != nil { if (only![lab] ?? 0) <= 0 { continue }; only![lab]! -= 1 }
        // cached row handle first; if the list re-created it, fall back to a fresh lookup
        if AXUIElementPerformAction(row.e, "AXPress" as CFString) != .success {
            guard let r = findRow(lab, k) else { print("MISS\t\(lab)"); done += 1; continue }
            press(r)
        }
        settle()
        guard let layer = quick().first(where: { $0.role == "AXButton" && $0.label.contains(" · y ") }) else { print("NOLAYER\t\(lab)"); continue }
        press(layer.e); settle()
        let els = quick(); let texts = els.filter { $0.role == "AXStaticText" }.map { $0.label }
        func after(_ key: String) -> String { if let j = texts.firstIndex(of: key), j + 1 < texts.count { return texts[j + 1] }; return "?" }
        let parts = lab.components(separatedBy: ", "); let head = parts[0].components(separatedBy: "ct ")
        print("\(head[0])\t\(head.count > 1 ? head[1] : "?")\t\(parts.count > 1 ? parts[1] : "?")\t\(after("COL"))\t\(after("ORI"))\t\(after("CLA"))")
        fflush(stdout)
        guard let rm = els.first(where: { $0.role == "AXButton" && $0.label == "REMOVE" }) else { print("NOREMOVE — stopping"); exit(1) }
        press(rm.e); settle()
        if !quick().contains(where: { $0.label.hasPrefix("LAYERS · 0") }) {
            if let l = quick().first(where: { $0.role == "AXButton" && $0.label.contains(" · y ") }) { press(l.e); settle() }
            if let r2 = quick().first(where: { $0.label == "REMOVE" }) { press(r2.e); settle() }
            if !quick().contains(where: { $0.label.hasPrefix("LAYERS · 0") }) { print("STUCK — a gem is still placed; stopping at row \(i)"); exit(1) }
        }
        done += 1
    }
case "click":
    guard a.count > 2, let x = Double(a[1]), let y = Double(a[2]) else { die("click X Y [--drag X2 Y2]") }
    let need = Double(ProcessInfo.processInfo.environment["DDAX_IDLE"] ?? "2") ?? 2
    let anyInput = CGEventType(rawValue: ~0)!
    var waited = 0.0
    while CGEventSource.secondsSinceLastEventType(.hidSystemState, eventType: anyInput) < need && waited < 120 { usleep(200_000); waited += 0.2 }
    let prev = NSWorkspace.shared.frontmostApplication
    let home = CGEvent(source: nil)!.location
    let p = CGPoint(x: x, y: y)
    let drag = a.count > 5 && a[3] == "--drag" ? CGPoint(x: Double(a[4])!, y: Double(a[5])!) : nil
    func m(_ t: CGEventType, _ q: CGPoint) { CGEvent(mouseEventSource: nil, mouseType: t, mouseCursorPosition: q, mouseButton: .left)!.post(tap: .cghidEventTap) }
    if prev?.processIdentifier != pid { app.activate(options: []); usleep(150_000) }
    m(.mouseMoved, p); usleep(40_000); m(.leftMouseDown, p); usleep(60_000)
    if let d = drag {
        for i in 1...20 { let t = Double(i) / 20; m(.leftMouseDragged, CGPoint(x: p.x + (d.x - p.x) * t, y: p.y + (d.y - p.y) * t)); usleep(20_000) }
        m(.leftMouseUp, d)
    } else { m(.leftMouseUp, p) }
    usleep(60_000)
    CGWarpMouseCursorPosition(home); CGAssociateMouseAndMouseCursorPosition(1)
    if let pr = prev, pr.processIdentifier != pid { pr.activate(options: []) }
    print("clicked \(Int(x)),\(Int(y))\(drag != nil ? " → drag" : "") (waited \(String(format: "%.1f", waited))s for idle; restored cursor + \(prev?.localizedName ?? "?"))")
default: die("unknown command \(cmd)")
}
