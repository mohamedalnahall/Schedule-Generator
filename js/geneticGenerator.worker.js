let data;

function updateSchedule(schedule) {
    schedule.days = {};
    for (const course in schedule.branches) {
        for (const timeSlot of data.courses[course][schedule.branches[course]]) {
            let conflicted = false;
            if (!schedule.days[timeSlot[0]]) schedule.days[timeSlot[0]] = {};
            else {
                for (const otherCourse in schedule.days[timeSlot[0]]) {
                    if (timeSlot[1] < schedule.days[timeSlot[0]][otherCourse].timeSlot[1] && timeSlot[2] > schedule.days[timeSlot[0]][otherCourse].timeSlot[0]) {
                        schedule.days[timeSlot[0]][otherCourse].conflicted = true;
                        conflicted = true;
                    }
                }
            }
            schedule.days[timeSlot[0]][course] ={"timeSlot": [timeSlot[1], timeSlot[2]], "conflicted": conflicted };
        }
    }
}

function setCourseBranch(schedule, course, branch) {
    schedule.branches[course] = branch;
    for (const timeSlot of data.courses[course][branch]) {
        let conflicted = false;
        if (!schedule.days[timeSlot[0]]) schedule.days[timeSlot[0]] = {};
        else {
            for (const otherCourse in schedule.days[timeSlot[0]]) {
                if (timeSlot[1] < schedule.days[timeSlot[0]][otherCourse].timeSlot[1] && timeSlot[2] > schedule.days[timeSlot[0]][otherCourse].timeSlot[0]) {
                    schedule.days[timeSlot[0]][otherCourse].conflicted = true;
                    conflicted = true;
                }
            }
        }
        schedule.days[timeSlot[0]][course] ={"timeSlot": [timeSlot[1], timeSlot[2]], "conflicted": conflicted };
    }
}

function intilizeSchedules(size) {
    let schedules = [];
    for (let i = 0; i < size; i++){
        let schedule = { branches: {}, days: {} };
        for (const course in data.courses) {
            let branches = Object.keys(data.courses[course]);
            setCourseBranch(schedule, course, branches[Math.round(Math.random() * (branches.length - 1))]);
        }
        schedules.push(schedule);
    }
    return schedules;
}

let minLecturesPerDay = 2;
let maxLecturesPerDay = 4;
let minConsicutiveLectures = 2;
let maxConsicutiveLectures = 4;
let maxFreeTime = 1.5;

function courseCost(schedule, course) {
    //soft constrains
    // - unwanted days
    // - prefered houres
    // - min lectures per day -> 2
    // - max lectures per day -> 4
    // - max free time -> 1.5

    //hard constrains
    // - all courses should be schedules
    // - should not be conflicts
    let cost = 0;
    for (const day in schedule.days) {
        if (schedule.days[day][course]) {
            if (schedule.days[day][course].conflicted) cost += 10000;
            if (data.preferences.unwantedDays.indexOf(day) != -1) cost += 1;
            if (schedule.days[day][course].timeSlot[0] < data.preferences.bestTimes.from
                || schedule.days[day][course].timeSlot[1] > data.preferences.bestTimes.to) cost += 1;
            if (Object.keys(schedule.days[day]).length < minLecturesPerDay || Object.keys(schedule.days[day]).length > maxLecturesPerDay) cost += 1000;
            for (const otherCourse in schedule.days[day]) {
                if (otherCourse === course) continue;
                if (schedule.days[day][otherCourse].timeSlot[1] < schedule.days[day][course].timeSlot[0]
                    && schedule.days[day][course].timeSlot[0] - schedule.days[day][otherCourse].timeSlot[1] > 1.5) {
                    cost += (schedule.days[day][course].timeSlot[0] - schedule.days[day][otherCourse].timeSlot[1])*3;
                }
                else if (schedule.days[day][otherCourse].timeSlot[0] > schedule.days[day][course].timeSlot[1]
                    && schedule.days[day][otherCourse].timeSlot[0] - schedule.days[day][course].timeSlot[1] > 1.5) {
                    cost += (schedule.days[day][otherCourse].timeSlot[0] - schedule.days[day][course].timeSlot[1])*3;
                }
            }
        }
    }
    return cost;
}

function cost(schedule) {
    // - min consicutive lectures -> 2
    // - max consicutive lectures -> 4
    let cost = 0;
    for (const course in schedule.branches) 
        cost += courseCost(schedule, course);
    return cost;
}

function fitness(schedule) {
    return 1 / (1 + cost(schedule));
}

function mutute(schedule, probablity) {
    let mututedSchedule = structuredClone(schedule);
    for (const course in mututedSchedule.branches) {
        if (courseCost(mututedSchedule, course) > 0) {
            if (Math.random() >= 1 - probablity) {
                let branches = Object.keys(data.courses[course]);
                mututedSchedule.branches[course] = branches[Math.round(Math.random() * (branches.length - 1))];
                updateSchedule(mututedSchedule);
            }
        }
    }
    return mututedSchedule;
}

function weightedRandom(schedules, weights, sumOfWeights, igonre=-1) {
    let rnd = Math.random() * sumOfWeights;
    for (let i = 0; i < schedules.length; i++) {
        if (i === igonre) continue;
        if (rnd < weights[i]) return i;
        rnd -= weights[i];
    }
}

function selectPair(schedules) {
    let weights = [];
    let sumOfWeights = 0;
    for (const schedule of schedules) {
        weights.push(fitness(schedule));
        sumOfWeights += weights[weights.length - 1];
    }
    let firstIndex = weightedRandom(schedules, weights, sumOfWeights);
    sumOfWeights -= weights[firstIndex];
    let secondIndex = weightedRandom(schedules, weights, sumOfWeights, firstIndex);
    return [structuredClone(schedules[firstIndex]), structuredClone(schedules[secondIndex])];
}

function crossOver(scheduleA, scheduleB) {
    let length = Object.keys(scheduleA.branches).length;
    let rnd = Math.round(Math.random() * (length - 1));
    let scheduleC = structuredClone(scheduleA), scheduleD = structuredClone(scheduleB);
    for (let i = rnd; i < length; i++){
        let course = Object.keys(scheduleA.branches)[i];
        scheduleC.branches[course] = scheduleB.branches[course];
        scheduleD.branches[course] = scheduleA.branches[course];
        updateSchedule(scheduleC);
        updateSchedule(scheduleD);
    }
    return [scheduleC, scheduleD];
}

function generate(generations) {      
    let schedules = intilizeSchedules(100000);
    let mututeProbablity = 0.5;
    for (let i = 0; i < generations; i++){
        let mututedSchedules = [];
        for (const schedule of schedules) {
            mututedSchedules.push(mutute(schedule, mututeProbablity));
        }
        schedules = selectPair(schedules);
        schedules = schedules.concat(selectPair(mututedSchedules));
        let newPairs = crossOver(schedules[0], schedules[1]);
        newPairs = newPairs.concat(crossOver(schedules[2], schedules[3]));
        newPairs = newPairs.concat(crossOver(schedules[0], schedules[3]));
        newPairs = newPairs.concat(crossOver(schedules[1], schedules[2]));
        newPairs = newPairs.concat(crossOver(schedules[0], schedules[2]));
        newPairs = newPairs.concat(crossOver(schedules[1], schedules[3]));
        schedules = schedules.concat(newPairs);
    }
    uniqueSchedulesLoop: for (let i = 0; i < schedules.length; i++) {
        for (let j = i - 1; j > -1; j--) {
            let exist = true;
            for (const course in schedules[i].branches) {
                exist = exist && (schedules[i].branches[course] === schedules[j].branches[course]);
                if (!exist) break;
            }
            if (exist) continue uniqueSchedulesLoop;
        }
        data.schedules.push(schedules[i]);
    }
}

addEventListener("message", (event) => {
    data = event.data;
    generate(5000);
    postMessage(data.schedules);
});