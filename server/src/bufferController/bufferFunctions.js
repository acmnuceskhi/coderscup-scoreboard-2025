const getHouse = (teamName) => {
    const match = teamName.match(/\(([^)]+)\)/);
    if (!match) return null;

    const houseName = match[1].trim().toLowerCase();
    switch (houseName.substring(0, 2)) {
        case 're':
            return 'Oogway';
        case 'ga':
            return 'Shen';
        case 'gu':
            return 'DragonWarrior';
        case 'cu':
            return 'TaiLung';
        default:
            return null;
    }
};

const updateBuffer = (data, batch, score) => {
    let count = 0;
    let tempScore = {
        'DragonWarrior': 0,
        'TaiLung': 0,
        'Oogway': 0,
        'Shen': 0
    };

    for (let team of data) {
        //temp condition for top 16 only
        if (count >= 16) break;
        count++

        // console.log(getHouse(team.teamName));
        const house = getHouse(team.teamName);
        // const house= teamHouses[batch][team.teamName];
        if (house)
            tempScore[house] += Number(team.score);
    }

    for (let key in tempScore) {
        score[key][batch] = tempScore[key];
    }
    return { data, score };
};

export default updateBuffer;