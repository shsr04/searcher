const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const { execSync } = require('child_process')
const { log } = require('./log')
const CCCC = path.join(__dirname, '..', 'cccc', 'cccc', 'cccc')
const TMP_CODE = path.join(__dirname, '..', 'store', 'code')

function analyzeC(file) {
	let r = {}
	const stats = file + '_stats.xml'
	execSync(`${CCCC} --xml_outfile=${stats} ${file}`, { 'stdio': 'ignore' })
	const $ = cheerio.load(fs.readFileSync(stats))
	r.linesOfCode = Number.parseInt($('project_summary lines_of_code').attr('value'))
	r.comments = Number.parseInt($('project_summary lines_of_comment').attr('value'))
	r.cyclomatic = Number.parseInt($('project_summary McCabes_cyclomatic_complexity').attr('value'))
	fs.unlinkSync(stats)
	return r
}

function analyzeGeneric(file) {
	let r = {}
	r.linesOfCode = Number.parseInt(execSync(`wc -l ${file} | awk '{printf "%d",$1}'`, { encoding: "utf8" }))
	return r
}

function analyze(suffix, name, content) {
	const file = path.join(TMP_CODE, name)
	fs.writeFileSync(file, content)
	let r = {}
	if (['c', 'h', 'cc', 'cpp', 'hpp'].includes(suffix)) {
		r = analyzeC(file)
	} else {
		r = analyzeGeneric(file)
	}
	fs.unlinkSync(file)
	return r
}

module.exports = { analyze }
