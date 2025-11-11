import dotenv from "dotenv";
import puppeteer from "puppeteer";
import UserAgent from "user-agents";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const KEY = process.env.KEY;

// ------------------------------------ SUBJECTIVE DATA ------------------------------------
// const LEADERBOARDURL = "https://vjudge.net/contest/765492#rank";
const LEADERBOARDURL = "https://vjudge.net/contest/765411#rank";

const BACKENDURL = "https://coderscup-scoreboard-backend.onrender.com/api/postRanking";
// const BACKENDURL = "http://localhost:4000/api/postRanking";

const CONTEST_START = "2025-11-11T14:15:00+05:00";
const CONTEST_END = "2025-11-11T15:45:00+05:00";
// ------------------------------------ SUBJECTIVE DATA ------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIEWPORT = { width: 1920, height: 1080 };
const RANK_TABLE_SELECTOR = "#contest-rank-table";

const launchBrowser = async () => {
    try {
        return await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            defaultViewport: VIEWPORT,
        });
    } catch (error) {
        console.error("Error launching Puppeteer:", error);
        throw error;
    }
};

const newConfiguredPage = async (browser) => {
    const page = await browser.newPage();
    await page.setUserAgent(new UserAgent().toString());
    return page;
};

const waitForRankTable = async (page) => {
    try {
        await page.waitForSelector(RANK_TABLE_SELECTOR, { timeout: 30000 });
    } catch (e) {
        throw e;
    }
};

const extractLeaderboard = async (page) => {
    return page.evaluate(() => {
        const rows = document.querySelectorAll("#contest-rank-table tbody tr");
        const result = [];

        rows.forEach((row) => {
            const rank = row.querySelector("td.rank")?.innerText.trim() || "N/A";
            const teamName = row.querySelector("td.team a")?.innerText.trim() || "N/A";
            const score = row.querySelector("td.solved span")?.innerText.trim() || "N/A";
            const penalty = row.querySelector("td.penalty span.minute")?.innerText.trim() || "N/A";
            const problems = [];

            const problemCells = row.querySelectorAll("td.prob");
            problemCells.forEach((cell) => {
                const accepted = cell.classList.contains("accepted");
                const failed = cell.classList.contains("failed");

                let problemStatus = "Not attempted";
                let time = "";

                if (accepted) {
                    problemStatus = "Accepted";
                    time = cell.innerText.split("<br>")[0].trim().split("\n")[0].trim();
                } else if (failed) {
                    problemStatus = "Failed";
                }

                let penalty = "";
                const spanElement = cell.querySelector("span");
                if (spanElement) {
                    penalty = spanElement.innerText.trim();
                }

                problems.push({ status: problemStatus, time, penalty });
            });

            result.push({ rank, teamName, score, penalty, problems });
        });
        // return result;
        return result;
    });
};

export const getData = async (URL) => {
    let browser = null;
    try {
        browser = await launchBrowser();
        const page = await newConfiguredPage(browser);
        await page.goto(URL, { waitUntil: "networkidle0" });

        try {
            await waitForRankTable(page);
        } catch (e) {
            console.error("Table not found:", e);
            await page.screenshot({ path: path.join(__dirname, "error_screenshot.png") });
            console.log(await page.content());
            return { error: "Table not found" };
        }

        const data = await extractLeaderboard(page);
        return data;
    } catch (err) {
        console.error("Unexpected scraping error:", err);
        return { error: "Unexpected scraping error" };
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch { }
        }
    }
};

export const postData = async (data, batch) => {
    try {
        const response = await fetch(BACKENDURL, {
            method: "POST",
            body: JSON.stringify({
                data: data.rows,
                batch,
                meta: {
                    startTime: CONTEST_START,
                    endTime: CONTEST_END
                }
            }),
            headers: {
                "Content-Type": "application/json",
                key: KEY,
            },
        });

        if (!response.ok) {
            console.error("Status:", response.status, response.statusText);
            throw new Error(`Network response was not ok`);
        }

        const json = await response.json();
        console.log(`Data sent successfully (batch: ${batch}):`, json);
    } catch (error) {
        console.error("Error sending data:", error);
    }
};

export const scrapeAndSendData = async (batch, leaderboardURL) => {
    console.log(`Scraping data (${batch})...`);
    const data = await getData(leaderboardURL);
    console.log(data);
    if (data && Array.isArray(data)) {
        console.log("posting data to backend...");
        await postData(
            {
                rows: data,
                meta: { startTime: CONTEST_START, endTime: CONTEST_END }
            },
            batch
        );
    } else {
        console.error("No data scraped or data is empty");
    }
};

// run every 30s
setInterval(() => scrapeAndSendData("22k", LEADERBOARDURL), 30000);

// run on startup
scrapeAndSendData("22k", LEADERBOARDURL);
