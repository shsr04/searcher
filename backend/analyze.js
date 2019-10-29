const fs = require("fs")
const path = require("path")
const cheerio = require("cheerio")
const { execSync } = require("child_process")
const { log } = require("./log")
const CCCC = path.join(__dirname, "..", "cccc", "cccc", "cccc")
const TMP_CODE = path.join(__dirname, "..", "store", "code")

function analyzeC(name, text) {
    let r = {}
    const file = path.join(TMP_CODE, name)
    const stats = file + '_stats.xml'
    fs.writeFileSync(file, text)
    log(`ANALYZING ${file}...`)
    execSync(`${CCCC} --xml_outfile=${stats} ${file}`, { "stdio": "ignore" })
    const $ = cheerio.load(fs.readFileSync(stats))
    r.linesOfCode = $("project_summary lines_of_code").attr("value")
    r.comments = $("project_summary lines_of_comment").attr("value")
    r.cyclomatic = $("project_summary McCabes_cyclomatic_complexity").attr("value")
    fs.unlinkSync(file)
    fs.unlinkSync(stats)
    return r
}

module.exports = { analyzeC }
