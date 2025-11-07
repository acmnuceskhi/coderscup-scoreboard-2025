import dotenv from "dotenv";
import puppeteer from "puppeteer";
import UserAgent from "user-agents";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Backend endpoint
// const backendURL = "https://coders-cup-scoreboard-2.onrender.com/api/postRanking";
const backendURL = "http://localhost:4000/api/postRanking";
const KEY = process.env.KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getData = async (URL) => {
    let browser = null;
    const viewportSize = { width: 1920, height: 1080 };

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            defaultViewport: viewportSize,
        });
    } catch (error) {
        console.error("Error launching Puppeteer:", error);
    }
    const page = await browser.newPage();
    await page.setUserAgent(new UserAgent().toString());
    await page.goto(URL, { waitUntil: "networkidle0" });
    try {
        await page.waitForSelector("#contest-rank-table", { timeout: 30000 });
    } catch (e) {
        console.error("❌ Table not found:", e);
        await page.screenshot({ path: path.join(__dirname, "error_screenshot.png") });
        console.log(await page.content());
        await browser.close();
        return { error: "Table not found" };
    }

    const data = await page.evaluate(() => {
        const rows = document.querySelectorAll("#contest-rank-table tbody tr");
        const result = [];

        rows.forEach((row) => {
            const rank = row.querySelector("td.rank")?.innerText.trim() || "N/A";
            const teamName = row.querySelector("td.team a")?.innerText.trim() || "N/A";
            const score = row.querySelector("td.solved span")?.innerText.trim() || "N/A";
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

            result.push({ rank, teamName, score, problems });
        });
        return result;
    });
    await browser.close();
    return data;
};

export const postData = async (data, batch) => {
    try {
        const response = await fetch(backendURL, {
            method: "POST",
            body: JSON.stringify({ data, batch }),
            headers: {
                "Content-Type": "application/json",
                key: KEY,
            },
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const json = await response.json();
        console.log(`Data sent successfully (batch: ${batch}):`, json);
    } catch (error) {
        console.error("Error sending data:", error);
    }
};

export const scrapeAndSendData = async (batch, rankingURL) => {
    console.log(`Scraping data (${batch})...`);
    const data = await getData(rankingURL);
    console.log(data);
    if (data && data.length > 0) {
        console.log("posting data to backend...");
        await postData(data, batch);
    } else {
        console.error("⚠️ No data scraped or data is empty");
    }
};

// const leaderboardUrl = "https://vjudge.net/contest/672067#rank";
const leaderboardUrl = "https://vjudge.net/contest/764708#rank";

// run every 30s
setInterval(() => scrapeAndSendData("22k", leaderboardUrl), 30000);

// Run on startup
scrapeAndSendData("22k", leaderboardUrl);
