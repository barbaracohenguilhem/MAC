// molddraw — post synthetic mouse events over the iPhone Mirroring window.
//   molddraw drag <cx> <cy>   (reads "x y" lines from stdin; y points UP; offsets from cx,cy)
//   molddraw tap  <x>  <y>
import Foundation
import CoreGraphics

func post(_ type: CGEventType, _ p: CGPoint) {
    let e = CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: p, mouseButton: .left)!
    e.post(tap: .cghidEventTap)
}
func tap(_ p: CGPoint) {
    for _ in 0..<3 { post(.mouseMoved, p); usleep(100_000) }
    post(.leftMouseDown, p); usleep(80_000)
    post(.leftMouseUp, p); usleep(250_000)
}
func drag(_ pts: [CGPoint]) {
    guard let first = pts.first else { return }
    // settle the hover position first: after a tap elsewhere, iPhone Mirroring
    // otherwise anchors the touch at the previous location and drops the stroke
    for _ in 0..<4 { post(.mouseMoved, first); usleep(120_000) }
    usleep(300_000)
    post(.leftMouseDown, first); usleep(150_000)
    // MOLD_DRAG_US slows the stroke; iPhone Mirroring coalesces fast drags and cuts corners
    let gap = UInt32(ProcessInfo.processInfo.environment["MOLD_DRAG_US"] ?? "") ?? 9_000
    for p in pts { post(.leftMouseDragged, p); usleep(gap) }
    post(.leftMouseDragged, first); usleep(120_000)   // close the outline
    post(.leftMouseUp, first); usleep(300_000)
}

let a = CommandLine.arguments
// Politeness: before any input command wait until the user has been idle ≥ MOLD_IDLE s (default 3; 0 = off),
// and put their cursor back afterwards, so phone play can share the Mac with a person.
let restoreTo = CGEvent(source: nil)?.location
if a.count >= 2 && a[1] != "check" {
    let need = Double(ProcessInfo.processInfo.environment["MOLD_IDLE"] ?? "3") ?? 3
    var waited = 0.0
    while need > 0 && CGEventSource.secondsSinceLastEventType(.hidSystemState, eventType: CGEventType(rawValue: ~0)!) < need && waited < 300 {
        usleep(250_000); waited += 0.25
    }
    atexit { if let p = CGEvent(source: nil)?.location, let r = restoreTo, p != r { CGWarpMouseCursorPosition(r) } }
}
if a.count >= 2 && a[1] == "check" {   // can this process post events? (needs Accessibility)
    print(CGPreflightPostEventAccess() ? "ok" : "denied"); exit(0)
}
guard a.count >= 4, let x = Double(a[2]), let y = Double(a[3]) else {
    FileHandle.standardError.write("usage: molddraw drag <cx> <cy> < points | molddraw tap <x> <y> | molddraw swipe <x1> <y1> <x2> <y2> [ms]\n".data(using: .utf8)!)
    exit(2)
}
switch a[1] {
case "tap":
    tap(CGPoint(x: x, y: y))
case "scroll":
    // scroll <x> <y> <dy> [dx]  — wheel-scroll at a point; positive dy = content moves up (finger swipe up),
    // positive dx = content moves left (finger swipe left)
    guard a.count >= 5, let dy = Double(a[4]) else { exit(2) }
    let dx = a.count >= 6 ? (Double(a[5]) ?? 0) : 0
    let p = CGPoint(x: x, y: y)
    for _ in 0..<3 { post(.mouseMoved, p); usleep(80_000) }
    let steps = max(1, Int(max(abs(dy), abs(dx)) / 10))
    let per = Int32(-dy / Double(steps)), perX = Int32(-dx / Double(steps))
    for _ in 0..<steps {
        if let e = CGEvent(scrollWheelEvent2Source: nil, units: .pixel, wheelCount: 2, wheel1: per, wheel2: perX, wheel3: 0) {
            e.location = p
            e.post(tap: .cghidEventTap)
        }
        usleep(12_000)
    }
    usleep(400_000)
case "path":
    // path <x1> <y1> <x2> <y2> [<x3> <y3> ...] [--ms N]  — press at 1, drag through every point, release at last
    var coords: [Double] = []
    var ms = 300.0
    var i = 2
    while i < a.count {
        if a[i] == "--ms", i + 1 < a.count { ms = Double(a[i+1]) ?? ms; i += 2; continue }
        if let v = Double(a[i]) { coords.append(v) }
        i += 1
    }
    guard coords.count >= 4, coords.count % 2 == 0 else { exit(2) }
    var pts: [CGPoint] = []
    for j in stride(from: 0, to: coords.count, by: 2) { pts.append(CGPoint(x: coords[j], y: coords[j+1])) }
    for _ in 0..<3 { post(.mouseMoved, pts[0]); usleep(100_000) }
    post(.leftMouseDown, pts[0]); usleep(120_000)
    for k in 1..<pts.count {
        let s0 = pts[k-1], s1 = pts[k]; let steps = 25
        for t in 1...steps {
            let f = Double(t) / Double(steps)
            post(.leftMouseDragged, CGPoint(x: s0.x + (s1.x - s0.x) * f, y: s0.y + (s1.y - s0.y) * f))
            usleep(UInt32(ms * 1000 / Double(steps)))
        }
        usleep(120_000)
    }
    usleep(150_000)
    post(.leftMouseUp, pts.last!); usleep(300_000)
case "swipe":
    // swipe <x1> <y1> <x2> <y2> [ms] [hold_ms]  — press at 1 (hold), move to 2, release
    guard a.count >= 6, let x2 = Double(a[4]), let y2 = Double(a[5]) else { exit(2) }
    let ms = a.count >= 7 ? (Double(a[6]) ?? 350) : 350
    let hold = a.count >= 8 ? (Double(a[7]) ?? 120) : 120     // ms to hold before moving
    let start = CGPoint(x: x, y: y), end = CGPoint(x: x2, y: y2)
    for _ in 0..<3 { post(.mouseMoved, start); usleep(100_000) }
    post(.leftMouseDown, start); usleep(UInt32(hold * 1000))
    let steps = 40
    for i in 1...steps {
        let t = Double(i) / Double(steps)
        post(.leftMouseDragged, CGPoint(x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t))
        usleep(UInt32(ms * 1000 / Double(steps)))
    }
    usleep(150_000)
    post(.leftMouseUp, end); usleep(300_000)
case "drag":
    var pts: [CGPoint] = []
    while let line = readLine() {
        let parts = line.split(whereSeparator: { $0 == " " || $0 == "\t" || $0 == "," })
        if parts.count >= 2, let px = Double(parts[0]), let py = Double(parts[1]) {
            pts.append(CGPoint(x: x + px, y: y - py))
        }
    }
    drag(pts)
    print("stroke posted: \(pts.count) points")
default:
    exit(2)
}
