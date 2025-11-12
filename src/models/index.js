const { User, validate: validateUser } = require('./user/user.model');

const { Scan, validate: validateScan } = require('./scan/scan.model');
const { Vulnerability, validate: validateVulnerability } = require('./scan/vulnerability.model');
const { Report, validate: validateReport } = require('./scan/report.model');

const { Question, validate: validateQuestion } = require('./quiz/question.model');
const { Answer, validate: validateAnswer } = require('./quiz/answer.model');

const { AuthType, validate: validateAuthType } = require('./catalog/auth-type.model');
const { DbManager, validate: validateDbManager } = require('./catalog/db-manager.model');
const { VulnerabilityType, validate: validateVulnerabilityType } = require('./catalog/vulnerability-type.model');
const { SeverityLevel, validate: validateSeverityLevel } = require('./catalog/severity-level.model');

module.exports = {
    User,
    validateUser,
    Scan,
    validateScan,
    Vulnerability,
    validateVulnerability,
    Report,
    validateReport,
    Question,
    validateQuestion,
    Answer,
    validateAnswer,
    AuthType,
    validateAuthType,
    DbManager,
    validateDbManager,
    VulnerabilityType,
    validateVulnerabilityType,
    SeverityLevel,
    validateSeverityLevel
};

