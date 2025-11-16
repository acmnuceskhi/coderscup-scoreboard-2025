import dotenv from "dotenv";
import puppeteer from "puppeteer";
import UserAgent from "user-agents";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const KEY = process.env.KEY;

// ------------------------------------ SUBJECTIVE DATA ------------------------------------
const leaderBoardURLs = [
    { batch: "22k", url: "https://vjudge.net/contest/765033#rank" },
    { batch: "23k", url: "https://vjudge.net/contest/765843#rank" },
    { batch: "24k", url: "https://vjudge.net/contest/765411#rank" },
    { batch: "25k", url: "https://vjudge.net/contest/766381#rank" }
];

// const BACKENDURL = "https://coderscup-scoreboard-backend.onrender.com";
const BACKENDURL = "http://localhost:4000";

const CONTEST_START = "2025-11-15T10:00:00+05:00";
const CONTEST_END = "2025-11-18T18:00:00+05:00";
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
            // console.log(await page.content());
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
        const response = await fetch(`${BACKENDURL}/api/postRanking`, {
            method: "POST",
            body: JSON.stringify({
                data: data.rows,
                batch
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
    // console.log(data);
    if (data && Array.isArray(data)) {
        console.log("posting data to backend...");
        await postData(
            {
                rows: data
            },
            batch
        );
    } else {
        console.error("No data scraped or data is empty");
    }
};

export const postTime = async (startTime, endTime) => {
    try {
        const response = await fetch(`${BACKENDURL}/api/postContestTime`, {
            method: "POST",
            body: JSON.stringify({ startTime, endTime }),
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
        console.log(`Contest time posted successfully:`, json);
    } catch (error) {
        console.error("Error posting contest time:", error);
    }
};

// Post contest time once at the start
postTime(CONTEST_START, CONTEST_END);

// Set intervals for scraping and sending data
leaderBoardURLs.forEach(({ batch, url }) => {
    // first run immediately
    scrapeAndSendData(batch, url);
    // run every 30s
    setInterval(() => scrapeAndSendData(batch, url), 30000);
});