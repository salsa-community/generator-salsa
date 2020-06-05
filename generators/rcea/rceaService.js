"use strict";
module.exports = class evaluatorService {

    static findMatch(project, evaluator) {
        let match = { matched: true, project: project, evaluator: evaluator };

        if (project.id_subdisciplina === evaluator.id_subdisciplina) {
            match.level = 4;

        } else if (project.id_disciplina === evaluator.id_disciplina) {
            match.level = 3;

        } else if (project.id_campo === evaluator.id_campo) {
            match.level = 2;

        } else if (project.id_area === evaluator.id_area) {
            match.level = 1;

        } else {
            match.level = 0;
            match.matched = false;
        }
        return match;
    }
};
