interface Subtitle {
	start : number
	end   : number
	text  : string
}

function parseLine(line: string): Subtitle {
	const dialogue = line.split("\n")
	const timestamp = dialogue.splice(0,1)[0]
	const text = dialogue.join("\n")

	// parse timestamp
	const [ start, end ] = timestamp.split(" --> ").map(e => new Date('1970-01-01T' + e + 'Z').getTime())
	
	return {
		start, end, text
	}
}

export class SubtitleParser {
	subs: Subtitle[] = []

	constructor() {}

	async importFile(path:string) {
		let txt = await Bun.file(path).text()
		this.subs = txt.split("\n\n").map(parseLine)
		return this
	}

	lookupTime(time: number): Subtitle[] {
		return this.subs.filter(sub => time >= sub.start && time < sub.end)
	}
}
