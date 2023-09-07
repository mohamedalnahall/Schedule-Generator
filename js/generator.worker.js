let data;

function updateSchedule(schedule) {
    schedule.days = {};
    for (const course in schedule.branches) {
        setCourseBranch(schedule, course, schedule.branches[course]);
    }
}

function setCourseBranch(schedule, course, branch) {
    for (const timeSlot of data.courses[course][branch]) {
        let conflicted = false;
        if (!schedule.days[timeSlot[0]]) schedule.days[timeSlot[0]] = {};
        else {
            for (const otherCourse in schedule.days[timeSlot[0]]) {
                if (timeSlot[1] < schedule.days[timeSlot[0]][otherCourse].timeSlot[1] && timeSlot[2] > schedule.days[timeSlot[0]][otherCourse].timeSlot[0]) {
                    if (data.settings.conflictHandling === "treatDiff") {
                        if(timeSlot[2] > schedule.days[timeSlot[0]][otherCourse].timeSlot[1])
                            schedule.days[timeSlot[0]][otherCourse].conflicted = schedule.days[timeSlot[0]][otherCourse].timeSlot[1] - timeSlot[1];
                        else schedule.days[timeSlot[0]][otherCourse].conflicted = timeSlot[2] - schedule.days[timeSlot[0]][otherCourse].timeSlot[0];
                    }
                    else schedule.days[timeSlot[0]][otherCourse].conflicted = true;
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
            let branch = branches[Math.round(Math.random() * (branches.length - 1))];
            schedule.branches[course] = branch;
            setCourseBranch(schedule, course, branch);
        }
        schedules.push(schedule);
    }
    return schedules;
}

function courseCost(schedule, course) {
    //soft constrains
    // - unwanted days
    // - prefered houres
    // - prefered lectuers per day
    // - prefered max free time

    //hard constrains
    // - all courses should be schedules
    // - should not be conflicts
    let cost = 0;
    for (const courseTimeSlot of data.courses[course][schedule.branches[course]]) {
        if (schedule.days[courseTimeSlot[0]][course]) {

            // should not be conflicts
            if (schedule.days[courseTimeSlot[0]][course].conflicted) {
                if (data.settings.conflictHandling === "treatAsSame")
                    cost = Number.MAX_SAFE_INTEGER;
                else cost += schedule.days[courseTimeSlot[0]][course].conflicted * data.settings.conflictCost;
            }

            // unwanted days
            if (data.preferences.unwantedDays.days.has(courseTimeSlot[0]))
                cost = (cost < Number.MAX_SAFE_INTEGER - data.preferences.unwantedDays.weight)? cost + data.preferences.unwantedDays.weight : Number.MAX_SAFE_INTEGER;

            // prefered houres
            if (schedule.days[courseTimeSlot[0]][course].timeSlot[0] < data.preferences.bestTimes.from
                || schedule.days[courseTimeSlot[0]][course].timeSlot[1] > data.preferences.bestTimes.to)
                cost = (cost < Number.MAX_SAFE_INTEGER - data.preferences.bestTimes.weight) ? cost + data.preferences.bestTimes.weight : Number.MAX_SAFE_INTEGER;                              

            // prefered max free time
            for (const otherCourse in schedule.days[courseTimeSlot[0]]) {
                if (otherCourse === course) continue;
                if (schedule.days[courseTimeSlot[0]][otherCourse].timeSlot[1] < schedule.days[courseTimeSlot[0]][course].timeSlot[0]
                    && schedule.days[courseTimeSlot[0]][course].timeSlot[0] - schedule.days[courseTimeSlot[0]][otherCourse].timeSlot[1] > data.preferences.maxFreeTime.to) {
                    const costToAdd = (schedule.days[courseTimeSlot[0]][course].timeSlot[0] - schedule.days[courseTimeSlot[0]][otherCourse].timeSlot[1]) * data.preferences.maxFreeTime.weight;
                    cost = (cost < Number.MAX_SAFE_INTEGER - costToAdd)? cost + costToAdd : Number.MAX_SAFE_INTEGER;
                }
                else if (schedule.days[courseTimeSlot[0]][otherCourse].timeSlot[0] > schedule.days[courseTimeSlot[0]][course].timeSlot[1]
                    && schedule.days[courseTimeSlot[0]][otherCourse].timeSlot[0] - schedule.days[courseTimeSlot[0]][course].timeSlot[1] > data.preferences.maxFreeTime.to) {
                    const costToAdd = (schedule.days[courseTimeSlot[0]][otherCourse].timeSlot[0] - schedule.days[courseTimeSlot[0]][course].timeSlot[1])*data.preferences.maxFreeTime.weight;
                    cost = (cost < Number.MAX_SAFE_INTEGER - costToAdd)? cost + costToAdd : Number.MAX_SAFE_INTEGER;
                }
            }
        }
    }
    return cost;
}

function cost(schedule) {
    let cost = 0;
    for (const course in schedule.branches) 
        cost += courseCost(schedule, course);

    let days = 0;
    
    // prefered lectuers per day
    for (const day in schedule.days) {
        if (Object.keys(schedule.days[day]).length > 0) days++;
        if (Object.keys(schedule.days[day]).length < data.preferences.lectuersPerDay.from
            || Object.keys(schedule.days[day]).length > data.preferences.lectuersPerDay.to)
            cost = (cost < Number.MAX_SAFE_INTEGER - data.preferences.lectuersPerDay.weight) ? cost + data.preferences.lectuersPerDay.weight : Number.MAX_SAFE_INTEGER;
    }

    if (days > data.preferences.numOfDays.to) cost += (days - data.preferences.numOfDays.to) * data.preferences.numOfDays.weight;

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
    return igonre === -1? 0 : igonre;
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

function geneticGenerate(generations) {      
    let schedules = intilizeSchedules(data.settings.intilizedSchedules);
    for (let i = 0; i < generations; i++){
        let mututedSchedules = [];
        for (const schedule of schedules) {
            mututedSchedules.push(mutute(schedule, data.settings.mututeProbablity));
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

let schedule = { branches: {}, days: {}, fitness:0 };   
let bestSchedules = [{fitness:0}];

function recursiveSearch(depth) {
    if (depth === Object.keys(data.courses).length) {
        schedule.days = {};
        for (const course in schedule.branches) {            
            setCourseBranch(schedule, course, schedule.branches[course]);
        }
        schedule.fitness = fitness(schedule);
        if (schedule.fitness > bestSchedules[bestSchedules.length-1].fitness) {
            for (let i = 0; i < bestSchedules.length; i++) {
                if (schedule.fitness > bestSchedules[i].fitness) {
                    bestSchedules.splice(i, 0, structuredClone(schedule));
                    if (bestSchedules.length > data.settings.fullScanSchedulesNumber)
                        bestSchedules.pop();   
                    return;
                }
            }
        }
        return;
    }
    for (const branch in data.courses[Object.keys(data.courses)[depth]]) {
        schedule.branches[Object.keys(data.courses)[depth]] = branch;
        recursiveSearch(depth + 1);
    }
}

function fullScanGenerate() {
    recursiveSearch(0);    
    data.schedules = bestSchedules;
}

addEventListener("message", (event) => {
    data = event.data;
    if (data.settings.generatingMethod === "genetic") geneticGenerate(data.settings.generations);
    else fullScanGenerate();
    postMessage(data.schedules);
});