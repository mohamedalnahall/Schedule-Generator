function generate() {
    data.schedules = [];
    for (const course in data.courses) {
        let bestBranchs = {branchs:[""],score:Number.MIN_SAFE_INTEGER};
        for (const branch in data.courses[course]) {
            let score = 0;
            for (const timeSlot of data.courses[course][branch]) {
                if (data.preferences.unwantedDays.indexOf(timeSlot[0]) < 0) score+=2;
                if (timeSlot[1] >= data.preferences.bestTimes.from && timeSlot[2] <= data.preferences.bestTimes.to) score++;
            }
            if (score > bestBranchs.score) {
                bestBranchs.branchs = [branch];
                bestBranchs.score = score;
            } else if (score === bestBranchs.score) {
                bestBranchs.branchs.push(branch);
            }
        }
        refBranchLoop:for (const branch of bestBranchs.branchs) {
            let tempSchedule = {};
            tempSchedule[course] = branch;
            for (const otherCourse in data.courses) {
                if (otherCourse === course) continue;
                let otherBestBranch = { branch: "", score: Number.MIN_SAFE_INTEGER };
                for (const otherBranch in data.courses[otherCourse]) {
                    let score = 0;
                    for (const timeSlot of data.courses[otherCourse][otherBranch]) {
                        for (const refCourse in tempSchedule) {
                            for (const refTimeSlot of data.courses[refCourse][tempSchedule[refCourse]]) {
                                if (timeSlot[0] === refTimeSlot[0]) {
                                    if (timeSlot[1] <= refTimeSlot[1] && timeSlot[2] > refTimeSlot[1]
                                        || timeSlot[1] < refTimeSlot[2] && timeSlot[2] >= refTimeSlot[2]) {
                                        score -= 4;
                                    }
                                }
                            }
                        }
                        if (data.preferences.unwantedDays.indexOf(timeSlot[0]) < 0) score += 2;
                        if (timeSlot[1] >= data.preferences.bestTimes.from && timeSlot[2] <= data.preferences.bestTimes.to) score++;
                    }
                    if (score >= otherBestBranch.score) {
                        otherBestBranch.branch = otherBranch;
                        otherBestBranch.score = score;
                    }
                }
                tempSchedule[otherCourse] = otherBestBranch.branch;
            }

            if (data.schedules.length === 0) {
                data.schedules.push(tempSchedule);
                continue;
            }
            for (const schedule of data.schedules) {
                let equle = true;
                for (const course in schedule) {
                    equle = equle && tempSchedule[course] == schedule[course];
                    if (!equle) break;
                }
                if (equle) continue refBranchLoop;
            }
            data.schedules.push(tempSchedule);
        }
    }
}