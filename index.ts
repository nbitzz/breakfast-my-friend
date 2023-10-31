import type { BunFile, Serve } from "bun"
import { SubtitleParser } from "./lib/subtitles.ts"

const framerate = 10
const multiplier = 3
const clearCode = "\033[2J\033[3J\033[H"
const clearEffectsCode = "\033[n0"
const files: string[] = await Promise.all(
	Array.from(
		{ length: 307 },
		(_, i) => `${__dirname}/wd/frames_txt/${(i + 1).toString().padStart(3, "0")}.txt`
	)
		.map((path) => Bun.file(path))
		.map((file) => file.text())
)
const subs = await new SubtitleParser().importFile(`${__dirname}/wd/subtitles.txt`)

function stream(abort: AbortSignal) {
	let interval: ReturnType<typeof setInterval>
	let frameNumber = 0
	return new ReadableStream({
		start(controller) {
			interval = setInterval(() => {
				if (frameNumber >= files.length || abort.aborted) {
					controller.close()
					return clearInterval(interval)
				}
				controller.enqueue(clearCode)
				controller.enqueue(`${subs.lookupTime(frameNumber/(framerate*multiplier)*1000).map(e=>e.text)[0]?.trim() ?? ""}\n`)
				controller.enqueue(files[Math.floor(frameNumber)])
				frameNumber += multiplier
			}, 1000 / framerate)
		},
		cancel: () => clearInterval(interval),
	})
}

export default {
	fetch(request) {
		if (request.headers.get("user-agent")?.includes("curl"))
			return new Response(stream(request.signal))
		const path = new URL(request.url).pathname
		if (path === "/") return new Response(Bun.file(`${__dirname}/www/index.html`))
		return new Response(Bun.file(`${__dirname}/www${path}`))
	},
	port: process.env.PORT ?? 1028,
} satisfies Serve
