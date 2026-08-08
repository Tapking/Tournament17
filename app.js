"use strict";

/* =========================================================
   Tournament Manager
   نسخه اولیه کامل و قابل توسعه
========================================================= */


/* =========================================================
   تنظیمات و ذخیره‌سازی
========================================================= */

const STORAGE_KEY = "complexTournamentApp_v1";


const defaultData = {
    competitionName: "مدیریت مسابقات",

    teams: [],

    players: [],

    matches: [],

    goals: [],

    news: []
};


let data = loadData();


function loadData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return cloneDefaultData();
        }

        const parsed = JSON.parse(saved);

        return {
            ...cloneDefaultData(),
            ...parsed,
            teams: Array.isArray(parsed.teams) ? parsed.teams : [],
            players: Array.isArray(parsed.players) ? parsed.players : [],
            matches: Array.isArray(parsed.matches) ? parsed.matches : [],
            goals: Array.isArray(parsed.goals) ? parsed.goals : [],
            news: Array.isArray(parsed.news) ? parsed.news : []
        };

    } catch (error) {

        console.error("خطا در خواندن اطلاعات:", error);

        return cloneDefaultData();
    }
}


function cloneDefaultData() {

    return JSON.parse(
        JSON.stringify(defaultData)
    );
}


function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error("خطا در ذخیره اطلاعات:", error);

        showToast(
            "❌ ذخیره اطلاعات انجام نشد"
        );

        return false;
    }
}


/* =========================================================
   ابزارهای عمومی
========================================================= */

function createId(prefix) {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showToast(message) {

    const container =
        document.getElementById("toastContainer");

    if (!container) {
        return;
    }

    const toast =
        document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);
}


function formatNumber(number) {

    return Number(number || 0).toLocaleString("fa-IR");
}


function formatDate(dateString) {

    if (!dateString) {
        return "بدون تاریخ";
    }

    try {

        return new Date(
            dateString + "T00:00:00"
        ).toLocaleDateString("fa-IR");

    } catch (error) {

        return dateString;
    }
}


function formatTime(time) {

    return time || "بدون ساعت";
}


function getTeam(teamId) {

    return data.teams.find(
        team => team.id === teamId
    );
}


function getPlayer(playerId) {

    return data.players.find(
        player => player.id === playerId
    );
}


function getMatch(matchId) {

    return data.matches.find(
        match => match.id === matchId
    );
}


function getTeamName(teamId) {

    const team = getTeam(teamId);

    return team
        ? team.name
        : "تیم حذف‌شده";
}


function getTeamLogo(teamId) {

    const team = getTeam(teamId);

    return team && team.logo
        ? team.logo
        : "⚽";
}


function getPlayerName(playerId) {

    const player = getPlayer(playerId);

    return player
        ? player.name
        : "نامشخص";
}


/* =========================================================
   ناوبری
========================================================= */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const target =
        document.getElementById(
            "page-" + pageName
        );


    if (!target) {
        return;
    }


    target.classList.add("active");


    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageName
            );

        });


    if (pageName === "players") {
        renderPlayers();
    }

    if (pageName === "table") {
        renderStandings();
    }

    if (pageName === "stats") {
        renderStats();
    }
}


document
    .querySelectorAll(".nav-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
                );

            }
        );

    });


const headerMenuButton =
    document.getElementById(
        "headerMenuButton"
    );


if (headerMenuButton) {

    headerMenuButton.addEventListener(
        "click",
        () => {

            showPage("dashboard");

        }
    );
}


/* =========================================================
   مودال‌ها
========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");
}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
}


document
    .querySelectorAll("[data-close-modal]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                closeModal(
                    button.dataset.closeModal
                );

            }
        );

    });


document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

                    modal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    });


document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        document
            .querySelectorAll(".modal")
            .forEach(modal => {

                modal.classList.add("hidden");

            });

    }
);


/* =========================================================
   داشبورد
========================================================= */

function renderDashboard() {

    const teams =
        document.getElementById(
            "dashboardTeams"
        );

    const players =
        document.getElementById(
            "dashboardPlayers"
        );

    const matches =
        document.getElementById(
            "dashboardMatches"
        );

    const finished =
        document.getElementById(
            "dashboardFinished"
        );


    if (teams) {
        teams.textContent =
            formatNumber(data.teams.length);
    }


    if (players) {
        players.textContent =
            formatNumber(data.players.length);
    }


    if (matches) {
        matches.textContent =
            formatNumber(data.matches.length);
    }


    if (finished) {

        finished.textContent =
            formatNumber(
                data.matches.filter(
                    match => match.finished
                ).length
            );

    }


    renderRecentMatches();

    renderLatestNews();
}


function renderRecentMatches() {

    const container =
        document.getElementById(
            "recentMatches"
        );


    if (!container) {
        return;
    }


    const matches =
        [...data.matches]
            .sort(
                (a, b) =>
                    new Date(b.date + "T" + (b.time || "00:00")) -
                    new Date(a.date + "T" + (a.time || "00:00"))
            )
            .slice(0, 5);


    if (matches.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز مسابقه‌ای ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        matches
            .map(match => createMatchHTML(match, true))
            .join("");
}


function renderLatestNews() {

    const container =
        document.getElementById(
            "latestNews"
        );


    if (!container) {
        return;
    }


    const news =
        [...data.news]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 3);


    if (news.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز اطلاعیه‌ای ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        news.map(item => `

            <div class="news-card">

                <div class="card-title">
                    ${escapeHTML(item.title)}
                </div>

                <div class="card-subtitle">
                    ${escapeHTML(item.text)}
                </div>

            </div>

        `).join("");
}


/* =========================================================
   تیم‌ها
========================================================= */

const addTeamButton =
    document.getElementById(
        "addTeamButton"
    );


if (addTeamButton) {

    addTeamButton.addEventListener(
        "click",
        openNewTeamModal
    );
}


function openNewTeamModal() {

    const form =
        document.getElementById(
            "teamForm"
        );

    form.reset();

    document.getElementById(
        "teamId"
    ).value = "";

    document.getElementById(
        "teamModalTitle"
    ).textContent = "تیم جدید";

    openModal("teamModal");
}


document
    .getElementById("teamForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const id =
                document.getElementById(
                    "teamId"
                ).value.trim();

            const name =
                document.getElementById(
                    "teamName"
                ).value.trim();

            const complex =
                document.getElementById(
                    "teamComplex"
                ).value.trim();

            const captain =
                document.getElementById(
                    "teamCaptain"
                ).value.trim();

            const phone =
                document.getElementById(
                    "teamCaptainPhone"
                ).value.trim();

            const logo =
                document.getElementById(
                    "teamLogo"
                ).value.trim();


            if (!name) {

                showToast(
                    "⚠️ نام تیم را وارد کنید"
                );

                return;
            }


            if (id) {

                const team =
                    getTeam(id);

                if (team) {

                    team.name = name;
                    team.complex = complex;
                    team.captain = captain;
                    team.phone = phone;
                    team.logo = logo || "⚽";

                }

                showToast(
                    "✅ اطلاعات تیم ویرایش شد"
                );

            } else {

                data.teams.push({

                    id: createId("team"),

                    name,

                    complex,

                    captain,

                    phone,

                    logo: logo || "⚽",

                    createdAt:
                        new Date().toISOString()

                });

                showToast(
                    "✅ تیم اضافه شد"
                );
            }


            saveData();

            closeModal("teamModal");

            renderAll();

        }
    );


function renderTeams() {

    const container =
        document.getElementById(
            "teamsList"
        );


    if (!container) {
        return;
    }


    if (data.teams.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز تیمی ثبت نشده است.
                <br>
                از دکمه «تیم جدید» استفاده کنید.
            </div>
        `;

        return;
    }


    container.innerHTML =
        data.teams
            .map(team => {

                const playerCount =
                    data.players.filter(
                        player =>
                            player.teamId === team.id
                    ).length;


                return `

                    <div class="team-card">

                        <div class="card-top">

                            <div class="team-info">

                                <div class="team-logo">
                                    ${escapeHTML(team.logo || "⚽")}
                                </div>

                                <div>

                                    <div class="card-title">
                                        ${escapeHTML(team.name)}
                                    </div>

                                    <div class="card-subtitle">
                                        ${escapeHTML(team.complex || "مجتمع ثبت نشده")}
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div class="card-subtitle">

                            👑 کاپیتان:
                            ${escapeHTML(team.captain || "ثبت نشده")}

                            <br>

                            👥 بازیکنان:
                            ${formatNumber(playerCount)}

                        </div>


                        <div class="card-actions">

                            <button
                                class="small-button primary"
                                type="button"
                                onclick="openEditTeam('${team.id}')">
                                ✏️ ویرایش
                            </button>

                            <button
                                class="small-button"
                                type="button"
                                onclick="openPlayersForTeam('${team.id}')">
                                👥 بازیکنان
                            </button>

                            <button
                                class="small-button danger"
                                type="button"
                                onclick="deleteTeam('${team.id}')">
                                🗑️ حذف
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");
}


window.openEditTeam = function(id) {

    const team = getTeam(id);

    if (!team) {
        return;
    }


    document.getElementById(
        "teamId"
    ).value = team.id;

    document.getElementById(
        "teamName"
    ).value = team.name;

    document.getElementById(
        "teamComplex"
    ).value = team.complex || "";

    document.getElementById(
        "teamCaptain"
    ).value = team.captain || "";

    document.getElementById(
        "teamCaptainPhone"
    ).value = team.phone || "";

    document.getElementById(
        "teamLogo"
    ).value = team.logo || "";


    document.getElementById(
        "teamModalTitle"
    ).textContent =
        "ویرایش تیم";


    openModal("teamModal");
};


window.deleteTeam = function(id) {

    const team = getTeam(id);

    if (!team) {
        return;
    }


    const relatedPlayers =
        data.players.filter(
            player =>
                player.teamId === id
        );


    const relatedMatches =
        data.matches.filter(
            match =>
                match.homeTeamId === id ||
                match.awayTeamId === id
        );


    if (
        relatedPlayers.length > 0 ||
        relatedMatches.length > 0
    ) {

        const confirmed =
            confirm(
                "این تیم بازیکن یا مسابقه مرتبط دارد. حذف تیم باعث حذف بازیکنان آن نیز می‌شود. ادامه می‌دهید؟"
            );


        if (!confirmed) {
            return;
        }

    } else {

        if (
            !confirm(
                "آیا از حذف این تیم مطمئن هستید؟"
            )
        ) {

            return;
        }
    }


    data.players =
        data.players.filter(
            player =>
                player.teamId !== id
        );


    data.goals =
        data.goals.filter(
            goal =>
                goal.teamId !== id
        );


    data.matches =
        data.matches.filter(
            match =>
                match.homeTeamId !== id &&
                match.awayTeamId !== id
        );


    data.teams =
        data.teams.filter(
            teamItem =>
                teamItem.id !== id
        );


    saveData();

    renderAll();

    showToast(
        "🗑️ تیم حذف شد"
    );
};


window.openPlayersForTeam = function(id) {

    showPage("players");

    const search =
        document.getElementById(
            "playerSearch"
        );

    if (search) {

        const team = getTeam(id);

        search.value =
            team ? team.name : "";

        renderPlayers();

    }
};


/* =========================================================
   بازیکنان
========================================================= */

function populateTeamSelects() {

    const selects = [

        document.getElementById(
            "playerTeam"
        ),

        document.getElementById(
            "matchHome"
        ),

        document.getElementById(
            "matchAway"
        ),

        document.getElementById(
            "goalTeam"
        )

    ];


    selects.forEach(select => {

        if (!select) {
            return;
        }


        const current =
            select.value;


        let firstOption = "";


        if (select.id === "playerTeam") {

            firstOption =
                `<option value="">انتخاب تیم</option>`;

        } else if (
            select.id === "goalTeam"
        ) {

            firstOption =
                `<option value="">انتخاب تیم</option>`;

        } else {

            firstOption =
                `<option value="">انتخاب تیم</option>`;

        }


        select.innerHTML =
            firstOption +
            data.teams
                .map(team => `

                    <option value="${team.id}">
                        ${escapeHTML(team.name)}
                    </option>

                `)
                .join("");


        if (
            data.teams.some(
                team =>
                    team.id === current
            )
        ) {

            select.value = current;

        }

    });
}


function openPlayerModal() {

    const form =
        document.getElementById(
            "playerForm"
        );

    form.reset();

    populateTeamSelects();

    openModal("playerModal");
}


function renderPlayers() {

    const container =
        document.getElementById(
            "playersList"
        );


    if (!container) {
        return;
    }


    const searchInput =
        document.getElementById(
            "playerSearch"
        );


    const query =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    let players =
        [...data.players];


    if (query) {

        players =
            players.filter(player => {

                const teamName =
                    getTeamName(
                        player.teamId
                    ).toLowerCase();

                return (
                    player.name
                        .toLowerCase()
                        .includes(query) ||

                    teamName.includes(query)
                );

            });

    }


    if (players.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                بازیکنی پیدا نشد.
            </div>
        `;

        return;
    }


    container.innerHTML =
        players
            .map(player => {

                const team =
                    getTeam(player.teamId);


                return `

                    <div class="player-card">

                        <div class="card-top">

                            <div>

                                <div class="card-title">

                                    ${escapeHTML(player.name)}

                                    ${
                                        player.captain
                                            ? " 👑"
                                            : ""
                                    }

                                </div>

                                <div class="card-subtitle">

                                    ${escapeHTML(
                                        team
                                            ? team.name
                                            : "تیم حذف‌شده"
                                    )}

                                    ${
                                        player.number
                                            ? " | شماره " +
                                              escapeHTML(player.number)
                                            : ""
                                    }

                                </div>

                            </div>

                        </div>


                        <div class="card-actions">

                            <button
                                class="small-button danger"
                                type="button"
                                onclick="deletePlayer('${player.id}')">
                                🗑️ حذف
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");
}


document
    .getElementById("playerForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const teamId =
                document.getElementById(
                    "playerTeam"
                ).value;


            const name =
                document.getElementById(
                    "playerName"
                ).value.trim();


            const number =
                document.getElementById(
                    "playerNumber"
                ).value.trim();


            const captain =
                document.getElementById(
                    "playerCaptain"
                ).checked;


            if (!teamId || !name) {

                showToast(
                    "⚠️ تیم و نام بازیکن الزامی است"
                );

                return;
            }


            if (captain) {

                data.players
                    .filter(
                        player =>
                            player.teamId === teamId
                    )
                    .forEach(
                        player =>
                            player.captain = false
                    );

            }


            data.players.push({

                id: createId("player"),

                teamId,

                name,

                number,

                captain,

                goals: 0,

                assists: 0,

                bestPlayerCount: 0,

                yellowCards: 0,

                redCards: 0,

                createdAt:
                    new Date().toISOString()

            });


            const team =
                getTeam(teamId);


            if (captain && team) {

                team.captain = name;

            }


            saveData();

            closeModal("playerModal");

            renderAll();

            showToast(
                "✅ بازیکن اضافه شد"
            );

        }
    );


window.deletePlayer = function(id) {

    const player =
        getPlayer(id);


    if (!player) {
        return;
    }


    if (
        !confirm(
            "آیا از حذف این بازیکن مطمئن هستید؟"
        )
    ) {

        return;
    }


    data.goals =
        data.goals.filter(
            goal =>
                goal.scorerId !== id &&
                goal.assistId !== id
        );


    data.players =
        data.players.filter(
            item =>
                item.id !== id
        );


    saveData();

    renderAll();

    showToast(
        "🗑️ بازیکن حذف شد"
    );
};


document
    .getElementById("playerSearch")
    .addEventListener(
        "input",
        renderPlayers
    );


/* =========================================================
   مسابقات
========================================================= */

const addMatchButton =
    document.getElementById(
        "addMatchButton"
    );


if (addMatchButton) {

    addMatchButton.addEventListener(
        "click",
        () => {

            if (data.teams.length < 2) {

                showToast(
                    "⚠️ ابتدا حداقل دو تیم ثبت کنید"
                );

                showPage("teams");

                return;
            }


            document
                .getElementById("matchForm")
                .reset();


            populateTeamSelects();

            openModal("matchModal");

        }
    );
}


document
    .getElementById("matchForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const homeTeamId =
                document.getElementById(
                    "matchHome"
                ).value;


            const awayTeamId =
                document.getElementById(
                    "matchAway"
                ).value;


            const date =
                document.getElementById(
                    "matchDate"
                ).value;


            const time =
                document.getElementById(
                    "matchTime"
                ).value;


            const venue =
                document.getElementById(
                    "matchVenue"
                ).value.trim();


            const round =
                document.getElementById(
                    "matchRound"
                ).value;


            if (
                !homeTeamId ||
                !awayTeamId ||
                !date
            ) {

                showToast(
                    "⚠️ تیم‌ها و تاریخ مسابقه را وارد کنید"
                );

                return;
            }


            if (
                homeTeamId === awayTeamId
            ) {

                showToast(
                    "⚠️ یک تیم نمی‌تواند با خودش بازی کند"
                );

                return;
            }


            data.matches.push({

                id: createId("match"),

                homeTeamId,

                awayTeamId,

                date,

                time,

                venue,

                round,

                finished: false,

                homeScore: null,

                awayScore: null,

                bestPlayerId: "",

                createdAt:
                    new Date().toISOString()

            });


            saveData();

            closeModal("matchModal");

            renderAll();

            showToast(
                "✅ مسابقه ثبت شد"
            );

        }
    );


document
    .querySelectorAll(
        "[data-match-filter]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        "[data-match-filter]"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                renderMatches(
                    button.dataset.matchFilter
                );

            }
        );

    });


function createMatchHTML(
    match,
    compact = false
) {

    const status =
        match.finished
            ? "finished"
            : "upcoming";


    const statusText =
        match.finished
            ? "پایان‌یافته"
            : "برگزار نشده";


    const score =
        match.finished
            ? `${match.homeScore} - ${match.awayScore}`
            : "vs";


    const roundNames = {

        group: "گروهی",

        quarter: "یک‌چهارم نهایی",

        semi: "نیمه‌نهایی",

        final: "فینال"

    };


    return `

        <div class="match-card">

            <div class="match-header">

                <span class="match-status ${status}">
                    ${statusText}
                </span>

                <span class="card-subtitle">
                    ${escapeHTML(
                        roundNames[match.round] ||
                        match.round ||
                        "مسابقه"
                    )}
                </span>

            </div>


            <div class="match-teams">

                <div class="match-team">
                    ${escapeHTML(
                        getTeamName(
                            match.homeTeamId
                        )
                    )}
                </div>


                <div class="match-score">
                    ${score}
                </div>


                <div class="match-team">
                    ${escapeHTML(
                        getTeamName(
                            match.awayTeamId
                        )
                    )}
                </div>

            </div>


            <div class="match-meta">

                <span>
                    📅 ${formatDate(match.date)}
                </span>

                <span>
                    ⏰ ${formatTime(match.time)}
                </span>

                ${
                    match.venue
                        ? `
                            <span>
                                🏟️ ${escapeHTML(match.venue)}
                            </span>
                        `
                        : ""
                }

            </div>


            ${
                compact
                    ? ""
                    : `
                        <div class="card-actions">

                            ${
                                !match.finished
                                    ? `
                                        <button
                                            class="small-button primary"
                                            type="button"
                                            onclick="openResultModal('${match.id}')">
                                            ⚽ ثبت نتیجه
                                        </button>
                                    `
                                    : `
                                        <button
                                            class="small-button primary"
                                            type="button"
                                            onclick="openResultModal('${match.id}')">
                                            ✏️ ویرایش نتیجه
                                        </button>
                                    `
                            }


                            ${
                                match.finished
                                    ? `
                                        <button
                                            class="small-button"
                                            type="button"
                                            onclick="openGoalModal('${match.id}')">
                                            ⚽ ثبت گل
                                        </button>
                                    `
                                    : ""
                            }


                            <button
                                class="small-button danger"
                                type="button"
                                onclick="deleteMatch('${match.id}')">
                                🗑️ حذف
                            </button>

                        </div>
                    `
            }

        </div>

    `;
}


function renderMatches(filter = "all") {

    const container =
        document.getElementById(
            "matchesList"
        );


    if (!container) {
        return;
    }


    let matches =
        [...data.matches];


    if (filter === "upcoming") {

        matches =
            matches.filter(
                match =>
                    !match.finished
            );

    }


    if (filter === "finished") {

        matches =
            matches.filter(
                match =>
                    match.finished
            );

    }


    matches.sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.date +
                    "T" +
                    (a.time || "00:00")
                );

            const dateB =
                new Date(
                    b.date +
                    "T" +
                    (b.time || "00:00")
                );

            return dateA - dateB;

        }
    );


    if (matches.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                مسابقه‌ای در این بخش وجود ندارد.
            </div>
        `;

        return;
    }


    container.innerHTML =
        matches
            .map(
                match =>
                    createMatchHTML(
                        match,
                        false
                    )
            )
            .join("");
}


window.deleteMatch = function(id) {

    if (
        !confirm(
            "آیا از حذف این مسابقه مطمئن هستید؟"
        )
    ) {

        return;
    }


    data.matches =
        data.matches.filter(
            match =>
                match.id !== id
        );


    data.goals =
        data.goals.filter(
            goal =>
                goal.matchId !== id
        );


    saveData();

    renderAll();

    showToast(
        "🗑️ مسابقه حذف شد"
    );
};


/* =========================================================
   ثبت نتیجه
========================================================= */

window.openResultModal = function(matchId) {

    const match =
        getMatch(matchId);


    if (!match) {
        return;
    }


    document.getElementById(
        "resultMatchId"
    ).value = matchId;


    document.getElementById(
        "homeScore"
    ).value =
        match.finished
            ? match.homeScore
            : 0;


    document.getElementById(
        "awayScore"
    ).value =
        match.finished
            ? match.awayScore
            : 0;


    document.getElementById(
        "homeScoreLabel"
    ).textContent =
        getTeamName(
            match.homeTeamId
        );


    document.getElementById(
        "awayScoreLabel"
    ).textContent =
        getTeamName(
            match.awayTeamId
        );


    document.getElementById(
        "resultTeams"
    ).innerHTML = `

        <div>
            ${escapeHTML(
                getTeamName(
                    match.homeTeamId
                )
            )}
        </div>

        <div>
            ${escapeHTML(
                getTeamName(
                    match.awayTeamId
                )
            )}
        </div>

    `;


    populateBestPlayerSelect(match);


    openModal("resultModal");
};


function populateBestPlayerSelect(match) {

    const select =
        document.getElementById(
            "bestPlayer"
        );


    const players =
        data.players.filter(
            player =>
                player.teamId ===
                    match.homeTeamId ||
                player.teamId ===
                    match.awayTeamId
        );


    select.innerHTML = `
        <option value="">
            انتخاب بازیکن
        </option>
    `;


    players.forEach(player => {

        const option =
            document.createElement(
                "option"
            );


        option.value = player.id;

        option.textContent =
            getTeamName(
                player.teamId
            ) +
            " - " +
            player.name;


        select.appendChild(option);

    });


    if (match.bestPlayerId) {

        select.value =
            match.bestPlayerId;

    }
}


document
    .getElementById("resultForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const matchId =
                document.getElementById(
                    "resultMatchId"
                ).value;


            const match =
                getMatch(matchId);


            if (!match) {
                return;
            }


            const homeScore =
                Math.max(
                    0,
                    Number(
                        document.getElementById(
                            "homeScore"
                        ).value
                    ) || 0
                );


            const awayScore =
                Math.max(
                    0,
                    Number(
                        document.getElementById(
                            "awayScore"
                        ).value
                    ) || 0
                );


            const bestPlayerId =
                document.getElementById(
                    "bestPlayer"
                ).value;


            match.homeScore =
                homeScore;


            match.awayScore =
                awayScore;


            match.finished = true;


            match.bestPlayerId =
                bestPlayerId;


            if (bestPlayerId) {

                const player =
                    getPlayer(
                        bestPlayerId
                    );

                if (player) {

                    player.bestPlayerCount =
                        Number(
                            player.bestPlayerCount || 0
                        ) + 1;

                }

            }


            saveData();

            closeModal("resultModal");

            renderAll();

            showToast(
                "✅ نتیجه مسابقه ثبت شد"
            );

        }
    );


/* =========================================================
   ثبت گل
========================================================= */

window.openGoalModal = function(matchId) {

    const match =
        getMatch(matchId);


    if (!match) {
        return;
    }


    if (!match.finished) {

        showToast(
            "⚠️ ابتدا نتیجه مسابقه را ثبت کنید"
        );

        return;
    }


    document.getElementById(
        "goalMatchId"
    ).value = matchId;


    const teamSelect =
        document.getElementById(
            "goalTeam"
        );


    teamSelect.innerHTML = `

        <option value="">
            انتخاب تیم
        </option>

        <option value="${match.homeTeamId}">
            ${escapeHTML(
                getTeamName(
                    match.homeTeamId
                )
            )}
        </option>

        <option value="${match.awayTeamId}">
            ${escapeHTML(
                getTeamName(
                    match.awayTeamId
                )
            )}
        >

    `;


    document.getElementById(
        "goalPlayer"
    ).innerHTML = `
        <option value="">
            ابتدا تیم را انتخاب کنید
        </option>
    `;


    document.getElementById(
        "assistPlayer"
    ).innerHTML = `
        <option value="">
            بدون پاس گل
        </option>
    `;


    openModal("goalModal");
};


document
    .getElementById("goalTeam")
    .addEventListener(
        "change",
        () => {

            const teamId =
                document.getElementById(
                    "goalTeam"
                ).value;


            const players =
                data.players.filter(
                    player =>
                        player.teamId ===
                        teamId
                );


            const goalPlayer =
                document.getElementById(
                    "goalPlayer"
                );


            const assistPlayer =
                document.getElementById(
                    "assistPlayer"
                );


            goalPlayer.innerHTML = `
                <option value="">
                    انتخاب گلزن
                </option>
            `;


            assistPlayer.innerHTML = `
                <option value="">
                    بدون پاس گل
                </option>
            `;


            players.forEach(player => {

                goalPlayer.innerHTML += `

                    <option value="${player.id}">
                        ${escapeHTML(
                            player.name
                        )}
                    </option>

                `;


                assistPlayer.innerHTML += `

                    <option value="${player.id}">
                        ${escapeHTML(
                            player.name
                        )}
                    </option>

                `;

            });

        }
    );


document
    .getElementById("goalForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const matchId =
                document.getElementById(
                    "goalMatchId"
                ).value;


            const teamId =
                document.getElementById(
                    "goalTeam"
                ).value;


            const scorerId =
                document.getElementById(
                    "goalPlayer"
                ).value;


            const assistId =
                document.getElementById(
                    "assistPlayer"
                ).value;


            const minute =
                Number(
                    document.getElementById(
                        "goalMinute"
                    ).value
                ) || 0;


            if (
                !matchId ||
                !teamId ||
                !scorerId
            ) {

                showToast(
                    "⚠️ تیم و گلزن را انتخاب کنید"
                );

                return;
            }


            const match =
                getMatch(matchId);


            if (!match) {
                return;
            }


            const teamIsValid =
                teamId === match.homeTeamId ||
                teamId === match.awayTeamId;


            if (!teamIsValid) {

                showToast(
                    "❌ این تیم در مسابقه حضور ندارد"
                );

                return;
            }


            data.goals.push({

                id: createId("goal"),

                matchId,

                teamId,

                scorerId,

                assistId,

                minute,

                createdAt:
                    new Date().toISOString()

            });


            const scorer =
                getPlayer(scorerId);


            if (scorer) {

                scorer.goals =
                    Number(
                        scorer.goals || 0
                    ) + 1;

            }


            if (
                assistId &&
                assistId !== scorerId
            ) {

                const assister =
                    getPlayer(
                        assistId
                    );

                if (assister) {

                    assister.assists =
                        Number(
                            assister.assists || 0
                        ) + 1;

                }

            }


            saveData();

            closeModal("goalModal");

            renderAll();

            showToast(
                "⚽ گل ثبت شد"
            );

        }
    );


/* =========================================================
   جدول رده‌بندی
========================================================= */

function calculateStandings() {

    const table =
        data.teams.map(team => ({

            teamId: team.id,

            played: 0,

            wins: 0,

            draws: 0,

            losses: 0,

            goalsFor: 0,

            goalsAgainst: 0,

            points: 0

        }));


    const findRow =
        teamId =>
            table.find(
                row =>
                    row.teamId === teamId
            );


    data.matches
        .filter(
            match =>
                match.finished
        )
        .forEach(match => {

            const home =
                findRow(
                    match.homeTeamId
                );


            const away =
                findRow(
                    match.awayTeamId
                );


            if (!home || !away) {
                return;
            }


            const homeScore =
                Number(
                    match.homeScore
                ) || 0;


            const awayScore =
                Number(
                    match.awayScore
                ) || 0;


            home.played++;
            away.played++;


            home.goalsFor +=
                homeScore;


            home.goalsAgainst +=
                awayScore;


            away.goalsFor +=
                awayScore;


            away.goalsAgainst +=
                homeScore;


            if (
                homeScore >
                awayScore
            ) {

                home.wins++;

                away.losses++;

                home.points += 3;

            } else if (
                homeScore <
                awayScore
            ) {

                away.wins++;

                home.losses++;

                away.points += 3;

            } else {

                home.draws++;

                away.draws++;

                home.points++;

                away.points++;

            }

        });


    table.forEach(row => {

        row.goalDifference =
            row.goalsFor -
            row.goalsAgainst;

    });


    table.sort(
        (a, b) => {

            if (
                b.points !==
                a.points
            ) {

                return (
                    b.points -
                    a.points
                );

            }


            if (
                b.goalDifference !==
                a.goalDifference
            ) {

                return (
                    b.goalDifference -
                    a.goalDifference
                );

            }


            return (
                b.goalsFor -
                a.goalsFor
            );

        }
    );


    return table;
}


function renderStandings() {

    const tbody =
        document.getElementById(
            "standingsBody"
        );


    if (!tbody) {
        return;
    }


    const standings =
        calculateStandings();


    if (standings.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8">
                    هنوز تیمی ثبت نشده است.
                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        standings
            .map(
                (row, index) => `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHTML(
                                getTeamName(
                                    row.teamId
                                )
                            )}
                        </td>

                        <td>
                            ${row.played}
                        </td>

                        <td>
                            ${row.wins}
                        </td>

                        <td>
                            ${row.draws}
                        </td>

                        <td>
                            ${row.losses}
                        </td>

                        <td>
                            ${row.goalsFor}
                            -
                            ${row.goalsAgainst}
                        </td>

                        <td>
                            <strong>
                                ${row.points}
                            </strong>
                        </td>

                    </tr>

                `
            )
            .join("");
}


/* =========================================================
   آمار
========================================================= */

function renderStats() {

    renderTopScorers();

    renderBestPlayers();

    renderGeneralStats();
}


function renderTopScorers() {

    const container =
        document.getElementById(
            "topScorers"
        );


    if (!container) {
        return;
    }


    const players =
        [...data.players]
            .sort(
                (a, b) =>
                    Number(b.goals || 0) -
                    Number(a.goals || 0)
            )
            .slice(0, 10);


    if (
        players.length === 0 ||
        players.every(
            player =>
                Number(player.goals || 0) === 0
        )
    ) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز گلی ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        players
            .map(
                (player, index) => `

                    <div class="player-card">

                        <div class="card-top">

                            <div>

                                <div class="card-title">
                                    ${index + 1}.
                                    ${escapeHTML(
                                        player.name
                                    )}
                                </div>

                                <div class="card-subtitle">
                                    ${escapeHTML(
                                        getTeamName(
                                            player.teamId
                                        )
                                    )}
                                </div>

                            </div>

                            <strong>
                                ⚽
                                ${formatNumber(
                                    player.goals
                                )}
                            </strong>

                        </div>

                    </div>

                `
            )
            .join("");
}


function renderBestPlayers() {

    const container =
        document.getElementById(
            "bestPlayers"
        );


    if (!container) {
        return;
    }


    const players =
        [...data.players]
            .sort(
                (a, b) =>
                    Number(
                        b.bestPlayerCount || 0
                    ) -
                    Number(
                        a.bestPlayerCount || 0
                    )
            )
            .slice(0, 10);


    if (
        players.length === 0 ||
        players.every(
            player =>
                Number(
                    player.bestPlayerCount || 0
                ) === 0
        )
    ) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز بازیکن برتر ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        players
            .map(
                (player, index) => `

                    <div class="player-card">

                        <div class="card-top">

                            <div class="card-title">
                                ${index + 1}.
                                ${escapeHTML(
                                    player.name
                                )}
                            </div>

                            <strong>
                                ⭐
                                ${formatNumber(
                                    player.bestPlayerCount
                                )}
                            </strong>

                        </div>

                    </div>

                `
            )
            .join("");
}


function renderGeneralStats() {

    const totalGoals =
        document.getElementById(
            "totalGoals"
        );


    const totalYellow =
        document.getElementById(
            "totalYellowCards"
        );


    const totalRed =
        document.getElementById(
            "totalRedCards"
        );


    const goals =
        data.players.reduce(
            (sum, player) =>
                sum +
                Number(
                    player.goals || 0
                ),
            0
        );


    const yellow =
        data.players.reduce(
            (sum, player) =>
                sum +
                Number(
                    player.yellowCards || 0
                ),
            0
        );


    const red =
        data.players.reduce(
            (sum, player) =>
                sum +
                Number(
                    player.redCards || 0
                ),
            0
        );


    if (totalGoals) {
        totalGoals.textContent =
            formatNumber(goals);
    }


    if (totalYellow) {
        totalYellow.textContent =
            formatNumber(yellow);
    }


    if (totalRed) {
        totalRed.textContent =
            formatNumber(red);
    }
}


/* =========================================================
   اخبار
========================================================= */

document
    .getElementById("addNewsButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("newsForm")
                .reset();

            openModal("newsModal");

        }
    );


document
    .getElementById("newsForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const title =
                document.getElementById(
                    "newsTitle"
                ).value.trim();


            const text =
                document.getElementById(
                    "newsText"
                ).value.trim();


            if (!title || !text) {

                showToast(
                    "⚠️ عنوان و متن اطلاعیه الزامی است"
                );

                return;
            }


            data.news.push({

                id: createId("news"),

                title,

                text,

                createdAt:
                    new Date().toISOString()

            });


            saveData();

            closeModal("newsModal");

            renderAll();

            showPage("news");

            showToast(
                "📢 اطلاعیه منتشر شد"
            );

        }
    );


function renderNews() {

    const container =
        document.getElementById(
            "newsList"
        );


    if (!container) {
        return;
    }


    const news =
        [...data.news]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );


    if (news.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز اطلاعیه‌ای ثبت نشده است.
            </div>
        `;

        return;
    }


    container.innerHTML =
        news
            .map(
                item => `

                    <div class="news-card">

                        <div class="card-top">

                            <div>

                                <div class="card-title">
                                    📢
                                    ${escapeHTML(
                                        item.title
                                    )}
                                </div>

                                <div class="card-subtitle">
                                    ${new Date(
                                        item.createdAt
                                    ).toLocaleDateString(
                                        "fa-IR"
                                    )}
                                </div>

                            </div>

                        </div>


                        <p style="margin-top:12px;">
                            ${escapeHTML(
                                item.text
                            )}
                        </p>


                        <div class="card-actions">

                            <button
                                class="small-button danger"
                                type="button"
                                onclick="deleteNews('${item.id}')">
                                🗑️ حذف
                            </button>

                        </div>

                    </div>

                `
            )
            .join("");
}


window.deleteNews = function(id) {

    if (
        !confirm(
            "آیا این اطلاعیه حذف شود؟"
        )
    ) {

        return;
    }


    data.news =
        data.news.filter(
            item =>
                item.id !== id
        );


    saveData();

    renderAll();

    showToast(
        "🗑️ اطلاعیه حذف شد"
    );
};


/* =========================================================
   تنظیمات نام مسابقات
========================================================= */

function renderCompetitionName() {

    const header =
        document.getElementById(
            "competitionName"
        );


    const input =
        document.getElementById(
            "competitionNameInput"
        );


    if (header) {

        header.textContent =
            data.competitionName ||
            "مدیریت مسابقات";

    }


    if (input) {

        input.value =
            data.competitionName ||
            "";

    }
}


document
    .getElementById(
        "saveCompetitionButton"
    )
    .addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "competitionNameInput"
                );


            const name =
                input.value.trim();


            if (!name) {

                showToast(
                    "⚠️ نام مسابقات را وارد کنید"
                );

                return;
            }


            data.competitionName =
                name;


            saveData();

            renderCompetitionName();

            showToast(
                "✅ نام مسابقات ذخیره شد"
            );

        }
    );


/* =========================================================
   خروجی اطلاعات
========================================================= */

document
    .getElementById("exportButton")
    .addEventListener(
        "click",
        () => {

            const json =
                JSON.stringify(
                    data,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;

            link.download =
                "tournament-backup.json";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );


            showToast(
                "📤 فایل پشتیبان ساخته شد"
            );

        }
    );


/* =========================================================
   ورود اطلاعات
========================================================= */

document
    .getElementById("importButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "importFile"
                )
                .click();

        }
    );


document
    .getElementById("importFile")
    .addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    try {

                        const imported =
                            JSON.parse(
                                reader.result
                            );


                        if (
                            !imported ||
                            typeof imported !==
                                "object"
                        ) {

                            throw new Error(
                                "فرمت نامعتبر"
                            );

                        }


                        data = {

                            ...cloneDefaultData(),

                            ...imported,

                            teams:
                                Array.isArray(
                                    imported.teams
                                )
                                    ? imported.teams
                                    : [],

                            players:
                                Array.isArray(
                                    imported.players
                                )
                                    ? imported.players
                                    : [],

                            matches:
                                Array.isArray(
                                    imported.matches
                                )
                                    ? imported.matches
                                    : [],

                            goals:
                                Array.isArray(
                                    imported.goals
                                )
                                    ? imported.goals
                                    : [],

                            news:
                                Array.isArray(
                                    imported.news
                                )
                                    ? imported.news
                                    : []

                        };


                        saveData();

                        renderAll();

                        showToast(
                            "✅ اطلاعات با موفقیت وارد شد"
                        );


                    } catch (error) {

                        console.error(
                            error
                        );

                        showToast(
                            "❌ فایل پشتیبان معتبر نیست"
                        );

                    }


                    event.target.value = "";

                };


            reader.readAsText(
                file
            );

        }
    );


/* =========================================================
   پاک کردن کامل اطلاعات
========================================================= */

document
    .getElementById(
        "resetAppButton"
    )
    .addEventListener(
        "click",
        () => {

            const answer =
                confirm(
                    "⚠️ تمام تیم‌ها، بازیکنان، مسابقات، نتایج و اخبار حذف می‌شوند. مطمئن هستید؟"
                );


            if (!answer) {
                return;
            }


            localStorage.removeItem(
                STORAGE_KEY
            );


            data =
                cloneDefaultData();


            renderAll();


            showToast(
                "🗑️ تمام اطلاعات پاک شد"
            );

        }
    );


/* =========================================================
   دکمه افزودن بازیکن
   از بخش تیم‌ها نیز قابل دسترسی است
========================================================= */

function addPlayerShortcut() {

    openPlayerModal();

}


/* =========================================================
   نمایش همه اطلاعات
========================================================= */

function renderAll() {

    renderCompetitionName();

    populateTeamSelects();

    renderDashboard();

    renderTeams();

    renderMatches(
        getCurrentMatchFilter()
    );

    renderPlayers();

    renderStandings();

    renderStats();

    renderNews();

    populateGoalPlayersIfNeeded();
}


function getCurrentMatchFilter() {

    const active =
        document.querySelector(
            "[data-match-filter].active"
        );


    return active
        ? active.dataset.matchFilter
        : "all";
}


function populateGoalPlayersIfNeeded() {

    const teamSelect =
        document.getElementById(
            "goalTeam"
        );


    if (!teamSelect) {
        return;
    }


    if (!teamSelect.value) {
        return;
    }


    teamSelect.dispatchEvent(
        new Event("change")
    );
}


/* =========================================================
   مقداردهی اولیه
========================================================= */

function initialize() {

    renderAll();

    showPage("dashboard");

}


initialize();


/* =========================================================
   ذخیره خودکار
========================================================= */

setInterval(
    () => {

        saveData();

    },
    15000
);


/* =========================================================
   جلوگیری از از دست رفتن تغییرات هنگام خروج
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        saveData();

    }
);