const TRACE = 0
const INFO = 1
const WARNING = 2

function log(s, level = "INFO") {
	if (level == "INFO")
		console.log(`${new Date().toISOString()} ${s}`)
}

module.exports = { log }
