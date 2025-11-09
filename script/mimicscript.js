import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendURL = process.env.BACKEND_URL || "http://localhost:4000/api/postRanking";
const KEY = process.env.KEY || "dev-key";
const BATCH = process.env.BATCH || "22k";

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (p) => Math.random() < p;

function secondsToHMS(s) {
    const h = Math.floor(s / 3600);
    s %= 3600;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
function randomContestTime() {
    return secondsToHMS(randInt(60, 3 * 3600));
}
function randomPenalty() {
    return `(-${randInt(1, 3)})`;
}

const state = {
    [BATCH]: [
        {
            rank: "1",
            teamName: "Test_Account123",
            score: "",
            penalty: "",
            problems: [
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" }
            ]
        },
        {
            rank: "2",
            teamName: "zayan_ahmed",
            score: "",
            penalty: "",
            problems: [
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" }
            ]
        },
        {
            rank: "3",
            teamName: "CodingExpert2527 (Coding Expert 2527)",
            score: "",
            penalty: "",
            problems: [
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" },
                { status: "Not attempted", time: "", penalty: "" }
            ]
        }
    ]
};

const PROBLEM_COUNT = state[BATCH][0].problems.length;

function sanitizeProblem(p) {
    if (p.status === "Not attempted") {
        p.time = "";
        p.penalty = "";
    } else if (p.status === "Accepted") {
        if (!p.time) p.time = randomContestTime();
        p.penalty = "";
    } else if (p.status === "Attempted") {
        p.time = "";
        if (!p.penalty) p.penalty = randomPenalty();
    } else if (p.status === "Failed") {
        p.time = "";
        p.penalty = "";
    }
}

function mutateProblems(problems) {
    const idx = randInt(0, problems.length - 1);
    const p = problems[idx];

    if (p.status === "Accepted") {
        // sanitizeProblem(p);
        return;
    }

    if (p.status === "Not attempted") {
        if (chance(0.65)) {
            p.status = "Accepted";
            p.time = randomContestTime();
            p.penalty = "";
        } else if (chance(0.25)) {
            p.status = "Attempted";
            p.time = "";
            p.penalty = randomPenalty();
        }
    } else if (p.status === "Attempted") {
        if (chance(0.55)) {
            p.status = "Accepted";
            p.time = randomContestTime();
            p.penalty = "";
        } else {
            if (chance(0.4)) p.penalty = randomPenalty();
            p.time = "";
        }
    } else if (p.status === "Failed") {
        if (chance(0.4)) {
            p.status = "Attempted";
            p.time = "";
            p.penalty = randomPenalty();
        }
    }

    if (chance(0.2)) {
        const j = randInt(0, problems.length - 1);
        if (j !== idx) mutateProblems([problems[j]]);
    }

    sanitizeProblem(p);
}

function recomputeScoresAndRanks(arr) {
    arr.forEach((t) => {
        t.problems.forEach(sanitizeProblem);
        const accepted = t.problems.filter((p) => p.status === "Accepted").length;
        t.score = String(accepted);
    });
    const toSec = (s) => {
        if (!s) return 0;
        const [h, m, ss] = s.split(":").map(Number);
        return (h || 0) * 3600 + (m || 0) * 60 + (ss || 0);
    };
    arr.sort((a, b) => {
        const sa = parseInt(a.score, 10);
        const sb = parseInt(b.score, 10);
        if (sb !== sa) return sb - sa;
        const ta =
            a.problems.filter(p => p.status === "Accepted" && p.time)
                .map(p => toSec(p.time)).reduce((x, y) => x + y, 0);
        const tb =
            b.problems.filter(p => p.status === "Accepted" && p.time)
                .map(p => toSec(p.time)).reduce((x, y) => x + y, 0);
        return ta - tb;
    });
    arr.forEach((t, i) => (t.rank = String(i + 1)));
}

function maybeAddTeam(arr) {
    if (chance(0.2)) {
        arr.push({
            rank: String(arr.length + 1),
            teamName: `Team_${BATCH}_${randInt(100, 999)}`,
            score: "0",
            penalty: "",
            problems: Array.from({ length: PROBLEM_COUNT }, () => ({
                status: chance(0.25) ? "Attempted" : "Not attempted",
                time: "",
                penalty: chance(0.25) ? randomPenalty() : ""
            }))
        });
    }
}

function mutateBatchArray(arr) {
    if (arr.length === 0) {
        arr.push({
            rank: "1",
            teamName: `Team_${BATCH}_${randInt(100, 999)}`,
            score: "0",
            penalty: "",
            problems: Array.from({ length: PROBLEM_COUNT }, () => ({ status: "Not attempted", time: "", penalty: "" }))
        });
    }

    maybeAddTeam(arr);

    arr.forEach((team) => {
        if (team.problems.length !== PROBLEM_COUNT) {
            team.problems = Array.from({ length: PROBLEM_COUNT }, (_, i) => team.problems[i] || { status: "Not attempted", time: "", penalty: "" });
        }
        const edits = randInt(0, 2);
        for (let i = 0; i < edits; i++) {
            mutateProblems(team.problems);
        }
        team.problems.forEach(sanitizeProblem);
    });

    recomputeScoresAndRanks(arr);
}

export const postData = async (data, batch) => {
    try {
        const response = await fetch(backendURL, {
            method: "POST",
            body: JSON.stringify({ data, batch }),
            headers: {
                "Content-Type": "application/json",
                key: KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        console.log(`Data sent successfully (batch: ${batch}):`, json);
    } catch (error) {
        console.error("Error sending data:", error.message);
    }
};

export const generateAndSendData = async (batch) => {
    const arr = state[batch];
    mutateBatchArray(arr);
    console.log(arr);
    await postData(arr, batch);
};

setInterval(() => generateAndSendData(BATCH), 10_000);

generateAndSendData(BATCH);
